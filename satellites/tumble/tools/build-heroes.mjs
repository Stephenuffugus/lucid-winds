// Merges the per pack hero files (data/heroes/*.json) into data/hero-socks.json and checks them.
// An authoring tool, not a runtime build step: the merged file is committed. node tools/build-heroes.mjs
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { decode, paint } from '../engine/sockgen.js';
import { buildMask } from '../assets/geo/placeholder.js';
import { SILHOUETTES } from '../src/silhouettes.js';

const dir = new URL('../data/heroes/', import.meta.url);
const files = readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
const ORDER = ['uncle-energy', 'gas-station', 'fake-merch', 'cursed', 'impossible'];
const packs = [], heroes = [], problems = [];
const DASH = /[-‐-―−]/;
const RAR = new Set(['common', 'uncommon', 'rare', 'odd']);
const SILS = new Set(SILHOUETTES.map((s) => s.key));
const masks = SILHOUETTES.map((s) => buildMask(s));
const sorted = files.sort((a, b) => ORDER.indexOf(a.replace('.json', '')) - ORDER.indexOf(b.replace('.json', '')));
for (const f of sorted) {
  let d;
  try { d = JSON.parse(readFileSync(new URL(f, dir), 'utf8')); } catch (e) { problems.push(`${f}: not JSON (${e.message})`); continue; }
  if (d.pack) packs.push(d.pack);
  for (const h of d.heroes || []) {
    const where = `${f} ${h.id}`;
    if (heroes.some((x) => x.id === h.id)) problems.push(`${where}: duplicate id`);
    for (const k of ['id', 'name', 'pack', 'silhouette', 'rarity', 'flavor', 'source', 'recipe']) if (h[k] === undefined) problems.push(`${where}: missing ${k}`);
    if (!RAR.has(h.rarity)) problems.push(`${where}: rarity ${h.rarity}`);
    if (!SILS.has(h.silhouette)) problems.push(`${where}: silhouette ${h.silhouette}`);
    for (const k of ['name', 'flavor']) if (DASH.test(h[k] || '')) problems.push(`${where}: dash in ${k}: ${h[k]}`);
    try {
      const spec = decode('hero:' + h.id);
      const sid = SILHOUETTES.findIndex((s) => s.key === h.silhouette);
      spec.silhouette = sid;
      paint(spec, masks[sid], { recipe: h.recipe, size: 64 });
      paint(spec, masks[sid], { recipe: h.recipe, size: 64, mode: 'deutan' });
    } catch (e) { problems.push(`${where}: paint threw ${e.message}`); }
    heroes.push(h);
  }
}
for (const p of packs) if (DASH.test(p.name || '') || DASH.test(p.blurb || '')) problems.push(`pack ${p.id}: dash in player text`);
writeFileSync(new URL('../data/hero-socks.json', import.meta.url), JSON.stringify({ version: 1, note: 'Merged from data/heroes/*.json by tools/build-heroes.mjs; edit the pack files, then rerun.', packs, heroes }, null, 1) + '\n');
const byPack = {};
for (const h of heroes) byPack[h.pack] = (byPack[h.pack] || 0) + 1;
console.log('merged', heroes.length, 'heroes', JSON.stringify(byPack));
if (problems.length) { console.log(problems.join('\n')); process.exitCode = 1; }
