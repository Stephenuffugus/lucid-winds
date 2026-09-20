// World state: tile grids, things, and the tile queries every system shares.
import { makeRng } from './rng.js';
import { hyp } from './math.js';
import { createStore, releaseAll } from './ents.js';
import { createGrid } from './spatial.js';
import { createPerception } from './ai/decide.js';
import { createPaths } from './path.js';
import { createEvents } from './events.js';
import { createStory } from './story.js';
import { createReactions } from './reactions.js';

// Gentle (00 §2): who a need can never hurt. Stored as an index; the names are the setting's values.
export const GENTLE = ['off', 'humans', 'everyone'];
// A world's settings (rules.world), whole: what was given, else the sim's own defaults. An unknown value is the default.
export function worldSettings(C, given) {
  const W = C.rules.world, d = W.sim, g = given || {};
  return {
    daySec: W.dayChoices.includes(g.daySec) ? g.daySec : d.daySec,
    safe: typeof g.safe === 'boolean' ? g.safe : d.safe,
    gentle: GENTLE.includes(g.gentle) ? g.gentle : d.gentle,
    petsSafe: typeof g.petsSafe === 'boolean' ? g.petsSafe : d.petsSafe,
    first: typeof g.first === 'boolean' ? g.first : d.first,
  };
}

export function createWorld(C, { cols, rows, seed, settings }) {
  const n = cols * rows, T = C.rules.tile, set = worldSettings(C, settings);
  const w = {
    C, R: C.rules, T, cols, rows, W: cols * T, H: rows * T,
    seed, rng: makeRng(seed),
    terr: new Uint8Array(n),
    eaten: new Float64Array(n), // seconds until eaten grass regrows
    // The tiles whose regrowth timer runs, so a step visits those instead of every tile. eatenIn marks
    // membership: a tile zeroed by Rain or new terrain stays listed until the next step drops it.
    eatenList: new Int32Array(n), eatenIn: new Uint8Array(n), eatenN: 0,
    grid: new Array(n), // thing per tile, or null
    dirty: [], dirtyMark: new Uint8Array(n), epoch: 0, // tiles the renderer must redraw
    time: 0, safe: set.safe, shake: 0, nextId: 1,
    // Per-world settings (rules.world): the day's length in seconds at 1x (14 §9.1: never a constant; anything stated
    // per day scales with it, anything in seconds does not), Gentle as an index into GENTLE, Pets safe, first world.
    daySec: set.daySec, gentle: GENTLE.indexOf(set.gentle), petsSafe: set.petsSafe, first: set.first,
    tick: 0, // steps simulated since the world was created; Clear does not reset it
    fx: [], fxN: 0, // effect records; the first fxN are live (fx.js)
    dt: C.rules.tickSec, tgt: new Float64Array(2), // the step length and a step's target point (ai/move.js step())
    pp: new Float64Array(2), // the point passPt() tests
    qp: new Float64Array(3), // the point nearestAt() scans around, and its best distance so far
    onScan: null, // a test hook: called with every nearestAt() answer (tools/nearest-fixture.mjs)
    nTiles: n, thingSerial: 0, // a thing's handle is serial * nTiles + its tile; serials never repeat
    journal: [], // every command with the step it was issued before, for replays
    undo: [], // the player's steps that can be taken back (undo.js); not saved, not hashed
    lastLog: null, logSeq: 0,
    answered: 0, // logSeq as of the last command: lines up to here answer what the player did (ui/status.js)
    fullSaid: false, // "the world is full" has been said (full())
    topo: 0, // counts changes to terrain and things: a cached path from before a change is stale (path.js)
    wp: new Float64Array(2), // the waypoint a creature on a path steers to (ai/move.js)
    sepAcc: new Float64Array(2), // separation's push sums (ai/move.js separate())
    // Path searches: this step's (never over rules.path.perTick), the most in one step, all, cache hits, no
    // path found, the longest queue at the start of a step, steps whose budget ran out with asks still waiting.
    pathStat: { tick: 0, maxTick: 0, total: 0, hits: 0, fails: 0, waitMax: 0, capped: 0 },
    // Basic fire (14 §7 T9): seconds of fire left on each tile, and the list of the ones alight so a step visits
    // those and not the whole map. tmr: terrain that turns back later (ice melting, burnt ground growing back).
    burn: new Float64Array(n), burnList: new Int32Array(n), burnN: 0, tmr: [],
    scarecrows: [], // the scarecrows, so a bird can ask whether one is near without walking every thing (15 C1)
    storms: [], // thunderstorms drifting over the world (15 C2): {x, y, px, py, t, next, vx, vy}
    // Where the bolts went: counted for the tools (fixtures, the scenes), never read by the sim, never hashed
    // and never saved.
    stormHits: { rod: 0, metal: 0, bare: 0, foil: 0, ground: 0 },
    // Scratch for a strike: the tiles under the cloud, their weights, and who made each one heavy.
    stormTiles: new Int32Array(1024), stormW: new Float64Array(1024), stormWho: new Int32Array(1024),
    fireSpent: 0, // tiles this fire has spread to since the world last had none alight (design 15 A5: a fire
                  // leaves a story and then a meadow, it does not brown a world)
    // The village (design 14 §7 item 13): one per world, and only where the player painted permission.
    // claim: a byte per tile, IN = 1 (inside the paint), BUILT = 2 (the village put this here), NOBUILD = 4 (the
    // player took something away here: never build here again). claimList: the claimed tiles in paint order, the
    // order the site scan walks, so two worlds build in the same place.
    claim: new Uint8Array(n), claimList: new Int32Array(n), claimN: 0,
    vg: { flag: 0, store: 0, next: 0, worker: 0, site: -1, cd: 0, age: 0, told: -1 },
    // The one tag fire asks about, resolved once (two words, content.js).
    rxFlam0: C.tags.of(['flammable'])[0], rxFlam1: C.tags.of(['flammable'])[1],
    // Design 15 C1: cover. Ground a small creature can hide in (tall grass), resolved once the same way.
    rxCover0: C.tags.of(['cover'])[0], rxCover1: C.tags.of(['cover'])[1],
  };
  createStore(w); // creatures (ents.js)
  createGrid(w); // the cells creatures are listed in (spatial.js)
  createPerception(w); // a deciding creature's buckets (ai/decide.js)
  createPaths(w); // the pathfinder's arrays and cache (path.js)
  createEvents(w); // what a player could hear (events.js): output only
  createStory(w); // what happened and why (story.js): output only
  createReactions(w); // what happens when two things meet (reactions.js, design 14 §5)
  resetWorld(w);
  return w;
}

