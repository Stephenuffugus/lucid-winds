/* MARROWDEEP prototype harness. Node 24, no dependencies.
 *   node sim.mjs --table   the R1.4 master table and the R1.5 floor rows, measured through roll()
 *   node sim.mjs --test    the assertions over R1 to R9
 * The engine is the law's only implementation; this file only measures it.
 */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const MD = require('./engine.js');

const ARG = process.argv.slice(2);
const has = (f) => ARG.indexOf(f) >= 0;

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
function ok(name, cond, extra) {
  COUNT++;
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
  eq('R1.3 floorPlus then the cap', MD.effectiveFloor(8, 3, 1, false), 4);
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
    let allAt8 = true, straycallUnder = false;
    for (let i = 0; i < 200; i++) {
      const c = MD.GEN.newCharacter(R('floor' + i), st.account, {});
      if (c.origin !== 'straycall' && MD.STATS.some((s) => c.stats[s] < 8)) allAt8 = false;
      if (c.origin === 'straycall' && c.stats.nerve < 8) straycallUnder = true;
    }
    ok('R8.6 the creation floor holds', allAt8);
    ok('R4.5 Straycall shifts AFTER the floor, so a NERVE can sit under it', straycallUnder);
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
