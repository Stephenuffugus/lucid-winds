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
const SIZES = { tall: { width: 412, height: 915 }, mid: { width: 375, height: 667 }, small: { width: 320, height: 568 } };
const { base, close } = await serve();
const wrote = [];
const want = n => !only || only === n;

async function shoot(page, name) {
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
    await waitFrames(page, 3);
  }
}

for (const key of Object.keys(SIZES)) {
  const { browser, page } = await seeded(SIZES[key]);
  if (want('p1-sky-' + key)) await shoot(page, 'p1-sky-' + key);
  if (want('p1-draw-' + key) || (key === 'mid' && want('p1-draw'))) {
    await drawTriangle(page);
    await shoot(page, key === 'mid' ? 'p1-draw' : 'p1-draw-' + key);
  }
  if (key === 'mid') {
    if (want('p1-name')) {
      await tap(page, '#btnDraw');
      await sleep(200);
      await tap(page, '#btnDice');
      await sleep(200);
      await shoot(page, 'p1-name');
    }
    if (want('p2-myth')) {
      await tap(page, '#btnNameSave');
      await page.waitForFunction(() => (window.ASTERISM_DEV.myth() || '').length > 90, { timeout: 20000 }).catch(() => {});
      await shoot(page, 'p2-myth');
    }
    if (want('p2-almanac')) {
      await page.waitForFunction(() => !window.ASTERISM_DEV.typing(), { timeout: 30000 }).catch(() => {});
      await tap(page, '#btnMythKeep');
      await sleep(300);
      await tap(page, '#btnMenu'); await sleep(200);
      await tap(page, '#btnAlmanac'); await sleep(400);
      await shoot(page, 'p2-almanac');
      await tap(page, '.card'); await sleep(400);
      if (want('p2-spread')) await shoot(page, 'p2-spread');
      await tap(page, '#btnPoster'); await sleep(500);
      if (want('p2-poster')) await shoot(page, 'p2-poster');
    }
  }
  await browser.close();
  console.log('  (' + SIZES[key].width + 'x' + SIZES[key].height + ' done)');
}
close();
const over = wrote.filter(w => w.kb > 200);
console.log('\n' + wrote.length + ' shots' + (over.length ? ', ' + over.length + ' OVER the limit' : ', all under 200 KB'));
console.log('OPEN THEM. A shot nobody looked at is how an empty sky ships as atmosphere.');
console.log(over.length ? 'SHOTS OVER LIMIT' : 'SHOTS OK');
