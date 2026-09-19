// Turns the JSON data files into the lookup tables the sim reads. DOM-free.
//
// Every record of one kind (species, things, weapons, terrains) gets the same keys in the same order, the
// absent ones set to undefined, which every read already treats like a missing key. The JSON records each
// had their own key set, so the engine saw dozens of object shapes at one property read and kept throwing
// the step's optimized code away; unoptimized code boxes every number it touches, which was most of what the
// step still allocated (M1-1 slice 5).
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
    BLD: uniform(d.buildings),
    TERR,
    tid,
    P: d.powers,
    rules: d.rules,
    names: d.names,
    looks: d.looks,
  };
}

// A new, empty gear object in the one shape (see gearKeys).
export function newGear(C) {
  const g = {};
  for (let k = 0; k < C.gearKeys.length; k++) g[C.gearKeys[k]] = undefined;
  return g;
}
