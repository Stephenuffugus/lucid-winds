# THE THROW REFERENCE, Gerplunk

**Written:** 2026-09-07, Opus, before any code, as step 1 of P4.
**Why it exists:** Stephen's phone notes of Sep 06 (transcript 10, 13, 15, 16, in
`docs/DIRECTOR-CALLS-SEP06.md` section G item 25) asked for the throw to feel like
Pokemon Go's ball: a wind up you can see, a spin you can put on it, an indicator of how
fast it is spinning, and no sparkle.
**What it is:** what that game actually reads from a thumb, set beside what ours reads,
with what we adopt and what we refuse. Ideas only. No asset, no name, no line of copy
from anyone else enters Gerplunk, and no other title is ever named on a player screen.

---

## 1. WHAT THE REFERENCE ACTUALLY DOES

Sourced from published guides, read Sep 07 (links at the foot). Where a claim is my own
memory of playing rather than something a source says, it is marked **[memory]** and
should be treated as softer than the rest.

| what | how it reads the thumb | what it shows the player |
|---|---|---|
| **The wind up** | the finger stays down and travels in small circles on the ball. Direction matters: clockwise or counter clockwise. | the ball turns under the finger and, past a threshold, sparkles and the phone vibrates |
| **The arm** | one diagonal flick up the screen. Length and speed set how far the ball goes. | the ball leaves on the path the flick describes |
| **The spin's effect** | a spun ball curves in flight, and the curve's direction follows the spin's direction, so a counter clockwise spin wants a target on the left of the screen and a clockwise one wants the right | a visible arc, and the ball keeps sparkling down the whole flight |
| **The reward** | a spun ball is worth about 1.7 times a plain one on the catch roll | a word on the screen after it lands |
| **The separate skill** | a ring on the target shrinks and grows on its own clock, and hitting it small is the accuracy score | the ring itself |

Three things about that design are worth naming, because they are the reason it feels
good and none of them is the sparkle.

1. **The wind up and the arm are one unbroken touch.** You never lift to arm the spin.
   The finger goes down, loops, and leaves in the same gesture. That is exactly the shape
   Gerplunk already chose for aim (the PLANT, D18): slow thumb turns the world, fast thumb
   throws, one touch. So the spin is a third thing the same touch can carry, and it costs
   the player no new grammar.
2. **The spin is banked, not snapped.** You accumulate it by looping and it stays until
   you throw. The wrist snap at the end is the arm, not the spin. That is the difference
   from what we built.
3. **The feedback is on the thing you are touching, not on the target.** The sparkle and
   the buzz are under the finger. You learn the threshold with your thumb, not with your
   eye, and you can look at the target while you load.

**[memory]** The spin threshold is generous and forgiving: two or three small loops is
plenty, and once armed it does not decay while you hold. That forgiveness is a large part
of why the mechanic reads as skill rather than as a chore.

---

## 2. WHAT GERPLUNK READS TODAY

Our motion tuple is four numbers, `motionFromSamples` in `index.html` section 8.

| ours | read from | maps to |
|---|---|---|
| `speed` | arc length over the last 60 ms of the touch, in metres of real glass | `v`, the stone's speed off the hand |
| `rise` | the angle of the release displacement from horizontal, linear in the angle | `theta`, the attack angle, and Bocquet's magic band is near 20 degrees |
| `curl` | signed turning per metre over the last 40 percent of the ARM's arc only, the wrist snap | `spin`, which stabilises the attack angle across skips |
| `aim` | integrated sideways travel while the hand is SLOW, the plant | `yaw`, which of the lake's three faces you are throwing at |

Set against the table above, the gap is exactly one row: **our spin lives in the last
fifth of a second of the flick and nowhere else.** A player who loops the thumb for a
second and then flicks straight commits `curl` near zero, because the loops happened
before `armStart` and every sample before `armStart` is handed to the plant. So the one
input Stephen asked to see does not currently exist as a thing you can do on purpose. It
is a thing that happens to your throw.

That is also why nothing on the screen shows it. There was nothing steady to show.

---

## 3. WHAT WE ADOPT

**A1. Spin is banked during the slow part of the touch, and the wrist snap adds to it.**
A new pure function `curlSoFar(samples, upto)` accumulates signed turning over the SLOW
segments, the same segments the plant reads, normalised so that `SPIN_LOOPS` full turns
of the thumb is full spin. `motionFromSamples` commits `curl = wristCurl + bankedCurl`,
clamped as before. Every throw that worked yesterday still works: a wrist hook still
spins the stone by itself, and a straight flick after no loops still commits zero.

