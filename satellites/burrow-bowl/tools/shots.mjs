#!/usr/bin/env node
/* The shots, from where the PLAYER stands (2026-09-08).
 *
 *   node satellites/burrow-bowl/tools/shots.mjs            all, into docs/shots/
 *   node satellites/burrow-bowl/tools/shots.mjs hundred    just the ones whose name holds that
 *
 * Runs under the fleet lock like every browser: timeout 900 flock -w 1800
 * /tmp/sws-gate.lock node satellites/burrow-bowl/tools/shots.mjs
 *
 * Every throw is a real pointer drag on the element under the thumb, the same
 * shape check.mjs B8 uses. The 100 is shot the frame the verdict lands (phase
 * beat, the ONE HUNDRED line still on the lane).
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GAME = path.resolve(HERE, '..');
const ROOT = path.resolve(GAME, '../..');
const OUT = path.join(GAME, 'docs', 'shots');
fs.mkdirSync(OUT, { recursive: true });
const only = process.argv[2] || '';
const LIMIT = 200 * 1024;

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('no'); return; }
  res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, r));
const URL_ = 'http://127.0.0.1:' + server.address().port + '/satellites/burrow-bowl/?bb_test=1';
const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const sleep = ms => new Promise(r => setTimeout(r, ms));

const SIZES = { tall: { width: 412, height: 915 }, mid: { width: 375, height: 667 } };

async function shoot(page, name) {
  if (only && name.indexOf(only) < 0) return;
  let buf = await page.screenshot({ type: 'png' });
  let ext = 'png';
  if (buf.length > LIMIT) { buf = await page.screenshot({ type: 'jpeg', quality: 82 }); ext = 'jpg'; }
  const p = path.join(OUT, name + '.' + ext);
  fs.writeFileSync(p, buf);
  console.log('  ' + (name + '.' + ext).padEnd(24) + String(Math.round(buf.length / 1024)).padStart(4) + ' KB' + (buf.length > LIMIT ? '   OVER THE 200 KB LIMIT' : ''));
}

for (const [tag, size] of Object.entries(SIZES)) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport({ width: size.width, height: size.height, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.bringToFront();
  await page.goto(URL_, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { localStorage.clear(); localStorage.setItem('sws_dev_ok', '1'); });
  await page.goto(URL_, { waitUntil: 'load' });
  await sleep(500);
  const scale = size.width / 540, top = (size.height - 960 * scale) / 2;
  const css = (sx, sy) => ({ x: sx * scale, y: top + sy * scale });

  await shoot(page, 'title-' + tag);
  /* the route in is the player's, by real taps (the fleet's music card is up at
     boot and docks over the rack; it folds on the first tap outside it) */
  const tapId = async id => {
    const c = await page.$eval('#' + id, e => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    await page.touchscreen.tap(c.x, c.y);
  };
  await tapId('b-play');
  await page.waitForFunction("document.getElementById('s-how').classList.contains('on')", { timeout: 4000 }); await sleep(350);
  await tapId('how-go');
  await page.waitForFunction("window.BB.state.phase==='aim'", { timeout: 4000 });
  await sleep(450);
  await shoot(page, 'lane-' + tag);

  /* a firm flick on the left corner's line: 2500 px/s at 15 degrees, 90 ms.
     Points are placed by the clock (where a thumb at that speed is at the
     moment each is dispatched), the shape check.mjs B8 uses, so a late timer
     on a loaded box never changes the speed the game reads. */
  const a = -15 * Math.PI / 180, g = { ux: Math.sin(a), uy: -Math.cos(a), start: css(270, 905), speed: 2500, ms: 90 };
  const el = await page.evaluate(async (g) => {
    const el = document.elementFromPoint(g.start.x, g.start.y);
    const base = { pointerId: 7, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true };
    const ev = (type, x, y) => new PointerEvent(type, Object.assign({}, base, { clientX: x, clientY: y }));
    const wait = ms => new Promise(r => setTimeout(r, ms));
    let x = g.start.x, y = g.start.y; const t0 = performance.now();
    el.dispatchEvent(ev('pointerdown', x, y));
    for (;;) {
      await wait(10);
      const t = performance.now() - t0;
      x = g.start.x + g.ux * g.speed * t / 1000; y = g.start.y + g.uy * g.speed * t / 1000;
      el.dispatchEvent(ev('pointermove', x, y));
      if (t >= g.ms) break;
    }
    el.dispatchEvent(ev('pointerup', x, y));
    return el.id || el.tagName;
  }, g);
  await page.waitForFunction("window.BB.state.phase==='fly'", { timeout: 20000 });
  await shoot(page, 'hundred-flight-' + tag);
  await page.waitForFunction("window.BB.state.phase==='beat'", { timeout: 45000 });
  const v = await page.evaluate(() => ({ out: window.BB.state.out, read: window.BB.lastRead() }));
  console.log('  ' + tag + ': thumb on ' + el + ', read ' + Math.round(-v.read.vy) + ' px/s, verdict ' + v.out.kind + ' ' + v.out.pts);
  await shoot(page, 'hundred-' + tag);
  await ctx.close();
}
await browser.close();
server.close();
