# WHAT TO TEST — Sky Wolf fleet, 2026-08-16

**Display names, because the folder names differ:** greenhouse-pinball ships as **Blobworks**,
seed-flutter ships as **Cosmic Cadets**, stream-hop ships as **Jumping Jimothy**, garden-td
ships as **Garden Guard**, slice-master ships as **Super Slice**.

Everything below is **live on lucidwinds.com**. The five new games and most audited ones are behind
the tester gate, so unlock once with your passcode on any in development card and the whole
In Development tab opens.

How to read this: **Try this** is the fastest way to see the change. **Was** is what it did before,
so you can tell whether the fix took. Anything marked ⚖ is a decision waiting on you, not a bug.

---

# PART 1 — THE FIVE NEW GAMES

Built from scratch today, then deepened. **1,443 assertions** between them, zero failing
(deepwell 308, blackout 343, parallel 205, wireworm 285, siege 302), all re-run at the time of writing.
All five: `lucidwinds.com/satellites/<name>/`

## DEEPWELL `⛏️` — push your luck mining
**Try this:** dig down, watch the AIR TO SURFACE readout, and turn back late on purpose.
Then dig again and take a shrine bargain.
- The depth odometer is the biggest thing on screen and there is an etched line at your record.
- AIR TO SURFACE reads **empty** at the surface with "Nothing to climb yet. The way out is free."
  *Was: a full bar reading amber, so it looked dangerous when you were perfectly safe.*
- The shaft draws in its own left band: strata, a depth ruler, node markers, and the lamp as a
  pool of light whose radius **is** the lamp meter. *Was: nothing, then art that collided with the UI.*
- 18 shrine bargains, six named landmarks below 200m.
- Loss screens itemise what you dropped and where.
- **Balance:** 6 of 7 bounds hit. The 7th is proved impossible, see ⚖ below.

## BLACKOUT `🕯️` — procedural murder, every case provably solvable
**Try this:** play a case to an accusation. Then turn on **liar mode** and play another.
- Every case is generated with **exactly one** solution and the evidence to prove it. 10,000
  cases verified: 100% unique, 0.01% retry.
- **Liar mode is new**: exactly one suspect lies once, and the case is still provably solvable.
  Verified over 10,000 liar cases.
- Tap a clue in the journal and the board cells it constrains halo, without marking them for you.
- Case titles are generated ("The Kitchen Matter"), and now fit the header.
  *Was: truncated to "THE EVENING BUSINE…".*
- Difficulty ladder: quick / standard / long × honest / liar.

## PARALLEL `🪞` — two of you, one set of controls
**Try this:** play the first five levels, then open the level map.
- **100 levels**, every one solved by the solver before it ships. *Was: 60.*
- The **par** on screen is the solver's own optimum, so matching it is provably perfect.
- The mirror seam is a clear full height axis. *Was: painting underneath the tiles, so it only
  showed through gaps.*
- Board fills the screen at both phone and desktop. *Was: a small square in an ocean of black.*
- Level select stars no longer overlap. *Was: 54px stars sitting 33px apart, so you tapped the
  wrong level.*

## WIREWORM `🐛` — snake where your trail is live wire
**Try this:** play normally, then deliberately fill the board and trip the breaker at 55%.
Add `?bot=1&seed=7` to the URL to watch it play itself.
- Cells are now **19.4px**, and the board outweighs the controls 3 to 1.
  *Was: 9px per cell, with the thumb pads taking most of the screen.*
- Completion arpeggios are in C minor pentatonic and scale with circuit length and combo.
- The death screen renders your final board as a saveable card with the seed.
- Both win conditions are real and measured: a board filler outscores a combo chaser per run,
  a chaser scores faster per tick, and you cannot do both.
- **A real soft lock was found and fixed**: the worm could seal itself in a pocket where no
  terminal was reachable and no pickup could spawn, so the run could never end.

## SIEGE OF ONE `🏰` — set traps, then fight beside them
**Try this:** play wave 1 and read THE BRIEFING, then get to wave 10 for the Warden.
- The combat screen is a control room: wave HP, the enemy roster as silhouettes, a live
  **damage share** showing you versus each trap, and your standing traps.
  *Was: about 90% empty black with a 60px band of action at the bottom.*
- THE BRIEFING teaches on the thin early waves and retires itself at wave 9.
- 302 assertions. Scrap has somewhere to go late game, early traps actually matter, and the
  wave 10 lull before the Warden is gone.

---

# PART 2 — THINGS THAT WERE QUIETLY BROKEN ON LIVE GAMES

