/**
 * AURA OFF — src/engine/scoring.js
 *
 * Every multiplier in the game, the composure curve, the category triangle,
 * and the two audience functions. CONTRACT.md §5.
 *
 * PURE MODULE. No DOM, no globals, no state. Every function here is a function
 * of its arguments, which is what lets the balance simulator hammer it three
 * thousand battles a second and the UI display the exact same numbers.
 *
 * This file does NOT decide turn outcomes — `battle.resolveExchange()` does.
 * What lives here is the arithmetic it calls.
 */

/* -------------------------------------------------------------------------- */
/* THE TRIANGLE                                                                */
/* -------------------------------------------------------------------------- */

export const CATEGORIES = ['FLEX', 'FLOW', 'BAIT'];

/** FLEX > BAIT · BAIT > FLOW · FLOW > FLEX. */
export const BEATS = Object.freeze({ FLEX: 'BAIT', BAIT: 'FLOW', FLOW: 'FLEX' });

/** The inverse: what loses to what. */
export const BEATEN_BY = Object.freeze({ BAIT: 'FLEX', FLOW: 'BAIT', FLEX: 'FLOW' });

/**
 * The category that beats `cat`. The `mirror` quirk lives on this one line.
 * @param {string} cat
 * @returns {string|null}
 */
export function counterCategory(cat) {
  return BEATEN_BY[cat] || null;
}

/* -------------------------------------------------------------------------- */
/* THE FACTOR TABLE — CONTRACT.md §5                                           */
/* -------------------------------------------------------------------------- */

export const TIMING = Object.freeze({ perfect: 2.0, clean: 1.35, shaky: 0.7, whiff: 0.3 });
export const TIMING_BANDS = ['perfect', 'clean', 'shaky', 'whiff'];
export const TIMING_LABEL = Object.freeze({
  perfect: 'PERFECT', clean: 'CLEAN', shaky: 'SHAKY', whiff: 'WHIFF'
});

export const MATCHUP = Object.freeze({ advantage: 1.5, neutral: 1.0, disadvantage: 0.7 });
export const MATCHUP_LABEL = Object.freeze({
  advantage: 'ADVANTAGE', neutral: 'EVEN', disadvantage: 'DISADVANTAGE'
});

/** Freshness by times already used this battle. Clamps at the last entry. */
export const FRESHNESS = Object.freeze([1.0, 0.68, 0.42, 0.25]);

export const COMBO_STEP = 0.14;
export const PATTERN_MULT = 1.5;

/**
 * Aura points per raw score unit. The §5 product lands around 60–300; the
 * culture's own callouts are `+1000 de aura` and `+10.000 de aura`, so a clean
 * neutral exchange has to read as roughly a thousand. Ten does that.
 * (AURA-CULTURE §1.2 — invented units are not allowed.)
 */
export const AURA_SCALE = 10;

/**
 * The amplitude window the input maps onto. It has to reach well past the
 * highest `idealAmp` in the roster (Dead Drop and Giant Clog at 1.50),
 * because overplaying being punishable requires overplaying being reachable.
 */
export const AMP_RANGE = Object.freeze({ min: 0.4, max: 1.9 });

/* -------------------------------------------------------------------------- */
/* THE FACTORS                                                                 */
/* -------------------------------------------------------------------------- */

/** @param {string} band 'perfect' | 'clean' | 'shaky' | 'whiff' */
export function timingMult(band) {
  const v = TIMING[band];
  return typeof v === 'number' ? v : TIMING.clean;
}

/**
 * Where `mine` sits against `theirs` on the triangle.
 * A null opponent category (round one, or a side that did not act) is neutral.
 * @returns {'advantage'|'neutral'|'disadvantage'}
 */
export function matchupOf(mine, theirs) {
  if (!mine || !theirs) return 'neutral';
  if (BEATS[mine] === theirs) return 'advantage';
  if (BEATS[theirs] === mine) return 'disadvantage';
  return 'neutral';
}

export function matchupMult(mine, theirs) {
  return MATCHUP[matchupOf(mine, theirs)];
}

/**
 * Freshness decay. This is the mechanical form of the verified win condition —
 * competitors are documented as needing to reference as many different memes as
 * possible — so repeating yourself has to cost, and it has to cost steeply.
 * @param {number} uses times this move was already played this battle
 */
export function freshnessMult(uses) {
  const n = uses > 0 ? Math.floor(uses) : 0;
  return n >= FRESHNESS.length ? FRESHNESS[FRESHNESS.length - 1] : FRESHNESS[n];
}

