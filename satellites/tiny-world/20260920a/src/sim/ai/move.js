// Steering: straight at the goal, slide along a blocked axis (the prototype), and since M1-6 paths around
// what blocks the straight line, plus a small push apart in crowds (bible 01 §7). Creatures are slots.
import { rnd } from '../rng.js';
import { hyp, clamp } from '../math.js';
import { terrAt, flies, passPt } from '../world.js';
import { goalMove, ent, G_ATTACK, G_ABDUCT, G_MATE } from '../ents.js';
import { setPosPt, CELL } from '../spatial.js';
import { search, pathClass, cacheGet, cachePut } from '../path.js';

export function wander(w, e) {
  const R = w.R.ai, E = w.E;
  goalMove(w, e, clamp(4, w.W - 4, E.x[e] + rnd(w, -R.wanderDist, R.wanderDist)), clamp(4, w.H - 4, E.y[e] + rnd(w, -R.wanderDist, R.wanderDist)), 0);
  E.think[e] = rnd(w, R.wanderThink[0], R.wanderThink[1]);
}

// One step of creature e toward the point in w.tgt[0], w.tgt[1], at the speed of movement mode `mode`.
// The point and dt travel in w.tgt and w.dt rather than as arguments, so calling this boxes no number
// (step is too big to be inlined, and every moving creature calls it every step). Returns true on arrival.
export function step(w, e, mode) {
  const E = w.E, x = E.x[e], y = E.y[e];
  if (hyp(w.tgt[0] - x, w.tgt[1] - y) < w.R.move.arrive) { E.blockT[e] = 0; E.pathN[e] = 0; E.pathFresh[e] = 0; return true; }
  // On a path: steer to its next turning point instead (onPath writes it into w.wp).
  const via = E.pathN[e] > 0 && onPath(w, e), tx = via ? w.wp[0] : w.tgt[0], ty = via ? w.wp[1] : w.tgt[1];
  const dx = tx - x, dy = ty - y, d = hyp(dx, dy);
  const sp = w.C.S[E.kind[e]], tt = w.C.TERR[terrAt(w, x, y)] || {}, mult = w.C.mv[mode];
  let tm = flies(w, e) ? 1 : tt.spd || 1;
  if (tm < 1 && sp.snow && tt.cold) tm = 1;
  let v = sp.spd * (mult || 1) * (E.baby[e] ? w.R.breed.babySpeed : 1) * tm * (E.gear[e].boots ? w.R.move.boots : 1) * w.dt;
  if (v > d) v = d;
  const nx = x + (dx / d) * v, ny = y + (dy / d) * v;
  if (Math.abs(dx) > 0.5) E.face[e] = dx < 0 ? -1 : 1;
  // Move if it stands somewhere it cannot (to get out) or the new point is passable; else slide along one
  // axis; else it is stuck. passPt() tests the point in w.pp (a pure read).
  // The move goes through w.pp too (setPosPt): no coordinate is passed as an argument.
  const pp = w.pp;
  pp[0] = x; pp[1] = y;
  let go = !passPt(w, e);
  if (!go) { pp[0] = nx; pp[1] = ny; go = passPt(w, e); }
  if (go) {
    pp[0] = Math.max(1, Math.min(w.W - 1, nx)); pp[1] = Math.max(1, Math.min(w.H - 1, ny));
    setPosPt(w, e); E.blockT[e] = 0;
  } else if (Math.abs(dx) > 0.3 && ((pp[0] = nx), (pp[1] = y), passPt(w, e))) { setPosPt(w, e); blocked(w, e, false); }
  else if (Math.abs(dy) > 0.3 && ((pp[0] = x), (pp[1] = ny), passPt(w, e))) { setPosPt(w, e); blocked(w, e, false); }
  else blocked(w, e, true);
  if (w.R.path.sepPush > 0 && crowded(w, e)) separate(w, e);
  return false;
}

// Whether this step pushes it apart (design 14 §7 T2, the M1-6 speed regression won back): never when it is the only
// creature in its cell, and otherwise on one step in sepEvery (by id, so a crowd's pushes are spread over the steps),
// each push sepEvery times as long, so the push per second is the same.
function crowded(w, e) {
  if (w.cellHead[w.cellOf[e]] === e && w.cnext[e] < 0) return false;
  return (w.tick + w.E.id[e]) % w.R.path.sepEvery === 0;
}

