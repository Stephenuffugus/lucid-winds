// AURA OFF — FLOW moves. Pure data, no logic.
//
// Nine moves, in CONTRACT.md §9 order. Every id/name/cat/tier/base/up/lo/
// idealAmp/special is copied from that table verbatim. The choreography, dur,
// lag and hint are authored here.
//
// Rig (CONTRACT §2, frozen):
//   rot bob lean head sL eL sR eR   UPPER = lean head sL eL sR eR
//                     hL kL hR kR   LOWER = rot bob hL kL hR kR
//
// Rest pose is all zeros, and a joint omitted from a keyframe IS zero — it is
// not "hold previous". So the joints named in a frame are exactly the joints
// doing something, and a 100/0 move simply never names a lower joint. In FLOW
// that omission is load-bearing: six-seven's legs are not unwritten, they are
// still, and the stillness is the move. `anim.reach()` measures it: the three
// 100/0 moves here report lower 0.0 exactly.
//
// Amplitude multiplies every joint value (CONTRACT §4.2), so each move is
// authored to read at its own idealAmp, not at 1.0. FLOW sits high — 1.15 to
// 1.30 across most of the set — so the raw numbers below are roughly the
// on-screen angle divided by idealAmp, and the validator checks both the
// authored number and the number it becomes at ideal amplitude.
//
// -----------------------------------------------------------------------------
// FIVE THINGS THIS RIG DOES THAT DECIDE EVERY POSE BELOW.
// All five were found by rendering poses to a contact sheet and LOOKING at them,
// not by reading the angles. Four of the five are invisible in the numbers.
// Write them down or the next author re-finds them the same slow way.
//
// 1. THE RIG CANNOT MIRROR A BENT ARM.
//    Every joint is clockwise screen rotation and there is no left/right flip,
//    so a mirrored pose needs sL = -sR AND eL = -eR. Elbows are clamped to
//    -150…+30, so eL = -eR forces both elbows within ±30. Past that the two
//    arms diverge: the left forearm folds across the chest while the right one
//    swings out into open space. That divergence is exactly the reported
//    six-seven bug — the old file's `sL:-35 sR:35, eL/eR ≈ -95` put BOTH hands
//    on the figure's right, which is why it read as one arm waving across the
//    body. Any move here that needs two arms to look alike keeps |elbow| ≤ 30
//    and pairs eL negative with eR positive; any move that needs two arms to
//    travel TOGETHER (boat, swirl's swing) gives them the same sign on both
//    shoulders and both elbows, which keeps them parallel instead.
//
// 2. `rot` IS A FALL, NOT A TURN.
//    It rotates the whole figure about the FEET. The old spin and crowdturn
//    drove it to 64 and 58 at amplitudes 1.30 and 1.25 — 83 and 72 degrees on
//    screen — and both moves ended the clip lying flat on the floor pointing
//    off the side of the arena. There is no yaw in a twelve-joint 2D rig, so
//    neither move turns any more. Spin is a weighted floor sweep, crowdturn is
//    a weight change into open arms, and rot stays under 25 degrees on screen
//    in both, where it reads as body angle.
//
// 3. `head` IS ALMOST INVISIBLE ON ITS OWN.
//    The head is a filled circle whose centre sits 11 units above its own
//    rotation anchor, so rotating it slides the circle sideways on the neck by
//    11·sin(angle) — about 5 units at the 30-degree limit, under a half
//    head-radius. Rendered, the old Look Away and Head Nod were nine identical
//    frames. Both now carry the motion in `lean` and the shoulders and use
//    `head` for the offset against them, which is what makes the head read as
//    cocked rather than as the whole figure tipping.
//
// 4. THE ARMS ARE LONG.
//    Upper arm 26 + forearm 24 against a 120-wide viewBox: a straight arm past
//    about 70 degrees from vertical puts the hand at the edge of the frame.
//    Wide-armed poses here stop at that limit deliberately.
//
// 5. `bob` HAS TO PAY FOR ITSELF OR THE FEET GO UNDER THE FLOOR.
//    The hips are the root of the chain, so bending a knee lifts the FOOT; it
//    does not lower the hips. A crouch is therefore two things at once — knees
//    fold, and bob comes down by exactly what they folded. The budget is
//    bob ≤ 81 - (41·cos(hip) + 40·cos(hip+knee)) for the lower foot, and it is
//    small: a front-on rig cannot squat, because the knees bend sideways, so
//    the deepest honest crouch is about 12 units even with the knees at their
//    limit. Spin, Body Wave and Crowd Turn were all authored past it on the
//    first pass and stood 14 to 32 units inside the pavement — spin worst, at
//    32, which is a quarter of a leg. Every bob in this file is now inside ±6
//    of its budget at idealAmp, so no FLOW move puts a fighter on a different
//    ground plane from the one standing next to it.
// -----------------------------------------------------------------------------