/** `1 + 0.14 * links`. */
export function comboMult(links) {
  const n = links > 0 ? links : 0;
  return 1 + COMBO_STEP * n;
}

/** A named three-move chain is 1.5×; anything else is 1.0×. */
export function patternMult(pattern) {
  return pattern ? (pattern.mult || PATTERN_MULT) : 1;
}

/* -------------------------------------------------------------------------- */
/* COMPOSURE — FROZEN                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Quoted verbatim from HANDOFF §2 and CONTRACT.md §5. DO NOT FLATTEN, do not
 * "improve", do not touch a constant.
 *
 * Score falls off on BOTH sides of the move's ideal amplitude, and harder above
 * than below, because trying too hard is the cardinal sin of this culture.
 * Sourced: Prof. Frederick Luis Aldama watched a real battle at Parque México
 * and reported that the winner was not the high-intensity performer but the one
 * with total composure. Bigger is not better.
 *
 * It is also the single mechanic that makes 27 moves feel like 27 different
 * physical acts. A linear ramp would be simpler and would make the game worse.
 */
export function composure(move, amp) {
  const off = amp - move.idealAmp;
  const w = off > 0 ? 0.70 : 0.90;   // tighter tolerance above ideal
  return Math.max(0.50, 1.25 - Math.pow(Math.abs(off) / w, 1.7));
}

/** The amplitude at which composure peaks — for the `#ampIdeal` marker. */
export function idealAmp(move) {
  return move && typeof move.idealAmp === 'number' ? move.idealAmp : 1;
}

/* -------------------------------------------------------------------------- */
/* BLEND — REWARD THE SPLIT, PUNISH THE STACK                                  */
/* -------------------------------------------------------------------------- */

export const BLEND_FLOOR = 0.6;
export const BLEND_GAIN = 1.4;

/** How much of a genuine split this pairing is: A's upper share × B's lower share. */
export function splitQuality(a, b) {
  const up = a && typeof a.up === 'number' ? a.up : 0;
  const lo = b && typeof b.lo === 'number' ? b.lo : 0;
  return up * lo;
}

/**
 * `0.6 + 1.4 × (A.up × B.lo)`.
 *
 * Six-Seven upper (up 1.0) over Aura Walk lower (lo 0.8) → 1.72×.
 * Six-Seven upper over Jawline lower (lo 0.0)            → 0.60×.
 *
 * The magnitudes are tunable in the sim. The sign of the effect is not.
 */
export function blendMult(a, b) {
  return BLEND_FLOOR + BLEND_GAIN * splitQuality(a, b);
}

/**
 * Build the synthetic move a blend performs and is scored as.
 *
 * Category comes from A, the upper body, because the upper body is what the
 * crowd reads first. A blend carries no `special` — it is a hybrid, not a role,
 * and letting it inherit one would make Blend the answer to every question.
 *
 * @param {Object} a upper-body source move
 * @param {Object} b lower-body source move
 * @returns {Object} a move-shaped object with `blend: {a, b, split}`
 */
export function blendMove(a, b) {
  const up = typeof a.up === 'number' ? a.up : 1;
  const lo = typeof b.lo === 'number' ? b.lo : 0;
  const w = up + lo;
  const ideal = w > 1e-9
    ? (idealAmp(a) * up + idealAmp(b) * lo) / w
    : (idealAmp(a) + idealAmp(b)) / 2;
  const total = up + lo || 1;
  return {
    id: 'blend:' + a.id + '+' + b.id,
    name: a.name + ' × ' + b.name,
    cat: a.cat,
    tier: 'V3',
    base: Math.round((a.base + b.base) / 2),
    up: up / total,
    lo: lo / total,
    idealAmp: Math.round(ideal * 100) / 100,
    dur: Math.max(a.dur || 1600, b.dur || 1600),
    lag: b.lag || 0,
    hint: a.hint,
    special: null,
    frames: null,
    blend: { a: a.id, b: b.id, split: splitQuality(a, b) }
  };
}

/* -------------------------------------------------------------------------- */
/* PATTERNS — NAMED THREE-MOVE CHAINS                                          */
/* -------------------------------------------------------------------------- */

/**
 * Native vocabulary only. No ballroom terms — see CONTRACT.md §12 and
 * AURA-CULTURE §A7 for why that line is drawn where it is.
 *
 * Each pattern tests the last three moves played. Order never matters; what
 * matters is what the three of them say together.
 */
