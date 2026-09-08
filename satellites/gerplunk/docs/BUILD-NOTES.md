# GERPLUNK, build notes

**What it is:** a lake at golden hour, a stone in your hand, and one flick.
Angle, speed and spin decide the skips, a slow thumb turns the shore, and you
count the skips by ear. No clock anywhere and nothing that ticks against you.

**Built:** 2026-09-06 and 2026-09-07, P0 through P4 step 1, by Opus and Fable
against `plans/gerplunk/HANDOFF-GERPLUNK.md`. Every choice the plan was silent
or wrong about is in `docs/DECISIONS.md` as D1 to D44, with the measurement that
forced it. `docs/THROW-REFERENCE.md` is the research note behind the spin bank
and it is written for Stephen to read.

---

## The two laws

**1. The model is the only author of the picture.** `runThrow(th, {trace:true})`
records every step at 120 Hz and the page walks that trace by wall clock, so
there is no second physics at frame rate to drift away from the count (D25). The
ticks and the plunk are scheduled from the events' own times at the moment of
release, never at frame time. The seam of calm water is a real `runThrow` of a
nominal good throw down the line you are aiming, so it cannot lie about the wind
because it is the wind (D27, D28). The share card's arc is the recorded position
of every skip (D38). The number on the post, the number of ticks you hear and the
shape of the throw in the picture are the same numbers, and they cannot disagree.

**2. The seam between a device and the model is `MOTION`, and it is the only
thing that crosses.** A device produces a MOTION, `throwFromMotion` turns a
MOTION into a THROW of `{v m/s, theta degrees, spin, yaw degrees, stone, seed}`,
and the model only ever sees a THROW. Nothing in that tuple is a pixel and
nothing in it is a screen. `motionFromSamples` is the phone, `motionFromPose` is
the headset and is written and asserted even though nothing calls it (D10). That
is the whole WebXR preparation and it cost nothing at the time.

## The files

```
index.html      the whole game, one file, no framework and no build step
sim.js          --test  --throw  --stones  --sweep  [--over=KEY=VAL]
sw.js  manifest.webmanifest  icon-192  icon-512  icon-maskable-512
tools/check.js  the one command. It must print ALL GATES PASSED
tools/lint.mjs  tools/icons.mjs  tools/thumb.mjs  tools/shots.mjs
test/harness.mjs  flick  layout  audio  daily
docs/DECISIONS.md  docs/THROW-REFERENCE.md  docs/shots/  docs/thumb.png
```

`SIM_EXPORT_START` and `SIM_EXPORT_END` wrap CONFIG through FLICK, and `sim.js`
reads the rules out through those markers, so the headless runner, the sweep and
the thumb play the same game as the thumb on the glass. Nothing inside the
markers touches a clock, a document, a window or an unseeded die.

## The seven gates

`node tools/check.js` runs them in this order. The browser gates are SKIPPED with
a note when puppeteer is absent, never failed, because a gate that fails for want
of a dependency teaches you to ignore gates.

| gate | what it actually binds |
|---|---|
| `lint` | the script block parses through `vm.createScript`, nothing loaded at run time is a `.mjs`, every local asset carries a `?v=` stamp, one stamp in three places, no dash and no exclamation point in anything a player reads, the brand is Sky Wolf Studio singular, no `shadowBlur`, no CSS font under 0.7 rem and no canvas font under 11.2 px |
| `sim` | the rules, 178 assertions at the last run recorded in the plan, over rng, stones, bed, faces, daily, window, skips, trill, mass, water, flick, determinism and copy |
| `sweep` | walks the constant grid and reports every point that satisfies all seven P0 assertions at once, and FAILS if the shipped constants are not in its own passing set |
| `flick` | 47 checks driven by real pointer events on the real canvas: a real stroke throws, the tally grows to the model's count, one tick per skip, a slow push turns the lake and a fast one never does, the wind up banks spin, the ring is painted |
| `layout` | every button on every screen at 375x667, 320x568 and 412x915, measured as a rectangle AND found by `elementFromPoint` at its centre AND inside the viewport, plus the music chip's 120x120 seat, the point's skyline and the stone in the palm, all three read off the canvas |
| `audio` | the ticks counted in the SOUND, rendered into an offline context and read back as onsets, including the seventeen skip trill that closes to 67 ms and must still be seventeen ticks |
| `daily` | five real flicks fill five throws, the card comes up on its own, and a `#d=` link opens in a SECOND browser with its own profile and shows the sender's five |

## The scars

**⛔ The plan's collision model was wrong, and the gate that caught it was the
one that measured intervals.** A restitution ladder collapses bounce height
independently of speed, so skips six through ten landed inside three hundredths
of a second with every interval pinned to the timestep floor: the stone was
falling through the model, not skipping. The impulse is lift on the immersed
edge, per Bocquet, whom the design note cites by name, and then the trill emerges
on its own. There is an assertion that no interval is ever within 2.5 timesteps
of the floor, so it cannot silently come back (D1).

