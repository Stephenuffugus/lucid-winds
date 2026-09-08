# GERPLUNK, the art it reads and the art it does without

Gerplunk loads **no image at run time**. Verified by grep on the shipped tree,
2026-09-07: the only `.png` in `index.html` is the icon link on lines 4 and 5,
the only others are in `manifest.webmanifest` and the `sw.js` shell list, and
there is no `new Image`, no `drawImage` and no `createPattern` anywhere in the
3,144 lines. The lake, the sky, the water, the land, the eight stones, the hand,
the rings, the seam, the spin ring and the 1080x1350 card are all drawn by code
at the moment they are shown.

So nothing below is needed to play it, and nothing below is wired. Each sheet is
an upgrade with a named wiring point, in the order of how much it would change
what a player actually sees.

The three sheets exist as paste ready prompts in
`plans/gerplunk/ART-PACK-GERPLUNK.md`. That pack asks for the files to land in
`satellites/gerplunk/art-drop/`, which does not exist yet, and never over a raw
file.

| Sheet | Delivered at | In the game as | Read by today |
|---|---|---|---|
| `treeline.png` | 21:9, black on white | `art/treeline.png` 1600x400 with alpha | nothing, wiring point `index.html:2305` |
| `stones.png` | 1:1, eight stones on white | `art/stone-<id>.png` 256x256 with alpha, cut by Fable | nothing, wiring points `index.html:80` and `index.html:2477` |
| `icon-mark.png` | 1:1 | `icon-512.png`, `icon-192.png`, `icon-maskable-512.png` | `tools/icons.mjs` |

---

## Sheet 1, the treeline. The one that changes the most.

**Path the code would read:** not wired. The wiring point is `drawTrees` at
`index.html:2305`, which draws three things in one pass: the hazy far bank at
`rgba(70,52,66,0.75)`, the near trees at `#141618`, and the same skyline again
upside down in the water at `0.38` alpha. All three take their shape from
`treeH` at `index.html:2197`, a sum of four sines with seeded phases.

**Delivered:** 1600x400 PNG, landscape, transparent everywhere but the trees.
Pure black on pure white out of the generator, and the white is keyed away when
it is cut.

**What it must still read as at its smallest:** the near band stands 16 to 41
CSS px tall across a frame 320 to 412 CSS px wide. On the smallest phone the
layout gate runs, a single tree is three to eight pixels wide and about twenty
tall. Nothing inside a tree survives that. What has to survive is the skyline:
the rhythm of clumps and gaps, and one taller pine that a player can steer by.

**What it replaces:** the three fills in `drawTrees`, `index.html:2305` to
`index.html:2335`.

**⛔ The width is the whole specification, and 1600 is about twelve pixels
short.** The band scrolls with the turn at `TREE_PX_PER_DEG` 8
(`index.html:1532`) across `YAW_MAX_DEG` 25 either way (`index.html:268`), which
is 200 CSS px of travel in each direction, so the strip has to carry the frame's
own 412 plus 400, that is 812 CSS px, and at a device pixel ratio of 2 that is
1,624 device px. A 1600 wide sheet covers 800. And `P4 step 2` in
`plans/gerplunk/HANDOFF-GERPLUNK.md` proposes widening `YAW_MAX_DEG` from 25 to
60 once Stephen answers call 22, which would need 1,372 CSS px, that is 2,744
device px, and it says in as many words that the far shore must not run out. The
code has no such limit, because a sum of sines is infinite. **So the sheet has
to tile left to right, or it is a strip with an end in it.** The height is the
opposite problem: 400 device px where the code uses at most 82.

**Two behaviours a bitmap does not get for free, and both are load bearing:**
- the **gap** a few degrees left of centre, `index.html:2318` to
  `index.html:2320`, which is the landmark a fresh save is pointed at
  (`YAW_START_DEG` was minus 9 until 2026-09-08 and is 0 now, D46, so the gap is
  sixty pixels right of centre at the fresh stance) so the turn has something to
  be measured against;
- **`bayOpen`** at `index.html:2225`, which thins the near trees right of the
  bay's world edge over 90 px, so turning right opens the far shore instead of
  cutting it off at a line. That is the bay mouth, one of the three faces of the
  lake, and it is the drawing half of `faceOf` in the model.

**A second use for the same silhouette:** the point's own trees, `drawPointTrees`
at `index.html:2276`, and the two ridges on the share card, `ridge` at
`index.html:1780`, called at `1788` and `1789` on a 1080 wide canvas. Whatever
the far bank becomes, those two should be the same country.

