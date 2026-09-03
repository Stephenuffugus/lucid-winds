# THE VR SHORTLIST, RANKED

Written 2026-09-03 from `docs/3d-vr-audit.json` (187 rows, `catalog().total` 187) and from
opening every shot in `docs/shots-vr/`. Companion to `docs/3D-VR-AUDIT.md`, which is the
full table, and to `docs/3D-ASSET-CANDIDATES.md`, which answers the other half of the
Director's question.

⛔ **Nothing here has been run on a headset and nothing here has been built.** Every call
should be checked against the Quest 2 before it is believed.

---

## How this is ranked, and the one place I departed from the brief

The brief says rank by lane with TABLETOP and STANDING first, then effort ascending, then
comfort. Applied literally that puts all 79 TABLETOP rows above all 10 STANDING rows, and
because 72 of those TABLETOP rows are `L`, the literal sort buries Ripcord and Aura Off
under seventy classic board games. So I read "TABLETOP and STANDING first" as **both lanes
first, together, above WINDOW and NEVER-IMMERSIVE**, and sorted the two of them by effort
and then comfort. That is the only departure and it is the whole of it.

The effort scale is section 4's, applied strictly: **anything needing a new camera AND a
new input model AND new meshes is L.** Every purely 2D game needs all three, so the entire
board and card shelf is `L` no matter how obvious a chess set in VR sounds. `S` and `M` are
reached only two ways: the game is already three.js with a camera that does not translate,
or its simulation already runs with no screen and a 3D view can ride it. **That is the
whole of the cheap band and it is eleven games long.**

---

## THE FINDING THAT MATTERS MOST

`HANDOFF-3D-VR.md` section 3 says twelve satellites carry a headless `test/` suite "which
means their sim runs with no screen." **That inference does not hold, and I checked all 34
satellites that ship a harness.**

| what the harness really does | count | what it means for a 3D view |
|---|---|---|
| a DOM free logic module, or the game body in a `vm` with **no DOM at all** | **4** | a 3D view can ride it today |
| the game body in a `vm` behind a **stubbed** DOM and canvas | 13 | one refactor away |
| drives **headless Chrome** (puppeteer), or only **compiles** the script | 17 | not a split; the game still needs a screen |

The four that genuinely split are **Ripcord** (`src/sim2.js:8`, a DOM free UMD module),
**Conduit** (`test/harness.js` runs the whole game in `vm.createContext({console, Math,
performance})` and reads `globalThis.CONDUIT`), **Aura Off** (`test/balance-sim.js` imports
the engine and drives real battles through `resolveExchange()`), and **The Attic**
(`attic-engine.js:634`). Burrow Bowl's `check.mjs` compiles the script and then drives
puppeteer; Create A Critter's `check.js` says so itself, "No browser is used here, so this
proves ONLY what the source can prove."

**Where "simple" honestly lives is smaller than the handoff hoped, and it is these four
plus the two games that are already three.js with a camera that does not translate.**

---

## THE TOP 10

### 1. Ripcord — STANDING, SAFE, M
🔒 gated · `SKIN` · shots: `docs/shots-vr/ripcord-4round.png`, `ripcord-2play.png`

**The thirty seconds:** you hold a launcher, wind a circle in the air with your other hand,
and rip the cord; two tops go at each other in a dish on the table and one of them lies over.

**The hands:** a launcher in one hand, a circle drawn in the air with the other, then a grip
and a pull.

**Effort, about 12 days:** 3 for the dish scene at table scale from meshes that already
exist, 3 for the wind grader to read a controller pose instead of a screen path (flatten Z,
reuse `wind.js` unchanged), 2 for the pull gesture as a velocity spike along the cord axis,
2 for the comfort and fallback pass, 2 for the device round.

**Headless path:** yes, the best in the fleet. `sim2.js`, `wind.js` and `rigs.js` are DOM
free modules and `test/` carries a determinism harness, so a determinism gate that the sim
is byte identical with the VR view on and off is a day's work, not a research project.

**Assets it needs** (named the way `satellites/conduit/ART_ASSETS.md` names them, and most
of these already exist):

