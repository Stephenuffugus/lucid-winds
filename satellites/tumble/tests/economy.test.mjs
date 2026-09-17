// DESIGN 15.6: earn rates per mode within 10% of calibration (DESIGN 9.5: a relaxed player doing
// 3 Regular Loads a day earns about 200 Lint and about 3 Quarters).
//
// The "relaxed player" is a model, written down here so it can be argued with:
//   Laundry Day: flicks half the balls (hits 75%) and taps the basket for the rest; tidies up, so a missed ball is
//     picked back up and tapped in 97% of the time; flips an inside out sock 85% of the time.
//   Rush: flicks every ball (hits 62%), picks up a miss 35% of the time, finishes about 90% of the pairs in time.
import { suite } from './lib.mjs';
import { generateLoad } from '../src/loadgen.js';
import { Session } from '../src/session.js';
import { lintFor, quartersFor, applyResults, buy, canBuy, evaluatePegs } from '../src/economy.js';
import { freshSave } from '../src/save.js';
import { rng32 } from '../src/mathx.js';

// DESIGN 9.5 gives the Laundry numbers; it gives none for Rush Quarters (a Clean Load there is a skill bonus),
// so Rush is held to the same Lint and to paying no more Quarters than Laundry.
export const TARGET = { laundry: { lint: 200 / 3, quarters: 1.0 }, rush: { lint: 200 / 3, quarters: null } };
const { ok, done } = suite('economy');

function relaxed(mode, seedN, r) {
  const tier = 1 + (seedN % 6);
  const L = generateLoad({ seed: `eco-${mode}-${seedN}`, tier, size: 'regular', mode });
  const S = new Session(L, { sub: mode === 'rush' ? 'timed' : null });
  L.socks.forEach((s, i) => S.addSock(i + 1, s));
  S.startClock();
  const P = mode === 'laundry' ? { flick: 0.5, hit: 0.75, repick: 0.97, flip: 0.85, finish: 1 } : { flick: 1, hit: 0.62, repick: 0.35, flip: 0.4, finish: 0.9 };
  for (const s of S.socks.values()) if (s.insideOut && r() < P.flip) S.flip(s.id);
  const byKey = new Map();
  for (const s of S.socks.values()) {
    if (s.odd !== null && s.odd !== undefined) { S.bin(s.id); continue; }
    byKey.set(s.key, [...(byKey.get(s.key) || []), s.id]);
  }
  for (const [a, b] of byKey.values()) {
    if (r() > P.finish) continue;
    const res = S.match(a, b);
    const flick = r() < P.flick;
    S.shoot(res.ball, { tap: !flick, distance: 0.6 + r() * 0.5 });
    const made = !flick || r() < P.hit;
    S.shotResult(res.ball, made);
    if (!made && r() < P.repick) { S.pickUpBall(res.ball); S.shoot(res.ball, { tap: true }); S.shotResult(res.ball, true); }
    if (mode === 'rush') S.tick(2);
  }
  S.startSweep();
  for (const b of S.strays()) S.sweep(b.id);
  S.finish();
  return S;
}

let laundryQ = 0;
for (const mode of ['laundry', 'rush']) {
  const r = rng32(mode === 'laundry' ? 11 : 12);
  let lint = 0, q = 0, minL = 1e9, maxL = 0;
  const N = 600;
  for (let i = 0; i < N; i++) {
    const S = relaxed(mode, i, r);
    const l = lintFor(S).total;
    lint += l; q += quartersFor(S).total;
    minL = Math.min(minL, l); maxL = Math.max(maxL, l);
  }
  const perLoadLint = lint / N, perLoadQ = q / N;
  const T = TARGET[mode];
  ok(Math.abs(perLoadLint - T.lint) / T.lint <= 0.1, `${mode}: ${perLoadLint.toFixed(1)} Lint per Regular Load (target ${T.lint.toFixed(1)}, so ${(perLoadLint * 3).toFixed(0)} a day)`);
  if (T.quarters !== null) ok(Math.abs(perLoadQ - T.quarters) / T.quarters <= 0.1, `${mode}: ${perLoadQ.toFixed(2)} Quarters per Load (target ${T.quarters}, so ${(perLoadQ * 3).toFixed(1)} a day)`);
  else { ok(perLoadQ <= laundryQ, `${mode}: ${perLoadQ.toFixed(2)} Quarters per Load, never more than Laundry Day (${laundryQ.toFixed(2)})`); }
  if (mode === 'laundry') laundryQ = perLoadQ;
  if (mode === 'laundry') ok(minL >= 40 * 0.9 && maxL <= 80 * 1.1, `laundry: a Regular Load pays ${minL} to ${maxL} Lint (DESIGN: 40 to 80)`);
}

