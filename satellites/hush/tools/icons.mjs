#!/usr/bin/env node
/* HUSH's icons, drawn in code from the game's own sprite table (no painted art: that is Stephen's, later): the deer grazing in the
 * dawn grass under the low sun, the game's first picture.
 *
 *   node tools/icons.mjs           writes icon-192.png, icon-512.png and icon-maskable-512.png (under the gate lock)
 *
 * The maskable icon keeps its picture inside the inner 80 percent a launcher may crop to. Every icon is opened with the Read tool
 * and three faults are named before it ships.
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from '../../math/core/test/harness.mjs';
import { SPRITES, PALETTE, COATS } from '../sprites.js';

const HUSH = join(dirname(fileURLToPath(import.meta.url)), '..');
const grid = SPRITES.deer4graze, pal = PALETTE.slice();
pal[4] = COATS.deer[0]; pal[5] = COATS.deer[1]; pal[6] = COATS.deer[2];

const svg = (size, inset) => {
  const px = (100 - 2 * inset) / 100, cell = 64 * px / grid[0].length, ox = inset + 18 * px, oy = inset + 22 * px;
  let rects = '';
  grid.forEach((row, y) => { for (let x = 0; x < row.length; x++) if (row[x] !== '.') rects += `<rect x="${(ox + x * cell).toFixed(2)}" y="${(oy + y * cell).toFixed(2)}" width="${(cell + 0.05).toFixed(2)}" height="${(cell + 0.05).toFixed(2)}" fill="${pal[parseInt(row[x], 16)]}"/>`; });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100" shape-rendering="crispEdges">
  <rect x="0" y="0" width="100" height="100" fill="${PALETTE[0]}"/>
  <rect x="0" y="${inset + 26 * px}" width="100" height="${6 * px}" fill="${PALETTE[13]}"/>
  <rect x="0" y="${inset + 32 * px}" width="100" height="${14 * px}" fill="${PALETTE[1]}"/>
  <rect x="0" y="${inset + 46 * px}" width="100" height="${100 - (inset + 46 * px)}" fill="${PALETTE[3]}"/>
  <rect x="0" y="${inset + 84 * px}" width="100" height="${100 - (inset + 84 * px)}" fill="${PALETTE[2]}"/>
  ${rects}
</svg>`;
};

const browser = await launch();
const page = await browser.newPage();
for (const [name, size, inset] of [['icon-192.png', 192, 0], ['icon-512.png', 512, 0], ['icon-maskable-512.png', 512, 12]]) {
  await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
  await page.setContent('<html><body style="margin:0;background:transparent">' + svg(size, inset) + '</body></html>');
  const buf = await page.screenshot({ type: 'png', omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
  writeFileSync(join(HUSH, name), buf);
  console.log('  ' + name + '  ' + size + 'x' + size + '  ' + Math.round(buf.length / 1024) + ' KB');
}
await browser.close();
console.log('icons done');
