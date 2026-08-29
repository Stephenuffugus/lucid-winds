/**
 * AURA OFF — src/engine/anim.js
 *
 * Keyframe sampling, amplitude, bone masking, follow-through lag.
 * CONTRACT.md §4.
 *
 * PURE MODULE. No DOM, no globals, no imports outside the engine. The UI calls
 * `sample()` sixty times a second and hands the result to `rig.applyPose()`;
 * the simulator never calls anything in here at all.
 *
 * The four rules, in the order they matter:
 *
 *   1. INTERPOLATION. Find the bracketing keyframes, ease the segment
 *      parameter with smoothstep, lerp each joint. A joint absent from a
 *      keyframe is 0 — never "hold previous" — which is what lets amplitude
 *      scaling stay correct without tracking a baseline.
 *
 *   2. AMPLITUDE SCALES DELTAS FROM REST, NEVER TIME. Rest is all zeros, so
 *      the delta from rest IS the authored value and the scaling is a plain
 *      multiply. `t01` is never touched: a bigger performance is bigger, not
 *      faster.
 *
 *   3. FOLLOW-THROUGH LAG. When `move.lag > 0` the UPPER joints sample at
 *      `t01 - lag/dur` while the LOWER joints sample at `t01`, so the torso and
 *      arms trail the hips that threw them. On Dead Drop and Aura Walk this one
 *      rule does more for perceived quality than any polish pass, because it is
 *      the difference between a body falling and a body being translated.
 *
 *   4. BLENDING IS BONE MASKING. `blend(A, B)` takes UPPER from A's sample and
 *      LOWER from B's. Identical concept in an SVG group tree and in a three.js
 *      AnimationMixer, which is why the joint names are frozen.
 */

import { JOINTS, UPPER, LOWER, restPose } from './rig.js';

/* -------------------------------------------------------------------------- */
/* EASING                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Smoothstep, clamped. Applied to the *segment* parameter between two
 * keyframes, never to the clip parameter — so a move authored with keyframes at
 * t 0 / 0.35 / 1 eases into and out of each pose rather than sliding through it.
 */
export function smoothstep(x) {
  if (!(x > 0)) return 0;
  if (x >= 1) return 1;
  return x * x * (3 - 2 * x);
}

/** Linear interpolation. */
export function lerp(a, b, k) { return a + (b - a) * k; }

function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

/* -------------------------------------------------------------------------- */
/* KEYFRAME LOOKUP                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Locate the bracketing keyframes for a normalised time and return the eased
 * blend factor between them.
 *
 * @param {Array}  frames  keyframes, `t` strictly increasing from 0 to 1
 * @param {number} t01
 * @returns {{a: Object|null, b: Object|null, k: number}}
 */
export function bracket(frames, t01) {
  if (!frames || !frames.length) return { a: null, b: null, k: 0 };
  const n = frames.length;
  if (n === 1) return { a: frames[0], b: frames[0], k: 0 };

  const t = clamp01(t01);
  if (t <= (frames[0].t || 0)) return { a: frames[0], b: frames[0], k: 0 };
  if (t >= (frames[n - 1].t != null ? frames[n - 1].t : 1)) {
    return { a: frames[n - 1], b: frames[n - 1], k: 0 };
  }

  let i = 0;
  while (i < n - 2 && (frames[i + 1].t != null ? frames[i + 1].t : 1) < t) i++;

  const f0 = frames[i];
  const f1 = frames[i + 1];
  const t0 = f0.t != null ? f0.t : 0;
  const t1 = f1.t != null ? f1.t : 1;
  const span = t1 - t0;
  const s = span > 1e-9 ? (t - t0) / span : 0;
  return { a: f0, b: f1, k: smoothstep(s) };
}

/**
 * Write the interpolated, amplitude-scaled value of a set of joints into `out`.
 * Internal workhorse — `sample` and `blend` are the public doors.
 *
 * @param {Array}  frames
 * @param {number} t01
 * @param {number} amp
 * @param {Object} out    pose object to write into
 * @param {Array}  keys   which joints to write (JOINTS, UPPER or LOWER)
 */
