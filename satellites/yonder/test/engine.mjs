#!/usr/bin/env node
/* YONDER P0: the engine's laws (plans/yonder/HANDOFF-YONDER.md section 5 P0; the handoff's section 7 test gates).
 *
 *   node test/engine.mjs
 *
 * Every law runs on 20 seeds, because a count is a law only when it holds for any seed. Nothing here trusts a label
 * the engine writes about itself: bands are recomputed from the targets, spreads from the logarithm, errors from the
 * pixels a road would draw.
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. fitModels tells a simulated logarithmic child from a linear one, 95 of 100 of each on every seed and range
 *   2. generateStage: section 4's bands (40, 30, 30 percent) within one target a stage over 1000 draws, no target twice in a
 *      stage, and the range's probe in every stage at a new range
 *   3. scoreEstimate is exact through any road width and offset (a placement drawn to pixels and read back)
 *   4. routeRange takes every row of the routing table, and never promotes, rotates or calls a frontier on fewer than
 *      twenty estimates spanning the three bands (MIN_FIT)
 *   5. every probe is within two points of its range's largest log to linear spread
 *   6. pitchFor is linear in the target, and not linear in its logarithm
 *   7. raceMoves deals only 1 and 2, both, and a seed deals the same cards again
 *   8. the same seed gives the same stage, and another seed another
 */
import { rng, lineGeometry, fromNormalized, toNormalized } from '../../math/core/pure.js';

const fails = [];
const say = (ok, line) => { console.log((ok ? '  ok    ' : '  FAIL  ') + line); if (!ok) fails.push(line); };
let E;
try { E = await import('../engine.js'); } catch (e) { say(false, 'engine.js loads as an ES module (' + e.message.split('\n')[0] + ')'); }

