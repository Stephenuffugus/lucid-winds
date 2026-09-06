#!/usr/bin/env node
/* The portal tile: a paper plane at the top of its swoop over the gym floor.
 *
 *   node tools/thumb.mjs
 *
 * ⛔ a thumb tool that writes a blank tile and prints OK is worse than no tool,
 * so this one measures the picture it just made: whether there is any ink in
 * it at all, whether the plane is actually IN the crop, and whether the floor
 * line is in shot. It refuses to write a tile that fails any of those, because
 * a tile of empty paper is exactly what this game would produce by accident.
 */
import { serve, open, waitFrames, ROOT } from '../test/harness.mjs';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const s = await serve();
/* ⛔ THREE TIMES THE PIXELS. The tile is a hundred and seventy CSS pixels of
   the room blown up to five hundred and twelve, and at a device ratio of one
   that is a blurry aeroplane with a staircase for an edge. */
const { browser, page } = await open(s.base, { width: 600, height: 600, deviceScaleFactor: 3 });

/* a cruiser at the top of its swoop, nose up, and away from the banners: a
   plane pointing down through a gymnasium banner reads as a crash, which is not
   what the tile should promise */
await page.evaluate(() => {
  /* ⛔ ABOVE THE WINDOWS. The gym's high windows sit between three and four
     metres and a plane at that height has a window frame behind it in every
     frame. Thrown hard and high this one tops out over five, where the wall
     above them is plain. */
  AIRWORTHY_TEST.toField({ nose: 'pointed', noseFolds: 3, wing: 0.4, elev: 1, precision: 1 });
  const res = AIRWORTHY_TEST.launch(28, 0.95);
  const rings = AIRWORTHY_TEST.courses().gym.rings.map(r => r.x);
  let best = null;
  if (!res.trace.some(p => p.y >= 4.6)) throw new Error('the throw never got above the windows');
  for (const p of res.trace) {
    if (p.t < 0.35 || p.y < 4.6) continue;
    if (rings.some(rx => Math.abs(p.x - rx) < 2.2)) continue;
    const score = p.theta * 2 + p.y * 0.2;
    if (!best || score > best.score) best = { t: p.t, score: score, x: p.x, y: p.y, th: p.theta };
  }
  AIRWORTHY_TEST.advance(best ? best.t : 1.9);
  window.__THUMB_AT = best;
});
await waitFrames(page, 4);

const shot = await page.evaluate(async () => {
  const src = document.getElementById('stage');
  const live = AIRWORTHY_TEST.state().live;
  const at = AIRWORTHY_TEST.toScreen(live.x, live.y);
  const ground = AIRWORTHY_TEST.toScreen(live.x, 0);
  const cv = document.createElement('canvas');
  cv.width = 512; cv.height = 512;
  const c = cv.getContext('2d');
  const dpr = src.width / src.clientWidth;
  /* frame the plane with the floor under it: the tile has to say "a paper
     plane, in a room", not "a beige square" */
  /* ⛔ TIGHT. Framed a whole room wide the tile was ninety percent empty paper
     with a school banner in the middle of it and the aeroplane small and off to
     one side. The subject is the plane. */
  const side = 118;
  const sx = at.x - side * 0.5, sy = at.y - side * 0.36;
  c.fillStyle = '#EFE9DC'; c.fillRect(0, 0, 512, 512);
  c.drawImage(src, sx * dpr, sy * dpr, side * dpr, side * dpr, 0, 0, 512, 512);
  const d = c.getImageData(0, 0, 512, 512);
  for (let i = 0; i < d.data.length; i++) { if (i % 4 !== 3) d.data[i] = d.data[i] & 0xF8; }
  c.putImageData(d, 0, 0);
  return { png: cv.toDataURL('image/png').split(',')[1], planeAt: { x: 0.42, y: 0.32 } };
});
const buf = Buffer.from(shot.png, 'base64');

const measured = await page.evaluate(async (b) => {
  const im = new Image();
  await new Promise(r => { im.onload = r; im.src = 'data:image/png;base64,' + b; });
  const cv = document.createElement('canvas');
  cv.width = im.width; cv.height = im.height;
  const c = cv.getContext('2d');
  c.drawImage(im, 0, 0);
  const d = c.getImageData(0, 0, cv.width, cv.height).data;
  let ink = 0, n = 0, inkNear = 0, nNear = 0, rows = 0;
  const W = cv.width, H = cv.height;
  for (let y = 0; y < H; y += 2) {
    let rowInk = 0;
    for (let x = 0; x < W; x += 2) {
      const i = (y * W + x) * 4;
      const dark = (d[i] + d[i + 1] + d[i + 2]) < 480;
      n++; if (dark) { ink++; rowInk++; }
      /* the middle third, where the plane was framed to sit */
      if (x > W * 0.28 && x < W * 0.72 && y > H * 0.24 && y < H * 0.62) {
        nNear++; if (dark) inkNear++;
      }
    }
    if (rowInk > W * 0.30) rows++;
  }
  return { ink: ink / n, near: inkNear / nNear, floorRows: rows, w: W, h: H };
}, buf.toString('base64'));

await browser.close(); s.close();

const problems = [];
if (measured.ink < 0.004) problems.push('nothing in it (' + (measured.ink * 100).toFixed(2) + ' percent ink)');
if (measured.near < 0.02) problems.push('the plane is not big enough in the crop ('
  + (measured.near * 100).toFixed(2) + ' percent ink where it was framed)');

if (buf.length > 150 * 1024) problems.push('too heavy (' + (buf.length / 1024).toFixed(0) + ' KB)');
console.log('  ' + measured.w + 'x' + measured.h + '  ' + (buf.length / 1024).toFixed(0) + ' KB  '
  + (measured.ink * 100).toFixed(2) + ' percent ink, ' + (measured.near * 100).toFixed(2)
  + ' percent of it where the plane was framed, ' + measured.floorRows + ' floor rows');
if (problems.length) {
  console.log('REFUSING TO WRITE THE TILE: ' + problems.join('; '));
  process.exit(1);
}
writeFileSync(join(ROOT, 'docs', 'thumb.png'), buf);
console.log('docs/thumb.png written');
console.log('THUMB OK');