// Prototype reset(): wipes land, things and creatures. Safe mode and screen shake survive it.
export function resetWorld(w) {
  if (w.undo) w.undo.length = 0; // (nothing before a Clear can be taken back step by step; the game undoes a Clear whole)
  w.twisters = []; w.storms = []; w.rainT = 0; w.structs = []; w.fires = []; w.lights = []; w.graves = []; w.scarecrows = []; w.fxN = 0; w.time = 0;
  releaseAll(w);
  w.terr.fill(w.C.tid.grass); w.eaten.fill(0); w.grid.fill(null); w.eatenN = 0; w.eatenIn.fill(0);
  w.burn.fill(0); w.burnN = 0; w.tmr.length = 0; w.fireSpent = 0;
  w.claim.fill(0); w.claimN = 0; w.vg = { flag: 0, store: 0, next: 0, worker: 0, site: -1, cd: 0, age: 0, told: -1 };
  if (w.rx) { w.rx.cool.clear(); w.rx.chain.length = 0; w.rx.depth = 0; w.rx.lastTile = new Int32Array(w.cap).fill(-1); }
  w.dirty.length = 0; w.dirtyMark.fill(0); w.epoch++; w.topo++;
}

// Placement stops at rules.tools.placeCap living creatures (bible 01 §16: 6,000), saying so once until the
// world has room again. Births have their own, lower caps (ents.js).
export function full(w) {
  if (w.count < w.R.tools.placeCap) { w.fullSaid = false; return false; }
  if (!w.fullSaid) { w.fullSaid = true; log(w, 'log.worldFull'); }
  return true;
}

