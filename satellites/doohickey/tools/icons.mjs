#!/usr/bin/env node
/* Doohickey's three PWA icons, rendered from one motif.
 *
 *   node tools/icons.mjs
 *
 * The motif is the game in one picture: a jar with a lid, one frond inside it,
 * and the light of a window on the glass. No letter, no face, nothing that
 * stops reading at 48 px.
 *
 * Maskable note, carried in every fleet icon script: Android crops a maskable
 * icon to an arbitrary shape and only the central 80 percent is guaranteed
 * visible, so that variant draws the same mark smaller inside a full bleed
 * field. The corner radius is in viewBox units, so anything over 50 collapses
 * the tile to a circle whose transparent corners composite to BLACK on an iOS
 * home screen.
 */
import { createRequire } from 'node:module';
const puppeteer = createRequire(import.meta.url)('/workspaces/lucid-winds/node_modules/puppeteer');
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BG = '#F4EBD3';
const INK = '#2C2418';
const RED = '#D8503C';
const BLUE = '#3D6FB4';
const GOLD = '#E8B33C';

function mark(scale) {
  const s = scale;
  /* the game in one picture: a marble at the top of a ramp, three dominoes
     under it, and the bell they are falling towards. No letter, nothing that
     stops reading at 48 px. */
  const dom = (x, y, lean) => `<g transform="translate(${x} ${y}) rotate(${lean})">`
    + `<rect x="-13" y="-46" width="26" height="92" rx="5" fill="${RED}" stroke="${INK}" stroke-width="12"/></g>`;
  return `
  <g transform="translate(256,256) scale(${s}) translate(-256,-256)">
    <rect x="88" y="140" width="176" height="26" rx="10" fill="#8A5A9B" stroke="${INK}"
          stroke-width="13" transform="rotate(28 176 153)"/>
    <circle cx="104" cy="112" r="38" fill="${BLUE}" stroke="${INK}" stroke-width="13"/>
    <circle cx="92" cy="100" r="12" fill="#FFFFFF" fill-opacity=".55"/>
    ${dom(214, 356, -34)}
    ${dom(272, 350, -16)}
    ${dom(326, 344, -4)}
    <g transform="translate(408 360) scale(1.15)">
      <path d="M-46 26 C-46 -34 46 -34 46 26 Z" fill="${GOLD}" stroke="${INK}" stroke-width="13"/>
      <path d="M-56 26 L56 26" stroke="${INK}" stroke-width="13" stroke-linecap="round"/>
      <circle cx="0" cy="42" r="10" fill="${INK}"/>
    </g>
    <path d="M40 410 L472 410" stroke="${INK}" stroke-width="14" stroke-linecap="round"/>
  </g>`;
}
const svg = (rounded, scale) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" ${rounded ? 'rx="96"' : ''} fill="${BG}"/>
  <radialGradient id="w" cx="34%" cy="22%" r="72%">
    <stop offset="0" stop-color="#FFFFFF" stop-opacity=".45"/>
    <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
  </radialGradient>
  <rect width="512" height="512" ${rounded ? 'rx="96"' : ''} fill="url(#w)"/>
  <g opacity=".5" stroke="#C9B98E" stroke-width="2">
    ${Array.from({length: 15}, (_, i) => `<path d="M${(i + 1) * 32} 0 L${(i + 1) * 32} 512"/><path d="M0 ${(i + 1) * 32} L512 ${(i + 1) * 32}"/>`).join('')}
  </g>
  ${mark(scale)}
</svg>`;

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage();
const shots = [
  ['icon-192.png', 192, svg(true, 1)],
  ['icon-512.png', 512, svg(true, 1)],
  ['icon-maskable-512.png', 512, svg(false, 0.78)]
];
for (const [name, size, body] of shots) {
  await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
  await page.setContent('<style>html,body{margin:0;background:transparent}svg{display:block;width:'
    + size + 'px;height:' + size + 'px}</style>' + body);
  const buf = await page.screenshot({ type: 'png', omitBackground: false });
  writeFileSync(join(ROOT, name), buf);
  /* an icon tool that writes a black square and prints OK is worse than none:
     measure the picture it just made */
  const lit = await page.evaluate(async (b) => {
    const im = new Image();
    await new Promise(r => { im.onload = r; im.src = 'data:image/png;base64,' + b; });
    const cv = document.createElement('canvas');
    cv.width = im.width; cv.height = im.height;
    const c = cv.getContext('2d'); c.drawImage(im, 0, 0);
    const d = c.getImageData(0, 0, cv.width, cv.height).data;
    let bright = 0, red = 0, n = 0;
    for (let i = 0; i < d.length; i += 4 * 13) {
      n++;
      if (d[i] + d[i + 1] + d[i + 2] > 150) bright++;
      if (d[i] > d[i + 1] + 40 && d[i] > 120) red++;
    }
    return { bright: bright / n, red: red / n };
  }, buf.toString('base64'));
  if (lit.bright < 0.4) throw new Error(name + ' came out dark for a cream game (' + (lit.bright * 100).toFixed(1) + ' percent lit)');
  /* the maskable variant draws the same mark smaller, so it has less of
     everything: the floor is set for that one, not for the round ones */
  if (lit.red < 0.012) throw new Error(name + ' has no dominoes in it (' + (lit.red * 100).toFixed(2) + ' percent red)');
  console.log('  ' + name + '  ' + (buf.length / 1024).toFixed(0) + ' KB   lit '
    + (lit.bright * 100).toFixed(0) + '%  red ' + (lit.red * 100).toFixed(1) + '%');
}
await browser.close();
console.log('icons done');
