/* Google Play raws for OriVex (23 Oct 2026): five scenes from the REAL game as the PLAY BUILD (referrer set
   before any script), 412x641 CSS at DPR 2.62136 = the 1080x1680 raw tools/store-kit/compose.mjs bands.
   The stage is 9:16 so it sits on warm paper with thin side margins at this aspect; that is the game.
   Usage (repo root): node store/orivex-play/shots.mjs   then   node tools/store-kit/compose.mjs store/orivex-play/kit.json */
import puppeteer from 'puppeteer';
import { mkdirSync } from 'fs';
import { spawn } from 'child_process';
const PORT = 8981, BASE = `http://127.0.0.1:${PORT}/satellites/petalvex/index.html?pvxtest=1`;
const OUT = new URL('./raw/', import.meta.url).pathname; mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: '/workspaces/lucid-winds', stdio: 'ignore' });
await sleep(900);
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--force-color-profile=srgb'] });
async function page() {
  const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
  await p.setViewport({ width: 412, height: 641, deviceScaleFactor: 2.62136, isMobile: true, hasTouch: true });
  await p.evaluateOnNewDocument(() => { Object.defineProperty(document, 'referrer', { get: () => 'android-app://com.skywolfstudio.orivex/' });
    try { localStorage.setItem('pvx_seen', '1'); localStorage.setItem('sws_music_seen', '1'); localStorage.setItem('pvx_solved', '14'); localStorage.setItem('pvx_streak', JSON.stringify({ last: (function(){ var d=new Date(); return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate(); })(), n: 6 })); } catch (e) {} });
  await p.goto(BASE, { waitUntil: 'networkidle2', timeout: 60000 }); await sleep(1500);
  await p.evaluate(() => { const later = [...document.querySelectorAll('button')].find(x => /later/i.test(x.textContent)); if (later) later.click(); const c = document.querySelector('.mu-card, [class*=unlock-card]'); if (c) c.remove(); });
  if (!(await p.evaluate(() => window.SWS_IN_TWA === true))) throw new Error('not the Play build');
  return p;
}
const clean = p => p.evaluate(() => { ['sws-music-chip', 'sws-music-pill', 'sws-music-card'].forEach(id => { const e = document.getElementById(id); if (e) e.remove(); }); });
async function bed(p, key, fill) {
  await p.evaluate(k => PVX_DEV.start(k), key); await sleep(600);
  /* a mid solve: the first `fill` tiles sit in their cells, the rest wait in the tray */
  if (fill) await p.evaluate(n => { const P = PVX_DEV.state(); for (let i = 0; i < P.tray.length; i++) { const t = P.tray[i]; if (t && t.sol < n) { P.board[t.sol] = t; P.tray[i] = undefined; } } PVX_DEV.render(); }, fill);
  await sleep(500); await clean(p);
}
let p = await page(); await clean(p); await p.screenshot({ path: OUT + '1-title.png' });
await bed(p, 's4', 7); await p.screenshot({ path: OUT + '2-bed.png' });
await bed(p, 's5', 9); await p.screenshot({ path: OUT + '3-bloom.png' });
await bed(p, 'dly5', 0); await p.evaluate(() => { PVX_DEV.state().startT = Date.now() - 83000; PVX_DEV.solveNow(); }); await sleep(2600); await clean(p); await p.screenshot({ path: OUT + '5-win.png' });
await p.evaluate(() => document.getElementById('win-modes').click()); await sleep(600); await clean(p); await p.screenshot({ path: OUT + '4-beds.png' });
await b.close(); srv.kill(); console.log('raws written');
