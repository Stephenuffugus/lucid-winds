# DEWBALL, THE TOP TIER PLAN (9 October 2026)

Written by Fable for Opus, from the code, the shots, the memory and the Director's words. Stephen decides, Fable
plans, Opus builds, Astra (an outside model he likes for UI) suggests. Nothing in this file is built yet.

**His words, 9 Oct 2026, verbatim:** "im also thinking of having you put together a massive plan to have opus use my
meshy premium and blender to really make dewball and incredible standalone game that looks super good and i can
publish it soon to" and "write the dewball plan first, then fretwork make it damn good. i should be able to open a
session and give opus a prompt youll write to point it at the plan and have it work all day getting this to seriosu
top tier quality. we can also have chat gpt astra take a look and offer suggestions first if it will improve
gameplay, assets, ui, ux, or anythign else".

**The one sentence:** Dewball becomes a standalone, store listed, 3D katamari that looks like a toy shop fell on a
picnic, runs at 60 on his Pixel 9, and every pickup, structure and creature in it is a real modelled thing instead
of a stack of primitives, built through Meshy and Blender under measured budgets, world by world, each world looked
at before the next.

---

## 0. READ THESE FIRST, IN THIS ORDER

1. `/workspaces/lucid-winds/START-HERE.md`, the top block (what is live, what is broken today).
2. `satellites/dewball/DESIGN.md`, all of it. The tuning law (section "THE TUNING LAW"), the readability laws,
   the cold start law and the gate prize law are not suggestions. The game has eaten three unwinnable worlds and a
   whole day of "what just hit me" to learn them.
3. `satellites/dewball/LANDMARKS.md` and `satellites/dewball/AUDIT-NOTES.md`: how the landmark tier was measured,
   and how every instrument in that folder was once driven wrong.
4. `satellites/ripcord/docs/FORGE3D.md`: the mesh pipeline that already works in this repo (Meshy to Blender to
   glTF to gltfpack), with `tools/forge3d/meshy_api.py` (the API driver with the double spend ledger) and
   `tools/forge3d/meshyfit.py` (the Blender fit script). You will copy the shape, not the code.
5. `OPUS-PACKETS-SEP21.md`, "Laws for every packet" and "PACKET H" (the first cut of this work; this plan replaces
   it and keeps its four steps).
6. This file, then `plans/dewball/OPUS-START-PROMPT.md` is what he pastes to you; it points here.

Memory notes the plan leans on (the lead has them; the names are for Fable, not for you): the 3D handoff's W1
budget numbers, the LOAF cat's gltfpack scar, the Tumble Meshy scars, the chameleon's "nobody played a clean
round", "a tick eats the world", "pale on pale three times", "one loud player flattened the game".

---

## 1. WHAT DEWBALL IS TODAY (measured 9 Oct, not remembered)

- `satellites/dewball/index.html`, 390 KB, ES5, one file, three.js r147 UMD vendored (`three.min.js`, 608 KB).
  Installable PWA (`manifest.webmanifest` landscape, `sw.js` network first, offline fallback only; `CACHE` stamp
  and the `sw.js?v=` in index.html bump together, currently v9 per the August note, read it from the file).
- **195 prop kinds declared** as `K("id","Name",sizeCm,[parts])`: part lists of primitives (cyl, box, tor, sph,
  cone) with vertex colours, merged into one BufferGeometry per kind and drawn as one InstancedMesh per kind.
  **185 kinds are used** across the worlds. No textures, no GLB path, no GLTFLoader vendored.
- **Seven worlds** (`var WORLDS=[` at about line 2130), each with its own kinds, scatter counts, set pieces,
  size gates, movers, keepsakes, landmarks, sky gradient, fog and procedural ground:

