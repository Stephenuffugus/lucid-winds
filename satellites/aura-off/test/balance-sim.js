#!/usr/bin/env node
/**
 * AURA OFF — test/balance-sim.js
 *
 * A headless balance simulator. It imports the engine and drives real battles
 * through `resolveExchange()`. It does NOT re-implement a single turn rule,
 * and it must never be allowed to.
 *
 * ---------------------------------------------------------------------------
 * WHY THAT MATTERS MORE THAN ANYTHING ELSE IN THIS FILE
 * ---------------------------------------------------------------------------
 * The previous version of this project shipped a simulator that mirrored the
 * scoring maths so it could run faster. The mirror drifted, the sim reported a
 * curve that did not exist, and balance bugs sat behind a green table for
 * months. Every number printed below comes out of the real engine or it does
 * not get printed. If you ever find yourself typing `base * timing` in here,
 * stop: `src/engine/battle.js` already did that, and its answer is the only
 * one that counts.
 *
 * ---------------------------------------------------------------------------
 * WHAT IT REPORTS
 * ---------------------------------------------------------------------------
 *   1. Win rate by act by policy, against the CONTRACT.md §14 targets.
 *   2. EL FARMEO — where each policy lands on the qualifying ladder, and what
 *      the whole two-stage format costs it against the same duel played cold.
 *   3. How each policy actually played — bands, blends, patterns, spread.
 *   4. Win rate by individual opponent, in campaign order.
 *   5. Move census: opening value per move, and who actually picks it.
 *   6. PACKS — the same table with no pack owned, with both packs bought, and
 *      with every pack move earned. A pack must add range and not power, so
 *      this section exists to catch it adding power.
 *   7. Design findings: dominated moves, unused moves, a backwards difficulty
 *      curve, policies pinned at the ceiling or the floor, whether the masher
 *      genuinely loses, and whether owning a pack buys win rate.
 *   8. Fit sensitivity — a controlled run where only the outfit changes.
 *
 * ---------------------------------------------------------------------------
 * A FIGHT IS TWO STAGES, SO A SIMULATED FIGHT IS TWO STAGES
 * ---------------------------------------------------------------------------
 * `src/ui/game.js` plays EL FARMEO — a solo qualifying stage, two or three
 * turns with nobody standing opposite — and hands what the room made of it to
 * the duel as an opening meter. Every act declares one; one opponent (Chispa,
 * the first fight of a run) declares it off.
 *
 * A simulator that skipped that stage would be reporting a game nobody plays.
 * Worse, it would be silently flattering whichever policy is best at clearing
 * a solo bar, which turns out to be the strongest one in the game. So every
 * cell in the main table is a farmeo played by the same policy, followed by the
 * duel it bought. Falling short is not elimination — it is a worse opening
 * meter — and that cost is inside the win rate, which is the only place it can
 * honestly live.
 *
 * ---------------------------------------------------------------------------
 * OWNERSHIP IS A DIMENSION OF THE TABLE, NOT A FOOTNOTE
 * ---------------------------------------------------------------------------
 * `src/data/packs.js` rule 2 is that a pack adds RANGE, never POWER, and rule 1
 * is that the base twenty-seven stay a complete winnable game. Neither is
 * checkable by reading a move sheet: both are win-rate claims. §6 runs the
 * campaign three times — nothing owned, both packs bought, every pack move
 * earned — off paired seeds, and prints the difference.
 *
 * The main table is ALWAYS the base twenty-seven. That is the game as it ships
 * and the table that belongs in README.
 *
 * CONTRACT.md §14 is explicit that its table "described code we no longer
 * have. It is a target, not a measurement." So this suite REPORTS. It does not
 * gate. It exits 0 whatever the numbers say, and exits non-zero only on a real
 * error — a missing module, a throw out of the engine, a dead worker. A
 * balance suite that fails the build on a design opinion just gets its
 * thresholds widened until it means nothing.
 *
 * ---------------------------------------------------------------------------
 * DETERMINISM
 * ---------------------------------------------------------------------------
 * Every battle's seed is derived from `--seed` and the identity of the matchup
 * (act, opponent, policy, battle index) — never from `Math.random`, never from
 * the clock, never from worker scheduling. Two runs at the same seed produce
 * identical tables on one thread or on eight, so a regression is reproducible
 * from the seed alone.
 *
 * ---------------------------------------------------------------------------
 * USAGE
 * ---------------------------------------------------------------------------
 *   node test/balance-sim.js                  full run, 3000 battles / matchup
 *   node test/balance-sim.js --quick          600 / matchup, for iterating
 *   node test/balance-sim.js --battles=10000  more precision
 *   node test/balance-sim.js --seed=99        a different, still-fixed world
 *   node test/balance-sim.js --workers=1      single threaded
 *   node test/balance-sim.js --json           machine-readable, no tables
 *   node test/balance-sim.js --no-color
 *   node test/balance-sim.js --no-packs       skip §6, the slowest section
 *   node test/balance-sim.js --no-farmeo      duels only — the pre-farmeo game
 *   node test/balance-sim.js --pack-battles=1200
 *
 * A matchup is one (policy x opponent) pair: 25 opponents x 4 policies x 3000
 * is 300,000 fights, each one a farmeo and then a duel, and about 3.4 million
 * exchanges. Add the paired duel-only arm §2 needs and the three ownership arms
 * §6 needs and a full run is around a minute on a two-core container, which is
 * what `--quick` is for.
 */

import { isMainThread, Worker, workerData, parentPort } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';
import { availableParallelism } from 'node:os';

/*
 * `MOVES` and `MOVES_BY_ID` are LIVE BINDINGS (see the header of
 * `src/data/moves.js`). `setOwnedPacks()` rebuilds them in place, so anything
 * that reads them must read them AFTER ownership is set for the job it is
 * running — never capture them into a config object first. §6 is the only
 * section that moves ownership, and it sets it at the top of every job so no
 * job can inherit another one's library whatever order the scheduler picks.
 */
import {
  MOVES, MOVES_BY_ID, PACKS, PACK_MOVES, setOwnedPacks
} from '../src/data/moves.js';
import { ACTS, OPPONENTS, FITS, actById, deckAfter } from '../src/data/campaign.js';
import {
  simulateBattle, createMatch, resolveExchange, PLAYER_POLICIES,
  policyAction, qualifyFor, createQualifier, qualifySummary, QUALIFY_BANDS
} from '../src/engine/battle.js';

/* ========================================================================== */
/* CONTRACT §14 — the design intent, copied verbatim. A target, not a gate.    */
/* ========================================================================== */

/**
 * "The inherited table below described code we no longer have. It is a target,
 * not a measurement." — CONTRACT.md §14. Percentages.
 */
const TARGETS = Object.freeze({
  plaza:   { masher: 4, varied: 76, composed: 88, expert: 99 },
  bracket: { masher: 3, varied: 65, composed: 80, expert: 98 },
  banned:  { masher: 0, varied: 33, composed: 62, expert: 88 },
  capital: { masher: 0, varied: 40, composed: 65, expert: 88 },
  upriver: { masher: 0, varied: 30, composed: 49, expert: 75 }
});

const POLICIES = PLAYER_POLICIES.slice();

/* ========================================================================== */
/* OWNERSHIP — the three states a player can be in, derived from the packs     */
/* ========================================================================== */

/**
 * Built from `PACKS` rather than written down, so a third pack lands in this
 * table the day it lands in the data file and nobody has to remember.
 *
 *   none    the base twenty-seven. What ships. The main table is always this.
 *   bought  every pack owned, but only the moves that arrive WITH a pack —
 *           the honest "I paid five minutes ago" state.
 *   maxed   every pack owned and every move inside it earned. Not a realistic
 *           save, deliberately: it is the ceiling of what money can buy, and if
 *           the ceiling does not raise win rate then nothing below it can.
 *
 * `deck` is appended to the campaign deck, because ownership gets you the pack
 * and the campaign still has to give you the base moves you have won.
 */
const ALL_PACK_IDS = PACKS.map(function (p) { return p.id; });
const PACK_OPENING_IDS = PACK_MOVES
  .filter(function (m) { return m.unlock && m.unlock.on === 'pack'; })
  .map(function (m) { return m.id; });
const PACK_ALL_MOVE_IDS = PACK_MOVES.map(function (m) { return m.id; });

const OWNERSHIP = Object.freeze([
  Object.freeze({ key: 'none', label: 'no pack', packs: Object.freeze([]), deck: Object.freeze([]) }),
  Object.freeze({
    key: 'bought', label: 'both packs, opening moves',
    packs: Object.freeze(ALL_PACK_IDS.slice()), deck: Object.freeze(PACK_OPENING_IDS.slice())
  }),
  Object.freeze({
    key: 'maxed', label: 'both packs, every move',
    packs: Object.freeze(ALL_PACK_IDS.slice()), deck: Object.freeze(PACK_ALL_MOVE_IDS.slice())
  })
]);

const OWNERSHIP_BY_KEY = OWNERSHIP.reduce(function (m, s) { m[s.key] = s; return m; }, Object.create(null));

/**
 * Point the shared move library at one ownership state and hand back what that
 * state adds to a deck. Called at the top of EVERY job, including the base
 * ones, so module state can never leak from one job into the next.
 */
function applyOwnership(key) {
  const st = OWNERSHIP_BY_KEY[key] || OWNERSHIP[0];
  setOwnedPacks(st.packs);
  return st;
}

/**
 * Thresholds for the findings section. Every one of these is a REPORTING
 * threshold, never a pass/fail gate. They are named constants so a reader can
 * argue with the number rather than with the conclusion.
 */
const FLAG = Object.freeze({
  /** A policy above this is not playing a game any more. */
  ceiling: 0.95,
  /** A policy below this has no path at all. */
  floor: 0.02,
  /**
   * Win rate rising between consecutive acts reads as a backwards difficulty
   * curve rather than sampling noise once it clears BOTH of these.
   *
   * A flat pp threshold on its own is the wrong test and it hid a real
   * inversion: near the ceiling a rate carries far less variance than it does
   * in the middle (at 96% and n = 15,000 the standard error is 0.16pp, not the
   * 0.4pp a 50% rate would give), so the expert going UP by 1.1pp from The Park
   * Bracket to The Banned Town was seven sigma and got called monotonic. The
   * curve now has to clear three standard errors of the DIFFERENCE as well as
   * the pp floor, and the floor is there only to stop a tiny `--quick` sample
   * flagging on noise.
   */
  backwardsPP: 0.5,
  backwardsSigma: 3,
  /**
   * Expert pick rate below this, with the move genuinely available, means the
   * one value-maximising policy in the sim never wants it.
   */
  expertPick: 0.005,
  /**
   * How far below the MEDIAN of its own category a move's special-free value
   * has to sit before "never picked" hardens from shadowed into dominated.
   * Median, not best — see the note above `catMedian` for the false positive
   * that measuring against the best produced.
   */
  dominatedRatio: 0.72,
  /**
   * Turns a move must have been available for before a pick rate is worth
   * drawing any conclusion from.
   */
  minAvailTurns: 20000,
  /**
   * A masher above this in any act would mean repetition is not being
   * punished, which contradicts the verified win condition.
   */
  masherAlarm: 0.25,
  /**
   * PAY TO WIN. How many points of win rate a pack may add before the claim
   * "a pack adds range, never power" (`packs.js` rule 2) stops being true.
   *
   * 2.0pp is roughly three standard errors on the default §6 sample (500
   * fights per opponent x policy, five opponents an act, so n = 2,500 a cell
   * and SE about 1.0pp on a rate near 50%), and it is also about the smallest
   * edge a player could actually feel. Under it, a difference is noise or a
   * rounding of one; over it, somebody bought a better game.
   */
  packEdgePP: 2.0,
  /**
   * A qualifying bar the strongest policy clears into the top band this often
   * is not a bar, it is a formality with a reward attached — and one that pays
   * out to the policy that needed it least.
   */
  farmeoTopBand: 0.9
});