if (E) {
  const SEEDS = Array.from({ length: 20 }, (_, i) => 1000 + i * 7919);
  const bandOfTarget = (t, max) => t < 0.20 * max ? 0 : t < 0.50 * max ? 1 : 2;
  const gauss = r => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());

  /* 1 */
  {
    const worst = [];
    for (const max of [100, 1000, 10000]) {
      let lowLog = 100, lowLin = 100;
      for (const seed of SEEDS) {
        const r = rng(seed);
        let log = 0, lin = 0;
        for (let child = 0; child < 100; child++) {
          /* a child's record at a road is two stages; one stage of ten was measured too few to call (DECISIONS) */
          const targets = E.generateStage(r, max, { isNew: false }).concat(E.generateStage(r, max, { isNew: false }));
          const noisy = v => Math.min(max, Math.max(0, v + gauss(r) * 0.05 * max));
          const asLog = targets.map(t => ({ target: t, placement: noisy(max * Math.log(t) / Math.log(max)) }));
          const asLin = targets.map(t => ({ target: t, placement: noisy(t) }));
          const fl = E.fitModels(asLog, max), fn = E.fitModels(asLin, max);
          if (fl.logR2 > fl.linearR2) log++;
          if (fn.linearR2 >= fn.logR2) lin++;
        }
        lowLog = Math.min(lowLog, log); lowLin = Math.min(lowLin, lin);
      }
      worst.push('0 to ' + max + ': ' + lowLog + ' log, ' + lowLin + ' linear');
      if (lowLog < 95 || lowLin < 95) worst.push('FAILED at 0 to ' + max);
    }
    say(!worst.some(w => w.startsWith('FAILED')), 'fitModels tells 100 simulated logarithmic children from 100 linear ones, at least 95 of each on every seed (lowest '
      + worst.filter(w => !w.startsWith('FAILED')).join('; ') + ')');
  }

  /* 2 */
  {
    const bad = [];
    for (const max of E.RANGES) {
      /* ⛔ the first version asked every road for 40, 30 and 30 percent: on 0 to 10 the first band (under 20 percent)
         holds the one number 1, and on 0 to 20 the numbers 1 to 3, so no stage without a repeat could obey it. A band is
         asked for its share or for every number it holds, whichever is fewer, the rest carried to the next band. */
      const size = E.STAGE_SIZE[max];
      const cap = [[Math.max(1, Math.ceil(0.02 * max)), Math.ceil(0.2 * max) - 1], [Math.ceil(0.2 * max), Math.ceil(0.5 * max) - 1], [Math.ceil(0.5 * max), max]]
        .map(([a, b]) => Math.max(0, b - a + 1));
      const share = [Math.round(0.4 * size), Math.round(0.3 * size)];
      share.push(size - share[0] - share[1]);
      const want = [0, 0, 0];
      let carry = 0;
      for (let i = 0; i < 3; i++) { const need = share[i] + carry; want[i] = Math.min(need, cap[i]); carry = need - want[i]; }
      for (const seed of SEEDS) {
        const r = rng(seed);
        const counts = [0, 0, 0];
        let stages = 0;
        while (stages * size < 1000) {
          const isNew = stages < 2;
          const stage = E.generateStage(r, max, { isNew });
          stages++;
          if (stage.length !== size) { bad.push('0 to ' + max + ' a stage of ' + stage.length + ', not ' + size); break; }
          if (new Set(stage).size !== stage.length) { bad.push('0 to ' + max + ' seed ' + seed + ' repeats a target: ' + stage.join(',')); break; }
          const floor = Math.max(1, Math.ceil(0.02 * max));
          if (stage.some(t => !Number.isInteger(t) || t < floor || t > max)) { bad.push('0 to ' + max + ' a target outside ' + floor + ' to ' + max + ': ' + stage.join(',')); break; }
          const c = [0, 0, 0];
          stage.forEach(t => { c[bandOfTarget(t, max)]++; counts[bandOfTarget(t, max)]++; });
          if (c.some((n, i) => Math.abs(n - want[i]) > 1)) { bad.push('0 to ' + max + ' a stage of bands ' + c.join('/') + ' for ' + want.join('/')); break; }
          const probe = E.PROBE_TABLE[max];
          if (isNew && probe !== undefined && stage.indexOf(probe) < 0) { bad.push('0 to ' + max + ' a new range stage without its probe ' + probe); break; }
        }
        const total = counts[0] + counts[1] + counts[2];
        const shares = counts.map(n => n / total);
        if (shares.some((x, i) => Math.abs(x - want[i] / size) > 0.05)) bad.push('0 to ' + max + ' seed ' + seed + ' shares ' + shares.map(x => (x * 100).toFixed(0)).join('/') + ' for ' + want.map(w => (w / size * 100).toFixed(0)).join('/'));
      }
    }
    say(bad.length === 0, 'generateStage keeps section 4\'s bands within a target a stage and 5 points over 1000 draws, never repeats in a stage, and serves the probe at a new range'
      + (bad.length ? ': ' + bad.slice(0, 3).join('; ') : ' (' + E.RANGES.join(', ') + ')'));
  }

  /* 3 */
  {
    let worst = 0;
    for (const seed of SEEDS) {
      const r = rng(seed);
      for (let i = 0; i < 50; i++) {
        const max = E.RANGES[Math.floor(r() * E.RANGES.length)], g = lineGeometry(r), W = 280 + r() * 1100;
        const target = 1 + Math.floor(r() * max), placement = r() * max;
        const px = fromNormalized(placement / max, g, W), readBack = toNormalized(px, g, W) * max;
        const got = E.scoreEstimate(readBack, target, { min: 0, max }), want = Math.abs(placement - target) / max;
        worst = Math.max(worst, Math.abs(got - want));
      }
    }
    say(worst < 1e-9, 'scoreEstimate is exact through any road width and offset (largest error ' + worst.toExponential(1) + ')');
  }

  /* 4 */
  {
    const spread = (max, n, curve, noise, r) => {
      const targets = E.generateStage(r, max, { isNew: false }).concat(E.generateStage(r, max, { isNew: false })).slice(0, n);
      return targets.map(t => ({ target: t, placement: Math.min(max, Math.max(0, curve(t) + noise * max * gauss(r))) }));
    };
    const rows = [];
    for (const seed of SEEDS) {
      const r = rng(seed), max = 1000;
      const logEst = spread(max, 20, t => max * Math.log(t) / Math.log(max), 0.01, r);
      const tight = spread(max, 20, t => t, 0.005, r);
      /* ⛔ the first fixture clamped its wrong placements at the road's end, which bends a straight reading into a curve a
         logarithm can fit better, so "linear, error over the band" was not what it drew; now a straight line, far off */
      const loose = spread(max, 10, t => t, 0, r).map(e => ({ target: e.target, placement: 0.6 * e.target + 0.3 * max }));
      const got = {
        frontier: E.routeRange({ max, tier: 2, estimates: logEst, stagesAtBand: 0, isTop: false }).action,
        stay: E.routeRange({ max, tier: 2, estimates: loose, stagesAtBand: 0, isTop: false }).action,
        advance: E.routeRange({ max, tier: 2, estimates: tight, stagesAtBand: 0, isTop: false }).action,
        promote: E.routeRange({ max, tier: 2, estimates: tight, stagesAtBand: 1, isTop: false }).action,
        rotate: E.routeRange({ max, tier: 2, estimates: tight, stagesAtBand: 1, isTop: true }).action,
        thin: E.routeRange({ max, tier: 2, estimates: tight.slice(0, 19), stagesAtBand: 1, isTop: false }).action,
        thinLogRecord: E.routeRange({ max, tier: 2, estimates: logEst.slice(0, 19), stagesAtBand: 1, isTop: false }).action,
        thinLog: E.routeRange({ max, tier: 2, estimates: logEst.filter(e => e.target < 0.2 * max), stagesAtBand: 1, isTop: false }).action
      };
      const want = { frontier: 'frontier', stay: 'stay', advance: 'advance', promote: 'promote', rotate: 'rotate' };
      for (const k of Object.keys(want)) if (got[k] !== want[k]) rows.push('seed ' + seed + ' ' + k + ' gave ' + got[k]);
      if (['promote', 'rotate', 'frontier'].indexOf(got.thin) >= 0) rows.push('seed ' + seed + ' nineteen estimates gave ' + got.thin);
      if (['promote', 'rotate', 'frontier'].indexOf(got.thinLogRecord) >= 0) rows.push('seed ' + seed + ' nineteen logarithmic estimates gave ' + got.thinLogRecord);
      if (['promote', 'rotate', 'frontier'].indexOf(got.thinLog) >= 0) rows.push('seed ' + seed + ' estimates in one band gave ' + got.thinLog);
    }
    say(rows.length === 0, 'routeRange takes every row of the routing table, and never promotes, rotates or calls a frontier on fewer than twenty estimates spanning the bands'
      + (rows.length ? ': ' + rows.slice(0, 4).join('; ') : ''));
  }

  /* 5 */
  {
    const off = [];
    for (const [max, probe] of Object.entries(E.PROBE_TABLE)) {
      const N = Number(max), s = x => Math.log(x) / Math.log(N) - x / N;
      const best = s(N / Math.log(N));
      if (best - s(probe) > 0.02) off.push('0 to ' + N + ': ' + probe + ' spreads ' + (s(probe) * 100).toFixed(1) + ' against ' + (best * 100).toFixed(1));
    }
    say(Object.keys(E.PROBE_TABLE).length >= 3 && off.length === 0, 'every probe is within two points of its range\'s largest log to linear spread'
      + (off.length ? ': ' + off.join('; ') : ' (' + Object.entries(E.PROBE_TABLE).map(([m, p]) => p + ' on 0 to ' + m).join(', ') + ')'));
  }

  /* 6 */
  {
    const bad = [];
    for (const max of E.RANGES) {
      const f = t => E.pitchFor(t, max), step = max / 10;
      for (let i = 1; i + 1 <= 10; i++) {
        const d2 = f((i + 1) * step) - 2 * f(i * step) + f((i - 1) * step);
        if (Math.abs(d2) > 1e-9) bad.push('0 to ' + max + ' bends at ' + i * step);
      }
      if (Math.abs(f(0.4 * max) / f(0.2 * max) - f(0.8 * max) / f(0.4 * max)) < 1e-6) bad.push('0 to ' + max + ' is linear in the logarithm');
      if (!(f(max) > f(0))) bad.push('0 to ' + max + ' does not rise');
    }
    say(bad.length === 0, 'pitchFor is linear in the target and rises with it, and equal ratios of target do not give equal ratios of pitch (Y9)'
      + (bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''));
  }

  /* 7 */
  {
    let ok = true, detail = '';
    for (const seed of SEEDS) {
      const a = E.raceMoves(rng(seed), 60), b = E.raceMoves(rng(seed), 60);
      if (a.some(m => m !== 1 && m !== 2) || a.indexOf(1) < 0 || a.indexOf(2) < 0 || a.join() !== b.join()) { ok = false; detail = 'seed ' + seed + ': ' + a.slice(0, 12).join(''); break; }
    }
    say(ok, 'raceMoves deals only 1 and 2, both, and a seed deals the same cards again' + (detail ? ' (' + detail + ')' : ''));
  }

  /* 8 */
  {
    const a = E.generateStage(rng(42), 1000, { isNew: true }).join(), b = E.generateStage(rng(42), 1000, { isNew: true }).join(), c = E.generateStage(rng(43), 1000, { isNew: true }).join();
    say(a === b && a !== c, 'the same seed gives the same stage and another seed another');
  }

  /* the session, played by simulated children: each stage is planned, its targets dealt, placed by the child's own
     reading of that road, and recorded, exactly as the page does */
  const play = (seed, reading, stages, noise = 0.02) => {
    const r = rng(seed);
    let session = E.freshSession();
    const log = [];
    for (let k = 0; k < stages; k++) {
      const plan = E.planStage(session, r);
      const before = JSON.stringify(session);
      let estimates = [];
      if (plan.kind === 'flag') {
        const targets = E.generateStage(r, plan.max, { isNew: plan.isNew });
        estimates = targets.map(t => ({ target: t, placement: Math.min(plan.max, Math.max(0, reading(plan.max, t) + gauss(r) * noise * plan.max)) }));
      }
      const records = {};
      for (const m of E.RANGES) records[m] = JSON.stringify(E.recordOf(session, m));
      const out = E.recordStage(session, { max: plan.max, kind: plan.kind, estimates }, r);
      log.push({ plan, route: out.route, home: session.home, n: E.recordOf(session, plan.max).estimates.length + estimates.length,
        mutated: JSON.stringify(session) !== before, records, after: out.session, estimates });
      session = out.session;
    }
    return { log, session };
  };
  const linear = (max, t) => t;
  const logAt1000 = (max, t) => max >= 1000 ? max * Math.log(Math.max(1, t)) / Math.log(max) : t;

  /* 9 */
  {
    const bad = [];
    for (const seed of SEEDS) {
      const { log } = play(seed, linear, 80);
      const homes = [E.START_ROAD];
      log.forEach(l => { if (l.after.home !== homes[homes.length - 1]) homes.push(l.after.home); });
      const climb = homes.slice(0, E.RANGES.length).join();
      if (climb !== E.RANGES.join()) { bad.push('seed ' + seed + ' climbed ' + homes.slice(0, 6).join(' to ')); continue; }
      const early = log.filter(l => l.route && l.route.action === 'promote' && l.n < E.MIN_FIT);
      if (early.length) bad.push('seed ' + seed + ' promoted on ' + early[0].n + ' estimates');
      if (!log.some(l => l.route && l.route.action === 'rotate')) bad.push('seed ' + seed + ' never rotated at the top road');
    }
    say(bad.length === 0, 'a child who reads every road in a straight line climbs 10, 20, 100, 1000 and 10000 in order, promoted only on twenty estimates, and rotates at the top, on every seed'
      + (bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''));
  }

  /* 10 */
  {
    const bad = [];
    for (const seed of SEEDS) {
      const { log } = play(seed, logAt1000, 60);
      const at = log.findIndex(l => l.after.home === 1000);
      if (at < 0) { bad.push('seed ' + seed + ' never reached 1000'); continue; }
      const later = log.slice(at + 1);
      if (later.some(l => l.after.home > 1000)) bad.push('seed ' + seed + ' left 1000 upward while reading it as a logarithm');
      const posts = later.map((l, i) => [l, i]).filter(([l]) => l.plan.kind === 'mileposts');
      if (!posts.length) bad.push('seed ' + seed + ' played no MILEPOSTS at its frontier');
      for (const [l, i] of posts) {
        if (l.plan.max !== 1000) bad.push('seed ' + seed + ' MILEPOSTS on ' + l.plan.max);
        const next = later.slice(i + 1).find(x => x.plan.max === 1000 && !x.plan.dropBack);
        if (next && !(next.plan.kind === 'flag' && next.plan.isNew && next.estimates.some(e => e.target === E.PROBE_TABLE[1000]))) bad.push('seed ' + seed + ' the stage after MILEPOSTS did not serve the probe');
      }
    }
    say(bad.length === 0, 'a child who reads 0 to 1000 as a logarithm stays on that road, plays MILEPOSTS there, and meets the probe again after each, on every seed'
      + (bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''));
  }

  /* 11 */
  {
    const bad = [];
    for (const seed of SEEDS) {
      const { log } = play(seed, linear, 60);
      const firstMastered = log.findIndex(l => Object.values(l.after.roads).some(x => x.mastered));
      const after = log.slice(firstMastered + 1);
      const drops = after.filter(l => l.plan.dropBack);
      if (!drops.length) { bad.push('seed ' + seed + ' never dropped back'); continue; }
      if (drops.some(l => !(l.plan.max < l.home) || !(l.records[l.plan.max] && JSON.parse(l.records[l.plan.max]).mastered))) bad.push('seed ' + seed + ' dropped back to a road not mastered below home');
      /* ⛔ the first version failed a window if ANY of its three stages could have dropped back, and went red on a child
         whose top road had just rotated home down to 10: two stages on 10 are themselves play on a mastered road with
         nothing below. The law Y8 asks: never three stages in a row, each on a road with a mastered road below it,
         without one of them going lower. */
      for (let i = 0; i + 3 <= after.length; i++) {
        const win = after.slice(i, i + 3);
        const above = win.every(l => l.plan.kind === 'flag' && E.RANGES.some(m => m < l.plan.max && JSON.parse(l.records[m]).mastered));
        if (above && !win.some(l => l.plan.dropBack)) { bad.push('seed ' + seed + ' played three stages above a mastered road without a drop back from stage ' + (firstMastered + 1 + i)); break; }
      }
    }
    say(bad.length === 0, 'once a road is mastered, a session drops back to a mastered road below home, and never plays three stages in a row above a mastered road without going lower (Y8), on every seed'
      + (bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''));
  }

  /* 12 */
  {
    const bad = [];
    for (const seed of SEEDS) {
      const { log } = play(seed, logAt1000, 40);
      for (const l of log) {
        if (l.mutated) { bad.push('seed ' + seed + ' recordStage changed the session it was handed'); break; }
        const touched = E.RANGES.filter(m => m !== l.plan.max && JSON.stringify(E.recordOf(l.after, m)) !== l.records[m]
          && !(l.route && ['promote', 'rotate'].includes(l.route.action)));
        if (touched.length) { bad.push('seed ' + seed + ' a stage on ' + l.plan.max + ' changed the record of ' + touched.join(', ')); break; }
      }
    }
    say(bad.length === 0, 'a stage changes only its own road\'s record (a promotion only sets the next road\'s tier) and never the session it was handed, on every seed'
      + (bad.length ? ': ' + bad.slice(0, 2).join('; ') : ''));
  }

  /* 13 */
  {
    const bad = [];
    for (const seed of SEEDS) {
      for (const max of E.RANGES) {
        const rounds = E.milepostRounds(rng(seed), max);
        const posts = rounds.filter(x => x.kind === 'post').map(x => x.target), est = rounds.filter(x => x.kind === 'estimate').map(x => x.target);
        const wantPosts = max % 4 === 0 ? [max / 2, max / 4, 3 * max / 4] : [max / 2];
        if (posts.join() !== wantPosts.join() || rounds.findIndex(x => x.kind === 'estimate') !== posts.length) bad.push('0 to ' + max + ' posts ' + posts.join(','));
        if (posts.concat(est).some(t => !Number.isInteger(t))) bad.push('0 to ' + max + ' a number that is not whole');
        if (est.length !== E.MILEPOST_ESTIMATES || new Set(est.concat(posts)).size !== est.length + posts.length) bad.push('0 to ' + max + ' estimates ' + est.join(','));
      }
    }
    say(bad.length === 0, 'MILEPOSTS: the halfway post, then the quarters where a quarter is whole, then four estimates, every number whole and none twice, on every seed and road'
      + (bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''));
  }
}

console.log('');
if (fails.length) { console.log(fails.length + ' ENGINE FAILURE(S)'); process.exit(1); }
console.log('ENGINE OK');