export function markDirty(w, i) {
  if (!w.dirtyMark[i]) { w.dirtyMark[i] = 1; w.dirty.push(i); }
}

export function log(w, key, p) {
  w.lastLog = { key, p: p || null };
  w.logSeq++;
}
// Who a log line is about: a name and a kind (or null for no one, i < 0).
export const ref = (w, i) => (i >= 0 ? { name: w.E.name[i], kind: w.E.kind[i] } : null);
export const daysOf = (w, i) => (w.time - w.E.born[i]) / w.daySec;
// Is it night? The last nightFrac of every day (01 §1).
export const isNight = (w) => (w.time % w.daySec) / w.daySec > w.R.nightFrac;
// Distance between two creatures' feet.
export const dist = (w, a, b) => hyp(w.E.x[a] - w.E.x[b], w.E.y[a] - w.E.y[b]);

export const inB = (w, tx, ty) => tx >= 0 && ty >= 0 && tx < w.cols && ty < w.rows;
// Design 15 C1 (Tall grass): small creatures and babies standing in cover cannot be seen from further than
// rules.ai.coverSee. It is the first thing in the game that lets prey get away without the player's help.
export function hiddenIn(w, o) {
  const E = w.E, C = w.C;
  if (!(E.baby[o] || C.S[E.kind[o]].size === 'small' || C.S[E.kind[o]].size === 'tiny')) return false;
  const T = w.T, tx = Math.floor(E.x[o] / T), ty = Math.floor(E.y[o] / T);
  if (!inB(w, tx, ty)) return false;
  const t = w.terr[ty * w.cols + tx];
  return (C.tags.terr0[t] & w.rxCover0) === w.rxCover0 && (C.tags.terr1[t] & w.rxCover1) === w.rxCover1;
}

// Standing on ground that flowers (design 15 C1: a meadow).
export function onFlowers(w, e) {
  const T = w.T, tx = Math.floor(w.E.x[e] / T), ty = Math.floor(w.E.y[e] / T);
  return inB(w, tx, ty) && !!w.C.TERR[w.terr[ty * w.cols + tx]].flowers;
}

export function terrAt(w, x, y) {
  const tx = Math.floor(x / w.T), ty = Math.floor(y / w.T);
  return inB(w, tx, ty) ? w.terr[ty * w.cols + tx] : -1;
}
export function structAt(w, x, y) {
  const tx = Math.floor(x / w.T), ty = Math.floor(y / w.T);
  return inB(w, tx, ty) ? w.grid[ty * w.cols + tx] : null;
}
// The thing a handle names, or null once it has been removed (the prototype's grid[ty][tx] !== s check).
// A stale handle still says which tile it was on: h % nTiles.
export function struct(w, h) {
  const s = w.grid[h % w.nTiles];
  return s && s.h === h ? s : null;
}

export const flies = (w, i) => w.C.S[w.E.kind[i]].fly || w.E.gear[i].wings || w.E.alt[i] > 0;
export const swims = (w, i) => w.C.S[w.E.kind[i]].amph || w.E.gear[i].snorkel;
// The tile a creature stands on (an index into the tile grids), or -1 off the map. Returns an integer, so
// callers can look up terrain and things without passing coordinates (a passed number gets boxed).
export function tileOf(w, i) {
  const tx = Math.floor(w.E.x[i] / w.T), ty = Math.floor(w.E.y[i] / w.T);
  return inB(w, tx, ty) ? ty * w.cols + tx : -1;
}
export function inWater(w, i) {
  const k = tileOf(w, i);
  if (k < 0 || w.C.TERR[w.terr[k]].deep !== 1) return false; // off the map is not water (terrAt gives -1)
  const s = w.grid[k];
  return !(s && s.def.bridge);
}
// Reachability (keep exactly): sea attackers only reach open water, land attackers never do,
// amphibious and flying attackers reach anything. A bridge tile counts as land.
export function reach(w, a, b) {
  if (flies(w, a)) return true;
  const bw = inWater(w, b);
  if (w.C.S[w.E.kind[a]].water) return bw;
  if (swims(w, a)) return true;
  return !bw;
}

