// AURA OFF — the MC. Pure data, plus one deterministic picker so the same
// moment never says two different things in the same battle.
//
// THE VOICE
// ---------
// Argentine register (AURA-CULTURE §9): ironic, warm, deadpan, never mean.
// The country where the prize is literally "aura infinita" and the organiser
// calls himself "Gonzalo bien de vago" is the country whose tone the whole game
// speaks in. Somebody with a bluetooth speaker and no authority whatsoever,
// standing on a bench, who knows everyone's name.
//
// TWO HARD RULES
// --------------
// 1. THE MC NEVER MOCKS A COMPETITOR. Not the one losing, not the one who
//    whiffed, not the one who went out in round one. AURA-CULTURE §5.6 — this
//    is the exact line Costa Rica's education ministry drew, and it is the
//    right one. Every whiff line and every loss line in this file is written to
//    be said kindly out loud in front of a fourteen-year-old who just lost.
//    There is no line in here at anyone's expense.
//
// 2. THE SCORE CALLOUTS ARE NATIVE, NEVER INVENTED (CONTRACT §12).
//       +1000 AURA      the standard callout
//       +10.000         the big one
//       AURA 100%       a clean read
//       PERDIÓ AURA     a whiff
//       AURA INFINITA   a flawless win — the actual prize in Argentina
//    And no ballroom vocabulary anywhere. Not "tens across the board", not
//    "chop", not "realness", not "houses". Several outlets draw the comparison
//    themselves, so the parallel is theirs to draw — but ballroom is Black and
//    Latino LGBTQ+ culture with its own history and its own word, *noguing*,
//    for precisely this kind of uninformed borrowing. We studied the
//    architecture. We ship our own words.
//
// The MC also never explains a move. AURA-CULTURE §1.4: meaning is the one
// thing this culture refuses to supply, and the game does not supply it either.

/* -------------------------------------------------------------------------- */
/* THE CALLOUTS — the five native units, in one place                          */
/* -------------------------------------------------------------------------- */

/**
 * Canonical score language. `engine/scoring.js` builds the popup strings; this
 * is the vocabulary they are built from, so anything on screen can be checked
 * against one list.
 */
export const CALLOUTS = Object.freeze({
  standard: '+1000 AURA',
  big: '+10.000',
  clean: 'AURA 100%',
  whiff: 'PERDIÓ AURA',
  flawless: 'AURA INFINITA'
});

/* -------------------------------------------------------------------------- */
/* THE LINE BANK                                                               */
/* -------------------------------------------------------------------------- */

/**
 * One bucket per moment. `engine/battle.js` names the moment and hands back a
 * cue key on every exchange; this is where that key turns into words.
 * @type {Object<string, ReadonlyArray<string>>}
 */
