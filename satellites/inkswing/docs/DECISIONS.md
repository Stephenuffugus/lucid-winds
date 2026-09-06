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
