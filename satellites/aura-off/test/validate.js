// AURA OFF — test/validate.js
//
// Data integrity + content-safety + evidence lint. Plain Node, no framework.
//
//   node test/validate.js      exit 0 = clean, exit 1 = named failures
//
// WHAT THIS FILE IS FOR
// ---------------------
// Three of the rules this project cares about most were, until now, sentences
// in a markdown file:
//
//   1. No move may mock the opponent (CONTRACT §7, AURA-CULTURE §5.6).
//      A move called "Point & Laugh" shipped in THREE consecutive versions
//      while everybody agreed with the rule. A paragraph does not survive
//      contact with a code generator. A failing build does.
//   2. tier:'V1' means "documented in a real battle" (CONTRACT §8). Thirteen
//      ids earned it. Nothing else may quietly promote itself into a fact.
//   3. The twelve joint names are frozen (CONTRACT §2) because they are the
//      seam the 3D port lands on. A typo'd joint is a silent no-op today and
//      a broken skeleton later.
//
// Everything else here is ordinary integrity: ids, weights, keyframes, pool
// sizes, unlock reachability. The contract tables in §8/§9/§10 are transcribed
// below and compared field by field, so this file also catches data drifting
// away from the document that authorised it.
//
// Failures always name the offending id and say WHY, not just THAT.

import {
  MOVES, MOVES_BY_ID, moveById,
  BASE_MOVES, CATALOG,
  PACKS, PACK_MOVES,
  ownedPacks, setOwnedPacks
} from '../src/data/moves.js';
import { ACTS, OPPONENTS, FITS, STARTING_KIT } from '../src/data/campaign.js';
import { JOINTS, UPPER, LOWER, JOINT_RANGE } from '../src/engine/rig.js';
import * as MC_MODULE from '../src/data/mc.js';
import * as CAMPAIGN_MODULE from '../src/data/campaign.js';
import * as PACKS_MODULE from '../src/data/packs.js';

/* --------------------------------------------------------------------------
 * BASE vs CATALOGUE vs LIBRARY — three different lists, on purpose.
 *
 *   BASE_MOVES  the twenty-seven. CONTRACT §9 is checked against THIS, never
 *               against MOVES, so no amount of pack ownership at import time
 *               can talk the contract check out of its own table.
 *   CATALOG     base + every pack move, ownership ignored. Schema, keyframes,
 *               rig joints, content safety and evidence run over this — content
 *               nobody has bought yet is still content that ships.
 *   MOVES       what a player actually holds right now. Used only to prove the
 *               two things ownership is allowed to affect: that owning nothing
 *               leaves the base game untouched, and that owning everything
 *               leaves the base ORDER untouched.
 * ------------------------------------------------------------------------ */

/** Everything that exists, base first. */
const ALL_MOVES = CATALOG;

/** id → base move. The contract's own index. */
const BASE_BY_ID = BASE_MOVES.reduce(function (map, m) {
  if (m && m.id) map[m.id] = m;
  return map;
}, Object.create(null));

/** id → pack move, ownership ignored. */
const PACK_BY_ID = PACK_MOVES.reduce(function (map, m) {
  if (m && m.id) map[m.id] = m;
  return map;
}, Object.create(null));

/**
 * The extra clause a campaign failure gets when the missing id turns out to be
 * pack content. Without it "no move has that id" is technically true and
 * completely misleading.
 */
function packClause(id) {
  const m = PACK_BY_ID[id];
  if (!m) return '';
  return ' It IS a move — "' + id + '" is in the "' + m.pack + '" pack. Packs ' +
    'never unlock through the campaign: beating an opponent is the base game\'s ' +
    'channel and all twenty-four drops are spoken for. Give it an unlock inside ' +
    'its own pack instead (CONTRACT-level rule, see src/data/packs.js).';
}

/* ========================================================================== */
/* FAILURE COLLECTION                                                         */
/* ========================================================================== */

const failures = [];
let checks = 0;

/** Record a failure. `id` must be the exact offending id — that is the point. */
function fail(section, id, why) {
  failures.push({ section, id: String(id), why });
}

/** Count a check that ran. Purely for the summary line. */
function ran(n) { checks += (n === undefined ? 1 : n); }

const EPS = 1e-9;
function near(a, b) { return Math.abs(a - b) <= EPS; }
function isNum(v) { return typeof v === 'number' && isFinite(v); }

/* ========================================================================== */
/* THE CONTRACT TABLES — transcribed from CONTRACT.md, do not edit casually   */
/* ========================================================================== */

/** CONTRACT §8. The only ids allowed to carry tier:'V1'. */
const V1_IDS = Object.freeze([
  'sixseven', 'mewing', 'sigma', 'shades', 'grimace', 'aurawalk', 'boat', 'swirl',
  'collapse', 'lasso', 'eyeroll', 'sideeye', 'clog'
]);
const V1_SET = new Set(V1_IDS);

/** CONTRACT §3. The two tiers that exist. */
const TIERS = new Set(['V1', 'V3']);

/** CONTRACT §5. The three corners of the triangle. */
const CATS = new Set(['FLEX', 'FLOW', 'BAIT']);

/** CONTRACT §6. Twelve specials, each a mechanical role. */
const SPECIAL_NAMES = Object.freeze([
  'interrupt', 'guard', 'refresh', 'feint', 'highRisk', 'debuff',
  'counter', 'finisher', 'evade', 'hype', 'read', 'persist'
]);
const SPECIAL_SET = new Set(SPECIAL_NAMES);

/** CONTRACT §6. Four opponent quirks. */
const QUIRK_NAMES = Object.freeze(['mirror', 'patient', 'frontrunner', 'punisher']);
const QUIRK_SET = new Set(QUIRK_NAMES);

/** CONTRACT §9. id, name, cat, tier, base, up, lo, idealAmp, special. IN ORDER. */
const MOVE_TABLE = Object.freeze([
  ['aurawalk',   'Aura Walk',     'FLEX', 'V1', 60, 0.20, 0.80, 1.00, null],
  ['mewing',     'Jawline',       'FLEX', 'V1', 58, 1.00, 0.00, 1.05, 'interrupt'],
  ['sigma',      'Cold Read',     'FLEX', 'V1', 44, 1.00, 0.00, 1.00, 'guard'],
  ['shades',     'Shade Drop',    'FLEX', 'V1', 56, 0.90, 0.10, 1.10, null],
  ['stillwater', 'Still Water',   'FLEX', 'V3', 62, 0.50, 0.50, 0.90, null],
  ['slowturn',   'Slow Turn',     'FLEX', 'V3', 56, 0.30, 0.70, 1.05, 'refresh'],
  ['grimace',    'The Grimace',   'FLEX', 'V1', 78, 1.00, 0.00, 1.15, 'finisher'],
  ['shadowstep', 'Shadow Step',   'FLEX', 'V3', 46, 0.20, 0.80, 1.00, 'evade'],
  ['heeldrag',   'Heel Drag',     'FLEX', 'V3', 66, 0.10, 0.90, 0.88, null],
  ['sixseven',   'Six-Seven',     'FLOW', 'V1', 52, 1.00, 0.00, 1.15, null],
  ['sideeye',    'Look Away',     'FLOW', 'V1', 34, 1.00, 0.00, 1.00, 'feint'],
  ['boat',       'River Prow',    'FLOW', 'V1', 70, 0.50, 0.50, 1.05, null],
  ['shoulder',   'Shoulder Roll', 'FLOW', 'V3', 48, 0.80, 0.20, 1.20, null],
  ['spin',       'Ground Spin',   'FLOW', 'V3', 60, 0.20, 0.80, 1.30, null],
  ['ripple',     'Body Wave',     'FLOW', 'V3', 54, 0.50, 0.50, 1.20, null],
  ['swirl',      'Swirl & Swing', 'FLOW', 'V1', 56, 0.90, 0.10, 1.20, null],
  ['headnod',    'Head Nod',      'FLOW', 'V3', 36, 1.00, 0.00, 1.05, null],
  ['crowdturn',  'Crowd Turn',    'FLOW', 'V3', 30, 0.40, 0.60, 1.25, 'hype'],
  ['collapse',   'Dead Drop',     'BAIT', 'V1', 64, 0.30, 0.70, 1.50, 'highRisk'],
  ['lasso',      'Lasso',         'BAIT', 'V1', 56, 0.85, 0.15, 1.40, 'debuff'],
  ['eyeroll',    'Unimpressed',   'BAIT', 'V1', 40, 1.00, 0.00, 1.10, 'counter'],
  ['losingit',   'Losing It',     'BAIT', 'V3', 50, 0.80, 0.20, 1.40, null],
  ['noodle',     'Noodle Legs',   'BAIT', 'V3', 52, 0.10, 0.90, 1.45, 'persist'],
  ['freeze',     'Freeze Frame',  'BAIT', 'V3', 55, 0.60, 0.40, 1.35, null],
  ['clog',       'Giant Clog',    'BAIT', 'V1', 60, 0.80, 0.20, 1.50, null],
  ['doubletake', 'Double Take',   'BAIT', 'V3', 48, 1.00, 0.00, 1.30, 'read'],
  ['buckle',     'Knee Buckle',   'BAIT', 'V3', 52, 0.10, 0.90, 1.40, null]
]);

/** CONTRACT §9. */
const EXPECTED_KIT = Object.freeze(['sixseven', 'aurawalk', 'sideeye']);

/** CONTRACT §10. act id, scoring, unstable, repeatsPunished. IN ORDER. */
const ACT_TABLE = Object.freeze([
  ['plaza',   'crowd',  false, false],
  ['bracket', 'crowd',  false, true],
  ['banned',  'judges', false, false],
  ['capital', 'both',   false, false],
  ['upriver', 'judges', true,  false]
]);

