# SHUTTERBUG — Design v1.0 (developer-facing)

Stephen Furpahs / SWS Strategic Media LLC · 2026-10-29
Supersedes the v0.3 living doc plus Astra's 30-item review. Everything below is ruled unless marked **open**. Changes go through Stephen.

---

## 0. One paragraph

SHUTTERBUG turns a photo of any room into a pixel-art vertical platformer level. The player shoots a room, it develops like instant film into a 24×48 grid, shelves and table edges become platforms, shadows become walls, and a thumb-sized clay bug climbs the player's own furniture to the ceiling light. Each room is a level; five rooms are a run. There is no AI, no server and no API at runtime: the whole transformation is pixel math on the phone, offline, and the photo never leaves the device. Weapons ride on the three verbs (move, jump, dive), Dead Cells-style blueprints and unlocks keep opening new ways to read the same photo, and the content pipeline is the player's house.

## 1. Pillars and non-negotiables

Three pillars: **your room is the level**, **it costs nothing to run**, **it shares in one tap**.

| Constraint | Rule |
| --- | --- |
| Platform | Single `index.html` (vanilla HTML/CSS/JS, ES2020, no frameworks, no build step), plus `manifest.json`, `sw.js` and a `/music/` folder. Nothing else. |
| Runtime cost | Zero. No AI, no API calls, no server, no analytics. Works fully offline once installed. |
| Orientation | Portrait only. Landscape shows a "rotate" card. |
| Verbs | Three: move (left/right rocker), jump (A), dive (B). No fourth verb, ever. |
| Determinism | Same grid + same seed = same level, same enemy placement, same sim. Core sim is pure functions with a fixed 60 Hz step and a seeded RNG; no `Math.random`, no `Date.now` inside the sim. |
| Bot harness | The level generator and sim run headless in Node against a fixture corpus and assert every level is completable and passes the route score (§6.9). |
| Privacy | Photos are processed in memory and never persisted or transmitted. Only the 16-color grid is stored or shared, and the player sees the shared image before copying a link. |
| Music | Stephen's own tracks, dropped into `/music/` later. SFX are synthesized in Web Audio; no audio asset files. |
| Monetization | Dead Pixels are earned only, never bought. Sunbeams (if used) buy cosmetics only. Final business model is Stephen's call. |

## 2. Theme and style

Everything in the game is made with a camera.

- **The world is a photograph.** Crisp pixels, one fixed 16-color palette (§11), 1-px outlines, no smoothing, integer scaling.
- **Living things are stop-motion clay**, because stop-motion is photographs played fast. Clay reads through motion, not texture: squash on landing, stretch on jump, sprites animated at 12 fps while the world scrolls at display rate, a one-pixel idle wobble. No thumbprint textures.
- **The hero is the Shutterbug**, a thumb-sized clay bug that fell out of the photo and climbs back up to the light. Dead Pixels (the currency) are the ones that never made it.
- **Enemies live inside photos**: moths, icicles, jellies, thorn crawlers, sparks. All clay, same animation rules.
- **Develop reveal**: generation plays as the photo developing in three beats (§5.2). This is the hook moment and gets the most polish.
- **The frame**: an instant-film border around the play area. The thick bottom strip is where the controls live and the Dead Pixel count is handwritten in its corner. The frame yields to the controls, never the reverse.
- **Repaired terrain is visibly not furniture**: added footholds render as film tabs / exposure marks (§6.7).

## 3. Units, grid, screen