/* ========================================================================== */
/* SEEDS — identity in, seed out. No clock, no Math.random, no thread id.      */
/* ========================================================================== */

/** FNV-1a over the matchup's identity, mixed with the master seed. */
function seedFor(master, ...parts) {
  let h = (2166136261 ^ (master >>> 0)) >>> 0;
  const s = parts.join('|');
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
  // One avalanche pass, so neighbouring job names do not hand out neighbouring
  // streams and accidentally correlate two matchups.
  h ^= h >>> 16; h = Math.imul(h, 2246822507) >>> 0;
  h ^= h >>> 13; h = Math.imul(h, 3266489909) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}

/* ========================================================================== */
/* THE WORK — one job is one (opponent x policy) matchup                      */
/* ========================================================================== */

function emptyCounts() { return Object.create(null); }

function bump(map, key, by) { map[key] = (map[key] || 0) + (by === undefined ? 1 : by); }

function mergeCounts(dst, src) {
  for (const k in src) dst[k] = (dst[k] || 0) + src[k];
}

/* -------------------------------------------------------------------------- */
/* EL FARMEO — the solo stage, played by the same policy, before the duel      */
/* -------------------------------------------------------------------------- */

/** The ladder's landings, in the order the engine tests them. */
const QUALIFY_KEYS = Object.freeze(['straight', 'in', 'late', 'bottom']);

function emptyBands() {
  return { straight: 0, in: 0, late: 0, bottom: 0, none: 0 };
}

/**
 * Play one farmeo and hand back what the room decided.
 *
 * Every rule here belongs to the engine: `createQualifier` builds the solo
 * match, `policyAction` picks the moves, `resolveExchange` scores them and
 * `qualifySummary` reads the ladder. This function owns the loop and nothing
 * else, which is the same contract the duel arm has lived under since the
 * first version of this file.
 *
 * @returns {{band:string, meterStart:number|undefined, ratio:number,
 *            aura:number, passed:boolean, turns:number}}
 */
function runFarmeo(plan, opp, act, deck, seed, policy) {
  const match = createQualifier({
    moves: MOVES, opponent: opp, act: act, plan: plan, deck: deck,
    seed: seed, verbose: false
  });
  let guard = 0;
  while (!match.over && guard++ < 40) resolveExchange(match, policyAction(policy, match));
  const s = qualifySummary(match);
  return {
    band: s.band.key,
    meterStart: s.meterStart,
    ratio: s.ratio,
    aura: s.aura,
    passed: !!s.passed,
    turns: match.log.length
  };
}

/**
 * Run one matchup and harvest everything the report needs out of the real
 * battles. Nothing in here decides an outcome; it reads the match log that
 * `resolveExchange` wrote.
 *
 * A cell is one full FIGHT per battle index: the farmeo, then the duel it
 * bought. `job.farmeo === false` runs the duel cold, which is what §2's paired
 * arm and `--no-farmeo` want.
 *
 * @param {{oppIndex:number, policy:string, n:number, master:number,
 *          farmeo?:boolean, own?:string}} job
 * @returns {Object} a structured-clone-safe cell
 */
function runMatchup(job) {
  const own = applyOwnership(job.own || 'none');
  const opp = OPPONENTS[job.oppIndex];
  const act = actById(opp.act);
  const deck = deckAfter(job.oppIndex).concat(own.deck);
  /*
   * The duel seed does NOT carry the ownership key or the farmeo flag, so the
   * three §6 arms and the two §2 arms are paired: battle 400 of every arm opens
   * on the same dice and differs only by the one variable under test. (The
   * streams still diverge inside a battle once the decks differ — a paired seed
   * removes the "different world" half of the variance, not all of it.)
   */
  const base = seedFor(job.master, 'cell', act.id, opp.id, job.policy);
  const qBase = seedFor(job.master, 'farmeo', act.id, opp.id, job.policy);
  const wantFarmeo = job.farmeo !== false;
  const plan = wantFarmeo ? qualifyFor(act, opp) : null;

  const cell = {
    kind: job.kind || 'cell',
    own: own.key,
    farmeo: wantFarmeo,
    oppIndex: job.oppIndex,
    oppId: opp.id,
    actId: opp.act,
    policy: job.policy,
    deck: deck,
    n: job.n,
    wins: 0, losses: 0, draws: 0,
    meterSum: 0, youSum: 0, themSum: 0,
    turns: 0, distinctSum: 0, scoreSum: 0,
    bands: { perfect: 0, clean: 0, shaky: 0, whiff: 0 },
    blendTurns: 0, blendSplitSum: 0, patternTurns: 0,
    finisherFired: 0, finisherEarly: 0,
    /* the farmeo's own numbers */
    qRuns: 0, qBands: emptyBands(), qRatioSum: 0, qAuraSum: 0,
    qPassed: 0, qTurns: 0, meterStartSum: 0,
    plays: emptyCounts(),
    playScore: emptyCounts(),
    winPlays: emptyCounts()
  };

  const cfg = {
    moves: MOVES,
    opponent: opp,
    act: act,
    deck: deck,
    policy: job.policy,
    verbose: false
  };

  for (let i = 0; i < job.n; i++) {
    if (plan) {
      const q = runFarmeo(plan, opp, act, deck, (qBase + i * 2654435761) >>> 0, job.policy);
      cell.qRuns++;
      cell.qBands[q.band]++;
      cell.qRatioSum += q.ratio;
      cell.qAuraSum += q.aura;
      cell.qTurns += q.turns;
      if (q.passed) cell.qPassed++;
      cell.meterStartSum += q.meterStart;
      cfg.meterStart = q.meterStart;
    } else {
      cell.qBands.none++;
      cfg.meterStart = undefined;
    }

    // Same stride `simulateSeries` uses, so a single battle from this table can
    // be replayed by hand with the same arithmetic.
    cfg.seed = (base + i * 2654435761) >>> 0;
    const r = simulateBattle(cfg);
    const won = r.winner === 'you';

    if (won) cell.wins++;
    else if (r.winner === 'them') cell.losses++;
    else cell.draws++;

    cell.meterSum += r.meter;
    cell.youSum += r.you;
    cell.themSum += r.them;
    cell.distinctSum += Object.keys(r.match.you.uses).length;

    const log = r.match.log;
    for (let t = 0; t < log.length; t++) {
      const you = log[t].you;
      cell.turns++;
      cell.bands[you.band]++;
      cell.scoreSum += you.score;

      if (you.blend) {
        // A blend is scored as a synthetic move. Credit it to both sources
        // rather than inventing a 28th id that no designer can look up.
        cell.blendTurns++;
        cell.blendSplitSum += you.blend.split;
        bump(cell.plays, you.blend.a);
        bump(cell.plays, you.blend.b);
        bump(cell.playScore, you.blend.a, you.score / 2);
        bump(cell.playScore, you.blend.b, you.score / 2);
        if (won) { bump(cell.winPlays, you.blend.a); bump(cell.winPlays, you.blend.b); }
      } else {
        bump(cell.plays, you.moveId);
        bump(cell.playScore, you.moveId, you.score);
        if (won) bump(cell.winPlays, you.moveId);
      }

      if (you.pattern) cell.patternTurns++;
      if (you.special && you.special.key === 'finisher') {
        if (you.special.fired) cell.finisherFired++; else cell.finisherEarly++;
      }
    }
  }

  return cell;
}

/**
 * Fit sensitivity. Same act boss, same policy, same seeds — one variable, what
 * you wore.
 *
 * The frog suit is +10 crowd and -3 judges, so in Act 3 (a panel, in an empty
 * lot, with no crowd at all) it should measurably hurt. If it does not, the fit
 * system is decoration.
 *
 * @param {{actIndex:number, fitIndex:number, n:number, master:number}} job
 */
function runFit(job) {
  applyOwnership('none');
  const act = ACTS[job.actIndex];
  const fit = FITS[job.fitIndex];

  let bossIndex = -1;
  for (let i = 0; i < OPPONENTS.length; i++) {
    if (OPPONENTS[i].act === act.id && OPPONENTS[i].boss) bossIndex = i;
  }
  if (bossIndex < 0) {
    for (let i = 0; i < OPPONENTS.length; i++) if (OPPONENTS[i].act === act.id) bossIndex = i;
  }

  const opp = OPPONENTS[bossIndex];
  const base = seedFor(job.master, 'fit', act.id, fit.id);
  const cfg = {
    moves: MOVES, opponent: opp, act: act, fit: fit,
    deck: deckAfter(bossIndex), policy: 'composed', verbose: false
  };

  let wins = 0;
  for (let i = 0; i < job.n; i++) {
    cfg.seed = (base + i * 2654435761) >>> 0;
    if (simulateBattle(cfg).winner === 'you') wins++;
  }
  return { kind: 'fit', actId: act.id, fitId: fit.id, oppId: opp.id, n: job.n, wins: wins };
}

function runJob(job) {
  return job.kind === 'fit' ? runFit(job) : runMatchup(job);
}

/* ========================================================================== */
/* WORKER SIDE — this same file, running a slice of the job list              */
/* ========================================================================== */

if (!isMainThread && workerData && workerData.jobs) {
  const out = [];
  for (let i = 0; i < workerData.jobs.length; i++) out.push(runJob(workerData.jobs[i]));
  parentPort.postMessage(out);
}

/* ========================================================================== */
/* OPENING VALUE — a controlled, matchup-balanced probe of one move           */
/* ========================================================================== */

/**
 * Three reference opponents, one per corner of the triangle, each carrying a
 * single move with NO special.
 *
 * That last part matters. A reference foe with `guard` would silently halve
 * every probe; one with `interrupt` or `debuff` would contaminate the
 * measurement with its own mechanical role. `stillwater` (FLEX), `sixseven`
 * (FLOW) and `freeze` (BAIT) are the plain ones.
 */
const REFERENCE_FOES = Object.freeze([
  Object.freeze({ id: 'ref_flex', name: 'Reference FLEX', skill: 0.8, quirk: null, pool: ['stillwater'], drop: null }),
  Object.freeze({ id: 'ref_flow', name: 'Reference FLOW', skill: 0.8, quirk: null, pool: ['sixseven'], drop: null }),
  Object.freeze({ id: 'ref_bait', name: 'Reference BAIT', skill: 0.8, quirk: null, pool: ['freeze'], drop: null })
]);

