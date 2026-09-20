// Reactions (design 14 §5). One data file, src/data/reactions.json, says what happens when two things meet: a row
// names a trigger, tags or ids for A and B, optional conditions, a scope, and a list of effects. The player never
// sees the table; they see lightning hit a pond and every swimmer float up, and they go looking for what else works.
//
// The rules this file keeps, all from 14 §5:
//   triggers    the only six: hit, enter, power, equip, placed, clock. Nothing else raises a reaction.
//   matching    rows in file order, FIRST MATCH WINS for that trigger instance.
//   once/while  `once` fires and then that (row, A, B) pair is on cooldown (rules.react.cooldownSec, default 10 s);
//               `while` holds as long as the condition holds and is re-checked on the wearer's think tick only.
//   scope       explicit per row: the target only, a radius, or the connected tiles of a terrain (flood fill, capped).
//   chains      an effect may raise another trigger; depth <= 3, and a row cannot fire twice in one chain.
//   budget      at most rules.react.tileCap tile effects per tick world-wide; the overflow is dropped in file order.
//   safety      the filter runs on EFFECTS, not rows (14 §6): the reaction still happens to look at, and the parts
//               that would hurt a guarded creature are converted by harm.js (SRC.reaction).
//   caps        a reaction that spawns respects the world's population caps; over the cap the spawn is skipped and
//               the rest of the row still runs.
// Nothing here allocates per step: the scratch is made once per world, the cooldown key is built only when a row
// actually matches (a visible event, not a loop), and the target list is a typed array reused every time.
import { ent, spawn, G_NONE } from './ents.js';
import { log, setTerrain, removeStruct, inB } from './world.js';
import { allowed, SRC } from './harm.js';
import { addFx } from './fx.js';
import { emit, emitAt, EVI } from './events.js';
import { gatherAny } from './spatial.js';
import { setPos } from './spatial.js';

export const TRIG = { hit: 0, enter: 1, power: 2, equip: 3, placed: 4, clock: 5 };
export const TRIGS = Object.keys(TRIG);
const NO = -1;

// ---------- compiling ----------
// The rows as the sim reads them: masks and ids resolved once, grouped by trigger so a trigger walks only its own.
export function compileReactions(C) {
  const T = C.tags, byTrig = TRIGS.map(() => []);
  const rows = (C.RX || []).map((r, i) => {
    const side = (s) => {
      const m = s && s.tags ? T.of(s.tags) : [0, 0];
      return { m0: m[0], m1: m[1], id: (s && s.id) || null, kind: s && s.kind ? s.kind : null, terrain: s && s.terrain ? s.terrain : null };
    };
    const row = {
      i, id: r.id, when: r.when, a: side(r.a), b: side(r.b),
      needs: r.needs || null,
      scope: r.scope,
      mode: r.mode === 'while' ? 'while' : 'once',
      cooldownSec: r.cooldownSec === undefined ? null : r.cooldownSec,
      effects: r.effects,
      say: r.say || null,
      trig: TRIG[r.when],
    };
    // The masks a scope needs, worked out once: the terrain a fill follows, and the creatures it may take.
    const sc = row.scope;
    if (sc.terrain) { const m = T.of([sc.terrain]); sc.m0 = m[0]; sc.m1 = m[1]; }
    if (row.trig === undefined) throw new Error(`reactions.json: ${r.id} has no such trigger "${r.when}"`);
    byTrig[row.trig].push(row);
    return row;
  });
  // What each trigger's rows could possibly match on, so a trigger can say "no row cares about this" before it
  // builds anything: the ids and terrains its rows name, the union of the tag masks they ask for, and whether any
  // row matches anything at all. This is what keeps the enter trigger (every creature, every tile it walks onto)
  // off the step's critical path.
  const idx = byTrig.map((rows) => {
    const ids = new Set(), kinds = new Set(), terrs = new Set();
    let m0 = 0, m1 = 0, any = false;
    for (const r of rows) {
      const b = r.b;
      if (b.id) ids.add(b.id);
      if (b.kind) kinds.add(b.kind);
      if (b.terrain) terrs.add(b.terrain);
      m0 |= b.m0; m1 |= b.m1;
      if (!b.id && !b.kind && !b.terrain && !b.m0 && !b.m1) any = true;
    }
    return { ids, kinds, terrs, m0, m1, any, n: rows.length };
  });
  return { rows, byTrig, idx, whileGear: whileGearIds(byTrig[TRIG.equip]) };
}
// The gear a `while` row names, so a creature's think tick can ask one question instead of walking every row.
function whileGearIds(rows) {
  const ids = new Set();
  for (const r of rows || []) if (r.mode === 'while' && r.a.id) ids.add(r.a.id);
  return ids;
}