| Thing | Value |
| --- | --- |
| Grid | 24 cells wide × 48 cells tall |
| Cell | 16 × 16 game pixels |
| World | 384 × 768 game pixels |
| Render | 1 game px = 1 CSS px (3 device px on most phones). On screens ≥ 768 CSS px wide, integer-scale 2×. Otherwise center with side gutters. Never fractional scale. |
| Play viewport | 384 × 640 game px (40 rows visible). Camera scrolls vertically only, keeps the hero at ~60% down the viewport, clamps at world edges. |
| Frame layout (390×844 phone) | top strip 36 px (room name, hearts), play area 640 px, control strip 168 px |
| Hero hitbox | 12 × 16 px (¾ cell wide, 1 cell tall); sprite 12 × 16 with 2-px squash/stretch |
| Enemy sprites | 16 × 16 (fodder), 24 × 24 (elite), boss = cluster size |

Readability requirement (acceptance test): at arm's length on a 6-inch phone a tester can distinguish the hero's feet, landing edges, enemies and attack effects. Highest contrast is reserved for collision surfaces and immediate danger.

**Open (settle in M0):** if 24×48 proves too coarse for photo recognition, the fallback is 36×64 at 10-px cells with an 8×12 hero. Build the grid size as a single constant.

## 4. Movement and controls

### 4.1 Inputs

| Verb | Input | Behavior |
| --- | --- | --- |
| Move | Rocker, bottom-left of the control strip. Two zones (left / right) with a visible neutral gap. Thumb may slide between zones without lifting. | Digital. Full run speed immediately; 4-frame decel on release. |
| Jump | A button, bottom-right outer | Press on ground or within coyote time: jump. Hold for height (variable, 3–4 cells). Press while wall-sliding: wall-jump. |
| Dive | B button, bottom-right inner | In air: dive (§4.3). On ground: dash (§4.3). |

- Mirrored layout option (rocker right, buttons left) in settings.
- Gamepad API: d-pad/left stick → rocker, face-south → A, face-west → B. Keyboard for desktop testing: arrows / Z / X.
- Controls are drawn semi-transparent in the control strip, 56-px minimum touch targets, never over the play area.

### 4.2 Jump, wall-slide, wall-jump

| Parameter | Value |
| --- | --- |
| Jump reach | 4 cells up, 5 cells across at full hold |
| Short hop | release early → 2 cells |
| Coyote time | 6 frames |
| Jump buffer | 6 frames |
| Fall | fast fall, terminal 12 px/frame, no air friction |
| Wall-slide | while airborne, touching a solid side **and** rocker pressed toward it: fall slows to ⅓. Cling pose shows the wall-jump is armed. |
| Wall-jump | from wall-slide, A: 3 cells up, 4 across **away** from the wall. Sets facing away from the wall. |
| Corner rule | overlapping a platform corner or a solid cell by ≤ 2 px never arms a wall-slide; only a full-height side contact does. |
| Sticky walls (vines/pipes) | touching one stops the fall entirely (no rocker needed). A from a sticky wall: straight up 4 cells, no push-off. |

**Facing rule:** facing = last rocker direction. Wall-jump sets facing away from the wall. The hero sprite always shows facing. No weapon ever requires a corrective tap before jumping.

### 4.3 Dive and dash

- **Tap B in the air:** dive. Vertical speed snaps to terminal; horizontal speed zeroes; the hero lands on the **next** surface below, one-way platforms included. The dive weapon fires on landing.
- **Hold B in the air:** keep dropping through one-way platforms until released or a solid cell is reached. Weapon fires on the eventual landing.
- A B press that began in the air stays a dive through landing and never chains into a dash.
- **Fresh B press on the ground:** dash, 3 cells in facing direction over 8 frames, i-frames for the first 4. Dash weapons (the dive slot) fire with it. A dash never carries the player off a platform edge: it stops at the edge.

### 4.4 Feel targets

Immediate response on every input (no delay for animation). Squash 2 px on land, stretch 2 px at jump start. 12 fps hold on hero frames, 60 Hz sim. Screen shake ≤ 2 px, only on dive landings and boss hits.

## 5. Core loop and onboarding

### 5.1 Loop

Shoot → develop → climb → doorway → next room. Target 60–120 s per level.

