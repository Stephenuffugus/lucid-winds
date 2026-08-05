#!/usr/bin/env node
/* LOAF fishing gate: the pond must be fishable.
   Select the Pond tool, wait for her to take her seat at the water, work
   the lure (twitch, then stillness), watch her TENSION climb - the pupil
   tell - and release at the top. A real catch must land in the Fish Book.
   Usage: node scripts/loaf_fishprobe.mjs */
import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { readFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT = join(ROOT, 'assets/loaf/shots/fish');
mkdirSync(OUT, { recursive: true });
const srv = createServer((req, res) => {
  try { res.end(readFileSync(join(ROOT, decodeURIComponent(req.url.split('?')[0])))); }
  catch (e) { res.writeHead(404); res.end(); }
}).listen(8946);

const b = await puppeteer.launch({ headless: 'new', args: [
  '--no-sandbox', '--disable-setuid-sandbox', '--enable-unsafe-swiftshader',
  '--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
const pg = await b.newPage();
await pg.setViewport({ width: 420, height: 800 });
pg.on('pageerror', e => console.log('PAGE ERROR:', e.message));
await pg.evaluateOnNewDocument(() => localStorage.setItem('sws_dev_ok', '1'));
await pg.goto('http://127.0.0.1:8946/loaf.html', { waitUntil: 'networkidle0', timeout: 60000 });

const input = await pg.$('#file');
await input.uploadFile(join(ROOT, 'assets/loaf/refcats/barthalomew/bart-portrait.jpg'));
await pg.waitForSelector('#view-meter:not(.hidden)', { timeout: 120000 });
await pg.evaluate(() => document.getElementById('goScan').click());
await pg.waitForSelector('#view-card:not(.hidden)', { timeout: 60000 });
await pg.waitForSelector('#sheet:not(.hidden)', { timeout: 10000 }).catch(() => null);
await pg.evaluate(() => {
  const sh = document.getElementById('sheet');
  if (!sh.classList.contains('hidden')) document.getElementById('nameSkip').click();
});
await pg.evaluate(() => document.getElementById('tabRoom').click());
await pg.waitForFunction(() => window.LoafCat3D && window.LoafCat3D._room && window.LoafCat3D._room.on,
  { timeout: 20000 });
console.log('room on');

await pg.evaluate(() => {
  const btn = [...document.querySelectorAll('#tools .tool')].find(x => /Pond/i.test(x.textContent));
  btn.click();
});
const seated = await pg.waitForFunction(() => window.LoafCat3D._room.state === 'fish',
  { timeout: 30000, polling: 300 }).catch(() => null);
if (!seated){ console.log('FAIL: she never took her seat at the pond'); process.exit(1); }
console.log('at the water');

/* the app promises to LAND you on the room - hold it to that (a stale
   smooth scroll from the scan flow once stole the viewport back) */
await pg.waitForFunction(
  () => document.getElementById('room3d').getBoundingClientRect().y >= 0,
  { timeout: 4000, polling: 100 });
const d3 = await pg.$('#room3d');
const box = await d3.boundingBox();
const toPx = ndc => ({ x: box.x + (ndc.x + 1) / 2 * box.width,
                       y: box.y + (1 - ndc.y) / 2 * box.height });

let caught = false, lastNote = '';
for (let session = 0; session < 4 && !caught; session++){
  const pc = toPx(await pg.evaluate(() => window.LoafCat3D._project(-1.55, 0.75)));
  await pg.mouse.move(pc.x, pc.y);
  await pg.mouse.down();
  let peak = 0, shot = false;
  const t0 = Date.now();
  while (Date.now() - t0 < 45000){
    /* twitch, then stillness - the good-play rhythm */
    for (let i = 0; i < 3; i++){
      await pg.mouse.move(pc.x + (Math.random() - 0.5) * 14, pc.y + (Math.random() - 0.5) * 10);
      await new Promise(r => setTimeout(r, 90));
    }
    await new Promise(r => setTimeout(r, 1400));
    const st = await pg.evaluate(() => ({
      tension: window.LoafCat3D._room.fish.tension,
      state: window.LoafCat3D._room.state
    }));
    peak = Math.max(peak, st.tension);
    if (st.tension > 0.45 && !shot){
      shot = true;
      await pg.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
      await d3.screenshot({ path: join(OUT, 'fish-tension.png') });
    }
    if (st.tension > 0.6) break;
  }
  console.log('session', session, 'peak tension', peak.toFixed(2));
  await pg.mouse.up();
  await new Promise(r => setTimeout(r, 1400));
  await pg.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  await d3.screenshot({ path: join(OUT, 'fish-strike.png') });
  lastNote = await pg.evaluate(() => document.getElementById('roomNote').textContent);
  console.log('note:', lastNote);
  const book = await pg.evaluate(() => window.LOAF.Store.read()[0].fishBook || null);
  if (book && Object.keys(book).length){ caught = true; console.log('FISH BOOK:', JSON.stringify(book)); }
}
if (!caught){ console.log('FAIL: four sessions, nothing in the book'); process.exit(1); }
console.log('FISH PROBE COMPLETE');
await b.close(); srv.close();
