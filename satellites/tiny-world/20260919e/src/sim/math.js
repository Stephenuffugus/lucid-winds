// Arithmetic that gives the same bits on every JS engine. Math.hypot and Math.sin are not
// specified to the last bit, so the sim never calls them.
export const hyp = (dx, dy) => Math.sqrt(dx * dx + dy * dy);

const PI = 3.141592653589793, TWO_PI = 6.283185307179586, HALF_PI = 1.5707963267948966;
export function dsin(x) {
  x -= TWO_PI * Math.round(x / TWO_PI);
  if (x > HALF_PI) x = PI - x;
  else if (x < -HALF_PI) x = -PI - x;
  const x2 = x * x;
  return x * (1 - (x2 / 6) * (1 - (x2 / 20) * (1 - (x2 / 42) * (1 - (x2 / 72) * (1 - x2 / 110)))));
}

export const clamp = (lo, hi, v) => Math.max(lo, Math.min(hi, v));
