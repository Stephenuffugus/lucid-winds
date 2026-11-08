// The one-line status text: whichever came last, a sim line or a UI hint.
// Design 14 §4: the world's own news reaches this line only through the Because arbiter (ui/because.js), which lets
// one cue through at a time, so the line never races past a child reading it. An answer to something the player just
// did always shows: sim.js marks the lines written while a command ran (w.answered).
// THE LAW OF THE NEWS LINE (card polish 2, 3 Oct 2026): a sentence with a blank left open never reaches it, by any of the three
// ways a line comes (the world's news, an answer to her finger, a hint). "{B} went to the place it likes best." did, three times
// in her first half hour with a sheep and a hen she named (seed 11; twice on seed 5): a dusk row about the one she named has no B
// (reactions.js reactClock: a clock row happens to nobody in particular), and nothing between the log and the line looked. The
// Because arbiter now says such a sentence as its card says it (because.js); whatever still has a blank open is not shown.
// ASKED OF THE TEMPLATE (card polish 3, 3 Oct 2026; card polish 2's check, note N7): each way in hands over the sentence AND the keys
// its template left open (text.js said, filled), never only the finished text: a name she types may hold braces, and "The sheep is
// called {Pip} now." is a whole sentence. The law refuses a sentence whose template left a key open, by every way a line comes.
import { said, filled } from './text.js';

// What a way in hands over, as { t, open }: a said() or filled() sentence as it is; a plain string is a template with no values (a
// hint's own words, or a check's), so any key in it is open.
const asSaid = (s) => (s && typeof s === 'object' ? s : filled(String(s)));

// AT HER COMMAND (H2, 5 Oct 2026; the lead: the dog's new sentence had never been seen on screen). The HUD pulled the answer four
// times a second, and between her finger and the pull the world went on: a world line logged in a step after her command made the
// answer no answer (logSeq past answered), and the Because system telling a cue's news marked every line seen. She put a goblin down
// beside a dog in her first world, played as the page plays it (dev/h2-answers.mjs, seeds 7 and 11, a minute to twelve in): "The
// dog barked so loudly that a goblin froze." never reached her news line at all on 5 of 17 tries. main.js now pulls the answer the
// moment her command is done (withSound); and the record her finger was just answered with, cue or not, gives that answer its
// pictures (because.js, news.js answerPics) and is never told a second time, crawling.
export function createStatus(getWorld, news = null) {
  let text, simSeq = 0, answered = null; // answered: the log line last shown as an answer (a record's `say` is that very line)
  const say = (s, pics, answer) => {
    if (s.open.length) return false; // (the law of the news line: never a blank left open, asked of the template and its values)
    text = s.t;
    if (news && s.t) news.add(s.t, pics, answer);
    return true;
  };
  return {
    // UI hints: a hint's template (strings.json, str()) and the values it is filled with, if any. undefined is allowed and shows
    // the default line, as in the prototype.
    post(t, vals) {
      const w = getWorld();
      if (w) simSeq = w.logSeq; // anything the sim said before this hint is older than it
      if (t === undefined) { text = undefined; return; }
      say(vals ? filled(t, vals) : asSaid(t), null, true); // a hint is an answer to something the player just did: it never crawls (15 A3)
    },
    // Pull the latest sim line if one arrived since we last looked, and it answers what the player did.
    sync(w) {
      if (w.logSeq === simSeq) return;
      const answer = w.logSeq <= w.answered;
      simSeq = w.logSeq;
      if (answer && w.lastLog && say(said(w.lastLog), null, true)) answered = w.lastLog;
    },
    // The world's news, chosen by the Because arbiter: the sentence of the record the sparkle stands for, as said() says it (or a
    // card's words, which hold no blank: cards.js cardOf). `raw`: the record's own log line; when it is the answer she already has,
    // its pictures join that answer and nothing crawls.
    news(s, pics, raw = null) {
      const w = getWorld();
      if (w) simSeq = w.logSeq;
      if (raw && raw === answered) { if (news && news.answerPics) news.answerPics(asSaid(s).t, pics); return; }
      say(asSaid(s), pics, false); // the world's own news: this is what crawls
    },
    // Whether a log line is the one her finger was just answered with (ui/because.js: its record's pictures join that answer).
    answers(raw) { return !!raw && raw === answered; },
    // Whether her answer's moment holds the line now (his calls of 5 Oct 2026: a new thing waits for it, ui/because.js pickTold).
    answering() { return !!(news && news.answering); },
    // Whether a line told now comes straight onto her news line (news.js room; no news line: always).
    room() { return !news || news.room === undefined || !!news.room; },
    // New things wait their turn: the crawl hurries (news.js), or stops hurrying.
    hurry(on) { if (news && 'hurry' in news) news.hurry = on; },
    get text() { return text; },
  };
}
