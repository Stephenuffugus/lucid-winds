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
// the slots decorMesh really draws, read out of room.js: a slot with no mesh is an item that buys nothing
const roomSrc = readFileSync(new URL('../src/room.js', import.meta.url), 'utf8');
const SLOT_OK = new Set([...roomSrc.matchAll(/case '([a-z]+)':/g)].map((m) => m[1]).concat(['wallpaper', 'floor', 'curtains', 'tabletop']));

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
  // THE MEASURED TABLETOP AVERAGES. `dev/gate-room.mjs` paints each mat in the real page, averages it and
  // records it here; this fixture measures a sock against THAT. ⛔ Nothing predicts the painter: the first
  // version did, with a mix fraction, and the gate found the prediction up to 27 units of 255 too bright
  // because the painter also shades the base.
  let AVG = null;
  try { AVG = JSON.parse(readFileSync(new URL('./mat-average.json', import.meta.url), 'utf8')); } catch (e) { AVG = null; }
  ok(!!AVG, 'tests/mat-average.json exists (run dev/gate-room.mjs to record it)');
  const tops = of('tabletop');
  const missing = AVG ? tops.filter((i) => !AVG[i.look.pattern]) : tops;
  ok(!missing.length, `every tabletop has a measured average${missing.length ? ': ' + missing.map((i) => i.look.pattern) : ` (${tops.length})`}`);
  if (AVG && !missing.length) {
    // the ten loudest palettes the generator can make: the ones a mat can swallow
    const scored = [];
    for (let p = 0; p < 256; p++) {
      const c = paletteColors(p);
      const spread = (rgb) => Math.max(...rgb) - Math.min(...rgb);
      scored.push({ p, loud: spread(c.body) + spread(c.accent), body: c.body, accent: c.accent });
    }
    scored.sort((a, b) => b.loud - a.loud);
    const loudest = scored.slice(0, 10);
    ok(loudest.length === 10 && loudest[0].loud > loudest[9].loud, `the ten loudest sock palettes picked (spread ${Math.round(loudest[0].loud)} down to ${Math.round(loudest[9].loud)})`);

    const bad = [];
    let worst = { d: 1e9 };
    for (const mode of ['normal', 'deutan', 'protan', 'tritan']) {
      for (const it of tops) {
        const mat = AVG[it.look.pattern];
        for (const s of loudest) for (const [what, rgb] of [['body', s.body], ['accent', s.accent]]) {
          const dd = deltaE(mat, rgb, mode);
          if (dd < worst.d) worst = { d: dd, mat: it.name, mode, what, p: s.p };
          if (dd < DE_FLOOR) bad.push(`${mode}: ${it.name} vs palette ${s.p} ${what} (dE ${dd.toFixed(1)})`);
        }
      }
    }
    ok(!bad.length, `no tabletop swallows a loud sock, in any colour vision mode${bad.length ? ': ' + bad.slice(0, 3).join(' | ') : ` (closest: ${worst.mat}, ${worst.mode}, ${worst.what} of palette ${worst.p}, dE ${worst.d.toFixed(1)}, floor ${DE_FLOOR})`}`);
  }
}