/** CONTRACT §10. act, name, skill, quirk, POOL SIZE, drop, boss. IN ORDER. */
const ROSTER_TABLE = Object.freeze([
  ['plaza',   'Chispa',         0.30, null,          2, 'headnod',    false],
  ['plaza',   'Tía Beti',       0.38, null,          3, 'shadowstep', false],
  ['plaza',   'Nena Vox',       0.44, 'frontrunner', 3, 'losingit',   false],
  ['plaza',   'Rulo',           0.48, null,          3, 'eyeroll',    false],
  ['plaza',   'El Portero',     0.58, 'punisher',    4, 'sigma',      true],
  ['bracket', 'Uvi',            0.62, null,          4, 'shoulder',   false],
  ['bracket', 'Maikito',        0.68, null,          3, 'collapse',   false],
  ['bracket', 'La Gemela',      0.74, 'mirror',      3, 'ripple',     false],
  ['bracket', 'Tacho',          0.78, null,          3, 'buckle',     false],
  ['bracket', 'Doña Feffer',    0.86, 'patient',     5, 'crowdturn',  true],
  ['banned',  'La Farola',      0.78, null,          3, 'shades',     false],
  ['banned',  'La Silenciosa',  0.84, 'punisher',    3, 'stillwater', false],
  ['banned',  'Nudo',           0.88, null,          3, 'slowturn',   false],
  ['banned',  'La Regla',       0.94, null,          4, 'heeldrag',   false],
  ['banned',  'El Alcalde',     1.04, 'frontrunner', 5, 'mewing',     true],
  ['capital', 'El Zapato',      0.88, null,          3, 'lasso',      false],
  ['capital', 'Condesa',        0.92, null,          4, 'freeze',     false],
  ['capital', 'Revés',          0.96, 'mirror',      4, 'noodle',     false],
  ['capital', 'El Payaso',      1.00, null,          4, 'clog',       false],
  ['capital', 'La Explanada',   1.12, 'patient',     6, 'doubletake', true],
  ['upriver', 'The Rower',      1.16, null,          3, 'swirl',      false],
  ['upriver', 'The Current',    1.24, 'punisher',    3, 'spin',       false],
  ['upriver', 'The Bow',        1.32, null,          3, 'grimace',    false],
  ['upriver', 'Downstream',     1.38, 'frontrunner', 3, 'boat',       false],
  ['upriver', 'Togak Luan',     1.50, 'mirror',      7, null,         true]
]);

/** CONTRACT §10. id, name, crowd offset, judges offset. */
const FIT_TABLE = Object.freeze([
  ['clogs',     'Loud clogs',         8,  0],
  ['black',     'All black',          0,  6],
  ['headcloth', 'Headcloth & shades', 4,  4],
  ['frog',      'Frog suit',         10, -3],
  ['uniform',   'School uniform',     0,  0]
]);

/** CONTRACT §10, roster balance. Deliberate — see HANDOFF open question #4. */
const READS_TARGET = Object.freeze({ f: 9, m: 6, neutral: 10 });

/* ========================================================================== */
/* 1. MOVE IDS                                                                */
/* ========================================================================== */

const seenIds = new Map();

for (let i = 0; i < ALL_MOVES.length; i++) {
  const m = ALL_MOVES[i];
  const label = (m && m.id) ? m.id : ('MOVES[' + i + ']');
  ran();

  if (!m || typeof m !== 'object') {
    fail('move-ids', label, 'is not an object. Every move list must be a flat list of move records.');
    continue;
  }
  if (typeof m.id !== 'string' || m.id.length === 0) {
    fail('move-ids', label, 'has no id. Every move needs a unique lowercase id.');
    continue;
  }
  if (!/^[a-z0-9]+$/.test(m.id)) {
    fail('move-ids', m.id,
      'is malformed. Move ids are lowercase a-z0-9 only — no capitals, spaces, ' +
      'dashes or underscores. The id is a key in save data, the deck grid and ' +
      'every opponent pool; anything else will round-trip badly.');
  }
  if (seenIds.has(m.id)) {
    fail('move-ids', m.id,
      'is a duplicate — it appears at index ' + seenIds.get(m.id) + ' and again at ' +
      'index ' + i + '. MOVES_BY_ID silently keeps only the last one, so one of ' +
      'these two moves is unreachable in every consumer.');
  } else {
    seenIds.set(m.id, i);
  }
}

ran();
if (BASE_MOVES.length !== MOVE_TABLE.length) {
  fail('move-count', 'BASE_MOVES',
    'has ' + BASE_MOVES.length + ' moves; CONTRACT §9 lists ' + MOVE_TABLE.length + '. ' +
    'Pack moves do not count toward this and never will — the base library is ' +
    'fixed at twenty-seven and a pack is a layer on top of it.');
}

/* ========================================================================== */
/* 2. MOVE FIELDS vs CONTRACT §9                                              */
/* ========================================================================== */

for (let i = 0; i < MOVE_TABLE.length; i++) {
  const row = MOVE_TABLE[i];
  const [id, name, cat, tier, base, up, lo, idealAmp, special] = row;
  const m = BASE_BY_ID[id];
  ran();

  if (!m) {
    fail('contract-§9', id,
      'is in the CONTRACT §9 table but not in MOVES. Either the move was dropped ' +
      'or its id was typo\'d — every opponent that drops it now unlocks nothing.');
    continue;
  }
  if (BASE_MOVES[i] !== m) {
    const at = BASE_MOVES.indexOf(m);
    fail('contract-§9', id,
      'is at MOVES index ' + at + ' but CONTRACT §9 puts it at index ' + i + '. ' +
      'Library order is the contract: the deck grid, the roster generator and the ' +
      'default deck all read MOVES front to back.');
  }
  if (m.name !== name) fail('contract-§9', id, 'name is "' + m.name + '"; CONTRACT §9 says "' + name + '".');
  if (m.cat !== cat) fail('contract-§9', id, 'cat is "' + m.cat + '"; CONTRACT §9 says "' + cat + '".');
  if (m.tier !== tier) fail('contract-§9', id, 'tier is "' + m.tier + '"; CONTRACT §9 says "' + tier + '".');
  if (m.base !== base) fail('contract-§9', id, 'base is ' + m.base + '; CONTRACT §9 says ' + base + '.');
  if (!near(m.up, up)) fail('contract-§9', id, 'up is ' + m.up + '; CONTRACT §9 says ' + up + '.');
  if (!near(m.lo, lo)) fail('contract-§9', id, 'lo is ' + m.lo + '; CONTRACT §9 says ' + lo + '.');
  if (!near(m.idealAmp, idealAmp)) fail('contract-§9', id, 'idealAmp is ' + m.idealAmp + '; CONTRACT §9 says ' + idealAmp + '.');
  const gotSpecial = m.special === undefined ? null : m.special;
  if (gotSpecial !== special) {
    fail('contract-§9', id,
      'special is ' + JSON.stringify(gotSpecial) + '; CONTRACT §9 says ' + JSON.stringify(special) + '. ' +
      'Specials are mechanical roles, not decoration — moving one changes the deck.');
  }
}

/* ========================================================================== */
/* 3. MOVE SCHEMA — types, weights, duration, lag                             */
/* ========================================================================== */
/* Runs over the CATALOGUE. A pack move is a move: same schema, same limits,   */
/* same lag rule. There is no relaxed tier for content somebody paid for.      */

for (const m of ALL_MOVES) {
  if (!m || typeof m.id !== 'string') continue;
  const id = m.id;
  ran(6);

  if (typeof m.name !== 'string' || !m.name.trim()) {
    fail('schema', id, 'has no display name.');
  }
  if (!CATS.has(m.cat)) {
    fail('schema', id, 'cat is ' + JSON.stringify(m.cat) + '. Must be FLEX, FLOW or BAIT — the triangle has three corners and the matchup multiplier reads this.');
  }
  if (!TIERS.has(m.tier)) {
    fail('schema', id, 'tier is ' + JSON.stringify(m.tier) + '. Must be V1 (documented) or V3 (ours).');
  }
  if (!Number.isInteger(m.base)) {
    fail('schema', id, 'base is ' + JSON.stringify(m.base) + '. Base score must be an integer.');
  }

  // up + lo === 1.0 EXACTLY. The whole bone-masking model depends on it.
  if (!isNum(m.up) || !isNum(m.lo)) {
    fail('weights', id, 'up/lo are not both finite numbers (up=' + JSON.stringify(m.up) + ', lo=' + JSON.stringify(m.lo) + ').');
  } else if (!near(m.up + m.lo, 1)) {
    fail('weights', id,
      'up + lo = ' + (m.up + m.lo) + ', not 1.0 (up=' + m.up + ', lo=' + m.lo + '). ' +
      'The split is a share of one body: upper weight and lower weight must sum to ' +
      'exactly 1.0, or blend scoring, the split-quality bonus and every category ' +
      'weighting silently drift.');
  } else if (m.up < 0 || m.lo < 0) {
    fail('weights', id, 'has a negative body weight (up=' + m.up + ', lo=' + m.lo + '). Neither half can contribute less than nothing.');
  }

  if (!isNum(m.idealAmp) || m.idealAmp < 0.4 || m.idealAmp > 1.9) {
    fail('schema', id, 'idealAmp is ' + JSON.stringify(m.idealAmp) + ', outside the playable amplitude range 0.4 … 1.9 — the player could never reach it, so composure() could never pay out.');
  }

  if (!isNum(m.dur) || m.dur < 1400 || m.dur > 2200) {
    fail('schema', id,
      'dur is ' + JSON.stringify(m.dur) + 'ms. CONTRACT §3 keeps every move in ' +
      '1400-2200ms: these are seconds of movement, not routines.');
  }

  // lag: only on lower-led moves, and only in the useful band.
  const lag = m.lag === undefined ? 0 : m.lag;
  if (!isNum(lag) || lag < 0) {
    fail('lag', id, 'lag is ' + JSON.stringify(m.lag) + '. Must be a non-negative number of milliseconds.');
  } else if (lag > 0) {
    if (!(m.lo > 0.5)) {
      fail('lag', id,
        'sets lag=' + lag + 'ms but lo=' + m.lo + '. Follow-through lag means the ' +
        'UPPER body trails the LOWER, so it is only physical on a lower-led move ' +
        '(lo > 0.5). On an upper-led move it just delays the part doing the work.');
    }
    if (lag < 80 || lag > 140) {
      fail('lag', id, 'lag is ' + lag + 'ms, outside the 80-140ms band in CONTRACT §3. Below 80 it is invisible; above 140 it reads as a mistake.');
    }
    if (lag >= m.dur) {
      fail('lag', id, 'lag (' + lag + 'ms) is not shorter than dur (' + m.dur + 'ms) — the upper body would never start.');
    }
  }

  if (typeof m.hint !== 'string' || !m.hint.trim()) {
    fail('schema', id, 'has no hint. The hint is how to PERFORM the move; it is the only instruction the player gets.');
  }

  if (m.special !== undefined && m.special !== null && !SPECIAL_SET.has(m.special)) {
    fail('specials', id,
      'declares special ' + JSON.stringify(m.special) + ', which is not one of the ' +
      'twelve in CONTRACT §6 (' + SPECIAL_NAMES.join(', ') + '). An unknown special ' +
      'is a no-op: the move ships with a promise the engine never keeps.');
  }
}

