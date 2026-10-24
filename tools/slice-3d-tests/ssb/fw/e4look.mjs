// node e4look.mjs <outdir> [lvl]   Part E4 from the player's camera: the chamber as the knife arrives, hit 1, hit 2 (cell 2),
// the reveal (cell 3), the end panel. PAGE env (default the E4 side page). One browser.
import { createRequire } from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js'); const puppeteer = require('puppeteer');
const [out, lvlArg] = process.argv.slice(2); const LVL = +(lvlArg || 5);
const b = await puppeteer.launch({ headless: 'new', protocolTimeout: 300000, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] });
const p = await b.newPage(); await p.setViewport({ width: +(process.env.VW || 412), height: +(process.env.VH || 915), deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 200)));
await p.evaluateOnNewDocument(() => { try { localStorage.setItem('sws_dev_ok', '1'); localStorage.setItem('lwfb_explained', '1'); } catch (e) {} });
await p.goto('http://127.0.0.1:8777' + (process.env.PAGE || '/satellites/slice-3d/index-e4.html') + '?dev=1', { waitUntil: 'domcontentloaded', timeout: 60000 });
await p.waitForFunction(() => window._S3 && window._S3.art && window._S3.art().json && document.readyState === 'complete', { timeout: 30000 });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const settle = async () => { const t0 = Date.now(); while (Date.now() - t0 < 20000) { const a = await p.evaluate(() => window._S3.art()); if (a.asked > 0 && a.loaded + a.failed >= a.asked) break; await sleep(400); } };
await p.evaluate(l => { window._S3.salt(77); window._S3.newFF(l); }, LVL); await settle();
await p.evaluate(l => { window._S3.salt(77); window._S3.newFF(l); }, LVL); await settle();
await p.waitForFunction(() => !!(window._S3.boss() && window._S3.boss().tex), { timeout: 20000 }).catch(() => {});
const shot = async tag => { await p.screenshot({ path: `${out}/e4_L${LVL}_${tag}.png` }); };
await p.evaluate(() => { const S = window._S3, G = S.g(), B = S.boss(), D = 1000 / 120; window._S3skiprender = true;
  for (let i = 0; i < 180; i++) { G.x = 0.3; G.y = B.y + 22; G.vx = 0; G.vy = -19; G.w = 0; G.ang = Math.PI / 2; S.hold(0); S.stepN(1, D); } G.x = 0.3; G.y = B.y + 22; G.vx = 0; G.vy = -19; G.ang = Math.PI / 2; window._S3skiprender = false; S.stepN(1, D); });   /* one rendered frame: the canvas shows where the knife is */
await sleep(300); await shot('0arrive');
const runTo = async (cond, extra) => p.evaluate((c, e) => { const S = window._S3, G = S.g(), B = S.boss(), D = 1000 / 120; window._S3skiprender = true; const f = new Function('B', 'G', 'return ' + c);
  for (let n = 0; n < 3000 && !f(B, G) && !G.done; n++) S.stepN(1, D); for (let n = 0; n < e; n++) S.stepN(1, D); window._S3skiprender = false; S.stepN(1, D); return { hits: B.hits, x: +B.x.toFixed(2), tx: B.tx, y: +(G.y - B.y).toFixed(1) }; }, cond, extra || 0);
console.log('hit1', JSON.stringify(await runTo('B.hits>=1', 6))); await sleep(200); await shot('1hit');
console.log('lob', JSON.stringify(await runTo('B.lobs>=1', 60))); await sleep(200); await shot('2lob');
console.log('hit2', JSON.stringify(await runTo('B.hits>=2', 6))); await sleep(200); await shot('3hit2');
console.log('hit3', JSON.stringify(await runTo('B.hits>=3', 10))); await sleep(200); await shot('4reveal');
await p.evaluate(() => { const S = window._S3, D = 1000 / 120, go = document.getElementById('s-go'); window._S3skiprender = true; for (let n = 0; n < 1500 && !go.classList.contains('on'); n++) S.stepN(1, D); window._S3skiprender = false; });
await sleep(1800); await shot('5panel');
console.log('errs', JSON.stringify(errs)); await b.close();
