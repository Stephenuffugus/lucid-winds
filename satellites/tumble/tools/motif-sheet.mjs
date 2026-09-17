// Contact sheet of every motif (engine/sockgen.js MOTIFS), in MOTIFS order, 8 to a row.
//   node tools/motif-sheet.mjs out.png              each shape drawn large on a plain tile (160 px)
//   node tools/motif-sheet.mjs out.png socks [seed]  a real painted tile per shape (Little Pictures family, 256 px)
//   node tools/motif-sheet.mjs out.png small         each shape at the size it paints on a sock (28 px on a 40 px tile)
import { writeFileSync } from 'fs';
import { encodePNG } from './png.mjs';
import { MOTIFS, motifSDF, decode, paint, mutate, seedFrom, TILE, FAMILIES } from '../engine/sockgen.js';
import { buildMask } from '../assets/geo/placeholder.js';
import { SILHOUETTES } from '../src/silhouettes.js';

const [out = 'dev/out/motifs.png', mode = 'large', seedText = 'tumble-motif-sheet'] = process.argv.slice(2);
const cols = 8, rows = Math.ceil(MOTIFS.length / cols);
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const smoothstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const mix = (c, to, k) => { for (let i = 0; i < 3; i++) c[i] += (to[i] - c[i]) * k; };
// the motif field bits for shape i: low nibble plus bit 7 (see MOTIFS in sockgen)
const motifBits = (i, density = 1) => (i & 15) | ((i >> 4) << 7) | (density << 5);

let img, W, H;
if (mode === 'socks') {
  const T = TILE;
  W = cols * T; H = rows * T;
  img = new Uint8Array(W * H * 4);
  const masks = SILHOUETTES.map((s) => buildMask(s));
  for (let i = 0; i < MOTIFS.length; i++) {
    let seed = seedFrom(seedText + '-' + i);
    seed = mutate(seed, 'patternFamily', FAMILIES.indexOf('motifScatter'));
    seed = mutate(seed, 'motif', motifBits(i, i & 3));
    seed = mutate(seed, 'silhouette', 1); // crew, so every tile has the same UV space
    const spec = decode(seed);
    const b = paint(spec, masks[spec.silhouette], { size: T });
    const tx = (i % cols) * T, ty = Math.floor(i / cols) * T;
    for (let y = 0; y < T; y++) img.set(b.subarray(y * T * 4, (y + 1) * T * 4), ((ty + y) * W + tx) * 4);
  }
} else {
  const T = mode === 'small' ? 40 : 160;
  const scale = mode === 'small' ? 14 : T * 0.36; // px per unit; a sock paints its motifs at about 14 px per unit on a 256 tile
  W = cols * T; H = rows * T;
  img = new Uint8Array(W * H * 4);
  const body = [232, 220, 200], fill = [196, 62, 74], edge = [58, 30, 40], grid = [120, 110, 100];
  const edgeW = 0.09 * (mode === 'small' ? 1 : 0.7); // units; paint() uses 0.09 cm
  for (let i = 0; i < cols * rows; i++) {
    const tx = (i % cols) * T, ty = Math.floor(i / cols) * T;
    const shape = MOTIFS[i];
    for (let py = 0; py < T; py++) for (let px = 0; px < T; px++) {
      const c = body.slice();
      if (shape) {
        const x = (px + 0.5 - T / 2) / scale, y = (py + 0.5 - T / 2) / scale;
        const d = motifSDF(shape, x, y) * scale, aa = 0.75;
        mix(c, edge, 1 - smoothstep(-aa, aa, d - edgeW * scale));
        mix(c, fill, 1 - smoothstep(-aa, aa, d));
      }
      if (px === 0 || py === 0) mix(c, grid, 1);
      const o = ((ty + py) * W + tx + px) * 4;
      img[o] = c[0]; img[o + 1] = c[1]; img[o + 2] = c[2]; img[o + 3] = 255;
    }
  }
}
writeFileSync(out, encodePNG(img, W, H));
console.log('wrote', out, W + 'x' + H, MOTIFS.join(' '));
