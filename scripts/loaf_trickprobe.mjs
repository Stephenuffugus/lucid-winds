#!/usr/bin/env node
/* LOAF tricks gate: clicker-train Spin through the REAL UI (accordion TRAIN
   tap, real CLICK button taps inside the 0.9s mark windows), then perform a
   learned High Five and meet the paw. Screenshots must be READ BY EYE:
   spin mid-turn + the offered paw are the two shots.
   Usage: node scripts/loaf_trickprobe.mjs */
import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { readFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT = join(ROOT, 'assets/loaf/shots/tricks');
mkdirSync(OUT, { recursive: true });
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
await pg.evaluateOnNewDocument(() => localStorage.setItem('sws_dev_ok', '1'));
await pg.goto('http://127.0.0.1:8949/loaf.html', { waitUntil: 'networkidle0', timeout: 60000 });

function die(msg){ console.log('FAIL: ' + msg); process.exit(1); }
const note = () => pg.evaluate(() => document.getElementById('roomNote').textContent);
const trick = () => pg.evaluate(() => JSON.parse(JSON.stringify(window.LoafCat3D._room.trick)));

/* Reach-checked tap (the ritual-probe pattern): centre must be hittable. */
async function tap(sel, what){
  const ok = await pg.evaluate(s => {
    const el = document.querySelector(s);
    if (!el) return 'missing';
    el.scrollIntoView({ block: 'center' });
    return 'ok';
  }, sel);
  if (ok !== 'ok') die(what + ': selector ' + sel + ' ' + ok);
  await new Promise(r => setTimeout(r, 400));
  const box = await (await pg.$(sel)).boundingBox();
  if (!box) die(what + ': no box');
  const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
  const hit = await pg.evaluate((s, x, y) => {
    const el = document.querySelector(s);
    const at = document.elementFromPoint(x, y);
    return !!(at && (at === el || el.contains(at) || at.contains(el)));
  }, sel, cx, cy);
  if (!hit) die(what + ': centre of ' + sel + ' is covered by something else');
  await pg.mouse.click(cx, cy);
}

/* 1. mint a card, into the room */
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
await pg.waitForFunction(() => window.LoafCat3D && window.LoafCat3D._room
  && window.LoafCat3D._room.on, { timeout: 20000 });
console.log('room on');

/* 2. the accordion: four fresh tricks, all TRAIN */
await tap('#tricksToggle', 'tricks accordion');
await pg.waitForSelector('#tkList .need', { timeout: 5000 });
const rows = await pg.evaluate(() =>
  [...document.querySelectorAll('#tkList .need')].map(r => ({
    name: r.querySelector('b').textContent,
    dots: r.querySelector('span').textContent,
    btn: r.querySelector('button').textContent })));
if (rows.length !== 4) die('expected 4 trick rows, got ' + rows.length);
if (!rows.every(r => r.btn === 'TRAIN' && r.dots === '○○○'))
  die('fresh rows wrong: ' + JSON.stringify(rows));
console.log('panel: ' + rows.map(r => r.name).join(' / ') + ', all TRAIN ○○○');

/* 3. TRAIN Spin: reach-checked tap, then the session runs in the room */
await tap('#tkList button[data-trick="spin"]', 'TRAIN spin');
await pg.waitForFunction(() => window.LoafCat3D._room.trick.on, { timeout: 5000 });
let T = await trick();
if (T.key !== 'spin' || !T.train) die('trick state wrong: ' + JSON.stringify(T));
console.log('spin session started, she is walking over');

/* the CLICK button must be visible and hittable; measure it ONCE while she
   walks, because the 0.9s mark window has no time for a scroll-and-settle */
await pg.evaluate(() => document.getElementById('room3d').scrollIntoView({ block: 'center' }));
await new Promise(r => setTimeout(r, 500));
const cb = await pg.$('#trickClick');
if (!cb) die('no CLICK button in the room');
const cbox = await cb.boundingBox();
if (!cbox) die('CLICK button has no box (display:none?)');
const ccx = cbox.x + cbox.width / 2, ccy = cbox.y + cbox.height / 2;
const reach = await pg.evaluate((x, y) => {
  const at = document.elementFromPoint(x, y);
  return !!(at && at.id === 'trickClick');
}, ccx, ccy);
if (!reach) die('CLICK button centre is covered');
console.log('CLICK button reachable at ' + Math.round(ccx) + ',' + Math.round(ccy));

/* 4. three reps: catch each mark window with a real tap */
let shotSpin = false;
for (let rep = 1; rep <= 3; rep++){
  if (rep === 2 && !shotSpin){
    await pg.waitForFunction(() => window.LoafCat3D._room.trick.phase === 'act',
      { timeout: 15000, polling: 60 }).catch(() => null);
    await (await pg.$('#room3d')).screenshot({ path: join(OUT, 'spin-act.png') });
    shotSpin = true;
  }
  const win = await pg.waitForFunction(
    () => window.LoafCat3D._room.trick.winT > 0,
    { timeout: 20000, polling: 60 }).catch(() => null);
  if (!win) die('mark window ' + rep + ' never opened');
  await pg.mouse.click(ccx, ccy);
  await new Promise(r => setTimeout(r, 150));
  T = await trick();
  console.log('rep ' + rep + ': marks=' + T.marks + ' phase=' + T.phase);
}
await pg.waitForFunction(() => !window.LoafCat3D._room.trick.on,
  { timeout: 15000, polling: 100 });
T = await trick();
if (T.marks < 2) die('only ' + T.marks + ' of 3 marks landed; the window is too tight');
const n1 = await note();
if (!/Session 1 of 3|Three clean marks/.test(n1)) die('session note wrong: "' + n1 + '"');
const led = await pg.evaluate(() => Room.card.tricks.spin);
if (!led || led.s !== 1) die('ledger wrong: ' + JSON.stringify(led));
const btnNow = await pg.evaluate(() =>
  document.querySelector('#tkList button[data-trick="spin"]').textContent);
if (btnNow !== 'TOMORROW') die('spin button did not lock for the day: ' + btnNow);
console.log('session logged: s=1, ' + T.marks + '/3 marks, button now TOMORROW. "' + n1 + '"');

/* 5. seed a LEARNED High Five, reopen panel, ASK, meet the paw */
await pg.evaluate(() => {
  Room.card.tricks.five = { s: 3, last: '', perf: '', knownAt: '2026-01-01' };
  window.LOAF.Store.update(l => {
    const c = l.find(x => x.id === Room.card.id);
    if (c) c.tricks = Room.card.tricks;
    return l;
  });
  document.getElementById('tricksToggle').click();   /* close */
  document.getElementById('tricksToggle').click();   /* reopen = redraw */
});
await tap('#tkList button[data-trick="five"]', 'ASK high five');
await pg.waitForFunction(() => window.LoafCat3D._room.trick.on, { timeout: 5000 });
const hold = await pg.waitForFunction(
  () => window.LoafCat3D._room.trick.phase === 'hold',
  { timeout: 20000, polling: 60 }).catch(() => null);
if (!hold) die('high five never reached the hold');
await new Promise(r => setTimeout(r, 450));          /* camera leans in */
await pg.evaluate(() => document.getElementById('room3d').scrollIntoView({ block: 'center' }));
await (await pg.$('#room3d')).screenshot({ path: join(OUT, 'five-hold.png') });
/* meet the paw: tap on HER (project her spot to the screen) */
const d3 = await pg.$('#room3d');
const box3 = await d3.boundingBox();
const ndc = await pg.evaluate(() => window.LoafCat3D._project(0, 1.55));
await pg.mouse.click(box3.x + (ndc.x + 1) / 2 * box3.width,
                     box3.y + (1 - ndc.y) / 2 * box3.height - 20);
await pg.waitForFunction(() => !window.LoafCat3D._room.trick.on,
  { timeout: 10000, polling: 100 });
const n2 = await note();
if (!/paw was offered/.test(n2)) die('perform note wrong: "' + n2 + '"');
const perf = await pg.evaluate(() => Room.card.tricks.five.perf);
if (!perf) die('perform day not logged');
console.log('high five performed and met. "' + n2 + '"');

/* 6. persistence: reload, the ledger survives, buttons read right */
await pg.reload({ waitUntil: 'networkidle0' });
await pg.evaluate(() => document.getElementById('tabRoom').click());
await pg.waitForFunction(() => window.Room && Room.card && Room.card.pet, { timeout: 20000 });
await pg.evaluate(() => document.getElementById('tricksToggle').click());
await pg.waitForSelector('#tkList .need', { timeout: 5000 });
const after = await pg.evaluate(() => ({
  spin: document.querySelector('#tkList button[data-trick="spin"]').textContent,
  five: document.querySelector('#tkList button[data-trick="five"]').textContent,
  led: Room.card.tricks }));
if (after.spin !== 'TOMORROW') die('reload: spin should be TOMORROW, got ' + after.spin);
if (after.five !== 'ASK') die('reload: five should be ASK, got ' + after.five);
if (after.led.spin.s !== 1 || after.led.five.s !== 3)
  die('reload ledger wrong: ' + JSON.stringify(after.led));
console.log('reload: ledger + buttons persist. TRICK PROBE COMPLETE');
console.log('READ THE SHOTS: ' + OUT + '/spin-act.png + five-hold.png');
await b.close(); srv.close();
