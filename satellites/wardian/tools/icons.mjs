#!/usr/bin/env node
/* Wardian's three PWA icons, rendered from one motif.
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
const BG = '#17120E';
const GLASS = '#243026';
const BRASS = '#C9A24B';
const LEAF = '#7BB264';

function frond(cx, cy, ang, len) {
  /* a frond is a spine with leaflets down both sides. Four curves with a blob
     on the end read as lollipops at 48 px, which is what the first cut did. */
  let d = '', pins = '';
  const steps = 7;
  for (let i = 1; i <= steps; i++) {
    const u = i / steps;
    const a = ang + u * 0.34;
    const px = cx + Math.cos(a) * len * u;
    const py = cy + Math.sin(a) * len * u;
    if (i === 1) d += `M${cx.toFixed(1)} ${cy.toFixed(1)} `;
    d += `L${px.toFixed(1)} ${py.toFixed(1)} `;
    const ll = len * 0.30 * Math.sin(Math.PI * Math.pow(u, 0.6));
    for (const side of [-1, 1]) {
      const la = a + side * 1.0;
      pins += `<ellipse cx="${(px + Math.cos(la) * ll * 0.5).toFixed(1)}" cy="${(py + Math.sin(la) * ll * 0.5).toFixed(1)}" `
        + `rx="${(ll * 0.62).toFixed(1)}" ry="${(ll * 0.34).toFixed(1)}" `
        + `transform="rotate(${(la * 57.3).toFixed(0)} ${(px + Math.cos(la) * ll * 0.5).toFixed(1)} ${(py + Math.sin(la) * ll * 0.5).toFixed(1)})"/>`;
    }
  }
  return { spine: d, pins };
}
function mark(scale) {
  const s = scale;
  const fronds = [[-2.46, 108], [-0.68, 102], [-2.02, 126], [-1.12, 122], [-1.57, 136]]
    .map(([a, l]) => frond(256, 384, a, l));
  return `
  <g transform="translate(256,262) scale(${s}) translate(-256,-262)">
    <rect x="122" y="122" width="268" height="292" rx="36" fill="${GLASS}"/>
    <path d="M148 146 L212 146 L212 316 Z" fill="#FFFFFF" fill-opacity=".08"/>
    <ellipse cx="256" cy="392" rx="128" ry="34" fill="#4A3626"/>
    <ellipse cx="256" cy="386" rx="128" ry="26" fill="#5C452F"/>
    <g stroke="${LEAF}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" fill="none">
      ${fronds.map(f => `<path d="${f.spine}"/>`).join('')}
    </g>
    <g fill="${LEAF}" fill-opacity=".92">
      ${fronds.map(f => f.pins).join('')}
    </g>
    <g fill="#5E8B4F">
      <ellipse cx="190" cy="378" rx="34" ry="11"/>
      <ellipse cx="322" cy="380" rx="28" ry="10"/>
    </g>
    <rect x="122" y="122" width="268" height="292" rx="36" fill="none"
          stroke="${BRASS}" stroke-opacity=".62" stroke-width="10"/>
    <rect x="108" y="100" width="296" height="38" rx="17" fill="${BRASS}" fill-opacity=".9"/>
    <rect x="108" y="100" width="296" height="16" rx="8" fill="#E4C57C" fill-opacity=".55"/>
  </g>`;
}
const svg = (rounded, scale) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" ${rounded ? 'rx="96"' : ''} fill="${BG}"/>
  <radialGradient id="w" cx="34%" cy="22%" r="72%">
    <stop offset="0" stop-color="#FFE7B4" stop-opacity=".16"/>
    <stop offset="1" stop-color="#FFE7B4" stop-opacity="0"/>
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
    let bright = 0, green = 0, n = 0;
    for (let i = 0; i < d.length; i += 4 * 13) {
      n++;
      if (d[i] + d[i + 1] + d[i + 2] > 150) bright++;
      if (d[i + 1] > d[i] + 10 && d[i + 1] > 60) green++;
    }
    return { bright: bright / n, green: green / n };
  }, buf.toString('base64'));
  if (lit.bright < 0.04) throw new Error(name + ' came out nearly black (' + (lit.bright * 100).toFixed(1) + ' percent lit)');
  if (lit.green < 0.01) throw new Error(name + ' has no plant in it (' + (lit.green * 100).toFixed(2) + ' percent green)');
  console.log('  ' + name + '  ' + (buf.length / 1024).toFixed(0) + ' KB   lit '
    + (lit.bright * 100).toFixed(0) + '%  green ' + (lit.green * 100).toFixed(1) + '%');
}
await browser.close();
console.log('icons done');
