#!/usr/bin/env node
/* BRIM offline: the installable shell (plans/brim/HANDOFF-BRIM.md P3; CATALOG-PLAN D2; satellites/crease/test/offline.mjs).
 *
 *   node test/offline.mjs          (in the foreground, under the gate lock)
 *
 * Its own server, so the network can be cut two ways a school's wifi cuts it: DOWN and HANGING.
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. sw.js names its cache brim-shell-<stamp>, main.js registers ./sw.js?v=<stamp>, and the page links the manifest
 *   2. straight after a first visit, the worker's cache holds every address the page asked for (read off the requests; the
 *      scar CREASE's gate caught: a module imported at two addresses)
 *   3. a worker installing again deletes older brim caches and leaves every other cache on the origin alone
 *   4. with the server DOWN, a reload plays a MATCHING round from the cache, and a reload opens LEVEL by its door and splits
 *   5. with the server HANGING, a reload is ready within 6 s, and a request for something never cached settles within 6 s
 *   6. the manifest names the game, starts at ./, displays standalone, and its icons measure what it says
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, normalize, extname } from 'node:path';
import { launch, reporter, tap, sleep, MATH } from '../../math/core/test/harness.mjs';

const ROOT = join(MATH, '..'), BRIM = join(ROOT, 'brim');
const { fails, say } = reporter();
const STAMP = (readFileSync(join(BRIM, 'STAMP.js'), 'utf8').match(/STAMP = '([0-9]{8}[a-z])'/) || [])[1];
const CACHE = 'brim-shell-' + STAMP;
const READY = 'window.BRIM && window.BRIM.ready';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
const read = (p, fallback = '') => existsSync(p) ? readFileSync(p, 'utf8') : fallback;

/* ---- 1 and 6, from the files ---- */
{
  const sw = read(join(BRIM, 'sw.js'));
  const version = (sw.match(/SHELL_VERSION\s*=\s*['"]([^'"]+)['"]/) || [])[1];
  say(version === CACHE, 'sw.js names its cache for BRIM\'s stamp (' + (version || 'no SHELL_VERSION') + ' for ' + CACHE + ')');
  say(read(join(BRIM, 'main.js')).indexOf("register('./sw.js?v=" + STAMP + "'") >= 0, 'main.js registers ./sw.js?v=' + STAMP);
  say(/<link[^>]*rel=["']manifest["'][^>]*href=["'][^"']*manifest\.webmanifest\?v=/.test(read(join(BRIM, 'index.html'))), 'the page links the manifest at a stamped address');
  let manifest = null;
  try { manifest = JSON.parse(read(join(BRIM, 'manifest.webmanifest'), 'null')); } catch (e) { manifest = null; }
  const png = f => { const p = join(BRIM, f.replace(/\?.*$/, '')); if (!existsSync(p)) return null; const b = readFileSync(p); return b.slice(1, 4).toString() === 'PNG' ? [b.readUInt32BE(16), b.readUInt32BE(20)] : null; };
  const icons = manifest && Array.isArray(manifest.icons) ? manifest.icons : [];
  const missing = [['192x192', false], ['512x512', false], ['512x512', true]].filter(([size, mask]) => !icons.some(i => i.sizes === size && /maskable/.test(i.purpose || '') === mask
    && (() => { const m = png(i.src); return m && m[0] + 'x' + m[1] === size; })())).map(([s, m]) => s + (m ? ' maskable' : ''));
  say(!!manifest && manifest.name === 'Brim' && manifest.start_url === './' && manifest.display === 'standalone' && missing.length === 0,
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
  res.end(clean === '/brim/sw.js' ? readFileSync(p, 'utf8') + swExtra : readFileSync(p));
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
await page.goto(base + '/brim/index.html?seed=4242&', { waitUntil: 'load', timeout: 60000 });
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
  const lost = Array.from(new Set(sub)).filter(u => !inCache.has(u)).concat(Array.from(inCache).some(u => u.split('?')[0] === '/brim/index.html') ? [] : ['/brim/index.html']);
  say(inCache.size > 0 && lost.length === 0, 'straight after the first visit, the worker\'s cache holds every address the page asked for, and the page'
    + (inCache.size ? ' (' + inCache.size + ' cached' + (lost.length ? '; not cached: ' + lost.join(', ') : '') + ')' : ' (no ' + CACHE + ' cache)'));
}

/* 3 */
{
  await page.evaluate(async () => { await caches.open('brim-shell-19990101a'); await caches.open('crease-shell-kept'); });
  swExtra = '\n/* a deploy */\n';
  await page.evaluate(() => navigator.serviceWorker.getRegistration().then(r => r && r.update()));
  const keys = await page.evaluate(() => new Promise(resolve => {
    const t0 = performance.now();
    const tick = () => caches.keys().then(k => { if (k.indexOf('brim-shell-19990101a') < 0 || performance.now() - t0 > 10000) resolve(k); else setTimeout(tick, 150); });
    tick();
  }));
  say(keys.indexOf('brim-shell-19990101a') < 0 && keys.indexOf('crease-shell-kept') >= 0 && keys.indexOf(CACHE) >= 0,
    'a worker installing again deletes older brim caches and leaves every other cache alone (' + JSON.stringify(keys) + ')');
}

/* 4 */
{
  mode = 'down';
  let played = 'not reached';
  await page.bringToFront();
  try {
    await page.reload({ waitUntil: 'load', timeout: 20000 });
    await page.waitForFunction(READY, { timeout: 15000 });
    await tap(page, '#start');
    await sleep(250);
    await tap(page, '#left');
    await page.waitForFunction(() => window.BRIM.revealDone(), { timeout: 15000 });
    played = JSON.stringify({ side: (await page.evaluate(() => window.BRIM.results[0])).side });
  } catch (e) {
    const seen = await page.evaluate(() => ({ url: location.pathname, controlled: !!(navigator.serviceWorker && navigator.serviceWorker.controller), ready: !!window.BRIM })).catch(err => ({ unreadable: err.message.split('\n')[0] }));
    played = 'failed: ' + e.message.split('\n')[0] + '; the page shows ' + JSON.stringify(seen);
  }
  say(/"side":"left"/.test(played), 'with the server down, a reload plays a MATCHING round from the cache (' + played + ')');
  let split = 'not reached';
  try {
    await page.reload({ waitUntil: 'load', timeout: 20000 });
    await page.waitForFunction(READY, { timeout: 15000 });
    await tap(page, '#start-level');
    await sleep(200);
    await tap(page, '#splits .split[data-k="3"]');
    await page.waitForFunction(() => window.BRIM.results.length > 0, { timeout: 10000 });
    split = String(await page.evaluate(() => window.BRIM.results[0].split));
  } catch (e) { split = 'failed: ' + e.message.split('\n')[0]; }
  say(split === '3', 'and a reload opens LEVEL by its door and splits the glass (' + split + ')');
}

/* 5 */
{
  mode = 'hang';
  const t0 = Date.now();
  let ready = 0;
  try {
    await page.reload({ waitUntil: 'load', timeout: 20000 });
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
