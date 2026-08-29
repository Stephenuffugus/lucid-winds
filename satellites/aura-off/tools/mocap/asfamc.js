/**
 * AURA OFF — tools/mocap/asfamc.js
 *
 * CMU Graphics Lab ASF/AMC  →  TAKE  (CONTRACT.md §2)
 *
 * TOOLING. Nothing here ships inside the game, nothing here imports from
 * `src/`, and nothing here writes to `src/`. Zero third-party dependencies;
 * `node:fs` / `node:path` are used only by the file and CLI helpers at the
 * bottom, and the pure functions above them never touch the disk.
 *
 * Credit: motion converted with this file is derived from the CMU Graphics Lab
 * Motion Capture Database, http://mocap.cs.cmu.edu. That credit ships with the
 * game (CONTRACT §1), not with this file.
 *
 * ---------------------------------------------------------------------------
 * WHAT ASF/AMC ACTUALLY IS
 * ---------------------------------------------------------------------------
 * `.asf` is the skeleton, once per subject. Per bone it gives:
 *
 *   direction   unit vector, in the GLOBAL REST FRAME, from this bone's start
 *               to its end
 *   length      bone length, in ASF length units
 *   axis a b c ORDER
 *               the bone's own rotation frame `C`, as Euler angles composed in
 *               the stated order
 *   dof rx ry rz
 *               which channels the motion file drives, and in what order they
 *               appear on that bone's AMC line
 *
 * `.amc` is the motion, one block per frame: a bare integer frame number, then
 * one line per bone, `name v1 v2 ...`, with exactly as many values as that
 * bone's `dof` declared. A bone with `dof rx` has ONE number. The root line is
 * special: it carries translation AND rotation, in the order its `order` field
 * declares (`order TX TY TZ RX RY RZ`).
 *
 * The bone order inside an AMC frame is NOT the ASF's `:bonedata` order — this
 * subject writes rclavicle before lclavicle — so every line is keyed by name.
 *
 * Forward kinematics, the standard formulation, implemented rather than
 * approximated:
 *
 *   C        = rotation matrix from the bone's `axis`, in its stated order
 *   M_local  = C · R(this frame's dof values, in the bone's dof order) · Cᵀ
 *   M_global = M_global(parent) · M_local
 *   start(b) = end(parent)
 *   end(b)   = start(b) + M_global(b) · (direction × length)
 *
 * With every motion value at zero, R = I, so M_local = I, so M_global = I, so
 * the chain reproduces the ASF rest skeleton exactly. That is the cheapest
 * correctness check in the file and `verify()` runs it.
 *
 * ---------------------------------------------------------------------------
 * AXES — the correction this parser owns, and why it is a yaw and only a yaw
 * ---------------------------------------------------------------------------
 * CONTRACT §2 fixes the TAKE frame as: +X the subject's LEFT as the camera
 * sees it (screen right), +Y up, +Z toward the camera. Right-handed.
 *
 * Raw CMU is already Y-up and right-handed, and reading the skeleton settles
 * the other two axes without guessing:
 *
 *   lhipjoint direction  ( 0.612, -0.748,  0.258)   → +X is the subject's LEFT
 *   rhipjoint direction  (-0.646, -0.721,  0.249)   → confirms it
 *   lfoot     direction  ( 0.122, -0.336,  0.934)   → +Z is where the toes
 *                                                      point, i.e. FORWARD
 *
 * So raw CMU == the contract frame for a subject who happens to be facing +Z.
 * What differs per subject and per trial is which way in the world they were
 * actually standing, which lives entirely in the root's RY. That is a rotation
 * about the up axis and nothing else, so the correction this parser owns is a
 * single yaw: rotate the whole take about +Y until the subject faces the
 * camera. No axis is swapped, no sign is flipped, handedness is preserved by
 * construction — which matters, because a handedness error here is exactly the
 * bug that produces a plausible-looking mirrored figure downstream.
 *
 * Yaw is chosen by `opts.align` and always reported in `take.meta.axisFix`.
 * The default, 'auto', picks the yaw that leaves the MOST frames inside the
 * ±40° front-facing window CONTRACT §4 cares about, and reports what 'frame0'
 * would have given so the choice is visible rather than assumed.
 *
 * A turn inside the take survives this untouched. Aligning the take does not
 * hide turns; it only decides which way "front" points for the whole clip.
 */

import fs from 'node:fs';
import path from 'node:path';

/* -------------------------------------------------------------------------- */
/* THE 15 CANONICAL POINTS — CONTRACT §2                                       */
/* -------------------------------------------------------------------------- */

/** Emission order. Frozen by the contract; do not extend. */
export const CANON = Object.freeze([
  'root', 'neck', 'head',
  'lsho', 'lelb', 'lwri',
  'rsho', 'relb', 'rwri',
  'lhip', 'lkne', 'lank',
  'rhip', 'rkne', 'rank'
]);

/**
 * A canonical joint POSITION is where a bone STARTS, i.e. its parent's end.
 * Each entry is a candidate list, first match wins, so a skeleton that routes
 * `lradius → lhand` instead of `lradius → lwrist` still resolves.
 * `root` is the root translation itself and has no bone.
 */
export const CANON_SOURCE_BONES = Object.freeze({
  root: null,
  neck: ['lowerneck', 'neck', 'upperneck'],
  head: ['head'],
  lsho: ['lhumerus'], lelb: ['lradius'], lwri: ['lwrist', 'lhand'],
  rsho: ['rhumerus'], relb: ['rradius'], rwri: ['rwrist', 'rhand'],
  lhip: ['lfemur'],   lkne: ['ltibia'],  lank: ['lfoot'],
  rhip: ['rfemur'],   rkne: ['rtibia'],  rank: ['rfoot']
});

/**
 * Segments `verify()` measures.
 *
 * The first EIGHT are RIGID: each spans exactly one ASF bone, so a correct FK
 * must hold it at that bone's declared length in every frame, and `bone` names
 * the ASF bone whose `length × scale` it has to equal.
 *
 * The last three are NOT rigid and must not be asserted as such:
 *   neck-head   spans lowerneck + upperneck — two bones, three dof each
 *   lsho-rsho   spans lclavicle → thorax → rclavicle
 *   lhip-rhip   spans lhipjoint → root → rhipjoint
 * They are still worth measuring: they are the only spans that cross out of one
 * limb chain into the other, so they come out near-constant only if the two
 * chains agree with each other.
 */
export const SEGMENTS = Object.freeze([
  { a: 'lsho', b: 'lelb', bone: 'lhumerus', rigid: true },
  { a: 'lelb', b: 'lwri', bone: 'lradius', rigid: true },
  { a: 'rsho', b: 'relb', bone: 'rhumerus', rigid: true },
  { a: 'relb', b: 'rwri', bone: 'rradius', rigid: true },
  { a: 'lhip', b: 'lkne', bone: 'lfemur', rigid: true },
  { a: 'lkne', b: 'lank', bone: 'ltibia', rigid: true },
  { a: 'rhip', b: 'rkne', bone: 'rfemur', rigid: true },
  { a: 'rkne', b: 'rank', bone: 'rtibia', rigid: true },
  { a: 'neck', b: 'head', bone: null, rigid: false },
  { a: 'lsho', b: 'rsho', bone: null, rigid: false },
  { a: 'lhip', b: 'rhip', bone: null, rigid: false }
]);

/**
 * The four ASF bones that are pure one-dof hinges AND land on a canonical
 * joint. `verifyHinges` uses this only to label its output; it discovers the
 * hinge set from the skeleton itself, so an unfamiliar subject still works.
 */
export const CANON_HINGE = Object.freeze({
  lradius: 'lelb', rradius: 'relb', ltibia: 'lkne', rtibia: 'rkne'
});

/** Front-facing window. Past this the front projection stops meaning anything. */
export const FACING_LIMIT_DEG = 40;

/* -------------------------------------------------------------------------- */
/* 3×3 MATRIX MATH — row-major, column-vector convention (v' = M·v)            */
/* -------------------------------------------------------------------------- */

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

function mIdent() { return [1, 0, 0, 0, 1, 0, 0, 0, 1]; }

function mMul(a, b) {
  const o = new Array(9);
  for (let r = 0; r < 3; r++) {
    const a0 = a[r * 3], a1 = a[r * 3 + 1], a2 = a[r * 3 + 2];
    for (let c = 0; c < 3; c++) o[r * 3 + c] = a0 * b[c] + a1 * b[3 + c] + a2 * b[6 + c];
  }
  return o;
}

/** Transpose. For an orthonormal rotation this IS the inverse. */
function mT(a) { return [a[0], a[3], a[6], a[1], a[4], a[7], a[2], a[5], a[8]]; }

function mApply(m, v) {
  const x = v[0], y = v[1], z = v[2];
  return [
    m[0] * x + m[1] * y + m[2] * z,
    m[3] * x + m[4] * y + m[5] * z,
    m[6] * x + m[7] * y + m[8] * z
  ];
}

function rotAxis(ax, rad) {
  const c = Math.cos(rad), s = Math.sin(rad);
  if (ax === 'x') return [1, 0, 0, 0, c, -s, 0, s, c];
  if (ax === 'y') return [c, 0, s, 0, 1, 0, -s, 0, c];
  return [c, -s, 0, s, c, 0, 0, 0, 1];
}

/**
 * Compose Euler angles in a stated order, FIXED-AXIS interpretation: order
 * 'xyz' means "rotate about X first, then Y, then Z", which composes as
 * M = Rz · Ry · Rx. This is the Acclaim ASF reading of both the `axis ... XYZ`
 * field and a bone's `dof` list, and it is the one every ASF reader uses.
 *
 * @param {string} order lowercase axis letters, e.g. 'xyz', 'xz', 'y'
 * @param {Object} rads  { x, y, z } in RADIANS; missing entries are 0
 */
