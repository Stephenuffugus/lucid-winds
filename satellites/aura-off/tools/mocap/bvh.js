/**
 * AURA OFF — tools/mocap/bvh.js
 *
 * BVH  →  TAKE.  CONTRACT.md §2.
 *
 * This is the Mixamo path, and the path to every mocap tool that can export
 * (Blender, MotionBuilder, Rokoko, Perception Neuron, the cgspeed CMU
 * conversions). It is a front end only: it emits the same TAKE that
 * `asfamc.js` and the MediaPipe front end emit, and the retargeter never
 * learns that BVH exists.
 *
 * TOOLING. Zero runtime dependencies, never bundled into the game, never
 * writes into `src/`. Node 24, ES modules.
 *
 * ---------------------------------------------------------------------------
 * WHAT BVH ACTUALLY SAYS, AND THE THREE PLACES IT LIES TO YOU
 * ---------------------------------------------------------------------------
 *
 * A BVH file is HIERARCHY then MOTION.
 *
 *   HIERARCHY declares a joint tree. Every joint has an OFFSET (its position
 *   in its PARENT'S frame, i.e. the parent's bone vector) and a CHANNELS list
 *   naming its per-frame values IN ORDER.
 *
 *   MOTION gives `Frames:`, `Frame Time:`, and then one whitespace-separated
 *   row per frame carrying every channel of every joint in declaration order.
 *
 * Forward kinematics is then the obvious thing:
 *
 *     R_world(j) = R_world(parent) · R_local(j)
 *     p_world(j) = p_world(parent) + R_world(parent) · (offset(j) + t(j))
 *
 * with `t(j)` the position channels if the joint has any (normally only the
 * root does). Column vectors, right-handed, degrees.
 *
 * THE THREE LIES:
 *
 * 1. THE ROTATION ORDER IS NOT ZXY. It is whatever each joint's own CHANNELS
 *    line says, it is declared PER JOINT, and exporters disagree. Mixamo ships
 *    `Zrotation Xrotation Yrotation`; the cgspeed CMU conversion ships
 *    `Zrotation Yrotation Xrotation`; Blender will happily write XYZ. We read
 *    the declared order and compose in listed order —
 *    `R_local = R(c1) · R(c2) · R(c3)` — which is the universal convention and
 *    is checked two independent ways in the test notes at the bottom of this
 *    file. Assuming ZXY silently swaps two axes on a third of the corpus and
 *    the result still *looks* like a person, which is why it survives review.
 *
 * 2. JOINT NAMES ARE NOT A STANDARD. Mixamo ships `mixamorig:LeftArm`,
 *    cgspeed's CMU ships `LeftArm` but also a decoy `LHipJoint`, Blender
 *    exports `upperarm_l`, older CMU-derived BVH ships `lhumerus`, and half of
 *    the free libraries ship `L_Arm` or `Bip01 L UpperArm`. Worse: in the
 *    Mixamo rig `LeftShoulder` is the CLAVICLE and `LeftArm` is the humerus,
 *    so a matcher that trusts the word "shoulder" puts our shoulder joint six
 *    centimetres inboard on every Mixamo file in existence.
 *
 *    So naming is a HINT and the TREE is the truth. We name-match the
 *    unambiguous distal joints (elbow, wrist, knee, ankle, head, neck) and
 *    then DERIVE the ambiguous proximal ones structurally:
 *
 *        lsho = parent of lelb        (skipping twist/roll bones)
 *        lhip = parent of lkne
 *        root = lowest common ancestor of lhip and rhip
 *
 *    which is correct for Mixamo, for cgspeed CMU, for Blender and for
 *    anything else with a spine. When a required point cannot be resolved we
 *    THROW, and the message lists every joint name the file actually contains.
 *    A silent wrong guess is far worse than a refusal.
 *
 * 3. THE AXES ARE NOT THE ONES YOU WANT. BVH is Y-up by convention but the
 *    facing direction is whatever the exporter felt like, and some exporters
 *    write a left-handed (mirrored) skeleton while still labelling the joints
 *    Left and Right. We normalise into CONTRACT §2 (`+X` = subject's LEFT =
 *    screen right, `+Y` up, `+Z` toward camera, right-handed) by measuring the
 *    skeleton rather than trusting the header:
 *
 *      up      = the dominant axis of (head − root), averaged over frames
 *      left    = (lsho − rsho) with the up component removed, averaged over
 *                the reference window  →  becomes +X
 *      forward = sign · (left × up)  →  becomes +Z
 *
 *    and `sign` is CHECKED against the feet: toes point anterior, so
 *    `dot(left × up, toe − ankle)` averaged per-frame over the whole take is
 *    +1 for a right-handed file and −1 for a mirrored one. That check is the
 *    only thing standing between us and a take where every move is flipped,
 *    and it is reported in `take.meta.facing` whichever way it lands.
 *
 * ---------------------------------------------------------------------------
 * WHAT THIS FILE DELIBERATELY DOES NOT DO
 * ---------------------------------------------------------------------------
 * No angles leave here. CONTRACT §4 is explicit that the retargeter derives
 * everything from projected bone vectors and never from source Euler angles,
 * because Euler order and axis conventions differ per format and are the
 * classic way to produce a plausible-looking mirrored mess. This file's whole
 * job is to turn Euler angles into POSITIONS and then never mention them
 * again.
 */

/* -------------------------------------------------------------------------- */
/* THE FIFTEEN                                                                 */
/* -------------------------------------------------------------------------- */

/** CONTRACT §2. Fingers, toes and clavicles are noise for a 12-joint rig. */
export const CANONICAL_POINTS = Object.freeze([
  'root', 'neck', 'head',
  'lsho', 'lelb', 'lwri',
  'rsho', 'relb', 'rwri',
  'lhip', 'lkne', 'lank',
  'rhip', 'rkne', 'rank'
]);

/** Bones used for the limb-length-constancy proof and for scale normalisation. */
export const CANONICAL_BONES = Object.freeze([
  ['lsho', 'lelb'], ['lelb', 'lwri'],
  ['rsho', 'relb'], ['relb', 'rwri'],
  ['lhip', 'lkne'], ['lkne', 'lank'],
  ['rhip', 'rkne'], ['rkne', 'rank'],
  ['root', 'neck'], ['neck', 'head'],
  ['lsho', 'rsho'], ['lhip', 'rhip']
]);

/** Thrown for every refusal. Carries the evidence a human needs to fix it. */
export class BvhError extends Error {
  constructor(message, detail) {
    super(message);
    this.name = 'BvhError';
    Object.assign(this, detail || {});
  }
}

/* -------------------------------------------------------------------------- */
/* 1. PARSE                                                                    */
/* -------------------------------------------------------------------------- */

const ROT_CHANNELS = { xrotation: 0, yrotation: 1, zrotation: 2 };
const POS_CHANNELS = { xposition: 0, yposition: 1, zposition: 2 };

function isNum(v) { return typeof v === 'number' && isFinite(v); }

/**
 * Scan `count` whitespace/comma separated floats out of `s` starting at `from`.
 * Hand-rolled because `String.split(/\s+/)` on an 8 MB MOTION block allocates
 * half a million strings, and BVH files get large fast.
 */
function scanFloats(s, from, count) {
  const out = new Float64Array(count);
  const len = s.length;
  let n = 0, i = from;
  while (i < len && n < count) {
    let c = s.charCodeAt(i);
    while (i < len && (c === 32 || c === 9 || c === 10 || c === 13 || c === 44)) {
      i++; c = s.charCodeAt(i);
    }
    if (i >= len) break;
    let j = i;
    while (j < len) {
      const d = s.charCodeAt(j);
      if (d === 32 || d === 9 || d === 10 || d === 13 || d === 44) break;
      j++;
    }
    const v = +s.slice(i, j);
    if (!isFinite(v)) {
      throw new BvhError(
        'BVH MOTION contains a non-numeric token "' + s.slice(i, j) + '" at offset ' + i +
        ' (value ' + n + ' of ' + count + ').'
      );
    }
    out[n++] = v;
    i = j;
  }
  return { values: out, count: n, end: i };
}

