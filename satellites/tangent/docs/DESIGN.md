# TANGENT — design bible and inventory

Working title. Sibling to RIPCORD: same spin physics lineage, inverted control.
In RIPCORD you are the top. Here you are the stadium, and the top is a ball you
never touch directly.

Status: **v6 is current** — `tangent-v6.html`. Controls simplified, see section 16.
Previous: **v5** — `tangent-v5.html`, ferrofluid look. See section 14.
Previous: **v4** — `tangent-v4.html`, black hole inversion. See section 13.
Previous: **v3** — `tangent-v3.html`, 42 KB. See section 12.
Previous: **v2** — `tangent-v2.html`, 33 KB, single file, vanilla, no
build step, runs from `file://`. `tangent.html` is kept as the v1 reference.
See section 11 for what changed and why.

---

## 1. The core mechanic

An object leaving a spinning rim flies off on the **tangent**. The launch
direction is therefore not something you aim — it is decided by *the moment the
ball reaches the edge*. Everything in the game is a way of controlling that
moment.

That single constraint is what makes this not just another rotate-the-world
game. Rotation games normally use spin to redirect gravity. Here spin is a
launch mechanism, and **delay is the primary design resource**.

Two control surfaces express it:

- **Build phase** — parts bolted to the deck that stall, deflect, or hurry the ball.
- **Spin phase** — a throttle that sets how far out the ball orbits.

---

## 2. Physics model

The deck is a **dish, not a plate**. Inward pull grows with the square of radius:

```
inward acceleration = BOWL · r²
```

Co-rotating at radius r needs centripetal `ω²r`. Setting those equal:

```
BOWL · r² = ω² · r        →        r_eq = ω² / BOWL
```

Every spin rate has exactly one **stable** orbit radius, and it is stable in the
right direction (inside it you drift out, outside it you fall in). This is the
whole reason the game works: the throttle is a radius dial, not a timer. Hold
50% and the ball parks. Hold more and it walks outward. Let go and it dives
toward the hub.

`BOWL` is derived, not tuned by hand — it is set so the stable orbit sits exactly
on the rim at `OM_RIM`:

```js
BOWL = OM_RIM² / DECK_R
```

### Constants as shipped

| Constant | Value | Role |
|---|---|---|
| `DECK_R` | 100 | deck radius, world units |
| `BALL_R` | 3.4 | ball radius |
| `MU` | 2.2 | surface friction coupling |
| `SPIN_GAIN` | 7.5 | throttle authority |
| `SPIN_DRAG` | 3.0 | spin damping — τ = 0.33 s |
| `OM_RIM` | 1.9 | spin rate whose stable orbit is the rim |
| `OMEGA_MAX` | 2.5 | ceiling, comfortably ejects |
| `OM_IDLE` | 1.15 | resting spin; ball starts settled at r ≈ 37 |
| `TH_FLOOR` | 0.30 | throttle you fall back to on release |
| `TARGET_D` | 380 | centre-to-target distance |
| `G_PULL` | 210000 | target gravity well |
| `RUN_LIMIT` | 20 s | run called off |
| `DT` | 1/120 | fixed step |

Scoring bands: 26 / 60 / 112 units from target centre.

### Frame handling

Parts live in **deck-local** coordinates and rotate with it. Collisions resolve
in the rotating frame:

```
v_rel = R(−θ)·v_world − (ω × r_local)
```

resolve, then transform back. This is why bumpers throw the ball correctly at
speed instead of behaving like static walls.

---

## 3. What tuning actually found

These are the three findings worth keeping. Each one killed a version of the design.

**Finding 1 — a flat deck is unplayable.** The original model was a flat plate
with friction dragging the ball outward. The resulting spiral is exponential:
the ball crawls near the hub for 2.6 s, then crosses the outer third in 0.25 s.
Every part placed near the rim — the most interesting real estate — did nothing,
because the ball was past it in three frames. No amount of drag fixes the shape.
The dish fixes it structurally: radius growth becomes near-linear, 38 → 100 over
3.8 s.

