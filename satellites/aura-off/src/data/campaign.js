// AURA OFF — the campaign. Pure data, no logic, no imports.
//
// Five acts, twenty-five opponents, five fits. Every number here is copied
// verbatim from CONTRACT.md §10. The parts that are authored rather than
// copied are: each act's teaching note, each opponent's move pool (the SIZE is
// fixed by the contract table, the contents are a design choice), and each
// opponent's character line.
//
// WHO THESE PEOPLE ARE
// --------------------
// They are teenagers in a public square on a weeknight. They are not fighters.
// Nobody here is trying to become famous — the real winner of the real Bellas
// Artes battle said that more than for the prize, he does it to have a good
// time and take his mind off things at home (AURA-CULTURE §6). Every character
// line is written from that, so none of them is a villain and none of them is
// a joke at their own expense that they did not make themselves.
//
// No real person's name or likeness appears. `Togak Luan` is the formal Malay
// Riau name of the boat-dancer ROLE (AURA-CULTURE §1.1), not a person's name.
//
// ROSTER BALANCE — DELIBERATE, DO NOT SKEW IT BACK
// -----------------------------------------------
// 9 read female · 6 read male · 10 read neutral. One woman is named as a
// competitor across roughly forty sources, yet AFP photographed a young woman
// competing in Mexico City and Alejandra Bastilla took second in Cochabamba.
// The gap is almost certainly in the press coverage rather than in the
// culture (HANDOFF open question #4). The `reads` field below exists so that
// balance is countable rather than merely intended.
//
// HOW THE POOLS WERE CHOSEN
// -------------------------
// Three rules, applied in order:
//   1. An opponent always carries the move they drop, so you watch a move land
//      on you before you ever get to throw it. Study is documented as part of
//      the real sport — the CDMX winner said he studied his opponents' moves
//      in order to counterattack.
//   2. Everything else in a pool is drawn from moves already dropped earlier in
//      campaign order, so the vocabulary on screen is vocabulary the player can
//      read at that point in the run.
//   3. Every `mirror` opponent carries all three categories. A mirror answers
//      with the category that beats your last, and a mirror missing a category
//      is a mirror with nothing to say.
// The pool is an explicit array, which `battle.js` honours as authored.
//
// EL FARMEO — THE QUALIFYING STAGE
// --------------------------------
// AURA-CULTURE §8.2 documents the format: competitors register in advance,
// there are elimination rounds, and each competitor performs for only a few
// seconds at a time. So a fight here is two stages. First you go up alone and
// farm — the culture's own word for the solo act, *farmear aura*, as against
// *batalla de aura* for the face-to-face — and what the room makes of that
// decides the meter you open the battle on.
//
// `act.qualify` is `{ turns, bar, line }`.
//   `turns` is how long they give you. Two or three. Seconds, not a routine.
//   `bar`   is aura PER TURN at a mid-skill name in that act. It is lower in
//           the two-turn acts because the combo chain has one fewer turn to
//           grow in, so a two-turn average is genuinely worth less than a
//           three-turn one — not because those acts are softer.
//   `line`  is what the queue looks like in that place.
// `battle.js` `qualifyFor()` turns that into an actual bar, scaled by the skill
// of the name you are queueing to face. Falling short never sends anybody home;
// it costs meter and a few people. Nobody gets turned away from a Tuesday.
//
// Shapes consumed by the engine:
//   act       { id, name, scoring, unstable?, repeatsPunished?, fitWeight?,
//               qualify?: { turns, bar, line } }
//   opponent  { id, name, skill, quirk, pool[], drop, qualify?: false }
//   fit       { id, name, crowd, judges }

/* -------------------------------------------------------------------------- */
/* THE STARTING KIT                                                            */
/* -------------------------------------------------------------------------- */

