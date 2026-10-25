// node tools/shell-shuffle-tests/look.mjs <outdir> [WxH ...]   the title, a round (3 cups), six cups, a miss with a lifted
// cup; prints the cups' painted feet (from the image pixels) against 70 percent of the height, and whether the page scrolls.
import { createRequire } from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js'); const puppeteer = require('puppeteer');
const OUT = process.argv[2], VIEWS = (process.argv.slice(3).length ? process.argv.slice(3) : ['412x915', '375x667', '360x640']).map((v) => v.split('x').map(Number));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
for (const [w, h] of VIEWS) {
  const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
  await p.setViewport({ width: w, height: h, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await p.evaluateOnNewDocument(() => { try { localStorage.setItem('lwfb_explained', '1'); } catch (e) {} });
  await p.goto('http://127.0.0.1:8777/satellites/shell-shuffle/?sstest=1', { waitUntil: 'networkidle0' }); await sleep(800);
  const until = async (fn, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await p.evaluate(fn)) return true; await sleep(100); } return false; };
  const measure = () => p.evaluate(() => new Promise((res) => {
    const imgs = [...document.querySelectorAll('#playfield .cup-img')]; if (!imgs.length) return res(null);
    const im = imgs[0], cv = document.createElement('canvas'), g = cv.getContext('2d');
    const go = () => { cv.width = im.naturalWidth; cv.height = im.naturalHeight; g.drawImage(im, 0, 0); const d = g.getImageData(0, 0, cv.width, cv.height).data;
      let low = -1; for (let y = cv.height - 1; y >= 0 && low < 0; y--) for (let x = 0; x < cv.width; x++) if (d[(y * cv.width + x) * 4 + 3] > 24) { low = y; break; }
      const r = im.getBoundingClientRect(); const feet = r.top + (low + 1) / cv.height * r.height;
      res({ feet: +feet.toFixed(1), want: +(0.7 * innerHeight).toFixed(1), frac: +(feet / innerHeight).toFixed(3), cupW: +r.width.toFixed(1), scroll: document.documentElement.scrollHeight - innerHeight }); };
    if (im.complete && im.naturalWidth) go(); else im.onload = go; }));
  console.log(w + 'x' + h, 'title scroll', await p.evaluate(() => document.documentElement.scrollHeight - innerHeight));
  await p.screenshot({ path: `${OUT}/title-${w}.png` });
  await p.evaluate(() => window.__ss.start(2)); await until(() => window.__ss.ball().phase === 'guessing', 20000);
  console.log(w + 'x' + h, 'round(3)', JSON.stringify(await measure())); await p.screenshot({ path: `${OUT}/round3-${w}.png` });
  const bb = await p.evaluate(() => window.__ss.ball()); const wr = bb.order.find((i) => i !== bb.ballCup);
  await p.evaluate((i) => document.querySelector('#playfield .cup-wrap[data-id="' + i + '"]').dispatchEvent(new MouseEvent('click', { bubbles: true })), wr);
  await until(() => window.__ss.ball().phase === 'idle', 5000); await sleep(700); await p.screenshot({ path: `${OUT}/miss-${w}.png` });
  console.log(w + 'x' + h, 'miss scroll', await p.evaluate(() => document.documentElement.scrollHeight - innerHeight));
  await p.evaluate(() => window.__ss.start(5)); await until(() => window.__ss.ball().phase === 'guessing', 40000);
  console.log(w + 'x' + h, 'round(6)', JSON.stringify(await measure())); await p.screenshot({ path: `${OUT}/round6-${w}.png` });
  await ctx.close();
}
await b.close();
