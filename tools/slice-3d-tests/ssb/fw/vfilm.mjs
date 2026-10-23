// node vfilm.mjs <outdir> <case>   cases: ice lantern loaf iceside
// Films a Part D verb the way a player meets it: the knife settled above it for 1.5 s (so the chase camera has caught up),
// then let go at its terminal 19 u/s, blade down, no input, nothing pinned. A frame at each event (crack, kick, shatter,
// cut, each burst) plus fixed beats, at 412x915 (DPR 1). Prints the event log; the frames go to <outdir>/<case>_NN_<tag>.png
import { createRequire } from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js');
const puppeteer = require('puppeteer');
const [out, kase] = process.argv.slice(2);
const b = await puppeteer.launch({ headless: 'new', protocolTimeout: 300000, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] });
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 200)));
await p.setViewport({ width: 412, height: 915, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
await p.evaluateOnNewDocument(() => { try { localStorage.setItem('sws_dev_ok', '1'); localStorage.setItem('lwfb_explained', '1'); } catch (e) {} });
await p.goto('http://127.0.0.1:8777/satellites/slice-3d/?dev=1', { waitUntil: 'domcontentloaded', timeout: 60000 });
await p.waitForFunction(() => window._S3 && window._S3.art && window._S3.art().json && document.readyState === 'complete', { timeout: 30000 });
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function settle() { const t0 = Date.now(); while (Date.now() - t0 < 20000) { const a = await p.evaluate(() => window._S3.art()); if (a.asked > 0 && a.loaded + a.failed >= a.asked) break; await sleep(400); } }
const LVL = { ice: 6, iceside: 6, lantern: 26, loaf: 11 }[kase];
await p.evaluate(l => { window._S3.salt(77); window._S3.newFF(l); }, LVL); await settle();
await p.evaluate(l => { window._S3.salt(77); window._S3.newFF(l); }, LVL); await settle(); await sleep(500);
// settle the camera above the verb
const at = await p.evaluate(k => { const S = window._S3, G = S.g(), v = S.verbs()[0];
  const x = k === 'lantern' ? 1.65 : (k === 'iceside' ? v.x + 2.4 : v.x), y = (k === 'lantern' ? v.y + 6 : (k === 'loaf' ? v.y + 3.9 : v.y + 6));
  for (let i = 0; i < 180; i++) { G.x = x; G.y = y; G.vx = 0; G.vy = -19; G.w = 0; G.ang = Math.PI / 2; S.hold(0); S.stepN(1, 1000 / 120); }
  G.x = x; G.y = y; return { x, y, kind: v.kind, vx: v.x, vy: v.y }; }, kase);
let n = 0; const log = [];
async function shot(tag) { await p.screenshot({ path: `${out}/${kase}_${String(n++).padStart(2, '0')}_${tag}.png` }); }
await shot('approach');
for (let s = 0; s < 260; s++) {
  const ev = await p.evaluate(k => { const S = window._S3, G = S.g(), v = S.verbs()[0], before = { st: v.stage, done: v.done, out: v.grp && v.grp.lan ? v.grp.lan.filter(l => l.out).length : 0, vy: G.vy };
    S.stepN(1, 1000 / 120);
    const after = { st: v.stage, done: v.done, out: v.grp && v.grp.lan ? v.grp.lan.filter(l => l.out).length : 0, vy: G.vy };
    const e = [];
    if (after.st !== before.st) e.push('stage' + after.st);
    if (!before.done && after.done) e.push(k === 'lantern' ? 'cut' : 'done');
    if (after.out > before.out) e.push('burst' + after.out);
    if (before.vy < 0 && after.vy > 0) e.push('kick');
    return { e, y: +G.y.toFixed(2), x: +G.x.toFixed(2), t: +G.t.toFixed(3), chips: G.chips || 0, done: G.done, failed: !!G.failed }; }, kase);
  if (ev.e.length) { log.push(ev); await shot(ev.e.join('-')); }
  else if (s % 24 === 12) await shot('t' + ev.t);
  if (ev.done) { log.push({ end: ev }); break; }
  if (kase === 'lantern' && log.some(l => l.e && l.e.indexOf('burst5') >= 0) && s > 0) { await shot('after'); break; }
  if (kase === 'loaf' && log.some(l => l.e && l.e.indexOf('done') >= 0)) { for (let q = 0; q < 3; q++) { await p.evaluate(() => window._S3.stepN(6, 1000 / 120)); await shot('fan' + q); } break; }
  if ((kase === 'ice' || kase === 'iceside') && log.some(l => l.e && l.e.indexOf('stage2') >= 0)) { for (let q = 0; q < 4; q++) { await p.evaluate(() => window._S3.stepN(8, 1000 / 120)); await shot('after' + q); } break; }
}
console.log(JSON.stringify({ at, log, errs }));
await b.close();
