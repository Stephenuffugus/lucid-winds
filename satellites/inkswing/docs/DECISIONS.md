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

**D-P4a (2026-09-07, Opus) — a throw carries a NIB and a MIXED COLOUR, and the link carries
both.** `docs/REFERENCE.md` is the note behind this. Three nibs, fine, medium and broad, and a
hue ring with a depth slider behind a sixth chip on the rail. Two things about the shape are
deliberate. The nib is a SCALE on the speed curve the pen already had rather than a second
stroke engine, and medium is exactly one on both scales, so every drawing made before tonight
redraws to the pixel. The five named inks stay and they stay FIRST on the rail: named colours
with a history are worth more here than a hex field, and a wheel is what you reach for second.

**D-P4b (2026-09-07, Opus) — the link is version 4 and version 3 still opens.** The per throw
byte is the ink index in the low three bits, the nib in the next two, and the top bit set when
three bytes of colour follow. A version 3 sheet opens as the medium nib and the named ink it was
packed with, which is what it was. Somebody already has one of those links.

**D-P4c (2026-09-07, Opus) — a nib is a WETNESS as much as a width, and the measurement found
it.** The sheet is a thousand units drawn into about three hundred pixels, so the whole width
band, 0.6 to 2.4 units, is between a fifth of a pixel and a whole one. Scaling the width alone
moved the ink laid by three tenths of one percent, measured off the layers, and the eye would
never have seen it. `NIB_INK_*` scales the alpha as well, and the broad nib now lays 1.81 times
the ink of the fine one. ⛔ The gate that found this was itself wrong first: it counted TOUCHED
PIXELS and reported the broad nib at 1.00 times the fine one. A count cannot see a width change
that is sub pixel. `INKSWING_TEST.inkMass` sums alpha, which is what a nib changes.

**D-P4d (2026-09-07, Opus) — the depth slider walks the ink family and cannot reach a marker
pen.** A wheel hands a player sixteen million colours and the five named inks were doing a real
job: all dark, all a little desaturated, all of them ink on paper. Depth walks saturation up and
lightness down together, so the pale end is a wash and the deep end is a near black of that hue,
and no point on the slider is fluorescent. Stephen can overturn it with two numbers and it is
worth telling him, because if he wants the fluorescents that is a different game.
⛔ The assertion that guards this COULD NOT FAIL at first: it measured chroma at depth nought and
depth one only, and at the deep end lightness alone caps chroma however saturated the mix is, so
raising the saturation ceiling to 0.95 left it green. A fluorescent is high chroma at MIDDLING
lightness. The sweep walks the depth now.

**D-P4e (2026-09-07, Opus) — every full screen leaves the music chip's corner alone, scrolled to
the end.** Found by the colour sheet's own layout assertion and it was true of the rig, the menu,
the folio and the poster before it: these screens are scrolling columns of full width buttons, so
the last button in the column sat in the bottom left 120 by 120 the fleet keeps for the chip. The
foot padding is 140 px now. The column also centres with an auto MARGIN and never with
justify-content, because centring a scrolling box that way clips the top of a column taller than
the screen with no way to scroll back to it.

