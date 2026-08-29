/**
 * AURA OFF — src/ui/save.js
 *
 * THE ONLY FILE IN THE PROJECT THAT TOUCHES STORAGE. CONTRACT.md §1.
 *
 * If you are reaching for `localStorage` anywhere else, import from here
 * instead. Everything below is wrapped, sanitised and survives a browser that
 * refuses to store anything at all.
 *
 * ---------------------------------------------------------------------------
 * THE KEY IS NAMESPACED ON PURPOSE
 * ---------------------------------------------------------------------------
 * This origin already hosts other games, including one called "aura farm". A
 * bare `aura` or `save` key would be a real, silent, cross-game data loss bug,
 * so the key carries the studio and the game and the schema version:
 *
 *     skywolf:auraoff:v1
 *
 * ---------------------------------------------------------------------------
 * TWO TABS ARE THE NORMAL CASE, NOT THE EDGE CASE
 * ---------------------------------------------------------------------------
 * A read-once / write-wholesale save clobbers the other tab's progress the
 * moment somebody opens the game twice. Every write here goes through
 * `update()`, which RE-READS storage immediately before mutating, so:
 *
 *   - unlocked moves and beaten opponents UNION rather than overwrite
 *   - battle / win counters ADD to whatever is on disk right now
 *   - bests take a MAX
 *
 * ---------------------------------------------------------------------------
 * STORAGE IS ALLOWED TO BE ABSENT, BROKEN, FULL, OR LYING
 * ---------------------------------------------------------------------------
 * Private windows throw on write. Some browsers throw on the mere ACCESS of
 * `window.localStorage`. A quota-exceeded write throws mid-session. Anything
 * on disk may be truncated JSON, or valid JSON of the wrong shape, or a
 * hostile string. So: every entry point is wrapped, every field is validated
 * on the way in, and the moment a write fails the module falls back to an
 * in-memory mirror and keeps the game completely playable for this session.
 * Losing a save is a disappointment. Losing the run in progress is a bug.
 */

import { STARTING_KIT } from '../data/campaign.js?v=20260829b';

/** Storage key. Namespaced against the other games on this origin. */
export const SAVE_KEY = 'skywolf:auraoff:v1';

/** Schema version. Bump only with a migration in `sanitise()`. */
export const SAVE_VERSION = 1;

/** Hard caps, so a corrupted or hostile blob cannot balloon memory. */
const MAX_IDS = 64;
const MAX_STR = 40;

/* -------------------------------------------------------------------------- */
/* THE MIRROR                                                                  */
/* -------------------------------------------------------------------------- */

/** Last known good state. Also the whole state when storage is unavailable. */
let _mirror = null;

/** True once a read or a write has actually thrown. */
let _degraded = false;

/* --------------------------------------------------------------------------
 * THE REACH LEDGER — what the last recorded battle did to your reputation
 * --------------------------------------------------------------------------
 * `reputation()` is a level. This is the STEP: how many names the last call to
 * `recordBattle()` actually added to `beaten`, measured across that one write.
 *
 * It exists because the clip loop has to be honest. `hud.clipOut()` shows the
 * square filling up, and the only way it can refuse to fake that is to be told
 * the true before-and-after rather than to infer one. If a battle added nobody
 * — a rematch against somebody already beaten, a loss, a second tab that got
 * there first — `gain` is 0 and the beat does not play.
 *
 * It carries a SEQUENCE NUMBER, not a timestamp. There is no clock in this
 * file, the integration suite runs on a virtual one, and "has this already been
 * spent?" is a question about ordering rather than about time.
 *
 * It is deliberately NOT part of the saved state. A reputation step is worth
 * exactly one moment on screen, in the session that earned it; a step that
 * survived a reload would replay the beat for a fight the player finished
 * yesterday.
 */
let _reachSeq = 0;
let _reach = null;

/** Cached storage handle; `undefined` means "not probed yet". */
let _store;

/**
 * Get the backing store, or null. Accessing `window.localStorage` can itself
 * throw (Safari with cookies blocked, some embedded webviews), which is why
 * the property read is inside the try.
 * @returns {Storage|null}
 */
function store() {
  if (_store !== undefined) return _store;
  _store = null;
  try {
    if (typeof window === 'undefined' || !window.localStorage) return _store;
    const s = window.localStorage;
    // Probe: a store can exist and still reject every write.
    const probe = SAVE_KEY + ':probe';
    s.setItem(probe, '1');
    s.removeItem(probe);
    _store = s;
  } catch (e) {
    _store = null;
    _degraded = true;
  }
  return _store;
}

