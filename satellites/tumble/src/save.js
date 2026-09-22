// Save data (DESIGN 13.6): IndexedDB, versioned, with JSON export and import in settings.
// The data shape and migrations are pure functions so Node can test them (DESIGN 15.8).

export const SAVE_VERSION = 2;
// Loads completed that reach each tier (must match TIER_AT in loadgen.js; tests/save.test.mjs checks)
export const TIER_LOADS = [0, 2, 4, 7, 10, 14, 19, 25, 32, 40];
const DB = 'tumble';
const STORE = 'save';
const KEY = 'main';
const LS_KEY = 'tumble-save-v';

export function freshSave(now = Date.now()) {
  return {
    version: SAVE_VERSION,
    profile: { version: SAVE_VERSION, createdAt: now, settings: {}, seenHowTo: false, name: '', lastSize: 'regular', lastMode: 'laundry', lastSub: 'timed' },
    economy: { lint: 0, quarters: 0, reunions: 0 },
    drawer: [],        // [{ sockSeed | heroId, foundAt, count, odd }]
    oddBin: [],        // [{ sockSeed, waitingSince, loadsWaited }]
    clothesline: [],   // [pegId]
    unlocks: [],       // [itemId]
    equipped: { basket: 'basket-wicker', dryer: 'dryer-standard', radio: null, ball: 'ball-tight', trail: null, decor: [] },
    stats: {
      loads: 0, pairs: 0, shotsMade: 0, shotsMissed: 0, cleanLoads: 0, bestStreak: 0,
      tierByMode: { laundry: 0, rush: 0 }, loadsByMode: { laundry: 0, rush: 0 },
      flips: 0, nightLoads: 0, reunions: 0, rushLoads: 0, rushPairs: 0, powersUsed: 0, spotless: 0, binned: 0,
    },
    lore: [],          // [pageId]
    daily: { date: null, rushScore: null, played: false, laundryPlays: 0 },
    dailyHistory: [],  // [{ date, score, rare: [seeds] }] (Daily Rush)
    dailyDays: [],     // ['YYYY-MM-DD'] every day a Daily of either kind was finished (the wall calendar)
    seen: {},          // one time notes already shown
  };
}

// ---------- migrations: each takes version n-1 and returns version n ----------
export const MIGRATIONS = {
  // v1 was the DESIGN 13.6 shape exactly
  2: (s) => {
    const f = freshSave(s.profile && s.profile.createdAt);
    const out = {
      ...f,
      ...s,
      version: 2,
      profile: { ...f.profile, ...(s.profile || {}), version: 2 },
      economy: { ...f.economy, ...(s.economy || {}) },
      stats: { ...f.stats, ...(s.stats || {}), tierByMode: { ...f.stats.tierByMode, ...((s.stats || {}).tierByMode || {}) } },
      daily: { ...f.daily, ...(s.daily || {}) },
      equipped: { ...f.equipped },
      dailyHistory: [],
      seen: {},
    };
    // v1 drawer entries had no odd flag
    out.drawer = (s.drawer || []).map((d) => ({ odd: false, ...d }));
    // v1 kept progress only as a tier per mode; v2 derives the tier from Loads per mode, so rebuild those
    const tb = (s.stats && s.stats.tierByMode) || {};
    const lz = TIER_LOADS[tb.laundry || 0] || 0, rz = TIER_LOADS[tb.rush || 0] || 0;
    const total = (s.stats && s.stats.loads) || 0;
    out.stats.loadsByMode = { laundry: Math.max(lz, Math.min(total, total - rz)), rush: rz };
    out.stats.reunions = out.stats.reunions || out.economy.reunions || 0;
    return out;
  },
};

export function migrate(s) {
  if (!s || typeof s !== 'object') return freshSave();
  let v = s.version || (s.profile && s.profile.version) || 1;
  let cur = s;
  while (v < SAVE_VERSION) {
    const m = MIGRATIONS[v + 1];
    if (!m) throw new Error('no migration to v' + (v + 1));
    cur = m(cur);
    v = cur.version;
  }
  if (v > SAVE_VERSION) throw new Error('This save comes from a newer version of TUMBLE. Update the game, then try again.');
  return validate(cur);
}

