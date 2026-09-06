#!/usr/bin/env node
/* Windup's three PWA icons, rendered from one motif.
 *
 *   node tools/icons.mjs
 *
 * The motif is the game in one picture: a paper strip with three punched holes
 * running across a walnut box, and the crank handle on the right. No letter, no
 * face, nothing that stops reading at 48 px.
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
const BG = '#2A1D16';
const INK = '#1A120C';
const PAPER = '#F2E7CE';
const BRASS = '#C9A227';
const WALNUT = '#5A3A22';

function mark(scale) {
  const s = scale;
  /* the game in one picture: the strip with its holes going into the box, and
     the crank waiting to be turned */
  return `
  <g transform="translate(256,256) scale(${s}) translate(-256,-256)">
    <rect x="40" y="196" width="300" height="120" rx="14" fill="${PAPER}"/>
    <circle cx="112" cy="238" r="19" fill="${INK}"/>
    <circle cx="196" cy="274" r="19" fill="${INK}"/>
    <circle cx="280" cy="230" r="19" fill="${INK}"/>
    <rect x="300" y="150" width="150" height="212" rx="20" fill="${WALNUT}"
          stroke="${INK}" stroke-width="12"/>
    <rect x="318" y="176" width="114" height="26" rx="8" fill="${BRASS}" opacity=".85"/>
    <g stroke="${BRASS}" stroke-width="9" stroke-linecap="round">
      <path d="M330 232 L420 232"/><path d="M330 258 L420 258"/><path d="M330 284 L420 284"/>
    </g>
    <circle cx="375" cy="336" r="26" fill="none" stroke="${BRASS}" stroke-width="13"/>
    <path d="M375 336 L426 300" stroke="${BRASS}" stroke-width="15" stroke-linecap="round"/>
    <circle cx="430" cy="297" r="17" fill="${BRASS}"/>
  </g>`;
}
const svg = (rounded, scale) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" ${rounded ? 'rx="96"' : ''} fill="${BG}"/>
  <radialGradient id="w" cx="34%" cy="22%" r="72%">
    <stop offset="0" stop-color="#FFE9A8" stop-opacity=".30"/>
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
