#!/usr/bin/env node
/* GLIMPSE P0: the stimulus generator's laws, written before the generator (plans/glimpse/HANDOFF-GLIMPSE.md 3.4, 3.5; the
 * handoff's section 3: "write the decorrelation test before the renderer").
 *
 *   node test/generator.mjs
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
  /* 2 */
  {
    const cases = [
      [[{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }, { x: 0.5, y: 0.5 }], 1, 4],
      [[{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }], 0, null],
      [[{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 0, y: 3 }], 6, 3],
      [[{ x: 0.3, y: 0.3 }], 0, null]
    ];
    const bad = cases.filter(([pts, area, corners]) => Math.abs(E.hullArea(pts) - area) > 1e-9 || (corners !== null && E.convexHull(pts).length !== corners))
      .map(([pts]) => pts.length + ' points gave area ' + E.hullArea(pts) + ' and ' + E.convexHull(pts).length + ' corners');
    say(bad.length === 0, 'convexHull and hullArea are exact on hand cases' + (bad.length ? ': ' + bad.join('; ') : ' (4 cases)'));
  }
  /* 3 and 4 */
  {
    const overlap = [], outside = [], mismeasured = [];
    let made = 0;
    for (const seed of SEEDS) {
      const r = P.rng(seed >>> 0);
      for (const [kind, lo, hi] of E.ARRANGEMENTS) {
        for (let t = 0; t < 25; t++) {
          const n = lo + r.int(hi - lo + 1);
          const dots = E.arrange(r, kind, n, t % 2 ? 'area' : 'size');
          made++;
          if (dots.length !== n) { overlap.push(kind + ' ' + n + ' gave ' + dots.length + ' dots'); continue; }
          for (let i = 0; i < dots.length; i++) {
            const d = dots[i];
            if (d.x - d.r < 0 || d.y - d.r < 0 || d.x + d.r > 1 || d.y + d.r > 1) outside.push(kind + ' ' + n);
            for (let j = i + 1; j < dots.length; j++) if (Math.hypot(d.x - dots[j].x, d.y - dots[j].y) - d.r - dots[j].r < E.MIN_GAP - 1e-12) overlap.push(kind + ' ' + n + ' dots ' + i + ' and ' + j);
          }
          const m = E.measure(dots), cum = dots.reduce((a, d) => a + Math.PI * d.r * d.r, 0), h = hullHere(dots).area, dia = dots.reduce((a, d) => a + 2 * d.r, 0) / dots.length;
          const close = (a, b) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));
          if (!close(m.cumArea, cum) || !close(m.hull, h) || !close(m.meanDiam, dia) || !(h > 0 ? close(m.density, cum / h) : m.density === 0)) mismeasured.push(kind + ' ' + n);
        }
      }
    }
    say(overlap.length === 0 && outside.length === 0, 'GL5: no two dots touch and every dot lies inside the field, over ' + made + ' arrangements of every kind' + (overlap.length || outside.length ? ': ' + overlap.concat(outside).slice(0, 4).join('; ') : ''));
    say(mismeasured.length === 0, 'measure() returns the area, hull, mean diameter and density the dots give, recomputed here' + (mismeasured.length ? ': ' + mismeasured.slice(0, 4).join('; ') : ''));
  }
  /* 6 */
  {
    const BOUND = 0.6, bad = [], seen = [];
    for (const seed of SEEDS) {
      const r = P.rng(seed >>> 0), swarms = E.dealRandomSwarms(r, { trials: 200, lo: 1, hi: 10 });
      const sizeFree = swarms.filter(s => s.strategy === 'size').length;
      const n = swarms.map(s => s.n), area = swarms.map(s => s.measured.cumArea), dia = swarms.map(s => s.measured.meanDiam);
      const ca = corr(n, area), cd = corr(n, dia);
      seen.push([ca, cd]);
      if (sizeFree !== 100 || Math.abs(ca) > BOUND || Math.abs(cd) > BOUND) bad.push(seed + ': ' + sizeFree + ' size free, corr area ' + ca.toFixed(2) + ', diameter ' + cd.toFixed(2));
    }
    const worst = seen.reduce((w, [a, d]) => [Math.max(w[0], Math.abs(a)), Math.max(w[1], Math.abs(d))], [0, 0]);
    say(bad.length === 0, 'single swarms: size free and area matched dealt half and half, and |corr| with the count under ' + BOUND + ' for area and for diameter (worst ' + worst.map(x => x.toFixed(2)).join(' and ') + ')' + (bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''));
  }
}

console.log('');
if (fails.length) { console.log(fails.length + ' GENERATOR FAILURE(S)'); process.exit(1); }
console.log('GENERATOR OK');
