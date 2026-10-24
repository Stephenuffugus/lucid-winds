// Part F1: film an Endless dive at a depth, at the game's own pace (16 ms frames), no input. A frame every 6 steps.
// node film.mjs <outdir> <metres...>   then: python3 -I ../fix/sheet.py <outdir> 'd<m>-*.png' <sheet.png> 6
import { createRequire } from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js');
const puppeteer = require('puppeteer');
const [out, ...ms] = process.argv.slice(2);
const BASE = process.env.BASE || 'http://127.0.0.1:8777';
const LAUNCH = { headless: 'new', protocolTimeout: 300000, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] };
const sleep = t => new Promise(r => setTimeout(r, t));
for (const m of ms.map(Number)) {
  const b = await puppeteer.launch(LAUNCH); const p = await b.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e).slice(0, 200)));
  await p.setViewport({ width: 412, height: 915, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await p.evaluateOnNewDocument(() => { try { localStorage.setItem('sws_dev_ok', '1'); localStorage.setItem('lwfb_explained', '1'); } catch (e) {} });
  await p.goto(BASE + '/satellites/slice-3d/' + (process.env.PAGE || '') + '?dev=1', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await p.waitForFunction(() => window._S3 && window._S3.art && window._S3.art().json && document.readyState === 'complete', { timeout: 30000 });
  await p.evaluate(() => { window._S3.salt(31); window._S3.newEndless(); });
  await sleep(1500);
  await p.evaluate(m => { const S = window._S3, G = S.g(); G.x = 0; G.y = 4 - m; G.depth = m; G.vx = 0; G.vy = -60; G.ang = Math.PI / 2; G.w = 0; S.hold(0); S.stepN(2, 16); }, m);
  const t0 = Date.now(); while (Date.now() - t0 < 15000) { const a = await p.evaluate(() => window._S3.art()); if (a.asked > 0 && a.loaded + a.failed >= a.asked) break; await sleep(400); }
  const info = [];
  for (let f = 0; f < 18; f++) {
    const st = await p.evaluate(() => { const S = window._S3; S.hold(0); S.stepN(6, 16); const G = S.g(); return { d: Math.round(G.depth), vy: Math.round(G.vy * 10) / 10, x: Math.round(G.x * 10) / 10, done: !!G.done }; });
    info.push(st); await p.screenshot({ path: `${out}/d${m}-${String(f).padStart(2, '0')}.png` });
    if (st.done) break;
  }
  console.log(m, JSON.stringify(info.map(s => s.d + 'm v' + s.vy + (s.done ? ' DONE' : ''))), errs.join(' | '));
  await b.close();
}