// Can creature e stand at (x, y)? A pure read. pass() is for occasional callers; step() calls passPt()
// with the point in w.pp, so no number is boxed on its hot path.
export function pass(w, e, x, y) {
  w.pp[0] = x; w.pp[1] = y;
  return passPt(w, e);
}
export function passPt(w, e) {
  const x = w.pp[0], y = w.pp[1], T = w.T, tx = Math.floor(x / T), ty = Math.floor(y / T);
  if (!(tx >= 0 && ty >= 0 && tx < w.cols && ty < w.rows)) return false; // inB(), written out (no Math.floor result passed); NaN is refused
  const kind0 = w.E.kind[e], sp0 = w.C.S[kind0];
  // Design 15 C1: a scarecrow keeps the birds off, and most birds are fliers, so this is asked before the
  // flying shortcut. Only birds ask, and only while there is a scarecrow in the world at all.
  if (w.R.flags.crops && w.scarecrows.length && scared(w, sp0, tx, ty) && nearScarecrow(w)) return false;
  if (flies(w, e)) return true;
  const kind = kind0, sp = sp0, tid = w.C.tid, i = ty * w.cols + tx, t = w.terr[i], s = w.grid[i];
  // Design 15 C1: deep and shallow are properties of the ground now, not the name of one terrain. Sea creatures
  // want the deep and stay out of the shallows unless they are tiny; land creatures wade the shallows and
  // cannot cross the deep.
  const tt = w.C.TERR[t];
  if (sp.water) return tt.deep === 1 || (w.R.flags.shallows && sp.size === 'tiny' && tt.shallow === 1);
  if (!(s && s.def.bridge)) {
    if (t === tid.rock) return false;
    if (t === tid.lava && !sp.lavaProof) return false;
    if (tt.deep === 1 && !swims(w, e)) return false;
  }
  if (s) {
    if (s.def.block) return false;
    if (s.def.home && kind !== 'human') return false;
  }
  if (sp.fearsFire) return !nearFire(w);
  return true;
}
const EMPTY = [];
// Who a scarecrow turns away: the birds it has always kept off, and, on a field of crops, the grazers it was
// put there for (design 15 C1). Asked only while a scarecrow stands in the world at all.
function scared(w, sp, tx, ty) {
  if ((sp.tags || EMPTY).indexOf('bird') >= 0) return true;
  if (!w.R.flags.scareGrazers || sp.diet !== 'herb') return false;
  const t = w.C.TERR[w.terr[ty * w.cols + tx]];
  return !!(t && (t.crop !== undefined || t.growsTo !== undefined));
}
// A scarecrow within rules.crops.scarecrow of the point in w.pp? Few of them: each is tested (as nearFire does).
function nearScarecrow(w) {
  const x = w.pp[0], y = w.pp[1], T = w.T, R = w.R.crops.scarecrow, list = w.scarecrows;
  for (let k = 0; k < list.length; k++) {
    const s = list[k], dx = s.tx * T + 4 - x, dy = s.ty * T + 4 - y;
    if (Math.sqrt(dx * dx + dy * dy) < R) return true;
  }
  return false;
}
// A campfire within fireFear of the point in w.pp? Few fires: each is tested. Many: only the tiles that could hold
// one that near (a fire's centre is its tile's), the same answer without walking every fire in the world on every
// step of every wolf. (Nothing numeric is passed in: a passed number, even Math.floor's, gets boxed.)
function nearFire(w) {
  const x = w.pp[0], y = w.pp[1], T = w.T, tx = Math.floor(x / T), ty = Math.floor(y / T), F = w.R.ai.fireFear, fires = w.fires, R = Math.ceil((F + T / 2) / T);
  if (fires.length <= (2 * R + 1) * (2 * R + 1)) {
    for (let k = 0; k < fires.length; k++) {
      const f = fires[k], dx = f.tx * T + 4 - x, dy = f.ty * T + 4 - y;
      if (Math.sqrt(dx * dx + dy * dy) < F) return true; // hyp(), written out
    }
    return false;
  }
  for (let j = Math.max(0, ty - R); j <= Math.min(w.rows - 1, ty + R); j++) for (let i = Math.max(0, tx - R); i <= Math.min(w.cols - 1, tx + R); i++) {
    const s = w.grid[j * w.cols + i];
    if (!s || !s.def.fire) continue;
    const dx = i * T + 4 - x, dy = j * T + 4 - y;
    if (Math.sqrt(dx * dx + dy * dy) < F) return true;
  }
  return false;
}

