/* What every Shutterbug browser gate needs, in one place (BUILD-PLAN.md T0.1, section 5.6).
 *
 * ONE static server for every gate and every shot, rooted at the REPO ROOT, so `/satellites/shutterbug/`,
 * `/music-unlocks.js` and the three fleet files it loads resolve at their real paths, and `location.pathname`, the
 * manifest scope, the share link and `document.referrer` are the same here as under `shoot.mjs` and on the host.
 * Plus a synthetic `/portal/` page (the exit journeys) and a wrapper page that iframes the game (journey C).
 * `SB_PAGE=<file>` makes the server answer `/satellites/shutterbug/` and `.../index.html` with another file: that is
 * how `tools/redwatch.js` serves a mutant copy to a browser gate.
 *
 * Real input only. `tap` proves reachability with elementFromPoint at the element's centre and then presses that
 * point with a REAL touch through the DevTools protocol (`page.touchscreen`), never `el.click()` and never a handler
 * call. A touch held across sim steps is `press(x, y)`, which returns the finger: `finger.move(x, y)`,
 * `finger.end()`. Two presses are two fingers (Puppeteer 25 tracks each touch by its own handle), which is how the
 * strip is proven under a thumb.
 *
 * Time is SIM FRAMES, never wall milliseconds. Under swiftshader on two cores the page draws a few frames a second
 * and the loop caps four steps a frame, so a touch held for 200 ms is an unpredictable number of steps. Gates either
 * hold the loop (`SB_DEV.hold(true)`) and advance it with `SB_DEV.step(n)` between real events, or poll
 * `SB_DEV.frames()` (`waitFrames`). One Chrome at a time on this box. */
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname, normalize, sep } from 'node:path';

export const GAME = join(dirname(fileURLToPath(import.meta.url)), '..');      // satellites/shutterbug
export const SITE = join(GAME, '..', '..');                                    // the repo root
export const PUPPETEER_DIR = process.env.SB_PUPPETEER_DIR || '/workspaces/sws-tools';
const require = createRequire(join(PUPPETEER_DIR, 'package.json'));
export const puppeteer = require('puppeteer');

export const GAME_PATH = '/satellites/shutterbug/';
export const SIZES = { phone: [412, 915], iphone: [390, 844], narrow: [360, 780], se: [320, 568] };

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.png': 'image/png', '.webmanifest': 'application/manifest+json',
  '.css': 'text/css', '.txt': 'text/plain', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml'
};

const PORTAL = `<!doctype html><html><head><meta charset="utf-8"><title>portal (test)</title></head>
<body><h1>Sky Wolf Studio portal (synthetic, test server only)</h1>
<a id="go" href="${GAME_PATH}" style="display:block;width:200px;height:60px">Shutterbug</a></body></html>`;

/* Journey C: the game inside an iframe; every message the frame posts is recorded with the time it arrived. */
const WRAP = `<!doctype html><html><head><meta charset="utf-8"><title>wrapper (test)</title>
<meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0">
<script>window.__msgs = []; addEventListener('message', function (e) { window.__msgs.push({ data: e.data, t: performance.now(), state: document.readyState }); });</script>
<iframe id="game" src="${GAME_PATH}?probe=wrap" style="border:0;width:100vw;height:100vh"></iframe></body></html>`;

export async function serve() {
  const requests = [];
  const server = createServer((req, res) => {
    let clean;
    try { clean = decodeURIComponent(req.url.split('?')[0]); } catch (e) { res.writeHead(400); res.end('bad'); return; }
    requests.push(req.url);
    if (clean === '/portal/' || clean === '/portal/index.html') {
      res.writeHead(200, { 'content-type': MIME['.html'] }); res.end(PORTAL); return;
    }
    if (clean === '/__wrap.html') { res.writeHead(200, { 'content-type': MIME['.html'] }); res.end(WRAP); return; }
    if (process.env.SB_PAGE && (clean === GAME_PATH || clean === GAME_PATH + 'index.html')) {
      res.writeHead(200, { 'content-type': MIME['.html'], 'cache-control': 'no-store' });
      res.end(readFileSync(process.env.SB_PAGE)); return;
    }
    /* SB_SW answers sw.js with another file (the pwa gate's update path, redwatch's sw.js mutants) */
    if (process.env.SB_SW && clean === GAME_PATH + 'sw.js') {
      res.writeHead(200, { 'content-type': 'text/javascript', 'cache-control': 'no-store' });
      res.end(readFileSync(process.env.SB_SW)); return;
    }
    /* SB_MAKE answers fixtures/make.html with another file (redwatch's make.html mutants) */
    if (process.env.SB_MAKE && clean === GAME_PATH + 'fixtures/make.html') {
      res.writeHead(200, { 'content-type': MIME['.html'], 'cache-control': 'no-store' });
      res.end(readFileSync(process.env.SB_MAKE)); return;
    }
    let p = normalize(join(SITE, clean));
    if (!(p + sep).startsWith(SITE + sep) && p !== SITE) { res.writeHead(403); res.end('no'); return; }
    if (existsSync(p) && statSync(p).isDirectory()) p = join(p, 'index.html');
    if (!existsSync(p)) { res.writeHead(404); res.end('no'); return; }
    res.writeHead(200, { 'content-type': MIME[extname(p)] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(readFileSync(p));
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  return { server, requests, base: 'http://localhost:' + port, close: () => new Promise(r => server.close(r)) };
}

/* timeout: the first launch after a box restart reads Chrome off a cold disk, and the sb-m1-1 full check's boot gate
   (the first browser gate) timed out at puppeteer's default 30 s while every later gate launched in seconds. */
export async function launch() {
  return puppeteer.launch({
    headless: true, protocolTimeout: 180000, timeout: 120000,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader',
      '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required']
  });
}

/* A page at a phone size with touch on. `errors` collects page errors and console errors. Never waits on the game:
   call `ready(page)` once the page has SB_DEV. */
export async function newPage(browser, { width = 412, height = 915, dpr = 3, touch = true } = {}) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: dpr, isMobile: touch, hasTouch: touch });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  return { page, errors };
}

