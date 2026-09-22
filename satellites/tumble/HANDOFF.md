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
