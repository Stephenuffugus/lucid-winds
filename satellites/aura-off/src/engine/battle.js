/**
 * AURA OFF — src/engine/battle.js
 *
 * `resolveExchange()` is the ONLY place a turn outcome is decided.
 * CONTRACT.md §0. The UI animates what it returns. The balance simulator calls
 * it directly. Neither re-implements the rules, so they cannot drift apart.
 *
 * PURE MODULE. No DOM, no globals, no localStorage, no imports from src/ui/.
 * It runs unchanged in Node and in a browser, and a headless simulator can push
 * thousands of battles a second through it without touching a document.
 *
 * ---------------------------------------------------------------------------
 * DATA IS INJECTED, NEVER IMPORTED
 * ---------------------------------------------------------------------------
 * This file imports nothing from `src/data/`. `createMatch()` takes the move
 * library, the act and the opponent as arguments. That keeps the engine
 * testable against synthetic content, keeps the simulator free to sweep
 * variants, and means a bad row in a data file can never break the engine's
 * ability to load.
 *
 * ---------------------------------------------------------------------------
 * THE SHAPE OF A TURN
 * ---------------------------------------------------------------------------
 *   createMatch()  → pre-rolls the opponent's move for round 1
 *   peek()         → what `read` earned you, if anything
 *   legalMoves()   → what the deck may play right now, and why not
 *   resolveExchange(match, action)
 *                  → scores both sides, applies every special and quirk,
 *                    moves the meter, advances the round, pre-rolls the next
 *                    opponent move, and returns a result rich enough that the
 *                    UI never computes anything.
 */

import {
  BEATS, counterCategory, matchupOf, matchupMult, freshnessMult,
  blendMult, blendMove, findPattern, scoreBoth, actScore,
  fitOffset, callout, formatAura, factorLabel,
  AMP_RANGE, TIMING, TIMING_LABEL, MATCHUP_LABEL
} from './scoring.js';

/* -------------------------------------------------------------------------- */
/* TUNING — every number the rest of the game reads out of the engine          */
/* -------------------------------------------------------------------------- */

export const TUNING = Object.freeze({
  /** CONTRACT.md §10 / Addendum A8: no standard exists, nine is our choice. */
  rounds: 9,

  blendCost: 100,
  hypeMax: 200,
  /**
   * A chain extends on any landed exchange, so `combo` is in effect a SECOND
   * timing multiplier: an expert who never misses held six links and carried
   * x1.44 while an act boss at 0.96 skill carried x1.14 — a bigger gap than the
   * timing band itself, stacked straight on top of it. Capping at three keeps a
   * clean run worth chasing (x1.42) without letting consistency get paid twice.
   */
  maxComboLinks: 3,

  /**
   * `finisher` is legal inside this many meter points of dead even.
   *
   * NOTE FOR THE DIRECTOR, not acted on here: a battle OPENS dead even, so this
   * rule as CONTRACT §6 writes it makes The Grimace — biggest base in the game,
   * biggest special — legal on round one, and the expert policy opens with it
   * in most battles. A move the roster calls "a final, decisive grimace that
   * ends the battle" arriving as the opening statement is a flavour break. It
   * was tried as `round >= 6 && meter close` and it reads better, but the
   * opponents who carry a finisher lose it too and the measured Upriver expert
   * rate went 77.5% -> 83.0%, away from target. Adding a second condition to a
   * §6 rule is a contract change, so it is left here as a question rather than
   * taken unilaterally.
   */
  finisherWindow: 15,

  /** Meter is a 0…100 tug of war. 50 is level. */
  meterStart: 50,
  meterMaxShift: 11,     // most one exchange can move it
  meterSoft: 900,        // aura differential that gets you most of the way there
  flawlessMeter: 92,

  guardMult: 0.5,
  debuffMult: 0.72,
  highRiskUp: 1.6,
  highRiskDown: 0.35,
  /**
   * CONTRACT §6 asks a finisher for "a large swing" and does not price it. At
   * 2.1x on top of the biggest base in the game (The Grimace, 78) plus a free
   * +4 on the meter, it was simply the best move on the board every round the
   * window was open, and a player who could hold the meter level could open
   * with it and never stop. 1.85 and +3 is still the largest single special in
   * the game and still ends battles; it no longer wins them on its own.
   */
  finisherMult: 1.85,
  finisherMeterPush: 3,
  counterCap: 0.85,
  counterSoft: 1400,
  persistCarry: 0.45,

  /* -- `hype` — Crowd Turn. THE ROOM IS YOURS ---------------------------- *
   *
   * The move where you stop performing AT the other person, turn your back on
   * them, and play to the gathering. CONTRACT §15: "the crowd is not set
   * dressing — the gathering IS the point." So turning to it has to buy
   * something the rest of the sheet cannot.
   *
   * It used to buy hype and nothing else, and passive hype already funded
   * every blend anyone wanted, so the value-maximising policy never picked it
   * once in 310,000 battles. The special was redundant, not the body weak.
   *
   * What it buys now is the ROOM, for one exchange:
   *   - your next move is read by a crowd that is already facing you
   *   - their next move is performed to the back of that crowd
   *
   * Both effects land on the CROWD component only. In a panel act — Act 3's
   * empty lot with no crowd at all, Act 5's judges on the water — Crowd Turn
   * does nothing but bank hype, and it should not: there is no room to turn.
   * Act 4 counts both, so it pays half. That makes it the one move on the
   * sheet whose worth is decided by which act you are standing in, which is a
   * role rather than a number.
   *
   * The price is x0.40 of a turn rather than x0.25 because the arithmetic has
   * to close: Crowd Turn's body is base 30, the weakest in FLOW, so at x0.25 it
   * gave up about 650 aura to buy back roughly 800 in a crowd act — a margin
   * too thin for anyone to ever choose it, which is how it ended up strictly
   * dominated in the first place. It still reads as giving a turn away, because
   * it is.
   */
  hypeSpecialScore: 0.40,
  hypeSpecialGain: 4,
  roomSelf: 1.55,
  roomThem: 0.72,

  /** `punisher` quirk: extra decay per prior use, on the player only. */
  punisherStep: 0.76,
  /** Act-level "repeats punished" (Act 2): applies to both sides. */
  actRepeatStep: 0.85,

  /**
   * Act 5. The deck is moving, so the amplitude you meant is not quite the
   * amplitude you got, and the needle runs faster. The jitter is applied to the
   * PLAYER only — the opponent's own amplitude noise already models a rower who
   * lives on that boat.
   *
   * ±0.26 costs a perfect exchange about 9% on average and up to 22% at the
   * edge of the swell. That is deliberately large: composure on unstable ground
   * is the actual job of the Togak Luan, so on the prow it has to be the thing
   * that decides the fight rather than a garnish. Aiming a shade UNDER ideal is
   * the counter-play, because the composure curve is more forgiving below.
   *
   * CORRECTED 2026-08-29: the note above used to end "the opponent's own
   * amplitude noise already models a rower who lives on that boat", and it did
   * not. At skill 1.50 `rollAmp` gave the rower a standard deviation of 0.039 —
   * a machine bolted to the deck — while the player alone fought the swell. So
   * the act whose entire thesis is "the only real skill is composure on
   * unstable ground" was the one act where only one side stood on it, and the
   * player policy built out of amplitude discipline was the one it punished
   * hardest. `foeAmpSigma` puts the opponent on the same moving deck, scaled
   * down by skill: the rower is better at standing on it, not exempt from it.
   *
   * `needleSpeedMult` went 1.45 -> 1.75 in the same pass. It is the one dial in
   * the game that reaches ONLY a player who is actually reading the needle, so
   * it separates a needle-perfect run from a random-timing one without touching
   * anything a mid-skill player relies on — and Act 5 is the act that has to be
   * able to beat an expert. At 1.75 the perfect window is 57% of its width on
   * still ground, which costs a modelled expert about 36 points of perfect rate
   * and is most of why Upriver finally reads 75% rather than 98%.
   */
  unstable: { ampJitter: 0.26, needleSpeedMult: 1.75, foeAmpSigma: 0.17 },

  /** Hype earned per exchange, before the `hype` special multiplies it. */
  /* -- HYPE, AND WHY IT GOT CHEAPER TO EARN AND SLOWER TO ACCRUE --------- *
   *
   * Passive hype used to run about 41 a turn, so a blend — the single largest
   * multiplier either side can reach — arrived free every two and a half
   * rounds whether you did anything to deserve it or not. That is what made
   * Crowd Turn pointless: the only thing its hype bought was already on the
   * house.
   *
   * At roughly 22 a turn a blend is an event you have to get to, and Crowd
   * Turn's x4 pays most of one in a single exchange. Turn the room, then blend
   * into it: that is a two-turn play with a real cost and a real shape, and it
   * is the reason the move exists.
   */
  hypeBase: 4,
  hypeByBand: { perfect: 8, clean: 5, shaky: 2, whiff: 0 },
  hypeFromScoreDiv: 160,
  hypeFromScoreCap: 10,

  /* -- WHAT AN OPPONENT KNOWS, BY SKILL ---------------------------------- *
   *
   * `skill` used to drive three things — timing, amplitude and how hard they
   * thought about the triangle. All three are STAT dials, and a player who has
   * mastered the needle out-multiplies all of them: against Togak Luan at
   * skill 1.50 an expert carried timing x1.14 but combo x1.18, blend x1.20 and
   * specials x1.22 on top, because those three were things only the player was
   * allowed to do. The campaign had no difficulty curve at the top because the
   * opponents were never playing the same game.
   *
   * So skill now also buys BEHAVIOUR. A 0.30 rival in the plaza throws one
   * move at a time and hopes. Somewhere around the Banned Town they start
   * using a special for its role instead of its number, then chasing a named
   * chain, and by the river they are splitting their body the same way you
   * are. Chispa is a kid having a go. Togak Luan does this for a living.
   */
  foeRoleFrom: 0.45,     // below this, a special is just a move
  foeRoleFull: 0.95,     // at this, they read roles as well as you do
  foePatternFrom: 0.74,  // they start chasing named chains here

  /**
   * DO NOT TELEGRAPH. A player who has learned the triangle counters whatever
   * you threw last, so a rival who keeps answering in the same corner is
   * feeding them 1.5x every other round — the expert policy was banking a x1.20
   * mean matchup while act bosses ate x0.97. Above `foeRoleFrom` an opponent
   * starts leaning off their own last category and towards the one that stays a
   * step ahead of the obvious read. Weighted, not absolute: they become hard to
   * read rather than mechanically counter-readable, which would just move the
   * exploit one step along.
   *
   * Skipped entirely for `mirror`, whose whole documented quirk is that they
   * DO answer your last category. That is the trade the quirk makes.
   */
  foeNoTelegraph: 0.55,
  foeStepAhead: 0.75,
  foeBlendFrom: 0.70,    // they start splitting upper from lower here
  foeBlendRate: 1.00,    // blend appetite per point of skill above that
  foeBlendMax: 0.60,

  /**
   * How decisively they play the value they see. The softmax temperature was a
   * flat-ish `90 / (0.5 + 1.5 * skill)`, which left even a 1.12 rival picking
   * close to randomly among moves 40 points apart — so they burned their own
   * small pool on repeats and handed the player a 1.15x freshness edge that had
   * nothing to do with skill. A better player is a more decisive one.
   */
  foePickTempBase: 60,
  foePickTempSkill: 1.9,
  foePickTempFloor: 0.35,

  /* -- EL FARMEO — the solo stage that comes before the duel -------------- *
   *
   * AURA-CULTURE §8.2 documents the format: competitors register in advance,
   * there are elimination rounds, and each competitor performs for only a few
   * seconds at a time. So the fight is two stages, not one — you farm alone to
   * get into the queue, then you battle.
   *
   * `farmeo` is the culture's own word doing its own job. AURA-CULTURE §1.1
   * separates *farmear aura* — cultivating charisma through repeated actions,
   * which is a thing you do ALONE — from *batalla de aura*, which is the
   * face-to-face. The two stages already had two names before we got here.
   *
   * Mechanically the point is that the solo turn has NO opponent category, so
   * `matchupOf` returns neutral and the triangle simply is not on the board.
   * What is left is timing and `composure`, which is the pair the culture
   * actually rewards and the pair a new player has nothing else to learn from
   * while a rival is throwing things at them.
   *
   * `skillFloor`/`skillGain` scale the bar by who you are queueing to face:
   * the same three moves that walk you past Chispa's Tuesday do not get you
   * onto the prow. At skill 0.30 the multiplier is 0.87; at 1.50 it is 1.41.
   *
   * `bands` is the cost of missing, and it is deliberately NOT elimination.
   * Nobody gets turned away from a public square, and a qualifier you can fail
   * into a menu is a qualifier that makes the player replay the menu. What the
   * farmeo buys is the meter you open the duel on, plus a few more or a few
   * fewer people watching. Read top-down, first match wins.
   *
   * The spread is 40…56, sixteen points, which is deliberately the same size as
   * the widest thing the fit system can already do (the frog suit at +10 crowd
   * against all-black at +6 panel, weighted 1.6 in the capital). A performance
   * should be worth about what an outfit is worth and no more — measured at
   * mid-campaign, one band step moves a duel by roughly ten points of win rate,
   * which is a nudge you can feel and can also play through.
   *
   * `at` is a fraction of the bar, so `in` starts at exactly 1.00: the label the
   * player reads and the bar they were shown can never disagree.
   */
  qualify: {
    skillFloor: 0.75,
    skillGain: 0.44,
    /* RETUNED 2026-08-29 after the first two-stage measurement. The bands were
       1.30/1.00/0.70/0 paying 56/50/45/40, and balance-sim showed the farmeo was
       a net gain for exactly one policy — the expert, who needed it least: it
       cleared the bar by 2.00x and took the top band 96% of the time, opening
       nearly every duel at 56, against 1.03x and 16% for a composed player.
       Upriver expert went 77.3% -> 84.4% off the head start alone.

       A band the strongest policy cannot fail is not a skill check, it is a
       bonus. So the top band now sits ABOVE where a needle-perfect player lands
       rather than below it, and the spread is 12 points instead of 16. The
       middle band widened downward so a composed farmeo reliably lands on 50
       instead of dipping under it — the player who holds the mark should not be
       punished for lacking the needle, which is the whole thesis of the game. */
    bands: [
      { key: 'straight', at: 1.95, meterStart: 54, crowd: 3 },
      { key: 'in', at: 0.92, meterStart: 50, crowd: 1 },
      { key: 'late', at: 0.62, meterStart: 46, crowd: 0 },
      { key: 'bottom', at: 0, meterStart: 42, crowd: -3 }
    ]
  }
});

