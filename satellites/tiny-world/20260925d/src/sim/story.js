// Story records (design 14 §4, "one event record, four uses"): every notable thing the sim does writes one small record,
// { kind, place, actors (up to 3), causeA, causeB, result }, the causes and the result as icons (C.icons, compiled from
// the content and story.json). The game turns them into a spark with its Because card, a cause icon over a head, the
// status line's sentence, and (T11, T12) a creature's last five and the Scrapbook.
// Output only, like the events ring (events.js): nothing in the sim reads it back, it is neither hashed nor saved, and a step
// allocates nothing for it (typed arrays of a fixed size; when the ring is full, later records of that step are dropped).
// The game drains it after every step; the tools never read it, so for them it simply stays full.
// A record's sentence is the log line (world.js log) written for the same happening, kept by reference (say), so the
// status line and the spark say the same thing; records with no sentence (a cause icon) carry null.
export const ST = ['birth', 'death', 'zombie', 'abducted', 'rescued', 'returned', 'landed', 'fled', 'hungry', 'shelter', 'love', 'reaction', 'fed', 'play', 'warn', 'land']; // (design 19 A2 appended `land`: the ground changed by itself)
export const STI = Object.fromEntries(ST.map((k, i) => [k, i]));
export const NO = -1; // no icon, no actor kind
const CAP = 128;

export function createStory(w) {
  w.st = {
    n: 0, kind: new Uint8Array(CAP), x: new Float64Array(CAP), y: new Float64Array(CAP),
    h: new Float64Array(CAP * 3), k: new Int16Array(CAP * 3), // actors: handle (0: none) and kind index (NO: none)
    ca: new Int16Array(CAP), cb: new Int16Array(CAP), res: new Int16Array(CAP), // icons
    row: new Int16Array(CAP), // the reaction row this record is about (14 §5), or -1
    say: new Array(CAP).fill(null),
  };
}

// A record at (x, y). a, b, c: actor slots (-1: none); ca, cb, res: icon indexes (NO: none); say: its log line or null.
export function story(w, kind, x, y, a, b, c, ca, cb, res, say) {
  const s = w.st;
  if (s.n === CAP) return;
  const i = s.n++, E = w.E, kid = w.C.kid;
  s.kind[i] = kind; s.x[i] = x; s.y[i] = y;
  s.h[i * 3] = a >= 0 ? w.slotH[a] : 0; s.k[i * 3] = a >= 0 ? kid[E.kind[a]] : NO;
  s.h[i * 3 + 1] = b >= 0 ? w.slotH[b] : 0; s.k[i * 3 + 1] = b >= 0 ? kid[E.kind[b]] : NO;
  s.h[i * 3 + 2] = c >= 0 ? w.slotH[c] : 0; s.k[i * 3 + 2] = c >= 0 ? kid[E.kind[c]] : NO;
  s.ca[i] = ca; s.cb[i] = cb; s.res[i] = res;
  s.row[i] = -1;
  s.say[i] = say;
}
// A reaction that fired (design 14 §5, and the Scrapbook's stickers, §7 T12): the same record as any other, with
// the row it was, so the game can tell a pond shock from a parade without reading the sim.
export function storyRow(w, rowIndex, x, y, a, b, ca, cb, res, say) {
  story(w, STI.reaction, x, y, a, b, -1, ca, cb, res, say);
  const s = w.st;
  if (s.n) s.row[s.n - 1] = rowIndex;
}

// A creature's own record, at its feet (a cause icon, a landing): it is the first actor.
export const storyOf = (w, kind, e, ca, cb, res, say) => story(w, kind, w.E.x[e], w.E.y[e], e, -1, -1, ca, cb, res, say);
// The icon of a creature's kind (creature icons come first in C.icons, in C.kinds order).
export const kindIcon = (w, e) => w.C.kid[w.E.kind[e]];

// The game drains the ring after every step (and the fixtures do the same): one plain object per record, which is
// rare enough to allocate for (a birth, a death, a creature changing its mind), unlike the step itself.
// actors: [{ h, k }] for each actor the record has, h its handle (stale ones stay: the Because card wants the kind
// even after the creature is gone), k its kind's icon.
export function drainStory(w, fn) {
  const s = w.st;
  for (let i = 0; i < s.n; i++) fn(readStory(w, i));
  s.n = 0;
}
export function readStory(w, i) {
  const s = w.st, actors = [];
  for (let a = 0; a < 3; a++) if (s.h[i * 3 + a]) actors.push({ h: s.h[i * 3 + a], k: s.k[i * 3 + a] });
  return { kind: ST[s.kind[i]], place: [s.x[i], s.y[i]], actors, causeA: s.ca[i], causeB: s.cb[i], result: s.res[i], row: s.row[i], say: s.say[i] };
}