const SCORING_MODES = ['crowd', 'judges', 'both'];

/**
 * What one move is worth: played once, on its own, clean, at its own ideal
 * amplitude, averaged over all three opponent categories and all three act
 * scoring modes.
 *
 * Round one only — so there is no freshness decay, no combo, no pattern and no
 * chain. This is the move's intrinsic worth with every factor that belongs to
 * the player's PLAN rather than to the MOVE stripped out. It is measured by
 * calling `resolveExchange` once. It is never calculated.
 *
 * Two honest caveats, because the number would mislead without them:
 *
 *  - `finisher` (grimace) is legal at round one, since the meter opens level,
 *    so its x2.1 lands here every time and flatters it. In a real battle it is
 *    legal only inside a +/-15 meter window.
 *  - `hype` (crowdturn) trades score for hype at x0.25. This probe scores the
 *    exchange and cannot see the 100-hype blend the trade paid for, so it
 *    under-rates it by design.
 *
 * Both are annotated in the census rather than silently corrected.
 *
 * @param {string} moveId
 * @param {number} master
 * @returns {{mean:number, byCat:Object, byMode:Object}}
 */
function openingValue(moveId, master) {
  const move = MOVES_BY_ID[moveId];
  const byCat = { FLEX: 0, FLOW: 0, BAIT: 0 };
  const byMode = { crowd: 0, judges: 0, both: 0 };
  let total = 0, core = 0, samples = 0;

  for (let f = 0; f < REFERENCE_FOES.length; f++) {
    const foe = REFERENCE_FOES[f];
    const foeCat = MOVES_BY_ID[foe.pool[0]].cat;
    for (let s = 0; s < SCORING_MODES.length; s++) {
      const mode = SCORING_MODES[s];
      // The player's round-one score is deterministic given (move, band, amp,
      // foe category, scoring mode) — the foe's own dice move the meter, not
      // our score. Three seeds anyway, so a future rule that DOES add noise
      // here shows up as a wobble instead of hiding.
      for (let k = 0; k < 3; k++) {
        const match = createMatch({
          moves: MOVES,
          opponent: foe,
          act: { id: 'probe', name: 'Probe', scoring: mode },
          deck: [moveId],
          seed: seedFor(master, 'probe', moveId, foe.id, mode, k),
          verbose: false
        });
        const turn = resolveExchange(match, { moveId: moveId, band: 'clean', amp: move.idealAmp }).you;
        const v = turn.score;
        // `factors.special` is the engine's OWN published multiplier for the
        // move's special. Dividing by it is not a second scorer — it is reading
        // a number `resolveExchange` returned and normalising by it, so that
        // `core` compares moves on their body rather than on their role.
        const sp = turn.factors.special || 1;
        total += v;
        core += v / sp;
        samples++;
        byCat[foeCat] += v / (SCORING_MODES.length * 3);
        byMode[mode] += v / (REFERENCE_FOES.length * 3);
      }
    }
  }
  return { mean: total / samples, core: core / samples, byCat: byCat, byMode: byMode };
}

/** Middle value of a list. Robust to one outlier the way a mean is not. */
function median(values) {
  const s = values.slice().sort(function (a, b) { return a - b; });
  const n = s.length;
  if (!n) return 0;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}

/* ========================================================================== */
/* ARGUMENTS                                                                  */
/* ========================================================================== */

function parseArgs(argv) {
  const o = {
    battles: 3000,
    seed: 1337,
    workers: Math.max(1, availableParallelism ? availableParallelism() : 2),
    json: false,
    color: process.stdout.isTTY === true,
    fitBattles: 400,
    /* the paired duel-only arm §2 subtracts the farmeo against */
    coldBattles: 600,
    /* the three ownership arms in §6 */
    packBattles: 500,
    farmeo: true,
    packs: true
  };
  let quick = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--quick') { o.battles = 600; quick = true; }
    else if (a === '--json') { o.json = true; o.color = false; }
    else if (a === '--no-color') o.color = false;
    else if (a === '--color') o.color = true;
    else if (a === '--no-farmeo') o.farmeo = false;
    else if (a === '--no-packs') o.packs = false;
    else if (a.indexOf('--battles=') === 0) o.battles = Math.max(1, parseInt(a.slice(10), 10) || 3000);
    else if (a.indexOf('--seed=') === 0) o.seed = (parseInt(a.slice(7), 10) || 0) >>> 0;
    else if (a.indexOf('--workers=') === 0) o.workers = Math.max(1, parseInt(a.slice(10), 10) || 1);
    else if (a.indexOf('--fit-battles=') === 0) o.fitBattles = Math.max(0, parseInt(a.slice(14), 10) || 0);
    else if (a.indexOf('--cold-battles=') === 0) o.coldBattles = Math.max(0, parseInt(a.slice(15), 10) || 0);
    else if (a.indexOf('--pack-battles=') === 0) o.packBattles = Math.max(0, parseInt(a.slice(15), 10) || 0);
  }
  // --quick scales the side sections too, or they end up costing more than the
  // main table they are meant to annotate.
  if (quick) { o.coldBattles = Math.min(o.coldBattles, 200); o.packBattles = Math.min(o.packBattles, 150); }
  if (!o.farmeo) o.coldBattles = 0;   // nothing to subtract; both arms would be the same run
  o.workers = Math.min(o.workers, 16);
  return o;
}

/**
 * Run the job list, on threads when there is more than one to use.
 * Results are aggregated by summation only, so the answer does not depend on
 * how the scheduler happened to interleave them.
 */
async function runAll(jobs, workers) {
  if (workers <= 1 || jobs.length <= 1) return jobs.map(runJob);

  // Round robin, not contiguous blocks: an `expert` matchup costs roughly
  // twice what a `composed` one does, so interleaving keeps the threads even.
  const buckets = [];
  for (let w = 0; w < workers; w++) buckets.push([]);
  for (let i = 0; i < jobs.length; i++) buckets[i % workers].push(jobs[i]);

  const here = fileURLToPath(import.meta.url);
  const filled = buckets.filter(function (b) { return b.length; });

  const results = await Promise.all(filled.map(function (bucket) {
    return new Promise(function (resolve, reject) {
      const w = new Worker(here, { workerData: { jobs: bucket } });
      let done = false;
      w.on('message', function (m) { done = true; resolve(m); });
      w.on('error', reject);
      w.on('exit', function (code) {
        if (!done) reject(new Error('balance-sim worker exited early with code ' + code));
      });
    });
  }));

  const flat = [];
  for (let i = 0; i < results.length; i++) for (let j = 0; j < results[i].length; j++) flat.push(results[i][j]);
  return flat;
}

/* ========================================================================== */
/* FORMATTING                                                                 */
/* ========================================================================== */

let USE_COLOR = false;
const ESC = String.fromCharCode(27) + '[';
const C = {
  reset: ESC + '0m', dim: ESC + '2m', bold: ESC + '1m',
  red: ESC + '31m', green: ESC + '32m', yellow: ESC + '33m', cyan: ESC + '36m'
};
function col(s, c) { return USE_COLOR ? c + s + C.reset : String(s); }
function dim(s) { return col(s, C.dim); }
function bold(s) { return col(s, C.bold); }

function padR(s, n) { s = String(s); return s.length >= n ? s : s + ' '.repeat(n - s.length); }
function padL(s, n) { s = String(s); return s.length >= n ? s : ' '.repeat(n - s.length) + s; }
function pct(x, d) { return (x * 100).toFixed(d === undefined ? 1 : d) + '%'; }
function rule(n) { return dim('-'.repeat(n)); }

function head(title) {
  console.log('');
  console.log(bold(title));
  console.log(rule(Math.max(62, title.length)));
}

/** Colour a win rate by how far it sits from its §14 target. */
function rateColor(rate, targetPct) {
  const s = pct(rate);
  if (targetPct == null) return s;
  const d = Math.abs(rate * 100 - targetPct);
  if (d <= 6) return col(s, C.green);
  if (d <= 15) return col(s, C.yellow);
  return col(s, C.red);
}

/* ========================================================================== */
/* MAIN                                                                       */
/* ========================================================================== */

