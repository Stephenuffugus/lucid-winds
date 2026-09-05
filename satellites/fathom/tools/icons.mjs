#!/usr/bin/env node
/* Fathom's three PWA icons, rendered from one motif.
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
const BG = '#000000';
const CY = '#9FE8FF';
const WARM = '#FFC97A';
const LIT = '#CFF3FF';   // a wall the ring has already touched is BRIGHTER than
                         // the travelling edge itself, or the ring reads as a dial

/* The first pass drew a centred ring with four radial ticks and an amber dot in
   a dark halo. It read as a camera aperture with an EYE in the middle, which is
   the one idea this game does not have: the player is blind. This one puts the
   stone off centre, sends one ring out from it, and lights fragments of cave
   wall only where that ring has already reached them. Asymmetry is the whole
   point: a wave going out, not a dial. */
const ART = `
  <rect x="0" y="0" width="100" height="100" fill="${BG}"/>
  <g fill="none" stroke="${LIT}" stroke-linecap="round" stroke-linejoin="round" stroke-width="4.4">
    <path d="M57 28 L77 28 L77 46" opacity="0.95"/>
    <path d="M33 86 L66 86" opacity="0.82"/>
    <path d="M13 40 L13 62 L24 73" opacity="0.60"/>
    <path d="M84 60 L84 74" opacity="0.30" stroke-width="3.4"/>
    <path d="M26 18 L44 14" opacity="0.26" stroke-width="3.4"/>
  </g>
  <g fill="none" stroke="${CY}" stroke-linecap="round">
    <circle cx="45" cy="55" r="43" stroke-width="1" opacity="0.10"/>
    <circle cx="45" cy="55" r="31" stroke-width="1.4" opacity="0.72"
            stroke-dasharray="78 16 44 12" stroke-dashoffset="24"/>
  </g>
  <circle cx="45" cy="55" r="2.1" fill="${WARM}"/>`;

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
