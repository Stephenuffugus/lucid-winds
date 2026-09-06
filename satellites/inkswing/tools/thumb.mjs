#!/usr/bin/env node
/* The portal tile: a 3:2 knot caught mid draw, with the bob still on it.
 *
 *   node tools/thumb.mjs
 *
 * ⛔ a thumb tool that writes a tile and prints OK is worse than no tool. This
 * one opens the pixels of the tile it just made and refuses to write it unless
 * there is paper in it, ink ON that paper, and brass somewhere in the upper
 * half where the bob hangs. Inkswing's failure mode is a beautiful empty sheet,
 * so "is there a drawing on it" is the whole question a tile has to answer.
 */
import { serve, open, waitFrames, ROOT } from '../test/harness.mjs';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const s = await serve();
const { browser, page } = await open(s.base, { width: 600, height: 600, deviceScaleFactor: 3 });

await page.evaluate(() => {
  const h = document.getElementById('hint');
  h.textContent = ''; h.classList.remove('on'); h.style.display = 'none';
  const S = INKSWING_TEST.sim();
  const sh = S.newSheet({ rig: 'crossed', lengths: [12, 19] });
  /* the same throw the p2-knot shot uses, because that picture is the one the
     whole game is for and the tile should be a crop of it, not a new invention */
  sh.throws.push(S.flingToThrow(sh, { x: 320, y: 260 }, { x: -480, y: 620 }, 0, 'indigo'));
  INKSWING_TEST.loadSheet(sh);
  INKSWING_TEST.setInk('indigo');
  INKSWING_TEST.state().drawing = true;
  INKSWING_TEST.advance(26);
});
await waitFrames(page, 4);

const shot = await page.evaluate(() => {
  const src = document.getElementById('stage');
  const V = INKSWING_TEST.view(), C = INKSWING_TEST.config();
  const w = C.SHEET_W * V.ppu, h = C.SHEET_H * V.ppu;
  /* ⛔ CROP THE PAPER, NOT THE SCREEN. The screen is mostly dark ground with a
     rail of colour chips down one side; a square crop of it is a tile of the
     furniture. The square is taken on the sheet, and it is taken from the sheet
     centre rather than its top because the bob hangs above the middle and an
     anchored crop cut it off. */
  const side = Math.min(w, h);
  const cx = V.ox, cy = V.oy - (h - side) * 0.18;
  const x0 = cx - side / 2, y0 = cy - side / 2;
  const cv = document.createElement('canvas');
  cv.width = 512; cv.height = 512;
  const c = cv.getContext('2d');
  const dpr = src.width / src.clientWidth;
  c.fillStyle = '#151A22'; c.fillRect(0, 0, 512, 512);
  c.drawImage(src, x0 * dpr, y0 * dpr, side * dpr, side * dpr, 0, 0, 512, 512);
  const d = c.getImageData(0, 0, 512, 512);
  for (let i = 0; i < d.data.length; i++) { if (i % 4 !== 3) d.data[i] = d.data[i] & 0xF8; }
  c.putImageData(d, 0, 0);
  return cv.toDataURL('image/png').split(',')[1];
});
const buf = Buffer.from(shot, 'base64');

const m = await page.evaluate(async (b) => {
  const im = new Image();
  await new Promise(r => { im.onload = r; im.src = 'data:image/png;base64,' + b; });
  const cv = document.createElement('canvas');
  cv.width = im.width; cv.height = im.height;
  const c = cv.getContext('2d');
  c.drawImage(im, 0, 0);
  const W = cv.width, H = cv.height;
  const d = c.getImageData(0, 0, W, H).data;
  let paper = 0, ink = 0, brassTop = 0, nTop = 0, n = 0;
  for (let y = 0; y < H; y += 2) {
    for (let x = 0; x < W; x += 2) {
      const i = (y * W + x) * 4, r = d[i], g = d[i + 1], bb = d[i + 2];
      n++;
      /* the sheet is a warm cream, #F0E8D5 and its shades */
      if (r > 200 && g > 190 && bb > 165) paper++;
      /* ⛔ iron gall indigo on cream, and the PALE HAIRS COUNT. A strict dark
         ink test read 0.49 percent on a one second scribble and 1.05 on the
         twenty six second knot this tile is made of: a two to one spread, which
         is not a measurement, it is a coin. Most of a whipped line is a pale
         hair, and counting those the same sheets read 0.63 and 3.75, six to
         one. Calibrated 2026-09-06 at 1s, 4s, 26s and 60s. */
      else if (r < 214 && bb >= r - 14 && r > 15) ink++;
      if (y < H / 2) { nTop++; if (r > 150 && g > 115 && bb < 120) brassTop++; }
    }
  }
  return { paper: paper / n, ink: ink / n, brass: brassTop / Math.max(1, nTop),
    w: im.width, h: im.height };
}, buf.toString('base64'));

await browser.close(); s.close();

const problems = [];
if (m.paper < 0.30) problems.push('this is not a picture of a sheet of paper ('
  + (m.paper * 100).toFixed(1) + ' percent)');
/* ⛔ the floor that matters, and it is a measured one, not a guessed one. On the
   calibration above: one second 0.63 percent, four seconds 1.10, the twenty six
   second knot this tile is made of 3.75, a full ninety second throw 8.02. Two
   percent sits clear of a scribble and well under the tile, with room for the
   drift the time stepping puts on any one run. */
if (m.ink < 0.02) problems.push('there is no drawing on it (' + (m.ink * 100).toFixed(2)
  + ' percent ink)');
if (m.brass < 0.002) problems.push('the bob is not in it (' + (m.brass * 100).toFixed(2)
  + ' percent brass up top)');
if (buf.length > 150 * 1024) problems.push('too heavy (' + (buf.length / 1024).toFixed(0) + ' KB)');

console.log('  ' + m.w + 'x' + m.h + '  ' + (buf.length / 1024).toFixed(0) + ' KB  '
  + (m.paper * 100).toFixed(1) + ' percent paper, ' + (m.ink * 100).toFixed(2)
  + ' percent ink, ' + (m.brass * 100).toFixed(2) + ' percent brass up top');
if (problems.length) {
  console.log('REFUSING TO WRITE THE TILE: ' + problems.join('; '));
  process.exit(1);
}
writeFileSync(join(ROOT, 'docs', 'thumb.png'), buf);
console.log('docs/thumb.png written');
console.log('THUMB OK');