export const ROUNDS = TUNING.rounds;
export const BLEND_COST = TUNING.blendCost;
export { AMP_RANGE };

/* -------------------------------------------------------------------------- */
/* SPECIALS AND QUIRKS — mechanical roles, not number tweaks                   */
/* -------------------------------------------------------------------------- */

export const SPECIALS = Object.freeze({
  interrupt: { key: 'interrupt', label: 'INTERRUPT', blurb: 'Cancels their combo chain this turn.' },
  guard: { key: 'guard', label: 'GUARD', blurb: 'Halves their score this turn.' },
  refresh: { key: 'refresh', label: 'REFRESH', blurb: 'Clears the decay on your most-worn move.' },
  feint: { key: 'feint', label: 'FEINT', blurb: 'Cheap. Your next move gets an extra combo link.' },
  highRisk: { key: 'highRisk', label: 'HIGH RISK', blurb: '×1.6 on clean or better, ×0.35 otherwise.' },
  debuff: { key: 'debuff', label: 'DEBUFF', blurb: 'Their next turn scores less.' },
  counter: { key: 'counter', label: 'COUNTER', blurb: 'Bonus scaled by how big their last move was.' },
  finisher: { key: 'finisher', label: 'FINISHER', blurb: 'Only with the meter close. Large swing.' },
  evade: { key: 'evade', label: 'EVADE', blurb: 'Negates their debuff and their counter this turn.' },
  hype: { key: 'hype', label: 'HYPE', blurb: 'Turn your back and work the room. Cheap turn, big hype, and the crowd faces you next — where there is a crowd.' },
  read: { key: 'read', label: 'READ', blurb: 'Reveals their next category before you commit.' },
  persist: { key: 'persist', label: 'PERSIST', blurb: 'Scores again, smaller, on the next turn.' }
});

export const QUIRKS = Object.freeze({
  mirror: { key: 'mirror', label: 'MIRROR', blurb: 'Always answers with the category that beats your last.' },
  patient: { key: 'patient', label: 'PATIENT', blurb: 'Sharpens when behind.' },
  frontrunner: { key: 'frontrunner', label: 'FRONTRUNNER', blurb: 'Runs away with it when ahead.' },
  punisher: { key: 'punisher', label: 'PUNISHER', blurb: 'Makes you pay for repeating yourself.' }
});

/* -------------------------------------------------------------------------- */
/* RANDOM                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * mulberry32. Deterministic, seedable, fast — the simulator needs reproducible
 * battles and the UI needs one that does not allocate.
 * @param {number} seed
 * @returns {() => number} uniform in [0, 1)
 */
export function createRng(seed) {
  let a = (seed >>> 0) || 0x9e3779b9;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function strSeed(s) {
  let h = 2166136261 >>> 0;
  const str = String(s);
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619) >>> 0;
  return h >>> 0;
}

/** Roughly normal, cheap. Sum of three uniforms, rescaled to unit variance. */
function gauss(rng) {
  return (rng() + rng() + rng() - 1.5) * 2;
}

function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

/* -------------------------------------------------------------------------- */
/* MOVE INDEX (memoised — the sim rebuilds a match thousands of times a second) */
/* -------------------------------------------------------------------------- */

const _indexCache = typeof WeakMap === 'function' ? new WeakMap() : null;

function moveIndex(moves) {
  if (_indexCache && _indexCache.has(moves)) return _indexCache.get(moves);
  const byId = new Map();
  for (let i = 0; i < moves.length; i++) {
    const m = moves[i];
    if (m && m.id) byId.set(m.id, m);
  }
  const idx = { list: moves, byId: byId, pools: new Map() };
  if (_indexCache) _indexCache.set(moves, idx);
  return idx;
}

/* -------------------------------------------------------------------------- */
/* NOBODY — the absent opponent                                                */
/* -------------------------------------------------------------------------- */

/**
 * The other half of an exchange when there is no other half.
 *
 * EL FARMEO needs a turn to resolve with nobody standing opposite, and there is
 * exactly one place a turn outcome is decided (CONTRACT §0). So rather than a
 * second scoring path, the empty space gets a shape: a move with `base: 0` and
 * `cat: null`. Every existing rule then produces the right answer on its own
 * and none of them had to be taught about solitude —
 *
 *   `scoreBoth` multiplies the whole product by base, so nobody scores nothing.
 *   `matchupOf(cat, null)` already returns 'neutral', so the triangle is off
 *   the board rather than being suppressed by a flag. That is the design: with
 *   no category to answer, the qualifier is pure composure and freshness.
 *   `special: null` means every cross-effect in step 4 skips itself.
 *
 * It is deliberately NOT in the move index, so `getMove` cannot return it, no
 * deck can hold it, and `patternFor` never resolves a chain through it.
 */
const NOBODY = Object.freeze({
  id: '__nobody', name: 'Nobody', cat: null, tier: 'V3',
  base: 0, up: 1, lo: 0, idealAmp: 1, dur: 0, hint: '', frames: null
});

/** The pre-rolled "action" of an absent opponent. `planFor` recognises it. */
const NO_ACTION = Object.freeze({ absent: true });

/* -------------------------------------------------------------------------- */
/* OPPONENT MOVE POOL                                                          */
/* -------------------------------------------------------------------------- */

/**
 * An opponent's pool. `ROSTER-TARGET.md` states pool as a COUNT ("3 moves"),
 * so when it is a number the engine derives a deterministic set: their own drop
 * first, then moves whose base score fits their skill tier, with every category
 * represented once there is room for it. Explicit arrays are honoured as-is, so
 * `src/data/campaign.js` can hand-author a pool whenever it wants to.
 *
 * @returns {string[]} move ids
 */
function buildPool(idx, opponent) {
  const explicit = Array.isArray(opponent.pool) ? opponent.pool
    : Array.isArray(opponent.moves) ? opponent.moves : null;
  if (explicit) {
    const kept = explicit.filter(function (id) { return idx.byId.has(id); });
    if (kept.length) return kept;
  }

  const key = (opponent.id || opponent.name || 'foe') + '|' + (opponent.pool | 0) + '|' + (opponent.drop || '');
  if (idx.pools.has(key)) return idx.pools.get(key);

  const n = Math.max(1, Math.min(idx.list.length, (opponent.pool | 0) || 3));
  const rng = createRng(strSeed(key));
  const skill = typeof opponent.skill === 'number' ? opponent.skill : 0.5;
  const target = 34 + 30 * clamp(skill / 1.5, 0, 1);

  const ranked = idx.list.map(function (m) {
    return { m: m, s: -Math.abs(m.base - target) / 10 + rng() * 2.2 };
  }).sort(function (a, b) { return b.s - a.s; });

  const picked = [];
  const taken = Object.create(null);
  if (opponent.drop && idx.byId.has(opponent.drop)) {
    picked.push(opponent.drop);
    taken[opponent.drop] = 1;
  }
  for (let i = 0; i < ranked.length && picked.length < n; i++) {
    const id = ranked[i].m.id;
    if (!taken[id]) { picked.push(id); taken[id] = 1; }
  }

  // Category coverage: a mirror opponent with one category has nothing to
  // mirror with, and a one-note pool makes the triangle invisible.
  if (n >= 3) {
    const cats = ['FLEX', 'FLOW', 'BAIT'];
    for (let c = 0; c < cats.length; c++) {
      const want = cats[c];
      const have = picked.filter(function (id) { return idx.byId.get(id).cat === want; }).length;
      if (have > 0) continue;
      // find a duplicated category to sacrifice, never the drop (index 0)
      let victim = -1;
      for (let i = picked.length - 1; i > 0; i--) {
        const cat = idx.byId.get(picked[i]).cat;
        const count = picked.filter(function (id) { return idx.byId.get(id).cat === cat; }).length;
        if (count > 1) { victim = i; break; }
      }
      if (victim < 0) continue;
      for (let i = 0; i < ranked.length; i++) {
        const cand = ranked[i].m;
        if (cand.cat === want && !taken[cand.id]) {
          taken[picked[victim]] = 0;
          picked[victim] = cand.id;
          taken[cand.id] = 1;
          break;
        }
      }
    }
  }

  idx.pools.set(key, picked);
  return picked;
}

