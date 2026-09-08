# GERPLUNK, decisions

Every place the build plan was silent or wrong, what was chosen instead, and the
measurement that forced it. Smallest reasonable choice, one line of why.

## P0, the physics

**D1. The collision is a LIFT impulse, not a restitution.** The plan's section 4
says `vz = -vz * E0 * lift * flat`. Built exactly that way and measured on
2026-09-06, a perfect skimmer at 12 m/s and the magic angle put skips one and
two 6.7 m apart and then spent skips six through ten inside three hundredths of
a second, covering fourteen centimetres, with every interval pinned to the
1/120 s timestep floor:

```
   5  t 0.808  x 9.13m  int 0.033s
   6  t 0.817  x 9.19m  int 0.008s
   7  t 0.825  x 9.23m  int 0.008s
   8  t 0.833  x 9.27m  int 0.008s
   9  t 0.842  x 9.31m  int 0.008s
  10  t 0.850  x 9.33m  int 0.008s
```

That is not the pitty pat trill, that is the stone falling through the model:
bounce height on a restitution ladder decays independently of speed and collapses
far faster than the speed does. Bocquet, whom Stephen's design note cites by
name, has the vertical impulse coming from lift on the immersed edge, so it
scales with the speed the stone still has and the angle it presents:
`vz = E0 * vx * sin(theta) * lift * flat * massLift`. The same throw then runs
0.383 s down to 0.067 s across seventeen skips, every interval clear of the
timestep, and the trill emerges on its own exactly as the design note predicts it
will. There is an assertion that no interval is ever within 2.5 timesteps of the
floor, so this cannot silently come back.

**D2. `VZ_MIN` 0.22 m/s, a constant the plan does not have.** A stone that cannot
lift itself clear of the water is not skipping, it is plowing. Without a floor
the model counts contacts that never leave the surface. This is what ends most
common stone throws, and it gives the run a second way to die that is not
"ran out of speed", which reads differently on the shore.

**D3. `RELEASE_Z` 0.35 m, a constant the plan does not have.** The model needs a
height for the stone to leave the hand at. 0.35 m is a low skimming release. Its
one visible consequence is that the FIRST interval is the drop out of the hand
rather than a skip to skip interval, and it is shorter than the second, so the
trill assertion measures the LAST five intervals and never the first.

**D4. The tumble sign is drawn ONCE per throw, not once per skip.** The plan says
`+ DRIFT0_DEG * (1 - spin) * (seeded sign)`. Drawn per skip that is a random walk
and a stone with no spin still gets eight skips; drawn once per throw the plate
pitches the same way every time it touches, which is what a tumble is, and no
spin dies in three the way it does at a real lake. This reading is what makes the
plan's own "no spin, at most 3 skips" assertion achievable.

**D5. `IRREG` 28, a constant the plan does not have, and it is what makes the
joke stone a joke.** The granite chunk was supposed to be stopped by a narrow
angle window and by low flatness. It was not: across a 768 point sweep, "the
granite chunk never beats four skips" was the ONLY assertion no combination of
the plan's constants could satisfy, because every setting generous enough to give
Heavy Flat its long leaps also handed the chunk thirteen skips. The reason is
physical and the plan misses it: a chunk does not fail only because it presents
little plate, it fails because it presents a DIFFERENT plate every time it
touches. There is no consistent face for spin to hold steady. So the angle noise
scales with irregularity, which is `1 - round`. The chunk now tops out at 4.

**D6. The mass lift bonus is gated by flatness.** Heavy Flat and the Granite
Chunk are both heavy, so a mass exponent alone cannot tell them apart. A heavier
stone rides further because it sinks deeper before lift balances its weight and
so wets more of its edge, but a rock with no face has nothing for that deeper
water to push on. The exponent is therefore `MASS_LIFT_P * flat`: Heavy Flat gets
the whole bonus, the chunk gets almost none of it.

**D7. `MASS_LOSS_P` is 0, and that is a result rather than an oversight.** The
plan gave the heavy stone both a slower release and a smaller loss per skip. The
sweep showed the two cancel, so Heavy Flat tied the Perfect Skimmer on count and
the choice between them stopped being a choice. With the loss bonus off, the
slower release and the deeper immersion carry the whole tradeoff. The constant is
kept live rather than deleted so a tuning pass can put it back with `--over`.

**D8. `LOSS0` 0.08 and `SPIN_DECAY` 0.015, against the plan's 0.12 and 0.06.** At
the plan's values a perfect throw reached ten skips and the gate asks for
fifteen. The tuned pair was measured, not chosen: `node sim.js --sweep` walks the
grid and reports every point that satisfies all seven P0 assertions at once. The
sweep is shipped in the tool rather than left in a scratch file, and it FAILS if
the shipped constants are not in its own passing set, which caught a real error
the same day (IRREG was still 6 while a comment claimed it had been measured
at 28).

**D9. The window reading.** The plan says the window is "widened by
`round * ROUND_STAB` and narrowed by the water state" without saying how they
compose. Taken as a single multiplier `k = stab * waterFactor` applied to each
side of the window separately, so the window stays asymmetric about the magic
angle the way `WINDOW_DEG [8, 34]` is.

## Open, and deliberately not decided here

**The aim axis.** The plan's FLICK produces `v, theta, spin` and no yaw at all,
so there is nothing to aim. Stephen asked for a unique aim and flick mechanic on
2026-09-06 and that is a design question, not a smallest reasonable choice, so it
is being decided properly rather than defaulted. The throw tuple already carries
`yaw` so the model does not have to change when the answer lands.

**WebXR.** Stephen named it as a target on 2026-09-06. Nothing ships in a headset
tonight. What is done for it is that `newThrow` is a DEVICE INDEPENDENT tuple:
`{v m/s, theta degrees, spin -1 to 1, yaw degrees, stone, seed}`. Nothing in it
is a pixel and nothing in it is a screen, so a thumb path and a 6DoF pose stream
can both produce one and the model cannot tell which did. That seam is the whole
WebXR preparation and it costs nothing now.

## P0 step 2, the flick mapping

**D10. The seam is `MOTION`, and it is the only thing that crosses.** A device
produces a MOTION, `throwFromMotion` turns a MOTION into a THROW, and the model
only ever sees a THROW. `motionFromSamples` is the phone; `motionFromPose` is the
headset and is written and asserted even though nothing calls it tonight, so the
seam is provably real rather than promised. This is the whole WebXR preparation
and it costs nothing now.

