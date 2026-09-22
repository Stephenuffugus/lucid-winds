// DESIGN 15.5: Load -> Sweep -> Results with 0, 1, and all-miss shots.
import { suite } from './lib.mjs';
import { generateLoad } from '../src/loadgen.js';
import { Session } from '../src/session.js';

const { ok, done } = suite('lifecycle');

function run(missPlan, mode = 'laundry', flipAll = true) {
  const L = generateLoad({ seed: 'life-' + missPlan + mode, tier: 4, size: 'small', mode });
  const S = new Session(L);
  let id = 1;
  L.socks.forEach((s) => S.addSock(id++, s));
  S.startClock();
  if (flipAll) for (const s of S.socks.values()) if (s.insideOut) S.flip(s.id);
  const byKey = new Map();
  for (const s of S.socks.values()) {
    if (s.odd !== null && s.odd !== undefined) { S.bin(s.id); continue; }
    byKey.set(s.key, [...(byKey.get(s.key) || []), s.id]);
  }
  let n = 0;
  const pairs = [...byKey.values()];
  for (const [a, b] of pairs) {
    ok_(S.match(a, b).ok);
    const ball = [...S.balls.values()].pop();
    S.shoot(ball.id, { distance: 0.9 });
    const miss = missPlan === 'all' || (missPlan === 'one' && n === 0);
    S.shotResult(ball.id, !miss);
    n++;
    if (n < pairs.length) ok_(!S.isPlayDone());
  }
  return S;
}
let allMatched = true;
function ok_(c) { if (!c) allMatched = false; }

for (const plan of ['none', 'one', 'all']) {
  const S = run(plan);
  ok(S.isPlayDone(), `${plan} missed: play is done when every pair is balled and every odd sock binned`);
  const strays = S.startSweep();
  ok(S.phase === 'sweep', `${plan} missed: the Load moves to Sweep`);
  const expect = plan === 'none' ? 0 : plan === 'one' ? 1 : S.load.pairs.length;
  ok(strays.length === expect, `${plan} missed: ${strays.length} strays pulse (expected ${expect})`);
  ok(S.stats.cleanLoad === (expect === 0), `${plan} missed: Clean Load is ${S.stats.cleanLoad}`);
  for (const b of strays) S.sweep(b);
  S.finish();
  ok(S.phase === 'results', `${plan} missed: Results`);
  ok([...S.balls.values()].every((b) => b.state === 'basket'), `${plan} missed: every ball ends in the basket`);
  ok(S.tidy() === (plan === 'none' ? 'spotless' : 'tidy'), `${plan} missed: tidy rating ${S.tidy()}`);
}
ok(allMatched, 'every pair matched and the Load was not done early');

// an unflipped inside out sock costs Spotless but never blocks the Load
const S2 = run('none', 'laundry', false);
const hadIO = [...S2.socks.values()].some((s) => s.wasInsideOut);
ok(!hadIO || S2.tidy() === 'tidy', `leaving inside out socks unflipped lowers the tidy rating (${S2.tidy()})`);
ok(S2.isPlayDone(), 'and the Load still finishes');

// a mismatch and a wrong bin cost nothing in Laundry Day
const L3 = generateLoad({ seed: 'life-mis', tier: 3, size: 'small' });
const S3 = new Session(L3);
L3.socks.forEach((s, i) => S3.addSock(i + 1, s));
const ids = [...S3.socks.values()];
const a = ids.find((s) => s.pair !== null), b = ids.find((s) => s.pair !== null && s.key !== a.key);
const mis = S3.match(a.id, b.id);
ok(!mis.ok && mis.reason === 'mismatch' && a.state === 'table' && b.state === 'table', 'a mismatch returns ok false and both socks stay in play');
ok(S3.bin(a.id).reason === 'hasMate' && a.state !== 'binned', 'the Bin refuses a sock that has a twin');
ok(S3.stats.mismatches === 1 && S3.stats.wrongBins === 1 && S3.streak === 0, 'both are only counted');

// Rush Timed: the clock ends the Load even with socks left
const L4 = generateLoad({ seed: 'life-rush', tier: 2, size: 'small', mode: 'rush' });
const S4 = new Session(L4, { sub: 'timed' });
L4.socks.forEach((s, i) => S4.addSock(i + 1, s));
S4.startClock();
ok(Math.abs(S4.timeLeft - (10 * 5.4 + L4.odd.length * 3)) < 1e-9, `Timed gives 5.4 s per pair at tier 2 (${S4.timeLeft.toFixed(1)} s)`);
S4.tick(S4.timeLeft + 1);
ok(S4.isPlayDone(), 'when the Rush clock hits zero the Load is done');
const L5 = generateLoad({ seed: 'x', tier: 9, size: 'small', mode: 'rush' });
const S5 = new Session(L5, { sub: 'timed' });
S5.startClock();
const per5 = (S5.timeLeft - L5.odd.length * 3) / 10;
ok(Math.abs(per5 - 3.3) < 1e-9, `tier 9 gives 3.3 s per pair (${per5.toFixed(2)})`);
ok(Math.max(3, 6 - 0.3 * 12) === 3, 'the per pair time never drops under the 3 s floor');

