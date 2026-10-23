// node knifecheck.mjs <page>  -> the audit [6] painted-knife row, alone (to watch it fail on a copy without the clamp)
import { createRequire } from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js'); const puppeteer = require('puppeteer');
const page = process.argv[2] || '';
const b = await puppeteer.launch({ headless: 'new', protocolTimeout: 300000, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] });
const p = await b.newPage(); await p.setViewport({ width: 375, height: 667 });
const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160)));
await p.goto('http://127.0.0.1:8777/satellites/slice-3d/' + page + '?dev=1', { waitUntil: 'domcontentloaded', timeout: 60000 });
await new Promise(r => setTimeout(r, 3500));
await p.evaluate(() => window._S3.newGame(1));
const pk = await p.evaluate(async () => {
  const S = window._S3, sk = S.skins(), bad = [], seen = [], none = [], all = {};
  for (const k of S.skinOrder()) {
    if (sk.owned.indexOf(k) < 0) sk.owned.push(k);
    S.applySkin(k);
    const t0 = Date.now(); let a = S.art();
    while (!a.knife && Date.now() - t0 < 10000) { await new Promise(r => setTimeout(r, 150)); a = S.art(); }
    if (!a.knife) { none.push(k); continue; }
    const s = S.span(), len = +(s.hi - s.lo).toFixed(3), khh = Math.max(0.8, s.ho);
    seen.push(k); all[k] = { len, art: a.knifeSpan, half: +(a.knifeH / 2).toFixed(3), khh: +khh.toFixed(3) };
    if (Math.abs(a.knifeSpan - len) > 0.002 || a.knifeH / 2 > khh + 0.002) bad.push(k);
  }
  return { bad, seen: seen.length, none, all };
});
console.log(JSON.stringify({ pass: pk.bad.length === 0 && pk.none.length === 0 && pk.seen > 0, ...pk, errs }));
await b.close();
