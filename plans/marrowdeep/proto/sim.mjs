/* MARROWDEEP prototype harness. Node 24, no dependencies.
 *   node sim.mjs --table   the R1.4 master table and the R1.5 floor rows, measured through roll()
 *   node sim.mjs --test    the assertions over R1 to R9
 *   node sim.mjs --grid    the balance harness (spec 15): two experiments over the BASE_TOUGHNESS x
 *                          STRIKE_TARGET x STRIKE x RESPITE grid, against the spec 8.6 targets
 *   node sim.mjs --grid --over=KEY=VAL   one run with any BALANCE number moved (repeatable)
 * The engine is the law's only implementation; this file only measures it.
 */
import { createRequire } from 'node:module';
import { fork } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const MD = require('./engine.js');

const ARG = process.argv.slice(2);
const has = (f) => ARG.indexOf(f) >= 0;

/* The engine carries placeholder word and line banks; the authored ones live in plans/marrowdeep/data.
 * R10 says the builder pastes them into DATA, so the suite proves the engine against both. */
const PLACEHOLDER = JSON.parse(JSON.stringify(MD.data()));
function loadAuthoredData() {
  try {
    const d = '../data/';
    const j = (f) => require(d + f);
    const ch = { gate: {}, chain: {} };
    for (const st of MD.STATS) {
      const bank = j('challenges-' + st + '.json');
      ch.gate[st] = bank.gate; ch.chain[st] = bank.chain;
    }
    const shapes = j('challenges-shapes.json');
    ch.relay = shapes.relay; ch.vault = shapes.vault; ch.toll = shapes.toll; ch.open = shapes.open;
    const words = j('relic-words.json');
    return { names: j('names.json'), bosses: j('bosses.json'), uniques: j('uniques.json'),
      relicWords: { affix: words.affix, base: words.base }, challenges: ch };
  } catch (e) { return null; }
}

/* The grid measures the game as it ships, so it runs on the authored banks when they are there. */
let DATA_SOURCE = 'the engine placeholder banks';
function useAuthoredData() {
  const real = loadAuthoredData();
  if (real) { MD.setData(real); DATA_SOURCE = 'plans/marrowdeep/data (authored)'; }
  return !!real;
}