| family | what | count | status |
|---|---|---|---|
| `ripcord-parts` | blade, assist, ratchet, bit, weight, core | 112 | ✅ built, `assets/3d/<slot>/`, ~2.3 MB the lot |
| `ripcord-hero` | sculpted cores and blades | 44 | ✅ built, `assets/3d/hero/` |
| `ripcord-launcher` | the thing the hand holds | 6 | ✅ built |
| `ripcord-stadium` | dish, rail, posts, floor | 4 | ✅ built |
| `ripcord-table` | the table the dish sits on, the room around it | ~6 | NEW |
| `ripcord-hands` | the held launcher and the winding hand | 2 | NEW |

**What the shot says.** `ripcord-4round.png` is the strongest evidence in the catalog: the
wind is already graded on five axes from a drawn circle (ROUND 99, EVEN 75, STACKED 100,
SPEED 78, WOBBLE 2, grade S, "Try a steadier pull"). Three things wrong with it as a VR
starting point: **(a)** the grade card covers the bottom half of the dish including where
the top lands, and in a headset that panel sits in the volume between your hands and the
board; **(b)** the dish is drawn from almost directly overhead so the rim reads as a flat
ring with no bowl depth, and at table scale the tops will look like they are sliding on a
painted circle; **(c)** the five stat bars are 10 to 11 px and the line that explains the
wind, "3.0 LAPS, RIGHT SPIN, 104 PERCENT POWER", is 9 px grey on grey, which is the
feedback the entire mechanic depends on and the least legible thing in the frame.

**The one question for the Director:** Ripcord already has a "3D battle (beta)" toggle you
have not played (task R1, open since Sep 2). **Do those three rounds first.** If that camera
already feels wrong on a phone, it will feel wrong at table scale, and I would rather change
it before Phase 0 than after.

---

### 2. Aura Off — STANDING, SAFE, M
🔒 gated · `RIDE` · shot: `docs/shots-vr/aura-off-2play.png`

**The thirty seconds:** somebody across the circle throws a move at you, and you answer it
with your own body, and the game scores how much you did **not** overdo it.

**The hands:** you perform the move yourself, hands at chest height see-sawing, a finger
sliding along your jaw, arms crossed and perfectly still, and the size of the gesture is
the score.

**Effort, about 10 days:** 2 for the ring scene and the opponent rig, 3 for mapping the
twelve frozen joints onto controller and head pose, 2 for amplitude from real gesture size,
1 for the crowd, 2 for comfort and the 2D fallback.

**Headless path:** yes. `test/balance-sim.js` imports the engine and drives real battles;
`engine/scoring.js` and `engine/rig.js` touch no DOM.

**Assets:** `auraoff-opponent` (12 joint rig, 3 body types), `auraoff-crowd` (8 silhouettes
at 2 LODs), `auraoff-plaza` (ground, 4 props, a backdrop), `auraoff-fit` (the 9 outfits the
Fit Check screen already lists). Roughly 30 pieces, none of them existing.

**What the shot says.** `aura-off-2play.png` is the Fit Check screen: five outfit cards with
`+8 CROWD`, `+6 PANEL`, `+4 CROWD · +4 PANEL` under each. Three things wrong: **(a)** it is a
menu, and the game's whole case for VR is that it is not a menu, so a VR build has to decide
which of these screens survives as a floating panel and which becomes a thing in the plaza;
**(b)** the modifier text is 10 px monospace in dim violet on violet, the lowest contrast in
any shot I took; **(c)** the crowd is a flat silhouette strip pinned to the bottom edge, and
"you are standing in a crowd of people who came outside" is the emotional payload its own
`docs/AURA-3D-VR.md` names, so that strip is the single biggest piece of new work.

**The one question:** controllers or hands? Its `docs/AURA-3D-VR.md` §5.3 recommends
building the ring first with gesture input layered on top. **I agree**, and I would go
further: ship controllers only for the pilot. Hand tracking is the whole reason this game is
special and it is also the reason it could take three weeks instead of two.

---

### 3. Create A Critter — TABLETOP, SAFE, S
`SKIN` · shots: `create-a-critter-3draw.png`, `-1boot.png`

**The thirty seconds:** you scribble an animal on a slate, it puffs up into a real creature,
walks across the table toward you, and you put your hand out and feed it.

**The hands:** draw on a slate held in front of you, then an open palm the creature walks
into.

