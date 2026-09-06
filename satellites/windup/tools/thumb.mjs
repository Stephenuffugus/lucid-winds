#!/usr/bin/env node
/* The portal tile: the box mid crank with a tine lit.
 *
 *   node tools/thumb.mjs
 *
 * ⛔ a thumb tool that writes a dark tile and prints OK is worse than no tool,
 * so this one measures the picture it just made: how much of it is the box
 * rather than the cloth, whether the paper is in it, and whether any brass is
 * lit. It refuses to write a tile that fails any of those.
 */
import { serve, open, waitFrames, ROOT } from '../test/harness.mjs';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const s = await serve();
const { browser, page } = await open(s.base, { width: 600, height: 600, deviceScaleFactor: 3 });

await page.evaluate(() => {
  WINDUP_TEST.setStrip(WINDUP_TEST.sim().STARTERS.twinkle.holes.slice(), 'Twinkle Twinkle');
  WINDUP_TEST.state().advanceMm = 18 * WINDUP_TEST.config().MM_PER_STEP;
  WINDUP_TEST.state().crankAngle = 0.7;
  /* two tines caught mid ring, because a still of a music box with nothing
     lit is a photograph of a box */
  /* ⛔ a still of a music box with nothing lit is a photograph of a box. Four
     tines caught mid ring is the thing playing. */
  WINDUP_TEST.state().flick[11] = 1;
  WINDUP_TEST.state().flick[8] = 0.8;
  WINDUP_TEST.state().flick[4] = 0.6;
  WINDUP_TEST.state().flick[13] = 0.45;
});
await waitFrames(page, 4);

const shot = await page.evaluate(async () => {
  const src = document.getElementById('stage');
  const L = WINDUP_TEST.layout();
  const cv = document.createElement('canvas');
  cv.width = 512; cv.height = 512;
  const c = cv.getContext('2d');
  const dpr = src.width / src.clientWidth;
  /* frame the CASE with the paper running out of both sides of it and the
     crank in the corner: that is the whole game in one picture */
  /* ⛔ the crank's knob has to be INSIDE the crop. Sized off the case alone it
     was cut in half by the right edge, and the bottom third of the tile was
     empty cloth. */
  /* ⛔ CENTRE THE CONTENT IN THE SQUARE. Anchored to the top of the case, the
     tile came out with the case in its upper half and two fifths of empty cloth
     under it, because the crank hangs well below the box and a square crop that
     reaches it reaches a long way. */
  const pad = 12;
  const right = Math.max(L.box.x + L.box.w, L.hub.x + 62) + pad;
  const top = L.box.y - pad;
  const bottom = Math.max(L.box.y + L.box.h, L.hub.y + 62) + pad;
  const x0 = L.box.x - pad;
  const side = Math.max(right - x0, bottom - top);
  const y0 = (top + bottom) / 2 - side / 2;
  c.fillStyle = '#241812'; c.fillRect(0, 0, 512, 512);
  c.drawImage(src, x0 * dpr, y0 * dpr, side * dpr, side * dpr, 0, 0, 512, 512);
  const d = c.getImageData(0, 0, 512, 512);
  for (let i = 0; i < d.data.length; i++) { if (i % 4 !== 3) d.data[i] = d.data[i] & 0xF8; }
  c.putImageData(d, 0, 0);
  return cv.toDataURL('image/png').split(',')[1];
});
const buf = Buffer.from(shot, 'base64');

const measured = await page.evaluate(async (b) => {
  const im = new Image();
  await new Promise(r => { im.onload = r; im.src = 'data:image/png;base64,' + b; });
  const cv = document.createElement('canvas');
  cv.width = im.width; cv.height = im.height;
  const c = cv.getContext('2d');
  c.drawImage(im, 0, 0);
  const d = c.getImageData(0, 0, cv.width, cv.height).data;
  /* ⛔ MEASURE THE BRASS WHERE THE BRASS IS. Across the whole tile the comb is
     a thin band and the crank a small disc, so brass comes out at about two
     percent whatever it looks like, and a two percent threshold is a coin toss
     rather than a check. The comb and the crank live in the lower half, so that
     is where this asks. */
  let paper = 0, wood = 0, n = 0, brass = 0, nLow = 0;
  const bands = [0,0,0,0,0];
  const W = cv.width, H = cv.height;
  for (let y = 0; y < H; y += 2) {
    for (let x = 0; x < W; x += 2) {
      const i = (y * W + x) * 4;
      const r = d[i], g = d[i + 1], bb = d[i + 2];
      n++;
      if (r > 190 && g > 175 && bb > 140) paper++;
      else if (r > 60 && r < 150 && g > 35 && g < 105 && bb < 80) wood++;
      if (r > 150 && g > 115 && bb < 110) { brass++; bands[Math.floor(y / H * 5)]++; }
      nLow++;
    }
  }
  return { paper: paper / n, brass: brass / Math.max(1, nLow), wood: wood / n,
    bands: bands.map(v => (v / Math.max(1, nLow) * 5 * 100).toFixed(1)), w: im.width, h: im.height };
}, buf.toString('base64'));

await browser.close(); s.close();

const problems = [];
if (measured.paper < 0.06) problems.push('no paper in it (' + (measured.paper * 100).toFixed(1) + ' percent)');
/* ⛔ the comb is a thin band, so brass over the WHOLE tile is about two percent
   whatever it looks like and a threshold there is a coin toss. Measured fifth
   by fifth it is unmistakable: the comb sits in the middle fifth and the crank
   in the one below it. */
if (Number(measured.bands[2]) < 3) problems.push('no brass comb across the middle of it ('
  + measured.bands[2] + ' percent of that fifth)');
if (Number(measured.bands[3]) < 1) problems.push('no crank under it (' + measured.bands[3] + ' percent)');
if (measured.wood < 0.10) problems.push('no case in it (' + (measured.wood * 100).toFixed(1) + ' percent)');
if (buf.length > 150 * 1024) problems.push('too heavy (' + (buf.length / 1024).toFixed(0) + ' KB)');
console.log('  ' + measured.w + 'x' + measured.h + '  ' + (buf.length / 1024).toFixed(0) + ' KB  '
  + (measured.paper * 100).toFixed(1) + ' percent paper, ' + (measured.brass * 100).toFixed(1)
  + ' percent brass, ' + (measured.wood * 100).toFixed(1) + ' percent walnut, brass by fifth: ' + measured.bands.join(' '));
if (problems.length) {
  console.log('REFUSING TO WRITE THE TILE: ' + problems.join('; '));
  process.exit(1);
}
writeFileSync(join(ROOT, 'docs', 'thumb.png'), buf);
console.log('docs/thumb.png written');
console.log('THUMB OK');
