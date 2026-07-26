#!/usr/bin/env node
/* Petal Match visual probe.
 *
 * WHY
 *   Stephen 2026-07-26: "the flowers should fill the boxes, and wheres the
 *   background and everything else?" I had wired the art by reading the code
 *   and never looked at the result. The pieces were drawn into a box under half
 *   a cell wide and most of the 205 cut files were not referenced at all.
 *   ⛔ Do not judge this board from the source again. Run this and LOOK.
 *
 * USAGE
 *   node scripts/petalmatch_shot.js [outfile.png] [level]
 *
 * It serves the repo over HTTP (the /play/ shells set <base href="/">, so
 * file:// makes every asset 404), opens the real play shell, clicks past the
 * rules card, waits for the art to decode, and shoots the board. It also
 * reports how many sprites loaded, any 404s, and the measured cell/sprite
 * geometry so an overshrink shows up as a NUMBER as well as a picture.
 */
const puppeteer = require('puppeteer');
const path = require('path');
const http = require('http');
const fs = require('fs');

const OUT   = process.argv[2] || '/tmp/petalmatch.png';
const LEVEL = parseInt(process.argv[3] || '1', 10);
const ROOT  = path.resolve(__dirname, '..');

const MIME = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css',
               '.json':'application/json', '.png':'image/png', '.jpg':'image/jpeg',
               '.webmanifest':'application/manifest+json', '.svg':'image/svg+xml' };

function serve() {
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p.endsWith('/')) p += 'index.html';
      const f = path.join(ROOT, p);
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
        res.writeHead(404); return res.end('nope');
      }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
      fs.createReadStream(f).pipe(res);
    });
    srv.listen(0, '127.0.0.1', () => resolve(srv));
  });
}

(async () => {
  const srv = await serve();
  const port = srv.address().port;
  const url = `http://127.0.0.1:${port}/play/petalmatch.html`;

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  const missing = [];
  page.on('response', r => { if (r.status() >= 400) missing.push(r.status() + ' ' + r.url().replace(`http://127.0.0.1:${port}`, '')); });
  page.on('pageerror', e => console.log('PAGEERROR:', e.message));
  page.on('console', m => { if (m.type() === 'error') console.log('console.error:', m.text().slice(0, 200)); });

  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

  // Click past whatever gate the shell shows (rules card / START).
  for (let i = 0; i < 4; i++) {
    const clicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, .btn, [role=button]'))
        .filter(b => b.offsetParent !== null);
      const hit = btns.find(b => /play|start|got it|begin|hop|go\b/i.test(b.textContent || ''));
      if (hit) { hit.click(); return hit.textContent.trim().slice(0, 40); }
      return null;
    });
    if (!clicked) break;
    console.log('clicked:', clicked);
    await new Promise(r => setTimeout(r, 900));
  }

  if (LEVEL > 1) {
    await page.evaluate(lv => { try { if (window._PM_TEST && window._PM_TEST.setLevel) window._PM_TEST.setLevel(lv); } catch (e) {} }, LEVEL);
    await new Promise(r => setTimeout(r, 800));
  }

  // Give the sprites time to decode, then let the drop-in animation settle.
  await new Promise(r => setTimeout(r, 3000));

  const geo = await page.evaluate(() => {
    const cv = document.querySelector('#PMwrap canvas, canvas');
    const out = { canvas: null, spritesLoaded: null, cell: null, sprite: null };
    if (cv) { const r = cv.getBoundingClientRect(); out.canvas = { w: Math.round(r.width), h: Math.round(r.height) }; }
    try { if (window.PM_ART) out.spritesLoaded = window.PM_ART.count(); } catch (e) {}
    try { if (window._PM_TEST && window._PM_TEST.geom) out.cell = window._PM_TEST.geom(); } catch (e) {}
    return out;
  });
  console.log('\n--- GEOMETRY ---');
  console.log(JSON.stringify(geo, null, 2));
  console.log('sprites loaded:', geo.spritesLoaded, '(expected 16 before the art pass, more after)');

  console.log('\n--- 404s ---');
  if (!missing.length) console.log('  none');
  else missing.forEach(m => console.log('  ' + m));

  await page.screenshot({ path: OUT });
  console.log('\nshot ->', OUT);

  await browser.close();
  srv.close();
})();