// Per world: the scratch every reaction runs in. None of it is saved (a reload forgets what is on cooldown, which
// only ever means a reaction may happen again sooner) and none of it is hashed.
// A world that has just been loaded starts from where its creatures are standing, so opening a world raises no
// enter reactions that the world which kept running would not have raised (design 14 §1 rule 6).
export function markTiles(w) {
  const R = w.rx, E = w.E;
  R.lastTile = new Int32Array(w.cap).fill(-1);
  for (let k = 0; k < w.count; k++) {
    const e = w.order[k], x = E.x[e], y = E.y[e];
    if (E.inside[e] || E.dead[e] || x < 0 || y < 0 || x >= w.W || y >= w.H) continue;
    R.lastTile[e] = ((y / w.T) | 0) * w.cols + ((x / w.T) | 0);
  }
}

export function createReactions(w) {
  w.rx = {
    R: compileReactions(w.C),
    cool: new Map(), // "row|aHandle|bHandle" -> the time it is free again
    coolSweep: 0,
    depth: 0, // how deep in a chain we are
    chain: [], // the rows that have fired in this chain, by index
    tiles: 0, tileTick: -1, // tile effects spent this tick
    targets: new Int32Array(256), tN: 0, // the creatures an effect acts on
    tileList: new Int32Array(256), tileN: 0, // the tiles it acts on
    fill: new Int32Array(1024), seen: new Int32Array(0), seenStamp: 0, // flood fill scratch
    A: side(), B: side(),
    lastTile: new Int32Array(0), // the tile each creature stood on last step (scratch; rebuilt on load)
    n: 0, fired: {}, // reactions fired, and how many of each row: the scenes print it (tools/parity.mjs)
  };
  w.rx.seen = new Int32Array(w.nTiles);
}
const clampW = (w, x) => Math.max(3, Math.min(w.W - 3, x));
const clampH = (w, y) => Math.max(3, Math.min(w.H - 3, y));
function side() { return { m0: 0, m1: 0, id: null, kind: null, terrain: null, e: -1, thing: null, tile: -1, x: 0, y: 0 }; }

// ---------- the triggers ----------
// A weapon or an element lands on a creature.
export function reactHit(w, a, t, weapId) {
  const R = w.rx, T = w.C.tags;
  fillCreature(w, R.A, a);
  if (weapId) { R.A.id = weapId; R.A.m0 |= T.weapon0[weapId] || 0; R.A.m1 |= T.weapon1[weapId] || 0; }
  fillCreature(w, R.B, t);
  run(w, TRIG.hit, w.E.x[t], w.E.y[t]);
}
// A UFO's beam reaching for someone (14 §5: a tinfoil hat sends it sliding off). Returns true when a row said no.
export function reactBeam(w, ufo, target) {
  const R = w.rx;
  fillCreature(w, R.A, ufo);
  R.A.id = 'beam'; // the beam, not the saucer: a row names it by id
  fillCreature(w, R.B, target);
  R.cancel = false;
  run(w, TRIG.hit, w.E.x[target], w.E.y[target]);
  return !!R.cancel;
}

