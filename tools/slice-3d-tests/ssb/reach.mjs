// node reach.mjs <page>  -> JSON {skin: {KLEN, KHH, span, art}} for every skin, read through the dev hook.
// Run against v6.0 and the new build: the collider numbers must be identical, and the painted plane must span the
// recipe exactly (contact fires where the drawn edge is: the Forge's promise and the 8/01 bug).
import { createRequire } from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js'); const puppeteer = require('puppeteer');
const page = process.argv[2];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const b = await puppeteer.launch({ headless: 'new', protocolTimeout: 300000, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] });
const p = await b.newPage(); await p.setViewport({ width: 412, height: 915 });
const errs = []; p.on('pageerror', e => errs.push(String(e)));
await p.goto('http://127.0.0.1:8777/satellites/slice-3d/' + page + (page.includes('?') ? '&' : '?') + 'dev=1', { waitUntil: 'domcontentloaded' });
await p.waitForFunction(() => window._S3, { timeout: 30000 });
await p.evaluate(() => window._S3.newGame(1));
await sleep(1500);
const out = {};
const order = await p.evaluate(() => window._S3.skinOrder());
for (const k of order) {
  await p.evaluate(k => { const S = window._S3; const sk = S.skins(); if (sk.owned.indexOf(k) < 0) sk.owned.push(k); S.applySkin(k); }, k);
  const t0 = Date.now(); let r;
  while (true) {
    r = await p.evaluate(() => { const S = window._S3, a = S.art ? S.art() : null; return { reach: S.reach(), span: S.span ? S.span() : null, knife: a ? a.knife : null, knifeSpan: a ? a.knifeSpan : null }; });
    if (!r.span || r.knife || Date.now() - t0 > 8000) break; await sleep(200);
  }
  out[k] = { KLEN: r.reach.KLEN, KHH: r.reach.KHH, at0: r.reach.at0, span: r.span ? +(r.span.hi - r.span.lo).toFixed(3) : null, art: r.knifeSpan };
}
console.log(JSON.stringify({ out, errs }));
await b.close();
