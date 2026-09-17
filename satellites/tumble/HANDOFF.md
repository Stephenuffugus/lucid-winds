# TUMBLE: handoff

Overnight build, 2026-09-17, by Opus. Written for the morning reviewer (Fable) and for Stephen.
Honest status beats optimistic status: every "works" below says how it was checked. "Gate" means a headless
Chrome run with software WebGL (`dev/gate-*.mjs`); "Node" means `tests/*.test.mjs`.

**Status: COMPLETE for this run** (steps 1 to 8 built and gated; last updated 10:45 UTC; see section 4b for the
final gate run). Nothing here has been touched by a human thumb or seen on a real phone. That is the biggest gap.

## How to run it

```
cd satellites/tumble
python3 -m http.server 8080        # any static server; file:// cannot load ES modules (DECISIONS.md)
open http://localhost:8080/            # the Laundry Room
open http://localhost:8080/?debug=1    # FPS, frame time, physics step, bodies, draw calls, last flick
open http://localhost:8080/?load=laundry&size=regular&tier=4   # straight into a Load
open http://localhost:8080/?load=rush&sub=timed&tier=6          # Rush (sub = timed, endless, balance)
open http://localhost:8080/?smoke=200&debug=1                  # the 200 sock physics smoke pile
open http://localhost:8080/dev/atlas.html                      # 64 tiles from 64 seeds, determinism readout
open http://localhost:8080/dev/physics.html                    # DESIGN 15.1 on this device
open http://localhost:8080/dev/flick.html                      # DESIGN 15.2
npm install && npm test            # the Node tests (Rapier is the only dependency)
sh dev/run-gates.sh                # the browser gates, one at a time (headless SwiftShader, slow: about 45 min)
```

Flick tuning on a phone without a code change: `?debug=1&shotgain=2.6&rangeassist=0.8&assist=0.6` (defaults 2.3, 0.7, 0.6).

Where it lives: `satellites/tumble/` in the lucid-winds repo, branch `add-sproing-jumper`, pushed to the branch only.
It is **not on main** and not live (Jimothy releases Friday; the brief asks for a review first). If the branch is
ever deployed, `index.html` loads the studio's workbench gate (`/dev-gate.js`) on lucidwinds.com only.

## 1. Status per build step

