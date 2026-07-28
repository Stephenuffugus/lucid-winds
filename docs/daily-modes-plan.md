# DAILY MODES — the plan
Written Jul 22 2026. **PARKED. Not in progress.** Stephen's focus is the Jimothy art.

Why this exists: Listdle only takes free daily games with no login, and it is the
directory that has actually said yes to us. Every game we give a real daily to is a
game that can be submitted there and to the next directory like it. This is the
cheapest distribution work we have.

⛔ Nothing in here gets built until Stephen says so. It is written down so it is not
re-derived from scratch later.

---

## THE LESSON THAT DRIVES ALL OF THIS

Jimothy shipped a "Daily" mode for weeks that was not a daily. Two players on the
same day diverged at row 21 because the course and the clock-driven events drew from
one shared PRNG, so staying alive longer burned extra draws and changed every lane
after that. Nobody noticed because the mode had a label that said DAILY.

So the rule for this whole lane: **a mode is not a daily because it is called one.**
It is a daily when a probe proves two different players on the same date get the same
thing. Verify before submitting, never after.

The pattern that came out of fixing it is in `satellites/stream-hop/index.html`
(search `THE DAILY`) and is worth copying wholesale:

1. Two PRNG streams. One draws the puzzle, one draws anything on a clock. **Never
   merge them.**
2. No player state leaks into generation. Not their position, not what they have
   already unlocked, not their save file.
3. Seed off a UTC day number so the day turns at one instant worldwide.
4. Hash the seed. Consecutive small integers through an xorshift correlate, and
   Monday would feel like Tuesday.
5. The result is the FIRST run started that day, written as it happens. Not the best
   run, which is farmable. Not written at the end, which loses to a closed tab.
6. Practice afterwards is free and never touches the result.
7. Nothing purchasable improves the number.
8. A small shareable strip, stored as a code string and rendered twice: emoji squares
   for the paste, real coloured blocks in the app, because emoji coverage is a font
   question.

---

## LANE A — VERIFY THE SIX THAT ALREADY CLAIM A DAILY
**Do this first. It is cheap, and it is the lane where bugs already exist.**

Six `/play/` games advertise a daily. Scanned their source Jul 22. Findings:

| Game | File | State | Work |
|---|---|---|---|
| Dew Trail | `games/dewtrail.js` | UTC-seeded mulberry32, unique solution guaranteed, self-documented | verify only |
| Word Sprout | `games/sprout.js` | real: `pickWord()` uses `SOLUTIONS[dailyIndex()]` | verify, decide rollover |
| Flood | `games/flood.js` | real: deterministic board from a date-string seed | verify, decide rollover |
| Minesweeper | `games/mines.js` | real: same pattern, `'mn'+todayStr()` | verify, decide rollover |
| **Daily Bloom** | `games/dailybloom.js` | ⚠️ **PARTIAL** | needs a fix |
| **Stop at Ten** | `games/stopten.js` | ⚠️ **needs a decision** | see below |

### ⚠️ Daily Bloom is only half a daily
`pickDailyExercises()` is properly seeded, so everyone gets the same five exercises.
The content *inside* each exercise is not. `startWordRecall()` does
`shuf(WORD_BANKS[Math.floor(Math.random()*WORD_BANKS.length)])`, so two people doing
today's Bloom memorise different words from different banks.

Same workout, different reps. Nobody can compare a score, which is the entire point
of a daily. Fix is small: thread the day seed into the exercise builders instead of
calling `Math.random`. Worth checking the other four exercises for the same thing.

Also `dayOfYear()` builds `new Date(d.getUTCFullYear(),0,0)` (local constructor) and
then reconciles with `getTimezoneOffset()`. It works, but it is the fragile kind of
date code, and it repeats every year.

### ⚠️ Stop at Ten needs a ruling, not a fix
It is a reaction game and its waits are `350+Math.random()*350`. That randomness is
arguably the game. But it means two players on the same day did not face the same
test, so a "daily" score is not comparable. Either seed the wait sequence off the day
(and it becomes a true daily) or stop calling it one. Stephen's call.

