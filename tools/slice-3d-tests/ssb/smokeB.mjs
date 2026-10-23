import { createRequire } from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js'); const puppeteer = require('puppeteer');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const b = await puppeteer.launch({ headless: 'new', protocolTimeout: 300000, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] });
const p = await b.newPage(); await p.setViewport({ width: +(process.env.VW||360), height: +(process.env.VH||640) });
const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 300)));
await p.evaluateOnNewDocument(() => { try { localStorage.setItem('lwfb_explained', '1'); } catch (e) {} });
await p.goto('http://127.0.0.1:8777/satellites/slice-3d/?dev=1', { waitUntil: 'domcontentloaded', timeout: 60000 });
await p.waitForFunction(() => window._S3 && document.readyState === 'complete', { timeout: 30000 }); await sleep(2500);
const lay = await p.evaluate(() => { const st = document.getElementById('stage').getBoundingClientRect(); const sc = st.height / 960;
  const o = {}; ['b-play','b-ff','b-endless','b-climb','b-forge','b-how','b-classic','b-set','b-music'].forEach(id => { const r = document.getElementById(id).getBoundingClientRect();
    o[id] = { top: Math.round((r.top - st.top) / sc), bot: Math.round((r.bottom - st.top) / sc), w: Math.round(r.width), h: Math.round(r.height) }; });
  o.scale = +sc.toFixed(3); o.vh = innerHeight; return o; });
console.log('layout', JSON.stringify(lay));
const runs = await p.evaluate(() => { const S = window._S3, out = {};
  S.newGame(1); for (let i = 0; i < 400; i++) { if (i % 20 === 0) S.tap(1); S.stepN(1, 16); } out.journey = { x: +S.g().x.toFixed(2), done: S.g().done };
  S.salt(12345); S.newFF(1); for (let i = 0; i < 300; i++) { S.hold(0); S.stepN(1, 16); } out.ff = { y: +S.g().y.toFixed(2), done: S.g().done, failed: !!S.g().failed };
  S.newClimb(1); for (let i = 0; i < 200; i++) { if (i % 25 === 0) S.tap(1); S.stepN(1, 16); } out.climb = { x: +S.g().x.toFixed(2), y: +S.g().y.toFixed(2), done: S.g().done };
  S.salt(777); S.newEndless(); out.e0 = S.endless();
  const G = S.g(); for (let i = 0; i < 600; i++) { G.x = 0; G.vx = 0; G.w = 0; G.ang = Math.PI / 2; S.hold(0); S.stepN(1, 16); }
  out.e1 = S.endless(); out.e1.depth = Math.round(S.g().depth); out.e1.done = S.g().done;
  G.y = -2500; G.depth = 2504; for (let i = 0; i < 30; i++) { G.x = 0; G.vx = 0; G.w = 0; G.ang = Math.PI / 2; S.hold(0); S.stepN(1, 16); }
  out.e2 = S.endless(); out.e2.done = S.g().done; out.e2.y = Math.round(S.g().y);
  S.salt(null); return out; });
console.log('runs', JSON.stringify(runs));
console.log('errs', JSON.stringify(errs));
await b.close();
