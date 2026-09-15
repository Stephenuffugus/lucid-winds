#!/usr/bin/env node
/* BRIM's icons, drawn in code (no painted art: that is Stephen's, later): two glasses the same size on a bench, teal filled
 * higher and plum lower, the game's one picture.
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

const BRIM = join(dirname(fileURLToPath(import.meta.url)), '..');

/* the picture on a 100 unit square; `inset` shrinks it toward the centre for the maskable safe zone */
const svg = (size, inset) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100" shape-rendering="crispEdges">
  <rect x="0" y="0" width="100" height="100" fill="#efe9dd"/>
  <g transform="translate(${inset} ${inset}) scale(${(100 - 2 * inset) / 100})">
    <rect x="6" y="80" width="88" height="10" fill="#c9b89a"/>
    <rect x="6" y="88" width="88" height="4" fill="#8f7c5c"/>
    <rect x="18" y="22" width="26" height="58" fill="#f7f6f1"/>
    <rect x="18" y="37" width="26" height="43" fill="#1f6f73"/>
    <rect x="56" y="22" width="26" height="58" fill="#f7f6f1"/>
    <rect x="56" y="55" width="26" height="25" fill="#9c7d95"/>
    <path d="M18 22 V80 H44 V22" fill="none" stroke="#7d8a8c" stroke-width="3"/>
    <path d="M56 22 V80 H82 V22" fill="none" stroke="#7d8a8c" stroke-width="3"/>
  </g>
</svg>`;

const browser = await launch();
const page = await browser.newPage();
for (const [name, size, inset] of [['icon-192.png', 192, 0], ['icon-512.png', 512, 0], ['icon-maskable-512.png', 512, 12]]) {
  await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
  await page.setContent('<html><body style="margin:0;background:transparent">' + svg(size, inset) + '</body></html>');
  const buf = await page.screenshot({ type: 'png', omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
  writeFileSync(join(BRIM, name), buf);
  console.log('  ' + name + '  ' + size + 'x' + size + '  ' + Math.round(buf.length / 1024) + ' KB');
}
await browser.close();
console.log('icons done');
