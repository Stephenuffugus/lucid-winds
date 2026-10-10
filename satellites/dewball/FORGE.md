# DEWBALL FORGE, THE RUNNING LOG OF THE TOP TIER BUILD

The plan is `plans/dewball/DEWBALL-TOP-TIER-PLAN-OCT09.md`. This file is what actually happened, phase by phase,
with the numbers measured at the time. Newest phase at the bottom. Times are UTC.

---

## Phase 0, read and measure (9 Oct 2026)

**Meshy balance, 15:57 UTC: 4,120 credits** (`GET /openapi/v1/balance`, the key read from the environment, never
printed). No task has been created; `tools/forge/meshy-tasks.json` does not exist yet.

### Baseline: smoke (all worlds), `node smoke.js`

`SMOKE_PASS` in 5.6 s. Ladder ceilings (`absorbAll`, cm), identical to the decimal to LANDMARKS.md and AUDIT-NOTES.md:

| world | ceiling | needs (s3 x 1.15) | walls left | courts |
|---|---|---|---|---|
| w1 | 325 | 311 | 0 | reachable |
| w2 | 677 | 448 | 0 | reachable |
| w3 | 1607 | 1403 | 0 | reachable |
| w4 | 2804 | 2473 | 0 | reachable |
| w5 | 6090 | 5704 | 0 | reachable |
| w7 | 12677 | 12391 | 0 | reachable |
| w6 zen | 1382 | sweeps to zero | 0 | n/a |

### Baseline: the near bot on w1, `node balance.js 1 <seed> 1 near`

| seed | goal (t100) | two stars (t140) | three stars (t190) | bot end size | absorbs |
|---|---|---|---|---|---|
| 12345 | 40.1 s | 82.0 s | 103.5 s | 319.1 cm | 3301 |
| 777 | 40.1 s | 76.3 s | 99.1 s | 319.4 cm | 2896 |

`BALANCE_PASS` both. Clock 165 s. These are the numbers a world 1 batch must hold within ten percent (plan 4.6).

### Baseline: performance on w7, the biggest world

