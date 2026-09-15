/* YONDER's engine: the sim (plans/yonder/HANDOFF-YONDER.md section 4).
 *
 * Pure. Nothing here names document, window, Date, performance, Math.random or a timer; every random choice is
 * drawn from the rng handed in (CORE's pure.js rng), so a gate can replay any stage. The page and the Node gates
 * import this one file.
 *
 * A target is a whole number on a road from 0 to max. Estimates are { target, placement } in the road's own numbers,
 * never pixels, so a road's width and offset (Y3) change nothing here.
 */

/* the roads a child meets, shortest first, and how many targets a stage holds on each (docs/DECISIONS.md) */
export const RANGES = Object.freeze([10, 20, 100, 1000, 10000]);
export const STAGE_SIZE = Object.freeze({ 10: 5, 20: 10, 100: 10, 1000: 10, 10000: 10 });

/* handoff section 3: the item a logarithmic reading misplaces most, per road */
export const PROBE_TABLE = Object.freeze({ 100: 15, 1000: 150, 10000: 1500 });

/* handoff section 2: tolerance tiers, in percent absolute error, loosest first */
export const TIER_BANDS = Object.freeze([0.15, 0.12, 0.09, 0.06, 0.04, 0.025]);

/* handoff section 4: where a stage's targets come from, as fractions of the road; a target is never under 2 percent */
const BAND_SHARES = [0.4, 0.3];
const bandBounds = max => [
  [Math.max(1, Math.ceil(0.02 * max)), Math.ceil(0.2 * max) - 1],
  [Math.ceil(0.2 * max), Math.ceil(0.5 * max) - 1],
  [Math.ceil(0.5 * max), max]
];
export function bandOf(target, max) { return target < 0.2 * max ? 0 : target < 0.5 * max ? 1 : 2; }

/* distinct whole numbers from lo to hi not already taken, k of them (or every one left), drawn from r. A small band is
   dealt from its own untaken numbers; a large one by rejection, which a stage of ten cannot exhaust.
   ⛔ The first version stopped when the WHOLE stage's taken set reached this band's size, so on 0 to 10 the number 1
   from the first band cut the second band short and stages came out four long. */
function pick(r, lo, hi, k, taken) {
  const room = hi - lo + 1;
  if (room <= 64) {
    const pool = [];
    for (let n = lo; n <= hi; n++) if (!taken.has(n)) pool.push(n);
    for (let i = pool.length - 1; i > 0; i--) { const j = r.int(i + 1); const t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
    const out = pool.slice(0, k);
    out.forEach(n => taken.add(n));
    return out;
  }
  const out = [];
  while (out.length < k) {
    const n = lo + r.int(room);
    if (!taken.has(n)) { taken.add(n); out.push(n); }
  }
  return out;
}

/* A stage: each band's share of the stage (40, 30, 30), no band asked for more distinct numbers than it holds, the
   remainder carried to the next band up; no target twice; at a new road its probe, first. */
export function generateStage(r, max, { isNew = false } = {}) {
  const size = STAGE_SIZE[max];
  if (!size) throw new Error('yonder: no road to ' + max);
  const bounds = bandBounds(max);
  const cap = bounds.map(([a, b]) => Math.max(0, b - a + 1));
  const share = BAND_SHARES.map(f => Math.round(f * size));
  share.push(size - share[0] - share[1]);
  const want = [0, 0, 0];
  let carry = 0;
  for (let i = 0; i < 3; i++) { const need = share[i] + carry; want[i] = Math.min(need, cap[i]); carry = need - want[i]; }
  const probe = isNew ? PROBE_TABLE[max] : undefined;
  const taken = new Set();
  const stage = [];
  if (probe !== undefined) { taken.add(probe); stage.push(probe); want[bandOf(probe, max)]--; }
  bounds.forEach(([lo, hi], i) => { stage.push(...pick(r, lo, hi, Math.max(0, want[i]), taken)); });
  /* the probe stays first; the rest in a seeded order */
  const rest = stage.slice(probe !== undefined ? 1 : 0);
  for (let i = rest.length - 1; i > 0; i--) { const j = r.int(i + 1); const t = rest[i]; rest[i] = rest[j]; rest[j] = t; }
  return probe !== undefined ? [probe].concat(rest) : rest;
}

/* percent absolute error: the distance in the road's own numbers over the road's length */
export function scoreEstimate(placement, target, range) {
  return Math.abs(placement - target) / (range.max - range.min);
}

const r2 = (xs, ys) => {
  const n = xs.length, mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) { const dx = xs[i] - mx, dy = ys[i] - my; sxy += dx * dy; sxx += dx * dx; syy += dy * dy; }
  return sxx > 0 && syy > 0 ? (sxy * sxy) / (sxx * syy) : 0;
};

/* how well a straight line and a logarithm each explain where a child put the targets; enough to call either only with
   a record of MIN_FIT estimates reaching all three bands. Measured on simulated children with 5 percent noise: ten
   estimates told a logarithmic child from a linear one as few as 80 times in 100 on 0 to 10000; twenty, at least 95 on
   every road and seed (docs/DECISIONS.md). */
export const MIN_FIT = 20;
export function fitModels(estimates, max) {
  const n = estimates.length;
  const xs = estimates.map(e => e.target), ys = estimates.map(e => e.placement);
  const bands = new Set(xs.map(t => bandOf(t, max)));
  return {
    n,
    spans: bands.size === 3,
    enough: n >= MIN_FIT && bands.size === 3,
    linearR2: n >= 2 ? r2(xs, ys) : 0,
    logR2: n >= 2 ? r2(xs.map(t => Math.log(Math.max(1, t))), ys) : 0,
    meanPAE: n ? estimates.reduce((a, e) => a + Math.abs(e.placement - e.target) / max, 0) / n : 1
  };
}

/* handoff section 5's routing table. `stagesAtBand` counts the stages before this one in a row at or under the band,
   read linearly. The model is kept for routing and never rendered (Y5). */
export function routeRange({ max, tier, estimates, stagesAtBand = 0, isTop = false }) {
  const fit = fitModels(estimates, max);
  const band = TIER_BANDS[Math.max(0, Math.min(TIER_BANDS.length - 1, tier))];
  const model = fit.enough ? (fit.logR2 > fit.linearR2 ? 'logarithmic' : 'linear') : null;
  let action;
  if (model === 'logarithmic') action = 'frontier';
  else if (fit.meanPAE > band) action = 'stay';
  else if (model === 'linear' && stagesAtBand + 1 >= 2) action = isTop ? 'rotate' : 'promote';
  else action = 'advance';
  return { action, model, fit };
}

/* Y9: the pitch of a target is linear in the target, in hertz: 220 at the start of the road, 880 at its end */
export const F_LOW = 220, F_HIGH = 880;
export function pitchFor(target, max) { return F_LOW + (F_HIGH - F_LOW) * target / max; }

/* THE RACE: a flipped card showing 1 or 2 for each move (docs/DECISIONS.md) */
export function raceMoves(r, count) {
  return Array.from({ length: count }, () => (r() < 0.5 ? 1 : 2));
}
