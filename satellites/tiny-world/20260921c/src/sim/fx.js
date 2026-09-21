// Visual effects the sim emits: arrows, hearts, beams, bones, blocks, booms, bolts. They are sim state
// (they age with the step and the hash covers them), and the renderer draws them.
// Records are pooled: w.fx[0 .. w.fxN - 1] are the live ones in the order they were emitted, the records
// after them are spare. Every record has every field, so reusing one allocates nothing; the array only
// ever grows (a shrunk array can be trimmed by the engine and reallocated when it grows again).
// Fields: type, x, y, t (seconds left), x2, y2 (arrows: where it points), r (booms: radius), col (a colour,
// or null for the renderer's default).

// Emits an effect and returns its record so the caller can set x2, y2, r or col.
export function addFx(w, type, x, y, t) {
  const fx = w.fx;
  let f;
  if (w.fxN < fx.length) f = fx[w.fxN];
  else { f = { type: '', x: 0, y: 0, t: 0, x2: 0, y2: 0, r: 0, col: null }; fx.push(f); }
  w.fxN++;
  f.type = type; f.x = x; f.y = y; f.t = t; f.x2 = 0; f.y2 = 0; f.r = 0; f.col = null;
  return f;
}

// End of step: every effect ages by dt; the expired ones move behind the live ones, whose order is kept.
export function ageFx(w, dt) {
  const fx = w.fx, n0 = w.fxN;
  let n = 0;
  for (let k = 0; k < n0; k++) {
    const f = fx[k];
    f.t -= dt;
    if (f.t > 0) { if (k !== n) { fx[k] = fx[n]; fx[n] = f; } n++; }
  }
  w.fxN = n;
}

// An effect as the prototype's object literal had it (only the fields its kind carried). For the hash and
// the tools; it allocates, so the tick never calls it.
export function fxShape(f) {
  const o = { type: f.type, x: f.x, y: f.y, t: f.t };
  if (f.type === 'arrow') { o.x2 = f.x2; o.y2 = f.y2; }
  if (f.type === 'boom') o.r = f.r;
  if (f.col !== null) o.col = f.col;
  return o;
}