**⛔ The joke stone needed a constant the plan did not have.** Across a 768 point
sweep, "the granite chunk never beats four skips" was the only assertion no
combination of the plan's constants could satisfy, because everything generous
enough to give Heavy Flat its long leaps handed the chunk thirteen skips. A chunk
does not fail because it presents little plate, it fails because it presents a
DIFFERENT plate every time it touches, so the angle noise scales with
irregularity (D5).

**⛔ The tuned constants are a measurement, and the sweep is what keeps them
honest.** `node sim.js --sweep` fails if the shipped numbers are not in its own
passing set, which caught a real error the same day: `IRREG` was still 6 in
CONFIG while a comment claimed it had been measured at 28 (D8).

**⛔⛔ The WebXR seam rotted the hour it was written and every gate was green.**
The phone returned the sine of the throw angle and the headset returned the
angle, so the identical physical throw arrived as theta 26.38 from a phone and
21.00 from a headset. The device assertions checked that the pose path produced a
plausible speed and that two phone widths agreed with each other. Neither ever
compared the two devices to one another, which is the one thing a seam is for
(D21).

**⛔ Two probes that could not fail.** The headset throw assertions built their
pose stream FROM `CONFIG.U_HARD_XR`, so the constant could have been forty and
they would still have passed. They use the physical numbers written out literally
now, because those are facts about arms rather than about this game (D24). And
with ordering assertions alone, `CURL_REF` could have been a hundred thousand and
the glass unit wrong by a factor of two: monotonicity says the axis points the
right way, it never says the axis is worth using (D16).

**⛔ The test's stroke generator was wrong twice before the game was.** Its hook
displaced along a screen axis rather than perpendicular to the stroke, so a left
hook shortened the path and a right one lengthened it and the game looked wildly
asymmetric when it was not; and it did not normalise arc length, so hooking
harder secretly made the stroke faster (D17).

**⛔ A gate asserted the opposite of the design and the game was right.** The
first draft of `test/flick.mjs` required a 60 px push over 300 ms to leave the
lake where it was. A slow sideways slide IS the plant, and the turn surviving a
set down is the whole reason changing your mind is free. The gate was rewritten
to say what the design says (D31).

**⛔ `.btn{display:block}` beat the `hidden` attribute, and the gate read the
attribute.** THROW YOURS showed on the sender's own card and SHARE on the
recipient's. The eye caught it on a shot. The CSS now has `.btn[hidden]{display:
none}` and the dev hook reports computed display, so a gate can fail on it.

**⛔⛔ The sound was a smoke detector, and the audio gate could not hear it
because it never rendered the bed.** Stephen's words were that the effects made
everyone in his house flinch. The cricket's trill oscillator, amplitude one
through a gain of 0.5, was wired straight into an envelope gain whose own value
was 0.022, so the chirp swung between minus 0.48 and plus 0.52: a half scale
4 kHz sine chopped at thirty hertz, for ever, on the band where a phone speaker
is loudest. `renderAmbience(seed, seconds)` now renders the bed offline through
the same functions and reports peak, rms and the share of energy above 3 kHz. The
old wiring put back measures peak 0.216 and 28 percent; the real code measures
0.028 and 1.4 percent; the old cricket's PITCH put back at the new level stays
green at 9.9 percent, which is the point, the pitch was never the fault.

**⛔ The plunk buried the last tick of the trill,** because the model ends a slow
throw at the instant of its final skip and the page scheduled the sink there. The
audio gate heard seventeen onsets for seventeen skips and a plunk. A stone that
has stopped skipping bobs once and goes under, so a slow ending gets 120 ms in
the sound and in the picture. The model is untouched (D34).

**⛔ A gate's gesture is not the gesture it intended.** The end to end version of
"the wind up does not swing the shore" flaked one run in three: on two cores the
arm's dispatch stretches, a 13 ms step becomes 60, and at 24 px that is 410 px
per second, under the game's own `TURN_FADE_LO`, so the game correctly read the
first inch of the flick as a slow hand and turned the lake. The assertion was
measuring the driver's timers. It is taken now with the circle closed and the
thumb still down, inside the same touch, and the end to end form lives in the sim
where the clock is exact.

**⛔ And a release that came out slow is not a control.** The control throw
silently read as a set down, `lastThrow()` returned the PREVIOUS throw, and the
gate reported the wound throw's spin as the control's and went green. It watches
the throw count and throws again now rather than believing it, and it reported
two attempts on the very next run, so the flake was real.

**⛔ I nearly shipped a comment claiming a fault I had not verified.** The readout
line sits on the water where a thumb throws from and it was written up as having
eaten the touch. The mutation disproved it: `#hud` is already
`pointer-events:none` and only buttons and stones are auto. The comment is
corrected in both files and the assertion is kept, because that guarantee belongs
to the readout rather than to its parent.

**⛔ Three probes for the land and the hand were wrong before they were right**
(D44). The trees vanished at distance, six hundred pixels of skyline drew as a
ruled line, and the gate correctly measured a deviation of nothing; the palm
probe counted warm pixels in a box and was measuring the sun's road on the water,
273 with the stone in hand against 258 without, so what it measures now is the
longest unbroken run of stone coloured pixels down the middle of the palm, 46
against 3; and that probe's threshold was chosen rather than read, at a red floor
of 90 when the middle of the stone reads 78, 61, 40 on the canvas.

