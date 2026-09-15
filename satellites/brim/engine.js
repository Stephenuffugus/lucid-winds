/* BRIM's rules (plans/brim/HANDOFF-BRIM.md sections 3 and 4). Pure: no screen, no clock, no unseeded die; every draw comes
 * from the rng a caller hands in, so Node replays a seed.
 *
 *   features(pair)        every case a pair's numbers have (3.2)
 *   scoreChoice(pair, s)  the larger side by value, and whether the tapped side is it
 *   equivalentsOf(f)      every equal fraction by a split that keeps the denominator at 12 or less (3.6)
 *   dealSession(r, opts)  twelve rounds with B2, B3, B6 and B9 built in, never left to chance (3.3, 3.4)
 */
import { PAIR_BANK } from './pairs.js?v=20260916b';
import { GRADE_DENOMINATORS } from '../crease/bank.js?v=20260916b';

export const SESSION_LENGTH = 12;
const MAX_DENOMINATOR = 12;

export function features({ left, right }) {
  const a = left.n / left.d, b = right.n / right.d;
  if (a === b) return ['equivalent'];
  const out = [];
  if (left.d === right.d) out.push('same-denominator');
  if (left.n === right.n) out.push('same-numerator');
  const side = (a - 0.5) * (b - 0.5);
  if (side < 0) out.push('straddle-half');
  if (side > 0) out.push('same-side-half');
  /* residual: both over a half and each within a quarter of the brim, so what is missing is the quick comparison */
  if (a > 0.5 && b > 0.5 && 1 - a <= 0.25 && 1 - b <= 0.25) out.push('residual');
  if (left.d - left.n === right.d - right.n) out.push('gap-trap');
  return out;
}

export function scoreChoice(pair, side) {
  const a = pair.left.n / pair.left.d, b = pair.right.n / pair.right.d;
  const larger = a > b ? 'left' : a < b ? 'right' : 'same';
  return { correct: side === larger, larger };
}

export function equivalentsOf({ n, d }, { maxDenominator = MAX_DENOMINATOR } = {}) {
  const out = [];
  for (let k = 2; d * k <= maxDenominator; k++) out.push({ n: n * k, d: d * k, k });
  return out;
}

/* the modes' pools: what each mode may serve at a grade, and in HALF whether same side pairs have come (its streak) */
function poolFor(mode, grade, sameSideOpen) {
  const atGrade = PAIR_BANK.filter(p => grade === 3 ? p.grade === 3 : p.grade <= grade);
  if (mode === 'half') return atGrade.filter(p => sameSideOpen || !features(p).includes('same-side-half'));
  if (mode === 'brim') return atGrade.filter(p => p.left.n / p.left.d > 0.5 && p.right.n / p.right.d > 0.5);
  return atGrade;
}

const shuffle = (r, list) => { const a = list.slice(); for (let i = a.length - 1; i > 0; i--) { const j = r.int(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const same = (p, q) => !!p && !!q && p.left.n === q.left.n && p.left.d === q.left.d && p.right.n === q.right.n && p.right.d === q.right.d;

/* B3: six of twelve with the larger on the left, no side three running and the first two different, so no join of two
   sessions can run four */
function sides(r) {
  for (let t = 0; t < 200; t++) {
    const s = shuffle(r, ['left', 'left', 'left', 'left', 'left', 'left', 'right', 'right', 'right', 'right', 'right', 'right']);
    let ok = s[0] !== s[1];
    for (let i = 2; ok && i < s.length; i++) if (s[i] === s[i - 1] && s[i] === s[i - 2]) ok = false;
    if (ok) return s;
  }
  return Array.from({ length: SESSION_LENGTH }, (_, i) => (i % 2 ? 'right' : 'left'));
}

/* B6: two or three gap traps, never the first round, never adjacent */
function gapSlots(r) {
  const want = 2 + (r() < 0.5 ? 1 : 0);
  for (let t = 0; t < 200; t++) {
    const at = shuffle(r, Array.from({ length: SESSION_LENGTH - 1 }, (_, i) => i + 1)).slice(0, want).sort((a, b) => a - b);
    if (at.every((i, k) => !k || i > at[k - 1] + 1)) return at;
  }
  return [2, 6, 10].slice(0, want);
}

/* LEVEL: a target of halves, thirds or fourths and the split that makes it equal; half the splits or more not doubling */
function levelSession(r, grade) {
  const targets = [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4]].map(([n, d]) => ({ n, d }));
  const fits = (target, k) => target.d * k <= MAX_DENOMINATOR && (grade !== 3 || GRADE_DENOMINATORS[3].includes(target.d * k));
  const all = [];
  for (const t of targets) for (const e of equivalentsOf(t)) if (fits(t, e.k)) all.push({ target: t, split: e.k });
  const notDoubling = all.filter(c => ![2, 4, 8].includes(c.split));
  const slots = shuffle(r, Array.from({ length: SESSION_LENGTH }, (_, i) => i < 7));
  const out = [];
  for (const wantOdd of slots) {
    const from = wantOdd && notDoubling.length ? notDoubling : all;
    let c = from[r.int(from.length)];
    for (let t = 0; t < 10 && out.length && out[out.length - 1].target.n === c.target.n && out[out.length - 1].target.d === c.target.d && out[out.length - 1].split === c.split; t++) c = from[r.int(from.length)];
    out.push({ mode: 'level', target: c.target, split: c.split, want: { n: c.target.n * c.split, d: c.target.d * c.split } });
  }
  return out;
}

export function dealSession(r, { mode = 'matching', grade = 3, session = 0, sameSideOpen = false } = {}) {
  if (mode === 'level') return levelSession(r, grade);
  const pool = poolFor(mode, grade, sameSideOpen);
  const traps = pool.filter(p => p.tag === 'gap-trap');
  const kinds = Array.from(new Set(pool.filter(p => p.tag !== 'gap-trap').map(p => p.tag)));
  const types = new Array(SESSION_LENGTH).fill(null);
  if (traps.length) for (const i of gapSlots(r)) types[i] = 'gap-trap';
  const opening = mode === 'matching' && session === 0;
  if (opening) types[0] = 'same-denominator';
  /* B2: a case never two rounds running within a session, so a join of two sessions runs at most two */
  for (let i = 0; i < SESSION_LENGTH; i++) {
    if (types[i]) continue;
    const near = [types[i - 1], types[i + 1]];
    const free = kinds.filter(k => !near.includes(k));
    const from = free.length ? free : kinds;
    types[i] = from[r.int(from.length)];
  }
  const side = sides(r);
  const out = [];
  for (let i = 0; i < SESSION_LENGTH; i++) {
    let p;
    if (i === 0 && opening) p = PAIR_BANK.find(q => q.left.n === 1 && q.left.d === 8 && q.right.n === 7 && q.right.d === 8);
    else {
      const from = pool.filter(q => q.tag === types[i]);
      p = from[r.int(from.length)];
      for (let t = 0; t < 10 && from.length > 1 && same(p, out[i - 1] && out[i - 1].bank); t++) p = from[r.int(from.length)];
    }
    const a = p.left.n / p.left.d, b = p.right.n / p.right.d;
    const flip = (a > b ? 'left' : 'right') !== side[i];
    const left = flip ? p.right : p.left, right = flip ? p.left : p.right;
    out.push({ mode, left, right, tag: p.tag, caseType: p.tag, features: features({ left, right }), grade: p.grade, bank: p });
  }
  return out;
}
