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
  '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.css': 'text/css'
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

export async function open(base, { width = 375, height = 667, path = '/index.html' } = {}) {
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
  await page.goto(base + path + '?probe=' + Math.floor(Math.random() * 1e9), { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => window.FATHOM_DEV && window.FATHOM_DEV.frames() > 2, { timeout: 30000 });
  return { browser, page, errors };
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
/* ------------------------------------------------------- the steered thumb
   A finger goes down on the canvas, moves once past the slop so the floating
   stick is born where it landed, and from then on it is AIMED: every step
   dispatches one pointermove that points the stick from where the player is to
   where the player wants to be. That is what a hand on a floating stick does.
   Nothing here writes to the sim; the only thing that reaches the game is a
   pointer event on the canvas. */
export async function stickDown(page, home) {
  await page.evaluate((x, y) => {
    const el = document.elementFromPoint(x, y);
    el.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 21, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y }));
  }, home.x, home.y);
  await page.evaluate((x, y) => {
    document.getElementById('board').dispatchEvent(new PointerEvent('pointermove', { pointerId: 21, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x + 20, clientY: y }));
  }, home.x, home.y);
  return page.evaluate(() => !!window.FATHOM_DEV.stick());
}
export function stickUp(page, home) {
  return page.evaluate((x, y) => {
    document.getElementById('board').dispatchEvent(new PointerEvent('pointerup', { pointerId: 21, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y }));
  }, home.x, home.y);
}
/* one steer. aim is { tx, ty } in tiles, or { lurker: true } for the nearest
   thing in the dark. Returns what the page believes after the move. */
export const steerStep = (page, home, aim) => page.evaluate((home, aim) => {
  const p = window.FATHOM_DEV.player();
  const tile = window.FATHOM_DEV.tile();
  const s = window.FATHOM_DEV.state();
  let gx, gy;
  if (aim.lurker) {
    let best = null, bd = 1e9;
    for (const L of (s.lurkers || [])) {
      const d = Math.hypot(L[0] - p.x, L[1] - p.y);
      if (d < bd) { bd = d; best = L; }
    }
    if (!best) return { d: -1, over: s.over, frames: window.FATHOM_DEV.frames(), stones: s.stones, screen: window.FATHOM_DEV.screen(), noAim: true };
    gx = best[0]; gy = best[1];
  } else {
    gx = aim.tx * tile + tile / 2; gy = aim.ty * tile + tile / 2;
  }
  const dx = gx - p.x, dy = gy - p.y, d = Math.hypot(dx, dy) || 1;
  document.getElementById('board').dispatchEvent(new PointerEvent('pointermove', {
    pointerId: 21, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true,
    clientX: home.x + dx / d * 70, clientY: home.y + dy / d * 70
  }));
  return { d, over: s.over, frames: window.FATHOM_DEV.frames(), stones: s.stones, screen: window.FATHOM_DEV.screen() };
}, home, aim);

export const nextFrame = (page, was) =>
  page.waitForFunction((f) => window.FATHOM_DEV.frames() > f, { timeout: 30000 }, was).catch(() => {});

/* walk the shortest route to the exit. Returns how it went, never throws. */
export async function walkRoute(page, home, route, opts = {}) {
  const max = opts.max || 2600;
  let node = 1, iters = 0, stuck = 0, lastD = 1e9, threw = 0;
  while (node < route.length && iters < max) {
    iters++;
    const st = await steerStep(page, home, { tx: route[node][0], ty: route[node][1] });
    if (st.over || st.screen !== 'play') return { done: st.over === 'clear', over: st.over, iters, node, threw, screen: st.screen };
    if (st.d < 7) { node++; stuck = 0; lastD = 1e9; continue; }
    if (st.d > lastD - 0.05) stuck++; else stuck = 0;
    lastD = st.d;
    if (opts.throwEvery && iters % opts.throwEvery === 0 && st.stones > 1) {
      const at = await page.evaluate(() => {
        const p = window.FATHOM_DEV.player(); const s = window.FATHOM_DEV.screenOf(p.x, p.y);
        return { x: Math.max(24, Math.min(window.innerWidth - 24, s.x)), y: Math.max(30, Math.min(window.innerHeight - 200, s.y - 90)) };
      });
      await tapAt(page, at.x, at.y);
      threw++;
    }
    if (stuck > 70) return { done: false, stuckAt: route[node], iters, node, threw };
    await nextFrame(page, st.frames);
  }
  return { done: false, ranOut: true, iters, node, threw };
}
