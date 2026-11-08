# TOFU, milestone 1: the little thing goes on the arcade (8 Nov 2026, Fable's plan for the Opus overnight run)

Stephen, 8 Nov: "Here's a new little thing we can put on in the studio." TOFU is a soft body tofu platformer: "You have no properties of
your own. You become what you soak in." Every level is a recipe and you are the ingredient; the bowl at the end judges your state, not
your position. v0.1 was built in one pass in a chat on 8 Nov (single file, no build, no network, 8 levels, headless tested, never
hand played). Astra's art pack came the same day.

## WHAT IS ON THE BOX
- The design and the architecture of v0.1: `/workspaces/tofu-drop/HANDOFF.md` (the state model with every threshold, the controls, the
  eight levels and what each teaches, the ten sections of index.html, the asset pipeline, the known gaps, the backlog). Read it whole, twice.
- Astra's pack, unpacked: `/workspaces/tofu-drop/pack/` (68 base PNGs + 68 @2x + wordmark.svg; `ASSET_MANIFEST.json` with every size and
  strip frame width; `README.md` with the compositing notes: faceless 96 px bodies with the baseline at y 88 and the footprints per state,
  64 px face layers with eyes at (24,30) and (40,30), strips without gutters, `eye_block_3f` as three blink poses to mirror, chopsticks
  facing right, chips monochrome #f3efe6, `bowl_ring` the only baked glow, `screenshot_frame` a 1080 by 1920 surround with its window).
  `assets/CHECKLIST.md` lists every file. The zip itself is `/workspaces/tofu-drop/tofu-astra-assets.zip` (sha256 f9617a5a...).
- THE GAME SOURCE: Stephen dropped it at 08:55 UTC on 8 Nov; it is `/workspaces/tofu-drop/index.html` (his upload index_14.html, the
  v0.1 of the handoff, `TOFU.recipeCheck` in it). Step 0 takes the short path. `ASTRA_ASSETS.md` is still not here; the pack's README,
  manifest and checklist stand in for it.

## THE LANE
- Home: `satellites/tofu/` in lucid-winds on branch add-sproing-jumper: `index.html` (one file), `assets/` (the pack's PNGs, flat, as the
  README asks), `sw.js`, `manifest.webmanifest`, `icons/` (icon_192, icon_512, icon_maskable_512 from the pack), `og/card.jpg` (the pack's
  `store_feature.png` as JPEG), and the arcade card `portal-assets/thumbs/tofu.png` (a 512 wide crop of the feature graphic or of a
  gameplay shot). The portal row in `portal/index.html` beside Sunforge's: `{nm:"Tofu", ds:"You are the ingredient. Soak, press, fry and
  freeze your way to the bowl.", cat:"platformer", url:"/satellites/tofu/", ic:"🍲", thumb:"/portal-assets/thumbs/tofu.png"}` (the ic is
  the portal's own emoji field, the one place an emoji is allowed).
- Tools: `tools/tofu-tests/check.js` (made in step 0 from `tools/tomato-man-tests/check.js`: every script block parses, the style braces
  balance, every local file the page names exists, no emoji in player copy, no dash of any kind and no exclamation mark in player copy,
  the save key survives, the manifest parses) and `tools/tofu-tests/shoot.mjs` (from `tools/sunforge-tests/shoot.mjs`: one screen at
  412x915, puppeteer from /workspaces/lucid-winds/node_modules, served by `python3 -m http.server`). Later a `levels.mjs` bot (step 4).
- Commit and push add-sproing-jumper after every step. Never push main. The deploy is Stephen's line at the end (step 6).

## THE LAWS (the studio's standing orders)
1. Bash only (cat, sed, grep, python3 scripts in your scratchpad); never the Read, Edit or Write tools; never open an image; never ask.
2. THE TESTING LAW. Per step: `node tools/tofu-tests/check.js` (seconds, no browser), nothing else. A visual step: ONE shot of THAT
   screen with shoot.mjs after all the step's edits, measured from the shell (pixel counts, a colour sample, no page errors), written as
   "shot taken, not opened". The levels bot ONCE at step 4. Never re-run a green.
