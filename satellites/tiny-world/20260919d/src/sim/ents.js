// Creatures: a struct of arrays. A creature is a slot index i, and its fields are w.E.<field>[i], typed
// arrays that grow in blocks of 1,024 slots. Growing replaces the arrays, so code reads them through
// w.E every time (E.x[i]) and never keeps E.x in a local across anything that can spawn.
//
// Nothing holds a creature by slot across steps: links are handles. A handle names one creature for its
// whole life. It is gen * SLOT_SPAN + slot; when the creature is removed its slot's generation moves on,
// so every handle to it goes stale and ent() returns -1, which the code reads the way the prototype read
// `o.dead`. Slot 0 is a real creature: every "none" test is `< 0`, never falsiness.
import { rnd, pick } from './rng.js';
import { newGear } from './content.js';
import { setPos, unlink } from './spatial.js';

export const SLOT_SPAN = 4194304; // 2^22 slots; generations start at 1, so a handle is never 0
const BLOCK = 1024; // slots are added in blocks of this many

// Goal kinds. A goal is flat fields: goalKind; goalA, the target's handle (a creature for attack, abduct
// and mate, a thing for bush and house); goalB, the target creature's kind index, kept so "is it after a
// human?" still has an answer once the target is gone; goalX, goalY, a point to move to (a tile for
// graze); goalRun, 1 when moving at a run.
export const G_NONE = 0, G_MOVE = 1, G_ATTACK = 2, G_ABDUCT = 3, G_GRAZE = 4, G_BUSH = 5, G_HOUSE = 6, G_MATE = 7;
export const GOAL_NAMES = ['', 'move', 'attack', 'abduct', 'graze', 'bush', 'house', 'mate'];

// Every creature field. The links: anger (whoever last hit it), cargo (a UFO's passenger), inside (a
// house's thing handle, or minus the handle of the UFO carrying it), perch (the archer tower it stands on).
// dropX, dropY: where its UFO was when the UFO was removed with it still aboard. beh: the behaviour it chose
// last (ai/decide.js), which gets the +10 that keeps creatures from dithering. The path fields (ai/move.js):
// blockT, steps in a row its straight line was blocked; pathN turning points in w.pathPts from slot * the
// waypoint limit, pathI the one it walks to; pathGoal, the tile the path was asked for; pathQd, 1 while it
// waits in the search queue (2: skip the cache); pathAt, the step before which it asks for no new path;
// pathFresh, 1 once it has had a path for pathGoal (so asking again means searching again); pathTopo, w.topo
// when that path was made.
export const FIELDS = ['id', 'kind', 'x', 'y', 'px', 'py', 'hp', 'hunger', 'gear', 'face', 'think', 'cd', 'breedCd', 'born', 'baby',
  'flash', 'name', 'over', 'goalKind', 'goalA', 'goalB', 'goalX', 'goalY', 'goalRun', 'anger', 'cargo', 'inside', 'perch', 'dead',
  'alt', 'chute', 'bounced', 'perchT', 'carryT', 'abCd', 'bless', 'frozen', 'healT', 'dropX', 'dropY', 'beh',
  'blockT', 'pathN', 'pathI', 'pathGoal', 'pathQd', 'pathAt', 'pathFresh', 'pathTopo'];
// Storage per field. Float64 for positions, hp, hunger, every timer (float seconds, as the prototype
// counted them: PLAN fact F4) and every handle. Flags are 0/1 in Uint8 (BOOL_FIELDS were true/false in the
// prototype; views and the hash show them as booleans). kind, name, looks (over) and gear stay plain
// arrays of strings and small objects: reading them allocates nothing. kind becomes a u16 index when the
// species lookups are reworked (M1-3 or M2-2).
const TYPES = { face: Int8Array, baby: Uint8Array, dead: Uint8Array, chute: Uint8Array, bounced: Uint8Array, goalKind: Uint8Array,
  goalRun: Uint8Array, goalB: Int32Array, beh: Uint8Array, kind: Array, name: Array, over: Array, gear: Array,
  blockT: Uint8Array, pathN: Uint8Array, pathI: Uint8Array, pathGoal: Int32Array, pathQd: Uint8Array, pathAt: Int32Array, pathFresh: Uint8Array, pathTopo: Int32Array };
