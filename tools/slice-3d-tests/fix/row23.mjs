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

/* ---- 23. Part F3 (24 Oct, his calls): the boss's lob forgives a steering thumb, the boss pays by how well you fought and
   apart from the landing's multiplier. A hold toward the boss on every lob of 0.5 s or 1.2 s (v6.8 missed every fight
   from 0.15 s) clears it; a knife that enters past the boss pays x3 for its one miss; the landing multiplies the dive's
   score but never the boss's pay (v6.8 paid 600 x10 on the bullseye the knife always dropped onto). Measured over 300
   fights in tools/slice-3d-tests/f3/steer.js. Watched red with the aim cap and the separate pay taken out. */
console.log('\n[23] Part F3: a forgiving lob, a graded boss pay outside the multiplier');
{
  const { ctx, p, errs } = await boot();
  let r; try { r = await p.evaluate(() => {
    const S = window._S3, D = 1000 / 120, out = {}; window._S3skiprender = true;
    const run = (x0, holdSteps) => { S.salt(77); S.newFF(5); const G = S.g(), B = S.boss(); G.x = x0; G.y = B.y + 20; G.vx = 0; G.vy = -19; G.w = 0; G.ang = Math.PI / 2;
      let lobN = -1, side = 0, pre = null;
      for (let n = 0; n < 9000 && !G.counted; n++) { const l0 = B.lobs; S.hold(lobN >= 0 && n >= lobN + 12 && n < lobN + 12 + holdSteps ? side : 0); if (!G.counted) pre = G.score; S.stepN(1, D);
        if (B.lobs > l0) { lobN = n; side = B.tx > G.x ? 1 : -1; } }
      S.hold(0); return { cleared: B.cleared, skipped: B.skipped, miss: B.miss || 0, pts: G.bossPts || 0, grade: G.bossGrade || 0, pre, final: G.score, mult: G.mult, failed: !!G.failed }; };
    out.h05 = run(0.3, 60); out.h12 = run(0.3, 144); out.past = run(7, 0); out.alone = run(0.3, 0);
    window._S3skiprender = false; S.salt(null); return out;
  }); } catch (e) { r = { error: String(e).slice(0, 200) }; }
  ok('a hold toward the boss of 0.5 s or 1.2 s on every lob still clears the fight', !!r.h05 && r.h05.cleared && !r.h05.skipped && !r.h05.failed && !!r.h12 && r.h12.cleared && !r.h12.skipped && !r.h12.failed, JSON.stringify([r.h05, r.h12]));
  ok('the boss pays by the misses: none x5 (3000); a knife that enters past it, one miss, x3 (1800)', !!r.alone && r.alone.miss === 0 && r.alone.pts === 3000 && !!r.past && r.past.cleared && r.past.miss === 1 && r.past.pts === 1800, JSON.stringify([r.alone, r.past]));
  ok("the landing multiplies the dive's score but never the boss's pay", [r.alone, r.past].every(o => !!o && o.mult > 1 && o.final === (o.pre - o.pts) * o.mult + o.pts), JSON.stringify([r.alone, r.past]));
  ok('no page errors through Part F3', errs.length === 0, JSON.stringify(errs));
  await ctx.close();
}

console.log('\n=== slice-3d: ' + pass + ' passed, ' + fail + ' failed ===');
process.exit(fail ? 1 : 0);
