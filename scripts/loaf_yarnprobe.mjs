#!/usr/bin/env node
/* LOAF yarn gate: the tangle must be achievable.
   Throw the yarn, let her bat it and the ball roll its rainbow out, keep
   flicking until the tangle completes - then she gets wrapped and pays
   out. Trail and wrap are screenshot and READ. Usage: node scripts/loaf_yarnprobe.mjs */
import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { readFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT = join(ROOT, 'assets/loaf/shots/yarn');
mkdirSync(OUT, { recursive: true });
const srv = createServer((req, res) => {
  try { res.end(readFileSync(join(ROOT, decodeURIComponent(req.url.split('?')[0])))); }
  catch (e) { res.writeHead(404); res.end(); }
}).listen(8947);

const b = await puppeteer.launch({ headless: 'new', args: [
  '--no-sandbox', '--disable-setuid-sandbox', '--enable-unsafe-swiftshader',
  '--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
const pg = await b.newPage();
await pg.setViewport({ width: 420, height: 800 });
pg.on('pageerror', e => console.log('PAGE ERROR:', e.message));
await pg.evaluateOnNewDocument(() => localStorage.setItem('sws_dev_ok', '1'));
await pg.goto('http://127.0.0.1:8947/loaf.html', { waitUntil: 'networkidle0', timeout: 60000 });

const input = await pg.$('#file');
await input.uploadFile(join(ROOT, 'assets/loaf/refcats/oreo/oreo-couch.jpg'));
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
await pg.evaluate(() => { window.LoafCat3D._room.yarn.target = 22; });
console.log('room on, target 22');

const d3 = await pg.$('#room3d');
const box = await d3.boundingBox();
let shotTrail = false;
for (let round = 0; round < 10; round++){
  const st = await pg.evaluate(() => ({
    dots: window.LoafCat3D._room.yarn.dots,
    done: window.LoafCat3D._room.yarn.done,
    state: window.LoafCat3D._room.state
  }));
  console.log('round', round, 'dots', st.dots, 'state', st.state);
  if (st.done) break;
  if (st.dots > 6 && !shotTrail){
    shotTrail = true;
    await pg.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    await d3.screenshot({ path: join(OUT, 'yarn-trail.png') });
  }
  /* flick from a corner so we never accidentally pet her */
  const sx = box.x + 40 + (round % 2) * (box.width - 80), sy = box.y + box.height - 26;
  await pg.mouse.move(sx, sy);
  await pg.mouse.down();
  for (let i = 1; i <= 5; i++){
    await pg.mouse.move(sx + (round % 2 ? -1 : 1) * i * 16, sy - i * 15);
    await new Promise(r => setTimeout(r, 28));
  }
  await pg.mouse.up();
  await new Promise(r => setTimeout(r, 4500));
}
const fin = await pg.waitForFunction(() => window.LoafCat3D._room.yarn.done,
  { timeout: 30000, polling: 400 }).catch(() => null);
if (!fin){ console.log('FAIL: the tangle never completed'); process.exit(1); }
await new Promise(r => setTimeout(r, 1800));
await pg.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
await d3.screenshot({ path: join(OUT, 'yarn-wrapped.png') });
const note = await pg.evaluate(() => document.getElementById('roomNote').textContent);
console.log('note:', note);
if (!/TANGLE/i.test(note)){ console.log('FAIL: no tangle payout note'); process.exit(1); }
console.log('YARN PROBE COMPLETE');
await b.close(); srv.close();