/* ============================ --table ============================ */
function tableMode() {
  const N = 200000;
  const DICE = [4, 6, 8, 10, 12];
  const TNS = [3, 4, 5, 6, 7];
  // R1.4 CORRECTED. If the engine disagrees with this, the engine is wrong.
  const TRUTH = {
    4:  { 3: 50.0, 4: 25.0,  5: 25.0, 6: 18.75, 7: 12.5 },
    6:  { 3: 66.7, 4: 50.0,  5: 33.3, 6: 16.7,  7: 16.7 },
    8:  { 3: 75.0, 4: 62.5,  5: 50.0, 6: 37.5,  7: 25.0 },
    10: { 3: 80.0, 4: 70.0,  5: 60.0, 6: 50.0,  7: 40.0 },
    12: { 3: 83.3, 4: 75.0,  5: 66.7, 6: 58.3,  7: 50.0 }
  };
  let bad = 0;
  const pad = (s, n) => String(s).padStart(n);

  console.log('MARROWDEEP master table, R1.4 CORRECTED. ' + N.toLocaleString('en-US') + ' rolls per cell, no modifiers.');
  console.log('  measured / RULES R1.4      (a cell off by more than 0.50 points fails)');
  console.log('  die  ' + TNS.map((t) => pad('TN' + t, 15)).join(''));
  for (const die of DICE) {
    const rng = MD.makeRng(MD.seedFromString('table:d' + die));
    const hits = { 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
    for (let i = 0; i < N; i++) {
      const r = MD.roll(die, { rng });
      for (const tn of TNS) if (r.total >= tn) hits[tn]++;
    }
    let row = '  d' + pad(die, 2) + '  ';
    for (const tn of TNS) {
      const got = (hits[tn] / N) * 100;
      const want = TRUTH[die][tn];
      const off = Math.abs(got - want);
      if (off > 0.5) bad++;
      row += pad(got.toFixed(2) + '/' + want.toFixed(2) + (off > 0.5 ? ' X' : '  '), 15);
    }
    console.log(row);
  }

  console.log('');
  console.log('Surge rate per die (R1.2: only the top face surges, so 1/die).');
  for (const die of DICE) {
    const rng = MD.makeRng(MD.seedFromString('surge:d' + die));
    let s = 0;
    for (let i = 0; i < N; i++) if (MD.roll(die, { rng }).surged) s++;
    const got = (s / N) * 100, want = 100 / die;
    if (Math.abs(got - want) > 0.5) bad++;
    console.log('  d' + pad(die, 2) + '   measured ' + pad(got.toFixed(2), 6) + '   R1.2 ' + pad(want.toFixed(2), 6) + (Math.abs(got - want) > 0.5 ? '   X' : ''));
  }

  console.log('');
  console.log('Floor rows, R1.5 CORRECTED (the first die only, so no surge dice: spec 2.4 measures the face).');
  console.log('  config          base EV   floored EV   gain     RULES gain   (tolerance 0.05)');
  // spec 2.4 with the d12 floor 6 row corrected by R1.5
  const FLOORS = [
    { die: 8, floor: 3, evWant: 4.875, gainWant: 0.375 },
    { die: 8, floor: 4, evWant: 5.25, gainWant: 0.75 },
    { die: 10, floor: 4, evWant: 6.10, gainWant: 0.60 },
    { die: 12, floor: 4, evWant: 7.00, gainWant: 0.50 },
    { die: 12, floor: 6, evWant: 7.75, gainWant: 1.25 }
  ];
  for (const f of FLOORS) {
    const r1 = MD.makeRng(MD.seedFromString('floorbase:' + f.die + ':' + f.floor));
    const r2 = MD.makeRng(MD.seedFromString('floored:' + f.die + ':' + f.floor));
    let base = 0, fl = 0;
    for (let i = 0; i < N; i++) base += MD.roll(f.die, { rng: r1 }).floored;
    for (let i = 0; i < N; i++) fl += MD.roll(f.die, { rng: r2, floor: f.floor }).floored;
    base /= N; fl /= N;
    const gain = fl - base;
    const offEv = Math.abs(fl - f.evWant), offGain = Math.abs(gain - f.gainWant);
    if (offEv > 0.05 || offGain > 0.05) bad++;
    console.log('  d' + pad(f.die, 2) + ' floor ' + f.floor + '   ' + pad(base.toFixed(3), 7) + '   ' +
      pad(fl.toFixed(3), 10) + '   ' + pad(gain.toFixed(3), 6) + '   ' + pad(f.gainWant.toFixed(3), 10) +
      ((offEv > 0.05 || offGain > 0.05) ? '   X' : ''));
  }

  console.log('');
  if (bad) { console.log('TABLE FAILED: ' + bad + ' cell(s) off. The engine is wrong, not R1.4.'); process.exit(1); }
  console.log('TABLE OK');
}

/* ============================ --test ============================ */
let COUNT = 0, FAILS = [];
const BY_RULE = new Map();
function ok(name, cond, extra) {
  COUNT++;
  const m = /^(R\d+|spec \d+)/.exec(name);
  const key = m ? m[1] : 'other';
  BY_RULE.set(key, (BY_RULE.get(key) || 0) + 1);
  if (!cond) { FAILS.push(name + (extra != null ? '   [' + extra + ']' : '')); }
}
function eq(name, got, want) { ok(name, got === want, 'got ' + JSON.stringify(got) + ' want ' + JSON.stringify(want)); }
function near(name, got, want, tol) { ok(name, Math.abs(got - want) <= tol, 'got ' + got + ' want ' + want); }

const R = (s) => MD.makeRng(MD.seedFromString(s));

/* a bare character, no generation, so a test says exactly what it means */
function mkChar(id, over) {
  const c = { id: id, name: id, origin: null, calling: null,
    stats: { might: 8, grace: 8, wits: 8, nerve: 8 }, traits: [], scars: 0, strain: 0, armorPool: 0,
    alive: true, questsSurvived: 0, excised: false, gear: {}, unkillableUsed: false, benchOnceUsed: false,
    deployed: false, dealt: [] };
  Object.assign(c, over || {});
  if (over && over.stats) c.stats = Object.assign({ might: 8, grace: 8, wits: 8, nerve: 8 }, over.stats);
  return c;
}
function mkState(chars) {
  const st = MD.SIM.newGame(7);
  st.roster = chars;
  return st;
}
function gearItem(slot, affixes, rarity) {
  return { id: 'i' + slot, slot: slot, rarity: rarity || 'common', budget: 2, pts: affixes.reduce((a, x) => a + x.pts, 0),
    affixes: affixes, unique: null, name: 'Test ' + slot, depth: 1 };
}
function aff(key, eff, pts, stat) { return { key: key, pts: pts || 1, stat: stat || null, sigil: null, eff: eff }; }

function testMode() {
  const B = MD.BALANCE;

  /* ---------------- R1 the dice ---------------- */
  eq('R1.2 surge threshold plain d12', MD.surgeThreshold(12, 0), 12);
  eq('R1.2 surge threshold minus one', MD.surgeThreshold(12, 1), 11);
  eq('R1.9 surge threshold cap from all sources', MD.surgeThreshold(12, 5), 11);
  eq('R1.9 surge threshold cap on a d4', MD.surgeThreshold(4, 3), 3);
  eq('R1.3 floor cap d4', MD.floorCap(4), 2);
  eq('R1.3 floor cap d12', MD.floorCap(12), 6);
  eq('R1.3 a floor over half the die is clamped', MD.effectiveFloor(8, 6, 0, false), 4);
  // R1.3 CORRECTED (audit): the cap is die/2 + floorPlus, so the Head affix and Ironbound are worth something
  // on a stat already at its half die floor. effectiveFloor's third argument is the CAP BONUS, not a second add.
  eq('R1.3 the cap rises with floorPlus', MD.effectiveFloor(8, 5, 1, false), 5);
  eq('R1.3 and holds without one', MD.effectiveFloor(8, 5, 0, false), 4);
  eq('R1.3 floorFor composes a gear floor with Ironbound',
    MD.floorFor([{ k: 'floor', stat: 'all', v: 4, fromGear: true }, { k: 'floorPlus', v: 1, gearOnly: true }], 'might', 8), 5);
  eq('R1.3 and a half die floor with the Head affix',
    MD.floorFor([{ k: 'floor', stat: 'all', v: 'half' }, { k: 'floorPlus', v: 1 }], 'might', 12), 7);
  eq('R9.2 Shivering ignores floors', MD.effectiveFloor(8, 4, 0, true), 0);
  {
    let sawFloored = 0, badSurge = 0;
    const rng = R('nofloorsurge');
    for (let i = 0; i < 20000; i++) {
      const r = MD.roll(12, { rng, floor: 6 });
      if (r.natural < 6) { sawFloored++; if (r.surged) badSurge++; }
    }
    ok('R1.3 a floored die never surges', sawFloored > 1000 && badSurge === 0, 'floored ' + sawFloored + ' surged ' + badSurge);
  }
  {
    const rng = R('surgecap'); let surges = 0;
    for (let i = 0; i < 20000; i++) if (MD.roll(12, { rng, surgeMinus: 4 }).surged) surges++;
    near('R1.9 surgeMinus can never open more than two faces', surges / 20000, 2 / 12, 0.02);
  }
  near('R1.4 closed form d4 TN3', MD.passProb(4, 3, {}), 0.5, 1e-9);
  near('R1.4 closed form d4 TN4 is one face', MD.passProb(4, 4, {}), 0.25, 1e-9);
  near('R1.4 closed form d6 TN6 is one face', MD.passProb(6, 6, {}), 1 / 6, 1e-9);
  near('R1.4 closed form d4 TN6', MD.passProb(4, 6, {}), 0.1875, 1e-9);
  near('R1.4 the fifty percent diagonal d12 TN7', MD.passProb(12, 7, {}), 0.5, 1e-9);
  near('R1.6 Push is worth exactly two on the TN', MD.passProb(8, 7, { push: true }), MD.passProb(8, 5, {}), 1e-9);
  ok('R1.8 roll twice take higher beats one roll', MD.passProb(8, 6, { twice: true }) > MD.passProb(8, 6, {}));
  ok('R1.8 reroll natural 1s beats plain', MD.passProb(8, 5, { reroll1s: true }) > MD.passProb(8, 5, {}));
  {
    const r = MD.roll(8, { rng: R('parts'), floor: 3, flat: 2, push: true });
    ok('R1.1 a roll shows every part', ['natural', 'floored', 'chain', 'base', 'mods', 'push', 'total', 'surged']
      .every((k) => r[k] !== undefined), Object.keys(r).join(','));
    eq('R1.6 Push shows as +2', r.push, 2);
    eq('R1.1 total is base plus mods plus push', r.total, r.base + r.mods + r.push);
  }
  {
    // R1.7 the flat cap: four permanent +1 MIGHT lines read as +3
    const ch = mkChar('cap', { gear: {
      token: gearItem('token', [aff('flat', [{ k: 'flat', stat: 'might', v: 1, perm: true }], 2, 'might')]),
      hands: gearItem('hands', [aff('flat', [{ k: 'flat', stat: 'might', v: 1, perm: true }], 2, 'might')]),
      weapon: gearItem('weapon', [aff('flat', [{ k: 'flat', stat: 'might', v: 1, perm: true }], 2, 'might'),
        aff('flat2', [{ k: 'flat', stat: 'might', v: 1, perm: true }], 2, 'might')]) } });
    eq('R1.7 four permanent points read as three', MD.query(MD.collect(ch), 'flat', { stat: 'might' }), 3);
    const ch2 = mkChar('cap2', { calling: 'zealot', strain: 3, gear: ch.gear });
    eq('R1.7 conditionals sit outside the cap', MD.query(MD.collect(ch2), 'cond', { stat: 'might', strain: 3 }), 2);
  }

  /* ---------------- R2 characters ---------------- */
  {
    const st = MD.SIM.newGame(3), rng = R('chargen');
    const ch = MD.GEN.newCharacter(rng, st.account, {});
    ok('R2.1 four stats on the ladder', MD.STATS.every((s) => MD.DICE.indexOf(ch.stats[s]) >= 0), JSON.stringify(ch.stats));
    eq('R2.1 a fresh character has no Strain', ch.strain, 0);
    eq('R2.1 a fresh character has no Scars', ch.scars, 0);
    eq('R2.1 three Callings are dealt', ch.dealt.length, 3);
    ok('R2.1 the Origin comes from the unlocked pool', st.account.unlockedOrigins.indexOf(ch.origin) >= 0, ch.origin);
  }
  {
    const st = MD.SIM.newGame(3);
    st.account.creationFloors = { might: 8, grace: 8, wits: 8, nerve: 8 };
    /* R2.1 / R8.6 CORRECTED (audit): the creation floor is applied LAST, after the Origin, because a floor is a
     * guarantee the player paid Marrow for and applying it first showed a d4 NERVE on a stat the Hall promised
     * would never roll under d6. So a Straycall NERVE can no longer sit under the floor. */
    let allAt8 = true, sawStraycall = false;
    for (let i = 0; i < 200; i++) {
      const c = MD.GEN.newCharacter(R('floor' + i), st.account, {});
      if (MD.STATS.some((s) => c.stats[s] < 8)) allAt8 = false;
      if (c.origin === 'straycall') sawStraycall = true;
    }
    ok('R8.6 the creation floor holds on every stat', allAt8);
    ok('R2.1 including a Straycall, whose shift now runs BEFORE the floor', allAt8 && sawStraycall);
  }
  {
    const st = MD.SIM.newGame(3);
    st.account.unlockedOrigins = ['unmarked'];
    let replaced = 0;
    for (let i = 0; i < 60; i++) {
      const c = MD.GEN.newCharacter(R('unmarked' + i), st.account, {});
      const lo = Math.min.apply(null, MD.STATS.map((s) => c.stats[s]));
      if (lo >= 4) replaced++;
    }
    eq('R4.8 Unmarked always lands a legal ladder', replaced, 60);
  }
  eq('R2.2 tier 1 at zero lifetime Renown', MD.GEN.renownTier(0), 1);
  eq('R2.2 tier 2 at the first threshold', MD.GEN.renownTier(100), 2);
  eq('R2.2 tier 10 at the last', MD.GEN.renownTier(2000), 10);
  eq('R2.2 tier never passes ten', MD.GEN.renownTier(999999), 10);
  {
    const w2 = MD.GEN.tierWeights(2), w1 = MD.GEN.tierWeights(1), w3 = MD.GEN.tierWeights(3);
    near('R2.2 tier 2 sums to one hundred', w2.reduce((a, b) => a + b, 0), 100, 1e-9);
    near('R2.2 tier 2 is the midpoint of 1 and 3', w2[0], (w1[0] + w3[0]) / 2, 1e-9);
    const w9 = MD.GEN.tierWeights(9), w7 = MD.GEN.tierWeights(7), w10 = MD.GEN.tierWeights(10);
    near('R2.2 tier 9 is two thirds from 7 to 10', w9[0], w7[0] + (w10[0] - w7[0]) * (2 / 3), 1e-6);
  }
  {
    const ch = mkChar('t', { scars: 1, traits: ['ironlung'] });
    eq('R2.3 toughness is base minus scars plus traits', MD.effToughness(ch), 4 - 1 + 2);
    const ch2 = mkChar('t2', { scars: 4 });
    eq('R2.3 a character at zero Toughness cannot deploy', MD.canDeploy(ch2), false);
    const ch3 = mkChar('t3', { origin: 'hearthborn' });
    eq('R4.1 Hearthborn is Toughness +2', MD.effToughness(ch3), 6);
    const ch4 = mkChar('t4', { traits: ['bulwark'], origin: 'ironbound' });
    eq('R2.3 Armor sums Bulwark and Ironbound', MD.effArmor(ch4), 3);
  }

  /* ---------------- R3 Strain, Armor, benching ---------------- */
  {
    const a = mkChar('a', { armorPool: 2 });
    const st = mkState([a]);
    MD.SIM.applyStrain(st, a, 3, {});
    eq('R3.4 Armor absorbs before the rest lands', a.strain, 1);
    eq('R3.4 the pool drops by what it absorbed', a.armorPool, 0);
  }
  {
    const a = mkChar('a', { traits: ['bulwark'] });
    const st = mkState([a]);
    a.armorPool = MD.effArmor(a);
    MD.SIM.applyStrain(st, a, 1, { selfPaid: true, source: 'push' });
    eq('R3.4 a Push skips Armor', a.strain, 1);
    eq('R3.4 a Push does not spend the pool', a.armorPool, 2);
    a.armorPool = 0;
    MD.SIM.doBench(st, a);
    eq('R3.4 a bench refills the pool', a.armorPool, 2);
  }
  {
    const a = mkChar('a', { traits: ['bulwark'] });
    const st = mkState([a]);
    a.armorPool = 2;
    MD.SIM.applyStrain(st, a, 1, { selfPaid: true, source: 'toll' });
    eq('R3.1 the Toll fee skips Armor too', a.strain, 1);
    eq('R3.4 and does not spend the pool', a.armorPool, 2);
  }
  {
    const a = mkChar('a', { strain: 1 });
    const st = mkState([a]);
    MD.SIM.applyStrain(st, a, -5, {});
    eq('R3.5 Strain never falls below zero on a negative', a.strain, 1);
    MD.SIM.doBench(st, mkChar('z'));
    a.strain = 0;
    MD.SIM.doBench(st, a);
    eq('R3.5 a bench never drives Strain under zero', a.strain, 0);
  }
  {
    const a = mkChar('a', { calling: 'warden' });
    eq('R4.13 Warden benches for three', MD.SIM.benchClearFor(a), 3);
    const b = mkChar('b', { gear: { feet: gearItem('feet', [aff('benchPlus', [{ k: 'benchPlus', v: 1 }], 2)]) } });
    eq('R5.6 Feet adds one to a bench', MD.SIM.benchClearFor(b), 2);
    const c = mkChar('c', { calling: 'warden', gear: b.gear });
    eq('R4.13 Warden and Feet stack to four', MD.SIM.benchClearFor(c), 4);
  }

  /* ---------------- R4 Origins, Callings, Traits ---------------- */
  {
    const v = mkChar('v', { calling: 'vanguard', stats: { might: 4, grace: 8, wits: 8, nerve: 8 } });
    eq('R4.9 Vanguard floor 4 clamps to 2 on a d4', MD.floorFor(MD.collect(v), 'might', 4), 2);
    eq('R4.9 Vanguard floor 4 stands on a d8', MD.floorFor(MD.collect(v), 'might', 8), 4);
    eq('R4.9 Vanguard takes one less from a Strike', MD.query(MD.collect(v), 'strikeLess', {}), 1);
  }
  {
    const f = mkChar('f', { origin: 'fenwise' });
    eq('R4.3 Fenwise lowers the WITS threshold', MD.query(MD.collect(f), 'surgeMinus', { stat: 'wits' }), true);
    eq('R4.3 and nothing else', MD.query(MD.collect(f), 'surgeMinus', { stat: 'might' }), false);
  }
  {
    const d = mkChar('d', { traits: ['deepdrawn'], stats: { might: 6, grace: 12, wits: 8, nerve: 4 } });
    eq('R4.17 Deepdrawn reads the highest rung', MD.query(MD.collect(d), 'surgeMinus', { stat: 'grace' }), true);
    eq('R4.17 Deepdrawn is not everywhere', MD.query(MD.collect(d), 'surgeMinus', { stat: 'wits' }), false);
    const tie = mkChar('tie', { traits: ['deepdrawn'], stats: { might: 12, grace: 12, wits: 4, nerve: 4 } });
    eq('R4.17 Deepdrawn ties by stat order', MD.query(MD.collect(tie), 'surgeMinus', { stat: 'might' }), true);
  }
  {
    const z = mkChar('z', { calling: 'zealot' });
    eq('R4.12 Zealot is quiet at one Strain', MD.query(MD.collect(z), 'cond', { strain: 1 }), 0);
    eq('R4.12 Zealot pays at two', MD.query(MD.collect(z), 'cond', { strain: 2 }), 2);
  }
  {
    const g = mkChar('g', { traits: ['grim'] });
    eq('R4.17 Grim is quiet while everyone lives', MD.query(MD.collect(g), 'grim', { deadAllies: 0 }), 0);
    eq('R4.17 Grim pays after a death', MD.query(MD.collect(g), 'grim', { deadAllies: 1 }), 2);
  }
  {
    const s = mkChar('s', { traits: ['steady'] });
    eq('R4.17 Steady floors every stat', MD.floorFor(MD.collect(s), 'nerve', 8), 3);
    const i = mkChar('i', { origin: 'ironbound', gear: { head: gearItem('head', [aff('floor3', [{ k: 'floor', stat: 'wits', v: 3 }], 1, 'wits')]) } });
    eq('R4.4 Ironbound reads a gear floor one higher', MD.floorFor(MD.collect(i), 'wits', 12), 4);
    const i2 = mkChar('i2', { origin: 'ironbound', traits: ['steady'] });
    eq('R4.4 Ironbound does not lift a Trait floor', MD.floorFor(MD.collect(i2), 'wits', 12), 3);
  }
  eq('R4.7 Saltblood makes the first Push free', MD.query(MD.collect(mkChar('sb', { origin: 'saltblood' })), 'pushFree', {}), 1);
  eq('R4.17 Untethered ignores Ambush', MD.query(MD.collect(mkChar('u', { traits: ['untethered'] })), 'ignoreAmbush', {}), true);
  eq('R4.17 Steadfast is immune to contagion', MD.query(MD.collect(mkChar('sf', { traits: ['steadfast'] })), 'contagionImmune', {}), true);
  eq('R4.6 Lanternborn sees a hidden TN', MD.query(MD.collect(mkChar('l', { origin: 'lanternborn' })), 'seeHidden', {}), true);
  eq('R4.6 Lanternborn previews the next stage', MD.query(MD.collect(mkChar('l', { origin: 'lanternborn' })), 'previewNext', {}), true);
  eq('R12 every seeded Trait uses a known kind',
    Object.keys(MD.TRAITS).every((k) => MD.TRAITS[k].eff.every((e) => !!MD.EFFECTS.KINDS[e.k])), true);
  eq('R12 every Calling uses a known kind',
    Object.keys(MD.CALLINGS).every((k) => MD.CALLINGS[k].eff.every((e) => !!MD.EFFECTS.KINDS[e.k])), true);
  eq('R12 every Origin uses a known kind',
    Object.keys(MD.ORIGINS).every((k) => MD.ORIGINS[k].eff.every((e) => !!MD.EFFECTS.KINDS[e.k])), true);
  eq('R12 every cond when is in the table',
    Object.keys(MD.CALLINGS).concat(Object.keys(MD.TRAITS)).every((k) => {
      const src = MD.CALLINGS[k] || MD.TRAITS[k];
      return src.eff.every((e) => e.k !== 'cond' || MD.EFFECTS.WHENS.indexOf(e.when) >= 0);
    }), true);
  eq('R4 eight Origins', Object.keys(MD.ORIGINS).length, 8);
  eq('R4 eight Callings', Object.keys(MD.CALLINGS).length, 8);
  eq('R4.17 twelve seeded Traits', Object.keys(MD.TRAITS).length, 12);

  /* ---------------- helpers for the stage tests ---------------- */
  function slotOf(shape, stats, tns, over) {
    const s = { i: 0, shape: shape, stats: stats, tns: tns, tags: [], checks: (shape === 'chain' || shape === 'relay') ? 2 : 1,
      reward: { renown: MD.BALANCE.RENOWN[shape], relicRolls: 0, tierUp: 0 }, fee: shape === 'toll' ? 1 : 0,
      passed: null, text: 'test line' };
    return Object.assign(s, over || {});
  }
  function synthQuest(depth, stages, sigils) {
    return { seed: 'synth', depth: depth, depthName: 'test', sigils: sigils || [], bossIds: [], stages: stages };
  }
  function synthStage(n, slots, strainOnFail, over) {
    const st = { n: n, boss: false, sealed: false, statRow: 'mid', strainOnFail: strainOnFail == null ? 1 : strainOnFail, slots: slots };
    slots.forEach((s, i) => { s.i = i; });
    return Object.assign(st, over || {});
  }
  function bossStage(n, aspects, over) {
    return Object.assign({ n: n, boss: true, first: false, bossId: 'test', bossName: 'The Test', intro: '', cause: 'was tested',
      aspects: aspects, strainOnFail: 0, reward: { renown: 12, relicRolls: 1, tierUp: 1 } }, over || {});
  }

  /* ---------------- R5 the stage ---------------- */
  {
    const a = MD.GEN.newQuest('sameseed', 1), b = MD.GEN.newQuest('sameseed', 1);
    eq('R5.2 the same seed makes the same quest', JSON.stringify(a), JSON.stringify(b));
    const c = MD.GEN.newQuest('otherseed', 1);
    ok('R5.2 a different seed makes a different quest', JSON.stringify(a) !== JSON.stringify(c));
    eq('R5.2 the same seed and Depth are stable across a Depth change',
      JSON.stringify(MD.GEN.newQuest('sameseed', 1)), JSON.stringify(a));
  }
  {
    const q = MD.GEN.newQuest('shape1', 1);
    eq('R5.1 Depth I is six stages', q.stages.length, 6);
    eq('R5.1 stage six is the boss', q.stages[5].boss, true);
    eq('R9.1 only one boss at Depth I', q.stages.filter((s) => s.boss).length, 1);
    const q2 = MD.GEN.newQuest('shape2', 2);
    eq('R9.1 Depth II is eight stages', q2.stages.length, 8);
    eq('R9.1 Depth II holds two bosses', q2.stages.filter((s) => s.boss).length, 2);
    eq('R9.1 the Depth II first boss is stage four', q2.stages[3].boss && q2.stages[3].first, true);
    ok('R7.6 a quest never draws one boss twice', new Set(q2.bossIds).size === q2.bossIds.length, q2.bossIds.join(','));
  }
  {
    let compOk = true, tnOk = true, strainOk = true, sawTn6 = 0, why = '';
    for (let i = 0; i < 300; i++) {
      const q = MD.GEN.newQuest('comp' + i, 1);
      for (const st of q.stages) {
        if (st.boss) continue;
        const shapes = st.slots.map((s) => s.shape).sort().join(',');
        if (st.n <= 2) { if (!['gate,open', 'gate,toll'].includes(shapes)) { compOk = false; why = 'stage' + st.n + ' ' + shapes; } }
        else if (st.n <= 4) { if (!['chain,gate', 'gate,relay', 'gate,vault'].includes(shapes)) { compOk = false; why = 'stage' + st.n + ' ' + shapes; } }
        else if (st.n === 5) { if (!st.slots.every((s) => ['gate', 'chain', 'relay'].includes(s.shape))) { compOk = false; why = 'stage5 ' + shapes; } }
        if (st.strainOnFail !== (st.n === 5 ? 2 : 1)) strainOk = false;
        for (const s of st.slots) {
          if (s.shape === 'gate' && ![4, 5, 6].includes(s.tns[0])) tnOk = false;   // R5.5 CORRECTED
          if (s.shape === 'gate' && s.tns[0] === 6) sawTn6++;
          if (s.shape === 'chain' && (s.tns[0] !== 3 || s.tns[1] !== 4 || s.stats[0] !== s.stats[1])) tnOk = false;
          if (s.shape === 'relay' && (s.tns[0] !== 4 || s.tns[1] !== 4)) tnOk = false;
          if (s.shape === 'vault' && (s.tns[0] !== 7 || s.stats[0] !== null)) tnOk = false;
          if (s.shape === 'toll' && (s.tns[0] !== 3 || s.fee !== 1)) tnOk = false;
          if (s.shape === 'open' && (s.tns[0] !== 3 || s.stats[0] !== null)) tnOk = false;
        }
      }
    }
    ok('R5.4 Depth I composition holds over 300 quests', compOk, why);
    ok('R5.5 every shape carries its own TNs', tnOk);
    ok('R5.5 a Gate reaches TN 6, so the band is not decorative', sawTn6, 'TN 6 gates seen: ' + sawTn6);
    ok('R5.4 strainOnFail is 1 then 2 on stage five', strainOk);
  }
  {
    let gateFirst = 0, gateSecond = 0;
    for (let i = 0; i < 300; i++) {
      const q = MD.GEN.newQuest('order' + i, 1);
      if (q.stages[0].slots[0].shape === 'gate') gateFirst++; else gateSecond++;
    }
    ok('R5.4 the slot order is rolled, the Gate is not always first', gateSecond > 60, 'gateFirst ' + gateFirst);
  }
  {
    // R3.3: a Chain's second check only happens if the first passed
    let sawBroken = false, sawBoth = false;
    for (let i = 0; i < 200 && !(sawBroken && sawBoth); i++) {
      const a = mkChar('a', { stats: { might: 4, grace: 4, wits: 4, nerve: 4 } });
      const b = mkChar('b'), c = mkChar('c');
      const st = mkState([a, b, c]);
      const q = synthQuest(1, [synthStage(1, [slotOf('chain', ['might', 'might'], [3, 4])], 1)]);
      MD.SIM.startQuest(st, R('chain' + i), q, ['a', 'b', 'c']);
      MD.SIM.assign(st, { slots: [{ chars: ['a'] }], bench: 'b' });
      const rng = R('chainroll' + i);
      MD.SIM.resolveNext(st, rng); MD.SIM.resolveNext(st, rng);
      const res = st.quest.results;
      if (res[0].pass === false) {
        sawBroken = true;
        eq('R3.3 a broken Chain does not roll its second check', res[1].skipped, 'chainBroken');
        eq('R3.3 and the second check counts as failed', res[1].pass, false);
        ok('R3.3 and no die was drawn for it', res[1].roll === undefined);
      } else if (res[0].pass === true) {
        sawBoth = true;
        ok('R3.3 a passed Chain rolls its second check', !!res[1].roll);
      }
    }
    ok('R3.3 both Chain branches were seen', sawBroken && sawBoth, 'broken ' + sawBroken + ' both ' + sawBoth);
  }
  {
    // R5.5 a Relay needs two different bodies
    const a = mkChar('a'), b = mkChar('b'), c = mkChar('c');
    const st = mkState([a, b, c]);
    const q = synthQuest(1, [synthStage(1, [slotOf('relay', ['might', 'wits'], [4, 4])], 1)]);
    MD.SIM.startQuest(st, R('relay'), q, ['a', 'b', 'c']);
    let threw = false;
    try { MD.SIM.assign(st, { slots: [{ chars: ['a', 'a'] }], bench: 'c' }); } catch (e) { threw = true; }
    ok('R5.5 a Relay refuses one body twice', threw);
    let ok2 = true;
    try { MD.SIM.assign(st, { slots: [{ chars: ['a', 'b'] }], bench: 'c' }); } catch (e) { ok2 = false; }
    ok('R5.6 a Relay takes two different bodies', ok2);
  }
  {
    // R5.6 Relay plus Relay lets one character double, and nobody benches
    const a = mkChar('a'), b = mkChar('b'), c = mkChar('c');
    const st = mkState([a, b, c]);
    const q = synthQuest(1, [synthStage(1, [slotOf('relay', ['might', 'wits'], [4, 4]), slotOf('relay', ['grace', 'nerve'], [4, 4])], 1)]);
    MD.SIM.startQuest(st, R('relay2'), q, ['a', 'b', 'c']);
    const plan = MD.SIM.policy.assign(st);
    const used = [].concat(plan.slots[0].chars, plan.slots[1].chars);
    eq('R5.6 Relay plus Relay consumes four assignments', used.length, 4);
    eq('R5.6 and one character takes a check in both', new Set(used).size, 3);
    eq('R5.6 and nobody benches', plan.bench, null);
    let fine = true;
    try { MD.SIM.assign(st, plan); } catch (e) { fine = false; }
    ok('R5.6 the doubled assignment is legal', fine);
  }
  {
    // R5.6 one slot per character when the bodies are there
    const a = mkChar('a'), b = mkChar('b'), c = mkChar('c');
    const st = mkState([a, b, c]);
    const q = synthQuest(1, [synthStage(1, [slotOf('gate', ['might'], [4]), slotOf('gate', ['wits'], [4])], 1)]);
    MD.SIM.startQuest(st, R('double'), q, ['a', 'b', 'c']);
    let threw = false;
    try { MD.SIM.assign(st, { slots: [{ chars: ['a'] }, { chars: ['a'] }], bench: 'b' }); } catch (e) { threw = true; }
    ok('R5.6 one slot per character while three still stand', threw);
  }
  {
    // R5.6 with one living, the other slot is FORFEIT
    const a = mkChar('a'), b = mkChar('b', { alive: false }), c = mkChar('c', { alive: false });
    const st = mkState([a, b, c]);
    const q = synthQuest(1, [synthStage(1, [slotOf('gate', ['might'], [4]), slotOf('gate', ['wits'], [4])], 1)]);
    MD.SIM.startQuest(st, R('forfeit'), q, ['a', 'b', 'c']);
    MD.SIM.assign(st, { slots: [{ chars: ['a'] }, null], bench: null });
    const rng = R('forfeitroll');
    MD.SIM.resolveNext(st, rng); MD.SIM.resolveNext(st, rng);
    eq('R5.6 the unfillable slot is forfeit', st.quest.results[1].skipped, 'forfeit');
    eq('R5.6 a forfeit costs no Strain', a.strain, st.quest.results[0].pass ? 0 : 1);
  }
  {
    // R5.8 contagion hits the others, not the actor twice; Steadfast is immune
    const a = mkChar('a', { stats: { might: 4, grace: 4, wits: 4, nerve: 4 } });
    const b = mkChar('b'), c = mkChar('c', { traits: ['steadfast'] });
    const st = mkState([a, b, c]);
    const q = synthQuest(1, [synthStage(1, [slotOf('gate', ['nerve'], [7])], 1)]);
    MD.SIM.startQuest(st, R('contagion'), q, ['a', 'b', 'c']);
    MD.SIM.assign(st, { slots: [{ chars: ['a'] }], bench: 'b' });
    let seed = 0, res = null;
    while (seed < 400) {
      const snap = [a.strain, b.strain, c.strain];
      res = MD.SIM.resolveNext(st, R('cont' + seed));
      if (res && res.pass === false) break;
      a.strain = snap[0]; b.strain = snap[1]; c.strain = snap[2];
      st.quest.cursor = 0; st.quest.results.length = 0;
      st.quest.def.stages[0].slots[0].checkPass = null;
      st.quest.def.stages[0].slots[0].passed = null;
      st.quest.def.stages[0].slots[0].done = false;
      seed++;
    }
    eq('R5.8 a NERVE failure costs the actor the normal Strain', a.strain, 1);
    eq('R5.8 contagion hits an ally for one', b.strain, 1);
    eq('R4.17 Steadfast takes nothing from contagion', c.strain, 0);
  }
  {
    // R5.8 Ambush crosses a stage boundary after a GRACE failure in the last slot
    const a = mkChar('a', { stats: { might: 4, grace: 4, wits: 4, nerve: 4 } });
    const b = mkChar('b'), c = mkChar('c');
    let crossed = false, why = '';
    for (let i = 0; i < 400 && !crossed; i++) {
      a.strain = 0; b.strain = 0; c.strain = 0; a.alive = true;
      const st = mkState([a, b, c]);
      const q = synthQuest(1, [
        synthStage(1, [slotOf('gate', ['grace'], [7])], 1),
        synthStage(2, [slotOf('gate', ['might'], [3])], 1)
      ]);
      const rng = R('ambush' + i);
      MD.SIM.startQuest(st, rng, q, ['a', 'b', 'c']);
      MD.SIM.assign(st, { slots: [{ chars: ['a'] }], bench: 'b' });
      const r1 = MD.SIM.resolveNext(st, rng);
      if (!r1 || r1.pass !== false) continue;
      ok('R5.8 the GRACE failure arms an Ambush', st.quest.pendingAmbush === true);
      MD.SIM.endStage(st, rng);
      MD.SIM.assign(st, { slots: [{ chars: ['c'] }], bench: 'b' });
      const r2 = MD.SIM.resolveNext(st, rng);
      crossed = true;
      eq('R5.8 Ambush lands on the next stage first slot', r2.ambush, true);
      why = 'seed ' + i;
    }
    ok('R5.8 an Ambush crossing a stage boundary was seen', crossed, why);
  }
  {
    // R5.8 Blindness hides the NEXT stage's TNs
    const a = mkChar('a', { stats: { might: 4, grace: 4, wits: 4, nerve: 4 } });
    const b = mkChar('b'), c = mkChar('c');
    let seen = false;
    for (let i = 0; i < 400 && !seen; i++) {
      a.strain = 0; b.strain = 0; c.strain = 0; a.alive = true;
      const st = mkState([a, b, c]);
      const q = synthQuest(1, [synthStage(1, [slotOf('gate', ['wits'], [7])], 1), synthStage(2, [slotOf('gate', ['might'], [3])], 1)]);
      const rng = R('blind' + i);
      MD.SIM.startQuest(st, rng, q, ['a', 'b', 'c']);
      eq('R5.3 TNs are visible by default', MD.SIM.tnVisible(st, a), true);
      MD.SIM.assign(st, { slots: [{ chars: ['a'] }], bench: 'b' });
      const r1 = MD.SIM.resolveNext(st, rng);
      if (!r1 || r1.pass !== false) continue;
      MD.SIM.endStage(st, rng);
      seen = true;
      eq('R5.8 a WITS failure hides the next stage', MD.SIM.tnVisible(st, a), false);
      MD.SIM.assign(st, { slots: [{ chars: ['c'] }], bench: 'b' });
      MD.SIM.resolveNext(st, rng);
      MD.SIM.endStage(st, rng);
      eq('R5.8 Blindness lasts one stage only', MD.SIM.tnVisible(st, a), true);
    }
    ok('R5.8 a Blindness case was seen', seen);
  }
  {
    // R4.6 a Lanternborn's party always sees a hidden TN
    const a = mkChar('a'), b = mkChar('b', { origin: 'lanternborn' }), c = mkChar('c');
    const st = mkState([a, b, c]);
    const q = synthQuest(1, [synthStage(1, [slotOf('gate', ['might'], [4])], 1)], ['blindfold']);
    MD.SIM.startQuest(st, R('lantern'), q, ['a', 'b', 'c']);
    eq('R9.2 Blindfold hides a TN', MD.SIM.tnVisible(mkStateBlind(), a), false);
    eq('R4.6 a Lanternborn shows it to the whole party', MD.SIM.tnVisible(st, a), true);
    function mkStateBlind() {
      const s2 = mkState([mkChar('x'), mkChar('y'), mkChar('z')]);
      MD.SIM.startQuest(s2, R('blindfold'), synthQuest(1, [synthStage(1, [slotOf('gate', ['might'], [4])], 1)], ['blindfold']), ['x', 'y', 'z']);
      return s2;
    }
  }
  {
    // R5.9 a slot pays only when it passes
    const a = mkChar('a', { stats: { might: 12, grace: 12, wits: 12, nerve: 12 } });
    const st = mkState([a, mkChar('b'), mkChar('c')]);
    const q = synthQuest(1, [synthStage(1, [slotOf('gate', ['might'], [3])], 1)]);
    const rng = R('reward');
    MD.SIM.startQuest(st, rng, q, ['a', 'b', 'c']);
    MD.SIM.assign(st, { slots: [{ chars: ['a'] }], bench: 'b' });
    const r = MD.SIM.resolveNext(st, rng);
    eq('R5.9 a passed Gate pays its Renown', st.quest.renown, r.pass ? MD.BALANCE.RENOWN.gate : 0);
    ok('R5.9 a failed slot pays nothing', r.pass || st.quest.renown === 0);
  }
  {
    // R5.7 the bench clears and the Respite clears, at Depth I
    // Steady floors every stat at 3, so these two checks cannot fail and the test measures the Respite alone
    const a = mkChar('a', { strain: 3 }), b = mkChar('b', { strain: 2, traits: ['steady'] }), c = mkChar('c', { strain: 2, traits: ['steady'] });
    const st = mkState([a, b, c]);
    const q = synthQuest(1, [synthStage(1, [slotOf('gate', ['might'], [3]), slotOf('gate', ['wits'], [3])], 1), synthStage(2, [slotOf('gate', ['might'], [3])], 1)]);
    const rng = R('bench');
    MD.SIM.startQuest(st, rng, q, ['a', 'b', 'c']);
    MD.SIM.assign(st, { slots: [{ chars: ['b'] }, { chars: ['c'] }], bench: 'a' });
    MD.SIM.resolveNext(st, rng); MD.SIM.resolveNext(st, rng);
    const before = a.strain;
    MD.SIM.endStage(st, rng);
    eq('R5.6 the bench clears one and R5.7 the Respite clears one more', a.strain, Math.max(0, before - 1 - MD.BALANCE.RESPITE[0]));
    eq('R5.7 the Respite reaches a character who acted', c.strain, Math.max(0, 2 - MD.BALANCE.RESPITE[0]));
  }
  {
    // R9.1 Depth III keeps its Strain: no Respite
    eq('R9.1 Depth I Respite', MD.BALANCE.RESPITE[0], 1);
    eq('R9.1 Depth II Respite', MD.BALANCE.RESPITE[1], 1);
    eq('R9.1 Depth III has no Respite', MD.BALANCE.RESPITE[2], 0);
    const a = mkChar('a', { strain: 2 }), b = mkChar('b'), c = mkChar('c');
    const st = mkState([a, b, c]);
    const q = synthQuest(3, [synthStage(1, [slotOf('gate', ['might'], [3])], 1), synthStage(2, [slotOf('gate', ['might'], [3])], 1)]);
    const rng = R('undertow');
    MD.SIM.startQuest(st, rng, q, ['a', 'b', 'c']);
    MD.SIM.assign(st, { slots: [{ chars: ['a'] }], bench: 'b' });
    MD.SIM.resolveNext(st, rng);
    MD.SIM.endStage(st, rng);
    eq('R9.1 at Depth III only the bench recovers', a.strain, 2);
  }

  /* ---------------- R9.2 and R9.3 the Sigils ---------------- */
  {
    const a = mkChar('a', { stats: { might: 4, grace: 4, wits: 4, nerve: 4 } });
    const b = mkChar('b'), c = mkChar('c');
    const st = mkState([a, b, c]);
    const q = synthQuest(1, [synthStage(1, [slotOf('gate', ['might'], [7])], 1)], ['thinIce']);
    const rng = R('thinice');
    MD.SIM.startQuest(st, rng, q, ['a', 'b', 'c']);
    MD.SIM.assign(st, { slots: [{ chars: ['a'] }], bench: 'b' });
    let r = null, i = 0;
    while (i < 200) { r = MD.SIM.resolveNext(st, R('ti' + i)); if (r && r.pass === false) break; a.strain = 0; st.quest.cursor = 0; st.quest.thinIceUsed = false; st.quest.results.length = 0; q.stages[0].slots[0].checkPass = null; q.stages[0].slots[0].passed = null; q.stages[0].slots[0].done = false; i++; }
    eq('R9.2 Thin Ice makes the first failure cost two', a.strain, 2);
  }
  {
    const plain = mkChar('p', { traits: ['bulwark'] });
    const st = mkState([plain, mkChar('b'), mkChar('c')]);
    const q = synthQuest(1, [synthStage(1, [slotOf('gate', ['might'], [4])], 1)], ['rustbound']);
    MD.SIM.startQuest(st, R('rust'), q, ['p', 'b', 'c']);
    eq('R9.2 Rustbound reads Armor as zero', MD.effArmor(plain, null, st.quest), 0);
    const warded = mkChar('w', { traits: ['bulwark'], gear: { sigilWard: gearItem('sigilWard', [aff('sigilPartial', [{ k: 'sigilPartial', sigil: 'rustbound' }], 2)]) } });
    const st2 = mkState([warded, mkChar('b'), mkChar('c')]);
    MD.SIM.startQuest(st2, R('rust2'), synthQuest(1, [synthStage(1, [slotOf('gate', ['might'], [4])], 1)], ['rustbound']), ['w', 'b', 'c']);
    eq('R9.3 a partial Ward keeps one point of Armor', MD.effArmor(warded, null, st2.quest), 1);
    const immune = mkChar('m', { traits: ['bulwark'], gear: { sigilWard: gearItem('sigilWard', [aff('sigilImmune', [{ k: 'sigilImmune', sigil: 'rustbound' }], 3)]) } });
    const st3 = mkState([immune, mkChar('b'), mkChar('c')]);
    MD.SIM.startQuest(st3, R('rust3'), synthQuest(1, [synthStage(1, [slotOf('gate', ['might'], [4])], 1)], ['rustbound']), ['m', 'b', 'c']);
    eq('R9.3 an immunity Ward keeps all of it', MD.effArmor(immune, null, st3.quest), 2);
  }
  {
    const a = mkChar('a'), b = mkChar('b'), c = mkChar('c');
    const st = mkState([a, b, c]);
    MD.SIM.startQuest(st, R('hollow'), synthQuest(1, [synthStage(1, [slotOf('gate', ['might'], [4])], 1)], ['hollowAir']), ['a', 'b', 'c']);
    const ctx = MD.SIM.checkContext(st, a, { stat: 'might', tn: 4, shape: 'gate' });
    eq('R9.2 Hollow Air stops every surge', ctx.noSurge, true);
    const w = mkChar('w', { gear: { sigilWard: gearItem('sigilWard', [aff('sigilPartial', [{ k: 'sigilPartial', sigil: 'hollowAir' }], 2)]) } });
    const st2 = mkState([w, b, c]);
    MD.SIM.startQuest(st2, R('hollow2'), synthQuest(1, [synthStage(1, [slotOf('gate', ['might'], [4])], 1)], ['hollowAir']), ['w', 'b', 'c']);
    const ctx2 = MD.SIM.checkContext(st2, w, { stat: 'might', tn: 4, shape: 'gate' });
    eq('R9.3 a partial Ward gives one surge', ctx2.surgeOnce, true);
    eq('R9.3 and it is not a full stop', ctx2.noSurge, false);
    let maxChain = 0;
    const rng = R('once');
    for (let i = 0; i < 5000; i++) { const r = MD.roll(8, { rng, surgeOnce: true }); if (r.chain.length > maxChain) maxChain = r.chain.length; }
    eq('R9.3 one surge never chains', maxChain, 1);
  }
  {
    const s = mkChar('s', { traits: ['steady'] });
    const st = mkState([s, mkChar('b'), mkChar('c')]);
    MD.SIM.startQuest(st, R('shiver'), synthQuest(1, [synthStage(1, [slotOf('gate', ['might'], [4])], 1)], ['shivering']), ['s', 'b', 'c']);
    eq('R9.2 Shivering ignores a floor', MD.SIM.checkContext(st, s, { stat: 'might', tn: 4, shape: 'gate' }).floor, 0);
    const w = mkChar('w', { traits: ['steady'], gear: { sigilWard: gearItem('sigilWard', [aff('sigilPartial', [{ k: 'sigilPartial', sigil: 'shivering' }], 2)]) } });
    const st2 = mkState([w, mkChar('b'), mkChar('c')]);
    MD.SIM.startQuest(st2, R('shiver2'), synthQuest(1, [synthStage(1, [slotOf('gate', ['might'], [4])], 1)], ['shivering']), ['w', 'b', 'c']);
    eq('R9.3 a partial Ward keeps floors up to three', MD.SIM.checkContext(st2, w, { stat: 'might', tn: 4, shape: 'gate' }).floor, 3);
  }
  {
    const a = mkChar('a'), b = mkChar('b', { strain: 2 }), c = mkChar('c');
    const st = mkState([a, b, c]);
    const q = synthQuest(1, [synthStage(1, [slotOf('gate', ['might'], [3])], 1), synthStage(2, [slotOf('gate', ['might'], [3])], 1)], ['pressgang']);
    const rng = R('press');
    MD.SIM.startQuest(st, rng, q, ['a', 'b', 'c']);
    MD.SIM.assign(st, { slots: [{ chars: ['a'] }], bench: 'b' });
    MD.SIM.resolveNext(st, rng);
    MD.SIM.endStage(st, rng);
    eq('R9.2 Pressgang costs the third character one instead of a bench', b.strain, 3 - MD.BALANCE.RESPITE[0]);
  }
  {
    let counts = {};
    for (let d = 1; d <= 5; d++) {
      counts[d] = new Set();
      for (let i = 0; i < 200; i++) counts[d].add(MD.GEN.newQuest('sig' + d + i, d).sigils.length);
    }
    eq('R9.2 Depth I offers none or one Sigil', [...counts[1]].sort().join(','), '0,1');
    eq('R9.2 Depth II offers one', [...counts[2]].join(','), '1');
    eq('R9.2 Depth IV offers two', [...counts[4]].join(','), '2');
    eq('R9.2 Depth V offers two or three', [...counts[5]].sort().join(','), '2,3');
    let distinct = true;
    for (let i = 0; i < 200; i++) { const q = MD.GEN.newQuest('sigd' + i, 5); if (new Set(q.sigils).size !== q.sigils.length) distinct = false; }
    ok('R9.2 Sigils on one quest are distinct', distinct);
  }

  /* ---------------- R2.4, R8.5, R8.7 death ---------------- */
  {
    const a = mkChar('a', { strain: 3, questsSurvived: 1 });
    const st = mkState([a, mkChar('b'), mkChar('c')]);
    MD.SIM.startQuest(st, R('death'), synthQuest(1, [synthStage(1, [slotOf('gate', ['might'], [4])], 1)], []), ['a', 'b', 'c']);
    MD.SIM.applyStrain(st, a, 1, {});
    eq('R2.4 Strain reaching Toughness kills', a.alive, false);
    eq('R8.5 a proven death pays one Marrow at Depth I', st.account.marrow, 1);
    eq('R8.7 a death makes a Legacy', st.account.legacies.length, 1);
    eq('R8.8 a death writes the wall', st.account.wall.length, 1);
    /* R8.5 CORRECTED (audit): an UNPROVEN death pays 0 Marrow and still makes the Legacy and writes the wall,
     * so death stays productive without being purchasable. A mid quest Recruit could otherwise feed the boss a
     * fresh body at every stage end, which is 9 to 14 Marrow a quest against an income of 1.5. */
    const rookie = mkChar('r', { strain: 3, questsSurvived: 0 });
    const st2 = mkState([rookie]);
    MD.SIM.startQuest(st2, R('rookie'), synthQuest(5, [synthStage(1, [slotOf('gate', ['might'], [4])], 1)], []), ['r']);
    MD.SIM.applyStrain(st2, rookie, 1, {});
    eq('R8.5 an unproven death pays no Marrow, even at Depth V', st2.account.marrow, 0);
    eq('R8.5 and still makes the Legacy', st2.account.legacies.length, 1);
    eq('R8.5 and still writes the wall', st2.account.wall.length, 1);
  }
  {
    const a = mkChar('a', { strain: 3, traits: ['unkillable'] });
    const st = mkState([a, mkChar('b'), mkChar('c')]);
    MD.SIM.startQuest(st, R('unkill'), synthQuest(1, [synthStage(1, [slotOf('gate', ['might'], [4])], 1)], []), ['a', 'b', 'c']);
    MD.SIM.applyStrain(st, a, 1, {});
    eq('R2.4 Unkillable stops the first killing blow', a.alive, true);
    eq('R2.4 and leaves one under Toughness', a.strain, MD.effToughness(a) - 1);
    MD.SIM.applyStrain(st, a, 5, {});
    eq('R2.4 Unkillable is once per quest', a.alive, false);
  }
  {
    const st = mkState([mkChar('a', { strain: 0, questsSurvived: 1 })]);
    const q = synthQuest(3, [synthStage(1, [slotOf('gate', ['might'], [4])], 1)], []);
    MD.SIM.startQuest(st, R('marrow3'), q, ['a']);
    MD.SIM.applyStrain(st, MD.SIM.byId(st, 'a'), 9, {});
    eq('R8.5 a proven death at Depth III pays two Marrow', st.account.marrow, 2);
  }
  {
    const st = mkState([mkChar('a', { questsSurvived: 2 })]);
    const q = synthQuest(5, [synthStage(1, [slotOf('gate', ['might'], [4])], 1)], []);
    MD.SIM.startQuest(st, R('marrow5'), q, ['a']);
    MD.SIM.applyStrain(st, MD.SIM.byId(st, 'a'), 9, {});
    eq('R8.5 a proven death at Depth V pays three Marrow', st.account.marrow, 3);
  }
  {
    /* R2.6 CORRECTED (audit): RETIRE_VESTING is 3. Under it a retirement pays its Traits alone, because the
     * spec's flat 2 plus Traits paid 3 Marrow for a character retired after ONE quest, six times the design's
     * own rate, so the fastest Marrow in the game was to recruit and retire rookies and never risk anyone. */
    const young = mkChar('y', { questsSurvived: 2, traits: ['grim', 'steady'] });
    const sty = mkState([young]);
    eq('R2.6 an unvested retirement pays its Traits alone', MD.SIM.retire(sty, 'y').marrow, 2);
    eq('R2.6 and still makes a Legacy', sty.account.legacies.length, 1);
    const a = mkChar('a', { questsSurvived: 3, traits: ['grim', 'steady'] });
    const st = mkState([a]);
    const r = MD.SIM.retire(st, 'a');
    eq('R2.6 a vested retirement pays two plus Traits', r.marrow, 4);
    eq('R2.6 the vest lands where the third Scar does', MD.BALANCE.RETIRE_VESTING, 3);
    eq('R2.6 and makes a Legacy', st.account.legacies.length, 1);
    eq('R2.6 and writes the wall', st.account.wall.length, 1);
    eq('R2.6 and leaves the roster', st.roster.length, 0);
  }
  {
    const a = mkChar('a', { questsSurvived: 0 });
    const st = mkState([a]);
    const bad = MD.SIM.retire(st, 'a');
    eq('R2.6 a character with no quest cannot retire', bad.ok, false);
    const r = MD.SIM.dismiss(st, 'a');
    eq('R2.6 a dismissal pays nothing', r.marrow, 0);
    eq('R2.6 and makes no Legacy', st.account.legacies.length, 0);
    eq('R2.6 and writes no wall line', st.account.wall.length, 0);
  }

  /* ---------------- R6 relics ---------------- */
  {
    let budgetOk = true, keyOk = true, slotOk = true, uniqueOk = true, fillerOk = true, why = '';
    const rng = R('thousand');
    for (let i = 0; i < 1000; i++) {
      const depth = 1 + (i % 5);
      const item = MD.GEN.newRelic(rng, depth, {});
      const pts = item.affixes.reduce((a, x) => a + x.pts, 0);
      if (pts !== item.budget) { budgetOk = false; why = item.slot + ' ' + pts + '/' + item.budget; }
      const seen = {}, sigs = {};
      let filler = 0;
      for (const a of item.affixes) {
        // R6.2 (b): toughness and armor may each appear twice; a targeted key repeats only with another target
        const twiceOk = (a.key === 'toughness' || a.key === 'armor');
        const k = a.key + (a.stat ? ':' + a.stat : '') + (a.sigil ? '@' + a.sigil : '');
        const n = (seen['#' + k] = (seen['#' + k] || 0) + 1);
        if (n > (twiceOk ? 2 : 1)) { keyOk = false; why = 'repeat ' + k + ' x' + n + ' on ' + item.slot; }
        if (a.sigil) { if (sigs[a.sigil]) { keyOk = false; why = 'Sigil named twice: ' + a.sigil; } sigs[a.sigil] = 1; }
        if (a.filler) filler += a.pts;
        const def = MD.AFFIXES[a.key];
        if (a.key !== 'toughness' && def.slots.indexOf(item.slot) < 0) { slotOk = false; why = a.key + ' on ' + item.slot; }
      }
      if (filler > MD.BALANCE.FILLER_MAX) { fillerOk = false; why = 'filler ' + filler + ' on ' + item.slot; }
      if (item.rarity === 'relic' && !item.unique) uniqueOk = false;
      if (item.rarity !== 'relic' && item.unique) uniqueOk = false;
    }
    ok('R6.2 a thousand relics meet their budget exactly', budgetOk, why);
    ok('R6.2 and never repeat an affix key', keyOk, why);
    ok('R6.2 and only carry affixes valid for the slot', slotOk, why);
    ok('R6.4 Relic rarity carries a unique and nothing else does', uniqueOk);
    ok('R6.2 and never carry more filler Toughness than FILLER_MAX', fillerOk, why);
  }
  {
    let noCommon = true;
    const rng = R('depth45');
    for (let i = 0; i < 500; i++) {
      if (MD.GEN.newRelic(rng, 4, {}).rarity === 'common') noCommon = false;
      if (MD.GEN.newRelic(rng, 5, {}).rarity === 'common') noCommon = false;
    }
    ok('R6.1 Depth IV and V never drop a Common', noCommon);
    let relicOnly = true;
    for (let i = 0; i < 200; i++) if (MD.GEN.newRelic(rng, 5, { rarity: 'relic' }).rarity !== 'relic') relicOnly = false;
    ok('R6.1 a Relic rarity roll stays Relic when stepped up', relicOnly);
    eq('R6.1 a step up from Rare is Relic', MD.RARITIES[MD.GEN.rollRarity({ weighted: () => 2, int: () => 0, next: () => 0 }, 1, 1)], 'relic');
  }
  {
    const rng = R('names');
    let oneAffix = null, twoAffix = null;
    for (let i = 0; i < 400 && !(oneAffix && twoAffix); i++) {
      const it = MD.GEN.newRelic(rng, 1, {});
      if (it.affixes.length === 1 && !it.unique) oneAffix = it;
      if (it.affixes.length >= 2 && !it.unique) twoAffix = it;
    }
    // R6.5 CORRECTED (audit): a one affix item draws its suffix from that same affix's list, so every item
    // carries an of clause. With none, a one affix item had 24 possible names and repeated inside the first hour.
    ok('R6.5 a one affix item still names a suffix', oneAffix && oneAffix.name.indexOf(' of ') > 0, oneAffix && oneAffix.name);
    ok('R6.5 two affixes name a prefix a base and a suffix', twoAffix && twoAffix.name.indexOf(' of ') > 0, twoAffix && twoAffix.name);
  }
  {
    eq('R6.7 Common salvage', MD.BALANCE.SALVAGE.common, 1);
    eq('R6.7 Relic salvage', MD.BALANCE.SALVAGE.relic, 12);
    const st = mkState([mkChar('a')]);
    const it = MD.GEN.newRelic(R('salv'), 1, { rarity: 'rare' });
    MD.SIM.applyDrop(st, R('salv2'), it, null);
    eq('R6.7 TAKE RENOWN pays the salvage line', st.account.renown, MD.BALANCE.SALVAGE.rare);
  }
  {
    const st = mkState([mkChar('a')]);
    const rng = R('equip');
    const worn = MD.GEN.newRelic(rng, 1, { slot: 'head', rarity: 'common' });
    const better = MD.GEN.newRelic(rng, 1, { slot: 'head', rarity: 'rare' });
    MD.SIM.applyDrop(st, rng, worn, 'a');
    const before = st.account.renown;
    MD.SIM.applyDrop(st, rng, better, 'a');
    eq('R6.7 the replaced item converts to Renown at once', st.account.renown - before, MD.BALANCE.SALVAGE.common);
    eq('R6.6 the new relic is worn', MD.SIM.byId(st, 'a').gear.head.id, better.id);
  }
  {
    // R6.3 CORRECTED (audit): generation never rerolls a stat and equipping never retargets one. A step onto a
    // stat already at d12 is greyed and does nothing, and the drop screen shows its delta as 0.
    const it = { slot: 'hands', rarity: 'rare', pts: 2, budget: 2, unique: null, name: 'x',
      affixes: [aff('stepStat', [{ k: 'stepStat', stat: 'might' }], 2, 'might')] };
    const maxed = mkChar('a', { stats: { might: 12, grace: 8, wits: 8, nerve: 8 }, gear: { hands: it } });
    eq('R6.3 a step onto a d12 stat does nothing', MD.effStat(maxed, 'might'), 12);
    eq('R6.3 and the drop screen can grey the line', MD.GEN.deadLines(it, maxed).join(','), '0');
    const room = mkChar('b', { stats: { might: 8, grace: 8, wits: 8, nerve: 8 }, gear: { hands: it } });
    eq('R6.3 a step with room to move raises the die', MD.effStat(room, 'might'), 10);
    eq('R6.3 and nothing is greyed', MD.GEN.deadLines(it, room).length, 0);
    eq('R6.3 the item is never mutated per wearer', it.affixes[0].stat, 'might');
    // R12: the effective die after a step feeds the floor cap and Deepdrawn's highest stat
    const dd = mkChar('c', { traits: ['deepdrawn'], stats: { might: 8, grace: 10, wits: 8, nerve: 8 }, gear: { hands: it } });
    eq('R6.3 Deepdrawn reads the die AFTER the step', MD.query(MD.collect(dd), 'surgeMinus', { stat: 'might' }), true);
  }
  {
    const st = mkState([mkChar('a')]);
    st.account.renown = 100;
    const rng = R('reforge');
    const it = MD.GEN.newRelic(rng, 3, { slot: 'token', rarity: 'rare' });
    MD.SIM.applyDrop(st, rng, it, 'a');
    const before = st.account.renown, ptsBefore = it.affixes[0].pts;
    const r = MD.SIM.hall.reforge(st, rng, 'a', 'token', 0);
    eq('R6.9 a Reforge costs fifteen', before - st.account.renown, MD.BALANCE.HALL.reforge);
    eq('R6.9 and the line keeps its point value', MD.SIM.byId(st, 'a').gear.token.affixes[0].pts, ptsBefore);
    ok('R6.9 the Reforge answered', r.ok);
  }
  {
    const st = mkState([mkChar('a')]);
    st.account.renown = 5;
    eq('R8.1 the Hall refuses a Commission it cannot pay', MD.SIM.hall.commission(st, R('c'), 'head').ok, false);
    eq('R8.1 and refuses a Mend it cannot pay', MD.SIM.hall.mend(st).ok, false);
    st.account.renown = 60;
    const com = MD.SIM.hall.commission(st, R('c2'), 'head');
    eq('R6.10 a Commission deals three relics', com.offers.length, 3);
    ok('R6.10 all of the chosen slot', com.offers.every((o) => o.slot === 'head'));
    eq('R8.1 and takes forty Renown', st.account.renown, 20);
  }
  {
    const st = mkState([mkChar('a', { scars: 2 })]);
    st.account.renown = 200;
    eq('R2.5 Excise takes a Scar', MD.SIM.hall.excise(st, 'a').ok && MD.SIM.byId(st, 'a').scars, 1);
    eq('R2.5 Excise is once per character ever', MD.SIM.hall.excise(st, 'a').ok, false);
  }
  {
    const st = mkState([mkChar('a')]);
    st.account.marrow = 3;
    eq('R8.6 the first floor purchase raises a stat to d6', MD.SIM.hall.raiseFloor(st, 'might').floor, 6);
    eq('R8.2 and it took three Marrow', st.account.marrow, 0);
    eq('R8.2 the Hall refuses what it cannot pay in Marrow', MD.SIM.hall.raiseFloor(st, 'grace').ok, false);
    st.account.marrow = 6;
    eq('R8.6 the second purchase raises it to d8', MD.SIM.hall.raiseFloor(st, 'might').floor, 8);
    eq('R8.6 and there is no third', MD.SIM.hall.raiseFloor(st, 'might').ok, false);
  }
  {
    const st = mkState([]);
    st.account.marrow = 20;
    st.account.legacies = [{ id: 'L1', calling: 'zealot', charName: 'x', consecrated: false }, { id: 'L2', calling: 'warden', charName: 'y', consecrated: false }];
    MD.SIM.hall.consecrate(st, 'L1');
    MD.SIM.hall.consecrate(st, 'L2');
    eq('R8.2 only one Legacy is consecrated at a time', st.account.legacies.filter((l) => l.consecrated).length, 1);
    const dealt = MD.GEN.dealCallings(R('deal'), st.account);
    eq('R8.7 the consecrated Legacy is dealt first', dealt[0].calling, 'warden');
    eq('R8.7 three cards, always', dealt.length, 3);
    ok('R8.7 with no repeated Calling', new Set(dealt.map((d) => d.calling)).size === 3);
  }

  /* ---------------- R7 the boss ---------------- */
  {
    for (let d = 1; d <= 5; d++) {
      const q = MD.GEN.newQuest('boss' + d, d);
      const last = q.stages[q.stages.length - 1];
      eq('R7.1 Depth ' + d + ' boss Aspect count', last.aspects.length, d >= 4 ? 4 : 3);
      const stats = last.aspects.slice(0, 3).map((a) => a.stat);
      ok('R7.1 the three Aspects lock three different stats at Depth ' + d, new Set(stats).size === 3, stats.join(','));
    }
    const q3 = MD.GEN.newQuest('hp3', 3), q1 = MD.GEN.newQuest('hp3', 1);
    ok('R7.1 Aspect hit points rise with the Depth', MD.BALANCE.ASPECT_HP_BONUS[2] === 1 && MD.BALANCE.ASPECT_HP_BONUS[4] === 2);
    const q2 = MD.GEN.newQuest('firstboss', 2);
    const fb = q2.stages[3], full = q2.stages[7];
    ok('R7.6 the first boss stands at half hit points', fb.aspects[0].hp <= Math.ceil(full.aspects[0].hp / 2) + 1, fb.aspects[0].hp + ' vs ' + full.aspects[0].hp);
    eq('R7.6 the first boss pays eight before the Depth multiplier', fb.reward.renown,
      Math.round(MD.BALANCE.RENOWN.firstBoss * MD.BALANCE.DEPTH_RENOWN_MULT[1]));
    ok('R7.6 which is less than the quest boss pays', fb.reward.renown < full.reward.renown,
      fb.reward.renown + ' vs ' + full.reward.renown);
    eq('R5.9 the boss pays twelve at Depth I', MD.GEN.newQuest('br', 1).stages[5].reward.renown, MD.BALANCE.RENOWN.boss);
  }
  {
    // R7.2 damage is max(1, surplus), and an Aspect at zero is broken
    const a = mkChar('a', { stats: { might: 12, grace: 12, wits: 12, nerve: 12 } });
    const st = mkState([a, mkChar('b'), mkChar('c')]);
    const stage = bossStage(1, [{ name: 'A', stat: 'might', tn: 3, hp: 40, maxHp: 40, broken: false }]);
    MD.SIM.startQuest(st, R('dmg'), synthQuest(1, [stage]), ['a', 'b', 'c']);
    st.quest.step = 'bossAssign';
    MD.SIM.bossAssign(st, { targets: { a: 0, b: 0, c: 0 } });
    const rng = R('dmgroll');
    let checked = 0;
    while (st.quest.step === 'bossCheck') {
      const r = MD.SIM.resolveBossCheck(st, rng);
      if (r && r.pass) { eq('R7.2 damage is the surplus, minimum one', r.damage, Math.max(1, r.roll.total - r.tn)); checked++; }
      else if (r && r.pass === false) eq('R7.2 a failed Aspect check deals nothing', r.damage, 0);
    }
    ok('R7.2 at least one Aspect check landed', checked > 0);
  }
  {
    // R7.2 a character whose Aspect is broken rolls against the unbroken one with the fewest hit points
    const a = mkChar('a'), b = mkChar('b'), c = mkChar('c');
    const st = mkState([a, b, c]);
    const stage = bossStage(1, [
      { name: 'Broken', stat: 'might', tn: 4, hp: 0, maxHp: 3, broken: true },
      { name: 'Fat', stat: 'grace', tn: 4, hp: 9, maxHp: 9, broken: false },
      { name: 'Thin', stat: 'wits', tn: 4, hp: 1, maxHp: 3, broken: false }]);
    MD.SIM.startQuest(st, R('retarget'), synthQuest(1, [stage]), ['a', 'b', 'c']);
    st.quest.step = 'bossAssign';
    MD.SIM.bossAssign(st, { targets: { a: 0, b: 1, c: 2 } });
    const r = MD.SIM.resolveBossCheck(st, R('rt'));
    eq('R7.2 a wasted action is retargeted', r.retargeted, true);
    eq('R7.2 to the unbroken Aspect with the fewest hit points', r.aspectName, 'Thin');
  }
  {
    // R7.3 the last Aspect breaking ends the round with no Strike
    const a = mkChar('a', { stats: { might: 12, grace: 12, wits: 12, nerve: 12 } });
    const st = mkState([a, mkChar('b'), mkChar('c')]);
    const stage = bossStage(1, [{ name: 'A', stat: 'might', tn: 3, hp: 1, maxHp: 1, broken: false }]);
    MD.SIM.startQuest(st, R('win'), synthQuest(1, [stage]), ['a', 'b', 'c']);
    st.quest.step = 'bossAssign';
    MD.SIM.bossAssign(st, { targets: { a: 0, b: 0, c: 0 } });
    const rng = R('winroll');
    let guard = 0;
    while (st.quest.step === 'bossCheck' && guard++ < 10) MD.SIM.resolveBossCheck(st, rng);
    eq('R7.3 all Aspects broken means the boss falls', st.quest.step, 'bossWon');
    eq('R7.4 and no Strike lands that round', a.strain + MD.SIM.byId(st, 'b').strain + MD.SIM.byId(st, 'c').strain, 0);
  }
  {
    // R7.4 the three Strike target laws
    function strikeRun(law) {
      const bal = MD.makeBalance({ STRIKE_TARGET: law });
      MD.useBalance(bal);
      const a = mkChar('a'), b = mkChar('b', { strain: 2 }), c = mkChar('c');
      const st = mkState([a, b, c]);
      const stage = bossStage(1, [
        { name: 'One', stat: 'might', tn: 20, hp: 9, maxHp: 9, broken: false },
        { name: 'Two', stat: 'grace', tn: 20, hp: 9, maxHp: 9, broken: false }]);
      MD.SIM.startQuest(st, R('strike' + law), synthQuest(1, [stage]), ['a', 'b', 'c']);
      st.quest.step = 'bossAssign';
      MD.SIM.bossAssign(st, { targets: { a: 0, b: 0, c: 0 } });   // nobody faces Aspect Two
      const rng = R('strikeroll' + law);
      MD.SIM.bossRound(st, rng);
      const out = { a: a.strain, b: b.strain - 2, c: c.strain, law: law };
      MD.useBalance(null);
      return out;
    }
    const all = strikeRun('all');
    eq('R7.4 all: every living character takes both Strikes', all.a, MD.BALANCE.STRIKE[0] * 2);
    eq('R7.4 all: nobody is spared', all.c, MD.BALANCE.STRIKE[0] * 2);
    const att = strikeRun('attackers');
    eq('R7.4 attackers: the faced Aspect hits its attackers', att.a >= MD.BALANCE.STRIKE[0], true);
    eq('R7.4 attackers: an Aspect nobody faced hits everyone', att.a, MD.BALANCE.STRIKE[0] * 2);
    const spread = strikeRun('spread');
    eq('R7.4 spread: the total landed equals two Aspects worth', spread.a + spread.b + spread.c, MD.BALANCE.STRIKE[0] * 2);
    ok('R7.4 spread: the most strained is spared first', spread.b <= spread.a, 'b ' + spread.b + ' a ' + spread.a);
  }
  {
    // R4.9 Vanguard takes one less from each Strike, R3.2 order
    const bal = MD.makeBalance({ STRIKE_TARGET: 'all' });
    MD.useBalance(bal);
    const a = mkChar('a', { calling: 'vanguard' }), b = mkChar('b');
    const st = mkState([a, b]);
    const stage = bossStage(1, [{ name: 'One', stat: 'might', tn: 20, hp: 9, maxHp: 9, broken: false }]);
    MD.SIM.startQuest(st, R('vanguard'), synthQuest(1, [stage]), ['a', 'b']);
    st.quest.step = 'bossAssign';
    MD.SIM.bossAssign(st, { targets: { a: 0, b: 0 } });
    MD.SIM.bossRound(st, R('vroll'));
    eq('R4.9 Vanguard takes one less from a Strike', a.strain, MD.BALANCE.STRIKE[0] - 1);
    eq('R7.4 and everybody else takes it whole', b.strain, MD.BALANCE.STRIKE[0]);
    MD.useBalance(null);
  }
  {
    /* R7.4 CORRECTED (audit): the law is `attackers`, and BALANCE.STRIKE is 1 at Depth I and II. At the spec's 2
     * a 20,000 quest simulation measured 81 percent per character death and a 78 percent wipe against targets of
     * 12 to 15 and 8, and `spread` is refused because each point is its own instance, which makes a Vanguard
     * immune to the boss and kills through Unkillable one point at a time. */
    eq('R7.4 the law is attackers', MD.BALANCE.STRIKE_TARGET, 'attackers');
    ok('R7.4 the chosen law is one of the three', ['attackers', 'all', 'spread'].indexOf(MD.BALANCE.STRIKE_TARGET) >= 0);
    eq('R7.4 the Strike is one at Depth I and II', MD.BALANCE.STRIKE.slice(0, 2).join(','), '1,1');
    eq('R7.4 two at Depth III', MD.BALANCE.STRIKE[2], 2);
    eq('R7.4 and three at Depth IV and V', MD.BALANCE.STRIKE.slice(3).join(','), '3,3');
  }

  /* ---------------- R8 and R9 the Depths and the economy ---------------- */
  {
    eq('R8.4 Depth unlock counts', MD.BALANCE.DEPTH_UNLOCK.join(','), '0,3,10,25,50');
    const st = mkState([]);
    eq('R8.4 a fresh account sees Depth I only', MD.SIM.unlockedDepths(st).join(','), '1');
    st.account.questsCompleted = 10;
    eq('R8.4 ten wins opens Depth III', MD.SIM.unlockedDepths(st).join(','), '1,2,3');
    st.account.questsCompleted = 50;
    eq('R8.4 fifty wins opens Marrowdeep', MD.SIM.unlockedDepths(st).join(','), '1,2,3,4,5');
  }
  {
    // R9.1 a Depth IV sealed stage repeats until its Vault passes
    for (const d of [4, 5]) {
      const q = MD.GEN.newQuest('sealed' + d, d);
      const sealed = q.stages.filter((s) => s.sealed);
      eq('R9.1 Depth ' + d + ' seals two stages', sealed.length, 2);
      ok('R9.1 and their last slot is a Vault', sealed.every((s) => s.slots[s.slots.length - 1].shape === 'vault'), sealed.map((s) => s.slots.map((x) => x.shape).join('+')).join(' '));
      eq('R9.1 stages 3 and 6 are the sealed ones at Depth ' + d, sealed.map((s) => s.n).join(','), '3,6');
    }
    /* R9.1 CORRECTED (audit): only the Vault repeats. The other slot resolves ONCE, and between attempts nothing
     * happens except the Vault's own Strain instance and a fresh choice of holder and stat: no bench clear, no
     * Respite, no rewards, no drops. Stage end runs once, when the Vault passes or the party is dead. */
    const a = mkChar('a', { stats: { might: 4, grace: 4, wits: 4, nerve: 4 } });
    const b = mkChar('b', { strain: 2 }), c = mkChar('c', { strain: 2 });
    const st = mkState([a, b, c]);
    const stage = synthStage(1, [slotOf('gate', ['might'], [3]), slotOf('vault', [null], [7], { sealed: true })], 1, { sealed: true });
    const q = synthQuest(4, [stage, synthStage(2, [slotOf('gate', ['might'], [3])], 1)]);
    const rng = R('sealedrun');
    MD.SIM.startQuest(st, rng, q, ['a', 'b', 'c']);
    let repeats = 0, guard = 0, gateResolved = 0, renownSeen = [];
    while (st.quest.stageIndex === 0 && guard++ < 40 && st.quest.step !== 'lost') {
      const living = MD.SIM.livingParty(st);
      if (!living.length) break;
      const plan = { slots: [null, null], bench: null };
      if (!stage.slots[0].done) plan.slots[0] = { chars: [living[0]] };
      plan.slots[1] = { chars: [living[living.length - 1]], stat: 'might' };
      MD.SIM.assign(st, plan);
      const before = st.quest.results.length;
      while (st.quest.step === 'check') MD.SIM.resolveNext(st, rng);
      for (let z = before; z < st.quest.results.length; z++) if (st.quest.results[z].shape === 'gate') gateResolved++;
      renownSeen.push(st.quest.renown);
      MD.SIM.endStage(st, rng);
      if (st.quest.step === 'assign' && st.quest.stageIndex === 0) repeats++;
    }
    ok('R9.1 a failed sealed Vault sends only the Vault round again', repeats >= 1 || st.quest.step === 'lost', 'repeats ' + repeats + ' step ' + st.quest.step);
    eq('R9.1 the engine counted the repeats', st.quest.sealRepeats, repeats);
    ok('R9.1 the other slot resolved exactly once', gateResolved <= 1, 'gate resolved ' + gateResolved + ' times');
    ok('R9.1 no bench clear between attempts', repeats === 0 || b.strain >= 2 || !b.alive, 'b strain ' + b.strain);
    ok('R9.1 the sealed Vault is always the last slot', stage.slots[stage.slots.length - 1].sealed === true);
  }
  {
    // R5.10 a replacement at Depth I to IV, none at Depth V
    const a = mkChar('a'), b = mkChar('b', { alive: false }), c = mkChar('c', { alive: false });
    const reserve = mkChar('r');
    const st = mkState([a, b, c, reserve]);
    MD.SIM.startQuest(st, R('rep4'), synthQuest(4, [synthStage(1, [slotOf('gate', ['might'], [4])], 1)]), ['a', 'b', 'c']);
    eq('R5.10 a short party may take a replacement at Depth IV', MD.SIM.canReplace(st), true);
    const r = MD.SIM.replace(st, R('rep'), { charId: 'r' });
    ok('R5.10 the reserve joins', r.ok);
    eq('R5.10 and stands in the party', st.quest.party.length, 4);
    const st2 = mkState([mkChar('a'), mkChar('b', { alive: false }), mkChar('c', { alive: false }), mkChar('r')]);
    MD.SIM.startQuest(st2, R('rep5'), synthQuest(5, [synthStage(1, [slotOf('gate', ['might'], [4])], 1)]), ['a', 'b', 'c']);
    eq('R5.10 Depth V offers no replacement', MD.SIM.canReplace(st2), false);
    eq('R5.10 and refuses one asked for', MD.SIM.replace(st2, R('rep2'), { charId: 'r' }).ok, false);
    eq('R9.1 the balance names the Depths that allow it', MD.BALANCE.REPLACEMENT_DEPTHS.join(','), '1,2,3,4');
  }
  {
    // R6.8 a full wipe still pays: everything on the dead converts to Renown
    const a = mkChar('a'), b = mkChar('b'), c = mkChar('c');
    const st = mkState([a, b, c]);
    const rng = R('wipe');
    MD.SIM.startQuest(st, rng, synthQuest(1, [synthStage(1, [slotOf('gate', ['might'], [4])], 1)]), ['a', 'b', 'c']);
    const it = MD.GEN.newRelic(rng, 1, { rarity: 'rare', slot: 'head' });
    a.gear.head = it;
    for (const ch of [a, b, c]) MD.SIM.applyStrain(st, ch, 9, {});
    st.quest.won = false;
    const before = st.account.renown;
    const sum = MD.SIM.endQuest(st, rng);
    eq('R6.8 the wipe salvage line pays', sum.salvage, MD.BALANCE.SALVAGE.rare);
    eq('R6.8 and it lands in Renown', st.account.renown - before, sum.renown);
    eq('R8.4 a wipe is not a completed quest', st.account.questsCompleted, 0);
    eq('R2.4 the interred leave the roster', st.roster.length, 0);
    eq('R8.7 three deaths make three Legacies', st.account.legacies.length, 3);
  }
  {
    // R2.5 a survivor takes a Scar then is dealt three Traits; R8.3 the un deployed rest
    const a = mkChar('a'), b = mkChar('b'), c = mkChar('c'), rest = mkChar('rest', { strain: 3 });
    const st = mkState([a, b, c, rest]);
    const rng = R('survive');
    MD.SIM.startQuest(st, rng, synthQuest(1, [synthStage(1, [slotOf('gate', ['might'], [4])], 1)]), ['a', 'b', 'c']);
    st.quest.won = true;
    const sum = MD.SIM.endQuest(st, rng);
    /* R2.5 CORRECTED (audit): a Scar every SCAR_EVERY quests survived, 2 by default. One per quest against a
     * base Toughness of 4 is a hard wall at four quests and a mean career of 2.83, not the spec's 4 to 7. */
    eq('R2.5 the first quest counts but the Scar is not yet due', a.scars, 0);
    eq('R2.5 and counts the quest', a.questsSurvived, 1);
    eq('R2.5 the Scar lands every SCAR_EVERY quests', MD.BALANCE.SCAR_EVERY, 2);
    eq('R2.5 and is dealt three Traits', sum.traitOffers[0].offers.length, 3);
    eq('R8.4 a boss win counts', st.account.questsCompleted, 1);
    eq('R8.3 a character who sat the quest out rests to zero', rest.strain, 0);
    MD.SIM.takeTrait(st, 'a', sum.traitOffers[0].offers[0]);
    eq('R2.5 the Trait is owned', a.traits.length, 1);
    eq('R2.5 and never twice', MD.SIM.takeTrait(st, 'a', a.traits[0]).ok, false);
  }
  {
    // R8.3 Strain persists between quests for a deployed survivor
    const a = mkChar('a', { strain: 2 });
    const st = mkState([a, mkChar('b'), mkChar('c')]);
    const rng = R('persist');
    MD.SIM.startQuest(st, rng, synthQuest(1, [synthStage(1, [slotOf('gate', ['might'], [4])], 1)]), ['a', 'b', 'c']);
    st.quest.won = true;
    MD.SIM.endQuest(st, rng);
    eq('R8.3 a deployed survivor keeps the hurt', a.strain, 2);
    st.account.renown = 100;
    MD.SIM.hall.mend(st);
    eq('R8.1 Mend clears the whole roster', a.strain, 0);
  }
  {
    eq('R8.1 the Hall prices', [MD.BALANCE.HALL.reforge, MD.BALANCE.HALL.commission, MD.BALANCE.HALL.recruit,
      MD.BALANCE.HALL.redeal, MD.BALANCE.HALL.mend, MD.BALANCE.HALL.excise].join(','), '15,40,25,10,20,60');
    eq('R8.2 the Marrow prices', [MD.BALANCE.MARROW_SHOP.floorD6, MD.BALANCE.MARROW_SHOP.floorD8,
      MD.BALANCE.MARROW_SHOP.rosterSlotFirst, MD.BALANCE.MARROW_SHOP.legacySlot,
      MD.BALANCE.MARROW_SHOP.unlockOrigin, MD.BALANCE.MARROW_SHOP.consecrate].join(','), '3,6,4,2,5,6');
    // R5.9 CORRECTED (audit): the Vault pays 8 and rolls two relics, the first at +1 tier. It carried the
    // game's only TN 7 while paying the second lowest expected value on the board.
    eq('R5.9 the shape rewards', MD.SHAPES.map((s) => MD.BALANCE.RENOWN[s]).join(','), '3,6,6,8,4,2');
    eq('R5.9 the Vault rolls two relics', MD.BALANCE.RELIC_ROLLS.vault, 2);
    eq('R5.9 the first at one tier up', MD.BALANCE.RELIC_TIER_UP.vault, 1);
    eq('R5.9 the Depth Renown multipliers', MD.BALANCE.DEPTH_RENOWN_MULT.join(','), '1,1.5,2.25,3.4,5.1');
    eq('R8.5 the Depth Marrow rounds to 1,1,2,2,3',
      MD.BALANCE.DEPTH_MARROW_MULT.map((m) => Math.round(m)).join(','), '1,1,2,2,3');
    eq('R0 base Toughness', MD.BALANCE.BASE_TOUGHNESS, 4);
  }
  {
    // BALANCE is frozen and is the only place a tunable lives
    let threw = false;
    try { 'use strict'; MD.BALANCE.BASE_TOUGHNESS = 9; } catch (e) { threw = true; }
    ok('R0 BALANCE is frozen', threw || MD.BALANCE.BASE_TOUGHNESS === 4, 'now ' + MD.BALANCE.BASE_TOUGHNESS);
    let threw2 = false;
    try { MD.makeBalance({ NOT_A_KEY: 1 }); } catch (e) { threw2 = true; }
    ok('R0 an unknown BALANCE key is refused', threw2);
    const b2 = MD.makeBalance({ BASE_TOUGHNESS: 6 });
    eq('R0 an override reads back', b2.BASE_TOUGHNESS, 6);
    eq('R0 and leaves the default alone', MD.BALANCE.BASE_TOUGHNESS, 4);
  }
  {
    // R5.7 the RESULT card comes before the consequences, and R1.8 the REROLL sits on it
    const a = mkChar('a', { stats: { might: 4, grace: 4, wits: 4, nerve: 4 } });
    const g = mkChar('g', { calling: 'gambler' }), c = mkChar('c');
    const st = mkState([a, g, c]);
    const q = synthQuest(1, [synthStage(1, [slotOf('gate', ['might'], [7])], 1)]);
    const rng = R('held');
    MD.SIM.startQuest(st, rng, q, ['a', 'g', 'c']);
    MD.SIM.assign(st, { slots: [{ chars: ['a'] }], bench: 'g' });
    const res = MD.SIM.resolveNext(st, rng, { hold: true });
    eq('R5.7 a held RESULT applies no Strain yet', a.strain, 0);
    ok('R5.7 the card is held', st.quest.held !== null);
    eq('R1.8 the Gambler is offered as a reroll source', MD.SIM.rerollAvailable(st).join(','), 'g');
    const first = res.roll.total;
    const again = MD.SIM.rerollHeld(st, rng, 'g');
    ok('R1.8 the whole chain is redrawn', again.firstRoll.total === first);
    eq('R1.8 the second result stands', again.roll.total, again.roll.base + again.roll.mods + again.roll.push);
    eq('R1.8 the reroll is spent once per stage per source', MD.SIM.rerollHeld(st, rng, 'g'), null);
    eq('R1.8 a character without the effect cannot reroll', MD.SIM.rerollHeld(st, rng, 'c'), null);
    MD.SIM.commitHeld(st, rng);
    eq('R5.7 CONTINUE lands the consequence', a.strain, again.pass ? 0 : 1);
    ok('R5.7 the held card is cleared', st.quest.held === null);
  }
  {
    // R4.10 Cutpurse rolls the first GRACE check of each stage twice, with no toggle
    // a Chain is the one shape that gives one character two checks in a stage (R5.5).
    // Steady floors GRACE at 3 so the first check cannot fail and the second is reached (R3.3).
    const cp = mkChar('cp', { calling: 'cutpurse', traits: ['steady'] });
    const st = mkState([cp, mkChar('b'), mkChar('c')]);
    const q = synthQuest(1, [slotOf('chain', ['grace', 'grace'], [3, 3])].map((sl) => synthStage(1, [sl], 1)));
    const rng = R('cutpurse');
    MD.SIM.startQuest(st, rng, q, ['cp', 'b', 'c']);
    MD.SIM.assign(st, { slots: [{ chars: ['cp'] }], bench: 'b' });
    const r1 = MD.SIM.resolveNext(st, rng), r2 = MD.SIM.resolveNext(st, rng);
    ok('R4.10 the first GRACE check rolled twice', !!r1.roll.twiceAlt);
    ok('R4.10 and only the first', !r2.roll.twiceAlt);
    eq('R4.10 the higher of the two chains is kept', r1.roll.base >= r1.roll.twiceAlt.base, true);
  }
  {
    // R4.11 Scholar: after a failure, the next check by a DIFFERENT character gains +2
    const s1 = mkChar('s1', { calling: 'scholar' });
    const st = mkState([s1, mkChar('b'), mkChar('c')]);
    const q = synthQuest(1, [synthStage(1, [slotOf('gate', ['might'], [4])], 1)]);
    MD.SIM.startQuest(st, R('scholar'), q, ['s1', 'b', 'c']);
    st.quest.charge = 'b';
    eq('R4.11 Scholar pays after another character failed',
      MD.SIM.checkContext(st, s1, { stat: 'might', tn: 4, shape: 'gate' }).flat, 2);
    st.quest.charge = 's1';
    eq('R4.11 Scholar does not pay for its own failure',
      MD.SIM.checkContext(st, s1, { stat: 'might', tn: 4, shape: 'gate' }).flat, 0);
  }
  {
    // R4.15 Herald reads the previous check in this stage
    const h = mkChar('h', { calling: 'herald' });
    const st = mkState([h, mkChar('b'), mkChar('c')]);
    MD.SIM.startQuest(st, R('herald'), synthQuest(1, [synthStage(1, [slotOf('gate', ['wits'], [4])], 1)]), ['h', 'b', 'c']);
    st.quest.prev = { charId: 'b', stat: 'wits', pass: true };
    eq('R4.15 Herald pays on the same stat as the previous ally',
      MD.SIM.checkContext(st, h, { stat: 'wits', tn: 4, shape: 'gate' }).flat, 1);
    st.quest.prev = { charId: 'b', stat: 'might', pass: true };
    eq('R4.15 and not on a different stat',
      MD.SIM.checkContext(st, h, { stat: 'wits', tn: 4, shape: 'gate' }).flat, 0);
    st.quest.prev = { charId: 'h', stat: 'wits', pass: true };
    eq('R4.15 and never off its own previous check',
      MD.SIM.checkContext(st, h, { stat: 'wits', tn: 4, shape: 'gate' }).flat, 0);
  }
  {
    // R4.17 Quickstudy pays on a stat this character has not rolled yet this quest
    const qs = mkChar('qs', { traits: ['quickstudy'] });
    const st = mkState([qs, mkChar('b'), mkChar('c')]);
    MD.SIM.startQuest(st, R('quick'), synthQuest(1, [synthStage(1, [slotOf('gate', ['wits'], [4])], 1)]), ['qs', 'b', 'c']);
    eq('R4.17 Quickstudy pays on an unused stat',
      MD.SIM.checkContext(st, qs, { stat: 'wits', tn: 4, shape: 'gate' }).flat, 1);
    st.quest.statsUsed = { qs: { wits: 1 } };
    eq('R4.17 and goes quiet once the stat is used',
      MD.SIM.checkContext(st, qs, { stat: 'wits', tn: 4, shape: 'gate' }).flat, 0);
  }
  {
    // R4.17 Ninth Hour is the boss stage only, and R4.17 Bloodhound the last check of a stage
    const n = mkChar('n', { traits: ['ninthHour', 'bloodhound'] });
    const st = mkState([n, mkChar('b'), mkChar('c')]);
    MD.SIM.startQuest(st, R('ninth'), synthQuest(1, [synthStage(1, [slotOf('gate', ['might'], [4])], 1)]), ['n', 'b', 'c']);
    eq('R4.17 Ninth Hour is quiet in a stage', MD.SIM.checkContext(st, n, { stat: 'might', tn: 4, shape: 'gate' }).flat, 0);
    eq('R4.17 Bloodhound pays on the last check', MD.SIM.checkContext(st, n, { stat: 'might', tn: 4, shape: 'gate', lastOfStage: true }).flat, 2);
    eq('R4.17 Ninth Hour pays at the boss', MD.SIM.checkContext(st, n, { stat: 'might', tn: 4, shape: 'boss', boss: true }).flat, 3);
    eq('R4.17 and both together on the last action of a boss round',
      MD.SIM.checkContext(st, n, { stat: 'might', tn: 4, shape: 'boss', boss: true, lastOfStage: true }).flat, 5);
  }
  {
    // R4.16 Reaver adds two on a MIGHT surge against an Aspect, and nothing on another stat
    const rv = mkChar('rv', { calling: 'reaver' });
    const list = MD.collect(rv);
    eq('R4.16 Reaver pays on a MIGHT surge', MD.query(list, 'surgeAspect', { stat: 'might', surged: true }), 2);
    eq('R4.16 and not without a surge', MD.query(list, 'surgeAspect', { stat: 'might', surged: false }), 0);
    eq('R4.16 and not on another stat', MD.query(list, 'surgeAspect', { stat: 'grace', surged: true }), 0);
  }
  {
    // spec 11.2: the affix table, pinned row by row (key, points, valid slots)
    const SPEC = {
      flat: [2, 'hands,token,weapon'], floor3: [1, 'head'], floorHalf: [2, 'head'], floorPlus: [3, 'head'],
      stepStat: [2, 'hands'], surgeMinus: [2, 'hands,weapon'], armor: [2, 'chest'], toughness: [1, 'chest'],
      strikeLess: [3, 'chest'], reroll1s: [1, 'charm'], rerollStage: [3, 'charm'], twiceStage: [3, 'charm'],
      benchPlus: [2, 'feet'], relayPlus: [2, 'feet'], benchOnce: [3, 'feet'], benchAlly: [2, 'feet'],
      aspectDmg: [2, 'weapon'],
      surgeAspect: [2, 'weapon'], sigilImmune: [3, 'sigilWard'], sigilPartial: [2, 'sigilWard'],
      condTn6: [2, 'token'], condStrain2: [1, 'token'], condFirst: [2, 'token'], condLast: [2, 'token'],
      condDeadAlly: [1, 'token']
    };
    eq('R10.6 the affix table has all twenty five keys', Object.keys(MD.AFFIXES).length, 25);
    let ptsOk = true, slotOk = true, kindOk = true, why = '';
    for (const k of Object.keys(SPEC)) {
      const a = MD.AFFIXES[k];
      if (!a) { ptsOk = false; why = 'missing ' + k; continue; }
      if (a.pts !== SPEC[k][0]) { ptsOk = false; why = k + ' pts ' + a.pts; }
      if (a.slots.slice().sort().join(',') !== SPEC[k][1]) { slotOk = false; why = k + ' slots ' + a.slots.join(','); }
      if (!a.eff.every((e) => !!MD.EFFECTS.KINDS[e.k])) { kindOk = false; why = k + ' kind'; }
      if (!a.eff.every((e) => e.k !== 'cond' || MD.EFFECTS.WHENS.indexOf(e.when) >= 0)) { kindOk = false; why = k + ' when'; }
    }
    ok('spec 11.2 every affix carries its point cost', ptsOk, why);
    ok('spec 11.2 every affix names its valid slots', slotOk, why);
    ok('R12 every affix compiles to a known effect kind', kindOk, why);
    eq('R11.1 there are eight gear slots', MD.SLOTS.length, 8);
    ok('spec 11.1 every slot owns at least one affix',
      MD.SLOTS.every((sl) => Object.keys(MD.AFFIXES).some((k) => MD.AFFIXES[k].slots.indexOf(sl) >= 0)));
    ok('spec 11.3 the budget table is five Depths by four rarities',
      MD.BALANCE.BUDGETS.length === 5 && MD.BALANCE.BUDGETS.every((r) => r.length === 4));
    ok('spec 11.4 every drop weight row sums to one hundred',
      MD.BALANCE.DROP_WEIGHTS.every((r) => r.reduce((x, y) => x + y, 0) === 100));
    ok('spec 7.4 every stat frequency row sums to one hundred',
      ['early', 'mid', 'late'].every((r) => MD.BALANCE.STAT_FREQ[r].reduce((x, y) => x + y, 0) === 100));
  }
  {
    // R10.5 the name generator never repeats a full name inside one account
    const st = MD.SIM.newGame(5);
    const seen = {};
    let dup = false;
    for (let i = 0; i < 60; i++) {
      const n = MD.GEN.nameCharacter(R('nm' + i), st.account);
      if (seen[n]) dup = true;
      seen[n] = 1;
    }
    ok('R10.5 no full name repeats inside one account', !dup);
    eq('R10.5 the account remembers what it used', Object.keys(st.account.usedNames).length, 60);
  }
  {
    // R1.9 the composed cap, CORRECTED (audit): floor + total PERMANENT flat on one stat may never exceed 6
    eq('R1.9 the composed cap is six', MD.BALANCE.COMPOSED_CAP, 6);
    const head = gearItem('head', [aff('floorHalf', [{ k: 'floor', stat: 'might', v: 'half' }], 2, 'might')]);
    const tok = gearItem('token', [aff('flat', [{ k: 'flat', stat: 'might', v: 1, perm: true }], 2, 'might')]);
    const hnd = gearItem('hands', [aff('flat', [{ k: 'flat', stat: 'might', v: 1, perm: true }], 2, 'might')]);
    const wpn = gearItem('weapon', [aff('flat', [{ k: 'flat', stat: 'might', v: 1, perm: true }], 2, 'might')]);
    const ch = mkChar('cc', { stats: { might: 8, grace: 8, wits: 8, nerve: 8 }, gear: { head, token: tok, hands: hnd, weapon: wpn } });
    const st = mkState([ch, mkChar('b'), mkChar('c')]);
    MD.SIM.startQuest(st, R('cap'), synthQuest(1, [synthStage(1, [slotOf('gate', ['might'], [5])], 1)]), ['cc', 'b', 'c']);
    const cx = MD.SIM.checkContext(st, ch, { stat: 'might', tn: 5, shape: 'gate' });
    eq('R1.9 a d8 at its half die floor reads floor 4', cx.floor, 4);
    eq('R1.9 and the three flat points are cut to two', cx.flat, 2);
    eq('R1.9 so floor plus flat lands exactly on the cap', cx.floor + cx.flat, 6);
    ok('R1.9 the greyed point is reported for the Character screen', cx.greyedFlat === 1, 'greyed ' + cx.greyedFlat);
    ok('R1.9 the worst roll still leaves a live check at TN 7', cx.floor + cx.flat < 7);
    const zl = mkChar('zz', { stats: { might: 8, grace: 8, wits: 8, nerve: 8 }, calling: 'zealot', strain: 2, gear: ch.gear });
    const st2 = mkState([zl, mkChar('b'), mkChar('c')]);
    MD.SIM.startQuest(st2, R('cap2'), synthQuest(1, [synthStage(1, [slotOf('gate', ['might'], [5])], 1)]), ['zz', 'b', 'c']);
    const cx2 = MD.SIM.checkContext(st2, zl, { stat: 'might', tn: 5, shape: 'gate' });
    eq('R1.7 conditional sources sit outside the composed cap', cx2.flat, 4);
  }
  {
    // R2.1 a new account gets three characters free
    const st = MD.SIM.newGame(1);
    eq('R2.1 a new account starts with three free rolls', st.account.freeRolls, MD.BALANCE.FREE_ROLLS);
    MD.SIM.seedRoster(st, R('free'), 3);
    eq('R2.1 KEEP spends one each', st.account.freeRolls, 0);
    eq('R2.1 and it cost no Renown', st.account.renown, 0);
  }
  {
    // R3.3 CORRECTED: a Relay's second check is gated on the first, exactly like a Chain's
    let sawBroken = false;
    for (let i = 0; i < 300 && !sawBroken; i++) {
      const a = mkChar('a', { stats: { might: 4, grace: 4, wits: 4, nerve: 4 } });
      const b = mkChar('b'), c = mkChar('c');
      const st = mkState([a, b, c]);
      const q = synthQuest(1, [synthStage(1, [slotOf('relay', ['might', 'wits'], [4, 4])], 1)]);
      MD.SIM.startQuest(st, R('relayg' + i), q, ['a', 'b', 'c']);
      MD.SIM.assign(st, { slots: [{ chars: ['a', 'b'] }], bench: 'c' });
      const rng = R('relayr' + i);
      MD.SIM.resolveNext(st, rng); MD.SIM.resolveNext(st, rng);
      const res = st.quest.results;
      if (res[0].pass !== false) continue;
      sawBroken = true;
      eq('R3.3 a broken Relay does not roll its second check', res[1].skipped, 'relayBroken');
      ok('R3.3 and no die was drawn for it', res[1].roll === undefined);
      eq('R3.3 and the second character paid nothing', b.strain, 0);
    }
    ok('R3.3 a broken Relay case was seen', sawBroken);
  }
  {
    // R4.11 CORRECTED: a boolean charge, cleared when the Scholar reads it
    const sc = mkChar('sc', { calling: 'scholar' });
    const st = mkState([sc, mkChar('b'), mkChar('c')]);
    const q = synthQuest(1, [synthStage(1, [slotOf('gate', ['might'], [3]), slotOf('gate', ['might'], [3])], 1)]);
    const rng = R('charge');
    MD.SIM.startQuest(st, rng, q, ['sc', 'b', 'c']);
    st.quest.charge = 'b';
    MD.SIM.assign(st, { slots: [{ chars: ['sc'] }, { chars: ['c'] }], bench: 'b' });
    MD.SIM.resolveNext(st, rng);
    eq('R4.11 the charge is cleared once the Scholar has read it', st.quest.charge, null);
  }
  {
    // R5.6 CORRECTED: doubling is gated on the stage's CHECKS, not on bodies
    const a = mkChar('a'), b = mkChar('b'), c = mkChar('c');
    const st = mkState([a, b, c]);
    const q = synthQuest(1, [synthStage(1, [slotOf('chain', ['might', 'might'], [3, 4]), slotOf('chain', ['wits', 'wits'], [3, 4])], 1)]);
    MD.SIM.startQuest(st, R('chch'), q, ['a', 'b', 'c']);
    const plan = MD.SIM.policy.assign(st);
    ok('R5.6 Chain plus Chain is four checks but only two holders, so one benches', plan.bench !== null, 'bench ' + plan.bench);
    let threw = false;
    try { MD.SIM.assign(st, { slots: [{ chars: ['a'] }, { chars: ['a'] }], bench: 'b' }); } catch (e) { threw = true; }
    ok('R5.6 and doubling is still permitted there, four checks against three bodies', !threw);
  }
  {
    // R5.8 CORRECTED: Ambush is dropped rather than carried into a boss stage
    const a = mkChar('a'), b = mkChar('b'), c = mkChar('c');
    const st = mkState([a, b, c]);
    const q = synthQuest(1, [synthStage(1, [slotOf('gate', ['grace'], [4])], 1),
      bossStage(2, [{ name: 'A', stat: 'might', tn: 4, hp: 3, maxHp: 3, broken: false }])]);
    const rng = R('ambboss');
    MD.SIM.startQuest(st, rng, q, ['a', 'b', 'c']);
    MD.SIM.assign(st, { slots: [{ chars: ['a'] }], bench: 'b' });
    MD.SIM.resolveNext(st, rng);
    st.quest.pendingAmbush = true;
    MD.SIM.endStage(st, rng);
    eq('R5.8 an Ambush is dropped at the mouth of a boss stage', st.quest.pendingAmbush, false);
  }
  {
    // R6.1 (a) CORRECTED: the Depth IV drop row, and Ashwalker's free relic there
    eq('R6.1 the Depth IV row drops no Common', MD.BALANCE.DROP_WEIGHTS[3].join(','), '0,55,34,11');
    ok('R6.1 every Depth with a Common weight has a Common budget',
      MD.BALANCE.DROP_WEIGHTS.every((r, i) => r[0] === 0 || MD.BALANCE.BUDGETS[i][0] > 0));
    const ash = mkChar('ash', { origin: 'ashwalker' });
    const st = mkState([ash, mkChar('b'), mkChar('c')]);
    MD.SIM.startQuest(st, R('ash4'), synthQuest(4, [synthStage(1, [slotOf('gate', ['might'], [4])], 1)]), ['ash', 'b', 'c']);
    eq('R4.2 Ashwalker still gets a relic', st.quest.drops.length, 1);
    eq('R6.1 and it is Uncommon at Depth IV, where a Common has no budget', st.quest.drops[0].rarity, 'uncommon');
  }
  {
    // R6.2 (c): a budget that cannot be spent steps the item down a rarity, and the label follows
    let labelHonest = true, why = '';
    const rng = R('stepdown');
    for (let i = 0; i < 600; i++) {
      const d = 1 + (i % 5);
      const it = MD.GEN.newRelic(rng, d, { slot: MD.SLOTS[i % 8] });
      const want = MD.BALANCE.BUDGETS[d - 1][MD.RARITIES.indexOf(it.rarity)];
      if (it.budget !== want) { labelHonest = false; why = it.rarity + ' at Depth ' + d + ' carries ' + it.budget + ' not ' + want; }
    }
    ok('R6.2 a card never lies about the budget its rarity carries', labelHonest, why);
    const ward = MD.GEN.newRelic(R('ward'), 5, { slot: 'sigilWard', rarity: 'relic' });
    const sigs = ward.affixes.filter((a) => a.sigil).map((a) => a.sigil);
    eq('R9.3 a Ward never names one Sigil twice', new Set(sigs).size, sigs.length);
    ok('R6.2 and it fills its budget', ward.affixes.reduce((x, y) => x + y.pts, 0) === ward.budget, ward.budget + ' ' + ward.name);
  }
  {
    // R8.0 THE STRAY: without it a first quest wipe ends the account
    const st = mkState([]);
    st.account.renown = 12;
    eq('R8.0 a roster with nobody deployable takes in a Stray for nothing', MD.SIM.hall.recruitCost(st), 0);
    ok('R8.0 and the Hall says so', MD.SIM.hall.isStray(st));
    const r = MD.SIM.hall.recruit(st, R('stray'), {});
    ok('R8.0 the Stray joins', r.ok && r.stray);
    eq('R8.0 and it cost nothing', st.account.renown, 12);
    eq('R8.0 the next one is priced again', MD.SIM.hall.recruitCost(st), MD.BALANCE.HALL.recruit);
    eq('R8.0 which the account cannot pay', MD.SIM.hall.recruit(st, R('stray2'), {}).ok, false);
    eq('R8.5 a Stray is unproven, so it cannot be farmed for Marrow', st.roster[0].questsSurvived, 0);
  }
  {
    // R8.0b THE PRICE INDEX
    eq('R8.0b the index defaults to the Renown multiplier', MD.BALANCE.PRICE_INDEX.join(','), '1,1.5,2.25,3.4,5.1');
    const st = mkState([mkChar('a')]);
    st.account.renown = 1000;
    st.account.deepestCompleted = 1;
    let before = st.account.renown;
    MD.SIM.hall.commission(st, R('p1'), 'head');
    eq('R8.0b a Commission at Depth I costs forty', before - st.account.renown, 40);
    st.account.deepestCompleted = 5;
    before = st.account.renown;
    MD.SIM.hall.commission(st, R('p5'), 'head');
    eq('R8.0b and two hundred and five at Depth V', before - st.account.renown, 205);
  }
  {
    // R8.3 REST_FRACTION, R8.4 the Depth gate on a completed quest
    eq('R8.3 the default rest is a full one', MD.BALANCE.REST_FRACTION, 1);
    const st = MD.SIM.newGame(2);
    MD.SIM.seedRoster(st, R('gate'), 3);
    st.account.questsCompleted = 3;                       // Depth II is unlocked, so Depth I no longer buys depth
    const ids = st.roster.map((c) => c.id);
    const rng = R('depthgate');
    MD.SIM.startQuest(st, rng, synthQuest(1, [synthStage(1, [slotOf('gate', ['might'], [4])], 1)]), ids);
    st.quest.won = true;
    MD.SIM.endQuest(st, rng);
    eq('R8.4 a shallower win does not buy depth', st.account.questsCompleted, 3);
    ok('R8.4 but it still pays', st.account.renownLifetime >= 0);
    const st2 = MD.SIM.newGame(3);
    MD.SIM.seedRoster(st2, R('gate2'), 3);
    st2.account.questsCompleted = 3;
    const rng2 = R('depthgate2');
    MD.SIM.startQuest(st2, rng2, synthQuest(2, [synthStage(1, [slotOf('gate', ['might'], [4])], 1)]), st2.roster.map((c) => c.id));
    st2.quest.won = true;
    MD.SIM.endQuest(st2, rng2);
    eq('R8.4 a win at the deepest unlocked Depth does', st2.account.questsCompleted, 4);
    eq('R8.0b and it records the deepest Depth completed', st2.account.deepestCompleted, 2);
  }
  {
    // R8.7 CORRECTED: at least one of the three cards is always a stock Calling
    const st = mkState([]);
    st.account.legacySlots = 9;                           // even asked for more than the cap
    st.account.legacies = Object.keys(MD.CALLINGS).map((k, i) => ({ id: 'L' + i, calling: k, charName: 'x', consecrated: false }));
    let alwaysStock = true;
    for (let i = 0; i < 100; i++) {
      const dealt = MD.GEN.dealCallings(R('stock' + i), st.account);
      if (dealt.filter((d) => !d.legacy).length < 1) alwaysStock = false;
    }
    ok('R8.7 one of the three cards is always a stock Calling', alwaysStock);
    eq('R8.7 so the Legacy slot caps at two', MD.BALANCE.MARROW_SHOP.legacyMax, 2);
  }
  {
    // R10.1 the recently used ring
    const q1 = MD.GEN.newQuest('ring1', 1);
    ok('R10.1 a quest reports the lines it used', q1.usedLines.length > 0);
    const q2 = MD.GEN.newQuest('ring1', 1, { ring: q1.usedLines });
    const overlap = q2.usedLines.filter((l) => q1.usedLines.indexOf(l) >= 0);
    ok('R10.1 the ring keeps the next quest off the same lines where the bank allows',
      overlap.length < q1.usedLines.length, overlap.length + ' of ' + q1.usedLines.length + ' repeated');
    /* The engine ships placeholder banks of one line each, so this assertion loads the AUTHORED banks from
     * plans/marrowdeep/data (R10.1: Gate 20 per stat, Chain 8 per stat, Relay 16, Vault 16, Toll 12, Open 12)
     * and proves the draw against them. That also exercises setData, which is how the builder pastes them in. */
    const real = loadAuthoredData();
    if (real) {
      MD.setData(real);
      let dupInQuest = false, wordUndefined = 0;
      for (let i = 0; i < 60; i++) {
        const q = MD.GEN.newQuest('dup' + i, 2);
        if (new Set(q.usedLines).size !== q.usedLines.length) dupInQuest = true;
      }
      ok('R10.1 no line repeats inside one quest, against the authored banks', !dupInQuest);
      // R10.6: a thousand names and not one "undefined", in both directions
      const rng = R('realnames');
      for (let i = 0; i < 1000; i++) {
        const it = MD.GEN.newRelic(rng, 1 + (i % 5), {});
        if (String(it.name).indexOf('undefined') >= 0) wordUndefined++;
      }
      eq('R10.6 a thousand names and not one undefined', wordUndefined, 0);
      const mine = Object.keys(MD.AFFIXES).sort(), theirs = Object.keys(real.relicWords.affix).sort();
      eq('R10.6 every affix key the generator can draw has a word list',
        mine.filter((k) => theirs.indexOf(k) < 0).join(','), '');
      eq('R10.6 and every word list key is one the generator can draw',
        theirs.filter((k) => mine.indexOf(k) < 0).join(','), '');
      eq('R10.6 which is twenty five keys', theirs.length, 25);
      ok('R10.5 the authored name banks are sixty and sixty',
        real.names.first.length === 60 && real.names.second.length === 60,
        real.names.first.length + ' / ' + real.names.second.length);
      ok('R10.2 six bosses, each with a fourth Aspect on the missing stat',
        real.bosses.length === 6 && real.bosses.every((b) => b.aspects.length === 4 &&
          new Set(b.aspects.map((x) => x.stat)).size === 4));
      MD.setData(PLACEHOLDER);
    } else {
      ok('R10.1 the authored banks were not readable from here', true, 'skipped');
    }
  }
  {
    // R13.2 a Push is re-validated at the roll and dropped if it would now kill
    const a = mkChar('a', { strain: 3 });
    const st = mkState([a, mkChar('b'), mkChar('c')]);
    const q = synthQuest(1, [synthStage(1, [slotOf('gate', ['might'], [4])], 1)]);
    const rng = R('pushref');
    MD.SIM.startQuest(st, rng, q, ['a', 'b', 'c']);
    MD.SIM.assign(st, { slots: [{ chars: ['a'], push: [true] }], bench: 'b' });
    const res = MD.SIM.resolveNext(st, rng);
    eq('R13.2 a lethal Push is refused', res.pushRefused, true);
    eq('R13.2 and the character is still alive to roll', a.alive, true);
    eq('R13.2 and the roll carries no Push', res.roll.push, 0);
    eq('R1.6 canPush says so up front', MD.SIM.canPush(st, a), false);
    const sb = mkChar('sb', { strain: 3, origin: 'saltblood' });
    const st2 = mkState([sb, mkChar('b'), mkChar('c')]);
    MD.SIM.startQuest(st2, R('salt'), q, ['sb', 'b', 'c']);
    eq('R13.2 a refused Push does not spend Saltblood free one', MD.SIM.pushCost(st2, sb), 0);
  }
  {
    // R13.3 rerollStage resets per FIGHT at the boss, not per round
    const g = mkChar('g', { calling: 'gambler' });
    const st = mkState([g, mkChar('b')]);
    const stage = bossStage(1, [{ name: 'A', stat: 'might', tn: 20, hp: 9, maxHp: 9, broken: false }]);
    MD.SIM.startQuest(st, R('fightreroll'), synthQuest(1, [stage]), ['g', 'b']);
    st.quest.step = 'bossAssign';
    MD.SIM.bossAssign(st, { targets: { g: 0, b: 0 } });
    st.quest.rerollUsed[g.id] = 1;
    MD.SIM.bossRound(st, R('fr'));
    eq('R13.3 the reroll is still spent in the next round of the same fight', st.quest.rerollUsed[g.id], 1);
    eq('R13.3 while the round resets the per stage Push counter', Object.keys(st.quest.pushes).length, 0);
  }
  {
    // R13.6 a boss retarget tie breaks to the bigger die, then card order
    const ch = mkChar('a', { stats: { might: 4, grace: 12, wits: 4, nerve: 4 } });
    const st = mkState([ch, mkChar('b'), mkChar('c')]);
    const stage = bossStage(1, [
      { name: 'Gone', stat: 'nerve', tn: 4, hp: 0, maxHp: 3, broken: true },
      { name: 'Small die', stat: 'might', tn: 4, hp: 3, maxHp: 3, broken: false },
      { name: 'Big die', stat: 'grace', tn: 4, hp: 3, maxHp: 3, broken: false }]);
    MD.SIM.startQuest(st, R('tie'), synthQuest(1, [stage]), ['a', 'b', 'c']);
    st.quest.step = 'bossAssign';
    MD.SIM.bossAssign(st, { targets: { a: 0, b: 1, c: 2 } });
    const r = MD.SIM.resolveBossCheck(st, R('tier'));
    eq('R13.6 equal hit points break to the bigger die', r.aspectName, 'Big die');
  }
  {
    // a whole quest, driven by the policy, at every Depth
    for (let d = 1; d <= 5; d++) {
      const st = MD.SIM.newGame(d);
      const rng = R('full' + d);
      MD.SIM.seedRoster(st, rng, 3);
      const q = MD.GEN.newQuest('full' + d, d);
      const sum = MD.SIM.policy.playQuest(st, rng, q, st.roster.map((c) => c.id));
      ok('R5 to R9 a Depth ' + d + ' quest runs to an end', sum.won === true || sum.won === false, JSON.stringify(sum.won));
      ok('R5.9 a Depth ' + d + ' quest pays something or the party died on stage one', sum.renown >= 0);
      ok('R11 the quest state is cleared at the end', st.quest === null);
    }
  }
  {
    // the policy is deterministic on one seed
    function run() {
      const st = MD.SIM.newGame(11);
      const rng = R('determinism');
      MD.SIM.seedRoster(st, rng, 3);
      return MD.SIM.policy.playQuest(st, rng, MD.GEN.newQuest('det', 2), st.roster.map((c) => c.id));
    }
    const one = run(), two = run();
    eq('R5.2 the same seed plays the same quest', JSON.stringify(one.won) + one.renown + one.deaths.length,
      JSON.stringify(two.won) + two.renown + two.deaths.length);
  }
}

/* ============================ --grid ============================
 * The balance harness (spec 15, "Balance Harness (build alongside step 4)"), two experiments per cell.
 *
 *   A FRESH    SAMPLE Depth I quests, each with three freshly rolled tier 1 characters and no gear.
 *              Nothing carries between quests, so this is the shape of the FIRST quest of an account,
 *              measured SAMPLE times. Marrow reads 0 by law here (R8.5: an unproven death pays none).
 *   B ACCOUNT  ACCOUNTS accounts of QUESTS_PER Depth I quests with the whole progression running:
 *              the Hall between quests (R8.1 Recruit, Mend, R2.6 Retire), gear kept and equipped (R6.7),
 *              Traits and Scars (R2.5), Legacies and Marrow (R8.5).
 *
 * Every cell and every quest inside it gets its own named seed, so the whole grid is reproducible and
 * Math.random is never touched (the engine's RNG is the only source of chance in the game).
 *
 *   node sim.mjs --grid [--sample=N] [--accounts=N] [--questsPer=N] [--jobs=N] [--depth=D] [--over=KEY=VAL]
 */
var GRID_TOUGH = [3, 4, 5];
var GRID_TARGET = ['attackers', 'all', 'spread'];
var GRID_STRIKE = [1, 2];
var GRID_RESPITE = [0, 1];

function flagVal(name, dflt) {
  for (var i = 0; i < ARG.length; i++) if (ARG[i].indexOf('--' + name + '=') === 0) return ARG[i].slice(name.length + 3);
  return dflt;
}
function flagNum(name, dflt) { var v = flagVal(name, null); return v == null ? dflt : Number(v); }
function clone(o) { return JSON.parse(JSON.stringify(o)); }

/* --over=KEY=VAL, repeatable. KEY is a BALANCE key or a path into one (RENOWN.vault, STRIKE.0, TN.vault).
 * VAL is parsed as JSON when it can be (2, 0.5, [1,1,2,3,3], "all") and taken as a string when it cannot. */
function setOverride(out, key, val) {
  var path = key.replace(/\[(\d+)\]/g, '.$1').split('.');
  var top = path[0];
  if (!(top in MD.BALANCE)) { console.log('--over: BALANCE has no key ' + top); process.exit(2); }
  if (path.length === 1) { out[top] = val; return; }
  if (!(top in out)) out[top] = clone(MD.BALANCE[top]);
  var node = out[top];
  for (var i = 1; i < path.length - 1; i++) {
    if (node[path[i]] == null) { console.log('--over: BALANCE has no path ' + key); process.exit(2); }
    node = node[path[i]];
  }
  var leaf = path[path.length - 1];
  if (!(leaf in node)) { console.log('--over: BALANCE has no path ' + key); process.exit(2); }
  node[leaf] = val;
}
function parseOverrides() {
  var out = {};
  for (var i = 0; i < ARG.length; i++) {
    if (ARG[i].indexOf('--over=') !== 0) continue;
    var body = ARG[i].slice(7), eq = body.indexOf('=');
    if (eq < 0) { console.log('--over wants KEY=VAL'); process.exit(2); }
    var val; try { val = JSON.parse(body.slice(eq + 1)); } catch (e) { val = body.slice(eq + 1); }
    setOverride(out, body.slice(0, eq), val);
  }
  return out;
}

function cellKey(c) { return c.tough + '|' + c.target + '|' + c.strike + '|' + c.respite; }
function cellBalance(cell, over) {
  var strike = clone(MD.BALANCE.STRIKE), respite = clone(MD.BALANCE.RESPITE);
  strike[cell.depth - 1] = cell.strike;                       // the grid moves the played Depth's row only
  respite[cell.depth - 1] = cell.respite;
  var o = { BASE_TOUGHNESS: cell.tough, STRIKE_TARGET: cell.target, STRIKE: strike, RESPITE: respite };
  for (var k in over) if (over.hasOwnProperty(k)) o[k] = over[k];   // an explicit --over wins over the grid axis
  return MD.makeBalance(o);
}

/* Why a stalled fight stalled. A deadlock is a fight that can NEVER end: no living character can pass any
 * unbroken Aspect (probability 0, not merely unlikely), and at least one of them cannot be killed by a Strike
 * because its strike reduction is at least the whole Strike. Anything else is only slow. */
function deadlocked(state) {
  var q = state.quest, stage = q.def.stages[q.stageIndex];
  if (!stage || !stage.aspects) return false;
  var living = MD.SIM.livingParty(state), strike = MD.balance().STRIKE[q.depth - 1];
  var canPass = false, immortal = false, i, j;
  for (i = 0; i < living.length; i++) {
    var ch = MD.SIM.byId(state, living[i]);
    for (j = 0; j < stage.aspects.length; j++) {
      var asp = stage.aspects[j];
      if (asp.broken) continue;
      var o = MD.SIM.checkContext(state, ch, { stat: asp.stat, tn: asp.tn, shape: 'boss', boss: true });
      if (MD.passProb(o.die, asp.tn, { surgeMinus: o.surgeMinus, floor: o.floor, flat: o.flat, noSurge: o.noSurge }) > 0) canPass = true;
    }
    if (MD.query(MD.collect(ch), 'strikeLess', {}) >= strike) immortal = true;
  }
  return !canPass && immortal;
}

/* One quest through the engine's own policy loop (SIM.policy.playQuest), stopped one call short of
 * endQuest so the harness can read q.results and q.round before the quest state is cleared. */
function playQuestMetered(state, rng, questDef, partyIds, maxRounds) {
  var S = MD.SIM, P = S.policy, guard = 0, stalled = false;
  S.startQuest(state, rng, questDef, partyIds);
  while (state.quest && !state.quest.over && guard++ < 20000) {
    var q = state.quest;
    /* R7.4 has no round cap and neither does the engine. At STRIKE 1 a character carrying strikeLess 1
     * (R4.9 Vanguard, or the 3 point Chest affix) takes 0 from every Strike, and under Hollow Air a die that
     * cannot reach an Aspect's TN passes with probability 0, so a lone immortal survivor can face an
     * unbreakable Aspect for ever. The harness stops such a fight at maxRounds and counts it. */
    if (q.step === 'bossAssign' && q.round >= maxRounds) { stalled = true; break; }
    if (q.step === 'assign') S.assign(state, P.assign(state));
    else if (q.step === 'check') S.resolveNext(state, rng);
    else if (q.step === 'stageEnd') { P.takeDrops(state, rng); S.endStage(state, rng); }
    else if (q.step === 'bossAssign') S.bossAssign(state, P.boss(state));
    else if (q.step === 'bossCheck') S.resolveBossCheck(state, rng);
    else if (q.step === 'strike') S.bossStrike(state, rng);
    else if (q.step === 'bossWon') { P.takeDrops(state, rng); S.endStage(state, rng); }
    else break;
  }
  var m = { party: partyIds.length, living: 0, stagePass: 0, stageChecks: 0, bossPass: 0, bossChecks: 0,
    reachedBoss: false, rounds: 0, stalled: stalled, deadlock: false };
  var qq = state.quest;
  if (qq && stalled) m.deadlock = deadlocked(state);
  if (qq) {
    for (var i = 0; i < qq.results.length; i++) {
      var r = qq.results[i];
      if (r.boss) { m.bossChecks++; if (r.pass) m.bossPass++; }
      else if (r.roll) { m.stageChecks++; if (r.pass) m.stagePass++; }
    }
    var here = qq.def.stages[qq.stageIndex];
    m.reachedBoss = m.bossChecks > 0 || !!(here && here.boss);
    if (m.reachedBoss) m.rounds = qq.round + 1;                 // round++ only happens after a Strike
    m.living = MD.SIM.livingParty(state).length;
    P.takeDrops(state, rng);
  }
  m.summary = MD.SIM.endQuest(state, rng);
  return m;
}

function newAcc() {
  return { quests: 0, charQuests: 0, deaths: 0, atLeastOne: 0, wipes: 0, wins: 0,
    renownReward: 0, renownAll: 0, marrow: 0, stagePass: 0, stageChecks: 0, bossPass: 0, bossChecks: 0,
    bossQuests: 0, rounds: 0, careers: 0, careerN: 0, censored: 0, noParty: 0, stalls: 0, deadlocks: 0 };
}
function tally(acc, m, dRen, dMarrow) {
  acc.quests++; acc.charQuests += m.party;
  acc.deaths += m.summary.deaths.length;
  if (m.summary.deaths.length) acc.atLeastOne++;
  if (m.living === 0) acc.wipes++;
  if (m.summary.won) acc.wins++;
  acc.renownReward += m.summary.renown - m.summary.salvage;
  acc.renownAll += dRen; acc.marrow += dMarrow;
  acc.stagePass += m.stagePass; acc.stageChecks += m.stageChecks;
  acc.bossPass += m.bossPass; acc.bossChecks += m.bossChecks;
  if (m.reachedBoss) { acc.bossQuests++; acc.rounds += m.rounds; }
  if (m.stalled) acc.stalls++;
  if (m.deadlock) acc.deadlocks++;
}
function finish(acc) {
  var q = Math.max(1, acc.quests), ch = Math.max(1, acc.charQuests);
  return { quests: acc.quests, charQuests: acc.charQuests,
    death: acc.deaths / ch, atLeastOne: acc.atLeastOne / q, wipe: acc.wipes / q, win: acc.wins / q,
    renown: acc.renownReward / q, renownAll: acc.renownAll / q, marrow: acc.marrow / q,
    chkStage: acc.stagePass / Math.max(1, acc.stageChecks), chkBoss: acc.bossPass / Math.max(1, acc.bossChecks),
    chkAll: (acc.stagePass + acc.bossPass) / Math.max(1, acc.stageChecks + acc.bossChecks),
    checksPerQuest: (acc.stageChecks + acc.bossChecks) / q, stageChecksPerQuest: acc.stageChecks / q,
    bossReach: acc.bossQuests / q, rounds: acc.rounds / Math.max(1, acc.bossQuests),
    career: acc.careerN ? acc.careers / acc.careerN : 0, careerN: acc.careerN, censored: acc.censored,
    noParty: acc.noParty, stall: acc.stalls / q, stalls: acc.stalls, deadlocks: acc.deadlocks };
}

/* (A) FRESH: three freshly rolled tier 1 characters, no gear, nothing carried out. */
function runFresh(cell, opts) {
  var key = cellKey(cell), acc = newAcc(), B = MD.balance();
  for (var i = 0; i < opts.sample; i++) {
    var st = MD.SIM.newGame(0);
    var rng = MD.makeRng(MD.seedFromString('fresh|' + key + '|' + i));
    MD.SIM.seedRoster(st, rng, B.PARTY_SIZE);
    var q = MD.GEN.newQuest('freshq|' + key + '|' + i, cell.depth);
    var r0 = st.account.renownLifetime, m0 = st.account.marrow;
    var m = playQuestMetered(st, rng, q, st.roster.map(function (c) { return c.id; }), opts.maxRounds);
    tally(acc, m, st.account.renownLifetime - r0, st.account.marrow - m0);
  }
  return finish(acc);
}

/* (B) ACCOUNT: the whole progression. The Hall runs between quests exactly as SIM.policy.hall writes it
 * (retire at Toughness 1 or less, recruit to three deployable bodies, Mend at Toughness minus 1 with
 * 20 Renown, take the Traits owed, gear the roster with what is left on the drop screen). */
function snapshot(st) {
  var out = {};
  for (var i = 0; i < st.roster.length; i++) out[st.roster[i].id] = st.roster[i].questsSurvived;
  return out;
}
function departures(st, known, acc) {
  var live = {};
  for (var i = 0; i < st.roster.length; i++) live[st.roster[i].id] = 1;
  for (var id in known) if (known.hasOwnProperty(id) && !live[id]) { acc.careers += known[id]; acc.careerN++; }
}
function runAccounts(cell, opts) {
  var key = cellKey(cell), acc = newAcc(), B = MD.balance();
  for (var a = 0; a < opts.accounts; a++) {
    var st = MD.SIM.newGame(a);
    var rng = MD.makeRng(MD.seedFromString('acct|' + key + '|' + a));
    MD.SIM.seedRoster(st, rng, B.PARTY_SIZE);
    var known = snapshot(st);
    for (var k = 0; k < opts.questsPer; k++) {
      MD.SIM.policy.hall(st, rng);
      departures(st, known, acc);                     // retirements happen in the Hall
      var party = MD.SIM.policy.party(st);
      if (!party.length) { acc.noParty++; break; }    // R8.0 THE STRAY should make this unreachable
      known = snapshot(st);
      var q = MD.GEN.newQuest('acctq|' + key + '|' + a + '|' + k, cell.depth);
      var r0 = st.account.renownLifetime, m0 = st.account.marrow;
      var m = playQuestMetered(st, rng, q, party, opts.maxRounds);
      tally(acc, m, st.account.renownLifetime - r0, st.account.marrow - m0);
      departures(st, known, acc);                     // deaths leave the roster at endQuest
      known = snapshot(st);
    }
    acc.censored += st.roster.length;                 // careers still running when the account stops
  }
  return finish(acc);
}

function runCell(cell, opts) {
  MD.useBalance(cellBalance(cell, opts.over));
  var t0 = Date.now();
  var fresh = runFresh(cell, opts);
  var acct = runAccounts(cell, opts);
  MD.useBalance(null);
  return { cell: cell, fresh: fresh, acct: acct, ms: Date.now() - t0 };
}

/* ---- the printed grid ---- */
var TARGETS = { death: [0.12, 0.15], atLeastOne: [0.30, 0.40], wipe: [0.06, 0.10],
  renown: [30, 40], marrow: [1.2, 1.8], career: [4, 7] };
function pct(x) { return (x * 100).toFixed(1); }
function inRange(v, r) { return v >= r[0] && v <= r[1]; }
function mark(v, r) { return inRange(v, r) ? ' ' : '*'; }

function tableFor(rows, which, opts) {
  var isAcct = which === 'acct';
  var head = ['T', 'target', 'STK', 'RSP', 'death/char', '1+ death', 'wipe', 'win', 'stall', 'Renown', 'Ren+salv', 'Marrow'];
  if (isAcct) { head.push('career'); head.push('cens'); }
  head = head.concat(['chk pre', 'chk boss', 'rounds', 'hits']);
  var out = [];
  out.push('| ' + head.join(' | ') + ' |');
  out.push('|' + head.map(function () { return '---'; }).join('|') + '|');
  var tgt = ['*', 'spec target', '', '', '12 to 15%', 'about 35%', 'about 8%', '', '0', 'about 35', '', 'about 1.5'];
  if (isAcct) { tgt.push('4 to 7'); tgt.push('low'); }
  tgt = tgt.concat(['70 to 75%', '', '', isAcct ? '6' : '4']);
  out.push('| ' + tgt.join(' | ') + ' |');
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i], d = r[which], c = r.cell, hits = 0;
    if (inRange(d.death, TARGETS.death)) hits++;
    if (inRange(d.atLeastOne, TARGETS.atLeastOne)) hits++;
    if (inRange(d.wipe, TARGETS.wipe)) hits++;
    if (inRange(d.renown, TARGETS.renown)) hits++;
    if (isAcct && inRange(d.career, TARGETS.career)) hits++;
    if (isAcct && inRange(d.marrow, TARGETS.marrow)) hits++;   // FRESH cannot pay Marrow at all (R8.5), so it is not scored there
    var line = ['' + c.tough, c.target, '' + c.strike, '' + c.respite,
      pct(d.death) + '%' + mark(d.death, TARGETS.death),
      pct(d.atLeastOne) + '%' + mark(d.atLeastOne, TARGETS.atLeastOne),
      pct(d.wipe) + '%' + mark(d.wipe, TARGETS.wipe),
      pct(d.win) + '%',
      pct(d.stall) + '%' + (d.stalls ? '*' : ' '),
      d.renown.toFixed(1) + mark(d.renown, TARGETS.renown),
      d.renownAll.toFixed(1),
      d.marrow.toFixed(2) + mark(d.marrow, TARGETS.marrow)];
    if (isAcct) {
      line.push(d.career.toFixed(2) + mark(d.career, TARGETS.career));
      line.push(pct(d.censored / Math.max(1, d.censored + d.careerN)) + '%');
    }
    line = line.concat([pct(d.chkStage) + '%', pct(d.chkBoss) + '%', d.rounds.toFixed(2), '' + hits]);
    out.push('| ' + line.join(' | ') + ' |');
  }
  return out.join('\n');
}

