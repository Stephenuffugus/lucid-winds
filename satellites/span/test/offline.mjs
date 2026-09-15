#!/usr/bin/env node
/* SPAN offline: the installable shell (plans/span/HANDOFF-SPAN.md P3 step 4; CATALOG-PLAN D2, the service worker header
 * law: delete only your own caches, every fetch settles a real Response, navigations refetch no-cache, the shell's
 * version moves with the stamp).
 *
 *   node test/offline.mjs          (in the foreground, under the gate lock)
 *
 * Its own server, so the network can be cut two ways a school's wifi cuts it: DOWN (every connection dropped at once)
 * and HANGING (connections accepted and never answered, the case that left fleet pages on a black screen).
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. sw.js names its cache span-shell-<stamp>, the game registers ./sw.js?v=<stamp> and the screener ../sw.js?v=<stamp>
 *      with the game's folder as scope, and both pages link the manifest
 *   2. after a first visit to the game and to the screener the worker controls both, and its cache holds every URL either
 *      page asked for on that visit (read off the requests the pages made, never a list)
 *   3. a worker installing again deletes older span caches and leaves every other cache on the origin alone
 *   4. with the server DOWN, a reload of the game plays a round from the cache (a stone, the span laid, the reveal done)
 *      and a reload of the screener starts and takes a choice
 *   5. with the server HANGING, a reload of the game is ready within 6 s, and a request for something never cached
 *      settles within 6 s instead of hanging
 *   6. the manifest names the game, starts at ./, displays standalone, and lists icons at 192 and 512 and a maskable 512,
 *      each PNG measuring what the manifest says
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, normalize, extname } from 'node:path';
import { launch, reporter, tap, sleep, MATH } from '../../math/core/test/harness.mjs';

const ROOT = join(MATH, '..'), SPAN = join(ROOT, 'span');
const { fails, say } = reporter();
const STAMP = (readFileSync(join(SPAN, 'STAMP.js'), 'utf8').match(/STAMP = '([0-9]{8}[a-z])'/) || [])[1];
const CACHE = 'span-shell-' + STAMP;
const READY_GAME = 'window.SPAN && window.SPAN.ready', READY_SCREEN = 'window.SCREEN && window.SCREEN.ready';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
const read = (p, fallback = '') => existsSync(p) ? readFileSync(p, 'utf8') : fallback;

/* ---- 1 and 6, from the files ---- */
{
  const sw = read(join(SPAN, 'sw.js'));
  const version = (sw.match(/SHELL_VERSION\s*=\s*['"]([^'"]+)['"]/) || [])[1];
  say(version === CACHE, 'sw.js names its cache for SPAN\'s stamp (' + (version || 'no SHELL_VERSION') + ' for ' + CACHE + ')');
  const main = read(join(SPAN, 'main.js')), screen = read(join(SPAN, 'screen', 'screen.js'));
  const gameReg = main.indexOf("register('./sw.js?v=" + STAMP + "'") >= 0;
  const screenReg = screen.indexOf("register('../sw.js?v=" + STAMP + "', { scope: '../' })") >= 0;
  say(gameReg && screenReg, 'the game registers ./sw.js?v=' + STAMP + ' and the screener ../sw.js?v=' + STAMP + ' with the game\'s folder as scope'
    + (gameReg ? '' : ' (not the game)') + (screenReg ? '' : ' (not the screener)'));
  const links = ['index.html', 'screen/index.html'].filter(f => !/<link[^>]*rel=["']manifest["'][^>]*href=["'][^"']*manifest\.webmanifest\?v=/.test(read(join(SPAN, f))));
  say(links.length === 0, 'both pages link the manifest at a stamped address' + (links.length ? ' (not ' + links.join(', ') + ')' : ''));

  let manifest = null;
  try { manifest = JSON.parse(read(join(SPAN, 'manifest.webmanifest'), 'null')); } catch (e) { manifest = null; }
  const png = f => { const p = join(SPAN, f.replace(/\?.*$/, '')); if (!existsSync(p)) return null; const b = readFileSync(p); return b.slice(1, 4).toString() === 'PNG' ? [b.readUInt32BE(16), b.readUInt32BE(20)] : null; };
  const icons = manifest && Array.isArray(manifest.icons) ? manifest.icons : [];
  const wants = [['192x192', false], ['512x512', false], ['512x512', true]];
  const missing = wants.filter(([size, mask]) => !icons.some(i => i.sizes === size && /maskable/.test(i.purpose || '') === mask
    && (() => { const m = png(i.src); return m && m[0] + 'x' + m[1] === size; })())).map(([s, m]) => s + (m ? ' maskable' : ''));
  say(!!manifest && !!manifest.name && manifest.start_url === './' && manifest.display === 'standalone' && missing.length === 0,
    'the manifest names the game, starts at ./, displays standalone, and its icons measure what it says'
    + (manifest ? ' (' + JSON.stringify({ name: manifest.name, start_url: manifest.start_url, display: manifest.display }) + (missing.length ? ', missing or mismeasured: ' + missing.join(', ') : '') + ')' : ' (no manifest)'));
}

/* ---- the switchable server ---- */
let mode = 'serve', swExtra = '';
const hung = [];
const server = createServer((req, res) => {
  if (mode === 'down') { req.socket.destroy(); return; }
  if (mode === 'hang') { hung.push(res); return; }
  const clean = decodeURIComponent(req.url.split('?')[0]);
  let p = join(ROOT, normalize(clean).replace(/^(\.\.[/\\])+/, ''));
  if (!p.startsWith(ROOT) || !existsSync(p)) { res.writeHead(404); res.end('no'); return; }
  if (statSync(p).isDirectory()) p = join(p, 'index.html');
  if (!existsSync(p)) { res.writeHead(404); res.end('no'); return; }
  res.writeHead(200, { 'content-type': MIME[extname(p)] || 'application/octet-stream' });
  /* a deploy changes the worker's bytes; swExtra is how this gate makes one without touching the file */
  res.end(clean === '/span/sw.js' ? readFileSync(p, 'utf8') + swExtra : readFileSync(p));
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = 'http://127.0.0.1:' + server.address().port;

const browser = await launch();
const errors = [];
async function visit(path, ready) {
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const asked = [];
  page.on('request', r => asked.push({ url: r.url(), type: r.resourceType() }));
  page.on('pageerror', e => errors.push(path + ' pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(path + ' console: ' + m.text()); });
  await page.goto(base + path, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(ready, { timeout: 30000 });
  return { page, asked };
}
/* ⛔ the first version read the controller the moment `ready` resolved, before the worker's clients.claim() reached the
   page, and called a page that was about to be controlled uncontrolled; it now waits up to 10 s, polling on a timer */
const controlled = page => page.evaluate(() => new Promise(resolve => {
  if (!navigator.serviceWorker) { resolve(false); return; }
  const t0 = performance.now();
  const tick = () => {
    if (navigator.serviceWorker.controller) resolve(true);
    else if (performance.now() - t0 > 10000) resolve(false);
    else setTimeout(tick, 100);
  };
  tick();
}));
const cached = (page, name) => page.evaluate(async name => {
  if (!(await caches.has(name))) return null;
  return (await (await caches.open(name)).keys()).map(r => r.url);
}, name);
const key = u => { const x = new URL(u); return x.pathname + x.search; };

/* ⛔ the first version read the cache after visiting both pages, and the screener's visit, already under the worker,
   fetched and cached anything the install had missed: with CORE's STAMP.js planted out of the precache list the law
   stayed green, though a child who only ever opened the game would have had no STAMP.js offline. The screener's
   addresses are now learnt in a separate browser, and the cache is read straight after the game's first visit, before
   any page under the worker could fill it. */
const learn = await launch();
const screenAsked = await (async () => {
  const page = await learn.newPage();
  await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const asked = [];
  page.on('request', r => asked.push({ url: r.url(), type: r.resourceType() }));
  await page.goto(base + '/span/screen/index.html?seed=4242&', { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(READY_SCREEN, { timeout: 30000 });
  await sleep(500);
  return asked;
})();
await learn.close();

const game = await visit('/span/index.html?seed=4242&', READY_GAME);
const gameOn = await controlled(game.page);

/* 2 */
{
  const inCache = new Set(((await cached(game.page, CACHE)) || []).map(key));
  const sub = game.asked.concat(screenAsked).filter(a => a.url.startsWith(base) && a.type !== 'document' && !/\/sw\.js/.test(a.url)).map(a => key(a.url));
  const docs = ['/span/index.html', '/span/screen/index.html'];
  const lost = Array.from(new Set(sub)).filter(u => !inCache.has(u)).concat(docs.filter(d => !Array.from(inCache).some(u => u.split('?')[0] === d)));
  say(inCache.size > 0 && lost.length === 0, 'straight after the game\'s first visit, the worker\'s cache holds every address the game and the screener ask for, and both pages'
    + (inCache.size ? ' (' + inCache.size + ' cached' + (lost.length ? '; not cached: ' + lost.join(', ') : '') + ')' : ' (no ' + CACHE + ' cache)'));
}

const screen = await visit('/span/screen/index.html?seed=4242&', READY_SCREEN);
const screenOn = await controlled(screen.page);
await sleep(500);
say(gameOn && screenOn, 'after a first visit the worker controls the game and the screener (' + gameOn + ', ' + screenOn + ')');

/* 3 */
/* ⛔ the first version unregistered the worker and reloaded to make it install again; the spec keeps a registration
   that is only marked for removal and hands it back to the next register(), so nothing installed, nothing cleaned up,
   and the reloaded game was left with no worker at all, which also sank law 4. A worker installs again the way a
   deploy makes it: its bytes change and the registration updates. */
{
  await game.page.evaluate(async () => { await caches.open('span-shell-19990101a'); await caches.open('wardian-shell-kept'); });
  swExtra = '\n/* a deploy */\n';
  await game.page.evaluate(() => navigator.serviceWorker.getRegistration().then(r => r && r.update()));
  /* a new install fetches the whole shell before it activates and cleans up: wait up to 10 s for the old cache to go */
  const keys = await game.page.evaluate(() => new Promise(resolve => {
    const t0 = performance.now();
    const tick = () => caches.keys().then(k => {
      if (k.indexOf('span-shell-19990101a') < 0 || performance.now() - t0 > 10000) resolve(k);
      else setTimeout(tick, 150);
    });
    tick();
  }));
  say(keys.indexOf('span-shell-19990101a') < 0 && keys.indexOf('wardian-shell-kept') >= 0 && keys.indexOf(CACHE) >= 0,
    'a worker installing again deletes older span caches and leaves every other cache alone (' + JSON.stringify(keys) + ')');
}

/* 4 */
{
  mode = 'down';
  let played = 'not reached';
  /* ⛔ the first run played this round in a tab behind the screener's: the page loaded from the cache, the span was laid
     and the caption written, but a background tab gets no animation frames, the reveal never finished, and the wait
     for it timed out; each page is brought to the front before it is played */
  await game.page.bringToFront();
  try {
    await game.page.reload({ waitUntil: 'load', timeout: 20000 });
    await game.page.waitForFunction(READY_GAME, { timeout: 15000 });
    await tap(game.page, '#start');
    await sleep(250);
    await game.page.evaluate(() => {
      const src = document.querySelector('#supply .stone-source'), side = document.querySelector('#equation .term[data-blank]').dataset.side;
      const a = src.getBoundingClientRect(), b = document.getElementById('pier-' + side).getBoundingClientRect();
      const fire = (type, x, y) => (document.elementFromPoint(x, y) || document.body).dispatchEvent(new PointerEvent(type,
        { pointerId: 101, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y }));
      fire('pointerdown', a.left + a.width / 2, a.top + a.height / 2);
      fire('pointermove', b.left + b.width / 2, b.top + 30);
      fire('pointerup', b.left + b.width / 2, b.top + 30);
    });
    await sleep(200);
    await tap(game.page, '#lay');
    await game.page.waitForFunction(() => window.SPAN.revealDone(), { timeout: 15000 });
    played = JSON.stringify(await game.page.evaluate(() => window.SPAN.results[0]));
  } catch (e) {
    /* what the child would be looking at, so a red line says why and not only that */
    const seen = await game.page.evaluate(() => ({ url: location.pathname + location.search, title: document.title,
      text: document.body ? document.body.innerText.slice(0, 80) : null, controlled: !!(navigator.serviceWorker && navigator.serviceWorker.controller),
      span: !!window.SPAN })).catch(err => ({ unreadable: err.message.split('\n')[0] }));
    played = 'failed: ' + e.message.split('\n')[0] + '; the page shows ' + JSON.stringify(seen);
  }
  say(/"fill":1/.test(played), 'with the server down, a reload of the game plays a round from the cache (' + played + ')');
  let chose = 'not reached';
  await screen.page.bringToFront();
  try {
    await screen.page.reload({ waitUntil: 'load', timeout: 20000 });
    await screen.page.waitForFunction(READY_SCREEN, { timeout: 15000 });
    await tap(screen.page, '#start');
    await sleep(200);
    await tap(screen.page, '#same');
    chose = JSON.stringify(await screen.page.evaluate(() => window.SCREEN.choices));
  } catch (e) { chose = 'failed: ' + e.message.split('\n')[0]; }
  say(chose === '["same"]', 'and a reload of the screener starts and takes a choice (' + chose + ')');
}

/* 5 */
{
  mode = 'hang';
  await game.page.bringToFront();
  const t0 = Date.now();
  let ready = 0;
  try {
    await game.page.reload({ waitUntil: 'load', timeout: 20000 });
    await game.page.waitForFunction(READY_GAME, { timeout: 15000 });
    ready = Date.now() - t0;
  } catch (e) { ready = 0; }
  say(ready > 0 && ready <= 6000, 'with the server hanging, a reload of the game is ready within 6 s (' + (ready ? (ready / 1000).toFixed(1) + ' s' : 'never') + ')');
  let settled = 'not asked';
  try {
    settled = await game.page.evaluate(() => Promise.race([
      fetch('./never-cached.txt?x=' + Math.random()).then(r => 'settled ' + r.status, () => 'rejected'),
      new Promise(r => setTimeout(() => r('still pending after 6 s'), 6000))
    ]));
  } catch (e) { settled = 'failed: ' + e.message.split('\n')[0]; }
  say(/^settled|^rejected/.test(settled), 'and a request for something never cached settles instead of hanging (' + settled + ')');
}

mode = 'serve';
hung.forEach(res => { try { res.destroy(); } catch (e) { /* already gone */ } });
/* the dropped and hung connections are the test; the console lines they cause are the browser reporting them */
const real = errors.filter(e => !/net::ERR|Failed to load resource|Failed to fetch/.test(e));
say(real.length === 0, 'nothing else landed on the console' + (real.length ? ': ' + real.slice(0, 3).join(' | ') : ''));
await browser.close();
server.closeAllConnections && server.closeAllConnections();
server.close();
console.log('');
if (fails.length) { console.log(fails.length + ' OFFLINE FAILURE(S)'); process.exit(1); }
console.log('OFFLINE OK');