// The tile the target point w.tgt is on, and the tile creature e stands on, clamped to the map (feet can be
// just below it: the spawn drop).
function tgtTile(w) {
  const tx = Math.max(0, Math.min(w.cols - 1, Math.floor(w.tgt[0] / w.T))), ty = Math.max(0, Math.min(w.rows - 1, Math.floor(w.tgt[1] / w.T)));
  return ty * w.cols + tx;
}
function ownTile(w, e) {
  const tx = Math.max(0, Math.min(w.cols - 1, Math.floor(w.E.x[e] / w.T))), ty = Math.max(0, Math.min(w.rows - 1, Math.floor(w.E.y[e] / w.T)));
  return ty * w.cols + tx;
}
// Tiles between two tiles, the larger of the two axes.
function apart(w, a, b) {
  const cols = w.cols, ax = a % cols, bx = b % cols, dx = Math.abs(ax - bx), dy = Math.abs((a - ax) / cols - (b - bx) / cols);
  return dx > dy ? dx : dy;
}

// Following a path: false (and the path dropped) once the target has moved away from the tile the path was
// asked for; else the next turning point not yet reached goes in w.wp, true. A walked path returns false
// and leaves pathFresh set: asking again for the same goal means searching again.
function onPath(w, e) {
  const E = w.E, P = w.R.path, K = P.waypoints, T = w.T, cols = w.cols;
  if (apart(w, tgtTile(w), E.pathGoal[e]) > P.goalSlackTiles) { E.pathN[e] = 0; E.pathFresh[e] = 0; return false; }
  for (;;) {
    const p = w.pathPts[e * K + E.pathI[e]], px = (p % cols) * T + T / 2, py = Math.floor(p / cols) * T + T / 2;
    const ddx = px - E.x[e], ddy = py - E.y[e];
    if (ddx * ddx + ddy * ddy >= P.waypointReach * P.waypointReach) { w.wp[0] = px; w.wp[1] = py; return true; }
    if (++E.pathI[e] >= E.pathN[e]) { E.pathN[e] = 0; return false; }
  }
}

// The straight line was blocked this step: it slid along one axis, or (stuck) could not move at all. After
// blockedTicks steps of sliding, or at once when stuck, it asks for a path; stuck with no path to be had, it
// does what the prototype did: wanders off and thinks again soon.
function blocked(w, e, stuck) {
  const E = w.E, P = w.R.path;
  if (E.blockT[e] < 255) E.blockT[e]++;
  if (E.pathQd[e] || (!stuck && E.blockT[e] <= P.blockedTicks)) return;
  if (w.tick < E.pathAt[e]) { if (stuck) giveUp(w, e); return; }
  const goal = tgtTile(w), fresh = E.pathFresh[e] && apart(w, goal, E.pathGoal[e]) <= P.goalSlackTiles;
  // Stuck on a path it was given for this very goal, with nothing on the map changed since: the path runs
  // through something steering refuses (a campfire's fear zone, which paths do not know about), and searching
  // again would find it again, a search every step. Do what the prototype did instead. (If the map changed, a
  // wall painted across the path, it searches again.)
  if (stuck && fresh && E.pathTopo[e] === w.topo) { giveUp(w, e); return; }
  E.pathN[e] = 0; E.pathGoal[e] = goal;
  if (!fresh) {
    const k = cacheGet(w, pathClass(w, e), ownTile(w, e), goal);
    if (k >= 0) { fromCache(w, e, k); w.pathStat.hits++; return; }
  }
  // Into the queue; a full queue (2 × slots: never in practice) just means asking again next step.
  if (w.pqN < w.pq.length) { w.pq[w.pqN++] = w.slotH[e]; E.pathQd[e] = fresh ? 2 : 1; }
}

function fromCache(w, e, k) {
  const E = w.E, K = w.R.path.waypoints, P = w.paths, n = P.cN[k];
  for (let j = 0; j < n; j++) w.pathPts[e * K + j] = P.cPts[k * K + j];
  E.pathN[e] = n; E.pathI[e] = 0; E.pathFresh[e] = 1; E.blockT[e] = 0; E.pathTopo[e] = w.topo;
}

function giveUp(w, e) {
  const E = w.E;
  wander(w, e); E.think[e] = rnd(w, w.R.ai.stuckThink[0], w.R.ai.stuckThink[1]);
  E.pathAt[e] = w.tick + w.R.path.retryTicks; E.pathN[e] = 0; E.pathFresh[e] = 0; E.blockT[e] = 0;
}