**Why this sheet is ranked first, from opening the shots rather than from
reasoning:** in `docs/shots/p1-shore.png` and `docs/shots/p2-lee.png` the far
bank reads as a **mountain range**, not a treeline. `treeH` peaks are sharp and
symmetrical, there is no trunk, no crown, no clump, and the sharpest sine is the
absolute value term that makes a spike. It is a good dusk silhouette and it is
the wrong silhouette. A painted treeline is the single change that would move
this game's look the furthest, and it is the one sheet Stephen could replace with
his own photograph of a real shore, because the code only needs the outline.

---

## Sheet 2, the eight stones.

**Paths the code would read:** not wired, and there are two wiring points
because a stone is drawn twice at two very different sizes.

1. **On the bank**, as a CSS radial gradient per id, `index.html:80` to
   `index.html:88`, inside a 64x64 button whose rock is 54x44 CSS px
   (`index.html:69`), with per stone overrides down to 58x30 for the Perfect
   Skimmer (`index.html:84`) and 50x50 for the Granite Chunk (`index.html:82`).
2. **In the palm**, from `STONE_LOOK` at `index.html:2477`, eight three stop
   palettes plus a width and a height factor, painted by `drawPalm` at
   `index.html:2487` at a radius of 26 to 38 CSS px, so about 42 across at the
   widest.

**Delivered:** eight files, `art/stone-<id>.png`, 256x256 PNG with alpha, square,
cut from one sheet. The ids are load bearing and must match the model exactly:
`sandstone`, `shale`, `granite`, `skimmer`, `heavyflat`, `seaglass`, `fossil`,
`quartz` (`index.html:358` to `index.html:377`). The same eight strings key the
CSS, `STONE_LOOK`, the save's per stone records and the daily link parser, so a
renamed file is a broken game and not a broken picture.

**What it must still read as at its smallest:** 54x44 CSS px on the bank, three
of them in a row with a name under each. At that size a stone is a silhouette and
one colour. Flat and wide has to read as the skimmer, thick and lumpy as the
chunk, because the shape is the only thing telling a player what the physics will
do before they throw it. The code already carries that distinction in the height
and the border radius per id.

**What it replaces:** `index.html:80` to `index.html:88`, and
`index.html:2477` to `index.html:2486`.

**What must stay code even if the eight arrive:**
- the picked state, `index.html:76` to `index.html:78`, which lifts the rock 8 px
  and rings it gold;
- the sun's rim along the top left of the held stone, `index.html:2521`, because
  the light on it has to agree with a sky that turns;
- **the hand**, `index.html:2500` to `index.html:2515`. ⛔ Its first draft drew two
  round fingertips on the face of the stone and read as a pair of eyes on a tan
  blob (D43). A hand pinned to one stone's outline breaks the moment the stone
  changes, and the stone changes every day.
- **the stone in flight**, `drawStone` at `index.html:2458`. It is an ellipse of
  five pixels and up with one highlight, moving fast, over water. Art there is
  spent on something nobody can see.

---

## Sheet 3, the icon mark. Only if it beats the drawn one.

**Path the code reads:** `tools/icons.mjs`, whose motif is an inline SVG at
`tools/icons.mjs:30` to `tools/icons.mjs:57`. `node tools/icons.mjs` writes
`icon-192.png`, `icon-512.png` and `icon-maskable-512.png`, all opaque, all
square, on `#1B1A24`.

**What it must still read as at its smallest:** 48 px in a browser tab and about
that on a launcher shelf.

**What is there now, opened rather than assumed:** a dusk sky, a black skyline, a
band of water, three cream rings opening toward the viewer, a small dark stone
with one warm highlight, and eight gold dashes for the sun on the water. The
rings carry it at 48 px. The stone does not, it is a speck. And the skyline has
the same fault as the lake's: it reads as mountains.

**⛔ Two maskable rules, already paid for on another game and written into the
tool's own header at `tools/icons.mjs:10`:** Android crops a maskable icon to an
arbitrary shape and only the central 80 percent is guaranteed, so that variant
draws the same mark at 0.8; and the corner radius is in viewBox units, so
anything over 50 collapses the tile to a circle whose transparent corners
composite to black on an iOS home screen.

