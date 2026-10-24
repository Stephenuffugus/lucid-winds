// node e3look.mjs <outdir> <case...>   Part E3 looks: title (the four button row), card (the Daily card), spent (the card with
// the day's dive spent), won (the end panel of the day's scored dive reaching the floor). VW/VH/DPR env; one browser per case.
import { createRequire } from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js'); const puppeteer = require('puppeteer');
const [out, ...cases] = process.argv.slice(2);
const LAUNCH = { headless: 'new', protocolTimeout: 300000, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] };
const sleep = ms => new Promise(r => setTimeout(r, ms)), W = +(process.env.VW || 412), H = +(process.env.VH || 915), tag = W + 'x' + H;
for (const c of cases) {
  const b = await puppeteer.launch(LAUNCH); const p = await b.newPage();
  await p.setViewport({ width: W, height: H, deviceScaleFactor: +(process.env.DPR || 2), isMobile: true, hasTouch: true });
  const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 200)));
  await p.evaluateOnNewDocument(sp => { try { localStorage.setItem('sws_dev_ok', '1'); localStorage.setItem('lwfb_explained', '1'); localStorage.removeItem('s3d_daily');
    if (sp) localStorage.setItem('s3d_daily', sp); } catch (e) {} }, c === 'spent' ? null : null);
  await p.goto('http://127.0.0.1:8777/satellites/slice-3d/?dev=1', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await p.waitForFunction(() => window._S3 && window._S3.art && window._S3.art().json && document.readyState === 'complete', { timeout: 30000 });
  const settle = async () => { const t0 = Date.now(); while (Date.now() - t0 < 20000) { const a = await p.evaluate(() => window._S3.art()); if (a.asked > 0 && a.loaded + a.failed >= a.asked) break; await sleep(400); } };
  await settle(); await sleep(800);
  if (c === 'card') await p.evaluate(() => window._S3.showDaily());
  if (c === 'spent') await p.evaluate(() => { const d = window._S3.dly(); d.used = true; d.done = false; d.score = 4210; window._S3.showDaily(); });
  if (c === 'won') { await p.evaluate(() => window._S3.newDaily(true)); await settle(); await p.evaluate(() => { const S = window._S3, D = 1000 / 120; window._S3skiprender = true; S.stepN(2, D);
    const g = S.g(), Wd = S.world(); g.x = 0; g.y = Wd.floorY + 3; g.vx = 0; g.vy = -10; g.w = 0; g.ang = Math.PI / 2; S.hold(0);
    const go = document.getElementById('s-go'); for (let n = 0; n < 900 && !go.classList.contains('on'); n++) S.stepN(1, D); window._S3skiprender = false; }); await sleep(1500); }
  await sleep(500); await p.screenshot({ path: `${out}/e3_${c}_${tag}.png` });
  console.log(c, tag, 'errs', JSON.stringify(errs)); await b.close();
}
