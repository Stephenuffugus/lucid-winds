// AURA OFF — FLEX moves. Pure data, no logic.
//
// Nine moves, in CONTRACT.md §9 order. Every id/name/cat/tier/base/up/lo/
// idealAmp/special is copied from that table verbatim and is not ours to move.
// The choreography, dur, lag and hint are authored here.
//
// Rig (CONTRACT §2, frozen):
//   rot bob lean head sL eL sR eR hL kL hR kR
//   UPPER = lean head sL eL sR eR      LOWER = rot bob hL kL hR kR
//
// Rest pose is all zeros. A joint omitted from a keyframe IS zero — it is not
// "hold previous". So the joints named in a frame are exactly the joints doing
// something, and a 100/0 move simply never names a lower joint. That stillness
// is not an oversight, it is the move. Amplitude multiplies every value
// (CONTRACT §4.2), so each move below is authored to read at its own idealAmp.
//
// -----------------------------------------------------------------------------
// FIVE THINGS THE RIG ACTUALLY DOES, learned by rendering it and looking
// -----------------------------------------------------------------------------
// These are the facts every pose here is built on. They were established by
// sampling each move and reading the frames, not by reasoning from the bible.
//
// 1. THE FIGURE FACES THE VIEWER AND THERE IS NO MIRRORING. Positive is
//    screen-clockwise for every joint, so on the LEFT side of the body positive
//    swings a limb outward and on the RIGHT side it swings inward. "Wide" is
//    sL/hL positive and sR/hR negative. Symmetry therefore needs OPPOSITE signs
//    across a pair, never equal ones.
//
// 2. BOTH ELBOWS AND BOTH KNEES HINGE THE SAME SCREEN DIRECTION. A left arm can
//    fold across the chest with a low elbow; the right arm cannot — it has to
//    sweep the upper arm across first and fold back. Perfectly mirrored arm
//    poses do not exist on this rig, so `sigma` is built from the shape the rig
//    can actually hold. Same for legs: a symmetric plié needs kR POSITIVE
//    (capped at +10), which is why every crouch here is `kL:-b, kR:+b`.
//
// 3. `bob` MOVES THE FEET TOO. There is no foot IK. A positive bob with straight
//    legs pushes the feet through the floor, which is what the previous pass did
//    on four of these nine. The rule used here: bob must equal how much the legs
//    have actually shortened, `81 - (41·cos h + 40·cos(h+k))`. Every planted
//    foot below lands within ~4px of y=200, which is inside the 8.5px stroke.
//
// 4. `rot` PIVOTS ABOUT THE FEET, SO IT PERFORMS A FALL. It is not a turn.
//    Past about 12° the figure is visibly toppling. `slowturn` used to drive it
//    to -66 and spent two thirds of its runtime lying on the floor. Here rot is
//    only ever a lateral weight shift: at -8 it slides the head 20px sideways
//    while the feet stay put, which is exactly what `shadowstep` needs.
//
// 5. A FOOT CAN ONLY LIFT ABOUT 10px. Leg extent bottoms out near 71 against a
//    rest length of 81. Nothing here is airborne; steps are sold by where the
//    feet land and how wide the stance gets, not by height.
//
// `lag` is the ms the upper body trails the lower, and is set only on the four
// lower-led moves (lo > 0.5) — the contract rule and the only place it means
// anything physically.

