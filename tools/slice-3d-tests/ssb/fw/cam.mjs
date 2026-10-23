// Behaviour checks for the Part B review fixes (camera on the drawn pose, freeze pose, short-arc angle, Journey crash framing).
// Serves a copy of the page with one test-only line that exposes camera/knife/rings; MUT adds more find/replace pairs.
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js');
const puppeteer = require('puppeteer');
const BASE = process.argv[2] || 'http://127.0.0.1:8777';
const URL = BASE + '/satellites/slice-3d/?dev=1';
const LAUNCH = { headless: 'new', protocolTimeout: 300000, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] };
let BODY = fs.readFileSync('/workspaces/lucid-winds/satellites/slice-3d/index.html', 'utf8');
const MUT = [['    span:function(){ return recipeSpan(knifeBody); } };', '    span:function(){ return recipeSpan(knifeBody); }, _cam:function(){ return { camera:camera, knife:knife, RINGS:RINGS, THREE:THREE }; } };']].concat(JSON.parse(process.env.MUT || '[]'));
for (const [f, r] of MUT) { if (BODY.split(f).length !== 2) { console.log('MUTATION NOT UNIQUE: ' + f.slice(0, 80)); process.exit(2); } BODY = BODY.replace(f, r); }
const browser = await puppeteer.launch(LAUNCH); const p = await browser.newPage();
await p.setRequestInterception(true);
p.on('request', q => { if (q.isNavigationRequest() && /\/satellites\/slice-3d\/(\?|$)/.test(q.url())) q.respond({ status: 200, contentType: 'text/html', body: BODY }); else q.continue(); });
p.on('pageerror', e => console.log('PAGEERROR', e.message.split('\n')[0]));
await p.setViewport({ width: 540, height: 960, deviceScaleFactor: 1 });
await p.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 }); await new Promise(r => setTimeout(r, 3500));
const r = await p.evaluate(() => {
  const S = window._S3, C = S._cam(), cam = C.camera, kn = C.knife, V = new C.THREE.Vector3();
  window._S3skiprender = true;
  function ndc(x, y, z) { cam.updateMatrixWorld(); V.set(x, y, z).project(cam); return { x: V.x, y: V.y }; }
  // frame times: hz, Chrome-like 0.1 ms coarsening with a little jitter (deterministic)
  function frames(hz, n, coarse) { let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647; const out = []; let t = 0, prev = 0;
    for (let i = 0; i < n; i++) { t += 1000 / hz; const q = coarse ? Math.round((t + (rnd() - 0.5) * 0.1) / coarse) * coarse : t; out.push(q - prev); prev = q; } return out; }
  // 1. a live Freefall dive: the knife's screen y wobble (second difference, stage px of 960)
  function wobble(hz, coarse) { S.salt(4242); S.newFF(1); const G = S.g(); const dts = frames(hz, 240, coarse); const ys = [];
    for (let i = 0; i < dts.length; i++) { G.x = 0; G.vx = 0; G.w = 0; G.ang = Math.PI / 2; S.hold(0); S.stepN(1, dts[i]); if (i > 60) ys.push(ndc(kn.position.x, kn.position.y, 0).y * 480); }
    let mx = 0, sum = 0; for (let i = 2; i < ys.length; i++) { const d2 = Math.abs(ys[i] - 2 * ys[i - 1] + ys[i - 2]); mx = Math.max(mx, d2); sum += d2; }
    return { max: +mx.toFixed(2), mean: +(sum / (ys.length - 2)).toFixed(2) }; }
  const out = { w60c: wobble(60, 0.1), w90: wobble(90, 0), w120c: wobble(120, 0.1), w144: wobble(144, 0) };
  // 2. the frame that ends a crash's hold draws the stuck pose (angle within 0.05 rad, x within 0.01)
  function freezeEnd(hz) { const res = []; for (let ph = 0; ph < 12; ph++) { S.salt(5); S.newFF(1); const G = S.g(); G.x = 6; G.y = -40; G.vx = 25; G.vy = 0; G.w = 0; G.ang = Math.PI;
      S.stepN(1, 1000 / 120 * (1 + ph / 12)); let n = 0; while (!G.failed && n++ < 400) S.stepN(1, 1000 / hz);
      let worst = 0; for (let i = 0; i < 60; i++) { S.stepN(1, 1000 / hz); const da = Math.abs(Math.atan2(Math.sin(kn.rotation.z - G.ang), Math.cos(kn.rotation.z - G.ang))); worst = Math.max(worst, da + Math.abs(kn.position.x - G.x)); }
      res.push(worst); } return +Math.max.apply(null, res).toFixed(3); }
  out.freeze60 = freezeEnd(60); out.freeze90 = freezeEnd(90); out.freeze120 = freezeEnd(120);
  // 3. a Journey wall stick at 90 Hz after a long spin: the drawn angle at every frame stays within one step's turn of the stepped pose
  function stickArc() { let worst = 0; for (let ph = 0; ph < 6; ph++) { S.salt(7); S.newGame(1); const G = S.g(); let n = 0, prevDrawn = null;
      while (!G.done && n++ < 6000) { if (n % 50 === 1) S.tap(1); S.stepN(1, 1000 / 90 + ph * 0.01); const d = Math.abs(Math.atan2(Math.sin(kn.rotation.z - G.ang), Math.cos(kn.rotation.z - G.ang))); worst = Math.max(worst, d); }
      } return { worst: +worst.toFixed(3) }; }
  out.stick90 = stickArc();
  // 4. a Journey crystal crash: the held frame shows the knife and the ring (NDC |x|,|y| < 1)
  function crystal() { let lvl = 0, W = null, cr = null; for (let L = 1; L <= 15 && !cr; L++) { S.newGame(L); W = S.world(); if (W.crystals && W.crystals.length) { lvl = L; cr = W.crystals[0]; } }
    if (!cr) return { none: true }; const G = S.g();
    for (let i = 0; i < 90; i++) { G.x = cr.x - 7; G.y = 0.6; G.vx = 0; G.vy = 0; G.w = 0; S.stepN(1, 1000 / 60); }   // the live camera settles a few units before it
    const pre = { done: !!G.done, x: +G.x.toFixed(2), y: +G.y.toFixed(2), cr: [cr.x, cr.y, cr.h], mode: G.mode, cw: !!G.climbWall };
    G.x = cr.x - 1.2; G.y = cr.y + 1.5; G.vx = 8; G.vy = 0; S.stepN(1, 1000 / 60);   // contact needs motion (speed > 4)
    pre.post = { done: !!G.done, failed: !!G.failed, x: +G.x.toFixed(2), y: +G.y.toFixed(2), fz: G.freezeT };
    const held = [], after = []; for (let i = 0; i < 40; i++) { const k = ndc(kn.position.x, kn.position.y, 0), RG = S._cam().RINGS, rg = RG[0] ? ndc(RG[0].mesh.position.x, RG[0].mesh.position.y, 1.5) : null;
      (G.freezeT > 0 ? held : after).push({ k: [+k.x.toFixed(2), +k.y.toFixed(2)], r: rg ? [+rg.x.toFixed(2), +rg.y.toFixed(2)] : null }); S.stepN(1, 1000 / 60); }
    return { lvl, pre, failed: !!G.failed, nHeld: held.length, held: held.slice(0, 2), nAfterRing: after.filter(a => a.r).length, after: after.filter(a => a.r).slice(-2) }; }
  out.crystal = crystal();
  S.salt(null); return out;
});
console.log(JSON.stringify(r, null, 1));
await browser.close();
