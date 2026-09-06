# HANDOFF, FABLE'S REVIEW, the Sep 06 run

**Written by:** Opus, as it built, updated after every phase so that nothing is
lost if this session or this codespace ends.
**For:** Fable, to check the work before Stephen sees it.
**Branch:** `add-sproing-jumper`. Nothing here has been pushed to main.
**Read first:** `HANDOFF-OPUS-NIGHT-SEP05.md` section 5 (the twelve row table,
which carries the DONE marks) and section 6 (the review ritual). This file is the
short way in: what was built, what to run, and what I already know is thin.

---

## FABLE'S REVIEW, 2026-09-06 12:48Z to 13:45Z (under a three hour reset clock)

**All twelve are LIVE on the arcade as of 13:41Z**, beta, in the In development tab
(`localStorage.sws_dev_ok=1` opens them; beta rows never appear on the public shelves
by design, `portal/index.html` line ~1790). Deployed in five pushes to main, each
verified by curl for a marker only the new build has.

**Order that worked:** list and deploy the ten first (13:00Z), then review in passes.
Gerplunk P1 and Updraft P0+P1 were built in the same hour by two fenced background
builders and listed at 13:36Z and 13:41Z.

**Found by PLAYING at 320x568 with real touches, not by any gate:**
1. `.screen{justify-content:center; overflow-y:auto}` in Doohickey, Airworthy,
   Whistlestop, Strata clipped its own top when taller than the phone (the level list
   at 667x375 began 16 px above the edge). Fixed with two auto margin flex items.
2. Swell's first line sat at 50 percent height with pointer events off, invisible to
   the music chip's probe, so the chip parked on the word Hold. Moved to 40 percent.
3. The music chip sat on Airworthy's result card (the card's text tied the gym floor
   at 2) and in the middle of Fathom's cave (every seat tied at 1.2 and the side seats
   were listed first). `music-unlocks.js` changed three ways: panel text 2.5 and panel
   padding 2.2, reseat 1.5/4.5/8 s after any pointerup, bottom row first. Fifteen seats
   re-probed across nine older games. Eight games stamped 20260906c for it.
4. Asterism almanac rows ran the name into the place. Airworthy THROW AGAIN lost a
   letter at 320. Gerplunk's default stone tumbled on the first flick (now the skimmer).

**Verified by my own runs, not by claim:** Whistlestop 12 gates, Strata 7, Airworthy 9,
Gerplunk 6, Updraft 5 (fly flaked once on the tap-is-a-hold race, passed twice alone),
layout gates of the four screen fixed games, lints of all eight restamped games.

**Left thin on purpose:** Wardian's first run hint crosses the jar's soil at 320x568;
nobody has heard Windup's `p0-tine.wav` or Swell's `p0-swell.wav`; Inkswing Double Link;
Gerplunk P2 and P3; Updraft P2 and P3. The Director calls in each plan's section 15 are
all still open.

---

## HOW TO CHECK ANY OF IT, IN FOUR COMMANDS

```
cd satellites/<game>
node tools/check.js            # every gate. It must print ALL GATES PASSED
node sim.js --test             # the rules, no browser
node tools/shots.mjs           # the evidence, re-taken
ls docs/shots/                 # then OPEN them
```

Then break one gate on purpose and watch it go red. Every assertion in every
gate in this run has been watched to fail at least once; the ones that took two
and three attempts are named in each plan's evidence ledger, section 13.

⛔ **Run browser gates ONE AT A TIME.** Two cores, and Chrome is the load.

---

## WHAT IS DONE IN THIS RUN

### Row 6, AIRWORTHY, the whole plan (P0 to P3) plus sections 4, 6 and 10

**What it is:** fold a paper aeroplane through six real creases, throw it across
a gym, watch it porpoise, fix it with the elevator. A wind tunnel that cannot lie
about the field. Two courses, six challenges, medals measured rather than
guessed.

**Nine gates:** `sim` (129 assertions), `lint`, `throw`, `fold`, `tunnel`,
`challenge`, `sound`, `play`, `layout`.

**Check these three things first:**

1. `node test/tunnel.mjs` and read the five lines about the slate against the
   field. The tunnel has no model of its own: it calls the same lift curve the
   aeroplane flies on, and the gate proves it by MEASURING a real flight rather
   than reading a variable.
2. `node test/play.mjs`. One session with nothing but a thumb, cold open to a
   medal on the shelf. It is the only gate that tests the JOINS between rooms.