| world | kinds | scattered instances | catalogue sizes | start to goal |
|---|---|---|---|---|
| w1 Crumb Country, a giant picnic blanket | 43 | ~5,500 | 1.6 cm to 130 cm | 4 cm to 24 cm, 2:45 |
| w2 Toybox Peaks, concentric playroom | 31 | ~2,100 | 3.2 cm to 2 m | 8 cm to 70 cm, 3:05 |
| w3 Night Garden, concentric garden | 29 | ~2,000 | 4.5 cm to 4.3 m | 15 cm to 1.7 m, 3:25 |
| w4 Bazaar Lane, concentric market town | 32 | ~1,800 | 8 cm to 10 m | 30 cm to 3.4 m, 3:30 |
| w5 Starfall Bay, concentric beach and harbour | 39 | ~2,100 | 30 cm to 19 m | 60 cm to 16 m, 3:00 |
| w7 The Whole World, the 129 m planet | 71 | ~4,600 | 6 cm to 34 m | 45 cm to 22 m (44 m for three stars), 5:00 |
| w6 Dream Meadow, endless zen | 43 | ~1,600 | 1.6 cm to 9 m | 20 cm to no end |

  (Instance counts are the sum of `n:` in each world's scatter lists; set pieces, walls, landmarks and movers are
  on top. Sizes are the `K` catalogue sizes in cm; the game's unit is the cm.)
- Also in the folder: 11 landmark structures (the August tier), 16 plus set piece helpers, 11 mover types
  (chase and flee creatures and vehicles), 25 named keepsakes with beacons, size gates with sinking fences and
  billboard signs, dual stick touch plus WASD plus gamepad, dew dash, a 25 entry ladder of size facts, skins,
  stars, Sunbeam earnings, Horizon (fullscreen landscape) mode, Invert Y, Add to Home Screen.
- Instruments in the folder, all Node and all able to fail when driven right: `smoke.js` (engine plus the per
  world pickup ladder), `balance.js` (a bot plays a world; one world per run, two RNG streams), `perf_ab.js`,
  `variety_audit.js`, `landmark_shots.js` and `edge_shots.js` (player camera shots through headless Chrome with
  SwiftShader; ONE world per run on this box or the renderer is OOM killed), `axis_probe.js` (real key events
  through readInput), `save_audit.js`, `globe_horizon.js`, `node_harness.js`.
- Live at `https://lucidwinds.com/satellites/dewball/` (the `/dewball/` path is a 404). Portal card present.
- Art today: none. Every prop is primitives, the ground is a procedural canvas pattern, the sky is a gradient
  with fog. `satellites/dewball/ART_ASSETS.md` lists the four plate files the image lane owes (ground per world,
  sky equirect, world cards) and `art-drop/` holds only a README. `art-asset-lists/dewball/` is a list of 21 2D
  sticker sheets that were never made.
- What the Director has said about it, in order: "almost awesome" (controls were wonky, fixed), "I want a lot
  more detail and structure" (the v2.4 and v3.x scale ups), "my daughter already thinks it is the best one",
  "when we get to the larger sizes it's not just a bunch of redundant same little things" (the landmark tier),
  "Dewball is a release candidate, with a ton of great assets made through Meshy premium" (21 Sep).
- The shots this plan was written against are in `docs/briefs/dewball/` (world 1 from the player camera, made
  with `landmark_shots.js` on 9 Oct, opened and looked at). Fable's three faults, named before anyone else does:
  the props are honest primitives with silhouettes (the gramophone is a cone on a box, the book tower is nine
  slabs on a plinth) and they read as toys at arm's length but as coloured blocks past about ten ball diameters,
  which is most of what a player sees; the sky is an empty peach gradient and the horizon is a hard line where
  the orange fog meets the checks, so there is no picture anywhere above the table; and the fog pulls the whole
  far field to one orange tone while the huge saturated red checks swallow red props (a ladybug on a red square
  is a dot), so the ground competes with the food it is meant to seat. What is right and must stay: the HUD is
  two numbers and a clock, the ball reads instantly, the blob shadows seat everything, the gates read from far.

**What is NOT wrong and must not be touched by this plan:** the pickup ratio ladder, the volume growth, the
clocks, the gate needs, the scatter counts, the camera numbers, the control mapping. Every one of those was tuned
on device and by the bot. A mesh that changes a prop's bounding size changes the ladder (section 5.4).

---

## 2. THE BAR, WRITTEN SO IT CAN FAIL

"Top tier" is a feeling, so here it is as numbers and looks that a gate or a human can refuse.

**Look.**
- Every kind a player can meet at or above a third of a world's goal diameter is a modelled thing with a texture,
  not primitives. That is the "big food" set that fills the closing minute of every world (the LANDMARKS.md
  measurement) and it is where "a bunch of redundant same little things" was felt.
- Every landmark and every set piece anchor is modelled. A landmark is a thing you steer toward for a minute; it
  must survive being looked at.
- Every mover (the dog, the hedgehog, the bazaar cat, the crab, the RC car, the camel, the boat, the car) is a
  modelled creature or vehicle with at least a two pose bob or a wheel spin. A creature that slides is a box.
- The tiny stuff (under a tenth of the start diameter of its world, crumbs, seeds, beads) may stay primitives,
  because at that size on a phone it is three pixels and a modelled crumb is credits set on fire.
- One art direction across all worlds. The DESIGN art pack recommends "Paper Lantern Parade", a papercraft
  cutout world. For modelled 3D the honest translation is **toy shop katamari**: chunky, rounded, bright,
  saturated, soft bevels, painted textures with no baked lighting, no text, no logos, nothing photoreal. The
  readability law stands: BRIGHT beats moody; never a dark on dark world.
- A sky with a picture in it and a ground that seats the props (the ART_ASSETS plates; his image lane or a
  generated equirect; see 6.3).

**Feel.** Unchanged. The controls, camera and growth are tuned; the plan adds juice (6.2) and takes nothing.

**Performance, on the Director's Pixel 9 and in the perf probe (4x CPU throttle, the biggest world):**
- Median frame under 12 ms, 95th percentile under 20 ms, in w7 at mid size with the near field full.
- Draw calls at most 2x today's count per world; triangles on screen at most 3x today's; textures at most
  24 MB on the GPU in any world; the whole game under 30 MB precached, under 12 MB before the first world opens.
- These are the W1 numbers from the 3D handoff, chosen before this plan, and they are the fence.

**Polish.** The new game standards (readable fonts that match the style, correct grammar, no dashes and no
exclamation points in anything a player reads, one sentence description, directions and objectives shown BEFORE
play), 48 px rendered touch targets at 375x667 and at his 412x915, a results screen that says why, a world select
with pictures, and an install that cold launches offline.

**Store.** `node scripts/twa_ready.mjs dewball` green, a privacy page, a Play package, a listing in plain text,
and his one price across stores (his call: free with cosmetics like today, or a one time price like Tumble).

---

## 3. ASTRA FIRST (optional, his call; it costs a day of his time, not credits)

He wants an outside eye before the build if it improves gameplay, assets, UI or UX. The house process:

1. Fable has written `docs/briefs/ASTRA-DEWBALL-BRIEF.md` (and its `.txt` twin for upload) in the Hues brief
   shape: the game in two minutes with REAL constants, what is on screen today (the shots at
   `https://lucidwinds.com/docs/briefs/dewball/`), the questions, and the one file answer format ending in a
   json block. It points Astra at the EXACT URL and says nothing else on the site is under review.
2. Stephen uploads the brief to Astra, plays the live game in a phone window, and brings back the file.
3. Fable reads it: verbatim first, then sorted fault / taste / already known, every direction validated against
   the code and the shots. What survives becomes section 6 tickets in this plan (an amendment commit, dated).
4. Opus never reads Astra's file directly and never builds a direction Stephen has not seen in the plan.

If he skips Astra, the plan stands as written; section 6 holds Fable's own UI and UX tickets.

---

## 4. THE ASSET PIPELINE (Meshy to Blender to gltfpack to the game)

### 4.1 Tools to build, under `satellites/dewball/tools/forge/` (copy the ripcord shape, not its code)

| file | what it does | precedent |
|---|---|---|
| `manifest.mjs` | reads `index.html`, lists every kind with name, catalogue size, which worlds use it and how many instances, whether it is a landmark, set piece anchor, mover, keepsake or gate prize; assigns a TIER (4.3) and a triangle budget (4.4); writes `MESHY-MANIFEST.md` (human) and `manifest.json` (machine). Spends nothing. | Packet H step 1 |
| `meshy_api.py` | drives Meshy over the API from the manifest: text to 3D preview then refine, or image to 3D when a reference image exists; sequential; the DOUBLE SPEND LEDGER (`meshy-tasks.json`: the task id is written the instant the POST returns, a rerun resumes that task); every non 200 printed verbatim; stops on the first failure; checks `/openapi/v1/balance` before the first POST and writes the number to the report. | `satellites/ripcord/tools/forge3d/meshy_api.py` |
| `dewfit.py` (Blender, `blender -b --factory-startup -P`) | makes a Meshy sculpt a Dewball PROP: weld by position (Meshy GLBs are triangle soups), recentre, origin at the bottom centre, scale so the bounding size equals the catalogue size EXACTLY (the ladder depends on it), decimate to the kind's budget with the texture kept, cap the texture to the tier size, name the material `dw_<kind>`, export glTF +Y up. Lists unknown file names, never guesses. | `satellites/ripcord/tools/forge3d/meshyfit.py` |
| `atlas.py` (Blender) | per world, bakes every fitted kind's base colour into ONE atlas (2048 square, 4096 for w7 only if the budget allows) and rewrites UVs, so a world has one material and the InstancedMesh per kind keeps its single draw call. | new; the LOAF cat baked position and region maps the same way |
| `pack.sh` | `gltfpack -cc -kn -km -kv -noq` per file. `-kv` is mandatory: gltfpack strips TEXCOORD_0 when no material references a texture (the LOAF scar). `-noq` because quantisation broke a skinned mesh once. | FORGE3D.md |
| `report.mjs` | triangles per kind against budget, bounding size against catalogue size, texture bytes per world, total bytes; red on any miss. | `tools/forge3d/report.json` |
| `gate-glb.mjs` | in the shape of `satellites/tumble/dev/gate-glb.mjs`: every file the manifest names exists, parses with the vendored loader in headless Chrome, and a manifest naming a missing file goes RED. Watch it fail first. | Packet H step 2 |

Blender is not on the box today. `apt-cache policy blender` offers 4.0.2 and sudo works: `sudo apt-get install -y
blender` (about 600 MB with dependencies; the disk has 6.5 GB free, the machine has 7 GB of RAM and one physical
core, so headless fits of one prop at a time are fine and a whole world at once is not). gltfpack:
`npm i -g gltfpack` or the meshoptimizer release binary. Verify both with a version print before the first fit.

### 4.2 Meshy settings (from the API docs read 9 Oct 2026, docs.meshy.ai)

- Base `https://api.meshy.ai`, header `Authorization: Bearer $MESHY_API_KEY` (the key is on the codespace as an
  environment variable; never print it, never commit it, never put it in a report).
- Balance: `GET /openapi/v1/balance` returns `{ "balance": n }`. **9 Oct 2026, 15:40 UTC: 4,120 credits.**
  Balance and upload calls do not count against the queue limit.
- Rate limits for his tier: 20 requests a second, 30 concurrent queue tasks (Premium). The driver still runs
  sequentially: the budget guard matters more than the throughput.
- **Text to 3D** (`POST /openapi/v2/text-to-3d`): two steps. `mode: "preview"` makes the mesh from `prompt`
  (800 characters max), `mode: "refine"` with `preview_task_id` paints it (`texture_prompt`, `enable_pbr`
  false, `texture_resolution` "2k", `remove_lighting` true so the texture carries no baked light). Fields that
  matter for props: `model_type: "smart-topology"` with `ai_model: "meshy-t2"` and `target_polycount` in the
  100 to 15,000 range (default 4,000) gives game ready low poly meshes; `standard` with `ai_model: "meshy-7.1"`
  gives the prettier sculpt at 30,000 that `dewfit.py` then decimates. Pilot BOTH on the same five kinds and
  keep the one that looks better after decimation (4.5). `origin_at: "bottom"` with `auto_size`, `target_formats:
  ["glb"]` only (the default makes every format and wastes time). `symmetry_mode` and `art_style` are
  deprecated and do nothing; do not send them.
- **Image to 3D** (`POST /openapi/v1/image-to-3d`): `image_url` as a data URI, the same model and polycount
  fields, `should_texture` true, `texture_prompt` optional. The Tumble scar: image to 3D from a good reference
  beats a text prompt. When his image lane has a reference for a kind, use it.
- Status by `GET .../:id`, poll every 10 s or use the SSE stream; `SUCCEEDED` carries `model_urls.glb`,
  `thumbnail_url`, `consumed_credits`. Asset URLs expire (`expires_at`); download at once into `meshy-out/`
  and never rely on the URL later.
- Rigging (`/openapi/v1/rigging`) is HUMANOID ONLY. Dewball's movers are animals and vehicles, so no rigging and
  no Meshy animation: a mover gets a two pose bob or a wheel spin done in Blender or in code (4.6).
- Credits: the docs do not price a task. The ripcord run is the measurement: 44 image to 3D sculpts with
  texturing cost about 1,410 credits, about 32 each. Plan on **35 credits per kind including one re roll in
  four**, so the 4,120 on the account is about 115 kinds this month. The manifest tiers decide which 115.
- Insufficient credits is a 402; a FAILED task refunds itself; deleting a PENDING task refunds; deleting a
  finished task does not. The ledger prevents the only expensive mistake, paying twice for one prop.

### 4.3 Tiers (the manifest assigns them; Stephen can move a kind by name)

| tier | what | treatment | credits |
|---|---|---|---|
| A, the faces of the game | all 11 landmarks, every set piece anchor, every mover, every keepsake, every gate prize, the ball skins' hero props | Meshy, standard model, decimated to the A budget, 512 texture | first; about 60 kinds |
| B, the big food | every kind at or above a third of its world's goal diameter that is not already A | Meshy, smart topology, B budget, 256 in the atlas | second; about 55 kinds |
| C, the mid food | between a tenth of the start diameter and a third of the goal | Meshy only as credits allow after A and B of every world are in; else primitives with the C treatment (4.7) | last |
| D, the crumbs | under a tenth of the start diameter | primitives, the C treatment, never Meshy | none |

Kinds shared across worlds are made once and credited to the first world that uses them.

### 4.4 Triangle and texture budgets (per instance on screen, before instancing)

| tier | triangles | texture |
|---|---|---|
| A landmark | 4,000 (one or two on screen) | 1024 own texture, or 512 in the atlas |
| A set piece anchor, keepsake, gate prize | 1,500 | 512 |
| A mover | 1,200 | 512 |
| B | 600 | atlas 256 |
| C (if ever Meshy) | 300 | atlas 128 |

The fence is the world total, measured by `perf_ab.js` and the frame probe, not the per kind number: w1 scatters
5,500 instances. A 600 triangle B kind with 300 instances in the near field is 180,000 triangles for one kind.
**The LOD rule (4.6) is what makes the budget true**, not the per kind numbers.

### 4.5 The pilot (about 180 credits, then STOP for his yes)

Five kinds from w1, chosen to cover the tiers: the Cake Table's cake (gate prize, A), the teapot or the picnic
basket (set piece anchor, A), the hedgehog or the ant (mover, A), the sandwich (B, big food), the teacup (B, the
most scattered mid food). Each: text to 3D in both model types (ten tasks, about 160 credits), fitted, packed,
loaded in the game through the new path, shot from the PLAYER camera at the size a player meets it, at 412x915
and 360x740, beside the primitive it replaces. Open every image. Name three faults per pair. Put the pairs in
`docs/briefs/dewball/pilot/` and a line on the board. **The batch waits for his yes.** If he says no to the
look, the prompt recipe changes, not the plan.

### 4.6 The game side (code in `index.html`, ES5, one file; the house style stays)

- Vendor the r147 GLTFLoader UMD beside `three.min.js` (`GLTFLoader.js` from the r147 release's `examples/js/
  loaders/`), stamp it in the worker precache, and load it lazily after the first world opens.
- `assets/3d/<world>/<kind>.glb` plus `assets/3d/<world>/atlas.jpg` (or `.webp` where the atlas bake proves it
  smaller at equal look; probe both). Fenced under `satellites/dewball/assets/`; `git add` by path.
- **Primitive fallback forever**: a kind whose GLB is missing, fails to parse, or has not arrived yet draws
  exactly as today. The game must never wait on a mesh and never show a hole. The gate proves the fallback by
  renaming one file and watching the scene still render.
- **LOD by ball relative distance**: each kind keeps TWO InstancedMeshes, the Meshy mesh for instances inside
  about eight ball diameters of the camera target and the primitive mesh beyond it (the far field already
  reprojects on alternate frames; its look is three pixels). Instances move between the two sets as the ball
  rolls, counts rebalanced per frame from the same positions, no new geometry per frame. Attached (picked up)
  items use the Meshy mesh while they are visible on the ball and are pruned as today once buried.
- One material per world (the atlas) so draw calls stay one per kind per set: at most 2x today's count.
- Movers: a two pose bob (scale y and a slight pitch on a sine, done in the per frame update) for creatures, a
  wheel spin for vehicles (the wheel is a separate mesh in the fit, named `wheel`), nothing skinned.
- The blob shadow stays. No shadow maps (the perf budget). Fog stays, retuned per world if the textures read
  darker than the vertex colours did (the pale on pale scar: a HemisphereLight of sky over ground means the
  colour you choose is not the colour that lands; check every world's props against its ground, rim and fog in
  HSL and flag anything within a small distance).
- The size ladder is sacred: `dewfit.py` scales every mesh so its bounding size equals the catalogue size, and
  `smoke.js` plus `balance.js` run for that world after its batch lands. A world whose bot numbers move by more
  than ten percent stops the line until the cause is named.

### 4.7 The C treatment (no credits; makes the leftover primitives belong with the meshes)

Kinds that stay primitives get a light pass so they sit in the same world as the modelled ones: a soft bevel
look through a second, slightly inset vertex colour band on each part; the same palette limits as the atlas
(so a procedural apple and a modelled apple share a red); a tiny baked AO tint at part joins. All of it is in
the part list builder, so it costs one function and applies to 195 kinds at once. Shoot before and after.

### 4.8 Ground and sky (the ART_ASSETS plates)

The hook for `assets/ground-<world>.jpg` exists and wires with zero code. The sky needs the three line equirect
loader ART_ASSETS.md names. Sources, in order of preference: his image lane (FLUX or Midjourney at 1024 square
seamless for ground, 2048x1024 for sky, the sizes in ART_ASSETS.md, never over 1600 px a side on the host); a
Blender procedural bake (Cycles, a noise driven cloth or carpet material rendered to a seamless tile) when the
image lane has nothing; never a photo. Generated art is never called hand painted.

---

## 5. WHAT COULD GO WRONG, ALREADY KNOWN (read before the first generation)

1. **A mesh changes the size of a prop and the ladder breaks.** The catalogue size is the law; the fit scales to
   it exactly; smoke and balance run per world; the bot's time to goal is compared to the numbers in DESIGN.md.
2. **Meshy inflates flat things** (plates, cards, rugs, coins): fit with `--flip` and `--axis` like ripcord, or
   keep the flat kinds procedural. **Meshy GLBs are triangle soups**: weld by position before decimating or the
   decimate shreds.
3. **Credits spent twice.** The ledger. Never kill and rerun a generation; resume it.
4. **A full seven world shot run OOM kills the renderer** on this box. One world per run, always.
5. **Two cores are one.** One browser at a time, one Blender at a time, no agent fan out, gates one at a time.
6. **`clone()` shares geometry** in three.js; a kind's geometry is edited once and instanced, never cloned per
   instance.
7. **A tick eats the world.** The shot rigs park the ball and tick once at the end; never tick inside a sweep.
8. **Pale on pale, three times running.** HSL distance check of every new texture's dominant colour against its
   world's ground, rim, fog and sky, before the world is called done.
9. **No emoji fonts on this box**: tofu in a headless shot is the harness, not the game.
10. **The host serves `.mjs` as text/plain** and caches everything: runtime files are `.js`, every served file is
    versioned, every probe uses `?probe=$RANDOM`, the live file is compared byte for byte after a deploy.
11. **The service worker is network first** and stays so; the `CACHE` stamp and `sw.js?v=` bump together on
    every shipped change (both, or a phone keeps the old copy of one).
12. **One loud player.** Tuning goes on device evidence and bot numbers, never on one complaint; this plan does
    not touch tuning at all.
13. **A gate you have not watched fail is decoration.** Every new gate (glb, perf, report) is shown red on a
    planted fault before its first green counts.
14. **Wiring art is not seeing art.** Nothing is called done until the image is open and three things wrong are
    written down.

---

## 6. BEYOND ASSETS: WHAT ELSE "INCREDIBLE" NEEDS (Fable's tickets; Astra may add, Stephen decides)

### 6.1 Onboarding and copy (new game standards)
- A directions card BEFORE the first world: how to roll, how the camera stick works, what sticks and what
  bounces, what a gate is, what a keepsake is. Five lines, pictures from the real game, one tap to play.
- One sentence description everywhere: "Roll a sticky ball through seven worlds and grow from a crumb to a
  planet." (his edit welcome).
- Every string swept for dashes and exclamation points; a `copy` check added to `smoke.js`.

### 6.2 Juice, within the perf fence
- Pickup: a 120 ms squash on the ball, a six particle puff in the prop's colour, a pitch stepped tick that rises
  with the combo (the sound exists; make it climb).
- Size facts: the 25 fact ladder already fires; give it a card with a silhouette comparison instead of a toast.
- Gate open: the fence sinks today with a gold flash; add the camera lifting a hair and the sign flipping.
- Knockback: the red flinch exists; add the three lost props arcing off with their own tiny shadows.
- World clear: a slow orbit of the ball with everything it ate, three stars landing one by one, the keepsakes
  shown by name. This is the screenshot people share; make it one.

### 6.3 UI
- World select: a card per world with its painted vignette (ART_ASSETS card plates), the star count, the best
  size, the keepsakes found of five. Locked worlds show their unlock rule in words.
- HUD: the size readout and the clock are the two numbers; everything else fades after three seconds idle.
- Results: why the stars landed where they did, in one line each.
- Settings: Invert Y, Horizon mode, sound and music sliders (the Petri pattern from 9 Oct: a slider at 0 is off,
  a new phone starts with sounds under the music), haptics, reduced motion.
- Every target 48 rendered px at 375x667; thumb reach shots at his 412x915 with a thumb drawn on.

### 6.4 Audio
- Music lane: his tracks, never in git, served from the private music repo through `music-unlocks.js` the way
  Tumble and Petri do, one track per world mood, starts on the first tap, a slider.
- Sound: the synth recipes exist; a pass for pickup, bounce, gate, knockback, keepsake, star, with the mixer's
  crowd and far gain rules.

### 6.5 Retention, only if his call
- A daily world seed (the fixed seed per world is the speedrun law; a daily is a second seed, labelled).
- Ball skins and trails from the cosmetic economy that exists. No new currency, no timers, no ads.

---

## 7. STORE READINESS (the last phase; nothing here before the look is done)

- `node scripts/twa_ready.mjs dewball` green: no payment surface, portal exit disabled inside the TWA, privacy
  page at `satellites/dewball/privacy.html`, icons, manifest, the start URL fixed.
- Orientation: the PWA manifest says landscape. Play's TWA takes the manifest; the Director decides whether
  Dewball lists landscape only (the game's own call from July) or both.
- Package: the SWS-apps Play layer (`design/play.mjs`, `play:check`, bubblewrap; the four Play listings so far
  came through it) or Packet D's factory in this repo; JDK 21 for signing (Play rejected a JDK 25 signed
  bundle); the stamp bumped in every place the host caches.
- Listing copy in plain text, no dashes, no exclamation points, one sentence description, the age rating
  questionnaire, a feature graphic made from the world clear screenshot, eight phone screenshots at 412x915
  from the real game (the shots the look phase produced).
- Price: his call, one price across stores. Pi copy later, the Tumble way (dewball-test and dewball hosts, the
  Worker, the five testers), after Play.

---

## 8. THE DAY PLAN FOR OPUS (phases in order; each ends with evidence, a commit, a push and a board line)

Each phase names its gate. A phase is not done until its gate was seen red once and green once, its shots are
open and three faults are written, the commit is pushed to `add-sproing-jumper` AND to `main` (the arcade
deploys main), the live file is read back with a random probe, and the board has the line.

**Phase 0, read and measure (no credits, about 1 hour).**
Read section 0. `git status -sb`. Run `smoke.js` for every world and `balance.js 1 12345 <n> near` for w1 only,
and write the numbers down as the baseline. Run `perf_ab.js` on w7 and write the median frame, draw calls and
triangles as the baseline. `curl` the Meshy balance and write it in `satellites/dewball/FORGE.md` (new, the
running log of this build). Build `tools/forge/manifest.mjs` and commit `MESHY-MANIFEST.md`: every kind, tier,
budget, worlds, instances, credit estimate per tier and for the whole list. Report the manifest totals.

**Phase 1, the loading path (no credits, about 2 hours).**
Vendor the r147 GLTFLoader. The lazy loader, the primitive fallback, the two set LOD, the atlas material slot,
the worker precache entries. `gate-glb.mjs` watched red (a manifest naming a missing file) then green (an empty
manifest). Perf probe on w7 before and after with nothing loaded: the numbers must not move.

**Phase 2, the pilot (about 180 credits, then STOP).**
Section 4.5. Install Blender and gltfpack first and print their versions. Ten tasks, the ledger, the fits, the
pack, the report, the shots beside the primitives, three faults per pair, `docs/briefs/dewball/pilot/`, the
board line, the balance after. **Stop and wait for his yes.** While waiting: the C treatment (4.7) and the
directions card (6.1), both free.

**Phase 3, world 1 complete (about 900 credits).**
Tier A then tier B of w1 (the manifest says which; roughly 25 kinds), the atlas bake, the pack, the report,
`smoke.js` and `balance.js` for w1 against the baseline, the perf probe on w1, the player camera shots at the
three sizes a player passes through (spawn, the first gate, the goal) at 412x915 and 360x740, and the worst
angle on purpose (into the fog band, under the blanket's edge, into the sun gradient). Three faults, fixed or
listed. Deploy. Read back. Board.

**Phase 4, worlds 2 to 7, one at a time, the same shape (about 2,500 credits across them; w7 last and biggest).**
Never two worlds in flight. Each world's batch is gated, shot, measured and deployed before the next begins.
The credit balance is written at the start and end of each world. When the month's credits run out, the plan
pauses at a world boundary with the manifest marking what is left; it does not borrow from tier C.

**Phase 5, the look beyond props (no credits).**
Ground and sky plates through the hook (4.8), the juice list (6.2), the UI tickets (6.3) as amended by Astra,
sliders and audio (6.4), copy sweep (6.1). Shots of every screen at both sizes, looked at.

**Phase 6, store (no credits).**
Section 7. Ends with the Play package in his hands and the listing text in a file he can paste.

**Timing, honestly:** Phase 0 and 1 are a morning. The pilot is an afternoon plus his yes. A world is a day
each with the look done properly, w7 two. Phase 5 is two days, Phase 6 one. Three weeks of builder time at
one world a day, less if his yes comes fast and the recipe holds from w1. Meshy's month of credits covers
about 115 kinds; the manifest will say whether tier C waits for next month.

---

## 9. EVIDENCE OPUS REPORTS AFTER EVERY PHASE (and never summarises away)

- The gate's last line, verbatim, red run and green run.
- The shot paths, and the three wrong things per shot with what was done about each.
- The perf numbers against the baseline and the fence.
- `smoke.js` and `balance.js` lines for any world touched, against the baseline.
- The Meshy balance before and after, and the ledger's task count.
- The commit hash on main and the byte for byte read back of one changed live file with its probe.
- The questions only the Director can answer, as a numbered list, nothing else.

---

## 10. HIS CALLS (the plan proceeds under the first option until he says otherwise)

1. Astra pass first, or straight to the pilot. (Default: the pilot proceeds; Astra's directions amend Phase 5.)
2. The art direction: toy shop katamari as written, or the papercraft cutout look from the July art pack
   translated into flat, double sided, modelled cards. (Default: toy shop.)
3. Price on Play: free with cosmetics as today, or one time like Tumble. (Default: unchanged, free.)
4. Orientation on Play: landscape only, or both. (Default: landscape, as the PWA manifest says.)
5. Credits this month: spend the 4,120 down to a floor he names, or a cap per world. (Default: pilot plus w1,
   then a line on the board with the balance before each later world.)
6. Which world after w1: in order (w2) or the finale (w7) for the trailer. (Default: in order.)

---

## 11. WHAT THIS PLAN DOES NOT DO

- It does not retune a single number the bot or the device tuned.
- It does not add a system (no new currency, no timers, no ads, no multiplayer, no new worlds).
- It does not rig or animate characters through Meshy (humanoid only; Dewball has none).
- It does not call the art hand painted, anywhere, ever.
- It does not run two of anything on this box at once.
