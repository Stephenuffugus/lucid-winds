// Saves (design 14 §7 T1, 03 §10): the whole sim state as one record, and a world rebuilt from one.
//
// A save is exact. A world restored from it has the same hash and plays on step for step like the one that kept
// running (QUESTIONS Q15), because the record keeps everything a step reads: the creature store slot by slot with
// its free list (so every handle stays valid and new ones come out the same), the cell lists in their order, the
// path cache and queue, the regrowth list and the random stream. Numbers live in typed arrays, so nothing is
// rounded, not even -0. Left out: scratch space, and what is rebuilt from the rest (the tile grid of things, the
// fire and light lists, the per-kind counts, the perception buckets, the renderer's dirty tiles).
//
// Content ids are written as strings through tables (creature kinds, terrains, things), so a save survives the
// content being reordered, and an id that no longer exists is dropped while the rest still loads (03 §10).
// The record is plain values and typed arrays: IndexedDB stores it as it is, encode() makes it JSON for a file.
import { FIELDS, typeOf, SLOT_SPAN, BLOCK, ent } from './ents.js';
import { unlink, CELL } from './spatial.js';
import { createWorld, GENTLE } from './world.js';
import { newGear } from './content.js';
import { markTiles } from './reactions.js';
import { agesOf, planOf } from './village.js';

export const SAVE_V = 11;
export const SAVE_KIND = 'tiny-world';
// World-wide numbers, in this order in rec.num (booleans as 0/1).
const NUM = ['tick', 'time', 'rng', 'rainT', 'shake', 'nextId', 'thingSerial', 'topo', 'logSeq', 'safe', 'fullSaid', 'eatenN', 'stamp', 'fireSpent'];
const NI = Object.fromEntries(NUM.map((k, i) => [k, i]));
// Per thing in rec.things: type (index into tables.things), tx, ty, occ, food, cd, manned (NaN: never manned),
// handle, cooked (v3, design 14 §5: food a campfire has cooked), who and day (v4, design 14 §7 T11: the creature
// a grave is for, and the day it fell). A grave's name is a string, so it rides in rec.thingNames beside them.
const THING = 11;
const TWIST = ['x', 'y', 'px', 'py', 't', 'vx', 'vy']; // a tornado's fields, in powers.js's order
const STORM = ['x', 'y', 'px', 'py', 't', 'next', 'vx', 'vy']; // and a thunderstorm's (design 15 C2)
const FXN = ['x', 'y', 't', 'x2', 'y2', 'r']; // an effect's numbers; its type and colour are kept beside them
const CACHE = ['cKey', 'cTick', 'cTopo', 'cN', 'cPts']; // the path cache (path.js)
const TYPED = { Float64Array, Int32Array, Uint8Array, Int8Array };
const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k); // never `in`: a table could name __proto__
const MAX_INT = 9007199254740991, I31 = 2147483648, SERIALS = 1099511627776; // 2^53 - 1, 2^31, 2^40

// A save that cannot be used: code 'damaged' or 'newer' (02 §10 says which part failed).
export function saveError(code, why) {
  const e = new Error(`save ${code}: ${why}`);
  e.code = code;
  return e;
}

