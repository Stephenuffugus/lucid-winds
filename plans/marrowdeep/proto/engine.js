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

  /* ================= EFFECTS: the R12 vocabulary, ONE resolver =================
   * Every Origin, Calling, Trait, affix and unique compiles to {k, ...} records.
   * Nothing below a collect() call knows a Calling from a Trait (R12).
   *
   * Kinds, exactly R12, plus two engine extensions that R4.4 and spec 11.2 force:
   *   floorPlus {k,v}      Ironbound (R4.4) and the Head affix "floors count as +1" (spec 11.2).
   *                        R12's list omits it; both rules require it, so it is written here.
   *   creation  {k,...}    Straycall (R4.5) and Unmarked (R4.8) act once, at creation, before
   *                        any check exists. Marked creationShift / creationFifth.
   */
  var EFFECT_KINDS = {
    flat: 'roll', floor: 'roll', floorPlus: 'roll', surgeMinus: 'roll', stepStat: 'equip',
    reroll1s: 'roll', twiceStage: 'stage', rerollStage: 'stage', toughness: 'equip', armor: 'equip',
    strikeLess: 'strike', benchPlus: 'bench', benchAlly: 'bench', benchOnce: 'stage',
    relayPlus: 'roll', aspectDmg: 'damage', surgeAspect: 'damage', sigilImmune: 'quest',
    sigilPartial: 'quest', cond: 'roll', pushFree: 'push', tollFree: 'assign', unkillable: 'death',
    ignoreAmbush: 'strain', contagionImmune: 'strain', seeHidden: 'stage', previewNext: 'stage',
    grim: 'roll', respitePlus: 'stage', extraRelic: 'quest',
    creationShift: 'creation', creationFifth: 'creation'
  };
  var COND_WHENS = ['tn6plus', 'strain2', 'firstOfStage', 'lastOfStage', 'perDeadAlly', 'boss',
    'unusedStat', 'sameStatAsPrev', 'afterFailByOther', 'relay', 'chain', 'vault', 'toll', 'open'];

  /* R4.1 to R4.8. Eight Origins. Four start unlocked (spec 4). */
  var ORIGINS = {
    hearthborn: { id: 'hearthborn', name: 'Hearthborn', unlocked: true, eff: [{ k: 'toughness', v: 2 }, { k: 'benchAlly', v: 1 }] },           // R4.1
    ashwalker:  { id: 'ashwalker', name: 'Ashwalker', unlocked: true, eff: [{ k: 'extraRelic', rarity: 'common' }] },                          // R4.2
    fenwise:    { id: 'fenwise', name: 'Fenwise', unlocked: true, eff: [{ k: 'surgeMinus', stat: 'wits' }] },                                  // R4.3
    ironbound:  { id: 'ironbound', name: 'Ironbound', unlocked: false, eff: [{ k: 'armor', v: 1 }, { k: 'floorPlus', v: 1, gearOnly: true }] },// R4.4
    straycall:  { id: 'straycall', name: 'Straycall', unlocked: true, eff: [{ k: 'creationShift', shift: { might: 1, grace: 1, nerve: -1 } }] },// R4.5
    lanternborn:{ id: 'lanternborn', name: 'Lanternborn', unlocked: false, eff: [{ k: 'seeHidden' }, { k: 'previewNext' }] },                  // R4.6 CORRECTED
    saltblood:  { id: 'saltblood', name: 'Saltblood', unlocked: false, eff: [{ k: 'pushFree', n: 1 }] },                                       // R4.7
    unmarked:   { id: 'unmarked', name: 'Unmarked', unlocked: false, eff: [{ k: 'creationFifth' }] }                                           // R4.8
  };

  /* R4.9 to R4.16. Eight Callings. */
  var CALLINGS = {
    vanguard: { id: 'vanguard', name: 'Vanguard', eff: [{ k: 'floor', stat: 'might', v: 4 }, { k: 'strikeLess', v: 1 }] },        // R4.9
    cutpurse: { id: 'cutpurse', name: 'Cutpurse', eff: [{ k: 'twiceStage', stat: 'grace', auto: true }] },                        // R4.10
    scholar:  { id: 'scholar', name: 'Scholar', eff: [{ k: 'cond', when: 'afterFailByOther', v: 2 }] },                           // R4.11
    zealot:   { id: 'zealot', name: 'Zealot', eff: [{ k: 'cond', when: 'strain2', v: 2 }] },                                      // R4.12
    warden:   { id: 'warden', name: 'Warden', eff: [{ k: 'benchPlus', v: 2 }] },                                                  // R4.13 (1 + 2 = 3)
    gambler:  { id: 'gambler', name: 'Gambler', eff: [{ k: 'rerollStage' }] },                                                    // R4.14
    herald:   { id: 'herald', name: 'Herald', eff: [{ k: 'cond', when: 'sameStatAsPrev', v: 1 }] },                               // R4.15
    reaver:   { id: 'reaver', name: 'Reaver', eff: [{ k: 'surgeAspect', v: 2, stat: 'might' }] }                                  // R4.16
  };

  /* R4.17. The twelve seeded Traits. Twelve more are authored in data/traits.json. */
  var TRAITS = {
    steady:     { id: 'steady', name: 'Steady', pts: 3, eff: [{ k: 'floor', stat: 'all', v: 3 }] },
    bloodhound: { id: 'bloodhound', name: 'Bloodhound', pts: 2, eff: [{ k: 'cond', when: 'lastOfStage', v: 2 }] },
    unkillable: { id: 'unkillable', name: 'Unkillable', pts: 3, eff: [{ k: 'unkillable' }] },
    ironlung:   { id: 'ironlung', name: 'Ironlung', pts: 2, eff: [{ k: 'toughness', v: 2 }] },
    quickstudy: { id: 'quickstudy', name: 'Quickstudy', pts: 2, eff: [{ k: 'cond', when: 'unusedStat', v: 1 }] },
    surehanded: { id: 'surehanded', name: 'Surehanded', pts: 2, eff: [{ k: 'reroll1s', stat: 'all' }] },
    bulwark:    { id: 'bulwark', name: 'Bulwark', pts: 3, eff: [{ k: 'armor', v: 2 }] },
    grim:       { id: 'grim', name: 'Grim', pts: 2, eff: [{ k: 'grim', v: 2 }] },
    ninthHour:  { id: 'ninthHour', name: 'Ninth Hour', pts: 3, eff: [{ k: 'cond', when: 'boss', v: 3 }] },
    untethered: { id: 'untethered', name: 'Untethered', pts: 2, eff: [{ k: 'ignoreAmbush' }] },
    deepdrawn:  { id: 'deepdrawn', name: 'Deepdrawn', pts: 2, eff: [{ k: 'surgeMinus', stat: 'highest' }] },
    steadfast:  { id: 'steadfast', name: 'Steadfast', pts: 2, eff: [{ k: 'contagionImmune' }] }
  };

  deepFreeze(ORIGINS); deepFreeze(CALLINGS); deepFreeze(TRAITS);

  /* ---- collect: gather every effect that applies to this character right now (R12) ---- */
  function collect(ch, ctx) {
    var out = [];
    function push(list, src, extra) {
      if (!list) return;
      for (var i = 0; i < list.length; i++) {
        var e = list[i];
        var rec = { k: e.k, src: src };
        for (var kk in e) if (e.hasOwnProperty(kk) && kk !== 'k') rec[kk] = e[kk];
        if (extra) for (var xk in extra) if (extra.hasOwnProperty(xk)) rec[xk] = extra[xk];
        out.push(rec);
      }
    }
    if (!ch) return out;
    if (ch.origin && ORIGINS[ch.origin]) push(ORIGINS[ch.origin].eff, 'origin:' + ch.origin);
    if (ch.calling && CALLINGS[ch.calling]) push(CALLINGS[ch.calling].eff, 'calling:' + ch.calling);
    for (var t = 0; t < (ch.traits || []).length; t++) {
      var tr = TRAITS[ch.traits[t]] || (DATA.traits && DATA.traits[ch.traits[t]]);
      if (tr) push(tr.eff, 'trait:' + ch.traits[t]);
    }
    var gear = ch.gear || {};
    for (var s = 0; s < SLOTS.length; s++) {
      var it = gear[SLOTS[s]];
      if (!it) continue;
      for (var a = 0; a < (it.affixes || []).length; a++) push(it.affixes[a].eff, 'gear:' + SLOTS[s] + ':' + it.affixes[a].key, { fromGear: true });
      if (it.unique && it.unique.eff) push(it.unique.eff, 'unique:' + it.unique.id, { fromGear: true });
    }
    // 'highest' resolves against this character's dice (R4.17 Deepdrawn: ties by stat order)
    for (var o = 0; o < out.length; o++) if (out[o].stat === 'highest') out[o].stat = highestStat(ch);
    // A Sigil the character is immune to strips nothing here; the quest layer reads sigilImmune (R9.3).
    if (ctx && ctx.dropCreation) out = out.filter(function (e) { return EFFECT_KINDS[e.k] !== 'creation'; });
    return out;
  }

  function highestStat(ch) {
    var best = STATS[0];
    for (var i = 1; i < STATS.length; i++) if ((ch.stats[STATS[i]] || 0) > (ch.stats[best] || 0)) best = STATS[i];
    return best;
  }

  function statMatches(e, stat) {
    return !e.stat || e.stat === 'all' || e.stat === stat;
  }

  /* ---- condOk: the [roll] conditions of R12 ---- */
  function condOk(when, ctx) {
    ctx = ctx || {};
    switch (when) {
      case 'tn6plus': return (ctx.tn || 0) >= 6;
      case 'strain2': return (ctx.strain || 0) >= 2;
      case 'firstOfStage': return !!ctx.firstOfStage;
      case 'lastOfStage': return !!ctx.lastOfStage;
      case 'perDeadAlly': return (ctx.deadAllies || 0) > 0;
      case 'boss': return !!ctx.boss;
      case 'unusedStat': return !!ctx.unusedStat;
      case 'sameStatAsPrev': return !!ctx.sameStatAsPrev;
      case 'afterFailByOther': return !!ctx.afterFailByOther;
      case 'relay': return ctx.shape === 'relay';
      case 'chain': return ctx.shape === 'chain';
      case 'vault': return ctx.shape === 'vault';
      case 'toll': return ctx.shape === 'toll';
      case 'open': return ctx.shape === 'open';
      default: throw new Error('unknown cond when: ' + when);
    }
  }

  /* ---- query: the one answer function. Numeric kinds sum or max; flag kinds return a boolean. ---- */
  function query(list, k, ctx) {
    ctx = ctx || {};
    var i, e, n = 0, permN = 0, best = 0, found = false;
    for (i = 0; i < list.length; i++) {
      e = list[i];
      if (e.k !== k) continue;
      switch (k) {
        case 'flat':
          // R1.7: perm flats share a +3 cap per stat; conditional sources do not (they are k:'cond')
          if (!statMatches(e, ctx.stat)) break;
          if (e.perm) permN += (e.v || 0); else n += (e.v || 0);
          break;
        case 'floor':
          if (!statMatches(e, ctx.stat)) break;
          if ((e.v || 0) > best) best = e.v || 0;   // R1.3: the highest holds, they do not add
          found = true;
          break;
        case 'floorPlus':
          n += (e.v || 0); found = true; break;
        case 'surgeMinus':
          if (!statMatches(e, ctx.stat)) break;
          found = true; break;
        case 'cond':
          if (!statMatches(e, ctx.stat)) break;
          if (condOk(e.when, ctx)) n += (e.when === 'perDeadAlly' ? (e.v || 0) * (ctx.deadAllies || 0) : (e.v || 0));
          break;
        case 'grim':
          if ((ctx.deadAllies || 0) > 0) n += (e.v || 0);
          break;
        case 'relayPlus':
          if (ctx.shape === 'relay') n += (e.v || 0);
          break;
        case 'aspectDmg':
          n += (e.v || 0); break;
        case 'surgeAspect':
          if (!statMatches(e, ctx.stat)) break;
          if (ctx.surged) n += (e.v || 0);
          break;
        case 'toughness': case 'armor': case 'strikeLess': case 'benchPlus': case 'benchAlly':
        case 'respitePlus': case 'pushFree':
          n += (e.v != null ? e.v : (e.n != null ? e.n : 1)); found = true; break;
        case 'reroll1s':
          if (!statMatches(e, ctx.stat)) break;
          found = true; break;
        case 'twiceStage':
          if (!statMatches(e, ctx.stat)) break;
          if (ctx.autoOnly && !e.auto) break;
          found = true; n += 1; break;
        case 'sigilImmune': case 'sigilPartial':
          if (ctx.sigil && e.sigil !== ctx.sigil) break;
          found = true; n += 1; break;
        case 'extraRelic':
          found = true; n += 1; break;
        default:
          found = true; n += 1; break;
      }
    }
    switch (k) {
      case 'floor': return best;
      case 'flat': return Math.min(permN, B.FLAT_CAP) + n;   // R1.7 / R1.9
      case 'cond': case 'grim': case 'relayPlus': case 'aspectDmg': case 'surgeAspect':
      case 'toughness': case 'armor': case 'strikeLess': case 'benchPlus': case 'benchAlly':
      case 'respitePlus': case 'pushFree': case 'floorPlus':
        return n;
      default: return found;
    }
  }

  /* every record of one kind, for the kinds a caller needs to enumerate (extraRelic, sigilWard) */
  function queryAll(list, k) {
    var out = [];
    for (var i = 0; i < list.length; i++) if (list[i].k === k) out.push(list[i]);
    return out;
  }

  var EFFECTS = { collect: collect, query: query, queryAll: queryAll, condOk: condOk, KINDS: EFFECT_KINDS, WHENS: COND_WHENS };

  /* ================= DICE: R1 =================
   * roll(die, ctx) returns every part so a card can show the whole sentence.
   * ctx: { rng, surgeMinus, floor, flat, push, twice, reroll1s, noSurge, surgeOnce, shivering }
   */
  function floorCap(die) { return Math.floor(die / 2); }                    // R1.3 / R1.9
  function surgeThreshold(die, surgeMinus) {                                // R1.2 / R1.9
    return Math.max(die - (surgeMinus || 0), die - 1);
  }
  function effectiveFloor(die, floor, floorPlus, shivering) {               // R1.3, R4.4
    if (shivering) return 0;                                                // R9.2 Shivering: floors ignored
    if (!floor) return 0;
    return Math.min(floor + (floorPlus || 0), floorCap(die));
  }

  function oneRoll(die, ctx) {
    var rng = ctx.rng;
    var T = surgeThreshold(die, ctx.surgeMinus);
    var natural = rng.die(die);
    var rerolled = false;
    if (ctx.reroll1s && natural === 1) { natural = rng.die(die); rerolled = true; }   // R1.8
    // 1. surge test on the NATURAL (R1.1 step 1, R1.2)
    var willSurge = natural >= T;
    if (ctx.noSurge) willSurge = false;                                     // R9.2 Hollow Air
    // 2. floor on the natural (R1.1 step 2). A floored value never surges (R1.3): the test above used the natural.
    var F = effectiveFloor(die, ctx.floor, ctx.floorPlus, ctx.shivering);
    var floored = Math.max(natural, F);
    // 3. add surge dice (R1.1 step 3). Floors never apply to surge dice (R1.3).
    var chain = [];
    if (willSurge) {
      var guard = 0;
      var nx = rng.die(die);
      chain.push(nx);
      while (nx >= T && !ctx.surgeOnce && guard++ < 200) { nx = rng.die(die); chain.push(nx); }
    }
    var base = floored + sum(chain);
    return { die: die, T: T, natural: natural, floored: floored, floorUsed: F, chain: chain, base: base,
      surged: chain.length > 0, rerolled: rerolled };
  }

  function roll(die, ctx) {
    ctx = ctx || {};
    if (!ctx.rng) throw new Error('roll needs ctx.rng');
    var r = oneRoll(die, ctx);
    var alt = null;
    if (ctx.twice) {                                                        // R1.8 roll twice take higher
      alt = oneRoll(die, ctx);
      if (alt.base > r.base) { var t = r; r = alt; alt = t; }
    }
    var mods = ctx.flat || 0;
    var push = ctx.push ? B.PUSH_BONUS : 0;                                 // R1.6
    r.mods = mods;
    r.push = push;
    r.total = r.base + mods + push;
    r.twiceAlt = alt;
    return r;
  }

  /* Exact P(total >= tn) for a die under one roll ctx. Used by SIM.policy and the harness. */
  var _probMemo = {};
  function passProb(die, tn, opts) {
    opts = opts || {};
    var T = surgeThreshold(die, opts.surgeMinus);
    var F = effectiveFloor(die, opts.floor, opts.floorPlus, opts.shivering);
    if (opts.noSurge) T = die + 1;                                          // nothing surges
    var need = tn - (opts.flat || 0) - (opts.push ? B.PUSH_BONUS : 0);
    var key = die + '|' + T + '|' + F + '|' + need + '|' + (opts.reroll1s ? 1 : 0) + '|' + (opts.twice ? 1 : 0);
    if (_probMemo[key] != null) return _probMemo[key];
    var chainMemo = {};
    function G(n) { // P(a fresh exploding die of this size reaches n)
      if (n <= 1) return 1;
      if (n > 400) return 0;
      if (chainMemo[n] != null) return chainMemo[n];
      var p = 0;
      for (var f = 1; f <= die; f++) {
        if (f >= T) p += G(n - f); else if (f >= n) p += 1;
      }
      p = p / die;
      chainMemo[n] = p;
      return p;
    }
    function once(n) { // P(the first die, floored, plus its chain, reaches n)
      var p = 0;
      for (var f = 1; f <= die; f++) {
        var v = Math.max(f, F);
        if (f >= T) p += G(n - v); else if (v >= n) p += 1;
      }
      return p / die;
    }
    var p;
    if (opts.reroll1s) {
      // one redraw on a natural 1 (R1.8): P = (1/die) * P(second roll passes) + P(first natural >= 2 and passes)
      var pAll = once(need);
      var pOne = (Math.max(1, F) >= need ? 1 : 0);                          // a natural 1 (floored) never surges
      p = (1 / die) * pAll + (pAll - pOne / die);
    } else {
      p = once(need);
    }
    if (opts.twice) p = 1 - (1 - p) * (1 - p);
    if (p < 0) p = 0; if (p > 1) p = 1;
    _probMemo[key] = p;
    return p;
  }

  var DICE_API = { roll: roll, oneRoll: oneRoll, passProb: passProb, surgeThreshold: surgeThreshold,
    floorCap: floorCap, effectiveFloor: effectiveFloor };

  /* ================= derived character numbers (R2.3) ================= */
  function effStat(ch, stat, list) {                                        // stepStat is an [equip] effect
    list = list || collect(ch);
    var steps = 0;
    for (var i = 0; i < list.length; i++) if (list[i].k === 'stepStat' && list[i].stat === stat) steps++;
    return stepDie(ch.stats[stat], steps);
  }
  function effToughness(ch, list) {                                         // R2.3
    list = list || collect(ch);
    return B.BASE_TOUGHNESS - (ch.scars || 0) + query(list, 'toughness', {});
  }
  function effArmor(ch, list, quest) {                                      // R2.3, R9.2 Rustbound
    list = list || collect(ch);
    var a = query(list, 'armor', {});
    if (quest && hasSigil(quest, 'rustbound')) {
      if (sigilRelief(ch, quest, 'rustbound') === 'immune') return a;
      return sigilRelief(ch, quest, 'rustbound') === 'partial' ? Math.min(a, 1) : 0;  // R9.3: keeps 1
    }
    return a;
  }
  function canDeploy(ch) { return ch.alive && effToughness(ch) > 0; }       // R2.3
  function hasSigil(quest, sig) { return !!quest && quest.sigils.indexOf(sig) >= 0; }
  function sigilRelief(ch, quest, sig) {                                    // R9.3
    if (!hasSigil(quest, sig)) return 'none';
    var list = collect(ch);
    if (query(list, 'sigilImmune', { sigil: sig })) return 'immune';
    if (query(list, 'sigilPartial', { sigil: sig })) return 'partial';
    return 'none';
  }
