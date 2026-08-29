/**
 * AURA OFF — tools/mocap/retarget.js
 *
 * TAKE (15 3D points) → our twelve joints → a move's keyframes.
 * CONTRACT.md §3, §4, §5. TOOLING — never imported by the game.
 *
 * ===========================================================================
 * WHAT THIS FILE IS FOR, AND THE ANSWER IT FOUND
 * ===========================================================================
 * CONTRACT §0 asks one question: does 3D mocap survive projection onto a 2D
 * front-facing 12-joint rig? This file measures it rather than asserting it.
 * Everything below that could hide a failure instead REPORTS it:
 *
 *   · clamping is counted per joint per frame, never silently applied
 *   · facing is tracked per frame and off-axis spans are refused, not averaged
 *   · foreshortening (projected bone length ÷ true 3D length) is measured,
 *     because that is the actual mechanism by which projection destroys a pose
 *   · the keyframe residual is measured by running the emitted move back
 *     through the REAL `anim.sample()`, not against the fit it came from
 *
 * ===========================================================================
 * THE FIVE THINGS THAT DECIDE WHETHER OUTPUT IS RIGHT OR MIRRORED GARBAGE
 * ===========================================================================
 *
 * 1. SCREEN SIDES, NOT ANATOMICAL SIDES.
 *    The TAKE says `+X is the subject's LEFT as the camera sees it (screen
 *    right)`. So mocap `lsho` renders at screen RIGHT. The rig draws its `L`
 *    limbs at NEGATIVE x — `legMarkup`/`armMarkup` use `dir = side==='L' ? -1
 *    : 1` — i.e. at screen LEFT. Therefore:
 *
 *        rig sL/eL/hL/kL  ←  mocap r-side points   (both live at screen left)
 *        rig sR/eR/hR/kR  ←  mocap l-side points   (both live at screen right)
 *
 *    Get this backwards and every frame is a mirror of the source, which reads
 *    as plausible motion and is completely wrong. `--sides=anatomical` swaps
 *    it if a future TAKE producer changes convention; `screen` is the default
 *    and is verified by asserting `lsho.x > rsho.x` on a front-facing frame.
 *
 * 2. ANGLES COME FROM PROJECTED BONE VECTORS, MEASURED AGAINST THE RIG'S OWN
 *    REST DIRECTION.
 *    Never from source Euler angles. Every limb in `rig.js` is drawn `M0 0 L0
 *    <len>` inside its joint group, so EVERY limb's rest direction is straight
 *    DOWN the screen, and the spine is drawn to a negative y so the torso's
 *    rest direction is straight UP. A joint value is degrees CLOCKWISE from
 *    that. SVG `rotate(a)` maps (0,1) → (−sin a, cos a), so positive rotation
 *    carries a hanging limb toward screen LEFT. That single fact fixes every
 *    sign in this file.
 *
 * 3. THE PARENT CHAIN SUBTRACTS.
 *    Joint groups nest, so a child's value is its world angle minus every
 *    ancestor's. From `figureMarkup`:
 *        rot → bob → hips → { legs ; lean → { torso, head, arms } }
 *    so  sL = θ_upperarm − rot − lean,  hL = θ_thigh − rot  (legs are NOT
 *    under lean), lean = θ_torso − rot, head = θ_head − θ_torso, and the two
 *    hinges eL/kL are purely relative and subtract nothing else.
 *    The per-fighter static wrappers (`poise`, `hang`, `stance` from
 *    `figureBuild`) sit OUTSIDE the joint groups and differ per fighter, so a
 *    move must target the canonical `RIG` with all three at zero. It does.
 *
 * 4. THE RIG HAS NO MIRRORING, SO A REAL HUMAN'S TWO ELBOWS DISAGREE WITH IT.
 *    `sL` and `sR` are the same rotation on two anchors, and elbows hinge one
 *    way (−150…+30). A person folding both forearms inward folds one clockwise
 *    and one counter-clockwise on screen. One of them is therefore always
 *    outside the hinge range. `moves.flow.js` note 1 says the same thing from
 *    the authoring side. We emit the TRUE signed projected angle (which puts
 *    the wrist where the camera saw it) and let the clamp counter record the
 *    damage. `--elbow=hinge` forces −|angle| instead; it keeps every frame
 *    legal and puts half the wrists on the wrong side of the arm, which is why
 *    it is not the default.
 *
 * 5. `bob` AND THE KNEES ARE COUPLED, AND A FRONT VIEW CANNOT SQUAT.
 *    The hips are the root of the chain, so a bent knee LIFTS THE FOOT; it
 *    does not lower the hips. `moves.flow.js` note 5 states the budget:
 *    bob ≤ 81 − (41·cos hip + 40·cos(hip+knee)) for the lower foot. A real
 *    squat drops the pelvis while the knees travel FORWARD, which projects to
 *    almost no knee angle at all — so the honest bob would put the feet
 *    through the floor. We clamp bob to that budget and count it.
 *
 * ===========================================================================
 * ZERO EXTERNAL DEPENDENCIES. The three imports are our own frozen sources of
 * truth — the joint names, the ranges, the sampler and the facing function —
 * and they are imported rather than copied on purpose. Every time this repo
 * has hand-mirrored a scorer it has drifted (see the rarity sim). Nothing here
 * writes to `src/`. A converted move is PROPOSED OUTPUT for a human to read.
 * ===========================================================================
 */

import { JOINTS, UPPER, LOWER, JOINT_RANGE, RIG, restPose } from '../../src/engine/rig.js';
import { sample } from '../../src/engine/anim.js';
import { facingDeg, FACING_LIMIT_DEG } from './asfamc.js';
import path from 'node:path';

/* -------------------------------------------------------------------------- */
/* CONSTANTS                                                                   */
/* -------------------------------------------------------------------------- */

/** Canonical rig lengths a move is authored against. `figureBuild` varies
 *  these per fighter, but it varies them on wrappers OUTSIDE the joint groups,
 *  so a move targets these and every body wears it. */
export const TARGET = Object.freeze({
  upperArm: RIG.upperArm,          // 26
  foreArm: RIG.foreArm,            // 24
  arm: RIG.upperArm + RIG.foreArm, // 50
  thigh: RIG.thigh,                // 41
  shin: RIG.shin,                  // 40
  leg: RIG.thigh + RIG.shin        // 81 — also the floor distance below the hips
});

/** Which TAKE points drive which rig side. See header note 1. */
export const SIDE_MAP = Object.freeze({
  screen: { L: 'r', R: 'l' },      // default: rig L is drawn at screen left
  anatomical: { L: 'l', R: 'r' }
});

/** Below this, a projected bone is shorter than a third of its true length and
 *  its screen angle is mostly noise. Reported, never silently patched. */
export const DEGENERATE_RATIO = 0.35;

/** CONTRACT §5. A move's duration is not a free parameter. */
export const DUR_MIN = 1400;
export const DUR_MAX = 2200;

const DEG = 180 / Math.PI;

const BONES = Object.freeze([
  ['lsho', 'lelb'], ['lelb', 'lwri'], ['rsho', 'relb'], ['relb', 'rwri'],
  ['lhip', 'lkne'], ['lkne', 'lank'], ['rhip', 'rkne'], ['rkne', 'rank'],
  ['root', 'neck'], ['neck', 'head']
]);

/* -------------------------------------------------------------------------- */
/* SMALL MATH — every angle in this file is DEGREES CLOCKWISE ON SCREEN        */
/* -------------------------------------------------------------------------- */

function clampTo(v, r) { return v < r[0] ? r[0] : v > r[1] ? r[1] : v; }

function wrap180(d) {
  let x = d % 360;
  if (x > 180) x -= 360;
  if (x < -180) x += 360;
  return x;
}

/**
 * Clockwise-from-screen-DOWN angle of a TAKE-space vector.
 *
 * TAKE is +X screen-right, +Y up. Screen is +x right, +y DOWN, so a TAKE
 * delta (dx,dy) is the screen vector (dx, −dy). SVG rotate(a) sends (0,1) to
 * (−sin a, cos a); solving gives a = atan2(−sx, sy) = atan2(−dx, −dy).
 */
export function cwFromDown(dx, dy) { return Math.atan2(-dx, -dy) * DEG; }

/** Clockwise-from-screen-UP angle of a TAKE-space vector. Same derivation with
 *  (0,−1) → (sin a, −cos a). */
export function cwFromUp(dx, dy) { return Math.atan2(dx, dy) * DEG; }

/** Signed clockwise angle from bone `a→b` to bone `b→c`. This is what a hinge
 *  joint's value is: the child's world angle minus the parent's. */
function hingeAngle(ax, ay, bx, by, cx, cy) {
  return wrap180(cwFromDown(cx - bx, cy - by) - cwFromDown(bx - ax, by - ay));
}

/**
 * The `head` joint is the ONE joint whose value is not the direction of a
 * bone, and it costs a correction most retargeters get wrong by ~15%.
 *
 * Every other limb is drawn FROM its joint anchor, so the limb's screen
 * direction IS the joint's rotation. The skull is not: `figureMarkup` puts the
 * head group at `headAnchorY` (−52) while the spine ends at `neckY` (−50),
 * and the skull ellipse sits at `headCY` (−11) inside it. So the observable
 * neck→skull vector is a fixed 2-unit riser plus an 11-unit arm swung by the
 * joint, and the measured angle is DILUTED by that lever:
 *
 *     φ = atan2( r·sin h , d + r·cos h )     d = neckY − headAnchorY = 2
 *                                             r = −headCY = 11
 *
 * which rearranges to r·sin(h − φ) = d·sin φ, so the exact inverse is one
 * asin. Skip it and every head reads ~15% shy of the source; at the ±30°
 * limit that is a whole head-radius of missing motion on a joint
 * `moves.flow.js` note 3 already calls almost invisible.
 */
