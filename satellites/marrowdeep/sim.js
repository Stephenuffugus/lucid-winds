/* MARROWDEEP headless runner. Node 24, no dependencies, CommonJS on purpose.
 *   node sim.js --table   the R1.4 master table and the R1.5 floor rows, measured through roll()
 *   node sim.js --test    the assertions over R1 to R9
 *   node sim.js --grid    the balance harness (spec 15): two experiments over the BASE_TOUGHNESS x
 *                          STRIKE_TARGET x STRIKE x RESPITE grid, against the spec 8.6 targets
 *   node sim.js --grid --over=KEY=VAL   one run with any BALANCE number moved (repeatable)
 * The engine is the law's only implementation; this file only measures it.
 */
const { fork } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

/* ⛔ THE RULES ARE READ OUT OF THE PAGE, not out of a second copy of them.
   index.html carries the engine between the SIM markers, and the DATA block sits
   INSIDE that span, so what runs here is byte for byte what a thumb plays,
   authored banks included. A file that imported its own engine would be a second
   implementation, and this repo has the scar to prove those drift. */
const HTML_PATH = path.join(__dirname, 'index.html');
function extract(src, a, b) {
  const i = src.indexOf(a), j = src.indexOf(b);
  if (i < 0 || j < 0) throw new Error('marker not found in index.html: ' + a + ' / ' + b);
  return src.slice(i + a.length, j);
}
const HTML = fs.readFileSync(HTML_PATH, 'utf8');
const SIM_SRC = extract(HTML, '// ---- SIM_EXPORT_START ----', '// ---- SIM_EXPORT_END ----');
if (/\bMath\.random\b/.test(SIM_SRC)) throw new Error('Math.random appears inside the SIM export; the sim would stop being reproducible');
if (/\bnew Date\b|\bDate\.now\b/.test(SIM_SRC)) throw new Error('Date appears inside the SIM export');
if (/\bdocument\.|\bwindow\./.test(SIM_SRC)) throw new Error('the DOM appears inside the SIM export');
const MD = (function () {
  const box = { module: undefined, console };
  vm.createContext(box);
  vm.runInContext(SIM_SRC + '\n;__out = { MD: MD, DATA_BANKS: DATA_BANKS };', box, { filename: 'marrowdeep-sim.js' });
  box.__out.MD.setData(box.__out.DATA_BANKS);
  return box.__out.MD;
})();

const ARG = process.argv.slice(2);
const has = (f) => ARG.indexOf(f) >= 0;

/* The engine carries placeholder word and line banks; the authored ones live in plans/marrowdeep/data.
 * R10 says the builder pastes them into DATA, so the suite proves the engine against both. */
