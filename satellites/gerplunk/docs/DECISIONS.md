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
