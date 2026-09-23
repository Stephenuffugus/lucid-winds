// Autosave (design 14 §7 T1). The open world is written every rules.save.everyTicks steps, or everySec seconds of
// real time after a change that is not yet saved (so painting while paused is kept too), and at once when the
// page is hidden. One write at a time; a save asked for during a write runs after it. A broken world (a sim
// error, main.js) is never written: the last good copy stays.
// hashCopies (?debug): each copy also keeps the world's hash, written in the same transaction, so a test can prove a loaded
// world is exactly the one written (dev/save-kill.mjs), whatever happened to the page that wrote it.
export function createSaver({ rules, getStore, getSim, getBroken, getView, onSaved, onFailed, onSnap, hashCopies = false }) {
  const S = rules.save;
  let id = null, createdAt = 0, seq = 0, lastTick = -1, lastEdits = -1, dirtyAt = 0, busy = null, again = false;
  const changed = (sim) => sim.w.tick !== lastTick || sim.edits !== lastEdits;

  function save() {
    const store = getStore(), sim = getSim();
    if (!store || !id || !sim || getBroken()) return Promise.resolve(false);
    if (busy) { again = true; return busy; }
    const w = sim.w, rec = sim.save(), tick = w.tick, edits = sim.edits, at = Date.now();
    if (onSnap) onSnap(sim, seq + 1); // tools: the state this copy holds (dev/save-kill.mjs)
    const row = { id, createdAt, savedAt: at, cols: w.cols, rows: w.rows, tick, day: Math.floor(w.time / w.daySec) + 1, count: w.count, thumb: thumbOf(w), seq: seq + 1 };
    const copy = { id, seq: seq + 1, at, view: getView(), rec };
    if (hashCopies) copy.hash = sim.hash();
    const mine = id;
    busy = store.put(row, copy).then(
      () => { if (id === mine) { seq = row.seq; lastTick = tick; lastEdits = edits; dirtyAt = 0; } onSaved(row); return true; },
      (e) => { onFailed(e); return false; },
    ).finally(() => { busy = null; if (again) { again = false; save(); } });
    return busy;
  }
  return {
    // A world became the open one: `seq` is its newest copy's (0 for a new world).
    attach(worldId, info) {
      id = worldId; createdAt = info.createdAt; seq = info.seq; dirtyAt = 0; again = false;
      const sim = getSim(); lastTick = sim.w.tick; lastEdits = sim.edits;
    },
    get id() { return id; },
    // The open world was swapped for another state of itself (a Clear, a return to the Snapshot, an Undo of those): save it soon.
    touch() { lastEdits = -1; },
    get seq() { return seq; },
    save,
    // Every frame.
    frame(now) {
      const sim = getSim();
      if (!id || !sim || getBroken() || !changed(sim)) return;
      if (!dirtyAt) dirtyAt = now;
      if (sim.w.tick - lastTick >= S.everyTicks || now - dirtyAt >= S.everySec * 1000) save();
    },
    // The page is being hidden (switched away, locked, closed): write now if anything changed.
    hide() { const sim = getSim(); if (sim && id && changed(sim)) save(); },
  };
}

// A small picture of a world for the list of worlds: one pixel per tile (at most 64 across), things dark, creatures
// light. A PNG data URL, or null where there is no canvas.
export function thumbOf(w) {
  if (typeof document === 'undefined') return null;
  const step = Math.max(1, Math.ceil(Math.max(w.cols, w.rows) / 64)), tw = Math.ceil(w.cols / step), th = Math.ceil(w.rows / step);
  const cv = document.createElement('canvas');
  cv.width = tw; cv.height = th;
  const g = cv.getContext('2d');
  if (!g) return null;
  const img = g.createImageData(tw, th), d = img.data, cols = w.C.TERR.map((t) => hex(t.cols[0]));
  for (let y = 0; y < th; y++) for (let x = 0; x < tw; x++) {
    const i = y * step * w.cols + x * step, c = w.grid[i] ? [58, 42, 30] : cols[w.terr[i]], o = (y * tw + x) * 4;
    d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 255;
  }
  for (let k = 0; k < w.count; k++) {
    const e = w.order[k], x = Math.floor(w.E.x[e] / w.T / step), y = Math.floor(w.E.y[e] / w.T / step);
    if (x < 0 || y < 0 || x >= tw || y >= th) continue;
    const o = (y * tw + x) * 4;
    d[o] = 250; d[o + 1] = 244; d[o + 2] = 222;
  }
  g.putImageData(img, 0, 0);
  try { return cv.toDataURL('image/png'); } catch (e) { return null; }
}
const hex = (s) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
