#!/usr/bin/env node
/* YONDER's icons, drawn in code (no painted art: that is Stephen's, later): a straight road running out to a signpost, a
 * flag planted short of the far end, the game's one picture.
 *
 *   node tools/icons.mjs           writes icon-192.png, icon-512.png and icon-maskable-512.png
 *
 * Nothing round (Y1). The maskable icon keeps its picture inside the inner 80 percent a launcher may crop to, on a full
 * bleed background. Every icon is opened with the Read tool and three faults are named before it ships.
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from '../../math/core/test/harness.mjs';

const YONDER = join(dirname(fileURLToPath(import.meta.url)), '..');

/* the picture on a 100 unit square; `inset` shrinks it toward the centre for the maskable safe zone */
const svg = (size, inset) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100" shape-rendering="crispEdges">
  <rect x="0" y="0" width="100" height="56" fill="#d7e3e6"/>
  <rect x="0" y="56" width="100" height="44" fill="#8aa866"/>
  <g transform="translate(${inset} ${inset}) scale(${(100 - 2 * inset) / 100})">
    <!-- ⛔ the first icon hung the flag's cloth over the signpost's board and the two read as one clutter, high on the
         square; the flag now stands in the middle of the road, the signpost at its far end, the picture lower -->
    <rect x="8" y="66" width="84" height="10" fill="#c7a878"/>
    <rect x="8" y="64" width="84" height="2" fill="#6d5a3e"/>
    <rect x="8" y="76" width="84" height="2" fill="#6d5a3e"/>
    <rect x="6" y="60" width="4" height="22" fill="#3b3129"/>
    <rect x="86" y="38" width="4" height="28" fill="#7a5a3a"/>
    <polygon points="76,30 92,30 97,35 92,40 76,40" fill="#7a5a3a" stroke="#3b3129" stroke-width="2"/>
    <rect x="40" y="28" width="3" height="38" fill="#3b3129"/>
    <rect x="43" y="28" width="18" height="12" fill="#c2553a" stroke="#3b3129" stroke-width="2"/>
  </g>
</svg>`;

const browser = await launch();
const page = await browser.newPage();
for (const [name, size, inset] of [['icon-192.png', 192, 0], ['icon-512.png', 512, 0], ['icon-maskable-512.png', 512, 12]]) {
  await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
  await page.setContent('<html><body style="margin:0;background:transparent">' + svg(size, inset) + '</body></html>');
  const buf = await page.screenshot({ type: 'png', omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
  writeFileSync(join(YONDER, name), buf);
  console.log('  ' + name + '  ' + size + 'x' + size + '  ' + Math.round(buf.length / 1024) + ' KB');
}
await browser.close();
console.log('icons done');