export const FLOW_MOVES = [

  // ── SIX-SEVEN ──────────────────────────────────────────────────────────
  // AURA-BIBLE §2.1: both hands up, PALMS UP, loose alternating see-saw /
  // balance-scale, lower body dead still. The bible's ruling on the palms
  // conflict stands and is not re-litigated here.
  //
  // It is a BALANCE SCALE, so it is built as a beam. Both shoulders carry the
  // same offset from a raised neutral (sL 40, sR -40 authored — arms out and
  // down in a shallow V) and the beam tips ±19: one hand rises exactly as far
  // as the other falls, which is the whole gesture. The elbows never move.
  // They sit at eL -24 / eR +24, a matched pair inside the ±30 mirror window
  // (note 1), which cups both forearms inward and upward — the palms-up read,
  // and the only bent-arm shape in this rig that looks the same on both sides.
  //
  // Three tips in 1600ms is roughly 350ms a swing, which is the loose bounce
  // of the real gesture rather than a metronome. `lean` counters 3 degrees
  // toward the falling hand and the head holds a 2-degree tilt through all of
  // it. The tip does not resolve to level: frame t:1 is caught mid-swing,
  // because a balance scale settling is a different gesture.
  //
  // Not one lower joint is named in any frame. reach() reports lower 0.0.
  {
    id: 'sixseven',
    name: 'Six-Seven',
    cat: 'FLOW',
    tier: 'V1',
    base: 52,
    up: 1.0,
    lo: 0.0,
    idealAmp: 1.15,
    dur: 1600,
    hint: 'Both hands up, palms turned up, held out like a pair of scales. Let one side drop as the other rises, three times. Nothing below the waist moves.',
    lag: 0,
    frames: [
      { t: 0 },
      { t: 0.15, sL: 40, eL: -24, sR: -40, eR: 24, head: 2 },
      { t: 0.36, sL: 59, eL: -24, sR: -21, eR: 24, lean: 3,  head: 2 },
      { t: 0.58, sL: 21, eL: -24, sR: -59, eR: 24, lean: -3, head: 2 },
      { t: 0.80, sL: 59, eL: -24, sR: -21, eR: 24, lean: 3,  head: 2 },
      { t: 1,    sL: 30, eL: -24, sR: -50, eR: 24, lean: -2, head: 2 }
    ]
  },

  // ── LOOK AWAY ──────────────────────────────────────────────────────────
  // AURA-BIBLE §2.9. head 18-24 degrees off-axis, lean -2, arms neutral at
  // their sides, lower body zero. The cheapest move in the deck and the
  // shortest, and it earns that by being almost nothing.
  //
  // The bible's -2 lean is not survivable on screen (note 3): head rotation
  // alone rendered nine identical frames, which is what the old version of
  // this move actually was, and a lean of 2 does not rescue it. Rendered side
  // by side, the version where the head opposes the lean is still nearly
  // still, because the two cancel at the skull. So they ADD instead. `lean`
  // takes the torso 14 degrees off plumb and `head` takes the skull another
  // 26 the SAME way, which carries the head about a full head-width off the
  // spine line — the largest head displacement this rig can produce, and the
  // only version of this move that is visible at thumbnail size. One shoulder
  // drifts back against the turn because the torso took it there, not because
  // it is helping.
  //
  // Held to the end — a feint that comes back is not a feint.
  {
    id: 'sideeye',
    name: 'Look Away',
    cat: 'FLOW',
    tier: 'V1',
    base: 34,
    up: 1.0,
    lo: 0.0,
    idealAmp: 1.00,
    dur: 1400,
    hint: 'Take the whole upper body a fifth of a turn off centre, head first, and leave it there. Arms stay where they hang. Once it is off centre, it stays off centre.',
    lag: 0,
    special: 'feint',
    frames: [
      { t: 0 },
      { t: 0.24, lean: 6,  head: 11, sL: -4 },
      { t: 0.52, lean: 12, head: 23, sL: -9 },
      { t: 0.80, lean: 14, head: 26, sL: -11 },
      { t: 1,    lean: 13, head: 25, sL: -10 }
    ]
  },

  // ── RIVER PROW ─────────────────────────────────────────────────────────
  // AURA-BIBLE §2.3 — the split the whole rig exists for. Serene above,
  // working hard below.
  //
  // UPPER runs ONE slow arc across the full 2200ms. sL and sR share a value at
  // every keyframe, so the arms are parallel and travel as a pair (note 1) —
  // the boat-dancer sweep, not a stride. They go out one way to 70, pass
  // through low, and go the other way to -70. The elbows are the whip: nearly
  // straight at each peak of the sweep and folding hardest a frame and a half
  // AFTER it, which is the bible's "trailing the shoulders by ~15% of the
  // cycle" written into the keyframes. That late fold is the entire reason
  // this move looks expensive. `lean` sways against the arms and `head`
  // counter-rotates against the lean.
  //
  // LOWER runs FOUR cycles in the same time, alternating on every keyframe:
  // knees trading a -6 to -14 bend, hips trading weight ±3, bob ±4. The hips
  // are deliberately tiny — antisymmetric hips are what the rig reads as a
  // STRIDE (rig.js, "WALK SWING"), and at ±6 this move looked like it was
  // walking somewhere. The knees carry the correction instead. Never still,
  // never large. The frequency gap between the halves is the read — the
  // arms look unhurried precisely because the legs visibly are not.
  //
  // lo is 0.5, not greater, so lag must be 0. The trail is in the keyframes.
  {
    id: 'boat',
    name: 'River Prow',
    cat: 'FLOW',
    tier: 'V1',
    base: 70,
    up: 0.5,
    lo: 0.5,
    idealAmp: 1.05,
    dur: 2200,
    hint: 'One wide arc with both arms together, at half the speed you want to go, and let the elbows fold late. Below, keep correcting: small knee, small hip, never still. The face does none of it.',
    lag: 0,
    frames: [
      { t: 0 },
      { t: 0.12, sL: 43,  sR: 43,  eL: -8,  eR: -8,  lean: -5, head: 4,  bob: 4,  kL: -13, kR: -6,  hL: 3,  hR: -3 },
      { t: 0.24, sL: 70,  sR: 70,  eL: -17, eR: -17, lean: -9, head: 8,  bob: -2, kL: -6,  kR: -14, hL: -3, hR: 3 },
      { t: 0.36, sL: 50,  sR: 50,  eL: -38, eR: -38, lean: -6, head: 6,  bob: 4,  kL: -14, kR: -7,  hL: 3,  hR: -3 },
      { t: 0.48, sL: 6,   sR: 6,   eL: -44, eR: -44, lean: 0,  head: 0,  bob: -2, kL: -7,  kR: -14, hL: -3, hR: 3 },
      { t: 0.60, sL: -44, sR: -44, eL: -17, eR: -17, lean: 6,  head: -5, bob: 4,  kL: -13, kR: -6,  hL: 3,  hR: -3 },
      { t: 0.72, sL: -70, sR: -70, eL: -26, eR: -26, lean: 9,  head: -8, bob: -2, kL: -6,  kR: -14, hL: -3, hR: 3 },
      { t: 0.84, sL: -48, sR: -48, eL: -44, eR: -44, lean: 6,  head: -6, bob: 4,  kL: -14, kR: -7,  hL: 3,  hR: -3 },
      { t: 1,    sL: -8,  sR: -8,  eL: -32, eR: -32, lean: 1,  head: -1, bob: 1,  kL: -9,  kR: -10 }
    ]
  },

  // ── SHOULDER ROLL ──────────────────────────────────────────────────────
  // There is no shoulder translation in this rig — a shoulder cannot lift. So
  // the roll is drawn the way a hand draws it: the arm traces a small LOOP.
  // A loop needs two joints out of phase, and that is the whole construction
  // here. The shoulder swings forward while the elbow is still open, the elbow
  // folds while the shoulder is passing bottom, and the shoulder swings back
  // while the elbow releases. One arm's hand goes forward, up, over and down
  // without ever retracing its own path.
  //
  // The elbow travels much further than the shoulder does (to -52 against the
  // shoulder's 26) — a small shoulder arc with a big fold reads as a roll,
  // where a big shoulder arc with a small fold just reads as pointing at
  // something. The first draft of this move had it the other way round and
  // rendered as an arm gesture.
  //
  // The right arm goes first and the left picks it up at t:0.41, before the
  // right has finished falling, so the two overlap rather than alternate.
  // `lean` rocks under whichever arm is loaded and `head` drifts a couple of
  // degrees the other way. The 20% lower share is one knee softening under the
  // loaded side, which is what stops the roll reading as a shrug.
  //
  // Ends squared up with both shoulders barely off zero — the roll dies out
  // rather than stopping.
  {
    id: 'shoulder',
    name: 'Shoulder Roll',
    cat: 'FLOW',
    tier: 'V3',
    base: 48,
    up: 0.8,
    lo: 0.2,
    idealAmp: 1.20,
    dur: 1600,
    hint: 'Roll one arm forward, up and over, folding the elbow as it passes the bottom so the hand draws a circle. Pick the other one up before the first has landed.',
    lag: 0,
    frames: [
      { t: 0 },
      { t: 0.13, sR: 26,  eR: -8,  lean: -4, head: -3, kR: -5 },
      { t: 0.27, sR: 16,  eR: -52, lean: -3, head: -4, bob: 3,  kR: -9 },
      { t: 0.41, sR: -16, eR: -44, sL: 22,  eL: -8,  lean: 4,  head: 4,  kR: -6 },
      { t: 0.55, sR: -22, eR: -12, sL: 14,  eL: -52, lean: 4,  head: 3,  bob: 3, kL: -9 },
      { t: 0.71, sR: -6,  sL: -18, eL: -44, lean: -3, head: -4, kL: -7 },
      { t: 0.87, sL: -20, eL: -12, sR: 10,  eR: -10, lean: -4, head: -2, bob: 2, kL: -4 },
      { t: 1,    sL: -5,  sR: 5,   eL: -6,  eR: -6,  lean: 1,  head: 2 }
    ]
  },

  // ── GROUND SPIN ────────────────────────────────────────────────────────
  // 20/80 and lower-led all the way through, and NOT a yaw — this rig has no
  // yaw, and the joint that looks like one is a fall (note 2). What the legs
  // can actually do is sweep, so that is what this is: drop the weight into
  // both knees, wind the hips the WRONG way first, then send one leg round
  // through a wide arc off the loaded foot while the body angles after it.
  //
  // The sweeping leg is the read, and only ONE leg sweeps. hL goes -18 (cocked
  // back) → +26 → +32, swung right through. Its knee stays folded at -26 then
  // -20 while the leg passes the body and only straightens to -4 once it is
  // out to the side, which is both how a sweep actually works and what keeps
  // the swept foot off the pavement mid-pass (note 5 — the draft that
  // straightened it early sank 9 units at t 0.38). hR sits at -2 to -4 and its
  // knee holds -34 underneath: the post the sweep goes round.
  //
  // An earlier draft swung both hips in OPPOSITE directions and rendered as a
  // stride, because antisymmetric hips are exactly what this rig reads as
  // walking. A sweep needs something to sweep around.
  //
  // `rot` follows to 11 authored, 14 on screen — enough to say the body is
  // going round with it, nowhere near enough to put the figure on the floor —
  // and `bob` stays down the whole clip, so this move never stands up until it
  // is over. Both are sized against note 5: the first draft crouched to bob 26
  // and buried both feet 32 units inside the pavement, and rot 13 over a wide
  // stance dipped the outside foot another 4 on top of that.
  //
  // Arms tuck in to go and open out to stop, which is how a body meters a
  // spin, and they stay small: upper reach 20 against lower reach 34, so the
  // 20/80 declaration and the animation agree.
  //
  // lag 120: the legs are already square before the arms have finished settling.
  {
    id: 'spin',
    name: 'Ground Spin',
    cat: 'FLOW',
    tier: 'V3',
    base: 60,
    up: 0.2,
    lo: 0.8,
    idealAmp: 1.30,
    dur: 1800,
    hint: 'Drop into both knees and wind the hips the wrong way first, then sweep one leg right through off the loaded foot. Arms tuck to go, open to stop. Stay low until it is finished.',
    lag: 120,
    frames: [
      { t: 0 },
      { t: 0.13, bob: 6,  kL: -30, kR: -30, sL: -6,  sR: 6,  eL: -12, eR: -12 },
      { t: 0.27, bob: 7,  kL: -26, kR: -34, rot: -10, hL: -18, hR: -2, sL: -10, sR: 10, eL: -18, eR: -18 },
      { t: 0.45, bob: 5,  kL: -20, kR: -34, rot: 2,   hL: 26,  hR: -3, sL: -10, sR: 10, eL: -20, eR: -20 },
      { t: 0.63, bob: 8,  kL: -4,  kR: -34, rot: 11,  hL: 32,  hR: -4, lean: -2, sL: -6, sR: 6, eL: -16, eR: -16 },
      { t: 0.81, bob: 2,  kL: -6,  kR: -18, rot: 7,   hL: 14,  hR: -3, lean: -2, head: -3, sL: 14, sR: -14, eL: -5, eR: -5 },
      { t: 1,    bob: 1,  kL: -4,  kR: -6,  rot: -2,  hL: 2,   hR: -1, lean: -1, head: -3, sL: 6,  sR: -6 }
    ]
  },

  // ── BODY WAVE ──────────────────────────────────────────────────────────
  // A genuine 50/50: the wave is handed downward — shoulders, chest, hips,
  // knees, floor — so each half owns half the trip. Every keyframe has exactly
  // one region at its extreme with its neighbours only partway, which is what
  // makes a wave read as travelling rather than as the whole body pulsing at
  // once.
  //
  // It starts at the SHOULDERS rather than at the head, because the head on
  // its own does not move enough to start anything (note 3) — it rides along
  // as the offset that makes the top of the wave visible. The arms mirror
  // properly through it: eL negative against eR positive, inside the ±30
  // window (note 1), so the two arms rise and fall as a pair instead of one
  // folding across the chest.
  //
  // The last two frames are a second, smaller pass starting back up top before
  // the first has fully drained out of the knees. Waves overlap; they do not
  // queue.
  //
  // lo is 0.5, not greater, so lag is 0 — and it would be wrong here anyway.
  // The delay in this move is the wave itself, and adding a second one on top
  // would smear the hand-off it is built out of.
  {
    id: 'ripple',
    name: 'Body Wave',
    cat: 'FLOW',
    tier: 'V3',
    base: 54,
    up: 0.5,
    lo: 0.5,
    idealAmp: 1.20,
    dur: 1700,
    hint: 'Start it in the shoulders and hand it down: chest, hips, knees, floor. One part at a time, never two at once, and send the next one before the last has gone.',
    lag: 0,
    frames: [
      { t: 0 },
      { t: 0.12, sL: 16,  eL: -9,  sR: -16, eR: 9,  lean: 5,  head: -7 },
      { t: 0.26, sL: 24,  eL: -20, sR: -24, eR: 20, lean: -9, head: 4,  bob: 2 },
      { t: 0.40, sL: 14,  eL: -26, sR: -14, eR: 26, lean: 7,  head: 6,  bob: 5,  hL: -18, hR: -18 },
      { t: 0.54, sL: 6,   eL: -18, sR: -6,  eR: 18, lean: 2,  head: 2,  bob: 3,  hL: 4,   hR: 4,   kL: -26, kR: -26 },
      { t: 0.68, sL: 15,  eL: -10, sR: -15, eR: 10, lean: -6, head: -6, bob: 2,  kL: -22, kR: -8 },
      { t: 0.84, sL: 9,   eL: -5,  sR: -9,  eR: 5,  lean: 6,  head: 5,  bob: 1,  kL: -8,  kR: -16 },
      { t: 1,    sL: 3,   sR: -3,  lean: -2, head: -2, bob: 1, kL: -4,  kR: -4 }
    ]
  },

  // ── SWIRL & SWING ──────────────────────────────────────────────────────
  // AURA-CULTURE §8.1 — AFP on how the athletes imitated the boat dancer:
  // "swirling their hands, then swinging their arms back and forth." Two
  // beats, in that order, and the file follows it literally.
  //
  // SWIRL (to t 0.43): the hands trade places around a common centre, twice.
  // This is the one place in FLOW where the elbow asymmetry of note 1 is an
  // ASSET rather than a problem: two hands orbiting a shared centre genuinely
  // are in different places, so the forearms want to be staggered. Both elbows
  // fold hard (to -125, about -150 on screen) with the shoulders barely
  // moving, and the two folds run out of phase, so the forearms trade high and
  // low across each other in front of the chest. Tight, fast, close in — and
  // deliberately nothing like six-seven's wide open beam, because those two
  // are the most-used move in the deck and its Act 5 unlock and they must not
  // read as the same gesture.
  //
  // SWING (from t 0.54): the elbows open out and the shoulders take over, and
  // now sL and sR share a value so both arms travel together (note 1) —
  // forward to 54, back through to -60, and out. Nearly twice the reach of the
  // swirl at half the rate. No pause between the two beats; the swirl is what
  // throws the swing.
  //
  // 90/10, so the legs get one knee each and a single bob, and no more.
  {
    id: 'swirl',
    name: 'Swirl & Swing',
    cat: 'FLOW',
    tier: 'V1',
    base: 56,
    up: 0.9,
    lo: 0.1,
    idealAmp: 1.20,
    dur: 1900,
    hint: 'Circle the hands around each other in front of your chest, twice round, tight and quick. Then open the elbows out and swing both arms right through together. Do not stop between the two.',
    lag: 0,
    frames: [
      { t: 0 },
      { t: 0.10, sL: 16,  eL: -105, sR: 20,  eR: -104 },
      { t: 0.21, sL: 8,   eL: -125, sR: 22,  eR: -83,  lean: 2 },
      { t: 0.32, sL: 23,  eL: -85,  sR: 18,  eR: -125, lean: -2 },
      { t: 0.43, sL: 8,   eL: -125, sR: 22,  eR: -83,  lean: 2 },
      { t: 0.54, sL: 20,  eL: -96,  sR: 20,  eR: -96,  lean: -1, kL: -4 },
      { t: 0.72, sL: 54,  eL: -14,  sR: 54,  eR: -14,  lean: -7, head: 3,  kL: -5 },
      { t: 0.88, sL: -60, eL: -11,  sR: -60, eR: -11,  lean: 8,  head: -3, kR: -6, bob: 3 },
      { t: 1,    sL: -16, eL: -18,  sR: -16, eR: -18,  lean: 2,  head: -1, kR: -3 }
    ]
  },

  // ── HEAD NOD ───────────────────────────────────────────────────────────
  // The other end of the deck from The Grimace: same one channel, opposite
  // job. Grimace is a single decisive snap that ends things; this is three
  // even nods, each on the same count, that hold a floor under whatever comes
  // next.
  //
  // A front-on rig has no pitch, so a nod cannot go forward — and `head` alone
  // barely goes anywhere at all (note 3). What reads instead is a DIP: `lean`
  // and `head` go the same way together, stacking the torso's swing at the
  // neck on top of the skull's own, and then both come nearly back. Three
  // dips, one count each, on the same side — a nod returns to a baseline,
  // which is what separates it from a metronome sway. The shoulders pulse
  // against the dip and settle between.
  //
  // The recovery is deliberately shallower than the dip — it does not come all
  // the way back between nods, so the three read as one continuous count
  // rather than three separate movements. Lower body zero; reach() reports
  // lower 0.0.
  {
    id: 'headnod',
    name: 'Head Nod',
    cat: 'FLOW',
    tier: 'V3',
    base: 36,
    up: 1.0,
    lo: 0.0,
    idealAmp: 1.05,
    dur: 1500,
    hint: 'Throw the head and the shoulders over together, on a count, three times. Do not come all the way back between them. Nothing below the waist.',
    lag: 0,
    frames: [
      { t: 0 },
      { t: 0.14, head: 23, lean: 11, sL: -8, sR: 8 },
      { t: 0.30, head: 4,  lean: -3, sL: 3,  sR: -3 },
      { t: 0.46, head: 25, lean: 12, sL: -9, sR: 9 },
      { t: 0.62, head: 5,  lean: -3, sL: 3,  sR: -3 },
      { t: 0.78, head: 24, lean: 11, sL: -8, sR: 8 },
      { t: 1,    head: 11, lean: 5,  sL: -4, sR: 4 }
    ]
  },

  // ── CROWD TURN ─────────────────────────────────────────────────────────
  // Lowest base in the deck and it is not scored on the pose — it takes the
  // round away from the battle and gives it to the people watching, which is
  // what `hype` pays for. Nothing in it is aimed at the other competitor.
  //
  // It does not use `rot` to turn, because `rot` is a fall (note 2) and the
  // old version of this move ended flat on the floor. What actually reads as
  // turning to the crowd in a 2D rig is a WEIGHT CHANGE: sink into the back
  // knee (kL -28 against kR -20), carry BOTH hips the same way — 12 and 16,
  // then 15 and 20 — and come UP onto the loaded foot as it finishes. bob
  // going negative at the end is the only place in FLOW the hips rise above
  // rest, and it is the whole punchline. Both halves of that are sized against
  // note 5: the sink is 5 units deeper than the knees pay for and the rise is
  // 6 units lighter, either way about 5px on a 180px fighter.
  //
  // The two hips share a sign on purpose. Opposite signs are a stride here,
  // and the draft that used them (hR 30 against hL -20) rendered as a fencing
  // lunge. Same sign is the pelvis travelling, which is what a weight change
  // is. `rot` rides along at 10 authored, 13 on screen: body angle, not a
  // topple.
  //
  // Only once the weight has arrived do the arms open — wide and up, mirrored
  // properly (eL negative against eR positive, note 1) — and then stay open.
  // They do not come back down. That is the move.
  //
  // lag 130, the deepest legal here and the point of it: the feet have
  // finished and are square while the arms are still opening. That gap is what
  // a crowd reacts to.
  {
    id: 'crowdturn',
    name: 'Crowd Turn',
    cat: 'FLOW',
    tier: 'V3',
    base: 30,
    up: 0.4,
    lo: 0.6,
    idealAmp: 1.25,
    dur: 1800,
    hint: 'Load the back foot and drive the hips across until your weight has arrived, then rise onto the front foot. Only then open the arms wide and high, and leave them open.',
    lag: 130,
    special: 'hype',
    frames: [
      { t: 0 },
      { t: 0.16, bob: 3,  kL: -20, kR: -10, hL: 6,  hR: 8,  rot: 3 },
      { t: 0.34, bob: 6,  kL: -28, kR: -20, hL: 12, hR: 16, rot: 7,  lean: 3,  sR: -12, eR: 6 },
      { t: 0.54, bob: 4,  kL: -22, kR: -12, hL: 15, hR: 20, rot: 9,  lean: -2, sL: 24, sR: -24, eL: -12, eR: 12 },
      { t: 0.76, bob: -4, kL: -6,  kR: -4,  hL: 9,  hR: 12, rot: 10, lean: -4, head: 5, sL: 41, sR: -41, eL: -8, eR: 8 },
      { t: 1,    bob: -3, kL: -4,  kR: -3,  hL: 5,  hR: 6,  rot: 8,  lean: -3, head: 4, sL: 39, sR: -39, eL: -7, eR: 7 }
    ]
  }

];
