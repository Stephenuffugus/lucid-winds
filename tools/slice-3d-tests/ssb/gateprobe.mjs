// the suite's gate fall, traced, on PAGE (default the real page)
import { createRequire } from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js'); const puppeteer = require('puppeteer');
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] });
const p = await b.newPage(); await p.setViewport({ width: 375, height: 667 });
await p.goto('http://127.0.0.1:8777' + (process.env.PAGE || '/satellites/slice-3d/') + '?dev=1', { waitUntil: 'domcontentloaded' }); await new Promise(q => setTimeout(q, 3500));
const r = await p.evaluate(() => { const S = window._S3, D = 1000 / 120; window._S3skiprender = true;
  S.salt(77); S.newFF(7); const W = S.world(), byY = {}; W.slabs.forEach(s => { const k = s.y.toFixed(3); (byY[k] = byY[k] || []).push(s); });
  let gate = null; for (const k in byY) { const a = byY[k]; if (a.length === 3 && a.every(s => [7.2, 2.4].some(v => Math.abs(Math.abs(s.x) - v) < 0.01))) { gate = a; break; } }
  const before = gate.map(s => +s.x.toFixed(2)); const gx = [-7.2, -2.4, 2.4]; gate.sort((u, v) => u.x - v.x).forEach((s, i) => { s.x = gx[i]; });
  const lo = gate[0].y - 12, hi = gate[0].y + 12, away = e => !(e.y > lo && e.y < hi);
  for (const n of ['items', 'crystals', 'pads', 'wasps', 'planks', 'thorns', 'verbs']) W[n] = (W[n] || []).filter(away); W.slabs = W.slabs.filter(s => gate.indexOf(s) >= 0 || away(s));
  const G = S.g(); G.x = -7.1; G.y = gate[0].y + 4; G.vx = 0; G.vy = -19; G.w = 0; G.ang = 295 * Math.PI / 180; S.hold(0); const tr = [];
  for (let n = 0; n < 240 && !G.done && G.y > gate[0].y - 4; n++) { S.stepN(1, D); if (n < 60 && n % 3 === 0) tr.push([n, +G.x.toFixed(2), +(G.y - gate[0].y).toFixed(2), +G.vx.toFixed(1), gate.map(s => s.stk ? (s.stk.inside ? 1 : 0) : '-').join('')]); }
  return { before, gy: gate[0].y, stks: gate.map(s => !!s.stk), failed: !!G.failed, x: G.x, tr, slabsNear: W.slabs.filter(s => Math.abs(s.y - gate[0].y) < 12).length }; });
console.log(JSON.stringify(r)); await b.close();
