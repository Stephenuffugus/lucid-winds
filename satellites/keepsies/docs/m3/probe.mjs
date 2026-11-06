/* The m3 browser probe (law 11): one puppeteer page through window.KEEPSIES_DEV that prints sizes and positions; no image is opened.
 *   node docs/m3/probe_circle.mjs (each probe imports this lib)
 * One browser at a time on this box (law 12). */
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname, normalize } from 'node:path';
const require = createRequire(import.meta.url);
const puppeteer = require('/workspaces/lucid-winds/node_modules/puppeteer');
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SITE = join(ROOT, '..', '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.wasm': 'application/wasm', '.ogg': 'audio/ogg', '.mp3': 'audio/mpeg', '.glb': 'model/gltf-binary', '.bin': 'application/octet-stream' };
const FLEET = ['/music-unlocks.js', '/music-player.js', '/music-catalog.js', '/music-ladder.json'];
export const server = createServer((req, res) => {
  const clean = decodeURIComponent(req.url.split('?')[0]);
  const base = FLEET.indexOf(clean) >= 0 ? SITE : ROOT;
  const p = join(base, normalize(clean).replace(/^(\.\.[/\\])+/, ''));
  if (!p.startsWith(base) || !existsSync(p)) { res.writeHead(404); res.end('no'); return; }
  res.writeHead(200, { 'content-type': MIME[extname(p)] || 'application/octet-stream' });
  res.end(readFileSync(p));
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
export const BASE = 'http://127.0.0.1:' + server.address().port + '/index.html?keepsiestest=1' + (process.env.KP_QUALITY ? '&quality=' + process.env.KP_QUALITY : '');
export const browser = await puppeteer.launch({ headless: 'new', protocolTimeout: 180000, args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
export const sleep = (ms) => new Promise(r => setTimeout(r, ms));
export async function open(w, h, opts) {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  page.errors = [];
  page.on('pageerror', e => page.errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') page.errors.push('console: ' + m.text()); });
  await page.goto(BASE, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => window.KEEPSIES_DEV && window.KEEPSIES_DEV.state().frames > 3, { timeout: 90000 });
  return page;
}
export async function startMatch(page, o) {
  await page.evaluate((o) => window.KEEPSIES_DEV.start(Object.assign({ seed: 424242, forceFirst: 0 }, o || {})), o);
  await page.waitForFunction(() => { const s = window.KEEPSIES_DEV.state(); return s.match && !s.match.simulating && s.match.turn === 0 && s.match.taw; }, { timeout: 60000 });
  await page.waitForFunction(() => window.KEEPSIES_DEV.aimUi().nudge, { timeout: 40000 });
  await sleep(400);
}
/* a rect of an element, or null when hidden */
export const rectIn = `(id) => { const el = document.getElementById(id); if (!el || el.hidden) return null; const r = el.getBoundingClientRect(); if (r.width < 1) return null; return { l: +r.left.toFixed(1), t: +r.top.toFixed(1), r: +r.right.toFixed(1), b: +r.bottom.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) }; }`;
export const clearance = (c, rect) => { if (!rect) return null; const dx = Math.max(rect.l - c.x, 0, c.x - rect.r), dy = Math.max(rect.t - c.y, 0, c.y - rect.b); return +(Math.hypot(dx, dy) - c.r).toFixed(1); };
export async function done() { await browser.close(); server.close(); }
