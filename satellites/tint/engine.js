/* TINT's pure engine (plans/tint/HANDOFF-TINT.md sections 3 and 4). No screen, no clock, no unseeded die: every deal takes its
   random source, so Node replays exactly what a page played.

   TRAPS, TRAP_POOL, ERROR_TAXONOMY   Mode 1's pairs, the handoff's seven first, then a pool for each of the five errors (T4)
   dealCompare   a SAME COLOUR session of twenty: each error at least once, ten same pairs, a dye that shows every difference (3.3)
   dealFill      a FILL THE VAT session of twenty: exactly three orders that do not scale (T1, 3.4), whole factors at stage 1 and seven
                 of seventeen not whole beyond (T3, 3.6)
   NONLINEAR_BANK, dealScales   DOES IT SCALE: a session of ten with exactly four that do (T2)
   Every ratio family is dealt continuous before it is ever dealt discretized (T9, 3.7). */
import { reduceRatio, lightnessGap, DYES } from './colour.js?v=20260916g';

export const ERROR_TAXONOMY = Object.freeze(['additive', 'buildUp', 'magicalDoubling', 'constantSum', 'incomplete']);

const pair = (left, right, errorTarget = null) => Object.freeze({
  left: Object.freeze(left), right: Object.freeze(right), errorTarget,
  answer: reduceRatio(...left).join(':') === reduceRatio(...right).join(':') ? 'same' : 'different'
});

/* the handoff's section 5 trap set, in its order */
export const TRAPS = Object.freeze([
  pair([2, 1], [3, 2], 'additive'),
  pair([2, 1], [6, 3]),
  pair([3, 2], [6, 3], 'magicalDoubling'),
  pair([3, 1], [2, 2], 'constantSum'),
  pair([4, 2], [6, 3]),
  pair([3, 2], [9, 6]),
  pair([2, 1], [5, 2.5])
]);

/* more of each error, and more pairs that are the same, for sessions that do not repeat the seven */
export const TRAP_POOL = Object.freeze({
  additive: Object.freeze([pair([2, 1], [3, 2], 'additive'), pair([3, 1], [4, 2], 'additive'), pair([5, 2], [6, 3], 'additive'), pair([1, 2], [2, 3], 'additive')]),
  buildUp: Object.freeze([pair([2, 1], [5, 3], 'buildUp'), pair([1, 1], [3, 2], 'buildUp'), pair([3, 1], [5, 2], 'buildUp'), pair([1, 2], [3, 5], 'buildUp')]),
  magicalDoubling: Object.freeze([pair([3, 2], [6, 3], 'magicalDoubling'), pair([2, 1], [4, 1], 'magicalDoubling'), pair([3, 1], [3, 2], 'magicalDoubling'), pair([5, 2], [10, 2], 'magicalDoubling')]),
  constantSum: Object.freeze([pair([3, 1], [2, 2], 'constantSum'), pair([4, 2], [3, 3], 'constantSum'), pair([5, 1], [4, 2], 'constantSum'), pair([1, 3], [2, 2], 'constantSum')]),
  incomplete: Object.freeze([pair([2, 1], [6, 2], 'incomplete'), pair([3, 2], [9, 4], 'incomplete'), pair([1, 2], [3, 4], 'incomplete'), pair([2, 3], [6, 7], 'incomplete')]),
  same: Object.freeze([pair([2, 1], [4, 2]), pair([2, 1], [6, 3]), pair([4, 2], [6, 3]), pair([3, 2], [9, 6]), pair([2, 1], [5, 2.5]), pair([3, 1], [6, 2]), pair([5, 2], [10, 4]), pair([4, 3], [8, 6]), pair([3, 2], [4.5, 3]), pair([5, 3], [7.5, 4.5])])
});

const MIN_GAP = 2.5;
const pick = (r, list) => list[Math.floor(r() * list.length)];
function shuffle(r, list) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = out[i]; out[i] = out[j]; out[j] = t; }
  return out;
}
const familyOf = ratio => reduceRatio(...ratio).join(':');

/* T9: a family is continuous the first time; once seen, discretized half the time from stage 2 */
function representationFor(r, families, seen, stage) {
  const fresh = families.some(f => !seen.has(f));
  const rep = fresh || stage < 2 ? 'continuous' : (r() < 0.5 ? 'discretized' : 'continuous');
  families.forEach(f => seen.add(f));
  return rep;
}

/* a dye whose lightness shows the difference, for a different pair (3.3); any dye for a same pair */
function dyeFor(r, p) {
  const names = Object.keys(DYES).filter(n => p.answer === 'same' || lightnessGap(DYES[n], p.left, p.right) >= MIN_GAP);
  return names.length ? pick(r, names) : null;
}

