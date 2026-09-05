#!/usr/bin/env node
/* The shots, from where the player stands, at the three widths.
 *
 *   node tools/shots.mjs           all of them into docs/shots/
 *   node tools/shots.mjs p1-sky    just one
 *
 * Every shot is driven by real taps on real elements. The sky is FROZEN at
 * 2026-07-15T04:00:00Z over Columbus, which is midnight in Ohio in July, so a
 * shot is comparable from one run to the next and a star is where the astronomy
 * says it is. The one liberty a camera takes and a gate may not is seeding the
 * save, so the how to play sheet is out of the way.
 */
import { writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { serve, open, ROOT, tap, tapAt, sleep, waitFrames } from '../test/harness.mjs';

const OUT = join(ROOT, 'docs', 'shots');
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
const only = process.argv[2];
/* evidence at 1.5x, not 2x. A parchment full of gradient at two device pixels
   per css pixel pushed one shot past the 200 KB evidence limit, and nobody
   reading a screenshot needs the last half of a pixel. */
const SIZES = { tall: { width: 412, height: 915, deviceScaleFactor: 1.5 },
  mid: { width: 375, height: 667, deviceScaleFactor: 1.5 },
  small: { width: 320, height: 568, deviceScaleFactor: 1.5 } };
const { base, close } = await serve();
const wrote = [];
/* ⛔ THE FILTER GATES THE SHUTTER, NEVER THE WALK. `node tools/shots.mjs
   p2-myth` used to skip the drawing and the naming as well as the other shots,
   press SAVE with nothing drawn, and write a picture of an empty sky over the
   myth sheet. shoot() checks the name; nothing else does. */
const want = n => !only || only === n;

async function shoot(page, name) {
  if (!want(name)) return;
  const buf = await page.screenshot({ type: 'png' });
  writeFileSync(join(OUT, name + '.png'), buf);
  const kb = statSync(join(OUT, name + '.png')).size / 1024;
  wrote.push({ name, kb });
  console.log('  ' + name.padEnd(20) + kb.toFixed(0).padStart(4) + ' KB' + (kb > 200 ? '   OVER THE 200 KB EVIDENCE LIMIT' : ''));
}
async function seeded(size) {
  const s = await open(base, size);
  await s.page.evaluate(() => localStorage.setItem('lw_asterism_v1',
    JSON.stringify({ v: 1, place: null, entries: [], settings: { sound: 1, twinkle: 1, motion: 1 }, seen: { how: 1 }, promptDay: '2026-07-15' })));
  await s.page.reload({ waitUntil: 'load' });
  await s.page.waitForFunction(() => window.ASTERISM_DEV && window.ASTERISM_DEV.ready() && window.ASTERISM_DEV.frames() > 2, { timeout: 30000 });
  await waitFrames(s.page, 6);
  return s;
}
/* three real taps on the Summer Triangle, wherever the astronomy has put it */
async function drawTriangle(page) {
  for (const hip of [91262, 102098, 97649]) {
    const p = await page.evaluate((h) => window.ASTERISM_DEV.screenOfHip(h), hip);
    if (!p) { console.log('  (hip ' + hip + ' is not on screen at this size)'); continue; }
    await tapAt(page, p.x, p.y);
    /* the line eases in over 350 ms; a shot three frames after the tap catches
       it half drawn and looks like a bug rather than like a drawing */
    await waitFrames(page, 26);
  }
}

for (const key of Object.keys(SIZES)) {
  const { browser, page } = await seeded(SIZES[key]);
  await shoot(page, 'p1-sky-' + key);
  await drawTriangle(page);
  await shoot(page, key === 'mid' ? 'p1-draw' : 'p1-draw-' + key);
  if (key === 'mid') {
    await tap(page, '#btnDraw');
    await sleep(200);
    await tap(page, '#btnDice');
    await sleep(200);
    await shoot(page, 'p1-name');
    await tap(page, '#btnNameSave');
    await page.waitForFunction(() => (window.ASTERISM_DEV.myth() || '').length > 90, { timeout: 20000 }).catch(() => {});
    await shoot(page, 'p2-myth');
    await page.waitForFunction(() => !window.ASTERISM_DEV.typing(), { timeout: 30000 }).catch(() => {});
    await tap(page, '#btnMythKeep');
    await sleep(300);
    await tap(page, '#btnMenu'); await sleep(200);
    await tap(page, '#btnAlmanac'); await sleep(400);
    await shoot(page, 'p2-almanac');
    await tap(page, '.card'); await sleep(400);
    await shoot(page, 'p2-spread');
    await tap(page, '#btnPoster'); await sleep(500);
    /* the toast from KEEP IT has to be gone before the poster is photographed */
    await page.waitForFunction(() => !document.getElementById('toast').classList.contains('on'), { timeout: 8000 }).catch(() => {});
    await shoot(page, 'p2-poster');
  }
  await browser.close();
  console.log('  (' + SIZES[key].width + 'x' + SIZES[key].height + ' done)');
}
close();
const over = wrote.filter(w => w.kb > 200);
console.log('\n' + wrote.length + ' shots' + (over.length ? ', ' + over.length + ' OVER the limit' : ', all under 200 KB'));
console.log('OPEN THEM. A shot nobody looked at is how an empty sky ships as atmosphere.');
console.log(over.length ? 'SHOTS OVER LIMIT' : 'SHOTS OK');
