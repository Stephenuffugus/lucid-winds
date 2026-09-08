/* MARROWDEEP prototype rules engine. Pure: no DOM, no Date, no Math.random.
 * Every rule cites plans/marrowdeep/RULES.md (R1 to R9, R12). ES5 so it pastes into a classic script.
 * UMD: require('./engine.js') in Node, or window.MD in a browser.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MD = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var STATS = ['might', 'grace', 'wits', 'nerve'];
  var DICE = [4, 6, 8, 10, 12];
  var SLOTS = ['head', 'chest', 'hands', 'feet', 'weapon', 'charm', 'sigilWard', 'token'];
  var RARITIES = ['common', 'uncommon', 'rare', 'relic'];
  var SIGILS = ['hollowAir', 'rustbound', 'shivering', 'pressgang', 'thinIce', 'blindfold'];
  var SHAPES = ['gate', 'chain', 'relay', 'vault', 'toll', 'open'];

  function deepFreeze(o) {
    if (o && typeof o === 'object' && !Object.isFrozen(o)) {
      Object.freeze(o);
      Object.keys(o).forEach(function (k) { deepFreeze(o[k]); });
    }
    return o;
  }

  /* ---------------- BALANCE: every tunable, and nowhere else ----------------
   * R0: "Numbers marked BALANCE live in one frozen object of that name and nowhere else."
   * Nothing below this object is a tunable number; everything else reads B.*.
   */
  var DEFAULT_BALANCE = {
    BASE_TOUGHNESS: 4,            // R0, spec 3.4
    RESPITE: [1, 1, 0, 0, 0],     // R5.7 / R9.1: per living character at stage end, by Depth (III+ is 0)
    STRIKE: [2, 2, 2, 3, 3],      // R7.4: per unbroken Aspect per round, by Depth
    STRIKE_TARGET: 'attackers',   // R7.4: attackers | all | spread (the prototype sim chose attackers)
    BENCH_CLEAR: 1,               // R5.6: what a bench clears before benchPlus
    PUSH_BONUS: 2,                // R1.6
    PUSH_STRAIN: 1,               // R1.6
    TOLL_FEE: 1,                  // R5.5, R3.1: paid on assignment, skips Armor
    AMBUSH_STRAIN: 1,             // R3.1: the GRACE consequence adds this on a failure
    CONTAGION_STRAIN: 1,          // R3.1: every OTHER living party member on a NERVE failure
    THIN_ICE_STRAIN: 2,           // R9.2: the first failure each stage costs this instead
    PRESSGANG_STRAIN: 1,          // R9.2: the third character takes this at stage end instead of benching
    FLAT_CAP: 3,                  // R1.7 / R1.9: permanent unconditional bonus per stat
    GATE_TN_WEIGHTS: { 4: 50, 5: 50 },  // R5.5
    TN: { chain: [3, 4], relay: [4, 4], vault: 7, toll: 3, open: 3 }, // R5.5
    RENOWN: { gate: 3, open: 2, toll: 4, chain: 6, relay: 6, vault: 5, boss: 12, firstBoss: 8 }, // R5.9
    RELIC_ROLLS: { gate: 0, open: 0, toll: 1, chain: 1, relay: 1, vault: 1, boss: 1 },           // R5.9
    RELIC_TIER_UP: { vault: 1, boss: 1 },                                                        // R5.9
    DEPTH_RENOWN_MULT: [1, 1.5, 2.25, 3.4, 5.1],     // R5.9
    DEPTH_MARROW_MULT: [1, 1.3, 1.69, 2.197, 2.856], // R8.5: round(1 x mult) = 1,1,2,2,3
    SALVAGE: { common: 1, uncommon: 3, rare: 6, relic: 12 }, // R6.7
    ASPECT_HP_BONUS: [0, 0, 1, 2, 2], // R7.1: authored at Depth I, +1 at III, +2 at IV and V
    SCAR_PER_QUEST: 1,            // R2.5 / spec 6.2
    TRAITS_DEALT: 3,              // R2.5
    CALLINGS_DEALT: 3,            // R2.1 / R8.7
    RENOWN_TIER_THRESHOLDS: [100, 200, 350, 500, 700, 900, 1200, 1500, 2000], // R2.2
    // spec 3.3: the five authored rows. Tiers 2,4,6,8,9 are interpolated in tierWeights() per R2.2.
    TIER_WEIGHTS: {
      1: [35, 30, 20, 10, 5],
      3: [25, 28, 25, 15, 7],
      5: [18, 25, 28, 20, 9],
      7: [14, 22, 29, 23, 12],
      10: [10, 20, 30, 25, 15]
    },
    DROP_WEIGHTS: [ // spec 11.4, by Depth, over common/uncommon/rare/relic
      [60, 28, 10, 2],
      [45, 35, 16, 4],
      [25, 42, 26, 7],
      [10, 45, 34, 11],
      [0, 45, 40, 15]
    ],
    BUDGETS: [ // spec 11.3, by Depth, over common/uncommon/rare/relic (0 = that rarity never drops)
      [2, 3, 4, 6],
      [2, 3, 5, 7],
      [2, 4, 6, 8],
      [0, 4, 6, 9],
      [0, 4, 7, 10]
    ],
    STAT_FREQ: { // spec 7.4, over might/grace/wits/nerve
      early: [15, 35, 35, 15],
      mid: [25, 25, 25, 25],
      late: [35, 15, 15, 35]
    },
    /* Composition rows (R5.4, R9.1). Each stage row: strainOnFail, the stat frequency row,
     * and the two slots as weight tables. Depths III to V reuse Depth II's shape (R9.1). */
    COMPOSITION: {
      1: [
        { strainOnFail: 1, statRow: 'early', slots: [{ gate: 1 }, { open: 50, toll: 50 }] },
        { strainOnFail: 1, statRow: 'early', slots: [{ gate: 1 }, { open: 50, toll: 50 }] },
        { strainOnFail: 1, statRow: 'mid', slots: [{ gate: 1 }, { chain: 40, relay: 40, vault: 20 }] },
        { strainOnFail: 1, statRow: 'mid', slots: [{ gate: 1 }, { chain: 40, relay: 40, vault: 20 }] },
        { strainOnFail: 2, statRow: 'late', slots: [{ gate: 40, chain: 30, relay: 30 }, { gate: 40, chain: 30, relay: 30 }] },
        { boss: true }
      ],
      2: [
        { strainOnFail: 1, statRow: 'early', slots: [{ gate: 1 }, { open: 25, toll: 25, chain: 25, relay: 25 }] },
        { strainOnFail: 1, statRow: 'early', slots: [{ gate: 1 }, { open: 25, toll: 25, chain: 25, relay: 25 }] },
        { strainOnFail: 1, statRow: 'mid', slots: [{ gate: 1 }, { chain: 45, relay: 45, vault: 10 }] },
        { boss: true, first: true },
        { strainOnFail: 1, statRow: 'mid', slots: [{ gate: 1 }, { chain: 45, relay: 45, vault: 10 }] },
        { strainOnFail: 1, statRow: 'mid', slots: [{ gate: 1 }, { chain: 45, relay: 45, vault: 10 }] },
        { strainOnFail: 2, statRow: 'late', slots: [{ gate: 40, chain: 30, relay: 30 }, { gate: 40, chain: 30, relay: 30 }] },
        { boss: true }
      ]
    },
    SEALED_STAGES: { 4: [3, 6], 5: [3, 6] }, // R9.1: the second slot is a Vault that must pass to leave
    SIGIL_COUNT: { 1: [0, 1], 2: [1, 1], 3: [1, 2], 4: [2, 2], 5: [2, 3] }, // R9.2
    DEPTH_UNLOCK: [0, 3, 10, 25, 50], // R8.4: boss wins needed
    DEPTH_NAMES: ['Verge', 'Hollows', 'Undertow', 'The Silt', 'Marrowdeep'], // spec 9
    REPLACEMENT_DEPTHS: [1, 2, 3, 4], // R5.10: Depth V offers no replacement
    HALL: { reforge: 15, commission: 40, recruit: 25, redeal: 10, mend: 20, excise: 60, wardShelfFirst: 30, wardShelfStep: 15, wardShelfMax: 6 }, // R8.1
    MARROW_SHOP: { floorD6: 3, floorD8: 6, rosterSlotFirst: 4, rosterSlotStep: 2, rosterMax: 8, legacySlot: 2, legacyMax: 3, unlockOrigin: 5, consecrate: 6 }, // R8.2
    CREATION_FLOORS: [4, 6, 8], // R8.6: the ladder a Marrow floor purchase walks
    RETIRE_MARROW: 2,           // R2.6: 2 + Traits, flat
    DEATH_MARROW: 1,            // R8.5: x DEPTH_MARROW_MULT
    ROSTER_START: 3,            // spec 8.3 / R8.2
    LEGACY_SLOTS_START: 1,      // R8.7
    PARTY_SIZE: 3,              // spec 7.1
    AFFIX_DRAW_CAP: 50,         // R6.2: at most 50 draws per item
    /* The affix table, spec 11.2. key -> points, valid slots, and the R12 effect it compiles to.
     * stat:'*' means "roll a stat at generation" (R6.3); sigil:'*' means "name a Sigil" (R9.3).
     * floorHalf writes v:6 because R1.3 clamps every floor to die/2, so 6 IS "half the die". */
    AFFIXES: {
      flat:        { pts: 2, slots: ['token', 'hands', 'weapon'], statTarget: true, eff: [{ k: 'flat', stat: '*', v: 1, perm: true }] },
      floor3:      { pts: 1, slots: ['head'], statTarget: true, eff: [{ k: 'floor', stat: '*', v: 3 }] },
      floorHalf:   { pts: 2, slots: ['head'], statTarget: true, eff: [{ k: 'floor', stat: '*', v: 6 }] },
      floorPlus:   { pts: 3, slots: ['head'], eff: [{ k: 'floorPlus', v: 1 }] },
      stepStat:    { pts: 3, slots: ['hands'], statTarget: true, eff: [{ k: 'stepStat', stat: '*' }] },
      surgeMinus:  { pts: 2, slots: ['hands', 'weapon'], statTarget: true, eff: [{ k: 'surgeMinus', stat: '*' }] },
      armor:       { pts: 2, slots: ['chest'], eff: [{ k: 'armor', v: 1 }] },
      toughness:   { pts: 1, slots: ['chest'], eff: [{ k: 'toughness', v: 1 }] },
      strikeLess:  { pts: 3, slots: ['chest'], eff: [{ k: 'strikeLess', v: 1 }] },
      reroll1s:    { pts: 1, slots: ['charm'], statTarget: true, eff: [{ k: 'reroll1s', stat: '*' }] },
      rerollStage: { pts: 3, slots: ['charm'], eff: [{ k: 'rerollStage' }] },
      twiceStage:  { pts: 3, slots: ['charm'], eff: [{ k: 'twiceStage', stat: 'all', auto: false }] },
      benchPlus:   { pts: 2, slots: ['feet'], eff: [{ k: 'benchPlus', v: 1 }] },
      relayPlus:   { pts: 2, slots: ['feet'], eff: [{ k: 'relayPlus', v: 1 }] },
      benchOnce:   { pts: 3, slots: ['feet'], eff: [{ k: 'benchOnce' }] },
      aspectDmg:   { pts: 2, slots: ['weapon'], eff: [{ k: 'aspectDmg', v: 1 }] },
      surgeAspect: { pts: 2, slots: ['weapon'], eff: [{ k: 'surgeAspect', v: 2 }] },
      sigilImmune: { pts: 3, slots: ['sigilWard'], sigilTarget: true, eff: [{ k: 'sigilImmune', sigil: '*' }] },
      sigilPartial:{ pts: 2, slots: ['sigilWard'], sigilTarget: true, eff: [{ k: 'sigilPartial', sigil: '*' }] },
      condTn6:     { pts: 2, slots: ['token'], eff: [{ k: 'cond', when: 'tn6plus', v: 2 }] },
      condStrain2: { pts: 1, slots: ['token'], eff: [{ k: 'cond', when: 'strain2', v: 1 }] },
      condFirst:   { pts: 2, slots: ['token'], eff: [{ k: 'cond', when: 'firstOfStage', v: 2 }] },
      condLast:    { pts: 2, slots: ['token'], eff: [{ k: 'cond', when: 'lastOfStage', v: 2 }] },
      condDead:    { pts: 1, slots: ['token'], eff: [{ k: 'cond', when: 'perDeadAlly', v: 1 }] }
    }
  };
  // R9.1: Depths III, IV and V run Depth II's shape. Sealed stages and Strike come from their own rows.
  DEFAULT_BALANCE.COMPOSITION[3] = DEFAULT_BALANCE.COMPOSITION[2];
  DEFAULT_BALANCE.COMPOSITION[4] = DEFAULT_BALANCE.COMPOSITION[2];
  DEFAULT_BALANCE.COMPOSITION[5] = DEFAULT_BALANCE.COMPOSITION[2];
  deepFreeze(DEFAULT_BALANCE);

  var B = DEFAULT_BALANCE;
  function makeBalance(overrides) {
    var out = JSON.parse(JSON.stringify(DEFAULT_BALANCE));
    Object.keys(overrides || {}).forEach(function (k) {
      if (!(k in out)) throw new Error('BALANCE has no key ' + k);
      out[k] = overrides[k];
    });
    return deepFreeze(out);
  }
  function useBalance(b) { B = b || DEFAULT_BALANCE; return B; }
  function balance() { return B; }

  /* ---------------- RNG: mulberry32 over a uint32 state. Every draw goes through it. ---------------- */
  function mixSeed(seed, salt) {
    // fold a number or string seed with a number or string salt into one uint32 (FNV-1a then a final mix)
    var s = String(seed) + '|' + String(salt);
    var h = 2166136261 >>> 0;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    h ^= h >>> 16; h = Math.imul(h, 2246822507) >>> 0; h ^= h >>> 13; h = Math.imul(h, 3266489909) >>> 0; h ^= h >>> 16;
    return h >>> 0;
  }
  function seedFromString(s) { return mixSeed(s, 'marrowdeep'); }

  function makeRng(state) {
    var a = (state >>> 0) || 0x9e3779b9;
    var rng = {
      draws: 0,
      next: function () {
        rng.draws++;
        a = (a + 0x6D2B79F5) >>> 0;
        var t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      },
      int: function (n) { return Math.floor(rng.next() * n); },
      die: function (d) { return 1 + Math.floor(rng.next() * d); },
      pick: function (arr) { return arr[Math.floor(rng.next() * arr.length)]; },
      weighted: function (table) { // {key: weight} or [weights] -> key or index
        var keys = Array.isArray(table) ? null : Object.keys(table);
        var ws = keys ? keys.map(function (k) { return table[k]; }) : table;
        var sum = 0, i;
        for (i = 0; i < ws.length; i++) sum += ws[i];
        var r = rng.next() * sum;
        for (i = 0; i < ws.length; i++) { r -= ws[i]; if (r < 0) return keys ? keys[i] : i; }
        return keys ? keys[ws.length - 1] : ws.length - 1;
      },
      shuffle: function (arr) { var a2 = arr.slice(); for (var i = a2.length - 1; i > 0; i--) { var j = rng.int(i + 1); var t = a2[i]; a2[i] = a2[j]; a2[j] = t; } return a2; },
      fork: function (salt) { return makeRng(mixSeed(a, salt)); },
      getState: function () { return a; },
      setState: function (s) { a = s >>> 0; return a; }
    };
    return rng;
  }

  /* ---------------- small helpers (no tunables here) ---------------- */
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function rungOf(die) { var i = DICE.indexOf(die); return i < 0 ? 0 : i; }
  function dieAtRung(r) { return DICE[Math.max(0, Math.min(DICE.length - 1, r))]; }
  function stepDie(die, n) { return dieAtRung(rungOf(die) + n); }
  function sum(a) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return s; }
  function statIndex(s) { return STATS.indexOf(s); }
