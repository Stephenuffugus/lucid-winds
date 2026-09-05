/**
 * The shot planner.
 *
 * It samples candidate AimSources in a HEADLESS CLONE of the live world, using
 * the same `core/` the harness and the match use, and keeps the best it found
 * before the deadline. That is the whole payoff of keeping core free of the DOM:
 * the opponent plays the same game you do, not a lookup table.
 *
 * ⛔ THE ARITHMETIC, because it decides the shape of this file. A candidate shot
 * resolves in roughly 150 steps at 1/60, and one step of fourteen bodies costs
 * about 0.4 ms on the two core box this was written on. Shark's twenty four
 * candidates is therefore about a second and a half before a phone's two to
 * three times penalty. So: candidates step at 1/60 while the match always
 * resolves at 1/120, every candidate starts from ONE snapshot rather than a
 * rebuilt world, they terminate early the moment nothing is moving, and the
 * difficulty's N is a CEILING that the deadline is allowed to cut short. A guess
 * is allowed to be coarser than the record; it is not allowed to be late.
 *
 * Batch mode is a different animal. The Practice Ring runs two hundred rounds
 * with both sides planning, which at the live deadline would be half an hour.
 * `{batch:true}` takes a fixed small N and a shorter marble time cap and no
 * wall clock deadline at all.
 */
import { snapshot, restore, disposeWorld, impulse, step, atRest, specOf, positionOf, ringDistance, removeMarble, setTimestep } from '../core/physics.js?v=20260905a';
import { aimToImpulse, makeAim, dirFromDeg, powerForSpeed } from '../core/snap.js?v=20260905a';
import { atan2, clamp, len2, DEG } from '../core/dmath.js?v=20260905a';

/**
 * @param {object} W the live world
 * @param {{difficulty:string, taw:number, mibs:number[], rng:object, tuning:object,
 *   deadlineMs?:number, batch?:boolean, quality?:string, now?:()=>number}} opts
 * @returns {{aim:object, evaluated:number, elapsedMs:number, bestScore:number, deadlineMs:number}}
 */