**The Twin: two pens on one sheet, each with its own throws.** 2026-09-07,
Director call 31, his "two pendulums running at the same time". The Crossed Pair only sounded like
that; it is one pen on two axes, which is why it read as more than it is. Rig five, unlocked at
twenty kept drawings, two bobs on the beam, each grab throws the one it caught, both draw at once
in whatever ink each was thrown with.
**`axes2`** hangs the second pen from the same two pendulums the other way round, so two identical
flings still draw two different figures. Without it the rig is the Single with a bookkeeping change.
**`penHome`** is the other half, and it came from opening the shot: the first Twin had both pens
swinging about the sheet's centre and the two figures drawn concentrically read as ONE dense knot.
Two pendulums hanging from two points on a beam swing about their own points. A fifth of the sheet
either side of the middle, and the reach clamp takes the offset off the room a pen has.
⛔ **`traceOf` CARRIED THE PEN INTO ITS FIRST SAMPLE AND DROPPED IT FOR EVERY ONE AFTER**, so the
second pen drew the first pen's figure in the second pen's colour. Every sim assertion stayed green
because they all read `posAt` directly, and the screen could not be sampled because the rig is drawn
on top of the drawing and a sample there reads a brass rod. Found by measuring where the ink
actually LANDED, per layer, off the layers themselves (`layerInkSpread`), and that is the assertion
now: the two colours land at least a quarter of a sheet apart.
⛔ **A pen with nothing thrown on it yet was laying a stationary dot** in the fallback ink, which
opened a third layer in a colour nobody chose. Layers are keyed by colour and there are only so
many. ⛔ And the assertion written to catch it FILTERED OUT ANYTHING UNDER FORTY SAMPLES, which is
exactly the size of a dot: an assertion that discards the evidence it is looking for cannot fail.
⛔ **The two bobs first hung 46 screen pixels apart** with one grab radius at 44, so a finger
between them took whichever was nearer by a pixel. And pen zero's pivot stayed in the middle of the
beam while its bob hung to the left, so one rod came down at an angle and the other straight and the
rig read as one bent thing. Both found by opening the shot.
⛔ **Three more counts that were numbers rather than laws:** four rigs in the rack, an unlock ladder
written out as three comparisons by name, and a layout gate that counted four cards at three widths.
All three went red over a game that was working perfectly.
**The share link is version 5 only when a sheet actually uses the second pen**, with the pen index
in bit 3 of a flag byte that had it free, so every drawing made before tonight still writes a
version 4 link that an older build opens.

## 2026-09-08, Fable's builder: his 13 and his 17

**UNDO is the last throw, not the last colour.** `undoLayer` popped the last colour canvas and
every throw of that colour: a one ink drawing is one layer, so UNDO emptied it, and irongall,
oxblood, irongall lost the MIDDLE throw. A sheet is its throw list, so undo is `undoThrow` in the
SIM block (pop) and a rebuild of the layers from what is left; a colour whose last throw went gets
no layer back because `redrawAll` only opens a layer for ink it lays. The toast says "That throw is
off". The old gate pressed UNDO only after a second ink, the one case where colour and throw
coincide, so it was green over the fault for two days.

**The fling is inverted through the rig's own table.** `flingToThrow` fed the throw's x to pendulum
0 and y to pendulum 1 on every rig, which is the Single and nothing else: the Crossed Pair mirrored
every release top to bottom, the Gimbal put every slow release on the sheet's midline (hangs pen x
AND y from pendulum 0, a quarter turn apart), and the Twin's second pen was crossed and both its
pens were measured from the sheet's centre rather than from where they hang. Now a pendulum that
drives an axis a quarter turn on (the circle) is fixed by that axis alone, every other pendulum
takes what is left on the axis it drives, and the release is measured from `penHome`. Old links
store terms, so nothing already drawn changes.
⛔ **The Gimbal cannot start a rest release at the paper's corner, in any mapping.** Its first
pendulum swings a CIRCLE, and a circle through a corner 565 units down is 565 wide against a room
of 460 either side of the middle, before the paper pendulum adds its own swing to cancel the
circle's tangential speed at the release (reach 1144). The reach law ("the arm cannot swing wider
than the table") scales that throw to 40 percent along the line to the thumb. So at the extreme
corner the pen still starts short of the thumb, now ON the line to it rather than on the midline;
half way to the corner it starts under the thumb. The region a Gimbal rest release fits without
scaling is a lens about 920 wide and 550 tall on a paper 1000 by 1250. Making the bob refuse to be
dragged past that lens (so the skip happens under the thumb, before the release, instead of after)
is a feel change and Stephen's call; the gates state the law as it is.
**Side finding fixed:** `release()` measured reach from the sheet's centre, so a tap on a resting
Twin bob (which rests 180 units out) was a throw. Reach is measured from `penHome` now.