**Finding 2 — pure timing is not a skill, it is a coin flip.** Launch heading is
locked to exit angle, and the exit angle sweeps at ~109°/s. Landing dead centre
requires about 1.6° of launch precision. That is roughly 15 ms of timing. Not a
challenge, a lottery.

**Finding 3 — the obvious fix is a lie.** Adding a trajectory predictor that
draws "where you'd go if released now" makes it *worse*, because you cannot be
released now. You leave when you reach the rim, ~0.5 s later, by which point the
deck has turned 70°. The predictor has to **run the ball out to the rim first,
then fly it** — simulating forward with the throttle held. That is the shipped
`predictCommit()`, and it shares the exact integrator with the live sim
(`advanceDeck`) so what you are shown is what actually happens.

With the honest predictor the skill curve is real:

| player reaction | result |
|---|---|
| 0.00 s | 20 units — dead centre |
| 0.20 s | 81 units — graze |
| 0.50 s | 219 units — miss |

---

## 4. Systems inventory

**Built and working**
- Fixed-step integrator, shared between live sim and predictor
- Dish physics with derived stable-orbit relationship
- Rotating-frame collision for rails and bumpers
- Zone effects (brake, booster) sampled in deck-local space
- Build phase: tap to place, drag to lay rails, eraser, part budget
- Centre-of-mass computation, live balance gauge, wobble, tear-apart failure
- Throttle with floor, stable-orbit ring rendered live
- Commit predictor with three-state colour feedback, cached every 3rd frame
- Tangent launch, flight with gravity well, closest-approach scoring
- Gate checkpoints in deck-local coordinates
- Run timeout, failure cards, per-level criteria chips
- Camera: tight for build, wide for spin and flight
- Score breakdown: landing band, gates, thrift bonus, balance bonus

**Partial**
- 5 levels; gate placement sits too close to the ball's natural sweep
- Flight phase is deliberately thin — one body, no obstacles
- No audio at all
- No persistence

**Not started**
- Campaign / body-to-body chaining
- Any art beyond canvas primitives
- Level editor, sharing, replays

---

## 5. Part catalogue

| Part | Kind | Mass | Effect | Notes |
|---|---|---|---|---|
| Rail | segment | 3 × length | deflect, restitution 0.72 | drag to place; the main delay tool |
| Bumper | circle r 8.5 | 2 | restitution 1.12 | throws the ball inward, buys a full extra lap |
| Brake | zone r 15 | 1 | friction × 3.4 | kills tangential speed, so the dish pulls it in |
| Booster | zone r 12 | 1 | +200 outward | early acceleration; near-useless at the rim, where dish pull is ~330 |

Mass matters only through the balance constraint. Rails cost mass proportional
to length, which is what stops "just build a spiral wall".

**Parts worth adding** (designed, not built): one-way gate, splitter that clones
the ball, magnet that pulls toward a point, ratchet that only permits outward
travel, and a timed drop-away rail.

---

## 6. Level schema

```js
{ name, targetAngle, budget, tol, gates:[{r, a, w}], note, sandbox? }
```

`tol` is the balance tolerance as a fraction of deck radius. `gates` are in
deck-local polar coordinates. The five shipped levels teach, in order: the
tangent itself, delay, balance, routing, and free play.

**Known authoring insight:** the ball's natural unobstructed path through the
deck frame is now measured — roughly `r38@−7°, r52@−46°, r64@−67°, r77@−86°,
r89@−103°`. Gates should be placed *deliberately off* that line so parts are
required. Current gates are too near it, which is why a bot with no parts placed
still collects 2 of 3.

---

## 7. Asset inventory

Everything on screen right now is canvas primitives and needs nothing. What a
polished version would want:

- **Audio (highest value per hour):** deck spin-up loop pitched to ω, ball roll
  loop pitched to speed, rail tick, bumper thunk, rim release whoosh, wobble
  groan near failure, landing chime per band. Spin games live or die on the
  audio-to-velocity coupling. Web Audio, no files needed for most of it.
- **Haptics:** rim crossing, bumper hit, dead centre. Cheap on mobile, huge.
- **Deck skins:** brushed steel, ceramic, cracked concrete. Pure canvas gradients.
- **Target bodies:** currently one circle. Wants 6–8 distinct silhouettes.
- **3D path (only if it earns it):** Meshy/Blender for deck and ball, matching
  the RIPCORD pipeline. Not needed for the prototype to be fun.

