// Part F2: Jessie's "handles going through the ground". Journey level 1, a tap whenever grounded every N steps; a frame
// every 2 steps (32 ms) through each landing, with the knife's pose and its lowest drawn point against the ground (y 0).
// node ground.mjs <outdir> [mode]   mode: journey (default) | ff (a Freefall 1 landing, handle first)
import { createRequire } from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js');
const puppeteer = require('puppeteer');
const [out, mode = 'journey'] = process.argv.slice(2);
const BASE = process.env.BASE || 'http://127.0.0.1:8777';
const sleep = t => new Promise(r => setTimeout(r, t));
const b = await puppeteer.launch({ headless: 'new', protocolTimeout: 300000, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] });
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 200)));
await p.setViewport({ width: 412, height: 915, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
await p.evaluateOnNewDocument(() => { try { localStorage.setItem('sws_dev_ok', '1'); localStorage.setItem('lwfb_explained', '1'); } catch (e) {} });
await p.goto(BASE + '/satellites/slice-3d/' + (process.env.PAGE || '') + '?dev=1', { waitUntil: 'domcontentloaded', timeout: 60000 });
await p.waitForFunction(() => window._S3 && window._S3.art && window._S3.art().json && document.readyState === 'complete', { timeout: 30000 });
await p.evaluate(() => window._S3.newGame(1)); await sleep(2500); await p.evaluate(() => window._S3.newGame(1)); await sleep(2500);
const log = [];
for (let f = 0; f < 60; f++) {
  const st = await p.evaluate((f) => { const S = window._S3, G = S.g(); if (G.grounded && f % 14 === 3) S.tap(1); S.stepN(2, 16); const g = S.g();
    const k = S.kpose ? S.kpose() : null, sn = k ? Math.sin(k.rz) : 0;
    const low = k ? k.y + Math.min(k.hi * sn, -k.lo * sn) - k.hh * Math.abs(Math.cos(k.rz)) : null;   /* the DRAWN knife's lowest point */
    return { y: +g.y.toFixed(2), gr: !!g.grounded, low: low == null ? null : +(low - (k.surf || 0)).toFixed(2), lift: k ? +k.lift.toFixed(2) : null, done: !!g.done }; }, f);
  log.push(st); await p.screenshot({ path: `${out}/g-${String(f).padStart(2, '0')}.png` }); if (st.done) break;
}
console.log(log.map((s, i) => i + ':' + (s.gr ? 'G' : 'a') + ' y' + s.y + ' low' + s.low + ' lift' + s.lift).join('  '));
console.log('min drawn lowest above its surface:', Math.min(...log.map(s => s.low)));
console.log('errs', errs.join(' | '));
await b.close();
