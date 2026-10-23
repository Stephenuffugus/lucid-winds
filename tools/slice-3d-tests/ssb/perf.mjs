// paired frame time: art on vs ?noart=1, Freefall L6 mid shaft, 412x915 DPR 1, one fresh browser per run.
// A sample = one dev step (update + render) followed by a 1 px readPixels, so the GPU work is inside the time.
import { createRequire } from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js'); const puppeteer = require('puppeteer');
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function run(noart) {
  const b = await puppeteer.launch({ headless: 'new', protocolTimeout: 300000, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] });
  const p = await b.newPage(); await p.setViewport({ width: 412, height: 915, deviceScaleFactor: 1 });
  await p.goto('http://127.0.0.1:8777/satellites/slice-3d/?dev=1' + (noart ? '&noart=1' : ''), { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => window._S3 && document.readyState === 'complete', { timeout: 30000 }); await sleep(1500);
  await p.evaluate(() => window._S3.newFF(6)); await sleep(3000);
  await p.evaluate(() => window._S3.newFF(6)); await sleep(800);
  const r = await p.evaluate(() => {
    const S = window._S3, cv = document.querySelector('canvas'), gl = cv.getContext('webgl2') || cv.getContext('webgl'), px = new Uint8Array(4);
    for (let i = 0; i < 30; i++) S.stepN(1, 16);
    const t = [];
    for (let i = 0; i < 120; i++) { const t0 = performance.now(); S.stepN(1, 16); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); t.push(performance.now() - t0); }
    t.sort((a, b) => a - b); return { med: t[60], p90: t[108], art: S.art ? S.art() : null };
  });
  await b.close(); return r;
}
const out = [];
for (let i = 0; i < 3; i++) { const on = await run(false); const off = await run(true); out.push({ on: on.med, off: off.med, on90: on.p90, off90: off.p90, loaded: on.art && on.art.loaded }); }
console.log(JSON.stringify(out));
const med = a => a.slice().sort((x, y) => x - y)[1];
console.log('median of medians: art on', med(out.map(o => o.on)).toFixed(1), 'ms, art off', med(out.map(o => o.off)).toFixed(1), 'ms');
