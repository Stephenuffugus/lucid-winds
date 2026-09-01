# CONDUIT — HANDOFF

**Read this first, then `../../HANDOFF-CONDUIT.md` (the phase plan) and
`docs/BUILD-PLAN.md` §2. Update this file at the end of every session.**

## Where we are

**C1 is complete. C2 is next.** M1, the ship gate, is still unanswered and is
still Stephen's alone.

`index.html` is a complete, playable prototype in one file, no build step,
canvas 2D, touch first. It runs from `file://`, GitHub Pages, or anywhere.

## How to check it, in order

```
node test/smoke.js                 123 assertions, headless, no deps
node test/mutants.js               30 mutants, all must be killed
node test/controls.js [w] [h]      40 assertions, real touches in real Chrome
node test/shots.js <tag>           screenshots at 320, 375, 844, 1280
node test/fullrun.js [w] [h]       plays the whole level with real touch input
```

`test/mutants.js` is the one to understand. HANDOFF-CONDUIT rule 3 says a gate
you have not watched fail is decoration. This breaks one mechanic at a time in
a scratch copy of index.html, runs the whole smoke suite against it, and prints
which assertions died. **A mutant that SURVIVES names a decorative test.** Run
it after adding any assertion, and add a mutant for every mechanic you add.

## What C1 changed

### The suite was mostly decoration, and now is not
The inherited 57 assertions stayed green while **ten** load bearing rules were
broken one at a time, because those checks compared constants to each other
instead of running the code (`ok(..., CFG.squeezeAt <= b.mass)` cannot fail):
ledger damage, conduit through walls, the shared source budget, lockdown
cutting power, the squeeze threshold, the force threshold, smother's unaware
only rule, concealed conduit never being spotted, harvest credit, spot decay.
All ten now drive the real code path. **57 to 123 assertions, 30 of 30 mutants
killed, 0 survivors.**

### Three real bugs found and fixed
1. **The force hold was cleared by the axis with no input.** `movePlayer` called
   `tryForce` once per axis; with `vx` of 0, `Math.sign(0)` aimed the check at
   the blob's own tile and zeroed `forceT` every frame the body overlapped
   anything illegal. Harvest a body beside a door and that door could never be
   forced again. Now one hold per frame, cleared only when neither axis is
   pressing a door. Guarded by a regression test and the `force-hold-per-axis`
   mutant.
2. **A drag that skipped or was briefly blocked silently killed the rest of the
   stroke.** `onMove` walked a phantom cursor from `lastTouchTile`; one rejected
   step desynced it from the route and every later step was refused as non
   adjacent, so the player got a short route with no way to tell why. And the
   early out compared the finger to `lastTouchTile`, so a route that fell behind
   could never catch up. Now `draftTo` always extends from the route's real end,
   tries the other axis when one is walled, and the early out compares against
   the route end, so a dropped event costs nothing. This was the top predicted
   phone friction item in the plan.
3. **Zap burn was booked to the wrong cause.** `debits.zapBurn += 0` left that
   category permanently zero while the mass went to `destroyed`, so an audit of
   a leak would have been reading a lie about where mass went.

### The frame
- Real title screen. No developer copy, no dashes anywhere in player copy, Sky
  Wolf Studio brand line. It fits without scrolling at all four viewports; it
  used to clip at both ends unscrollably in landscape (the wordmark sat at
  y -22) because a flex item taller than its centred container clips at both
  ends. `margin:auto` on the panel, not `align-items:center`.
- **The void is gone.** The camera used to wander off the map, and the game
  starts you in the bottom left corner, so the first thing a player saw was a
  sea of nothing. The camera is now clamped to the site plus a margin, and the
  darkness that remains has grain, a hairline site boundary with corner ticks
  (drawn only when the corner is actually on screen) and a vignette.
