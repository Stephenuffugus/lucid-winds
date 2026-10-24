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

/* ---- 22. Part F2 (24 Oct, Jessie: "the handles go through the ground"): the ground and a stump's top meet only the
   knife's middle, so a steep landing drew the handle up to 1.7 u into the grass. The DRAWN knife on the ground modes never
   dips below the surface under it (the drawing only: kpose reads the knife as drawn). Journey 1, 3 and 6 and a climb, a tap
   whenever grounded every 14 frames, every frame checked; the lift must have been needed (a run that never lands proves
   nothing) and the drawing must sit on the stepped knife whenever no lift is needed. Watched red with the lift taken out. */
console.log('\n[22] Part F2: the drawn knife never sinks into the ground');
{
  const { ctx, p, errs } = await boot();
  let r; try { r = await p.evaluate(() => {
    const S = window._S3, out = {};
    for (const [kind, lvl] of [['j', 1], ['j', 3], ['j', 6], ['c', 1]]) {
      S.salt(31); if (kind === 'j') S.newGame(lvl); else S.newClimb(lvl);
      let worst = 9, maxLift = 0, off = 0, frames = 0, blocks = 0;
      for (let f = 0; f < 900; f++) { const G = S.g(); if (!G || G.done) break; if (G.grounded && f % 14 === 3) S.tap(1); S.stepN(1, 16);
        const k = S.kpose(); if (k.surf == null) continue; frames++; const sn = Math.sin(k.rz), y0 = k.y - k.lift;
        /* the surface worked out here from the level's own blocks, never read back from the page (a wrong surface in the
           page agreed with itself and the check could not fail) */
        let su = 0; for (const b of S.world().blocks) if (!b.gone && k.x > b.x - 0.5 && k.x < b.x + b.w + 0.5 && b.y + b.h <= y0 + 0.4 && b.y + b.h > su) su = b.y + b.h;
        const low = k.y + Math.min(k.hi * sn, -k.lo * sn) - k.hh * Math.abs(Math.cos(k.rz)) - su;
        worst = Math.min(worst, low); maxLift = Math.max(maxLift, k.lift); if (su > 0) blocks++;
        if (k.lift === 0 && Math.abs(k.y - S.g().y) > 0.6) off++; }
      out[kind + lvl] = { frames, worst: +worst.toFixed(3), maxLift: +maxLift.toFixed(2), blocks, off };
    }
    S.salt(null); return out;
  }); } catch (e) { r = { error: String(e).slice(0, 200) }; }
  const v = Object.values(r || {});
  ok('the drawn knife never dips below the ground or a stump top under it (Journey 1, 3, 6, a climb)', v.length === 4 && v.every(x => x.frames > 200 && x.worst >= -0.01) && v.some(x => x.blocks > 20), JSON.stringify(r));
  ok('a landing needed the lift (the knife really landed steep)', v.length === 4 && v.filter(x => x.maxLift > 0.5).length >= 3, JSON.stringify(r));
  ok('with no lift needed the knife is drawn on its stepped pose', v.length === 4 && v.every(x => x.off === 0), JSON.stringify(r));
  ok('no page errors through Part F2', errs.length === 0, JSON.stringify(errs));
  await ctx.close();
}

console.log('\n=== slice-3d: ' + pass + ' passed, ' + fail + ' failed ===');
process.exit(fail ? 1 : 0);
