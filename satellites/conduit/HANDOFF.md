# CONDUIT — HANDOFF

**Read this first, then `../../HANDOFF-CONDUIT.md` (the phase plan) and
`docs/BUILD-PLAN.md` §2. Update this file at the end of every session.**

## Where we are

**C1 through C4 are complete.** M1, the ship gate, is still unanswered and is
still Stephen's alone. C5, content and progression, is next.

`index.html` is a complete, playable prototype in one file, no build step,
canvas 2D, touch first. It runs from `file://`, GitHub Pages, or anywhere.

## How to check it, in order

```
node test/smoke.js                 311 assertions, headless, no deps
node test/mutants.js               67 mutants, all must be killed
node test/verbs.js [w] [h]         every prowl verb, by real touch
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

## What C4 changed, the prowl layer

Built in the addendum's priority order: **drag a body, peek, cling, pool, push
the battery cart**, plus the **coolant vent** and the frozen-guard-as-battery
combo the plan makes mandatory. The action button and the thing it does now come
from one function, `contextVerb`, so the label a player reads can never drift
from what happens. PEEK is a hold, and it takes the RECLAIM slot while prowling
because RECLAIM is dead weight outside Flow.

### The suicide table
The addendum's rule is that a direct verb handles one **isolated** problem: the
moment the target has a witness the verb becomes suicide and the wire is the
answer. Every cost below is measured by an assertion, not asserted by hand.

| Verb | What it costs you | Where it is suicide | What the wire does instead |
|---|---|---|---|
| **Smother** | 2s immobile and fully visible, needs mass >= 40, costs 8 | A second patrol with a sightline on the target. You are pinned in the open for two seconds in front of them | The speaker pulls the target somewhere unwatched, or the plate kills it with you nowhere near |
| **Tap** | 2 mass, and it pulls patrols **to you** | Anywhere you can be seen. You have just invited them to look at exactly where you are | The speaker is the same noise somewhere else, which is the whole point of it |
| **Drink a light** | 3 mass, a noise, and you must stand in the lit pool to do it | Any sightline onto that pool. You are standing in the brightest tile on the map | Route through concealed ground instead of making ground dark |
| **Drag a body** | 3.96 tiles per 2s against 7.20 walking, a noise every 2s that pulls anyone within 7 tiles, and no Flow at all | A route to shadow that crosses a sightline. Slow, loud, and holding the evidence | Harvest it where it lies, which is also disposal, or lure the finder away |
| **Peek** | 1 mass a second for as long as it is held, standing still | Already inside a cone. You are paying mass to stand in it | Pulse costs 4 once, goes through walls, and does not need you to be near |
| **Cling** | No mass, but no wire from up there and no forcing doors. 2.6x longer to be spotted | A problem that needs power. You have made yourself safe and useless | Come down. Every device needs a source and a run |
| **Pool** | Free, but half speed while flat. About 2x longer to be spotted | A guard walking straight at you. Hardest to see and slowest to leave | Nothing: pooling is what you do *while* the wire works |
| **Push the cart** | 3.02 tiles per 2s, no Flow, and any run it was feeding dies the moment it leaves | Open ground. You are the slowest thing on the map, in the open, next to a battery | Extend the wire and leave the cart where it stands |

### Two real design collisions found by building it

1. **Carrying and absorbing competed for the same reach.** Standing over a body
   harvested it, so the body you reached down to pick up was eaten before the
   drag could start. You carry it or you absorb it, never both, and there is now
   a short grace window after a kill because a smother ends with you standing on
   the body and absorbing one takes well under a second. Without that window the
   drag verb was **unreachable for any body you made yourself**.
2. **And the deeper version of that is a Director call.** Harvesting a body
   removes it entirely, which is also disposal, so it is usually strictly better
   than moving it. Drag's remaining niche is narrow: you are at capacity, or you
   cannot afford the second it takes to stand there. Worth asking whether drag
   needs a reason to exist that harvest cannot cover.

### Also
A run is only live while its first tile is still standing on its source, which
had never been checked. Without it a battery cart could be wheeled across the map
and keep feeding a device from anywhere.

### The device orchestra, all of it
Ten devices and five sources now, every one explaining itself when tapped,
printing what it needs when unpowered, and carrying a designed partner rather
than being a switch that does a thing on its own:

| Device | What it does | Its partner |
|---|---|---|
| **Sprinkler** | wets its area | the floor plate: wet plus electrified is the kill |
| **Floor plate** | electrifies its tile, harmless dry | the sprinkler, and the speaker that walks someone onto it |
| **Speaker** | pulls patrols to it | the plate and the crane, both of which need something standing somewhere |
| **Breaker** | ends a lockdown | the lockdown itself, and it is the only thing you can power in the dark |
| **Coolant vent** | freezes what walks through it | **a frozen guard is a source**, worth 2.5x his mass, until he thaws |
| **Floodlight** | lights its area | drink a light, which it undoes, and the concealed spines, which it **beats**: a lit run is exposed however good its cover was |
| **Fan** | shoves bodies along and hums | drag a body, because it can move one you cannot reach, and the crane, because it can shove something under it |
| **Crane** | crushes what stands on its drop tile | the speaker and the fan, which are how anything gets there |
| **Door lock** | opens its door with power | the force threshold, which it is the alternative to. Cut the power and it shuts, which is how you trap a patrol |
| **Camera** | shows what it can see, free | peek and pulse, which cost mass and which it replaces only for the ground it covers |
| **Vehicle battery** | 120 capacity, enough for anything on the site | itself: it drains from the moment it feeds anything and then it is scrap |

Three bugs came out of building them, each now gated:

- **The door lock un-forced doors.** It rewrote its tile every frame, so a door
  the player had forced open snapped shut again. It now tells its own opening
  from a forced one, and it will not shut on anybody standing in it, because
  that is a softlock rather than a trap.
- **The vehicle battery was placed inside the sealed exfil chamber**, behind the
  carve-out, where no wire could ever leave it.
- A floodlight had to be able to beat concealed ground or it was decoration; it
  does, and that makes the one truly safe route on the map contestable.

## Next action

**C5, content and progression**: the level loader, the six level curriculum,
save and load with read modify write, the residue spend screen and the first
trait set, and Splice shipping for real. Note that C5's anti grind and save rules
are the ones most likely to hide the kind of bug this session kept finding, so
budget for gates rather than features.

Two things owed regardless. The four tickets in `docs/C3-FAULTS.md` are small and
real, and the frame budget has room for them. And **nothing here has ever been on
a phone**: every frame in `docs/shots` is headless Chrome, and the fps column in
`test/perf.js` cannot be trusted because headless shell does not vsync. A real
device pass is Stephen's to make and nothing in this session substitutes for
it.