**Effort, about 5 days:** 1 for the XR session and the table scene, 1 for the camera at
eye height (the orbit is already correct), 2 for turning twenty odd toolbar buttons into
things a ray can hit, 1 for the feed and cuddle interactions.

**Headless path:** no. `check.js` says so itself: no browser is used, so it proves only what
the source can prove.

**Assets:** none required for the pilot. The creature is a SkinnedMesh built from the
player's drawing; that is the game. `critter-table` (a table, a slate, a bowl) is about 4
new pieces.

**What the shot says, and it is the correction Aug 16 needs.** I drove it to the drawing
screen on purpose because the blind pass landed on an empty nursery. `create-a-critter-3draw.png`
shows the drawing canvas at roughly 185 by 185 px surrounded by **four rows of round tool
buttons**: 7 colours, 6 tools, 6 stamps, a palette, plus a full width action bar. Three
things wrong: **(a)** the canvas is about 8 percent of the screen and the chrome is the
other 92, so at table scale the thing your hands touch is the smallest object in the frame;
**(b)** those buttons measure about 44 rendered px at 375 wide, under the 48 px rule
already, in four tight rows about 8 px apart, and a controller ray at 1.5 m cannot reliably
separate neighbours at that pitch; **(c)** the whole app is a near white cream ground, the
only one in the fleet that is not the midnight palette, and a full field near white in a
headset is a glare source rather than a taste question.

**The one question:** Aug 16 called the drawing step "a slate floating in front of the
player works fine and is the safe version." Having looked at it, the slate is fine and **the
toolbar is the build.** Do you want the pilot to ship a reduced palette (say 4 colours, 3
tools, no stamps) so the first version has 7 controls instead of 21?

---

### 4. Conduit — TABLETOP, SAFE, M
🔒 gated · `PRERENDER` (with a NONE carve out) · shots: `conduit-2play.png`, and the game's own `satellites/conduit/docs/shots/fullrun-2-down.png`

**The thirty seconds:** a lit floorplan sits on the table like an architect's model, and you
push a bead of black fluid along its wiring, waking machines and keeping out of the cones.

**The hands:** you reach into a lit floorplan and drag the bead along the wire, tapping
machines to wake them.

**Effort, about 8 days:** 1 for the ride (the sim already runs with no DOM), 2 for the table
scene and the site at real scale, 2 for the four verb buttons as objects rather than a HUD,
1 for the fluid at table scale, 2 for comfort and fallback.

**Headless path:** yes, and it is the cleanest in the fleet. `test/harness.js` runs the whole
game body in `vm.createContext({console, Math, performance})`, with no DOM at all.

**Assets:** twelve of the fourteen sheets are already specified in
`satellites/conduit/ART_ASSETS.md` with in game pixel sizes and cell counts:
`conduit-floors` (16), `conduit-machines` (32), `conduit-sources` (12), `conduit-patrols`
(32), `conduit-fixtures` (16), `conduit-fx` (24), `conduit-hud` (24), `conduit-icons` (32),
plus title, sites, settings and backdrops. **`conduit-creature` and `conduit-wire` are NONE
until you amend the ferro law**, which `ART_ASSETS.md` already writes out in two forms for
your pick.

**What the shot says.** The game's own `fullrun-2-down.png` is the board. Three things wrong:
**(a)** the ferrofluid you control is about 14 px across in an 844 px frame and is the
darkest, lowest contrast object on screen, so the thing you steer is smaller than the labels
on the machines you are robbing; **(b)** machines are identified by three letter monospace
tags ("GEN", "CRT", "SKT") at about 9 px inside 17 px boxes, which is the entire information
layer and it is text, so it is exactly what dies at 1.5 m; **(c)** wall, floor and void are
separated by a few percent of luminance on a near black field, and a headset panel is dimmer
than a phone, so those room edges will simply not be there.

**The one question:** the M1 fun gate on Conduit is still unanswered from Sep 1. **Is it fun
with rectangles?** A VR build cannot rescue a game that is not, and this one costs 8 days.

---

### 5. Moon Claw — STANDING, SAFE, M
🔒 gated · `PRERENDER` · shots: `moon-claw-1boot.png`, `moon-claw-2play.png`

**The thirty seconds:** a claw machine, at full size, in front of you. You glide the claw,
drop it, and it grips exactly as hard as it says it does.

