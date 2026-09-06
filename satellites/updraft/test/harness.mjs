/* What every Updraft browser gate needs: a static server for this folder and
 * the fleet files at the site root, a browser, and a THUMB that is real pointer
 * events on the canvas with real timing.
 *
 * ⛔ Nothing here calls a handler. `tap` proves reachability with
 * elementFromPoint at the element's centre and presses that point.
 * ⛔ Under swiftshader on two cores a touchscreen tap's down and up land a
 * frame apart and read as a HOLD, so a tap dispatches down and up together,
 * and a HOLD is an explicit down, moves, up with wall clock timing.
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
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.css': 'text/css' };
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
  return { server, base: 'http://127.0.0.1:' + server.address().port, close: () => server.close() };
}
export async function open(base, { width = 375, height = 667, path = '/index.html', query = '' } = {}) {
  const browser = await puppeteer.launch({
    headless: 'new', protocolTimeout: 120000,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required']
  });
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto(base + path + '?probe=' + Math.floor(Math.random() * 1e9) + query, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => window.UPDRAFT_DEV && window.UPDRAFT_DEV.frames() > 2, { timeout: 30000 });
  return { browser, page, errors };
}
export function reporter() {
  const fails = [];
  const say = (ok, line) => { console.log((ok ? '  ok    ' : '  FAIL  ') + line); if (!ok) fails.push(line); };
  return { fails, say };
}
export const centre = (page, sel) => page.evaluate((sel) => {
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
  const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  if (!top || !(top === el || el.contains(top))) throw new Error(sel + ' is not on top at its centre');
  const o = { pointerId: 7, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 };
  el.dispatchEvent(new PointerEvent('pointerdown', o));
  el.dispatchEvent(new PointerEvent('pointerup', o));
  el.click();
}, sel);
/* the thumb on the canvas: explicit down, moves and up, each on the element a
   thumb would land on, with wall clock time between them */
const ev = (page, type, x, y, id = 9) => page.evaluate((type, x, y, id) => {
  const el = document.elementFromPoint(x, y) || document.getElementById('board');
  el.dispatchEvent(new PointerEvent(type, { pointerId: id, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y }));
  return el.id || el.tagName;
}, type, x, y, id);
export const thumbDown = (page, x, y) => ev(page, 'pointerdown', x, y);
export const thumbMove = (page, x, y) => ev(page, 'pointermove', x, y);
export const thumbUp = (page, x, y) => ev(page, 'pointerup', x, y);
export const thumbCancel = (page, x, y) => ev(page, 'pointercancel', x, y);
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export const simT = page => page.evaluate(() => { const s = window.UPDRAFT_DEV.state(); return s ? s.t : -1; });
/* wait until the SIM clock passes t (never the wall clock: this rig runs at a few frames a second) */
export const untilSim = (page, t, timeout = 60000) => page.waitForFunction((t) => { const s = window.UPDRAFT_DEV.state(); return s && s.t >= t; }, { timeout }, t);
export async function waitFrames(page, n) {
  const now = await page.evaluate(() => window.UPDRAFT_DEV.frames());
  await page.waitForFunction((f) => window.UPDRAFT_DEV.frames() > f, { timeout: 40000 }, now + n);
}
/* a hold/release/lean script keyed on SIM time, driven with real pointer
   events from a home point. lean is turned into a slide of lean / SLIDE_GAIN px. */
export async function flyScript(page, home, script, T, onSample) {
  let i = 0, down = false, lastLean = 0;
  const gain = 90;
  for (;;) {
    const t = await simT(page);
    if (t < 0 || t >= T) break;
    while (i < script.length && script[i].t <= t) {
      const s = script[i]; i++;
      if (s.hold && !down) { await thumbDown(page, home.x, home.y); down = true; lastLean = 0; }
      if (s.hold && down && s.lean !== lastLean) { await thumbMove(page, home.x + s.lean * gain, home.y); lastLean = s.lean; }
      if (!s.hold && down) { await thumbUp(page, home.x + lastLean * gain, home.y); down = false; lastLean = 0; }
    }
    if (onSample) await onSample(t);
    await waitFrames(page, 1);
  }
  if (down) await thumbUp(page, home.x + lastLean * gain, home.y);
}
