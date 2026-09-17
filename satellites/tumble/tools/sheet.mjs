// Contact sheet of painted tiles: node tools/sheet.mjs out.png [mode] [seedPrefix] [count]
import { writeFileSync } from 'fs';
import { encodePNG } from './png.mjs';
import { decode, paint, seedFrom, TILE } from '../engine/sockgen.js';
import { buildMask } from '../assets/geo/placeholder.js';
import { SILHOUETTES } from '../src/silhouettes.js';
const [out = 'dev/out/sheet.png', mode = 'normal', prefix = 'tumble-atlas-', count = '64'] = process.argv.slice(2);
const masks = SILHOUETTES.map((s) => buildMask(s));
const n = +count, cols = 8, rows = Math.ceil(n / cols), T = TILE / 2;
const img = new Uint8Array(cols * T * rows * T * 4);
for (let i = 0; i < n; i++) {
  const spec = decode(prefix.length === 64 ? prefix : seedFrom(prefix + i));
  const b = paint(spec, masks[spec.silhouette], { mode, size: T });
  const tx = (i % cols) * T, ty = Math.floor(i / cols) * T;
  for (let y = 0; y < T; y++) img.set(b.subarray(y * T * 4, (y + 1) * T * 4), ((ty + y) * cols * T + tx) * 4);
}
writeFileSync(out, encodePNG(img, cols * T, rows * T));
console.log('wrote', out);
