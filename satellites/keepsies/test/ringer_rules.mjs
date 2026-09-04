/**
 * The Ringer referee, five hundred games.
 *
 *   node test/ringer_rules.mjs [games]
 *
 * This tests the RULES, not the physics. The physics has its own gate
 * (`ringer_break`) and running five hundred real games of it would take about
 * ninety minutes on this box for no extra truth: a state machine fed real
 * outcomes and a state machine fed plausible ones takes the same transitions.
 * So the shot outcomes come from a seeded generator with a realistic shape and
 * every invariant the rules promise is asserted on every game.
 *
 * What it asserts, and every one of them has been watched to fail:
 *   - every game ends, and inside a sane number of shots
 *   - the winner holds seven or more and the loser does not, and the game ends once
 *   - marbles are CONSERVED: pocketed plus still in the ring is always thirteen
 *   - shoot again fires exactly when a mib left, and never otherwise
 *   - poison only ever fires when the house rule is on
 *   - a player never shoots after being poisoned out
 *   - a slip is spent at most once per player per game and never consumes a turn
 */
import { createMatch, skipLag, resolveLag, mayPlace, placeTaw, fireShot, resolveShot, summary, PHASE, DEFAULT_HOUSE_RULES } from '../src/core/rules-ringer.js?v=20260904c';
import { makeRng } from '../src/core/rng.js?v=20260904c';

const GAMES = parseInt(process.argv[2] || '500', 10);
const RING = 1.525;

const fails = [];
const bad = (msg) => { if (fails.length < 12) fails.push(msg); };

/** Thirteen mibs, named so the conservation check has something to count. */
function crossUids() {
  const a = [];
  for (let i = 0; i < 13; i++) a.push('mib-' + i);
  return a;
}

/**
 * A plausible shot. Most shots knock nothing out, a good one takes one or two,
 * a break takes up to three, and the taw leaves the ring more often than not,
 * which is what ringer_break actually measured (the taw stayed in on 17.5% of
 * breaks). Poison shots are rare and only attempted when the rule is on.
 */
function shotOutcome(M, rng) {
  const p = M.players[M.turn];
  const foe = M.players[(M.turn + 1) % M.players.length];
  const roll = rng.next();
  let n = 0;
  if (M.firstShotOfTurn) n = roll < 0.07 ? 0 : (roll < 0.42 ? 1 : (roll < 0.83 ? 2 : 3));
  else n = roll < 0.46 ? 0 : (roll < 0.86 ? 1 : 2);
  n = Math.min(n, M.mibs.length);
  const pocketed = [];
  for (let i = 0; i < n; i++) pocketed.push(M.mibs[rng.int(M.mibs.length - i)] || M.mibs[i]);
  const uniq = [...new Set(pocketed)];

  const tawOut = rng.next() < (M.firstShotOfTurn ? 0.82 : 0.35);
  const knocked = [];
  let foeOut = !foe.tawInside;
  // ⛔ The knock out is attempted WHETHER OR NOT the rule is on. The first
  // version only tried it when poison was enabled, which meant the assertion
  // "poison never fires with the rule off" could not fail: deleting the house
  // rule check from the referee left the test green. A probe that cannot fail is
  // not evidence. Now the referee is handed the same enemy taw knocked out of
  // the ring in both kinds of game, and it must only act on it in one.
  if (!foe.poisonedOut && foe.tawInside && rng.next() < 0.10) {
    foeOut = true;
    knocked.push(foe.tawUid);
  }
  return {
    pocketed: uniq,
    knockedOut: knocked,
    taws: [
      { uid: p.tawUid, inside: !tawOut, x: 0, z: 0 },
      { uid: foe.tawUid, inside: !foeOut, x: 0, z: 0 }
    ],
    firstStruckUid: uniq[0] || null,
    tawRestDistanceToStruck: rng.next() * 0.4
  };
}

let ended = 0, totalShots = 0, poisonGames = 0, poisonFired = 0, slipsSeen = 0, shootAgains = 0;
let maxShots = 0, winnerPocketed = new Set();

