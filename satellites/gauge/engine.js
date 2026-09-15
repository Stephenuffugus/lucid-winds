/* GAUGE's pure engine (plans/gauge/HANDOFF-GAUGE.md sections 3 and 4). No screen, no clock, no unseeded die, no float on a decimal.

   predict      the four readings of a pair: truth; L, longer is larger (the places read as a whole number, 125 > 3); S, shorter is
                larger; Z, a zero anywhere among the places makes a number small (3.3). Each answers 'left', 'right' or 'same'.
   generateComparisonSet   twenty pairs by count (3.4): 0.7 vs 0.2 first, four only L gets wrong, four only S gets wrong, two expert
                traps, two only Z gets wrong, two equal value pairs, five plain
   classifyRun  CORE's adaptClassify on the four rules, read as L, S, Z, A (a set that failed to separate: truth and a rule both
                above) or U; nothing before twelve answers (3.2)
   subdivide    the eleven ticks of one level, exactly ten divisions (GA4)
   routeFrom    where a code sends a child next (the handoff's section 1, v1's modes) */
import { parse, compare, add } from './decimal.js?v=20260916h';
import { adaptClassify } from '../math/core/pure.js?v=20260916h';

const side = c => (c > 0 ? 'left' : c < 0 ? 'right' : 'same');
const bigCmp = (x, y) => (x > y ? 1 : x < y ? -1 : 0);

export const predict = Object.freeze({
  truth: ({ left, right }) => side(compare(left, right)),
  L: ({ left, right }) => {
    const a = parse(left), b = parse(right);
    if (a.whole !== b.whole) return side(bigCmp(a.whole, b.whole));
    const c = bigCmp(BigInt(a.places || '0'), BigInt(b.places || '0'));
    if (c) return side(c);
    return side(a.places.length - b.places.length);
  },
  S: ({ left, right }) => {
    const a = parse(left), b = parse(right);
    if (a.whole !== b.whole) return side(bigCmp(a.whole, b.whole));
    if (a.places.length !== b.places.length) return side(b.places.length - a.places.length);
    return side(compare(left, right));
  },
  Z: ({ left, right }) => {
    const a = parse(left), b = parse(right);
    if (a.whole !== b.whole) return side(bigCmp(a.whole, b.whole));
    const za = a.places.indexOf('0') >= 0, zb = b.places.indexOf('0') >= 0;
    if (za !== zb) return za ? 'right' : 'left';
    return side(compare(left, right));
  }
});

const p = (left, right, trap) => Object.freeze(trap ? { left, right, trap } : { left, right });
export const FIRST = p('0.7', '0.2');
export const POOLS = Object.freeze({
  plain: Object.freeze([p('0.9', '0.4'), p('3.2', '1.8'), p('4.1', '4.7'), p('0.36', '0.58'), p('6.5', '6.1'), p('0.83', '0.27'), p('1.6', '1.9')]),
  onlyL: Object.freeze([p('0.125', '0.3'), p('0.4', '0.35'), p('0.2', '0.15'), p('0.6', '0.475'), p('1.3', '1.25'), p('0.8', '0.625'), p('0.9', '0.875')]),
  onlyS: Object.freeze([p('0.3', '0.496'), p('0.45', '0.625'), p('2.5', '2.625'), p('0.8', '0.925'), p('1.35', '1.475'), p('0.4', '0.56')]),
  traps: Object.freeze([p('5.736', '5.62', 'expert'), p('0.375', '0.25', 'expert'), p('3.84', '3.7', 'expert'), p('7.25', '7.1', 'expert')]),
  onlyZ: Object.freeze([p('0.60', '0.58'), p('0.705', '0.698'), p('2.30', '2.25'), p('0.40', '0.35'), p('4.20', '4.15'), p('6.50', '6.45')]),
  equal: Object.freeze([p('0.5', '0.50'), p('0.30', '0.3'), p('1.250', '1.25'), p('2.60', '2.6'), p('0.4', '0.400')])
});

function shuffle(r, list) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = out[i]; out[i] = out[j]; out[j] = t; }
  return out;
}
const draw = (r, list, n) => shuffle(r, list).slice(0, n);
/* a pair on either side, the reading of every rule following it */
const sides = (r, x) => (r() < 0.5 ? Object.assign({}, x) : Object.assign({}, x, { left: x.right, right: x.left }));

