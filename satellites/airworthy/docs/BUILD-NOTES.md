# AIRWORTHY, build notes

What is here, what it costs, and the scars. Written for whoever opens this next.

## The shape

One file, `index.html`, no framework and no build step. Inside it:

```
SIM_EXPORT_START .. SIM_EXPORT_END     the rules. No document, no window, no
                                       clock, no unseeded die. sim.js runs this
                                       exact text in node.
TEST_EXPORT_START .. TEST_EXPORT_END   123 assertions over that block.
VIEW, WORKSHOP, HANGAR, SHARE,         everything a browser needs, and nothing
SAVE AND SOUND, TUNNEL, FIELD, INPUT   the rules are allowed to read.
```

The one law particular to this game: **one source of truth for the plane.**
`derive(spec)` returns the physics, `liftCoefficient` and `dragCoefficient` are
the only lift curve and the only drag polar, and the field, the tunnel, the
classifier and the medal tool all call them. `test/tunnel.mjs` proves it by
measurement rather than by inspection: it takes the glide ratio the tunnel
prints, throws the same plane, measures the descent it flew, and requires them
within fifteen percent.

## The gates

```
node tools/check.js            all eight
node tools/check.js --fast     skips the slow ones and says which
node sim.js --test             123 assertions, no browser
node sim.js --medals           the thresholds, measured
node sim.js --medals --write   and written back between the MEDALS markers
node sim.js --fly=porpoise     one flight, printed for a person
node tools/shots.mjs [filter]  the evidence
node tools/thumb.mjs           the portal tile, measured before it is written
```

| Gate | What it is for |
|---|---|
| `sim` | the model, the archetypes, the fix loop, veer, wind, the challenges |
| `lint` | the studio laws against the shipped file |
| `throw` | a real pull back launches, and a trimmed porpoise becomes a keeper |
| `fold` | the workshop's six creases and the hangar |
| `tunnel` | the tunnel cannot lie about the field |
| `challenge` | the challenges, the medals, the ghost, the save |
| `sound` | one held voice, wind moves it, SOUND OFF is silent |
| `layout` | touch targets and framing at four sizes |

Every assertion in every one of them has been watched to fail. The ones that
were hardest to make fail are written down in the plan's ledger, because a gate
nobody has watched fail is decoration.

## Scars

- **A handed down flight model is a sketch, not a model.** Taken literally the
  plan's coefficients put every plane into the floor in a second. Ten
  corrections. The important ones: pitch damping is STIFF and has to be
  integrated implicitly or explicit Euler gives Infinity in 0.2 s; the stability
  sign was inverted; cp must sit behind cg; and a stalled wing must push its own
  nose down or a plane trimmed past its stall pitches up for ever.
- **`while (a > PI) a -= 2 * PI` on an angle that has gone to Infinity never
  returns** and the gate hangs with nothing to read. Wrap by arithmetic.
- **A stalled wing is a barn door.** Induced drag follows CL and CL falls in a
  stall, so without a separation term a stalled plane gets CHEAPER to push
  through the air. The wind tunnel found this by drawing the drag arrow shorter.
- **An accuracy challenge with a free throw is not an accuracy challenge**, and
  distance and airtime are the same challenge if the throw is free. Each
  challenge prescribes its throw.
- **A camera that tracks in both axes** glues the subject to one spot and the
  motion you built becomes invisible.
- **A list of things the player MADE must be drawn from the angle that shows
  what they chose.** In profile every plane is the same picture.
- **A portrait room's chrome must become a side column in landscape.** Stacked
  it took 307 px of a 375 px screen.
- **A tall phone is not a bigger phone.** Scaled by width alone a 412 by 915
  screen put the whole flight in a 200 px band with two thirds of the screen
  blank. The room is drawn closer, the floor is dropped, and the ceiling is
  anchored to the FRAME rather than to the world, which is the one thing in here
  that is.
- **The frame loop must not open the audio engine.** It runs from the first
  paint, and a context made outside a gesture is born suspended on a phone and
  stays that way.
- **A rush is one voice, held.** Firing a short noise every frame is a machine
  gun and a hundred buffers a second.

## What nobody has done

Nobody has played this on a phone and nobody has HEARD it. The headless browser
runs with `--autoplay-policy=no-user-gesture-required`, which is the one flag a
real phone does not have.
