/* GLIMPSE's rules (plans/glimpse/HANDOFF-GLIMPSE.md sections 3 and 4). Pure: no screen, no clock, no unseeded die; every
 * draw comes from the rng a caller hands in, so Node replays a seed. Positions and radii are in a unit field (0 to 1 both
 * ways); the page scales them.
 *
 *   convexHull, hullArea, measure    the four cues a dot array has (3.4)
 *   arrange(r, kind, n, strategy)    dice, finger, tally, line, random, tenframe; never two dots touching (GL5)
 *   dealRandomSwarms                  single swarms, size free and area matched half and half (3.5)
 *   generateSwarmPair, dealMore       Mode 4's pairs, each cue's congruency balanced by construction (3.4; Mode 4 parked)
 *   dealSession(r, { mode, tier })    FLASH, GROUPS, FRAME and SPREAD, twelve rounds
 *   scoreAnswer, flashMs, padsFor     a slow right answer counts and does not climb (GL3); pads four to a row (3.6)
 */
export const MIN_GAP = 0.012;
export const SESSION_LENGTH = 12;
export const ARRANGEMENTS = Object.freeze([
  Object.freeze(['dice', 1, 6]), Object.freeze(['finger', 1, 5]), Object.freeze(['tally', 1, 5]),
  Object.freeze(['line', 1, 10]), Object.freeze(['random', 1, 10]), Object.freeze(['tenframe', 1, 10])
]);
/* GL6: regular before irregular, one step a tier */
export const FLASH_ORDER = Object.freeze(['dice', 'finger', 'tally', 'line', 'random']);
/* Mode 4's congruency vectors (area, hull, diameter, density) that can occur and, at a sixth each, put every cue at one half
   (3.4; the other three that occur take no weight) */
export const MORE_VECTORS = Object.freeze(['cccc', 'ccci', 'cicc', 'icii', 'iiic', 'iiii']);
export const RATIOS = Object.freeze([2.0, 1.6, 1.4, 1.25, 1.15, 1.1]);
const CUES = ['cumArea', 'hull', 'diameter', 'density'];
const SLOW_MS = 2500;

