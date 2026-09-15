/* NOTCH's projection (plans/notch/HANDOFF-NOTCH.md 3.4; the handoff section 4: a hand rolled 4 by 4 matrix, no three.js). PURE.
 *
 * A matrix is 16 numbers, row major: m[r * 4 + c]. transform(m, p) applies it to a column point, so multiply(a, b) is "b, then
 * a". Rotations are right handed: rotationZ turns x toward y (counterclockwise in maths, with y up). The camera looks down the
 * negative z axis from z = focal, and a point is drawn at scale times x over (focal less z), y flipped for the screen.
 */
export function identity() {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}

export function multiply(a, b) {
  const out = new Array(16).fill(0);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
    let s = 0;
    for (let k = 0; k < 4; k++) s += a[r * 4 + k] * b[k * 4 + c];
    out[r * 4 + c] = s;
  }
  return out;
}

export function transform(m, p) {
  const [x, y, z] = p;
  return [m[0] * x + m[1] * y + m[2] * z + m[3], m[4] * x + m[5] * y + m[6] * z + m[7], m[8] * x + m[9] * y + m[10] * z + m[11]];
}

export function rotationZ(deg) {
  const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
  return [c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}

/* a turn of `deg` about any axis (Rodrigues' formula), the axis normalised here */
export function rotationAxis(axis, deg) {
  const n = Math.hypot(axis[0], axis[1], axis[2]), x = axis[0] / n, y = axis[1] / n, z = axis[2] / n;
  const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), t = 1 - c;
  return [
    t * x * x + c, t * x * y - s * z, t * x * z + s * y, 0,
    t * x * y + s * z, t * y * y + c, t * y * z - s * x, 0,
    t * x * z - s * y, t * y * z + s * x, t * z * z + c, 0,
    0, 0, 0, 1
  ];
}

/* a point to the screen; null when it sits at or behind the camera, never a division by zero */
export function projectPoint(m, p, { focal, scale, cx, cy }) {
  const q = transform(m, p), depth = focal - q[2];
  if (!(depth > 1e-9)) return null;
  return [cx + scale * q[0] / depth, cy - scale * q[1] / depth];
}