/**
 * The best genuine upper/lower split available inside an opponent's own pool.
 * Memoised on the pool array, because `prepareTurn` asks once per round and the
 * simulator runs three thousand battles a second.
 *
 * @returns {{a:string, b:string, split:number}|null}
 */
const _foeBlendCache = typeof WeakMap === 'function' ? new WeakMap() : null;

function foeBlendPair(match) {
  const pool = match.foe.pool;
  if (_foeBlendCache && _foeBlendCache.has(pool)) return _foeBlendCache.get(pool);
  let best = null, bestV = 0;
  for (let i = 0; i < pool.length; i++) {
    const a = getMove(match, pool[i]);
    if (!a) continue;
    for (let j = 0; j < pool.length; j++) {
      if (i === j) continue;
      const b = getMove(match, pool[j]);
      if (!b) continue;
      const split = a.up * b.lo;
      if (split < 0.5) continue;              // a stack is not worth 100 hype
      const v = blendMult(a, b) * (a.base + b.base) / 2;
      if (v > bestV) { bestV = v; best = { a: a.id, b: b.id, split: split }; }
    }
  }
  if (_foeBlendCache) _foeBlendCache.set(pool, best);
  return best;
}

/* -------------------------------------------------------------------------- */
/* MATCH STATE                                                                 */
/* -------------------------------------------------------------------------- */

function newSide(label) {
  return {
    side: label,
    aura: 0,
    crowdAura: 0,
    judgeAura: 0,
    hype: 0,
    uses: Object.create(null),
    chain: [],          // ids of the last (up to) two moves, for pattern windows
    links: 0,           // persistent combo counter
    bonusLinks: 0,      // one-shot, from `feint`
    lastMoveId: null,
    lastCat: null,
    lastScore: 0,
    debuffIn: 1,        // multiplier owed to us this turn, set by them last turn
    persistIn: 0,       // aura carried in from our own `persist` last turn
    roomWithIn: 1,      // crowd multiplier owed to us — we turned the room last turn
    roomAwayIn: 1,      // crowd multiplier owed to us — THEY turned it, we play to backs
    everWhiffed: false,
    pool: null          // opponent side only
  };
}

/**
 * Start a battle.
 *
 * @param {Object}   cfg
 * @param {Array}    cfg.moves        the whole move library (src/data/moves.js)
 * @param {Object}   cfg.opponent     `{ id?, name, skill, quirk, pool, drop, boss? }`
 * @param {Object}   [cfg.act]        `{ id, name?, scoring, unstable?, repeatsPunished?, fitWeight? }`
 * @param {string[]} [cfg.deck]       the player's move ids; defaults to every move
 * @param {Object}   [cfg.fit]        `{ id, name, crowd, judges }`
 * @param {number}   [cfg.rounds=9]
 * @param {number}   [cfg.seed]       for a reproducible battle
 * @param {Function} [cfg.rng]        supply your own generator instead of a seed
 * @param {boolean}  [cfg.verbose=true] build the `multipliers` list and log line
 * @param {boolean}  [cfg.suddenEnd=false] end early if the meter pins at 0 or 100
 * @param {number}   [cfg.meterStart] override the opening meter (reputation head start)
 * @param {boolean}  [cfg.solo=false] EL FARMEO — nobody stands opposite
 * @param {number}   [cfg.target]     solo only: the aura bar to clear
 * @returns {Object} the match
 */
export function createMatch(cfg) {
  if (!cfg || !Array.isArray(cfg.moves) || !cfg.moves.length) {
    throw new Error('createMatch: cfg.moves must be a non-empty move array');
  }
  if (!cfg.opponent) throw new Error('createMatch: cfg.opponent is required');

  const idx = moveIndex(cfg.moves);
  const act = cfg.act || { id: 'plaza', name: 'The Plaza', scoring: 'crowd' };
  const opponent = cfg.opponent;

  const deck = (Array.isArray(cfg.deck) && cfg.deck.length
    ? cfg.deck.filter(function (id) { return idx.byId.has(id); })
    : cfg.moves.map(function (m) { return m.id; }));
  if (!deck.length) throw new Error('createMatch: cfg.deck resolved to no known moves');

  const scoring = act.scoring === 'judges' || act.scoring === 'both' ? act.scoring : 'crowd';
  const fitWeight = typeof act.fitWeight === 'number' ? act.fitWeight : (act.id === 'capital' ? 1.6 : 1);
  const fitMeter = fitOffset(cfg.fit, scoring, fitWeight);

  /*
   * EL FARMEO. The fit is an opening statement and CONTRACT §5 is explicit that
   * it sets the meter before round one and then shuts up — so it does not move
   * a solo bar. The solo meter is not a tug of war either; it is progress
   * towards `target`, which is the only reading of that bar that is true when
   * there is nobody on the other end of it.
   */
  const solo = !!cfg.solo;
  const target = solo
    ? Math.max(1, typeof cfg.target === 'number' && isFinite(cfg.target) ? cfg.target : 1000)
    : 0;

  const match = {
    idx: idx,
    moves: cfg.moves,
    deck: deck,
    act: act,
    opponent: opponent,
    fit: cfg.fit || null,
    fitMeter: fitMeter,
    scoring: scoring,
    solo: solo,
    target: target,
    passed: false,
    unstable: !!act.unstable,
    repeatsPunished: !!act.repeatsPunished,
    rounds: cfg.rounds > 0 ? cfg.rounds : TUNING.rounds,
    round: 1,
    meter: solo ? 0
      : clamp((typeof cfg.meterStart === 'number' ? cfg.meterStart : TUNING.meterStart) + fitMeter, 2, 98),
    you: newSide('you'),
    foe: newSide('them'),
    rng: typeof cfg.rng === 'function' ? cfg.rng
      : createRng(typeof cfg.seed === 'number' ? cfg.seed : (Math.random() * 0xffffffff) >>> 0),
    verbose: cfg.verbose !== false,
    suddenEnd: !!cfg.suddenEnd,
    pending: null,      // the opponent's pre-rolled action for the current round
    reveal: null,       // `read` payload the player may see right now
    pendingRead: false,
    log: [],
    over: false,
    winner: null,
    flawless: false,
    _bestBlend: undefined
  };

  match.foe.pool = solo ? [] : buildPool(idx, opponent);
  prepareTurn(match);
  return match;
}

/** Look a move up by id. */
export function getMove(match, id) {
  return match.idx.byId.get(id) || null;
}

/* -------------------------------------------------------------------------- */
/* LEGALITY AND PREVIEW — so the UI never decides a rule                       */
/* -------------------------------------------------------------------------- */

function meterCloseFor(match, side) {
  // The window is symmetric, so it does not matter whose turn it is; the
  // argument is kept because a future asymmetric rule would need it.
  //
  // In EL FARMEO the meter is progress towards a bar, not a tug of war, so
  // there is no such thing as being close on it. That closes the finisher for
  // the whole solo stage, which is also the right answer in flavour: The
  // Grimace is documented as the thing that ENDS a battle, and a battle that
  // has not started cannot be ended.
  if (match.solo) return false;
  return Math.abs(match.meter - TUNING.meterStart) <= TUNING.finisherWindow;
}

function isLegal(match, side, move) {
  if (!move) return { legal: false, reason: 'unknown move' };
  if (move.special === 'finisher' && !meterCloseFor(match, side)) {
    return {
      legal: false,
      reason: match.solo ? 'No battle to end yet' : 'Only with the meter close'
    };
  }
  return { legal: true, reason: null };
}

/**
 * Everything the deck grid needs, decided here rather than in `src/ui/`.
 * @returns {Array<Object>} one entry per deck move
 */
export function legalMoves(match) {
  const out = [];
  for (let i = 0; i < match.deck.length; i++) out.push(previewMove(match, match.deck[i]));
  return out;
}

/**
 * A single move's outlook this turn: is it legal, how worn is it, what would it
 * complete. No score is computed — a preview that predicted the score would be
 * a second scorer, and there is only ever one.
 *
 * @returns {{id, name, cat, tier, special, legal, reason, uses, freshness,
 *            idealAmp, dur, hint, matchup, wouldPattern}}
 */
export function previewMove(match, id) {
  const m = getMove(match, id);
  if (!m) return { id: id, name: id, cat: null, legal: false, reason: 'unknown move' };
  const l = isLegal(match, 'you', m);
  const uses = match.you.uses[id] || 0;
  const knownCat = match.reveal ? match.reveal.category : null;

  let wouldPattern = null;
  const chain = match.you.chain.concat([id]);
  if (chain.length >= 3) {
    const three = chain.slice(-3).map(function (cid) { return getMove(match, cid); });
    if (three[0] && three[1] && three[2]) wouldPattern = findPattern(three);
  }

  return {
    id: m.id,
    name: m.name,
    cat: m.cat,
    tier: m.tier,
    special: m.special || null,
    specialInfo: m.special ? SPECIALS[m.special] || null : null,
    legal: l.legal,
    reason: l.reason,
    uses: uses,
    freshness: freshnessMult(uses),
    idealAmp: m.idealAmp,
    dur: m.dur,
    hint: m.hint,
    up: m.up,
    lo: m.lo,
    matchup: knownCat ? matchupOf(m.cat, knownCat) : null,
    wouldPattern: wouldPattern ? { id: wouldPattern.id, name: wouldPattern.name, mult: wouldPattern.mult } : null
  };
}

/** Can the player afford a blend right now? */
export function canBlend(match) {
  return match.you.hype >= TUNING.blendCost;
}

/**
 * What `read` bought you: the opponent's category for the exchange you are
 * about to commit to. Null the rest of the time.
 * @returns {{category: string}|null}
 */
export function peek(match) {
  return match.reveal;
}

/* -------------------------------------------------------------------------- */
/* THE OPPONENT                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Effective skill after the quirk. `patient` sharpens from behind, `frontrunner`
 * sharpens from in front; both read the meter, which is the only measure of
 * "ahead" the game has.
 */
export function effectiveSkill(match) {
  const base = typeof match.opponent.skill === 'number' ? match.opponent.skill : 0.5;
  const q = match.opponent.quirk;
  const lead = match.meter - TUNING.meterStart;   // positive = the player is ahead
  if (q === 'patient' && lead > 0) return base * (1 + 0.45 * Math.min(1, lead / 50));
  if (q === 'frontrunner' && lead < 0) return base * (1 + 0.45 * Math.min(1, -lead / 50));
  return base;
}