These are the ones worth testing hardest, because they shipped and nobody knew.

## Games you could not leave
**Try this:** open any game from the arcade and look for the way back.
- **21 of 100 satellites had no way out** except the browser back button, which an installed
  PWA does not have. **All 100 can get home now**: 73 pass outright, 24 via the runtime
  injector, 3 partial, **0 stranded**.
- Every one had the same cause: an exit that only renders when the game is in a frame, and the
  portal does not frame these. Several had a correct exit function that **nothing ever called**.

## Games you could not play
- **Burr Blast**: on a portrait phone with rotation locked you could neither play nor leave. The
  landscape nudge covered everything and its dismiss button called a function that did not exist.
- **Shell Shuffle**: one bad saved value killed the boot, and the Start Game button, which ships
  in the HTML already reading "Start Game", looked perfect and did nothing forever.
- **Garden TD**: the tutorial said "tap to continue" and swallowed the tap. Level 1, every player.
- **Rule Root**: tapping Journey threw and did nothing, silently.
- **Bubblenaut**: reaching room 14 and glancing at your Collection sent you back to room 1.

## Things that lied to you
**Try this:** read a game's own description, then check it does that.
- **The Attic** promised "an object that has never existed before" — 19.42% were exact
  duplicates and TOY had **15 titles total**. Now 3,722 titles, duplicates at 0.56%.
- **Jumping Jimothy**: a comment said rewards "can never be farmed" while every decade capstone
  and the level 50 costume pull **re-paid once per browser session**.
- **Burr Blast**: Potassium promised "a steadier aim guide" and the aim guide never read your
  loadout. Its trajectory line also drew straight through the fort and out the far side.
- **Flipbook**: when a save failed it said older pages may not save. Storage is all or nothing,
  so **nothing** was saved, the warning erased itself after 3 seconds, and nothing was offered.
- **Pong**: the campaign's own ending was a lie.
- **Shell Shuffle**: promised each round "adds a cup, shuffles faster, pays more" while
  difficulty went **completely flat at level 11** and stayed flat forever.
- **Sproing, Zen mode**: the HUD counted coins up and the pause panel printed a total, while
  Zen banks nothing at all. The game stated an earning your wallet never received. Both
  readouts now say *practice*, and mode select says so before you choose.
- **Slice 3D, the Forge**: "each one is pure style and never changes how you play." Blade
  length feeds the reach that every wall contact tests, measured across the catalogue at
  **3.03 to 3.66, a 20.9% spread, with a premium knife at the long end.** The copy is fixed.
  The mechanic deliberately is not, see ⚖ below.
- **Slice 3D, how to play**: promised "no ceiling, the bands keep going" while the ladder is
  34 authored bands topping out at x900, which the end panel then prints back at you.

## Difficulty that was not difficulty
- **Pong's Legend was not a rung.** Ace returned 95.8% of shots, Legend 95.6% — identical
  inside the noise, with no better share of points. Four difficulties and the top two were the
  same. Fixed, and Career 12 still clears.
- **Shell Shuffle** went flat at level 11 forever while still promising more.
- **Power Scalers' ladder was a cliff**: clear rates ran 100%, 99%, then 31%, 6%, 1%, 0%, and
  the first two clears paid 159 XP while level 2 cost 170, so clearing two rungs did not level
  you once. Now every race clears all 12 rungs.

## Two things I found by looking that are NOT fixed ⚖
Left as findings rather than silently restyled, because both are art or layout calls.
- **Petal Plunge shows a keyboard hint on a phone.** "left right carve · down tuck · space =
  trick · P = pause" renders across the middle of the slope at 375x667, telling a touch player
  to press four keys their device does not have.
- **Petal Plunge's in game HUD bleeds through its title screen.** A pause button and two score
  chips are visible, dimmed, along the top edge behind the menu. Same class as The Attic's
  overlay: chrome from one screen showing through another.
- **Blobworks (greenhouse-pinball) draws its shot rails outside the table.** The ramp and orbit paths
  render as bright outlined ribbons over the painted art, crossing above the rollovers onto the
  slate, and at the bottom running off the playfield across the cabinet and the corner screws.
  This is not a debug overlay; it is what a player sees.

## Things that lost your stuff
- **Aura Farm**: the ending could be replayed **indefinitely**, re-paying 8 Sunbeams each time.
  A corrupt save was a permanent dead end with a button that did nothing forever.
- **LOAF**: the card cap **silently deleted your oldest cat**, and a corrupt save emptied the
  whole collection unrecoverably. The PLAYED bar could never recover in the 3D room, so it sat
  red forever no matter how long you played with her.