function headJoint(phi) {
  const d = RIG.neckY - RIG.headAnchorY;      // 2
  const r = -RIG.headCY;                      // 11
  if (!(r > 1e-6)) return phi;
  let k = d * Math.sin(phi / DEG) / r;
  if (k > 1) k = 1; else if (k < -1) k = -1;
  return wrap180(phi + Math.asin(k) * DEG);
}

/** True 3D bend at joint b, degrees. 0 = straight, 90 = a right angle. */
function flexion3d(a, b, c) {
  const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const v = [c[0] - b[0], c[1] - b[1], c[2] - b[2]];
  const lu = Math.hypot(u[0], u[1], u[2]), lv = Math.hypot(v[0], v[1], v[2]);
  if (lu < 1e-9 || lv < 1e-9) return 0;
  let d = (u[0] * v[0] + u[1] * v[1] + u[2] * v[2]) / (lu * lv);
  if (d > 1) d = 1; else if (d < -1) d = -1;
  return Math.acos(d) * DEG;
}

function dist3(a, b) {
  const x = a[0] - b[0], y = a[1] - b[1], z = a[2] - b[2];
  return Math.sqrt(x * x + y * y + z * z);
}
function dist2(a, b) {
  const x = a[0] - b[0], y = a[1] - b[1];
  return Math.sqrt(x * x + y * y);
}

