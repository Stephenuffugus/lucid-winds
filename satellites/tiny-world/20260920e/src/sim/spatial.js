// The spatial hash (01 §5, HANDOFF §5): the world cut into CELL-pixel squares, each with a list of the
// creatures standing in it. setPos() is the only writer of a creature's position, and moves it between
// cells at once, so a scan made later in the same step sees where everyone is now (PLAN fact F3), as the
// prototype's scans over live objects did. Lists are linked through per-slot typed arrays: moving a
// creature between cells allocates nothing.
//
// A cell's list is in no particular order; scans that need spawn order (ties, random draws) restore it
// from the creatures' serial ids.

export const CELL = 16; // px; the bible's cell size (not content: nothing a player tunes)

export function createGrid(w) {
  w.gw = Math.ceil(w.W / CELL);
  w.gh = Math.ceil(w.H / CELL);
  w.cellHead = new Int32Array(w.gw * w.gh).fill(-1); // first creature in each cell, or -1
  w.near = new Int32Array(8); // gather()'s answer; doubles when a crowd needs it (a few times per world)
}

// The cell a point falls in. Points past the map's edge (a creature dropped just below the last row) count
// as the edge cell; they are farther from anything inside than that cell's own area, so a scan that
// visits cells by distance still finds them in time.
export function cellAt(w, x, y) {
  let cx = Math.floor(x / CELL), cy = Math.floor(y / CELL);
  if (cx < 0) cx = 0; else if (cx >= w.gw) cx = w.gw - 1;
  if (cy < 0) cy = 0; else if (cy >= w.gh) cy = w.gh - 1;
  return cy * w.gw + cx;
}

function link(w, i, c) {
  const head = w.cellHead[c];
  w.cellOf[i] = c; w.cprev[i] = -1; w.cnext[i] = head;
  if (head >= 0) w.cprev[head] = i;
  w.cellHead[c] = i;
}

export function unlink(w, i) {
  const c = w.cellOf[i];
  if (c < 0) return;
  const p = w.cprev[i], n = w.cnext[i];
  if (p >= 0) w.cnext[p] = n; else w.cellHead[c] = n;
  if (n >= 0) w.cprev[n] = p;
  w.cellOf[i] = -1;
}

// The one way to move a creature (a new creature too: its cell starts at -1).
export function setPos(w, i, x, y) {
  w.E.x[i] = x; w.E.y[i] = y;
  const c = cellAt(w, x, y);
  if (c !== w.cellOf[i]) { unlink(w, i); link(w, i, c); }
}

// setPos() to the point in w.pp: for hot callers, so the coordinates are not passed as arguments (a number
// passed to a function that is not inlined gets boxed).
export function setPosPt(w, i) {
  const x = w.pp[0], y = w.pp[1];
  w.E.x[i] = x; w.E.y[i] = y;
  // cellAt(), written out: its Math.floor results were boxed on the way in when it was not inlined.
  const c = Math.max(0, Math.min(w.gh - 1, Math.floor(y / CELL))) * w.gw + Math.max(0, Math.min(w.gw - 1, Math.floor(x / CELL)));
  if (c !== w.cellOf[i]) { unlink(w, i); link(w, i, c); }
}

// The creatures within the square of cells around (x, y) that could hold one within r, in spawn order
// (sorted by serial id), into w.near[0 .. n-1]; returns n. For loops that act on everyone within reach and
// must act in the prototype's order (the tornado draws random numbers per creature). Callers still test the
// exact distance. The sort is a heap sort in place (ids are unique, so it need not be stable): the cell lists
// come newest first, the worst case for the insertion sort this replaced (a tornado in a crowd froze).
export function gather(w, x, y, r) {
  const n = gatherAny(w, x, y, r), a = w.near, id = w.E.id;
  for (let i = (n >> 1) - 1; i >= 0; i--) sift(a, id, i, n);
  for (let end = n - 1; end > 0; end--) { const t = a[0]; a[0] = a[end]; a[end] = t; sift(a, id, 0, end); }
  return n;
}
function sift(a, id, i, n) {
  for (;;) {
    const l = 2 * i + 1, r = l + 1;
    let m = i;
    if (l < n && id[a[l]] > id[a[m]]) m = l;
    if (r < n && id[a[r]] > id[a[m]]) m = r;
    if (m === i) return;
    const t = a[i]; a[i] = a[m]; a[m] = t; i = m;
  }
}
// The same creatures in no particular order (for loops whose result does not depend on the order).
export function gatherAny(w, x, y, r) {
  const head = w.cellHead, next = w.cnext;
  const cx0 = Math.max(0, Math.floor((x - r) / CELL)), cx1 = Math.min(w.gw - 1, Math.floor((x + r) / CELL));
  const cy0 = Math.max(0, Math.floor((y - r) / CELL)), cy1 = Math.min(w.gh - 1, Math.floor((y + r) / CELL));
  let n = 0;
  for (let cy = cy0; cy <= cy1; cy++) for (let cx = cx0; cx <= cx1; cx++) {
    for (let o = head[cy * w.gw + cx]; o >= 0; o = next[o]) {
      if (n === w.near.length) { const b = new Int32Array(w.near.length * 2); b.set(w.near); w.near = b; } // rare: grows once
      w.near[n++] = o;
    }
  }
  return n;
}
