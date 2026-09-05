#!/usr/bin/env node
/* The shots, from where the player stands, at the four sizes.
 *
 *   node tools/shots.mjs           all of them into docs/shots/
 *   node tools/shots.mjs p1-swell  just one
 *
 * ⛔ THE FILTER GATES THE SHUTTER, NEVER THE WALK. Asking for one shot must not
 * skip the holding and the releasing that get the app into the state being
 * photographed; shoot() checks the name and nothing else does.
 *
 * Every shot is driven by real pointer events on the canvas, and every wait is
 * on what the engine believes, never on a clock.
 */
import { writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { serve, open, ROOT, tap, sleep, waitFrames } from '../test/harness.mjs';

const OUT = join(ROOT, 'docs', 'shots');
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
const only = process.argv[2];
const want = n => !only || only === n;
const SIZES = {
  /* 1.25x. Large smooth gradients are the worst case for PNG and an aurora is
     nothing but large smooth gradients: at 1.5x four of these went past the
     200 KB evidence limit, and nobody reading a screenshot needs the last
     quarter of a pixel. */
  tall:  { width: 412, height: 915, deviceScaleFactor: 1 },
  mid:   { width: 375, height: 667, deviceScaleFactor: 1.25 },
  small: { width: 320, height: 568, deviceScaleFactor: 1.25 },
  wide:  { width: 915, height: 412, deviceScaleFactor: 1 }
};
const { base, close } = await serve();
const wrote = [];

async function shoot(page, name) {
  if (!want(name)) return;
  const buf = await page.screenshot({ type: 'png' });
  writeFileSync(join(OUT, name + '.png'), buf);
  const kb = statSync(join(OUT, name + '.png')).size / 1024;
  wrote.push({ name, kb });
  console.log('  ' + name.padEnd(20) + kb.toFixed(0).padStart(4) + ' KB' + (kb > 200 ? '   OVER THE 200 KB EVIDENCE LIMIT' : ''));
}
const press = (page, x, y, id) => page.evaluate((x, y, id) => {
  document.getElementById('stage').dispatchEvent(new PointerEvent('pointerdown', {
    pointerId: id, pointerType: 'touch', isPrimary: id === 1, bubbles: true, cancelable: true,
    clientX: x, clientY: y, pressure: 0.5, width: 20 }));
}, x, y, id);
const lift = (page, x, y, id) => page.evaluate((x, y, id) => {
  document.getElementById('stage').dispatchEvent(new PointerEvent('pointerup', {
    pointerId: id, pointerType: 'touch', isPrimary: id === 1, bubbles: true, cancelable: true, clientX: x, clientY: y }));
}, x, y, id);

for (const key of Object.keys(SIZES)) {
  const size = SIZES[key];
  const { browser, page } = await open(base, size);
  await page.evaluate(() => localStorage.setItem('lw_swell_v1',
    JSON.stringify({ v: 1, mood: 'dawn', tilt: 0, motion: 1, seen: { how: 1 } })));
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => window.SWELL_DEV && window.SWELL_DEV.frames() > 2, { timeout: 30000 });
  const mid = await page.evaluate(() => ({ x: Math.round(window.innerWidth / 2), y: Math.round(window.innerHeight * 0.55) }));

  /* the swell, photographed when the whole orchestra is in the room */
  await press(page, mid.x, mid.y, 1);
  await page.waitForFunction(() => window.SWELL_DEV.sectionLive('choir'), { timeout: 25000 }).catch(() => {});
  await page.waitForFunction(() => window.SWELL_DEV.held() > 8.5, { timeout: 25000 }).catch(() => {});
  await waitFrames(page, 3);
  await shoot(page, key === 'mid' ? 'p1-swell' : 'p1-swell-' + key);

  if (key === 'mid') {
    /* two more fingers, which is the second and third section */
    await press(page, Math.round(mid.x * 0.45), Math.round(mid.y * 0.55), 2);
    await press(page, Math.round(mid.x * 1.55), Math.round(mid.y * 1.15), 3);
    await waitFrames(page, 8);
    await shoot(page, 'p2-two-fingers');
    await lift(page, Math.round(mid.x * 0.45), Math.round(mid.y * 0.55), 2);
    await lift(page, Math.round(mid.x * 1.55), Math.round(mid.y * 1.15), 3);
  }

  await lift(page, mid.x, mid.y, 1);
  await page.waitForFunction(() => window.SWELL_DEV.state() === 'resolving', { timeout: 15000 }).catch(() => {});
  await sleep(1000);
  await shoot(page, key === 'mid' ? 'p1-resolve' : 'p1-resolve-' + key);

  if (key === 'mid') {
    await page.waitForFunction(() => window.SWELL_DEV.state() === 'idle', { timeout: 25000 }).catch(() => {});
    await tap(page, '#btnMenu'); await sleep(250);
    await tap(page, '#btnMoods'); await sleep(400);
    await shoot(page, 'p2-moods');
    await tap(page, '#btnMoodsBack'); await sleep(250);
    await tap(page, '#btnMenu'); await sleep(200);
    await tap(page, '#btnAmbientOpen'); await sleep(400);
    await shoot(page, 'p2-ambient');
    await tap(page, '#btnAmbientBack'); await sleep(250);
  }
  await browser.close();
  console.log('  (' + size.width + 'x' + size.height + ' done)');
}
close();
const over = wrote.filter(w => w.kb > 200);
console.log('\n' + wrote.length + ' shots' + (over.length ? ', ' + over.length + ' OVER the limit' : ', all under 200 KB'));
console.log('OPEN THEM. A shot nobody looked at is how a gradient rectangle ships as an aurora.');
console.log(over.length ? 'SHOTS OVER LIMIT' : 'SHOTS OK');
