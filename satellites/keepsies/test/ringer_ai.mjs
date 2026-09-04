/**
 * Ringer played for real, by two planners, with the actual physics.
 *
 *   node test/ringer_ai.mjs [games]
 *
 * `ringer_rules` proves the referee against a generator. This proves the whole
 * thing together: the planner, the contact patch, the pocketing rule and the
 * referee, in one loop, and it is the only gate that can tell you a game of
 * Keepsies actually ENDS in a number of shots a person would sit through.
 *
 * It also asks whether the ladder means anything, which is the question the
 * difficulty numbers exist to answer: a Shark must beat a Rookie clearly, and
 * two Rookies must be about even, or the tiers are decoration.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { initPhysics } from '../src/core/physics.js?v=20260904a';
import { createRinger } from '../src/game/ringer.js?v=20260904a';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const T = JSON.parse(readFileSync(join(ROOT, 'src/data/tuning.json'), 'utf8'));
const GAMES = parseInt(process.argv[2] || '20', 10);

await initPhysics();

function playSet(label, a, b, n, seed0) {
  const shots = [];
  const wins = [0, 0];
  let unfinished = 0, techniques = {};
  for (let g = 0; g < n; g++) {
    const R = createRinger({
      tuning: T, seed: seed0 + g, skipLag: false,
      houseRules: { keepsies: true, slips: true, bombing: false, poison: g % 4 === 0, ringSizeFt: 10 },
      players: [
        { name: 'A', ai: a, tawEntry: 'taw_clearie' },
        { name: 'B', ai: b, tawEntry: 'taw_clearie' }
      ]
    });
    R.doLag();
    let guard = 0;
    while (R.state.phase !== 'over' && guard++ < 400) {
      if (!R.state.simulating) R.aiTurn();
      let k = 0;
      while (R.state.simulating && k++ < 1400) R.tick();
      if (k >= 1400) break;   // a shot that never resolved; the assertion below catches it
    }
    const s = R.summary();
    if (R.state.phase !== 'over' || s.winner == null) unfinished++;
    else { wins[s.winner]++; shots.push(s.shots); }
    for (const t of R.state.techniques) techniques[t] = (techniques[t] || 0) + 1;
    R.dispose();
  }
  const mean = shots.length ? shots.reduce((x, y) => x + y, 0) / shots.length : 0;
  return { label, wins, shots, mean, worst: shots.length ? Math.max(...shots) : 0, best: shots.length ? Math.min(...shots) : 0, unfinished, techniques };
}

const fails = [];
const t0 = Date.now();

const mirror = playSet('rookie vs rookie', 'rookie', 'rookie', GAMES, 5000);
const ladder = playSet('shark vs rookie', 'shark', 'rookie', GAMES, 6000);
const wall = ((Date.now() - t0) / 1000).toFixed(1);

for (const set of [mirror, ladder]) {
  console.log(set.label.padEnd(18) + ' wins ' + set.wins.join(' / ')
    + '   shots ' + set.mean.toFixed(1) + ' mean, ' + set.best + ' to ' + set.worst
    + '   unfinished ' + set.unfinished);
  if (set.unfinished) fails.push(set.label + ': ' + set.unfinished + ' games did not finish');
  if (set.best < 4) fails.push(set.label + ': a game ended in ' + set.best + ' shots, which is not a game');
  if (set.worst > 90) fails.push(set.label + ': a game took ' + set.worst + ' shots, which is not one either');
}
const techniques = Object.assign({}, mirror.techniques, ladder.techniques);
console.log('techniques         ' + (Object.keys(techniques).length ? JSON.stringify(techniques) : 'none earned'));
console.log('wall clock         ' + wall + ' s for ' + (GAMES * 2) + ' games');

// two of the same must be about even, or something is favouring a seat
const mirrorRate = mirror.wins[0] / Math.max(1, mirror.wins[0] + mirror.wins[1]);
console.log('seat fairness      ' + (mirrorRate * 100).toFixed(0) + '% to seat one, the band is 20 to 80');
if (mirrorRate < 0.20 || mirrorRate > 0.80) fails.push('mirror matches are lopsided at ' + (mirrorRate * 100).toFixed(0) + '%');

// and the ladder must mean something
const sharkRate = ladder.wins[0] / Math.max(1, ladder.wins[0] + ladder.wins[1]);
console.log('the ladder         Shark takes ' + (sharkRate * 100).toFixed(0) + '% off a Rookie, the floor is 65');
if (sharkRate < 0.65) fails.push('a Shark only beats a Rookie ' + (sharkRate * 100).toFixed(0) + '% of the time, so the tiers are decoration');

if (fails.length) {
  console.log('\n' + fails.length + ' problem' + (fails.length > 1 ? 's' : '') + ':');
  for (const f of fails) console.log('  ' + f);
  console.log('RINGER AI FAILED');
  process.exit(1);
}
console.log('\nRINGER AI OK');
