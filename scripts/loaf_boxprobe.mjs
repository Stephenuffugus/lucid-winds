#!/usr/bin/env node
/* LOAF box-law gate: throw the Box toy for real, the landed box becomes
   furniture, and she MUST eventually sit in it (deadline honored). Small
   box = overflow loaf with the rim lift. Both sits screenshotted and READ.
   Usage: node scripts/loaf_boxprobe.mjs */
import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { readFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT = join(ROOT, 'assets/loaf/shots/box');
mkdirSync(OUT, { recursive: true });
const srv = createServer((req, res) => {
  try { res.end(readFileSync(join(ROOT, decodeURIComponent(req.url.split('?')[0])))); }
  catch (e) { res.writeHead(404); res.end(); }
}).listen(8958);

const b = await puppeteer.launch({ headless: 'new', args: [
  '--no-sandbox', '--disable-setuid-sandbox', '--enable-unsafe-swiftshader',
  '--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
const pg = await b.newPage();
await pg.setViewport({ width: 420, height: 800 });
pg.on('pageerror', e => console.log('PAGE ERROR:', e.message));
await pg.evaluateOnNewDocument(() => localStorage.setItem('sws_dev_ok', '1'));
await pg.goto('http://127.0.0.1:8958/loaf.html', { waitUntil: 'networkidle0', timeout: 60000 });

function die(msg){ console.log('FAIL: ' + msg); process.exit(1); }
const note = () => pg.evaluate(() => document.getElementById('roomNote').textContent);

/* mint + room */
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
await pg.evaluate(() => document.getElementById('tabRoom').click());
await pg.waitForFunction(() => window.LoafCat3D && window.LoafCat3D._room.on, { timeout: 20000 });
await pg.waitForFunction(
  () => document.getElementById('room3d').getBoundingClientRect().y >= 0,
  { timeout: 4000, polling: 100 });
console.log('room on');

async function throwBox(forceSmall){
  const prevAt = await pg.evaluate(() =>
    window.LoafCat3D._room.box ? window.LoafCat3D._room.box.at : -1);
  await pg.evaluate(fs => {
    window.LoafCat3D._boxSmall(fs);
    [...document.querySelectorAll('#tools .tool')].find(x => /Box/i.test(x.textContent)).click();
    document.getElementById('room3d').scrollIntoView({ block: 'center' });
  }, forceSmall);
  await new Promise(r => setTimeout(r, 400));
  const box = await (await pg.$('#room3d')).boundingBox();
  const sx = box.x + box.width - 60, sy = box.y + box.height - 40;
  await pg.mouse.move(sx, sy); await pg.mouse.down();
  for (let i = 1; i <= 6; i++){ await pg.mouse.move(sx - i * 14, sy - i * 15); await new Promise(r => setTimeout(r, 25)); }
  await pg.mouse.up();
  const placed = await pg.waitForFunction(pv =>
    window.LoafCat3D._room.box && window.LoafCat3D._room.box.at !== pv,
    { timeout: 20000, polling: 150 }, prevAt).catch(() => null);
  if (!placed) die('box never became furniture after the throw');
  return pg.evaluate(() => JSON.parse(JSON.stringify(window.LoafCat3D._room.box)));
}

/* 1. NORMAL box: placed, then the law - she must sit */
let bx = await throwBox(false);
if (bx.small) die('forced normal box came up small');
console.log('box placed at ' + bx.x.toFixed(2) + ',' + bx.z.toFixed(2));
/* pull the "eventually" deadline in so the gate is not a 25s stakeout */
await pg.evaluate(() => { window.LoafCat3D._room.box.at -= 22; });
const sat = await pg.waitForFunction(() => window.LoafCat3D._room.state === 'boxsit',
  { timeout: 45000, polling: 200 }).catch(() => null);
if (!sat) die('she never sat in the box (state=' +
  await pg.evaluate(() => window.LoafCat3D._room.state) + ')');
const inBox = await pg.evaluate(() => {
  const p = window.LoafCat3D._rig(), bx2 = window.LoafCat3D._room.box;
  return { d: Math.hypot(p[0] - bx2.x, p[2] - bx2.z), y: p[1] };
});
if (inBox.d > 0.35) die('boxsit but she is ' + inBox.d.toFixed(2) + ' from the box');
if (inBox.y !== 0) die('normal box should not lift her (y=' + inBox.y + ')');
const n1 = await note();
if (!/She is in the box/.test(n1)) die('sit note wrong: "' + n1 + '"');
await new Promise(r => setTimeout(r, 1600));            /* let the loaf settle */
await pg.evaluate(() => document.getElementById('room3d').scrollIntoView({ block: 'center' }));
await new Promise(r => setTimeout(r, 300));
await (await pg.$('#room3d')).screenshot({ path: join(OUT, 'box-sit.png') });
console.log('THE LAW HELD: she sat. "' + n1 + '"');

/* 2. she leaves on her own; the box stays */
await pg.evaluate(() => { window.LoafCat3D._room.stateT = 0.1; });
await pg.waitForFunction(() => window.LoafCat3D._room.state !== 'boxsit',
  { timeout: 10000, polling: 200 });
if (!await pg.evaluate(() => !!window.LoafCat3D._room.box)) die('box vanished when she left');
console.log('she left; the box remains furniture');

/* 3. SMALL box: overflow loaf, rim lift on */
bx = await throwBox(true);
if (!bx.small) die('forced small box came up normal');
await pg.evaluate(() => { window.LoafCat3D._room.box.at -= 22; });
const sat2 = await pg.waitForFunction(() => window.LoafCat3D._room.state === 'boxsit',
  { timeout: 45000, polling: 200 }).catch(() => null);
if (!sat2) die('she never sat in the SMALL box');
const lift = await pg.evaluate(() => window.LoafCat3D._rig()[1]);
if (lift <= 0.10) die('overflow loaf has no rim lift (y=' + lift + ')');
const n2 = await note();
if (!/OVERFLOW LOAF/.test(n2)) die('overflow note wrong: "' + n2 + '"');
await new Promise(r => setTimeout(r, 1600));
await pg.evaluate(() => document.getElementById('room3d').scrollIntoView({ block: 'center' }));
await new Promise(r => setTimeout(r, 300));
await (await pg.$('#room3d')).screenshot({ path: join(OUT, 'box-overflow.png') });
console.log('OVERFLOW LOAF: y=' + lift.toFixed(2) + '. "' + n2 + '"');

/* 4. leaving the small box drops the lift */
await pg.evaluate(() => { window.LoafCat3D._room.stateT = 0.1; });
await pg.waitForFunction(() => window.LoafCat3D._room.state !== 'boxsit'
  && window.LoafCat3D._rig()[1] === 0, { timeout: 10000, polling: 200 });
console.log('rim lift released on exit. BOX PROBE COMPLETE');
console.log('READ THE SHOTS: ' + OUT + '/box-sit.png + box-overflow.png');
await b.close(); srv.close();
