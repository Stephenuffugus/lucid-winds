#!/usr/bin/env node
/* GLIMPSE's icons, drawn in code (no painted art: that is Stephen's, later): three fireflies over dark grass, the game's one
 * picture.
 *
 *   node tools/icons.mjs           writes icon-192.png, icon-512.png and icon-maskable-512.png
 *
 * The maskable icon keeps its picture inside the inner 80 percent a launcher may crop to, on a full bleed background. Every
 * icon is opened with the Read tool and three faults are named before it ships.
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from '../../math/core/test/harness.mjs';

const GLIMPSE = join(dirname(fileURLToPath(import.meta.url)), '..');

/* the picture on a 100 unit square; `inset` shrinks it toward the centre for the maskable safe zone */
const svg = (size, inset) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100" shape-rendering="crispEdges">
  <rect x="0" y="0" width="100" height="100" fill="#10161f"/>
  <g transform="translate(${inset} ${inset}) scale(${(100 - 2 * inset) / 100})">
    <rect x="0" y="80" width="100" height="20" fill="#1f3526"/>
    <rect x="10" y="74" width="4" height="6" fill="#2f4d36"/><rect x="40" y="72" width="4" height="8" fill="#2f4d36"/><rect x="78" y="74" width="4" height="6" fill="#2f4d36"/>
    <rect x="20" y="28" width="14" height="14" fill="#2d5b86"/><rect x="23" y="31" width="8" height="8" fill="#6fb7ff"/><rect x="25" y="33" width="4" height="4" fill="#e6f3ff"/>
    <rect x="60" y="18" width="14" height="14" fill="#2d5b86"/><rect x="63" y="21" width="8" height="8" fill="#6fb7ff"/><rect x="65" y="23" width="4" height="4" fill="#e6f3ff"/>
    <rect x="44" y="50" width="14" height="14" fill="#2d5b86"/><rect x="47" y="53" width="8" height="8" fill="#6fb7ff"/><rect x="49" y="55" width="4" height="4" fill="#e6f3ff"/>
  </g>
</svg>`;

const browser = await launch();
const page = await browser.newPage();
for (const [name, size, inset] of [['icon-192.png', 192, 0], ['icon-512.png', 512, 0], ['icon-maskable-512.png', 512, 12]]) {
  await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
  await page.setContent('<html><body style="margin:0;background:transparent">' + svg(size, inset) + '</body></html>');
  const buf = await page.screenshot({ type: 'png', omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
  writeFileSync(join(GLIMPSE, name), buf);
  console.log('  ' + name + '  ' + size + 'x' + size + '  ' + Math.round(buf.length / 1024) + ' KB');
}
await browser.close();
console.log('icons done');
