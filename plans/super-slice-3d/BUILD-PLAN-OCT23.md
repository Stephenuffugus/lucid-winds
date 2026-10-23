# Super Slice 3D build out: the plan (for Opus to build)

**Trigger:** Stephen says "build Super Slice" (or points you here). Read `CLAUDE.md` first (the laws), then this file top
to bottom, then start at Part A, or wherever the state block says. Written 2026-10-23 by the Fable lead session that
checked Astra's return against the brief, looked at the art, read the live code and vaulted the drop. Every fact in
sections 2 and 3 was read in the code or seen in the pictures, not assumed. Astra's numbers (effort, budgets, frame
rates) are proposals; the gates below are what counts.

---

## 0. State block (update IN THE TURN you finish a part)

- 2026-10-23 (Fable): plan written. Nothing built. Live is **v6.0** (portal card `/satellites/slice-3d/?v=20260821a`,
  sw `sw.js`). Astra's zip is at `assets/Super_Slice_Dev_Handoff.zip` (git ignored, 86 MB) and vaulted as
  `vault-20261023-super-slice-astra` in the PRIVATE repo `Stephenuffugus/lucid-winds-vault` (SHA256SUMS.txt beside it).
  Extracted copy for reading only: `/tmp/claude-1000/ss/drop/` (the /tmp disk is wiped at every codespace stop; re-extract
  from the zip, never from memory).

---

## 1. What Stephen asked for, verbatim, and what "good" means

- 23 Oct (the brief that went to Astra, his words 03:25 UTC): "I'd also like to kind of expand it on our original game
  designing ideas, so there's a nice chunk of fun unique assets in there."
- 23 Oct (this plan's trigger): "here is everything from astra for super slice you are to plan all the work for opus to
  actually execute and implement all of this impeccably ... have them perfectly build this out."

"Good" means: the live game stops being flat hex spheres in a brown shaft and becomes the eight painted worlds Astra
drew, with every one of Astra's priority 1 directions built, the four modes keeping their identity, nothing he already
priced or wired changed, every part shipped only when its gates are green and looked at, and his open calls left open
(section 3.4), not guessed.

## 2. The game today (`satellites/slice-3d/index.html`, 2588 lines, one page of vanilla JS over a vendored three.js r14x
from 2022, `three.min.js` 600 KB; the headless suite `audit-check.mjs`, 372 lines, is the gate that must stay green)

Read the whole file once before touching it. Anchors (line numbers from v6.0, drift after edits):

- `BUILD="v6.0"` 250. Stage 540x960 scaled by `fit()` 277 (visualViewport, never innerHeight). `LS` 281, `readObj/readInt`
  290 (the corrupt save guards from the Aug 16 audit: KEEP). Saves: `s3d_prog` (`PROG` 294: level, ffLevel, climbLevel,
  climbBest, endlessBest, bestCombo, slabsCut, cleanDives, best{}), `s3d_slivers` 615, `s3d_skins` 617 ({owned, equip}).
  `saveProg` 307 merges max/add fields so two tabs never clobber. Sunbeams: `_sbCapEarn` 32 (30/day), 2 per level,
  `sbSession` cap 12 (491, 2423): NEVER change.
- Physics: `GRAV=52, TAPVY=18.2, RUNVX=9.5, TAPW=-12.5, KR=1.5` 439; Freefall `GRAV_FF=21, FF_TERM=19, FF_STEER=30,
  FF_SPIN=17, FF_MAXW=7.5` 488; `KSCALE=0.55, KLEN=6.0*KSCALE, KHH=1.3*KSCALE` 461 (the drawn size IS the hit size:
  `measureKnife` 464). Do not change any of these numbers. The loop 1853: variable `dt=Math.min(0.05,...)` 1855.
- Knife: `SKINS` 552 (22 skins built from `kbox` boxes 543, blade left centred at x=-1.6, `stdGrip` 545), `SKIN_ORDER`
  605, `buildKnife` 650, `paintKnife` 639, `applySkin` 649, `drawSkinIcon` 2474, forge 2483 to 2522, `_S3forge` 2510.
  Trophies: `grantTrophy` 609 (one door; returns the name to print). Slivers: `slivPayout` 2255, `awardSlivers` 2261.
