/* SUPER SLICE 3D — headless assertion suite (2026-08-16 audit)
 *
 * Run:  node satellites/slice-3d/audit-check.mjs [baseUrl]
 *       default base is http://localhost:8777 — serve the REPO ROOT, not this
 *       folder, or /arcade-exit.js and /feedback.js 404 and the exit checks
 *       fail for the wrong reason.
 *
 * ⛔ NEVER wait on networkidle here. This page streams a 600KB three.js and keeps
 *    a rAF loop running forever, so networkidle never fires and a probe built on
 *    it reports a perfectly healthy page as dead. domcontentloaded + settle.
 *
 * ⛔ Every assertion below was watched FAIL on purpose before it was trusted. A
 *    probe you have not seen go red is decoration. The first draft of the play
 *    check broke its stepping loop the moment G.done flipped, which is 2.4s before
 *    finishLevel() fires, and confidently reported "the end screen never shows".
 */
import {createRequire} from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js');
const puppeteer = require('puppeteer');

const BASE = process.argv[2] || 'http://localhost:8777';
const URL = BASE + (process.env.PAGE || '/satellites/slice-3d/') + '?dev=1';
let pass = 0, fail = 0;
const ok = (n, c, d) => { if (c) { pass++; console.log('  ok   ' + n); } else { fail++; console.log('  FAIL ' + n + (d ? '  -> ' + d : '')); } };

/* ⛔ ONE BROWSER PER CASE, not one browser with twenty contexts.
   This page builds a real WebGL context and pulls in 600KB of three.js on every
   boot. Reusing a single browser across ~20 of those on a 2-core box exhausts it:
   the run got through the whole corrupt-save phase and then died on a 30s
   NAVIGATION timeout — which looks exactly like "the game stopped loading" and is
   nothing of the kind. Launch, use, close. Slower, and it actually finishes.
   Navigation timeout is raised to 60s for the same reason: a slow box is not a
   broken page. */
const LAUNCH = {
  headless: 'new', protocolTimeout: 300000,
  args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage']
};
async function boot(poison) {
  const browser = await puppeteer.launch(LAUNCH);
  const p = await browser.newPage();
  await p.setViewport({ width: 375, height: 667, deviceScaleFactor: 1 });
  const errs = [];
  p.on('pageerror', e => errs.push(e.message.split('\n')[0].slice(0, 140)));
  if (poison) await p.evaluateOnNewDocument(poison);
  await p.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await new Promise(r => setTimeout(r, 3500));
  return { ctx: { close: () => browser.close() }, p, errs };
}

/* ---- 1. corrupt save must never brick the game ------------------------------
   Any of these used to kill the entire main IIFE at boot (strict mode refuses to
   set a property on a primitive), leaving a black stage with no way out. */
console.log('\n[1] corrupt save survives boot and still plays');
const POISON = [
  ['s3d_prog', '5'], ['s3d_prog', '"hi"'], ['s3d_prog', 'true'], ['s3d_prog', '[]'],
  ['s3d_prog', '{"level":"x","best":null}'], ['s3d_prog', '{"best":7}'],
  ['s3d_prog', '{"level":-4,"climbLevel":0}'],
  ['s3d_skins', '5'], ['s3d_skins', '"x"'], ['s3d_skins', '{"owned":"classic"}'],
  ['s3d_skins', '{"owned":{},"equip":"nope"}'], ['s3d_skins', '{"owned":["classic"],"equip":"ghost"}'],
  ['s3d_slivers', '"abc"'], ['s3d_slivers', '-99'],
  /* Part E1: the settled run list (SS27) must be an array of short strings or nothing */
  ['s3d_prog', '{"settled":"abc"}'], ['s3d_prog', '{"settled":[1,null,{},["x"],"' + 'x'.repeat(60) + '"]}'],
  ['s3d_prog', '{"settled":null}'], ['s3d_prog', '{"settled":{"length":2}}'],
  /* Part E2: the finds (s3d_dex) */
  ['s3d_dex', '5'], ['s3d_dex', '[1,2]'], ['s3d_dex', '{"mossy_canyon":"yes","nowhere":1,"glowcave":{}}'],
  /* Part E3: the Daily (s3d_daily) */
  ['s3d_daily', '5'], ['s3d_daily', '{"day":5}'], ['s3d_daily', '{"day":"x","gen":1,"used":"yes","done":0,"score":-3}'], ['s3d_dex', '{"hasOwnProperty":1}'],
  /* the reviews: a string dex (the boot filter cannot delete from it), and a record for TODAY with a null score */
  ['s3d_dex', '"abc"'], ['s3d_daily', JSON.stringify({ day: new Date().toISOString().slice(0, 10), gen: 1, used: true, done: false, score: null })]
];
for (const [k, v] of POISON) {
  const { ctx, p, errs } = await boot(`(()=>{try{localStorage.setItem(${JSON.stringify(k)},${JSON.stringify(v)});}catch(e){}})()`);
  const r = await p.evaluate(() => {
    if (!window._S3) return { boot: false };
    const out = { boot: true };
    try {
      const dx = window._S3.dex(); out.dexEmpty = Object.prototype.toString.call(dx) === '[object Object]' && Object.keys(dx).length === 0;
      window._S3.newGame(1); out.started = !!window._S3.state();
      window._S3forge.renderForge(); out.cards = document.getElementById('forge-grid').children.length;
      const pr = window._S3.prog();
      out.progSane = pr.level > 0 && pr.ffLevel > 0 && pr.climbLevel > 0 && pr.best && typeof pr.best === 'object'
        && Array.isArray(pr.settled) && pr.settled.every(x => typeof x === 'string' && x.length < 40);
      const sk = window._S3.skins();
      out.skinSane = Array.isArray(sk.owned) && sk.owned.indexOf('classic') >= 0 && !!window._S3.catalog()[sk.equip];
      out.slivSane = window._S3forge.sliv() >= 0;
      window._S3.showDaily(); const dl = window._S3.dly();   /* s3d_daily is read when the card opens, never at boot */
      out.dailySane = document.getElementById('s-daily').classList.contains('on') && dl.day === new Date().toISOString().slice(0, 10) && dl.used === false && dl.done === false && dl.score === 0;
    } catch (e) { out.threw = e.message.slice(0, 90); }
    return out;
  });
  ok(`${k}=${v}`, r.boot && r.started && r.cards === 24 && r.progSane && r.skinSane && r.slivSane && !r.threw && !errs.length,
    JSON.stringify(r) + (errs.length ? ' err:' + errs[0] : ''));
  if (k === 's3d_dex') ok(`${k}=${v} leaves the finds an empty set`, r.dexEmpty === true, JSON.stringify(r));
  if (k === 's3d_daily') ok(`${k}=${v} opens the Daily card on a fresh record for today`, r.dailySane === true && !r.threw && !errs.length, JSON.stringify(r) + (errs.length ? ' err:' + errs[0] : ''));
  await ctx.close();
}

console.log('\n=== slice-3d: ' + pass + ' passed, ' + fail + ' failed ===');
process.exit(fail ? 1 : 0);
