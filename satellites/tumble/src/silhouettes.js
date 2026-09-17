// The eight sock silhouettes (DESIGN 14), in 3-bit field order.
// One description drives BOTH the placeholder mesh and the compound capsule
// collider, so the two can never disagree about how big a sock is.
//
// Local frame: the sock lies flat in the XZ plane, thickness along Y.
// The leg runs +X from the cuff to the heel, the foot turns toward +Z.
// "Outer" edge = back of the leg, heel, sole. "Inner" edge = shin, instep.
// U runs around the tube (0 = outer edge, 0.25 = top face), V runs cuff (0) to toe (1).

export const SILHOUETTES = [
  { id: 0, key: 'ankle',   name: 'Ankle',       leg: 0.050, foot: 0.165, w: 0.072, t: 0.026, turn: 78, cuff: 0.14, heelV: 0.20, toeV: 0.86, lengthRank: 0 },
  { id: 1, key: 'crew',    name: 'Crew',        leg: 0.150, foot: 0.170, w: 0.076, t: 0.027, turn: 80, cuff: 0.10, heelV: 0.43, toeV: 0.88, lengthRank: 1 },
  { id: 2, key: 'knee',    name: 'Knee High',   leg: 0.290, foot: 0.170, w: 0.080, t: 0.027, turn: 80, cuff: 0.07, heelV: 0.60, toeV: 0.91, lengthRank: 2 },
  { id: 3, key: 'toe',     name: 'Toe Sock',    leg: 0.120, foot: 0.175, w: 0.080, t: 0.027, turn: 80, cuff: 0.10, heelV: 0.38, toeV: 0.84, toes: 5, lengthRank: 1 },
  { id: 4, key: 'baby',    name: 'Baby',        leg: 0.060, foot: 0.095, w: 0.060, t: 0.030, turn: 76, cuff: 0.22, heelV: 0.36, toeV: 0.80, lengthRank: 0 },
  { id: 5, key: 'slipper', name: 'Fuzzy Slipper', leg: 0.070, foot: 0.190, w: 0.100, t: 0.044, turn: 74, cuff: 0.20, heelV: 0.24, toeV: 0.84, rolled: true, lengthRank: 0 },
  { id: 6, key: 'dress',   name: 'Dress',       leg: 0.230, foot: 0.175, w: 0.064, t: 0.019, turn: 82, cuff: 0.08, heelV: 0.54, toeV: 0.90, lengthRank: 2 },
  { id: 7, key: 'novelty', name: 'Novelty Crew', leg: 0.150, foot: 0.170, w: 0.078, t: 0.027, turn: 80, cuff: 0.10, heelV: 0.43, toeV: 0.88, fin: true, lengthRank: 1 },
];

// Silhouettes that share a length family, for "silhouette length" decoys (DESIGN 5).
export const LENGTH_LADDER = [0, 1, 2]; // ankle, crew, knee

// Tier 0 uses three families; all eight by tier 5 (DESIGN 5).
export const SILHOUETTES_BY_TIER = [
  [0, 1, 2],
  [0, 1, 2, 6],
  [0, 1, 2, 6],
  [0, 1, 2, 6, 4],
  [0, 1, 2, 6, 4, 5],
  [0, 1, 2, 6, 4, 5, 7, 3],
];
export function silhouettesForTier(tier) {
  return SILHOUETTES_BY_TIER[Math.min(tier, SILHOUETTES_BY_TIER.length - 1)];
}

const RC = 0.034; // heel corner radius on the centerline

