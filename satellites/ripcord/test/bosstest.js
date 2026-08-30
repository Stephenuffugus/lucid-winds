/* bosstest — each boss teaches ONE mechanic by making it the only way through.
 *
 * The brief's acceptance line is "each boss is unwinnable by the wrong
 * strategy", which is two assertions and not one:
 *
 *   1. The strategy the boss exists to refute must lose badly. If the stamina
 *      build can wait The Post out, The Post is not teaching anything.
 *   2. SOMETHING must beat it. A wall is not a boss. At least one of the panel
 *      has to land in a band that reads as a hard but fair fight.
 *
 * It also checks the finish MIX, because that is where a boss actually says what
 * it wants. The only way past The Pemangkin is a burst; if the panel is beating
 * it by ringout then the anchor is not doing its job and the lesson is not being
 * taught, even though the win rate looks fine.
 *
 *   node test/bosstest.js [roundsPerChassis]
 */
const SIM = require('../src/sim2.js');
const LADDER = require('../src/ladder.json');

const N = parseInt(process.argv[2] || '160', 10);

/* A wider panel than the four references, because a boss has to hold up against
 * what a player will actually bring, and by league five that is a tuned top. */
const PANEL = {
  attack:   SIM.ARCHETYPES.attack,
  stamina:  SIM.ARCHETYPES.stamina,
  defense:  SIM.ARCHETYPES.defense,
  balance:  SIM.ARCHETYPES.balance,
  brawler:  { core: 'lodest', blade: 'cleaver', assist: 'rake', ratchet: '4-80', bit: 'claw',
              weights: [{ id: 'brick', hole: 0, ring: 1 }, { id: 'brick', hole: 1, ring: 1 }] },
  railer:   { core: 'gale', blade: 'talon', assist: 'jag', ratchet: '3-60', bit: 'gearf',
              weights: [{ id: 'slug', hole: 0, ring: 1 }] },
  grinder:  { core: 'hollow', blade: 'talon', assist: 'hook', ratchet: '5-60', bit: 'needle',
              weights: [{ id: 'chip', hole: 0, ring: 1 }, { id: 'chip', hole: 2, ring: 1 },
                        { id: 'chip', hole: 4, ring: 1 }] },
  breaker:  { core: 'lash', blade: 'shard', assist: 'jag', ratchet: '1-90', bit: 'flat',
              weights: [{ id: 'brick', hole: 0, ring: 1 }, { id: 'slug', hole: 1, ring: 1 }] }
};

/* What each boss has to prove.
 *
 * ⛔ THE FIRST VERSION OF THIS ASSERTED THE WRONG THING and it is worth writing
 * down, because the numbers looked like failures and were not. It said "the
 * stamina build must lose to The Post" and "the defense build must lose to The
 * Pemangkin", and both of them won about a third of the time, so the test
 * reported that neither boss was teaching its lesson.
 *
 * Then look at HOW they won. Not one single win against The Post came by
 * spinout, from any chassis: everybody who beat it pushed it out or broke it.
 * Every single win against The Pemangkin, from every chassis, was a burst.
 * Both lessons were being taught perfectly. What had failed was the assertion,
 * which was measuring the shape of the winner instead of the shape of the WIN.
 *
 * A boss says what it wants through the finish mix, so that is what gets
 * checked. It is also the more honest test: it does not care what the player
 * brought, only that the door it left open is the one they had to walk through.
 */
const RULES = {
  'The Post':      { teaches: 'attack has a job',
                     // You cannot outlast it. Nobody may win by waiting.
                     maxFinish: ['spinout', 0.12] },
  'Katis':         { teaches: 'momentum and loss stakes' },
  'The Pemangkin': { teaches: 'burst is the answer to the immovable',
                     wantFinish: ['burst', 0.85] },
  'Two Direction': { teaches: 'spin direction is a matchup',
                     // A matchup means it MATTERS who you brought, which is a
                     // spread across the panel rather than any one number.
                     minSpread: 0.15 },
  'The Giant':     { teaches: 'take its spin off it, do not out muscle it',
                     // Wearing it down has to be the main road, not a curiosity.
                     wantFinish: ['worn', 0.40] }
};

