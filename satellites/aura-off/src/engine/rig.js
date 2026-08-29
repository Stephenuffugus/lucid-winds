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
 * Figure proportions in rig units. The SVG viewBox is 120 × 220 with the floor
 * at y=200, so a fighter sits in the same box whatever it is doing and the UI
 * can drop two of them side by side without measuring anything.
 *
 * Chain, top to bottom:
 *   rot (about 60,200) → bob (translate y) → hips (60,118)
 *     ├─ legs   : hL/hR at (±8, 0) → kL/kR at (0, 41)
 *     └─ lean   : torso, then head at (0,-52) and shoulders at (±13,-42)
 */
export const RIG = Object.freeze({
  viewW: 120,
  viewH: 220,
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

/**
 * Build the SVG source for one fighter. PURE — returns a string, so the doc
 * generator and the tests can look at a figure without a DOM.
 *
 * The figure is drawn as strokes with round caps plus a filled head, which is
 * what keeps it legible as a pure-black silhouette at 64px (CONTRACT.md §13).
 * Colour comes from `currentColor` throughout, so the UI styles a fighter with
 * one CSS rule: `#you { color: var(--you) }`.
 *
 * The glow is a `<use>` of the same live joint tree drawn underneath with a fat
 * translucent stroke. It costs one extra node and no `<filter>` element — this
 * repo has been bitten before by per-element SVG filters breaking on iOS.
 *
 * @param {Object}  [opts]
 * @param {string}  [opts.id]           unique id for the internal joint tree
 * @param {string}  [opts.color]        explicit stroke colour; default currentColor
 * @param {boolean} [opts.glow=true]    draw the soft under-glow
 * @param {number}  [opts.strokeWidth=8.5]
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
  const sw = typeof o.strokeWidth === 'number' ? o.strokeWidth : 8.5;
  const gw = typeof o.glowWidth === 'number' ? o.glowWidth : sw + 9;
  const gop = typeof o.glowOpacity === 'number' ? o.glowOpacity : 0.2;
  const glow = o.glow !== false;
  const shadeColor = o.shadeColor || '#1A0B2E';
  const clothColor = o.clothColor || '#FDF6EC';
  const cls = o.className || 'rigsvg';

  const R = RIG;
  const head = [];
  if (o.headcloth) {
    head.push(
      '<path class="ao-cloth" fill="' + esc(clothColor) + '" stroke="none" d="M-' + R.headR +
      ' ' + (R.headCY - 1) + ' q0 -' + (R.headR + 3) + ' ' + R.headR + ' -' + (R.headR + 3) +
      ' q' + R.headR + ' 0 ' + R.headR + ' ' + (R.headR + 3) +
      ' l-3 2 q-' + (R.headR - 2) + ' -6 -' + (2 * R.headR - 4) + ' 0 z"/>'
    );
  }
  if (o.shades) {
    head.push(
      '<rect class="ao-shades" fill="' + esc(shadeColor) + '" stroke="none" ' +
      'x="-9.5" y="' + (R.headCY - 3.4) + '" width="19" height="6.4" rx="2.6"/>'
    );
  }

  const body =
    '<g id="' + esc(uid) + '">' +
      '<g data-joint="rot" transform="rotate(0 ' + R.groundX + ' ' + R.groundY + ')">' +
        '<g data-joint="bob" transform="translate(0 0)">' +
          '<g transform="translate(' + R.hipX + ' ' + R.hipY + ')">' +

            /* legs first — they sit behind the torso */
            '<g transform="translate(-' + R.legX + ' 0)">' +
              '<g data-joint="hL" transform="rotate(0)">' +
                '<path d="M0 0 L0 ' + R.thigh + '"/>' +
                '<g transform="translate(0 ' + R.thigh + ')">' +
                  '<g data-joint="kL" transform="rotate(0)">' +
                    '<path d="M0 0 L0 ' + R.shin + '"/>' +
                    '<path d="M0 ' + R.shin + ' L-' + R.footLen + ' ' + R.shin + '"/>' +
                  '</g>' +
                '</g>' +
              '</g>' +
            '</g>' +
            '<g transform="translate(' + R.legX + ' 0)">' +
              '<g data-joint="hR" transform="rotate(0)">' +
                '<path d="M0 0 L0 ' + R.thigh + '"/>' +
                '<g transform="translate(0 ' + R.thigh + ')">' +
                  '<g data-joint="kR" transform="rotate(0)">' +
                    '<path d="M0 0 L0 ' + R.shin + '"/>' +
                    '<path d="M0 ' + R.shin + ' L' + R.footLen + ' ' + R.shin + '"/>' +
                  '</g>' +
                '</g>' +
              '</g>' +
            '</g>' +

            '<g data-joint="lean" transform="rotate(0)">' +
              /* torso: spine, shoulder line, hip line */
              '<path d="M0 0 L0 ' + R.neckY + '"/>' +
              '<path d="M-' + R.shoulderX + ' ' + R.shoulderY + ' L' + R.shoulderX + ' ' + R.shoulderY + '"/>' +
              '<path d="M-' + R.legX + ' 0 L' + R.legX + ' 0"/>' +

              /* head sits behind the arms so a hand can travel across the face */
              '<g transform="translate(0 ' + R.headAnchorY + ')">' +
                '<g data-joint="head" transform="rotate(0)">' +
                  '<circle cx="0" cy="' + R.headCY + '" r="' + R.headR + '" stroke="none"/>' +
                  head.join('') +
                '</g>' +
              '</g>' +

              '<g transform="translate(-' + R.shoulderX + ' ' + R.shoulderY + ')">' +
                '<g data-joint="sL" transform="rotate(0)">' +
                  '<path d="M0 0 L0 ' + R.upperArm + '"/>' +
                  '<g transform="translate(0 ' + R.upperArm + ')">' +
                    '<g data-joint="eL" transform="rotate(0)">' +
                      '<path d="M0 0 L0 ' + R.foreArm + '"/>' +
                    '</g>' +
                  '</g>' +
                '</g>' +
              '</g>' +
              '<g transform="translate(' + R.shoulderX + ' ' + R.shoulderY + ')">' +
                '<g data-joint="sR" transform="rotate(0)">' +
                  '<path d="M0 0 L0 ' + R.upperArm + '"/>' +
                  '<g transform="translate(0 ' + R.upperArm + ')">' +
                    '<g data-joint="eR" transform="rotate(0)">' +
                      '<path d="M0 0 L0 ' + R.foreArm + '"/>' +
                    '</g>' +
                  '</g>' +
                '</g>' +
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
      ? '<g class="ao-glow" ' + paint + ' stroke-width="' + gw + '" opacity="' + gop +
        '"><use href="#' + esc(uid) + '" xlink:href="#' + esc(uid) + '"/></g>'
      : '') +
    '<g class="ao-body" ' + paint + ' stroke-width="' + sw + '"><use href="#' + esc(uid) +
    '" xlink:href="#' + esc(uid) + '"/></g>';

  const flipOpen = o.flip ? '<g transform="translate(' + R.viewW + ' 0) scale(-1 1)">' : '';
  const flipClose = o.flip ? '</g>' : '';

  return '<svg class="' + esc(cls) + '" xmlns="' + SVG_NS + '" ' +
    'xmlns:xlink="http://www.w3.org/1999/xlink" ' +
    'viewBox="0 0 ' + R.viewW + ' ' + R.viewH + '" ' +
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
  if (!doc) throw new Error('buildFigure needs a document — pass opts.doc, or use figureMarkup() for a string');

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
