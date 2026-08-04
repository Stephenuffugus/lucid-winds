#!/usr/bin/env node
/* LOAF life-layer gate: does she NOTICE you?
   - look-at: pointer parked left vs right must turn her head (shot pair)
   - petting: a stroke ACROSS HER BODY must register (life.pet > 0) and
     must NOT rotate the rig; a background drag must rotate the rig.
   Usage: node scripts/loaf3d_lifeprobe.mjs */
import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { readFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT = join(ROOT, 'assets/loaf/shots/life');
mkdirSync(OUT, { recursive: true });
const srv = createServer((req, res) => {
  try { res.end(readFileSync(join(ROOT, decodeURIComponent(req.url.split('?')[0])))); }
  catch (e) { res.writeHead(404); res.end(); }
}).listen(8940);

const b = await puppeteer.launch({ headless: 'new', args: [
  '--no-sandbox', '--disable-setuid-sandbox', '--enable-unsafe-swiftshader',
  '--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
const pg = await b.newPage();
await pg.setViewport({ width: 720, height: 900 });
pg.on('pageerror', e => console.log('PAGE ERROR:', e.message));
await pg.evaluateOnNewDocument(() => localStorage.setItem('sws_dev_ok', '1'));
await pg.goto('http://127.0.0.1:8940/loaf.html', { waitUntil: 'networkidle0', timeout: 60000 });
await pg.waitForFunction(() => window.LoafCat3D && window.__loafLife, { timeout: 30000 });
await pg.evaluate(() => {
  document.getElementById('view-room').classList.remove('hidden');
  document.getElementById('tunerBody').classList.remove('hidden');
  document.getElementById('tuner').scrollIntoView();
});
await new Promise(r => setTimeout(r, 1400));

const box = await (await pg.$('#stage3d')).boundingBox();
const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
const raf3 = () => pg.evaluate(() => new Promise(r =>
  requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r)))));

/* 1. look-at pair */
await pg.mouse.move(box.x + 30, box.y + 40);
await new Promise(r => setTimeout(r, 700)); await raf3();
await (await pg.$('#stage3d')).screenshot({ path: join(OUT, 'look-left.png') });
await pg.mouse.move(box.x + box.width - 30, box.y + 40);
await new Promise(r => setTimeout(r, 700)); await raf3();
await (await pg.$('#stage3d')).screenshot({ path: join(OUT, 'look-right.png') });
console.log('look shots taken');

/* 2. stroke across her body (centre of stage = the cat) */
const yaw0 = await pg.evaluate(() => window.__loafLife.lastYaw);
await pg.mouse.move(cx - 60, cy);
await pg.mouse.down();
for (let i = -60; i <= 60; i += 12){ await pg.mouse.move(cx + i, cy); await new Promise(r => setTimeout(r, 30)); }
const mid = await pg.evaluate(() => ({ pet: window.__loafLife.pet }));
await pg.mouse.up();
const yaw1 = await pg.evaluate(() => window.__loafLife.lastYaw);
await raf3();
await (await pg.$('#stage3d')).screenshot({ path: join(OUT, 'petting.png') });
console.log('stroke: pet =', mid.pet.toFixed(2), 'rigYawDrift =', Math.abs(yaw1 - yaw0).toFixed(3));
if (mid.pet <= 0){ console.log('FAIL: stroking her registered nothing'); process.exit(1); }
if (Math.abs(yaw1 - yaw0) > 0.02){ console.log('FAIL: petting spun the rig'); process.exit(1); }

/* 3. background drag must still rotate */
await pg.mouse.move(box.x + 24, box.y + box.height - 24);
await pg.mouse.down();
for (let i = 0; i <= 80; i += 16){ await pg.mouse.move(box.x + 24 + i, box.y + box.height - 24); await new Promise(r => setTimeout(r, 25)); }
await pg.mouse.up();
const yaw2 = await pg.evaluate(() => window.__loafLife.lastYaw);
if (Math.abs(yaw2 - yaw1) < 0.05){ console.log('FAIL: background drag no longer turns her'); process.exit(1); }
console.log('background drag rotates: ok');
console.log('LIFE PROBE COMPLETE');
await b.close(); srv.close();
