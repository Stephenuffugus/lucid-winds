// node tools/set-tests/look_r2.mjs <shotdir>   Three Sisters round two look: the painted deck on each of her three tables at 412x915
// (the lamp with a card pressed, the morning window, rain on the glass), the plain surfaces and the flat ink; writes the card
// rects and faces to <shotdir>/r2-cards.json for the pixel probe. Repo root on 8777.
import { createRequire } from 'node:module'; import { writeFileSync } from 'node:fs';
const require = createRequire('/workspaces/lucid-winds/x.js'); const puppeteer = require('puppeteer');
const OUT = process.argv[2]; const URL = 'http://127.0.0.1:8777/play/set.html?sstest=1';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] }); const out = {};
for (const [name, set, press] of [['lamp', { v: 2, inks: 'painted', table: 'lamp' }, true], ['morning', { v: 2, inks: 'painted', table: 'morning' }, false], ['rain', { v: 2, inks: 'painted', table: 'rain' }, false], ['plain', { v: 2, inks: 'painted', table: 'lamp', plain: true }, false], ['flat', { v: 2, inks: 'botanical', table: 'lamp' }, false]]) {
  const ctx = await b.createBrowserContext(); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e.message || e).slice(0, 140)));
  await p.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await p.evaluateOnNewDocument((s) => { try { localStorage.setItem('sws_dir_set', '1'); localStorage.setItem('lwfb_explained', '1'); localStorage.setItem('lw_set_display_v1', JSON.stringify(s)); } catch (e) {} }, set);
  await p.goto(URL, { waitUntil: 'networkidle0', timeout: 60000 }); await p.waitForSelector('.ts-card', { timeout: 20000 }); await sleep(500);
  if (press) { const els = await p.$$('.ts-card'); await els[0].tap(); await sleep(300); }
  const info = await p.evaluate(async () => { const imgs = [...document.querySelectorAll('.ts-table img')]; await Promise.all(imgs.map((i) => i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; })));
    return { broken: imgs.filter((i) => !i.naturalWidth).map((i) => i.src.split('/').slice(-2).join('/')), table: document.querySelector('.ts-table').className, bg: getComputedStyle(document.querySelector('.ts-table')).backgroundImage.split('/').slice(-1)[0],
      cards: [...document.querySelectorAll('.ts-card')].map((c) => { const r = c.getBoundingClientRect(); return { face: (c.className.match(/face-([abcd])/) || [])[1] || null, pressed: c.getAttribute('aria-pressed'), x: r.left, y: r.top, w: r.width, h: r.height, bg: getComputedStyle(c).backgroundImage.split('/').slice(-1)[0], seal: c.querySelector('.ts-seal').src.split('/').slice(-1)[0], glyph: c.querySelector('.ts-symbols img').src.split('/').slice(-2).join('/') }; }) }; });
  info.errs = errs; out[name] = info; await p.screenshot({ path: `${OUT}/r2-${name}-412.png` }); await ctx.close();
  console.log(`${name}: ${info.table} bg ${info.bg} broken ${JSON.stringify(info.broken)} errs ${JSON.stringify(errs)} faces ${info.cards.map((c) => c.face).join('')} seal ${info.cards[0].seal} glyph ${info.cards[0].glyph}`);
}
await b.close(); writeFileSync(`${OUT}/r2-cards.json`, JSON.stringify(out, null, 1));
