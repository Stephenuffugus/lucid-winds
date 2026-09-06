# INKSWING, the calls made while building it

## P0, the motion

- **⛔ THE SLIDERS ARE EQUAL TEMPERED, SO NOTHING EVER CLOSES EXACTLY.** The plan
  asks for lengths that snap to semitones and for a 3:2 to close within half a
  unit, and those two cannot both be had: an equal tempered fifth is 1.4983, not
  1.5. A drawing made at C4 and G4 nearly closes and then drifts, about a unit
  after two swings and eleven after eight, on a sheet a thousand units wide. That
  is not a bug in the maths, it is what an instrument tuned to a piano does, and
  it is arguably the better art, because a figure that closes exactly retraces
  one line for ever while a drifting one fills in. Both facts are asserted: just
  ratios close, and the ratios a player can actually choose drift. **It is a
  Director call and it is in the morning report.**
- **The plan's fling mapping drops the damping.** With `x = A e^-dt sin(wt+phi)`,
  `x'(0)` is `A(w cos phi - d sin phi)`, not `A w cos phi`, so
  `phi = atan2(x0 w, v0)` reproduces the release velocity out by `d` times `x0`,
  which is about two units a second on a hard throw. The plan's own assertion
  asks for the round trip inside 1e-6. The damping is carried, and the round trip
  is exact to nine decimal places.
- **The closed form has to solve the equation the gate integrates.** The damped
  oscillator `x'' = -w^2 x - 2 d x'` oscillates at `sqrt(w^2 - d^2)`, so a closed
  form written with `w` in the sine drifts a tenth of a unit away from the
  integrator over sixty seconds. It uses the damped frequency and the gap is
  under a millionth of a unit.
- **The verification integrates with RK4, not with Euler.** At 1000 Hz forward
  Euler's own error on this oscillator is six tenths of a unit over sixty
  seconds, so a gate built on it would have been measuring the integrator rather
  than the model.
- **A throw is stored in the link as its FLING, not as its terms**, so a link can
  never describe a swing the rig could not have produced.
- **⛔ The link's frequency field overflowed at eight thousand.** The top of the
  slider is two octaves above C3, a `w` of 9.6, and 9.6 times eight thousand is
  over sixteen bits: every high pendulum came back at 8.19 and the drawing on the
  other phone was a different drawing. Six thousand fits the whole range.
- **The ratio assertions throw the pendulum rather than dropping it.** Released
  from rest both axes sit at the top of their sine where the slope is zero, so a
  phase error of a tenth of a radian moves the pen a unit and a half and an off
  ratio looks closed.
- **A brass bob rings for ten minutes.** At the ninety second drawing limit the
  swing is down to a third of what it started at, which is the spiral tightening.
  An assertion that wanted it still after five minutes was wanting a felt bob.

## P1, the throw you can watch

- **⛔ THE FEEL TEST WAS ABOUT THE LINE, AND THE FIRST LINE FAILED IT.** Linear in
  speed and at a flat alpha of nine tenths, every loop came out the same weight
  and the middle of the drawing, where the pen is slowest and the loops crowd,
  went solid black. A pen leaves a pale hair when it is whipped across the paper
  and a dark wet mark where it turns around, and at two thirds of a pixel to the
  sheet unit that difference has to be carried by width AND alpha, both on a
  curve, with the dark end capped so crossings build tone instead of saturating.
- **The layers are at SCREEN resolution, not at sheet resolution.** A layer the
  size of the poster is twenty megabytes and there can be four of them. The
  poster re renders from the throw list, which is the whole point of the throw
  list, and so does a resize.
- **The release velocity is the last sixty milliseconds, not the last two
  samples.** A finger that pauses for one frame before letting go would
  otherwise throw the pendulum with no speed at all.
- **A tear off takes two presses.** A drawing somebody spent a minute on must not
  be one tap from gone.
- **A new sheet gets a new number.** Numbered off the folio, two torn sheets in a
  row had the same id until something was kept.
- **`inked()` reports an estimate, not a sample count.** It samples every
  seventeenth pixel, and returned raw it reads as a pixel count seventeen times
  too small: a gate written against it asked for a drawing and accepted a dot.

## P2, the rigs and the sound

