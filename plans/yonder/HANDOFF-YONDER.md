# HANDOFF YONDER, the build plan for the math catalog's second game

**Written:** 2026-09-15, by Opus (the builder), as step 1 of YONDER (`plans/math/CATALOG-PLAN.md` section 8), from three
inputs read whole: `assets/math-catalog/03-YONDER-handoff.md` (Stephen's delivery, read only), `plans/math/CATALOG-PLAN.md`
(which binds this file and wins over the handoff), and CORE as built (`plans/math/HANDOFF-CORE.md`, `satellites/math/core/`),
with SPAN (`plans/span/HANDOFF-SPAN.md`) as the finished example of a catalog game. Where this file and the handoff differ,
every difference is in section 3.
**Game folder:** `satellites/yonder/` (free, checked 2026-09-15). **Live URL when listed:** `lucidwinds.com/satellites/yonder/`.
**Working title:** Yonder. The display name is Stephen's (CATALOG-PLAN call 4).

---

## SESSION STATE (the builder updates this at the end of every session; the morning reader starts here)

- 2026-09-15 night, Opus: **P3 wired** (`9babdc78`): the map, the offline shell, the manifest, the link builder's entry,
  icons, the sprite table with lint law 11; stamps CORE `20260915d`, SPAN `20260915h`, YONDER `20260915b`. YONDER's check
  went ten of eleven on its first run (the map gate's own G2 after a reload, fixed); CORE ALL GATES PASSED after the
  bump. The P3 plants run from a snapshot (`yonder-plants.cjs map|config|pace|layout|offline`).
  **Next action:** SPAN's check green, the map gate green alone, then deploy (`git push origin add-sproing-jumper:main`
  after `git log HEAD..origin/main` is empty) and probe one served file at a time: `yonder/index.html` carrying
  `main.js?v=20260915b`, `yonder/sw.js` carrying `yonder-shell-20260915b`, `math/core/core.js` carrying `20260915d`,
  `math/config/schemas.js` carrying `yonder`, `span/sw.js` carrying `span-shell-20260915h`. Then the P3 plants into
  section 13, and the shots (`node tools/shots.mjs`) opened with three faults named each. **Then the art step the sheet
  showed is missing:** the road's traveler, flag, signpost and mileposts and the race's card are still CSS boxes; draw
  them from `sprites.js` through CORE's `sprite.draw` (the table is ready and linted), shots opened, gates green. After
  that YONDER v1 is done and lane C moves to CREASE (write `plans/crease/HANDOFF-CREASE.md` first).

- 2026-09-15 evening, Opus: **P1 done and every law watched red (thirteen plants). P2 green** (`af1e2151`, ALL GATES PASSED
  six of six: lint, engine, play, audio, race, mileposts); its plants running. P3's files written and not yet run:
  `sprites.js`, `sw.js`, `manifest.webmanifest`, `tools/icons.mjs`, `tools/shots.mjs`, `test/offline.mjs`,
  `test/layout.mjs`, `test/map.mjs`, `test/pace.mjs`, `test/config.mjs`, `map.js`.
  **Next action:** read the P2 plant log into section 13; wire `map.js`, the manifest link, the worker registration,
  `YONDER.config()`, `runLength()` and `mapCells()` into `main.js` and `index.html`; `node tools/icons.mjs`; add YONDER's
  entry to `satellites/math/config/schemas.js` with CORE's stamp bumped (and SPAN following); run each P3 gate, open the
  sheet and the shots; bump YONDER's stamp to `20260915b` everywhere; deploy; probe.

- 2026-09-15 afternoon, Opus (resumed after the overnight session stopped with P0 step 2 in the tree, uncommitted):
  **P0 is done.** CORE's `numberline.create({ ends })` with its demo law (10) watched red, CORE ALL GATES PASSED nine
  of nine at stamp `20260915c`, SPAN following at `20260915g` ALL GATES PASSED nine of nine.
  **Next action:** P1, the page: `index.html`, `main.js`, `content.js`, the road through CORE's number line with
  `ends`, the flag, the traveler's walk (built first), Mode 2 FLAG at a fixed range, `test/play.mjs`.

- 2026-09-15, Opus: **P0 steps 1 and 3 are done.** `engine.js` (bands, stages, probes, scoring, fitting on a record of
  twenty, routing, pitch, the card), `test/engine.mjs` (eight laws on 20 seeds, e01 to e11 red), `STAMP.js`,
  `tools/lint.mjs` (l01 to l09 red), `tools/check.js`: lint, engine, ALL GATES PASSED.
  **Next action:** P0 step 2, CORE's one change (section 3.5), under CORE's plan: a CORE law first that
  `numberline.create({ ends })` labels the line's ends with the strings given and `0`/`1` without them (in CORE's
  `test/layout.mjs` or `test/demo.mjs`, whichever already opens a number line), watched red; then the option in
  `core.js`; CORE's `tools/check.js` green; CORE's stamp bumped with the asserted script (and CORE's `tools/sheet.mjs`),
  SPAN's `sw.js` precache following CORE's stamp and SPAN's check green. Then P1.
- 2026-09-15, Opus: plan written, before any code.
  **Next action:** P0 (section 5), the laws first. `satellites/yonder/test/engine.mjs` red with no `engine.js`, then the
  engine: `PROBE_TABLE`, `generateTarget` with section 4's bands, `scoreEstimate`, `fitModels`, `routeRange`, `pitchFor`,
  `raceMoves`; then CORE's one change (the number line's end labels, under CORE's plan and gates, CORE's stamp bumped);
  then `tools/lint.mjs` with Y1's circle law and Y2's no auto move law, and `tools/check.js`.

---

## 0. RULES OF ENGAGEMENT

