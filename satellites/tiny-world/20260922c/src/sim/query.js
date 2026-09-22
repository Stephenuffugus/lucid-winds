// "Nearest X" queries, over the spatial hash (spatial.js, M1-2). Answers are exactly the prototype's full
// scan (tools/lib/oracle.mjs, checked on every query by tools/nearest-fixture.mjs), ties included.
// Filters are named module-level functions f(w, e, o), never closures made per call, so a query allocates
// nothing. A filter must not draw from the random stream.
import { hyp } from './math.js';
import { inB } from './world.js';
import { CELL } from './spatial.js';

// The nearest creature (a slot, or -1) within r of creature e that passes f. Ties go to the earlier
// creature in spawn order (strict <), as in the prototype.
export function nearest(w, e, r, f) {
  w.qp[0] = w.E.x[e]; w.qp[1] = w.E.y[e];
  return nearestAt(w, e, r, f);
}

// Same, around the point in w.qp (a scratch pair, so no coordinate is boxed on the way in); `self` (a slot,
// or -1) is skipped and handed to the filter as e.
// Cells are visited in rings around the point's cell. Anything in ring k is at least (k - 1) cells away, so
// once that exceeds the best distance so far, no farther ring can hold a nearer creature or an equal one;
// the prototype's scan gave ties to the earlier creature in spawn order, here the lower serial id (the
// same thing: ids are handed out in spawn order).
export function nearestAt(w, self, r, f) {
  const E = w.E, id = E.id, head = w.cellHead, next = w.cnext, gw = w.gw, gh = w.gh, x = w.qp[0], y = w.qp[1];
  let cx = Math.floor(x / CELL), cy = Math.floor(y / CELL);
  if (cx < 0) cx = 0; else if (cx >= gw) cx = gw - 1;
  if (cy < 0) cy = 0; else if (cy >= gh) cy = gh - 1;
  const last = Math.max(cx, gw - 1 - cx, cy, gh - 1 - cy); // the ring that reaches the far corner
  // The best distance so far lives in a Float64Array: a variable that starts as the (integer) radius and
  // later holds fractions is kept boxed by the engine, one allocation per improvement.
  const B = w.qp;
  let best = -1;
  B[2] = r;
  for (let k = 0; k <= last && (k - 1) * CELL <= B[2]; k++) {
    const y0 = cy - k, y1 = cy + k, x0 = cx - k, x1 = cx + k;
    for (let yy = y0; yy <= y1; yy++) {
      if (yy < 0 || yy >= gh) continue;
      const step = yy === y0 || yy === y1 ? 1 : x1 - x0; // a ring's top and bottom rows whole, its middle rows' two ends
      for (let xx = x0; xx <= x1; xx += step) {
        if (xx < 0 || xx >= gw) continue;
        for (let o = head[yy * gw + xx]; o >= 0; o = next[o]) {
          if (o === self || E.dead[o] || E.inside[o] || E.perch[o] || !f(w, self, o)) continue;
          const dx = x - E.x[o], dy = y - E.y[o], d = Math.sqrt(dx * dx + dy * dy); // hyp(), written out: a call returns a boxed number
          if (d < B[2] || (d === B[2] && best >= 0 && id[o] < id[best])) { B[2] = d; best = o; }
        }
      }
    }
  }
  if (w.onScan !== null) w.onScan(self, r, f, best); // tools/nearest-fixture.mjs checks every answer; null in the game
  return best;
}

// The nearest human (f must accept only humans) within r of creature e: nearestAt's answer, found by a walk of
// the human list (ents.js) while it is short. The answer is the least (distance, id) under nearestAt's own
// rule, whatever order the candidates come in, so it is the same creature. Why: an ally or healer asks for a
// human every time it decides; in a crowd with few humans or none, the ring scan visits the whole crowd.
const HUMAN_LIST_MAX = 256; // a longer list: the ring scan (not content: nothing a player tunes)
export function nearestHuman(w, e, r, f) {
  if (w.nHumans > HUMAN_LIST_MAX) return nearest(w, e, r, f);
  const E = w.E, id = E.id, x = E.x[e], y = E.y[e], H = w.humans, B = w.qp;
  let best = -1;
  B[0] = x; B[1] = y; B[2] = r; // the point as nearest() leaves it, for the test hook

  for (let k = 0; k < w.nHumans; k++) {
    const o = H[k];
    if (o === e || E.dead[o] || E.inside[o] || E.perch[o]) continue;
    const dx = x - E.x[o], dy = y - E.y[o], d = Math.sqrt(dx * dx + dy * dy);
    if (!(d < B[2] || (d === B[2] && best >= 0 && id[o] < id[best]))) continue; // no better: skip the filter (reach() is dear)
    if (f(w, e, o)) { B[2] = d; best = o; }
  }
  if (w.onScan !== null) w.onScan(e, r, f, best); // tools/nearest-fixture.mjs checks every answer; null in the game
  return best;
}

export function findStruct(w, e, r, f) {
  const T = w.T, structs = w.structs, ex = w.E.x[e], ey = w.E.y[e];
  let best = null, bd = r;
  for (let k = 0; k < structs.length; k++) {
    const s = structs[k];
    if (!f(s)) continue;
    const dx = s.tx * T + 4 - ex, dy = s.ty * T + 4 - ey, d = Math.sqrt(dx * dx + dy * dy); // hyp()
    if (d < bd) { bd = d; best = s; }
  }
  return best;
}

// The grass tile to graze, as a tile index, or -1. Each candidate draws one random number (the prototype's
// jitter), so the draws happen whether or not a food thing is also found.
// cropsOnly: a creature that does not graze but will pick a ripe field (design 15 C1: people and the like).
export function findGrass(w, e, cropsOnly) {
  const T = w.T, cx = Math.floor(w.E.x[e] / T), cy = Math.floor(w.E.y[e] / T), n = w.R.graze.searchTiles;
  const near = w.R.graze.meadowPull; // design 15 C1: a meadow reads as nearer than it is, so livestock drift to it
  let best = -1, bd = 1e9;
  for (let y = cy - n; y <= cy + n; y++) for (let x = cx - n; x <= cx + n; x++) {
    if (!inB(w, x, y)) continue;
    const i = y * w.cols + x;
    const t = w.C.TERR[w.terr[i]];
    if (!t.graze || w.eaten[i] > 0) continue;
    if (cropsOnly && t.crop !== 1) continue;
    const s = w.grid[i];
    if (s && (s.def.block || s.def.home)) continue;
    const dx = x - cx, dy = y - cy;
    let d = Math.sqrt(dx * dx + dy * dy) + w.rng.float(); // hyp() + jitter
    if (t.flowers) d *= near;
    if (d < bd) { bd = d; best = i; }
  }
  return best;
}

// Tap picking: the nearest creature (a slot, or -1) not inside anything, measured to its body (4 px above
// the feet).
export function nearPoint(w, x, y, r) {
  const E = w.E;
  let b = -1, bd = r;
  for (let k = 0; k < w.count; k++) {
    const e = w.order[k];
    if (E.inside[e]) continue;
    const d = hyp(E.x[e] - x, E.y[e] - 4 - y);
    if (d < bd) { bd = d; b = e; }
  }
  return b;
}
