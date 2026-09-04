/**
 * The only module in Keepsies that touches storage.
 *
 * Nothing else reads or writes localStorage, ever. That rule is what makes the
 * Phase 4 swap to Firestore a change of backend rather than a rewrite, and it is
 * what makes the two scars below fixable in one place.
 *
 * ⛔ SCAR ONE: TWO TABS CLOBBER A SAVE THAT IS READ ONCE AND WRITTEN WHOLESALE.
 * The fleet has lost player data to this. Every write here is a read, a merge and
 * then a write: marbles union by uid, counters ADD, bests take the MAX, and the
 * schema version is checked again on the way in. A destructive wipe is the only
 * thing that bypasses the merge, and it says so at the call site.
 *
 * ⛔ SCAR TWO: A WRITE PROBE, BECAUSE STORAGE CAN EXIST AND STILL THROW. Safari
 * in private mode hands you a localStorage object whose setItem raises. So the
 * backend is chosen by writing to it, not by asking whether it is there, and if
 * nothing can be written the game runs on an in memory store and says so rather
 * than dying on the first save.
 */

export const SCHEMA_VERSION = 1;
const KEY = 'keepsies.save.v1';

/* ---------------------------------------------------------------- backends */

function probe(store) {
  try {
    const k = '__keepsies_probe__';
    store.setItem(k, '1');
    store.removeItem(k);
    return true;
  } catch (e) { return false; }
}

function pickBackend() {
  if (typeof localStorage !== 'undefined' && probe(localStorage)) return { name: 'local', store: localStorage };
  if (typeof sessionStorage !== 'undefined' && probe(sessionStorage)) return { name: 'session', store: sessionStorage };
  const mem = {};
  return {
    name: 'memory',
    store: {
      getItem: (k) => (k in mem ? mem[k] : null),
      setItem: (k, v) => { mem[k] = String(v); },
      removeItem: (k) => { delete mem[k]; }
    }
  };
}

let backend = null;
const listeners = [];
const be = () => (backend || (backend = pickBackend()));

/** Which store the game ended up on. `memory` means nothing survives a reload. */
export function backendName() { return be().name; }

/* ------------------------------------------------------------- the schema */

/** A save with every field present, so nothing downstream has to guess. */
export function blank() {
  return {
    v: SCHEMA_VERSION,
    profile: {
      name: 'You', handedness: null,
      calib: { max: null, samples: [] },
      level: 1, xp: 0, league: 1, techniques: []
    },
    inventory: [],
    showcase: [],
    wallet: { sunbeams: 0 },
    clayPool: { count: 10, lastRegen: 0 },
    bags: { arena: [] },
    bossTrophies: {},
    pot: { inMatch: false, escrow: [] },
    chores: {},
    streak: { days: 0, last: 0 },
    settings: {
      sound: true, haptics: true, reduceMotion: false,
      pullback: false, rookieAssist: true, quality: null
    },
    stats: { matches: 0, wins: 0, pocketed: 0, shots: 0, bestPocketedInATurn: 0 },
    seen: { rules: false, onboarded: false }
  };
}

/**
 * The migration chain. Each step takes vN to vN+1 and NEVER breaks an old save.
 * There is nothing to migrate yet and the chain exists anyway, because the first
 * time it is needed is the worst possible time to design it.
 */
const MIGRATIONS = {
  // 0: (s) => { ...; s.v = 1; return s; }
};

export function migrate(raw) {
  let s = raw;
  let guard = 0;
  while (s.v < SCHEMA_VERSION && guard++ < 32) {
    const step = MIGRATIONS[s.v];
    if (!step) { s.v = SCHEMA_VERSION; break; }   // a version we no longer know: adopt, do not lose
    s = step(s);
  }
  // fill anything a hand written or ancient save is missing, without overwriting
  return fill(s, blank());
}

function fill(target, template) {
  for (const k of Object.keys(template)) {
    if (target[k] === undefined || target[k] === null) target[k] = clone(template[k]);
    else if (isPlain(template[k]) && isPlain(target[k])) fill(target[k], template[k]);
  }
  return target;
}
const isPlain = (v) => v && typeof v === 'object' && !Array.isArray(v);
const clone = (v) => JSON.parse(JSON.stringify(v));

/* ------------------------------------------------------------- load, save */

/** Read what is on disk right now. Never cached: another tab may have written. */
export function load() {
  let raw = null;
  try { raw = be().store.getItem(KEY); } catch (e) { raw = null; }
  if (!raw) return blank();
  let parsed;
  try { parsed = JSON.parse(raw); } catch (e) { return blank(); }
  if (!parsed || typeof parsed !== 'object') return blank();
  return migrate(parsed);
}

/**
 * Merge a change into whatever is on disk and write the result.
 *
 * `change` is a function that receives the CURRENT save and mutates it. It is
 * called after the read, so two tabs racing each other both land: the second one
 * sees the first one's write and adds to it.
 */
export function update(change) {
  const current = load();
  change(current);
  return write(current);
}

/** Merge a partial save into disk. Marbles union, counters add, bests max. */
export function merge(partial) {
  return update((s) => {
    if (partial.inventory) {
      const have = new Set(s.inventory.map(m => m.uid));
      for (const m of partial.inventory) if (!have.has(m.uid)) s.inventory.push(m);
    }
    if (partial.wallet && partial.wallet.sunbeams) s.wallet.sunbeams += partial.wallet.sunbeams;
    if (partial.stats) {
      for (const k of Object.keys(partial.stats)) {
        if (k.indexOf('best') === 0) s.stats[k] = Math.max(s.stats[k] || 0, partial.stats[k]);
        else s.stats[k] = (s.stats[k] || 0) + partial.stats[k];
      }
    }
    if (partial.profile) {
      for (const k of Object.keys(partial.profile)) {
        if (k === 'techniques') {
          for (const t of partial.profile.techniques) if (s.profile.techniques.indexOf(t) < 0) s.profile.techniques.push(t);
        } else s.profile[k] = partial.profile[k];
      }
    }
    if (partial.settings) Object.assign(s.settings, partial.settings);
    if (partial.seen) Object.assign(s.seen, partial.seen);
  });
}

function write(save) {
  save.v = SCHEMA_VERSION;
  try { be().store.setItem(KEY, JSON.stringify(save)); } catch (e) { }
  for (const fn of listeners) { try { fn(save); } catch (e) { } }
  return save;
}

/**
 * Overwrite everything, bypassing the merge. The ONLY caller is a deliberate
 * reset from settings, and it is separate from `update` so that no ordinary code
 * path can reach it by accident.
 */
export function wipe() {
  const fresh = blank();
  try { be().store.setItem(KEY, JSON.stringify(fresh)); } catch (e) { }
  for (const fn of listeners) { try { fn(fresh); } catch (e) { } }
  return fresh;
}

/** Told when this tab writes, and when another tab does. */
export function onChange(fn) {
  listeners.push(fn);
  return () => { const i = listeners.indexOf(fn); if (i >= 0) listeners.splice(i, 1); };
}

/** Listen for the other tab. Call once at boot, from the browser only. */
export function watchOtherTabs() {
  if (typeof window === 'undefined' || !window.addEventListener) return;
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return;
    const s = load();
    for (const fn of listeners) { try { fn(s); } catch (err) { } }
  });
}