export const PATTERNS = Object.freeze([
  {
    id: 'spectrum',
    name: 'ESPECTRO',
    mult: 1.5,
    blurb: 'All three categories, back to back to back.',
    test: function (moves) {
      const c = {};
      for (let i = 0; i < 3; i++) c[moves[i].cat] = 1;
      return c.FLEX && c.FLOW && c.BAIT;
    }
  },
  {
    id: 'river',
    name: 'RÍO ARRIBA',
    mult: 1.5,
    blurb: 'River Prow, Swirl & Swing and Ground Spin — where it started.',
    test: function (moves) {
      const want = { boat: 0, swirl: 0, spin: 0 };
      for (let i = 0; i < 3; i++) {
        const id = moves[i].id;
        if (!(id in want)) return false;
        want[id]++;
      }
      return want.boat === 1 && want.swirl === 1 && want.spin === 1;
    }
  },
  {
    id: 'control',
    name: 'PURO CONTROL',
    mult: 1.5,
    blurb: 'Three restrained moves in a row. Nobody raised their voice.',
    test: function (moves) {
      if (moves[0].id === moves[1].id || moves[1].id === moves[2].id || moves[0].id === moves[2].id) return false;
      for (let i = 0; i < 3; i++) if (idealAmp(moves[i]) > 1.05) return false;
      return true;
    }
  },
  {
    id: 'triple',
    name: 'TRIPLE FARMEO',
    mult: 1.5,
    blurb: 'Three different moves, one category, no repeats.',
    test: function (moves) {
      if (moves[0].cat !== moves[1].cat || moves[1].cat !== moves[2].cat) return false;
      return moves[0].id !== moves[1].id && moves[1].id !== moves[2].id && moves[0].id !== moves[2].id;
    }
  }
]);

/**
 * Test the last three moves against the pattern list. First match wins, so the
 * list is ordered by how much the player earned it.
 *
 * @param {Array<Object>} moves exactly three move objects, oldest first
 * @returns {Object|null} the pattern, or null
 */
