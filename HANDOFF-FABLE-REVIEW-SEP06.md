# HANDOFF, FABLE'S REVIEW, the Sep 06 run

**Written by:** Opus, as it built, updated after every phase so that nothing is
lost if this session or this codespace ends.
**For:** Fable, to check the work before Stephen sees it.
**Branch:** `add-sproing-jumper`. Nothing here has been pushed to main.
**Read first:** `HANDOFF-OPUS-NIGHT-SEP05.md` section 5 (the twelve row table,
which carries the DONE marks) and section 6 (the review ritual). This file is the
short way in: what was built, what to run, and what I already know is thin.

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

**In progress. P0, P1 and P2 are done and pushed.** Five gates: `sim` (84
assertions), `lint`, `fling`, `sound`, `layout`. Every assertion watched to
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

---

## WHAT I HAVE NOT DONE, ON PURPOSE

- Nothing is deployed. `git push origin add-sproing-jumper:main` is yours, after
  section 6 of the spine.
- No portal rows added. `portal/index.html` is outside every fence I have.
- The four image files outside the fences that came up modified by a shot tool
  re-run in the earlier part of the night were restored to HEAD, not committed.