3. Open `docs/shots/p3-tunnel.png` and `p3-tunnel-stall.png` side by side. Past
   the stall the lift arrow has to collapse and the streaks over the wing have
   to break up.

**Known thin, before you find it yourself:** no painted art at all; nobody has
played it on a phone or HEARD it; a 412 by 915 phone still has a lot of wall on
it; four of the design's six courses are not built (the plan orders them later).

**Two Director calls in `plans/airworthy/HANDOFF-AIRWORTHY.md` section 15:** the
challenges take the throw off the player, and the starting plane needs most of
the elevator slider to settle.

### Row 7, WINDUP, the whole plan (P0 to P3)

**What it is:** a brass and walnut music box. Punch holes in a paper strip, turn
the crank yourself and hear it at the speed your finger cranks, then wrap it as a
gift and send a link.

**Eight gates:** `sim` (119 assertions), `lint`, `tine`, `crank`, `gift`, `pdf`,
`layout`, `wav`.

**⛔ THE FIRST THING: `docs/shots/p0-tine.wav`.** Ten seconds, one middle C, the
C above it, seven notes of Twinkle. Nobody in this build has heard it. The design
says one note has to sound like a memory and no gate can say whether it does.
Tell Stephen to open it before he opens anything else.

**Check these three things first:**

1. `node test/crank.mjs`. The one law of the game is that the strip is the
   clock, and this is what holds it there: a real pointer goes round the hub and
   the paper moves 18.8 eighths against the 18.8 the config asks for.
2. `node test/gift.mjs`. A link is made in one browser and opened in another
   that has never seen the game.
3. Open `docs/shots/p1-box.png`. The plan says if the box reads as a rectangle
   with a circle then the drawing is wrong and nothing else matters. It stopped
   the build twice before it passed.

**Known thin:** nobody has heard it or played it on a phone; nobody has printed a
strip, so the PDF says beta; no painted art, and the three wrapping papers are
the weakest thing to look at and the first thing a gift recipient sees; the auto
play is a per frame tick rather than Swell's lookahead scheduler and will drift
on a slow phone.

**Three Director calls in `plans/windup/HANDOFF-WINDUP.md` section 15**, the
first being to print one strip and lay it on a real Kikkerland strip before the
PDF leaves beta.

### Row 8, INKSWING

**DONE, P0 to P3, and pushed.** Seven gates: `sim` (87 assertions), `lint`,
`fling` (31), `sound` (17), `share` (19), `poster` (16), `layout` (69). The
codespace closed during P3 step 1; nothing was lost, the work in the tree was
green and is committed as `cc432ee8`. Full morning report in
`plans/inkswing/HANDOFF-INKSWING.md` section 15.

**⛔⛔ READ THIS ONE FIRST, IT IS THE MOST USEFUL THING IN THE RUN. The layout
gate's most important assertion had never once been able to fail.** It checked
that no button sits on the paper, over `btnKeep, btnTear, btnUndo, btnFinish`,
and every one of those is `hidden` until a sheet has a throw on it. The gate
never put a throw on one, so it filtered an EMPTY LIST every time and reported
clean. The music chip corner check had the identical hole, and `btnShare` was in
neither list. It was found by opening `docs/shots/p3-sand.png` and seeing UNDO
sitting on the paper while the gate was green. Three real faults were under it:
the sheet ran under the ink rail so the colour chips covered the right third of
every drawing; the sheet hung from the top of its band so a 412 by 915 phone got
three hundred pixels of dead floor; and the four action buttons were four
different widths right aligned into a staircase 224 px tall that stood on the
paper. All three fixed, the gate rewritten to load a drawing and assert the
buttons are showing BEFORE it measures, and watched to fail on the real bug.
**This is worth grepping the other eleven games for**: any assertion whose
subject is conditionally hidden, disabled or unmounted at the moment it is
measured.

**P3 step 4, the Double Link, is NOT built.** The plan made it conditional on
steps 1 to 3 landing early and they did not. Nothing depends on it.

The P2 record, unchanged:

Five gates at P2 were: `sim` (84 assertions), `lint`, `fling`, `sound`, `layout`. Every assertion watched to
fail, and two of the sound ones were REWRITTEN because they passed with the code
under them deleted (they were offline renders that scheduled their own decay and
set their own master gain, so they were tests of the test).