3. One HTML file plus assets/. No CDN, no dependency, no network but the Sunbeam SDK line the arcade's games carry
   (`<script src="/sunbeam-sdk.js?v=7"></script>` and `Sunbeam.init({gameId:"tofu"})`, see satellites/ring-stacker/index.html lines 31
   and 32); the game must run with it missing. Every image through one loader with the drawn fallback kept (the handoff's `spr()`).
4. The copy law: no dashes of any kind and no exclamation marks in anything a player reads (the handoff's complaints "Rinse first!",
   "Too firm." become "Rinse first." and so on; dish names, hints, cards, toasts); 48 px touch targets; body copy at least 16 CSS px;
   no emoji in the game.
5. The PWA laws the fleet paid for: `sw.js` NETWORK-FIRST with a 4 s timeout and a cache fallback, `respondWith` never handed undefined,
   old caches swept only after claim and a 3 s delay (copy satellites/ring-stacker/sw.js and change the cache name to `tofu-v1`);
   `manifest.webmanifest` with its own `start_url` and `scope` of `./` (never the site root), portrait or any (DECISION 2), the three
   icons; the register line carries `?v=<n>`; a versioned `?v=` on every asset URL (ART_V) so the host's hard cache never serves old art.
6. Saved keys survive: the handoff's localStorage progress and best times keep their keys; keys may be added.
7. Budget: the base set and the @2x set are 5.5 MB together; load @2x only when devicePixelRatio is 2 or more, base otherwise, each
   asset on first use with the drawn fallback meanwhile; the first screen (title, wordmark, one body, the bowl) under 1 MB.
8. Commit after every green step with the two attribution lines of the session; one line per step in this file's STATE and one in
   START-HERE.md. No essays.

## STATE (the builder updates this block; one line per step)
| Step | State | Commit | Note |
|---|---|---|---|
| 0 | DONE 8 Nov | cb6d1d7b4 | Short path: his /workspaces/tofu-drop/index.html copied as is; 133 pack files flat in assets/ (store art left out); check.js passes all but 17 [copy] faults (16 copy law, 1 zoom viewport) for step 1; shoot.mjs written, not yet run |
| 1 | DONE 8 Nov | b4c725c93 | sw.js (tofu-v1, ring-stacker pattern), manifest.webmanifest (./, any), icons/, Sunbeam init + 5 a serve under 30 a day, ART_V 1 and @2x on dense screens each on first use, every ! and dash and emoji out of player copy, 48 px targets, 16 px body copy, zoom allowed, landscape hint; check OK; title shot taken, not opened (cream card y 167 to 602 CSS px, only page error the local 404 of /sunbeam-sdk.js) |
| 2 | DONE 8 Nov | 23906cb5d | bodies drawn from the README footprints onto the live blob (108% overscan, clipped), the 64 px faces scaled so their eyes sit on the blob's eye line, p_stink wisps, tofu_puddle where a death came in water or by the eye (the code has no drowning, so a death while in water counts), chip_* as CSS masks tinted by each chip's colour, label_zone pills behind the zone names; shoot.mjs gained JS and PROBE envs; check OK; level 2 shot taken, not opened (player placed in the water: the densest off white cell has 73 distinct colours, mean 201,193,176, the sprite's shaded texture, not the flat fallback; probe failed, cam is not global; only page error the local 404 of /sunbeam-sdk.js) |
| 3 | DONE 8 Nov | 36f8307a9 | most of the kitchen was already wired in v0.1 (tiles, zones, bowl and bowl_ring, bg_counter, eye blink by openness, wordmark); added Astra's strip timings (water 140, brine 160, pan 100, chopsticks 160/80/90 ms), chopsticks were drawn mirrored the wrong way (now right facing art, mirrored for left), p_droplet p_splat p_steam p_frost p_bubble p_spark p_chunk as sprites over the drawn fallback, dish_* on the recipe and served cards; check OK; level 5 shot taken, not opened (2184 distinct colours, the flat fallback background gone, the wall's main colour is the sprite's own #3b4150; only page error the local 404 of /sunbeam-sdk.js) |
| 4 | DONE 8 Nov | 0afa712a5 | tools/tofu-tests/levels.mjs (keys per level from the handoff table, seeded random, physics stepped in page at 1/120 s, TRACE=1 and ONLY=n for later); run once: L1 2.9 s, L2 5.4 s, L3 4.0 s, L4 4.3 s, L5 5.8 s, L6 9.3 s, L7 5.3 s all served with recipeCheck true, 0 deaths, no page errors; L8 first failed (running straight out of the soy pit the ceiling leap skips most of the pan, 0.2 s on it, heat 0.16, Not fried), then served in 12.2 s by stopping on the pan until Puffed as the L4 script does; no CFG number changed, the leap is a feel call for Stephen's thumbs |

## THE STEPS

**Step 0. The lane and the source (S or L).** Make satellites/tofu/, tools/tofu-tests/check.js and shoot.mjs. Then the source:
- If Stephen has dropped the game in (`/workspaces/tofu-drop/index.html`, or any `index.html` in
  `/home/codespace/.claude/uploads/*/` newer than 8 Nov 2026 whose text holds `TOFU.recipeCheck`), copy it to satellites/tofu/index.html
  and run the check. (S)
- Else BUILD v0.1 FROM THE HANDOFF: it is the spec, section by section (CFG with every threshold in its table; LEVELS as ASCII with the
  legend it describes, eight maps that teach what the table says; the asset loader with `spr()`/`drawSpr()` and procedural fallbacks;
  state P, loadLevel, REQ predicates, stateLabel, visibility; physics at a fixed 1/120 s with AABB vs grid, updateState, die, serve, the
  16 point soft body; chopsticks, eyes; particles and toasts; render in world units with camera fit or follow; the pointer stick, the two
  buttons, keys, a small WebAudio synth; the modes title, card, play, paused, served; progress in localStorage; `?dev=1`, `?level=n`,
  keys R N M Esc; `TOFU.P`, `TOFU.CFG`, `TOFU.go(n)`, `TOFU.recipeCheck()`). Keep the handoff's numbers exactly (jump buffer 0.12 s,
  coyote 0.1 s, pan 0.9/s, freezer 0.65/s, fried at heat 0.35, overcooked at 1.2, frozen 8 s, spongy 12 s, the firmness effects). (L:
  three to four hours; do it before any art.) Write in STATE which path you took.
Check green. Commit.

**Step 1. The fleet shell (S).** sw.js, manifest, icons, the Sunbeam line, ART_V on every asset URL, the copy law applied to every
string (grep for `!` and `—` and `-` in player copy), 48 px buttons (the pack's btn_jump and btn_squeeze are 160 px art; draw them at
80 CSS px or more), the viewport allowing zoom, a landscape hint on the title that never blocks play. Check green. ONE shot: title at
412x915. Commit.

**Step 2. Astra's art, part one: the tofu and its faces (M).** The six bodies clipped to the live blob (the handoff's drawPlayer, the
2.4x half extent scale; the pack's bodies are 96 px with baseline y 88 and the footprints per state, so set the per state draw box from
the README's footprints, not from one number), the seven faces as a layer offset to the body's eye line (eyes near (24,30) and (40,30)
in the 64 px face), the state tints over the body (soy darkening, stink wisps from `p_stink`, heat and cold as the code already tints),
`tofu_puddle` for a death by water or the eye. The HUD chips (chip_*, monochrome, tinted by state), `label_zone` pills. Check green. ONE
shot of play on level 2 (the silken body in water) at 412x915: measure that the body pixels are the sprite's off white, not the fallback
fill. Commit.

**Step 3. Astra's art, part two: the kitchen (M).** Tiles (tile_wall, tile_wall_top, tile_grate, tile_crack, tile_knife), the zones
(water_body + water_surface_4f at 140 ms, pool_soy, pool_brine + bubbles_4f at 160 ms, pan_slab + pan_glow_3f at 100 ms, floor_freezer,
shadow_tile), the bowl and bowl_ring (the one baked glow), bg_counter tiled behind, the eye (eye_block_3f: open, half, closed; mirror
for right; blink open, half, closed, half, open), chopsticks (patrol 160 ms, chase 80 ms, flee 90 ms; mirror for left), particles
(p_droplet, p_splat, p_steam, p_frost, p_bubble, p_spark, p_chunk). The dish illustrations on the recipe card and the served card
(dish_* by level), the wordmark on the title. Check green. ONE shot of level 5 (freezer, the cracked column) at 412x915. Commit.

**Step 4. The levels bot, once (M).** `tools/tofu-tests/levels.mjs`: puppeteer opens `?dev=1&level=n`, drives the keys per level by a
short script you write from the handoff's table (L1 walk and jump to the bowl; L2 into the water, through the grate; L3 squeeze then the
ledge; L4 onto the pan 0.5 s then across the water; L5 the freezer, smash the column; L6 soy then squeeze then the lit gaps on the
blink; L7 brine, past the chopsticks, over the puddle; L8 the whole chain) and asserts `TOFU.recipeCheck()` true at the bowl and no page
errors. The handoff says L1 to L5 and L7 passed its own bot and L8 was never finished: make L8 pass by tuning CFG numbers, never by
loosening a recipe. Run it ONCE; record each level's result in STATE. Commit.