1. **Shoot** a photo (environment camera via `<input type="file" accept="image/*" capture="environment">`) or **choose** one from the camera roll (same input without `capture`). A built-in sample room is always available.
2. **Crop**: a 1:2 portrait crop box over the photo, drag and pinch. An overlay shows the footholds and solids the pipeline will produce; it updates as the crop moves. One-tap retake.
3. **Focal tap (optional)**: tap any shape in the preview; it receives the level's chest. No new verb; happens before play.
4. **Develop reveal** (§5.2).
5. **Climb** from the floor to the exit at the ceiling. Loot on the way. The Darkroom door (if present) is a side room.
6. **Clear**: the exit beacon. In a house run, the doorway screen: bank blueprints, optionally develop, then shoot the next room.
7. **Die**: free play restarts the room; house run ends the run (with Retry House available, §8).

### 5.2 Develop reveal

Three beats, ~1.6 s total, skippable after first view:

1. **Hold** (0.3 s): the cropped photo, full color, inside the film frame.
2. **Resolve** (0.8 s): the image quantizes bottom-up into the 16-color grid, row by row.
3. **Light up** (0.5 s): footholds flash their light top edge in place, landmarks pulse once, film-tab repairs appear last. Then the hero drops in from the bottom of the frame.

Shutter click (synthesized) on beat 1. This is the signature moment; it ships in M0.

### 5.3 First 60 seconds (onboarding spec)

| Time | What happens |
| --- | --- |
| 0–10 s | Two buttons: "Photograph a room" / "Choose a photo", and a small "Try the sample room" link. No account, no currency explanation, no mode grid. |
| 10–20 s | Crop, overlay, develop. The player recognizes their room. |
| 20–35 s | Safe movement and one forgiving jump onto a visible photo landmark. Hint glyphs for rocker and A appear once, in the control strip. |
| 35–50 s | A clear wall-jump opportunity, then an optional dive target with a visible landing. B hint appears once. |
| 50–60 s | Climb toward an obvious reward (a loot speck above). No shop, no equipment comparison yet. |

The **first free-play room always runs plain Attic rules**: no biome twist, ≤ 2 fodder enemies, no trap field, no pocket. Biome twists unlock after the first clear. The first death must teach a readable mistake, never an environmental rule the player couldn't anticipate. These are pacing targets, not timers.

## 6. Photo-to-level pipeline

Deterministic, synchronous, pure. Input: an `ImageData` crop. Output: a `Level` (grid + metadata). Budget: < 50 ms on a mid-range phone. No AI anywhere.

### 6.1 Downscale
Area-average the crop to 24×48 (draw to a small canvas with `imageSmoothingEnabled = true`, read back). Per cell keep: RGB, luminance L (0–255), saturation S (0–1), hue H.

### 6.2 Quantize
Map each cell to the nearest palette entry (§11) using weighted RGB distance (0.3 R, 0.59 G, 0.11 B). Store `pal[i] ∈ 0..15`. This grid is the only thing ever persisted or shared.

### 6.3 Solidity
Threshold T on L via Otsu over the cell histogram, clamped to [70, 140]. `L < T` → solid. Two passes of cellular-automata smoothing (a cell becomes the majority of its 3×3 neighborhood). Bottom row is always solid (floor). Top row is always open.

### 6.4 Platforms
For each row boundary, if the cell above is open and the cell below is solid **or** the luminance drop across the boundary is > 60, mark a surface. Horizontal runs of ≥ 3 surface cells become **one-way platforms** (standable from above, passable from below, dive-through on hold). Runs on top of solid cells are just solid tops; runs over open cells are floating one-ways.

### 6.5 Landmarks
Connected components of solid cells (4-connected). The three largest with ≥ 8 cells are **landmarks**: protected from repair, eligible for the pocket feature, pulsed in the develop reveal. Everything the player will point at and say "I climbed that."

