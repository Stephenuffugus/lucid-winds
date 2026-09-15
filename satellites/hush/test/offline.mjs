#!/usr/bin/env node
/* HUSH offline: the installable shell (plans/hush/HANDOFF-HUSH.md P3; CATALOG-PLAN D2; the shape and scars of GAUGE's and TINT's
 * test/offline.mjs).
 *
 *   node test/offline.mjs          (in the foreground, under the gate lock)
 *
 * Its own server, so the network can be cut two ways a school's wifi cuts it: DOWN (every connection dropped at once) and
 * HANGING (connections accepted and never answered).
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. sw.js names its cache hush-shell-<stamp>, main.js registers ./sw.js?v=<stamp>, and the page links the manifest
 *   2. straight after a first visit, the worker's cache holds every address the page asked for (read off the requests)
 *   3. a worker installing again deletes older hush-shell caches and leaves every other cache on the origin alone (the old
 *      standalone /hush/ app's hush- caches among them)
 *   4. with the server DOWN, a reload plays a STEP trial to its score from the cache, and SIMON's own page opens from the cache
 *   5. with the server HANGING, a reload is ready within 6 s, and a request for something never cached settles within 6 s
 *   6. the manifest names the game, starts at ./, displays standalone, and its icons measure what it says
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, normalize, extname } from 'node:path';
import { launch, reporter, sleep, MATH } from '../../math/core/test/harness.mjs';

const ROOT = join(MATH, '..'), HUSH = join(ROOT, 'hush');
const { fails, say } = reporter();
const STAMP = (readFileSync(join(HUSH, 'STAMP.js'), 'utf8').match(/STAMP = '([0-9]{8}[a-z])'/) || [])[1];
const CACHE = 'hush-shell-' + STAMP;
const READY = 'window.HUSH && window.HUSH.ready';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
const read = (p, fallback = '') => existsSync(p) ? readFileSync(p, 'utf8') : fallback;

/* ---- 1 and 6, from the files ---- */
{
  const sw = read(join(HUSH, 'sw.js'));
  const version = (sw.match(/SHELL_VERSION\s*=\s*['"]([^'"]+)['"]/) || [])[1];
  say(version === CACHE, 'sw.js names its cache for HUSH\'s stamp (' + (version || 'no SHELL_VERSION') + ' for ' + CACHE + ')');
  say(read(join(HUSH, 'main.js')).indexOf("register('./sw.js?v=" + STAMP + "'") >= 0, 'main.js registers ./sw.js?v=' + STAMP);
  say(/<link[^>]*rel=["']manifest["'][^>]*href=["'][^"']*manifest\.webmanifest\?v=/.test(read(join(HUSH, 'index.html'))), 'the page links the manifest at a stamped address');
  let manifest = null;
  try { manifest = JSON.parse(read(join(HUSH, 'manifest.webmanifest'), 'null')); } catch (e) { manifest = null; }
  const png = f => { const p = join(HUSH, f.replace(/\?.*$/, '')); if (!existsSync(p)) return null; const b = readFileSync(p); return b.slice(1, 4).toString() === 'PNG' ? [b.readUInt32BE(16), b.readUInt32BE(20)] : null; };
  const icons = manifest && Array.isArray(manifest.icons) ? manifest.icons : [];
  const missing = [['192x192', false], ['512x512', false], ['512x512', true]].filter(([size, mask]) => !icons.some(i => i.sizes === size && /maskable/.test(i.purpose || '') === mask
    && (() => { const m = png(i.src); return m && m[0] + 'x' + m[1] === size; })())).map(([sz, m]) => sz + (m ? ' maskable' : ''));
  say(!!manifest && manifest.name === 'Hush' && manifest.start_url === './' && manifest.display === 'standalone' && missing.length === 0,
    'the manifest names the game, starts at ./, displays standalone, and its icons measure what it says'
    + (manifest ? (missing.length ? ' (missing or mismeasured: ' + missing.join(', ') + ')' : '') : ' (no manifest)'));
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
  res.end(clean === '/hush/sw.js' ? readFileSync(p, 'utf8') + swExtra : readFileSync(p));
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = 'http://127.0.0.1:' + server.address().port;

const browser = await launch();
const errors = [];
const page = await browser.newPage();
await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const asked = [];
page.on('request', r => asked.push({ url: r.url(), type: r.resourceType() }));
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
/* fork=careful: a link naming the fork skips the picture fork, so a reload goes straight to the doors */
await page.goto(base + '/hush/index.html?seed=4242&count=40&fork=careful&', { waitUntil: 'load', timeout: 60000 });
await page.waitForFunction(READY, { timeout: 30000 });
const controlled = pg => pg.evaluate(() => new Promise(resolve => {
  if (!navigator.serviceWorker) { resolve(false); return; }
  const t0 = performance.now();
  const tick = () => { if (navigator.serviceWorker.controller) resolve(true); else if (performance.now() - t0 > 10000) resolve(false); else setTimeout(tick, 100); };
  tick();
}));
say(await controlled(page), 'after a first visit the worker controls the page');
const key = u => { const x = new URL(u); return x.pathname + x.search; };

/* 2 */
{
  await sleep(800);
  const inCache = new Set(((await page.evaluate(async name => (await caches.has(name)) ? (await (await caches.open(name)).keys()).map(r => r.url) : [], CACHE)) || []).map(key));
  const sub = asked.filter(a => a.url.startsWith(base) && a.type !== 'document' && !/\/sw\.js/.test(a.url)).map(a => key(a.url));
  const lost = Array.from(new Set(sub)).filter(u => !inCache.has(u)).concat(Array.from(inCache).some(u => u.split('?')[0] === '/hush/index.html') ? [] : ['/hush/index.html']);
  say(inCache.size > 0 && lost.length === 0, 'straight after the first visit, the worker\'s cache holds every address the page asked for, and the page'
    + (inCache.size ? ' (' + inCache.size + ' cached' + (lost.length ? '; not cached: ' + lost.join(', ') : '') + ')' : ' (no ' + CACHE + ' cache)'));
}

/* 3 */
{
  await page.evaluate(async () => { await caches.open('hush-shell-19990101a'); await caches.open('hush-v8'); await caches.open('brim-shell-kept'); });
  swExtra = '\n/* a deploy */\n';
  await page.evaluate(() => navigator.serviceWorker.getRegistration().then(r => r && r.update()));
  const keys = await page.evaluate(() => new Promise(resolve => {
    const t0 = performance.now();
    const tick = () => caches.keys().then(k => { if (k.indexOf('hush-shell-19990101a') < 0 || performance.now() - t0 > 10000) resolve(k); else setTimeout(tick, 150); });
    tick();
  }));
  say(keys.indexOf('hush-shell-19990101a') < 0 && keys.indexOf('hush-v8') >= 0 && keys.indexOf('brim-shell-kept') >= 0 && keys.indexOf(CACHE) >= 0,
    'a worker installing again deletes older hush-shell caches and leaves every other cache alone, the old /hush/ app\'s among them (' + JSON.stringify(keys) + ')');
}

/* 4 */
{
  mode = 'down';
  let played = 'not reached';
  await page.bringToFront();
  try {
    await page.reload({ waitUntil: 'load', timeout: 20000 });
    await page.waitForFunction(READY, { timeout: 15000 });
    await page.evaluate(() => document.getElementById('start').click());
    await page.waitForFunction(() => window.HUSH.trials().length > 0, { timeout: 20000, polling: 'raf' });
    played = JSON.stringify({ outcome: (await page.evaluate(() => window.HUSH.trials()[0])).outcome });
  } catch (e) {
    const seen = await page.evaluate(() => ({ url: location.pathname, controlled: !!(navigator.serviceWorker && navigator.serviceWorker.controller), ready: !!window.HUSH })).catch(err => ({ unreadable: err.message.split('\n')[0] }));
    played = 'failed: ' + e.message.split('\n')[0] + '; the page shows ' + JSON.stringify(seen);
  }
  say(/"outcome":"(miss|hit|falseAlarm|correctRejection)"/.test(played), 'with the server down, a reload plays a STEP trial to its score from the cache (' + played + ')');
  let simon = 'not reached';
  try {
    await page.goto(base + '/hush/simon/index.html?seed=4242&', { waitUntil: 'load', timeout: 20000 });
    await page.waitForFunction(() => !!window.SIMON && !!document.getElementById('simon-go'), { timeout: 15000 });
    simon = 'ready';
  } catch (e) { simon = 'failed: ' + e.message.split('\n')[0]; }
  say(simon === 'ready', 'and SIMON\'s own page opens from the cache (' + simon + ')');
}

/* 5 */
{
  mode = 'hang';
  const t0 = Date.now();
  let ready = 0;
  try {
    await page.goto(base + '/hush/index.html?seed=4242&count=40&fork=careful&', { waitUntil: 'load', timeout: 20000 });
    await page.waitForFunction(READY, { timeout: 15000 });
    ready = Date.now() - t0;
  } catch (e) { ready = 0; }
  say(ready > 0 && ready <= 6000, 'with the server hanging, a reload is ready within 6 s (' + (ready ? (ready / 1000).toFixed(1) + ' s' : 'never') + ')');
  let settled = 'not asked';
  try {
    settled = await page.evaluate(() => Promise.race([
      fetch('./never-cached.txt?x=' + Math.random()).then(r => 'settled ' + r.status, () => 'rejected'),
      new Promise(r => setTimeout(() => r('still pending after 6 s'), 6000))
    ]));
  } catch (e) { settled = 'failed: ' + e.message.split('\n')[0]; }
  say(/^settled|^rejected/.test(settled), 'and a request for something never cached settles instead of hanging (' + settled + ')');
}

mode = 'serve';
hung.forEach(res => { try { res.destroy(); } catch (e) { /* already gone */ } });
const real = errors.filter(e => !/net::ERR|Failed to load resource|Failed to fetch/.test(e));
say(real.length === 0, 'nothing else landed on the console' + (real.length ? ': ' + real.slice(0, 3).join(' | ') : ''));
await browser.close();
server.closeAllConnections && server.closeAllConnections();
server.close();
console.log('');
if (fails.length) { console.log(fails.length + ' OFFLINE FAILURE(S)'); process.exit(1); }
console.log('OFFLINE OK');
