// Turns the JSON data files into the lookup tables the sim reads. DOM-free.
//
// Every record of one kind (species, things, weapons, terrains) gets the same keys in the same order, the
// absent ones set to undefined, which every read already treats like a missing key. The JSON records each
// had their own key set, so the engine saw dozens of object shapes at one property read and kept throwing
// the step's optimized code away; unoptimized code boxes every number it touches, which was most of what the
// step still allocated (M1-1 slice 5).
import { compileHarm } from './harm.js';

function uniform(recs) {
  const keys = [], seen = new Set();
  for (const r of Object.values(recs)) for (const k of Object.keys(r)) if (!seen.has(k)) { seen.add(k); keys.push(k); }
  const out = {};
  for (const [id, r] of Object.entries(recs)) { const o = {}; for (const k of keys) o[k] = r[k]; out[id] = o; }
  return out;
}

// Movement modes: which speed multiplier from rules.move a step uses (C.mv[mode], ai/move.js step()).
export const MV_WALK = 0, MV_RUN = 1, MV_CHASE = 2, MV_ABDUCT = 3, MV_GRAZE = 4, MV_FOOD = 5, MV_HOME = 6, MV_MATE = 7;
const MOVE_KEYS = ['walk', 'run', 'chase', 'abduct', 'graze', 'toFood', 'toHome', 'toMate'];

export function compileContent(d) {
  const terrIds = Object.keys(d.terrain);
  const tid = {};
  terrIds.forEach((k, i) => (tid[k] = i));
  const terr = uniform(Object.fromEntries(terrIds.map((k) => [k, { id: k, ...d.terrain[k] }])));
  const TERR = terrIds.map((k) => terr[k]);
  const GEAR = {};
  for (const g of d.gear) GEAR[g.id] = g;
  const kinds = Object.keys(d.creatures), kid = {};
  kinds.forEach((k, i) => (kid[k] = i));
  // A creature's gear is one object shape too: every slot any weapon, gear item or species can fill.
  const gearKeys = ['weapon'];
  const addKeys = (o) => { for (const k of Object.keys(o || {})) if (!gearKeys.includes(k)) gearKeys.push(k); };
  for (const g of d.gear) addKeys(g.effects);
  for (const k of kinds) addKeys(d.creatures[k].gear);
  // The kinds that hunt each kind (combat.js hunts(): its hunts list names it, or 'all' and another kind).
  const huntersOf = kinds.map((k) => Int32Array.from(kinds.filter((a) => { const h = d.creatures[a].hunts; return h && (h === 'all' ? a !== k : h.includes(k)); }).map((a) => kid[a])));
  return {
    S: uniform(d.creatures),
    kinds, // creature kind ids by index
    kid, // creature kind id -> index
    huntersOf, // kind index -> the kind indexes that hunt it
    foeKinds: Int32Array.from(kinds.filter((k) => d.creatures[k].enemy || d.creatures[k].hunts === 'all').map((k) => kid[k])), // combat.js isFoe()
    gearKeys,
    mv: Float64Array.from(MOVE_KEYS, (k) => d.rules.move[k]),
    WEAP: uniform(d.weapons),
    GEAR,
    // Things, and a loose item for every weapon and gear (design 14 §3, §7 T7: a crown or a hat lying on the ground), type
    // 'item:<id>', lying flat, drawn with the item's own picture; the Hand lifts it (commands.js liftItem / dropItem).
    BLD: uniform({ ...d.buildings, ...looseItems(d) }),
    TERR,
    tid,
    P: d.powers,
    rules: d.rules,
    harm: compileHarm(d.rules), // rules.harm as lookup arrays (harm.js)
    // Kinds that hunt something Safe or Pets safe can guard (people, pets): they balk visibly at a guarded one (decide.js).
    canBalk: Uint8Array.from(kinds, (k) => { const h = d.creatures[k].hunts; return h && (h === 'all' || h.some((x) => x === 'human' || (d.creatures[x] && d.creatures[x].pet))) ? 1 : 0; }),
    names: d.names,
    looks: d.looks,
    tags: compileTags(d), // design 14 §5: what a reaction row matches on
    RX: compileRows(d),   // the reaction rows themselves (reactions.js resolves their masks)
    ...compileIcons(d, kinds),
  };
}

