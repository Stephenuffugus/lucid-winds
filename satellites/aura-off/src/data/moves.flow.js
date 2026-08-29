// AURA OFF — FLOW moves. Pure data, no logic.
//
// Nine moves, in CONTRACT.md §9 order. Every id/name/cat/tier/base/up/lo/
// idealAmp/special is copied from that table verbatim. The choreography, dur,
// lag and hint are authored here.
//
// Rig (CONTRACT §2, frozen):
//   rot bob lean head sL eL sR eR hL kL hR kR
//   UPPER = lean head sL eL sR eR      LOWER = rot bob hL kL hR kR
//
// Rest pose is all zeros, and a joint omitted from a keyframe IS zero — it is
// not "hold previous". So the joints named in a frame are exactly the joints
// doing something, and a 100/0 move simply never names a lower joint. In FLOW
// that omission is load-bearing: six-seven's legs are not unwritten, they are
// still, and the stillness is the move.
//
// Amplitude multiplies every joint value (CONTRACT §4.2), so each move is
// authored to read at its own idealAmp, not at 1.0. FLOW sits high — 1.15 to
// 1.30 across most of the set — so the raw numbers here are smaller than they
// look, and the biggest of them (spin's rot, crowdturn's shoulders) are sized
// so that ideal amplitude lands them just inside the sane range rather than on
// top of it.
//
// `lag` is the milliseconds the upper body trails the lower. CONTRACT §3 allows
// it only when lo > 0.5, which in FLOW is exactly two moves: spin (20/80) and
// crowdturn (40/60). River Prow and Body Wave are 50/50 — not greater — so they
// get lag 0, and their follow-through is written into the keyframes instead.
// For River Prow that is the bible's own instruction: the elbows trail the
// shoulders by ~15% of the cycle, which at seven frames is one frame slot.

