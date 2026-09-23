# TUMBLE: handoff

Overnight build, 2026-09-17, by Opus. Written for the morning reviewer (Fable) and for Stephen.
Honest status beats optimistic status: every "works" below says how it was checked. "Gate" means a headless
Chrome run with software WebGL (`dev/gate-*.mjs`); "Node" means `tests/*.test.mjs`.

**Status Sep 17 17:30 UTC: LIVE as 20260917i after Fable's review and Stephen's first phone notes** (root `HANDOFF-FABLE-TUMBLE-SEP17.md` §10: what changed, what he said, what is next). Below is Opus's handoff as written at 14:00 UTC.

**Status: COMPLETE for this run, plus a polish pass** (steps 1 to 8 built and gated; polish pass section 4c;
last updated 14:00 UTC). Nothing here has been touched by a human thumb or seen on a real phone. That is the biggest gap.

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

Where it lives: `satellites/tumble/` in the lucid-winds repo, branch `add-sproing-jumper` (main is level with it).
**It is live** at https://lucidwinds.com/satellites/tumble/ since Sep 17 14:05 UTC (Stephen asked, to test on his
phone), behind the studio workbench gate (`/dev-gate.js`, his tester key). The reviewer's guide is
`HANDOFF-FABLE-TUMBLE-SEP17.md` at the repo root. Every code change must bump the version in `sw.js`, `src/config.js`
and `index.html` together, or phones keep the old files.

## 1. Status per build step

