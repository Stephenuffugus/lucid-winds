/* Everything a Marrowdeep browser gate needs, in one place: a static server that
 * serves this game folder AND the fleet files the page pulls from the site root,
 * a browser sized like a phone, and a tap that is a REAL pointer press on the
 * element a thumb would land on.
 *
 * ⛔ Nothing here calls a handler. `tap` finds what is under the thumb with
 * document.elementFromPoint at the element's centre and presses THAT, so a
 * button under an overlay fails the way it fails for a player. `el.click()`
 * on the selector's own element would reach straight through the overlay and
 * prove nothing.
 * ⛔ On two cores the page runs a few frames a second, so a touch tap whose
 * down and up land a frame apart reads as a HOLD. Every tap dispatches
 * pointerdown and pointerup SYNCHRONOUSLY inside one page.evaluate.
 * ⛔ Readiness is POSITIVE and DOM shaped: `MD_DEV.ready` goes true once the
 * title's nodes are in the document and one of them has a real rectangle.
 * Fathom waits on a render loop frame counter; this game is DOM and CSS
 * animations and has NO render loop, so a frame wait would hang for its whole
 * timeout on a page that booted perfectly. Every other wait is a
 * waitForFunction on MD_DEV.screen(). There is no sleep based wait here and
 * gates do not add one: a sleep is a guess, and on two cores it is a wrong one.
 * ⛔ The launch flags are two. The whole game is DOM and inline SVG, there is
 * no canvas and no WebGL, so no swiftshader or GL flag belongs here.
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
/* the page asks the SITE ROOT for these, not the game folder */
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

/* A phone: 375x667 by default, a real touchscreen, two device pixels per CSS px
   so a screenshot is measured at the density a phone actually paints. */
export async function open(base, { width = 375, height = 667, path = '/index.html', query = '' } = {}) {
  const browser = await puppeteer.launch({
    headless: 'new', protocolTimeout: 120000,
    /* --no-sandbox and --disable-gpu are the two this game needs. The shm flag
       stays because Chrome dies on a small /dev/shm in a container, and the
       autoplay flag because the ear gate shares this launcher. */
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage',
      '--autoplay-policy=no-user-gesture-required']
  });
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  const q = '?probe=' + Math.floor(Math.random() * 1e9) + (query ? '&' + query : '');
  await page.goto(base + path + q, { waitUntil: 'load', timeout: 60000 });
  try {
    await page.waitForFunction(
      () => !!window.MD_DEV && window.MD_DEV.ready === true && window.MD_DEV.screen() === 'title',
      { timeout: 30000 });
  } catch (e) {
    /* say WHAT was missing and close the browser: a gate that dies on a raw
       stack leaves a headless Chrome alive, and on two cores the next gate
       then runs against a stray. */
    const why = await page.evaluate(() => ({
      dev: !!window.MD_DEV,
      ready: window.MD_DEV ? window.MD_DEV.ready : null,
      screen: window.MD_DEV ? window.MD_DEV.screen() : null
    })).catch(() => ({ dev: false }));
    await browser.close().catch(() => {});
    throw new Error('the page never became ready: MD_DEV ' + (why.dev ? 'exists' : 'is MISSING') +
      ', ready=' + JSON.stringify(why.ready) + ', screen=' + JSON.stringify(why.screen) +
      (errors.length ? ', console: ' + errors.join(' | ') : ''));
  }
  return { browser, page, errors };
}

export function reporter() {
  const fails = [];
  const say = (ok, line) => { console.log((ok ? '  ok    ' : '  FAIL  ') + line); if (!ok) fails.push(line); };
  return { fails, say };
}

/* the only wait a gate uses for game state */
export const waitScreen = (page, name, timeout = 15000) =>
  page.waitForFunction(n => !!window.MD_DEV && window.MD_DEV.screen() === n, { timeout }, name);

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

/* a real press on whatever is under the thumb at the element's centre */
export const tap = (page, sel) => page.evaluate((sel) => {
  const el = document.querySelector(sel);
  if (!el) throw new Error('no element for ' + sel);
  const r = el.getBoundingClientRect();
  const x = r.left + r.width / 2, y = r.top + r.height / 2;
  const top = document.elementFromPoint(x, y);
  if (!top) throw new Error('nothing under the thumb at the centre of ' + sel);
  const o = { pointerId: 7, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y };
  top.dispatchEvent(new PointerEvent('pointerdown', o));
  top.dispatchEvent(new PointerEvent('pointerup', o));
  top.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, clientX: x, clientY: y }));
  return top.id || top.tagName;
}, sel);

/* a tap at a screen point, the way a thumb does it */
export const tapAt = (page, x, y) => page.evaluate((x, y) => {
  const el = document.elementFromPoint(x, y);
  if (!el) throw new Error('nothing at ' + x + ',' + y + ' (viewport ' + window.innerWidth + 'x' + window.innerHeight + ')');
  const o = { pointerId: 8, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y };
  el.dispatchEvent(new PointerEvent('pointerdown', o));
  el.dispatchEvent(new PointerEvent('pointerup', o));
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, clientX: x, clientY: y }));
  return el.id || el.tagName;
}, x, y);

/* ⛔ For letting a CSS transition finish before a SCREENSHOT, and nothing else.
   No gate waits for game state on this; that is what waitScreen is for. */
export const sleep = ms => new Promise(r => setTimeout(r, ms));
