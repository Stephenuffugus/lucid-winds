#!/usr/bin/env node
/* BRIM P0: the engine's laws (plans/brim/HANDOFF-BRIM.md sections 3 and 4; the handoff's section 5 test gates).
 *
 *   node test/engine.mjs
 *
 * Every count is a law proved on 20 seeds. Asserted, each watched to fail on a planted fault:
 *   1. features() reads a pair's cases from its numbers alone (hand checked pairs)
 *   2. scoreChoice: the larger side by value, correct only when the tapped side is it, over every bank pair both ways
 *   3. B2: no case type three rounds running over 200 rounds of back to back sessions, in every mode and grade
 *   4. B3: the larger on the left 48 to 52 percent of 500 rounds, never four running across session joins
 *   5. B4: every pair a grade 3 or 4 run serves has denominators of 12 or less, over 10,000 pairs; grade 3 serves only the
 *      same numerator or the same denominator on {2, 3, 4, 6, 8}
 *   6. B6: every twelve round session of MATCHING, HALF and BRIM at grades 4 and 5 holds two or more gap traps, never
 *      adjacent, never round one (grade 3 has none: 3.16)
 *   7. HALF before its streak serves no pair on one side of a half; after it, same side pairs come
 *   8. round one of a first MATCHING session is 1/8 vs 7/8
 *   9. equivalentsOf is every equal fraction by a split that keeps the denominator at 12 or less
 *  10. B9: at least half of LEVEL's split targets need a split that is not doubling, and every split is exact
 *  11. a seed replays its sessions and another seed gives others
 *  12. engine.js and pairs.js touch no screen, clock or unseeded die
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rng } from '../../math/core/pure.js';
import { GRADE_DENOMINATORS } from '../../crease/bank.js';

const BRIM = join(dirname(fileURLToPath(import.meta.url)), '..');
const fails = [];
const say = (ok, line) => { console.log((ok ? '  ok    ' : '  FAIL  ') + line); if (!ok) fails.push(line); };
let E = null, P = null;
try { E = await import('../engine.js'); P = await import('../pairs.js'); say(true, 'engine.js and pairs.js load as ES modules'); } catch (e) { say(false, 'engine.js and pairs.js load as ES modules (' + e.message.split('\n')[0] + ')'); }

const SEEDS = Array.from({ length: 20 }, (_, i) => 3000 + i * 7919);
const value = f => f.n / f.d;
const text = f => f.n + '/' + f.d;
const run = (seed, mode, grade, sessions, extra = {}) => {
  const r = rng(seed >>> 0), out = [];
  for (let s = 0; s < sessions; s++) out.push(E.dealSession(r, Object.assign({ mode, grade, session: s }, extra)));
  return out;
};
const larger = p => value(p.left) > value(p.right) ? 'left' : value(p.left) < value(p.right) ? 'right' : 'same';

if (E && P) {
  /* 1 */
  {
    const want = [
      ['3/8', '5/8', ['same-denominator', 'straddle-half']],
      ['1/3', '1/8', ['same-numerator', 'same-side-half']],
      ['3/5', '5/7', ['same-side-half', 'gap-trap']],
      ['1/2', '6/7', ['gap-trap']],
      ['5/6', '7/8', ['same-side-half', 'residual', 'gap-trap']],
      ['3/4', '7/9', ['same-side-half', 'residual']],
      ['2/5', '5/8', ['straddle-half', 'gap-trap']],
      ['1/2', '2/4', ['equivalent']]
    ];
    const f = s => { const [n, d] = s.split('/').map(Number); return { n, d }; };
    const off = want.filter(([a, b, w]) => JSON.stringify([...E.features({ left: f(a), right: f(b) })].sort()) !== JSON.stringify([...w].sort()))
      .map(([a, b]) => a + ' vs ' + b + ' gave ' + E.features({ left: f(a), right: f(b) }).join(','));
    say(off.length === 0, 'features() reads a pair\'s cases from its numbers alone' + (off.length ? ': ' + off.join('; ') : ' (8 hand checked pairs)'));
  }
  /* 2 */
  {
    const bad = [];
    for (const p of P.PAIR_BANK) for (const side of ['left', 'right']) {
      const s = E.scoreChoice(p, side);
      if (s.larger !== larger(p) || s.correct !== (side === larger(p))) bad.push(text(p.left) + ' vs ' + text(p.right) + ' tapped ' + side + ' ' + JSON.stringify(s));
    }
    say(bad.length === 0, 'scoreChoice names the larger side by value and is correct only on it, every bank pair both ways' + (bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''));
  }
  /* 3, 4, 5, 6 */
  {
    const b2 = [], b3 = [], b4 = [], b6 = [];
    for (const seed of SEEDS) {
      for (const mode of ['matching', 'half', 'brim']) for (const grade of [3, 4, 5]) {
        if (mode !== 'matching' && grade === 3 && mode === 'brim') continue;
        const flat = run(seed, mode, grade, 17, { sameSideOpen: true }).flat();
        for (let i = 2; i < 200; i++) if (flat[i].caseType === flat[i - 1].caseType && flat[i].caseType === flat[i - 2].caseType) { b2.push(seed + ' ' + mode + ' grade ' + grade + ' round ' + i + ' ' + flat[i].caseType); break; }
      }
      const flat = run(seed, 'matching', 4, 42).flat().slice(0, 500);
      const left = flat.filter(p => larger(p) === 'left').length / flat.length;
      let runLen = 1, worst = 1;
      for (let i = 1; i < flat.length; i++) { runLen = larger(flat[i]) === larger(flat[i - 1]) ? runLen + 1 : 1; worst = Math.max(worst, runLen); }
      if (left < 0.48 || left > 0.52 || worst >= 4) b3.push(seed + ' left ' + (left * 100).toFixed(1) + ' percent, a run of ' + worst);
      for (const grade of [3, 4]) {
        const pairs = run(seed, 'matching', grade, 834).flat();
        const over = pairs.find(p => p.left.d > 12 || p.right.d > 12);
        const g3 = grade === 3 && pairs.find(p => !(p.left.n === p.right.n || p.left.d === p.right.d) || ![p.left.d, p.right.d].every(d => GRADE_DENOMINATORS[3].includes(d)));
        if (over) b4.push(seed + ' grade ' + grade + ' served ' + text(over.left) + ' vs ' + text(over.right));
        if (g3) b4.push(seed + ' grade 3 served ' + text(g3.left) + ' vs ' + text(g3.right));
      }
      for (const mode of ['matching', 'half', 'brim']) for (const grade of [4, 5]) {
        run(seed, mode, grade, 10).forEach((session, s) => {
          const at = session.map((p, i) => p.tag === 'gap-trap' ? i : -1).filter(i => i >= 0);
          if (at.length < 2 || at.includes(0) || at.some((i, k) => k && i === at[k - 1] + 1)) b6.push(seed + ' ' + mode + ' grade ' + grade + ' session ' + s + ' gap traps at ' + JSON.stringify(at));
        });
      }
    }
    say(b2.length === 0, 'B2: no case type three rounds running over 200 rounds, every mode and grade' + (b2.length ? ': ' + b2.slice(0, 3).join('; ') : ''));
    say(b3.length === 0, 'B3: the larger on the left 48 to 52 percent of 500 rounds, never four running' + (b3.length ? ': ' + b3.slice(0, 3).join('; ') : ''));
    say(b4.length === 0, 'B4: grades 3 and 4 serve denominators of 12 or less over 10,000 pairs, grade 3 only same numerator or denominator on its list' + (b4.length ? ': ' + b4.slice(0, 3).join('; ') : ''));
    say(b6.length === 0, 'B6: every session at grades 4 and 5 holds two or more gap traps, never adjacent, never first' + (b6.length ? ': ' + b6.slice(0, 3).join('; ') : ''));
  }
  /* 7 */
  {
    const bad = [];
    let opened = 0;
    for (const seed of SEEDS) for (const grade of [3, 4, 5]) {
      const shut = run(seed, 'half', grade, 10, { sameSideOpen: false }).flat();
      const side = shut.find(p => E.features(p).includes('same-side-half'));
      if (side) bad.push(seed + ' grade ' + grade + ' served ' + text(side.left) + ' vs ' + text(side.right) + ' before the streak');
      if (grade > 3) opened += run(seed, 'half', grade, 10, { sameSideOpen: true }).flat().filter(p => E.features(p).includes('same-side-half')).length;
    }
    say(bad.length === 0 && opened > 0, 'HALF before its streak serves no pair on one side of a half, and after it same side pairs come (' + opened + ' after)' + (bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''));
  }
  /* 8 */
  {
    const bad = [];
    for (const seed of SEEDS) for (const grade of [3, 4, 5]) {
      const first = E.dealSession(rng(seed >>> 0), { mode: 'matching', grade, session: 0 })[0];
      const names = [text(first.left), text(first.right)].sort().join(' ');
      if (names !== '1/8 7/8') bad.push(seed + ' grade ' + grade + ' opened on ' + names);
    }
    say(bad.length === 0, 'round one of a first MATCHING session is 1/8 vs 7/8' + (bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''));
  }
  /* 9 */
  {
    const bad = [];
    for (let d = 2; d <= 12; d++) for (let n = 1; n < d; n++) {
      const got = E.equivalentsOf({ n, d }, { maxDenominator: 12 }).map(f => f.n + '/' + f.d).sort();
      const want = [];
      for (let k = 2; d * k <= 12; k++) want.push((n * k) + '/' + (d * k));
      if (JSON.stringify(got) !== JSON.stringify(want.sort())) bad.push(n + '/' + d + ' gave ' + got.join(',') + ' not ' + want.join(','));
    }
    say(bad.length === 0, 'equivalentsOf is every equal fraction by a split that keeps the denominator at 12 or less' + (bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''));
  }
  /* 10 */
  {
    const bad = [];
    for (const seed of SEEDS) {
      const rounds = run(seed, 'level', 4, 10).flat().filter(p => p.split);
      const inexact = rounds.filter(p => p.want.n !== p.target.n * p.split || p.want.d !== p.target.d * p.split || p.want.d > 12);
      const share = rounds.filter(p => ![2, 4, 8].includes(p.split)).length / Math.max(1, rounds.length);
      if (!rounds.length || inexact.length || share < 0.5) bad.push(seed + ' ' + rounds.length + ' splits, ' + inexact.length + ' inexact, ' + (share * 100).toFixed(0) + ' percent not doubling');
    }
    say(bad.length === 0, 'B9: at least half of LEVEL\'s split targets need a split that is not doubling, every split exact and under 12' + (bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''));
  }
  /* 11 */
  {
    const bad = [];
    for (const seed of SEEDS.slice(0, 5)) for (const mode of ['matching', 'half', 'brim', 'level']) {
      const a = JSON.stringify(run(seed, mode, 4, 3)), b = JSON.stringify(run(seed, mode, 4, 3)), c = JSON.stringify(run(seed + 1, mode, 4, 3));
      if (a !== b) bad.push(seed + ' ' + mode + ' does not replay');
      if (a === c) bad.push(seed + ' ' + mode + ' and the next seed give the same sessions');
    }
    say(bad.length === 0, 'a seed replays its sessions and another seed gives others' + (bad.length ? ': ' + bad.join('; ') : ''));
  }
}

/* 12 */
for (const name of ['engine.js', 'pairs.js']) {
  let src = '';
  try { src = readFileSync(join(BRIM, name), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, ''); } catch (e) { say(false, name + ' exists'); continue; }
  const names = ['document', 'window', 'Date', 'performance', 'setTimeout', 'setInterval', 'requestAnimationFrame'].filter(w => new RegExp('\\b' + w + '\\b').test(src))
    .concat(/Math\.random/.test(src) ? ['Math.random'] : []);
  say(names.length === 0, name + ' touches no screen, clock or unseeded die' + (names.length ? ': it names ' + names.join(', ') : ''));
}

console.log('');
if (fails.length) { console.log(fails.length + ' ENGINE FAILURE(S)'); process.exit(1); }
console.log('ENGINE OK');