export function dealCompare(r, { stage = 1, seen = new Set() } = {}) {
  const chosen = [];
  for (const e of ERROR_TAXONOMY) chosen.push(pick(r, TRAP_POOL[e].filter(p => dyeFor(() => 0, p))));
  while (chosen.length < 10) { const e = pick(r, ERROR_TAXONOMY); chosen.push(pick(r, TRAP_POOL[e].filter(p => dyeFor(() => 0, p)))); }
  while (chosen.length < 20) chosen.push(pick(r, TRAP_POOL.same));
  const next = new Set(seen);
  const tasks = shuffle(r, chosen).map(p => {
    const dye = dyeFor(r, p), families = [familyOf(p.left), familyOf(p.right)];
    return { mode: 'compare', left: p.left.slice(), right: p.right.slice(), answer: p.answer, errorTarget: p.errorTarget, dye, representation: representationFor(r, families, next, stage) };
  });
  return { tasks, seen: next };
}

const FILL_RECIPES = Object.freeze([[2, 1], [3, 2], [1, 2], [3, 1], [2, 3], [4, 3], [5, 2]]);
const WHOLE = Object.freeze([2, 3, 4, 5]), NOT_WHOLE = Object.freeze([1.5, 2.5, 3.5, 0.5]);

/* the answer an order's situation gives: a scaled order's white is recipe white times dye over recipe dye; a rinse is the same
   whatever the order (it does not scale) */
export function fillAnswer(x) {
  return x.kind === 'rinse' ? x.fixed : x.recipe[1] * x.dye / x.recipe[0];
}

export function dealFill(r, { stage = 1, seen = new Set() } = {}) {
  const slots = shuffle(r, Array.from({ length: 20 }, (_, i) => i));
  const rinse = new Set(slots.slice(0, 3)), notWhole = new Set(stage > 1 ? slots.slice(3, 10) : []);
  const next = new Set(seen), tasks = [];
  for (let i = 0; i < 20; i++) {
    const recipe = pick(r, FILL_RECIPES);
    const k = notWhole.has(i) ? pick(r, NOT_WHOLE) : pick(r, WHOLE);
    const dye = recipe[0] * k, dyeName = pick(r, Object.keys(DYES));
    const representation = representationFor(r, [familyOf(recipe)], next, stage);
    if (rinse.has(i)) {
      /* a rinse: every vat takes the same white to rinse, whatever its size; never the scaled number */
      const scaled = recipe[1] * dye / recipe[0];
      let fixed = 1 + Math.floor(r() * 3);
      if (fixed === scaled) fixed += 1;
      tasks.push({ mode: 'fill', kind: 'rinse', recipe: recipe.slice(), dye, fixed, answer: fixed, scaleFactor: k, factorType: Number.isInteger(k) ? 'integer' : 'nonInteger', isProportional: false, errorTarget: null, dyeName, representation });
    } else {
      tasks.push({ mode: 'fill', kind: 'scale', recipe: recipe.slice(), dye, answer: recipe[1] * dye / recipe[0], scaleFactor: k, factorType: Number.isInteger(k) ? 'integer' : 'nonInteger', isProportional: true, errorTarget: null, dyeName, representation });
    }
  }
  return { tasks, seen: next };
}

/* DOES IT SCALE (Mode 4): the handoff's four seeds first; the demonstration each reveal shows is named in `demo` */
const item = (id, proportionalAnswer, actual, demo) => Object.freeze({ id, proportionalAnswer, actual, isProportional: proportionalAnswer === actual, demo });
export const NONLINEAR_BANK = Object.freeze([
  item('dry', 8, 2, 'clock'),
  item('area', 2, 4, 'tiles'),
  item('heat', 120, 30, 'clock'),
  item('dyers', 15, 15, 'rows'),
  item('boil', 30, 10, 'clock'),
  item('age', 40, 30, 'line'),
  item('sun', 15, 5, 'clock'),
  item('song', 8, 4, 'clock'),
  item('square', 8, 16, 'tiles'),
  item('jugs', 15, 15, 'rows'),
  item('rope', 10, 10, 'rows'),
  item('basket', 35, 35, 'rows'),
  item('walk', 12, 12, 'line')
]);

export function dealScales(r) {
  const yes = shuffle(r, NONLINEAR_BANK.filter(b => b.isProportional)).slice(0, 4);
  const no = shuffle(r, NONLINEAR_BANK.filter(b => !b.isProportional)).slice(0, 6);
  return shuffle(r, yes.concat(no)).map(b => ({ mode: 'scales', id: b.id, proportionalAnswer: b.proportionalAnswer, actual: b.actual, isProportional: b.isProportional, demo: b.demo }));
}

export function scoreCompare(t, choice) {
  return { correct: choice === t.answer };
}
export function scoreFill(t, answer) {
  return { correct: Math.abs(Number(answer) - t.answer) < 1e-9 };
}
export function scoreScales(t, choice) {
  return { correct: (choice === 'scales') === t.isProportional };
}