| Step | Works (and how it was checked) | Stubbed | Missing |
|---|---|---|---|
| **1. Physics pile + grab/flick** | 200 socks dump, settle in 1.4 to 1.7 s simulated and all sleep (Node, 5 seeds; browser `dev/physics.html`). Drag lifts a sock on a spring, release flicks with the last 3 samples (gate 1). Debug overlay at `?debug=1`. Compound capsule colliders per DESIGN 13.2. | Silhouettes are procedural placeholders (`assets/geo/placeholder.js`); the loader also takes GLB + mask PNG by name (`assets/geo/manifest.json`), untested with a real GLB. | Frame rate on a real phone (the brief's "steady frame rate" is unmeasured; see section 4). |
| **2. sockgen + atlas** | All ten families, 16 motifs, SHA-256 seeds, CIEDE2000 floor of 7 in all four colour modes, enforced in the generator (Node: 75 match checks, 18 atlas checks). `dev/atlas.html` shows 64 tiles and re-renders byte identical on reload, and the browser paints the same bytes as Node (gate devpages). Tiles paint in up to three workers. | Hero socks are painted recipes, not PNGs (no art exists; 43 recipes). | The Lucid Winds engine was not in this repo's `engine/`, so sockgen was written fresh to DESIGN 7 with the same seed, spec, tile contract. |
| **3. Match / ball / basket** | Tap, tap its twin: they roll into a ball (gate 3). Hold with a still thumb and tap with a second finger (gate review, Node input test). Mismatches drop back with a jostle. Flicked balls fly with real rim bounces (Node physics test: a ball dropped on the rim rebounds), misses stay on the table (gate 3). Tap the basket lobs it in. Odd Bin, inside out flip by double tap. | Flick strength is tuned in headless math, not by a thumb (DECISIONS, "Flick tuning"). | |
| **4. Laundry Day end to end** | Dump, play, Sweep (tap a stray or wait 3 s), Results with Tidy rating, Lint and Quarters, Drawer and Odd Bin in IndexedDB. Five Loads in a row, then a reload keeps everything (gate 4). Colour vision modes repaint the atlas; pattern first; export and import (gate 4, Node save test). Tap tap shots, Warm hands, Reduce motion, sound, music and haptics toggles are real. | | |
| **5. Rush** | Timed (clock, streak to x5, power dots, all four powers, lint fog at tier 6+, Dryer Sheet clears it), Endless (40 s, the dryer feeds, baskets buy time), Basket Balance (tilt, settle tap, tip and spill) (gate 5). | | |
| **6. Room, Drawer, Odd Bin** | The room is the menu: dryer, drawer, Odd Bin, radio, door and clothesline hotspots, all at least 48 px, plus a dock (gate 678). Drawer with filters and a turning card; Odd Bin with waiting socks and lore pages. | | |
| **7. Economy + Clothesline** | 120 unlocks and 16 pegs from `data/`; pegs earned by doing, shop with Lint and Quarters, Reunion gifts drawn in the room (gate 678, Node economy test, calibrated within 10%). | | |
| **8. Daily + lore** | Date seeded Load identical for everyone (Node daily test), share card PNG, 12 lore pages firing at their exact Reunion counts (Node oddbin test). | | |

Tests from DESIGN 15: 1 (Node + dev page), 2 (`dev/flick.html`, 100 flicks within 0.000 cm), 3 to 10 in Node.
Node: 11 suites (physics 25, atlas 18, match 75, lifecycle 36, economy 17, oddbin 12, save 16, daily 5, sw 10,
input 6, shot 3). DESIGN 15.1's "frame time < 16 ms on mid range Android" is **not measured** (no device here).

## 2. Deviations from DESIGN.md and the brief

All of them, with the reasons, are in `DECISIONS.md`. The ones a reviewer should know first:

1. **`file://` does not run** the game (browsers refuse ES modules from `file://`); the page says how to serve it.
2. **The game lives in `satellites/tumble/`** inside lucid-winds, not a new repo, and is not deployed.
3. **Tap to pick up is always on** (a tap puts a sock in a "pocket" at the bottom of the screen; tap its twin to
   match). Hold and tap works too. One thumb play without a second finger.
4. **Flicks get help**: aim within 9 degrees is nudged 60%; strength between 0.55x and 1.8x of ideal is nudged 70%.
5. **Aggressive sleep is a freeze to a fixed body** (Rapier's manual sleep sinks through the table).
6. **Hero socks are painted recipes**; four hero names were changed under the IP rule (DECISIONS, Content).
7. **Brand is Sky Wolf Studio**; no dashes in player copy.
8. **Rush Quarters** have no DESIGN figure; a relaxed Rush player earns about 0.01 a Load (skill bonus only).
9. **Tier 9 waits** for a future Eyes peg (six Eyes pegs exist; the cap is Eyes pegs + 2).
10. **Daily Loads never feed the Odd Bin** and always use pattern first, so the Daily is the same for everyone.
11. **`assets/masks/` and `assets/audio/` are empty**: masks are generated with the placeholders, audio is a synth.

## 3. Known bugs and limits (with repro)

1. **Nobody has flicked a ball with a real thumb.** The gain was wrong all night (see the note below) and is now
   set from headless math. Repro: open `?load=laundry&debug=1` on a phone, match a pair, flick at the basket and read
   the "last flick" line; if the x-ratio for natural flicks sits well away from 1.0, scale `SHOT.gain` by 1/ratio.
2. **Real device frame rate is unknown.** The rig renders at about 1 fps (software WebGL on two cores); physics alone
   is 5 to 12 ms a step for 200 socks in Node. Repro: `?smoke=200&debug=1` on the Pixel 9.
3. **Removed bodies stay in the physics world, disabled, until the next Load** (the Rapier removal panic workaround).
   A Mountain Load packs up to 44 basket balls this way; Endless keeps adding. Measured in Node: 40 socks and 12 balls
   step in 1.03 ms with none disabled, 0.82 ms with 60, 1.06 ms with 200 (noise level). Not profiled on a phone.
4. **The first Load's atlas can take a few seconds on a slow phone** if module workers are missing (main thread paint:
   2.3 to 3.9 s for 64 tiles in headless Chrome). The dryer spin covers it; the pile waits for its tiles.
5. **The GLB path is untested** (no Meshy files yet).
6. **Radio stations are code approximations** of lo-fi, rain, jazz, TV, hold music and RESONARC.
7. **Economy numbers come from a written down "relaxed player" model**, not from play.

Fixed in the review pass this morning (a 42 agent adversarial review, every finding checked by a skeptic): a Rapier
panic that froze the game (about 1 run in 13), an endless loop when Basket Balance tipped, three ways the Load could
never end, a sweep tap that did nothing, hold and tap needing a moving thumb, a binned sock thrown back out, a double
tap that scored a mismatch, the HUD left over the room, Start over during a Load, imported saves reaching the page
unescaped, and a dozen smaller ones. **And the big one: every flicked ball was being set down instead of launched**
(`release()` emptied the hand before `_launchFor()` read it). Gate 3 had been failing on that all night and the cause
was misread as harness timing; `DECISIONS.md` and the memory note carry the lesson.

## 4. Performance

Measured on this rig only (headless Chrome, SwiftShader software WebGL, 2 CPU cores, 390 x 844). These numbers say
nothing about a phone except that the CPU side is cheap.

From the `?debug=1` overlay (`node dev/perf.mjs`, 10 s per scene, pile frozen):

| Scene | fps (software GPU) | draw calls | triangles | bodies | Rapier ms/step, isolated | dump pre sim | settled |
|---|---|---|---|---|---|---|---|
| Laundry Room | 1 to 2 | 181 | 39k | 0 | 0.01 | | |
| Regular Load (20 pairs + odd) | 1 | 129 | 129k | 42 | 0.16 | 396 ms | 0.72 s |
| Mountain Load (50 pairs + odd) | 1 | 129 | 268k | 101 | 0.58 | 800 ms | 0.97 s |
| `?smoke=200` | 2 | 133 | 501k | 200 | 0.89 | 2.3 s | 1.22 s |
| Regular Load with `?low` | 1 | 129 | 129k | 42 | 0.17 | 665 ms | 0.72 s |

- "Rapier isolated" is 120 `physics.step()` calls timed inside the page. The overlay's own physics figure reads higher
  (0.13 to 17.7 ms) because the software GPU takes both cores between steps.
- Node, same CPU: a frozen pile steps in 0.21 ms (42 socks), 0.26 ms (101), 0.48 ms (200). Dragging a sock through
  the pile wakes its neighbours: 1.8 ms (42), 4.6 ms (101), 19.6 ms (200, 185 awake). DESIGN's budget of 150 active
  bodies is the right cap; a Mountain Load is the biggest real case.
- Dump pre simulation (the dryer spin hides it): 0.4 s Regular, 0.8 s Mountain, 2.3 s for 200 in the browser.
- The atlas: 2.3 to 3.9 s for 64 tiles on the browser main thread; about 25 ms a tile in a worker once warm.
- **Triangles are the phone risk.** The placeholder socks are about 2,500 triangles each (Meshy target: 600 to 900),
  and the shadow pass draws them again. If a Mountain Load stutters, lower `RING` and `ALONG` in
  `assets/geo/placeholder.js` or ship the Meshy meshes.
- Bundle (everything the game ships, CDN libraries excluded): 1.09 MB (src 387 KB, data 446 KB, icons 184 KB,
  engine 53 KB), under the 2 MB limit.

## 4b. Gates (final run, 2026-09-17, 09:57 to about 10:45 UTC)

| Gate | What it drives | Result |
|---|---|---|
| `shaders` | every basket, dryer, ball roll, puff and trail material compiles | all passed |
| `step1` | smoke pile asleep, drag, flick, debug overlay | all passed (rerun after the sub frame flick fix) |
| `step3` | tap to pocket, match, lob, mismatch, put down, hold and tap, ball flick, Odd Bin, double tap flip | all passed |
| `step4` | How to play, five Laundry Loads, results, reload keeps the save, colour modes, import | all passed (rerun after the gate waits) |
| `step5` | Timed Rush with streak, dots, four powers and fog; Endless; Basket Balance tilt, settle and tip | all passed |
| `step678` | every room hotspot at 48 px, Drawer, Odd Bin, Clothesline, shop, decor, packs, pegs, Daily twice, Daily board, lore | all passed |
| `review` | the review regressions (sweep tap, busy leak, still hold and tap, HUD after leaving, Start over mid Load) | all passed |
| `basket` | 50 lobs into one basket in a Mountain Load | all passed |
| `devpages` | `dev/atlas.html` twice, `dev/flick.html`, `dev/physics.html` | all passed |

Gates that failed along the way and why (all fixed): the ball flick never launching (game bug); a sub frame flick
freezing the game (game bug, found once the harness sent gestures with real timing); a sheet closed in the same frame
reopening (game bug); a closing sheet catching taps (game bug); lobs bouncing off a heaped basket (game bug); the
How to play button pressed while its sheet slid in and the HUD read mid fade (gate timing).

## 5. Next three tasks, in order

1. **Put it on a phone (Stephen, Pixel 9) with `?debug=1`.** Play two Laundry Loads and one Timed Rush. Check: the
   held sock reads well, tap and hold and tap feel right, and the flick. Tune `SHOT.gain` from the "last flick" line
   (or try `?shotgain=`), then write the number into `src/config.js`. Note the fps in a Regular Load and in
   `?smoke=200`. If it is under 50, the first knobs are `?low` (1024 shadow map instead of 2048) and the shadow radius.
2. **Review against DESIGN.md with the gate screenshots** (`dev/out/g1-*.png`, `g3-*.png`, `g4-*.png`, `g5-*.png`, `g6-*.png`,
   `g7-*.png`, `g8-lore.png`, `dev-*.png`, `g-basket-full.png`, `g-review-room.png`, `g-shaders.png`; `dev/out/` is
   gitignored, so rerun the gates to make them) and rerun `npm test` and
   `sh dev/run-gates.sh` after any change. The adversarial review that found the 38 issues is
   `docs/review-workflow.js` (a Claude Code Workflow script: four reviewers, a skeptic per finding); rerun it for a
   second opinion after changes.
3. **Swap in the Meshy silhouettes** (DESIGN 14): drop the GLBs and mask PNGs, list them in
   `assets/geo/manifest.json`, check the colliders still sit inside the meshes with `?smoke=43&debug=1`. Then decide
   whether TUMBLE goes to main behind the workbench gate for phone testing on lucidwinds.com.