export function snapshot(w) {
  const C = w.C, E = w.E, n = w.nSlots, K = w.R.path.waypoints, P = w.paths;
  const num = new Float64Array(NUM.length);
  num[NI.tick] = w.tick; num[NI.time] = w.time; num[NI.rng] = w.rng.s; num[NI.rainT] = w.rainT; num[NI.shake] = w.shake;
  num[NI.nextId] = w.nextId; num[NI.thingSerial] = w.thingSerial; num[NI.topo] = w.topo; num[NI.logSeq] = w.logSeq;
  num[NI.safe] = w.safe ? 1 : 0; num[NI.fullSaid] = w.fullSaid ? 1 : 0; num[NI.eatenN] = w.eatenN; num[NI.stamp] = P.stamp;
  num[NI.fireSpent] = w.fireSpent; // how much of this fire's allowance is gone (15 A5): a loaded fire kept spreading without it
  const thingTypes = [], tIdx = {}, thingNames = [], things = new Float64Array(w.structs.length * THING);
  w.structs.forEach((s, k) => {
    if (!own(tIdx, s.type)) { tIdx[s.type] = thingTypes.length; thingTypes.push(s.type); }
    things.set([tIdx[s.type], s.tx, s.ty, s.occ, s.food, s.cd, s.manned === undefined ? NaN : s.manned, s.h, s.cooked ? 1 : 0, s.who || 0, s.day || 0], k * THING);
    thingNames.push(s.name === undefined ? null : s.name);
  });
  const twisters = new Float64Array(w.twisters.length * TWIST.length);
  w.twisters.forEach((t, k) => TWIST.forEach((f, j) => (twisters[k * TWIST.length + j] = t[f])));
  const storms = new Float64Array(w.storms.length * STORM.length);
  w.storms.forEach((t, k) => STORM.forEach((f, j) => (storms[k * STORM.length + j] = t[f])));
  const fx = { type: [], col: [], num: new Float64Array(w.fxN * FXN.length) };
  for (let k = 0; k < w.fxN; k++) {
    const r = w.fx[k];
    fx.type.push(r.type); fx.col.push(r.col);
    FXN.forEach((f, j) => (fx.num[k * FXN.length + j] = r[f]));
  }
  const f = {};
  for (const name of FIELDS) if (typeOf(name) !== Array) f[name] = E[name].slice(0, n);
  const kind = new Int32Array(n);
  for (let i = 0; i < n; i++) { const k = C.kid[E.kind[i]]; kind[i] = k === undefined ? -1 : k; }
  const store = {
    cap: w.cap, nSlots: n, K,
    slotH: w.slotH.slice(0, n), order: w.order.slice(0, w.count), free: w.free.slice(0, w.nFree),
    cellOf: w.cellOf.slice(0, n), cnext: w.cnext.slice(0, n), cprev: w.cprev.slice(0, n), cellHead: w.cellHead.slice(),
    humans: w.humans.slice(0, w.nHumans), atkList: w.atkList.slice(0, w.nAtk), atkIn: w.atkIn.slice(0, n),
    pathPts: w.pathPts.slice(0, n * K), pq: w.pq.slice(0, w.pqN),
    kind, name: E.name.slice(0, n), over: E.over.slice(0, n).map((o) => (o ? { ...o } : o)), gear: E.gear.slice(0, n).map((g) => (g ? { ...g } : g)),
    f,
  };
  const cache = {};
  for (const k of CACHE) cache[k] = P[k].slice();
  return {
    v: SAVE_V, kind: SAVE_KIND, cols: w.cols, rows: w.rows, T: w.T, seed: w.seed,
    settings: { daySec: w.daySec, gentle: GENTLE[w.gentle], petsSafe: w.petsSafe, first: w.first }, // Safe is in num
    tables: { kinds: C.kinds.slice(), terrain: C.TERR.map((t) => t.id), things: thingTypes },
    thingNames,
    // The village (design 14 §7 item 13): the claimed tiles and the job board, or null when no flag was ever
    // planted, which is every world that has never had one (and keeps those saves the size they were).
    village: w.vg.flag || w.claimN ? { claim: w.claim.slice(), list: w.claimList.slice(0, w.claimN), vg: { ...w.vg } } : null,
    num, terr: w.terr.slice(), eaten: w.eaten.slice(), eatenList: w.eatenList.slice(0, w.eatenN),
    // Fire, as pairs (tile, seconds left), and the terrain that turns back later, as triples (tile, seconds, terrain
    // index): both small, both saved exactly, so a world loads still burning and the ice still melts when it should.
    burn: burnPairs(w), tmr: tmrTriples(w),
    // What is still on cooldown (design 14 §5: one row per pair, then a rest). It used to be left out as
    // scratch, and a world that was saved mid-cooldown played on differently from the one that kept running,
    // because the loaded one was free to fire the row again at once (found by save-check's play-on, design 15
    // C1). Only the entries that have not run out are written.
    cool: coolRows(w),
    things, twisters, storms, fx, store, cache, pathStat: { ...w.pathStat },
    lastLog: w.lastLog ? JSON.parse(JSON.stringify(w.lastLog)) : null,
  };
}

// The reaction cooldowns still running, as the keys and when each is free again.
function coolRows(w) {
  const keys = [], at = [];
  if (w.rx) for (const [k, t] of w.rx.cool) if (t > w.time) { keys.push(k); at.push(t); }
  return { keys, at: Float64Array.from(at) };
}