export function findPattern(moves) {
  if (!moves || moves.length !== 3 || !moves[0] || !moves[1] || !moves[2]) return null;
  for (let i = 0; i < PATTERNS.length; i++) {
    if (PATTERNS[i].test(moves)) return PATTERNS[i];
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/* THE SCORING CONTEXT                                                         */
/* -------------------------------------------------------------------------- */

/**
 * @typedef {Object} ScoreCtx
 * @property {Object}  move        the move being scored (or a `blendMove`)
 * @property {number}  amp         the amplitude actually achieved
 * @property {string}  band        'perfect' | 'clean' | 'shaky' | 'whiff'
 * @property {number}  [uses=0]    times this move was already played this battle
 * @property {string}  [oppCat]    the opponent's category this turn
 * @property {string}  [prevCat]   your own previous move's category
 * @property {number}  [links=0]   combo links applied this turn
 * @property {Object}  [pattern]   a pattern from `findPattern`, or null
 * @property {Object}  [blend]     `{ a: moveA, b: moveB }` when this is a blend
 * @property {number}  [freshExtra=1] extra freshness penalty (punisher, act rule)
 * @property {number}  [extraMult=1]  specials multiplier resolved by battle.js
 * @property {number}  [bonus=0]      flat aura added after multipliers (persist)
 */

/** Pull every §5 factor out of a context in one pass. */
export function factorsOf(ctx) {
  const m = ctx.move;
  return {
    base: m.base,
    timing: timingMult(ctx.band),
    matchup: matchupMult(m.cat, ctx.oppCat),
    freshness: freshnessMult(ctx.uses || 0) * (ctx.freshExtra != null ? ctx.freshExtra : 1),
    composure: composure(m, ctx.amp),
    combo: comboMult(ctx.links || 0),
    pattern: patternMult(ctx.pattern),
    blend: ctx.blend ? blendMult(ctx.blend.a, ctx.blend.b) : 1,
    special: ctx.extraMult != null ? ctx.extraMult : 1
  };
}

/**
 * The literal CONTRACT.md §5 product, unscaled:
 *
 *   raw = base × timing × matchup × freshness × composure × combo × pattern
 *
 * plus the two factors §5 introduces separately (blend and specials). Returned
 * unscaled and unweighted so the balance sim can inspect the pure product
 * without either audience's opinion on it.
 *
 * @param {ScoreCtx} ctx
 */
export function rawScore(ctx) {
  const f = factorsOf(ctx);
  return f.base * f.timing * f.matchup * f.freshness * f.composure *
    f.combo * f.pattern * f.blend * f.special;
}

/* -------------------------------------------------------------------------- */
/* TWO AUDIENCES, TWO FUNCTIONS                                                */
/* -------------------------------------------------------------------------- */

/**
 * Verified: some battles are decided by crowd reaction, some by a panel, some by
 * both. They are not one function with a flag, because they do not want the
 * same thing. The organiser's own criteria — whoever looks best, whoever
 * demonstrates it, WHOEVER CAUSES THE MOST LAUGHTER — is the crowd. Technique
 * is the panel.
 */
export const CROWD_CAT_WEIGHT = Object.freeze({ FLEX: 0.92, FLOW: 1.03, BAIT: 1.22 });
export const JUDGE_CAT_WEIGHT = Object.freeze({ FLEX: 1.12, FLOW: 1.02, BAIT: 0.88 });

/** How much each audience bends the shared factors. */
export const CROWD_SHAPE = Object.freeze({
  timing: 0.85,        // forgives a wobble
  composure: 0.55,     // cares much less about precision
  freshness: 0.75,     // forgives a repeat, a bit
  spectacle: 0.26,     // per unit of amplitude above 1.0
  spectacleCap: 0.24,  // ceiling on the spectacle bonus
  surprise: 1.12,      // switching category since your last move
  blend: 0.7           // sees the trick, half-credits it
});

export const JUDGE_SHAPE = Object.freeze({
  timing: 1.10,        // full weight, and then some
  composure: 1.60,     // technique is the whole job
  freshness: 1.45,     // punishes repeats hard
  blend: 1.35          // rewards a real split, because it is harder
});

/**
 * The crowd. Rewards laughter, surprise and spectacle; forgives imprecision.
 *
 * @param {ScoreCtx} ctx
 * @returns {number} aura points
 */
export function crowdScore(ctx) {
  return scoreBoth(ctx).crowd;
}

/**
 * The panel. Rewards composure, freshness and clean timing; ignores spectacle
 * entirely and quietly disapproves of clowning.
 *
 * @param {ScoreCtx} ctx
 * @returns {number} aura points
 */
export function judgeScore(ctx) {
  return scoreBoth(ctx).judges;
}

/**
 * Both audiences in one pass. `battle.js` uses this — the factor set is
 * identical for the two and computing it twice is pure waste at simulator
 * volume.
 *
 * @param {ScoreCtx} ctx
 * @returns {{crowd:number, judges:number, raw:number, factors:Object,
 *            crowdParts:Object, judgeParts:Object}}
 */
export function scoreBoth(ctx) {
  const f = factorsOf(ctx);
  const m = ctx.move;
  const bonus = ctx.bonus || 0;

  const raw = f.base * f.timing * f.matchup * f.freshness * f.composure *
    f.combo * f.pattern * f.blend * f.special;

  /* --- the crowd ------------------------------------------------------- */
  const cCat = CROWD_CAT_WEIGHT[m.cat] || 1;
  const cTiming = 1 + (f.timing - 1) * CROWD_SHAPE.timing;
  const cComp = Math.pow(f.composure, CROWD_SHAPE.composure);
  const cFresh = Math.pow(f.freshness, CROWD_SHAPE.freshness);
  const over = ctx.amp > 1 ? ctx.amp - 1 : 0;
  const cSpec = 1 + Math.min(CROWD_SHAPE.spectacleCap, CROWD_SHAPE.spectacle * over);
  const cSurp = (ctx.prevCat && ctx.prevCat !== m.cat) ? CROWD_SHAPE.surprise : 1;
  const cBlend = ctx.blend ? 1 + (f.blend - 1) * CROWD_SHAPE.blend : 1;

  const crowd = f.base * cTiming * f.matchup * cFresh * cComp * f.combo * f.pattern *
    cCat * cSpec * cSurp * cBlend * f.special * AURA_SCALE + bonus;

  /* --- the panel ------------------------------------------------------- */
  const jCat = JUDGE_CAT_WEIGHT[m.cat] || 1;
  const jTiming = Math.max(0, 1 + (f.timing - 1) * JUDGE_SHAPE.timing);
  const jComp = Math.pow(f.composure, JUDGE_SHAPE.composure);
  const jFresh = Math.pow(f.freshness, JUDGE_SHAPE.freshness);
  const jBlend = ctx.blend ? 1 + (f.blend - 1) * JUDGE_SHAPE.blend : 1;

  const judges = f.base * jTiming * f.matchup * jFresh * jComp * f.combo * f.pattern *
    jCat * jBlend * f.special * AURA_SCALE + bonus;

  return {
    raw: raw,
    crowd: crowd,
    judges: judges,
    factors: f,
    crowdParts: { cat: cCat, timing: cTiming, composure: cComp, freshness: cFresh, spectacle: cSpec, surprise: cSurp, blend: cBlend },
    judgeParts: { cat: jCat, timing: jTiming, composure: jComp, freshness: jFresh, blend: jBlend }
  };
}

/**
 * Fold the two audiences into the one number the act actually counts.
 * @param {'crowd'|'judges'|'both'} scoring
 */
export function actScore(scoring, crowd, judges) {
  if (scoring === 'judges') return judges;
  if (scoring === 'both') return (crowd + judges) / 2;
  return crowd;
}

/* -------------------------------------------------------------------------- */
/* FITS                                                                        */
/* -------------------------------------------------------------------------- */

/**
 * A fit is an opening statement, not a per-turn buff. A judge called the real
 * CDMX winner on his shoes before he moved, so the fit sets the meter before
 * round one and then shuts up.
 *
 * The frog suit is +10 with a crowd and -3 with a panel. In Act 3, where there
 * is no crowd at all, that is simply a bad idea, and it should be.
 *
 * @param {Object} fit `{ crowd, judges }`
 * @param {'crowd'|'judges'|'both'} scoring
 * @param {number} [weight=1] act emphasis; Act 4 turns this up
 * @returns {number} meter points, signed
 */
export function fitOffset(fit, scoring, weight) {
  if (!fit) return 0;
  const c = fit.crowd || 0;
  const j = fit.judges || 0;
  const w = typeof weight === 'number' ? weight : 1;
  const base = scoring === 'judges' ? j : scoring === 'both' ? (c + j) / 2 : c;
  return base * w;
}

/* -------------------------------------------------------------------------- */
/* VOICE — CONTRACT.md §12                                                     */
/* -------------------------------------------------------------------------- */

export const BIG_AURA = 6000;

/** Round to the nearest fifty. The culture calls round numbers, not readings. */
function round50(v) {
  return Math.max(0, Math.round(v / 50) * 50);
}

/**
 * The score popup for one exchange, in the culture's own register. Never an
 * invented unit.
 *
 *   PERDIÓ AURA   a whiff
 *   +10.000       the big one
 *   AURA 100%     a clean read
 *   +1000 AURA    the standard callout
 *
 * @param {number} score aura points
 * @param {string} band  timing band
 * @param {Object} [opts] `{ flawless: true }` for the end of a perfect battle
 */
export function callout(score, band, opts) {
  if (opts && opts.flawless) return 'AURA INFINITA';
  if (band === 'whiff') return 'PERDIÓ AURA';
  if (score >= BIG_AURA) return '+10.000';
  if (band === 'perfect') return 'AURA 100%';
  return '+' + round50(score) + ' AURA';
}

/** Aura totals in the result log: `1.450`, the way the callouts write them. */
export function formatAura(v) {
  const n = Math.max(0, Math.round(v));
  return n >= 1000 ? String(Math.floor(n / 1000)) + '.' + String(n % 1000).padStart(3, '0') : String(n);
}

/**
 * Human label for a factor that actually fired. Used to build the "why" list on
 * a turn result so the HUD never has to interpret a number.
 */
export function factorLabel(key, value, ctx) {
  switch (key) {
    case 'timing': return TIMING_LABEL[ctx && ctx.band] || 'TIMING';
    case 'matchup': return MATCHUP_LABEL[matchupOf(ctx && ctx.move && ctx.move.cat, ctx && ctx.oppCat)] || 'MATCHUP';
    case 'freshness': return value >= 0.999 ? 'FRESH' : 'REPEATED';
    case 'composure': return value >= 1.2 ? 'COMPOSED' : value >= 1 ? 'STEADY' : value >= 0.8 ? 'RAGGED' : 'OVERPLAYED';
    case 'combo': return 'COMBO ×' + Math.round((value - 1) / COMBO_STEP);
    case 'pattern': return (ctx && ctx.pattern && ctx.pattern.name) || 'PATTERN';
    case 'blend': return value >= 1 ? 'SPLIT' : 'STACKED';
    case 'special': return 'SPECIAL';
    default: return String(key).toUpperCase();
  }
}
