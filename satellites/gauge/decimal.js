/* GAUGE's decimals (plans/gauge/HANDOFF-GAUGE.md 3.5; GA9). PURE. A decimal is a string and its arithmetic is BigInt on scaled
 * integers, never a float: in a game about decimal magnitude, 0.1 + 0.2 must be 0.3.
 *
 *   parse     '12.006' is { whole: 12n, places: '006' }; the places are kept as written, so 0.50 has two
 *   compare   -1, 0 or 1, both scaled to the same number of places
 *   add, subtract   exact, returned in canonical form (no trailing zeros, no trailing point)
 *   rational  a BigInt numerator over a power of ten, the places as written
 *   sameValue, sameDigits   one value (0.5 and 0.50), or one string
 */
const PATTERN = /^(0|[1-9][0-9]*)(?:\.([0-9]+))?$/;

export function parse(s) {
  const m = typeof s === 'string' ? PATTERN.exec(s) : null;
  if (!m) throw new Error('not a plain decimal: ' + JSON.stringify(s));
  return { whole: BigInt(m[1]), places: m[2] || '' };
}

const TEN = 10n;
const pow10 = n => TEN ** BigInt(n);
function scaled(s, n) {
  const p = parse(s);
  return p.whole * pow10(n) + BigInt((p.places + '0'.repeat(n)).slice(0, n) || '0');
}

export function compare(a, b) {
  const n = Math.max(parse(a).places.length, parse(b).places.length), x = scaled(a, n), y = scaled(b, n);
  return x > y ? 1 : x < y ? -1 : 0;
}

/* a scaled integer with n places, back to a canonical decimal string */
function format(big, n) {
  if (big < 0n) throw new Error('GAUGE has no negative decimals');
  const digits = big.toString().padStart(n + 1, '0');
  const whole = digits.slice(0, digits.length - n), places = n ? digits.slice(digits.length - n).replace(/0+$/, '') : '';
  return places ? whole + '.' + places : whole;
}

export function add(a, b) {
  const n = Math.max(parse(a).places.length, parse(b).places.length);
  return format(scaled(a, n) + scaled(b, n), n);
}

export function subtract(a, b) {
  const n = Math.max(parse(a).places.length, parse(b).places.length);
  return format(scaled(a, n) - scaled(b, n), n);
}

export function rational(s) {
  const p = parse(s), n = p.places.length;
  return { num: p.whole * pow10(n) + BigInt(p.places || '0'), den: pow10(n) };
}

export function sameValue(a, b) {
  return compare(a, b) === 0;
}
export function sameDigits(a, b) {
  return parse(a) && parse(b) && a === b;
}
