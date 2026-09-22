// THE HERO PACKS (DESIGN-T2 4.1): the free Plant Parent Support Group and the five that follow it, and the laws
// every hero sock in the catalogue answers to.
//
// Two of these rules come from LOOKING at the hero sheets on 23 Sep, not from the design:
//   · an emblem sits on the leg or on the top of the foot, never on the heel: four of the free pack's sat at v 0.42
//     to 0.45, which on a crew sock IS the heel, and wrapped round the bend;
//   · an emblem has to show against its own sock: pale glass on a near white sock is a pattern nobody sees.
import { suite } from './lib.mjs';
import { readFileSync } from 'fs';
import { decode, paint, silhouetteDims } from '../engine/sockgen.js';
import { deltaE } from '../engine/color.js';
import { buildMask } from '../assets/geo/placeholder.js';
import { SILHOUETTES } from '../src/silhouettes.js';

const { ok, done } = suite('packs');
const read = (f) => JSON.parse(readFileSync(new URL('../' + f, import.meta.url), 'utf8'));
const cat = read('data/hero-socks.json');
const unlocks = read('data/unlocks.json');
const SILS = SILHOUETTES.map((s) => s.key);
const DESIGN_T2 = ['plant-parents', 'pet-hair-fiber', 'office-kitchen-evidence', 'cottage-chore-club', 'found-1998', 'local-creature-report'];

// ---------- the six packs of DESIGN-T2 phase 4 ----------
for (const id of DESIGN_T2) {
  const mine = cat.heroes.filter((h) => h.pack === id);
  const item = unlocks.items.find((i) => i.cat === 'pack' && i.look && i.look.pack === id);
  const packMeta = (cat.packs || []).find((p) => p.id === id);
  ok(mine.length === 10, `${id}: ten socks (${mine.length})`);
  const by = {};
  for (const h of mine) by[h.rarity] = (by[h.rarity] || 0) + 1;
  ok(by.common === 5 && by.uncommon === 3 && by.rare === 2 && (by.odd || 0) <= 1, `${id}: five common, three uncommon, two rare (${JSON.stringify(by)})`);
  ok(new Set(mine.map((h) => h.silhouette)).size === 8, `${id}: all eight silhouettes`);
  ok(!!item && !!packMeta, `${id}: in the shop and in the catalogue`);
  if (id === 'plant-parents') ok(item && item.start === true && !(item.cost || {}).quarters, `${id}: FREE, hers from the first launch`);
  // every pack is a thing she saves for with Quarters from the jar, at the price the first four packs set
  else ok(item && item.start === false && (item.cost || {}).quarters === 10, `${id}: 10 Quarters, like every pack before it (${JSON.stringify(item && item.cost)})`);
  const long = mine.filter((h) => h.flavor.trim().split(/\s+/).length > 12);
  ok(!long.length, `${id}: every flavor line is twelve words or fewer${long.length ? ': ' + long.map((h) => h.name).join(', ') : ''}`);
}

// ---------- the laws for EVERY hero sock ----------
{
  const ids = cat.heroes.map((h) => h.id), names = cat.heroes.map((h) => h.name.toLowerCase());
  ok(new Set(ids).size === ids.length, `every hero id is unique (${ids.length})`);
  const dup = names.filter((n, i) => names.indexOf(n) !== i);
  ok(!dup.length, `every hero name is unique across all packs${dup.length ? ': ' + dup.join(', ') : ''}`);
  const DASH = /[-‐-―−]/;
  const dashed = cat.heroes.filter((h) => DASH.test(h.name) || DASH.test(h.flavor));
  ok(!dashed.length, `no dash in any name or flavor${dashed.length ? ': ' + dashed.map((h) => h.name).join(', ') : ''}`);
  const shouty = cat.heroes.filter((h) => /!/.test(h.name + h.flavor));
  ok(!shouty.length, 'nothing shouts');
  // law 10: no brand, team, band, character or near miss. The finds list, plus what these themes walk into.
  // WORD boundaries: "excel" is in "excellent" and "levis" in "television" (both caught a finished flavor line)
  const BRANDS = /\b(?:chapstick|band\s?aid|kleenex|velcro|sharpie|lego|barbie|nike|adidas|levis|hershey|tic\s?tac|altoid|post\s?it|q\s?tip|crayola|hot\s?wheels|matchbox|ziploc|tupperware|scotch\s?tape|disney|pokemon|marvel|coke|pepsi|swingline|garfield|slender|tamagotchi|nintendo|game\s?boy|walkman|discman|polaroid|furby|beanie|hello\s?kitty|snoopy|pac\s?man|sega|blockbuster|trapper\s?keeper|lisa\s?frank|nerf|jell\s?o|pyrex|keurig|nespresso|outlook|excel|slack|zoom|nokia|motorola|pringles|doritos|cheetos|oreo)\b/i;
  const hits = cat.heroes.filter((h) => BRANDS.test(h.name) || BRANDS.test(h.flavor));
  ok(!hits.length, `no brand or character in any hero name or flavor${hits.length ? ': ' + hits.map((h) => h.name).join(', ') : ''}`);
  const orphan = cat.heroes.filter((h) => !(cat.packs || []).some((p) => p.id === h.pack));
  ok(!orphan.length, `every hero belongs to a pack in the catalogue${orphan.length ? ': ' + orphan.map((h) => h.id).join(', ') : ''}`);
  ok(cat.heroes.every((h) => SILS.includes(h.silhouette)), 'every hero has a real silhouette');
}

