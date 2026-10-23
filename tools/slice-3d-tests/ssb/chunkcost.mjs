import { createRequire } from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js'); const puppeteer = require('puppeteer');
const b = await puppeteer.launch({ headless: 'new', protocolTimeout: 300000, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] });
const p = await b.newPage(); await p.setViewport({ width: 412, height: 915 });
await p.goto('http://127.0.0.1:8777/satellites/slice-3d/?dev=1', { waitUntil: 'domcontentloaded', timeout: 60000 });
await new Promise(r => setTimeout(r, 5000));
const r = await p.evaluate(() => {
  const S = window._S3; window._S3skiprender = true; S.salt(31); S.newEndless(); const G = S.g();
  const plain = [], cross = [];
  for (let k = 1; k <= 12; k++) {
    // a plain step inside the chunk, then the step that crosses the next chunk line (builds one chunk, drops one)
    G.y = 4 - k * 100 + 50; G.vy = 0; S.stepN(1, 1000 / 120);
    let t0 = performance.now(); S.stepN(1, 1000 / 120); plain.push(performance.now() - t0);
    G.y = 4 - (k + 1) * 100 + 0.5; G.vy = 0;
    t0 = performance.now(); S.stepN(1, 1000 / 120); cross.push(performance.now() - t0);
  }
  window._S3skiprender = false; S.salt(null);
  const med = a => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
  return { plainMed: +med(plain).toFixed(2), cross: cross.map(v => +v.toFixed(1)), ring: S.endless() };
});
console.log(JSON.stringify(r));
await b.close();