1. **The fence.** `satellites/yonder/**`, this file, and `satellites/math/config/schemas.js` (YONDER's entry only). CORE
   (`satellites/math/core/**`) takes exactly one change from here, in P0 (section 3.5), made under CORE's plan with a law
   watched red, CORE's nine gates green and CORE's stamp bumped, SPAN's `sw.js` precache list following it. Read only:
   `assets/math-catalog/**`, `plans/math/CATALOG-PLAN.md`, `satellites/span/**` (copied from, never edited),
   `satellites/snakes-ladders/**`, every other satellite, `scripts/`, `music-unlocks.js`. **No portal row**: YONDER has
   none, and adding one is Fable's, from section 8's line.
2. **Git.** Stage by path, never `-A`. Commit and push the moment something is green. Deploy is
   `git push origin add-sproing-jumper:main` after `git log HEAD..origin/main` is empty, then one request per served file
   with a random probe (the host answers `429` to a probe loop; SPAN's ledger).
3. **The laws.** The fleet's (HANDOFF-OPUS-SEP15 section 6), CORE's G1 to G13, the reveal contract (CORE 2.2), and
   YONDER's Y1 to Y10 (section 1 of the handoff, restated in section 4). No dash and no exclamation point in anything a
   child or a teacher reads; "Sky Wolf Studio", singular; **56 px for the flag, the race's squares and every Mode 1
   control** (the young, CATALOG-PLAN D4), 48 px for everything else; text 0.7 rem or larger, measured; the engine pure; a
   count is a law proved on 20 seeds; a gate never sets the state it asserts.
4. **Browser gates run in the foreground, one per call, under the lock.**
5. **Never wait on a human.** Section 10 lists what is Stephen's and the default the build takes meanwhile.

---

## 1. WHAT YONDER IS, AND WHY IT GOES HERE

Preschoolers who played a linear, numbered board game for about an hour got better at comparing magnitudes, placing
numbers on a line, counting and naming numerals, and kept it nine weeks later; the same game with coloured squares did
nothing, and a circular board did nothing. Separately, feedback is the active ingredient of number line practice: the
children who were never told where the number really was did not improve. YONDER is both: a road running out to a
signpost, a flag a child plants where a number belongs, and a traveler who walks the flag back to the true place every
single round.

It goes after SPAN because it is the first game that leans on CORE's number line geometry and loupe, and the diagnostic
engine it adds (a logarithmic or linear reading of each range, routed silently) is the pattern GAUGE extends.

---

## 2. INHERITANCE (real paths and lines, checked 2026-09-15)

| What | From | How YONDER uses it |
|---|---|---|
| Seeded randomness | `satellites/math/core/pure.js` line 15, `rng(seed)` | every generator, so a gate replays a seed |
| Road geometry (N1, Y3) | `pure.js` line 132 `lineGeometry(r)`, 136 `fromNormalized`, 137 `toNormalized` | the road's width and offset every round; flag pixels to a value and back |
| The number line and loupe | `satellites/math/core/core.js` line 207 `numberline.create({ container, geom, onCommit, keyStep })` | the flag drag and the loupe on touch, after P0's end label change (section 3.5) |
| Tier ladder | `pure.js` line 58 `adaptTier(history, config)` | the six PAE tiers of handoff section 2 |
| Session | `pure.js` line 159 `sessionStep` | a run's length and cap, time handed in |
| Collectible | `pure.js` line 148 `collectOnce` | a map piece per run |
| Teacher's link | `pure.js` line 203 `parseConfig`, 181 `buildQuery`; `satellites/math/config/schemas.js` | one `config.js` both parse, held equal by a gate (SPAN's `test/config.mjs`) |
| Audio | `core.js` line 374 `audio.define / play / setMuted / renderLoud` | the pitch voice (Y9) and the footsteps, muted until switched on |
| Store and settings | `core.js` line 63 `store`, 110 `settings.mount` | per range state kept independently (handoff section 5), the shared panel |
| Sprites | `core.js` line 478 `sprite.draw`; `core/tools/sheet.mjs` | the traveler, flag, signpost, road, mileposts, the card, map pieces |
| Test harness | `core/test/harness.mjs` 31 `serve`, 59 `open`, 86 `centre`, 97 `tap` | every browser gate |
| Shared assertions | `core/test/shared.mjs` 33 `assertNoNetworkAfterLoad`, 80 `assertForbiddenStrings`, 98 `assertKeyboardCompletable`, 127 `assertTabularNumerals`, 143 `assertLineRandomization` | G2, the words, keys, numerals, Y3 |
| The lint, runner, layout, offline shell, icons, links | `satellites/span/tools/lint.mjs`, `tools/check.js`, `test/layout.mjs`, `test/offline.mjs`, `sw.js`, `tools/icons.mjs`, `config.js` with `test/config.mjs` | copied and pointed at YONDER, every law watched red again here |
| What NOT to copy | `satellites/snakes-ladders/index.html` 355 `drawBoard` (a board that wraps row to row), 468 `drawDie` (a die that spins), 436 `drawLadybug` and 446 `drawBee` (round pawns) | the fleet's own counterexample to Y10 and Y1; Mode 1 is its opposite |

The reveal: CORE's `reveal.show` (core.js line 309) draws marks on a line; YONDER's reveal is the traveler's walk, its own
drawing, keeping the contract's six rules (the flag stays where the child put it; the truth comes second; the same walk on
every path; no colour means right or wrong).

---

## 3. CORRECTIONS AND DIFFERENCES (section 2 of the catalog plan, plus what arithmetic found)

3.1 **The 150 probe, checked.** On 0 to 1000 a logarithmic reading puts 150 at 1000 × ln 150 / ln 1000 = 725, the linear
reading at 150, a spread of 57.5 percent, as the handoff says. The true point of largest disagreement is N / ln N: 145 on
0 to 1000, 22 on 0 to 100, 1086 on 0 to 10000. The handoff's 15 and 1500 give spreads of 43.8 and 64.4 percent against
maxima of 45.1 and 65.0, within a point and a half; `PROBE_TABLE` keeps the handoff's round numbers, and the engine gate
asserts each probe is within two points of its range's maximum spread rather than equal to it.

3.2 **Section 4's bands cannot hold "no repeats in a stage" on small ranges.** On 0 to 10 the first band, 2 to 20 percent,
holds the whole numbers 1 and 2; on 0 to 20 it holds 1 to 4. A stage's size is therefore capped so each band has enough
distinct targets for its share (0 to 10: five targets a stage; 0 to 20: ten; 0 to 100 and up: ten), and the engine gate
asserts, for every range, that no stage repeats a target and every band's share holds within one target.