// ---------- WHERE an emblem sits (the free pack's heel, 23 Sep) ----------
{
  const bad = [];
  for (const h of cat.heroes.filter((x) => DESIGN_T2.includes(x.pack))) {
    const d = silhouetteDims(SILS.indexOf(h.silhouette));
    const leg = d.heel - d.cuff > 0.2;          // a leg long enough to carry a picture
    for (const L of (h.recipe.layers || []).filter((l) => l.type === 'emblem' && l.at)) {
      const v = L.at[1];
      if (leg && !(v > d.cuff && v < d.heel - 0.06)) bad.push(`${h.name} (${h.silhouette}) at ${v}, leg ${d.cuff.toFixed(2)} to ${d.heel.toFixed(2)}`);
      if (!leg && v < d.heel + (1 - d.heel) * 0.35) bad.push(`${h.name} (${h.silhouette}) at ${v}, the top of the foot starts about ${(d.heel + (1 - d.heel) * 0.35).toFixed(2)}`);
    }
  }
  ok(!bad.length, `every emblem sits on the leg or the top of the foot, never the heel${bad.length ? ': ' + bad.join(' | ') : ''}`);
}

// ---------- an emblem SHOWS against its own sock, at the size a sock is in the heap ----------
// Paint each sock at 64 px with and without its layers. At least one percent of the tile must differ STRONGLY from
// the plain sock (CIEDE2000 20 or more), in normal vision and in deutan. Calibrated 23 Sep over all 103 heroes:
// a mean over every changed pixel was useless (anti aliased edges drag it down, and it failed a mix disc anybody
// can read); the strong share named exactly the pale on pale socks the sheets had looked weak.
{
  const masks = SILHOUETTES.map((s) => buildMask(s));
  const faint = [];
  let worst = { d: 1e9 };
  for (const h of cat.heroes.filter((x) => DESIGN_T2.includes(x.pack))) {
    const sid = SILS.indexOf(h.silhouette);
    const spec = decode('hero:' + h.id);
    spec.silhouette = sid;
    for (const mode of ['normal', 'deutan']) {
      const withL = paint(spec, masks[sid], { recipe: h.recipe, size: 64, mode });
      const bare = paint(spec, masks[sid], { recipe: { ...h.recipe, layers: [] }, size: 64, mode });
      let strong = 0;
      for (let i = 0; i < withL.length; i += 4) {
        if (withL[i] === bare[i] && withL[i + 1] === bare[i + 1] && withL[i + 2] === bare[i + 2]) continue;
        if (deltaE([withL[i], withL[i + 1], withL[i + 2]], [bare[i], bare[i + 1], bare[i + 2]]) >= 20) strong++;
      }
      const share = strong / (64 * 64);
      if (share < worst.d) worst = { d: share, what: `${h.name} (${mode})` };
      if (share < 0.01) faint.push(`${h.name} ${mode}: ${(share * 100).toFixed(1)} percent`);
    }
  }
  ok(!faint.length, `every emblem shows against its own sock at heap size${faint.length ? ': ' + faint.join(' | ') : ` (faintest ${worst.what}, ${(worst.d * 100).toFixed(1)} percent of the tile strongly different)`}`);
}

// ---------- no two heroes look like TWINS at heap size (23 Sep, the hero compare sheet) ----------
// Tumble is a matching game: two DIFFERENT heroes of one silhouette that read alike from across the table are a
// pair that is not a pair. Each sock becomes a 4 by 6 grid of its colours at 24 px (roughly what a heap shows) and
// every same silhouette pair involving one of the six design packs must differ by at least dE 10 on average.
// Found by LOOKING: the free pack held three cream crew socks, Pet Hair two black dress socks beside Uncle
// Energy's black Church Sock, and four more pairs across the new packs were one colour apart.
{
  const masks = SILHOUETTES.map((s) => buildMask(s));
  const sig = (h) => {
    const sid = SILS.indexOf(h.silhouette);
    const spec = decode('hero:' + h.id);
    spec.silhouette = sid;
    const t = paint(spec, masks[sid], { recipe: h.recipe, size: 24 });
    const cells = [];
    for (let cy = 0; cy < 6; cy++) for (let cx = 0; cx < 4; cx++) {
      let r = 0, g = 0, b = 0, n = 0;
      for (let y = cy * 4; y < cy * 4 + 4; y++) for (let x = cx * 6; x < cx * 6 + 6; x++) { const i = (y * 24 + x) * 4; if (!t[i + 3]) continue; r += t[i]; g += t[i + 1]; b += t[i + 2]; n++; }
      cells.push(n ? [r / n, g / n, b / n] : [0, 0, 0]);
    }
    return cells;
  };
  const all = cat.heroes.map((h) => ({ h, s: sig(h), mine: DESIGN_T2.includes(h.pack) }));
  const close = [], older = [];
  let nearest = { d: 1e9 };
  for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
    const A = all[i], B = all[j];
    if (A.h.silhouette !== B.h.silhouette) continue;
    let d = 0;
    for (let k = 0; k < 24; k++) d += deltaE(A.s[k], B.s[k]);
    d /= 24;
    const label = `${A.h.name} and ${B.h.name} (${A.h.silhouette}, dE ${d.toFixed(1)})`;
    if (!A.mine && !B.mine) { if (d < 10) older.push(label); continue; }
    if (d < nearest.d) nearest = { d, label };
    if (d < 10) close.push(label);
  }
  ok(!close.length, `no two heroes of one silhouette look like twins at heap size${close.length ? ': ' + close.join(' | ') : ` (nearest ${nearest.label})`}`);
  if (older.length) console.log(`  info  older packs, not changed by this build, for the Director: ${older.join(' | ')}`);
}

done();