---

## 8. Open design questions

**The big fork, unresolved on purpose.** Your original description was "structure
everything first, meet criteria, then spin out." I drifted from that by adding a
live throttle. These are two different games:

- **Engineer.** No live input at all. You set a *throttle program* during the
  build phase, hit go, and watch it run deterministically. Parts are the entire
  puzzle. Restart-and-tweak loop. Closer to what you described, and it makes the
  predictor unnecessary because the whole run is knowable at build time.
- **Rider.** What is built now. Live throttle, reflex-driven, predictor-assisted.

They pull against each other: the more the live throttle matters, the less the
parts do. Right now the throttle is doing too much of the work. Worth playing
what exists and deciding which one you actually enjoyed.

Smaller open questions: should the ball be reusable across a chain of bodies
(the gravity-assist campaign)? Should failed runs be watchable as ghosts?
Should balance be a hard gate or purely a score modifier?

---

## 9. Backlog, in priority order

1. **Play it and settle the engineer/rider fork.** Nothing else matters until this is decided.
2. Re-place gates off the measured natural sweep so parts become mandatory.
3. Audio, coupled to ω and ball speed. Biggest feel-per-effort win available.
4. Haptics on rim crossing and centre hits.
5. Persistence: best score per level, parts-used record.
6. Ghost replay of your best run on each deck.
7. Body-chaining campaign — land on the target, it becomes the next deck.
8. New parts from the list in section 5.
9. Level editor and share codes.

## 10. Known issues and refactor notes

- `drawDeck` and the spin-phase overlay both draw the target rings. Harmless
  duplication, should be one function.
- Predictor is cached every 3rd frame; on a slow phone consider every 5th, or
  moving it off the render path entirely.
- `collideOn` uses `s === ball || s.live` to decide whether to trigger screen
  shake. Works, but a `silent` flag on the state object would be cleaner.
- No sub-stepping on collision. At maximum rim speed the ball moves ~1.6 units
  per step against a ball radius of 3.4, so tunnelling is not currently possible,
  but any speed increase would require a swept test.
- Booster is weak by design at the rim. Verify that reads as intentional to a
  player rather than as a broken part.


---

## 11. v2 — release is the launch, and the sky has gravity

Two changes, one a correction and one an expansion.

### 11.1 Release became an actual button

In v1 the throttle was the only control and the ball launched when it happened
to cross the rim. The moment you committed and the moment you left were
different moments, roughly half a second apart, which is exactly why it did not
feel like your release.

v2 adds an explicit **Release** button. Hold the throttle to widen the orbit,
press Release to let go. The rim still auto-releases if you ride into it, but
that is now a consequence rather than the mechanism.

This deletes an entire class of problem. The predicted path is drawn from the
live state, and releasing produces exactly that state, so the prediction is
correct by construction instead of by careful lookahead. The elaborate
run-out-to-the-rim predictor from v1 is gone.

It also fixed the difficulty. In v1 a 0.5 s reaction meant a total miss. In v2
a 0.4 s reaction still lands, because the "lands" outcome now covers a
continuous arc of release angles instead of a knife edge.

### 11.2 Release radius is now a real decision

Measured on level 1, holding the throttle for different durations:

| hold | release radius | launch speed | closest approach |
|---|---|---|---|
| 0.4 s | 38 | 55 | 88 |
| 1.0 s | 48 | 77 | 426 |
| 2.0 s | 73 | 122 | 47 |
| 3.5 s | 100 | 204 | 413 |

Radius sets speed, speed sets how much gravity gets to bend you. A slow release
from a tight orbit is heavily steered by the field. A fast release from the rim
flies nearly straight. Same target, two completely different solutions.

### 11.3 The gravity field

Bodies now carry `m` as the gravitational parameter directly, so acceleration is
`m / d²`. Calibration against a 190 unit/sec pass at 160 units offset:

| m | trajectory bend |
|---|---|
| 1.0e6 | 20° |
| 3.0e6 | 67° |
| 6.0e6 | captured into orbit |