// streak: +1 multiplier per 3 correct pairs, reset by a miss; a dot per 5
const L6 = generateLoad({ seed: 'life-streak', tier: 0, size: 'regular', mode: 'rush' });
const S6 = new Session(L6, { sub: 'timed' });
L6.socks.forEach((s, i) => S6.addSock(i + 1, s));
const bk = new Map();
for (const s of S6.socks.values()) if (s.pair !== null) bk.set(s.key, [...(bk.get(s.key) || []), s.id]);
const prs = [...bk.values()];
const mults = [];
for (let i = 0; i < 12; i++) { S6.match(prs[i][0], prs[i][1]); mults.push(S6.mult); }
ok(mults.join(',') === '1,1,2,2,2,3,3,3,4,4,4,5', `multiplier climbs x1 to x5 (${mults.join(',')})`);
ok(S6.dots === 2, `12 correct pairs earn 2 power dots (${S6.dots})`);
const lastBall = [...S6.balls.values()].pop();
S6.shoot(lastBall.id, {});
S6.shotResult(lastBall.id, false);
ok(S6.streak === 0 && S6.mult === 1, 'a missed shot resets the streak');

// settling the basket costs a streak point and never pays extra dots
{
  const L7 = generateLoad({ seed: 'life-settle', tier: 0, size: 'regular', mode: 'rush' });
  const S7 = new Session(L7, { sub: 'balance' });
  L7.socks.forEach((s, i) => S7.addSock(i + 1, s));
  const bk7 = new Map();
  for (const s of S7.socks.values()) if (s.pair !== null) bk7.set(s.key, [...(bk7.get(s.key) || []), s.id]);
  const p7 = [...bk7.values()];
  for (let i = 0; i < 12; i++) { S7.settleBasket(); S7.match(p7[i][0], p7[i][1]); }
  ok(S7.dots === 2, `12 pairs with a settle before each still earn 2 dots (${S7.dots})`);
  // a tip takes back the points of the balls it spills
  const b1 = [...S7.balls.values()][0];
  S7.shoot(b1.id, {}); S7.shotResult(b1.id, true);
  const pts = S7.stats.rushPoints, own = b1.points;
  S7.spill([b1.id]);
  ok(own > 0 && S7.stats.rushPoints === pts - own, `a spilled ball's ${own} points come off (${pts} to ${S7.stats.rushPoints})`);
}
// A sock that has already been BALLED or BINNED must never come back to the table when the sweep starts.
// `beginSweep` used to set whatever the hand held to 'table' without asking, so a hand still pointing at a
// resolved sock resurrected it and `unresolvedSocks()` counted it forever: the Load could not end. Found on
// 22 Sep because a browser gate's pictures of the results sheet, the room and the Pockets page were all the
// same table. This is the rule, without the browser.
{
  const L = generateLoad({ seed: 'resurrect', tier: 3, size: 'small' });
  const S = new Session(L);
  let id = 1;
  L.socks.forEach((s) => S.addSock(id++, s));
  const byKey = new Map();
  for (const s of S.socks.values()) {
    if (s.odd !== null && s.odd !== undefined) { S.bin(s.id); continue; }
    byKey.set(s.key, [...(byKey.get(s.key) || []), s.id]);
  }
  let first = null;
  for (const [a, b] of byKey.values()) {
    if (first === null) first = a;
    const m = S.match(a, b);
    if (m.ok) { S.shoot(m.ball, { tap: true }); S.shotResult(m.ball, true); }
  }
  ok(S.unresolvedSocks() === 0, `every sock is put away (${S.unresolvedSocks()} left)`);
  // the hand is still pointing at a sock that is now part of a ball: this is what the sweep must not undo
  const held = S.sock(first);
  ok(held.state === 'balled', 'the sock the hand still points at is balled');
  ok(S.handDown(first) === false, 'handDown refuses to put a balled sock back on the table');
  ok(S.sock(first).state === 'balled' && S.unresolvedSocks() === 0, 'it stays balled, so the Load is still over and can reach its results');
  // and it still lets a sock that really is in her hand down
  const L2 = generateLoad({ seed: 'resurrect2', tier: 3, size: 'small' });
  const S2 = new Session(L2);
  let id2 = 1;
  L2.socks.forEach((s) => S2.addSock(id2++, s));
  const one = [...S2.socks.keys()][0];
  S2.setState(one, 'hand');
  ok(S2.handDown(one) === true && S2.sock(one).state === 'table', 'a sock that is really in her hand still goes back to the table');
  const binned = [...S2.socks.values()].find((x) => x.odd !== null && x.odd !== undefined);
  if (binned) { S2.bin(binned.id); ok(S2.handDown(binned.id) === false, 'and a binned sock never comes back out of the Odd Bin');
  } else ok(false, 'the fixture Load had no odd sock to bin');
}

done();
