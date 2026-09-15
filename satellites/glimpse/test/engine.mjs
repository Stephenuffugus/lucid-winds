#!/usr/bin/env node
/* GLIMPSE P0: the deals and the scoring (plans/glimpse/HANDOFF-GLIMPSE.md sections 3 and 4; the handoff's sections 2, 4, 5).
 *
 *   node test/engine.mjs
 *
 * Every count is a law proved on 20 seeds. Asserted, each watched to fail on a planted fault:
 *   1. flashMs: 400 for 1 to 5, 350 for 6 to 10, and the settings' 250, 400, 600 and Long Look's 1500 when asked
 *   2. GL6: FLASH at tier t serves only arrangements up to its place in dice, finger, tally, line, random, and tier 0 only dice
 *   3. GROUPS: every round's parts add to its count, 5 to 10; at tier 0 at least 60 percent of rounds are built on five; in
 *      every session some total is served as two or more different splits
 *   4. FRAME: how many and what is missing to ten alternate, round by round; the complement's answer is ten less the count
 *   5. SPREAD: its three round types each come at least a quarter of the time, and each means what it says (same count and
 *      hulls apart by half again or more; fewer but a larger hull; same count and mean diameters apart by 1.4 times or more),
 *      with the answer that follows from the counts
 *   6. scoreAnswer: a right answer inside 2.5 s counts and climbs; a right answer past it counts and does not climb (GL3); a
 *      wrong answer neither
 *   7. padsFor: the round's range and no more (FLASH 1 to 5, GROUPS 5 to 10, FRAME's complement 0 to 10, SPREAD's three), laid
 *      out at most four to a row
 *   8. a seed replays its sessions and another seed gives others
 *   9. engine.js touches no screen, clock or unseeded die
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const GLIMPSE = join(dirname(fileURLToPath(import.meta.url)), '..');
const fails = [];
const say = (ok, line) => { console.log((ok ? '  ok    ' : '  FAIL  ') + line); if (!ok) fails.push(line); };
let E = null, P = null;
try { E = await import('../engine.js'); P = await import('../../math/core/pure.js'); say(true, 'engine.js loads as an ES module'); }
catch (e) { say(false, 'engine.js loads as an ES module (' + e.message.split('\n')[0] + ')'); }

const SEEDS = Array.from({ length: 20 }, (_, i) => 3000 + i * 7919);
const sessions = (seed, mode, tier, k) => { const r = P.rng(seed >>> 0), out = []; for (let s = 0; s < k; s++) out.push(E.dealSession(r, { mode, tier, session: s })); return out; };

if (E && P) {
  /* 1 */
  {
    const bad = [];
    for (let n = 1; n <= 10; n++) if (E.flashMs(n) !== (n <= 5 ? 400 : 350)) bad.push(n + ' gave ' + E.flashMs(n));
    for (const [set, want] of [['250', 250], ['400', 400], ['600', 600], ['long', 1500]]) if (E.flashMs(3, set) !== want || E.flashMs(8, set) !== want) bad.push(set + ' gave ' + E.flashMs(3, set) + ', ' + E.flashMs(8, set));
    say(bad.length === 0, 'flashMs: 400 for 1 to 5, 350 for 6 to 10, and the settings and Long Look when asked' + (bad.length ? ': ' + bad.join('; ') : ''));
  }
  /* 2 */
  {
    const ORDER = ['dice', 'finger', 'tally', 'line', 'random'], bad = [];
    for (const seed of SEEDS) for (let tier = 0; tier < ORDER.length; tier++) {
      const rounds = sessions(seed, 'flash', tier, 5).flat();
      const past = rounds.find(x => ORDER.indexOf(x.arrangement) < 0 || ORDER.indexOf(x.arrangement) > tier || x.count < 1 || x.count > 5);
      if (past) bad.push(seed + ' tier ' + tier + ' served ' + past.arrangement + ' ' + past.count);
      if (tier === 0 && rounds.some(x => x.arrangement !== 'dice')) bad.push(seed + ' tier 0 served past dice');
      if (tier > 0 && !rounds.some(x => x.arrangement === ORDER[tier])) bad.push(seed + ' tier ' + tier + ' never served its own ' + ORDER[tier]);
    }
    say(bad.length === 0, 'GL6: FLASH at a tier serves only arrangements up to its place, tier 0 only dice, and each tier its own' + (bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''));
  }
  /* 3 */
  {
    const bad = [];
    for (const seed of SEEDS) {
      const zero = sessions(seed, 'groups', 0, 6);
      const flat = zero.flat();
      if (flat.some(x => x.parts[0] + x.parts[1] !== x.count || x.count < 5 || x.count > 10)) bad.push(seed + ' parts that do not add, or a count outside 5 to 10');
      const five = flat.filter(x => x.parts.includes(5)).length / flat.length;
      if (five < 0.6) bad.push(seed + ' built on five ' + (five * 100).toFixed(0) + ' percent at tier 0');
      for (const [i, s] of sessions(seed, 'groups', 2, 6).entries()) {
        const splits = new Map();
        for (const x of s) { const k = x.count, v = [...x.parts].sort().join('+'); if (!splits.has(k)) splits.set(k, new Set()); splits.get(k).add(v); }
        if (![...splits.values()].some(v => v.size >= 2)) { bad.push(seed + ' session ' + i + ' served no total two ways'); break; }
      }
    }
    say(bad.length === 0, 'GROUPS: parts add to counts of 5 to 10, at least 60 percent built on five at tier 0, and every session serves some total two ways' + (bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''));
  }
  /* 4 */
  {
    const bad = [];
    for (const seed of SEEDS) for (const s of sessions(seed, 'frame', 1, 4)) {
      s.forEach((x, i) => {
        if (x.ask !== (i % 2 ? 'complement' : 'howMany')) bad.push(seed + ' round ' + i + ' asks ' + x.ask);
        if (x.ask === 'complement' && x.answer !== 10 - x.count) bad.push(seed + ' complement of ' + x.count + ' answered ' + x.answer);
        if (x.ask === 'howMany' && x.answer !== x.count) bad.push(seed + ' how many of ' + x.count + ' answered ' + x.answer);
        if (x.count < 1 || x.count > 10) bad.push(seed + ' a frame of ' + x.count);
      });
    }
    say(bad.length === 0, 'FRAME: how many and what is missing to ten alternate, and each answer follows from the count' + (bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''));
  }
  /* 5 */
  {
    const bad = [];
    for (const seed of SEEDS) {
      const rounds = sessions(seed, 'spread', 1, 10).flat(), types = {};
      for (const x of rounds) {
        types[x.roundType] = (types[x.roundType] || 0) + 1;
        const a = x.a.measured, b = x.b.measured, more = x.a.n > x.b.n ? 'left' : x.a.n < x.b.n ? 'right' : 'same';
        if (x.answer !== more) bad.push(seed + ' ' + x.roundType + ' answers ' + x.answer + ' for ' + x.a.n + ' and ' + x.b.n);
        if (x.roundType === 'sameSpread' && !(x.a.n === x.b.n && Math.max(a.hull, b.hull) >= 1.5 * Math.min(a.hull, b.hull))) bad.push(seed + ' sameSpread not the same count or not spread apart');
        if (x.roundType === 'fewerWider' && !(x.a.n !== x.b.n && (x.a.n < x.b.n ? a.hull > b.hull : b.hull > a.hull))) bad.push(seed + ' fewerWider with the fewer not wider');
        if (x.roundType === 'sameSize' && !(x.a.n === x.b.n && Math.max(a.meanDiam, b.meanDiam) >= 1.4 * Math.min(a.meanDiam, b.meanDiam))) bad.push(seed + ' sameSize not the same count or sizes too close');
      }
      for (const t of ['sameSpread', 'fewerWider', 'sameSize']) if ((types[t] || 0) / rounds.length < 0.25) bad.push(seed + ' ' + t + ' only ' + (types[t] || 0) + ' of ' + rounds.length);
    }
    say(bad.length === 0, 'SPREAD: three round types each a quarter or more, each meaning what it says, with the answer the counts give' + (bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''));
  }
  /* 6 */
  {
    const round = { mode: 'flash', count: 3, answer: 3 };
    const cases = [[3, 900, true, true], [3, 2500, true, true], [3, 2501, true, false], [3, 9000, true, false], [4, 800, false, false]];
    const bad = cases.filter(([ans, rt, ok, climbs]) => { const s = E.scoreAnswer(round, ans, rt); return s.correct !== ok || s.climbs !== climbs; }).map(([ans, rt]) => ans + ' at ' + rt + ' ms gave ' + JSON.stringify(E.scoreAnswer(round, ans, rt)));
    say(bad.length === 0, 'scoreAnswer: right inside 2.5 s climbs, right past it counts and does not climb, wrong does neither' + (bad.length ? ': ' + bad.join('; ') : ''));
  }
  /* 7 */
  {
    const bad = [];
    const want = [[{ mode: 'flash', count: 3, ask: 'howMany' }, [1, 2, 3, 4, 5]], [{ mode: 'groups', count: 7, ask: 'total' }, [5, 6, 7, 8, 9, 10]],
      [{ mode: 'frame', count: 6, ask: 'complement' }, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]], [{ mode: 'frame', count: 6, ask: 'howMany' }, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]],
      [{ mode: 'spread', ask: 'sameOrMore' }, ['left', 'same', 'right']]];
    for (const [round, pads] of want) {
      const got = E.padsFor(round), rows = E.padRows(got);
      if (JSON.stringify(got) !== JSON.stringify(pads)) bad.push(round.mode + ' ' + round.ask + ' pads ' + JSON.stringify(got));
      if (rows.flat().length !== got.length || rows.some(row => row.length > 4 || row.length === 0)) bad.push(round.mode + ' rows ' + JSON.stringify(rows));
    }
    say(bad.length === 0, 'padsFor gives the round\'s range and no more, at most four to a row (3.6)' + (bad.length ? ': ' + bad.join('; ') : ''));
  }
  /* 8 */
  {
    const bad = [];
    for (const seed of SEEDS.slice(0, 5)) for (const mode of ['flash', 'groups', 'frame', 'spread']) {
      const a = JSON.stringify(sessions(seed, mode, 2, 2)), b = JSON.stringify(sessions(seed, mode, 2, 2)), c = JSON.stringify(sessions(seed + 1, mode, 2, 2));
      if (a !== b) bad.push(seed + ' ' + mode + ' does not replay');
      if (a === c) bad.push(seed + ' ' + mode + ' and the next seed give the same');
    }
    say(bad.length === 0, 'a seed replays its sessions and another seed gives others' + (bad.length ? ': ' + bad.join('; ') : ''));
  }
}

/* 9 */
{
  let src = '';
  try { src = readFileSync(join(GLIMPSE, 'engine.js'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, ''); } catch (e) { src = null; }
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