### 6.6 Spawn and exit
Spawn: the widest open run on row 46 (two above the floor). Exit: the farthest cell from spawn (by reach-graph distance, §6.8) among open cells in the top 4 rows. A "ceiling light" (bright cluster in the top 4 rows) wins ties and becomes the beacon sprite.

### 6.7 Repair
Build the reach graph. If the exit is unreachable **or** fewer than 40% of open cells are reachable:
- Add **film tabs**: 2-cell-wide one-way platforms placed along a stair path (alternating 3 across / 3 up) from the reachable frontier toward the unreached mass. Max 12 tabs. Never on landmark cells, never within 1 cell of a landmark top.
- Re-run reach. Repeat up to 4 times.
- If repair would alter > 15% of cells, or 4 passes fail, the pipeline returns `needsCrop` and the UI asks for a tighter crop instead of silently rebuilding the room.

Film tabs render in the palette's tab color with a perforated edge. The player can always tell furniture from help.

### 6.8 Reach graph
From every standable cell (open cell whose cell below is solid or platform), reachable targets are: any standable cell within the jump cone (≤ 4 up, ≤ 5 across, with a 1-cell-per-column clearance check), any wall-contact cell reached by a fall or jump, and from a wall-contact cell, standable cells within 3 up / 4 across away from the wall. Sticky walls (Overgrowth, Deep) add straight-up 4 from the contact. Falls reach everything below with clearance. This is the single source of truth for both the harness and the repair step; the sim must be at least as generous.

### 6.9 Route score (harness)
A level passes only if there exists a **main ascent** from spawn to exit such that: no wall-jump chain longer than 2 without a standable cell; no jump at maximum range (≥ 1 cell slack on height or distance); a standable "safe cell" (no enemy spawn within 3 cells, not a trap cell) at least every 8 rows; the ascent remains valid with the level's actual biome rules (Frost slide, Deep gravity) and enemy placements. Hard jumps and traps are allowed only off the main ascent, on optional branches that lead to loot.

### 6.10 Biome
Over cells with S > 0.35, take the dominant hue band. Fewer than 10% such cells → Attic. (See §7 for bands.)

### 6.11 Features (with caps)
Detection is connected-component and edge analysis on the grid, seeded. **Most detected shapes are scenery.** Per level, at most:

| Feature | Source | Becomes | Cap |
| --- | --- | --- | --- |
| Ladder zone | 3+ one-way platforms stacked within 3 rows of each other | marked as a ladder; a chest at the top | 1 |
| Pocket | a landmark ≥ 20 cells | a 3×3 hollow carved inside it, an elite inside, loot at the back; entrance on the side facing the main ascent | 1 |
| Darkroom door | largest bright (L > 200) rectangle ≥ 3×3 | a door sprite; entering opens the shop | 1, never on the main ascent's safe cells |
| Loot speck | isolated cell with S > 0.5 and L > 150, no saturated neighbors | Dead Pixels (common), scroll (1 guaranteed per level), blueprint (the single brightest speck, 25% chance) | 6 |
| Sticky wall | vertical solid run ≥ 6 cells, 1 cell wide, Overgrowth/Deep only | vine / pipe | 3 |
| Enemy cluster | saturated component by size: 2–5 cells fodder, 6–11 elite | spawn point | 4 (max 1 elite); house-run last room: the largest ≥ 12 is the boss |
| Trap field | repeating 2-cell pattern ≥ 4×4 | spikes (Attic/Ember/Overgrowth) or crushers (Frost/Deep) on a 1.5 s rhythm | 1, never intersecting the main ascent |
| Beacon | brightest cluster in the top 4 rows | exit sprite | exactly 1 |

Guarantees: ≥ 1 chest, ≥ 1 scroll per level. A blank wall still yields a short playable climb from the default spread (two film-tab stairs, one speck, one fodder).

### 6.12 Seed
`seed = FNV-1a-32(pal grid bytes)`. All placement RNG is `mulberry32(seed)`. The seed is derived, never stored separately, so a shared grid is self-contained.

