#!/usr/bin/env node
/* Asterism's three PWA icons, rendered from one motif.
 *
 *   node tools/icons.mjs
 *
 * The motif is the game in one picture: a stone already under the water and one
 * cyan ring going out from where it went in. No creature, no letter, nothing
 * that stops reading at 48 px.
 *
 * Maskable note, learned on bandits-box and carried in every fleet icon script
 * since: Android crops a maskable icon to an arbitrary shape and only the
 * central 80 percent is guaranteed visible, so that variant draws the same mark
 * smaller inside a full bleed field. And the radius is in viewBox units, so
 * anything over 50 collapses the tile to a circle whose transparent corners
 * composite to BLACK on an iOS home screen.
 */
import { createRequire } from 'node:module';
const puppeteer = createRequire(import.meta.url)('/workspaces/lucid-winds/node_modules/puppeteer');
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BG = '#070A1A';
const GOLD = '#E8C97A';
const STAR = '#FFF6DC';
const DIM = '#3A4468';

/* The motif is the verb: a few stars joined by a gold line, with the rest of
   the sky faint behind them. No telescope, no swirl, no zodiac glyph. It has to
   read at 48 px, so it is FOUR stars and three lines and nothing else. */
/* The first pass drew a near perfect square on its corner. It read as a diamond
   road sign, not as a shape somebody joined by hand, and all four stars were the
   same size, which throws away the other half of the idea: the sky has bright
   ones and faint ones and that is what you draw between. */
const ART = `
  <rect x="0" y="0" width="100" height="100" fill="${BG}"/>
  <g fill="${DIM}">
    <circle cx="13" cy="19" r="1.8"/><circle cx="88" cy="26" r="1.1"/>
    <circle cx="21" cy="86" r="1.4"/><circle cx="76" cy="90" r="2.0"/>
    <circle cx="55" cy="9" r="1.0"/><circle cx="9" cy="52" r="1.5"/>
    <circle cx="93" cy="62" r="1.2"/><circle cx="37" cy="41" r="0.9"/>
    <circle cx="69" cy="16" r="1.6"/><circle cx="28" cy="30" r="0.9"/>
    <circle cx="83" cy="46" r="0.9"/><circle cx="45" cy="93" r="1.2"/>
  </g>
  <g stroke="${GOLD}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.95">
    <path d="M22 61 L44 26 L77 39 L61 82 Z"/>
  </g>
  <g fill="${STAR}">
    <circle cx="44" cy="26" r="6.2"/>
    <circle cx="77" cy="39" r="3.1"/>
    <circle cx="61" cy="82" r="4.4"/>
    <circle cx="22" cy="61" r="2.4"/>
  </g>
  <g stroke="${STAR}" stroke-width="1.7" stroke-linecap="round" opacity="0.72">
    <path d="M44 15 L44 37 M33 26 L55 26"/>
  </g>`;

function svg(scale, radius) {
  const off = (100 - 100 * scale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" rx="${radius}" fill="${BG}"/>
    <g transform="translate(${off} ${off}) scale(${scale})">${ART}</g>
  </svg>`;
}

const jobs = [
  { file: 'icon-192.png', size: 192, scale: 0.94, radius: 22 },
  { file: 'icon-512.png', size: 512, scale: 0.94, radius: 22 },
  { file: 'icon-maskable-512.png', size: 512, scale: 0.78, radius: 0 }
];

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
for (const job of jobs) {
  const page = await browser.newPage();
  await page.setViewport({ width: job.size, height: job.size, deviceScaleFactor: 1 });
  await page.setContent(
    `<body style="margin:0;background:${BG}"><div style="width:${job.size}px;height:${job.size}px">${svg(job.scale, job.radius)}</div></body>`,
    { waitUntil: 'load' });
  const buf = await page.screenshot({ type: 'png', omitBackground: false });
  writeFileSync(join(ROOT, job.file), buf);
  await page.close();
  console.log('  ' + job.file + '  ' + (buf.length / 1024).toFixed(1) + 'KB');
}
await browser.close();
console.log('ICONS OK');