/**
 * Parse a BVH document into a skeleton + raw motion matrix.
 *
 * @param {string} text
 * @returns {{
 *   nodes: Array, rootIndex: number, channelCount: number,
 *   frameCount: number, frameTime: number, motion: Float64Array,
 *   declaredFrames: number, warnings: string[]
 * }}
 *
 * Each node is
 *   { index, name, normName, isEndSite, offset:[x,y,z], channels:[string],
 *     rot:[{axis,slot}], pos:[{axis,slot}], chanStart, parent, children }
 * where `slot` is the index into a frame row.
 */
export function parseBVH(text) {
  if (typeof text !== 'string' || !text.length) {
    throw new BvhError('parseBVH: expected a non-empty string.');
  }

  const warnings = [];
  const lines = text.split(/\r\n|\r|\n/);
  const nodes = [];
  let li = 0;

  function peek() { return li < lines.length ? lines[li].trim() : null; }
  function next() { return li < lines.length ? lines[li++].trim() : null; }
  function skipBlank() { while (li < lines.length && lines[li].trim() === '') li++; }

  // ---- HIERARCHY ---------------------------------------------------------
  skipBlank();
  let head = peek();
  while (head !== null && head.toUpperCase() !== 'HIERARCHY') { li++; skipBlank(); head = peek(); }
  if (head === null) throw new BvhError('BVH has no HIERARCHY section.');
  li++;

  let channelCursor = 0;

  /** Read `NAME {` … `}` for a ROOT/JOINT, or an `End Site` block. */
  function readNode(kind, rawName, parentIndex) {
    const index = nodes.length;
    const node = {
      index,
      name: rawName,
      normName: normaliseJointName(rawName),
      isEndSite: kind === 'End Site',
      offset: [0, 0, 0],
      channels: [],
      rot: [],
      pos: [],
      chanStart: channelCursor,
      parent: parentIndex,
      children: []
    };
    nodes.push(node);
    if (parentIndex >= 0) nodes[parentIndex].children.push(index);

    // Opening brace: either already consumed by the caller (name line ended
    // with `{`) or on its own line.
    skipBlank();
    if (peek() === '{') li++;
    else if (peek() !== null && peek().startsWith('{')) lines[li] = lines[li].replace('{', '');
    else {
      throw new BvhError('BVH: expected "{" after ' + kind + ' ' + rawName + ' (line ' + (li + 1) + ').');
    }

    for (;;) {
      skipBlank();
      let line = next();
      if (line === null) throw new BvhError('BVH: unexpected end of file inside ' + kind + ' ' + rawName + '.');
      if (line === '') continue;

      if (line === '}' || line.startsWith('}')) return index;

      const upper = line.toUpperCase();

      if (upper.startsWith('OFFSET')) {
        const parts = line.slice(6).trim().split(/[\s,]+/).filter(Boolean).map(Number);
        if (parts.length < 3 || !parts.slice(0, 3).every(isNum)) {
          throw new BvhError('BVH: malformed OFFSET on line ' + li + ': "' + line + '"');
        }
        node.offset = [parts[0], parts[1], parts[2]];
        continue;
      }

      if (upper.startsWith('CHANNELS')) {
        const parts = line.slice(8).trim().split(/[\s,]+/).filter(Boolean);
        const n = parseInt(parts[0], 10);
        if (!(n >= 0)) throw new BvhError('BVH: malformed CHANNELS on line ' + li + ': "' + line + '"');
        const names = parts.slice(1, 1 + n);
        if (names.length !== n) {
          throw new BvhError('BVH: CHANNELS declares ' + n + ' but lists ' + names.length + ' on line ' + li + '.');
        }
        node.channels = names;
        for (let k = 0; k < names.length; k++) {
          const key = names[k].toLowerCase();
          const slot = channelCursor + k;
          if (key in ROT_CHANNELS) node.rot.push({ axis: ROT_CHANNELS[key], slot });
          else if (key in POS_CHANNELS) node.pos.push({ axis: POS_CHANNELS[key], slot });
          else warnings.push('unknown channel "' + names[k] + '" on joint ' + rawName + ' — ignored');
        }
        channelCursor += n;
        continue;
      }

      if (upper.startsWith('JOINT')) {
        let nm = line.slice(5).trim();
        if (nm.endsWith('{')) { nm = nm.slice(0, -1).trim(); lines.splice(li, 0, '{'); }
        readNode('JOINT', nm || ('joint' + nodes.length), index);
        continue;
      }

      if (upper.startsWith('END SITE') || upper.startsWith('END_SITE') || upper === 'ENDSITE') {
        if (line.trim().endsWith('{')) lines.splice(li, 0, '{');
        readNode('End Site', rawName + '_EndSite', index);
        continue;
      }

      warnings.push('BVH HIERARCHY: ignoring unrecognised line ' + li + ' "' + line + '"');
    }
  }

  skipBlank();
  let rootLine = next();
  while (rootLine !== null && !/^ROOT\b/i.test(rootLine)) { skipBlank(); rootLine = next(); }
  if (rootLine === null) throw new BvhError('BVH HIERARCHY has no ROOT.');
  let rootName = rootLine.replace(/^ROOT\s*/i, '').trim();
  if (rootName.endsWith('{')) { rootName = rootName.slice(0, -1).trim(); lines.splice(li, 0, '{'); }
  const rootIndex = readNode('ROOT', rootName || 'Hips', -1);

  // Some files declare more than one ROOT (a prop, a second actor). We take
  // the first and say so, rather than silently mixing two skeletons.
  skipBlank();
  while (li < lines.length && /^ROOT\b/i.test(lines[li].trim())) {
    warnings.push('BVH declares a second ROOT ("' + lines[li].trim() + '") — only the first skeleton is converted');
    let depth = 0, seen = false;
    while (li < lines.length) {
      const t = lines[li].trim(); li++;
      if (t.indexOf('{') >= 0) { depth++; seen = true; }
      if (t.indexOf('}') >= 0) depth--;
      if (seen && depth <= 0) break;
    }
    skipBlank();
  }

  // ---- MOTION ------------------------------------------------------------
  skipBlank();
  let m = next();
  while (m !== null && m.toUpperCase() !== 'MOTION') { skipBlank(); m = next(); }
  if (m === null) throw new BvhError('BVH has no MOTION section.');

  let declaredFrames = -1, frameTime = -1;
  for (let guard = 0; guard < 8; guard++) {
    skipBlank();
    const line = peek();
    if (line === null) break;
    if (/^frames\b/i.test(line)) {
      declaredFrames = parseInt(line.replace(/^frames\s*:?\s*/i, '').trim(), 10);
      li++;
      continue;
    }
    if (/^frame\s*time\b/i.test(line)) {
      frameTime = parseFloat(line.replace(/^frame\s*time\s*:?\s*/i, '').trim());
      li++;
      continue;
    }
    break;
  }
  if (!(declaredFrames >= 0)) throw new BvhError('BVH MOTION has no usable "Frames:" line.');
  if (!(frameTime > 0)) throw new BvhError('BVH MOTION has no usable "Frame Time:" line.');

  // Everything left is numbers. Rows may be wrapped, so we do not care about
  // line boundaries at all — we just take channelCount values per frame.
  // (Scanning the rejoined tail rather than a byte offset into `text`: the
  //  HIERARCHY walk rewrites a line when a `{` shares it with a JOINT, so
  //  offsets into the original string are not trustworthy by this point.)
  const motionText = lines.slice(li).join('\n');
  const want = declaredFrames * channelCursor;
  const scanned = scanFloats(motionText, 0, want);
  let frameCount = declaredFrames;
  if (scanned.count < want) {
    frameCount = Math.floor(scanned.count / Math.max(1, channelCursor));
    warnings.push(
      'BVH MOTION is short: header declares ' + declaredFrames + ' frames × ' + channelCursor +
      ' channels = ' + want + ' values, found ' + scanned.count + '. Using ' + frameCount + ' complete frames.'
    );
  }
  if (frameCount < 1) throw new BvhError('BVH MOTION has no complete frames.');

  /*
   * SPLICED REST FRAME. Several converters staple a canonical rest pose onto
   * the front of the clip — cgspeed's CMU BVH release does, which is exactly
   * why every one of its files has one more frame than the matching AMC. It is
   * not part of the performance. Left unflagged it poisons anything that starts
   * at t=0: the facing measurement, and much worse a keyframe reduction, which
   * would open every converted move on a T-pose.
   *
   * Do not look for all-zero rotations — cgspeed's rest pose is NOT zeros, it
   * is a fixed ±21° leg splay with a tilted neck, and a magic-value test would
   * miss it and every other converter's. Measure instead: sum the absolute
   * per-channel rotation change between consecutive frames, and flag frame 0
   * when its jump is both the largest in the take and far outside the rest of
   * the distribution. On the four CMU takes checked this fires at 31–51× the
   * median and 4–20× the 99th percentile, with nothing else close; a genuine
   * 1600°-of-total-joint-rotation move inside one 120 fps tick is not a thing a
   * body does.
   *
   * It is a WARNING, never a deletion. A parser that silently drops a frame the
   * file declares is a parser you cannot trust about anything else.
   */
  if (frameCount >= 8 && channelCursor > 0) {
    const slots = [];
    for (const n of nodes) for (const r of n.rot) slots.push(r.slot);
    if (slots.length) {
      const jump = new Float64Array(frameCount - 1);
      for (let f = 1; f < frameCount; f++) {
        let d = 0;
        const b0 = (f - 1) * channelCursor, b1 = f * channelCursor;
        for (let i = 0; i < slots.length; i++) {
          let a = scanned.values[b1 + slots[i]] - scanned.values[b0 + slots[i]];
          while (a > 180) a -= 360;
          while (a < -180) a += 360;
          d += a < 0 ? -a : a;
        }
        jump[f - 1] = d;
      }
      const rest = Array.from(jump.slice(1)).sort((a, b) => a - b);
      const med = rest[rest.length >> 1];
      const p99 = rest[Math.floor(rest.length * 0.99)];
      const j0 = jump[0];
      /*
       * Thresholds are deliberately loose, because the two errors cost wildly
       * different amounts. A false positive costs one 120 fps frame — 8 ms
       * nobody will miss. A false negative opens every converted move on a
       * T-pose. Measured j0/median and j0/p99: salsa 36×/4.3, modern 31×/9.1,
       * breakdance 36×/4.0, indian 51×/19.6, pirouette 20×/2.1 — the pirouette
       * is the tight one because a real spin puts genuine 500° jumps in its
       * own p99, which is exactly why "largest jump in the take" carries most
       * of the weight here and the ratios only have to rule out noise.
       */
      if (j0 >= rest[rest.length - 1] && j0 > 8 * med && j0 > 1.8 * p99) {
        warnings.push(
          'frame 0 looks SPLICED: the frame 0→1 change is ' + Math.round(j0) + '° of total joint ' +
          'rotation — the largest jump in the take, ' + (j0 / med).toFixed(0) + '× the median and ' +
          (j0 / p99).toFixed(1) + '× the 99th percentile. Converters staple a canonical rest pose ' +
          'onto the front (cgspeed\'s CMU BVH release does, hence one more frame than the matching ' +
          'AMC; the three.js Poser sample does too). The frame is KEPT, but trim it before reducing ' +
          'to keyframes or the move will open on a T-pose: bvhToTake(text, { range: [1, null] }).'
        );
      }
    }
  }

  return {
    nodes, rootIndex,
    channelCount: channelCursor,
    frameCount, declaredFrames, frameTime,
    motion: scanned.values,
    warnings
  };
}

