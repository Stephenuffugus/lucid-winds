// RUSH WITHOUT A CUTOFF (Stephen, 23 Sep 2026): "on the rush version it shouldn't stop when your time's up. It should be
// like you still have as long as you want to do it, but there's three different goal time limits or even four. You
// could have your bronze silver gold and platinum time based on the load size and speed instead of having it cut you
// off in the middle of trying to play."
//
// So a Timed Rush (and Basket Balance, which runs on the same clock) never ends by the clock: it ends when the table is
// clear, like Laundry Day, and the time it took is set against four times that come from the Load itself. The old
// clock (seconds a pair by tier, plus a little for each odd sock) is the GOLD time; platinum is under seven tenths of
// it, silver under 1.4 times, bronze under 1.9. A medal pays a points bonus, so the Daily's score still rewards speed.
// Endless keeps its clock: every basket buys time, and running out IS the game.
import { suite } from './lib.mjs';
import { generateLoad } from '../src/loadgen.js';
import { Session, RUSH } from '../src/session.js';

const { ok, done } = suite('rush');

const load = (seed, size = 'regular', tier = 2) => generateLoad({ seed, tier, size, mode: 'rush' });
const start = (L, sub = 'timed') => { const S = new Session(L, { sub }); L.socks.forEach((s, i) => S.addSock(i + 1, s)); S.startClock(); return S; };
const fmt = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;

// 1. the clock never ends a Timed Rush
{
  const L = load('rush-no-cutoff');
  const S = start(L);
  const par = L.pairs.length * Math.max(RUSH.perPairFloor, RUSH.perPairBase - RUSH.perPairStep * L.tier) + L.odd.length * RUSH.perOdd;
  ok(Math.abs(S.par - par) < 1e-9, `the Load's gold time is the old clock: ${fmt(par)} for ${L.pairs.length} pairs and ${L.odd.length} odd at tier ${L.tier}`);
  S.tick(par * 3);
  ok(!S.isPlayDone(), `three times the gold time later the Load is still hers (clock ${fmt(S.clock)})`);
  ok(S.timeLeft === Infinity, 'a Timed Rush has no time left to run out of');
}

// 2. the four times come from the Load: bigger Loads and higher tiers move them
{
  const a = start(load('rush-size-a', 'small', 0)), b = start(load('rush-size-b', 'heavy', 0)), c = start(load('rush-size-c', 'small', 8));
  const t = (S) => S.medalTimes;
  ok(t(a).platinum < t(a).gold && t(a).gold < t(a).silver && t(a).silver < t(a).bronze, `platinum under gold under silver under bronze (${fmt(t(a).platinum)}, ${fmt(t(a).gold)}, ${fmt(t(a).silver)}, ${fmt(t(a).bronze)})`);
  ok(t(b).gold > t(a).gold, `a Heavy Load's gold time is longer than a Small one's (${fmt(t(b).gold)} against ${fmt(t(a).gold)})`);
  ok(t(c).gold < t(a).gold, `a higher tier asks for a faster gold on the same size (${fmt(t(c).gold)} against ${fmt(t(a).gold)})`);
  ok(Math.abs(t(a).gold - a.par) < 1e-9 && Math.abs(t(a).platinum - a.par * RUSH.medals.platinum) < 1e-9, 'gold is the old clock and platinum is its fraction');
}

// 3. finishing sets the medal from the time, and a medal pays a bonus into the points
{
  const cases = [['platinum', 0.5], ['gold', 0.9], ['silver', 1.2], ['bronze', 1.7], [null, 2.5]];
  for (const [medal, k] of cases) {
    const L = load('rush-medal-' + k);
    const S = start(L);
    ok(S.medalFor(S.par * k) === medal, `${(k * 100).toFixed(0)} percent of the gold time is ${medal || 'no medal'}`);
    // finish the Load: every pair matched and basketed, the clock at k times par
    let n = 0;
    while (true) {
      const byKey = new Map();
      for (const s of S.socks.values()) if (s.state === 'table' && s.pair !== null && s.pair !== undefined) byKey.set(s.key, [...(byKey.get(s.key) || []), s.id]);
      const pair = [...byKey.values()].find((v) => v.length === 2);
      if (!pair) break;
      const r = S.match(pair[0], pair[1]);
      S.shoot(r.ball, { tap: true });
      S.shotResult(r.ball, true);
      n++;
    }
    for (const s of S.socks.values()) if (s.state === 'table') S.bin(s.id);
    S.tick(S.par * k);
    ok(S.isPlayDone(), `with the table clear the Load is done (${n} pairs)`);
    const before = S.stats.rushPoints;
    S.startSweep();
    const bonus = medal ? RUSH.medalBonus[medal] : 0;
    ok(S.medal === medal && S.stats.rushPoints === before + bonus && S.stats.medalBonus === bonus, `the sweep awards ${medal || 'nothing'} and ${bonus} points on top of ${before}`);
  }
}

// 4. a Load ended early (the dev hook, an abandoned table) earns no medal
{
  const L = load('rush-forced');
  const S = start(L);
  S.forceDone = true;
  ok(S.isPlayDone(), 'a forced end is an end');
  S.startSweep();
  ok(S.medal === null && !S.stats.medalBonus, 'and pays no medal');
}

// 5. Endless keeps its clock
{
  const L = load('rush-endless');
  const S = start(L, 'endless');
  ok(Math.abs(S.timeLeft - RUSH.endlessStart) < 1e-9, `Endless starts with ${RUSH.endlessStart} s`);
  S.tick(RUSH.endlessStart + 1);
  ok(S.isPlayDone(), 'and ends when it runs out');
  ok(S.medalTimes === null, 'Endless has no medal times');
}

done();