function printGrid(rows, opts, wallMs) {
  var B0 = MD.BALANCE;
  console.log('MARROWDEEP balance harness, Depth ' + opts.depth + ', engine.js under SIM.policy.');
  console.log('SAMPLE: (A) FRESH ' + opts.sample.toLocaleString('en-US') + ' quests per cell, three freshly rolled tier 1 characters, no gear.');
  console.log('        (B) ACCOUNT ' + opts.accounts + ' accounts x ' + opts.questsPer + ' quests = ' +
    (opts.accounts * opts.questsPer).toLocaleString('en-US') + ' quests per cell, whole progression.');
  console.log('        ' + rows.length + ' cells, ' + (rows.length * (opts.sample + opts.accounts * opts.questsPer)).toLocaleString('en-US') +
    ' quests in all, ' + (wallMs / 1000).toFixed(0) + 's wall, jobs ' + opts.jobs + '.');
  console.log('        Seeds are named per cell and per quest; Math.random is never called. Banks: ' + DATA_SOURCE + '.');
  console.log('        Boss fights are stopped at ' + opts.maxRounds + ' rounds and counted under "stall" (see the note under (B)).');
  if (Object.keys(opts.over).length) console.log('        --over: ' + JSON.stringify(opts.over));
  console.log('"cens" is the share of careers still running when the account stopped: those are censored, so the'); console.log('career mean is over COMPLETED careers only and reads low wherever cens is high.');
  console.log('A * beside a number means it misses the spec target beside it. Renown is stage and boss reward only;');
  console.log('Ren+salv adds relic salvage and the gear of the dead (R6.7, R6.8). "hits" counts the targets met.');
  console.log('');
  console.log('### (A) FRESH, ' + opts.sample.toLocaleString('en-US') + ' quests per cell');
  console.log('');
  console.log(tableFor(rows, 'fresh', opts));
  console.log('');
  console.log('Marrow reads 0.00 in every FRESH cell by law, not by accident: R8.5 pays Marrow only for a PROVEN');
  console.log('character and every character in this experiment dies on its first quest. Marrow is a (B) number.');
  console.log('');
  console.log('### (B) ACCOUNT, ' + opts.accounts + ' accounts x ' + opts.questsPer + ' quests per cell');
  console.log('');
  console.log(tableFor(rows, 'acct', opts));
  console.log('');
  var shipped = null;
  for (var i = 0; i < rows.length; i++) {
    var c = rows[i].cell;
    if (c.tough === B0.BASE_TOUGHNESS && c.target === B0.STRIKE_TARGET &&
      c.strike === B0.STRIKE[c.depth - 1] && c.respite === B0.RESPITE[c.depth - 1]) shipped = rows[i];
  }
  if (shipped) {
    console.log('The shipped cell is T' + shipped.cell.tough + ' / ' + shipped.cell.target + ' / STRIKE ' +
      shipped.cell.strike + ' / RESPITE ' + shipped.cell.respite + ' (BALANCE as it stands in engine.js).');
    console.log('  FRESH   pre boss checks ' + pct(shipped.fresh.chkStage) + '%, boss checks ' + pct(shipped.fresh.chkBoss) +
      '%, all checks ' + pct(shipped.fresh.chkAll) + '%, ' + shipped.fresh.stageChecksPerQuest.toFixed(2) + ' pre boss checks a quest.');
    console.log('  ACCOUNT pre boss checks ' + pct(shipped.acct.chkStage) + '%, boss checks ' + pct(shipped.acct.chkBoss) +
      '%, all checks ' + pct(shipped.acct.chkAll) + '%, career sample ' + shipped.acct.careerN +
      ', still running at the end ' + shipped.acct.censored + '.');
  }
  var noParty = 0, stalls = 0, dead = 0, questsAll = 0;
  for (var s = 0; s < rows.length; s++) {
    noParty += rows[s].acct.noParty;
    stalls += rows[s].fresh.stalls + rows[s].acct.stalls;
    dead += rows[s].fresh.deadlocks + rows[s].acct.deadlocks;
    questsAll += rows[s].fresh.quests + rows[s].acct.quests;
  }
  console.log('Accounts that ran out of deployable bodies (R8.0 THE STRAY should make this 0): ' + noParty + '.');
  console.log('Boss fights stopped at the ' + opts.maxRounds + ' round cap: ' + stalls + ' of ' + questsAll.toLocaleString('en-US') +
    ' quests (' + (100 * stalls / Math.max(1, questsAll)).toFixed(2) + '%), of which ' + dead + ' were DEADLOCKS:');
  console.log('no living character could pass any unbroken Aspect (probability 0) and at least one could not be');
  console.log('killed by a Strike (strikeLess >= STRIKE: R4.9 Vanguard, or the 3 point Chest affix). Those fights');
  console.log('never end. The engine has no cap, so in the shipped game that is a boss screen the player cannot leave.');
}

