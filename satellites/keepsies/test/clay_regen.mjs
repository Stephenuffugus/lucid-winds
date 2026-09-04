/**
 * The clay pool across a rolled over clock.
 *
 *   node test/clay_regen.mjs
 *
 * DESIGN 12.2 says ten clay commons that regenerate to ten daily, and that is
 * the floor under the whole economy: anybody can always play for keeps without
 * risking anything they care about. Which makes the failure modes expensive.
 *
 *   - regenerating PER CALL hands out an unlimited number of free marbles
 *   - regenerating BY ONE A DAY punishes a player who was away
 *   - regenerating on a clock that went BACKWARDS (a timezone change, a user
 *     setting the date, a device that boots at the epoch) either does nothing
 *     for ever or does it on every call
 *
 * So the clock is injected and this walks it forward, sideways and backwards.
 * The wallet is checked in the same file because it shares the same store and
 * the same merge, and a spend that fails must move nothing at all.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createEconomy, today } from '../src/meta/economy.js?v=20260904a';
import { wipe, load } from '../src/meta/save.js?v=20260904a';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const T = JSON.parse(readFileSync(join(ROOT, 'src/data/tuning.json'), 'utf8'));

const fails = [];
const say = (ok, line) => { console.log((ok ? '  ok    ' : '  FAIL  ') + line); if (!ok) fails.push(line); };

const DAY = 86400000;
let now = Date.parse('2026-09-04T10:00:00Z');
const econ = createEconomy(T, { now: () => now });

wipe();

/* ---- the pool, across a rolling clock ---- */
say(econ.clayPool().count === 10, 'a new player has ten clay marbles: ' + econ.clayPool().count);

econ.takeClay(4);
say(econ.clayPool().count === 6, 'taking four leaves six: ' + econ.clayPool().count);

// ⛔ calling it repeatedly inside one day must NOT hand out more
for (let i = 0; i < 20; i++) econ.clayPool();
say(econ.clayPool().count === 6, 'twenty reads in the same day still leave six: ' + econ.clayPool().count);

now += DAY;
say(econ.clayPool().count === 10, 'the next day it is back to ten: ' + econ.clayPool().count);

econ.takeClay(10);
say(econ.clayPool().count === 0, 'and it can be emptied: ' + econ.clayPool().count);
say(econ.takeClay(1) === false, 'an empty pool refuses to hand out an eleventh');

// ⛔ a week away comes back to TEN, not to seventeen
now += DAY * 7;
say(econ.clayPool().count === 10, 'a week away comes back to ten, not to seventeen: ' + econ.clayPool().count);

// ⛔ a clock that goes BACKWARDS must not break it
econ.takeClay(3);
now -= DAY * 3;
const back = econ.clayPool().count;
say(back === 10, 'a clock that jumped backwards regenerates once and stops at ten: ' + back);
for (let i = 0; i < 10; i++) econ.clayPool();
say(econ.clayPool().count === 10, 'and reading it ten more times does not go past ten: ' + econ.clayPool().count);

// midnight twice in a row
now += DAY;
econ.takeClay(2);
now += DAY;
say(econ.clayPool().count === 10, 'two midnights in a row is still ten, not twenty: ' + econ.clayPool().count);

/* ---- the wallet ---- */
wipe();
say(econ.balance() === 0, 'a new wallet is empty: ' + econ.balance());
econ.earn(300, 'test');
say(econ.balance() === 300, 'earning three hundred leaves three hundred: ' + econ.balance());
say(econ.spend(120, 'a pouch') === true, 'spending inside the balance succeeds');
say(econ.balance() === 180, 'and leaves the right change: ' + econ.balance());
say(econ.spend(500, 'a grail pouch') === false, 'spending past the balance is refused');
say(econ.balance() === 180, 'and a refused spend moves NOTHING: ' + econ.balance());
say(econ.spend(-50, 'nonsense') === true && econ.balance() === 180,
  'a negative spend is a no op rather than an earn: ' + econ.balance());
say(econ.earn(-50, 'nonsense') === 0 && econ.balance() === 180,
  'and a negative earn is a no op rather than a theft: ' + econ.balance());

/* ---- the faucets ---- */
wipe();
now = Date.parse('2026-09-04T10:00:00Z');
const first = econ.payForMatch({ won: true, pocketed: 7, toWin: 7, newTechniques: ['Sticking'] });
say(first.total === T.economy.firstWinOfDay + T.economy.matchCompletionMax + T.economy.techniqueFirstEarn,
  'the first win of the day pays the bonus, the completion and the technique: ' + first.total
  + ' (' + first.paid.map(p => p.reason).join(', ') + ')');
const second = econ.payForMatch({ won: true, pocketed: 7, toWin: 7 });
say(!second.paid.some(p => p.reason.indexOf('first win') === 0),
  'the second win of the same day does not pay the first win bonus again');
now += DAY;
const tomorrow = econ.payForMatch({ won: true, pocketed: 3, toWin: 7 });
say(tomorrow.paid.some(p => p.reason.indexOf('first win') === 0),
  'but tomorrow it does again');
say(tomorrow.total < first.total, 'and a worse performance pays less: ' + tomorrow.total + ' against ' + first.total);

/* ---- the streak ---- */
wipe();
now = Date.parse('2026-09-04T10:00:00Z');
let paid = 0;
for (let d = 0; d < 7; d++) { paid += econ.touchStreak().paid; now += DAY; }
say(paid === T.economy.streak['3'] + T.economy.streak['5'] + T.economy.streak['7'],
  'seven days in a row pays at three, five and seven: ' + paid);
const twice = econ.touchStreak();
const again = econ.touchStreak();
say(again.alreadyToday === true, 'and touching the streak twice in one day counts once');
now += DAY * 3;
const broken = econ.touchStreak();
say(broken.days === 1, 'a missed day starts the streak again at one: ' + broken.days);

console.log('');
if (fails.length) { console.log(fails.length + ' FAILED\nCLAY REGEN FAILED'); process.exit(1); }
console.log('CLAY REGEN OK');
