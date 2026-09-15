/* SPAN's engine: the sim (plans/span/HANDOFF-SPAN.md section 4).
 *
 * Pure. Nothing here names document, window, Date, performance, Math.random or a timer; every
 * random choice is drawn from the rng handed in (CORE's pure.js rng), so a gate can replay any set.
 * The page and the Node gates import this one file.
 *
 * An equation is { mode, form, isStandard, left, right, blankValue, truth, nearMiss }, where left and
 * right are term lists: { n } a number, { op: '+' | '-' } an operation, { blank: true } the blank.
 */

const num = n => ({ n });
const plus = () => ({ op: '+' });
const minus = () => ({ op: '-' });
const blank = () => ({ blank: true });
const between = (r, lo, hi) => lo + r.int(hi - lo + 1);
const shuffle = (r, list) => {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = r.int(i + 1); const t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
};

/* S2: the nine blank positions of the handoff's section 2, and the standard layouts beside them */
export const NINE_POSITIONS = Object.freeze(['a+b=_+d', 'a+_=c+d', '_+b=c+d', 'a+b=c+_', '_=c+d', 'a=_+d', 'a-_=c', '_-b=c', 'a=c-_']);
const STANDARD_BLANKS = Object.freeze(['a+b=_', 'a+_=c', '_+b=c', 'a-b=_', 'a-_=c', '_-b=c']);
const NONSTANDARD_BLANKS = Object.freeze(NINE_POSITIONS.filter(f => STANDARD_BLANKS.indexOf(f) < 0));
const STANDARD_JUDGE = Object.freeze(['a+b=c', 'a-b=c']);
const NONSTANDARD_JUDGE = Object.freeze(['a+b=c+d', 'a=c+d', 'a=c']);
const RELATIONAL = Object.freeze(['a+b=c+_', 'a+_=c+d', '_+b=c+d']);
export const EQUATION_FORMS = Object.freeze(STANDARD_BLANKS.concat(NONSTANDARD_BLANKS, STANDARD_JUDGE, NONSTANDARD_JUDGE, RELATIONAL)
  .filter((f, i, all) => all.indexOf(f) === i));

/* ---- reading an equation ---- */
export function valueOf(terms, fill) {
  let acc = null, op = '+';
  for (const t of terms) {
    if (t.op) { op = t.op; continue; }
    const n = t.blank ? fill : t.n;
    acc = acc === null ? n : (op === '+' ? acc + n : acc - n);
  }
  return acc;
}
/* true when the two sides are the same value with `fill` in the blank (a judged item has no blank) */
export function evaluate(eq, fill) { return valueOf(eq.left, fill) === valueOf(eq.right, fill); }
export function isStandardLayout(eq) { return eq.right.length === 1 && eq.left.some(t => t.op); }

const RANGE = stage => stage >= 3 ? [5, 50] : stage === 2 ? [2, 20] : [1, 9];