- World: `FRUIT` 503 (16 fruit: r, col, inner, pts, pitch), `WOOD/LEAF/CAP/CRYSTAL` 521, `makeFruitMesh` 710 (a sphere;
  `spawnHalf` 1669 splits it), pieces: `woodBox` 689, `stump` 696, `mushroom` 703, `fruitAt` 737, `branchOver` 756,
  `crystal` 765, `thornAt` 772, `waspAt` 781, `plankAt` 796, `GOURD/GOLDF/PINATA` 806 to 811, `boomAt` 812,
  `table/arch/tower` 842 to 889, `swingFruit` 890. Journey `buildLevel` 899 (bands 1087 `[1,2,3,5,10]`), Freefall
  `FF_WORLDS` 1128 (4 palettes: sky stops, strata stops, wallL, wallR, ledge, rim, tree), `buildFreefall` 1138 (sky plane
  1153 and back plane 1167 are `CanvasTexture` gradients: these are what the painted plates replace; `depth` 1144, endless
  = a 900 deep pit, NOT endless), `buildClimb` 1386 (bands 1402), `newGame/newFF/newEndless/newClimb` 1518 to 1575,
  `doTap` 1576, contacts `sliceFruit` 1706, `hitCrystal` 1735, `ffWall` 1767 (the kill), `ffPad` 1802, `sliceSlab` 1824,
  `ffBonk` 1842, `failLevel` 2274, `finishLevel` 2323 (Pit Conquered today = reaching the bottom of the endless pit).
- Screens: `#s-title` 151 (mode buttons; `#b-endless` 160 is the one the fleet song card covers at boot), `#s-how` 182,
  `#s-forge` 198, `#s-play` 215, `#s-go` 228. `show()` 2433. Attract mode 2444. Dev hook `?dev=1` → `window._S3` 2541
  (newGame, newFF, newEndless, newClimb, tap, stepN...). `window._S3skiprender` 2250.
- Fleet files loaded: `/sunbeam-sdk.js`, `/music-unlocks.js` (the song card), `/arcade-exit.js`, `/feedback.js`. None of
  them is ours to edit.
- Testing law from `AUDIT-NOTES.md` (read it): serve the REPO ROOT on 8777; puppeteer with
  `--use-gl=swiftshader --enable-unsafe-swiftshader --disable-dev-shm-usage`; NEVER wait on networkidle (the rAF loop
  never idles); ONE BROWSER PER CASE (reuse exhausts the 2 core box and reads as a hang); every assertion watched red
  before it is trusted. `node satellites/slice-3d/audit-check.mjs` must pass after every part; extend it, never weaken it.

## 3. Astra's return (what is in the zip, what to trust, what I saw)

### 3.1 Contents (270 images, every requested name present)
`worlds/<id>/` for mossy_canyon, frost_chasm, ember_kiln, glowcave, orchard_loft, lantern_night, deep_tide,
clockwork_well, 14 files each: strata.jpg 512x1024, wall_rock.jpg 512 tile, ledge.jpg 512 tile, slab_face.png 512,
slab_inside.png 512, sky.jpg 1024x512, decor_01..04.png 512, hazard.png 256, hazard_strip.png 1024x256 (4 cells),
boss.png 512, boss_stages.png 1536x512 (3 cells = after cuts 1, 2, 3). `fruit/` card_<16>.png, halves_<16>.png,
rind_atlas.png 1024 (4x4 of 256). `knives/` <32 skins>_sheet.png 1024x256 (blade left, grip right), _icon.png, trail_<32>.png.
`vfx/` juice_splat (8 cells 128), slab_dust (6), sparks_stick (6), confetti (8), rope_cut (4), lantern_burst (6),
pinata_burst (8), chime_ring (4), bubble_pop (4), ice_crack (3 states), score_band.png, bullseye.png. `ui/` title_plate.jpg,
mode_journey/freefall/endless/climb.jpg, forge_frame.png (9 slice), plinth.png, sliver.png, sliver_spin_strip.png (6),
badge_clean_slice/pit_conquered/daily/supporter.png, btn_flip.png, hud_plate.png, app_icon.png, og_card.jpg.
Documents: `BUILD_NOTES.md` (the design review, 36 directions SS01..SS36, engineering contracts, acceptance tests,
build order, knife personalities), `build_actions.json` (the same 36), `world_bible.json` (palettes, materials, bosses,
courses per world), `IMPORT_GUIDE.md` (file → role → placement, the vfx trigger table), `REQUIRES_REWORK.md`,
`manifest.txt`, `asset_catalog.json` (cells, grids, hashes), `asset_audit.json`.

