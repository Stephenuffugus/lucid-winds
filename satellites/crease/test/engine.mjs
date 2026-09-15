#!/usr/bin/env node
/* CREASE P0: the engine's laws (plans/crease/HANDOFF-CREASE.md section 5 P0; the handoff's section 5 test gates 1 to 3
 * and 5, C3, C4, C7, and the tolerance ladder).
 *
 *   node test/engine.mjs
 *
 * Every law runs on 20 seeds, because a count is a law only when it holds for any seed. Values are recomputed from
 * numerators and denominators, grades from denominators, errors from the pixels a strip would draw.
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. C7: at grade 3, 10,000 tasks on each of 20 seeds never emit a denominator outside {2, 3, 4, 6, 8}; at grade 4,
 *      never outside grade 4's list; extended items only when a run asks for them
 *   2. no fraction (numerator and denominator) repeats within four rounds, while an equivalence chain still serves 1/2,
 *      2/4, 4/8 in a row
 *   3. outside LONG the whole is never less than the fraction's value
 *   4. C3: over 200 rounds the wholes include 1, 2, 3 and 5, and the whole comes back to 1 at least once in every five
 *      rounds
 *   5. scoreAttempt is exact at the randomization's extremes (72 and 94 percent wide, offset 0 and the cap) and between,
 *      through the pixels a strip draws and toNormalized reading them back
 *   6. C4: the third item of an equivalence chain in a run is flagged for the stacked reveal, and no other item is
 *   7. the tolerance ladder is 10, 7, 5, 3.5 and 2.5 percent; a result is correct within the tier's band and near within
 *      twice it; adaptTier on the results climbs and falls it
 *   8. every task's strip is lineGeometry's, and the same seed gives the same run while another seed gives another
 *   9. engine.js names no document, window, Date, performance, Math.random or timer
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rng, lineGeometry, fromNormalized, toNormalized, adaptTier } from '../../math/core/pure.js';

const CREASE = join(dirname(fileURLToPath(import.meta.url)), '..');
const fails = [];
const say = (ok, line) => { console.log((ok ? '  ok    ' : '  FAIL  ') + line); if (!ok) fails.push(line); };
let E;
try { E = await import('../engine.js'); } catch (e) { say(false, 'engine.js loads as an ES module (' + e.message.split('\n')[0] + ')'); }

const SEEDS = Array.from({ length: 20 }, (_, i) => 3000 + i * 7919);
const G3 = [2, 3, 4, 6, 8], G4 = [2, 3, 4, 5, 6, 8, 10, 12, 100];
const key = t => t.numerator + '/' + t.denominator;

if (E) {
  /* a run of tasks drawn the way the page draws them: one generator state carried from task to task */
  const run = (seed, n, opts) => {
    const r = rng(seed);
    let state = E.freshRun(Object.assign({ grade: 3, mode: 'freehand' }, opts));
    const out = [];
    for (let i = 0; i < n; i++) { const step = E.generateTask(r, state); out.push(step.task); state = step.state; }
    return out;
  };

  /* 1 */
  {
    const bad = [];
    for (const seed of SEEDS) {
      const g3 = run(seed, 10000, { grade: 3 }), g4 = run(seed, 2000, { grade: 4 }), ext = run(seed, 2000, { grade: 4, extended: true });
      const out3 = g3.filter(t => !G3.includes(t.denominator)), out4 = g4.filter(t => !G4.includes(t.denominator));
      if (out3.length) bad.push('seed ' + seed + ' grade 3 served ' + key(out3[0]));
      if (out4.length) bad.push('seed ' + seed + ' grade 4 served ' + key(out4[0]));
      if (seed === SEEDS[0] && !ext.some(t => !G4.includes(t.denominator))) bad.push('a run that asks for extended items never meets one');
    }
    say(bad.length === 0, 'C7: grade 3 never serves a denominator outside {2, 3, 4, 6, 8} over 10,000 tasks a seed, grade 4 never outside its list, extended only when asked'
      + (bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''));
  }

  /* 2 */
  {
    const bad = [];
    let chains = 0;
    for (const seed of SEEDS) {
      const ts = run(seed, 400, { grade: 3 });
      for (let i = 1; i < ts.length; i++) {
        const back = ts.slice(Math.max(0, i - 4), i).map(key);
        if (back.includes(key(ts[i]))) { bad.push('seed ' + seed + ' round ' + i + ' repeats ' + key(ts[i]) + ' within four'); break; }
      }
      for (let i = 2; i < ts.length; i++) if (ts[i].chainStep === 3 && ts[i - 1].chainStep === 2 && ts[i - 2].chainStep === 1) chains++;
    }
    say(bad.length === 0 && chains > 0, 'no fraction repeats within four rounds, and equivalence chains are still served three in a row (' + chains + ' chains)'
      + (bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''));
  }

  /* 3 and 4 */
  {
    const bad = [];
    for (const seed of SEEDS) {
      const ts = run(seed, 200, { grade: 4 });
      const under = ts.filter(t => t.mode !== 'long' && t.whole < t.numerator / t.denominator);
      if (under.length) bad.push('seed ' + seed + ' ' + key(under[0]) + ' on a whole of ' + under[0].whole);
      const wholes = new Set(ts.map(t => t.whole));
      if (![1, 2, 3, 5].every(w => wholes.has(w))) bad.push('seed ' + seed + ' wholes only ' + Array.from(wholes).join(','));
      for (let i = 0; i + 5 <= ts.length; i++) if (!ts.slice(i, i + 5).some(t => t.whole === 1)) { bad.push('seed ' + seed + ' five rounds from ' + i + ' without a whole of 1'); break; }
    }
    say(bad.length === 0, 'the whole always holds the fraction, the wholes include 1, 2, 3 and 5, and every five rounds come back to 1 (C3)'
      + (bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''));
  }

  /* 5 */
  {
    let worst = 0;
    const geoms = [{ widthPct: 0.72, offsetPct: 0 }, { widthPct: 0.72, offsetPct: 0.08 }, { widthPct: 0.94, offsetPct: 0 }, { widthPct: 0.94, offsetPct: 0.06 }];
    for (const seed of SEEDS) {
      const r = rng(seed);
      for (let i = 0; i < 60; i++) {
        const g = i < geoms.length ? geoms[i] : lineGeometry(r), W = [280, 320, 375, 1366][i % 4];
        const task = { numerator: 1 + r.int(7), denominator: 8, whole: [1, 2, 3, 5][r.int(4)], strip: g };
        const placement = r() * task.whole;
        const px = Math.round(fromNormalized(placement / task.whole, g, W) * 4) / 4;
        const read = toNormalized(px, g, W) * task.whole;
        const got = E.scoreAttempt(task, read, 0).pae;
        const want = Math.abs(read - task.numerator / task.denominator) / task.whole;
        worst = Math.max(worst, Math.abs(got - want));
      }
    }
    say(worst < 1e-12, 'scoreAttempt is exact at the randomization\'s extremes and between, read back through the pixels (largest error ' + worst.toExponential(1) + ')');
  }

  /* 6 */
  {
    const bad = [];
    for (const seed of SEEDS) {
      const ts = run(seed, 300, { grade: 3 });
      ts.forEach((t, i) => {
        const third = t.chainStep === 3 && i >= 2 && ts[i - 1].chainStep === 2 && ts[i - 2].chainStep === 1
          && [ts[i - 2], ts[i - 1], t].every(x => Math.abs(x.numerator / x.denominator - t.numerator / t.denominator) < 1e-12);
        if (!!t.stackReveal !== third) bad.push('seed ' + seed + ' round ' + i + ' ' + key(t) + ' stack ' + !!t.stackReveal + ' third ' + third);
      });
    }
    say(bad.length === 0, 'C4: the third item of an equivalence chain, and only it, is flagged for the stacked reveal' + (bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''));
  }

  /* 7 */
  {
    const want = [0.10, 0.07, 0.05, 0.035, 0.025];
    const ladder = Array.isArray(E.TOLERANCE) && E.TOLERANCE.length === 5 && E.TOLERANCE.every((x, i) => Math.abs(x - want[i]) < 1e-12);
    const task = { numerator: 1, denominator: 4, whole: 1, strip: { widthPct: 0.8, offsetPct: 0.1 } };
    const edges = [];
    for (let tier = 0; tier < 5; tier++) {
      const b = want[tier];
      const at = E.scoreAttempt(task, 0.25 + b * 0.999, tier), past = E.scoreAttempt(task, 0.25 + b * 1.001, tier), far = E.scoreAttempt(task, 0.25 + 2 * b * 1.001, tier);
      if (!(at.correct && !past.correct && past.near && !far.near)) edges.push('tier ' + tier + ' ' + JSON.stringify([at.correct, past.correct, past.near, far.near]));
    }
    const cfg = E.TIER_CONFIG;
    const climbs = adaptTier([true, true, true, true, true, true], cfg), falls = adaptTier([true, true, true, false, false], cfg);
    say(ladder && edges.length === 0 && climbs > (cfg.start || 0) && falls <= climbs && cfg.tiers === 5,
      'the ladder is 10, 7, 5, 3.5 and 2.5 percent, correct within the band and near within twice it, and adaptTier climbs and falls it (' + JSON.stringify({ climbs, falls }) + ')'
      + (edges.length ? ': ' + edges.join('; ') : ''));
  }

  /* 8 */
  {
    const bad = [];
    for (const seed of SEEDS.slice(0, 5)) {
      const a = run(seed, 50, { grade: 3 }), b = run(seed, 50, { grade: 3 }), c = run(seed + 1, 50, { grade: 3 });
      if (JSON.stringify(a) !== JSON.stringify(b)) bad.push('seed ' + seed + ' does not replay');
      if (JSON.stringify(a) === JSON.stringify(c)) bad.push('seed ' + seed + ' and the next give the same run');
      const odd = a.filter(t => !(t.strip.widthPct >= 0.72 && t.strip.widthPct <= 0.94 && t.strip.offsetPct >= 0 && t.strip.offsetPct <= Math.min(0.08, 1 - t.strip.widthPct) + 1e-12));
      if (odd.length) bad.push('seed ' + seed + ' a strip outside lineGeometry\'s range');
    }
    say(bad.length === 0, 'every strip is lineGeometry\'s, a seed replays its run and another seed gives another' + (bad.length ? ': ' + bad.join('; ') : ''));
  }

  /* 10: HALFWAY (plans/crease/HANDOFF-CREASE.md 3.7) */
  {
    const bad = [];
    if (typeof E.judgeHalf !== 'function') bad.push('no judgeHalf');
    else {
      const cases = [[1, 3, 'less'], [1, 2, 'half'], [2, 4, 'half'], [5, 8, 'more'], [4, 9, 'less'], [4, 4, 'more'], [3, 6, 'half'], [7, 12, 'more']];
      for (const [n, d, want] of cases) { const got = E.judgeHalf({ numerator: n, denominator: d, whole: 1 }); if (got !== want) bad.push(n + '/' + d + ' judged ' + got); }
      for (const seed of SEEDS) {
        const ts = run(seed, 1000, { grade: 3, mode: 'halfway' });
        const judged = ts.map(t => E.judgeHalf(t));
        if (ts.some(t => t.whole !== 1 || t.mode !== 'halfway')) { bad.push('seed ' + seed + ' a HALFWAY task off a whole of 1'); break; }
        if (ts.some(t => ![2, 3, 4, 6, 8].includes(t.denominator))) { bad.push('seed ' + seed + ' a grade 3 HALFWAY task outside C7'); break; }
        const share = k => judged.filter(j => j === k).length / ts.length;
        const close = ts.filter(t => { const v = t.numerator / t.denominator; return v !== 0.5 && Math.abs(v - 0.5) <= 0.125; }).length / ts.length;
        if (share('half') < 0.15 || share('less') < 0.2 || share('more') < 0.2) bad.push('seed ' + seed + ' shares half ' + share('half').toFixed(2) + ', less ' + share('less').toFixed(2) + ', more ' + share('more').toFixed(2));
        if (close < 0.25) bad.push('seed ' + seed + ' only ' + (close * 100).toFixed(0) + ' percent within an eighth of a half');
        for (let i = 1; i < ts.length; i++) if (ts.slice(Math.max(0, i - 4), i).map(key).includes(key(ts[i]))) { bad.push('seed ' + seed + ' round ' + i + ' repeats ' + key(ts[i])); break; }
      }
    }
    say(bad.length === 0, 'HALFWAY: judgeHalf reads a half exactly, and a HALFWAY run on a whole of 1 serves exact halves at least 15 percent, each side at least 20, a quarter within an eighth of a half, no repeat within four, C7 kept'
      + (bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''));
  }

  /* 9 */
  {
    const src = readFileSync(join(CREASE, 'engine.js'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    const names = ['document', 'window', 'Date', 'performance', 'setTimeout', 'setInterval', 'requestAnimationFrame'].filter(w => new RegExp('\\b' + w + '\\b').test(src))
      .concat(/Math\.random/.test(src) ? ['Math.random'] : []);
    say(names.length === 0, 'engine.js touches no screen, clock or unseeded die' + (names.length ? ': it names ' + names.join(', ') : ''));
  }
}

console.log('');
if (fails.length) { console.log(fails.length + ' ENGINE FAILURE(S)'); process.exit(1); }
console.log('ENGINE OK');
