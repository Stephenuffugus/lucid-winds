# TOFU — HANDOFF

**Status:** v0.1 playable prototype. Single file, no build, no network, no API. 8 levels. Headless-tested mechanics; needs hands-on feel pass.
**Files:** `index.html` (the whole game) · `ASTRA_ASSETS.md` (art brief for Astra) · `assets/` (empty until Astra delivers — game draws everything itself until then)
**Run:** open `index.html`, or `python3 -m http.server` and visit on your phone over LAN. Landscape recommended.
**Dev shortcuts:** `?dev=1` unlocks all dishes · `?level=4` jumps straight to a recipe card · keys `R` restart, `N` next dish, `M` mute, `Esc` pause · console: `TOFU.P`, `TOFU.CFG`, `TOFU.go(3)`, `TOFU.recipeCheck()`

---

## 1. The pitch

> **You have no properties of your own. You become what you soak in.**
> Every level is a recipe. You are the ingredient.

A soft-body tofu platformer where the kitchen's hazards are your only power-ups. Water, soy, brine, a hot pan, a freezer — nothing is "just damage." Everything changes what you are. The bowl at the end judges you: arrive as the dish on the menu or get bounced out with a one-word complaint ("Too firm." "Not fried." "Rinse first!").

**Why it's different:** the win condition is a *state*, not a location. The puzzle is sequencing transformations through a kitchen that keeps changing you.

## 2. State model (the whole design lives here)

The tofu is a few continuous values plus flags. All thresholds in `CFG.thresholds`.

| Axis | Range | Raised by | Lowered by | Effect |
|---|---|---|---|---|
| **firmness** `P.f` | 0–1 (start 0.5) | SQUEEZE (hold), soy salting (>0.5 soy) | water | jump height (0.4× at silken → 1.4× at extra-firm), speed (silken 0.6×), hitbox (silken = wide & flat). `< 0.3` = SILKEN, passes grates. `> 0.75` = FIRM |
| **soy** `P.soy` | 0–1 | soy pool | water, squeezing | visual darkening; `≥ 0.6` = SOY-DARK → invisible in shadow tiles. Soy >0.5 slowly firms you (salt) |
| **stink** `P.stink` | 0–1 | brine | water (fast), squeezing | `≥ 0.4` chopsticks flee; `≥ 0.6` = STINKY; bowl rejects `≥ 0.2` unless recipe wants STINKY |
| **heat** `P.heat` | 0–1.2 | hot pan (0.9/s) | off pan (0.7/s), water | at 0.35 → **fried** flag; at 1.2 → "Overcooked." |
| **cold** `P.cold` | 0–1 | freezer (0.65/s) | off freezer | at 1.0 → **frozen** flag, 8 s timer |
| **fried** flag | | pan | 6 s in water → "Soggy." | puffed 1.0×1.0 hitbox, floats in water, bounces on landing, +15% jump, crust slows water soaking to 20% |
| **frozen** flag | 8 s | freezer | timer; 4× faster in liquid, 6× on pan | hard: smashes `c` blocks on contact >2.5 t/s, immune to knives, absorbs nothing, 0.7× speed, can't squeeze |
| **thawed/spongy** flag | 12 s | frozen expiring | timer | absorbs everything 2× (real koya-dofu behaviour) |

Label priority for the HUD: FROZEN > FRIED > SILKEN > FIRM > SPONGY > PLAIN, with tags (SOY-DARK, STINKY, timers).

**Recipe predicates** are in `REQ` — one line each. Add a new requirement by adding a predicate + a label in `RECIPE_LABEL` + a complaint in `rejectReason`.

## 3. Controls

- **Touch:** left half of screen = analog stick (drag, re-centers when you overshoot). `JUMP` button (or tap right half). `SQUEEZE` button (hold; only works grounded & not frozen; stops movement while pressing).
- **Keys:** ← → / A D · Space/W/↑ jump · S/↓/Shift squeeze.
- Jump buffer 0.12 s, coyote 0.1 s. In water: tap jump = paddle up (0.22 s cooldown); at the surface = a hop that is never weaker than 75% of a plain jump, so water is never a softlock.

## 4. Levels (ASCII, edit freely)

Legend in the `LEVELS` comment. Maps can be any size; rows are padded with `#`. Zone tiles (`~ s f * o`) are where the player *stands*, so put a solid tile under them. Eyes `< >` are solid blocks; the tile beneath an eye is a blind spot by design.