// A creature's feet enter a tile (and whatever thing stands on it). Called only when the tile really changed.
export function reactEnter(w, e, tile) {
  const R = w.rx, s = w.grid[tile], idx = R.R.idx[TRIG.enter];
  if (!idx.n) return;
  if (!idx.any) { // could any row care about this tile at all? (the cheap test, before anything is built)
    const t = w.terr[tile];
    const m0 = w.C.tags.terr0[t] | (s ? w.C.tags.thing0[s.type] || 0 : 0);
    const m1 = w.C.tags.terr1[t] | (s ? w.C.tags.thing1[s.type] || 0 : 0);
    if (!(m0 & idx.m0) && !(m1 & idx.m1) && !(s && idx.ids.has(s.type)) && !idx.terrs.has(w.C.TERR[t].id)) return;
  }
  fillCreature(w, R.A, e);
  fillTile(w, R.B, tile, s);
  run(w, TRIG.enter, w.E.x[e], w.E.y[e]);
}
// A player power resolves at a point.
export function reactPower(w, id, x, y) {
  const R = w.rx, T = w.C.tags;
  reset(R.A); R.A.id = id; R.A.m0 = T.power0[id] || 0; R.A.m1 = T.power1[id] || 0; R.A.x = x; R.A.y = y;
  const tx = Math.floor(x / w.T), ty = Math.floor(y / w.T);
  if (inB(w, tx, ty)) fillTile(w, R.B, ty * w.cols + tx, w.grid[ty * w.cols + tx]);
  else reset(R.B);
  run(w, TRIG.power, x, y);
}
// Gear is given to a creature, or picked up by one.
export function reactEquip(w, e, itemId) {
  const R = w.rx, T = w.C.tags;
  reset(R.A); R.A.id = itemId; R.A.m0 = (T.gear0[itemId] || 0) | (T.weapon0[itemId] || 0); R.A.m1 = (T.gear1[itemId] || 0) | (T.weapon1[itemId] || 0);
  fillCreature(w, R.B, e);
  run(w, TRIG.equip, w.E.x[e], w.E.y[e]);
}
// A thing is placed, or appears, within rules.react.placedTiles tiles of another thing.
export function reactPlaced(w, s) {
  const R = w.rx, near = w.R.react.placedTiles, T = w.T;
  if (!R.R.idx[TRIG.placed].n) return;
  // The tiles around it, not every thing in the world: a world with thousands of things places just as fast.
  for (let ty = s.ty - near; ty <= s.ty + near; ty++) for (let tx = s.tx - near; tx <= s.tx + near; tx++) {
    if (!inB(w, tx, ty)) continue;
    const o = w.grid[ty * w.cols + tx];
    if (!o || o === s) continue;
    fillThing(w, R.A, s);
    fillThing(w, R.B, o);
    run(w, TRIG.placed, s.tx * T + 4, s.ty * T + 4);
  }
}
// Dawn, dusk, a full moon: checked once per event, never per tick.
export function reactClock(w, what) {
  const R = w.rx;
  reset(R.A); R.A.id = what;
  reset(R.B);
  run(w, TRIG.clock, w.W / 2, w.H / 2);
}

// `while` rows (14 §5): an effect that holds as long as the condition holds, re-checked on the wearer's think
// tick and nowhere else. For Test 1 these are worn things: what a creature carries meets the creature itself
// (a teddy bear keeps an ogre peaceful while it is held). No cooldown: it is not an event, it is a state.
export function reactWhile(w, e) {
  const R = w.rx, rows = R.R.byTrig[TRIG.equip], E = w.E, C = w.C, want = R.R.whileGear;
  if (!want.size) return;
  const g = E.gear[e];
  let carries = false; // nearly every creature carries nothing a while row names: one walk of its gear, then out
  for (const k of C.gearKeys) { const v = g[k]; if (v && want.has(typeof v === 'string' ? v : k)) { carries = true; break; } }
  if (!carries) return;
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    if (row.mode !== 'while') continue;
    fillCreature(w, R.B, e);
    if (!matches(w, row, R.B, row.b) || !needsOk(w, row)) continue;
    let found = false;
    for (const k of C.gearKeys) {
      const v = g[k];
      if (!v) continue;
      const id = typeof v === 'string' ? v : k;
      reset(R.A);
      R.A.id = id; R.A.m0 = (C.tags.gear0[id] || 0) | (C.tags.weapon0[id] || 0) | (C.tags.gear0[k] || 0);
      R.A.m1 = (C.tags.gear1[id] || 0) | (C.tags.weapon1[id] || 0) | (C.tags.gear1[k] || 0);
      if (matches(w, row, R.A, row.a)) { found = true; break; }
    }
    if (!found) continue;
    scope(w, row, E.x[e], E.y[e]);
    R.depth++;
    for (const eff of row.effects) { const verb = VERBS[eff.do]; if (verb) verb(w, row, eff, E.x[e], E.y[e]); }
    R.depth--;
    R.n++;
    R.fired[row.id] = (R.fired[row.id] || 0) + 1;
  }
}

