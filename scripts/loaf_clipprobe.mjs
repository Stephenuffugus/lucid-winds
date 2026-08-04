#!/usr/bin/env node
/* LOAF clip gate: the shareable artifact must actually exist.
   Manual path: tap the CLIP tool (reach-checked), 6s must produce a real
   video blob, and the share button's download fallback must land a playable
   file on disk. Auto path: complete the yarn tangle and the wrap ceremony
   must hand over its own clip labeled THE WRAP.
   Usage: node scripts/loaf_clipprobe.mjs */
import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { readFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const ROOT = new URL('..', import.meta.url).pathname;
const DL = join(tmpdir(), 'loaf-clip-dl-' + process.pid);
mkdirSync(DL, { recursive: true });
const srv = createServer((req, res) => {
  try { res.end(readFileSync(join(ROOT, decodeURIComponent(req.url.split('?')[0])))); }
  catch (e) { res.writeHead(404); res.end(); }
}).listen(8949);

const b = await puppeteer.launch({ headless: 'new', args: [
  '--no-sandbox', '--disable-setuid-sandbox', '--enable-unsafe-swiftshader',
  '--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
const pg = await b.newPage();
await pg.setViewport({ width: 420, height: 800 });
pg.on('pageerror', e => console.log('PAGE ERROR:', e.message));
const cdp = await pg.createCDPSession();
await cdp.send('Browser.setDownloadBehavior',
  { behavior: 'allow', downloadPath: DL, eventsEnabled: true });
await pg.evaluateOnNewDocument(() => localStorage.setItem('sws_dev_ok', '1'));
await pg.goto('http://127.0.0.1:8949/loaf.html', { waitUntil: 'networkidle0', timeout: 60000 });

function die(msg){ console.log('FAIL: ' + msg); process.exit(1); }
async function tap(sel, what){
  await pg.evaluate(s => document.querySelector(s).scrollIntoView({ block: 'center' }), sel);
  await new Promise(r => setTimeout(r, 350));
  const box = await (await pg.$(sel)).boundingBox();
  if (!box) die(what + ': no box');
  const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
  const hit = await pg.evaluate((s, x, y) => {
    const el = document.querySelector(s), at = document.elementFromPoint(x, y);
    return !!(at && (at === el || el.contains(at)));
  }, sel, cx, cy);
  if (!hit) die(what + ': centre of ' + sel + ' is covered');
  await pg.mouse.click(cx, cy);
}

/* mint + into the room */
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
await pg.waitForFunction(() => window.LoafCat3D && window.LoafCat3D._room.on, { timeout: 20000 });
console.log('room on');

/* 1. manual clip through the real tool button */
const hasBtn = await pg.$('#clipBtn');
if (!hasBtn) die('no #clipBtn in the tools row');
await tap('#clipBtn', 'clip tool');
const recOn = await pg.evaluate(() => window.LoafCat3D._rec);
if (!recOn) die('recorder did not start');
console.log('recording...');
await pg.waitForSelector('#clipShare:not(.hidden)', { timeout: 15000 });
let clip = await pg.evaluate(() => {
  const c = window.Room._clip;
  return c ? { size: c.blob.size, type: c.blob.type, label: c.label } : null;
});
if (!clip) die('no clip after recording');
if (clip.size < 20000) die('clip suspiciously small: ' + clip.size + ' bytes');
if (!/^video\//.test(clip.type)) die('clip is not video: ' + clip.type);
console.log('manual clip: ' + clip.label + ', ' + Math.round(clip.size / 1024) + 'KB ' + clip.type);

/* 2. the share button's download fallback must land a real file */
await tap('#clipShareBtn', 'share button');
const t0 = Date.now();
let dlFile = null;
while (Date.now() - t0 < 15000 && !dlFile){
  const fl = readdirSync(DL).filter(f => !f.endsWith('.crdownload'));
  if (fl.length) dlFile = fl[0];
  else await new Promise(r => setTimeout(r, 400));
}
if (!dlFile) die('share fallback produced no download');
const sz = statSync(join(DL, dlFile)).size;
if (sz < 20000) die('downloaded clip too small: ' + sz);
console.log('download fallback: ' + dlFile + ' (' + Math.round(sz / 1024) + 'KB)');

/* 3. the wrap ceremony hands you its own clip */
await pg.evaluate(() => {
  [...document.querySelectorAll('#tools .tool')]
    .find(t => /YARN/i.test(t.textContent)).click();
  window.LoafCat3D._room.yarn.target = 12;
  document.getElementById('room3d').scrollIntoView({ block: 'center' });
});
await new Promise(r => setTimeout(r, 350));
const d3 = await pg.$('#room3d');
const box = await d3.boundingBox();
for (let round = 0; round < 12; round++){
  const st = await pg.evaluate(() => ({
    dots: window.LoafCat3D._room.yarn.dots, done: window.LoafCat3D._room.yarn.done }));
  if (st.done) break;
  console.log('round', round, 'dots', st.dots);
  const sx = box.x + 40 + (round % 2) * (box.width - 80), sy = box.y + box.height - 26;
  await pg.mouse.move(sx, sy); await pg.mouse.down();
  for (let i = 1; i <= 5; i++){
    await pg.mouse.move(sx + (round % 2 ? -1 : 1) * i * 16, sy - i * 15);
    await new Promise(r => setTimeout(r, 28));
  }
  await pg.mouse.up();
  await new Promise(r => setTimeout(r, 4500));
}
const wrapped = await pg.waitForFunction(() => window.LoafCat3D._room.yarn.done,
  { timeout: 30000, polling: 400 }).catch(() => null);
if (!wrapped) die('tangle never completed');
console.log('wrapped; waiting for her clip...');
const auto = await pg.waitForFunction(
  () => window.Room._clip && window.Room._clip.label === 'THE WRAP',
  { timeout: 15000, polling: 400 }).catch(() => null);
if (!auto) die('wrap ceremony did not hand over a clip');
clip = await pg.evaluate(() => ({ size: window.Room._clip.blob.size }));
if (clip.size < 20000) die('wrap clip too small: ' + clip.size);
console.log('THE WRAP clip: ' + Math.round(clip.size / 1024) + 'KB. note: '
  + await pg.evaluate(() => document.getElementById('roomNote').textContent));
console.log('CLIP PROBE COMPLETE');
await b.close(); srv.close();
