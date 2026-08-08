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

---

# Wave two, looked at (2026-08-08)

Both gates are green: `SMOKE_PASS` (ladder intact, every court flood-fills
reachable) and `BALANCE_PASS` near-bot seed 12345 — w5 `t190` 173.3s against a
195s clock, which is *more* margin than the 16s recorded at v4.5, and w7 79.2s
against 300s. All 30 landmark sizes clear the `goalD * 2.9` cap. The economy
survived 35 new fixed props.

**Then I opened the 36 images, and found nine things no gate had said.** Listed
worst first. This is the third time on this project that looking has beaten a
green suite, so it goes in the doc rather than in a commit message.

## 1. ⛔⛔ Two of w1's three landmarks duplicate a silhouette w1 already scatters

| landmark | size | the prop it duplicates | that prop's size | how many |
|---|---|---|---|---|
| `lmCakeStand` The Fondant Tower | 52cm | `cakestand` Cake Stand | **62cm** | 4 |
| `lmTeapotHill` The Great Teapot | 58cm | `teapot` Tea Pot | 22cm | **77** |

The Fondant Tower is **smaller than the ordinary prop it echoes**. The Great
Teapot is the seventy-eighth teapot in Crumb Country, 2.6x scaled. This is
precisely the complaint the tier was built to answer — a bigger teapot among 77
teapots is still a redundant same thing. ⚖️ **LAW: a landmark's silhouette must
not exist anywhere in its own world's scatter.** Check the scatter list before
choosing a shape, not after.

## 2. ⛔ `lmStadium` is pale cream on its largest faces

`_lmRingWall(26, 1700, 520, 180, 0xe0d8c4, ...)` — 26 segments 520 tall is the
biggest surface in the model, and `0xe0d8c4` is pale stone. The saturated orange
sits only on the second ring and the trim. This is the Observatory mistake from
wave one, repeated in the same commit that wrote the law against it (see the
wave-two header comment). Pale reads as one more grey slab in w7's skyline.

## 3. ⛔ Globe curvature splays ring motifs into debris

On w7 the stadium does not read as a bowl. Each `_lmRingWall` segment is seated
on its own surface normal, so a flat ring of radius 1700-1980 on a sphere becomes
a splayed crown of slabs leaning every direction. ⚖️ **Ring and wide-flat-footprint
motifs (`_lmRingWall`, `_lmWheel` laid flat, big `_lmSteps`) are for planar worlds.**
The globe needs motifs that stack along one normal.

## 4. ⛔ Wide-and-low landmarks are invisible on the globe

`lmSuspBridge` is a 4600cm deck about 1900cm tall. From where the player stands
on w7 it is over the horizon and reads as a small red smudge. **You cannot steer
for a minute toward something the curvature hides.** The premise in the design
section above — "the thing you steer toward for a minute" — silently does not
hold on a sphere. ⚖️ Globe landmarks buy **height**, not span.

## 5. `lmSuspBridge` and `lmStadium` sit in `zone:"r:z4"`

The v4.5 finding says globe z4 is too thin for sprawling finales (band minus
fence margins goes negative at 2m prop sizes) and finales belong in z3. These are
5200cm and 4600cm props in z4.

## 6. `lmBookTower`'s lean alternates instead of accumulating

Rotations run +0.05, −0.12, +0.19, −0.05, +0.26, −0.18, +0.33, −0.28, +0.41. That
is a wobble, not a lean, so "The Leaning Library" stands up straight and jitters.
Its finial is also detached: the pole starts at y=57 while the top book ends near
y=54, and it is offset x=7 on a book 16 wide, so it reads as a floating dot.

## 7. `lmTeapotHill`'s equator band reads as a z-fighting seam

`cyl [23,23,3]` at y=26 through a `sph [22,...]` at y=24 looks like the sphere has
been sliced, not banded. Spout and handle also vanish into the body at approach
angles — the two features that make a teapot legible as a teapot.

## 8. `lmCakeStand`'s inter-tier columns read as broken toothpicks

`_lmCols(8,13,4,1.1,...)` at y0=12 and 22: 4 tall, radius 1.1, tucked under plate
overhangs of radius 16-21. They are invisible as columns and present as chipped
stubs — the exact wasted close-up detail the wave-two law warns about.

## 9. The shot probe cannot frame a tall landmark

`setD(max(4, size*0.42))` puts the camera 1428cm from a 3400cm Ferris wheel, so
the wheel leaves frame at the top; the Grand Hotel came back clipped at the frame
edge. Framing distance has to derive from the model's **height**, not its `size`.

---

# w5 Starfall Bay: three more structures, and what they cost (2026-08-08)

`variety_audit.js` put w5 at **19 distinct late kinds** against 42 in w1 and 44 in
w7 — the thinnest endgame in the game, closing on seawall x220, rowboat x93,
beachhut x62, boardwalkstand x57, sailboat x39. Added The Helter Skelter, The
Broken Keel and The Moored Balloon, taking it from 5 landmarks to 8.

## ⚖️ A LANDMARK IS WORTH A LOT OF FOOD, and here is the measurement

A/B under identical RNG (`balance.js 1 12345 5 near` on both commits, since
`onlyWorldN` changes the seeded stream and its numbers are **not** comparable to a
full-suite run):

| w5, near-bot, seed 12345 | 5 landmarks | 8 landmarks | change |
|---|---|---|---|
| t100 | 123.9s | 85.0s | −38.9s |
| t140 | 168.6s | 106.8s | −61.8s |
| **t190** | **171.4s** | **113.4s** | **−58.0s** |
| ceiling | 5917.9 (3.70x) | 6090.5 (3.81x) | +2.9% |
| absorbs | 1556 | 2483 | +59.6% |
| s3ok / leftovers | true / 0 | true / 0 | — |

**Three props moved the tightest world's time-to-190% by a third of the clock.**
The ladder is intact — the ceiling barely moved, and the v4.0 detonation was
ceilings at 13x goal — because three objects are small against a whole world's
food. What they change is the MIDDLE game: at 2600-3200cm each they are worth more
growth than dozens of beachhuts, so the ball reaches every threshold sooner and
then has 82 spare seconds to keep eating, which is where the +60% absorbs comes
from.

⚖️ **So: budget landmarks as food, not as scenery.** Three per world is a
difficulty change in the tightest worlds, and the check is a same-RNG A/B, not a
single after-reading.

## ⚖️ OPEN FOR STEPHEN — w5's clock

Left at 195s deliberately. w5 was the world where the near bot (the first-time
human model) only *just* finished, and a player who runs out of clock never sees
the endgame that this whole tier exists to improve — so more room is aligned with
the complaint. But it is now comfortable rather than tight: margin went from ~24s
to ~82s. If you want the old tension back, w5's clock goes 195 -> about 170 and
the near bot still clears it. Your call; I did not want to change a tuned clock
without you.