### 6.13 Level record
`{ v: 1, w: 24, h: 48, pal: Uint8Array(1152), focal: cellIndex|null, mode: 0|1|2 }` — `mode` is 0 normal, 1 Negative, 2 Double Exposure (second grid appended). Everything else is recomputed.

## 7. Biomes and enemies

Two rules the player learns: **brightness is openness, saturation is danger.**

| Hue band | Biome | Twist | Enemy (clay) | Boss moveset |
| --- | --- | --- | --- | --- |
| warm browns/oranges | Attic | none at launch (dust is cosmetic) | Moth: drifts toward the hero at 1 cell/s, 1 HP | sheds 3 moths every 4 s |
| white/light grey | Frost | marked slick surfaces (one-ways ≥ 5 cells wide, drawn with an ice edge): 1-cell slide on stop | Icicle: hangs under a platform, drops when the hero is within 2 columns, 1 HP, respawns 6 s | drops icicle volleys on a 3 s telegraph |
| blue/teal | Deep | low gravity: jumps +1 cell, falls 20% slower; pipes are sticky walls | Jelly: bobs ±2 cells vertically, 2 HP, contact damage | pulses a 4-cell ring every 5 s |
| green | Overgrowth | vines are sticky walls | Thorn crawler: patrols a platform edge-to-edge at 2 cells/s, 2 HP | extends thorn lines along adjacent platforms |
| red/pink/magenta | Ember | +1 enemy cap, +2 loot specks | Spark: hops between platforms every 1.5 s, 1 HP, burns on contact | spark fountain, 2 s telegraph |

Contact with any enemy: 1 heart, 1 s i-frames, 2-cell knockback away from the enemy. Enemies never spawn on the main ascent's safe cells or within 2 cells of spawn.

### 7.1 Boss (house run, room 5)
- Body: the largest saturated cluster (≥ 12 cells), rendered from its own palette cells. HP = cell count. Each hit removes the struck cell(s); the silhouette is preserved as it erodes (cells vanish from the hit point outward, the outline stays until < 25% remains).
- Intro: on entering the last room the cluster is outlined in its photo position for 2 s before it wakes. The exit beacon stays dark until the boss is gone.
- Arena rules: a standable safe ledge within 6 cells of the boss that no attack reaches; every attack has a ≥ 0.8 s telegraph; at least 3 weak cells are reachable by jump or dive from the safe ledge. The harness asserts all three.
- Fallback: no cluster ≥ 12 → a default clay boss (fixed 5×4 sprite, 20 HP, Attic moveset) spawns on the largest dark mass.

## 8. Modes and run structure

| Mode | Rooms | Death | Dead Pixels | Notes |
| --- | --- | --- | --- | --- |
| Free play | 1, any photo | restart room | ×0.5 | blueprints can drop; first room of all time uses the onboarding rules |
| House run | 5, shot in any order, camera roll and repeats allowed | run ends; **Retry House** replays the same 5 grids | ×1 | loot and gear persist across rooms; room 5 has the boss; clearing unlocks a cosmetic |
| Level code | 1 | restart room | ×0.5 | paste a shared code / open a link; no photo |
| Daily Room | 1 | restart room | ×1 | unlock; seed = FNV(date string) over a built-in sample grid set, so everyone gets the same room with no server |
| Open House | 8+ | as house run | ×1.5 | unlock |
| Negative | any | as base mode | as base mode | unlock; solid/open inverted before §6.4 |
| Double Exposure | any | as base mode | as base mode | unlock; two photos stacked into a 24×96 climb |

An unfinished house run is saved to localStorage after every room and resumes on launch. Walking the house is the fantasy, never the admission price.

## 9. Weapons, stats, economy

### 9.1 Slots
Three slots, one per verb. No separate attack button. No rarity, no affixes at launch: every weapon does one readable thing.