Working values: **2.2–2.6e6** for a target (strong enough to pull in a near
miss, which is forgiving in the right way), **1.1–1.6e6** for a hazard that
bends you without swallowing you, **3.4e6** for a heavy body you must go around.

At the original 190 u/s launch speed with m under 1e6, gravity moved the ball
about 12 units across an entire flight. Invisible. The whole system only became
a system once mass went up by an order of magnitude and slow releases became
possible.

### 11.4 Level structure now

`bodies: [{n, x, y, r, m, target?}]` replaces the single target angle. The
target is explicitly flagged and **is not always the nearest body**. Touching a
non-target body ends the run.

Six levels, all verified solvable by a bot that releases when the predictor says
it lands:

1. **First tangent** — one body, learn the release.
2. **Behind you** — target behind the deck, needs most of a turn of delay.
3. **Not the nearest** — Ash sits between you and Orin. Crashing into it fails.
4. **Around the heavy** — Bell is too massive to cross; ride its pull to Wren.
5. **Threading** — two wells flanking a corridor, their pull is your only steering.
6. **Open deck** — sandbox with three bodies.

Note that with no parts placed, the bot lands on every level but misses gates
(0/1 on level 2, 1/2 on level 5). That is the correct shape: landing is the
reflex layer, gates are the build layer, and you need both.

### 11.5 Slingshot bonus

Passing within 3× radius of a non-target body without hitting it records an
assist, worth 400 each. This is currently the only mechanical reward for taking
the interesting route rather than the direct one, and it is the seed of the
gravity-assist campaign in section 9.

### 11.6 Still open

The engineer/rider fork from section 8 is **not resolved** — if anything v2
leans harder into rider, because the release button is a reflex input. The parts
now matter mostly for gates rather than for the landing itself. If the build
layer should carry more weight, the move is to make gate positions genuinely
require routing and to consider a per-level cap on release attempts.

Other open items: bodies are static and could orbit; there is no fuel or
attempt limit; and the deck could itself be one of the bodies in a larger
system, which is what would make the body-to-body campaign literal rather than
a scene change.


---

## 12. v3 — the deck becomes the puzzle

### 12.1 Why: the sky is not defensible

A prior-art search changed the plan. The flight half of this game is a crowded
genre. Gravitura, Gravity Launch, Gravity Sling, Slingshot Orbit and an itch
release literally called Gravity Assist all do launch-into-gravity-field with a
dotted predicted path and a swing-by bonus. One of them describes its own
mechanic in almost exactly the words of our section 11.

Closer to home, **Starfling** (April 2026) is a single HTML file, vanilla JS,
Canvas and Web Audio, in which you orbit a star, tap to release, and sling to
the next star. That is the v2 release mechanic and the v2 tech stack.

Nothing found has a **buildable centrifuge**. No mass balance, no parts bolted
to a rotating deck, no rotating-frame layout puzzle. So v3 moves the game's
weight onto the deck and treats the flight as the consequence rather than the
content. This also resolves the engineer/rider fork from section 8, in favour
of engineer.

### 12.2 Ports and the retaining wall

The deck now has a wall. The ball cannot leave except through a **Port** you
place during the build phase, and only once the latch is armed.

That single constraint moves the aiming decision into the build. Sweeping port
angle across a level moves the closest approach from 21 units to over 500 —
placement is now the dominant variable in the whole game.

Ports are a separate budget from parts (`portBudget`, 2–5 per level) and carry
no mass, so they do not interact with the balance constraint. Port scarcity is
the difficulty dial: fewer ports means longer waits for the right window.

### 12.3 Wall friction is what makes it work

First attempt failed outright. With a plain bouncy wall the ball settles into
co-rotation and its position **in the deck frame freezes**, so only the port it
happened to arrive at was ever reachable. Every other placement was dead.

The fix is friction. The ball rubs the wall, is held below deck speed, and
therefore walks steadily backwards past every port in turn. Two details
mattered:

- Restitution had to drop to 0.05. At 0.45 the ball chattered off the wall and
  barely touched it, so drag applied on only a fraction of frames — measured
  slip was 11% against a predicted 58%.
- Drag applies across a **contact band** (1.6 units) rather than only on
  penetration.

