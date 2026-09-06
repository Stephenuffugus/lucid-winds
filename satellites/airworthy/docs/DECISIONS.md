# AIRWORTHY, decisions

Every line here is a call the plan left to the builder, taken in the smallest
reasonable way, with the reason. Dated 2026-09-06.

## The model

**The plan's model as written does not fly.** Every plane it names dives into the
floor inside a second and the phugoid the whole game is built on does not exist.
Section 5 of the plan says that if the Porpoise assertion fails the model is
wrong and not the test, so here is what changed. The full list with its numbers
is in the plan's section 13; these are the calls.

- **The pitch damping is integrated implicitly.** A paper plane's moment of
  inertia is about nine millionths, so that term alone is stiff at 120 Hz and
  explicit Euler turns the flight into Infinity inside a fifth of a second.
- **The stability term is MINUS the margin.** With a plus a stable plane
  diverges. Positive Cm is nose up, `margin = cp - cg`, and positive margin is
  stable, which is what the plan says in words and the opposite of its formula.
- **cp is 0.45 of the chord, not 0.25.** The plan's cp sits ahead of every cg the
  folds can produce, which makes every plane unstable including its Cruisers.
- **Cm0 is positive.** With the plan's minus 0.02 every plane trims to negative
  lift.
- **Positive elevator is the trailing edge UP and pitches the nose up.** This is
  what a child means by "bend the back up so it climbs", and it is the reading
  that makes the plan's own porpoise spec porpoise and its two bends of minus
  four fix it.
- **A stalled wing pushes its own nose down.** Without it a plane trimmed beyond
  its stall pitches up for ever and the porpoise is a slow loop instead of a
  swoop.
- **The drag is tripled.** The plan's numbers give a glide ratio over twenty and
  a thirty metre flight; paper is nearer seven and eight to twenty two metres,
  which is the size of a gym.
- **The wing area runs 80 to 380 square centimetres**, not 100 to 300. At the
  plan's spread a Floater flies exactly like a Cruiser and no classifier can
  tell them apart because there is nothing to tell.
- **The gentlest throw is 3 metres a second.** A wide winged floater trims below
  three, so a floor of four means every throw is at least half again its trim
  speed and it zooms and stalls.
- **The archetype thresholds come from the model.** The plan asks for a Lawn Dart
  at 35 degrees of descent and a Dart over 7 metres a second and this model
  produces neither for any fold. What separates the six is mean speed, pitch
  swing, airtime, and above all how far past the stall the nose gets: a porpoise
  reaches 62 degrees of angle of attack and a tumbler 77, while their pitch
  swings are the same to a tenth of a degree.

## The field

- **The camera scrolls sideways and holds its height.** Tracking the plane's y as
  well glues it to one spot in the frame and takes the floor out of shot, and
  then the swoop the whole game is about is invisible: six panels of a plane in
  the middle of a beige rectangle. It only rises to follow a plane about to
  leave the top, and never below the floor.
- **The gym starts you with the badly trimmed plane.** The first thing a player
  ever does is watch it porpoise and fix it, which is the design's own account
  of the sacred part.
- **A repeat throw is eight degrees at half power.** At that throw the starting
  plane porpoises and two bends of the elevator turn it into a keeper. A steeper
  throw re excites it, which is true to a real plane and is what the result
  card's line is for.
- **The flight is played back off the trace the sim already produced.** The sim
  runs the whole flight the moment you let go; the field plays it at real speed.
  A live integration would give the same answer and could drift from the trace
  that the result card and the ghost are built from.

## Scope

- **The workshop, the wind tunnel, the hangar, sound and share links are P2 and
  P3.** The buttons that lead to them say so rather than doing nothing.