// One function per version step: MIGRATIONS[v] turns a version v record into version v + 1, never changing how the
// saved world plays: a world saved before a setting existed keeps the behaviour it had.
export const MIGRATIONS = {
  // v2 (T3, design 14 §6 §9.1): per-world settings. A v1 world was played with the prototype's 60 s day, no Gentle, no
  // Pets safe, and was nobody's first world as far as the rules know.
  // New creature field hazT (seconds in a hazard), zero: nobody was being warned.
  1: (r) => ({ ...r, v: 2, settings: { daySec: 60, gentle: 'off', petsSafe: false, first: false },
    store: r.store && r.store.f ? { ...r.store, f: { ...r.store.f, hazT: new Float64Array(r.store.nSlots) } } : r.store }),
  // v3 (T9, design 14 §5): reactions. New creature fields fol, folT (who it follows and for how long) and calm
  // (how long it stays peaceful), all zero: nobody was following anyone and nothing had been calmed. Nothing was
  // alight and no terrain was waiting to turn back, so both lists are empty. Every thing grows a `cooked` flag,
  // zero: no campfire had cooked anything. A v2 world plays on exactly as it did.
  2: (r) => {
    const n = r.store ? r.store.nSlots : 0;
    const old = r.things || new Float64Array(0);
    if (!(old instanceof Float64Array) || old.length % 8) throw saveError('damaged', 'things'); // a cut or flipped file
    const things = new Float64Array((old.length / 8) * 9);
    for (let k = 0, j = 0; k < old.length; k += 8, j += 9) { things.set(old.subarray(k, k + 8), j); things[j + 8] = 0; }
    return { ...r, v: 3, things, burn: new Float64Array(0), tmr: new Float64Array(0),
      store: r.store && r.store.f ? { ...r.store, f: { ...r.store.f, fol: new Float64Array(n), folT: new Float64Array(n), calm: new Float64Array(n) } } : r.store };
  },
  // v4 (T11, design 14 §7 T11): naming. A new creature field `named`, zero: nobody in a v3 world was named by the
  // child, so Pets safe guards exactly who it guarded and the eraser spares exactly who it spared. Every thing
  // grows who and day (0: no grave in a v3 world was placed for anyone) and a name (null: none had one).
  3: (r) => {
    const n = r.store ? r.store.nSlots : 0;
    const old = r.things || new Float64Array(0);
    if (!(old instanceof Float64Array) || old.length % 9) throw saveError('damaged', 'things');
    const rows = old.length / 9, things = new Float64Array(rows * 11);
    for (let k = 0, j = 0; k < old.length; k += 9, j += 11) { things.set(old.subarray(k, k + 9), j); things[j + 9] = 0; things[j + 10] = 0; }
    return { ...r, v: 4, things, thingNames: new Array(rows).fill(null),
      store: r.store && r.store.f ? { ...r.store, f: { ...r.store.f, named: new Uint8Array(n) } } : r.store };
  },
  // v5 (T13, design 14 §7 item 13): the village. A v4 world had no flag, nobody belonged to one, nobody was
  // carrying or building and no tile was painted, so the block is null and the three new fields are zero.
  4: (r) => {
    const n = r.store ? r.store.nSlots : 0;
    return { ...r, v: 5, village: null,
      store: r.store && r.store.f ? { ...r.store, f: { ...r.store.f, vill: new Float64Array(n), carry: new Uint8Array(n), work: new Float64Array(n) } } : r.store };
  },
  // v6 (design 15 B1): enough is enough. Two new creature fields, both zero: satedT (nobody in a v5 world was
  // resting after a meal) and feeds (nobody had a meal counted towards their next litter, so the hunters in a
  // loaded world go and catch two before they breed again, which is the rule from here on).
  5: (r) => {
    const n = r.store ? r.store.nSlots : 0;
    return { ...r, v: 6,
      store: r.store && r.store.f ? { ...r.store, f: { ...r.store.f, satedT: new Float64Array(n), feeds: new Uint8Array(n) } } : r.store };
  },
  // v7 (design 15 C1): two things that were being left behind as scratch and are not scratch at all — the
  // reaction cooldowns, and how much of the burning fire's allowance is already spent (15 A5's fire cap). A
  // world saved with either of them running played on differently from the one that kept running: the loaded
  // one was free to fire rows again at once, and its fire had its whole allowance back. Both were found by
  // save-check's play-on. A v6 world has neither written down, which is exactly how a v6 world loaded.
  // v8 (design 15 C2): thunderstorms. A v7 world had none overhead, so the list is empty and it plays on as it did.
  // v11 (design 17): errands. Three new creature fields, all zero: nobody in a v10 world was on one.
  10: (r) => {
    const n = r.store ? r.store.nSlots : 0;
    return { ...r, v: 11, store: r.store && r.store.f ? { ...r.store, f: { ...r.store.f, errT: new Float64Array(n), errX: new Float64Array(n), errY: new Float64Array(n) } } : r.store };
  },
  // v10 (design 17): giants. One new creature field, bigT, zero: nobody in a v9 world had eaten the mushroom.
  9: (r) => {
    const n = r.store ? r.store.nSlots : 0;
    // A v9 village counted its place in plans that had no fields in them. Marked here, and restore() moves `next`
    // to the same place in the plans that do, so her old village neither builds a second barn nor goes without
    // its field (the review of Sep 21).
    if (r.village && r.village.vg) r = { ...r, village: { ...r.village, vg: { ...r.village.vg, planV: 9 } } };
    return { ...r, v: 10, store: r.store && r.store.f ? { ...r.store, f: { ...r.store.f, bigT: new Float64Array(n) } } : r.store };
  },
  8: (r) => ({ ...r, v: 9, village: r.village ? { ...r.village, vg: { ...r.village.vg, age: 0 } } : r.village }),
  7: (r) => ({ ...r, v: 8, storms: new Float64Array(0) }),
  6: (r) => {
    if (!(r.num instanceof Float64Array)) throw saveError('damaged', 'numbers');
    const num = new Float64Array(r.num.length + 1); num.set(r.num); num[r.num.length] = 0;
    return { ...r, v: 7, num, cool: { keys: [], at: new Float64Array(0) } };
  },
};
export function migrate(rec, steps = MIGRATIONS, to = SAVE_V) {
  if (!rec || typeof rec !== 'object' || rec.kind !== SAVE_KIND || !Number.isInteger(rec.v) || rec.v < 1) throw saveError('damaged', 'not a world');
  if (rec.v > to) throw saveError('newer', `version ${rec.v}`);
  while (rec.v < to) {
    const step = steps[rec.v];
    if (!step) throw saveError('damaged', `no way up from version ${rec.v}`);
    const v = rec.v;
    rec = step(rec);
    if (!rec || rec.v !== v + 1) throw saveError('damaged', `migration from version ${v}`);
  }
  return rec;
}