**Step 5. The handoff's gaps that need no thumbs (S).** A hint the first time the player is silken at the bottom of a pool ("Squeeze to
firm up and climb out."); the HUD scale below 400 CSS px of height; the landscape hint; a Test Kitchen is NOT built (backlog). Check
green. Commit.

**Step 6. The stamp and the line (S).** `satellites/tofu/version.json` ({"build":"20261109a"}), sw cache `tofu-v1`, the portal row, the
thumb, the og card. The deploy script `/home/codespace/tofu-drafts/deploy-tofu-m1.sh` in the EXACT pattern of
`/home/codespace/sf-drafts/deploy-sunforge-v3.sh` (SRC the stamp commit on add-sproing-jumper; the served set = satellites/tofu/** plus
portal-assets/thumbs/tofu.png plus portal/index.html; BASE = the blobs origin/main holds NOW for portal/index.html and nothing else of
ours since tofu is new; STOP if main's portal/index.html moved; DRY=1 stops before the push). `DRY=1 bash ...` once. The line into
START-HERE.md: `! bash /home/codespace/tofu-drafts/deploy-tofu-m1.sh`. Commit and push the branch.

## DECISIONS for Stephen (built as written until he says otherwise)
1. Free on the arcade, no store build yet; Sunbeams on a served dish under the 30 a day standard (one call per serve).
2. Orientation `any` in the manifest with a landscape hint on the title (the handoff recommends landscape; the arcade is portrait first).
3. Smashed blocks stay smashed after a respawn (the handoff's kinder default).
4. The backlog (recipe builder by URL, daily dish, test kitchen, combination recipes, chef mode, co-op) waits for his pick.