function reset(s) { s.m0 = 0; s.m1 = 0; s.id = null; s.kind = null; s.terrain = null; s.e = -1; s.thing = null; s.tile = -1; s.x = 0; s.y = 0; }
function fillCreature(w, s, e) {
  reset(s);
  if (e < 0) return;
  const E = w.E, kind = E.kind[e], C = w.C;
  const ki = C.kid[kind];
  s.e = e; s.kind = kind; s.id = kind; s.m0 = C.tags.kind0[ki]; s.m1 = C.tags.kind1[ki];
  const g = E.gear[e];
  for (const k of C.gearKeys) { // what it wears counts as its own tags: a tinfoil hat makes its wearer foil
    const v = g[k];
    if (!v) continue;
    const id = typeof v === 'string' ? v : k;
    s.m0 |= (C.tags.gear0[id] || 0) | (C.tags.weapon0[id] || 0) | (C.tags.gear0[k] || 0);
    s.m1 |= (C.tags.gear1[id] || 0) | (C.tags.weapon1[id] || 0) | (C.tags.gear1[k] || 0);
  }
  s.x = E.x[e]; s.y = E.y[e];
}
function fillTile(w, s, tile, st) {
  reset(s);
  s.tile = tile;
  const t = w.terr[tile];
  s.m0 = w.C.tags.terr0[t]; s.m1 = w.C.tags.terr1[t];
  s.terrain = w.C.TERR[t].id;
  if (st) { s.thing = st; s.id = st.type; s.m0 |= w.C.tags.thing0[st.type] || 0; s.m1 |= w.C.tags.thing1[st.type] || 0; }
  s.x = (tile % w.cols) * w.T + 4; s.y = Math.floor(tile / w.cols) * w.T + 4;
}
function fillThing(w, s, st) {
  reset(s);
  s.thing = st; s.id = st.type; s.tile = st.ty * w.cols + st.tx;
  const t = w.terr[s.tile];
  s.m0 = (w.C.tags.thing0[st.type] || 0) | w.C.tags.terr0[t];
  s.m1 = (w.C.tags.thing1[st.type] || 0) | w.C.tags.terr1[t];
  s.x = st.tx * w.T + 4; s.y = st.ty * w.T + 4;
}

// ---------- matching ----------
function matches(w, row, s, side2) {
  if ((s.m0 & side2.m0) !== side2.m0 || (s.m1 & side2.m1) !== side2.m1) return false;
  if (side2.id && s.id !== side2.id) return false;
  if (side2.kind && s.kind !== side2.kind) return false;
  if (side2.terrain && s.terrain !== side2.terrain) return false;
  return true;
}
// A row's conditions. Only the one a row actually asks for is here: the design also lists night, terrain and Safe
// off, and each is one line the day a row wants it (the coverage gate refuses code that nothing runs).
function needsOk(w, row) {
  const n = row.needs;
  if (!n) return true;
  if (n.raining !== undefined && n.raining !== w.rainT > 0) return false;
  return true;
}
const handleOf = (w, s) => (s.e >= 0 ? w.slotH[s.e] : s.thing ? -s.thing.h : s.tile >= 0 ? -1000000 - s.tile : 0);
function onCooldown(w, row, key) {
  const until = w.rx.cool.get(key);
  return until !== undefined && until > w.time;
}
function setCooldown(w, row, key) {
  const R = w.rx, sec = row.cooldownSec === null ? w.R.react.cooldownSec : row.cooldownSec;
  if (sec <= 0) return;
  R.cool.set(key, w.time + sec);
  if (R.cool.size > w.R.react.coolMax) { // sweep what has run out, oldest first (insertion order)
    for (const [k, t] of R.cool) { if (t <= w.time) R.cool.delete(k); if (R.cool.size <= w.R.react.coolMax / 2) break; }
  }
}

// The heart: walk this trigger's rows in file order, fire the first that matches.
function run(w, trig, x, y) {
  const R = w.rx;
  if (R.depth >= w.R.react.maxDepth) return false;
  const rows = R.R.byTrig[trig];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!matches(w, row, R.A, row.a) || !matches(w, row, R.B, row.b)) continue;
    if (!needsOk(w, row)) continue;
    if (R.chain.indexOf(row.i) >= 0) continue; // a row fires once in a chain
    const key = row.i + '|' + handleOf(w, R.A) + '|' + handleOf(w, R.B);
    if (row.mode === 'once' && onCooldown(w, row, key)) continue;
    fire(w, row, key, x, y);
    return true; // first match wins
  }
  return false;
}

