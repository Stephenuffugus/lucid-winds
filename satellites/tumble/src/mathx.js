// Small math helpers shared by physics (no three.js) and game logic.

export const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (t) => t * t * (3 - 2 * t);

export function quatFromAxisAngle(ax, ay, az, ang) {
  const l = Math.hypot(ax, ay, az) || 1;
  const s = Math.sin(ang / 2) / l;
  return { x: ax * s, y: ay * s, z: az * s, w: Math.cos(ang / 2) };
}

export function quatMul(a, b) {
  return {
    x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
    y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
    z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
    w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
  };
}

// Shortest rotation taking unit vector u onto unit vector v.
export function quatFromTo(u, v) {
  const d = u.x * v.x + u.y * v.y + u.z * v.z;
  if (d < -0.999999) {
    let ax = { x: 1, y: 0, z: 0 };
    if (Math.abs(u.x) > 0.9) ax = { x: 0, y: 0, z: 1 };
    const cx = u.y * ax.z - u.z * ax.y, cy = u.z * ax.x - u.x * ax.z, cz = u.x * ax.y - u.y * ax.x;
    return quatFromAxisAngle(cx, cy, cz, Math.PI);
  }
  const cx = u.y * v.z - u.z * v.y, cy = u.z * v.x - u.x * v.z, cz = u.x * v.y - u.y * v.x;
  const q = { x: cx, y: cy, z: cz, w: 1 + d };
  const l = Math.hypot(q.x, q.y, q.z, q.w);
  return { x: q.x / l, y: q.y / l, z: q.z / l, w: q.w / l };
}

export function quatRotate(q, v) {
  const ix = q.w * v.x + q.y * v.z - q.z * v.y;
  const iy = q.w * v.y + q.z * v.x - q.x * v.z;
  const iz = q.w * v.z + q.x * v.y - q.y * v.x;
  const iw = -q.x * v.x - q.y * v.y - q.z * v.z;
  return {
    x: ix * q.w + iw * -q.x + iy * -q.z - iz * -q.y,
    y: iy * q.w + iw * -q.y + iz * -q.x - ix * -q.z,
    z: iz * q.w + iw * -q.z + ix * -q.y - iy * -q.x,
  };
}

export function quatSlerp(a, b, t) {
  let bx = b.x, by = b.y, bz = b.z, bw = b.w;
  let cos = a.x * bx + a.y * by + a.z * bz + a.w * bw;
  if (cos < 0) { cos = -cos; bx = -bx; by = -by; bz = -bz; bw = -bw; }
  if (cos > 0.9995) {
    const q = { x: lerp(a.x, bx, t), y: lerp(a.y, by, t), z: lerp(a.z, bz, t), w: lerp(a.w, bw, t) };
    const l = Math.hypot(q.x, q.y, q.z, q.w);
    return { x: q.x / l, y: q.y / l, z: q.z / l, w: q.w / l };
  }
  const th = Math.acos(cos), s = Math.sin(th);
  const wa = Math.sin((1 - t) * th) / s, wb = Math.sin(t * th) / s;
  return { x: a.x * wa + bx * wb, y: a.y * wa + by * wb, z: a.z * wa + bz * wb, w: a.w * wa + bw * wb };
}

// Yaw (rotation about +Y) of a quaternion, for keeping a held sock's heading.
export function quatYaw(q) {
  return Math.atan2(2 * (q.w * q.y + q.x * q.z), 1 - 2 * (q.y * q.y + q.x * q.x));
}

// Deterministic PRNG (mulberry32). Seeds from a 32-bit int.
export function rng32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Distance between two segments in 2D (XZ), for spawn overlap tests.
export function segSegDist2D(ax, az, bx, bz, cx, cz, dx, dz) {
  const d1x = bx - ax, d1z = bz - az, d2x = dx - cx, d2z = dz - cz;
  const rx = ax - cx, rz = az - cz;
  const a = d1x * d1x + d1z * d1z, e = d2x * d2x + d2z * d2z, f = d2x * rx + d2z * rz;
  let s, t;
  if (a <= 1e-9 && e <= 1e-9) return Math.hypot(rx, rz);
  if (a <= 1e-9) { s = 0; t = clamp(f / e, 0, 1); }
  else {
    const c = d1x * rx + d1z * rz;
    if (e <= 1e-9) { t = 0; s = clamp(-c / a, 0, 1); }
    else {
      const b = d1x * d2x + d1z * d2z, den = a * e - b * b;
      s = den !== 0 ? clamp((b * f - c * e) / den, 0, 1) : 0;
      t = (b * s + f) / e;
      if (t < 0) { t = 0; s = clamp(-c / a, 0, 1); }
      else if (t > 1) { t = 1; s = clamp((b - c) / a, 0, 1); }
    }
  }
  const px = ax + d1x * s - (cx + d2x * t), pz = az + d1z * s - (cz + d2z * t);
  return Math.hypot(px, pz);
}