export const MC_LINES = Object.freeze({

  /* ── the battle opens ─────────────────────────────────────────────────── */
  start: Object.freeze([
    'Two people, no words, no contact. Everybody else, one step back.',
    'Nine rounds. Reference everything, repeat nothing, and never look like you are trying.',
    'Nobody wrote the rules down. We are all just going to know.',
    'Right. Hands out of pockets. Here we go.',
    'The circle is closed, the phones are up, and neither of them is allowed to speak. Perfect.'
  ]),

  /* ── round one, per the engine's `open` cue ───────────────────────────── */
  open: Object.freeze([
    'Openers. Say who you are in about a second and a half.',
    'Round one. This is the handshake and it is already worth points.',
    'First thing out of the bag. The square is listening.',
    'Here we go. Whatever they open with, remember it — you cannot use it twice.'
  ]),

  /* ── ordinary beat, no cue fired ──────────────────────────────────────── */
  beat: Object.freeze([
    'Traded. Nobody has flinched.',
    'Even. Somebody is going to have to say something new.',
    'Both still standing, both still thinking.',
    'Good exchange. Nothing wasted.',
    'That is two people paying close attention to each other.'
  ]),

  /* ── a big number ─────────────────────────────────────────────────────── */
  big: Object.freeze([
    '+10.000. Somebody move the folding chair off the concrete.',
    '+10.000 de aura and the front row just sat down on the kerb.',
    'That is +10.000 and there is no argument available.',
    '+10.000. Whoever is filming, do not cut that one.'
  ]),

  /* ── a perfect read ───────────────────────────────────────────────────── */
  perfect: Object.freeze([
    'AURA 100%. Right on the light.',
    'AURA 100%. That was the exact size it needed to be, no bigger.',
    'AURA 100%. Calm. That is the whole trick and hardly anybody does it.',
    'Perfect. Not loud — perfect. There is a difference and the crowd knows it.'
  ]),

  /* ── a whiff. WARM. Never at anyone's expense. ────────────────────────── */
  whiff: Object.freeze([
    'PERDIÓ AURA. It happens. It happens to everybody here.',
    'PERDIÓ AURA — shake it out, there is another round in about four seconds.',
    'Left that one in the bag. Go and get it, it is still in there.',
    'Missed the light. The square is being extremely kind about it and so am I.',
    'PERDIÓ AURA. Everyone in this circle has done that exact thing on a Tuesday.'
  ]),

  /* ── a repeat getting punished ────────────────────────────────────────── */
  repeat: Object.freeze([
    'Seen it. The square has a memory and it is annoyingly good.',
    'Twice is a habit. The crowd wants a new sentence, not a louder one.',
    'Same one again — half the aura for double the nerve.',
    'This bracket does not pay for reruns.',
    'They have already answered that one. Something else.'
  ]),

  /* ── a blend landing ──────────────────────────────────────────────────── */
  blend: Object.freeze([
    'Arms from one, legs from the other. That is a genuine split and it reads.',
    'Two moves, one body, and the seam does not show. +1000 AURA for the seam.',
    'Top half saying one thing, bottom half saying another, and both of them true.',
    'Blended. Only works when the halves are doing different jobs, and those were.'
  ]),

  /* ── a chain ──────────────────────────────────────────────────────────── */
  combo: Object.freeze([
    'Three linked and the circle is leaning in.',
    'Chained. Nobody has managed to interrupt the sentence yet.',
    'Still going. Every link on that is worth more than the last.',
    'That is a run. Do not let them break it.'
  ]),

  /* ── a named three-move pattern ───────────────────────────────────────── */
  pattern: Object.freeze([
    'That is a whole named chain and the front row called it before it landed.',
    'Full run, in order, on purpose. +1000 AURA and a bit extra for the nerve.',
    'They set that up two rounds ago. Nobody noticed until just now.'
  ]),

  /* ── the finisher ─────────────────────────────────────────────────────── */
  finisher: Object.freeze([
    'One final, decisive grimace. That is genuinely how these end.',
    'Face only. No body at all. And that is the battle.',
    'Meter was close enough, so they closed it. Nothing left to answer.'
  ]),

  /* ── specials worth narrating ─────────────────────────────────────────── */
  interrupt: Object.freeze([
    'Chain broken. Back to the start of the sentence.',
    'Cut straight through the run. Nothing carries over.'
  ]),
  guard: Object.freeze([
    'Guarded. Half of that never arrived.',
    'Took it standing up and did not move a shoulder.'
  ]),
  counter: Object.freeze([
    'Answered the big one with the small one, and the small one counted double.',
    'The bigger that was, the more it just cost. Read perfectly.'
  ]),

  /* ── the meter crosses — comeback ─────────────────────────────────────── */
  upset: Object.freeze([
    'Meter just crossed. The entire square noticed at the same time.',
    'That is a comeback. Nobody expected it and everybody is delighted.',
    'Behind, then not behind. Keep going, keep going.',
    'It has turned over. Whoever was comfortable is not comfortable now.'
  ]),

  /* ── out in front ─────────────────────────────────────────────────────── */
  lead: Object.freeze([
    'Comfortable. Comfortable is exactly where people get careless.',
    'Meter is leaning hard. Do not stand there admiring it.',
    'Well clear. Still four rounds for it to come back.'
  ]),

  /* ── behind ───────────────────────────────────────────────────────────── */
  behind: Object.freeze([
    'Down, not out. Nine rounds is a long weeknight.',
    'Plenty of square left. Plenty.',
    'They are ahead. They are not finished, and neither are you.'
  ]),

  /* ── match point ──────────────────────────────────────────────────────── */
  last: Object.freeze([
    'Match point. Whatever you have been saving, this is the round for it.',
    'Last one. Say the thing you actually came here to say.',
    'One more. Half the crowd stopped filming so they could just watch.',
    'Final round. Nobody is going to remember the score, they are going to remember this.'
  ]),

  /* ── the battle ends ──────────────────────────────────────────────────── */
  final: Object.freeze([
    'And that is the battle. Everybody applaud — that is the entire point of this.',
    'Done. Nine rounds, no words, no contact, nobody hurt.',
    'That is it. Both of you, back in the circle, the queue is enormous.'
  ]),

  win: Object.freeze([
    'Winner. No cup, no cash, but every person here saw it happen.',
    'Took it. And took a move home too — they always leave one behind.',
    'That is yours. Walk it off, it is a Tuesday, there is another one next week.',
    'Won it in front of everybody. That is the whole reason anyone comes out.'
  ]),

  flawless: Object.freeze([
    'AURA INFINITA. No prize money. The title, and the title is the actual prize.',
    'AURA INFINITA. Nine rounds and not one of them borrowed from another.',
    'That is infinite aura, which is worth nothing and everything, correctly.'
  ]),

  loss: Object.freeze([
    'Not tonight. Same square, same time, next week.',
    'Lost the meter, kept the room. Everybody stayed until the end.',
    'They were better tonight. Watch what they did — that is how you get it back.',
    'Beaten fairly and applauded properly. That is a good night out.',
    'Out of it. Nobody is going home yet though, so stay in the circle.'
  ])
});