export const BOOL_FIELDS = ['baby', 'dead', 'chute'];
const typeOf = (f) => TYPES[f] || Float64Array;

export function createStore(w) {
  const E = {};
  for (const f of FIELDS) E[f] = typeOf(f) === Array ? [] : new (typeOf(f))(0);
  w.E = E;
  w.cap = 0; // slots allocated
  w.nSlots = 0; // slots ever used
  w.slotH = new Float64Array(0); // the handle each slot names (a free slot: the one it hands out next)
  w.order = new Int32Array(0); // live slots in spawn order, the order every loop runs in; w.count of them
  w.count = 0;
  w.free = new Int32Array(0); // free slots, w.nFree of them
  w.nFree = 0;
  w.cellOf = new Int32Array(0); w.cnext = new Int32Array(0); w.cprev = new Int32Array(0); // spatial.js cell lists
  w.kindCount = new Int32Array(w.C.kinds.length); // listed creatures per kind (the mating cap), dead-this-step included
  w.humans = new Int32Array(0); w.nHumans = 0; // the human slots, any order (query.js nearestHuman), dead-this-step included
  // Non-humans that went after a human (goalEnt is the only way to that goal): a guardian's targets when no enemy is
  // alive (ai/decide.js). atkIn marks a slot listed; entries no longer after a human are dropped when read.
  w.atkList = new Int32Array(0); w.atkIn = new Uint8Array(0); w.nAtk = 0;
  w.pathPts = new Int32Array(0); // each slot's path, rules.path.waypoints tiles from slot * that (ai/move.js)
  w.pq = new Float64Array(0); w.pqN = 0; // handles waiting for a path search, first come first served
}

function grow(w) {
  const cap = w.cap + BLOCK, E = w.E;
  for (const f of FIELDS) {
    const T = typeOf(f);
    if (T === Array) continue; // plain arrays grow as slots are written, one after another
    const a = new T(cap);
    a.set(E[f]);
    E[f] = a;
  }
  const slotH = new Float64Array(cap), order = new Int32Array(cap), free = new Int32Array(cap);
  slotH.set(w.slotH); order.set(w.order); free.set(w.free);
  w.slotH = slotH; w.order = order; w.free = free; w.cap = cap;
  for (const f of ['cellOf', 'cnext', 'cprev']) { const a = new Int32Array(cap); a.set(w[f]); w[f] = a; }
  const hum = new Int32Array(cap); hum.set(w.humans); w.humans = hum;
  const al = new Int32Array(cap), ai = new Uint8Array(cap); al.set(w.atkList); ai.set(w.atkIn); w.atkList = al; w.atkIn = ai;
  const pts = new Int32Array(cap * w.R.path.waypoints), pq = new Float64Array(2 * cap); // the queue: live asks plus stale ones
  pts.set(w.pathPts); pq.set(w.pq); w.pathPts = pts; w.pq = pq;
}

// The slot a handle names, or -1 once the creature is gone. A creature that died during this step still
// resolves, with `dead` set, until the end-of-step compaction: the prototype's code checks `dead` itself.
export function ent(w, h) {
  const s = h % SLOT_SPAN;
  return s < w.nSlots && w.slotH[s] === h ? s : -1;
}

export function goalMove(w, i, x, y, run) { const E = w.E; E.goalKind[i] = G_MOVE; E.goalX[i] = x; E.goalY[i] = y; E.goalRun[i] = run; }
export function goalEnt(w, i, kind, o) {
  const E = w.E; E.goalKind[i] = kind; E.goalA[i] = w.slotH[o]; E.goalB[i] = w.C.kid[E.kind[o]];
  if (kind === G_ATTACK && o >= 0 && E.kind[o] === 'human' && E.kind[i] !== 'human' && !w.atkIn[i]) { w.atkIn[i] = 1; w.atkList[w.nAtk++] = i; }
}

