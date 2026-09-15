# HANDOFF BRIM, the build plan for the math catalog's fifth game

**Written:** 2026-09-15, by Opus (the builder), as step 1 of BRIM (`plans/math/CATALOG-PLAN.md` section 8), from three
inputs read whole: `assets/math-catalog/02-BRIM-handoff.md` (Stephen's delivery, read only), `plans/math/CATALOG-PLAN.md`
(which binds this file and wins over the handoff), and CORE as built (`plans/math/HANDOFF-CORE.md`, `satellites/math/core/`),
with SPAN, YONDER and CREASE (`plans/span/`, `plans/yonder/`, `plans/crease/`) as the finished examples. Where this file and
the handoff differ, every difference is in section 3.
**Game folder:** `satellites/brim/` (free, checked 2026-09-15; the only "brim" strings in the repo are Lucid Winds word
banks and a tomato game's prose). **Live URL when listed:** `lucidwinds.com/satellites/brim/`.
**Working title:** Brim. The display name is Stephen's (CATALOG-PLAN call 4).

---

## SESSION STATE (the builder updates this at the end of every session; the morning reader starts here)

- 2026-09-15 night, Opus: plan written, before any code, while CREASE's P3 gates run under the lock.
  **Next action:** finish CREASE (its P3 gates, plants, shots, deploy and probe), then P0 here (section 5): the laws first,
  `satellites/brim/test/pairs.mjs` and `test/engine.mjs` red with no modules, then `pairs.js` (PAIR_BANK with its tags,
  grades and features, section 3.2 to 3.5), then `engine.js` (`features`, `generatePair`, `dealSession`, `scoreChoice`,
  `equivalentsOf`), then `tools/lint.mjs` with B8's word law, `tools/check.js`, commit.

---

## 0. RULES OF ENGAGEMENT

1. **The fence.** `satellites/brim/**`, this file, and `satellites/math/config/schemas.js` (BRIM's entry only, under the
   builder's own stamp, which moves alone: CREASE 3.11). Read only and imported, never edited: `satellites/crease/bank.js`
   (3.10). Read only: `assets/math-catalog/**`, `plans/math/CATALOG-PLAN.md`, `satellites/math/core/**` (no CORE change is
   planned; if one is needed it goes under CORE's plan with a law watched red and CORE's stamp moved, SPAN's, YONDER's and
   CREASE's workers following), `satellites/span/**`, `satellites/yonder/**`, `satellites/crease/**`, every other satellite,
   `scripts/`, `music-unlocks.js`. **No portal row**: Fable's, from section 8's line.
2. **Git.** Stage by path, never `-A`. Commit and push the moment something is green. Deploy is
   `git push origin add-sproing-jumper:main` after `git log HEAD..origin/main` is empty, then one request per served file
   with a random probe, a few seconds apart (the host answers `429` to a probe loop).
3. **The laws.** The fleet's (HANDOFF-OPUS-SEP15 section 6), CORE's G1 to G13, the reveal contract (CORE 2.2), and BRIM's
   B1 to B10 (section 4). No dash and no exclamation point in anything a child or a teacher reads; "Sky Wolf Studio",
   singular; 48 px targets (56 for the vessels, the split controls and next: the young), text 0.7 rem or larger, measured;
   the engine pure; a count is a law proved on 20 seeds; a gate never sets the state it asserts.
4. **Browser gates run one at a time under the lock**, in the foreground or in a background chain that waits on it. A gate
   run while the tree is being edited runs on a frozen copy (CREASE's scar: a queued gate must not read half an edit).
5. **Never wait on a human.** Section 10 lists what is Stephen's and the default the build takes meanwhile.
6. **Scars carried here before they cost anything** (YONDER's and CREASE's ledgers): a sound or speech called inside an
   animation frame is guarded; a frame's time is clamped at zero; a plant that plants nothing is rewritten and rerun; a law
   that reads a state before the page has made it is no law (CREASE's HALFWAY and stack gates); a stamp is never one
   another game's import was served under (CREASE's `20260916a`); a sprite row is never built by code; a batch patch
   asserts every match and writes after every edit; a deal that can hand a child a round with no right answer is a fault
   in the deal (CREASE's exact halves before exactly half).

---

## 1. WHAT BRIM IS, AND WHY IT GOES HERE

Two glasses, the same size, a fraction under each. The child taps the fuller one, and only then do the glasses fill. A
child who compares fractions by finding common denominators gets right answers and no sense of size; children who reason
about size use two strategies, benchmarks (against a half, nothing, a whole) and residuals (how much is missing to the
brim). BRIM makes one strategy the only fast path in each mode, and hunts three bugs a child can have one at a time:
whole number bias (1/8 more than 1/3), gap thinking (3/5 and 5/7 "equal" because each is two short) and doubling only
equivalence.

It goes after CREASE because it consumes `FRACTION_BANK` (CATALOG-PLAN section 3), and before GAUGE, whose handoff wants
both fraction games first.

---

## 2. INHERITANCE (real paths and lines, checked 2026-09-15)

| What | From | How BRIM uses it |
|---|---|---|
| Seeded randomness | `satellites/math/core/pure.js` line 15 `rng(seed)` | every deal, so a gate replays a seed |
| Tier ladder | `pure.js` line 58 `adaptTier` | the hint ladder's quiet scaffolds (3.14), never shown |
| Session | `pure.js` line 159 `sessionStep` | a session of twelve rounds (B6's unit) |
| Collectible | `pure.js` line 148 `collectOnce` | a bottle a run on the shelf (3.9) |
| Teacher's link | `pure.js` line 203 `parseConfig`, 181 `buildQuery`; `satellites/math/config/schemas.js` | `config.js`, held equal by `test/config.mjs` (CREASE's) |
| The reveal contract | `satellites/math/core/core.js` line 319 `reveal.show` | its six rules; BRIM's drawing is the fill (as CREASE's creases) |
| Audio | `core.js` line 383 `audio` | four voices and the level ring (3.1), muted until switched on |
| Store and settings | `core.js` line 63 `store`, 110 `settings.mount` | the ladder, the session count (the v1.1 same whole rounds' "never in session 1"), the shelf |
| Sprites | `core.js` line 487 `sprite.draw`; `core/tools/sheet.mjs`; `satellites/crease/draw.js`, `sprites.js` | the bottles on the shelf, the doors' and split controls' pictures |
| FRACTION_BANK and grades | `satellites/crease/bank.js` line 9 `TAGS`, 11 `GRADE_DENOMINATORS`, 26 `FRACTION_BANK` | the equivalence chains for LEVEL, the unit-inversion and benchmark-half items as extra pairs, the grade of every pair (3.5, 3.10) |
| Test harness | `core/test/harness.mjs` 31 `serve`, 45 `SIZES`, 59 `open`, 86 `centre`, 97 `tap` | every browser gate |
| Shared assertions | `core/test/shared.mjs` 33 `assertNoNetworkAfterLoad`, 80 `assertForbiddenStrings(folder, extra)`, 98 `assertKeyboardCompletable`, 127 `assertTabularNumerals` | G2, the words (B8 passes its extra words), keys, numerals |
| Lint, runner, layout, offline, pace, art, specimens, audio, config, icons, shots, worker, doors, shelf | `satellites/crease/tools/lint.mjs`, `tools/check.js`, `test/*.mjs`, `sw.js`, `tools/icons.mjs`, `tools/shots.mjs`, `shelf.js`, `draw.js` | copied and pointed at BRIM, every law watched red again here |

---

## 3. CORRECTIONS AND DIFFERENCES (section 2 of the catalog plan, plus what arithmetic found)

Every numeric claim here was checked by a script on 2026-09-15 before this file was written.

3.1 **RESONARC does not exist** (CATALOG-PLAN correction 3). The level ring is a CORE `audio` voice: two sine partials at
exactly 2 to 1, each setting its own gain; the ear gate renders it offline and measures the two frequencies' ratio from
the rendered samples (a law, 2.000 within half a percent), peak and rms as CREASE's. The other voices: a tap on a glass, the
pour, the settle. One play per event (A1).

3.2 **`classify` cannot give back the bank's own tags from the numbers, because the bank's pairs carry several features
at once.** The script's reading of the handoff's seed bank:
- `5/6 vs 7/8` is tagged `residual` and `4/5 vs 8/9` is tagged `gap-trap`, and the two have the same structure (both
  over a half, both a unit short of the brim, both a gap of one);
- `4/9 vs 7/12` (`straddle-half`), `5/8 vs 7/10` (`same-side-half`), `5/6 vs 7/8` and `9/10 vs 11/12` (`residual`) all share a
  gap between numerator and denominator, so each would also trap gap thinking;
- every `same-denominator` pair also straddles a half, and two of four `same-numerator` pairs do.
So: **`features(pair)` returns every feature a pair has** (`same-denominator`, `same-numerator`, `straddle-half`,
`same-side-half`, `residual` (both over a half and each within a quarter of the brim), `equivalent`, `gap-trap` (the same gap
and unequal)), **a bank pair's tag must be one of its features** (the handoff's gate "classify correctly tags all case
types across the full bank" becomes this law), and a generated pair's `caseType` is its first feature in the difficulty
order (same-denominator, straddle-half, same-numerator, residual, then the rest). B2's interleaving reads `caseType`.

3.3 **B3 cannot hold by chance.** A side chosen at random lands the larger fraction on the left 48 to 52 percent of 500
rounds only 65.2 percent of the time, and on all 20 seeds 0.02 percent of the time. **Sides are dealt balanced by
construction**: every twelve round session puts the larger on the left exactly six times, shuffled so no side runs four,
and the join between sessions is checked too. The law holds on 20 seeds by construction, not by luck.

3.4 **B6 by construction.** Every twelve round session holds two or three `gap-trap` rounds, placed by the deal, never
adjacent (B2), never round one. Round one of a first session is `1/8 vs 7/8` (handoff step 3), added to the bank as
`same-denominator`.

3.5 **Grades, as CREASE 3.1.** Grade 3 (3.NF.A.3.d) compares fractions with the same numerator or the same denominator on
{2, 3, 4, 6, 8}; grade 4 (4.NF.A.2) compares any two on {2, 3, 4, 5, 6, 8, 10, 12, 100}. The seed bank's `2/5 vs 2/9`,
`2/7 vs 3/11`, `5/11 vs 6/10`, `4/9 vs 7/12`, `3/5 vs 5/7`, `1/2 vs 6/7`, `4/5 vs 8/9`, `3/4 vs 7/9`, `4/5 vs 7/9` hold 7, 9 or 11,
which neither grade lists; they are grade 5 (5.NF.A.2 names no list) and served only when a link asks for grade 5. **Every
pair carries the grade computed from its denominators and its case**, grade 3 only for same numerator or same denominator
pairs on grade 3's list; `pairs.mjs` recomputes each. Each case type gets pairs at the grades it can live in, so a grade 3
run is never empty of a case its grade allows. B4 (denominators 12 or less for grades 3 and 4) holds for every pair a grade
3 or 4 run serves.

3.6 **B9 ("splits into 3 and 5") meets B4 (12 or less).** A split multiplies the denominator: splitting halves into 3 or 5
gives sixths or tenths, thirds and fourths into 3 give ninths and twelfths, and nothing else fits under 12 except doubling.
So B9 reads **"at least half of LEVEL's split targets need a split into 3, or into 5 where it fits"**; the targets are
halves, thirds and fourths, and `equivalentsOf` returns the splits that fit. The law counts non doubling targets on 20
seeds.

3.7 **The design spec (`BRIM-design-spec.md`) was not delivered** (CATALOG-PLAN correction 4). v1 is built from the
handoff and this file; the feel of the fill (meniscus, overshoot and settle) is the builder's until Stephen has seen it.

3.8 **Captions are copy.** "Caption is a fact" (handoff step 4): `3/4 is more than 7/9`, `1/8 to the brim`, `the same
level`. No dash, no exclamation point, no "correct" or "wrong" (G7), in COPY and composed by one function the lint reads.
B8's words for the lint: `cross`, `multiply`, `common denominator`, `butterfly`, over every string a browser loads.

3.9 **Mode 5 BUILD, pass and play and the same whole rounds are v1.1** (handoff section 4, rows 10 and 11). The bottle
shelf is v1 (CATALOG-PLAN D8: collectibles ship as the handoff scopes them, cosmetic): one bottle a run of twelve rounds,
never a count.

3.10 **Files.** The handoff's `content.js` holds PAIR_BANK; here `pairs.js` holds it (data BRIM owns), `content.js` holds
the words, as CREASE 3.13. `pairs.js` imports `../crease/bank.js?v=<BRIM's stamp>` for `GRADE_DENOMINATORS` and the
equivalence chains, and BRIM's worker precaches that address. When CREASE's bank changes, BRIM's stamp moves (CREASE's plan
says so too). The handoff's single `test.js` becomes the fleet's `test/*.mjs`.

3.11 **BRIM's stamp starts at `20260916b`**, a stamp no game has carried, so `bank.js?v=`, `core.js?v=` and `pure.js?v=`
at that address can never be an old copy.

3.12 **B7 (the vessels pixel identical) is a live law read off the boxes and the drawn glass**, both vessels' outline
pixels compared at every size; the fill and its level are CSS or SVG, exact, never a sprite, because a level's height is
the lesson (CREASE's creases).

3.13 **B1 as the page is drawn**: before a commit each vessel's fill element has height zero and no drawn water pixel,
before and during a hover or a focus, by thumb and by keys; the gate reads it at the commit's own frame, as the handoff
asks.

3.14 **The hint ladder is silent** (handoff step 8): after one miss on a case type, the next round of that type etches
both glasses' quarter lines, empty; after two, the half line brightens before the tap. Nothing fills (B1), nothing is
written, no count is kept on the screen.

3.15 **Colour** (B5, handoff section 7): deep teal and muted plum, differing in lightness by at least 20 percent in CIE L,
measured by the art gate; the side and the fraction under each glass carry the meaning, never the colour alone.

---

## 4. ARCHITECTURE LAW

```
satellites/brim/
├── index.html          the shell; ../math/core/core.css and ./main.js, both ?v=<BRIM's stamp>
├── main.js             the page: doors, modes, input, the reveal, the run, the shelf
├── engine.js           PURE: features, generatePair, dealSession, scoreChoice, equivalentsOf
├── pairs.js            PURE DATA: PAIR_BANK with tags and grades; imports ../crease/bank.js
├── render.js           the vessels, the fill and meniscus, graduations, the half line, the split's re-etch (DOM, no rules)
├── content.js          the words (COPY), captions, the palette
├── config.js           BRIM's link schema (mode, grade, count)
├── sprites.js  draw.js  shelf.js   the bottles, the doors, the split controls (sixteen colours, literal rows)
├── sw.js  manifest.webmanifest  icon-192.png  icon-512.png  icon-maskable-512.png
├── test/   pairs.mjs engine.mjs (node); matching.mjs half.mjs brim.mjs level.mjs audio.mjs config.mjs layout.mjs
│           offline.mjs pace.mjs art.mjs specimens.mjs (browser)
├── tools/  check.js lint.mjs shots.mjs icons.mjs
└── docs/   DECISIONS.md shots/
```

**The engine.** `Pair = { mode, left: {n, d}, right: {n, d}, caseType, features, trap, grade }` as the handoff, with
`features` and `grade` added (3.2, 3.5). `dealSession(r, { mode, grade, session })` returns twelve pairs with B2, B3 and B6
built in; `scoreChoice(pair, side)` returns `{ correct, larger, caption }`, with `larger` 'left', 'right' or 'same'.
`equivalentsOf({n, d}, { maxDenominator: 12 })` returns every equal fraction by a split that fits. Pure: no `document`,
`window`, `Date`, `performance`, `Math.random`.

**B1 to B10, the law each becomes.**
B1 a live law (3.13) and a static one (render.js's fill is reachable only from the reveal);
B2 no case type three in a row over 200 rounds on 20 seeds;
B3 larger left 48 to 52 percent over 500 rounds on 20 seeds, never four running across session joins (3.3);
B4 every pair a grade 3 or 4 run serves has denominators of 12 or less, over 10,000 pairs on 20 seeds;
B5 the art gate's lightness difference, and every glass labelled by its fraction under it;
B6 two or more gap traps in every twelve round session on 20 seeds (3.4);
B7 live, both vessels' boxes and outline pixels identical (3.12);
B8 the lint's words over every string a browser loads (3.8);
B9 at least half of LEVEL's split targets non doubling on 20 seeds (3.6);
B10 in BRIM mode the reveal lights the empty band above the water and dims the water, read off the page's pixels.
The handoff's authoring guard: every `gap-trap` pair is genuinely unequal, and every bank pair's tag is one of its features.

**The seam.** Browser gates play rounds through the real page and assert each round's pair and scored choice equal
`dealSession` and `scoreChoice` in Node for the same seed and taps.

---

## 5. THE PHASES, WITH GATES (the handoff's section 5 mapped one to one)

Every gate is watched to fail once by a planted fault before it counts, and both lines go in section 13.

### P0. The pairs, the engine, the laws (about 3 hours)
1. `test/pairs.mjs` and `test/engine.mjs` red with no modules, then on 20 seeds: every bank pair's tag among its features;
   every gap trap unequal; every grade recomputed; the handoff's seed pairs all present; B2, B3, B4, B6, B9 as section 4;
   `equivalentsOf` exact and under 12; round one of a first session `1/8 vs 7/8`; `scoreChoice` right on every bank pair.
2. `tools/lint.mjs` from CREASE's: the stamp (with `../crease/bank.js` at BRIM's), the engine and pairs pure, the words
   (B8's added), dashes, bangs, the studio's name, dupkeys, `getUserMedia`, the sprite table.

### P1. The vessels and MATCHING (about 3 hours)
- **The feel first** (handoff step 1): two identical glasses, empty; a tap commits; the chosen glass fills first, then the
  other; meniscus, a small overshoot and settle, a highlight passing the level. Reduced motion makes the fill instant.
- Mode 1 MATCHING with the deal's interleaving; the reveal and caption (a fact, same animation right or wrong).
- `test/matching.mjs`: B1 live by thumb and keys, B7 live, the seam, the reveal contract's rules, captions as facts.

### P2. HALF, BRIM, LEVEL, audio (about 3 hours)
- Mode 2 HALF: the etched half line, brightening on the reveal; same side pairs only after a streak. `test/half.mjs`.
- Mode 3 BRIM: the empty band lit and the water dimmed (B10), caption `1/8 to the brim`. `test/brim.mjs`.
- Mode 4 LEVEL: 4a spot the twin, 4b split: **the waterline holds perfectly still while the glass re etches** (read at
  every frame, within half a pixel); B9. `test/level.mjs`.
- The hint ladder (3.14). The voices and the level ring (3.1), `test/audio.mjs`.

### P3. Shelf, links, layout, pace, offline, art (about 3 hours)
- The bottle shelf (3.9) and `test/specimens.mjs`; BRIM's builder entry and `test/config.mjs`; `test/layout.mjs` at four
  sizes in every state reached by play, keyboard complete at 1366x768; `test/pace.mjs` (the fill at 55 fps under 4x
  throttle, instant with less motion); `sw.js`, the manifest, icons; `sprites.js` and `draw.js`, the sheet opened,
  `test/art.mjs` with B5's lightness law; `tools/shots.mjs`, every shot opened with three faults named.

**BRIM v1 is done** when `tools/check.js` prints ALL GATES PASSED under the lock, every gate has a red line in section 13,
every shot is opened with its faults named, it is deployed and the served files probed, and the listing line is in section
8 for Fable.

---

## 6. THE SCREENS (portrait by thumb at three widths, landscape by keyboard at 1366x768)

- **First run:** a wordless loop: two empty glasses, a hand taps one, both fill, the tapped one fuller. Then the doors, a
  picture each: two glasses (MATCHING), two glasses with a half line (HALF), a glass with its empty band lit (BRIM), two
  glasses level (LEVEL). A link naming a mode shows one door.
- **A round:** two glasses side by side, the same size, the fraction large under each (tabular); the glasses are the
  targets; the gear top right.
- **The reveal:** the chosen glass fills, then the other; the caption under them; next.
- **LEVEL split:** the target glass and the split controls (2, 3, 4, 5 as pictures of a part cut into pieces), the water
  still while the etching changes.
- **The shelf:** bottles earned so far.

---

## 7. ART

Code drawn pixel sprites through CORE's `sprite.draw` and CREASE's `draw.js` shape: the doors' pictures, the split
controls' pictures, the hand in the loop, and 24 bottles (shapes on papers, as CREASE's specimens). The glasses, the water,
the meniscus, the graduations and the half line are CSS or SVG, flat and exact, because a level is the lesson. `tools/sheet`
renders the table and the sheet is opened with three faults named. Painted sheets are Stephen's, later.

---

## 8. LISTING (the line for Fable's portal row)

"Two glasses the same size and a fraction under each: tap the fuller one before they fill, a free fraction game with no
login." (One sentence, no dash. `cat:"math"`, In Development.)

---

## 9. PITFALLS

- Water in a glass before the tap, a hover that tints it, a keyboard focus that previews it (B1).
- Same denominator rounds blocked together (B2); a random side (3.3); gap traps left to chance (3.4).
- A common denominator helper, a caption that multiplies (B8).
- LEVEL completable by tapping 2 (B9); a waterline that moves while the glass re etches.
- Lighting the water in BRIM mode (B10); red and green glasses (B5).
- From CREASE's ledger: a deal with no right answer on the screen; a gate reading a state before the page makes it; a
  queued gate reading a tree mid edit; a stamp another game's import was served under.

---

## 10. DECISION RIGHTS AND OPEN QUESTIONS (the handoff's "Ask Stephen, don't decide", with the default meanwhile)

| Question | Default the build takes |
|---|---|
| Final name | Brim, the working title (CATALOG-PLAN call 4) |
| Mode 5 pass and play in v1 or v1.1 | v1.1 (3.9) |
| Same whole rounds in game or their own micro title | v1.1, in game, undecided (3.9) |
| The feel of the fill before the design spec | the builder's, shot and opened, until Stephen has seen it (3.7) |
| Pairs outside grades 3 and 4 | grade 5, served only when a link asks (3.5) |

---

## 11. STEPHEN ONLY

- The questions above and BRIM's display name.
- A child of eight to eleven on `3/4 vs 7/9` (the handoff's boss pair; its 10.8 percent is a study's, not a child's here).
- 55 fps on a real school Chromebook.

---

## 12. HONEST SIZING

About 12 hours (P0 3, P1 3, P2 3, P3 3), the catalog plan's one day. Where a session stops well: after P1, when MATCHING
and its reveal work, because B1 is the game.

---

## 13. EVIDENCE LEDGER (fill in place, with commands and their real output, most recent last)

(none yet)

---

## 14. THE OVERNIGHT PROTOCOL

HANDOFF-OPUS-SEP15 prompt: never wait on a human; an ambiguity is the smallest reasonable choice logged in
`satellites/brim/docs/DECISIONS.md`; a gate red after three honest attempts goes into SESSION STATE as BLOCKED with its
last thirty lines; never weaken, skip or delete a gate; commit and push the moment something is green.

---

## 15. THE MORNING REPORT (most recent on top)

(none yet)