// The first thing wrong with a record, or null. Everything restore() indexes by is range checked here, and every
// cell list is walked, so a damaged file cannot crash the load or hang the first step.
export function check(C, rec) {
  const isT = (a, T, len) => a instanceof T && (len === undefined || a.length === len);
  const isInt = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi;
  const strs = (a) => Array.isArray(a) && a.every((s) => typeof s === 'string');
  if (!rec || typeof rec !== 'object') return 'not a record';
  if (rec.kind !== SAVE_KIND || rec.v !== SAVE_V) return 'version';
  if (!isInt(rec.cols, 1, 1024) || !isInt(rec.rows, 1, 1024)) return 'size';
  if (rec.T !== C.rules.tile) return 'tile size';
  if (!Number.isInteger(rec.seed)) return 'seed';
  const set = rec.settings;
  if (!set || !C.rules.world.dayChoices.includes(set.daySec) || !GENTLE.includes(set.gentle) || typeof set.petsSafe !== 'boolean' || typeof set.first !== 'boolean') return 'settings';
  const nT = rec.cols * rec.rows, tb = rec.tables;
  if (!tb || !strs(tb.kinds) || !strs(tb.terrain) || !strs(tb.things)) return 'tables';
  if (!isT(rec.num, Float64Array, NUM.length) || !rec.num.every(Number.isFinite)) return 'numbers';
  const num = rec.num;
  if (!isInt(num[NI.tick], 0, MAX_INT) || !isInt(num[NI.rng], -I31, I31 - 1) || !isInt(num[NI.nextId], 1, MAX_INT)) return 'numbers';
  if (!isInt(num[NI.thingSerial], 0, SERIALS) || !isInt(num[NI.topo], 0, MAX_INT) || !isInt(num[NI.stamp], 0, 0x7fffffff)) return 'numbers';
  if (!isT(rec.terr, Uint8Array, nT) || rec.terr.some((t) => t >= tb.terrain.length)) return 'terrain';
  if (!isT(rec.eaten, Float64Array, nT) || !rec.eaten.every(Number.isFinite)) return 'grass';
  const eN = num[NI.eatenN];
  if (!isInt(eN, 0, nT) || !isT(rec.eatenList, Int32Array, eN) || rec.eatenList.some((i) => i < 0 || i >= nT)) return 'grass';
  if (!isT(rec.things, Float64Array) || rec.things.length % THING) return 'things';
  if (!Array.isArray(rec.thingNames) || rec.thingNames.length !== rec.things.length / THING ||
      rec.thingNames.some((n) => n !== null && typeof n !== 'string')) return 'thing names';
  const tiles = new Set();
  for (let k = 0; k < rec.things.length; k += THING) {
    const [t, tx, ty] = rec.things.subarray(k, k + 3), h = rec.things[k + 7], i = ty * rec.cols + tx;
    if (!isInt(t, 0, tb.things.length - 1) || !isInt(tx, 0, rec.cols - 1) || !isInt(ty, 0, rec.rows - 1) || tiles.has(i)) return 'things';
    if (!Number.isInteger(h) || h % nT !== i || Math.floor(h / nT) < 1 || Math.floor(h / nT) > num[NI.thingSerial]) return 'things';
    for (let j = 3; j < 6; j++) if (!Number.isFinite(rec.things[k + j])) return 'things';
    tiles.add(i);
  }
  if (rec.village !== null && rec.village !== undefined) {
    const v = rec.village;
    if (!v || !isT(v.claim, Uint8Array, nT) || !isT(v.list, Int32Array) || v.list.some((i) => i < 0 || i >= nT)) return 'village';
    if (!v.vg || !Number.isFinite(v.vg.store) || !Number.isInteger(v.vg.next) || v.vg.next < 0) return 'village';
  }
  if (!isT(rec.burn, Float64Array) || rec.burn.length % 2 || !rec.burn.every(Number.isFinite)) return 'fire';
  for (let k = 0; k < rec.burn.length; k += 2) if (!isInt(rec.burn[k], 0, nT - 1) || !(rec.burn[k + 1] > 0)) return 'fire';
  if (!isT(rec.tmr, Float64Array) || rec.tmr.length % 3 || !rec.tmr.every(Number.isFinite)) return 'terrain timers';
  const cl = rec.cool;
  if (!cl || !Array.isArray(cl.keys) || !isT(cl.at, Float64Array, cl.keys.length)) return 'cooldowns';
  if (cl.keys.some((k) => typeof k !== 'string' || k.length > 64) || !cl.at.every(Number.isFinite)) return 'cooldowns';
  for (let k = 0; k < rec.tmr.length; k += 3) if (!isInt(rec.tmr[k], 0, nT - 1) || !(rec.tmr[k + 1] > 0) || !isInt(rec.tmr[k + 2], 0, tb.terrain.length - 1)) return 'terrain timers';
  if (!isT(rec.twisters, Float64Array) || rec.twisters.length % TWIST.length || !rec.twisters.every(Number.isFinite)) return 'tornadoes';
  if (!isT(rec.storms, Float64Array) || rec.storms.length % STORM.length || !rec.storms.every(Number.isFinite)) return 'storms';
  const fx = rec.fx;
  if (!fx || !isT(fx.num, Float64Array) || fx.num.length % FXN.length || !fx.num.every(Number.isFinite) || !strs(fx.type) || fx.type.length * FXN.length !== fx.num.length) return 'effects';
  if (!Array.isArray(fx.col) || fx.col.length !== fx.type.length || fx.col.some((c) => c !== null && typeof c !== 'string')) return 'effects';
  const st = rec.store;
  if (!st || typeof st !== 'object') return 'creatures';
  const n = st.nSlots, cap = st.cap;
  if (!isInt(n, 0, SLOT_SPAN) || !isInt(cap, n, SLOT_SPAN) || cap % BLOCK) return 'creatures';
  if (!isInt(st.K, 1, 64)) return 'creatures';
  for (const name of FIELDS) {
    const T = typeOf(name);
    if (T === Array) continue;
    if (!st.f || !isT(st.f[name], T, n)) return `creatures (${name})`;
    if (T === Float64Array && !st.f[name].every(Number.isFinite)) return `creatures (${name})`;
  }
  if (!isT(st.kind, Int32Array, n) || st.kind.some((k) => k < -1 || k >= tb.kinds.length)) return 'creatures (kind)';
  // Everybody has to be standing on the map. A flipped byte in x or y used to get through here (finite is not
  // the same as sensible) and the world loaded with somebody out in the void: found by the damaged-save sweep
  // once design 15 changed the shape of a save and the sweep landed on different bytes.
  { const m = rec.T * 2, xs = st.f.x, ys = st.f.y;
    for (const s2 of st.order) if (xs[s2] < -m || ys[s2] < -m || xs[s2] > rec.cols * rec.T + m || ys[s2] > rec.rows * rec.T + m) return 'creatures (off the map)'; }
  for (const a of ['name', 'over', 'gear']) if (!Array.isArray(st[a]) || st[a].length !== n) return `creatures (${a})`;
  if (st.name.some((s) => s != null && typeof s !== 'string')) return 'creatures (name)';
  if (st.over.some((o) => o != null && typeof o !== 'object') || st.gear.some((g) => g !== null && typeof g !== 'object')) return 'creatures (looks)';
  if (!isT(st.slotH, Float64Array, n)) return 'creatures (handles)';
  for (let s = 0; s < n; s++) { const h = st.slotH[s]; if (!Number.isInteger(h) || h < SLOT_SPAN || h % SLOT_SPAN !== s) return 'creatures (handles)'; }
  if (!isT(st.order, Int32Array) || !isT(st.free, Int32Array) || st.order.length + st.free.length !== n) return 'creatures (slots)';
  const live = new Uint8Array(n);
  for (const s of st.order) { if (!isInt(s, 0, n - 1) || live[s]) return 'creatures (order)'; live[s] = 1; }
  for (const s of st.free) { if (!isInt(s, 0, n - 1) || live[s]) return 'creatures (free)'; live[s] = 2; }
  for (const s of st.order) if (st.gear[s] === null) return 'creatures (gear)';
  // The cell lists: every live creature once, in the cell it says, and nothing else (a loop in a list would hang).
  const gw = Math.ceil((rec.cols * rec.T) / CELL), gh = Math.ceil((rec.rows * rec.T) / CELL);
  for (const a of ['cellOf', 'cnext', 'cprev']) if (!isT(st[a], Int32Array, n) || st[a].some((v) => v < -1 || v >= (a === 'cellOf' ? gw * gh : n))) return 'creatures (cells)';
  if (!isT(st.cellHead, Int32Array, gw * gh) || st.cellHead.some((v) => v < -1 || v >= n)) return 'creatures (cells)';
  let listed = 0;
  for (let c = 0; c < gw * gh; c++) {
    let prev = -1;
    for (let o = st.cellHead[c]; o >= 0; prev = o, o = st.cnext[o]) {
      if (++listed > n || live[o] !== 1 || st.cellOf[o] !== c || st.cprev[o] !== prev) return 'creatures (cells)';
    }
  }
  for (const s of st.order) if (st.cellOf[s] < 0) return 'creatures (cells)';
  if (listed !== st.order.length) return 'creatures (cells)';
  if (!isT(st.humans, Int32Array) || st.humans.some((s) => s < 0 || s >= n || live[s] !== 1)) return 'creatures (humans)';
  if (!isT(st.atkList, Int32Array) || st.atkList.some((s) => s < 0 || s >= n) || !isT(st.atkIn, Uint8Array, n)) return 'creatures (guard list)';
  if (!isT(st.pathPts, Int32Array, n * st.K) || st.pathPts.some((t) => t < 0 || t >= nT)) return 'creatures (paths)';
  if (!isT(st.pq, Float64Array) || st.pq.length > 2 * cap) return 'creatures (path queue)';
  const c = rec.cache;
  if (!c || !isT(c.cKey, Int32Array, 256) || !isT(c.cTick, Int32Array, 256) || !isT(c.cTopo, Int32Array, 256) || !isT(c.cN, Int32Array, 256)) return 'path cache';
  if (!isT(c.cPts, Int32Array, 256 * st.K) || c.cN.some((v) => v < 0 || v > st.K) || c.cPts.some((t) => t < 0 || t >= nT)) return 'path cache';
  return null;
}

