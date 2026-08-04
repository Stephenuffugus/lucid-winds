#!/usr/bin/env node
/* LOAF head-spin gate: additive pose edits must never accumulate.
   Regression caught live 2026-08-04: gltfpack pruned constant rotation
   tracks, so clips that never move the head (Walk, Gallop) left the bone
   unwritten and the look-at's additive multiply wound the head into a slow
   360. This drives 30 seconds of circling pointer (worst case for look-at),
   then parks the pointer centre-front and asserts the head bone is within
   a normal look-at's reach of identity. Shots are taken for the eye.
   Usage: node scripts/loaf_spinprobe.mjs */
import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { readFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT = join(ROOT, 'assets/loaf/shots/spin');
mkdirSync(OUT, { recursive: true });
const srv = createServer((req, res) => {
  try { res.end(readFileSync(join(ROOT, decodeURIComponent(req.url.split('?')[0])))); }
  catch (e) { res.writeHead(404); res.end(); }
}).listen(8964);

const b = await puppeteer.launch({ headless: 'new', args: [
  '--no-sandbox', '--disable-setuid-sandbox', '--enable-unsafe-swiftshader',
  '--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
const pg = await b.newPage();
await pg.setViewport({ width: 420, height: 800 });
pg.on('pageerror', e => console.log('PAGE ERROR:', e.message));
await pg.evaluateOnNewDocument(() => localStorage.setItem('sws_dev_ok', '1'));
await pg.goto('http://127.0.0.1:8964/loaf.html', { waitUntil: 'networkidle0', timeout: 60000 });

function die(msg){ console.log('FAIL: ' + msg); process.exit(1); }

const input = await pg.$('#file');
await input.uploadFile(join(ROOT, 'assets/loaf/refcats/oreo/oreo-couch.jpg'));
await pg.waitForSelector('#view-meter:not(.hidden)', { timeout: 120000 });
await pg.evaluate(() => document.getElementById('goScan').click());
await pg.waitForSelector('#view-card:not(.hidden)', { timeout: 60000 });
await pg.evaluate(() => {
  const sh = document.getElementById('sheet');
  if (!sh.classList.contains('hidden')) document.getElementById('nameSkip').click();
});
await pg.evaluate(() => document.getElementById('tabRoom').click());
await pg.waitForFunction(() => window.LoafCat3D && window.LoafCat3D._room.on, { timeout: 20000 });
console.log('room on; circling the pointer for 30s...');

const d3 = await pg.$('#room3d');
const box = await d3.boundingBox();
let worst = 0;
for (let i = 0; i < 75; i++){
  const a = i / 12 * Math.PI * 2;
  await pg.mouse.move(box.x + box.width / 2 + Math.cos(a) * 130,
                      box.y + box.height / 2 + Math.sin(a) * 90);
  await new Promise(r => setTimeout(r, 400));
  if (i % 12 === 0){
    const q = await pg.evaluate(() => window.LoafCat3D._boneQ('head'));
    if (q){
      const ang = 2 * Math.acos(Math.min(1, Math.abs(q[3])));
      worst = Math.max(worst, ang);
    }
  }
}
console.log('worst mid-drive head angle: ' + worst.toFixed(2) + ' rad');

/* park the pointer centre-front, let the look ease, then measure */
await pg.mouse.move(box.x + box.width / 2, box.y + box.height * 0.8);
await new Promise(r => setTimeout(r, 2500));
const q = await pg.evaluate(() => window.LoafCat3D._boneQ('head'));
if (!q) die('no head bone readable');
const ang = 2 * Math.acos(Math.min(1, Math.abs(q[3])));
console.log('settled head angle from identity: ' + ang.toFixed(3) + ' rad');
/* a legitimate look-at reaches ~0.45 rad; accumulation reaches pi and beyond */
if (ang > 0.8) die('head has wound up ' + ang.toFixed(2) + ' rad — additive accumulation is back');
if (worst > 1.6) die('head exceeded any sane look-at mid-drive (' + worst.toFixed(2) + ' rad)');
await pg.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
await d3.screenshot({ path: join(OUT, 'spin-settled.png') });
console.log('SPIN PROBE COMPLETE');
await b.close(); srv.close();