| # | Dish | Arrive as | Teaches |
|---|---|---|---|
| 1 | PLATED | PLAIN | move, jump, bowl |
| 2 | HIYAYAKKO | SILKEN | water softens; silken passes the grate wall, can't jump |
| 3 | DOUGAN | FIRM | squeeze; firm clears a 3-tile ledge (plain can't) |
| 4 | AGEDASHI | FRIED | pan = fried in ~0.4 s, burnt in ~1.3 s; fried floats across deep water |
| 5 | KORI-DOFU | FROZEN | freezer; smash the 5-tall cracked column; knives ignored; thaw clock |
| 6 | BRAISED | SOY + FIRM | soy darkens, salt firms; shadows + blinking eye; cross lit gaps on the blink |
| 7 | CHOU DOUFU | STINKY | brine; chopsticks flee stink; the puddle rinses you (jump it) |
| 8 | CHEF'S SPECIAL | FRIED + SOY | freeze → smash → soy pit thaws you → spongy soaks 2× → low ceiling forces the pan → two timed lit gaps |

Verified headlessly: each level loads; L1–L5 and L7 are completable by scripted bots; every mechanic above fires; plain tofu *cannot* skip the firm ledge; sprinting through light with the eye open gets you caught, during a blink it doesn't; non-fried tofu can escape deep water. **Not yet verified by a human hand:** feel, difficulty, L8 end-to-end.

## 5. Architecture (index.html sections)

| Section | What's there |
|---|---|
| 1 `CFG` | every tuning number. Start here for feel changes |
| 2 `LEVELS` | ASCII maps + dish copy + recipe arrays |
| 3 assets | `ASSET_FILES` list, loader, `spr()`/`drawSpr()`. Missing PNG → procedural fallback, per draw call |
| 4 state | `P` (the tofu), `loadLevel`, `REQ` recipe predicates, `stateLabel`, `visibility` |
| 5 physics | `step()` fixed 1/120 s, AABB-vs-grid `collideAxis`, `updateState` (all soaking/heat/cold/pressing), `die`, `serve`, soft-body jiggle springs |
| 6 entities | chopsticks (patrol/chase/flee), eyes (blink cycle, cone, LOS, detection meter) |
| 7 particles/toasts | one generic particle pool; toasts float above the tofu |
| 8 render | world units (1 tile = 1.0), camera fit-or-follow, per-tile drawers, player blob (clip-to-blob sprite or flat fill + tints + face), cones, HUD text via `textAt` |
| 9 input/audio | pointer stick, buttons, keys, tiny WebAudio synth (no files) |
| 10 UI/flow | modes `title · card · play · paused · served`; overlay cards built from template strings; progress/best times in localStorage; runtime PWA manifest |

Soft body: the hitbox is a plain AABB (reliable platforming); the visible blob is 16 spring-loaded offset points around it, excited by landings and acceleration, plus squash/stretch. Silken = floppy springs; firm/frozen = stiff.

## 6. Asset pipeline (Astra)

Brief is `ASTRA_ASSETS.md`. Drop PNGs into `assets/` with the exact names — nothing else to do. Priority 1 (tofu bodies + faces) changes the look the most. Bodies are clipped to the live blob shape, so Astra's sprites still wobble. Soy/stink/heat/cold are code tints over whatever body is drawn. If a sprite looks wrong in-game, check `drawPlayer`'s `bw/bh` scale factor (2.4× half-extents) before asking for a redraw.

Still procedural even with assets: particles, cones, shadows, bowl glow, HUD. Audio is synthesized; swap in real SFX later if wanted.

## 7. Known gaps / TODO

- [ ] **Hand-play every level on a phone.** Numbers were set by reasoning + bots, not thumbs. Likely tweaks: `runSpeed`, pan `gain`, eye `fill`, freezer `gain`.
- [ ] Pressing while in water fights soaking (works but slow) — maybe show a hint the first time you're silken at the bottom of a pool.
- [ ] Portrait mode works (camera follows) but the stick/buttons cover more of the view — consider a smaller HUD scale below 400 px height.
- [ ] No service worker yet (single-file constraint). Add `sw.js` + real `manifest.json` from the usual template when it goes to Firebase.
- [ ] `roundRect` fallback is a plain rect on old WebViews — fine.
- [ ] Chopsticks can't climb; they reverse at ledges. Good enough for corridors.
- [ ] Smashed blocks stay smashed after respawn (intentional, kinder). Decide if that's final.
- [ ] One-way platforms, pushable crates, oil (slippery) and chili (spicy = enemies avoid but bowl needs rinse) are designed-in-head, not built.

## 8. Backlog — where this can go

- **Recipe builder / level share by URL.** Encode map + recipe in the hash (lz-string style). Zero backend, fits the house style. Players design dishes for each other.
- **Daily dish.** Seeded recipe + a small procedurally arranged kitchen. One attempt per day, shareable result string.
- **Test Kitchen** free-play room with every station, for players to learn the matrix.
- **Combination recipes** as the real endgame: FROZEN+SOY ("braised koya"), FRIED+STINKY ("night market"), SILKEN+SOY under watch, etc. The state space is the content.
- **Chef mode:** the kitchen fights back — pans slide, knives drop, a ladle scoops you. Only after the base feel is locked.
- **Two tofu co-op / hotseat:** one phone, pass it — "pass the tofu."
- Store copy is in `ASTRA_ASSETS.md` §8: tagline **"You are the ingredient."**

## 9. Session log

- 2026-11-08 — Concept (Claude Fable), built v0.1 in one pass: engine, 8 levels, HUD, cards, audio synth, asset manifest with fallbacks. Headless harness found and fixed: pan too slow to fry at sprint speed; eye detection too slow to catch sprinting; fried tofu going silken mid-float; pit-exit jump arcing over the Special's pan (added ceiling); water softlock (surface hop floor). Astra asset brief written.
