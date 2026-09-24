// THE HERO PASS and PAINTED HERO ART (24 Sep 2026). Stephen: the seed socks "kind of look like s*** ... I want to make sure
// they look good." The painter now draws hero emblems no smaller than HERO.minEmblem, with ink no thinner than HERO.minInk,
// an outline of its own shade on a fill too close to the body, and the yarn's heather through the paint; and a painted
// decal (assets/heroes/<id>.png) can be laid over the emblem (engine decalOver). Hero recipes only: no pinned seed moves
// (tests/golden-seeds.test.mjs holds the procedural seeds).
import { readFileSync } from 'fs';
import { suite } from './lib.mjs';
import { decode, paint, decalOver, silhouetteDims, HERO, TILE } from '../engine/sockgen.js';

const { ok, done } = suite('heroart');
const read = (f) => JSON.parse(readFileSync(new URL('../data/heroes/' + f, import.meta.url), 'utf8'));
const plant = read('plant-parents.json').heroes;
const lum = (b, o) => 0.299 * b[o] + 0.587 * b[o + 1] + 0.114 * b[o + 2];
const silOf = (h) => { const sp = decode('hero:' + h.id); return sp; };

// the emblem window of a hero at a face: the pixels the painter can touch there
function emblemWindow(h, size) {
  const em = h.recipe.layers.find((l) => l.type === 'emblem');
  const sp = silOf(h), dims = silhouetteDims(sp.silhouette);
  const fu = em.at && em.once ? em.at[0] : 0.25, cv = em.at ? em.at[1] : 0.45;
  const s = Math.max(em.size || 4, HERO.minEmblem) / 2;
  const w = s * 1.6 / dims.circ * size, hh = s * 1.6 / dims.len * size;
  return { x0: Math.round(fu * size - w), x1: Math.round(fu * size + w), y0: Math.round(cv * size - hh), y1: Math.round(cv * size + hh), em, dims, sp };
}

// 1. the pass holds: every plant hero's emblem window carries ink darker than the body, and enough of it to read at 70 px
{
  let weak = [];
  for (const h of plant) {
    if (!h.recipe.layers.some((l) => l.type === 'emblem')) continue;
    const W = emblemWindow(h, TILE);
    const bytes = paint(W.sp, null, { size: TILE, mode: 'normal', recipe: h.recipe });
    // the body's tone, read far from the emblem (the leg below the cuff at u = 0.5, v = 0.2)
    const bo = (Math.round(0.2 * TILE) * TILE + Math.round(0.5 * TILE)) * 4;
    const body = lum(bytes, bo);
    let dark = 0, n = 0;
    for (let y = Math.max(0, W.y0); y < Math.min(TILE, W.y1); y++) for (let x = Math.max(0, W.x0); x < Math.min(TILE, W.x1); x++) { n++; if (lum(bytes, (y * TILE + x) * 4) < body - 70) dark++; }
    if (dark / n < 0.05) weak.push(`${h.name} ${(100 * dark / n).toFixed(1)}%`);
  }
  ok(!weak.length, `every Plant Parent emblem carries ink that reads (5 percent of its window at least)${weak.length ? ': ' + weak.join(', ') : ''}`);
}

// 2. the size floor: a 5.6 cm emblem paints as a 6.4 cm one (the Mystery Seedling), and a big one is untouched
{
  const seed = plant.find((h) => h.name === 'Mystery Seedling');
  const em = seed.recipe.layers.find((l) => l.type === 'emblem');
  ok(em.size < HERO.minEmblem, `the seedling's emblem is written at ${em.size} cm, under the floor of ${HERO.minEmblem}`);
  const sp = silOf(seed);
  // the painted picture's footprint with the floor, against the same picture painted at its written size
  const foot = () => {
    const bytes = paint(sp, null, { size: TILE, mode: 'normal', recipe: seed.recipe });
    const bo = (Math.round(0.2 * TILE) * TILE + Math.round(0.5 * TILE)) * 4, body = lum(bytes, bo);
    // the pixels the picture paints, in the band of rows round the emblem (the cuff, heel and toe lie outside it)
    const cv = em.at ? em.at[1] : 0.45, y0 = Math.round((cv - 0.12) * TILE), y1 = Math.round((cv + 0.12) * TILE);
    let n = 0;
    for (let y = y0; y < y1; y++) for (let x = 0; x < TILE; x++) if (Math.abs(lum(bytes, (y * TILE + x) * 4) - body) > 40) n++;
    return n;
  };
  const withFloor = foot();
  const keep = HERO.minEmblem; HERO.minEmblem = 0;
  const written = foot();
  HERO.minEmblem = keep;
  ok(withFloor > written * 1.1, `the seedling paints more picture with the floor (${withFloor} px against ${written} written)`);
}

// 3. a decal lands where the emblem is, on both faces, mirrored in U, and nowhere else
{
  const h = plant[0];
  const sp = silOf(h), dims = silhouetteDims(sp.silhouette);
  const bytes = paint(sp, null, { size: TILE, mode: 'normal', recipe: h.recipe });
  const before = new Uint8ClampedArray(bytes);
  // a 4 x 4 decal: the left half red, the right half blue, opaque
  const rgba = new Uint8ClampedArray(4 * 4 * 4);
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { const o = (y * 4 + x) * 4; rgba[o] = x < 2 ? 255 : 0; rgba[o + 2] = x < 2 ? 0 : 255; rgba[o + 3] = 255; }
  const n = decalOver(bytes, TILE, dims, { ...h.recipe, silhouette: sp.silhouette }, { rgba, w: 4, h: 4 });
  ok(n > 500, `the decal touched ${n} pixels`);
  const W = emblemWindow(h, TILE);
  const cx = Math.round(0.25 * TILE), cy = Math.round((W.em.at ? W.em.at[1] : 0.45) * TILE);
  const at = (x, y) => { const o = (y * TILE + x) * 4; return [bytes[o], bytes[o + 1], bytes[o + 2]]; };
  const l = at(cx - 6, cy), r = at(cx + 6, cy), l2 = at(Math.round(0.75 * TILE) - 6, cy);
  // mirrored in U: the decal's LEFT (red) lands on the tile's RIGHT of the centre
  ok(r[0] > 200 && r[2] < 60 && l[2] > 200 && l[0] < 60, `the decal is mirrored in U like the emblem (right of centre ${r}, left ${l})`);
  ok(l2[2] > 200, 'and it is on the second face too');
  let outside = 0;
  for (let y = 0; y < TILE; y++) for (let x = 0; x < TILE; x++) { if (y >= W.y0 - 1 && y < W.y1 + 1) continue; const o = (y * TILE + x) * 4; if (bytes[o] !== before[o]) outside++; }
  ok(outside === 0, `nothing outside the emblem's rows moved (${outside})`);
  ok(decalOver(bytes, TILE, dims, h.recipe, null) === 0 && decalOver(bytes, TILE, dims, { layers: [] }, { rgba, w: 4, h: 4 }) === 0, 'no decal, or no emblem, touches nothing');
}

done();
