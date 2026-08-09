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

---

# Wave three: the debt is paid, and looking cost the tier eight defects (2026-08-09)

Every structure listed as owed below has now been shot and opened. The short
version: **the probe had been photographing dirt**, so the four "green" runs
behind wave two were worth nothing, and once it could actually see, six of the
eleven new structures had something wrong with them.

## ⛔⛔ The probe could not aim, and said nothing

`lmNoria: placed at -17021,6271 size 900cm` / `no page errors` was printed over a
photograph of empty sand with no water wheel anywhere in it. Four faults, each
of which hid the next:

| what | why it never showed up |
|---|---|
| **The camera never turns in TEST mode** | `readInput`'s camera assist sits BELOW the `if(TEST) … return`, so `camYaw` is pinned at 0 and every headless frame looks down +z. The "roll a burst to establish heading" trick aimed nothing for its entire life. Parking on the 45° diagonal then sat the subject outside a 43.2° half-FOV. |
| **In frame ≠ visible** | The first corrected shot framed the wheel perfectly, behind a wall. A projection cannot see occluders. |
| **The world's first ticks move the ball 12.9 m** | Wall-clock waiting does not advance a sim that only moves on `step()`. Shots were composed at one place and taken from another. |
| **The world clamps a ball parked out of bounds** | On the next tick, whatever the dt. Starfall Bay dragged a park 2120cm past the edge back by 1287cm. |

⚖️ **LAW: a probe that cannot fail is not evidence.** The gallery now measures
the subject's real projected box (`DB_DEV.frame`), fires rays at the model's own
vertices to see what is in front of it (`DB_DEV.occl`), walks eight approaches
and keeps the best, and prints `MISSED` / `CROPPED` / `BLOCKED` / `PARKED OUT OF
BOUNDS` when the image on disk is not a picture of the landmark.

⚖️ **Framing distance derives from the MODEL, not from `size`.** The per-kind
`off` overrides are gone. `size` is a footprint: it is why a 3400cm Ferris wheel
left the top of frame and a 4600cm bridge was a smudge.

⚖️ **Score an approach by `unblocked × projected area`.** Unblocked alone picked
the view straight down the Water Wheel's axle — 100% clear, and a flat wheel is a
line from there.

## ⛔⛔ Landmarks were being dropped inside the clutter

A landmark was just another `n:1` scatter entry, and scatter **clumps 62% of
props onto cluster anchors** — so the tier whose whole purpose is "the thing you
steer toward for a minute" was being deliberately dropped in crate yards.
Measured across all seven worlds:

| world | what was standing in the landmark |
|---|---|
| w3 | a **topiary ball 70cm off the Armillary Sphere's axis** — the photograph was a lumpy hedge on a plinth |
| w5 | **fifteen beach huts** inside the Helter Skelter; ten seawalls and crate stacks through the Moored Balloon |
| w4 | **four brick walls** across the Great Water Wheel |
| w7 | 17-20 props per landmark; a cottage through the Cathedral |
| zen | **the Pagoda and the Stone Circle through each other** |

Each landmark now reserves a ring of its own footprint, steps out of composed
sets, and clears the gate fence bands (the "fence margins" law this doc wrote
down and placement never got). Set members are exempt so no court is sealed.

⚖️ **NUDGE, NEVER RE-ROLL.** Pushing a prop out along the radius consumes no
random numbers, so the seeded stream stays bit-identical. Proof: w5's ceiling is
**6090.5 (3.81x) before and after, to the decimal**. A re-roll would have
rewritten every world and made every prior measurement worthless.

## What opening the images found in the models

1. **The Helter Skelter had no slide.** 18 segments spaced 573 apart along the
   arc and 320 wide: 44% air, photographing as shelf brackets bolted to a tower.
   Segments now span their own gap, and there are 40 — a straight plank across
   47° of a circle is a notch, not a ribbon.