### 3.2 What I saw (contact sheets of mossy_canyon, deep_tide, knives, fruit, vfx, ui, plus a 3x3 tile test)
- The worlds are the best thing in the drop: strata, sky, slab face and inside, decor and bosses are painted, chunky and
  on palette. The wall_rock tiles repeat with a visible but acceptable pattern at 3x3; ledge likewise. USE THEM.
- Boss stages match their boss in costume and scale closely enough to use as three billboard frames.
- The hazard strips do NOT hold a stable silhouette across the four cells (the thorn pod changes shape). Use `hazard.png`
  as the one still, and the strip only as a wobble (scale/rotate the still in code); do not play the strip as frames.
- The knife sheets are NOT on a common rig: the Classic Chef occupies about a quarter of its 1024 width, the Katana
  most of it, others in between; some are drawn at a slant. Treat every sheet as a picture to be measured (alpha bbox),
  never as a rigged sprite. The icons are diagonal compositions, fine for the forge grid.
- The fruit cards are glossy, near photoreal, and read well at 128 px; the halves are two half views at a slight
  perspective; the rind atlas is near invisible (alpha max 107, black detail only): SKIP the rind atlas.
- The vfx strips have uneven cell contents (the splat's 8 cells drift in size); play them as frames anyway with a
  centred pivot and a short life, they read as a burst. `score_band.png` is a cream pill, `bullseye.png` is a clean target.
- UI: hud_plate is a dark rounded bar, forge_frame a 9 slice with corner rivets, plinth a stone disc, sliver a gold curl,
  the mode cards are painted scenes (no text), title_plate a canyon with a knife. All usable.
- Astra's own warnings in `REQUIRES_REWORK.md` are right and are folded into the parts below.

### 3.3 How painted art enters this three.js game (the rule for every part)
Colliders stay exactly what the code says today. The art wraps or faces the camera:
- Repeat textures (`wall_rock`, `ledge`) go on the EXISTING wall and ledge box materials as `map` with `RepeatWrapping`,
  repeat scaled so one tile is about 4 world units; `strata.jpg` replaces the back plane's canvas gradient; `sky.jpg`
  replaces the sky plane's canvas gradient; the world's palette tint stays on anything still untextured.
- Slabs: `slab_face` on the uncut box's faces, `slab_inside` on the two halves' cut faces (the cap), the rest of each half
  keeps `slab_face`.
- Fruit: a camera facing plane (billboard) carrying `card_<fruit>.png`, sized to the fruit's `r`; on a cut the two
  `halves_<fruit>` cells become two billboards that fly apart like the spheres do today. The sphere stays as the collider
  (invisible or very low alpha). Same for pinata, golden fruit, boom gourd (keep their code looks if no card exists).
- Decor: billboards outside the knife corridor (`decor_01..04`), never where a collider is; hazards: `hazard.png` billboard
  on the existing thorn/wasp/urchin colliders. Bosses: `boss.png` billboard, swapping to stage cells 1, 2, 3 as hits land.
- Knife: ONE textured plane per skin, double sided, cut from the sheet by alpha bbox, scaled uniformly so the bbox width
  spans the rig's 12 units (blade half left, grip half right) and the bbox centre sits at the rig's joint; the box meshes
  that exist today become the collider only (transparent). Trails: `trail_<skin>.png` on the existing trail path, alpha
  capped at 0.7, length capped (SS18).
- vfx: strips as a shared `Flipbook` (one plane, uv offset per frame, 12 fps, one shot, pooled 24).
- UI: `hud_plate` behind the HUD text, `title_plate` behind the title, mode cards as the four buttons' backgrounds with
  the live label over them, `forge_frame` as a 9 slice `border-image`, plinth under the knife preview, sliver icon in
  place of the ◆ glyph. Every button stays a real `<button>` of at least 48 px.

### 3.4 His calls, left open (do not decide these)
New skins' prices (10 new personalities: Socktopus, Butter Buddy, Sir Spatulot, Pencil Pusher, Disco Pickle, Cloud
Croissant, Rubber Duke, Banana Boomerang, Tea Rex, Cosmic Custodian); supporter shelf pricing and the cross game
entitlement; Deep Tide's slower fall; six authored courses per world (SS02); seasonal remixes; the beehive; whether
Daily results are shared (server) or personal. Everything else in sections 4 and 5 is decided here.