**D-B2a (2026-09-14, Opus) — a rig card on a drawn sheet warns before it clears (call 59's cheap
half).** Switching rig empties the sheet by structure: the rig belongs to the sheet and a link carries
one rig byte, so old throws cannot survive under new axes. Until now one tap on any rig card, the one
already chosen included, emptied a drawn sheet with no word. Fable's call was "a this clears the sheet
toast before the clear regardless". A toast shown at the moment of an instant clear arrives after the
drawing is gone, so the warning is a step: the first tap on a sheet with throws on it keeps the rig and
every throw and toasts "This clears the sheet. Tap it again." for three seconds (`RIG_ARM_MS`); the same
card again inside that time clears and switches, as before. An empty sheet has nothing to lose and
switches on the first tap. Mixed rigs on one sheet (link version 6) are NOT built: they change what a
sheet is and the link format, which is his.
Two gates moved with it. `test/fling.mjs` pressed the Double Link card once on a sheet still holding the
tilt test's ink; it now presses through the touchscreen at the card's centre (never `el.click()`) and
holds all three halves (warned and kept, cleared on the second press, an empty sheet switching at once).
Watched red against the committed page: "on a drawn sheet one press on another rig keeps the rig and all
1 throws and says so first (rig double, 0 throws, toast "")". And the lint copy law read toasts with
`/toast\('([^']*)'\)/`, which cannot see a toast that also says how long it stays, so the new line would
have been outside the no dash law; the pattern now allows a second argument. Watched: an em dash planted
in the two argument toast is caught by the new lint ("This clears the sheet—tap it again.") and passed
by the old one (LINT OK, 91 strings).

**D-B2b (2026-09-14, Opus) — call 67, clip instead of shrink at the Gimbal's corner, is NOT built: the
shrink is what keeps a shared drawing the same drawing on the other phone.** Built in the tree and
measured, then taken back out. What was done: `flingToThrow` without the room scaling (every rig) and
without the Double Link's second pass, the poster's stroke loop and the live sand clipped to the paper,
the two sim laws that stated the shrink restated as laws against it, the fling gate's corner law as "the
Gimbal pen starts under the thumb in the corner too", and a poster law that no ink lands on the margin.
The restated laws were watched red on the committed SIM (the shrink): "no corner release is scaled back
... 16 of 48 scaled, 32 exact", "reaches past the paper across (917 of 1000)", "or down it (895 of 1250)".
What stopped it, on the live tree, `node sim.js --test`, 142 of 144:
- **"and the pen is in the same place on the other phone (worst 2.600 units of a thousand)"**, a law
  that allows 1.5. Two hundred random sheets packed into a link and unpacked put the pen 2.6 units from
  where it was. The link stores each pendulum's frequency at a sixth of a thousandth, and that rounding
  grows with the amplitude over thirty seconds; unshrunk throws are up to about two and a half times
  wider, so a drawing shared by link would come back visibly different in a long swing. Holding the
  law means a finer link (a version 6), which Fable's own call 59 names as a format change and his.
  Loosening the 1.5 is weakening a gate.
- **"the pen never leaves the sheet, even thrown as hard as a hand can on a unison (1138 by 1115 of a
  sheet 1000 by 1250)"**, the Double Link, which the call accepted as a figure running off the paper,
  but which also says the rig screen and the bob were never drawn for a pen past the paper.
Why not built: the half day the call priced did not include the link, and the link is the saved record
of every drawing anyone sends. The attempt is kept as a patch in the session scratchpad
(`ink67-attempt.diff`), not in the repo. For Stephen: keep the shrink (the figure always fits, the corner
start is 40 percent of the way out), or clip with a version 6 link at finer frequency (about a day, and
every new link gets longer). The drag lens the Sep 08 review proposed (the bob refuses to be dragged past
where the arm can start it) is the third way and changes nothing stored.