// A world from a record (already migrated). Throws saveError('damaged', ...) for a record check() refuses.
export function restore(C, rec) {
  const bad = check(C, rec);
  if (bad) throw saveError('damaged', bad);
  const w = createWorld(C, { cols: rec.cols, rows: rec.rows, seed: rec.seed, settings: rec.settings }), num = rec.num, tb = rec.tables;
  let changed = false; // content that is gone was dropped: cached paths may cross where it stood
  // Tiles. A terrain that is gone becomes grass.
  const tmap = tb.terrain.map((id) => (own(C.tid, id) ? C.tid[id] : ((changed = true), C.tid.grass)));
  for (let i = 0; i < w.nTiles; i++) w.terr[i] = tmap[rec.terr[i]];
  w.eaten.set(rec.eaten);
  w.eatenList.set(rec.eatenList); w.eatenN = rec.eatenList.length;
  for (let k = 0; k < w.eatenN; k++) w.eatenIn[w.eatenList[k]] = 1;
  // Things, in their order, in placeStruct()'s shape. A thing that is gone from the content is dropped.
  for (let k = 0; k < rec.things.length; k += THING) {
    const T = rec.things, type = tb.things[T[k]], def = own(C.BLD, type) ? C.BLD[type] : null;
    if (!def) { changed = true; continue; }
    const tx = T[k + 1], ty = T[k + 2], m = T[k + 6];
    const name = rec.thingNames && rec.thingNames[k / THING];
    const s = { type, def, tx, ty, occ: T[k + 3], food: T[k + 4], cd: T[k + 5], h: T[k + 7], manned: Number.isNaN(m) ? undefined : m, cooked: T[k + 8] ? 1 : 0,
      who: T[k + 9], name: typeof name === 'string' ? name : undefined, day: T[k + 10] };
    // An egg's `who` is the kind that laid it, as an index into the kinds the SAVE was written with: it goes
    // through the save's own table like every other kind, so content added or reordered since cannot turn a
    // duck's egg into something else. A kind that is gone hatches what the thing's own definition says.
    if (def.hatch && s.who > 0) { const kn = tb.kinds[s.who - 1]; s.who = kn !== undefined && own(C.kid, kn) ? C.kid[kn] + 1 : 0; }
    w.grid[ty * w.cols + tx] = s;
    w.structs.push(s);
    if (def.fire) w.fires.push(s);
    if (def.scare) w.scarecrows.push(s);
    if (def.light) w.lights.push(s);
    if (def.grave) w.graves.push(s);
  }
  for (let k = 0; k < rec.twisters.length; k += TWIST.length) {
    const t = {};
    TWIST.forEach((f, j) => (t[f] = rec.twisters[k + j]));
    w.twisters.push(t);
  }
  for (let k = 0; k < rec.storms.length; k += STORM.length) {
    const c = {};
    STORM.forEach((f, j2) => (c[f] = rec.storms[k + j2]));
    w.storms.push(c);
  }
  for (let k = 0; k < rec.fx.type.length; k++) {
    const r = { type: rec.fx.type[k], x: 0, y: 0, t: 0, x2: 0, y2: 0, r: 0, col: rec.fx.col[k] };
    FXN.forEach((f, j) => (r[f] = rec.fx.num[k * FXN.length + j]));
    w.fx.push(r);
  }
  w.fxN = rec.fx.type.length;
  w.tick = num[NI.tick]; w.time = num[NI.time]; w.rng.s = num[NI.rng] | 0; w.rainT = num[NI.rainT]; w.shake = num[NI.shake];
  w.fireSpent = num[NI.fireSpent] || 0;
  w.nextId = num[NI.nextId]; w.thingSerial = num[NI.thingSerial]; w.topo = num[NI.topo]; w.logSeq = num[NI.logSeq];
  w.safe = num[NI.safe] === 1; w.fullSaid = num[NI.fullSaid] === 1;
  w.lastLog = rec.lastLog && typeof rec.lastLog.key === 'string' ? rec.lastLog : null;
  if (rec.pathStat && typeof rec.pathStat === 'object') for (const k in w.pathStat) if (Number.isFinite(rec.pathStat[k])) w.pathStat[k] = rec.pathStat[k];
  for (let k = 0; k < rec.burn.length; k += 2) { const i = rec.burn[k]; w.burn[i] = rec.burn[k + 1]; w.burnList[w.burnN++] = i; }
  for (let k = 0; k < rec.tmr.length; k += 3) w.tmr.push({ i: rec.tmr[k], t: rec.tmr[k + 1], to: tmap[rec.tmr[k + 2]] });
  if (rec.village) {
    w.claim.set(rec.village.claim);
    w.claimList.set(rec.village.list); w.claimN = rec.village.list.length;
    w.vg = { ...w.vg, ...rec.village.vg };
    if (!Number.isInteger(w.vg.age) || w.vg.age < 0) w.vg.age = 0; // a world saved before villages grew up is a camp
    const ages = agesOf(w);
    if (ages && w.vg.age >= ages.length) w.vg.age = ages.length - 1; // fewer ages than the file remembers
    const plan = planOf(w);
    if (w.vg.planV === 9) { // (see MIGRATIONS[9]) as many roofs and wells built as it had, with the fields before them taken as read
      let built = 0, j = 0;
      while (j < plan.length && built < w.vg.next) { if (plan[j] !== 'wheat') built++; j++; }
      w.vg.next = j;
    }
    delete w.vg.planV;
    if (w.vg.next > plan.length) w.vg.next = plan.length; // a plan that got shorter
  }
  restoreStore(w, rec.store, tb.kinds);
  markTiles(w); // the enter trigger starts from where everyone is standing (reactions.js)
  // and what was on cooldown stays on cooldown (v7), so a loaded world plays on exactly as the one that kept
  // running would have.
  if (rec.cool) for (let k = 0; k < rec.cool.keys.length; k++) w.rx.cool.set(rec.cool.keys[k], rec.cool.at[k]);
  const P = w.paths, K = w.R.path.waypoints;
  P.stamp = num[NI.stamp];
  if (rec.store.K === K) for (const k of CACHE) P[k].set(rec.cache[k]);
  else dropPaths(w); // the waypoint limit changed: every path is asked for again
  if (changed) w.topo++; // a cached path from before the drop is stale
  return w;
}

