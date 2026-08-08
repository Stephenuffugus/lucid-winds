# Dewball: the landmark layer
# Stephen, 2026-08-08: "when we get to the larger sizes it's not just a bunch of
# redundant same little things you're picking up finishing your last minute on
# the level. it's dumb and not fun. so we need like large structures that are
# completely unique now."

---

## He is right, and the numbers are worse than they sound

I measured what a player actually absorbs in the closing stretch of each world,
counting only props at least a third of the goal diameter, which is what the
ball is big enough to eat in the last minutes.

| world | goal | distinct kinds late | one of a kind | the endgame is |
|---|---|---|---|---|
| w1 Crumb Country | 24cm | 28 | 4 | fine |
| **w2 Toybox Peaks** | 70cm | 13 | **NONE** | 117 timber towers, 90 teddies |
| **w3 Night Garden** | 170cm | 15 | **NONE** | **104 wheelbarrows**, 96 pumpkins |
| w4 Bazaar Lane | 340cm | 11 | 1 | 86 street lamps, 76 fruit carts |
| **w5 Starfall Bay** | 1600cm | **8** | 3 | **62 beach huts, 34 fish shacks, 34 houseboats, 34 sailboats** |
| w7 The Whole World | 2200cm | 16 | 3 | 87 oaks, 41 windmills |

**The late game is the most repetitive part of every world, and it gets worse
the bigger the world gets.** Starfall Bay ends on four kinds. Night Garden has a
hundred and four identical wheelbarrows and not one unique thing in its whole
endgame. That is exactly the feeling he described, and it is measurable.

## Why it happened, which matters for the fix

The size ladder means late props must be enormous, and enormous props are the
expensive ones to author. Every big thing in this game is built from **five to
seven primitives**: `riad` is 7 parts, `boathouse` is 6. So the worlds do the
only affordable thing and repeat a handful of big kinds forty times each.

The scenes layer (118 of them) arranges EXISTING props into arrangements. It
adds composition, not new silhouettes. **There has never been a class of large,
one of a kind prop in this game.** That is the actual hole.

## The fix: a landmark tier

A landmark is a prop that appears **once or twice in a whole world**, is sized
for the closing ladder, and is built from **twenty five to forty five
primitives** rather than six. It is the thing you steer toward for a minute and
then eat, and it should be the moment of the run.

**A composer, not forty hand written props.** Hand authoring ten structures at
thirty parts each is three hundred lines of coordinates nobody will ever safely
edit. Instead there are motif helpers, in the same spirit as the existing
`_row`, `_ring` and `_arc` scene helpers:

    _lmTower   tapering stack with a cap
    _lmArcade  a colonnade of pillars with arches over them
    _lmRoof    pitched, hipped or domed
    _lmWindows a grid of lit panes across a face
    _lmSteps   a flight up to a plinth
    _lmSpire   a finial that gives the silhouette its point

Each landmark is then a dozen readable lines that yield thirty odd parts, and a
new one is cheap enough that adding six more later is an afternoon.

## The laws it has to obey, all learned the hard way already

- **Ladder cap**: size must stay within `goalD * 2.9` or it is scenery, not food.
- **volF economy**: fixed props at full volume detonated the ladder once already
  (bot three starred in 60 seconds). Landmarks take a volF like the buildings.
- **Separation law**: `1.75*max(ws) + 0.45*sum` from any other structure, or
  independent structures form a sealed compound.
- **Fence margins**: a giant finale prop needs `910 + size` of radial window on
  each side. Compute the window before choosing an origin.
- **Court guard**: nothing may seal a court. `smoke.js` flood fills it.

## On Blender and Meshy, honestly

Blender 4.0.2 is installed here and runs headless with Python, so it is a real
option. Meshy is an external service and is not connected.

**Neither is the right first move, and here is why.** This engine merges
primitive parts into one geometry per kind and has a perf scaler tuned for five
hundred to eleven hundred instances a world. A GLB pipeline means a loader, an
async gate before world build, VRAM per model, and a fallback path when it
fails, and it would change the art direction of a game whose look is currently
and deliberately procedural. All of that to fix a problem that is not about
fidelity: **a hundred and four wheelbarrows is not a texture problem.**

The landmark tier fixes it with the pipeline that already exists, ships today,
and costs nothing on a phone because there are one or two of each.

**Where Blender genuinely earns its place is the second pass**, and the trigger
is specific: once the landmarks exist and Stephen says a particular one deserves
to look photographic rather than built from blocks. Then it is worth exporting a
handful of GLBs for the marquee few, because at one instance each the cost is
affordable and the payoff is visible. Doing it first would be building a pipeline
to answer a question nobody has asked yet.
