// POCKET CHANGE (DESIGN-T2 phase 1): every coin moment pays what the table says, the jar rolls at exactly 25,
// a miss never takes back a coin already found, and the same Load always pays the same coins however she plays it.
import { suite } from './lib.mjs';
import { generateLoad } from '../src/loadgen.js';
import { Session } from '../src/session.js';
import { PURSE, CENTS, ROLL_AT, FLIP_CHANCE, MOMENTS, addCents, coinsFor, drawsFor, capFor, AVERAGE_DRAW } from '../src/coins.js';

const { ok, done } = suite('coins');
const SIZES = ['small', 'regular', 'heavy', 'mountain'];

// a Load with inside out socks in it, so the flip moments have something to fire on
function load(size = 'regular', tier = 5, seed = 'coins-fixture') {
  return generateLoad({ seed, tier, size, mode: 'laundry' });
}
function session(size = 'regular', tier = 5, seed = 'coins-fixture', mode = 'laundry') {
  const L = size === 'regular' && mode === 'rush' ? generateLoad({ seed, tier, size, mode }) : load(size, tier, seed);
  L.mode = mode;
  const S = new Session(L, { sub: mode === 'rush' ? 'timed' : null });
  L.socks.forEach((s, i) => S.addSock(i + 1, s));
  return S;
}

// ---------- the purse ----------
{
  const w = PURSE.reduce((a, c) => a + c.weight, 0);
  ok(w === 100, `the purse odds add up to 100 (${PURSE.map((c) => c.kind + ' ' + c.weight).join(', ')})`);
  ok(CENTS.penny === 1 && CENTS.nickel === 5 && CENTS.dime === 10 && CENTS.quarter === 25, 'a penny, a nickel, a dime and a quarter are worth what they are worth');
  ok(Math.abs(AVERAGE_DRAW - 5.75) < 0.001, `one draw is worth ${AVERAGE_DRAW.toFixed(2)} cents on average (the design says 6.5; 0.5 + 1.25 + 1.5 + 2.5 is 5.75, so the design's own odds give 5.75)`);
  // every coin the purse can hand out is a real coin
  const kinds = new Set();
  for (let i = 0; i < 4000; i++) kinds.add(coinsFor('purse-' + i, 'reunion')[0].kind);
  ok (kinds.size === 4 && [...kinds].every((k) => CENTS[k] > 0), `all four coins really come out of the purse (${[...kinds].sort().join(', ')})`);
}

// ---------- the moments pay what the table says ----------
for (const size of SIZES) {
  const want = { small: 1, regular: 2, heavy: 3, mountain: 4 }[size];
  const S = session(size);
  const door = S.fireMoment('door');
  ok(door.length === want, `${size}: the dryer door pays ${door.length} coins (the table says ${want})`);
  const trap = S.fireMoment('trap');
  ok(trap.length === want, `${size}: the lint trap pays ${trap.length} coins (the table says ${want})`);
  const bigWant = { small: 0, regular: 0, heavy: 2, mountain: 4 }[size];
  const big = S.fireMoment('big');
  ok(big.length === bigWant, `${size}: a big Load pays ${big.length} more draws (the table says ${bigWant})`);
  const af = S.fireMoment('allFlipped');
  const afWant = size === 'small' ? 'nickel' : 'dime';
  ok(af.length === 1 && af[0].kind === afWant, `${size}: every sock the right way out pays one ${af[0] && af[0].kind} (the table says a ${afWant})`);
}
{
  const S = session();
  const clean = S.fireMoment('clean'), spot = S.fireMoment('spotless');
  ok(clean.length === 1 && clean[0].kind === 'quarter' && clean[0].cents === 25, 'a Clean Load pays one whole Quarter');
  ok(spot.length === 1 && spot[0].kind === 'quarter', 'a Spotless Load pays one whole Quarter');
  ok(S.cents === 50, `the two of them are 50 cents, so a Spotless Clean Load is two Quarters on its own (${S.cents})`);
}