async function main() {
  const opt = parseArgs(process.argv.slice(2));
  USE_COLOR = opt.color;
  const t0 = Date.now();

  /* ---- 1. build the job list ------------------------------------------ */
  const jobs = [];
  for (let p = 0; p < POLICIES.length; p++) {
    for (let i = 0; i < OPPONENTS.length; i++) {
      jobs.push({
        kind: 'cell', oppIndex: i, policy: POLICIES[p],
        n: opt.battles, master: opt.seed, farmeo: opt.farmeo, own: 'none'
      });
    }
  }
  /* §2's other arm: the same duels, cold, off the same seeds. */
  if (opt.coldBattles > 0) {
    for (let p = 0; p < POLICIES.length; p++) {
      for (let i = 0; i < OPPONENTS.length; i++) {
        jobs.push({
          kind: 'cold', oppIndex: i, policy: POLICIES[p],
          n: opt.coldBattles, master: opt.seed, farmeo: false, own: 'none'
        });
      }
    }
  }
  /* §6: the whole campaign again, once per ownership state. */
  if (opt.packs && opt.packBattles > 0 && PACK_MOVES.length) {
    for (let s = 0; s < OWNERSHIP.length; s++) {
      for (let p = 0; p < POLICIES.length; p++) {
        for (let i = 0; i < OPPONENTS.length; i++) {
          jobs.push({
            kind: 'pack', oppIndex: i, policy: POLICIES[p], own: OWNERSHIP[s].key,
            n: opt.packBattles, master: opt.seed, farmeo: opt.farmeo
          });
        }
      }
    }
  }
  if (opt.fitBattles > 0) {
    for (let a = 0; a < ACTS.length; a++) {
      for (let f = 0; f < FITS.length; f++) {
        jobs.push({ kind: 'fit', actIndex: a, fitIndex: f, n: opt.fitBattles, master: opt.seed });
      }
    }
  }

  /* ---- 2. the probe (main thread, deterministic, near free) ------------ */
  // Base library only: the census describes the game as it ships. Ownership is
  // §6's subject and it is not allowed to leak into any other table.
  applyOwnership('none');
  const opening = Object.create(null);
  for (let i = 0; i < MOVES.length; i++) opening[MOVES[i].id] = openingValue(MOVES[i].id, opt.seed);
  const baseMoves = MOVES.slice();

  /* ---- 3. the battles -------------------------------------------------- */
  const raw = await runAll(jobs, opt.workers);
  const elapsed = Date.now() - t0;

  /* Every fight that was actually played, main table and side arms alike. The
     header used to count only the main table and the fits, which understated a
     full run by about 40%. */
  opt.totalFights = raw.reduce(function (t, r) { return t + (r.n || 0); }, 0);

  // Single-threaded runs execute the jobs right here, so the library could be
  // sitting on `maxed` by now. Everything below reports the base game.
  applyOwnership('none');

  const cells = raw.filter(function (r) { return r.kind === 'cell'; });
  const coldCells = raw.filter(function (r) { return r.kind === 'cold'; });
  const packCells = raw.filter(function (r) { return r.kind === 'pack'; });
  const fitRuns = raw.filter(function (r) { return r.kind === 'fit'; });

  /* ---- 4. aggregate ---------------------------------------------------- */
  function blankAgg() {
    return {
      n: 0, wins: 0, losses: 0, draws: 0, meterSum: 0, youSum: 0, themSum: 0,
      turns: 0, distinctSum: 0, scoreSum: 0,
      bands: { perfect: 0, clean: 0, shaky: 0, whiff: 0 },
      blendTurns: 0, blendSplitSum: 0, patternTurns: 0,
      finisherFired: 0, finisherEarly: 0,
      qRuns: 0, qBands: emptyBands(), qRatioSum: 0, qAuraSum: 0,
      qPassed: 0, qTurns: 0, meterStartSum: 0,
      plays: emptyCounts(), playScore: emptyCounts(), winPlays: emptyCounts(),
      availBattles: emptyCounts(), availTurns: emptyCounts()
    };
  }
  function slot(root, a, b) {
    if (!root[a]) root[a] = Object.create(null);
    if (!root[a][b]) root[a][b] = blankAgg();
    return root[a][b];
  }
  function absorb(agg, cell) {
    agg.n += cell.n; agg.wins += cell.wins; agg.losses += cell.losses; agg.draws += cell.draws;
    agg.meterSum += cell.meterSum; agg.youSum += cell.youSum; agg.themSum += cell.themSum;
    agg.turns += cell.turns; agg.distinctSum += cell.distinctSum; agg.scoreSum += cell.scoreSum;
    agg.bands.perfect += cell.bands.perfect; agg.bands.clean += cell.bands.clean;
    agg.bands.shaky += cell.bands.shaky; agg.bands.whiff += cell.bands.whiff;
    agg.blendTurns += cell.blendTurns; agg.blendSplitSum += cell.blendSplitSum;
    agg.patternTurns += cell.patternTurns;
    agg.finisherFired += cell.finisherFired; agg.finisherEarly += cell.finisherEarly;
    agg.qRuns += cell.qRuns; agg.qRatioSum += cell.qRatioSum; agg.qAuraSum += cell.qAuraSum;
    agg.qPassed += cell.qPassed; agg.qTurns += cell.qTurns; agg.meterStartSum += cell.meterStartSum;
    for (const k in cell.qBands) agg.qBands[k] += cell.qBands[k];
    mergeCounts(agg.plays, cell.plays);
    mergeCounts(agg.playScore, cell.playScore);
    mergeCounts(agg.winPlays, cell.winPlays);
    // Availability, so a low pick rate can be told apart from never having
    // owned the move in the first place.
    for (let i = 0; i < cell.deck.length; i++) {
      bump(agg.availBattles, cell.deck[i], cell.n);
      bump(agg.availTurns, cell.deck[i], cell.turns);
    }
  }

  const byActPolicy = Object.create(null);
  const byOppPolicy = Object.create(null);
  const byQuirkPolicy = Object.create(null);
  const byPolicy = Object.create(null);

  for (let i = 0; i < cells.length; i++) {
    const c = cells[i];
    const opp = OPPONENTS[c.oppIndex];
    absorb(slot(byActPolicy, c.actId, c.policy), c);
    absorb(slot(byOppPolicy, c.oppId, c.policy), c);
    absorb(slot(byQuirkPolicy, opp.quirk || 'none', c.policy), c);
    if (!byPolicy[c.policy]) byPolicy[c.policy] = blankAgg();
    absorb(byPolicy[c.policy], c);
  }

  const rate = function (a) { return a && a.n ? a.wins / a.n : 0; };

  /* ---- 4b. the cold arm: the same duels with no farmeo in front of them - */
  const coldByActPolicy = Object.create(null);
  const coldByPolicy = Object.create(null);
  for (let i = 0; i < coldCells.length; i++) {
    const c = coldCells[i];
    absorb(slot(coldByActPolicy, c.actId, c.policy), c);
    if (!coldByPolicy[c.policy]) coldByPolicy[c.policy] = blankAgg();
    absorb(coldByPolicy[c.policy], c);
  }

  /* ---- 4c. the ownership arms ------------------------------------------ */
  /* own -> actId -> policy, and own -> policy. The second one carries the play
     counts §6 reads to say WHICH pack move the expert reached for. */
  const packByOwnActPolicy = Object.create(null);
  const packByOwnPolicy = Object.create(null);
  for (let i = 0; i < packCells.length; i++) {
    const c = packCells[i];
    if (!packByOwnActPolicy[c.own]) packByOwnActPolicy[c.own] = Object.create(null);
    absorb(slot(packByOwnActPolicy[c.own], c.actId, c.policy), c);
    absorb(slot(packByOwnPolicy, c.own, c.policy), c);
  }

  /* ---- 5. the per-move census, built once and used by both outputs ----- */
  /**
   * The yardstick a move is judged against is the MEDIAN of its own category's
   * special-free opening value, not the best of it.
   *
   * Two reasons, both learned the hard way on the first run of this file:
   *  - Against the best, `grimace` sets the FLEX bar with a x2.1 finisher that
   *    is only legal near a level meter, and every honest FLEX move reads as
   *    "34% of category best" and gets called dominated. That was a false
   *    positive produced entirely by the yardstick.
   *  - A category's spread of base scores (56 to 78 in FLEX) is deliberate
   *    design, so the best move being better is not evidence of anything.
   * A median is robust to exactly one loud outlier, which is what a finisher is.
   */
  const catMedian = { FLEX: 0, FLOW: 0, BAIT: 0 };
  for (const cat in catMedian) {
    catMedian[cat] = median(MOVES.filter(function (m) { return m.cat === cat; })
      .map(function (m) { return opening[m.id].core; }));
  }

  const census = MOVES.map(function (m) {
    const row = {
      id: m.id, name: m.name, cat: m.cat, tier: m.tier, base: m.base,
      idealAmp: m.idealAmp, special: m.special || null,
      open: opening[m.id].mean,
      core: opening[m.id].core,
      catRatio: opening[m.id].core / (catMedian[m.cat] || 1),
      catMedian: catMedian[m.cat],
      openByCat: opening[m.id].byCat,
      openByMode: opening[m.id].byMode,
      pick: Object.create(null), plays: Object.create(null),
      availTurns: Object.create(null), score: Object.create(null),
      winWhenPlayed: Object.create(null)
    };
    for (let p = 0; p < POLICIES.length; p++) {
      const pol = POLICIES[p];
      const a = byPolicy[pol];
      const av = a.availTurns[m.id] || 0;
      const pl = a.plays[m.id] || 0;
      row.availTurns[pol] = av;
      row.plays[pol] = pl;
      row.pick[pol] = av > 0 ? pl / av : 0;
      row.score[pol] = pl > 0 ? (a.playScore[m.id] || 0) / pl : 0;
      row.winWhenPlayed[pol] = pl > 0 ? (a.winPlays[m.id] || 0) / pl : 0;
    }
    return row;
  });

  const actRates = Object.create(null);
  for (let a = 0; a < ACTS.length; a++) {
    actRates[ACTS[a].id] = Object.create(null);
    for (let p = 0; p < POLICIES.length; p++) {
      actRates[ACTS[a].id][POLICIES[p]] = rate(byActPolicy[ACTS[a].id][POLICIES[p]]);
    }
  }

  /* ---- 6. the two structural sections, bundled ------------------------- */
  const farmeo = {
    on: opt.farmeo,
    byActPolicy: byActPolicy,          // the qBands counters ride along in here
    byPolicy: byPolicy,
    coldByActPolicy: coldByActPolicy,
    coldByPolicy: coldByPolicy,
    coldN: opt.coldBattles
  };
  const packs = {
    on: packCells.length > 0,
    states: OWNERSHIP,
    byOwnActPolicy: packByOwnActPolicy,
    byOwnPolicy: packByOwnPolicy,
    n: opt.packBattles,
    moveIds: PACK_ALL_MOVE_IDS
  };

  const findings = buildFindings(actRates, byActPolicy, byPolicy, byQuirkPolicy, census, farmeo, packs);

  if (opt.json) {
    printJson(opt, elapsed, byActPolicy, byOppPolicy, byPolicy, census, fitRuns, findings, rate, farmeo, packs);
    return;
  }

  printReport(opt, elapsed, cells, fitRuns, actRates, byOppPolicy, byPolicy, census, findings, rate, farmeo, packs);
}

/* ========================================================================== */
/* FINDINGS — the whole reason this suite exists                              */
/* ========================================================================== */

/**
 * Everything here is an OBSERVATION with a named threshold attached. None of it
 * changes the exit code. A finding is written so a designer can disagree with
 * it on the evidence rather than on the verdict.
 */
