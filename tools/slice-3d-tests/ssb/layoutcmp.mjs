// node layoutcmp.mjs <page>  -> JSON of every numbered Freefall dive's contents for a pinned seed (Math.random stubbed
// only while newFF runs), plus Journey and Climb. Run on the v6.1 copy and the new build; the outputs must be identical.
import { createRequire } from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js'); const puppeteer = require('puppeteer');
const page = process.argv[2] || '';
const b = await puppeteer.launch({ headless: 'new', protocolTimeout: 300000, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] });
const p = await b.newPage(); await p.setViewport({ width: 375, height: 667 });
const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160)));
await p.goto('http://127.0.0.1:8777/satellites/slice-3d/' + page + '?dev=1&noart=1', { waitUntil: 'domcontentloaded', timeout: 60000 });
await new Promise(r => setTimeout(r, 3000));
const out = await p.evaluate(() => {
  const S = window._S3, R = Math.random, res = {};
  const r3 = v => Math.round(v * 1000) / 1000;
  const dump = W => { const o = {};
    for (const n of ['blocks', 'items', 'crystals', 'pads', 'slabs', 'wasps', 'planks', 'thorns']) o[n] = (W[n] || []).map(e => [r3(e.x || e.cx || e.px || 0), r3(e.y || e.py || 0), r3(e.w || e.r || e.L || 0), r3(e.h || e.range || e.amp || 0)].join(','));
    o.floorY = W.floorY; o.len = W.len; return o; };
  for (const lvl of [1, 4, 6, 12, 25, 45]) {
    Math.random = () => 0.37; try { S.newFF(lvl); } finally { Math.random = R; }
    res['ff' + lvl] = dump(S.world());
  }
  for (const lvl of [1, 7]) { S.newGame(lvl); res['j' + lvl] = dump(S.world()); S.newClimb(lvl); res['c' + lvl] = dump(S.world()); }
  return res;
});
console.log(JSON.stringify({ out, errs }));
await b.close();