/* -------------------------------------------------------------------------- */
/* PER-ROUND LINES — nine rounds, one bank each                                */
/* -------------------------------------------------------------------------- */

/**
 * Indexed 1–9 (index 0 is padding so the round number is the index). The arc is
 * deliberate: curiosity, then pressure, then the crowd getting bigger, then the
 * quiet before the last one.
 * @type {ReadonlyArray<ReadonlyArray<string>>}
 */
export const ROUND_LINES = Object.freeze([
  Object.freeze([]),
  Object.freeze([
    'Round one. Openers.',
    'Round one, and the circle just got noticeably tighter.'
  ]),
  Object.freeze([
    'Round two. Now we find out who watched the earlier fights.',
    'Two. Everybody has shown one card.'
  ]),
  Object.freeze([
    'Round three. This is where people start running out of new things.',
    'Three. The easy ones are gone.'
  ]),
  Object.freeze([
    'Four. Somebody at the back just shouted a suggestion. Ignore them.',
    'Round four and the crowd has doubled since round one.'
  ]),
  Object.freeze([
    'Halfway. Whatever you were saving, you are now saving it for four rounds.',
    'Five of nine. Both of them are thinking too hard.'
  ]),
  Object.freeze([
    'Six. Legs are getting honest.',
    'Round six. The good ones get calmer here, not bigger.'
  ]),
  Object.freeze([
    'Seven. Somebody is about to try something they have not practised.',
    'Round seven and neither of them has repeated a single thing.'
  ]),
  Object.freeze([
    'Eight. One more after this.',
    'Round eight. Whole square has gone quiet, which is a sign.'
  ]),
  Object.freeze([
    'Round nine. Last thing either of you will say tonight.',
    'Nine. Everything on this one.'
  ])
]);

/* -------------------------------------------------------------------------- */
/* PER-ACT SETS — the room, not the ranking                                    */
/* -------------------------------------------------------------------------- */

/**
 * One set per act. `intro` is said on the fit-check screen, `flavour` fills the
 * bar between exchanges, and `win` / `loss` close the battle in the language of
 * that specific place. The whole point of these is that the setting is not
 * wallpaper — the gathering IS the thing (AURA-CULTURE §6).
 * @type {Object<string, Object>}
 */
