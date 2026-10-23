import {createRequire} from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js');
const puppeteer = require('puppeteer');
const [out, key] = process.argv.slice(2);
const LAUNCH = { headless: 'new', protocolTimeout: 300000, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] };
const b = await puppeteer.launch(LAUNCH); const p = await b.newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message.split('\n')[0]));
await p.setViewport({ width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await p.evaluateOnNewDocument(() => { try { localStorage.setItem('lwfb_explained', '1'); } catch (e) {} });
await p.goto('http://127.0.0.1:8777/satellites/slice-3d/?dev=1', { waitUntil: 'domcontentloaded', timeout: 60000 }); await new Promise(r => setTimeout(r, 5000));
await p.evaluate(k => { const S = window._S3; const sk = S.skins(); if (sk.owned.indexOf(k) < 0) sk.owned.push(k); S.applySkin(k); }, key || 'classic');
await p.evaluate(() => document.getElementById('b-forge').click());   // navigation only (the tap paths are proven in the suite)
await new Promise(r => setTimeout(r, 3000));
const el = await p.$('#forge-pv');
for (let i = 0; i < 16; i++) { await el.screenshot({ path: `${out}/f${String(i).padStart(2, '0')}.png` }); await new Promise(r => setTimeout(r, 250)); }
await p.screenshot({ path: `${out}/forge_full.png` });
console.log(JSON.stringify({ errs }));
await b.close();
