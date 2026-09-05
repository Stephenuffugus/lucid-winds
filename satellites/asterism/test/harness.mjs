/* What every browser gate needs, in one place: a static server that serves this
 * game folder AND the fleet files the page pulls from the site root, a browser,
 * and a tap that is a REAL pointer press on the element a thumb would land on.
 *
 * ⛔ Nothing here calls a handler. `tap` proves reachability with
 * elementFromPoint at the element's centre and then presses that point.
 * ⛔ Under swiftshader on two cores the page runs a few frames a second, so a
 * touchscreen tap's down and up land a frame apart and read as a HOLD. Every
 * tap dispatches pointerdown and pointerup synchronously.
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname, normalize } from 'node:path';

const require = createRequire(import.meta.url);
export const puppeteer = require('/workspaces/lucid-winds/node_modules/puppeteer');
export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = join(ROOT, '..', '..');

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json',
  '.png': 'image/png', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.css': 'text/css'
};
const FLEET = ['/music-unlocks.js', '/music-player.js', '/music-catalog.js', '/music-ladder.json'];

export async function serve() {
  const server = createServer((req, res) => {
    const clean = decodeURIComponent(req.url.split('?')[0]);
    const base = FLEET.indexOf(clean) >= 0 ? SITE : ROOT;
    let p = join(base, normalize(clean).replace(/^(\.\.[/\\])+/, ''));
    if (!p.startsWith(base) || !existsSync(p)) { res.writeHead(404); res.end('no'); return; }
    /* a directory is index.html, not an EISDIR that kills the whole gate: the
       manifest's start_url is "./" and the worker asks for it on install */
    if (statSync(p).isDirectory()) p = join(p, 'index.html');
    if (!existsSync(p)) { res.writeHead(404); res.end('no'); return; }
    res.writeHead(200, { 'content-type': MIME[extname(p)] || 'application/octet-stream' });
    res.end(readFileSync(p));
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  return { server, base: 'http://127.0.0.1:' + port, close: () => server.close() };
}

export async function open(base, opts = {}) {
  const { width = 375, height = 667, path = '/index.html' } = opts;
  const browser = await puppeteer.launch({
    headless: 'new', protocolTimeout: 120000,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu',
      '--autoplay-policy=no-user-gesture-required']
  });
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  /* the frozen sky. Every gate and every shot uses the same night over the same
     place, so a star is where the astronomy says it is and not where the clock
     happened to put it. A real boot never passes ?t=. */
  const q = opts.query === undefined ? '&t=2026-07-15T04:00:00Z' : opts.query;
  await page.goto(base + path + '?probe=' + Math.floor(Math.random() * 1e9) + q, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => window.ASTERISM_DEV && window.ASTERISM_DEV.ready() && window.ASTERISM_DEV.frames() > 2, { timeout: 30000 });
  return { browser, page, errors };
}

export function reporter() {
  const fails = [];
  const say = (ok, line) => { console.log((ok ? '  ok    ' : '  FAIL  ') + line); if (!ok) fails.push(line); };
  return { fails, say };
}

/* Where an element is, and whether a thumb landing at its centre lands ON it.
   It SCROLLS the element into view first, because a screen that scrolls is a
   screen a thumb scrolls: measuring a button that is below the fold and calling
   it unreachable is measuring the scroll position, not the layout. What is left
   after the scroll is the real question, and the gate still fails a button that
   is under something. */
export const centre = (page, sel) => page.evaluate((sel) => {
  const pre = document.querySelector(sel);
  if (pre && pre.scrollIntoView) pre.scrollIntoView({ block: 'center', inline: 'center' });
  const el = document.querySelector(sel);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width < 1 || r.height < 1) return null;
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  const top = document.elementFromPoint(cx, cy);
  return { x: cx, y: cy, w: r.width, h: r.height, onTop: !!top && (top === el || el.contains(top)) };
}, sel);

export const tap = (page, sel) => page.evaluate((sel) => {
  const el = document.querySelector(sel);
  if (!el) throw new Error('no element for ' + sel);
  const r = el.getBoundingClientRect();
  const o = { pointerId: 7, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true,
    clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 };
  el.dispatchEvent(new PointerEvent('pointerdown', o));
  el.dispatchEvent(new PointerEvent('pointerup', o));
  el.click();
}, sel);

/* a tap on the canvas at a screen point, the way a thumb does it */
export const tapAt = (page, x, y) => page.evaluate((x, y) => {
  const el = document.elementFromPoint(x, y);
  if (!el) throw new Error('nothing at ' + x + ',' + y + ' (viewport ' + window.innerWidth + 'x' + window.innerHeight + ')');
  const o = { pointerId: 8, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y };
  el.dispatchEvent(new PointerEvent('pointerdown', o));
  el.dispatchEvent(new PointerEvent('pointerup', o));
  return el.id || el.tagName;
}, x, y);

/* a real drag: down, a run of moves past the slop, then up */
export async function drag(page, x0, y0, x1, y1, steps = 8, holdMs = 0) {
  await page.evaluate((x, y) => {
    const el = document.elementFromPoint(x, y);
    el.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 9, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y }));
  }, x0, y0);
  for (let i = 1; i <= steps; i++) {
    const x = x0 + (x1 - x0) * i / steps, y = y0 + (y1 - y0) * i / steps;
    await page.evaluate((x, y) => {
      const el = document.elementFromPoint(x, y) || document.getElementById('board');
      el.dispatchEvent(new PointerEvent('pointermove', { pointerId: 9, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y }));
    }, x, y);
  }
  if (holdMs) await new Promise(r => setTimeout(r, holdMs));
}
export const dragEnd = (page, x, y) => page.evaluate((x, y) => {
  const el = document.elementFromPoint(x, y) || document.getElementById('board');
  el.dispatchEvent(new PointerEvent('pointerup', { pointerId: 9, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y }));
}, x, y);

export const sleep = ms => new Promise(r => setTimeout(r, ms));
export async function waitFrames(page, n) {
  const now = await page.evaluate(() => window.ASTERISM_DEV.frames());
  await page.waitForFunction((f) => window.ASTERISM_DEV.frames() > f, { timeout: 40000 }, now + n);
}

/* A real two finger pinch: two pointers down, both moving apart or together,
   both up. The page's own pinch handler is what turns this into a field of
   view; nothing here writes to the app. */
export async function pinch(page, cx, cy, fromGap, toGap, steps = 8) {
  const put = (type, id, x, y) => page.evaluate((type, id, x, y) => {
    const el = document.getElementById('sky');
    el.dispatchEvent(new PointerEvent(type, { pointerId: id, pointerType: 'touch',
      isPrimary: id === 31, bubbles: true, cancelable: true, clientX: x, clientY: y }));
  }, type, id, x, y);
  await put('pointerdown', 31, cx - fromGap / 2, cy);
  await put('pointerdown', 32, cx + fromGap / 2, cy);
  for (let i = 1; i <= steps; i++) {
    const g = fromGap + (toGap - fromGap) * i / steps;
    await put('pointermove', 31, cx - g / 2, cy);
    await put('pointermove', 32, cx + g / 2, cy);
  }
  await put('pointerup', 31, cx - toGap / 2, cy);
  await put('pointerup', 32, cx + toGap / 2, cy);
}
