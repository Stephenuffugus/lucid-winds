/**
 * AURA OFF — src/engine/rig.js
 *
 * The twelve-joint figure. CONTRACT.md §2.
 *
 * PURE MODULE. Nothing here touches the DOM at import time, so this file loads
 * unchanged in Node (the balance simulator imports it transitively) and in the
 * browser (the UI imports it to build fighters). The only DOM-touching function
 * is `applyPose()`, and it is deliberately thin: it takes a bag of objects that
 * expose `setAttribute` and writes strings into them. Everything it needs to
 * decide is computed by `poseTransforms()`, which is pure and testable.
 *
 * ---------------------------------------------------------------------------
 * JOINT SIGN CONVENTION — read this before authoring a move
 * ---------------------------------------------------------------------------
 * Every rotational joint value is DEGREES OF CLOCKWISE ROTATION in SVG screen
 * space about that joint's own anchor. There is NO left/right mirroring in the
 * rig: `sL` and `sR` are the same rotation applied to two different anchors.
 *
 * The practical consequences, which are the ones a move author actually needs:
 *
 *   ARMS WIDE      sL positive, sR negative   (left arm swings screen-left,
 *                                              right arm swings screen-right)
 *   ARMS CROSSED   sL negative, sR positive   (both sweep across the chest —
 *                                              this is the Sigma stance)
 *   WALK SWING     sL and sR opposite signs, alternating in time; same for
 *                  hL / hR. Antisymmetric values read as a stride.
 *   ELBOW BEND     negative eL / eR raises the forearm (hands come up toward
 *                  the chest). Range is -150 … +30 because elbows only hinge
 *                  one way.
 *   KNEE BEND      negative kL / kR. Both legs use the same sign for a crouch.
 *   bob            POSITIVE IS DOWN. bob:58 puts the hips on the floor.
 *   rot            rotates the WHOLE body about the feet, not the hips. This
 *                  is the joint that performs a fall.
 *
 * The AURA-BIBLE writes some poses as "sL/sR ≈ ∓60" and others as "±75". That
 * notation is prose, not a spec — resolve it against the four rules above.
 *
 * Rest pose is all zeros, and a joint omitted from a keyframe is 0, never
 * "hold previous". That is what makes amplitude scaling in anim.js trivially
 * correct: with rest at zero, the authored value IS the delta.
 */

/* -------------------------------------------------------------------------- */
/* THE FROZEN NAMES                                                           */
/* -------------------------------------------------------------------------- */

/** All twelve joints, in canonical order. FROZEN — these map to real bones. */
export const JOINTS = ['rot', 'bob', 'lean', 'head', 'sL', 'eL', 'sR', 'eR', 'hL', 'kL', 'hR', 'kR'];

/** Bone mask: the upper body. Blend takes these from move A. */
export const UPPER = ['lean', 'head', 'sL', 'eL', 'sR', 'eR'];

/** Bone mask: the lower body. Blend takes these from move B. */
export const LOWER = ['rot', 'bob', 'hL', 'kL', 'hR', 'kR'];

/** O(1) membership tests — the sampler runs these per joint per frame. */
export const IS_JOINT = Object.freeze({
  rot: true, bob: true, lean: true, head: true, sL: true, eL: true,
  sR: true, eR: true, hL: true, kL: true, hR: true, kR: true
});
export const IS_UPPER = Object.freeze({
  lean: true, head: true, sL: true, eL: true, sR: true, eR: true
});
export const IS_LOWER = Object.freeze({
  rot: true, bob: true, hL: true, kL: true, hR: true, kR: true
});

/** Sane authoring ranges, straight from CONTRACT.md §2. Advisory, not enforced
 *  at sample time — `clampPose()` applies them when you want them applied. */
export const JOINT_RANGE = Object.freeze({
  rot: [-90, 90],
  bob: [-20, 60],
  lean: [-20, 20],
  head: [-30, 30],
  sL: [-180, 180], sR: [-180, 180],
  eL: [-150, 30], eR: [-150, 30],
  hL: [-40, 40], hR: [-40, 40],
  kL: [-40, 10], kR: [-40, 10]
});

/** Human-readable joint labels, for a debug overlay or the dev panel. */
export const JOINT_LABEL = Object.freeze({
  rot: 'body rotation (about the feet)',
  bob: 'hip height (+ is down)',
  lean: 'torso lean',
  head: 'head tilt',
  sL: 'left shoulder', eL: 'left elbow',
  sR: 'right shoulder', eR: 'right elbow',
  hL: 'left hip', kL: 'left knee',
  hR: 'right hip', kR: 'right knee'
});