- **The sound engine is built on a context it is handed**, never on one it
  reaches for, which is the only reason `test/sound.mjs` can render the hum into
  an `OfflineAudioContext` and measure what an ear would get.
- **⛔ TWO OF THE SOUND ASSERTIONS WERE TESTS OF THE TEST.** Written as offline
  renders that scheduled their own decay and set their own master to zero, they
  both passed with the page's fade and the page's sound toggle deleted. They go
  through the game now: the hum has to fade because `soundTick` faded it, and the
  silence has to come from the menu toggle.
- **The hum is very slightly off a perfect fifth, on purpose.** The two
  pendulums are detuned by their own swing, so a rig set to a fifth hums 1.5055
  rather than 1.5. It is inside the one percent the plan asks for and it is the
  same physics that makes the drawing precess.
- **No button sits on the paper.** Three of them stack in the bottom right and at
  ninety six pixels of clearance UNDO sat on the drawing, which is the one thing
  on the screen a player is looking at.
- **A count of inked pixels is a measure of the LAYOUT as much as of the
  drawing.** Making room under the sheet for the buttons shrank every layer and
  every gate written against a raw pixel count went red on a drawing that was
  perfectly fine. They ask for a fraction of the sheet now.
- **The shot tool empties the first boot hint rather than watching for it.** A
  MutationObserver that removes the class the observer watches is a loop, and it
  hung the render thread until the tool timed out.

## P3 step 4, the Double Link (2026-09-06, the afternoon builder)

- **Rig 4 is integrated, not solved, and it is deterministic.** Two coupled
  damped links, linearised, at a fixed 240 Hz step, one Float64 trajectory per
  throw cached by the throw's numbers, so `posAt` stays a lookup with linear
  interpolation and `traceOf` did not change. No seeded stream is needed: the
  model has no dice in it.
- **Runge Kutta, not the plan's semi implicit Euler.** Measured, not argued: the
  plan's own limit assertion (the single link limit inside 0.05 units over
  twenty seconds) was run with symplectic Euler at 240 Hz in the integrator's
  place and missed by 3.0 units at C4 and 6.8 at C5, the first order method's
  amplitude wobble of w h / 2. Fourth order at the same step lands inside 0.002.
- **The hand holds the pen, not the chain.** Started with both links straight
  along the pull, the rig drew the Single's ellipses with a wobble nobody could
  see (opened in `docs/shots/p3-double.png`, first cut). The release now puts
  the chain in its own rest shape under a sideways pull: the first bob at
  w2^2 / (w2^2 + 2 w1^2) of the pull, which excites the second mode from the
  first swing.
- **The reach is read off the trajectory.** Link 2 can be pumped by link 1 to
  well past where it was let go, so the sum of two amplitudes is not the reach;
  the trajectory is integrated once, its widest point measured, and (the system
  being linear) the throw is scaled back onto the sheet in one pass. One throw
  at a time: two throws still swinging add on every rig, and that is layering.
- **Its terms are both link 1.** The link packs A, phi and wEff per pendulum;
  on this rig pend[0] and pend[1] are link 1's x and y terms and link 2 takes
  its note from `lengths[1]`, which the link also carries. A throw that came in
  over a link has no release stored and `releaseOf` derives it from the terms;
  the assertion holds the two drawings inside 1.5 units.
- **The hum's second voice is link 2's note**, read from `lengths[1]`, since
  both terms are link 1 and would otherwise hum a unison.
- **The rig list counts the folio when it is opened.** Filled any way but by the
  keep button (the gate, a sheet kept off a link) the count was stale.

**2026-09-06 (Opus) — on a tall phone the ink rail lies down, and the drawing gets the width.**
The sheet is 1000 by 1250, so on a 412 by 915 screen the WIDTH binds: with a column of five
48 px colour chips pinned to the right edge, the drawing came out 322 by 400 with two
hundred and eighty pixels of dead ground beneath it. Measured, not guessed. At 800 px tall
or more the rail becomes a row under the sheet and the layout maths gives back the 58 px it
reserved, so the sheet is 384 wide, a fifth more drawing on the phone Stephen carries.
Under 800 tall the column stays, because a short phone has no height to spend. Checked at
412, 375 and 320: five chips, none under 48 px, none covered by anything, the bottom left
120 by 120 still clear for the fleet's music chip, and the layout gate green at all three.
