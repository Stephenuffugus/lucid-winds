// AURA OFF — BAIT moves. Pure data, no logic.
//
// Nine moves, in CONTRACT.md §9 order. Every id/name/cat/tier/base/up/lo/
// idealAmp/special is copied from that table verbatim and is not ours to move.
// The choreography, dur, lag and hint are authored here.
//
// Rig (CONTRACT §2, frozen):
//   rot bob lean head sL eL sR eR hL kL hR kR
//   UPPER = lean head sL eL sR eR      LOWER = rot bob hL kL hR kR
//
// Sign convention is rig.js's, not the bible's prose: arms WIDE is sL positive
// / sR negative, arms CROSSED is sL negative / sR positive, negative elbow
// raises the forearm, negative knee bends it, POSITIVE bob is DOWN, and `rot`
// swings the whole body about the feet — it is the joint that performs a fall.
//
// Rest pose is all zeros and a joint omitted from a keyframe IS zero, never
// "hold previous". So the joints named in a frame are exactly the joints doing
// something, and a 100/0 move simply never names a lower joint.
//
// ── WHAT THE GEOMETRY ACTUALLY ALLOWS ──────────────────────────────────────
// Four measured facts about the rig in `figureMarkup`'s 120×220 viewBox. They
// are not opinions; every one of them was found by running forward kinematics
// over these clips and looking at the render, and every one of them was being
// violated by the previous draft of this file.
//
//  1. THE HEAD IS A CIRCLE ON A SHORT NECK, SO `head` IS VISUALLY SILENT.
//     `head` rotates the head group about an anchor 11 units below the circle's
//     centre, so head:30 — the top of its legal range — slides the head about
//     SIX units sideways in a 120-wide box. A move whose whole content is a
//     head movement therefore renders as a figure standing perfectly still.
//     `eyeroll` and `doubletake` are both head jokes and both used to be
//     invisible. They now carry the turn on `lean` and the arms, and keep
//     `head` for the detail rather than the reading.
//
//  2. THE LEGS CAN ONLY SHORTEN ABOUT TEN UNITS, SO `bob` IS TINY.
//     Knees hinge one way and stop at −40; hips stop at ±40. Fold both as hard
//     as the rig allows and the hip only drops about ten units before the feet
//     have to leave the floor. So on a feet-planted move the ceiling on
//     `bob × idealAmp` is whatever the SHALLOWER leg is currently giving up:
//     about 10 with both knees folded hard at the same instant (`clog` at its
//     plant), 2 or 3 with one leg near straight (`buckle`, `noodle`). The old
//     file ran bob to 35 and 45 at ideal amplitude regardless, which put both
//     feet a quarter of a body length underneath the pavement. THE HIP DROP IS
//     NOT WHERE A CROUCH READS — the knee shape is. A jutting knee at bob 3
//     reads; bob 30 just buries the feet.
//
//  3. `rot` PIVOTS ABOUT THE FEET, AND THE FIGURE IS TALLER THAN THE BOX IS
//     WIDE. The head sits 145 units above the pivot in a box 120 wide, so past
//     about −25° the head is outside the viewBox and by −88° the body lies
//     across the full width and beyond. That is not a bug to design around: it
//     is what falling over looks like, `.fighter > svg` is `overflow:visible`
//     so it all still draws, and `bob` slides the body back along its own axis
//     once it is near horizontal, which is how `collapse` lands on screen.
//     What it does mean is that only ONE move can afford it.
//
//  4. THERE IS NO MIRRORING, SO THE TWO ARMS ARE NOT EQUIVALENT. A bent right
//     elbow points the forearm AWAY from the body; the same bend on the left
//     points it ACROSS the body. A symmetric two-handed shrug is not available.
//     Asymmetric gestures are — and they read better on a stick figure anyway.
//
// ── ON AMPLITUDE ───────────────────────────────────────────────────────────
// Amplitude multiplies every joint value (CONTRACT §4.2), and BAIT carries the
// highest idealAmps in the game — 1.10 to 1.50. So these poses are authored
// PRE-multiplication: the number in the frame times the move's own idealAmp is
// the angle the move is actually meant to hit, and the awkward decimals below
// are that division, not sloppiness. Dead Drop reads `rot: -58.7` and lands at
// −88 at its ideal 1.50, which is the angle AURA-BIBLE §2.6 documents.
//
// ── ON CONTENT SAFETY (CONTRACT §7) ────────────────────────────────────────
// BAIT is SELF-directed clowning. Falling over, legs giving out, cracking
// yourself up. Nothing in this file is aimed at the other competitor — not a
// name, not a hint, not a gesture. Two choreography choices exist only for this
// reason: `losingit` keeps the hand clamped on your OWN face right through the
// shake instead of letting it swing out to chest height on the up-beat, and
// `doubletake` ends with the arm back at your side. Both of those are hard to
// read as anything but a gesture across the square when they are held.
// `lasso` is the single documented exception and it is a rope gag: the rope
// goes UP and OUT over the square, and the joke is the person holding it
// walking away with a shoe.
//
// Note also that `rot` and `lean` negative both read as "away from the other
// fighter" for BOTH sides, because `#them` is mounted with `flip:true`. That is
// why the fall goes negative.
//
// `lag` is the milliseconds the upper body trails the lower, set only on the
// three lower-led moves (lo > 0.5). Those three are the whole reason the rule
// exists: a fall, a boneless wobble and a knee giving way are all physics the
// torso finds out about late.

