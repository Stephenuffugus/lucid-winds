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

// Design 15 A4b. `grabs` on a species is a list of rules: which loose items that creature will pick up, and
// when. `when` is one of: always · unsafe (only while Safe is off, so a child playing with Safe on never sees
// monsters arm themselves) · night (Safe off and after dark). A species with no list never picks anything up.
const WHEN = { always: 0, unsafe: 1, night: 2 };
function compileGrabs(d) {
  const out = {};
  for (const [id, c] of Object.entries(d.creatures)) {
    if (!c.grabs) continue;
    out[id] = c.grabs.map((r) => ({
      ids: r.items ? new Set(r.items) : null,
      tags: r.tags ? r.tags.slice() : null,
      weapons: !!r.weapons,
      gear: !!r.gear,
      when: WHEN[r.when],
    }));
  }
  return out;
}
function itemTags(d) {
  const out = {};
  for (const [id, wp] of Object.entries(d.weapons)) out[id] = new Set(wp.tags || []);
  for (const g of d.gear) out[g.id] = new Set(g.tags || []);
  return out;
}

// A design that CHANGES a record which already exists (design 17: a hen lays, a dog takes toys) puts the new
// fields in the record's `vN` instead of overwriting the old ones, and they are merged here while that design's
// content switch is on. With `contentN` off the record is exactly the one that shipped before it. The merge is
// in design order, oldest first, so a later design has the last word on a field two of them touch. It runs once
// at load, never in the tick. (Design 18 ticket 0.2 made it general: design 17 could only change a creature.)
const V_FILES = ['creatures', 'buildings', 'terrain', 'weapons', 'powers'];
function mergeVersions(d) {
  const recs = [];
  for (const file of V_FILES) for (const rec of Object.values(d[file])) recs.push(rec);
  for (const g of d.gear) recs.push(g); // gear.json is a list, not a table, and merges the same way
  const ns = Object.keys(d.rules.flagsSince).filter((k) => /^[0-9]+$/.test(k)).map(Number).sort((a, b) => a - b);
  for (const n of ns) if (d.rules.flags['content' + n] !== false) { const v = 'v' + n; for (const rec of recs) if (rec[v]) Object.assign(rec, rec[v]); }
}