/**
 * Timing band for a given effective skill. Weighted, then normalised.
 *
 * The `perfect` weight is superlinear so that the first opponents in the Plaza
 * really are beginners — a 0.30-skill rival lands a perfect roughly one turn in
 * seven and whiffs nearly one in three, while a 1.50-skill rower on the boat is
 * almost never off. That spread is the difficulty curve; `skill` is the only
 * dial that sets it.
 */
function rollBand(rng, s) {
  /*
   * The four weights below 0.70 skill are exactly as they were — a 0.30 rival
   * in the plaza still lands a perfect about one turn in seven and whiffs
   * nearly one in three, because that is a kid having a go and the early acts
   * are calibrated on it.
   *
   * Above 0.55 an extra term steepens all three. This file already claimed "a
   * 1.50-skill rower on the boat is almost never off" and the curve did not
   * deliver it: at 1.50 the old weights gave 58% perfect and a 1.5% whiff rate,
   * which is not a professional, and at 1.04 an act boss whiffed 8.5% of nine
   * rounds. Those slips were most of what a needle-perfect player was actually
   * beating in Acts 3 and 4.
   */
  const hi = Math.max(0, s - 0.55);
  const wP = 0.02 + 1.55 * Math.pow(Math.max(0, s), 1.35) + 1.30 * Math.pow(hi, 1.7);
  const wC = 0.30 + 0.85 * s;
  const wS = Math.max(0.04, 0.85 - 0.36 * s - 0.60 * Math.pow(hi, 1.5));
  const wW = Math.max(0.01, 0.85 - 0.52 * s - 0.80 * Math.pow(hi, 1.5));
  let r = rng() * (wP + wC + wS + wW);
  if ((r -= wP) < 0) return 'perfect';
  if ((r -= wC) < 0) return 'clean';
  if ((r -= wS) < 0) return 'shaky';
  return 'whiff';
}

/**
 * Amplitude accuracy for a given effective skill: sloppy early, surgical late —
 * and on the water, everybody wobbles. See TUNING.unstable.
 */
function rollAmp(rng, move, s, unstable) {
  let sigma = 0.30 * Math.max(0.10, 1 - 0.58 * s);
  if (unstable) sigma += TUNING.unstable.foeAmpSigma * clamp(1 - 0.42 * s, 0.22, 1);
  return clamp(move.idealAmp + gauss(rng) * sigma, AMP_RANGE.min, AMP_RANGE.max);
}

/**
 * What one special is worth to an opponent who understands roles, in the board
 * state they are actually standing in. Deliberately the same shape of judgement
 * the expert policy makes at the bottom of this file — a `guard` is worth
 * having when the last thing that landed was enormous, and worth nothing when
 * it was not. Scaled down to nothing for a low-skill rival by the caller.
 *
 * @param {number} lead  meter distance; positive means the OPPONENT is behind
 */
function foeRoleValue(match, special, lead) {
  const foe = match.foe;
  const you = match.you;
  switch (special) {
    case 'finisher': return meterCloseFor(match, 'them') ? 1.80 : 0.20;
    case 'interrupt': return 1 + 0.60 * Math.min(1, you.links / 3);
    case 'guard': return 1 + 0.70 * Math.min(1, you.lastScore / 1400);
    case 'counter': return 1 + 0.75 * Math.min(1, you.lastScore / 1400);
    case 'refresh': {
      let worn = 0;
      for (const id in foe.uses) if (foe.uses[id] > worn) worn = foe.uses[id];
      return worn >= 2 ? 1.65 : 0.80;
    }
    case 'evade': return foe.debuffIn < 1 ? 1.70 : 0.85;
    case 'feint': return foe.links >= 1 ? 1.45 : 1.15;
    case 'persist': return 1.25;
    case 'highRisk': return 0.70 + 0.90 * Math.min(1, match.opponent.skill || 0);
    case 'debuff': return lead > 10 ? 1.25 : 1.12;
    case 'read': return 1.0;   // they already know what they are throwing
    case 'hype': {
      // the same reading the player should make: is there a room to turn?
      const room = match.scoring === 'judges' ? 0 : match.scoring === 'both' ? 0.5 : 1;
      if (match.round >= match.rounds) return 0.15;
      return 0.45 + 1.70 * room + (foe.hype < TUNING.blendCost ? 0.45 : 0.10);
    }
    default: return 1;
  }
}

/**
 * Choose the opponent's move. Difficulty is one number — `skill` — and it drives
 * four separate things: how often they hit their timing, how close they hold
 * their amplitude, how hard they think about the triangle, and how much of the
 * rest of the sheet they can use at all (`foeRoleValue`, patterns, blends).
 */
function chooseFoeMove(match) {
  const rng = match.rng;
  const s = effectiveSkill(match);
  const pool = match.foe.pool;
  const yourLastCat = match.you.lastCat;

  let cands = pool.filter(function (id) {
    const m = getMove(match, id);
    return m && isLegal(match, 'them', m).legal;
  });
  if (!cands.length) cands = pool.slice();

  if (match.opponent.quirk === 'mirror' && yourLastCat) {
    const want = counterCategory(yourLastCat);
    const filtered = cands.filter(function (id) { return getMove(match, id).cat === want; });
    if (filtered.length) cands = filtered;
  }

  const lead = match.meter - TUNING.meterStart;   // positive = the opponent is behind
  const foe = match.foe;

  /*
   * How much of the game they can actually see. Zero in the plaza, total by the
   * river. This is the difference between a rival who throws their biggest move
   * and one who throws the RIGHT move, and it is what makes the campaign get
   * harder rather than just louder.
   */
  const role = clamp((s - TUNING.foeRoleFrom) / (TUNING.foeRoleFull - TUNING.foeRoleFrom), 0, 1);

  const vals = new Array(cands.length);
  let best = -Infinity, bestI = 0;
  for (let i = 0; i < cands.length; i++) {
    const m = getMove(match, cands[i]);
    let v = m.base * freshnessMult(foe.uses[m.id] || 0);
    if (yourLastCat) {
      v *= 1 + (matchupMult(m.cat, yourLastCat) - 1) * Math.min(1, s);
    }

    // do not telegraph: lean off your own last corner, lean into the next one
    if (role > 0 && foe.lastCat && match.opponent.quirk !== 'mirror') {
      if (m.cat === foe.lastCat) v *= 1 - TUNING.foeNoTelegraph * role;
      else if (m.cat === BEATS[foe.lastCat]) v *= 1 + TUNING.foeStepAhead * role;
    }

    // a role is worth something, scaled by whether they understand it
    if (role > 0 && m.special) {
      v *= 1 + (foeRoleValue(match, m.special, lead) - 1) * role;
    }

    // chasing a named chain — the same 1.5x the player is chasing
    if (s >= TUNING.foePatternFrom && foe.chain.length >= 2) {
      const chain = foe.chain.concat([m.id]).slice(-3);
      const three = [getMove(match, chain[0]), getMove(match, chain[1]), getMove(match, chain[2])];
      if (three[0] && three[1] && three[2] && findPattern(three)) v *= 1 + 0.45 * role;
    }

    vals[i] = v;
    if (v > best) { best = v; bestI = i; }
  }

  const pRandom = clamp(0.55 - 0.42 * s, 0.03, 0.55);
  if (rng() < pRandom) return cands[(rng() * cands.length) | 0];

  const T = TUNING.foePickTempBase / (TUNING.foePickTempFloor + TUNING.foePickTempSkill * s);
  let total = 0;
  for (let i = 0; i < vals.length; i++) { vals[i] = Math.exp((vals[i] - best) / T); total += vals[i]; }
  let r = rng() * total;
  for (let i = 0; i < vals.length; i++) { if ((r -= vals[i]) < 0) return cands[i]; }
  return cands[bestI];
}

/**
 * Pre-roll the opponent's action for the round about to be played, so `read`
 * has something true to reveal and the player's choice is a real read rather
 * than a coin flip resolved after the fact.
 */
function prepareTurn(match) {
  // EL FARMEO: nobody is pre-rolled because nobody is there. `read` has nothing
  // to reveal, which the special is told about in step 8 rather than silently.
  if (match.solo) {
    match.pending = NO_ACTION;
    match.reveal = null;
    match.pendingRead = false;
    return;
  }

  const s = effectiveSkill(match);

  /*
   * Will they split their body this round? Only from `foeBlendFrom` up, only
   * with the hype banked to pay for it — the same 100 the player pays — and
   * only on a pairing inside their own pool that is a real split rather than a
   * stack. On the prow that is most rounds they can afford. In the plaza it
   * never happens, because nobody in the plaza has thought of it yet.
   */
  let blend = null;
  if (s >= TUNING.foeBlendFrom && match.foe.hype >= TUNING.blendCost) {
    const appetite = Math.min(TUNING.foeBlendMax, (s - TUNING.foeBlendFrom) * TUNING.foeBlendRate);
    if (appetite > 0 && match.rng() < appetite) blend = foeBlendPair(match);
  }

  const id = blend ? blend.a : chooseFoeMove(match);
  const move = blend ? blendMove(getMove(match, blend.a), getMove(match, blend.b)) : getMove(match, id);

  match.pending = {
    moveId: id,
    blend: blend ? { a: blend.a, b: blend.b } : null,
    band: rollBand(match.rng, s),
    amp: rollAmp(match.rng, move, s, match.unstable)
  };
  match.reveal = match.pendingRead ? { category: move.cat } : null;
  match.pendingRead = false;
}

/* -------------------------------------------------------------------------- */
/* ACTION NORMALISATION                                                        */
/* -------------------------------------------------------------------------- */

function usesFor(side, plan) {
  if (plan.blend) {
    return Math.max(side.uses[plan.blend.a.id] || 0, side.uses[plan.blend.b.id] || 0);
  }
  return side.uses[plan.move.id] || 0;
}

/**
 * Turn whatever the caller handed us into a well-formed plan. Deliberately
 * forgiving: a UI bug should degrade into a played turn, never a thrown error
 * mid-battle.
 */