const shuffle = (r, list) => { const a = list.slice(); for (let i = a.length - 1; i > 0; i--) { const j = r.int(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };

export function convexHull(points) {
  const p = points.map(q => ({ x: q.x, y: q.y })).sort((a, b) => a.x - b.x || a.y - b.y);
  if (p.length < 3) return p;
  const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lo = [], hi = [];
  for (const q of p) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.slice().reverse()) { while (hi.length >= 2 && cross(hi[hi.length - 2], hi[hi.length - 1], q) <= 0) hi.pop(); hi.push(q); }
  return lo.slice(0, -1).concat(hi.slice(0, -1));
}

export function hullArea(points) {
  const h = convexHull(points);
  if (h.length < 3) return 0;
  let a = 0;
  for (let i = 0; i < h.length; i++) { const j = (i + 1) % h.length; a += h[i].x * h[j].y - h[j].x * h[i].y; }
  return Math.abs(a) / 2;
}

export function measure(dots) {
  const cumArea = dots.reduce((a, d) => a + Math.PI * d.r * d.r, 0), hull = hullArea(dots);
  const meanDiam = dots.length ? dots.reduce((a, d) => a + 2 * d.r, 0) / dots.length : 0;
  return { cumArea, hull, meanDiam, density: hull > 0 ? cumArea / hull : 0 };
}

/* dots scattered in a square of `side` centred in the field, clear of each other and of `others` by MIN_GAP; with
   `corners` the first four stand in the square's corners, so the swarm's hull is the square (Mode 4's overlap, SPREAD's
   spread) */
function scatterBox(r, radii, side, others, corners) {
  const dots = [], c = 0.5, half = side / 2, CORNER = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  for (let i = 0; i < radii.length; i++) {
    const q = radii[i];
    let placed = null;
    for (let t = 0; t < 400 && !placed; t++) {
      let x, y;
      if (corners && i < 4) {
        x = c + CORNER[i][0] * (half - q) + (t ? (r() - 0.5) * 0.02 : 0);
        y = c + CORNER[i][1] * (half - q) + (t ? (r() - 0.5) * 0.02 : 0);
      } else {
        x = c - half + q + r() * Math.max(0, side - 2 * q);
        y = c - half + q + r() * Math.max(0, side - 2 * q);
      }
      if (x - q < 0 || x + q > 1 || y - q < 0 || y + q > 1) continue;
      if (others.every(o => Math.hypot(o.x - x, o.y - y) - o.r - q >= MIN_GAP) && dots.every(o => Math.hypot(o.x - x, o.y - y) - o.r - q >= MIN_GAP)) placed = { x, y, r: q };
    }
    if (!placed) return null;
    dots.push(placed);
  }
  return dots;
}

/* a pattern's relative positions moved to a random place that keeps every dot inside the field */
function place(r, rel, radii) {
  const minX = Math.min(...rel.map((p, i) => p.x - radii[i])), maxX = Math.max(...rel.map((p, i) => p.x + radii[i]));
  const minY = Math.min(...rel.map((p, i) => p.y - radii[i])), maxY = Math.max(...rel.map((p, i) => p.y + radii[i]));
  const ox = -minX + r() * Math.max(0, 1 - (maxX - minX)), oy = -minY + r() * Math.max(0, 1 - (maxY - minY));
  return rel.map((p, i) => ({ x: p.x + ox, y: p.y + oy, r: radii[i] }));
}

const PATTERNS = {
  dice: [null, [[0, 0]], [[-1, -1], [1, 1]], [[-1, -1], [0, 0], [1, 1]], [[-1, -1], [1, -1], [-1, 1], [1, 1]],
    [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]]],
  finger: n => Array.from({ length: n }, (_, i) => [i - 2, -[0, 0.35, 0.5, 0.35, 0][i]]),
  tally: n => Array.from({ length: n }, (_, i) => (i < 4 ? [i - 1.5, 0] : [0, 1]))
};

/* the mean radius a swarm starts from: size free is drawn apart from the count; area matched fixes the swarm's total area
   and lets each dot shrink as the count grows. The total is centred on what size free swarms give at the middle count, so
   the two strategies' areas and diameters overlap rather than sort the trials by strategy (3.5) */
function radiusFor(r, n, strategy) {
  /* ⛔ the first ranges were narrow (radius 0.03 to 0.05, total area 0.018 to 0.038), so each strategy's own tie to the count
     ruled, and the worst seed's correlation reached 0.63; both are log uniform over a wider span now, noise that owes the
     count nothing */
  const logUniform = (lo, hi) => lo * Math.pow(hi / lo, r());
  return strategy === 'area' ? Math.sqrt(logUniform(0.01, 0.05) / (Math.PI * n)) : logUniform(0.022, 0.06);
}

export function arrange(r, kind, n, strategy = 'size') {
  let r0 = radiusFor(r, n, strategy);
  const jitter = () => 0.9 + 0.2 * r();
  if (kind === 'random') {
    for (let k = 0; k < 30; k++) {
      const radii = Array.from({ length: n }, () => r0 * jitter()), side = 0.6 + 0.4 * r();
      const dots = scatterBox(r, radii, side, [], false);
      if (dots) return dots;
      r0 *= 0.85;
    }
    throw new Error('glimpse: no room for ' + n + ' random dots');
  }
  let rel;
  if (kind === 'line') {
    const S = 0.095;
    r0 = Math.min(r0, (S - MIN_GAP - 0.004) / 2.2);
    rel = Array.from({ length: n }, (_, i) => ({ x: (i - (n - 1) / 2) * S, y: 0 }));
  } else if (kind === 'tenframe') {
    const S = 0.16;
    r0 = Math.min(r0, (S - MIN_GAP - 0.004) / 2.2);
    rel = Array.from({ length: n }, (_, i) => ({ x: ((i % 5) - 2) * S, y: (Math.floor(i / 5) - 0.5) * S }));
  } else {
    const S = Math.max(0.12, 2.2 * r0 + MIN_GAP + 0.004);
    const pat = kind === 'dice' ? PATTERNS.dice[n] : PATTERNS[kind] ? PATTERNS[kind](n) : null;
    if (!pat || pat.length !== n) throw new Error('glimpse: no ' + kind + ' arrangement of ' + n);
    rel = pat.map(([a, b]) => ({ x: a * S, y: b * S }));
  }
  return place(r, rel, rel.map(() => r0 * jitter()));
}

