# C3 screenshot ritual — what I saw, and what I did about it

HANDOFF-CONDUIT C3: shoot three frames, open them, name three faults in each
before anyone else does, and fix or ticket every one. Shots regenerate with
`node test/gate3.js <tag>` and `node test/closeup.js <tag>`.

The creature is under a tile wide by design, so at any honest play zoom it is
twenty or thirty pixels across and a full frame screenshot cannot tell you
whether it reads as ferrofluid. `test/closeup.js` exists for that: it crops to
where the creature stands and shoots at 4x, in five states.

---

## The close up, before anything else (`c3a-idle.png`)

This is where the pass really started, and it found the most important thing.

1. **It read as a soap bubble, not ferrofluid.** FIXED, and it is the one place
   this build departs from Appendix A. The appendix writes the rim's middle stop
   as `(hueA+hueB)/2`. With violet 268 and gold 44 that is **156, which is
   green**: the numeric average takes the long way round the colour wheel.
   Violet to gold the short way runs 268 to 404, whose midpoint is 336, magenta.
   A green midpoint is what made the rim read as an iridescent bubble skin. The
   appendix's *geometry* is verified (longest spike tracks the field within 1
   degree, and the suite now checks that at four angles); its palette arithmetic
   was not. Fixed with an explicit short way wrap.
2. **The rim was a fifth of the radius on a small creature.** FIXED. `1.5 +
   r*0.045` is nearly constant, so at r=10px the rim was proportionally 2.4x
   thicker than at r=40px, and the body stopped reading as matte black. Now
   proportional with a 1.1px floor.
3. **At rest it barely spiked at all.** FIXED by raising the resting field
   floor. The spikes are information and should be strongest near live power,
   but the silhouette has to say ferrofluid even when nothing is energised.

Not a fault, checked and kept: the teeth appear at **one** pole, not both. The
cone term uses an odd `nS` of 7, so `cos(nS*pi)` is negative at the far pole and
the teeth vanish there. That asymmetry is what gives the creature a single
dominant spike that points at the power, which is the whole reason the shape is
information. Left alone deliberately.

---

## (a) The player's normal view, mid heist (`c3-a-heist.png`)

1. **The powered devices were solid gold squares and owned all the colour, while
   the creature owned none.** FIXED. This is a straight inversion of the art
   direction: the world owns no colour, the creature owns all of it. A live
   device is now a dark box with a lit edge and a soft glow, and the sources
   match. The machinery reads as on without being the loudest thing in frame.
2. **The live wire read as a gold pipe, not a ribbon with its spikes up.** FIXED
   in two passes. First attempt made the teeth evenly spaced and all the same
   length, which read as a comb, and wider than the ribbon they grew from, which
   read as a centipede. Now each tooth varies by a hash of where it stands, and
   the ribbon body is wider than the fringe.
3. **The wet floor was a hard edged blue rectangle that read as a UI overlay.**
   PARTLY FIXED, and honestly still rectangular. It has a moving sheen now and
   the border tiles are feathered in the render only, because `WET` is
   simulation state the floor plate reads and must not be touched to make a
   picture look better. **TICKET for C6:** the sprinkler's area is authored as a
   rectangle, so no amount of shading fully hides that.

Also checked here, not a fault: the travelling rim light really travels. Sampled
over six frames the pulse head ran 3.42 to 7.62 along the run, so power visibly
moves source to device rather than sitting still. I could not have judged that
from a still and did not try to.

---

## (b) Flow with two live wires (`c3-b-flow.png`)

1. **I could not find the player.** FIXED. In the planning view the creature was
   under 8px across, which makes the most important object in the game invisible
   in the view where you plan around it. There is now a minimum drawn radius.
   The collision radius is untouched; only the drawing has a floor, and the
   planning view is schematic anyway.
2. **At Flow zoom the conduit lost every trace of ferro character**, because a
   ribbon 2px wide has no room for a fringe. FIXED with a minimum spike height
   in screen pixels, so some bristle survives the zoom.