**The hands:** a joystick under one hand, a button under the other, and your face against
the glass.

**Effort, about 9 days:** 2 for the cabinet, 2 for the pile physics at real scale, 2 for the
joystick and button as held objects, 1 for the prize chute, 2 for comfort and fallback.

**Headless path:** partial. `test/check.mjs` pulls pure helpers out under `vm`; `test/play.mjs`
needs a browser.

**Assets:** `moonclaw-cabinet` (case, glass, chute, marquee, coin door, about 8 pieces),
`moonclaw-claw` (arm, gantry, 3 jaw states), `moonclaw-plush` (the pile, at least 12 toys at
2 LODs), `moonclaw-room` (an arcade around it). Around 30 pieces, all new.

**What the shot says.** `moon-claw-1boot.png` shows the cabinet: prize chute, claw on a rail,
a pile of plush. Three things wrong: **(a)** the cabinet is drawn as a flat rectangle seen
dead on with no side walls, no floor and no glass reflection, so there is no box to stand at
yet; **(b)** the music unlock card covers the bottom third including the "Play a cabinet"
button, and in a headset that is a panel floating exactly where your hands are; **(c)** the
"♫ Music" chip overlaps and clips the "M" of the title, which happens on **every game in the
fleet** and is a fleet wide fix, not a Moon Claw one.

**The one question:** this is the most literal cabinet in the catalog and also 30 new meshes.
Is a claw machine a thing you want Sky Wolf Studio to be known for on the store, or is it
the demo that proves the pipeline and never ships?

---

### 6. Skyshot — STANDING, SAFE, M
🔒 gated · `PRERENDER` · shots: `skyshot-1boot.png`, `skyshot-2play.png`

**The thirty seconds:** a slingshot in the night garden. You pull back against the tension,
let go, and watch the seed arc up into a bud that is still moving.

**The hands:** one hand holds the fork, the other pulls the pouch back and releases.

**Effort, about 8 days:** 2 for the garden scene, 2 for the two handed sling (the hardest
part and the whole point), 1 for the arc preview in 3D, 1 for the buds, 2 for comfort.

**Headless path:** partial. `test/check.mjs` under `vm` for helpers, `test/play.mjs` drives a
real page that exposes `SKY.fire`.

**Assets:** `skyshot-sling` (fork, pouch, band at 3 tensions), `skyshot-buds` (6 moonbuds,
open and closed), `skyshot-garden` (ground, brambles, gates, backdrop), `skyshot-seeds` (4).
Around 20 pieces.

**What the shot says.** Three things wrong: **(a)** its own instructions say "Skyshot fires
up the screen, not across it", and a round spent looking at the ceiling is the most
fatiguing head posture in VR, so the scene has to tilt forward and bring the buds to eye
level, which is a design change and not a port; **(b)** the how to play screen is six dense
paragraphs at about 13 px including a keyboard line that means nothing in a headset;
**(c)** the music unlock card covers the Play button on boot and the "♫ Music" chip clips
the heading, again.

**The one question:** does tilting the whole scene forward so the buds sit at eye level
break the game you wanted, or is "straight up" incidental?

---

### 7. Tangent — TABLETOP, SAFE, M
🔒 gated · `RIDE` · shot: `tangent-2play.png`

**The thirty seconds:** a disc spins on the table in front of you, you press parts onto its
rim, and then let go and watch a ball fall through the gravity of the bodies you placed.

**The hands:** fingers on the rim of a spinning deck, parts pressed on, then hands off.

**Effort, about 9 days:** 2 for the table scene, 2 for the deck as a grabbable disc, 2 for
the part palette as objects, 1 for the collapse moment in stereo, 2 for comfort.

**Headless path:** close. `test/harness.js` runs the game body in a `vm` behind a stubbed
DOM and canvas, so the split is one refactor away, and there are 8 harnesses.

**Assets:** `satellites/tangent/ART_ASSETS.md` already names ten families with call sites and
pixel sizes: `01 Droplet` (12 cells), `02 Bodies` (12), `03 Hole` (6), `04 Deck` (6, one at
1024), `05 Parts and gates`, `06 Marks`, `07 Backgrounds`, `08 UI chrome`, `09 Screens`,
`10 Moments`.