function planFor(match, side, raw, isPlayer) {
  const a = raw || {};

  // Nobody is standing there. `NOBODY` scores zero through the ordinary
  // scorer and carries no special, so every rule below and every cross-effect
  // in step 4 correctly does nothing without being told about the solo stage.
  if (a.absent) return blankPlan(match, side);

  let move = null;
  let blend = null;
  let hypeSpent = 0;
  let blendRefused = null;

  if (a.blend && a.blend.a && a.blend.b) {
    const ma = getMove(match, a.blend.a);
    const mb = getMove(match, a.blend.b);
    if (!ma || !mb) {
      blendRefused = 'unknown move';
    } else if (side.hype < TUNING.blendCost) {
      // both sides pay the same hundred. An opponent who blends for free is a
      // different game to the one the player is being asked to learn.
      blendRefused = 'not enough hype';
    } else {
      blend = { a: ma, b: mb };
      move = blendMove(ma, mb);
      hypeSpent = TUNING.blendCost;
    }
  }

  if (!move) {
    move = getMove(match, a.moveId) ||
      (blendRefused && a.blend ? getMove(match, a.blend.a) : null) ||
      getMove(match, match.deck[0]);
  }

  const band = TIMING[a.band] != null ? a.band : 'clean';
  const requested = clamp(
    typeof a.amp === 'number' && isFinite(a.amp) ? a.amp : move.idealAmp,
    AMP_RANGE.min, AMP_RANGE.max
  );

  let jitter = 0;
  if (isPlayer && match.unstable) {
    jitter = (match.rng() * 2 - 1) * TUNING.unstable.ampJitter;
  }
  const amp = clamp(requested + jitter, AMP_RANGE.min, AMP_RANGE.max);

  const legality = isLegal(match, side.side, move);

  return {
    side: side,
    move: move,
    blend: blend,
    blendRefused: blendRefused,
    band: band,
    amp: amp,
    ampRequested: requested,
    ampJitter: Math.round(jitter * 1000) / 1000,
    hypeSpent: hypeSpent,
    special: blend ? null : (move.special || null),
    legal: legality.legal,
    illegalReason: legality.reason,
    uses: 0, links: 0, pattern: null, chain: null,
    extra: 1, freshExtra: 1, hypeMult: 1,
    interrupted: false, guarded: false, finisherFired: false,
    specialFired: false, specialDetail: null,
    roomWith: false, roomAway: false, roomTurned: false,
    carry: 0
  };
}

/**
 * The plan of an absent opponent. Identical in shape to a real one so that not
 * one line of `resolveExchange` has to ask whether anybody is there.
 */
function blankPlan(match, side) {
  return {
    side: side,
    move: NOBODY,
    blend: null,
    blendRefused: null,
    band: 'clean',
    amp: NOBODY.idealAmp,
    ampRequested: NOBODY.idealAmp,
    ampJitter: 0,
    hypeSpent: 0,
    special: null,
    legal: true,
    illegalReason: null,
    uses: 0, links: 0, pattern: null, chain: null,
    extra: 1, freshExtra: 1, hypeMult: 1,
    interrupted: false, guarded: false, finisherFired: false,
    specialFired: false, specialDetail: null,
    roomWith: false, roomAway: false, roomTurned: false,
    carry: 0,
    absent: true
  };
}

/* -------------------------------------------------------------------------- */
/* THE ONE PLACE A TURN OUTCOME IS DECIDED                                     */
/* -------------------------------------------------------------------------- */

/**
 * Resolve one exchange.
 *
 * @param {Object} match   from `createMatch`
 * @param {Object} action  the player's committed input:
 *        `{ moveId, amp, band, blend?: { a, b }, offset? }`
 *        `band` is one of 'perfect' | 'clean' | 'shaky' | 'whiff' and comes from
 *        `src/ui/timing.js`; `amp` is the achieved amplitude in AMP_RANGE.
 * @returns {Object} a TurnResult — see the module header of the report, and the
 *        `you` / `them` sub-objects below. It carries everything the UI needs;
 *        nothing about a turn should ever be recomputed downstream.
 */
export function resolveExchange(match, action) {
  if (match.over) throw new Error('resolveExchange: the match is already over');
  if (!match.pending) prepareTurn(match);

  const you = match.you;
  const foe = match.foe;
  const roundNo = match.round;
  const revealShown = match.reveal;
  const meterBefore = match.meter;

  /* -- 1. plans --------------------------------------------------------- */
  const P = planFor(match, you, action, true);
  const F = planFor(match, foe, match.pending, false);

  if (P.hypeSpent) you.hype = Math.max(0, you.hype - P.hypeSpent);
  if (F.hypeSpent) foe.hype = Math.max(0, foe.hype - F.hypeSpent);

  P.uses = usesFor(you, P);
  F.uses = usesFor(foe, F);

  /* -- 2. combo links (feint's bonus is one-shot) ------------------------ */
  P.links = you.links + you.bonusLinks;
  F.links = foe.links + foe.bonusLinks;
  you.bonusLinks = 0;
  foe.bonusLinks = 0;

  /* -- 3. pattern windows ------------------------------------------------ */
  P.chain = you.chain.concat([P.blend ? P.blend.a.id : P.move.id]);
  F.chain = foe.chain.concat([F.blend ? F.blend.a.id : F.move.id]);
  P.pattern = patternFor(match, P.chain);
  F.pattern = patternFor(match, F.chain);

  /* -- 4. cross-effects, in a fixed order -------------------------------- */
  const pEvade = P.special === 'evade';
  const fEvade = F.special === 'evade';
  if (pEvade) { P.specialFired = true; P.specialDetail = 'nothing lands'; }
  if (fEvade) { F.specialFired = true; F.specialDetail = 'nothing lands'; }

  // interrupt — cancels the other side's chain this turn
  if (P.special === 'interrupt') {
    F.links = 0; F.interrupted = true;
    P.specialFired = true; P.specialDetail = 'their chain is cut';
  }
  if (F.special === 'interrupt') {
    P.links = 0; P.interrupted = true;
    F.specialFired = true; F.specialDetail = 'your chain is cut';
  }

  // counter — scaled by how big their last move was, unless they slipped it
  if (P.special === 'counter') {
    if (fEvade) { P.specialDetail = 'they slipped it'; }
    else {
      const b = 1 + Math.min(TUNING.counterCap, (foe.lastScore || 0) / TUNING.counterSoft);
      P.extra *= b;
      P.specialFired = true;
      P.specialDetail = 'off their last, ×' + (Math.round(b * 100) / 100);
    }
  }
  if (F.special === 'counter') {
    if (pEvade) { F.specialDetail = 'you slipped it'; }
    else {
      const b = 1 + Math.min(TUNING.counterCap, (you.lastScore || 0) / TUNING.counterSoft);
      F.extra *= b;
      F.specialFired = true;
      F.specialDetail = 'off your last, ×' + (Math.round(b * 100) / 100);
    }
  }

  // highRisk — total commitment, paid either way
  applyHighRisk(P);
  applyHighRisk(F);

  // finisher — only with the meter close
  applyFinisher(match, P);
  applyFinisher(match, F);

  // hype special — you stop performing at them and play to the gathering.
  // This is only the price; the room it buys is handed over in step 8, with the
  // other effects that land on the FOLLOWING turn. Setting it here would apply
  // it to the Crowd Turn itself and clear it before the payoff ever arrived.
  applyHype(match, P);
  applyHype(match, F);

  // debuff owed from last turn — evade wipes it
  if (you.debuffIn !== 1) {
    if (pEvade) P.specialDetail = 'shrugged off the rope';
    else P.extra *= you.debuffIn;
    P.debuffed = !pEvade;
  }
  if (foe.debuffIn !== 1) {
    if (fEvade) F.specialDetail = 'shrugged off the rope';
    else F.extra *= foe.debuffIn;
    F.debuffed = !fEvade;
  }
  you.debuffIn = 1;
  foe.debuffIn = 1;

  // punisher quirk — the opponent's trait, applied to the PLAYER's repeats
  if (match.opponent.quirk === 'punisher' && P.uses > 0) {
    P.freshExtra *= Math.pow(TUNING.punisherStep, P.uses);
    P.punished = true;
  }
  // act rule — the room punishes repeats, both sides
  if (match.repeatsPunished) {
    if (P.uses > 0) { P.freshExtra *= Math.pow(TUNING.actRepeatStep, P.uses); P.punished = true; }
    if (F.uses > 0) F.freshExtra *= Math.pow(TUNING.actRepeatStep, F.uses);
  }

  /* -- 5. score both sides ---------------------------------------------- */
  const pCtx = ctxFor(P, F.move.cat, you.lastCat);
  const fCtx = ctxFor(F, P.move.cat, foe.lastCat);
  const pOut = scoreBoth(pCtx);
  const fOut = scoreBoth(fCtx);

  let pCrowd = pOut.crowd, pJudge = pOut.judges;
  let fCrowd = fOut.crowd, fJudge = fOut.judges;

  /*
   * THE ROOM, turned last exchange by somebody's Crowd Turn.
   *
   * CROWD COMPONENT ONLY, and that is the whole design: `actScore` throws the
   * crowd number away in a panel act, so turning the room in Act 3's empty lot
   * or on Act 5's water changes nothing at all. There is no room there to turn.
   */
  if (you.roomWithIn !== 1) { pCrowd *= you.roomWithIn; P.roomWith = true; }
  if (you.roomAwayIn !== 1) { pCrowd *= you.roomAwayIn; P.roomAway = true; }
  if (foe.roomWithIn !== 1) { fCrowd *= foe.roomWithIn; F.roomWith = true; }
  if (foe.roomAwayIn !== 1) { fCrowd *= foe.roomAwayIn; F.roomAway = true; }
  you.roomWithIn = 1; you.roomAwayIn = 1;
  foe.roomWithIn = 1; foe.roomAwayIn = 1;

  // guard — halves what lands on them, after every multiplier of theirs
  if (P.special === 'guard') {
    fCrowd *= TUNING.guardMult; fJudge *= TUNING.guardMult;
    F.guarded = true; P.specialFired = true; P.specialDetail = 'arms crossed';
  }
  if (F.special === 'guard') {
    pCrowd *= TUNING.guardMult; pJudge *= TUNING.guardMult;
    P.guarded = true; F.specialFired = true; F.specialDetail = 'arms crossed';
  }

  // persist carry — set on an earlier turn, so guard does not get to halve it
  P.carry = you.persistIn; you.persistIn = 0;
  F.carry = foe.persistIn; foe.persistIn = 0;
  pCrowd += P.carry; pJudge += P.carry;
  fCrowd += F.carry; fJudge += F.carry;

  const pScore = actScore(match.scoring, pCrowd, pJudge);
  const fScore = actScore(match.scoring, fCrowd, fJudge);

  /* -- 6. meter ---------------------------------------------------------- */
  /*
   * Two different bars share one number. In a duel it is the tug of war §11
   * paints across the top. In EL FARMEO there is nobody to tug against, so the
   * same 0…100 reads as progress towards `target` — which is what the room is
   * actually deciding while you are up there alone.
   */
  let meterAfter;
  if (match.solo) {
    meterAfter = clamp(100 * (you.aura + pScore) / match.target, 0, 100);
  } else {
    let shift = TUNING.meterMaxShift * Math.tanh((pScore - fScore) / TUNING.meterSoft);
    if (P.finisherFired) shift += TUNING.finisherMeterPush;
    if (F.finisherFired) shift -= TUNING.finisherMeterPush;
    meterAfter = clamp(match.meter + shift, 0, 100);
  }
  match.meter = meterAfter;

  /* -- 7. hype ----------------------------------------------------------- */
  const pHype = hypeGain(P, pScore);
  const fHype = F.absent ? 0 : hypeGain(F, fScore);
  you.hype = clamp(you.hype + pHype, 0, TUNING.hypeMax);
  foe.hype = clamp(foe.hype + fHype, 0, TUNING.hypeMax);

  /* -- 8. ledgers -------------------------------------------------------- */
  commitSide(match, you, P, pScore, pCrowd, pJudge);
  if (!F.absent) commitSide(match, foe, F, fScore, fCrowd, fJudge);

  // debuff set for NEXT turn
  if (P.special === 'debuff') { foe.debuffIn = TUNING.debuffMult; P.specialFired = true; P.specialDetail = 'they pay next turn'; }
  if (F.special === 'debuff') { you.debuffIn = TUNING.debuffMult; F.specialFired = true; F.specialDetail = 'you pay next turn'; }

  // the room, handed to the next turn — same slot as debuff, feint and persist
  grantRoom(P, foe);
  grantRoom(F, you);

  // feint — a cheap set-up for the next one
  if (P.special === 'feint') { you.bonusLinks += 1; P.specialFired = true; P.specialDetail = '+1 link next turn'; }
  if (F.special === 'feint') { foe.bonusLinks += 1; F.specialFired = true; F.specialDetail = '+1 link next turn'; }

  // persist — scores again, smaller, next turn
  if (P.special === 'persist') { you.persistIn = pScore * TUNING.persistCarry; P.specialFired = true; P.specialDetail = 'it keeps going'; }
  if (F.special === 'persist') { foe.persistIn = fScore * TUNING.persistCarry; F.specialFired = true; F.specialDetail = 'it keeps going'; }

  // refresh — clears the decay on the most-worn move that is not this one
  if (P.special === 'refresh') applyRefresh(you, P);
  if (F.special === 'refresh') applyRefresh(foe, F);

  // read — the reveal is set when the next opponent move is rolled
  if (P.special === 'read') {
    if (match.solo) {
      // Not a failure, and not silence either: the move is telling the truth
      // about where it is standing, the same way Crowd Turn does in a panel act.
      P.specialFired = false;
      P.specialDetail = 'nobody up there to read';
    } else {
      match.pendingRead = true;
      P.specialFired = true;
      P.specialDetail = 'you see their next category';
    }
  }

  /* -- 9. advance -------------------------------------------------------- */
  match.round += 1;
  const pinned = !match.solo && match.suddenEnd && (meterAfter >= 100 || meterAfter <= 0);
  if (match.round > match.rounds || pinned) {
    match.over = true;
    match.pending = null;
    match.reveal = null;
    if (match.solo) {
      // There is no winner of a farmeo. There is only whether the room let you
      // in, and `winner` is kept honest rather than borrowed: nobody lost.
      match.passed = you.aura >= match.target;
      match.winner = null;
      match.flawless = false;
    } else {
      if (meterAfter > TUNING.meterStart) match.winner = 'you';
      else if (meterAfter < TUNING.meterStart) match.winner = 'them';
      else match.winner = you.aura > foe.aura ? 'you' : foe.aura > you.aura ? 'them' : 'draw';
      match.flawless = match.winner === 'you' && meterAfter >= TUNING.flawlessMeter && !you.everWhiffed;
    }
  } else {
    prepareTurn(match);
  }

  /* -- 10. the result ---------------------------------------------------- */
  const youTurn = turnReport(match, P, pCtx, pOut, pScore, pCrowd, pJudge, pHype, you, 'you');
  const themTurn = turnReport(match, F, fCtx, fOut, fScore, fCrowd, fJudge, fHype, foe, 'them');

  const result = {
    round: roundNo,
    roundsTotal: match.rounds,
    act: match.act.id,
    scoring: match.scoring,
    unstable: match.unstable,
    /* EL FARMEO. `them` is null rather than a zero-scoring ghost, so a consumer
     * that forgets the solo stage exists fails loudly instead of painting a
     * callout over an empty patch of concrete. */
    solo: match.solo,
    target: match.solo ? match.target : 0,
    auraSoFar: match.solo ? Math.round(you.aura) : 0,
    passed: match.solo && match.over ? match.passed : false,
    revealUsed: revealShown ? { category: revealShown.category } : null,
    you: youTurn,
    them: match.solo ? null : themTurn,
    meterBefore: meterBefore,
    meterAfter: meterAfter,
    meterDelta: meterAfter - meterBefore,
    over: match.over,
    winner: match.over ? match.winner : null,
    flawless: match.over ? match.flawless : false,
    nextReveal: match.reveal ? { category: match.reveal.category } : null,
    mcCue: mcCue(match, P, F, youTurn, themTurn, roundNo, meterBefore, meterAfter),
    logLine: match.verbose ? logLine(roundNo, youTurn, match.solo ? null : themTurn) : null
  };

  match.log.push(result);
  return result;
}