function burnPairs(w) {
  const out = new Float64Array(w.burnN * 2);
  for (let k = 0; k < w.burnN; k++) { const i = w.burnList[k]; out[k * 2] = i; out[k * 2 + 1] = w.burn[i]; }
  return out;
}
function tmrTriples(w) {
  const out = new Float64Array(w.tmr.length * 3);
  w.tmr.forEach((t, k) => { out[k * 3] = t.i; out[k * 3 + 1] = t.t; out[k * 3 + 2] = t.to; });
  return out;
}

function restoreStore(w, st, kinds) {
  const C = w.C, n = st.nSlots, cap = st.cap, E = w.E, K = w.R.path.waypoints;
  for (const name of FIELDS) {
    const T = typeOf(name);
    if (T === Array) { E[name] = []; continue; }
    const a = new T(cap);
    a.set(st.f[name]);
    E[name] = a;
  }
  const typed = (T, len, src) => { const a = new T(len); a.set(src); return a; };
  w.cap = cap; w.nSlots = n;
  w.slotH = typed(Float64Array, cap, st.slotH);
  w.order = typed(Int32Array, cap, st.order); w.count = st.order.length;
  w.free = typed(Int32Array, cap, st.free); w.nFree = st.free.length;
  w.cellOf = typed(Int32Array, cap, st.cellOf); w.cnext = typed(Int32Array, cap, st.cnext); w.cprev = typed(Int32Array, cap, st.cprev);
  w.cellHead.set(st.cellHead);
  w.humans = typed(Int32Array, cap, st.humans); w.nHumans = st.humans.length;
  w.atkList = typed(Int32Array, cap, st.atkList); w.nAtk = st.atkList.length; w.atkIn = typed(Uint8Array, cap, st.atkIn);
  w.pathPts = new Int32Array(cap * K);
  if (st.K === K) w.pathPts.set(st.pathPts);
  w.pq = typed(Float64Array, 2 * cap, st.pq); w.pqN = st.pq.length;
  // The plain arrays, written one after another (kept packed, as spawn() keeps them). A gear object is rebuilt in
  // the one gear shape (content.js), without keys the content no longer has; a weapon that is gone is dropped.
  const gone = [];
  for (let i = 0; i < n; i++) {
    const kid = st.kind[i], id = kid >= 0 ? kinds[kid] : undefined, known = id !== undefined && own(C.kid, id);
    E.kind.push(known ? id : C.kinds[0]);
    E.name.push(st.name[i] == null ? undefined : st.name[i]);
    E.over.push(st.over[i] == null ? undefined : { ...st.over[i] });
    let g = null;
    if (st.gear[i]) {
      g = newGear(C);
      for (const k of C.gearKeys) if (own(st.gear[i], k) && st.gear[i][k] !== null) g[k] = st.gear[i][k];
      if (g.weapon !== undefined && !(typeof g.weapon === 'string' && own(C.WEAP, g.weapon))) g.weapon = undefined;
    }
    E.gear.push(g);
    if (!known) gone.push(i);
  }
  const live = new Set(Array.from(st.order));
  for (const i of gone) if (live.has(i)) drop(w, i);
  for (let k = 0; k < w.count; k++) w.kindCount[C.kid[E.kind[w.order[k]]]]++;
}

