/* CREASE's engine: the sim (plans/crease/HANDOFF-CREASE.md section 4).
 *
 * Pure. Nothing here names document, window, Date, performance, Math.random or a timer; every random choice is drawn from
 * the rng handed in (CORE's pure.js rng), so a gate can replay a run. The page and the Node gates import this one file.
 *
 * A run is a state carried from task to task: generateTask(r, state) returns { task, state } and never changes the state
 * it was handed. A task is the handoff's Task: { mode, numerator, denominator, whole, tier, trap, strip }, plus chainStep
 * (1, 2 or 3 inside an equivalence chain) and stackReveal (true on a chain's third item, C4).
 */
import { lineGeometry } from '../math/core/pure.js?v=20260916a';
import { FRACTION_BANK, GRADE_DENOMINATORS } from './bank.js?v=20260916a';

/* the handoff's tolerance ladder for FREEHAND, in percent absolute error of the whole, loosest first */
export const TOLERANCE = Object.freeze([0.10, 0.07, 0.05, 0.035, 0.025]);
/* CORE's adaptTier on the ladder: three in a row to climb, two misses in a row to fall */
export const TIER_CONFIG = Object.freeze({ tiers: TOLERANCE.length, up: 3, down: 2, start: 0, floor: 0 });
/* C3: the lengths a strip can be, and how often a run starts an equivalence chain */
export const WHOLES = Object.freeze([1, 2, 3, 5]);
const CHAIN_CHANCE = 0.12, BANK_CHANCE = 0.5, RECENT = 4;

const RANK = { 3: 0, 4: 1, extended: 2 };
/* HALFWAY's deal: an exact half this often, a fraction within an eighth of a half this often, the rest built */
const HALF_CHANCE = 0.25, NEAR_HALF_CHANCE = 0.4;

/* HALFWAY's truth, exactly, from the numbers: twice the numerator against the denominator */
export function judgeHalf(task) {
  const twice = 2 * task.numerator;
  return twice === task.denominator ? 'half' : twice < task.denominator ? 'less' : 'more';
}
const key = (n, d) => n + '/' + d;

export function freshRun({ grade = 3, mode = 'freehand', extended = false, tier = 0, halfOpen = false } = {}) {
  if (!GRADE_DENOMINATORS[grade]) throw new Error('crease: no grade ' + grade);
  return { grade, mode, extended: !!extended, tier, halfOpen: !!halfOpen, round: 0, recent: [], chain: [], chainStep: 0, sinceOne: 0 };
}

/* the bank's items this run may serve */
function allowed(state) {
  const top = state.extended ? RANK.extended : RANK[state.grade];
  return FRACTION_BANK.filter(it => RANK[it.grade] <= top);
}

/* a proper fraction built from the grade's denominators (100 is left to the bank: its parts are too thin for a strip) */
function built(r, state, recent) {
  const ds = GRADE_DENOMINATORS[state.grade].filter(d => d !== 100);
  for (let i = 0; i < 60; i++) {
    const d = ds[r.int(ds.length)], n = 1 + r.int(d - 1);
    if (!recent.includes(key(n, d))) return { n, d, trap: null };
  }
  return null;
}

