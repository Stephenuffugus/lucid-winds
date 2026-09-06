#!/usr/bin/env node
/* Strata's three PWA icons, rendered from one motif.
 *
 *   node tools/icons.mjs
 *
 * The motif is the game in one picture: a skull half out of a cliff face, with
 * the sediment bands behind it and a brush stroke of dust coming off it. No
 * letter, no face, nothing that stops reading at 48 px.
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
const ROCK = '#8A6A44';
const ROCK2 = '#6E5335';
const ROCK3 = '#A2814F';
const INK = '#33291C';
const BONE = '#F4E8CB';
const BONE2 = '#C6AE81';
const DUST = '#D8C096';

function mark(scale) {
  /* a skull coming out of the rock: a cranium, a jaw, an eye socket and a row
     of teeth, with the sediment bands behind it */
  return `
  <g transform="translate(256,256) scale(${scale}) translate(-256,-256)">
    <g stroke="${INK}" stroke-width="12" stroke-linecap="round" opacity=".35">
      <path d="M28 150 C140 132 330 176 484 150"/>
      <path d="M28 244 C150 226 320 268 484 244"/>
      <path d="M28 338 C130 318 340 362 484 338"/>
    </g>
    <!-- the cranium -->
    <path d="M118 300 C102 214 166 148 254 148 C330 148 384 184 404 226
             C420 258 436 268 448 274 C438 292 414 300 392 302 L150 348
             C132 348 120 328 118 300 Z"
          fill="${BONE}" stroke="${INK}" stroke-width="16" stroke-linejoin="round"/>
    <!-- the eye socket, which is what makes a shape read as a skull -->
    <ellipse cx="212" cy="234" rx="46" ry="40" fill="${INK}"/>
    <ellipse cx="204" cy="226" rx="16" ry="13" fill="${ROCK2}" opacity=".5"/>
    <!-- the nostril: a slit near the end of the snout, small enough that it
         cannot be read as a second eye -->
    <ellipse cx="372" cy="226" rx="11" ry="6" fill="${INK}" transform="rotate(-18 372 226)"/>
    <!-- the cheek arch sits UNDER the eye, where a skull's does. Drawn across
         the snout it was a smile, and the whole thing was a face again. -->
    <path d="M170 268 C208 282 246 280 274 264" stroke="${INK}" stroke-width="10"
          fill="none" stroke-linecap="round" opacity=".45"/>
    <!-- the jaw, and the teeth in it -->
    <g fill="${BONE}" stroke="${INK}" stroke-width="9">
      <path d="M182 344 l13 34 l13 -32 z"/>
      <path d="M232 348 l13 36 l13 -34 z"/>
      <path d="M284 350 l13 36 l13 -34 z"/>
      <path d="M336 344 l12 32 l13 -31 z"/>
    </g>
    <path d="M150 372 C214 398 334 400 396 366 L404 396 C336 432 210 430 144 400 Z"
          fill="${BONE}" stroke="${INK}" stroke-width="15" stroke-linejoin="round"/>
    <!-- the dust coming off it -->
    <g fill="${DUST}" opacity=".9">
      <circle cx="452" cy="150" r="15"/>
      <circle cx="418" cy="112" r="11"/>
      <circle cx="466" cy="104" r="8"/>
      <circle cx="392" cy="86" r="7"/>
    </g>
    <path d="M108 316 C92 262 106 206 138 172" stroke="${BONE2}" stroke-width="10"
          fill="none" stroke-linecap="round" opacity=".8"/>
  </g>`;
}
const svg = (rounded, scale) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" ${rounded ? 'rx="96"' : ''} fill="${ROCK}"/>
  <g opacity=".5">
    <path d="M0 0 H512 V96 C380 118 150 78 0 104 Z" fill="${ROCK3}"/>
    <path d="M0 118 C160 92 380 132 512 110 V196 C360 216 150 178 0 202 Z" fill="${ROCK}"/>
    <path d="M0 330 C150 306 370 346 512 322 V512 H0 Z" fill="${ROCK2}"/>
  </g>
  <radialGradient id="sun" cx="42%" cy="26%" r="78%">
    <stop offset="0" stop-color="#FFFFFF" stop-opacity=".26"/>
    <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
  </radialGradient>
  <rect width="512" height="512" ${rounded ? 'rx="96"' : ''} fill="url(#sun)"/>
  ${mark(scale)}
</svg>`;

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage();
const shots = [
  ['icon-192.png', 192, svg(true, 1)],
  ['icon-512.png', 512, svg(true, 1)],
  ['icon-maskable-512.png', 512, svg(false, 0.76)]
];
for (const [name, size, body] of shots) {
  await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
  await page.setContent('<style>html,body{margin:0;background:transparent}svg{display:block;width:'
    + size + 'px;height:' + size + 'px}</style>' + body);
  const buf = await page.screenshot({ type: 'png', omitBackground: false });
  writeFileSync(join(ROOT, name), buf);
  /* an icon tool that writes a blank square and prints OK is worse than none:
     measure the picture it just made */
  const lit = await page.evaluate(async (b) => {
    const im = new Image();
    await new Promise(r => { im.onload = r; im.src = 'data:image/png;base64,' + b; });
    const cv = document.createElement('canvas');
    cv.width = im.width; cv.height = im.height;
    const c = cv.getContext('2d'); c.drawImage(im, 0, 0);
    const d = c.getImageData(0, 0, cv.width, cv.height).data;
    let bright = 0, bone = 0, ink = 0, n = 0;
    for (let i = 0; i < d.length; i += 4 * 13) {
      n++;
      if (d[i] + d[i + 1] + d[i + 2] > 300) bright++;
      if (d[i] > 225 && d[i + 1] > 208 && d[i + 2] > 165) bone++;
      if (d[i] + d[i + 1] + d[i + 2] < 220) ink++;
    }
    return { bright: bright / n, bone: bone / n, ink: ink / n };
  }, buf.toString('base64'));
  if (lit.bright < 0.16) throw new Error(name + ' came out dark for a cliff in the sun (' + (lit.bright * 100).toFixed(1) + ' percent lit)');
  if (lit.bone < 0.07) throw new Error(name + ' has no skull in it (' + (lit.bone * 100).toFixed(2) + ' percent bone)');
  if (lit.ink < 0.02) throw new Error(name + ' has no outline in it (' + (lit.ink * 100).toFixed(2) + ' percent ink)');
  console.log('  ' + name + '  ' + (buf.length / 1024).toFixed(0) + ' KB   lit '
    + (lit.bright * 100).toFixed(0) + '%  bone ' + (lit.bone * 100).toFixed(1)
    + '%  ink ' + (lit.ink * 100).toFixed(1) + '%');
}
await browser.close();
console.log('icons done');
