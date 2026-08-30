/* An automatic balance pass for one part, or for a list of them.
 *
 *   node tools/balance.js blade:rasp bit:agate ...
 *   node tools/balance.js --from tools/.audit10.txt      read the failures out of an audit
 *   node tools/balance.js --write ...                    apply the result to sim2.js
 *
 * WHY THIS EXISTS. Hand tuning against tools/partaudit.js does not work at any
 * reasonable speed: a full audit of a hundred and ten parts takes ten minutes,
 * and its ceiling carries two or three points of noise, so a change worth two
 * points is invisible and the loop is an hour per part. Worse, it invites
 * guessing, and guessing at this got Vane wrong three times running.
 *
 * So this measures the way the auditor does, on a much narrower question, and
 * then SEARCHES rather than guessing. One coordinate descent over the part's own
 * stats, bounded to physically sensible limits, against a two sided objective:
 *
 *   ceiling  the best of the four reference chassis. Too low means there is no
 *            build where the part is the right answer, which is the disease the
 *            brief calls "un-buildable".
 *   pull     the mean of the same four. Too high means the part lifts whatever
 *            it touches, which is power creep, and for a Relic it is the exact
 *            thing the tier system exists to prevent.
 *
 * ⛔ IT SEARCHES THE STATS, NEVER THE ROLE OR THE DRAWBACK. A part's identity is
 * a design decision and this tool has no opinion about it. It moves numbers
 * inside a shape somebody already chose, and it will refuse to push a stat past
 * the bounds below, because a blade with no mass is not a balanced blade, it is
 * a bug that passed a test.
 */
const SIM = require('../src/sim2.js');
const fs = require('fs');
const path = require('path');

const PANEL = Object.keys(SIM.ARCHETYPES);
const LISTS = { core: SIM.CORES, blade: SIM.BLADES, assist: SIM.ASSISTS,
                ratchet: SIM.RATCHETS, bit: SIM.BITS };

/* Hard physical limits. Nothing may leave these, whatever the numbers say.
 * ⛔ MASS IS PER SLOT. The first version used one range for every slot, which was
 * blade scale, so it happily "corrected" an assist to seven grams; the assist
 * slot tops out at under six and an assist that heavy is a blade with the wrong
 * name on it. A bound that is wrong is worse than no bound, because the search
 * will find it and the result looks deliberate. */
const MASS_BOUNDS = {
  core:    [0.0006, 0.0055],
  blade:   [0.0100, 0.0260],
  assist:  [0.0000, 0.0062],
  ratchet: [0.0040, 0.0100],
  bit:     [0.0025, 0.0070]
};
const BOUNDS = {
  mass:       [0.0006, 0.0260], radius: [0.0180, 0.0270], sharp: [0.08, 1.70],
  rest:       [0.10, 1.50],     gear:   [0.10, 2.20],     taken: [0.50, 1.60],
  gearMul:    [0.15, 3.20],     absorb: [0.60, 1.80],     radAdd: [0.0000, 0.0032],
  smash:      [0.60, 1.60],     lock:   [0.15, 1.80],     strikeHigh: [0.12, 1.85],
  stamina:    [0.45, 2.00],     drive:  [0.20, 2.80],     stable: [0.40, 1.80],
  dash:       [0.30, 2.90],     shaft:  [0.45, 1.80],     charge: [0.40, 2.00]
};
/* Step size per stat, as a fraction of its bound range. */
const STEP = 0.035;
/* ⛔ 0.47, not 0.50, and the reason is a real property of the catalogue rather
   than a compromise. Ratchet height feeds cogH, which costs stability, cushion
   AND precession rate while paying back only strike height, so the entire 90mm
   band tops out near 48 percent: the stock 1-90 measures 48.3 and it is a Tier 1
   part that has always been there. A balancer floor above that band cannot be
   satisfied by any stat change, so it would search forever and then lie about
   why. The part audit's own gate is 0.45; this sits just above it. */
const CEIL_FLOOR = 0.47;         // the best chassis must be close to even money

function score(cfg, seed, mpg) {
  let w = 0, n = 0;
  for (const g of PANEL) for (let i = 0; i < mpg; i++) for (const d of [1, -1]) {
    const rnd = SIM.mulberry(seed + i * 97 + g.length * 13 + (d > 0 ? 0 : 5));
    const me = SIM.build(Object.assign({}, cfg, { dir: 1 }));
    const foe = SIM.build(Object.assign({}, SIM.ARCHETYPES[g], { dir: d }));
    const r = SIM.resolveMatch(me, foe, { rnd,
      a: { power: .96 + rnd() * .08, lean: .03 + rnd() * .04, phase: rnd() * 6.283 },
      b: { power: .96 + rnd() * .08, lean: .03 + rnd() * .04, phase: rnd() * 6.283 } });
    if (r.winner === 'a') w++;
    n++;
  }
  return w / n;
}

