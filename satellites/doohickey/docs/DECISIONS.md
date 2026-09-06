# DOOHICKEY, decisions

Every line here is a call the plan left to the builder, taken in the smallest
reasonable way, with the reason. Dated 2026-09-06 unless it says otherwise.

## The engine

- **The engine is Burr Blast's, copied whole.** The only change on the way in
  was the plan's section 3.4: `vrot` is the one place it reached for a
  transcendental, and it now goes through the Keepsies deterministic maths.
  Everything else added (a pin joint, a rope, a fan cone, buoyancy, a state
  hash) sits below it and does not touch the solver.
- **The rope's inequality is written ONCE.** An early return and a clamp say the
  same thing, and with it written twice a mutation of either half changes
  nothing and no gate can see it. The clamp alone is a complete rope.
- **`stateHash` sorts by body id.** Two players who built the same machine in a
  different order must land on the same bytes.
- **The world takes gravity as a NUMBER.** Passed a vector it reads `{x,y}` as a
  scalar and every body integrates to NaN on the first step, silently.

## The numbers that moved from the plan

- **`DOMINO_W` 10 to 8.** At the 0.55 spacing the plan's ten wide domino left a
  gap of 7.6 units and a leaning domino could not reach the next one: 67 of 100
  trials. At 8 it is 100 of 100 at all three spacings with the plan's friction
  untouched. It is also what a domino looks like.
- **The balloon's cargo, 0.5 to 0.16.** It has to be lighter than the balloon's
  spare lift, which is `(LIFT - 1) x balloonMass = 0.18`, or the pair sinks. And
  close to it, or the pair rises so fast the fan cannot steer it and the level is
  a formality.
- **"Fallen" is 20 degrees off upright, not lying flat.** In a tight row a domino
  topples onto the next one and rests at about `asin(gap / height)`, which at the
  0.55 spacing is 33 degrees. Measuring for 51 called a perfectly good cascade a
  failure.

## The levels

- **Every level was laid out against the simulator, not by eye.** The first six
  were placed by hand and five missed: a marble dropped at x=96 sails past a
  plank that spans 134 to 226. Every coordinate in `LEVELS` is where it is
  because `sim.js --solve` says the marble arrives.
- **Level 1's cascade used to run backwards.** The ramp ended high, the marble
  sailed over the row, landed in the middle of it, and the dominoes fell away
  from the bell. The marble now arrives on the floor and meets the first domino.
- **Level 2 is a seesaw BRIDGE, not a catapult.** A pinned plank in this engine
  tips and the marble rides down it; it does not fling a second marble, because
  the launch marble slides off the end rather than being thrown. A bridge over a
  pit is what the part actually does, and the pit is wider than a plank so the
  seesaw is the only way across.
- **Level 3 has no ceiling.** A balloon pressed into one loses more to friction
  than the plan's fan can push, so the level is open air: the balloon rises
  slowly and the fan blows it sideways, and where you let it go decides whether
  it reaches the bell.
- **Level 4's bell sits at the foot of the post.** With it anywhere else the
  marbles reach it on their own and the bucket is decoration. There, only the
  toppling bucket gets to it.

## The screens

- **GO and STOP are both in the top centre.** In landscape the scene is 16:9 and
  so is the screen, so every button sits ON the board and the only question is
  what it covers. The bottom right holds the bell in four levels out of six, and
  the bottom centre holds the floor, which is where dominoes and bells live. The
  top centre is sky in every level. This is a deliberate departure from the
  plan's "GO bottom right".
- **The tray is a dock in landscape and a wrapped block above the corner in
  portrait.** A scrolling row along the bottom scrolls straight into the bottom
  left 120 by 120, which belongs to the fleet's music chip.
- **The handles are 72 px above the part, clamped to the screen.** Under the
  finger is under the thumb, and a thumb hides what it is pressing.
- **The ghost's overlap test runs through the engine's own `collide`.** A
  bounding box says a tilted plank overlaps things it does not touch, and a
  player who is shown a red that is not true stops believing the red. Touching
  is not overlapping: the test allows 1.5 units of penetration, because a domino
  STANDS on the floor.

## Scope

- **Sound, share links, film, the sandbox, the spring pad, the switch and the
  cat are P2 and P3.** The buttons that lead to them say so rather than doing
  nothing.