// The pictures a story record can use (story.js, design 14 §4), as indexes into icons [{ spr, over }]: every creature kind
// first (index = its kind index), then every thing (thing:<id>), then story.json's icons (by sprite name). deathIcon: each
// cause of death's icon (-2: the killer's own picture); whyIcon: each reason's icon.
function compileIcons(d, kinds) {
  const icons = kinds.map((k) => ({ spr: d.creatures[k].spr || k, over: d.creatures[k].over }));
  const iconOf = {}, things = { ...d.buildings, ...looseItems(d) };
  for (const [id, t] of Object.entries(things)) { iconOf['thing:' + id] = icons.length; icons.push({ spr: t.spr, over: t.over }); }
  for (const n of d.story.icons) { iconOf[n] = icons.length; icons.push({ spr: n }); }
  const at = (ref) => (ref === '@killer' ? -2 : iconOf[ref]);
  const deathIcon = Object.fromEntries(Object.entries(d.story.death).map(([k, r]) => [k, at(r)]));
  const whyIcon = Object.fromEntries(Object.entries(d.story.why).map(([k, r]) => [k, at(r)]));
  return { icons, iconOf, deathIcon, whyIcon };
}

// Tags (design 14 §5). Every creature kind, thing, terrain, weapon, gear piece and power may carry `tags`; a
// reaction row matches on them. Each tag is one bit of a mask kept in two 32-bit words (JS bitwise is 32-bit), so
// "has all of these tags" is two ANDs and a row match allocates nothing. Tags are registered in file order, so the
// bits are the same in every process. validate-data refuses a 65th tag.
export const MAX_TAGS = 64;
function compileTags(d) {
  const bit = {}, list = [];
  const idx = (t) => { if (bit[t] === undefined) { bit[t] = list.length; list.push(t); } return bit[t]; };
  // A mask is two 32-bit words: bits 0 to 31 in m0, 32 to 63 in m1. Two ANDs, no allocation, 64 tags.
  const of = (tags) => {
    let m0 = 0, m1 = 0;
    for (const t of tags || []) { const i = idx(t); if (i > 63) throw new Error(`content: more than ${MAX_TAGS} tags`); if (i < 32) m0 |= 1 << i; else m1 |= 1 << (i - 32); }
    return [m0, m1];
  };
  const kinds = Object.keys(d.creatures);
  const kind0 = new Int32Array(kinds.length), kind1 = new Int32Array(kinds.length);
  kinds.forEach((k, i) => { const [a, b] = of(d.creatures[k].tags); kind0[i] = a; kind1[i] = b; });
  const terrIds = Object.keys(d.terrain);
  const terr0 = new Int32Array(terrIds.length), terr1 = new Int32Array(terrIds.length);
  terrIds.forEach((k, i) => { const [a, b] = of(d.terrain[k].tags); terr0[i] = a; terr1[i] = b; });
  const thing0 = {}, thing1 = {}, weapon0 = {}, weapon1 = {}, gear0 = {}, gear1 = {}, power0 = {}, power1 = {};
  for (const [id, t] of Object.entries(d.buildings)) { const [a, b] = of(t.tags); thing0[id] = a; thing1[id] = b; }
  for (const [id, wp] of Object.entries(d.weapons)) { const [a, b] = of(wp.tags); weapon0[id] = a; weapon1[id] = b; thing0['item:' + id] = a; thing1['item:' + id] = b; }
  for (const g of d.gear) { const [a, b] = of(g.tags); gear0[g.id] = a; gear1[g.id] = b; thing0['item:' + g.id] = a; thing1['item:' + g.id] = b; }
  for (const [id, p] of Object.entries(d.powers)) if (id[0] !== '_') { const [a, b] = of(p.tags); power0[id] = a; power1[id] = b; }
  return { bit, list, kind0, kind1, terr0, terr1, thing0, thing1, weapon0, weapon1, gear0, gear1, power0, power1, of };
}

// The reaction rows as written (src/data/reactions.json), kept in file order: first match wins (14 §5).
function compileRows(d) { return d.reactions.rows; }

function looseItems(d) {
  const out = {};
  for (const [id, wp] of Object.entries(d.weapons)) out['item:' + id] = { name: wp.name, flat: 1, spr: wp.spr, over: wp.over, item: id };
  for (const g of d.gear) out['item:' + g.id] = { name: g.name, flat: 1, spr: g.spr, over: g.over, item: g.id };
  return out;
}

// A new, empty gear object in the one shape (see gearKeys).
export function newGear(C) {
  const g = {};
  for (let k = 0; k < C.gearKeys.length; k++) g[C.gearKeys[k]] = undefined;
  return g;
}