function evalInto(frames, t01, amp, out, keys) {
  const br = bracket(frames, t01);
  const a = br.a, b = br.b, k = br.k;
  for (let i = 0; i < keys.length; i++) {
    const j = keys[i];
    if (!a) { out[j] = 0; continue; }
    const va = typeof a[j] === 'number' && isFinite(a[j]) ? a[j] : 0;
    const vb = b && typeof b[j] === 'number' && isFinite(b[j]) ? b[j] : 0;
    out[j] = (k <= 0 ? va : k >= 1 ? vb : va + (vb - va) * k) * amp;
  }
}

/* -------------------------------------------------------------------------- */
/* SAMPLING                                                                    */
/* -------------------------------------------------------------------------- */

/** The fraction of the clip the upper body trails by. 0 when there is no lag. */
export function lagFraction(move) {
  if (!move) return 0;
  const lag = move.lag;
  const dur = move.dur;
  if (!(lag > 0) || !(dur > 0)) return 0;
  const f = lag / dur;
  return f > 0.9 ? 0.9 : f;
}

/**
 * Sample a move at a normalised time.
 *
 * @param {Object} move   a move from src/data/moves.js
 * @param {number} t01    0…1, clamped
 * @param {number} [amp=1] amplitude; scales joint values, never time
 * @returns {Object} a full twelve-joint pose
 */
export function sample(move, t01, amp) {
  return sampleInto(move, t01, amp, restPose());
}

/**
 * Allocation-free `sample`. Pass a pose object to reuse; the UI keeps one per
 * fighter and never allocates inside the animation loop.
 *
 * @param {Object} move
 * @param {number} t01
 * @param {number} [amp=1]
 * @param {Object} out  pose object to write into (required)
 * @returns {Object} `out`
 */
export function sampleInto(move, t01, amp, out) {
  const a = typeof amp === 'number' && isFinite(amp) ? amp : 1;
  const t = clamp01(t01);
  const frames = move && move.frames;

  if (!frames || !frames.length) {
    for (let i = 0; i < JOINTS.length; i++) out[JOINTS[i]] = 0;
    return out;
  }

  const lag = lagFraction(move);
  if (lag <= 0) {
    evalInto(frames, t, a, out, JOINTS);
    return out;
  }

  // Rule 3: lower initiates, upper trails. Clamped at 0, so the upper body
  // simply holds the opening pose while the hips get a head start.
  const tUpper = clamp01(t - lag);
  evalInto(frames, t, a, out, LOWER);
  evalInto(frames, tUpper, a, out, UPPER);
  return out;
}

/**
 * Sample by wall-clock milliseconds into the clip. Convenience for the UI's
 * requestAnimationFrame loop, which counts ms and not fractions.
 */
export function sampleAtMs(move, ms, amp, out) {
  const dur = move && move.dur > 0 ? move.dur : 1600;
  return sampleInto(move, ms / dur, amp, out || restPose());
}

/** Clip length in ms, with the same 1600 default `sampleAtMs` uses. */
export function duration(move) {
  return move && move.dur > 0 ? move.dur : 1600;
}

/* -------------------------------------------------------------------------- */
/* BLENDING — BONE MASKING                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Blend two moves by bone mask: UPPER joints from A, LOWER joints from B.
 *
 * Each half is sampled through `sampleInto`, so each half keeps its own
 * follow-through lag — a blend of a still upper body over a lower-led move
 * still gets B's hips leading B's own trailing torso weight, which is exactly
 * what makes a genuine split look like one performance instead of two.
 *
 * The *scoring* consequence of a split versus a stack lives in
 * `scoring.blendMult()`, not here. This function only decides what it looks
 * like.
 *
 * @param {Object} moveA  upper-body source
 * @param {Object} moveB  lower-body source
 * @param {number} t01
 * @param {number} [amp=1]
 * @param {Object} [out]
 * @returns {Object} a full twelve-joint pose
 */
export function blend(moveA, moveB, t01, amp, out) {
  const o = out || restPose();
  const a = typeof amp === 'number' && isFinite(amp) ? amp : 1;
  const t = clamp01(t01);

  const framesA = moveA && moveA.frames;
  const framesB = moveB && moveB.frames;

  if (framesA && framesA.length) {
    const lagA = lagFraction(moveA);
    evalInto(framesA, lagA > 0 ? clamp01(t - lagA) : t, a, o, UPPER);
  } else {
    for (let i = 0; i < UPPER.length; i++) o[UPPER[i]] = 0;
  }

  if (framesB && framesB.length) {
    evalInto(framesB, t, a, o, LOWER);
  } else {
    for (let i = 0; i < LOWER.length; i++) o[LOWER[i]] = 0;
  }

  return o;
}