**D11. Thumb speed converts through METRES_PER_CSS_PX, never through PX_PER_M.**
The plan says `v = speed_px_per_s / PX_PER_M * 0.2`. `PX_PER_M` is how big the
lake is DRAWN, so that ties how hard you threw to how zoomed the camera is, and
retuning the art would silently retune every throw in the game. A CSS pixel is
about 0.264 mm of real glass, the fleet's number from Keepsies, so thumb speed
through it is metres per second of actual hand movement, which is the same
quantity a 6DoF controller reports natively. An assertion pins it: 320 pixels in
60 milliseconds is 1.408 m/s, and a doubled or halved constant fails it.

**D12. A single stroke carries three numbers and the throw needs four, so aim
comes from where the stroke STARTS.** A path on glass has a speed, a direction
and a curvature. That is three. Reading yaw out of the stroke's direction and
theta out of the same stroke's rise makes them fight: a throw aimed hard left is
mostly across the screen, so its rise collapses and every aimed throw comes out
flat. Aiming would cost you the angle. Start position is a decision the player is
already making, it is free, and it decouples. Assertions hold it: the same stroke
started at three different places gives three different yaws and identical theta
and speed.

**D13. The arm sets the angle, the wrist adds the spin, and they are measured
from different parts of the stroke.** Read over the whole path, a hard hook drags
the endpoint sideways and changes the rise: measured 2026-09-06, the same arm
motion came out at 17.6 degrees hooked one way and 31.1 the other, so there was
no way to ask for spin without giving up angle. That is not a mechanic, it is a
tax. The rise is now read before `HOOK_WINDOW` and the curl after it, and an
assertion requires the angle to move less than a thousandth of a degree across
five different hooks.

**D14. Release speed is arc length, not net displacement.** Endpoint to endpoint,
a hooked release reads slower than a straight one at the same hand speed, because
the curve doubles back. The hand did not slow down.

**D15. Curl is total signed turning over arc length, not an average of three
point curvatures.** The three point estimate is dominated by whichever samples
happen to be closest together, which makes it a sampling rate measurement as much
as a shape one, and it was not even monotonic: a harder hook came back with less
spin than a soft one.

**D16. Two of the constants were only caught by MAGNITUDE assertions.** With
ordering assertions alone, `CURL_REF` could be a hundred thousand and
`METRES_PER_CSS_PX` could be wrong by a factor of two while every test stayed
green: spin stayed monotonic at zero, and a wrong glass unit just saturated every
throw at the cap. Monotonicity says the axis points the right way; it never says
the axis is worth using.

**D17. The test's stroke generator was wrong twice before the game was.** Its
hook displaced along a screen axis rather than perpendicular to the stroke, so a
left hook shortened the path and a right hook lengthened it and the game looked
wildly asymmetric when it was not; and it did not normalise arc length, so
hooking harder secretly made the stroke faster. Both are called out in a comment
above the generator, because an assertion is only ever as good as the thing
driving it.

## The aim mechanic, decided 2026-09-06

Stephen asked for a unique aim and flick mechanic. Four independent designs were
produced from different angles, judged against each other by three lenses (the
thumb, the feel, the machine), and merged. Design 2's spine won on the thumb
lens outright; design 1 tied on total but the thumb lens scored it 4 of 10 and
named an ergonomic fatal that design 1's own author had named first, and a body
fact is not a tuning constant.

**D18. Aim is THE PLANT: integrated lateral thumb travel while the hand is slow,
inside the same unbroken touch as the throw, and it is sticky across throws.**
It replaces the P0 baseline of reading aim from where the stroke started. Two
reasons, both measured. Positional aim is not reachable: a right thumb cannot
reach the left third of a 375 px screen without changing grip, so it silently
costs half the axis to half the players. And the plant is paid once per session
rather than once per throw, because the lake stays where you left it and a
rethrow down the same line is a bare flick.

**D19. One constant, `THROW_SPEED`, has two roles that cannot disagree.** A
segment at or above it is the throw, so a throw can never turn the lake; a
release slower than it is not a throw at all, so the stone goes quietly back in
the palm. Written as two constants they would drift apart and there would be a
band of speeds that both aimed and threw.

**D20. The arm onset stops on TWO consecutive slow segments, not one.** A single
stalled coalesced sample inside a real flick would otherwise split the throw and
hand its back half to the plant, turning the lake by the amount you just threw.

**D21. ⛔⛔ RISE IS LINEAR IN THE ANGLE, AND THIS WAS A REAL BUG, NOT A
PREFERENCE.** `motionFromPose` computed rise as an angle while `motionFromSamples`
computed it as a sine, so the identical physical throw arrived as **theta 26.38
from a phone and 21.00 from a headset**. The seam had rotted the hour it was
written and every assertion was green, because the device assertions checked that
the pose path produced a plausible SPEED and that two phone widths agreed with
each other. Neither ever compared the two devices to one another, which is the
one thing a seam is for. There is now an assertion that walks the same physical
throw down both paths at five angles and requires the answers to match; they
agree to the second decimal at every angle. As a side benefit the magic angle now
sits at a 41.5 degree thumb diagonal, which is what a thumb sweeping a portrait
phone actually does, instead of a cramped 27.5.

**D22. The arm and wrist split by ARC LENGTH, not by sample index.** By index the
split moves with the sampling rate, so the same physical throw read on a 120 Hz
panel and a 45 Hz one gave different angles. By arc it is a property of the path.
The residue is that a harder wrist roll lengthens the path slightly and walks the
split point along it, which leaves about half a degree of coupling: near the magic
angle the model prices that at about one skip in eighteen. A residue that depends
on the player's wrist beats one that depends on their hardware.

**D23. The magic angle is asserted to actually BE magic.** The game's premise is
"learn the magic angle with your thumb", so if the model's best angle were
somewhere else it would teach a skill that does not pay and every piece of folk
wisdom would point the wrong way. Nothing else checked it: the fifteen skip
assertion only asks that a throw AT the magic angle is good, never that it is the
best. Swept over 24 seeds at every degree from 10 to 32, the model peaks at 21
against a MAGIC_DEG of 20, on a single clean hill.

**D24. Two more probes that could not fail.** The headset throw assertions built
their pose stream FROM `CONFIG.U_HARD_XR`, so the constant could be set to forty
and the assertion still passed. They now use the physical numbers written out
literally (9.0 m/s is a hard human throw, 1.2 m/s is a limp one, 30 rad/s is a
real skipping roll) because those are facts about arms rather than about this
game, and if CONFIG disagrees with them then CONFIG is wrong.

