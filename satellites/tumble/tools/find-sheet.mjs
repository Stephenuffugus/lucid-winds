// Renders every pocket find in data/finds.json at 96 and 48 px on one sheet, with its name, so a person
// LOOKS at the recipes before they ship (DESIGN-T2 2.1).  node tools/find-sheet.mjs [out.png] [set] [mode]
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { encodePNG } from './png.mjs';
import { paintFind } from '../engine/sockgen.js';

const [out = 'dev/out/finds.png', only = '', mode = 'normal'] = process.argv.slice(2);
const data = JSON.parse(readFileSync(new URL('../data/finds.json', import.meta.url)));
const items = data.items.filter((f) => !only || f.set === only);
const BIG = 96, SMALL = 48, cell = 150, cols = 6;
const rows = Math.ceil(items.length / cols);
const W = cols * cell, H = rows * cell;
const img = new Uint8Array(W * H * 4);
for (let i = 0; i < img.length; i += 4) { img[i] = 46; img[i + 1] = 42; img[i + 2] = 38; img[i + 3] = 255; }

// a tile, composited over the sheet by its own alpha (a find's tile is a disc, not a square)
const blit = (rgba, size, ox, oy) => {
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const s = (y * size + x) * 4, a = rgba[s + 3] / 255;
    if (!a) continue;
    const d = ((oy + y) * W + ox + x) * 4;
    for (let k = 0; k < 3; k++) img[d + k] = img[d + k] * (1 - a) + rgba[s + k] * a;
  }
};
// five by seven stroke digits and letters are overkill here: the name goes to stdout, in sheet order
items.forEach((f, i) => {
  const ox = (i % cols) * cell, oy = Math.floor(i / cols) * cell;
  blit(paintFind(f.recipe, { size: BIG, mode }), BIG, ox + 10, oy + 10);
  blit(paintFind(f.recipe, { size: SMALL, mode }), SMALL, ox + cell - SMALL - 8, oy + cell - SMALL - 8);
});
mkdirSync(new URL('../dev/out/', import.meta.url), { recursive: true });
writeFileSync(out, encodePNG(img, W, H));
console.log('wrote', out, items.length, 'finds,', cols, 'across');
items.forEach((f, i) => console.log(` ${String(i).padStart(2)} r${Math.floor(i / cols)}c${i % cols}  ${f.name}  [${f.rarity}, ${f.set}]`));