**⛔ One assertion was deleted for being decoration.** With the trees the point's
skyline steps 30, 28 and 23 times at the three sizes and without them 20, 21 and
19: at 320 the two bands are one apart, so a floor there would go red on a slow
frame and never on a real regression. Only `turns`, how often the skyline changes
DIRECTION, separates cleanly, 8 to 10 wooded against 4 ruled, because a diagonal
steps on its own and never turns.

**⛔ The A7 land law was green over the wedge it was written to forbid** (2026-09-08,
D46). `landEdge` finds the first dark run under the horizon by a luminance floor, and
right of the point's tip that run is deep water, so its `turns` counted the water's
edge against the wedge's and read eight to ten over a ruled diagonal. The differential
(`landInk`, one instant with and without the land) reads the same wedge at 0.0 to 0.7
turns per hundred pixels. The spit itself was the geometry's fault: hung off the far
shore it is a strip across the water at every lee stance, which is what "it almost
looks like it's a bridge" was. It hangs off the player's shore now, and the fresh
stance is straight ahead with the point fifteen degrees off it.

**⛔ The first spin ring said something the bank had not earned.** The fill had a
tenth of a turn added as a floor, so 0.71 of a bank read as nearly full; the track
behind it was at 0.16 alpha, so there was nothing to read the fraction against;
and a cream arc laid across the pale band where the sun's reflection meets the
black headland lost half of itself. The ring carries its own dark ground now, and
the sweep is the bank with no floor (D41). It is proved by reading the canvas
under the thumb rather than by reading `G.spin`, because a gate that watches the
number would pass over a ring that was never painted (D42).

**⛔ The second spin ring was right and invisible.** 26 to 42 px centred on the
touch is 8 to 13 mm on a Pixel 9, inside the thumb pad, and the fill swept down
toward the thumb's body; the Director could not see it. The gate could not
either, because its annulus had no thumb in it, and the look pass could not,
because the shot had none. It is 70 to 110 px now, outside the pad (D45), the
gate masks a 45 px pad out and wants more than half the circumference painted
beyond it, and `tools/shots.mjs` puts a thumb on `p5-windup-thumb.png` before
the shot is judged. A gauge for a thumb is judged with a thumb on it.

## The traps in the tooling

- **The stamp is in three places** and `lint` checks all three: `var STAMP` at
  `index.html:1522`, the service worker registration, and `SHELL_VERSION` in
  `sw.js`. Bump all three or the shelf serves a stale cache key.
- **The host serves `.mjs` as `text/plain`,** so nothing the page loads at run
  time may be one. Every tool and every gate is `.mjs` and none of them ships.
- **Two cores.** A browser gate that fails inside the suite is rerun ALONE,
  twice, before it is believed. The daily gate wants
  `flock -w 1800 /tmp/sws-gate.lock` in front of it.
- **`sim.js --over=KEY=VAL` is a source level substitution** on a copy, not a
  mutation, because CONFIG is frozen on purpose, and it throws on a key it cannot
  find so a typo can never silently measure the shipped numbers and call them
  tuned.
- **⛔ CONFIG carries `DAILY_THROWS` twice,** at `index.html:304` and
  `index.html:314`. Both read 5 and the override regex is global, so nothing is
  wrong today. But the last key in an object literal wins, so an edit to line 304
  alone would be silently discarded and the file would read one way and behave
  another. Delete one before the next tuning pass.
- **`lint` strips comments before it looks for `shadowBlur`,** because the
  sentence "NO shadowBlur anywhere" in a comment made the gate red on code that
  was already correct, and a gate that cries on clean code is ignored as surely
  as one that never fires. Its canvas font check prints a NOTE rather than a
  failure for a size it cannot read, for the same reason.
- **The bottom left 120x120 of the lake belongs to the fleet's music chip.**
  Nothing of Gerplunk's may sit in it. The palm is at the right edge for exactly
  this reason.
- **`_play` is not a launcher anywhere in this fleet.** It is the sound effect
  player. Games launch through the picker.

## What is not done

- **P4 step 2, the turn.** Waits on Stephen's call 22. It is one number,
  `TURN_DEG_PER_M`, and then `YAW_MAX_DEG` from 25 to 60 with the treeline and
  the far shore drawn over the wider stance. The far shore must not run out, and
  `docs/ART_ASSETS.md` sheet 1 has the arithmetic for how wide it has to be.
- **P4 step 3, more things to skip.** Waits on his list, call 24. Each one is a
  `STONES` row plus a palm case, no art.
- **P4 step 4, more waters.** Waits on call 23, not sized until the turn settles.
- **From the plan's thin list, still open as written there:** the sink rings stack
  into a spring on a straight throw, the folk line can sit across the near rings
  of a short throw, and the shore is drawn by CSS rather than art. The empty palm
  was closed by A7; the flat land A7 claimed was closed by D46 on Sep 08.
- **The three art sheets.** None is wired and the game never waits on them, see
  `docs/ART_ASSETS.md`.
