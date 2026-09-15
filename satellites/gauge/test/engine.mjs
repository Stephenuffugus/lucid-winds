#!/usr/bin/env node
/* GAUGE P0: the predictors, the sets and the classification (plans/gauge/HANDOFF-GAUGE.md 3.2 to 3.4 and 3.6; the handoff's
 * sections 3, 4 and 8).
 *
 *   node test/engine.mjs
 *
 * Every count is a law proved on 20 seeds. Asserted, each watched to fail on a planted fault:
 *   1. the predictors give the handoff's table: L, S and truth on its seven pairs; and 3.3's zero rule Z (a zero anywhere among the
 *      places makes a number small) on 0.5 vs 0.50, 0.705 vs 0.7, 0.60 vs 0.58 and 0.03 vs 0.125
 *   2. GA2, GA3 and 3.4: every set of twenty opens with 0.7 against 0.2, and holds at least four items only L gets wrong, four only
 *      S gets wrong, two only Z gets wrong, two equal value pairs, two apparent expert traps, and ten or more discriminating items
 *   3. GA1 and 3.2: on every generated set a pure L, S or Z responder is coded as its rule and a truthful one U; no responder is
 *      coded before twelve answers
 *   4. 3.2: an L responder who scores 80 percent or more on a set is never coded U; on a constructed set with one L separator
 *      among fifteen discriminating items an L responder is coded A
 *   5. GA4 and 3.6: subdivide gives exactly eleven ticks, ten equal divisions, at tenths, hundredths and thousandths and zoomed
 *      out to ones and tens, every tick a decimal string
 *   6. routeFrom sends L to ZOOM, S to SAME VALUE then ZOOM, A to more comparisons, U to ZOOM
 *   7. a seed replays its sets and another seed gives others; engine.js names no parseFloat, Number( or Math.random and touches no
 *      screen or clock
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const GAUGE = join(dirname(fileURLToPath(import.meta.url)), '..');
const fails = [];
const say = (ok, line) => { console.log((ok ? '  ok    ' : '  FAIL  ') + line); if (!ok) fails.push(line); };
let E = null, D = null, P = null;
try { E = await import('../engine.js'); D = await import('../decimal.js'); P = await import('../../math/core/pure.js'); say(true, 'engine.js and decimal.js load as ES modules'); }
catch (e) { say(false, 'engine.js and decimal.js load as ES modules (' + e.message.split('\n')[0] + ')'); }

const SEEDS = Array.from({ length: 20 }, (_, i) => 8000 + i * 7919);
const it = (left, right) => ({ left, right });
const alone = (x, rule) => { const t = E.predict.truth(x), wrong = r => E.predict[r](x) !== t; return wrong(rule) && ['L', 'S', 'Z'].filter(r => r !== rule).every(r => !wrong(r)); };
const disc = x => new Set(['L', 'S', 'Z', 'truth'].map(r => E.predict[r](x))).size > 1;

if (E && D && P) {
  /* 1 */
  {
    const table = [[it('0.125', '0.3'), 'right', 'left', 'right'], [it('0.3', '0.496'), 'right', 'right', 'left'], [it('0.4', '0.35'), 'left', 'right', 'left'], [it('5.736', '5.62'), 'left', 'left', 'right'],
      /* ⛔ the handoff's table gives L 0.4 and S 0.05 here, the two columns swapped: under its own rules the longer, 0.05, is L's and
         the shorter, 0.4, is S's (the plan's 3.12; its next row, 2.6 vs 2.06, follows the rules) */
      [it('0.05', '0.4'), 'right', 'left', 'right'], [it('0.5', '0.50'), 'same', 'right', 'left'], [it('2.6', '2.06'), 'left', 'right', 'left']];
    const bad = table.filter(([x, t, l, s]) => E.predict.truth(x) !== t || E.predict.L(x) !== l || E.predict.S(x) !== s).map(([x, t, l, s]) => x.left + ' vs ' + x.right + ' gave ' + [E.predict.truth(x), E.predict.L(x), E.predict.S(x)].join('/') + ' for ' + [t, l, s].join('/'));
    const z = [[it('0.5', '0.50'), 'left'], [it('0.705', '0.7'), 'right'], [it('0.60', '0.58'), 'right'], [it('0.03', '0.125'), 'right']];
    z.forEach(([x, w]) => { if (E.predict.Z(x) !== w) bad.push('Z on ' + x.left + ' vs ' + x.right + ' gave ' + E.predict.Z(x) + ' for ' + w); });
    say(bad.length === 0, 'the predictors give the handoff\'s table for L, S and truth, and the zero rule Z of 3.3' + (bad.length ? ': ' + bad.join('; ') : ''));
  }
  /* 2 */
  {
    const bad = [];
    for (const seed of SEEDS) {
      const r = P.rng(seed >>> 0);
      for (let k = 0; k < 10; k++) {
        const set = E.generateComparisonSet(r);
        const counts = { L: set.filter(x => alone(x, 'L')).length, S: set.filter(x => alone(x, 'S')).length, Z: set.filter(x => alone(x, 'Z')).length, same: set.filter(x => E.predict.truth(x) === 'same').length, trap: set.filter(x => x.trap === 'expert').length, disc: set.filter(disc).length };
        if (set.length !== 20 || set[0].left !== '0.7' || set[0].right !== '0.2' || counts.L < 4 || counts.S < 4 || counts.Z < 2 || counts.same < 2 || counts.trap < 2 || counts.disc < 10) bad.push(seed + '/' + k + ' ' + JSON.stringify(Object.assign({ n: set.length, first: set[0].left + ' vs ' + set[0].right }, counts)));
        for (const x of set.filter(x => x.trap === 'expert')) if (!(E.predict.L(x) === E.predict.truth(x) && E.predict.S(x) !== E.predict.truth(x))) bad.push(seed + ' trap ' + x.left + ' vs ' + x.right + ' is not L right and S wrong');
      }
    }
    say(bad.length === 0, 'every set of twenty opens with 0.7 vs 0.2 and holds four L separators, four S, two Z, two equal pairs, two expert traps, ten discriminating, on 20 seeds' + (bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''));
  }
  /* 3, 4 */
  {
    const bad = [];
    for (const seed of SEEDS) {
      const set = E.generateComparisonSet(P.rng(seed >>> 0));
      for (const [rule, want] of [['L', 'L'], ['S', 'S'], ['Z', 'Z'], ['truth', 'U']]) {
        const responses = set.map(item => ({ item, answer: E.predict[rule](item) }));
        const early = E.classifyRun(responses.slice(0, 11)), code = E.classifyRun(responses);
        if (early !== null) bad.push(seed + ' ' + rule + ' coded ' + early + ' after eleven');
        if (code !== want) bad.push(seed + ' ' + rule + ' coded ' + code + ' for ' + want);
        const acc = responses.filter(x => x.answer === E.predict.truth(x.item)).length / set.length;
        if (rule === 'L' && acc >= 0.8 && code === 'U') bad.push(seed + ' L at ' + acc + ' coded U');
      }
    }
    /* a set that fails to separate L: one L separator (0.125 vs 0.3), eight items only S gets wrong, six only Z gets wrong, five
       plain; fifteen discriminating, so an L responder matches truth on fourteen of them */
    const weak = [it('0.7', '0.2'), it('0.125', '0.3'), it('0.3', '0.496'), it('0.45', '0.625'), it('2.5', '2.625'), it('0.8', '0.925'), it('5.736', '5.62'), it('0.375', '0.25'), it('3.84', '3.7'), it('1.35', '1.475'),
      it('0.60', '0.58'), it('0.705', '0.698'), it('2.30', '2.25'), it('0.40', '0.35'), it('4.20', '4.15'), it('0.9', '0.4'), it('3.2', '1.8'), it('4.1', '4.7'), it('0.36', '0.58'), it('6.50', '6.45')];
    const weakL = E.classifyRun(weak.map(item => ({ item, answer: E.predict.L(item) })));
    const weakAcc = weak.filter(x => E.predict.L(x) === E.predict.truth(x)).length / weak.length;
    say(bad.length === 0, 'on every generated set pure L, S and Z responders are coded as their rules and a truthful one U, never before twelve answers, and an L responder at 80 percent or more is never U, on 20 seeds' + (bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''));
    say(weakL === 'A' && weakAcc >= 0.9, '3.2: on a set with one L separator among its discriminating items an L responder scoring ' + (weakAcc * 100).toFixed(0) + ' percent is coded A, the set failed (' + weakL + ')');
  }
  /* 5 */
  {
    const bad = [];
    const cases = [['0', 1, '0', '1'], ['0.3', 2, '0.3', '0.4'], ['0.12', 3, '0.12', '0.13'], ['0', 0, '0', '10'], ['0', -1, '0', '100'], ['2.06', 3, '2.06', '2.07']];
    for (const [from, places, first, last] of cases) {
      const ticks = E.subdivide(from, places);
      if (!Array.isArray(ticks) || ticks.length !== 11 || ticks[0] !== first || D.compare(ticks[10], last) !== 0) { bad.push(from + ' at ' + places + ' gave ' + JSON.stringify(ticks)); continue; }
      const steps = ticks.slice(1).map((t, i) => D.subtract(t, ticks[i]));
      if (new Set(steps.map(s => D.rational(s).num * 1000000n / D.rational(s).den)).size !== 1) bad.push(from + ' at ' + places + ' steps ' + JSON.stringify(steps));
      if (ticks.some(t => typeof t !== 'string')) bad.push(from + ' ticks are not strings');
    }
    say(bad.length === 0, 'GA4: subdivide gives eleven ticks, ten equal divisions, at tenths, hundredths, thousandths and zoomed out to ones and tens' + (bad.length ? ': ' + bad.join('; ') : ''));
  }
  /* 6 */
  {
    const got = ['L', 'S', 'A', 'U'].map(c => JSON.stringify(E.routeFrom(c)));
    say(JSON.stringify(got) === JSON.stringify(['["zoom"]', '["same","zoom"]', '["compare"]', '["zoom"]']), 'routeFrom: L to ZOOM, S to SAME VALUE then ZOOM, A to more comparisons, U to ZOOM (' + got.join(' ') + ')');
  }
  /* 7 */
  {
    const a = JSON.stringify(E.generateComparisonSet(P.rng(42))), b = JSON.stringify(E.generateComparisonSet(P.rng(42))), c = JSON.stringify(E.generateComparisonSet(P.rng(43)));
    say(a === b && a !== c, 'a seed replays its set and another seed gives another');
    let src = null;
    try { src = readFileSync(join(GAUGE, 'engine.js'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, ''); } catch (e) { src = null; }
    const names = src === null ? ['(no file)'] : ['parseFloat', 'document', 'window', 'Date', 'performance'].filter(w => new RegExp('\\b' + w + '\\b').test(src))
      .concat(/\bNumber\(/.test(src) ? ['Number('] : []).concat(/Math\.random/.test(src) ? ['Math.random'] : []);
    say(names.length === 0, 'engine.js names no parseFloat, Number( or Math.random, and touches no screen or clock' + (names.length ? ': it names ' + names.join(', ') : ''));
  }
}

console.log('');
if (fails.length) { console.log(fails.length + ' ENGINE FAILURE(S)'); process.exit(1); }
console.log('ENGINE OK');
