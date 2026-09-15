#!/usr/bin/env node
/* NOTCH P0: tasks, sessions, the seat, the keys and FIND's deal (plans/notch/HANDOFF-NOTCH.md sections 3 and 4; the handoff's
 * sections 1, 3 and 6).
 *
 *   node test/engine.mjs
 *
 * Every count is a law proved on 20 seeds. Asserted, each watched to fail on a planted fault:
 *   1. N3: over 500 tasks a seed at stage 2, every disparity 0 to 180 by 30 comes 12 to 17 percent of the time, and nothing else
 *   2. N2: every stage 2 session of twelve holds at least one foil and at most four; no stage 1 session holds one
 *   3. N8: the tolerance is 12 at stage 1, then 9, 7 and 6 up stage 2's tiers, and never under 6 for any tier asked
 *   4. seatCheck: a mirror seats at none of the 360 integer angles; a right piece seats at exactly the angles within its
 *      tolerance of the notch
 *   5. 3.5: from every disparity, turning either way, 15 degree key steps toward the notch land on it exactly; a piece 15 off
 *      never seats at the tightest tolerance
 *   6. a task starts turned by its disparity one way or the other, both ways come, and every piece is from the bank
 *   7. 3.10 FIND: the piece is in its panel exactly once, as itself; no decoy is the piece under any turn; six to nine regions
 *   8. a seed replays its sessions and another seed gives others
 *   9. engine.js, project.js and pieces.js touch no screen, clock or unseeded die
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const NOTCH = join(dirname(fileURLToPath(import.meta.url)), '..');
const fails = [];
const say = (ok, line) => { console.log((ok ? '  ok    ' : '  FAIL  ') + line); if (!ok) fails.push(line); };
let E = null, P = null, B = null;
try { E = await import('../engine.js'); B = await import('../pieces.js'); P = await import('../../math/core/pure.js'); say(true, 'engine.js and pieces.js load as ES modules'); }
catch (e) { say(false, 'engine.js and pieces.js load as ES modules (' + e.message.split('\n')[0] + ')'); }

const SEEDS = Array.from({ length: 20 }, (_, i) => 6000 + i * 7919);
const DISPARITIES = [0, 30, 60, 90, 120, 150, 180];
const norm = cells => { const mx = Math.min(...cells.map(c => c[0])), my = Math.min(...cells.map(c => c[1])); return cells.map(([x, y]) => [x - mx, y - my]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).map(c => c.join(',')).join(';'); };
const turns = cells => { const out = []; let c = cells; for (let k = 0; k < 4; k++) { out.push(norm(c)); c = c.map(([x, y]) => [y, -x]); } return out; };
const dist = a => { const d = ((a % 360) + 360) % 360; return Math.min(d, 360 - d); };

if (E && P && B) {
  /* 1 */
  {
    const bad = [];
    for (const seed of SEEDS) {
      const r = P.rng(seed >>> 0), counts = {};
      let n = 0;
      while (n < 500) for (const t of E.dealSession(r, { stage: 2, tier: 0 })) { if (n >= 500) break; counts[t.angularDisparity] = (counts[t.angularDisparity] || 0) + 1; n++; }
      const keys = Object.keys(counts).map(Number);
      if (keys.some(k => DISPARITIES.indexOf(k) < 0)) bad.push(seed + ' served ' + keys.join(','));
      for (const d of DISPARITIES) { const f = (counts[d] || 0) / 500; if (f < 0.12 || f > 0.17) bad.push(seed + ' ' + d + ' at ' + (f * 100).toFixed(1) + '%'); }
    }
    say(bad.length === 0, 'N3: over 500 stage 2 tasks, each disparity 0 to 180 by 30 comes 12 to 17 percent of the time, on 20 seeds' + (bad.length ? ': ' + bad.slice(0, 4).join('; ') : ''));
  }
  /* 2 */
  {
    const bad = [];
    for (const seed of SEEDS) {
      const r = P.rng(seed >>> 0);
      for (let s = 0; s < 10; s++) {
        const two = E.dealSession(r, { stage: 2, tier: s % 3 }), one = E.dealSession(r, { stage: 1, tier: 0 });
        const foils = two.filter(t => t.isMirror).length;
        if (two.length !== 12 || foils < 1 || foils > 4) bad.push(seed + ' stage 2 session ' + s + ': ' + foils + ' foils in ' + two.length);
        if (one.some(t => t.isMirror)) bad.push(seed + ' stage 1 session ' + s + ' holds a foil');
      }
    }
    say(bad.length === 0, 'N2: every stage 2 session of twelve holds one to four foils, and no stage 1 session holds one, on 20 seeds' + (bad.length ? ': ' + bad.slice(0, 4).join('; ') : ''));
  }
  /* 3 */
  {
    const got = [E.toleranceFor(1, 0), E.toleranceFor(2, 0), E.toleranceFor(2, 1), E.toleranceFor(2, 2)];
    const floor = [3, 4, 9, 50, -1].map(t => E.toleranceFor(2, t)).concat([E.toleranceFor(1, 7), E.toleranceFor(9, 9)]);
    say(JSON.stringify(got) === '[12,9,7,6]' && floor.every(t => t >= 6 && t <= 12), 'N8: tolerance 12 at stage 1, then 9, 7 and 6 up stage 2, never under 6 or over 12 for any tier asked (' + JSON.stringify(got) + ', ' + JSON.stringify(floor) + ')');
  }
  /* 4 */
  {
    const bad = [];
    for (const tol of [12, 9, 7, 6]) {
      const right = { isMirror: false, tolerance: tol }, mirror = { isMirror: true, tolerance: tol };
      for (let a = -180; a < 180; a++) {
        if (E.seatCheck(mirror, a)) bad.push('a mirror seats at ' + a);
        if (E.seatCheck(right, a) !== (dist(a) <= tol)) bad.push('tolerance ' + tol + ' at ' + a + ' gave ' + E.seatCheck(right, a));
      }
    }
    say(bad.length === 0, 'seatCheck: a mirror seats at none of 360 integer angles, a right piece at exactly those within its tolerance (12, 9, 7, 6)' + (bad.length ? ': ' + bad.slice(0, 4).join('; ') : ''));
  }
  /* 5 */
  {
    const bad = [];
    for (const d of DISPARITIES) for (const sign of [1, -1]) {
      let a = sign * d, k = 0;
      while (dist(a) !== 0 && k < 20) { a = E.keyStep(a, a > 0 ? -1 : 1); k++; }
      if (dist(a) !== 0) bad.push(sign * d + ' never reached the notch (' + a + ')');
    }
    if (E.seatCheck({ isMirror: false, tolerance: 6 }, 15) || E.seatCheck({ isMirror: false, tolerance: 6 }, -15)) bad.push('15 off seats at 6');
    if (E.keyStep(170, 1) !== -175 || E.keyStep(-180, -1) !== 165) bad.push('keyStep does not wrap (' + E.keyStep(170, 1) + ', ' + E.keyStep(-180, -1) + ')');
    say(bad.length === 0, '3.5: from every disparity either way, 15 degree keys land on the notch exactly; 15 off never seats at 6; angles wrap to one turn' + (bad.length ? ': ' + bad.join('; ') : ''));
  }
  /* 6 */
  {
    const bad = [];
    let pos = 0, neg = 0;
    for (const seed of SEEDS) {
      for (const t of E.dealSession(P.rng(seed >>> 0), { stage: 2, tier: 1 })) {
        if (!B.PIECES[t.pieceId]) bad.push(seed + ' ' + t.pieceId + ' is not in the bank');
        if (Math.abs(t.startAngle) !== t.angularDisparity) bad.push(seed + ' starts at ' + t.startAngle + ' for ' + t.angularDisparity);
        if (t.startAngle > 0) pos++; if (t.startAngle < 0) neg++;
        if (t.tolerance !== E.toleranceFor(2, 1)) bad.push(seed + ' tolerance ' + t.tolerance);
      }
    }
    say(bad.length === 0 && pos > 20 && neg > 20, 'a task starts turned by its disparity, both ways come, its piece is from the bank and its tolerance its stage\'s (' + pos + ' one way, ' + neg + ' the other)' + (bad.length ? ': ' + bad.slice(0, 4).join('; ') : ''));
  }
  /* 7 */
  {
    const bad = [];
    for (const seed of SEEDS) {
      const r = P.rng(seed >>> 0);
      for (let k = 0; k < 10; k++) {
        const f = E.dealFind(r, {});
        const target = B.PIECES[f.pieceId];
        if (!target) { bad.push(seed + ' no target'); continue; }
        const tKeys = turns(target.cells);
        const asItself = f.regions.filter(g => g.pieceId === f.pieceId && !g.mirror && (g.turn || 0) === 0);
        const sameShape = f.regions.filter(g => { const cells = E.regionCells(g); return tKeys.indexOf(norm(cells)) >= 0; });
        if (f.regions.length < 6 || f.regions.length > 9) bad.push(seed + ' ' + f.regions.length + ' regions');
        if (asItself.length !== 1) bad.push(seed + ' the piece as itself ' + asItself.length + ' times');
        if (sameShape.length !== 1) bad.push(seed + ' the piece\'s shape ' + sameShape.length + ' times under a turn');
      }
    }
    say(bad.length === 0, '3.10 FIND: the piece is in its panel exactly once as itself, no decoy is its shape under any turn, six to nine regions, on 20 seeds' + (bad.length ? ': ' + bad.slice(0, 4).join('; ') : ''));
  }
  /* 8 */
  {
    const a = JSON.stringify(E.dealSession(P.rng(42), { stage: 2, tier: 0 })), b = JSON.stringify(E.dealSession(P.rng(42), { stage: 2, tier: 0 })), c = JSON.stringify(E.dealSession(P.rng(43), { stage: 2, tier: 0 }));
    say(a === b && a !== c, 'a seed replays its session and another seed gives another');
  }
  /* 9 */
  for (const name of ['engine.js', 'project.js', 'pieces.js']) {
    let src = null;
    try { src = readFileSync(join(NOTCH, name), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, ''); } catch (e) { src = null; }
    if (src === null) { say(false, name + ' exists'); continue; }
    const names = ['document', 'window', 'Date', 'performance', 'setTimeout', 'setInterval', 'requestAnimationFrame'].filter(w => new RegExp('\\b' + w + '\\b').test(src))
      .concat(/Math\.random/.test(src) ? ['Math.random'] : []);
    say(names.length === 0, name + ' touches no screen, clock or unseeded die' + (names.length ? ': it names ' + names.join(', ') : ''));
  }
}

console.log('');
if (fails.length) { console.log(fails.length + ' ENGINE FAILURE(S)'); process.exit(1); }
console.log('ENGINE OK');