// a careless Load still pays, a perfect one pays more, and nothing ever pays negative
{
  const L = generateLoad({ seed: 'eco-bounds', tier: 3, size: 'regular' });
  const mk = (miss) => { const S = new Session(L); L.socks.forEach((s, i) => S.addSock(i + 1, s)); const bk = new Map(); for (const s of S.socks.values()) { if (s.odd !== null) { S.bin(s.id); continue; } bk.set(s.key, [...(bk.get(s.key) || []), s.id]); } for (const [a, b] of bk.values()) { const m = S.match(a, b); S.shoot(m.ball, {}); S.shotResult(m.ball, !miss); } S.startSweep(); for (const x of S.strays()) S.sweep(x.id); S.finish(); return S; };
  const bad = lintFor(mk(true)).total, good = lintFor(mk(false)).total;
  ok(bad >= 40 && good > bad && good <= 80, `all misses pays ${bad}, all made pays ${good} (both inside 40 to 80)`);
}

// purchases: Lint and Quarters only buy cosmetics; reunion items are never for sale
{
  const s = freshSave();
  s.economy.lint = 160; s.economy.quarters = 9;
  const hamper = { id: 'basket-plastic', cat: 'basket', cost: { lint: 150 } };
  const wire = { id: 'basket-wire', cat: 'basket', cost: { lint: 300 } };
  const portal = { id: 'dryer-portal', cat: 'dryer', cost: { quarters: 20 }, requires: 'lore:7' };
  const page = { id: 'lore-1', cat: 'reunion', cost: { reunions: 1 } };
  ok(buy(s, hamper).ok && s.economy.lint === 10 && s.unlocks.includes('basket-plastic'), 'buying the plastic hamper spends 150 Lint');
  ok(!buy(s, hamper).ok, 'you cannot buy it twice');
  ok(canBuy(s, wire).why === 'lint', 'the wire basket waits for more Lint');
  ok(canBuy(s, portal).why === 'locked', 'the portal dryer waits for lore page 7');
  ok(canBuy(s, page).why === 'reunion', 'a lore page cannot be bought');
}

// pegs unlock by doing (DESIGN 9.4)
{
  const s = freshSave();
  const cl = { pegs: [{ id: 'warm-hands', earn: { stat: 'pairs', gte: 10 }, comfort: 'warmHands', eyes: true }, { id: 'regular-load', earn: { stat: 'loads', gte: 5 }, comfort: 'sizeRegular' }] };
  s.stats.pairs = 9;
  ok(evaluatePegs(s, cl).length === 0, 'nine pairs earn nothing yet');
  s.stats.pairs = 10;
  const got = evaluatePegs(s, cl);
  ok(got.length === 1 && got[0].id === 'warm-hands' && s.clothesline.includes('warm-hands'), 'the tenth pair hangs Warm hands on the line');
}

// applyResults moves the numbers the Results screen shows into the save
{
  const s = freshSave();
  const S = relaxed('laundry', 3, rng32(5));
  const out = applyResults(s, S, { now: 1, hour: 21, clothesline: { pegs: [] }, lore: { pages: [] } });
  ok(s.economy.lint === out.lint.total && s.economy.quarters === out.quarters.total, 'Lint and Quarters land in the save');
  ok(s.stats.loads === 1 && s.stats.loadsByMode.laundry === 1 && s.stats.nightLoads === 1, 'the Load is counted, at night');
  ok(s.drawer.length >= S.load.pairs.length && out.newDrawer.length >= S.load.pairs.length, `the Drawer gains every new pair (${out.newDrawer.length})`);
  ok(s.oddBin.length === S.load.odd.length, `binned odd socks wait in the Odd Bin (${s.oddBin.length})`);
}
done();