**What the shot says.** A dark disc in a starfield with a dashed orbit and a part palette
below. Three things wrong: **(a)** the deck is about 200 px across in the top 45 percent and
the bottom 55 percent is six part buttons, a balance slider and two actions, so again the
menu is bigger than the thing; **(b)** the two labels that teach the only two verbs, "let it
ring" at 11 px and "hold" at 10 px, are the smallest text in the frame and sit on a busy
starfield; **(c)** the "♫ Music" chip is drawn **over** the deck's lower left rim and covers
a mount point, which on a phone is untidy and in a headset is a depth conflict as well.

**The one question:** Tangent's own review (Sep 1) found the "needs the deck" result was
false, a bare deck clears level 4. Is the deck still the game? If it is not, the tabletop
verb goes with it.

---

### 8. LOAF — TABLETOP, CARE, M
🔒 gated · `SKIN` · shot: `loaf-1boot.png`

**The thirty seconds:** your own cat, scanned into a card, walks into a room in front of you,
sits in a box, and lets you scratch behind an ear.

**The hands:** a hand put down at floor level for a cat to walk into, and a scratch behind
an ear.

**Effort, about 10 days:** 2 for the room at real scale, 2 for pinning the camera per moment
instead of lerping (the CARE to SAFE fix), 3 for touch interactions on the cat, 3 for comfort
and fallback.

**Headless path:** no.

**Assets:** the cat is already 3D by direction (`LOAF_PLAN.md`, Blender headless authoring is
already the pipeline). New: `loaf-room` (floor, walls, window, light), `loaf-furnishings`
(the box, a bed, a bowl, a scratcher, roughly 12 from `LOAF_FURNISHINGS.md`).

**What the shot says.** `loaf-1boot.png` is a specimen card, "MUGI, CERTIFIED VOID MERCHANT",
with CHONK, VOID and ZOOMIES meters. Three things wrong: **(a)** the boot is a card and a
scan flow, not the cat, so the first thing a headset shows is a form; **(b)** the card art
is a black silhouette on brown at about 60 px, and the whole product promise is that this is
**your** cat, which a silhouette cannot carry at any distance; **(c)** the CHONK/VOID/ZOOMIES
bars are 8 px tall with 7 px labels.

**The one question:** LOAF's voice is still unheard and the plan says audition it on your
phone first. That is a bigger gate than VR. **Do you want LOAF in this list at all before
Phase 5 is ungated?**

---

### 9. Jumping Jimothy — TABLETOP, SAFE, M
`PRERENDER` · shots: `stream-hop-1boot.png`, `stream-hop-2play.png`

**The thirty seconds:** a strip of Seattle traffic laid out on the table, and you poke a
raccoon forward one square at a time while the road slides toward you.

**The hands:** a finger that pokes a raccoon forward a square at a time, on a road that
slides toward you under a camera that never moves.

**Effort, about 7 days:** 1 for the treadmill reframe, 2 for the table scene, 2 for the
sprite to mesh pass on the hazards, 2 for comfort and fallback.

**Reframe, named:** `G.camY` at `satellites/stream-hop/index.html:1895` scrolls the view up
the rows, which is the disqualifier. Nail the camera and run the rows toward the player
instead. This is the same trick `incoming/VR-CANDIDATES.md` applies to Dewball and it is
cheaper here because the world is one axis, not a sphere. **No rule changes.**

**Headless path:** close, `test/jimothy-check.js` runs behind stubs.

**Assets:** `jimothy-hero` (the raccoon, 6 poses), `jimothy-traffic` (cars, buses, a coffee
can, at least 10), `jimothy-street` (curb, lane, water, floating pad, 8), `jimothy-pickups`
(bottlecap, coffee, umbrella, snacks). Around 30, and the art bible already exists
(`satellites/stream-hop/ART-BIBLE-ANIMATION.md`).

**What the shot says.** The boot is the best piece of art in this whole shortlist: an ink
raccoon against the Seattle skyline. Three things wrong for VR: **(a)** it is a 2D ink
illustration on a paper ground, and the entire visual identity is "a drawing", which
prerendered meshes would destroy rather than improve, so the asset route needs a decision
before a single mesh is made; **(b)** the play shot is a wall of twelve instruction rows at
about 12 px; **(c)** its 29 declared sub 32 px controls are already a `QUEST-COMPAT.md`
caution and they get worse, not better, at 1.5 m.