Drag strength is a genuine trade: more drag means faster drift but a slower
ball, and past about `WALL_DRAG=6` the ball loses so much speed that the dish
pulls it off the wall entirely and it never finds a port. Shipped at 2.0.

### 12.4 Three controls that now interact

| control | phase | what it decides |
|---|---|---|
| Port placement | build | which deck-local angle you can exit from |
| Throttle | spin | drift rate around the rim, and orbit radius |
| Arm latch | spin | which port, and which lap |

Throttle steering is real and measured. Holding drifts the ball backwards
through the deck frame at about 35°/s; pulsing the throttle parks it at about
4°/s. So you can sweep toward a port or hold station and wait.

Arming selects a lap, also measured: on a one-port deck, arming before 9 s exits
at 11.4 s, arming after 12 s catches the next pass at 22.9 s — and because the
deck has turned in between, the launch heading and the landing are different.

### 12.5 Tuning the landing window

Once the ball rides the wall its exit state is far more uniform, which collapsed
the landing window to roughly 2° of rim. Untappable.

The fix was not tighter control but a more forgiving target: raising target mass
by 2.6× (to 5.7–6.8e6) and radius to 28 widens the capture so the well does the
forgiving. Result across all six levels:

| level | landing windows (of 180 port angles) |
|---|---|
| First tangent | 13 |
| Behind you | 12 |
| Not the nearest | 11 |
| Around the heavy | 19 |
| Threading | 10 |
| Open deck | 11 |

That is 20–38° of rim per level. On a phone that is a comfortable tap, while
still demanding a considered placement.

Level 5 needed geometry work on top of that — it sat at 1 window through two
mass retunes, and only came right when the target was repositioned. Worth
remembering that body **placement** matters more than body **mass** for
solvability.

### 12.6 Audio

Fully procedural, no assets, in `sfx`. Two continuous voices tied to physical
quantities: a filtered sawtooth deck hum whose frequency and gain track omega,
and band-passed noise whose centre frequency tracks ball speed. One-shots for
rail ticks, wall rubs, gate passes, latch arm, release, landing arpeggio, crash
and failure. Boots on first user gesture, wrapped in try/catch, silent if the
audio context is unavailable.

### 12.7 Persistence

Best score per level in `localStorage` under `tangent.best.v3`, wrapped so it
degrades silently. Shown on the build screen.

### 12.8 Status and what is next

36 of 36 automated checks pass: every level builds, draws, runs armed, times out
correctly when unarmed, and handles a deck with no port at all.

Open items, in order:
1. **Playtest the pacing.** Median time from spin-up to launch is 4–7 s. That is
   much better than the 11 s it was mid-session, but it is still slower than v2
   and it is the thing most likely to feel wrong in the hand.
2. Drift is one-directional. You can sweep fast or park, but never reverse. A
   brake pad on the rim, or a reverse-throttle, would complete the control.
3. Gates are currently satisfied incidentally at good port angles. They should
   be placed to conflict with the best port, so parts are forced.
4. Ports have no cost beyond count. Making a port weaken the wall, or cost
   balance, would give placement a second dimension.


---

## 13. v4 — the black hole, and turning the world inside out

### 13.1 The maths: circle inversion

"Turned inside out" is not a metaphor here, it is a named transform. **Circle
inversion** about a circle of radius R:

```
d  ->  R² / d        (bearing preserved)
```

Everything inside the circle goes outside, everything outside comes inside, and
the circle itself is the fixed set — points on it do not move at all.

Animating it naively looks like objects sliding around. Animating it in **log
space** is what produces the effect:

```
d(t) = R^(2t) · d₀^(1-2t)
```

At t=0 nothing has moved. At t=1 the system is fully inverted. And at **t=0.5,
every object in the system sits exactly on the horizon ring simultaneously** —
the entire universe collapses to a circle, then blooms back out the other way.
That midpoint is the whole effect and it falls out of one line of algebra.

The ball is drawn pinching to nothing as it approaches the ring and reopening
after, and `drawHorizonFlash` lights the ring at the collapse.

### 13.2 Palette inversion, cheaply

Rather than rewrite every colour, the finished frame is inverted with one
composite operation:

