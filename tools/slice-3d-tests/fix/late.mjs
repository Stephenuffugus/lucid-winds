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

async function bootAt(w, h) {
  const browser = await puppeteer.launch(LAUNCH);
  const p = await browser.newPage();
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  const errs = [];
  p.on('pageerror', e => errs.push(e.message.split('\n')[0].slice(0, 140)));
  await p.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await new Promise(r => setTimeout(r, 3500));
  return { ctx: { close: () => browser.close() }, p, errs };
}
async function clickCentre(p, sel) {   // a real pointer at the control's centre (never el.click(): that proves nothing)
  const c = await p.evaluate(s => { const b = document.querySelector(s).getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; }, sel);
  await p.mouse.click(c.x, c.y);
}

/* SS08 with a late art.json: a deep link builds its first dive before the list arrives. Those lanterns have no painted
   sprite to give way to, so they keep their stand-in when the painting lands (the first cut of v6.4 hid it: a line of bare
   strings), and the burst strip is still asked for once the list is in. */
{
  const browser = await puppeteer.launch(LAUNCH), p = await browser.newPage();
  await p.setViewport({ width: 375, height: 667, deviceScaleFactor: 1 });
  const errs = []; p.on('pageerror', e => errs.push(e.message.split('\n')[0].slice(0, 140)));
  await p.setRequestInterception(true); let heldReq = null;
  p.on('request', q => { if (!heldReq && /\/art\/art\.json/.test(q.url())) { heldReq = q; return; } q.continue(); });
  await p.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 }); await new Promise(q => setTimeout(q, 3500));
  let a1, a2;
  try { a1 = await p.evaluate(() => { const S = window._S3; S.salt(77); S.newFF(26); const rp = S.verbs()[0];
    window._lanBalls = rp.grp.lan.map(l => l.grp.children.filter(c => c.isMesh && c.geometry.type === 'SphereGeometry')[0]);
    return { json: S.art().json, sprites: rp.grp.lan.filter(l => l.grp.children.some(c => c.isSprite)).length, shown: window._lanBalls.map(b => !!b && b.material.visible) }; }); } catch (e) { a1 = { error: String(e).slice(0, 200) }; }
  if (heldReq) heldReq.continue();
  try { a2 = await p.evaluate(async () => { const t0 = performance.now(), has = f => performance.getEntriesByType('resource').some(e => e.name.indexOf(f) >= 0);
    while (performance.now() - t0 < 20000 && !(window._S3.art().json && has('lantern_night/decor1.webp') && has('fx/lantern_burst.webp'))) await new Promise(q => setTimeout(q, 200));
    await new Promise(q => setTimeout(q, 1500));
    return { json: window._S3.art().json, decor: has('lantern_night/decor1.webp'), burstAsked: has('fx/lantern_burst.webp'), shown: window._lanBalls.map(b => !!b && b.material.visible) }; }); } catch (e) { a2 = { error: String(e).slice(0, 200) }; }
  ok('a lantern line built before art.json keeps its lanterns when the painting lands, and still asks for its burst', !!a1 && a1.json === false && a1.sprites === 0 && !!a2 && a2.json && a2.decor && a2.burstAsked && a2.shown.length === 5 && a2.shown.every(Boolean), JSON.stringify({ a1, a2 }));
  ok('no page errors with a late art.json', errs.length === 0, JSON.stringify(errs));
  await browser.close();
}

console.log('\n=== slice-3d: ' + pass + ' passed, ' + fail + ' failed ===');
process.exit(fail ? 1 : 0);
