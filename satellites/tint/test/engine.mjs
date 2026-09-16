#!/usr/bin/env node
/* TINT P0: the trap set, the banks and the deals (plans/tint/HANDOFF-TINT.md 3.4 to 3.7; the handoff's sections 1, 2, 5 and 7).
 *
 *   node test/engine.mjs
 *
 * Every count is a law proved on 20 seeds. Asserted, each watched to fail on a planted fault:
 *   1. the trap set is the handoff's seven pairs with its answers, and every pair's answer is what the reduced ratios say
 *   2. T4: ERROR_TAXONOMY names the five errors, and every comparison session of twenty holds at least one trap of each, and at
 *      least six same and six different pairs, every answer true to the reduced ratios
 *   3. T1: every FILL session of twenty holds exactly three non-proportional orders; over ten sessions a seed, 15 percent exactly
 *   4. T2: every DOES IT SCALE session of ten holds exactly four proportional items; 40 percent exactly
 *   5. T3: at stage 1 every scaled order has a whole factor; beyond it at least 35 percent of scaled orders have a factor that is
 *      not whole
 *   6. T9: over a run of sessions across stages, every ratio family is first dealt continuous, before any discretized task
 *   7. every FILL order's answer is its own arithmetic: a proportional order's white is recipe white times dye over recipe dye; a
 *      non-proportional order's answer is what its situation says, and differs from the scaled answer
 *   8. NONLINEAR_BANK holds the handoff's four seeds with their answers, an item is proportional exactly when its actual answer is
 *      its proportional answer, and every DOES IT SCALE item is from the bank
 *   9. scoring: scoreCompare, scoreFill and scoreScales are right exactly when the answer is
 *  10. a seed replays its sessions and another seed gives others; engine.js touches no screen, clock or unseeded die
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const TINT = join(dirname(fileURLToPath(import.meta.url)), '..');
const fails = [];
const say = (ok, line) => { console.log((ok ? '  ok    ' : '  FAIL  ') + line); if (!ok) fails.push(line); };
let E = null, C = null, P = null;
try { E = await import('../engine.js'); C = await import('../colour.js'); P = await import('../../math/core/pure.js'); say(true, 'engine.js and colour.js load as ES modules'); }
catch (e) { say(false, 'engine.js and colour.js load as ES modules (' + e.message.split('\n')[0] + ')'); }

const SEEDS = Array.from({ length: 20 }, (_, i) => 7000 + i * 7919);
const same = (p, q) => JSON.stringify(C.reduceRatio(...p)) === JSON.stringify(C.reduceRatio(...q));
const ERRORS = ['additive', 'buildUp', 'magicalDoubling', 'constantSum', 'incomplete'];

if (E && C && P) {
  /* 1 */
  {
    const want = [[[2, 1], [3, 2], 'different', 'additive'], [[2, 1], [6, 3], 'same', null], [[3, 2], [6, 3], 'different', 'magicalDoubling'], [[3, 1], [2, 2], 'different', 'constantSum'], [[4, 2], [6, 3], 'same', null], [[3, 2], [9, 6], 'same', null], [[2, 1], [5, 2.5], 'same', null]];
    const bad = [];
    want.forEach(([l, r, answer, error], i) => {
      const t = E.TRAPS[i];
      if (!t || JSON.stringify(t.left) !== JSON.stringify(l) || JSON.stringify(t.right) !== JSON.stringify(r) || t.answer !== answer || t.errorTarget !== error) bad.push(i + ' is ' + JSON.stringify(t));
    });
    E.TRAPS.forEach((t, i) => { if ((t.answer === 'same') !== same(t.left, t.right)) bad.push(i + ' answer ' + t.answer + ' is not what the ratios say'); });
    say(E.TRAPS.length >= 7 && bad.length === 0, 'the trap set is the handoff\'s seven pairs with its answers, each true to the reduced ratios' + (bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''));
  }
  /* 2 */
  {
    const bad = [];
    if (JSON.stringify([...E.ERROR_TAXONOMY].sort()) !== JSON.stringify([...ERRORS].sort())) bad.push('ERROR_TAXONOMY is ' + JSON.stringify(E.ERROR_TAXONOMY));
    for (const seed of SEEDS) {
      const r = P.rng(seed >>> 0);
      let seen = new Set();
      for (let s = 0; s < 5; s++) {
        const d = E.dealCompare(r, { stage: 1 + (s % 2), seen });
        seen = d.seen;
        const t = d.tasks;
        if (t.length !== 20) bad.push(seed + ' session of ' + t.length);
        const missing = ERRORS.filter(e => !t.some(x => x.errorTarget === e));
        if (missing.length) bad.push(seed + ' session ' + s + ' lacks ' + missing.join(','));
        if (t.filter(x => x.answer === 'same').length < 6 || t.filter(x => x.answer === 'different').length < 6) bad.push(seed + ' session ' + s + ' same/different ' + t.filter(x => x.answer === 'same').length);
        for (const x of t) if ((x.answer === 'same') !== same(x.left, x.right)) bad.push(seed + ' ' + JSON.stringify(x.left) + ' vs ' + JSON.stringify(x.right) + ' says ' + x.answer);
      }
    }
    say(bad.length === 0, 'T4: the five errors named, and every comparison session of twenty holds each, six or more same and different, every answer true' + (bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''));
  }
  /* 3, 5, 7 */
  {
    const bad = [];
    let nonProp = 0, total = 0;
    for (const seed of SEEDS) {
      const r = P.rng(seed >>> 0);
      let seen = new Set();
      for (let s = 0; s < 10; s++) {
        const stage = s < 3 ? 1 : 2;
        const d = E.dealFill(r, { stage, seen });
        seen = d.seen;
        const t = d.tasks, np = t.filter(x => !x.isProportional).length;
        if (t.length !== 20 || np !== 3) bad.push(seed + ' fill session ' + s + ': ' + np + ' non-proportional in ' + t.length);
        nonProp += np; total += t.length;
        const scaled = t.filter(x => x.isProportional), nonWhole = scaled.filter(x => x.factorType === 'nonInteger').length;
        if (stage === 1 && nonWhole) bad.push(seed + ' stage 1 session ' + s + ' has ' + nonWhole + ' non-whole factors');
        if (stage > 1 && nonWhole / scaled.length < 0.35) bad.push(seed + ' stage 2 session ' + s + ' non-whole ' + nonWhole + ' of ' + scaled.length);
        for (const x of t) {
          if (x.isProportional) {
            const w = x.recipe[1] * x.dye / x.recipe[0];
            if (Math.abs(w - x.answer) > 1e-9) bad.push(seed + ' proportional ' + JSON.stringify(x) + ' answer ' + x.answer + ' for ' + w);
            if ((Number.isInteger(x.scaleFactor) ? 'integer' : 'nonInteger') !== x.factorType || Math.abs(x.dye / x.recipe[0] - x.scaleFactor) > 1e-9) bad.push(seed + ' factor of ' + JSON.stringify(x));
          } else {
            const scaledAnswer = x.recipe[1] * x.dye / x.recipe[0];
            if (Math.abs(E.fillAnswer(x) - x.answer) > 1e-9 || Math.abs(x.answer - scaledAnswer) < 1e-9) bad.push(seed + ' non-proportional ' + JSON.stringify(x) + ' answer ' + x.answer + ' against scaled ' + scaledAnswer);
          }
        }
      }
    }
    say(bad.length === 0 && nonProp / total === 0.15, 'T1: every FILL session of twenty holds exactly three non-proportional orders (' + (nonProp / total * 100).toFixed(1) + ' percent); T3: whole factors at stage 1, 35 percent or more not whole beyond; every answer its own arithmetic' + (bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''));
  }
  /* 4, 8 */
  {
    const bad = [];
    const seeds = [['dry', 2, 2], ['area', 2, 4], ['heat', null, 30], ['dyers', 15, 15]];
    for (const [id, prop, actual] of seeds) {
      const b = E.NONLINEAR_BANK.find(x => x.id === id);
      if (!b || b.actual !== actual || (prop !== null && b.proportionalAnswer !== (id === 'dry' ? 8 : prop))) bad.push(id + ' is ' + JSON.stringify(b));
    }
    for (const b of E.NONLINEAR_BANK) if (b.isProportional !== (b.actual === b.proportionalAnswer)) bad.push(b.id + ' isProportional ' + b.isProportional + ' but actual ' + b.actual + ' and proportional ' + b.proportionalAnswer);
    let prop = 0, total = 0;
    for (const seed of SEEDS) {
      const r = P.rng(seed >>> 0);
      for (let s = 0; s < 10; s++) {
        const t = E.dealScales(r, {});
        const p = t.filter(x => x.isProportional).length;
        if (t.length !== 10 || p !== 4) bad.push(seed + ' scales session ' + s + ': ' + p + ' proportional in ' + t.length);
        prop += p; total += t.length;
        for (const x of t) if (!E.NONLINEAR_BANK.some(b => b.id === x.id)) bad.push(seed + ' ' + x.id + ' is not in the bank');
      }
    }
    say(bad.length === 0 && prop / total === 0.4 && E.NONLINEAR_BANK.length >= 10, 'T2: every DOES IT SCALE session of ten holds exactly four proportional items (' + (prop / total * 100).toFixed(1) + ' percent), from a bank of ' + E.NONLINEAR_BANK.length + ' holding the handoff\'s four seeds, each proportional exactly when its answers agree' + (bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''));
  }
  /* 6 */
  {
    const bad = [];
    for (const seed of SEEDS) {
      const r = P.rng(seed >>> 0), firstSeen = new Map();
      let seen = new Set();
      for (let s = 0; s < 8; s++) {
        const d = s % 2 === 0 ? E.dealCompare(r, { stage: 1 + (s > 3), seen }) : E.dealFill(r, { stage: 1 + (s > 3), seen });
        seen = d.seen;
        for (const x of d.tasks) {
          const fams = x.left ? [x.left, x.right] : [x.recipe];
          for (const f of fams) {
            const key = C.reduceRatio(...f).join(':');
            if (!firstSeen.has(key)) firstSeen.set(key, x.representation);
          }
        }
      }
      for (const [key, rep] of firstSeen) if (rep !== 'continuous') bad.push(seed + ' family ' + key + ' first dealt ' + rep);
      if (![...firstSeen.values()].length) bad.push(seed + ' nothing dealt');
    }
    say(bad.length === 0, 'T9: every ratio family is first dealt continuous, before any discretized task, over eight sessions on 20 seeds' + (bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''));
  }
  /* 11: 3.3, per task: every different pair dealt is 2.5 or more apart in lightness in the dye it is dealt with */
  {
    const bad = [];
    let n = 0;
    for (const seed of SEEDS) {
      const r = P.rng(seed >>> 0);
      let seen = new Set();
      for (let s = 0; s < 5; s++) {
        const d = E.dealCompare(r, { stage: 1 + (s % 2), seen });
        seen = d.seen;
        for (const x of d.tasks) {
          if (!C.DYES[x.dye]) { bad.push(seed + ' dealt with ' + x.dye); continue; }
          if (x.answer !== 'different') continue;
          n++;
          const g = C.lightnessGap(C.DYES[x.dye], x.left, x.right);
          if (!(g >= 2.5)) bad.push(seed + ' ' + JSON.stringify(x.left) + ' vs ' + JSON.stringify(x.right) + ' in ' + x.dye + ' only ' + g.toFixed(2) + ' apart');
        }
      }
    }
    say(n > 0 && bad.length === 0, '3.3: every different pair dealt (' + n + ') is 2.5 or more apart in lightness in its own dye, on 20 seeds' + (bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''));
  }
  /* 9 */
  {
    const bad = [];
    for (const t of E.TRAPS) for (const choice of ['same', 'different']) if (E.scoreCompare(t, choice).correct !== (choice === t.answer)) bad.push('compare ' + JSON.stringify(t.left) + ' ' + choice);
    const f = { recipe: [2, 3], dye: 5, answer: 7.5, isProportional: true };
    if (!E.scoreFill(f, 7.5).correct || E.scoreFill(f, 7).correct || E.scoreFill(f, 8).correct) bad.push('fill 7.5');
    const b = E.NONLINEAR_BANK[0];
    if (E.scoreScales(b, b.isProportional ? 'scales' : 'not').correct !== true || E.scoreScales(b, b.isProportional ? 'not' : 'scales').correct !== false) bad.push('scales ' + b.id);
    say(bad.length === 0, 'scoring is right exactly when the answer is' + (bad.length ? ': ' + bad.join('; ') : ''));
  }
  /* 10 */
  {
    const a = JSON.stringify(E.dealFill(P.rng(42), { stage: 2, seen: new Set() }).tasks), b = JSON.stringify(E.dealFill(P.rng(42), { stage: 2, seen: new Set() }).tasks), c = JSON.stringify(E.dealFill(P.rng(43), { stage: 2, seen: new Set() }).tasks);
    say(a === b && a !== c, 'a seed replays its session and another seed gives another');
    let src = null;
    try { src = readFileSync(join(TINT, 'engine.js'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, ''); } catch (e) { src = null; }
    const names = src === null ? ['(no file)'] : ['document', 'window', 'Date', 'performance', 'setTimeout', 'requestAnimationFrame'].filter(w => new RegExp('\\b' + w + '\\b').test(src)).concat(/Math\.random/.test(src) ? ['Math.random'] : []);
    say(names.length === 0, 'engine.js touches no screen, clock or unseeded die' + (names.length ? ': it names ' + names.join(', ') : ''));
  }
}

console.log('');
if (fails.length) { console.log(fails.length + ' ENGINE FAILURE(S)'); process.exit(1); }
console.log('ENGINE OK');