// ---------- once is once ----------
{
  const S = session();
  const first = S.fireMoment('door').length;
  const again = S.fireMoment('trap').length && S.fireMoment('door').length;
  ok(first === 2 && S.fireMoment('door').length === 0 && again === 0, 'the dryer door only opens once a Load');
  for (const id of ['trap', 'big', 'clean', 'spotless', 'allFlipped']) { S.fireMoment(id); ok(S.fireMoment(id).length === 0, `${id} only comes round once a Load`); }
}

// ---------- the flip cap counts coins, not tries ----------
for (const size of SIZES) {
  const cap = { small: 1, regular: 2, heavy: 3, mountain: 4 }[size];
  ok(capFor('flip', size) === cap, `${size}: at most ${cap} coins fall out of cuffs in one Load`);
  const S = session(size);
  let paid = 0;
  for (let i = 0; i < 200; i++) paid += S.fireMoment('flip').length;   // two hundred flips, if she could
  ok(paid === cap, `${size}: two hundred flips still pay exactly ${paid} coins (the cap is on coins, not on flips)`);
}
{
  // about 35 percent of flips drop a coin, measured over many Loads
  let tries = 0, paid = 0;
  for (let n = 0; n < 400; n++) {
    const S = session('mountain', 5, 'flip-rate-' + n);
    for (let i = 0; i < 6; i++) { tries++; paid += S.fireMoment('flip').length; }
  }
  const rate = paid / tries;
  ok(Math.abs(rate - FLIP_CHANCE) < 0.04, `a flip drops a coin ${(rate * 100).toFixed(1)} percent of the time (the table says ${FLIP_CHANCE * 100})`);
}

// ---------- a reunion pays every time, and is never capped ----------
{
  const S = session();
  let n = 0;
  for (let i = 0; i < 5; i++) n += S.fireMoment('reunion').length;
  ok(n === 5, `five Reunions pay five coins (${n}), because a Reunion is never capped`);
}

// ---------- the same Load always pays the same coins ----------
{
  const a = session('regular', 5, 'same-seed'), b = session('regular', 5, 'same-seed');
  for (const S of [a, b]) { S.fireMoment('door'); S.fireMoment('trap'); S.fireMoment('clean'); }
  ok(a.cents === b.cents && JSON.stringify(a.coins) === JSON.stringify(b.coins), `two plays of one Load find the same coins (${a.cents} cents)`);
  const c = session('regular', 5, 'other-seed');
  c.fireMoment('door'); c.fireMoment('trap'); c.fireMoment('clean');
  ok(c.cents !== a.cents, `a different Load pays differently (${c.cents} against ${a.cents})`);
}

// ---------- a Daily pays two different saves the same coins, however they play it ----------
{
  const L = generateLoad({ seed: 'tumble-daily|2026-09-21', tier: 4, size: 'regular', mode: 'laundry' });
  const play = (order) => {
    const S = new Session(L);
    L.socks.forEach((s, i) => S.addSock(i + 1, s));
    S.fireMoment('door');
    const io = [...S.socks.values()].filter((s) => s.insideOut).map((s) => s.id);
    for (const id of order === 'up' ? io : io.slice().reverse()) S.flip(id);
    S.fireMoment('trap');
    return S;
  };
  const up = play('up'), down = play('down');
  const sum = (S) => S.coins.map((c) => c.kind).sort().join(',');
  ok(up.stats.flips > 2, `the Daily has ${up.stats.flips} socks to turn the right way out`);
  ok(up.cents === down.cents && sum(up) === sum(down), `flipping in the opposite order finds the same coins (${up.cents} cents both ways)`);
}