| Step | Works (and how it was checked) | Stubbed | Missing |
|---|---|---|---|
| **1. Physics pile + grab/flick** | 200 socks dump, settle in 1.4 to 1.7 s simulated and all sleep (Node, 5 seeds; browser `dev/physics.html`). Drag lifts a sock on a spring, release flicks with the last 3 samples (gate 1). Debug overlay at `?debug=1`. Compound capsule colliders per DESIGN 13.2. | Silhouettes are procedural placeholders (`assets/geo/placeholder.js`); the loader also takes GLB + mask PNG by name (`assets/geo/manifest.json`), untested with a real GLB. | Frame rate on a real phone (the brief's "steady frame rate" is unmeasured; see section 4). |
| **2. sockgen + atlas** | All ten families, 32 motifs, SHA-256 seeds, CIEDE2000 floor of 7 in all four colour modes, enforced in the generator (Node: 75 match checks, 18 atlas checks). `dev/atlas.html` shows 64 tiles and re-renders byte identical on reload, and the browser paints the same bytes as Node (gate devpages). Tiles paint in up to three workers. | Hero socks are painted recipes, not PNGs (no art exists; 43 recipes). | The Lucid Winds engine was not in this repo's `engine/`, so sockgen was written fresh to DESIGN 7 with the same seed, spec, tile contract. |
| **3. Match / ball / basket** | Tap, tap its twin: they roll into a ball (gate 3). Hold with a still thumb and tap with a second finger (gate review, Node input test). Mismatches drop back with a jostle. Flicked balls fly with real rim bounces (Node physics test: a ball dropped on the rim rebounds), misses stay on the table (gate 3). Tap the basket lobs it in. Odd Bin, inside out flip by double tap. | Flick strength is tuned in headless math, not by a thumb (DECISIONS, "Flick tuning"). | |
| **4. Laundry Day end to end** | Dump, play, Sweep (tap a stray or wait 3 s), Results with Tidy rating, Lint and Quarters, Drawer and Odd Bin in IndexedDB. Five Loads in a row, then a reload keeps everything (gate 4). Colour vision modes repaint the atlas; pattern first; export and import (gate 4, Node save test). Tap tap shots, Warm hands, Reduce motion, sound, music and haptics toggles are real. | | |
| **5. Rush** | Timed (clock, streak to x5, power dots, all four powers, lint fog at tier 6+, Dryer Sheet clears it), Endless (40 s, the dryer feeds, baskets buy time), Basket Balance (tilt, settle tap, tip and spill) (gate 5). | | |
| **6. Room, Drawer, Odd Bin** | The room is the menu: dryer, drawer, Odd Bin, radio, door and clothesline hotspots, all at least 48 px, plus a dock (gate 678). Drawer with filters and a turning card; Odd Bin with waiting socks and lore pages. | | |
| **7. Economy + Clothesline** | 120 unlocks and 16 pegs from `data/`; pegs earned by doing, shop with Lint and Quarters, Reunion gifts drawn in the room (gate 678, Node economy test, calibrated within 10%). | | |
| **8. Daily + lore** | Date seeded Load identical for everyone (Node daily test), share card PNG, 12 lore pages firing at their exact Reunion counts (Node oddbin test). | | |

Tests from DESIGN 15: 1 (Node + dev page), 2 (`dev/flick.html`, 100 flicks within 0.000 cm), 3 to 10 in Node.
Node: 11 suites (physics 26, atlas 18, match 75, lifecycle 36, economy 17, oddbin 12, save 16, daily 5, sw 10,
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
| `step1` | smoke pile asleep, drag, flick, debug overlay | all passed (rerun after the sub frame flick fix, and again on 20260917g) |
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

## 4c. Polish pass (Sep 17 afternoon, after "polish the game and everything")

A 51 shot tour at a Pixel 9's CSS size (`node tools/tour.mjs dev/out/tour`) and six critics with skeptics (copy, feel
and sound, accessibility, table, room, sheets) gave about 90 changes, all committed. The main visible ones:

- **Room**: warm ceiling with a readable title, a painted blue door in a frame, the window shows its view, the
  clothesline and pendant no longer crowd one band, a visible rope and pegs, a braided rug, reunion gifts on show.
- **Table**: lint fog that looks like lint, a warm glow behind the held sock (it used to wash it out), Rush streak and
  dots in chips, a Basket Balance lean meter, points popups, a warmer dryer drum, the ODD SOCKS label on its flap,
  odd socks folded into the Bin, glows that outline instead of bleaching.
- **Feel**: basket, rim and table impacts sound when they happen, the dump and jostles shuffle, the lift eases in,
  a tapped twin answers at once, the pop has a sound, the last five seconds tick, the Rush pulse follows the streak.
- **Sheets**: the Clothesline shows socks and progress, shop icons for every shelf, decor in groups, gift states,
  a real sock card, the Daily board and share button, polaroid share card with names, focus and Escape handling,
  48 px switches, WCAG AA contrast on buttons and cards, Reduce motion follows the phone.
- **Copy**: impossible sock names match the heroes, hints stay up long enough to read, no false praise for flipping,
  sock names read as socks, US spelling, plurals, lock reasons.

Screens from the second tour: `dev/out/tour2/` (rerun the tour to make them; `dev/out` is not committed).

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

---

## 6. BUILD 2, phase 0 and phase 1: POCKET CHANGE (2026-09-21 evening, by Opus)

Built from `plans/tumble/exp1/DESIGN-T2.md` to the order and the laws in `HANDOFF-OPUS-T2.md`. Live as
**`20260921h`**. Phase 1 ships alone, as the design says, because it is the whole answer to "we dont seem to get
quarters". Phases 2 to 8 are untouched.

### What she will find

Coins. They are **found, never awarded for failing less**: they come out of the dryer drum when the door opens, out
of the lint trap when the Load ends, out of the cuff of an inside out sock when she turns it the right way out, and
as a whole Quarter for a Clean Load and again for a Spotless one. Every coin goes into a **glass jar on the dryer
top**, which holds 0 to 24 cents; at 25 the coins fold into a paper roll and her Quarters go up by one. A coin
appears where the moment happened, hops once and flies to a jar pill in the HUD, with a sound pitched by its kind.
The results sheet has one new card, "In the pockets": the coins drawn as coins, then what is left in the jar.

**Quarters now come from ONE place, the jar.** A Clean Load and a Spotless one used to add a Quarter each directly;
they pay a quarter COIN into the jar instead, so nothing is paid twice and there is one number to reason about.

Her Lint is untouched, to the cent. Her Quarters are hers. The jar starts empty.

### The economy, from the test (`tests/economy.test.mjs`, printed with its arithmetic)

| | |
|---|---|
| A relaxed model player, Regular Load | **57.0 cents**, which is **2.28 Quarters** |
| Lint, same player, same Load | 62.7, unchanged within its old 10 percent |
| Three Regular Loads a day | 171 cents, so **6 Quarters a day** |
| The first dryer (8 Quarters) | inside 2 days at three Loads a day; by Load 4 in one sitting |
| The first hero pack (10 Quarters) | inside 2 days |
| All 95 Quarters | **14 days** at three Loads a day (the design allows 17) |
| One Load a week | a dryer in **4 weeks** |
| Misses half their shots, never flips a sock | still **23.0 cents** a Load, so 18 Quarters in twenty Loads |
| A PERFECT tier 5 Regular Load (measured in the page) | **114 cents**, 4 Quarters and 14 cents: twice the average |
| Rush, Regular Load | 27.4 cents, never more than Laundry Day |

**⚖️ ONE NUMBER FOR THE DIRECTOR.** The design asks for 45 to 55 cents and its own table pays 57. 45 to 55 is what a
Regular Load pays with **no inside out socks in it** (measured 46 to 48 at tiers 0 and 1); from tier 2 up the `flip`
and `allFlipped` moments in the design's own table add about ten cents. The design also says a draw is "6.5 cents on
average" where its own odds (penny 50, nickel 25, dime 15, quarter 10) give **5.75**, so the draw counts were sized
against a number 13 percent high. **The table is kept exactly as written**, because it is the felt thing: where coins
come from and how many ping off the drum lip. The test window is 45 to 60 and every consequence the design rests on
is asserted above. Moving to 50 means trimming a draw ladder, and that is a design call, not a build one.

### What was wrong that nobody had reported

Nine things, none of them in anybody's notes. The first four came out of the fixtures, the next three out of the
browser gate, and the last two out of LOOKING at its pictures.

1. **Playing either Daily quietly set her Load size back to Regular.** `start()` wrote `profile.lastSize` for every
   pick, and a Daily is always Regular, so a Heavy player who did the Daily came back to a Regular door. A Daily
   now writes nothing down (phase 0.4).
2. **A new pattern family would repaint 709 of 2,000 seeds, 35.5 percent.** The design estimated "about a third" by
   reading the code; `tests/golden-seeds.json` measures it. Adding one family also repaints 591 tiles outright.
3. **The flip cap has to count COINS PAID, not flips tried.** Written the obvious way, two flips on a Regular Load
   closed the moment for the rest of the Load whether they had paid anything or not.
4. **A Clean Load would have paid twice**, once as the old direct Quarter and once as the new quarter coin, if the
   old award had been left in place. There is now exactly one source of Quarters.
5. **The dryer door pays before the spill, while the HUD is off screen**, so the first coins of every Load flew to
   a pill that was not there. The sound happens at the door; the flight waits for the pill.
6. **The second Load of a sitting showed no coins at all.** The drain kept its watermark on the Game, not on the
   Load, so Load two stayed silent until it had found more coins than Load one did.
7. **The pill put itself back.** The roll sound fires a beat after the coin that filled the jar, and its closure had
   captured the jar's value at that moment; the door pays a quarter then a penny, so 620 ms later the pill went from
   1 back to 0. It reads the live jar now.
8. **The jar looked empty with money in it**: one cent rounded to no coins at all.
9. **The jar had nothing to stand on.** The dryer's front is a plate flush with the wall, so "a glass jar on the
   dryer top" floated against the wallpaper. The machine has a top now, a shallow enamel slab above the door where
   no ball's arc reaches.

### ⚠️ And one about the gate itself, worth more than the rest

Its room check **passed while the picture showed the results sheet**. `showRoom()` does not close a modal sheet, so
the wallet really was visible and really did say what the save said, behind a sheet covering the whole screen. The
assertion was true and the step was worthless. Only opening the image caught it. The step now taps the Room button
the way a player does and asserts the sheet is `inert`, and it projects the jar's own world matrix to check the jar
is in frame at all. **A green check is not a look.**

### What I SAW in the pictures (three faults each, named before he does)

Six shots, `dev/out/g-coins-{412,360}-{inload,results,room}.png`, opened and read. `dev/out` is gitignored: rerun
`node dev/gate-coins.mjs` to make them again.

**In a Load (412x915 and 360x740).** (1) The pill read **0¢ while the jar held 1** — the stale roll value, caught by
eye in the first shot before the assertion caught it, and fixed. (2) The jar icon read as a **battery** at 24 px, a
pale lozenge with a cap, with the coins inside lost; redrawn wider with a dark rim, a brass band and three big
coins. (3) The **"Got it" hint card sits over the dryer door**, which is exactly where the door coins fly FROM, so
on the very first Load of a save the first two coins come out from behind a modal card. Not fixed: it is a one time
hint and moving it is a change to the teaching flow, not to phase 1. Also seen, and not mine: the **ODD SOCKS label
is clipped by the table's left rail** at both widths.

**The results sheet.** (1) The line **said the same thing twice**: "+4 Quarters rolled" in its box and "4 rolled
into Quarters" in the sentence thirty pixels below it. The sentence is now the coins and the jar and nothing else,
which is what the design asked for. (2) It had **no label and no container** while every other block on the sheet is
in a card; it is a card called "In the pockets" now. (3) Not mine: "0 flicked in" beside "20 pairs" reads as a
failure when it is not (the gate taps every ball, so it flicks none).

**The room.** (1) The dryer's new top slab **overhung the sides** and read as a white ledge stuck to the wall
rather than the machine's top; it is flush with the face now, and in the wide shot the dryer finally reads as a box
with a top. (2) The wallet's third chip was **much wider than the other two** ("cents in the jar"), which gave the
stack a ragged left edge; the small label is just "cents", since the icon is a jar. (3) In the settled room view the
camera is far enough back that **the whole machine is about 100 px wide and the jar on it is about 12 px**, so its
fill cannot be read from the room at all: the wallet chip's "14 cents" is doing that job, and the jar is set
dressing until she taps the dryer. That is a real limit of the room pose, not a bug, and it is worth the Director
knowing before phase 3 hangs more things in that band.

**⚠️ And a fault in my own looking, which is the reason the rule exists.** I first reported the jar as sitting
inside the room title's band, at 127,44 of 412x915, with the logo over it. **That measurement was taken while the
camera was still flying** from the table to the room, which takes about 0.9 s; the gate read the jar's projected
position mid flight and the shot was taken after. At the settled room pose the camera is much further back and the
dryer is low in the frame, nowhere near the title. The gate now waits for `!render.camAnim` and `render.view` to be
`room` before it measures, and it asserts the jar is below the title's bottom edge and left of the wallet column.
I had written the wrong fault into this file and into the design before the wide shot showed me otherwise.
Measured at the settled pose: the jar is at **181,400 of 412x915** and **158,320 of 360x740**, the room title ends
at 94 at both widths, and the wallet column starts at 276 and 224. It is in the clear.

### Tests and gates

| | |
|---|---|
| `npm test` | **17 suites**, all green, golden seeds unchanged |
| New: `tests/golden-seeds.test.mjs` | 2,000 seeds pinned BEFORE sockgen was touched (phase 0.2). Must pass unchanged at the end of every phase. |
| New: `tests/coins.test.mjs` | 57 checks: every moment against the table, the jar, the Daily, and that a miss takes nothing back |
| New: `tests/copy.test.mjs` | 20 checks: the calendar's name, and the dash and exclamation point laws over 484 shipped strings |
| Re-aimed: `tests/economy.test.mjs` | 28 checks, the arithmetic printed |
| Grown: `save` 30, `unlockall` 40 | save v3 and its migration; `grantEverything` gives a full jar and every find |
| New: `dev/gate-coins.mjs` | **51 checks**, a real Regular Load in the page at **412x915 and 360x740**, played to the results and back to the room, then a second Load. Run five times; green on the last three, at load 5 to 8. Added to `dev/run-gates.sh` along with `pick` and `unlockall`, which were not in it. |

**Twelve mutations were watched RED and reverted**, one per fixture: the jar rolling at 24 · the flip cap off · a
family added to `FAMILIES` (709 socks moved) · a digit changed in `DUTIES` (181 tiles moved) · the v3 migration
dropping her Quarters · `validate` not clamping the jar · a Clean Load paying twice · the door never opening ·
`coins.js` left out of the worker's precache · the calendar's old name · a dash and an exclamation point in the shop
· the door ignoring `lastMode` · a Daily overwriting her choice.

**A measurement that answers an open question in `HANDOFF-OPUS-T2.md` §4:** the wallet pill shows a coin landing
with **no layout shift at 360 wide**. The HUD row there is chipPairs 106, chipOdd 90, chipJar 63, spacer 0, pause 44,
and nothing overlaps anything; the flex spacer absorbs the new chip. At 412 the same row is 411 px of 412 with a
48 px spacer. Two other §4 answers: `?low` today changes exactly one thing, the shadow map from 2048 to 1024; and
there is no `encode` in sockgen at all, so phase 5.1's "smallest change to encode/decode" has to be designed against
`decode` and a seed string that is a bare SHA-256 hex plus `~mutations`.

### Dropped, and why

Nothing. No line of phase 0 or phase 1 became `[-]`.

### What is next

1. **Phase 2, POCKET FINDS**, at the next deploy line. Its framework first (`data/finds.json`, the recipe painter on
   a plain tile, `tools/find-sheet.mjs` LOOKED AT), then the thirty, the five sets and the five comforts, then the
   four Clothesline pegs. `grantEverything` already takes a finds catalogue and grants every find and every set it
   completes, with a test, so the tester switch will not fall behind.
2. **The Director's call on 57 cents against 45 to 55** (see the table above). Nothing waits on it: the ladder only
   moves if he wants it to.
3. **`gate-step3` and `gate-step5`**, the only two red gates. See the sweep below: the machine went quiet at 03:00
   UTC and all fifteen gates were run, one at a time. Thirteen passed. The two that failed are NOT a broken game
   and are not phase 1 (proved below); they need their own sitting.

### THE FULL GATE SWEEP, on a quiet machine (2026-09-22, 03:00 to 05:00 UTC)

The box finally went quiet (load 1.82, nothing else above 9 percent), so every gate ran, one browser at a time.

| | |
|---|---|
| **13 passed** | `step1` · `step4` (46) · `step678` (41) · `review` · `unlockall` · `pick` · `shaders` · `devpages` · `basket` · `hints` · `glb` · `radio` · `coins` (54, from this build) |
| **2 failed** | `step3` (8 of 26) · `step5` (2 of 29) |

**Both red gates are older than this build, and neither is a broken game.**

`step3`'s eight failures are ONE root with seven consequences: its first tap on the basket does not register a made
shot, so the ball stays in the hand and every later check that counts on an exact cumulative total
(`stats.mismatches === 1`, `stats.binned === 1`, `stats.wrongBins === 1`) can never reach it. `step5`'s two are the
same shape: its Static Cling step has NO assertion that the tapped sock reached the hand (a bare `until`, not an
`ok`), so a tap that does not land reads as "the power did nothing".

**The tap to lob path is not broken.** `dev/gate-lob.mjs` (new, below) walks step3's exact route on this build and
passes: `hitBasket` answers true at the very point the game projects for the basket, nothing on the table is picked
through it, and ONE tap gives `shotsMade 1`, an empty hand and the ball in the basket, with no miss counted.

**Why nobody had caught this: a coverage hole.** `step4`, `step5` and the `basket` gate ALL lob through
`TUMBLE_DEV.lobBall()`. The `basket` gate's headline is "all 50 lobs landed" and not one of those fifty goes
through `tap()` or `hitBasket()`. `step3` was the only gate that tapped the basket for real, so when it went red
there was nothing to tell a broken lob from a broken gate. I twice concluded from a green gate that the lob worked
and had to withdraw it after reading the gate's source; the third time I wrote a probe instead. **`dev/gate-lob.mjs`
now covers the one thumb lob on its own** (8 checks) and is in `dev/run-gates.sh`.

What is left for `step3` and `step5` is to find why THEIR taps do not land where an isolated tap does. Both were
last green on Sep 17; both were red on Sep 21 at load 6, **including on the code before that day's touch fix**
(START-HERE's own note), so this predates Build 2. A sensible next move: `GATE_EXTRA='&oldpick=1' node
dev/gate-step3.mjs` (the gate keeps that switch for exactly this) and compare, then look at `tapAt`'s reuse of one
`pointerId` across every tap in the run.

---

## 7. BUILD 2, PHASE 2: POCKET FINDS (2026-09-22, by Opus)

Built from `plans/tumble/exp1/DESIGN-T2.md` phase 2, to the order and the laws in `HANDOFF-OPUS-T2.md` and
`HANDOFF-OPUS-SEP22-MORNING.md`. Live as **`20260922a`**. All six lines 2.1 to 2.6 are `[x]`. Nothing was
dropped. Phase 3 and phase 7 are untouched, so the listing bar (STEPHEN'S CALLS item 2) is not met yet.

### What she will find

Things. Thirty of them, in five sets of six, and they come out of the wash the way coins do: out of the drum
when the door opens, out of the lint trap, out of a cuff when she turns a sock the right way out, and up from
under the pile when she lifts a sock. **At most one a Load**, at 22 percent on a Regular Load, so about one
every four or five Loads and thirty of them last months. Named finds are UNIQUE: once a thing is hers it can
never turn up again, and when she has them all a Load turns up nothing rather than repeating one.

A find hops where it was found, rises into the middle of the screen at 104 px with its name under it, and is
gone in two seconds. It has its own sound, which is not a coin and not a Reunion: something small and dry
landing, then two soft notes. Play never stops for it and there is nothing to dismiss.

They live on a **FINDS LEDGE**, a narrow wooden ledge under the window that is not there until the first one
turns up. On it a glass jar, a button dish, an enamel tray and a cork strip beside it. Loose things sit in the
containers; **finishing a set takes its six things out of them and sets them out together in a small framed
box on the ledge, with a hand written label** ("from one coat, one winter"). That is the whole reward for a
set: no Lint, no Quarter, no item.

They are READ in a new **Pockets** page of the Drawer: big tiles by set, the flavor line, and for a set she
has started, **the shape of each thing she has not found yet, in shadow**. Tapping one opens it big with where
it came from and which set it belongs to.

**Five of the thirty carry a comfort**, Laundry Day only: the Spare Shoelace stops a missed ball at the near
edge of the table, the Bobby Pin parks one sock on a clip while she keeps looking, the tape measure makes the
sock in her hand 15 percent bigger, the Hair Tie remembers where she left the Drawer and the door, and the
mint wrapper skips the drift into the room on a return visit. **The four empty Clothesline pegs are filled**:
Sleeves rolled up, Good light, Same again and Room key.

Her Lint, her Quarters and her jar are untouched by every line of this. A find is a collection entry and never
a payout.

### The numbers, from the test (`tests/finds.test.mjs`, 94 checks)

| | |
|---|---|
| The roll, measured over 6,000 Loads a size | small **12.0**, regular **22.3**, heavy **32.6**, mountain **45.2** percent |
| Unattended | a find every **4.5 Regular Loads** (the design asks for four or five) |
| A determined Mountain player | **28 of 30** inside 4,000 Loads |
| Where they come out, over 160 Mountain Loads | pull 32, door 12, flip 6, trap 10, clean 1, spotless 2 |
| A player who never flips and misses every shot | the **same 63** finds, 9 of them (14 percent) out of the lint trap |
| A Load with no pair matched | nothing at all |
| With every find hers | a Load turns up nothing, never a repeat |

### What was wrong that nobody had reported

Six things. Two are real game faults, one is a check that could not fail, one is dead code, and two are lines
of the design that described things the game already did.

1. **A sock the sweep RESURRECTED, and a Load that could never end.** `beginSweep` put whatever the hand was
   holding back on the table without asking whether it was still holdable. A hand still pointing at a sock
   that had already been balled or binned set it to `'table'`, `unresolvedSocks()` counted it again forever,
   and the Load could not reach its results. Unreachable through the UI today (the real match path clears the
   hand) but reachable the moment anything else picks a sock up, which phase 2's `pull` moment does. It is
   `Session.handDown` now, so Node drives the real rule and not a copy of it.
2. **The find tile's rim was painted with `1 - smoothstep`**, which filled the WHOLE disc with the rim colour.
   Every `tile` colour in `data/finds.json` was dead and all thirty tiles were one flat tan. I had written
   "the five set tints are too close together" into my notes as a TASTE fault before the fixture caught it.
3. **"Every find paints a readable emblem" could not fail.** It measured the whole disc and counted the tile's
   own rim as ink, so a find whose entire emblem was one 0.02 dot passed at 30 percent. Measuring the INNER
   disc made it a check, and it immediately caught two real finds (Receipt Gone Soft at 12 percent, Sticker
   Backing Star at 10) that were near white objects on near white tiles.
4. **The lint trap fallback was dead code that looked like it worked.** Written first as
   `fireFind(this.find.comesOut) || (...)`, which fires the find's OWN moment and therefore always succeeds,
   so the fallback branch could never run and the moment it reported was always right. Watched red, rewritten.
5. **The Hair Tie's comfort already worked for everybody.** Its line is "the room remembers her last ball
   style, basket, radio and room look", and all four are `save.equipped` and have persisted since the save
   existed. See the design tick for what it does instead.
6. **"One big Repeat button on the results sheet" already existed.** The sheet's "Another Load" restarts
   `lastPick` exactly. Same again went to the dryer DOOR, where she really does pick a mood and a size every
   time, and it names the Load ("Heavy Rush, Timed").

### ⚠️ And two about looking, which cost the afternoon

**A gate that times out and carries on is a gate reporting on a world it stopped watching.** The first run's
pictures of the results sheet, the room and the Pockets page were the SAME PICTURE of the table. Its pass
lines could not say so, because the assertions had already timed out, returned false, and the gate had gone on
to shoot anyway. Only opening the three images side by side showed it. That is how fault 1 above was found.

**A find's 2.4 second flight had always faded before a screenshot landed.** On this software renderer a shot
takes seconds. Every "look at the find" picture I would ever have taken was of an empty table, and the gate
would have gone green while proving nothing visual at all. `?holdfind=1` stops the flight at the frame where
it is settled and visible. Related, and the same scar as the camera: the first version then measured the tile
**mid flight** at `scale(.4)` and called 30 px too small. Assert it is there at once, wait for the SETTLED
value.

### ⛔ And one about this machine, which cost forty minutes

`pgrep -f chrom` and `ps -eo cmd | grep -E "[c]hrom"` **both match the shell that is running the check**,
because the pattern is sitting in that shell's own command line. The `[c]` bracket trick hides the grep from
itself, not the wrapper from the grep. I waited forty minutes for a browser that was never there, and then a
`pkill -f "chrome.*--headless"` killed the asking shell (exit 144). **`dev/box-quiet.sh`** is the answer:
`ps -eo comm` prints the binary name with no arguments and a shell cannot impersonate it. Use
`sh dev/box-quiet.sh` before any gate.

### What I SAW in the pictures (three faults each, named before he does)

Eleven shots at 412x915 and 360x740, all opened. `dev/out` is gitignored: rerun `node dev/gate-finds.mjs` and
`node tools/find-sheet.mjs` to make them again.

**The sheet of all thirty (`dev/out/finds.png`), looked at four times.** First pass: the Blue Marble read as a
blue chevron logo, the Bobby Pin as a letter, the Bread Tag as a down arrow. Redrawn. Second pass: the acorn
cap read as a bun and the bobby pin as a rune. Redrawn again. What is left and is not fixed: (1) **Bread Tag,
Blue reads as a thumbtack** before it reads as a bread clip, and its two teeth are invisible at every size; it
is the weakest of the thirty. (2) **At 48 px the tall thin objects go to mud**: the Photo Booth Strip, the
receipt and the bobby pin lose every internal mark. Anything showing a find small must use the 96 px tile.
(3) **Four of the thirty silhouette as a plain circle** (the button, the marble, the wheel, the googly eye),
which is honest, since they are circles, but those four cells say no more than a blank disc did.

**A find arriving (412 and 360).** (1) At 76 px with only a drop shadow **the sock pile showed straight
through it** and it read as a sticker lying on the pile; it is 104 px on a pale plate now and lifts off. (2)
The plate's soft edge left **a milky ring over the socks**; the gradient is tight to the tile now. (3) Not
mine, and now worse: **the "Got it" hint card sits over the dryer door**, which is where the door's coins AND
a door find fly from, so on the very first Load of a save they come out from behind a modal card.

**The results sheet.** (1) The find row had **no heading**, sitting straight under the coins' "In the pockets"
card, so the two read as one block and a receipt looked like it had come out of the jar; it is "Something
turned up" now. (2) The tile was **the palest thing on a cream sheet** and read as a hole in the page; every
find tile in the UI has a drop shadow that follows its disc now. (3) At 360 the find card is **below the fold
and part of it sits under the sticky actions bar**. The bar has a gradient that says there is more, and she
can scroll, so it is left as it is, but on her first find at 360 the new thing is not the thing she sees.

**The room.** (1) **The ledge cannot be read at the settled room pose.** It is about 95 px wide there and a
thing in a container is a 3 px dot, so the design's "the ROOM shows the containers filling" is not deliverable
at this camera. Phase 1 found exactly this for the coin jar and answered it with a wallet chip; there is a
"pocket finds" chip now for the same reason, and the ledge is set dressing until she taps it. **This is the
second time the room pose has eaten a feature and it is worth the Director knowing before phase 3 hangs four
more slots in that band.** (2) The ledge's hotspot was centred between the plank and the cork strip, which put
its 48 px box **over the dryer's corner**; the anchor is the plank now. (3) Not mine: the **ODD SOCKS label is
still clipped by the table's left rail** at both widths.

**The Pockets page.** (1) The missing ones were **five identical blank discs**, which say only "five missing",
the one count the design said never to show her; they are the objects' own shapes in shadow now. (2) The page
was a full height sheet holding six cells, so **two thirds of it was empty cream**; it is sized to content
under ten cells. (3) Reading one find and closing it **dropped her out to the room**, so reading two meant
walking back in twice; there is a "Back to the pockets" button.

### Tests and gates

| | |
|---|---|
| `npm test` | **18 suites**, all green, `tests/golden-seeds` unchanged through every line |
| New: `tests/finds.test.mjs` | **94 checks**: the catalogue, the copy and brand laws, the painter, the roll and its rate, the sets, the law of a comfort, the four pegs, the two hooks |
| Grown: `lifecycle` 42 | `Session.handDown`, and a binned sock that never comes back out of the Odd Bin |
| Grown: `unlockall` 42 | the tester switch against the REAL catalogue: all 30 finds, all 5 sets |
| Grown: `copy` | `finds.json` is in the walk: 561 player facing strings now |
| New: `dev/gate-finds.mjs` | **62 checks**, a real Load at **412x915 and 360x740**: the find arriving, the results card, the room, the ledge, the Pockets page and one find opened big |
| New: `dev/box-quiet.sh` | is this box safe for a gate (see above) |

**Eighteen mutations watched RED and reverted**: a brand name back in a title · an exclamation point in a
flavor · a comfort that makes the true twin glow · a blank emblem · a set of seven · a sixth comfort no find
carries · a find dropped from the catalogue the tester switch reads · the unique rule off (9 duplicates in 28)
· the odds read from the wrong size · the `fromLoad` gate off · the lint trap fallback removed · a find
written into the save twice · the Brass Key's three Clean Loads ignored · the law letting a comfort into Rush
· a comfort the code does not know · an empty peg left on the line · Good light made an Eyes peg · an imported
hook trusted as it came · a peg counting a stat the save does not keep · `Session.handDown`'s guard removed.

### Dropped, and why

Nothing. No line of phase 2 became `[-]`. Two lines were BUILT DIFFERENTLY from their words because their
words described things the game already did (the Hair Tie, Same again); both are written up under their ticks
in the design file, and both are Director lines if he wants them another way.

### ⚖️ Three for the Director

1. **The 57 cents against 45 to 55** is still open from phase 1. Nothing waits on it.
2. **The Hair Tie's comfort.** Its line was already true for everybody, so it now remembers where she left the
   Drawer and the door instead. If he wants the fifth comfort to be something else, that is the line to change.
3. **Good light is not an Eyes peg.** Making it one takes the difficulty ceiling from tier 8 to tier 9, which
   the design never asked for. It is a visibility comfort. If he wants the ceiling to move, that is its own line.

### What is next

1. **Phase 3, THE ROOM**, at the next deploy line: four new slots (wallpaper, floor, curtains, tabletop), the
   parametric rug, six windows, twenty more data items. ⛔ Read the room pose finding above first: four more
   slots in the band that already ate the jar and the ledge is a real risk, and 3.1's own "camera safe box and
   a screenshot test" is the right answer to it.
2. **Phase 7, PREMIUM**, after that. 2, 3 and 7 plus the free pack is the listing bar.
3. `gate-step3` and `gate-step5` are still the only two red gates and are still older than Build 2. Unchanged
   by this phase. See section 6 for the next move on them.

---

## 8. BUILD 2, PHASE 3 and PHASE 7, and the FREE PACK (2026-09-22 evening, by Opus)

> ✅ **Done and LIVE as `20260922b` (22 Sep, 21:18 UTC). Section 9 says what the pictures found.** What follows
> is the section as it was written when the codespace closed.

⚠️ **THIS SECTION IS WRITTEN AS THE CODESPACE IS CLOSING.** Everything below is committed and pushed to
`add-sproing-jumper`. **It is NOT deployed and phases 3 and 7 are NOT ticked in the design**, because they owe
pictures that the last gate run did not live long enough to produce. Live is still `20260922a`, which is
phases 0, 1 and 2.

### The one thing the next session must do first

```
sh dev/box-quiet.sh                     # one browser on the whole machine, load under 2
node dev/gate-room.mjs                  # phase 3: the safe box, the rugs, the windows, the curtains
node dev/shots-store.mjs 412 915        # phase 7's five store shots, at phone size
node dev/gate-finds.mjs                 # phase 2 again: a lot has moved under it
```
**Open every picture and name three faults in each**, then tick 3.1 to 3.4 and phase 7 in
`plans/tumble/exp1/DESIGN-T2.md`, then deploy. Nothing below may be called done before that.

⛔ **THE VERSION IS STILL `20260922a`, WHICH IS WHAT IS LIVE.** Phase 3 and phase 7 are in the branch at that
same stamp, so pushing this branch to main WITHOUT bumping first would put new files on the server while every
phone keeps the old cached ones. Bump it in all four places (`sw.js`, `src/config.js`, `index.html`, the
portal card's `?v=`) in the same commit as the deploy, the way law 1 says.

### What is built (Node green: 20 suites, golden seeds unchanged)

**PHASE 3, THE ROOM.**
- **3.1 Four new surfaces**, six looks each, 120 to 600 Lint: `wallpaper` (six patterns), `floor` (six kinds,
  a new painter), `curtains` (six kinds, and they SWAY on an eight second cycle, stopped dead by
  reduceMotion), `tabletop` (six patterns). They are single slots in `save.equipped`, not decor-list entries.
  Every default is the thing the room already had, and the materials keep their boot texture so un-equipping
  restores it rather than painting a new default.
- **3.2 The rug is parametric**: four shapes and eight patterns over three colours plus `wear`, and the MESH
  follows the shape. The `braid` drawing is the room's original, character for character, and the six rugs
  that shipped are `oval` + `braid` over their own two colours with no wear, so they paint what they painted.
  Twelve new rugs.
- **3.3 Six windows**, each with a night version. Two MOVE: rather than repaint a 256x240 canvas every frame,
  the view is painted once and one mesh slides across the glass.
- **3.4 Twenty more** lamps, plants, mugs and posters, data over meshes that already exist. 182 items now.

**PHASE 7, PREMIUM.** All ten.
- 7.1 the basket lands in its OWN material (five: wicker unchanged note for note, wire and enamel ring, cloth
  swallows, plastic knocks) · 7.2 the first ten seconds, once per install, a tap ends it · 7.3 the room's
  light follows the real hour and reapplies on the minute · 7.4 menus are paper, with a paper sound that has
  no tone in it · 7.5 the sock LIFTS (`clothLift` gives for the first quarter, then rises) and a miss FLOPS ·
  7.6 coins and finds hop once, now a check · 7.7 a contact shadow under every sock and ball, sized from each
  silhouette's own footprint · 7.8 a Reunion is one note over a radio ducked to 0.08, which lifts itself ·
  7.9 **THREE HAPTICS AND NO MORE**, and `game.haptic` takes a NAME so the rule lives at the one read point ·
  7.10 `dev/perf.mjs` has a budget.

**THE FREE PACK (4.1, pulled forward for the listing):** Plant Parent Support Group, ten socks, hers from the
first launch. Five common, three uncommon, two rare, across all eight silhouettes.

### What was wrong that nobody had reported

1. **A pack nobody could ever have owned.** `ownedPacks` filtered `save.unlocks`, and an item marked
   `start: true` is by definition never in that list. The FREE pack, the one every player was meant to have on
   day one, would have been the one pack nobody ever got. Every test was green because every test asked
   whether the pack existed and what was in it, and none asked whether she could SEE it. **A test of the thing
   is not a test of her access to the thing, and access is the only part she experiences.**
2. **A cork floor that hid the table edge.** dE 3.4 from the table's own wooden rail. This is 3.1's own line
   ("nothing may hide the dryer, the basket's arc or a table edge") and until `dev/gate-room.mjs` read real
   pixels off the canvas, nothing enforced it.
3. **`MAT_MARK` was a fiction.** A constant saying how much of its line colour each tabletop mixes over its
   base, which the Node contrast fixture used to predict the painted mat. The gate measured the real mat: the
   prediction was up to **27 units of 255 too bright**, because the painter also SHADES. So the fixture that
   protects sock readability was measuring a mat that does not exist. The averages are MEASURED now, recorded
   by the gate in `tests/mat-average.json`, read by the fixture. Against real paint the tightest mat clears
   the sock floor at dE 8.6, not the 10.1 the fiction claimed. **A prediction of a painter always flatters.**
4. **Three tabletops swallowed a loud sock.** Red gingham at dE 3.6 in tritan; then, once the CVD check was
   widened from `body` to `body`+`accent`, oatmeal at 5.8 and towel at 6.8 in deutan. All three deepened.
5. **Good light must NOT be an Eyes peg** (from phase 2, repeated here because it bit again): Eyes pegs raise
   the difficulty ceiling, and making it one took tier 8 to 9.

### ⚠️ And three about the CHECKS, which is where most of today went

- **A gate that times out and carries on reports on a world it stopped watching.** Phase 2's finds gate shot
  three IDENTICAL pictures of the table and its pass lines could not say so. That is how a real Load-hang bug
  (`Session.handDown`) was found.
- **My own room gate broke law 4 while quoting it.** The curtain sway check slept 900 ms on a renderer that
  draws about one frame a second, measured nothing, and reported `moved 0.0000`. Worse: the check below it,
  "reduceMotion stops them dead", PASSED, because the rotation had never been written and 0 was what it
  expected. **A negative assertion is only evidence in a world where the positive one has been seen to
  happen.** Frames are driven now.
- **A check for a SYMBOL is not a check for a RULE.** "The first ten seconds runs once per install" was a
  regex for `s.seen.firstTen`, which matches the line that WRITES the flag, so it passed with the guard
  deleted.

### ⛔ And one about this machine

`pgrep -f chrom` and `ps -eo cmd | grep -E "[c]hrom"` **both match the shell running the check**, because the
pattern sits in that shell's own command line. It cost forty minutes of waiting for a browser that was never
there, then a `pkill` that killed the asking shell. **`sh dev/box-quiet.sh`** is the answer: `ps -eo comm`,
the binary name with no arguments, which a shell cannot impersonate. Use it before every gate.
Related: `git checkout <file>` on a file with uncommitted work discards it. It did that to me TWICE today,
once taking 38 hand written catalogue rows. Copy to the scratchpad and copy back; never `git checkout`.

### What I SAW in the pictures

Phase 3 got two gate runs before the box closed and I opened nine shots. The default room is **byte for byte
the room it always was** with nothing bought, which was the important one. Faults found and fixed from the
pictures: the lino checkerboard took the bottom third of the frame, the ticking stripe read as an awning, the
florals as wrapping paper, the lightened cork as plain sand, the lace curtains were invisible at window size,
a `runner` rug ran off both sides of the room, and the freight train read as a fence.
**Not yet looked at: the last three fixes (runner scale, train size, mover clearing), all of phase 7, and the
five store shots.** Phase 7 has had NO pictures at all.

### ⚖️ For the Director

1. **✅ HIS PAYING CALL IS ANSWERED AND RECORDED** (22 Sep): nothing in the game is sold; the one real money
   thing is a SUPPORT THE STUDIO pack with its own contents. ⛔ NOT BUILT: it needs a Fable spec, and inside a
   Play app it is a digital good that must use **Play Billing**, not Stripe and not a tip jar.
2. The Hair Tie's comfort was already true for everybody; it remembers the Drawer and the door instead.
3. Good light is not an Eyes peg.
4. 57 cents against 45 to 55, still open from phase 1.

### What is next

1. **The four browser runs above, and the pictures opened.** Then tick, then deploy.
2. Then phases 5 (pattern families behind `genVersion`), 6 (dryers) and 8 (baskets, balls, trails, radio),
   and the other five hero packs. None of them is on the listing path.

---

## 9. PHASE 3, PHASE 7, THE FREE PACK AND ALL OF PHASE 4: PICTURED, FIXED, TICKED, LIVE (2026-09-22 night, by Opus)

**LIVE as `20260922b`** (main `5ff79a96`, Tiny World's `c6e6ae2d` merged in first). Checked on the live origin with a
random `?probe=`: `index.html`, `sw.js`, `src/config.js` (the new `isNightHour` marker, so the NEW files and not
just a new stamp), the portal card, and `www.` too. `dev/probe-live.mjs` all green: worker `sw.js?v=20260922b`,
53 cached entries, a Load starts, no console errors. ⛔ His phone: close the Tumble tab fully and open it once.

Every gate ran on a quiet box, one browser at a time, shared with the Tiny World session by message (TAKING THE BOX,
RUN, GAP, BOX FREE: it worked). Room gate **40**, store shots at **412 and 360**, the first ten seconds, finds gate
**68**, perf budget, 20 Node suites, golden seeds unchanged. 3.1 to 3.4 and all of phase 7 are ticked in
`plans/tumble/exp1/DESIGN-T2.md`, each with what changed. The free pack is noted under 4.1 (1 of 6).

### What the pictures showed, and what happened to it (every picture opened, most of them twice)

**The room gate's shots** (default, loud, quiet, four rug shapes, three windows, at 412 and 360):
1. **The radio shelf ran THROUGH the left curtain**, in the default room, so every player had it. It predates phase
   3, but phase 3 made the curtain sway, which would have sliced it through the plank on camera. Fixed.
2. **The Picnic Blanket and every rect and runner rug ran off both sides** of a 412 and a 360 phone. Rescaled to
   keep the same floor either side as the oval the old rugs always were; all 18 rugs are measured on their real
   meshes at both widths now (tightest 28 to 380 of 412).
3. **A bought rug was laid ON the braided one**, which showed round a round rug and all along a runner. A bought rug
   replaces it now, and it comes back when the rug comes off.
4. Taste, not fixed: the cork floor's front blotches read as stains at 360; the lace curtains are faint on a pale
   wall in daylight (they read at night); Cloud Blue Shag is a flat pale disc with no pile.

**The first store shots** were a silent no-op and could not have failed: `?unlockall=1` only answers on a device past
the workbench door, and the headless profile was not, so the room said 0 Lint, the Drawer "Empty for now", the
Pockets "Nothing yet". A teaching card sat over the table in two shots, the Reunion shot caught the table a second
after the word had gone, and "the room at night" had a DAWN window in it. The script now sets the door key the way
the door does, trims the grant to a lived in save (1,240 Lint, 7 Quarters, 17 finds, two sets finished), and every
shot asserts what it shows before it is taken. ⚖️ Left for him as store art: the held sock covers a third of the
table shot; the Reunion shot shows the word but not the pair meeting.

**"The room at night" found a real bug:** the lamp came on at 7:30 pm and the window went dark at 8, and the window
read the WALL clock even when the room had been told another hour. And behind that, the reason a refresh never
repainted it: **the room's `update()` is memoised on a key, and the hour was not in the key.** One clock now,
`isNightHour` in `config.js` (8 pm to 6 am, the design's words), asked by the lamp, the pendant, the window and its
light, and IN the key. Looked at 1 pm, 5:30 pm, 9:30 pm, 2 am: mean brightness 198, 188, 158, 144, the window dark
and a warm pool under the pendant at night. Taste for him: the noon SKY is painted peach.

**The finds room shot and a zoom** showed the cork strip standing in the right curtain's hem and a ledge jar in the
left one. That led to the layout law below, which found the rest.

**The first ten seconds (7.2) had never been seen by anybody**, because every gate skips it on purpose. New
`dev/shots-first-ten.mjs` opens the game as a new player does (fresh profile, no flags): **the door SNAPPED open in
one frame, and the room's own loop shut it again before it could be seen.** It swings on a curve now (`doorSwing`,
0.9 s, its shape held in Node), holds a beat, then eases shut. A screenshot lands SECONDS late on this renderer (the
first "dark" shot showed the door already open, 3.4 s in), so "does the fade start black" is answered by stopping
the fade at its first frame and asking what is on top: the fade covers the room, the title, the wallet and the
buttons. A second launch is quiet.

### What was wrong that nobody had reported

1. **The room was laid out for a wider screen than a phone.** A new check, THE LAYOUT LAW in `dev/gate-room.mjs`,
   fills the room slot by slot to each slot's real cap until every item has stood in every spot it can take, with
   the finds ledge in both states and every Reunion gift up, and asks three things at 412 and 360. It failed 14
   times on the old code:
   · THROUGH: the radio shelf, its plant, the window sill, a ledge jar and a little wall shelf through the curtains;
     three lamps, the small plant and the cat inside each other on the dresser; the odd eye lamp in the cat.
   · BEHIND a curtain: the cork strip, and the third and fourth picture frames.
   · OFF THE PHONE: **the first poster she buys hung off the left edge**, the second off the right, both big floor
     plants, the postcard gift and the Bin frame gift.
   Every spot was re-placed on a map of the real camera drawn over the real screenshot at both widths (a Node copy
   of `_fitRoom`, which predicted the pixels exactly), then proved by the law. The curtains now hang from a rod IN
   FRONT of the sill and stop above it; the radio shelf ends before them (`WALL_SHELF` in config, which the garland
   reads too); the little shelves sit above the radio shelf; the cork strip is left of the ledge; the first poster
   is beside the dryer and the next two above the clothesline; the dresser top has a row of lamps, the cat, and
   the plant and gifts in front; the postcard is on the door and the welcome mat at it.
2. **The contact shadow's fade (7.7) was computed and thrown away**, so a falling sock's shadow was full dark and
   growing, then vanished at 16 cm. It rides the instance colour into alpha (a one line shader patch; an instance
   colour only reaches RGB in three.js). The gate reads back 1.0 at rest, 0.4 at 10 cm, none at 20 cm.
3. **7.10's budget FAILED**: 147 draw calls on a Mountain Load against its 120, and `?low` saved exactly ONE call.
   Measured why: the shadow map pass was 66 of the 147 calls and half the triangles, and 65 of its 74 casters were
   room props whose shadows fall outside the table view. The design's own rule ("shadows go before socks do"):
   in the table view the room's props stop casting (`Renderer.shadowBudget`), and `?low` turns the map off and
   KEEPS the one call contact shadows. **Mountain 108 calls; `?low` 76 calls and 65k triangles against 103 and
   122k.** The table view before and after is the same picture. ⛔ **30 fps on a Pixel is still unmeasured**:
   SwiftShader on two shared cores says nothing about a phone. His phone: `?load=laundry&size=mountain&debug=1`.

### About the checks, again

- **A check of a union box is not a check of a surface.** The layout law's first version flagged the cat "through"
  a ledge bracket that no part of the cat touches: its pile was at the bracket's depth, its body at its x, and the
  box round both took the bracket in. A check that cries wolf teaches people to skip it; it compares mesh by mesh.
- **A screenshot is not a moment on this renderer.** It lands seconds after it is asked for. Anything that lasts
  under about three seconds (a fade, a swing, a word that pops) is proved by stopping it, not by timing a shot.
- **Read the key.** Three separate fixes today (the hour, the window, the swing) all failed first because a
  memoised or a looping thing elsewhere quietly undid them. The probe that found the room's key took one minute.

### ⚖️ For the Director (new)

1. Store art (his): the held sock in the table shot, and a Reunion shot that shows the pair.
2. Taste: the peach noon sky; the cork floor; the lace in daylight; the shag rug; the floating room labels ("The
   ledge", "Door", "Radio") sit ON the things they name, and "The ledge" hides the cork strip.
3. The 30 fps half of 7.10 needs his Pixel.
Still open from before: 57 cents against 45 to 55; the Hair Tie's comfort; Good light is not an Eyes peg; the paying
call is answered (nothing sold; the support pack waits for a Fable spec, Play Billing inside the Play app).

### 4.1, THE OTHER FIVE HERO PACKS: LIVE as `20260922c` (same night)

**Pet Hair Counts as Fiber, Office Kitchen Evidence, Cottage Chore Club, Found in 1998, Local Creature Report**:
ten socks each (5 common, 3 uncommon, 2 rare, all eight silhouettes), 10 Quarters each like every pack before
them. 103 heroes. Source: `tools/build-hero-packs.mjs` (readable coordinates; never hand edit the JSON). Live probe
green on `c`.

Looked at four ways: each pack's hero sheet, **`tools/hero-compare.mjs`** (new: each sock at 150, 64 and 32 px beside
the ordinary sock nearest its colour, which 4.1 always asked for and nothing did), and the table and the Drawer in
the game at 412 and 360 (**`dev/shots-heroes.mjs`**). What the looking found:
- **The FREE pack was wrong since it shipped, twice.** Four of its emblems sat on the HEEL (v 0.42 to 0.45 on a
  crew sock whose heel is 0.47), and its box helper passed full sizes to a painter that takes HALF extents, so
  every box painted double: Definitely Not Overwatering was a blue square, not a watering can. Both fixed. It is
  the pack every player owns, so this was the cheapest day to fix it.
- **False twins at heap size.** A matching game cannot have two different heroes of one silhouette that read
  alike across the table: the free pack had THREE cream crew socks, Pet Hair two black dress socks next to Uncle
  Energy's black Church Sock, and four more pairs were one colour apart. Separated by colour or silhouette.
- Pale on pale emblems nobody would see in a heap. Deepened.
- In the heap a hero reads as "a sock with a picture": the detail comes out when she picks it up. That is the
  game, and the older packs are the same.

`tests/packs.test.mjs` (new, 46) holds the six packs' shape and price, unique names, no dash, no shout, no brand
(WORD bounded: "excel" was matching "excellent"), every emblem on the leg or the top of the foot, every emblem
strongly different from its sock at heap size, and **no two same silhouette heroes within dE 10 at heap size**.
Each watched red. The economy test now READS the shop instead of a constant 95: the whole shop is 145 Quarters,
22 days at three Loads a day. ⚖️ His: whether packs stay at 10; and one older pair the law reports but this build
did not repaint (Two Stripe Tube and Tube Sock With a Zipper, two white knee tubes, dE 6.3).

### 4.2 THE HERO BUDGET: LIVE as `20260922d` · 4.3 THE SEARCHABLE DRAWER: LIVE as `20260923a`. PHASE 4 COMPLETE.

**4.2.** Both halves of the design's sentence were broken, measured BEFORE changing anything
(`tests/herobudget.test.mjs`, 200 Loads a size at every tier): `round(pairs * 0.1)` gave a Heavy Load four heroes,
and heroes only stood where `i % 7 === 3` among the base pairs, so at the top tier **44 of 200 Small Loads had no
hero and a player with only the free pack saw it in 0 of 200**. Now `max(1, floor(pairs / 10))` at places spread over
the base pairs, exactly that many every Load. A pack remembers the Load it was bought at (`save.packBought`, inside
v3) and gets the first hero place for her next ten Loads. The Daily is byte for byte the Load it was (8 of 8 against
the old generator). `economy.ownedHeroes` still carried the free pack bug app.js fixed on 22 Sep: fixed. And the
wiring was proved IN THE PAGE: `Game.start` passes a named list of options to the generator and silently drops the
rest, so `dev/shots-heroes.mjs` watched it red with the pass-through removed, then green.

**4.3.** Found lately (the last 24) beside All, Heroes and Missing a mate; under Heroes the pattern row becomes the
packs, so no fourth row of chips on a 360 phone; a pack left chosen never hides anything outside Heroes; it
remembers where she was within a sitting (across sessions stays the Hair Tie's comfort). Pure rules in
`src/drawerlist.js` (`tests/drawer.test.mjs`). `dev/gate-drawer.mjs` taps every chip with a real pointer.
⛔ **It went red on its OWN flaw first, twice:** it measured chips while the Drawer sheet was still sliding in (the
slide starts the frame AFTER openSheet and takes 3.4 s here), and "wait until the rect holds still" was not enough
either, because before the slide begins the rect IS still, just in the wrong place. A one minute probe settled it
(once the sheet has settled, one trusted click lands on the chip). The gate now taps only when a hit test finds the
chip under the finger twice running. Faults named (taste): the choice row is wider than the phone and centring the
chosen chip hides "All"; long pack names; the total line does not follow the filter.

### Sharing two cores with Tiny World (it worked; the rules we fell into)

TAKING THE BOX / RUN before any browser, GAP or BOX FREE after, SUITE DONE from them. Node tests can run over the
other's Node tests; a probe of the live site can run over a suite if offered; a GATE needs the box quiet. ⛔ They
once ran `pkill -x node` to stop their own server, which kills every node process of the user, ours too: if a
gate ever reports "killed" or a strange crash, ask before believing it.

### PHASE 5: 5.1 THE VERSION MARK, LIVE as `20260923b` · 5.2 SIX FAMILIES, LIVE as `20260923c`. PHASE 5 COMPLETE.

**5.1.** The mark is one more mutation, `~g.2`, after the 64 hex characters: no seed ever carried a `g` key, decoys
keep it, and an older cached client ignores a key it does not know. `GEN_FAMILIES[2]` = the ten, then the six at
the END. The Daily takes its version from its DATE (`dailyGen`), never from the build a phone runs, and stores it in
`save.daily` and `dailyHistory`. `tests/golden-dailies.json` pins every Daily from 1 to 23 September.

**5.2.** `MINT_GEN = 2`: every sock minted from now on is marked. `DAILY_GEN2_FROM = '2026-09-24'`, so no Daily
anybody played moved. Six painters in `engine/sockgen.js` (herringbone, basketweave, windowpane, pinstripe, tweed,
lattice), each with a DECOY rule in `RHYTHM_VISIBLE` (loadgen) that `tests/families.test.mjs` proves EXACT bit by bit
on every silhouette. Colour blind floor: each shows at least as well as polka (the weakest shipped family) at the
5th percentile over all palettes and all four ways of seeing. `tests/golden-seeds-v2.json` pins the same 2,000 seeds
marked (the unmarked file did not move). `match` and `variety` now say they measured version 2 and all six.
`dev/shots-gen2.mjs [w h]` puts them in a real Heavy Load, on the card and in the Drawer, and taps Tweed for real.

**What the pictures found (fixed; no test had seen any of it):** the six had no SOCK NAMES (every card, the
Drawer search and the pop would have read "Bold Lemon undefined Dress Sock") and no share card rarity (a herringbone
ranked as plain as a solid): both tables now, each held by a test watched red. Tweed's first cut (flecks of both
accents spun at any angle, the body mottled cell by cell) read as TV STATIC on the card and GOLD GLITTER in the heap:
now a heather, mottled in soft patches, with fat dashes lying along the knit rows, mostly a thread of the body's own
colour. And the card itself drew every sock from the Drawer's 96 px thumbnail stretched over 200 px, which is why
a fine pattern went to blocks: a sock's own card now paints it at 192 px (every family's card is sharper).

⚠️ A SHARED version 2 link opened on a phone still running an older cached build shows the wrapped version 1 family
for values 10 to 15 until that phone updates (the usual "close the tab once" law covers it). The same goes for the
24 September Daily: a phone still on `20260923b` builds it at version 1, so two players comparing that one Daily
may not be looking at the same Load until the older phone updates.
⚖️ Taste, his: whether lattice (cream knots on a trellis) reads too near polka at heap size.

### 6.1 THE DRYER'S LOOK DRIVES THE MACHINE, EIGHT FINISHES: LIVE as `20260923d`

`src/dryerlook.js` (pure) resolves a dryer's `look` into every part the renderer paints and `dryerLoads()` into
what it does; both used to be keyed by the model's NAME (a colour table in `render.setDryerLook`, name checks in
`app.js`). The five old dryers are data and resolve to exactly the old numbers (`tests/dryers.test.mjs` writes them
out by hand). Eight finishes at 8 to 14 Quarters, every one a Regular Load. The One With the Radio sends the station
through a radio bus (lowpass 1.5 kHz, gain 0.55) in `audio.js`. `dev/shots-dryers.mjs [w h]` equips all thirteen in
the real room, reads the materials back from the page, checks the radio routing and the Industrial's bigger Loads,
holds the TAG LAW and crops each dryer from the room and the table camera.
**The pictures found:** two near twins (Copper Top and the Clothesline; the Heat Pump and the porcelain), galvanised
reading as crazy paving, and the phase 2 LEDGE TAG sitting on the dryer's control strip (it hangs above the ledge
now). ⚖️ For him: the whole shop is 234 Quarters, 35 days at three Loads a day (see DESIGN-T2 6.1's note; the
economy test's "a month" was its own number, it now holds "no one thing over three days of play").

### 6.2 THE HOTEL LAUNDRY CART AND THE APARTMENT LAUNDRY CHUTE: LIVE as `20260923e` (23 Sep, 05:28 UTC)

Main `f814d4dd`. Checked live with a random `?probe=`: the page, `sw.js`, `config.js`, the NEW files (`arrivals.js`,
`textures.js`, `render.js` by markers only this commit has; three modules byte identical to the tree), the portal
card `?v=20260923e`, and `www.`. `dev/probe-live.mjs` all green: worker `sw.js?v=20260923e`, 56 cached entries, a
Load starts, no console errors. ⛔ His phone: close the Tumble tab fully and open it once.

**The acceptance test, in the running game** (`dev/shots-arrivals.mjs`, green at 412x915 and 360x740): one Load
seed through the door twice (the control), then the clothesline, the cart and the chute: **0 of 42 socks differ to
the micrometre**, the same coins (dime and penny at the door moment), no prop left standing when play begins, the
chute's mouth above the porthole on the real camera (y 72 against 108 at 412, 59 against 90 at 360), no errors.

**What the first pictures showed (the 412 set from the last session, never opened, and a new 360 run):**
- Cart: tipped 66°, so the table camera looked straight into its mouth: a white card in a wire cage. The heap sprayed
  out of the MIDDLE of the bin, one sock straight up. It rolled in over the Odd Bin and out THROUGH the basket
  (parked, 4 mm inside it; 2.6 cm inside the Bigger one). Its load was nine pastel capsules on end (crayons).
- Chute: a flat grey slab hanging in front of the porthole, so it read as the dryer door; socks stuck out through
  its walls at the start of every burst (a knee high reaches 20 cm from its middle; the duct was 20 wide); its hard
  shadow lay across the mat like a stain.

**`dev/strip-arrivals.mjs [w h] [kinds]` (new)** films a WHOLE arrival: it pauses the Load the frame its playback
exists and scrubs `pb.t` by hand (the paused loop still draws at `pb.t`), ten frames a kind, cropped to the back
of the table. One busy frame per arrival had hidden most of the above. Its second and third looks caught what the
FIXES broke: a hinged flap that hung open across the porthole for most of the arrival, a flared hopper that read as
a kitchen range hood, a falling column framed by the porthole glass (socks "in the drum"), a slot round the cart's
rim showing the table, and **the Odd Bin's folded front flap and its label standing INSIDE the parked cart** (my own
new law had boxed the Odd Bin at its walls; its flaps reach 5 cm further, and the floatie basket's ring 5 cm past
its rim).

**Now:** the cart is slim (30 x 13 cm, the only strip between the Odd Bin's flap and the play area), parks at
x -0.07, rides over the table's rail, tips 46°, and each sock starts just under the mouth and is POURED over the lip
on a curve (the back of the heap lands UNDER the tipped bin, which Build 1's straight arc could only reach through
the canvas; a sock's middle leaves through the mouth, sideways after the lip); a lining drawn from inside the same
box, a push handle, a load of banded rolled socks that sinks as it pours, and it leaves the way it came. The chute
is a galvanised duct out of the ceiling (seams, rivets), mouth at 0.95 m and x 0.2 (above and right of the porthole;
over the jar was the other side), a rolled lip, no flap, no shadow, a 1.5 cm thump per burst; its socks FALL from
rest, spread late (k cubed) and come out at 40 percent size growing with the fall: the largest start its walls
allow (0.45 comes within 6 mm of the steel over five heaps, faster growth goes through). The door's coins moment
now comes out WITH the laundry (the pour, the first burst), because at t 0 the cart is still off screen.

**Laws** (`tests/arrivals.test.mjs`, 11, each watched red): the pour leaves every bin through the mouth (walked along
every flight); the cart's whole trip clear of the Odd Bin WITH its flaps and both baskets at their widest style,
parked off the play area, over the rail, leaving left; no chute sock through the duct (each silhouette's collider
reach times its size); no cart or chute sock through the basket or the Odd Bin (a plain chute over the basket did
NOT go red, because a falling sock spreads before rim height; it went red with a late spread, so it can see);
the coins with the laundry; Build 1's arc for the door and the clothesline written out by hand. 27 suites green,
golden seeds unchanged. ⛔ The in page porthole check was not watched red IN A BROWSER: its red is the same camera
projected in Node (`_fitTable` copied; it predicted the pictures to the pixel): the old 0.66 m mouth at y 173
against the ring top at 99.

**Found, NOT fixed (his call or not 6.2's):**
1. **The clothesline (Build 1, live since 17 Sep): the dryer door swings open and its coins ping from the door,
   though the socks fall from above.** A small change, but a live behaviour, so his.
2. Every heap shot: a sock standing on its edge against the left rail reads as a grey clip; at 360 the pause button
   is squeezed into a narrow pill by the jar pill; the top right wall picture sits behind the pause button.
3. The cart rolls in across the table's edge: for about 0.1 s its left half is past the rail, over the floor.
4. Taste: the chute's rivet row reads a little like vent slots at 412; the falling column still brushes the ring's
   right edge; the cart is small beside the dryer; the tipped cart reads as a tray for a quarter second before the
   pour.

### PHASE 8, LINE 1: EIGHT BASKETS, LIVE as `20260923f` (23 Sep, 07:07 UTC)

Main `9f1ff1e3`; live checked with random `?probe=`s (page, worker, `render.js`, `room.js`, `unlocks.json` and
`textures.js` byte identical, the portal card, `www.`); `dev/probe-live.mjs` green on `f` (56 cached entries, a Load
starts, no errors). Enamel Wash Tub, Rope Coil Basket, The Open Suitcase, Little Red Wagon, Upside Down Umbrella,
Brown Paper Grocery Bag, Wool Felt Bin, Sunday Bread Basket: Lint only (200 to 1,000; 3,900 = about 20 days), each
landing in the material 7.1 named for it.

**The rule that shaped them:** a basket is ROUND in the physics (slats and rim capsules, scored by distance from its
middle). So each keeps the wicker basket's round opening, size and rim, a look and never an advantage. A square bag
or a rectangular wagon bed would put visible walls where the physics has none; so the wagon is a round tin tub riding
in the wagon, and the umbrella's handle hooks over the back rim instead of standing up the middle.

**Checks:** `tests/baskets.test.mjs` (7, watched red) and `dev/shots-baskets.mjs [w h]` (new; `BASKETS_ONLY=measure`
skips the crops): all twenty equipped in the real room, what the page DREW read back: the room shows the equipped
basket, every basket is drawn (an unknown style draws NOTHING), its front half inside R + 5.2 cm (the hotel cart's law
rests on that), nothing in the ball's path, nothing off the table, a Load with the tub lands in enamel (that one was
green on arrival: 7.1 had already named the materials), and the shop cards whole at 412 and 360.

**Live faults found on the way, fixed:** (1) the room never showed the basket she equipped: `start()` was the only
caller, so a basket bought in the shop appeared at her NEXT Load; (2) the Wire Basket and the Frosted Wire Basket were
twins (dE 7.2): the wire style ignored its second colour (Frosted is ice blue with a white rim now); (3) the Hollow
Log's moss sat 5 cm inside its rim, over the opening.

**What the pictures did (three looks at 412 and 360):** the tub's band hid under the rim; the suitcase's lid was a
flat pink plate and its straps faced the wall; the umbrella read as a striped bucket, then as a BEACH BALL when its
canopy was made fuller (a basket is taller than wide), so the bulge went back and its parts say umbrella (scallops,
rib points, the crook); the paper bag was a kraft bucket (soft corners, outward only); the felt was grey plastic;
the napkin corners were flat flags. ⚖️ **His:** the umbrella is still the weakest read and its scallops dip 1.8 cm
below the physics rim; the paper bag is round where a bag is square; every basket card in the shop has one shared
basket icon (per style icons would help the wagon and the umbrella most); the new descriptions run a line long;
the prices.

### PHASE 8, LINE 2: SIX BALL STYLES AND SIX TRAILS, LIVE as `20260923g` (23 Sep, 09:07 UTC)

Main `29cc3275`; live checked (page, worker, the two NEW modules `balls.js` and `trails.js` by markers, `app.js`,
`render.js` and `unlocks.json` byte identical, portal card, `www.`); `dev/probe-live.mjs` green (58 cached entries).
Balls: Sock Rose, The Burrito, Figure Eight, The Soft Knot, Crossed Ankles, Cuffed Donut. Trails: Running Stitch, Three
Bubbles, Dryer Static, One Firefly, Two Falling Petals, Soft Steam. Names from the answers (lane E); Lint 150 to 400.
The answers' boxy folds were left out: every ball is ONE sphere in the physics, so a style is a look and a brick would
roll like a ball.

**Laws** (`tests/balltrail.test.mjs`, 11, watched red): Build 1's four balls and three trails written out by hand and
unchanged; no new ball floats or sinks more than Build 1's already do (outline in 300 directions); no new style within
3 percent of another POINT BY POINT (by outline the Figure Eight, whose point is its waist, sat 2.4 from the Burrito:
an outline cannot see a hollow; Build 1's own Tight Roll and Mom are 2.2 apart); each new style shades its folds; every
trail fades inside 1.2 s. **Three names are counts** (Three Bubbles, Two Falling Petals, One Firefly) and Build 1 leaves
sprites per FRAME (twice as many on a 120 Hz phone), so those three are counted per SHOT on the shot's own clock; the
firefly is one sprite that follows the ball a beat behind. `dev/shots-balls.mjs [w h]` (new; `BALLS_ONLY=balls`) holds
the page: a sprite of its own per trail, sprites in the air at a PHONE's frame rate (it turns turbo off for the throws:
turbo leaves a per frame trail one sprite where a phone leaves twenty), the meshes, the shop icons.

**What the pictures did:** the held ball shows the camera its UNDERSIDE, and all six new styles were one green lump: a
knit bundle reads by its shadows, so each darkens its folds through the shader's `aShade` (the rose's coil on both
faces, the knot's band past both poles); the new trails were near invisible (a 30 px stitch drew 6 px dashes) and are
now sized like Build 1's hearts and dust. ⚖️ **His:** the stitch's dashes are flat to the screen; styles are subtle on
the table at a quarter of their held size (Build 1's were too); Build 1's Tight Roll and Mom are near twins; the shop
icons are small; prices.

### PHASE 8, LINE 3: THE RADIO, EIGHT PLACES PLAYING HIS SONGS, LIVE as `20260923h` (23 Sep, 09:44 UTC)

Main `1f1c6d74`; live checked (page, worker, `audio.js`, `unlocks.json`, `screens.js` byte identical, portal, `www.`);
`dev/probe-live.mjs` green; **`dev/probe-live-radio.mjs` (new) plays all eight stations on the live site: each plays
HIS real song, proved by the file's own length** (it was watched red on `20260923g`, which had none).

| station | his song |
|---|---|
| Kitchen After Midnight | Fold It Up |
| Rain in a Parked Car | Who's Sock Is This |
| Library Basement at Closing | Nightmarish Lo-Fi |
| Late Train Home | Modular Jazz Hub |
| Diner Booth at 5 A.M. | The Suspicious Menu |
| Greenhouse With the Hose On | Gayageum Janggu |
| Someone Vacuuming Upstairs | Hard Gayageum Janggu |
| The Shop Before Opening | Quite The Throwdown |

⚖️ **The pairing is mine** (measured from the files: brightness, low end, tempo, dynamics; and two titles, a menu for
the diner and a hub for the train). His to change: one `look.url` each in `data/unlocks.json`. 200 Lint each; each card
names its song. Each station also has a generated bed of its own (`PLACE_BEDS` in `audio.js`: the fridge's hum, rain,
a basement's air, the rails, a walking bass and brushes, drips, a vacuum moving room to room, a cup set down) for when
the file cannot play: a station kind the synth was never taught plays SILENCE.

**Checks:** `tests/radio.test.mjs` (5, red first). `dev/shots-radio.mjs`: each station starts his song at the served
path first; here the file is absent (his music lives in its own repo), so it falls back and the bed SOUNDS on the
radio bus, against a silent control and Build 1's quietest station. ⛔ **The check's own fault, found by rerunning it:**
it first listened for 1.5 s, and the same kitchen bed read 2.8e-3 at 360 and 5.9e-4 at 412 (a short window lands in a
bar's quiet stretch); it listens for a whole bar now. And the Steady Rain reads as silence on the radio bus (its rain
has its own bus), so it is left out of the yardstick, or the floor would mean nothing.
**The pictures:** "5 A.M." broke across lines at 360 and "Lo-Fi" at its hyphen (fixed with no break characters). His:
"Greenhouse With the Hose / On" leaves "On" alone at 412; the cards run long.

### PHASE 8, LINE 4: TOMORROW, LIVE as `20260923i` (23 Sep, 10:40 UTC). PHASE 8 COMPLETE, SO BUILD 2 IS COMPLETE.

Main `07651ec3`; live checked (page, worker precaches `tomorrow.js`, `loadgen.js` by its new marker, `app.js`, `room.js`,
`save.js`, `render.js` byte identical, portal, `www.`); `probe-live.mjs` (59 cached entries) and `probe-live-radio.mjs`
green on `i`.

- **The Odd Bin's note is TRUE.** A Laundry Day Load used to roll its seed as it started, so nothing could know the next
  one. Now `save.nextSeed` holds it, the door plays exactly it (`app.start`), and loadgen draws the reunion from the
  seed's OWN stream, so the size or tier she picks cannot change it (197 of 200 seeds used to). Pairs unmoved
  (`tests/golden-bin-pairs.json`, recorded before); 30 percent holds. ⚠️ Said out loud: in a Load WITH socks in the Bin
  the draws after the reunion (other odd socks, the shuffle) came out differently; nothing stores a Load but the Daily,
  and the Daily has an empty Bin (unchanged). The note: a torn slip standing in the Bin, its line at the head of the
  Bin's sheet (`src/tomorrow.js`, eight lines, none names a time).
- **Yesterday's Load:** `save.lastLoad` = the pairs she put in the basket (up to five), rolled on the dryer top right of
  the coin jar, painted as themselves, put away when the next Load starts.
- **The cat has moved:** the dresser top, the towels by the door, the rug by the table, one a day (`R._catDay` pins it).
- `tests/tomorrow.test.mjs` (4) and `dev/shots-tomorrow.mjs [w h]` (the door really plays the foretold seed and the mate
  really comes home; fold after a real Load; each cat spot inside nothing, on screen, under no button).
- **Found by looking:** a second row of folded pairs stood in the chair rail; the towel cat was inside the top towel; and
  the first fold and cat pictures were of the RESULTS sheet: the gate returned to the room underneath it and every
  geometric check still passed. It now leaves through the results' own Room button, tapped, and checks the sheet shut.
- ⚖️ His (taste): the towel cat is half behind the table's corner from her view, and at 360 the Door tag touches its
  head; the slip is too small to read in the room; the rolled pairs read a little like marbles at room size.

### WHAT IS LEFT (everything in DESIGN-T2 is built; what remains is his)

1. **Listing Tumble on Play** ($0.99, nothing sold inside, web copy free): name, target age, store art (the held sock
   covering the table shot, the Reunion shot that shows the word but not the pair), then the workbench gate comes off.
2. **30 fps on his Pixel**: `?load=laundry&size=mountain&debug=1`; no machine here can measure it.
3. **The radio pairing** (mine, one `look.url` each) and prices across the shop (baskets 3,900 Lint; balls and trails
   150 to 400; stations 200 each; the dryers 234 Quarters).
4. Taste notes from this build, all named in DESIGN-T2 under each line: the umbrella basket, the one shared basket icon,
   the stitch trail flat to the screen, Build 1's near-twin Tight Roll and Mom, the towel cat, the Backyard Clothesline
   opening the dryer door although its socks fall from above.
5. Older open calls: 57 cents against 45 to 55; the Hair Tie's comfort; Good light not an Eyes peg; whether lattice
   reads too near polka; the peach noon sky.

### LISTING PREP, LIVE as `20260923j` (23 Sep, 14:54 UTC, main `ad7b0f03`). His words: "get it all together cuz I want to be able to list the game"; then "tell me when it's ready to test and I will test everything and give you a final edits list before we submit".

**His calls (23 Sep, recorded in `store/tumble-play/PLAY-CONSOLE-FIELDS.md`):** Play name **TUMBLE: Sock Sorting**,
**$0.99**, audience **13 and over**, the tester gate comes **off with the build he submits** (it stays ON for his test
build: nothing public before his final edits).

**The full sweep on `20260923i`, one browser at a time: 17 of 20 green**, then:
- `step3` (red since Sep 17): **a real bug, found by probing it.** The teaching card sits up top over the dryer, the Odd
  Bin and the basket, and a new player's first basket tap landed ON THE CARD (it only dismissed the card). Fixed in `j`:
  a hint card's body lets taps through (only Got it takes one), a teaching card retires once she has done what it
  teaches (`ui.retireHint`: her first pair; picking up a missed ball), a tap anywhere clears a timed hint and still
  reaches the game. `gate-hints` holds it (3 new laws, red first). `step3` now passes all 27. ⚠️ Its hold and tap part
  failed ONCE in between (4 checks) and passed twice: flaky, not closed; run it twice more.
- `step678`: its shop checks were stale (`/cat/` matched the Seed Catalogue poster; the free pack reads "Yours" and was
  the one it clicked to buy). Fixed exactly; green.
- `basket`: **48 of 50 lobs land (2 miss), every run, and the build from before today (`20260923d`) does the same**,
  so it came in between Sep 22 04:25 (50 of 50) and Sep 23 03:02. OPEN: bisect those commits (a sparse worktree of
  `satellites/tumble` in /tmp works; link BOTH node_modules, the repo root's has puppeteer; UNLINK them before
  `git worktree remove`). It is a full Mountain basket (50 balls) so it may be capacity, not a player fault.
- `perf.mjs` now equips the busiest baskets and catches every arrival mid spill: the umbrella (123), wagon (121) and
  hotel cart (156) were OVER the 120 call budget. Merged (ribs, wheels, the cart's frame, casters, load on one texture
  sheet, its open bin): 109, 115, 116. Green. Pictured after the merge.

**Listing package, done:** copy rewritten for Build 2 from COUNTED data (`PLAY-LISTING.md`, 76 and 1,689 characters,
voice checked), a full bleed store icon (`store/tumble-play/play-icon-512.png`, `make-icons.mjs --store`), the privacy
page serves the email, assetlinks.json is live (FTW's entry; Tumble's goes beside it).
**Listing package, NOT done (in this order):**
1. Store screenshots: `node dev/shots-store.mjs 432 768 2.5` (= 1080 x 1920 pixels at a phone's layout; the old
   1080 x 2400 plan would be REJECTED, Play's long side is at most twice the short) → open them, copy to
   `store/tumble-play/play-shot*.png`.
2. Feature graphic candidates: `node dev/shots-feature.mjs` (written, never run) → open, pick, downscale to 1024 x 500.
3. The Android bundle: `bash store/ftw-play/twa/setup-toolchain.sh` (the /tmp toolchain died with the codespace),
   build in /tmp (only 2.9 GB free on /workspaces), a NEW Tumble upload key (`~/.tumble-keys`, alias upload) kept in a
   private vault release like FTW's `vault-20260906-ftw-upload`, sign the AAB, add the upload key's SHA-256 to
   `/.well-known/assetlinks.json` under `com.skywolfstudio.tumble`. `store/ftw-play/BUILD.md` is the road.
4. His test, his edits list, the edits, then the SUBMIT build: tester gate off (`satellites/tumble/index.html` loads
   `/dev-gate.js`; remove it), `beta:true` off the portal row, flip `dev/probe-live.mjs`'s "a first visit sees the gate".
5. His, in the Play Console: the home address off the listing BEFORE submitting (START-HERE), create the app, upload,
   send Google's app signing SHA-256 back for assetlinks.

### HIS EIGHT TUMBLE SONGS (given 23 Sep ~03:20 UTC), SAVED AND LIVE
Masters: private vault release `vault-music-tumble-20260923` (the zip exactly as he dropped it, sha256 07ccfbba...).
Web copies (128k, 44.1 kHz stereo, title + artist tags): private repo `lucid-winds-music`, commit `2f2bee4`, under
`v1/tumble/`: fold-it-up, gayageum-janggu, hard-gayageum-janggu, modular-jazz-hub, nightmarish-lo-fi,
quite-the-throwdown, the-suspicious-menu, whos-sock-is-this (`.mp3`). **LIVE:** all eight answer at
`https://lucidwinds.com/music/v1/tumble/<slug>.mp3` (checked 23 Sep about 03:37 UTC with a `?probe=` and a range request:
206, `audio/mpeg`); he tapped Deploy. They are for PHASE 8's radio stations (a station plays `look.url`,
the synth loop is the fallback). ⛔ Audio never enters this repo; `_music-drop/` is locally ignored.

