// node tools/tally-tests/look.mjs <url> <outdir> <case...>   one browser, real taps, DPR 2 shots
// cases: play:<skin>:<pal>:<w>x<h>  (a five bead level, seeded)   shop:<w>x<h>   preview:<palId>:<w>x<h>
import { createRequire } from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js');
const puppeteer = require('puppeteer');
const [URL, OUT, ...cases] = process.argv.slice(2);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
for (const c of cases) {
  const parts = c.split(':'); const [w, h] = parts[parts.length - 1].split('x').map(Number);
  const skin = parts[0] === 'play' ? parts[1] : 'abacus', pal = parts[0] === 'play' ? parts[2] : 'pip';
  const seed = { seenIntro: true, level: 3, skin, pal, owned: ['abacus', 'twilight', 'sunrise', skin], ownedPals: ['pip', 'hoot', pal] };
  const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await p.evaluateOnNewDocument((s) => { try { localStorage.setItem('tally:v1', s); } catch (e) {} }, JSON.stringify(seed));
  await p.goto(URL, { waitUntil: 'networkidle0', timeout: 60000 }); await p.waitForSelector('.mv-beacon-num'); await sleep(900);
  const tapSel = async (sel, text) => {
    const r = await p.evaluate((sel, text) => { const e = [...document.querySelectorAll(sel)].find((n) => !text || n.textContent.includes(text)); if (!e) return null; e.scrollIntoView({ block: 'center' }); const q = e.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }, sel, text || '');
    if (!r) throw new Error('no ' + sel + ' ' + (text || '')); await p.touchscreen.tap(r.x, r.y); await sleep(700);
  };
  if (parts[0] === 'shop' || parts[0] === 'preview') await tapSel('.mv-navbtn', 'Shop');
  if (parts[0] === 'preview') await tapSel('.mv-skinname', ({ flame: 'Flare' })[parts[1]] || parts[1]);
  await sleep(500);
  await p.screenshot({ path: `${OUT}/${c.replace(/:/g, '_')}.png` });
  await ctx.close();
}
await b.close();
console.log('shots in', OUT);
