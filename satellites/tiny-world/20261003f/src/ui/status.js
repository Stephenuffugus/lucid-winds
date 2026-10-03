// The one-line status text: whichever came last, a sim line or a UI hint.
// Design 14 §4: the world's own news reaches this line only through the Because arbiter (ui/because.js), which lets
// one cue through at a time, so the line never races past a child reading it. An answer to something the player just
// did always shows: sim.js marks the lines written while a command ran (w.answered).
// THE LAW OF THE NEWS LINE (card polish 2, 3 Oct 2026): a sentence with a blank left open never reaches it, by any of the three
// ways a line comes (the world's news, an answer to her finger, a hint). "{B} went to the place it likes best." did, three times
// in her first half hour with a sheep and a hen she named (seed 11; twice on seed 5): a dusk row about the one she named has no B
// (reactions.js reactClock: a clock row happens to nobody in particular), and nothing between the log and the line looked. The
// Because arbiter now says such a sentence as its card says it (because.js); whatever still has a blank open is not shown.
import { sentence, openBlank } from './text.js';

export function createStatus(getWorld, news = null) {
  let text, simSeq = 0;
  const say = (t, pics, answer) => {
    if (openBlank(t)) return; // (the law of the news line: never a blank left open)
    text = t;
    if (news && t) news.add(t, pics, answer);
  };
  return {
    // UI hints. undefined is allowed and shows the default line, as in the prototype.
    post(t) {
      const w = getWorld();
      if (w) simSeq = w.logSeq; // anything the sim said before this hint is older than it
      say(t, null, true); // a hint is an answer to something the player just did: it never crawls (15 A3)
    },
    // Pull the latest sim line if one arrived since we last looked, and it answers what the player did.
    sync(w) {
      if (w.logSeq === simSeq) return;
      const answer = w.logSeq <= w.answered;
      simSeq = w.logSeq;
      if (answer && w.lastLog) say(sentence(w.lastLog), null, true);
    },
    // The world's news, chosen by the Because arbiter: the sentence of the record the sparkle stands for.
    news(t, pics) {
      const w = getWorld();
      if (w) simSeq = w.logSeq;
      say(t, pics, false); // the world's own news: this is what crawls
    },
    get text() { return text; },
  };
}
