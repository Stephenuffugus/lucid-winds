// POCKET FINDS (DESIGN-T2 phase 2.2). The whole rule set for what turns up in a Load, pure, so Node can
// replay a thousand Loads without a browser.
//
// A find is a COLLECTION entry, not a payout: nothing here touches Lint, Quarters, the jar or a clock.
// Named finds are UNIQUE (GPT 2's rule): once she has one it can never be rolled again, so thirty finds are
// thirty moments and not a slot machine.
//
// At most ONE find per Load. Which find is decided from the Load's seed at the start, so the same Load always
// turns up the same thing and a fixture can replay it; it then ARRIVES at that find's own `comesOut` moment.
// If that moment never comes round in this Load (a Clean Load that was not clean, a flip in a Load with no
// inside out socks), the lint trap has it at the end: the rate the design asks for is the rate she gets.

export const RARITY_WEIGHT = { common: 1, uncommon: 0.5, rare: 0.22 };
export const DEFAULT_CHANCE = { small: 0.12, regular: 0.22, heavy: 0.32, mountain: 0.45 };
export const FALLBACK_MOMENT = 'trap';

function h32(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
}
const unit = (str) => h32(str) / 4294967296;

export const chanceFor = (catalogue, size) => {
  const c = (catalogue && catalogue.chance) || DEFAULT_CHANCE;
  return c[size] !== undefined ? c[size] : c.regular;
};

const met = (needs, stats) => !needs || ((stats && stats[needs.stat]) || 0) >= needs.gte;

// Everything she could turn up right now: not hers already, its Load reached, and never a `once` find
// (those are not rolled at all, they arrive on their own Load).
export function eligible(catalogue, { have = [], loads = 0, stats = null } = {}) {
  const held = new Set(have);
  return (catalogue.items || []).filter((f) => f.rarity !== 'once' && !held.has(f.id) && loads >= f.fromLoad && met(f.needs, stats));
}

// A `once` find whose Load has arrived. It takes the Load's one find slot and is never rolled for.
export function onceDue(catalogue, { have = [], loads = 0, stats = null } = {}) {
  const held = new Set(have);
  return (catalogue.items || []).find((f) => f.rarity === 'once' && !held.has(f.id) && loads >= f.fromLoad && met(f.needs, stats)) || null;
}

// What this Load turns up, or null. `loads` is the number of Loads she has FINISHED before this one, so a
// find whose fromLoad is 1 can turn up in her very first Load and one whose fromLoad is 100 arrives in the
// hundredth.
export function findForLoad(catalogue, { loadSeed, size = 'regular', have = [], loads = 0, stats = null } = {}) {
  const n = loads + 1;
  const once = onceDue(catalogue, { have, loads: n, stats });
  if (once) return once;
  if (unit(`${loadSeed}|findgate`) >= chanceFor(catalogue, size)) return null;
  const pool = eligible(catalogue, { have, loads: n, stats });
  if (!pool.length) return null;
  const total = pool.reduce((a, f) => a + (RARITY_WEIGHT[f.rarity] || 0), 0);
  if (total <= 0) return null;
  let t = unit(`${loadSeed}|findpick`) * total;
  for (const f of pool) { const w = RARITY_WEIGHT[f.rarity] || 0; if (t < w) return f; t -= w; }
  return pool[pool.length - 1];
}

// ---------- sets ----------
export const setMembers = (catalogue, setId) => (catalogue.items || []).filter((f) => f.set === setId).map((f) => f.id);

// Which sets are complete for this list of finds. A set with nothing in the catalogue is never complete.
export function completedSets(catalogue, have) {
  const held = new Set(have);
  return (catalogue.sets || []).filter((s) => {
    const need = setMembers(catalogue, s.id);
    return need.length > 0 && need.every((id) => held.has(id));
  }).map((s) => s.id);
}

// What the room's containers show: how many finds are in each, and a colour from each one.
// A find lives in the container its set is given, so a finished set moves as one thing (2.4).
export const CONTAINERS = ['jar', 'dish', 'tray', 'cork'];
export const containerOf = (catalogue, findId) => {
  const items = catalogue.items || [];
  const i = items.findIndex((f) => f.id === findId);
  if (i < 0) return CONTAINERS[0];
  const f = items[i];
  const sets = (catalogue.sets || []).map((s) => s.id);
  const si = sets.indexOf(f.set);
  return CONTAINERS[(si < 0 ? i : si) % CONTAINERS.length];
};

export const findById = (catalogue, id) => (catalogue.items || []).find((f) => f.id === id) || null;
export const setById = (catalogue, id) => (catalogue.sets || []).find((s) => s.id === id) || null;
export const comfortById = (catalogue, id) => (catalogue.comforts || []).find((c) => c.id === id) || null;

// The comforts she has, from the finds she has. Laundry Day only, and a toggle can switch any of them off
// (2.5): `off` is the set of comfort ids she has turned off on the Clothesline page.
export function comfortsFrom(catalogue, have, off = []) {
  const held = new Set(have), hidden = new Set(off);
  const out = new Set();
  for (const f of catalogue.items || []) if (f.help && held.has(f.id) && !hidden.has(f.help)) out.add(f.help);
  return out;
}