/* ---- Mode 2 THE BLANK ---- */
/* Every form is built from its value outward, so a blank and every number stays at zero or above. */
function blankEquation(r, form, stage) {
  const [lo, hi] = RANGE(stage), a = between(r, lo, hi), b = between(r, lo, hi);
  const make = (left, right, blankValue) => ({ left, right, blankValue });
  switch (form) {
    case 'a+b=_': return make([num(a), plus(), num(b)], [blank()], a + b);
    case 'a+_=c': { const c = a + between(r, 1, hi); return make([num(a), plus(), blank()], [num(c)], c - a); }
    case '_+b=c': { const c = b + between(r, 1, hi); return make([blank(), plus(), num(b)], [num(c)], c - b); }
    case 'a-b=_': return make([num(a + b), minus(), num(b)], [blank()], a);
    case 'a-_=c': return make([num(a + b), minus(), blank()], [num(a)], b);
    case '_-b=c': return make([blank(), minus(), num(b)], [num(a)], a + b);
    case 'a+b=_+d': { const t = a + b, d = between(r, 1, t - 1); return make([num(a), plus(), num(b)], [blank(), plus(), num(d)], t - d); }
    case 'a+_=c+d': { const t = a + b, x = between(r, 1, t - 1); return make([num(x), plus(), blank()], [num(a), plus(), num(b)], t - x); }
    case '_+b=c+d': { const t = a + b, y = between(r, 1, t - 1); return make([blank(), plus(), num(y)], [num(a), plus(), num(b)], t - y); }
    case 'a+b=c+_': { const t = a + b, c = between(r, 1, t - 1); return make([num(a), plus(), num(b)], [num(c), plus(), blank()], t - c); }
    case '_=c+d': return make([blank()], [num(a), plus(), num(b)], a + b);
    case 'a=_+d': { const t = a + b, d = between(r, 1, t - 1); return make([num(t)], [blank(), plus(), num(d)], t - d); }
    case 'a=c-_': return make([num(a)], [num(a + b), minus(), blank()], b);
    default: throw new Error('span: no blank form ' + form);
  }
}

/* ---- Mode 1 TRUE OR NOT ---- */
/* A true equation is built, and a false one is that equation with its last number raised: by one for
   a near miss (the sides one apart, which looks balanced), by three to six otherwise. Raised, never
   lowered, so nothing goes below zero. */
function judgeEquation(r, shape, truth, near, stage) {
  const [lo, hi] = RANGE(stage), a = between(r, lo, hi), b = between(r, lo, hi);
  let left, right;
  switch (shape) {
    case 'a+b=c': left = [num(a), plus(), num(b)]; right = [num(a + b)]; break;
    case 'a-b=c': left = [num(a + b), minus(), num(b)]; right = [num(a)]; break;
    case 'a+b=c+d': { const t = a + b, c = between(r, 1, t - 1); left = [num(a), plus(), num(b)]; right = [num(c), plus(), num(t - c)]; break; }
    case 'a=c+d': left = [num(a + b)]; right = [num(a), plus(), num(b)]; break;
    case 'a=c': left = [num(a)]; right = [num(a)]; break;
    default: throw new Error('span: no judged shape ' + shape);
  }
  if (!truth) right[right.length - 1].n += near ? 1 : between(r, 3, 6);
  return { left, right, blankValue: null, truth, nearMiss: !truth && near };
}

/* ---- Mode 3 RELATIONAL ---- */
/* S6: from stage 2 every number has three digits and one pair across the sign is 1 to 3 apart, so the
   way through is to compare, not to add. */
function relationalEquation(r, form, stage) {
  const lo = stage >= 2 ? 103 : 13, hi = stage >= 2 ? 896 : 86;
  const k = between(r, 1, 3) * (r() < 0.5 ? 1 : -1);
  const a = between(r, lo, hi), b = between(r, lo, hi), d = between(r, lo, hi);
  switch (form) {
    case 'a+b=c+_': return { left: [num(a), plus(), num(b)], right: [num(a + k), plus(), blank()], blankValue: b - k };
    case 'a+_=c+d': return { left: [num(a), plus(), blank()], right: [num(a + k), plus(), num(d)], blankValue: d + k };
    case '_+b=c+d': return { left: [blank(), plus(), num(b)], right: [num(a), plus(), num(b + k)], blankValue: a + k };
    default: throw new Error('span: no relational form ' + form);
  }
}

/* ---- S1: the kinds in a set ---- */
/* Blocks of five, three nonstandard and two standard, so every set is exactly 40 percent standard; a
   block is redrawn when it would join a run of four, and a block that starts with the other kind always
   exists, so no run passes three. `first` makes the set open standard then nonstandard (handoff 7). */
