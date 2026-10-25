// node tools/shell-shuffle-tests/look2.mjs <outdir>   Part 2's look: the results sheet at 375 x 667 and 412 x 915 (a seeded miss at
// level 7), the Daily sheet with the painted plates and toys, and a win on a new best with the confetti frame. Repo root on 8777.
import { createRequire } from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js'); const puppeteer = require('puppeteer');
const OUT = process.argv[2]; const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SEED = JSON.stringify({ coins: 140, bestLevel: 9, owned: ['classic'], ownedCups: ['house'], selected: 'classic', selectedCup: 'house', daily: { last: null, streak: 2, best: 4, week: null, weekDays: 2, weekStreak: 0 } });
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
async function openAt(w, h, seed) {
  const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
  await p.setViewport({ width: w, height: h, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await p.evaluateOnNewDocument((s) => { try { localStorage.setItem('lwfb_explained', '1'); localStorage.setItem('shellshuffle:v1', s); } catch (e) {} }, seed);
  await p.goto('http://127.0.0.1:8777/satellites/shell-shuffle/?sstest=1', { waitUntil: 'networkidle0' }); await sleep(700);
  return { ctx, p };
}
const until = async (p, fn, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await p.evaluate(fn)) return true; await sleep(100); } return false; };
async function start(p) { const c = await p.evaluate(() => { const r = document.getElementById('actBtn').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }); await p.touchscreen.tap(c.x, c.y); await until(p, () => window.__ss.ball().phase === 'guessing', 20000); }
for (const [w, h] of [[375, 667], [412, 915]]) {
  const { ctx, p } = await openAt(w, h, SEED); await start(p);
  await p.evaluate(() => { window.__ss.state().level = 7; });
  const bl = await p.evaluate(() => window.__ss.ball()), wrong = bl.order.find((id) => id !== bl.ballCup);
  await p.click('#playfield .cup-wrap[data-id="' + wrong + '"]'); await sleep(120);
  await p.screenshot({ path: `${OUT}/miss-fx-${w}.png` });
  await until(p, () => window.__ss.results().open, 4000); await sleep(400);
  await p.screenshot({ path: `${OUT}/results-${w}.png` });
  if (w === 412) { await p.click('#rDaily'); await sleep(500); await p.screenshot({ path: `${OUT}/daily-${w}.png` }); }
  console.log(w + 'x' + h, JSON.stringify(await p.evaluate(() => window.__ss.results())));
  await ctx.close();
}
{ // a win on a new best: the confetti
  const { ctx, p } = await openAt(412, 915, JSON.stringify({ coins: 20, bestLevel: 0, owned: ['classic'], ownedCups: ['house'], selected: 'classic', selectedCup: 'house', daily: { last: null, streak: 0, best: 0, week: null, weekDays: 0, weekStreak: 0 } }));
  await start(p); const bl = await p.evaluate(() => window.__ss.ball());
  await p.click('#playfield .cup-wrap[data-id="' + bl.ballCup + '"]'); await sleep(200);
  await p.screenshot({ path: `${OUT}/win-confetti-412.png` });
  console.log('win frames', await p.evaluate(() => window.__ss.fxCount()));
  await ctx.close();
}
await b.close();