export function generateSwarm(r, { n, strategy = 'size', kind = 'random' }) {
  const dots = arrange(r, kind, n, strategy);
  return { n, strategy, kind, dots, measured: measure(dots) };
}

/* single swarms of the random arrangement: the two strategies exactly half and half, shuffled */
export function dealRandomSwarms(r, { trials = 200, lo = 1, hi = 10 } = {}) {
  const strategies = shuffle(r, Array.from({ length: trials }, (_, i) => (i < trials / 2 ? 'size' : 'area')));
  return strategies.map(strategy => generateSwarm(r, { n: lo + r.int(hi - lo + 1), strategy }));
}

/* a Mode 4 pair realizing a congruency vector for the more numerous swarm, both in one region: the wider swarm stands on its
   square's corners so its hull holds the narrower's; a pair that misses its vector is built again */
export function generateSwarmPair(r, { nA, nB, congruency, maxSpread = 0.92 }) {
  const aMore = nA > nB, nM = Math.max(nA, nB), nL = Math.min(nA, nB), even = Math.sqrt(nL / nM);
  for (let attempt = 0; attempt < 4000; attempt++) {
    const rL = 0.012 + 0.012 * r();
    let rho;
    if (congruency.diameter === 'con') rho = 1.1 + 0.4 * r();
    else if (congruency.cumArea === 'con') { const lo = even * 1.06; if (lo >= 0.94) continue; rho = lo + (0.94 - lo) * r(); }
    else { const hi = even * 0.94; if (hi <= 0.5) continue; rho = 0.5 + (hi - 0.5) * r(); }
    const sL = 0.35 + 0.3 * r();
    const sM = congruency.hull === 'con' ? sL * (1.1 + 0.45 * r()) : sL / (1.1 + 0.45 * r());
    if (sM > maxSpread || sL > maxSpread) continue;
    const radM = Array.from({ length: nM }, () => rL * rho * (0.97 + 0.06 * r()));
    const radL = Array.from({ length: nL }, () => rL * (0.97 + 0.06 * r()));
    const moreOutside = sM >= sL;
    const outer = scatterBox(r, moreOutside ? radM : radL, moreOutside ? sM : sL, [], true);
    if (!outer) continue;
    const inner = scatterBox(r, moreOutside ? radL : radM, moreOutside ? sL : sM, outer, false);
    if (!inner) continue;
    const more = moreOutside ? outer : inner, less = moreOutside ? inner : outer;
    const mm = measure(more), ml = measure(less);
    const realized = { cumArea: mm.cumArea > ml.cumArea ? 'con' : 'inc', hull: mm.hull > ml.hull ? 'con' : 'inc', diameter: mm.meanDiam > ml.meanDiam ? 'con' : 'inc', density: mm.density > ml.density ? 'con' : 'inc' };
    if (CUES.some(c => realized[c] !== congruency[c])) continue;
    const mA = aMore ? mm : ml, mB = aMore ? ml : mm;
    return {
      dotsA: aMore ? more : less, dotsB: aMore ? less : more, realized,
      measured: { cumAreaA: mA.cumArea, cumAreaB: mB.cumArea, hullA: mA.hull, hullB: mB.hull, meanDiamA: mA.meanDiam, meanDiamB: mB.meanDiam, densityA: mA.density, densityB: mB.density }
    };
  }
  throw new Error('glimpse: no pair of ' + nA + ' and ' + nB + ' realizes ' + JSON.stringify(congruency));
}

