// Draws the app icons from the sock engine itself: node tools/make-icons.mjs
import { writeFileSync, mkdirSync } from 'fs';
import { encodePNG } from './png.mjs';
import { decode, paint, seedFrom } from '../engine/sockgen.js';
import { renderFlat } from '../engine/flat.js';
import { buildMask } from '../assets/geo/placeholder.js';
import { SILHOUETTES } from '../src/silhouettes.js';
mkdirSync(new URL('../icons/', import.meta.url), { recursive: true });
// a crew sock with bold stripes, a contrast heel and toe
let seed;
for (let i = 0; ; i++) { seed = seedFrom('icon-' + i); const s = decode(seed); if (s.family === 'stripe' && s.silhouette === 1 && s.heelToeContrast >= 2 && s.scheme === 1 && s.condition === 0) break; }
const spec = decode(seed);
const tile = paint(spec, buildMask(SILHOUETTES[1]), {});
// safe: the maskable icon (full bleed, the sock small inside a launcher's mask). bleed: Google Play's 512 store icon
// (full bleed, because Play rounds the corners itself, and the sock at the app icon's size)
function icon(size, safe, bleed = false) {
  const img = new Uint8ClampedArray(size * size * 4);
  const r = size * (safe ? 0 : 0.22);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const o = (y * size + x) * 4;
    const dx = Math.max(0, Math.abs(x - size / 2 + 0.5) - (size / 2 - r)), dy = Math.max(0, Math.abs(y - size / 2 + 0.5) - (size / 2 - r));
    const inside = safe || bleed || Math.hypot(dx, dy) <= r;
    const t = y / size;
    img[o] = 246 - t * 30; img[o + 1] = 232 - t * 34; img[o + 2] = 206 - t * 40; img[o + 3] = inside ? 255 : 0;
    // a soft warm glow behind the sock
    const g = Math.max(0, 1 - Math.hypot(x - size * 0.52, y - size * 0.5) / (size * 0.45));
    img[o] = Math.min(255, img[o] + g * 12); img[o + 1] = Math.min(255, img[o + 1] + g * 8);
  }
  const s = Math.round(size * (safe ? 0.62 : 0.78));
  const f = renderFlat(tile, 256, 1, { w: s, h: s, pad: 0.02 });
  const ox = Math.round((size - s) / 2), oy = Math.round((size - s) / 2);
  for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
    const si = (y * s + x) * 4;
    if (!f.rgba[si + 3]) continue;
    const di = ((oy + y) * size + ox + x) * 4;
    img[di] = f.rgba[si]; img[di + 1] = f.rgba[si + 1]; img[di + 2] = f.rgba[si + 2]; img[di + 3] = 255;
    // shadow
    const sh = ((oy + y + Math.round(size * 0.02)) * size + ox + x + Math.round(size * 0.015)) * 4;
    if (sh < img.length && img[sh + 3] && !(f.rgba[((y + Math.round(size * 0.02)) * s + x + Math.round(size * 0.015)) * 4 + 3])) { img[sh] *= 0.8; img[sh + 1] *= 0.8; img[sh + 2] *= 0.8; }
  }
  return img;
}
// node tools/make-icons.mjs --store: only the Play store icon, into store/tumble-play/ (the app's icons are untouched)
if (process.argv.includes('--store')) {
  writeFileSync(new URL('../../../store/tumble-play/play-icon-512.png', import.meta.url), encodePNG(icon(512, false, true), 512, 512));
  console.log('store icon written from seed', seed.slice(0, 12));
  process.exit(0);
}
for (const [name, size, safe] of [['icon-192.png', 192, false], ['icon-512.png', 512, false], ['icon-maskable-512.png', 512, true]]) {
  writeFileSync(new URL('../icons/' + name, import.meta.url), encodePNG(icon(size, safe), size, size));
}
console.log('icons written from seed', seed.slice(0, 12));
