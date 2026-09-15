#!/usr/bin/env node
/* NOTCH's icons, drawn in code (no painted art: that is Stephen's, later): a carved piece turned over its dark notch on the
 * workshop board, the game's one picture, with its grain.
 *
 *   node tools/icons.mjs           writes icon-192.png, icon-512.png and icon-maskable-512.png (under the gate lock)
 *
 * The maskable icon keeps its picture inside the inner 80 percent a launcher may crop to, on a full bleed background. Every
 * icon is opened with the Read tool and three faults are named before it ships.
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from '../../math/core/test/harness.mjs';

const NOTCH = join(dirname(fileURLToPath(import.meta.url)), '..');

/* the picture on a 100 unit square: the board, the hook's notch, and the hook itself turned 30 degrees over it with grain */
const svg = (size, inset) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
  <defs><clipPath id="c"><path d="M-30 -20 h60 v20 h-40 v30 h-20 z"/></clipPath></defs>
  <rect x="0" y="0" width="100" height="100" fill="#2a2119"/>
  <g transform="translate(${inset} ${inset}) scale(${(100 - 2 * inset) / 100})">
    <rect x="8" y="8" width="84" height="84" rx="6" fill="#5a4330"/>
    <g transform="translate(50 50)"><path d="M-30 -20 h60 v20 h-40 v30 h-20 z" fill="#1b140e"/></g>
    <g transform="translate(52 52) rotate(-30)">
      <path d="M-30 -20 h60 v20 h-40 v30 h-20 z" fill="#c89a63" stroke="#3a2a1c" stroke-width="2" stroke-linejoin="round"/>
      <g clip-path="url(#c)" stroke="#8c6239" stroke-width="2">
        <line x1="-40" y1="-16" x2="40" y2="-16"/><line x1="-40" y1="-9" x2="40" y2="-9"/><line x1="-40" y1="-2" x2="40" y2="-2"/>
        <line x1="-40" y1="5" x2="40" y2="5"/><line x1="-40" y1="12" x2="40" y2="12"/><line x1="-40" y1="19" x2="40" y2="19"/><line x1="-40" y1="26" x2="40" y2="26"/>
      </g>
    </g>
  </g>
</svg>`;

const browser = await launch();
const page = await browser.newPage();
for (const [name, size, inset] of [['icon-192.png', 192, 0], ['icon-512.png', 512, 0], ['icon-maskable-512.png', 512, 12]]) {
  await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
  await page.setContent('<html><body style="margin:0;background:transparent">' + svg(size, inset) + '</body></html>');
  const buf = await page.screenshot({ type: 'png', omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
  writeFileSync(join(NOTCH, name), buf);
  console.log('  ' + name + '  ' + size + 'x' + size + '  ' + Math.round(buf.length / 1024) + ' KB');
}
await browser.close();
console.log('icons done');