**Jump slot** — fires on any jump or wall-jump, cooldown 0.6 s (movement is never delayed). Scales with **Focus**.

| # | Weapon | Effect |
| --- | --- | --- |
| J1 | Boomerang | travels 5 cells along facing and returns; 1 dmg each pass |
| J2 | Spark Trail | drops 3 sparks along the arc, each burns 1.5 s, 1 dmg |
| J3 | Shield Kick | wall-jumps hit anything on that wall within 2 cells, 2 dmg |
| J4 | Flashbulb | burst, radius 2, at jump apex; 1 dmg + 1 s stun (symmetric) |
| J5 | Twin Darts | one dart each side, 4 cells, 1 dmg (symmetric) |
| J6 | Halo | a ring rises 6 cells straight up from the takeoff cell, 1 dmg |
| J7 | Shutter Snap | freezes enemies within 3 cells for 0.5 s at takeoff (symmetric) |
| J8 | Skyhook | +1 cell jump height, no damage (utility) |

**Dive slot** — fires on a dive landing and on a ground dash. Scales with **Vigor**.

| # | Weapon | Effect |
| --- | --- | --- |
| D1 | Anvil Boots | shockwave 3 cells each side on landing, 2 dmg |
| D2 | Icicle | freezes enemies within 2 cells for 2 s |
| D3 | Pogo Spear | landing on an enemy: 2 dmg and bounce 2 cells higher |
| D4 | Tremor | shakes 1–3 Dead Pixels out of adjacent solid cells; 1 dmg adjacent |
| D5 | Ember Stomp | leaves fire on the landing cell for 2 s, 1 dmg per 0.5 s |
| D6 | Wide Lens | shockwave 5 cells each side, 1 dmg |
| D7 | Pile Driver | 3 dmg to the single enemy directly below, no area |
| D8 | Flashpan | dash leaves a 3-cell burning line, 1 dmg |

**Charm slot** — always on, one at a time. Scales with **Grit** where noted, always capped.

| # | Charm | Effect |
| --- | --- | --- |
| C1 | Lantern | orbiting light, 1 dmg/s within 1 cell (Grit: +0.5 dmg per point, cap 3) |
| C2 | Magnet | pulls loot from 4 cells (Grit: +1 cell per point, cap 8) |
| C3 | Second Wind | one free death per room (no scaling) |
| C4 | Thick Skin | first hit each room does nothing (no scaling) |
| C5 | Tripod | wall-slide at ⅕ speed, wall-jump 5 across |
| C6 | Light Meter | loot specks glint through walls and show as frame-edge ticks |
| C7 | Darkroom Discount | shop −20% (Grit: −5% per point, cap −40%) |
| C8 | Fixer | blueprints you carry survive one death (consumed) |

Starting loadout: none equipped until the first pickup. Pickup screen shows **equipped vs candidate only**, in plain words ("hits farther", "bounces once more"), with the sim paused.

### 9.2 Stats and scrolls
- **Vigor** (dive weapons, +25% damage per point), **Focus** (jump weapons, +25% per point), **Grit** (charm scaling as listed). Each has a distinct icon and name; color is a secondary cue only.
- **Health**: 4 hearts base; +1 heart per 3 scrolls of any color (cap 8).
- **Scrolls**: each pickup offers **pick one of two**: one color biased by the room's biome, one off-color. One scroll guaranteed per level.

### 9.3 Economy
- **Dead Pixels** (DP): fodder 3, elite 10, boss 60, speck 2–6, chest 15 + a weapon. Free play ×0.5. Spent in the Darkroom.
- **Blueprints**: picked up in levels; give nothing until developed. Carried blueprints and DP are lost on death in a house run. **Reaching a doorway banks blueprints** (risk lasts the climb, not the shop).
- **Darkroom**: inside a level (behind the door) it is shop only: a weapon or a reroll for DP. At doorways and from the title screen it is also the collector: develop banked blueprints, manage the loaded pool, buy unlocks.
- **Loaded pool**: developed weapons go into a collection; the player loads up to **4 per slot** into the drop pool. Developing never dilutes a run the player didn't choose.
- Farming a favorite photo is allowed and prices assume it. A repeat-clear decay (same grid hash) is a tuning knob, off by default.