/* -------------------------------------------------------------------------- */
/* TURN HELPERS                                                                */
/* -------------------------------------------------------------------------- */

/**
 * `hype` — Crowd Turn. Costs you this exchange, banks triple hype, and hands
 * you the room for the next one while they perform to the back of it.
 *
 * `roomBlind` is not a failure — it is the move telling the truth about where
 * it is standing. A panel does not turn.
 */
function applyHype(match, plan) {
  if (plan.special !== 'hype') return;
  plan.extra *= TUNING.hypeSpecialScore;
  plan.hypeMult = TUNING.hypeSpecialGain;
  plan.specialFired = true;
  plan.roomTurned = match.round < match.rounds;
  plan.specialDetail = match.scoring === 'judges'
    ? 'no room to turn — a panel does not clap'
    : plan.roomTurned ? 'the room turns with you'
      : 'played to the room, with nothing left to spend it on';
}

/** Hand over the room. Step 8 only — see the note at the call site. */
function grantRoom(plan, other) {
  if (!plan.roomTurned) return;
  plan.side.roomWithIn *= TUNING.roomSelf;
  other.roomAwayIn *= TUNING.roomThem;
}

function applyHighRisk(plan) {
  if (plan.special !== 'highRisk') return;
  const good = plan.band === 'perfect' || plan.band === 'clean';
  plan.extra *= good ? TUNING.highRiskUp : TUNING.highRiskDown;
  plan.specialFired = true;
  plan.specialDetail = good ? 'total commitment' : 'it did not land';
}

function applyFinisher(match, plan) {
  if (plan.special !== 'finisher') return;
  if (!meterCloseFor(match, plan.side.side)) {
    plan.specialFired = false;
    plan.specialDetail = 'too early — the meter was not close';
    return;
  }
  plan.extra *= TUNING.finisherMult;
  plan.finisherFired = true;
  plan.specialFired = true;
  plan.specialDetail = 'that ends it';
}

function applyRefresh(side, plan) {
  const playedId = plan.blend ? plan.blend.a.id : plan.move.id;
  let target = null, most = 0;
  for (const id in side.uses) {
    if (id === playedId) continue;
    if (side.uses[id] > most) { most = side.uses[id]; target = id; }
  }
  if (!target && side.uses[playedId] > 0) { target = playedId; most = side.uses[playedId]; }
  if (target && most > 0) {
    side.uses[target] = 0;
    plan.specialFired = true;
    plan.specialDetail = target + ' reads new again';
  } else {
    plan.specialDetail = 'nothing worn out yet';
  }
}

function patternFor(match, chain) {
  if (chain.length < 3) return null;
  const three = chain.slice(-3);
  const a = getMove(match, three[0]), b = getMove(match, three[1]), c = getMove(match, three[2]);
  if (!a || !b || !c) return null;
  return findPattern([a, b, c]);
}

function ctxFor(plan, oppCat, prevCat) {
  return {
    move: plan.move,
    amp: plan.amp,
    band: plan.band,
    uses: plan.uses,
    oppCat: oppCat,
    prevCat: prevCat,
    links: plan.links,
    pattern: plan.pattern,
    blend: plan.blend,
    freshExtra: plan.freshExtra,
    extraMult: plan.extra,
    bonus: 0
  };
}

function hypeGain(plan, score) {
  const band = TUNING.hypeByBand[plan.band] || 0;
  const fromScore = Math.min(TUNING.hypeFromScoreCap, score / TUNING.hypeFromScoreDiv);
  return Math.round((TUNING.hypeBase + band + fromScore) * plan.hypeMult);
}

function commitSide(match, side, plan, score, crowd, judges) {
  // freshness ledger
  if (plan.blend) {
    side.uses[plan.blend.a.id] = (side.uses[plan.blend.a.id] || 0) + 1;
    side.uses[plan.blend.b.id] = (side.uses[plan.blend.b.id] || 0) + 1;
  } else {
    side.uses[plan.move.id] = (side.uses[plan.move.id] || 0) + 1;
  }

  // combo chain
  const landed = (plan.band === 'perfect' || plan.band === 'clean') && !plan.interrupted;
  side.links = landed ? Math.min(TUNING.maxComboLinks, plan.links + 1) : 0;
  if (plan.interrupted) side.chain = [];

  // pattern window — a pattern consumes its chain, otherwise the window slides
  if (plan.pattern) side.chain = [];
  else if (!plan.interrupted) side.chain = plan.chain.slice(-2);

  side.aura += score;
  side.crowdAura += crowd;
  side.judgeAura += judges;
  side.lastScore = score;
  side.lastMoveId = plan.blend ? plan.blend.a.id : plan.move.id;
  side.lastCat = plan.move.cat;
  if (plan.band === 'whiff') side.everWhiffed = true;
}

function turnReport(match, plan, ctx, out, score, crowd, judges, hype, side, label) {
  const m = plan.move;
  const f = out.factors;
  const status = [];
  if (plan.guarded) status.push({ key: 'guarded', label: 'GUARDED' });
  if (plan.debuffed) status.push({ key: 'debuffed', label: 'ROPED' });
  if (plan.interrupted) status.push({ key: 'interrupted', label: 'CUT OFF' });
  if (plan.punished) status.push({ key: 'punished', label: 'REPEAT' });
  if (plan.carry > 0) status.push({ key: 'carry', label: 'STILL GOING' });
  if (plan.roomWith) status.push({ key: 'roomWith', label: 'THE ROOM' });
  if (plan.roomAway) status.push({ key: 'roomAway', label: 'BACKS TURNED' });
  if (plan.specialFired && plan.special) status.push({ key: plan.special, label: SPECIALS[plan.special].label });

  const report = {
    side: label,
    moveId: m.id,
    moveName: m.name,
    cat: m.cat,
    tier: m.tier,
    hint: m.hint,
    dur: m.dur,
    up: m.up,
    lo: m.lo,
    blend: plan.blend
      ? {
        a: plan.blend.a.id, b: plan.blend.b.id,
        aName: plan.blend.a.name, bName: plan.blend.b.name,
        split: Math.round(plan.blend.a.up * plan.blend.b.lo * 100) / 100,
        mult: Math.round(blendMult(plan.blend.a, plan.blend.b) * 100) / 100
      }
      : null,
    blendRefused: plan.blendRefused,
    band: plan.band,
    bandLabel: TIMING_LABEL[plan.band],
    amp: Math.round(plan.amp * 1000) / 1000,
    ampRequested: Math.round(plan.ampRequested * 1000) / 1000,
    ampJitter: plan.ampJitter,
    idealAmp: m.idealAmp,
    score: Math.round(score),
    crowd: Math.round(crowd),
    judges: Math.round(judges),
    raw: Math.round(out.raw * 100) / 100,
    carry: Math.round(plan.carry),
    matchup: matchupOf(m.cat, ctx.oppCat),
    matchupLabel: MATCHUP_LABEL[matchupOf(m.cat, ctx.oppCat)],
    uses: plan.uses,
    links: plan.links,
    pattern: plan.pattern ? { id: plan.pattern.id, name: plan.pattern.name, mult: plan.pattern.mult } : null,
    special: plan.special
      ? {
        key: plan.special,
        label: SPECIALS[plan.special].label,
        fired: plan.specialFired,
        detail: plan.specialDetail
      }
      : null,
    factors: {
      base: f.base,
      timing: r3(f.timing),
      matchup: r3(f.matchup),
      freshness: r3(f.freshness),
      composure: r3(f.composure),
      combo: r3(f.combo),
      pattern: r3(f.pattern),
      blend: r3(f.blend),
      special: r3(f.special),
      guard: plan.guarded ? TUNING.guardMult : 1
    },
    multipliers: match.verbose ? whyList(plan, ctx, f) : null,
    status: status,
    callout: callout(score, plan.band),
    hypeGain: hype,
    hypeAfter: Math.round(side.hype),
    auraTotal: Math.round(side.aura),
    auraText: formatAura(side.aura),
    legal: plan.legal,
    illegalReason: plan.illegalReason
  };
  return report;
}

