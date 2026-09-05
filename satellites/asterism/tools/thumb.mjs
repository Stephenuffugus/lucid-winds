#!/usr/bin/env node
/* The arcade tile, shot from the REAL running app, square, under the 150 KB the
 * portal grid needs when it loads a hundred at once.
 *
 *   node tools/thumb.mjs
 *
 * It walks to the sky with real taps on a frozen July night over Columbus,
 * joins the Summer Triangle, and shoots. It then MEASURES its own picture and
 * refuses a dark one: a camera with no check on its own output is the same
 * mistake as a gate that cannot fail.
 */
import { writeFileSync, statSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { serve, open, ROOT, tapAt, drag, dragEnd, waitFrames, sleep } from '../test/harness.mjs';

const OUT = join(ROOT, 'docs', 'thumb.png');
const LIMIT = 150 * 1024;
/* WHAT THE TILE HAS TO CONTAIN. Counting bright pixels alone set the bar in the
   wrong place: a real star field on a 512 square is about one percent bright
   pixels, and the first threshold of two percent rejected three good tiles.
   What actually matters is that the sky is there AND the gold shape is in it. */
const MIN_SKY = 0.004, MIN_GOLD = 0.0012;
if (!existsSync(join(ROOT, 'docs'))) mkdirSync(join(ROOT, 'docs'), { recursive: true });
const { base, close } = await serve();

async function shoot(size) {
  const { browser, page } = await open(base, { width: size, height: size, deviceScaleFactor: 1 });
  await page.evaluate(() => localStorage.setItem('lw_asterism_v1',
    JSON.stringify({ v: 1, place: null, entries: [], settings: { sound: 1, twinkle: 1, motion: 1 }, seen: { how: 1 }, promptDay: '2026-07-15' })));
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => window.ASTERISM_DEV && window.ASTERISM_DEV.ready() && window.ASTERISM_DEV.frames() > 2, { timeout: 30000 });
  await waitFrames(page, 6);
  for (const hip of [91262, 102098, 97649]) {
    const p = await page.evaluate((h) => window.ASTERISM_DEV.screenOfHip(h), hip);
    if (p) { await tapAt(page, p.x, p.y); await waitFrames(page, 6); }
  }
  await waitFrames(page, 26);
  /* CENTRE THE SHAPE. At the default view a square tile cropped Vega off the
     top and left the right two thirds empty; the shelf sees a hundred of these
     at 150 px and a cut off constellation is not a tile. One real drag. */
  const c = await page.evaluate((hips) => {
    let sx = 0, sy = 0, n = 0;
    for (const h of hips) { const p = window.ASTERISM_DEV.screenOfHip(h); if (p) { sx += p.x; sy += p.y; n++; } }
    return n ? { x: sx / n, y: sy / n, w: window.innerWidth, h: window.innerHeight } : null;
  }, [91262, 102098, 97649]);
  if (c) {
    const fromX = Math.max(30, Math.min(c.w - 30, c.x));
    const fromY = Math.max(30, Math.min(c.h - 30, c.y));
    await drag(page, fromX, fromY, fromX + (c.w / 2 - c.x), fromY + (c.h / 2 - c.y), 12);
    await dragEnd(page, fromX + (c.w / 2 - c.x), fromY + (c.h / 2 - c.y));
    await waitFrames(page, 8);
  }
  /* hide the chrome: a shelf tile is the sky, not a picture of a UI */
  await page.evaluate(() => {
    document.getElementById('chrome').style.visibility = 'hidden';
    const el = document.getElementById('starLabel'); if (el) el.classList.remove('on');
  });
  await sleep(200);
  const lit = await page.evaluate(() => {
    const cv = document.getElementById('sky'), g = cv.getContext('2d');
    const d = g.getImageData(0, 0, cv.width, cv.height).data;
    let sky = 0, gold = 0, n = 0;
    for (let i = 0; i < d.length; i += 4 * 7) {
      n++;
      const r = d[i], gg = d[i + 1], b = d[i + 2];
      if (r + gg + b > 150) sky++;
      if (r > 170 && gg > 130 && b < 170 && r > b + 50) gold++;
    }
    return { sky: sky / n, gold: gold / n };
  });
  const buf = await page.screenshot({ type: 'png' });
  await browser.close();
  return { buf, lit };
}

let size = 512, got = null;
for (let attempt = 1; attempt <= 3 && !got; attempt++) {
  const r = await shoot(size);
  console.log('  attempt ' + attempt + ': ' + (r.lit.sky * 100).toFixed(2) + ' percent stars, ' +
    (r.lit.gold * 100).toFixed(2) + ' percent gold, ' + (r.buf.length / 1024).toFixed(0) + ' KB');
  if (r.lit.sky >= MIN_SKY && r.lit.gold >= MIN_GOLD) got = r;
}
if (!got) {
  close();
  console.log('\nTHREE TILES WITHOUT A SKY OR WITHOUT THE GOLD SHAPE IN THEM.');
  console.log('THUMB TOO DARK');
  process.exit(1);
}
let buf = got.buf;
while (buf.length > LIMIT && size > 256) {
  size = Math.round(size * 0.8);
  console.log('  ' + (buf.length / 1024).toFixed(0) + ' KB is over the 150 KB grid limit, recapturing at ' + size + ' px');
  buf = (await shoot(size)).buf;
}
writeFileSync(OUT, buf);
close();
const kb = statSync(OUT).size / 1024;
console.log('  docs/thumb.png  ' + size + ' px  ' + kb.toFixed(1) + ' KB  ' + (kb <= 150 ? 'under the limit' : 'STILL OVER'));
console.log('\nOPEN IT. A thumb nobody looked at is how a menu screenshot ends up on the shelf.');
console.log(kb <= 150 ? 'THUMB OK' : 'THUMB OVER LIMIT');
process.exit(kb <= 150 ? 0 : 1);