### Next (was: 6.2 then phase 8; both DONE 23 Sep, see above and WHAT IS LEFT)

Every phase of DESIGN-T2 is built, pictured and live. What is left is his (the list above). **His paying call is FINAL (23 Sep): $0.99 on Play, nothing sold inside, the support pack DROPPED, the web
copy free.** Never build anything sold. Music: 144 of his tracks are live at /music; the Track player plays a radio
item's `look.url`; he may name songs for the stations (phase 8).

---

## 10. THE 23 SEP REVIEW OF BUILD 2, HIS SIX NOTES BUILT, THE LISTING PACKAGE (23 Sep afternoon and evening, by Fable)

### The review of Opus's 23 Sep, against the code and the live site (a worktree of `ad7b0f03`, one browser at a time)

Every claim in section 9 was checked where it lives, not in the handoff:
- **The arrivals end on the same heap.** TRUE. `dev/shots-arrivals.mjs` at 412: the door against itself, the
  clothesline, the cart and the chute each 0 of 42 socks differ to the micrometre, the same coins (dime and penny at
  the door moment), the cart on screen at 1.2 s, the chute's mouth at y 72 above the porthole top at 108. Pictures
  opened: the cart mid pour reads as a white tray for the frame of the pour (Opus said so); the duct's rivets read as
  vent slots (also said). Nothing new wrong.