**The arcade tile is not this file and is never painted.** `docs/thumb.png`, 512
square, 29,959 bytes against the 150 KB the shelf needs when it loads a hundred
at once, is shot from the running game by `tools/thumb.mjs`: a real tap to the
lake, a real tap on the skimmer, a real flick, the clock held at 0.46 of the
flight, the HUD hidden, and the tool refuses its own picture if the water carries
no variance. Fable copies it to `portal-assets/thumbs/gerplunk.png`.

---

## What is drawn in code and should stay drawn

- **The sky and the sun**, `index.html:2204`. The sun moves with the turn, so it
  cannot be a sprite at a fixed place.
- **The water**, `index.html:2336`. Rows fixed in the world sliding under a
  camera, the shimmer keyed to the day's water state through `faceOf`, and the
  sun road a gaussian around the sun's own reflection that widens toward the
  shore. D33 is the record of it taking three rounds of looking to stop reading
  as stripes.
- **The seam**, `index.html:2402`. It is the model's own trace of a nominal good
  throw down the line you are aiming, bent by the day's crosswind. It cannot lie
  about the wind because it is the wind, and it changes shape every half degree.
- **The point and its spit**, `landGeom` and `drawLand` in `index.html` (D46,
  2026-09-08). A low wooded point of the player's own shore that comes in from
  the lower left when the lake is turned into the lee, a gravel bar off its root
  out to a sand tip at sixteen metres, boulders and scrub on the bar. It sits in
  world space, slides with the treeline, and its tip crosses the throw line
  exactly where the model changes face, so it cannot be placed by hand. At the
  fresh stance only the bar's tip shows at the left edge.
- **The rings**, `index.html:2440`, one per skip the model produced, at that
  skip's own position.
- **The spin ring**, `drawSpinRing` in `index.html`. It is a gauge, not an ornament:
  the sweep is the bank, with no floor added to make a little look like something.
  It is 70 px empty to 110 px full, AROUND the thumb and outside it (D45); a
  thumb sized disc is composited onto `docs/shots/p5-windup-thumb.png` before
  anyone judges it, because the Sep 07 shot with no thumb in it hid the fault.
- **The share card**, `index.html:1762`, 1080x1350, whose arc is the recorded
  positions of the skips rather than a drawing of a throw.
- **The pebble bank** and the tally marks on the post, CSS at `index.html:59` and
  `index.html:30`.

## What a painted sheet must not break

Four gates read the picture and not a variable, so art lands against them:

- `test/layout.mjs` holds the bottom left 120x120 of the lake for the fleet's
  music chip, and nothing of Gerplunk's may sit in it but water.
- `test/layout.mjs` paints one instant with and without the land and reads what
  moved: turned all the way into the lee no strip of land over water in the bar's
  rows may span more than 55 percent of the width (a bridge), the land's outline
  must change direction at least six times per hundred pixels (a ruled edge
  measures under one, the point over eleven), and at every quarter degree of the
  stance the drawn bar covers the throw line exactly when the model says lee.
  A7's older law, the skyline turning at least six times, stays and reads 23 to 29.
- `test/layout.mjs` reads the longest unbroken run of stone coloured pixels down
  the middle of the palm, 24 px or more with a stone in hand, under 10 while the
  stone is in the air.
- `test/flick.mjs` paints one instant with and without the spin ring and walks
  the ring's own circle degree by degree, so the ring is proved to have been
  painted where the game says it is, more than half of it outside a 45 px thumb
  pad, with the fill running the way the thumb wound.

And `tools/lint.mjs` holds two laws that touch art: no `shadowBlur` at any size,
and no canvas font under 11.2 px, which is 0.7 rem at a 16 px root.

## Three things I would name before Stephen does

Opened at 750x1334 and 824x1830, 2026-09-07.

1. **The far shore is a mountain range.** Sheet 1 above. It is the first thing
   the eye lands on and the least like the thing it is supposed to be.
2. ~~**The point's trees do not read.**~~ Closed 2026-09-08 by D46: the slab was
   the geometry (a spit hung off the far shore is a strip across the water), and
   the point is the player's own shore now, shot at five stances in
   `docs/shots/p6-spit-*`. What is still open on it: the boulders are code lumps
   and the scrub is a sawtooth; a painted bar would want the same silhouette laws.
3. **The held stone reads as a bowl.** In `p2-lee.png` the Sandstone in the palm
   is a warm ellipse sitting on a dark rounded mass, and at a glance the pair
   reads as a pot rather than as a stone in a hand. The hand is one shape rising
   from off screen, which was the right call over the fingertips it replaced, but
   the stone sits too high and too centred on it.