function buildFindings(actRates, byActPolicy, byPolicy, byQuirkPolicy, census, farmeo, packs) {
  const out = [];
  const add = function (severity, key, text) { out.push({ severity: severity, key: key, text: text }); };
  const rate = function (a) { return a && a.n ? a.wins / a.n : 0; };

  /* -- EL FARMEO. Who does the qualifying stage actually pay? ------------ */
  if (farmeo && farmeo.on) {
    const ladder = [];
    let topHeavy = null;
    for (let p = 0; p < POLICIES.length; p++) {
      const pol = POLICIES[p];
      const a = farmeo.byPolicy[pol];
      if (!a || !a.qRuns) continue;
      const top = a.qBands.straight / a.qRuns;
      ladder.push({ pol: pol, top: top, meter: a.meterStartSum / a.qRuns, ratio: a.qRatioSum / a.qRuns });
      if (pol === 'expert' && top >= FLAG.farmeoTopBand) topHeavy = top;
    }
    add('note', 'farmeo-ladder',
      'EL FARMEO — mean opening meter bought, and how often the top band landed:\n     ' +
      ladder.map(function (r) {
        return padR(r.pol, 10) + 'meter ' + r.meter.toFixed(1) + '   top band ' + padL(pct(r.top, 0), 5) +
          '   mean ' + r.ratio.toFixed(2) + 'x the bar';
      }).join('\n     ') +
      '\n     A duel opens at 50. Everything above that line was bought alone, before anybody stood opposite.');

    if (topHeavy != null) {
      add('high', 'farmeo-bar',
        'THE QUALIFYING BAR IS NOT A BAR FOR AN EXPERT — it clears the top band ' + pct(topHeavy, 0) +
        ' of the time, so the best policy in the game is handed the best opening meter almost every fight,\n     ' +
        'while the policies that could use the help land under it. A stage that pays out in proportion to how\n     ' +
        'little you needed it widens the skill ladder instead of teaching it. The bar lives in\n     ' +
        '`battle.js` TUNING.qualify (skillFloor/skillGain and the band `at` fractions), not in scoring.js.');
    }

    /* What the whole stage COST each policy, measured against the same duels. */
    if (farmeo.coldN > 0) {
      const rows = [];
      for (let p = 0; p < POLICIES.length; p++) {
        const pol = POLICIES[p];
        const hot = rate(farmeo.byPolicy[pol]);
        const cold = rate(farmeo.coldByPolicy[pol]);
        rows.push({ pol: pol, hot: hot, cold: cold, d: (hot - cold) * 100 });
      }
      const gainers = rows.filter(function (r) { return r.d > 0; }).map(function (r) { return r.pol; });
      add(rows.length && rows[rows.length - 1].d > 0 && rows[0].d < 0 ? 'high' : 'note', 'farmeo-cost',
        'WHAT THE TWO-STAGE FORMAT DID to each policy, against the same duels played cold:\n     ' +
        rows.map(function (r) {
          return padR(r.pol, 10) + 'duel only ' + padL(pct(r.cold), 6) + '   two-stage ' + padL(pct(r.hot), 6) +
            '   ' + padL((r.d >= 0 ? '+' : '') + r.d.toFixed(1) + 'pp', 8);
        }).join('\n     ') +
        (gainers.length ? '\n     The farmeo is a net gain only for: ' + gainers.join(', ') + '.' : '') +
        '\n     Cold arm is a paired run — same duel seeds, the farmeo is the only thing added.');
    }
  } else if (farmeo) {
    add('note', 'farmeo-off',
      'EL FARMEO IS SWITCHED OFF for this run (--no-farmeo), so the table above is the duel-only game and it is\n     ' +
      'not the game anybody plays. Use it for A/B work, never for README.');
  }

  /* -- moves nobody ever plays ------------------------------------------ */
  const neverChosen = census.filter(function (r) {
    let av = 0, pl = 0;
    for (let p = 0; p < POLICIES.length; p++) { av += r.availTurns[POLICIES[p]]; pl += r.plays[POLICIES[p]]; }
    return av >= FLAG.minAvailTurns && pl === 0;
  });
  if (neverChosen.length) {
    add('high', 'never-chosen',
      'NEVER CHOSEN — sat in the deck and was never played by any of the four policies: ' +
      neverChosen.map(function (r) { return r.id; }).join(', ') +
      '\n     A move nobody can reach is content the player paid for and never sees.');
  } else {
    add('ok', 'never-chosen', 'Every move in the library gets played by at least one policy.');
  }

  /* -- dominated vs merely shadowed -------------------------------------- */
  /* `expert` is the only value-maximising policy in the sim, so it is the only
     one whose silence about a move carries information. masher picks by base
     score, varied and composed pick uniformly from what is fresh — none of
     those three is an opinion about quality. */
  const dominated = [], shadowed = [];
  for (let i = 0; i < census.length; i++) {
    const r = census[i];
    if (r.availTurns.expert < FLAG.minAvailTurns) continue;   // never really owned it
    if (r.pick.expert >= FLAG.expertPick) continue;           // expert does pick it
    if (r.special === 'finisher') continue;                   // legality-gated, not value-gated
    (r.catRatio < FLAG.dominatedRatio ? dominated : shadowed).push(r);
  }
  const domLine = function (r) {
    let s = padR(r.id, 12) + padR(r.cat, 6) + 'core ' + padL(Math.round(r.core), 5) +
      ' = ' + padL(pct(r.catRatio, 0), 5) + ' of category median   expert ' + padL(pct(r.pick.expert, 2), 6);
    if (r.special === 'hype') {
      s += '\n                 `hype` trades score for hype at x0.25, and passive hype already funds every blend\n' +
        '                 the expert wants. The special is redundant rather than the move being weak — do not\n' +
        '                 answer this by raising its base.';
    } else if (r.special) {
      s += '   special: ' + r.special;
    }
    return s;
  };
  if (dominated.length) {
    add('high', 'dominated',
      'STRICTLY DOMINATED — the value-maximising policy never picks these, AND their special-free value is under ' +
      pct(FLAG.dominatedRatio, 0) + ' of the median move in their own category. No board state makes them the right answer:\n     ' +
      dominated.map(domLine).join('\n     '));
  } else {
    add('ok', 'dominated',
      'No strictly dominated move: every move the expert skips still carries competitive value for its category.');
  }
  if (shadowed.length) {
    add('note', 'shadowed',
      'SHADOWED — expert almost never picks these, but their raw value is healthy. Something else is a shade better every single turn. That is a deck-diversity problem, not a dead move:\n     ' +
      shadowed.map(domLine).join('\n     '));
  }

  /* -- difficulty curve running backwards -------------------------------- */
  /* Standard error of one rate, and of the difference between two independent
     ones. Written out rather than inlined because the whole point of this test
     is that the threshold has to move with the rate. */
  const seOf = function (agg) {
    if (!agg || !agg.n) return 0;
    const r = agg.wins / agg.n;
    return Math.sqrt(Math.max(r * (1 - r), 1e-9) / agg.n);
  };
  const backwards = [];
  for (let p = 0; p < POLICIES.length; p++) {
    const pol = POLICIES[p];
    for (let a = 1; a < ACTS.length; a++) {
      const prevAgg = byActPolicy[ACTS[a - 1].id][pol];
      const curAgg = byActPolicy[ACTS[a].id][pol];
      const prev = actRates[ACTS[a - 1].id][pol];
      const cur = actRates[ACTS[a].id][pol];
      const gain = (cur - prev) * 100;
      const sigma = Math.sqrt(Math.pow(seOf(prevAgg), 2) + Math.pow(seOf(curAgg), 2)) * 100;
      if (gain > FLAG.backwardsPP && gain > FLAG.backwardsSigma * sigma) {
        backwards.push(padR(pol, 10) + padR(ACTS[a - 1].name, 18) + padL(pct(prev), 7) +
          '  ->  ' + padR(ACTS[a].name, 18) + padL(pct(cur), 7) + '   (+' + gain.toFixed(1) +
          'pp easier, ' + (sigma > 0 ? (gain / sigma).toFixed(1) : '∞') + ' sigma)');
      }
    }
  }
  if (backwards.length) {
    add('high', 'backwards-curve',
      'DIFFICULTY CURVE RUNS BACKWARDS — a later act is measurably easier than the one before it:\n     ' +
      backwards.join('\n     '));
  } else {
    add('ok', 'backwards-curve',
      'Difficulty curve is monotonic for all four policies — every act is harder than the one before it.');
  }

  /* -- the §14 target curve is itself non-monotonic ----------------------- */
  const targetSteps = [];
  for (let p = 0; p < POLICIES.length; p++) {
    const pol = POLICIES[p];
    for (let a = 1; a < ACTS.length; a++) {
      const prev = TARGETS[ACTS[a - 1].id][pol], cur = TARGETS[ACTS[a].id][pol];
      if (cur > prev) {
        targetSteps.push(padR(pol, 10) + padR(ACTS[a - 1].name, 18) + padL(prev + '%', 6) +
          '  ->  ' + padR(ACTS[a].name, 18) + padL(cur + '%', 6));
      }
    }
  }
  if (targetSteps.length) {
    add('note', 'target-curve',
      'The §14 TARGET table is itself non-monotonic at these points, so a step up here is design intent, not a bug to chase out of the engine:\n     ' +
      targetSteps.join('\n     '));
  }

  /* -- pinned at an extreme where the target says otherwise --------------- */
  const pinned = [];
  for (let a = 0; a < ACTS.length; a++) {
    for (let p = 0; p < POLICIES.length; p++) {
      const pol = POLICIES[p], actId = ACTS[a].id;
      const r = actRates[actId][pol], t = TARGETS[actId][pol];
      if (r > FLAG.ceiling && t <= FLAG.ceiling * 100) {
        pinned.push(padR(pol, 10) + padR(ACTS[a].name, 18) + padL(pct(r), 7) +
          '   above the ' + pct(FLAG.ceiling, 0) + ' ceiling; target ' + t + '%');
      }
      if (r < FLAG.floor && t >= FLAG.floor * 100) {
        pinned.push(padR(pol, 10) + padR(ACTS[a].name, 18) + padL(pct(r), 7) +
          '   below the ' + pct(FLAG.floor, 0) + ' floor; target ' + t + '%');
      }
    }
  }
  if (pinned.length) {
    add('high', 'pinned', 'PINNED AT AN EXTREME where the target says otherwise:\n     ' + pinned.join('\n     '));
  } else {
    add('ok', 'pinned', 'No policy is pinned at the ceiling or the floor against the design intent.');
  }

  /* -- the masher. Losing is the correct answer, and it has to be checked - */
  const masherActs = ACTS.map(function (a) { return { act: a.name, r: actRates[a.id].masher }; });
  const masherBest = masherActs.slice().sort(function (x, y) { return y.r - x.r; })[0];
  if (masherBest.r < FLAG.masherAlarm) {
    add('ok', 'masher',
      'THE MASHER LOSES EVERYWHERE. Its best act is ' + masherBest.act + ' at ' + pct(masherBest.r) +
      ', under the ' + pct(FLAG.masherAlarm, 0) + ' alarm line.\n     ' +
      'That is CORRECT, not a bug: freshness is the mechanical form of the verified win condition — ' +
      'competitors have to reference as many different memes as possible — so repeating yourself has to lose.\n     ' +
      '     ' + masherActs.map(function (m) { return m.act + ' ' + pct(m.r); }).join(' · '));
  } else {
    add('high', 'masher',
      'THE MASHER IS WINNING. Its best act is ' + masherBest.act + ' at ' + pct(masherBest.r) +
      ', over the ' + pct(FLAG.masherAlarm, 0) + ' alarm line.\n     ' +
      'That contradicts the verified win condition — freshness is not biting hard enough.\n     ' +
      '     ' + masherActs.map(function (m) { return m.act + ' ' + pct(m.r); }).join(' · '));
  }
  {
    const a = byPolicy.masher;
    let top = null, topN = 0;
    for (const id in a.plays) if (a.plays[id] > topN) { topN = a.plays[id]; top = id; }
    add('note', 'masher-spread',
      'The masher spends ' + pct(topN / a.turns) + ' of its turns on `' + top + '` and uses ' +
      (a.distinctSum / a.n).toFixed(2) + ' distinct moves a battle, against ' +
      (byPolicy.expert.distinctSum / byPolicy.expert.n).toFixed(2) + ' for expert and ' +
      (byPolicy.composed.distinctSum / byPolicy.composed.n).toFixed(2) + ' for composed.');
  }

  /* -- do the four policies actually separate? ---------------------------- */
  /* Four policies that all land on the same win rate would mean the skills
     they model are not skills. §14 wants a wide, ordered ladder. */
  {
    const rows = [];
    for (let a = 0; a < ACTS.length; a++) {
      const id = ACTS[a].id;
      for (let p = 1; p < POLICIES.length; p++) {
        const lo = POLICIES[p - 1], hi = POLICIES[p];
        const actual = (actRates[id][hi] - actRates[id][lo]) * 100;
        const intent = TARGETS[id][hi] - TARGETS[id][lo];
        rows.push({ act: ACTS[a].name, pair: lo + ' -> ' + hi, actual: actual, intent: intent, gap: actual - intent });
      }
    }
    const inverted = rows.filter(function (r) { return r.actual < -FLAG.backwardsPP; });
    const flat = rows.filter(function (r) { return r.intent >= 8 && r.actual < r.intent * 0.4; });
    if (inverted.length) {
      add('high', 'policy-order',
        'POLICY LADDER OUT OF ORDER — a policy that should be better is worse:\n     ' +
        inverted.map(function (r) {
          return padR(r.act, 18) + padR(r.pair, 22) + padL(r.actual.toFixed(1) + 'pp', 8) + '   intent ' + r.intent + 'pp';
        }).join('\n     '));
    }
    if (flat.length) {
      add('high', 'policy-separation',
        'POLICIES DO NOT SEPARATE — the step between two neighbouring skill levels is under 40% of the intended gap. The skill that step models is barely paying:\n     ' +
        flat.map(function (r) {
          return padR(r.act, 18) + padR(r.pair, 22) + 'actual ' + padL(r.actual.toFixed(1) + 'pp', 7) +
            '   intent ' + padL(r.intent + 'pp', 6);
        }).join('\n     ') +
        '\n     Worth knowing before reading the above: three of the four policies use uniform random\n' +
        '     timing (a flat 25% each of perfect/clean/shaky/whiff), so composed differs from varied\n' +
        '     only by amplitude discipline and a stricter no-repeat rule. If composure is not paying,\n' +
        '     it shows up exactly here.');
    }
    if (!inverted.length && !flat.length) {
      add('ok', 'policy-separation',
        'The four policies separate in the intended order, and every step is at least 40% of its intended size.');
    }
  }

  /* -- is one corner of the triangle carrying the whole game? ------------- */
  {
    const catAgg = { FLEX: { plays: 0, score: 0 }, FLOW: { plays: 0, score: 0 }, BAIT: { plays: 0, score: 0 } };
    for (let i = 0; i < census.length; i++) {
      const r = census[i];
      catAgg[r.cat].plays += r.plays.expert;
      catAgg[r.cat].score += r.plays.expert * r.score.expert;
    }
    const turns = byPolicy.expert.turns || 1;
    add('note', 'triangle',
      'Triangle usage by expert — ' + ['FLEX', 'FLOW', 'BAIT'].map(function (c) {
        return c + ' ' + pct(catAgg[c].plays / turns, 0) + ' of turns @ ' +
          Math.round(catAgg[c].score / (catAgg[c].plays || 1)) + ' aura';
      }).join('  ·  ') + '\n     A corner far under a third of turns is a corner the triangle is not really using.');
  }

  /* -- quirks. A quirk that changes nothing is decoration ----------------- */
  {
    const rows = [];
    for (const q in byQuirkPolicy) {
      const a = byQuirkPolicy[q].expert;
      if (a) rows.push({ q: q, r: rate(a) });
    }
    rows.sort(function (x, y) { return x.r - y.r; });
    add('note', 'quirks',
      'Opponent quirks vs expert, hardest first — ' +
      rows.map(function (r) { return r.q + ' ' + pct(r.r); }).join('  ·  ') +
      '\n     Skill differs between these opponents too, so read this as a smell test, not a controlled measurement.');
  }

  /* -- finisher legality -------------------------------------------------- */
  {
    const a = byPolicy.expert;
    const attempts = a.finisherFired + a.finisherEarly;
    add('note', 'finisher',
      'Finisher window: expert threw a finisher ' + attempts.toLocaleString('en-US') + ' times and ' +
      (attempts ? pct(a.finisherFired / attempts, 0) : '0%') +
      ' of those were inside the meter window.\n     A low pick rate on `grimace` is legality, not weakness — which is why it is excluded from the dominance test above.');
  }

  /* -- PACKS. Range, or power? ------------------------------------------- */
  if (packs && packs.on) {
    const worst = [];
    const overall = [];
    for (let s = 1; s < packs.states.length; s++) {
      const key = packs.states[s].key;
      for (let p = 0; p < POLICIES.length; p++) {
        const pol = POLICIES[p];
        const d = (rate(packs.byOwnPolicy[key][pol]) - rate(packs.byOwnPolicy.none[pol])) * 100;
        overall.push({ own: key, pol: pol, d: d });
        for (let a = 0; a < ACTS.length; a++) {
          const id = ACTS[a].id;
          const da = (rate(packs.byOwnActPolicy[key][id][pol]) - rate(packs.byOwnActPolicy.none[id][pol])) * 100;
          if (da >= FLAG.packEdgePP) worst.push({ own: key, pol: pol, act: ACTS[a].name, d: da });
        }
      }
    }
    worst.sort(function (x, y) { return y.d - x.d; });

    if (worst.length) {
      /* Which pack moves the value-maximising policy actually reached for.
         A pack that only added range would show its moves being SUBSTITUTED
         in at roughly the rate the base moves they replaced were played. */
      const a = packs.byOwnPolicy.maxed && packs.byOwnPolicy.maxed.expert;
      let picks = '';
      if (a && a.turns) {
        const rows = packs.moveIds.map(function (id) {
          return { id: id, share: (a.plays[id] || 0) / a.turns };
        }).filter(function (r) { return r.share > 0.01; })
          .sort(function (x, y) { return y.share - x.share; }).slice(0, 6);
        if (rows.length) {
          picks = '\n     The expert spent its turns on: ' +
            rows.map(function (r) { return r.id + ' ' + pct(r.share, 1); }).join(' · ') +
            '\n     Compare that against the base move it displaced. A pack move at the top of this list is not range.';
        }
      }
      add('high', 'pay-to-win',
        'PAY TO WIN — owning a pack measurably RAISES win rate, which `src/data/packs.js` rule 2 forbids in terms\n     ' +
        '("a pack adds range, never power"). Every cell over the ' + FLAG.packEdgePP.toFixed(1) +
        'pp line, worst first:\n     ' +
        worst.slice(0, 12).map(function (r) {
          return padR(r.own, 8) + padR(r.pol, 10) + padR(r.act, 18) + padL('+' + r.d.toFixed(1) + 'pp', 8);
        }).join('\n     ') +
        (worst.length > 12 ? '\n     … and ' + (worst.length - 12) + ' more.' : '') +
        picks +
        '\n     This is not fixable in scoring.js: a multiplier that pulled these moves down would pull the base\n     ' +
        'moves that share their category and special down with them. It is a `packs.js` data question —\n     ' +
        'a pack move that duplicates a base move\'s ROLE (a second finisher, a second persist) hands the\n     ' +
        'value-maximiser a strictly better answer to a board state the base game had exactly one answer to.');
    } else {
      add('ok', 'pay-to-win',
        'PACKS ADD RANGE, NOT POWER. No ownership state raises win rate by more than ' +
        FLAG.packEdgePP.toFixed(1) + 'pp in any act for any policy.\n     ' +
        'Biggest edge measured: ' +
        overall.sort(function (x, y) { return y.d - x.d; }).slice(0, 1).map(function (r) {
          return r.own + '/' + r.pol + ' ' + (r.d >= 0 ? '+' : '') + r.d.toFixed(1) + 'pp overall';
        }).join('') + '.');
    }
  }

  /* -- `packs.js` rule 1: the base game has to stand on its own ----------- */
  /* Outside the pack block on purpose — this is a claim about the base twenty-
     seven, so it has to be checked on runs that never load a pack at all. */
  {
    const unwinnable = [];
    for (let a = 0; a < ACTS.length; a++) {
      const id = ACTS[a].id;
      if (actRates[id].composed <= 0.02) unwinnable.push(ACTS[a].name);
    }
    if (unwinnable.length) {
      add('high', 'base-complete',
        'THE BASE GAME IS NOT COMPLETE — with no pack owned, a composed player is under 2% in: ' +
        unwinnable.join(', ') + '. `packs.js` rule 1 says the base twenty-seven stay a winnable game on their own.');
    } else {
      add('ok', 'base-complete',
        'The base twenty-seven remain a complete, winnable game: every act is beatable with nothing owned.');
    }
  }

  /* -- blend health ------------------------------------------------------- */
  {
    const a = byPolicy.expert;
    if (a.blendTurns > 0) {
      add('note', 'blend',
        'Blend: expert blended on ' + pct(a.blendTurns / a.turns) + ' of turns at a mean split quality of ' +
        (a.blendSplitSum / a.blendTurns).toFixed(2) +
        ' (1.00 is a true upper/lower split, 0.00 is a stack).\n     §5 requires a genuine split to beat a stack, and the expert policy is only ever offered the best pair it can find.');
    } else {
      add('high', 'blend',
        'Blend was NEVER used by the expert policy in any battle. Either 100 hype is unreachable inside nine rounds, or no pair in the deck clears the split threshold. Either way a whole mechanic is inert.');
    }
  }

  return out;
}

