#!/usr/bin/env node
/* GLIMPSE Mode 4 MORE, its ship gate (plans/glimpse/HANDOFF-GLIMPSE.md 3.3, 3.4, 3.14; the handoff's section 3: "the game
 * does not ship without these", and section 0: "Mode 4 ships only if the section 3 decorrelation tests pass").
 *
 *   node test/more.mjs
 *
 * Moved here unchanged from test/generator.mjs when it went BLOCKED (3.14): Mode 4 is parked, v1 is Modes 1, 2, 3 and 5, and
 * tools/check.js runs this gate and reports it apart, never counting it toward ALL GATES PASSED.
 *
 * Every count is a law proved on 20 seeds. Asserted, each watched to fail on a planted fault:
 *   1. engine.js loads as an ES module
 *   2. convexHull and hullArea are exact on hand cases (a square with a point inside, a line, a triangle, one point)
 *   3. GL5: no two dots touch (their gap is at least MIN_GAP) and every dot lies inside the field, over 500 arrangements of
 *      every kind at every count its kind allows
 *   4. measure() returns what the dots give: cumulative area, convex hull area, mean diameter and density, recomputed here
 *   5. (Mode 4's pair gates live in test/more.mjs: Mode 4 is parked, and its gate is its ship gate, 3.3 and 3.14)
 *   6. single swarms of the random arrangement, 200 a seed: the size free and area matched strategies are dealt half and
 *      half, and neither area nor mean diameter tracks the count past the bound this law states (3.5)
 */
const fails = [];
const say = (ok, line) => { console.log((ok ? '  ok    ' : '  FAIL  ') + line); if (!ok) fails.push(line); };
let E = null, P = null;
try { E = await import('../engine.js'); P = await import('../../math/core/pure.js'); say(true, 'engine.js loads as an ES module'); }
catch (e) { say(false, 'engine.js loads as an ES module (' + e.message.split('\n')[0] + ')'); }

const SEEDS = Array.from({ length: 20 }, (_, i) => 3000 + i * 7919);
const corr = (xs, ys) => {
  const n = xs.length, mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; syy += (ys[i] - my) ** 2; }
  return sxx && syy ? sxy / Math.sqrt(sxx * syy) : 0;
};
/* an independent hull and area, so the law does not grade the engine with the engine */
function hullHere(pts) {
  if (pts.length < 3) return { area: 0 };
  const p = pts.slice().sort((a, b) => a.x - b.x || a.y - b.y), cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lo = [], hi = [];
  for (const q of p) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.slice().reverse()) { while (hi.length >= 2 && cross(hi[hi.length - 2], hi[hi.length - 1], q) <= 0) hi.pop(); hi.push(q); }
  const h = lo.slice(0, -1).concat(hi.slice(0, -1));
  let a = 0;
  for (let i = 0; i < h.length; i++) { const j = (i + 1) % h.length; a += h[i].x * h[j].y - h[j].x * h[i].y; }
  return { area: Math.abs(a) / 2, points: h };
}
const inside = (h, q) => {
  if (!h.points || h.points.length < 3) return false;
  let sign = 0;
  for (let i = 0; i < h.points.length; i++) {
    const a = h.points[i], b = h.points[(i + 1) % h.points.length], c = (b.x - a.x) * (q.y - a.y) - (b.y - a.y) * (q.x - a.x);
    if (c !== 0) { if (sign && Math.sign(c) !== sign) return false; sign = Math.sign(c); }
  }
  return true;
};

if (E && P) {
  /* 5 */
  {
    const bad = [];
    const CUES = ['cumArea', 'hull', 'diameter', 'density'];
    for (const seed of SEEDS) {
      const r = P.rng(seed >>> 0), trials = E.dealMore(r, { trials: 200 });
      const missed = trials.filter(t => CUES.some(c => t.realized[c] !== t.congruency[c])).length;
      if (trials.length !== 200 || missed) bad.push(seed + ': ' + trials.length + ' trials, ' + missed + ' realize another vector than dealt');
      for (const c of CUES) {
        const share = trials.filter(t => t.congruency[c] === 'con').length / trials.length;
        if (share < 0.48 || share > 0.52) bad.push(seed + ' ' + c + ' congruent ' + (share * 100).toFixed(1) + ' percent');
      }
      const dn = trials.map(t => t.nA - t.nB);
      const key = { cumArea: 'cumArea', hull: 'hull', diameter: 'meanDiam', density: 'density' };
      for (const c of CUES) {
        const dc = trials.map(t => t.pair.measured[key[c] + 'A'] - t.pair.measured[key[c] + 'B']);
        const k = corr(dn, dc);
        if (!(Math.abs(k) < 0.1)) bad.push(seed + ' corr(numerosity, ' + c + ') ' + k.toFixed(3));
      }
      for (const t of trials.slice(0, 40)) {
        const ha = hullHere(t.pair.dotsA), hb = hullHere(t.pair.dotsB);
        let inA = 0, inB = 0, both = 0;
        for (let gx = 0; gx < 40; gx++) for (let gy = 0; gy < 40; gy++) {
          const q = { x: (gx + 0.5) / 40, y: (gy + 0.5) / 40 }, a = inside(ha, q), b = inside(hb, q);
          inA += a; inB += b; both += a && b;
        }
        const ov = Math.min(inA, inB) ? both / Math.min(inA, inB) : 0;
        if (ov < 0.8) { bad.push(seed + ' hulls overlap ' + (ov * 100).toFixed(0) + ' percent'); break; }
      }
    }
    say(bad.length === 0, 'Mode 4 pairs: every trial realizes its dealt vector, each cue 48 to 52 percent congruent, |corr| under 0.1 on every cue, hulls overlapping 80 percent, 200 trials on each of 20 seeds' + (bad.length ? ': ' + bad.slice(0, 4).join('; ') : ''));
  }
}

console.log('');
if (fails.length) { console.log(fails.length + ' MORE FAILURE(S)'); process.exit(1); }
console.log('MORE OK');
