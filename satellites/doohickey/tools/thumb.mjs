#!/usr/bin/env node
/* The portal tile: a cascade caught mid fall, with the bell it is falling
 * towards, and no chrome in the way.
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
const { browser, page } = await open(s.base, { width: 700, height: 700, deviceScaleFactor: 1 });

/* mid cascade, chrome hidden: the tile is a picture of the game happening */
await page.evaluate(() => {
  DOOHICKEY_TEST.start(1);
  DOOHICKEY_TEST.solution();
  DOOHICKEY_TEST.go();
  DOOHICKEY_TEST.advance(2.45);
  for (const id of ['btnGo', 'btnStop', 'btnUndo', 'btnRedo', 'btnMenu', 'partCount', 'tray'])
    document.getElementById(id).style.display = 'none';
});
await waitFrames(page, 3);

const b64 = await page.evaluate(async () => {
  const src = document.getElementById('board');
  const cv = document.createElement('canvas');
  cv.width = 512; cv.height = 512;
  const c = cv.getContext('2d');
  /* frame the ROW and the bell, not the empty sky above them */
  /* the row is 300 to 500 on the floor and the bell is at 500: frame THAT, with
     enough sky above it to read as a board and not as a crop */
  const a = DOOHICKEY_TEST.toScreen(246, 262), b = DOOHICKEY_TEST.toScreen(556, 438);
  const dpr = src.width / src.clientWidth;
  const sx = a.x * dpr, sy = a.y * dpr;
  const sw = (b.x - a.x) * dpr, sh = (b.y - a.y) * dpr;
  /* the action is a wide short strip, so squaring it up by the WIDTH fills the
     tile with sky. Square it up by the height and let the sides crop. */
  /* ⛔ squaring up by the height crops the SIDES, and the sides are where the
     marble and the bell are: the two ends of the story. The sky costs less. */
  const side = Math.max(sw, sh);
  c.fillStyle = '#F4EBD3'; c.fillRect(0, 0, 512, 512);
  c.drawImage(src, sx - (side - sw) / 2, sy - (side - sh) / 2, side, side, 0, 0, 512, 512);
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
  let lit = 0, red = 0, gold = 0, n = 0;
  for (let i = 0; i < d.length; i += 4 * 11) {
    const r = d[i], g = d[i + 1], bb = d[i + 2];
    n++;
    if (r + g + bb > 300) lit++;
    if (r > g + 50 && r > bb + 50 && r > 120) red++;
    if (r > 180 && g > 130 && bb < 120) gold++;
  }
  return { lit: lit / n, red: red / n, gold: gold / n, w: im.width, h: im.height };
}, buf.toString('base64'));

await browser.close(); s.close();

const problems = [];
if (measured.lit < 0.55) problems.push('too dark for a cream game (' + (measured.lit * 100).toFixed(0) + ' percent lit)');
if (measured.red < 0.008) problems.push('no dominoes in it (' + (measured.red * 100).toFixed(2) + ' percent red)');
if (measured.gold < 0.001) problems.push('no bell in it (' + (measured.gold * 100).toFixed(3) + ' percent gold)');
if (buf.length > 150 * 1024) problems.push('too heavy (' + (buf.length / 1024).toFixed(0) + ' KB)');
if (problems.length) {
  console.log('REFUSED to write the thumb: ' + problems.join(', '));
  process.exit(1);
}
writeFileSync(join(ROOT, 'docs', 'thumb.png'), buf);
console.log('  docs/thumb.png  ' + (buf.length / 1024).toFixed(0) + ' KB   '
  + measured.w + 'x' + measured.h + '   lit ' + (measured.lit * 100).toFixed(0)
  + '%  red ' + (measured.red * 100).toFixed(1) + '%  gold ' + (measured.gold * 100).toFixed(2) + '%');
console.log('THUMB OK');
