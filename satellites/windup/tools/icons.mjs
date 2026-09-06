#!/usr/bin/env node
/* Airworthy's three PWA icons, rendered from one motif.
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
const BG = '#EFE9DC';
const INK = '#33302A';
const PAPER = '#FBF8F1';
const CREASE = '#3C6E9F';

function mark(scale) {
  const s = scale;
  /* the game in one picture: a paper dart climbing, with its dotted trail
     behind it. No letter, nothing that stops reading at 48 px. */
  return `
  <g transform="translate(256,256) scale(${s}) translate(-256,-256)">
    <path d="M56 402 C120 382 190 344 258 292" fill="none" stroke="${INK}"
          stroke-width="13" stroke-linecap="round" stroke-dasharray="3 26" opacity=".72"/>
    <g transform="translate(300 240) rotate(-30)">
      <path d="M150 0 L-84 -60 L-40 0 L-84 34 Z" fill="${PAPER}" stroke="${INK}"
            stroke-width="13" stroke-linejoin="round"/>
      <path d="M140 0 L-66 -22" stroke="${CREASE}" stroke-width="11" stroke-linecap="round"/>
    </g>
    <path d="M40 424 L472 424" stroke="${INK}" stroke-width="16" stroke-linecap="round"/>
  </g>`;
}
const svg = (rounded, scale) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" ${rounded ? 'rx="96"' : ''} fill="${BG}"/>
  <radialGradient id="w" cx="34%" cy="22%" r="72%">
    <stop offset="0" stop-color="#FFFFFF" stop-opacity=".45"/>
    <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
  </radialGradient>
  <rect width="512" height="512" ${rounded ? 'rx="96"' : ''} fill="url(#w)"/>

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
      if (d[i] + d[i + 1] + d[i + 2] < 260) red++;
    }
    return { bright: bright / n, red: red / n };
  }, buf.toString('base64'));
  if (lit.bright < 0.4) throw new Error(name + ' came out dark for a cream game (' + (lit.bright * 100).toFixed(1) + ' percent lit)');
  /* the maskable variant draws the same mark smaller, so it has less of
     everything: the floor is set for that one, not for the round ones */
  if (lit.red < 0.004) throw new Error(name + ' has no plane in it (' + (lit.red * 100).toFixed(2) + ' percent ink)');
  console.log('  ' + name + '  ' + (buf.length / 1024).toFixed(0) + ' KB   lit '
    + (lit.bright * 100).toFixed(0) + '%  ink ' + (lit.red * 100).toFixed(1) + '%');
}
await browser.close();
console.log('icons done');
