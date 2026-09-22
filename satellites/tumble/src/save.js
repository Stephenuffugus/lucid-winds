// Save data (DESIGN 13.6): IndexedDB, versioned, with JSON export and import in settings.
// The data shape and migrations are pure functions so Node can test them (DESIGN 15.8).

export const SAVE_VERSION = 3;
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
    economy: { lint: 0, quarters: 0, reunions: 0, cents: 0 },   // cents = the coin jar, 0 to 24 (v3)
    drawer: [],        // [{ sockSeed | heroId, foundAt, count, odd }]
    oddBin: [],        // [{ sockSeed, waitingSince, loadsWaited }]
    clothesline: [],   // [pegId]
    unlocks: [],       // [itemId]
    equipped: { basket: 'basket-wicker', dryer: 'dryer-standard', radio: null, ball: 'ball-tight', trail: null, decor: [], wallpaper: null, floor: null, curtains: null, tabletop: null },
    finds: [],         // [findId] in the order they were found (v3, phase 2)
    findSeen: {},      // findId -> true once she has looked at it (v3, phase 2)
    sets: [],          // [setId] completed (v3, phase 2)
    looks: [null, null],  // the two Room key hooks: a whole room look each (v3, phase 2.6)
    packBought: {},    // packId -> the Load count it was bought at: its first call on the next ten Loads (v3, 4.2)
    genVersion: 2,     // the generator version a seed minted by this build carries (v3; nothing reads it until 5.1)
    stats: {
      loads: 0, pairs: 0, shotsMade: 0, shotsMissed: 0, cleanLoads: 0, bestStreak: 0,
      tierByMode: { laundry: 0, rush: 0 }, loadsByMode: { laundry: 0, rush: 0 },
      flips: 0, nightLoads: 0, reunions: 0, rushLoads: 0, rushPairs: 0, powersUsed: 0, spotless: 0, binned: 0,
      coins: { penny: 0, nickel: 0, dime: 0, quarter: 0 },      // every coin ever found (v3)
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
  // v3 = pocket change (DESIGN-T2 phase 1.4). ONE migration for the whole of Build 2: the coin jar, the coins
  // she has found, the finds and their sets, the four new room slots, and the generator version her new seeds
  // carry. Every Quarter she already had is hers; the jar starts empty.
  3: (s) => {
    const f = freshSave(s.profile && s.profile.createdAt);
    const out = {
      ...f,
      ...s,
      version: 3,
      profile: { ...f.profile, ...(s.profile || {}), version: 3 },
      economy: { ...f.economy, ...(s.economy || {}), cents: 0 },
      equipped: { ...f.equipped, ...(s.equipped || {}) },
      stats: {
        ...f.stats, ...(s.stats || {}),
        tierByMode: { ...f.stats.tierByMode, ...((s.stats || {}).tierByMode || {}) },
        loadsByMode: { ...f.stats.loadsByMode, ...((s.stats || {}).loadsByMode || {}) },
        coins: { ...f.stats.coins, ...((s.stats || {}).coins || {}) },
      },
      finds: Array.isArray(s.finds) ? s.finds : [],
      findSeen: s.findSeen && typeof s.findSeen === 'object' ? s.findSeen : {},
      sets: Array.isArray(s.sets) ? s.sets : [],
      genVersion: 2,
    };
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
  out.stats.coins = { ...f.stats.coins, ...((s.stats || {}).coins || {}) };
  for (const k of ['drawer', 'oddBin', 'clothesline', 'unlocks', 'lore', 'dailyHistory', 'dailyDays', 'finds', 'sets']) out[k] = Array.isArray(s[k]) ? s[k] : [];
  // the two Room key hooks. An imported save's hook is a list of item ids and nothing else.
  {
    const src = Array.isArray(s.looks) ? s.looks : [];
    out.looks = [0, 1].map((i) => {
      const L = src[i];
      if (!L || typeof L !== 'object') return null;
      const decor = Array.isArray(L.decor) ? L.decor.filter(idOk).slice(0, 40) : [];
      const o = { decor };
      for (const k of ['dryer', 'basket', 'radio', 'ball', 'trail', 'wallpaper', 'floor', 'curtains', 'tabletop']) if (idOk(L[k])) o[k] = L[k];
      return o;
    });
  }
  // when each pack was bought (DESIGN-T2 4.2). An imported save keeps well formed ids with whole Load counts.
  {
    const src = s.packBought && typeof s.packBought === 'object' && !Array.isArray(s.packBought) ? s.packBought : {};
    out.packBought = {};
    for (const [k, v] of Object.entries(src)) if (idOk(k) && Number.isInteger(v) && v >= 0) out.packBought[k] = v;
  }
  // the jar holds 0 to 24 cents: anything else rolls into Quarters rather than being thrown away or trusted
  {
    const c = Number(out.economy.cents);
    let cents = Number.isFinite(c) && c > 0 ? Math.floor(c) : 0;
    const q = Number(out.economy.quarters);
    let quarters = Number.isFinite(q) && q > 0 ? Math.floor(q) : 0;
    if (cents >= 25) { quarters += Math.floor(cents / 25); cents %= 25; }
    out.economy.cents = cents;
    out.economy.quarters = quarters;
  }
  for (const k of ['penny', 'nickel', 'dime', 'quarter']) out.stats.coins[k] = num((out.stats.coins || {})[k]);
  // an imported save's finds are ids and nothing else
  out.finds = out.finds.filter(idOk);
  out.sets = out.sets.filter(idOk);
  {
    const seen = {};
    if (out.findSeen && typeof out.findSeen === 'object') for (const k of Object.keys(out.findSeen)) if (idOk(k) && out.findSeen[k]) seen[k] = true;
    out.findSeen = seen;
  }
  out.genVersion = out.genVersion === 2 ? 2 : (Number(out.genVersion) === 1 ? 1 : 2);
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
  for (const k of ['lint', 'reunions']) { const n = Number(out.economy[k]); out.economy[k] = Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0; }
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
