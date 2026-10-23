import {createRequire} from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js');
const puppeteer = require('puppeteer');
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] }); const p = await b.newPage();
await p.setViewport({ width: 412, height: 915, deviceScaleFactor: 2 });
await p.goto('http://127.0.0.1:8777/satellites/slice-3d/?dev=1', { waitUntil: 'domcontentloaded', timeout: 60000 }); await new Promise(r => setTimeout(r, 4500));
await p.evaluate(() => document.getElementById('b-forge').click()); await new Promise(r => setTimeout(r, 1500));
await p.evaluate(() => { window._S3.set().rm = true; });   // hold the loop still so each frame is the one asked for
const el = await p.$('#forge-pvc'); let i = 0;
for (const k of ['socktopus', 'rubberduke']) {
  await p.evaluate(k => window._S3forge.pvAt(k, 0), k); for (let w = 0; w < 40 && !(await p.evaluate(k => window._S3forge.pvReady(k), k)); w++) await new Promise(r => setTimeout(r, 150));
  for (const T of [2.35, 2.5, 2.58, 2.64, 2.72, 2.82, 2.95, 3.1]) {
    await p.evaluate((k, T) => { window._S3.set().rm = false; window._S3forge.pvAt(k, T); window._S3.set().rm = true; }, k, T);
    await el.screenshot({ path: `/tmp/claude-1000/ssb/c4/${String(i++).padStart(2, '0')}_${k}_${T}.png` });
  }
}
await b.close();