/**
 * What you walk into the first square already knowing. CONTRACT §9.
 * One FLEX and two FLOW — deliberately no BAIT, so the first time anyone
 * clowns in front of you it is somebody else doing it.
 * @type {ReadonlyArray<string>}
 */
export const STARTING_KIT = Object.freeze(['sixseven', 'aurawalk', 'sideeye']);

/* -------------------------------------------------------------------------- */
/* ACTS                                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Five acts in campaign order.
 *
 * `scoring` is what the act actually counts — `crowd`, `judges` or `both`.
 * Both audiences are real: some documented battles are decided by volume of
 * cheering alone, some by a panel, and the capital weekend used both.
 *
 * `mode` is an alias of `scoring` kept for any caller that reads the friendlier
 * name. They are always the same string.
 *
 * `repeatsPunished` is Act 2 only. It is a two hundred entrant elimination
 * ladder and the verified win condition is referencing as many different things
 * as possible, so saying the same thing twice has to cost you there first.
 *
 * `unstable` is Act 5 only. The deck is moving. It perturbs the amplitude you
 * actually achieve and it speeds the needle, which turns composure from a
 * scoring curve into the literal job.
 *
 * `fitWeight` is Act 4 only. Two audiences that want opposite things, and a
 * judge who called a real winner on his shoes before he moved.
 *
 * @type {ReadonlyArray<Object>}
 */
export const ACTS = Object.freeze([
  Object.freeze({
    id: 'plaza',
    name: 'The Plaza',
    setting: 'Local square, Tuesday evening',
    scoring: 'crowd',
    mode: 'crowd',
    unstable: false,
    repeatsPunished: false,
    fitWeight: 1,
    teaches: 'Learn the triangle. Learn that arms and legs are separate jobs.',
    blurb: 'Nothing else is on. Twenty minutes where the square belongs to whoever showed up.',
    scoringNote: 'Decided on noise. Cheering, applause, laughing — all of it counts.',
    qualify: Object.freeze({
      turns: 3,
      bar: 940,
      line: 'Somebody has to go first and it is you. Nobody opposite — three moves, and the square decides.'
    })
  }),
  Object.freeze({
    id: 'bracket',
    name: 'The Park Bracket',
    setting: 'Municipal park, 200 entrants',
    scoring: 'crowd',
    mode: 'crowd',
    unstable: false,
    repeatsPunished: true,
    fitWeight: 1,
    teaches: 'A real elimination ladder. Say something new every single turn.',
    blurb: 'Two hundred names on a sheet taped to the slide. Single elimination, and the queue keeps growing.',
    scoringNote: 'Crowd only, and this one has a memory. Repeat yourself and it costs you.',
    qualify: Object.freeze({
      turns: 2,
      bar: 780,
      line: 'Two hundred names on the sheet and about four seconds each. You get two moves. Everybody gets two.'
    })
  }),
  Object.freeze({
    id: 'banned',
    name: 'The Banned Town',
    setting: 'Empty lot, headlights only',
    scoring: 'judges',
    mode: 'judges',
    unstable: false,
    repeatsPunished: false,
    fitWeight: 1,
    teaches: 'The mayor banned it. No crowd to play to. Technique is all that is left.',
    blurb: 'Moved out of the plaza and into a lot on the edge of town. Four cars, headlights on, three people judging.',
    scoringNote: 'A panel, and nobody to shout them down. Composure over noise.',
    qualify: Object.freeze({
      turns: 3,
      bar: 940,
      line: 'Headlights on, three people at a folding table. They want to watch you move before anything starts.'
    })
  }),
  Object.freeze({
    id: 'capital',
    name: 'The Capital',
    setting: 'Palace esplanade',
    scoring: 'both',
    mode: 'both',
    unstable: false,
    repeatsPunished: false,
    fitWeight: 1.6,
    teaches: 'Two audiences that want opposite things. Fit matters most here.',
    blurb: 'Stone esplanade in front of the palace. Registration by message, a panel on one side, several hundred phones on the other.',
    scoringNote: 'Crowd and panel, averaged. What one of them loves the other one shrugs at.',
    qualify: Object.freeze({
      turns: 3,
      bar: 960,
      line: 'Registration was by message and anyone can send a message. This is where they check you meant it.'
    })
  }),
  Object.freeze({
    id: 'upriver',
    name: 'Upriver',
    setting: 'The prow of a racing boat',
    scoring: 'judges',
    mode: 'judges',
    unstable: true,
    repeatsPunished: false,
    fitWeight: 1,
    teaches: 'Where all of it started. Forty metres of carved wood, sixty rowers, and no still ground.',
    blurb: 'Not a plaza at all. A four hundred year old boat race, a child at the prow, and a job that existed long before any of this had a name.',
    scoringNote: 'Judged, on a deck that will not hold still. The only real skill here is composure.',
    qualify: Object.freeze({
      turns: 2,
      bar: 730,
      line: 'They wave you onto the prow while the crew is still tying off. Two passes. The boat is already moving.'
    })
  })
]);