async function gridMode() {
  var opts = { sample: flagNum('sample', 10000), accounts: flagNum('accounts', 300),
    questsPer: flagNum('questsPer', 25), jobs: flagNum('jobs', 2), depth: flagNum('depth', 1),
    maxRounds: flagNum('maxRounds', 60), over: parseOverrides() };
  var cells = [];
  for (var a = 0; a < GRID_TOUGH.length; a++)
    for (var b = 0; b < GRID_TARGET.length; b++)
      for (var c = 0; c < GRID_STRIKE.length; c++)
        for (var d = 0; d < GRID_RESPITE.length; d++)
          cells.push({ tough: GRID_TOUGH[a], target: GRID_TARGET[b], strike: GRID_STRIKE[c],
            respite: GRID_RESPITE[d], depth: opts.depth });
  var t0 = Date.now(), rows = [];
  if (opts.jobs <= 1) {
    for (var i = 0; i < cells.length; i++) {
      rows.push(runCell(cells[i], opts));
      process.stderr.write('cell ' + (i + 1) + '/' + cells.length + ' ' + cellKey(cells[i]) + ' ' +
        ((Date.now() - t0) / 1000).toFixed(0) + 's\n');
    }
  } else {
    rows = await runParallel(cells, opts, t0);
  }
  printGrid(rows, opts, Date.now() - t0);
}