**Check these three first:** `node test/fling.mjs` (a real pointer throws the
bob and the ink that lands is counted off the layers themselves); `node
test/sound.mjs` (a rig set to a fifth hums a fifth, measured out of an
OfflineAudioContext); and open `docs/shots/p2-layers.png`, which is indigo under
oxblood and is what the game is for.

**⛔ ONE FINDING IS ALREADY A DIRECTOR CALL: equal temperament does not close.**
The plan asks for lengths that snap to semitones AND for a 3:2 to close within
half a unit, and those cannot both be had, because an equal tempered fifth is
1.4983 rather than 1.5. A drawing made at the C4 and G4 the sliders offer nearly
closes and then drifts, about a unit after two swings and eleven after eight on
a sheet a thousand units wide. It is arguably the better art (a figure that
closes exactly retraces one line for ever) but it is Stephen's call whether the
sliders should snap to just ratios instead. Both facts are assertions.

Three more things the plan was wrong about, each with numbers in
`satellites/inkswing/docs/DECISIONS.md`: the fling mapping drops the damping
term in the release velocity while its own assertion asks for 1e-6; the closed
form has to use the damped frequency or it does not solve the equation the gate
integrates; and the link's frequency field overflowed sixteen bits at the top of
the slider, so every high pendulum came back at the wrong speed and the drawing
on the other phone was a different drawing.

---

### Row 9, GERPLUNK

**P0 only. P1, P2 and P3 are NOT built.** 126 assertions, every one watched to
fail under a `--over=` CONFIG mutation. `node satellites/gerplunk/tools/check.js`
prints ALL GATES PASSED over one gate, `sim`. There is no page yet: the lint gate
is deliberately NOT wired into check.js because six of its assertions are about a
title screen that P1 has not built, and a suite that is red for work that has not
started teaches a reader to ignore the suite.

**Check these three first.** `node sim.js --stones` (the whole stone table off
one perfect flick, which is where you can see whether the game has a real choice
in it: Heavy Flat trades two skips for the longest leaps and the most distance,
and the granite chunk manages two). `node sim.js --sweep` (it re-derives the
tuned constants from scratch and FAILS if the shipped ones are not in its own
passing set). `node sim.js --throw=12,20,1,skimmer` (every skip's time, distance
and interval, which is the trill).

**⛔ THE PLAN'S COLLISION MODEL WAS WRONG AND IS CORRECTED.** Section 4 of the
plan says `vz = -vz * E0 * lift * flat`, simple restitution, which decays bounce
height on its own ladder independent of the speed the stone still has. Built
exactly that way, a perfect throw spent skips six through ten inside three
hundredths of a second covering fourteen centimetres, every interval pinned to
the 1/120 s timestep floor. Not a trill, the stone falling through the model.
Bocquet, whom Stephen's design note cites BY NAME, has the impulse coming from
lift on the immersed edge. Both interval tables are pasted in the plan's section
13 so you can see the difference rather than take it on trust.

**⛔⛔ AND THE WEBXR SEAM WAS BROKEN THE HOUR IT WAS WRITTEN, WITH EVERY GATE
GREEN.** This is the Inkswing scar again in a new shape and it is the thing worth
carrying. `motionFromSamples` returned the SINE of the throw angle;
`motionFromPose` returned the angle. The identical physical throw arrived as
theta 26.38 from a phone and 21.00 from a headset. The device assertions that
were supposed to guard it checked that the pose path produced a plausible SPEED,
and that two phone WIDTHS agreed with EACH OTHER. Neither ever compared the two
devices TO ONE ANOTHER, which is the one thing a seam is for. Fixed, with an
assertion that walks the same throw down both paths at five angles and requires
the answers to match.

**⛔ Two more probes that could not fail, both found and both fixed:** the headset
throw assertions built their pose stream FROM the constant they were checking, so
`U_HARD_XR` could be set to forty and they still passed; and nothing anywhere
checked that the MAGIC ANGLE was actually the best angle to throw at, which is the
game's entire premise. It is, measured: swept every degree from 10 to 32 over 24
seeds the model peaks at 21 against a MAGIC_DEG of 20, on one clean hill.

**Five Director calls in the plan's section 15**, none blocking, one time
sensitive: the theta mapping re grades every throw and is free only until P2
ships records, so it was taken tonight.

---

### Rows 10 and 12, WHISTLESTOP and STRATA, built by Opus B

