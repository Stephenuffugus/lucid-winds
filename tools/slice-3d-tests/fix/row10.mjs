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

/* ---- 10. SS21: Endless has no floor. 3000 steps (25 s) of a straight dive never end it, it crosses a world band, and
   the shaft stays a ring of at most four live chunks; 6 km down there is still no floor. The scene itself stays bounded:
   the descent to 6 km goes 100 m at a time so every chunk is built and let go, and the scene (less the moment's sparks,
   pieces and rings) must stay near what it was with the first three chunks live. Watched red with endlessDrop's
   scene.remove taken out. */
console.log('\n[10] Part B: Endless has no floor and keeps a bounded ring');
{
  const { ctx, p } = await boot();
  let r; try { r = await p.evaluate(() => {
    /* since 24 Oct the chunks deepen (row [10b]); a straight blade down dive still meets no floor and no wall */
    const S = window._S3; S.salt(99); S.newEndless(); const G = S.g();
    const base = S.endless().kids;   // chunks 0 to 2 live, none let go yet
    let maxLive = 0, maxKids = 0;
    for (let i = 0; i < 3000; i++) {
      G.x = 0; G.vx = 0; G.w = 0; G.ang = Math.PI / 2; S.hold(0); S.stepN(1, 1000 / 120);
      const e = S.endless(); if (e) { maxLive = Math.max(maxLive, e.live.length); maxKids = Math.max(maxKids, e.sceneKids); }
      if (S.g().done) break;
    }
    const out = { depth: Math.round(S.g().depth), done: !!S.g().done, mile: S.endless() && S.endless().mile, maxLive, maxKids };
    for (let y = G.y - 100; y > -6000; y -= 100) { G.y = y; G.x = 0; G.vx = 0; G.w = 0; G.ang = Math.PI / 2; S.hold(0); S.stepN(1, 1000 / 120); }
    G.y = -6000; for (let i = 0; i < 40; i++) { G.x = 0; G.vx = 0; G.w = 0; G.ang = Math.PI / 2; S.hold(0); S.stepN(1, 1000 / 120); }
    out.far = S.endless(); out.farDone = !!S.g().done; out.base = base; S.salt(null); return out;
  }); } catch (e) { r = { error: String(e).slice(0, 160) }; }
  ok('Endless runs 3000 steps without ending and passes a world band', !r.done && r.depth > 300, JSON.stringify(r));
  ok('Endless marks every 100 m', r.mile === Math.floor(r.depth / 100), JSON.stringify({ depth: r.depth, mile: r.mile }));
  ok('Endless keeps at most four chunks live', r.maxLive <= 4 && !!r.far && r.far.live.length <= 4, JSON.stringify({ maxLive: r.maxLive, far: r.far }));
  ok('Endless has no floor 6 km down', !r.farDone && !!r.far && r.far.k >= 59, JSON.stringify(r.far));
  ok('Endless lets every dropped chunk leave the scene', !!r.far && r.base > 0 && r.far.kids <= 1.6 * r.base,
    JSON.stringify({ base: r.base, far: r.far && r.far.kids }));
  await ctx.close();
}

/* ---- 10b. 24 Oct: Endless gets harder the deeper you go (Jessie went forever: every chunk had level 1's bag and the fall
   stopped speeding up at 30). Chunk k builds at level k+1's bag up to level 7 at 600 m: the first chunk has no crystal, wasp or
   thorn; past 600 m every chunk's bag takes more of them (one each, again every 400 m, four each by 1800 m), so 2000 to 2400 m
   holds more of them than 600 to 1000 m; the level's own planks and bumpers come by 600 m too. The fall keeps speeding up past 900 m, measured on the knife itself (a
   step from far too fast, the hazards cleared so nothing but the cap touches it): 29.8 at 900 m as before, over 42 at 2500 m, 60 by 5 km
   and never past it. Seeds 99, 7 and 31. */