// ---------- firing ----------
function fire(w, row, key, x, y) {
  const R = w.rx;
  if (row.mode === 'once') setCooldown(w, row, key);
  // The targets, by the row's scope, taken before the effects run (an effect may kill or move them).
  scope(w, row, x, y);
  R.depth++;
  R.chain.push(row.i);
  for (const eff of row.effects) {
    const verb = VERBS[eff.do];
    if (verb) verb(w, row, eff, x, y);
  }
  R.n++;
  R.fired[row.id] = (R.fired[row.id] || 0) + 1;
  if (row.say) log(w, row.say, { a: R.A.e >= 0 ? { name: w.E.name[R.A.e], kind: w.E.kind[R.A.e] } : null, b: R.B.e >= 0 ? { name: w.E.name[R.B.e], kind: w.E.kind[R.B.e] } : null });
  R.chain.pop();
  R.depth--;
}

// Who and what the effects act on. Fills R.targets (creature slots) and R.tileList (tile indexes).
function scope(w, row, x, y) {
  const R = w.rx, sc = row.scope;
  R.tN = 0; R.tileN = 0;
  if (sc.kind === 'a') { if (R.A.e >= 0) R.targets[R.tN++] = R.A.e; if (R.A.tile >= 0) R.tileList[R.tileN++] = R.A.tile; return; }
  if (sc.kind === 'b') { if (R.B.e >= 0) R.targets[R.tN++] = R.B.e; if (R.B.tile >= 0) R.tileList[R.tileN++] = R.B.tile; return; }
  if (sc.kind === 'radius') {
    const n = gatherAny(w, x, y, sc.r), near = w.near;
    for (let k = 0; k < n && R.tN < R.targets.length; k++) {
      const o = near[k];
      if (w.E.inside[o] || w.E.dead[o]) continue;
      if (sc.only && !only(w, sc, o)) continue;
      R.targets[R.tN++] = o;
    }
    tilesInRadius(w, x, y, sc.r, sc);
  } else if (sc.kind === 'fill') {
    fillTiles(w, R.B.tile, sc, Math.min(sc.max || w.R.react.tileCap, w.R.react.tileCap));
    creaturesOnTiles(w);
  } else { // 'target'
    if (R.B.e >= 0) R.targets[R.tN++] = R.B.e;
    if (R.B.tile >= 0) R.tileList[R.tileN++] = R.B.tile;
  }
}
// A scope may take only some of the creatures it reached: a kind, or tags (the crown's parade is chickens).
// A scope may take only some of the creatures it reached: the kind a row names (the crown's parade is chickens).
function only(w, sc, e) { return w.E.kind[e] === sc.only.kind; }
function tilesInRadius(w, x, y, r, sc) {
  const R = w.rx, T = w.T, m0 = sc.m0 || 0, m1 = sc.m1 || 0;
  const tx0 = Math.max(0, Math.floor((x - r) / T)), tx1 = Math.min(w.cols - 1, Math.floor((x + r) / T));
  const ty0 = Math.max(0, Math.floor((y - r) / T)), ty1 = Math.min(w.rows - 1, Math.floor((y + r) / T));
  for (let ty = ty0; ty <= ty1 && R.tileN < R.tileList.length; ty++) for (let tx = tx0; tx <= tx1 && R.tileN < R.tileList.length; tx++) {
    const i = ty * w.cols + tx;
    if ((w.C.tags.terr0[w.terr[i]] & m0) !== m0 || (w.C.tags.terr1[w.terr[i]] & m1) !== m1) continue;
    R.tileList[R.tileN++] = i;
  }
}
// The connected tiles of one terrain tag, from the tile the reaction landed on: a flood fill, capped (14 §5).
function fillTiles(w, from, sc, cap) {
  const R = w.rx;
  if (from < 0) return;
  const m0 = sc.m0 || 0, m1 = sc.m1 || 0;
  R.seenStamp++;
  let head = 0, n = 0;
  R.fill[n++] = from; R.seen[from] = R.seenStamp;
  while (head < n && R.tileN < cap) {
    const i = R.fill[head++];
    if ((w.C.tags.terr0[w.terr[i]] & m0) !== m0 || (w.C.tags.terr1[w.terr[i]] & m1) !== m1) continue;
    R.tileList[R.tileN++] = i;
    const tx = i % w.cols, ty = (i / w.cols) | 0;
    for (let d = 0; d < 4; d++) {
      const nx = tx + (d === 0 ? 1 : d === 1 ? -1 : 0), ny = ty + (d === 2 ? 1 : d === 3 ? -1 : 0);
      if (!inB(w, nx, ny)) continue;
      const j = ny * w.cols + nx;
      if (R.seen[j] === R.seenStamp || n >= R.fill.length) continue;
      R.seen[j] = R.seenStamp;
      R.fill[n++] = j;
    }
  }
}
function creaturesOnTiles(w) {
  const R = w.rx, E = w.E, T = w.T;
  for (let k = 0; k < w.count && R.tN < R.targets.length; k++) {
    const e = w.order[k];
    if (E.inside[e] || E.dead[e]) continue;
    const i = Math.floor(E.y[e] / T) * w.cols + Math.floor(E.x[e] / T);
    for (let j = 0; j < R.tileN; j++) if (R.tileList[j] === i) { R.targets[R.tN++] = e; break; }
  }
}

