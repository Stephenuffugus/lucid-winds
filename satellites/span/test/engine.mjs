#!/usr/bin/env node
/* SPAN's engine, asserted in Node against the shipped module (plans/span/HANDOFF-SPAN.md P0 step 1).
 *
 *   node test/engine.mjs
 *
 * The handoff's test gates 1 to 6 as laws, each on 20 seeds. ⛔ Nothing here trusts a label the
 * engine puts on an equation: the form, which side is which, whether an item is true, whether it is a
 * near miss, all are recomputed from the terms themselves. A gate that believed `isStandard` would
 * pass a generator that set the flag and not the layout.
 *
 * An equation is { mode, left: [terms], right: [terms], ... }, a term { n }, { op: '+' | '-' } or
 * { blank: true }.
 */
const fails = [];
const say = (ok, line) => { console.log((ok ? '  ok    ' : '  FAIL  ') + line); if (!ok) fails.push(line); };
const finish = () => {
  console.log('');
  if (fails.length) { console.log(fails.length + ' ENGINE FAILURE(S)'); process.exit(1); }
  console.log('ENGINE OK');
  process.exit(0);
};

let E = null;
try {
  E = await import('../engine.js');
} catch (e) {
  say(false, 'engine.js loads as an ES module (' + String(e && e.message || e).split('\n')[0] + ')');
  finish();
}
const { rng } = await import('../../math/core/pure.js');
const SEEDS = Array.from({ length: 20 }, (_, i) => 3000 + i * 7919);

/* ---- the terms, read without the engine ---- */
const side = (terms, fill) => {
  let acc = null, op = '+';
  for (const t of terms) {
    if (t.op) { op = t.op; continue; }
    const n = t.blank ? fill : t.n;
    acc = acc === null ? n : (op === '+' ? acc + n : acc - n);
  }
  return acc;
};
const hasBlank = eq => eq.left.concat(eq.right).some(t => t.blank);
const layoutStandard = eq => eq.right.length === 1 && eq.left.some(t => t.op);
const formOf = eq => {
  const letters = (terms, names) => {
    let k = 0;
    return terms.map(t => t.op ? t.op : (t.blank ? (k++, '_') : names[k++])).join('');
  };
  return letters(eq.left, ['a', 'b']) + '=' + letters(eq.right, ['c', 'd']);
};
const NINE = ['a+b=_+d', 'a+_=c+d', '_+b=c+d', 'a+b=c+_', '_=c+d', 'a=_+d', 'a-_=c', '_-b=c', 'a=c-_'];
const fillFor = eq => {
  for (let f = 0; f <= 5000; f++) if (side(eq.left, f) === side(eq.right, f)) return f;
  return null;
};
const numbers = eq => eq.left.concat(eq.right).filter(t => !t.op && !t.blank).map(t => t.n);

say(typeof E.generateSet === 'function' && typeof E.evaluate === 'function', 'engine.js exports generateSet and evaluate');
if (typeof E.generateSet !== 'function' || typeof E.evaluate !== 'function') finish();

/* gate 6: evaluate is right for every form, including a blank in the subtrahend */
{
  let wrong = 0, checked = 0, subtrahend = 0;
  const seen = new Set();
  for (const s of SEEDS) {
    const set = E.generateSet(rng(s), { mode: 'blank', size: 50 });
    for (const eq of set) {
      const f = fillFor(eq), form = formOf(eq);
      seen.add(form);
      if (form === 'a-_=c' || form === 'a=c-_') subtrahend++;
      checked++;
      if (f === null || E.evaluate(eq, f) !== true || E.evaluate(eq, f + 1) !== false) wrong++;
    }
  }
  say(wrong === 0 && subtrahend > 0, 'evaluate is right for every form it is given (' + checked + ' items, ' + wrong + ' wrong, '
    + subtrahend + ' with the blank in the subtrahend)');
}

/* gate 1, S1: 38 to 42 percent standard, never more than 3 in a row of one kind, across 500 sets */
{
  let outside = 0, streaks = 0, sets = 0;
  for (const s of SEEDS) {
    const r = rng(s);
    for (let k = 0; k < 25; k++) {
      const mode = k % 2 ? 'judge' : 'blank', set = E.generateSet(r, { mode, size: 20 });
      sets++;
      const share = set.filter(layoutStandard).length / set.length;
      if (share < 0.38 || share > 0.42) outside++;
      let run = 1;
      for (let i = 1; i < set.length; i++) {
        run = layoutStandard(set[i]) === layoutStandard(set[i - 1]) ? run + 1 : 1;
        if (run > 3) { streaks++; break; }
      }
    }
  }
  say(outside === 0, 'every one of ' + sets + ' sets is 38 to 42 percent standard equations (' + outside + ' outside)');
  say(streaks === 0, 'and none has more than 3 of one kind in a row (' + streaks + ' sets do)');
}