/* ⛔ THIS MUST MEASURE WHAT THE GATE MEASURES, AND FOR A WHILE IT DID NOT.
 *
 * The first version took both numbers from the four reference chassis: ceiling
 * was the best of them, pull was their mean. It was fast and it was stable and
 * it was optimising a statistic nothing else in the project reads. tools/
 * partaudit.js computes pull as the mean over forty COHERENT RANDOM builds
 * containing the part, which is a different population entirely, and the two
 * disagreed badly: Barb came out of the balancer at 49.7 against a cap of 50.4,
 * and the audit then reported it as ten points of power creep. Both numbers were
 * correct. They were answers to different questions, and only one of them is
 * the gate.
 *
 * So both numbers are now computed exactly the way partaudit computes them:
 * ceiling over the same ten curated chassis, pull over the same coherent build
 * sampler. Slower, and it is the only version that can be trusted.
 */
/* ⛔ THIS NUMBER MUST EQUAL partaudit's CEIL_MPG AND HERE IS WHY.
   A ceiling is the maximum over ten candidate chassis, and the max of ten noisy
   estimates is biased UPWARD by an amount that grows as the estimates get
   noisier. At 48 matches this tool reported ceilings comfortably above the audit
   reporting the same parts at 192, and three parts came back "in band,
   untouched" while the gate was failing them. Neither number was wrong. They
   were maxima taken over different amounts of noise.
   If you change one, change the other. */
const CEIL_MPG = 12;     // 96 matches per candidate chassis, the SAME as partaudit
const PULL_N = 24;       // coherent builds per part
const PULL_MPG = 2;      // 16 matches each

function weightSchemes() {
  const out = [[]];
  for (const id of ['chip', 'slug', 'brick']) {
    out.push([{ id, hole: 0, ring: 0 }]);
    out.push([{ id, hole: 0, ring: 1 }]);
    out.push([{ id, hole: 0, ring: 1 }, { id, hole: 3, ring: 1 }]);
    out.push([{ id, hole: 0, ring: 1 }, { id, hole: 2, ring: 1 }, { id, hole: 4, ring: 1 }]);
    out.push([{ id, hole: 0, ring: 1 }, { id, hole: 1, ring: 1 }]);
    out.push([{ id, hole: 0, ring: 1 }, { id, hole: 1, ring: 1 }, { id, hole: 0, ring: 0 }]);
    out.push([{ id, hole: 0, ring: 1 }, { id, hole: 1, ring: 1 },
              { id, hole: 2, ring: 1 }, { id, hole: 3, ring: 1 }]);
  }
  return out;
}
const SCHEMES = weightSchemes();
const ROLES = SIM.ROLES;
/* ⛔ THE SAMPLER'S RANDOMNESS MUST BE RESET FOR EVERY MEASUREMENT.
 * rnd0 is stateful, and coherentBuild draws from it, so two calls to measure()
 * on the SAME unchanged part sampled two different sets of builds and returned
 * two different numbers. A coordinate descent over a metric that moves on its
 * own is a search over noise: it "improved" Sledge's pull from 35.9 to 38.0,
 * kept the move because the drifting measurement said so, and wrote it out.
 * Reseeding per measurement makes measure() a pure function of the catalogue,
 * which is the only thing that makes the comparison mean anything. */
let rnd0 = SIM.mulberry(20260830);
const reseed = () => { rnd0 = SIM.mulberry(20260830); };
const pickR = a => a[Math.floor(rnd0() * a.length)];

