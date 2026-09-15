#!/usr/bin/env node
/* HUSH P0: the order, the scoring, the axes, the approach and SIMON's deal (plans/hush/HANDOFF-HUSH.md sections 3 and 4; the
 * handoff's sections 1, 2, 3, 5 and 8).
 *
 *   node test/engine.mjs
 *
 * Every count is a law proved on 20 seeds. Asserted, each watched to fail on a planted fault:
 *   1. H1: over 500 runs at each ratio level and each run length the link offers (40, 60, 80), go trials are 75 to 80 percent,
 *      the no-go count is floor(n * 9 / 40) at easy and n / 5 at hard, and every no-go comes after at least three go
 *      trials since the run began or the last no-go
 *   2. 3.2: the order is not a clock: a no-go straight after exactly three go comes at most 0.75 of the time at each level, and
 *      500 runs give at least 100 different orders
 *   3. the gap before each pose is 700 to 1500 ms, and a seed replays its runs while another seed gives others
 *   4. scoreTrial: a step inside the pose (or its 150 ms grace) is a hit on go and a false alarm on no-go; no step is a miss on
 *      go and a correct rejection on no-go; a step in the gap is ignored; reaction time is from paint
 *   5. the approach: Quick earns a step on a hit, Careful on a hit and a correct rejection, a false alarm is one step back in
 *      both (H4), a miss changes nothing (H9); never under zero; a tier every three steps; the settle at eighteen
 *   6. a model child at 80 percent hits and 20 percent false alarms settles inside two runs of 40 in either fork, on 20 seeds;
 *      a child who never steps never moves the creature
 *   7. 3.3: adaptAxes reads three histories: duration from go trials (1200 to 400 by 80), cue similarity from no-go trials
 *      (0 to 1), the ratio from whole runs; a child who steps on everything moves duration and not similarity, a child who
 *      steps on nothing moves similarity and not duration, and over 20 sessions a mixed child's three paths differ, on 20 seeds
 *   8. H7: every trial of a run carries the run's one mode
 *   9. dealSimon: thirty commands, the "Hush says" share and minimum of H1, every command from the list, none of H6's words
 *  10. engine.js touches no screen, clock or unseeded die
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HUSH = join(dirname(fileURLToPath(import.meta.url)), '..');
const fails = [];
const say = (ok, line) => { console.log((ok ? '  ok    ' : '  FAIL  ') + line); if (!ok) fails.push(line); };
let E = null, P = null;
try { E = await import('../engine.js'); P = await import('../../math/core/pure.js'); say(true, 'engine.js loads as an ES module'); }
catch (e) { say(false, 'engine.js loads as an ES module (' + e.message.split('\n')[0] + ')'); }

const SEEDS = Array.from({ length: 20 }, (_, i) => 4000 + i * 7919);
const runsFor = (level, n, perSeed) => {
  const out = [];
  for (const seed of SEEDS) { const r = P.rng(seed >>> 0); for (let i = 0; i < perSeed; i++) out.push(E.dealRun(r, { n, level, mode: 'step' })); }
  return out;
};

if (E && P) {
  /* 1 and 2 */
  for (const level of ['easy', 'hard']) {
    for (const n of [40, 60, 80]) {
      const runs = runsFor(level, n, 25);
      const want = level === 'easy' ? Math.floor(n * 9 / 40) : n / 5;
      const bad = [];
      let afterThree = 0, nogoTotal = 0;
      const orders = new Set();
      runs.forEach((run, i) => {
        if (run.length !== n) { bad.push('run ' + i + ' has ' + run.length + ' trials'); return; }
        const nogo = run.filter(t => t.type === 'nogo').length, go = run.filter(t => t.type === 'go').length;
        if (nogo !== want || go + nogo !== n) bad.push('run ' + i + ' has ' + nogo + ' no-go');
        if (go / n < 0.75 || go / n > 0.8) bad.push('run ' + i + ' go share ' + (go / n).toFixed(3));
        let since = 0;
        run.forEach((t, j) => {
          if (t.type === 'nogo') {
            if (since < 3) bad.push('run ' + i + ' trial ' + j + ' a no-go after ' + since + ' go');
            if (since === 3) afterThree++;
            nogoTotal++; since = 0;
          } else since++;
        });
        orders.add(run.map(t => (t.type === 'go' ? 'G' : 'N')).join(''));
      });
      say(bad.length === 0, 'H1 ' + level + ' n ' + n + ': ' + runs.length + ' runs, every one ' + want + ' no-go, go 75 to 80 percent, three go before every no-go' + (bad.length ? ': ' + bad.slice(0, 4).join('; ') : ''));
      const hz = nogoTotal ? afterThree / nogoTotal : 1;
      say(hz <= 0.75 && orders.size >= 100, '3.2 ' + level + ' n ' + n + ': a no-go straight after three go ' + hz.toFixed(2) + ' of the time (at most 0.75), ' + orders.size + ' different orders in ' + runs.length + ' (at least 100)');
    }
  }

  /* 3 */
  {
    const bad = [];
    for (const seed of SEEDS) {
      const a = E.dealRun(P.rng(seed >>> 0), { n: 40, level: 'easy', mode: 'step' }), b = E.dealRun(P.rng(seed >>> 0), { n: 40, level: 'easy', mode: 'step' });
      const c = E.dealRun(P.rng((seed + 1) >>> 0), { n: 40, level: 'easy', mode: 'step' });
      a.forEach((t, j) => { if (!(t.gapMs >= 700 && t.gapMs <= 1500)) bad.push(seed + ' trial ' + j + ' gap ' + t.gapMs); });
      if (JSON.stringify(a) !== JSON.stringify(b)) bad.push(seed + ' does not replay');
      if (JSON.stringify(a) === JSON.stringify(c)) bad.push(seed + ' and the next seed deal the same run');
      const gaps = new Set(a.map(t => t.gapMs));
      if (gaps.size < 10) bad.push(seed + ' only ' + gaps.size + ' different gaps');
    }
    say(bad.length === 0, 'the gap before each pose is 700 to 1500 ms and varies, a seed replays its run, another seed gives another' + (bad.length ? ': ' + bad.slice(0, 4).join('; ') : ''));
  }

  /* 4 */
  {
    const T = (type, stepAt) => E.scoreTrial({ type, paintedAt: 1000, hiddenAt: 1700, stepAt });
    const cases = [
      [T('go', 1300), 'hit', 300], [T('go', 1840), 'hit', 840], [T('go', 1851), 'miss', null], [T('go', null), 'miss', null],
      [T('go', 990), 'miss', null], [T('nogo', 1200), 'falseAlarm', 200], [T('nogo', 1700), 'falseAlarm', 700],
      [T('nogo', null), 'correctRejection', null], [T('nogo', 999), 'correctRejection', null], [T('nogo', 1900), 'correctRejection', null]
    ];
    const bad = cases.filter(([got, outcome, rt]) => got.outcome !== outcome || got.rtMs !== rt).map(([got, outcome, rt]) => JSON.stringify(got) + ' for ' + outcome + ' ' + rt);
    say(bad.length === 0, 'scoreTrial: a step from paint to hide and 150 ms after is a hit or a false alarm, no step or a step in the gap is a miss or a correct rejection, reaction time from paint' + (bad.length ? ': ' + bad.join('; ') : ''));
  }

  /* 5 */
  {
    const bad = [];
    const table = { quick: { hit: 1, miss: 0, falseAlarm: -1, correctRejection: 0 }, careful: { hit: 1, miss: 0, falseAlarm: -1, correctRejection: 1 } };
    for (const fork of ['quick', 'careful']) for (const o of Object.keys(table[fork])) if (E.stepsDelta(o, fork) !== table[fork][o]) bad.push(fork + ' ' + o + ' gave ' + E.stepsDelta(o, fork));
    if (E.approach(0, -1) !== 0) bad.push('0 and a step back gave ' + E.approach(0, -1));
    if (E.approach(E.SETTLE, 1) !== E.SETTLE) bad.push('past the settle gave ' + E.approach(E.SETTLE, 1));
    if (E.SETTLE !== 18) bad.push('SETTLE is ' + E.SETTLE);
    for (let s = 0; s <= 18; s++) if (E.tierOf(s) !== Math.min(5, Math.floor(s / 3))) bad.push('steps ' + s + ' tier ' + E.tierOf(s));
    if (E.settled(17) || !E.settled(18)) bad.push('settled at 17 or not at 18');
    say(bad.length === 0, 'the approach: Quick a step on a hit, Careful on a hit and a freeze, a false alarm one back, a miss nothing, never under zero, a tier every three, the settle at 18' + (bad.length ? ': ' + bad.join('; ') : ''));
  }

  /* 6 */
  {
    const bad = [];
    const playRuns = (seed, fork, pHit, pFalse, runs) => {
      const r = P.rng(seed >>> 0), child = P.rng((seed ^ 0x5bd1e995) >>> 0);
      let steps = 0;
      for (let k = 0; k < runs; k++) {
        for (const t of E.dealRun(r, { n: 40, level: fork === 'quick' ? 'hard' : 'easy', mode: 'step' })) {
          const stepped = t.type === 'go' ? child() < pHit : child() < pFalse;
          const res = E.scoreTrial({ type: t.type, paintedAt: 0, hiddenAt: 600, stepAt: stepped ? 300 : null });
          steps = E.approach(steps, E.stepsDelta(res.outcome, fork));
          if (E.settled(steps)) return { steps, settledIn: k + 1 };
        }
      }
      return { steps, settledIn: null };
    };
    for (const seed of SEEDS) for (const fork of ['quick', 'careful']) {
      const m = playRuns(seed, fork, 0.8, 0.2, 2);
      if (!m.settledIn) bad.push(seed + ' ' + fork + ' only reached ' + m.steps);
      const still = playRuns(seed, fork, 0, 0, 2);
      if (fork === 'quick' && still.steps !== 0) bad.push(seed + ' quick never stepping moved to ' + still.steps);
    }
    say(bad.length === 0, 'a child at 80 percent hits and 20 percent false alarms settles inside two runs of 40 in either fork, and one who never steps in Quick never moves it, on 20 seeds' + (bad.length ? ': ' + bad.slice(0, 4).join('; ') : ''));
  }

  /* 7 */
  {
    const bad = [];
    const history = (seed, sessions, pHit, pFalse) => {
      const r = P.rng(seed >>> 0), child = P.rng((seed ^ 0x2545f491) >>> 0), runs = [], path = [];
      for (let k = 0; k < sessions; k++) {
        const now = E.adaptAxes(runs, 'careful');
        const run = E.dealRun(r, { n: 40, level: now.ratio >= 0.8 ? 'hard' : 'easy', mode: 'step' }).map(t => {
          const stepped = t.type === 'go' ? child() < pHit : child() < pFalse;
          return { type: t.type, outcome: E.scoreTrial({ type: t.type, paintedAt: 0, hiddenAt: 600, stepAt: stepped ? 300 : null }).outcome };
        });
        runs.push(run);
        path.push(E.adaptAxes(runs, 'careful'));
      }
      return path;
    };
    const start = E.adaptAxes([], 'careful'), quickStart = E.adaptAxes([], 'quick');
    if (start.durationMs !== 1200 || start.cueSimilarity !== 0 || start.ratio !== 0.775) bad.push('careful starts at ' + JSON.stringify(start));
    if (quickStart.durationMs !== 800 || quickStart.ratio !== 0.8) bad.push('quick starts at ' + JSON.stringify(quickStart));
    for (const seed of SEEDS) {
      const all = history(seed, 3, 1, 1).pop();
      if (!(all.durationMs < 1200) || all.cueSimilarity !== 0) bad.push(seed + ' stepping on everything gave ' + JSON.stringify(all));
      const none = history(seed, 3, 0, 0).pop();
      if (none.durationMs !== 1200 || !(none.cueSimilarity > 0)) bad.push(seed + ' stepping on nothing gave ' + JSON.stringify(none));
      const mixed = history(seed, 20, 0.85, 0.3);
      const norm = mixed.map(a => [(1200 - a.durationMs) / 800, a.cueSimilarity, (a.ratio - 0.775) / 0.025]);
      const same = (i, j) => norm.every(v => Math.abs(v[i] - v[j]) < 1e-9);
      if (same(0, 1) || same(0, 2) || same(1, 2)) bad.push(seed + ' two of the three paths are the same');
      if (mixed.some(a => a.durationMs < 400 || a.durationMs > 1200 || a.cueSimilarity < 0 || a.cueSimilarity > 1 || (a.ratio !== 0.775 && a.ratio !== 0.8))) bad.push(seed + ' a level out of its range');
    }
    say(bad.length === 0, '3.3: three histories: stepping on everything moves duration and not similarity, stepping on nothing moves similarity and not duration, and a mixed child\'s three paths differ over 20 sessions, on 20 seeds' + (bad.length ? ': ' + bad.slice(0, 4).join('; ') : ''));
  }

  /* 8 */
  {
    const bad = [];
    for (const seed of SEEDS) for (const mode of ['step', 'mirror']) {
      const run = E.dealRun(P.rng(seed >>> 0), { n: 40, level: 'easy', mode });
      if (run.some(t => t.mode !== mode)) bad.push(seed + ' ' + mode + ' carries ' + Array.from(new Set(run.map(t => t.mode))).join(','));
    }
    say(bad.length === 0, 'H7: every trial of a run carries the run\'s one mode' + (bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''));
  }

  /* 9 */
  {
    const bad = [];
    const banned = /\b(hit|smash|shoot|kill|catch|patience|self control|good|well done|calm)\b/i;
    for (const seed of SEEDS) {
      const s = E.dealSimon(P.rng(seed >>> 0));
      if (s.length !== 30) bad.push(seed + ' ' + s.length + ' commands');
      const says = s.filter(c => c.says).length;
      if (says / s.length < 0.75 || says / s.length > 0.8) bad.push(seed + ' says share ' + (says / s.length).toFixed(3));
      let since = 0;
      s.forEach((c, j) => { if (!c.says) { if (since < 3) bad.push(seed + ' command ' + j + ' after ' + since); since = 0; } else since++; });
      s.forEach(c => { if (E.SIMON_COMMANDS.indexOf(c.command) < 0) bad.push(seed + ' ' + c.command + ' is not on the list'); });
      if (new Set(s.map(c => c.command)).size < 6) bad.push(seed + ' only ' + new Set(s.map(c => c.command)).size + ' different commands');
    }
    E.SIMON_COMMANDS.forEach(c => { if (banned.test(c)) bad.push('the list holds ' + c); });
    say(bad.length === 0, 'dealSimon: thirty commands, Hush says 75 to 80 percent with three before every other, every command from the list, none of H6 or H8\'s words' + (bad.length ? ': ' + bad.slice(0, 4).join('; ') : ''));
  }

  /* 10 */
  let src = null;
  try { src = readFileSync(join(HUSH, 'engine.js'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, ''); } catch (e) { src = null; }
  if (src === null) say(false, 'engine.js exists');
  else {
    const names = ['document', 'window', 'Date', 'performance', 'setTimeout', 'setInterval', 'requestAnimationFrame'].filter(w => new RegExp('\\b' + w + '\\b').test(src))
      .concat(/Math\.random/.test(src) ? ['Math.random'] : []);
    say(names.length === 0, 'engine.js touches no screen, clock or unseeded die' + (names.length ? ': it names ' + names.join(', ') : ''));
  }
}

console.log('');
if (fails.length) { console.log(fails.length + ' ENGINE FAILURE(S)'); process.exit(1); }
console.log('ENGINE OK');
