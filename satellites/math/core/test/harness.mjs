/* CORE's browser harness. Copied from satellites/fathom/test/harness.mjs (serve,
 * open, reporter, centre, tap) with the catalog's two additions:
 *   - every request made after `load` is logged, so G2 (no network after first
 *     load) is a number a gate can assert (the shape of satellites/asterism/
 *     test/boot.mjs line 22)
 *   - the fourth size is a 1366x768 Chromebook with a keyboard and NO touch
 *     (CATALOG-PLAN D4)
 *
 * ⛔ Nothing here calls a handler to prove a control works. `centre` asks
 * elementFromPoint whether a thumb at the centre lands ON the control; `tap`
 * then presses that point with a synchronous down and up (under swiftshader a
 * touchscreen tap's two halves land a frame apart and read as a hold).
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname, normalize } from 'node:path';

const require = createRequire(import.meta.url);
export const puppeteer = require('/workspaces/lucid-winds/node_modules/puppeteer');
export const CORE = join(dirname(fileURLToPath(import.meta.url)), '..');
export const MATH = join(CORE, '..');

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json'
};

/* serves satellites/math/, so the demo at /core/demo/ loads ../core.js exactly as a game will */
export async function serve(root = MATH) {
  const server = createServer((req, res) => {
    const clean = decodeURIComponent(req.url.split('?')[0]);
    let p = join(root, normalize(clean).replace(/^(\.\.[/\\])+/, ''));
    if (!p.startsWith(root) || !existsSync(p)) { res.writeHead(404); res.end('no'); return; }
    if (statSync(p).isDirectory()) p = join(p, 'index.html');
    if (!existsSync(p)) { res.writeHead(404); res.end('no'); return; }
    res.writeHead(200, { 'content-type': MIME[extname(p)] || 'application/octet-stream' });
    res.end(readFileSync(p));
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  return { server, base: 'http://127.0.0.1:' + server.address().port, close: () => server.close() };
}

export const SIZES = [
  { name: '320x568', width: 320, height: 568, touch: true },
  { name: '375x667', width: 375, height: 667, touch: true },
  { name: '412x915', width: 412, height: 915, touch: true },
  { name: '1366x768 keyboard', width: 1366, height: 768, touch: false }
];

export async function launch() {
  return puppeteer.launch({
    headless: 'new', protocolTimeout: 120000,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--autoplay-policy=no-user-gesture-required']
  });
}

export async function open(base, { width = 375, height = 667, touch = true, browser = null,
  path = '/core/demo/index.html', ready = 'window.CORE_DEMO && window.CORE_DEMO.ready' } = {}) {
  const b = browser || await launch();
  const page = await b.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: touch ? 2 : 1, isMobile: touch, hasTouch: touch });
  const errors = [], requests = [];
  const state = { loaded: false };
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('request', r => { if (state.loaded) requests.push(r.url()); });
  /* ⛔ Chrome's console line for a failed load names no URL ("the server responded with a status of 404"), so
     the first run of the layout gate could say something was missing and not what. Every failed response is
     recorded by its address. */
  page.on('response', r => { if (r.status() >= 400) errors.push('http ' + r.status() + ' ' + r.url()); });
  await page.goto(base + path + '?probe=' + Math.floor(Math.random() * 1e9), { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(ready, { timeout: 30000 });
  state.loaded = true;
  return { browser: b, page, errors, requests, state };
}

export function reporter() {
  const fails = [];
  const say = (ok, line) => { console.log((ok ? '  ok    ' : '  FAIL  ') + line); if (!ok) fails.push(line); };
  return { fails, say };
}

/* where an element is, and whether a thumb landing at its centre lands ON it */
export const centre = (page, sel) => page.evaluate((sel) => {
  const el = document.querySelector(sel);
  if (!el) return null;
  el.scrollIntoView({ block: 'center', inline: 'center' });
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
  const top = document.elementFromPoint(o.clientX, o.clientY) || el;
  top.dispatchEvent(new PointerEvent('pointerdown', o));
  top.dispatchEvent(new PointerEvent('pointerup', o));
  /* ⛔ the thumb lands on whatever is on top, and that can be the path inside a
     button's icon: an SVG element has no click(). The activation bubbles to the
     nearest element that has one, exactly as a real tap's does. The first run of
     the layout gate died here on the settings gear. */
  let target = top;
  while (target && typeof target.click !== 'function') target = target.parentElement;
  (target || el).click();
}, sel);

export const sleep = ms => new Promise(r => setTimeout(r, ms));