function median(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort(function (a, b) { return a - b; });
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function quantile(arr, q) {
  if (!arr.length) return 0;
  const s = arr.slice().sort(function (a, b) { return a - b; });
  const i = (s.length - 1) * q;
  const lo = Math.floor(i), hi = Math.ceil(i);
  return lo === hi ? s[lo] : s[lo] + (s[hi] - s[lo]) * (i - lo);
}
function r1(v) { return Math.round(v * 10) / 10; }
function r2(v) { return Math.round(v * 100) / 100; }
function pct(n, d) { return d > 0 ? Math.round(n / d * 1000) / 10 : 0; }

/* -------------------------------------------------------------------------- */
/* SCALE — normalised per take off the subject's own limbs (§4)                */
/* -------------------------------------------------------------------------- */

/**
 * Measure the subject's limb lengths from the frames themselves and derive
 * rig-units-per-take-unit. Deliberately does NOT read `take.units` or
 * `meta.segmentsCm`: BVH cannot declare a unit and MediaPipe has none, and one
 * code path that works for every front end is worth more than three.
 *
 * The median over frames is used because a rigid bone's length is constant and
 * the median throws away tracking pops for free.
 */
export function measureScale(take, opts) {
  const o = opts || {};
  const frames = take.frames;
  const stride = Math.max(1, Math.round(frames.length / 400));
  const seg = {};
  for (let b = 0; b < BONES.length; b++) seg[BONES[b][0] + '-' + BONES[b][1]] = [];
  const shoulders = [];
  for (let i = 0; i < frames.length; i += stride) {
    const p = frames[i].p;
    for (let b = 0; b < BONES.length; b++) {
      const k = BONES[b];
      if (p[k[0]] && p[k[1]]) seg[k[0] + '-' + k[1]].push(dist3(p[k[0]], p[k[1]]));
    }
    if (p.lsho && p.rsho) shoulders.push(dist3(p.lsho, p.rsho));
  }
  const m = {};
  for (const k in seg) m[k] = median(seg[k]);

  const armLen = (m['lsho-lelb'] + m['lelb-lwri'] + m['rsho-relb'] + m['relb-rwri']) / 2;
  const legLen = (m['lhip-lkne'] + m['lkne-lank'] + m['rhip-rkne'] + m['rkne-rank']) / 2;

  const legScale = legLen > 1e-6 ? TARGET.leg / legLen : 0;
  const armScale = armLen > 1e-6 ? TARGET.arm / armLen : 0;

  return {
    segments: m,
    shoulderWidth: median(shoulders),
    armLen: armLen,
    legLen: legLen,
    /** Rig units per take unit. `bob` is a hip-height quantity, so it rides the
     *  LEG ratio; the arm ratio is reported so a bad skeleton shows up. */
    unitsPer: o.unitsPer > 0 ? o.unitsPer : legScale,
    legScale: legScale,
    armScale: armScale,
    /** >1.15 or <0.87 means arms and legs disagree about the subject's size,
     *  which usually means a mis-mapped joint rather than an unusual body. */
    agreement: legScale > 0 ? armScale / legScale : 0
  };
}

/* -------------------------------------------------------------------------- */
/* ONE FRAME → ONE POSE                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Retarget a single 15-point frame to a raw (UNCLAMPED) twelve-joint pose.
 *
 * Raw on purpose: clamping happens later and gets counted. A caller that wants
 * a legal pose calls `rig.clampPose` and loses the measurement.
 *
 * @param {Object} p        the frame's 15 points
 * @param {Object} ctx      from `buildContext()` — scale, sides, baseline, modes
 * @returns {{pose: Object, diag: Object}}
 */
export function framePose(p, ctx) {
  const S = ctx.sides;                 // { L:'r', R:'l' } by default
  const pose = restPose();
  const diag = { degenerate: 0, minRatio: 1, footDrop: 0, bobRaw: 0, bobBudget: 0, proj: {}, flex3d: {} };

  /* --- the pivot `rot` turns about --------------------------------------- *
   * The rig's hips are pinned at x=60 and `bob` only moves vertically, so
   * `rot` is the ONLY joint that can carry a lateral weight shift. It is a
   * roll about the FEET — NOT a turn. A turn is a yaw, this rig has none, and
   * yaw is handled by the facing gate instead.
   *
   * ⛔ rot / lean / hL / hR ARE A REDUNDANT DECOMPOSITION. Any rot can be
   * traded against lean and both hips for the same limb directions; what rot
   * uniquely decides is WHERE THE HIPS SIT relative to the feet, because it
   * alone translates the figure (about the ground point) as well as rotating
   * it. So it is a modelling choice, not an inversion, and the two choices
   * fail in opposite places — `tools/mocap` scratch test `signs.mjs` measures
   * both:
   *   mid      plain ankle midpoint. EXACT for a rigid roll and at rest.
   *            A leg lifted to the side drags the midpoint with it and
   *            invents body roll that is not there.
   *   support  ankle midpoint weighted toward whichever foot is lower, so a
   *            lifted leg is ignored. Costs ~2° on a genuine rigid roll.
   * `support` is the default because real dance lifts legs far more often
   * than it rolls the whole body about planted feet.                        */
  let pivX, pivY;
  if (ctx.rotMode === 'mid') {
    pivX = (p.lank[0] + p.rank[0]) / 2;
    pivY = (p.lank[1] + p.rank[1]) / 2;
  } else {
    const tau = 6 / (ctx.scale.unitsPer || 1);         // ~6 rig units, in take units
    const ay = Math.min(p.lank[1], p.rank[1]);
    const wl = Math.exp(-(p.lank[1] - ay) / tau);
    const wr = Math.exp(-(p.rank[1] - ay) / tau);
    const wsum = wl + wr;
    pivX = (p.lank[0] * wl + p.rank[0] * wr) / wsum;
    pivY = (p.lank[1] * wl + p.rank[1] * wr) / wsum;
  }
  const rot = ctx.rotMode === 'off' ? 0 : cwFromUp(p.root[0] - pivX, p.root[1] - pivY);

  /* --- torso and head ---------------------------------------------------- */
  const torso = cwFromUp(p.neck[0] - p.root[0], p.neck[1] - p.root[1]);
  const headA = cwFromUp(p.head[0] - p.neck[0], p.head[1] - p.neck[1]);
  pose.rot = rot;
  pose.lean = wrap180(torso - rot);
  pose.head = headJoint(wrap180(headA - torso));

  /* --- arms and legs ------------------------------------------------------ */
  const chain = [
    ['sL', 'eL', S.L + 'sho', S.L + 'elb', S.L + 'wri', rot + pose.lean],
    ['sR', 'eR', S.R + 'sho', S.R + 'elb', S.R + 'wri', rot + pose.lean],
    ['hL', 'kL', S.L + 'hip', S.L + 'kne', S.L + 'ank', rot],
    ['hR', 'kR', S.R + 'hip', S.R + 'kne', S.R + 'ank', rot]
  ];
  for (let i = 0; i < chain.length; i++) {
    const c = chain[i];
    const a = p[c[2]], b = p[c[3]], d = p[c[4]];
    const upper = cwFromDown(b[0] - a[0], b[1] - a[1]);
    pose[c[0]] = wrap180(upper - c[5]);
    let bend = hingeAngle(a[0], a[1], b[0], b[1], d[0], d[1]);
    if (ctx.elbowMode === 'hinge' && (c[1] === 'eL' || c[1] === 'eR')) bend = -Math.abs(bend);
    pose[c[1]] = bend;

    /* foreshortening: the real mechanism by which a projection dies */
    const r1len = dist3(a, b), r2len = dist3(b, d);
    const p1 = r1len > 1e-6 ? dist2(a, b) / r1len : 1;
    const p2 = r2len > 1e-6 ? dist2(b, d) / r2len : 1;
    if (p1 < diag.minRatio) diag.minRatio = p1;
    if (p2 < diag.minRatio) diag.minRatio = p2;
    if (p1 < DEGENERATE_RATIO || p2 < DEGENERATE_RATIO) diag.degenerate++;
    diag.proj[c[0]] = p1; diag.proj[c[1]] = p2;

    /* THE §0 MEASUREMENT, for the hinges. `flex3d` is how far the real joint
     * actually bent, in 3D, ignoring the camera. `Math.abs(bend)` is how much
     * of that bend the front projection could SEE. A knee flexes in the
     * sagittal plane, which points at the camera, so the two diverge wildly
     * and that divergence — not the clamp count — is the honest answer to
     * "does mocap survive projection". Reported per joint. */
    diag.flex3d[c[1]] = flexion3d(a, b, d);
  }

  /* --- bob, and the floor it has to pay for ------------------------------ */
  const bobRaw = (ctx.standY - p.root[1]) * ctx.scale.unitsPer;
  /* The budget is what the RIG will draw, so it is computed from the CLAMPED
   * leg angles, not the raw ones. A raw knee of +40 is drawn at +10. */
  const cHL = clampTo(pose.hL, JOINT_RANGE.hL), cKL = clampTo(pose.kL, JOINT_RANGE.kL);
  const cHR = clampTo(pose.hR, JOINT_RANGE.hR), cKR = clampTo(pose.kR, JOINT_RANGE.kR);
  const dropL = TARGET.thigh * Math.cos(cHL / DEG) + TARGET.shin * Math.cos((cHL + cKL) / DEG);
  const dropR = TARGET.thigh * Math.cos(cHR / DEG) + TARGET.shin * Math.cos((cHR + cKR) / DEG);
  const budget = TARGET.leg - Math.max(dropL, dropR);
  diag.bobRaw = bobRaw;
  diag.bobBudget = budget;
  diag.footDrop = Math.max(dropL, dropR);
  /* moves.flow.js note 5: past this the fighter stands inside the pavement.
   * This is the one place a limit is applied before the clamp counter, and it
   * is reported separately as `bobFloorClamped`.
   *
   *   budget  (default) honest hip height, capped so the feet never sink
   *   plant   bob := the budget, so the lower foot is ALWAYS on the floor.
   *           Trades hip-height fidelity for ground contact. MEASURED, NOT
   *           ASSUMED: on the CMU dance corpus it changes almost nothing —
   *           the budget itself sits at ~0.6 rig units because the projected
   *           knees are always nearly straight, so `plant` and `budget` agree
   *           to a fifth of a unit and neither is visible on a contact sheet.
   *           It earns its place on takes whose knees bend IN THE SCREEN
   *           PLANE, which the CMU front-on dances never do.
   *   raw     no floor at all — for measuring what the take actually did.
   *           On salsa 60_01 raw bob reaches 3.2 units where the budget
   *           allows 0.6, which is the whole squat problem in two numbers. */
  pose.bob = ctx.bobMode === 'raw' ? bobRaw
    : ctx.bobMode === 'plant' ? clampTo(budget, JOINT_RANGE.bob)
    : Math.min(bobRaw, budget);
  diag.bobFloorClamped = ctx.bobMode !== 'raw' && pose.bob < bobRaw - 1e-6;

  return { pose: pose, diag: diag };
}

/* -------------------------------------------------------------------------- */
/* CONTEXT                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Everything `framePose` needs that is a property of the TAKE rather than of a
 * frame: the scale, the standing baseline, the side map and the modes.
 *
 * The standing baseline is the 85th percentile of root height across the WHOLE
 * take, not across the phrase — so a phrase that is entirely a crouch reads as
 * a crouch instead of re-zeroing itself to standing.
 */
export function buildContext(take, opts) {
  const o = opts || {};
  const scale = measureScale(take, o);
  const rootY = take.frames.map(function (f) { return f.p.root[1]; });
  const sideKey = o.sides === 'anatomical' ? 'anatomical' : 'screen';

  /* Assert the axis convention rather than trusting it (CONTRACT §2). */
  const warnings = [];
  let lx = 0, rx = 0, n = 0;
  for (let i = 0; i < take.frames.length; i++) {
    const f = take.frames[i].p;
    if (Math.abs(facingDeg(f)) <= FACING_LIMIT_DEG) { lx += f.lsho[0]; rx += f.rsho[0]; n++; }
  }
  if (n > 0 && lx / n <= rx / n) {
    warnings.push('AXIS: on front-facing frames the mean lsho.x (' + r1(lx / n) +
      ') is NOT right of rsho.x (' + r1(rx / n) + '). The TAKE says +X is the ' +
      'subject\'s left = screen right. This take violates it, so every side is ' +
      'mirrored. Fix the parser or pass --sides=anatomical.');
  }
  if (scale.agreement && (scale.agreement > 1.15 || scale.agreement < 0.87)) {
    warnings.push('SCALE: arm and leg scales disagree by ' +
      Math.round(Math.abs(1 - scale.agreement) * 100) + '% (arm ' + r2(scale.armScale) +
      ' vs leg ' + r2(scale.legScale) + '). Usually a mis-mapped joint, not an odd body.');
  }

  return {
    scale: scale,
    standY: quantile(rootY, o.standQuantile != null ? o.standQuantile : 0.85),
    sides: SIDE_MAP[sideKey],
    sideKey: sideKey,
    rotMode: o.rot === 'off' ? 'off' : o.rot === 'mid' ? 'mid' : 'support',
    elbowMode: o.elbow === 'hinge' ? 'hinge' : 'signed',
    bobMode: o.bob === 'raw' ? 'raw' : o.bob === 'plant' ? 'plant' : 'budget',
    unwrap: !!o.unwrap,
    warnings: warnings
  };
}

/* -------------------------------------------------------------------------- */
/* DENSE TRACK                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Retarget every frame of a take.
 *
 * Returns the RAW (unclamped) track plus the clamped one plus everything a
 * report needs. Nothing is thrown away here — the whole point is that the
 * caller can see what clamping cost.
 */
export function poseTrack(take, opts) {
  const o = opts || {};
  const ctx = o.ctx || buildContext(take, o);
  const frames = take.frames;
  const n = frames.length;

  const raw = new Array(n);
  const facing = new Float64Array(n);
  const minRatio = new Float64Array(n);
  const degenerate = new Uint8Array(n);
  const bobFloor = new Uint8Array(n);
  const t = new Float64Array(n);
  const proj = {}, flex = {};

  for (let i = 0; i < n; i++) {
    const fr = frames[i];
    const r = framePose(fr.p, ctx);
    raw[i] = r.pose;
    facing[i] = facingDeg(fr.p);
    minRatio[i] = r.diag.minRatio;
    degenerate[i] = r.diag.degenerate > 0 ? 1 : 0;
    bobFloor[i] = r.diag.bobFloorClamped ? 1 : 0;
    t[i] = typeof fr.t === 'number' ? fr.t : i / (take.fps || 120);
    for (const k in r.diag.proj) { (proj[k] || (proj[k] = [])).push(r.diag.proj[k]); }
    for (const k in r.diag.flex3d) { (flex[k] || (flex[k] = [])).push(r.diag.flex3d[k]); }
  }

  /* ---- THE BRANCH CUT -------------------------------------------------- *
   * `wrap180` gives every angle its principal value, so a limb swinging
   * through straight-up JUMPS between +179 and −179. The obvious fix is to
   * unwrap the track over time — and it is WRONG HERE, which took a rendered
   * sheet to see. EVERY joint in JOINT_RANGE lives inside ±180, so the
   * principal value is always the branch closest to what the rig can draw:
   * unwrapping can only carry a value further OUT of range. On CMU 94_01 it
   * pushed an elbow to −343°, which clamps to −150 and renders the forearm
   * across the chest, when the principal +17° was legal, correct, and exactly
   * where the camera saw the arm.
   *
   * So the crossings are COUNTED, not smoothed away. A joint that crosses the
   * cut inside a phrase has a screen angle that is not a continuous signal,
   * and no keyframe reduction of it can be honest — `anim.sample` lerps, so
   * two keyframes either side of the cut sweep the limb the long way round.
   * That is a fact about the projection, and it belongs in the report.
   *
   * `--unwrap` restores the old behaviour for experiments. It is not a fix. */
  const crossings = {};
  for (let j = 0; j < JOINTS.length; j++) {
    const name = JOINTS[j];
    if (name === 'bob') { crossings[name] = 0; continue; }
    let c = 0, off = 0;
    for (let i = 1; i < n; i++) {
      if (Math.abs(raw[i][name] - raw[i - 1][name]) > 180) c++;
      if (ctx.unwrap) {
        const e = raw[i][name] + off - raw[i - 1][name];
        if (e > 180) off -= 360; else if (e < -180) off += 360;
        raw[i][name] += off;
      }
    }
    crossings[name] = c;
  }

  const geometry = { proj: {}, flex: {} };
  for (const k in proj) {
    geometry.proj[k] = { median: r2(median(proj[k])), p05: r2(quantile(proj[k], 0.05)) };
  }
  for (const k in flex) {
    geometry.flex[k] = { median: r1(median(flex[k])), p95: r1(quantile(flex[k], 0.95)) };
  }

  return {
    take: take, ctx: ctx, n: n, t: t,
    raw: raw, facing: facing, minRatio: minRatio,
    degenerate: degenerate, bobFloor: bobFloor,
    geometry: geometry, crossings: crossings,
    fps: take.fps || 120
  };
}

/**
 * A phrase's raw poses, each joint shifted by the whole multiple of 360° that
 * MINIMISES its total clamp overshoot — the objectively best branch for a rig
 * whose every range sits inside ±180. One constant per joint, so continuity
 * inside the phrase is untouched. See the branch-cut note in `poseTrack`.
 */
export function phraseRaw(track, from, to) {
  const a = from == null ? 0 : from;
  const b = to == null ? track.n - 1 : to;
  const shift = {};
  for (let j = 0; j < JOINTS.length; j++) {
    const name = JOINTS[j];
    if (name === 'bob') { shift[name] = 0; continue; }
    const r = JOINT_RANGE[name];
    let bestK = 0, bestCost = Infinity;
    for (let k = -2; k <= 2; k++) {
      let cost = 0;
      for (let i = a; i <= b; i++) {
        const v = track.raw[i][name] + k * 360;
        cost += v < r[0] ? r[0] - v : v > r[1] ? v - r[1] : 0;
      }
      if (cost < bestCost) { bestCost = cost; bestK = k; }
    }
    shift[name] = bestK * 360;
  }
  const out = [];
  for (let i = a; i <= b; i++) {
    const src = track.raw[i], p = restPose();
    for (let j = 0; j < JOINTS.length; j++) { const nm = JOINTS[j]; p[nm] = src[nm] + shift[nm]; }
    out.push(p);
  }
  return out;
}

/** Clamp counts per joint over a frame index range. A MEASUREMENT (§3). */
export function clampStats(track, from, to) {
  const a = from == null ? 0 : from;
  const b = to == null ? track.n - 1 : to;
  const phrase = phraseRaw(track, a, b);
  const out = {};
  const total = Math.max(0, b - a + 1);
  for (let j = 0; j < JOINTS.length; j++) {
    const name = JOINTS[j];
    const r = JOINT_RANGE[name];
    let hits = 0, sumOver = 0, maxOver = 0, vals = [];
    for (let i = 0; i < phrase.length; i++) {
      const v = phrase[i][name];
      vals.push(v);
      let over = 0;
      if (v < r[0]) over = r[0] - v;
      else if (v > r[1]) over = v - r[1];
      if (over > 1e-9) {
        hits++; sumOver += over;
        if (over > maxOver) maxOver = over;
      }
    }
    out[name] = {
      joint: name,
      frames: total,
      clamped: hits,
      pctClamped: pct(hits, total),
      meanOvershoot: hits ? r1(sumOver / hits) : 0,
      maxOvershoot: r1(maxOver),
      p5: r1(quantile(vals, 0.05)),
      p50: r1(quantile(vals, 0.5)),
      p95: r1(quantile(vals, 0.95)),
      range: r
    };
  }
  return out;
}

/** Apply JOINT_RANGE to a raw pose array. Call AFTER `clampStats`. */
export function clampTrack(track, from, to) {
  const phrase = phraseRaw(track, from, to);
  const out = [];
  for (let i = 0; i < phrase.length; i++) {
    const src = phrase[i], p = restPose();
    for (let j = 0; j < JOINTS.length; j++) {
      const name = JOINTS[j];
      let v = src[name];
      if (!isFinite(v)) v = 0;
      p[name] = clampTo(v, JOINT_RANGE[name]);
    }
    out.push(p);
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/* FACING — §4, and the reason a take gets refused                             */
/* -------------------------------------------------------------------------- */

/**
 * Front-facing spans, plus the shoulder-line foreshortening that is the direct
 * physical statement of the same thing: when the shoulder line's projected
 * length collapses, so does every horizontal distance in the pose.
 */
export function facingSpans(track, opts) {
  const o = opts || {};
  const limit = o.facingLimit != null ? o.facingLimit : FACING_LIMIT_DEG;
  const n = track.n;
  const spans = [];
  let start = -1, front = 0;
  for (let i = 0; i < n; i++) {
    const ok = Math.abs(track.facing[i]) <= limit;
    if (ok) front++;
    if (ok && start < 0) start = i;
    if (!ok && start >= 0) { spans.push([start, i - 1]); start = -1; }
  }
  if (start >= 0) spans.push([start, n - 1]);
  spans.sort(function (a, b) { return (b[1] - b[0]) - (a[1] - a[0]); });

  const shoulderRatio = [];
  const fr = track.take.frames;
  const step = Math.max(1, Math.round(n / 500));
  for (let i = 0; i < n; i += step) {
    const p = fr[i].p;
    const d3 = dist3(p.lsho, p.rsho);
    shoulderRatio.push(d3 > 1e-6 ? dist2(p.lsho, p.rsho) / d3 : 1);
  }

  return {
    limit: limit,
    frontFrames: front,
    frontPct: pct(front, n),
    spans: spans,
    longest: spans.length ? spans[0] : null,
    longestSec: spans.length ? (spans[0][1] - spans[0][0] + 1) / track.fps : 0,
    shoulderProjMedian: r2(median(shoulderRatio)),
    shoulderProjMin: r2(Math.min.apply(null, shoulderRatio)),
    degeneratePct: pct(Array.prototype.reduce.call(track.degenerate, function (s, v) { return s + v; }, 0), n)
  };
}

/* -------------------------------------------------------------------------- */
/* PHRASE PICKING — §5, cut to a loop before you reduce                        */
/* -------------------------------------------------------------------------- */

/**
 * Choose the window this move is cut from.
 *
 * The search is restricted to front-facing frames (a phrase that turns away is
 * not a phrase we can use), and inside that it maximises
 *
 *     motion  −  loopWeight × loopError
 *
 * where `motion` is the mean p5..p95 excursion across joints and `loopError`
 * is the mean |first − last| pose difference. A move that ends where it began
 * can be replayed back-to-back; one that does not reads as a snap.
 *
 * `--pick=motion` drops the loop term for takes where nothing repeats.
 */
export function pickPhrase(track, opts) {
  const o = opts || {};
  const fps = track.fps;
  const limit = o.facingLimit != null ? o.facingLimit : FACING_LIMIT_DEG;
  const loopWeight = o.pick === 'motion' ? 0 : (o.loopWeight != null ? o.loopWeight : 2.0);
  const durMin = o.durMin || DUR_MIN, durMax = o.durMax || DUR_MAX;

  if (o.phrase) {                       // explicit override, in seconds
    const a = Math.max(0, Math.round(o.phrase[0] * fps));
    const b = Math.min(track.n - 1, Math.round(o.phrase[1] * fps));
    return finishPhrase(track, a, b, { forced: true, loopWeight: loopWeight, degenWeight: o.degenWeight });
  }

  const spans = facingSpans(track, { facingLimit: limit }).spans;
  const minLen = Math.round(durMin / 1000 * fps);
  const maxLen = Math.round(durMax / 1000 * fps);

  let best = null;
  const stride = Math.max(1, Math.round(fps / 20));   // 50ms search grid
  for (let s = 0; s < spans.length; s++) {
    const lo = spans[s][0], hi = spans[s][1];
    if (hi - lo + 1 < minLen) continue;
    for (let a = lo; a + minLen - 1 <= hi; a += stride) {
      for (let len = minLen; len <= maxLen; len += stride) {
        const b = a + len - 1;
        if (b > hi) break;
        const sc = scoreWindow(track, a, b, loopWeight, o.degenWeight);
        if (!best || sc.score > best.score) best = { a: a, b: b, score: sc.score };
      }
    }
  }
  if (!best) return null;
  return finishPhrase(track, best.a, best.b, { loopWeight: loopWeight, degenWeight: o.degenWeight });
}

/**
 * Score one candidate window.
 *
 *   motion    mean p5..p95 excursion across joints — a still window is not a move
 *   loopErr   mean |first − last| — a window that ends where it began replays
 *   degen     fraction of frames with a bone under DEGENERATE_RATIO projected
 *
 * `degen` is in the objective on purpose: a window can be perfectly
 * front-facing by the shoulder-line test and still be full of forearms
 * pointing down the lens, and those frames convert to noise. Choosing the
 * phrase that SURVIVES PROJECTION is the whole job, so the picker optimises
 * for it rather than leaving it to the report.
 */
function scoreWindow(track, a, b, loopWeight, degenWeight) {
  let motion = 0, loopErr = 0, cnt = 0;
  for (let j = 0; j < JOINTS.length; j++) {
    const name = JOINTS[j];
    const vals = [];
    for (let i = a; i <= b; i++) vals.push(track.raw[i][name]);
    motion += quantile(vals, 0.95) - quantile(vals, 0.05);
    loopErr += Math.abs(track.raw[a][name] - track.raw[b][name]);
    cnt++;
  }
  motion /= cnt; loopErr /= cnt;
  let degen = 0;
  for (let i = a; i <= b; i++) degen += track.degenerate[i];
  degen /= Math.max(1, b - a + 1);
  const dw = degenWeight == null ? 60 : degenWeight;
  return { motion: motion, loopErr: loopErr, degen: degen,
           score: motion - loopWeight * loopErr - dw * degen };
}

function finishPhrase(track, a, b, extra) {
  const sc = scoreWindow(track, a, b, extra.loopWeight, extra.degenWeight);
  const durMs = (b - a + 1) / track.fps * 1000;
  let offAxis = 0;
  for (let i = a; i <= b; i++) if (Math.abs(track.facing[i]) > FACING_LIMIT_DEG) offAxis++;
  return {
    from: a, to: b, frames: b - a + 1,
    startSec: r2(track.t[a]), endSec: r2(track.t[b]),
    durMs: Math.round(durMs),
    motion: r1(sc.motion), loopErr: r1(sc.loopErr), score: r1(sc.score),
    degenPct: pct(sc.degen * (b - a + 1), b - a + 1),
    offAxisFrames: offAxis, forced: !!extra.forced
  };
}

/* -------------------------------------------------------------------------- */
/* SMOOTHING                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Gaussian smoothing of the angle tracks, declared rather than hidden.
 *
 * 120fps mocap carries marker jitter that RDP faithfully spends knots on. The
 * residual is always measured against the UNSMOOTHED clamped track, so this
 * can only cost error, never hide it.
 */
export function smoothPoses(poses, fps, ms) {
  if (!(ms > 0) || poses.length < 3) return poses;
  const sigma = ms / 1000 * fps / 2;
  if (sigma < 0.4) return poses;
  const half = Math.max(1, Math.ceil(sigma * 2.5));
  const k = [];
  let ksum = 0;
  for (let i = -half; i <= half; i++) { const w = Math.exp(-(i * i) / (2 * sigma * sigma)); k.push(w); ksum += w; }
  const out = [];
  for (let i = 0; i < poses.length; i++) {
    const p = restPose();
    for (let j = 0; j < JOINTS.length; j++) {
      const name = JOINTS[j];
      let s = 0;
      for (let d = -half; d <= half; d++) {
        const idx = Math.min(poses.length - 1, Math.max(0, i + d));
        s += poses[idx][name] * k[d + half];
      }
      p[name] = s / ksum;
    }
    out.push(p);
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/* REDUCTION — §5                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Ramer–Douglas–Peucker on one (t, value) track, using VERTICAL distance to
 * the chord. Perpendicular distance in a mixed seconds/degrees space is
 * meaningless; vertical distance is in degrees, which is the unit the
 * tolerance is quoted in.
 *
 * Used to SEED and to report ("plain RDP would need N knots"). The knots that
 * actually ship are chosen by `greedyKnots`, because RDP fits piecewise-LINEAR
 * and `anim.sample()` reconstructs piecewise-SMOOTHSTEP. Fitting against the
 * wrong reconstruction is how a reduction reports 3° and renders 9°.
 */
export function rdp(t, v, tol) {
  const keep = new Uint8Array(t.length);
  keep[0] = 1; keep[t.length - 1] = 1;
  const stack = [[0, t.length - 1]];
  while (stack.length) {
    const seg = stack.pop();
    const a = seg[0], b = seg[1];
    if (b - a < 2) continue;
    const t0 = t[a], v0 = v[a], span = t[b] - t0;
    let worst = -1, wi = -1;
    for (let i = a + 1; i < b; i++) {
      const k = span > 1e-12 ? (t[i] - t0) / span : 0;
      const d = Math.abs(v[i] - (v0 + (v[b] - v0) * k));
      if (d > worst) { worst = d; wi = i; }
    }
    if (worst > tol && wi > 0) { keep[wi] = 1; stack.push([a, wi]); stack.push([wi, b]); }
  }
  const idx = [];
  for (let i = 0; i < keep.length; i++) if (keep[i]) idx.push(i);
  return idx;
}

/** Build a move object from a set of knot indices into the dense track. */
function moveFrom(knots, t01, poses, emitted, durMs, decimals) {
  const frames = [];
  const mul = Math.pow(10, decimals);
  /* t is carried as INTEGER HUNDREDTHS and divided once at the end. Doing the
   * strictly-increasing nudge in floating point emitted `t: 0.060000000000000005`
   * into a move literal a human is expected to read and edit. */
  let last = -1;
  for (let n = 0; n < knots.length; n++) {
    const i = knots[n];
    let c = Math.round(t01[i] * 100);
    if (n === 0) c = 0;
    if (n === knots.length - 1) c = 100;
    if (c <= last) c = Math.min(100, last + 1);
    last = c;
    const tv = c / 100;
    const f = { t: tv };
    for (let j = 0; j < emitted.length; j++) {
      const name = emitted[j];
      f[name] = Math.round(poses[i][name] * mul) / mul;
    }
    frames.push(f);
  }
  return { dur: durMs, lag: 0, frames: frames };
}

/**
 * Error of a candidate move against the dense reference, measured by running
 * the move through the REAL `anim.sample()`. This is the round trip, not an
 * approximation of it.
 */
function moveError(move, t01, ref, emitted) {
  const per = {};
  for (let j = 0; j < emitted.length; j++) per[emitted[j]] = { max: 0, sq: 0, n: 0, at: 0 };
  let worst = 0, worstAt = 0, worstJoint = null;
  /* per-sample worst error, so the greedy step can fall through to the next
   * best candidate when its first choice is already a knot */
  const byIndex = new Float64Array(t01.length);
  for (let i = 0; i < t01.length; i++) {
    const s = sample(move, t01[i], 1);
    let here = 0;
    for (let j = 0; j < emitted.length; j++) {
      const name = emitted[j];
      const e = Math.abs(s[name] - ref[i][name]);
      const p = per[name];
      p.sq += e * e; p.n++;
      if (e > p.max) { p.max = e; p.at = i; }
      if (e > here) here = e;
      if (e > worst) { worst = e; worstAt = i; worstJoint = name; }
    }
    byIndex[i] = here;
  }
  for (const k in per) per[k].rms = Math.sqrt(per[k].sq / Math.max(1, per[k].n));
  return { per: per, worst: worst, worstAt: worstAt, worstJoint: worstJoint, byIndex: byIndex };
}

/**
 * Reduce a dense phrase to keyframes.
 *
 * Greedy forward selection: start with {0, 1}, repeatedly insert the sample
 * where the reconstruction is furthest from the reference, stop when the worst
 * joint is inside `tol` or the knot budget runs out. Candidates are seeded
 * from the RDP knot union so the search grid is cheap, then the whole dense
 * grid is used for refinement.
 *
 * A joint is EMITTED only if it ever reaches `moveEps` degrees. An omitted
 * joint is zero by the rig's own rule, and "only the joints that actually
 * move" is CONTRACT §5 — but the test is max |value|, NOT range: a joint
 * holding a constant 12° is doing something and must be written down.
 */
export function reduceToMove(dense, t01, opts) {
  const o = opts || {};
  const tol = o.tol != null ? o.tol : 4;
  const maxKnots = o.maxKnots != null ? o.maxKnots : 7;
  const eps = o.moveEps != null ? o.moveEps : 1.5;
  const decimals = o.decimals != null ? o.decimals : 0;
  const ref = o.ref || dense;                        // unsmoothed truth
  const durMs = o.durMs;

  /* which joints are doing anything at all */
  const emitted = [];
  const dropped = [];
  const peak = {};
  for (let j = 0; j < JOINTS.length; j++) {
    const name = JOINTS[j];
    let m = 0;
    for (let i = 0; i < dense.length; i++) { const a = Math.abs(dense[i][name]); if (a > m) m = a; }
    peak[name] = r1(m);
    if (o.upperOnly && LOWER.indexOf(name) >= 0) { dropped.push(name); continue; }
    if (m >= eps) emitted.push(name); else dropped.push(name);
  }

  /* RDP seeds, for the candidate set and for the report */
  const tArr = Array.prototype.slice.call(t01);
  const seedSet = {};
  let rdpUnion = 0;
  for (let j = 0; j < emitted.length; j++) {
    const name = emitted[j];
    const v = dense.map(function (p) { return p[name]; });
    const idx = rdp(tArr, v, tol);
    for (let k = 0; k < idx.length; k++) seedSet[idx[k]] = 1;
  }
  rdpUnion = Object.keys(seedSet).length;

  /* greedy forward selection against the real sampler */
  let knots = [0, dense.length - 1];
  let move = moveFrom(knots, t01, dense, emitted, durMs, decimals);
  let err = moveError(move, t01, ref, emitted);
  const history = [{ knots: 2, worst: r1(err.worst) }];

  while (err.worst > tol && knots.length < maxKnots) {
    /* Insert at the worst ELIGIBLE sample. The first version broke out of the
     * loop whenever the argmax landed on an existing knot or an endpoint,
     * which quietly shipped a 4-knot fit of a 7-knot budget and a 183°
     * residual on a take that had six knots' worth of detail to give. */
    /* ⛔ MINIMUM KNOT SPACING. Without it the greedy stacks knots on top of a
     * discontinuity it can never fit: on CMU 60_01, whose eL crosses the
     * branch cut, it spent four of its seven knots inside the first 6% of the
     * clip (t 0, 0.01, 0.05, 0.06, …) trying to fit a vertical wall, and left
     * the whole second half on two knots. Two keyframes 14ms apart are not
     * keyframes, they are a step, and `anim.sample` smoothsteps across them
     * into a snap.
     *
     * MEASURED over the corpus, mean per-joint RMS residual, gap 0 → 0.05:
     *   salsa 10.2→8.3   salsa2 7.7→4.1   modern 11.7→8.7   indian 17.4→15.8
     *   breakdance 2.8→2.8 (its knots were already 0.12 apart)
     * The PEAK residual gets worse on three of five (salsa 92.6→136.4),
     * because the peak sits on a branch cut that no number of knots can fit
     * and is reported separately. Trading a spike nobody can fix for a better
     * fit across the whole clip is the right trade. `--min-gap 0` undoes it. */
    const minGap = Math.max(1, Math.round((o.minGap != null ? o.minGap : 0.05) * (dense.length - 1)));
    let at = -1, best = -1;
    for (let i = 1; i < dense.length - 1; i++) {
      if (err.byIndex[i] <= best) continue;
      let tooClose = false;
      for (let k = 0; k < knots.length; k++) if (Math.abs(knots[k] - i) < minGap) { tooClose = true; break; }
      if (!tooClose) { best = err.byIndex[i]; at = i; }
    }
    if (at < 0) break;
    knots.push(at);
    knots.sort(function (a, b) { return a - b; });
    move = moveFrom(knots, t01, dense, emitted, durMs, decimals);
    err = moveError(move, t01, ref, emitted);
    history.push({ knots: knots.length, worst: r1(err.worst) });
  }

  const residual = {};
  for (const k in err.per) {
    residual[k] = { max: r1(err.per[k].max), rms: r1(err.per[k].rms) };
  }

  return {
    move: move,
    knots: knots.length,
    emitted: emitted,
    dropped: dropped,
    peak: peak,
    tol: tol,
    metTolerance: err.worst <= tol,
    worst: r1(err.worst),
    worstJoint: err.worstJoint,
    residual: residual,
    rdpKnots: rdpUnion,
    history: history
  };
}

/* -------------------------------------------------------------------------- */
/* THE WHOLE JOB                                                               */
/* -------------------------------------------------------------------------- */

/**
 * TAKE in, proposed move + honest report out.
 *
 * @param {Object} take
 * @param {Object} [opts]
 *   id, name, cat, tier              move metadata passed straight through
 *   sides   'screen'|'anatomical'    default screen (see header note 1)
 *   rot     'support'|'mid'|'off'     default support
 *   elbow   'signed'|'hinge'         default signed (see header note 4)
 *   bob     'budget'|'raw'           default budget (see header note 5)
 *   phrase  [startSec, endSec]       explicit window
 *   pick    'loop'|'motion'          default loop
 *   tol     degrees, default 4
 *   maxKnots default 7
 *   minGap   smallest allowed knot spacing as a fraction of the clip, default 0.05
 *   smoothMs default 50
 *   upperOnly                        emit a 100/0 move
 */
export function takeToMove(take, opts) {
  const o = opts || {};
  const track = poseTrack(take, o);
  const facing = facingSpans(track, o);
  const warnings = track.ctx.warnings.slice();

  const phrase = pickPhrase(track, o);
  if (!phrase) {
    return {
      ok: false, verdict: 'REJECTED', take: take, track: track, ctx: track.ctx, facing: facing,
      reasons: [reject(take, facing, o)],
      warnings: warnings, move: null
    };
  }

  const stats = clampStats(track, phrase.from, phrase.to);
  const clampedRaw = clampTrack(track, phrase.from, phrase.to);

  /* branch-cut crossings INSIDE the phrase — a joint that crosses cannot be
   * keyframed honestly, because anim.sample() lerps and will sweep the limb
   * the long way round between the two keyframes either side of the cut. */
  const pr = phraseRaw(track, phrase.from, phrase.to);
  const crossings = {};
  for (let j = 0; j < JOINTS.length; j++) {
    const name = JOINTS[j];
    let c = 0;
    if (name !== 'bob') {
      for (let i = 1; i < pr.length; i++) if (Math.abs(pr[i][name] - pr[i - 1][name]) > 180) c++;
    }
    crossings[name] = c;
  }
  const smoothed = smoothPoses(clampedRaw, track.fps, o.smoothMs != null ? o.smoothMs : 50);

  const n = clampedRaw.length;
  const t01 = new Float64Array(n);
  for (let i = 0; i < n; i++) t01[i] = n > 1 ? i / (n - 1) : 0;

  let durMs = phrase.durMs;
  if (durMs < DUR_MIN) durMs = DUR_MIN;
  if (durMs > DUR_MAX) durMs = DUR_MAX;
  durMs = Math.round(durMs / 10) * 10;

  const red = reduceToMove(smoothed, t01, {
    tol: o.tol, maxKnots: o.maxKnots, moveEps: o.moveEps, decimals: o.decimals,
    minGap: o.minGap, durMs: durMs, ref: clampedRaw, upperOnly: o.upperOnly
  });

  /* ---- verdict --------------------------------------------------------- */
  const reasons = [];
  let verdict = 'OK';

  /* ⛔ JUDGE ONLY THE JOINTS THE MOVE ACTUALLY CONTAINS.
   * With --upper-only the lower body is discarded ON PURPOSE, and letting a
   * discarded knee's 64% clamp drag the verdict to FLAGGED buries the very
   * result CONTRACT §0 says to report: "only the upper body survives" is an
   * acceptable answer, and a clean 100/0 move should say OK and mean it. The
   * discard is still stated in the header line, so nothing is hidden. */
  const judged = o.upperOnly ? UPPER : JOINTS;
  const heavy = [];
  for (let j = 0; j < judged.length; j++) {
    const s = stats[judged[j]];
    if (s.pctClamped >= (o.clampWarn != null ? o.clampWarn : 25)) heavy.push(s);
  }
  if (heavy.length) {
    verdict = 'FLAGGED';
    reasons.push('CLAMPED: ' + heavy.map(function (s) {
      return s.joint + ' ' + s.pctClamped + '% (mean ' + s.meanOvershoot + '° over, worst ' + s.maxOvershoot + '°)';
    }).join(', ') + '. These joints did not convert — they were flattened onto the range wall.');
  }

  let bobFloor = 0;
  for (let i = phrase.from; i <= phrase.to; i++) bobFloor += track.bobFloor[i];
  if (!o.upperOnly && pct(bobFloor, phrase.frames) >= 25) {
    if (verdict === 'OK') verdict = 'FLAGGED';
    reasons.push('FLOOR: bob hit the foot budget on ' + pct(bobFloor, phrase.frames) +
      '% of frames. A real knee bends toward the CAMERA, so it projects to almost ' +
      'no screen angle: the rig\'s legs stay nearly straight, the lower foot already ' +
      'reaches the floor, and there is no room left to lower the hips. The subject\'s ' +
      'weight drop is not in this move — it cannot be. (moves.flow.js note 5.)');
  }

  let degen = 0;
  for (let i = phrase.from; i <= phrase.to; i++) degen += track.degenerate[i];
  if (pct(degen, phrase.frames) >= 25) {
    if (verdict === 'OK') verdict = 'FLAGGED';
    reasons.push('FORESHORTENED: ' + pct(degen, phrase.frames) + '% of frames have a bone ' +
      'projecting to under ' + Math.round(DEGENERATE_RATIO * 100) + '% of its true length. ' +
      'Those screen angles are mostly noise.');
  }

  /* A window can be front-facing, unclamped, cleanly reducible — and still not
   * be a move, because nothing happened in it. The phrase picker will happily
   * find the calm two seconds inside a turning take, which is the RIGHT thing
   * to do and the WRONG thing to ship silently. */
  if (phrase.motion < (o.motionFloor != null ? o.motionFloor : 22)) {
    if (verdict === 'OK') verdict = 'FLAGGED';
    reasons.push('BARELY MOVES: the best phrase has ' + phrase.motion + '° of mean joint ' +
      'excursion. For scale, the hand-authored FLOW moves run 40–90°. If the take is ' +
      'mostly turns, this is the picker correctly finding the only front-facing seconds ' +
      'in it — and those seconds are the dancer standing still.');
  }

  const crossed = judged.filter(function (j) { return crossings[j] > 0; });
  if (crossed.length) {
    if (verdict === 'OK') verdict = 'FLAGGED';
    reasons.push('BRANCH CUT: ' + crossed.map(function (j) { return j + ' ×' + crossings[j]; }).join(', ') +
      '. That limb\'s projected direction jumps a half turn — it passed through ' +
      'the camera axis, where a front view cannot tell which way it went. Keyframes ' +
      'either side of a cut interpolate the long way round.');
  }

  const rotP95 = Math.max(Math.abs(stats.rot.p5), Math.abs(stats.rot.p95));
  if (!o.upperOnly && rotP95 > 25) {
    if (verdict === 'OK') verdict = 'FLAGGED';
    reasons.push('ROLL: rot reaches ' + r1(rotP95) + '° — past the ~25° where ' +
      'moves.flow.js note 2 says it stops reading as body angle and starts reading ' +
      'as a fall. rot also TRANSLATES the figure about the ground point, so this ' +
      'slides the whole body ' + Math.round(82 * Math.sin(rotP95 / DEG)) + ' units sideways.');
  }

  if (phrase.offAxisFrames > 0) {
    if (verdict === 'OK') verdict = 'FLAGGED';
    reasons.push('OFF-AXIS: ' + phrase.offAxisFrames + ' of ' + phrase.frames +
      ' phrase frames are past ±' + facing.limit + '° of camera.');
  }

  if (!red.metTolerance) {
    if (verdict === 'OK') verdict = 'FLAGGED';
    reasons.push('RESIDUAL: ' + red.knots + ' knots (the budget) still leave ' + red.worst +
      '° on ' + red.worstJoint + ', over the ' + red.tol + '° tolerance.');
  }

  if (o.upperOnly) {
    reasons.push('UPPER ONLY (by request): rot/bob/hL/kL/hR/kR were dropped, so this ' +
      'is a 100/0 move and the lower-body numbers are FYI, not defects. For the record ' +
      'they were ' + LOWER.map(function (j) { return j + ' ' + stats[j].pctClamped + '%'; })
        .join(' ') + ' clamped.');
  }

  /* upper vs lower — the §0 answer, per take */
  const worstUpper = Math.max.apply(null, UPPER.map(function (j) { return stats[j].pctClamped; }));
  const worstLower = Math.max.apply(null, LOWER.map(function (j) { return stats[j].pctClamped; }));

  const move = Object.assign({
    id: o.id || (take.label || 'move').replace(/[^a-z0-9]/gi, '').toLowerCase(),
    name: o.name || (take.label || 'Untitled'),
    cat: o.cat || 'FLOW',
    /* V3, NOT V1, and this default is load-bearing. CONTRACT §8 closes the V1
       list at thirteen ids — V1 means a named outlet documented that specific
       gesture inside a real aura battle. A move retargeted from a mocap library
       is our own design work built on licensed motion: that is V3 by definition,
       and it is the honest label rather than a hedge. Defaulting to V1 pushed a
       false evidence claim onto validate.js to catch. */
    tier: o.tier || 'V3',
    base: o.base != null ? o.base : 50,
    up: o.up != null ? o.up : (red.emitted.some(function (j) { return LOWER.indexOf(j) >= 0; }) ? 0.6 : 1.0),
    lo: o.lo != null ? o.lo : (red.emitted.some(function (j) { return LOWER.indexOf(j) >= 0; }) ? 0.4 : 0.0),
    idealAmp: o.idealAmp != null ? o.idealAmp : 1.0,
    hint: o.hint || ''
  }, red.move);

  return {
    ok: verdict !== 'REJECTED',
    verdict: verdict,
    reasons: reasons,
    warnings: warnings,
    take: take, track: track, ctx: track.ctx,
    facing: facing, phrase: phrase, stats: stats, crossings: crossings,
    reduction: red, move: move,
    upperOnly: !!o.upperOnly,
    bobFloorPct: pct(bobFloor, phrase.frames),
    degeneratePct: pct(degen, phrase.frames),
    worstUpperClampPct: worstUpper,
    worstLowerClampPct: worstLower
  };
}

/**
 * Say WHY, precisely. "No front-facing span" has two completely different
 * causes and telling a caller the wrong one sends them to fix the wrong thing:
 * a 16-frame clip is 100% front-facing and still unusable, and saying it
 * "turns away from camera" is simply false.
 */
function reject(take, facing, o) {
  const need = (o.durMin || DUR_MIN) / 1000;
  const total = take.frames.length / (take.fps || 120);
  if (total < need) {
    return 'TOO SHORT: the take is ' + r1(total) + 's and a move needs at least ' +
      need + 's. Nothing is wrong with the motion — there just is not enough of it.';
  }
  if (facing.frontPct >= 90) {
    return 'NO CONTINUOUS SPAN: ' + facing.frontPct + '% of the take is front-facing but the ' +
      'longest UNBROKEN run is only ' + r1(facing.longestSec) + 's, short of the ' + need +
      's a move needs. The subject keeps flicking off axis. Try --facing-limit, or cut ' +
      'a phrase by hand with --phrase.';
  }
  return 'TURNS AWAY: only ' + facing.frontPct + '% of the take is within ±' + facing.limit +
    '° of camera and the longest front-facing run is ' + r1(facing.longestSec) + 's, short of ' +
    'the ' + need + 's a move needs. A front projection of a turning body collapses its ' +
    'limbs to nothing; there is no honest move in here.';
}

/* -------------------------------------------------------------------------- */
/* OUTPUT                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Print a move as a `moves.*.js` literal. PROPOSED OUTPUT — a human reads it
 * and pastes it, or does not. Nothing in this file writes to `src/`.
 */
export function formatMove(res, opts) {
  const o = opts || {};
  const m = res.move;
  const t = res.take;
  const L = [];
  L.push('  // ── ' + m.name.toUpperCase() + ' ' + '─'.repeat(Math.max(2, 62 - m.name.length)));
  L.push('  // PROPOSED, NOT APPROVED. Retargeted from ' + t.source + ' (' + t.label + ')');
  L.push('  // by tools/mocap/retarget.js.');
  /* CONTRACT §1: credit mocap.cs.cmu.edu wherever CMU-derived motion ships —
   * and do NOT stamp that credit onto motion that did not come from there.
   * A false provenance line is worse than none: it is the line a reviewer
   * trusts instead of checking, and the licences differ per source. */
  if (/(^|[\/])cmu[\/]/i.test(t.source) || /cmu/i.test(t.source)) {
    L.push('  // Motion data: CMU Graphics Lab Mocap Database, mocap.cs.cmu.edu —');
    L.push('  // free for commercial use, credit it wherever this ships.');
  } else {
    L.push('  // ⚠ SOURCE NOT IDENTIFIED AS CMU. Confirm the licence of');
    L.push('  // "' + t.source + '" before this ships (CONTRACT §1).');
  }
  L.push('  //');
  L.push('  // phrase   ' + res.phrase.startSec + 's–' + res.phrase.endSec + 's of the source (' +
    res.phrase.frames + ' frames @ ' + res.track.fps + 'fps)');
  L.push('  // knots    ' + res.reduction.knots + '   tolerance ±' + res.reduction.tol +
    '°   worst residual ' + res.reduction.worst + '° on ' + (res.reduction.worstJoint || '—'));
  const clamped = JOINTS.filter(function (j) { return res.stats[j].pctClamped > 0; })
    .map(function (j) { return j + ' ' + res.stats[j].pctClamped + '%'; }).join(' ');
  L.push('  // clamp    ' + (clamped || 'none'));
  L.push('  // verdict  ' + res.verdict);
  for (let i = 0; i < res.reasons.length; i++) {
    const wrapped = String(res.reasons[i]).match(/.{1,68}(\s|$)/g) || [res.reasons[i]];
    for (let k = 0; k < wrapped.length; k++) L.push('  //   ' + (k ? '  ' : '! ') + wrapped[k].trim());
  }
  L.push('  {');
  L.push('    id: ' + JSON.stringify(m.id) + ',');
  L.push('    name: ' + JSON.stringify(m.name) + ',');
  L.push('    cat: ' + JSON.stringify(m.cat) + ', tier: ' + JSON.stringify(m.tier) + ',');
  L.push('    base: ' + m.base + ', up: ' + m.up.toFixed(1) + ', lo: ' + m.lo.toFixed(1) +
    ', idealAmp: ' + m.idealAmp.toFixed(2) + ',');
  L.push('    dur: ' + m.dur + ',');
  L.push('    lag: ' + m.lag + ',');
  if (m.hint) L.push('    hint: ' + JSON.stringify(m.hint) + ',');
  L.push('    frames: [');
  const order = JOINTS.filter(function (j) { return res.reduction.emitted.indexOf(j) >= 0; });
  for (let i = 0; i < m.frames.length; i++) {
    const f = m.frames[i];
    const parts = ['t: ' + f.t];
    for (let j = 0; j < order.length; j++) {
      if (f[order[j]] !== undefined) parts.push(order[j] + ': ' + f[order[j]]);
    }
    L.push('      { ' + parts.join(', ') + ' }' + (i < m.frames.length - 1 ? ',' : ''));
  }
  L.push('    ]');
  L.push('  }' + (o.trailingComma === false ? '' : ','));
  return L.join('\n');
}

function bar(p, width) {
  const w = width || 20;
  const n = Math.round(Math.min(100, Math.max(0, p)) / 100 * w);
  return '█'.repeat(n) + '·'.repeat(w - n);
}

/** The report a human reads to decide whether the projection survived. */
export function formatReport(res) {
  const L = [];
  const t = res.take;
  L.push('═'.repeat(78));
  L.push('RETARGET  ' + t.source + '  "' + t.label + '"   ' + t.frames.length + ' frames @ ' +
    t.fps + 'fps' + (t.units ? '  units=' + t.units : ''));
  L.push('═'.repeat(78));

  const sc = res.ctx.scale;
  L.push('SCALE     leg ' + r1(sc.legLen) + ' → 81 rig  (×' + r2(sc.legScale) + ')' +
    '   arm ' + r1(sc.armLen) + ' → 50 rig  (×' + r2(sc.armScale) + ')' +
    '   agreement ' + r2(sc.agreement));
  L.push('SIDES     rig L ← mocap ' + res.ctx.sides.L + '*   rig R ← mocap ' + res.ctx.sides.R +
    '*   (' + res.ctx.sideKey + ')');
  L.push('MODES     rot=' + res.ctx.rotMode + '  elbow=' + res.ctx.elbowMode + '  bob=' + res.ctx.bobMode +
    (res.ctx.unwrap ? '  unwrap=on' : ''));

  L.push('');
  L.push('FACING    ' + res.facing.frontPct + '% of the take within ±' + res.facing.limit +
    '°   ' + bar(res.facing.frontPct));
  L.push('          longest front-facing run ' + r1(res.facing.longestSec) + 's' +
    '   shoulder line projects at ' + res.facing.shoulderProjMedian + ' of true (min ' +
    res.facing.shoulderProjMin + ')');
  L.push('          ' + res.facing.degeneratePct + '% of frames have a bone under ' +
    Math.round(DEGENERATE_RATIO * 100) + '% projected length');

  if (!res.ok) {
    L.push('');
    L.push('VERDICT   ' + res.verdict);
    for (let i = 0; i < res.reasons.length; i++) L.push('  ! ' + res.reasons[i]);
    return L.join('\n');
  }

  L.push('');
  L.push('PHRASE    ' + res.phrase.startSec + 's … ' + res.phrase.endSec + 's   (' +
    res.phrase.frames + ' frames, ' + res.phrase.durMs + 'ms' +
    (res.phrase.forced ? ', forced' : '') + ')');
  L.push('          motion ' + res.phrase.motion + '°   loop error ' + res.phrase.loopErr +
    '°   off-axis frames ' + res.phrase.offAxisFrames + '   degenerate ' + res.phrase.degenPct + '%');

  L.push('');
  L.push('JOINT      range        p5     p50     p95   clamped            residual');
  L.push('─'.repeat(78));
  for (let j = 0; j < JOINTS.length; j++) {
    const name = JOINTS[j];
    const s = res.stats[name];
    const r = res.reduction.residual[name];
    const emitted = res.reduction.emitted.indexOf(name) >= 0;
    const xs = res.crossings[name];
    L.push(
      '  ' + name.padEnd(5) +
      ('[' + s.range[0] + ',' + s.range[1] + ']').padStart(11) +
      String(s.p5).padStart(8) + String(s.p50).padStart(8) + String(s.p95).padStart(8) +
      '   ' + (String(s.pctClamped) + '%').padStart(6) + ' ' + bar(s.pctClamped, 10) +
      (emitted ? '  max ' + r.max + '° rms ' + r.rms + '°' : '  (omitted, peak ' + res.reduction.peak[name] + '°)') +
      (xs ? '  ⚠' + xs + ' branch' : '')
    );
  }

  L.push('');
  L.push('PROJECTION  how much of each bone the camera could actually see, and');
  L.push('            how much of each hinge\'s TRUE 3D bend survived to screen');
  L.push('─'.repeat(78));
  const g = res.track.geometry;
  const pairs = [['sL', 'eL'], ['sR', 'eR'], ['hL', 'kL'], ['hR', 'kR']];
  for (let i = 0; i < pairs.length; i++) {
    const up = pairs[i][0], lo = pairs[i][1];
    const gp = g.proj[up] || { median: 1, p05: 1 }, gl = g.proj[lo] || { median: 1, p05: 1 };
    const fx = g.flex[lo] || { median: 0, p95: 0 };
    const seen = res.stats[lo];
    L.push('  ' + up + '/' + lo + '   projected length ' + gp.median + ' / ' + gl.median +
      ' of true (worst 5% ' + gp.p05 + ' / ' + gl.p05 + ')');
    L.push('          true 3D bend at ' + lo + ': median ' + fx.median + '° p95 ' + fx.p95 +
      '°   →  screen angle p5..p95 ' + seen.p5 + '..' + seen.p95 + '°');
  }

  L.push('');
  L.push('REDUCE    ' + res.phrase.frames + ' frames → ' + res.reduction.knots + ' knots' +
    '   (plain RDP at ±' + res.reduction.tol + '° wanted ' + res.reduction.rdpKnots + ')');
  L.push('          worst residual through anim.sample(): ' + res.reduction.worst + '° on ' +
    (res.reduction.worstJoint || '—') + '   tolerance ±' + res.reduction.tol + '°  ' +
    (res.reduction.metTolerance ? 'MET' : 'NOT MET'));
  L.push('          emitted ' + (res.reduction.emitted.join(' ') || '(none)'));
  L.push('          omitted ' + (res.reduction.dropped.join(' ') || '(none)'));

  L.push('');
  L.push('SURVIVAL  upper body worst clamp ' + res.worstUpperClampPct + '%   ' + bar(res.worstUpperClampPct, 14));
  L.push('          lower body worst clamp ' + res.worstLowerClampPct + '%   ' + bar(res.worstLowerClampPct, 14));
  if (!res.upperOnly && res.worstLowerClampPct >= 25 && res.worstUpperClampPct < 25) {
    L.push('          → the upper body survived and the lower body did not. Re-run with');
    L.push('            --upper-only and take it as a 100/0 move; that is the honest cut.');
  }

  L.push('');
  L.push('VERDICT   ' + res.verdict);
  for (let i = 0; i < res.reasons.length; i++) L.push('  ! ' + res.reasons[i]);
  for (let i = 0; i < res.warnings.length; i++) L.push('  ⚠ ' + res.warnings[i]);
  return L.join('\n');
}

/* -------------------------------------------------------------------------- */
/* ROUND TRIP — the test CONTRACT §5 actually asks for                         */
/* -------------------------------------------------------------------------- */

/**
 * Sample the emitted move back through the real `anim.sample()` at `n` evenly
 * spaced times. This is what a renderer will draw, so it is what a contact
 * sheet must be built from — `cli.js` calls this rather than reading
 * `move.frames` directly, so what is looked at is what will play.
 */
export function movePoses(move, n, amp) {
  const c = Math.max(2, n | 0 || 12);
  const out = [];
  for (let i = 0; i < c; i++) out.push(sample(move, i / (c - 1), amp == null ? 1 : amp));
  return out;
}

/**
 * The same times taken from the SOURCE side: the dense retargeted, clamped
 * poses of the chosen phrase, sampled at the same normalised times. Pair it
 * with `movePoses` and a contact sheet shows source over reconstruction.
 */
export function sourcePoses(res, n) {
  const c = Math.max(2, n | 0 || 12);
  const dense = clampTrack(res.track, res.phrase.from, res.phrase.to);
  const out = [];
  for (let i = 0; i < c; i++) {
    const idx = Math.round(i / (c - 1) * (dense.length - 1));
    out.push(dense[idx]);
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/* CLI                                                                         */
/* -------------------------------------------------------------------------- */

function parseArgs(argv) {
  const flags = {}, pos = [];
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.slice(0, 2) === '--') {
      const eq = a.indexOf('=');
      if (eq > 0) flags[a.slice(2, eq)] = a.slice(eq + 1);
      else if (argv[i + 1] && argv[i + 1].slice(0, 2) !== '--') flags[a.slice(2)] = argv[++i];
      else flags[a.slice(2)] = true;
    } else pos.push(a);
  }
  return { flags: flags, pos: pos };
}

const USAGE = [
  'usage: node retarget.js <skeleton.asf> <motion.amc>',
  '       node retarget.js <motion.bvh>',
  '       node retarget.js <take.json>',
  '',
  '  --label s --id s --name s --cat FLOW|FLEX|BAIT',
  '  --sides screen|anatomical   which mocap side drives rig L   (default screen)',
  '  --rot support|mid|off       pivot rot turns about          (default support)',
  '  --elbow signed|hinge        true projected angle vs -|angle| (default signed)',
  '  --bob budget|plant|raw      hip height model                (default budget)',
  '  --phrase a,b                window in SECONDS; otherwise auto',
  '  --pick loop|motion          phrase objective                (default loop)',
  '  --facing-limit deg          how far off camera is still usable (default 40)',
  '  --unwrap                    unwrap the angle tracks over time (diagnostic only)',
  '  --tol n --max-knots n --min-gap frac --smooth-ms n --decimals n',
  '  --upper-only                emit a 100/0 move, lower joints dropped',
  '  --out f.js                  write the proposed move literal',
  '  --json f.json               write the full report as JSON',
  '  --quiet',
  '',
  'exit 0 = a usable move   1 = converted but FLAGGED   2 = REJECTED'
].join('\n');

async function loadTake(pos, flags) {
  const fs = await import('node:fs');
  const asf = pos.filter(function (p) { return /\.asf$/i.test(p); })[0];
  const amc = pos.filter(function (p) { return /\.amc$/i.test(p); })[0];
  const bvhF = pos.filter(function (p) { return /\.bvh$/i.test(p); })[0];
  const json = pos.filter(function (p) { return /\.json$/i.test(p); })[0];
  const common = { label: flags.label, source: flags.source };

  if (asf && amc) {
    const m = await import('./asfamc.js');
    return m.takeFromFiles(asf, amc, common);
  }
  if (bvhF) {
    const m = await import('./bvh.js');
    return m.loadBVH(bvhF, Object.assign({ range: [1, null], refFrame: 1 }, common));
  }
  if (json) {
    const take = JSON.parse(fs.readFileSync(json, 'utf8'));
    if (flags.label) take.label = flags.label;
    return take;
  }
  return null;
}

async function cli(argv) {
  const a = parseArgs(argv);
  if (!a.pos.length || a.flags.help) { console.log(USAGE); return a.pos.length ? 0 : 2; }

  const take = await loadTake(a.pos, a.flags);
  if (!take) { console.error('no readable input\n\n' + USAGE); return 2; }

  const opts = {
    id: a.flags.id, name: a.flags.name, cat: a.flags.cat,
    sides: a.flags.sides, rot: a.flags.rot, elbow: a.flags.elbow, bob: a.flags.bob,
    pick: a.flags.pick, unwrap: !!a.flags.unwrap,
    facingLimit: a.flags['facing-limit'] != null ? Number(a.flags['facing-limit']) : undefined,
    phrase: a.flags.phrase ? String(a.flags.phrase).split(',').map(Number) : null,
    tol: a.flags.tol != null ? Number(a.flags.tol) : undefined,
    maxKnots: a.flags['max-knots'] != null ? Number(a.flags['max-knots']) : undefined,
    minGap: a.flags['min-gap'] != null ? Number(a.flags['min-gap']) : undefined,
    smoothMs: a.flags['smooth-ms'] != null ? Number(a.flags['smooth-ms']) : undefined,
    decimals: a.flags.decimals != null ? Number(a.flags.decimals) : undefined,
    upperOnly: !!a.flags['upper-only']
  };

  const res = takeToMove(take, opts);

  if (!a.flags.quiet) {
    console.log(formatReport(res));
    if (res.ok) { console.log(''); console.log(formatMove(res)); }
  }

  const fs = await import('node:fs');
  if (a.flags.out && res.ok) {
    fs.writeFileSync(a.flags.out, formatMove(res) + '\n');
    if (!a.flags.quiet) console.log('\nwrote ' + a.flags.out + '  (PROPOSED — review before it goes near moves.js)');
  }
  if (a.flags.json) {
    fs.writeFileSync(a.flags.json, JSON.stringify({
      source: take.source, label: take.label, verdict: res.verdict,
      reasons: res.reasons, warnings: res.warnings,
      facing: res.facing, phrase: res.phrase, stats: res.stats, crossings: res.crossings,
      scale: res.ctx.scale, sides: res.ctx.sides,
      reduction: {
        knots: res.reduction.knots, tol: res.reduction.tol, worst: res.reduction.worst,
        worstJoint: res.reduction.worstJoint, metTolerance: res.reduction.metTolerance,
        residual: res.reduction.residual, emitted: res.reduction.emitted,
        dropped: res.reduction.dropped, peak: res.reduction.peak, rdpKnots: res.reduction.rdpKnots
      },
      move: res.move
    }, null, 2));
  }

  return res.verdict === 'REJECTED' ? 2 : res.verdict === 'FLAGGED' ? 1 : 0;
}

if (process.argv[1] && import.meta.url === 'file://' + path.resolve(process.argv[1])) {
  process.exitCode = await cli(process.argv);
}