### Taken from the panel but NOT built tonight, because they are P1 and P2

The three faces of the lake (`SHORE_REACH`, `SHORE_SHELTER`), which is what gives
aim a job: short sheltered water to the left that forgives a bad angle, the main
lake ahead where the record lives, the open bay to the right that runs forever
and where the wind has nothing to stop it. The bent seam of calm water that
previews the throw and straightens as you turn into the wind, which is how a
player learns the wind without being told. The treeline scrolling at
`TREE_PX_PER_DEG` so the turn reads as your body rather than as a slider. The
five degree haptic detents. `YAW_START_DEG -9` so a fresh save is visibly facing
off centre and the world is discoverably turnable on throw one. These are written
up in the plan's section 15 for P1 and P2.

## P1, the lake, 2026-09-06

**D25. The page plays the model's own trace; `runThrow` records it on request.**
Rather than re integrating the flight at frame rate (a second physics that would
drift from the count), `runThrow(th, {trace: true})` records every step at
`SIM_HZ` and the page walks that by wall clock. Off by default, so the harness
and the sweep never pay for it. The tick and plunk are scheduled from the
events' own times at the moment of release, never at frame time.

**D26. The plant is factored out as `plantYaw` so the live turn is the committed
turn.** The page turns the lake under a moving thumb by calling the same
function `motionFromSamples` calls at release. One rule, two callers; the
assertion count did not move.

**D27. The wind has a DIRECTION, seeded by the day, inside the shore's own
turn.** `windDir` is drawn in plus or minus 18 degrees and the model's lateral
wind is `wind * sin(windDir - yaw)`, so turning into the wind straightens the
seam and turning across it bends it. That is what makes the seam an instrument
rather than a decoration, and it costs the model nothing.

**D28. The seam is the water with the shimmer wiped off it, not a stroke.** The
first draft was a translucent dark stroke and it read as a plume of smoke on
the shore shot. Calm water is water with no light catching on it, so the lane is
a polygon a metre either side of the trace filled with the base water gradient,
a faint glassy sheen, and one thread of light down the middle. It brightens
under a live thumb.

**D29. The Perfect Skimmer is always on the bank tonight.** The pebble bed by
career is P2. Until it exists, slot three is the skimmer so the fifteen skip
throw the design promises is reachable on throw one and the flick gate has a
stone to name. The other two slots are drawn from the commons and Heavy Flat by
the day's seed. The bed replaces this in `setupDay`.

**D30. A line after EVERY sink.** The plan says the folk line appears after a
sink. A throw of twelve or more is told "That one went a long way." rather than
nagged about the axis it was least perfect on; below that it gets `adviceFor`.
A great throw earning silence sounded right and was not assertable.

**D31. A slow push is a plant, and the gate had it backwards.** The first draft
of `test/flick.mjs` asserted that a 60 px push over 300 ms leaves the lake where
it was. It does not and must not: a slow sideways slide is the plant (D18) and
the turn surviving a set down is the whole reason changing your mind is free.
The game was right; the gate now asserts the design.

**D32. Portrait, over the shoulder, the shore is the UI.** The camera slides
forward behind the stone at `CAM_LEAD_M` and never past the sink; the pebble
bank with the three stones stays fixed at the bottom of the screen the whole
time, because it is the hand, not the world. The water rows are fixed in the
world and slide under the camera, so the flight reads as travel.

**D33. The sun road is the only gold on the water.** The first render put gold
dashes at even density across the whole lake and it read as stripes, exactly
the fault the plan warned about. Now gold falls in a gaussian around the sun's
reflection that widens toward the shore, and off the road a row only shows a
segment where a wave crest happens to face the sky, so most of the water is
dark. Seen, not reasoned: three rounds of shots.

**D34. A slow ending sinks a beat after its last tick.** The model ends a
'slow' throw at the instant of its final skip, so the plunk was scheduled on
top of the last tick of the trill and buried it; the audio gate heard seventeen
onsets for seventeen skips and a plunk. A stone that has stopped skipping bobs
once and goes under, so `sinkTimeOf` gives a slow ending 120 ms, in the sound
and in the picture. A tumble or a plow sinks at the failed contact, which is
already a whole leap after the last tick. The model is untouched; this is the
page's reading of it.

**D35. The ambience is synthesised from the seeded stream.** Lap (band passed
noise swells every three to six seconds), crickets (a 4 kHz sine amplitude
modulated near 30 Hz, half second chirps), and the loon (660 to 880 Hz with
vibrato over 1.2 s, every forty to ninety seconds), all at small gains so the
ticks stay the score. Started on the first gesture, because a context cannot
open without one.

**D36. The pebble bed is seeded by the date and weighted by career, and it is
pure.** `bedFor(dateStr, career)` lives in the SIM export so the sim can walk
a year of it: three distinct stones drawn without replacement off the bed
stream, commons at weight 1, the uncommon pair from 0.55 rising with career, a
rare at weight 0 before `BED_RARE_CAREER` (50 career skips) and from 0.08
rising to 0.40 by career 1550. Until `BED_GIFT_CAREER` (30) the skimmer is
always on the bank, replacing slot three if the draw missed it, because the
first flick a player ever makes should show the trill the game is named for;
past it the skimmer is earned like any uncommon. This replaces D29. The gates
run on a fresh save, so they always find the skimmer. Each stone on the bank
carries the hand's own record under its name, and the stone's line says it
once when picked; there is no stat readout, per the design.

**D37. The three faces of one lake, in the model.** `faceOf(yaw, water, wind)`
is pure and exported: at or left of minus `FACE_DEG` (12) the lee past the
point, always glass, crosswind times `LEE_WIND` (0.35), and the spit at
`LEE_REACH_M` (16 m) where `runThrow` ends 'beached'; between, the main water,
the day's water and wind; at or right of 12 the bay mouth, the day's water a
step rougher (glass to ripple, ripple to chop) and the wind times `BAY_WIND`
(1.5). The face steps at the point rather than blending, because a point is an
edge. A perfect throw is not taxed by rough water, only the ordinary ones
either side of the magic angle are, which is what makes the bay worth the greed
and the lee the place for a count on a bad day. `throwEnv` reads the face, so
the seam previews it and the count obeys it. The land itself is not drawn yet.