// The start of a step: the queue is served first come first served, at most perTick searches (bible 01 §7:
// 40 a step world-wide); a cache hit costs no search. Whoever is left waits for the next step.
export function servePaths(w) {
  const E = w.E, P = w.R.path, K = P.waypoints, S = w.pathStat;
  let used = 0, k = 0;
  if (w.pqN > S.waitMax) S.waitMax = w.pqN;
  for (; k < w.pqN; k++) {
    const e = ent(w, w.pq[k]);
    if (e < 0 || E.dead[e] || !E.pathQd[e]) continue; // gone, or no longer waiting
    const start = ownTile(w, e), goal = E.pathGoal[e], cls = pathClass(w, e);
    if (E.pathQd[e] === 1) { const c = cacheGet(w, cls, start, goal); if (c >= 0) { E.pathQd[e] = 0; fromCache(w, e, c); S.hits++; continue; } }
    if (used === P.perTick) { S.capped++; break; }
    used++;
    E.pathQd[e] = 0;
    const n = search(w, cls, start, goal, w.pathPts, e * K, K);
    if (!n) { S.fails++; giveUp(w, e); continue; }
    E.pathN[e] = n; E.pathI[e] = 0; E.pathFresh[e] = 1; E.blockT[e] = 0; E.pathTopo[e] = w.topo;
    cachePut(w, cls, start, goal, w.pathPts, e * K, n);
  }
  if (k) { w.pq.copyWithin(0, k, w.pqN); w.pqN -= k; }
  S.tick = used; S.total += used;
  if (used > S.maxTick) S.maxTick = used;
}

// Crowds (01 §7): after its step a creature moves sepPush px/s away from others closer than sepRadius, so a
// crowd heading for one gap does not stack into one point (on one step in sepEvery, see crowded()). Not away from its own target (a mate, a
// victim), not between fliers and walkers, and never onto a tile it cannot stand on. Every creature is
// size 8 today; when 16 px creatures arrive, "same size" joins these rules.
const SEP_MAX = 16; // not content: a bound on work, not a rule a player sees
function separate(w, e) {
  const E = w.E, P = w.R.path, r = P.sepRadius, x = E.x[e], y = E.y[e], head = w.cellHead, next = w.cnext;
  const cx0 = Math.max(0, Math.floor((x - r) / CELL)), cx1 = Math.min(w.gw - 1, Math.floor((x + r) / CELL));
  const cy0 = Math.max(0, Math.floor((y - r) / CELL)), cy1 = Math.min(w.gh - 1, Math.floor((y + r) / CELL));
  // At most SEP_MAX overlapping neighbours count: in a pile of hundreds on one spot the push points the same way
  // long before that, and counting them all made every step of the pile quadratic.
  // The push sums live in a scratch Float64Array: as loop-carried locals they were boxed on every neighbour.
  const acc = w.sepAcc, gk = E.goalKind[e], slotH = w.slotH;
  acc[0] = 0; acc[1] = 0;
  // Its own target, as a handle: a neighbour is it when its slot's handle matches (what ent() would say, no call).
  const tgt = gk === G_ATTACK || gk === G_ABDUCT || gk === G_MATE ? E.goalA[e] : -1;
  let fl = -1, seen = 0;
  for (let cy = cy0; cy <= cy1 && seen < SEP_MAX; cy++) for (let cx = cx0; cx <= cx1 && seen < SEP_MAX; cx++) {
    for (let o = head[cy * w.gw + cx]; o >= 0 && seen < SEP_MAX; o = next[o]) {
      if (o === e || E.dead[o] || E.inside[o]) continue;
      const ox = x - E.x[o], oy = y - E.y[o], d2 = ox * ox + oy * oy;
      if (d2 >= r * r) continue;
      if (slotH[o] === tgt) continue;
      if (fl < 0) fl = flies(w, e) ? 1 : 0;
      if ((flies(w, o) ? 1 : 0) !== fl) continue; // a flock overhead neither pushes nor uses up the count
      seen++;
      if (d2 === 0) { acc[0] += E.id[e] < E.id[o] ? -1 : 1; continue; } // on the very same point: split by age
      const d = Math.sqrt(d2);
      acc[0] += ox / d; acc[1] += oy / d;
    }
  }
  const sx = acc[0], sy = acc[1];
  if (sx === 0 && sy === 0) return;
  const m = Math.sqrt(sx * sx + sy * sy), v = P.sepPush * P.sepEvery * w.dt, pp = w.pp, nx = x + (sx / m) * v, ny = y + (sy / m) * v;
  pp[0] = Math.max(1, Math.min(w.W - 1, nx)); pp[1] = Math.max(1, Math.min(w.H - 1, ny));
  if (passPt(w, e)) setPosPt(w, e);
}