/* -------------------------------------------------------------------------- */
/* OPPONENTS — 25, in campaign order                                           */
/* -------------------------------------------------------------------------- */

/**
 * Every opponent, in the order you meet them. Beat one and you learn the move
 * they dropped on you.
 *
 * `reads` is how the character presents — `f`, `m` or `neutral`. See the roster
 * balance note at the top of this file.
 *
 * @type {ReadonlyArray<Object>}
 */
export const OPPONENTS = Object.freeze([

  /* ── ACT 1 · THE PLAZA ───────────────────────────────────────────────── */

  Object.freeze({
    id: 'chispa',
    name: 'Chispa',
    act: 'plaza',
    skill: 0.30,
    quirk: null,
    boss: false,
    reads: 'neutral',
    // Two moves, and they are one FLEX and one FLOW — the smallest possible
    // demonstration that the triangle exists at all.
    pool: Object.freeze(['headnod', 'aurawalk']),
    drop: 'headnod',
    // THE ONE FIGHT WITH NO FARMEO. Every other act and every other name on the
    // circuit makes you go up alone first (see `qualify` on the acts), because
    // AURA-CULTURE §8.2 documents registration and elimination rounds as part
    // of the format. There is no queue at the start of the evening, though —
    // her own line is that she is first into the circle every Tuesday, and you
    // are the other person who turned up. The first fight of a run is also the
    // one place a solo bar the player can fall short of teaches them nothing,
    // because they have not yet held the pad once.
    qualify: false,
    line: 'Twelve, here every Tuesday, first into the circle every time. Has exactly two moves and is not embarrassed about it.'
  }),

  Object.freeze({
    id: 'tiabeti',
    name: 'Tía Beti',
    act: 'plaza',
    skill: 0.38,
    quirk: null,
    boss: false,
    reads: 'f',
    pool: Object.freeze(['shadowstep', 'aurawalk', 'sideeye']),
    drop: 'shadowstep',
    line: 'Everyone’s aunt at sixteen. Holds the bags, holds the phones, holds the whole square together, then steps in and wins two rounds.'
  }),

  Object.freeze({
    id: 'nenavox',
    name: 'Nena Vox',
    act: 'plaza',
    skill: 0.44,
    quirk: 'frontrunner',
    boss: false,
    reads: 'f',
    // First BAIT the player ever sees, and it lands on them rather than being
    // handed to them. All three categories in three moves.
    pool: Object.freeze(['losingit', 'sixseven', 'aurawalk']),
    drop: 'losingit',
    line: 'Sings on the bus with no headphones in. Had the crowd before the first round started and knows exactly what that is worth.'
  }),

  Object.freeze({
    id: 'rulo',
    name: 'Rulo',
    act: 'plaza',
    skill: 0.48,
    quirk: null,
    boss: false,
    reads: 'm',
    // Three moves, all of them 100/0. The pool IS the character: his legs never
    // move, and it is the clearest possible read of upper versus lower.
    pool: Object.freeze(['eyeroll', 'sideeye', 'headnod']),
    drop: 'eyeroll',
    line: 'Has not moved his feet in four battles. The entire game happens above the collar and it keeps working.'
  }),

  Object.freeze({
    id: 'portero',
    name: 'El Portero',
    act: 'plaza',
    skill: 0.58,
    quirk: 'punisher',
    boss: true,
    reads: 'm',
    pool: Object.freeze(['sigma', 'aurawalk', 'eyeroll', 'sixseven']),
    drop: 'sigma',
    line: 'Keeps goal on this concrete every afternoon. Treats the circle the same way — nothing gets past him twice.'
  }),

  /* ── ACT 2 · THE PARK BRACKET ────────────────────────────────────────── */

  Object.freeze({
    id: 'uvi',
    name: 'Uvi',
    act: 'bracket',
    skill: 0.62,
    quirk: null,
    boss: false,
    reads: 'neutral',
    pool: Object.freeze(['shoulder', 'sixseven', 'losingit', 'sigma']),
    drop: 'shoulder',
    line: 'Drew up the bracket sheet, taped it to the slide, then entered it. Knows every name in the queue and says hello to all of them.'
  }),

  Object.freeze({
    id: 'maikito',
    name: 'Maikito',
    act: 'bracket',
    skill: 0.68,
    quirk: null,
    boss: false,
    reads: 'm',
    pool: Object.freeze(['collapse', 'sixseven', 'shadowstep']),
    drop: 'collapse',
    line: 'Twelve, half the height of the field, throws himself at the ground like it owes him money. The park adores him.'
  }),

  Object.freeze({
    id: 'gemela',
    name: 'La Gemela',
    act: 'bracket',
    skill: 0.74,
    quirk: 'mirror',
    boss: false,
    reads: 'f',
    // mirror — all three categories, in the minimum three moves.
    pool: Object.freeze(['ripple', 'sigma', 'eyeroll']),
    drop: 'ripple',
    line: 'Her twin is somewhere in the crowd doing the same thing half a second behind. Whatever you throw comes straight back at you.'
  }),

  Object.freeze({
    id: 'tacho',
    name: 'Tacho',
    act: 'bracket',
    skill: 0.78,
    quirk: null,
    boss: false,
    reads: 'm',
    pool: Object.freeze(['buckle', 'aurawalk', 'shoulder']),
    drop: 'buckle',
    line: 'Tall, quiet, apologises for standing in front of people. Then his knees go on purpose and the whole bracket stops.'
  }),

  Object.freeze({
    id: 'feffer',
    name: 'Doña Feffer',
    act: 'bracket',
    skill: 0.86,
    quirk: 'patient',
    boss: true,
    reads: 'f',
    // patient — she is dangerous from behind, so the pool is built to be
    // survivable early and heavy late: crowdturn banks hype, then collapse.
    pool: Object.freeze(['crowdturn', 'aurawalk', 'losingit', 'collapse', 'sigma']),
    drop: 'crowdturn',
    line: 'Signed up because the park is named after her block and nobody told her she could not. Waits, waits, then takes the whole afternoon.'
  }),

  /* ── ACT 3 · THE BANNED TOWN ─────────────────────────────────────────── */

  Object.freeze({
    id: 'farola',
    name: 'La Farola',
    act: 'banned',
    skill: 0.78,
    quirk: null,
    boss: false,
    reads: 'f',
    // Judges act. Nothing in this pool plays for a laugh, because there is
    // nobody in the lot to laugh.
    pool: Object.freeze(['shades', 'sigma', 'ripple']),
    drop: 'shades',
    line: 'Stands exactly where the two sets of headlights cross and does not blink. That is the whole opening statement.'
  }),

  Object.freeze({
    id: 'silenciosa',
    name: 'La Silenciosa',
    act: 'banned',
    skill: 0.84,
    quirk: 'punisher',
    boss: false,
    reads: 'f',
    pool: Object.freeze(['stillwater', 'shadowstep', 'sixseven']),
    drop: 'stillwater',
    line: 'Never once played to a crowd, which everybody found strange until the town took the crowd away.'
  }),

  Object.freeze({
    id: 'nudo',
    name: 'Nudo',
    act: 'banned',
    skill: 0.88,
    quirk: null,
    boss: false,
    reads: 'neutral',
    pool: Object.freeze(['slowturn', 'ripple', 'buckle']),
    drop: 'slowturn',
    line: 'Ties up on purpose and comes undone right on the beat. Nobody in the lot has worked out where the knot goes.'
  }),

  Object.freeze({
    id: 'regla',
    name: 'La Regla',
    act: 'banned',
    skill: 0.94,
    quirk: null,
    boss: false,
    reads: 'f',
    pool: Object.freeze(['heeldrag', 'aurawalk', 'stillwater', 'shoulder']),
    drop: 'heeldrag',
    line: 'Keeps time for everyone else, out loud, whether they asked or not. In a town that banned this, she is the reason it stayed orderly.'
  }),

  Object.freeze({
    id: 'alcalde',
    name: 'El Alcalde',
    act: 'banned',
    skill: 1.04,
    quirk: 'frontrunner',
    boss: true,
    reads: 'm',
    // Four FLEX and one dry BAIT. He is all posture, and the one time he
    // clowns it is at his own expense.
    pool: Object.freeze(['mewing', 'sigma', 'shades', 'aurawalk', 'eyeroll']),
    drop: 'mewing',
    line: 'Not the actual mayor. Got the nickname for banning battles from his own driveway, and then turning up to this one anyway.'
  }),

  /* ── ACT 4 · THE CAPITAL ─────────────────────────────────────────────── */

  Object.freeze({
    id: 'zapato',
    name: 'El Zapato',
    act: 'capital',
    skill: 0.88,
    quirk: null,
    boss: false,
    reads: 'neutral',
    pool: Object.freeze(['lasso', 'aurawalk', 'mewing']),
    drop: 'lasso',
    line: 'Brought one enormous sandal across the city on the bus and swings it overhead like a rope. The driver had opinions about it.'
  }),

  Object.freeze({
    id: 'condesa',
    name: 'Condesa',
    act: 'capital',
    skill: 0.92,
    quirk: null,
    boss: false,
    reads: 'f',
    pool: Object.freeze(['freeze', 'stillwater', 'ripple', 'shades']),
    drop: 'freeze',
    line: 'Walked over from the neighbourhood the esplanade crowd is named after. Stops dead in the middle of a move and lets it hang there.'
  }),

  Object.freeze({
    id: 'reves',
    name: 'Revés',
    act: 'capital',
    skill: 0.96,
    quirk: 'mirror',
    boss: false,
    reads: 'neutral',
    // mirror — all three categories present.
    pool: Object.freeze(['noodle', 'slowturn', 'sixseven', 'lasso']),
    drop: 'noodle',
    line: 'Reads you for a full round, says nothing between rounds, and then hands the whole thing back to you the other way round.'
  }),

  Object.freeze({
    id: 'payaso',
    name: 'El Payaso',
    act: 'capital',
    skill: 1.00,
    quirk: null,
    boss: false,
    reads: 'm',
    // Three BAIT and a crowd turn. Every joke in this pool is aimed at himself,
    // which is the only direction the game allows and the only one he uses.
    pool: Object.freeze(['clog', 'collapse', 'losingit', 'crowdturn']),
    drop: 'clog',
    line: 'The joke is always on him, always by his own choice, and he has never once aimed it at the person opposite.'
  }),

  Object.freeze({
    id: 'explanada',
    name: 'La Explanada',
    act: 'capital',
    skill: 1.12,
    quirk: 'patient',
    boss: true,
    reads: 'f',
    pool: Object.freeze(['doubletake', 'mewing', 'shades', 'heeldrag', 'freeze', 'ripple']),
    drop: 'doubletake',
    line: 'Has battled on this stone since the very first Friday. Knows which flagstone is loose and which judge writes things down.'
  }),

  /* ── ACT 5 · UPRIVER ─────────────────────────────────────────────────── */

  Object.freeze({
    id: 'rower',
    name: 'The Rower',
    act: 'upriver',
    skill: 1.16,
    quirk: null,
    boss: false,
    reads: 'neutral',
    pool: Object.freeze(['swirl', 'aurawalk', 'stillwater']),
    drop: 'swirl',
    line: 'Pulls an oar eleven months a year and dances the other one. The hands already know what to do without being asked.'
  }),

  Object.freeze({
    id: 'current',
    name: 'The Current',
    act: 'upriver',
    skill: 1.24,
    quirk: 'punisher',
    boss: false,
    reads: 'neutral',
    pool: Object.freeze(['spin', 'ripple', 'heeldrag']),
    drop: 'spin',
    line: 'Rows the middle bank, where the water pushes back hardest all day. Nothing you have already done survives out there.'
  }),

  Object.freeze({
    id: 'bow',
    name: 'The Bow',
    act: 'upriver',
    skill: 1.32,
    quirk: null,
    boss: false,
    reads: 'neutral',
    // Carries the finisher that the player is about to inherit — a final,
    // decisive grimace, which is the documented way these things actually end.
    pool: Object.freeze(['grimace', 'stillwater', 'sixseven']),
    drop: 'grimace',
    line: 'Stands at the sharp end at full speed and holds still while forty metres of wood does not. Ends things with one look.'
  }),

  Object.freeze({
    id: 'downstream',
    name: 'Downstream',
    act: 'upriver',
    skill: 1.38,
    quirk: 'frontrunner',
    boss: false,
    reads: 'neutral',
    pool: Object.freeze(['boat', 'swirl', 'slowturn']),
    drop: 'boat',
    line: 'Rides the fast water home every year and has never once looked back at the field to check.'
  }),

  Object.freeze({
    id: 'togakluan',
    name: 'Togak Luan',
    act: 'upriver',
    skill: 1.50,
    quirk: 'mirror',
    boss: true,
    reads: 'neutral',
    // The last pool in the game and the only seven. mirror, so all three
    // categories are present, and it is deliberately the whole river vocabulary
    // rather than the strongest seven moves: this is not a boss with a gimmick,
    // it is the original job done properly.
    pool: Object.freeze(['boat', 'swirl', 'grimace', 'stillwater', 'aurawalk', 'freeze', 'sixseven']),
    drop: null,
    line: 'The child at the prow. Forty metres of carved wood, sixty rowers behind, and one job — make aura for all of them, and do not fall in.'
  })
]);