// ---------- 3.2 THE PARAMETRIC RUG ----------
{
  const src = readFileSync(new URL('../src/textures.js', import.meta.url), 'utf8');
  const listed = (name) => {
    const at = src.indexOf('export const ' + name + ' = [');
    if (at < 0) return [];
    const open = src.indexOf('[', at), close = src.indexOf(']', open);
    return src.slice(open + 1, close).split(',').map((x) => x.trim().replace(/'/g, '')).filter(Boolean);
  };
  const SHAPES = listed('RUG_SHAPES'), PATTERNS = listed('RUG_PATTERNS');
  ok(SHAPES.length === 4 && PATTERNS.length === 8, `the painter takes ${SHAPES.length} shapes and ${PATTERNS.length} patterns (${SHAPES.join('/')} · ${PATTERNS.join('/')})`);

  const rugs = of('rug');
  ok(rugs.length === 18, `eighteen rugs: the six that shipped plus the twelve this line adds (${rugs.length})`);
  const noShape = rugs.filter((r) => !r.look.shape || !r.look.pattern || !Array.isArray(r.look.colors));
  ok(!noShape.length, `every rug is data over the painter${noShape.length ? ': ' + noShape.map((r) => r.id) : ''}`);
  const alien = rugs.filter((r) => !SHAPES.includes(r.look.shape) || !PATTERNS.includes(r.look.pattern));
  ok(!alien.length, `and every one asks for a shape and a pattern the painter knows${alien.length ? ': ' + alien.map((r) => r.look.shape + '/' + r.look.pattern) : ''}`);

  // THE SIX THAT ALREADY SHIPPED MUST LOOK AS THEY DID. They were all one drawing, an oval braid over their
  // own two colours, and `braid` in the new painter is that drawing character for character. So the promise
  // is: shape oval, pattern braid, the SAME two colours in the same order, and no wear laid over it.
  const OLD = ['decor-rug-oatmeal', 'decor-rug-braided', 'decor-rug-rag', 'decor-rug-moss', 'decor-rug-sunny', 'decor-rug-rose'];
  const moved = [];
  for (const id of OLD) {
    const r = rugs.find((x) => x.id === id);
    if (!r) { moved.push(id + ' is gone'); continue; }
    const L = r.look;
    if (L.shape !== 'oval') moved.push(`${id} changed shape to ${L.shape}`);
    if (L.pattern !== 'braid') moved.push(`${id} changed pattern to ${L.pattern}`);
    if (L.colors[0] !== L.color || L.colors[1] !== L.color2) moved.push(`${id} changed colour`);
    if (L.wear) moved.push(`${id} grew wear it never had`);
  }
  ok(!moved.length, `the six rugs that shipped are unmoved${moved.length ? ': ' + moved.join(' | ') : ' (oval braid, same colours, no wear)'}`);

  // the twelve new ones are actually twelve different rugs, not one rug in twelve colours
  const fresh = rugs.filter((r) => !OLD.includes(r.id));
  ok(fresh.length === 12, `twelve new rugs (${fresh.length})`);
  const combos = new Set(fresh.map((r) => r.look.shape + '/' + r.look.pattern));
  ok(combos.size >= 8, `across ${combos.size} different shape and pattern pairings`);
  ok(new Set(fresh.map((r) => r.look.shape)).size === 4, 'and all four shapes are used');
  const flat = fresh.filter((r) => r.look.colors.length < 3);
  ok(!flat.length, `every new rug names its three colours${flat.length ? ': ' + flat.map((r) => r.id) : ''}`);
  const costs = fresh.map((r) => r.cost.lint);
  ok(costs.every((c) => c >= 120 && c <= 600), `priced with the rest of the room, 120 to 600 Lint (${Math.min(...costs)} to ${Math.max(...costs)})`);
}

// ---------- 3.3 THE SIX WINDOWS ----------
{
  const rsrc = readFileSync(new URL('../src/room.js', import.meta.url), 'utf8');
  const at = rsrc.indexOf('export const WINDOW_VIEWS = [');
  const open = rsrc.indexOf('[', at), close = rsrc.indexOf(']', open);
  const VIEWS = rsrc.slice(open + 1, close).split(',').map((x) => x.trim().replace(/'/g, '')).filter(Boolean);
  const wins = of('window');
  ok(wins.length === 10, `ten windows: the four that shipped plus the six this line adds (${wins.length})`);
  const variants = wins.map((w) => w.look.variant);
  ok(new Set(variants).size === 10, `every one is a different view (${variants.join(', ')})`);
  const alien = variants.filter((v) => !VIEWS.includes(v));
  ok(!alien.length, `and the painter knows every one${alien.length ? ': ' + alien : ` (${VIEWS.length} listed)`}`);
  // the two the design says MOVE really are wired to a mover, and nothing else is
  const mv = rsrc.indexOf('export const WINDOW_MOVERS = {');
  const mopen = rsrc.indexOf('{', mv), mclose = rsrc.indexOf('}', mopen);
  const movers = rsrc.slice(mopen + 1, mclose).split(',').map((x) => x.split(':')[0].trim()).filter(Boolean);
  ok(movers.length === 2 && movers.includes('train') && movers.includes('line'), `exactly two views move, and they are the two the design names (${movers.join(', ')})`);
  // every view is painted for night too: a noon view behind a night room is what breaks the hour light
  const body = rsrc.slice(rsrc.indexOf('function windowView(kind, night)'), rsrc.indexOf('export const WINDOW_VIEWS') > 0 ? rsrc.length : rsrc.length);
  ok(/night \? /.test(body), 'the painter branches on night');
  const costs = wins.filter((w) => !['woods', 'city', 'rain', 'snow'].includes(w.look.variant)).map((w) => w.cost.lint);
  ok(costs.length === 6 && costs.every((c) => c >= 120 && c <= 600), `the six new ones are priced with the room (${Math.min(...costs)} to ${Math.max(...costs)} Lint)`);
}

// ---------- 3.4 TWENTY MORE, AS DATA ----------
{
  // 3.4's whole point is that these cost no code: a colour and a variant over a mesh that already exists.
  const SLOTS = ['lamp', 'plant', 'mug', 'poster'];
  const counts = SLOTS.map((k) => [k, of(k).length]);
  const added = counts.reduce((n, [, c]) => n + c, 0);
  ok(added >= 55, `the four data slots hold ${added} items between them (${counts.map(([k, c]) => k + ' ' + c).join(', ')})`);
  for (const k of SLOTS) ok(of(k).length >= 9, `${k} has at least nine (${of(k).length})`);
  // a variant is what the mesh switches on, so two items sharing one are two names for one thing
  const dupes = [];
  for (const k of SLOTS) {
    const seen = new Map();
    for (const it of of(k)) {
      const v = it.look.variant;
      if (seen.has(v)) dupes.push(`${k}/${v}: ${seen.get(v)} and ${it.id}`);
      seen.set(v, it.id);
    }
  }
  ok(!dupes.length, `no two items in a slot share a variant${dupes.length ? ': ' + dupes.slice(0, 3).join(' | ') : ''}`);
  // and nothing here added a new painter: they are data over what was already drawn
  const noColour = SLOTS.flatMap(of).filter((i) => !i.look.color || !i.look.color2);
  ok(!noColour.length, `every one names its two colours${noColour.length ? ': ' + noColour.map((i) => i.id) : ''}`);
}

// ---------- the whole catalogue still holds together ----------
{
  const ids = new Set(unlocks.items.map((i) => i.id));
  ok(ids.size === unlocks.items.length, `every unlock id is unique across all ${ids.size} of them`);
  const names = unlocks.items.map((i) => i.name);
  const dupName = names.filter((n, i) => names.indexOf(n) !== i);
  ok(!dupName.length, `and no two items share a name${dupName.length ? ': ' + [...new Set(dupName)].slice(0, 3).join(' | ') : ''}`);
  const bad = decor.filter((i) => !i.look || !i.look.slot || !SLOT_OK.has(i.look.slot));
  ok(!bad.length, `every decor item sits in a slot the room knows${bad.length ? ': ' + bad.map((i) => i.id) : ''}`);
  const free = unlocks.items.filter((i) => i.cat === 'decor' && !i.cost && !i.start);
  ok(!free.length, `nothing in the room is priced at nothing${free.length ? ': ' + free.map((i) => i.id) : ''}`);
}

done();