- **The Odd Bin's note is true.** TRUE in the code: `save.nextSeed` is rolled ahead (`app.js` 60), the door plays it
  (`app.js` 612: `pick.seed || s.nextSeed`), and loadgen draws the reunion from `rng32(seedInt(seed + '|reunion'))`,
  the seed's own stream, before the size can touch it. `tests/tomorrow.test.mjs` 4/4.
- **The radio's eight stations play his songs.** TRUE on the live site: `dev/probe-live-radio.mjs` on `20260923j`,
  each station plays its real file, proven by the file's length (Fold It Up 104.7 s ... Modular Jazz Hub 167.8 s).
  (Rewritten today into a music player: below.)
- **The hint card never eats a game tap.** TRUE by mechanism: `gate-hints` 14/14, the card body's computed
  pointer-events is none and Got it's is auto; `step3` passes its first basket tap. ⚠️ One of its lines proved
  nothing: "with a teaching card up, a tap on the basket lobs the ball in" ran at a width where the card did not
  cover the basket ("covers the basket: false"), so the overlap it was written for was never exercised; the style
  check carries the fix. At 300 px (the basket gate's viewport) the card DOES cover the basket's left half, and
  the first picture of step3 shows it over the dryer, the Odd Bin and the basket.
- **The draw call merges.** TRUE: `dev/perf.mjs` Mountain 108; in play wicker 110, umbrella 109, wagon 115, bread
  117, suitcase 115, floatie 107; spills standard 110, clothesline 110, cart 116, chute 115. All under 120.
- **The full sweep:** shaders, step1, step3, step4, step5, step678, devpages, review, glb, radio, hints, coins, pick,
  unlockall, lob all green; **basket 48 of 50** (below). Live: `probe-live.mjs` green on j, `probe-live-radio` green.
  31 Node suites green on `j`.

### The two open items

- **`basket` lands 48 of 50 on j.** Reproduced: 48 of 50, the two misses ROLL OUT after landing (the picture shows the
  missed ball teaching card up with 0 pairs left and a ball on the shelf beside the basket). The diff from the last
  50 of 50 (`46f06445`, 22 Sep 04:47) to `dd83857e` (23 Sep 03:02) touches no lob, no basket collider, no ball
  physics and not `KEEP_PHYSICAL` (3 throughout); the one physics change is the Spare Shoelace rail, off at tier 0.
  Bisected by a diagnostic (which lobs miss, where each ball rests) on `46f06445`, `258eb36d` (phase 2), `b164eddd`
  (phases 3 and 7) and today's tree. **RESULT: it was the pile, never the basket.** The misses are the SECOND and
  THIRD lobs, with one live ball in the basket (never capacity): ball 2 came to rest ON THE PILE mid table (12 cm up),
  ball 3 beside the basket. The trees of 22 Sep 04:47 and 15:22 land 50 of 50. And in Node, the Load for the gate's
  seed is sock for sock the same in every tree up to phases 3 and 7 (103 socks) and DIFFERENT in today's tree (102
  socks, every one different): the 23 Sep morning commits (the hero budget, the families) changed what a seed deals,
  and today's code dealing the OLD pile lands 50 of 50 (a hybrid tree, `/tmp/bisect/now-oldload`). The mechanism,
  read in `play.lob`: the tap lob ignored where the ball was and always left from ONE fixed spot, 25 cm up at the
  front of the table; this Mountain pile stands taller than that there, so the second and third balls were born
  inside the socks and came out short. **Could a player hit it: yes.** The tap path is the one that promises
  "flicking is never required", and a fresh Mountain pile can be that tall at the front. It was a miss she picks up,
  never a lost ball; it cost Spotless on a perfect Mountain. **That mechanism was then DISPROVED** the same way: a
  lob launched just above the pile (a ray at the launch) still missed balls 2 and 3, and so was a second one (a ball
  that has landed goes soft, so the next lob cannot bounce off it and out: still 48 of 50). Both changes were TAKEN
  OUT: nothing unproven ships. The flight watched frame by frame says what it is NOT: neither ball ever entered the
  basket (`everIn` false), each was on the normal arc a fifth of a second in, and each fell short (one onto the pile
  mid table at 12 cm up, one at the basket's near right rim). What is proven: it is the Load this seed deals since
  the 23 Sep morning commits (the same code with the old pile lands 50 of 50), two lobs of fifty on one Mountain
  pile, both short, never a lost ball. What is NOT known: what turns those two arcs. ⏭ The next look: film those two
  flights with the physics stepped by hand (`dev/shots-lid.mjs` shows how) and read the sock that stands in their
  way. The listing does not wait on it.
- **`step3`'s hold and tap part.** Reproduced: green, green, then RED on the third run of the day (the same four
  checks Opus saw once), with the box's load over 3. Cause found in the gate, not the game: the twin's screen place was
  read in one browser call and the second finger's tap dispatched in the next, and under load the software renderer
  steps the physics between the two (a held sock thaws its neighbours), so the twin had moved out from under the tap.
  That was HALF right (the read and the tap are one call now), and it failed again with the SAME coordinates (ball
  214,263, finger 251,489) as the sweep's failure, which no timing fault gives. The whole of it: lifting the first
  sock thaws the pile, a neighbour that rested on it slides onto the twin, and the second finger's tap picks the sock
  now ON TOP, a mismatch, which is exactly what a real finger gets (the held sock is already excluded from every pick,
  `physics.pick` and `_footprints` both). The pair the gate happens to choose differs run to run with the software
  frames, so two piles pass and one fails. The gate now asks, in the same call, what a finger at the twin's place
  would pick after the hold, and if it is not the twin it puts the sock down and tries the next visible pair, saying
  so. Not a player's bug. On the rewritten gate (far apart pairs first): green three times in a row, 26 of 26 each,
  and it never once had to retry.