- **Create A Critter**: a save could fail silently, so a child saw a happy critter and it was
  simply gone the next day.
- **Two tabs open** used to clobber each other in most games. Fixed fleet wide.

## Hush, the sleep app
- A corrupt save could **defeat the nursery volume cap entirely** while the cap switch still
  drew itself as ON. The sleep timer's fade ran on a timer browsers throttle, so a sleeping
  phone could skip it. A shared preset link was dead on arrival in the default mode.
- **Try this:** set a sleep timer and let it run to zero. Share a preset link and open it.

## Bandit's Box
- **The friction engine went silent under a moving finger on touch**, which is the entire
  product. Any drag over half a second went dead.
- **Try this:** rub a texture slowly for three or four seconds and listen. Two new toys: a rain
  stick and a coin.

## PadLab
- "Show my beat" went stale on every edit, so the ghosts lied. Three of five shelf labels never
  drew. The canvas never resized, so a turned phone put every tap on the wrong cell.
- **New: WAV export of a take.** Wood and Bell marbles.
- **Try this:** make a beat, switch to Marble, hit Show my beat, then rotate the phone.

## Whack Box
- Three ways a room could get stuck: a lobby with no exit, an end that stranded every phone
  forever, and replaying a title that killed the phone while the TV looked fine.
- Departed players were still counted, so one person leaving made the room sit out every clock.
- ⚠️ **It still only works in one browser.** Room state is on BroadcastChannel; the cloud path
  is written and **has never been run**. Real phones need that switched on.

---

# PART 3 — DECISIONS WAITING ON YOU ⚖

None of these were changed. They are taste or economy calls.

1. **Deepwell's upgrade economy.** A full kit earns a *cautious* player only **2% more than no
   kit at all** (an optimal player gets 87%), because the spec's own "turn at 60% air" rule and
   the caution gate cancel each other exactly. Also: 25 runs to full clear is arithmetically
   impossible; the real number is 131.
2. **Dewball's ladder has no top.** **Not one object in the game requires a three star ball**,
   and worlds 3 and 7 need no two star either. The ball roughly doubles after the last new thing
   unlocks. This is the "repetitive endgame" feeling, stated as a number.
3. **Dewball's clocks are ranked backwards in the docs.** World 2 is the tightest in the game at
   **6.4 seconds** of margin, not world 5 at 75. World 2 is where a first timer meets it.
4. **Nectar Drop's daily** promises the same board for everyone but uses unseeded randomness in
   one place.
5. **Whack Box says "You earned sunbeams"** on screen while nothing mints until the cloud is on.
6. **LOAF's need bars** now drain far more slowly (floor 8 → 45). That changes how the bars look
   and is a design call, not a bug fix.
7. **Twin Lanterns: park it, do not cut it.** Its recorded Firestore blocker was wrong. The real
   blocker is that a solver proves the puzzle is only fully solvable on **34 nights in 60**, so
   two nights in five the pair must guess and lose the streak.
8. **Aura Farm's Glean is 5x more focus efficient than harvesting.**
9. **Vinewinder's Start Here slot.** It is a good snake, but it is snake. Worth keeping while
   there are only four candidates; the moment a fifth exists with a verb of its own, rotate it
   to the A to Z wall.
10. **Slice 3D's premium knives are measurably longer.** A 20.9% reach spread, with the longest
    blade being a premium item. A longer blade reaches the climb wall sooner and hits Freefall
    side walls sooner, so whether it is an advantage or a penalty is genuinely open. It was not
    normalised because forcing one length would re-break the August 1 fix for a blade sticking
    while inches away. Your call: leave it, normalise it, or price it as a trade off out loud.
11. **The storefront**, in `incoming/STUDIO-SHELF-AUDIT.md`. The New shelf holds 29 of 118 games
    and 13 of those are dev gated, so a visitor who taps New lands on a row half of which they
    cannot open. Ends with five questions only you can answer.

---

# PART 4 — KNOWN GAPS, STATED PLAINLY

- **Nobody has played any of this on a real phone.** Everything here is verified by assertion
  and by screenshot at 390x844 and 1280x800 in a headless browser. Real touch, real audio and
  real iOS are untested.
- Emoji render as empty boxes in my screenshots. That is a missing font in the test container,
  not a defect in the apps.
- 43 of 101 carded satellites have still never been audited. The tracker is
  `incoming/FLEET-AUDIT-COVERAGE.md` and it recomputes itself from disk so it cannot drift.
- Whack Box's cloud transport, iOS wake lock stage 2, and LOAF's synthesized voice have all
  never been exercised for real.