/**
 * Mask two poses that have already been sampled: UPPER from `upperFrom`, LOWER
 * from `lowerFrom`. Same operation as `blend` one level down — useful when the
 * UI is crossfading and already has both poses in hand.
 */
export function maskPose(upperFrom, lowerFrom, out) {
  const o = out || restPose();
  for (let i = 0; i < UPPER.length; i++) {
    const j = UPPER[i];
    const v = upperFrom && upperFrom[j];
    o[j] = typeof v === 'number' && isFinite(v) ? v : 0;
  }
  for (let i = 0; i < LOWER.length; i++) {
    const j = LOWER[i];
    const v = lowerFrom && lowerFrom[j];
    o[j] = typeof v === 'number' && isFinite(v) ? v : 0;
  }
  return o;
}

/**
 * Interpolate between two poses. The UI uses this to ease a fighter out of rest
 * into the opening frame and back again between turns, so nothing ever snaps.
 *
 * @param {Object} a
 * @param {Object} b
 * @param {number} k     0…1, clamped; eased with smoothstep
 * @param {Object} [out]
 * @param {boolean} [raw=false] skip the easing and interpolate linearly
 */
export function lerpPose(a, b, k, out, raw) {
  const o = out || restPose();
  const t = raw ? clamp01(k) : smoothstep(k);
  for (let i = 0; i < JOINTS.length; i++) {
    const j = JOINTS[i];
    const va = a && typeof a[j] === 'number' && isFinite(a[j]) ? a[j] : 0;
    const vb = b && typeof b[j] === 'number' && isFinite(b[j]) ? b[j] : 0;
    o[j] = va + (vb - va) * t;
  }
  return o;
}

/**
 * Ease a clip back to rest over its last `tail` fraction, so a fighter settles
 * instead of popping. Returns the blend weight toward rest for a given `t01`.
 */
export function settleWeight(t01, tail) {
  const w = typeof tail === 'number' && tail > 0 ? tail : 0.12;
  const t = clamp01(t01);
  if (t <= 1 - w) return 0;
  return smoothstep((t - (1 - w)) / w);
}

/**
 * Bake a clip to a fixed number of poses. Not used at runtime — it exists so
 * `tools/gen-docs.js` and a future glTF exporter can walk a move without
 * reimplementing the sampler.
 *
 * @param {Object} move
 * @param {number} [steps=24]
 * @param {number} [amp=1]
 * @returns {Array<Object>}
 */
export function bake(move, steps, amp) {
  const n = Math.max(2, steps | 0 || 24);
  const out = [];
  for (let i = 0; i < n; i++) out.push(sample(move, i / (n - 1), amp));
  return out;
}

/**
 * How far a clip actually travels: the largest absolute joint value it reaches
 * across `steps` samples, split by bone mask. A cheap sanity check for a move
 * author — if a move declares `up: 1.0` but its LOWER reach is large, the
 * declaration and the animation disagree.
 *
 * @returns {{upper: number, lower: number, joints: Object}}
 */
export function reach(move, steps, amp) {
  const n = Math.max(2, steps | 0 || 24);
  const per = {};
  for (let i = 0; i < JOINTS.length; i++) per[JOINTS[i]] = 0;
  const p = restPose();
  for (let i = 0; i < n; i++) {
    sampleInto(move, i / (n - 1), amp, p);
    for (let j = 0; j < JOINTS.length; j++) {
      const key = JOINTS[j];
      const v = Math.abs(p[key]);
      if (v > per[key]) per[key] = v;
    }
  }
  let up = 0, lo = 0;
  for (let i = 0; i < UPPER.length; i++) up = Math.max(up, per[UPPER[i]]);
  for (let i = 0; i < LOWER.length; i++) lo = Math.max(lo, per[LOWER[i]]);
  return { upper: up, lower: lo, joints: per };
}