**A2. The indicator sits under the thumb and grows with what is banked.** A thin ring,
drawn only while the touch is down and the hand is slow, radius from a floor to a ceiling
as the bank goes nought to one, thickening as it fills, gone the moment the arm is fast.
One haptic pulse when it fills, once per touch. It is the reference's sparkle-and-buzz
moved onto a lake: the same lesson, none of its costume.

**A3. Spin direction is signed and it means something on the water.** Left curl and
right curl already reach `throwFromMotion` with a sign and the model already uses it.
The ring will show the sign by which way its gap opens, so a player can tell a loaded
left throw from a loaded right one without reading a number.

**A4. The bank does not decay while you hold.** Forgiveness is the point. If it bled
away the mechanic would become a race, and this game's one law is that nothing ticks
against the player.

---

## 4. WHAT WE REFUSE, AND WHY

**R1. No sparkle, no particles, no glitter on the stone or in flight.** Stephen said it
in the note and the fleet has said it before: no ambient particles unless the particle is
information. The ring is information. A shower of light on a dusk lake is a slot machine.

**R2. No accuracy ring on the target.** The shrinking circle is the other game's second
skill and it is a timing test. Gerplunk has no timer anywhere, by its own law, and the
lake is not a target: the water is the target and all of it counts. Aim already has a
job, the three faces.

**R3. No multiplier, no bonus word, no score for having spun it.** Spin is worth
something because it holds the attack angle across skips, which is real physics and shows
up as skips. Paying twice for it would make the ring a chore.

**R4. Spin does not steer the stone in flight.** Their ball curves sideways because it is
thrown at a thing. Ours is a skimmer on water: in Bocquet the spin's work is gyroscopic,
holding the stone's attack angle steady against the torque of each collision. Making it
curve the path would be a second, false physics on top of the one the game is built from.
Where a player will see it is in the count, and, with A3, in which face of the lake a
crosswind lets them reach.

**R5. Direction is not tied to the hand.** Their guides tell you which way to spin
depending on which finger you use. We will not build a mechanic whose comfortable version
depends on being right handed.

---

## 5. THE ONE THING THE OTHER STONE SKIPPING GAMES TEACH

The mobile category leader in this exact subject, going back to the first phones, splits
the throw into two timed button presses: a fluctuating power bar, then a press near the
water for the angle. Reviews of it, then and since, all land on the same two words: pick
up and play, thirty seconds to learn. A more recent one turns skipping into an endless
runner with ramps.

What that says for us: **the two press version is the safe design and the reason to
refuse it is the reason Gerplunk exists.** A power bar is a timing test with no hand in
it. The whole bet here is that a real flick, read as speed and angle and spin, is worth
more than a bar, because it can be practised rather than merely timed. The bet only pays
if all three of those numbers are things the player can feel themselves doing. Two of
them are. Spin is the third and it is the one this note is about.

---

## 6. WHAT THIS COSTS, AND WHAT IT MIGHT BREAK

- `curlSoFar` and the bank in `motionFromSamples`: about 40 lines in the SIM block, pure,
  covered by `sim.js --test`.
- `drawSpinRing` and its haptic: about 60 lines in section 15, no art.
- The gate: `stroke()` in `test/harness.mjs` grows a `loops` option so a real pointer can
  wind up; `test/flick.mjs` asserts the banked curl and reads the ring off the canvas.
- **The risk to watch:** a player who plants a long slow aim with a curved thumb path now
  banks spin they did not ask for. The plant is a sideways slide, so its turning per metre
  is small, but a curved slide is not zero. The number that keeps that honest is
  `SPIN_LOOPS`: at two full turns for full spin, a 200 px arc that bows 15 px commits
  about 0.05. There is an assertion for exactly this, that a plain plant and set down
  commits under a tenth of full spin.

**For Stephen:** nothing above changes what a stone does for the same numbers. It changes
which thumb movements produce those numbers, and it puts a picture on the one that had
none. If the answer to item 22, the turn, moves `TURN_DEG_PER_M`, this is unaffected: the
turn is sideways travel and the spin is turning, and they are read from the same segments
but they are different quantities.

---

## Sources

Read Sep 07 2026. Mechanics only.

- https://pokemongohub.net/post/guide/throw-curveballs-correctly/
- https://pokemongohub.net/post/guide/go-hub-guide-to-mastering-the-art-of-catching-pokemon/
- https://www.imore.com/how-to-throw-curveball-pokemon-go
- https://www.nintendolife.com/guides/pokemon-go-how-to-catch-pokemon-throwing-tips-poke-balls-and-capture-rates
- https://www.pocketgamer.com/skipping-stone/review/
- https://www.pocket-lint.com/games/reviews/68324-iplay-skipping-stones-mobile-game/
