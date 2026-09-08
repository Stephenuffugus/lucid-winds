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

  /* ================= DATA: placeholder banks (R10) =================
   * The authored banks live in plans/marrowdeep/data/*.json. setData() swaps them in whole.
   * Nothing here is a tunable number; these are words and authored content.
   */
  var DATA = {
    names: {
      first: ['Vessa', 'Brannoc', 'Caddon', 'Dorric', 'Edric', 'Fennic', 'Gavrel', 'Hesper', 'Iselle', 'Jasker', 'Kesta', 'Lorcan'],
      second: ['Orn', 'Marrowe', 'Fen', 'Ashgrave', 'Blackmoor', 'Reddick', 'Stillwater', 'Coldharbour', 'Grimsby', 'Waite', 'Thorne', 'Vance']
    },
    // R10.2 / R7.5. Six bosses, three Aspects on three stats plus the authored fourth on the missing stat (R7.1).
    bosses: [
      { id: 'drowned_gate', name: 'The Drowned Gate', intro: 'A gate of iron and bone stands in the flood.', cause: 'drowned at the Gate', aspects: [
        { name: 'Grasping Chains', stat: 'might', tn: 5, hp: 3 }, { name: 'Choir of the Sunk', stat: 'nerve', tn: 5, hp: 3 },
        { name: 'Shifting Locks', stat: 'wits', tn: 4, hp: 4 }, { name: 'The Weeping Bars', stat: 'grace', tn: 5, hp: 3 } ] },
      { id: 'bell_below', name: 'The Bell Below', intro: 'A bell the size of a chapel hangs in the flood.', cause: 'fell silent under the Bell', aspects: [
        { name: 'The Swinging Tongue', stat: 'grace', tn: 5, hp: 3 }, { name: 'The Wet Knots', stat: 'wits', tn: 4, hp: 3 },
        { name: 'The Long Note', stat: 'nerve', tn: 5, hp: 4 }, { name: 'The Iron Yoke', stat: 'might', tn: 5, hp: 3 } ] },
      { id: 'silt_mother', name: 'The Silt Mother', intro: 'The floor of the hall breathes.', cause: 'went under the Silt', aspects: [
        { name: 'Settling Weight', stat: 'might', tn: 5, hp: 4 }, { name: 'The Slow Mouth', stat: 'grace', tn: 4, hp: 3 },
        { name: 'Her Patience', stat: 'nerve', tn: 5, hp: 3 }, { name: 'The Read Current', stat: 'wits', tn: 5, hp: 3 } ] },
      { id: 'lamp_keeper', name: 'The Lamp Keeper', intro: 'Something holds a light at the far end and does not move.', cause: 'was left in the dark', aspects: [
        { name: 'The Held Light', stat: 'wits', tn: 5, hp: 3 }, { name: 'The Long Reach', stat: 'might', tn: 4, hp: 4 },
        { name: 'The Unblinking', stat: 'nerve', tn: 5, hp: 3 }, { name: 'The Turned Step', stat: 'grace', tn: 5, hp: 3 } ] },
      { id: 'rope_bridge', name: 'The Rope of Names', intro: 'Every strand of it was somebody.', cause: 'was cut from the Rope', aspects: [
        { name: 'The Fraying Span', stat: 'grace', tn: 5, hp: 3 }, { name: 'The Called Names', stat: 'nerve', tn: 4, hp: 4 },
        { name: 'The Knotted End', stat: 'might', tn: 5, hp: 3 }, { name: 'The Counted Strands', stat: 'wits', tn: 5, hp: 3 } ] },
      { id: 'cold_choir', name: 'The Cold Choir', intro: 'They have been singing one word since the water came.', cause: 'joined the Choir', aspects: [
        { name: 'The Held Breath', stat: 'nerve', tn: 5, hp: 4 }, { name: 'The Turning Verse', stat: 'wits', tn: 4, hp: 3 },
        { name: 'The Risen Hands', stat: 'might', tn: 5, hp: 3 }, { name: 'The Quick Descant', stat: 'grace', tn: 5, hp: 3 } ] }
    ],
    // R10.6 placeholder relic words. The real lists are in data/relic-words.json.
    relicWords: {
      affix: {},   // filled below with a placeholder row per affix key
      base: {
        head: ['Coronet', 'Hood', 'Mask', 'Circlet', 'Cowl', 'Helm'],
        chest: ['Halfplate', 'Coat', 'Harness', 'Cuirass', 'Wrap', 'Shell'],
        hands: ['Gauntlets', 'Wraps', 'Grips', 'Mitts', 'Bracers', 'Claws'],
        feet: ['Boots', 'Treads', 'Sandals', 'Greaves', 'Shoes', 'Stilts'],
        weapon: ['Hook', 'Maul', 'Pick', 'Blade', 'Flail', 'Spike'],
        charm: ['Coin', 'Knot', 'Tooth', 'Bead', 'Feather', 'Bell'],
        sigilWard: ['Ward', 'Sign', 'Seal', 'Mark', 'Token', 'Cipher'],
        token: ['Chit', 'Stone', 'Tally', 'Shard', 'Ring', 'Nail']
      }
    },
    // R10.4 placeholder uniques. The real twenty are in data/uniques.json.
    uniques: [
      { id: 'still_water', name: 'Still Water', slots: ['sigilWard'], eff: [{ k: 'sigilImmune', sigil: 'hollowAir' }], line: 'The air holds.' },
      { id: 'ninth_hour', name: 'The Ninth Hour', slots: ['token'], eff: [{ k: 'cond', when: 'boss', v: 2 }], line: 'It keeps its own time.' },
      { id: 'old_bone', name: 'Old Bone', slots: ['chest'], eff: [{ k: 'toughness', v: 2 }], line: 'It has been broken before.' },
      { id: 'long_climb', name: 'The Long Climb', slots: ['hands'], eff: [{ k: 'stepStat', stat: 'grace' }], line: 'One more rung.' },
      { id: 'low_tide', name: 'Low Tide', slots: ['head'], eff: [{ k: 'floor', stat: 'all', v: 3 }], line: 'Nothing goes lower.' },
      { id: 'even_keel', name: 'The Even Keel', slots: ['feet'], eff: [{ k: 'benchPlus', v: 2 }], line: 'Rest is a skill.' },
      { id: 'drowned_edge', name: 'The Drowned Edge', slots: ['weapon'], eff: [{ k: 'aspectDmg', v: 2 }], line: 'It remembers the gate.' },
      { id: 'second_chance', name: 'Second Chance', slots: ['charm'], eff: [{ k: 'rerollStage' }], line: 'Once more, then.' }
    ],
    // R10.1 placeholder challenge lines, one bank per shape (Gate and Chain per stat).
    challenges: {
      gate: { might: ['A door of wet oak holds and you set your shoulder to it.'], grace: ['The ledge is a hand wide and you take it.'],
        wits: ['The marks on the wall are a count and you read them.'], nerve: ['Something asks your name and you do not answer.'] },
      chain: { might: ['You hold the beam, then you lift it.'], grace: ['You cross the span, then you cross back.'],
        wits: ['You read the lock, then you turn it.'], nerve: ['You stand your ground, then you keep standing.'] },
      relay: ['One of you holds the rope while the other goes down.'],
      vault: ['A sealed thing, and no obvious way in.'],
      toll: ['The way is open to anyone willing to bleed for it.'],
      open: ['A gap in the wall, and any way through will do.']
    },
    traits: null   // data/traits.json merges here; the seeded twelve live in TRAITS
  };
  (function seedRelicWords() {
    Object.keys(DEFAULT_BALANCE.AFFIXES).forEach(function (k) {
      DATA.relicWords.affix[k] = { prefix: ['Wellset', 'Silted', 'Grim', 'Risen'], suffix: ['the Even Keel', 'Still Water', 'the Old Bone', 'the Long Climb'] };
    });
  })();
  function setData(d) {
    Object.keys(d || {}).forEach(function (k) { DATA[k] = d[k]; });
    if (d && d.traits) {
      // authored traits merge alongside the seeded twelve; R12 refuses an unknown kind
      Object.keys(d.traits).forEach(function (id) {
        var t = d.traits[id];
        for (var i = 0; i < (t.eff || []).length; i++) {
          if (!EFFECT_KINDS[t.eff[i].k]) throw new Error('trait ' + id + ' uses unknown effect kind ' + t.eff[i].k);
          if (t.eff[i].k === 'cond' && COND_WHENS.indexOf(t.eff[i].when) < 0) throw new Error('trait ' + id + ' uses unknown cond when ' + t.eff[i].when);
        }
      });
    }
    return DATA;
  }
  function data() { return DATA; }

  /* ================= GEN ================= */

  /* R2.2: tier from lifetime Renown; rows 1,3,5,7,10 authored, the rest interpolated and renormalised. */
  function renownTier(lifetime) {
    var t = 1, th = B.RENOWN_TIER_THRESHOLDS;
    for (var i = 0; i < th.length; i++) if (lifetime >= th[i]) t++;
    return t;
  }
  function tierWeights(tier) {
    tier = Math.max(1, Math.min(10, tier || 1));
    var rows = B.TIER_WEIGHTS;
    if (rows[tier]) return rows[tier].slice();
    var anchors = [1, 3, 5, 7, 10], lo = 1, hi = 10, i;
    for (i = 0; i < anchors.length; i++) { if (anchors[i] <= tier) lo = anchors[i]; }
    for (i = anchors.length - 1; i >= 0; i--) { if (anchors[i] >= tier) hi = anchors[i]; }
    var f = (tier - lo) / (hi - lo);
    var a = rows[lo], b = rows[hi], out = [], s = 0;
    for (i = 0; i < a.length; i++) { var v = a[i] + (b[i] - a[i]) * f; out.push(v); s += v; }
    for (i = 0; i < out.length; i++) out[i] = out[i] * 100 / s;   // renormalised (R2.2)
    return out;
  }

  function rollStat(rng, weights, floorDie) {
    var d = DICE[rng.weighted(weights)];
    if (floorDie && d < floorDie) d = floorDie;     // R8.6 creation floor
    return d;
  }

  function nameCharacter(rng, account) {                                     // R10.5
    var used = (account && account.usedNames) || {};
    var n = '', guard = 0;
    do {
      n = rng.pick(DATA.names.first) + ' ' + rng.pick(DATA.names.second);
      guard++;
    } while (used[n] && guard < 200);
    if (account) { if (!account.usedNames) account.usedNames = {}; account.usedNames[n] = 1; }
    return n;
  }

  function newCharacter(rng, account, opts) {                                // R2.1
    opts = opts || {};
    account = account || newAccount(0);
    var w = tierWeights(renownTier(account.renownLifetime || 0));
    var ch = { id: 'c' + (account.nextId = (account.nextId || 0) + 1), name: '', origin: null, calling: null,
      stats: {}, traits: [], scars: 0, strain: 0, armorPool: 0, alive: true, questsSurvived: 0,
      excised: false, gear: {}, unkillableUsed: false, benchOnceUsed: false, deployed: false };
    var i;
    for (i = 0; i < STATS.length; i++) ch.stats[STATS[i]] = rollStat(rng, w, (account.creationFloors || {})[STATS[i]] || 4);
    // Origin dealt from the unlocked pool, then applied (R2.1)
    var pool = (account.unlockedOrigins && account.unlockedOrigins.length) ? account.unlockedOrigins
      : Object.keys(ORIGINS).filter(function (k) { return ORIGINS[k].unlocked; });
    ch.origin = opts.origin || rng.pick(pool);
    var oeff = ORIGINS[ch.origin].eff;
    for (i = 0; i < oeff.length; i++) {
      if (oeff[i].k === 'creationShift') {                                   // R4.5 Straycall, AFTER the floor
        var sh = oeff[i].shift;
        Object.keys(sh).forEach(function (st) { ch.stats[st] = stepDie(ch.stats[st], sh[st]); });
      } else if (oeff[i].k === 'creationFifth') {                            // R4.8 Unmarked
        var fifth = rollStat(rng, w, 0);
        var lowest = STATS[0];
        for (var s2 = 1; s2 < STATS.length; s2++) if (ch.stats[STATS[s2]] < ch.stats[lowest]) lowest = STATS[s2];
        ch.stats[lowest] = fifth;
      }
    }
    ch.name = opts.name || nameCharacter(rng, account);
    ch.dealt = dealCallings(rng, account);
    if (opts.calling) ch.calling = opts.calling;
    return ch;
  }

  function dealCallings(rng, account) {                                      // R8.7
    var out = [], seen = {}, i;
    var legacies = (account && account.legacies) || [];
    var con = null;
    for (i = 0; i < legacies.length; i++) if (legacies[i].consecrated) con = legacies[i];
    if (con) { out.push({ calling: con.calling, legacy: con }); seen[con.calling] = 1; }
    var slots = (account && account.legacySlots) || B.LEGACY_SLOTS_START;
    var rest = rng.shuffle(legacies.filter(function (l) { return !l.consecrated && !seen[l.calling]; }));
    for (i = 0; i < rest.length && out.length < B.CALLINGS_DEALT && (out.length - (con ? 1 : 0)) < slots; i++) {
      if (seen[rest[i].calling]) continue;
      out.push({ calling: rest[i].calling, legacy: rest[i] }); seen[rest[i].calling] = 1;
    }
    var stock = rng.shuffle(Object.keys(CALLINGS).filter(function (k) { return !seen[k]; }));
    for (i = 0; out.length < B.CALLINGS_DEALT && i < stock.length; i++) { out.push({ calling: stock[i], legacy: null }); seen[stock[i]] = 1; }
    return out;
  }

  function dealTraits(rng, ch) {                                             // R2.5
    var owned = {}, i;
    for (i = 0; i < ch.traits.length; i++) owned[ch.traits[i]] = 1;
    var pool = Object.keys(TRAITS).concat(DATA.traits ? Object.keys(DATA.traits) : []);
    pool = rng.shuffle(pool.filter(function (k) { return !owned[k]; }));
    return pool.slice(0, B.TRAITS_DEALT);
  }

  /* ---- R6.1 to R6.5: relics ---- */
  function rarityIndex(r) { return RARITIES.indexOf(r); }

  function rollRarity(rng, depth, tierUp) {                                  // R6.1
    var w = B.DROP_WEIGHTS[depth - 1];
    var i = rng.weighted(w);
    i = Math.min(RARITIES.length - 1, i + (tierUp || 0));                    // "+1 rarity tier", Relic stays Relic
    while (B.BUDGETS[depth - 1][i] === 0 && i < RARITIES.length - 1) i++;    // Depth IV and V drop no Commons
    return i;
  }

  function validAffixKeys(slot, remainder, usedKeys) {                       // R6.2
    var out = [];
    Object.keys(B.AFFIXES).forEach(function (k) {
      var a = B.AFFIXES[k];
      if (a.slots.indexOf(slot) < 0) return;
      if (a.pts > remainder) return;
      if (usedKeys[k] && !a.statTarget) return;                              // no repeated key on one item
      if (a.statTarget && usedKeys[k] && usedKeys[k].length >= STATS.length) return;
      out.push(k);
    });
    return out.sort();
  }

  function fillAffixes(rng, slot, budget) {                                  // R6.2, R6.3
    var used = {}, out = [], rem = budget, draws = 0;
    while (rem > 0 && draws < B.AFFIX_DRAW_CAP) {
      draws++;
      var keys = validAffixKeys(slot, rem, used);
      if (!keys.length) break;
      var key = keys[rng.int(keys.length)];
      var def = B.AFFIXES[key];
      var eff = clone(def.eff), stat = null, sigil = null, i;
      if (def.statTarget) {
        var taken = used[key] || [];
        var free = STATS.filter(function (s) { return taken.indexOf(s) < 0; });
        stat = free[rng.int(free.length)];                                   // R6.3 uniform over the free stats
        for (i = 0; i < eff.length; i++) if (eff[i].stat === '*') eff[i].stat = stat;
        used[key] = taken.concat([stat]);
      } else if (def.sigilTarget) {
        sigil = SIGILS[rng.int(SIGILS.length)];                              // R9.3: a Ward names one Sigil
        for (i = 0; i < eff.length; i++) if (eff[i].sigil === '*') eff[i].sigil = sigil;
        used[key] = true;
      } else {
        used[key] = true;
      }
      out.push({ key: key, pts: def.pts, stat: stat, sigil: sigil, eff: eff });
      rem -= def.pts;
    }
    if (rem > 0) {
      // R6.2: the remainder becomes Toughness, 1 point each, which every slot may carry. Written as ONE
      // line of v = remainder so the "never repeat a key on one item" law of R6.2 still reads true.
      out.push({ key: 'toughness', pts: rem, stat: null, sigil: null, filler: true,
        eff: [{ k: 'toughness', v: rem }] });
      rem = 0;
    }
    return out;
  }

  function nameRelic(rng, slot, affixes, unique) {                           // R6.5
    if (unique) return unique.name;
    var order = affixes.map(function (a, i) { return { a: a, i: i }; });
    order.sort(function (x, y) { return (y.a.pts - x.a.pts) || (x.i - y.i); });  // ties: drawn first
    var bases = DATA.relicWords.base[slot] || ['Thing'];
    var base = bases[rng.int(bases.length)];
    var w1 = DATA.relicWords.affix[order[0].a.key] || { prefix: ['Plain'], suffix: ['the Deep'] };
    var prefix = w1.prefix[rng.int(w1.prefix.length)];
    if (order.length < 2) return prefix + ' ' + base;
    var w2 = DATA.relicWords.affix[order[1].a.key] || { prefix: ['Plain'], suffix: ['the Deep'] };
    return prefix + ' ' + base + ' of ' + w2.suffix[rng.int(w2.suffix.length)];
  }

  function newRelic(rng, depth, opts) {                                      // R6.1 to R6.5
    opts = opts || {};
    var slot = opts.slot || SLOTS[rng.int(SLOTS.length)];
    var ri = opts.rarity != null ? rarityIndex(opts.rarity) : rollRarity(rng, depth, opts.tierUp);
    if (opts.rarity != null && opts.tierUp) ri = Math.min(RARITIES.length - 1, ri + opts.tierUp);
    var budget = B.BUDGETS[depth - 1][ri];
    if (budget === 0) { ri = Math.min(RARITIES.length - 1, ri + 1); budget = B.BUDGETS[depth - 1][ri]; }
    var affixes = fillAffixes(rng, slot, budget);
    var unique = null;
    if (RARITIES[ri] === 'relic') {                                          // R6.4
      var pool = DATA.uniques.filter(function (u) { return u.slots.indexOf(slot) >= 0; });
      if (pool.length) unique = pool[rng.int(pool.length)];
    }
    return { id: 'r' + rng.int(0x7fffffff), slot: slot, rarity: RARITIES[ri], budget: budget,
      pts: sum(affixes.map(function (a) { return a.pts; })), affixes: affixes, unique: unique,
      name: nameRelic(rng, slot, affixes, unique), depth: depth };
  }

  /* R6.3 at the moment it can be read: a step on a stat already at d12 retargets on the wearer. */
  function retargetForWearer(item, ch, rng) {
    for (var i = 0; i < item.affixes.length; i++) {
      var a = item.affixes[i];
      if (a.key !== 'stepStat') continue;
      if (ch.stats[a.stat] < 12) continue;
      var free = STATS.filter(function (s) { return ch.stats[s] < 12; });
      if (!free.length) { a.key = 'toughness'; a.stat = null; a.eff = [{ k: 'toughness', v: a.pts }]; a.filler = true; }
      else { var s2 = rng ? free[rng.int(free.length)] : free[0]; a.stat = s2; a.eff = [{ k: 'stepStat', stat: s2 }]; }
    }
    return item;
  }

  /* ---- R5.4, R5.5, R7.1, R9.1, R9.2: a whole quest from one seed ---- */
  function pickStat(rng, statRow) { return STATS[rng.weighted(B.STAT_FREQ[statRow])]; }

  function textFor(rng, shape, stat, used) {
    var bank = DATA.challenges[shape];
    if (bank && !Array.isArray(bank)) bank = bank[stat] || bank[STATS[0]];
    if (!bank || !bank.length) return { key: shape, i: 0 };
    var key = shape + (stat ? ':' + stat : '');
    used[key] = used[key] || {};
    var tries = 0, i = rng.int(bank.length);
    while (used[key][i] && tries++ < bank.length * 2) i = rng.int(bank.length);
    used[key][i] = 1;
    return { key: key, i: i, line: bank[i] };
  }

  function makeSlot(rng, shape, row, depth, used) {                          // R5.5, R5.9
    var mult = B.DEPTH_RENOWN_MULT[depth - 1];
    var s = { shape: shape, stats: [], tns: [], tags: [], strainOnFail: row.strainOnFail,
      reward: { renown: Math.round(B.RENOWN[shape] * mult), relicRolls: B.RELIC_ROLLS[shape], tierUp: B.RELIC_TIER_UP[shape] || 0 },
      fee: 0, checks: 1, passed: null };
    var st;
    if (shape === 'gate') {
      st = pickStat(rng, row.statRow);
      s.stats = [st]; s.tns = [parseInt(rng.weighted(B.GATE_TN_WEIGHTS), 10)];
    } else if (shape === 'chain') {
      st = pickStat(rng, row.statRow);
      s.stats = [st, st]; s.tns = B.TN.chain.slice(); s.checks = 2;          // one sustained effort
    } else if (shape === 'relay') {
      s.stats = [pickStat(rng, row.statRow), pickStat(rng, row.statRow)];    // rolled independently, may match
      s.tns = B.TN.relay.slice(); s.checks = 2;
    } else if (shape === 'vault') {
      s.stats = [null]; s.tns = [B.TN.vault];                                // stat chosen at assignment
    } else if (shape === 'toll') {
      st = pickStat(rng, row.statRow);
      s.stats = [st]; s.tns = [B.TN.toll]; s.fee = B.TOLL_FEE;
    } else if (shape === 'open') {
      s.stats = [null]; s.tns = [B.TN.open];
    }
    var t = textFor(rng, shape, s.stats[0], used);
    s.textKey = t.key; s.textIdx = t.i; s.text = t.line;
    return s;
  }

  function newQuest(seed, depth, opts) {                                     // R5.1 to R5.5, R7.1, R9.1, R9.2
    opts = opts || {};
    var rng = makeRng(typeof seed === 'number' ? seed >>> 0 : seedFromString(seed));
    var mult = B.DEPTH_RENOWN_MULT[depth - 1];
    var q = { seed: seed, depth: depth, depthName: B.DEPTH_NAMES[depth - 1], sigils: [], bossIds: [], stages: [] };
    // R9.2 Sigils: a count by Depth, distinct, no exclusion table
    var range = B.SIGIL_COUNT[depth];
    var nSig = range[0] + rng.int(range[1] - range[0] + 1);
    q.sigils = rng.shuffle(SIGILS).slice(0, nSig).sort();
    var rows = B.COMPOSITION[depth];
    var bossRows = rows.filter(function (r) { return r.boss; }).length;
    q.bossIds = rng.shuffle(DATA.bosses.map(function (b) { return b.id; })).slice(0, bossRows);   // R7.6 no repeat
    var used = {}, bossN = 0, sealed = B.SEALED_STAGES[depth] || [];
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i], n = i + 1;
      if (row.boss) {
        var bid = q.bossIds[bossN++];
        var bd = DATA.bosses.filter(function (b) { return b.id === bid; })[0];
        var count = depth >= 4 ? 4 : 3;                                      // R7.1: the fourth Aspect at IV and V
        var aspects = [];
        for (var a = 0; a < count; a++) {
          var src = bd.aspects[a];
          var hp = src.hp + B.ASPECT_HP_BONUS[depth - 1];
          if (row.first) hp = Math.ceil(hp / 2);                             // R7.6 the first boss at half
          aspects.push({ name: src.name, stat: src.stat, tn: src.tn, hp: hp, maxHp: hp, broken: false });
        }
        q.stages.push({ n: n, boss: true, first: !!row.first, bossId: bid, bossName: bd.name, intro: bd.intro,
          cause: bd.cause, aspects: aspects, strainOnFail: 0,
          reward: { renown: Math.round((row.first ? B.RENOWN.firstBoss : B.RENOWN.boss) * mult), relicRolls: B.RELIC_ROLLS.boss, tierUp: B.RELIC_TIER_UP.boss } });
        continue;
      }
      var slots = [];
      for (var sIdx = 0; sIdx < row.slots.length; sIdx++) {
        var shape = rng.weighted(row.slots[sIdx]);
        if (sealed.indexOf(n) >= 0 && sIdx === 1) shape = 'vault';           // R9.1: sealed stages
        slots.push(makeSlot(rng, shape, row, depth, used));
      }
      if (rng.next() < 0.5) slots.reverse();                                 // R5.4: slot order is rolled
      for (var z = 0; z < slots.length; z++) slots[z].i = z;
      q.stages.push({ n: n, boss: false, sealed: sealed.indexOf(n) >= 0, statRow: row.statRow,
        strainOnFail: row.strainOnFail, slots: slots });
    }
    return q;
  }
