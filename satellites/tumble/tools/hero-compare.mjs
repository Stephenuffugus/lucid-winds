// DESIGN-T2 4.1: "every new sock at 96, 64 and heap size beside its nearest colour procedural sock". A hero that
// averages to the same colour as an ordinary sock is a trap in a matching game, and only a picture shows whether
// the emblem is enough to tell them apart at the size a sock really is on the table.
// Each row: the hero at 150, 64 and 32 px, then the procedural sock whose average colour is nearest (out of 1,500
// seeds) at 150 and 32 px. The console lists the rows in order with the colour distance.
//   node tools/hero-compare.mjs <out.png> <pack>
import { writeFileSync } from 'fs';
import { readFileSync } from 'fs';
import { encodePNG } from './png.mjs';
import { decode, paint, seedFrom, TILE } from '../engine/sockgen.js';
import { renderFlat } from '../engine/flat.js';
import { deltaE } from '../engine/color.js';
import { buildMask } from '../assets/geo/placeholder.js';
import { SILHOUETTES } from '../src/silhouettes.js';

const [out = 'dev/out/hero-compare.png', pack = ''] = process.argv.slice(2);
const cat = JSON.parse(readFileSync(new URL('../data/hero-socks.json', import.meta.url)));
const heroes = cat.heroes.filter((h) => !pack || h.pack === pack);
const masks = SILHOUETTES.map((s) => buildMask(s));
const SILS = SILHOUETTES.map((s) => s.key);

// the average colour of a sock's painted tile, inside its mask
const mean = (bytes) => { let r = 0, g = 0, b = 0, n = 0; for (let i = 0; i < bytes.length; i += 4) { if (!bytes[i + 3]) continue; r += bytes[i]; g += bytes[i + 1]; b += bytes[i + 2]; n++; } return [r / n, g / n, b / n]; };
const procs = [];
for (let i = 0; i < 1500; i++) {
  const seed = seedFrom('tumble-golden-' + i);
  const spec = decode(seed);
  procs.push({ seed, spec, avg: mean(paint(spec, masks[spec.silhouette], { size: 24 })) });
}

const W = 150 + 70 + 40 + 20 + 150 + 40 + 40, RH = 160;
const img = new Uint8Array(W * RH * heroes.length * 4);
for (let i = 0; i < img.length; i += 4) { img[i] = 58; img[i + 1] = 48; img[i + 2] = 42; img[i + 3] = 255; }
const blit = (flat, ox, oy) => {
  for (let y = 0; y < flat.h; y++) for (let x = 0; x < flat.w; x++) {
    const s = (y * flat.w + x) * 4;
    if (!flat.rgba[s + 3]) continue;
    const d = ((oy + y) * W + ox + x) * 4;
    if (ox + x >= W || oy + y >= RH * heroes.length) continue;
    img[d] = flat.rgba[s]; img[d + 1] = flat.rgba[s + 1]; img[d + 2] = flat.rgba[s + 2];
  }
};
heroes.forEach((h, row) => {
  const sid = SILS.indexOf(h.silhouette);
  const spec = decode('hero:' + h.id);
  spec.silhouette = sid;
  const tile = paint(spec, masks[sid], { recipe: h.recipe });
  const avg = mean(paint(spec, masks[sid], { recipe: h.recipe, size: 24 }));
  let best = null;
  for (const p of procs) { const d = deltaE(avg, p.avg); if (!best || d < best.d) best = { ...p, d }; }
  const oy = row * RH + 5;
  blit(renderFlat(tile, TILE, sid, { size: 150 }), 5, oy);
  blit(renderFlat(tile, TILE, sid, { size: 64 }), 165, oy + 40);
  blit(renderFlat(tile, TILE, sid, { size: 32 }), 235, oy + 56);
  const ptile = paint(best.spec, masks[best.spec.silhouette], {});
  blit(renderFlat(ptile, TILE, best.spec.silhouette, { size: 150 }), 290, oy);
  blit(renderFlat(ptile, TILE, best.spec.silhouette, { size: 32 }), 450, oy + 56);
  console.log(`${String(row + 1).padStart(2)} ${h.name}: nearest ordinary sock by colour is dE ${best.d.toFixed(1)} (${SILS[best.spec.silhouette]})`);
});
writeFileSync(out, encodePNG(img, W, RH * heroes.length));
console.log('wrote', out);