// A creature whose kind is gone from the content: removed as compact() removes the dead, so every handle to it
// goes stale, and a passenger of a UFO that is gone bails out where the UFO was.
function drop(w, i) {
  const E = w.E;
  if (E.cargo[i]) { const c = ent(w, E.cargo[i]); if (c >= 0 && E.inside[c] === -w.slotH[i]) { E.dropX[c] = E.x[i]; E.dropY[c] = E.y[i]; } }
  unlink(w, i);
  E.gear[i] = null; E.over[i] = undefined; E.name[i] = undefined;
  w.slotH[i] += SLOT_SPAN;
  w.free[w.nFree++] = i;
  const keep = (a, n) => { let j = 0; for (let k = 0; k < n; k++) if (a[k] !== i) a[j++] = a[k]; return j; };
  w.count = keep(w.order, w.count); w.nHumans = keep(w.humans, w.nHumans); w.nAtk = keep(w.atkList, w.nAtk); w.atkIn[i] = 0;
}

function dropPaths(w) {
  const E = w.E;
  for (let i = 0; i < w.nSlots; i++) { E.pathN[i] = 0; E.pathI[i] = 0; E.pathQd[i] = 0; E.pathFresh[i] = 0; }
  w.pqN = 0;
  w.paths.cKey.fill(-1);
}