2. **The Moored Balloon was not moored.** 44cm burner poles and 34cm cables on a
   2635cm model — 1.3% of its height — so it read as a striped ball hanging in
   mid-air with nothing under it and nothing holding it. ⚖️ **LAW: detail thinner
   than about 1/40 of a landmark does not exist at the distance you meet one.**
   Third time this has been learned (the Fondant Tower's toothpick columns, the
   Cake Stand's stubs, now this) — it is a law, not a note.
3. **The Armillary Sphere was built out of `_lmWheel`** — the paddle-wheel motif.
   Eighteen gold paddles on a hub plus two solid gold discs for "bands": a lumpy
   yellow-green hedge at night, no ring findable in it, and the same silhouette
   the Bay Wheel and the Water Wheel already own. Rebuilt from tori. ⚖️ **A solid
   disc is not a ring, and a wheel is not a sphere of hoops.**
4. **The Green Bowl's gold "rim" was a solid disc 41 metres across, laid over the
   top.** `cyl` is not a ring. From anywhere above ball height — which on a globe
   is most of the time — the stadium was a flat yellow ellipse with a red skirt:
   no pitch, no stands, no bowl, nothing green. The comment directly above it
   claimed "the pitch stays green because it is small and mostly hidden inside";
   it was not hidden, it was roofed over. Now a torus, and it reads as a bowl.
5. **The Great Water Wheel's aqueduct was two pale sand slabs in a pale sand
   world** — the Observatory mistake for the third time — and they walled the
   wheel off from behind entirely. Rebuilt as a channel on arches in terracotta.
6. **The Broken Keel was a picket fence.** Nine identical ribs on a smooth arch.
   They now snap unevenly and some are gone, deterministically (never rng — a
   world must build identically from the same seed).
7. **The Jack-in-the-Box's spring was a snowman.** Six spheres of radius 15 on a
   circle of radius 9 — a circle narrower than the beads on it — in the same
   cream as the jack's face. Now a steel `_lmHelix`, and it has a crank, which is
   the one part of a jack-in-the-box everybody can name.
8. **⛔ THE ENDGAME PLANET WAS RINGED WITH OBSIDIAN SPIKES.** Not a landmark
   defect at all, found while looking at them: the globe gate branch hard-codes
   the NIGHT post colour, and the only globe world is w7 The Whole World, a
   bright day planet with a blue sky. On a sphere every post stands on its own
   normal, so a gate ring radiates like a crown of thorns — in night purple on
   sunlit green they read as alien monoliths, and they are the biggest darkest
   thing in every globe frame. The planar branch six lines below gets this right
   (`W.night?…:…`). Now warm wood.

## Still open, deliberately

- **The globe gates have no rails.** The planar branch adds two torus rails so a
  gate reads as a fence; the globe branch is posts only, so it is a ring of
  poles. Baking a rail into the post geometry is not safe: `_gsMat`'s yaw basis
  is built from the bearing to the BALL, so a baked rail would swing as the
  player moves. Wants a real fix, not a guess. **Stephen's call.**
- **The Topiary Stag still does not read as a stag.** Opened at gameplay scale:
  a dark rounded slab on four identical evenly-spaced vertical legs (a table
  stance, not an animal one), a straight diagonal neck, a small featureless head,
  and the gold rack reading as though it floats free of it. The blossom pass did
  not deliver its own stated intent — the comment says the mass is "smothered in
  bloom until the SHAPE is pale", but it is 16 spheres of r12-19 scattered over a
  body of r56-66, which reads as dots on a dark lump, not as pale shape. This is
  the third pass on this one prop and two of them missed, so I am not taking a
  fourth swing blind. **Stephen's call** on whether it wants smothering properly,
  restaging, or replacing.
- **The Long Span crosses nothing** — a suspension bridge over grass fields.
- **Wide-and-low landmarks stay weak on the globe.** The Gilded Palace fills only
  22% of frame from as close as the ball can stand without touching it, because
  its 3900cm `size` is 1932cm of actual height. Height buys presence on a sphere;
  span does not.
- **w5's clock** (see above) is still 195s and now has ~91s of margin.

## ⚖️ w4's A/B, which this doc said was owed — and it is the biggest one yet

Same seed, same command (`balance.js 1 12345 4 near`), two code states: with and
without the Great Water Wheel and the Silk Pavilion.

| w4 Bazaar Lane, near-bot, seed 12345 | 4 landmarks | 6 landmarks | change |
|---|---|---|---|
| t100 | 129.0s | **110.2s** | −18.8s |
| t140 | 146.8s | **113.8s** | −33.0s |
| **t190** | **184.8s** | **120.9s** | **−63.9s** |
| ceiling | 2805.9 (8.25x) | 2804.3 (8.25x) | −0.06% |
| absorbs | 655 | 1623 | **+148%** |
| s3ok / leftovers | true / 0 | true / 0 | — |

**Two props moved this world's time-to-190% by 64 seconds — 30% of its 210s
clock — and it is the difference between a near bot finishing on fumes and
finishing comfortably.** Without them t190 is 184.8s against 210s: 25 seconds of
margin. With them, 89 seconds. The prediction in the w5 note was right; two
structures at 900 and 820cm in a 340cm-goal world are proportionally a bigger
injection than three at 2600-3200cm in a 1600cm one.

The ceiling is flat to 0.06%, so the ladder is untouched — as with w5, what
changes is the MIDDLE game. A 900cm object is worth more growth than dozens of
jugs, so every threshold arrives sooner and the spare clock goes on eating,
which is where +148% absorbs comes from.

⚖️ So the w5 rule generalises and is now measured twice: **budget landmarks as
food, not as scenery, and check with a same-seed A/B — never a single after
reading.** Two or three of them is a difficulty change in any world.

## Gates after all of it
`SMOKE_PASS` — every court still flood-fills reachable.
`BALANCE_PASS` seed 12345 near-bot, all six worlds `s3ok`, zero leftovers:

| world | goal | clock | t190 | ceiling |
|---|---|---|---|---|
| w1 | 24 | 165 | 53.5 | 325.4 (13.56x) |
| w2 | 70 | 200 | 105.7 | 677.5 (9.68x) |
| w3 | 170 | 205 | 76.5 | 1607.0 (9.45x) |
| w4 | 340 | 210 | 108.0 | 2804.3 (8.25x) |
| w5 | 1600 | 195 | 104.0 | 6090.5 (3.81x) |
| w7 | 2200 | 300 | 113.4 | 12677.3 (5.76x) |

---

# ⛔ VERIFICATION OWED (2026-08-08) — PAID 2026-08-09, kept for the record

Eleven structures were added or rebuilt today. The economy is measured and the
code is checked, but **seven of them have never been looked at**, and on this
project that means they are not finished. Do not let a green suite stand in for it:
every real defect found today was found by opening an image, and none by a gate.

## Confirmed placed (world builds, landmark present)
| level | landmarks | new ones confirmed |
|---|---|---|
| w1 Crumb Country | 3 | Longcase Clock |
| w2 Toybox Peaks | 5 | Jack-in-the-Box |
| w3 Night Garden | 6 | Armillary Sphere, Moon Bridge |
| w5 Starfall Bay | 8 | Helter Skelter, Broken Keel, Moored Balloon |
| w7 Whole World | 6 | (Long Span + Green Bowl rebuilt) |
| zen Dream Meadow | 8 | — |
| **w4 Bazaar Lane** | **unconfirmed** | **Great Water Wheel, Silk Pavilion** |

## Looked at, and passed
Gramophone · Longcase Clock (top clipped in frame — has an `off` override now) ·
Leaning Library (leans correctly after the rotY fix) · Bay Wheel · Grand Hotel.

## NEVER LOOKED AT — the actual debt ✅ PAID 2026-08-09
Jack-in-the-Box (rebuilt coil, unshot) · Topiary Stag (rebuilt in white blossom,
unshot) · Armillary Sphere · Moon Bridge · Great Water Wheel · Silk Pavilion ·
Helter Skelter · Broken Keel · Moored Balloon. Also the Green Bowl and Long Span
were only ever shot with the broken framing that grew the ball to 80-95% of the
subject, so neither has actually been seen either.

**All eleven are now shot and opened — see "Wave three" at the top of this file.**
w4 Bazaar Lane is confirmed placed (all four landmarks present). Six of them had
something wrong; the Armillary, the Green Bowl, the Helter Skelter, the Moored
Balloon, the Water Wheel's aqueduct, the Broken Keel and the Jack's spring were
rebuilt and re-opened. The Moon Bridge, the Silk Pavilion, the Grand Hotel, the
Ferris Wheel and the Long Span passed. The Topiary Stag did not, and is listed
under "still open".

## Why it stopped, and what to run
This codespace ran out of memory: 128MB free of 7.9GB, with the VS Code server
holding about 6GB across its node processes. The shot probe cannot build a world
without the renderer being killed, and `balance.js` over all seven worlds dies with
`TargetCloseError: Target closed`. Nothing to reap — those are the editor's own
processes, not orphaned browsers. **Reload the codespace window or restart it to
reclaim a couple of gigabytes, then:**

    cd satellites/dewball
    NODE_PATH=/workspaces/lucid-winds/node_modules node landmark_shots.js /tmp/lm 4
    NODE_PATH=/workspaces/lucid-winds/node_modules node landmark_shots.js /tmp/lm 5
    NODE_PATH=/workspaces/lucid-winds/node_modules node landmark_shots.js /tmp/lm 3
    NODE_PATH=/workspaces/lucid-winds/node_modules node landmark_shots.js /tmp/lm 6
    NODE_PATH=/workspaces/lucid-winds/node_modules node variety_audit.js
    NODE_PATH=/workspaces/lucid-winds/node_modules node balance.js 1 12345 near

⭐ The probe takes a level number as its second argument now, precisely so one
world can be iterated without a seven-world run that this box cannot survive.

⚖️ And w4 needs its own A/B before it is trusted: two structures at 900 and 820cm
in a world whose goal is 340cm is proportionally a bigger food injection than the
three that moved w5 by 58 seconds.
