# CONDUIT — HANDOFF

**Read this first, then `../../HANDOFF-CONDUIT.md` (the phase plan) and
`docs/BUILD-PLAN.md` §2. Update this file at the end of every session.**

## Where we are

**C1, C2 and C3 are complete.** M1, the ship gate, is still unanswered and is
still Stephen's alone. C4, prowl completion and the device orchestra, is next.

`index.html` is a complete, playable prototype in one file, no build step,
canvas 2D, touch first. It runs from `file://`, GitHub Pages, or anywhere.

## How to check it, in order

```
node test/smoke.js                 178 assertions, headless, no deps
node test/mutants.js               40 mutants, all must be killed
node test/controls.js [w] [h]      51 assertions, real touches in real Chrome
node test/shots.js <tag>           screenshots at 320, 375, 844, 1280
node test/gate3.js <tag>           the three C3 ritual frames
node test/closeup.js <tag>         the creature itself, cropped, at 4x
node test/perf.js [rate]           frame budget under CPU throttle
node test/fullrun.js [w] [h]       plays the whole level with real touch input
node test/lockdown.js [w] [h]      plays the lockdown loop three times
test/drive.js                      the shared browser hands, not a test itself
```

`?seed=1234` picks the seed. `localStorage.setItem("sws_dev_ok","1")` turns on the
dev overlay: seed, alert state and decay timer, per enemy spot progress and state,
the full ledger tail, and frame/update/draw times.

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

## What C2 changed

### The whole fifth alert state was dead, in two independent places
Nothing in the game ever bumped past 3, so **alert 4 was unreachable**
(`bump(Math.max(2, S.site.alert))` cannot exceed the level it reads). And
`resolvePower` skipped every conduit while lockdown was true, so **the breaker
could never come on**, so it could never clear the lockdown, and
`alertDecaySec[4]` is Infinity. The lockdown loop the design calls a routing
puzzle could be neither entered nor left.

- Sightings now climb the ladder: a fresh spot takes Calm or Suspicion to Search,
  and each further sighting climbs one step to Lockdown. Edge triggered on
  `e.seen`, because spot sits pinned at 1 while he can see you and a per frame
  bump would reach Lockdown instantly. `CFG.spotEscalates` turns it off.
- Lockdown cuts the site's power, not yours: the breaker is the one device you
  can still energise, because energising it is the way out.
- Played three times in a browser (`node test/lockdown.js`), plus 16 assertions
  and four mutants covering both halves.

### Route assist
Tap a source, tap a machine, take the cheapest legal path, then drag to edit it,
or ignore it and draw the whole thing by hand. The assist proposes and
`draftStep` still lays, so the legality rules and the price cannot drift apart
between the two ways of drawing a route. Uniform cost search over `tileCost`.

**It costs 19.8 to the sprinkler where the designed hand route costs 24.6, and it
buys that entirely with exposure** (concealed ground is 1.6x). So it does not
solve the puzzle for you: it hands you the cheap dangerous answer and you drag it
into cover if you would rather hide. Gated on legality, on charging exactly what
the same path costs by hand, on refusing an unaffordable route whole rather than
laying half of it, and on being the true optimum, checked against an independent
relaxation oracle rather than against itself.

### The corridor drone
Shortened from the whole corridor to its east half, per the designer note:
length, never spot rates. My first attempt started it at x 15 and **broke the
solvability gate**, because the drone reached the designed route's corridor
crossing sooner, zapped the wire and burned it off the plate. The patrol is now
kept clear of x 18 to 22, the only legal crossing. See the open item below.

### Also
`CFG.guardRewalks` plus `guardRewalkSec` for testing the recurring investigation.
`?seed=`. A dev overlay behind `localStorage.sws_dev_ok`. A settings drawer:
sound and haptics record the choice for C6, handedness is live and actually moves
the thumb block, all stored read modify write so a second tab cannot clobber it.

## Open, and deliberately not fixed

- **Lockdown cannot be reached by ordinary play, only by sustained pressure.**
  Suspicion decays in 8s and Search in 15s, and a retreat long enough to break
  line of sight costs more ground than the next sighting gains. The ladder is
  climbable and the suite climbs it, but shuttling in and out of cover never gets
  there. **Director call: is Lockdown meant to be that hard to trip?**
- **`?seed=` currently changes nothing.** `S.rng` is created and never consumed,
  and there are zero `Math.random` calls: nothing in the sim is random yet. The
  plumbing satisfies the architecture law for when something is, but do not read
  a seed in a log as meaning a run can be replayed. In a browser it cannot be
  anyway, because real frame timing varies.
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

## What C3 changed, the ferro pass

`CFG.ferroRender` is on. Appendix A's geometry is copied exactly; the creature is
a matte near black body with an iridescent rim across the field axis and one
specular, spiking along the field. The field points at the nearest live conduit,
then the nearest powered source, then your own motion, so **the creature's hair
tells you where power is flowing**. The render radius chases the true radius on
a spring, so a harvest visibly swells you and a hit ripples and rings the rim.
Squeezing a vent draws a stretched capsule. The conduit is the same creature: a
ribbon that lies flat and matte when dead, stands its fringe up when live, runs a
rim light source to device (verified travelling, not assumed), flares as it is
slurped home on reclaim, and grows from a bright extruding tip while you draw it.
Entering Flow spreads a ring of awareness over the site and shades the exposure
tiers. Alarm and Lockdown press red in at the screen edges. Drinking a light
collapses the pool into the creature.

**One departure from Appendix A, flagged for Fable.** The appendix writes the
rim's middle stop as `(hueA+hueB)/2`. With violet 268 and gold 44 that is 156,
**green**, because the numeric average takes the long way round the wheel. The
short way is 268 to 404, midpoint 336, magenta. That single number was why the
creature read as a soap bubble. The geometry in the appendix is verified and
untouched; the palette arithmetic was not.

**The sim identity assertion found a bug that had nothing to do with ferro.**
`cscanT`, the conduit scan phase, lived outside `S` and `newGame()` never reset
it, so the second game in a page inherited the first one's scan timing and
diverged. A restart was not a fresh game. Fixed and gated separately.

Everything I saw in the three ritual frames, fixed or ticketed, is in
`docs/C3-FAULTS.md`. Four things are ticketed there rather than fixed.

## Next action

**C4, prowl completion and the device orchestra**, in the addendum's priority
order: drag a body, peek, cling, pool, battery cart dragging, then the remaining
devices, then the vehicle battery. Every verb gets smoke assertions and a mutant
that kills them, and the gate wants the suicide table written here: for every
direct verb, name the watched situation where it is suicide and the wire is the
answer.

Before that, two things worth an hour. The four tickets in `docs/C3-FAULTS.md`
are small and real, and the frame budget has plenty of room for them
(`update 0.29ms, draw 3.73ms` at a 4x throttle against a budget of 5 and 8).
And nothing here has been on a phone: every frame in `docs/shots` is headless
Chrome. A real device pass is owed.