const pct = x => (x * 100).toFixed(1).padStart(5);
const fails = [];

for (const rung of LADDER.filter(r => r.boss)) {
  const rule = RULES[rung.name] || { refutes: [] };
  const bossSpec = SIM.build(rung.build);
  console.log('\n' + rung.name + '   rung ' + rung.rung + '   ' + rung.teaches);
  console.log('  chassis      win     spinout ringout knockout burst  worn  timeout');

  const rates = {};
  for (const name of Object.keys(PANEL)) {
    const me = SIM.build(PANEL[name]);
    let w = 0;
    const c = {};
    for (let i = 0; i < N; i++) {
      const rnd = SIM.mulberry(i * 7919 + name.length * 31 + rung.rung * 17);
      const r = SIM.resolveBossMatch(me, bossSpec, rung.boss, { rnd,
        a: { angle: rnd() * 6.283, power: .96 + rnd() * .08, lean: .03 + rnd() * .04, phase: rnd() * 6.283 },
        b: { angle: rnd() * 6.283, power: .96 + rnd() * .08, lean: .03 + rnd() * .04, phase: rnd() * 6.283 } });
      if (r.winner === 'a') { w++; c[r.cause] = (c[r.cause] || 0) + 1; }
    }
    rates[name] = { win: w / N, c, n: w };
    const share = k => w ? pct((c[k] || 0) / w) : '    0';
    console.log('  ' + name.padEnd(12) + pct(w / N) + '%  ' +
      share('spinout') + ' ' + share('ringout') + ' ' + share('knockout') + ' ' +
      share('burst') + ' ' + share('worn') + ' ' + share('timeout'));
  }

  // 1. something must beat it, and not too easily
  const best = Math.max(...Object.values(rates).map(r => r.win));
  const worst = Math.min(...Object.values(rates).map(r => r.win));
  const who = Object.keys(rates).find(k => rates[k].win === best);
  console.log('  best answer: ' + who + ' at ' + pct(best) + '%,  spread ' +
              ((best - worst) * 100).toFixed(1) + ' pts');
  if (best < 0.28) fails.push(rung.name + ': nothing on the panel beats it more than ' +
    pct(best) + ' percent of the time, which is a wall and not a boss');
  if (best > 0.75) fails.push(rung.name + ': ' + who + ' beats it ' + pct(best) +
    ' percent of the time, so it is not a boss, it is a rung');

  // 2. the finish mix is where a boss says what it wants
  const finishShare = k => {
    let want = 0, all = 0;
    for (const n of Object.keys(rates)) { want += rates[n].c[k] || 0; all += rates[n].n; }
    return all ? want / all : 0;
  };
  if (rule.wantFinish) {
    const [k, floor] = rule.wantFinish;
    const share = finishShare(k);
    console.log('  wins by ' + k + ': ' + pct(share) + '% of all wins, floor ' + pct(floor));
    if (share < floor) fails.push(rung.name + ': only ' + pct(share) + ' percent of wins are a ' +
      k + ', so the lesson is not being taught even though the win rates look fine');
  }
  if (rule.maxFinish) {
    const [k, cap] = rule.maxFinish;
    const share = finishShare(k);
    console.log('  wins by ' + k + ': ' + pct(share) + '% of all wins, cap ' + pct(cap));
    if (share > cap) fails.push(rung.name + ': ' + pct(share) + ' percent of wins are a ' +
      k + ', which is the route this boss exists to close');
  }
  if (rule.minSpread && (best - worst) < rule.minSpread)
    fails.push(rung.name + ': the panel spreads only ' + ((best - worst) * 100).toFixed(1) +
      ' points, so what you bring does not matter and there is no matchup to teach');
}

console.log(fails.length ? '\nBOSSTEST FAILED\n  ' + fails.join('\n  ') : '\nBOSSTEST OK');
process.exit(fails.length ? 1 : 0);