**The one question:** Jimothy is your Steam title (app 5043360) and your first Play title.
**Is a VR side build a distraction from a store submission that is already in flight?** I
would say yes, and I would park this one until Steam is live.

---

### 10. Budburst — STANDING, SAFE, S
`PRERENDER` · shots: `budburst-1boot.png`, `budburst-2play.png`

**The thirty seconds:** a cluster of buds hangs in front of you and you flick one up into it,
leaning to read the angle off the wall before you let go.

**The hands:** you pull back and flick a bud up at a cluster hanging in front of you.

**Effort, about 4 days:** 1 for the hanging board, 1 for the flick as a controller throw,
1 for the bounce preview, 1 for comfort and the 2D fallback. **The cheapest honest body verb
in the catalog.**

**Headless path:** close, `test/check.mjs` and `test/play.mjs` drive it headless behind stubs.

**Assets:** `budburst-buds` (6 colours, 3 states), `budburst-board` (the frame, the canopy,
the dashed line), `budburst-powers` (the 8 power icons the shot lists). Under 20 pieces.

**What the shot says.** Three things wrong: **(a)** `budburst-2play.png` is a **powers shop**,
eight cards deep with lock icons and prices, which is what the blind tap loop reached before
it reached a board, and a shop is the least VR native screen a game can open with; **(b)**
the power descriptions run at about 11 px and several are truncated mid sentence by their own
cards ("Time Freeze, Halt the canopy for 6..."); **(c)** the boot screen carries six colour
pips at about 26 px, well under the 48 px rule, and they are a mode selector.

**The one question:** Budburst is the cheapest thing here and the least distinctive. **Is a
four day proof of the whole pipeline worth doing first, before the ten day builds?** I think
it is, and it is the only S in the STANDING lane.

---

## The two that just missed, and why they are in the shots anyway

**Burrow Bowl** (STANDING, SAFE, `L`) has the single best VR picture in the catalog:
`burrow-bowl-2play.png` is already a skee ball lane running away from the player in
perspective, with the ring board at the far end, and the words on screen are "FLICK UP THE
LANE". It is `L` only because it has no split to ride and needs a lane, a hood and rings
built from nothing. **If you want the best looking pilot rather than the cheapest, this is
it.** Three things wrong with the shot: the lane is a 2D trapezoid with no real depth, so at
table scale it is a painted board rather than a ramp; "FLICK UP THE LANE" is painted on the
lane surface and would follow its perspective into illegibility; and the ring values (10,
20, 30, 40, 50, 100) are 11 to 13 px, with the two corner hundreds the game brags about
being the smallest targets on screen.

**Dewball** (TABLETOP, CARE, `L`) is here because Aug 16 named it and an unanswered document
wins silently. See below.

---

## AGAINST AUG 16

`incoming/VR-CANDIDATES.md` made four picks. Pick by pick:

### Create A Critter — **AGREE on the camera, and I verified it. DISAGREE on the cost.**
Aug 16: "camera.lookAt(0, 0.72, 0) with an orbit around a fixed origin ... already the ideal
VR camera." **Confirmed at `satellites/create-a-critter/index.html:2154-2155`**, exactly as
described, and it is the only row in the catalog that is comfort safe before anyone writes a
line of XR. It also said "smallest build of the four" and flagged the 2D UI as "real but
bounded." Having opened the drawing screen: **the toolbar is 21 controls at about 44 px in
four rows around a canvas that is 8 percent of the frame.** That is still the smallest build
here, but "bounded" undersells it, and it is the reason my effort is 5 days rather than 2.
My one substantive change is the lane word: this is a **TABLETOP**, not a generic VR title,
and saying so is what makes the staging decisions concrete.

### Super Slice, ship the forest never the falls — **DISAGREE, twice, and this is the biggest one.**
Two things moved since Aug 16.

**First, there is no forest to ship separately.** The four titles Aug 16 listed as separate
games are now **one card with modes**: `mode:'run'` with `climbWall:true` at
`satellites/slice-3d/index.html:1492`, the plain run at `:1523`, and `mode:'ff'` with
`endless` at `:1553`. "Ship the forest, never the falls" is now a mode gate inside one game,
not a choice between cards.

