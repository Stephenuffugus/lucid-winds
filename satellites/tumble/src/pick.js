// What the finger means: the sock the player SEES under it.
//
// A sock's PHYSICS shape is two thin rails along its edges (silhouettes.js colliderLayout: a pair of capsules of
// radius t/2, set w/2 - t/2 either side of the centreline). That is right for a heap that settles fast, and wrong for
// a finger: between the rails there is a gap about 22 mm wide running the whole length of the sock, exactly where a
// thumb aims. On a sparse table a ray through the gap hits nothing and the fat finger ring catches a rail. In a HEAP
// the same ray goes on and hits the sock UNDERNEATH, so the game picked up the wrong sock, and it got worse the
// bigger the Load (Stephen, Sep 21 2026: "it just keep picks up socks under the one of clicking or looking at like my
// touch is going through it").
//
// So picking uses the sock's FOOTPRINT: two flat boxes, cuff to heel and heel to toe, the full width of the sock and
// as thick as it is drawn, in the body's own frame. Pure maths over poses the renderer already reads: no new
// colliders, nothing for the physics step to carry, and Node can test it (tests/pick.test.mjs).
import { SILHOUETTES, centerline } from './silhouettes.js';

const cache = new Map();

// [{ cx, cz, hx, hy, hz, cos, sin }]: boxes in the body's frame, base on y = 0, long axis along the centreline.
export function pickBoxes(silId, scale = 1) {
  const key = silId * 1000 + Math.round(scale * 100);
  let boxes = cache.get(key);
  if (boxes) return boxes;
  const s = SILHOUETTES[silId], cl = centerline(s, 40), n = cl.pts.length - 1;
  const at = (v) => cl.pts[Math.round(v * n)];
  const seg = (va, vb) => {
    const A = at(va), B = at(vb), dx = (B.x - A.x) * scale, dz = (B.z - A.z) * scale, len = Math.hypot(dx, dz) || 1e-6;
    return { cx: ((A.x + B.x) / 2) * scale, cz: ((A.z + B.z) / 2) * scale, hx: len / 2, hy: (s.t * scale) / 2, hz: (s.w * scale) / 2, cos: dx / len, sin: dz / len };
  };
  // cuff to heel, heel to toe, and a square over the heel itself: where the two meet at the bend, the outer corner of
  // the L is covered by neither (a tap on the heel of a toe sock fell through in the first cut of the test)
  const leg = seg(0, cl.heelS), foot = seg(cl.heelS, 1), H = at(cl.heelS);
  boxes = [leg, foot, { cx: H.x * scale, cz: H.z * scale, hx: leg.hz, hy: leg.hy, hz: leg.hz, cos: leg.cos, sin: leg.sin }];
  cache.set(key, boxes);
  return boxes;
}

// Distance along the ray to the sock's footprint, or Infinity. pose: { x, y, z, qx, qy, qz, qw } (the body).
export function rayFootprint(o, d, pose, boxes) {
  // into the body's frame: v' = q* v q
  const qx = -pose.qx, qy = -pose.qy, qz = -pose.qz, qw = pose.qw;
  const px = o.x - pose.x, py = o.y - pose.y, pz = o.z - pose.z;
  const lo = rot(qx, qy, qz, qw, px, py, pz), ld = rot(qx, qy, qz, qw, d.x, d.y, d.z);
  let best = Infinity;
  for (let i = 0; i < boxes.length; i++) {
    const b = boxes[i];
    // into the box's frame: its long axis is (cos, 0, sin) in the body's xz plane
    const ox = lo[0] - b.cx, oz = lo[2] - b.cz;
    const bx = ox * b.cos + oz * b.sin, bz = -ox * b.sin + oz * b.cos, by = lo[1] - b.hy;
    const ex = ld[0] * b.cos + ld[2] * b.sin, ez = -ld[0] * b.sin + ld[2] * b.cos, ey = ld[1];
    const t = slab(bx, by, bz, ex, ey, ez, b.hx, b.hy, b.hz);
    if (t < best) best = t;
  }
  return best;
}

// The nearest footprint along the ray among `socks` ([{ id, silId, scale, pose }]). Returns { id, toi } or null.
export function footprintPick(o, d, socks) {
  let id = null, toi = Infinity;
  for (let i = 0; i < socks.length; i++) {
    const s = socks[i], t = rayFootprint(o, d, s.pose, pickBoxes(s.silId, s.scale || 1));
    if (t < toi) { toi = t; id = s.id; }
  }
  return id === null ? null : { id, toi };
}

function rot(qx, qy, qz, qw, x, y, z) {
  const tx = 2 * (qy * z - qz * y), ty = 2 * (qz * x - qx * z), tz = 2 * (qx * y - qy * x);
  return [x + qw * tx + (qy * tz - qz * ty), y + qw * ty + (qz * tx - qx * tz), z + qw * tz + (qx * ty - qy * tx)];
}

function slab(ox, oy, oz, dx, dy, dz, hx, hy, hz) {
  let t0 = 0, t1 = Infinity;
  const o = [ox, oy, oz], d = [dx, dy, dz], h = [hx, hy, hz];
  for (let k = 0; k < 3; k++) {
    if (Math.abs(d[k]) < 1e-9) { if (o[k] < -h[k] || o[k] > h[k]) return Infinity; continue; }
    let a = (-h[k] - o[k]) / d[k], b = (h[k] - o[k]) / d[k];
    if (a > b) { const s = a; a = b; b = s; }
    if (a > t0) t0 = a;
    if (b < t1) t1 = b;
    if (t0 > t1) return Infinity;
  }
  return t0;
}
