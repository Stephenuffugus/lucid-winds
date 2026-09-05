/**
 * The fine aim, the Zoom and the snap card, from where the player stands.
 *   node tools/shots_aim.mjs            writes docs/shots/k3-aim-*.png at 375x667 and 412x915
 * Not a gate. Somebody opens these and names three things wrong in each.
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname, normalize } from 'node:path';
const require = createRequire(import.meta.url);
const puppeteer = require('/workspaces/lucid-winds/node_modules/puppeteer');
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = join(ROOT, '..', '..');
const OUT = join(ROOT, 'docs', 'shots');
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png' };
const FLEET = ['/music-unlocks.js', '/music-player.js', '/music-catalog.js', '/music-ladder.json'];
const server = createServer((req, res) => { const clean = decodeURIComponent(req.url.split('?')[0]); const base = FLEET.indexOf(clean) >= 0 ? SITE : ROOT; const p = join(base, normalize(clean).replace(/^(\.\.[/\\])+/, '')); if (!p.startsWith(base) || !existsSync(p)) { res.writeHead(404); res.end('no'); return; } res.writeHead(200, { 'content-type': MIME[extname(p)] || 'application/octet-stream' }); res.end(readFileSync(p)); });
await new Promise(r => server.listen(0, '127.0.0.1', r));
const BASE = 'http://127.0.0.1:' + server.address().port + '/index.html?keepsiestest=1';
const browser = await puppeteer.launch({ headless: 'new', protocolTimeout: 120000, args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const sleep = ms => new Promise(r => setTimeout(r, ms));
for (const [w, h] of [[375, 667], [412, 915]]) {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(BASE, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => window.KEEPSIES_DEV && window.KEEPSIES_DEV.state().frames > 3, { timeout: 60000 });
  await page.evaluate(() => window.KEEPSIES_DEV.start({ seed: 424242, forceFirst: 0 }));
  await page.waitForFunction(() => window.KEEPSIES_DEV.aimUi().nudge, { timeout: 20000 });
  await page.evaluate(() => { const m = document.getElementById('sws-music-min'); if (m) m.click(); });
  await sleep(1200);
  await page.screenshot({ path: join(OUT, `k3-aim-buttons-${w}.png`) });
  await page.evaluate(() => window.KEEPSIES_DEV.scopeHold(true)); await sleep(1500);
  await page.screenshot({ path: join(OUT, `k3-aim-zoom-${w}.png`) });
  // the end game: two mibs left, the scope held, after two fine taps
  await page.evaluate(() => { window.KEEPSIES_DEV.pocketAllBut && window.KEEPSIES_DEV.pocketAllBut(1); });
  await sleep(1500);
  await page.evaluate(() => { window.KEEPSIES_DEV.nudge(1); window.KEEPSIES_DEV.nudge(1); }); await sleep(1500);
  await page.screenshot({ path: join(OUT, `k3-aim-zoom-endgame-${w}.png`) });
  await page.evaluate(() => window.KEEPSIES_DEV.scopeHold(false));
  await page.evaluate(() => document.getElementById('snapHelp').click()); await sleep(800);
  await page.screenshot({ path: join(OUT, `k3-aim-card-${w}.png`) });
  console.log('shot', w + 'x' + h);
  await page.close();
}
await browser.close(); server.close();
