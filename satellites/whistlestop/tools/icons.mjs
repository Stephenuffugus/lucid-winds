#!/usr/bin/env node
/* Whistlestop's three PWA icons, rendered from one motif.
 *
 *   node tools/icons.mjs
 *
 * The motif is the game in one picture: a chunky red wooden engine standing on
 * a piece of wooden track on the rug. No letter, no face, nothing that stops
 * reading at 48 px.
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
const RUG = '#C9A87C';
const INK = '#3A2B1B';
const RED = '#C1483B';
const WOOD = '#E3C08A';
const WOOD2 = '#B98D53';
const GOLD = '#D9A441';

function mark(scale) {
  /* the engine: a body, a boiler, a funnel, a cab window and two wheels, all in
     the same fat outline the game draws with */
  return `
  <g transform="translate(256,256) scale(${scale}) translate(-256,-256)">
    <!-- the track: the wooden bed, then the sleeper grooves ON it, then the two
         grooved rails the wheels actually stand in. The first draft drew the
         sleepers first and painted the bed over every one of them. -->
    <rect x="56" y="368" width="400" height="56" rx="10" fill="${WOOD}" stroke="${INK}" stroke-width="12"/>
    <g stroke="${WOOD2}" stroke-width="9" stroke-linecap="round" opacity=".85">
      ${[112, 176, 240, 304, 368, 420].map(x => `<path d="M${x} 378 L${x} 414"/>`).join('')}
    </g>
    <path d="M72 384 L440 384" stroke="${WOOD2}" stroke-width="11" stroke-linecap="round"/>
    <path d="M72 410 L440 410" stroke="${WOOD2}" stroke-width="11" stroke-linecap="round"/>

    <!-- the engine -->
    <rect x="118" y="200" width="132" height="148" rx="16" fill="${RED}" stroke="${INK}" stroke-width="14"/>
    <rect x="150" y="228" width="68" height="56" rx="10" fill="#F6EBD6" stroke="${INK}" stroke-width="12"/>
    <rect x="246" y="254" width="152" height="94" rx="22" fill="${RED}" stroke="${INK}" stroke-width="14"/>
    <circle cx="398" cy="301" r="30" fill="#A83A30" stroke="${INK}" stroke-width="13"/>
    <rect x="322" y="182" width="52" height="76" rx="10" fill="${INK}"/>
    <rect x="308" y="166" width="80" height="30" rx="12" fill="${INK}"/>
    <circle cx="176" cy="348" r="40" fill="${GOLD}" stroke="${INK}" stroke-width="14"/>
    <circle cx="322" cy="348" r="40" fill="${GOLD}" stroke="${INK}" stroke-width="14"/>
    <circle cx="176" cy="348" r="10" fill="${INK}"/>
    <circle cx="322" cy="348" r="10" fill="${INK}"/>

    <!-- one puff of steam, so the thing is going somewhere -->
    <circle cx="350" cy="122" r="31" fill="#F6EBD6" stroke="${INK}" stroke-width="11"/>
    <circle cx="410" cy="76" r="21" fill="#F6EBD6" stroke="${INK}" stroke-width="10"/>
  </g>`;
}
const svg = (rounded, scale) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" ${rounded ? 'rx="96"' : ''} fill="${RUG}"/>
  <g opacity=".30" stroke="#B9946A" stroke-width="5">
    ${Array.from({ length: 22 }, (_, i) => `<path d="M0 ${i * 24 + 8} L512 ${i * 24 + 8}"/>`).join('')}
  </g>
  <g opacity=".16" stroke="#8E6B44" stroke-width="4">
    ${Array.from({ length: 22 }, (_, i) => `<path d="M${i * 24 + 8} 0 L${i * 24 + 8} 512"/>`).join('')}
  </g>
  <radialGradient id="sun" cx="46%" cy="30%" r="78%">
    <stop offset="0" stop-color="#FFFFFF" stop-opacity=".42"/>
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
    let bright = 0, red = 0, ink = 0, n = 0;
    for (let i = 0; i < d.length; i += 4 * 13) {
      n++;
      if (d[i] + d[i + 1] + d[i + 2] > 300) bright++;
      if (d[i] > d[i + 1] + 45 && d[i] > 110) red++;
      if (d[i] + d[i + 1] + d[i + 2] < 220) ink++;
    }
    return { bright: bright / n, red: red / n, ink: ink / n };
  }, buf.toString('base64'));
  if (lit.bright < 0.4) throw new Error(name + ' came out dark for a sunlit rug (' + (lit.bright * 100).toFixed(1) + ' percent lit)');
  if (lit.red < 0.03) throw new Error(name + ' has no engine in it (' + (lit.red * 100).toFixed(2) + ' percent red)');
  if (lit.ink < 0.02) throw new Error(name + ' has no outline in it (' + (lit.ink * 100).toFixed(2) + ' percent ink)');
  console.log('  ' + name + '  ' + (buf.length / 1024).toFixed(0) + ' KB   lit '
    + (lit.bright * 100).toFixed(0) + '%  red ' + (lit.red * 100).toFixed(1)
    + '%  ink ' + (lit.ink * 100).toFixed(1) + '%');
}
await browser.close();
console.log('icons done');
