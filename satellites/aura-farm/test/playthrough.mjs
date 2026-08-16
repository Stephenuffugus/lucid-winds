/* A bot that plays Aura Farm start to finish.
   The assertion suite proves the pieces; this proves the LOOP closes: fourteen
   days of real simulation, real focus regeneration, real Mara, real contracts,
   real letters, into the ending and on into the Endless Dusk.
   Run: node test/playthrough.mjs */

import { boot, check, group, eq, ok, gte, report } from './harness.mjs';

const DT = 0.1;

function playRun(opts = {}) {
  const b = boot({ storage: opts.storage });
  b.T._run('_seedRng(' + (opts.seed || 20260816) + ')');
  b.T._run('startGame(true)');

  const log = [];
  let guard = 0;
  const HARD_STOP = 400000;

  while (guard++ < HARD_STOP) {
    const T = b.T;
    if (T.mode === 'over' || T.mode === 'ending') break;

    /* Clear whatever modal the day flow has raised. */
    if (T.modalOpen) {
      if (T.run && T.run.dayT <= 0) {
        // dusk report -> next day -> fold the morning letter
        const d = T.run.day;
        b.T._run('nextDay()');
        b.T._run('foldLetter()');
        log.push('day ' + d + ' cleared, balance ' + T.run.essence);
        if (opts.endless && T.run.day > 14 + (opts.endlessDays || 3)) break;
        continue;
      }
      b.T._run('closeModal()');
      continue;
    }
    if (!T.run) break;

    /* Choose a target: the ripest idle soul in this venue. */
    const venue = T.run.venue;
    let best = null, bs = -1;
    for (const d of T.ROSTER) {
      if (d.venue !== venue) continue;
      const n = T.run.npcs[d.id];
      if (n.state !== 'idle') continue;
      const score = n.i + (n.peak > 0 ? 1 : 0);
      if (score > bs) { bs = score; best = d.id; }
    }

    if (best) {
      T.selected = best;
      const n = T.run.npcs[best];
      if (n.peak > 0 && Math.abs(n.v) >= 0.25 && T.run.focus >= 10) {
        b.T._run('harvest()');
      } else if (T.run.focus >= 20 && !(T.cooldowns.hype > 0)) {
        b.T._run('doAction("' + (n.v < -0.3 ? 'snide' : 'hype') + '")');
      }
      /* Keep Mara honest when she is mid deep drain. */
      if (T.run.mara && T.run.mara.deep > 0 && T.run.focus > 40) b.T._run('shooMara()');
    }
    b.T._run('update(' + DT + ')');
  }
  return { b, log, guard };
}

group('Full playthrough: a bot plays a whole season');

check('a bot survives fourteen days and reaches an ending', () => {
  const { b, log, guard } = playRun();
  ok(guard < 400000, 'the bot never terminated');
  if (b.T.mode === 'over') {
    throw new Error('the bot withered on day ' + (b.T._run('meta.rep.runs.length') >= 0 ? 'unknown' : '?') +
      '. Days cleared: ' + log.length + '. Last: ' + (log[log.length - 1] || 'none'));
  }
  eq(b.T.mode, 'ending', 'did not reach the ending');
  eq(log.length, 13, 'expected thirteen dusks before the fourteenth day ends the run');
});

check('the ending records exactly one result in reputation', () => {
  const { b } = playRun();
  eq(b.T.meta.rep.runs.length, 1, 'wrong number of recorded runs');
  ok(['lum', 'gray', 'reap'].includes(b.T.meta.rep.runs[0].t), 'bad run type');
});

check('a full season fills the specimen case and earns relics', () => {
  const { b } = playRun();
  gte(Object.keys(b.T.meta.case).length, 5, 'almost no specimens kept over a whole season');
  gte(Object.keys(b.T.meta.relics).length, 1, 'no relic earned in fourteen days of contracts');
});

check('a full season unlocks venues beyond the park', () => {
  const { b } = playRun();
  const unlocked = b.T.VENUES.filter(v => b.T.run && b.T.run.unlocked[v.id]).length;
  gte(unlocked, 2, 'the bot never opened a second venue');
});

check('the run survives being saved and reloaded mid season', () => {
  const b = boot();
  b.T._run('_seedRng(99); startGame(true);');
  for (let i = 0; i < 200; i++) b.T._run('update(0.1)');
  b.T.run.essence = 4242;
  b.T._run('saveRun()');
  const c = boot({ localStorage: b.localStorage });
  c.T._run('startGame(false)');
  eq(c.T.run.essence, 4242, 'mid season reload lost the wallet');
  eq(c.T.mode, 'play');
  for (let i = 0; i < 200; i++) c.T._run('update(0.1)');
  ok(c.T.mode === 'play' || c.T.mode === 'over', 'reloaded run entered a bad mode');
});

check('the endless dusk keeps running past day fourteen', () => {
  const { b } = playRun();
  eq(b.T.mode, 'ending');
  b.T._run('enterEndless()');
  b.T._run('foldLetter()');
  eq(b.T.run.day, 15, 'endless did not advance to day 15');
  eq(b.T.mode, 'play', 'endless did not resume play');
  gte(b.T.quotaFor(15), b.T.quotaFor(14), 'endless quota did not rise');
  ok(!b.T.run.ended, 'the endless run is still flagged as finished, so it will never save');
});

check('a second season starts with the standing the first one earned', () => {
  const { b } = playRun();
  const lean = b.T.repLean().lean;
  ok(lean, 'the finished season produced no standing');
  b.T._run('restart()');
  gte(b.T.run.essence, 60, 'a returning harvester was not fronted seed money');
});

process.exit(report() ? 0 : 1);
