// Renders every hero sock in data/hero-socks.json as a flat held sock with its name, so a
// person (or an agent) can LOOK at the recipes. node tools/hero-sheet.mjs [out.png] [pack] [mode]
import { readFileSync, writeFileSync } from 'fs';
import { encodePNG } from './png.mjs';
import { decode, paint, TILE } from '../engine/sockgen.js';
import { renderFlat } from '../engine/flat.js';
import { buildMask } from '../assets/geo/placeholder.js';
import { SILHOUETTES } from '../src/silhouettes.js';
// the source can be data/hero-socks.json or one pack file under data/heroes/
const [out = 'dev/out/heroes.png', pack = '', mode = 'normal', src = 'data/hero-socks.json'] = process.argv.slice(2);
const data = JSON.parse(readFileSync(new URL('../' + src, import.meta.url)));
const heroes = data.heroes.filter((h) => !pack || h.pack === pack);
const masks = SILHOUETTES.map((s) => buildMask(s));
const silId = (k) => Math.max(0, SILHOUETTES.findIndex((s) => s.key === k));
const cell = 200, cols = 5, rows = Math.ceil(heroes.length / cols);
const img = new Uint8Array(cols * cell * rows * cell * 4).fill(0);
for (let i = 0; i < img.length; i += 4) { img[i] = 58; img[i + 1] = 48; img[i + 2] = 42; img[i + 3] = 255; }
heroes.forEach((h, i) => {
  const sid = silId(h.silhouette);
  const spec = decode('hero:' + h.id);
  spec.silhouette = sid;
  const tile = paint(spec, masks[sid], { recipe: h.recipe, mode });
  const flat = renderFlat(tile, TILE, sid, { size: cell - 10 });
  const ox = (i % cols) * cell + 5, oy = Math.floor(i / cols) * cell + 5;
  for (let y = 0; y < flat.h; y++) for (let x = 0; x < flat.w; x++) {
    const s = (y * flat.w + x) * 4;
    if (!flat.rgba[s + 3]) continue;
    const d = ((oy + y) * cols * cell + ox + x) * 4;
    img[d] = flat.rgba[s]; img[d + 1] = flat.rgba[s + 1]; img[d + 2] = flat.rgba[s + 2];
  }
  // a small strip of the raw tile along the bottom so the pattern is visible flat too
  const T = 64;
  const small = paint(spec, masks[sid], { recipe: h.recipe, mode, size: T });
  for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
    const s = (y * T + x) * 4, d = ((oy + cell - T - 8 + y) * cols * cell + ox + cell - T - 12 + x) * 4;
    img[d] = small[s]; img[d + 1] = small[s + 1]; img[d + 2] = small[s + 2];
  }
});
writeFileSync(out, encodePNG(img, cols * cell, rows * cell));
console.log('wrote', out, heroes.length, 'heroes (order:', heroes.map((h) => h.name).join(', ') + ')');