const PLACEHOLDER = JSON.parse(JSON.stringify(MD.data()));
function loadAuthoredData() {
  /* The page already carries them (the DATA block is inside the SIM span), so this
     only ever runs when someone points this file at an engine without them. */
  try {
    const d = './data/';
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

/* ⛔ THE PAGE ALREADY CARRIES THE AUTHORED BANKS, normalised. The DATA block sits
   INSIDE the SIM span, so the extractor above loaded them with the engine and
   `effects` is already `eff` and `text` already `line`.
   Re-reading data/*.json here would overwrite them with the RAW files and put the
   spelling back, which silently zeroes every unique and every authored Trait: the
   engine's guard iterates `t.eff || []` and an empty list has no unknown kinds in
   it, so nothing throws and the game just quietly stops having gear effects.
   `sim.js --data` caught exactly that when this function still reloaded. It is now
   a statement of fact about what is loaded, and it loads nothing. */
let DATA_SOURCE = 'the DATA block inside index.html (authored, normalised)';
function useAuthoredData() {
  const d = MD.data();
  const authored = !!(d && d.uniques && d.uniques.length && d.uniques[0].eff);
  if (!authored) DATA_SOURCE = 'the engine placeholder banks (index.html has no DATA block)';
  return authored;
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
  /* R1.3 under a floorPlus. The plain rows above never touch floorPlus, so a cap raised by it is invisible to
   * them: a d12 at floorHalf plus the Head affix would read floor 7 and pass EVERY TN in the game for ever,
   * and every cell above would still be green. These rows roll the real composed floor through floorFor. */
  console.log('Floors under a floorPlus, R1.3 ("F <= die / 2, applied AFTER every floorPlus").');
  console.log('  build                                       floor   measured / R1.4   (tolerance 0.50)');
  const PLUSROWS = [
    { die: 12, tn: 7, floorWant: 6, want: 50.0, what: 'd12 half die floor + the Head "floors +1"',
      list: [{ k: 'floor', stat: 'all', v: 'half' }, { k: 'floorPlus', v: 1 }] },
    { die: 8, tn: 5, floorWant: 4, want: 50.0, what: 'd8 gear floor 4 + Ironbound',
      list: [{ k: 'floor', stat: 'all', v: 4, fromGear: true }, { k: 'floorPlus', v: 1, gearOnly: true }] },
    { die: 6, tn: 4, floorWant: 3, want: 50.0, what: 'd6 gear floor 3 + Ironbound (the plus pays here)',
      list: [{ k: 'floor', stat: 'all', v: 2, fromGear: true }, { k: 'floorPlus', v: 1, gearOnly: true }] },
    { die: 4, tn: 4, floorWant: 2, want: 25.0, what: 'd4 Vanguard floor 4 + the Head affix',
      list: [{ k: 'floor', stat: 'all', v: 4 }, { k: 'floorPlus', v: 1 }] }
  ];
  for (const row of PLUSROWS) {
    const f = MD.floorFor(row.list, 'might', row.die);
    const rng = MD.makeRng(MD.seedFromString('floorplus:' + row.what));
    let hits = 0;
    for (let i = 0; i < N; i++) if (MD.roll(row.die, { rng, floor: f }).total >= row.tn) hits++;
    const got = (hits / N) * 100;
    const offF = f !== row.floorWant, off = Math.abs(got - row.want) > 0.5;
    if (offF || off) bad++;
    console.log('  ' + String(row.what).padEnd(42) + '  ' + pad(f + '/' + row.floorWant, 5) + '   TN' + row.tn + ' ' +
      pad(got.toFixed(2) + '/' + row.want.toFixed(2), 14) + ((offF || off) ? '   X' : ''));
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
  /* R1.3: "Cap: F <= die / 2, applied AFTER every floorPlus." The raised cap an earlier audit ruling wrote in
   * was overturned by a critic and the affixes are repriced where they live instead (R6.11). A Head floorHalf
   * plus floorPlus on a d12 reads 6, not 7; at 7 the character passed EVERY TN in the game for ever, because
   * R0 pins the band at 3 to 7 at every Depth, and R1.9's composed cap does not save it (it only greys flats). */
  eq('R1.3 the cap holds under floorPlus', MD.effectiveFloor(8, 5, 1, false), 4);
  eq('R1.3 and holds without one', MD.effectiveFloor(8, 5, 0, false), 4);
  eq('R4.9 a Vanguard floor 4 reads 2 on a d4', MD.effectiveFloor(4, 4, 1, false), 2);
  eq('R4.9 and 3 on a d6', MD.effectiveFloor(6, 4, 1, false), 3);
  eq('R1.3 floorFor caps a gear floor plus Ironbound at the half die',
    MD.floorFor([{ k: 'floor', stat: 'all', v: 4, fromGear: true }, { k: 'floorPlus', v: 1, gearOnly: true }], 'might', 8), 4);
  eq('R1.3 and a half die floor plus the Head affix on a d12',
    MD.floorFor([{ k: 'floor', stat: 'all', v: 'half' }, { k: 'floorPlus', v: 1 }], 'might', 12), 6);
  eq('R1.3 but floorPlus still pays under the cap',
    MD.floorFor([{ k: 'floor', stat: 'all', v: 3, fromGear: true }, { k: 'floorPlus', v: 1, gearOnly: true }], 'might', 8), 4);
  {
    // R1.3: no build of any kind can read a floor over the half die
    let worst = 0;
    for (const die of MD.DICE) for (const v of [3, 4, 5, 6, 'half']) for (const plus of [0, 1, 2, 3]) {
      const list = [{ k: 'floor', stat: 'all', v: v, fromGear: true }, { k: 'floor', stat: 'all', v: v }];
      if (plus) list.push({ k: 'floorPlus', v: plus }, { k: 'floorPlus', v: plus, gearOnly: true });
      const f = MD.floorFor(list, 'might', die);
      if (f > MD.floorCap(die)) worst = Math.max(worst, f - MD.floorCap(die));
    }
    eq('R1.3 no build reads a floor over the half die cap', worst, 0);
  }
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
    /* R8.5 CORRECTED (audit): an UNPROVEN death pays a FLAT 1 Marrow at Depth I to III and 0 at IV and V, and
     * always makes the Legacy and writes the wall. Paying it nothing broke pillar 5, "death is productive", for
     * EVERY death in a player's first quest, on an account where every character is unproven. The farm the rule
     * exists to close (a fresh mid quest Recruit fed to the boss at every stage end) lives at IV and V, where
     * the multiplier and the Recruit are richest, so the rule lives there and nowhere else. */
    const rookie = mkChar('r', { strain: 3, questsSurvived: 0 });
    const st2 = mkState([rookie]);
    MD.SIM.startQuest(st2, R('rookie'), synthQuest(5, [synthStage(1, [slotOf('gate', ['might'], [4])], 1)], []), ['r']);
    MD.SIM.applyStrain(st2, rookie, 1, {});
    eq('R8.5 an unproven death pays no Marrow at Depth V', st2.account.marrow, 0);
    eq('R8.5 and still makes the Legacy', st2.account.legacies.length, 1);
    eq('R8.5 and still writes the wall', st2.account.wall.length, 1);
    const rookie1 = mkChar('r1', { strain: 3, questsSurvived: 0 });
    const st3 = mkState([rookie1]);
    MD.SIM.startQuest(st3, R('rookie1'), synthQuest(1, [synthStage(1, [slotOf('gate', ['might'], [4])], 1)], []), ['r1']);
    MD.SIM.applyStrain(st3, rookie1, 1, {});
    eq('R8.5 an unproven death pays a flat 1 at Depth I', st3.account.marrow, 1);
    eq('R8.5 and still makes the Legacy there too', st3.account.legacies.length, 1);
    eq('R8.5 and still writes the wall there too', st3.account.wall.length, 1);
    eq('R8.5 the unproven row is one BALANCE row', MD.BALANCE.UNPROVEN_DEATH_MARROW.join(','), '1,1,1,0,0');
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
        // R13.11: every FLOOR key counts as one key per stat, so floor3 and floorHalf share one stat pool
        const fam = (a.key === 'floor3' || a.key === 'floorHalf') ? 'floor' : a.key;
        const k = fam + (a.stat ? ':' + a.stat : '') + (a.sigil ? '@' + a.sigil : '');
        const n = (seen['#' + k] = (seen['#' + k] || 0) + 1);
        if (n > (twiceOk ? 2 : 1)) { keyOk = false; why = 'repeat ' + k + ' x' + n + ' on ' + item.slot; }
        if (a.sigil) { if (sigs[a.sigil]) { keyOk = false; why = 'Sigil named twice: ' + a.sigil; } sigs[a.sigil] = 1; }
        /* R6.2 (a): a merged remainder is filler too. The old counter read only the `filler` flag, so a 1 point
         * real toughness that absorbed a 2 point remainder measured as 0 filler on the merge path, and the
         * assertion R6.2 names as the guard on the Scar treadmill measured nothing there. */
        if (a.fillerPts != null) filler += a.fillerPts; else if (a.filler) filler += a.pts;
        const def = MD.AFFIXES[a.key];
        if (a.key !== 'toughness' && def.slots.indexOf(item.slot) < 0) { slotOk = false; why = a.key + ' on ' + item.slot; }
      }
      if (filler > MD.BALANCE.FILLER_MAX) { fillerOk = false; why = 'filler ' + filler + ' on ' + item.slot; }
      if (item.rarity === 'relic' && !item.unique) uniqueOk = false;
      if (item.rarity !== 'relic' && item.unique) uniqueOk = false;
    }
    ok('R6.2 a thousand relics meet their budget exactly', budgetOk, why);
    ok('R6.2 and never repeat an affix key (R13.11: one floor line per stat)', keyOk, why);
    {
      // force the merge path: a Chest that already holds a real toughness line and still has a remainder
      let mergedSeen = 0, mergedOk = true;
      const rng2 = R('mergefiller');
      for (let i = 0; i < 4000; i++) {
        for (const d of [1, 2, 3, 4, 5]) {
          const it = MD.GEN.newRelic(rng2, d, { slot: 'chest' });
          for (const a of it.affixes) {
            if (a.fillerPts == null) continue;
            mergedSeen++;
            if (a.fillerPts > MD.BALANCE.FILLER_MAX || !a.filler) mergedOk = false;
          }
        }
        if (mergedSeen > 50) break;
      }
      ok('R6.2 the merged filler line is visible to the gate', mergedSeen > 0, 'merges seen ' + mergedSeen);
      ok('R6.2 and the merged remainder is inside FILLER_MAX', mergedOk);
    }
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
    /* R6.1 "+1 rarity tier": roll the rarity, then step it up one tier, and Relic stays Relic. Measured on the
     * roll itself, because R6.2 (c) may then drop the LABEL with the budget when a slot's affix list cannot
     * spend it (Head's real ceiling is 9 under R13.11, so a Depth V Relic Head reaches 10 through the filler
     * and falls back to Rare about once in two hundred). A card never lies: the label follows the budget. */
    let relicOnly = true, labelHonest = true, sawTop = false;
    const TOP = MD.RARITIES.length - 1;
    for (let i = 0; i < 2000; i++) {                       // rollRarity returns an INDEX, and "+1" clamps at Relic
      const ri = MD.GEN.rollRarity(rng, 5, 1);
      if (ri < 0 || ri > TOP) relicOnly = false;
      if (ri === TOP) sawTop = true;
    }
    if (!sawTop) relicOnly = false;
    let stayed = 0;
    for (let i = 0; i < 500; i++) {
      const it = MD.GEN.newRelic(rng, 5, { rarity: 'relic' });
      if (it.rarity === 'relic') stayed++;
      if (it.budget !== MD.BALANCE.BUDGETS[4][MD.RARITIES.indexOf(it.rarity)]) labelHonest = false;
    }
    ok('R6.1 a Relic rarity roll stays Relic when stepped up', relicOnly);
    ok('R6.2 (c) a fallback item wears the label its budget bought', labelHonest);
    ok('R6.2 (c) and the fallback is rare, not routine', stayed >= 490, stayed + '/500 stayed Relic');
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
    /* R7.1's LADDER, not its baseline: Depth I and II share the authored hit points, III is one over them and
     * IV and V are two over. The tuning pass shifted the whole ladder up by one (PROTO-REPORT.md); the shape is
     * what R7.1 states and what this asserts. */
    const HPB = MD.BALANCE.ASPECT_HP_BONUS;
    ok('R7.1 Aspect hit points rise with the Depth', HPB[1] === HPB[0] && HPB[2] === HPB[0] + 1 &&
      HPB[3] === HPB[0] + 2 && HPB[4] === HPB[0] + 2, HPB.join(','));
    const q2 = MD.GEN.newQuest('firstboss', 2);
    const fb = q2.stages[3], full = q2.stages[7];
    ok('R7.6 the first boss stands at half hit points', fb.aspects[0].hp <= Math.ceil(full.aspects[0].hp / 2) + 1, fb.aspects[0].hp + ' vs ' + full.aspects[0].hp);
    eq('R7.6 the first boss pays eight before the Depth multiplier', fb.reward.renown,
      Math.round(MD.BALANCE.RENOWN.firstBoss * MD.BALANCE.DEPTH_RENOWN_MULT[1]));
    ok('R7.6 which is less than the quest boss pays', fb.reward.renown < full.reward.renown,
      fb.reward.renown + ' vs ' + full.reward.renown);
    eq('R5.9 the boss pays its whole row at Depth I', MD.GEN.newQuest('br', 1).stages[5].reward.renown, MD.BALANCE.RENOWN.boss);
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
    /* R5.9 CORRECTED (audit): the Vault rolls two relics, the first at +1 tier, and pays the most Renown of any
     * slot. It carried the game's only TN 7 while paying the second lowest expected value on the board. The row
     * was scaled to three quarters by the tuning pass (PROTO-REPORT.md); what R5.9's argument fixes is the
     * ORDER, so the order is what is pinned here, not the absolute numbers. */
    const RN = MD.BALANCE.RENOWN;
    ok('R5.9 the shape reward ladder: Open <= Gate < Toll < Chain = Relay < Vault < boss',
      RN.open <= RN.gate && RN.gate < RN.toll && RN.toll < RN.chain && RN.chain === RN.relay &&
      RN.relay < RN.vault && RN.vault < RN.boss && RN.firstBoss < RN.boss,
      MD.SHAPES.map((s) => s + ' ' + RN[s]).join(', '));
    eq('R5.9 every shape reward is a whole number', MD.SHAPES.concat(['boss', 'firstBoss'])
      .filter((s) => RN[s] !== Math.round(RN[s])).length, 0);
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
    /* spec 11.2: the affix table, pinned row by row (key, points, valid slots). FOUR rows carry R6.11's
     * CORRECTED prices, not the spec's: stepStat 2 (not 3), floorHalf 2, floorPlus 1 (not 3, since R1.3's half
     * die cap holds and the line is worth +0.117), rerollStage 6 (not 3, since the once per stage family pays
     * 0.89 extra passes per point against a flat's 0.11). R6.11 is the authority for those four. */
    const SPEC = {
      flat: [2, 'hands,token,weapon'], floor3: [1, 'head'], floorHalf: [2, 'head'], floorPlus: [1, 'head'],
      stepStat: [2, 'hands'], surgeMinus: [2, 'hands,weapon'], armor: [2, 'chest'], toughness: [1, 'chest'],
      strikeLess: [3, 'chest'], reroll1s: [1, 'charm'], rerollStage: [6, 'charm'], twiceStage: [3, 'charm'],
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
    eq('R6.11 the Head floorPlus line is 1 point, not 3', MD.AFFIXES.floorPlus.pts, 1);
    eq('R6.11 the Charm reroll one die per stage is 6 points, not 3', MD.AFFIXES.rerollStage.pts, 6);
    eq('R6.11 a step on one stat is 2 points, not 3', MD.AFFIXES.stepStat.pts, 2);
    eq('R6.11 the half die floor is 2 points', MD.AFFIXES.floorHalf.pts, 2);
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
    /* R1.9 the composed cap, CORRECTED TWICE: floor + total PERMANENT flat on one stat may never exceed FIVE.
       Five and not six because R5.5 now deals Gate TNs of 6, so a floor of 6 would auto pass every target number
       in the game but the Vault's 7, which is the thing the cap exists to prevent. */
    eq('R1.9 the composed cap is five', MD.BALANCE.COMPOSED_CAP, 5);
    const head = gearItem('head', [aff('floorHalf', [{ k: 'floor', stat: 'might', v: 'half' }], 2, 'might')]);
    const tok = gearItem('token', [aff('flat', [{ k: 'flat', stat: 'might', v: 1, perm: true }], 2, 'might')]);
    const hnd = gearItem('hands', [aff('flat', [{ k: 'flat', stat: 'might', v: 1, perm: true }], 2, 'might')]);
    const wpn = gearItem('weapon', [aff('flat', [{ k: 'flat', stat: 'might', v: 1, perm: true }], 2, 'might')]);
    const ch = mkChar('cc', { stats: { might: 8, grace: 8, wits: 8, nerve: 8 }, gear: { head, token: tok, hands: hnd, weapon: wpn } });
    const st = mkState([ch, mkChar('b'), mkChar('c')]);
    MD.SIM.startQuest(st, R('cap'), synthQuest(1, [synthStage(1, [slotOf('gate', ['might'], [5])], 1)]), ['cc', 'b', 'c']);
    const cx = MD.SIM.checkContext(st, ch, { stat: 'might', tn: 5, shape: 'gate' });
    eq('R1.9 a d8 at its half die floor reads floor 4', cx.floor, 4);
    eq('R1.9 and the three flat points are cut to one', cx.flat, 1);
    eq('R1.9 so floor plus flat lands exactly on the cap', cx.floor + cx.flat, 5);
    ok('R1.9 the greyed points are reported for the Character screen', cx.greyedFlat === 2, 'greyed ' + cx.greyedFlat);
    ok('R1.9 the worst roll still leaves a live check at TN 6 AND at TN 7', cx.floor + cx.flat < 6);
    const zl = mkChar('zz', { stats: { might: 8, grace: 8, wits: 8, nerve: 8 }, calling: 'zealot', strain: 2, gear: ch.gear });
    const st2 = mkState([zl, mkChar('b'), mkChar('c')]);
    MD.SIM.startQuest(st2, R('cap2'), synthQuest(1, [synthStage(1, [slotOf('gate', ['might'], [5])], 1)]), ['zz', 'b', 'c']);
    const cx2 = MD.SIM.checkContext(st2, zl, { stat: 'might', tn: 5, shape: 'gate' });
    eq('R1.7 conditional sources sit outside the composed cap', cx2.flat, 3);
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
    eq('R8.4 one Depth back from the deepest unlocked DOES buy depth', st.account.questsCompleted, 4);
    ok('R8.4 and it still pays', st.account.renownLifetime >= 0);
    {
      // two Depths back pays Renown, relics and Marrow and buys NO depth
      const st3 = MD.SIM.newGame(4);
      MD.SIM.seedRoster(st3, R('gate3'), 3);
      st3.account.questsCompleted = 10;                   // Depth III unlocked, so Depth I is two back
      const rng3 = R('depthgate3');
      MD.SIM.startQuest(st3, rng3, synthQuest(1, [synthStage(1, [slotOf('gate', ['might'], [4])], 1)]), st3.roster.map((c) => c.id));
      st3.quest.won = true;
      MD.SIM.endQuest(st3, rng3);
      eq('R8.4 two Depths back does not', st3.account.questsCompleted, 10);
    }
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
    /* R8.7 CORRECTED: legacySlots starts at the spec's 2 and caps at 3, and the invariant that pays for the
     * third slot is the one measured here: AT LEAST ONE OF THE THREE CARDS IS ALWAYS A CALLING THE PLAYER OWNS
     * NO LEGACY FOR. Without it, an account whose dead are a Vanguard, a Zealot and a Warden could never roll
     * a Cutpurse again, at any tier, for ever. */
    eq('R8.7 the Legacy slot starts at the spec two', MD.BALANCE.LEGACY_SLOTS_START, 2);
    eq('R8.7 and caps at three, because the deal is three cards', MD.BALANCE.MARROW_SHOP.legacyMax, 3);
    const owned = ['vanguard', 'zealot', 'warden'];
    for (const slots of [2, 3]) {
      const st = mkState([]);
      st.account.legacySlots = slots;
      st.account.legacies = [];
      for (let i = 0; i < 30; i++) {                      // a deep history, several Legacies per Calling
        st.account.legacies.push({ id: 'L' + i, calling: owned[i % owned.length], charName: 'x', consecrated: false });
      }
      let doorOpen = true, three = true;
      for (let i = 0; i < 4000; i++) {
        const dealt = MD.GEN.dealCallings(R('unowned' + slots + '|' + i), st.account);
        if (dealt.length !== 3) three = false;
        if (!dealt.some((d) => owned.indexOf(d.calling) < 0)) doorOpen = false;
      }
      ok('R8.7 at legacySlots ' + slots + ' a card is always a Calling with no Legacy owned', doorOpen);
      ok('R8.7 and the deal is still three cards at legacySlots ' + slots, three);
    }
    {
      // when the player owns a Legacy for every Calling there is no door left to hold open, so history fills it
      const st = mkState([]);
      st.account.legacySlots = 3;
      st.account.legacies = Object.keys(MD.CALLINGS).map((k, i) => ({ id: 'L' + i, calling: k, charName: 'x', consecrated: false }));
      const dealt = MD.GEN.dealCallings(R('allowned'), st.account);
      eq('R8.7 an account owning every Calling is dealt three Legacies', dealt.filter((d) => d.legacy).length, 3);
    }
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
    /* R13.3: at the boss a ROUND is a stage for EVERY [stage] counter, rerollStage included. There is no
     * exception: carving it out gave one player facing word two meanings, and the affix pricing problem it was
     * solving is solved with a PRICE (R6.11: the Charm is 6 points, not 3). */
    const g = mkChar('g', { calling: 'gambler' });
    const st = mkState([g, mkChar('b')]);
    const stage = bossStage(1, [{ name: 'A', stat: 'might', tn: 20, hp: 9, maxHp: 9, broken: false }]);
    MD.SIM.startQuest(st, R('fightreroll'), synthQuest(1, [stage]), ['g', 'b']);
    st.quest.step = 'bossAssign';
    MD.SIM.bossAssign(st, { targets: { g: 0, b: 0 } });
    st.quest.rerollUsed[g.id] = 1;
    MD.SIM.bossRound(st, R('fr'));
    eq('R13.3 the reroll is available again in the next round of the same fight', st.quest.rerollUsed[g.id], undefined);
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
    /* R7.0 THE FOURTH ASPECT IS DORMANT (audit; what ships until Director call 1 is answered). Without it,
     * four Aspects of 21 hit points against three bodies at a Strike of 3 gave 0 wins in 200 quests with 600
     * of 600 characters dead. A dormant Aspect cannot be assigned, deals nothing and STRIKES NOTHING, and it
     * wakes the instant an Aspect breaks, so three bodies always face exactly three. */
    for (const d of [4, 5]) {
      const q = MD.GEN.newQuest('dormant' + d, d);
      const last = q.stages[q.stages.length - 1];
      eq('R7.1 Depth ' + d + ' still ships four Aspects', last.aspects.length, 4);
      eq('R7.0 and exactly one of them is dormant', last.aspects.filter((a) => a.dormant).length, 1);
      eq('R7.0 the dormant one is the fourth', last.aspects[3].dormant, true);
    }
    for (const d of [1, 2, 3]) {
      const q = MD.GEN.newQuest('nodormant' + d, d);
      const last = q.stages[q.stages.length - 1];
      eq('R7.0 Depth ' + d + ' has nothing dormant', last.aspects.filter((a) => a.dormant).length, 0);
    }
    // a dormant Aspect cannot be assigned
    const a = mkChar('a'), b = mkChar('b'), c = mkChar('c');
    const st = mkState([a, b, c]);
    const stage = bossStage(1, [
      { name: 'One', stat: 'might', tn: 3, hp: 1, maxHp: 1, broken: false, dormant: false },
      { name: 'Two', stat: 'grace', tn: 30, hp: 9, maxHp: 9, broken: false, dormant: false },
      { name: 'Three', stat: 'wits', tn: 30, hp: 9, maxHp: 9, broken: false, dormant: false },
      { name: 'Four', stat: 'nerve', tn: 30, hp: 9, maxHp: 9, broken: false, dormant: true }]);
    MD.SIM.startQuest(st, R('dorm'), synthQuest(4, [stage]), ['a', 'b', 'c']);
    st.quest.step = 'bossAssign';
    let threw = false;
    try { MD.SIM.bossAssign(st, { targets: { a: 3, b: 1, c: 2 } }); } catch (e) { threw = true; }
    ok('R7.0 a dormant Aspect refuses an assignment', threw);
    // breaking one wakes exactly one dormant Aspect
    const rng = R('dormroll');
    let guard = 0;
    while (!stage.aspects[0].broken && guard++ < 20) {
      st.quest.step = 'bossAssign';
      MD.SIM.bossAssign(st, { targets: { a: 0, b: 1, c: 2 } });
      MD.SIM.bossRound(st, rng);
      if (!MD.SIM.livingParty(st).length) break;
    }
    ok('R7.0 the first Aspect broke', stage.aspects[0].broken, 'hp ' + stage.aspects[0].hp);
    eq('R7.0 and the fourth Aspect woke', stage.aspects[3].dormant, false);
    eq('R7.0 so three Aspects still stand', stage.aspects.filter((x) => !x.broken && !x.dormant).length, 3);
  }
  {
    // R7.0: a dormant Aspect STRIKES NOTHING (it is not the "Aspect nobody faced" that hits everyone)
    const bal = MD.makeBalance({ STRIKE: [3, 3, 3, 3, 3] });
    MD.useBalance(bal);
    const a = mkChar('a'), b = mkChar('b'), c = mkChar('c');
    const st = mkState([a, b, c]);
    const stage = bossStage(1, [
      { name: 'One', stat: 'might', tn: 20, hp: 9, maxHp: 9, broken: false, dormant: false },
      { name: 'Two', stat: 'grace', tn: 20, hp: 9, maxHp: 9, broken: false, dormant: false },
      { name: 'Three', stat: 'wits', tn: 20, hp: 9, maxHp: 9, broken: false, dormant: false },
      { name: 'Four', stat: 'nerve', tn: 20, hp: 9, maxHp: 9, broken: false, dormant: true }]);
    MD.SIM.startQuest(st, R('dormstrike'), synthQuest(4, [stage]), ['a', 'b', 'c']);
    st.quest.step = 'bossAssign';
    MD.SIM.bossAssign(st, { targets: { a: 0, b: 1, c: 2 } });
    MD.SIM.bossRound(st, R('dormstrikeroll'));
    eq('R7.0 a dormant Aspect strikes nobody', a.strain, 3);
    MD.useBalance(null);
  }
  {
    /* R7.4 `spread` lands each point as its OWN instance, which is what makes a Vanguard immune to the boss and
     * kills through Unkillable one point at a time. Measured at a Strike of 3, where the two readings differ. */
    const bal = MD.makeBalance({ STRIKE_TARGET: 'spread', STRIKE: [3, 3, 3, 3, 3] });
    MD.useBalance(bal);
    const v = mkChar('v', { calling: 'vanguard' });
    const st = mkState([v]);
    const stage = bossStage(1, [{ name: 'A', stat: 'might', tn: 20, hp: 9, maxHp: 9, broken: false }]);
    MD.SIM.startQuest(st, R('spreadvg'), synthQuest(1, [stage]), ['v']);
    st.quest.step = 'bossAssign';
    MD.SIM.bossAssign(st, { targets: { v: 0 } });
    MD.SIM.bossRound(st, R('spreadvgroll'));
    eq('R7.4 spread: a Vanguard takes nothing, one point at a time', v.strain, 0);
    const u = mkChar('u', { strain: 1, traits: ['unkillable'] });
    const st2 = mkState([u]);
    const stage2 = bossStage(1, [{ name: 'A', stat: 'might', tn: 20, hp: 9, maxHp: 9, broken: false }]);
    MD.SIM.startQuest(st2, R('spreaduk'), synthQuest(1, [stage2]), ['u']);
    st2.quest.step = 'bossAssign';
    MD.SIM.bossAssign(st2, { targets: { u: 0 } });
    MD.SIM.bossRound(st2, R('spreadukroll'));
    eq('R7.4 spread: Unkillable stops the run one point short', u.strain, MD.effToughness(u) - 1);
    eq('R7.4 spread: and the character is alive to see it', u.alive, true);
    MD.useBalance(null);
  }
  {
    /* R13.8: a character whose Toll fee would reach Toughness cannot be assigned to the Toll ("Cannot pay"),
     * and if no living character can pay it the Toll is FORFEIT. Push has exactly this guard; the Toll is the
     * other self paid cost, and without it a character at Toughness minus 1 died the instant assignment locked,
     * before any roll, and the slot then resolved as noActor. */
    const hurt = mkChar('h', { strain: 3 }), well = mkChar('w');
    const st = mkState([hurt, well, mkChar('x')]);
    const q = synthQuest(1, [synthStage(1, [slotOf('toll', ['might'], [3]), slotOf('gate', ['grace'], [4])], 1)]);
    const rng = R('toll');
    MD.SIM.startQuest(st, rng, q, ['h', 'w', 'x']);
    eq('R13.8 a character one under Toughness cannot pay the Toll', MD.SIM.canPayToll(st, hurt, 1), false);
    eq('R13.8 a rested one can', MD.SIM.canPayToll(st, well, 1), true);
    let threw = false;
    try { MD.SIM.assign(st, { slots: [{ chars: ['h'] }, { chars: ['w'] }], bench: 'x' }); } catch (e) { threw = true; }
    ok('R13.8 assigning the Toll to a character who cannot pay is refused', threw);
    eq('R13.8 and nobody died on assignment', hurt.alive, true);
    // nobody can pay: the Toll is FORFEIT and the stage still resolves
    const h2 = mkChar('h2', { strain: 3 });
    const st2 = mkState([h2]);
    const q2 = synthQuest(1, [synthStage(1, [slotOf('toll', ['might'], [3])], 1)]);
    const rng2 = R('toll2');
    MD.SIM.startQuest(st2, rng2, q2, ['h2']);
    eq('R13.8 no living character can pay', MD.SIM.anyCanPayToll(st2, 1), false);
    MD.SIM.assign(st2, MD.SIM.policy.assign(st2));
    eq('R13.8 so the policy forfeits the Toll', st2.quest.assign.slots[0], null);
    eq('R13.8 and the holder lives', h2.alive, true);
  }
  {
    /* R2.1 the free STAT reroll (audit): three on a new account, beside the three free creations. Measured over
     * 400,000 fresh parties, 4.4 percent of new players roll a character whose four stats are ALL d4 with no
     * way to replace it, and 54.1 percent never see a d12 in their whole first party. */
    const st = MD.SIM.newGame(21);
    eq('R2.1 a new account starts with three free stat rerolls', st.account.freeRerolls, 3);
    const rng = R('rerollstats');
    const ch = MD.SIM.addCharacter(st, rng, {});
    const before = JSON.stringify(ch.stats), renown0 = st.account.renown;
    let moved = false;
    for (let i = 0; i < 3; i++) {
      const r = MD.SIM.rerollStats(st, rng, ch);
      ok('R2.1 a free reroll is taken', r.ok === true, JSON.stringify(r));
      if (JSON.stringify(ch.stats) !== before) moved = true;
    }
    ok('R2.1 a reroll redraws the four stats', moved);
    eq('R2.1 and it costs no Renown', st.account.renown, renown0);
    eq('R2.1 three, and then no more', st.account.freeRerolls, 0);
    eq('R2.1 the fourth is refused', MD.SIM.rerollStats(st, rng, ch).ok, false);
    // R8.6: the creation floor still holds after a reroll
    const st2 = MD.SIM.newGame(22);
    st2.account.creationFloors = { might: 8, grace: 8, wits: 8, nerve: 8 };
    const rng2 = R('rerollfloor');
    const ch2 = MD.SIM.addCharacter(st2, rng2, {});
    MD.SIM.rerollStats(st2, rng2, ch2);
    ok('R8.6 the creation floor still holds after a reroll',
      MD.STATS.every((s) => ch2.stats[s] >= 8), JSON.stringify(ch2.stats));
    // a character that has survived a quest is not a card on the creation screen any more
    ch2.questsSurvived = 1;
    st2.account.freeRerolls = 3;
    eq('R2.1 a veteran cannot be rerolled', MD.SIM.rerollStats(st2, rng2, ch2).ok, false);
  }
  {
    /* R8.0b: EVERY Renown price in R8.1 carries the price index, the R5.10 mid quest Recruit included, or the
     * 25 Renown that brakes the Recruit farms erodes to nothing exactly where the farm is richest. R8.0: the
     * roster count is LIVING characters only. */
    const st = MD.SIM.newGame(23);
    MD.SIM.seedRoster(st, R('midrecruit'), 3);
    st.account.rosterSlots = 8;
    st.account.deepestCompleted = 5;
    st.account.renown = 1000;
    const rng = R('midrecruit2');
    const ids = st.roster.map((c) => c.id);
    MD.SIM.startQuest(st, rng, synthQuest(4, [synthStage(1, [slotOf('gate', ['might'], [4])], 1)]), ids);
    MD.SIM.byId(st, ids[0]).alive = false;                 // two living deployed, so R5.10 opens
    const before = st.account.renown;
    const r = MD.SIM.replace(st, rng, { recruit: true });
    ok('R5.10 a mid quest Recruit is offered', r.ok === true, JSON.stringify(r));
    eq('R8.0b and it costs the indexed price at Depth V, not a flat 25', before - st.account.renown, 125);
    eq('R8.0b which is what the Hall door charges too', MD.SIM.hall.recruitCost(st), 125);
    // R8.0: the living roster cap holds on the mid quest door too
    const st2 = MD.SIM.newGame(24);
    MD.SIM.seedRoster(st2, R('midcap'), 3);
    st2.account.rosterSlots = 3;
    st2.account.renown = 1000;
    const rng2 = R('midcap2');
    const ids2 = st2.roster.map((c) => c.id);
    MD.SIM.startQuest(st2, rng2, synthQuest(1, [synthStage(1, [slotOf('gate', ['might'], [4])], 1)]), ids2);
    MD.SIM.byId(st2, ids2[0]).alive = false;
    st2.roster.push(mkChar('spare1'), mkChar('spare2'));    // three living, at the cap
    eq('R8.0 a mid quest Recruit refuses at the living roster cap',
      MD.SIM.replace(st2, rng2, { recruit: true }).reason, 'roster full');
  }
  {
    /* R3.4 Armor is a STAGE currency: the pool refills on the bench and NOWHERE else. The pair of negatives is
     * what makes the 2 point and the 3 point Chest affixes different things (R7.4: no Respite, no bench, no
     * Armor refill at the boss), so both halves are measured, not just the refill. */
    const a = mkChar('a', { gear: { chest: gearItem('chest', [aff('armor', [{ k: 'armor', v: 2 }], 4)]) } });
    const b = mkChar('b'), c = mkChar('c');
    const st = mkState([a, b, c]);
    const q = synthQuest(1, [synthStage(1, [slotOf('gate', ['might'], [4]), slotOf('gate', ['grace'], [4])], 1),
      synthStage(2, [slotOf('gate', ['might'], [4])], 1)]);
    const rng = R('armorrespite');
    MD.SIM.startQuest(st, rng, q, ['a', 'b', 'c']);
    eq('R3.4 the pool is full at quest start', a.armorPool, 2);
    MD.SIM.applyStrain(st, a, 2, {});
    eq('R3.4 and Armor absorbed the instance', a.armorPool, 0);
    MD.SIM.assign(st, { slots: [{ chars: ['a'] }, { chars: ['b'] }], bench: 'c' });   // a is NOT the bench
    MD.SIM.resolveNext(st, rng);
    MD.SIM.resolveNext(st, rng);
    a.strain = 1; a.armorPool = 0;                                  // read the Respite alone, not the checks
    MD.SIM.endStage(st, rng);
    eq('R3.4 a Respite clears Strain', a.strain, 0);
    eq('R3.4 but a Respite does not refill the Armor pool', a.armorPool, 0);
    // and no boss round refills it either
    const v = mkChar('v', { gear: { chest: gearItem('chest', [aff('armor', [{ k: 'armor', v: 2 }], 4)]) } });
    const st2 = mkState([v, mkChar('b2')]);
    const stage = bossStage(1, [{ name: 'A', stat: 'might', tn: 20, hp: 40, maxHp: 40, broken: false }]);
    const rng2 = R('armorboss');
    MD.SIM.startQuest(st2, rng2, synthQuest(1, [stage]), ['v', 'b2']);
    st2.quest.step = 'bossAssign';
    let rose = false;
    for (let round = 0; round < 2; round++) {
      const seen = v.armorPool;
      MD.SIM.bossAssign(st2, { targets: { v: 0, b2: 0 } });
      MD.SIM.bossRound(st2, rng2);
      if (v.armorPool > seen) rose = true;
    }
    ok('R3.4 the Armor pool never rises between boss rounds', !rose);
    // a sealed stage repeat does not refill it either (R9.1)
    const w = mkChar('w', { gear: { chest: gearItem('chest', [aff('armor', [{ k: 'armor', v: 2 }], 4)]) } });
    const st3 = mkState([w]);
    const sealed = synthStage(3, [slotOf('vault', [null], [7], { sealed: true })], 1, { sealed: true });
    const rng3 = R('armorsealed');
    MD.SIM.startQuest(st3, rng3, synthQuest(4, [sealed]), ['w']);
    w.armorPool = 0;
    MD.SIM.assign(st3, { slots: [{ chars: ['w'], stat: 'might' }], bench: null });
    MD.SIM.resolveNext(st3, rng3);
    if (st3.quest && !st3.quest.over) MD.SIM.endStage(st3, rng3);
    eq('R9.1 a sealed repeat does not refill the Armor pool either', w.armorPool, 0);
  }
  {
    /* The policy's estimator and the resolver must read the SAME roll context. probFor dropped surgeOnce (the
     * Hollow Air Ward's one surge) and, before R1.3 was restored, floorPlus as well, so the policy assigned and
     * Pushed against a number that could be wrong by half. */
    const ch = mkChar('e', { origin: 'ironbound', calling: 'cutpurse', traits: ['surehanded', 'steady'],
      stats: { might: 8, grace: 8, wits: 8, nerve: 8 },
      gear: { head: gearItem('head', [aff('floorHalf', [{ k: 'floor', stat: 'might', v: 'half' }], 2, 'might')]) } });
    const st = mkState([ch, mkChar('f'), mkChar('g')]);
    const q = synthQuest(1, [synthStage(1, [slotOf('gate', ['might'], [5])], 1)], ['hollowAir']);
    MD.SIM.startQuest(st, R('estimator'), q, ['e', 'f', 'g']);
    const o = MD.SIM.checkContext(st, ch, { stat: 'might', tn: 5, shape: 'gate' });
    const p = MD.passProb(o.die, 5, { surgeMinus: o.surgeMinus, floor: o.floor, flat: o.flat, push: o.push,
      twice: o.twice, reroll1s: o.reroll1s, noSurge: o.noSurge, surgeOnce: o.surgeOnce });
    const rng = MD.makeRng(MD.seedFromString('estimatorroll'));
    let hits = 0;
    const N = 60000;
    for (let i = 0; i < N; i++) {
      const ctx = MD.SIM.checkContext(st, ch, { stat: 'might', tn: 5, shape: 'gate' });
      ctx.rng = rng;
      if (MD.roll(ctx.die, ctx).total >= 5) hits++;
    }
    near('R1 the estimator and the resolver agree on a character carrying every roll time effect',
      hits / N, p, 0.01);
  }
  {
    /* R5.3 / R5.8 / R9.2: the policy scores from what the PLAYER can see. Under Blindness or the blindfold
     * Sigil the TN is hidden, and the estimate must be the pass probability averaged over the PUBLISHED prior
     * (GATE_TN_WEIGHTS for a Gate), never the true number. Resolution still uses the true TN. */
    const ch = mkChar('p'), st = mkState([ch, mkChar('q'), mkChar('r')]);
    const q = synthQuest(1, [synthStage(1, [slotOf('gate', ['might'], [6])], 1)], ['blindfold']);
    MD.SIM.startQuest(st, R('hidden'), q, ['p', 'q', 'r']);
    eq('R9.2 the blindfold hides the TN', MD.SIM.tnVisible(st, ch), false);
    const w = MD.BALANCE.GATE_TN_WEIGHTS;
    let tot = 0, acc = 0;
    for (const k of Object.keys(w)) { tot += w[k]; acc += w[k] * MD.passProb(8, +k, {}); }
    near('R5.3 a hidden Gate is scored against the published TN prior',
      MD.SIM.policy.probFor(st, ch, 'might', 6, 'gate'), acc / tot, 1e-9);
    ok('R5.3 and that is not the true TN 6 number',
      Math.abs(MD.SIM.policy.probFor(st, ch, 'might', 6, 'gate') - MD.passProb(8, 6, {})) > 0.02);
    // with the TN visible the estimate is exact again
    const q2 = synthQuest(1, [synthStage(1, [slotOf('gate', ['might'], [6])], 1)], []);
    const st2 = mkState([mkChar('p'), mkChar('q'), mkChar('r')]);
    MD.SIM.startQuest(st2, R('visible'), q2, ['p', 'q', 'r']);
    near('R5.3 a visible Gate is scored against its own TN',
      MD.SIM.policy.probFor(st2, MD.SIM.byId(st2, 'p'), 'might', 6, 'gate'), MD.passProb(8, 6, {}), 1e-9);
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
 *   node sim.js --grid [--sample=N] [--accounts=N] [--questsPer=N] [--jobs=N] [--depth=D]
 *                       [--maxRounds=N] [--json=PATH] [--over=KEY=VAL]
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

/* Every seed in the grid is built from this key, so the Depth belongs in it: without it
 * `--grid --depth=1` and `--grid --depth=2` draw the SAME RNG streams for corresponding quests and a
 * depth over depth comparison is correlated in a way the printed "seeds are named per cell" line denies. */
function cellKey(c) { return c.depth + '|' + c.tough + '|' + c.target + '|' + c.strike + '|' + c.respite; }
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
  var S = MD.SIM, P = S.policy, guard = 0, stalled = false, preDeaths = null, preLiving = 0, repl = 0;
  S.startQuest(state, rng, questDef, partyIds);
  while (state.quest && !state.quest.over && guard++ < 20000) {
    var q = state.quest;
    /* R7.4 has no round cap and neither does the engine. At STRIKE 1 a character carrying strikeLess 1
     * (R4.9 Vanguard, or the 3 point Chest affix) takes 0 from every Strike, and under Hollow Air a die that
     * cannot reach an Aspect's TN passes with probability 0, so a lone immortal survivor can face an
     * unbreakable Aspect for ever. The harness stops such a fight at maxRounds and counts it. */
    if (q.step === 'bossAssign' && q.round >= maxRounds) { stalled = true; break; }
    /* RULES' own reading of spec 8.6 (R7.4): "a harness that asserts the PRE BOSS numbers against 8.6 (which
     * they match) and REPORTS the whole quest numbers rather than failing on them". So the deaths are split at
     * the door of the boss and both halves are printed. */
    if (preDeaths === null && (q.step === 'bossAssign' || q.step === 'bossCheck')) {
      preDeaths = q.deaths.length;
      preLiving = S.livingParty(state).length;
    }
    if (q.step === 'assign') S.assign(state, P.assign(state));
    else if (q.step === 'check') S.resolveNext(state, rng);
    else if (q.step === 'stageEnd') { P.takeDrops(state, rng); repl += P.replace(state, rng).length; S.endStage(state, rng); }
    else if (q.step === 'bossAssign') S.bossAssign(state, P.boss(state));
    else if (q.step === 'bossCheck') S.resolveBossCheck(state, rng);
    else if (q.step === 'strike') S.bossStrike(state, rng);
    else if (q.step === 'bossWon') { P.takeDrops(state, rng); S.endStage(state, rng); }
    else break;
  }
  /* `living` starts at -1, never 0: a quest whose state was cleared before the harness could read it would
   * otherwise arrive at tally() looking exactly like a full wipe, which is a plausible number and not a crash. */
  var m = { party: partyIds.length, bodies: partyIds.length, living: -1, stagePass: 0, stageChecks: 0,
    bossPass: 0, bossChecks: 0, reachedBoss: false, rounds: 0, stalled: stalled, deadlock: false,
    repl: repl, preDeaths: 0, preWipe: false };
  var qq = state.quest;
  if (qq && stalled) m.deadlock = deadlocked(state);
  if (qq) {
    m.bodies = qq.party.length;                                  // R5.10 replacements are character quests too
    m.preDeaths = preDeaths === null ? qq.deaths.length : preDeaths;
    m.preWipe = (preDeaths === null ? MD.SIM.livingParty(state).length : preLiving) === 0;
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

/* Every rate the grid stars is a RATIO of two sums, and both sums are correlated inside a cluster: in FRESH
 * the cluster is the quest (three characters share one quest's dice), in ACCOUNT it is the whole account (gear,
 * Traits, Scars and Renown carry across all 25 quests, and one bad wipe locks an account into short parties for
 * the rest of its life). A naive binomial standard error understates the ACCOUNT numbers by a factor of five,
 * so the harness carries per cluster sums and reports the cluster robust ratio SE beside every scored number.
 * A `*` is only printed when the estimate misses the band by MORE THAN ONE SE, so a mark means something. */
function newCluster() {
  return { q: 0, bodies: 0, deaths: 0, one: 0, wipes: 0, wipeDen: 0, ren: 0, mar: 0,
    preDeaths: 0, preOne: 0, preWipes: 0, career: 0, careerN: 0 };
}
function newAcc() {
  return { quests: 0, charQuests: 0, deaths: 0, atLeastOne: 0, wipes: 0, wipeDen: 0, shortParty: 0, wins: 0,
    preDeaths: 0, preAtLeastOne: 0, preWipes: 0, repl: 0,
    renownReward: 0, renownAll: 0, marrow: 0, stagePass: 0, stageChecks: 0, bossPass: 0, bossChecks: 0,
    bossQuests: 0, rounds: 0, careers: 0, careerN: 0, censored: 0, noParty: 0, stalls: 0, deadlocks: 0,
    cl: [], cur: null };
}
function clusterOpen(acc) { acc.cur = newCluster(); }
function clusterClose(acc) { if (acc.cur) { acc.cl.push(acc.cur); acc.cur = null; } }
function tally(acc, m, dRen, dMarrow) {
  if (m.living < 0) throw new Error('quest state was cleared before the harness could read it');
  var cu = acc.cur || (acc.cur = newCluster());
  var deaths = m.summary.deaths.length;
  acc.quests++; acc.charQuests += m.bodies; acc.repl += m.repl;
  cu.q++; cu.bodies += m.bodies;
  acc.deaths += deaths; cu.deaths += deaths;
  if (deaths) { acc.atLeastOne++; cu.one++; }
  acc.preDeaths += m.preDeaths; cu.preDeaths += m.preDeaths;
  if (m.preDeaths) { acc.preAtLeastOne++; cu.preOne++; }
  /* A wipe is "every deployed body dead", and the spec's 8 percent is about a PARTY. Counting a solo
   * deployment's single death as a wipe read 22.01 percent where the three body number was 1.30, because a
   * quarter of ACCOUNT quests deploy fewer than three bodies (the account cannot afford a Recruit). The short
   * deployments are surfaced as their own event instead of being hidden inside the wipe column. */
  if (m.party >= MD.balance().PARTY_SIZE) {
    acc.wipeDen++; cu.wipeDen++;
    if (m.living === 0) { acc.wipes++; cu.wipes++; }
    if (m.preWipe) { acc.preWipes++; cu.preWipes++; }         // the same denominator, so the two read together
  } else acc.shortParty++;
  if (m.summary.won) acc.wins++;
  acc.renownReward += m.summary.renown - m.summary.salvage;
  acc.renownAll += dRen; acc.marrow += dMarrow;
  cu.ren += dRen; cu.mar += dMarrow;
  acc.stagePass += m.stagePass; acc.stageChecks += m.stageChecks;
  acc.bossPass += m.bossPass; acc.bossChecks += m.bossChecks;
  if (m.reachedBoss && !m.stalled) { acc.bossQuests++; acc.rounds += m.rounds; }  // a capped fight is not a fight length
  if (m.stalled) acc.stalls++;
  if (m.deadlock) acc.deadlocks++;
}
function ratioSE(cl, numKey, denKey) {
  var n = cl.length, sn = 0, sd = 0, i;
  for (i = 0; i < n; i++) { sn += cl[i][numKey]; sd += cl[i][denKey]; }
  if (!sd || n < 2) return 0;
  var p = sn / sd, s = 0;
  for (i = 0; i < n; i++) { var e = cl[i][numKey] - p * cl[i][denKey]; s += e * e; }
  return Math.sqrt(s * n / (n - 1)) / sd;
}
function finish(acc) {
  clusterClose(acc);
  var q = Math.max(1, acc.quests), ch = Math.max(1, acc.charQuests), wd = Math.max(1, acc.wipeDen);
  return { quests: acc.quests, charQuests: acc.charQuests, shortParty: acc.shortParty, repl: acc.repl / q,
    death: acc.deaths / ch, atLeastOne: acc.atLeastOne / q, wipe: acc.wipes / wd, win: acc.wins / q,
    preDeath: acc.preDeaths / ch, preAtLeastOne: acc.preAtLeastOne / q, preWipe: acc.preWipes / wd,
    renown: acc.renownReward / q, renownAll: acc.renownAll / q, marrow: acc.marrow / q,
    seDeath: ratioSE(acc.cl, 'deaths', 'bodies'), seOne: ratioSE(acc.cl, 'one', 'q'),
    seWipe: ratioSE(acc.cl, 'wipes', 'wipeDen'), sePreDeath: ratioSE(acc.cl, 'preDeaths', 'bodies'),
    sePreOne: ratioSE(acc.cl, 'preOne', 'q'), sePreWipe: ratioSE(acc.cl, 'preWipes', 'wipeDen'),
    seRenown: ratioSE(acc.cl, 'ren', 'q'), seMarrow: ratioSE(acc.cl, 'mar', 'q'),
    seCareer: ratioSE(acc.cl, 'career', 'careerN'),
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
    clusterOpen(acc);                                  // FRESH: the cluster is the quest
    var m = playQuestMetered(st, rng, q, st.roster.map(function (c) { return c.id; }), opts.maxRounds);
    tally(acc, m, st.account.renownLifetime - r0, st.account.marrow - m0);
    clusterClose(acc);
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
  for (var id in known) if (known.hasOwnProperty(id) && !live[id]) {
    acc.careers += known[id]; acc.careerN++;
    if (acc.cur) { acc.cur.career += known[id]; acc.cur.careerN++; }
  }
}
function runAccounts(cell, opts) {
  var key = cellKey(cell), acc = newAcc(), B = MD.balance();
  for (var a = 0; a < opts.accounts; a++) {
    var st = MD.SIM.newGame(a);
    var rng = MD.makeRng(MD.seedFromString('acct|' + key + '|' + a));
    MD.SIM.seedRoster(st, rng, B.PARTY_SIZE);
    clusterOpen(acc);                                 // ACCOUNT: the cluster is the whole account
    var known = snapshot(st);
    for (var k = 0; k < opts.questsPer; k++) {
      MD.SIM.policy.hall(st, rng);
      departures(st, known, acc);                     // retirements happen in the Hall
      var party = MD.SIM.policy.party(st);
      if (!party.length) { acc.noParty++; break; }    // R8.0 THE STRAY should make this unreachable
      known = snapshot(st);
      var q = MD.GEN.newQuest('acctq|' + key + '|' + a + '|' + k, cell.depth);
      var m = playQuestMetered(st, rng, q, party, opts.maxRounds);
      tally(acc, m, 0, 0);                            // income is counted whole per account, below
      departures(st, known, acc);                     // deaths leave the roster at endQuest
      known = snapshot(st);
    }
    /* Income is read off the ACCOUNT, not off the quest summary. A retirement pays its Marrow in the Hall
     * BETWEEN quests (R2.6) and the gear of the retired reaches the drop screen there (R6.7), so a per quest
     * window counts deaths and misses every retirement, which is where nearly all the Marrow actually is.
     * One last Hall closes the books on the quests just played. */
    /* Read the censored careers BEFORE the closing Hall: policy.hall recruits while fewer than PARTY_SIZE can
     * deploy, so on an account that ended in a wipe it mints brand new bodies with questsSurvived 0 and every
     * one of them would be counted as a career "still running". */
    var stillRunning = st.roster.filter(function (c) { return c.questsSurvived > 0; }).length;
    MD.SIM.policy.hall(st, rng);
    departures(st, known, acc);
    acc.renownAll += st.account.renownLifetime;
    acc.marrow += st.account.marrow;
    if (acc.cur) { acc.cur.ren += st.account.renownLifetime; acc.cur.mar += st.account.marrow; }
    acc.censored += stillRunning;                     // careers still running when the account stops
    clusterClose(acc);
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

/* Which half of the quest a table SCORES. RULES R7.4 settles the FRESH table: "section 8.6 was never a whole
 * quest number, and the boss was never costed", and what ships is "a harness that asserts the PRE BOSS numbers
 * against 8.6 (which they match) and REPORTS the whole quest numbers rather than failing on them". So FRESH
 * stars its PRE BOSS columns. The ACCOUNT table is the tuning brief's own experiment ("the ACCOUNT experiment
 * over quests 1 to 25 at Depth I"), so it stars the WHOLE QUEST columns, and prints its pre boss pair beside
 * them unstarred. Every star is a miss by MORE THAN ONE cluster robust standard error. */
function markSE(v, r, se) {
  if (inRange(v, r)) return ' ';
  var off = v < r[0] ? r[0] - v : v - r[1];
  return off > (se || 0) ? '*' : '~';                 // ~ : outside the band but inside one SE, so it is noise
}
function hitSE(v, r, se) { return inRange(v, r) || (v < r[0] ? r[0] - v : v - r[1]) <= (se || 0); }
function tableFor(rows, which, opts) {
  var isAcct = which === 'acct';
  var head = ['T', 'target', 'STK', 'RSP', 'death/char', '1+ death', 'wipe', 'death pre', '1+ pre', 'wipe pre',
    'win', 'stall', 'short', 'repl', 'Renown all', 'of which reward', 'Marrow'];
  if (isAcct) { head.push('career'); head.push('cens'); }
  head = head.concat(['chk pre', 'chk boss', 'rounds', 'hits']);
  var out = [];
  out.push('| ' + head.join(' | ') + ' |');
  out.push('|' + head.map(function () { return '---'; }).join('|') + '|');
  var tgt = ['*', 'spec target', '', '',
    isAcct ? '12 to 15%' : '', isAcct ? 'about 35%' : '', isAcct ? 'about 8%' : '',
    isAcct ? '' : '12 to 15%', isAcct ? '' : 'about 35%', isAcct ? '' : 'about 8%',
    '', '0', 'low', '', 'about 35', '', isAcct ? 'about 1.5' : '0 by law'];
  if (isAcct) { tgt.push('4 to 7'); tgt.push('low'); }
  tgt = tgt.concat(['70 to 75%', '', '', isAcct ? '6' : '4']);
  out.push('| ' + tgt.join(' | ') + ' |');
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i], d = r[which], c = r.cell, hits = 0;
    var dth = isAcct ? d.death : d.preDeath, seD = isAcct ? d.seDeath : d.sePreDeath;
    var one = isAcct ? d.atLeastOne : d.preAtLeastOne, seO = isAcct ? d.seOne : d.sePreOne;
    var wp = isAcct ? d.wipe : d.preWipe, seW = isAcct ? d.seWipe : d.sePreWipe;
    if (hitSE(dth, TARGETS.death, seD)) hits++;
    if (hitSE(one, TARGETS.atLeastOne, seO)) hits++;
    if (hitSE(wp, TARGETS.wipe, seW)) hits++;
    if (hitSE(d.renownAll, TARGETS.renown, d.seRenown)) hits++;
    if (isAcct && hitSE(d.career, TARGETS.career, d.seCareer)) hits++;
    if (isAcct && hitSE(d.marrow, TARGETS.marrow, d.seMarrow)) hits++;   // FRESH cannot pay Marrow at all (R8.5)
    function cell(v, rng2, se, scored, fmt) {
      var s = fmt(v);
      if (!scored) return s;
      return s + ' (' + fmt(se).replace('%', '') + ')' + markSE(v, rng2, se);
    }
    var P = function (x) { return pct(x) + '%'; }, F1 = function (x) { return x.toFixed(1); },
      F2 = function (x) { return x.toFixed(2); };
    var line = ['' + c.tough, c.target, '' + c.strike, '' + c.respite,
      cell(d.death, TARGETS.death, d.seDeath, isAcct, P),
      cell(d.atLeastOne, TARGETS.atLeastOne, d.seOne, isAcct, P),
      cell(d.wipe, TARGETS.wipe, d.seWipe, isAcct, P),
      cell(d.preDeath, TARGETS.death, d.sePreDeath, !isAcct, P),
      cell(d.preAtLeastOne, TARGETS.atLeastOne, d.sePreOne, !isAcct, P),
      cell(d.preWipe, TARGETS.wipe, d.sePreWipe, !isAcct, P),
      pct(d.win) + '%',
      pct(d.stall) + '%' + (d.stalls ? '*' : ' '),
      pct(d.shortParty / Math.max(1, d.quests)) + '%',
      d.repl.toFixed(2),
      cell(d.renownAll, TARGETS.renown, d.seRenown, true, F1),
      d.renown.toFixed(1),
      isAcct ? cell(d.marrow, TARGETS.marrow, d.seMarrow, true, F2) : d.marrow.toFixed(2) + ' '];
    if (isAcct) {
      line.push(cell(d.career, TARGETS.career, d.seCareer, true, F2));
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
  console.log('Every scored number carries its CLUSTER ROBUST standard error in brackets: the cluster is the quest');
  console.log('in (A) and the whole ACCOUNT in (B), where gear, Traits, Scars and Renown carry across all quests');
  console.log('(the ACCOUNT design effect on death per character is about 26, so 7,500 quests carry the information');
  console.log('of about 280). A * means the number misses its band by MORE than one SE; a ~ means it misses by less,');
  console.log('which is noise. "hits" counts the targets met or missed by under one SE.');
  console.log('WHICH HALF IS SCORED: (A) FRESH stars its PRE BOSS columns, which is what RULES R7.4 rules spec 8.6');
  console.log('describes ("8.6 was never a whole quest number, and the boss was never costed"); (B) ACCOUNT stars');
  console.log('the WHOLE QUEST columns, which is the experiment the tuning brief names. Each table prints the other');
  console.log('half unstarred beside it. Renown all = reward + salvage (R6.7, R6.8), which is what "mean Renown per');
  console.log('run" means; "of which reward" is the stage and boss half alone. "short" counts quests that deployed');
  console.log('fewer than PARTY_SIZE bodies (the account could not afford a Recruit); "repl" is R5.10 replacements');
  console.log('taken per quest. A wipe is scored over FULL PARTY quests only, so a solo body dying is not a wipe.');
  console.log('');
  console.log('### (A) FRESH, ' + opts.sample.toLocaleString('en-US') + ' quests per cell');
  console.log('');
  console.log(tableFor(rows, 'fresh', opts));
  console.log('');
  console.log('Marrow reads about 0 in every FRESH cell by law, not by accident: R8.5 pays the full rate only for a');
  console.log('PROVEN character, and every character in this experiment is on its first quest (an unproven death');
  console.log('pays the flat 1 at Depth I to III, 0 at IV and V). Marrow is a (B) number and is not starred here.');
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


/* ============================ --depths ============================
 * R7.4's LAW, in its own words: "sim.js --depths asserts winnability as a LAW at every Depth: over 200 quests
 * with the policy from a rested roster, the win rate at each of II to V is between 25 and 75 percent, naming
 * the Depth that failed. Not 'above zero', which one win in two hundred satisfies: that is the fleet's own
 * scar, a probe that cannot meaningfully fail, standing guard over the single most broken number in the design."
 *
 * "A rested roster" is read as the roster a player ARRIVES at that Depth with, not a tier one party teleported
 * there: the account plays its way up through R8.4's own unlock ladder (3 wins at I, 7 more at II, 15 more at
 * III, 25 more at IV), using R8.4's "or one shallower" lane when the deepest unlocked Depth stops paying, and
 * only then are the measured quests played. Anything else measures a roster the game never deals.
 */
function warmTo(st, rng, depth, opts) {
  var guard = 0, recent = {}, playedAt = 0;
  while (MD.SIM.unlockedDepths(st).slice(-1)[0] < depth && guard++ < opts.warmCap) {
    MD.SIM.policy.hall(st, rng);
    var party = MD.SIM.policy.party(st);
    if (!party.length) break;                                  // R8.0 THE STRAY should make this unreachable
    var deepest = MD.SIM.unlockedDepths(st).slice(-1)[0];
    /* A legible player: play the deepest unlocked Depth, and drop one shallower (which R8.4 still counts) when
     * the last five runs there were losses. */
    var at = deepest;
    var r = recent[deepest] || [];
    if (deepest > 1 && r.length >= 5 && r.slice(-5).indexOf(1) < 0) at = deepest - 1;
    var q = MD.GEN.newQuest('warm|' + depth + '|' + st.account.seed + '|' + guard, at);
    var m = playQuestMetered(st, rng, q, party, opts.maxRounds);
    (recent[at] = recent[at] || []).push(m.summary.won ? 1 : 0);
    playedAt = at;
  }
  return MD.SIM.unlockedDepths(st).slice(-1)[0] >= depth;
}

function depthsRun(d, warm, opts, B) {
  var per = Math.ceil(opts.quests / opts.accounts), acc = newAcc(), missed = 0;
  for (var a = 0; a < opts.accounts; a++) {
    var st = MD.SIM.newGame(a);
    var rng = MD.makeRng(MD.seedFromString('depths|' + (warm ? 'w' : 'f') + '|' + d + '|' + a));
    MD.SIM.seedRoster(st, rng, B.PARTY_SIZE);
    if (warm && d > 1 && !warmTo(st, rng, d, opts)) { missed++; continue; }
    clusterOpen(acc);
    for (var k = 0; k < per; k++) {
      MD.SIM.policy.hall(st, rng);
      var party = MD.SIM.policy.party(st);
      if (!party.length) { acc.noParty++; break; }
      var q = MD.GEN.newQuest('depthsq|' + (warm ? 'w' : 'f') + '|' + d + '|' + a + '|' + k, d);
      tally(acc, playQuestMetered(st, rng, q, party, opts.maxRounds), 0, 0);
    }
    clusterClose(acc);
  }
  var r = finish(acc);
  r.missed = missed;
  return r;
}

function depthsMode() {
  var opts = { quests: flagNum('quests', 200), accounts: flagNum('accounts', 10),
    maxRounds: flagNum('maxRounds', 60), warmCap: flagNum('warmCap', 600), over: parseOverrides() };
  if (Object.keys(opts.over).length) MD.useBalance(MD.makeBalance(opts.over));
  var B = MD.balance();
  console.log('MARROWDEEP winnability, R7.4: the win rate at each of Depths II to V must be between 25 and 75 percent.');
  console.log('  ' + opts.quests + ' quests a Depth over ' + opts.accounts + ' accounts, two rosters a Depth.');
  console.log('  FRESH is R7.4\'s own experiment, the one whose 0 wins in 200 at Depth IV and V wrote R7.0: three');
  console.log('  freshly rolled tier one characters, rested, dropped straight into that Depth. The LAW binds here.');
  console.log('  WARMED is the same Depth played by an account that walked the R8.4 unlock ladder to it (3 wins at');
  console.log('  I, 7 more at II, 15 more at III, 25 more at IV) and kept everything it found. Reported, not asserted:');
  console.log('  nothing in the spec or RULES rules on what a progressed roster should measure, and it is the number');
  console.log('  a real player lives in.');
  console.log('  R7.0 ships the DORMANT fourth Aspect at Depth IV and V, so three bodies always face three Aspects.');
  console.log('  Banks: ' + DATA_SOURCE + '. STRIKE ' + JSON.stringify(B.STRIKE) + ', RESPITE ' + JSON.stringify(B.RESPITE) +
    ', BASE_TOUGHNESS ' + B.BASE_TOUGHNESS + ', ASPECT_HP_BONUS ' + JSON.stringify(B.ASPECT_HP_BONUS) +
    ', target ' + B.STRIKE_TARGET + '.');
  console.log('');
  console.log('  Depth                 FRESH wins  death/char   wipe  |  WARMED wins  death/char   wipe   unreached');
  var bad = [];
  for (var d = 1; d <= 5; d++) {
    var f = depthsRun(d, false, opts, B), w = depthsRun(d, true, opts, B);
    var law = d >= 2 && (f.win < 0.25 || f.win > 0.75 || f.quests === 0);
    if (law) bad.push(B.DEPTH_NAMES[d - 1] + ' (Depth ' + d + '): ' + pct(f.win) + '% wins fresh');
    console.log('  ' + (d + ' ' + B.DEPTH_NAMES[d - 1]).padEnd(16) +
      (pct(f.win) + '%').padStart(11) + (pct(f.death) + '%').padStart(12) + (pct(f.wipe) + '%').padStart(7) + '  | ' +
      (pct(w.win) + '%').padStart(12) + (pct(w.death) + '%').padStart(12) + (pct(w.wipe) + '%').padStart(7) +
      String(w.missed).padStart(12) +
      (law ? '   LAW BROKEN' : (d === 1 ? '   (not banded)' : '')));
  }
  MD.useBalance(null);
  console.log('');
  if (bad.length) {
    console.log('DEPTHS FAILED, R7.4: ' + bad.join('; ') + '.');
    console.log('R7.4 names the ladder: ruling (a) the dormant fourth Aspect ships; if a Depth still does not clear');
    console.log('25 percent, ship ruling (b) as well (an Aspect nobody faced strikes ONE character, the most');
    console.log('strained, party order breaking ties); if neither clears it the Aspect hit points at IV and V are');
    console.log('the lever, which is Director call 1.');
    process.exit(1);
  }
  console.log('DEPTHS OK   every banded Depth wins between 25 and 75 percent of the time');
}

async function gridMode() {
  /* The ACCOUNT experiment's effective sample is the ACCOUNT COUNT, not the quest count: an account is one
   * correlated chain (gear, Traits, Scars and Renown carry across all 25 quests, and one bad wipe locks it into
   * short parties for the rest of its life), and the measured design effect on death per character is about 26,
   * so 300 accounts x 25 quests carried the information of about 280 quests, not 7,500. Standard error scales
   * as 1/sqrt(accounts) and raising questsPer buys almost nothing, so the default is 500 accounts (about 1.0
   * points of SE on ACCOUNT death per character). The SE of every scored number is printed beside it. */
  var opts = { sample: flagNum('sample', 4000), accounts: flagNum('accounts', 500),
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
  var jf = flagVal('json', null);
  if (jf) { require('node:fs').writeFileSync(jf, JSON.stringify({ opts: opts, wallMs: Date.now() - t0, rows: rows }, null, 1)); }
}

/* Two cores, so the default is two workers. A cell is independent and seeded by name, so the grid
 * measures the same numbers at any --jobs. */
function runParallel(cells, opts, t0) {
  return new Promise(function (resolve) {
    var self = __filename;
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
        k.on('exit', function (code) {
          if (done < cells.length && code) { console.log('a grid worker exited with ' + code); process.exit(1); }
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

/* ============================ --data ============================
 * THE CONTENT GATE. It asks two questions the other gates cannot.
 *
 * 1. Does every authored record actually DO something? The authored files say
 *    `effects` and `text`; the engine reads `eff` and `line`. Pasting them
 *    unchanged leaves every unique and every authored Trait silently inert, and
 *    the engine's own guard against unknown effect kinds passes VACUOUSLY,
 *    because it iterates `t.eff || []` and an empty list has no unknown kinds in
 *    it. So this asserts the RELATIONSHIP, at least one compiled effect per
 *    record, and never the spelling.
 * 2. Is the copy law true of the strings the game COMPOSES, not just the ones
 *    somebody typed? Every dash this game can produce enters through a generated
 *    relic name, a generated character name, a wall line or a card template.
 *    tools/lint.mjs reads the banks; only this file can generate.
 *
 * ⛔ The affix keys are checked in BOTH directions. One direction misses half the
 * failures: the prototype once drew `condDead` against a word list named
 * `condDeadAlly`, and separately was missing `benchAlly` altogether, and each of
 * those is invisible to one of the two checks.
 */
function dataMode() {
  const D = MD.data();
  const bad = [];
  const say = (ok, line) => { console.log((ok ? '  ok    ' : '  FAIL  ') + line); if (!ok) bad.push(line); };

  /* the six characters that are a dash, plus the bang */
  const BANNED = /[-‐‑‒–—−!]/;
  const bannedName = (s) => {
    const m = s.match(BANNED);
    return m ? ('U+' + m[0].charCodeAt(0).toString(16).toUpperCase().padStart(4, '0') + ' in ' + JSON.stringify(s.slice(0, 60))) : null;
  };

  /* ---- 1. every bank string obeys the copy law ---- */
  let strings = 0, firstBad = null;
  (function walk(o) {
    if (typeof o === 'string') { strings++; if (!firstBad) { const b = bannedName(o); if (b) firstBad = b; } }
    else if (Array.isArray(o)) o.forEach(walk);
    else if (o && typeof o === 'object') Object.keys(o).forEach(k => walk(o[k]));
  })(D);
  say(!firstBad, 'no dash and no exclamation point in any of the ' + strings + ' bank strings' + (firstBad ? ': ' + firstBad : ''));

  /* ---- 2. every record compiles to at least one effect, in the vocabulary ---- */
  const kinds = MD.EFFECT_KINDS, whens = MD.COND_WHENS;
  function compiles(label, rec) {
    const eff = rec && rec.eff;
    if (!Array.isArray(eff) || !eff.length) { bad.push(label + ' compiles to NO effects (the eff / effects field contract)'); return false; }
    for (const e of eff) {
      if (!kinds[e.k]) { bad.push(label + ' uses unknown effect kind ' + e.k); return false; }
      if (e.k === 'cond' && whens.indexOf(e.when) < 0) { bad.push(label + ' uses unknown cond when ' + e.when); return false; }
    }
    return true;
  }
  const traitIds = Object.keys(D.traits);
  let okRecs = 0;
  traitIds.forEach(id => { if (compiles('trait ' + id, D.traits[id])) okRecs++; });
  D.uniques.forEach(u => { if (compiles('unique ' + u.id, u)) okRecs++; });
  say(okRecs === traitIds.length + D.uniques.length,
    'every authored record compiles to at least one effect in the R12 vocabulary (' + okRecs + ' of ' + (traitIds.length + D.uniques.length) + ')');
  say(traitIds.length === 24, 'the Trait pool is the authored twenty four and not a merge with the seeded twelve (' + traitIds.length + ')');
  const lowered = traitIds.map(s => s.toLowerCase().replace(/_/g, ''));
  say(new Set(lowered).size === lowered.length, 'and no two Trait ids differ only by case or an underscore');

  /* ---- 3. the affix keys, BOTH directions ---- */
  const words = Object.keys(D.relicWords.affix);
  const drawn = Object.keys(MD.AFFIXES);
  const noWords = drawn.filter(k => words.indexOf(k) < 0);
  const noAffix = words.filter(k => drawn.indexOf(k) < 0);
  say(noWords.length === 0, 'every affix the generator can draw has a word list' + (noWords.length ? ': ' + noWords.join(', ') : ' (' + drawn.length + ')'));
  say(noAffix.length === 0, 'and every word list is an affix it can draw' + (noAffix.length ? ': ' + noAffix.join(', ') : ''));

  /* ---- 4. the bosses ---- */
  let bossBad = [];
  D.bosses.forEach(b => {
    if (!b.aspects || b.aspects.length !== 4) bossBad.push(b.id + ' has ' + (b.aspects || []).length + ' Aspects, not 4');
    else {
      const stats = b.aspects.map(a => a.stat);
      if (new Set(stats).size !== 4) bossBad.push(b.id + ' repeats a stat: ' + stats.join(','));
      b.aspects.forEach(a => {
        if (!(a.hp > 0) || a.hp !== Math.round(a.hp)) bossBad.push(b.id + '/' + a.name + ' hp is ' + a.hp + ', which is not a whole number above zero');
        if (a.tn < 3 || a.tn > 7) bossBad.push(b.id + '/' + a.name + ' TN ' + a.tn + ' is outside the 3 to 7 band');
      });
    }
  });
  say(bossBad.length === 0, 'every boss carries four Aspects on four stats with whole hit points and a TN in band' + (bossBad.length ? ': ' + bossBad.join('; ') : ' (' + D.bosses.length + ' bosses)'));

  /* ---- 5. THE COMPOSED STRINGS, which is why this gate exists ---- */
  const rng = MD.makeRng(MD.seedFromString('data-gate'));
  let names = [], undef = 0, nameBad = null;
  for (let i = 0; i < 1000; i++) {
    const slot = MD.SLOTS[i % MD.SLOTS.length];
    const rarity = MD.RARITIES[i % MD.RARITIES.length];
    const rel = MD.GEN.newRelic(rng, 1 + (i % 5), { slot: slot, rarity: rarity });
    const n = rel && rel.name || '';
    if (/undefined|NaN|\[object/.test(n)) undef++;
    if (!nameBad) { const b = bannedName(n); if (b) nameBad = b; }
    names.push(n);
  }
  say(undef === 0, 'a thousand generated relic names carry no undefined and no NaN' + (undef ? ' (' + undef + ' did)' : ''));
  say(!nameBad, 'and none of them carries a dash or an exclamation point' + (nameBad ? ': ' + nameBad : ''));
  say(new Set(names).size > 400, 'and they are not all the same handful (' + new Set(names).size + ' distinct of 1000)');

  let charBad = null, chars = new Set();
  const acct = MD.SIM.newAccount(7);
  for (let i = 0; i < 1000; i++) {
    const nm = MD.GEN.nameCharacter(rng, acct);
    chars.add(nm);
    if (!charBad) { const b = bannedName(nm); if (b) charBad = b; }
  }
  say(!charBad, 'a thousand character names carry no dash and no exclamation point' + (charBad ? ': ' + charBad : ''));
  say(chars.size > 500, 'and they are not all the same handful (' + chars.size + ' distinct of 1000)');

  /* every card template rendered with a plausible record, the wall line included */
  const cards = D.lines.cards || {};
  const fill = (t) => t.replace(/\{name\}/g, 'Vessa Orn').replace(/\{calling\}/g, 'Zealot')
    .replace(/\{cause\}/g, 'drowned at the Gate').replace(/\{renown\}/g, '18')
    .replace(/\{origin\}/g, 'Fenwise').replace(/\{quests\}/g, 'four');
  let cardBad = [], rendered = 0;
  Object.keys(cards).forEach(k => {
    const out = fill(cards[k]); rendered++;
    const b = bannedName(out); if (b) cardBad.push(k + ': ' + b);
    if (/\{[a-z]+\}/.test(out)) cardBad.push(k + ' still holds an unfilled placeholder: ' + out.match(/\{[a-z]+\}/)[0]);
  });
  say(cardBad.length === 0, 'every card template renders clean with a real record (' + rendered + ' of them)' + (cardBad.length ? ': ' + cardBad.join('; ') : ''));

  /* the ui label table, which VIEW pulls every button label from */
  const ui = D.lines.ui || {};
  const uiKeys = Object.keys(ui);
  let uiBad = uiKeys.filter(k => bannedName(ui[k]));
  say(uiKeys.length >= 25 && uiBad.length === 0,
    'the ui label table holds every button label and none of them breaks the copy law (' + uiKeys.length + ')' + (uiBad.length ? ': ' + uiBad.join(', ') : ''));

  /* ---- 6. the banks are big enough that a quest does not repeat itself ---- */
  const ch = D.challenges;
  const thin = [];
  MD.STATS.forEach(st => {
    if (ch.gate[st].length < 12) thin.push('gate ' + st + ' ' + ch.gate[st].length);
    if (ch.chain[st].length < 6) thin.push('chain ' + st + ' ' + ch.chain[st].length);
  });
  ['relay', 'vault', 'toll', 'open'].forEach(sh => { if (ch[sh].length < 10) thin.push(sh + ' ' + ch[sh].length); });
  /* twelve, not twenty: a Depth I quest draws at most six Gates of one stat and R10.1
     bans a repeat inside a quest, so twelve is the law and twenty is today's number. */
  say(thin.length === 0, 'every challenge bank is over the law (12 a stat for Gate, 6 for Chain, 10 for the shared shapes)' + (thin.length ? ': ' + thin.join(', ') : ''));

  console.log('');
  if (bad.length) { console.log('DATA FAILED: ' + bad.length); bad.forEach(b => console.log('  X ' + b)); process.exit(1); }
  console.log('DATA OK   ' + strings + ' bank strings, ' + (traitIds.length + D.uniques.length) + ' records, 2000 generated names, ' + rendered + ' card templates');
}


/* ============================ --odds ============================
 * THE CALIBRATION GATE. The preroll card prints a percentage. This asks whether
 * that percentage is TRUE of the roll that follows it.
 *
 * It is not a check that peekCheck copies resolveNext's source; a copy can be
 * faithful and still wrong. It plays real quests, and before every single check
 * it asks peekCheck for a number, then lets the ENGINE roll and records what
 * actually happened. Bucket the predictions by tenth and the observed pass rate
 * in each bucket has to sit inside its own binomial noise. A peek that reads the
 * wrong actor, forgets a floor, misses the Cutpurse's free second roll, prices a
 * Push it will not pay, or drifts one branch out of step with resolveNext moves
 * a bucket off its diagonal and this fails.
 *
 * ⛔ The two producers are compared by their ANSWERS, never by their text.
 */
/* The policy sends its best hand to every wall, so left alone this gate would only ever
 * measure sure things. This sends the WRONG hand: the same bodies, legally placed, shuffled
 * between the slots, and the free stat set to the character's worst die instead of their
 * best. Every plan it returns is one the engine accepts; it is simply a bad one, which is
 * what fills the low buckets. It never touches the roll, only who takes it. */
function wrongPlan(st, rng) {
  const plan = MD.SIM.policy.assign(st);
  const stage = MD.SIM.currentStage(st);
  const filled = [];
  /* ⛔ R13.8: a Toll refuses a character whose fee would reach their Toughness, and the
     policy already chose someone who can pay it. A blind swap onto a Toll throws out of
     assign(), so the Tolls keep the hand the policy dealt them. */
  for (let i = 0; i < plan.slots.length; i++) {
    if (plan.slots[i] && stage.slots[i] && stage.slots[i].shape !== 'toll') filled.push(i);
  }
  /* swap two entries that need the same number of bodies, so the plan stays legal */
  for (let n = 0; n < filled.length; n++) {
    const i = filled[rng.int(filled.length)], j = filled[rng.int(filled.length)];
    if (i === j) continue;
    if (plan.slots[i].chars.length !== plan.slots[j].chars.length) continue;
    const t = plan.slots[i].chars; plan.slots[i].chars = plan.slots[j].chars; plan.slots[j].chars = t;
  }
  /* the free stat goes to the worst die they own rather than the best */
  for (let k = 0; k < filled.length; k++) {
    const e = plan.slots[filled[k]];
    if (!e.stat) continue;
    const c = MD.SIM.byId(st, e.chars[0]);
    let worst = null;
    for (const stat of MD.STATS) if (!worst || MD.effStat(c, stat) < MD.effStat(c, worst)) worst = stat;
    e.stat = worst;
  }
  return plan;
}

function oddsMode() {
  const N_ACCOUNTS = flagNum('accounts', 60);
  const QUESTS = flagNum('quests', 6);
  const B = 10;                                   // ten buckets, one per tenth
  const hit = new Array(B).fill(0), tot = new Array(B).fill(0), sum = new Array(B).fill(0);
  let checks = 0, peeks = 0, nulls = 0, refused = 0;
  const shapeSeen = Object.create(null);
  let worstPoint = null;

  for (let a = 0; a < N_ACCOUNTS; a++) {
    const rng = MD.makeRng(MD.seedFromString('odds:acct:' + a));
    const st = MD.SIM.newGame(MD.seedFromString('odds:game:' + a));
    MD.SIM.seedRoster(st, rng, 4);
    /* ⛔ A CALIBRATION THAT ONLY EVER SEES SURE THINGS IS NOT CALIBRATED. Left alone the
       policy picks its best stat every time and seven checks in ten land over 90 percent,
       so the low buckets never fill and a peek that was wrong about hard rolls would pass.
       Two thirds of these accounts are handed the deep end, where R5.5 deals TN 6 and 7 and
       a d4 against 7 is one roll in eight. */
    const band = a % 3;                                    // 0 shallow, 1 middle, 2 the deep end
    if (band) st.account.questsCompleted = band === 1 ? 10 : 50;
    for (let qi = 0; qi < QUESTS; qi++) {
      const deepest = MD.SIM.deepestDepth(st);
      const depth = band === 0 ? 1 + (qi % deepest)
        : band === 1 ? Math.min(deepest, 3)
        : Math.min(deepest, 4 + (qi % 2));
      const qd = MD.GEN.newQuest('odds:' + a + ':' + qi, depth);
      const party = MD.SIM.policy.party(st);
      if (!party.length) break;
      MD.SIM.startQuest(st, rng, qd, party);
      let guard = 0;
      while (st.quest && !st.quest.over && guard++ < 5000) {
        const q = st.quest;
        if (q.step === 'assign') {
          /* a bad plan is still allowed to be refused; the calibration is about the odds,
             not about this file's ability to deal a legal hand under every rule */
          try { MD.SIM.assign(st, band === 2 ? wrongPlan(st, rng) : MD.SIM.policy.assign(st)); }
          catch (e) { MD.SIM.assign(st, MD.SIM.policy.assign(st)); refused++; }
        }
        else if (q.step === 'check') {
          /* the peek happens FIRST, on the state the engine is about to read */
          const peek = MD.SIM.peekCheck(st);
          const res = MD.SIM.resolveNext(st, rng);
          checks++;
          if (!peek) { nulls++; continue; }
          peeks++;
          shapeSeen[peek.slot.shape] = (shapeSeen[peek.slot.shape] || 0) + 1;
          /* a check the engine SKIPPED never rolled, and peekCheck must have said so */
          if (!res || res.skipped || !res.roll) {
            worstPoint = worstPoint || ('peekCheck offered odds for a check that never rolled: '
              + (res && res.skipped ? res.skipped : 'no roll'));
            continue;
          }
          if (res.charId !== peek.charId || res.stat !== peek.stat || res.tn !== peek.tn) {
            worstPoint = worstPoint || ('peekCheck named ' + peek.charId + '/' + peek.stat + '/' + peek.tn
              + ' and the engine rolled ' + res.charId + '/' + res.stat + '/' + res.tn);
            continue;
          }
          if (res.roll.die !== peek.ctx.die) {
            worstPoint = worstPoint || ('peekCheck said d' + peek.ctx.die + ' and the engine rolled d' + res.roll.die);
            continue;
          }
          const p = peek.prob;
          const b = Math.min(B - 1, Math.max(0, Math.floor(p * B)));
          tot[b]++; sum[b] += p; if (res.pass) hit[b]++;
        }
        else if (q.step === 'stageEnd') { MD.SIM.policy.takeDrops(st, rng); MD.SIM.policy.replace(st, rng); MD.SIM.endStage(st, rng); }
        else if (q.step === 'bossAssign') MD.SIM.bossAssign(st, MD.SIM.policy.boss(st));
        else if (q.step === 'bossCheck') MD.SIM.resolveBossCheck(st, rng);
        else if (q.step === 'strike') MD.SIM.bossStrike(st, rng);
        else if (q.step === 'bossWon') { MD.SIM.policy.takeDrops(st, rng); MD.SIM.endStage(st, rng); }
        else break;
      }
      if (st.quest) MD.SIM.policy.takeDrops(st, rng);
      MD.SIM.endQuest(st, rng);
      MD.SIM.policy.hall(st, rng);
    }
  }

  const bad = [];
  console.log('MARROWDEEP odds calibration. peekCheck predicts, the engine rolls, ' + peeks.toLocaleString('en-US') + ' paired checks.');
  console.log('  predicted     n      mean p    observed    off      3 sigma');
  for (let b = 0; b < B; b++) {
    if (tot[b] < 200) continue;                       // too thin to say anything about
    const meanP = sum[b] / tot[b];
    const obs = hit[b] / tot[b];
    const sigma = Math.sqrt(Math.max(meanP * (1 - meanP), 1e-9) / tot[b]);
    const band = Math.max(3 * sigma, 0.01);           // never tighter than a point, for rounding
    const off = obs - meanP;
    const ok = Math.abs(off) <= band;
    if (!ok) bad.push('bucket ' + (b * 10) + ' to ' + (b * 10 + 10) + ': predicted ' + (meanP * 100).toFixed(2)
      + ', observed ' + (obs * 100).toFixed(2) + ' over ' + tot[b] + ' checks');
    console.log('  ' + String(b * 10 + ' to ' + (b * 10 + 10)).padStart(9) + '  '
      + String(tot[b]).padStart(6) + '   ' + (meanP * 100).toFixed(2).padStart(7)
      + '   ' + (obs * 100).toFixed(2).padStart(8) + '   ' + (off * 100).toFixed(2).padStart(6)
      + '   ' + (band * 100).toFixed(2).padStart(6) + (ok ? '' : '   X'));
  }
  /* ---------------------------------------------------------------- *
   * PART TWO. The play through above proves peekCheck reads the RIGHT context; it
   * cannot prove the formula, because the policy plays well and seven checks in ten
   * land over ninety percent, so the hard half of the curve never appears in it.
   * This walks the whole modifier domain on purpose, the awkward corners included:
   * a floor over the target, a Push that carries it, a surge threshold pulled down
   * to two faces, the Hollow Air's dead surge, the one shot surge, the redraw on a
   * natural one, roll twice, and negative gear. Each cell is the closed form against
   * the engine's own roll(), which is the only other producer of the same answer.
   * ⛔ Compared by their ANSWERS. The formula does not read roll() and roll() has
   * never heard of the formula.
   * ---------------------------------------------------------------- */
  const N = 40000;
  const cells = [];
  const DICE = [4, 6, 8, 10, 12];
  for (const die of DICE) {
    for (const tn of [3, 4, 5, 6, 7, 9, 12]) {
      cells.push({ die, tn, o: {} });
      cells.push({ die, tn, o: { floor: Math.min(Math.floor(die / 2), 5) } });
      cells.push({ die, tn, o: { flat: 2 } });
      cells.push({ die, tn, o: { flat: -1 } });
      cells.push({ die, tn, o: { push: true } });
      cells.push({ die, tn, o: { floor: 3, flat: 1, push: true } });
      cells.push({ die, tn, o: { surgeMinus: 1 } });
      cells.push({ die, tn, o: { noSurge: true } });
      cells.push({ die, tn, o: { surgeOnce: true } });
      cells.push({ die, tn, o: { reroll1s: true } });
      cells.push({ die, tn, o: { twice: true } });
      cells.push({ die, tn, o: { floor: 4, twice: true, surgeMinus: 1 } });
    }
  }
  let worstCell = null, worstZ = 0, cellsRun = 0;
  for (let ci = 0; ci < cells.length; ci++) {
    const c = cells[ci];
    const p = MD.passProb(c.die, c.tn, c.o);
    if (p <= 0 || p >= 1) { cellsRun++; continue; }        // a certainty has no noise to measure
    const rng = MD.makeRng(MD.seedFromString('oddscell:' + ci));
    let hits = 0;
    for (let i = 0; i < N; i++) {
      const ctx = { rng: rng, floor: c.o.floor, flat: c.o.flat, push: c.o.push,
        surgeMinus: c.o.surgeMinus, noSurge: c.o.noSurge, surgeOnce: c.o.surgeOnce,
        reroll1s: c.o.reroll1s, twice: c.o.twice };
      if (MD.roll(c.die, ctx).total >= c.tn) hits++;
    }
    const obs = hits / N;
    const sigma = Math.sqrt(Math.max(p * (1 - p), 1e-9) / N);
    const z = Math.abs(obs - p) / sigma;
    cellsRun++;
    if (z > worstZ) {
      worstZ = z;
      worstCell = 'd' + c.die + ' TN' + c.tn + ' ' + (JSON.stringify(c.o) === '{}' ? 'plain' : JSON.stringify(c.o))
        + ': formula ' + (p * 100).toFixed(3) + ', rolled ' + (obs * 100).toFixed(3) + ' over ' + N.toLocaleString('en-US')
        + ' (' + z.toFixed(2) + ' sigma)';
    }
  }
  console.log('');
  console.log('  the formula against the engine\'s own dice, ' + cellsRun + ' modifier cells x '
    + N.toLocaleString('en-US') + ' rolls');
  console.log('    worst cell   ' + (worstCell || 'every cell was a certainty, which cannot be right'));
  if (!worstCell) bad.push('the modifier sweep measured nothing');
  /* 4.5 sigma over ~420 live cells: a true engine trips this about one run in three thousand */
  if (worstZ > 4.5) bad.push('the formula and the dice disagree: ' + worstCell);
  if (cellsRun < 300) bad.push('only ' + cellsRun + ' modifier cells ran');

  console.log('');
  console.log('  shapes peeked: ' + Object.keys(shapeSeen).sort().map((k) => k + ' ' + shapeSeen[k]).join(', '));
  console.log('  ' + checks.toLocaleString('en-US') + ' checks, ' + peeks.toLocaleString('en-US')
    + ' of them peekable, ' + nulls.toLocaleString('en-US') + ' declined (forfeits, broken chains, dead actors)');
  console.log('  ' + refused + ' deliberately bad plans were refused by assign() and redealt');
  if (worstPoint) bad.push(worstPoint);
  /* a gate that never looked at anything is not a gate */
  if (peeks < 3000) bad.push('only ' + peeks + ' paired checks, which is too few to calibrate anything');
  const shapes = Object.keys(shapeSeen);
  if (shapes.length < 4) bad.push('only saw the shapes ' + shapes.join(', ') + ', so most of the board is untested');
  if (bad.length) {
    console.log('');
    console.log('ODDS FAILED: ' + bad.length);
    bad.forEach((b) => console.log('  X ' + b));
    process.exit(1);
  }
  console.log('ODDS OK   every bucket sits inside three sigma of its own prediction');
}

/* ============================ runner ============================ */
/* CommonJS on purpose (the fleet's check.js expects `node sim.js` with no package
   type), so the one await lives inside an async main rather than at the top level. */
async function main() {
if (has('--gridworker')) {
  useAuthoredData();
  gridWorker();
} else if (has('--grid')) {
  useAuthoredData();
  await gridMode();
} else if (has('--data')) {
  useAuthoredData();
  dataMode();
} else if (has('--depths')) {
  useAuthoredData();
  depthsMode();
} else if (has('--odds')) {
  useAuthoredData();
  oddsMode();
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
  console.log('usage: node sim.js --table | --test | --data | --odds | --grid | --depths');
  console.log('  --odds   [--accounts=N] [--quests=N]');
  console.log('           peekCheck predicts every check, the engine rolls it, the buckets must agree.');
  console.log('  --grid   [--sample=N] [--accounts=N] [--questsPer=N] [--jobs=N] [--depth=D]');
  console.log('           [--maxRounds=N] [--json=PATH] [--over=KEY=VAL]   (--over is repeatable)');
  console.log('  --depths [--quests=N] [--accounts=N] [--warmCap=N] [--maxRounds=N] [--over=KEY=VAL]');
  console.log('           R7.4 winnability: every Depth from II to V wins between 25 and 75 percent.');
  process.exit(2);
}
}
main().catch(function (e) { console.error(e && e.stack || String(e)); process.exit(1); });