export const ACT_LINES = Object.freeze({

  plaza: Object.freeze({
    intro: 'Tuesday. Nothing else on anywhere. The square belongs to whoever turned up, for about twenty minutes.',
    flavour: Object.freeze([
      'Somebody’s mum walked past with the shopping and has now been standing there ten minutes.',
      'The streetlight came on. That is the lighting rig, that is all of it.',
      'Somebody’s little brother has appointed himself referee. Nobody asked him to.',
      'Two more kids just got off the bus and ran over. Word travels.',
      'One speaker, one phone, one square. This is the entire production.'
    ]),
    win: 'Winner of a Tuesday, in a square with nobody’s name on it. That counts, and it counts properly.',
    loss: 'It is a Tuesday. There is another Tuesday next week and everyone will be right here.'
  }),

  bracket: Object.freeze({
    intro: 'Two hundred names on a sheet taped to the slide. This is one line on that sheet.',
    flavour: Object.freeze([
      'The queue is longer than it was last round. The queue is always longer.',
      'Somebody in the bracket is filming this for somebody who could not come.',
      'Two hundred entrants and the crowd still knows exactly who is on right now.',
      'Ages in this bracket run from six to about forty. Nobody thinks that is strange.',
      'Whoever wins gets a small amount of money and a very large amount of the park.'
    ]),
    win: 'Through. Next name down the sheet, and the sheet is long.',
    loss: 'Out of the bracket, still in the park. Nobody goes home until it is finished.'
  }),

  banned: Object.freeze({
    intro: 'No permit, no plaza, no crowd. Four cars with the headlights on, and three people at a folding table.',
    flavour: Object.freeze([
      'Nobody is cheering because nobody is here. The panel can see absolutely everything.',
      'Engines idling. That is the only sound in this lot.',
      'The town banned it. This lot is not technically the town, which is why we are stood in it.',
      'One of the judges brought a clipboard. An actual clipboard.',
      'Headlights only, so anything sloppy has a shadow twice the size of it.'
    ]),
    win: 'The panel agreed, and there was nobody here to shout them down.',
    loss: 'Judged honestly, in a lot with no crowd to soften it. Take the note. Come back.'
  }),

  capital: Object.freeze({
    intro: 'Stone esplanade in front of the palace. A panel on one side, several hundred phones on the other, and they want opposite things.',
    flavour: Object.freeze([
      'A judge just wrote something down. Nobody has any idea what.',
      'The crowd wants the joke. The panel wants the technique. Good luck to everybody.',
      'Somebody is selling agua fresca to the back row. This is a real event now.',
      'Third battle in this city in three days and the crowd has followed all three.',
      'Prize is three thousand pesos. Half the people here would do it for nothing and they know it.'
    ]),
    win: 'Took the capital. Three thousand pesos or nothing at all — either way, everybody saw.',
    loss: 'The panel had their say and the crowd had theirs. Learn both and come back on Sunday.'
  }),

  upriver: Object.freeze({
    intro: 'Not a plaza at all. Forty metres of carved wood, sixty rowers behind you, and a river with no intention of holding still.',
    flavour: Object.freeze([
      'The deck is moving. The deck was always going to be moving.',
      'Sixty oars behind you and not one of them is going to wait for you to find your feet.',
      'People have been coming to this river for four hundred years. Almost none of them for a video.',
      'The whole job, the entire job, is to make aura for the people rowing. That is it.',
      'A million and a half along the banks. The kid at the prow is eleven and does this for a living.'
    ]),
    win: 'That is where all of it came from, and you have now stood on it without falling in.',
    loss: 'The river does not lose. Get your feet back under you and go again.'
  })
});

/* -------------------------------------------------------------------------- */
/* SPECIALS — one line each, for the status row                                */
/* -------------------------------------------------------------------------- */

/**
 * A short narration for every special in CONTRACT §6, so the HUD never has to
 * describe a mechanic in mechanic language.
 * @type {Object<string, string>}
 */
export const SPECIAL_LINES = Object.freeze({
  interrupt: 'Cut the chain clean in half.',
  guard: 'Took it standing. Half of it never arrived.',
  refresh: 'Went back for the one they had worn out. It is fresh again.',
  feint: 'Cheap, and now the next one links.',
  highRisk: 'All of it on one landing. No middle result available.',
  debuff: 'They will feel that on their next turn.',
  counter: 'The bigger that was, the more it just cost them.',
  finisher: 'Meter was close enough to close it. So they closed it.',
  evade: 'Sidestepped the whole set-up. Nothing landed.',
  hype: 'Traded the score for the room, and the room is worth more here.',
  read: 'Watched them decide. Knows what is coming.',
  persist: 'It is not finished. It goes again next turn, smaller.'
});

