#!/usr/bin/env node
/* LOAF daily ritual gate: greet / tend / mood / shape / play, then the bonus.
   Real flow: mint a card, open the Room, and complete the whole ritual through
   the actual UI. Every NEW control is reach-checked with elementFromPoint
   before it is tapped (never el.click() on the thing under test). Ends with a
   reload to prove the ritual persists for the day. Screenshots must be READ.
   Usage: node scripts/loaf_ritualprobe.mjs */
import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { readFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT = join(ROOT, 'assets/loaf/shots/ritual');
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

function die(msg){ console.log('FAIL: ' + msg); process.exit(1); }
const note = () => pg.evaluate(() => document.getElementById('roomNote').textContent);
const rit = () => pg.evaluate(() => JSON.parse(JSON.stringify(Room.card.pet.ritual || null)));

/* Reach-checked tap: the element must actually be hittable at its centre. */
async function tap(sel, what){
  const ok = await pg.evaluate(s => {
    const el = document.querySelector(s);
    if (!el) return 'missing';
    el.scrollIntoView({ block: 'center' });
    return 'ok';
  }, sel);
  if (ok !== 'ok') die(what + ': selector ' + sel + ' ' + ok);
  await new Promise(r => setTimeout(r, 350));
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

/* 1. mint a card */
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

/* 2. into the Room: the strip must render, greet auto-done, BOND framing */
await pg.evaluate(() => document.getElementById('tabRoom').click());
await pg.waitForFunction(() => {
  const d = document.getElementById('room3d');
  return d && !d.classList.contains('hidden') && window.LoafCat3D._room.on;
}, { timeout: 20000 });
let r = await rit();
if (!r) die('no ritual state after room open');
if (!r.greet) die('greet did not auto-complete on arrival');
if (r.done) die('ritual claims done at step one');
const hud = await pg.evaluate(() => document.getElementById('hudLv').textContent);
if (!/^BOND /.test(hud)) die('HUD still says "' + hud + '", not BOND');
const head = await pg.evaluate(() => document.querySelector('#ritual .ritHead').textContent);
if (!/DAY 1 TOGETHER/.test(head)) die('days-together header wrong: ' + head);
console.log('strip up. greet ✓, ' + hud + ', ' + head.trim());

/* 3. MOOD: tap the third chip, reach-checked */
await tap('#ritual .ritRow .rit:nth-child(3)', 'mood chip');
r = await rit();
if (!r.mood || !r.moodK) die('mood not revealed');
const n1 = await note();
if (!/^Today she is /.test(n1)) die('mood note wrong: ' + n1);
const m3d = await pg.evaluate(() => window.LoafCat3D._mood);
if (m3d !== r.moodK) die('3D brain mood ' + m3d + ' != ' + r.moodK);
console.log('mood: ' + r.moodK + ' -> brain has it. "' + n1 + '"');

/* 4. SHAPE: open the strip, file the first posture */
await tap('#ritual .ritRow .rit:nth-child(4)', 'shape chip');
await pg.waitForSelector('#ritual .ritShapes', { timeout: 4000 });
await tap('#ritual .ritShapes .sh:first-child', 'first posture');
r = await rit();
if (!r.shape) die('shape not filed');
const tally = await pg.evaluate(() => Room.card.shapeTally);
if (!tally || !Object.keys(tally).length) die('shapeTally empty');
console.log('shape filed: ' + JSON.stringify(tally) + '. "' + await note() + '"');

/* 5. TEND: treat tool, thrown for real */
await pg.evaluate(() => {
  [...document.querySelectorAll('#tools .tool')]
    .find(t => /TREAT/i.test(t.textContent)).click();
  document.getElementById('room3d').scrollIntoView({ block: 'center' });
});
await new Promise(res => setTimeout(res, 350));
const d3 = await pg.$('#room3d');
let box = await d3.boundingBox();
let sx = box.x + box.width - 50, sy = box.y + box.height - 34;
await pg.mouse.move(sx, sy); await pg.mouse.down();
for (let i = 1; i <= 6; i++){ await pg.mouse.move(sx - i * 13, sy - i * 15); await new Promise(res => setTimeout(res, 25)); }
await pg.mouse.up();
const fedOk = await pg.waitForFunction(
  () => Room.card.pet.ritual.tend === 1, { timeout: 25000, polling: 400 }).catch(() => null);
if (!fedOk) die('tend never completed after the treat');
console.log('tend ✓ (she ate). "' + await note() + '"');

/* 6. PLAY: throw the yarn ball, first bats pay */
await pg.evaluate(() => {
  [...document.querySelectorAll('#tools .tool')]
    .find(t => /YARN/i.test(t.textContent)).click();
  document.getElementById('room3d').scrollIntoView({ block: 'center' });
});
await new Promise(res => setTimeout(res, 350));
box = await d3.boundingBox();
const kb0 = await pg.evaluate(() => Room.card.pet.kibble);
const lv0 = await pg.evaluate(() => Room.card.pet.level);
for (let tries = 0; tries < 3; tries++){
  sx = box.x + box.width - 50; sy = box.y + box.height - 34;
  await pg.mouse.move(sx, sy); await pg.mouse.down();
  for (let i = 1; i <= 6; i++){ await pg.mouse.move(sx - i * 13, sy - i * 15); await new Promise(res => setTimeout(res, 25)); }
  await pg.mouse.up();
  const played = await pg.waitForFunction(
    () => Room.card.pet.ritual.play === 1, { timeout: 30000, polling: 400 }).catch(() => null);
  if (played) break;
  if (tries === 2) die('play never completed after 3 throws');
}
r = await rit();
if (!r.done) die('all five steps done but ritual.done is not set: ' + JSON.stringify(r));
const kb1 = await pg.evaluate(() => Room.card.pet.kibble);
const lv1 = await pg.evaluate(() => Room.card.pet.level);
console.log('play ✓ -> RITUAL DONE. kibble ' + kb0 + '->' + kb1 + ', bond lv ' + lv0 + '->' + lv1);
console.log('final note: "' + await note() + '"');
const headDone = await pg.evaluate(() => document.querySelector('#ritual .ritHead').textContent);
if (!/RITUAL IS DONE/.test(headDone)) die('header did not flip to done: ' + headDone);
await pg.evaluate(() => document.getElementById('ritual').scrollIntoView({ block: 'center' }));
await new Promise(res => setTimeout(res, 400));
await (await pg.$('#roomLive')).screenshot({ path: join(OUT, 'ritual-done.png') });

/* 7. persistence: reload, reopen the room, the day survives */
await pg.reload({ waitUntil: 'networkidle0' });
await pg.evaluate(() => document.getElementById('tabRoom').click());
await pg.waitForFunction(() => window.Room && Room.card && Room.card.pet, { timeout: 20000 });
const r2 = await rit();
if (!r2 || !r2.done || r2.moodK !== r.moodK)
  die('ritual did not survive reload: ' + JSON.stringify(r2));
const m2 = await pg.evaluate(() => window.LoafCat3D && window.LoafCat3D._mood);
if (m2 !== r.moodK) die('mood not reapplied to brain after reload: ' + m2);
console.log('reload: ritual + mood persist (' + r2.moodK + ')');
console.log('RITUAL PROBE COMPLETE');
await b.close(); srv.close();