function r3(v) { return Math.round(v * 1000) / 1000; }

/** Only the factors that actually moved the number, in the order they read. */
function whyList(plan, ctx, f) {
  const out = [];
  const push = function (key, value) {
    if (Math.abs(value - 1) < 1e-6) return;
    out.push({ key: key, label: factorLabel(key, value, ctx), value: r3(value) });
  };
  push('timing', f.timing);
  push('matchup', f.matchup);
  push('freshness', f.freshness);
  push('composure', f.composure);
  push('combo', f.combo);
  push('pattern', f.pattern);
  push('blend', f.blend);
  if (plan.special && plan.specialFired && Math.abs(f.special - 1) > 1e-6) {
    out.push({ key: 'special', label: SPECIALS[plan.special].label, value: r3(f.special) });
  }
  if (plan.guarded) out.push({ key: 'guard', label: 'GUARDED', value: TUNING.guardMult });
  return out;
}

function logLine(round, you, them) {
  if (!them) return 'R' + round + ' · ' + you.moveName + ' ' + you.callout;
  return 'R' + round + ' · ' + you.moveName + ' ' + you.callout +
    ' · ' + them.moveName + ' ' + them.callout;
}

/**
 * One cue key per exchange for the MC bar. The engine names the moment; the
 * lines themselves live in `src/data/mc.js`, which owns the voice.
 */
function mcCue(match, P, F, you, them, round, before, after) {
  /*
   * EL FARMEO gets a deliberately narrow set of cues, and the narrowness is the
   * point. Most of `src/data/mc.js` is written about two people — `beat` says
   * "nobody has flinched", `open` says "whatever they open with" — and an
   * announcer describing a rival who is not there is worse than an announcer
   * saying nothing. `null` is a legitimate thing for the bar to carry.
   */
  if (match.solo) {
    if (P.band === 'whiff') return 'whiff';
    if (P.uses > 0) return 'repeat';
    if (P.band === 'perfect') return 'perfect';
    if (you.callout === '+10.000') return 'big';
    return null;
  }
  if (match.over) return match.flawless ? 'flawless' : 'final';
  if (P.finisherFired) return 'finisher';
  if (P.pattern) return 'pattern';
  if (P.blend) return 'blend';
  if (P.band === 'whiff') return 'whiff';
  if (P.band === 'perfect') return 'perfect';
  if (P.links >= 3) return 'combo';
  if (P.special && P.specialFired && (P.special === 'interrupt' || P.special === 'guard' || P.special === 'counter')) return P.special;
  if ((before - 50) * (after - 50) < 0) return 'upset';
  if (round === 1) return 'open';
  if (round >= match.rounds) return 'last';
  if (after >= 72) return 'lead';
  if (after <= 28) return 'behind';
  return null;
}

/* -------------------------------------------------------------------------- */
/* SNAPSHOT — everything the HUD wants, in one plain object                     */
/* -------------------------------------------------------------------------- */

/**
 * A serialisable view of the match. `src/ui/hud.js` renders from this; nothing
 * in the UI needs to reach into match internals.
 */
export function matchSnapshot(match) {
  return {
    act: match.act.id,
    actName: match.act.name || match.act.id,
    scoring: match.scoring,
    unstable: match.unstable,
    /* EL FARMEO. `meter` is progress towards `target` in a solo, not a tug. */
    solo: match.solo,
    target: match.target,
    auraSoFar: Math.round(match.you.aura),
    auraText: formatAura(match.you.aura),
    targetText: formatAura(match.target),
    remaining: Math.max(0, Math.round(match.target - match.you.aura)),
    remainingText: formatAura(Math.max(0, match.target - match.you.aura)),
    overBar: match.solo && match.you.aura >= match.target,
    opponent: match.opponent.name,
    opponentSkill: match.opponent.skill,
    quirk: match.opponent.quirk || null,
    quirkInfo: match.opponent.quirk ? QUIRKS[match.opponent.quirk] || null : null,
    round: Math.min(match.round, match.rounds),
    rounds: match.rounds,
    meter: Math.round(match.meter * 10) / 10,
    fit: match.fit ? match.fit.id : null,
    fitMeter: Math.round(match.fitMeter * 10) / 10,
    hype: Math.round(match.you.hype),
    hypeMax: TUNING.hypeMax,
    blendCost: TUNING.blendCost,
    canBlend: canBlend(match),
    reveal: match.reveal ? { category: match.reveal.category } : null,
    links: match.you.links + match.you.bonusLinks,
    chain: match.you.chain.slice(),
    yourAura: Math.round(match.you.aura),
    theirAura: Math.round(match.foe.aura),
    finisherOpen: meterCloseFor(match, 'you'),
    over: match.over,
    winner: match.winner,
    flawless: match.flawless,
    needleSpeedMult: match.unstable ? TUNING.unstable.needleSpeedMult : 1
  };
}

/**
 * The end-of-battle summary the result screen wants: who won, by how much, and
 * what to say about it.
 */
export function matchSummary(match) {
  const you = match.you, foe = match.foe;
  return {
    winner: match.winner,
    flawless: match.flawless,
    meter: Math.round(match.meter * 10) / 10,
    rounds: match.log.length,
    you: { aura: Math.round(you.aura), crowd: Math.round(you.crowdAura), judges: Math.round(you.judgeAura), text: formatAura(you.aura) },
    them: { aura: Math.round(foe.aura), crowd: Math.round(foe.crowdAura), judges: Math.round(foe.judgeAura), text: formatAura(foe.aura) },
    title: match.winner === 'you' ? (match.flawless ? 'AURA INFINITA' : 'You took it') : match.winner === 'them' ? 'PERDIÓ AURA' : 'Dead even',
    drop: match.winner === 'you' ? (match.opponent.drop || null) : null,
    lines: match.log.map(function (t) { return t.logLine; }).filter(Boolean),
    distinctMoves: Object.keys(you.uses).length,
    bestTurn: match.log.reduce(function (best, t) {
      return !best || t.you.score > best.you.score ? t : best;
    }, null)
  };
}

/* -------------------------------------------------------------------------- */
/* EL FARMEO — the solo stage, and the price of falling short                   */
/* -------------------------------------------------------------------------- */

/**
 * What each landing on the ladder is called and what it means. Kept next to
 * `matchSummary`'s titles, which is where the rest of the engine's few authored
 * strings already live.
 *
 * Note what is NOT here: a way to be sent home. Nobody is turned away from a
 * public square, and a stage the player can fail into a menu is a stage that
 * makes them replay the menu. Falling short costs ground, not the fight.
 */
export const QUALIFY_BANDS = Object.freeze({
  straight: Object.freeze({
    label: 'STRAIGHT IN',
    note: 'The square turned round before you finished. You start the battle ahead.'
  }),
  in: Object.freeze({
    label: 'YOU ARE IN',
    note: 'Cleared the bar. You start level.'
  }),
  late: Object.freeze({
    label: 'BOTTOM OF THE SHEET',
    note: 'Short of the bar. They take your name anyway and you start a step behind.'
  }),
  bottom: Object.freeze({
    label: 'THEY CALL YOU ANYWAY',
    note: 'Well short. Nobody gets sent home from a Tuesday, but the square saw it. You start behind.'
  })
});

/** Where a ratio of the bar lands on the ladder. Top-down, first match wins. */
function qualifyBandFor(ratio) {
  const bands = TUNING.qualify.bands;
  for (let i = 0; i < bands.length; i++) {
    if (ratio >= bands[i].at) return bands[i];
  }
  return bands[bands.length - 1];
}

function dressBand(b, target) {
  const copy = QUALIFY_BANDS[b.key] || { label: b.key.toUpperCase(), note: '' };
  const need = Math.round(target * b.at);
  return {
    key: b.key,
    at: b.at,
    need: need,
    needText: formatAura(need),
    meterStart: b.meterStart,
    crowd: b.crowd,
    label: copy.label,
    note: copy.note
  };
}

/**
 * The farmeo the player is about to walk into, or `null` when this fight does
 * not have one.
 *
 * The bar scales with the ACT (`act.qualify.bar`, aura per turn, which is the
 * room's standard) and with the SKILL of the person you are queueing to face —
 * the same three moves that get you past a Tuesday in the plaza are not going
 * to get you onto the prow. The whole ladder is returned dressed, so the UI can
 * say what each landing is worth before the player commits to anything, which
 * is the one thing a qualifier has to do to be fair.
 *
 * @param {Object} act
 * @param {Object} [opponent] the rival you are queueing to battle
 * @returns {{turns:number, target:number, targetText:string, perTurn:number,
 *            bar:number, name:string, line:string, bands:Array}|null}
 */
export function qualifyFor(act, opponent) {
  if (!act || !act.qualify) return null;
  if (opponent && opponent.qualify === false) return null;

  const q = act.qualify;
  const turns = clamp(q.turns | 0, 1, 4) || 2;
  const bar = q.bar > 0 ? q.bar : 900;
  const skill = opponent && typeof opponent.skill === 'number' ? opponent.skill : 0.5;
  const mult = TUNING.qualify.skillFloor + TUNING.qualify.skillGain * skill;
  const target = Math.max(50, Math.round(bar * turns * mult / 50) * 50);

  const bands = [];
  for (let i = 0; i < TUNING.qualify.bands.length; i++) {
    bands.push(dressBand(TUNING.qualify.bands[i], target));
  }

  return {
    turns: turns,
    target: target,
    targetText: formatAura(target),
    perTurn: Math.round(target / turns),
    bar: bar,
    name: q.name || 'El farmeo',
    line: q.line || '',
    bands: bands
  };
}