**Second, and this is the part that matters: the forest is not comfort safe either.** Aug 16
checked the falls' camera and judged the forest by its verb. The forest takes the final
`else` at `:2237`, `camT={x:G.x-1.5, y:Math.max(8.5,G.y*0.4+8), z:26}`, targeting the knife's
own x and y, lerped at `:2243` to `:2245`, **with camera shake added at `:2247`**. That is
sustained two axis translation with shake. It is milder than the falls, and it is the same
class of problem. **Super Slice is NEVER-IMMERSIVE in this audit, all modes, HAZARD.** If you
want it, the honest reframe is to nail the camera at the near end of a table and run the
course toward the player, which is a different build and is `L`.

### Dewball as a tabletop diorama — **AGREE with the idea and I can tell you it is half built. DISAGREE with the priority.**
Aug 16 imagined "the player stands over a small planet ... the world can rotate under the
ball rather than the camera flying after it." **World w7 already carries `globe:1`
(`satellites/dewball/index.html:2753`) and the camera already pitches to 0.76 to look DOWN
onto a globe (`:3911`).** The small precious planet exists. What does not exist is the
camera: `:4493` to `:4506` chase the ball with a lerp, and replacing that is the entire job.
So Aug 16's read was right and its optimism was earned. My disagreement is ordering: it is
`L` and `CARE`, and there are six `M` builds above it with fixed cameras already. **Dewball
is the right first Meshy skin (W1 says so, its source is in this repo) and the wrong first
VR pilot.**

### PadLab as an instrument, not a rhythm game — **AGREE with the reasoning, but the row is not in this catalog.**
I judged all 187 carded rows and PadLab is not one of them; it lives at `/padlab` outside the
`FEATURED` and `GAMES` arrays. The nearest carded row is **Music Studio**, which is `UNREAD`:
`games/song.js:31` mounts only an `<iframe src="/studio.html">`, so the play logic is not in
the stated source. Aug 16's argument stands untouched, and "do not build a rhythm game, build
an instrument, Virtuoso not Beat Saber" is the single best strategic sentence in that
document. It is just not a row I can rank.

### And the pick Aug 16 could not have made
**Aura Off did not exist on Aug 16.** It shipped Aug 29. It has the best VR case in the
catalog on the merits: `src/engine/scoring.js:193-208` scores every move against an
`idealAmp` and **falls off on both sides, harder above**, so the 2D hold bar is a
*simulation* of physical restraint that a hand tracker measures natively. Its own
`docs/AURA-3D-VR.md` §5.2 makes this argument and I checked the code behind it. Aug 16's rule
was "two titles, not five," and I still agree. **My two would be Ripcord and Aura Off**, not
Create A Critter and Dewball, and the reason is that both of those have a simulation that
already runs with no screen, which is the property that turned a 570 line file into Ripcord's
3D battle view.

---

## The fleet wide thing that will hurt every one of these

Six of my fourteen play shots landed on a **wall of how to play prose**: Moon Claw, Skyshot,
Ripcord, The Attic, Dewball, Jumping Jimothy, and Checkers. Every one is 10 to 15 px body
text, 6 to 12 paragraphs, shown before the game. On a phone that is a scroll. **At 1.5 m in a
headset that is the single most common reason a good game feels bad**, and it is not a per
title fix, it is a fleet pattern.

The second fleet wide one: the **"♫ Music" chip overlaps and clips the title on Moon Claw,
Skyshot, Create A Critter, The Attic and Dewball**, and on Tangent it is drawn over the play
area and covers a mount point on the deck. Whatever the VR answer is, that chip needs a home
that is not on top of the game.

---

## AGAINST SECTION 9 (Fable's first guesses)

Section 9 says it exists so the audit has something to refute, and that a guess the code
contradicts is wrong. Read only after the pass above was written. Where it lands:

**Confirmed:** Ripcord, Aura Off and Sweet Spot as STANDING; Lucid Winds as `NONE`; Dewball,
Abduct a Chameleon 3D, Create A Critter and Slice 3D as `SKIN`; Jade Garden (mahjong) and Sea
Battle (battleship) as TABLETOP; Kanoodle and PadLab correctly flagged as not carded rows.

**Refuted, with the line:**

