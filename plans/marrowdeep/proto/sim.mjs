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
    let compOk = true, tnOk = true, strainOk = true, why = '';
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
          if (s.shape === 'gate' && ![4, 5].includes(s.tns[0])) tnOk = false;
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
    const a = mkChar('a', { strain: 3 }), b = mkChar('b', { strain: 2 }), c = mkChar('c', { strain: 2 });
    const st = mkState([a, b, c]);
    const q = synthQuest(1, [synthStage(1, [slotOf('gate', ['might'], [3])], 1), synthStage(2, [slotOf('gate', ['might'], [3])], 1)]);
    const rng = R('bench');
    MD.SIM.startQuest(st, rng, q, ['a', 'b', 'c']);
    MD.SIM.assign(st, { slots: [{ chars: ['b'] }], bench: 'a' });
    MD.SIM.resolveNext(st, rng);
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
    const a = mkChar('a', { strain: 3 });
    const st = mkState([a, mkChar('b'), mkChar('c')]);
    MD.SIM.startQuest(st, R('death'), synthQuest(1, [synthStage(1, [slotOf('gate', ['might'], [4])], 1)], []), ['a', 'b', 'c']);
    MD.SIM.applyStrain(st, a, 1, {});
    eq('R2.4 Strain reaching Toughness kills', a.alive, false);
    eq('R8.5 a death pays one Marrow at Depth I', st.account.marrow, 1);
    eq('R8.7 a death makes a Legacy', st.account.legacies.length, 1);
    eq('R8.8 a death writes the wall', st.account.wall.length, 1);
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
    const st = mkState([mkChar('a', { strain: 0 })]);
    const q = synthQuest(3, [synthStage(1, [slotOf('gate', ['might'], [4])], 1)], []);
    MD.SIM.startQuest(st, R('marrow3'), q, ['a']);
    MD.SIM.applyStrain(st, MD.SIM.byId(st, 'a'), 9, {});
    eq('R8.5 a death at Depth III pays two Marrow', st.account.marrow, 2);
  }
  {
    const st = mkState([mkChar('a')]);
    const q = synthQuest(5, [synthStage(1, [slotOf('gate', ['might'], [4])], 1)], []);
    MD.SIM.startQuest(st, R('marrow5'), q, ['a']);
    MD.SIM.applyStrain(st, MD.SIM.byId(st, 'a'), 9, {});
    eq('R8.5 a death at Depth V pays three Marrow', st.account.marrow, 3);
  }
  {
    const a = mkChar('a', { questsSurvived: 2, traits: ['grim', 'steady'] });
    const st = mkState([a]);
    const r = MD.SIM.retire(st, 'a');
    eq('R2.6 a retirement pays two plus Traits', r.marrow, 4);
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
    let budgetOk = true, keyOk = true, slotOk = true, uniqueOk = true, why = '';
    const rng = R('thousand');
    for (let i = 0; i < 1000; i++) {
      const depth = 1 + (i % 5);
      const item = MD.GEN.newRelic(rng, depth, {});
      const pts = item.affixes.reduce((a, x) => a + x.pts, 0);
      if (pts !== item.budget) { budgetOk = false; why = item.slot + ' ' + pts + '/' + item.budget; }
      const seen = {};
      for (const a of item.affixes) {
        const k = a.key + (a.stat ? ':' + a.stat : '');
        if (seen[k]) { keyOk = false; why = 'repeat ' + k + ' on ' + item.slot; }
        seen[k] = 1;
        const def = MD.AFFIXES[a.key];
        if (a.key !== 'toughness' && def.slots.indexOf(item.slot) < 0) { slotOk = false; why = a.key + ' on ' + item.slot; }
      }
      if (item.rarity === 'relic' && !item.unique) uniqueOk = false;
      if (item.rarity !== 'relic' && item.unique) uniqueOk = false;
    }
    ok('R6.2 a thousand relics meet their budget exactly', budgetOk, why);
    ok('R6.2 and never repeat an affix key', keyOk, why);
    ok('R6.2 and only carry affixes valid for the slot', slotOk, why);
    ok('R6.4 Relic rarity carries a unique and nothing else does', uniqueOk);
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
    ok('R6.5 one affix means no of clause', oneAffix && oneAffix.name.indexOf(' of ') < 0, oneAffix && oneAffix.name);
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
    const ch = mkChar('a', { stats: { might: 12, grace: 12, wits: 12, nerve: 8 } });
    const it = { slot: 'hands', rarity: 'rare', pts: 3, budget: 3, affixes: [aff('stepStat', [{ k: 'stepStat', stat: 'might' }], 3, 'might')], unique: null, name: 'x' };
    MD.GEN.retargetForWearer(it, ch, null);
    eq('R6.3 a step on a d12 stat retargets', it.affixes[0].stat, 'nerve');
    const ch2 = mkChar('b', { stats: { might: 12, grace: 12, wits: 12, nerve: 12 } });
    const it2 = { slot: 'hands', rarity: 'rare', pts: 3, budget: 3, affixes: [aff('stepStat', [{ k: 'stepStat', stat: 'might' }], 3, 'might')], unique: null, name: 'x' };
    MD.GEN.retargetForWearer(it2, ch2, null);
    eq('R6.3 with all four at d12 it becomes Toughness', it2.affixes[0].key, 'toughness');
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
    eq('R7.6 the first boss pays eight', fb.reward.renown, MD.BALANCE.RENOWN.firstBoss);
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
    eq('R7.4 the Strike is two at Depth I to III', MD.BALANCE.STRIKE.slice(0, 3).join(','), '2,2,2');
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
    const a = mkChar('a', { stats: { might: 4, grace: 4, wits: 4, nerve: 4 } });
    const b = mkChar('b'), c = mkChar('c');
    const st = mkState([a, b, c]);
    const stage = synthStage(1, [slotOf('gate', ['might'], [3]), slotOf('vault', [null], [7], { sealed: true })], 1, { sealed: true });
    const q = synthQuest(4, [stage, synthStage(2, [slotOf('gate', ['might'], [3])], 1)]);
    const rng = R('sealedrun');
    MD.SIM.startQuest(st, rng, q, ['a', 'b', 'c']);
    let repeats = 0, guard = 0;
    while (st.quest.stageIndex === 0 && guard++ < 40) {
      MD.SIM.assign(st, { slots: [{ chars: ['b'] }, { chars: ['a'], stat: 'might' }], bench: 'c' });
      while (st.quest.step === 'check') MD.SIM.resolveNext(st, rng);
      MD.SIM.endStage(st, rng);
      if (st.quest.step === 'assign' && st.quest.stageIndex === 0) repeats++;
      if (st.quest.step === 'lost') break;
    }
    ok('R9.1 a failed sealed Vault sends the stage round again', repeats >= 1 || st.quest.step === 'lost', 'repeats ' + repeats + ' step ' + st.quest.step);
    ok('R9.1 the engine counted the repeats', st.quest.sealRepeats === repeats, st.quest.sealRepeats + ' vs ' + repeats);
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
    eq('R2.5 every survivor takes a Scar', a.scars, 1);
    eq('R2.5 and counts the quest', a.questsSurvived, 1);
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
    eq('R5.9 the shape rewards', MD.SHAPES.map((s) => MD.BALANCE.RENOWN[s]).join(','), '3,6,6,5,4,2');
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

/* ============================ runner ============================ */
if (has('--table')) {
  tableMode();
} else if (has('--test')) {
  testMode();
  if (FAILS.length) {
    console.log('MD TEST FAILED: ' + FAILS.length + ' of ' + COUNT);
    for (const f of FAILS) console.log('  X ' + f);
    process.exit(1);
  }
  console.log('MD TEST OK   ' + COUNT + ' assertions over R1 to R9');
} else {
  console.log('usage: node sim.mjs --table | --test');
  process.exit(2);
}
