// Endless content across the 100 m chunk lines: the largest vertical gap between neighbouring pieces, inside a chunk and
// across a line, over 24 salts x 9 chunks. MUT reverts a fix on the served copy.
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js');
const puppeteer = require('puppeteer');
const URL = 'http://127.0.0.1:8777/satellites/slice-3d/?dev=1';
const LAUNCH = { headless: 'new', protocolTimeout: 300000, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] };
let BODY = fs.readFileSync('/workspaces/lucid-winds/satellites/slice-3d/index.html', 'utf8');
for (const [f, r] of JSON.parse(process.env.MUT || '[]')) { if (BODY.split(f).length !== 2) { console.log('MUTATION NOT UNIQUE'); process.exit(2); } BODY = BODY.replace(f, r); }
const browser = await puppeteer.launch(LAUNCH); const p = await browser.newPage();
await p.setRequestInterception(true);
p.on('request', q => { if (q.isNavigationRequest() && /\/satellites\/slice-3d\/(\?|$)/.test(q.url())) q.respond({ status: 200, contentType: 'text/html', body: BODY }); else q.continue(); });
p.on('pageerror', e => console.log('PAGEERROR', e.message.split('\n')[0]));
await p.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 }); await new Promise(r => setTimeout(r, 3500));
const r = await p.evaluate(() => {
  const S = window._S3; window._S3skiprender = true;
  const LISTS = ['items', 'slabs', 'blocks', 'crystals', 'pads', 'wasps', 'planks', 'thorns'];
  let gapsSeam = [], gapsIn = [], pieces = 0, over20 = 0, crossers = 0;
  for (let salt = 1; salt <= 24; salt++) {
    S.salt(salt * 7919); S.newEndless(); const G = S.g();
    const seen = new Map();   // chunk k -> sorted piece ys
    for (let hop = 0; hop <= 9; hop++) {
      G.y = 4 - hop * 100 - 50; G.x = 0; G.vx = 0; G.vy = 0; G.w = 0; S.hold(0); S.stepN(1, 1000 / 120);
      const W = S.world();
      for (const L of LISTS) for (const e of (W[L] || [])) { if (e.ck == null) continue; if (!seen.has(e.ck)) seen.set(e.ck, new Set()); seen.get(e.ck).add(+e.y.toFixed(3)); }
    }
    const all = []; for (const [k, set] of seen) for (const y of set) { all.push({ k, y }); if (y < 4 - k * 100 - 100 - 0.01 || y > 4 - k * 100 + 0.01) crossers++; }
    all.sort((a, b) => b.y - a.y); pieces += all.length;
    for (let i = 1; i < all.length; i++) { if (all[i].y < -880) break; const g = all[i - 1].y - all[i].y;
      if (all[i].k !== all[i - 1].k) gapsSeam.push(g); else gapsIn.push(g); if (g > 20) over20++; }
  }
  S.salt(null); window._S3skiprender = false;
  const st = a => { a = a.slice().sort((x, y) => x - y); return { n: a.length, max: +a[a.length - 1].toFixed(1), med: +a[Math.floor(a.length / 2)].toFixed(1) }; };
  return { seam: st(gapsSeam), inside: st(gapsIn), over20, piecesPerRun: Math.round(pieces / 24), crossers };
});
console.log(JSON.stringify(r));
await browser.close();
