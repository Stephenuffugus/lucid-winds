/* TINT's colour pipeline (plans/tint/HANDOFF-TINT.md 3.2 and 3.3; the handoff's section 4). PURE.
 *
 * Dye and white are mixed in linear light, never in sRGB. A ratio is first reduced to its lowest whole terms, so 2 : 1, 4 : 2,
 * 6 : 3 and 5 : 2.5 run the very same arithmetic and come out the very same colour, in floating point and in bytes; mixed unreduced,
 * half of all equivalent pairs differ by an ulp (the plan's 3.2). Every dye is dark (CIE lightness 35 or under), so that a pair of
 * different ratios differs in lightness, the dimension every eye and a grey screen keep (T7).
 */
export const DYES = Object.freeze({
  madder: '#8e2a2a',
  woad: '#27406e',
  indigo: '#1f2a4d',
  walnut: '#4a3222',
  cochineal: '#7a1f3d'
});
export const WHITE = '#ffffff';

export function toLinear(v) {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
export function toSrgb(l) {
  const c = l <= 0.0031308 ? 12.92 * l : 1.055 * Math.pow(l, 1 / 2.4) - 0.055;
  return Math.round(Math.max(0, Math.min(1, c)) * 255);
}

const gcd = (x, y) => (y ? gcd(y, x % y) : x);
/* lowest whole terms: parts in halves or thousandths scaled to whole numbers first */
export function reduceRatio(a, b) {
  const A = Math.round(a * 1000), B = Math.round(b * 1000), g = gcd(A, B) || 1;
  return [A / g, B / g];
}

const channels = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
const toHex = bytes => '#' + bytes.map(v => v.toString(16).padStart(2, '0')).join('');

/* dye parts and white parts, mixed in linear light: the floats and the colour's hex */
export function mixLinear(dye, dyeParts, whiteParts) {
  const [A, B] = reduceRatio(dyeParts, whiteParts);
  const d = channels(dye).map(toLinear);
  const lin = A + B === 0 ? [1, 1, 1] : d.map(v => (A * v + B * 1) / (A + B));
  return { lin, hex: toHex(lin.map(toSrgb)) };
}

/* CIE lightness of an sRGB colour */
export function lightness(hex) {
  const [r, g, b] = channels(hex).map(toLinear), y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return y > 216 / 24389 ? 116 * Math.cbrt(y) - 16 : (24389 / 27) * y;
}

/* how far apart in lightness two ratios of the same dye come out */
export function lightnessGap(dye, p, q) {
  return Math.abs(lightness(mixLinear(dye, p[0], p[1]).hex) - lightness(mixLinear(dye, q[0], q[1]).hex));
}