3.3 **RESONARC does not exist** (CATALOG-PLAN correction 3). Y9's pitch is a CORE `audio` voice whose frequency is linear
in the target: `f = F_LOW + (F_HIGH − F_LOW) × target / max` in hertz. The gate asserts the second difference of f over
evenly spaced targets is zero and that equal ratios of target do NOT give equal ratios of f.

3.4 **Spoken numerals (Y7, D6) must not phone home.** Chrome's Web Speech voices include server voices that send the
text away, against G1 and G2. Only voices with `localService === true` speak; with none, the numeral is shown and not
spoken, and every mode is still complete. The gate asserts no `speak` with a non local voice and the game complete with
speech removed.

3.5 **CORE's number line labels its ends 0 and 1, fixed** (core.js line 207: `end0.textContent = '0'; end1.textContent =
'1'`). YONDER's road ends at 0 and at the range's maximum. The change: `numberline.create({ ..., ends: ['0', '1'] })`,
the default unchanged, a CORE law (CORE's `test/layout.mjs` or the demo) that the labels follow `ends`, watched red; CORE's
stamp bumped, CORE's nine gates green; SPAN's `sw.js` precache names CORE's stamp and moves with it.

3.6 **The design spec (`YONDER-design-spec.md`) was not delivered.** v1 is built from the handoff.

3.7 **Y5 with no teacher view.** The teacher view is v1.1 behind `?teacher=1` (D7); in v1 the diagnosis (`model`, the two
R squared values) reaches no render path at all. The store may keep it (routing needs it across sessions). A static law
(no DOM write in any module reads `model` or `fit`) and a live one (no text, attribute or title on the page ever holds
"log", "linear" or "logarithmic").

3.8 **"Linear better, PAE at or under the band, ×2 stages: promote range"** is read as two consecutive stages at or under
the band. **"Needs 5 estimates spanning the range before fitting"** is read as five, with at least one in each of section
4's three bands.

3.9 **Mode 1's board.** The handoff gives no length. The build takes the published game's shape: squares 1 to 10 in one
row, a flipped card showing 1 or 2 for the move (Y1: no spinner, no round die), one tap or key per square, each square's
numeral shown and spoken as it is passed (Y2, Y7). A longer board is Stephen's call (section 10).

3.10 **The map collectible is in v1** (CATALOG-PLAN D8 over the handoff's step 12): one piece per run through
`collectOnce`, about thirty assembling westward, as SPAN's viaduct.

3.11 **Frame rate.** "60 fps during the walk under 4× throttle" is measured as frame pacing under
`Emulation.setCPUThrottlingRate` 4 in headless Chrome on this box; a real school Chromebook is Stephen's (section 11).

3.12 **The fleet laws the catalog adds** (CATALOG-PLAN section 6): no network after load, no `getUserMedia`, the
forbidden words, tabular numerals, line randomization over 100 rounds, and every distribution a law on 20 seeds.

---

## 4. ARCHITECTURE LAW

```
satellites/yonder/
├── index.html          the shell; loads ../math/core/core.css and ./main.js, both ?v=<YONDER's stamp>
├── main.js             the page: road, flag, traveler, race board, mileposts, modes, input
├── engine.js           PURE: PROBE_TABLE, generateTarget, scoreEstimate, fitModels, routeRange, pitchFor, raceMoves
├── content.js          the words (COPY) and the palette
├── config.js           YONDER's link schema, parsed by the page and mirrored by the builder
├── sprites.js          PALETTE (16) and SPRITES (traveler, flag, signpost, road, milepost, card, map pieces), no circles
├── sw.js  manifest.webmanifest  icon-192.png  icon-512.png  icon-maskable-512.png
├── test/   engine.mjs (node); play.mjs, race.mjs, mileposts.mjs, audio.mjs, config.mjs, layout.mjs, offline.mjs (browser)
├── tools/  check.js  lint.mjs  shots.mjs  icons.mjs
└── docs/   DECISIONS.md  shots/
```

**The engine (the sim).** `Round = { mode, range: { min, max, bounded }, target, isProbe, road: { widthPct, offsetPct },
tier }` and `RangeState = { range, tier, estimates: [{ target, placement }], fit, model, stagesAtBand }` as the handoff's
section 5. `generateTarget(r, range, stage)` draws section 4's bands without repeats in a stage and serves the range's
probe at least once per stage at a new range. `scoreEstimate(placement, target, range)` is percent absolute error,
`|placement − target| / (max − min)`, exact at any road width or offset because it works in values, not pixels.
`fitModels(estimates)` returns the linear and logarithmic R squared of estimates against targets and the mean PAE.
`routeRange(state, bands)` returns the handoff's routing table's action. `pitchFor(target, range)` is linear in hertz.
`raceMoves(r, count)` deals the cards. Pure: no `document`, `window`, `Date`, `performance`, `Math.random`.

**Y1 to Y10, the law each becomes.** Y1 a computed shape law over the page's own DOM (no element near square with a
radius of half its side, no SVG `circle` or `ellipse`, no `rotate(` on a progress element) plus a grep in lint; Y2 a
static law (no loop, timer or animation in main.js advances the race without an input event) and a live one (one input,
one square); Y3 CORE's `assertLineRandomization` over 100 rounds; Y4 no milepost on the road in FLAG unless placed; Y5
section 3.7; Y6 every round's reveal runs and next is unavailable until it has; Y7 the numeral on screen for every
spoken number; Y8 a session's ranges include a drop back; Y9 section 3.3; Y10 the race track's squares share one row at
every width, scrolling sideways inside their own strip.

**The seam.** The browser gates play rounds through the real page and assert each round's scored PAE equals
`scoreEstimate` in Node for the same seed and the same placements, and the routing the page stores equals `routeRange`.

---

## 5. THE PHASES, WITH GATES (the handoff's section 7 test gates mapped one to one)

Every gate is watched to fail once by a planted fault before it counts, and both lines go in section 13.

### P0. The engine, the laws and CORE's one change (about 3 hours)
1. `test/engine.mjs` red with no `engine.js`, then, on 20 seeds:
   - `fitModels` identifies synthetic logarithmic and linear responders, 100 simulated children each, with noise
     (handoff gate 1)
   - `generateTarget` matches section 4 within tolerance over 1000 draws, no repeats within a stage, the probe served at a
     new range (gate 2, section 3.2)
   - `scoreEstimate` exact across the full randomized width and offset range, read through `toNormalized` (gate 4)
   - `routeRange` takes every row of the routing table, and never promotes on fewer than five estimates spanning the range
   - each probe within two points of its range's maximum spread (section 3.1)
   - `pitchFor` linear in the target (gate 8, Y9)
   - `raceMoves` deals only 1 and 2
2. CORE: the number line's `ends` (section 3.5), its law red first, CORE's check green, CORE's stamp bumped.
3. `tools/lint.mjs` from SPAN's, pointed here: the stamp, the engine pure, Y1's grep (`border-radius: 50%`, `<circle`,
   `<ellipse`, `rotate(` on progress) and Y2's static law (gate 5), the words, dashes, dupkeys, the sprite table.

### P1. The road, Mode 2 FLAG, the traveler's walk (about 3 hours)
- The road renderer at Y3's geometry, the signpost at the far end, the flag dragged with CORE's loupe on touch.
- **The traveler's walk and the reveal built first** (handoff step 2): the flag stays, the traveler walks from it to the
  true place, the numeral shown and spoken, the tone following the walk; on a probe item the long way back, slowly, the
  tone falling (handoff section 3). The same walk on every path.
- Mode 2 at a fixed range; `test/play.mjs`: rounds by real drags, the seam, Y3 variance (gate 3), Y4, Y6, the reveal laws.

### P2. The diagnostic engine live, pitch, Mode 1 THE RACE, Mode 5 MILEPOSTS (about 4 hours)
- Multi range routing with `PROBE_TABLE` on the page, per range state stored independently, silent (Y5, gate 9); Y8.
- The pitch voice and `test/audio.mjs` (CORE's ear gate shape, plus Y9 read off the voice's own frequencies).
- Mode 1 THE RACE: ten squares in one row, the flipped card, one input per square with the numeral named (Y2, Y7, Y10);
  `test/race.mjs`: no square advances without its own input (gate 5), the track never wraps at any width (gate 6).
- Mode 5 MILEPOSTS: halfway, then quarters, then an estimate on the marked road; `test/mileposts.mjs`.

### P3. The map, the links, layout, offline, art (about 2 hours)
- The map collectible; the config schema and the builder's entry, held equal; `test/layout.mjs` at the four sizes with
  Y1's computed shape law in every state (gate 7) and the keyboard complete at 1366x768 (gate 11); frame pacing under 4×
  throttle during the walk and the walk still conveying position with reduced motion (gate 10); `sw.js`, the manifest,
  icons; the sprite sheet opened with three faults named.

**YONDER v1 is done** when `tools/check.js` prints ALL GATES PASSED under the lock, every gate has a red line in section
13, every new shot is opened with three faults named, it is deployed and the served files probed, and the listing line is
in section 8 for Fable.

---

## 6. THE SCREENS (portrait by thumb at three widths, landscape by keyboard at 1366x768)

- **First run:** a wordless loop: a flag lands on the road, the traveler walks it to the right place, a tone rises with
  the walk; then a tap to start. No text.
- **FLAG:** the number large at the top, spoken; the road across the middle from 0 to the signpost's number; the flag
  in reach of a thumb; the settings gear top right.
- **The walk:** the flag stays; the traveler walks from it to the true place; the number shown where it belongs.
- **THE RACE:** one row of ten numbered squares in a strip that scrolls sideways, the traveler on square 1, the card, one
  tap per square.
- **MILEPOSTS:** the road with the child's halfway post, then quarters, then a flag.
- **The map:** the pieces earned so far, assembling westward.

---

## 7. ART

Code drawn pixel sprites through CORE's `sprite.draw` (CATALOG-PLAN section 5), and **nothing round** (Y1, CATALOG-PLAN
section 5's rule for YONDER): the traveler (a walk of four frames, square cornered), the flag, the signpost, road tiles,
a milepost, the move card face down and showing 1 and 2, map pieces, grass tufts drawn as angles. `tools/sheet.mjs` renders
the table and the sheet is opened with three faults named. Painted sheets are Stephen's, later.

---

## 8. LISTING (the line for Fable's portal row)

"A road out to a distant signpost where a traveler walks every guess back to its true place, a free number line game
with no login." (One sentence, no dash. `cat:"math"`, In Development.)

---

## 9. PITFALLS

- An auto move, a "skip to the end" or a hold to repeat in THE RACE: it is the intervention (Y2).
- A round die, a spinner, a round pawn or a progress ring anywhere, sprites included (Y1).
- Sampling targets evenly across the range: the diagnostic dies silently (handoff section 4).
- Any word, colour or sound that tells the child which reading they have (Y5).
- Pitch mapped logarithmically because hearing is logarithmic: the exact misconception (Y9).
- A race track that wraps to a second row to fit a phone (Y10).
- From SPAN's ledger: the truth drawn before the child's mark; a flag that says right while the drawing says wrong; a
  control that moves under the thumb when next appears; a gate on a tab in the background (no animation frames); a plant
  that plants nothing (a specificity tie, a timer cancelled in the same turn); a law blinded by a second path to the same
  state; a probe loop the host answers with 429.

---

## 10. DECISION RIGHTS AND OPEN QUESTIONS (the handoff's "Ask Stephen, don't decide", with the default meanwhile)

| Question | Default the build takes |
|---|---|
| Final name | Yonder, the working title (CATALOG-PLAN call 4) |
| Teacher view in or out | Out of v1; v1.1 behind `?teacher=1`, local only (D7) |
| Whether Mode 1 is its own title | A mode inside YONDER (CATALOG-PLAN call 9) |
| Spoken numerals: Web Speech or recorded | Web Speech, local voices only, the numeral always on screen (D6, section 3.4) |
| The race board's length | Ten squares (section 3.9) |

---

## 11. STEPHEN ONLY

- The questions above and YONDER's display name.
- A child of four to seven in front of THE RACE, and one of seven to ten in front of FLAG (the tolerance tiers are seeded
  from published error rates, not from play).
- 60 fps on a real school Chromebook; the spoken numerals on a real device's local voice.

---

## 12. HONEST SIZING

About 12 hours of building (P0 3, P1 3, P2 4, P3 2), the catalog plan's one and a half days, on two cores with every
browser gate in the foreground under the lock. Where a session stops well: after P1, when FLAG and the walk work, because
feedback is the treatment; THE RACE is the other proven half and comes next.

---

## 13. EVIDENCE LEDGER (fill in place, with commands and their real output, most recent last)

### P0 steps 1 and 3, the engine's laws and the lint (2026-09-15)

`satellites/yonder/package.json` (`"type": "module"`, force added past the root `.gitignore` as SPAN's was) and
`satellites/yonder/test/engine.mjs`: the handoff's test gates 1 to 4 and 8 as laws on 20 seeds, plus the probes' spreads
and the card. With no engine:
```
  FAIL  engine.js loads as an ES module (Cannot find module '/workspaces/lucid-winds/satellites/yonder/engine.js' ...)
1 ENGINE FAILURE(S)
```
Then `satellites/yonder/engine.js`. The first run was red twice, once on the engine and once on a question the gate
could not yet answer:
- ⛔ a real engine bug: the stage picker stopped when the whole stage's taken numbers reached one band's size, so on 0 to
  10 the number 1 from the first band cut the second short and stages came out four long (`0 to 10 a stage of 4, not 5`);
- ⛔ `fitModels tells ... (lowest 0 to 1000: 90 log; 0 to 10000: 80 log)` on one stage of ten estimates. Measured before
  choosing anything (a scratch run, not a gate, 20 seeds, placements scattered by 5 percent of the road): ten estimates
  are 97, 90 and 80 at 0 to 100, 1000 and 10000; twenty are 100, 95 and 95. A misread child is routed away from the
  feedback it needs, so a reading is called on twenty estimates reaching all three bands (`MIN_FIT`,
  `docs/DECISIONS.md` with the table), and the law's simulated child has a record of two stages.
Two faults of the gate's own were fixed before it counted: the band law asked 0 to 10 and 0 to 20 for more distinct
numbers than their first band holds (a band now gives its share or everything it has, the rest carried up, and the law
refuses a target under 2 percent), and the "linear, error over the band" routing fixture clamped its placements at the
road's end, bending a line into a curve. Live:
```
  ok    fitModels tells 100 simulated logarithmic children from 100 linear ones, at least 95 of each on every seed (lowest 0 to 100: 100 log, 100 linear; 0 to 1000: 95 log, 99 linear; 0 to 10000: 95 log, 100 linear)
  ok    generateStage keeps section 4's bands within a target a stage and 5 points over 1000 draws, never repeats in a stage, and serves the probe at a new range (10, 20, 100, 1000, 10000)
  ok    scoreEstimate is exact through any road width and offset (largest error 2.2e-16)
  ok    routeRange takes every row of the routing table, and never promotes, rotates or calls a frontier on fewer than twenty estimates spanning the bands
  ok    every probe is within two points of its range's largest log to linear spread (15 on 0 to 100, 150 on 0 to 1000, 1500 on 0 to 10000)
  ok    pitchFor is linear in the target and rises with it, and equal ratios of target do not give equal ratios of pitch (Y9)
  ok    raceMoves deals only 1 and 2, both, and a seed deals the same cards again
  ok    the same seed gives the same stage and another seed another
ENGINE OK
```
The log-child law sits at 95 on two roads: deterministic on these seeds, and an engine change that draws the stages
differently is a different sample of children, which this law will say plainly. **Watched red** (session scratch
`yonder-engine-plants.cjs`):
```
e01 the logarithm fitted as a line     FAIL fitModels ... (0 to 100: 0 log; 0 to 1000: 0 log; 0 to 10000: 0 log); FAIL routeRange: frontier gave stay
e02 the bands flattened (20/30/50)     FAIL generateStage ... shares 20/40/40 for 20/60/20 ...; FAIL fitModels (0 to 10000: 94 log)
e03 repeats let through                FAIL generateStage ... 0 to 10 seed 1000 repeats a target: 7,2,2,3,1
e04 no probe at a new road             FAIL generateStage ... 0 to 100 a new range stage without its probe 15
e05 an error one off in scoring        FAIL scoreEstimate is exact through any road width and offset (largest error 8.1e-2)
e06 promotion on thin data             FAIL routeRange ... seed 1000 nineteen estimates gave promote
e07 a probe off its spread             FAIL every probe ...: 0 to 1000: 400 spreads 46.7 against 57.5
e08 pitch in the logarithm             FAIL pitchFor ... 0 to 10 bends at 1; bends at 2; bends at 3
e09 a card that shows three            FAIL raceMoves ... (seed 1000: 331213232113)
e10 Math.random in a stage's order     FAIL the same seed gives the same stage and another seed another
e11 a target under two percent         FAIL generateStage ... 0 to 100 a target outside 2 to 100: 71,75,8,1,20,...
```
`satellites/yonder/STAMP.js` (`20260915a`), `tools/lint.mjs` (from SPAN's: the stamp, the engine pure, Y1 nothing round,
the catalog's words, Y5 nothing in copy names the reading, dashes, bangs, the studio's name, stray sentences,
`getUserMedia`, dupkeys) and `tools/check.js`. ⛔ The lint's first Y5 law handed the reading's words to CORE's shared
assertion, which reads every string literal, and went red on `engine.js` naming its own model; the catalog's words stay
there, the reading's words are held to copy (and to the rendered page in P2). Y2's law comes with the race in P2 and the
sprite law with the sprites in P3, so neither passes with nothing to read. `tools/check.js`: lint, engine, ALL GATES
PASSED. **Watched red** (folder copies with CORE and the shared dupkeys beside them):
```
l01 a syntax error in engine.js        FAIL every runtime module parses as an ES module: engine.js: SyntaxError: Unexpected token ')'
l02 a runtime extra.mjs                FAIL nothing a browser loads is a .mjs: extra.mjs
l03 an unstamped import                FAIL every relative import and local asset carries ?v=20260915a: main.js loads ../math/core/core.js
l04 Date in the engine                 FAIL engine.js touches no screen, clock or unseeded die: it names Date
l05 round things                       FAIL nothing circular ... (Y1): draw.js has a canvas arc, draw.js has a rotate, index.html has a border-radius of 50%, index.html has an SVG circle
l06 the reading named and a claim      FAIL none of the catalog's forbidden words anywhere (content.js says smarter); FAIL ... names a child's reading (Y5): "You read the road logarithmically"
l07 a dash, a bang, a brand, a sentence  FAIL no dash: "close — here"; FAIL no exclamation point: "Well done!"; FAIL ... singular: "Sky Walk Studio"; FAIL ... main.js: "Try it again"
l08 getUserMedia                       FAIL getUserMedia appears nowhere a browser loads (G4) (getUserMedia in main.js)
l09 a key twice                        FAIL no object literal declares the same key twice: content.js COPY.start on lines 2 and 3
```
Committed as `2126603d`, deployed (`git log HEAD..origin/main` empty); one request with a random probe:
`satellites/yonder/engine.js` 200 `application/javascript`, carrying `MIN_FIT = 20` once. There is no page yet.

### P0 step 2, CORE's number line takes `ends` (2026-09-15)

The overnight session wrote the change and stopped before running it; this session ran it. CORE `core.js`
`numberline.create({ ..., ends = ['0', '1'] })`; law 10 in CORE's `test/demo.mjs` draws the real `numberline.create` in
the page with `ends: ['0', '20']` and with none. CORE's stamp `20260915b` to `20260915c` (core, demo, config builder,
sheet tool), SPAN's `20260915f` to `20260915g` with its `sw.js` precache naming CORE's new stamp. **Watched red** (the
label line in `core.js` put back to the fixed `'0'` and `'1'`, then restored from a copy):
```
  FAIL  a line handed ends of 0 and 20 is labelled 0 and 20, and a line handed none is labelled 0 and 1 ({"labelled":["0","1"],"unlabelled":["0","1"]})
1 DEMO FAILURE(S)
```
Live, `satellites/math/core && node tools/check.js` under the lock: lint, pure, layout 42s, demo, audio, schedule, shared,
config, sprite, ALL GATES PASSED. `satellites/span && node tools/check.js`: lint, engine, play, audio, viaduct, screener,
config, layout 125s, offline, ALL GATES PASSED. Committed `b9d22ea4`, deployed. ⛔ The host took about forty minutes to
serve it (a random probe read `20260915b` at 1, 5, 12, 20 and 30 minutes, the origin's `last-modified` still 06:54 UTC);
nothing was wrong in the repo. Served: `math/core/core.js` 200 `application/javascript` carrying `20260915c` twice and
`ends = ['0', '1']` once; `span/sw.js` 200 carrying `span-shell-20260915g`; `math/core/demo/index.html` 200 carrying
`20260915c` twice.

### P1, the road, Mode 2 FLAG and the traveler's walk (2026-09-15)

`index.html` (a painted scene, the lane inside it that CORE's number line measures, the signpost, the traveler, the true
place's post and numeral, next in a fixed place, the wordless first run loop), `main.js`, `content.js`, `config.js`,
`test/play.mjs` (laws 1 to 10 in its header). **Shots opened first** (session scratch, 375 building, dragging, walking,
arrived, 320 and 1366 arrived; three faults named per look): ⛔ the far numeral cut to "10" and the signpost's board cut by
the scene's edge; ⛔ the flag at 0 overhanging the left edge; ⛔ the truth post drawn under the road, only a stub showing;
the traveler a third the flag's size and the loop's walker a plain box (sprites, P3); the signpost's post running through
the road's end tick. Fixed: the lane inset 40 px inside the scene, the post above the line. Then the gate's first run:
```
  FAIL  375x667 and no colour in the scene differs between them, or from the scene before any walk
  FAIL  1366x768 a hundred rounds played by keys, every walk finished, every numeral clear of the ends and inside the scene: round 3 numeral 3 overlaps an end; round 8 numeral 2 overlaps an end; round 31 numeral 98 overlaps an end
```
The second was the page's (the numeral sat in the ends' row; moved to 194 px). ⛔ The first was the gate's: it named each
element by its whole className, so the flag's `lw-locked` read as a colour change; elements are named by id or first class.
Then PLAY OK, 86 laws. **Watched red** (session scratch `yonder-play-plants.cjs`, folder copies, five groups plus a sixth):
```
G1 p01 the number off by one           FAIL the number at the top is the engine's first target, the probe (77); FAIL round 1: the number played is the engine's target for round 0 (77, the engine 15); FAIL 1366x768 every round's number is the engine's target ...
G1 p10 a small flag                    FAIL 320x568 the flag is a 56 px target a thumb lands on (40x40)
G1 p13 the flag moved after the walk   FAIL round 1: the flag stays where it was put (166.5 px, put at 152.4)
G2 p02 a placement scaled wrong        FAIL round 1: the placement scored is where the thumb let go, read in Node (71.400, Node 70.000); FAIL its error is engine.js's scoreEstimate
G2 p08 the probe no slower             FAIL the probe's walk is the slower one, and only the probe is a probe (1200 ms against 1200)
G2 p11 the numeral in the ends' row    FAIL a hundred rounds ... round 3 numeral 3 overlaps an end
G3 p03 the post before the flag        FAIL before the flag goes down the road carries its two ends and nothing else (Y4) (2 ends, and truth-mark)
G3 p06 a far walk takes longer         FAIL a near round and a far round walk on the same curve in the same time (largest difference 0.289 over 94 frames, 1236 and 1740 ms)
G3 p09 one road for every round        FAIL the road drawn each round is the road pure.js deals ...; FAIL over a hundred rounds ... (spread of width 0.000, of offset 0.000, 99 repeats)
G4 p04 next before the walk ends       FAIL 320x568 during the walk a thumb on next's place presses nothing (Y6) (on next: true, round 0 then 1), then the gate timed out
G5 p05 the traveler stops short        FAIL round 1: the traveler starts at the flag and ends on the true place ... (from 152.4 to 44.6, truth 41.2)
G5 p07 a near round in its own colour  FAIL 375x667 and no colour in the scene differs between them, or from the scene before any walk
G6 p12 an unseeded road                FAIL round 1: the road is the one pure.js deals for this round (0.8096 wide at 0.0257); FAIL 1366x768 the road drawn each round is the road pure.js deals ...
```
G4's gate stopped on a timeout after its first red, so p12 was run again alone (G6) from a snapshot of the P1 commit.
Committed `56828213`.

### P2 step 1a, the session in the engine (2026-09-15)

`engine.js`: `freshSession`, `planStage`, `recordStage`, `recordOf`, `milepostRounds`. `test/engine.mjs` laws 9 to 13, each
played by simulated children through the same plan, deal, place and record loop the page will run, on 20 seeds:
```
  ok    a child who reads every road in a straight line climbs 10, 20, 100, 1000 and 10000 in order, promoted only on twenty estimates, and rotates at the top, on every seed
  ok    a child who reads 0 to 1000 as a logarithm stays on that road, plays MILEPOSTS there, and meets the probe again after each, on every seed
  ok    once a road is mastered, a session drops back to a mastered road below home, and never plays three stages in a row above a mastered road without going lower (Y8), on every seed
  ok    a stage changes only its own road's record (a promotion only sets the next road's tier) and never the session it was handed, on every seed
  ok    MILEPOSTS: the halfway post, then the quarters where a quarter is whole, then four estimates, every number whole and none twice, on every seed and road
ENGINE OK
```
Red on the first run: ⛔ the planner dropped back every third stage by count, and a traced seed showed the slot falling
where home had just rotated down to 10 (a real planner fault, now "the first stage it can once two have passed"); then ⛔
the law itself went red on the same trace for a window whose stages were ON the lowest road, which Y8 does not ask to
leave (the law restated: never three stages in a row above a mastered road without going lower). **Watched red**
(session scratch `yonder-session-plants.cjs`, a folder copy per plant):
```
e12 a promotion two roads up            FAIL a child who reads every road in a straight line climbs ... seed 1000 climbed 10 to 1(00)
e13 a frontier with no MILEPOSTS        FAIL ... seed 1000 played no MILEPOSTS at its frontier
e14 no probe after MILEPOSTS            FAIL ... seed 1000 the stage after MILEPOSTS did not serve the probe
e15 never a drop back                   FAIL once a road is mastered ... seed 1000 never dropped back
e16 a drop back upward                  FAIL ... seed 1000 dropped back to a road not mastered below home
e17 the session changed in place        FAIL ... climbs ...; FAIL a stage changes only its own road's record ... never the session it was handed
e18 a stage written to home's record    FAIL a stage changes only its own road's record ... seed 1000 a stage on 10 changed the record of 20
e19 quarters on every road              FAIL MILEPOSTS ... 0 to 10 posts 5,2.5,7.5; 0 to 10 a number that is not whole
```

### P2 steps 1b to 4, routing live, the ear gate, THE RACE and MILEPOSTS (2026-09-15)

**1b, routing live.** `main.js` plans each stage from the store's session and records it; `config.js` takes `road`.
`test/play.mjs` rewritten around a replay: every stage's road, kind and targets, and the session the page keeps, are
Node's `planStage`/`recordStage` fed the placements the page recorded. The first run crashed on the gate's own row for an
unplayed round (⛔ the replay lists the rest of the last stage with nothing against it). Then:
```
  ok    375x667 reload: after a reload the session is the one kept and the stage on the page is the replay's next (10: 4,1,3,10,2; Node 10: 4,1,3,10,2)
  ok    1366x768 every round's road, kind and number is Node's replay of the same placements, stage after stage (161 rounds)
  ok    1366x768 placing every number where it belongs climbs the road to 10, then 20, then 100 (10 to 20 to 100, at 100 from round 45)
  ok    1366x768 and the session drops back to a mastered road below (Y8) (37 rounds on 10, 20)
  ok    1366x768 nothing the page shows or carries in an attribute names a reading of the road, on any round (Y5)
PLAY OK
```
**2, the ear gate** (`test/audio.mjs`). ⛔ Its first run stalled: the walk began and never arrived. A logging copy printed
the page's own error, `Failed to set the 'voice' property on 'SpeechSynthesisUtterance'`: the gate's stub voice was a plain
object, and a throw from speech inside the walk's frame ENDED THE FRAME LOOP, so next never came. Two faults: the stub
(now a stubbed utterance too) and the page (every speech call guarded, and law 7 now plays a voice that throws). Two more
of the gate's own: a pitch law that read every walk on the road to 100 while this page played the road to 10, and a stub
defined unconfigurable so the throwing voice could not replace it. Then:
```
  ok    with Sound on, round 2 (near): a flag put down plays one plant and one walk tone and nothing more through its walk (["plant","walk"])
  ok    each walk's tone runs from pitchFor(placement) to pitchFor(target), read in Node (3 walks, 0 off)
  ok    the walk voice rendered from 0 to the far end steps up by equal hertz, not equal ratios (Y9) (286, 418, 550, 682, 814 Hz)
  ---   twenty loud seconds: peak 0.420  rms 0.1149  above 3 kHz 0.5 percent
  ok    with a voice that throws the round still completes, the walk arrives and next comes (walk done true)
AUDIO OK
```
**3, THE RACE** (`race.js`, `test/race.mjs`, lint law 10). Shots opened (session scratch, first screen, the race at the
start, mid race at 375, 320 and 1366): ⛔ the card at the left edge (`race.js` makes the row by id, the CSS keyed a class);
⛔ the start square 70 px beside the numbered 64 (a div without border-box); ⛔ the row cut at "10" on a Chromebook (the
column capped at 760 px); the FLAG door a bare ▶ beside a picture of squares (the road picture waits for the sprites).
All but the last fixed. Lint law 10 watched red (`yonder-race-plants.cjs lint`):
```
l10 an auto move on a timer            FAIL nothing moves the race but an input ... it names setTimeout: step is called 1 time(s) outside a listener
l11 a hold that steps                  FAIL ... step is called 1 time(s) outside a listener
l12 a step on the animation clock      FAIL ... it names requestAnimationFrame
```
**4, MILEPOSTS** (`test/mileposts.mjs`), reached by play: a logarithmic child by keys on the road to 100 until the
routing calls a frontier.

`tools/check.js`: lint, engine, play 169s, audio 17s, race 30s, mileposts 60s, ALL GATES PASSED. Committed `af1e2151`.

**Watched red** (session scratch `yonder-plants.cjs` and `yonder-race-plants.cjs`, a folder copy per plant or group):
```
a01 sound on at first load              FAIL a first load is muted: ... (["plant","walk"], 1 spoken)
a02 two tones a walk                    FAIL with Sound on, round 2 (near): ... (["plant","walk","walk"])
a03 the tone read in the logarithm      FAIL each walk's tone runs from pitchFor(placement) to pitchFor(target), read in Node (3 walks, 3 off)
a04 an exponential glide                FAIL the walk voice rendered from 0 to the far end steps up by equal hertz, not equal ratios (Y9) (253, 334, 440, 581, 767 Hz)
a05 a voice around the master           FAIL every voice passes through the master: halving it halves the rms and the peak (0.996, 0.507 to 0.473)
a06 a walk that clips                   FAIL nothing clips and it is not silence: peak 6.011 (between 0.05 and 0.90)
a07 speech unguarded                    FAIL with a voice that throws the round still completes, the walk arrives and next comes (walk done false)
a08 a server voice allowed              FAIL with a server voice only nothing is spoken and the round still completes (1 spoken, walk done true)
m01 no post drawn                       FAIL after each post round a post stands at its true place ... after round 0 posts , wanted 50
m02 a post where the flag went          FAIL after each post round ... after round 0 posts 85, wanted 50
m03 posts kept into the next stage      FAIL the stage after MILEPOSTS has no post and serves the probe first (3 posts, first 15)
m04 a post numeral in the truth's row   FAIL every post's numeral sits clear of the ends, the other posts and the truth's numeral: post 25 numeral overlaps the truth's 14
m05 MILEPOSTS estimates read (engine)   FAIL 320x568 and the session the page keeps is Node's replay; FAIL 1366x768 ... Node's replay
m06 no probe after MILEPOSTS            FAIL the stage after MILEPOSTS has no post and serves the probe first (0 posts, first 28)
r01 the track wraps                     FAIL the track never wraps and its strip scrolls sideways (wrap, auto)
r02 a card over an unwalked count       FAIL no input moves nothing ... the card turned again with its count unwalked; FAIL the cards are the engine's deal (2221122, the engine 2122211)
r03 a tap moves two squares             FAIL ... a tap on square 1 moved from 0 to 2; FAIL a whole race by thumb reaches 10 one square at a time (3,10)
r04 a numeral not named                 FAIL with Sound on, each square reached is named once by the local voice (1,3)
r05 a round card                        FAIL nothing in the race is round or turned (Y1): card
r06 a deal not the engine's             FAIL the cards are the engine's deal (122, the engine 212)
r07 small squares                       FAIL the card and every square are 56 px targets a thumb lands on: #track .square[data-n="1"] 40x40, ...
r08 two squares ahead accepted          FAIL ... a tap two squares ahead moved the traveler
```
⛔ Three plants planted nothing on their first run, and each was rewritten and run again rather than counted: a07 crashed
the gate on its own timeout instead of saying a line (law 7 now records a walk that never arrives); r05 and r07 put their
CSS at the START of the real rule, whose later declarations overrode them, so the gate stayed green (both now add a rule
after every other, or style the element); m05 handed MILEPOSTS estimates from the page to `recordStage`, which drops them
all, so nothing changed (m05 now faults the engine, where the protection lives).

### P3, the map, the links, layout, pace, offline, art (2026-09-15)

`sprites.js` (sixteen colours, eighteen sprites), `map.js`, `sw.js`, `manifest.webmanifest`, `tools/icons.mjs`,
`tools/shots.mjs`, gates `test/map.mjs`, `test/config.mjs`, `test/pace.mjs`, `test/layout.mjs`, `test/offline.mjs`,
YONDER's entry in `satellites/math/config/schemas.js`; stamps CORE `20260915d`, SPAN `20260915h`, YONDER `20260915b`.
**The sheet and the icons opened** (`docs/shots/p3-sprites-sheet.png`, `icon-512.png`, `icon-192.png`): ⛔ the signpost
read as a table, the hill as a tent, the house as a face with its foundation off the tile; ⛔ the icon's flag cloth
overlapped the signpost's board, the picture high on the square. Fixed and rendered again. Left: the stake at the road's
left end hangs below the road, the sky is empty, the post is thin at 192 px (accepted for v1). ⛔ While fixing the
signpost a row was once again written as code (`'.08777777777 0'.replace(' ', '7')`), the second time this session, so
lint law 11 now refuses a row built by code as well as a row of the wrong width. **Watched red** (folder copies):
```
l13 a row built by code                FAIL sprites.js: ... every sprite a rectangle of literal rows ...: a row is built by code, not written
l13 a row two pixels wide              FAIL sprites.js: ...: signpost row 3 is 16 wide, not 14
```

---

## 14. THE OVERNIGHT PROTOCOL

HANDOFF-OPUS-SEP15 prompt: never wait on a human; an ambiguity is the smallest reasonable choice logged in
`satellites/yonder/docs/DECISIONS.md`; a gate red after three honest attempts goes into SESSION STATE as BLOCKED with its
last thirty lines; never weaken, skip or delete a gate; commit and push the moment something is green.

---

## 15. THE MORNING REPORT (most recent on top)

(none yet)