**D38 (2026-09-06, Opus) — the share card is 1080x1350 and its arc is the model's own
trace, not a drawing of one.** The plan's section 4 asks for a replay image with the arc,
the rings, the count, the date and the stone's name. The five throws on a daily card carry
only a skip count and a distance, so a card built from those alone would have to invent the
shape of the throw. Instead `DAILY.record` now keeps `xs`, the x of every skip event the
model already produced, in the save only: the `#d=` link still packs skips and distances
and the daily gate still pins that shape, so nothing about sharing a lake changes. The card
draws the best of the five from those positions, one ring where each skip landed and the
plunk where it went in, so the trill a good throw makes is visible in the picture. A throw
saved before this existed has no `xs` and falls back to a shortening series that sums to
its real distance; the counts and distances printed are always the stored ones.

**D39 (2026-09-06, Opus) — SHARE sends the picture with the link when the browser can carry
a file, and SAVE THE CARD is always there.** `navigator.share` with files is not everywhere,
and a lake nobody can see is a worse invitation than one they can. The button tries files
plus text plus url, falls back to the link share, then to the visible link field. A second
button writes the png to the downloads, so the card is reachable on every browser.

**D40 (2026-09-07, Opus) — spin is BANKED during the wind up, not only snapped at the
release.** `docs/THROW-REFERENCE.md` is the research note behind this and it goes to Stephen
before anything else in P4. Until now `curl` was read only over the last forty percent of the
ARM's arc, so a thumb that circled slowly and then flicked straight committed nothing: the one
input he asked to see (transcript 10, 13, 15, 16) was a thing that happened to a throw rather
than a thing a player could do, and there was nothing steady to draw a ring for. `curlSoFar`
now accumulates signed turning over the SLOW segments, the same segments the plant reads,
normalised so `SPIN_LOOPS` (2) full turns of the thumb is full spin, and `motionFromSamples`
adds it to the wrist's curl. A stroke with no loops in front of it commits exactly what it
committed before, to the last decimal, and the eleven new sim assertions are watched to fail in
both directions (SPIN_LOOPS 1000 kills the bank, 0.2 makes it a hair trigger and the bowed
slide assertion catches that one).
⛔ THE WIND UP MAY NOT SWING THE SHORE, and it does not, because the plant integrates dx and a
closed loop's dx sums to zero. That is a property of the maths rather than of anyone's
intention, so it is asserted in both the sim (exactly zero) and the browser (the circle closed,
inside the same touch).

**D41 (2026-09-07, Opus) — the ring is the gauge and the sweep IS the bank.** No sparkle, by his
note and by the fleet's rule about particles that carry no information. Drawn only while the
touch is down and the hand is slow, gone the frame the arm is fast, radius growing from 26 to
42 px, the fill sweeping the way the thumb is turning so the sign is readable without a number,
one haptic pulse when it fills. Three things were wrong in the first shot and all three are
fixed: the fill had a tenth of a turn added to it as a floor, so 0.71 of a bank read as nearly
full; the track behind it was at 0.16 alpha, so there was nothing to read the fraction against;
and a cream arc laid across the pale band where the sun's reflection meets the black headland
lost half of itself. The ring now carries its own dark ground, a legible track and a tick at
the start of the fill, which is the same lesson as Updraft's altitude readout on a pill.

**D42 (2026-09-07, Opus) — the ring is proved by reading the CANVAS, not by reading a number.**
`GERPLUNK_DEV.ink(cx, cy, rLo, rHi)` reports the brightest pixel in an annulus around the thumb.
The gate reads the water at the exact point the thumb will hold, with no touch on the screen,
then reads it again mid wind up; emptying `drawSpinRing` turns it red, and deleting the line
that stops drawing once the arm is fast turns the companion assertion red. A gate that watched
`G.spin` would have passed over a ring that was never painted.

**D43 (2026-09-07, Opus) — the land is a wooded point, and the hand is not empty.** Both are on
the thin list and both were exactly as it says.
- **The point was one flat black polygon with a ruled top edge** running off the left of the
  screen: a piece of cardboard laid on the water. Three things, all code drawing. The mass is a
  gradient, near land a shade warmer than far, because the tip is sixteen metres away and the
  shoulder is half a kilometre. A treeline stands on its landward edge, drawn from the SAME
  continuous `treeH` sum of sines the far bank uses so the two read as one country and it scrolls
  with the yaw. And the wet lip takes a little of the sun near the tip, where the water is bright.
- **There was no stone in the palm** and the thumb's bottom third was empty water, both on the
  thin list. The stone you picked is now held at the right edge, cut by the frame's bottom, out
  of the seam's way and a long way from the bottom left 120 by 120 the music chip owns. It goes
  when the stone goes.
⛔ THE FIRST DRAFT OF THE HAND DREW TWO ROUND FINGERTIPS ON THE FACE OF THE STONE and it read as
a pair of eyes on a tan blob, which is worse than the empty water it was meant to fill. A hand at
the bottom of a frame is one shape rising from off screen with the stone cradled in it.

**D44 (2026-09-07, Opus) — three probes for this were wrong before they were right, and each one
was wrong in a way worth naming.**
1. **The trees vanished.** At `min(1, s * 0.055)` the scale at the far end of the point, six
   hundred metres out, was near zero, so six hundred pixels of skyline drew as a ruled line and
   the gate measured a deviation of nought. A treeline at six hundred metres is still a fringe:
   the height falls with distance to a floor of two and a half pixels rather than to nothing.
2. **The palm probe was measuring the lake.** It counted warm pixels in a box, and the sun's road
   lies across that water at the stance the gate looks from: 273 with the stone in hand and 258
   without. A stone is a SHAPE, so what is measured now is the longest unbroken run of stone
   coloured pixels down the middle of the palm, 46 with it and 3 without. Its threshold was then
   read OFF THE CANVAS rather than chosen: down the middle of the stone the pixels are 78,61,40,
   and at a red floor of 90 the probe could not see the stone it was written for.
3. **The land edge probe found a ruled line and it was right.** It was reading the two pixel
   strip where the far treeline's polygon closes just under the horizon, at the same y in every
   column, which is precisely the fault the assertion forbids. The run had to be fourteen device
   rows, and the dark threshold had to rise from 34 to 44 because the land is a gradient now and
   its near end is lighter than its old flat black.
⛔ AND ONE ASSERTION WAS DELETED FOR BEING DECORATION: with the trees the boundary steps 30, 28
and 23 times at the three sizes and without them 20, 21 and 19. At 320 the two bands are one
apart. Only `turns`, how often the skyline changes DIRECTION, separates cleanly: 8 to 10 wooded
against 4 ruled. A diagonal steps on its own and never turns.