/* -------------------------------------------------------------------------- */
/* FITS                                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Chosen once, before the fight, and then it shuts up. A judge called a real
 * winner on his shoes before he had moved at all, so the fit sets the meter
 * ahead of round one rather than buffing anything per turn.
 *
 * Both the frog suit and the giant clog are documented — real competitors
 * turned up dressed as a frog and battled with a giant rubber clog.
 *
 * @type {ReadonlyArray<Object>}
 */
export const FITS = Object.freeze([
  Object.freeze({
    id: 'clogs',
    name: 'Loud clogs',
    crowd: 8,
    judges: 0,
    icon: '\u{1F45E}',
    note: 'Audible before you are visible. The crowd is in. The panel writes nothing down.'
  }),
  Object.freeze({
    id: 'black',
    name: 'All black',
    crowd: 0,
    judges: 6,
    icon: '\u{1F5A4}',
    note: 'Nothing to look at but the movement. The panel appreciates that. The crowd wanted a costume.'
  }),
  Object.freeze({
    id: 'headcloth',
    name: 'Headcloth & shades',
    crowd: 4,
    judges: 4,
    icon: '\u{1F576}',
    note: 'Reads the same from the front row and the folding table. Quiet respect, both sides.'
  }),
  Object.freeze({
    id: 'frog',
    name: 'Frog suit',
    crowd: 10,
    judges: -3,
    icon: '\u{1F438}',
    note: 'Total commitment. The square loves you. The panel would like the record to show it noticed.'
  }),
  Object.freeze({
    id: 'uniform',
    name: 'School uniform',
    crowd: 0,
    judges: 0,
    icon: '\u{1F392}',
    note: 'Came straight from class. Nothing to live up to and nothing to hide behind.'
  })
]);

