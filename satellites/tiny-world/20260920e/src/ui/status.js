// The one-line status text: whichever came last, a sim line or a UI hint.
// Design 14 §4: the world's own news reaches this line only through the Because arbiter (ui/because.js), which lets
// one cue through at a time, so the line never races past a child reading it. An answer to something the player just
// did always shows: sim.js marks the lines written while a command ran (w.answered).
import { sentence } from './text.js';

export function createStatus(getWorld) {
  let text, simSeq = 0;
  return {
    // UI hints. undefined is allowed and shows the default line, as in the prototype.
    post(t) {
      const w = getWorld();
      if (w) simSeq = w.logSeq; // anything the sim said before this hint is older than it
      text = t;
    },
    // Pull the latest sim line if one arrived since we last looked, and it answers what the player did.
    sync(w) {
      if (w.logSeq === simSeq) return;
      const answer = w.logSeq <= w.answered;
      simSeq = w.logSeq;
      if (answer && w.lastLog) text = sentence(w.lastLog);
    },
    // The world's news, chosen by the Because arbiter: the sentence of the record the sparkle stands for.
    news(t) {
      const w = getWorld();
      if (w) simSeq = w.logSeq;
      text = t;
    },
    get text() { return text; },
  };
}