/* -------------------------------------------------------------------------- */
/* 2. FORWARD KINEMATICS                                                       */
/* -------------------------------------------------------------------------- */

/* 3×3 row-major. v' = M·v with v a column vector. */
function mul3(a, b, out) {
  const a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5], a6 = a[6], a7 = a[7], a8 = a[8];
  const b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4], b5 = b[5], b6 = b[6], b7 = b[7], b8 = b[8];
  out[0] = a0 * b0 + a1 * b3 + a2 * b6;
  out[1] = a0 * b1 + a1 * b4 + a2 * b7;
  out[2] = a0 * b2 + a1 * b5 + a2 * b8;
  out[3] = a3 * b0 + a4 * b3 + a5 * b6;
  out[4] = a3 * b1 + a4 * b4 + a5 * b7;
  out[5] = a3 * b2 + a4 * b5 + a5 * b8;
  out[6] = a6 * b0 + a7 * b3 + a8 * b6;
  out[7] = a6 * b1 + a7 * b4 + a8 * b7;
  out[8] = a6 * b2 + a7 * b5 + a8 * b8;
  return out;
}

const DEG = Math.PI / 180;

/** Axis rotation, right-handed, degrees. axis 0=X 1=Y 2=Z. */
function axisRot(axis, deg, out) {
  const a = deg * DEG, c = Math.cos(a), s = Math.sin(a);
  if (axis === 0) {
    out[0] = 1; out[1] = 0; out[2] = 0;
    out[3] = 0; out[4] = c; out[5] = -s;
    out[6] = 0; out[7] = s; out[8] = c;
  } else if (axis === 1) {
    out[0] = c; out[1] = 0; out[2] = s;
    out[3] = 0; out[4] = 1; out[5] = 0;
    out[6] = -s; out[7] = 0; out[8] = c;
  } else {
    out[0] = c; out[1] = -s; out[2] = 0;
    out[3] = s; out[4] = c; out[5] = 0;
    out[6] = 0; out[7] = 0; out[8] = 1;
  }
  return out;
}

/**
 * World positions of every node for one frame.
 *
 * `R_local` is composed in the joint's own DECLARED channel order —
 * `R(c1)·R(c2)·R(c3)` — which is the whole point of reading CHANNELS instead
 * of assuming ZXY.
 *
 * @param {Object} skel  from parseBVH
 * @param {number} frame
 * @param {Float64Array} [out]  3·nodes
 * @returns {Float64Array}
 */
export function fkFrame(skel, frame, out) {
  const nodes = skel.nodes, N = nodes.length;
  const P = out && out.length >= N * 3 ? out : new Float64Array(N * 3);
  const R = new Float64Array(N * 9);
  const motion = skel.motion, base = frame * skel.channelCount;

  const loc = new Float64Array(9);
  const tmp = new Float64Array(9);
  const one = new Float64Array(9);

  for (let i = 0; i < N; i++) {
    const n = nodes[i];

    // local rotation, in declared order
    loc[0] = 1; loc[1] = 0; loc[2] = 0;
    loc[3] = 0; loc[4] = 1; loc[5] = 0;
    loc[6] = 0; loc[7] = 0; loc[8] = 1;
    for (let k = 0; k < n.rot.length; k++) {
      axisRot(n.rot[k].axis, motion[base + n.rot[k].slot], one);
      mul3(loc, one, tmp);
      loc.set(tmp);
    }

    // local translation = OFFSET + position channels (root, usually)
    let tx = n.offset[0], ty = n.offset[1], tz = n.offset[2];
    for (let k = 0; k < n.pos.length; k++) {
      const v = motion[base + n.pos[k].slot];
      if (n.pos[k].axis === 0) tx += v; else if (n.pos[k].axis === 1) ty += v; else tz += v;
    }

    const p = n.parent;
    if (p < 0) {
      P[0] = tx; P[1] = ty; P[2] = tz;
      R.set(loc, 0);
    } else {
      const ro = p * 9;
      P[i * 3 + 0] = P[p * 3 + 0] + R[ro + 0] * tx + R[ro + 1] * ty + R[ro + 2] * tz;
      P[i * 3 + 1] = P[p * 3 + 1] + R[ro + 3] * tx + R[ro + 4] * ty + R[ro + 5] * tz;
      P[i * 3 + 2] = P[p * 3 + 2] + R[ro + 6] * tx + R[ro + 7] * ty + R[ro + 8] * tz;
      mul3(R.subarray(ro, ro + 9), loc, tmp);
      R.set(tmp, i * 9);
    }
  }
  return P;
}

/* -------------------------------------------------------------------------- */
/* 3. NAME MATCHING — a hint, never the truth                                  */
/* -------------------------------------------------------------------------- */

const VENDOR_PREFIXES = [
  'mixamorig', 'mixamo', 'bip001', 'bip01', 'bip1', 'biped', 'bip',
  'character1', 'character', 'avatar', 'skeleton', 'armature', 'vicon',
  'cmu', 'joint', 'bone', 'def', 'org', 'ctrl'
];

