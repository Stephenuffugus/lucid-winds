#!/usr/bin/env node
/* Gerplunk's three PWA icons, rendered from one motif.
 *
 *   node tools/icons.mjs
 *
 * The motif is the game in one picture: a dusk sky over dark water, a stone
 * mid skip, and the three rings it has already left behind, each one further
 * back and larger. No letter, nothing that stops reading at 48 px.
 *
 * Maskable note, learned on bandits-box and carried in every fleet icon script
 * since: Android crops a maskable icon to an arbitrary shape and only the
 * central 80 percent is guaranteed visible, so that variant draws the same mark
 * smaller inside a full bleed field. And the radius is in viewBox units, so
 * anything over 50 collapses the tile to a circle whose transparent corners
 * composite to BLACK on an iOS home screen.
 *
 * Shape copied from satellites/fathom/tools/icons.mjs.
 */
import { createRequire } from 'node:module';
const puppeteer = createRequire(import.meta.url)('/workspaces/lucid-winds/node_modules/puppeteer');
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BG = '#1B1A24';
const CREAM = '#F2E8D5';
const GOLD = '#E8B36A';

const ART = `
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1B1A2C"/><stop offset="0.55" stop-color="#8E4A3C"/>
      <stop offset="1" stop-color="#E9B36A"/>
    </linearGradient>
    <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#6B5560"/><stop offset="0.4" stop-color="#2E3646"/>
      <stop offset="1" stop-color="#1D2331"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="100" height="42" fill="url(#sky)"/>
  <circle cx="62" cy="40" r="6" fill="#FFE9B8"/>
  <path d="M0 43 L8 38 L14 41 L20 35 L27 39 L33 33 L40 38 L47 36 L55 41 L62 37 L70 40 L78 34 L86 39 L94 36 L100 41 L100 46 L0 46 Z" fill="#141618"/>
  <rect x="0" y="45" width="100" height="55" fill="url(#water)"/>
  <g fill="none" stroke="${CREAM}" stroke-linecap="round">
    <ellipse cx="50" cy="55" rx="7" ry="2.2" stroke-width="1.2" opacity="0.5"/>
    <ellipse cx="50" cy="66" rx="14" ry="4.4" stroke-width="1.6" opacity="0.7"/>
    <ellipse cx="50" cy="83" rx="26" ry="8" stroke-width="2.2" opacity="0.9"/>
  </g>
  <g fill="${GOLD}" opacity="0.55">
    <rect x="58" y="49" width="10" height="1.2"/><rect x="61" y="52" width="8" height="1.2"/>
    <rect x="72" y="58" width="12" height="1.5"/><rect x="66" y="64" width="9" height="1.5"/>
    <rect x="78" y="72" width="14" height="2"/><rect x="12" y="60" width="9" height="1.5"/>
    <rect x="20" y="70" width="12" height="2"/><rect x="6" y="80" width="14" height="2"/>
  </g>
  <ellipse cx="50" cy="50" rx="5.5" ry="3" fill="#2A2724" transform="rotate(-14 50 50)"/>
  <ellipse cx="48.4" cy="49" rx="1.5" ry="0.9" fill="#FFE1AA"/>`;

function svg(scale, radius) {
  const off = (100 - 100 * scale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" rx="${radius}" fill="${BG}"/>
    <clipPath id="c"><rect width="100" height="100" rx="${radius}"/></clipPath>
    <g clip-path="url(#c)"><g transform="translate(${off} ${off}) scale(${scale})">${ART}</g></g>
  </svg>`;
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
