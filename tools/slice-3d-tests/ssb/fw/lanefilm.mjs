// node lanefilm.mjs <outdir> [side]   Part E1: films a handle down knife falling at 19 u/s into the lane between a stack moved
// to x 5.7*side (the furthest out a stack is placed) and the wall, the way a player meets it: the knife held above for 1.5 s
// so the chase camera has caught up, then let go, no input. A frame at every wood sound and slab cut, plus fixed beats,
// at 412x915 DPR 1. Prints the event log; frames go to <outdir>/lane_NN_<tag>.png
import { createRequire } from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js');
const puppeteer = require('puppeteer');
const [out, sideArg] = process.argv.slice(2); const side = +(sideArg || 1);
const b = await puppeteer.launch({ headless: 'new', protocolTimeout: 300000, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] });
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 200)));
await p.setViewport({ width: 412, height: 915, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
await p.evaluateOnNewDocument(() => { try { localStorage.setItem('sws_dev_ok', '1'); localStorage.setItem('lwfb_explained', '1'); } catch (e) {} });
await p.goto('http://127.0.0.1:8777/satellites/slice-3d/?dev=1', { waitUntil: 'domcontentloaded', timeout: 60000 });
await p.waitForFunction(() => window._S3 && window._S3.art && window._S3.art().json && document.readyState === 'complete', { timeout: 30000 });
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function settle() { const t0 = Date.now(); while (Date.now() - t0 < 20000) { const a = await p.evaluate(() => window._S3.art()); if (a.asked > 0 && a.loaded + a.failed >= a.asked) break; await sleep(400); } }
await p.evaluate(() => { window._S3.salt(77); window._S3.newFF(1); }); await settle();
await p.evaluate(() => { window._S3.salt(77); window._S3.newFF(1); }); await settle(); await sleep(500);
const at = await p.evaluate(side => { const S = window._S3, W = S.world(), G = S.g(), col = {};
  W.slabs.forEach(s => { const k = s.x.toFixed(3); (col[k] = col[k] || []).push(s); });
  let st = null; for (const k in col) { const a = col[k].sort((u, v) => v.y - u.y); if (a.length >= 7 && a.every((s, i) => i === 0 || Math.abs(a[i - 1].y - s.y - 1.32) < 1e-6)) { st = a; break; } }
  const X = side * 5.7; st.forEach(s => { s.x = X; if (s.mesh) s.mesh.position.x = X; if (s.gline) s.gline.position.x = X; });
  const lo = st[st.length - 1].y - 12, hi = st[0].y + 12, away = e => !(e.y > lo && e.y < hi);
  for (const n of ['items', 'crystals', 'pads', 'wasps', 'planks', 'thorns']) W[n] = (W[n] || []).filter(away);
  window._laneSt = st; const x = side * 8.3, y = st[0].y + 6;
  for (let i = 0; i < 180; i++) { G.x = x; G.y = y; G.vx = 0; G.vy = -19; G.w = 0; G.ang = -Math.PI / 2; S.hold(0); S.stepN(1, 1000 / 120); }
  G.x = x; G.y = y; const w0 = S.sfx.wood; window._woods = 0; S.sfx.wood = function () { window._woods++; return w0.apply(this, arguments); };
  return { n: st.length, top: st[0].y, bot: st[st.length - 1].y }; }, side);
let n = 0; const log = [];
async function shot(tag) { await p.screenshot({ path: `${out}/lane${side > 0 ? 'R' : 'L'}_${String(n++).padStart(2, '0')}_${tag}.png` }); }
await shot('approach');
for (let s = 0; s < 200; s++) {
  const ev = await p.evaluate(() => { const S = window._S3, G = S.g(), wd = window._woods, sl = G.slices; S.stepN(1, 1000 / 120);
    const e = []; if (window._woods > wd) e.push('wood' + window._woods); if (G.slices > sl) e.push('cut' + G.slices);
    return { e, x: +G.x.toFixed(3), y: +G.y.toFixed(2), done: G.done, failed: !!G.failed, below: G.y < window._laneSt[window._laneSt.length - 1].y - 4 }; });
  if (ev.e.length) { log.push(ev); await shot(ev.e.join('-')); } else if (s % 20 === 10) await shot('t' + s);
  if (ev.done || ev.below) { log.push({ end: ev }); await shot('past'); break; }
}
console.log(JSON.stringify({ at, log, errs }));
await b.close();
