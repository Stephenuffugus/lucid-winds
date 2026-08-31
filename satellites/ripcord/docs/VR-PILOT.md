# VR PILOT — what it would take, honestly

Stephen's ask, 2026-08-31: physically wind the top, pull a cord while
holding a launcher, throw it out; what would it take on the Quest and
what are we missing. Short answer: a WebXR pilot is genuinely close,
because the hard parts already exist.

## What we already have

- **The whole game headless.** sim2.js runs in node with no screen; a
  3D scene can ride it 1:1 - the same physics, parts and balance,
  provably (every gate would still hold).
- **Every mesh.** 112 hardware meshes, 44 Meshy hero sculpts, 6
  launchers, 4 stadium dishes, floors and trail ramps - built, mounted,
  budgeted, and mostly UNUSED beyond the inspect viewer. The launchers
  and dishes were built FOR this day.
- **three.js vendored** (0.161.0) and already loading GLBs in the
  inspect viewer. WebXR is part of the same library.
- **The wind grader.** wind.js scores a drawn circle - laps, steadiness,
  power. A controller tracing circles in the air is the same data with
  a Z axis to flatten. The gesture he wants IS the grader we have.
- **A storefront.** Meta accepts 2D PWAs from us already; a WebXR PWA
  is the same lane with an XR session inside.

## The pilot, scoped

Stand at a table-scale dish. Hold the launcher (controller). Wind by
circling the off hand - the real grader scores it. Grip and PULL the
cord - release velocity is the rip. The real sim plays the round out on
the table in front of you; the tells, the finish, the ceremony line.
Play-only: the workshop stays on the phone as the companion, the save
is shared through the same storage.

Build shape: satellites/ripcord/vr/ entry that reuses sim2.js, wind.js,
the ladder and the meshes. No new game logic - a new CAMERA and a new
HAND.

## What we are actually missing

1. **The dish scene.** Assemble stadium mesh + floor + lighting at
   table scale; ride two hero-sculpt tops on sim positions. Days, not
   weeks - the assets exist.
2. **XR input mapping.** Wind-circle scoring from controller pose
   (adapt the grader), the pull gesture (velocity spike along the cord
   axis), a comfort pass on both.
3. **Performance discipline.** Hero sculpts are ~2MB/30k tris; the
   forge meshes are the LOD lane (built for exactly this). Quest
   browser wants 72 to 90Hz; two tops plus a dish is well inside
   budget IF we use the forge meshes for far and heroes for near.
4. **A headset in hands.** Nothing here can be believed until it is
   stood inside - same law as the phone. Pilot gates: a probe cannot
   feel presence.
5. **The zoetropes' second life.** At table scale a top is hand-sized:
   the faces that failed at 40 phone pixels are exactly the cosmetic
   layer VR wants. The cut frames are kept for this.

## What this is NOT

Not a native Unity/Unreal build (different repo, different studio
muscle); not hand-tracked (controllers first, hands later); not the
whole game in-world (play the fight, keep the bench 2D).
