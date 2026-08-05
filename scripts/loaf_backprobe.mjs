#!/usr/bin/env node
/* LOAF card-back gate: the temperament back must flip in through the REAL
   button, hit-test as the top face, read right empty AND filled, and flip
   back from a tap on the back itself. Both screenshots must be READ.
   Usage: node scripts/loaf_backprobe.mjs */
import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { readFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT = join(ROOT, 'assets/loaf/shots/back');
mkdirSync(OUT, { recursive: true });
const srv = createServer((req, res) => {
  try { res.end(readFileSync(join(ROOT, decodeURIComponent(req.url.split('?')[0])))); }
  catch (e) { res.writeHead(404); res.end(); }
}).listen(8956);

const b = await puppeteer.launch({ headless: 'new', args: [
  '--no-sandbox', '--disable-setuid-sandbox', '--enable-unsafe-swiftshader',
  '--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
const pg = await b.newPage();
await pg.setViewport({ width: 420, height: 800 });
pg.on('pageerror', e => console.log('PAGE ERROR:', e.message));
await pg.evaluateOnNewDocument(() => localStorage.setItem('sws_dev_ok', '1'));
await pg.goto('http://127.0.0.1:8956/loaf.html', { waitUntil: 'networkidle0', timeout: 60000 });

function die(msg){ console.log('FAIL: ' + msg); process.exit(1); }
async function tap(sel, what){
  const ok = await pg.evaluate(s => {
    const el = document.querySelector(s);
    if (!el) return 'missing';
    el.scrollIntoView({ block: 'center' });
    return 'ok';
  }, sel);
  if (ok !== 'ok') die(what + ': ' + sel + ' ' + ok);
  await new Promise(r => setTimeout(r, 400));
  const box = await (await pg.$(sel)).boundingBox();
  if (!box) die(what + ': no box');
  const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
  const hit = await pg.evaluate((s, x, y) => {
    const el = document.querySelector(s);
    const at = document.elementFromPoint(x, y);
    return !!(at && (at === el || el.contains(at) || at.contains(el)));
  }, sel, cx, cy);
  if (!hit) die(what + ': centre covered');
  await pg.mouse.click(cx, cy);
}

/* 1. mint */
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

/* 2. flip via the real button; the BACK must win the hit test */
await tap('#flipcard', 'turn over');
await new Promise(r => setTimeout(r, 700));
if (!await pg.evaluate(() => document.getElementById('card').classList.contains('flipped')))
  die('card did not gain .flipped');
await pg.evaluate(() => document.getElementById('card').scrollIntoView({ block: 'center' }));
await new Promise(r => setTimeout(r, 400));
const cardBox = await (await pg.$('#card')).boundingBox();
const midHit = await pg.evaluate((x, y) => {
  const at = document.elementFromPoint(x, y);
  return at ? (document.getElementById('cardBack').contains(at) ? 'back' : at.tagName + '#' + (at.id || '')) : 'NOTHING';
}, cardBox.x + cardBox.width / 2, cardBox.y + Math.min(cardBox.height / 2, 380));
if (midHit !== 'back') die('flipped card centre hit ' + midHit + ', not the back');
const empty = await pg.evaluate(() => ({
  bars: document.querySelectorAll('#bkBars .bk-bar').length,
  ghost: document.getElementById('bkBars').classList.contains('bk-ghost'),
  tricks: document.getElementById('bkTricks').textContent,
  days: document.getElementById('bkDays').textContent,
  fish: document.getElementById('bkFish').textContent,
  note: document.getElementById('bkNote').textContent
}));
if (empty.bars !== 5) die('expected 5 temperament bars, got ' + empty.bars);
if (!empty.ghost) die('no persona yet but bars are not ghosted');
if (!/None yet/.test(empty.tricks)) die('tricks line wrong: ' + empty.tricks);
if (!/Day 1 together/i.test(empty.days)) die('days wrong: ' + empty.days);
if (!/0 of 9/.test(empty.fish)) die('fish ledger wrong: ' + empty.fish);
if (!/Who is she/.test(empty.note)) die('empty-state note wrong: ' + empty.note);
await pg.evaluate(() => document.getElementById('card').scrollIntoView({ block: 'center' }));
await new Promise(r => setTimeout(r, 400));
await (await pg.$('#card')).screenshot({ path: join(OUT, 'back-empty.png') });
console.log('empty back correct: 5 ghost bars, "' + empty.days + '", "' + empty.note + '"');

/* 3. tap the back itself: she turns face up again */
await pg.mouse.click(cardBox.x + cardBox.width / 2, cardBox.y + Math.min(cardBox.height / 2, 380));
await new Promise(r => setTimeout(r, 700));
if (await pg.evaluate(() => document.getElementById('card').classList.contains('flipped')))
  die('tap on the back did not turn her face up');
console.log('tap on back flips forward again');

/* 4. seed a lived-in cat, reload, reopen, flip: everything filled */
await pg.evaluate(() => {
  window.LOAF.Store.update(l => {
    const c = l[0];
    c.persona = { bold: 0.85, curious: 0.6, sass: 0.3, chaos: 0.95, velcro: 0.45 };
    c.tricks = { spin: { s: 3 }, five: { s: 3 }, speak: { s: 1 }, flop: { s: 0 } };
    c.fishBook = { minnow: 2, shub: 1, boot: 1 };
    c.shapeTally = { loaf: 3, sphynx: 1 };
    return l;
  });
});
await pg.reload({ waitUntil: 'networkidle0' });
await pg.waitForSelector('#strip .thumb, #strip [class]', { timeout: 10000 }).catch(() => null);
const opened = await pg.evaluate(() => {
  const t = document.querySelector('#strip button, #strip .thumb, #strip img');
  if (!t) return false;
  t.click(); return true;
});
if (!opened) die('no strip card to reopen after reload');
await pg.waitForSelector('#view-card:not(.hidden)', { timeout: 10000 });
await tap('#flipcard', 'turn over (filled)');
await new Promise(r => setTimeout(r, 700));
const filled = await pg.evaluate(() => ({
  ghost: document.getElementById('bkBars').classList.contains('bk-ghost'),
  widths: [...document.querySelectorAll('#bkBars .fl')].map(f => f.style.width),
  tricks: document.getElementById('bkTricks').textContent,
  fish: document.getElementById('bkFish').textContent,
  shapes: document.getElementById('bkShapes').textContent,
  note: document.getElementById('bkNote').textContent
}));
if (filled.ghost) die('persona present but bars still ghosted');
if (filled.widths.join() !== '85%,60%,30%,95%,45%') die('bar widths wrong: ' + filled.widths.join());
if (!/Spin · High Five/.test(filled.tricks)) die('known tricks wrong: ' + filled.tricks);
if (!/3 of 9/.test(filled.fish)) die('fish count wrong: ' + filled.fish);
if (!/2 of 15/.test(filled.shapes)) die('shape count wrong: ' + filled.shapes);
if (!/who knows her/.test(filled.note)) die('filled note wrong: ' + filled.note);
await pg.evaluate(() => document.getElementById('card').scrollIntoView({ block: 'center' }));
await new Promise(r => setTimeout(r, 400));
await (await pg.$('#card')).screenshot({ path: join(OUT, 'back-filled.png') });
console.log('filled back correct: ' + filled.widths.join(' ') + ' · ' + filled.tricks);
console.log('BACK PROBE COMPLETE — READ ' + OUT + '/back-empty.png + back-filled.png');
await b.close(); srv.close();
