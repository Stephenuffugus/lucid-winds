#!/usr/bin/env node
/* Swell's three PWA icons, rendered from one motif.
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
const BG = '#08070C';
const AMB = '#E8B36A';
const ICE = '#A8D8F0';
const DIM = '#3A3348';

/* The motif is the gesture: one finger and a swell rising out of it. Bands of
   light climbing from a point, warm at the bottom and cool at the top, the way
   the orchestra stacks. No instrument, no note, no waveform. */
const ART = `
  <rect x="0" y="0" width="100" height="100" fill="${BG}"/>
  <g fill="none" stroke-linecap="round">
    <path d="M22 84 Q26 46 34 24" stroke="${AMB}" stroke-width="3.2" opacity="0.35"/>
    <path d="M34 88 Q38 40 46 14" stroke="${AMB}" stroke-width="4.2" opacity="0.62"/>
    <path d="M50 90 Q52 34 56 8"  stroke="${AMB}" stroke-width="5.0" opacity="0.95"/>
    <path d="M66 88 Q66 40 62 14" stroke="${ICE}" stroke-width="4.2" opacity="0.66"/>
    <path d="M78 84 Q76 46 70 24" stroke="${ICE}" stroke-width="3.2" opacity="0.38"/>
  </g>
  <circle cx="50" cy="90" r="9" fill="${AMB}" opacity="0.16"/>
  <circle cx="50" cy="90" r="4.6" fill="${AMB}"/>
  <g fill="${DIM}">
    <circle cx="12" cy="20" r="1.4"/><circle cx="88" cy="28" r="1.2"/>
    <circle cx="16" cy="62" r="1.0"/><circle cx="90" cy="58" r="1.3"/>
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