// A tile effect may only spend from this tick's budget (14 §5); the overflow is dropped, in file order, which is
// the order rows run in, so two worlds with the same seed drop the same tiles.
function tileBudget(w, want) {
  const R = w.rx;
  if (R.tileTick !== w.tick) { R.tileTick = w.tick; R.tiles = 0; }
  const left = Math.max(0, w.R.react.tileCap - R.tiles);
  const take = Math.min(want, left);
  R.tiles += take;
  return take;
}

// ---------- the effect verbs ----------
// Every verb is small and generic: a row adds no code. `w.rx.targets` and `w.rx.tileList` are what it acts on.
export const VERBS = {
  // Damage, always through the harm table as a reaction (14 §6): a guarded human is singed, not hurt.
  damage(w, row, eff) {
    const R = w.rx, E = w.E;
    for (let k = 0; k < R.tN; k++) {
      const e = R.targets[k], dmg = allowed(w, e, SRC.reaction, eff.hp);
      if (dmg > 0) { E.hp[e] -= dmg; E.flash[e] = w.R.combat.hitFlash; }
    }
  },
  // Held still where they stand (the freeze power's own field), and floating if they are in water.
  stun(w, row, eff) {
    const R = w.rx, E = w.E;
    for (let k = 0; k < R.tN; k++) { const e = R.targets[k]; E.frozen[e] = Math.max(E.frozen[e], eff.sec); E.goalKind[e] = G_NONE; }
  },
  // Peaceful: it stops wanting to fight for a while (ai/decide.js reads E.calm).
  calm(w, row, eff) {
    const R = w.rx, E = w.E;
    for (let k = 0; k < R.tN; k++) { const e = R.targets[k]; E.calm[e] = Math.max(E.calm[e], eff.sec); E.goalKind[e] = G_NONE; E.think[e] = 0; }
  },
  // Follow whoever set this off (ai/decide.js B_FOLLOW), for a while or until they are gone.
  follow(w, row, eff) {
    const R = w.rx, E = w.E, lead = R.B.e; // whoever the row met
    if (lead < 0) return;
    for (let k = 0; k < R.tN; k++) { const e = R.targets[k]; if (e === lead) continue; E.fol[e] = w.slotH[lead]; E.folT[e] = eff.sec || w.R.react.followSec; E.think[e] = 0; }
  },
  // Turn into another kind, keeping where it stands and its name (a slime crossing lava).
  become(w, row, eff) {
    const R = w.rx, E = w.E;
    for (let k = 0; k < R.tN; k++) {
      const e = R.targets[k];
      if (!w.C.S[eff.kind]) continue;
      const was = E.kind[e], hp = E.hp[e], max = w.C.S[was].hp;
      E.kind[e] = eff.kind;
      E.hp[e] = Math.max(1, (hp / max) * w.C.S[eff.kind].hp);
      // The counts the sim keeps by kind, and the list of humans, follow it across (ents.js keeps both).
      w.kindCount[w.C.kid[was]]--;
      w.kindCount[w.C.kid[eff.kind]]++;
      if (was === 'human' || eff.kind === 'human') {
        let h = 0;
        for (let j = 0; j < w.count; j++) if (E.kind[w.order[j]] === 'human') w.humans[h++] = w.order[j];
        w.nHumans = h;
      }
      addFx(w, 'magic', E.x[e], E.y[e], w.R.fx.heart);
    }
  },
  // A new creature at the place; the world's caps still hold (14 §5).
  spawn(w, row, eff, x, y) {
    const cap = w.R.tools.placeCap;
    const n = Math.min(eff.n === undefined ? 1 : eff.n, 8);
    for (let k = 0; k < n; k++) {
      if (w.count >= cap) return; // quietly: the player did not ask for this one, so the world never says it is full
      const sp = eff.spread || 6;
      const i = spawn(w, eff.kind, clampW(w, x + (k % 3) * sp - sp), clampH(w, y + (((k / 3) | 0) - 1) * sp));
      if (i < 0) return;
      if (eff.tame) w.E.calm[i] = w.R.react.tameSec;
      emitAt(w, EVI.birth, i);
    }
  },
  // The tiles this row scoped become another terrain, and (with sec) turn back later: a walkable ice bridge.
  terrain(w, row, eff) {
    const R = w.rx, to = w.C.tid[eff.to];
    if (to === undefined) return;
    const take = tileBudget(w, R.tileN);
    for (let k = 0; k < take; k++) {
      const i = R.tileList[k], was = w.terr[i];
      if (was === to) continue;
      setTerrain(w, i % w.cols, (i / w.cols) | 0, to);
      if (eff.sec > 0) w.tmr.push({ i, t: eff.sec, to: was });
    }
  },
  // Set the tiles alight (basic fire, below).
  ignite(w, row, eff) {
    const R = w.rx;
    const take = tileBudget(w, R.tileN);
    for (let k = 0; k < take; k++) ignite(w, R.tileList[k], eff.sec);
  },
  // Cooked food: a thing with food becomes worth more, and eaters show a heart (T9's campfire row).
  cook(w, row, eff) {
    const s = eff.which === 'a' ? w.rx.A.thing : w.rx.B.thing;
    if (!s || !s.def.food || s.cooked) return;
    s.cooked = 1;
    addFx(w, 'heart', s.tx * w.T + 4, s.ty * w.T - 2, w.R.fx.heart);
  },
  // Up into the air with a parachute (a launched cow, design 14 §5), using the machinery the UFO already uses.
  launch(w, row, eff) {
    const R = w.rx, E = w.E, U = w.R.ufo;
    for (let k = 0; k < R.tN; k++) {
      const e = R.targets[k];
      if (E.inside[e]) continue;
      E.alt[e] = eff.alt; E.chute[e] = true; E.goalKind[e] = G_NONE; E.think[e] = 0;
      const dx = eff.px;
      setPos(w, e, Math.max(3, Math.min(w.W - 3, E.x[e] + dx)), E.y[e]);
      addFx(w, 'beam', E.x[e], E.y[e], w.R.fx.beamDrop);
      emitAt(w, EVI.chute, e);
    }
  },
  // The thing that met is gone (a burnt bush).
  removeThing(w, row, eff) {
    const s = eff && eff.which === 'a' ? w.rx.A.thing : w.rx.B.thing;
    if (s) removeStruct(w, s.tx, s.ty);
  },
  // Pictures and sounds: these always happen, whatever the harm table said about the rest (14 §6).
  fx(w, row, eff, x, y) {
    if (eff.every && w.tick % Math.round(eff.every / w.R.tickSec)) return; // a `while` row's picture, now and then
    addFx(w, eff.id, x, y, eff.sec);
  },
  // Land on the nearest thing that can be perched on (14 §5: a bounce pad by a tower), the way a parachute does.
  perchNear(w, row, eff, x, y) {
    const R = w.rx, E = w.E, U = w.R.ufo, T = w.T;
    let best = null, bd = eff.r * eff.r;
    for (const s of w.structs) {
      if (!s.def.shoot) continue;
      const dx = s.tx * T + 4 - x, dy = s.ty * T + 4 - y, d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = s; }
    }
    if (!best) return;
    for (let k = 0; k < R.tN; k++) {
      const e = R.targets[k];
      if (E.inside[e] || E.perch[e]) continue;
      E.perch[e] = best.h; E.perchT[e] = U.perchSec; E.alt[e] = 0; E.chute[e] = false; E.goalKind[e] = G_NONE;
      setPos(w, e, best.tx * T + 4, best.ty * T + 6);
      best.manned = U.perchSec;
      emitAt(w, EVI.perch, e);
      addFx(w, 'beam', E.x[e], E.y[e], w.R.fx.beamDrop);
    }
  },
  // The thing that set this off does not happen (the UFO's beam slides off a tinfoil hat): the caller asks.
  deflect(w) { w.rx.cancel = true; },
  sound(w, row, eff, x, y) { if (EVI[eff.id] !== undefined) emit(w, EVI[eff.id], x, y, 0); },
};

