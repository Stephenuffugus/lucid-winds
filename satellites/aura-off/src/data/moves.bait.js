// AURA OFF — BAIT moves. Pure data, no logic.
//
// Nine moves, in CONTRACT.md §9 order. Every id/name/tier/base/up/lo/idealAmp/
// special is copied from that table verbatim. The choreography, dur, lag and
// hint are authored here.
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
// something, and a 100/0 move simply never names a lower joint. In this
// category that matters twice over: `eyeroll` and `doubletake` are whole jokes
// about a head moving over feet that do not.
//
// ── ON AMPLITUDE ───────────────────────────────────────────────────────────
// Amplitude multiplies every joint value (CONTRACT §4.2), and BAIT carries the
// highest idealAmps in the game — 1.10 to 1.50. So these poses are authored
// PRE-multiplication: the number in the frame times the move's own idealAmp is
// the angle the move is actually meant to hit. Dead Drop reads `rot: -59` and
// lands at −88 at its ideal 1.50, which is the angle AURA-BIBLE §2.6 documents.
// Author at the raw bible angle here and a committed player would rotate the
// figure straight through the floor.
//
// ── ON CONTENT SAFETY (CONTRACT §7) ────────────────────────────────────────
// BAIT is SELF-directed clowning. Falling over, legs giving out, cracking
// yourself up. Nothing in this file is aimed at the other competitor — not a
// name, not a hint, not a gesture. `lasso` is the single documented exception
// and it is a rope gag: the rope goes out across the square, and the joke is
// the person holding it walking away with a shoe.
//
// `lag` is the milliseconds the upper body trails the lower, set only on the
// three lower-led moves (lo > 0.5). Those three are the whole reason the rule
// exists: a fall, a boneless wobble and a knee giving way are all physics the
// torso finds out about late.