/* -------------------------------------------------------------------------- */
/* DERIVED VIEWS — plain data, computed once at module load                     */
/* -------------------------------------------------------------------------- */

/** Every move id the campaign hands out, in the order it hands them out. */
export const ALL_DROPS = Object.freeze(
  OPPONENTS.map(function (o) { return o.drop; }).filter(function (d) { return !!d; })
);

/** Opponents grouped by act id, campaign order preserved inside each act. */
export const OPPONENTS_BY_ACT = Object.freeze(ACTS.reduce(function (map, act) {
  map[act.id] = Object.freeze(OPPONENTS.filter(function (o) { return o.act === act.id; }));
  return map;
}, Object.create(null)));

/** @param {string} id @returns {Object|null} */
export function actById(id) {
  for (let i = 0; i < ACTS.length; i++) if (ACTS[i].id === id) return ACTS[i];
  return null;
}

/** @param {string} id @returns {Object|null} */
export function opponentById(id) {
  for (let i = 0; i < OPPONENTS.length; i++) if (OPPONENTS[i].id === id) return OPPONENTS[i];
  return null;
}

/** @param {string} actId @returns {ReadonlyArray<Object>} */
export function opponentsForAct(actId) {
  return OPPONENTS_BY_ACT[actId] || Object.freeze([]);
}