// ---------- a miss never takes back a coin already found ----------
{
  const S = session();
  // a Clean Load: every pair balled and basketed
  const byKey = new Map();
  for (const s of S.socks.values()) { if (s.odd !== null && s.odd !== undefined) { S.bin(s.id); continue; } byKey.set(s.key, [...(byKey.get(s.key) || []), s.id]); }
  const balls = [];
  for (const [a, b] of byKey.values()) { const m = S.match(a, b); balls.push(m.ball); S.shoot(m.ball, { tap: true }); S.shotResult(m.ball, true); }
  S.fireMoment('door');
  S.startSweep();
  ok(S.stats.cleanLoad && S._momentPaid.clean === 1, 'a Clean Load pays its Quarter as the last ball lands');
  const wasCents = S.cents, wasCoins = S.coins.length;
  // now everything that could possibly look like a punishment, and NOTHING that pays (no finish() in here,
  // or the lint trap would hide a theft behind its own coins)
  S.spill(balls.slice(0, 3));
  const late = balls[0];
  S.pickUpBall(late); S.shoot(late); S.shotResult(late, false);
  S.shotResult(late, false);
  ok(S.cents === wasCents && S.coins.length === wasCoins, `a miss and a spilled basket take nothing back: ${wasCents} cents and ${wasCoins} coins before, ${S.cents} and ${S.coins.length} after`);
  ok(S.stats.shotsMissed > 0 && S.stats.shotsMade < balls.length, `and those really were misses (${S.stats.shotsMissed} missed, ${S.stats.shotsMade} made of ${balls.length})`);
  // the rest of the Load still pays, so the Quarter she earned is not the end of it
  S.finish();
  ok(S.cents > wasCents, `the lint trap still slides out at the end (${S.cents} cents by the time the Load is over)`);
}

// ---------- Spotless is a Laundry Day thing ----------
{
  const S = session('regular', 3, 'rush-spotless', 'rush');
  S.mode = 'rush';
  S.finish();
  ok(!S._momentPaid.spotless, 'a Rush Load never pays the Spotless Quarter (the table says Laundry Day)');
}

// ---------- the jar ----------
{
  const e = { cents: 0, quarters: 0 };
  ok(ROLL_AT === 25, 'the jar rolls at 25 cents');
  let r = addCents(e, 24);
  ok(e.cents === 24 && e.quarters === 0 && r.rolled === 0, '24 cents in the jar is still 24 cents and no Quarter');
  r = addCents(e, 1);
  ok(e.cents === 0 && e.quarters === 1 && r.rolled === 1, 'the twenty fifth cent rolls a Quarter and leaves the jar empty');
  r = addCents(e, 26);
  ok(e.cents === 1 && e.quarters === 2 && r.rolled === 1, '26 cents rolls one Quarter and keeps the odd cent');
  r = addCents(e, 74);
  ok(e.cents === 0 && e.quarters === 5 && r.rolled === 3, '75 cents in the jar rolls three Quarters and leaves nothing behind');
  r = addCents(e, 0);
  ok(e.cents === 0 && e.quarters === 5 && r.rolled === 0, 'a Load with no coins in it changes nothing');
  const junk = { cents: 0, quarters: 0 };
  addCents(junk, -50);
  ok(junk.cents === 0 && junk.quarters === 0, 'nothing can put a negative number of cents in the jar');
  // no cent is ever lost: what goes in comes out as cents plus Quarters
  const big = { cents: 0, quarters: 0 };
  let paid = 0;
  for (let i = 1; i <= 300; i++) { paid += i % 7; addCents(big, i % 7); }
  ok(big.quarters * 25 + big.cents === paid, `every cent is accounted for: ${paid} in, ${big.quarters} Quarters and ${big.cents} cents out`);
}

// ---------- and what the table is, written out, so a change to it is loud ----------
{
  const rows = SIZES.map((sz) => `${sz}: door ${drawsFor('door', sz)}, trap ${drawsFor('trap', sz)}, big ${drawsFor('big', sz)}, flip cap ${capFor('flip', sz)}`);
  ok(Object.keys(MOMENTS).length === 8, `eight coin moments: ${Object.keys(MOMENTS).join(', ')}`);
  console.log('  info  ' + rows.join('\n  info  '));
}

done();