export function validate(s) {
  const f = freshSave(s.profile && s.profile.createdAt);
  const out = { ...f, ...s };
  for (const k of ['profile', 'economy', 'stats', 'daily', 'equipped']) out[k] = { ...f[k], ...(s[k] || {}) };
  out.stats.tierByMode = { ...f.stats.tierByMode, ...((s.stats || {}).tierByMode || {}) };
  out.stats.loadsByMode = { ...f.stats.loadsByMode, ...((s.stats || {}).loadsByMode || {}) };
  for (const k of ['drawer', 'oddBin', 'clothesline', 'unlocks', 'lore', 'dailyHistory', 'dailyDays']) out[k] = Array.isArray(s[k]) ? s[k] : [];
  // an imported save is untrusted: keep only well formed entries, with numbers as numbers and ids as plain ids
  out.drawer = out.drawer.filter((d) => d && typeof d === 'object' && (seedOk(d.sockSeed) || idOk(d.heroId))).map((d) => ({
    ...(d.heroId !== undefined && idOk(d.heroId) ? { heroId: d.heroId } : { sockSeed: d.sockSeed }),
    foundAt: num(d.foundAt), count: num(d.count), odd: !!d.odd,
  }));
  out.oddBin = out.oddBin.filter((e) => e && typeof e === 'object' && seedOk(e.sockSeed)).map((e) => ({ sockSeed: e.sockSeed, waitingSince: num(e.waitingSince), loadsWaited: num(e.loadsWaited) }));
  for (const k of ['clothesline', 'unlocks']) out[k] = out[k].filter(idOk);
  out.lore = out.lore.map(Number).filter((n) => Number.isInteger(n) && n > 0 && n < 100);
  out.dailyHistory = out.dailyHistory.filter((d) => d && dateOk(d.date)).map((d) => ({ date: d.date, score: num(d.score), rare: Array.isArray(d.rare) ? d.rare.filter(seedOk) : [] }));
  out.dailyDays = out.dailyDays.filter(dateOk);
  for (const d of out.dailyHistory) if (!out.dailyDays.includes(d.date)) out.dailyDays.push(d.date);
  for (const k of ['lint', 'quarters', 'reunions']) { const n = Number(out.economy[k]); out.economy[k] = Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0; }
  out.version = SAVE_VERSION;
  return out;
}

function num(v) { const n = Number(v); return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0; }
function seedOk(v) { return typeof v === 'string' && v.length <= 400 && /^[0-9a-z:~._-]+$/i.test(v); }
function idOk(v) { return typeof v === 'string' && v.length <= 80 && /^[0-9a-z._-]+$/i.test(v); }
function dateOk(v) { return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v); }

export function exportJSON(s) {
  return JSON.stringify({ game: 'TUMBLE', exportedAt: new Date().toISOString(), save: s });
}

export function importJSON(text) {
  let obj;
  try { obj = JSON.parse(text); } catch (e) { throw new Error('That does not look like a TUMBLE save.'); }
  const s = obj && obj.game === 'TUMBLE' && obj.save ? obj.save : obj;
  if (!s || typeof s !== 'object' || !('economy' in s) || !('stats' in s)) throw new Error('That does not look like a TUMBLE save.');
  return migrate(s);
}

// ---------- storage ----------
function idb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('no indexedDB'));
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error('blocked'));
  });
}

export class Store {
  constructor(adapter) {
    this.adapter = adapter || null;
    this.data = null;
    this.pending = null;
  }

  async load() {
    let raw = null;
    try {
      if (this.adapter) raw = await this.adapter.get();
      else {
        const db = await idb();
        raw = await new Promise((res, rej) => {
          const r = db.transaction(STORE, 'readonly').objectStore(STORE).get(KEY);
          r.onsuccess = () => res(r.result || null);
          r.onerror = () => rej(r.error);
        });
        this.db = db;
      }
    } catch (e) {
      this.fallback = true;
    }
    // the localStorage mirror can be newer (a session where IndexedDB failed): use whichever was saved last
    if (!this.adapter) {
      let mirror = null;
      try { mirror = JSON.parse(localStorage.getItem(LS_KEY) || 'null'); } catch (e) { mirror = null; }
      if (mirror && (!raw || (mirror.savedAt || 0) > (raw.savedAt || 0))) raw = mirror;
    }
    try { this.data = raw ? migrate(raw) : freshSave(); } catch (e) { console.warn('TUMBLE: save unreadable, starting fresh', e); this.data = freshSave(); this.corrupt = raw; }
    return this.data;
  }

  async save() {
    this.data.savedAt = Date.now();
    const snapshot = JSON.parse(JSON.stringify(this.data));
    const write = async () => {
      if (this.adapter) return this.adapter.set(snapshot);
      // the mirror first, so a failed IndexedDB write still leaves a copy
      try { localStorage.setItem(LS_KEY, JSON.stringify(snapshot)); } catch (e) { /* quota or private mode */ }
      if (this.db && !this.fallback) {
        await new Promise((res, rej) => {
          const tx = this.db.transaction(STORE, 'readwrite');
          tx.objectStore(STORE).put(snapshot, KEY);
          tx.oncomplete = () => res();
          tx.onerror = () => rej(tx.error);
        });
      }
    };
    this.pending = (this.pending || Promise.resolve()).then(write, write);
    return this.pending;
  }

  async replace(data) {
    this.data = migrate(data);
    await this.save();
    return this.data;
  }
}

export function memoryAdapter(initial = null) {
  let v = initial ? JSON.parse(JSON.stringify(initial)) : null;
  return { get: async () => (v ? JSON.parse(JSON.stringify(v)) : null), set: async (x) => { v = JSON.parse(JSON.stringify(x)); }, peek: () => v };
}
