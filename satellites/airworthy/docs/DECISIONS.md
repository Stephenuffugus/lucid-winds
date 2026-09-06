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

## The workshop

- **Six creases, five of them a choice.** The last one is "press every crease
  flat", which carries only the precision bar: a real plane's last fold is not a
  decision, it is a thumbnail down a seam.
- **The precision of a plane is the MEAN of its creases**, so one bad fold does
  not ruin it and six good ones are worth something. A press in the middle of
  the bar scores one and a press at the edge scores near nothing.
- **The label on the precision bar sits above the marker's lane.** Behind it, a
  five pixel bar sweeping through a line of text makes both unreadable.
- **In landscape the workshop's chrome is a column down the side.** Stacked
  under the paper it takes 307 pixels of a 375 pixel screen and there is no
  paper left to fold. The plan calls the workshop portrait; this is what
  "landscape widens the same room" means for it.
- **The sheet is drawn top down with its creases**, and the "N of 6 creases
  pressed" label is centred over the PAPER rather than the window, because in
  landscape the window's middle is behind the chrome.
- **The preview names the archetype only after the first flight**, as the plan
  asks. Before that it shows mass, area and stability margin, which are facts
  rather than a spoiler.

## The hangar

- **A hangar card is a PLAN view, from above.** The gym draws the plane in
  profile, and in profile a wide wing and a narrow one are the same picture: a
  hangar of profiles is a row of identical grey arrowheads and the folds that
  make each plane different are exactly what you cannot see.
- **Delete asks twice** by turning into REALLY, rather than opening a dialog.
- **The names come from a list of twelve** and are handed out in order, so a
  hangar reads as a shelf of planes somebody named rather than "Plane 4".
- **A toast on a list screen comes from the top.** Anchored to the bottom it
  sits on the button at the end of the list.

## Scope

- **The wind tunnel, the courses, the medals and the rest of the sound are P3.**
  The buttons that lead to them say so rather than doing nothing.

## P3 step 1, the wind tunnel

- **A stalled wing is a barn door, and the tunnel is what found it.** Drawn
  against the same drag the plane flies on, the drag arrow SHRANK when the wing
  let go, because induced drag follows CL and CL falls in a stall. Added
  `CD_STALL` at 0.45 per radian past the stall. Swept 0.3, 0.45, 0.6, 1.2 against
  the archetype table: at 0.6 and above the starting plane tumbles instead of
  porpoising, at 0.45 every archetype still classifies and nothing that does not
  stall changes by a millimetre.
- **The starting plane's elevator came down from 6 to 4.** With post stall drag
  the swing runs deeper, and at 6 the plane the game hands you tumbles on a hard
  throw. At 4 it porpoises across the whole pull, from a timid throw to a full
  one, which is what the opening lesson needs.
- **The throw gate's bend moved from minus two to minus four** for the same
  reason. The assertion is unchanged: a trimmed porpoise becomes a keeper.
- **One sim assertion was replaced, not weakened.** "A tumbler stalls more often
  than a porpoise" tied at two against two once drag shortened both flights. The
  count never was the definition; the plan calls a tumbler two or more stalls.
  It is now two assertions: the tumbler stalls at least twice, and it pays more
  for it than a porpoise does. Both watched red.
- **The angle dial runs to 28 degrees, not the plan's 20.** The plan's own gate
  wants the lift arrow to collapse by at least half past the stall, and with the
  plan's own STALL_DROP of 2.5 the deepest stall reachable at 20 degrees is a 42
  percent drop. The dial is the cheap end to move; the coefficients are the end
  with seventy seven assertions on them.
- **The arrows are drawn against the most lift the wing can make at this wind,
  not against the plane's weight.** A tunnel run at eight metres a second makes
  a paper plane fifteen times its own weight in lift and every arrow pins at the
  top of the glass. Its weight is still marked, as a line to clear.
- **The streamlines carry a visual gain of 3.6.** A true bound vortex on a paper
  wing bends the flow about a tenth of the free stream, which on a phone is a
  picture of straight air. The gain is a magnifying glass on the real CL and the
  mapping stays monotonic, which is the plan's own law for this picture.
- Noted for later: the sim fixtures fly at 5 degrees while the field's default
  throw is 8. Both are honest, but the fixtures would describe the game the
  player plays a little better at 8.

## P3 step 2, the courses, the challenges and the medals

- **Every challenge prescribes its throw.** With a free throw the six collapse
  into two: any plane with the range throws softer until it lands on an accuracy
  mark, and a good glider wins distance and airtime both. Measured: one fold
  took gold in five of the six. With the throws set, the distance winner has a
  wing of 0.15 and the airtime winner a wing of 0.99, and no fold takes more
  than three. The sling stays free in the gym with no challenge selected.
- **A challenge's air never changes.** The plan wanted a gust seeded by the day.
  A medal earned on a still Tuesday and one earned into Friday's gust are not
  the same medal, and the thresholds in the file were measured once. The gust is
  seeded from the challenge id, so the tool and the thumb fly the same air.
- **Gold on an accuracy challenge means you hit the thing.** Taken from the
  percentile alone, gold on a desk two and a half metres wide was three and a
  half metres off it. Gold is capped at the zone's half width.
- **The marks moved to where planes actually land.** The desk was at 14.5 m and
  the middle of forty planes lands at 8.5 m from that throw. A mark nobody
  reaches is not a challenge, it is a wall. The test asserts the mark is within
  2.5 m of the median landing.
- **The ghost is your best flight on that challenge, not your last.** A ghost
  overwritten every throw is a mirror, and a mirror cannot be beaten.
- The thresholds are written by `node sim.js --medals --write` between the
  MEDALS markers. Hand editing one makes a medal mean nothing.
