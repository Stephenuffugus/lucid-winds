// Events: a ring the sim writes when something happens that a player could hear (and, from T8, read in a Because
// card, design 14 §4). Output only: nothing in the sim reads it back, it is neither hashed nor saved, and a step allocates
// nothing for it (typed arrays of a fixed size; when the ring is full, later events of that step are dropped). The game
// drains it after every step (src/audio); the tools never read it, so for them it simply stays full.
// a: the creature kind's index (C.kinds) for a creature's event, or a number the event carries (a blast's radius).
export const EV = ['hit', 'block', 'shot', 'death', 'birth', 'eat', 'beam', 'chute', 'land', 'perch', 'bounce', 'bolt', 'boom', 'quake', 'freeze', 'heal', 'bless', 'magic', 'rain', 'feast', 'time', 'huh', 'warn'];
export const EVI = Object.fromEntries(EV.map((k, i) => [k, i]));
// The event a power's use makes (its sound); x < 0: an instant power, heard everywhere.
export const POWER_EV = { bolt: 'bolt', fireball: 'boom', meteor: 'boom', twister: 'magic', freeze: 'freeze', heal: 'heal', bless: 'bless', clone: 'magic', love: 'magic', rain: 'rain', feast: 'feast', time: 'time', quake: 'quake', smite: 'bolt' };
const CAP = 256;

export function createEvents(w) {
  w.ev = { n: 0, kind: new Uint8Array(CAP), x: new Float64Array(CAP), y: new Float64Array(CAP), a: new Float64Array(CAP) };
}
export function emit(w, k, x, y, a) {
  const v = w.ev;
  if (v.n === CAP) return;
  const i = v.n++;
  v.kind[i] = k; v.x[i] = x; v.y[i] = y; v.a[i] = a;
}
// For a creature: the event at its feet, with its kind.
export function emitAt(w, k, e) { emit(w, k, w.E.x[e], w.E.y[e], w.C.kid[w.E.kind[e]]); }