/* Two cores, so the default is two workers. A cell is independent and seeded by name, so the grid
 * measures the same numbers at any --jobs. */
function runParallel(cells, opts, t0) {
  return new Promise(function (resolve) {
    var self = fileURLToPath(import.meta.url);
    var n = Math.max(1, Math.min(opts.jobs, cells.length));
    var next = 0, done = 0, out = new Array(cells.length), kids = [];
    for (var w = 0; w < n; w++) {
      var kid = fork(self, ['--gridworker'], { stdio: ['ignore', 'inherit', 'inherit', 'ipc'] });
      kids.push(kid);
      (function (k) {
        k.on('message', function (msg) {
          out[msg.i] = msg.res; done++;
          process.stderr.write('cell ' + done + '/' + cells.length + ' ' + cellKey(cells[msg.i]) + ' ' +
            (msg.res.ms / 1000).toFixed(0) + 's cell, ' + ((Date.now() - t0) / 1000).toFixed(0) + 's wall\n');
          if (next < cells.length) k.send({ i: next, cell: cells[next++], opts: opts });
          else k.send({ done: true });
          if (done === cells.length) { for (var z = 0; z < kids.length; z++) kids[z].kill(); resolve(out); }
        });
      })(kid);
      if (next < cells.length) kid.send({ i: next, cell: cells[next++], opts: opts });
    }
  });
}
function gridWorker() {
  process.on('message', function (msg) {
    if (msg.done) { process.exit(0); return; }
    var res = runCell(msg.cell, msg.opts);
    process.send({ i: msg.i, res: res });
  });
}