/* -------------------------------------------------------------------------- */
/* CUE ROUTING                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * `engine/battle.js` names a moment; this maps that name to a bucket in
 * `MC_LINES`. `comeback` and `matchpoint` are the friendly aliases for the
 * engine's `upset` and `last`.
 * @type {Object<string, string>}
 */
export const CUE_BUCKET = Object.freeze({
  open: 'open',
  beat: 'beat',
  big: 'big',
  perfect: 'perfect',
  whiff: 'whiff',
  repeat: 'repeat',
  punished: 'repeat',
  blend: 'blend',
  combo: 'combo',
  pattern: 'pattern',
  finisher: 'finisher',
  interrupt: 'interrupt',
  guard: 'guard',
  counter: 'counter',
  upset: 'upset',
  comeback: 'upset',
  lead: 'lead',
  behind: 'behind',
  last: 'last',
  matchpoint: 'last',
  final: 'final',
  win: 'win',
  loss: 'loss',
  flawless: 'flawless',
  start: 'start'
});

/* -------------------------------------------------------------------------- */
/* THE PICKER                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * FNV-1a. The only reason there is any code in this file: the same moment in
 * the same battle must say the same thing twice, or a re-render changes the
 * announcer's mind mid-sentence.
 * @param {string} s
 * @returns {number}
 */
function hash(s) {
  let h = 2166136261 >>> 0;
  const str = String(s);
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619) >>> 0;
  return h >>> 0;
}

/**
 * Pick one line from a bank, deterministically from a seed.
 * @param {ReadonlyArray<string>} bank
 * @param {string|number} seed
 * @returns {string|null}
 */
export function pickLine(bank, seed) {
  if (!bank || !bank.length) return null;
  return bank[hash(seed) % bank.length];
}

/**
 * The one call the HUD needs. Hand it the engine's cue and the context, get a
 * line back, or `null` when the moment does not want a line — silence is a
 * legitimate thing for an announcer to do and the bar should be allowed to
 * stay empty.
 *
 * Act flavour is preferred for the two quiet cues (`beat` and `lead`) so the
 * setting keeps surfacing between exchanges instead of only at the top.
 *
 * @param {string|null} cue     from `resolveExchange().mcCue`
 * @param {Object} [ctx]        `{ act, round, seed }`
 * @returns {string|null}
 */
export function mcLine(cue, ctx) {
  const c = ctx || {};
  const act = c.act && ACT_LINES[c.act] ? ACT_LINES[c.act] : null;
  const round = c.round | 0;
  const seed = String(c.seed != null ? c.seed : (c.act || '') + ':' + round + ':' + (cue || ''));

  if (cue === 'win' && act) return act.win;
  if (cue === 'loss' && act) return act.loss;
  if (cue === 'start' && act) return act.intro;

  if (!cue || cue === 'beat' || cue === 'lead') {
    if (act && hash(seed + '|flav') % 2 === 0) return pickLine(act.flavour, seed + '|f');
    if (!cue) {
      const rl = ROUND_LINES[round];
      if (rl && rl.length && hash(seed + '|rl') % 2 === 0) return pickLine(rl, seed + '|r');
      return pickLine(MC_LINES.beat, seed);
    }
  }

  const bucket = CUE_BUCKET[cue];
  if (bucket && MC_LINES[bucket]) return pickLine(MC_LINES[bucket], seed);
  return null;
}

/**
 * The line for the top of a round, before anyone has moved.
 * @param {number} round 1-based
 * @param {string|number} [seed]
 * @returns {string|null}
 */
export function roundLine(round, seed) {
  const bank = ROUND_LINES[round | 0];
  return pickLine(bank, seed != null ? seed : 'round:' + round);
}

/* -------------------------------------------------------------------------- */

export const MC = Object.freeze({
  callouts: CALLOUTS,
  lines: MC_LINES,
  rounds: ROUND_LINES,
  acts: ACT_LINES,
  specials: SPECIAL_LINES,
  cues: CUE_BUCKET,
  line: mcLine,
  roundLine: roundLine,
  pick: pickLine
});

export default MC;
