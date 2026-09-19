// The one-line status text: whichever came last, a sim event or a UI hint.
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
    // Pull the latest sim log line if one arrived since we last looked.
    sync(w) {
      if (w.logSeq !== simSeq) { simSeq = w.logSeq; if (w.lastLog) text = sentence(w.lastLog); }
    },
    get text() { return text; },
  };
}
