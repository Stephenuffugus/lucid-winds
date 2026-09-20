// Harm (design 14 §6): one table, rules.harm, says what each source of harm may do to a creature, by what protects
// it. Safe guards humans; Pets safe guards pets (and, from T11, creatures the child renamed) the same way. Gentle
// (00 §2) covers people or everyone. Every place that hurts a creature asks effect() first; the table is the only
// place the rules live, so the fixtures (tools/fixtures.mjs harm-*) and the UI read the same thing.
import { addFx } from './fx.js';
import { emit, EVI } from './events.js';

export const SRC = { attack: 0, area: 1, convert: 2, carry: 3, power: 4, reaction: 5, need: 6, hazard: 7 };
// Effects, least protective first, so the stronger of two protections is the larger number.
export const NORMAL = 0, WARN = 1, FLOOR_FIRST = 2, FLOOR = 3, NONE = 4, BLOCK = 5;
const CODE = { normal: NORMAL, warn: WARN, floorFirst: FLOOR_FIRST, floor: FLOOR, none: NONE, block: BLOCK };
const COLS = ['safe', 'gentle', 'neither'];

// rules.harm as three Int8Arrays (safe, gentle, neither) indexed by source; -1 where a column has no say.
export function compileHarm(rules) {
  const H = rules.harm, out = COLS.map(() => new Int8Array(Object.keys(SRC).length).fill(-1));
  for (const [src, i] of Object.entries(SRC)) COLS.forEach((c, j) => { const v = H[src][c]; out[j][i] = v === null ? -1 : CODE[v]; });
  return { safe: out[0], gentle: out[1], neither: out[2] };
}

// Safe's protection: a human while Safe is on, a pet while Pets safe is on.
export function guarded(w, e) {
  const k = w.E.kind[e];
  if (k === 'human') return w.safe;
  // Pets safe covers pets and, from T11, anything the child has named: naming it makes it somebody.
  return w.petsSafe && (!!w.C.S[k].pet || w.E.named[e] === 1);
}
// Gentle's cover: 1 = people, 2 = everyone (world.js GENTLE).
export const covered = (w, e) => w.gentle === 2 || (w.gentle === 1 && w.E.kind[e] === 'human');

// What source `src` may do to creature e: the most protective effect among the protections that apply to it, or the
// table's `neither` when none does. FLOOR_FIRST is resolved here: FLOOR in the player's first world, else NORMAL.
export function effect(w, e, src) {
  const H = w.C.harm;
  let fx = -1;
  if (guarded(w, e)) fx = H.safe[src];
  if (covered(w, e) && H.gentle[src] > fx) fx = H.gentle[src];
  if (fx < 0) fx = H.neither[src];
  if (fx === FLOOR_FIRST) fx = w.first ? FLOOR : NORMAL;
  return fx;
}
// A mark over a creature ("?": a blocked attack), only when no mark of that type is showing anywhere: one cue at a
// time (design 14 §1 rule 3).
export function mark(w, type, x, y, t) {
  for (let k = 0; k < w.fxN; k++) if (w.fx[k].type === type) return;
  addFx(w, type, x, y, t);
  emit(w, EVI[type], x, y, 0);
}

// The damage source `src` may deal to e now: 0 when it may deal none, less when it may not take e below 1 hp.
export function allowed(w, e, src, dmg) {
  const fx = effect(w, e, src);
  if (fx >= NONE) return 0;
  if (fx === FLOOR) return Math.max(0, Math.min(dmg, w.E.hp[e] - 1));
  return dmg;
}