/* a pair's mirror: the same two swarms with their areas and their hulls traded (each dot's radius and each swarm's spread
   scaled about the centre), so the more numerous swarm's area, hull and density differences are exactly negated at the same
   counts; its diameter's difference follows the area. null if the scaled swarms would leave the field or touch. */
function mirrorPair(pair, nA, nB) {
  const aMore = nA > nB, X = aMore ? pair.dotsA : pair.dotsB, Y = aMore ? pair.dotsB : pair.dotsA;
  const mX = measure(X), mY = measure(Y);
  if (!(mX.cumArea > 0 && mY.cumArea > 0 && mX.hull > 0 && mY.hull > 0)) return null;
  const scale = (dots, k, s) => dots.map(d => ({ x: 0.5 + (d.x - 0.5) * s, y: 0.5 + (d.y - 0.5) * s, r: d.r * k }));
  const X2 = scale(X, Math.sqrt(mY.cumArea / mX.cumArea), Math.sqrt(mY.hull / mX.hull));
  const Y2 = scale(Y, Math.sqrt(mX.cumArea / mY.cumArea), Math.sqrt(mX.hull / mY.hull));
  const all = X2.concat(Y2);
  for (let i = 0; i < all.length; i++) {
    const d = all[i];
    if (d.x - d.r < 0 || d.y - d.r < 0 || d.x + d.r > 1 || d.y + d.r > 1) return null;
    for (let j = i + 1; j < all.length; j++) if (Math.hypot(d.x - all[j].x, d.y - all[j].y) - d.r - all[j].r < MIN_GAP) return null;
  }
  const mm = measure(X2), ml = measure(Y2);
  const realized = { cumArea: mm.cumArea > ml.cumArea ? 'con' : 'inc', hull: mm.hull > ml.hull ? 'con' : 'inc', diameter: mm.meanDiam > ml.meanDiam ? 'con' : 'inc', density: mm.density > ml.density ? 'con' : 'inc' };
  const mA = aMore ? mm : ml, mB = aMore ? ml : mm;
  return {
    dotsA: aMore ? X2 : Y2, dotsB: aMore ? Y2 : X2, realized,
    measured: { cumAreaA: mA.cumArea, cumAreaB: mB.cumArea, hullA: mA.hull, hullB: mB.hull, meanDiamA: mA.meanDiam, meanDiamB: mB.meanDiam, densityA: mA.density, densityB: mB.density }
  };
}
/* the three vectors a pair is built for, and the vector its mirror lands on: together the six weighted vectors (3.4) */
const MIRROR_OF = Object.freeze({ cccc: 'iiii', ccci: 'iiic', cicc: 'icii' });
const vectorOf = letters => { const v = {}; CUES.forEach((c, k) => { v[c] = letters[k] === 'c' ? 'con' : 'inc'; }); return v; };

/* Mode 4's trials, in mirrored couples: half the trials built for cccc, ccci and cicc in turn, each with its mirror at the
   same counts and sides; the more numerous side is A for half the couples. Each cue is congruent in exactly half the
   trials, and within a couple the area, hull and density differences cancel against the same count difference.
   ⛔ the first deal balanced congruency only by sign: a congruent trial's differences ran larger than an incongruent one's,
   and the correlation with the count difference reached 0.44 */