const BLOCKS = ['NNNSS', 'NNSNS', 'NNSSN', 'NSNNS', 'NSNSN', 'NSSNN', 'SNNNS', 'SNNSN', 'SNSNN', 'SSNNN'];
function kindSequence(r, size, first) {
  if (size % 5 !== 0) throw new Error('span: a set is a whole number of blocks of five, not ' + size);
  const out = [];
  const longest = seq => { let best = 1, run = 1; for (let i = 1; i < seq.length; i++) { run = seq[i] === seq[i - 1] ? run + 1 : 1; best = Math.max(best, run); } return best; };
  for (let blockIndex = 0; blockIndex < size / 5; blockIndex++) {
    let pick = null;
    const pool = blockIndex === 0 && first ? BLOCKS.filter(p => p.startsWith('SN')) : BLOCKS;
    for (let tries = 0; tries < 12 && pick === null; tries++) {
      const p = pool[r.int(pool.length)];
      if (longest(out.concat(p.split(''))) <= 3) pick = p;
    }
    if (pick === null) {
      const last = out[out.length - 1];
      pick = pool.find(p => p[0] !== last && longest(out.concat(p.split(''))) <= 3) || pool[0];
    }
    out.push(...pick.split(''));
  }
  return out.map(k => k === 'S');
}

/* forms for `count` slots: the required ones first, then the pool cycled in a shuffled order */
function formsFor(r, required, pool, count) {
  const list = required.slice(0, count);
  let order = shuffle(r, pool), i = 0;
  while (list.length < count) {
    if (i === order.length) { order = shuffle(r, pool); i = 0; }
    list.push(order[i++]);
  }
  return shuffle(r, list);
}

export function generateSet(r, { mode, size, stage = 1, first = false }) {
  if (mode === 'relational') {
    return formsFor(r, [], RELATIONAL, size).map(form =>
      Object.assign({ mode, form, isStandard: false, truth: null, nearMiss: false }, relationalEquation(r, form, stage)));
  }
  const kinds = kindSequence(r, size, first);
  const nS = kinds.filter(Boolean).length, nN = size - nS;
  let items;
  if (mode === 'blank') {
    const std = formsFor(r, ['a-_=c', '_-b=c'], STANDARD_BLANKS, nS), non = formsFor(r, [], NONSTANDARD_BLANKS, nN);
    let s = 0, n = 0;
    items = kinds.map(isStd => {
      const form = isStd ? std[s++] : non[n++];
      return Object.assign({ mode, form, isStandard: isStd, truth: null, nearMiss: false }, blankEquation(r, form, stage));
    });
  } else if (mode === 'judge') {
    const std = formsFor(r, [], STANDARD_JUDGE, nS), non = formsFor(r, [], NONSTANDARD_JUDGE, nN);
    /* S3: three quarters of the nonstandard items true; half the standard ones */
    const truthNon = shuffle(r, Array.from({ length: nN }, (_, i) => i < Math.ceil(nN * 0.75)));
    const truthStd = shuffle(r, Array.from({ length: nS }, (_, i) => i < Math.ceil(nS / 2)));
    let s = 0, n = 0;
    const slots = kinds.map(isStd => isStd ? { isStd, form: std[s], truth: truthStd[s++] } : { isStd, form: non[n], truth: truthNon[n++] });
    /* S4: at least half of the false items are near misses */
    const falseSlots = shuffle(r, slots.filter(x => !x.truth));
    falseSlots.forEach((x, i) => { x.near = i < Math.ceil(falseSlots.length / 2); });
    items = slots.map(x => Object.assign({ mode, form: x.form, isStandard: x.isStd }, judgeEquation(r, x.form, x.truth, !!x.near, stage)));
  } else {
    throw new Error('span: no mode ' + mode);
  }
  if (first && mode === 'blank') {
    items[0] = { mode, form: 'a+_=c', isStandard: true, truth: null, nearMiss: false,
      left: [num(3), plus(), blank()], right: [num(5)], blankValue: 2 };
  }
  return items;
}
