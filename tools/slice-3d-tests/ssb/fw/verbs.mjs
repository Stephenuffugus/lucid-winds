import {createRequire} from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js');
const puppeteer = require('puppeteer');
const b = await puppeteer.launch({ headless: 'new', protocolTimeout: 300000, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] });
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message.split('\n')[0]));
await p.setViewport({ width: 375, height: 667 });
await p.goto('http://127.0.0.1:8777/satellites/slice-3d/?dev=1', { waitUntil: 'domcontentloaded', timeout: 60000 }); await new Promise(r => setTimeout(r, 4000));
const r = await p.evaluate(() => {
  const S = window._S3, out = {}; window._S3skiprender = true;
  const kinds = () => S.verbs().map(v => v.kind).join(',');
  const key = e => [e.x || e.cx || 0, e.y || e.py || 0, e.w || e.r || 0, e.h || 0].map(v => Math.round(v * 1000)).join(',');
  const lists = () => { const W = S.world(), o = {}; for (const n of ['blocks', 'items', 'crystals', 'pads', 'slabs', 'wasps', 'planks', 'thorns']) o[n] = (W[n] || []).map(key); o.floor = W.floorY; return o; };
  for (const lvl of [1, 6, 11, 21, 26, 31, 36]) {
    S.salt(77); S.verbsOff(true); S.newFF(lvl); const A = lists();
    S.salt(77); S.verbsOff(false); S.newFF(lvl); const B = lists();
    const diff = {}; let extra = 0;
    for (const n in A) { if (n === 'floor') continue; const bs = new Set(B[n]); const gone = A[n].filter(k => !bs.has(k)).length; const as = new Set(A[n]); const added = B[n].filter(k => !as.has(k)).length; if (gone || added) diff[n] = '-' + gone + '+' + added; }
    out['ff' + lvl] = { verbs: kinds().split(',').reduce((m, k) => (m[k] = (m[k] || 0) + 1, m), {}), diff, floorSame: A.floor === B.floor, jelly: S.world().pads.filter(q => q.jelly).length + '/' + S.world().pads.length };
  }
  S.newClimb(1); out.climb = kinds();
  S.salt(null); return out;
});
console.log(JSON.stringify(r, null, 1)); console.log('errs', JSON.stringify(errs));
await b.close();