3. **A dead run was nearly invisible**, which matters more than it sounds: a dead
   run is committed mass, and reclaiming it means finding it first. FIXED by
   raising the dead rim's contrast and giving the ribbon a minimum width.
4. Fixed while composing the shot: my own scene could not reliably produce two
   live wires, because a guard standing on a run when it energises zaps it dead.
   That is the game working; the scene now parks the patrols first.

**TICKET:** the exposure tier shading in Flow is present and correct (darker
means safer to route, and concealed keeps its hatching so it is never colour
alone) but it is subtle. Worth a Director look on a phone before tuning it,
since pushing it further costs map legibility.

---

## (c) The worst frame I could compose (`c3-c-worst.png`)

320x568, the creature thin and half inside a vent, a lockdown blacking the site
out, one run discovered and another mid reclaim, at the edge of the camera clamp.

1. **"Power is cut. Find the breaker." collided with the mass status line.**
   FIXED. It was right aligned across the top band from the status text, and at
   320 wide there is not room for both. It stacks under the status now.
2. **The toast was drawn underneath the control block.** FIXED. `bottom - 26`
   put it inside the buttons at every phone size. Both the toast and the route
   cost preview now sit above the block.
3. **At Lockdown the red screen edge and the red "discovered wire" were the same
   red**, so one meaning swallowed the other. FIXED: a discovered run is hot
   white gold beads now, distinct from the alarm ambience in both hue and shape.

**TICKET:** the creature in a vent draws as a stubby capsule, because the
capsule's length scales with speed and it was standing still. A fluid half
inside a gap should read as *necked*, narrow in the gap and round outside it.
That is a compound shape and it is worth doing, but it is polish rather than
identity.

**TICKET:** a dead run of yours and the facility's own inert wiring are both dim
grey lines, so at a glance they can be confused. The site wiring is thinner and
turns green once Splice is unlocked, but before that they are close.

---

## Frame budget (`node test/perf.js`)

844x390, two live runs, alarm state, every light on: the busiest frame the game
currently makes.

```
no throttle        59.9 fps   update 0.10ms   draw 1.31ms   detail 96
4x CPU throttle    21.3 fps   update 0.29ms   draw 3.73ms   detail 96
16x CPU throttle    6.0 fps   update 0.77ms   draw 12.44ms  detail 48
```

Budget is update <= 5ms and draw <= 8ms. At the 4x proxy the game's own work is
**4.02ms of a 16.7ms frame**, with room to spare.

**On the fps column, honestly: do not trust it.** Headless shell does not vsync
rAF to a display and reports about 49 to 60fps even unthrottled, so the frame
rate under throttling is measuring the harness as much as the game. The update
and draw numbers are direct CPU measurements of the game's own work and are what
the assertions use. A real phone check is still owed and is Stephen's to make.

Adaptive detail behaves: it holds 96 while the draw budget is met and drops to
48 only at 16x, where draw genuinely exceeds 6.5ms. Resolution goes, identity
does not.

## Update, after C4 and C5 (2026-09-01)

The budget went red and the gate caught it. Draw had climbed from 3.73ms to
**16 to 27ms** at the 4x proxy. The cause was C4's device glows: a fresh
`createRadialGradient` every frame for every powered machine, on top of the one
already being rebuilt for every light. Ten devices and nine lights on one map is
nineteen soft gradients a frame.

Both are now **baked into a sprite once at boot and blitted**, and the alarm edge
gradient is cached on resize rather than rebuilt.

```
                      before          after
no throttle           2.30ms draw     1.02ms draw, 60.2 fps
4x CPU throttle      16.16ms draw     2.55ms draw
```

**The lesson worth keeping: soft radial gradients are the expensive thing on a
canvas, and rebuilding one per object per frame does not scale past a handful.**
Headless software rasterisation makes that visible far earlier than a phone's
GPU would, which is the one way this harness flatters nothing.