function eulerMatrix(order, rads) {
  let m = mIdent();
  for (let i = 0; i < order.length; i++) {
    const ax = order[i];
    m = mMul(rotAxis(ax, rads[ax] || 0), m);
  }
  return m;
}

/* -------------------------------------------------------------------------- */
/* ASF                                                                         */
/* -------------------------------------------------------------------------- */

function stripComment(line) {
  const i = line.indexOf('#');
  return (i === -1 ? line : line.slice(0, i)).trim();
}

function nums(tokens) {
  const out = [];
  for (let i = 0; i < tokens.length; i++) {
    const v = parseFloat(tokens[i]);
    if (Number.isFinite(v) && /^[-+.\d]/.test(tokens[i])) out.push(v);
  }
  return out;
}

/**
 * Parse an ASF skeleton and PREPARE it for forward kinematics: every bone comes
 * back with its `C` / `Cinv` matrices and its rest offset already scaled to cm.
 *
 * @param {string} text  the whole .asf file
 * @param {Object} [opts]
 * @param {number} [opts.scale]  cm per ASF length unit; default 2.54 / units.length
 * @returns {Object} skeleton
 */
export function parseASF(text, opts) {
  const o = opts || {};
  const lines = String(text).split(/\r?\n/);

  const skel = {
    name: '',
    version: '',
    units: { mass: 1, length: 1, angle: 'deg' },
    scale: 1,
    root: { order: ['TX', 'TY', 'TZ', 'RX', 'RY', 'RZ'], axisOrder: 'xyz', orientation: [0, 0, 0], position: [0, 0, 0], C: mIdent(), Cinv: mIdent() },
    bones: Object.create(null),
    boneNames: [],
    parent: Object.create(null),
    children: Object.create(null),
    order: [],           // topological, root first
    warnings: []
  };

  let section = '';
  let bone = null;
  let inLimits = false;

  for (let li = 0; li < lines.length; li++) {
    const line = stripComment(lines[li]);
    if (!line) continue;

    if (line[0] === ':') {
      const t = line.slice(1).split(/\s+/);
      section = t[0].toLowerCase();
      if (section === 'version') skel.version = t.slice(1).join(' ');
      if (section === 'name') skel.name = t.slice(1).join(' ');
      bone = null; inLimits = false;
      continue;
    }
    if (section === 'documentation' || !section) continue;

    const tok = line.split(/\s+/);
    const key = tok[0].toLowerCase();

    if (section === 'units') {
      if (key === 'mass') skel.units.mass = parseFloat(tok[1]);
      else if (key === 'length') skel.units.length = parseFloat(tok[1]);
      else if (key === 'angle') skel.units.angle = String(tok[1] || 'deg').toLowerCase();
      continue;
    }

    if (section === 'root') {
      if (key === 'order') skel.root.order = tok.slice(1).map(function (s) { return s.toUpperCase(); });
      else if (key === 'axis') {
        const n = nums(tok.slice(1));
        const ord = tok.slice(1).find(function (s) { return /^[xyzXYZ]{1,3}$/.test(s) && !/^[-+.\d]/.test(s); });
        if (ord) skel.root.axisOrder = ord.toLowerCase();
        if (n.length === 3) skel.root.orientation = n;   // some ASFs put the frame here
      } else if (key === 'position') skel.root.position = nums(tok.slice(1));
      else if (key === 'orientation') skel.root.orientation = nums(tok.slice(1));
      continue;
    }

    if (section === 'bonedata') {
      if (key === 'begin') {
        bone = { id: -1, name: '', direction: [0, 0, 0], length: 0, axis: [0, 0, 0], axisOrder: 'xyz', dof: [] };
        inLimits = false;
        continue;
      }
      if (key === 'end') {
        if (bone && bone.name) {
          skel.bones[bone.name] = bone;
          skel.boneNames.push(bone.name);
        }
        bone = null; inLimits = false;
        continue;
      }
      if (!bone) continue;
      if (line[0] === '(') continue;                    // continuation of `limits`
      if (key === 'limits') { inLimits = true; continue; }
      if (inLimits && line[0] === '(') continue;
      inLimits = false;

      if (key === 'id') bone.id = parseInt(tok[1], 10);
      else if (key === 'name') bone.name = tok[1];
      else if (key === 'direction') bone.direction = nums(tok.slice(1));
      else if (key === 'length') bone.length = parseFloat(tok[1]);
      else if (key === 'axis') {
        bone.axis = nums(tok.slice(1));
        const ord = tok.slice(1).find(function (s) { return /^[xyzXYZ]{1,3}$/.test(s) && !/^[-+.\d]/.test(s); });
        if (ord) bone.axisOrder = ord.toLowerCase();
      } else if (key === 'dof') {
        bone.dof = tok.slice(1).map(function (s) { return s.toLowerCase(); });
      }
      continue;
    }

    if (section === 'hierarchy') {
      if (key === 'begin' || key === 'end') continue;
      const p = tok[0];
      for (let i = 1; i < tok.length; i++) {
        const c = tok[i];
        if (skel.parent[c]) skel.warnings.push('bone ' + c + ' has two parents; keeping ' + skel.parent[c]);
        else skel.parent[c] = p;
        (skel.children[p] || (skel.children[p] = [])).push(c);
      }
      continue;
    }
  }

  // --- units → cm --------------------------------------------------------
  // CMU writes `:units length 0.45`. The database's own convention is that a
  // length unit is 1/0.45 inches, so cm-per-unit = 2.54 / 0.45 = 5.6444. Sanity
  // check on subject 60: lfemur 7.31159 → 41.3 cm thigh, root TY 17.49 →
  // 98.7 cm hip height. Both human.
  if (Number.isFinite(o.scale)) skel.scale = o.scale;
  else if (Number.isFinite(skel.units.length) && skel.units.length > 0) skel.scale = 2.54 / skel.units.length;
  else { skel.scale = 1; skel.warnings.push('no :units length — positions are in raw ASF units, not cm'); }

  // --- prepare per-bone matrices + scaled rest offsets --------------------
  const angScale = skel.units.angle === 'rad' ? 1 : DEG;

  const rootC = eulerMatrix(skel.root.axisOrder, {
    x: (skel.root.orientation[0] || 0) * angScale,
    y: (skel.root.orientation[1] || 0) * angScale,
    z: (skel.root.orientation[2] || 0) * angScale
  });
  skel.root.C = rootC;
  skel.root.Cinv = mT(rootC);
  skel.root.rotOrder = skel.root.order.filter(function (s) { return s[0] === 'R'; })
    .map(function (s) { return s[1].toLowerCase(); }).join('') || 'xyz';

  for (let i = 0; i < skel.boneNames.length; i++) {
    const b = skel.bones[skel.boneNames[i]];
    const C = eulerMatrix(b.axisOrder, {
      x: (b.axis[0] || 0) * angScale,
      y: (b.axis[1] || 0) * angScale,
      z: (b.axis[2] || 0) * angScale
    });
    b.C = C;
    b.Cinv = mT(C);
    b.offset = [
      (b.direction[0] || 0) * b.length * skel.scale,
      (b.direction[1] || 0) * b.length * skel.scale,
      (b.direction[2] || 0) * b.length * skel.scale
    ];
    b.lengthCm = b.length * skel.scale;
    b.dofOrder = b.dof.filter(function (d) { return d[0] === 'r'; })
      .map(function (d) { return d[1]; }).join('');
  }

  // --- topological order, root first -------------------------------------
  const seen = Object.create(null);
  const stack = ['root'];
  while (stack.length) {
    const n = stack.pop();
    if (seen[n]) continue;
    seen[n] = true;
    skel.order.push(n);
    const kids = skel.children[n] || [];
    for (let i = kids.length - 1; i >= 0; i--) stack.push(kids[i]);
  }
  for (let i = 0; i < skel.boneNames.length; i++) {
    if (!seen[skel.boneNames[i]]) skel.warnings.push('bone ' + skel.boneNames[i] + ' is not in :hierarchy — ignored');
  }

  return skel;
}

/* -------------------------------------------------------------------------- */
/* AMC                                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Parse a motion file into raw per-bone channel values. No skeleton needed —
 * validation against the skeleton's `dof` counts happens in `forwardKinematics`
 * so a bad file names the offending frame AND bone.
 *
 * @param {string} text the whole .amc file
 * @returns {{degrees:boolean, frames:Array<Object>, frameNumbers:number[], warnings:string[]}}
 */
export function parseAMC(text) {
  const lines = String(text).split(/\r?\n/);
  const out = { degrees: true, frames: [], frameNumbers: [], warnings: [] };
  let cur = null;

  for (let li = 0; li < lines.length; li++) {
    const line = lines[li].trim();
    if (!line) continue;
    if (line[0] === '#' || line[0] === '!') continue;
    if (line[0] === ':') {
      const k = line.slice(1).toLowerCase();
      if (k.indexOf('degrees') === 0) out.degrees = true;
      else if (k.indexOf('radians') === 0) out.degrees = false;
      continue;
    }
    if (/^\d+$/.test(line)) {
      cur = Object.create(null);
      out.frames.push(cur);
      out.frameNumbers.push(parseInt(line, 10));
      continue;
    }
    if (!cur) { out.warnings.push('line ' + (li + 1) + ' before the first frame number — skipped'); continue; }
    const tok = line.split(/\s+/);
    const vals = new Array(tok.length - 1);
    for (let i = 1; i < tok.length; i++) vals[i - 1] = parseFloat(tok[i]);
    cur[tok[0]] = vals;
  }

  return out;
}