**The plant's speed fade is gone, and that is what "horrible" was.** 2026-09-07,
Director call 22, and it is not the answer the call proposed. Stephen: "swiping left to right to
try and move is horrible." Measured against the shipped model before anything was touched: the
same 200 px of sideways thumb turned the lake 24.9 degrees crawled at a constant speed and 13.0
degrees moved the way a thumb actually moves, over 450 ms, which is not a fast gesture; at 300 ms
it was 4.5 out of 25. The same travel, the same direction, a different answer every time, and
nothing on the screen to explain it.
**The cause was a double count.** `plantYaw` weighted every segment by its own speed ON TOP of
being bounded by the arm onset. The arm onset already removes the throw from the plant completely
and by construction, so the extra fade could only ever discount travel that is NOT the throw, which
is to say the middle of an ordinary swipe, where all the distance is.
⛔ **The gain was NOT the fault and was not changed.** Call 22's options (a) and (b) were measured
and ruled out: at `TURN_DEG_PER_M` 300 the whole aim axis is 631 px of thumb, which does not fit a
412 px screen, and at `YAW_MAX_DEG` 60 it is 1515 px, which is four re grips. The table is in
`docs/REFERENCE.md`. Both remain one line each if his thumb wants them.
⛔ **A rise floor was measured and refused.** A pure sideways release does throw and scores zero
skips, so a floor looked like the other half of the complaint. It cannot be placed: a skimmer at
rise 0.02, eight degrees, still skips thirteen times, so any floor high enough to catch a stray
swipe also refuses real throws.
⛔ **`armStartOf` returns the first index that BELONGS to the arm, and `n` when nothing does.**
That distinction cost a round. The first version carried the release's own clamp inside it (never
fewer than one arm segment, true of a throw and false of a thumb still on the glass), so a stroke
that was all plant reported its last segment as the arm and the lake lagged the thumb by one
sample. On a wind up circle that is 8.9 px of a 34 px radius, and the assertion that a closed
circle leaves the lake where it started went red at 1.1 degrees. The clamp lives in the release now.
**`curlSoFar` keeps its own fade on purpose.** The spin ring is a live gauge drawn over the whole
stroke, arm included, so without a fade a curved flick would spin it up as the stone left the hand.
The plant is bounded by the arm onset instead and needs no such guard.

**Three more things to skip, and every number measured.** 2026-09-07, Director
call 24. The Bottle Cap (uncommon), the Clay Roof Tile (common) and the Ice Disc (rare). Each row
was written, `node sim.js --stones` run, and the row moved until the stone did on the water what
its line says it does. What each one is FOR, as a difference from the Perfect Skimmer and asserted
as one: the cap chatters, ten skips in a second where the skimmer takes three and a quarter; the
tile crosses more water in one leap than anything else in the bank, 5.79 m against the next
longest at 5.25, and is finished inside three skips; the disc goes sixteen in two thirds of the
skimmer's time.
⛔ **The bottle cap was written as a COMMON and had to be moved.** At ten skips it is better than
either uncommon and far better than the three commons (1 and 2), so a new hand would meet a stone
that beats the Perfect Skimmer's whole purpose before career 30, which is the one thing D36 exists
to prevent. Rarity in this game is how often you SEE a stone, not how good it is, and Granite
proves it; but a common that outclasses the gift breaks the gift.
⛔ **Seven assertions went red and every one of them was a count, not a law.** "There are eight
stones", "three of them are common", "two of them are uncommon", "three of them are rare", and a
mass range that was the range the model was TUNED over rather than a rule about what may exist.
They are laws now: enough stones to fill a bed of three, every rarity represented, no rarity the
whole bank, a mass of a sane order, and a mass outside the tuned range only for an id on a named
outlier list. A bottle cap really is lighter than a stone and a roof tile really is heavier.
⛔ **And my own helper guessed at a shape the tool next door already knew.** `firstLeapOf` filtered
the run's events for a `kind` of 'skip' and read zero every time; `sim.js --stones` had been
printing that column for a fortnight as the gap between the first two events. Ask the game where a
thing is. The second version of the same assertion then failed on `r.trace`, which is null unless a
caller asks for it, so the guard I had written round the claim was refusing the claim.

**A gate that needs two pictures of one instant has to get them from one
instant.** 2026-09-07, found by the fleet sweep and not by any suite run. The palm assertion, "the
hand is empty while the stone is in the air", takes the same frame with the stone in the hand and
with it set aside and measures what MOVED. It took the two samples from two real frames with a wait
between them, and on a busy box a short throw can SINK in that gap: the palm has the next stone back
in it, and the differential measures a full hand while the sentence says empty. **It read 20 px on
the sweep and 0, 1 and 3 on three runs alone minutes later, with nothing in the game changed.**
⛔ **The first fix made it worse.** Watching the flight and throwing again when it had landed early
turned one flaky assertion into a loop that threw up to four more stones, changed the day's state and
broke a later assertion: two failures where there had been one.
**The fix is `drawScene`.** The drawing half of `frame` is split from the stepping half, so
`GERPLUNK_DEV.palmInkPair()` can paint the same instant twice, with the stone and without, advancing
nothing in between. Four runs since read 0, 0, 0 and 0 where they used to read 0, 1, 3 and 20. It
also returns whether the stone was in the air when it looked, which is the state the sentence is
about, and that is asserted on its own line. Watched red with `drawPalm`'s early return removed: 46
px against 46.