```js
ctx.globalCompositeOperation = "difference";
ctx.globalAlpha = invAmt;
ctx.fillStyle = "#fff";
ctx.fillRect(0,0,W,H);
```

`invAmt` lerps 0→1 across the animation, so colours wash through grey exactly as
the geometry collapses to the ring, and land fully inverted. Partial alpha gives
partial inversion for free.

One bug worth recording: the first version recomputed `invAmt = 1 - invAmt` on
completion, which snapped the palette back to normal the instant the flip
finished. The animation now carries explicit `from` and `to` values.

### 13.3 Side-locked bodies

Getting "a puzzle you can only finish inverted" through geometry alone failed
three times. Tucking the target near the hole so it could not be approached
directly always left it either reachable from its far side, or flung so far by
the inversion that it became unreachable afterwards.

The fix is a general mechanic instead of a geometry trick. A body may carry
`side: 0|1`, and is only real when `inversions % 2` matches. Off-side bodies
have no gravity and no collision, and are drawn as dashed outlines labelled
"other side" so you can see what is waiting through the hole.

This makes "finish it inverted" trivially authorable, and it is a strong puzzle
tool in its own right — hazards that only exist on one side, targets that swap,
a hole that is only open from one direction.

### 13.4 The bearing puzzle

The ball re-emerges **on the horizon, at the bearing it entered, heading
outward**, at 45% of its entry speed (capped at 120). Slowing the emergence
matters: gravity then gets time to act on the far side.

Since the horizon is the fixed circle, a target placed exactly on it does not
move during inversion. That turns the level into a pure bearing problem: enter
the Maw on the side where the target sits. Getting the entry bearing right is
controlled by port placement, so the build phase reaches all the way through the
hole into the other world.

`Inside out` lands on 20 of 90 port angles, and because no live target exists
before the flip, every one of those landings is necessarily post-inversion.

### 13.5 Status

44 of 44 checks pass across all seven levels, including a check that a run can
never mutate level data (the system is deep-copied into `sys` at load, so
inversion rearranges the copy).

Scoring: an inversion is worth 900, on top of slingshot assists.

### 13.6 Theme

Still unsettled, and deliberately so. Space was the first instinct and it is the
most crowded option — it is also the camouflage that makes this look like the
twelve gravity-slingshot games in section 12.1. Candidates that would earn the
physics rather than decorate it:

- **Materials recovery plant** — a sorting disc flinging scrap into bins.
  Hands you electromagnets, eddy-current repellers and air classifiers as
  obstacles for free, and mass balance is a real problem in real sorters.
- **Carnival midway** — spin ride flings a plush at prize shelves. Warmest,
  most legible, best fit for a young audience.
- **Clockwork** — escapements and jewels; rotation is native, but cold.

The black hole reads as space, but it does not have to. In a sorting plant it is
a shredder chute; in a midway it is the mirror tent. The inversion is a strong
enough idea to survive any of them.

### 13.7 Next

1. Theme decision, since it gates all art.
2. Obstacles still unbuilt from the shortlist: repulsors, charge pickups on the
   deck that flip a body's polarity, moving or orbiting bodies, drift fields,
   hoops, portal pairs, and one-shot bodies that vanish after a pass.
3. Counter-rotating inner ring on the deck, to fix v3's one-directional drift.
4. Level authoring for the inverted side, which is barely explored.


---

## 14. v5 — ferrofluid, and what to actually generate

### 14.1 The look is procedural, and that is the point

Ferrofluid reads as ferrofluid because of the **Rosensweig instability**: the
fluid spikes into cones along the magnetic field lines running through it. That
is a behaviour, not a texture, and no pre-rendered asset can fake it responsively.

We already compute a field. `fieldAt(x,y)` sums the gravity vector from every
live body — the same numbers the physics uses. `ferroBlob()` takes that vector
and deforms the outline:

```
k(θ) = 1 + 0.30·s·pole + 0.55·s·pole·cones + wobble
pole  = |cos(θ − fieldAngle)|⁴          both poles, as a real droplet does
cones = max(0, cos((θ − fieldAngle)·7))¹⁰   the spike comb, concentrated at the poles
```