## 4. The asset pipeline (built once in Part A, rerun by every later part)

A script at `satellites/slice-3d/tools/cut_art.py` (new; Python + PIL, run with `python3 -I`), input the zip, output
`satellites/slice-3d/art/` with this contract, so the page loads small files and only what the active screen needs:
- Worlds: `art/w/<id>/strata.webp` 512x1024, `sky.webp` 1024x512, `wall.webp` 512, `ledge.webp` 512, `slab.webp` 512,
  `inside.webp` 512, `decor1..4.webp` 512 (alpha), `hazard.webp` 256 (alpha), `boss.webp` 512 (alpha), `boss_stages.webp`
  1536x512 (alpha). WebP quality 85, lossless alpha where alpha matters (PIL `lossless=False, quality=85, method=6`).
- Fruit: `art/fruit/cards.webp` one atlas 1024x1024 of 16 cells 256 (cards, alpha); `art/fruit/halves.webp` 2048x1024 of
  32 cells 256 (left half, right half per fruit, cut from each halves image by splitting its alpha bbox at the midpoint).
  Write `art/fruit/atlas.json` {cells, order}.
- Knives: `art/knife/<skin>.webp` the alpha bbox crop of each sheet (height ≤ 256), `art/knife/<skin>_icon.webp` 256,
  `art/knife/trail_<skin>.webp`; `art/knife/rig.json` {skin: {w,h, tipX, endX}} from the measured bbox.
- vfx: `art/fx/<name>.webp` strips as delivered, `art/fx/fx.json` {name: {cells, cw, ch, fps, life}}.
- ui: `art/ui/*.webp` (title 900x1600 from the plate, mode cards 512x256, hud, forge frame, plinth, sliver + strip, badges,
  btn_flip, app icon 512 and 192 to `icons/`), og_card to `og/` 1200x630 JPG.
- Budget: one world ≤ 2.5 MB, shared (fruit + knife + fx + ui) ≤ 4 MB; the script prints every size and FAILS over budget.
- A loader in the page (`ART` object): fetch the active world's files only when a mode starts (IMPORT_GUIDE rule), the
  menu's files at boot, the forge's on open; dispose textures on world change (`disposeMesh` already exists). Every draw
  falls back to today's code look until the file is in (the `ART.ok` pattern from Rabbit Ronin), so a slow network still
  shows a playable game and the suite still boots in 3 s.
- After Part A ships: delete `assets/Super_Slice_Dev_Handoff.zip` (the gitignore law: extract, wire, delete; the vault holds
  it) and commit `satellites/slice-3d/art/` (WebP only, small).

## 5. The design: six parts, each its own deploy