### HIS NOTES OF 23 SEP, BUILT (Fable, 23 Sep afternoon)

His words first, then what each really was, then what was done. Taste calls left to him are marked ⚖️.

1. **"On the rush version it shouldn't stop when your time's up ... bronze silver gold and platinum time based on the
   load size and speed instead of having it cut you off."** A design change. Timed Rush and Basket Balance no longer
   end by the clock: the Load ends when the table is clear, like Laundry Day, and the time it took is set against four
   times from the Load itself (`RUSH.medals` in `src/session.js`): the old clock (seconds a pair by tier plus a little
   for each odd sock) is the GOLD time, platinum is 0.7 of it, silver 1.4, bronze 1.9. A medal pays points
   (`RUSH.medalBonus`: 1000, 600, 300, 100) so the Daily Rush's score still rewards speed, and the Daily's four times
   are the same for everybody. The HUD bar now FILLS with the time taken, toward the bronze time, with three marks
   (platinum, gold, silver) and the colour of the medal still in reach; the stopwatch chip names it. The result sheet
   shows the medal, the time, the next time to beat and her best on that size (`stats.rushBest`, `stats.medals`,
   save fields with a sanitiser). Endless keeps its clock (every basket buys time; running out IS the game). The dev
   hook `TUMBLE_DEV.setTime(t)` ends a Timed Rush now with no medal (three gates used the clock to end a Load).
   `tests/rush.test.mjs` (27, red first), lifecycle's three cutoff checks rewritten, `dev/gate-step5.mjs` reads the
   medal clock. ⚖️ The four fractions and the four bonuses are numbers for him to move.
