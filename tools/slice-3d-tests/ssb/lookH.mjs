// node tools/slice-3d-tests/ssb/lookH.mjs <outdir> [page]   Part H look: the player's camera, then the worst angles on purpose.
// Player shots are the game's own frame (412 x 915). The worst angles render the game's OWN scene with a second camera on
// an overlay canvas (no hook in the game). One browser, repo root served on 8777.
import { createRequire } from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js'); const puppeteer = require('puppeteer');
const [OUT, PAGE] = [process.argv[2], process.argv[3] || 'index.html'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await puppeteer.launch({ headless: 'new', protocolTimeout: 300000, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] });
const p = await b.newPage(); await p.setViewport({ width: 412, height: 915, deviceScaleFactor: 1 });
const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 140)));
await p.goto('http://127.0.0.1:8777/satellites/slice-3d/' + PAGE + '?dev=1', { waitUntil: 'domcontentloaded' });
await p.waitForFunction(() => window._S3 && window._S3.art && window._S3.art().json && document.readyState === 'complete', { timeout: 30000 });
const settle = async () => { for (let i = 0; i < 60; i++) { const a = await p.evaluate(() => window._S3.art()); if (a.asked > 0 && a.loaded + a.failed >= a.asked) break; await sleep(400); } };
const game = async (fn, arg) => { await p.evaluate(fn, arg); await settle(); await p.evaluate(fn, arg); await settle(); await sleep(300); };
const shot = async (name) => { await p.screenshot({ path: `${OUT}/${name}.png` }); console.log('shot', name); };
// a second camera over the game's own scene
const view = async (name, pos, at) => {
  await p.evaluate((pos, at) => {
    let R = window.__lookR; if (!R) { R = window.__lookR = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); R.setSize(412, 915); R.setPixelRatio(1);
      R.domElement.style.cssText = 'position:fixed;left:0;top:0;z-index:99999'; document.body.appendChild(R.domElement); }
    R.domElement.style.display = 'block';
    const cam = new THREE.PerspectiveCamera(50, 412 / 915, 0.1, 300); cam.position.set(pos[0], pos[1], pos[2]); cam.lookAt(at[0], at[1], at[2]);
    const sc = window._S3.scene3(); sc.updateMatrixWorld(true); R.render(sc, cam);
  }, pos, at);
  await shot(name);
  await p.evaluate(() => { if (window.__lookR) window.__lookR.domElement.style.display = 'none'; });
};
// ONLY=sc: just the stump and the shelf, on level LVL (crumbling shelves start at level 5)
if (process.env.ONLY === 'sc') {
  await game((l) => { window._S3.salt(31); window._S3.newGame(l); }, +(process.env.LVL || 6));
  const sp = await p.evaluate(() => { const W = window._S3.world(); const st = W.blocks.find((b) => Math.abs(b.w - 3.6) < 1e-6 && !b.spring && !b.crumble && b.x > 10), cr = W.blocks.find((b) => b.crumble); return { stump: st && { x: st.x, h: st.h }, crumble: cr && { x: cr.x, y: cr.y } }; });
  console.log('sc', JSON.stringify(sp));
  if (sp.stump) { await p.evaluate((x) => { const S = window._S3, G = S.g(); G.x = x; G.y = 2; G.vx = 0; G.vy = 0; G.w = 0; G.ang = 0; G.px = x; G.py = 2; G.pa = 0; for (let i = 0; i < 50; i++) S.stepN(1, 16); }, sp.stump.x - 6); await shot('h2b-mid-stump');
    await view('w6-stump-close', [sp.stump.x - 3, sp.stump.h + 3, 9], [sp.stump.x + 1.8, sp.stump.h * 0.6, 0]); }
  if (sp.crumble) await view('w4-shelf-about-to-crumble', [sp.crumble.x - 2, sp.crumble.y + 2.5, 9], [sp.crumble.x + 1.7, sp.crumble.y + 0.4, 0]);
  console.log('errors', JSON.stringify(errs)); await b.close(); process.exit(0);
}
// 1 Journey level 1 at the start, the player's camera
await game((l) => { window._S3.salt(31); window._S3.newGame(l); }, 1);
await p.evaluate(() => { const S = window._S3; for (let i = 0; i < 60; i++) S.stepN(1, 16); });
await shot('h1-journey-start');
// 2 mid course by a stump and a mushroom (level 3), the player's camera
await game((l) => { window._S3.salt(31); window._S3.newGame(l); }, 3);
const spots = await p.evaluate(() => { const W = window._S3.world(); const st = W.blocks.find((b) => Math.abs(b.w - 3.6) < 1e-6 && !b.spring && !b.crumble && b.x > 10), sh = W.blocks.find((b) => b.spring && b.x > 10), cr = W.blocks.find((b) => b.crumble);
  return { stump: st && st.x, shroom: sh && sh.x, crumble: cr && { x: cr.x, y: cr.y }, wallX: W.wallX, len: W.len }; });
console.log('spots', JSON.stringify(spots));
const placeAt = async (x, y) => p.evaluate((x, y) => { const S = window._S3, G = S.g(); G.x = x; G.y = y; G.vx = 0; G.vy = 0; G.w = 0; G.ang = 0; G.px = x; G.py = y; G.pa = 0; for (let i = 0; i < 50; i++) S.stepN(1, 16); }, x, y);
if (spots.shroom != null) { await placeAt(spots.shroom - 7, 2); await shot('h2-mid-mushroom'); }
if (spots.stump != null) { await placeAt(spots.stump - 6, 2); await shot('h2b-mid-stump'); }
// 3 the finish wall with the flag
await placeAt(spots.wallX - 9, 2); await shot('h3-finish-flag');
// worst angles, the same level
const x0 = (spots.stump || 40);
await view('w1-grass-height-along-counter', [x0 - 12, 0.7, 3], [x0 + 20, 0.3, 0]);
await view('w2-under-counter-front', [x0, -2.2, 16], [x0, -1.2, 7]);
await view('w3-back-row-fog-hills', [x0, 7, 14], [x0 + 6, 5, -28]);
if (spots.crumble) await view('w4-shelf-about-to-crumble', [spots.crumble.x - 2, spots.crumble.y + 2.5, 9], [spots.crumble.x + 1.7, spots.crumble.y + 0.4, 0]);
const br = await p.evaluate(() => { let o = null; window._S3.scene3().traverse((s) => { const t = s.isSprite && s.material.map; if (t && /j_branch/.test((t.userData && t.userData.rel) || '')) o = [s.position.x, s.position.y]; }); return o; });
if (br) await view('w5-branch-at-distance', [br[0] - 6, br[1] - 2, 26], [br[0], br[1], 0]);
else console.log('no branch in level 3');
// 4 Wall Climb's floor, the player's camera
await game((l) => { window._S3.salt(31); window._S3.newClimb(l); }, 1);
await p.evaluate(() => { const S = window._S3; for (let i = 0; i < 70; i++) { const g = S.state(); if (g && g.grounded && i % 10 === 0) S.tap(1); S.stepN(1, 16); } });
await shot('h4-climb-floor');
console.log('errors', JSON.stringify(errs));
await b.close();