export const FLOW_MOVES = [

  // ── SIX-SEVEN ──────────────────────────────────────────────────────────
  // AURA-BIBLE §2.1. Hands at chest height, PALMS UP, loose alternating
  // see-saw, elbows in near the ribs. The bible's ruling on the palms conflict
  // stands and is not re-litigated here.
  // sL/sR park at ∓35 and stay there — the arms do not travel, only the elbows
  // swap, which is what makes it a balance and not a wave. lean micro-counters
  // ±3 against the hands; head holds a 2° tilt and does nothing else.
  // Not one lower joint is named in any frame. That is the move.
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
    hint: 'Palms up at the chest, elbows in on the ribs. Let one hand fall as the other rises. Deadpan, and nothing below the waist.',
    lag: 0,
    frames: [
      { t: 0 },
      { t: 0.18, sL: -30, sR: 30, eL: -78, eR: -78, head: 2 },
      { t: 0.4,  sL: -35, sR: 35, eL: -95, eR: -60, lean: -3, head: 2 },
      { t: 0.6,  sL: -35, sR: 35, eL: -60, eR: -95, lean: 3,  head: 2 },
      { t: 0.8,  sL: -35, sR: 35, eL: -95, eR: -60, lean: -3, head: 2 },
      { t: 1,    sL: -34, sR: 34, eL: -76, eR: -76, head: 2 }
    ]
  },

  // ── LOOK AWAY ──────────────────────────────────────────────────────────
  // AURA-BIBLE §2.9. head 18-24° off-axis, lean −2, arms neutral at their
  // sides, lower body zero. The cheapest move in the deck and the shortest, and
  // it earns that by being almost nothing: the head goes off centre, one
  // shoulder settles a few degrees because the head took it there, and it stops.
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
    hint: 'Take the head a fifth of a turn off centre and leave it. Arms stay where they hang. Once it is off centre, it stays off centre.',
    lag: 0,
    special: 'feint',
    frames: [
      { t: 0 },
      { t: 0.24, head: 9,  lean: -1 },
      { t: 0.52, head: 21, lean: -2, sR: 4 },
      { t: 0.8,  head: 22, lean: -2, sR: 4 },
      { t: 1,    head: 20, lean: -2, sR: 3 }
    ]
  },

  // ── RIVER PROW ─────────────────────────────────────────────────────────
  // AURA-BIBLE §2.3 — the split the whole rig exists for. Serene above,
  // working hard below.
  //
  // UPPER runs ONE slow cycle across the full 2200ms: both arms sweep together
  // to one side (sL and sR share a sign, so they travel as a pair), peak near
  // ±75, and the torso leans the opposite way with the head counter-rotating
  // against the lean. The elbows are the whip: their bend is the shoulder's
  // magnitude from one frame slot earlier (~15% of the cycle, per the bible),
  // so the arm is at its straightest exactly at the peak of the sweep and folds
  // afterwards. That late fold is the entire reason this move looks expensive.
  //
  // LOWER runs THREE cycles in the same time — alternating knee bends in the
  // −6 to −14 band, hips trading weight ±6, bob ±4. Never still, never large.
  // The 3:1 frequency ratio between the halves is the read: the arms look
  // unhurried precisely because the legs are visibly not.
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
    hint: 'Wide arcs above, at half the speed you want to go. Below, keep correcting — small knee, small hip, never still. The face does none of it.',
    lag: 0,
    frames: [
      { t: 0 },
      { t: 0.16, sL: 42,  sR: 42,  lean: -5, head: 4,  bob: 3,  kL: -12, kR: -6,  hL: 5,  hR: -4 },
      { t: 0.33, sL: 75,  sR: 75,  eL: -32, eR: -32, lean: -9, head: 8,  bob: -3, kL: -7,  kR: -13, hL: -5, hR: 5 },
      { t: 0.5,  sL: 26,  sR: 26,  eL: -56, eR: -56, lean: -3, head: 3,  bob: 4,  kL: -13, kR: -8,  hL: 6,  hR: -5 },
      { t: 0.66, sL: -46, sR: -46, eL: -20, eR: -20, lean: 5,  head: -5, bob: -2, kL: -8,  kR: -14, hL: -6, hR: 6 },
      { t: 0.83, sL: -75, sR: -75, eL: -35, eR: -35, lean: 9,  head: -8, bob: 3,  kL: -14, kR: -7,  hL: 5,  hR: -4 },
      { t: 1,    sL: -22, sR: -22, eL: -56, eR: -56, lean: 3,  head: -3, bob: -1, kL: -9,  kR: -11, hL: -3, hR: 3 }
    ]
  },

  // ── SHOULDER ROLL ──────────────────────────────────────────────────────
  // One shoulder forward and up, over the top, back and down — then the other
  // one picks it up before the first has finished falling, so the two overlap
  // rather than alternate. The elbow hangs heavy off the shoulder throughout;
  // it never drives. The 20% lower share is one knee softening under whichever
  // shoulder is loaded, which is what stops the roll reading as a shrug.
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
    hint: 'Send one shoulder forward, up and over, and let it fall. Pick the other one up before the first has landed. Elbows just hang.',
    lag: 0,
    frames: [
      { t: 0 },
      { t: 0.18, sR: 26,  eR: -20, lean: -3, head: -2, kR: -5 },
      { t: 0.36, sR: -30, eR: -34, lean: 1,  head: 2,  bob: 3,  kR: -8 },
      { t: 0.54, sR: -10, eR: -16, sL: -26, eL: -20, lean: 3,  head: 3, bob: -2, kL: -5 },
      { t: 0.72, sL: 30,  eL: -34, sR: -4,  lean: -1, head: -1, bob: 3, kL: -8 },
      { t: 0.88, sL: 10,  eL: -16, sR: 12,  eR: -12, lean: -2, bob: -1 },
      { t: 1,    sL: -4,  sR: 4,   eL: -8,  eR: -8,  lean: -2, head: -3 }
    ]
  },

  // ── GROUND SPIN ────────────────────────────────────────────────────────
  // 20/80 and lower-led all the way through. The order is the whole move:
  // drop the weight into both knees, wind rot the WRONG way first, then drive
  // it round off the loaded leg. Arms tuck in to go and open out to stop,
  // which is how a body actually meters a spin.
  //
  // rot peaks at 64, which is 83° at idealAmp 1.30 — deliberately just inside
  // the ±90 range so the biggest turn in FLOW never has to be clamped at its
  // own ideal.
  //
  // lag 120: legs are already square before the arms have finished settling.
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
    hint: 'Drop into the knees and wind the wrong way first, then send it off the loaded foot. Arms tuck to go, open to stop. Finish square.',
    lag: 120,
    frames: [
      { t: 0 },
      { t: 0.14, bob: 10, kL: -16, kR: -16, rot: -12, lean: 3 },
      { t: 0.3,  bob: 14, kL: -22, kR: -14, rot: -22, hL: -12, lean: 4,  sL: -14, sR: 12 },
      { t: 0.5,  bob: 11, kL: -18, kR: -20, rot: 14,  hL: 8,   hR: -8,  lean: -2, sL: -8, sR: 8 },
      { t: 0.7,  bob: 8,  kL: -14, kR: -18, rot: 48,  hL: 14,  hR: -10, sL: -6,  sR: 6 },
      { t: 0.86, bob: 6,  kL: -10, kR: -12, rot: 62,  hR: 10,  lean: -3, head: -6, sL: -10, sR: 9 },
      { t: 1,    bob: 2,  kL: -4,  kR: -5,  rot: 64,  lean: -2, head: -8, sL: -4,  sR: 4 }
    ]
  },

  // ── BODY WAVE ──────────────────────────────────────────────────────────
  // A genuine 50/50: the wave starts at the head and is handed downward —
  // head, chest, hips, knees, floor — so each half owns half the trip. Every
  // keyframe has exactly one region at its extreme with its neighbours only
  // partway, which is what makes a wave read as travelling rather than as the
  // whole body pulsing at once.
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
    hint: 'Start it at the head and hand it down: chest, hips, knees, floor. One part at a time, never two at once, and send the next one before the last has gone.',
    lag: 0,
    frames: [
      { t: 0 },
      { t: 0.15, head: -8, lean: 4,  sL: -8,  sR: 8 },
      { t: 0.3,  head: 2,  lean: -7, sL: -14, sR: 14, eL: -18, eR: -18, bob: 4 },
      { t: 0.45, head: 6,  lean: 6,  eL: -24, eR: -24, bob: 8,  hL: -10, hR: -10 },
      { t: 0.6,  head: 2,  lean: 2,  eL: -16, eR: -16, bob: 10, hL: 8,   hR: 8,  kL: -16, kR: -16 },
      { t: 0.78, head: -5, lean: -5, sL: -10, sR: 10, eL: -10, eR: -10, bob: 5, kL: -9, kR: -9 },
      { t: 1,    head: 2,  lean: 2,  sL: -4,  sR: 4,  bob: 2,  kL: -4,  kR: -4 }
    ]
  },

  // ── SWIRL & SWING ──────────────────────────────────────────────────────
  // AURA-CULTURE §8.1 — AFP on how the athletes imitated the boat dancer:
  // "swirling their hands, then swinging their arms back and forth." Two beats,
  // in that order, and the file follows it literally.
  //
  // SWIRL (to t 0.44): the shoulders park in front and barely move; the elbows
  // do all of it, alternating deep and shallow out of phase so the two hands
  // circle each other. Twice round.
  // SWING (from t 0.62): the elbows open out and the shoulders take over,
  // sL and sR sharing a sign so both arms travel together — forward, back
  // through, and out. No pause between the two beats; the swirl is what throws
  // the swing.
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
    hint: 'Circle the hands around each other in front of you, twice round, then open out and swing both arms right through. Do not stop between the two.',
    lag: 0,
    frames: [
      { t: 0 },
      { t: 0.14, sL: 16,  sR: 16,  eL: -84,  eR: -84 },
      { t: 0.28, sL: 20,  sR: 13,  eL: -100, eR: -70,  lean: 2 },
      { t: 0.44, sL: 13,  sR: 20,  eL: -70,  eR: -100, lean: -2 },
      { t: 0.62, sL: 46,  sR: 46,  eL: -30,  eR: -30,  lean: -6, head: 4,  kL: -5 },
      { t: 0.84, sL: -52, sR: -52, eL: -16,  eR: -16,  lean: 7,  head: -4, kR: -6, bob: 3 },
      { t: 1,    sL: 28,  sR: 28,  eL: -20,  eR: -20,  lean: -3, head: 2,  kL: -3 }
    ]
  },

  // ── HEAD NOD ───────────────────────────────────────────────────────────
  // The other end of the deck from The Grimace: same one channel, opposite job.
  // Grimace is a single decisive snap that ends things; this is three even
  // nods, each on the same count, that hold a floor under whatever comes next.
  // The chin leads and the recovery is deliberately shallower than the dip —
  // it does not come all the way back up between nods, so the three read as one
  // continuous count rather than three separate movements.
  // A shoulder drifts a few degrees on the offbeat because the head took it
  // there, not because it is helping. Lower body zero.
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
    hint: 'Chin leads. Three nods, same count each time, and do not come all the way back up between. Shoulders are not helping.',
    lag: 0,
    frames: [
      { t: 0 },
      { t: 0.16, head: 16, lean: 1 },
      { t: 0.34, head: -4, lean: -1, sL: -3, sR: 3 },
      { t: 0.52, head: 17, lean: 2 },
      { t: 0.7,  head: -3, lean: -1, sL: -3, sR: 3 },
      { t: 0.86, head: 16, lean: 1 },
      { t: 1,    head: 6 }
    ]
  },

  // ── CROWD TURN ─────────────────────────────────────────────────────────
  // Lowest base in the deck and it is not scored on the pose — it turns your
  // back on the battle and gives the round to the people watching, which is
  // what `hype` pays for. Nothing in it is aimed at the other competitor; the
  // whole move faces away from them.
  //
  // 40/60, legs first: load the back foot, pivot rot round off the hip, and
  // only once the crowd is actually in front do the arms open wide and up and
  // stay there. The hips rise at the end (bob goes negative) as the weight
  // comes up onto the front foot.
  //
  // lag 130 — the deepest legal here and the point of the move. The feet have
  // finished the turn and are square while the arms are still opening. That
  // gap is what a crowd reacts to.
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
    hint: 'Pivot off the back foot until the crowd is in front of you, then open the arms wide and late and leave the arms open. The crowd makes the noise, not you.',
    lag: 130,
    special: 'hype',
    frames: [
      { t: 0 },
      { t: 0.16, bob: 6,  kL: -10, kR: -8, rot: 8,  hR: 8 },
      { t: 0.36, bob: 5,  kL: -12, kR: -6, rot: 30, hR: 16, hL: -8, lean: 3,  sR: 14 },
      { t: 0.58, bob: 3,  kL: -8,  rot: 50, hR: 12, hL: -4, lean: -2, sL: 30, sR: 30, eL: -22, eR: -22 },
      { t: 0.8,  bob: -3, kR: -5,  rot: 58, lean: -5, head: 6, sL: 62, sR: 62, eL: -14, eR: -14 },
      { t: 1,    bob: -1, kL: -3,  kR: -3, rot: 56, lean: -4, head: 5, sL: 54, sR: 54, eL: -12, eR: -12 }
    ]
  }

];