### Part A: the look (Milestone 1 and 2 of Astra's order; the biggest visible change, first)
Build the pipeline (section 4) and wire: all eight `FF_WORLDS` grow to eight entries keyed by Astra's ids with their
palettes from `world_bible.json`; Freefall and Endless pick worlds as today but over eight (level mod 8 for Freefall,
Endless cycles with depth every 300 m); Journey uses The Orchard Loft materials (its home per Astra verdict 7) and Wall
Climb uses Clockwork Well; strata, sky, wall, ledge, slab, inside, decor, hazard billboards per section 3.3; fruit cards and
halves for all 16; HUD plate (SS30: cream on midnight, gold accents), title plate, mode cards, sliver icon, forge frame and
plinth; the knife planes for the 22 existing skins with trails (SS18 caps). Keep `drawSkinIcon` as the fallback.
Gates: `cut_art.py` within budget; `audit-check.mjs` green; a 3x3 repeat shot of every wall and ledge (16 images) looked
at; shots at 412x915 of title, forge, Journey L1, Freefall L1 in four different worlds, Wall Climb L1, Endless at 400 m;
a grayscale copy of one Freefall shot (hazard, slab seam and knife tip must still read); frame time measured as paired
medians (art on vs `ART` off) at 412x915 DPR 1 in headless, reported, not gated (software GL); no texture side over 1024;
the knife's collider boxes unchanged (`measureKnife` returns the same numbers as v6.0 for every skin, assert it).

### Part B: core repair (SS29, SS31, SS32, SS34, SS21, SS20, SS33)
- SS29 the menu obstruction: the fleet song card is a bottom sheet about 230 px tall at boot; we cannot edit
  `music-unlocks.js`, so the title layout keeps all four mode buttons and the forge button inside the top 60 percent of
  the stage at 360, 375 and 412 wide (reflow, not scroll), and the music pill moves to a compact top right control. Gate:
  inject a fixed 230 px bottom element and assert `elementFromPoint` at each button's centre is the button, three widths.
- SS31 deterministic input and time: a fixed step accumulator (1/120 s, catch up capped at 4 steps, elapsed clamped on
  resume and on `visibilitychange`), tap = one impulse, hold = impulses at a fixed interval, held input cleared on pause
  and on blur/pointercancel. The physics NUMBERS stay; only the stepping changes. Gate: a scripted replay (the same
  tap times) through `_S3.stepN` at 60 and 120 Hz lands within 1 unit on every mode; the existing suite's mode runs
  still reach their panels.
- SS32 explain the last contact: on a fatal contact freeze 350 ms, a gold ring at the contact point, the cause in two
  words ("Blade hit wall"), Retry as the first button. Reduced motion: no freeze, the ring and words only.
- SS34 settings: music and effects levels (two sliders stored in `s3d_set`), reduced motion, reduced particles; every
  sound cue has a visual twin already (popups), check and add where missing.
- SS21 Endless is endless: no floor, seeded chunk ring (3 live chunks, recycled, origin rebased every 500 m), speed
  capped at today's cap (`FF_TERM + depth*0.012` to 30), milestones every 100 m as a popup that does not stop the run,
  `endlessBest` kept. Pit Conquered moves to a completed finite Freefall dive (SS20): the badge art `badge_pit_conquered`.
- SS20 mode identities on the cards: one line each under the title (Journey travels forward; Freefall reaches the
  floor; Endless chases depth; Wall Climb stakes a height multiplier). No dashes, no exclamation marks.
Gates: suite green and extended (obstruction, replay determinism, endless never ends in 3000 steps, pit conquered on a
finite dive, settings persist); shots of the fail screen and settings.

### Part C: knives and the forge (SS16, SS17, SS18, SS26)
- SS16 the ten new personalities: add them to `SKINS` with Astra's names, stories and slice effects, each a textured
  plane over the SAME collider rig. Rubber Duke (three clean Deep Tide dives) and Banana Boomerang (twelve handle
  bounces in one completed Journey run) are trophies with those rules (SS25) and go live. The six earned ones (Socktopus,
  Butter Buddy, Sir Spatulot, Pencil Pusher, Disco Pickle, Cloud Croissant) have `price:null` and are NOT in
  `SKIN_ORDER` until he prices them (one line each to flip). Tea Rex and Cosmic Custodian are supporter shelf and stay out
  until the shelf exists (Part F, his call).