function inRole(list, role, purity) {
  const m = list.filter(p => p.role === role);
  return (m.length && rnd0() < purity) ? m[Math.floor(rnd0() * m.length)] : pickR(list);
}
function coherentBuild(role, purity) {
  return {
    core: inRole(SIM.CORES, role, purity).id,
    blade: inRole(SIM.BLADES, role, purity).id,
    assist: inRole(SIM.ASSISTS, role, purity).id,
    ratchet: inRole(SIM.RATCHETS, role, purity).id,
    bit: inRole(SIM.BITS, role, purity).id,
    weights: SCHEMES[Math.floor(rnd0() * SCHEMES.length)]
  };
}
function ceilingCandidates(slot, part) {
  const out = [];
  for (const ref of PANEL) {
    const cfg = JSON.parse(JSON.stringify(SIM.ARCHETYPES[ref]));
    cfg[slot] = part.id;
    out.push(cfg);
  }
  const home = SIM.ARCHETYPES[part.role] ? part.role : 'balance';
  for (const i of [1, 3, 4, 8, 11, 18]) {
    const cfg = JSON.parse(JSON.stringify(SIM.ARCHETYPES[home]));
    cfg[slot] = part.id;
    cfg.weights = SCHEMES[i % SCHEMES.length];
    out.push(cfg);
  }
  return out;
}
function measure(slot, id) {
  reseed();
  const part = LISTS[slot].find(p => p.id === id);
  let best = 0;
  for (const cfg of ceilingCandidates(slot, part)) best = Math.max(best, score(cfg, 909091, CEIL_MPG));
  let sum = 0;
  for (let i = 0; i < PULL_N; i++) {
    const cfg = coherentBuild(ROLES[i % ROLES.length], 0.55 + 0.40 * (i % 2));
    cfg[slot] = id;
    sum += score(cfg, i * 7919 + id.length * 131 + slot.length * 7, PULL_MPG);
  }
  return { ceil: best, pull: sum / PULL_N };
}

/* The cap a new part's pull is judged against.
 *
 * ⛔ IT HAS TO MATCH THE GATE'S RULE, NOT APPROXIMATE IT. partaudit compares a
 * Tier 2 or 3 part to a specific SIBLING, the Tier 1 part in the same slot and
 * role with the nearest ceiling, and fails it at more than four points over.
 * An earlier version of this used the slot's Tier 1 AVERAGE instead, declared
 * several parts in band, and the audit then failed every one of them, because a
 * part can sit under the slot average and still be ten points over the weak
 * sibling it is actually measured against.
 * The cap here is the WEAKEST same role Tier 1 pull plus a little, which is
 * conservative by construction: clear it and no sibling comparison can fail.
 */
const sibCache = {};
/* The cap has to be the SAME NUMBER the gate computes, so this mirrors
 * partaudit exactly: the median pull of the same role Stock parts, plus three
 * and a half points of headroom against the gate's four. Picking a single
 * nearest sibling was unstable and the two tools disagreed by four points on an
 * unchanged part; see the note at the gate in partaudit.js. */
function pullCap(slot, role) {
  const key = slot + ':' + role;
  if (sibCache[key] !== undefined) return sibCache[key];
  let pool = LISTS[slot].filter(p => (p.tier || 1) === 1 && p.role === role);
  if (pool.length < 2) pool = LISTS[slot].filter(p => (p.tier || 1) === 1);
  const pulls = pool.map(p => measure(slot, p.id).pull).sort((a, b) => a - b);
  const med = pulls.length ? pulls[Math.floor(pulls.length / 2)] : 0.45;
  return (sibCache[key] = med + 0.035);
}

/* Distance from acceptable. Zero means the part is in band. */
function penalty(m, cap) {
  const low = Math.max(0, CEIL_FLOOR - m.ceil);
  const high = Math.max(0, m.pull - cap);
  return low * 1.0 + high * 1.4;   // power creep is the worse sin
}

