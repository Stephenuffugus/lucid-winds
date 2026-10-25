// node tools/chess-tests/look.mjs <outdir> [court ...]   the standalone chess page at 412 x 915 with a court chosen and a game
// started (a first move played), one shot per court; repo root on 8777. Prints the board's square size and the piece image count.
import { createRequire } from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js'); const puppeteer = require('puppeteer');
const OUT = process.argv[2]; const COURTS = process.argv.slice(3).length ? process.argv.slice(3) : ['walnut', 'cats', 'petri'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
for (const court of COURTS) {
  const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
  await p.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await p.evaluateOnNewDocument((c) => { try { localStorage.setItem('lwfb_explained', '1'); localStorage.setItem('lw_chess_court', c); } catch (e) {} }, court);
  const errs = []; p.on('pageerror', (e) => errs.push(String(e.message || e).slice(0, 120)));
  await p.goto('http://127.0.0.1:8777/play/chess.html', { waitUntil: 'networkidle0', timeout: 60000 }); await sleep(1200);
  // a first visit opens the shell's rules card: tap LET'S PLAY (a real tap, by its rect)
  const lp = await p.evaluate(() => { const e = [...document.querySelectorAll('button')].find((b) => /LET'S PLAY/i.test(b.textContent)); if (!e) return null; const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  if (lp) { await p.touchscreen.tap(lp[0], lp[1]); await sleep(700); }
  // play e2 e4 by real taps on the squares (the board is a grid of squares with onclick="_CHClick(r,c)")
  const sq = await p.evaluate(() => { const cells = [...document.querySelectorAll('[onclick^="_CHClick("]')]; const r = (e) => { const b = e.getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2, b.width]; }; const find = (rr, cc) => cells.find((e) => e.getAttribute('onclick') === '_CHClick(' + rr + ',' + cc + ')'); const e2 = find(6, 4), e4 = find(4, 4); return { n: cells.length, e2: e2 && r(e2), e4: e4 && r(e4) }; });
  if (sq.e2 && sq.e4) { await p.touchscreen.tap(sq.e2[0], sq.e2[1]); await sleep(250); await p.touchscreen.tap(sq.e4[0], sq.e4[1]); await sleep(2200); }
  await p.screenshot({ path: `${OUT}/chess-${court}.png` });
  const info = await p.evaluate(() => ({ imgs: document.querySelectorAll('[onclick^="_CHClick("] img').length, status: (document.querySelector('.gsm, #gsm, .game-msg') || {}).textContent || '' }));
  console.log(court, 'squares', sq.n, 'square px', sq.e2 && Math.round(sq.e2[2]), 'piece imgs', info.imgs, 'errors', JSON.stringify(errs));
  await ctx.close();
}
await b.close();