export async function gotoGame(page, base, query = '') {
  const q = '?probe=' + Math.floor(Math.random() * 1e9) + (query ? '&' + query.replace(/^[?&]/, '') : '');
  await page.goto(base + GAME_PATH + q, { waitUntil: 'load', timeout: 60000 });
}

export async function ready(page, opts = {}) {
  await page.waitForFunction(() => window.SB_DEV && typeof window.SB_DEV.screen === 'function', { timeout: 30000 });
  /* the develop reveal (T0.14) has its own gate; every other gate goes from the sample tap straight to play */
  if (!opts.reveal) await page.evaluate(() => window.SB_DEV.revealSkip && window.SB_DEV.revealSkip(true));
}

export function reporter(name) {
  const fails = [];
  const say = (ok, line) => { console.log((ok ? '  ok    ' : '  FAIL  ') + line); if (!ok) fails.push(line); return ok; };
  const finish = () => {
    if (fails.length) { console.log('\n' + name + ' FAILED: ' + fails.length + '\n' + fails.map(f => '  ' + f).join('\n')); process.exit(1); }
    console.log(name + ' OK');
  };
  return { fails, say, finish };
}

/* Where an element is, and whether a thumb landing at its centre lands ON it. A hidden or unmounted element returns
   null, and the caller treats null as a failure, never as "nothing to check". */
export const centre = (page, sel) => page.evaluate((sel) => {
  const el = document.querySelector(sel);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width < 1 || r.height < 1) return null;
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  const top = document.elementFromPoint(cx, cy);
  return { x: cx, y: cy, w: r.width, h: r.height, left: r.left, top: r.top, right: r.right, bottom: r.bottom,
    onTop: !!top && (top === el || el.contains(top)), topName: top ? (top.id || top.className || top.tagName) : 'nothing',
    inView: r.left >= 0 && r.top >= 0 && r.right <= innerWidth + 0.5 && r.bottom <= innerHeight + 0.5 };
}, sel);

/* A real tap at the element's centre, after proving a thumb there lands on it. */
export async function tap(page, sel) {
  const c = await centre(page, sel);
  if (!c) throw new Error('no visible element for ' + sel);
  if (!c.onTop) throw new Error('a thumb at the centre of ' + sel + ' lands on ' + c.topName);
  await page.touchscreen.tap(c.x, c.y);
  return c;
}

/* Title and Share left the strip for the pause card (Stephen's note 3 of 31 Oct, QUESTIONS Q94): a real tap on the room's
   Pause when the room runs (the card may already be open: a sheet's Close comes back to it), then a real tap on the
   card's button. `leaveRoom` ends on the title, `openSheet` on the share sheet opened from the card. */
export async function fromPause(page, sel) {
  if (await page.evaluate(() => window.SB_DEV.screen()) === 'play') await tap(page, '#pause');
  return tap(page, sel);
}
export const leaveRoom = page => fromPause(page, '#pausetitle');
export const openSheet = page => fromPause(page, '#pauseshare');

/* A finger put down at (x, y) and left down: returns Puppeteer's TouchHandle (`move`, `end`). */
export const press = (page, x, y) => page.touchscreen.touchStart(x, y);

export async function pressEl(page, sel, dx = 0) {
  const c = await centre(page, sel);
  if (!c) throw new Error('no visible element for ' + sel);
  if (!c.onTop) throw new Error('a thumb at the centre of ' + sel + ' lands on ' + c.topName);
  return press(page, c.x + dx, c.y);
}

/* With the loop held: run exactly n sim steps, each sampling the real input latch. */
export const step = (page, n) => page.evaluate((n) => window.SB_DEV.step(n), n);

/* With the loop running: resolve once SB_DEV.frames() has advanced by n (polled, never a timer standing in). */
export async function waitFrames(page, n, timeout = 120000) {
  const at = await page.evaluate(() => window.SB_DEV.frames());
  await page.waitForFunction((at) => window.SB_DEV.frames() >= at, { timeout, polling: 20 }, at + n);
}

/* Hold a control with a real touch for `frames` sim frames of the RUNNING loop, then lift. */
export async function holdFrames(page, sel, frames) {
  const f = await pressEl(page, sel);
  await waitFrames(page, frames);
  await f.end();
}

export const sleep = ms => new Promise(r => setTimeout(r, ms));
