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
console.log('\n[22] Part F2 + G1: the drawn knife never sinks into the ground, and rests on it');
{
  const { ctx, p, errs } = await boot();
  let r; try { await p.evaluate(() => {
    const S = window._S3; window._S3skiprender = true;   /* drawFrame still runs every frame; only the GPU draw is skipped */
    /* the knife's lowest DRAWN point, measured on the meshes it is drawn with (the painting, or the recipe while the
       painting is not in): world bounding boxes from three.js, nothing the page works out (Part G review: the page's KHH
       is the recipe box, taller than the painting, and a check reading it agreed with itself) */
    const drawnLow = () => { const P = S.knifeParts(), ms = (P.art ? [P.art] : []).concat(P.body.filter(m => m.visible)), K = ms[0].parent;
      K.updateMatrixWorld(true); let lo = Infinity; for (const m of ms) { const bb = new THREE.Box3().setFromObject(m); if (bb.min.y < lo) lo = bb.min.y; } return lo; };
    /* the surface you SEE under the knife: rays straight down onto every drawn mesh but the knife's own, at the painting's
       depth, a little either side of the middle (the grass lip stands 0.25 over the ground's collider, a crate's cap 0.15) */
    const visTop = () => { const P = S.knifeParts(), K = (P.art || P.body[0]).parent, own = new Set(); K.traverse(o => own.add(o));
      const rc = new THREE.Raycaster(), meshes = []; let top = -Infinity; S.scene3().updateMatrixWorld(true);
      S.scene3().traverseVisible(o => { if (o.isMesh && !own.has(o)) meshes.push(o); });   /* drawn meshes only (sprites need a camera) */
      for (let i = -2; i <= 2; i++) { rc.set(new THREE.Vector3(K.position.x + i * 0.6, K.position.y, 0.5), new THREE.Vector3(0, -1, 0));   /* from the knife's middle down */
        const h = rc.intersectObjects(meshes, false)[0]; if (h && h.point.y > top) top = h.point.y; }
      return top; };
    window.__g1 = { drawnLow, visTop };
  });
  const lands = await p.evaluate(() => {
    const S = window._S3, out = {}, { drawnLow } = window.__g1;
    for (const [kind, lvl] of [['j', 1], ['j', 3], ['j', 6], ['c', 1]]) {
      S.salt(31); if (kind === 'j') S.newGame(lvl); else S.newClimb(lvl);
      let worst = 9, maxLift = 0, off = 0, frames = 0, blocks = 0, air = 0, airSunk = 0, prev = null, upFall = 0;
      for (let f = 0; f < 900; f++) { const G = S.g(); if (!G || G.done) break; if (G.grounded && f % 14 === 3) S.tap(1); S.stepN(1, 16);
        const k = S.kpose(); if (k.surf == null) continue; frames++; const y0 = k.y - k.lift + k.sink;
        /* the surface worked out here from the level's own blocks, never read back from the page (a wrong surface in the
           page agreed with itself and the check could not fail) */
        let su = 0; for (const b of S.world().blocks) if (!b.gone && k.x > b.x - 0.5 && k.x < b.x + b.w + 0.5 && b.y + b.h <= y0 + 0.4 && b.y + b.h > su) su = b.y + b.h;
        const low = drawnLow() - su;
        worst = Math.min(worst, low); maxLift = Math.max(maxLift, k.lift); if (su > 0) blocks++;
        if (k.lift === 0 && Math.abs(k.y + k.sink - S.g().y) > 0.6) off++;
        const g = S.g(); air = (!g.grounded && g.vy > 0) ? air + 1 : 0; if (air > 8 && k.sink > 0.001) airSunk++;   /* rising after a take off */
        const falling = !g.grounded && g.vy <= 0 && !g.done && k.lift === 0; if (falling && prev && prev.falling) upFall = Math.max(upFall, k.y - prev.y); prev = { y: k.y, falling }; }
      out[kind + lvl] = { frames, worst: +worst.toFixed(3), maxLift: +maxLift.toFixed(2), blocks, off, airSunk, upFall: +upFall.toFixed(3) };
    }
    return out;
  });
  const restR = await p.evaluate(async () => {
    const S = window._S3, { drawnLow, visTop } = window.__g1;
    /* G1 (24 Oct): a knife at REST is drawn on its surface, the ground and a block top. The surface is worked out here from
       the level's blocks and the stepped pose, never read back from the page */
    const rest = [];
    /* three knives whose paintings sit very differently in their recipe boxes (the review's worst cases), each with its
       painting in */
    for (const [skin, kind, lvl] of [['classic', 'j', 1], ['classic', 'c', 1], ['classic', 'j', 3], ['classic', 'j', 6], ['tuningfork', 'j', 3], ['wallbreaker', 'j', 6]]) {
      if (S.skins().owned.indexOf(skin) < 0) S.skins().owned.push(skin); S.applySkin(skin);
      for (let w = 0; w < 100 && !S.knifeParts().art; w++) await new Promise(res => setTimeout(res, 100));
      S.salt(31); if (kind === 'j') S.newGame(lvl); else S.newClimb(lvl);
      const W = S.world(), spots = [{ x: S.g().x, top: 0 }];
      const st = W.blocks.find(b => !b.gone && !b.spring && !b.crumble && b.w >= 1.2 && b.y + b.h > 0.5 && b.x > 6 && b.x < W.wallX - 6);
      if (st) spots.push({ x: st.x + st.w / 2, top: st.y + st.h });
      for (const sp of spots) {
        let G = S.g(); G.x = sp.x; G.y = sp.top + 1.8; G.vx = 0; G.vy = 0; G.w = 0; G.ang = 0; G.px = G.x; G.py = G.y; G.pa = 0;
        for (let i = 0; i < 60; i++) S.stepN(1, 16);
        G = S.g(); const k = S.kpose(), vis = visTop();
        const low = drawnLow() - vis;
        rest.push({ at: skin + ' ' + kind + lvl, top: +sp.top.toFixed(2), vis: +vis.toFixed(3), gr: !!G.grounded, done: !!G.done, rz: +k.rz.toFixed(3), low: +low.toFixed(3), art: !!S.knifeParts().art });
      }
    }
    S.applySkin('classic'); return rest;
  });
  const tail = await p.evaluate(() => {
    const S = window._S3, { drawnLow, visTop } = window.__g1;
    /* the Part G review's cases. A fall from rest (a nudge off a block's edge) never draws the knife going UP; a top whose
       landing height does not round trip in floating point (its contact drops out every other step) holds the knife still */
    const falls = [], flick = [];
    for (const lvl of [1, 3, 6, 9, 12]) {
      S.salt(31); S.newGame(lvl); const W = S.world();
      /* a block with open air for 8 u past its right edge, so the nudge really drops the knife off it */
      const b = W.blocks.find(b => !b.gone && !b.spring && !b.crumble && b.w >= 1.2 && b.y + b.h > 1.5 && b.x > 6 && b.x < W.wallX - 14 &&
        !W.blocks.some(c => c !== b && c.x < b.x + b.w + 8 && c.x + c.w > b.x + b.w - 0.01 && c.y < b.y + b.h + 4));
      if (b) { let G = S.g(); G.x = b.x + b.w - 0.2; G.y = b.y + b.h + 1.8; G.vx = 0; G.vy = 0; G.w = 0; G.ang = 0; G.px = G.x; G.py = G.y; G.pa = 0;
        for (let i = 0; i < 40; i++) S.stepN(1, 16);
        G = S.g(); G.vx = 6; let prev = null, up = 0, fell = 0;
        for (let i = 0; i < 90 && !S.g().done; i++) { S.stepN(1, 16); const g = S.g(), k = S.kpose(), falling = !g.grounded && g.vy <= 0 && k.lift === 0;
          if (falling) fell++; if (falling && prev && prev.falling) up = Math.max(up, k.y - prev.y); prev = { y: k.y, falling }; }
        falls.push({ lvl, fell, up: +up.toFixed(3) }); }
      S.salt(31); S.newGame(lvl); const W2 = S.world();   /* a fresh run: the nudge above may have ended this one */
      const fb = W2.blocks.find(b => !b.gone && !b.spring && !b.crumble && b.w >= 1.2 && b.x > 6 && b.x < W2.wallX - 6 && ((b.y + b.h + 1.5) - 1.5) > b.y + b.h);   /* KR 1.5 */
      if (fb) { let G = S.g(); G.x = fb.x + fb.w / 2; G.y = fb.y + fb.h + 1.8; G.vx = 0; G.vy = 0; G.w = 0; G.ang = 0; G.px = G.x; G.py = G.y; G.pa = 0;
        for (let i = 0; i < 60; i++) S.stepN(1, 16);
        let lo = Infinity, hi = -Infinity; for (let i = 0; i < 40; i++) { S.stepN(1, 16 + (i % 3)); const y = drawnLow(); lo = Math.min(lo, y); hi = Math.max(hi, y); }
        flick.push({ lvl, top: +(fb.y + fb.h).toFixed(4), range: +(hi - lo).toFixed(3), low: +(drawnLow() - visTop()).toFixed(3), done: !!S.g().done }); }
    }
    /* never on Freefall */
    S.salt(31); S.newFF(1); let ffSink = 0; for (let i = 0; i < 150; i++) { S.hold(i % 40 < 12 ? 1 : 0); S.stepN(1, 16); ffSink = Math.max(ffSink, S.kpose().sink); } S.hold(0);
    S.salt(null); window._S3skiprender = false; return { ffSink, falls, flick };
  });
  r = { lands, rest: restR, ffSink: tail.ffSink, falls: tail.falls, flick: tail.flick }; } catch (e) { r = { error: String(e).slice(0, 200) }; }
  const rest = (r && r.rest) || [], ffSink = r ? r.ffSink : null, falls = (r && r.falls) || [], flick = (r && r.flick) || []; r = (r && r.lands) || r;
  const v = Object.values(r || {});
  ok('the drawn knife never dips below the ground or a stump top under it (Journey 1, 3, 6, a climb)', v.length === 4 && v.every(x => x.frames > 200 && x.worst >= -0.01) && v.some(x => x.blocks > 20), JSON.stringify(r));
  ok('a landing needed the lift (the knife really landed steep)', v.length === 4 && v.filter(x => x.maxLift > 0.5).length >= 3, JSON.stringify(r));
  ok('with no lift needed the knife is drawn on its stepped pose', v.length === 4 && v.every(x => x.off === 0), JSON.stringify(r));
  const restOk = rest.filter(x => x.gr && !x.done && x.art && Math.abs(Math.sin(x.rz)) < 0.02);
  ok('a knife at rest lies ON the surface you see (the grass lip, a block\'s top), within 0.06, for three paintings (G1; v7.2 drew Classic Chef 0.65 over the grass)',
    restOk.length >= 9 && restOk.filter(x => x.top > 0).length >= 3 && ['classic', 'tuningfork', 'wallbreaker'].every(k => restOk.some(x => x.at.indexOf(k) === 0)) && restOk.every(x => Math.abs(x.low) <= 0.06), JSON.stringify(rest));
  ok('the drawing is let go over the first metre of a take off, and never lowered on Freefall', v.length === 4 && v.every(x => x.airSunk === 0) && ffSink === 0, JSON.stringify({ air: v.map(x => x.airSunk), ffSink }));
  ok('a fall from rest (nudged off a block, and every fall while playing) never draws the knife going up (the review: 0.72)', falls.length >= 3 && falls.every(f => f.fell > 5 && f.up <= 0.01) && v.every(x => x.upFall <= 0.01), JSON.stringify({ falls, play: v.map(x => x.upFall) }));
  ok('on a top whose contact flickers every step the knife lies still on it (the review: 0.11 to 0.55 u of shake)', flick.length >= 1 && flick.every(f => !f.done && f.range <= 0.02 && Math.abs(f.low) <= 0.06), JSON.stringify(flick));
  ok('no page errors through Part F2', errs.length === 0, JSON.stringify(errs));
  await ctx.close();
}

console.log('\n=== slice-3d: ' + pass + ' passed, ' + fail + ' failed ===');
process.exit(fail ? 1 : 0);
