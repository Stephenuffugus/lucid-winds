/* What every browser gate needs, in one place: a static server that serves this
 * game folder AND the fleet files the page pulls from the site root, a browser,
 * a tap that is a REAL pointer press on the element a thumb would land on, and
 * a FLICK that is a real run of pointer events on the canvas with real time
 * between them.
 *
 * ⛔ Nothing here calls a handler. `tap` proves reachability with
 * elementFromPoint at the element's centre and then presses that point.
 * ⛔ Under swiftshader on two cores the page runs a few frames a second, so a
 * touchscreen tap's down and up land a frame apart and read as a HOLD. Every
 * tap dispatches pointerdown and pointerup synchronously.
 * ⛔ A flick's samples carry REAL timestamps. The events are dispatched inside
 * ONE page.evaluate with a timer wait between points, so a round trip to the
 * driver never lands inside the release window and reads as a slow hand. The
 * game reads e.timeStamp, which is set when the event is constructed.
 *
 * Shape copied from satellites/fathom/test/harness.mjs.
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
  '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.css': 'text/css'
};
const FLEET = ['/music-unlocks.js', '/music-player.js', '/music-catalog.js', '/music-ladder.json'];

export async function serve() {
  const server = createServer((req, res) => {
    const clean = decodeURIComponent(req.url.split('?')[0]);
    const base = FLEET.indexOf(clean) >= 0 ? SITE : ROOT;
    let p = join(base, normalize(clean).replace(/^(\.\.[/\\])+/, ''));
    if (!p.startsWith(base) || !existsSync(p)) { res.writeHead(404); res.end('no'); return; }
    if (statSync(p).isDirectory()) p = join(p, 'index.html');
    if (!existsSync(p)) { res.writeHead(404); res.end('no'); return; }
    res.writeHead(200, { 'content-type': MIME[extname(p)] || 'application/octet-stream' });
    res.end(readFileSync(p));
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  return { server, base: 'http://127.0.0.1:' + port, close: () => server.close() };
}

export async function open(base, { width = 375, height = 667, path = '/index.html', dpr = 2, query = '' } = {}) {
  const browser = await puppeteer.launch({
    headless: 'new', protocolTimeout: 120000,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader',
      '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required']
  });
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: dpr, isMobile: true, hasTouch: true });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto(base + path + '?probe=' + Math.floor(Math.random() * 1e9) + query, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => window.GERPLUNK_DEV && window.GERPLUNK_DEV.frames() > 2, { timeout: 30000 });
  return { browser, page, errors };
}

export function reporter() {
  const fails = [];
  const say = (ok, line) => { console.log((ok ? '  ok    ' : '  FAIL  ') + line); if (!ok) fails.push(line); };
  return { fails, say };
}

/* where an element is, and whether a thumb landing at its centre lands ON it.
   ⛔ a hidden or unmounted element returns null, and the caller must treat
   null as a failure, never as "nothing to check". */
export const centre = (page, sel) => page.evaluate((sel) => {
  const el = document.querySelector(sel);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width < 1 || r.height < 1) return null;
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  const top = document.elementFromPoint(cx, cy);
  const inView = r.left >= 0 && r.top >= 0 && r.right <= window.innerWidth && r.bottom <= window.innerHeight;
  return { x: cx, y: cy, w: r.width, h: r.height, onTop: !!top && (top === el || el.contains(top)), inView };
}, sel);

export const tap = (page, sel) => page.evaluate((sel) => {
  const el = document.querySelector(sel);
  if (!el) throw new Error('no element for ' + sel);
  const r = el.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  const top = document.elementFromPoint(cx, cy);
  if (!top || !(top === el || el.contains(top))) throw new Error('a thumb at the centre of ' + sel + ' lands on ' + (top ? (top.id || top.tagName) : 'nothing'));
  const o = { pointerId: 7, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: cx, clientY: cy };
  top.dispatchEvent(new PointerEvent('pointerdown', o));
  top.dispatchEvent(new PointerEvent('pointerup', o));
  top.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, clientX: cx, clientY: cy }));
}, sel);

/* A FLICK. `pts` are {x, y, dt} in CSS px and milliseconds to wait before the
   point. Down at the first, moves through the rest, up at the last. Everything
   is dispatched on the element under the first point, which is what a thumb
   does, and the game captures the pointer from there. */
export const flick = (page, pts) => page.evaluate(async (pts) => {
  const el = document.elementFromPoint(pts[0].x, pts[0].y);
  if (!el) throw new Error('nothing at ' + pts[0].x + ',' + pts[0].y);
  const base = { pointerId: 11, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true };
  const ev = (type, p) => new PointerEvent(type, Object.assign({}, base, { clientX: p.x, clientY: p.y }));
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const t0 = performance.now();
  el.dispatchEvent(ev('pointerdown', pts[0]));
  for (let i = 1; i < pts.length; i++) {
    if (pts[i].dt) await wait(pts[i].dt);
    el.dispatchEvent(ev('pointermove', pts[i]));
  }
  el.dispatchEvent(ev('pointerup', pts[pts.length - 1]));
  return { el: el.id || el.tagName, ms: performance.now() - t0 };
}, pts);

/* a stroke across and up the water: `arc` px over `ms`, rising at `rise` (0
   flat across, 1 straight up), with a `hook` at the end. The same shape as the
   sim's strokeOf, in real pixels, from a start the thumb can reach. */
export function stroke({ x0, y0, arc = 320, ms = 170, rise = 0.55, hook = 0.7, n = 14, plantPx = 0, plantMs = 420 }) {
  const across = Math.sqrt(Math.max(0, 1 - rise * rise));
  const ux = across, uy = -rise, px = -uy, py = ux;
  const raw = [];
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1);
    const w = Math.max(0, u - 0.6) / 0.4;
    const h = hook * w * w * 0.30;
    raw.push({ x: ux * u + px * h, y: uy * u + py * h });
  }
  let L = 0;
  for (let i = 1; i < n; i++) L += Math.hypot(raw[i].x - raw[i - 1].x, raw[i].y - raw[i - 1].y);
  const k = arc / L, out = [];
  if (plantPx) {
    const steps = 10;
    for (let i = 0; i < steps; i++) out.push({ x: x0 - plantPx + plantPx * (i / steps), y: y0, dt: i ? plantMs / steps : 0 });
  }
  for (let i = 0; i < n; i++) out.push({ x: x0 + raw[i].x * k, y: y0 + raw[i].y * k, dt: (i === 0 && !plantPx) ? 0 : ms / (n - 1) });
  return out;
}

export const sleep = ms => new Promise(r => setTimeout(r, ms));
export const waitFrames = (page, n) => page.evaluate((n) => new Promise(res => {
  const at = window.GERPLUNK_DEV.frames() + n;
  const poll = () => (window.GERPLUNK_DEV.frames() >= at ? res(true) : setTimeout(poll, 20));
  poll();
}), n);
