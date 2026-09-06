#!/usr/bin/env node
/* The arcade tile: a skull half out of the rock, with the strata behind it.
 *
 *   node tools/thumb.mjs
 *
 * ⛔ a thumb tool that writes a flat brown square and prints OK is worse than
 * no tool at all, so this one MEASURES the picture it just made: how much bone
 * is in it, how much rock, and whether the whole thing is too dark. It refuses
 * to write a tile that fails any of those.
 */
import { serve, open, waitFrames, tap, ROOT } from '../test/harness.mjs';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const s = await serve();
const { browser, page } = await open(s.base, { width: 760, height: 760, deviceScaleFactor: 1 });
await waitFrames(page, 2);
await tap(page, '#btnDig');
await waitFrames(page, 2);
/* a site with a big skull in it, worked the way a player works one */
const found = await page.evaluate(() => {
  for (let k = 0; k < 90; k++) {
    /* ⛔ a SHALLOW site. The deep bands run to a fortieth of white and a tile
       cropped in one is a dark smudge at forty eight pixels, however good the
       find in it is. */
    STRATA_TEST.site(1000 + k * 7, 0);
    const bs = STRATA_TEST.bones(0);
    const skull = bs.find(b => b.kind === 'skull' && !b.missing && b.cells > 220
      && b.poly[0].y < 190);
    if (!skull) continue;
    STRATA_TEST.clean(skull.id, 16);
    const jaw = bs.find(b => b.kind === 'jaw' && !b.missing);
    if (jaw) STRATA_TEST.clean(jaw.id, 12);
    /* and a little of what is around it, so it is emerging rather than pasted on */
    for (const b of bs) {
      if (b.missing || b === skull) continue;
      const d = Math.hypot(b.poly[0].x - skull.poly[0].x, b.poly[0].y - skull.poly[0].y);
      if (d < 40) STRATA_TEST.clean(b.id, 7);
    }
    return { id: skull.id, seed: 1000 + k * 7 };
  }
  return null;
});
if (!found) { console.log('REFUSED: no site in forty had a skull big enough to photograph'); process.exit(1); }
await page.evaluate(() => {
  for (const id of ['rail', 'siteChip', 'btnMenu', 'banner', 'btnMount', 'toast'])
    { const e = document.getElementById(id); if (e) e.style.display = 'none'; }
});
await waitFrames(page, 4);

const b64 = await page.evaluate(async (id) => {
  const bn = STRATA_TEST.boneById(id);
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const p of bn.poly) {
    x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x);
    y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y);
  }
  /* ⛔ a tight crop on a freed bone is mostly the dark hollow behind it, and at
     forty eight pixels the tile is a smudge. The frame takes in the strata
     round the find, which is what the game is called after. */
  const pad = Math.max(x1 - x0, y1 - y0) * 1.15;
  const a = STRATA_TEST.toScreen(x0 - pad, y0 - pad);
  const d2 = STRATA_TEST.toScreen(x1 + pad, y1 + pad);
  const src = document.getElementById('board');
  const dpr = src.width / src.clientWidth;
  const sw = (d2.x - a.x) * dpr, sh = (d2.y - a.y) * dpr;
  const side = Math.max(sw, sh);
  const cv = document.createElement('canvas');
  cv.width = 512; cv.height = 512;
  const c = cv.getContext('2d');
  c.drawImage(src, a.x * dpr - (side - sw) / 2, a.y * dpr - (side - sh) / 2, side, side, 0, 0, 512, 512);
  const d = c.getImageData(0, 0, 512, 512);
  for (let i = 0; i < d.data.length; i++) { if (i % 4 !== 3) d.data[i] = d.data[i] & 0xF0; }
  c.putImageData(d, 0, 0);
  return cv.toDataURL('image/png').split(',')[1];
}, found.id);
const buf = Buffer.from(b64, 'base64');

const m = await page.evaluate(async (bb) => {
  const im = new Image();
  await new Promise(r => { im.onload = r; im.src = 'data:image/png;base64,' + bb; });
  const cv = document.createElement('canvas');
  cv.width = im.width; cv.height = im.height;
  const c = cv.getContext('2d');
  c.drawImage(im, 0, 0);
  const d = c.getImageData(0, 0, cv.width, cv.height).data;
  let lit = 0, bone = 0, rock = 0, dark = 0, n = 0;
  for (let i = 0; i < d.length; i += 4 * 7) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    n++;
    if (r + g + b > 300) lit++;
    /* ⛔ what matters is not how LIGHT the tile is, which only measures the
       palette a cliff happens to be painted in, but how much of it is the
       black of an empty hollow */
    if (r + g + b < 190) dark++;
    if (r > 225 && g > 208 && b > 165) bone++;
    if (r > 90 && r < 210 && r > b + 25) rock++;
  }
  return { lit: lit / n, dark: dark / n, bone: bone / n, rock: rock / n, w: im.width, h: im.height };
}, buf.toString('base64'));

await browser.close(); s.close();

const problems = [];
if (m.dark > 0.30) problems.push('mostly empty hollow (' + (m.dark * 100).toFixed(0) + ' percent black)');
if (m.bone < 0.06) problems.push('there is no bone in it (' + (m.bone * 100).toFixed(2) + ' percent)');
if (m.rock < 0.25) problems.push('there is no rock round it (' + (m.rock * 100).toFixed(0) + ' percent)');
if (buf.length > 150 * 1024) problems.push('too heavy (' + (buf.length / 1024).toFixed(0) + ' KB)');
if (problems.length) {
  console.log('REFUSED to write the thumb: ' + problems.join(', '));
  process.exit(1);
}
writeFileSync(join(ROOT, 'docs', 'thumb.png'), buf);
console.log('  docs/thumb.png  ' + (buf.length / 1024).toFixed(0) + ' KB   ' + m.w + 'x' + m.h
  + '   dark ' + (m.dark * 100).toFixed(0) + '%  bone ' + (m.bone * 100).toFixed(1)
  + '%  rock ' + (m.rock * 100).toFixed(0) + '%   seed ' + 0);
console.log('THUMB OK');
