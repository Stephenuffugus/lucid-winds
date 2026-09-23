// She is welcomed back (design 18 A16). One second after a saved world opens, the nearest creature the CHILD
// has named — awake, out of doors, near the middle of the screen — shows one heart and makes the sound a poke
// makes, so the first thing a world says when it comes back is hello.
//
// It is the VIEW's doing and not the world's. Nothing here touches the sim: no command, no effect record, no
// field, so the hash does not move, a save does not change, and opening a world still raises nothing a running
// world would not (design 14 §1 rule 6, which is why this is in src/ui and takes the world read-only).
// DOM free, so a fixture can ask it who it would greet.

// The handle of whoever to greet, or 0 for nobody. Ties go to the one born first, so two creatures at exactly
// the same distance are not a coin toss between one run and the next.
export function whoToGreet(w, x, y, r) {
  const E = w.E;
  let best = -1, bd = r * r;
  for (let k = 0; k < w.count; k++) {
    const e = w.order[k];
    if (!E.named[e] || E.dead[e] || E.inside[e]) continue; // somebody she named, here, not in a house or her hand
    if (E.sleepT[e] !== 0 && !(E.errT[e] > 0)) continue; // asleep: it is not woken to say hello (design 18 A5)
    const dx = E.x[e] - x, dy = E.y[e] - y, d = dx * dx + dy * dy;
    if (d < bd || (d === bd && best >= 0 && E.id[e] < E.id[best])) { bd = d; best = e; }
  }
  return best >= 0 ? w.slotH[best] : 0;
}
