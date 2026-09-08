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
  await page.evaluate(() => window.BB.start('free'));
  await page.waitForFunction("window.BB.state.phase==='aim'", { timeout: 4000 });
  await sleep(450);
  await shoot(page, 'lane-' + tag);

  /* a firm flick on the left corner's line: 2500 px/s at 15 degrees, 90 ms */
  const a = -15 * Math.PI / 180, ux = Math.sin(a), uy = -Math.cos(a), s0 = css(270, 905), d = 2500 * 0.09, n = 10;
  const pts = [];
  for (let i = 0; i < n; i++) pts.push({ x: s0.x + ux * d * i / (n - 1), y: s0.y + uy * d * i / (n - 1), dt: i ? 10 : 0 });
  const el = await page.evaluate(async (pts) => {
    const el = document.elementFromPoint(pts[0].x, pts[0].y);
    const base = { pointerId: 7, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true };
    const ev = (type, p) => new PointerEvent(type, Object.assign({}, base, { clientX: p.x, clientY: p.y }));
    const wait = ms => new Promise(r => setTimeout(r, ms));
    el.dispatchEvent(ev('pointerdown', pts[0]));
    for (let i = 1; i < pts.length; i++) { await wait(pts[i].dt); el.dispatchEvent(ev('pointermove', pts[i])); }
    el.dispatchEvent(ev('pointerup', pts[pts.length - 1]));
    return el.id || el.tagName;
  }, pts);
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