- SS17 the forge preview: the equipped knife on the plinth, a slow turn, one full flip and one sample cut of an apple
  every 4 s (reduced motion: a still), the story line under the name, price or trophy rule beside Equip or Unlock.
- SS26: prices untouched (assert the 15 existing prices in the suite).
Gates: suite green and extended (22 + 2 trophies visible, 8 hidden, prices intact, trophies grant through `grantTrophy`
only); shots of the forge at 360 and 412.

### Part D: world verbs (SS01, SS03, SS07, SS08, SS09, SS11, SS14, SS05 only as a flag)
One signature cuttable per world, built on the existing piece code, no new rule types beyond these:
- Orchard Loft: the five rod chime (five fixed IDs, rising notes, one bonus when all five clear; a visual notch per rod and
  a completion pulse so it works muted, SS07). Lantern Night: the lantern line (one rope collider; cutting it drops a
  visible chain of lanterns on a fixed delay, one award, `lantern_burst` fx, SS08). Frost Chasm: the two pass ice parcel
  (crack state persists, `ice_crack` states 1..3, a fixed bumper below it so a handle bounce returns the knife, SS09).
  Ember Kiln: the accordion loaf (one seamed loaf, a fan of non colliding slices, SS14). Clockwork Well: Wall Climb
  banners every five bands (one rip, one modest Sliver award, SS11). Mossy Canyon: the spiral log stack (the existing slab
  with the spiral inside). Deep Tide: the kelp parcel (a slab) and jellyfish bumpers (the existing pad with a round
  billboard); the slower fall is a single constant `DEEP_TIDE_GRAV` set equal to `GRAV_FF` (his call to lower it, SS05).
  Glowcave: the geode slab (slab with the mint inside) and crystals that never strobe.
- SS03 depth planes: strata behind, walls sharper, interiors brightest; every 100 m a geometry marker (a ledge band in the
  wall colour) so speed does not flatten the shaft.
Gates: each verb driven through `_S3` to its award exactly once (hold the blade inside for 10 steps: one stage, SS
contract "repeated hits"); suite extended; shots of each world's verb.

### Part E: bosses, Clean Slice, Daily, discoveries, settlement (SS04, SS06, SS23, SS22, SS27, SS24, SS35)
- SS04 one boss per world in finite Freefall only, at the bottom of levels 8, 16, 24... (world order): a three lane
  chamber with two visible bumpers, the boss billboard, three separated hits advancing stages 1, 2, 3 (never reset by a
  bounce), each stage opening the next approach, one completion reward, a visible skip rope that forfeits Clean Slice
  instead of a softlock.
- SS23 Clean Slice: at generation freeze `requiredTargetIds` (fruit and slabs on the route; never hazards, decor, golden,
  spawned candy, optional boss); finish plus all cleared = badge (`badge_clean_slice`), shown on results with N of M.
- SS22 the Daily: one seeded Freefall course per UTC day ({utcDate, seed, generatorVersion:1, physicsVersion:1}),
  Practice unlimited and unscored, one scored attempt reserved on the first simulation tick, a local countdown to the
  UTC reset, results labelled personal (no server). `badge_daily` on the day's first completion.
- SS06 discoveries: 8 slab interiors (one per world) reveal a seed with a hat; recorded in `s3d_dex` after the run,
  shown on results once (SS24: completion, Clean Slice N of M, one discovery).
- SS27 settlement: Slivers accumulate in `G.runSliv` and settle once by `runId` (saved in `s3d_prog.settled`, a ring of
  the last 20); reopening results or refreshing after settlement cannot pay twice (the suite already injects and checks
  disk; extend it with a double settle).
- SS35 budget: pool debris (24), particles (120), active world only; print draw calls per frame in `?dev=1`.
Gates: suite extended (boss three hits exactly, skip forfeits Clean Slice, Daily seed stable across two boots, practice
does not consume the attempt, double settle pays once); shots of a boss chamber, results with Clean Slice, the Daily card.