- **In Flow the controls were opaque to touch and sat on the map's bottom right,
  so the breaker and the exfil corner could not be routed on at all.** `hitBtn`
  runs before the map. Flow now fits the site into the largest rectangle the
  controls leave free, which in landscape is the space to their left; the map is
  both reachable and bigger than it was (scale 7.06 to 9.35 at 844x390).
- HUD rebuilt: mass as a ferro ribbon (matte body, iridescent rim, a bright
  meniscus at the fluid's edge so the level reads, hatched committed segment so
  it is not colour alone, threshold notches), alert pips that read as one of
  five instead of a single floating square, buttons at 48px minimum rendered at
  every viewport, soft scrims top and bottom so HUD text has contrast over any
  world content, safe area insets read out of CSS rather than guessed.
- Sizing uses `visualViewport`, never `innerHeight`.
- All numbers live in `CFG.ui`. Nothing numeric is loose in render code.

## Open, and deliberately not fixed in C1

- **The breaker cannot end a lockdown. The designed recovery loop is dead code.**
  `resolvePower` skips every conduit while `S.site.lockdown` is true, so the
  breaker can never turn on, so it can never clear the lockdown, and
  `alertDecaySec[4]` is `Infinity`. This is C2's "play the breaker loop by hand
  and fix what is broken" item, and it is exactly the bug that item predicted.
  Found statically; the fix and its assertion belong in C2.
- **The intended solution route crosses the patrol it is meant to trap.** Wire A
  goes live under the sentry, he steps on it, takes 15, and the run burns 3
  tiles of itself off the sprinkler at zero refund. Q5 working as written, and
  genuinely the most interesting thing that happened in five runs, but it means
  the documented solve partly self destructs on contact. Feature or level
  authoring: **Director call.**
- **The same script swings from +1.2 to -22.9 net mass** across runs, on timing
  alone. The economy is tight enough that one run tells you nothing about the
  average. Worth a batch of runs before any CFG tuning.

## Tickets raised in C1, for C3 (the ferro pass)

- The player is a 10px plain ring and is the least visible thing on screen in
  both prowl and Flow. It is the most important object in the game. This is
  C3's whole job.
- Vision cones read as flat tan light pools, not as attention. Legibility of who
  can see what is a stealth game's core read.
- Light pools read as fog blobs.
- In Flow the device chips are now the highest contrast thing on the map; they
  could dim when the player is not routing.
- The site's own wiring, the metroid affordance players are supposed to walk
  past and wonder about, is invisible at Flow zoom.

## What is built (carried forward, still true)

Mass ledger with a per frame invariant assert; blob with mass as health, ammo,
reach and size; speed curve; squeeze under 30 and force over 70, both gating
real geography; a 48x32 site with concealed routing spines and a vent that
doubles as a conduit channel; conduit with per tile cost, no self crossing,
live/dead resolution, discovery, guards that walk the wire, retracting reclaim
at 6 tiles/s for 75%; socket and generator with a shared capacity budget;
sprinkler, floor plate, speaker, breaker; two enemies with BFS pathing, vision
cones, spot progress rings, the five state alert including lockdown; harvest
with 30s body decay; overflow to residue; four medals; smother, tap, drink a
light, bodies are evidence, the contextual ACT button, device inspection cards;
and the splice affordances drawn dim and inert in the level from day one.

## What is deliberately NOT built

Body dragging, peek, cling, pool, battery carts (addendum 1 §2, build in that
order). Ferro rendering (`CFG.ferroRender` is still false: that is C3). Audio,
haptics, splitting (M5, but `player.blobs` is already a list), the other seven
devices, level loader, save/load, 3D. Do not add these before their phase.

## Next action

C2, in the plan's order. Start with the breaker: play the lockdown loop by hand,
fix the dead recovery, and gate it with an assertion and a mutant. Then route
draw assist (tap source, tap device, auto route cheapest, then let the player
drag to edit), the drone patrol shortening, `?seed=` and the dev overlay, and
the settings drawer stub. Five logged runs answering the M1 questions as the
builder's read, with Stephen's verdict column left empty for him.
