#!/usr/bin/env node
/* The arcade tile: a loop with two trains on it and a station beside the line.
 *
 *   node tools/thumb.mjs
 *
 * ⛔ a thumb tool that writes a flat brown square and prints OK is worse than
 * no tool at all, so this one MEASURES the picture it just made: how much wood
 * is in it, how much of each train colour, and whether the whole thing is too
 * dark for a sunlit rug. It refuses to write a tile that fails any of those.
 */
import { serve, open, waitFrames, tap, ROOT } from '../test/harness.mjs';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const s = await serve();
const { browser, page } = await open(s.base, { width: 760, height: 760, deviceScaleFactor: 1 });
await waitFrames(page, 2);

/* a rug built the way a rug is built, then a train on it, then the whistle */
await tap(page, '#btnBuild');
await waitFrames(page, 2);
await tap(page, '#slotList .card');
await waitFrames(page, 2);
await page.evaluate(() => {
  WHISTLESTOP_TEST.buildOps([['at', 4.2, 3.0, 0], ['rep', 2, 'straight'], ['rep', 4, 'curveR'],
    ['rep', 2, 'straight'], ['rep', 4, 'curveR']]);
  const S = WHISTLESTOP_TEST.state();
  WHISTLESTOP_TEST.addTrain('red', S.g.edges[1].id, 20, 3);
  WHISTLESTOP_TEST.addTrain('blue', S.g.edges[7].id, 20, 2);
});
await tap(page, '#btnWhistle');
await page.evaluate(() => WHISTLESTOP_TEST.advance(1.4));
await page.evaluate(() => {
  for (const id of ['btnUndo', 'btnRedo', 'btnMenu', 'btnTrains', 'btnWhistle', 'tray', 'hint', 'toast'])
    { const e = document.getElementById(id); if (e) e.style.display = 'none'; }
});
await waitFrames(page, 4);

const b64 = await page.evaluate(async () => {
  const src = document.getElementById('board');
  const cv = document.createElement('canvas');
  cv.width = 512; cv.height = 512;
  const c = cv.getContext('2d');
  /* frame the RAILWAY, square, with a hand's width of rug round it */
  const S = WHISTLESTOP_TEST.state();
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const e of S.g.edges) {
    for (const [x, y] of [[e.ax, e.ay], [e.bx, e.by]]) {
      x0 = Math.min(x0, x); x1 = Math.max(x1, x);
      y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    }
  }
  /* ⛔ the frame is the RAILS plus what stands on them. Cropped to the rails
     alone, both engines were cut in half by the edges and the station lost its
     roof, which is what a tile of a train set must not do. */
  for (const t of S.trains) {
    for (const b of WHISTLESTOP_TEST.bodies(S.trains.indexOf(t))) {
      x0 = Math.min(x0, b.x - 40); x1 = Math.max(x1, b.x + 40);
      y0 = Math.min(y0, b.y - 46); y1 = Math.max(y1, b.y + 30);
    }
  }
  const a = WHISTLESTOP_TEST.toScreen(x0 - 26, y0 - 26);
  const d2 = WHISTLESTOP_TEST.toScreen(x1 + 26, y1 + 26);
  const dpr = src.width / src.clientWidth;
  const sw = (d2.x - a.x) * dpr, sh = (d2.y - a.y) * dpr;
  const side = Math.max(sw, sh);
  c.drawImage(src, a.x * dpr - (side - sw) / 2, a.y * dpr - (side - sh) / 2, side, side, 0, 0, 512, 512);
  const d = c.getImageData(0, 0, 512, 512);
  for (let i = 0; i < d.data.length; i++) { if (i % 4 !== 3) d.data[i] = d.data[i] & 0xF8; }
  c.putImageData(d, 0, 0);
  return cv.toDataURL('image/png').split(',')[1];
});
const buf = Buffer.from(b64, 'base64');

const m = await page.evaluate(async (bb) => {
  const im = new Image();
  await new Promise(r => { im.onload = r; im.src = 'data:image/png;base64,' + bb; });
  const cv = document.createElement('canvas');
  cv.width = im.width; cv.height = im.height;
  const c = cv.getContext('2d');
  c.drawImage(im, 0, 0);
  const d = c.getImageData(0, 0, cv.width, cv.height).data;
  let lit = 0, wood = 0, red = 0, blue = 0, n = 0;
  for (let i = 0; i < d.length; i += 4 * 7) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    n++;
    if (r + g + b > 360) lit++;
    if (r > 195 && g > 160 && b > 105 && b < 220 && r - b > 40) wood++;
    if (r > g + 55 && r > b + 40 && r > 120) red++;
    if (b > r + 20 && b > 110) blue++;
  }
  return { lit: lit / n, wood: wood / n, red: red / n, blue: blue / n, w: im.width, h: im.height };
}, buf.toString('base64'));

await browser.close(); s.close();

const problems = [];
if (m.lit < 0.30) problems.push('too dark for a sunlit rug (' + (m.lit * 100).toFixed(0) + ' percent lit)');
if (m.wood < 0.04) problems.push('there is no track in it (' + (m.wood * 100).toFixed(1) + ' percent wood)');
if (m.red < 0.004) problems.push('no red train (' + (m.red * 100).toFixed(2) + ' percent)');
if (m.blue < 0.002) problems.push('no blue train (' + (m.blue * 100).toFixed(2) + ' percent)');
if (buf.length > 150 * 1024) problems.push('too heavy (' + (buf.length / 1024).toFixed(0) + ' KB)');
if (problems.length) {
  console.log('REFUSED to write the thumb: ' + problems.join(', '));
  process.exit(1);
}
writeFileSync(join(ROOT, 'docs', 'thumb.png'), buf);
console.log('  docs/thumb.png  ' + (buf.length / 1024).toFixed(0) + ' KB   ' + m.w + 'x' + m.h
  + '   lit ' + (m.lit * 100).toFixed(0) + '%  wood ' + (m.wood * 100).toFixed(1)
  + '%  red ' + (m.red * 100).toFixed(2) + '%  blue ' + (m.blue * 100).toFixed(2) + '%');
console.log('THUMB OK');
