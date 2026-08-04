#!/usr/bin/env node
/* LOAF Room v2 gate: she LIVES there.
   Real flow to a minted card, then the Room tab: the 3D room must mount,
   her brain must wander on its own, a thrown ball must produce chase ->
   pounce -> bats, and she must eventually BRING IT BACK and ask (the
   solicit). States are read from the peephole; moments are screenshot
   and must be READ BY EYE. Usage: node scripts/loaf_roomprobe.mjs */
import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { readFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT = join(ROOT, 'assets/loaf/shots/room');
mkdirSync(OUT, { recursive: true });
const srv = createServer((req, res) => {
  try { res.end(readFileSync(join(ROOT, decodeURIComponent(req.url.split('?')[0])))); }
  catch (e) { res.writeHead(404); res.end(); }
}).listen(8942);

const b = await puppeteer.launch({ headless: 'new', args: [
  '--no-sandbox', '--disable-setuid-sandbox', '--enable-unsafe-swiftshader',
  '--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
const pg = await b.newPage();
await pg.setViewport({ width: 420, height: 800 });
pg.on('pageerror', e => console.log('PAGE ERROR:', e.message));
await pg.evaluateOnNewDocument(() => localStorage.setItem('sws_dev_ok', '1'));
await pg.goto('http://127.0.0.1:8942/loaf.html', { waitUntil: 'networkidle0', timeout: 60000 });

/* 1. a real card, fast */
const input = await pg.$('#file');
await input.uploadFile(join(ROOT, 'assets/loaf/refcats/barthalomew/bart-sidewalk.jpg'));
await pg.waitForSelector('#view-meter:not(.hidden)', { timeout: 120000 });
await pg.evaluate(() => document.getElementById('goScan').click());
await pg.waitForSelector('#view-card:not(.hidden)', { timeout: 60000 });
await pg.waitForSelector('#sheet:not(.hidden)', { timeout: 10000 }).catch(() => null);
await pg.evaluate(() => {
  const s = document.getElementById('sheet');
  if (!s.classList.contains('hidden')) document.getElementById('nameSkip').click();
});
console.log('card minted');

/* 2. into the Room */
await pg.evaluate(() => document.getElementById('tabRoom').click());
await pg.waitForFunction(() => {
  const d = document.getElementById('room3d');
  return d && !d.classList.contains('hidden')
    && window.LoafCat3D && window.LoafCat3D._room && window.LoafCat3D._room.on;
}, { timeout: 20000 });
console.log('room mounted, 3D on');

/* 3. she lives: collect states over 12s of nobody touching anything */
const seen = new Set();
for (let i = 0; i < 24; i++){
  seen.add(await pg.evaluate(() => window.LoafCat3D._room.state));
  await new Promise(r => setTimeout(r, 500));
}
console.log('idle-life states seen:', [...seen].join(','));
if (seen.size < 2){ console.log('FAIL: she never did anything on her own'); process.exit(1); }
const d3 = await pg.$('#room3d');
await d3.screenshot({ path: join(OUT, 'room-live.png') });

/* 4. throw the yarn: drag up-left from the lower-right corner */
const box = await d3.boundingBox();
const sx = box.x + box.width - 46, sy = box.y + box.height - 30;
await pg.mouse.move(sx, sy);
await pg.mouse.down();
for (let i = 1; i <= 6; i++){
  await pg.mouse.move(sx - i * 14, sy - i * 16);
  await new Promise(r => setTimeout(r, 25));
}
await pg.mouse.up();
const chased = await pg.waitForFunction(
  () => ['react', 'chase', 'pounce'].includes(window.LoafCat3D._room.state),
  { timeout: 8000 }).catch(() => null);
if (!chased){ console.log('FAIL: throw provoked nothing'); process.exit(1); }
console.log('throw -> chase');
await new Promise(r => setTimeout(r, 1600));
await d3.screenshot({ path: join(OUT, 'room-chase.png') });

/* 5. the hook: she must eventually bring it back and ask */
const asked = await pg.waitForFunction(
  () => window.LoafCat3D._room.state === 'await' || window.LoafCat3D._room.soliT > 0,
  { timeout: 90000, polling: 500 }).catch(() => null);
if (!asked){
  console.log('FAIL: she never brought it back (state=' +
    await pg.evaluate(() => window.LoafCat3D._room.state) + ')');
  process.exit(1);
}
await new Promise(r => setTimeout(r, 900));
await d3.screenshot({ path: join(OUT, 'room-solicit.png') });
console.log('SHE BROUGHT IT BACK. note:', await pg.evaluate(() =>
  document.getElementById('roomNote').textContent));

/* 6. tuner round-trip: open pulls her to the stage, close sends her home */
await pg.evaluate(() => document.getElementById('tunerToggle').click());
await pg.waitForFunction(() => !window.LoafCat3D._room.on, { timeout: 8000 });
await pg.evaluate(() => document.getElementById('tunerToggle').click());
await pg.waitForFunction(() => window.LoafCat3D._room.on, { timeout: 8000 });
console.log('tuner round-trip ok');
console.log('ROOM PROBE COMPLETE');
await b.close(); srv.close();
