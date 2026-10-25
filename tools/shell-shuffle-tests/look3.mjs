// node tools/shell-shuffle-tests/look3.mjs <outdir>   Part 3's look: the Settings sheet at 360 x 640, the pause sheet mid count at 412 x 915. Repo root on 8777.
import { createRequire } from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js'); const puppeteer = require('puppeteer');
const OUT = process.argv[2]; const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SEED = JSON.stringify({ coins: 140, bestLevel: 5, owned: ['classic'], ownedCups: ['house'], selected: 'classic', selectedCup: 'house', daily: { last: null, streak: 0, best: 0, week: null, weekDays: 0, weekStreak: 0 } });
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
async function openAt(w, h) { const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
  await p.setViewport({ width: w, height: h, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await p.evaluateOnNewDocument((s) => { try { localStorage.setItem('lwfb_explained', '1'); localStorage.setItem('shellshuffle:v1', s); } catch (e) {} }, SEED);
  await p.goto('http://127.0.0.1:8777/satellites/shell-shuffle/?sstest=1', { waitUntil: 'networkidle0' }); await sleep(700); return { ctx, p }; }
const until = async (p, fn, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await p.evaluate(fn)) return true; await sleep(100); } return false; };
{ const { ctx, p } = await openAt(360, 640); await p.click('#openSettings'); await sleep(400); await p.screenshot({ path: `${OUT}/settings-360.png` }); await ctx.close(); }
{ const { ctx, p } = await openAt(412, 915);
  const c = await p.evaluate(() => { const r = document.getElementById('actBtn').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }); await p.touchscreen.tap(c.x, c.y);
  await until(p, () => document.getElementById('status').textContent.indexOf('Shuffling') === 0, 8000);
  await p.evaluate(() => window.__ss.hide()); await sleep(500); await p.screenshot({ path: `${OUT}/paused-412.png` });
  await p.evaluate(() => window.__ss.show()); await p.click('#resumeBtn'); await sleep(250); await p.screenshot({ path: `${OUT}/count-412.png` });
  console.log('count', await p.evaluate(() => document.getElementById('pausedCount').textContent)); await ctx.close(); }
await b.close();