export function dealMore(r, { trials = 200 } = {}) {
  const couples = Math.floor(trials / 2), BUILT = Object.keys(MIRROR_OF);
  const vectors = shuffle(r, Array.from({ length: couples }, (_, i) => BUILT[i % BUILT.length]));
  const sides = shuffle(r, Array.from({ length: couples }, (_, i) => (i < couples / 2 ? 'A' : 'B')));
  const out = [];
  vectors.forEach((v, i) => {
    /* ⛔ the first deal gave up on cicc within 60 tries: there the more numerous swarm is the inner one, and its mirror,
       spread out by the hulls' ratio, left the field or met the other swarm's dots. A pair built for mirroring keeps both
       spreads to 0.7, so its mirror has room */
    for (let attempt = 0; attempt < 300; attempt++) {
      const ratio = RATIOS[r.int(RATIOS.length)], few = 6 + r.int(7), many = Math.max(few + 1, Math.round(few * ratio));
      const nA = sides[i] === 'A' ? many : few, nB = sides[i] === 'A' ? few : many;
      const pair = generateSwarmPair(r, { nA, nB, congruency: vectorOf(v), maxSpread: 0.7 });
      const mirror = mirrorPair(pair, nA, nB);
      if (!mirror || CUES.map(c => mirror.realized[c][0]).join('') !== MIRROR_OF[v]) continue;
      out.push({ nA, nB, ratio, congruency: vectorOf(v), realized: pair.realized, pair });
      out.push({ nA, nB, ratio, congruency: vectorOf(MIRROR_OF[v]), realized: mirror.realized, pair: mirror, mirror: true });
      return;
    }
    throw new Error('glimpse: no mirrored couple for ' + v);
  });
  return shuffle(r, out);
}

export function flashMs(count, setting) {
  if (setting === 'long') return 1500;
  if (setting === '250' || setting === '400' || setting === '600') return Number(setting);
  return count <= 5 ? 400 : 350;
}

/* FLASH: at tier t the arrangements up to FLASH_ORDER[t], three of the twelve its own, the rest any it has reached; counts
   1 to 5; the size free and area matched strategies take turns */
function dealFlash(r, tier) {
  const t = Math.max(0, Math.min(FLASH_ORDER.length - 1, tier));
  const kinds = shuffle(r, Array.from({ length: SESSION_LENGTH }, (_, i) => (t === 0 ? 'dice' : i < 3 ? FLASH_ORDER[t] : FLASH_ORDER[r.int(t + 1)])));
  return kinds.map((kind, i) => {
    const count = 1 + r.int(5), strategy = i % 2 ? 'area' : 'size';
    return { mode: 'flash', ask: 'howMany', arrangement: kind, count, answer: count, strategy, dots: arrange(r, kind, count, strategy) };
  });
}

/* a split of T that is neither five based nor the given one, or null */
function otherSplit(r, T) {
  const options = [];
  for (let a = 1; a <= T - a; a++) if (a !== 5 && T - a !== 5) options.push([a, T - a]);
  return options.length ? options[r.int(options.length)] : null;
}

/* two parts side by side, each drawn as a dice face (six or fewer) or a ten frame row, in its own half of the field */
function groupDots(r, parts) {
  const half = (n, dx) => arrange(r, n <= 6 ? 'dice' : 'tenframe', n, 'size').map(d => ({ x: d.x * 0.5 + dx, y: d.y * 0.5 + 0.25, r: d.r * 0.5 }));
  return half(parts[0], 0).concat(half(parts[1], 0.5));
}

/* GROUPS: one total served twice, five based and another way; of the other ten, a tier's share built on five (eight at
   tier 0, six at tier 1, four after) */
function dealGroups(r, tier) {
  const T = 6 + r.int(5), twin = otherSplit(r, T);
  const fiveCount = tier <= 0 ? 8 : tier === 1 ? 6 : 4;
  const flags = shuffle(r, Array.from({ length: SESSION_LENGTH - 2 }, (_, i) => i < fiveCount));
  const splits = [[5, T - 5], twin || [5, T - 5]];
  for (const five of flags) {
    if (five) { const t2 = 6 + r.int(5); splits.push([5, t2 - 5]); }
    else { let s = null; while (!s) s = otherSplit(r, 5 + r.int(6)); splits.push(s); }
  }
  return shuffle(r, splits).map(p => {
    const parts = r() < 0.5 ? p : [p[1], p[0]], count = parts[0] + parts[1];
    return { mode: 'groups', ask: 'total', arrangement: 'groups', parts, count, answer: count, dots: groupDots(r, parts) };
  });
}