// A new creature at the end of the spawn order (so it updates this step if it is born during one).
// Returns its slot, or -1 when a birth would pass the population cap.
export function spawn(w, kind, x, y, baby) {
  const R = w.R, sp = w.C.S[kind], E = w.E;
  if (baby && w.count >= R.breed.popCap) return -1;
  let s;
  if (w.nFree > 0) s = w.free[--w.nFree];
  else {
    if (w.nSlots === w.cap) grow(w);
    s = w.nSlots++;
    w.slotH[s] = SLOT_SPAN + s;
  }
  // Random draws in the prototype's order: hunger, breeding cooldown, then name and looks.
  E.id[s] = w.nextId++; E.kind[s] = kind; w.cellOf[s] = -1; setPos(w, s, x, y); E.px[s] = x; E.py[s] = y; E.hp[s] = sp.hp;
  E.hunger[s] = rnd(w, R.spawn.hunger[0], R.spawn.hunger[1]);
  E.gear[s] = Object.assign(newGear(w.C), sp.gear);
  E.face[s] = 1; E.think[s] = 0; E.cd[s] = 0;
  E.breedCd[s] = baby ? 0 : rnd(w, R.spawn.breedCd[0], R.spawn.breedCd[1]);
  E.born[s] = w.time; E.baby[s] = !!baby; E.flash[s] = 0;
  E.goalKind[s] = G_NONE; E.goalA[s] = 0; E.goalB[s] = 0; E.goalX[s] = 0; E.goalY[s] = 0; E.goalRun[s] = 0;
  E.anger[s] = 0; E.cargo[s] = 0; E.inside[s] = 0; E.perch[s] = 0;
  E.dead[s] = false; E.alt[s] = 0; E.chute[s] = false; E.bounced[s] = 0; E.perchT[s] = 0; E.carryT[s] = 0;
  E.abCd[s] = 0; E.bless[s] = 0; E.frozen[s] = 0; E.healT[s] = 0; E.dropX[s] = 0; E.dropY[s] = 0; E.beh[s] = 0;
  E.blockT[s] = 0; E.pathN[s] = 0; E.pathI[s] = 0; E.pathGoal[s] = 0; E.pathQd[s] = 0; E.pathAt[s] = 0; E.pathFresh[s] = 0; E.pathTopo[s] = 0;
  E.name[s] = undefined; E.over[s] = undefined;
  if (kind === 'human') {
    E.name[s] = pick(w, w.C.names.people);
    const look = w.C.looks.human, over = {};
    for (const k in look) if (k[0] !== '_') over[k] = pick(w, look[k]);
    E.over[s] = over;
  }
  if (sp.pet) E.name[s] = pick(w, w.C.names.pets);
  w.order[w.count++] = s; // count <= nSlots <= cap, so there is room
  w.kindCount[w.C.kid[kind]]++;
  if (kind === 'human') w.humans[w.nHumans++] = s;
  return s;
}

function release(w, i) {
  const E = w.E;
  unlink(w, i);
  w.kindCount[w.C.kid[E.kind[i]]]--;
  E.gear[i] = null; E.over[i] = undefined; E.name[i] = undefined;
  w.slotH[i] += SLOT_SPAN;
  w.free[w.nFree++] = i;
}

// Drops the dead from the spawn order and frees their slots. Runs only at the end of a step (and after an
// erase, between steps), never mid-step, so a birth cannot reuse a slot that live handles still name.
export function compact(w) {
  const E = w.E, order = w.order;
  let n = 0, humanGone = false;
  for (let k = 0; k < w.count; k++) {
    const i = order[k];
    if (!E.dead[i]) { order[n++] = i; continue; }
    // A UFO gone with its passenger still aboard: the passenger bails out where the UFO was, on its next
    // step (the prototype read the dead UFO's position then; the UFO's slot may be reused by then).
    if (E.cargo[i]) { const c = ent(w, E.cargo[i]); if (c >= 0 && E.inside[c] === -w.slotH[i]) { E.dropX[c] = E.x[i]; E.dropY[c] = E.y[i]; } }
    if (E.kind[i] === 'human') humanGone = true;
    release(w, i);
  }
  w.count = n;
  if (humanGone) { let h = 0; for (let k = 0; k < n; k++) if (E.kind[order[k]] === 'human') w.humans[h++] = order[k]; w.nHumans = h; }
}

// Clear: every creature goes, and every handle to one goes stale.
export function releaseAll(w) {
  for (let k = 0; k < w.count; k++) release(w, w.order[k]);
  w.count = 0; w.nHumans = 0; w.nAtk = 0; w.atkIn.fill(0);
}
