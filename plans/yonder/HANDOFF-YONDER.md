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

(none yet)

---

## 14. THE OVERNIGHT PROTOCOL

HANDOFF-OPUS-SEP15 prompt: never wait on a human; an ambiguity is the smallest reasonable choice logged in
`satellites/yonder/docs/DECISIONS.md`; a gate red after three honest attempts goes into SESSION STATE as BLOCKED with its
last thirty lines; never weaken, skip or delete a gate; commit and push the moment something is green.

---

## 15. THE MORNING REPORT (most recent on top)

(none yet)