/**
 * `mixamorig:LeftForeArm` → `leftforearm`. `Bip01 L UpperArm` → `lupperarm`.
 * `upperarm_l` → `upperarml`. Exported because the CLI prints it when a
 * mapping fails and a human has to read the two lists side by side.
 */
export function normaliseJointName(raw) {
  let s = String(raw == null ? '' : raw);
  const c = s.lastIndexOf(':');
  if (c >= 0) s = s.slice(c + 1);
  s = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  for (let i = 0; i < VENDOR_PREFIXES.length; i++) {
    const p = VENDOR_PREFIXES[i];
    if (s.length > p.length && s.startsWith(p)) { s = s.slice(p.length); break; }
  }
  return s;
}

const SIDE_TOKENS = { l: ['left', 'l', 'lft'], r: ['right', 'r', 'rgt'] };

/** stem 'forearm', side 'l' → leftforearm, forearmleft, lforearm, forearml, … */
function sideVariants(side, stem) {
  const out = [];
  const toks = SIDE_TOKENS[side];
  for (let i = 0; i < toks.length; i++) { out.push(toks[i] + stem); out.push(stem + toks[i]); }
  return out;
}

/*
 * Stems in PRIORITY order. The proximal entries (`shoulderish`, `hipish`) are
 * only ever used as a cross-check against the structural derivation, because
 * `LeftShoulder` is the clavicle in the single most common rig on earth.
 */
const STEMS = {
  elbow:      ['forearm', 'lowerarm', 'armlower', 'radius', 'ulna', 'elbow', 'forearm1'],
  wrist:      ['hand', 'wrist', 'palm', 'hand1'],
  shoulderish:['arm', 'upperarm', 'armupper', 'uparm', 'humerus', 'shoulder', 'clavicle', 'collar'],
  knee:       ['leg', 'lowerleg', 'leglower', 'tibia', 'shin', 'calf', 'knee', 'leg1'],
  ankle:      ['foot', 'ankle', 'foot1'],
  hipish:     ['upleg', 'upperleg', 'legupper', 'thigh', 'femur', 'hip'],
  toe:        ['toebase', 'toe', 'toes', 'ball', 'foot1']
};

/** Unsided stems. */
const SOLO = {
  root: ['hips', 'hip', 'pelvis', 'root', 'hipsjoint', 'spinebase', 'basespine', 'torso'],
  neck: ['neck', 'neck1', 'neck01', 'lowerneck', 'neckbase', 'upperneck', 'neck2'],
  head: ['head', 'head1', 'skull']
};

const TWISTY = /twist|roll|helper|adjust|scale|corrective|ik|pole|target/;

function buildIndex(nodes) {
  const byNorm = new Map();
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    if (n.isEndSite) continue;
    if (TWISTY.test(n.normName)) continue;
    if (!byNorm.has(n.normName)) byNorm.set(n.normName, []);
    byNorm.get(n.normName).push(i);
  }
  return byNorm;
}

function matchOne(byNorm, variants, tried) {
  for (let i = 0; i < variants.length; i++) {
    tried.push(variants[i]);
    const hit = byNorm.get(variants[i]);
    if (hit && hit.length) return hit[0];
  }
  return -1;
}

function matchSided(byNorm, side, stems, tried) {
  for (let s = 0; s < stems.length; s++) {
    const idx = matchOne(byNorm, sideVariants(side, stems[s]), tried);
    if (idx >= 0) return idx;
  }
  return -1;
}

function parentSkippingTwist(nodes, index) {
  let p = index >= 0 ? nodes[index].parent : -1;
  while (p >= 0 && TWISTY.test(nodes[p].normName)) p = nodes[p].parent;
  return p;
}

function ancestorsOf(nodes, index) {
  const out = [];
  let i = index;
  while (i >= 0) { out.push(i); i = nodes[i].parent; }
  return out;
}

function lca(nodes, a, b) {
  if (a < 0 || b < 0) return -1;
  const seen = new Set(ancestorsOf(nodes, a));
  let i = b;
  while (i >= 0) { if (seen.has(i)) return i; i = nodes[i].parent; }
  return -1;
}

function isDescendant(nodes, maybeChild, maybeAncestor) {
  let i = maybeChild;
  while (i >= 0) { if (i === maybeAncestor) return true; i = nodes[i].parent; }
  return false;
}

/*
 * `head` IS THE HEAD JOINT'S OWN ORIGIN — the base of the skull, where the
 * head bone STARTS. Not the crown.
 *
 * This was the crown (the deepest End Site of the head chain) on the first
 * pass, on the reasoning that ASF joint positions are bone ENDpoints so the
 * ASF `head` is the top of the skull. Two things killed it:
 *
 *  1. It is not always available. A rig with `Head → LeftEye, RightEye` and no
 *     End Site — the Poser/DAZ rig in three.js's pirouette.bvh is exactly this
 *     — has no unambiguous crown, so the code fell back to the joint origin.
 *     That made `head` mean the crown on CMU files and the skull base on Poser
 *     files, which is worse than either, because the retargeter would get a
 *     `neck → head` vector whose meaning depended on the exporter.
 *  2. `asfamc.js` states the rule for the whole bridge: a canonical joint
 *     position is where a bone STARTS. Its `head` is the start of the ASF
 *     `head` bone. Matching it keeps the two front ends interchangeable, which
 *     is the entire point of having one TAKE format.
 *
 * The vector `neck → head` stays perfectly usable: two spine segments on the
 * cgspeed CMU rig, one real neck bone on Mixamo.
 */

/**
 * Resolve the fifteen canonical points against a parsed skeleton.
 *
 * Throws BvhError naming every joint in the file when a required point cannot
 * be resolved.
 *
 * @param {Object} skel
 * @param {Object} [opts]
 * @param {Object} [opts.map]  explicit override, e.g. `{ lelb: 'mixamorig:LeftForeArm' }`.
 *                             An override is a human decision and is trusted.
 * @returns {{spec: Object, source: Object, toes: Object, warnings: string[]}}
 */
