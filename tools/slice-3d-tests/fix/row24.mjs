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

/* ---- 24. Part F4 (24 Oct, his call: "prices need to be so much higher ... it needs to be balanced"). A run pays
   0.5 x the square root of its final score (+30 for a clean numbered dive; Endless one per 8 m), so a good dive pays near one rate
   at every level (score/45 paid 1,000 to 3,500 a dive). Paid through the game's own finish, read off the balance. The
   cheapest knife needs real play: more than ten good numbered dives. Watched red with score/45 and depth/4 put back. */
console.log('\n[24] Part F4: Slivers by the square root of the score, prices to match');
{
  const { ctx, p, errs } = await boot();
  let r; try { r = await p.evaluate(() => {
    const S = window._S3, F = window._S3forge, out = {}; window._S3skiprender = true;
    const pay = (start, set) => { F.setSliv(0); start(); S.stepN(2, 16); const G = S.g(); set(G); G.done = true; G.doneT = 3; G.counted = true;
      if (G.failed) S.failLevel(); else S.finishLevel(); return { paid: F.sliv(), score: G.score, depth: G.depth || 0 }; };
    out.dive = pay(() => S.newFF(3), G => { G.score = 40000; G.chips = 0; G.failed = false; });
    out.big = pay(() => S.newFF(25), G => { G.score = 160000; G.chips = 2; G.failed = false; });
    out.fail = pay(() => S.newFF(3), G => { G.score = 100; G.failed = true; });
    out.journey = pay(() => S.newGame(1), G => { G.score = 2500; G.chips = 0; G.failed = false; G.mult = 2; G.stuckY = 6; });
    out.endless = pay(() => S.newEndless(), G => { G.depth = 1600; G.score = 10000; G.failed = true; });
    const cat = S.catalog(); out.cheapest = Math.min(...Object.keys(cat).map(k => cat[k].price).filter(v => v > 0));
    window._S3skiprender = false; return out;
  }); } catch (e) { r = { error: String(e).slice(0, 200) }; }
  const sq = sc => Math.round(Math.sqrt(sc) * 0.5);
  ok('a clean numbered dive pays the square root of its final score (its clean bonus already in) and 30 more; one of 160,000 with chips pays 200', !!r.dive && r.dive.score > 40000 && r.dive.paid === sq(r.dive.score) + 30 && !!r.big && r.big.paid === 200, JSON.stringify([r.dive, r.big]));
  ok('a failed dive still pays its floor of 6; a clean Journey level of 2,500 pays 55', !!r.fail && r.fail.paid === 6 && !!r.journey && r.journey.paid === 55, JSON.stringify([r.fail, r.journey]));
  ok('Endless pays the square root of its score and one per 8 m', !!r.endless && r.endless.paid === sq(r.endless.score) + Math.round(r.endless.depth / 8) && r.endless.paid < 400, JSON.stringify(r.endless));
  ok('the cheapest knife costs more than ten good numbered dives', !!r.dive && r.cheapest > 10 * r.dive.paid, JSON.stringify({ cheapest: r.cheapest, dive: r.dive && r.dive.paid }));
  ok('no page errors through Part F4', errs.length === 0, JSON.stringify(errs));
  await ctx.close();
}

console.log('\n=== slice-3d: ' + pass + ' passed, ' + fail + ' failed ===');
process.exit(fail ? 1 : 0);
