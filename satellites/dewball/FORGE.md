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

## Toybox Peaks drawn in, 10 Oct 2026 (`dewball-v25`)

**His words:** "the toybox level seems a little spread out and too big" · "theres a lot of space between everything.
maybe i just had a bad run. the ealy levels need to be especially good" · "youc an measure. i may also not be playing well".
**Measured** (balance.js `space`, read only, the bot identical with it on; 4 seeds 12345 777 1 2): nearest edible thing
in the first 30 s Crumb 1.5 ball widths, Toybox 3.0, Night 2.4; edible things within ten ball widths, first 30 s Crumb 69,
Toybox 9, Night 12; after 120 s Crumb ~2,000, Toybox 93, Night ~1,700. He plays fine; the world was empty.
**Tried:** a world `scale` (index.html, applied once after WORLDS: the bound, regions, gate rings, set CENTRES, room.h).
0.75 empties the world by 150 s; 0.8 starves the bot 90 s; 0.85 TRAPS it at 12 cm the whole clock in the mat's block
wall yards. Without the mat yards: 0.85 goal at 46 s, 0.9 goal at 56 s, 1.0 goal at 91 s and still sparse.
**Shipped: scale 0.9, no wall yards on the mat, s2 393 / s3 576** (58% / 85% of the bot's mean 678). Goal at 56 s of
200 (28%; Crumb 24%, Night 30%); 95% of the bot's final at 145 s (Night 144 of 205, Crumb 128 of 165); edible within ten
widths 18 in the first 30 s (was 9) and ~150 at 60 to 120 s (was ~40). Manifest: only w2 counts moved (block rampart
389 → 296, storybook wall 290 → 363). Gates: smoke (only w2's ceil 677→687 and need 448→662 moved; the baseline's two
values updated), same.sh byte identical for w1, notes, copy, save audit, input, eligibility, animation, movers, no WebGL,
manifest fresh, gate-glb w2. **Looked at** (world_shots w2 8 / 24 / 70 cm, today over new): the spawn frames look the
same (the spawn litter is ball relative); the gain is pace, not the frame. The visible fullness comes with his new small
toys (Astra doc 2). Three things wrong, none new: the gate lock signs cover a third of the screen at 24 and 70 cm; the
playroom floor still reads as a big orange plain between clusters; at the rim the room wall is closer (by design).

## The world reacts, 10 Oct 2026 (`dewball-v26`)

**His words:** "The world doesn't react. Its very stiff." Before: a prop the ball cannot eat was either shoved flat
(within 1.15x the ball) or a wall that never moved; nothing tilted, rocked or turned. **Now (drawing only):** every prop the
ball runs into ROCKS on a damped spring (index.html `react` / `reactTick`): the top is pushed away from the ball and it
settles in about half a second, pivoting on its FAR bottom edge (a centre pivot sank that edge into the floor); how far
goes with the hit and the ball beside it (`ratio = D / size`, walls x0.25, cap 24 degrees, a spring stiffer for big
things); a shoved prop also turns by the side it was struck on (st.rot, which no collision reads). Off under Reduced
motion, off on the globe (projected matrices). The models follow through lodSync. ⛔ First strength 2.6: FILMED, a full
speed hit tipped a ball sized teddy about 3 degrees and nobody could see it; 15 now (about 18 degrees for your own size).
**Gate:** `react_test.js` (w2, a 30 cm ball rammed into 16 props it cannot eat, on vs reduced motion: size, absorbs and
the ball's position identical; 250 kicks seen; `--plant` leaks the wobble into st.x and goes RED). **Film:**
`tools/forge/react_film.mjs` (a strip of frames per kind from just before the hit to the settle; `--yaw` swings the
camera off the ball's line so the ball does not hide the prop). Looked at: the teddy leans back on its far edge and
rocks back, the robot and the drum are knocked, tilt and turn. All gates green; w2 bot identical on 4 seeds; same.sh.

## The gate signs stand on their fences, 10 Oct 2026 (`dewball-v27`)

The "🔒 22 cm" signs filled a third of the screen at 24 and 70 cm in Toybox Peaks and Night Garden (seen in every world
shot of the day, twice written off as "today's UI"). Cause: a sign stood at its gate's CENTRE, and a concentric world's
rings are all centred on the start, so every sign hung in the sky over the ball. Now (index.html, the tick's gate loop,
drawing only) a sign stands ON its fence at the point nearest the ball, just above the gold caps, sized by its distance
(0.9 to 3.6 x its need); at the very centre it stands where the camera looks. The globe (w7) is left as it was.
**Looked at:** the world shots of Toybox and Night Garden (the banners gone from the sky) and the ball rolled up to the
first two Toybox fences and Night Garden's first (the sign right above each fence, readable, under the size panel after
lowering it once: the first height slid the 55 cm sign behind the HUD). Crumb Country's spawn frames unchanged.
**Gate** `sign_test.js` (every closed planar gate's sign within 1% of its ring, under 2x its need, at the start and after
moving: 30 signs in 5 worlds; `--plant` puts the centre placement back: RED, 60). All gates green, same.sh byte identical.

## Toybox Peaks' opening: eight small toys as primitives, 10 Oct 2026 night (`dewball-v28`)

The opening had 18 things in reach in the first 30 s (after v25) and only the marble, die and jack fit a starting ball.
Eight small toys from his Astra doc 2 (`w2fix-sheets.json`) now exist as kinds with primitives in that doc's colours:
Wooden Bead 2.6, Pom Pom 3.0, Wind Up Key 4.0, Peg Doll 5.0, Stacking Cup 6.0, Paper Boat 6.5, Wooden Elephant 7.0,
Baby Rattle 8.0 (an 8 cm ball eats the first three; the rest come in by 15 cm). Placed: 70 beads in the spawn litter,
the eight on the mat (408), five in the first ring (145). Their models swap in when his pictures come (doc 2).
**Measured** (near bot, 4 seeds, `space`): things in reach in the first 30 s 89.5 (was 18; Crumb 69), nearest edible
1.1 ball widths (was 3.0); goal at 60 to 66 s of 200; 95% of the bot's final at 159 to 183 s (was 145: the world no
longer runs low). Stars refit s2 374 / s3 548 (58 / 85% of the bot's mean 645). ⛔ The layout comes from ONE seeded
stream: any count change reshuffles the world; three spawn mixes measured 50 / 62 / 80 s to the goal, the first mix kept.
**Looked at:** the spawn at 8 and 24 cm: the beads were cobalt blue per the doc and read as darker marbles beside the
teal ones; LEAF GREEN now (recipes.json too; his doc 2 still says cobalt blue, a one word change before he runs it).
Palette check w2: no new kind under dE 12 against the floor (the gold key 24). Smoke: only w2's ceil 687→685 and need
662→630 moved (baseline updated). Manifest: w2 3,900 instances. All gates green; same.sh byte identical (w1).

## The model swap moved out, 10 Oct 2026 night (`dewball-v29`)

**His words:** "some things load a little slow when i get close to them". Cause: models draw within LOD_NEAR ball
diameters, primitives beyond, and the near set is rebuilt each quarter of that radius, so with LOD_NEAR 8 a model
popped in at 6 to 8 ball widths, mid screen. **LOD_NEAR 16** (the swap at 12 to 16 widths, half the size on screen).
**Measured** (perf.mjs, exact renderer counts; the timings were noise, another job shared the box): triangles w1
+6 / +2 / +6% (4 / 14 / 24 cm), w2 +4 / +7 / +30% (8 / 24 / 70 cm), w3 +2 / +9 / +27% (15 / 60 / 150 cm), the worst 867k
(1.5x the world before models; the plan's fence is 3x); draw calls 60 to 94 (under 2x). 24 was measured too: 1.08M at
w3 150 cm, rejected. **Looked at:** a filmed approach to Night Garden's gnomes did NOT reach either swap distance in its
eight frames, so the film proves nothing about the pop; his phone is the judge. Gates: gate-glb w1 w2 w3, same.sh,
react, sign, anim, elig.

## Crumb Country's crumbs keep their colour, 10 Oct 2026 night (`dewball-v30`)

The w1 look (9 Oct) named it: near crumbs were golden buns (the model, its texture measured #fdc161), far ones the
primitive's brown cubes (#c09055), so every crumb changed colour as the ball rolled up. The primitive is golden now
(#f0b65c / #d89e4a). Looked at: the spawn at 4 and 14 cm, the far crumbs golden like the near ones. Colour only:
same.sh byte identical.

## Crumb Country's six new treats, 10 Oct 2026 night (`dewball-v31`)

His go: "youc an go ahead and do the dewball stuff as well the crumb country stuff youre planning". Popcorn 3.0, Acorn 3.4,
Cherry Pair 5.0, Macaron 5.0, Pretzel 6.0, Cheese Wedge 7.0 as primitives (models with his doc 1), 700 in the middle
ring. **Measured** (near bot, 4 seeds): before goal 40.1 s, final 319 of 325, 95% at 127 s; first try (popcorn and
acorns in the NEAR ring): goal 59 s, in reach 69 → 5 (a lone popcorn, worth seven crumbs, drew the ball off the crumb
field); kept (all in the middle ring): goal 42.7 s, final 320 of 325.5, 95% at 125 to 132 s; stars unchanged (the refit
moves them under 1%). ⛔ **Adding ANY scatter entry re rolls the world**: 49 of 56 kinds moved, keepsakes too, even with
the entries appended last (placement checks against everything placed); only the near ring foods kept their places.
**Looked at:** each treat from the player camera: cherries, macaron, cheese wedge read at once, acorn and pretzel clear,
popcorn was a pale blob on the linen (now buttered yellow; recipes.json too). Palette w1: only the macaron's cream
filling sits near the linen (dE 6, 29% of it; the pink shells carry it). The rearranged world at 4 / 14 / 24 cm, busy,
above: nothing broken. **Gates:** smoke + w1 bot RE RECORDED with the reason (`baseline-oct09/README.md`), same.sh,
react, sign, notes, copy, save audit, input, elig, anim, movers, glfail, manifest fresh, gate-glb w1.

## Bazaar Lane (w4) in models from his Astra pictures, 10 Oct 2026 (`dewball-v32`)

His Astra zip (17 pictures, with Astra's own READ-ME: all 47 present, the creatures a slight three quarter turn, the
wheel's paddles and the pavilion's back posts uncountable) cut clean at `--tol 18 --holes 8` (47 of 47, one piece each;
birdcage bars, bicycle spokes, stool legs and guy ropes see through). Meshy i2t 47 x 15 = 705 credits: one server_error
(potterystack, refunded; the driver stopped before kScroll as designed) and both rerun for 30: **balance 1,344 → 639**.
Vault release `meshy-dewball-w4-20261010` (the zip + 94 files). Movers turned: camel 90, catB -90, dogB -49 (Astra's
three quarter view), chicken already +Z (facing.mjs before and after). Apple wears w1's t2 model.
**Looked at** (shot.mjs pairs, 412x915, mosaic): 47 ship, every one reading better than its primitive (all six
landmarks, the four animals, the keepsakes, stall, tea house, well, fountain, barrel, carpets, sacks, brass, fruit);
the tajine and bicycle shots were blocked (a wall, a fruit cart) and were rendered whole in Blender: the tajine is
excellent, the **bicycle is KEPT a primitive** (Meshy filled both wheels and the frame triangle with flat red film).
Drift to know: the water wheel is half today's height (Astra drew it angled), the spice pyramid flatter, the street
lamp's arm wider. **World** (30 / 120 / 300 cm, busy, above, rim): a stool at the spawn fills the camera at 30 cm (today
too), the world is orange on orange as the colour law predicted (the teal and blue help), signposts and banner poles
still primitives (their remakes are in doc 1). **Perf** (w4, exact counts): triangles 546k / 640k / 885k, draw calls
65 / 78 / 97 (inside the plan's 3x and 2x). Gates: report (w4 atlas 16.0 MB), gate-glb w4 + `--block atlas`, same.sh.

## Crumb Country + Toybox remakes from his Astra docs 1 and 2, first part, 10 Oct 2026 (`dewball-v33`)

Doc 1's zip **arrived cut off** at 6.5 MB (no central directory): pictures 1 to 4 were recovered whole by inflating the
local entries, picture 5 was truncated, 6 and 7 never came; he is resending. Doc 2: Astra stopped after picture 3 (the
jack, a boxy wind up van with square lamps and no Beetle face, the stacking rings, the timber tower). 14 cut at
`--tol 18 --holes 8` (the chrome jack at `--tol 10`: 18 bit into its highlights, 6 kept grey shadow). Meshy i2t
14 x 15 = 210 credits, **balance 639 → 429**. Vault `meshy-dewball-w1w2-20261010` (raw + cuts + pictures).
**Two forge faults found and fixed:** Meshy handed back the jack about 1e-9 m across, so dewfit's 1e-7 weld floor
merged every vertex and the fit crashed on an empty mesh (dewfit now blows a model under 1 mm up to a unit diagonal
first); the cracker came back standing on its edge (`--tip cracker=-90`, both faces have pin holes). The van faced
sideways (`--yaw toycar=90`, facing.mjs after: lamps to +Z).
**Looked at** (Blender turns, then shot.mjs pairs at 412x915, then world_shots both worlds): 13 ship, all better than
today (the clock and the salt shaker were two of the t2 refusals; the library, raisin, pea, oat ring, grape, bottle
cap, cracker; the jack, van, rings, tower). **The sugar cube stays a primitive**: Meshy turned the crystals into
crinkles and in the game it reads as crumpled paper. Seen while looking, left as is: the crumb model reads as torn bread
at full size (live since v21). **Perf** (4x CPU): w1 calls 77 / 79, tris 703k / 769k at 10 / 24 cm, tick p95 3.7 ms (a
first sample printed 19: one pause, rerun); w2 calls 75 / 87, tris 583k / 841k at 24 / 70 cm. Gates: report, gate-glb
w1 + w2 + w1 `--block atlas`, same.sh, react, sign.

## Crumb Country + Toybox remakes from his Astra docs 1 and 2, second part, 10 Oct 2026 (`dewball-v34`)

He resent doc 1 pictures 5 to 7 as three loose PNGs and sent doc 2's other five pictures as a zip (picture 3, already
shipped in v33, came again byte identical). A codespace restart wiped the session scratchpad mid cut; the run was
rebuilt from the transcript, and the two scratchpad helpers now live in `tools/forge/` (`look_glb.py`, the Blender
four view, Cycles since Workbench aborts headless; `liveboot.mjs --world --ready`, the live boot). 26 cut at
`--tol 18 --holes 8`, the grey rocket stand and grey elephant at `--tol 10 --holes 0` (18 ate grey into holes against
the grey ground). **Astra drew the Wooden Bead cobalt** (his doc still said cobalt; the game's bead is leaf green
0x3f9a4a because blue read as a marble): the cut was recoloured in HSV to the game's green (median 67,154,76 against
63,154,74) BEFORE Meshy, so no credits went on a redo. Meshy i2t 26 x 15 = 390 credits, **balance 429 → 39**, no
failures. Vault `meshy-dewball-w1w2b-20261010` (raw + cuts + his 8 pictures + the blue bead original).
**Fit:** the pretzel came back standing (`--tip pretzel=-90`, both faces salted); the rattle came back standing on a
SLANT in its picture plane, so a tip alone laid it diagonal and the longest side fit made it ~40% too long: dewfit
gained `--roll` (about the front back axis, before the tip), `--roll rattle=45 --tip rattle=90` gives 8.3 x 3.4 x 3.5
against the primitive's 8.3 x 3.4 x 3.8. No movers among the 26.
**Looked at** (Blender four views, then shot.mjs pairs at 412x915, then world_shots w1 + w2): 24 ship. w1: acorn,
cherries, macaron, pretzel (four of the six new treats), and the rook (square battlements, no more queen), thermos (cup
lid with handle), signpost (chunky arrow boards; today's read as a grave cross), banner pole (solid flags, no tatters),
biscuit wall (a neat stack, no rubble), cereal box (a bowl, no fake letters) leave the kept list. w2: jack in the box
(the clown rises above the box, reads from behind), rocket on its launch pad (its back fin came out grey: Meshy could
not see the back; not visible from the play camera), track (rails on sleepers), books, flower bed, shoebox house, and
all eight new opening toys. **Kept primitives:** the popcorn (300 triangle shards, reads as crumpled paper) and the
cheese wedge (its top shades in big facets, an amber gem); w1 now 59 models / 3 kept (sugar cube, popcorn, cheese),
w2 55 / 0. **Shared:** signpost, banner pole and flower bed are placed in most worlds, and a world draws models only
from its own atlas, so they joined w2 (signpost, banner pole), w3 and w4 (all three; both picks listed them as waiting
on these docs). Atlas cost of sharing (squares, same 16 MB a world): w2 boardgame, booktower, rockhorse, tricycle
512 → 256 (their extra was leftover room), dollchair, jenga, train 256 → 128; w3 gnome and w4 stool 256 → 128.
**Perf** (4x CPU, 150 frames): w1 calls 81 / 83, tris 712k / 778k at 10 / 24 cm (v33 77 / 79, 703k / 769k), tick p95
4.7 / 2.7 ms; w2 calls 84 / 95, tris 606k / 924k at 24 / 70 cm (v33 75 / 87, 583k / 841k), p95 3.4 / 5.6 ms. Inside
the fence (3x the ~920k triangle base, 2x its 145 to 181 calls). Gates: report (all four atlases 16.0 MB), gate-glb
w1 to w4 + `--block atlas`, same.sh, react_test, sign_test.
**⛔ The live boot tripped the host's ban:** two liveboot runs and one debug load (each 100+ requests) and the LiteSpeed
origin answered 403 to this box for the whole site (skywolfstudio.com fine). Probing stopped at once; the read back is
one request per origin after the ban lifts (memory project_cdn_429_lockout_sep15).

## Starfall Bay (w5), Dream Meadow (w6), The Whole World (w7): step 1, the toolchain and the cuts, 1 Nov 2026 (no credits)

**Why:** Meshy reset ("our meshy just reset so I have the rest of DuBall's assets"), balance 3,039 at 16:30 UTC; his Astra
zips for the last three worlds (w5 20 pictures, zip sha256 45a9e5e2a87f2fab..., w7 12, 71a9d4820bb70fc7..., w6 4,
0bb5d4cda1a6281a...; every picture's sha256 equal to Astra's asset-manifest.json). Branch `dewball-w567`.
**Toolchain, new box:** Blender 4.0.2 official tarball (sha256 equal to download.blender.org's list) in
`/workspaces/sws-tools/blender-4.0`, `blender` on PATH via `~/.local/bin`; it needed four X/GL runtime libraries from
Ubuntu's archive (libxxf86vm1, libsm6, libice6, libgl1). gltfpack 0.25 official release binary (digest equal to GitHub's).
Pillow 13.0, numpy 2.5.4, scipy 1.18.1 (pip --user; ⛔ `python3 -I` hides user site packages). `node_modules` in the
worktree root is a symlink to `/workspaces/sws-tools/node_modules` (untracked, never committed). Proved before use: a
headless Blender export; gltfpack decoding the committed `w3/toadG.glb` and repacking it with pack.mjs's flags (41,732 B
against 41,764 B committed); dewfit.py on that decoded toad (size matches its primitive, fit scale 1.0; only "has a
texture" fails, as it must for an atlas file); `report.mjs assets/3d` REPORT_PASS; `gate-glb.mjs --world w3`
GATE_GLB_PASS under the browser lock.
**Cuts, looked at on magenta, every one** (89 kinds; each world's picks file holds each kind's picture, quarter and
flags in `cut`, and `cutpicks.py <world>-picks.json --pictures <dir>` makes them again, byte equal to the cuts looked
at). Astra's pictures keep soft ground shadows and glow halos that the w3/w4 recipe leaves on the object, so
`sheetcut.py` gained three opt in passes (defaults off; a w5 sheet recut without them is byte identical):
`--shadow` (neutral, darker than the sheet, touching it, in the low 30% of its object: the first version without
the low part rule ate the gull's dark wing tips), `--ramp` (grows the sheet through a smooth glow halo and stops at the
step of the thing's edge: the reed's halo ends 87 from the grey and its blue stem sits at 77, no tolerance splits them)
and `--specks`. Run on everything, `--ramp 6` ate the Ferris wheel's base top, the bell's post and the dinghy's mast, so
it stays on Dream Meadow's lit pictures only. **Recuts and why:** crab, gull, dragonfly, the four p10 keepsakes,
driftwood, oar (`--shadow 50`; the star at `--shadow-chroma 30`, its shadow is glow tinted, which bit the bell's base so
the others stay at 14); the boardwalk stand (its open window sat 9 from the sheet, past `--holes 8`: `--holes 12
--specks 80`); moon gate, pagoda, moth, cloud puff, dream reed (`--ramp 6`; `--tol 30` to 50 either kept the halo or ate
the felt); stadium (`--shadow 50`; the same pass bit the cathedral's grey towers, so the cathedral keeps a thin step
shadow); the grey peak (`--tol 18` and 10 both bit the left peak, `--tol 6 --holes 0` is whole). The anchor's
"crosses" warning is its ring passing the centre line: one piece, nothing of its neighbours. Everything else at
`--tol 18 --holes 8`, the grey kinds included (stone circle, sea wall, bollard, keep, clock tower, city wall, standing
stone: whole, compared with `--tol 10`).
**Seen in the pictures, for the fit** (in the picks files): movers face right (crab three quarter, dragonfly and moth
with wings raised where the primitive lies flat); lifering and starfish drawn face on (`--tip`), surfboard on a 42
degree slant and the oar on its edge (`--roll` then `--tip`, as the rattle); drift: whalebone, bollard, lighthouse,
clock tower, windmill sails, stadium (an elevated view, 0.77 tall per wide against the primitive's 0.31), hotel,
pavilion, aqueduct. w6 places seven w5 kinds and w7 twenty eight, pending on w5's buy; the bicycle stays w4's primitive.
⚠️ w7 draws 95 kinds from one 2048x1536 atlas (29 new, 38 shared, 28 from w5): its squares will be the tightest yet.

## Starfall Bay (w5), The Whole World (w7), Dream Meadow (w6): step 2, the models bought, 1 Nov 2026 (1,335 credits)

**Bought:** all 89 cut kinds by Meshy image to 3D, arm `i2t` (smart topology meshy-t2 at each kind's own budget, painted
from the cut, the same body as w3 and w4: the ledger's image_body equal to `windkey.i2t`'s), one run a world after a
`--dry-run` of all 89 (1,335 planned): w5 54 kinds `--max-credits 810` 18:31 to 18:40 UTC, w7 29 `--max-credits 435`
18:41 to 18:46, w6 6 `--max-credits 90` 18:47 to 18:48, `--parallel 4`, 21 to 53 s a model. **No refusal, no failure,
no reroll: 89 x 15 = 1,335 credits, balance 3,039 → 2,229 → 1,794 → 1,704.** The ledger keeps every task (350 jobs;
the 267 older entries byte for byte unchanged). The lane's budget was 1,700; 365 of it is left for rerolls.
**The vault today:** the private vault is not reachable from this box (no gh login) and lucid-winds is public, so no
release yet. Two copies, sha256 checked equal: `tools/forge/meshy-out` + `meshy-in` in the worktree and
`/home/codespace/dewball-drafts/meshy-raw/` (89 glb, 89 thumbnails, 89 cuts, 288 MB), the three zips in
`dewball-drafts/astra/`. ⚠️ Measured: both sit on the same loop device (`/dev/loop4`), so they guard against a deleted
folder, not a lost codespace. `dewball-drafts/VAULT-PENDING.txt` lists all 270 files (sha256, size) and the one
`gh release create meshy-dewball-w567-20261101` command; it must run before anything is built on these models.
**First look, Meshy's own thumbnails only** (a contact sheet a world; NOT the game camera, nothing fitted yet): every
landmark reads (Ferris wheel, helter skelter, balloon, hotel, pavilion, keel, dry dock, cannery; the bridge, stadium,
palace, cathedral, aqueduct, observatory; moon gate, pagoda, stone circle), the creatures and vehicles read. To watch
in the game frame: **kelp tangle** (crumpled green shards, the popcorn's fault), **shell** (big flat facets), **mooring
post** (a dark lump), **dragonfly** (small and bug like), the balloon's grey anchor rock at its foot, the oar (a thin
sliver), the postbox's dark foot, the sheep's faceted wool; the **moon gate's** moon fills its opening (as Astra drew it).

## Starfall Bay (w5) in models from his Astra pictures, 1 Nov 2026 (`dewball-v35`, no credits)

**Built from the step 2 buy** (54 i2t models, 810 credits, balance 1,704 unchanged by this step). ⚠️ The vault release
is STILL NOT MADE: gh is logged in with the codespace token, which cannot see `Stephenuffugus/lucid-winds-vault`
(`Could not resolve to a Repository`, 18:51 UTC), so this step builds on the two same disk copies; all 270 files were
checked against `VAULT-PENDING.txt`'s sha256 list before the first fit (every one equal). The law says vault first:
the release command in that file must run before this branch ships.
**Fit** (dewfit, the ladder law: every largest extent equals its primitive's, `report.mjs` REPORT_PASS): movers
looked at with facing.mjs before and after: the crab came back eyes and claws on +Z (no yaw), the gull beak to +X
(`--yaw gull=-90`, after: beak on +Z), the dragonfly head on +Z but its wings ONE upright sheet, a line from above
(`--roll dragonflyS=90` laid them flat). Flat things that came back standing, read in Blender's four views:
`--tip starfish=-90` (spotted face up; +90 laid it face down), `--tip lifering=-90`, the surfboard lying along z nose
up 31 degrees (`--yaw surfboard=90 --roll surfboard=31`: 111.5 x 13.5 x 46.2, fins down), the oar already flat
(`--yaw oar=90`). Then uvclean (54 of 54), one 2048x1536 atlas for 55 kinds (99% full, 909 KB, 16.0 MB on the GPU):
the eight landmarks keep 512 (two thirds of the atlas, the most of any world), so the sets step down: ferry,
harborcrane, lighthouse, sailboat, beachhut, boathouse, houseboat, whalebone, fishshack 512 → 256; driftwood, bonfire,
fishcart, umbrella, dinghy, boardwalk stand, rowboat, lifeguard post, barrel 512 → 128; the keepsakes, crab, gull,
seawall, cratewall and the shared signpost, banner pole, flower bed 256 → 128 (about 20 px a metre for every set piece
and landmark alike). Pack `--world w5 --merge`: `git diff --stat` shows index.json +170 lines and 0 removed, no file in
w1 to w4 touched; `assets/3d/w5` is 55 GLBs + `atlas.jpg`, 3.6 MB.
**Shared kinds without the October files.** Signpost, banner pole, flower bed, barrel and cratewall are placed in w5
and draw only from w5's atlas, but this box has neither the October fitted files nor the raw Meshy files (those are in
the vault). New `tools/forge/unatlas.py` rebuilds a fitted file from the SERVED one: gltfpack decodes it (the mesh is
dewfit's exactly, -noq keeps float positions), its square is found from its UVs in the home atlas, the square's inner
part is cut from that `atlas.jpg` and embedded, the UVs mapped back to 0..1; the world that gave the kind the biggest
square wins (signpost and banner pole from w1, flower bed w2, barrel and cratewall w4, all 256). One JPEG generation
more than a fresh paint; looked at whole in Blender (clean) and in the game camera.
**Looked at** (shot.mjs pairs of all 59 at 412x915, 8 mosaic pages, plus Blender four views of all 54 new models):
**55 ship**, each reading better than its primitive: all eight landmarks (the broken keel a real wreck with a ragged
red sail, the dry dock a ship on its blocks, the cannery's brick and chimneys, the hotel, helter skelter, Ferris
wheel, moored balloon, pier pavilion), crab (a crab, where today's is a red blob) and gull (a face, grey wings), all
five keepsakes (the bell on its post, the message in a bottle, a star, the Pearl Whorl a whorled shell, the comb with
its blue gems), the boats (ferry, sailboat, rowboat, dinghy, houseboat), the huts and stalls, lifeguard post,
lighthouse, crane, whalebone, umbrella, deckchair, bonfire, fish cart, cargo box (a ridged container), lobster pot,
net bale, buoys, dock and mooring posts, seawall (mossy rocks instead of purple blocks), groyne, driftwood, bucket,
sandcastle, seagrass, shell, starfish, surfboard, lifering, anchor, and the five shared kinds. The barrel's shot was
blocked (driftwood and an anchor fill the frame; one instance in w5): judged from Blender, sound. The starfish shot is
far; judged from Blender too. **Kept primitives (4):** the **dragonfly** (a pale smudge at a 9 cm ball: the light
wings and the thin navy body in a 128 px square vanish on the dusk sand, where today's blue rod with grey wings reads),
the **kelp tangle** (about 250 crumpled shards, the popcorn's fault: crumpled lettuce, today's green coils read as a
tangle), the **oar** (the blade a third of the length wide, as Astra drew it: a lute or a big spoon in the game camera,
today's thin oar reads), the **tide pool** (Meshy built the rock ring and left the middle open, the sand shows through:
a ring of stones, today's blue water disc reads as a pool). Removing them from the atlas let the fish shack grow
128 → 256; nothing else changed size.
**Drift to know** (in `w5-picks.json`): the mooring post is a squat bollard 2.2x the primitive's width (the darkest
thing on the boardwalk, 155 of them); the lighthouse 564 wide against 352; the pier pavilion lower (1,253 against
1,899) and shallower; the balloon taller and deeper, its four grey mooring stones on ropes; the keel's sail higher;
the hotel wider; the whalebone a long low skeleton (232 tall against 390); the bonfire's flame a card from its side;
the comb stands on its edge like the primitive.
**The world, looked at** (world_shots 60 / 400 / 1500 cm, busy, above, rim in, rim out, models beside today from one
frame): the opening's 319 shells are coral whelks where today's are pink blobs, so the sand at 60 cm and 4 m reads as
a shell beach; at 15 m the breakwaters read as rock, not purple blocks. Three things wrong: (1) the mooring bollards
are the heaviest dark accents in every boardwalk frame (the width drift); (2) the busy cluster mixes models with the
kept tide pools' flat blue discs, which now look plainer beside them; (3) the worst angle, rim out, is unchanged
by the models: the sand ends in a hard line against a flat navy sea band, the known horizon fault.
**Perf** (perf.mjs, 4x CPU tick, exact counts; before = the same build with an index without w5, base
`tools/forge/fitted/before/`): at 60 / 400 / 1500 cm, draw calls 68 / 83 / 102 → 73 / 108 / 125, triangles 478k /
481k / 485k → 494k / 695k / **1,677k**, textures 5.96 → 21.96 MB. Inside the fence against the plan's base (3x the
~920k w7 triangles, 2x its 145 to 181 calls), but ⚠️ 1.68M is the most of any world so far and 3.5x w5's OWN primitive
count at the 15 m ball: the near set covers 2,405 instances there (seawall 197 x 600, shells 319 x 300, mooring and
dock posts 280 x 300). Ticks scatter both ways (p95 4.6 to 22 ms with models, 9.6 to 17 without): the Shutterbug
lanes shared both cores the whole time, so no frame time here means a phone.
**Gates:** report (w1 to w5 atlases 16.0 MB), gate-glb w5 (55 ready, 74 calls, 493k triangles, 21.96 MB) and `--block
atlas` (0 ready, every kind its primitive, 69 calls), same.sh pointed at this worktree (SAME_PASS byte identical:
physics never reads a model), react_test REACT_PASS, sign_test, `manifest.mjs --check` MANIFEST_FRESH. Stamp: sw.js
CACHE `dewball-v35` (models, the index and the stamp only; no game code changed).

## The Whole World (w7) in models from his Astra pictures, 2 Nov 2026 (no credits)

**Built from the step 2 buy** (29 i2t models, 435 credits; balance 1,704, unchanged by this step). ⚠️ The vault release
is STILL NOT MADE: the codespace token still cannot see `Stephenuffugus/lucid-winds-vault` (`Could not resolve to a
Repository`, 2 Nov 19:53 UTC). The two same disk copies stand; the release command in `VAULT-PENDING.txt` waits for
his own `gh auth login`. The 1 Nov lane stopped this step after the pack (fit, uvclean, atlas and pack had each exited
0, logs in `dewball-drafts/w7/`); the looks, the record and the gates were finished on 2 Nov, nothing rebuilt.
**Fit** (dewfit, the ladder law): the four movers came back along x; `--yaw 90` on sheepW, cowW, busW and carW put the
sheep's black face, the cow's head, the bus's flat front and the car's bonnet on +Z (facing.mjs before and after,
looked at). No tip, roll or fold. uvclean 29 of 29.
**Shared kinds:** 34 rebuilt from their served files by unatlas.py (the v35 method; apple from w1 and w4, the
biggest square winning), 25 from w5's fitted files, the three w5 keeps (kelp tangle, oar, tide pool) stay primitives
here too (`w7-picks.json` keep). **One 2048x1536 atlas for 92 kinds** (99% full, 896 KB, 16.0 MB on the GPU), the
tightest yet: the six landmarks keep 512; city wall, clock tower, grey peak, harbour crane, hillock, keep and moon
shard 256; every other set piece 128 (110 step downs, most sets 512 → 256 → 128); 17 small kinds at 64. Pack `--world
w7 --merge`: index.json +281 lines, 0 removed, the w1 to w5 entries equal as parsed; `assets/3d/w7` is 92 GLBs +
`atlas.jpg`, 5.0 MB.
**Looked at** (Blender four views of all 29 new kinds; shot.mjs pairs of all 29 at 412x915): ⚠️ **on the globe the
pairs park the ball far from its subject** (the tool walks the flat plane; on the 129 m planet the curve and the ball
hide it): the six landmarks never show in their pairs, the weathervane's and the standing stone's are blocked by a
haystack and a cloud. The Blender views carried those. **29 ship, every one reading better than its primitive:** the
suspension bridge (red towers over a river between grassy banks), stadium (red stands, a green pitch, floodlights),
palace (golden domes), cathedral (blue spires), aqueduct (arches carrying a water channel), observatory (a dome with
its telescope out); the sheep (wool, black face), cow, camper bus and red car; the five keepsakes (a brass telescope on
its tripod, the weathervane's arrow, a red pillar postbox, the crown with red gems, a globe on its stand); cottage,
chapel, water tower, windmill, clock tower, keep, city wall, standing stone (mossy), oak, pine, hayrick, grey peak
(snow capped), hillock (a green mound with one pine and grey rocks), moon shard (a crystal cluster). Where the pairs
did show the subject (car, telescope, postbox, crown, globe, cottage, water tower, windmill, hayrick, grey peak, moon
shard, sheep, cow) the model reads better than its primitive in the game camera too. **Kept primitives: none new.**
**Drift to know** (in `w7-picks.json`): the aqueduct a long thin span (1,290 tall, 506 deep against the primitive's
1,950 x 2,538 block); the cathedral wider and deeper (3,020 x 2,991 against 2,140 x 1,834); the palace lower and
shallower; the windmill's sails 649 wide against 364; the standing stone fatter; the weathervane's arrow and the
telescope's tripod wider; the hillock a bright lime mound.
**The world, looked at** (world_shots 45 / 500 / 2,200 cm, busy, above, rim in, rim out, models beside today from one
frame): from above at 22 m the villages are cottages, hayricks and stalls where today they are red pyramids and boxes;
the busy cluster at 5 m is scarecrows and mossy stone walls instead of brown sticks; rim out is green hills with pines
instead of dark domes. Three things wrong: (1) the hillocks are lime green, louder than the muted domes, and at the
rim one fills the frame; (2) the gate signs stretch across the middle of the screen at 5 m ("4.20 m") and at 22 m
("13.0 m") in BOTH builds, a world fault the models did not make; (3) the spawn at 45 cm is sparse in both builds.
**Perf** (perf.mjs, 4x CPU tick, exact counts; before = an index without w6 and w7, `tools/forge/fitted/before-w67/`):
⛔ **the first measure broke the fence**: at 45 / 500 / 2,200 cm, triangles 922k / 924k / 931k → 1,016k / 2,735k /
**4,503k** (4.8x the base at the goal size), every one of the 4,466 live instances drawn as its model, because
LOD_NEAR's 16 ball widths of a 22 m ball reach round the whole 129 m planet (a 90 cm barrel at 1,509 triangles is 5
px there). **Two drawing only rules fixed it (index.html lodSync; physics never reads them, same.sh byte identical):**
`LOD_SPECK` 20, a thing smaller than a twentieth of the ball draws as its primitive wherever it is (every world), and
`LOD_GLOBE` 1.2, on the globe the ball widths reach at most 1.2 planet radii of arc (69 degrees; the draw cap stays
2.35 rad, and a thing big enough by LOD_SIZE still reaches past it: the landmarks). Measured after: 1,016k / 2,528k /
**2,222k**, and 1,718k at the 44 m three star size; draw calls 160 / 188 / 226 / 239 against 146 / 160 / 192 (the
fence is 3x the ~920k triangles and 2x the calls). Tried on the way: the speck rule alone at 20 gave 3,400k at 22 m,
at 12 gave 2,971k. Looked at again at 22 m and 44 m (world_shots `w7/world2`): the hayricks, cottages, stalls and
the horizon's landmarks still draw as models; nothing on the limb reads as a primitive swap. Textures 2.15 → 18.15
MB. Tick times scatter run to run on this box (median 14 to 49 ms at 22 m under the 4x throttle, the same build),
so no frame time here means a phone.

## Dream Meadow (w6) in models from his Astra pictures, 2 Nov 2026 (`dewball-v36`, no credits)

**Built from the step 2 buy** (6 i2t models, 90 credits; balance 1,704, unchanged). The vault caveat above holds.
**Fit:** the moon gate, pagoda, stone circle, moth, cloud puff and dream grass. The moth came back with its head on -X
and its wings fanned up and back (as Astra drew it): `--yaw mothZ=90` put the head and antennae on +Z (facing.mjs
before and after, looked at). uvclean 6 of 6. **Shared kinds:** 27 more rebuilt by unatlas.py from their homes (w1:
berry, crumb, book tower, pea, pie, sandwich, teacup; w2: crayon, die, drum, duck, kite, carousel, marble, paper plane,
teddy; w3: birdbath, firefly, hedgehog, lantern, dovecote, gazebo pond, moonflower, moonstone, toad; w4: jug, clock
tower), 14 from w7's set, 7 from w5 (anchor, small crab, driftwood, rowboat, sailboat, sandcastle, umbrella); the
bicycle stays w4's primitive. **One 2048x1536 atlas for 54 kinds** (100% full, 794 KB, 16.0 MB on the GPU): the eight
landmarks 512; bench, cart, cloud puff, driftwood, rowboat, sailboat, stall, streetlamp and umbrella 256; the rest 128
and 64. Pack `--world w6 --merge`: index.json +167 lines, 0 removed; `assets/3d/w6` is 54 GLBs + `atlas.jpg`, 3.2 MB.
**Looked at** (Blender four views of the six; shot.mjs pairs of the six and the seven w5 kinds): **13 ship**: the moon
gate (a purple felt ring round its moon, on a felt base), the pagoda (red and cream tiers), the stone circle (grey
stones on a purple disc round a glowing orb), the moth (a felt moth where today's are two flat cards), the cloud puff,
the dream grass (a felt ball on a blue stalk, today's own lollipop shape), and from w5 the crab (a red crab with legs
where today's is a red blob), the rowboat (a wooden boat, today's a plank box), the sandcastle (sand coloured, today's
pink), the anchor, driftwood, sailboat and umbrella. Kept primitives: none new.
**Drift to know** (in `w6-picks.json`): the stone circle 253 tall against 443 (low stones); the moth's wings fanned up
(4.7 tall against 2.6); the moon joined to its ring.
**The world, looked at** (world_shots 20 / 150 / 600 cm, busy, above, rim): the models barely change Dream Meadow at
these sizes, because its near field is crumbs, marbles and peas and its far kinds are few. Three things wrong, all in
both builds: (1) the spawn frame at 20 cm is nearly empty, a dark purple field with one pale band; (2) the whole world
reads dark and sparse at 1.5 m and 6 m (night fog over a dark ground); (3) the anchor at the rim is a black hook
against the dusk.
**Perf** (the same probe and base): at 20 / 150 / 600 cm, triangles 265k / 266k / 269k → 305k / 382k / 734k with the
speck rule (1,345k at 600 cm before it), draw calls 57 / 68 / 88 → 62 / 89 / 95, textures 5.42 → 21.42 MB. Starfall
Bay (w5) with the speck rule: 494k / 695k / 1,585k at 60 / 400 / 1,500 cm (1,677k in the v35 record).
**Gates** (2 Nov, the box quiet): report REPORT_PASS (w1 to w7 atlases 16.0 MB each), gate-glb w7 and w6 GATE_GLB_PASS
and `--block atlas` on both (0 ready, every kind its primitive; w7 142 calls and 922k triangles, w6 57 and 265k),
`--plant missing` red as it must be; ⚠️ gate-glb on w7 first went red on `kCrown split is impossible` (near 0, far 0
of 1): the Crown of the World's keepsake lies past the globe's visible cap at the spawn, so it draws nothing either
way. The gate now accepts zero on a globe world (more than n is still impossible) and fails if the globe draws no
model at all. same.sh SAME_PASS (smoke and the w1 near bot byte identical to the Phase 0 baseline: physics never
reads a model or the LOD), react_test REACT_PASS, sign_test SIGN_PASS, `manifest.mjs --check` MANIFEST_FRESH.
**Stamp:** sw.js CACHE `dewball-v36`, ASSET_V and `sw.js?v=` 23 → 24 (⚠️ v35 moved only the CACHE: index.json?v=23
would have kept a phone's old index; v36 ships w5 with them). Not deployed: the deploy script is
`/home/codespace/dewball-drafts/deploy-dewball-v36.sh` (the vault release first, then a files only commit to main).

## The globe's gate signs stand on their fences, 2 Nov 2026 (`dewball-v36`, no credits)

**Seen in the w7 world shots:** the 10 Oct sign fix (`dewball-v27`) left the globe as it was, so every ring's sign
still stood at the rings' shared centre, the start, at twice its need: at 5 m a "4.20 m" banner filled the top third
of the screen, at 22 m "13.0 m" and at 44 m "26.0 m" stretched across the middle, in BOTH builds. **Fixed in
globeSync, drawing only:** as on the flat worlds, a sign stands on its fence at the point nearest the ball, sized by
how far away it is (0.9x to 3.6x its need), just above the gold caps; its chart point and height are kept on the gate
(`sCx`, `sCz`, `sUp`) and shown in `DB_DEV.state().gates`. **Looked at** (world_shots 5 / 22 / 44 m, before and
after from the same frames): the banners are gone; at 5 m the "4.20 m" and "1.20 m" signs stand small on their fences
at the horizon. **sign_test.js now covers the globe** (it skipped it): SIGN_PASS 38 signs (8 on the globe) across 6
worlds; `--plant` (the old planar placement) and the new `--plant-globe` (the old globe placement) both go red. The
test calls `D.sync()` after its steps, because the globe places its signs in globeSync, which a step does not run.
same.sh SAME_PASS, react_test REACT_PASS.

## Play readiness: the Play app guard, the privacy page, the manifest id, 2 Nov 2026 (`dewball-v36`, no credits)

`node scripts/twa_ready.mjs dewball` was red three ways: SWS_EXIT had no Play app guard, no privacy page, no manifest
id. **Fixed the Hues way:** a TWA test at boot (document.referrer `android-app://`, or an installed Android standalone
window) sets `SWS_IN_TWA`; inside the Play app the Sunbeam SDK is never loaded (it lazy loads Firebase; every Sunbeam
call already tests `window.Sunbeam`), SWS_EXIT refuses, the "Sky Wolf Studio Arcade" button is hidden, the feedback
fab is not loaded, and the service worker's offline page drops its "Back to the arcade" link. `privacy.html` (the
Shutterbug and Hues pages' shape: what `dewball_save` and the song unlock keys hold, the files and songs from
lucidwinds.com, the web copy's Sunbeams and feedback form; the email inside the `email_off` fence), manifest
`"id": "./"`. **After:** every gate green; the offline cold launch (`scripts/_offline_check.mjs`, which now launches
with SwiftShader and, when a menu draws no canvas, taps the first open world card offline) opened Crumb Country with
the network off (looked at: the ball, the crumbs, the HUD, the first hints). same.sh SAME_PASS, sign_test SIGN_PASS.
Still his: price, listing copy, the landscape only manifest, and the store pictures from the real game.

## Either way round, sideways recommended, 2 Nov 2026 (his call; NOT in dewball-v36, for the next release)

Stephen: "they should be able to play either way but its recommended in landscape". The manifest's `orientation` is
`any` (it was `landscape`, which would have locked the Play app and an installed copy sideways). The rotate tip now
shows in portrait on a touch screen whether or not the game is installed; installed (the Play app included) it reads
"Dewball plays best sideways. Turn your phone for a wider world." (no browser bar to promise away); in a browser it
keeps the horizon mode line. The iPhone install note no longer says it opens in landscape. copy_check COPY_PASS,
same.sh SAME_PASS. Ships with the next stamp (v36's deploy script is pinned to `afa458f65`, before this).
