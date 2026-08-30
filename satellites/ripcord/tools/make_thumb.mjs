/* The portal card thumbnail: a real frame of the game, not a mockup.
 *
 * It drives the built game to a moment that says what the game is in one
 * picture, which here is two tops mid contact with the heavy side coming round,
 * then crops the arena square. 480 px, well under the 150 KB the portal wants.
 *
 *   node tools/make_thumb.mjs
 */
import puppeteer from '/workspaces/lucid-winds/node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import http from 'http';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const wait = ms => new Promise(r => setTimeout(r, ms));
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json',
                '.webmanifest': 'application/manifest+json', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
  const f = path.join(ROOT, rel);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage();
const errs = [];
page.on('pageerror', e => errs.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
await page.setViewport({ width: 480, height: 480, deviceScaleFactor: 2 });
await page.goto('http://127.0.0.1:' + server.address().port + '/index.html', { waitUntil: 'load' });
await wait(700);
// straight into a live round with the menu and every overlay out of the way
await page.evaluate(() => {
  document.querySelector('#howto [data-close]').click();
  document.getElementById('menu').classList.remove('up');
  for (const id of ['top', 'dock', 'hint', 'laps', 'card', 'buildstamp'])
    { const e = document.getElementById(id); if (e) e.style.display = 'none'; }
});

/* Hunt for a frame with a real contact in it. A picture of two tops sitting
 * apart is a picture of nothing; the game is the moment they meet. */
let best = null;
for (let attempt = 0; attempt < 220 && !best; attempt++) {
  await wait(90);
  const hit = await page.evaluate(() => {
    // sparks only exist for a fifth of a second after a connection, and the two
    // tops have to still be ON each other; sparks alone catches the moment after
    // they have already flown apart, which is a picture of an empty dish
    return !!(window.__sparkCount && window.__sparkCount() > 5 &&
              window.__gap && window.__gap() < 1.45);
  }).catch(() => false);
  if (hit) best = true;
}
const diag = await page.evaluate(() => {
  const c = document.getElementById('cv');
  return { w: c.width, h: c.height, cw: c.clientWidth, ch: c.clientHeight,
           sparks: typeof window.__sparkCount === 'function' ? window.__sparkCount() : 'no hook' };
});
console.log('canvas ' + JSON.stringify(diag));
if (errs.length) console.log('ERRORS: ' + errs.join(' | '));
await page.screenshot({ path: path.join(ROOT, 'tools', 'thumb-raw.png') });
await browser.close();
server.close();
console.log('raw frame captured' + (best ? ' on a contact' : ' (no contact found, took what was there)'));