/* -------------------------------------------------------------------------- */
/* FORWARD KINEMATICS                                                          */
/* -------------------------------------------------------------------------- */

/**
 * One frame of ASF forward kinematics.
 *
 *   M_local  = C · R(dof values, in dof order) · Cᵀ
 *   M_global = M_global(parent) · M_local
 *   start(b) = end(parent)
 *   end(b)   = start(b) + M_global(b) · offset      (offset already in cm)
 *
 * @param {Object} skel     from `parseASF`
 * @param {Object} motion   one entry of `parseAMC().frames`; null → rest pose
 * @param {Object} [opts]   { degrees = true }
 * @returns {{start:Object, end:Object, M:Object}} each keyed by bone name,
 *          positions as [x, y, z] in cm, raw CMU axes (no yaw fix applied)
 */
export function forwardKinematics(skel, motion, opts) {
  const o = opts || {};
  const degrees = o.degrees !== false;
  const k = degrees ? DEG : 1;
  const m = motion || Object.create(null);

  const start = Object.create(null);
  const end = Object.create(null);
  const M = Object.create(null);

  // --- root ---------------------------------------------------------------
  const rv = m.root || [];
  const tr = [skel.root.position[0] || 0, skel.root.position[1] || 0, skel.root.position[2] || 0];
  const rr = { x: 0, y: 0, z: 0 };
  for (let i = 0; i < skel.root.order.length; i++) {
    const ch = skel.root.order[i];
    const v = Number.isFinite(rv[i]) ? rv[i] : 0;
    if (ch === 'TX') tr[0] += v; else if (ch === 'TY') tr[1] += v; else if (ch === 'TZ') tr[2] += v;
    else if (ch === 'RX') rr.x = v * k; else if (ch === 'RY') rr.y = v * k; else if (ch === 'RZ') rr.z = v * k;
  }
  const rootPos = [tr[0] * skel.scale, tr[1] * skel.scale, tr[2] * skel.scale];
  M.root = mMul(mMul(skel.root.C, eulerMatrix(skel.root.rotOrder, rr)), skel.root.Cinv);
  start.root = rootPos;
  end.root = rootPos;

  // --- the rest of the chain ----------------------------------------------
  for (let i = 1; i < skel.order.length; i++) {
    const name = skel.order[i];
    const b = skel.bones[name];
    const pName = skel.parent[name];
    const pEnd = end[pName];
    if (!b || !pEnd) continue;

    const vals = m[name];
    const rot = { x: 0, y: 0, z: 0 };
    if (b.dofOrder.length) {
      if (vals && vals.length !== b.dofOrder.length) {
        throw new Error('AMC/ASF mismatch on bone "' + name + '": dof declares ' +
          b.dofOrder.length + ' channel(s) (' + b.dof.join(' ') + ') but the frame has ' + vals.length);
      }
      for (let d = 0; d < b.dofOrder.length; d++) {
        const v = vals && Number.isFinite(vals[d]) ? vals[d] : 0;
        rot[b.dofOrder[d]] = v * k;
      }
    }

    const local = b.dofOrder.length
      ? mMul(mMul(b.C, eulerMatrix(b.dofOrder, rot)), b.Cinv)
      : mIdent();
    const g = mMul(M[pName], local);
    M[name] = g;
    start[name] = pEnd;
    const off = mApply(g, b.offset);
    end[name] = [pEnd[0] + off[0], pEnd[1] + off[1], pEnd[2] + off[2]];
  }

  return { start: start, end: end, M: M };
}

/**
 * Reduce a full CMU skeleton pose to the 15 canonical points.
 * A canonical joint is where its bone STARTS (= its parent's end).
 *
 * @param {Object} skel
 * @param {{start:Object,end:Object}} fk  from `forwardKinematics`
 * @returns {Object} { root:[x,y,z], neck:[...], ... } — 15 keys, raw CMU axes
 */
export function canonicalPoints(skel, fk) {
  const p = Object.create(null);
  for (let i = 0; i < CANON.length; i++) {
    const key = CANON[i];
    if (key === 'root') { p.root = fk.start.root.slice(); continue; }
    const cands = CANON_SOURCE_BONES[key];
    let got = null;
    for (let c = 0; c < cands.length; c++) {
      const s = fk.start[cands[c]];
      if (s) { got = s; break; }
    }
    if (!got) throw new Error('skeleton has no bone for canonical point "' + key + '" (tried ' + cands.join(', ') + ')');
    p[key] = got.slice();
  }
  return p;
}

/* -------------------------------------------------------------------------- */
/* FACING + THE YAW FIX                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Which way the subject faces, in the TAKE's own frame, in degrees.
 * 0 = square to camera. Positive = turned so the subject's own left goes away
 * from the camera. ±180 = back to camera.
 *
 * Derived from the lateral (left-pointing) axis of hips AND shoulders together,
 * projected flat, then crossed with +Y: forward = L × Y. With L = +X (the
 * subject's left, per the ASF's own lhipjoint) that gives forward = +Z, which
 * is the contract's toward-camera axis.
 */
export function facingDeg(p) {
  const lx = (p.lhip[0] - p.rhip[0]) + (p.lsho[0] - p.rsho[0]);
  const lz = (p.lhip[2] - p.rhip[2]) + (p.lsho[2] - p.rsho[2]);
  // (lx, 0, lz) × (0, 1, 0) = (-lz, 0, lx)
  return Math.atan2(-lz, lx) * RAD;
}

function r1(d) { return Math.round(d * 10) / 10; }

function wrap180(d) {
  let x = d;
  while (x > 180) x -= 360;
  while (x <= -180) x += 360;
  return x;
}

/**
 * Pick the yaw to subtract from every frame.
 * Returns { yawDeg, method, frontFrames, frontFrames_frame0, note }.
 */
function chooseYaw(facings, align) {
  const n = facings.length;
  const count = function (yaw) {
    let c = 0;
    for (let i = 0; i < n; i++) if (Math.abs(wrap180(facings[i] - yaw)) <= FACING_LIMIT_DEG) c++;
    return c;
  };

  if (typeof align === 'number' && Number.isFinite(align)) {
    return { yawDeg: r1(wrap180(align)), method: 'explicit', frontFrames: count(align) };
  }
  if (align === 'none') return { yawDeg: 0, method: 'none', frontFrames: count(0) };
  if (align === 'frame0') return { yawDeg: r1(wrap180(facings[0])), method: 'frame0', frontFrames: count(facings[0]) };
  if (align === 'mean') {
    let sx = 0, sy = 0;
    for (let i = 0; i < n; i++) { sx += Math.cos(facings[i] * DEG); sy += Math.sin(facings[i] * DEG); }
    const y = Math.atan2(sy, sx) * RAD;
    return { yawDeg: r1(wrap180(y)), method: 'mean', frontFrames: count(y) };
  }

  // 'auto' — the yaw that leaves the most frames inside the ±40° window that
  // CONTRACT §4 says the front projection is worth anything inside. Scanned at
  // 1°, then refined at 0.1° across the winning degree.
  let best = 0, bestC = -1;
  for (let d = -180; d < 180; d++) {
    const c = count(d);
    if (c > bestC) { bestC = c; best = d; }
  }
  for (let d = best - 1; d <= best + 1; d += 0.1) {
    const c = count(d);
    if (c > bestC) { bestC = c; best = d; }
  }
  return {
    yawDeg: r1(wrap180(best)),
    method: 'auto',
    frontFrames: bestC,
    frontFrames_frame0: count(facings[0])
  };
}

/**
 * Rotate a point about +Y by `a`, where `cosY`/`sinY` are cos/sin of `a` and
 * the caller passes a = -facing so the facing lands on +Z.
 *
 *   Ry(a) · (x, y, z) = ( ca·x + sa·z ,  y , -sa·x + ca·z )
 *
 * Write it in exactly that form. An earlier revision folded the minus sign of
 * `a = -facing` into the formula as well as into `cosY`/`sinY`, which applied
 * Ry(+facing) — it rotated every take the wrong way by twice its own yaw, and
 * every check in `verify()` still passed, because a yaw is invisible to limb
 * lengths, to uprightness, to the floor and to foot skate. It was caught by
 * printing the points and noticing the left shoulder was on the wrong side.
 * `verify()` now recomputes facing FROM THE EMITTED POINTS and asserts the
 * left/right axis directly, which is the check that would have caught it.
 */
function applyYaw(v, cosY, sinY, cx, cz) {
  const x = v[0] - cx, z = v[2] - cz;
  return [cosY * x + sinY * z, v[1], -sinY * x + cosY * z];
}

/* -------------------------------------------------------------------------- */
/* TAKE                                                                        */
/* -------------------------------------------------------------------------- */

function round(v, d) { const m = Math.pow(10, d); return Math.round(v * m) / m; }

/**
 * ASF text + AMC text  →  TAKE  (CONTRACT §2).
 *
 * @param {string} asfText
 * @param {string} amcText
 * @param {Object} [opts]
 * @param {string} [opts.source='cmu/unknown']  provenance, kept for credits
 * @param {string} [opts.label='unlabelled']
 * @param {number} [opts.fps=120]              CMU captures at 120 Hz
 * @param {string|number} [opts.align='auto']  'auto' | 'frame0' | 'mean' | 'none' | degrees
 * @param {number[]} [opts.range]              [firstFrame, lastFrame] inclusive, 0-based
 * @param {number} [opts.stride=1]
 * @param {number} [opts.decimals=3]           cm precision in the emitted points
 * @param {boolean} [opts.recenter=true]       put the reference frame's root at x=z=0
 * @returns {Object} TAKE
 */
