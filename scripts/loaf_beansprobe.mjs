#!/usr/bin/env node
/* LOAF bean press gate: the calm must work.
   Select Beans, she must come to the front and roll belly-up with the
   camera leaning in; a press on her must flex a paw, start the purr and
   the slow blink; holding must knead. Switching away must stand her up.
   Usage: node scripts/loaf_beansprobe.mjs */
import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { readFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT = join(ROOT, 'assets/loaf/shots/beans');
mkdirSync(OUT, { recursive: true });
const srv = createServer((req, res) => {
  try { res.end(readFileSync(join(ROOT, decodeURIComponent(req.url.split('?')[0])))); }
  catch (e) { res.writeHead(404); res.end(); }
}).listen(8948);

const b = await puppeteer.launch({ headless: 'new', args: [
  '--no-sandbox', '--disable-setuid-sandbox', '--enable-unsafe-swiftshader',
  '--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
const pg = await b.newPage();
await pg.setViewport({ width: 420, height: 800 });
pg.on('pageerror', e => console.log('PAGE ERROR:', e.message));
await pg.evaluateOnNewDocument(() => localStorage.setItem('sws_dev_ok', '1'));
await pg.goto('http://127.0.0.1:8948/loaf.html', { waitUntil: 'networkidle0', timeout: 60000 });

const input = await pg.$('#file');
await input.uploadFile(join(ROOT, 'assets/loaf/refcats/barthalomew/bart-sidewalk.jpg'));
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
  const btn = [...document.querySelectorAll('#tools .tool')].find(x => /Beans/i.test(x.textContent));
  btn.click();
});
const posed = await pg.waitForFunction(() => window.LoafCat3D._room.state === 'beans',
  { timeout: 30000, polling: 300 }).catch(() => null);
if (!posed){ console.log('FAIL: she never rolled over'); process.exit(1); }
await new Promise(r => setTimeout(r, 2600));      /* the roll + the camera lean */
await pg.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
const d3 = await pg.$('#room3d');
await d3.screenshot({ path: join(OUT, 'beans-up.png') });
console.log('belly up, note:', await pg.evaluate(() => document.getElementById('roomNote').textContent));

/* press her, dead centre of the frame */
const box = await d3.boundingBox();
const cx = box.x + box.width / 2, cy = box.y + box.height * 0.55;
await pg.mouse.move(cx, cy);
await pg.mouse.down();
await new Promise(r => setTimeout(r, 300));
const press = await pg.evaluate(() => ({
  pulse: window.LoafCat3D._room.beans.pulse, paw: window.LoafCat3D._room.beans.paw }));
console.log('press:', JSON.stringify(press));
if (!(press.pulse > 0) || !press.paw){ console.log('FAIL: press registered nothing'); process.exit(1); }

/* hold: biscuits */
await new Promise(r => setTimeout(r, 2000));
const held = await pg.evaluate(() => window.LoafCat3D._room.beans.held);
if (!(held > 1.1)){ console.log('FAIL: hold never reached kneading (' + held + ')'); process.exit(1); }
await pg.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
await d3.screenshot({ path: join(OUT, 'beans-knead.png') });
console.log('kneading at held', held.toFixed(2));
await pg.mouse.up();

/* switching away stands her up and returns the camera */
await pg.evaluate(() => {
  const btn = [...document.querySelectorAll('#tools .tool')].find(x => /Yarn/i.test(x.textContent));
  btn.click();
});
const upAgain = await pg.waitForFunction(() => !window.LoafCat3D._room.beans.on,
  { timeout: 10000, polling: 300 }).catch(() => null);
if (!upAgain){ console.log('FAIL: beans mode never released'); process.exit(1); }
console.log('BEANS PROBE COMPLETE');
await b.close(); srv.close();
