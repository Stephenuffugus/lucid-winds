// Loads Flock the World headless from the repo and proves the fleet music system is absent (no chip, no card, no request
// for its files) while the game's own HUD mute button is present. node dev/probe-fleet-music.mjs   (from the game folder)
import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { readFileSync, existsSync, statSync } from 'fs';
import { join, extname } from 'path';
const ROOT = new URL('../../..', import.meta.url).pathname;   // the repo root: /music-unlocks.js is a root file
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.mp3': 'audio/mpeg', '.webmanifest': 'application/manifest+json', '.css': 'text/css' };
const srv = createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]); const p = join(ROOT, u.endsWith('/') ? u + 'index.html' : u); if (!p.startsWith(ROOT) || !existsSync(p) || statSync(p).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': MIME[extname(p)] || 'application/octet-stream', 'cache-control': 'no-store' }); r.end(readFileSync(p)); });
await new Promise((res) => srv.listen(8791, '127.0.0.1', res));
const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage();
await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
const requested = [];
page.on('request', (r) => requested.push(new URL(r.url()).pathname));
const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
try {
  await page.goto('http://127.0.0.1:8791/satellites/flock-the-world/?nosw=1', { waitUntil: 'load', timeout: 60000 });
  await new Promise((r) => setTimeout(r, 4000));
  const seen = await page.evaluate(() => ({ chip: !!document.getElementById('sws-music-chip'), card: !!document.querySelector('.swsm-card, #sws-music-card'), mute: !!document.getElementById('muteBtn'), api: !!window.SWS_MUSIC_UNLOCKS || !!window.SWS_MUSIC }));
  const fleet = requested.filter((p) => /music-(unlocks|player|tracks|catalog)\.js$/.test(p));
  ok(fleet.length === 0, `no fleet music file is requested (${fleet.join(', ') || 'none'})`);
  ok(!seen.chip && !seen.card, `no floating music chip or unlock card (chip ${seen.chip}, card ${seen.card})`);
  ok(seen.mute, 'the game\'s own HUD mute button is present');
} catch (e) { ok(false, 'probe crashed: ' + e.message); }
await browser.close(); srv.close();
console.log(fails.length ? `fleet music probe: ${fails.length} FAILED` : 'fleet music probe: all passed');
process.exitCode = fails.length ? 1 : 0;