### The cross-cutting question: local midnight or UTC
Right now we do both by accident. Jimothy and Dew Trail roll over at UTC midnight.
Word Sprout, Flood, Minesweeper, Hues and Cosmic Cadets roll over at the player's
local midnight.

Neither is wrong. Wordle itself uses local. But it should be a house rule we chose,
not an accident, because it changes what "the same puzzle as everyone" means and it
is the kind of thing a directory owner notices. **Recommendation: local midnight
everywhere except where a shared course could be scouted ahead of time** (Jimothy,
where a timezone jump would hand you tomorrow's road). Needs Stephen's word.

**Lane A total: one session for the verify sweep, plus a small fix for Daily Bloom.**
The probe technique is the same one used on Jimothy: run headless, generate the
puzzle under two different fake save files, diff the output.

---

## LANE B — THE SHARED DAILY KIT
**Do this before Lane C, not after.**

Half a session to lift the Jimothy daily into a small shared module (`games/_daily.js`
or the `/play/` shell, whichever fits the loader). It owns: the day number, the seeded
RNG, first-run-counts bookkeeping, the streak, the share-strip encoder, and the
"new one in 4h 12m" countdown.

After that a new daily is a day of work rather than a week, and every daily behaves
the same way, which matters more than it sounds: players learn one set of rules.

⛔ ES5, no frameworks, same as everything else.

---

## LANE C — BUILD DAILIES INTO THE THREE THAT HAVE NONE

These are the three worth doing, and the order is deliberate.

### 1. Vine Words · `games/vinewords.js` (590 lines)
Connect adjacent letters against a two minute timer. **Named in the very first email
to Conor**, so it is the one he already has in mind, and Listdle is a word-game
directory first. Highest value of the three.
- Date-seed the letter grid so everyone gets the same board.
- First attempt of the day is the result, practice after.
- Share strip: one square per word found, shaded by length. Reads well pasted.
- ~half a session on top of the kit.

### 2. Word Search · `games/wordsearch.js` (339 lines)
Also named in that first email. Smallest file of the three and the most mechanical.
- Date-seed the grid and the theme word list.
- Share: time taken plus a small found-order strip.
- ~half a session.

### 3. Three Sisters · `/play/set.html` (the SET game) — ✅ BUILT, this section is stale
**CORRECTED 2026-07-28.** The code was located and the daily was BUILT on 2026-07-16
(commit 0b8f1129) — before this plan's estimate was written. It lives in
`games/_inline/set.js`: DAILY TRIO mode button :186, date-seeded deck :397
(`mulberry32(dayNum() + 77001)`), day helpers :146-164, one counted lock-in +
practice replays + "Three Sisters Daily #N" share text :247-268, `window._setDaily`
:422. Wired live at `play/set.html:36`.
- Still inline rather than a canonical `games/set.js` (the canonical-games rule still
  applies if anyone touches it).
- Rolls at LOCAL midnight, not UTC — the same caveat as Word Sprout / Flood /
  Minesweeper. Fix that before submitting it to Listdle.

---

## WHAT NOT TO DO

- **Do not submit any of these to Listdle before Lane A verifies them.** Conor has
  been generous with us. Sending him a game whose daily is not a daily is how that
  ends.
- **Do not build all nine at once.** One game, verified, submitted, then the next.
- **Do not touch Lucid Winds itself.** It is a collection and it asks for an account,
  so it fails the directory rule twice. It stays held back.
- **Do not add a daily to a game nobody plays** just to have another listing. A dead
  game with a daily is still a dead game.

---

## ORDER OF OPERATIONS WHEN THIS THAWS

1. Lane A verify sweep (one session) → we learn which of the six are honest.
2. Fix Daily Bloom, rule on Stop at Ten, rule on local vs UTC.
3. Submit the verified ones to Listdle, a couple at a time, telling Conor each time.
4. Lane B shared kit.
5. Vine Words → verify → submit. Then Word Search. Then Three Sisters.

Nothing here is urgent. All of it compounds.