export const BAIT_MOVES = [

  // ── DEAD DROP ──────────────────────────────────────────────────────────
  // AURA-BIBLE §2.6 — the only move in the game where the LOWER body leads.
  // Documented as a deliberate, committed fall to the ground, held; the comedy
  // is total commitment, so nothing here hedges. At idealAmp it lands on the
  // bible's `rot` −88 and its arms out at ∓96, with `bob` at +54 against the
  // documented +58.
  //
  // The order is the physics. Knees soften first (the tell), the hips go past
  // the tipping point second, the arms come out third and only once it is
  // already too late to save it, and the last frame is a settle, not a bounce.
  //
  // FOUR THINGS THIS MOVE HAS TO GET RIGHT, AND TWO IT CANNOT:
  //   · `bob` stays at ZERO through the tip. `rot` pivots about the feet, so a
  //     fall with bob 0 keeps the ankles exactly on the pivot — that is what a
  //     body going over its own feet is. bob only ramps from t 0.74, once the
  //     body is near horizontal and bob slides it ALONG the ground instead of
  //     into it. Ramping bob early is what used to drive the feet twelve units
  //     under the pavement while the figure was still upright.
  //   · The arm signs INVERT relative to the standing convention at the top of
  //     this file, and that is deliberate. Once the body has rotated 88° the
  //     words "wide" and "crossed" have stopped describing anything; what
  //     decides the picture is where the hands end up. Negative sL/sR throws
  //     both arms to the world-UP side of a body that is now lying down, so
  //     they land flung above the head. The mirror of these numbers puts a hand
  //     sixty units underneath the pavement, which is precisely what the
  //     previous version shipped.
  //   · The knees fold on the landing (kL −38, kR −28 at ideal). Legs left
  //     straight read as a felled plank; drawn up they read as a person who
  //     threw themselves down.
  //   · `hL/hR` run slightly POSITIVE, and this is the one bible number the
  //     move does not hit. Its −18 rotates the legs to the world-up side of a
  //     body that is already horizontal, which lifts both feet about forty
  //     units clear of the pavement — the "launched off their feet" silhouette
  //     the old version shipped. Near zero, the landing keeps the feet on the
  //     deck. The exact value is a trade against amplitude, see below.
  //   · It CANNOT end fully prone inside its own box — see geometry note 3.
  //     The head lands 28 units past the left edge and draws there (about 22px
  //     inside the screen on a 375-wide viewport, measured, not eyeballed).
  //   · It CANNOT be clean at every amplitude. `bob` and `rot` scale together
  //     but the geometry does not: bob slides the body horizontally once `rot`
  //     is near −88 and downward when it is not, so an under-committed drop
  //     drives its own feet into the ground. Worst case is 16 units of ankle
  //     below the floor at amp 0.7 — down from 25 before `hL/hR` and `bob`
  //     were traded for it, and it costs the ideal landing 10 units of foot
  //     lift. Amplitude runs 0.4…1.9 and a whiff commits the floor of that
  //     (AMP_RANGE, scoring.js), so the low end is not a hypothetical.
  //
  // lag 120 is the bible's own number and it is what sells the drop. The feet
  // have finished falling while the arms are still on their way out.
  {
    id: 'collapse',
    name: 'Dead Drop',
    cat: 'BAIT',
    tier: 'V1',
    base: 64,
    up: 0.3,
    lo: 0.7,
    idealAmp: 1.50,
    dur: 1500,
    hint: 'Knees go first, arms go last. Commit to the whole fall, land flat, and stay down.',
    lag: 120,
    special: 'highRisk',
    frames: [
      { t: 0 },
      { t: 0.14, rot: -2.7,  bob: 1.1,  lean: 1.3,                                                            hL: 8,   kL: -12,   hR: 8,   kR: -12 },
      { t: 0.32, rot: -16,   bob: 0,    lean: 4.7, head: 4,   sL: -17.3, eL: -5.3,  sR: -6.7,  eR: -4,        hL: 4,   kL: -6.7,  hR: 4,   kR: -6.7 },
      { t: 0.54, rot: -33.3, bob: 2.3,  lean: 6.7, head: 6,   sL: -40,   eL: -12,   sR: -16,   eR: -8,        hL: 1.3, kL: -4,    hR: 1.3, kR: -4 },
      { t: 0.74, rot: -48,   bob: 12.5, lean: 6.7, head: 6.7, sL: -56,   eL: -17.3, sR: -26.7, eR: -12,       hL: 0.8, kL: -5.3,  hR: 0.6, kR: -5.3 },
      { t: 0.88, rot: -58.7, bob: 37.4, lean: 6.7, head: 8,   sL: -64,   eL: -24,   sR: -38.7, eR: -14.7,     hL: 2,   kL: -26.7, hR: 1.1, kR: -20 },
      { t: 1,    rot: -57.3, bob: 36.3, lean: 6,   head: 7.3, sL: -62,   eL: -22.7, sR: -37.3, eR: -14,       hL: 1.7, kL: -25.3, hR: 1,   kR: -18.7 }
    ]
  },

  // ── LASSO ──────────────────────────────────────────────────────────────
  // AURA-BIBLE §2.7. A competitor did this with a large white sandal for a
  // rope and won the whole thing. Three beats, in order: an overhead cone
  // twirl, a throw, then a walk-away tug with the rope over the shoulder.
  //
  // A cone has an azimuth and this rig does not, so the cone reads as `sR`
  // swinging between the far side (−164 at ideal) and the near side (−116)
  // while `eR` counter-rotates out of phase to keep the loop level — that
  // counter-rotation is the difference between a twirling rope and an arm
  // waving. `lean` sways ±7 following the arm, as documented. The bible's
  // −146 → −166 is a 20° sweep and it disappears at this scale; opened to 48°
  // it reads as a rotation instead of an arm held up, which is the point of
  // the description rather than the letter of it.
  //
  // Two revolutions, then the throw: the arm comes down and the elbow finally
  // extends. The throw goes UP and OUT, not flat across — a rope thrown over
  // the square, never at a person. Then the walk-away: right hand folded to
  // the shoulder with the line over it, left hand down on the rope, torso
  // leaning back the OTHER way and one leg stepping under the haul.
  //
  // Lower is 15% and does what the bible says it does — weight passing foot to
  // foot under the twirl, then one step back on the pull (`hL` 11.4 → +16 at
  // ideal, the documented +16). Not enough to earn a lag, so lag stays 0.
  {
    id: 'lasso',
    name: 'Lasso',
    cat: 'BAIT',
    tier: 'V1',
    base: 56,
    up: 0.85,
    lo: 0.15,
    idealAmp: 1.40,
    dur: 2000,
    hint: 'Twirl it overhead until the loop runs level, throw it up and out on the beat, then step back and walk it off over your shoulder.',
    lag: 0,
    special: 'debuff',
    frames: [
      { t: 0 },
      { t: 0.13,            lean: 2.9,  head: -2.1, sL: -4.3,  eL: -10, sR: -68.6,  eR: -31.4 },
      { t: 0.28,            lean: -5,   head: 4.3,                      sR: -115.7, eR: -10,                            kR: -4.3 },
      { t: 0.42,            lean: 5,    head: -3.6,                     sR: -84.3,  eR: -44.3, hL: 3.6,  kL: -5 },
      { t: 0.56,            lean: -5,   head: 5,                        sR: -117.1, eR: -8.6,                 hR: 4.3 },
      { t: 0.68,            lean: 5,    head: -3.6,                     sR: -82.9,  eR: -45.7, hL: 2.9,  kL: -4.3 },
      { t: 0.82, bob: 2.1,  lean: 7.1,  head: -4.3,                     sR: -78.6,  eR: -5.7,                 hR: 7.1,  kR: -5.7 },
      { t: 1,    bob: 3.6,  lean: -7.9, head: -5,   sL: -24.3, eL: -40, sR: -18.6,  eR: -94.3, hL: 11.4, kL: -8.6, hR: -4.3 }
    ]
  },

  // ── UNIMPRESSED ────────────────────────────────────────────────────────
  // AURA-BIBLE §2.10: the eyes roll up and around roughly 12°, then settle
  // with a tilt and a half smile. Documented as irony and complicity — used to
  // DEFUSE a situation, which is why it counters a big move instead of topping
  // one. Deflation as a mechanic.
  //
  // The bible's move is entirely a face, and a face is the one thing this rig
  // does not have (geometry note 1: `head` at its legal limit moves the head
  // six units and renders as nothing). Authored literally, this move was a
  // figure standing perfectly still for 1400ms — measured `reach().upper` of
  // 11, the smallest number in the game, on a move the crowd is supposed to
  // read as a reaction. So the roll is kept on `head` for the detail and the
  // move is CARRIED by the body language that comes with an eye roll: the
  // torso reclines fourteen degrees and does not come back, and one shoulder
  // opens into a slack palms-out shrug that lands late and stays.
  //
  // The shrug is one-sided because the rig cannot do a symmetric one — a bent
  // left elbow folds the forearm across the chest, not out (geometry note 4).
  // One shoulder is the better gesture anyway.
  //
  // 100/0 and it means it: not one lower joint appears in any frame, so
  // `reach().lower` is exactly 0. Smallest choreography in the file on
  // purpose — it is a 40-base move that gets its value from the counter, and
  // overplaying it would cost composure. Small is not the same as invisible.
  {
    id: 'eyeroll',
    name: 'Unimpressed',
    cat: 'BAIT',
    tier: 'V1',
    base: 40,
    up: 1.0,
    lo: 0.0,
    idealAmp: 1.10,
    dur: 1400,
    hint: 'Dip the chin, roll it up and all the way around, then let one shoulder come up and stay up. Keep reclining. Feet never move.',
    lag: 0,
    special: 'counter',
    frames: [
      { t: 0 },
      { t: 0.16, lean: 5.5,   head: -9.1,                        sR: -5.5 },
      { t: 0.38, lean: -9.1,  head: 23.6,                        sR: -12.7, eR: -23.6 },
      { t: 0.58, lean: -11.8, head: 7.3,                         sR: -20,   eR: -41.8 },
      { t: 0.78, lean: -13.6, head: -20,   sL: 16.4, eL: -30.9,  sR: -27.3, eR: -63.6 },
      { t: 1,    lean: -12.7, head: -16.4, sL: 14.5, eL: -28.2,  sR: -25.5, eR: -60 }
    ]
  },

  // ── LOSING IT ──────────────────────────────────────────────────────────
  // This move used to be called "Point & Laugh" and it shipped three times.
  // It is now the opposite move and the rename is not cosmetic: the target of
  // the laugh is the person performing it. Something strikes you funny and you
  // lose the whole fight to it.
  //
  // The order is how a real laugh actually collapses a body. Head snaps BACK
  // first and the chest opens — that is the crack. Then the torso folds
  // forward at the waist and one hand slaps up over your own face. The second
  // hand goes down to your own knee to hold you up. Then two shake bounces,
  // and the shake is the whole move: the previous version separated its bounce
  // frames by three degrees, which is under the noise floor at this scale and
  // rendered as a held pose. They are eight to eleven degrees apart now, so
  // the body visibly bounces.
  //
  // The face hand never leaves the face. On the up-beat of each shake the
  // elbow stays folded past −118 at ideal rather than swinging out to chest
  // height, because an arm extended across the square at chest height is the
  // one silhouette this move must never make (CONTRACT §7).
  //
  // 80/20. The knees soften and the hips fold, but they are only there to let
  // the fold happen; every large number in the move is above the waist, and
  // `bob` is held at 4 at ideal — the whole budget the legs have (geometry
  // note 2). The old value of 9 put both feet eleven units under the paving.
  {
    id: 'losingit',
    name: 'Losing It',
    cat: 'BAIT',
    tier: 'V3',
    base: 50,
    up: 0.8,
    lo: 0.2,
    idealAmp: 1.40,
    dur: 1700,
    hint: 'Head back on the crack, then fold at the waist, one hand clamped over your own face, the other down on your own knee. Let the shoulders do the shaking.',
    lag: 0,
    frames: [
      { t: 0 },
      { t: 0.1,  bob: 0,   lean: -7.9, head: -11.4, sL: 10,   sR: -10 },
      { t: 0.28, bob: 2.9, lean: 12.1, head: 12.9,  sL: 8.6,  eL: -10,   sR: -24.3, eR: -88.6, hL: 11.4, kL: -21.4, hR: 11.4, kR: -21.4 },
      { t: 0.44, bob: 2.9, lean: 13.6, head: 15,    sL: 13.6, eL: -17.1, sR: -28.6, eR: -95.7, hL: 15,   kL: -27.1, hR: 15,   kR: -27.1 },
      { t: 0.58, bob: 1.4, lean: 5.7,  head: 6.4,   sL: 5.7,  eL: -7.1,  sR: -21.4, eR: -84.3, hL: 6.4,  kL: -11.4, hR: 6.4,  kR: -11.4 },
      { t: 0.74, bob: 2.9, lean: 13.6, head: 15,    sL: 14.3, eL: -18.6, sR: -30,   eR: -97.1, hL: 15,   kL: -27.1, hR: 15,   kR: -27.1 },
      { t: 0.88, bob: 1.4, lean: 6.4,  head: 7.1,   sL: 6.4,  eL: -7.9,  sR: -22.9, eR: -85.7, hL: 7.1,  kL: -12.9, hR: 7.1,  kR: -12.9 },
      { t: 1,    bob: 0.7, lean: 4.3,  head: 2.9,   sL: 4.3,  eL: -7.1,  sR: -21.4, eR: -81.4, hL: 4.3,  kL: -8.6,  hR: 4.3,  kR: -8.6 }
    ]
  },

  // ── NOODLE LEGS ────────────────────────────────────────────────────────
  // Every bone below the belt is removed and the legs go wherever they like:
  // knees folding in and out of phase, the whole body rolling loosely about
  // the feet. Five wobbles, never twice the same, ending still folded because
  // nothing here recovers.
  //
  // The buckle is the pairing `hL` positive with `kL` about twice as negative.
  // That swings the knee out to one side while the shin comes back under, so
  // the leg makes a zigzag and the FOOT STAYS WHERE IT WAS. Splay the hips
  // apart instead and the rig produces a stride — which is what the previous
  // version did, and it read as a badly animated walk with both feet
  // thirty-five units below the pavement.
  //
  // The roll is `rot`, up to ±13 at ideal. It is the joint doing the "boneless"
  // more than the knees are: a body rocking loosely over its own feet.
  //
  // 10/90 and the 10 is the joke. The face and arms are given almost nothing —
  // a two-degree lean, a two-degree head turn — so the upper body reads as
  // completely uninvolved in whatever the legs are doing. Measured
  // `reach().upper` is 3 against a lower of 44. Give the arms anything to do
  // and the move stops being funny.
  //
  // lag 135, near the top of the legal band. The torso is a passenger and it
  // should arrive late everywhere the legs have already been.
  {
    id: 'noodle',
    name: 'Noodle Legs',
    cat: 'BAIT',
    tier: 'V3',
    base: 52,
    up: 0.1,
    lo: 0.9,
    idealAmp: 1.45,
    dur: 1900,
    hint: 'Take the bones out of both knees and let the legs go wherever, rolling over your own feet. Everything above the belt stays completely blank.',
    lag: 135,
    special: 'persist',
    frames: [
      { t: 0 },
      { t: 0.15, rot: -6.2, bob: 1.4,                            hL: 20.7, kL: -30.3, hR: 5.5,  kR: -11 },
      { t: 0.32, rot: 7.6,  bob: 1.4, lean: 1.4,                 hL: 5.5,  kL: -11,   hR: 23.4, kR: -30.3 },
      { t: 0.48, rot: -3.4, bob: 3.4, lean: -1.4,                hL: 22.1, kL: -30.3, hR: 20.7, kR: -30.3 },
      { t: 0.64, rot: 9,    bob: 1.4, lean: 2.1,  head: -2.1,    hL: 26.2, kL: -30.3, hR: 6.9,  kR: -13.8 },
      { t: 0.8,  rot: -8.3, bob: 1.4, lean: -1.4,                hL: 6.9,  kL: -13.8, hR: 26.2, kR: -30.3 },
      { t: 1,    rot: 2.8,  bob: 2.8,             head: 1.4,     hL: 17.9, kL: -29,   hR: 16.6, kR: -27.6 }
    ]
  },

  // ── FREEZE FRAME ───────────────────────────────────────────────────────
  // Throw yourself into an enormous, badly-chosen shape as fast as you can and
  // then stop dead in it. Two thirds of this clip is the stop. The hold is
  // written into the data — the frame at t 0.32 and the frame at t 1 are
  // identical, so the figure is genuinely motionless for 1088ms rather than
  // drifting. Same trick Cold Read uses, opposite register.
  //
  // The shape is deliberately asymmetric and slightly wrong: LEFT ARM THROWN
  // HIGH (sL 150 at ideal, nearly vertical), RIGHT ARM FOLDED LOW ACROSS THE
  // CHEST (sR 72 with the elbow past −120, so the forearm genuinely crosses
  // the body rather than hovering beside it), torso cranked the opposite way
  // from the raised arm, weight on the left leg with the right knee up. Nobody
  // would choose it. That is why it works, and why it has to be arrived at
  // fast and abandoned never. Both arms sweeping the SAME way — the previous
  // version — reads as reaching, which is a normal thing to do.
  //
  // 60/40, and both halves genuinely work: the raised arm above, a real
  // one-legged stance below. `bob` is 4 at ideal, not 9, because the standing
  // leg can only give up about that much height before the planted foot goes
  // through the floor.
  //
  // lo of 0.4 means no lag by rule — correct here anyway, since a trailing
  // torso would soften the one thing this move is: an instant stop.
  {
    id: 'freeze',
    name: 'Freeze Frame',
    cat: 'BAIT',
    tier: 'V3',
    base: 55,
    up: 0.6,
    lo: 0.4,
    idealAmp: 1.35,
    dur: 1600,
    hint: 'Throw yourself into the shape as fast as you can, then stop dead. Hold it well past comfortable and do not blink out of it.',
    lag: 0,
    frames: [
      { t: 0 },
      { t: 0.1,             bob: 1.5, lean: 3.7,  head: 0,    sL: 29.6,  eL: -13.3, sR: 20.7, eR: -38.5, hL: 4.4,  kL: -8.9,  hR: 7.4,  kR: -11.9 },
      { t: 0.24, rot: -3,   bob: 2.2, lean: 8.1,  head: 14.8, sL: 85.9,  eL: -20.7, sR: 43,   eR: -74.1, hL: 8.1,  kL: -16.3, hR: 17.8, kR: -26.7 },
      { t: 0.32, rot: -3.7, bob: 3,   lean: 10.4, head: 19.3, sL: 111.1, eL: -25.2, sR: 53.3, eR: -90.4, hL: 11.1, kL: -20.7, hR: 23,   kR: -32.6 },
      { t: 1,    rot: -3.7, bob: 3,   lean: 10.4, head: 19.3, sL: 111.1, eL: -25.2, sR: 53.3, eR: -90.4, hL: 11.1, kL: -20.7, hR: 23,   kR: -32.6 }
    ]
  },

  // ── GIANT CLOG ─────────────────────────────────────────────────────────
  // Documented: a competitor turned up and battled with a giant rubber clog.
  // So the move is the clog. Reach down and get two hands under it, drive it
  // up with the legs because it is absurdly heavy, LOCK IT OUT OVERHEAD, hold
  // it up there for the whole square, then bring it down and plant it.
  //
  // Overhead means overhead: sL/sR reach ∓158 at ideal, which is an arm within
  // twenty degrees of vertical. The previous version topped out at ∓93, which
  // is an arm held horizontally — a shrug, not a press — so the one beat the
  // whole move exists for never happened. Ninety is sideways on this rig; a
  // press starts around 140.
  //
  // The weight is the performance. Torso folds forward to collect it, elbows
  // go deep at the chest on the heave, and at the top the body leans BACK
  // under the load with the hips lifted (`bob` negative — up on the toes).
  // Take the strain out and it reads as an empty mime.
  //
  // 80/20 with the legs doing real work at exactly two moments, the collect
  // and the plant, and nothing in between. There is no yaw in this rig, so
  // nothing here turns — the hold is a sway under the load, and the hint says
  // hold rather than promising a turn the figure cannot perform.
  {
    id: 'clog',
    name: 'Giant Clog',
    cat: 'BAIT',
    tier: 'V1',
    base: 60,
    up: 0.8,
    lo: 0.2,
    idealAmp: 1.50,
    dur: 1800,
    hint: 'Two hands under it, drive with the legs, lock it out overhead and hold it up there for the whole square. Then bring it down and plant it.',
    lag: 0,
    frames: [
      { t: 0 },
      { t: 0.15,           bob: 6,    lean: 12,   head: 9.3,  sL: -9.3,  eL: -18.7, sR: 9.3,    eR: -18.7, hL: 18.7, kL: -29.3, hR: 18.7, kR: -29.3 },
      { t: 0.32,           bob: 2.7,  lean: 5.3,  head: 4,    sL: 20,    eL: -76,   sR: -20,    eR: -76,   hL: 9.3,  kL: -16,   hR: 9.3,  kR: -16 },
      { t: 0.5,            bob: 0,    lean: -5.3, head: -4,   sL: 88,    eL: -22.7, sR: -88,    eR: -22.7, hL: 2.7,  kL: -4,    hR: 2.7,  kR: -4 },
      { t: 0.64,           bob: -1.3, lean: -8,   head: -5.3, sL: 105.3, eL: -6.7,  sR: -105.3, eR: -6.7,  hL: 1.3,             hR: 1.3 },
      { t: 0.8,  rot: 4.7, bob: -0.7, lean: -6,   head: 5.3,  sL: 101.3, eL: -10.7, sR: -108,   eR: -9.3,  hL: 2.7,             hR: 1.3 },
      { t: 0.9,  rot: 1.3, bob: 6.7,  lean: 8,    head: 6.7,  sL: 22.7,  eL: -64,   sR: -22.7,  eR: -64,   hL: 14.7, kL: -24,   hR: 14.7, kR: -24 },
      { t: 1,              bob: 3.3,  lean: 5.3,  head: 4,    sL: -5.3,  eL: -26.7, sR: 5.3,    eR: -26.7, hL: 8,    kL: -13.3, hR: 8,    kR: -13.3 }
    ]
  },

  // ── DOUBLE TAKE ────────────────────────────────────────────────────────
  // Look away like it is nothing. Start coming back, slow and unbothered.
  // Then snap round twice as fast as you left, with a hand coming up to your
  // own brow to check, and a second smaller snap behind it. That second snap
  // is the whole move — one turn is a glance, two is a double take.
  //
  // The turn is carried by `lean`, not by `head`. A real double take turns the
  // whole upper body anyway, and on this rig it is the only version that is
  // visible at all: authored on `head` alone (geometry note 1) this move
  // rendered as a figure standing still while an arm moved, which is a
  // completely different and much worse joke. `head` still runs to 28 at ideal
  // underneath, so the neck leads the shoulders.
  //
  // The hand goes to the BROW — elbow past −130 at ideal, folded right up
  // beside your own head — rather than out at chest height. That reads as
  // shading your eyes for another look, and it is unmistakably self-directed,
  // which an arm extended at shoulder height across the square would not be.
  // The clip ends with the arm back down at your side for the same reason: a
  // held final pose is the one the crowd actually reads.
  //
  // 100/0, so no lower joint is named anywhere in it and `reach().lower` is 0.
  // The feet never move and the torso travels 19° while the head travels 28°,
  // and the gap between those two facts is where the comedy is. It is also
  // why this is the `read`: you look twice and you come away knowing something.
  //
  // Speeds are asymmetric on purpose — 0.20 away, 0.10 back. The keyframe
  // spacing IS the joke, so do not even out the intervals.
  {
    id: 'doubletake',
    name: 'Double Take',
    cat: 'BAIT',
    tier: 'V3',
    base: 48,
    up: 1.0,
    lo: 0.0,
    idealAmp: 1.30,
    dur: 1500,
    hint: 'Look away like it is nothing, come back slow, then snap it round twice as fast with a hand up to your own brow, and once more after that. Feet do not move.',
    lag: 0,
    special: 'read',
    frames: [
      { t: 0 },
      { t: 0.2,  lean: -11.5, head: -18.5 },
      { t: 0.38, lean: -7.7,  head: -13.1 },
      { t: 0.48, lean: 13.8,  head: 20.8,                        sR: -23.1, eR: -86.2 },
      { t: 0.6,  lean: 11.5,  head: 17.7,  sL: -6.2, eL: -12.3,  sR: -29.2, eR: -103.1 },
      { t: 0.74, lean: 14.6,  head: 21.5,  sL: -7.7, eL: -13.8,  sR: -26.2, eR: -98.5 },
      { t: 1,    lean: 4.6,   head: 8.5,   sL: -2.3, eL: -4.6,   sR: -6.9,  eR: -20 }
    ]
  },

  // ── KNEE BUCKLE ────────────────────────────────────────────────────────
  // Not Noodle Legs. Noodle is a sustained boneless wobble on both legs; this
  // is one clean catastrophic give-way of a SINGLE knee, caught at the last
  // possible moment and pushed back up on the same leg. One event, not five.
  //
  // The left knee folds to the rig's limit while the right stays comparatively
  // straight and braces, and `rot` lurches the whole body 22° after the
  // collapsed side. The lopsided leg silhouette is what reads — two knees at
  // the same depth is a squat, which is what the previous version looked like
  // once its `bob` of 45 at ideal was taken out. The hips drop as far as this
  // rig physically permits, which is not far (geometry note 2): the read is
  // the shape of the leg and the lurch of the body, not the height lost.
  //
  // Then the catch — the fall arrests over 0.18 of the clip, which is slower
  // than the 0.16 it took to go, because catching yourself is always slower
  // than falling. It is still visibly bent at t 0.78 and only reaches rest on
  // the last frame, so it stands up as if nothing had happened. That is the
  // punchline, and it needs the recovery to finish late or the last third of
  // the clip is just a figure standing there.
  //
  // 10/90 like Noodle, and again the stillness above is doing the work: `lean`
  // never exceeds 7, the arms are not named once, and measured `reach().upper`
  // is 7 against a lower of 44. lag 130 — the torso finds out about the knee
  // well after the knee does, and now that `lean` actually moves, that lag is
  // something you can see.
  {
    id: 'buckle',
    name: 'Knee Buckle',
    cat: 'BAIT',
    tier: 'V3',
    base: 52,
    up: 0.1,
    lo: 0.9,
    idealAmp: 1.40,
    dur: 1600,
    hint: 'Let one knee fold in and lurch after it. Go as low as it takes you, catch it late, and come back up on the same leg like nothing happened.',
    lag: 130,
    frames: [
      { t: 0 },
      { t: 0.1,                 bob: 0.7,                         hL: 6.4,  kL: -11.4 },
      { t: 0.26, rot: -12.9,    bob: 1.4, lean: 4.3,              hL: 27.1, kL: -31.4, hR: 5.7,  kR: -11.4 },
      { t: 0.4,  rot: -15.7,    bob: 2.1, lean: 5,   head: -3.6,  hL: 28.6, kL: -31.4, hR: 10,   kR: -18.6 },
      { t: 0.58, rot: -10.7,    bob: 2.1, lean: 3.6,              hL: 24.3, kL: -31.4, hR: 15.7, kR: -27.1 },
      { t: 0.78, rot: -6.4,     bob: 1.4, lean: 2.1,              hL: 17.9, kL: -27.9, hR: 9.3,  kR: -16.4 },
      { t: 1,                                                     hL: 2.1,  kL: -4.3,  hR: 1.4,  kR: -2.9 }
    ]
  }

];