/**
 * Is progress actually being written to disk?
 * The UI does not currently surface this — it is here so that a future
 * "your progress is not being saved" notice has something true to read.
 * @returns {boolean}
 */
export function storageOk() {
  return !!store() && !_degraded;
}

/* -------------------------------------------------------------------------- */
/* SHAPE                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * A brand new run.
 *
 * `deck` opens as the starting kit (CONTRACT §9) — one FLEX and two FLOW, no
 * BAIT, so the first time anybody clowns in front of the player it is somebody
 * else doing it.
 *
 * @returns {Object}
 */
export function defaultState() {
  return {
    v: SAVE_VERSION,
    /** move ids the player owns, in the order they were learned */
    deck: STARTING_KIT.slice(),
    /** opponent ids already beaten, in the order they fell */
    beaten: [],
    /** chosen fit id — remembered between fights so the ritual is one tap */
    fit: 'uniform',
    /** lifetime counters. These ADD on merge. */
    battles: 0,
    wins: 0,
    losses: 0,
    flawless: 0,
    /** bests. These MAX on merge. */
    bestAura: 0,
    bestMeter: 0,
    /** one-shots */
    seenHow: false,
    seenUpriver: false
  };
}

function clampInt(v, lo, hi) {
  const n = typeof v === 'number' && isFinite(v) ? Math.round(v) : 0;
  return n < lo ? lo : n > hi ? hi : n;
}

function cleanId(v) {
  if (typeof v !== 'string') return null;
  const s = v.slice(0, MAX_STR);
  return /^[a-z0-9_-]+$/.test(s) ? s : null;
}

/** A unique, order-preserving, capped list of safe ids. */
function cleanIdList(v, seed) {
  const out = [];
  const seen = Object.create(null);
  const push = function (raw) {
    const id = cleanId(raw);
    if (!id || seen[id]) return;
    seen[id] = 1;
    if (out.length < MAX_IDS) out.push(id);
  };
  if (seed) for (let i = 0; i < seed.length; i++) push(seed[i]);
  if (Array.isArray(v)) for (let i = 0; i < v.length; i++) push(v[i]);
  return out;
}

/**
 * Coerce anything at all into a valid state. This is the trust boundary: past
 * this function nothing in the game re-checks a saved value.
 * @param {*} raw
 * @returns {Object}
 */
function sanitise(raw) {
  const d = defaultState();
  if (!raw || typeof raw !== 'object') return d;

  // Future: if (raw.v < SAVE_VERSION) migrate here, oldest first.

  return {
    v: SAVE_VERSION,
    // The starting kit is seeded first, so a save that somehow lost it still
    // opens with three playable moves rather than an empty deck.
    deck: cleanIdList(raw.deck, STARTING_KIT),
    beaten: cleanIdList(raw.beaten, null),
    fit: cleanId(raw.fit) || d.fit,
    battles: clampInt(raw.battles, 0, 999999),
    wins: clampInt(raw.wins, 0, 999999),
    losses: clampInt(raw.losses, 0, 999999),
    flawless: clampInt(raw.flawless, 0, 999999),
    bestAura: clampInt(raw.bestAura, 0, 99999999),
    bestMeter: clampInt(raw.bestMeter, 0, 100),
    seenHow: !!raw.seenHow,
    seenUpriver: !!raw.seenUpriver
  };
}

/* -------------------------------------------------------------------------- */
/* READ / WRITE                                                                */
/* -------------------------------------------------------------------------- */

/**
 * The current saved state, freshly parsed from storage every call so a second
 * tab's progress is visible here.
 *
 * Never throws. Never returns null. A missing, empty, truncated, non-JSON or
 * wrong-shaped record all come back as a clean default.
 *
 * @returns {Object}
 */
/**
 * Fold the in-memory mirror forward onto what is currently on disk.
 *
 * ONLY used once a write has actually failed (`_degraded`). Until then disk is
 * authoritative and this is never called.
 *
 * Why it has to exist: a quota-exceeded write throws MID-SESSION. The mirror
 * then holds the live run and the disk still holds the state from before the
 * failure. Without this fold, the very next `read()` would hand the game that
 * older disk record and the player would watch the last few rounds of progress
 * quietly roll back. Losing a save is a disappointment; losing the run in
 * progress is a bug.
 *
 * Counters take a MAX here, not a sum. The mirror already contains every
 * increment this tab has made, including the ones that DID reach disk before
 * the failure, so adding would double-count our own writes. Max never loses
 * this tab's run and never inflates a number.
 *
 * @param {Object} disk   sanitised state read from storage
 * @param {Object} mirror sanitised last-known-good in-memory state
 * @returns {Object}
 */
