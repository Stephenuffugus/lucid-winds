#!/usr/bin/env node
/* CREASE's icons, drawn in code (no painted art: that is Stephen's, later): a paper strip on the board, creased into four
 * equal parts, a clip standing on the third crease, the game's one picture.
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

const CREASE = join(dirname(fileURLToPath(import.meta.url)), '..');

/* the picture on a 100 unit square; `inset` shrinks it toward the centre for the maskable safe zone */
const svg = (size, inset) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100" shape-rendering="crispEdges">
  <rect x="0" y="0" width="100" height="100" fill="#8a6f4d"/>
  <g transform="translate(${inset} ${inset}) scale(${(100 - 2 * inset) / 100})">
    <rect x="10" y="54" width="80" height="20" fill="#fbf7ee" stroke="#b9ab91" stroke-width="2"/>
    <rect x="29" y="54" width="2" height="20" fill="#8f826c"/>
    <rect x="49" y="54" width="2" height="20" fill="#8f826c"/>
    <rect x="69" y="54" width="2" height="20" fill="#8f826c"/>
    <rect x="6" y="48" width="4" height="32" fill="#5e4a33"/>
    <rect x="90" y="48" width="4" height="32" fill="#5e4a33"/>
    <!-- ⛔ the first clip was a filled bar with a slot and read as a marker pen or a memory stick; a paper clip is a bent
         wire, two loops one inside the other, standing on its foot at the crease -->
    <rect x="63" y="14" width="14" height="36" rx="7" fill="none" stroke="#3d5a78" stroke-width="3"/>
    <rect x="67" y="20" width="6" height="24" rx="3" fill="none" stroke="#3d5a78" stroke-width="3"/>
    <rect x="68" y="48" width="4" height="6" fill="#1f2f40"/>
  </g>
</svg>`;

const browser = await launch();
const page = await browser.newPage();
for (const [name, size, inset] of [['icon-192.png', 192, 0], ['icon-512.png', 512, 0], ['icon-maskable-512.png', 512, 12]]) {
  await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
  await page.setContent('<html><body style="margin:0;background:transparent">' + svg(size, inset) + '</body></html>');
  const buf = await page.screenshot({ type: 'png', omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
  writeFileSync(join(CREASE, name), buf);
  console.log('  ' + name + '  ' + size + 'x' + size + '  ' + Math.round(buf.length / 1024) + ' KB');
}
await browser.close();
console.log('icons done');
