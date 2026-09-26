// Pathfinding (bible 01 §7): A* on the tile grid, 8-way, for one path class at a time, with a hard cap on
// expanded nodes and a cache by (class, start chunk, goal chunk). Every array is allocated when the world
// is made, so a search allocates nothing. Costs are integers (10 straight, 14 diagonal) and the heuristic
// is the octile distance in the same units, so a search is exact and the same on every engine.
//
// A path is its turning points: tiles where the direction changes, and the last tile. Between two turning
// points the path is a straight run of tiles (straight or diagonal), so a creature can walk the leg in a
// straight line. A diagonal move needs both tiles beside it open (no cutting a wall's corner).
import { swims } from './world.js';

// Path classes: which tiles a creature can walk on. The bits are the passPt() rules that depend on the
// creature; campfire fear is left to steering (a fire is one tile, and it moves nothing).
export const PC_LAND = 0, PC_AMPH = 1, PC_SEA = 2, PC_LAVA = 4, PC_HOME = 8, PC_TINY = 16; // PC_TINY (15 C1): small enough for the shallows
const DX = [1, 0, -1, 0, 1, -1, -1, 1], DY = [0, 1, 0, -1, 1, 1, -1, -1]; // 4 straight, then 4 diagonal

export function createPaths(w) {
  const P = w.R.path, n = w.nTiles, cap = P.maxExpand;
  w.paths = {
    stamp: 0, // this search's number: a tile's g and parent are this search's when seen[i] === stamp
    seen: new Int32Array(n), shut: new Int32Array(n), g: new Int32Array(n), parent: new Int32Array(n),
    // The open list: a binary heap with lazy deletion (a tile may be in it more than once; the stale
    // copies are skipped when popped). A search pushes at most 8 per expanded node plus the start.
    hTile: new Int32Array(8 * cap + 16), hF: new Int32Array(8 * cap + 16), hG: new Int32Array(8 * cap + 16), hN: 0,
    run: new Int32Array(cap + 2), // the path's tiles, goal first, while turning it into turning points
    partial: false, // the last search stopped short of its goal (capped, or the goal cannot be reached)
    expanded: 0, // nodes the last search expanded
    // The cache: CACHE entries, direct-mapped by key. Per entry: key, tick made, w.topo then, point count,
    // then up to `waypoints` tiles.
    cKey: new Int32Array(CACHE).fill(-1), cTick: new Int32Array(CACHE), cTopo: new Int32Array(CACHE),
    cN: new Int32Array(CACHE), cPts: new Int32Array(CACHE * P.waypoints),
  };
}
const CACHE = 256;

export function pathClass(w, e) {
  const kind = w.E.kind[e], sp = w.C.S[kind];
  if (sp.water) return PC_SEA | (w.R.flags.shallows && sp.size === 'tiny' ? PC_TINY : 0); // design 15 C1: only the tiny wade in
  return (swims(w, e) ? PC_AMPH : PC_LAND) | (sp.lavaProof ? PC_LAVA : 0) | (kind === 'human' ? PC_HOME : 0);
}

// Can a creature of class `cls` stand on tile i? passPt() for a tile, minus campfire fear.
export function tilePass(w, cls, i) {
  const t = w.terr[i], tid = w.C.tid;
  const tt = w.C.TERR[t];
  if (cls & PC_SEA) return tt.deep === 1 || (!!(cls & PC_TINY) && tt.shallow === 1); // PC_TINY is only set while flags.shallows is on
  const s = w.grid[i];
  if (!(s && s.def.bridge)) {
    if (t === tid.rock) return false;
    if (t === tid.lava && !(cls & PC_LAVA)) return false;
    if (tt.deep === 1 && !(cls & PC_AMPH)) return false;
  }
  if (s) {
    if (s.def.block) return false;
    if (s.def.home && !(cls & PC_HOME)) return false;
  }
  return true;
}

// Octile distance between two tiles, in tenths of a tile.
function oct(w, a, b) {
  const cols = w.cols, ax = a % cols, bx = b % cols;
  let dx = ax - bx, dy = (a - ax) / cols - (b - bx) / cols;
  if (dx < 0) dx = -dx;
  if (dy < 0) dy = -dy;
  return dx > dy ? 10 * dx + 4 * dy : 10 * dy + 4 * dx;
}

