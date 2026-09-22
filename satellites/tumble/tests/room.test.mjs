// THE ROOM (DESIGN-T2 phase 3). The four new surfaces, the parametric rug, the windows and the items over
// them. Everything here is data and pure maths; what the PAINTERS actually put on screen is `dev/gate-room.mjs`.
//
// 3.1's hard line: she looks at the tabletop the whole game, so **every tabletop must keep socks READABLE**.
// The ten loudest sock palettes are measured against each one in CIEDE2000, the same distance the generator
// already uses to keep two socks apart (DE_FLOOR 7).
import { suite } from './lib.mjs';
import { readFileSync } from 'fs';
import { paletteColors, DE_FLOOR } from '../engine/sockgen.js';
import { deltaE } from '../engine/color.js';

const { ok, done } = suite('room');
const read = (f) => JSON.parse(readFileSync(new URL('../data/' + f, import.meta.url), 'utf8'));
const unlocks = read('unlocks.json');
const decor = unlocks.items.filter((i) => i.cat === 'decor');
const SURFACES = ['wallpaper', 'floor', 'curtains', 'tabletop'];
const of = (slot) => decor.filter((i) => i.look && i.look.slot === slot);

// ---------- 3.1 the four new slots ----------
{
  for (const slot of SURFACES) {
    const items = of(slot);
    ok(items.length === 6, `six ${slot} items (${items.length})`);
  }
  const all = SURFACES.flatMap(of);
  const costs = all.map((i) => (i.cost || {}).lint);
  ok(costs.every((c) => Number.isInteger(c) && c >= 120 && c <= 600), `every one costs 120 to 600 Lint (${Math.min(...costs)} to ${Math.max(...costs)})`);
  ok(all.every((i) => (i.cost || {}).quarters === undefined), 'and none of them costs a Quarter: the room is bought with Lint');
  ok(all.every((i) => !i.start), 'none of them starts owned');
  const ids = new Set(unlocks.items.map((i) => i.id));
  ok(ids.size === unlocks.items.length, `every unlock id is still unique (${ids.size})`);
  // a surface is a SINGLE slot in save.equipped, so two of them must never be wearable at once
  ok(all.every((i) => i.cat === 'decor'), 'they live in the Room tab with the rest of the decor');
}
// each slot's six are actually different from each other: six items that paint the same thing is one item
{
  const kindOf = { wallpaper: 'pattern', floor: 'kind', curtains: 'kind', tabletop: 'pattern' };
  for (const slot of SURFACES) {
    const kinds = of(slot).map((i) => i.look[kindOf[slot]]);
    ok(new Set(kinds).size === 6, `the six ${slot} items paint six different things (${kinds.join(', ')})`);
  }
}
// the painters know every kind the data asks for: a typo here is a room that silently paints the default
{
  const src = readFileSync(new URL('../src/textures.js', import.meta.url), 'utf8');
  // textures.js is browser only (it needs a canvas), so the banks are read out of its source rather than
  // imported. A plain index scan, not a regex: the point is to catch a typo in the DATA, not to parse JS.
  const listed = (name) => {
    const at = src.indexOf('export const ' + name + ' = [');
    if (at < 0) return [];
    const open = src.indexOf('[', at), close = src.indexOf(']', open);
    return src.slice(open + 1, close).split(',').map((x) => x.trim().replace(/'/g, '')).filter(Boolean);
  };
  const banks = { wallpaper: listed('WALLPAPERS'), floor: listed('FLOORS'), curtains: listed('CURTAINS'), tabletop: listed('TABLETOPS') };
  const kindOf = { wallpaper: 'pattern', floor: 'kind', curtains: 'kind', tabletop: 'pattern' };
  for (const slot of SURFACES) {
    ok(banks[slot].length === 6, `the painter lists six ${slot} kinds (${banks[slot].join(', ')})`);
    const missing = of(slot).map((i) => i.look[kindOf[slot]]).filter((k) => !banks[slot].includes(k));
    ok(!missing.length, `and every ${slot} item asks for one it knows${missing.length ? ': ' + missing : ''}`);
  }
}

// ---------- THE TABLETOP CONTRAST LINE (3.1) ----------
// The ten loudest sock palettes, measured against every tabletop she can put down. `MAT_MARK` is how much of
// the mat's `line` colour each pattern mixes over its base; dev/gate-room.mjs samples the REAL painted mat and
// fails if the two disagree, so this is not a hand mirror of the painter.
{
  const src = readFileSync(new URL('../src/textures.js', import.meta.url), 'utf8');
  const mm = src.match(/export const MAT_MARK = \{([^}]*)\}/);
  const MAT_MARK = {};
  for (const part of mm[1].split(',')) { const [k, v] = part.split(':').map((x) => x.trim()); if (k) MAT_MARK[k] = Number(v); }
  ok(Object.keys(MAT_MARK).length === 6, `every tabletop has a measured mark fraction (${Object.entries(MAT_MARK).map(([k, v]) => k + ' ' + v).join(', ')})`);

  // the ten loudest palettes the generator can make: the most saturated, which are the ones a mat can swallow
  const scored = [];
  for (let p = 0; p < 256; p++) {
    const c = paletteColors(p);
    const spread = (rgb) => Math.max(...rgb) - Math.min(...rgb);
    scored.push({ p, loud: spread(c.body) + spread(c.accent), body: c.body, accent: c.accent });
  }
  scored.sort((a, b) => b.loud - a.loud);
  const loudest = scored.slice(0, 10);
  ok(loudest.length === 10 && loudest[0].loud > loudest[9].loud, `the ten loudest sock palettes picked (spread ${Math.round(loudest[0].loud)} down to ${Math.round(loudest[9].loud)})`);

  const painted = (look) => {
    const k = MAT_MARK[look.pattern] || 0;
    return look.base.map((q, i) => q + (look.line[i] - q) * k);
  };
  const bad = [];
  let worst = { d: 1e9 };
  for (const it of of('tabletop')) {
    const mat = painted(it.look);
    for (const s of loudest) {
      for (const [what, rgb] of [['body', s.body], ['accent', s.accent]]) {
        const dd = deltaE(mat.map(Math.round), rgb);
        if (dd < worst.d) worst = { d: dd, mat: it.name, what, p: s.p };
        if (dd < DE_FLOOR) bad.push(`${it.name} vs palette ${s.p} ${what} (dE ${dd.toFixed(1)})`);
      }
    }
  }
  ok(!bad.length, `no tabletop swallows a loud sock${bad.length ? ': ' + bad.slice(0, 3).join(' | ') : ` (closest: ${worst.mat} vs palette ${worst.p} ${worst.what}, dE ${worst.d.toFixed(1)}, floor ${DE_FLOOR})`}`);

  // And in every colour vision mode, because a mat that only works for one set of eyes is not a mat.
  // ⚠️ The first version of this loop checked only `body` and not `accent`, so it passed two mats that a
  // by-hand check found at dE 2.1 and 3.7. A check narrower than the one beside it is not a check.
  const lost = [];
  let cvdWorst = { d: 1e9 };
  for (const mode of ['deutan', 'protan', 'tritan']) {
    for (const it of of('tabletop')) {
      const mat = painted(it.look).map(Math.round);
      for (const s of loudest) for (const [what, rgb] of [['body', s.body], ['accent', s.accent]]) {
        const dd = deltaE(mat, rgb, mode);
        if (dd < cvdWorst.d) cvdWorst = { d: dd, mat: it.name, mode, what, p: s.p };
        if (dd < DE_FLOOR) lost.push(`${mode}: ${it.name} vs ${s.p} ${what} (dE ${dd.toFixed(1)})`);
      }
    }
  }
  ok(!lost.length, `and none of them swallows one in any colour vision mode${lost.length ? ': ' + lost.slice(0, 3).join(' | ') : ` (closest: ${cvdWorst.mat}, ${cvdWorst.mode}, dE ${cvdWorst.d.toFixed(1)})`}`);
}

done();
