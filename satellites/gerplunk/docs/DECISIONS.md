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