// The heap orders by f, then the larger g (nearer the goal), then the lower tile: fully deterministic.
function before(P, a, b) {
  const fa = P.hF[a], fb = P.hF[b];
  if (fa !== fb) return fa < fb;
  const ga = P.hG[a], gb = P.hG[b];
  if (ga !== gb) return ga > gb;
  return P.hTile[a] < P.hTile[b];
}
function swap(P, a, b) {
  let t = P.hTile[a]; P.hTile[a] = P.hTile[b]; P.hTile[b] = t;
  t = P.hF[a]; P.hF[a] = P.hF[b]; P.hF[b] = t;
  t = P.hG[a]; P.hG[a] = P.hG[b]; P.hG[b] = t;
}
function push(P, tile, g, f) {
  let k = P.hN++;
  P.hTile[k] = tile; P.hG[k] = g; P.hF[k] = f;
  while (k > 0) { const up = (k - 1) >> 1; if (!before(P, k, up)) break; swap(P, k, up); k = up; }
}
function pop(P) { // removes the top; its tile is read before calling
  const n = --P.hN;
  if (n === 0) return;
  P.hTile[0] = P.hTile[n]; P.hF[0] = P.hF[n]; P.hG[0] = P.hG[n];
  let k = 0;
  for (;;) {
    const l = 2 * k + 1, r = l + 1;
    let m = k;
    if (l < n && before(P, l, m)) m = l;
    if (r < n && before(P, r, m)) m = r;
    if (m === k) return;
    swap(P, k, m); k = m;
  }
}

// A* from tile `start` to tile `goal` for class `cls`. Writes the path's turning points (not the start
// tile) into out[at], out[at + 1], ..., at most `max` of them, and returns how many; 0 means no path. When
// the goal cannot be reached, or `maxExpand` nodes were expanded first, the path goes to the tile found
// nearest the goal (P.partial is set), or there is none if that is the start tile.
export function search(w, cls, start, goal, out, at, max) {
  const P = w.paths, cols = w.cols, rows = w.rows, cap = w.R.path.maxExpand;
  const seen = P.seen, shut = P.shut, g = P.g, parent = P.parent;
  if (++P.stamp === 0x7fffffff) { P.stamp = 1; seen.fill(0); shut.fill(0); }
  const id = P.stamp;
  P.hN = 0;
  seen[start] = id; g[start] = 0; parent[start] = -1;
  push(P, start, 0, oct(w, start, goal));
  let best = start, bestH = oct(w, start, goal), found = false, expanded = 0;
  while (P.hN > 0) {
    const cur = P.hTile[0], gc = P.hG[0];
    pop(P);
    if (shut[cur] === id || gc !== g[cur]) continue; // a stale copy
    shut[cur] = id;
    if (cur === goal) { found = true; break; }
    const hc = oct(w, cur, goal);
    if (hc < bestH || (hc === bestH && gc < g[best])) { best = cur; bestH = hc; }
    if (expanded === cap) break;
    expanded++;
    const cx = cur % cols, cy = (cur - cx) / cols;
    for (let d = 0; d < 8; d++) {
      const nx = cx + DX[d], ny = cy + DY[d];
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
      const ni = ny * cols + nx;
      if (shut[ni] === id || !tilePass(w, cls, ni)) continue;
      if (d >= 4 && !(tilePass(w, cls, cy * cols + nx) && tilePass(w, cls, ny * cols + cx))) continue; // a corner
      const ng = gc + (d >= 4 ? 14 : 10);
      if (seen[ni] === id && ng >= g[ni]) continue;
      seen[ni] = id; g[ni] = ng; parent[ni] = cur;
      push(P, ni, ng, ng + oct(w, ni, goal));
    }
  }
  P.expanded = expanded;
  P.partial = !found;
  const end = found ? goal : best;
  if (end === start) return 0;
  // The tiles from the end back to the start, then the turning points in walking order.
  const run = P.run;
  let n = 0;
  for (let t = end; t !== start; t = parent[t]) run[n++] = t;
  run[n] = start;
  let k = 0;
  for (let j = n - 1; j >= 0 && k < max; j--) {
    // run[j] is a turning point if it is the end, or the step into it differs from the step out of it.
    if (j > 0 && run[j] - run[j + 1] === run[j - 1] - run[j]) continue;
    out[at + k++] = run[j];
  }
  return k;
}

// The cache (01 §7): a path found for (class, start chunk, goal chunk) serves anyone asking the same within
// `cacheTicks`, unless terrain or things changed since (w.topo). Returns the entry, or -1.
function cacheKey(w, cls, start, goal) {
  const C = w.R.path.cacheChunk, cols = w.cols, cc = Math.ceil(cols / C);
  const sx = start % cols, gx = goal % cols;
  const sc = Math.floor((start - sx) / cols / C) * cc + Math.floor(sx / C), gc = Math.floor((goal - gx) / cols / C) * cc + Math.floor(gx / C);
  return (cls * 4096 + sc) * 4096 + gc;
}
const slotOf = (key) => Math.imul(key, 0x9e3779b1) >>> 24; // 0..255

export function cacheGet(w, cls, start, goal) {
  const P = w.paths, key = cacheKey(w, cls, start, goal), k = slotOf(key);
  return P.cKey[k] === key && P.cTopo[k] === w.topo && w.tick - P.cTick[k] < w.R.path.cacheTicks ? k : -1;
}

export function cachePut(w, cls, start, goal, src, at, n) {
  const P = w.paths, key = cacheKey(w, cls, start, goal), k = slotOf(key), K = w.R.path.waypoints;
  P.cKey[k] = key; P.cTick[k] = w.tick; P.cTopo[k] = w.topo; P.cN[k] = n;
  for (let j = 0; j < n; j++) P.cPts[k * K + j] = src[at + j];
}
