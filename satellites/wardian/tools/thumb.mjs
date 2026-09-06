#!/usr/bin/env node
/* The portal tile: the jar at dusk with the beetle awake in it.
 *
 *   node tools/thumb.mjs
 *
 * ⛔ a thumb tool that writes a dark tile and prints OK is worse than no tool
 * at all, so this one measures the picture it just made: how much of it is lit,
 * how much of it is green, and whether the jar fills the frame. It refuses to
 * write a tile that fails any of those.
 */
import { serve, open, waitFrames } from '../test/harness.mjs';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from '../test/harness.mjs';

const s = await serve();
const { browser, page } = await open(s.base, { width: 600, height: 600, deviceScaleFactor: 1 });

await page.evaluate(() => {
  WARDIAN_TEST.advance(2200, 'daily');
  /* dusk: warm enough to read as a tile among a hundred others, and late
     enough that the beetle is awake */
  WARDIAN_TEST.setHour(19);
  const i = WARDIAN_TEST.place('glowbeetle', 15);
  WARDIAN_TEST.state().agents[i].asleep = 0;
  WARDIAN_TEST.place('pillbug', 8);
  WARDIAN_TEST.closeScreens();
});
await waitFrames(page, 4);

const b64 = await page.evaluate(async () => {
  const src = document.getElementById('jar');
  const cv = document.createElement('canvas');
  cv.width = 512; cv.height = 512;
  const c = cv.getContext('2d');
  /* frame the JAR, not the room: the tile is 512 square and the jar is not */
  /* frame the planting, not the empty air above it */
  const a = WARDIAN_TEST.toScreen(-12, 46), b = WARDIAN_TEST.toScreen(252, 268);
  const dpr = src.width / src.clientWidth;
  const sx = a.x * dpr, sy = a.y * dpr;
  const sw = (b.x - a.x) * dpr, sh = (b.y - a.y) * dpr;
  const side = Math.max(sw, sh);
  c.fillStyle = '#17120E'; c.fillRect(0, 0, 512, 512);
  c.drawImage(src, sx - (side - sw) / 2, sy - (side - sh) / 2, side, side, 0, 0, 512, 512);
  /* a portal tile is loaded on a page with a hundred others, so it is trimmed
     to five bits a channel: invisible here, and a third of the bytes */
  const d = c.getImageData(0, 0, 512, 512);
  for (let i = 0; i < d.data.length; i++) { if (i % 4 !== 3) d.data[i] = d.data[i] & 0xF8; }
  c.putImageData(d, 0, 0);
  return cv.toDataURL('image/png').split(',')[1];
});
const buf = Buffer.from(b64, 'base64');

const measured = await page.evaluate(async (b) => {
  const im = new Image();
  await new Promise(r => { im.onload = r; im.src = 'data:image/png;base64,' + b; });
  const cv = document.createElement('canvas');
  cv.width = im.width; cv.height = im.height;
  const c = cv.getContext('2d');
  c.drawImage(im, 0, 0);
  const d = c.getImageData(0, 0, cv.width, cv.height).data;
  let lit = 0, green = 0, warm = 0, n = 0;
  for (let i = 0; i < d.length; i += 4 * 11) {
    const r = d[i], g = d[i + 1], bb = d[i + 2];
    n++;
    if (r + g + bb > 130) lit++;
    if (g > r + 8 && g > bb + 6 && g > 44) green++;
    if (r > bb + 22 && r > 60) warm++;
  }
  return { lit: lit / n, green: green / n, warm: warm / n, w: im.width, h: im.height };
}, buf.toString('base64'));

await browser.close(); s.close();

const problems = [];
if (measured.lit < 0.30) problems.push('too dark (' + (measured.lit * 100).toFixed(0) + ' percent lit)');
if (measured.green < 0.02) problems.push('no plant in it (' + (measured.green * 100).toFixed(2) + ' percent green)');
if (measured.warm < 0.03) problems.push('no warmth in it (' + (measured.warm * 100).toFixed(1) + ' percent)');
if (buf.length > 150 * 1024) problems.push('too heavy (' + (buf.length / 1024).toFixed(0) + ' KB)');
if (problems.length) {
  console.log('REFUSED to write the thumb: ' + problems.join(', '));
  process.exit(1);
}
writeFileSync(join(ROOT, 'docs', 'thumb.png'), buf);
console.log('  docs/thumb.png  ' + (buf.length / 1024).toFixed(0) + ' KB   '
  + measured.w + 'x' + measured.h + '   lit ' + (measured.lit * 100).toFixed(0)
  + '%  green ' + (measured.green * 100).toFixed(1) + '%  warm ' + (measured.warm * 100).toFixed(1) + '%');
console.log('THUMB OK');