for (let g = 0; g < GAMES; g++) {
  const rng = makeRng(1000 + g);
  const poison = (g % 3) === 0;
  const M = createMatch({
    ringRadius: RING,
    mibs: crossUids(),
    players: [{ name: 'A', tawUid: 'taw-A' }, { name: 'B', tawUid: 'taw-B' }],
    houseRules: Object.assign({}, DEFAULT_HOUSE_RULES, { poison })
  });
  if (poison) poisonGames++;

  if (rng.next() < 0.5) skipLag(M, rng);
  else resolveLag(M, [-(rng.next() * 0.4), -(rng.next() * 0.4)]);

  let guard = 0;
  while (M.phase !== PHASE.OVER && guard++ < 600) {
    const before = M.players[M.turn];
    if (before.poisonedOut) { bad('game ' + g + ': a poisoned out player is on shot'); break; }
    const shotsBefore = M.shotNumber;

    if (mayPlace(M)) placeTaw(M, { x: 0, z: -RING });

    // once per game, hand the referee a genuine slip and check it costs nothing
    const doSlip = (guard === 3 && before.slipsLeft > 0);
    const aim = { power01: 0.6, contactOffset: { x: 0, y: 0 }, wildness01: 0, slipped: doSlip };
    const fired = fireShot(M, aim);
    if (fired.spentSlip) {
      slipsSeen++;
      if (M.shotNumber !== shotsBefore) bad('game ' + g + ': a slip consumed a shot');
      if (M.phase !== PHASE.TURN) bad('game ' + g + ': a slip left the phase at ' + M.phase);
      if (M.turn !== before.index) bad('game ' + g + ': a slip passed the turn');
      continue;
    }

    const out = shotOutcome(M, rng);
    const mibsBefore = M.mibs.length;
    const r = resolveShot(M, out);
    const exited = mibsBefore - M.mibs.length;

    if (exited > 0 && !r.over && !r.shootAgain) bad('game ' + g + ': a mib left and the shooter did not shoot again');
    if (exited === 0 && r.shootAgain) bad('game ' + g + ': shoot again fired with nothing pocketed');
    if (r.shootAgain) shootAgains++;

    const total = M.mibs.length + M.players.reduce((s, p) => s + p.pocketed.length, 0);
    if (total !== 13) bad('game ' + g + ': ' + total + ' marbles exist, there are thirteen');
    for (const p of M.players) if (p.slipsLeft < 0 || p.slipsLeft > 1) bad('game ' + g + ': slipsLeft is ' + p.slipsLeft);
  }

  const s = summary(M);
  if (M.phase !== PHASE.OVER) { bad('game ' + g + ': never ended, ' + guard + ' iterations, phase ' + M.phase); continue; }
  ended++;
  totalShots += s.shots;
  maxShots = Math.max(maxShots, s.shots);
  if (s.winner == null) bad('game ' + g + ': ended with no winner and was not abandoned');
  else {
    winnerPocketed.add(s.pocketed[s.winner]);
    const emptiedByPoison = M.log.some(l => l.type === 'over' && l.reason === 'ring empty');
    // ⛔ NOT "exactly seven". The first version of this test asserted that and
    // failed on a fifth of the games, and the test was wrong, not the referee: a
    // shot that pockets three takes a player from six to nine, and they have won
    // at seven. The real rule is first PAST seven, and the only way to win with
    // fewer is the poison ending, where the ring runs out with an opponent out.
    if (!emptiedByPoison && s.pocketed[s.winner] < 7)
      bad('game ' + g + ': winner holds ' + s.pocketed[s.winner] + ', under seven, and the ring was not emptied');
    const loser = s.pocketed[(s.winner + 1) % 2];
    if (loser >= 7) bad('game ' + g + ': the loser holds ' + loser + ' and did not win');
    const overs = M.log.filter(l => l.type === 'over').length;
    if (overs !== 1) bad('game ' + g + ': the game ended ' + overs + ' times');
  }
  const poisonEvents = M.log.filter(l => l.type === 'poison').length;
  if (poisonEvents && !poison) bad('game ' + g + ': poison fired with the rule off');
  if (poisonEvents) poisonFired++;
}

console.log('games              ' + ended + ' of ' + GAMES + ' ended');
console.log('shots              ' + (totalShots / Math.max(1, ended)).toFixed(1) + ' mean, ' + maxShots + ' worst');
console.log('shoot again        ' + shootAgains + ' times');
console.log('winner pocketed    ' + [...winnerPocketed].sort((a, b) => a - b).join(', ') + ' (seven or more, a shot can take three at once)');
console.log('poison             fired in ' + poisonFired + ' of the ' + poisonGames + ' games with the rule on, and 0 with it off');
console.log('slips              ' + slipsSeen + ' spent, never consuming a shot or a turn');

if (ended !== GAMES) bad(GAMES - ended + ' games did not end');
if (fails.length) {
  console.log('\n' + fails.length + ' problem' + (fails.length > 1 ? 's' : '') + ':');
  for (const f of fails) console.log('  ' + f);
  console.log('RINGER RULES FAILED');
  process.exit(1);
}
console.log('\nRINGER RULES OK');