/* gate 2, S2: all nine blank positions in any 50 item Mode 2 set, none over 20 percent */
{
  let missing = 0, heavy = 0, detail = '';
  for (const s of SEEDS) {
    const set = E.generateSet(rng(s), { mode: 'blank', size: 50 });
    const count = {};
    for (const eq of set) { const f = formOf(eq); count[f] = (count[f] || 0) + 1; }
    const absent = NINE.filter(f => !count[f]);
    if (absent.length) { missing++; detail = detail || absent.join(', '); }
    if (NINE.some(f => (count[f] || 0) > 10)) heavy++;
  }
  say(missing === 0, 'every 50 item Mode 2 set has all nine blank positions (' + missing + ' sets miss one' + (detail ? ': ' + detail : '') + ')');
  say(heavy === 0, 'and no position is more than 20 percent of a set (' + heavy + ')');
}

/* gates 3 and 4, S3 and S4, on Mode 1 TRUE OR NOT (no blank; truth read off the terms) */
{
  let lowTrue = 0, lowNear = 0, blanks = 0, worstTrue = 1, worstNear = 1;
  for (const s of SEEDS) {
    const set = E.generateSet(rng(s), { mode: 'judge', size: 20 });
    blanks += set.filter(hasBlank).length;
    const nonstandard = set.filter(eq => !layoutStandard(eq));
    const trueShare = nonstandard.filter(eq => side(eq.left) === side(eq.right)).length / Math.max(1, nonstandard.length);
    const falses = set.filter(eq => side(eq.left) !== side(eq.right));
    const nearShare = falses.filter(eq => Math.abs(side(eq.left) - side(eq.right)) === 1).length / Math.max(1, falses.length);
    worstTrue = Math.min(worstTrue, trueShare); worstNear = Math.min(worstNear, nearShare);
    if (trueShare < 0.6) lowTrue++;
    if (falses.length && nearShare < 0.25) lowNear++;
  }
  say(blanks === 0, 'a Mode 1 item has no blank (' + blanks + ')');
  say(lowTrue === 0, 'at least 60 percent of nonstandard Mode 1 items are true, on every seed (lowest ' + Math.round(worstTrue * 100) + ')');
  say(lowNear === 0, 'and near misses, sides one apart, are at least a quarter of the false ones (lowest ' + Math.round(worstNear * 100) + ')');
}

/* gate 5, S6: Mode 3 is hostile to computing from stage 2 */
{
  let small = 0, far = 0, items = 0;
  for (const s of SEEDS) {
    const set = E.generateSet(rng(s), { mode: 'relational', size: 20, stage: 2 });
    for (const eq of set) {
      items++;
      if (numbers(eq).some(n => n < 100)) small++;
      const L = eq.left.filter(t => !t.op), R = eq.right.filter(t => !t.op);
      const close = L.some((t, i) => R[i] && !t.blank && !R[i].blank && Math.abs(t.n - R[i].n) <= 3);
      if (!close) far++;
    }
  }
  say(small === 0, 'every Mode 3 number at stage 2 has at least three digits (' + small + ' of ' + items + ' items do not)');
  say(far === 0, 'and each item pairs two numbers across the sign at most 3 apart (' + far + ' do not)');
}

/* handoff section 7: the first item, then something nonstandard at once */
{
  const set = E.generateSet(rng(SEEDS[0]), { mode: 'blank', size: 20, first: true });
  const a = set[0];
  const isFirst = a && a.left.length === 3 && a.left[0].n === 3 && a.left[1].op === '+' && a.left[2].blank
    && a.right.length === 1 && a.right[0].n === 5;
  say(isFirst, 'the first item is 3 + __ = 5 (' + (a ? formOf(a) : 'none') + ')');
  say(!!set[1] && !layoutStandard(set[1]), 'and the second is nonstandard (' + (set[1] ? formOf(set[1]) : 'none') + ')');
}

/* nothing negative, anywhere, in any mode */
{
  let negative = 0;
  for (const s of SEEDS) for (const mode of ['blank', 'judge', 'relational']) {
    for (const eq of E.generateSet(rng(s), { mode, size: 20, stage: 2 })) {
      if (numbers(eq).some(n => n < 0)) negative++;
      if (hasBlank(eq)) { const f = fillFor(eq); if (f === null || f < 0) negative++; }
    }
  }
  say(negative === 0, 'no number and no blank is ever negative (' + negative + ')');
}

/* the same seed gives the same set, and a different one does not */
{
  const a = JSON.stringify(E.generateSet(rng(11), { mode: 'blank', size: 20 }));
  const b = JSON.stringify(E.generateSet(rng(11), { mode: 'blank', size: 20 }));
  const c = JSON.stringify(E.generateSet(rng(12), { mode: 'blank', size: 20 }));
  say(a === b && a !== c, 'the same seed gives the same set and another seed another');
}

finish();