function mergeForward(disk, mirror) {
  const out = sanitise(disk);
  const m = sanitise(mirror);
  const maxOf = function (a, b) { return a > b ? a : b; };

  // unions — an unlock must never disappear
  for (let i = 0; i < m.deck.length; i++) {
    if (out.deck.indexOf(m.deck[i]) === -1 && out.deck.length < MAX_IDS) out.deck.push(m.deck[i]);
  }
  for (let j = 0; j < m.beaten.length; j++) {
    if (out.beaten.indexOf(m.beaten[j]) === -1 && out.beaten.length < MAX_IDS) out.beaten.push(m.beaten[j]);
  }

  out.battles = maxOf(out.battles, m.battles);
  out.wins = maxOf(out.wins, m.wins);
  out.losses = maxOf(out.losses, m.losses);
  out.flawless = maxOf(out.flawless, m.flawless);
  out.bestAura = maxOf(out.bestAura, m.bestAura);
  out.bestMeter = maxOf(out.bestMeter, m.bestMeter);

  // one-shots are sticky in both directions
  out.seenHow = out.seenHow || m.seenHow;
  out.seenUpriver = out.seenUpriver || m.seenUpriver;

  // the fit is a live choice, so this session's pick wins
  out.fit = m.fit;
  return out;
}

export function read() {
  const s = store();
  if (!s) {
    if (!_mirror) _mirror = defaultState();
    return sanitise(_mirror);
  }
  let raw = null;
  try {
    raw = s.getItem(SAVE_KEY);
  } catch (e) {
    _degraded = true;
    if (!_mirror) _mirror = defaultState();
    return sanitise(_mirror);
  }
  if (raw == null || raw === '') {
    _mirror = _mirror || defaultState();
    return sanitise(_mirror);
  }
  let parsed = null;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    // Corrupted record. Do not delete it — a half-written blob is still the
    // only trace of a run, and a future migration might rescue it. Just do
    // not trust it today.
    parsed = null;
  }
  let clean = sanitise(parsed);
  // Disk is authoritative right up until the moment a write fails. After that
  // the disk record is behind this session and has to be folded forward.
  if (_degraded && _mirror) clean = mergeForward(clean, _mirror);
  _mirror = clean;
  return clean;
}

/**
 * Write a whole state. Sanitises on the way out too, so nothing invalid can
 * reach disk even if a caller hands us something odd.
 * @param {Object} state
 * @returns {Object} the state as written (or as mirrored, when degraded)
 */
function write(state) {
  const clean = sanitise(state);
  _mirror = clean;
  const s = store();
  if (!s) return clean;
  try {
    s.setItem(SAVE_KEY, JSON.stringify(clean));
  } catch (e) {
    // Quota, private mode, or a store that lied to the probe. The run
    // continues from the mirror.
    _degraded = true;
  }
  return clean;
}

/**
 * THE ONLY WAY TO CHANGE A SAVE.
 *
 * Re-reads storage, hands the fresh state to `mutate`, writes the result.
 * That read-modify-write is what stops a second tab from being clobbered, so
 * mutate the object you are given rather than building one from a stale copy.
 *
 *     update(function (s) { s.wins += 1; });                 // adds
 *     update(function (s) { s.bestAura = Math.max(s.bestAura, v); });
 *
 * @param {(state: Object) => (Object|void)} mutate
 * @returns {Object} the new state
 */
export function update(mutate) {
  const fresh = read();
  let next = fresh;
  try {
    const returned = typeof mutate === 'function' ? mutate(fresh) : null;
    if (returned && typeof returned === 'object') next = returned;
  } catch (e) {
    // A throwing mutator must not corrupt the save or kill the caller.
    return fresh;
  }
  return write(next);
}

/**
 * Wipe the save and start over. Returns the fresh default state.
 * @returns {Object}
 */
export function reset() {
  const s = store();
  if (s) {
    try { s.removeItem(SAVE_KEY); } catch (e) { _degraded = true; }
  }
  _mirror = defaultState();
  // A wiped save has no history, so an unspent reputation step from the run
  // that was just thrown away must not survive to play a beat over the new one.
  _reach = null;
  return sanitise(_mirror);
}

/* -------------------------------------------------------------------------- */
/* THE FIVE THINGS THE GAME ACTUALLY SAVES                                     */
/* -------------------------------------------------------------------------- */

