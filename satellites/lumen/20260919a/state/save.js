// Versioned save (section 9): { v, profile, cabinet[], unlocks, stats, currentRun? }. A run is stored only as
// its options (seed, Lantern, loans, Vigil) plus the action log, so any run replays exactly.
// Storage: IndexedDB is the canonical store; every write is mirrored synchronously to localStorage, so a tab
// killed mid-cast still has the cast (IndexedDB transactions may not finish before a kill). Loading takes
// whichever copy is newer. JSON export / import round-trips the whole save.
export const SAVE_VERSION = 2;
const KEY = 'lumen.save';
const DB_NAME = 'lumen';
const STORE = 'save';

export function emptySave() {
  return {
    v: SAVE_VERSION,
    savedAt: 0,
    profile: { prefs: { muted: false, reducedMotion: false, patterns: false, lowPower: false }, tutorialDone: false, seen: {} },
    cabinet: [],
    dust: 0,
    unlocks: { lanterns: ['candle'], vigil: {} },
    achievements: {},
    stats: { runs: 0, wins: 0, totalLux: 0, bestCast: 0, dawns: 0, eclipsesBeaten: 0, endlessBest: 0 },
    currentRun: null,
  };
}

// Migrations: each step takes save vN and returns vN+1. Unknown future versions are refused.
const MIGRATIONS = {
  // v1 kept the tutorial flag and prefs at the top level
  1: (s) => {
    const out = { ...emptySave(), ...s, v: 2 };
    out.profile = { ...emptySave().profile, ...(s.profile || {}) };
    if (s.tutorialDone !== undefined) { out.profile.tutorialDone = !!s.tutorialDone; delete out.tutorialDone; }
    if (s.prefs) { out.profile.prefs = { ...out.profile.prefs, ...s.prefs }; delete out.prefs; }
    out.dust = s.dust | 0;
    return out;
  },
};

export function migrate(s) {
  if (!s || typeof s !== 'object') return emptySave();
  let cur = { ...s };
  if (!cur.v) cur.v = 1;
  if (cur.v > SAVE_VERSION) throw new Error(`save version ${cur.v} is newer than this game (${SAVE_VERSION})`);
  while (cur.v < SAVE_VERSION) {
    const f = MIGRATIONS[cur.v];
    if (!f) throw new Error(`no migration from save v${cur.v}`);
    cur = f(cur);
  }
  // fill any fields added since (defaults never override saved values)
  const base = emptySave();
  return { ...base, ...cur, profile: { ...base.profile, ...cur.profile, prefs: { ...base.profile.prefs, ...(cur.profile || {}).prefs } }, unlocks: { ...base.unlocks, ...cur.unlocks }, stats: { ...base.stats, ...cur.stats } };
}

function lsGet() { try { const t = localStorage.getItem(KEY); return t ? JSON.parse(t) : null; } catch { return null; } }
function lsSet(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); return true; } catch { return false; } }

function idb() {
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch { resolve(null); }
  });
}
async function idbGet() {
  const db = await idb();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const r = db.transaction(STORE, 'readonly').objectStore(STORE).get('save');
      r.onsuccess = () => resolve(r.result || null);
      r.onerror = () => resolve(null);
    } catch { resolve(null); }
  });
}
async function idbSet(s) {
  const db = await idb();
  if (!db) return false;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(s, 'save');
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch { resolve(false); }
  });
}

export async function load() {
  const [a, b] = [lsGet(), await idbGet()];
  const pick = !a ? b : !b ? a : (a.savedAt || 0) >= (b.savedAt || 0) ? a : b;
  try { return migrate(pick); } catch (err) { console.warn(err); return emptySave(); }
}

let pending = null;
// Save now: the localStorage mirror is written synchronously before this returns.
export function save(s) {
  s.savedAt = Date.now();
  s.v = SAVE_VERSION;
  lsSet(s);
  const snap = JSON.parse(JSON.stringify(s));
  pending = idbSet(snap);
  return pending;
}
export const flushed = () => pending || Promise.resolve(true);

export function exportJSON(s) {
  return JSON.stringify({ ...s, exportedFrom: 'lumen', exportedAt: Date.now() }, null, 1);
}

export function importJSON(text) {
  const obj = JSON.parse(text);
  delete obj.exportedFrom; delete obj.exportedAt;
  return migrate(obj);
}