export function resolvePoints(skel, opts) {
  const o = opts || {};
  const nodes = skel.nodes;
  const byNorm = buildIndex(nodes);
  const warnings = [];
  const tried = {};
  const source = {};

  const explicit = {};
  if (o.map) {
    for (const key of Object.keys(o.map)) {
      const want = String(o.map[key]);
      let idx = nodes.findIndex(n => n.name === want);
      if (idx < 0) idx = nodes.findIndex(n => n.normName === normaliseJointName(want));
      if (idx < 0) {
        throw new BvhError('opts.map.' + key + ' = "' + want + '" is not a joint in this file.', {
          jointNames: nodes.filter(n => !n.isEndSite).map(n => n.name)
        });
      }
      explicit[key] = idx;
    }
  }

  function grabSided(key, side, stemKey) {
    if (key in explicit) { source[key] = 'explicit'; return explicit[key]; }
    tried[key] = [];
    const idx = matchSided(byNorm, side, STEMS[stemKey], tried[key]);
    if (idx >= 0) source[key] = 'name:' + nodes[idx].name;
    return idx;
  }
  function grabSolo(key, listKey) {
    if (key in explicit) { source[key] = 'explicit'; return explicit[key]; }
    tried[key] = [];
    const idx = matchOne(byNorm, SOLO[listKey], tried[key]);
    if (idx >= 0) source[key] = 'name:' + nodes[idx].name;
    return idx;
  }

  // --- distal joints: names here are boring and reliable -------------------
  const lelb = grabSided('lelb', 'l', 'elbow');
  const relb = grabSided('relb', 'r', 'elbow');
  const lwri = grabSided('lwri', 'l', 'wrist');
  const rwri = grabSided('rwri', 'r', 'wrist');
  const lkne = grabSided('lkne', 'l', 'knee');
  const rkne = grabSided('rkne', 'r', 'knee');
  const lank = grabSided('lank', 'l', 'ankle');
  const rank = grabSided('rank', 'r', 'ankle');
  const headJ = grabSolo('head', 'head');

  const missing = [];
  const req = { lelb, relb, lwri, rwri, lkne, rkne, lank, rank, head: headJ };
  for (const k of Object.keys(req)) if (req[k] < 0) missing.push(k);
  if (missing.length) {
    const names = nodes.filter(n => !n.isEndSite).map(n => n.name);
    throw new BvhError(
      'BVH joint mapping failed. Could not resolve: ' + missing.join(', ') + '.\n' +
      'The file contains these ' + names.length + ' joints:\n  ' + names.join('\n  ') + '\n' +
      'Tried, per unresolved point:\n' +
      missing.map(k => '  ' + k + ': ' + (tried[k] || []).join(', ')).join('\n') + '\n' +
      'Fix by passing an explicit map, e.g. bvhToTake(text, { map: { lelb: "<joint name>" } }).',
      { missing, jointNames: names, tried }
    );
  }

  // --- proximal joints: DERIVED from the tree, names only cross-check ------
  function proximal(key, distal, side, stemKey, label) {
    if (key in explicit) { source[key] = 'explicit'; return explicit[key]; }
    const structural = parentSkippingTwist(nodes, distal);
    tried[key] = [];
    const named = matchSided(byNorm, side, STEMS[stemKey], tried[key]);
    if (structural < 0) {
      if (named < 0) {
        throw new BvhError(
          'BVH: ' + key + ' has no parent and no name match — ' + label + ' is unresolvable.',
          { jointNames: nodes.filter(n => !n.isEndSite).map(n => n.name) }
        );
      }
      source[key] = 'name:' + nodes[named].name;
      return named;
    }
    source[key] = 'parent-of-' + (key[0] === 'l' ? 'l' : 'r') + (stemKey === 'shoulderish' ? 'elb' : 'kne') +
      ':' + nodes[structural].name;
    if (named >= 0 && named !== structural) {
      warnings.push(
        key + ': tree says ' + nodes[structural].name + ' (parent of ' + nodes[distal].name +
        '), name matching says ' + nodes[named].name + '. USING THE TREE. The joint a rig calls ' +
        '"Shoulder", "Collar", "Clavicle" or "HipJoint" is usually the connector INBOARD of the ' +
        'real joint (Mixamo LeftShoulder, Poser lCollar, cgspeed LHipJoint are all this), and the ' +
        'parent of the elbow/knee is the joint we actually want.'
      );
    }
    return structural;
  }

  const lsho = proximal('lsho', lelb, 'l', 'shoulderish', 'left shoulder');
  const rsho = proximal('rsho', relb, 'r', 'shoulderish', 'right shoulder');
  const lhip = proximal('lhip', lkne, 'l', 'hipish', 'left hip');
  const rhip = proximal('rhip', rkne, 'r', 'hipish', 'right hip');

  // --- root: the pelvis is exactly the fork between the two legs -----------
  let root;
  if ('root' in explicit) { root = explicit.root; source.root = 'explicit'; }
  else {
    const forked = lca(nodes, lhip, rhip);
    const named = grabSolo('root', 'root');
    if (forked >= 0) {
      root = forked;
      source.root = 'lca(lhip,rhip):' + nodes[root].name;
      if (named >= 0 && named !== forked) {
        warnings.push('root: leg fork is ' + nodes[forked].name + ', name matching says ' + nodes[named].name +
          '. Using the leg fork.');
      }
    } else if (named >= 0) {
      root = named;
    } else {
      root = skel.rootIndex;
      source.root = 'hierarchy-root:' + nodes[root].name;
      warnings.push('root fell back to the BVH ROOT node "' + nodes[root].name + '".');
    }
  }

  // --- neck: named, else the shoulder midpoint ----------------------------
  let neckSpec;
  const neckIdx = grabSolo('neck', 'neck');
  if (neckIdx >= 0) neckSpec = { kind: 'node', index: neckIdx };
  else {
    neckSpec = { kind: 'midpoint', a: lsho, b: rsho };
    source.neck = 'midpoint(lsho,rsho)';
    warnings.push('no neck joint found; neck is the shoulder midpoint. Joints present: ' +
      nodes.filter(n => !n.isEndSite).map(n => n.name).join(', '));
  }

  // --- head: the head joint's own origin. See the note above headTip's grave.
  const headIndex = headJ;
  source.head = 'name:' + nodes[headIndex].name;

  // --- sanity: the chains have to actually be chains ----------------------
  const chainChecks = [
    ['lwri', lwri, 'lelb', lelb], ['rwri', rwri, 'relb', relb],
    ['lelb', lelb, 'lsho', lsho], ['relb', relb, 'rsho', rsho],
    ['lank', lank, 'lkne', lkne], ['rank', rank, 'rkne', rkne],
    ['lkne', lkne, 'lhip', lhip], ['rkne', rkne, 'rhip', rhip]
  ];
  for (const [cn, ci, pn, pi] of chainChecks) {
    if (!isDescendant(nodes, ci, pi)) {
      warnings.push('chain check: ' + nodes[ci].name + ' (' + cn + ') is not below ' +
        nodes[pi].name + ' (' + pn + ') in the tree. The mapping is probably wrong.');
    }
  }

  // --- toes, for the handedness check -------------------------------------
  const ltoeTried = [], rtoeTried = [];
  let ltoe = matchSided(byNorm, 'l', STEMS.toe, ltoeTried);
  let rtoe = matchSided(byNorm, 'r', STEMS.toe, rtoeTried);
  if (ltoe < 0 && nodes[lank].children.length) ltoe = nodes[lank].children[0];
  if (rtoe < 0 && nodes[rank].children.length) rtoe = nodes[rank].children[0];

  const spec = {
    root:  { kind: 'node', index: root },
    neck:  neckSpec,
    head:  { kind: 'node', index: headIndex },
    lsho:  { kind: 'node', index: lsho },
    lelb:  { kind: 'node', index: lelb },
    lwri:  { kind: 'node', index: lwri },
    rsho:  { kind: 'node', index: rsho },
    relb:  { kind: 'node', index: relb },
    rwri:  { kind: 'node', index: rwri },
    lhip:  { kind: 'node', index: lhip },
    lkne:  { kind: 'node', index: lkne },
    lank:  { kind: 'node', index: lank },
    rhip:  { kind: 'node', index: rhip },
    rkne:  { kind: 'node', index: rkne },
    rank:  { kind: 'node', index: rank }
  };

  return { spec, source, toes: { l: ltoe, r: rtoe }, warnings };
}

/* -------------------------------------------------------------------------- */
/* 4. AXIS NORMALISATION                                                       */
/* -------------------------------------------------------------------------- */

function readPoint(spec, P, out) {
  if (spec.kind === 'node') {
    const i = spec.index * 3;
    out[0] = P[i]; out[1] = P[i + 1]; out[2] = P[i + 2];
  } else {
    const a = spec.a * 3, b = spec.b * 3;
    out[0] = (P[a] + P[b]) * 0.5;
    out[1] = (P[a + 1] + P[b + 1]) * 0.5;
    out[2] = (P[a + 2] + P[b + 2]) * 0.5;
  }
  return out;
}