/* ============================ runner ============================ */
if (has('--gridworker')) {
  useAuthoredData();
  gridWorker();
} else if (has('--grid')) {
  useAuthoredData();
  await gridMode();
} else if (has('--table')) {
  tableMode();
} else if (has('--test')) {
  testMode();
  const order = ['R0', 'R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'R9', 'R10', 'R11', 'R12', 'spec 7', 'spec 11', 'other'];
  const label = {
    R0: 'words and the frozen BALANCE', R1: 'the dice, surge, floors, the caps, Push, the reroll family',
    R2: 'characters, tiers, Toughness, death, retire and dismiss', R3: 'Strain, Armor, benching',
    R4: 'Origins, Callings, Traits', R5: 'the stage, assignment, consequences, rewards',
    R6: 'relics, affixes, budgets, naming, salvage, the Hall bench',
    R7: 'the boss, Aspects, damage, the three Strike laws', R8: 'the economy, the Hall, Legacies, the wall',
    R9: 'the Depths, the Sigils, the Wards, the sealed stages', R10: 'the content banks',
    R11: 'the screens\' own facts', R12: 'the effect vocabulary',
    'spec 7': 'the stat frequency curve', 'spec 11': 'the gear tables', other: 'everything else' };
  console.log('MARROWDEEP rules assertions, engine.js against plans/marrowdeep/RULES.md');
  for (const k of order) {
    if (!BY_RULE.has(k)) continue;
    console.log('  ' + k.padEnd(8) + String(BY_RULE.get(k)).padStart(4) + '   ' + (label[k] || ''));
  }
  console.log('');
  if (FAILS.length) {
    console.log('MD TEST FAILED: ' + FAILS.length + ' of ' + COUNT);
    for (const f of FAILS) console.log('  X ' + f);
    process.exit(1);
  }
  console.log('MD TEST OK   ' + COUNT + ' assertions over R1 to R9');
} else {
  console.log('usage: node sim.mjs --table | --test | --grid');
  console.log('  --grid [--sample=N] [--accounts=N] [--questsPer=N] [--jobs=N] [--depth=D] [--over=KEY=VAL]');
  process.exit(2);
}
