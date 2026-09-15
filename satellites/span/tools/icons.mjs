#!/usr/bin/env node
/* SPAN's icons, drawn in code (no painted art: that is Stephen's, later): two stone piers on the canyon and a span
 * lying flat across them, the game's one rule in one picture.
 *
 *   node tools/icons.mjs           writes icon-192.png, icon-512.png and icon-maskable-512.png
 *
 * The maskable icon keeps its picture inside the inner 80 percent circle a launcher may crop to, on a full bleed
 * background. Every icon is opened with the Read tool and three faults are named before it ships.
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from '../../math/core/test/harness.mjs';

const SPAN = join(dirname(fileURLToPath(import.meta.url)), '..');

/* the picture on a 100 unit square; `inset` shrinks it toward the centre for the maskable safe zone.
   ⛔ The first drawing, a slab overhanging two legs, read as the letter pi: in a math catalog that is a second meaning
   the icon must not have. The span now ends flush with the piers' outer faces, the piers are wide and coursed like
   laid stone, and they stand on the ground inside the frame. No corner is rounded here; a launcher applies its own. */
/* ⛔ the second drawing, heavy dark courses boxed in a heavy frame, read as a chest of drawers: the courses are now thin
   and light, joints offset like laid stone, the piers stand apart across a real gap, and a shadow line parts the span
   from the stones it rests on */
const svg = (size, inset) => {
  const pier = x => {
    const rows = [55, 64, 73, 82].map(y => `<line x1="${x}" y1="${y}" x2="${x + 20}" y2="${y}" stroke="#766c5e" stroke-width="0.9"/>`).join('');
    const joints = [[46, 55, 10], [55, 64, 5], [55, 64, 15], [64, 73, 10], [73, 82, 5], [73, 82, 15], [82, 92, 10]]
      .map(([y1, y2, dx]) => `<line x1="${x + dx}" y1="${y1}" x2="${x + dx}" y2="${y2}" stroke="#766c5e" stroke-width="0.9"/>`).join('');
    return `<rect x="${x}" y="46" width="20" height="46" fill="#8c8272" stroke="#4f483e" stroke-width="1.8"/>${rows}${joints}`;
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#cfdde3"/><stop offset="0.62" stop-color="#cfdde3"/>
    <stop offset="0.62" stop-color="#a38b6c"/><stop offset="1" stop-color="#6f5c46"/></linearGradient></defs>
  <rect x="0" y="0" width="100" height="100" fill="url(#g)"/>
  <g transform="translate(${inset} ${inset}) scale(${(100 - 2 * inset) / 100})">
    ${pier(15)}${pier(65)}
    <rect x="14" y="36" width="72" height="8" fill="#4a3f33"/>
    <rect x="14" y="44" width="72" height="2" fill="#2f2820" opacity="0.55"/>
  </g>
</svg>`;
};

const browser = await launch();
const page = await browser.newPage();
for (const [name, size, inset] of [['icon-192.png', 192, 0], ['icon-512.png', 512, 0], ['icon-maskable-512.png', 512, 12]]) {
  await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
  await page.setContent('<html><body style="margin:0;background:transparent">' + svg(size, inset) + '</body></html>');
  const buf = await page.screenshot({ type: 'png', omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
  writeFileSync(join(SPAN, name), buf);
  console.log('  ' + name + '  ' + size + 'x' + size + '  ' + Math.round(buf.length / 1024) + ' KB');
}
await browser.close();
console.log('icons done');