// Every special in §6 must actually be carried by some move — an unused special
// is a mechanic that exists only in the documentation.
{
  const carried = new Set(BASE_MOVES.map((m) => m.special).filter(Boolean));
  for (const s of SPECIAL_NAMES) {
    ran();
    if (!carried.has(s)) {
      fail('specials', s, 'is declared in CONTRACT §6 but no BASE move carries it. A pack cannot cover for it — the base twenty-seven have to be a complete game on their own. Either give it to a move or delete the mechanic — it cannot stay half-built.');
    }
  }
}

/* ========================================================================== */
/* 4. KEYFRAMES + THE FROZEN RIG                                              */
/* ========================================================================== */

const JOINT_SET = new Set(JOINTS);

// The rig itself must still be the frozen rig.
{
  ran(3);
  const FROZEN = ['rot', 'bob', 'lean', 'head', 'sL', 'eL', 'sR', 'eR', 'hL', 'kL', 'hR', 'kR'];
  if (JOINTS.length !== 12 || FROZEN.some((j, i) => JOINTS[i] !== j)) {
    fail('rig', 'JOINTS',
      'is ' + JSON.stringify(JOINTS) + '. The twelve joint names are FROZEN ' +
      '(CONTRACT §2): ' + FROZEN.join(' ') + '. They map to real bones when the 3D ' +
      'port lands, and renaming one breaks the port.');
  }
  const union = new Set([].concat(UPPER, LOWER));
  if (UPPER.length + LOWER.length !== 12 || union.size !== 12 || JOINTS.some((j) => !union.has(j))) {
    fail('rig', 'UPPER/LOWER',
      'do not partition the twelve joints exactly once each. Bone masking — the ' +
      'whole blend mechanic — takes UPPER from one move and LOWER from another, ' +
      'so a joint in both lists or in neither has undefined behaviour.');
  }
  for (const j of JOINTS) {
    if (!Array.isArray(JOINT_RANGE[j]) || JOINT_RANGE[j].length !== 2) {
      fail('rig', j, 'has no [min,max] entry in JOINT_RANGE, so no frame using it can be range-checked.');
    }
  }
}

for (const m of ALL_MOVES) {
  if (!m || typeof m.id !== 'string') continue;
  const id = m.id;
  ran();

  if (!Array.isArray(m.frames) || m.frames.length < 2) {
    fail('frames', id, 'has ' + (Array.isArray(m.frames) ? m.frames.length : 'no') + ' keyframes. A move needs at least two — a start and an end.');
    continue;
  }

  const f0 = m.frames[0];
  const fN = m.frames[m.frames.length - 1];

  if (!f0 || !near(f0.t, 0)) {
    fail('frames', id, 'first keyframe is t=' + JSON.stringify(f0 && f0.t) + ', not t:0. Sampling brackets on [0,1]; anything before the first frame is undefined.');
  }
  if (!fN || !near(fN.t, 1)) {
    fail('frames', id, 'last keyframe is t=' + JSON.stringify(fN && fN.t) + ', not t:1. The move would end early and hold a pose nobody authored.');
  }

  let prev = -Infinity;
  for (let k = 0; k < m.frames.length; k++) {
    const f = m.frames[k];
    ran();
    if (!f || typeof f !== 'object') {
      fail('frames', id, 'keyframe ' + k + ' is not an object.');
      continue;
    }
    if (!isNum(f.t)) {
      fail('frames', id, 'keyframe ' + k + ' has t=' + JSON.stringify(f.t) + ' — every keyframe needs a finite t.');
      continue;
    }
    if (f.t < 0 || f.t > 1) {
      fail('frames', id, 'keyframe ' + k + ' has t=' + f.t + ', outside [0,1]. t is normalised time, not milliseconds.');
    }
    if (f.t <= prev) {
      fail('frames', id,
        'keyframe ' + k + ' has t=' + f.t + ' which is not greater than the previous ' +
        'frame\'s t=' + prev + '. Keyframe times must strictly increase — the ' +
        'bracket search assumes it, and equal times divide by zero.');
    }
    prev = f.t;

    for (const key of Object.keys(f)) {
      if (key === 't') continue;
      if (!JOINT_SET.has(key)) {
        fail('rig-joints', id,
          'keyframe ' + k + ' (t=' + f.t + ') sets "' + key + '", which is not one of ' +
          'the twelve FROZEN joints: ' + JOINTS.join(' ') + '. ' +
          'THIS IS THE GUARD THAT PROTECTS THE FUTURE 3D PORT. The joint names map ' +
          'one-to-one onto real bones in the eventual three.js rig; an unknown name ' +
          'is a silent no-op in SVG today and a missing bone in 3D tomorrow. If you ' +
          'meant a new degree of freedom, it has to be added to the rig deliberately, ' +
          'not smuggled in through a keyframe.');
        continue;
      }
      const v = f[key];
      if (!isNum(v)) {
        fail('frames', id, 'keyframe ' + k + ' sets ' + key + '=' + JSON.stringify(v) + ', which is not a finite number.');
        continue;
      }
      const range = JOINT_RANGE[key];
      if (!range) continue;
      const [min, max] = range;
      if (v < min || v > max) {
        fail('joint-range', id,
          'keyframe ' + k + ' sets ' + key + '=' + v + ', outside the sane range ' +
          min + ' … ' + max + ' from CONTRACT §2. Authored joint values are in that ' +
          'range before amplitude is applied; past it the figure inverts or folds ' +
          'through itself.');
      } else {
        // Amplitude scales deltas from rest, so a move authored near the edge can
        // still blow past it at its own idealAmp. Allow a tenth of the span.
        const grace = (max - min) * 0.10;
        const scaled = v * m.idealAmp;
        if (scaled < min - grace || scaled > max + grace) {
          fail('joint-range', id,
            'keyframe ' + k + ' sets ' + key + '=' + v + ', which reaches ' +
            scaled.toFixed(1) + ' at this move\'s idealAmp of ' + m.idealAmp +
            ' — well outside the sane range ' + min + ' … ' + max + '. Author each ' +
            'move to read correctly AT its idealAmp, not at 1.0.');
        }
      }
    }
  }
}

/* ========================================================================== */
/* 5. CONTENT SAFETY — the lint that matters most                             */
/* ========================================================================== */
//
// CONTRACT §7 and AURA-CULTURE §5.6. The rule is not "be polite". It is the
// specific line Costa Rica's Ministry of Public Education drew when it
// restricted these battles in schools: fine until they are used to humiliate,
// ridicule, harass or discriminate. Documented competitors are as young as six,
// and an eleven-year-old was already the target of impersonation scams.
//
// So: BAIT is SELF-directed clowning — falling over, legs giving out, cracking
// yourself up. Never punching at the other person. `lasso` is the single
// documented exception and it is a rope gag, not mockery.
//
// Note on the word "you": every hint is written in the second person and that
// is correct — the "you" in a hint is always the PERFORMER being told how to
// move. What fails is language that turns "you" into someone being done TO:
// an explicit opponent noun, an aggressive verb, or a move NAME addressed at a
// person (a title is not an instruction, so second person in a name is always
// pointed at somebody else).

const WHY_SAFETY =
  'BAIT is self-directed clowning — you fall over, your legs give out, you crack ' +
  'yourself up. It is never aimed at the other person. This is the exact line ' +
  'Costa Rica\'s Ministry of Public Education drew when it restricted these ' +
  'battles in schools (fine until used to humiliate, ridicule, harass or ' +
  'discriminate), documented competitors are as young as six, and the game must ' +
  'never reward humiliating an opponent. Rewrite it so the joke lands on the ' +
  'performer. See CONTRACT §7 and AURA-CULTURE §5.6.';

