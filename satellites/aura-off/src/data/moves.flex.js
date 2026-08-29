// AURA OFF — FLEX moves. Pure data, no logic.
//
// Nine moves, in CONTRACT.md §9 order. Every id/name/tier/base/up/lo/idealAmp/
// special is copied from that table verbatim. The choreography, dur, lag and
// hint are authored here.
//
// Rig (CONTRACT §2, frozen):
//   rot bob lean head sL eL sR eR hL kL hR kR
//   UPPER = lean head sL eL sR eR      LOWER = rot bob hL kL hR kR
//
// Rest pose is all zeros. A joint omitted from a keyframe IS zero — it is not
// "hold previous". So the joints named in a frame are exactly the joints that
// are doing something, and a 100/0 move simply never names a lower joint. That
// stillness is not an oversight, it is the move.
//
// Amplitude multiplies every joint value (CONTRACT §4.2), so each move is
// authored to read correctly at its own idealAmp, not at 1.0.
//
// `lag` is the milliseconds the upper body trails the lower. It is set only on
// the four lower-led moves (lo > 0.5), which is both the contract rule and the
// only place it means anything physically.

export const FLEX_MOVES = [

  // ── AURA WALK ──────────────────────────────────────────────────────────
  // AURA-BIBLE §2.4. Lower body carries it: hips ±22, knee −26 on the swing
  // leg, bob dipping at midstride, at roughly half the tempo of a real walk.
  // Upper is deliberately minimal — arms swing ±14 and the head does not move.
  // The relaxation is the content, so it must not be animated over.
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
    hint: 'Half tempo. Back straight, shoulders loose, eyes level. Let the legs do all of it.',
    lag: 110,
    frames: [
      { t: 0,    lean: -2, hL: 8,  hR: -8, kL: -4,  sL: -6,  sR: 6 },
      { t: 0.25, lean: -2, bob: 5,  hR: 22, kR: -26, hL: -14, kL: -6, sL: -14, sR: 14 },
      { t: 0.5,  lean: -2, bob: -5, hL: 6,  hR: -6,  kL: -2,  kR: -8 },
      { t: 0.75, lean: -2, bob: 5,  hL: 22, kL: -26, hR: -14, kR: -6, sL: 14,  sR: -14 },
      { t: 1,    lean: -2, bob: -2, hL: 8,  hR: -8,  kR: -4,  sL: 6,  sR: -6 }
    ]
  },

  // ── JAWLINE ────────────────────────────────────────────────────────────
  // AURA-BIBLE §2.2, classroom variant. Finger vertical at the lips, then slid
  // back along the jawline to the ear, and the head rotates INTO the hand
  // (+4 → +11) instead of away from it. lean −3 is the whole recline. Lower
  // body locked: no lower joint appears in any frame.
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
    hint: 'Finger up at the lips, then slide it back along the jaw to the ear. Head turns into the hand. Nothing below the neck.',
    lag: 0,
    special: 'interrupt',
    frames: [
      { t: 0,    lean: -1 },
      { t: 0.22, sR: -118, eR: -104, head: 3, lean: -2 },
      { t: 0.45, sR: -124, eR: -112, head: 5, lean: -3 },
      { t: 0.75, sR: -102, eR: -88,  head: 9, lean: -3 },
      { t: 1,    sR: -88,  eR: -70,  head: 11, lean: -3 }
    ]
  },

  // ── COLD READ ──────────────────────────────────────────────────────────
  // AURA-BIBLE §2.5. Forearms stacked high across the chest, chin down, then
  // total stillness. The last two keyframes are deliberately identical: the
  // hold is written into the data, not left to the player. Right forearm sits
  // over the left, hence eR flexed a few degrees deeper than eL.
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
    hint: 'Lift, stack the forearms high on the chest, chin down. Then do not move again for the rest of it.',
    lag: 0,
    special: 'guard',
    frames: [
      { t: 0 },
      { t: 0.3,  sL: -38, sR: 40, eL: -44, eR: -48, lean: -2 },
      { t: 0.55, sL: -60, sR: 62, eL: -70, eR: -76, head: 5, lean: -4 },
      { t: 1,    sL: -60, sR: 62, eL: -70, eR: -76, head: 5, lean: -4 }
    ]
  },

  // ── SHADE DROP ─────────────────────────────────────────────────────────
  // Glasses are already up on the brow. Fingertips find the frames, the chin
  // dips so gravity does the work, the thumb sets the bridge, and the
  // chin comes up as the hand leaves. The 10% lower is one small settle back
  // onto the rear heel timed to the chin lift — that is the whole leg budget.
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
    hint: 'Fingertips to the brow, tip the chin, let the glasses fall. Thumb sets the bridge, chin comes up as the hand leaves.',
    lag: 0,
    frames: [
      { t: 0 },
      { t: 0.18, sR: -104, eR: -96,  head: -4 },
      { t: 0.34, sR: -114, eR: -108, head: -8, lean: 1 },
      { t: 0.52, sR: -96,  eR: -78,  head: -2, lean: 1,  bob: 2 },
      { t: 0.72, sR: -84,  eR: -62,  head: 4,  lean: -3, bob: -2, kR: -6 },
      { t: 1,    sR: -6,   eR: -8,   head: 6,  lean: -4, hR: 4,   kR: -4 }
    ]
  },

  // ── STILL WATER ────────────────────────────────────────────────────────
  // idealAmp 0.90 — the most restrained move in the deck, and a genuine 50/50:
  // the legs sink at exactly the speed the arms drift. Nothing travels, nothing
  // rotates. It bottoms out, releases about a fifth of the sink, and flattens.
  // Anything sharper reads as a squat instead of a settle.
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
    hint: 'Sink on both feet at the same speed. Arms drift out and stop. Do less than you think, then less again.',
    lag: 0,
    frames: [
      { t: 0 },
      { t: 0.25, bob: 6,  kL: -9,  kR: -9,  sL: -10, sR: 10, lean: 1 },
      { t: 0.5,  bob: 10, kL: -13, kR: -13, sL: -16, sR: 16, eL: -8, eR: -8, head: -2 },
      { t: 0.78, bob: 8,  kL: -11, kR: -11, sL: -13, sR: 13, eL: -5, eR: -5 },
      { t: 1,    bob: 8,  kL: -10, kR: -10, sL: -12, sR: 12, eL: -4, eR: -4 }
    ]
  },

  // ── SLOW TURN ──────────────────────────────────────────────────────────
  // A quarter-and-a-bit turn on the spot, driven from the back foot. rot and
  // the hips get there first, the shoulders follow, and the head is the last
  // thing to arrive — written into the keyframes on top of the 130ms lag, so
  // the trail is visible even at low amplitude.
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
    hint: 'Turn from the back foot. Hips first, shoulders after, head last. One count per quarter.',
    lag: 130,
    special: 'refresh',
    frames: [
      { t: 0 },
      { t: 0.18, rot: -7,  hR: 8,  kR: -8, bob: 4, lean: 2 },
      { t: 0.42, rot: -30, hR: 14, hL: -10, kL: -10, kR: -6, bob: 5, lean: 3, sL: -10, sR: 8 },
      { t: 0.66, rot: -54, hR: 10, hL: -6,  kL: -8,  bob: 3, lean: 1, sL: -6, sR: 5, head: -6 },
      { t: 0.86, rot: -64, hL: 4,  kL: -4,  kR: -3,  bob: 1, lean: -1, head: -10 },
      { t: 1,    rot: -66, lean: -2, head: -14 }
    ]
  },

  // ── THE GRIMACE ────────────────────────────────────────────────────────
  // AURA-CULTURE §8.1 — "una mueca final contundente". Pure face, zero body.
  // The rig's only facial channel is `head`, so this move is one joint and
  // nothing else: a slow narrow drift off centre, then a hard snap across, then
  // held to the end. The shortest dur in the set, because it is what stops the
  // battle rather than what fills it.
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
    hint: 'One slow drift off centre, then snap it across and hold. Nothing below the jaw. Land it once and stop.',
    lag: 0,
    special: 'finisher',
    frames: [
      { t: 0 },
      { t: 0.45, head: -4 },
      { t: 0.66, head: -7 },
      { t: 0.74, head: 22 },
      { t: 1,    head: 20 }
    ]
  },

  // ── SHADOW STEP ────────────────────────────────────────────────────────
  // Drop into both knees, push off the right foot, arrive silently on the left
  // a body-width off the line, and stop dead. Legs do all of the travel; the
  // arms are along for the ride and, with 100ms of lag, are still catching up
  // when the feet have already stopped. That late arm settle is the evade.
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
    hint: 'Drop into the knees, push off one foot, land silent on the other. The arms arrive late and quiet.',
    lag: 100,
    special: 'evade',
    frames: [
      { t: 0 },
      { t: 0.16, bob: 8,  kL: -12, kR: -12, hL: -6 },
      { t: 0.38, bob: 12, rot: -14, hR: -18, kR: -16, kL: -10, hL: 10, lean: 3 },
      { t: 0.6,  bob: 9,  rot: -20, hL: 16,  kL: -18, hR: -10, kR: -6, lean: 2, sL: -8, sR: 6 },
      { t: 0.82, bob: 4,  rot: -18, hL: 6,   kL: -8,  kR: -5,  lean: -1, sL: -4, sR: 3, head: -6 },
      { t: 1,    rot: -16, kL: -3,  kR: -3,  lean: -2, head: -8 }
    ]
  },

  // ── HEEL DRAG ──────────────────────────────────────────────────────────
  // 10/90 and idealAmp 0.88: almost entirely legs, and quiet. Weight goes
  // forward onto the front foot first — it has to, or the back heel cannot
  // leave — then the back leg extends away along the floor and simply stays
  // there. The upper body's entire share is two degrees of lean and a hand
  // that never quite swings. 140ms of lag, the deepest in the set, so the
  // torso is still arriving after the heel has stopped.
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
      { t: 0.2,  bob: 6, hL: -6, kL: -10, kR: -6,  lean: 1 },
      { t: 0.48, bob: 9, hR: -20, kR: -14, hL: -4, kL: -12, rot: -4, lean: 2 },
      { t: 0.76, bob: 8, hR: -30, kR: -8,  hL: -2, kL: -14, rot: -6, lean: 1, sR: 6 },
      { t: 1,    bob: 5, hR: -27, kR: -6,  kL: -11, rot: -6, sR: 4 }
    ]
  }

];