So **the spikes are a readout of the physics.** The droplet visibly reaches
toward whatever is pulling hardest on it, and the spikes lengthen as it falls
in. The aesthetic and the mechanic are the same object.

Verified numerically: the longest spike tracks the field to within 1°, and blob
elongation scales smoothly from 1.09× when calm to 2.1× at full field with no
degenerate geometry.

Rendering is matte near-black with a thin oil-slick rim (a linear gradient
across the field axis, violet → cyan → gold) and one hard specular. Ferrofluid
is not shiny all over; it is black with an iridescent edge.

The deck was darkened to read as machined metal so the fluid stands against it.
The black hole is now a ferrofluid vortex: three sheared spike crowns rotating
at different rates around a true black core.

Background is a procedurally generated starfield, seeded and baked once per
resize into an offscreen canvas.

### 14.2 What to generate, and what not to

**Do not generate:** the droplet, the bodies, the hole, the deck. They are all
procedural and field-reactive. A static asset would be a downgrade, not an
upgrade, and it would break the inversion (everything has to deform through the
collapse).

**Midjourney — use it before it lapses, on things that cannot be regenerated:**
- 2–3 *seamless, tileable* deep-space background plates. Compress hard to WebP,
  under about 60 KB each. More than that fights the single-file workflow.
- An oil-slick / thin-film iridescence reference sheet, purely to pick the rim
  hue ramp by eye. This is reference, not shipped art.
- A colour key for the inverted side, which is currently just a mathematical
  negative and probably needs an art decision.

**Meshy — low value right now.** The one experiment worth trying is a
ferrofluid spike crown rendered as a 32-frame turntable sprite sheet, purely to
compare against the procedural version. If procedural wins, and it likely does
because it responds to the field, skip 3D entirely until there is a 3D build.

**ChatGPT — best used as a second pair of hands on code**, not art: an SVG icon
set for the part palette, or a first pass at the WebGL shader below.

### 14.3 The real quality ceiling is a shader

The current blob is a canvas path, so two droplets cannot merge and there is no
true refraction. If the look needs to go further, the move is a WebGL fragment
shader doing metaballs plus noise, with screen-space refraction and a sharp
specular. Still a single file, no dependencies, since WebGL is native. That is
where the quality jumps, not in generated assets.

### 14.4 The far side varies per hole

A strict negative is one look, and it rendered the fluid as white-on-white. The
far side is now a per-hole style rather than a fixed operation, so crossing a
different threshold lands you somewhere that looks different:

```js
other: { inv, tint, tintAmt, mode, bloom, bloomColor }
```

Applied as a stack over the finished frame:

1. `difference` white at `invAmt · inv` — the negative, at any strength.
   Below 1 you get a bleached, sun-blown world instead of a true negative.
2. a `tint` wash in `mode` (default multiply) — this is what stops the fluid
   reading as white-on-white, and it is where the far side gets a character.
3. an optional `bloom` in `screen`, to lift the blacks so the inverted sky is
   not flat.

Currently authored:

| Hole | Far side |
|---|---|
| Maw | full negative, heavy rust-orange multiply, dark red bloom — hot, seared |
| Nix | 72% negative, deep teal multiply, cold bloom — bleached and drowned |

This makes the hole a *destination* rather than a switch: which threshold you
cross decides what world you arrive in. Worth extending so the far side also
changes gravity strength or the ferrofluid rim hues, which would make the
difference mechanical as well as visual.


---

## 15. v5.1 — the far side changes what things are

The far side is no longer only a colour treatment. A hole's `other` block now
carries mechanics:

```js
other: { inv, tint, tintAmt, mode, bloom, bloomColor,
         gravMul,          // gravity strength on the far side
         hueA, hueB }      // ferrofluid rim hues over there
```

`gravMul` is live in both the physics and the predictor, because both run
through the same `flyStep`. Measured at a fixed point in `Two minds`: field
magnitude 910 on the near side, 1365 on the far side, exactly the authored 1.5×.

### Role-flipping bodies

The bigger addition. A body can carry `targetSide`, and it is your goal only
when `inversions % 2` matches. Otherwise it is a hazard that kills you.