/* -------------------------------------------------------------------------- */
/* GEOMETRY                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * DEFAULT figure proportions, in rig units. Every fighter is a variation on
 * this (see `figureBuild`), but three numbers are FIXED for every one of them
 * and the rest of the codebase depends on it:
 *
 *   groundX / groundY   the feet, at (60, 200). `poseTransforms` rotates `rot`
 *                       about this point, so it cannot move per fighter or a
 *                       fall would pivot around thin air.
 *   viewW               120, so `flip` mirrors about x=60.
 *
 * The viewBox is `0 viewY viewW viewH` = `0 20 120 200`, i.e. it starts just
 * above the tallest head and ends 20 units BELOW the floor line. With
 * `preserveAspectRatio="xMidYMax meet"` that puts the feet a constant 10% of
 * the rendered height above the bottom of the box — which is what lets the
 * stylesheet park a contact shadow on the floor line without measuring
 * anything. The old box was 0 0 120 220 and wasted 20% of its height on empty
 * sky above the head, which is a large part of why two fighters read as small.
 *
 * Chain, top to bottom:
 *   rot (about 60,200) → bob (translate y) → hips (60, hipY)
 *     ├─ legs   : static splay → hL/hR at (±legX, 0) → kL/kR at (0, thigh)
 *     └─ poise  : static tilt → lean → head at (0,-headAnchorY), shoulders ±
 */
export const RIG = Object.freeze({
  viewW: 120,
  viewY: 20,
  viewH: 200,
  groundX: 60,
  groundY: 200,
  hipX: 60,
  hipY: 118,
  shoulderX: 13,
  shoulderY: -42,
  neckY: -50,
  headAnchorY: -52,
  headCY: -11,
  headR: 11.5,
  upperArm: 26,
  foreArm: 24,
  legX: 8,
  thigh: 41,
  shin: 40,
  footLen: 9
});


/* -------------------------------------------------------------------------- */
/* PER-FIGHTER BUILDS                                                          */
/* -------------------------------------------------------------------------- */
/*
 * AURA-BIBLE §"Character brief": *silhouette-first. Every fighter must be
 * identifiable in pure black at 64px. Distinct head shape, distinct stance,
 * distinct arm length.* One rig drawn twice in two colours fails that test —
 * at thumbnail You and every one of the twenty-five opponents were the same
 * person.
 *
 * So the figure is built from a deterministic BUILD: an archetype frame plus
 * a small jitter, hashed from the fighter's name. Chispa always looks like
 * Chispa. Nothing here touches the pose: joints still read the same twelve
 * names, and every static shaping — leg splay, arm hang, torso poise — lives
 * on a WRAPPER group outside the `[data-joint]` group it shapes, so
 * `applyPose` writes exactly the transform it always wrote.
 *
 * What varies, in rough order of how much it changes a black thumbnail:
 *   stroke weight, shoulder width, torso mass, head shape + crown, height,
 *   stance width, arm hang, limb lengths, foot length, standing poise.
 */