/* FRAME: how many and what is missing to ten, alternating */
function dealFrame(r) {
  return Array.from({ length: SESSION_LENGTH }, (_, i) => {
    const count = 1 + r.int(10), ask = i % 2 ? 'complement' : 'howMany';
    return { mode: 'frame', ask, arrangement: 'tenframe', count, answer: ask === 'complement' ? 10 - count : count, dots: arrange(r, 'tenframe', count, 'size') };
  });
}

/* one side of a SPREAD round: n dots in a centred square of `side`, on its corners so its hull is the square */
function side(r, n, radius, sideLen) {
  for (let k = 0; k < 30; k++) {
    const radii = Array.from({ length: n }, () => radius * (0.97 + 0.06 * r()));
    const dots = scatterBox(r, radii, sideLen, [], true);
    if (dots) return { n, dots, measured: measure(dots) };
    radius *= 0.9;
  }
  throw new Error('glimpse: no room for a spread of ' + n);
}

/* SPREAD: four each of the same count spread apart, fewer but wider, and the same count in bigger dots; which side is which
   drawn by the rng; the answer is the side with more, or the same */
function dealSpread(r) {
  const types = shuffle(r, Array.from({ length: SESSION_LENGTH }, (_, i) => ['sameSpread', 'fewerWider', 'sameSize'][i % 3]));
  return types.map(roundType => {
    let a, b;
    for (let tries = 0; tries < 20; tries++) {
      if (roundType === 'sameSpread') {
        const n = 4 + r.int(6), rad = 0.03 + 0.01 * r(), s1 = 0.3 + 0.1 * r();
        a = side(r, n, rad, s1); b = side(r, n, rad, s1 * (1.7 + 0.3 * r()));
        if (Math.max(a.measured.hull, b.measured.hull) >= 1.5 * Math.min(a.measured.hull, b.measured.hull)) break;
      } else if (roundType === 'fewerWider') {
        const few = 3 + r.int(5), many = few + 1 + r.int(3), rad = 0.03 + 0.01 * r(), s1 = 0.3 + 0.08 * r();
        a = side(r, few, rad, Math.min(0.9, s1 * (1.8 + 0.4 * r()))); b = side(r, many, rad, s1);
        if (a.measured.hull > b.measured.hull) break;
      } else {
        const n = 4 + r.int(6), s1 = 0.55 + 0.2 * r(), rad = 0.025 + 0.01 * r();
        a = side(r, n, rad, s1); b = side(r, n, rad * (1.5 + 0.3 * r()), s1);
        if (Math.max(a.measured.meanDiam, b.measured.meanDiam) >= 1.4 * Math.min(a.measured.meanDiam, b.measured.meanDiam)) break;
      }
    }
    if (r() < 0.5) [a, b] = [b, a];
    const answer = a.n > b.n ? 'left' : a.n < b.n ? 'right' : 'same';
    return { mode: 'spread', ask: 'sameOrMore', roundType, a, b, answer };
  });
}

export function dealSession(r, { mode = 'flash', tier = 0 } = {}) {
  if (mode === 'groups') return dealGroups(r, tier);
  if (mode === 'frame') return dealFrame(r);
  if (mode === 'spread') return dealSpread(r);
  return dealFlash(r, tier);
}

/* GL3: never wrong for being slow; a right answer past 2.5 s counts and does not climb the tier */
export function scoreAnswer(round, answer, rtMs) {
  const correct = answer === round.answer;
  return { correct, climbs: correct && rtMs <= SLOW_MS };
}

/* 3.6: a round's pads are its range and no more */
export function padsFor(round) {
  if (round.mode === 'spread') return ['left', 'same', 'right'];
  if (round.mode === 'groups') return [5, 6, 7, 8, 9, 10];
  if (round.mode === 'frame') return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  return [1, 2, 3, 4, 5];
}
export function padRows(pads) {
  const rows = Math.ceil(pads.length / 4), per = Math.ceil(pads.length / rows), out = [];
  for (let i = 0; i < pads.length; i += per) out.push(pads.slice(i, i + per));
  return out;
}
