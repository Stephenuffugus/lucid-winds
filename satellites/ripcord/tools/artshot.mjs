/* artshot — photographs the workshop with and without painted art, so the
 * picture chips can be READ rather than asserted. Also measures the two things
 * that decide whether art helps or hurts: chip height (48 floor) and how many
 * chips fit the rail.
 *
 *   node tools/artshot.mjs [outDir]
 */
import puppeteer from '/workspaces/lucid-winds/node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import { fileURLToPath } from 'url';
import path from 'path'; import fs from 'fs'; import http from 'http';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2] || path.join(ROOT, 'docs', 'shots-art');
fs.mkdirSync(OUT, { recursive: true });
const wait = ms => new Promise(r => setTimeout(r, ms));
const TYPES = { '.html':'text/html', '.js':'text/javascript', '.json':'application/json',
                '.webmanifest':'application/manifest+json', '.png':'image/png',
                '.webp':'image/webp' };
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
  const f = path.join(ROOT, rel);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
    res.writeHead(404); res.end('no'); return;
  }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const URL_BASE = 'http://127.0.0.1:' + server.address().port + '/index.html';

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-dev-shm-usage'] });
const page = await browser.newPage();
page.on('pageerror', e => console.log('  PAGEERROR: ' + e.message));
page.on('console', m => { if (m.type() === 'error') console.log('  CONSOLE: ' + m.text()); });
await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

await page.goto(URL_BASE, { waitUntil: 'load' }); await wait(700);
await page.evaluate(() => { const d = document.querySelector('#howto [data-close]'); if (d) d.click(); });
await wait(400);
// see everything, not just the ten you start with
await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('ripcord.save.v1') || '{}');
  s.rung = 24; s.facing = 24; s.unlocked = [];
  localStorage.setItem('ripcord.save.v1', JSON.stringify(s));
});
await page.reload({ waitUntil: 'load' }); await wait(800);
await page.evaluate(() => { document.getElementById('mPlay').click(); });
await wait(500);
await page.evaluate(() => { const b = document.getElementById('mShop') || document.getElementById('bShop');
                            if (b) b.click(); });
await wait(400);
// open the workshop by whatever control exists, then the Build accordion
const opened = await page.evaluate(() => {
  const btns = [...document.querySelectorAll('button')];
  const w = btns.find(b => /workshop|build/i.test(b.textContent || '') );
  if (w) { w.click(); return w.textContent.trim().slice(0, 24); }
  return null;
});
await wait(600);
await page.evaluate(() => {
  const d = [...document.querySelectorAll('#sheet details, details')];
  d.forEach((x, i) => { if (i === 0) x.open = true; });
  const rf = [...document.querySelectorAll('.rf')].find(b => /all/i.test(b.textContent));
  if (rf) rf.click();
});
await wait(700);

const m = await page.evaluate(() => {
  const chips = [...document.querySelectorAll('.chip.art')];
  const plain = [...document.querySelectorAll('.chip:not(.art)')];
  const rail = document.querySelector('.rail.pics') || document.querySelector('.rail');
  const rr = rail ? rail.getBoundingClientRect() : null;
  const heights = [...new Set(chips.map(c => Math.round(c.getBoundingClientRect().height)))];
  const widths = chips.map(c => c.getBoundingClientRect().width).sort((a,b)=>a-b);
  const names = [...document.querySelectorAll('.chip.art .nm')].map(n => ({
    t: n.textContent, w: Math.round(n.getBoundingClientRect().width),
    clipped: n.scrollWidth > n.clientWidth + 1 }));
  return {
    artChips: chips.length, plainChips: plain.length,
    heights, minW: Math.round(widths[0] || 0),
    medW: Math.round(widths[Math.floor(widths.length/2)] || 0),
    maxW: Math.round(widths[widths.length-1] || 0),
    railW: rr ? Math.round(rr.width) : 0,
    fit: rr && widths.length ? +(rr.width / (widths[Math.floor(widths.length/2)] + 8)).toFixed(1) : 0,
    clipped: names.filter(n => n.clipped).map(n => n.t),
    imgs: [...document.querySelectorAll('.chip.art .pic')].length,
    /* ⛔ loading="lazy" means an offscreen picture legitimately has not loaded,
       which is not the same as broken. Only judge the ones actually on screen. */
    broken: [...document.querySelectorAll('.chip.art .pic')].filter(i => {
      const r = i.getBoundingClientRect();
      const onScreen = r.right > 0 && r.left < innerWidth && r.bottom > 0 && r.top < innerHeight;
      return onScreen && (!i.complete || i.naturalWidth === 0);
    }).length,
    lazyPending: [...document.querySelectorAll('.chip.art .pic')].filter(i => !i.complete).length,
  };
});
console.log('  picture chips ' + m.artChips + ', plain chips ' + m.plainChips +
            ', images ' + m.imgs + ' (' + m.broken + ' broken on screen, ' + m.lazyPending + ' still lazy)');
console.log('  chip heights ' + JSON.stringify(m.heights) + '  widths min/med/max ' +
            m.minW + '/' + m.medW + '/' + m.maxW);
console.log('  rail ' + m.railW + 'px fits ' + m.fit + ' chips');
if (m.clipped.length) console.log('  NAMES CLIPPED: ' + m.clipped.join(', '));
if (m.heights.some(h => h < 48)) console.log('  ** A CHIP IS UNDER 48px **');

await page.screenshot({ path: path.join(OUT, 'workshop-375.png') });
await page.setViewport({ width: 320, height: 568, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await wait(500);
await page.screenshot({ path: path.join(OUT, 'workshop-320.png') });
console.log('  shots in ' + OUT);
await browser.close(); server.close();