2. **"The songs on the radio should be titled the titles I gave them and the audio you made should be removed ... a
   music player ... press a button next to the song just like on jimothy ... listen to the songs that you haven't
   unlocked ... only play while you're in that menu."** Built as said. `data/unlocks.json`: the eight radio items ARE
   his songs, titled Fold It Up, Who's Sock Is This, Nightmarish Lo-Fi, Modular Jazz Hub, The Suspicious Menu, Gayageum
   Janggu, Hard Gayageum Janggu, Quite The Throwdown (200 Lint each, unchanged); the six generated stations (Lofi
   Beats, Steady Rain, Vinyl Jazz, Someone's TV, 90s Hold Music, RESONARC) are gone from the shop and on a `retired`
   list: a save that owned any gets its 200 Lint back the first time it loads (`src/radio.js retireStations`, and a
   one line note in the room). `src/audio.js`: the Station synth player and its beds are DELETED (about 140 lines); a
   Track plays a file WHOLE and reports its end; `preview(url)` plays a song over the loop, which waits. `src/radio.js`
   (pure) holds the loop: every owned song not switched off, in catalogue order, wrapping; one song alone repeats;
   switching the playing one off moves to the next; switching one on when the radio is off starts it. `save.radioOff`.
   The Radio tab behind the door (and the radio on the shelf, which opens it) is the player: a head row with the
   radio's On/Off, then a row a song: owned ones have an On/Off switch, the others Listen and the price; Listen stops
   when the sheet is laid down or another tab is picked. The One With the Radio still plays it through its speaker.
   `tests/radio.test.mjs` rewritten (26), `dev/gate-radio.mjs` rewritten (the loop moves on when a file ends, skips a
   song switched off, one song repeats, music off stops it, Listen and its stop), `dev/shots-radio.mjs` rewritten (the
   sheet at 412 and 360, titles whole, 48 px switches, the dial lit). ⚖️ His: retitle the songs to sock and laundry
   names (one `name` and one `look.song` each); reorder them (catalogue order is the loop's order).
3. **"The open suitcase basket has a lid ... that lid should almost work as a backboard ... Right now the socks just
   bounce through the lid."** True: the lid was a mesh with no collider. `SUITCASE_LID` in `src/config.js` is the one
   set of numbers render.js draws from and physics.js builds from: a disc hinged on the back rim, leaning back past
   upright, thick as drawn. A lob that clears an open basket's back rim by 3 cm is knocked back in by it
   (`tests/lid.test.mjs`, 6, the control lob watched sailing over an open basket first; a ball dropped straight in
   still lands, so the lid never stands over the opening). His call recorded there: the one basket that is an
   advantage. No other basket has a lid.
4. **"The images we have are absolute trash ... the screw doesn't even look like a screw."** The finds are drawn from
   recipes of a few flat shapes. Wired for painted art: a PNG at `assets/finds/<id>.png` listed in
   `assets/finds/manifest.json` is laid over the recipe the moment it loads (the recipe shows until then and on the
   ledge). `docs/FINDS-ART-PROMPTS.md`: ONE style paragraph to paste at the top of every prompt (the continuity he
   asked for), then the thirty by set with each one's colours, and the rule to make a set's six together. ⚖️ His:
   generate them (Meshy or ChatGPT), drop them in, list the ids. Nothing else changes.
5. **"When looking at my hero socks in the drawer there's no back button."** True. A sock card opened from the Drawer
   has Back to the Drawer, and the Drawer keeps its place under it (filters, how far shown, the scroll). The 3D card
   stays the turning flat card, as he allowed.
6. **"I don't know how many socks are in each hero pack ... some of the later ones I only have one pair."** Every pack
   holds ten (Cursed: nine sold and one that comes through the portal). Buying a pack puts its ten into the pool; they
   are FOUND in Loads, one hero pair in ten, so one pair from a pack bought lately is the game working. Now it says so:
   the Drawer's pack chips read "Cursed 3 of 10", under one pack the heroes still to find stand in shadow after the
   found ones ("7 more in this pack still to find. They turn up in your Loads, one hero pair in ten."), and the shop's
   pack card reads "3 of 10 found so far." (`drawerPacks` carries `total`, `packMissing`, `tests/drawer.test.mjs` +3).
   ⚖️ HIS DESIGN CALL, NOT BUILT: unlock packs by Loads played instead of Quarters ("oh I want to do five more loads
   cuz I want to get the animal theme pack"). Both can hold: a pack costs Quarters OR opens at N Loads. Say which.

### The listing package (23 Sep evening)

- **Store screenshots, 1080 x 1920** (`node dev/shots-store.mjs 432 768 2.5`), opened three times and fixed twice: the
  Seed Catalogue poster hung cut mid word at the frame's edge in every table shot (no poster in the store save now);
  pictures 1 and 2 were the same heap minutes apart (a dozen pairs go to the basket before the Reunion now, so 2 shows
  a thinned pile and a basket of rolled pairs); the room shot carried six hotspot tags (hidden for the picture); the
  Drawer shot was half filter chips (scrolled to its socks; the first scroll cut a row in half, measured against the
  wrong parent). Copied to `store/tumble-play/play-shot-1..5.png`. ⚖️ His: the held sock in picture 1 is pale and
  fills the bottom third; the Bobby Pin's clip is a grey pill on the left rail in 1 and 2.
- **Feature graphic candidates, 1024 x 500** (`node dev/shots-feature.mjs`; rendered at 2048 x 1000, downscaled):
  A the room by day, B the room at night, C the table mid Load. The first candidates were a fresh room (no socks on the
  line, nothing on the shelves, mostly wallpaper); the script uses the tester grant and a lived in room now, and C is
  a Heavy Load with pairs in the basket. `store/tumble-play/feature-A.png`, `feature-B.png`, `feature-C.png`;
  **my pick is C** (`feature-graphic-1024x500.png` is a copy of it). ⚖️ His: A and B cut the pendant lamp and run the
  title across the clothesline; C cuts the dryer's top and the ledge; none carries the name (Play shows it beside).
- **The upload key:** `~/.tumble-keys/tumble-upload.keystore` (alias upload; password in `tumble-upload.password`
  beside it and in the README), SHA-256 `B3:D8:89:29:E4:65:94:37:EB:4E:DD:FD:1F:26:2A:97:E6:68:1E:3D:DE:39:63:B9:18:FB:19:0C:96:41:82:C3`,
  already in `/.well-known/assetlinks.json` under `com.skywolfstudio.tumble` (beside FTW's). Google's app signing
  SHA-256 goes beside it after his first upload.
- **The Android bundle:** built 23 Sep 22:44 UTC on the rebuilt toolchain (`store/ftw-play/twa/setup-toolchain.sh` in /tmp/bw;
  Bubblewrap 1.24, `store/tumble-play/twa`, versionCode 1, the throwaway debug key), its signature stripped and the bundle
  signed with the upload key (jarsigner, SHA256withRSA, `jar verified`, CN=Sky Wolf Studio): `tumble-1.0-upload-signed.aab`,
  1,852,872 bytes, sha256 `a6dbefaccac5682b...`. It wraps the live URL, so his edits to the game need no new bundle;
  only the gate coming off does not either (the gate is in the page). The manifest asks no permission.
- **Vault release:** `vault-20260923-tumble-upload` in the private `lucid-winds-vault` (the signed bundle, the upload
  keystore, the README with the password and his Console steps). ⛔ Upload THAT bundle, not `twa/app-release-bundle.aab`.

### Gates on the finished tree (one browser at a time, the box under load 3 to 5 most of the day)

Node: **34 suites green** (31 + `rush`, `lid`, and the radio suite rewritten; `basketball` was written and removed
with its change). Browser: `gate-radio` 23/23 (the player), `shots-radio` at 412 and 360 (titles whole after two
fixes: the button column narrowed, the swatch and title smaller at 360), `shots-lid` at 412 and 360 (the stepped film:
the ball meets the lid in the fourth frame and comes back in), `shots-sep23` at 412 and 360 (the medal bar, its marks
and the stopwatch; a Platinum result; the pack chip "Cursed 3 of 10", seven in shadow; Back lands where she was; the
shop card's count; and a new law that the streak bar fits the phone, after the 360 picture showed the points chip cut
off: the bar tightens under 380 px now), `step5` (the dev hook ends a Timed Rush with a ball in hand: the sweep
condition needed `forceDone`), `step678`, `hints`, `drawer`, `lob`, `step4`, `step3` three times green on the
rewritten hold and tap. `basket` 48 of 50 (above). Every picture named here was opened.

### THE SUBMIT BUILD, `20260923l`, and the TIER GIFTS (23 Sep, late, by Fable). His words: "Take the tester gate off and build the submit version ... when youve done 10 loads and unlock the larger load you should unlock one hero pack for free and it should do that each tier. it should also unlock a song each tier too. i can get you more music for peopel to buy too."

- **The gate is off.** `satellites/tumble/index.html` no longer loads `/dev-gate.js` (a comment marks where it was);
  the portal row lost `beta:true` (keeps `fresh:true`), so TUMBLE stands on the public shelf; `dev/probe-live.mjs`
  now holds that a first visit sees NO gate. The tester key still works for `?unlockall=1` (set by any gated page on
  the same origin). `node scripts/twa_ready.mjs tumble`: ready to list (the offline check is the one that cannot run on
  this box; `dev/probe-offline.mjs` is the game's own). **The bundle in the vault is unchanged and valid:** it wraps the
  live URL, and the gate was in the page.
- **Tier gifts.** The three Load size pegs on the Clothesline are the tiers (`data/clothesline.json`: Regular at 5
  Loads, Heavy at 20, Mountain at 50; ⚖️ he said 10, the data says 5: his call, one number each). With each peg comes
  the next hero pack she does not own and the next song she does not own, in catalogue order, free, once
  (`economy.tierGifts`, `save.tierGifts` remembers the pegs that gave; a gift pack has first call on the next ten Loads
  like a bought one; a gift song joins the loop and starts a radio that has never played). The results sheet says it
  under the peg's own note ("With Regular load comes a gift: the Uncle Energy hero pack and the song Fold It Up."),
  and each size peg's line on the Clothesline says a hero pack and a song come with it. A pack or song she already
  owns is skipped for the next; with everything owned the peg hangs and nothing is claimed. `tests/gifts.test.mjs`
  (15, red first). A save that jumps several tiers at once (a tester) gets one gift a tier. ⚖️ His: which packs and
  songs come first is catalogue order (Uncle Energy, Gas Station, Fake Merch ... ; Fold It Up, Who's Sock Is This,
  Nightmarish Lo-Fi ...); reorder the data to choose. More songs to buy: add radio items with a `look.url`; the
  player and the gifts take them as they come.
- **Pictured** (`dev/shots-sep23.mjs`, the fifth Load played to its end at 412 and 360): the peg's note, then "With
  Regular load comes a gift: the Uncle Energy hero pack and the song Fold It Up. The song is on the radio now. Its
  socks turn up in your Loads.", the pack and the song in the save, the radio on the song. ⚖️ Taste: "free" on the
  peg line and "a gift" on the next say it twice; the gift line is words only (a sock and a note glyph would sell it);
  on a long results sheet it sits below the fold.

### What is next

1. **His test** of `20260923l` on the Pixel (close the tab fully and open it once), then his edits list. Things to
   look at first: the Radio tab behind the door (or the radio on the shelf), a Timed Rush to the end, the suitcase
   basket with a long lob, the Drawer under one pack, a sock card's Back.
2. **The SUBMIT build is `20260923l`** (the gate is off, the bundle in the vault is the one to upload). His edits to the
   game after his test ship as web deploys; the bundle needs no rebuild for them.
3. **His, in the Play Console:** the home address off the listing BEFORE submitting (START-HERE), create the app,
   upload the signed bundle from the vault, send Google's app signing SHA-256 back for assetlinks.
4. ⚖️ His calls from today: retitle the songs (sock and laundry names) and reorder them; the medal fractions and
   bonuses; unlock packs by Loads played instead of Quarters (asked, not built); the finds art (generate, drop in,
   list the ids); whether the studio wide music player should be the Tumble one (a fleet job).
5. The two basket lobs (above): the next look is the filmed flight.

---

## THE START PROMPT for section 8 (Stephen pastes this into a fresh Opus session in `/workspaces/lucid-winds`)

Read satellites/tumble/HANDOFF.md section 8 from top to bottom, then satellites/tumble/HANDOFF-OPUS-T2.md,
then plans/tumble/exp1/DESIGN-T2.md, before you change anything. Tumble phases 0, 1 and 2 are LIVE as
20260922a. Phases 3 and 7 and the free hero pack are BUILT and pushed on branch add-sproing-jumper and are
green on 20 Node suites, but they are NOT deployed and NOT ticked, because they owe pictures the last gate run
did not live to take and phase 7 has had none at all. Your FIRST job, before any new building: on a quiet box
(sh dev/box-quiet.sh), run node dev/gate-room.mjs, then node dev/shots-store.mjs 412 915, then node
dev/gate-finds.mjs, one browser at a time; OPEN every picture and name three faults in each; fix what the
pictures show; then tick 3.1 to 3.4 and phase 7 in the design file, bump the version in sw.js, src/config.js,
index.html AND the portal card, commit, push the branch and then main, and grep the live html for the new
stamp. The branch currently carries phase 3 and 7 at the stamp that is ALREADY LIVE, so a push to main without
bumping first serves new files to phones holding old cached ones. After that deploy line, keep building the
plan in this order: the other five hero packs (4.1, 4.2, 4.3), then phase 5, then phase 6, then phase 8. One
design line at a time: its test watched red then green, npm test, the golden seeds unchanged, the box ticked
in the design file, commit, push the branch and then main. Every visual line ends with shots at 412x915 and
360x740 opened and three faults named. Another Opus session is building Tiny World on this same two core
machine: tell it before you take a browser and check sh dev/box-quiet.sh first. The law of a comfort holds
over the design. Nothing in the game is sold: his paying call is answered in STEPHEN'S CALLS item 1 and the
support pack is NOT to be built without a Fable spec. No agents. Stop only at a stop line, green and pushed,
with HANDOFF.md and START-HERE.md updated.

---

## THE FABLE PROMPT: review 23 Sep and finish the listing (paste into a new Fable session in `/workspaces/lucid-winds`)

```
Lets get started on TUMBLE. You are reviewing Opus's work of 23 Sep and then finishing the Play listing. If
~/.claude/projects/-workspaces-lucid-winds/memory is empty, clone the private repo Stephenuffugus/sws-memory into it
first. Read START-HERE.md from the top, then satellites/tumble/HANDOFF.md section 9 from "6.2 THE HOTEL LAUNDRY CART"
to its end, then plans/tumble/exp1/DESIGN-T2.md (6.2 and phase 8), then store/tumble-play/PLAY-CONSOLE-FIELDS.md and
PLAY-LISTING.md.

State: live is 20260923j (main ad7b0f03). Build 2 is complete; the tester gate is still ON.

1. REVIEW FIRST, before building anything. Check Opus's claims against the code and the live site, not against the
   handoff: the arrivals end on the same heap; the Odd Bin note is true (the door plays save.nextSeed; the reunion is
   the seed's own stream); the radio's eight stations play my songs; the hint card fix (a card never eats a game tap);
   the draw call merges. Run the gates one browser at a time (sh satellites/tumble/dev/box-quiet.sh first). Open the
   pictures yourself. Report what is wrong, each with its evidence.
2. The two open items: the basket gate lands 48 of 50 on j AND on 20260923d (bisect Sep 22 04:25 to Sep 23 03:02 and
   say whether a player could ever hit it); gate-step3's hold and tap part failed once and passed twice.
3. Finish "Listing package, NOT done" in HANDOFF section 9, in order: store shots (node dev/shots-store.mjs 432 768 2.5,
   1080 x 1920; Play rejects a long side over twice the short), the feature graphic (node dev/shots-feature.mjs,
   1024 x 500), the Android bundle with Tumble's own upload key in the private vault, its SHA-256 in assetlinks.json.
4. Stop there and tell me it is ready to test. The tester gate comes off only in the build I submit, after my edits.

My calls are final: TUMBLE: Sock Sorting, $0.99, 13 and over, nothing sold inside, the web copy free. Laws: tests red
then green, npm test, golden seeds unchanged, shots at 412x915 and 360x740 opened with three faults named, version
bumped in all four places every deploy, git add by path, push the branch then main, curl the live page with a random
?probe= and node dev/probe-live.mjs, read `date -u` before writing any time. No agents unless I ask. Push memory after
every commit. Update HANDOFF.md and START-HERE.md in the turn something changes.
```

## THE START PROMPT for the listing (23 Sep, after the codespace refresh; paste into a new Opus session in `/workspaces/lucid-winds`)

```
Lets get started on TUMBLE. If ~/.claude/projects/-workspaces-lucid-winds/memory is empty, clone the private repo
Stephenuffugus/sws-memory into it first. Read START-HERE.md from the top, then satellites/tumble/HANDOFF.md section 9
from "LISTING PREP" to its end, then store/tumble-play/PLAY-CONSOLE-FIELDS.md and PLAY-LISTING.md.

State: live is 20260923j, Build 2 complete, the tester gate still ON. I want to list TUMBLE: Sock Sorting on Play
($0.99, 13 and over). I have notes and an edits list: take them first, verbatim, sorted fault / taste / already known.
Then finish "Listing package, NOT done" in order. The gate comes off only in the build I submit. Same laws: tests red
then green, npm test, shots opened with three faults named, version bumped in all four places, git add by path, push
the branch then main, curl the live page, node dev/probe-live.mjs. Never build anything sold. No agents unless I ask.
```

## THE START PROMPT after Build 2 (23 Sep evening; DONE, kept for the record)

## THE START PROMPT for a fresh codespace, 23 Sep (DONE: kept for the record)

```
Lets get started on TUMBLE. If ~/.claude/projects/-workspaces-lucid-winds/memory is empty, clone the private repo
Stephenuffugus/sws-memory into it first. Then read, before changing anything: START-HERE.md from the top, then
satellites/tumble/HANDOFF.md section 9 (the "6.2 IN PROGRESS" and "HIS EIGHT TUMBLE SONGS" blocks especially), then
plans/tumble/exp1/DESIGN-T2.md phase 6, phase 8 and STEPHEN'S CALLS.

State: live is 20260923d (phases 0 to 5, 7 and 6.1). Branch add-sproing-jumper is ahead of main by the 6.2 work
(the Hotel Laundry Cart and the Apartment Laundry Chute), NOT deployed on purpose: its pictures were never opened.

FIRST JOB, finish 6.2: in satellites/tumble run sh dev/box-quiet.sh, then node dev/shots-arrivals.mjs 412 915, then
node dev/shots-arrivals.mjs 360 740, one browser at a time. OPEN every busy and heap picture and name three faults in
each; fix what they show; tick 6.2 in DESIGN-T2 with a note; bump the version to 20260923e in sw.js, src/config.js,
index.html AND the TUMBLE row of portal/index.html; npm test; commit by path; push the branch; git fetch and check
git log HEAD..origin/main (merge if not empty); push add-sproing-jumper:main; curl the live page with a random ?probe=
for the new stamp; node dev/probe-live.mjs.

THEN phase 8, one design line at a time. My eight Tumble songs are saved (lucid-winds-music v1/tumble/, masters in
the vault); check they answer 200 at lucidwinds.com/music/v1/tumble/<slug>.mp3 before wiring a station to one (a
station plays look.url, its synth loop is the fallback). If they still 404, tell me to tap Deploy.

Laws: each design line is test watched red then green, npm test, golden seeds unchanged, box ticked, commit, push the
branch then main. Every visual line ends with shots at 412x915 and 360x740 OPENED and three faults named. Never
deploy unpictured work. Version bumped in all four places every deploy. git add by path. Never match a process by its
command line (use sh dev/box-quiet.sh). If another Claude session is on this machine, tell it before taking a
browser. My paying call is final: $0.99 on Play, nothing sold inside, the support pack dropped, the web copy free;
never build anything sold. No agents unless I ask. Push memory after every commit. Stop only at a stop line: green,
pushed, HANDOFF.md and START-HERE.md updated.
```