export function toTake(asfText, amcText, opts) {
  const o = opts || {};
  const skel = parseASF(asfText, o);
  const amc = parseAMC(amcText);

  const fps = Number.isFinite(o.fps) ? o.fps : 120;
  const stride = Math.max(1, Math.floor(o.stride || 1));
  const dec = Number.isFinite(o.decimals) ? o.decimals : 3;
  const lo = o.range ? Math.max(0, o.range[0]) : 0;
  const hi = o.range ? Math.min(amc.frames.length - 1, o.range[1]) : amc.frames.length - 1;
  if (!(hi >= lo)) throw new Error('empty frame range: ' + JSON.stringify(o.range) + ' over ' + amc.frames.length + ' frames');

  // --- pass 1: FK to raw canonical points --------------------------------
  const raw = [];
  const srcIndex = [];
  for (let i = lo; i <= hi; i += stride) {
    raw.push(canonicalPoints(skel, forwardKinematics(skel, amc.frames[i], { degrees: amc.degrees })));
    srcIndex.push(i);
  }

  // --- pass 2: choose the yaw --------------------------------------------
  const facings = raw.map(facingDeg);
  const yaw = chooseYaw(facings, o.align === undefined ? 'auto' : o.align);
  const a = -yaw.yawDeg * DEG;            // rotate BY -facing so facing → +Z
  const cosY = Math.cos(a), sinY = Math.sin(a);

  // Reference frame for recentring: the frame whose facing is closest to the
  // chosen yaw, so the figure is centred on a moment it is actually square on.
  let refI = 0, refErr = Infinity;
  for (let i = 0; i < facings.length; i++) {
    const e = Math.abs(wrap180(facings[i] - yaw.yawDeg));
    if (e < refErr) { refErr = e; refI = i; }
  }
  const recenter = o.recenter !== false;
  const cx = recenter ? raw[refI].root[0] : 0;
  const cz = recenter ? raw[refI].root[2] : 0;

  // --- pass 3: emit -------------------------------------------------------
  const frames = new Array(raw.length);
  const facingOut = new Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    const p = Object.create(null);
    for (let c = 0; c < CANON.length; c++) {
      const key = CANON[c];
      const v = applyYaw(raw[i][key], cosY, sinY, cx, cz);
      p[key] = [round(v[0], dec), round(v[1], dec), round(v[2], dec)];
    }
    // `t` is rebased so the first emitted frame is exactly 0, which is what
    // CONTRACT §2's example shows. Where the clip came from is not lost — it is
    // in `meta.frameRange` and `meta.sourceStartSec`.
    frames[i] = { t: round((srcIndex[i] - srcIndex[0]) / fps, 6), p: p };
    facingOut[i] = round(wrap180(facings[i] - yaw.yawDeg), 1);
  }

  const seg = {};
  for (let i = 0; i < SEGMENTS.length; i++) {
    const s = SEGMENTS[i];
    seg[s.a + '-' + s.b] = round(dist(frames[0].p[s.a], frames[0].p[s.b]), 2);
  }

  return {
    source: o.source || 'cmu/unknown',
    label: o.label || 'unlabelled',
    fps: fps / stride,
    units: 'cm',
    frames: frames,

    // Everything below is ADDITIVE. The contract's four fields above are exact;
    // a retargeter that ignores `meta` entirely still works.
    meta: {
      skeleton: skel.name || 'unknown',
      scaleCmPerUnit: round(skel.scale, 6),
      sourceFrames: amc.frames.length,
      sourceFps: fps,
      frameRange: [lo, hi],
      sourceStartSec: round(lo / fps, 6),
      stride: stride,
      durationSec: round(frames.length ? frames[frames.length - 1].t - frames[0].t : 0, 4),
      /** The yaw this parser removed, and what it bought. CONTRACT §2. */
      axisFix: {
        yawDeg: yaw.yawDeg,
        method: yaw.method,
        recentered: recenter,
        refFrame: srcIndex[refI],
        frontFacingFrames: yaw.frontFrames,
        frontFacingFrames_ifAlignedToFrame0: yaw.frontFrames_frame0,
        note: 'raw CMU is already +X=subject-left, +Y=up, +Z=subject-forward; only a yaw about +Y is applied'
      },
      /** Per-frame degrees off camera, parallel to `frames`. 0 = square on. */
      facingDeg: facingOut,
      /** Rest-skeleton segment lengths, cm, measured on the first emitted frame. */
      segmentsCm: seg,
      warnings: skel.warnings.concat(amc.warnings)
    }
  };
}

/** Read the two files off disk and convert. `source` defaults from the AMC name. */
export function takeFromFiles(asfPath, amcPath, opts) {
  const o = Object.assign({}, opts);
  if (!o.source) o.source = 'cmu/' + path.basename(amcPath).replace(/\.amc$/i, '');
  return toTake(fs.readFileSync(asfPath, 'utf8'), fs.readFileSync(amcPath, 'utf8'), o);
}

/* -------------------------------------------------------------------------- */
/* VERIFY — the part that decides whether any of the above is true             */
/* -------------------------------------------------------------------------- */

