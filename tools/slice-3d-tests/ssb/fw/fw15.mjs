import fs from 'node:fs';
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
const URL = BASE + '/satellites/slice-3d/?dev=1';
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
const MUT = JSON.parse(process.env.MUT || '[]');   // [[find, replace], ...] applied to the page as served
const SRC = fs.readFileSync('/workspaces/lucid-winds/satellites/slice-3d/index.html', 'utf8');
let BODY = SRC; for (const [f, r] of MUT) { if (BODY.split(f).length !== 2) { console.log('MUTATION NOT UNIQUE: ' + f); process.exit(2); } BODY = BODY.replace(f, r); }
async function intercept(p) {
  await p.setRequestInterception(true);
  p.on('request', q => { const u = q.url(); if (q.isNavigationRequest() && /\/satellites\/slice-3d\/(\?|$)/.test(u)) q.respond({ status: 200, contentType: 'text/html', body: BODY }); else q.continue(); });
}
async function boot() {
  const browser = await puppeteer.launch(LAUNCH); const p = await browser.newPage(); await intercept(p);
  await p.setViewport({ width: 540, height: 960, deviceScaleFactor: 1 });
  await p.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 }); await new Promise(r => setTimeout(r, 3500));
  return { ctx: { close: () => browser.close() }, p };
}
async function clickCentre(p, sel) { const c = await p.evaluate(s => { const b = document.querySelector(s).getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; }, sel); await p.mouse.click(c.x, c.y); }
/* ---- 15. The drawn frame (Part B review). The camera follows the knife as DRAWN, between steps, so in a steady dive the
   knife holds still on screen at 90 Hz and at a jittery 120 Hz (a camera on the stepped pose shook it 4.3 and 8.5 px a
   frame); the frame that ends a crash's hold draws the stuck pose (it flicked 2.3 rad back to the pose before the crash);
   a stick after a long spin is drawn the short way round (2.8 rad wrong for a frame); a Journey crash is framed where it
   happened (the held frame showed the empty course, knife at x -6.6). Each number is this row watched red with its fix
   taken out. Frame times are generated, Chrome-coarsened to 0.1 ms with a little seeded jitter. */
console.log('\n[15] Part B: the drawn frame holds together');
{
  const { ctx, p } = await boot();
  let r; try { r = await p.evaluate(() => {
    const S = window._S3; window._S3skiprender = true;
    const off = a => Math.abs(Math.atan2(Math.sin(a), Math.cos(a)));
    function frames(hz, n, coarse) { let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647; const out = []; let t = 0, prev = 0;
      for (let i = 0; i < n; i++) { t += 1000 / hz; const q = coarse ? Math.round((t + (rnd() - 0.5) * 0.1) / coarse) * coarse : t; out.push(q - prev); prev = q; } return out; }
    function wobble(hz, coarse) { S.salt(4242); S.newFF(1); const G = S.g(), dts = frames(hz, 240, coarse), ys = [];
      for (let i = 0; i < dts.length; i++) { G.x = 0; G.vx = 0; G.w = 0; G.ang = Math.PI / 2; S.hold(0); S.stepN(1, dts[i]); if (i > 60) ys.push(S.view().k[1] * 480); }
      let mx = 0; for (let i = 2; i < ys.length; i++) mx = Math.max(mx, Math.abs(ys[i] - 2 * ys[i - 1] + ys[i - 2])); return +mx.toFixed(2); }
    function freezeEnd(hz) { let worst = 0; for (let ph = 0; ph < 12; ph++) { S.salt(5); S.newFF(1); const G = S.g();
        G.x = 6; G.y = -40; G.vx = 25; G.vy = 0; G.w = 0; G.ang = Math.PI + 0.9;   // tilted blade first: the stick turns it 0.9 rad
        S.stepN(1, 1000 / 120 * (1 + ph / 12)); let n = 0; while (!G.failed && n++ < 400) { G.w = 0; S.stepN(1, 1000 / hz); }
        for (let i = 0; i < 60; i++) { S.stepN(1, 1000 / hz); const v = S.view(); worst = Math.max(worst, off(v.rz - G.ang) + Math.abs(v.kx - G.x) + Math.abs(v.ky - G.y)); } }
      return +worst.toFixed(3); }
    function stick90() { let worst = 0; for (let ph = 0; ph < 6; ph++) { S.newGame(1); const G = S.g(); let n = 0;
        while (!G.done && n++ < 6000) { if (n % 50 === 1) S.tap(1); S.stepN(1, 1000 / 90 + ph * 0.01); worst = Math.max(worst, off(S.view().rz - G.ang)); } } return +worst.toFixed(3); }
    function crystal() { let cr = null, lvl = 0; for (let L = 1; L <= 15 && !cr; L++) { S.newGame(L); const W = S.world(); if (W.crystals && W.crystals.length) { cr = W.crystals[0]; lvl = L; } }
      if (!cr) return { none: true }; const G = S.g();
      for (let i = 0; i < 90; i++) { G.x = cr.x - 7; G.y = 0.6; G.vx = 0; G.vy = 0; G.w = 0; S.stepN(1, 1000 / 60); }   // the live camera settles before it
      G.x = cr.x - 1.2; G.y = cr.y + 1.5; G.vx = 8; G.vy = 0; S.stepN(1, 1000 / 60);                       // contact needs motion
      const v = S.view(); return { lvl, failed: !!G.failed, held: G.freezeT > 0, k: v.k.map(x => +x.toFixed(2)), r: v.r && v.r.map(x => +x.toFixed(2)) }; }
    const out = { w90: wobble(90, 0), w120: wobble(120, 0.1), freeze120: freezeEnd(120), freeze90: freezeEnd(90), stick90: stick90(), crystal: crystal() };
    S.salt(null); window._S3skiprender = false; return out;
  }); } catch (e) { r = { error: String(e).slice(0, 160) }; }
  ok('a steady dive holds the knife still on screen at 90 and 120 Hz', r.w90 <= 0.5 && r.w120 <= 0.5, JSON.stringify({ w90: r.w90, w120: r.w120, error: r.error }));
  ok('the frame that ends a crash hold draws the stuck pose', r.freeze120 <= 0.1 && r.freeze90 <= 0.1, JSON.stringify({ f120: r.freeze120, f90: r.freeze90 }));
  ok('a stick after a long spin is drawn the short way round', r.stick90 <= 1.0, String(r.stick90));
  const c = r.crystal || {}, on = a => !!a && Math.abs(a[0]) < 1 && Math.abs(a[1]) < 1;
  ok('a Journey crash is framed where it happened (knife and ring on screen in the held frame)', c.failed && c.held && on(c.k) && on(c.r), JSON.stringify(c));
  await ctx.close();
}

console.log('\n=== fw: ' + pass + ' passed, ' + fail + ' failed ===');