export function plan(W, opts) {
  const T = opts.tuning;
  const cfg = T.ai;
  const clock = opts.now || (() => (typeof performance !== 'undefined' ? performance.now() : Date.now()));
  const t0 = clock();
  const batch = !!opts.batch;
  const deadline = batch ? Infinity : (opts.deadlineMs == null ? cfg.deadlineMs : opts.deadlineMs);
  let N = batch ? cfg.batch.candidates : (cfg.candidates[opts.difficulty] || cfg.candidates.rookie);
  if (!batch && opts.quality === 'low') N = Math.max(2, Math.floor(N / cfg.lowQualityDivisor));
  const marbleSeconds = batch ? cfg.batch.marbleSeconds : cfg.candidateMarbleSeconds;
  const noiseDeg = cfg.noiseDeg[opts.difficulty] == null ? cfg.noiseDeg.rookie : cfg.noiseDeg[opts.difficulty];
  const pct = cfg.percentile[opts.difficulty] == null ? cfg.percentile.rookie : cfg.percentile[opts.difficulty];

  const bytes = snapshot(W);
  const spec = specOf(W, opts.taw);
  const tawPos = positionOf(W, opts.taw);

  // the shots worth considering: straight at each mib still in the ring, since a
  // marble game is about hitting a thing, not about finding a clever angle
  const targets = [];
  for (const id of opts.mibs) {
    if (!W.marbles.has(id)) continue;
    const p = positionOf(W, id);
    const dx = p.x - tawPos.x, dz = p.z - tawPos.z;
    targets.push({ id, deg: atan2(dx, dz) / DEG, dist: len2(dx, dz), ring: ringDistance(W, id) });
  }
  if (!targets.length) {
    return { aim: makeAim({ dir: dirFromDeg(0), power01: 0.5 }), evaluated: 0, elapsedMs: 0, bestScore: 0, deadlineMs: deadline };
  }
  // a mib already near the line needs the least push to cross it
  targets.sort((a, b) => (b.ring - a.ring));

  /* ⛔ THE PLAN IS EVALUATED CLEAN, AND THE HAND SHAKES AFTERWARDS.
   *
   * The first version folded the difficulty's aiming error into each candidate
   * BEFORE scoring it, then took the sixtieth percentile of the results. That
   * means a Rookie looked at six shots it already knew would miss and then
   * deliberately chose a middling miss: across a traced game it pocketed roughly
   * one mib in ten shots and games ran to a hundred and fifty. It also implies an
   * opponent that can predict its own mistakes, which is not what a mistake is.
   *
   * Now candidates differ only in TARGET and POWER, with a hair of spread so no
   * two are identical; the percentile picks how good a PLAN this opponent is
   * willing to settle for; and the difficulty's noise is applied to the chosen
   * aim afterwards, as the shot actually leaving the hand. Rookie means picks a
   * middling plan and executes it at eight degrees. Shark means picks the best
   * plan and executes it at one. */
  const scored = [];
  let evaluated = 0;
  for (let i = 0; i < N; i++) {
    if (!batch && clock() - t0 > deadline * 0.82) break;   // leave room for the last candidate
    const tgt = targets[i % targets.length];
    const spread = (opts.rng.next() * 2 - 1) * 1.5;
    const speed = clamp(1.5 + tgt.dist * 1.6 + opts.rng.next() * 1.6, T.snap.launchMin, T.snap.launchMax);
    const aim = makeAim({
      dir: dirFromDeg(tgt.deg + spread),
      power01: powerForSpeed(speed, T),
      contactOffset: { x: 0, y: 0 },        // Rookie does not use spin (DESIGN 13.4)
      wildness01: 0,
      braced01: 1,
      coneDegOverride: 0.4
    });
    aim.plannedDeg = tgt.deg + spread;
    scored.push({ aim, score: evaluate(bytes, T, aim, opts, marbleSeconds) });
    evaluated++;
  }

  scored.sort((a, b) => a.score - b.score);
  const idx = clamp(Math.round((scored.length - 1) * pct), 0, scored.length - 1);
  const pick = scored[idx];
  const shaken = makeAim(Object.assign({}, pick.aim, {
    dir: dirFromDeg(pick.aim.plannedDeg + (opts.rng.next() * 2 - 1) * noiseDeg)
  }));
  shaken.coneDegOverride = pick.aim.coneDegOverride;
  shaken.plannedDeg = pick.aim.plannedDeg;
  return {
    aim: shaken,
    evaluated,
    elapsedMs: clock() - t0,
    bestScore: scored[scored.length - 1].score,
    plannedScore: pick.score,
    deadlineMs: deadline
  };
}

/** Run one candidate in a clone and say how much it was worth. */
function evaluate(bytes, T, aim, opts, marbleSeconds) {
  const C = restore(bytes, T);
  // the guess is allowed to be coarser than the record, and never the other way
  setTimestep(C, T.ai.candidateStep);
  const imp = aimToImpulse(aim, specOf(C, opts.taw), T, opts.rng);
  impulse(C, opts.taw, imp);
  const cap = Math.round(marbleSeconds / T.ai.candidateStep);
  let out = 0;
  const watching = opts.mibs.filter(id => C.marbles.has(id));
  for (let n = 0; n < cap; n++) {
    step(C);
    for (const id of watching) {
      if (!C.marbles.has(id)) continue;
      if (ringDistance(C, id) > C.ringRadius) { out++; removeMarble(C, id); }
    }
    if (C.shotT >= 0.25 && atRest(C)) break;
  }
  const tawIn = C.marbles.has(opts.taw) && ringDistance(C, opts.taw) <= C.ringRadius;
  disposeWorld(C);
  // pocketing is everything, and a taw that stays inside is worth a little
  return out * 10 + (tawIn ? 2 : 0);
}