### 9.4 Unlocks (placeholder prices, DP)

| Unlock | Cost | Adds |
| --- | --- | --- |
| Develop a blueprint | 30 / 100 / 300 by weapon tier | enters the collection |
| Starting loadout pick | 200 | start each run with one developed weapon |
| Negative | 400 | inverted rooms |
| Double Exposure | 600 | two photos, one 24×96 climb |
| Open House | 600 | 8+ room runs, ×1.5 DP |
| Daily Room | first house clear | shared daily climb |
| Cosmetics | Sunbeams only | hero colors, frame styles (Stephen's call) |

Post-launch, not in v1: Flash (dark level, light radius), Time-lapse (fading platforms), live viewfinder overlay, a top-down crawler mode from the same grid.

## 10. Sharing

- A level is a URL: `https://<host>/shutterbug/#v1.<base64url(level record)>` ≈ 800 characters. Also offered as a QR.
- Before copying, the share sheet shows the **actual abstracted image** (the 16-color grid) with the words "This shares an abstracted 16-color version of your photo, not the photo."
- Offline wording: "Works offline once installed." A shared link opens on another phone that has loaded the app at least once; a brand-new phone needs one online load. Say both plainly.
- Opening a link rebuilds the identical level locally (same grid → same seed).

## 11. Palette and art

- **Palette**: 16 colors, fixed, to be authored in M0 and then frozen. Requirements: 2 near-blacks, 2 near-whites, 3 greys, one warm brown, one orange, one red, one magenta, one blue, one teal, one green, one yellow, one "film tab" cream. Must give every biome a readable solid/open/platform triplet.
- **Backdrop**: the quantized photo at 60% contrast. Solid cells get a 1-px darker outline; platforms a 1-px light top edge; slick surfaces an ice edge; sticky walls a vine/pipe overlay.
- **Sprites**: hero 12×16 (idle, run ×4, jump, fall, cling, dive, land), 5 enemies 16×16 (2–4 frames each), elite variants 24×24, chest, scroll, blueprint, speck, beacon, Darkroom door, film tab, tab stair. Under 40 sprites total, all drawn to the palette, stored as inline pixel strings.
- **Frame**: instant-film white (palette near-white) with a subtle paper grain, handwritten DP counter, room name field.
- **SFX** (Web Audio, synthesized): shutter click, develop tick, jump, wall-jump, dive, land, hit, pickup, chest, scroll pick, door, boss intro, boss hit, beacon.
- **Music**: one track per biome plus title and Darkroom, from Stephen's library, in `/music/`, cached by the service worker. Placeholder silence until provided.

## 12. Persistence

All in localStorage under one versioned key: DP balance, collection, loaded pool, unlocks, settings (mirror layout, sound), onboarding flags, unfinished house run (5 level records + hero state), last 20 level records as "recent rooms" (grids only, no photos). Export/import as a JSON string from settings (manual backup, no server).

## 13. Acceptance criteria (summary; HANDOFF.md has per-milestone detail)

1. 20 fixture grids × 5 biomes × Negative on/off → every level completable by the harness bot and passing the route score.
2. Pipeline < 50 ms on a mid-range Android phone; develop reveal ≤ 1.6 s including pipeline.
3. 60 fps sim and render with 4 enemies and 8 projectiles on a mid-range phone.
4. Readability test (§3) passes with three testers.
5. The onboarding sequence (§5.3) is achievable on the sample room by a first-time tester without prompts beyond the three hint glyphs.
6. A shared link round-trips to an identical level on a second device.
7. No network request after install except `/music/` cache fill.