/** @param {string} id @returns {Object|null} */
export function fitById(id) {
  for (let i = 0; i < FITS.length; i++) if (FITS[i].id === id) return FITS[i];
  return null;
}

/**
 * Everything the player owns after beating `count` opponents in campaign order.
 * Used by the balance simulator to play each act with a realistic deck rather
 * than the full 27, and by the map screen to show what is still out there.
 * @param {number} count opponents already beaten
 * @returns {string[]} move ids
 */
export function deckAfter(count) {
  const deck = STARTING_KIT.slice();
  const n = Math.max(0, Math.min(OPPONENTS.length, count | 0));
  for (let i = 0; i < n; i++) {
    const d = OPPONENTS[i].drop;
    if (d && deck.indexOf(d) === -1) deck.push(d);
  }
  return deck;
}

/**
 * The deck a player would plausibly be carrying at the START of an act — the
 * kit plus everything dropped in every earlier act.
 * @param {string} actId
 * @returns {string[]} move ids
 */
export function deckEnteringAct(actId) {
  let seen = 0;
  for (let i = 0; i < ACTS.length; i++) {
    if (ACTS[i].id === actId) return deckAfter(seen);
    seen += opponentsForAct(ACTS[i].id).length;
  }
  return STARTING_KIT.slice();
}

/* -------------------------------------------------------------------------- */

export const CAMPAIGN = Object.freeze({
  acts: ACTS,
  opponents: OPPONENTS,
  opponentsByAct: OPPONENTS_BY_ACT,
  fits: FITS,
  startingKit: STARTING_KIT,
  allDrops: ALL_DROPS,
  rounds: 9
});

export default CAMPAIGN;
