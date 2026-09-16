#!/usr/bin/env node
/* GAUGE's icons, drawn in code (no painted art: that is Stephen's, later): a brass rule of ten divisions on the bench, one division
 * opened under a loupe into ten finer ones, the game's thesis in a picture.
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

const GAUGE = join(dirname(fileURLToPath(import.meta.url)), '..');
const ticks = (x0, x1, y, h, w) => Array.from({ length: 11 }, (_, i) => {
  const x = x0 + (x1 - x0) * i / 10;
  return `<rect x="${(x - w / 2).toFixed(2)}" y="${y}" width="${w}" height="${i % 5 === 0 ? h * 1.5 : h}" fill="#26282b"/>`;
}).join('');

const svg = (size, inset) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
  <rect x="0" y="0" width="100" height="100" fill="#efe8da"/>
  <g transform="translate(${inset} ${inset}) scale(${(100 - 2 * inset) / 100})">
    <rect x="8" y="60" width="84" height="16" fill="#b08a3e" stroke="#26282b" stroke-width="2"/>
    ${ticks(12, 88, 60, 6, 1.4)}
    <rect x="42.4" y="52" width="7.6" height="24" fill="none" stroke="#7d6128" stroke-width="2"/>
    <line x1="42.4" y1="52" x2="16" y2="40" stroke="#7d6128" stroke-width="1.5"/>
    <line x1="50" y1="52" x2="84" y2="40" stroke="#7d6128" stroke-width="1.5"/>
    <rect x="16" y="18" width="68" height="22" fill="#f7f2e7" stroke="#26282b" stroke-width="2"/>
    ${ticks(20, 80, 18, 6, 1)}
  </g>
</svg>`;

const browser = await launch();
const page = await browser.newPage();
for (const [name, size, inset] of [['icon-192.png', 192, 0], ['icon-512.png', 512, 0], ['icon-maskable-512.png', 512, 12]]) {
  await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
  await page.setContent('<html><body style="margin:0;background:transparent">' + svg(size, inset) + '</body></html>');
  const buf = await page.screenshot({ type: 'png', omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
  writeFileSync(join(GAUGE, name), buf);
  console.log('  ' + name + '  ' + size + 'x' + size + '  ' + Math.round(buf.length / 1024) + ' KB');
}
await browser.close();
console.log('icons done');