export function placeStruct(w, type, tx, ty) {
  if (!inB(w, tx, ty)) return;
  const i = ty * w.cols + tx;
  if (w.grid[i]) return;
  const def = w.C.BLD[type], t = w.terr[i], tid = w.C.tid;
  if (t === tid.lava || (t === tid.water && !def.bridge)) return;
  // cooked: a campfire's reaction (14 §5) sets it on food. Every thing carries the field from the start, so every
  // thing record has one shape (the engine keeps the step's code optimized) and a save round trip changes nothing.
  const s = { type, def, tx, ty, occ: 0, food: w.R.food.max, cd: 0, h: ++w.thingSerial * w.nTiles + i, manned: undefined, cooked: 0,
    who: 0, name: undefined, day: 0 }; // manned: towers, set when a percher stands on it; who/name/day: a grave's (14 §7 T11)
  w.grid[i] = s; w.topo++;
  w.structs.push(s);
  if (def.fire) w.fires.push(s);
  if (def.grave) w.graves.push(s);
  if (def.village) w.vg.flag = s.h; // the flag: one village per world, the last one planted
  if (def.light) w.lights.push(s);
  if (def.scare) w.scarecrows.push(s); // design 15 C1: it keeps the birds off the field
}

export function removeStruct(w, tx, ty) {
  const i = ty * w.cols + tx, s = w.grid[i];
  if (!s) return;
  w.grid[i] = null; w.topo++;
  w.structs.splice(w.structs.indexOf(s), 1);
  if (s.def.fire) w.fires.splice(w.fires.indexOf(s), 1);
  if (s.def.light) w.lights.splice(w.lights.indexOf(s), 1);
  if (s.def.grave) w.graves.splice(w.graves.indexOf(s), 1);
  if (s.def.scare) w.scarecrows.splice(w.scarecrows.indexOf(s), 1);
  if (s.def.home) for (let k = 0; k < w.count; k++) { const e = w.order[k]; if (w.E.inside[e] === s.h) w.E.inside[e] = 0; }
}

// Several things at once (the quake): the same result as removeStruct() on each in turn, in one pass per list.
export function removeStructs(w, list) {
  if (!list.length) return;
  const gone = new Set(list), homes = new Set();
  for (const s of list) { w.grid[s.ty * w.cols + s.tx] = null; w.topo++; if (s.def.home) homes.add(s.h); }
  const keep = (a) => { let j = 0; for (let i = 0; i < a.length; i++) if (!gone.has(a[i])) a[j++] = a[i]; a.length = j; };
  keep(w.structs); keep(w.fires); keep(w.lights); keep(w.graves); keep(w.scarecrows);
  if (homes.size) for (let k = 0; k < w.count; k++) { const e = w.order[k]; if (homes.has(w.E.inside[e])) w.E.inside[e] = 0; }
}

export function setTerrain(w, tx, ty, t) {
  const i = ty * w.cols + tx;
  w.terr[i] = t; w.topo++;
  w.eaten[i] = 0;
  markDirty(w, i);
  // Design 15 C1: ground that grows into other ground (crops) sets its own clock going, and any clock the tile
  // was already running is dropped, so a tile is never waiting on two of them.
  const def = w.C.TERR[t], grows = w.R.flags.crops && def.growsTo !== undefined;
  if (grows || def.growsTo !== undefined) for (let k = w.tmr.length - 1; k >= 0; k--) if (w.tmr[k].i === i) w.tmr.splice(k, 1);
  if (grows) w.tmr.push({ i, t: def.growSec, to: w.C.tid[def.growsTo] });
}
