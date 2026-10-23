import { createRequire } from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js');
const puppeteer = require('puppeteer');
const b = await puppeteer.launch({ headless: 'new', protocolTimeout: 300000, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] });
const p = await b.newPage(); await p.setViewport({ width: 375, height: 667 });
await p.goto('http://127.0.0.1:8777/satellites/slice-3d/?dev=1', { waitUntil: 'domcontentloaded', timeout: 60000 }); await new Promise(r => setTimeout(r, 3500));
const r = await p.evaluate(() => { const S = window._S3, out = []; window._S3skiprender = true;
  for (let s = 1; s <= 40; s++) { S.salt(s); S.newFF(1); let n = 0; for (; n < 8000; n++) { const g = S.state(); S.stepN(1, 16); if (g.done) break; }
    const g = S.state(); out.push(s + ':' + (g.failed ? 'STUCK' : 'clean') + '@' + n); }
  S.salt(null); return out; });
console.log(r.join(' ')); const clean = r.filter(x => /clean/.test(x)).length; console.log('clean', clean, 'of', r.length);
await b.close();