export const BAIT_MOVES = [

  // ── DEAD DROP ──────────────────────────────────────────────────────────
  // AURA-BIBLE §2.6 — the only move in the game where the LOWER body leads.
  // Documented as a deliberate, committed fall to the ground, held; the comedy
  // is total commitment, so nothing here hedges. `rot` drives the whole body
  // about the feet, `bob` puts the hips on the floor, and the arms fly wide
  // LATE: the upper body is reacting to the fall, never initiating it.
  //
  // The order is the physics. Knees soften first (the tell), the hips go past
  // the tipping point second, the arms come out third and only once it is
  // already too late to save it, and the last frame is a settle, not a bounce.
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
    hint: 'Knees go first, arms go last. Fall the whole way, land, and stay down.',
    lag: 120,
    special: 'highRisk',
    frames: [
      { t: 0 },
      { t: 0.14, kL: -7,  kR: -7,  bob: 5,  rot: -5 },
      { t: 0.34, kL: -9,  kR: -9,  bob: 15, rot: -24, hL: -7,  hR: -7,  head: -3 },
      { t: 0.58, kL: -11, kR: -11, bob: 28, rot: -45, hL: -10, hR: -10, head: -7,  lean: 3,  sL: 26, sR: -26 },
      { t: 0.8,  kL: -13, kR: -13, bob: 39, rot: -59, hL: -12, hR: -12, head: -11,           sL: 64, sR: -64 },
      { t: 1,    kL: -11, kR: -11, bob: 38, rot: -58, hL: -12, hR: -12, head: -11, lean: -1, sL: 61, sR: -61 }
    ]
  },

  // ── LASSO ──────────────────────────────────────────────────────────────
  // AURA-BIBLE §2.7. A competitor did this with a large white sandal for a
  // rope and won the whole thing. Three beats, in order: an overhead cone
  // twirl, a throw, then a walk-away tug with the rope over the shoulder.
  //
  // A cone has an azimuth and this rig does not, so the cone reads as `sR`
  // swinging between the far side (−119) and the near side (−99) while `eR`
  // counter-rotates out of phase to keep the loop level — that counter-rotation
  // is the difference between a twirling rope and an arm waving. `lean` sways
  // ±4 following the arm, exactly as documented. Two revolutions, then the
  // throw: the arm comes down and forward and the elbow finally extends.
  //
  // Lower is 15% and does what the bible says it does — weight passing foot to
  // foot under the twirl, then one step back on the pull (`hL` +11 → +15 at
  // ideal, the documented +16). Not enough to earn a lag, so lag stays 0.
  //
  // The rope goes out across the square. Nothing in this move touches, points
  // at, or is performed toward the other competitor — that is the whole reason
  // it survives §7 as the documented exception.
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
    hint: 'Twirl it overhead until the loop runs level, throw it on the beat, then take one step back and walk it off over your shoulder.',
    lag: 0,
    special: 'debuff',
    frames: [
      { t: 0 },
      { t: 0.15, sR: -94,  eR: -36, sL: -8,  eL: -12, lean: 3 },
      { t: 0.32, sR: -119, eR: -12,                   lean: -4, head: 4,  kR: -5 },
      { t: 0.48, sR: -99,  eR: -40,                   lean: 4,  head: -3, kL: -5, hL: 4 },
      { t: 0.66, sR: -119, eR: -14,                   lean: -4, head: 5,  hR: 5 },
      { t: 0.82, sR: -40,  eR: -6,                    lean: 7,  head: -5, hR: 9, kR: -6 },
      { t: 1,    sR: -62,  eR: -56, sL: -26, eL: -44, lean: -6, head: -6, hL: 11, kL: -7, bob: 3 }
    ]
  },

  // ── UNIMPRESSED ────────────────────────────────────────────────────────
  // AURA-BIBLE §2.10: the eyes roll up and around roughly 12°, then settle
  // with a tilt and a half smile. Documented as irony and complicity — used to
  // DEFUSE a situation, which is why it counters a big move instead of topping
  // one. Deflation as a mechanic.
  //
  // 100/0 and it means it: not one lower joint appears in any frame. The head
  // dips to load, rolls up, carries through and lands off-centre; `lean`
  // reclines three degrees across the whole clip and never comes back. The
  // arms stay at the sides bar a four-degree turn-in at the end, which is a
  // shrug and not a gesture.
  //
  // Smallest choreography in the file, on purpose. It is a 40-base move that
  // gets its value from the counter, and overplaying it would cost composure.
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
    hint: 'Dip the chin, roll it up and all the way around, and let it land off-centre with half a smile. Nothing below the neck.',
    lag: 0,
    special: 'counter',
    frames: [
      { t: 0 },
      { t: 0.2,  head: -4, lean: -1 },
      { t: 0.42, head: 10, lean: -2 },
      { t: 0.62, head: 2,  lean: -2 },
      { t: 0.82, head: -9, lean: -3 },
      { t: 1,    head: -6, lean: -3, sL: -4, sR: 4 }
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
  // forward at the waist and one hand slaps up to your own face. The second
  // hand goes to your own thigh to hold you up. Then two shake bounces, which
  // are the same fold repeated a few degrees apart, because that is what
  // shoulders do. Last frame is half-straightened and still wiping an eye — it
  // does not resolve, because you have not finished.
  //
  // 80/20. The knees soften and the hips drop, but they are only there to let
  // the fold happen; every large number in the move is above the waist.
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
    hint: 'Head back on the crack, then fold at the waist — one hand to your own face, the other on your own knee. Let the shoulders do the shaking.',
    lag: 0,
    frames: [
      { t: 0 },
      { t: 0.12, head: -12, lean: -8, sL: 10,  sR: -10 },
      { t: 0.3,  head: 13,  lean: 12,                   sR: -74, eR: -96,  kL: -5, kR: -5, bob: 5 },
      { t: 0.46, head: 15,  lean: 13, sL: -34, eL: -30, sR: -80, eR: -104, kL: -8, kR: -8, bob: 8, hL: -8, hR: -8 },
      { t: 0.6,  head: 12,  lean: 10, sL: -28, eL: -24, sR: -70, eR: -92,  kL: -7, kR: -7, bob: 6, hL: -6, hR: -6 },
      { t: 0.74, head: 15,  lean: 13, sL: -34, eL: -30, sR: -82, eR: -102, kL: -9, kR: -9, bob: 9, hL: -8, hR: -8 },
      { t: 1,    head: -3,  lean: 3,  sL: -6,  eL: -10, sR: -56, eR: -70,  kL: -3, kR: -3, bob: 2 }
    ]
  },

  // ── NOODLE LEGS ────────────────────────────────────────────────────────
  // Every bone below the belt is removed and the legs go wherever they like:
  // knees folding in and out of phase, hips throwing weight side to side, the
  // hips dropping and lifting, the whole body rolling loosely about the feet.
  // Five wobbles, never twice the same, ending lower than it started because
  // nothing here recovers.
  //
  // 10/90 and the 10 is the joke. The face and arms are given almost nothing —
  // a two-degree lean, a three-degree head turn — so the upper body reads as
  // completely uninvolved in whatever the legs are doing. Give the arms
  // anything to do and the move stops being funny.
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
    hint: 'Take the bones out of both knees and let the legs go wherever. Everything above the belt stays completely blank.',
    lag: 135,
    special: 'persist',
    frames: [
      { t: 0 },
      { t: 0.16, kL: -20, kR: -6,  hL: 14,  hR: -6,  bob: 12, rot: -7 },
      { t: 0.34, kL: -5,  kR: -22, hL: -8,  hR: 16,  bob: 16, rot: 9,   lean: 2 },
      { t: 0.52, kL: -22, kR: -8,  hL: 18,  hR: -10, bob: 22, rot: -11, lean: -2 },
      { t: 0.7,  kL: -7,  kR: -21, hL: -12, hR: 20,  bob: 18, rot: 12,  lean: 3,  head: -3 },
      { t: 0.86, kL: -19, kR: -19, hL: 6,   hR: 6,   bob: 24, rot: -4,  lean: -2 },
      { t: 1,    kL: -12, kR: -14, hL: 3,   hR: -3,  bob: 14, rot: 2,             head: 2 }
    ]
  },

  // ── FREEZE FRAME ───────────────────────────────────────────────────────
  // Throw yourself into an enormous, badly-chosen shape as fast as you can and
  // then stop dead in it. Two thirds of this clip is the stop. The hold is
  // written into the data — the frame at t 0.34 and the frame at t 1 are
  // identical, so the figure is genuinely motionless for 1050ms rather than
  // drifting. Same trick Cold Read uses, opposite register.
  //
  // The shape itself is deliberately asymmetric and slightly wrong: left arm
  // thrown high and wide, right arm crossed low over the chest, torso away
  // from both, head cranked back the other way, all the weight on the left leg
  // with the right knee up. Nobody would choose it. That is why it works, and
  // why it has to be arrived at fast and abandoned never.
  //
  // 60/40, and lo of 0.4 means no lag by rule — correct here anyway, since a
  // trailing torso would soften the one thing this move is: an instant stop.
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
      { t: 0.12, sL: 34, eL: -20, sR: 20, eR: -40, lean: -4,             kL: -8, kR: -8,                    bob: 4 },
      { t: 0.26, sL: 70, eL: -30, sR: 40, eR: -68, lean: -8,  head: 9,           kR: -18, hR: 12, rot: -5, bob: 5 },
      { t: 0.34, sL: 88, eL: -34, sR: 52, eR: -84, lean: -10, head: 14, kL: -6, kR: -26, hR: 20, rot: -8, bob: 4 },
      { t: 1,    sL: 88, eL: -34, sR: 52, eR: -84, lean: -10, head: 14, kL: -6, kR: -26, hR: 20, rot: -8, bob: 4 }
    ]
  },

  // ── GIANT CLOG ─────────────────────────────────────────────────────────
  // Documented: a competitor turned up and battled with a giant rubber clog.
  // So the move is the clog. Reach down and get two hands under it, drive it
  // up with the legs because it is absurdly heavy, press it overhead, turn so
  // the whole square gets a look at it, then bring it down and plant it.
  //
  // The weight is the performance. Torso folds forward to collect it, elbows
  // go deep at the chest on the heave, and at the top the body leans BACK
  // under the load with the hips lifted (`bob` negative — up onto the toes).
  // Take the strain out and it reads as an empty mime.
  //
  // 80/20 with the legs doing real work at exactly two moments, the collect
  // and the plant, and nothing in between. `rot` is a slow quarter turn to
  // present it, not a spin. Nothing is swung at anyone.
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
    hint: 'Two hands under it, drive with the legs, press it overhead and turn slowly so the whole square gets a look. Then plant it.',
    lag: 0,
    frames: [
      { t: 0 },
      { t: 0.14, lean: 12, head: 10, sL: -22, eL: -18, sR: 22,  eR: -18, kL: -12, kR: -12, hL: -10, hR: -10, bob: 12 },
      { t: 0.32, lean: 4,             sL: 10,  eL: -66, sR: -10, eR: -66, kL: -7,  kR: -7,                    bob: 5 },
      { t: 0.5,  lean: -9, head: -8, sL: 62,  eL: -34, sR: -62, eR: -34, kL: -2,  kR: -2,  hL: 5,   hR: 5,   bob: -2 },
      { t: 0.66, lean: -8, head: 9,  sL: 68,  eL: -28, sR: -68, eR: -28,                            hR: 6,   bob: -1, rot: 12 },
      { t: 0.84, lean: 9,  head: 7,  sL: 6,   eL: -46, sR: -6,  eR: -46, kL: -13, kR: -13, hL: -8,  hR: -8,  bob: 13, rot: 4 },
      { t: 1,    lean: 5,  head: 4,  sL: -4,  eL: -34, sR: 4,   eR: -34, kL: -6,  kR: -6,  hL: -4,  hR: -4,  bob: 6 }
    ]
  },

  // ── DOUBLE TAKE ────────────────────────────────────────────────────────
  // Look away like it is nothing. Start coming back, slow and unbothered.
  // Then snap the head round twice as fast as it left, with one hand coming
  // half up to check, and a second smaller snap behind it. That second snap is
  // the whole move — one head turn is a glance, two is a double take.
  //
  // 100/0, so no lower joint is named anywhere in it. The feet never move and
  // the head travels 27° at ideal amplitude, and the gap between those two
  // facts is where the comedy is. It is also why this is the `read`: you look
  // twice and you come away knowing something.
  //
  // Speeds are asymmetric on purpose — 0.34s away, 0.12s back. The keyframe
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
    hint: 'Look away like it is nothing, come back slow, then snap it round twice as fast — and once more after that. Feet do not move.',
    lag: 0,
    special: 'read',
    frames: [
      { t: 0 },
      { t: 0.18, head: -16, lean: -3 },
      { t: 0.34, head: -12, lean: -2 },
      { t: 0.46, head: 21,  lean: 4, sR: -18, eR: -46 },
      { t: 0.62, head: 16,  lean: 3, sR: -26, eR: -62, sL: -10, eL: -20 },
      { t: 0.8,  head: 22,  lean: 5, sR: -24, eR: -58, sL: -8,  eL: -16 },
      { t: 1,    head: 12,  lean: 1, sR: -8,  eR: -22 }
    ]
  },

  // ── KNEE BUCKLE ────────────────────────────────────────────────────────
  // Not Noodle Legs. Noodle is a sustained boneless wobble; this is one clean
  // catastrophic give-way of a single knee, caught at the last possible moment
  // and pushed back up on the same leg. One event, not five.
  //
  // The weight settles onto the left leg, the left knee folds INWARD and the
  // hip drops with it, `rot` tips the whole body after the collapsed side, and
  // the hips go almost to the floor. Then the catch — the fall arrests over
  // 0.18 of the clip, which is slower than it started, because catching
  // yourself is always slower than falling. It stands up as if nothing had
  // happened, which is the punchline and the reason the last frame is nearly
  // rest.
  //
  // 10/90 like Noodle, and again the stillness above is doing the work: `lean`
  // never exceeds 4 and the arms are not named once. lag 130 — the torso finds
  // out about the knee well after the knee does.
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
    hint: 'Let one knee fold in and drop the hip with it. Go nearly to the floor, catch it late, and stand back up on the same leg like nothing happened.',
    lag: 130,
    frames: [
      { t: 0 },
      { t: 0.1,  kL: -4,  kR: -3,             bob: 2 },
      { t: 0.3,  kL: -27, kR: -8,  hL: 24, hR: -10, bob: 26, rot: -14 },
      { t: 0.44, kL: -24, kR: -12, hL: 20, hR: -14, bob: 32, rot: -16, lean: 4 },
      { t: 0.62, kL: -18, kR: -9,  hL: 12, hR: -8,  bob: 20, rot: -9,  lean: 2 },
      { t: 0.82, kL: -8,  kR: -4,  hL: 4,  hR: -2,  bob: 7,  rot: -3 },
      { t: 1,    kL: -3,  kR: -2,                   bob: 1 }
    ]
  }

];