| the guess | what the code says |
|---|---|
| Create A Critter is **STANDING** | It is TABLETOP. The camera orbits `lookAt(0,0.72,0)` at `create-a-critter/index.html:2155` and the creature is a small thing on a surface you circle. Standing needs a body verb; drawing on a slate and putting a hand out is a table. |
| Super Slice **forest only** is STANDING | The forest chases too. `slice-3d/index.html:2237` targets the knife's own x and y, lerped `:2243` to `:2245`, shake at `:2247`. NEVER-IMMERSIVE, all modes. |
| Stream Hop is **NEVER-IMMERSIVE** | TABLETOP with a named reframe. `stream-hop/index.html:1895` scrolls `G.camY` up the rows, and a one axis lane is the cheapest treadmill in the catalog: nail the camera, run the rows at the player, no rule changes. |
| **Puppy Dash, Sled Vine, Pitbike Rally and Bubblenaut** are runners or chase cameras | **None of the four moves its view.** Puppy Dash's translates are sprite local (`:267`, `:300`), Sled Vine's likewise (`:324`, `:773`), Pitbike Rally's `view` is a fit scaler set only inside `resize()` (`src-dly17/render.js:15-25`, never per frame), and Bubblenaut's `fit()` is a `scale()` (`:1016`). They are "the obstacles move, the camera does not" designs, which is the comfort profile VR wants. They are WINDOW because the hands do nothing a thumb cannot, not because they are hazards. Skitterlings is the same shape and says so in its own code: `o.x -= G.speed * dt` at `:1790`. |
| Moon Claw, Burrow Bowl and Skyshot are **TABLETOP** | All three are STANDING. A claw machine, a skee ball lane and a slingshot are things you stand at and use your arm on, not boards you reach into. This is the guess I would most want re-checked on the device, because it changes the scene height. |
| Conduit is route **NONE** | `PRERENDER` with a `NONE` carve out. The ferro law covers the creature and the conduit; `satellites/conduit/ART_ASSETS.md` says in its own words that floors, machines, sources, patrols, fixtures, FX, HUD, icons, screens and backdrops are unaffected. Twelve of fourteen sheets can proceed today, and reading "Conduit: NONE" as a blanket would stop work that is already specified. |
| Ripcord's parts are route **NONE** | `SKIN`. "The geometry is the stats" forbids *generating* art that ignores `sim2.js`; it does not forbid meshes, and 112 of them already exist, derived from those stats, sitting unused outside `src/battle3d.js`. `NONE` would be the wrong instruction on the one game whose meshes are already paid for. |
| Abduct a Chameleon is route **SKIN** | The 2D card is `canvas2d`, so `PRERENDER`. Only the **3D** card is three.js, and it is a different file, `abduct-3d.html`, which the triage read as the 2D game until this morning. |
| Ring Stacker (**Sunforge**) and Siege of One are TABLETOP | Both stayed WINDOW. Sunforge and Siege are fixed camera and fit one screen, so they pass the first half of the test and fail the second: the hands tap, they do not reach, place, flick, throw or stack. I hold these two loosely and would change them on one sentence from the Director about what the hands are doing. |

**On the proportions, which section 9 asked about explicitly.** It expected roughly two thirds
WINDOW, a dozen TABLETOP at S or M, five or six STANDING, a dozen NEVER-IMMERSIVE. The result
is **WINDOW 88 (47 percent), TABLETOP 79 (42 percent), STANDING 10, NEVER-IMMERSIVE 10.**

STANDING and NEVER-IMMERSIVE landed almost exactly where it guessed. The two that moved are
WINDOW and TABLETOP, and the reason is one measurement: **almost nothing in this catalog moves
its camera.** 165 of 187 rows are fixed, and the fleet's house pattern is a `540 by 960` stage
with `fit()` doing a `scale()` and every `ctx.translate` being sprite local. So the section 4
test, "a board or arena that fits one screen is the natural TABLETOP shape", passes far more
often than a guess from names would suggest.

**That is a bigger number than it is an opportunity, and the effort column is where the honesty
is:** 72 of the 79 TABLETOP rows are `L`, because a 2D board needs a new camera, a new input
model and new meshes, all three. The cheap band is still eleven games long. The lane count says
what the catalog *is*; the effort count says what is *buyable*.