function sub3(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function dot3(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
function cross3(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}
function len3(a) { return Math.sqrt(dot3(a, a)); }
function unit3(a) { const L = len3(a); return L > 1e-12 ? [a[0] / L, a[1] / L, a[2] / L] : [0, 0, 0]; }
function perpUp(v, up) { const d = dot3(v, up); return [v[0] - up[0] * d, v[1] - up[1] * d, v[2] - up[2] * d]; }

function sampleIndices(frameCount, want) {
  const n = Math.min(want, frameCount);
  const out = [];
  for (let i = 0; i < n; i++) out.push(Math.floor(i * (frameCount - 1) / Math.max(1, n - 1)));
  return out;
}

/**
 * Measure the world frame from the skeleton itself and return the rotation
 * that carries it into CONTRACT §2 (+X subject-left, +Y up, +Z toward camera).
 *
 * Returned `basis` is three world-space unit rows; a world vector `v` becomes
 * `[dot(v,left), dot(v,up), dot(v,fwd)]`.
 */
export function measureFrame(skel, spec, toes, opts) {
  const o = opts || {};
  const N = skel.nodes.length;
  const P = new Float64Array(N * 3);
  const warnings = [];

  const probe = sampleIndices(skel.frameCount, o.probeFrames || 240);
  const root = [0, 0, 0], head = [0, 0, 0], ls = [0, 0, 0], rs = [0, 0, 0];

  // --- up axis: the dominant direction of root → head ----------------------
  let ux = 0, uy = 0, uz = 0;
  for (const f of probe) {
    fkFrame(skel, f, P);
    readPoint(spec.root, P, root); readPoint(spec.head, P, head);
    ux += head[0] - root[0]; uy += head[1] - root[1]; uz += head[2] - root[2];
  }
  const axisMag = [Math.abs(ux), Math.abs(uy), Math.abs(uz)];
  let ai = 0;
  if (axisMag[1] > axisMag[ai]) ai = 1;
  if (axisMag[2] > axisMag[ai]) ai = 2;
  const sgn = [ux, uy, uz][ai] >= 0 ? 1 : -1;
  const up = [0, 0, 0]; up[ai] = sgn;
  if (!(ai === 1 && sgn === 1)) {
    warnings.push('up axis is ' + (sgn > 0 ? '+' : '-') + 'XYZ'[ai] +
      ', not the BVH-conventional +Y. Normalising anyway, but check the source.');
  }

  // --- left: the shoulder line over the reference window -------------------
  const refStart = Math.max(0, Math.min(skel.frameCount - 1, o.refFrame != null ? (o.refFrame | 0) : 0));
  const refCount = Math.max(1, Math.min(skel.frameCount - refStart,
    o.refFrames != null ? (o.refFrames | 0) : Math.max(1, Math.round(0.5 / skel.frameTime))));
  //
  // TRIMMED mean, not a plain one. cgspeed's CMU conversions prepend a
  // synthetic all-zero-rotation frame, so frame 0 of those files is a rest
  // pose standing at a completely different yaw from frame 1 — it sat 91° off
  // the rest of the reference window on the salsa take. One outlier in a
  // 60-frame window barely moves a mean, but the same outlier in a
  // caller-supplied 5-frame window would rotate the entire take. So: mean,
  // then drop anything more than 60° from it, then mean again.
  const dirs = [];
  for (let f = refStart; f < refStart + refCount; f++) {
    fkFrame(skel, f, P);
    readPoint(spec.lsho, P, ls); readPoint(spec.rsho, P, rs);
    const v = unit3(perpUp(sub3(ls, rs), up));
    if (len3(v) > 0.5) dirs.push(v);
  }
  let lx = 0, ly = 0, lz = 0;
  for (const v of dirs) { lx += v[0]; ly += v[1]; lz += v[2]; }
  if (dirs.length > 4) {
    const m = unit3([lx, ly, lz]);
    let kx = 0, ky = 0, kz = 0, kept = 0;
    for (const v of dirs) {
      if (dot3(v, m) < 0.5) continue;            // more than 60° out
      kx += v[0]; ky += v[1]; kz += v[2]; kept++;
    }
    if (kept >= Math.max(3, dirs.length * 0.5)) {
      if (kept < dirs.length) {
        warnings.push('reference window: dropped ' + (dirs.length - kept) + ' of ' + dirs.length +
          ' frames whose shoulder line sat more than 60° off the window mean (a rest/T-pose frame ' +
          'spliced onto the front of the file will do this). Facing measured from the other ' + kept + '.');
      }
      lx = kx; ly = ky; lz = kz;
    }
  }
  let left = unit3([lx, ly, lz]);
  if (len3(left) < 0.5) {
    warnings.push('the shoulder line is unstable across the reference window — the subject may be turning ' +
      'through it. Pass opts.refFrame / opts.refFrames to pick a front-facing window.');
    if (len3(left) < 1e-9) left = [1, 0, 0];
  }

  // --- facing sign: toes point anterior ------------------------------------
  let sign = o.facingSign === -1 ? -1 : o.facingSign === 1 ? 1 : 0;
  const forced = sign !== 0;
  let meanDot = NaN, cues = 0;
  if (toes && (toes.l >= 0 || toes.r >= 0)) {
    let acc = 0;
    const ank = [0, 0, 0], toe = [0, 0, 0];
    for (const f of probe) {
      fkFrame(skel, f, P);
      readPoint(spec.lsho, P, ls); readPoint(spec.rsho, P, rs);
      const li = unit3(perpUp(sub3(ls, rs), up));
      if (len3(li) < 0.5) continue;
      const fwd = unit3(cross3(li, up));
      for (const side of ['l', 'r']) {
        const ti = toes[side], ak = side === 'l' ? spec.lank.index : spec.rank.index;
        if (!(ti >= 0) || !(ak >= 0)) continue;
        readPoint({ kind: 'node', index: ak }, P, ank);
        readPoint({ kind: 'node', index: ti }, P, toe);
        const raw = sub3(toe, ank);
        const flat = perpUp(raw, up);
        if (len3(flat) < 0.35 * len3(raw)) continue;   // foot is mostly vertical: no cue
        acc += dot3(unit3(flat), fwd);
        cues++;
      }
    }
    if (cues > 0) meanDot = acc / cues;
  }

  let facingSource;
  if (forced) {
    facingSource = 'opts.facingSign';
  } else if (cues > 0 && meanDot <= -0.15) {
    sign = -1;
    facingSource = 'feet (mirrored file)';
    warnings.push(
      'MIRRORED SOURCE. The toes point OPPOSITE to (left × up) over ' + cues + ' samples ' +
      '(mean dot ' + meanDot.toFixed(3) + '), which means this file stores a left-handed / mirrored ' +
      'skeleton while still labelling the joints Left and Right. Flipping +Z so the subject faces the ' +
      'camera with their labelled left at +X. Pass opts.facingSign to override.'
    );
  } else if (cues > 0 && meanDot >= 0.15) {
    sign = 1;
    facingSource = 'feet (right-handed, agrees with shoulders)';
  } else {
    sign = 1;
    facingSource = cues > 0 ? 'shoulders (feet inconclusive)' : 'shoulders (no toe joints)';
    warnings.push(
      'facing could not be confirmed from the feet (' + (cues > 0
        ? 'mean dot ' + meanDot.toFixed(3) + ', too close to zero'
        : 'no toe or foot-tip joints') + '). Assuming a right-handed file. ' +
      'If the converted move comes out mirrored, re-run with opts.facingSign = -1.'
    );
  }

  /*
   * `left` already came out unit and perpendicular to `up`, so the basis is
   * orthonormal as it stands. Do NOT "tidy" it by recomputing left from fwd:
   * that quietly turns the mirror correction into the wrong correction.
   *
   * sign = +1  → {left, up, left×up} is a rotation. Nothing is reflected.
   * sign = -1  → {left, up, -(left×up)} is a REFLECTION, determinant -1, and
   *              that is exactly right. A mirrored export is a scene reflected
   *              in one axis; un-mirroring it means reflecting it back. Doing
   *              it this way keeps BOTH invariants at once — the joint the file
   *              calls Left lands at +X, and the toes land at +Z — which a pure
   *              rotation cannot do for a mirrored file, because for a real
   *              body those two facts imply each other and here they don't.
   */
  const fwd0 = cross3(left, up);
  const fwd = unit3([fwd0[0] * sign, fwd0[1] * sign, fwd0[2] * sign]);
  const leftO = left;

  return {
    basis: { left: leftO, up, fwd, determinant: sign },
    facing: { sign, source: facingSource, meanToeDot: meanDot, toeCues: cues },
    refWindow: { start: refStart, count: refCount },
    warnings
  };
}

/* -------------------------------------------------------------------------- */
/* 5. TAKE                                                                     */
/* -------------------------------------------------------------------------- */

function guessUnits(standingHeight) {
  if (!(standingHeight > 0)) return { units: 'unknown', why: 'could not measure standing height' };
  if (standingHeight > 120 && standingHeight < 230) return { units: 'cm', why: 'standing height ' + standingHeight.toFixed(1) };
  if (standingHeight > 1.2 && standingHeight < 2.3) return { units: 'm', why: 'standing height ' + standingHeight.toFixed(3) };
  if (standingHeight > 45 && standingHeight < 95) return { units: 'in', why: 'standing height ' + standingHeight.toFixed(1) };
  return {
    units: 'unknown',
    why: 'standing height ' + standingHeight.toFixed(3) +
      ' matches no common unit. The cgspeed CMU conversions land here — they keep raw ASF units, ' +
      'about 25 per standing figure, where one unit is roughly 5.6 cm. Scale is normalised ' +
      'downstream off the subject\'s own limb lengths, so this field is informational only.'
  };
}

/**
 * BVH text → TAKE (CONTRACT §2).
 *
 * @param {string} text
 * @param {Object} [opts]
 * @param {string} [opts.source]      provenance string, e.g. 'cmu/60_01.bvh'
 * @param {string} [opts.label]       e.g. 'salsa'
 * @param {string} [opts.units]       force the units string
 * @param {Object} [opts.map]         explicit joint overrides
 * @param {number} [opts.facingSign]  +1 / -1, force the Z direction
 * @param {number} [opts.refFrame]    first frame of the facing reference window
 * @param {number} [opts.refFrames]   length of that window (default 0.5 s)
 * @param {number[]} [opts.range]     [startFrame, endFrameExclusive]
 * @param {number} [opts.stride]      keep every Nth frame (default 1)
 * @param {number} [opts.decimals]    rounding for emitted positions (default 6)
 * @returns {Object} TAKE
 */
export function bvhToTake(text, opts) {
  const o = opts || {};
  const skel = parseBVH(text);
  const res = resolvePoints(skel, o);
  const meas = measureFrame(skel, res.spec, res.toes, o);

  const warnings = [].concat(skel.warnings, res.warnings, meas.warnings);

  const start = Math.max(0, Math.min(skel.frameCount - 1, o.range ? (o.range[0] | 0) : 0));
  const endEx = Math.max(start + 1, Math.min(skel.frameCount, o.range && o.range[1] != null ? (o.range[1] | 0) : skel.frameCount));
  const stride = Math.max(1, o.stride ? (o.stride | 0) : 1);
  const dec = o.decimals != null ? (o.decimals | 0) : 6;
  const q = Math.pow(10, dec);
  const rnd = v => Math.round(v * q) / q;

  const { left, up, fwd } = meas.basis;
  const N = skel.nodes.length;
  const P = new Float64Array(N * 3);
  const tmp = [0, 0, 0];
  const frames = [];

  for (let f = start; f < endEx; f += stride) {
    fkFrame(skel, f, P);
    const p = {};
    for (let i = 0; i < CANONICAL_POINTS.length; i++) {
      const key = CANONICAL_POINTS[i];
      readPoint(res.spec[key], P, tmp);
      p[key] = [
        rnd(dot3(tmp, left)),
        rnd(dot3(tmp, up)),
        rnd(dot3(tmp, fwd))
      ];
    }
    frames.push({ t: rnd((f - start) * skel.frameTime), p });
  }

  // standing height, measured on the reference window, for the units guess
  let standing = 0;
  {
    const f = Math.min(meas.refWindow.start, skel.frameCount - 1);
    fkFrame(skel, f, P);
    readPoint(res.spec.head, P, tmp); const hd = dot3(tmp, up);
    readPoint(res.spec.lank, P, tmp); const la = dot3(tmp, up);
    readPoint(res.spec.rank, P, tmp); const ra = dot3(tmp, up);
    standing = hd - Math.min(la, ra);
  }
  const ug = guessUnits(standing);

  const rawFps = 1 / (skel.frameTime * stride);
  const fps = Math.abs(rawFps - Math.round(rawFps)) < rawFps * 0.005 ? Math.round(rawFps) : Math.round(rawFps * 1000) / 1000;

  const take = {
    source: o.source || 'bvh',
    label: o.label || '',
    fps,
    units: o.units || ug.units,
    frames
  };

  // Additive, never load-bearing for the retargeter — but a human reviewing a
  // proposed move needs to be able to see how it was mapped, and the CLI needs
  // somewhere to read the trim and the facing decision from.
  take.meta = {
    format: 'bvh',
    parser: 'tools/mocap/bvh.js',
    jointCount: skel.nodes.filter(n => !n.isEndSite).length,
    sourceFrames: skel.frameCount,
    sourceFps: Math.round(1 / skel.frameTime * 1000) / 1000,
    frameTime: skel.frameTime,
    // `frameRange` and `stride` use asfamc.js's names on purpose: the CLI reads
    // one meta shape whichever front end produced the take.
    frameRange: [start, endEx],
    stride,
    mapping: res.source,
    basis: meas.basis,
    facing: meas.facing,
    refWindow: meas.refWindow,
    standingHeight: standing,
    unitsWhy: ug.why,
    channelOrders: summariseChannelOrders(skel),
    // Same array, two names: asfamc.js publishes `meta.warnings`, and
    // `take.warnings` is where a caller looks first. One list, no drift.
    warnings: warnings
  };
  take.warnings = warnings;

  return take;
}

/** Which rotation orders this file actually declares — the single most common
 *  source of a silently mirrored conversion, so it goes in the report. */
export function summariseChannelOrders(skel) {
  const counts = new Map();
  for (const n of skel.nodes) {
    if (!n.rot.length) continue;
    const key = n.rot.map(r => 'XYZ'[r.axis]).join('');
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  const out = {};
  for (const [k, v] of counts) out[k] = v;
  return out;
}

/** Read a .bvh off disk. Lazy import so the parser itself stays environment-free. */
export async function loadBVH(filePath, opts) {
  const { readFile } = await import('node:fs/promises');
  const text = await readFile(filePath, 'utf8');
  const o = Object.assign({}, opts);
  if (!o.source) {
    const parts = String(filePath).split(/[\\/]/);
    o.source = parts.slice(-2).join('/');
  }
  return bvhToTake(text, o);
}

/** A printable tree, for when a mapping fails and someone has to look. */
export function describeSkeleton(skel) {
  const out = [];
  (function walk(i, depth) {
    const n = skel.nodes[i];
    out.push('  '.repeat(depth) + n.name +
      (n.isEndSite ? '  [end site]' : '  [' + (n.channels.join(' ') || 'no channels') + ']') +
      '  offset ' + n.offset.map(v => v.toFixed(3)).join(', '));
    for (const c of n.children) walk(c, depth + 1);
  })(skel.rootIndex, 0);
  return out.join('\n');
}

/* -------------------------------------------------------------------------- */
/* 6. VALIDATE — the assertions CONTRACT §2 asks every parser to make          */
/* -------------------------------------------------------------------------- */

function median(a) {
  if (!a.length) return NaN;
  const s = a.slice().sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) * 0.5;
}

/**
 * Prove the axis convention and the forward kinematics on a TAKE.
 *
 * Works on ANY take, not just ours — point it at the ASF/AMC front end's output
 * too. Deliberately reports medians over every frame rather than picking a
 * flattering frame.
 *
 * What each check does and does NOT prove:
 *  - shouldersLevel / shouldersAboveHips / headAboveShoulders prove the UP axis
 *    and the left/right labelling.
 *  - limbLengthDrift proves the tree, the offsets and the parenting. It does
 *    NOT prove the rotation ORDER — rotations preserve length whatever order
 *    you compose them in. Only a cross-check against a second, independent
 *    parser of the same motion can prove that, which is why the CMU ASF/AMC of
 *    the same take exists in cache/.
 *
 * @returns {{ok:boolean, checks:Array, lines:string[]}}
 */
export function validateTake(take, opts) {
  const o = opts || {};
  const frames = (take && take.frames) || [];
  const checks = [];
  if (!frames.length) {
    return { ok: false, checks: [{ name: 'frames', ok: false, detail: 'take has no frames' }], lines: ['FAIL frames: none'] };
  }

  // NaN sweep
  let bad = 0;
  for (const f of frames) {
    for (const k of CANONICAL_POINTS) {
      const v = f.p[k];
      if (!v || v.length !== 3 || !isNum(v[0]) || !isNum(v[1]) || !isNum(v[2])) bad++;
    }
  }
  checks.push({ name: 'finite', ok: bad === 0, detail: bad + ' non-finite / missing points of ' + (frames.length * 15) });

  const shoulderW = [], tilt = [], shoHip = [], headSho = [];
  for (const f of frames) {
    const p = f.p;
    const w = Math.hypot(p.lsho[0] - p.rsho[0], p.lsho[1] - p.rsho[1], p.lsho[2] - p.rsho[2]);
    shoulderW.push(w);
    tilt.push(Math.abs(p.lsho[1] - p.rsho[1]) / Math.max(1e-9, w));
    shoHip.push(Math.min(p.lsho[1], p.rsho[1]) - Math.max(p.lhip[1], p.rhip[1]));
    headSho.push(p.head[1] - Math.max(p.lsho[1], p.rsho[1]));
  }

  const medTilt = median(tilt);
  const tiltTol = o.tiltTol != null ? o.tiltTol : 0.35;
  checks.push({
    name: 'shouldersLevel',
    ok: medTilt <= tiltTol,
    detail: 'median |lsho.y - rsho.y| / shoulderWidth = ' + medTilt.toFixed(4) + ' (tol ' + tiltTol + ')'
  });

  const medSH = median(shoHip);
  checks.push({
    name: 'shouldersAboveHips',
    ok: medSH > 0,
    detail: 'median (min shoulder.y − max hip.y) = ' + medSH.toFixed(4) + ' — must be > 0'
  });

  const medHS = median(headSho);
  checks.push({
    name: 'headAboveShoulders',
    ok: medHS > 0,
    detail: 'median (head.y − max shoulder.y) = ' + medHS.toFixed(4) + ' — must be > 0'
  });

  // left is +X
  let leftRight = 0;
  for (const f of frames) if (f.p.lsho[0] > f.p.rsho[0]) leftRight++;
  checks.push({
    name: 'subjectLeftIsPlusX',
    ok: leftRight >= frames.length * 0.5,
    detail: leftRight + '/' + frames.length + ' frames have lsho.x > rsho.x'
  });

  // limb length constancy
  let worst = { bone: '', drift: 0, mean: 0 };
  const bones = [];
  for (const [a, b] of CANONICAL_BONES) {
    let mn = Infinity, mx = -Infinity, sum = 0;
    for (const f of frames) {
      const pa = f.p[a], pb = f.p[b];
      const L = Math.hypot(pa[0] - pb[0], pa[1] - pb[1], pa[2] - pb[2]);
      if (L < mn) mn = L;
      if (L > mx) mx = L;
      sum += L;
    }
    const mean = sum / frames.length;
    const drift = mean > 1e-9 ? (mx - mn) / mean : 0;
    bones.push({ bone: a + '→' + b, mean, drift });
    if (drift > worst.drift) worst = { bone: a + '→' + b, drift, mean };
  }
  // root→neck, neck→head and the shoulder/hip spans are only rigid if the
  // source rig has a rigid spine, so they are reported but not asserted.
  const rigid = bones.filter(b => /^(l|r)(sho|elb|hip|kne)→/.test(b.bone));
  let worstRigid = { bone: '', drift: 0 };
  for (const b of rigid) if (b.drift > worstRigid.drift) worstRigid = b;
  const driftTol = o.driftTol != null ? o.driftTol : 1e-6;
  checks.push({
    name: 'limbLengthConstant',
    ok: worstRigid.drift <= driftTol,
    detail: 'worst rigid-limb drift ' + worstRigid.drift.toExponential(3) + ' on ' + worstRigid.bone +
      ' (tol ' + driftTol + '); worst overall ' + worst.drift.toExponential(3) + ' on ' + worst.bone
  });

  const ok = checks.every(c => c.ok);
  const lines = checks.map(c => (c.ok ? 'PASS ' : 'FAIL ') + c.name + ': ' + c.detail);
  return { ok, checks, lines, bones };
}

/* -------------------------------------------------------------------------- */
/* 7. HOW THIS FILE WAS PROVEN — read before you change the FK                 */
/* -------------------------------------------------------------------------- */
/*
 * Three proofs, because they cover different failures. All three were run; the
 * numbers below are what they actually returned.
 *
 * A. HAND-BUILT BVH, CLOSED-FORM ANSWER.  86 assertions, all green.
 *    An 18-joint fixture with known offsets, driven with single-axis 90°
 *    rotations, then with TWO axes at once on a joint whose CHANNELS say
 *    `Zrotation Yrotation Xrotation`, then the SAME two numbers again on a
 *    fixture declaring `Xrotation Yrotation Zrotation`. Listed order puts the
 *    elbow at (-6,28,0); the reversed order puts it at (6,28,-12) — 16.97
 *    units apart on a 12-unit bone. A hard-coded rotation order cannot pass
 *    both fixtures. Also covers root translation channels, inherited rotation
 *    down a chain, the Mixamo clavicle trap, refusal-with-joint-names, the
 *    explicit-map escape hatch, brace-on-the-same-line, CRLF, wrapped MOTION
 *    rows, a short MOTION block, and the mirrored-file correction.
 *
 * B. THE SAME MOTION THROUGH A SECOND, INDEPENDENT FORMAT.
 *    cache/60_01.bvh (cgspeed's conversion) against cache/60.asf +
 *    cache/60_01.amc (CMU's original): the same 2242 frames of salsa. ASF/AMC
 *    encodes rotation completely differently — per-bone axis frames with C and
 *    C⁻¹ sandwiching the DOF values — so an FK bug cannot hide in both.
 *
 *      root, neck, both hips, both knees, both ankles agree in ABSOLUTE
 *      position to 3.3e-5 units on a 25-unit figure, every frame. That is the
 *      5-decimal quantisation of the BVH's own text.
 *
 *      Every canonical bone VECTOR agrees to 0.0002° of direction and a length
 *      ratio of 1.000000, worst case, over all 2242 frames.
 *
 *      Negative controls, same code with the FK deliberately broken:
 *        channel order reversed      mean bone angle 47.4°, worst 179.8°
 *        first two channels swapped  mean bone angle 45.9°, worst 178.6°
 *        axes relabelled X→Y→Z       mean bone angle 74.7°, worst 179.6°
 *        AS SHIPPED                  mean bone angle  0.000°, worst 0.00°
 *      The test can fail, so the pass means something.
 *
 *    Two things that look like errors and are not:
 *      - The BVH has 2243 frames to the AMC's 2242, and BVH[i+1] matches
 *        AMC[i]. cgspeed splices a rest pose onto the front. See the SPLICED
 *        warning in parseBVH.
 *      - The six ARM points sit exactly 2.07396 units off the ASF, constant in
 *        every frame. The ASF has a `thorax` bone of length 2.07397 that the
 *        cgspeed BVH does not; the whole arm chain hangs off a different spine
 *        node. That is a difference between the two FILES, not between the two
 *        FKs, which is why the bone-vector test is the one that decides.
 *
 * C. FOUR MORE TAKES, AND A RIG FROM ANOTHER PLANET.
 *    CMU 05_02 modern, 85_02 breakdance, 94_01 indian — all convert, all pass
 *    validateTake. And three.js's pirouette.bvh, a Poser/DAZ rig with
 *    `hip / abdomen / chest / lCollar / lShldr / lForeArm / lThigh / lShin`,
 *    eye joints on the head, buttock bones between hip and thigh, and MIXED
 *    channel orders inside one file (ZYX on the root, ZXY on the other 42
 *    joints). It converts, the tree beats `lCollar` for the shoulder, and the
 *    warning says so.
 *
 * Limb-length constancy proves the tree and the offsets. It proves NOTHING
 * about rotation order, because every rotation preserves length. Do not let a
 * green `validateTake` talk you out of proof B.
 *
 * WHAT LOOKING AT IT SHOWED (contact sheets of the emitted points projected to
 * XY, which is what the retargeter will do):
 *   - It is a person. Head, level shoulders, elbows and knees in the right
 *     places, and the subject's LEFT is on screen right in every front-facing
 *     frame. Not mirrored.
 *   - 60% of the salsa take is more than 40° off camera. Salsa is turns. The
 *     off-axis frames render as unreadable scribble, exactly as CONTRACT §0
 *     predicted. 05_02 modern dance is the opposite — 10% off-axis, and its
 *     upper body reads cleanly all the way through.
 *   - Two failure modes the shoulder-line facing test does NOT catch, for
 *     whoever writes the retargeter: 85_02 contains a handstand (an inverted
 *     figure) and a frame lying flat on the floor, and both report a yaw near
 *     zero. `rot` is a fall, not a cartwheel; facing is not the only gate.
 */
