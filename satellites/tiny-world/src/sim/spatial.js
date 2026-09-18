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
  const c = cellAt(w, x, y);
  if (c !== w.cellOf[i]) { unlink(w, i); link(w, i, c); }
}

// The creatures within the square of cells around (x, y) that could hold one within r, in spawn order
// (sorted by serial id), into w.near[0 .. n-1]; returns n. For loops that act on everyone within reach and
// must act in the prototype's order (the tornado draws random numbers per creature; a healer's heart goes to
// the first human it heals). Callers still test the exact distance.
export function gather(w, x, y, r) {
  const E = w.E, id = E.id, head = w.cellHead, next = w.cnext;
  const cx0 = Math.max(0, Math.floor((x - r) / CELL)), cx1 = Math.min(w.gw - 1, Math.floor((x + r) / CELL));
  const cy0 = Math.max(0, Math.floor((y - r) / CELL)), cy1 = Math.min(w.gh - 1, Math.floor((y + r) / CELL));
  let n = 0;
  for (let cy = cy0; cy <= cy1; cy++) for (let cx = cx0; cx <= cx1; cx++) {
    for (let o = head[cy * w.gw + cx]; o >= 0; o = next[o]) {
      if (n === w.near.length) { const a = new Int32Array(w.near.length * 2); a.set(w.near); w.near = a; } // rare: grows once
      // insertion into id order
      let j = n++;
      while (j > 0 && id[w.near[j - 1]] > id[o]) { w.near[j] = w.near[j - 1]; j--; }
      w.near[j] = o;
    }
  }
  return n;
}