Probe: the real `index.html` with a `DB_DEV.perf` hook injected into a scratch copy (Phase 1 makes it permanent),
headless Chrome on SwiftShader, 915x412 at DPR 1, seed 12345, the ball parked at spawn, `setD` to three sizes,
40 frames each. **Draw calls and triangles are exact. Milliseconds are a software GPU on one physical core and are
not phone numbers** (perf_ab.js's own warning, still true); the JS tick under a 4x CPU throttle is the only time
here that means something for a phone.

| ball | draw calls | triangles drawn | tick median / p95 at 4x throttle |
|---|---|---|---|
| 45 cm (spawn) | 145 | 922,108 | 1.7 / 10.9 ms |
| 400 cm | 157 | 923,958 | 2.2 / 10.4 ms |
| 1500 cm | 181 | 927,896 | 1.2 / 8.3 ms |

What this says: every InstancedMesh is `frustumCulled=false`, so **every placed instance of every kind is drawn every
frame**: about 920 thousand triangles on w7 whatever the camera sees. That is the base the plan's fence multiplies
(draw calls at most 2x, triangles at most 3x). It also means the two set LOD is not optional: a 600 triangle kind
with 300 instances drawn everywhere is 180,000 triangles by itself.

The run took 10 minutes, almost all of it SwiftShader rendering under the 4x throttle; the permanent probe throttles
the tick only.

### The manifest (`tools/forge/manifest.mjs`, spends nothing)

Built from the real engine, not from the plan's table, and the plan's table was wrong in both directions:

- **286 kinds are declared, 282 are placed in at least one world** (the plan said 195 and 185). Four landmark kinds
  are declared and never placed (lmDollHouse, lmSundial, lmCakeStand, lmTeapotHill, the ones the wave two review
  replaced).
- **41 landmark kinds, 37 placed** (the plan said 11).
- Under the plan's own tier rules (4.3), tier A is **180 kinds**: landmarks 37, movers 21, keepsakes 30, gate prizes
  13, set anchors 79. Tier B is 54, tier C 48, tier D 0.
- **Tier D is empty under the literal rule** ("under a tenth of the start diameter": w1 starts at 4 cm, so a tenth
  is 0.4 cm and the smallest prop in the game is the 1.6 cm crumb). It does not change the spend, because C and D
  both stay primitives this month; the crumbs land in C.
- At the plan's 35 credits a kind, A plus B is **8,190 credits** for 234 kinds. The 4,120 on the account covers the
  first 117 in spend order, which is world by world: w1 1,715, w2 1,365, w3 1,365, w4 1,330, w5 1,260, w7 980,
  w6 175. **World 1 alone is 49 kinds and about 1,715 credits**, against the plan's "roughly 25 kinds, about 900".
- The 35 is the plan's estimate from the ripcord image to 3D run (30k polycount, PBR). Tumble measured a meshy-5
  preview at 5 credits. **The pilot measures the real cost per kind for each model type**, and the manifest is rerun
  with that number (`CREDITS_PER_KIND`) before world 1 starts.

Bug found and fixed while building it: Dream Meadow has no goal (`goalD` 0), so every kind placed there passed "at
or above a third of the goal" and the 1.6 cm crumb came out as big food. Zen now lends roles only; a kind that lives
only in zen is C unless a role makes it A.

Gate prizes as the engine places them (the biggest edible kind behind each gate; a ring gate's loot is the band
between it and the next ring):

- w1: Dessert Corner 14 coolerbox · The Cake Table 26 cakestand · The Grown-ups' Table 36 picnictable
- w2: The Play Mat's Edge 22 boardgame · The Shelf 55 boardgame · The Toy Chest 95 dollhouse
- w3: The Moss Ring 32 scarecrow · The Garden Hedge 80 pergola · The Old Wall 145 pergola
- w4: The Stall Rope 60 stall · The Market Arch 160 stall · The City Gate 380 minaret
- w5: The Dune Fence 160 sailboat · The Boardwalk Rail 550 harborcrane · The Harbor Wall 1250 harborcrane
- w7: The Garden Wall 120 whalebone · The Town Wall 420 harborcrane · The Old Ramparts 1300 graypeak · The Edge of
  the World 2600 graypeak

Gate: `node satellites/dewball/tools/forge/manifest.mjs --check` prints `MANIFEST_FRESH` or `MANIFEST_STALE` and
exits 1 when the committed manifest no longer matches the engine.

---

## Phase 1, the loading path (9 Oct 2026, no credits)

**Built.** In `index.html` (ES5, one block before the frame loop): `meshBoot` (fetches `assets/3d/index.json?v=`;
only when it names a kind does it load the vendored `GLTFLoader.js` and `meshopt_decoder.js`, r147, 103 KB and 25 KB,
beside `three.min.js`), `meshWorld` (from `startWorld`: every listed kind the world uses, two files at a time),
`_meshFromGltf` (one mesh per file, position + normal + uv kept, its map as a plain `MeshLambertMaterial` map,
texture LINEAR to match the vertex colour pipeline), `meshApply` and `lodSync` (the two set LOD), attached props wear
the model on the ball, movers swap to it. Test hooks: `perf`, `meshes`, `modelOff`, `sync`, `draw`, `syncBall`,
`?dbglb=<base>`. `teardown` keeps cached model textures (`_shared`). Stamp `dewball-v13` + `sw.js?v=13` + `ASSET_V`.
`assets/3d/index.json` ships EMPTY, so players download nothing new and the game draws exactly as before.

Tools in `tools/forge/`: `fixture.mjs` (the game's own primitives with a loud checker, written as GLB and packed by
gltfpack 0.25 with the production flags, `glbtest/`), `serve.mjs` (static server; `block` 404s a file, `virtual`
serves an in memory index, `root` serves another build), `gate-glb.mjs`, `shot.mjs` (player camera, model beside
primitive from ONE frame via `modelOff`), `perf.mjs` (exact counts; tick + sync timed under 4x CPU throttle; the draw
timed unthrottled and labelled SwiftShader).

**Two decisions that differ from the plan's words, and why.**
1. *The loader is not in the worker precache.* The gate caught it: with an empty index the page still downloaded
   GLTFLoader.js because the worker's install fetched it, 128 KB a player for a library with nothing to load. The
   fetch handler already keeps a copy of everything the game fetched, so loader and models play offline after one
   online world; precaching the loader alone never made a first offline run show a model.
2. *"Bounding size equals the catalogue size" means the primitive's bounding box.* Physics never reads geometry:
   `propVol` and every contact use `s` (and `volF`), so no mesh can move the ladder. `s` is NOT the visible size
   (max bounding extent over `s` runs 0.45 to 2.0, median 0.94: the cake stand draws 42 cm wide at `s` 62, the ant
   5 cm long at `s` 3.2). Fitting a model to `s` would make a third of the catalogue visibly grow or shrink against the
   physics players already know. `dewfit.py` fits each model to its primitive's bounding box; `report.mjs` checks it.
   Corollary: `smoke.js` and `balance.js` must come back IDENTICAL after a batch, not within ten percent.

**Gate, red then green** (`node satellites/dewball/tools/forge/gate-glb.mjs ...`):
- `--plant missing` → `GATE_GLB_FAIL 3 problem(s): missing file __gate/nope-teacup.glb / w1: teacup FAILED: ...
  responded with 404 / w6: ...` (and the world still rendered, 62 calls, no page errors: the fallback).
- `--plant empty` first → `GATE_GLB_FAIL ... empty index still downloaded GLTFLoader.js` (a real fault, fixed above),
  then `GATE_GLB_PASS plant=empty base=__gate/ kinds=0 worlds=w1`.
- production → `GATE_GLB_PASS base=assets/3d/ kinds=0 worlds=w1`.
- fixtures → `GATE_GLB_PASS base=tools/forge/glbtest/ kinds=5 worlds=w1,w6` (meshopt files from gltfpack 0.25 decode
  through the r147 decoder; teacup, sandwich, cakestand, teapot drawing in two sets; 42 ants wearing the model).
- fallback → `GATE_GLB_PASS base=tools/forge/glbtest/ kinds=5 worlds=w1 blocked=teapot` (teapot 404s, stays its
  primitive, the other four load, the world renders).

**Perf, w7, the same probe on the build before Phase 1 and after it, nothing loaded** (915x412, seed 12345):

| ball | before: calls / triangles | after: calls / triangles | tick + sync at 4x, median (before / after) |
|---|---|---|---|
| 45 cm | 145 / 922,108 | 145 / 922,108 | 11.9 / 10.0 ms |
| 400 cm | 158 / 924,076 | 158 / 924,076 | 11.5 / 15.0 ms |
| 1500 cm | 182 / 928,096 | 182 / 928,096 | 10.0 / 9.7 ms |

Counts identical. Ticks scatter both ways (noise on one physical core). ⚠️ Found, not caused: **w7's per frame JS
already sits at the plan's 12 ms median line at 4x throttle before any model**, p95 40 to 64 ms (the globe projects
all 5,558 instances every frame, half the far ones on alternate frames). The fence's frame time cannot be met by
models alone being cheap; it needs the globe sync looked at, and that is a separate change for a later phase.

**smoke / balance:** `SMOKE_PASS` byte identical to the Phase 0 output; w1 near bot (12345) byte identical.