**D-B2c (2026-09-15, Opus) — call 60, the throw strip: a row of chips under the paper, HIGHLIGHT and
REMOVE, and the palette does NOT fold into it yet.** Fable's call: "build the strip with highlight and
remove, and let the palette fold into it"; "adjust" needs Stephen's word.
- **Where.** One 48 px chip per throw, numbered, in its own ink, with a dot for its nib (and a dashed edge
  for a Twin's second pen), in a row the paper's own width, 4 px under its foot. `fitCanvas` keeps 56 px
  for the row above the actions (120 px up) or the lying rail (180 px up). Measured before building, the
  band under a centred paper was 46 px at 320 by 568 and 57 to 97 on every other phone, so where the row
  does not fit the paper moves UP into the slack above it and shrinks only if that is still not enough.
  ⛔ The floor is the action block's MEASURED top with a drawn sheet's four buttons up (`actReserve`), not
  the 120 px the #act comment counts: KEEP is a 56 px button and TEAR OFF wraps at 320, so the first build's
  row sat on UNDO and TEAR OFF there (the layout gate: "btnTear top 430, btnUndo top 430" against a row
  ending at 444). At 320 the paper therefore moves up into all its slack and gives up a little height too
  (the exact size is in the plan's ledger, from the shot log); at 375 and 412 it keeps its size. The row
  scrolls sideways from its start and is never centred.
- **What a throw is on the paper.** The throws on a pen ADD (`posAt` sums them), so a throw is not a
  figure of its own: the ink laid between its moment and the next throw on its pen is in its ink and nib
  (`throwAt`). HIGHLIGHT lights exactly that stretch of the whole drawing (`stretchOf`, in the SIM), over a
  veil in the paper's colour, on a temporary canvas; tracing the throw alone would draw a figure that is
  nowhere on the sheet. A pick is refused while the pen is down and drops itself when the throw it named
  is no longer that throw (a new throw, a new sheet, another screen).
- **REMOVE is a filter** (`removeThrow`, a new list, never a splice): the drawing is redrawn as if that
  throw was never thrown, so every later stretch of its pen follows another path. It asks once, SURE, the
  way TEAR OFF does, because a middle throw has no UNDO; then "That throw is off", as UNDO says.
- **Two faults found reading the code, fixed with it.** `keepSheet` kept the sheet's throw list BY
  REFERENCE, so an UNDO (or a REMOVE) after KEEP took the throw off the kept drawing too and the next save
  wrote it that way; it keeps a copy now. And `redrawAll` returned before clearing the loose sand grains
  when the list was empty, so taking the only pour off a tray left its grains on the table.
- **Not built, and why.** The palette folding into the strip: call 28 wants the same band for the sheet,
  the row now fits every phone without it, and folding the ink rail changes the sheet screen Stephen uses
  every throw, so it is his with call 28. "Adjust" (a colour or nib after the fact): his word, per the call.
- **Watched red, each in a scratch copy, each anchor asserted to match once.** The SIM (`sim.js --test`,
  154 laws): `removeThrow` as a splice, "and it builds a new list, so anything holding the old one still
  has all three (2)"; `stretchOf` ignoring the pen, "on the Twin a throw on the other pen does not cut a
  stretch short (pen 0, 0 to 3)"; the tie rule dropped, "two throws at one moment on one pen ... (4 to 94;
  4 to 94)". The page, against the committed page with no strip: fling 14 laws red by name ("the strip
  carries one chip per throw ... (no strip)"), layout 24. The folio holding the list by reference: "KEEP
  then UNDO takes the last throw off the sheet and not off the kept drawing (4 kept, then 3 on the sheet
  and 3 kept)". The sand reset behind the early return: "(2500 grains to 2500 ...)". No row kept for the
  strip: at 320 "and it keeps out of the bottom left 120 by 120 (left 14, bottom 454 of 568)". The floor a
  flat 120 px: at 320 "no action button or ink chip overlaps it (strip 396 to 444): btnTear top 430,
  btnUndo top 430". The highlight traced from the throw alone: "(2990 lit pixels, 8 percent on the oxblood
  layer against 64 on the irongall)", where the highlight as built reads 100 against 56.
- **A fault only the shot saw, and the law that sees it now.** With every gate green, the 320 shot had the
  rig's pivot and the top of its arm under HIDE RIG: where the strip's row did not fit, the first fallback
  shrank the box's HEIGHT, but at 320 the WIDTH binds, so the paper kept its size and was pulled up to 82
  px, past the band the chrome and the pivot live in. The pivot hangs `RIG_DROP` (44) px above the paper's
  top and the top chrome row ends near 66 px at 320 (the rig name wraps), so the paper's top now stays at
  or below the chrome's measured foot plus that drop plus 8 px for the pivot's ball, and where that leaves
  too little room the paper shrinks into it. That costs the drawing some size at 320 only; keeping the strip
  there over a slightly smaller drawing is the builder's choice, logged as the answer to "what 320 does".
  Layout law: every rod's pivot (`pivots()`, from the same `pivotXOf` and `pivotY` drawRig uses) is clear of
  every top button's box, at all three sizes.
- **Two of my own laws were wrong on the first run and were restated, not loosened.** The highlight law
  asked for three times as much ink on its own layer as on a neighbour's, a guess; it is now the measured
  comparison (own over neighbour). The scroll law assumed seven chips overflow every phone, but seven need
  372 px and the strip at 412 is 384; it now loads nine (480 px) and asserts the premise.
