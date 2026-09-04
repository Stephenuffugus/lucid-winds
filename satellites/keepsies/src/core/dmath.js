/**
 * Deterministic math for `src/core/`.
 *
 * WHY THIS FILE EXISTS. ECMAScript lets an engine return a different last bit
 * from `Math.sin`, `Math.cos`, `Math.atan2`, `Math.pow`, `Math.exp` and
 * `Math.hypot`. Keepsies stakes real marbles on a replay hash: two phones that
 * simulate the same input log must land on the same bytes, and one bit of drift
 * in a spin axis compounds over three hundred steps into a different winner
 * (HANDOFF-KEEPSIES 4.2). So `core/` never calls a transcendental. It calls
 * these, which are built from the exactly specified operations only:
 * `+ - * /`, `Math.sqrt`, and the exact integer helpers `Math.floor`,
 * `Math.abs`, `Math.min`, `Math.max` (see docs/DECISIONS.md).
 *
 * Accuracy: sin and cos are within about 1e-15 of the true value over the
 * reduced range, atan2 within about 1e-14. The `coremath` gate greps `core/`
 * for the banned set, and `test/dmath.js` measures the error against `Math`.
 */

/* 2 pi split so that k * TWO_PI is exact for the k a marble's spin can reach. */
const TWO_PI_HI = 6.28125;
const TWO_PI_MID = 0.001935307179586477;
const TWO_PI_LO = -7.471323344099423e-20;
const INV_TWO_PI = 0.15915494309189535;

export const PI = 3.141592653589793;
export const HALF_PI = 1.5707963267948966;
const SIXTH_PI = 0.5235987755982989;
const SQRT3 = 1.7320508075688772;
const TAN_TWELFTH_PI = 0.26794919243112270;

/* Taylor coefficients: sin through r^19, cos through r^18. */
const S1 = -0.16666666666666666, S2 = 0.008333333333333333, S3 = -0.0001984126984126984,
  S4 = 2.7557319223985893e-06, S5 = -2.505210838544172e-08, S6 = 1.6059043836821613e-10,
  S7 = -7.647163731819816e-13, S8 = 2.8114572543455206e-15, S9 = -8.22063524662433e-18;
const C1 = -0.5, C2 = 0.041666666666666664, C3 = -0.001388888888888889,
  C4 = 2.48015873015873e-05, C5 = -2.755731922398589e-07, C6 = 2.08767569878681e-09,
  C7 = -1.1470745597729725e-11, C8 = 4.779477332387385e-14, C9 = -1.5619206968586225e-16;

/** Reduce an angle to [-pi, pi] with a three term split so the reduction is exact. */
function reduce(x) {
  const k = Math.floor(x * INV_TWO_PI + 0.5);
  return ((x - k * TWO_PI_HI) - k * TWO_PI_MID) - k * TWO_PI_LO;
}

function sinCore(r) {
  const z = r * r;
  return r * (1 + z * (S1 + z * (S2 + z * (S3 + z * (S4 + z * (S5 + z * (S6 + z * (S7 + z * (S8 + z * S9)))))))));
}

function cosCore(r) {
  const z = r * r;
  return 1 + z * (C1 + z * (C2 + z * (C3 + z * (C4 + z * (C5 + z * (C6 + z * (C7 + z * (C8 + z * C9))))))));
}

/** sin, to about 1e-15. */
export function sin(x) {
  let r = reduce(x);
  if (r > HALF_PI) r = PI - r;
  else if (r < -HALF_PI) r = -PI - r;
  return sinCore(r);
}

/** cos, to about 1e-15. */
export function cos(x) {
  let r = reduce(x);
  let flip = 1;
  if (r > HALF_PI) { r = PI - r; flip = -1; }
  else if (r < -HALF_PI) { r = -PI - r; flip = -1; }
  return flip * cosCore(r);
}

/** atan on [-tan(pi/12), tan(pi/12)], alternating series through t^19. */
function atanSmall(t) {
  const z = t * t;
  return t * (1 + z * (-0.3333333333333333 + z * (0.2 + z * (-0.14285714285714285 + z * (0.1111111111111111
    + z * (-0.09090909090909091 + z * (0.07692307692307693 + z * (-0.06666666666666667
      + z * (0.058823529411764705 + z * -0.05263157894736842)))))))));
}

/** atan, to about 1e-14. */
export function atan(x) {
  const neg = x < 0;
  let a = neg ? -x : x;
  let big = false;
  if (a > 1) { a = 1 / a; big = true; }
  let r;
  if (a > TAN_TWELFTH_PI) {
    r = SIXTH_PI + atanSmall((a * SQRT3 - 1) / (SQRT3 + a));
  } else {
    r = atanSmall(a);
  }
  if (big) r = HALF_PI - r;
  return neg ? -r : r;
}

/** atan2 with the standard quadrant rules, to about 1e-14. */
export function atan2(y, x) {
  if (x === 0) {
    if (y > 0) return HALF_PI;
    if (y < 0) return -HALF_PI;
    return 0;
  }
  const a = atan(y / x);
  if (x > 0) return a;
  return y >= 0 ? a + PI : a - PI;
}

/** sqrt(x*x + y*y). Math.hypot is not exactly specified, so it never appears in core. */
export function len2(x, y) { return Math.sqrt(x * x + y * y); }

/** sqrt(x*x + y*y + z*z). */
export function len3(x, y, z) { return Math.sqrt(x * x + y * y + z * z); }

/** clamp, exact. */
export function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }

/** Rodrigues rotation of v about a unit axis by `ang` radians. Returns a new vector. */
export function rotateAxis(v, axis, ang) {
  const c = cos(ang), s = sin(ang), t = 1 - c;
  const { x: ax, y: ay, z: az } = axis;
  return {
    x: v.x * (t * ax * ax + c) + v.y * (t * ax * ay - s * az) + v.z * (t * ax * az + s * ay),
    y: v.x * (t * ax * ay + s * az) + v.y * (t * ay * ay + c) + v.z * (t * ay * az - s * ax),
    z: v.x * (t * ax * az - s * ay) + v.y * (t * ay * az + s * ax) + v.z * (t * az * az + c)
  };
}

/** Unit vector, or {0,0,0} when the input has no length. */
export function normalize(v) {
  const L = len3(v.x, v.y, v.z);
  if (L < 1e-12) return { x: 0, y: 0, z: 0 };
  return { x: v.x / L, y: v.y / L, z: v.z / L };
}

/**
 * x raised to n/16, for a non negative x and an integer n. Four square roots give
 * the sixteenth root and the rest is multiplication, so the whole thing stays
 * inside the exactly specified operations. This is why tuning states the power
 * curve's exponent in sixteenths: `Math.pow` is not bit reproducible across
 * engines and a launch speed is the first thing a replay has to agree on.
 */
export function powSixteenths(x, n) {
  if (x <= 0) return 0;
  const u = Math.sqrt(Math.sqrt(Math.sqrt(Math.sqrt(x))));
  let r = 1;
  for (let i = 0; i < n; i++) r *= u;
  return r;
}

/**
 * The inverse of a monotone increasing f on [lo, hi], by bisection. Deterministic
 * to about 6e-8 in 24 halvings, and it uses nothing but comparison and division.
 */
export function invertMonotone(f, target, lo, hi, iters) {
  let a = lo, b = hi;
  const n = iters == null ? 24 : iters;
  for (let i = 0; i < n; i++) {
    const mid = (a + b) * 0.5;
    if (f(mid) < target) a = mid; else b = mid;
  }
  return (a + b) * 0.5;
}

export const DEG = 0.017453292519943295;
