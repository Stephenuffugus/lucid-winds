#!/usr/bin/env node
/* TINT's icons, drawn in code (no painted art: that is Stephen's, later): two cloths hanging side by side in one madder shade, the
 * game's thesis in a picture.
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
import { mixLinear, DYES } from '../colour.js';

const TINT = join(dirname(fileURLToPath(import.meta.url)), '..');
const shade = mixLinear(DYES.madder, 2, 1).hex;

const svg = (size, inset) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
  <rect x="0" y="0" width="100" height="100" fill="#efe6d8"/>
  <g transform="translate(${inset} ${inset}) scale(${(100 - 2 * inset) / 100})">
    <rect x="8" y="14" width="84" height="5" fill="#6b5a48"/>
    <rect x="16" y="19" width="30" height="62" fill="${shade}"/><rect x="54" y="19" width="30" height="62" fill="${shade}"/>
    <rect x="16" y="19" width="30" height="62" fill="none" stroke="#2b2a26" stroke-width="2"/><rect x="54" y="19" width="30" height="62" fill="none" stroke="#2b2a26" stroke-width="2"/>
  </g>
</svg>`;

const browser = await launch();
const page = await browser.newPage();
for (const [name, size, inset] of [['icon-192.png', 192, 0], ['icon-512.png', 512, 0], ['icon-maskable-512.png', 512, 12]]) {
  await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
  await page.setContent('<html><body style="margin:0;background:transparent">' + svg(size, inset) + '</body></html>');
  const buf = await page.screenshot({ type: 'png', omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
  writeFileSync(join(TINT, name), buf);
  console.log('  ' + name + '  ' + size + 'x' + size + '  ' + Math.round(buf.length / 1024) + ' KB');
}
await browser.close();
console.log('icons done');