export function compileContent(d) {
  mergeVersions(d);
  if (d.land) d.rules.land = d.land; // design 19: the land's numbers and rules read as rules.land (the sim reads R.land)
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
  // A creature's gear is one object shape: the weapon, the six slots a piece is worn in (design 14 §7 T10), and
  // every effect any piece or species can set.
  const gearKeys = ['weapon', ...GEAR_SLOTS];
  const addKeys = (o) => { for (const k of Object.keys(o || {})) if (!gearKeys.includes(k)) gearKeys.push(k); };
  for (const g of d.gear) addKeys(g.effects);
  for (const k of kinds) addKeys(d.creatures[k].gear);
  // The kinds that hunt each kind (combat.js hunts(): its hunts list names it, or 'all' and another kind).
  const huntersOf = kinds.map((k) => Int32Array.from(kinds.filter((a) => { const h = d.creatures[a].hunts; return h && (h === 'all' ? a !== k : h.includes(k)); }).map((a) => kid[a])));
  return {
    S: uniform(d.creatures),
    GRAB: compileGrabs(d), // who picks what up off the ground (design 15 A4b)
    ITAG: itemTags(d), // item id -> its tags, as a Set
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
    traits: compileTraits(d, kinds), // design 18 A3: what a creature IS, read from the data it already carries
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
  // Design 18 A4, honest pictures. A weapon already has a picture: the loose one lying on the ground. A power has
  // its tray icon. A terrain has its tile, which is drawn from its three colours and not from a sprite at all.
  // APPENDED, after everything above: every index that already exists must keep the number it had, or a saved
  // Scrapbook would show the wrong pictures.
  for (const id of Object.keys(d.weapons)) iconOf['weapon:' + id] = iconOf['thing:item:' + id];
  for (const [id, p] of Object.entries(d.powers)) { if (id[0] === '_') continue; iconOf['power:' + id] = icons.length; icons.push({ spr: p.icon, over: p.iconOver }); }
  for (const [id, t] of Object.entries(d.terrain)) { iconOf['terrain:' + id] = icons.length; icons.push({ terr: id, cols: t.cols }); } // (terrain.json carries no _note: its ids are indexes)
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
  // `giant` is worn by nothing in the data: a creature carries it while it IS one (E.bigT, reactions.js
  // fillCreature). Registered after everything else, so every older tag keeps the bit it had. (Design 17: the one
  // tag this design spends, of the twelve that were left.)
  const [giant0, giant1] = of(['giant']);
  return { bit, list, kind0, kind1, terr0, terr1, thing0, thing1, weapon0, weapon1, gear0, gear1, power0, power1, giant0, giant1, of };
}

// Traits (design 18 A3). What a creature IS, read from the data every record already carries, so a row can say
// "the little ones" or "anybody who is not humanoid" without spending one of the sixty-four tags. Two kinds:
//   SPECIES traits are the same for every creature of a kind, so they are worked out once per kind at load;
//   STATE traits are true of ONE creature at ONE moment (reactions.js stateTraits), and cost seven reads.
// Each is one bit of a single 32-bit mask: a row compiles to two of them (all of these must hold; none of these
// may) and the test in the tick is two ANDs and no allocation.
// A trait the sim cannot answer is the design 18 A2 trap (a row that passes every gate and is quietly ignored),
// so validate-data refuses one by reading stateTraits itself. `asleep` joined the list with A5 and `changed`
// with A13, each in the same commit as the field that answers it.
export const SPECIES_TRAITS = {
  herb: (c) => c.diet === 'herb', carn: (c) => c.diet === 'carn', omni: (c) => c.diet === 'omni', filter: (c) => c.diet === 'filter',
  fly: (c) => !!c.fly, // it flies
  swims: (c) => !!c.water, // it lives in the water and cannot leave it
  amph: (c) => !!c.amph, // it is at home in both
  walks: (c) => !c.fly && !c.water, // its feet are on the ground (an amphibian walks; a fish never does)
  enemy: (c) => !!c.enemy, pet: (c) => !!c.pet, ally: (c) => !!c.ally, sociable: (c) => !!c.sociable, humanoid: (c) => !!c.humanoid,
  lays: (c) => !!c.lays, // it lays eggs
  tiny: (c) => c.size === 'tiny', small: (c) => c.size === 'small', big: (c) => c.size === 'big', // (no size at all is the middle)
};
export const STATE_TRAITS = ['baby', 'adult', 'named', 'giant', 'calm', 'indoors', 'outdoors', 'asleep', 'changed', 'hungry']; // (design 19 G1.8 appended `hungry`: every older trait keeps its bit)
export const TRAITS = [...Object.keys(SPECIES_TRAITS), ...STATE_TRAITS];
function compileTraits(d, kinds) {
  const bit = {};
  TRAITS.forEach((t, i) => (bit[t] = 1 << i)); // 24 of the 31 a 32-bit mask holds
  const kind = new Int32Array(kinds.length);
  kinds.forEach((k, i) => { const c = d.creatures[k]; for (const t of Object.keys(SPECIES_TRAITS)) if (SPECIES_TRAITS[t](c)) kind[i] |= bit[t]; });
  return { bit, kind, list: TRAITS };
}

// The reaction rows as written (src/data/reactions.json), kept in file order: first match wins (14 §5).
// The rows, in file order. Design 15's own rows can be switched off together (rules.flags.rows15), which is how
// a world recorded before them is reproduced exactly.
function compileRows(d) {
  // `since: N` rows can be switched off together (rules.flags.rowsN), which is how a world recorded before them
  // is reproduced. `until: N` marks the OLD wording of a row that design N revised: it is read only while rowsN is
  // off, so switching N off brings back exactly the rows that shipped before it, revised ones included.
  const f = d.rules.flags;
  return d.reactions.rows.filter((r) => !(r.since && f['rows' + r.since] === false) && !(r.until && f['rows' + r.until] !== false));
}

function looseItems(d) {
  const out = {};
  for (const [id, wp] of Object.entries(d.weapons)) out['item:' + id] = { name: wp.name, flat: 1, spr: wp.spr, over: wp.over, item: id };
  for (const g of d.gear) out['item:' + g.id] = { name: g.name, flat: 1, spr: g.spr, over: g.over, item: g.id };
  return out;
}

// A new, empty gear object in the one shape (see gearKeys).
// The six slots (design 14 §7 T10). A piece goes in one of them, and a new piece in a slot replaces what was
// there: a second hat is a swap, never two hats at once.
export const GEAR_SLOTS = ['head', 'body', 'back', 'hand', 'feet', 'charm'];

// What a creature wears, worked out from the pieces in its slots and its species' own gear. Called whenever a
// slot changes, so the effect fields are never left over from a piece that has been taken off.
export function rebuildGear(w, e) {
  const C = w.C, E = w.E, was = E.gear[e], sp = C.S[E.kind[e]];
  const g = newGear(C);
  Object.assign(g, sp.gear); // the species' own (a knight's sword, an alien's blaster)
  for (const slot of GEAR_SLOTS) {
    const id = was[slot];
    if (!id || !C.GEAR[id]) continue;
    g[slot] = id;
    Object.assign(g, C.GEAR[id].effects);
  }
  if (was.weapon) g.weapon = was.weapon;
  E.gear[e] = g;
  return g;
}

// The one rule for what goes where (design 18 A9): a weapon into the hand, a piece of gear into its own slot.
// The Hand's `give` (commands.js) and a row that gives something (reactions.js `give`) both come through here,
// so who can wear what is one rule and not two. `replace`: the Hand swaps what is already worn (design 14 §7
// T10, a second hat is a swap); a ROW never does, so a full slot means the row changed nothing and steps aside.
// Returns the name of what went on, or null when nothing did.
export function equipOn(w, e, id, replace) {
  const G = w.E.gear[e], wp = w.C.WEAP[id], g = w.C.GEAR[id];
  if (!G || (!wp && !g)) return null;
  if (wp) {
    if (G.weapon === id || (G.weapon && !replace)) return null;
    G.weapon = id;
    return wp.name;
  }
  if (G[g.slot] === g.id || (G[g.slot] && !replace)) return null;
  G[g.slot] = g.id;
  rebuildGear(w, e);
  return g.name;
}

export function newGear(C) {
  const g = {};
  for (let k = 0; k < C.gearKeys.length; k++) g[C.gearKeys[k]] = undefined;
  return g;
}