```js
const isTarget = b => b.targetSide !== undefined
  ? (inversions % 2) === b.targetSide
  : !!b.target;
```

This runs through collision, gravity, assist credit, halo colour, rim hue and
label colour, so a flipped body visibly changes from red hazard to cyan target
at the moment of inversion.

### Two minds

The level built on it. Vex sits directly between the deck and the hole Cess.
From this side Vex is lethal. You must thread past it, drop into Cess, and come
back out to land on the thing that was trying to kill you.

Outcomes across 120 port angles:

| | LAND | crash into Vex | miss |
|---|---|---|---|
| Two minds | 24 | 35 | 61 |
| Inside out | 26 | 0 | 94 |

35 crashes means Vex is a real threat rather than scenery, and 24 landings means
the route exists. Every one of those landings is necessarily post-inversion,
since Vex cannot be landed on from the near side by definition.

### Authored far sides

| Hole | Look | Gravity |
|---|---|---|
| Maw | full negative, rust multiply, red bloom — seared | 1.35× |
| Nix | 72% negative, teal multiply, cold bloom — drowned | 0.65× |
| Cess | 86% negative, green multiply, dark bloom — verdant | 1.50× |

Nix is worth noting as the interesting one: weaker gravity on the far side means
flatter, faster trajectories over there, so the same shot behaves differently
depending on which threshold you crossed.

50 of 50 checks pass across 8 levels.


---

## 16. v6 — undoing the port system

Playtest verdict from the owner, and it was correct: the ball bounced around
inside the deck and would not launch, the deck was far too small on screen, and
the spin looked slow even at maximum.

### 16.1 The port system is gone

v3 made the ball unable to leave except through a Port placed during the build
phase. If you did not place one, the ball could never get out — it just rode the
wall forever. That is a design defended only by a tutorial, and it failed the
first contact with a real player.

**Release is now unconditional.** Press it, or simply let go of the throttle,
and the ball leaves on its current tangent from wherever it is. One gesture.

Letting go of the throttle *is* the launch, which is what the owner asked for
literally. The Launch button remains as an alternative for the same action.

This does undo the build-layer argument from section 12.1 — parts now serve
gates and balance rather than deciding the launch. That argument was sound about
where the differentiation lies and wrong about what was fun. The centrifuge deck
is still the unclaimed part; it just should not gate the exit.

The retaining wall stays, because rim-riding and wall friction give the deck its
feel. It retains, it no longer imprisons.

### 16.2 Solvability under the simple control

Sweeping release time in 0.2 s steps to 12 s, 60 samples per level:

| level | landing windows | first window | crashes |
|---|---|---|---|
| First tangent | 9/60 | 0.2 s | 0 |
| Behind you | 9/60 | 0.2 s | 0 |
| Not the nearest | 8/60 | 0.8 s | 7 |
| Around the heavy | 6/60 | 1.2 s | 9 |
| Threading | 9/60 | 0.2 s | 6 |
| Inside out | 15/60 | 0.2 s | 0 |
| Two minds | 14/60 | 1.0 s | 26 |
| Open deck | 16/60 | 1.2 s | 29 |

And the radius/speed trade is clearly readable on level 1:

| hold | release radius | speed |
|---|---|---|
| 0.5 s | 37 | 53 |
| 2 s | 64 | 118 |
| 4 s | 94 | 204 |

### 16.3 Camera

The deck looked tiny because the camera was framing an entire solar system while
the player aimed on a 100-unit disc — deck radius came out around 32 px on a
phone.

Now two framings, blended smoothly by `camZ`: while spinning the deck fills
about 68% of the short dimension, and on release the camera pulls out over
roughly a third of a second to follow the shot. Bodies that fall off screen get
an edge chevron with their name and live distance, colour-coded for target,
hazard and hole, so you always know where everything is without being zoomed out.

### 16.4 Legible spin

The disc read as motionless because the spokes were only drawn in build mode and
a plain circle has no visible rotation. Spokes now stay on during the spin, plus
one bright index mark so a full revolution is countable. `OMEGA_MAX` went from
2.5 to 3.05 rad/s.

50 of 50 checks pass across 8 levels.