// ---------- basic fire (14 §7 T9: burn, spread, extinguish, regrow) ----------
export function ignite(w, i, sec) {
  if (i < 0 || i >= w.nTiles) return false;
  const F = w.R.fire;
  const t = w.terr[i], s = w.grid[i];
  const flammable = (w.C.tags.terr0[t] & w.rxFlam0) === w.rxFlam0 && (w.C.tags.terr1[t] & w.rxFlam1) === w.rxFlam1;
  const thingFlam = !!s && ((w.C.tags.thing0[s.type] || 0) & w.rxFlam0) === w.rxFlam0 && ((w.C.tags.thing1[s.type] || 0) & w.rxFlam1) === w.rxFlam1;
  if (!flammable && !thingFlam) return false;
  if (w.burn[i] > 0) return false;
  w.burn[i] = sec || F.burnSec;
  if (w.burnN < w.burnList.length) w.burnList[w.burnN++] = i;
  emit(w, EVI.boom, (i % w.cols) * w.T + 4, ((i / w.cols) | 0) * w.T + 4, 0);
  return true;
}
// Every step: fire burns, spreads, goes out in rain, and what burnt away grows back.
export function fireTick(w, dt) {
  const F = w.R.fire, T = w.T;
  let write = 0;
  for (let k = 0; k < w.burnN; k++) {
    const i = w.burnList[k];
    if (w.burn[i] <= 0) continue;
    w.burn[i] -= dt * (w.rainT > 0 ? F.rainOut : 1);
    if (w.burn[i] <= 0) { burnOut(w, i); continue; }
    // Hurt whoever stands in it, through the harm table (a reaction, 14 §6).
    // Spread to a neighbour, on the sim's own random stream so two worlds burn the same way.
    if (w.rng.float() < F.spread * dt) {
      const tx = i % w.cols, ty = (i / w.cols) | 0, d = Math.floor(w.rng.float() * 4);
      const nx = tx + (d === 0 ? 1 : d === 1 ? -1 : 0), ny = ty + (d === 2 ? 1 : d === 3 ? -1 : 0);
      if (inB(w, nx, ny)) ignite(w, ny * w.cols + nx, 0);
    }
    w.burnList[write++] = i;
  }
  w.burnN = write;
  if (w.burnN) burnCreatures(w, dt);
  // Timed terrain: ice melts back to water, burnt ground grows back.
  for (let k = w.tmr.length - 1; k >= 0; k--) {
    const t = w.tmr[k];
    t.t -= dt;
    if (t.t > 0) continue;
    setTerrain(w, t.i % w.cols, (t.i / w.cols) | 0, t.to);
    w.tmr.splice(k, 1);
  }
}
function burnOut(w, i) {
  const F = w.R.fire, tx = i % w.cols, ty = (i / w.cols) | 0, s = w.grid[i];
  if (s && ((w.C.tags.thing0[s.type] || 0) & w.rxFlam0) === w.rxFlam0 && ((w.C.tags.thing1[s.type] || 0) & w.rxFlam1) === w.rxFlam1) removeStruct(w, tx, ty);
  const was = w.terr[i];
  if ((w.C.tags.terr0[was] & w.rxFlam0) === w.rxFlam0 && (w.C.tags.terr1[was] & w.rxFlam1) === w.rxFlam1) {
    setTerrain(w, tx, ty, w.C.tid.dirt);
    w.tmr.push({ i, t: F.regrowSec, to: was }); // it grows back
  }
  addFx(w, 'boom', tx * w.T + 4, ty * w.T + 4, 0.3);
}
function burnCreatures(w, dt) {
  const E = w.E, T = w.T, F = w.R.fire;
  for (let k = 0; k < w.count; k++) {
    const e = w.order[k];
    if (E.inside[e] || E.dead[e] || E.alt[e] > 0) continue;
    const i = Math.floor(E.y[e] / T) * w.cols + Math.floor(E.x[e] / T);
    if (i < 0 || i >= w.nTiles || w.burn[i] <= 0) continue;
    const dmg = allowed(w, e, SRC.reaction, F.dps * dt);
    if (dmg > 0) { E.hp[e] -= dmg; E.flash[e] = w.R.fx.hazardFlash; }
  }
}