// ---------- files: the record as JSON, typed arrays as base64 of their little-endian bytes ----------
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const B64I = new Int16Array(128).fill(-1);
for (let i = 0; i < 64; i++) B64I[B64.charCodeAt(i)] = i;
const LE = new Uint8Array(new Uint16Array([1]).buffer)[0] === 1;

function bytesOf(a) {
  const b = new Uint8Array(a.buffer, a.byteOffset, a.byteLength), z = a.BYTES_PER_ELEMENT;
  if (LE || z === 1) return b;
  const o = new Uint8Array(b.length);
  for (let i = 0; i < b.length; i += z) for (let j = 0; j < z; j++) o[i + j] = b[i + z - 1 - j];
  return o;
}
function b64(bytes) {
  let out = '';
  const chunk = [];
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i], b = i + 1 < bytes.length ? bytes[i + 1] : 0, c = i + 2 < bytes.length ? bytes[i + 2] : 0;
    chunk.push(B64.charCodeAt(a >> 2), B64.charCodeAt(((a & 3) << 4) | (b >> 4)),
      i + 1 < bytes.length ? B64.charCodeAt(((b & 15) << 2) | (c >> 6)) : 61, i + 2 < bytes.length ? B64.charCodeAt(c & 63) : 61);
    if (chunk.length >= 8192) { out += String.fromCharCode.apply(null, chunk); chunk.length = 0; }
  }
  return out + String.fromCharCode.apply(null, chunk);
}
function unb64(s) {
  if (typeof s !== 'string' || s.length % 4) throw saveError('damaged', 'data');
  const pad = s.endsWith('==') ? 2 : s.endsWith('=') ? 1 : 0, out = new Uint8Array((s.length / 4) * 3 - pad);
  let o = 0;
  for (let i = 0; i < s.length; i += 4) {
    const q = [0, 1, 2, 3].map((j) => { const c = s.charCodeAt(i + j); return c === 61 && i + j >= s.length - pad ? 0 : c < 128 ? B64I[c] : -1; });
    if (q.includes(-1)) throw saveError('damaged', 'data');
    const v = (q[0] << 18) | (q[1] << 12) | (q[2] << 6) | q[3];
    if (o < out.length) out[o++] = v >> 16;
    if (o < out.length) out[o++] = (v >> 8) & 255;
    if (o < out.length) out[o++] = v & 255;
  }
  return out;
}

// The record as plain JSON values: every typed array becomes {$t: its type, b: base64}.
export function encode(v) {
  if (ArrayBuffer.isView(v)) return { $t: v.constructor.name, b: b64(bytesOf(v)) };
  if (Array.isArray(v)) return v.map(encode);
  if (v && typeof v === 'object') { const o = {}; for (const k in v) o[k] = encode(v[k]); return o; }
  return v;
}
export function decode(v) {
  if (Array.isArray(v)) return v.map(decode);
  if (v && typeof v === 'object') {
    if (typeof v.$t === 'string') {
      const T = TYPED[v.$t];
      if (!T) throw saveError('damaged', 'data type');
      const bytes = unb64(v.b), z = T.BYTES_PER_ELEMENT;
      if (bytes.length % z) throw saveError('damaged', 'data length');
      const a = new T(bytes.length / z), raw = new Uint8Array(a.buffer);
      if (LE || z === 1) raw.set(bytes);
      else for (let i = 0; i < bytes.length; i += z) for (let j = 0; j < z; j++) raw[i + j] = bytes[i + z - 1 - j];
      return a;
    }
    const o = {};
    for (const k in v) if (k !== '__proto__') o[k] = decode(v[k]); // a key that would set the prototype
    return o;
  }
  return v;
}

// A file's text (plain JSON of encode()) to a record ready for restore(): every failure is a save error.
export function fromText(text) {
  let obj;
  try { obj = JSON.parse(text); } catch (e) { throw saveError('damaged', 'not JSON'); }
  return migrate(decode(obj));
}
export const toText = (rec) => JSON.stringify(encode(rec));