/** FNV-1a. Small, stable across engines, and enough spread for 26 names. */
function hashStr(s) {
  let h = 2166136261 >>> 0;
  const str = String(s == null ? '' : s);
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/** mulberry32 — 32 bits of state, good enough to shape a crowd of bodies. */
function mulberry32(a) {
  let s = a >>> 0;
  return function () {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), 1 | t);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Eight frames. Deliberately far apart — a uniform roll around one mean gives
 * twenty-six people who are all "sort of medium", which is exactly the failure
 * being fixed. Jitter inside a frame is small; the frames do the work.
 *
 * height   hip height above the floor (bigger = longer legs = taller)
 * sw       stroke weight — the single loudest cue at 64px
 * shoulder half the shoulder line
 * torso    0 = bare spine, 1 = a solid tapered body
 * arm      upper-arm length; forearm follows
 * head     head radius
 * squash   head ry / rx. <1 is a long face, >1 is a round one
 * stance   static leg splay, degrees per leg
 * hang     static arm hang away from the ribs, degrees
 */
const ARCHETYPES = Object.freeze([
  /* 0 · tall and lean — all legs, no mass */
  { height: 96, sw: 7.0, shoulder: 11.5, torso: 0.00, arm: 27, head: 10.4, squash: 0.92, stance: 2, hang: 3, torsoLen: 46 },
  /* 1 · short and stocky — low, wide, heavy */
  { height: 74, sw: 10.6, shoulder: 16.5, torso: 0.92, arm: 22, head: 12.6, squash: 1.10, stance: 8, hang: 11, torsoLen: 38 },
  /* 2 · swimmer's shoulders — narrow hips, huge shoulder line */
  { height: 88, sw: 8.4, shoulder: 18.0, torso: 0.58, arm: 26, head: 11.0, squash: 0.98, stance: 4, hang: 9, torsoLen: 42 },
  /* 3 · small and quick — a twelve-year-old who is first into the circle */
  { height: 76, sw: 7.2, shoulder: 10.0, torso: 0.00, arm: 21, head: 12.2, squash: 1.06, stance: 3, hang: 5, torsoLen: 36 },
  /* 4 · long arms — the reach reads before anything else moves */
  { height: 86, sw: 8.0, shoulder: 12.5, torso: 0.22, arm: 31, head: 10.8, squash: 0.94, stance: 3, hang: 7, torsoLen: 43 },
  /* 5 · heavy and round — a body, not a line */
  { height: 78, sw: 11.4, shoulder: 15.0, torso: 1.00, arm: 23, head: 13.0, squash: 1.14, stance: 6, hang: 13, torsoLen: 39 },
  /* 6 · wiry — a wire coathanger with a head on it */
  { height: 94, sw: 6.6, shoulder: 10.5, torso: 0.00, arm: 28, head: 9.8, squash: 0.88, stance: 2, hang: 2, torsoLen: 45 },
  /* 7 · wide stance — plants and does not move */
  { height: 82, sw: 9.4, shoulder: 14.5, torso: 0.48, arm: 24, head: 11.6, squash: 1.02, stance: 11, hang: 8, torsoLen: 41 }
]);

/** Head crowns. Silhouette only — every one of these survives pure black. */
const CROWNS = 7;

const DEG = Math.PI / 180;

function n2(v) { return Math.round(v * 100) / 100; }

/**
 * The deterministic build for one fighter.
 *
 * PURE. Same seed in, same body out, forever — which is the whole point: the
 * rival you lost to on Tuesday is the same shape on Thursday.
 *
 * @param {string|number} seed  a name, a character id, anything stable
 * @returns {Object} geometry, all in rig units, feet always on (60, 200)
 */
export function figureBuild(seed) {
  const r = mulberry32(hashStr('aura-off/rig/' + String(seed == null ? '' : seed)));
  const a = ARCHETYPES[(r() * ARCHETYPES.length) | 0];
  /** jitter: v ± v*f */
  const j = function (v, f) { return v * (1 + (r() * 2 - 1) * f); };

  const stance = Math.max(0, j(a.stance, 0.45));
  const legLen = j(a.height, 0.05);
  const hipY = RIG.groundY - legLen;
  /* Splaying a leg lifts its foot off the floor line, so the leg is lengthened
     by exactly the cosine it loses. Feet land on y=200 for every build. */
  const legRun = legLen / Math.cos(stance * DEG);
  const thighFrac = 0.47 + r() * 0.08;

  const torsoLen = j(a.torsoLen, 0.06);
  const headR = j(a.head, 0.08);
  const squash = j(a.squash, 0.06);
  const headRy = headR * squash;
  const arm = j(a.arm, 0.07);

  return {
    /* fixed for every build — see RIG */
    viewW: RIG.viewW, viewY: RIG.viewY, viewH: RIG.viewH,
    groundX: RIG.groundX, groundY: RIG.groundY,
    hipX: RIG.hipX,

    hipY: n2(hipY),
    legX: n2(Math.max(4.5, j(3.2 + a.shoulder * 0.42, 0.14))),
    stance: n2(stance),
    thigh: n2(legRun * thighFrac),
    shin: n2(legRun * (1 - thighFrac)),
    footLen: n2(j(8.5 + a.sw * 0.35, 0.18)),

    poise: n2((r() * 2 - 1) * 3.2),
    torsoLen: n2(torsoLen),
    shoulderX: n2(j(a.shoulder, 0.08)),
    shoulderY: n2(-torsoLen),
    neckY: n2(-(torsoLen + 8)),
    torsoW: Math.round(a.torso * 100) / 100,

    headAnchorY: n2(-(torsoLen + 9)),
    headRx: n2(headR),
    headRy: n2(headRy),
    headCY: n2(-(headRy + 1.5)),
    crown: (r() * CROWNS) | 0,

    upperArm: n2(arm),
    foreArm: n2(arm * (0.86 + r() * 0.14)),
    /* Arms have to CLEAR the body. A wide torso with arms hanging flat against
       it merged into one blob at 64px and the fighter lost its arms entirely,
       which is the exact thing the thumbnail test is for. Mass buys hang. */
    hang: n2(Math.max(3.5, j(a.hang + a.torso * 9, 0.3))),

    sw: n2(j(a.sw, 0.06))
  };
}
/* -------------------------------------------------------------------------- */
/* POSES                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * A fresh rest pose: every joint at zero.
 * @returns {Object} a pose with all twelve keys present.
 */
export function restPose() {
  return { rot: 0, bob: 0, lean: 0, head: 0, sL: 0, eL: 0, sR: 0, eR: 0, hL: 0, kL: 0, hR: 0, kR: 0 };
}

/** True when `p` carries all twelve joints as finite numbers. */
export function isPose(p) {
  if (!p || typeof p !== 'object') return false;
  for (let i = 0; i < JOINTS.length; i++) {
    const v = p[JOINTS[i]];
    if (typeof v !== 'number' || !isFinite(v)) return false;
  }
  return true;
}

/**
 * Copy a pose. Missing joints become 0, which is the rest-pose rule.
 * @param {Object} p
 * @param {Object} [out] reuse a pose object instead of allocating
 */
export function clonePose(p, out) {
  const o = out || restPose();
  for (let i = 0; i < JOINTS.length; i++) {
    const j = JOINTS[i];
    const v = p && p[j];
    o[j] = typeof v === 'number' && isFinite(v) ? v : 0;
  }
  return o;
}

/**
 * Clamp a pose into `JOINT_RANGE`. Opt-in — moves are allowed to exceed the
 * sane ranges (a fall is a fall), so nothing calls this automatically.
 */
export function clampPose(p, out) {
  const o = out || restPose();
  for (let i = 0; i < JOINTS.length; i++) {
    const j = JOINTS[i];
    const r = JOINT_RANGE[j];
    let v = p && typeof p[j] === 'number' && isFinite(p[j]) ? p[j] : 0;
    if (v < r[0]) v = r[0];
    else if (v > r[1]) v = r[1];
    o[j] = v;
  }
  return o;
}

/** Scale every joint away from rest. Rest is zero, so this is a plain multiply. */
export function scalePose(p, amp, out) {
  const o = out || restPose();
  for (let i = 0; i < JOINTS.length; i++) {
    const j = JOINTS[i];
    const v = p && p[j];
    o[j] = (typeof v === 'number' && isFinite(v) ? v : 0) * amp;
  }
  return o;
}

/* -------------------------------------------------------------------------- */
/* POSE → SVG TRANSFORMS (pure)                                                */
/* -------------------------------------------------------------------------- */

function r2(v) {
  if (!isFinite(v)) return 0;
  return Math.round(v * 100) / 100;
}

/**
 * Turn a pose into the twelve `transform` attribute strings the figure's joint
 * groups want. PURE — this is the half of `applyPose` that can be unit-tested
 * in Node, and it is the half where all the thinking lives.
 *
 * Each joint group in the markup sits inside a static anchor group, so the
 * string this produces is just the joint's own motion. Nine joints are plain
 * rotations about their anchor; `bob` is a translate; `rot` rotates about the
 * feet rather than its own origin.
 *
 * @param {Object} pose
 * @param {Object} [out] reuse a string bag instead of allocating
 * @returns {Object} { rot, bob, lean, head, sL, eL, sR, eR, hL, kL, hR, kR }
 */
export function poseTransforms(pose, out) {
  const o = out || {};
  const p = pose || {};
  o.rot = 'rotate(' + r2(p.rot || 0) + ' ' + RIG.groundX + ' ' + RIG.groundY + ')';
  o.bob = 'translate(0 ' + r2(p.bob || 0) + ')';
  o.lean = 'rotate(' + r2(p.lean || 0) + ')';
  o.head = 'rotate(' + r2(p.head || 0) + ')';
  o.sL = 'rotate(' + r2(p.sL || 0) + ')';
  o.eL = 'rotate(' + r2(p.eL || 0) + ')';
  o.sR = 'rotate(' + r2(p.sR || 0) + ')';
  o.eR = 'rotate(' + r2(p.eR || 0) + ')';
  o.hL = 'rotate(' + r2(p.hL || 0) + ')';
  o.kL = 'rotate(' + r2(p.kL || 0) + ')';
  o.hR = 'rotate(' + r2(p.hR || 0) + ')';
  o.kR = 'rotate(' + r2(p.kR || 0) + ')';
  return o;
}

/* -------------------------------------------------------------------------- */
/* THE THIN DOM LAYER                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Write a pose onto a figure's joint groups.
 *
 * `groups` is anything shaped like `{ rot: el, bob: el, ... }` where each value
 * has a `setAttribute` method — the map returned by `collectJoints()` or
 * `buildFigure()`. Missing joints are skipped silently, so a partial rig (a
 * stylised silhouette with no arms, say) still animates.
 *
 * This function is the ONLY place in the engine that talks to elements, and it
 * never runs under Node because nothing calls it there.
 *
 * @param {Object} groups joint name → element
 * @param {Object} pose
 * @param {Object} [scratch] reusable string bag from `poseTransforms`
 */
export function applyPose(groups, pose, scratch) {
  if (!groups) return;
  const t = poseTransforms(pose, scratch);
  for (let i = 0; i < JOINTS.length; i++) {
    const j = JOINTS[i];
    const el = groups[j];
    if (el && el.setAttribute) el.setAttribute('transform', t[j]);
  }
}

/**
 * Gather `[data-joint]` groups out of a rendered figure into the bag
 * `applyPose` wants.
 * @param {Element} root
 */
export function collectJoints(root) {
  const map = {};
  if (!root || !root.querySelectorAll) return map;
  const nodes = root.querySelectorAll('[data-joint]');
  for (let i = 0; i < nodes.length; i++) {
    const name = nodes[i].getAttribute('data-joint');
    if (IS_JOINT[name] && !map[name]) map[name] = nodes[i];
  }
  return map;
}

/* -------------------------------------------------------------------------- */
/* THE FIGURE                                                                  */
/* -------------------------------------------------------------------------- */

let _figureSeq = 0;

const SVG_NS = 'http://www.w3.org/2000/svg';

function esc(s) {
  return String(s).replace(/[&<>"]/g, function (c) {
    return c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&quot;';
  });
}

/** `<g transform="rotate(d)">` only when d actually rotates something. */
function tilt(d) {
  return Math.abs(d) < 0.05 ? '<g>' : '<g transform="rotate(' + n2(d) + ')">';
}

/**
 * The crown: the one piece of a silhouette a person reads before anything
 * else. Seven of them, all drawn as filled shapes around the head centre so
 * they stay legible in pure black at 64px and rotate with the `head` joint.
 *
 * Asymmetric crowns point toward +x, which the `flip` on the rival turns into
 * "toward the middle" — so both fighters face each other.
 */
function crownMarkup(b) {
  const rx = b.headRx, ry = b.headRy, cy = b.headCY;
  switch (b.crown) {
    case 1: /* topknot */
      return '<circle cx="' + n2(-rx * 0.15) + '" cy="' + n2(cy - ry - rx * 0.34) +
        '" r="' + n2(rx * 0.42) + '" stroke="none"/>';
    case 2: /* cap, peak forward */
      return '<path stroke="none" d="M' + n2(-rx * 0.9) + ' ' + n2(cy - ry * 0.25) +
        ' A' + n2(rx) + ' ' + n2(ry) + ' 0 0 1 ' + n2(rx * 0.9) + ' ' + n2(cy - ry * 0.25) +
        ' L' + n2(rx * 2.05) + ' ' + n2(cy - ry * 0.02) +
        ' L' + n2(rx * 0.9) + ' ' + n2(cy + ry * 0.22) + ' Z"/>';
    case 3: /* volume — hair that is its own shape */
      return '<ellipse cx="0" cy="' + n2(cy - ry * 0.30) + '" rx="' + n2(rx * 1.44) +
        '" ry="' + n2(ry * 1.20) + '" stroke="none"/>';
    case 4: /* ponytail, hanging behind */
      return '<ellipse cx="' + n2(-(rx + rx * 0.34)) + '" cy="' + n2(cy + ry * 0.55) +
        '" rx="' + n2(rx * 0.44) + '" ry="' + n2(ry * 0.86) + '" stroke="none"/>';
    case 5: /* a bucket hat: a low crown and a short brim, sat ON the head.
               A wide flat ellipse floating above it read as a mortarboard. */
      return '<ellipse cx="' + n2(rx * 0.12) + '" cy="' + n2(cy - ry * 0.30) +
        '" rx="' + n2(rx * 1.34) + '" ry="' + n2(ry * 0.26) + '" stroke="none"/>' +
        '<ellipse cx="0" cy="' + n2(cy - ry * 0.64) + '" rx="' + n2(rx * 0.86) +
        '" ry="' + n2(ry * 0.52) + '" stroke="none"/>';
    case 6: /* low bun, at the nape */
      return '<circle cx="' + n2(-(rx + rx * 0.2)) + '" cy="' + n2(cy + ry * 0.42) +
        '" r="' + n2(rx * 0.40) + '" stroke="none"/>';
    default:
      return '';
  }
}

/** One leg: static splay wrapper → hip joint → knee joint → foot. */
function legMarkup(b, side) {
  const dir = side === 'L' ? -1 : 1;
  return '<g transform="translate(' + n2(dir * b.legX) + ' 0)">' +
    tilt(-dir * b.stance) +
      '<g data-joint="h' + side + '" transform="rotate(0)">' +
        '<path d="M0 0 L0 ' + b.thigh + '"/>' +
        '<g transform="translate(0 ' + b.thigh + ')">' +
          '<g data-joint="k' + side + '" transform="rotate(0)">' +
            '<path d="M0 0 L0 ' + b.shin + '"/>' +
            '<path d="M0 ' + b.shin + ' L' + n2(dir * b.footLen) + ' ' + b.shin + '"/>' +
          '</g>' +
        '</g>' +
      '</g>' +
    '</g>' +
  '</g>';
}

/** One arm: static hang wrapper → shoulder joint → elbow joint. */
function armMarkup(b, side) {
  const dir = side === 'L' ? -1 : 1;
  return '<g transform="translate(' + n2(dir * b.shoulderX) + ' ' + b.shoulderY + ')">' +
    tilt(-dir * b.hang) +
      '<g data-joint="s' + side + '" transform="rotate(0)">' +
        '<path d="M0 0 L0 ' + b.upperArm + '"/>' +
        '<g transform="translate(0 ' + b.upperArm + ')">' +
          '<g data-joint="e' + side + '" transform="rotate(0)">' +
            '<path d="M0 0 L0 ' + b.foreArm + '"/>' +
          '</g>' +
        '</g>' +
      '</g>' +
    '</g>' +
  '</g>';
}

/**
 * Build the SVG source for one fighter. PURE — returns a string, so the doc
 * generator, the silhouette contact sheet and the tests can look at a figure
 * without a DOM.
 *
 * The figure is drawn as strokes with round caps, a filled head and (on the
 * heavier builds) a filled tapered torso, which is what keeps it legible as a
 * pure-black silhouette at 64px (CONTRACT.md §13). Colour comes from
 * `currentColor` throughout, so the UI styles a fighter with one CSS rule:
 * `#you { color: var(--you) }`.
 *
 * The glow is a `<use>` of the same live joint tree drawn underneath with a fat
 * translucent stroke. It costs one extra node and no `<filter>` element — this
 * repo has been bitten before by per-element SVG filters breaking on iOS.
 *
 * WHICH BODY YOU GET is decided by `figureBuild(seed)`, and the seed is the
 * first of `opts.seed`, `opts.character`, `opts.ariaLabel`, `opts.id` that is
 * present. `game.js` passes `ariaLabel: opponent.name`, so every opponent
 * already has a stable body without that file changing a line.
 *
 * @param {Object}  [opts]
 * @param {string}  [opts.id]           unique id for the internal joint tree
 * @param {string|number} [opts.seed]   explicit build seed (wins over the rest)
 * @param {string}  [opts.character]    character id — used as the seed if given
 * @param {string}  [opts.color]        explicit stroke colour; default currentColor
 * @param {boolean} [opts.glow=true]    draw the soft under-glow
 * @param {number}  [opts.strokeWidth]  overrides the build's own weight
 * @param {number}  [opts.glowWidth]    default strokeWidth + 9
 * @param {number}  [opts.glowOpacity=0.2]
 * @param {boolean} [opts.shades=false] sunglasses (the Togak Luan silhouette)
 * @param {boolean} [opts.headcloth=false] Malay Riau headcloth
 * @param {string}  [opts.shadeColor='#1A0B2E']
 * @param {string}  [opts.clothColor='#FDF6EC']
 * @param {boolean} [opts.flip=false]   mirror horizontally so a rival faces in
 * @param {string}  [opts.className='rigsvg']
 * @param {string}  [opts.ariaLabel]
 * @returns {string} SVG markup
 */
export function figureMarkup(opts) {
  const o = opts || {};
  const uid = o.id || ('aoRig' + (++_figureSeq));
  const stroke = o.color || 'currentColor';

  const seed = o.seed != null ? o.seed
    : o.character != null ? o.character
    : o.ariaLabel != null ? o.ariaLabel
    : (o.id || '');
  const b = o.build || figureBuild(seed);

  const sw = typeof o.strokeWidth === 'number' ? o.strokeWidth : b.sw;
  const gw = typeof o.glowWidth === 'number' ? o.glowWidth : sw + 9;
  const gop = typeof o.glowOpacity === 'number' ? o.glowOpacity : 0.2;
  const glow = o.glow !== false;
  const shadeColor = o.shadeColor || '#1A0B2E';
  const clothColor = o.clothColor || '#FDF6EC';
  const cls = o.className || 'rigsvg';

  /* ---- head ---------------------------------------------------------- */
  const head = [];
  head.push(crownMarkup(b));
  head.push('<ellipse cx="0" cy="' + b.headCY + '" rx="' + b.headRx +
    '" ry="' + b.headRy + '" stroke="none"/>');
  if (o.headcloth) {
    /* a wrap over the crown of the head, tied at the back — drawn as a cap of
       cloth rather than a shape of its own, so it reads on every head size */
    head.push(
      '<path class="ao-cloth" fill="' + esc(clothColor) + '" stroke="none" d="M' +
      n2(-b.headRx * 1.06) + ' ' + n2(b.headCY - b.headRy * 0.08) +
      ' A' + n2(b.headRx * 1.06) + ' ' + n2(b.headRy * 1.16) + ' 0 0 1 ' +
      n2(b.headRx * 1.06) + ' ' + n2(b.headCY - b.headRy * 0.08) +
      ' l' + n2(-b.headRx * 0.22) + ' ' + n2(b.headRy * 0.26) +
      ' A' + n2(b.headRx * 0.86) + ' ' + n2(b.headRy * 0.8) + ' 0 0 0 ' +
      n2(-b.headRx * 0.84) + ' ' + n2(b.headCY + b.headRy * 0.18) + ' Z"/>'
    );
  }
  if (o.shades) {
    head.push(
      '<rect class="ao-shades" fill="' + esc(shadeColor) + '" stroke="none" ' +
      'x="' + n2(-b.headRx * 0.86) + '" y="' + n2(b.headCY - b.headRy * 0.32) +
      '" width="' + n2(b.headRx * 1.72) + '" height="' + n2(b.headRy * 0.58) +
      '" rx="' + n2(b.headRy * 0.24) + '"/>'
    );
  }

  /* ---- torso --------------------------------------------------------- */
  /* A bare spine for the lean frames, a solid tapered body for the heavy
     ones. This is the second-biggest thumbnail cue after stroke weight. */
  const torso = [];
  if (b.torsoW > 0.05) {
    const topW = b.shoulderX * (0.38 + b.torsoW * 0.30);
    const botW = b.legX * (0.75 + b.torsoW * 0.38);
    torso.push('<path d="M' + n2(-topW) + ' ' + b.shoulderY + ' L' + n2(topW) + ' ' + b.shoulderY +
      ' L' + n2(botW) + ' 0 L' + n2(-botW) + ' 0 Z"/>');
  }
  torso.push('<path d="M0 0 L0 ' + b.neckY + '"/>');
  torso.push('<path d="M' + n2(-b.shoulderX) + ' ' + b.shoulderY + ' L' + n2(b.shoulderX) + ' ' + b.shoulderY + '"/>');
  torso.push('<path d="M' + n2(-b.legX) + ' 0 L' + n2(b.legX) + ' 0"/>');

  const body =
    '<g id="' + esc(uid) + '">' +
      '<g data-joint="rot" transform="rotate(0 ' + b.groundX + ' ' + b.groundY + ')">' +
        '<g data-joint="bob" transform="translate(0 0)">' +
          '<g transform="translate(' + b.hipX + ' ' + b.hipY + ')">' +

            /* legs first — they sit behind the torso */
            legMarkup(b, 'L') +
            legMarkup(b, 'R') +

            /* static poise: how this person stands when nothing is happening */
            tilt(b.poise) +
              '<g data-joint="lean" transform="rotate(0)">' +
                torso.join('') +

                /* head sits behind the arms so a hand can travel across the face */
                '<g transform="translate(0 ' + b.headAnchorY + ')">' +
                  '<g data-joint="head" transform="rotate(0)">' +
                    head.join('') +
                  '</g>' +
                '</g>' +

                armMarkup(b, 'L') +
                armMarkup(b, 'R') +
              '</g>' +
            '</g>' +

          '</g>' +
        '</g>' +
      '</g>' +
    '</g>';

  const paint = 'fill="' + esc(stroke) + '" stroke="' + esc(stroke) +
    '" stroke-linecap="round" stroke-linejoin="round"';

  const layers =
    (glow
      ? '<g class="ao-glow" ' + paint + ' stroke-width="' + n2(gw) + '" opacity="' + gop +
        '"><use href="#' + esc(uid) + '" xlink:href="#' + esc(uid) + '"/></g>'
      : '') +
    '<g class="ao-body" ' + paint + ' stroke-width="' + n2(sw) + '"><use href="#' + esc(uid) +
    '" xlink:href="#' + esc(uid) + '"/></g>';

  const flipOpen = o.flip ? '<g transform="translate(' + b.viewW + ' 0) scale(-1 1)">' : '';
  const flipClose = o.flip ? '</g>' : '';

  return '<svg class="' + esc(cls) + '" xmlns="' + SVG_NS + '" ' +
    'xmlns:xlink="http://www.w3.org/1999/xlink" ' +
    'viewBox="0 ' + b.viewY + ' ' + b.viewW + ' ' + b.viewH + '" ' +
    'preserveAspectRatio="xMidYMax meet" ' +
    (o.ariaLabel ? 'role="img" aria-label="' + esc(o.ariaLabel) + '"' : 'aria-hidden="true"') + '>' +
    '<defs>' + body + '</defs>' +
    flipOpen + layers + flipClose +
    '</svg>';
}

/**
 * Build a live fighter. Browser / jsdom only — call it from the UI, never from
 * the simulator. Returns everything the UI needs and nothing it doesn't.
 *
 * @param {Object}   [opts]        everything `figureMarkup` takes, plus:
 * @param {Document} [opts.doc]    document to build in; defaults to the global one
 * @returns {{svg: Element, joints: Object, apply: (pose: Object) => void, markup: string}}
 */
export function buildFigure(opts) {
  const o = opts || {};
  const doc = o.doc || (typeof document !== 'undefined' ? document : null);
  if (!doc) throw new Error('buildFigure needs a document, pass opts.doc, or use figureMarkup() for a string');

  const markup = figureMarkup(o);
  let svg = null;

  if (typeof doc.defaultView !== 'undefined' && doc.defaultView && doc.defaultView.DOMParser) {
    const parsed = new doc.defaultView.DOMParser().parseFromString(markup, 'image/svg+xml');
    const root = parsed && parsed.documentElement;
    if (root && root.nodeName.toLowerCase() === 'svg') svg = doc.importNode(root, true);
  }
  if (!svg) {
    const holder = doc.createElementNS(SVG_NS, 'svg');
    holder.innerHTML = markup;
    svg = holder.firstElementChild || holder;
  }

  const joints = collectJoints(svg);
  const scratch = {};
  return {
    svg: svg,
    joints: joints,
    markup: markup,
    apply: function (pose) { applyPose(joints, pose, scratch); }
  };
}

/**
 * Convenience for the UI: replace a fighter's figure inside a host element.
 * @param {Element} host
 * @param {Object}  [opts]
 */
export function mountFigure(host, opts) {
  const o = opts || {};
  const doc = o.doc || (host && host.ownerDocument) || (typeof document !== 'undefined' ? document : null);
  const fig = buildFigure(Object.assign({}, o, { doc: doc }));
  if (host) {
    const old = host.querySelector('svg.' + (o.className || 'rigsvg'));
    if (old && old.parentNode) old.parentNode.removeChild(old);
    host.insertBefore(fig.svg, host.firstChild);
  }
  fig.apply(restPose());
  return fig;
}