// Centerline of a silhouette, sampled by arc length. Returns
// { pts: [{x,z,tx,tz}], length, legLen, heelS } with the origin at the centroid.
export function centerline(s, n = 40) {
  const turn = (s.turn * Math.PI) / 180;
  const d2x = Math.cos(turn), d2z = Math.sin(turn);
  const k = RC * Math.tan(turn / 2);           // tangent length of the rounded corner
  const legStraight = Math.max(0.004, s.leg - k);
  const footStraight = Math.max(0.004, s.foot - k);
  const arc = RC * turn;
  const total = legStraight + arc + footStraight;
  // corner geometry: leg along +X ends at (-k, 0); arc center at (-k, RC)
  const cx = -k, cz = RC;
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const sArc = (i / n) * total;
    let x, z, tx, tz;
    if (sArc <= legStraight) {
      x = -k - (legStraight - sArc); z = 0; tx = 1; tz = 0;
    } else if (sArc <= legStraight + arc) {
      const a = (sArc - legStraight) / RC; // 0..turn
      x = cx + RC * Math.sin(a); z = cz - RC * Math.cos(a);
      tx = Math.cos(a); tz = Math.sin(a);
    } else {
      const f = sArc - legStraight - arc;
      const ex = cx + RC * Math.sin(turn), ez = cz - RC * Math.cos(turn);
      x = ex + d2x * f; z = ez + d2z * f; tx = d2x; tz = d2z;
    }
    pts.push({ x, z, tx, tz, v: sArc / total });
  }
  // centroid (area weighted by width is close enough to the point average)
  let mx = 0, mz = 0;
  for (const p of pts) { mx += p.x; mz += p.z; }
  mx /= pts.length; mz /= pts.length;
  for (const p of pts) { p.x -= mx; p.z -= mz; }
  const heelS = (legStraight + arc / 2) / total;
  return { pts, length: total, heelS, offset: { x: -mx, z: -mz } };
}

// Width profile along V: leg, a little swell at the ball of the foot, a rounded toe.
export function widthAt(s, v) {
  let w = s.w;
  if (v < s.cuff) w *= s.rolled ? 1.08 : 1.02;
  const ball = Math.exp(-Math.pow((v - (s.toeV - 0.12)) / 0.12, 2));
  w *= 1 + 0.05 * ball;
  if (v > s.toeV) {
    const k = (v - s.toeV) / (1 - s.toeV);
    w *= Math.sqrt(Math.max(0, 1 - k * k)) * 0.92 + 0.08 * (1 - k);
  }
  return w;
}

export function thickAt(s, v) {
  let t = s.t;
  if (s.rolled && v < s.cuff) t *= 1.35;
  if (v > s.toeV) {
    const k = (v - s.toeV) / (1 - s.toeV);
    t *= Math.sqrt(Math.max(0, 1 - k * k)) * 0.9 + 0.1 * (1 - k);
  }
  return t;
}

// Compound capsule layout (DESIGN 13.2). Each capsule is
// { a:[x,y,z], b:[x,y,z], r } in the local frame; a box is { box:[hx,hy,hz], at:[x,y,z], yaw }.
// A flat sock is wider than it is thick, so each segment is a raft of two parallel
// capsules. Ankle and baby are one segment; crew/knee/dress/novelty/slipper are two
// segments in an L; the toe sock is one capsule segment plus a flattened box.
export function colliderLayout(s, scale = 1) {
  const cl = centerline(s, 40);
  const r = (s.t / 2) * scale;
  const off = Math.max(0, (s.w * scale) / 2 - r);
  const P = (p) => [p.x * scale, 0, p.z * scale];
  const at = (v) => cl.pts[Math.round(v * (cl.pts.length - 1))];
  const raft = (va, vb, shrink = 1) => {
    const A = at(va), B = at(vb);
    const dx = B.x - A.x, dz = B.z - A.z;
    const len = Math.hypot(dx, dz) || 1;
    const nx = dz / len, nz = -dx / len; // in-plane perpendicular
    const o = off * shrink;
    const pa = P(A), pb = P(B);
    return [
      { a: [pa[0] + nx * o, 0, pa[2] + nz * o], b: [pb[0] + nx * o, 0, pb[2] + nz * o], r },
      { a: [pa[0] - nx * o, 0, pa[2] - nz * o], b: [pb[0] - nx * o, 0, pb[2] - nz * o], r },
    ];
  };
  const inset = r / (cl.length * scale); // keep capsule caps inside the cuff and toe
  const h = cl.heelS;
  if (s.key === 'ankle' || s.key === 'baby') {
    return raft(0.02 + inset, 0.98 - inset, 0.9);
  }
  if (s.key === 'toe') {
    const out = raft(0.02 + inset, h);
    const A = at(h), B = at(0.97);
    const cx = ((A.x + B.x) / 2) * scale, cz = ((A.z + B.z) / 2) * scale;
    const len = Math.hypot(B.x - A.x, B.z - A.z) * scale;
    out.push({ box: [len / 2, r * 0.85, (s.w * scale) / 2 * 0.95], at: [cx, 0, cz], yaw: Math.atan2(-(B.z - A.z), B.x - A.x) });
    return out;
  }
  return raft(0.02 + inset, h).concat(raft(h, 0.98 - inset));
}
