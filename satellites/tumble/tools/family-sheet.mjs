// DESIGN-T2 5.2: the six new pattern families, LOOKED AT before a single seed is minted with them. One row per family
// (stripes first, for scale), eight palettes across the schemes and the hue wheel, each as a held flat sock and, under
// it, its 64 px tile as a heap shows it. Rhythm varies along the row so every period is seen.
//   node tools/family-sheet.mjs <out.png> [mode]     (mode: normal, deutan, protan, tritan)
import { writeFileSync } from 'fs';
import { encodePNG } from './png.mjs';
import { decode, paint, seedFrom, TILE, NEW_FAMILIES, GEN_FAMILIES } from '../engine/sockgen.js';
import { renderFlat } from '../engine/flat.js';
import { buildMask } from '../assets/geo/placeholder.js';
import { SILHOUETTES } from '../src/silhouettes.js';

const [out = 'dev/out/families.png', mode = 'normal'] = process.argv.slice(2);
const masks = SILHOUETTES.map((s) => buildMask(s));
const ROWS = ['stripe', ...NEW_FAMILIES];
const PALETTES = [0 * 64 + 4, 0 * 64 + 40, 1 * 64 + 12, 1 * 64 + 52, 2 * 64 + 20, 2 * 64 + 60, 3 * 64 + 30, 3 * 64 + 8];
const cellW = 150, cellH = 230, W = cellW * PALETTES.length, H = cellH * ROWS.length;
const img = new Uint8Array(W * H * 4);
for (let i = 0; i < img.length; i += 4) { img[i] = 58; img[i + 1] = 48; img[i + 2] = 42; img[i + 3] = 255; }
const blit = (bytes, w, h, ox, oy, alphaKey = true) => {
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const s = (y * w + x) * 4;
    if (alphaKey && !bytes[s + 3]) continue;
    const d = ((oy + y) * W + ox + x) * 4;
    img[d] = bytes[s]; img[d + 1] = bytes[s + 1]; img[d + 2] = bytes[s + 2];
  }
};
ROWS.forEach((fam, r) => {
  PALETTES.forEach((pal, c) => {
    // a plain version 2 seed, then the fields set: this family, this palette, a rhythm that walks the periods
    const spec = decode(seedFrom(`family-sheet|${fam}|${c}`) + '~g.2');
    spec.patternFamily = GEN_FAMILIES[2].indexOf(fam);
    spec.family = fam;
    spec.palette = pal; spec.hue = pal & 63; spec.scheme = pal >> 6;
    spec.stripeRhythm = (c & 3) | ((c >> 2) << 2) | (c % 3 === 0 ? 32 : 0);
    spec.silhouette = c % 2 ? 2 : 1;
    spec.condition = 0; spec.size = 0;
    const tile = paint(spec, masks[spec.silhouette], { mode });
    const flat = renderFlat(tile, TILE, spec.silhouette, { size: 140 });
    blit(flat.rgba, flat.w, flat.h, c * cellW + 5, r * cellH + 4);
    const small = paint(spec, masks[spec.silhouette], { mode, size: 64 });
    blit(small, 64, 64, c * cellW + 43, r * cellH + 160, false);
  });
});
writeFileSync(out, encodePNG(img, W, H));
console.log('wrote', out, 'rows:', ROWS.join(', '));