function dist(a, b) {
  const dx = a[0] - b[0], dy = a[1] - b[1], dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function stats(arr) {
  let mn = Infinity, mx = -Infinity, s = 0;
  for (let i = 0; i < arr.length; i++) { const v = arr[i]; if (v < mn) mn = v; if (v > mx) mx = v; s += v; }
  const mean = s / arr.length;
  let q = 0;
  for (let i = 0; i < arr.length; i++) { const d = arr[i] - mean; q += d * d; }
  return { mean: mean, sd: Math.sqrt(q / arr.length), min: mn, max: mx, n: arr.length };
}

function sorted(arr) { return arr.slice().sort(function (x, y) { return x - y; }); }

function median(arr) {
  const a = sorted(arr);
  const h = a.length >> 1;
  return a.length % 2 ? a[h] : (a[h - 1] + a[h]) / 2;
}

/**
 * Prove the FK, in six ways, on the emitted TAKE.
 *
 * Read the first check honestly: limb-length constancy is NECESSARY but not
 * SUFFICIENT. Every M_global is a product of rotation matrices, so |M·offset|
 * is |offset| whatever the rotations are — a wrong Euler ORDER, a wrong C, or
 * `Cᵀ·R·C` instead of `C·R·Cᵀ` all still give perfectly constant bones on a
 * figure that is tumbling through the floor. It catches a mis-scaled skeleton,
 * a garbled `direction`/`length`, and a channel-count drift, and that is worth
 * having, but on its own it proves the matrices are ROTATIONS, not that they
 * are the RIGHT rotations.
 *
 * The checks that actually pin the orientation down are the physical ones —
 * the figure has to stand up, keep its head above its hips, keep its feet on
 * one floor, and NOT SKATE. Foot skate is the sharp one: a planted foot in
 * real capture moves a few cm/s; under a wrong rotation composition the whole
 * body swings about the root and the "planted" foot travels metres per second.
 *
 * @param {Object} take from `toTake`
 * @param {Object} [opts] { verbose }
 * @returns {Object} report — see `formatReport` for a human rendering
 */
export function verify(take, opts) {
  const o = opts || {};
  const F = take.frames;
  const n = F.length;
  if (!n) throw new Error('take has no frames');
  const rep = {
    source: take.source, label: take.label, frames: n, fps: take.fps,
    durationSec: +((F[n - 1].t - F[0].t) || 0).toFixed(3),
    checks: [], fail: [], unusable: [], warn: []
  };

  /**
   * `verify` answers TWO different questions and never lets one stand in for
   * the other.
   *
   *   ok()    KINEMATICS — is the parse and the forward kinematics right?
   *           These are properties of the conversion. Any failure means the
   *           TAKE is wrong and must not be used at all.
   *
   *   need()  CHARACTER — is this take an upright, front-on, human clip we can
   *           retarget? A breakdance take genuinely puts its head under its
   *           hips and its foot 177 cm in the air, and a perfectly converted
   *           breakdance take will fail these. `need()` fires only at readings
   *           so extreme they would imply a parse error, and `note()` reports
   *           the rest as measurement.
   *
   * Keeping them in one bucket is what made the first pass call a correct
   * breakdance conversion "FAIL" three times over.
   */
  const ok = function (name, pass, detail) {
    rep.checks.push({ name: name, group: 'kinematics', pass: !!pass, detail: detail });
    if (!pass) rep.fail.push(name + ' — ' + detail);
  };
  const need = function (name, pass, detail) {
    rep.checks.push({ name: name, group: 'character', pass: !!pass, detail: detail });
    if (!pass) rep.unusable.push(name + ' — ' + detail);
  };
  const note = function (name, pass, detail) {
    rep.checks.push({ name: name, group: 'character', pass: !!pass, soft: true, detail: detail });
    if (!pass) rep.warn.push(name + ' — ' + detail);
  };
  /** kinematics, but reported rather than enforced — the spans that cross chains. */
  const notek = function (name, pass, detail) {
    rep.checks.push({ name: name, group: 'kinematics', pass: !!pass, soft: true, detail: detail });
    if (!pass) rep.warn.push(name + ' — ' + detail);
  };
  const soft = note;

  /* 1. RIGID SEGMENTS ---------------------------------------------------- */
  rep.segments = {};
  let worstSpread = 0, worstSeg = '';
  let worstDecl = 0, worstDeclSeg = '';
  for (let s = 0; s < SEGMENTS.length; s++) {
    const S = SEGMENTS[s];
    const d = new Array(n);
    for (let i = 0; i < n; i++) d[i] = dist(F[i].p[S.a], F[i].p[S.b]);
    const st = stats(d);
    const spread = (st.max - st.min) / st.mean * 100;
    const row = {
      meanCm: +st.mean.toFixed(4), sdCm: +st.sd.toFixed(5),
      minCm: +st.min.toFixed(4), maxCm: +st.max.toFixed(4),
      spreadPct: +spread.toFixed(4),
      rigid: S.rigid, bone: S.bone
    };
    // Independent cross-check: does the measured bone equal the length the ASF
    // declared? Constancy alone would survive a mis-scaled or mis-parsed
    // skeleton; this would not.
    if (S.rigid && o.skeleton && o.skeleton.bones[S.bone]) {
      const decl = o.skeleton.bones[S.bone].lengthCm;
      row.declaredCm = +decl.toFixed(4);
      row.declaredErrCm = +Math.abs(decl - st.mean).toFixed(4);
      if (row.declaredErrCm > worstDecl) { worstDecl = row.declaredErrCm; worstDeclSeg = S.bone; }
    }
    rep.segments[S.a + '-' + S.b] = row;
    if (S.rigid && spread > worstSpread) { worstSpread = spread; worstSeg = S.a + '-' + S.b; }
  }
  ok('rigid limb lengths constant',
    worstSpread < 0.05,
    'worst of the 8 one-bone segments is ' + worstSeg + ' at ' + worstSpread.toFixed(4) +
    '% peak-to-peak (budget 0.05%; the floor here is the take\'s own 0.001 cm rounding)');
  if (o.skeleton) {
    ok('bones match the ASF declaration', worstDecl < 0.01,
      worstDecl === 0 ? 'all 8 match to the take\'s full emitted precision'
        : 'worst is ' + worstDeclSeg + ' off by ' + worstDecl.toFixed(4) + ' cm (budget 0.01 cm)');
  }
  notek('cross-chain spans near-constant',
    rep.segments['lsho-rsho'].spreadPct < 25 &&
    rep.segments['lhip-rhip'].spreadPct < 5 &&
    rep.segments['neck-head'].spreadPct < 15,
    'shoulder span ' + rep.segments['lsho-rsho'].spreadPct.toFixed(2) + '%, hip span ' +
    rep.segments['lhip-rhip'].spreadPct.toFixed(2) + '%, neck-head ' +
    rep.segments['neck-head'].spreadPct.toFixed(2) + '% (all three cross a multi-dof chain, so they flex by design)');

  /* 2. THE STANDING FRAME — the contract's own assertion ------------------ */
  // Pick the most standing-still frame: both ankles level and low, head high,
  // and squarest to camera — that last term matters, because a frame with the
  // dancer's back turned would still pass "shoulders level" while telling a
  // reader nothing about whether the figure faces the right way.
  const facingArr = (take.meta && take.meta.facingDeg) || null;
  let bestI = 0, bestScore = -Infinity;
  for (let i = 0; i < n; i++) {
    const p = F[i].p;
    const level = Math.abs(p.lank[1] - p.rank[1]);
    const spread = Math.hypot(p.lank[0] - p.rank[0], p.lank[2] - p.rank[2]);
    const off = facingArr ? Math.abs(facingArr[i]) : 0;
    const score = p.head[1] - 2 * level - spread - 0.5 * off;
    if (score > bestScore) { bestScore = score; bestI = i; }
  }
  const sp = F[bestI].p;
  const floorY = Math.min(sp.lank[1], sp.rank[1]);
  const shoulderTilt = Math.abs(sp.lsho[1] - sp.rsho[1]);
  const shoulderMeanY = (sp.lsho[1] + sp.rsho[1]) / 2;
  const hipMeanY = (sp.lhip[1] + sp.rhip[1]) / 2;
  const height = sp.head[1] - floorY;
  rep.standing = {
    frame: bestI, t: F[bestI].t,
    shoulderTiltCm: +shoulderTilt.toFixed(2),
    shoulderY: +shoulderMeanY.toFixed(2),
    hipY: +hipMeanY.toFixed(2),
    shoulderAboveHipCm: +(shoulderMeanY - hipMeanY).toFixed(2),
    headToAnkleCm: +height.toFixed(2),
    facingDeg: take.meta ? take.meta.facingDeg[bestI] : null
  };
  ok('shoulders level on a standing frame', shoulderTilt < 6,
    '|lsho.y - rsho.y| = ' + shoulderTilt.toFixed(2) + ' cm on frame ' + bestI + ' (budget 6 cm)');
  ok('shoulders well above hips', (shoulderMeanY - hipMeanY) > 30,
    'shoulders sit ' + (shoulderMeanY - hipMeanY).toFixed(1) + ' cm above the hips (budget > 30 cm)');
  ok('figure is the right way up', sp.head[1] > sp.root[1] && sp.root[1] > floorY,
    'head ' + sp.head[1].toFixed(1) + ' > root ' + sp.root[1].toFixed(1) + ' > floor ' + floorY.toFixed(1) + ' cm');
  // Widened after measuring six subjects: 82 and 94 come out at 121 cm
  // head-to-ankle and are correct conversions of small skeletons. CMU's fitted
  // skeletons are only approximately to scale and CONTRACT §4 renormalises per
  // take anyway, so absolute size is a sanity bound, not a specification. It
  // still catches the "forgot the cm conversion" case, which lands at 25 cm.
  ok('height is human', height > 100 && height < 220,
    'head-to-ankle ' + height.toFixed(1) + ' cm (the head BONE ends near the crown and the ' +
    'ankle sits above the sole, so this reads under stature by roughly 15 cm)');

  /* 3. THE WHOLE TAKE STAYS UPRIGHT --------------------------------------- */
  let uprightBad = 0, tiltMax = 0;
  const rootYs = new Array(n), floorYs = new Array(n);
  for (let i = 0; i < n; i++) {
    const p = F[i].p;
    if (!(p.head[1] > p.neck[1] && p.neck[1] > p.root[1])) uprightBad++;
    const t = Math.abs(p.lsho[1] - p.rsho[1]);
    if (t > tiltMax) tiltMax = t;
    rootYs[i] = p.root[1];
    floorYs[i] = Math.min(p.lank[1], p.rank[1]);
  }
  // A take that is upside down in MOST frames means the Y axis is wrong. A take
  // that is upside down in SOME frames is a breakdancer, and 85_02 really does
  // spend 11% of its frames inverted. Hard-fail the first, report the second.
  const invPct = uprightBad / n * 100;
  rep.invertedPct = +invPct.toFixed(1);
  ok('the take is not upside down', invPct < 50,
    invPct.toFixed(1) + '% of frames have the head below the root; past 50% the Y axis itself is wrong');
  note('figure stays upright throughout', uprightBad === 0,
    uprightBad + ' / ' + n + ' frames put the head below the root — fine for floorwork, ' +
    'but those frames have no meaning on a standing 2D rig');
  const rootSt = stats(rootYs);
  ok('hip height stays human all take', rootSt.min > 20 && rootSt.max < 170,
    'root.y ' + rootSt.min.toFixed(1) + ' \u2026 ' + rootSt.max.toFixed(1) + ' cm (mean ' + rootSt.mean.toFixed(1) + ')');

  /* 4. ONE FLOOR ----------------------------------------------------------- */
  // What proves the FK is that there IS a stable ground the lower ankle keeps
  // coming back to, and that it sits near y=0. NOT that the ankle never leaves
  // it — a breakdancer's foot legitimately reaches 177 cm, and asserting a
  // small standard deviation called that correct conversion broken.
  const floorSt = stats(floorYs);
  const groundY = sorted(floorYs)[Math.floor(n * 0.05)];
  let nearGround = 0;
  for (let i = 0; i < n; i++) if (floorYs[i] <= groundY + 6) nearGround++;
  rep.floor = {
    groundCm: +groundY.toFixed(2),
    meanCm: +floorSt.mean.toFixed(2), sdCm: +floorSt.sd.toFixed(2),
    minCm: +floorSt.min.toFixed(2), maxCm: +floorSt.max.toFixed(2),
    onGroundPct: +(nearGround / n * 100).toFixed(1)
  };
  ok('there is a floor, and it is at y = 0', groundY > -15 && groundY < 30,
    'the 5th-percentile lower ankle sits at y = ' + groundY.toFixed(2) +
    ' cm (an ankle rides a few cm above the sole, so a shade positive is right)');
  need('the figure spends time standing on it', nearGround / n > 0.2,
    (nearGround / n * 100).toFixed(1) + '% of frames have a foot within 6 cm of the ground ' +
    '(budget 20%); lower ankle ranges ' + floorSt.min.toFixed(1) + ' \u2026 ' + floorSt.max.toFixed(1) + ' cm');

  /* 5. FOOT SKATE — the check a wrong rotation cannot survive -------------- */
  // The one check here that pins the ORIENTATION down rather than just proving
  // the matrices are rotations. Feet that carry weight stay put. Under a wrong
  // Euler order or a flipped C the whole body swings about the root, and the
  // foot nearest the ground travels metres per second.
  //
  // "Planted" is deliberately strict: the LOWER of the two ankles, within 3 cm
  // of this take's own ground level (5th percentile of the lower ankle, which
  // is robust against the frames where the dancer is airborne). Then the
  // measure is not instantaneous speed but total drift over a CONTACT EPISODE
  // of 15+ consecutive planted frames (⅛ s), because that is what actually
  // distinguishes a pivoting salsa foot from a body being flung around.
  const ground = sorted(floorYs)[Math.floor(n * 0.05)];
  const plantThresh = ground + 3;
  const dt = 1 / take.fps;
  const speeds = [];
  const drifts = [];
  for (const key of ['lank', 'rank']) {
    let runStart = -1;
    for (let i = 0; i <= n; i++) {
      const p = i < n ? F[i].p : null;
      const other = key === 'lank' ? 'rank' : 'lank';
      const planted = !!p && p[key][1] <= plantThresh && p[key][1] <= p[other][1];
      if (planted && runStart < 0) runStart = i;
      if (planted && i > runStart) {
        const a = F[i - 1].p[key], b = p[key];
        speeds.push(Math.hypot(b[0] - a[0], b[2] - a[2]) / dt);
      }
      if (!planted && runStart >= 0) {
        const len = i - runStart;
        if (len >= 15) {
          const a = F[runStart].p[key], b = F[i - 1].p[key];
          drifts.push({ cm: Math.hypot(b[0] - a[0], b[2] - a[2]), sec: len * dt });
        }
        runStart = -1;
      }
    }
  }
  if (speeds.length > 20 && drifts.length > 3) {
    const med = median(speeds);
    const p95 = sorted(speeds)[Math.floor(speeds.length * 0.95)];
    const medDrift = median(drifts.map(function (d) { return d.cm; }));
    const medHold = median(drifts.map(function (d) { return d.sec; }));
    rep.skate = {
      groundCm: +ground.toFixed(2),
      samples: speeds.length,
      medianCmPerSec: +med.toFixed(2), p95CmPerSec: +p95.toFixed(2),
      contacts: drifts.length,
      medianContactSec: +medHold.toFixed(3),
      medianContactDriftCm: +medDrift.toFixed(2)
    };
    // KINEMATICS, not character: when the measurement CAN be made it is a
    // statement about the conversion, and only the inability to make it is a
    // property of the clip. Budgets sized off six real subjects, whose worst
    // readings are 15.9 cm/s (61_01, salsa pivots) and 4.1 cm of drift (05_02)
    // — so 2.5x and 3.6x headroom. Ignoring the root's rotation, which is the
    // sabotage this catches and nothing else does, lands at 50 cm/s and 22 cm.
    ok('planted feet do not skate', med < 40 && medDrift < 15,
      drifts.length + ' contacts of ' + medHold.toFixed(2) + ' s median; the planted foot drifts ' +
      medDrift.toFixed(1) + ' cm over one (budget 15), instantaneous speed ' + med.toFixed(1) +
      ' cm/s median / ' + p95.toFixed(0) + ' p95');
  } else {
    // NOT a warning. A standing human at 120 fps always plants a foot; if this
    // take does not, either the FK is wrong or the clip is unusable, and the
    // caller must hear it. Letting the sharpest physical probe in the battery
    // disarm itself on exactly the takes it exists to catch is how a broken
    // conversion gets a green light. It is graded as CHARACTER rather than
    // KINEMATICS because a genuinely 0.08 s take also lands here.
    need('planted feet do not skate', false,
      rep.durationSec < 1
        ? 'the take is only ' + rep.durationSec + ' s long — too short to contain a foot contact, ' +
          'so nothing here has been proved either way'
        : 'only ' + speeds.length + ' planted samples in ' + drifts.length +
          ' contacts of 15+ frames — this figure never puts a foot down, which is not a human take');
  }

  /* 6. FACING — recomputed from the EMITTED points, never from meta --------- */
  // Deliberately independent. `meta.facingDeg` is written by `toTake` from the
  // PRE-rotation points; if the yaw were applied wrongly, the two would
  // disagree and only this check would notice. It is the one assertion in the
  // file that tests the axis fix rather than the kinematics.
  const f = new Array(n);
  let front = 0, back = 0, worst = 0;
  for (let i = 0; i < n; i++) {
    f[i] = wrap180(facingDeg(F[i].p));
    const a = Math.abs(f[i]);
    if (a <= FACING_LIMIT_DEG) front++;
    if (a > 120) back++;
    if (a > worst) worst = a;
  }
  // The longest CONTINUOUS front-facing run. CONTRACT §4's preferred handling of
  // a turn is "flag the frames and let the caller trim the take to its
  // front-facing span", and this IS that span — the thing a caller passes
  // straight back as `--range`. On 60_01 it finds a 1.8 s window, already
  // inside the 1400–2200 ms a move is allowed to be.
  let runS = -1, bestS = -1, bestLen = 0;
  for (let i = 0; i <= n; i++) {
    const inFront = i < n && Math.abs(f[i]) <= FACING_LIMIT_DEG;
    if (inFront && runS < 0) runS = i;
    if (!inFront && runS >= 0) {
      if (i - runS > bestLen) { bestLen = i - runS; bestS = runS; }
      runS = -1;
    }
  }
  const srcOff = take.meta && take.meta.frameRange ? take.meta.frameRange[0] : 0;
  const srcStride = take.meta && take.meta.stride ? take.meta.stride : 1;
  rep.facing = {
    frontFrames: front, frontPct: +(front / n * 100).toFixed(1),
    backFrames: back, backPct: +(back / n * 100).toFixed(1),
    maxOffCameraDeg: +worst.toFixed(1),
    medianAbsDeg: +median(f.map(Math.abs)).toFixed(1),
    longestFrontRun: bestLen ? {
      frames: bestLen,
      sec: +(bestLen / take.fps).toFixed(3),
      takeFrames: [bestS, bestS + bestLen - 1],
      sourceRange: [srcOff + bestS * srcStride, srcOff + (bestS + bestLen - 1) * srcStride]
    } : null
  };
  soft('take is mostly front-facing', front / n > 0.5,
    (front / n * 100).toFixed(1) + '% of frames within \u00b1' + FACING_LIMIT_DEG +
    '\u00b0 of camera, ' + (back / n * 100).toFixed(1) + '% past 120\u00b0 (back to camera); worst ' + worst.toFixed(0) + '\u00b0');

  if (take.meta && take.meta.facingDeg) {
    let dmax = 0;
    for (let i = 0; i < n; i++) {
      const d = Math.abs(wrap180(f[i] - take.meta.facingDeg[i]));
      if (d > dmax) dmax = d;
    }
    rep.facingAgreement = +dmax.toFixed(3);
    ok('the yaw fix actually landed', dmax < 0.5,
      'facing measured on the emitted points differs from meta.facingDeg by at most ' +
      dmax.toFixed(2) + '\u00b0 (budget 0.5\u00b0; a mis-signed yaw shows up here as twice the yaw)');
  }

  /* 6b. LEFT IS SCREEN-RIGHT — the mirror assertion ------------------------ */
  // CONTRACT §2: +X is the subject's LEFT as the camera sees it. Nothing else
  // in this battery can tell a figure from its mirror image, and a mirrored
  // figure is the single most expensive error to find downstream, so it is
  // asserted on the standing frame AND across every front-facing frame.
  const lateralStanding = sp.lsho[0] - sp.rsho[0];
  ok('+X is the subject\'s left (shoulders)', lateralStanding > 10,
    'on standing frame ' + bestI + ' lsho.x - rsho.x = ' + lateralStanding.toFixed(1) +
    ' cm; positive means the subject\'s left shoulder is at +X, i.e. screen right');
  ok('+X is the subject\'s left (hips)', (sp.lhip[0] - sp.rhip[0]) > 3,
    'lhip.x - rhip.x = ' + (sp.lhip[0] - sp.rhip[0]).toFixed(1) + ' cm on the same frame');
  let mirrored = 0, frontCount = 0;
  for (let i = 0; i < n; i++) {
    if (Math.abs(f[i]) > FACING_LIMIT_DEG) continue;
    frontCount++;
    if (F[i].p.lsho[0] <= F[i].p.rsho[0]) mirrored++;
  }
  ok('no front-facing frame is mirrored', mirrored === 0,
    mirrored + ' / ' + frontCount + ' front-facing frames have the left shoulder at or left of the right one');

  /* 7. REST POSE ROUNDTRIP ------------------------------------------------- */
  // Zero motion must reproduce the ASF skeleton exactly. This is a property of
  // C · I · Cᵀ = I and it fails loudly if `axis` parsing or the C/Cᵀ pairing is
  // broken. Run by `verifySkeleton`, folded in here when the skeleton is given.
  if (o.skeleton) {
    rep.restPose = verifySkeleton(o.skeleton);
    ok('zero motion rebuilds the ASF skeleton', rep.restPose.pass,
      'worst bone off by ' + rep.restPose.worstBoneErrCm + ' cm' +
      (rep.restPose.worstBone ? ' (' + rep.restPose.worstBone + ')' : ''));
  }

  /* 8. HINGE ANGLES vs THE RAW FILE ---------------------------------------- */
  if (o.skeleton && o.amc) {
    rep.hinges = verifyHinges(o.skeleton, o.amc);
    const bad = rep.hinges.hinges.filter(function (h) { return !h.pass; });
    ok('hinge angles equal the AMC\'s own numbers', rep.hinges.pass,
      rep.hinges.hinges.length + ' one-dof hinges (' +
      rep.hinges.hinges.map(function (h) { return h.bone; }).join(', ') + '); worst disagreement ' +
      rep.hinges.worstErrDeg.toExponential(2) + '\u00b0' +
      (rep.hinges.worstHinge ? ' at ' + rep.hinges.worstHinge : ' \u2014 every hinge exact') +
      (bad.length ? ' — OVER TOLERANCE on ' + bad.map(function (h) { return h.bone; }).join(', ') : ''));
  }

  rep.pass = rep.fail.length === 0;        // the conversion is correct
  rep.usable = rep.unusable.length === 0;  // …and the clip is worth retargeting
  return rep;
}

/**
 * THE SHARPEST CHECK IN THE FILE — and the only one that ties the geometry back
 * to the raw AMC numbers by a route that does not go through the FK chain.
 *
 * A bone qualifies as a PURE HINGE when three things hold:
 *   1. it has exactly one rotational dof,
 *   2. its rest direction is collinear with its parent's, so it starts straight,
 *   3. its rotation axis — the column of `C` belonging to that dof — is
 *      PERPENDICULAR to the bone.
 *
 * Condition 3 is not decoration. `lwrist` passes 1 and 2 and still carries no
 * bend at all: its dof is `ry` and its `axis 0 90 90` puts C's y column along
 * the bone itself, so the channel is pronation, a TWIST. Including it made this
 * check report 102° of "error" on a perfectly correct conversion. Twisted
 * channels are listed in the result as `twist: true` and excluded, rather than
 * dropped silently, because "we skipped that one" is information.
 *
 * On this skeleton the qualifying set is `ltibia`, `rtibia`, `lradius`,
 * `rradius`, `lfingers`, `rfingers` — and the first four are exactly our
 * canonical knees and elbows. For a qualifying bone the ANGLE between the
 * parent segment and the child segment, measured in world space off the FK
 * output, must equal the ABSOLUTE VALUE OF THAT BONE'S OWN NUMBER ON THAT AMC
 * LINE. Not approximately — to floating point. It measures 0.000000000° here.
 *
 * Why it bites: it is a property of `C · R · Cᵀ` specifically. `C`'s first
 * column is the hinge axis, and for `lhumerus` (`axis -180 -30 -90`) that axis
 * comes out perpendicular to the bone. Drop `C` and the rotation happens about
 * the GLOBAL x, which for that bone IS the bone's own direction — so the elbow
 * stops bending at all and the arm becomes a rigid pole above the head. Every
 * other check in this file survives that, because the legs barely move and the
 * figure still stands on a floor and never inverts, and the take is still
 * garbage. This one reports ~111° of error. It was added after that exact
 * sabotage walked through a green battery.
 *
 * @param {Object} skel from `parseASF`
 * @param {Object} amc  from `parseAMC`
 * @param {Object} [opts] { maxFrames }
 * @returns {Object} { hinges, worstErrDeg, worstHinge, pass, framesChecked }
 */
export function verifyHinges(skel, amc, opts) {
  const o = opts || {};
  const hinges = [];
  const twists = [];
  for (let i = 0; i < skel.boneNames.length; i++) {
    const name = skel.boneNames[i];
    const b = skel.bones[name];
    const pName = skel.parent[name];
    const pb = pName && skel.bones[pName];
    if (!pb || b.dofOrder.length !== 1) continue;
    const d = b.direction, pd = pb.direction;
    const dot = d[0] * pd[0] + d[1] * pd[1] + d[2] * pd[2];
    if (Math.abs(dot - 1) > 1e-6) continue;      // not collinear at rest
    // The hinge axis is C's column for this dof — C · (unit axis vector).
    const col = { x: 0, y: 1, z: 2 }[b.dofOrder[0]];
    const ax = [b.C[col], b.C[3 + col], b.C[6 + col]];
    const along = Math.abs(ax[0] * d[0] + ax[1] * d[1] + ax[2] * d[2]);
    if (along > 1e-6) { twists.push({ bone: name, parent: pName, dof: b.dof[0], alongBone: +along.toFixed(6) }); continue; }
    hinges.push({ bone: name, parent: pName, dof: b.dof[0], canonical: CANON_HINGE[name] || null, maxErrDeg: 0, meanAbsAngle: 0 });
  }
  if (!hinges.length) {
    return { hinges: [], twists: twists, worstErrDeg: 0, worstHinge: '', pass: true, framesChecked: 0,
      note: 'no qualifying one-dof bending hinge in this skeleton' };
  }

  // The angle between two segments, via atan2 rather than acos. acos is badly
  // conditioned near 0 and 180 — it turned a genuinely exact conversion into a
  // reported 1.5e-6 degree "error" on the frames where a knee was straight.
  // atan2(|u x v|, u . v) is stable across the whole range and drops the same
  // measurement to 7e-15.
  const segAngle = function (a, m, c) {
    const u = [m[0] - a[0], m[1] - a[1], m[2] - a[2]];
    const v = [c[0] - m[0], c[1] - m[1], c[2] - m[2]];
    const cx = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    return Math.atan2(Math.hypot(cx[0], cx[1], cx[2]), u[0] * v[0] + u[1] * v[1] + u[2] * v[2]) * RAD;
  };

  // A hinge is only exactly straight at rest if the ASF's two `direction`
  // vectors are exactly parallel, and they are only printed to six significant
  // figures. Subject 05's rhumerus/rradius are off by 7e-4 degrees, which is
  // real skeleton geometry rather than a conversion error, so the rest angle is
  // MEASURED and each hinge carries its own tolerance instead of every skeleton
  // being held to subject 60's exactness.
  const restFk = forwardKinematics(skel, null, { degrees: true });
  for (let h = 0; h < hinges.length; h++) {
    const H = hinges[h];
    H.restAngleDeg = +segAngle(restFk.start[H.parent], restFk.start[H.bone], restFk.end[H.bone]).toFixed(9);
    H.tolDeg = 1e-9 + 3 * H.restAngleDeg;
  }

  const nF = Math.min(amc.frames.length, o.maxFrames || amc.frames.length);
  for (let fi = 0; fi < nF; fi++) {
    const fk = forwardKinematics(skel, amc.frames[fi], { degrees: amc.degrees });
    for (let h = 0; h < hinges.length; h++) {
      const H = hinges[h];
      const a = fk.start[H.parent], m = fk.start[H.bone], c = fk.end[H.bone];
      if (!a || !m || !c) continue;
      const ang = segAngle(a, m, c);
      const vals = amc.frames[fi][H.bone];
      let declared = Math.abs(vals && Number.isFinite(vals[0]) ? vals[0] : 0);
      if (!amc.degrees) declared *= RAD;
      // An AMC channel can be unwrapped past a full turn (subject 60's lfoot
      // reads 342). An included angle cannot exceed 180, so fold it.
      declared = declared % 360;
      if (declared > 180) declared = 360 - declared;
      const err = Math.abs(ang - declared);
      if (err > H.maxErrDeg) { H.maxErrDeg = err; H.worstFrame = fi; }
      H.meanAbsAngle += ang / nF;
    }
  }
  let worst = 0, worstHinge = '', pass = true;
  for (let h = 0; h < hinges.length; h++) {
    const H = hinges[h];
    H.maxErrDeg = +H.maxErrDeg.toFixed(9);
    H.meanAbsAngle = +H.meanAbsAngle.toFixed(2);
    H.tolDeg = +H.tolDeg.toFixed(9);
    H.pass = H.maxErrDeg <= H.tolDeg;
    if (!H.pass) pass = false;
    if (H.maxErrDeg / (H.tolDeg || 1e-9) > worst / (1e-9)) { /* keep raw worst below */ }
    if (H.maxErrDeg > worst) { worst = H.maxErrDeg; worstHinge = H.bone; }
  }
  return { hinges: hinges, twists: twists, worstErrDeg: worst, worstHinge: worstHinge,
    pass: pass, framesChecked: nF };
}

/**
 * Zero-motion FK must reproduce the ASF rest skeleton bone for bone.
 * @param {Object} skel from `parseASF`
 */
export function verifySkeleton(skel) {
  const fk = forwardKinematics(skel, null, { degrees: true });
  let worst = 0, worstBone = '';
  for (let i = 1; i < skel.order.length; i++) {
    const name = skel.order[i];
    const b = skel.bones[name];
    if (!b || !fk.start[name]) continue;
    const got = [fk.end[name][0] - fk.start[name][0], fk.end[name][1] - fk.start[name][1], fk.end[name][2] - fk.start[name][2]];
    const err = dist(got, b.offset);
    if (err > worst) { worst = err; worstBone = name; }
  }
  const p = canonicalPoints(skel, fk);
  return {
    worstBoneErrCm: +worst.toFixed(9),
    worstBone: worstBone,
    pass: worst < 1e-9,
    restShoulderTiltCm: +Math.abs(p.lsho[1] - p.rsho[1]).toFixed(4),
    restHeightCm: +(p.head[1] - Math.min(p.lank[1], p.rank[1])).toFixed(2),
    restFacingDeg: +facingDeg(p).toFixed(2)
  };
}

/* -------------------------------------------------------------------------- */
/* HUMAN OUTPUT                                                                */
/* -------------------------------------------------------------------------- */

function pad(s, w) { s = String(s); return s + ' '.repeat(Math.max(0, w - s.length)); }
function padL(s, w) { s = String(s); return ' '.repeat(Math.max(0, w - s.length)) + s; }

/** The 15 points of one frame, as a readable block. */
export function formatFrame(take, i) {
  const f = take.frames[i];
  if (!f) return 'frame ' + i + ': out of range';
  const facing = take.meta && take.meta.facingDeg ? take.meta.facingDeg[i] : null;
  const out = ['frame ' + i + '   t=' + f.t.toFixed(4) + 's' +
    (facing === null ? '' : '   facing ' + padL(facing.toFixed(1), 7) + '°' +
      (Math.abs(facing) <= FACING_LIMIT_DEG ? ' (front)' : ' (OFF-AXIS)'))];
  out.push('  ' + pad('point', 6) + padL('x', 9) + padL('y', 9) + padL('z', 9));
  for (let c = 0; c < CANON.length; c++) {
    const k = CANON[c];
    const p = f.p[k];
    out.push('  ' + pad(k, 6) + padL(p[0].toFixed(2), 9) + padL(p[1].toFixed(2), 9) + padL(p[2].toFixed(2), 9));
  }
  return out.join('\n');
}

/** The verify report, rendered. */
export function formatReport(rep) {
  const L = [];
  L.push('TAKE  ' + rep.source + '  [' + rep.label + ']  ' + rep.frames + ' frames @ ' + rep.fps + ' fps');
  L.push('');
  L.push('RIGID SEGMENTS — length across every frame');
  L.push('  ' + pad('segment', 12) + padL('mean cm', 10) + padL('sd cm', 10) + padL('min', 9) +
    padL('max', 9) + padL('spread%', 10) + padL('ASF says', 11) + padL('err cm', 9));
  for (const k in rep.segments) {
    const s = rep.segments[k];
    L.push('  ' + pad(k + (s.rigid ? '' : ' *'), 12) + padL(s.meanCm.toFixed(3), 10) + padL(s.sdCm.toFixed(5), 10) +
      padL(s.minCm.toFixed(3), 9) + padL(s.maxCm.toFixed(3), 9) + padL(s.spreadPct.toFixed(4), 10) +
      padL(s.declaredCm === undefined ? '-' : s.declaredCm.toFixed(3), 11) +
      padL(s.declaredErrCm === undefined ? '-' : s.declaredErrCm.toFixed(4), 9));
  }
  L.push('  * multi-bone span, not rigid by construction — measured, not asserted');
  L.push('');
  if (rep.restPose) {
    L.push('REST POSE ROUNDTRIP (zero motion must rebuild the ASF skeleton)');
    L.push('  worst bone error ' + rep.restPose.worstBoneErrCm + ' cm (' + rep.restPose.worstBone + ')' +
      '   shoulder tilt ' + rep.restPose.restShoulderTiltCm + ' cm   height ' + rep.restPose.restHeightCm +
      ' cm   facing ' + rep.restPose.restFacingDeg + '°');
    L.push('');
  }
  if (rep.hinges && rep.hinges.hinges.length) {
    L.push('HINGE ANGLES vs THE RAW AMC NUMBERS (' + rep.hinges.framesChecked + ' frames)');
    for (let i = 0; i < rep.hinges.hinges.length; i++) {
      const h = rep.hinges.hinges[i];
      L.push('  ' + pad(h.bone, 10) + pad(h.canonical ? '= ' + h.canonical : '', 8) +
        'mean bend ' + padL(h.meanAbsAngle.toFixed(1), 6) + '\u00b0   worst ' +
        padL(h.maxErrDeg.toExponential(2), 10) + '\u00b0  tol ' + padL(h.tolDeg.toExponential(2), 10) +
        '\u00b0  ' + (h.pass ? 'ok' : 'OVER'));
    }
    if (rep.hinges.twists && rep.hinges.twists.length) {
      L.push('  excluded as twists (dof runs along the bone, so it carries no bend): ' +
        rep.hinges.twists.map(function (t) { return t.bone + ' ' + t.dof; }).join(', '));
    }
    L.push('');
  }
  L.push('STANDING FRAME ' + rep.standing.frame + ' (t=' + rep.standing.t.toFixed(3) + 's, facing ' + rep.standing.facingDeg + '°)');
  L.push('  shoulder tilt ' + rep.standing.shoulderTiltCm + ' cm   shoulders ' + rep.standing.shoulderAboveHipCm +
    ' cm above hips   head-to-ankle ' + rep.standing.headToAnkleCm + ' cm');
  L.push('');
  L.push('FLOOR   ground y = ' + rep.floor.groundCm + ' cm   lower ankle ' + rep.floor.minCm +
    ' \u2026 ' + rep.floor.maxCm + '   a foot is on the ground in ' + rep.floor.onGroundPct + '% of frames');
  if (rep.skate) L.push('SKATE   ' + rep.skate.contacts + ' foot contacts, ' + rep.skate.medianContactSec +
    ' s median, ' + rep.skate.medianContactDriftCm + ' cm drift each   (' + rep.skate.medianCmPerSec +
    ' cm/s median, ' + rep.skate.p95CmPerSec + ' p95, ground y=' + rep.skate.groundCm + ')');
  if (rep.facing) {
    L.push('FACING  ' + rep.facing.frontPct + '% front (±' + FACING_LIMIT_DEG + '°)   ' +
      rep.facing.backPct + '% back-to-camera   median |off| ' + rep.facing.medianAbsDeg +
      '°   worst ' + rep.facing.maxOffCameraDeg + '°');
    const fr = rep.facing.longestFrontRun;
    L.push('        longest unbroken front-on span: ' + (fr
      ? fr.frames + ' frames = ' + fr.sec + ' s   →  --range ' + fr.sourceRange[0] + ',' + fr.sourceRange[1] +
        (fr.sec >= 1.4 && fr.sec <= 2.2 ? '   (already a legal move length)' : '')
      : 'none — the subject is never square to camera'));
  }
  L.push('');
  const section = function (group, title) {
    L.push(title);
    for (let i = 0; i < rep.checks.length; i++) {
      const c = rep.checks[i];
      if (c.group !== group) continue;
      L.push('  ' + (c.pass ? 'PASS' : (c.soft ? 'NOTE' : 'FAIL')) + '  ' + pad(c.name, 42) + c.detail);
    }
    L.push('');
  };
  section('kinematics', 'KINEMATICS — is the conversion right? (any FAIL means do not use this take)');
  section('character', 'CHARACTER — is the clip worth retargeting? (a correct breakdance take FAILs here)');

  L.push(rep.pass
    ? 'CONVERSION: CORRECT   (' + rep.checks.filter(function (c) { return c.group === 'kinematics'; }).length + ' checks)'
    : 'CONVERSION: BROKEN \u2014 ' + rep.fail.length + ' kinematics check(s) failed. Do not retarget this.');
  L.push(rep.usable
    ? 'CLIP:       USABLE' + (rep.warn.length ? '   (' + rep.warn.length + ' note' + (rep.warn.length > 1 ? 's' : '') + ' \u2014 read them)' : '')
    : 'CLIP:       NOT A STANDING FRONT-ON TAKE \u2014 ' + rep.unusable.length + ':\n              ' + rep.unusable.join('\n              '));
  return L.join('\n');
}

/* -------------------------------------------------------------------------- */
/* CLI                                                                         */
/* -------------------------------------------------------------------------- */

function cli(argv) {
  const args = argv.slice(2);
  const flags = {};
  const pos = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i].slice(0, 2) === '--') {
      const eq = args[i].indexOf('=');
      if (eq > -1) flags[args[i].slice(2, eq)] = args[i].slice(eq + 1);
      else if (args[i + 1] && args[i + 1].slice(0, 2) !== '--') flags[args[i].slice(2)] = args[++i];
      else flags[args[i].slice(2)] = true;
    } else pos.push(args[i]);
  }

  if (pos.length < 2) {
    console.log([
      'asfamc.js — CMU ASF/AMC → TAKE (CONTRACT §2)',
      '',
      '  node asfamc.js <skeleton.asf> <motion.amc> [options]',
      '',
      '  --label <s>      take label, e.g. salsa',
      '  --source <s>     provenance; defaults to cmu/<amc basename>',
      '  --fps <n>        source rate, default 120',
      '  --align <a>      auto (default) | frame0 | mean | none | <degrees>',
      '  --range a,b      inclusive source frame range, 0-based',
      '  --stride <n>     keep every nth frame',
      '  --print a,b,c    print the 15 points of these emitted frames',
      '  --out <file>     write the TAKE as JSON',
      '  --quiet          skip the verify report'
    ].join('\n'));
    return 1;
  }

  const opts = {
    label: flags.label,
    source: flags.source,
    fps: flags.fps ? parseFloat(flags.fps) : undefined,
    stride: flags.stride ? parseInt(flags.stride, 10) : undefined,
    align: flags.align === undefined ? 'auto'
      : (/^-?[\d.]+$/.test(flags.align) ? parseFloat(flags.align) : flags.align),
    range: flags.range ? String(flags.range).split(',').map(Number) : undefined
  };

  const skel = parseASF(fs.readFileSync(pos[0], 'utf8'), opts);
  const amc = parseAMC(fs.readFileSync(pos[1], 'utf8'));
  const take = takeFromFiles(pos[0], pos[1], opts);
  const vopts = { skeleton: skel, amc: amc };

  if (!flags.quiet) {
    console.log(formatReport(verify(take, vopts)));
    console.log('');
    console.log('AXIS FIX  yaw ' + take.meta.axisFix.yawDeg + '° (' + take.meta.axisFix.method +
      ')  → ' + take.meta.axisFix.frontFacingFrames + ' front-facing frames' +
      (take.meta.axisFix.frontFacingFrames_ifAlignedToFrame0 !== undefined
        ? '  (aligning to frame 0 instead would give ' + take.meta.axisFix.frontFacingFrames_ifAlignedToFrame0 + ')' : ''));
    if (take.meta.warnings.length) console.log('WARNINGS  ' + take.meta.warnings.join('\n          '));
  }

  if (flags.print) {
    const idx = String(flags.print).split(',').map(function (s) { return parseInt(s, 10); });
    for (let i = 0; i < idx.length; i++) { console.log(''); console.log(formatFrame(take, idx[i])); }
  }

  if (flags.out) {
    fs.writeFileSync(flags.out, JSON.stringify(take));
    console.log('\nwrote ' + flags.out + '  (' + take.frames.length + ' frames, ' +
      (fs.statSync(flags.out).size / 1048576).toFixed(2) + ' MB)');
  }

  // 0 = converted correctly and the clip is usable
  // 1 = converted correctly, but the clip is not a standing front-on take
  // 2 = the conversion itself is wrong
  const v = verify(take, vopts);
  return v.pass ? (v.usable ? 0 : 1) : 2;
}

if (process.argv[1] && import.meta.url === 'file://' + path.resolve(process.argv[1])) {
  process.exitCode = cli(process.argv);
}
