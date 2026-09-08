#!/usr/bin/env node
/* Marrowdeep's three PWA icons, rendered from one motif.
 *
 *   node tools/icons.mjs
 *
 * The motif is the game in one picture, and it is the game's own title mark:
 * the eight sided die seen from above, bone line on ink, with a single marrow
 * red dot at its centre. It is `#titleMark` in index.html, redrawn here at icon
 * weight. No letter, no face, no creature, nothing that stops reading at 48 px.
 *
 * Why the same mark twice instead of a second idea: the tile on the home screen
 * and the first thing on the title screen are the same object, so tapping the
 * one lands on the other. Every difference between them is forced by size. The
 * title mark is 132 px tall and can carry a 2.4 unit stroke and spokes at 28
 * percent opacity; a 48 px tile cannot, so the strokes here are roughly double,
 * the four faces are filled rather than left open, and the pip is larger.
 *
 * Two things were drawn, looked at and thrown away, which is cheaper to read
 * here than to rediscover:
 *   1. Open outline, no fills. It read as a bezel, not a solid, and the wedges
 *      between the spokes were the same black as the ground, so the mark had no
 *      body at all.
 *   2. Spokes stopping short of the centre in a clean ring around the pip. Eight
 *      lines POINTING AT a red disc is a rifle scope; every viewer reads a
 *      reticle before they read a die. Running them under the pip instead turns
 *      the same lines into the apex where four faces meet, and the pip covers
 *      the knot, so nothing is muddy at tile size.
 *
 * Maskable note, learned on bandits box and carried in every fleet icon script
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
const INK = '#0c0a10';     /* the ground, the same --ink the page paints */
const BONE = '#e6dcc6';    /* every line of the die */
const MARROW = '#c04a44';  /* the one dot, and the only colour in the mark */

/* Four tones of the same ink, one per upper face, lit from the top left. The
   first render had no fills at all and the result read as a crosshair inside a
   bezel: eight identical spokes leaving a red disc is the universal reticle,
   and an unfilled diamond is a frame rather than an object. These four give the
   die a body and a light direction, which is what separates a solid seen from
   above from a flat wheel. They stay inside the ink family, so at 48 px, where
   the difference between them is a pixel or two of value, the mark degrades to
   a filled diamond and not to something else. */
const FACE = ['#272231', '#1d1926', '#15121c', '#100d15'];  /* UL, UR, LL, LR */

/* The geometry, in the 100 unit viewBox the tile uses. The title mark is drawn
   in a 120 box, so every number here is that one times 100/120 and then pulled
   in a little: a d8 whose points touched y=10 and y=90 sat too close to the
   rounded corner arc to read as a solid silhouette at 48 px.

   The eight spokes are what says EIGHT SIDED, and they are not one family. The
   four that run to the corners are the real edges where the upper faces of an
   octahedron meet, so they carry full bone weight; the four that run to the
   middles of the edges are the title mark's stylised facet lines, drawn thinner
   and dimmer so the set of eight reads as facets and not as a reticle. All of
   them run all the way to the centre and the pip is drawn last, on top: see the
   header for why the ring of clearance around the pip was thrown away. GAP is
   kept as a named zero so that decision is visible instead of implied. */
const C = 50;              /* centre */
const A = 38;              /* half width of the diamond, point to centre */
const M = A / 2;           /* the edge midpoints sit at half the extent */
const GAP = 0;             /* the spokes meet at the apex, under the pip */
const G = GAP / Math.SQRT2;

function line(x1, y1, x2, y2) {
  return '<path d="M' + x1.toFixed(2) + ' ' + y1.toFixed(2) +
         ' L' + x2.toFixed(2) + ' ' + y2.toFixed(2) + '"/>';
}
/* the edges of the four upper faces */
const edges = [
  line(C, C - GAP, C, C - A), line(C + GAP, C, C + A, C),
  line(C, C + GAP, C, C + A), line(C - GAP, C, C - A, C)
].join('\n    ');
/* the facet lines that halve each of those faces */
const facets = [
  line(C + G, C - G, C + M, C - M), line(C + G, C + G, C + M, C + M),
  line(C - G, C + G, C - M, C + M), line(C - G, C - G, C - M, C - M)
].join('\n    ');
/* the four faces themselves, each a triangle from the centre out to one edge */
const faces = [
  [[C - A, C], [C, C - A]], [[C, C - A], [C + A, C]],
  [[C - A, C], [C, C + A]], [[C, C + A], [C + A, C]]
].map(function (f, i) {
  return '<path d="M' + C + ' ' + C + ' L' + f[0][0] + ' ' + f[0][1] +
         ' L' + f[1][0] + ' ' + f[1][1] + ' Z" fill="' + FACE[i] + '"/>';
}).join('\n  ');

const ART = `
  <rect x="0" y="0" width="100" height="100" fill="${INK}"/>
  ${faces}
  <g fill="none" stroke="${BONE}" stroke-linecap="round">
    <g stroke-width="2.0" opacity="0.42">
    ${facets}
    </g>
    <g stroke-width="3.0" opacity="0.86">
    ${edges}
    </g>
  </g>
  <path d="M${C} ${C - A} L${C + A} ${C} L${C} ${C + A} L${C - A} ${C} Z"
        fill="none" stroke="${BONE}" stroke-width="5.4" stroke-linejoin="round"/>
  <circle cx="${C}" cy="${C}" r="8" fill="${MARROW}"/>`;

function svg(scale, radius) {
  const off = (100 - 100 * scale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" rx="${radius}" fill="${INK}"/>
    <g transform="translate(${off} ${off}) scale(${scale})">${ART}</g>
  </svg>`;
}

const jobs = [
  { file: 'icon-192.png', size: 192, scale: 0.94, radius: 22 },
  { file: 'icon-512.png', size: 512, scale: 0.94, radius: 22 },
  /* 0.88 puts the diamond's four points at 33.4 of the 100 unit box from the
     centre and the outside of the frame's stroke at 35.8, inside the 40 that
     the central 80 percent guarantees. The points aim at the middles of the
     tile's edges, which is the direction a circle crop and a squircle crop both
     take the least of, so this is the safe axis to spend on. It was 0.82 for one
     render and the mark looked like a speck marooned in a black field next to
     every other app on the row. */
  { file: 'icon-maskable-512.png', size: 512, scale: 0.88, radius: 0 }
];

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
for (const job of jobs) {
  const page = await browser.newPage();
  await page.setViewport({ width: job.size, height: job.size, deviceScaleFactor: 1 });
  await page.setContent(
    `<body style="margin:0;background:${INK}"><div style="width:${job.size}px;height:${job.size}px">${svg(job.scale, job.radius)}</div></body>`,
    { waitUntil: 'load' });
  const buf = await page.screenshot({ type: 'png', omitBackground: false });
  writeFileSync(join(ROOT, job.file), buf);
  await page.close();
  console.log('  ' + job.file + '  ' + (buf.length / 1024).toFixed(1) + 'KB');
}
await browser.close();
console.log('ICONS OK');
