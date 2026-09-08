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
    /* R7.4 CORRECTED (audit, Director call number one). The spec's 2 measured 81 percent per character death
     * and a 78 percent wipe against targets of 12 to 15 and 8. STRIKE 1 at Depth I and II is the cheapest
     * change that makes the spec's own boss prose true and leaves BASE_TOUGHNESS at 4 for the Scar treadmill. */
    STRIKE: [1, 1, 2, 3, 3],      // R7.4: per unbroken Aspect per round, by Depth
    /* R7.4 CORRECTED (audit): `attackers`. Every character who ACTUALLY ROLLED against that Aspect this round
     * takes one instance; an Aspect nobody faced strikes every living character. The other two laws are one word
     * away and both are refused by the audit: `all` wipes a fresh party whenever two Aspects survive round one,
     * and `spread` lands each point as its own instance, which makes a Vanguard immune to the boss and kills
     * through Unkillable one point at a time. The prototype's grid may move BALANCE.STRIKE only. */
    STRIKE_TARGET: 'attackers',   // R7.4: attackers | all | spread
    BENCH_CLEAR: 1,               // R5.6: what a bench clears before benchPlus
    PUSH_BONUS: 2,                // R1.6
    PUSH_STRAIN: 1,               // R1.6
    TOLL_FEE: 1,                  // R5.5, R3.1: paid on assignment, skips Armor
    AMBUSH_STRAIN: 1,             // R3.1: the GRACE consequence adds this on a failure
    CONTAGION_STRAIN: 1,          // R3.1: every OTHER living party member on a NERVE failure
    THIN_ICE_STRAIN: 2,           // R9.2: the first failure each stage costs this instead
    PRESSGANG_STRAIN: 1,          // R9.2: the third character takes this at stage end instead of benching
    FLAT_CAP: 3,                  // R1.7 / R1.9: permanent unconditional bonus per stat
    /* R5.5 CORRECTED (audit): TN 6 never occurred anywhere in the game under 4 or 5 at 50/50, so a whole
     * column of the master table was decorative and the 2 point Token affix "+2 versus TN 6 or more" was
     * worth a seventh of a +1 flat. One weight row fixes all three. */
    GATE_TN_WEIGHTS: { 4: 40, 5: 40, 6: 20 },  // R5.5
    COMPOSED_CAP: 5,              // R1.9 CORRECTED: floor + total permanent flat on one stat. FIVE, not six: R5.5
                                  // now deals Gate TNs of 6, so a floor of 6 would auto pass all but the Vault.
    FILLER_MAX: 2,                // R6.2 (c): the most Toughness a filler line may carry
    SCAR_EVERY: 2,                // R2.5 CORRECTED (audit): a Scar every N quests survived
    RETIRE_VESTING: 3,            // R2.6 CORRECTED (audit): 2 + traits only at this many quests survived
    REST_FRACTION: 1,             // R8.3: the share of Strain an un deployed roster character clears
    PRICE_INDEX: [1, 1.5, 2.25, 3.4, 5.1],  // R8.0b: every RENOWN price x this, nearest 5. NEVER Marrow prices:
                                            // Marrow income scales on DEPTH_MARROW_MULT, not on this.
    SLOT_WEIGHTS: { head: 1, chest: 1, hands: 1, feet: 1, weapon: 1, charm: 1, sigilWard: 1, token: 1 }, // R6.1
    FREE_ROLLS: 3,                // R2.1: a new account gets three characters free
    TEXT_RING: 3,                 // R10.1: no challenge line repeats inside the last this many quests
    TN: { chain: [3, 4], relay: [4, 4], vault: 7, toll: 3, open: 3 }, // R5.5
    /* R5.9 CORRECTED (audit) on the Vault, which carried the game's only TN 7 and, at Depth IV, the seal a
     * party must beat to leave the stage, while paying the second lowest expected value on the board. At 8
     * Renown and two rolls, the first at +1 tier, it pays 5.02 expected, the top of the ladder. */
    RENOWN: { gate: 3, open: 2, toll: 4, chain: 6, relay: 6, vault: 8, boss: 12, firstBoss: 8 }, // R5.9
    RELIC_ROLLS: { gate: 0, open: 0, toll: 1, chain: 1, relay: 1, vault: 2, boss: 1 },           // R5.9
    RELIC_TIER_UP: { vault: 1, boss: 1 },   // R5.9: the Vault's FIRST roll only, the boss's only roll
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
    /* spec 11.4, by Depth, over common/uncommon/rare/relic. R6.1 (a) CORRECTED the Depth IV row from
     * 10/45/34/11: it read Common 10 percent while 11.3 gives a Depth IV Common no point budget at all,
     * so one drop in ten had nothing to fill. */
    DROP_WEIGHTS: [
      [60, 28, 10, 2],
      [45, 35, 16, 4],
      [25, 42, 26, 7],
      [0, 55, 34, 11],
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
    MARROW_SHOP: { floorD6: 3, floorD8: 6, rosterSlotFirst: 4, rosterSlotStep: 2, rosterMax: 8, legacySlot: 2, legacyMax: 2, unlockOrigin: 5, consecrate: 6 }, // R8.2, R8.7
    CREATION_FLOORS: [4, 6, 8], // R8.6: the ladder a Marrow floor purchase walks
    RETIRE_MARROW: 2,           // R2.6: 2 + Traits, flat
    DEATH_MARROW: 1,            // R8.5: x DEPTH_MARROW_MULT
    ROSTER_START: 3,            // spec 8.3 / R8.2
    LEGACY_SLOTS_START: 1,      // R8.7: caps at 2, so at least one of the three cards is always a stock Calling
    PARTY_SIZE: 3,              // spec 7.1
    AFFIX_DRAW_CAP: 50,         // R6.2: at most 50 draws per item
    /* The affix table, spec 11.2. key -> points, valid slots, and the R12 effect it compiles to.
     * stat:'*' means "roll a stat at generation" (R6.3); sigil:'*' means "name a Sigil" (R9.3).
     * floorHalf writes v:'half', which R12 reads at roll time off the EFFECTIVE die, so a stepStat that
     * changes the die changes the floor with it. */
    AFFIXES: {
      flat:        { pts: 2, slots: ['token', 'hands', 'weapon'], statTarget: true, eff: [{ k: 'flat', stat: '*', v: 1, perm: true }] },
      floor3:      { pts: 1, slots: ['head'], statTarget: true, eff: [{ k: 'floor', stat: '*', v: 3 }] },
      floorHalf:   { pts: 2, slots: ['head'], statTarget: true, eff: [{ k: 'floor', stat: '*', v: 'half' }] },
      floorPlus:   { pts: 3, slots: ['head'], eff: [{ k: 'floorPlus', v: 1 }] },
      stepStat:    { pts: 2, slots: ['hands'], statTarget: true, eff: [{ k: 'stepStat', stat: '*' }] },  // R6.11: 2, not 3
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
      benchAlly:   { pts: 2, slots: ['feet'], eff: [{ k: 'benchAlly', v: 1 }] },   // R6.2: Feet gains this
      aspectDmg:   { pts: 2, slots: ['weapon'], eff: [{ k: 'aspectDmg', v: 1 }] },
      surgeAspect: { pts: 2, slots: ['weapon'], eff: [{ k: 'surgeAspect', v: 2 }] },
      sigilImmune: { pts: 3, slots: ['sigilWard'], sigilTarget: true, eff: [{ k: 'sigilImmune', sigil: '*' }] },
      sigilPartial:{ pts: 2, slots: ['sigilWard'], sigilTarget: true, eff: [{ k: 'sigilPartial', sigil: '*' }] },
      condTn6:     { pts: 2, slots: ['token'], eff: [{ k: 'cond', when: 'tn6plus', v: 2 }] },
      condStrain2: { pts: 1, slots: ['token'], eff: [{ k: 'cond', when: 'strain2', v: 1 }] },
      condFirst:   { pts: 2, slots: ['token'], eff: [{ k: 'cond', when: 'firstOfStage', v: 2 }] },
      condLast:    { pts: 2, slots: ['token'], eff: [{ k: 'cond', when: 'lastOfStage', v: 2 }] },
      condDeadAlly:{ pts: 1, slots: ['token'], eff: [{ k: 'cond', when: 'perDeadAlly', v: 1 }] }  // R10.6 names this key
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
    // 'highest' resolves against this character's EFFECTIVE dice, stepStat included (R6.3, R4.17 Deepdrawn:
    // ties by stat order). Read off the list already gathered, so it never recurses through effStat.
    var steps = {}, hi = null, hiDie = -1, si;
    for (si = 0; si < out.length; si++) if (out[si].k === 'stepStat' && out[si].stat) steps[out[si].stat] = (steps[out[si].stat] || 0) + 1;
    for (si = 0; si < STATS.length; si++) {
      var d0 = stepDie(ch.stats[STATS[si]], steps[STATS[si]] || 0);
      if (d0 > hiDie) { hiDie = d0; hi = STATS[si]; }
    }
    for (var o = 0; o < out.length; o++) if (out[o].stat === 'highest') out[o].stat = hi;
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
  /* R1.3 CORRECTED (audit): the cap is `die / 2 + floorPlus`, not die / 2 applied after floorPlus, which made
   * both the 3 point Head affix and Ironbound worth nothing on a stat already at its half die floor.
   * `floor` here is already the composed value; `capBonus` is the total floorPlus that raises the ceiling. */
  function effectiveFloor(die, floor, capBonus, shivering) {               // R1.3, R4.4
    if (shivering) return 0;                                              // R9.2 Shivering: floors ignored
    if (!floor) return 0;
    return Math.min(floor, floorCap(die) + (capBonus || 0));
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
    for (i = 0; i < STATS.length; i++) ch.stats[STATS[i]] = rollStat(rng, w, 0);
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
    /* R2.1 / R8.6 CORRECTED (audit): the creation floor is applied LAST, after the Origin, because a floor is a
     * guarantee the player paid Marrow for and applying it before Straycall showed a d4 NERVE on a stat the Hall
     * promised would never roll under d6. */
    for (i = 0; i < STATS.length; i++) {
      var fl = (account.creationFloors || {})[STATS[i]] || 4;
      if (ch.stats[STATS[i]] < fl) ch.stats[STATS[i]] = fl;
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
    /* R8.7 CORRECTED (audit): the deal holds `legacySlots` Legacy cards IN ALL (the consecrated one occupies
     * one of them), and legacySlots caps at 2, so at least one of the three cards is always a stock Calling.
     * Without that, buying the 2 Marrow Legacy slot up to 3 would permanently delete stock Callings from every
     * future deal, and the cheapest purchase in the game must not narrow the pool for the life of the account. */
    var slots = Math.min((account && account.legacySlots) || B.LEGACY_SLOTS_START, B.MARROW_SHOP.legacyMax);
    slots = Math.min(slots, B.CALLINGS_DEALT - 1);
    var rest = rng.shuffle(legacies.filter(function (l) { return !l.consecrated && !seen[l.calling]; }));
    for (i = 0; i < rest.length && out.length < slots; i++) {
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

  /* R6.2 CORRECTED (audit). A key may repeat only when its TARGET differs: a stat targeted key with another
   * stat, a Sigil targeted key with another Sigil (and immunity and partial never name the same Sigil, R9.3).
   * `toughness` and `armor` may each appear twice with no target at all, which is what lets Chest reach a
   * Depth V budget. Nothing else repeats. */
  var TWICE_OK = { toughness: 2, armor: 2 };
  function validAffixKeys(slot, remainder, used, namedSigils) {              // R6.2
    var out = [];
    Object.keys(B.AFFIXES).forEach(function (k) {
      var a = B.AFFIXES[k];
      if (a.slots.indexOf(slot) < 0) return;
      if (a.pts > remainder) return;
      if (a.statTarget) { if ((used[k] || []).length >= STATS.length) return; }
      else if (a.sigilTarget) { if (Object.keys(namedSigils).length >= SIGILS.length) return; }
      else if (TWICE_OK[k]) { if ((used[k] || 0) >= TWICE_OK[k]) return; }
      else if (used[k]) return;
      out.push(k);
    });
    return out.sort();
  }

  function fillAffixes(rng, slot, budget) {                                  // R6.2, R6.3
    var used = {}, namedSigils = {}, out = [], rem = budget, draws = 0;
    while (rem > 0 && draws < B.AFFIX_DRAW_CAP) {
      draws++;
      var keys = validAffixKeys(slot, rem, used, namedSigils);
      if (!keys.length) break;
      var key = keys[rng.int(keys.length)];
      var def = B.AFFIXES[key];
      var eff = clone(def.eff), stat = null, sigil = null, i;
      if (def.statTarget) {
        var taken = used[key] || [];
        var free = STATS.filter(function (s) { return taken.indexOf(s) < 0; });
        stat = free[rng.int(free.length)];                                   // R6.3: uniform, and never rerolled
        for (i = 0; i < eff.length; i++) if (eff[i].stat === '*') eff[i].stat = stat;
        used[key] = taken.concat([stat]);
      } else if (def.sigilTarget) {
        var freeSig = SIGILS.filter(function (g) { return !namedSigils[g]; }); // R9.3: never the same Sigil twice
        if (!freeSig.length) continue;
        sigil = freeSig[rng.int(freeSig.length)];
        for (i = 0; i < eff.length; i++) if (eff[i].sigil === '*') eff[i].sigil = sigil;
        namedSigils[sigil] = 1;
        used[key] = (used[key] || 0) + 1;
      } else {
        used[key] = (used[key] || 0) + 1;
      }
      out.push({ key: key, pts: def.pts, stat: stat, sigil: sigil, eff: eff });
      rem -= def.pts;
    }
    if (rem > 0 && rem <= B.FILLER_MAX) {
      /* R6.2 (a): the filler is ONE `toughness` line whose value is the whole remainder, capped at FILLER_MAX.
       * "Lines, plural, of one key" contradicted the no repeat rule in the same sentence, and an uncapped
       * remainder put +13 Toughness on one character over a base of 4, which deletes the Scar treadmill. */
      var existing = null;
      for (var t2 = 0; t2 < out.length; t2++) if (out[t2].key === 'toughness') existing = out[t2];
      if (existing && existing.pts + rem <= B.FILLER_MAX + 1) { existing.pts += rem; existing.eff = [{ k: 'toughness', v: existing.pts }]; }
      else out.push({ key: 'toughness', pts: rem, stat: null, sigil: null, filler: true, eff: [{ k: 'toughness', v: rem }] });
      rem = 0;
    }
    return { affixes: out, remainder: rem };
  }

  function nameRelic(rng, slot, affixes, unique) {                           // R6.5
    if (unique) return unique.name;
    var order = affixes.map(function (a, i) { return { a: a, i: i }; });
    order.sort(function (x, y) { return (y.a.pts - x.a.pts) || (x.i - y.i); });  // ties: drawn first
    var bases = DATA.relicWords.base[slot] || ['Thing'];
    var base = bases[rng.int(bases.length)];
    var w1 = DATA.relicWords.affix[order[0].a.key] || { prefix: ['Plain'], suffix: ['the Deep'] };
    var prefix = w1.prefix[rng.int(w1.prefix.length)];
    /* R6.5 CORRECTED (audit): a ONE affix item draws its suffix from that same affix's list. A one affix item is
     * every 2 point Common, about 60 percent of Depth I drops, and with no "of" clause it had 4 x 6 = 24 possible
     * names, which repeat inside the first hour; with one it has 96. */
    var w2 = order.length < 2 ? w1 : (DATA.relicWords.affix[order[1].a.key] || { prefix: ['Plain'], suffix: ['the Deep'] });
    return prefix + ' ' + base + ' of ' + w2.suffix[rng.int(w2.suffix.length)];
  }

  function newRelic(rng, depth, opts) {                                      // R6.1 to R6.5
    opts = opts || {};
    var slot = opts.slot || rng.weighted(B.SLOT_WEIGHTS);                    // R6.1: uniform over the eight
    var ri = opts.rarity != null ? rarityIndex(opts.rarity) : rollRarity(rng, depth, opts.tierUp);
    if (opts.rarity != null && opts.tierUp) ri = Math.min(RARITIES.length - 1, ri + opts.tierUp);
    var budget = B.BUDGETS[depth - 1][ri];
    if (budget === 0) { ri = Math.min(RARITIES.length - 1, ri + 1); budget = B.BUDGETS[depth - 1][ri]; }
    /* R6.2 (c): if the remainder still cannot be spent after 50 draws, the item is generated at the NEXT LOWER
     * rarity's budget for that Depth, and its rarity label follows the budget, so a card never lies. */
    var filled = fillAffixes(rng, slot, budget), guard = 0;
    while (filled.remainder > 0 && ri > 0 && guard++ < RARITIES.length) {
      ri--;
      while (ri > 0 && B.BUDGETS[depth - 1][ri] === 0) ri--;
      budget = B.BUDGETS[depth - 1][ri];
      filled = fillAffixes(rng, slot, budget);
    }
    var affixes = filled.affixes;
    var unique = null;
    if (RARITIES[ri] === 'relic') {                                          // R6.4
      var pool = DATA.uniques.filter(function (u) { return u.slots.indexOf(slot) >= 0; });
      if (pool.length) unique = pool[rng.int(pool.length)];
    }
    return { id: 'r' + rng.int(0x7fffffff), slot: slot, rarity: RARITIES[ri], budget: budget,
      pts: sum(affixes.map(function (a) { return a.pts; })), affixes: affixes, unique: unique,
      name: nameRelic(rng, slot, affixes, unique), depth: depth };
  }

  /* R6.3 CORRECTED (audit): generation never rerolls a stat, and equipping never retargets one, because a drop
   * is rolled before it is offered and later moves between characters, so "a d12 stat" has no referent at roll
   * time and retargeting at equip would mutate an item's name per wearer. A step onto a stat already at d12 is
   * GREYED and does nothing (the precedent is R1.7's fourth flat point) and the drop screen shows its delta as 0.
   * The ladder clamp in stepDie already delivers the "does nothing"; this reports which lines are dead. */
  function deadLines(item, ch) {
    var out = [];
    for (var i = 0; i < item.affixes.length; i++) {
      var a = item.affixes[i];
      if (a.key === 'stepStat' && a.stat && ch.stats[a.stat] >= 12) out.push(i);
    }
    return out;
  }

  /* ---- R5.4, R5.5, R7.1, R9.1, R9.2: a whole quest from one seed ---- */
  function pickStat(rng, statRow) { return STATS[rng.weighted(B.STAT_FREQ[statRow])]; }

  /* R10.1: a line is drawn without repeating inside a quest AND without repeating any line used in the last
   * TEXT_RING quests (a small recently used ring kept in the save). The banks are a quarter to a half of the
   * spec's stated target, and without the ring a GRACE Gate repeats with 69 percent probability by quest 5. */
  function textFor(rng, shape, stat, used, ring) {
    var bank = DATA.challenges[shape];
    if (bank && !Array.isArray(bank)) bank = bank[stat] || bank[STATS[0]];
    if (!bank || !bank.length) return { key: shape, i: 0 };
    var key = shape + (stat ? ':' + stat : '');
    used[key] = used[key] || {};
    var i, tries = 0;
    function taken(n) { return used[key][n] || (ring && ring.indexOf(key + '#' + n) >= 0); }
    i = rng.int(bank.length);
    while (taken(i) && tries++ < bank.length * 4) i = rng.int(bank.length);
    if (taken(i)) { tries = 0; i = rng.int(bank.length); while (used[key][i] && tries++ < bank.length * 2) i = rng.int(bank.length); }
    used[key][i] = 1;
    return { key: key, i: i, line: bank[i] };
  }

  function makeSlot(rng, shape, row, depth, used, ring) {                    // R5.5, R5.9, R10.1
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
    var t = textFor(rng, shape, s.stats[0], used, ring);
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
    var ring = (opts.ring || []).slice(0, 200);                              // R10.1 recently used lines
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
        slots.push(makeSlot(rng, shape, row, depth, used, ring));
      }
      var flip = rng.next() < 0.5;                                          // R5.4: slot order is rolled
      if (flip && sealed.indexOf(n) < 0) slots.reverse();                   // R9.1: a sealed stage keeps its Vault second
      for (var z = 0; z < slots.length; z++) slots[z].i = z;
      if (sealed.indexOf(n) >= 0) slots[slots.length - 1].sealed = true;
      q.stages.push({ n: n, boss: false, sealed: sealed.indexOf(n) >= 0, statRow: row.statRow,
        strainOnFail: row.strainOnFail, slots: slots });
    }
    q.usedLines = [];                                                        // R10.1: what to push onto the ring
    for (var st2 = 0; st2 < q.stages.length; st2++) {
      var sg = q.stages[st2];
      if (sg.boss) continue;
      for (var sl2 = 0; sl2 < sg.slots.length; sl2++) q.usedLines.push(sg.slots[sl2].textKey + '#' + sg.slots[sl2].textIdx);
    }
    return q;
  }

  var GEN = { newCharacter: newCharacter, dealCallings: dealCallings, dealTraits: dealTraits, newQuest: newQuest,
    newRelic: newRelic, nameCharacter: nameCharacter, fillAffixes: fillAffixes, nameRelic: nameRelic,
    deadLines: deadLines, tierWeights: tierWeights, renownTier: renownTier, rollRarity: rollRarity };

  /* ================= SIM: state, one check at a time =================
   * Pure over (state, rng): the same state and the same rng stream give the same result.
   * state.quest carries step and cursor so a page can restore to the exact card (R11.6).
   */
  function newAccount(seed) {
    return { renown: 0, renownLifetime: 0, marrow: 0, questsCompleted: 0, legacies: [], legacySlots: B.LEGACY_SLOTS_START,
      rosterSlots: B.ROSTER_START, rosterBought: 0, unlockedOrigins: Object.keys(ORIGINS).filter(function (k) { return ORIGINS[k].unlocked; }),
      creationFloors: { might: 4, grace: 4, wits: 4, nerve: 4 }, wardShelf: [], wardShelfSlots: 0, wall: [],
      freeRolls: B.FREE_ROLLS,      // R2.1: creation costs nothing while this is above zero
      deepestCompleted: 0,          // R8.0b / R8.4: the deepest Depth ever completed
      textRing: [],                 // R10.1: the challenge lines used in the last TEXT_RING quests
      usedNames: {}, nextId: 0, seed: seed || 0 };
  }
  function newGame(seed) {
    return { seed: seed || 0, account: newAccount(seed), roster: [], quest: null, events: [] };
  }
  /* The account's first characters: made, not bought (Recruit at 25 Renown is R8.1's mid game body tap). */
  function addCharacter(state, rng, opts) {                                    // R2.1: KEEP on a free roll
    var ch = newCharacter(rng, state.account, opts || {});
    ch.calling = (opts && opts.calling) || ch.dealt[0].calling;
    state.roster.push(ch);
    if (state.account.freeRolls > 0) state.account.freeRolls--;
    return ch;
  }
  function seedRoster(state, rng, n) {
    var out = [];
    for (var i = 0; i < (n || B.PARTY_SIZE); i++) out.push(addCharacter(state, rng, {}));
    return out;
  }

  function ev(state, type, payload) {
    var e = { t: type };
    for (var k in payload) if (payload.hasOwnProperty(k)) e[k] = payload[k];
    state.events.push(e);
    return e;
  }
  function byId(state, id) {
    for (var i = 0; i < state.roster.length; i++) if (state.roster[i].id === id) return state.roster[i];
    return null;
  }
  function unlockedDepths(state) {                                           // R8.4
    var out = [];
    for (var d = 1; d <= 5; d++) if (state.account.questsCompleted >= B.DEPTH_UNLOCK[d - 1]) out.push(d);
    return out;
  }

  /* ---- floors on one stat: Ironbound's gear only "+1" (R4.4), R12's floor v "half", and the R1.3 cap.
   * A floor of v:'half' is the EFFECTIVE die over two read at roll time, so a stepStat that changes the die
   * changes the floor with it (R12, R6.3). ---- */
  function floorPlusFor(list) {
    var plusAll = 0, plusGear = 0, i;
    for (i = 0; i < list.length; i++) {
      if (list[i].k !== 'floorPlus') continue;
      if (list[i].gearOnly) plusGear += (list[i].v || 0); else plusAll += (list[i].v || 0);
    }
    return { all: plusAll, gear: plusGear };
  }
  function floorFor(list, stat, die) {
    var fg = 0, fo = 0, i, e, v;
    var plus = floorPlusFor(list);
    for (i = 0; i < list.length; i++) {
      e = list[i];
      if (e.k !== 'floor' || !statMatches(e, stat)) continue;
      v = (e.v === 'half') ? floorCap(die) : e.v;                          // R12: "half" is the effective die over two
      if (e.fromGear) { if (v > fg) fg = v; } else if (v > fo) fo = v;     // R1.3: the highest holds, they do not add
    }
    var a = fo > 0 ? Math.min(fo + plus.all, floorCap(die) + plus.all) : 0;
    var b = fg > 0 ? Math.min(fg + plus.all + plus.gear, floorCap(die) + plus.all + plus.gear) : 0;
    return Math.max(a, b);
  }

  /* ---- the roll context for one check: every effect and every Sigil folded in ---- */
  function checkContext(state, ch, o) {
    var q = state.quest, list = collect(ch), stat = o.stat, die = effStat(ch, stat, list);
    var cctx = { stat: stat, tn: o.tn, shape: o.shape, boss: !!o.boss, strain: ch.strain,
      deadAllies: q ? q.deaths.length : 0, firstOfStage: !!o.firstOfStage, lastOfStage: !!o.lastOfStage,
      unusedStat: q ? !(q.statsUsed[ch.id] && q.statsUsed[ch.id][stat]) : false,
      sameStatAsPrev: q ? !!(q.prev && q.prev.stat === stat && q.prev.charId !== ch.id) : false,
      afterFailByOther: q ? !!(q.charge && q.charge !== ch.id) : false };
    var floor = floorFor(list, stat, die);
    /* R1.9 the composed cap, CORRECTED (audit): floor + total PERMANENT flat on one stat may never exceed 6,
     * one under the top of the TN band, or a d8 at its half die floor plus the three permitted flat points
     * could not fail any check in the game. Conditional sources (R1.7) sit outside it, as does Push. */
    var permFlat = 0, condFlat = 0, fi;
    for (fi = 0; fi < list.length; fi++) {
      if (list[fi].k !== 'flat' || !statMatches(list[fi], stat)) continue;
      if (list[fi].perm) permFlat += (list[fi].v || 0); else condFlat += (list[fi].v || 0);
    }
    permFlat = Math.min(permFlat, B.FLAT_CAP);                              // R1.7
    var permAllowed = Math.max(0, Math.min(permFlat, B.COMPOSED_CAP - floor));
    var flat = permAllowed + condFlat + query(list, 'cond', cctx) + query(list, 'grim', cctx) + query(list, 'relayPlus', cctx);
    var noSurge = false, surgeOnce = false;
    if (q && hasSigil(q, 'hollowAir')) {                                     // R9.2 / R9.3
      var hr = sigilRelief(ch, q, 'hollowAir');
      if (hr === 'immune') { /* nothing */ }
      else if (hr === 'partial') { surgeOnce = true; }
      else { noSurge = true; }
    }
    if (q && hasSigil(q, 'shivering')) {                                     // R9.2 / R9.3
      var sr = sigilRelief(ch, q, 'shivering');
      if (sr === 'immune') { /* floors stand */ }
      else if (sr === 'partial') { floor = Math.min(floor, 3); }
      else { floor = 0; }
    }
    return { rng: null, die: die, stat: stat, tn: o.tn, flat: flat, floor: floor,
      floorPlus: floorPlusFor(list).all + floorPlusFor(list).gear,          // R1.3: the cap bonus, not a second add
      permFlat: permFlat, permAllowed: permAllowed, greyedFlat: permFlat - permAllowed,
      surgeMinus: query(list, 'surgeMinus', cctx) ? 1 : 0, reroll1s: !!query(list, 'reroll1s', cctx),
      push: !!o.push, twice: !!o.twice, noSurge: noSurge, surgeOnce: surgeOnce, list: list, cctx: cctx };
  }

  function pushCost(state, ch) {                                             // R1.6, R4.7
    var q = state.quest, list = collect(ch);
    var free = query(list, 'pushFree', {});
    var usedN = (q && q.pushes[ch.id]) || 0;
    return usedN < free ? 0 : B.PUSH_STRAIN;
  }
  function canPush(state, ch) {                                              // R1.6: a Push that kills is refused
    return ch.alive && (ch.strain + pushCost(state, ch) < effToughness(ch));
  }

  /* ---- Strain, in the R3.2 order ---- */
  function applyStrain(state, ch, amount, opts) {
    opts = opts || {};
    if (!ch || !ch.alive || amount <= 0) return 0;
    var list = collect(ch);
    if (opts.strike) amount = Math.max(0, amount - query(list, 'strikeLess', {}));   // R3.2 first
    var absorbed = 0;
    if (!opts.selfPaid) {                                                     // R3.4: self paid costs skip Armor
      absorbed = Math.min(ch.armorPool, amount);
      ch.armorPool -= absorbed; amount -= absorbed;
    }
    ch.strain += amount;
    ev(state, 'strain', { id: ch.id, amount: amount, absorbed: absorbed, source: opts.source || '', strain: ch.strain });
    deathTest(state, ch, opts.source || '');
    return amount;
  }

  function deathTest(state, ch, source) {                                     // R2.4
    var tough = effToughness(ch);
    if (ch.strain < tough) return false;
    var list = collect(ch);
    if (query(list, 'unkillable', {}) && !ch.unkillableUsed) {                // R2.4 Unkillable, once per quest
      ch.unkillableUsed = true;
      ch.strain = tough - 1;
      ev(state, 'unkillable', { id: ch.id, strain: ch.strain });
      return false;
    }
    death(state, ch, source);
    return true;
  }

  function death(state, ch, cause) {                                          // R2.4, R8.5, R8.7, R8.8
    if (!ch.alive) return;
    ch.alive = false; ch.deployed = false;
    var q = state.quest, depth = q ? q.depth : 1;
    /* R8.5 CORRECTED (audit): a death pays Marrow only for a PROVEN character, one that has survived a quest.
     * An unproven death still makes the Legacy and writes the wall, so death stays productive without being
     * purchasable: a mid quest Recruit could otherwise feed the boss a fresh body at every stage end. */
    var marrow = ch.questsSurvived >= 1 ? Math.round(B.DEATH_MARROW * B.DEPTH_MARROW_MULT[depth - 1]) : 0;
    state.account.marrow += marrow;
    var legacy = { id: 'L' + (state.account.legacies.length + 1), calling: ch.calling, charName: ch.name,
      diedAt: q ? (q.def.stages[q.stageIndex].bossName || ('stage ' + q.def.stages[q.stageIndex].n)) : 'the Hall',
      depth: depth, consecrated: false };
    state.account.legacies.push(legacy);
    state.account.wall.unshift({ name: ch.name, origin: ch.origin, calling: ch.calling,
      quests: ch.questsSurvived, depth: depth, cause: cause || 'was lost', retired: false });
    if (q) q.deaths.push(ch.id);
    ev(state, 'death', { id: ch.id, name: ch.name, marrow: marrow, legacy: legacy.id, cause: cause || '' });
  }

  /* ---- the flattened check list for one stage (R5.7 resolution order) ---- */
  function stagePlan(stage) {
    var out = [];
    for (var i = 0; i < stage.slots.length; i++) {
      var s = stage.slots[i];
      for (var c = 0; c < s.checks; c++) out.push({ slotIdx: i, checkIdx: c, tn: s.tns[c], stat: s.stats[c] });
    }
    return out;
  }

  function currentStage(state) { return state.quest.def.stages[state.quest.stageIndex]; }

  function addDrop(state, item) {          // R6.7: the drop screen queue, and a record for the aftermath
    var q = state.quest;
    q.drops.push(item); q.dropLog.push(item);
    return item;
  }

  function startQuest(state, rng, questDef, partyIds) {                       // R5.1, R9.2, R3.4, R4.2
    var q = { def: questDef, depth: questDef.depth, sigils: questDef.sigils.slice(), stageIndex: 0,
      step: 'assign', cursor: 0, party: partyIds.slice(), assign: null, results: [], renown: 0,
      drops: [], dropLog: [], deaths: [], round: 0, thinIceUsed: false, pendingAmbush: false, slotAmbush: {},
      hiddenThisStage: false, blindNext: false, statsUsed: {}, prev: null, charge: null, pushes: {},
      twiceUsed: {}, rerollUsed: {}, sealRepeats: 0, roundOrder: [], roundTargets: {}, held: null, firstRolled: false,
      won: false, over: false };
    state.quest = q;
    for (var i = 0; i < partyIds.length; i++) {
      var ch = byId(state, partyIds[i]);
      ch.deployed = true; ch.unkillableUsed = false; ch.benchOnceUsed = false;
      ch.armorPool = effArmor(ch, null, q);                                   // R3.4 full at quest start
      var extra = queryAll(collect(ch), 'extraRelic');                        // R4.2 Ashwalker
      for (var e = 0; e < extra.length; e++) {
        // R6.1 (a): Depth IV and V give a Common no budget at all, so the free relic is Uncommon there
        var rar = extra[e].rarity;
        if (B.BUDGETS[q.depth - 1][rarityIndex(rar)] === 0) rar = 'uncommon';
        addDrop(state, newRelic(rng, q.depth, { rarity: rar }));
      }
    }
    ev(state, 'questStart', { depth: q.depth, sigils: q.sigils, party: partyIds.slice() });
    return q;
  }

  function tnVisible(state, ch) {                                             // R5.3, R4.6, R9.2 Blindfold, R9.3
    var q = state.quest;
    if (!q) return true;
    var hidden = q.hiddenThisStage || hasSigil(q, 'blindfold');
    if (!hidden) return true;
    for (var i = 0; i < q.party.length; i++) {                                // R4.6: a Lanternborn's party sees them
      var p = byId(state, q.party[i]);
      if (p && p.alive && query(collect(p), 'seeHidden', {})) return true;
    }
    if (ch && hasSigil(q, 'blindfold') && sigilRelief(ch, q, 'blindfold') !== 'none') return true;
    return false;
  }

  function livingParty(state) {
    return state.quest.party.filter(function (id) { var c = byId(state, id); return c && c.alive; });
  }
  function activeSlots(stage) {
    var out = [];
    for (var i = 0; i < stage.slots.length; i++) if (!stage.slots[i].done) out.push(i);
    return out;
  }

  /* R5.6 CORRECTED (audit). One sentence covers every case: a character may hold a second check only when the
   * stage's CHECKS outnumber the living deployed characters, and never both checks of one Relay. Three living at
   * Relay plus Relay (four checks, three bodies) means one character takes a check in each Relay and nobody
   * benches; two living at Gate plus Relay means both hold the Relay and one of them also holds the Gate; one
   * living holds exactly one slot and every Relay is FORFEIT. */
  function stageChecks(stage) {
    var n = 0, idx = activeSlots(stage);
    for (var i = 0; i < idx.length; i++) n += stage.slots[idx[i]].checks;
    return n;
  }
  function assign(state, plan) {                                              // R5.6
    var q = state.quest, stage = currentStage(state);
    if (stage.boss) return bossAssign(state, plan);
    var living = livingParty(state), idx = activeSlots(stage), i, j;
    var need = 0;
    for (i = 0; i < idx.length; i++) need += stage.slots[idx[i]].checks === 2 && stage.slots[idx[i]].shape === 'relay' ? 2 : 1;
    var seen = {}, doubling = living.length >= 2 && stageChecks(stage) > living.length;
    q.assign = { slots: [], bench: plan.bench || null, benchOnce: plan.benchOnce || null };
    for (i = 0; i < stage.slots.length; i++) {
      var slot = stage.slots[i], p = plan.slots[i];
      if (slot.done) { q.assign.slots.push(null); continue; }
      if (!p || p.forfeit) {                                                  // R5.6: FORFEIT, no reward, no Strain
        var canFill = living.length >= (slot.shape === 'relay' ? 2 : 1);
        if (canFill && living.length >= need) throw new Error('slot ' + i + ' must be filled');
        q.assign.slots.push(null); continue;
      }
      var want = slot.shape === 'relay' ? 2 : 1;
      if (!p.chars || p.chars.length !== want) throw new Error('slot ' + i + ' needs ' + want + ' character(s)');
      if (want === 2 && p.chars[0] === p.chars[1]) throw new Error('a Relay needs two different characters');
      for (j = 0; j < p.chars.length; j++) {
        var c = byId(state, p.chars[j]);
        if (!c || !c.alive || q.party.indexOf(c.id) < 0) throw new Error('not a living party member: ' + p.chars[j]);
        if (seen[c.id] && !doubling) throw new Error('one slot per character per stage: ' + c.id);
        seen[c.id] = (seen[c.id] || 0) + 1;                                   // R5.6: slots held, a Chain is one
        if (seen[c.id] > 2) throw new Error('a character may hold at most a second slot: ' + c.id);
      }
      if ((slot.shape === 'vault' || slot.shape === 'open') && STATS.indexOf(p.stat) < 0) throw new Error(slot.shape + ' needs a chosen stat');
      q.assign.slots.push({ chars: p.chars.slice(), stat: p.stat || null, push: p.push || [], twice: p.twice || [] });
    }
    // R3.1: a Toll's entry fee is paid on assignment and skips Armor (R3.4)
    for (i = 0; i < stage.slots.length; i++) {
      var s2 = stage.slots[i], a2 = q.assign.slots[i];
      if (!a2 || s2.shape !== 'toll' || !s2.fee) continue;
      var payer = byId(state, a2.chars[0]);
      if (!query(collect(payer), 'tollFree', {})) applyStrain(state, payer, s2.fee, { selfPaid: true, source: 'toll' });
    }
    q.cursor = 0; q.step = 'check';
    ev(state, 'assign', { stage: stage.n, slots: clone(q.assign.slots), bench: q.assign.bench });
    return q.assign;
  }

  /* R5.7 resolution order: options, roll, the RESULT card (with a REROLL when one is available),
   * CONTINUE, then the consequences. resolveNext(state, rng) does the whole thing in one call, which is
   * what the sim wants; resolveNext(state, rng, {hold:true}) stops at the RESULT card, so a page can
   * offer REROLL (R1.8) before anything lands. Then rerollHeld() and commitHeld(). */
  function advanceCursor(state, rng, res, item, plan, stage) {
    var q = state.quest;
    q.results.push(res); q.cursor++;
    var lastOfSlot = true;
    for (var z = q.cursor; z < plan.length; z++) if (plan[z].slotIdx === item.slotIdx) lastOfSlot = false;
    if (lastOfSlot) settleSlot(state, rng, stage, item.slotIdx);
    if (q.cursor >= plan.length) q.step = 'stageEnd';
    return res;
  }

  function commitCheck(state, rng, held) {                                    // the CONTINUE half of R5.7
    var q = state.quest, res = held.res, slot = held.slot, stage = held.stage, item = held.item;
    if (res.roll) {
      var ch = byId(state, res.charId);
      q.statsUsed[ch.id] = q.statsUsed[ch.id] || {}; q.statsUsed[ch.id][res.stat] = 1;
      slot.checkPass = slot.checkPass || []; slot.checkPass[item.checkIdx] = res.pass;
      if (q.charge && q.charge !== ch.id) q.charge = null;                    // R4.11: cleared when it is read
      if (!res.pass) applyFailure(state, ch, stage, slot, res.stat, res.ambush, res);
      q.prev = { charId: ch.id, stat: res.stat, pass: res.pass };
      if (!res.pass) q.charge = ch.id;                                        // armed by THIS character's failure
      ev(state, 'check', { stage: stage.n, id: ch.id, stat: res.stat, tn: res.tn, total: res.roll.total, pass: res.pass });
    }
    q.held = null;
    return advanceCursor(state, rng, res, item, held.plan, stage);
  }

  function rerollHeld(state, rng, sourceId) {                                 // R1.8 "reroll one die per stage"
    var q = state.quest, h = q.held;
    if (!h || !h.res.roll) return null;
    var src = null, i;
    if (sourceId) {
      var c = byId(state, sourceId);
      if (c && c.alive && query(collect(c), 'rerollStage', {}) && !q.rerollUsed[c.id]) src = c.id;
    } else {
      for (i = 0; i < q.party.length; i++) {
        var p2 = byId(state, q.party[i]);
        if (p2 && p2.alive && query(collect(p2), 'rerollStage', {}) && !q.rerollUsed[p2.id]) { src = p2.id; break; }
      }
    }
    if (!src) return null;
    q.rerollUsed[src] = 1;                                                    // once per stage per source
    h.ctx.rng = rng;
    var r = roll(h.ctx.die, h.ctx);                                           // the whole chain is redrawn once
    h.res.rerolledBy = src; h.res.firstRoll = h.res.roll;
    h.res.roll = r; h.res.pass = r.total >= h.res.tn; h.res.surplus = r.total - h.res.tn;   // the second stands
    return h.res;
  }
  function commitHeld(state, rng) {
    var q = state.quest;
    if (!q.held) return null;
    return commitCheck(state, rng, q.held);
  }
  function rerollAvailable(state) {
    var q = state.quest, out = [];
    if (!q || !q.held || !q.held.res.roll) return out;
    for (var i = 0; i < q.party.length; i++) {
      var p2 = byId(state, q.party[i]);
      if (p2 && p2.alive && query(collect(p2), 'rerollStage', {}) && !q.rerollUsed[p2.id]) out.push(p2.id);
    }
    return out;
  }

  function resolveNext(state, rng, opts) {                                    // R5.7: ONE check, then the RESULT card
    opts = opts || {};
    var q = state.quest, stage = currentStage(state);
    if (stage.boss) return resolveBossCheck(state, rng);
    if (q.held) return commitCheck(state, rng, q.held);                       // a held card must be answered first
    var plan = stagePlan(stage).filter(function (p) { return !stage.slots[p.slotIdx].done; });
    if (q.cursor >= plan.length) { q.step = 'stageEnd'; return null; }
    var item = plan[q.cursor], slot = stage.slots[item.slotIdx], asg = q.assign.slots[item.slotIdx];
    var res = { stage: stage.n, slotIdx: item.slotIdx, checkIdx: item.checkIdx, shape: slot.shape };
    function finish(r) {
      var held = { res: r, item: item, plan: plan, slot: slot, stage: stage, ctx: r._ctx || null };
      if (r._ctx) delete r._ctx;
      if (opts.hold) { if (held.ctx) held.ctx.rng = null; q.held = held; return r; }   // the held state stays serialisable
      return commitCheck(state, rng, held);
    }
    if (!asg) { res.skipped = 'forfeit'; res.pass = null; return finish(res); }        // R5.6 FORFEIT
    /* R3.3 CORRECTED (audit): the second check of a two check slot, Chain OR Relay, only happens if the first
     * passed. Rolling a second check for a slot that can no longer pay is a free punishment, and the second
     * character's Push is never paid and their unused stats stay unused. */
    if (slot.checks === 2 && item.checkIdx === 1 && slot.checkPass && slot.checkPass[0] === false) {
      res.skipped = slot.shape === 'chain' ? 'chainBroken' : 'relayBroken'; res.pass = false;
      slot.checkPass[1] = false;
      return finish(res);
    }
    var actorId = (slot.shape === 'relay') ? asg.chars[item.checkIdx] : asg.chars[0];
    var ch = byId(state, actorId);
    if (!ch || !ch.alive) {
      res.skipped = 'noActor'; res.pass = false;
      slot.checkPass = slot.checkPass || []; slot.checkPass[item.checkIdx] = false;
      return finish(res);
    }
    // Ambush lands on the next SLOT resolved, crossing a stage boundary if it must (R5.8)
    if (item.checkIdx === 0 && q.pendingAmbush && !q.slotAmbush[item.slotIdx]) {
      q.slotAmbush[item.slotIdx] = true; q.pendingAmbush = false;
    }
    var ambush = !!q.slotAmbush[item.slotIdx];
    var stat = item.stat || asg.stat;
    var wantPush = !!(asg.push && asg.push[item.checkIdx]);
    /* R13.2: a Push chosen while safe can become lethal by roll time (contagion landed in between). It is
     * re-validated here, dropped if it would now bring Strain to Toughness, and a dropped Push does not spend
     * Saltblood's free one. A Push never brings Strain to Toughness, Unkillable unspent or not. */
    if (wantPush && canPush(state, ch)) {                                              // R1.6, Strain before the roll
      var cost = pushCost(state, ch);
      q.pushes[ch.id] = (q.pushes[ch.id] || 0) + 1;
      if (cost) applyStrain(state, ch, cost, { selfPaid: true, source: 'push' });
    } else if (wantPush) { wantPush = false; res.pushRefused = true; }
    if (!ch.alive) { res.skipped = 'diedOnPush'; res.pass = false; return finish(res); }
    var list = collect(ch);
    var wantTwice = !!(asg.twice && asg.twice[item.checkIdx]);
    var autoKey = ch.id + ':auto';
    if (!wantTwice && query(list, 'twiceStage', { stat: stat, autoOnly: true }) && !q.twiceUsed[autoKey]) {
      wantTwice = true; q.twiceUsed[autoKey] = 1;                                      // R4.10 Cutpurse, automatic
    } else if (wantTwice) {
      if (!query(list, 'twiceStage', { stat: stat }) || q.twiceUsed[ch.id]) wantTwice = false;
      else q.twiceUsed[ch.id] = 1;
    }
    var ctx = checkContext(state, ch, { stat: stat, tn: item.tn, shape: slot.shape, boss: false,
      push: wantPush, twice: wantTwice, firstOfStage: !q.firstRolled,                   // R13.4
      lastOfStage: q.cursor === plan.length - 1 });
    ctx.rng = rng;
    var r = roll(ctx.die, ctx);
    q.firstRolled = true;
    res.charId = ch.id; res.stat = stat; res.tn = item.tn; res.pass = r.total >= item.tn; res.roll = r;
    res.ambush = ambush; res.surplus = r.total - item.tn; res._ctx = ctx;
    return finish(res);
  }

  function applyFailure(state, ch, stage, slot, stat, ambush, res) {                   // R3.1, R5.8
    var q = state.quest, list = collect(ch);
    var base = stage.strainOnFail;
    if (hasSigil(q, 'thinIce') && !q.thinIceUsed) {                                     // R9.2 / R9.3
      var rel = sigilRelief(ch, q, 'thinIce');
      if (rel === 'none') { base = Math.max(base, B.THIN_ICE_STRAIN); q.thinIceUsed = true; }
    }
    if (ambush && !query(list, 'ignoreAmbush', {})) base += B.AMBUSH_STRAIN;            // R3.1, R4.17 Untethered
    res.strain = base;
    applyStrain(state, ch, base, { source: 'fail:' + stat });
    if (stat === 'grace') q.pendingAmbush = true;                                       // R5.8
    else if (stat === 'wits') q.blindNext = true;
    else if (stat === 'nerve') {                                                        // R5.8 contagion
      for (var i = 0; i < q.party.length; i++) {
        var o = byId(state, q.party[i]);
        if (!o || !o.alive || o.id === ch.id) continue;                                 // the actor is not hit twice
        if (query(collect(o), 'contagionImmune', {})) continue;                         // R4.17 Steadfast
        applyStrain(state, o, B.CONTAGION_STRAIN, { source: 'contagion' });
      }
    }
  }

  function settleSlot(state, rng, stage, slotIdx) {                                     // R5.9
    var q = state.quest, slot = stage.slots[slotIdx], asg = q.assign.slots[slotIdx];
    if (!asg) { slot.passed = false; return; }
    var pass = true;
    for (var c = 0; c < slot.checks; c++) if (!(slot.checkPass && slot.checkPass[c])) pass = false;
    slot.passed = pass;
    if (!pass) return;
    q.renown += slot.reward.renown;
    // R5.9: the Vault's FIRST roll carries the +1 tier, the second is a plain roll
    for (var k = 0; k < slot.reward.relicRolls; k++) addDrop(state, newRelic(rng, q.depth, { tierUp: k === 0 ? slot.reward.tierUp : 0 }));
    ev(state, 'slotPassed', { stage: stage.n, slot: slotIdx, shape: slot.shape, renown: slot.reward.renown });
  }

  function benchClearFor(ch) { return B.BENCH_CLEAR + query(collect(ch), 'benchPlus', {}); }   // R5.6, R4.13

  function doBench(state, ch) {                                                        // R5.6, R3.4, R4.1
    var q = state.quest;
    var clear = benchClearFor(ch);
    ch.strain = Math.max(0, ch.strain - clear);
    ch.armorPool = effArmor(ch, null, q);                                              // R3.4: refilled on every bench
    var ally = query(collect(ch), 'benchAlly', {});
    if (ally > 0) {                                                                    // R4.1 Hearthborn, no prompt
      var best = null;
      for (var i = 0; i < q.party.length; i++) {
        var o = byId(state, q.party[i]);
        if (!o || !o.alive || o.id === ch.id) continue;
        if (!best || o.strain > best.strain) best = o;                                 // tie: first in party order
      }
      if (best && best.strain > 0) best.strain = Math.max(0, best.strain - ally);
    }
    ev(state, 'bench', { id: ch.id, clear: clear, strain: ch.strain });
  }

  /* R9.1 CORRECTED (audit): at a SEALED stage only the Vault repeats. The other slot resolves once, and between
   * attempts NOTHING happens except the Vault's own Strain instance and a fresh choice of holder and stat: no
   * bench clear, no Hearthborn, no Armor refill, no Respite, no rewards, no drops, no replacement, or a Warden
   * benching for 3 against a Strain of 1 heals the party for ever. Stage end runs ONCE, when the Vault passes or
   * the party is dead. Ambush from the other slot is consumed by the first attempt; a failed GRACE attempt puts
   * Ambush on the next one. */
  function sealedVault(stage) {
    if (!stage || stage.boss || !stage.sealed) return null;
    for (var i = 0; i < stage.slots.length; i++) if (stage.slots[i].sealed) return stage.slots[i];
    return null;
  }
  function repeatSealed(state) {
    var q = state.quest, stage = currentStage(state), i;
    q.sealRepeats++;
    for (i = 0; i < stage.slots.length; i++) {
      if (stage.slots[i].sealed) { stage.slots[i].checkPass = null; stage.slots[i].passed = null; delete q.slotAmbush[i]; }
      else stage.slots[i].done = true;                                              // it resolved once, it is finished
    }
    q.cursor = 0; q.assign = null; q.held = null; q.firstRolled = false;
    q.step = 'assign';
    ev(state, 'sealedRepeat', { stage: stage.n, repeats: q.sealRepeats });
    return q;
  }

  function endStage(state, rng) {                                                      // R5.7, R7.4, R9.1, R9.2
    var q = state.quest, stage = currentStage(state), i;
    var sv = sealedVault(stage);
    if (sv && !sv.passed && livingParty(state).length) return repeatSealed(state);      // R9.1: before anything else
    if (stage.boss) {
      var allBroken = stage.aspects.every(function (a) { return a.broken; });
      if (allBroken) {                                                                 // R7.3
        q.renown += stage.reward.renown;
        for (i = 0; i < stage.reward.relicRolls; i++) addDrop(state, newRelic(rng, q.depth, { tierUp: stage.reward.tierUp }));
        ev(state, 'bossFallen', { boss: stage.bossName, renown: stage.reward.renown, first: !!stage.first });
      } else if (!livingParty(state).length) { q.step = 'lost'; q.over = true; return q; }
    } else {
      // 1. bench clears (and Pressgang instead of a bench, R9.2)
      var assigned = {};
      for (i = 0; i < q.assign.slots.length; i++) {
        var a = q.assign.slots[i];
        if (a) for (var c = 0; c < a.chars.length; c++) assigned[a.chars[c]] = 1;
      }
      var benchIds = [];
      for (i = 0; i < q.party.length; i++) {
        var ch = byId(state, q.party[i]);
        if (!ch || !ch.alive) continue;
        if (!assigned[ch.id]) benchIds.push(ch.id);
      }
      if (q.assign.benchOnce) {                                                        // Feet: count as benched once per quest
        var bo = byId(state, q.assign.benchOnce);
        if (bo && bo.alive && !bo.benchOnceUsed && query(collect(bo), 'benchOnce', {}) && benchIds.indexOf(bo.id) < 0) {
          bo.benchOnceUsed = true; benchIds.push(bo.id);
        }
      }
      for (i = 0; i < benchIds.length; i++) {
        var b = byId(state, benchIds[i]);
        if (hasSigil(q, 'pressgang')) {                                                // R9.2 / R9.3
          var rel = sigilRelief(b, q, 'pressgang');
          if (rel === 'immune') doBench(state, b);
          else if (rel === 'partial') ev(state, 'pressgang', { id: b.id, strain: 0, clears: false });
          else applyStrain(state, b, B.PRESSGANG_STRAIN, { source: 'pressgang' });
        } else doBench(state, b);
      }
      // 2. Respite, every living character (R5.7; 0 from Depth III per R9.1)
      var resp = B.RESPITE[q.depth - 1];
      for (i = 0; i < q.party.length; i++) {
        var r2 = byId(state, q.party[i]);
        if (!r2 || !r2.alive) continue;
        var amt = resp + query(collect(r2), 'respitePlus', {});
        if (amt > 0) r2.strain = Math.max(0, r2.strain - amt);
      }
    }
    if (!livingParty(state).length) { q.step = 'lost'; q.over = true; return q; }
    // 3. next stage
    q.stageIndex++;
    q.hiddenThisStage = q.blindNext; q.blindNext = false;                              // R5.8 Blindness, one stage only
    if (q.stageIndex < q.def.stages.length && q.def.stages[q.stageIndex].boss) q.pendingAmbush = false;  // R5.8 (audit)
    if (q.stageIndex >= q.def.stages.length) { q.step = 'won'; q.won = true; q.over = true; return q; }
    resetStageRuntime(state);
    q.step = currentStage(state).boss ? 'bossAssign' : 'assign';
    if (q.step === 'bossAssign') { q.round = 0; }
    return q;
  }

  function resetStageRuntime(state) {
    var q = state.quest;
    q.cursor = 0; q.assign = null; q.held = null; q.thinIceUsed = false; q.pushes = {}; q.twiceUsed = {};
    q.rerollUsed = {}; q.charge = null; q.prev = null; q.slotAmbush = {}; q.firstRolled = false;
  }

  /* ---- the boss (R7) ---- */
  function bossAssign(state, plan) {                                                   // R7.2
    var q = state.quest, stage = currentStage(state), living = livingParty(state), i;
    var targets = {};
    for (i = 0; i < living.length; i++) {
      var id = living[i], t = plan.targets ? plan.targets[id] : null;
      if (t == null || !stage.aspects[t]) throw new Error('every living character needs an Aspect: ' + id);
      targets[id] = t;
    }
    q.assign = { targets: targets, push: plan.push || {}, twice: plan.twice || {} };
    q.roundOrder = living.slice();                                                     // party order
    q.roundTargets = {}; q.cursor = 0; q.step = 'bossCheck';
    ev(state, 'bossAssign', { round: q.round + 1, targets: clone(targets) });
    return q.assign;
  }

  function unbrokenAspects(stage) { return stage.aspects.filter(function (a) { return !a.broken; }); }

  function resolveBossCheck(state, rng) {                                              // R7.2
    var q = state.quest, stage = currentStage(state);
    if (unbrokenAspects(stage).length === 0) { q.step = 'bossWon'; return null; }       // R7.3
    if (q.cursor >= q.roundOrder.length) { q.step = 'strike'; return null; }
    var ch = byId(state, q.roundOrder[q.cursor]);
    if (!ch || !ch.alive) { q.cursor++; return { skipped: 'dead' }; }
    var ai = q.assign.targets[ch.id];
    var asp = stage.aspects[ai];
    var retargeted = false;
    if (asp.broken) {                                                                  // R7.2: the fewest hit points left
      /* R13.6: equal hit points break to the Aspect whose stat this character rolls the bigger die on,
       * then to card order. */
      var best = -1, lst = collect(ch);
      for (var i = 0; i < stage.aspects.length; i++) {
        var a2 = stage.aspects[i];
        if (a2.broken) continue;
        if (best < 0) { best = i; continue; }
        var b2 = stage.aspects[best];
        if (a2.hp < b2.hp) best = i;
        else if (a2.hp === b2.hp && effStat(ch, a2.stat, lst) > effStat(ch, b2.stat, lst)) best = i;
      }
      if (best < 0) { q.step = 'bossWon'; return null; }
      ai = best; asp = stage.aspects[ai]; retargeted = true;
    }
    q.roundTargets[ch.id] = ai;
    var wantPush = !!(q.assign.push && q.assign.push[ch.id]);
    if (wantPush && canPush(state, ch)) {
      var cost = pushCost(state, ch);
      q.pushes[ch.id] = (q.pushes[ch.id] || 0) + 1;
      if (cost) applyStrain(state, ch, cost, { selfPaid: true, source: 'push' });
    } else wantPush = false;
    if (!ch.alive) { q.cursor++; return { skipped: 'diedOnPush' }; }
    var list = collect(ch), stat = asp.stat;
    var wantTwice = !!(q.assign.twice && q.assign.twice[ch.id]);
    var autoKey = ch.id + ':auto';
    if (!wantTwice && query(list, 'twiceStage', { stat: stat, autoOnly: true }) && !q.twiceUsed[autoKey]) {
      wantTwice = true; q.twiceUsed[autoKey] = 1;
    } else if (wantTwice) {
      if (!query(list, 'twiceStage', { stat: stat }) || q.twiceUsed[ch.id]) wantTwice = false;
      else q.twiceUsed[ch.id] = 1;
    }
    var ctx = checkContext(state, ch, { stat: stat, tn: asp.tn, shape: 'boss', boss: true, push: wantPush,
      twice: wantTwice, firstOfStage: q.cursor === 0, lastOfStage: q.cursor === q.roundOrder.length - 1 });
    ctx.rng = rng;
    var r = roll(ctx.die, ctx);
    var pass = r.total >= asp.tn, dmg = 0;
    if (pass) {                                                                        // R7.2 damage
      dmg = Math.max(1, r.total - asp.tn);
      dmg += query(list, 'aspectDmg', {});
      dmg += query(list, 'surgeAspect', { stat: stat, surged: r.surged });              // R4.16 Reaver, Weapon riders
      asp.hp -= dmg;
      if (asp.hp <= 0) { asp.broken = true; asp.hp = 0; }
    }
    q.statsUsed[ch.id] = q.statsUsed[ch.id] || {}; q.statsUsed[ch.id][stat] = 1;
    q.prev = { charId: ch.id, stat: stat, pass: pass };
    q.charge = pass ? q.charge : ch.id;
    var res = { boss: true, round: q.round + 1, charId: ch.id, aspect: ai, aspectName: asp.name, stat: stat,
      tn: asp.tn, pass: pass, roll: r, damage: dmg, retargeted: retargeted, broken: asp.broken };
    q.results.push(res);
    ev(state, 'bossCheck', { id: ch.id, aspect: asp.name, pass: pass, damage: dmg, hp: asp.hp });
    q.cursor++;
    if (unbrokenAspects(stage).length === 0) q.step = 'bossWon';                        // R7.3, no Strike that round
    else if (q.cursor >= q.roundOrder.length) q.step = 'strike';
    return res;
  }

  function bossStrike(state, rng) {                                                    // R7.4
    var q = state.quest, stage = currentStage(state);
    var strike = B.STRIKE[q.depth - 1];
    var living = livingParty(state), i, j;
    var recs = [];
    for (i = 0; i < stage.aspects.length; i++) {
      var asp = stage.aspects[i];
      if (asp.broken) continue;
      var perTarget = {};
      if (B.STRIKE_TARGET === 'all') {
        for (j = 0; j < living.length; j++) perTarget[living[j]] = strike;
      } else if (B.STRIKE_TARGET === 'attackers') {
        var faced = living.filter(function (id) { return q.roundTargets[id] === i; });
        if (!faced.length) faced = living;                                             // an Aspect nobody faced hits all
        for (j = 0; j < faced.length; j++) perTarget[faced[j]] = strike;
      } else {                                                                         // 'spread', one point at a time
        for (var p = 0; p < strike; p++) {
          var pick = null;
          for (j = 0; j < q.party.length; j++) {
            var o = byId(state, q.party[j]);
            if (!o || !o.alive) continue;
            var pend = (perTarget[o.id] || 0);
            if (!pick || (o.strain + pend) < (pick.strain + (perTarget[pick.id] || 0))) pick = o;
          }
          if (!pick) break;
          perTarget[pick.id] = (perTarget[pick.id] || 0) + 1;
        }
      }
      Object.keys(perTarget).forEach(function (id) {
        var t = byId(state, id);
        if (!t || !t.alive) return;
        var landed = applyStrain(state, t, perTarget[id], { strike: true, source: 'strike:' + asp.name });
        recs.push({ aspect: asp.name, id: id, amount: perTarget[id], landed: landed });
      });
      living = livingParty(state);
    }
    ev(state, 'strike', { round: q.round + 1, hits: recs.length });
    if (!livingParty(state).length) { q.step = 'lost'; q.over = true; return recs; }
    q.round++;
    q.step = 'bossAssign';
    q.hiddenThisStage = false;                                                          // R5.8: round 1 only
    /* R13.3: at the boss a ROUND is a stage for every [stage] counter, EXCEPT rerollStage, which resets per
     * FIGHT: the once per stage family already delivers four to eight times the success per point that the
     * flat family does, and counting every round as a stage was widening the widest gap in the affix table. */
    q.pushes = {}; q.twiceUsed = {}; q.charge = null; q.prev = null; q.firstRolled = false;
    return recs;
  }

  function bossRound(state, rng) {                                                      // one whole round (R7.2 then R7.4)
    var q = state.quest, out = { checks: [], strikes: [] };
    while (q.step === 'bossCheck') { var r = resolveBossCheck(state, rng); if (r) out.checks.push(r); }
    if (q.step === 'strike') out.strikes = bossStrike(state, rng);
    return out;
  }

  function stripGear(ch) {
    var out = [];
    for (var i = 0; i < SLOTS.length; i++) if (ch.gear[SLOTS[i]]) { out.push(ch.gear[SLOTS[i]]); delete ch.gear[SLOTS[i]]; }
    return out;
  }

  function endQuest(state, rng) {                                                       // R2.5, R6.8, R8.3, R8.4
    var q = state.quest, i, j, acct = state.account;
    var won = !!q.won;
    var survivors = q.party.filter(function (id) { var c = byId(state, id); return c && c.alive; });
    var salvage = 0, offered = [];
    for (i = 0; i < q.party.length; i++) {
      var ch = byId(state, q.party[i]);
      if (!ch || ch.alive) continue;
      var items = stripGear(ch);
      for (j = 0; j < items.length; j++) {
        if (!survivors.length) salvage += B.SALVAGE[items[j].rarity];                    // R6.8: a wipe still pays
        else offered.push(items[j]);                                                     // R6.8: offered to the survivors
      }
    }
    for (i = 0; i < offered.length; i++) { q.drops.push(offered[i]); q.dropLog.push(offered[i]); }
    var traitOffers = [];
    for (i = 0; i < survivors.length; i++) {
      var s = byId(state, survivors[i]);
      s.questsSurvived++;
      /* R2.5 CORRECTED (audit): a Scar every SCAR_EVERY quests survived, 2 by default. One Scar per quest
       * against a base Toughness of 4 is a hard wall at four quests and a mean career of 2.83, not the spec's
       * 4 to 7, which put 3/2.83 characters through the roster a quest and made Marrow income 3.6 against the
       * spec's own 1.5. A Trait is dealt after EVERY quest survived whether a Scar was due or not. */
      if (s.questsSurvived % B.SCAR_EVERY === 0) s.scars += B.SCAR_PER_QUEST;            // R2.5: the Scar first
      traitOffers.push({ charId: s.id, offers: dealTraits(rng, s) });                    // then three Traits
    }
    var gained = q.renown + salvage;
    acct.renown += gained; acct.renownLifetime += gained;
    /* R8.4 CORRECTED (audit): a win counts once per quest, on the FINAL boss falling, and only when the quest
     * was played at the DEEPEST UNLOCKED Depth. With no Depth qualifier the cheapest road to Marrowdeep was
     * fifty Depth I runs, arriving with a roster that had never seen a Strike of 3 or a fourth Aspect. A
     * shallower run still pays Renown, relics and Marrow; it just does not buy depth. */
    var deepestUnlocked = unlockedDepths(state).slice(-1)[0] || 1;
    if (won) {
      if (q.depth >= deepestUnlocked) acct.questsCompleted++;
      if (q.depth > (acct.deepestCompleted || 0)) acct.deepestCompleted = q.depth;        // R8.0b the price index
    }
    for (i = 0; i < q.party.length; i++) { var p = byId(state, q.party[i]); if (p) p.deployed = false; }
    for (i = state.roster.length - 1; i >= 0; i--) {                                     // the dead are interred
      if (!state.roster[i].alive) state.roster.splice(i, 1);
      else if (q.party.indexOf(state.roster[i].id) < 0) {                                 // R8.3: rest for the un deployed
        var r3 = state.roster[i];
        r3.strain = Math.max(0, r3.strain - Math.floor(r3.strain * B.REST_FRACTION));     // REST_FRACTION, rounded down
      }
    }
    var summary = { won: won, depth: q.depth, renown: gained, salvage: salvage, deaths: q.deaths.slice(),
      drops: q.dropLog.slice(), sealRepeats: q.sealRepeats, results: q.results.length, traitOffers: traitOffers };
    state.pendingTraits = traitOffers;
    state.pendingDrops = q.drops.slice();
    state.lastQuest = summary;
    state.quest = null;
    ev(state, 'questEnd', { won: won, renown: gained, deaths: q.deaths.length });
    return summary;
  }

  function takeTrait(state, charId, traitId) {                                           // R2.5
    var ch = byId(state, charId);
    if (!ch) return { ok: false, reason: 'no character' };
    if (ch.traits.indexOf(traitId) >= 0) return { ok: false, reason: 'already owned' };
    ch.traits.push(traitId);
    state.pendingTraits = (state.pendingTraits || []).filter(function (t) { return t.charId !== charId; });
    ev(state, 'trait', { id: charId, trait: traitId });
    return { ok: true };
  }

  function equip(state, rng, ch, item) {                                                 // R6.6, R6.7
    var old = ch.gear[item.slot] || null;
    if (old) { state.account.renown += B.SALVAGE[old.rarity]; state.account.renownLifetime += B.SALVAGE[old.rarity]; }
    ch.gear[item.slot] = item;                                                            // R6.3: never retargeted
    ev(state, 'equip', { id: ch.id, item: item.name, slot: item.slot, replaced: old ? old.name : null });
    return { ok: true, salvaged: old ? B.SALVAGE[old.rarity] : 0 };
  }

  function applyDrop(state, rng, item, charId) {                                          // R6.7
    if (!charId) {
      state.account.renown += B.SALVAGE[item.rarity];
      state.account.renownLifetime += B.SALVAGE[item.rarity];
      ev(state, 'salvage', { item: item.name, renown: B.SALVAGE[item.rarity] });
      return { ok: true, renown: B.SALVAGE[item.rarity] };
    }
    if (charId === 'shelf') {                                                             // R6.7: a Ward may go to the shelf
      if (item.slot !== 'sigilWard') return { ok: false, reason: 'not a Ward' };
      if (state.account.wardShelf.length >= state.account.wardShelfSlots) return { ok: false, reason: 'no shelf slot' };
      state.account.wardShelf.push(item);
      return { ok: true, shelved: true };
    }
    var ch = byId(state, charId);
    if (!ch) return { ok: false, reason: 'no character' };
    return equip(state, rng, ch, item);
  }

  /* R5.10: replacement mid quest, Depth I to IV only */
  function canReplace(state) {
    var q = state.quest;
    if (!q) return false;
    if (B.REPLACEMENT_DEPTHS.indexOf(q.depth) < 0) return false;                          // Depth V: neither
    return livingParty(state).length < B.PARTY_SIZE;
  }
  function replace(state, rng, opts) {
    opts = opts || {};
    var q = state.quest;
    if (!canReplace(state)) return { ok: false, reason: 'no replacement at this Depth' };
    var ch = null;
    if (opts.recruit) {
      if (state.account.renown < B.HALL.recruit) return { ok: false, reason: 'cannot pay' };
      state.account.renown -= B.HALL.recruit;
      ch = newCharacter(rng, state.account, opts);
      ch.calling = opts.calling || ch.dealt[0].calling;
      state.roster.push(ch);
    } else {
      ch = byId(state, opts.charId);
      if (!ch || !ch.alive || ch.deployed || !canDeploy(ch)) return { ok: false, reason: 'not deployable' };
    }
    ch.deployed = true;
    ch.armorPool = effArmor(ch, null, q);
    ch.unkillableUsed = false;
    q.party.push(ch.id);
    ev(state, 'replacement', { id: ch.id, recruited: !!opts.recruit });
    return { ok: true, id: ch.id };
  }

  /* R2.6: retire needs a quest survived; a character with none is DISMISSED */
  function retire(state, charId) {
    var ch = byId(state, charId);
    if (!ch) return { ok: false, reason: 'no character' };
    if (ch.deployed && state.quest) return { ok: false, reason: 'on a quest' };
    if (ch.questsSurvived < 1) return { ok: false, reason: 'no quest survived, dismiss instead' };
    /* R2.6 CORRECTED (audit): the flat 2 plus Traits paid 3 Marrow for a character retired after ONE quest,
     * six times the design's own rate, so the fastest Marrow in the game was to recruit and retire rookies and
     * never risk anyone. Under the vest a retirement pays its Traits alone; the veteran's six is untouched. */
    var marrow = ch.questsSurvived >= B.RETIRE_VESTING ? B.RETIRE_MARROW + ch.traits.length : ch.traits.length;
    state.account.marrow += marrow;
    var legacy = { id: 'L' + (state.account.legacies.length + 1), calling: ch.calling, charName: ch.name,
      diedAt: 'the Hall', depth: 0, consecrated: false, retired: true };
    state.account.legacies.push(legacy);
    state.account.wall.unshift({ name: ch.name, origin: ch.origin, calling: ch.calling,
      quests: ch.questsSurvived, depth: 0, cause: 'retired after ' + ch.questsSurvived + ' quests', retired: true });
    var gear = stripGear(ch);
    state.pendingDrops = (state.pendingDrops || []).concat(gear);                          // R2.6 to the drop screen
    state.roster = state.roster.filter(function (c) { return c.id !== ch.id; });
    ev(state, 'retire', { id: ch.id, marrow: marrow, traits: ch.traits.length });
    return { ok: true, marrow: marrow, legacy: legacy.id, gear: gear };
  }
  function dismiss(state, charId) {                                                        // R2.6: 0 Marrow, no Legacy, no wall line
    var ch = byId(state, charId);
    if (!ch) return { ok: false, reason: 'no character' };
    if (ch.deployed && state.quest) return { ok: false, reason: 'on a quest' };
    var gear = stripGear(ch);
    state.pendingDrops = (state.pendingDrops || []).concat(gear);
    state.roster = state.roster.filter(function (c) { return c.id !== ch.id; });
    ev(state, 'dismiss', { id: ch.id });
    return { ok: true, marrow: 0, legacy: null, gear: gear };
  }

  /* ---- the Hall (R8.1, R8.2). Every purchase refuses when it cannot pay. ---- */
  /* R8.0b THE PRICE INDEX (audit). Every Hall price is multiplied by PRICE_INDEX[deepest Depth ever completed]
   * and rounded to the nearest 5, because income multiplies twice over with Depth while every price the spec
   * prints is a constant. Set the row to all ones to get the spec's printed prices back. */
  function price(state, base) {
    var d = Math.max(1, Math.min(B.PRICE_INDEX.length, state.account.deepestCompleted || 1));
    return Math.round(base * B.PRICE_INDEX[d - 1] / 5) * 5;
  }
  function pay(state, cost) {
    if (state.account.renown < cost) return false;
    state.account.renown -= cost; return true;
  }
  function payMarrow(state, cost) {
    if (state.account.marrow < cost) return false;
    state.account.marrow -= cost; return true;
  }
  var hall = {
    reforge: function (state, rng, charId, slot, affixIdx) {                              // R6.9
      var ch = byId(state, charId), item = ch && ch.gear[slot];
      if (!item) return { ok: false, reason: 'no relic there' };
      var line = item.affixes[affixIdx];
      if (!line) return { ok: false, reason: 'no such line' };
      if (item.unique && affixIdx >= item.affixes.length) return { ok: false, reason: 'never the unique' };
      if (!pay(state, price(state, B.HALL.reforge))) return { ok: false, reason: 'cannot pay' };
      /* R6.9: another valid affix of the same points, stat retargeted freely; a retarget of the SAME key counts
       * as another affix. When nothing is valid, REFORGE on that line is greyed and labelled Fixed. */
      var used = {}, sigs = {}, i;
      for (i = 0; i < item.affixes.length; i++) {
        if (i === affixIdx) continue;
        var o = item.affixes[i];
        if (B.AFFIXES[o.key] && B.AFFIXES[o.key].statTarget) used[o.key] = (used[o.key] || []).concat([o.stat]);
        else used[o.key] = (used[o.key] || 0) + 1;
        if (o.sigil) sigs[o.sigil] = 1;
      }
      var keys = Object.keys(B.AFFIXES).filter(function (k) {
        var d = B.AFFIXES[k];
        if (d.slots.indexOf(item.slot) < 0 || d.pts !== line.pts) return false;
        if (d.statTarget) return (used[k] || []).length < STATS.length;
        if (d.sigilTarget) return Object.keys(sigs).length < SIGILS.length;
        if (TWICE_OK[k]) return (used[k] || 0) < TWICE_OK[k];
        return !used[k];
      }).sort();
      if (!keys.length) return { ok: true, changed: false, fixed: true };
      var key = keys[rng.int(keys.length)], def = B.AFFIXES[key], eff = clone(def.eff), stat = null, sigil = null, j;
      if (def.statTarget) {
        var freeS = STATS.filter(function (x) { return (used[key] || []).indexOf(x) < 0; });
        stat = freeS[rng.int(freeS.length)];
        for (j = 0; j < eff.length; j++) if (eff[j].stat === '*') eff[j].stat = stat;
      }
      if (def.sigilTarget) {
        var freeG = SIGILS.filter(function (x) { return !sigs[x]; });
        sigil = freeG[rng.int(freeG.length)];
        for (j = 0; j < eff.length; j++) if (eff[j].sigil === '*') eff[j].sigil = sigil;
      }
      item.affixes[affixIdx] = { key: key, pts: def.pts, stat: stat, sigil: sigil, eff: eff };
      item.name = nameRelic(rng, item.slot, item.affixes, item.unique);
      return { ok: true, changed: true, key: key };
    },
    commission: function (state, rng, slot) {                                             // R6.10
      if (!pay(state, price(state, B.HALL.commission))) return { ok: false, reason: 'cannot pay' };
      var d = unlockedDepths(state).slice(-1)[0] || 1, out = [];
      for (var i = 0; i < 3; i++) out.push(newRelic(rng, d, { slot: slot }));
      return { ok: true, offers: out };
    },
    /* R8.1 Recruit, and R8.0 THE STRAY (audit, a blocker: without it the game soft locks). Whenever the roster
     * holds no deployable character and Renown is under the Recruit price, the button reads TAKE IN A STRAY and
     * costs 0, one at a time. A first quest wipe otherwise ends the account at the spec's own 8 percent wipe rate.
     * A stray is unproven, so its own death pays no Marrow (R8.5) and it cannot be farmed.
     * The roster count is LIVING characters only (R8.0). */
    recruitCost: function (state) {
      var cost = price(state, B.HALL.recruit);
      var deployable = state.roster.filter(canDeploy).length;
      if (deployable === 0 && state.account.renown < cost) return 0;                       // TAKE IN A STRAY
      return cost;
    },
    isStray: function (state) { return hall.recruitCost(state) === 0; },
    recruit: function (state, rng, opts) {
      var living = state.roster.filter(function (c) { return c.alive; }).length;
      if (living >= state.account.rosterSlots) return { ok: false, reason: 'roster full' };
      var cost = hall.recruitCost(state);
      if (cost > 0 && !pay(state, cost)) return { ok: false, reason: 'cannot pay' };
      var ch = newCharacter(rng, state.account, opts || {});
      ch.calling = (opts && opts.calling) || ch.dealt[0].calling;
      state.roster.push(ch);
      ev(state, 'recruit', { id: ch.id, cost: cost, stray: cost === 0 });
      return { ok: true, id: ch.id, character: ch, cost: cost, stray: cost === 0 };
    },
    redeal: function (state, rng, charId) {                                               // R8.1
      var ch = byId(state, charId);
      if (!ch) return { ok: false, reason: 'no character' };
      if (ch.questsSurvived > 0) return { ok: false, reason: 'not a fresh character' };
      if (!pay(state, price(state, B.HALL.redeal))) return { ok: false, reason: 'cannot pay' };
      ch.dealt = dealCallings(rng, state.account);
      return { ok: true, dealt: ch.dealt };
    },
    mend: function (state) {                                                              // R8.1, R8.3
      if (!pay(state, price(state, B.HALL.mend))) return { ok: false, reason: 'cannot pay' };
      for (var i = 0; i < state.roster.length; i++) state.roster[i].strain = 0;
      return { ok: true };
    },
    excise: function (state, charId) {                                                    // R2.5
      var ch = byId(state, charId);
      if (!ch) return { ok: false, reason: 'no character' };
      if (ch.excised) return { ok: false, reason: 'already excised' };
      if (ch.scars < 1) return { ok: false, reason: 'no scar' };
      if (!pay(state, price(state, B.HALL.excise))) return { ok: false, reason: 'cannot pay' };
      ch.scars--; ch.excised = true;
      return { ok: true, scars: ch.scars };
    },
    wardSlot: function (state) {                                                          // R8.1
      var a = state.account;
      if (a.wardShelfSlots >= B.HALL.wardShelfMax) return { ok: false, reason: 'shelf full' };
      var cost = price(state, a.wardShelfSlots === 0 ? B.HALL.wardShelfFirst : B.HALL.wardShelfFirst + B.HALL.wardShelfStep * a.wardShelfSlots);
      if (!pay(state, cost)) return { ok: false, reason: 'cannot pay' };
      a.wardShelfSlots++;
      return { ok: true, slots: a.wardShelfSlots, cost: cost };
    },
    raiseFloor: function (state, stat) {                                                  // R8.2, R8.6
      var a = state.account, cur = a.creationFloors[stat];
      var next = B.CREATION_FLOORS[B.CREATION_FLOORS.indexOf(cur) + 1];
      if (!next) return { ok: false, reason: 'already at the top floor' };
      var cost = next === 6 ? B.MARROW_SHOP.floorD6 : B.MARROW_SHOP.floorD8;
      if (!payMarrow(state, cost)) return { ok: false, reason: 'cannot pay' };
      a.creationFloors[stat] = next;
      return { ok: true, floor: next, cost: cost };
    },
    rosterSlot: function (state) {                                                        // R8.2
      var a = state.account;
      if (a.rosterSlots >= B.MARROW_SHOP.rosterMax) return { ok: false, reason: 'roster at maximum' };
      var cost = B.MARROW_SHOP.rosterSlotFirst + B.MARROW_SHOP.rosterSlotStep * a.rosterBought;
      if (!payMarrow(state, cost)) return { ok: false, reason: 'cannot pay' };
      a.rosterSlots++; a.rosterBought++;
      return { ok: true, slots: a.rosterSlots, cost: cost };
    },
    legacySlot: function (state) {                                                        // R8.2
      var a = state.account;
      if (a.legacySlots >= B.MARROW_SHOP.legacyMax) return { ok: false, reason: 'at the cap' };
      if (!payMarrow(state, B.MARROW_SHOP.legacySlot)) return { ok: false, reason: 'cannot pay' };
      a.legacySlots++;
      return { ok: true, slots: a.legacySlots };
    },
    unlockOrigin: function (state, rng, pick) {                                           // R8.2
      var a = state.account;
      var locked = Object.keys(ORIGINS).filter(function (k) { return a.unlockedOrigins.indexOf(k) < 0; });
      if (!locked.length) return { ok: false, reason: 'all unlocked' };
      if (!payMarrow(state, B.MARROW_SHOP.unlockOrigin)) return { ok: false, reason: 'cannot pay' };
      var dealt = rng.shuffle(locked).slice(0, 3);
      var chosen = pick && dealt.indexOf(pick) >= 0 ? pick : dealt[0];
      a.unlockedOrigins.push(chosen);
      return { ok: true, dealt: dealt, chosen: chosen };
    },
    consecrate: function (state, legacyId) {                                              // R8.2
      var a = state.account, i, target = null;
      for (i = 0; i < a.legacies.length; i++) if (a.legacies[i].id === legacyId) target = a.legacies[i];
      if (!target) return { ok: false, reason: 'no such legacy' };
      if (!payMarrow(state, B.MARROW_SHOP.consecrate)) return { ok: false, reason: 'cannot pay' };
      for (i = 0; i < a.legacies.length; i++) a.legacies[i].consecrated = false;           // only one at a time
      target.consecrated = true;
      return { ok: true, legacy: legacyId };
    }
  };

  /* ================= SIM.policy: the reasonable player, inside the engine =================
   * Not an AI. One legible player, so a balance number measured by the harness means something.
   *
   *  assign  enumerate every legal assignment of the living party to this stage's open slots
   *          (a Relay takes two different bodies; one body may double only when the stage needs
   *          more bodies than the party has, R5.6). Score an assignment as the sum over its
   *          checks of P(pass) x the slot's Renown minus P(fail) x strainOnFail x a danger weight
   *          of 1 + 3 x strain / max(1, toughness - 1), so a hurt character is worth less
   *          everywhere and worth nothing on a slot that would kill them. Among the assignments
   *          that bench the most strained living character, keep the highest score.
   *  boss    each character goes to the unbroken Aspect that maximises P(pass) x expected damage,
   *          reading the Aspects with the fewest hit points first, and an Aspect already projected
   *          dead this round is worth a quarter, so the party does not all pile onto one card.
   *  push    Push when it raises P(pass) by at least 0.15 and leaves Strain <= Toughness - 2.
   *  vault   Vault and Open take the character's highest die.
   *  trait   a fixed priority list, best first.
   *  drop    equip a drop that beats the worn item's points, otherwise take the Renown.
   *  hall    Mend when a deployed character sits at Toughness - 1 and Renown >= 20; Recruit while
   *          fewer than three characters can deploy; retire at effective Toughness <= 1 once a
   *          quest has been survived (R2.6 pays 2 + Traits, a death pays 1).
   */
  var TRAIT_PRIORITY = ['ironlung', 'steady', 'bulwark', 'unkillable', 'ninthHour', 'surehanded',
    'deepdrawn', 'bloodhound', 'quickstudy', 'steadfast', 'grim', 'untethered'];

  function probFor(state, ch, stat, tn, shape, opts) {
    opts = opts || {};
    var o = checkContext(state, ch, { stat: stat, tn: tn, shape: shape, boss: !!opts.boss,
      push: !!opts.push, twice: !!opts.twice, firstOfStage: !!opts.firstOfStage, lastOfStage: !!opts.lastOfStage });
    return passProb(o.die, tn, { surgeMinus: o.surgeMinus, floor: o.floor, flat: o.flat, push: o.push,
      twice: o.twice, reroll1s: o.reroll1s, noSurge: o.noSurge });
  }
  function danger(ch) {                                                                   // the policy's weight
    var t = effToughness(ch);
    return 1 + 3 * ch.strain / Math.max(1, t - 1);
  }
  function highestDie(ch) {
    var best = STATS[0], list = collect(ch);
    for (var i = 1; i < STATS.length; i++) if (effStat(ch, STATS[i], list) > effStat(ch, best, list)) best = STATS[i];
    return best;
  }
  function expectedDamage(state, ch, stat, tn, p) {
    if (p <= 0) return 0;
    var o = checkContext(state, ch, { stat: stat, tn: tn, shape: 'boss', boss: true });
    var e = 1, j;
    for (j = 2; j <= 30; j++) {
      var pj = passProb(o.die, tn + j, { surgeMinus: o.surgeMinus, floor: o.floor, flat: o.flat, noSurge: o.noSurge });
      if (pj <= 0) break;
      e += pj / p;
    }
    e += query(o.list, 'aspectDmg', {});
    return e;
  }

  function enumerateAssignments(state, stage) {
    var living = livingParty(state), idx = activeSlots(stage), i;
    var needs = [];
    for (i = 0; i < idx.length; i++) needs.push(stage.slots[idx[i]].shape === 'relay' ? 2 : 1);
    var total = sum(needs);
    var allowDouble = living.length >= 2 && stageChecks(stage) > living.length;   // R5.6 CORRECTED
    var out = [];
    function rec(k, used, picked) {
      if (k >= idx.length) {
        /* R5.6: nobody benches only when the assignment POSITIONS are at least the bodies (Relay plus Relay is
         * four positions for three), so an option that leaves a living body idle is not legal there. Chain plus
         * Chain is four CHECKS but only two positions, so the third character still benches. */
        if (total >= living.length) { for (var z = 0; z < living.length; z++) if (!used[living[z]]) return; }
        out.push(picked.slice()); return;
      }
      var want = needs[k], pool = living.filter(function (id) { return (used[id] || 0) < (allowDouble ? 2 : 1); });
      if (want === 1) {
        for (var a = 0; a < pool.length; a++) {
          used[pool[a]] = (used[pool[a]] || 0) + 1;
          picked.push([pool[a]]); rec(k + 1, used, picked); picked.pop();
          used[pool[a]]--;
        }
      } else {
        for (var b = 0; b < pool.length; b++) for (var c = 0; c < pool.length; c++) {
          if (pool[b] === pool[c]) continue;                                              // R5.5: two DIFFERENT characters
          used[pool[b]] = (used[pool[b]] || 0) + 1; used[pool[c]] = (used[pool[c]] || 0) + 1;
          picked.push([pool[b], pool[c]]); rec(k + 1, used, picked); picked.pop();
          used[pool[b]]--; used[pool[c]]--;
        }
      }
    }
    if (living.length) rec(0, {}, []);
    return { options: out, idx: idx, living: living, needsBodies: total };
  }

  var policy = {
    assign: function (state) {
      var q = state.quest, stage = currentStage(state);
      var en = enumerateAssignments(state, stage), i, j, k;
      var mostStrained = null;
      for (i = 0; i < en.living.length; i++) {
        var lc = byId(state, en.living[i]);
        if (!mostStrained || lc.strain > mostStrained.strain) mostStrained = lc;
      }
      var best = null, bestScore = -1e9, bestBenches = false;
      for (i = 0; i < en.options.length; i++) {
        var opt = en.options[i], score = 0, usedIds = {};
        var plan = { slots: [], bench: null, benchOnce: null };
        for (j = 0; j < stage.slots.length; j++) plan.slots.push(null);
        for (j = 0; j < en.idx.length; j++) {
          var si = en.idx[j], slot = stage.slots[si], chars = opt[j];
          var stat = null;
          if (slot.shape === 'vault' || slot.shape === 'open') stat = highestDie(byId(state, chars[0]));
          var entry = { chars: chars.slice(), stat: stat, push: [], twice: [] };
          for (k = 0; k < slot.checks; k++) {
            var actor = byId(state, slot.shape === 'relay' ? chars[k] : chars[0]);
            usedIds[actor.id] = 1;
            var st = slot.stats[k] || stat;
            var p = probFor(state, actor, st, slot.tns[k], slot.shape);
            score += p * slot.reward.renown - (1 - p) * stage.strainOnFail * danger(actor);
            if (slot.shape === 'toll') score -= danger(actor) * slot.fee;                 // the fee is real Strain
          }
          plan.slots[si] = entry;
        }
        var benched = en.living.filter(function (id) { return !usedIds[id]; });
        var benchesTheHurt = !!(mostStrained && benched.indexOf(mostStrained.id) >= 0);
        if (benched.length) score += (byId(state, benched[0]).strain) * 1.0;
        if (bestBenches && !benchesTheHurt) continue;                                     // prefer benching the most strained
        if (!bestBenches && benchesTheHurt) { best = null; bestScore = -1e9; bestBenches = true; }
        if (score > bestScore) { bestScore = score; best = plan; best.bench = benched[0] || null; }
      }
      if (!best) return { slots: stage.slots.map(function () { return null; }), bench: null };
      // Push: raises P(pass) by at least 0.15 and leaves Strain <= Toughness - 2 (R1.6)
      for (j = 0; j < stage.slots.length; j++) {
        var s3 = stage.slots[j], e3 = best.slots[j];
        if (!e3) continue;
        for (k = 0; k < s3.checks; k++) {
          var ch3 = byId(state, s3.shape === 'relay' ? e3.chars[k] : e3.chars[0]);
          var st3 = s3.stats[k] || e3.stat;
          var p0 = probFor(state, ch3, st3, s3.tns[k], s3.shape);
          var p1 = probFor(state, ch3, st3, s3.tns[k], s3.shape, { push: true });
          var cost = pushCost(state, ch3);
          if (p1 - p0 >= 0.15 && (ch3.strain + cost) <= effToughness(ch3) - 2) e3.push[k] = true;
          if (p0 < 0.6 && query(collect(ch3), 'twiceStage', { stat: st3 }) && !q.twiceUsed[ch3.id]) e3.twice[k] = true;
        }
      }
      return best;
    },
    boss: function (state) {
      var stage = currentStage(state), living = livingParty(state), i, j;
      var projected = {}, targets = {}, push = {};
      for (i = 0; i < living.length; i++) {
        var ch = byId(state, living[i]);
        var order = [];
        for (j = 0; j < stage.aspects.length; j++) if (!stage.aspects[j].broken) order.push(j);
        order.sort(function (a, b) { return (stage.aspects[a].hp - stage.aspects[b].hp) || (a - b); });  // fewest first
        var bestI = order[0], bestV = -1;
        for (j = 0; j < order.length; j++) {
          var ai = order[j], asp = stage.aspects[ai];
          var p = probFor(state, ch, asp.stat, asp.tn, 'boss', { boss: true });
          var v = p * expectedDamage(state, ch, asp.stat, asp.tn, p);
          if ((projected[ai] || 0) >= asp.hp) v *= 0.25;                                   // do not all pile on one card
          if (v > bestV) { bestV = v; bestI = ai; }
        }
        targets[ch.id] = bestI;
        projected[bestI] = (projected[bestI] || 0) + bestV;
        var asp2 = stage.aspects[bestI];
        var p0 = probFor(state, ch, asp2.stat, asp2.tn, 'boss', { boss: true });
        var p1 = probFor(state, ch, asp2.stat, asp2.tn, 'boss', { boss: true, push: true });
        if (p1 - p0 >= 0.15 && (ch.strain + pushCost(state, ch)) <= effToughness(ch) - 2) push[ch.id] = true;
      }
      return { targets: targets, push: push, twice: {} };
    },
    trait: function (state, charId, offers) {
      for (var i = 0; i < TRAIT_PRIORITY.length; i++) if (offers.indexOf(TRAIT_PRIORITY[i]) >= 0) return TRAIT_PRIORITY[i];
      return offers[0];
    },
    drop: function (state, item, candidates) {
      var best = null, bestGain = 0;
      for (var i = 0; i < candidates.length; i++) {
        var ch = byId(state, candidates[i]);
        if (!ch || !ch.alive) continue;
        var worn = ch.gear[item.slot];
        var gain = item.pts - (worn ? worn.pts : 0);
        if (gain > bestGain) { bestGain = gain; best = ch.id; }
      }
      return best;                                                                          // null: take the Renown
    },
    takeDrops: function (state, rng) {
      var q = state.quest, out = [];
      var cands = q ? livingParty(state) : state.roster.map(function (c) { return c.id; });
      while (q.drops.length) {
        var item = q.drops.shift();
        out.push(applyDrop(state, rng, item, policy.drop(state, item, cands)));
      }
      return out;
    },
    hall: function (state, rng) {
      var acct = state.account, i;
      // retire at effective Toughness <= 1 once a quest has been survived (R2.6)
      for (i = state.roster.length - 1; i >= 0; i--) {
        var ch = state.roster[i];
        if (!ch.deployed && ch.questsSurvived >= 1 && effToughness(ch) <= 1) retire(state, ch.id);
      }
      // Recruit while fewer than three can deploy
      var guard = 0;
      while (state.roster.filter(canDeploy).length < B.PARTY_SIZE && guard++ < 8) {
        var r = hall.recruit(state, rng, {});
        if (!r.ok) break;
      }
      // Mend when a deployable character sits at Toughness - 1 and Renown >= 20
      var need = false;
      for (i = 0; i < state.roster.length; i++) {
        var c2 = state.roster[i];
        if (canDeploy(c2) && c2.strain >= effToughness(c2) - 1) need = true;
      }
      if (need && acct.renown >= B.HALL.mend) hall.mend(state);
      // any Traits still owed
      var pend = state.pendingTraits || [];
      for (i = 0; i < pend.length; i++) takeTrait(state, pend[i].charId, policy.trait(state, pend[i].charId, pend[i].offers));
      state.pendingTraits = [];
      // gear the roster with anything left on the drop screen
      var left = state.pendingDrops || [];
      for (i = 0; i < left.length; i++) applyDrop(state, rng, left[i], policy.drop(state, left[i], state.roster.map(function (c) { return c.id; })));
      state.pendingDrops = [];
      return state;
    },
    party: function (state) {
      var able = state.roster.filter(canDeploy);
      able.sort(function (a, b) { return (a.strain / Math.max(1, effToughness(a))) - (b.strain / Math.max(1, effToughness(b))); });
      return able.slice(0, B.PARTY_SIZE).map(function (c) { return c.id; });
    },
    playQuest: function (state, rng, questDef, partyIds) {
      startQuest(state, rng, questDef, partyIds || policy.party(state));
      var guard = 0;
      while (state.quest && !state.quest.over && guard++ < 5000) {
        var q = state.quest;
        if (q.step === 'assign') assign(state, policy.assign(state));
        else if (q.step === 'check') resolveNext(state, rng);
        else if (q.step === 'stageEnd') { policy.takeDrops(state, rng); endStage(state, rng); }
        else if (q.step === 'bossAssign') bossAssign(state, policy.boss(state));
        else if (q.step === 'bossCheck') resolveBossCheck(state, rng);
        else if (q.step === 'strike') bossStrike(state, rng);
        else if (q.step === 'bossWon') { policy.takeDrops(state, rng); endStage(state, rng); }
        else break;
      }
      if (state.quest) policy.takeDrops(state, rng);
      return endQuest(state, rng);
    }
  };

  var SIM = {
    newGame: newGame, newAccount: newAccount, byId: byId, unlockedDepths: unlockedDepths,
    addCharacter: addCharacter, seedRoster: seedRoster,
    startQuest: startQuest, assign: assign, resolveNext: resolveNext, endStage: endStage,
    bossAssign: bossAssign, resolveBossCheck: resolveBossCheck, bossStrike: bossStrike, bossRound: bossRound,
    rerollHeld: rerollHeld, commitHeld: commitHeld, rerollAvailable: rerollAvailable,
    endQuest: endQuest, takeTrait: takeTrait, applyDrop: applyDrop, equip: equip,
    canReplace: canReplace, replace: replace, death: death, deathTest: deathTest, applyStrain: applyStrain,
    retire: retire, dismiss: dismiss, hall: hall, policy: policy,
    currentStage: currentStage, stagePlan: stagePlan, livingParty: livingParty, tnVisible: tnVisible,
    checkContext: checkContext, pushCost: pushCost, canPush: canPush, doBench: doBench,
    benchClearFor: benchClearFor, enumerateAssignments: enumerateAssignments, activeSlots: activeSlots
  };

  return {
    STATS: STATS, DICE: DICE, SLOTS: SLOTS, RARITIES: RARITIES, SIGILS: SIGILS, SHAPES: SHAPES,
    BALANCE: DEFAULT_BALANCE, AFFIXES: DEFAULT_BALANCE.AFFIXES, makeBalance: makeBalance,
    useBalance: useBalance, balance: balance, deepFreeze: deepFreeze,
    mixSeed: mixSeed, seedFromString: seedFromString, makeRng: makeRng,
    RNG: { mixSeed: mixSeed, seedFromString: seedFromString, makeRng: makeRng },
    EFFECTS: EFFECTS, ORIGINS: ORIGINS, CALLINGS: CALLINGS, TRAITS: TRAITS,
    collect: collect, query: query, queryAll: queryAll,
    DICE_API: DICE_API, roll: roll, passProb: passProb, surgeThreshold: surgeThreshold,
    floorCap: floorCap, effectiveFloor: effectiveFloor, floorFor: floorFor,
    effStat: effStat, effToughness: effToughness, effArmor: effArmor, canDeploy: canDeploy,
    hasSigil: hasSigil, sigilRelief: sigilRelief, highestStat: highestStat,
    GEN: GEN, SIM: SIM, setData: setData, data: data, DATA: DATA,
    stepDie: stepDie, rungOf: rungOf, dieAtRung: dieAtRung
  };
});