console.log('\n[10b] Endless ramps: harder chunks, a fall that keeps speeding up');
{
  const { ctx, p } = await boot();
  let r; try { r = await p.evaluate(() => {
    const S = window._S3, out = { seeds: [] }, L = ['crystals', 'wasps', 'thorns'];
    for (const seed of [99, 7, 31]) {
      S.salt(seed); S.newEndless(); const G = S.g(), W = G.world, n = {};
      for (let k = 0; k <= 23; k++) {
        S.endRing(k);
        for (const nm of L.concat(['planks', 'pads'])) for (const e of W[nm]) { const key = nm + e.ck; n[key] = n[key] || {}; n[key][e.x + ',' + e.y] = 1; }
      }
      const c = (nm, k0, k1) => { let t = 0; for (let k = k0; k <= k1; k++) t += Object.keys(n[nm + k] || {}).length; return t; };
      const term = {};
      for (const d of [0, 900, 2500, 5000, 9000]) {
        G.y = 4 - d; G.depth = d; G.x = 0; G.vx = 0; G.w = 0; G.ang = Math.PI / 2; S.hold(0); S.stepN(1, 1000 / 120);
        for (const nm of ['blocks', 'items', 'crystals', 'pads', 'slabs', 'wasps', 'planks', 'thorns', 'verbs']) if (W[nm]) W[nm].length = 0;
        G.done = false; G.y = 4 - d; G.depth = d; G.x = 0; G.vx = 0; G.vy = -500; G.w = 0; G.ang = Math.PI / 2; S.stepN(1, 1000 / 120);
        term[d] = Math.round(-G.vy * 10) / 10;
      }
      const hz = (k0, k1) => c('crystals', k0, k1) + c('wasps', k0, k1) + c('thorns', k0, k1);
      out.seeds.push({ seed, first: hz(0, 0), mid: hz(6, 9), deep: hz(20, 23),
        kinds: [c('crystals', 6, 23), c('wasps', 6, 23), c('thorns', 6, 23)], lvlOwn: c('planks', 6, 9) + c('pads', 6, 9), lvlTop: c('planks', 0, 1) + c('pads', 0, 0), term });
    }
    S.salt(null); return out;
  }); } catch (e) { r = { error: String(e).slice(0, 160) }; }
  const sd = r.seeds || [];
  ok('Endless: the first chunk has no crystal, wasp or thorn', sd.length === 3 && sd.every(s => s.first === 0), JSON.stringify(r));
  ok('Endless: past 600 m crystals, wasps and thorns all come, and 2000 to 2400 m holds more of them than 600 to 1000 m', sd.length === 3 && sd.every(s => s.mid > 0 && s.deep > s.mid * 1.5 && s.kinds.every(n => n > 0)), JSON.stringify(sd.map(s => ({ mid: s.mid, deep: s.deep, kinds: s.kinds }))));
  ok("Endless: the level's own pieces come with depth (planks and bumpers, which the extra hazards never add)", sd.length === 3 && sd.every(s => s.lvlTop === 0 && s.lvlOwn > 0), JSON.stringify(sd.map(s => [s.lvlTop, s.lvlOwn])));
  ok('Endless: the fall is 19 at the top and 29.8 at 900 m, as it always was', sd.length === 3 && sd.every(s => Math.abs(s.term[0] - 19) < 0.05 && Math.abs(s.term[900] - 29.8) < 0.05), JSON.stringify(sd.map(s => s.term)));
  ok('Endless: the fall keeps speeding up past 900 m (over 42 at 2500 m)', sd.length === 3 && sd.every(s => s.term[2500] > 42 && s.term[5000] > s.term[2500]), JSON.stringify(sd.map(s => s.term)));
  ok('Endless: the fall never passes 60', sd.length === 3 && sd.every(s => Math.abs(s.term[5000] - 60) < 0.2 && Math.abs(s.term[9000] - 60) < 0.2), JSON.stringify(sd.map(s => s.term)));
  await ctx.close();
}

console.log('\n=== slice-3d: ' + pass + ' passed, ' + fail + ' failed ===');
process.exit(fail ? 1 : 0);
