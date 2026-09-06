#!/usr/bin/env node
/* Updraft's three PWA icons from one motif: a red diamond kite high on a blue
 * field with a cream and red ribbon tail and a thin line running off the
 * bottom left corner. Nothing that stops reading at 48 px.
 *
 *   node tools/icons.mjs
 *
 * Maskable law (bandits-box scar): Android crops a maskable icon to an
 * arbitrary shape and only the central 80 percent is guaranteed visible, so
 * that variant draws the mark smaller in a full bleed field; and a radius over
 * 50 in viewBox units collapses the tile to a circle whose corners go black on
 * iOS. Shape copied from satellites/fathom/tools/icons.mjs.
 */
import { createRequire } from 'node:module';
const puppeteer = createRequire(import.meta.url)('/workspaces/lucid-winds/node_modules/puppeteer');
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BG = '#8CC6F0', RED = '#E0503A', CREAM = '#FFF4E0', INK = '#20303a', GOLD = '#F2C46B';
const ART = `
  <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3F8FDB"/><stop offset="1" stop-color="${BG}"/></linearGradient></defs>
  <rect width="100" height="100" fill="url(#s)"/>
  <path d="M8 100 Q 30 78 56 46" fill="none" stroke="${CREAM}" stroke-width="1.6" opacity="0.9"/>
  <g transform="translate(58 34) rotate(18)">
    <path d="M0 -20 L14 0 L0 22 L-14 0 Z" fill="${RED}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M0 -20 L14 0 L0 0 Z" fill="${CREAM}" opacity="0.85"/>
    <path d="M0 -20 L0 22 M-14 0 L14 0" stroke="${INK}" stroke-width="1.6"/>
  </g>
  <path d="M66 56 q 6 8 -2 14 q -8 6 0 14 q 6 6 -2 12" fill="none" stroke="${RED}" stroke-width="4" stroke-linecap="round"/>
  <path d="M66 56 q 6 8 -2 14 q -8 6 0 14 q 6 6 -2 12" fill="none" stroke="${CREAM}" stroke-width="4" stroke-linecap="round" stroke-dasharray="7 7"/>
  <circle cx="64" cy="70" r="2.4" fill="${GOLD}"/><circle cx="64" cy="84" r="2.2" fill="${GOLD}"/>`;
function svg(scale, radius) {
  const off = (100 - 100 * scale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="${radius}" fill="${BG}"/><g transform="translate(${off} ${off}) scale(${scale})">${ART}</g></svg>`;
}
const jobs = [
  { file: 'icon-192.png', size: 192, scale: 1, radius: 22 },
  { file: 'icon-512.png', size: 512, scale: 1, radius: 22 },
  { file: 'icon-maskable-512.png', size: 512, scale: 0.8, radius: 0 }
];
const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
for (const job of jobs) {
  const page = await browser.newPage();
  await page.setViewport({ width: job.size, height: job.size, deviceScaleFactor: 1 });
  await page.setContent(`<body style="margin:0;background:${BG}"><div style="width:${job.size}px;height:${job.size}px">${svg(job.scale, job.radius)}</div></body>`, { waitUntil: 'load' });
  const buf = await page.screenshot({ type: 'png' });
  writeFileSync(join(ROOT, job.file), buf);
  await page.close();
  console.log('  ' + job.file + '  ' + (buf.length / 1024).toFixed(1) + 'KB');
}
await browser.close();
console.log('ICONS OK');