export const FLEX_MOVES = [

  // ── AURA WALK ──────────────────────────────────────────────────────────
  // AURA-BIBLE §2.4: hips ±22, knee bend on the swing leg, half the tempo of a
  // real walk, upper body deliberately minimal because the relaxation is the
  // content. Two full steps in 2200ms.
  //
  // Read front-on, a walk is not a stride — it is lift, plant wide, transfer.
  // So each step here is three keyframes: the swing foot picks up under the
  // body (h positive, k negative, ~5px of clearance, which is all the rig has),
  // it plants wide, and the hips settle. The stance leg is straight and
  // vertical at every lift, which is what keeps the planted foot on the floor.
  //
  // bob is the physics, not decoration: hips ride ~3 units HIGHER over a
  // straight support leg than over a splayed double stance. The bible calls
  // that "-5 at midstride" and it is a relative figure; the previous pass had
  // the sign inverted and buried both feet at every step.
  //
  // Arms swing ±8 with opposite signs, alternating — a slow open/close, not a
  // pump. Head never moves.
  {
    id: 'aurawalk',
    name: 'Aura Walk',
    cat: 'FLEX',
    tier: 'V1',
    base: 60,
    up: 0.2,
    lo: 0.8,
    idealAmp: 1.00,
    dur: 2200,
    hint: 'Half tempo. Pick the foot up, put it down wide, take your time getting there. Back straight, eyes level, shoulders doing nothing.',
    lag: 110,
    frames: [
      { t: 0,    hL: 10, hR: -10, kL: -4,  kR: 4, bob: 1,  lean: -1, sL: 4,  sR: -4 },
      { t: 0.14, hL: 2,  hR: 20,  kR: -34, bob: -1, lean: -3, sL: -8, sR: -7 },
      { t: 0.32, hR: -22, kR: 8,  kL: -2,  bob: 2,  lean: 2,  sL: 8,  sR: 7 },
      { t: 0.5,  hL: 10, hR: -10, kL: -4,  kR: 4, bob: 1,  lean: 1,  sL: -4, sR: 4 },
      { t: 0.64, hL: 22, hR: -6,  kL: -34, kR: 2, bob: 0,  lean: 3,  sL: 7,  sR: 8 },
      { t: 0.82, hL: 22, hR: -2,  kL: -4,  bob: 2,  lean: -2, sL: -8, sR: -7 },
      { t: 1,    hL: 10, hR: -10, kL: -4,  kR: 4, bob: 1,  lean: -1, sL: 4,  sR: -4 }
    ]
  },

  // ── JAWLINE ────────────────────────────────────────────────────────────
  // AURA-BIBLE §2.2, classroom variant: hand to the face, then slid back along
  // the jawline to the ear, head turning INTO the hand, nothing below the neck.
  //
  // The hand positions are solved, not guessed. This rig's arm is 50 units long
  // against a 21-unit shoulder-to-head reach, so putting a hand on the face has
  // exactly ONE solution inside the elbow limits and it flares the elbow up
  // beside the head. That is the pose, and it is the one people actually strike.
  // The visible travel is the elbow opening from beside the head out to the
  // right and dropping as the hand slides chin → jaw → ear:
  //
  //   chin  hand (2,-56)  elbow (24,-66)
  //   jaw   hand (7,-58)  elbow (31,-61)
  //   ear   hand (12,-63) elbow (35,-56)
  //
  // The old version ended at sR -88 / eR -70, which puts the hand up in open
  // air above the shoulder — a raised hand, not a jawline. It has been reeled
  // back onto the face for every frame after the approach.
  {
    id: 'mewing',
    name: 'Jawline',
    cat: 'FLEX',
    tier: 'V1',
    base: 58,
    up: 1.0,
    lo: 0.0,
    idealAmp: 1.05,
    dur: 1800,
    hint: 'Hand up past the ear, land it on the chin, then slide it back along the jaw and leave it there. Turn the head into the hand. Nothing below the neck.',
    lag: 0,
    special: 'interrupt',
    frames: [
      { t: 0,    lean: -1 },
      { t: 0.16, sR: -62,  eR: -118, lean: -1 },
      { t: 0.34, sR: -155, eR: -138, head: 3,  lean: -2 },
      { t: 0.58, sR: -137, eR: -140, head: 6,  lean: -3 },
      { t: 0.8,  sR: -124, eR: -131, head: 10, lean: -3 },
      { t: 1,    sR: -122, eR: -130, head: 11, lean: -3 }
    ]
  },

  // ── COLD READ ──────────────────────────────────────────────────────────
  // AURA-BIBLE §2.5: arms crossed high on the chest, chin down, total stillness.
  //
  // Rig fact 2 bites hardest here. Both elbows hinge the same screen direction,
  // so the tidy mirrored fold does not exist: the left arm folds up across the
  // chest from a low elbow, and the right upper arm has to lie along the
  // shoulder line and fold back down. Rendered, that reads as a closed wedge on
  // the chest with the head clear — which is the folded-arms silhouette. Every
  // symmetric attempt renders as a tray being carried, and that is precisely
  // what the previous eL/eR of -70/-76 was doing: not enough flexion, so both
  // forearms pointed out into open space.
  //
  // The last two keyframes are deliberately identical. The hold is written into
  // the data, not left to the player — it is a guard move, and the stillness
  // is the mechanic.
  {
    id: 'sigma',
    name: 'Cold Read',
    cat: 'FLEX',
    tier: 'V1',
    base: 44,
    up: 1.0,
    lo: 0.0,
    idealAmp: 1.00,
    dur: 1600,
    hint: 'Fold the arms up onto the chest, chin down, weight even. Then do not move again for the rest of it.',
    lag: 0,
    special: 'guard',
    frames: [
      { t: 0 },
      { t: 0.28, sL: 9,  eL: -70,  sR: 48, eR: -76,  lean: -1 },
      { t: 0.52, sL: 16, eL: -132, sR: 92, eR: -140, head: 6, lean: -4 },
      { t: 1,    sL: 16, eL: -132, sR: 92, eR: -140, head: 6, lean: -4 }
    ]
  },

  // ── SHADE DROP ─────────────────────────────────────────────────────────
  // Glasses are already up on the brow. Fingertips find the frames, the head
  // tips, the hand draws them DOWN the face, and then the arm falls away.
  //
  // The pull-down is the whole move, so the hand is solved onto the brow
  // (9,-70) and then onto the nose (2,-61) — it travels down and inward across
  // the face. The previous pass sent the hand up and outward through those
  // frames, which reads as a salute.
  //
  // Timing carries the exit. An arm on this rig cannot come off the face without
  // the elbow swinging wide — with the upper arm anywhere near horizontal the
  // hand is out to the right whatever the elbow does — so the face pose is held
  // to t=0.62 and the whole drop is spent in the last fifth. That shape is
  // passed through, never posed in, and it never points: the hand exits
  // downward across the front of the body.
  //
  // The 10% lower body is one settle back onto the rear heel as the hand leaves,
  // and that is the entire leg budget.
  {
    id: 'shades',
    name: 'Shade Drop',
    cat: 'FLEX',
    tier: 'V1',
    base: 56,
    up: 0.9,
    lo: 0.1,
    idealAmp: 1.10,
    dur: 1700,
    hint: 'Fingertips to the brow, tip the head, then draw the frames straight down the face and let the arm fall away. Chin comes up as the hand leaves.',
    lag: 0,
    frames: [
      { t: 0 },
      { t: 0.18, sR: -136, eR: -111, head: -3 },
      { t: 0.4,  sR: -136, eR: -111, head: -6, lean: 1 },
      { t: 0.62, sR: -151, eR: -128, head: -3, lean: 1, bob: 1 },
      { t: 0.78, sR: -34,  eR: -24,  head: 2,  lean: -2, bob: -1, kR: -4 },
      { t: 1,    sR: -8,   eR: -14,  head: 5,  lean: -3, hR: 3,   kR: -3 }
    ]
  },

  // ── STILL WATER ────────────────────────────────────────────────────────
  // idealAmp 0.90 — the most restrained move in the deck, and a genuine 50/50:
  // the legs sink at exactly the speed the arms drift. Nothing travels, nothing
  // rotates. It bottoms out, releases a fifth of the sink, and flattens.
  //
  // This is the one move in the set that is truly symmetric, and getting there
  // needs the rig's one symmetric trick (fact 2): `kL:-b, kR:+b` with b inside
  // the +10 knee cap, and `sL:+p, sR:-p, eL:-q, eR:+q` for the arms. The
  // previous pass used matching signs on both, so the "sink" was a bow-legged
  // list and the arms that were meant to drift out actually crossed inward.
  // The sink is a wide plié, because 24° of hip is what buys 5 units of drop —
  // and bob is set to that 5, so the feet stay on the floor instead of through
  // it.
  {
    id: 'stillwater',
    name: 'Still Water',
    cat: 'FLEX',
    tier: 'V3',
    base: 62,
    up: 0.5,
    lo: 0.5,
    idealAmp: 0.90,
    dur: 2200,
    hint: 'Widen, then sink on both feet at the same speed. Arms drift out and stop. Do less than you think, then less again.',
    lag: 0,
    frames: [
      { t: 0 },
      { t: 0.25, hL: 12, hR: -12, kL: -6,  kR: 6,  bob: 1, sL: 8,  sR: -8,  eL: -6,  eR: 6 },
      { t: 0.5,  hL: 24, hR: -24, kL: -10, kR: 10, bob: 5, sL: 17, sR: -17, eL: -12, eR: 12, head: -2 },
      { t: 0.78, hL: 21, hR: -21, kL: -9,  kR: 9,  bob: 4, sL: 15, sR: -15, eL: -10, eR: 10 },
      { t: 1,    hL: 20, hR: -20, kL: -9,  kR: 9,  bob: 4, sL: 14, sR: -14, eL: -10, eR: 10 }
    ]
  },

  // ── SLOW TURN ──────────────────────────────────────────────────────────
  // A crossing pivot, driven from the back foot: the right leg steps across in
  // front of the left, the weight rolls onto it, the trailing leg swings round,
  // and the figure arrives narrower than it started — legs converged, head
  // last to settle.
  //
  // REWRITTEN. The old version drove `rot` to -66, and `rot` pivots about the
  // FEET (fact 4), so the move was a two-second faceplant that spent its whole
  // second half lying diagonally across the floor. There is no yaw on this rig;
  // a turn has to be sold by the feet crossing and the silhouette narrowing.
  // rot is capped at -8 here and does what it can honestly do: lean the body
  // into the pivot.
  //
  // 130ms of lag on top of a head that is already keyframed late, so the trail
  // is visible even at low amplitude.
  {
    id: 'slowturn',
    name: 'Slow Turn',
    cat: 'FLEX',
    tier: 'V3',
    base: 56,
    up: 0.3,
    lo: 0.7,
    idealAmp: 1.05,
    dur: 2000,
    hint: 'Step one foot across the other, roll the weight onto it, let the back leg swing round. Hips first, shoulders after, head last.',
    lag: 130,
    special: 'refresh',
    frames: [
      { t: 0 },
      { t: 0.18, hR: 14, kR: -10, hL: 2,   bob: 1, lean: 1,  rot: -2 },
      { t: 0.42, hR: 26, kR: -18, hL: -4,  kL: -2,  bob: 2, lean: 3,  rot: -5, sL: -8, sR: -7 },
      { t: 0.66, hR: 18, kR: -8,  hL: 22,  kL: -34, bob: 0, lean: 0,  rot: -8, sL: 6,  sR: 5, head: -6 },
      { t: 0.86, hR: 6,  kR: -2,  hL: -8,  kL: -6,  bob: 1, lean: -2, rot: -7, sL: 3,  sR: 2, head: -11 },
      { t: 1,    hR: 5,  hL: -6,  rot: -6, lean: -2, head: -14 }
    ]
  },

  // ── THE GRIMACE ────────────────────────────────────────────────────────
  // AURA-CULTURE §8.1 — "una mueca final contundente", the face that ends the
  // battle. Pure face, zero body.
  //
  // The rig has no face: the head is a filled circle, so rotating it alone
  // moves the silhouette about 7px and reads as nothing at all. That is what
  // the previous pass shipped — the highest-base move in FLEX rendered as an
  // invisible twitch.
  //
  // So the face is thrown THROUGH THE NECK. `head` runs to its limit and `lean`
  // adds to it in the same rotational direction, which carries the head circle
  // roughly 15 units sideways — more than its own radius, legible at thumbnail
  // size. sL/eL/sR/eR are absent from every frame and stay at exactly zero,
  // which is what keeps this a face and not a shrug: a shrug is shoulders, and
  // this move has no shoulder channel in it at all. `reach().joints` reports
  // head and lean and nothing else.
  //
  // Shape: a slow narrow drift off centre, a hard snap across in ~140ms, one
  // small recoil, then dead still to the end. Shortest dur in the set, because
  // it is what stops a battle rather than what fills one.
  {
    id: 'grimace',
    name: 'The Grimace',
    cat: 'FLEX',
    tier: 'V1',
    base: 78,
    up: 1.0,
    lo: 0.0,
    idealAmp: 1.15,
    dur: 1400,
    hint: 'One slow drift off centre, then throw the face across through the neck and hold it. Arms stay dead. Land it once and stop.',
    lag: 0,
    special: 'finisher',
    frames: [
      { t: 0 },
      { t: 0.3,  head: -3,  lean: -1 },
      { t: 0.55, head: -7,  lean: -2 },
      { t: 0.63, head: -8,  lean: -2 },
      { t: 0.72, head: 28,  lean: 6 },
      { t: 0.8,  head: 24,  lean: 5 },
      { t: 1,    head: 26,  lean: 5 }
    ]
  },

  // ── SHADOW STEP ────────────────────────────────────────────────────────
  // Sink into a wide stance, push off one foot, arrive silently on the other a
  // body-width off the line, and stop dead.
  //
  // Nothing on this rig leaves the ground (fact 5), so the travel is sold two
  // ways: the feet spread and land somewhere new, and `rot` slides the body
  // laterally while the feet stay planted. At -8 that carries the head about
  // 20px sideways without the figure reading as toppling — the old -20 read as
  // a stumble, and with bob 12 on top of it the feet were through the floor for
  // most of the clip.
  //
  // The arms are along for the ride and, with 100ms of lag, are still catching
  // up when the feet have stopped. That late settle is the evade.
  {
    id: 'shadowstep',
    name: 'Shadow Step',
    cat: 'FLEX',
    tier: 'V3',
    base: 46,
    up: 0.2,
    lo: 0.8,
    idealAmp: 1.00,
    dur: 1500,
    hint: 'Sink wide, push off one foot, land silent on the other foot and stop dead. The arms arrive late and quiet.',
    lag: 100,
    special: 'evade',
    frames: [
      { t: 0 },
      { t: 0.16, hL: 18, hR: -18, kL: -8, kR: 8,   bob: 3 },
      { t: 0.36, hL: 20, kL: -6,  hR: -10, kR: 4,  bob: 3, rot: -3, lean: 2 },
      { t: 0.58, hL: 30, kL: -8,  hR: 18,  kR: -34, bob: 2, rot: -7, lean: 3, sL: -6, sR: -5 },
      { t: 0.8,  hL: 14, kL: -3,  hR: -4,  kR: 3,  bob: 2, rot: -8, sL: -3, sR: -2, head: -4 },
      { t: 1,    hL: 5,  hR: -5,  kL: -1,  kR: 1,  bob: 1, rot: -8, lean: -1, head: -5 }
    ]
  },

  // ── HEEL DRAG ──────────────────────────────────────────────────────────
  // 10/90 and idealAmp 0.88: almost entirely legs, and quiet. Weight goes
  // forward onto the front foot first — it has to, or the back heel cannot
  // leave — then the back leg extends away along the floor and simply stays
  // there. The upper body's whole share is a couple of degrees of lean and a
  // hand that never quite swings.
  //
  // The dragging foot has to stay ON the floor or it is a kick, not a drag.
  // hR -26 with kR +10 gives 75 units of leg against 80 on the planted side, so
  // bob 3 lands both feet within 4px of y=200 — inside the stroke. The previous
  // hR -30 / kR -8 combination floated the trailing foot 7px clear and pushed
  // it to x=113, most of the way out of a 120-wide frame.
  //
  // 140ms of lag, the deepest in the set, so the torso is still arriving after
  // the heel has stopped.
  {
    id: 'heeldrag',
    name: 'Heel Drag',
    cat: 'FLEX',
    tier: 'V3',
    base: 66,
    up: 0.1,
    lo: 0.9,
    idealAmp: 0.88,
    dur: 2100,
    hint: 'Weight forward, then take the back heel away along the floor, slow. Never lift it, never look down at it.',
    lag: 140,
    frames: [
      { t: 0 },
      { t: 0.18, hL: 6,  kL: -4, hR: -6,  kR: 4,  bob: 1, lean: 1 },
      { t: 0.44, hL: 8,  kL: -6, hR: -16, kR: 6,  bob: 2, lean: 2, rot: -2 },
      { t: 0.72, hL: 10, kL: -8, hR: -26, kR: 10, bob: 3, lean: 1, rot: -3, sR: 5 },
      { t: 1,    hL: 9,  kL: -7, hR: -24, kR: 9,  bob: 3, rot: -3, sR: 4 }
    ]
  }

];