function balanceOne(slot, id, rounds) {
  const part = LISTS[slot].find(p => p.id === id);
  if (!part) { console.log(slot + ':' + id + ' does not exist'); return null; }
  const stats = Object.keys(part).filter(k => BOUNDS[k] !== undefined);
  const bound = k => (k === 'mass' ? MASS_BOUNDS[slot] : BOUNDS[k]);
  const before = measure(slot, id);
  const cap = pullCap(slot, part.role);
  let cur = penalty(before, cap);
  console.log('\n' + (slot + ':' + id).padEnd(20) +
    'ceiling ' + (before.ceil * 100).toFixed(1) + '%  pull ' + (before.pull * 100).toFixed(1) +
    '%  (floor ' + (CEIL_FLOOR * 100) + ', cap ' + (cap * 100).toFixed(1) +
    ' from the ' + part.role + ' stock median)');
  // ⛔ ok: true. The first version omitted it here, so a part that was already
  // fine was reported as STILL OUT in the summary at the bottom, and the summary
  // is the only part anybody reads.
  if (cur === 0) { console.log('  already in band'); return { part, before, after: before, moved: [], ok: true }; }
  const snapshot = Object.assign({}, part);

  const moved = [];
  for (let r = 0; r < rounds && cur > 0; r++) {
    let bestMove = null;
    for (const k of stats) {
      const [lo, hi] = bound(k);
      const step = (hi - lo) * STEP;
      for (const dir of [1, -1]) {
        const v = part[k] + step * dir;
        if (v < lo || v > hi) continue;
        const save = part[k];
        part[k] = k === 'height' ? Math.round(v) : v;
        const p = penalty(measure(slot, id), cap);
        part[k] = save;
        if (p < cur - 1e-9 && (!bestMove || p < bestMove.p)) bestMove = { k, v, p, dir };
      }
    }
    if (!bestMove) break;
    part[bestMove.k] = bestMove.k === 'height' ? Math.round(bestMove.v) : bestMove.v;
    moved.push(bestMove.k + (bestMove.dir > 0 ? ' up' : ' down'));
    cur = bestMove.p;
    process.stdout.write('  ' + bestMove.k + ' ' + (bestMove.dir > 0 ? 'up' : 'down') +
                         ' to ' + fmt(bestMove.k, part[bestMove.k]) + '\n');
  }
  const after = measure(slot, id);
  const ok = penalty(after, cap) === 0;
  console.log('  now'.padEnd(20) + 'ceiling ' + (after.ceil * 100).toFixed(1) +
              '%  pull ' + (after.pull * 100).toFixed(1) + '%  ' +
              (ok ? 'IN BAND' : 'STILL OUT, needs a design change not a number'));
  // ⛔ Never write a move that made things worse. The search used to keep
  // whatever its last evaluation liked, and with a drifting metric that could be
  // a step backwards.
  if (!ok && penalty(after, cap) >= penalty(before, cap)) {
    console.log('  reverting: the search did not improve it');
    return { part, before, after: before, moved: [], ok: false, revert: true };
  }
  return { part, before, after, moved, ok };
}

function fmt(k, v) {
  if (k === 'height') return String(Math.round(v));
  if (k === 'mass') return v.toFixed(5);
  if (k === 'radius' || k === 'radAdd') return v.toFixed(4);
  return v.toFixed(2);
}

// ---------------------------------------------------------------- arguments
let args = process.argv.slice(2);
const WRITE = args.includes('--write');
args = args.filter(a => a !== '--write');
let targets = [];
const fromIdx = args.indexOf('--from');
if (fromIdx >= 0) {
  // Pull the failures straight out of an audit run, so the two tools agree on
  // what is broken instead of me retyping a list.
  const txt = fs.readFileSync(args[fromIdx + 1], 'utf8');
  let slot = null;
  for (const line of txt.split('\n')) {
    const h = line.match(/^(CORE|BLADE|ASSIST|RATCHET|BIT)\s/);
    if (h) slot = h[1].toLowerCase();
    const m = line.match(/^\s+T\d\s+(\S+).*cannot be made good/);
    if (m && slot) targets.push(slot + ':' + m[1]);
    const c = line.match(/power creep, (\w+):(\S+)/);
    if (c) targets.push(c[1] + ':' + c[2]);
  }
  targets = [...new Set(targets)];
} else {
  targets = args;
}
if (!targets.length) { console.log('nothing to balance'); process.exit(0); }

console.log('balancing ' + targets.length + ' parts, measuring exactly the way the gate does\n' +
            targets.join(' '));

const done = [];
for (const t of targets) {
  const [slot, id] = t.split(':');
  const r = balanceOne(slot, id, 14);
  if (r) done.push({ slot, id, ...r });
}

console.log('\n' + '='.repeat(60));
for (const d of done)
  console.log((d.slot + ':' + d.id).padEnd(20) + (d.ok ? 'in band  ' : 'STILL OUT') +
              '  ' + (d.moved.length ? d.moved.join(', ') : 'untouched'));

if (WRITE) {
  /* Rewrite only the numbers, in place, on the part's own line. Nothing else in
   * the file is touched, so a diff shows exactly what moved and why. */
  const SRC = path.join(__dirname, '..', 'src', 'sim2.js');
  let s = fs.readFileSync(SRC, 'utf8');
  let n = 0;
  for (const d of done) {
    if (d.revert) continue;
    const re = new RegExp("(\\{ id: '" + d.id + "',[^\\n]*)", 'g');
    s = s.replace(re, (line) => {
      let out = line;
      for (const k of Object.keys(BOUNDS)) {
        if (d.part[k] === undefined) continue;
        out = out.replace(new RegExp('(\\b' + k + ': )([-0-9.]+)'), '$1' + fmt(k, d.part[k]));
      }
      n++;
      return out;
    });
  }
  fs.writeFileSync(SRC, s);
  console.log('\nwrote ' + n + ' part lines back to src/sim2.js');
}