**Shots, looked at** (fixtures, 915x412, scratch only): the w1 teapot and the w1 ant, each model and primitive from one
frame. The swap is exactly one object (the magenta checker teapot against the grey primitive teapot; the ant a
checker ant). Three things wrong: (1) the framing puts the subject small and partly behind the ball (the pilot needs
the shot to converge on the subject's size in frame, landmark_shots style); (2) the red checks swallow a red ant
(the plan's ground fault, Phase 5); (3) one picture cannot show the far set at this ball size, the near radius covers
most of what is visible; the split is proven by counts (teapot near 1, far 80), not by the image.

---

## Phase 2 as first written: the five prop pilot, STOPPED at 45 credits (9 Oct 16:31 to 16:47 UTC)

Built for it (and kept: the benchmark uses all of it): `meshy_api.py` (Text to 3D preview then refine, sequential, the
double spend ledger `meshy-tasks.json` with every job's task ids and consumed credits kept forever, `--dry-run`,
`--max-credits`, `--status`, `--balance`, stops on the first non 200 or failed task), `test_no_double_spend.py`
(kills a run mid preview and mid refine, reruns; RED on a planted "forget to write the id": `FAIL: DOUBLE SPEND ...
{'preview': 3, 'refine': 0}`; GREEN on the real driver: one preview POST and one refine POST across two kills and
three runs), `recipes.json` (the prompts and the two arms), `dewfit.py` (Blender 4.0.2 headless: weld, one mesh,
pieces counted, yaw, fit to the primitive's largest extent, collapse decimate to budget, auto smooth, texture cap,
one `dw_<kind>` material, JPEG, +Y up), `pack.mjs` (gltfpack 0.25 `-cc -kn -km -kv -noq` + the index), `report.mjs`
(reads the packed files: RED on triangles over budget, size off the primitive by over 1%, below the floor, no
texture, texture over cap; WARN on proportion drift), `sheet.py` (primitive beside each arm, one JPEG per kind per
screen size), `shot.mjs` now converges on the subject's size in frame (the Phase 1 framing fault).
Installed: Blender 4.0.2 (apt, no recommends) + `python3-numpy` (its glTF importer needs it), gltfpack 0.25 (npm).

**Meshy, measured** (prices read from docs.meshy.ai/en/api/pricing 9 Oct, then billed exactly so): Text to 3D
preview meshy-7.1 **20**, meshy-t2 **5**; refine at 2K **10**. So a kind costs **30 standard, 15 smart topology**,
not the plan's 35. Refine accepted `ai_model: meshy-6` + `remove_lighting` on a 7.1 and on a t2 preview. Timing:
standard preview 51 s, smart topology preview 20 s, refine 112 s.

**Stopped** at 16:47 UTC when Fable's merge landed (`plans/dewball/ASTRA-MERGE-OCT09.md`, 85b7257f): Phase 2 is now
the first slice, "no credits until the free work is done and looked at", and the art direction moved from toy shop
to handmade miniature, so the remaining eight pilot jobs (180 credits, toy shop prompts) were not bought. Spent 45:
`cakestand.std` done (30), `cakestand.t2` preview done (5) and refine paid and in flight (10, its id is in the
ledger: a rerun downloads it with no new spend). **Balance 4,075.** The two cake stands become the benchmark's late
run prop data point for the two model types.

First look, Meshy's own thumbnail of `cakestand.std`: a pink layer cake with dripping white icing and a cherry on a
stem, on a cream plate and pedestal; reads as a toy instantly. Fit test: 30,509 triangles to 1,500 in 3 s, one
piece, 512 texture, 156 KB before packing; its largest extent is its height (44.6 cm, exactly the primitive's) but it
is narrower (25.7 against 42): one uniform scale never makes a model bigger than today's prop in any direction,
and Meshy picks its own proportions. The report warns on that drift; the prompt is the lever.

---

## First slice, step 1: C1 + A11 + C8, the truthful words and ONE notification slot (9 Oct 2026, no credits)

**Built** (`index.html`): every in run message now goes through `notify(text, kind)`: one slot, priority
star > keepsake > gate > tip > fact, a higher one cuts in on a lower one (a cut tip or fact is dropped, a cut star,
keepsake or gate waits again), nothing shows while paused (the slot hides with its time left and comes back on
resume), a stale tip is dropped rather than shown late (tips live 4 s, gates 8, keepsakes 15, stars 30, facts 14),
facts show 2.2 s at most once every 8 s and only the newest waiting fact survives, a run end clears it. New words:
the first star says "★ Goal reached. Keep rolling for the next star."; two and three stars say so in a sentence; the
HUD reads GOAL 24 cm, then NEXT STAR AT 1.85 m, then THREE STARS; a found keepsake gets "✦ Keepsake found: ..." in
the slot as well as its pip; "Now you can collect the ..." replaces "You can roll up: ...!"; the gate bump hint
says "... opens at 36 cm. You are 30 cm."; the title and How to Roll say "Collect small things. Grow to collect
bigger things." and explain the real ratio (about half your size when small, closer to your own size as you grow);
the meta and manifest descriptions are the plan's sentence.

**Copy sweep, the whole file** (new gate `copy_check.js`, red on a planted "How to Roll - fast!", green now): every
exclamation point and dash a player could read is gone: the star, gate and results lines, the "OPEN!" gate sign, the
"ate the ...!" pip, "double-tap", seven hyphenated size facts, and nine names (Windup Car, Windup Robot, Windup Racer,
One Eyed Bear, Board Game Box, Wooden Yoyo, Crab Pot Buoy, The Jack in the Box, The Grownups' Table).

**⛔⛔ Caught before it shipped: a renamed keepsake would have blanked every save that held one.** Keepsakes are saved
by display name, so "One-Eyed Bear" needed a migration (`keepNames`, applied on load and on the two tab merge). The
first version kept its map in an outer `var` declared BELOW `var save=loadSave()`: the map was undefined when the
loader ran, the lookup threw, and loadSave's catch handed back a blank default to any player with a keepsake. The
new `save_audit.js` section 5 crashed on it at once; the map now lives inside the hoisted function. Section 5 also
proves the two tab merge maps an old tab's old name with no duplicate. `SAVE_AUDIT_PASS`.

**Gates:** `notes_test.js` red on a planted priority inversion (`NOTES_FAIL 5`), then green (`NOTES_PASS`; it also
caught a real fault: a fact's 10 s life was shorter than its 2.2 s show plus the 8 s gap, so the newest fact always
expired just before its turn; now 14 s). `copy_check.js` red then green. `save_audit.js` crashed on the real bug, then
green. smoke and the w1 bot byte identical to Phase 0. Manifest regenerated for the renamed kinds, fresh.

**Shots, looked at** (`ui_shots.js`, title, How to Roll, the goal moment, a fact, pause, at 412x915, 360x740 and
915x412): the goal sentence reads in one pill in both orientations; How to Roll fits at 360x740. Three wrong:
(1) in landscape the slot's pill sat on top of the combo counter (the combo was at 22% of the height, 90 px on a
412 px screen): fixed, the combo never sits above 122 px; (2) "NEXT STAR AT 1.85 m" is small gold on a translucent
panel over a bright blanket, weak (step 2, C2's panel); (3) the world title in the bottom corner is too dim and small
to read at all (step 2, C2).

---

## First slice, step 2: A7 + C2 + C7 and reduced motion (9 Oct 2026, no credits)

**Built.** C2: every HUD word on a panel (`.hpanel`, dark at 66% with a gold hairline): the size panel at Astra's
sizes (28 px size, 15 px "Next star at 1.85 m" in sentence case, an 8 px bar, at least 184 px wide), the clock at
22 px on its own panel moved to the top LEFT (beside pause at 412 px wide it ran into the size panel), pause on a
48 px panel, the combo on a pill, the world title readable on a panel for 3 s at the start of a run and then faded.
The notification slot moved to 94 px from the top (under the taller panel, never over its bar) and the combo to
140 px (under the slot). A7: the dash button says DASH, a ring around it fills as the meter charges, and an
UNCHARGED button no longer eats a touch: a camera drag that starts on it turns the camera (a charged one still
dashes on the touch). C7: on the first run on a device two cards sit over the halves, "Left side to roll" and
"Right side to look" (key words on a keyboard), with "Start rolling"; each fades once that thing has been done for
a moment, the overlay goes when both are done (or rolling plus 14 s), and `save.tutSeen` keeps it learned (OR
merged across tabs). Reduced motion: a title setting, defaulting to the phone's own prefers reduced motion; it stops
the pulses and the size pop, softens the red and gold flashes, and shrinks the dash's FOV kick; A1 will read it.

**Gates:** `input_test.js` (NEW, real touches through CDP, never a synthetic click): red on the old routing
(`INPUT_FAIL 1: 2a an uncharged dash button should hand the touch to the camera`), green now (first run shows on a
fresh save, fades per half, learned, absent on run two; uncharged dash hands the touch to the camera, charged
dashes). smoke and the w1 bot byte identical; notes_test, copy_check, save_audit green.

**Shots, looked at** (412x915, 360x740, 915x412: title, first run, dash, goal). Three wrong, all fixed and reshot:
(1) at 412 wide the clock's panel overlapped the size panel's edge: the clock moved to the top left; (2) in
landscape the taller panel ran under the slot's pill and hid the progress bar: slot and combo moved down; (3) the
clock had no panel at all: `updateHUD` assigned `className` every frame and wiped `hpanel`, now a classList toggle.
Also fixed from the same look: "Right side" wrapped while "Left side" did not, and "Start rolling" floated over the
red checks; titles no longer wrap and the line sits on a pill. Still true and not mine to change: at 26 cm the ball
fills the lower half of a portrait screen (the camera is device tuned).

---

## First slice, step 3: A2, the eligibility rings (9 Oct 2026, no credits)

**Built.** `canEat(size)` is now the ONE eat test: the prop collision, the movers, `absorbAll` and the rings all ask
it (same arithmetic as the four copies it replaced). Up to three rings on the nearest things you can collect within
three ball diameters, skipping anything under 45% of the limit (crumbs stop being ringed once you have outgrown
them); a 250 ms sparkle where something within six diameters has just become collectable; "Grow a little more to
collect the ..." only after a sustained push (0.35 s from the first touch, touches less than 0.2 s apart) into the
same thing no more than 1.6x the limit, once per thing, at most every 6 s. The rings are a warm white band over a dark
halo. Reduced motion: no pulse, no expanding sparkle. On the globe they go through the globe's own projection.

**⛔ Found while proving "physics unchanged": three.js names every geometry, material and mesh with a UUID drawn from
`Math.random`, and under `?dbtest=1` that is the SEEDED stream the balance bot draws its search headings from.**
Building the rings' five objects shifted the stream and moved the w1 bot by 12% (t140 82.0 to 91.5, absorbs 3301 to
2897) with not one physics number changed (smoke's ladder byte identical; bisected: the rings off, the bump off,
same numbers; the objects' creation was the cause). Objects made after the scatter build now come from a private
sequence (`_noRand`), and the bot is byte identical again. Rule for every later step: new three.js objects during a
run go through `_noRand`, or the bot's numbers stop meaning anything.

**⛔ Also found: my own identical check went green on two EMPTY files** (a failed command upstream left the path
variable unset, both sides of the diff were empty). Replaced by `same.sh` (scratch, copied into the log here):
it refuses a missing or empty run or a missing PASS line; watched red on a planted 1% `VOL_EFF` change (every world's
ceiling moved), green on the real file.

**Gates:** `elig_test.js` (NEW): red on a planted ring test loosened by a quarter (`ELIG_FAIL 20`: rings on a 2.21
cm sugar cube against a 2.20 limit, and more), green now (`ELIG_PASS 87 rings checked against canEat across
w1,w3,w7`): every ring on something `canEat` accepts, never under the floor, at most three, the three nearest;
rolling onto the first ring absorbs it; a sustained push into a slightly too big napkin says "Grow a little more",
into a far too big thing says nothing; a sparkle appears when a nearby prop becomes collectable and not when
nothing does. smoke and the w1 bot byte identical; notes, copy, save and input gates green.

**Shots, looked at** (w1 at 4 and 10 cm, the w7 globe at 45 cm, 412x915 and 915x412). Three wrong, two fixed: (1)
the first rings were invisible (a 20% band, pale gold, 1.5 cm on a pea): now a fat band at 0.75 of the prop plus 6% of
the ball; (2) the second rings were lime and vanished on the globe's lime grass (pale on pale, again): now warm white
over a dark halo, clear on the red checks and the grass; (3) in a dense cluster the three rings overlap and read
busy; left as is (three is Astra's number) and noted for the device test. No rings at the w7 spawn is correct: the
six things within three diameters are 5 to 8 cm against an 11 cm floor.

---

## First slice, step 4: A1, the pickup feel (9 Oct 2026, no credits)

**Built, all render only.** A collected prop or creature flies from where it touched the ball onto the ball in 110 ms
(ease out, a slight scale settle); the ball's non rotating root squashes 3% for 120 ms (a half sine pulse, applied in
world space so a spinning ball never squashes sideways, the root lowered so the bottom stays on the ground); a plink
replaces the two note chime: one short note that climbs a semitone with every combo step, fourteen at most. Reduced
motion turns off the fly in and the squash; the plink stays. No new three.js objects (no random stream touched).

**Gate:** `anim_test.js` (NEW): the same scripted 600 frame w1 run with the animation on and off must match in size
and absorbs at every checkpoint, AND the animation must be seen running (fly and squash frames counted) or the
comparison proves nothing. Red on a planted volume leak inside the squash (`ANIM_FAIL: frame 59: size 4.41226 with
the animation, 4.41225 without`), green on the build (`ANIM_PASS ... 34 absorbs, 5.597 cm; fly frames 160, squash
frames 180`). `same.sh` (smoke + the w1 bot) byte identical; every earlier gate green.

**Looked at, filmed not frozen** (eight frames 16 ms apart around a grape pickup at 12 cm, w1, 915x412): the grape
settles onto the ball's side; the new rings read clearly on the red checks. Three wrong, none fixed here: (1) the fly
in starts where the thing touched the ball (Astra's spec), so it travels only a few centimetres and reads as a
settle more than a fly; (2) 3% of squash is near invisible in stills (the spec; a feel to judge on the phone);
(3) the probe's crop put the ball high, so the strip shows little ground. Device test owed.

---

## First slice, step 5: B3 the blanket, B4 the w1 landmarks, 5b the sideways movers (9 Oct 2026, no credits)

**B3, built as ruled:** w1's checks are dusty coral `#C87568` and linen `#E9DFC4` (were `#b8483e` and `#e2d6c0`).
New measure `palette_check.js` (every placed kind's two biggest colours by area against the ground, rim and fog, CIE
Lab): the old blanket had 20 clashes under dE 12 over 3,293 placed instances; the ruled palette fixes the red one (a
red apple on a red check, dE 9.4) and has 19 clashes over 3,171 instances. ⚠️ **The bigger problem is cream on cream,
not red on red**, and linen is a cream: candles dE 1.8, tea cups, sugar bowls, chess rooks, napkins, bottle caps and
the cake stand's plate dE 3.7, sugar cubes, eggs and plates dE 9.9. A mid tone second check would cut the clashes to 4
or 5 (dusty blue `#9FB9C4`: 5 over 1,484 instances; sage `#A9C29B`: 4 over 1,483; most of what is left is crumbs and
cookies against the orange FOG, not the ground). Shot the same spot in the three: the warm light and fog move every
ground colour (dusty blue lands as a warm grey, sage as yellow), and the spot I chose put every prop on a coral square,
so the comparison is not yet a fair one. **His call (question below); linen ships as ruled.**

**B4, built:** the Leaning Library's nine slabs are nine books (covers, a spine and a cream page block between the
covers on three sides, each on its own yaw and the shared lean; the two baseline page cards, which sat INSIDE the
books where nobody could see them, are now bookmark ribbons); the Gramophone's record sits on a platter so its black
edge and red label read from a low camera; the Longcase Clock has its dial on the back too (from behind it was a dark
pillar). Parts added since the baseline are built off the seeded stream (`ppN`), so the bot is untouched.

**5b, built:** 13 mover kinds were nose along x while the game drives every mover along its local +z, so cars, the bus,
the train, camels, cows, dogs, cats, hens, gulls, ants, ladybirds and fireflies went sideways. `MOVER_FWD` turns each
kind's own geometry once so its head points along +z (head read from the parts: head spheres, beaks, the chimney, the
car's headlight card). Left alone on purpose: the butterfly and the moth (wings across the way they fly), the crab and
the toad (eyes on +z already), the round ones.

**Gates:** `mover_test.js` (NEW): red with the turn table removed (`MOVER_FAIL 13: ant (w1) is 5.0 wide on x and 1.9
long on z: it travels sideways ...`), green now (`MOVER_PASS 21 mover kinds`). `same.sh` byte identical (the palette,
the landmark parts and the turned movers move neither the ladder nor the bot). Every earlier gate green. Manifest
regenerated (the turned movers' boxes and the books' triangles).

**Shots, looked at:** `landmark_shots.js` (w1, the player camera converged on each landmark): the Leaning Library now
reads as books, page edges on every one; the Longcase Clock from the very angle where Fable's brief shot showed a dark
pillar now shows a dial and hands; the Gramophone's record shows its edge. Three wrong: (1) the shot tool predated the
first run cards and they covered the bottom of the book stack in every shot (fixed in the tool: a landmark shot ends
the lesson first); (2) the palette comparison put every prop on coral (above); (3) a still of a w4 camel and cat cannot
show which way they walk, so the heads LEADING is read from the parts, not seen: device test owed.

---

## First slice, step 6: C10 the WebGL failure state, D3 the keepsake banking rule (9 Oct 2026, no credits)

**C10, a real hole, closed.** `new THREE.WebGLRenderer` throws when the browser will not open WebGL (a blocked GPU,
too many contexts, an old phone), and it threw from inside the world card's tap: the menu stayed up and the tap did
nothing, with no word why. Now `initGL` catches it and the player gets "This browser could not start the game"
(what WebGL is in one plain sentence, that stars and keepsakes are safe) with Try again (reload) and Back to worlds.
A context LOST mid run (Android reclaims GPU memory) pauses the run at once; three.js rebuilds on restore; if the
context has not come back in 4 s the same screen shows instead of a frozen picture.
Bug found on the way and fixed before it shipped: `initGL` returned `undefined` on success, which `buildWorld` read as
failure (every node gate crashed on the null world).

**D3, the rule, written down:** a keepsake is BANKED the moment it is collected (the save is written in `absorb`, not
at results), so quitting, the clock running out, a closed tab or a knock keeps it. A knock can roll it back onto the
ground, collectable again but already banked; the second pickup no longer says "Keepsake found" again.

**Gates:** `glfail_test.js` (NEW): Chrome with WebGL disabled, a REAL click on the first world card. Red with the
try/catch removed (`GLFAIL_FAIL 2: no failure screen after tapping a world without WebGL / uncaught errors: Uncaught
Error: Error creating WebGL context.`, which is exactly what the live game did until now), green on the build.
`save_audit.js` section 6 (NEW): collect w1's Lost Thimble, abandon the run with no endRun, a fresh boot on the same
bytes holds it; watched red with the save at pickup removed (the thimble lost). `same.sh` byte identical; every gate.

**Looked at** (the failure screen from a real tap with WebGL off, 412x915, 360x740, 915x412): reads at every size;
Try again 190x52, Back to worlds 150x48 rendered. Three wrong: (1) the blurred menu shows through behind it (the house
overlay style, busy); (2) "WebGL" is a technical word, kept only in parentheses; (3) nothing is logged when it
happens, so we would never know how often players hit it (a later ticket: one line to the fleet's crash reports).

---

## The w1 benchmark (merge 3.2 item 8), 9 Oct 2026: 300 credits, then STOP for his look

**Bought, in two stages, every task in the ledger.** Stage 1, both model types on the merge's first three (crumb,
cookie, sandwich) in the handmade miniature recipe: 135 credits. Stage 2, the other eleven in the winning type (smart
topology): cupcake, ladybird, chess pawn, candle, picnic basket, cookie tin, folding chair, the Leaning Library, the
Gramophone, the Longcase Clock, the Lost Thimble: 165 credits. Plus the two cake stands the stopped pilot had already
paid for (the t2 one resumed from the ledger for nothing). **Balance 4,075 → 3,775.** Ledger: 19 jobs, 345 credits
consumed in all. Raw sculpts backed up as release `meshy-dewball-20261009` on lucid-winds-vault (39 files).

**Fitted, packed, gated:** `assets/3d-bench/std/` (4 kinds) and `assets/3d-bench/t2/` (15 kinds, 3.1 MB, textures 1.3
MB). `report.mjs` REPORT_PASS on both (watched red first on a planted half budget); `gate-glb.mjs` GATE_GLB_PASS on
both in a real browser (w1, w7, w6). Served behind `?models=bench-std` / `?models=bench-t2` only: players see nothing.
Found and fixed on the way: (1) `dewfit` fitted BEFORE decimating and a 28,000 → 600 collapse eroded the cookie's rim
1.8% (report caught it): it now fits again after the decimate; (2) the LOD radius ignored the prop's own size (a 62 cm
cake stand 75 cm from a 4 cm ball drew as its primitive): near is now max(8 ball D, 6 own sizes); (3) the shot tool
wrote BLACK frames on long runs (resizing one page lost the headless GL context) and parked the ball in front of small
subjects: a fresh page per size, a black frame retried then FAILED, and eight approaches by three pitches scored by
line of sight and by how much of the subject the ball's box covers (new `DB_DEV.ballBox`).

**Verdicts, looked at** (prim beside model from one frame, w1, balls 4 / 14 / 24 cm, 412x915 and 360x740; the sheets
and the page are at lucidwinds.com/docs/briefs/dewball/benchmark/):
- Model type: **smart topology wins all three of the first three, at half the price.** The standard sculpt does not
  survive the cut to a phone budget (cookie and crumb came back as shards, the sandwich top jagged). Standard only
  wins on charm for a tall hero at 1,500 triangles (the cake stand). At 15 a kind, all of tier A and B (234 kinds) is
  about 3,500 credits: inside this month.
- The eleven: the model wins on the gramophone (carved cabinet, record; but the horn came out dark bronze, not bright
  brass), basket, cupcake, chess pawn, thimble, candle (fatter, the flame red) and ladybird. TODAY wins on the Longcase
  Clock (Meshy made a slim dark pole whose face does not show), the Leaning Library (thin straight books, the lean lost)
  and the Cookie Tin (silver like a saucepan, not blue). The folding chair shot was blocked by a cereal box.
- Proportion drift is the recurring fault: one uniform scale by the longest side keeps today's size but makes a slim
  Meshy shape slimmer (clock 16 cm wide against 28, books 18 against 31.8). His call: accept, or fit by width too.

**Perf, w1, no models against the 15 (exact counts):** draw calls 64/66/69 → 65/67/71, triangles 496k → 513k / 557k /
561k at 4 / 14 / 24 cm (+3 to +13%), textures 3 → 17. Far inside the fence on calls and triangles. ⚠️ **Texture memory
is the one that bites:** the three landmark maps at 1024 px are about 5.6 MB each with mips; the fifteen together come to
about 26 MB, over the plan's 24 MB per world. Phase 3's atlas (and landmarks at 512) is required, not optional.
The first slice itself costs w7 0 to 2 draw calls and a few hundred triangles (perf probe against Phase 0).

**STOP here (Fable's closing note and the merge both put the benchmark gate here).** Waiting on his look, the three
person phone test, and his calls (art direction, the rest of w1 at about 525 credits plus re rolls, proportions, the
second check, the opening route).

## The rest of w1 (Phase 3), 9 Oct 2026: 44 models LIVE, 6 kinds stay today's, one atlas (`dewball-v21`)

**His word, 9 Oct: "go ahead with the rest of w1 in smart topology".** Bought: the 35 w1 kinds the benchmark had not
covered (smart topology, the miniature recipe, 525 credits) and twelve re rolls (`t2r`, one each, new prompt): the three
benchmark losers (cookie tin, Longcase Clock, Leaning Library) and the nine that lost to today on the player camera.
Two re rolls FAILED at Meshy (`image_too_complex`, Leaning Library and Shortbread Wall: 5 credits each for the preview,
the refine refunded) and were not retried. **Balance 3,775 → 3,090. Ledger 66 jobs, 1,030 credits consumed in all.**

**The driver, hardened on the way.** `--parallel 4` (jobs run on Meshy, not here; every ledger write takes a lock, read,
merge, fsync, replace). One run died on `Connection reset by peer` mid poll: a GET poll now retries with backoff, a POST
never does (a POST whose answer was lost may still have made a task), and the rerun resumed the apple's paid refine for
0 credits. One SPENDING run at a time across processes (`flock` on `meshy-tasks.json.lock`): a second run refuses.
`test_no_double_spend.py` covers both, each watched red on a planted fault first.

**The atlas (texture memory was the fence that bit).** `atlas.py` gives each world ONE 2048x1536 texture (16 MB on the
GPU with mips, however many kinds share it). Squares by how big the thing is in the world, not by its role (a 95 cm
cereal box fills the screen beside a 4 cm ball; a 4 cm butterfly never does): 60 cm and up 512, 25 cm and up 256, else
128, landmarks 512, tier C 64; then the room left over goes to whichever kind has the fewest pixels per centimetre
(cooler box, cake stand, basket, banner pole up to 512; bottle, banana, candle, sandwich up to 256): 99% full. Each
square is cut from Meshy's RAW 2048 px picture (dewfit's copy is capped at the tier budget), edges smeared into a 4 px
gutter. Index v2 `{worlds:{w1:{atlas,kinds}}}` (`pack.mjs --world`); the game keeps one Lambert atlas material per
world and draws no model until the atlas is in (if the atlas fails, every kind stays its primitive: `gate-glb.mjs
--block atlas`, watched red on a planted queue without atlas fault). v1 indexes still load (fixtures, bench).

**Measured, w1 (perf probe, SwiftShader, 4x CPU, 4 / 14 / 24 cm):** draw calls 64/66/69 → 65/67/71; triangles 496k →
513k / 558k / 563k (+3 to +13%); **textures 5.96 MB (the game's own) + 16 MB atlas = 21.96 MB, fence 24.** Frame JS,
150 frames at 14 cm: physics p95 3.4 ms with models against 5.9 without (noise, not a gain); the LOD split p95 0.1 ms,
worst 5.4. (The 40 frame probe once printed p95 25.8: one garbage collection pause in a short sample, not the models.)
`DB_DEV.perf().texMB` is new so the fence can be read at all. Files: `assets/3d/index.json` + `assets/3d/w1/` (44 GLBs +
`atlas.jpg`) = 4.9 MB, fetched only when w1 opens, kept by the service worker after one online play.

**The picks, looked at** (`tools/forge/w1-picks.json` holds every one and why; each judged from ONE player camera frame
drawn twice, model and primitive, 412x915, `shot.mjs` + `mosaic.py`; movers needed `DB_DEV.frame` to find them, the first
shots parked the ball in front of every ladybird): **44 ship** (ant, apple, banana, banner pole r, basket, berry r
(a raspberry; the first read as a tomato), butterfly r (sky blue; the first muddy pink on coral), cake stand, candle,
candy stick r (striped; the first plain red), chess pawn, chess rook, cookie, cookie tin r (blue; the first a silver
saucepan), cooler box, cracker, crumb, cupcake, boiled egg, fork r (a blue handle; the first vanished on linen), jam
jar, juice box, clover, spoon, sugar rose, thimble, watch, ladybird, lemonade jug, gramophone, melon, napkin, picnic
table, pie, china plate r, radio, sandwich, strawberry, sugar bowl, teacup, teapot, folding chair, thermos, bottle).
**6 stay today's on purpose:** Longcase Clock (both tries lose: today's gold finials and pendulum read from across the
blanket), Leaning Library (thin straight books; re roll failed), salt shaker (reads as a lidded jar), cereal box (fake
letters, then a square column with a red splash), Shortbread Wall (a rubble heap; re roll failed), signpost (a carved
figure, then a pole whose boards are paper thin). Movers face +Z (`facing.mjs`: ladybird, ant; the butterfly flies
upright like today's).

**The world, looked at** (`world_shots.mjs`: models on beside models off from one frame, 4 / 14 / 24 cm at spawn, a 14 cm
ball at the densest cluster of models, the goal size from above, the rim looking out and looking in; 412x915 and
360x740). Three things wrong: (1) the crumb's LOD seam: near crumbs are golden buns, far ones today's brown cubes, a
colour change with distance (mild: the far ones are small and fogged); (2) the candy stick is a third as thick as
today's (one scale by the longest side): a thin line from afar; (3) at 4 cm the foreground crumbs are soft (a 64 px
square). The worst angle (the rim, looking out) is unchanged by the models: the haze band and the hard horizon are the
known faults from the first slice.

**Gates, all green on the shipped set:** `report.mjs assets/3d` (+ `--atlas-mb 10` watched red), `gate-glb.mjs` and
`--block atlas`, `same.sh` (smoke + w1 bot byte identical: physics never reads a model), notes, copy, save audit,
input, eligibility, animation, movers, no WebGL, `manifest.mjs --check`, `test_no_double_spend.py`.

## Toybox Peaks (w2) in models, and Crumb Country's second look, 9 Oct 2026 evening (`dewball-v22`)

**His words, 9 Oct: "keep going, deploy when it's done, should i go look at what youve done so far before you move on?
make sure its looking good? we could even make different levels in different styles unless thats dumb".** A style per
world is not dumb as ONE family (chunky, rounded, bright, readable, no text) with a material line per world; a kind keeps
the model of the world it first appears in. w2 is style `toybox` (recipes.json): glossy painted wood and plastic toys.

**A look panel, not just my eye.** A workflow ran three reviewers over w1 (one lens each: does it read as its NAME, does
it read against its GROUND, is it well MADE) and four over w2 (+ STYLE AND SAFETY). They were right where I had been
generous: in w1 the strawberry read as a tomato, the rook as a queen, the thimble as wicker, the jug as a clay vase, the
cracker as Swiss cheese, the ant as a spider; in w2 the timber tower as plastic bricks, the track as an abacus, the
crayon as a pencil, the top as a UFO, the domino lost its dots, the Jack in the Box its jack. **Two were legal risks:**
the wind up car was a lifted VW Beetle (a protected design; a white Beetle is a famous film car) and the tin train showed
a face on its smokebox (the look of a protected TV train). Every high finding was checked by eye before acting.

**Crazing fixed at the root.** Meshy's smart topology texture is a mosaic of one triangle islands packed edge to edge;
shrunk 16x into an atlas square they bled into each other (a pale web on the teacup, jam jar, ladybird). `uvclean.py`
(Blender: weld, Smart UV Project 66 degrees, Blender 4.0's concave packer) gives every model a clean second layout;
`atlas.py` `clean_bake` paints each triangle from Meshy's raw 2048 px picture into it (numpy, 4x4 samples a texel, never
reading across a triangle edge, push pull fill in the margins). ⛔ Cycles baking returns BLACK in this headless Blender
4.0.2 (even a red emission cube baked to 0 of 16,384 texels), so only the unwrap is Blender's. Side effect: welded
vertices, w1's files 4.9 MB → 1.8 MB. `dewfit.py --fold` (the butterfly's wings into a V like today's two cards, so it
never vanishes edge on), `--tip` (a model Meshy stood on its edge, laid flat: the kite). `facing.mjs --front`.

**Bought:** w2's 39 kinds (585), ten w1 re rolls (150), thirteen w2 re rolls (195). Balance 3,090 → 2,160; ledger 128 jobs, 1,960 credits consumed in all.
The driver now notes one refused model (invalid_input) and carries on, stops at the third; a prompt over 800 characters
refuses instead of being cut (the cut would drop the style's "no text" sentence). Both watched red first.

**Shipped:** w1 40 models (re rolls: strawberry, ant, thimble, jug, cooler, teapot, the cordial bottle now red syrup, not
a green wine bottle) and 10 kinds kept (rook twice a queen, cracker, thermos, banner pole, plus the six of the first
pass). w2 30 models and 9 kept (timber tower, track, storybook wall, stacking rings, flower bed, Jack in the Box, rocket,
shoebox house, toy car). Every pick and why: `tools/forge/w1-picks.json`, `w2-picks.json`.

**Measured (4x CPU, SwiftShader):** w2 draw calls 60/61/62 → 61/63/68, triangles 387k → 405k / 433k / 510k at 8 / 24 /
70 cm, textures 5.96 + 16 = 21.96 MB of 24; frame JS over 150 frames at 24 cm: physics p95 3.9 ms against 3.3 without
models, LOD split p95 0. w1 unchanged from v21. Files: 70 GLBs + 2 atlases, 4.0 MB.

**The world, looked at** (w2 at 8 / 24 / 70 cm, 412x915 and 360x740, the densest cluster of toys, from above, the rim).
Three things wrong: (1) the lock signs at the gates fill a third of the screen at 24 cm (today's UI, not the models);
(2) the board game box, a gate prize, now has a square 82 cm footprint against today's 82 by 58 and dominates its frame;
(3) the honey gold teddies sit close to the floor's orange, only their red bows set them apart.

**Gates, all green:** report (both worlds), gate-glb + `--block atlas` (w1, w2), same.sh (byte identical), the whole
suite, manifest check, the double spend test (now 4 cases).

## Toybox Peaks' small toys, 9 Oct 2026 night (`dewball-v23`)

**His words after playing Toybox:** "i noticed the crayons. thats nice. i really would liek to make a few small assets".
The six small toys (tier C, the ones the plan let stay primitives) in style toybox, 90 credits: the die, paper plane,
stud brick (a generic brick, no logo), puzzle piece and yoyo ship; the jack stays today's (Meshy's own thumbnail is a
shattered pile of fragments). The die's dots are uneven blots in Meshy's own art, not the atlas; it still reads as a die,
brighter than today's beige one. w2 is now 35 models / 10 kept. Gates: report, gate-glb + --block atlas (w1, w2),
same.sh byte identical. The browser suite was not rerun: this deploy changes model files only (v22's code, suite green).
(Also tonight, before his "one game at a time": 36 credits of Ripcord pilot arena art, parked; see the board.)

## 10 Oct: Night Garden (w3), his Astra pictures, the image to 3D pilot

His Astra (ChatGPT) zip came back with all 16 pictures right first time: every kind in its cell in reading order,
objects apart, a flat grey sheet. Originals + the eight models: vault release `meshy-dewball-w3-20261010`.
**The cutter, looked at on magenta:** the default `--tol 34` ate the shaded edges of green leaves (moonflower, topiary,
tulip); `--tol 18` keeps them whole and still drops the sheet. New `--holes 8` clears the background seen THROUGH an
object (the key's ring, the lantern and watering can handles, the armillary's rings, between the gazebo's columns, the
stag's legs) which the edge flood never reaches and Meshy would build as a grey film; it touched exactly those seven
and no grey stone. All 45 kinds cut, one piece each (three small edge bites left on slab, birdbath foot, pebble).
**Pilot, sheets 7 + 13, arm i2t, 120 credits (8 x 15, 51 to 81 s each), balance 1,899.** Looked at in Blender
(Cycles CPU, five views incl. the back and the top; Workbench aborts headless; ⛔ these models arrive in METRES at
their fitted size, a 1.5 cm firefly, so a default 0.1 m near clip draws NOTHING: clip_start = radius x 0.01).
Good from every side: toad, snail, moonflower, topiary ball, tulip. Faults: **hedgehog** (the soft cream quills
became dark jagged brown patches; 1,200 triangles for a pin cushion), **fern** (a flat card, a line from the side),
**firefly** (shape right, the glowing tail baked a dull olive). Not yet seen in a game frame (fit, atlas, shot.mjs).

## Night Garden (w3) in models, 10 Oct 2026 (`dewball-v24`)

**His words after the pilot:** "Yes those I think look good. Let's do this level and then we will take it from there.
If it's great then we will do the rest like this even if we have to wait for a reset". Bought the other 37 kinds by
image to 3D from his pictures (555 credits, no failure, 51 to 81 s each): **balance 2,019 → 1,344** for all 45 (675).
Raw files + his zip: vault release `meshy-dewball-w3-20261010` (91 files).
**Built:** dewfit (movers yawed toadG 90, snailG -90, firefly -90; the hedgehog came +Z already, facing.mjs looked at
before and after), uvclean, one 2048x1536 atlas for 46 kinds (butterfly wears w1's t2r; ten big kinds stepped down to
256 px to fit, 100% full, 16.0 MB on the GPU), pack `--world w3 --merge` (w1 and w2 files untouched). `w3-picks.json`.
**Looked at** (shot.mjs, one player frame drawn twice, 412x915, mosaic): 46 of 46 ship. Clearly better than today:
every landmark, toad, snail, firefly (its tail is bright yellow in the game's light: the dull olive was my Cycles
render), the four keepsakes, greenhouse, dovecote, scarecrow, gnome, pumpkin, bench, wheelbarrow, sundial, beehive,
both lanterns, birdbath, moonflower, topiary, tulip, rake, compost heap, stone wall, slab, dewdrop, pebble. Ship with a
note: hedgehog (reads as spines from above, cream not brown, no face from the player's height), mushroom (spotted cap,
stem hidden from above), hedge wall (big leaf texture), kWhistle (an ocarina, as his picture), fern (a flat card from
the side), trellis (110 cm deep against today's 18.5: wider than its collision), gazebo (70% of today's height, the
pond wider). The watering can's player shot sits behind a pumpkin twice; looked at whole in Blender instead: sound.
**The world, looked at** (world_shots 15 / 60 / 150 cm, busy, above, rim in, rim out): at these cameras the models
change little beyond the dewdrops (true drops now). Three things wrong, none new: the gate lock signs fill a third of
the screen at 60 and 150 cm (today's UI, noted on w2 too); at the rim the camera presses into a big glass building, a
wall fills the frame models on or off; the play camera rarely shows the set pieces at all.
**Gates:** report (w1 w2 w3, atlas caps), gate-glb w3 + `--block atlas`, same.sh byte identical. Model files, the
index and the CACHE stamp only; the browser suite not rerun (no code changed).
