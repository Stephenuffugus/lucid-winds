import {createRequire} from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js');
const puppeteer = require('puppeteer');
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] }); const p = await b.newPage();
await p.setViewport({ width: 360, height: 640 });
await p.goto('http://127.0.0.1:8777/satellites/slice-3d/?dev=1', { waitUntil: 'domcontentloaded', timeout: 60000 }); await new Promise(r => setTimeout(r, 3500));
const r = await p.evaluate(() => { window._S3forge.renderForge(); document.getElementById('s-forge').classList.add('on');
  const st = document.querySelector('#forge-grid .fcard[data-key="rubberduke"] .fstat'), cs = getComputedStyle(st), g = document.createElement('canvas').getContext('2d');
  g.font = cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily; const out = { avail: st.clientWidth, font: g.font };
  for (const t of ['12 handle bounces in a Journey run', '12 handle bounces in Journey', '12 handle bounces, one Journey', '12 handle bounces in one run', 'stick x30 on the climb wall', 'reach 150m in Endless Fall'])
    out[t] = Math.round(g.measureText(t).width);
  return out; });
console.log(JSON.stringify(r, null, 1)); await b.close();