export function generateTask(r, handed) {
  const state = JSON.parse(JSON.stringify(handed));
  const recent = state.recent.slice(-RECENT);
  let pick = null, whole = null, chainStep = 0;
  const mustBeOne = state.sinceOne >= RECENT;

  if (state.mode === 'halfway') {
    /* a whole of 1 always; an exact half, a near half, or a fraction built from the grade's denominators; no chains. An exact
       half only once "exactly half" is a choice on the screen: before it, a half has no right answer and breaks the streak
       that brings it */
    const ds = GRADE_DENOMINATORS[state.grade].filter(d => d !== 100);
    const halves = !state.halfOpen ? [] : ds.filter(d => d % 2 === 0).map(d => ({ n: d / 2, d, trap: 'benchmark-half' })).filter(f => !recent.includes(key(f.n, f.d)));
    const near = [];
    for (const d of ds) for (let n = 1; n < d; n++) {
      const v = n / d;
      if (v !== 0.5 && Math.abs(v - 0.5) <= 0.125 && !recent.includes(key(n, d))) near.push({ n, d, trap: 'benchmark-half' });
    }
    const roll = r();
    if (halves.length && roll < HALF_CHANCE) pick = halves[r.int(halves.length)];
    else if (near.length && roll < HALF_CHANCE + NEAR_HALF_CHANCE) pick = near[r.int(near.length)];
    else pick = built(r, state, recent) || near[r.int(near.length)];
    /* a built fraction can be a half too (2/4 from quarters); closed, it is built again */
    for (let i = 0; !state.halfOpen && i < 60 && 2 * pick.n === pick.d; i++) pick = built(r, state, recent) || pick;
    if (!state.halfOpen && 2 * pick.n === pick.d) pick = near.find(f => 2 * f.n !== f.d);
    whole = 1;
  } else if (state.chain.length) {
    /* a chain goes on: equal fractions on the whole of 1, one after another */
    const next = state.chain.shift();
    pick = { n: next.n, d: next.d, trap: 'equivalence' };
    chainStep = state.chainStep + 1;
    whole = 1;
  } else {
    const items = allowed(state);
    const chains = items.filter(it => it.tag === 'equivalence' && it.fractions.length >= 3
      && it.fractions.slice(0, 3).every(f => !recent.includes(key(f.n, f.d))));
    if (chains.length && r() < CHAIN_CHANCE) {
      const it = chains[r.int(chains.length)];
      state.chain = it.fractions.slice(1, 3).map(f => ({ n: f.n, d: f.d }));
      pick = { n: it.fractions[0].n, d: it.fractions[0].d, trap: 'equivalence' };
      chainStep = 1;
      whole = 1;
    } else {
      const singles = [];
      for (const it of items) {
        if (it.tag === 'equivalence') continue;
        for (const f of it.fractions) {
          if (recent.includes(key(f.n, f.d))) continue;
          if (mustBeOne && f.n > f.d) continue;
          singles.push({ n: f.n, d: f.d, trap: it.tag });
        }
      }
      if (singles.length && r() < BANK_CHANCE) pick = singles[r.int(singles.length)];
      else pick = built(r, state, recent) || singles[r.int(singles.length)];
    }
  }

  const value = pick.n / pick.d;
  if (whole === null) {
    /* C3: a whole that holds the value; after four rounds away from 1, back to 1 */
    const fits = WHOLES.filter(w => w >= value);
    whole = mustBeOne && value <= 1 ? 1 : fits[r.int(fits.length)];
  }

  state.chainStep = state.chain.length ? chainStep : 0;
  state.recent = recent.concat(key(pick.n, pick.d)).slice(-RECENT);
  state.sinceOne = whole === 1 ? 0 : state.sinceOne + 1;
  state.round++;

  const task = {
    mode: state.mode, numerator: pick.n, denominator: pick.d, whole, tier: state.tier, trap: pick.trap,
    strip: lineGeometry(r)
  };
  if (chainStep) { task.chainStep = chainStep; if (chainStep === 3) task.stackReveal = true; }
  return { task, state };
}

/* percent absolute error of the whole, placement in the strip's own numbers; correct within the tier's band, near within
   twice it (the reveal contract's rule 5: the game counts a near miss, the screen shows the same reveal) */
export function scoreAttempt(task, placement, tier) {
  const value = task.numerator / task.denominator;
  const band = TOLERANCE[Math.max(0, Math.min(TOLERANCE.length - 1, tier))];
  const pae = Math.abs(placement - value) / task.whole;
  return { correct: pae <= band, near: pae <= 2 * band, pae, truePosition: value / task.whole };
}