export function generateComparisonSet(r) {
  const body = [].concat(draw(r, POOLS.onlyL, 4), draw(r, POOLS.onlyS, 4), draw(r, POOLS.traps, 2), draw(r, POOLS.onlyZ, 2), draw(r, POOLS.equal, 2), draw(r, POOLS.plain, 5));
  return [Object.assign({}, FIRST)].concat(shuffle(r, body).map(x => sides(r, x)));
}

export const CLASSIFY = Object.freeze({ minItems: 12, minDiscriminating: 6, threshold: 0.8 });
export function classifyRun(responses) {
  if (responses.length < CLASSIFY.minItems) return null;
  const c = adaptClassify(responses, Object.assign({ rules: predict }, CLASSIFY));
  if (!c.enough) return null;
  if (c.above.indexOf('truth') >= 0 && c.above.length > 1) return 'A';
  if (c.above.length === 0 || c.code === 'truth') return 'U';
  if (c.code) return c.code;
  return 'A';
}

/* ten equal divisions from `from`, a step of one place: places 1 is tenths, 3 thousandths, 0 ones, -1 tens */
export function subdivide(from, places) {
  const step = places >= 1 ? '0.' + '0'.repeat(places - 1) + '1' : '1' + '0'.repeat(-places);
  const ticks = [from];
  for (let i = 0; i < 10; i++) ticks.push(add(ticks[i], step));
  return ticks;
}

/* ZOOM (Mode 2): the loupe's path to a decimal. Level one is the rule 0 to 10 in ones when the value is 1 or more, else the rule 0
   to 1 in tenths; each deeper level opens the division the value lies in, ten more divisions, until the value's last place. At
   each level `index` is the division the value lies in (the value is at or after tick index and before tick index + 1). */
export function zoomPath(value) {
  const { whole, places } = parse(value);
  const out = [];
  let from = '0', p = 1;
  if (whole > 0n) {
    out.push({ from: '0', places: 0, index: Number.parseInt(whole.toString(), 10) });
    from = whole.toString();
  }
  for (; p <= places.length; p++) {
    const digit = places.charCodeAt(p - 1) - 48;
    out.push({ from, places: p, index: digit });
    from = add(from, (p === 1 ? '0.' : '0.' + '0'.repeat(p - 1)) + digit);
  }
  return out;
}

export function scoreZoom(value, path) {
  const want = zoomPath(value);
  return { correct: path.length === want.length && path.every((x, i) => x === want[i].index) };
}

/* SAME VALUE (Mode 4): six pairs that differ only by zeros after the last digit (the same value) and six where a zero is moved in
   among the places (a different value), in a seeded order. A child holding the zero rule calls every trailing pair different. */
const TRAILING = Object.freeze([['0.5', '0.50'], ['2.3', '2.300'], ['0.40', '0.4'], ['1.25', '1.250'], ['0.7', '0.700'], ['3.60', '3.6'], ['0.9', '0.90'], ['4.1', '4.10']]);
/* ⛔ 0.08 vs 0.080 was in this list: a zero among the places on both sides, so the zero rule calls it the same and it separates
   nothing (the SAME VALUE law caught it); every trailing pair has a zero on one side only */
const INNER = Object.freeze([['0.5', '0.05'], ['0.37', '0.307'], ['1.4', '1.04'], ['0.6', '0.06'], ['2.25', '2.205'], ['0.9', '0.09'], ['3.8', '3.08'], ['0.45', '0.405']]);
export function dealSame(r) {
  const pick = (list, kind, answer) => shuffle(r, list).slice(0, 6).map(([a, b]) => (r() < 0.5 ? { left: a, right: b } : { left: b, right: a })).map(x => Object.assign(x, { kind, answer }));
  return shuffle(r, pick(TRAILING, 'trailing', 'same').concat(pick(INNER, 'inner', 'different')));
}
export function scoreSame(item, choice) {
  return { correct: choice === item.answer };
}

export function routeFrom(code) {
  return code === 'L' ? ['zoom'] : code === 'S' ? ['same', 'zoom'] : code === 'Z' ? ['same'] : code === 'A' ? ['compare'] : ['zoom'];
}