**D45 (2026-09-08, Fable's builder) — the spin ring is OUTSIDE the thumb, 70 px empty to 110 px
full, and the look is judged with a thumb composited on it.** His line 11, Sep 07: "the circle that
fills is too small I can't see it behind my thumb." D41's ring was 26 to 42 px centred on the
touch, which on a Pixel 9 (0.158 mm per CSS px) is 8 to 13 mm across under a pad of 12 to 16 mm,
and its fill swept down toward the thumb's own body. THROW-REFERENCE A2 had chosen that on purpose
("learn it with your thumb") and the Director rejected it in so many words. Two shapes were shot
with a thumb on them: (a) a ring around the touch at 70 to 110, (b) the same ring lifted 90 px above
the touch at 40 to 64. (a) ships; the plan's SESSION STATE for Sep 08 has both shots and the reason.
The ring's centre and radius now come from one function, `spinRingGeom`, that `drawSpinRing` paints
from and `GERPLUNK_DEV.spin()` hands out, so the gate cannot read a formula of its own. The buzz at
full and the halo stay; the ground, track and fill strokes grew with the radius (6, 1.6, 3 to 6).
⛔ D42's probe is retired. `ink` read the brightest pixel in a 23 to 45 px annulus at the touch
against the water's brightest over ten frames, a coin toss, and it could not see a thumb. The
flick gate now reads `GERPLUNK_DEV.ringInk(45)`: ONE instant painted twice (D44's palm lesson,
`drawScene(fixedT)` so the sun's road cannot crawl between the paints), with and without the ring,
walked one degree at a time on the ring's own circle. Three laws: every degree of the circle moved
the picture; with a 45 px pad masked out around the touch MORE THAN HALF of the circumference (over
180 degrees) is still painted; and the fill runs the way the thumb wound, the first 36 degrees past
the mark lifting the picture 40 more than the last 36 before it. Each watched red (the plan has the
mutations). The shot `docs/shots/p5-windup-thumb.png` composites a 90 px disc and a 60 px body at
the hold point, drawn on a copy of the screenshot by `tools/shots.mjs`, never by the game.

**D46 (2026-09-08, Fable's builder) — the spit hangs off the PLAYER'S shore, the fresh stance is
straight ahead, and the point is fifteen degrees off it.** His words, Sep 07 and 08: "the slip is
annoying and in the way and just bad"; "the blackland on the left ... it's like a black strip that if
I turn it all it almost looks like it's a bridge or it's just horrible." Two faults, two halves.
- **In the way.** The fresh stance faced nine degrees left (D-list call 1, "keep it") and the point
  stepped at twelve, so three degrees of thumb, 24 px, put a new hand's every throw on the spit at
  sixteen metres. `YAW_START_DEG` is 0 and `FACE_DEG` is 15: the lee and the bay are each fifteen
  degrees of deliberate thumb away, four twenty pixel wobbles rather than one, and the sim's new
  `stance` suite holds it (a fresh save's straight throw is main water on every day's water and is
  never beached; ten degrees of margin each side; turned past the point the same throw still runs up
  on the spit at sixteen metres). D37's three faces are untouched; `bayOpen` reads `FACE_DEG` so the
  bay mouth moved with it. `LESSON_TURN` still reads true: the seam is bent by the day's crosswind at
  yaw 0 exactly as it was at minus nine.
- **The look.** A7's land was one polygon whose near edge ran flat across the whole lee at sixteen
  metres and whose base ran to the horizon as a ruled diagonal: turned into the lee it was a wall from
  the screen's edge to its tip, which is a bridge, and the A7 `turns` law was green over it because
  the luminance floor it read was finding deep water. ⛔ THE GEOMETRY WAS THE FAULT, NOT THE PAINT: a
  spit that ends the lee hangs off the player's own shore, the point you turn past, and hung off the
  far shore it is a strip across the water at every lee stance whatever it is painted like. The first
  rebuild here (a wooded headland receding to the horizon) was shot at five stances and read as a
  sleeve hanging from the sky, so it was thrown away the same hour. What ships: `landGeom(yaw)` is the
  one place the geometry lives, a low wooded POINT of the player's shore that comes in from the lower
  left when the lake is turned into the lee and narrows to a rounded root at sixteen metres, a low
  gravel BAR off that root out to a sand tip at `LEE_REACH_M` with water on both sides, low boulders
  and clumps of scrub on it, a treeline FRINGE from the far bank's own `treeH` along the point's far
  shore, and the whole thing slides `TREE_PX_PER_DEG` per degree at every depth so it turns with the
  country (the old one slid 1.2 m per degree at every depth, a fraction of a pixel at the horizon).
  At the fresh stance only the bar's tip shows at the left edge; at plus twelve nothing.
- **Three laws in `test/layout.mjs`, each watched red.** The bridge law: turned all the way into the
  lee, no strip of land OVER WATER in the bar's own rows spans more than 55 percent of the width (a
  bridge is land with water under it; the point's trees cross those rows and stand on land, and
  counting them read 48 percent at 375 with nothing wrong). The silhouette law: the land's outline
  between the horizon and the shore changes direction at least six times per hundred pixels of
  outline (a ratio, so it holds at 320 as at 412; the old wedge measured 0.0 to 0.7, the point 11.8
  to 14.9). The seam law: at every quarter degree of the stance `landLine(yaw).covers` equals
  `faceOf(yaw).face === 'lee'`, two producers and one question. The first two read
  `GERPLUNK_DEV.landInk()`, one instant painted twice with and without the land (`DEV_NO_LAND`,
  D44's lesson), so no colour is named. A7's `turns` law stays and now reads 23 to 29.
- **Shot at yaw -25, -12, 0, +12 and +25** (`docs/shots/p6-spit-*`), the tool prints the bar's
  numbers per stance, and the shot tool's `toLake` is guarded so the tall page is not asked for TO
  THE LAKE twice.

**D47 (2026-09-08, Fable's builder) — the spin BENDS THE PATH, beside the paper and not
inside it, and the release is shown.** His words, Sep 08: "when I throw it almost should
come out to the side and curve back in and then skip. I'm just not exactly clear on how this
is being measured and how it equates to a better throw or not. none of it's articulated or
shown. it'd be great if we could develop a simple skill there." Until this, spin held the
face angle steady across skips and decided the count (D1, D8), the wind alone moved the
stone sideways, and nothing on the screen showed the spin, the release or a curve:
`drawStone` was a fixed ellipse, the seam previewed a nominal throw that was never yours, and
the ring vanished the frame the arm was fast.
- **THROW-REFERENCE R4 is overruled and says so.** R4 refused a curve on Sep 07 because
  Bocquet's model is two dimensional and a lateral term would be "a second, false physics on
  top of the one the game is built from". The Director asked for the curve in so many words,
  so the curve is a TERM BESIDE THE PAPER: the collision, the lift, the loss and the tumble
  are untouched, and the heading over the water is a new state, `psi`, that the paper never
  had. Three constants, all in degrees of heading and all times the spin, with the spin's
  sign as the side: `CURVE_SLIP_DEG` 3.5 at the release, AGAINST the spin (the hooked wrist
  lets the stone go a little off its line); `CURVE_AIR_DEG_PER_M` 0.05 in the air, the same
  way, small; `CURVE_DEG_PER_SKIP` 1.6 at every contact, TOWARD the spin (the rim on that side
  bites). So a spun stone comes OUT on its first leap, the skips bring it BACK across its
  line, and the trill carries it past: his sentence, as a path. A thrown disc does the same
  thing and its players call the two halves the turn and the fade; that is an analogy and not
  a source. `vx` stays the speed ALONG the heading, so the collision sees the number it always
  saw and the count is untouched: every stone's `--stones` row has the same skips, and
  distances are shorter by the cosine of a few degrees (27.49 m to 27.44 on the record throw).
- **Tuned by the shape, not by a number.** 4 / 0.08 / 1.0 was tried first and the record
  throw went out 0.9 m and NEVER came back, because the trill turns the heading when the
  leaps are too short to spend it; the steer has to win while the leaps are still long. At
  3.5 / 0.05 / 1.6 the record throw goes out 0.45 m at twelve metres, crosses back over its
  line at twenty two and ends 1.06 m past it, heading 19 degrees toward the spin; three
  quarter spin goes out 0.33 and comes back to the line; half spin goes out 0.22 and tumbles
  before it returns. That last is the skill: the spin that brings a stone back is the spin
  that keeps it skipping, and the readout tells a weak spin the truth, that it drifted out.
- **`ys` and `heading` come back with the result,** the lateral the spin alone put on the
  stone and the heading at the sink, kept apart from the wind's so `curveWord` can say which
  way YOUR throw went on a day the wind bent it too. The seam law in the sim: the spin's
  lateral is identical with the wind on and off, to the last decimal.
- **The `curve` suite, twenty lines, each a comparison.** No spin is dead straight along the
  whole flight; full spin left and right are mirror images at every step and not at nothing;
  out first by more than a hand, then back across before the trill, ending on the spin side;
  the first leap turns a little further out in the air before anything has touched; the sink
  and the out both grow up the ladder half, three quarter, full; the record throw is still 17
  within one and 27.5 m within one; no throw in two hundred ends more than forty degrees off
  its line; and the readout reads as it should for four named throws. Watched red through
  `--over`: `CURVE_DEG_PER_SKIP=0` seven lines (no return, heading against, ladder inverted,
  the record throw reads "curled left"); `CURVE_SLIP_DEG=0` four (no out, no return to
  measure, the half spun throw is not told it drifted); `CURVE_AIR_DEG_PER_M=0` two.
- **The release picture (call 58).** For `RELEASE_MS` 350 of play time after the thumb lets
  go: the ring FROZEN where it let go at the bank it let go with (`paintRing`, the same paint
  as the live ring), fading in its last part rather than vanishing; an ANGLE LINE along the
  direction the arm threw (the rise the model was handed, D21) with the magic angle dotted
  beside it, ⛔ starting 50 px out from the point because a thumb that has just let go still
  hovers over the spot and a 45 px pad would hide the first inch of the one line that says the
  angle (caught on the composite, `p7-release-thumb.png`, before it shipped); and a SPIN ARC
  riding with the stone, arrowed, sweeping the way the spin was wound, weighted by its
  fraction, none on a stone with no spin. The in flight stone TURNS at `SPIN_REV_PER_S` 2.5
  times the spin, with a notch on its rim so the turn reads on an ellipse. A release sound,
  `whish`, 120 ms of noise through a band pass that climbs with the speed, through the master,
  and through the same function into the audio gate's buffer where it is the first onset of
  every throw. The age is the play clock, so a held clock holds the picture and the gate can
  paint it twice at one instant.
- **The seam is yours after a throw.** `seamNow` is the one place that decides: the nominal
  preview while the stone is in the hand, tagged "ideal line" until the first throw of the
  session (call 58 (c)); from the release, the committed throw's own trace, a wake behind the
  stone while it flies and the whole path once it is under, tagged "your line" once the rings
  have gone; the next touch brings the preview back, so a set down after a turn never shows
  a line thrown at a stance the world has left. `seamTagGeom` is where a tag sits, painted
  from and read by the gate.
- **The readout (his "how it is measured").** `readoutFor`, pure, one line after every sink
  before the folk advice: the speed as a word (Soft, Easy, Brisk, Hard), the angle in whole
  degrees against the magic angle, the spin as a fraction of full, and which way the path went
  (curled, drifted, or ran straight, by `curveWord` off the result and not off the spin).
  ⛔ `adviceFor` says "no numbers, ever"; the Director asked for these numbers, so the angle
  and the spin are numbers and the speed stays a word. The readout runs from 0.5 s for 3.2 s,
  the advice follows at 3.9 and the turn lesson moves out to 6.7 (the code; an earlier draft of
  this entry said 3.3 and 6.1).
- **Three gates.** `test/flick.mjs` 12: the release picture painted at the instant of the
  pointerup in the SAME tick (`releaseInk`, one instant twice, walked on the frozen ring's
  circle and along the line), on at every sample to 300 ms and off past 500; the seam after
  the sink is the throw's own, ends at its sink, differs from the nominal at that range, is
  tagged and the tag is ink; the readout's curve word agrees with the model's heading and
  lateral for the same throw; a new touch brings the preview back. Section 7: the line
  matches the four part shape and names the spin the throw had; the advice follows. Section
  2 reads the ideal line tag's STATE on a fresh save and section 13 reads its INK on a fresh
  page at the end (BUILD-NOTES, the first readback moves the clock). `test/audio.mjs` 8: the
  release is the first onset at the moment the stone leaves, over silence and under the plunk,
  louder for a harder throw; every count is now the release, the skips and the plunk.
- **Reviewed 2026-09-08 (Fable's reviewer), stamp `20260908d`.** Three things changed on the
  review. (1) The in flight stone's SILHOUETTE no longer turns: `drawStone` rotated the whole
  ellipse at `SPIN_REV_PER_S`, and `p7-release-tall` had the stone standing on its edge, a
  tumble and not a spin; the tilt is fixed at the old value and only the rim notch goes round.
  (2) The release law in `test/flick.mjs` 12 judged "on for 300 ms" on a wall clock started
  AFTER `releaseInk` while the picture's age runs from the pointerup; under the suite's load
  it read "8 of 9 samples on" over a game that had not changed. It reads the picture's own
  age now, on and off. (3) The thumb rule for the angle line was a sentence in a law that did
  not check it; `GERPLUNK_DEV.release()` hands out `line` and the gate holds the start at or
  outside the 45 px pad. Named and not changed, each a look call for the Director: the closed
  ring at r 110 is the largest object in the frame for its 350 ms; the angle line and the magic
  mark are two short strokes eight degrees apart and read as a clock hand; "ideal line" at a
  lee stance labels a line that runs onto the spit.


**D48 (2026-09-08, Fable's builder) — THE COACH: five beats on five flags, each once at the
moment it matters, and HOW TO THROW gives them back. A plan change.** His words, Sep 07:
"It needs a bit of a tutorial to explain how it works." Until this the coach was two one shot
lines, "Flick a stone across the water." while `seen.how` was unset and `LESSON_TURN` after
every sink until `seen.turn`; his save had both set on Sep 06, so on Sep 07 the game taught
him nothing, and no player copy anywhere named the wind up, the ring, the wrist hook, the
curve, the three faces or the spit.
- **The plan change.** Section 6 of the plan says first boot is "Flick a stone across the
  water." and nothing else. That still holds for the first boot itself: the one line, alone.
  What changes is that four more lines come LATER, each at the moment it matters and each
  once, which the plan never had a word for. The Director asked for a tutorial in so many
  words, so the plan yields here and this entry is the record.
- **The five beats.** (1) the flick, the first boot's line, unchanged, set seen at the first
  sink as before; (2) the slide, `LESSON_TURN`, back after every sink until the lake has
  turned five degrees, unchanged; (3) the wind up, "Circle a slow thumb on the water before
  the flick to bank spin, and watch the ring fill as you wind.", at the second sink or later
  of a throw with spin under 0.3; (4) the hook and the curve, "Curl the wrist at the end for
  spin. Aim a little off the line and let the spin bring the stone back.", after the first
  throw that CURLED or at the fourth sink; (5) the faces, "Past the point. The lee on the
  left is glass that forgives a poor throw. The bay on the right is greedy, rough water
  where a perfect throw pays.", under the thumb the first time the lake is turned past
  `FACE_DEG` either way. Beats 3 and 4 wait on beat 2 (a hand that has not found the turn is
  still on the first lesson), take the slot the turn lesson used (6.7 s after the sink, after
  the readout and the advice), one per sink with the wind up first, and are shown only when
  the hand is off the glass and no stone is in the air, else the flag stays unset and the
  beat waits for a quieter sink rather than flashing under a throw. Beat 5 waits on beat 2
  too, so the first slide is taught before what lies past the point.
- **One ladder, one mouth.** `coachDue(seen, throws, spin, curved)` in the SIM block is the
  ladder for the two sink beats, pure, with fourteen assertions in `sim.js --test` (the
  `coach` suite): nothing before the turn, nothing at the first sink, the wind up at the
  second unspun sink and not for a spun one, the hook after a curl at the third sink and by
  count at the fourth, the wind up first when both are due, and never twice. `pathCurled`
  is the readout's own `curveWord`, so the coach and the readout can never disagree about
  what the player just saw. `COACH.say(kind)` on the page is the one place a new beat is
  shown, and it sets the flag in the same write, so a beat cannot be shown without being
  marked seen.
- **Old saves.** `SAVE.read` copies an old save's `seen` whole, so the three new keys are
  absent and not zero (a whitelist merge drops new fields, a fleet scar); each is put back
  unset, which is how a returning hand, his, gets beats 3, 4 and 5 once and beats 1 and 2
  never again.
- **HOW TO THROW.** A 56 px button on the sheet between the two paragraphs and DAILY LAKE,
  nowhere near the chip's corners (the sheet is a full screen; the chip's seat is on the
  lake). It clears the five flags and returns to the water, where the first line is waiting,
  and the rest come in order as they are earned. With a sixth button the sheet as it stood
  was taller than a 568 px screen, and taller than 667 too (the builder's own layout run:
  LEAVE THE LAKE off the screen at 375, BACK and LEAVE off at 320), and a sheet whose way
  home is under the fold is no sheet; so it was re laid to FIT: SOUND and MOTION share one
  row (each half of 300, 56 tall, `.82rem`), the sheet's own margins are tighter than the
  title screen's (buttons 4 px, paragraphs 6 px at a 1.45 line height, the brand 8), and the
  first paragraph is the positioning line alone, "A lake at golden hour, a stone in your
  hand, and one flick.": its two sentences of how to throw were builder copy from P1 and the
  coach and HOW TO THROW now do that job under it. The scroll stays as the floor (a centred
  flex column that overflows clips its own top, a fleet scar, so the sheet starts at the
  top with `overflow-y:auto` and `touch-action:pan-y`, with a spacer each end that centres
  it when there is room), and the layout gate holds every sheet button in the viewport at
  all three sizes and the title unclipped. **Review note (Fable's builder, reviewing, the
  same day):** the builder prepared this re lay and did not apply it; on the review the row
  rule as prepared lost to `#scrSheet .btn{flex:0 0 auto}` on specificity, so MOTION was 300
  wide and off the glass at every size on the first run, and the rule is `#scrSheet .row
  .btn` now. If the Director wants the two how to throw sentences back on the sheet as a
  standing reference, the sheet has about 35 px of room at 320x568 and they need about 95,
  so they would cost the scroll.
- **Two gaps, both taste, named and not closed.** A hand that hooks or winds from its first
  throw never sinks a stone with spin under 0.3, so beat 3 never comes for it; the task
  named no fallback sink and none was invented. And beat 5 is shown under the thumb the
  moment the lake passes the point, so a flick in the same motion a moment later hides it,
  once; a player turning slowly is looking at the water, and the line lands in front of
  them, which is the bet.
- **The gate, `test/coach.mjs`, the eighth.** It seeds his save (`seen.how` and `seen.turn`
  and nothing else) and watches the line element with a MutationObserver, so a beat that
  flashed for one frame is on the record and a beat shown twice cannot hide between two
  polls. Asserted: the seeded hand is not told to flick; the first unspun sink teaches
  nothing; by the second the wind up is on the water, the save marks it, the readout came
  first on the record; the hooked throw CURLED by the coach's own word (the premise,
  asserted) and the hook beat followed at the THIRD sink, so the curve brought it and not
  the count; two more sinks, unspun and curled, show no beat; a slow slide past the point
  puts the faces beat under the thumb and a second slide past the other point does not;
  HOW TO THROW is 48 px where a thumb lands on it, a tap returns to the water in the next
  frame with the first line on it and every flag unset, and the next sink brings the slide
  lesson; and over the whole record each beat appeared exactly once. The lint law now
  reads the coach's lines and every `showLine` literal (they were never textContent or
  toast, so no dash law had ever read them). The mutations watched red are in the plan's
  SESSION STATE for 2026-09-08.