/** Aggression / mockery, wherever it appears. */
const MOCKERY_RULES = Object.freeze([
  [/\bmock(s|ed|ing|ery)?\b/i, 'mocks somebody'],
  [/\btaunt(s|ed|ing)?\b/i, 'taunts'],
  [/\broast(s|ed|ing)?\b/i, 'is a roast — a roast mechanic is banned outright'],
  [/\bridicul\w*/i, 'ridicules'],
  [/\bhumiliat\w*/i, 'humiliates'],
  [/\bharass\w*/i, 'harasses'],
  [/\bdiscriminat\w*/i, 'discriminates'],
  [/\binsult(s|ed|ing)?\b/i, 'insults'],
  [/\b(sneer|jeer|scoff|deride|derides|deriding|derision|gloat)\w*/i, 'jeers at the other person'],
  [/\b(belittl|demean|degrad)\w*/i, 'belittles somebody'],
  [/\bembarrass(es|ed|ing|ment)?\s+(them|him|her|the\s+other|the\s+opponent|somebody|someone)\b/i,
    'sets out to embarrass the other person'],
  [/\bsham(e|es|ed|ing)\s+(them|him|her|the\s+other|the\s+opponent|somebody|someone)\b/i,
    'shames the other person'],
  [/\b(body|fat|slut)[\s-]?sham\w*/i, 'is shaming'],
  [/\bbull(y|ies|ying)\b/i, 'is bullying'],
  [/\b(trash|smack)[\s-]?talk\w*/i, 'is trash-talk'],
  [/\bdiss(es|ed|ing)?\b/i, 'disses somebody'],
  [/\bloser(s)?\b/i, 'labels somebody a loser'],
  [/\bclown(ing)?\s+(on|at)\b/i, 'clowns ON somebody — BAIT clowns on yourself'],
  [/\b(dunk|dab|flex|stunt)(ing|s)?\s+on\b/i, 'is aimed at another person'],
  [/\blaugh(s|ed|ing)?\s+(at|in)\b/i, 'laughs AT somebody'],
  [/\bpoint(s|ed|ing)?\s*(and|&)?\s*(at\b|laugh)/i,
    'points at the opponent. "Point & Laugh" is the exact move that shipped in ' +
    'three consecutive versions while this rule sat in a markdown file'],
  [/\bin\s+(his|her|their|your)\s+face\b/i, 'is delivered in someone else\'s face'],
  [/\b(own|owns|owned|destroy|destroys|destroyed|end|ends|ended|cook|cooks|cooked|bury|buries|buried|wreck|wrecks|wrecked)\s+(them|him|her)\b/i,
    'is aimed at the opponent'],
  [/\bmimic(k)?(s|ed|ing)?\s+(them|him|her|the\s+opponent)/i, 'mimics the opponent back at them']
]);