/* ========================================================================== */
/* THE REPORT                                                                 */
/* ========================================================================== */

function printReport(opt, elapsed, cells, fitRuns, actRates, byOppPolicy, byPolicy, census, findings, rate, farmeo, packs) {
  const totalBattles = opt.totalFights ||
    (cells.reduce(function (s, c) { return s + c.n; }, 0) +
      fitRuns.reduce(function (s, c) { return s + c.n; }, 0));

  console.log('');
  console.log(bold('AURA OFF — BALANCE SIMULATION'));
  console.log(rule(78));
  console.log('Engine     ' + dim('resolveExchange() via simulateBattle() — no turn rule is re-implemented here'));
  console.log('Fights     ' + totalBattles.toLocaleString('en-US') + '   (' +
    opt.battles.toLocaleString('en-US') + ' per policy x opponent matchup in the main table, ' +
    '25 opponents, 4 policies;\n           ' +
    dim('the rest is the paired cold arm in §2, the three ownership arms in §6 and the fit run in §8') + ')');
  console.log('Seed       ' + opt.seed + dim('   deterministic — same seed, same table, any thread count'));
  console.log('Threads    ' + opt.workers);
  console.log('Elapsed    ' + (elapsed / 1000).toFixed(1) + 's');
  console.log('Deck       ' + dim('campaign-realistic — you carry only what you have already won'));
  console.log('Stages     ' + (farmeo && farmeo.on
    ? dim('EL FARMEO then the duel — the qualifying stage and its cost are inside every rate below')
    : col('DUELS ONLY — --no-farmeo, so this is not the shipping format', C.yellow)));
  console.log('Owned      ' + dim('nothing. The main table is always the base twenty-seven; ownership is §6'));
  console.log('Fit        ' + dim('none in the main table; fits get their own controlled run in §8'));

  /* -- 1 ---------------------------------------------------------------- */
  head('1. WIN RATE BY ACT BY POLICY      actual  ' + dim('/ §14 target'));
  console.log(padR('Act', 20) + POLICIES.map(function (p) { return padL(p, 17); }).join(''));
  console.log(rule(20 + 17 * POLICIES.length));
  for (let a = 0; a < ACTS.length; a++) {
    const act = ACTS[a];
    let line = padR(act.name, 20);
    for (let p = 0; p < POLICIES.length; p++) {
      const pol = POLICIES[p];
      const r = actRates[act.id][pol];
      const tgt = TARGETS[act.id][pol];
      const cell = padL(pct(r), 6) + dim(' / ' + padL(tgt + '%', 4));
      line += padL('', 17 - 13) + rateColorWrap(cell, r, tgt);
    }
    console.log(line);
  }
  console.log(rule(20 + 17 * POLICIES.length));
  let allLine = padR('ALL 25 OPPONENTS', 20);
  for (let p = 0; p < POLICIES.length; p++) allLine += padL(pct(rate(byPolicy[POLICIES[p]])), 17);
  console.log(allLine);
  console.log(dim('  green: within 6pp of the §14 target · yellow: within 15pp · red: further.'));
  console.log(dim('  §14 is a target, not a gate. The real numbers are the real numbers.'));

  /* -- 2 ---------------------------------------------------------------- */
  if (farmeo && farmeo.on) {
    head('2. EL FARMEO — the solo stage, and what it costs');
    console.log(padR('Policy', 11) + padR('Act', 20) +
      QUALIFY_KEYS.map(function (k) { return padL(k, 10); }).join('') +
      padL('meter', 8) + padL('x bar', 8) + padL('cold', 8) + padL('two-stage', 11) + padL('delta', 8));
    console.log(rule(11 + 20 + 10 * QUALIFY_KEYS.length + 43));
    for (let p = 0; p < POLICIES.length; p++) {
      const pol = POLICIES[p];
      for (let a = 0; a < ACTS.length; a++) {
        const act = ACTS[a];
        const agg = farmeo.byActPolicy[act.id][pol];
        const cold = farmeo.coldByActPolicy[act.id] && farmeo.coldByActPolicy[act.id][pol];
        const q = agg.qRuns || 1;
        let line = padR(a === 0 ? pol : '', 11) + padR(act.name, 20);
        for (let k = 0; k < QUALIFY_KEYS.length; k++) line += padL(pct(agg.qBands[QUALIFY_KEYS[k]] / q, 0), 10);
        line += padL((agg.meterStartSum / q).toFixed(1), 8) + padL((agg.qRatioSum / q).toFixed(2), 8);
        if (cold && cold.n) {
          const d = (rate(agg) - rate(cold)) * 100;
          line += padL(pct(rate(cold)), 8) + padL(pct(rate(agg)), 11) +
            padL((d >= 0 ? '+' : '') + d.toFixed(1) + 'pp', 8);
        } else {
          line += padL('-', 8) + padL(pct(rate(agg)), 11) + padL('-', 8);
        }
        console.log(line);
      }
      if (p < POLICIES.length - 1) console.log(rule(11 + 20 + 10 * QUALIFY_KEYS.length + 43));
    }
    console.log(dim('  ' + QUALIFY_KEYS.map(function (k) {
      return k + ' = ' + (QUALIFY_BANDS[k] ? QUALIFY_BANDS[k].label.toLowerCase() : k);
    }).join(' · ')));
    console.log(dim('  The four band columns are where the solo stage landed. `meter` is the opening meter it bought;'));
    console.log(dim('  a duel with no farmeo in front of it opens at 50.0, so anything above that is a head start.'));
    console.log(dim('  `cold` is the SAME duels off the SAME seeds with the stage removed — the delta is what the'));
    console.log(dim('  two-stage format did to that policy, and nothing else changed to produce it.'));
    if (OPPONENTS.some(function (o) { return o.qualify === false; })) {
      console.log(dim('  Chispa declares `qualify: false`, so the first fight of a run has no farmeo. Her battles sit in'));
      console.log(dim('  the Plaza row with no band, which is why the Plaza band columns do not sum to 100%.'));
    }
  }

  /* -- 3 ---------------------------------------------------------------- */
  head('3. HOW EACH POLICY ACTUALLY PLAYED');
  console.log(padR('Policy', 11) + padL('win', 7) + padL('draw', 7) + padL('meter', 8) +
    padL('your aura', 12) + padL('their aura', 12) + padL('distinct', 10) +
    padL('perfect', 9) + padL('whiff', 8) + padL('blend', 8) + padL('pattern', 9));
  console.log(rule(101));
  for (let p = 0; p < POLICIES.length; p++) {
    const pol = POLICIES[p];
    const a = byPolicy[pol];
    console.log(
      padR(pol, 11) +
      padL(pct(rate(a)), 7) +
      padL(pct(a.draws / a.n), 7) +
      padL((a.meterSum / a.n).toFixed(1), 8) +
      padL(Math.round(a.youSum / a.n).toLocaleString('en-US'), 12) +
      padL(Math.round(a.themSum / a.n).toLocaleString('en-US'), 12) +
      padL((a.distinctSum / a.n).toFixed(2), 10) +
      padL(pct(a.bands.perfect / a.turns, 0), 9) +
      padL(pct(a.bands.whiff / a.turns, 0), 8) +
      padL(pct(a.blendTurns / a.turns, 1), 8) +
      padL(pct(a.patternTurns / a.turns, 1), 9)
    );
  }
  console.log(dim('  meter is the closing tug-of-war position; 50 is level and above 50 is a win.'));
  console.log(dim('  distinct = different moves used per battle, out of nine rounds.'));

  /* -- 4 ---------------------------------------------------------------- */
  head('4. WIN RATE BY OPPONENT, IN CAMPAIGN ORDER');
  console.log(padR('#', 4) + padR('Act', 10) + padR('Opponent', 16) + padL('skill', 6) +
    padR('  quirk', 14) + padL('deck', 5) + POLICIES.map(function (p) { return padL(p, 10); }).join(''));
  console.log(rule(55 + 10 * POLICIES.length));
  let lastAct = null;
  for (let i = 0; i < OPPONENTS.length; i++) {
    const o = OPPONENTS[i];
    if (lastAct && lastAct !== o.act) console.log(rule(55 + 10 * POLICIES.length));
    lastAct = o.act;
    let line = padR(String(i + 1), 4) + padR(o.act, 10) +
      padR(o.name + (o.boss ? ' *' : ''), 16) + padL(o.skill.toFixed(2), 6) +
      padR('  ' + (o.quirk || '-'), 14) + padL(deckAfter(i).length, 5);
    for (let p = 0; p < POLICIES.length; p++) line += padL(pct(rate(byOppPolicy[o.id][POLICIES[p]])), 10);
    console.log(line);
  }
  console.log(dim('  * act boss.  deck = how many moves the player owns walking into that fight.'));

  /* -- 5 ---------------------------------------------------------------- */
  head('5. MOVE CENSUS — what a move is worth, and who actually picks it');
  console.log(padR('id', 12) + padR('name', 16) + padR('cat', 6) + padL('base', 5) +
    padL('ideal', 7) + padL('open', 7) + padL('core', 7) + padL('vs cat', 8) +
    padL('mash', 7) + padL('vary', 7) + padL('comp', 7) + padL('exp', 7) + '   note');
  console.log(rule(125));
  let lastCat = null;
  for (let i = 0; i < census.length; i++) {
    const r = census[i];
    if (lastCat && lastCat !== r.cat) console.log(rule(125));
    lastCat = r.cat;
    const notes = [];
    if (r.special === 'finisher') notes.push('finisher-gated: legal only near a level meter');
    else if (r.special === 'hype') notes.push('trades score for hype — `open` under-rates it on purpose');
    else if (r.special) notes.push(r.special);
    if (r.tier === 'V1') notes.push('V1');

    let line = padR(r.id, 12) + padR(r.name, 16) + padR(r.cat, 6) + padL(r.base, 5) +
      padL(r.idealAmp.toFixed(2), 7) + padL(Math.round(r.open), 7) +
      padL(Math.round(r.core), 7) + padL(pct(r.catRatio, 0), 8);
    for (let p = 0; p < POLICIES.length; p++) {
      const pol = POLICIES[p];
      const av = r.availTurns[pol];
      const s = padL(av === 0 ? '-' : pct(r.pick[pol], 1), 7);
      const flagged = pol === 'expert' && av >= FLAG.minAvailTurns && r.pick[pol] < FLAG.expertPick;
      line += flagged ? col(s, C.red) : s;
    }
    console.log(line + '   ' + dim(notes.join(' · ')));
  }
  console.log(dim('  open    mean aura for playing it once, round one, clean, at its own ideal amplitude,'));
  console.log(dim('          averaged over all three opponent categories and all three scoring modes.'));
  console.log(dim('          Measured by calling resolveExchange once per condition — never calculated here.'));
  console.log(dim('  core    the same number with the move\'s own special multiplier divided back out,'));
  console.log(dim('          using the engine\'s published factors.special. Compares bodies, not roles.'));
  console.log(dim('  vs cat  core as a share of the MEDIAN core in its own category. A median, because a'));
  console.log(dim('          finisher or a high-risk move would otherwise set a bar nothing else can meet.'));
  console.log(dim('  mash/vary/comp/exp  share of that policy\'s available turns spent on this move.'));
  console.log(dim('          Normalised per move, so the columns do not sum to 100%: a move dropped in Act 4'));
  console.log(dim('          was only ever owned for the last third of the campaign. "-" means never owned.'));
  console.log(dim('          Red marks a move the value-maximising policy owns and still refuses.'));

  /* -- 6 ---------------------------------------------------------------- */
  if (packs && packs.on) {
    head('6. PACKS — does owning one buy win rate?');
    console.log('Arms       ' + packs.states.map(function (s) {
      return s.key + ' (' + s.label + (s.deck.length ? ', +' + s.deck.length + ' moves' : '') + ')';
    }).join('  ·  '));
    console.log('Battles    ' + packs.n.toLocaleString('en-US') +
      dim(' per arm x opponent x policy, paired seeds — the deck is the only variable'));
    console.log('');
    console.log(padR('Act', 20) + padR('Policy', 10) +
      packs.states.map(function (s) { return padL(s.key, 10); }).join('') +
      padL('bought Δ', 11) + padL('maxed Δ', 10));
    console.log(rule(30 + 10 * packs.states.length + 21));
    for (let a = 0; a < ACTS.length; a++) {
      const id = ACTS[a].id;
      for (let p = 0; p < POLICIES.length; p++) {
        const pol = POLICIES[p];
        const r0 = rate(packs.byOwnActPolicy.none[id][pol]);
        let line = padR(p === 0 ? ACTS[a].name : '', 20) + padR(pol, 10);
        const deltas = [];
        for (let s = 0; s < packs.states.length; s++) {
          const key = packs.states[s].key;
          const r = rate(packs.byOwnActPolicy[key][id][pol]);
          line += padL(pct(r), 10);
          if (s > 0) deltas.push((r - r0) * 100);
        }
        for (let d = 0; d < deltas.length; d++) {
          const txt = padL((deltas[d] >= 0 ? '+' : '') + deltas[d].toFixed(1) + 'pp', d === 0 ? 11 : 10);
          line += deltas[d] >= FLAG.packEdgePP ? col(txt, C.red) : dim(txt);
        }
        console.log(line);
      }
      console.log(rule(30 + 10 * packs.states.length + 21));
    }
    let allLine = padR('ALL 25 OPPONENTS', 20) + padR('', 10);
    const overall = [];
    for (let s = 0; s < packs.states.length; s++) {
      const key = packs.states[s].key;
      let w = 0, n = 0;
      for (let p = 0; p < POLICIES.length; p++) {
        w += packs.byOwnPolicy[key][POLICIES[p]].wins;
        n += packs.byOwnPolicy[key][POLICIES[p]].n;
      }
      overall.push(n ? w / n : 0);
      allLine += padL(pct(n ? w / n : 0), 10);
    }
    for (let s = 1; s < overall.length; s++) {
      const d = (overall[s] - overall[0]) * 100;
      allLine += padL((d >= 0 ? '+' : '') + d.toFixed(1) + 'pp', s === 1 ? 11 : 10);
    }
    console.log(allLine);
    console.log(dim('  `packs.js` rule 1: with nothing owned the campaign is untouched — the `none` column has to'));
    console.log(dim('  match §1 inside sampling error, and it is a different, smaller sample, so it will not match exactly.'));
    console.log(dim('  `packs.js` rule 2: a pack adds RANGE, never POWER. Every delta should sit around zero. A red'));
    console.log(dim('  delta is a cell where money bought win rate, and red on the `expert` row is the loudest kind:'));
    console.log(dim('  it is the value-maximising policy finding a better answer than the base game had.'));
  }

  /* -- 7 ---------------------------------------------------------------- */
  head('7. DESIGN FINDINGS');
  for (let i = 0; i < findings.length; i++) {
    const f = findings[i];
    const tag = f.severity === 'high' ? col(' [!] ', C.red)
      : f.severity === 'ok' ? col(' [ok]', C.green)
        : col(' [ ] ', C.cyan);
    console.log(tag + ' ' + f.text);
  }

  /* -- 8 ---------------------------------------------------------------- */
  if (fitRuns.length) {
    head('8. FIT SENSITIVITY — act boss, composed policy, only the outfit changes');
    console.log(padR('Fit', 20) + padL('crowd', 7) + padL('judges', 8) + '  ' +
      ACTS.map(function (a) { return padL(a.name.replace(/^The /, ''), 13); }).join(''));
    console.log(rule(37 + 13 * ACTS.length));
    const idx = Object.create(null);
    for (let i = 0; i < fitRuns.length; i++) idx[fitRuns[i].actId + '|' + fitRuns[i].fitId] = fitRuns[i];
    for (let f = 0; f < FITS.length; f++) {
      const fit = FITS[f];
      let line = padR(fit.name, 20) +
        padL((fit.crowd >= 0 ? '+' : '') + fit.crowd, 7) +
        padL((fit.judges >= 0 ? '+' : '') + fit.judges, 8) + '  ';
      for (let a = 0; a < ACTS.length; a++) {
        const run = idx[ACTS[a].id + '|' + fit.id];
        line += padL(run ? pct(run.wins / run.n) : '-', 13);
      }
      console.log(line);
    }
    console.log(dim('  Act 3 is a panel in an empty lot with no crowd at all, so the frog suit should visibly hurt'));
    console.log(dim('  there. If it does not, the fit system is decoration. Act 4 weights the fit 1.6x, so the'));
    console.log(dim('  spread between the best and worst outfit should be widest in that column.'));
  }

  console.log('');
  console.log(dim('This suite reports, it does not gate — exit 0 whatever the numbers say (CONTRACT §14).'));
  console.log(dim('Reproduce any row exactly:  node test/balance-sim.js --seed=' + opt.seed + ' --battles=' + opt.battles));
  console.log('');
}