/**
 * Start a farmeo. Same engine, same deck, same needle, same `resolveExchange` —
 * the only difference is that nobody is standing opposite.
 *
 * @param {Object} cfg   as `createMatch`, plus:
 * @param {Object} cfg.plan  the object `qualifyFor()` returned
 * @returns {Object} the match
 */
export function createQualifier(cfg) {
  const c = cfg || {};
  const plan = c.plan || {};
  return createMatch(Object.assign({}, c, {
    solo: true,
    target: plan.target,
    rounds: plan.turns,
    fit: null,          // §5: a fit is the DUEL's opening statement, not a buff
    suddenEnd: false
  }));
}

/**
 * What the room decided, and what it costs. `meterStart` is handed straight to
 * `createMatch` for the duel that follows; `crowd` is the change in turnout.
 *
 * @param {Object} match a finished solo match
 */
export function qualifySummary(match) {
  const you = match.you;
  const target = match.target > 0 ? match.target : 1;
  const ratio = you.aura / target;
  const band = dressBand(qualifyBandFor(ratio), target);

  return {
    solo: true,
    passed: !!match.passed,
    aura: Math.round(you.aura),
    auraText: formatAura(you.aura),
    target: match.target,
    targetText: formatAura(match.target),
    ratio: Math.round(ratio * 100) / 100,
    pct: Math.round(clamp(ratio, 0, 2) * 100),
    band: band,
    title: band.label,
    note: band.note,
    meterStart: band.meterStart,
    crowd: band.crowd,
    rounds: match.log.length,
    distinctMoves: Object.keys(you.uses).length,
    lines: match.log.map(function (t) { return t.logLine; }).filter(Boolean),
    bestTurn: match.log.reduce(function (best, t) {
      return !best || t.you.score > best.you.score ? t : best;
    }, null)
  };
}

/* -------------------------------------------------------------------------- */
/* PLAYER POLICIES — for test/balance-sim.js                                    */
/* -------------------------------------------------------------------------- */

export const PLAYER_POLICIES = ['masher', 'varied', 'composed', 'expert'];

const RANDOM_BANDS = ['perfect', 'clean', 'shaky', 'whiff'];

function legalDeck(match) {
  const out = [];
  for (let i = 0; i < match.deck.length; i++) {
    const m = getMove(match, match.deck[i]);
    if (m && isLegal(match, 'you', m).legal) out.push(m);
  }
  return out.length ? out : [getMove(match, match.deck[0])];
}

function bestBlendPair(match) {
  if (match._bestBlend !== undefined) return match._bestBlend;
  let best = null, bestV = 0;
  const deck = match.deck;
  for (let i = 0; i < deck.length; i++) {
    const a = getMove(match, deck[i]);
    if (!a) continue;
    for (let j = 0; j < deck.length; j++) {
      if (i === j) continue;
      const b = getMove(match, deck[j]);
      if (!b) continue;
      const v = blendMult(a, b) * (a.base + b.base) / 2;
      if (v > bestV) { bestV = v; best = { a: a.id, b: b.id, split: a.up * b.lo }; }
    }
  }
  match._bestBlend = best;
  return best;
}

/**
 * Turn a policy name into a committed action. The simulator drives the player
 * through this so the four policies are defined in the engine, next to the
 * rules they are meant to probe, rather than in a test file that can drift.
 *
 * masher   — spams one strong move, random timing
 * varied   — never repeats within 3, random timing
 * composed — never repeats, holds near idealAmp
 * expert   — plays the triangle, near-perfect timing and amplitude, blends
 *
 * @param {string} policy
 * @param {Object} match
 * @returns {Object} an action for `resolveExchange`
 */
export function policyAction(policy, match) {
  const rng = match.rng;
  const deck = legalDeck(match);
  const you = match.you;

  const randBand = function () { return RANDOM_BANDS[(rng() * 4) | 0]; };

  if (policy === 'masher') {
    let pick = deck[0];
    for (let i = 1; i < deck.length; i++) if (deck[i].base > pick.base) pick = deck[i];
    return { moveId: pick.id, band: randBand(), amp: clamp(pick.idealAmp + (rng() - 0.5) * 0.7, AMP_RANGE.min, AMP_RANGE.max) };
  }

  if (policy === 'varied') {
    const recent = you.chain.concat([you.lastMoveId]).filter(Boolean);
    let opts = deck.filter(function (m) { return recent.indexOf(m.id) < 0; });
    if (!opts.length) opts = deck;
    const pick = opts[(rng() * opts.length) | 0];
    return { moveId: pick.id, band: randBand(), amp: clamp(pick.idealAmp + (rng() - 0.5) * 0.6, AMP_RANGE.min, AMP_RANGE.max) };
  }

  if (policy === 'composed') {
    let opts = deck.filter(function (m) { return !(you.uses[m.id] > 0); });
    if (!opts.length) {
      let least = deck[0];
      for (let i = 1; i < deck.length; i++) {
        if ((you.uses[deck[i].id] || 0) < (you.uses[least.id] || 0)) least = deck[i];
      }
      opts = [least];
    }
    const pick = opts[(rng() * opts.length) | 0];
    return { moveId: pick.id, band: randBand(), amp: clamp(pick.idealAmp + (rng() - 0.5) * 0.12, AMP_RANGE.min, AMP_RANGE.max) };
  }

  // expert
  const predicted = match.reveal ? match.reveal.category : match.foe.lastCat;
  const want = predicted ? counterCategory(predicted) : null;

  if (canBlend(match) && rng() < 0.5) {
    const pair = bestBlendPair(match);
    if (pair && pair.split > 0.55) {
      const a = getMove(match, pair.a);
      return { blend: { a: pair.a, b: pair.b }, band: expertBand(rng, match), amp: clamp(((a.idealAmp + getMove(match, pair.b).idealAmp) / 2) + (rng() - 0.5) * 0.05, AMP_RANGE.min, AMP_RANGE.max) };
    }
  }

  let opts = deck;
  if (want) {
    const tri = deck.filter(function (m) { return m.cat === want; });
    if (tri.length) opts = tri;
  }
  let worn = 0;
  for (const id in you.uses) if (you.uses[id] > worn) worn = you.uses[id];

  let pick = null, bestV = -Infinity;
  for (let i = 0; i < opts.length; i++) {
    const m = opts[i];
    let v = m.base * freshnessMult(you.uses[m.id] || 0);

    // an expert values a role, not a base score
    switch (m.special) {
      case 'finisher': v *= meterCloseFor(match, 'you') ? 1.8 : 0.2; break;
      case 'interrupt': v *= 1 + 0.60 * Math.min(1, match.foe.links / 3); break;
      case 'guard': v *= 1 + 0.70 * Math.min(1, match.foe.lastScore / 1400); break;
      case 'counter': v *= 1 + 0.75 * Math.min(1, match.foe.lastScore / 1400); break;
      case 'refresh': v *= worn >= 2 ? 1.65 : 0.8; break;
      case 'evade': v *= you.debuffIn < 1 ? 1.7 : 0.85; break;
      case 'read': v *= match.reveal ? 0.8 : 1.30; break;
      case 'feint': v *= you.links >= 1 ? 1.45 : 1.15; break;
      case 'persist': v *= 1.25; break;
      case 'highRisk': v *= 1.30; break;   // an expert hits their timing
      case 'hype': {
        /*
         * Crowd Turn. An expert asks two questions: is there a room here, and
         * have I got something worth spending it on next turn. A panel act
         * answers the first one no, and the last round answers the second.
         */
        const room = match.scoring === 'judges' ? 0 : match.scoring === 'both' ? 0.5 : 1;
        const wantsHype = you.hype < TUNING.blendCost ? 0.45 : 0.10;
        v *= match.round >= match.rounds ? 0.15 : (0.45 + 1.70 * room + wantsHype);
        break;
      }
      case 'debuff': v *= 1.15; break;
      default: break;
    }

    // chase a named chain
    const chain = you.chain.concat([m.id]);
    if (chain.length >= 3) {
      const three = chain.slice(-3).map(function (cid) { return getMove(match, cid); });
      if (three[0] && three[1] && three[2] && findPattern(three)) v *= 1.45;
    }

    if (v > bestV) { bestV = v; pick = m; }
  }
  if (!pick) pick = deck[0];
  return { moveId: pick.id, band: expertBand(rng, match), amp: clamp(pick.idealAmp + (rng() - 0.5) * 0.06, AMP_RANGE.min, AMP_RANGE.max) };
}

/**
 * An expert hits the needle 85% of the time and never whiffs — on a still deck.
 *
 * Act 5 declares `needleSpeedMult: 1.75`, which is a real mechanic the UI
 * honours: the needle crosses the perfect zone 45% faster, so the window is
 * 45% narrower in time. Modelling the expert as equally perfect on the prow of
 * a racing boat was the simulator quietly refusing to measure a rule the engine
 * already publishes, and it flattered the top of the campaign by several points
 * an act. Most of the perfects it costs land as cleans; the rest go shaky.
 */
function expertBand(rng, match) {
  const speed = match && match.unstable ? TUNING.unstable.needleSpeedMult : 1;
  const p = 0.85 / speed;
  const c = p + 0.13 + (0.85 - p) * 0.72;
  const r = rng();
  return r < p ? 'perfect' : r < c ? 'clean' : 'shaky';
}

/**
 * Play one battle head to head with no DOM in sight.
 *
 * @param {Object} cfg   everything `createMatch` takes, plus:
 * @param {string} cfg.policy one of PLAYER_POLICIES
 * @returns {{winner, meter, you, them, rounds, match}}
 */
export function simulateBattle(cfg) {
  const match = createMatch(Object.assign({ verbose: false }, cfg));
  const policy = cfg.policy || 'varied';
  let guard = 0;
  while (!match.over && guard++ < 200) {
    resolveExchange(match, policyAction(policy, match));
  }
  return {
    winner: match.winner,
    meter: match.meter,
    you: Math.round(match.you.aura),
    them: Math.round(match.foe.aura),
    rounds: match.log.length,
    match: match
  };
}

/**
 * Win rate for one policy against one opponent.
 *
 * @param {Object} cfg  as `simulateBattle`, minus `seed`
 * @param {number} [n=3000]
 * @param {number} [seed0=1]
 * @returns {{wins:number, losses:number, draws:number, n:number, rate:number,
 *            avgYou:number, avgThem:number, avgMeter:number}}
 */
export function simulateSeries(cfg, n, seed0) {
  const runs = n > 0 ? n : 3000;
  const base = seed0 > 0 ? seed0 : 1;
  let wins = 0, losses = 0, draws = 0, sy = 0, st = 0, sm = 0;
  for (let i = 0; i < runs; i++) {
    const r = simulateBattle(Object.assign({}, cfg, { seed: (base + i * 2654435761) >>> 0 }));
    if (r.winner === 'you') wins++;
    else if (r.winner === 'them') losses++;
    else draws++;
    sy += r.you; st += r.them; sm += r.meter;
  }
  return {
    wins: wins, losses: losses, draws: draws, n: runs,
    rate: wins / runs,
    avgYou: sy / runs, avgThem: st / runs, avgMeter: sm / runs
  };
}