/** Naming a target. Only ever checked on move id / name / hint. */
const TARGET_RULES = Object.freeze([
  [/\bopponent('?s)?\b/i, 'names the opponent as the target of the move'],
  [/\b(rival|foe|enemy|adversary|challenger|victim)('?s)?\b/i, 'names another person as the target'],
  [/\bthe\s+other\s+(kid|guy|girl|person|boy|dancer|player|competitor)\b/i, 'points the move at the other person'],
  [/\b(at|toward|towards|over|onto|into)\s+(them|him|her)\b/i, 'directs the move at the other person'],
  [/\b(their|his|her)\s+(face|head|turn|expense)\b/i, 'is performed at the other person\'s expense']
]);

/** Second person in a NAME. A title that addresses somebody is addressing them. */
const NAME_SECOND_PERSON = /\b(you|your|you're|youre|yours|ur)\b/i;

/** Real people documented in the corpus, plus signature-celebration bait. */
const PERSON_RULES = Object.freeze([
  [/\brayyan\b|\barkan\b|\bdikha\b/i, 'is a real child competitor\'s name'],
  [/\bkaled\b|\brosales\b/i, 'is a real competitor\'s name'],
  [/\bbastilla\b/i, 'is a real competitor\'s name'],
  [/\buvitinho\b/i, 'is a real organiser\'s name'],
  [/\baldama\b/i, 'is a real academic\'s name'],
  [/\btovar\b/i, 'is a real academic\'s name'],
  [/\b(ronaldo|messi|neymar|mbappe|siuu+|griddy)\b/i, 'is a real person or their signature celebration'],
  [/\b(khaby|mrbeast|ishowspeed)\b/i, 'is a real person']
]);

/** Branded characters and garments — the trap the real CDMX winner walked into. */
const BRAND_RULES = Object.freeze([
  [/\b(lightning\s+)?mcqueen\b/i, 'is a branded character (the Lightning McQueen shorts are literally the documented trap)'],
  [/\b(disney|pixar|marvel|nintendo|sanrio)\b/i, 'is a rights-holder'],
  [/\b(pikachu|pok[eé]mon|mario|luigi|sonic|shrek|spider[\s-]?man|batman|superman|hello\s+kitty|labubu|minecraft|fortnite|roblox|squid\s+game)\b/i, 'is an existing character or property'],
  [/\b(nike|adidas|puma|jordan|yeezy|gucci|prada|balenciaga|supreme|crocs|vans|uggs?|north\s+face)\b/i, 'is a branded garment']
]);

/** No stat resembling attractiveness. Mewing and sigma are absurdist comedy. */
const ATTRACT_RULES = Object.freeze([
  [/\battractive(ness)?\b/i, 'reads as an attractiveness rating'],
  [/\b(hotness|sexiness|sexy|prettiness|cuteness|desirability|handsomeness)\b/i, 'reads as an attractiveness rating'],
  [/\bhot\s+or\s+not\b/i, 'reads as an attractiveness rating'],
  [/\brizz\b/i, 'reads as an attractiveness rating']
]);
const WHY_ATTRACT =
  'No stat in this game may resemble "attractiveness". Mewing and sigma are ' +
  'absurdist comedy here, never aspiration — the players are children and the ' +
  'game does not score how they look (CONTRACT §7).';

/** CONTRACT §12 — ballroom is somebody else's culture with its own history. */
const BALLROOM_RULES = Object.freeze([
  [/\btens\s+across\s+the\s+board\b/i, 'is ballroom scoring vocabulary'],
  [/\bchop(s|ped|ping)?\b/i, 'is ballroom vocabulary'],
  [/\brealness\b/i, 'is ballroom vocabulary'],
  [/\b(vogue|vogued|voguing)\b/i, 'is ballroom vocabulary'],
  [/\bhouse\s+of\b|\bballroom\b/i, 'is ballroom vocabulary']
]);
const WHY_BALLROOM =
  'Do not use ballroom vocabulary (CONTRACT §12). Outlets draw the comparison, ' +
  'so the parallel is theirs — but ballroom is Black and Latino LGBTQ+ culture ' +
  'with a specific history and its own word, noguing, for exactly this kind of ' +
  'uninformed borrowing. Study the architecture, ship our own words.';

/** The one thing a hint must never do: explain what the meme MEANS. */
const MEANING_RULES = Object.freeze([
  [/\b(means|meaning|stands\s+for|symboli[sz]es|represents|refers\s+to|is\s+a\s+reference\s+to)\b/i,
    'explains what the move means']
]);
const WHY_MEANING =
  'A hint describes HOW to perform the move and nothing else (CONTRACT §3, ' +
  'AURA-CULTURE §1.4). Meaning is the one thing this culture refuses to supply, ' +
  'and explaining the joke is the fastest way to sound like an outsider.';

/** Id form of the mockery list — ids have no spaces, so match on substrings. */
const ID_SUBSTRINGS = Object.freeze([
  'mock', 'taunt', 'roast', 'ridicul', 'humiliat', 'harass', 'insult', 'sneer',
  'jeer', 'gloat', 'belittl', 'embarrass', 'bully', 'trashtalk', 'smacktalk',
  'pointandlaugh', 'pointlaugh', 'laughat', 'dunkon', 'dabon', 'flexon',
  'clownon', 'owned', 'getrekt', 'loser', 'noob', 'inyourface', 'yourface',
  'sitdown', 'mcqueen', 'attractive', 'rizz'
]);

function applyRules(section, id, surface, text, rules, why) {
  ran();
  for (const [re, what] of rules) {
    const hit = text.match(re);
    if (hit) {
      fail(section, id,
        surface + ' ' + JSON.stringify(text) + ' ' + what +
        ' (matched "' + hit[0] + '"). ' + why);
      return true;
    }
  }
  return false;
}

for (const m of ALL_MOVES) {
  if (!m || typeof m.id !== 'string') continue;
  const id = m.id;
  const name = typeof m.name === 'string' ? m.name : '';
  const hint = typeof m.hint === 'string' ? m.hint : '';

  for (const [surface, text] of [['name', name], ['hint', hint]]) {
    if (!text) continue;
    applyRules('content-safety', id, surface, text, MOCKERY_RULES, WHY_SAFETY);
    applyRules('content-safety', id, surface, text, TARGET_RULES, WHY_SAFETY);
    applyRules('content-safety', id, surface, text, PERSON_RULES,
      'No real person\'s name, likeness or signature celebration appears in this ' +
      'game. The people in the source material are mostly children who did not ' +
      'consent to being in it (CONTRACT §7).');
    applyRules('content-safety', id, surface, text, BRAND_RULES,
      'No branded garment or existing character. That is exactly the trap the real ' +
      'CDMX winner walked into with the Lightning McQueen shorts (CONTRACT §7).');
    applyRules('content-safety', id, surface, text, ATTRACT_RULES, WHY_ATTRACT);
    applyRules('voice', id, surface, text, BALLROOM_RULES, WHY_BALLROOM);
  }

  if (hint) applyRules('voice', id, 'hint', hint, MEANING_RULES, WHY_MEANING);

  ran();
  if (name && NAME_SECOND_PERSON.test(name)) {
    fail('content-safety', id,
      'name ' + JSON.stringify(name) + ' is written in the second person. A hint ' +
      'may say "you" — there it is the performer being told how to move — but a ' +
      'NAME is a title, and a title that addresses somebody is addressing the ' +
      'person opposite. ' + WHY_SAFETY);
  }

  ran();
  const lowerId = id.toLowerCase();
  for (const frag of ID_SUBSTRINGS) {
    if (lowerId.indexOf(frag) !== -1) {
      fail('content-safety', id,
        'the id itself contains "' + frag + '". An id outlives every rename: it is ' +
        'in save files, opponent pools and analytics long after the display name ' +
        'has been softened. ' + WHY_SAFETY);
      break;
    }
  }
}

/* ---- the same lint, over every other authored string in the data layer ---- */

function walkStrings(obj, path, out, seen) {
  if (obj === null || obj === undefined) return out;
  if (typeof obj === 'string') { out.push([path, obj]); return out; }
  if (typeof obj !== 'object') return out;
  if (seen.has(obj)) return out;
  seen.add(obj);
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) walkStrings(obj[i], path + '[' + i + ']', out, seen);
    return out;
  }
  for (const k of Object.keys(obj)) walkStrings(obj[k], path + '.' + k, out, seen);
  return out;
}

for (const [modName, mod] of [['mc.js', MC_MODULE], ['campaign.js', CAMPAIGN_MODULE], ['packs.js', PACKS_MODULE]]) {
  const strings = [];
  const seen = new WeakSet();
  for (const k of Object.keys(mod)) {
    if (typeof mod[k] === 'function') continue;
    walkStrings(mod[k], k, strings, seen);
  }
  for (const [path, text] of strings) {
    const where = modName + ' ' + path;
    applyRules('content-safety', where, 'string', text, MOCKERY_RULES, WHY_SAFETY);
    applyRules('content-safety', where, 'string', text, PERSON_RULES,
      'No real person\'s name or likeness appears in this game (CONTRACT §7).');
    applyRules('content-safety', where, 'string', text, BRAND_RULES,
      'No branded garment or existing character (CONTRACT §7).');
    applyRules('content-safety', where, 'string', text, ATTRACT_RULES, WHY_ATTRACT);
    applyRules('voice', where, 'string', text, BALLROOM_RULES, WHY_BALLROOM);
  }
}

/* ---- no stat may be NAMED like an attractiveness score ------------------- */

const BANNED_KEYS = new Set([
  'attractiveness', 'attractive', 'hotness', 'hot', 'sexy', 'sexiness', 'beauty',
  'beautiful', 'pretty', 'prettiness', 'cute', 'cuteness', 'looks', 'rizz',
  'desirability', 'hotornot'
]);

function checkKeys(obj, label, seen) {
  if (!obj || typeof obj !== 'object' || seen.has(obj)) return;
  seen.add(obj);
  if (Array.isArray(obj)) { for (const v of obj) checkKeys(v, label, seen); return; }
  for (const k of Object.keys(obj)) {
    ran();
    if (BANNED_KEYS.has(k.toLowerCase())) {
      fail('content-safety', label, 'declares a field named "' + k + '". ' + WHY_ATTRACT);
    }
    checkKeys(obj[k], label, seen);
  }
}
{
  const seen = new WeakSet();
  for (const m of ALL_MOVES) checkKeys(m, 'move ' + m.id, seen);
  for (const p of PACKS) checkKeys(p, 'pack ' + p.id, seen);
  for (const o of OPPONENTS) checkKeys(o, 'opponent ' + o.id, seen);
  for (const a of ACTS) checkKeys(a, 'act ' + a.id, seen);
  for (const f of FITS) checkKeys(f, 'fit ' + f.id, seen);
}

/* ========================================================================== */
/* 6. EVIDENCE TIER — V1 means somebody filmed it                             */
/* ========================================================================== */

for (const m of ALL_MOVES) {
  if (!m || typeof m.id !== 'string') continue;
  ran();
  if (m.tier === 'V1' && !V1_SET.has(m.id)) {
    fail('evidence', m.id,
      'claims tier:"V1" but is not on the sourced list in CONTRACT §8 ' +
      '(' + V1_IDS.join(' ') + '). V1 means the move is documented in a real ' +
      'battle by a named source. Everything else is V3 — our original work, which ' +
      'is safe to ship and honest to label. You cannot quietly promote an ' +
      'invention into a fact; relabel it V3.');
  }
}
for (const id of V1_IDS) {
  ran();
  const m = BASE_BY_ID[id];
  if (!m) {
    fail('evidence', id, 'is on the CONTRACT §8 evidence list but no move has that id.');
  } else if (m.tier !== 'V1') {
    fail('evidence', id,
      'is on the CONTRACT §8 sourced list but is labelled tier:"' + m.tier + '". ' +
      'The evidence exists; wearing it is not optional. Demoting a documented move ' +
      'to V3 throws away the only thing that makes this roster defensible.');
  }
}

/* ========================================================================== */
/* 7. CAMPAIGN — acts, opponents, pools, fits                                 */
/* ========================================================================== */

ran();
if (ACTS.length !== ACT_TABLE.length) {
  fail('acts', 'ACTS', 'has ' + ACTS.length + ' acts; CONTRACT §10 lists ' + ACT_TABLE.length + '.');
}
for (let i = 0; i < ACT_TABLE.length; i++) {
  const [id, scoring, unstable, repeats] = ACT_TABLE[i];
  const a = ACTS[i];
  ran(4);
  if (!a || a.id !== id) {
    fail('acts', id, 'is missing from ACTS at index ' + i + ' (found ' + JSON.stringify(a && a.id) + '). Act order is campaign order.');
    continue;
  }
  if (a.scoring !== scoring) {
    fail('acts', id, 'scoring is "' + a.scoring + '"; CONTRACT §10 says "' + scoring + '". Crowd and judges are two different functions, not one with a flag.');
  }
  if (Boolean(a.unstable) !== unstable) {
    fail('acts', id, 'unstable is ' + Boolean(a.unstable) + '; CONTRACT §10 says ' + unstable + '. Act 5 is the one that moves — the deck perturbs amplitude and speeds the needle.');
  }
  if (Boolean(a.repeatsPunished) !== repeats) {
    fail('acts', id, 'repeatsPunished is ' + Boolean(a.repeatsPunished) + '; CONTRACT §10 says ' + repeats + '.');
  }
}

ran();
if (OPPONENTS.length !== ROSTER_TABLE.length) {
  fail('roster', 'OPPONENTS', 'has ' + OPPONENTS.length + ' opponents; CONTRACT §10 lists ' + ROSTER_TABLE.length + '.');
}

const actIds = new Set(ACTS.map((a) => a.id));
const oppIds = new Set();

for (let i = 0; i < ROSTER_TABLE.length; i++) {
  const [actId, name, skill, quirk, poolSize, drop, boss] = ROSTER_TABLE[i];
  const o = OPPONENTS[i];
  ran(7);

  if (!o) {
    fail('roster', name, 'is missing from OPPONENTS at index ' + i + '. Roster order is campaign order.');
    continue;
  }
  const label = o.id || name;

  if (o.name !== name) {
    fail('roster', label, 'is named "' + o.name + '" at index ' + i + '; CONTRACT §10 has "' + name + '" there. The ladder is ordered by difficulty — reordering it reorders the difficulty curve.');
  }
  if (typeof o.id !== 'string' || !/^[a-z0-9]+$/.test(o.id || '')) {
    fail('roster', label, 'has a malformed opponent id ' + JSON.stringify(o.id) + '. Lowercase a-z0-9 only.');
  }
  if (oppIds.has(o.id)) {
    fail('roster', o.id, 'is a duplicate opponent id — save data keys off it, so two opponents would share one unlock record.');
  }
  oppIds.add(o.id);

  if (o.act !== actId) {
    fail('roster', label, 'is in act "' + o.act + '"; CONTRACT §10 puts them in "' + actId + '".');
  } else if (!actIds.has(o.act)) {
    fail('roster', label, 'references act "' + o.act + '", which is not in ACTS.');
  }
  if (!near(o.skill, skill)) {
    fail('roster', label, 'skill is ' + o.skill + '; CONTRACT §10 says ' + skill + '. Skill is the difficulty curve — the balance targets are measured against these exact numbers.');
  }
  const gotQuirk = (o.quirk === undefined || o.quirk === null) ? null : o.quirk;
  if (gotQuirk !== quirk) {
    fail('roster', label, 'quirk is ' + JSON.stringify(gotQuirk) + '; CONTRACT §10 says ' + JSON.stringify(quirk) + '.');
  }
  if (gotQuirk !== null && !QUIRK_SET.has(gotQuirk)) {
    fail('roster', label,
      'declares quirk ' + JSON.stringify(gotQuirk) + ', which is not one of the four ' +
      'in CONTRACT §6 (' + QUIRK_NAMES.join(', ') + '). An unknown quirk is a no-op: ' +
      'the opponent ships with a personality the AI never reads.');
  }
  if (Boolean(o.boss) !== Boolean(boss)) {
    fail('roster', label, 'boss is ' + Boolean(o.boss) + '; CONTRACT §10 marks them ' + (boss ? 'the act boss' : 'not a boss') + '.');
  }

  if (!Array.isArray(o.pool)) {
    fail('roster', label, 'has no move pool array.');
  } else {
    if (o.pool.length !== poolSize) {
      fail('pools', label,
        'has a pool of ' + o.pool.length + ' moves; CONTRACT §10 says ' + poolSize + '. ' +
        'Pool size is how much vocabulary this opponent has, and it is part of the ' +
        'difficulty curve, not a free choice.');
    }
    const inPool = new Set();
    for (const p of o.pool) {
      ran();
      if (!BASE_BY_ID[p]) {
        fail('pools', label,
          'has "' + p + '" in its pool, and no BASE move has that id. The AI would try ' +
          'to throw a move that does not exist. Check for a typo against MOVE_IDS.' +
          packClause(p));
      }
      if (inPool.has(p)) {
        fail('pools', label, 'lists "' + p + '" twice in its pool, which quietly doubles how often it comes up.');
      }
      inPool.add(p);
    }
    if (drop && !inPool.has(drop)) {
      fail('pools', label,
        'drops "' + drop + '" but does not carry it. An opponent always performs the ' +
        'move they teach, so you watch it land on you before you ever get to throw ' +
        'it — studying your opponents is documented as part of the real sport.');
    }
    if (gotQuirk === 'mirror') {
      const cats = new Set(o.pool.map((p) => BASE_BY_ID[p] && BASE_BY_ID[p].cat).filter(Boolean));
      ran();
      if (cats.size < 3) {
        fail('pools', label,
          'is a mirror but its pool only covers ' + Array.from(cats).sort().join('/') +
          '. A mirror answers with the category that beats your last, so a mirror ' +
          'missing a category is a mirror with nothing to say.');
      }
    }
  }

  const gotDrop = (o.drop === undefined || o.drop === null) ? null : o.drop;
  if (gotDrop !== drop) {
    fail('roster', label, 'drops ' + JSON.stringify(gotDrop) + '; CONTRACT §10 says ' + JSON.stringify(drop) + '.');
  }
}

/* ---- roster balance: deliberate, do not skew it back --------------------- */
{
  const haveReads = OPPONENTS.every((o) => typeof o.reads === 'string');
  if (haveReads) {
    const tally = { f: 0, m: 0, neutral: 0 };
    for (const o of OPPONENTS) {
      ran();
      if (!(o.reads in tally)) {
        fail('roster', o.id, 'has reads:"' + o.reads + '"; expected "f", "m" or "neutral".');
      } else {
        tally[o.reads]++;
      }
    }
    for (const k of Object.keys(READS_TARGET)) {
      ran();
      if (tally[k] !== READS_TARGET[k]) {
        fail('roster', 'reads:' + k,
          'the roster reads ' + tally[k] + ' ' + k + '; CONTRACT §10 fixes it at ' +
          READS_TARGET[k] + ' (9 female / 6 male / 10 neutral). One woman is named ' +
          'as a competitor across roughly forty sources while AFP photographed women ' +
          'competing — the gap is in the coverage, not the culture. The balance is ' +
          'deliberate. Do not skew it back.');
      }
    }
  }
}

/* ---- fits and their exact offsets ---------------------------------------- */

ran();
if (FITS.length !== FIT_TABLE.length) {
  fail('fits', 'FITS', 'has ' + FITS.length + ' fits; CONTRACT §10 lists exactly ' + FIT_TABLE.length + '. The fit screen is built for five.');
}
for (let i = 0; i < FIT_TABLE.length; i++) {
  const [id, name, crowd, judges] = FIT_TABLE[i];
  const f = FITS.find((x) => x && x.id === id);
  ran(4);
  if (!f) {
    fail('fits', id, 'is in CONTRACT §10 but missing from FITS. Both the frog suit and the giant clog are documented — real competitors turned up dressed as a frog and battled with a giant rubber clog.');
    continue;
  }
  if (FITS[i] !== f) {
    fail('fits', id, 'is at FITS index ' + FITS.indexOf(f) + '; CONTRACT §10 puts it at index ' + i + '.');
  }
  if (f.name !== name) fail('fits', id, 'name is "' + f.name + '"; CONTRACT §10 says "' + name + '".');
  if (f.crowd !== crowd) {
    fail('fits', id,
      'crowd offset is ' + f.crowd + '; CONTRACT §10 says ' + crowd + '. The fit ' +
      'offsets are the whole trade-off — the frog suit buys the square and costs ' +
      'you the panel.');
  }
  if (f.judges !== judges) {
    fail('fits', id, 'judges offset is ' + f.judges + '; CONTRACT §10 says ' + judges + '.');
  }
}

/* ========================================================================== */
/* 8. REACHABILITY — a move a player cannot reach is a content bug            */
/* ========================================================================== */

ran();
if (STARTING_KIT.length !== EXPECTED_KIT.length || EXPECTED_KIT.some((id, i) => STARTING_KIT[i] !== id)) {
  fail('unlocks', 'STARTING_KIT',
    'is ' + JSON.stringify(Array.from(STARTING_KIT)) + '; CONTRACT §9 says ' +
    JSON.stringify(Array.from(EXPECTED_KIT)) + '.');
}
for (const id of STARTING_KIT) {
  ran();
  if (!BASE_BY_ID[id]) {
    fail('unlocks', id,
      'is in the starting kit but no BASE move has that id — the player would boot ' +
      'with an empty slot.' + packClause(id));
  }
}

const droppedBy = new Map();
for (const o of OPPONENTS) {
  const d = o && o.drop;
  if (!d) continue;
  ran();
  if (!BASE_BY_ID[d]) {
    fail('unlocks', o.id,
      'drops "' + d + '", and no BASE move has that id. Beating them would unlock ' +
      'nothing.' + packClause(d));
    continue;
  }
  if (STARTING_KIT.indexOf(d) !== -1) {
    fail('unlocks', o.id, 'drops "' + d + '", which the player already starts with. That fight teaches nothing.');
  }
  if (droppedBy.has(d)) {
    fail('unlocks', d, 'is dropped by both ' + droppedBy.get(d) + ' and ' + o.id + '. One of those two fights unlocks a move the player already has.');
  } else {
    droppedBy.set(d, o.id);
  }
}

const unreachable = [];
for (const m of BASE_MOVES) {
  if (!m || typeof m.id !== 'string') continue;
  ran();
  if (STARTING_KIT.indexOf(m.id) === -1 && !droppedBy.has(m.id)) unreachable.push(m.id);
}
for (const id of unreachable) {
  fail('unlocks', id,
    'is UNREACHABLE: it is not in the starting kit and no opponent drops it, so no ' +
    'player can ever hold it. A move nobody can reach is a content bug, not a ' +
    'secret. Set some opponent\'s `drop` in src/data/campaign.js to "' + id + '", ' +
    'or delete the move.');
}

/* ---- and the pool a player has to read: every non-drop move in a pool must
        already be unlockable by the time that fight happens ---------------- */
{
  const known = new Set(STARTING_KIT);
  for (const o of OPPONENTS) {
    if (!Array.isArray(o.pool)) continue;
    for (const p of o.pool) {
      ran();
      if (p === o.drop || !BASE_BY_ID[p]) continue;
      if (!known.has(p)) {
        fail('pools', o.id,
          'carries "' + p + '" but that move has not been dropped by anyone earlier ' +
          'in campaign order, so the player is being shown vocabulary they cannot ' +
          'read yet. Everything in a pool except the move being taught should ' +
          'already be reachable at that point in the run.');
      }
    }
    if (o.drop && BASE_BY_ID[o.drop]) known.add(o.drop);
  }
}

/* ========================================================================== */
/* 9. PACKS — a pack adds range, never power, and never uses the campaign     */
/* ========================================================================== */
//
// A pack is a named, ownable set of moves layered on the base twenty-seven.
// Everything above has already held pack moves to the ordinary move standard,
// because they went through the CATALOGUE. What is left is the four rules that
// only exist because packs exist, and every one of them is a rule that would
// otherwise be a paragraph in a comment:
//
//   1. Base-only play is still a complete, winnable game.
//   2. A pack adds RANGE, never POWER.
//   3. A pack unlocks INSIDE ITSELF. It is never a campaign drop.
//   4. Nothing in a pack may claim V1 evidence.
//
// The last one is not a formality. A pack is the most commercially motivated
// content in the project and therefore the place most likely to want to call
// an invention documented.

/** The one legal unlock route today. A second one has to be designed, not appear. */
const PACK_ROUTES = new Set(['pack']);

/** The three conditions a pack move may unlock on. */
const UNLOCK_KINDS = new Set(['pack', 'perform', 'crowd']);

/** The crowd's real range — 21 to 41 people (AUDIT-NOTES, "the crowd as a real system"). */
const CROWD_MIN = 21;
const CROWD_MAX = 41;

/** Best base score in each category, and per special. The anti-creep ceilings. */
const BEST_BASE_BY_CAT = Object.create(null);
const BEST_BASE_BY_SPECIAL = Object.create(null);
for (const m of BASE_MOVES) {
  if (!m || typeof m.base !== 'number') continue;
  if (!(m.cat in BEST_BASE_BY_CAT) || m.base > BEST_BASE_BY_CAT[m.cat]) BEST_BASE_BY_CAT[m.cat] = m.base;
  if (m.special) {
    if (!(m.special in BEST_BASE_BY_SPECIAL) || m.base > BEST_BASE_BY_SPECIAL[m.special]) {
      BEST_BASE_BY_SPECIAL[m.special] = m.base;
    }
  }
}
/** Which base move holds each ceiling, so a failure can name it. */
function holderOfCat(cat) {
  let best = null;
  for (const m of BASE_MOVES) if (m.cat === cat && (!best || m.base > best.base)) best = m;
  return best;
}
function holderOfSpecial(sp) {
  let best = null;
  for (const m of BASE_MOVES) if (m.special === sp && (!best || m.base > best.base)) best = m;
  return best;
}

/* ---- 9a. pack records ---------------------------------------------------- */

ran();
if (!Array.isArray(PACKS)) {
  fail('packs', 'PACKS', 'is not an array. src/data/packs.js must export a flat list of pack records.');
}

const seenPackIds = new Set();
const packOfMoveId = Object.create(null);

for (const pk of (Array.isArray(PACKS) ? PACKS : [])) {
  const label = (pk && pk.id) ? pk.id : 'PACKS[?]';
  ran(6);

  if (!pk || typeof pk !== 'object') {
    fail('packs', label, 'is not an object.');
    continue;
  }
  if (typeof pk.id !== 'string' || !/^[a-z0-9]+$/.test(pk.id)) {
    fail('packs', label,
      'has a malformed pack id ' + JSON.stringify(pk.id) + '. Lowercase a-z0-9 only — ' +
      'a pack id is a key in save data and in whatever a store writes, and it outlives ' +
      'every rename of the display name.');
  }
  if (seenPackIds.has(pk.id)) {
    fail('packs', pk.id, 'is a duplicate pack id. Owning one would silently own the other.');
  }
  seenPackIds.add(pk.id);

  if (typeof pk.name !== 'string' || !pk.name.trim()) fail('packs', label, 'has no display name.');
  if (typeof pk.region !== 'string' || !pk.region.trim()) {
    fail('packs', label,
      'has no region. A regional pack that cannot say which scene it came from is a ' +
      'bundle of moves with a nice name on it.');
  }
  if (typeof pk.blurb !== 'string' || pk.blurb.trim().length < 40) {
    fail('packs', label,
      'has no real blurb (got ' + JSON.stringify(pk.blurb) + '). The blurb is the only ' +
      'place the pack speaks in its own register, and it is what a store card shows.');
  }
  if (typeof pk.routeNote !== 'string' || !pk.routeNote.trim()) {
    fail('packs', label, 'has no routeNote — the plain sentence telling a player how the pack opens up.');
  }

  ran();
  if (!PACK_ROUTES.has(pk.unlockRoute)) {
    fail('packs', label,
      'declares unlockRoute ' + JSON.stringify(pk.unlockRoute) + '. The only route that ' +
      'exists is "pack": a pack unlocks inside itself. Beating an opponent is the base ' +
      'game\'s channel and all twenty-four drops are spoken for. If a second route is ' +
      'ever designed it gets added here deliberately, not by a typo.');
  }

  ran();
  if (!Array.isArray(pk.moves) || pk.moves.length < 4 || pk.moves.length > 6) {
    fail('packs', label,
      'holds ' + (Array.isArray(pk.moves) ? pk.moves.length : 'no') + ' moves. A pack is ' +
      '4 to 6: fewer is not worth owning, more and it stops being a reference set and ' +
      'starts being a second game.');
    continue;
  }

  /* ---- 9b. the moves in it ---------------------------------------------- */

  const inThisPack = new Set(pk.moves.map((m) => m && m.id).filter(Boolean));

  for (const m of pk.moves) {
    if (!m || typeof m.id !== 'string') continue;
    const id = m.id;
    ran(5);

    if (m.pack !== pk.id) {
      fail('packs', id,
        'sits inside pack "' + pk.id + '" but carries pack:"' + m.pack + '". That ' +
        'back-reference is stamped by sealPack() and is not authored, so a mismatch ' +
        'means something is rebuilding pack records by hand.');
    }
    if (packOfMoveId[id]) {
      fail('packs', id, 'appears in both "' + packOfMoveId[id] + '" and "' + pk.id + '". One move, one pack.');
    }
    packOfMoveId[id] = pk.id;

    if (BASE_BY_ID[id]) {
      fail('packs', id,
        'has the same id as a BASE move. Owning the pack would shadow "' + id + '" in ' +
        'MOVES_BY_ID and quietly replace a move the campaign teaches — the deck would ' +
        'still look right and the fight would be different.');
    }

    if (m.tier !== 'V3') {
      fail('packs', id,
        'is tier:"' + m.tier + '". EVERY pack move is V3. CONTRACT §8 closes the V1 ' +
        'list at thirteen documented ids and no pack move is on it. A pack is the most ' +
        'commercially motivated content in this project and therefore the place most ' +
        'likely to want to call an invention documented. It is our original work; label ' +
        'it honestly and it is still safe to ship.');
    }

    // --- anti-creep: category ceiling ---
    const catCeil = BEST_BASE_BY_CAT[m.cat];
    if (typeof catCeil === 'number' && typeof m.base === 'number' && m.base > catCeil) {
      const h = holderOfCat(m.cat);
      fail('packs', id,
        'has base ' + m.base + ', above the best BASE ' + m.cat + ' move (' +
        (h ? h.name + ' at ' + h.base : catCeil) + '). A PACK ADDS RANGE, NEVER POWER. ' +
        'The moment a bought move out-scores everything a player earned, the base ' +
        'twenty-seven stop being a complete game and start being a demo. Give it a ' +
        'different SHAPE instead — a body split, an ideal amplitude, a blend partner ' +
        'nothing in the base library offers.');
    }

    // --- anti-creep: per-special ceiling ---
    if (m.special) {
      ran();
      const spCeil = BEST_BASE_BY_SPECIAL[m.special];
      if (typeof spCeil !== 'number') {
        fail('packs', id,
          'carries special "' + m.special + '", which no base move carries. A pack may ' +
          'not introduce a mechanic — new mechanics go in the contract and into the base ' +
          'library first, where the balance sim can see them.');
      } else if (typeof m.base === 'number' && m.base > spCeil) {
        const h = holderOfSpecial(m.special);
        fail('packs', id,
          'has base ' + m.base + ' while carrying "' + m.special + '", above the best ' +
          'BASE move carrying it (' + (h ? h.name + ' at ' + h.base : spCeil) + '). Same ' +
          'rule, one level finer: a bought move may share a mechanical role with an ' +
          'earned one, and must not be a better version of it.');
      }
    }

    /* ---- 9c. the unlock, and whether anybody can get there --------------- */

    const u = m.unlock;
    ran(3);
    if (!u || typeof u !== 'object') {
      fail('packs', id,
        'has no `unlock`. Every pack move needs a route or nobody can reach it, and ' +
        '"it comes with the pack" is a route that has to be written down.');
      continue;
    }
    if (!UNLOCK_KINDS.has(u.on)) {
      fail('packs', id,
        'unlocks on ' + JSON.stringify(u.on) + '. The three conditions are "pack" ' +
        '(arrives with it), "perform" (use another move in the same pack N times) and ' +
        '"crowd" (draw a room of N people). Anything else is a promise the game never keeps.');
      continue;
    }
    if (typeof u.how !== 'string' || !u.how.trim()) {
      fail('packs', id, 'has no `unlock.how` — the sentence a player is actually shown. A condition nobody can read is a locked door with no sign on it.');
    }

    if (u.on === 'pack') {
      ran();
      if (u.after !== undefined || u.times !== undefined || u.people !== undefined) {
        fail('packs', id,
          'unlocks on "pack" but also carries ' +
          ['after', 'times', 'people'].filter((k) => u[k] !== undefined).join('/') +
          '. A move that arrives with the pack has no condition; the extra field would ' +
          'read as a gate that nothing enforces.');
      }
    }

    if (u.on === 'perform') {
      ran(2);
      if (!Number.isInteger(u.times) || u.times < 1 || u.times > 20) {
        fail('packs', id, 'unlocks on "perform" with times=' + JSON.stringify(u.times) + '. Must be a whole number 1-20 — past twenty it is not a route, it is a wall.');
      }
      if (typeof u.after !== 'string') {
        fail('packs', id, 'unlocks on "perform" but names no `after` move to perform.');
      }
    }

    if (u.on === 'crowd') {
      ran();
      if (!Number.isInteger(u.people) || u.people < CROWD_MIN || u.people > CROWD_MAX) {
        fail('packs', id,
          'unlocks on "crowd" with people=' + JSON.stringify(u.people) + ', outside the ' +
          'crowd\'s real range of ' + CROWD_MIN + '-' + CROWD_MAX + '. A number the crowd ' +
          'system can never reach is an unreachable move wearing a condition.');
      }
    }

    if (u.after !== undefined) {
      ran(2);
      if (u.after === id) {
        fail('packs', id, 'unlocks after itself.');
      } else if (!inThisPack.has(u.after)) {
        const where = BASE_BY_ID[u.after] ? 'a BASE move'
          : (packOfMoveId[u.after] ? 'in pack "' + packOfMoveId[u.after] + '"'
            : (PACK_BY_ID[u.after] ? 'in another pack' : 'nothing at all'));
        fail('packs', id,
          'unlocks after "' + u.after + '", which is ' + where + '. A pack ladder must be ' +
          'self-contained: somebody who buys this pack on a fresh save has to be able to ' +
          'open all of it without owning anything else and without reaching a particular ' +
          'point in the campaign.');
      }
    }
  }

  /* ---- 9d. walk the ladder ---------------------------------------------- */

  ran();
  const seeds = pk.moves.filter((m) => m && m.unlock && m.unlock.on === 'pack');
  if (!seeds.length) {
    fail('packs', pk.id,
      'has no move that arrives with the pack — every move in it is gated on another ' +
      'move in it. Buying this pack gets you a locked box.');
  }

  const reached = new Set(seeds.map((m) => m.id));
  let grew = true;
  while (grew) {
    grew = false;
    for (const m of pk.moves) {
      if (!m || reached.has(m.id) || !m.unlock) continue;
      const after = m.unlock.after;
      if (after === undefined || reached.has(after)) { reached.add(m.id); grew = true; }
    }
  }
  for (const m of pk.moves) {
    if (!m || typeof m.id !== 'string') continue;
    ran();
    if (!reached.has(m.id)) {
      fail('packs', m.id,
        'is UNREACHABLE inside "' + pk.id + '": walking the ladder from the moves that ' +
        'arrive with the pack never gets to it. That is a cycle (two moves each waiting ' +
        'on the other) or a chain hanging off something the walk could not reach. Owning ' +
        'the pack would leave this move permanently locked.');
    }
  }

  /* ---- 9e. pack prose is held to the move standard ---------------------- */

  const prose = [['blurb', pk.blurb], ['routeNote', pk.routeNote]];
  for (const m of pk.moves) {
    if (m && m.unlock && typeof m.unlock.how === 'string') prose.push([m.id + '.unlock.how', m.unlock.how]);
  }
  for (const [surface, text] of prose) {
    if (typeof text !== 'string' || !text) continue;
    applyRules('content-safety', pk.id, surface, text, MOCKERY_RULES, WHY_SAFETY);
    applyRules('content-safety', pk.id, surface, text, TARGET_RULES, WHY_SAFETY);
    applyRules('content-safety', pk.id, surface, text, PERSON_RULES,
      'No real person\'s name or likeness appears in this game, and a regional pack is ' +
      'exactly where one would try to get in — the documented figures in this scene are ' +
      'mostly teenagers and several are children (CONTRACT §7).');
    applyRules('content-safety', pk.id, surface, text, BRAND_RULES,
      'No branded garment or existing character (CONTRACT §7).');
    applyRules('content-safety', pk.id, surface, text, ATTRACT_RULES, WHY_ATTRACT);
    applyRules('voice', pk.id, surface, text, BALLROOM_RULES, WHY_BALLROOM);
  }
}

/* ---- 9f. THE CAMPAIGN IS NOT A PACK CHANNEL ------------------------------ */

for (const o of OPPONENTS) {
  ran();
  if (o && o.drop && PACK_BY_ID[o.drop]) {
    fail('packs', o.id,
      'drops "' + o.drop + '", which is a move in the "' + PACK_BY_ID[o.drop].pack + '" ' +
      'pack. Campaign opponents drop BASE moves only. Beating somebody is how the base ' +
      'game teaches you things and all twenty-four of those slots are spoken for; if a ' +
      'pack could also drop there, owning the pack would either duplicate an unlock or ' +
      'hand a non-owner content they never bought.');
  }
  if (o && Array.isArray(o.pool)) {
    for (const pid of o.pool) {
      ran();
      if (PACK_BY_ID[pid]) {
        fail('packs', o.id,
          'carries "' + pid + '" in its pool, which is a move in the "' +
          PACK_BY_ID[pid].pack + '" pack. An opponent may only throw moves that exist in ' +
          'a base-only game, or a player who owns nothing gets hit by something the deck ' +
          'cannot even name.');
      }
    }
  }
}
for (const id of STARTING_KIT) {
  ran();
  if (PACK_BY_ID[id]) {
    fail('packs', id, 'is in the STARTING_KIT and is pack content. Nobody starts holding something they have not got.');
  }
}

/* ---- 9g. BASE-ONLY PLAY IS STILL A COMPLETE GAME ------------------------- */
//
// The load-bearing check. Everything else in this section polices what a pack
// may contain; this one polices what owning nothing must still be.

{
  const ownedAtImport = ownedPacks();
  ran(4);

  if (ownedAtImport.length !== 0) {
    fail('packs', 'ownedPacks()',
      'is ' + JSON.stringify(Array.from(ownedAtImport)) + ' at import. A fresh module ' +
      'owns NOTHING. Ownership is written by a store or by save data at boot; a default ' +
      'that is not empty means the base game can never be tested as the base game.');
  }

  if (MOVES.length !== BASE_MOVES.length || BASE_MOVES.some((m, i) => MOVES[i] !== m)) {
    fail('packs', 'MOVES',
      'is not the base library with no pack owned (' + MOVES.length + ' moves against ' +
      BASE_MOVES.length + '). Own nothing and the game must be exactly the twenty-seven, ' +
      'in exactly CONTRACT §9 order — same deck, same unlock chain, same balance numbers ' +
      'in README.');
  }

  let missing = 0;
  for (const m of BASE_MOVES) if (moveById(m.id) !== m) missing++;
  if (missing) {
    fail('packs', 'moveById',
      'cannot resolve ' + missing + ' base move(s) with no pack owned.');
  }

  let leaked = null;
  for (const m of PACK_MOVES) if (moveById(m.id)) { leaked = m.id; break; }
  if (leaked) {
    fail('packs', leaked,
      'resolves through moveById() with no pack owned. Unowned pack content must be ' +
      'invisible to the library — the store lists it through the catalogue, the game ' +
      'never sees it.');
  }
}

/* ---- 9h. OWNING EVERYTHING MUST NOT DISTURB THE BASE --------------------- */
//
// This one mutates module state deliberately and puts it back. It is the only
// way to prove the thing that actually breaks a save file: that pack moves are
// APPENDED, so base indices 0..26 keep meaning what they meant.

{
  const before = Array.from(ownedPacks());
  setOwnedPacks(PACKS.map((pk) => pk.id));
  ran(4);

  if (BASE_MOVES.some((m, i) => MOVES[i] !== m)) {
    fail('packs', 'MOVES order',
      'changes when every pack is owned. Pack moves must be APPENDED after the ' +
      'twenty-seven, never interleaved: the deck grid, the roster generator and the ' +
      'default deck all read MOVES front to back, and a save file that stored an index ' +
      'would start pointing at a different move the day a player bought something.');
  }
  if (MOVES.length !== BASE_MOVES.length + PACK_MOVES.length) {
    fail('packs', 'MOVES length',
      'is ' + MOVES.length + ' with every pack owned; expected ' +
      (BASE_MOVES.length + PACK_MOVES.length) + '.');
  }

  const dupes = [];
  const seenAll = new Set();
  for (const m of MOVES) {
    if (seenAll.has(m.id)) dupes.push(m.id);
    seenAll.add(m.id);
  }
  if (dupes.length) {
    fail('packs', dupes.join(', '),
      'appear twice in MOVES with every pack owned. MOVES_BY_ID keeps only the last, so ' +
      'one of each pair is unreachable in every consumer.');
  }

  let unresolved = null;
  for (const m of PACK_MOVES) if (moveById(m.id) !== m) { unresolved = m.id; break; }
  if (unresolved) {
    fail('packs', unresolved, 'does not resolve through moveById() even when its pack is owned.');
  }

  setOwnedPacks(before);
  ran();
  if (MOVES.length !== BASE_MOVES.length) {
    fail('packs', 'setOwnedPacks',
      'did not restore the library when ownership was cleared. Disowning has to be as ' +
      'complete as owning or a refund leaves the moves behind.');
  }
}

/* ========================================================================== */
/* 10. THE ENGINE'S OWN VOCABULARY MUST MATCH THE CONTRACT                    */
/* ========================================================================== */

try {
  const battle = await import('../src/engine/battle.js');
  const engineSpecials = Object.keys(battle.SPECIALS || {});
  const engineQuirks = Object.keys(battle.QUIRKS || {});
  ran(2);
  for (const s of SPECIAL_NAMES) {
    if (engineSpecials.indexOf(s) === -1) {
      fail('engine', s, 'is a CONTRACT §6 special but battle.js SPECIALS does not define it — moves carrying it would do nothing.');
    }
  }
  for (const s of engineSpecials) {
    if (!SPECIAL_SET.has(s)) {
      fail('engine', s, 'is defined in battle.js SPECIALS but is not one of the twelve in CONTRACT §6. New mechanics go in the contract first.');
    }
  }
  for (const q of QUIRK_NAMES) {
    if (engineQuirks.indexOf(q) === -1) {
      fail('engine', q, 'is a CONTRACT §6 quirk but battle.js QUIRKS does not define it.');
    }
  }
  for (const q of engineQuirks) {
    if (!QUIRK_SET.has(q)) {
      fail('engine', q, 'is defined in battle.js QUIRKS but is not one of the four in CONTRACT §6.');
    }
  }
  ran();
  if (battle.ROUNDS !== 9) {
    fail('engine', 'ROUNDS', 'is ' + battle.ROUNDS + '; CONTRACT §10 fixes a battle at 9 rounds.');
  }
  ran();
  if (battle.BLEND_COST !== 100) {
    fail('engine', 'BLEND_COST', 'is ' + battle.BLEND_COST + '; CONTRACT §5 prices a blend at 100 hype.');
  }
} catch (err) {
  ran();
  fail('engine', 'src/engine/battle.js',
    'could not be imported, so the special/quirk vocabulary could not be checked: ' +
    (err && err.message ? err.message : String(err)));
}

/* ========================================================================== */
/* REPORT                                                                     */
/* ========================================================================== */

const counts = {
  moves: BASE_MOVES.length,
  opponents: OPPONENTS.length,
  acts: ACTS.length,
  fits: FITS.length,
  packs: PACKS.length,
  packMoves: PACK_MOVES.length,
  catalog: ALL_MOVES.length
};

if (failures.length === 0) {
  console.log('AURA OFF — validate');
  console.log('  ' + counts.moves + ' base moves · ' + counts.opponents + ' opponents · ' +
    counts.acts + ' acts · ' + counts.fits + ' fits');
  console.log('  ' + counts.packs + ' packs · ' + counts.packMoves + ' pack moves · ' +
    counts.catalog + ' moves in the catalogue, base-only play unaffected');
  console.log('  ' + V1_IDS.length + ' moves carry V1 evidence, ' +
    (counts.catalog - V1_IDS.length) + ' are labelled V3');
  console.log('  ' + checks + ' checks — data integrity, content safety, evidence tier: PASS');
  process.exit(0);
}

const bySection = new Map();
for (const f of failures) {
  if (!bySection.has(f.section)) bySection.set(f.section, []);
  bySection.get(f.section).push(f);
}

console.error('AURA OFF — validate: FAILED with ' + failures.length +
  ' problem' + (failures.length === 1 ? '' : 's') + ' (' + checks + ' checks ran)');
for (const [section, list] of bySection) {
  console.error('');
  console.error('── ' + section + ' ' + '─'.repeat(Math.max(2, 60 - section.length)));
  for (const f of list) {
    console.error('  ✗ ' + f.id);
    const words = f.why.split(/\s+/);
    let line = '      ';
    for (const w of words) {
      if (line.length + w.length + 1 > 84) { console.error(line); line = '      '; }
      line += (line.trim() ? ' ' : '') + w;
    }
    if (line.trim()) console.error(line);
  }
}
console.error('');
console.error('Nothing ships until these are zero.');
process.exit(1);