/** Apply the target colour to an already-composed cell string. */
function rateColorWrap(cellText, r, tgt) {
  if (!USE_COLOR) return cellText;
  const d = Math.abs(r * 100 - tgt);
  const c = d <= 6 ? C.green : d <= 15 ? C.yellow : C.red;
  return c + cellText + C.reset;
}

/* ========================================================================== */
/* JSON OUT — for tools/gen-docs.js, and for pasting real numbers into README  */
/* ========================================================================== */

function printJson(opt, elapsed, byActPolicy, byOppPolicy, byPolicy, census, fitRuns, findings, rate, farmeo, packs) {
  const out = {
    generator: 'test/balance-sim.js',
    seed: opt.seed,
    battlesPerMatchup: opt.battles,
    /* The shape of the run, so a table can never be read out of context. */
    format: {
      stages: farmeo && farmeo.on ? ['farmeo', 'duel'] : ['duel'],
      owned: [],
      packBattlesPerMatchup: packs && packs.on ? packs.n : 0,
      coldBattlesPerMatchup: farmeo ? farmeo.coldN : 0
    },
    elapsedMs: elapsed,
    thresholds: FLAG,
    targets: TARGETS,
    farmeo: {},
    packs: {},
    byAct: {},
    byOpponent: {},
    byPolicy: {},
    moves: {},
    fits: {},
    findings: findings.map(function (f) { return { severity: f.severity, key: f.key, text: f.text }; })
  };

  for (let a = 0; a < ACTS.length; a++) {
    const id = ACTS[a].id;
    out.byAct[id] = { name: ACTS[a].name, scoring: ACTS[a].scoring, policies: {} };
    for (let p = 0; p < POLICIES.length; p++) {
      const agg = byActPolicy[id][POLICIES[p]];
      out.byAct[id].policies[POLICIES[p]] = {
        n: agg.n, wins: agg.wins, draws: agg.draws,
        rate: rate(agg), target: TARGETS[id][POLICIES[p]] / 100
      };
    }
  }

  for (let i = 0; i < OPPONENTS.length; i++) {
    const o = OPPONENTS[i];
    const row = { act: o.act, skill: o.skill, quirk: o.quirk || null, boss: !!o.boss, deckSize: deckAfter(i).length, rate: {} };
    for (let p = 0; p < POLICIES.length; p++) row.rate[POLICIES[p]] = rate(byOppPolicy[o.id][POLICIES[p]]);
    out.byOpponent[o.id] = row;
  }

  for (let p = 0; p < POLICIES.length; p++) {
    const a = byPolicy[POLICIES[p]];
    out.byPolicy[POLICIES[p]] = {
      n: a.n, rate: rate(a), drawRate: a.draws / a.n,
      meanMeter: a.meterSum / a.n, meanYourAura: a.youSum / a.n, meanTheirAura: a.themSum / a.n,
      distinctMovesPerBattle: a.distinctSum / a.n,
      bands: {
        perfect: a.bands.perfect / a.turns, clean: a.bands.clean / a.turns,
        shaky: a.bands.shaky / a.turns, whiff: a.bands.whiff / a.turns
      },
      blendRate: a.blendTurns / a.turns,
      blendSplitQuality: a.blendTurns ? a.blendSplitSum / a.blendTurns : null,
      patternRate: a.patternTurns / a.turns
    };
  }

  for (let i = 0; i < census.length; i++) {
    const r = census[i];
    out.moves[r.id] = {
      cat: r.cat, tier: r.tier, base: r.base, idealAmp: r.idealAmp, special: r.special,
      openingValue: r.open, coreValue: r.core, categoryMedianCore: r.catMedian, openingByOpponentCategory: r.openByCat, openingByScoring: r.openByMode,
      shareOfCategoryMedian: r.catRatio,
      pickRate: r.pick, meanScoreWhenPlayed: r.score, winRateWhenPlayed: r.winWhenPlayed,
      availableTurns: r.availTurns
    };
  }

  for (let i = 0; i < fitRuns.length; i++) {
    const f = fitRuns[i];
    if (!out.fits[f.fitId]) out.fits[f.fitId] = {};
    out.fits[f.fitId][f.actId] = { n: f.n, wins: f.wins, rate: f.wins / f.n, opponent: f.oppId };
  }

  /* EL FARMEO — the ladder, and the paired cold arm it is measured against. */
  if (farmeo && farmeo.on) {
    for (let p = 0; p < POLICIES.length; p++) {
      const pol = POLICIES[p];
      const a = farmeo.byPolicy[pol];
      const cold = farmeo.coldByPolicy[pol];
      const q = a.qRuns || 1;
      const row = {
        qualifiers: a.qRuns,
        bands: {},
        meanOpeningMeter: a.meterStartSum / q,
        meanRatioOfBar: a.qRatioSum / q,
        clearedBar: a.qPassed / q,
        twoStageRate: rate(a),
        duelOnlyRate: cold && cold.n ? rate(cold) : null,
        deltaPP: cold && cold.n ? (rate(a) - rate(cold)) * 100 : null,
        byAct: {}
      };
      for (let k = 0; k < QUALIFY_KEYS.length; k++) row.bands[QUALIFY_KEYS[k]] = a.qBands[QUALIFY_KEYS[k]] / q;
      row.bands.none = a.qBands.none / (a.n || 1);
      for (let x = 0; x < ACTS.length; x++) {
        const id = ACTS[x].id;
        const aa = farmeo.byActPolicy[id][pol];
        const cc = farmeo.coldByActPolicy[id] && farmeo.coldByActPolicy[id][pol];
        row.byAct[id] = {
          meanOpeningMeter: aa.qRuns ? aa.meterStartSum / aa.qRuns : null,
          twoStageRate: rate(aa),
          duelOnlyRate: cc && cc.n ? rate(cc) : null
        };
      }
      out.farmeo[pol] = row;
    }
  }

  /* PACKS — every arm, so the pay-to-win claim can be re-derived by anyone. */
  if (packs && packs.on) {
    /* `arms` is a map so a consumer can iterate ownership states without having
       to know which sibling keys are not one. */
    out.packs.arms = {};
    for (let s = 0; s < packs.states.length; s++) {
      const st = packs.states[s];
      out.format.owned.push(st.key);
      const arm = { label: st.label, packs: st.packs.slice(), extraMoves: st.deck.slice(), byPolicy: {}, byAct: {} };
      for (let p = 0; p < POLICIES.length; p++) {
        const pol = POLICIES[p];
        arm.byPolicy[pol] = {
          rate: rate(packs.byOwnPolicy[st.key][pol]),
          deltaPP: (rate(packs.byOwnPolicy[st.key][pol]) - rate(packs.byOwnPolicy.none[pol])) * 100
        };
      }
      for (let x = 0; x < ACTS.length; x++) {
        const id = ACTS[x].id;
        arm.byAct[id] = {};
        for (let p = 0; p < POLICIES.length; p++) {
          const pol = POLICIES[p];
          arm.byAct[id][pol] = {
            rate: rate(packs.byOwnActPolicy[st.key][id][pol]),
            deltaPP: (rate(packs.byOwnActPolicy[st.key][id][pol]) - rate(packs.byOwnActPolicy.none[id][pol])) * 100
          };
        }
      }
      out.packs.arms[st.key] = arm;
    }
    /* Which pack move the value-maximiser actually reached for, if any. */
    const a = packs.byOwnPolicy.maxed && packs.byOwnPolicy.maxed.expert;
    if (a && a.turns) {
      out.packs.expertPickShare = {};
      for (let i = 0; i < packs.moveIds.length; i++) {
        out.packs.expertPickShare[packs.moveIds[i]] = (a.plays[packs.moveIds[i]] || 0) / a.turns;
      }
    }
  }

  console.log(JSON.stringify(out, null, 2));
}

/* ========================================================================== */

if (isMainThread) {
  main().catch(function (err) {
    // A REAL error only: a missing module, a throw out of the engine, a dead
    // worker. Balance numbers never land here — those get reported, not thrown.
    console.error('');
    console.error('balance-sim failed: ' + (err && err.stack ? err.stack : err));
    process.exit(1);
  });
}