### Part F: held for his word (do not build)
Supporter shelf and prices, the cross game entitlement, the six new earned skins' prices, Deep Tide's gravity, six
authored courses per world, seasonal remixes, the beehive, the seed audience (SS36). List them in the morning report as
"your calls".

## 6. Build order, deploys and gates (his one change at a time rule)

Order A, B, C, D, E. Each part: build, run the suite (`node satellites/slice-3d/audit-check.mjs` against a root server on
8777), the part's shots looked at and three things named wrong, then deploy, then the state block and the board.
- Stamps on every ship: `var BUILD="v6.N"` (6.1 for A, 6.2 for B...), the portal card `portal/index.html` line 1268
  `slice-3d/?v=2026MMDDx`, and the sw cache name in `satellites/slice-3d/sw.js` (bump; the sw is network first, the name
  purges the old cache). New files under an old stamp split players: all three in the same deploy commit.
- Deploy: commit on `add-sproing-jumper` with `-- <paths>`, then the files only deploy to main:
  `bash ~/.claude/projects/-workspaces-lucid-winds/memory/scripts/files-only-deploy-paths.sh <msgfile> satellites/slice-3d portal/index.html`
  (the directory form carries `art/`), merge main back, probe BOTH origins (`lucidwinds.com` and `www.`) with
  `?probe=$RANDOM` for the new BUILD string and one art file's 200 with `image/webp`. Tell him after; never ask whether
  to deploy. A phone must close the tab once.
- Looks: puppeteer at 412x915 `deviceScaleFactor:2` with the swiftshader flags, one browser per shot, `?dev=1`, drive the
  mode with `_S3`, shoot, READ the picture, name what is wrong. Also one shot at 360x640. Shots are evidence only, under
  200 KB each, not committed.

## 6b. Overnight rules (his 23 Oct pattern: "let it build all night if it has a good plan")

Nobody is watching. So:
- Work the parts in order and ship each the moment its gates are green. A part live at 03:00 is worth more than four in a
  working tree at 07:00.
- A gate still red after THREE honest attempts is not a fifth attempt: write what failed and why into the state block,
  revert that part's working tree to the last commit, and go on only to a part that does not depend on it (B and C do
  not depend on A's art; D and E depend on A and B).
- Never leave main in a state a phone cannot play. Every deploy is files only, probed on both origins, BUILD read back
  live, one art file read back as image/webp. A failed probe's next action is the fix, not the next part.
- No other game, no other file: `satellites/slice-3d/*`, the portal card line, this plan, the board, memory.
- Budget: stop after Part E ships or after eight hours of wall clock from your first command, whichever is first, and
  write the final state block. Then the morning report at the top of `START-HERE.md`: what is live, what you saw in the
  shots, what you left unshipped and why, his calls, in that order.
- If the box restarts mid run, the next session reads the state block and continues from the last unfinished part.
  Re-extract the zip to /tmp first (the /tmp disk is wiped at a stop).

## 7. Do not touch

The physics numbers (section 2), the collider sizes (`KSCALE, KLEN, KHH`, every `kbox` size in `SKINS`), the 15 prices and
the five trophy rules, the Sunbeam cap and `_sbCapEarn`, the save keys and their corrupt save guards, `three.min.js`,
`music-unlocks.js`, `sunbeam-sdk.js`, `arcade-exit.js`, `feedback.js`, `scripts/`, `CLAUDE.md`, the assertions already in
`audit-check.mjs` (extend only), Astra's originals (cut copies only; the zip is vaulted). No dashes and no exclamation
marks in anything a player reads. Nothing sold for money anywhere in this plan.

## 8. Reporting

Lead with what is live and the proof. One paragraph per part. Name the three things you saw wrong in your own shots
before he does. Put his words on the board verbatim the moment he gives any. When all five parts are live, the morning
report also lists section 3.4 as his calls, one line each.