/**
 * Learn a move. Union, so two tabs both winning cannot lose an unlock.
 * @param {string} id
 * @returns {Object} the new state
 */
export function unlockMove(id) {
  const clean = cleanId(id);
  if (!clean) return read();
  return update(function (s) {
    if (s.deck.indexOf(clean) === -1 && s.deck.length < MAX_IDS) s.deck.push(clean);
  });
}

/**
 * Record a finished battle. Counters add, bests take a max, the beaten list
 * unions — all against whatever is on disk at this instant.
 *
 * @param {Object} r
 * @param {string} r.opponentId
 * @param {boolean} r.won
 * @param {boolean} [r.flawless]
 * @param {string|null} [r.drop]      move id learned by winning
 * @param {number} [r.aura]           your aura total this battle
 * @param {number} [r.meter]          closing meter
 * @returns {Object} the new state
 */
export function recordBattle(r) {
  const o = r || {};
  const foe = cleanId(o.opponentId);
  const drop = cleanId(o.drop);
  /* Read the reputation BEFORE the write, so the step recorded below is the
     one this battle actually caused rather than a difference against a stale
     copy. `update()` re-reads storage itself, so this costs one extra parse
     once per battle and buys the clip loop a number it is allowed to show. */
  const repBefore = read().beaten.length;
  const after = update(function (s) {
    s.battles += 1;
    if (o.won) {
      s.wins += 1;
      if (foe && s.beaten.indexOf(foe) === -1 && s.beaten.length < MAX_IDS) s.beaten.push(foe);
      if (drop && s.deck.indexOf(drop) === -1 && s.deck.length < MAX_IDS) s.deck.push(drop);
      if (o.flawless) s.flawless += 1;
    } else {
      s.losses += 1;
    }
    const aura = clampInt(o.aura, 0, 99999999);
    if (aura > s.bestAura) s.bestAura = aura;
    const meter = clampInt(o.meter, 0, 100);
    if (meter > s.bestMeter) s.bestMeter = meter;
  });

  const repAfter = after.beaten.length;
  _reachSeq += 1;
  _reach = {
    seq: _reachSeq,
    from: repBefore,
    to: repAfter,
    gain: repAfter > repBefore ? repAfter - repBefore : 0,
    foe: foe,
    won: !!o.won
  };
  return after;
}

/**
 * Look at the last reputation step without spending it.
 *
 * @returns {{seq: number, from: number, to: number, gain: number,
 *            foe: string|null, won: boolean}|null}
 */
export function lastReach() {
  if (!_reach) return null;
  return {
    seq: _reach.seq, from: _reach.from, to: _reach.to,
    gain: _reach.gain, foe: _reach.foe, won: _reach.won
  };
}

/**
 * Take the last reputation step and spend it. The next call returns `null`
 * until another battle is recorded.
 *
 * The clip loop is a ONE-SHOT: the square fills up once per fight that earned
 * it. Consuming here rather than time-boxing in the HUD means a re-render, a
 * second screen, or a stray second call cannot play the same arrival twice.
 *
 * @returns {Object|null} the step, or null if there is nothing unspent
 */
export function takeReach() {
  const r = lastReach();
  _reach = null;
  return r;
}

/**
 * Remember the fit, so stepping up again is one tap.
 * @param {string} id
 * @returns {Object} the new state
 */
export function setFit(id) {
  const clean = cleanId(id);
  if (!clean) return read();
  return update(function (s) { s.fit = clean; });
}

/**
 * Mark a one-shot as seen (the how-it-scores page, the Act 5 reveal).
 * @param {'seenHow'|'seenUpriver'} flag
 * @returns {Object} the new state
 */
export function markSeen(flag) {
  if (flag !== 'seenHow' && flag !== 'seenUpriver') return read();
  return update(function (s) { s[flag] = true; });
}

/**
 * Reputation: how many people turn out to watch you. It is the count of
 * opponents you have actually beaten, which is the only honest measure the
 * game has of whether anyone has heard of you.
 * @param {Object} [state] pass one in to avoid a second storage read
 * @returns {number}
 */
export function reputation(state) {
  const s = state || read();
  return s.beaten.length;
}

export default {
  KEY: SAVE_KEY,
  version: SAVE_VERSION,
  read: read,
  update: update,
  reset: reset,
  defaultState: defaultState,
  unlockMove: unlockMove,
  recordBattle: recordBattle,
  setFit: setFit,
  markSeen: markSeen,
  reputation: reputation,
  lastReach: lastReach,
  takeReach: takeReach,
  storageOk: storageOk
};