**Both DONE P3, and NEITHER has been reviewed by me.** They were built in a
second session on the same tree under `HANDOFF-SPLIT-SEP06.md`; the split gave
each builder disjoint fences and gave me sole ownership of this file and the
spine table, so B recorded everything in its own plans and I am transcribing.
Take its claims as claims until you have run them.

- **Whistlestop**: twelve gates, every one watched to fail, twenty six
  screenshots opened with the Read tool and eleven real faults found in them.
  Morning report in `plans/whistlestop/HANDOFF-WHISTLESTOP.md` section 15, with
  puzzles 3 to 6 designed as data. Its P0 note says four of thirteen mutations
  survived the first run and all four were holes in its own assertions, all four
  rewritten, which is a good sign about the rest.
- **Strata**: seven gates, every one watched to fail. The variety sheet, which is
  the gate a human reads, passed at TWELVE of fifty after failing at nought and
  about four. Combined morning report for both B rows in
  `plans/strata/HANDOFF-STRATA.md` section 15.

### Row 11, UPDRAFT: not started

It was Opus A's row and A did not reach it. The plan is written and ready at
`plans/updraft/HANDOFF-UPDRAFT.md`. Nothing exists in `satellites/updraft/`.

---

## THE FIVE SCARS THIS RUN ADDED, WORTH CARRYING TO THE OTHER GAMES

1. **A gate that takes its coordinates from the thing it is testing cannot see a
   thing in the wrong place.** Windup's gift ribbon end was off the right edge of
   the phone and nobody could have opened the present. Every assertion passed,
   because the gate asked the game where the end was and then tapped there. Ask
   the SCREEN: inside the viewport, room for a thumb, `elementFromPoint`
   agreeing nothing is on top of it.
2. **A gate per room never tests the joins.** Airworthy had eight green gates and
   nothing that walked from the title through the workshop, the tunnel, the gym
   and a challenge to the shelf in one session. Write the one that PLAYS the
   game.
3. **A design hole can pass its own test.** Airworthy's plan asked "does one fold
   take gold on all six challenges"; one fold was taking gold on FIVE and it
   passed. Write the assertion that names the property you actually want.
4. **A count is a proxy for a law, not the law.** "Nothing schedules a note by
   wall time" written as "at most four setTimeouts" went red on correct code the
   moment an exporter needed one. Read what the timers DO.
5. **A tall phone is not a bigger phone.** Both games put their whole subject in
   a band at one end of a 412 by 915 screen. Draw the room closer on a tall
   aspect and centre the subject in what is left.
7. **⛔⛔ A SEAM ASSERTION MUST COMPARE THE TWO PRODUCERS' ANSWERS, NOT EACH
   PRODUCER'S PLAUSIBILITY.** Added 2026-09-06 from Gerplunk. Wherever two inputs
   are supposed to feed one model (a phone and a headset, a bot and a thumb, a
   replay and a live run), the assertion that matters drives the SAME situation
   down BOTH paths and requires the OUTPUTS to match. Checking that each path
   produces something reasonable on its own is what let a phone and a headset
   disagree by five degrees with every gate green.
8. **⛔ A TEST THAT BUILDS ITS INPUT FROM THE CONSTANT IT IS CHECKING IS
   DECORATION.** Same game. The headset assertions scaled their pose stream by
   `CONFIG.U_HARD_XR`, so that constant could be set to any value at all and they
   still passed. Physical facts belong in the test as literals.
9. **⛔ ASSERT THE DESIGN'S PREMISE, not just the mechanism.** Gerplunk is "learn
   the magic angle with your thumb" and nothing checked that the magic angle was
   actually the best angle to throw at. Wherever a game claims to teach a skill,
   there should be an assertion that the skill pays.
6. **⛔⛔ A gate that measures a hidden element measures nothing, and it reports
   PASS.** Added 2026-09-06 from Inkswing. Every `filter(...)` style assertion
   whose subject can be `hidden`, `disabled`, `display:none` or not yet mounted
   at the moment it runs is a candidate: it will quietly return an empty list and
   the suite will go green. The fix is the same everywhere: put the game in the
   state where the thing EXISTS, assert that it exists and how many, and only
   then measure it. Worth one grep across all twelve games.

---

## WHAT I HAVE NOT DONE, ON PURPOSE

- Nothing is deployed. `git push origin add-sproing-jumper:main` is yours, after
  section 6 of the spine.
- No portal rows added. `portal/index.html` is outside every fence I have.
- The four image files outside the fences that came up modified by a shot tool
  re-run in the earlier part of the night were restored to HEAD, not committed.
