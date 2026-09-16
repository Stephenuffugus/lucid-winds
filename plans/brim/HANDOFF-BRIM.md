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

- 2026-09-15 late night, Opus: **P0 green** (21 plants red). **P1, P2 and P3 built and committed**, gated in part:
  MATCHING OK (133 laws) and BRIM OK on frozen copies; HALF red on the half line's stroke (fixed, rerun queued); LEVEL red
  on its etches' strokes (the same fault, fixed, rerun queued). Lint laws 1 to 10 green, plants l1 to l10 red. **Not built:
  LEVEL 4a (spot the twin)**. **Not yet run**: the ear gate, MATCHING's twelve plants, BRIM's and CORE's config gates, and
  the P3 gates (offline, layout, pace, art, specimens); all queued behind CREASE under the lock, ending in BRIM's first full
  `tools/check.js` on a frozen copy (`brim-check1.txt`) after its icons are drawn. **Next action:** read those logs into
  section 13; fix what is red (three honest attempts, then BLOCKED); plants for every P2 and P3 gate on a green copy; the
  sheet and shots opened with faults named; deploy and probe.

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

3.16 **B6 cannot hold at grade 3, and HALF needs its own gap traps.** A gap trap is two unequal fractions with the same
gap between numerator and denominator; with the same numerator the same gap forces the same denominator, and with the
same denominator the same numerator, so the two are equal. Grade 3 compares only same numerator or same denominator pairs
(3.5), so **no gap trap exists at grade 3, and B6 binds grades 4 and 5**. HALF before its streak serves no pair on one side
of a half, and every seed gap trap but `1/2 vs 6/7` lies on one side; **the bank adds gap traps that straddle or hold a
half**: `2/5 vs 5/8`, `1/2 vs 3/4`, `3/6 vs 5/8` (grade 4).

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

### P0, the pairs, the engine and their laws (2026-09-15)

Section 3's arithmetic checked by a script before this plan was written (3.2 the overlapping features, 3.3 a random side
inside 48 to 52 percent of 500 rounds 65.2 percent of the time and on all 20 seeds 0.02 percent, 3.6 the splits that fit
under 12). Writing the engine's law found 3.16: no gap trap can exist at grade 3.

`test/pairs.mjs` and `test/engine.mjs` written first; with no modules both went red on the line that matters:
```
  FAIL  pairs.js loads as an ES module (Cannot find module '/workspaces/lucid-winds/satellites/brim/pairs.js' ...)
  FAIL  engine.js and pairs.js load as ES modules (Cannot find module '/workspaces/lucid-winds/satellites/brim/engine.js' ...)
```
Then `pairs.js` (the handoff's seed pairs, 1/8 vs 7/8, and the pairs each case needs at each grade) and `engine.js`. Both
green on their first run, so neither counts until its plants go red:
```
PAIRS OK
ENGINE OK      (in 1.1 s, 834 sessions a grade on each of 20 seeds among it)
```
`tools/lint.mjs` (CREASE's, with B8's law in place of C2 and C8) and `tools/check.js`: lint, pairs, engine pass. Committed
`3a0f548a`, `9a4df739`. **Watched red** (session scratch `brim-p0-plants.cjs`, a folder copy per plant):
```
p1 a seed pair dropped              FAIL every one of the handoff's seed pairs is in the bank under its tag, with 1/8 vs 7/8: missing residual 3/4 7/9
p2 a tag its numbers do not have    FAIL every pair's tag is one of its own features: residual 1/5 1/3 has same-numerator,same-side-half
p3 an equal pair                    FAIL every pair's tag is one of its own features: same-denominator 2/4 2/4 has equivalent; FAIL no pair is two equal fractions ...
p4 a gap trap with two gaps         FAIL ... gaps differ 3/4 5/7
p5 grade 3 for any grade 3 list     FAIL every pair's grade is recomputed from its numbers: 2/3 5/6 says 3, is 4 ...; FAIL B4: ... 3000 grade 3 served 5/6 vs 2/3
e1 a straddle read as same side     FAIL every pair's tag is one of its own features: straddle-half 5/8 3/7 has same-side-half ...
e2 scoreChoice backwards            FAIL scoreChoice names the larger side by value ...: 1/8 vs 7/8 tapped left {"correct":true,"larger":"left"}
e3 B2 without its neighbours        FAIL B2: no case type three rounds running ...: 3000 matching grade 3 round 9 same-numerator
e4 B3 by chance                     FAIL B3: the larger on the left 48 to 52 percent of 500 rounds, never four running: 3000 left 49.8 percent, a run of 10
e5 B6 one gap trap                  FAIL B6: every session at grades 4 and 5 holds two or more gap traps ...: 3000 matching grade 4 session 0 gap traps at [7]
e6 HALF ignores its streak          FAIL HALF before its streak serves no pair on one side of a half ...: 3000 grade 3 served 7/8 vs 6/8 before the streak
e7 no obvious first round           FAIL round one of a first MATCHING session is 1/8 vs 7/8: 3000 grade 3 opened on 6/8 7/8
e8 equivalents stop short           FAIL equivalentsOf ...: 1/2 gave 2/4,3/6,4/8,5/10 not 2/4,3/6,4/8,5/10,6/12
e9 LEVEL all doubling               FAIL B9: ...: 3000 120 splits, 0 inexact, 21 percent not doubling
e10 an unseeded die                 FAIL a seed replays its sessions ...: 3000 matching does not replay; FAIL engine.js touches no screen, clock or unseeded die: it names Math.random
e11 grade 3 serves grade 4          FAIL B4: ...: 3000 grade 3 served 4/5 vs 3/4
l1 Date in the pairs                FAIL pairs.js touches no screen, clock or unseeded die: it names Date
l2 an unstamped import              FAIL every relative import and local asset carries ?v=20260916b: engine.js loads ./pairs.js
l3 a key twice                      FAIL no object literal declares the same key twice: engine.js said.larger on lines 34 and 36
l4 a multiply in a string           FAIL B8: no cross multiplication, common denominator or butterfly anywhere a browser loads: engine.js names multiply
l5 a .mjs import                    FAIL nothing a browser loads is a .mjs: engine.js names ./pairs.mjs?v=20260916b
```
⛔ **Two plants planted nothing first, and both were the plant's fault.** p2 retagged `3/4 vs 5/6` as `residual`, and both
really are over a half and within a quarter of the brim, so residual IS one of its features; it now retags `1/5 vs 1/3`
(both under a half). l3 wrote the duplicate as a shorthand property (`larger,`), and the fleet's `tools/dupkeys.mjs` reads
only `name:` keys (a second gap beside the one in CREASE's ledger, reported with it); it now plants `larger: larger` twice.
⛔ `satellites/brim/package.json` is caught by the repo's `.gitignore` rule `package.json`; SPAN's, YONDER's and CREASE's
were force added, and so is BRIM's.

### P1, the vessels, MATCHING and the reveal (2026-09-15, in progress)

`index.html`, `render.js`, `main.js`, `content.js` (COPY, `caption` composing the fact), `config.js`, `test/matching.mjs`
(twelve laws in its header) written; committed `18e67889` before any browser gate ran on them. The glasses are compared
by box and computed style (size, borders, corners, background), not by pixels as 3.12 says; the ledger says so rather than
calling it a pixel law. **Lint law 10** (B1 as the code is written: the water gets a level only from `render.js` `fillTo`,
called only from `main.js` `runReveal`): green, and **watched red** (`brim-lint-plants.cjs`):
```
l6 a glass filled as the round starts     FAIL B1: the water gets a level only from render.js fillTo, called only from main.js runReveal: main.js calls fillTo outside runReveal (in startRound)
l7 water given a height with its fraction FAIL B1: ...: render.js gives the water a height in setFraction ((f.n / f.d * 100) + '%')
```
`test/matching.mjs` queued on a frozen copy behind CREASE's P3 check. Its first run, on that copy: **MATCHING OK**, 133
laws green, among them
```
  ok    375x667 B7: the two glasses are the same box and the same drawn glass, their tops level ([96,168,96,168])
  ok    375x667 round 13: B1, no water before the choice, after a hover, with a glass focused, or at the click ({"before":true,"hovered":true,"focused":true,"atClick":true})
  ok    375x667 round 13: the pair is dealSession's (2/3 vs 5/6, Node 2/3 vs 5/6)
  ok    375x667 a right round and a wrong round fill on the same curve (largest difference 0.000 over 40 frames)
```
Green on a first run counts for nothing until its plants go red. **Watched red** (`brim-p1-plants.cjs`, on the same copy):
```
m1 water before the choice        FAIL 320x568 round 1: B1, no water before the choice, after a hover, with a glass focused, or at the click ({"before":false, ...
m2 a hover that fills             FAIL 320x568 round 1: B1, ... ({"before":true,"hovered":false, ...
m3 two glasses not alike          FAIL 320x568 B7: the two glasses are the same box and the same drawn glass, their tops level ([96,132,100,132])
m4 the other glass first          FAIL 320x568 round 1: the chosen glass fills first, the other only once it has reached its level (frames 42 then 0, 65 early)
m5 a level that never settles     FAIL 320x568 round 1: both glasses end exactly at their fractions, drawn to the pixel (left 0.1300 of 0.1250, 0.64 px ...
m6 a verdict in the caption       FAIL 320x568 round 1: the caption is the fact ("Right, 7/8 is more than 1/8", ...)
m7 wrong rounds fill slower       FAIL 375x667 a right round and a wrong round fill on the same curve (largest difference 0.214 over 42 frames)
m8 less motion still animates     FAIL 375x667 with less motion the fill is instant: both glasses at their levels on the reveal's first frame ({"t":312.526,"left":0, ...
m9 a seed off by one              FAIL 320x568 round 1: the pair is dealSession's (7/8 vs 1/8, Node 1/8 vs 7/8)
m10 the other side scored         FAIL 320x568 round 1: the result is scoreChoice's for right ({"correct":false,"larger":"right"})
```
⛔ `m11 next too short` planted nothing, and the plant was at fault: it lowered `#next`'s `min-height` to 40 px, and the
button's own padding and line height still drew it 56 px tall, so the page stayed within the law. It now pins next to a 30 px
box with no padding. Rerun: `m11 next too short  FAIL 320x568 next is a 56 px target after the reveal | FAIL 375x667 ... |
FAIL 412x915 ...`. Counted; MATCHING's twelve plants are all red.
```
m12 no focus back on a glass      FAIL 1366x768 keyboard Enter on next deals the next round with focus on the left glass ()
```

### P2, HALF, BRIM, LEVEL and the voices (2026-09-15, in progress)

Written and committed before any browser gate ran on them (`610ca80e`, `3532ee91`): HALF (the etched half line, bright after
the fill; five right open same side pairs from the next session), BRIM mode (the empty band lit exactly the missing height,
the water dimmed, B10; read by `test/brim.mjs` off boxes and computed styles, not pixels), LEVEL 4b (one glass holding its
water, etched into its parts; the child's split first and the true split second; `test/level.mjs` holds the waterline still
to half a pixel at every frame). **Not built: LEVEL 4a, spot the twin** (the handoff's step 7 names both; v1 here has the
split, which carries B9). **Lint law 10 widened** to the empty band and to LEVEL's given water (`holdLevel` only on a line
that asks for LEVEL); **watched red**:
```
l8 the empty band sized with its fraction   FAIL B1: ...: render.js gives the empty band a height in setFraction (((1 ...
l9 the band lit as the round starts         FAIL B1: ...: main.js calls lightEmpty outside runReveal (in startRound)
l10 given water in a comparison mode        FAIL B1: ...: main.js calls holdLevel on a line that does not ask for LEVEL
```
**The first HALF and BRIM mode runs** (a frozen copy): **BRIM OK**; HALF red on one law, and the page was at fault:
```
  FAIL  375x667 both glasses carry the half line at exactly half their inside height, dashed, not bright before a choice ([["84.0",164,"dashed",false],["84.0",164,"dashed",false]])
```
The half line is a top border on a zero height box set at `bottom: 50%`, so its stroke sits above the half. Each stroke is
now pulled down by half its own thickness; ⛔ and the gate measured the box's top edge, so it now reads the stroke's centre,
which is where the eye reads the line. HALF reruns queued.

**The reruns and the rest of P2's gates** (2026-09-16, frozen copies under the lock):
```
=== brim half        HALF OK
=== brim config      CONFIG OK
=== core config      CONFIG OK      (the builder's entries for crease, brim and glimpse held equal to each page)
LEVEL OK
  ---   twenty loud seconds: peak 0.177  rms 0.0287  above 3 kHz 5.6 percent
AUDIO OK
```
Their plants are next (P2's and P3's together, after BRIM's first full check).

### P3, the full checks and the shots (2026-09-16)

**The first full check** (frozen copy, icons drawn under the lock first): every gate green but layout, and the page was at
fault:
```
  FAIL  320x568 LEVEL before a split: everything a thumb needs is on the screen without scrolling: #splits .split[data-k="5"] (12,532 to 68,588 in 320x568), #splits .split[data-k="6"] (76,532 to 138,590 in 320x568)
  FAIL  375x667 LEVEL before a split: ... #splits .split[data-k="6"] (12,616 to 74,672 in 375x667)
```
LEVEL's one glass stands 128 px and the column closes to 10 px gaps at 420 wide or narrower. **The second full check:** 375
green, 320 still red (`(12,534 to 68,590 in 320x568)`: the five splits wrap to two rows there). At 360 wide or narrower the glass
is 100 px and the top padding 56 px. The third full check runs on that commit (`f69d917a`).

**The shots, taken and opened** (`tools/shots.mjs`, written this session: BRIM had none; `p3-level-320x568`,
`p3-matching-reveal-375x667`, `p3-shelf-375x667` opened). Faults named: ⛔ LEVEL at 320 (shot before the last fix) shows the
second row of splits cut off, the fault the gate found, and an empty band above the splits, which is `#caption` reserving its
2.4em before a caption exists (kept: it stops the splits jumping under a thumb when the caption comes); ⛔ the MATCHING
reveal's caption writes "7/8 is more than 1/8" in slash fractions under glasses labelled with stacked ones, two notations on one
screen (accepted for v1: the caption is read aloud by a screen reader as written, and a stacked fraction in running text would
not be); ⛔ the shelf after one run is one small bottle in a large empty board (CREASE's accepted fault, the same here).

**The third full check** (`f69d917a`, frozen copy, under the lock): every gate green, `ALL GATES PASSED` (layout 123 s, specimens
166 s).

**P2 and P3 plants** (`plans/lane-c-plants/brim-p2p3-plants.cjs`, on the third full check's copy), one plant a gate:
```
h1 a wrong choice keeps the streak    half      FAIL  375x667 a wrong choice sets the streak back to nothing, and seven rounds with one wrong open nothing ([[1,false],[2,false],[3,false],[4,false],[5,true],[6,true],[7,true]])
```
The run finished (the codespace was not refreshed); **all ten watched red**, each on the law it plants against:
```
b1 the band a tenth too tall          brim      FAIL  375x667 after the reveal each band is fully lit, exactly the part missing tall ... round 1 {"lit":1,"h":36.890625,...
v1 the true split etched first        level     FAIL  320x568 round 1: the split into 3 is etched first and exactly, the true split into 3 second and exactly ...
a1 no pour for a glass chosen         audio     FAIL  with Sound on, a right round plays one tap, one pour and one settle and nothing more (["tap","settle"])
c1 the builder offers another grade   config    FAIL  every key the builder offers ...: grade defaults to 3 in the builder and 4 ...
s1 every bottle the first             specimens FAIL  the next run's end holds two, the second another shape in another glass ([{"row":0,"col":0,"shape":"flask","glass":0}])
r1 two waters alike in lightness      art       FAIL  375x667 B5: the two waters differ by 2.1 in CIE lightness (at least 20; rgb(31, 111, 115) and rgb(42, 116, 120)) ...
p1 a fill frame that works 30 ms      pace      FAIL  under 4x CPU throttle the fill's frames come a median of 66.7 ms apart (at most 18.2) ...
y1 the caption under 0.7 rem          layout    FAIL  320x568 MATCHING after its reveal: no text is under 0.7 rem: caption 9.6px | ...
o1 the worker deletes every cache     offline   FAIL  a worker installing again deletes older brim caches and leaves every other cache alone (["brim-shell-20260916b"])
```
**Every BRIM gate is now counted.**

**Deployed and probed (2026-09-15 22:31 UTC).** BRIM's pages had gone out with the whole branch push that carried CREASE, but
without its icons, the LEVEL fold fix or its shots. `satellites/brim` was deployed alone onto main (`ddc00823`, a worktree on
origin/main, main then merged back into `add-sproing-jumper`). Probes, one file at a time with a random query:
`/satellites/brim/sw.js` 200 naming `brim-shell-20260916b`; `/satellites/brim/icon-192.png` 200 `image/png` 936 B.
**BRIM is live** (unlisted; the portal row is Fable's), so GAUGE may deploy when its own gates are counted.

---

## 14. THE OVERNIGHT PROTOCOL

HANDOFF-OPUS-SEP15 prompt: never wait on a human; an ambiguity is the smallest reasonable choice logged in
`satellites/brim/docs/DECISIONS.md`; a gate red after three honest attempts goes into SESSION STATE as BLOCKED with its
last thirty lines; never weaken, skip or delete a gate; commit and push the moment something is green.

---

## 15. THE MORNING REPORT (most recent on top)

(none yet)
- SHOT p3-matching-375x667.png OPENED. Faults: (1) both glasses are drawn EMPTY while their labels read one eighth and seven eighths — the picture contradicts the numbers, and a child reading the picture learns the wrong thing; (2) the right glass sits lower than the left so their bases do not line up; (3) no words anywhere say what to do; (4) the shelf ends halfway down and the bottom half of the screen is empty.
- SHOT p3-level-375x667.png OPENED. Faults: (1) the ask is three twelfths and the jar is labelled one quarter directly under it, so the answer is printed on the same screen as the question and there is nothing left to work out — this needs the page checked, not just the picture; (2) the jar carries two short tick lines on its left and nothing else, so neither twelve parts nor four parts can be counted in it; (3) the five answers are wordless bundles of teal bars that wrap four then one, leaving a lone button on its own row; (4) a pale highlight stripe crosses the teal band and reads as a division of the liquid that is not there.
- SHOT p3-shelf-375x667.png OPENED. Faults: (1) one small teal jar in the top left corner of an empty shelf, the corner disease again; (2) the jar is about 56 px tall and its shape (a rounded wedge) does not match the tall straight glasses the game itself draws in play, so the collected thing and the played thing are not the same object; (3) the shelf is a flat tan slab with no shelf edge, no depth and no place marks, so nothing says more jars will come; (4) the bottom third is empty.
- SHOT p3-half-reveal-375x667.png OPENED. The best screen opened so far in this catalog: both glasses are filled to their real levels, a single black line runs across both at the smaller level so the comparison is visible and not just stated, and the sentence names the answer in words. Faults: (1) nothing says what that black line is, and it is the one thing doing the teaching; (2) the two liquids are different colours, teal and mauve, which invites a child to compare colour rather than height; (3) the right glass wears a thick black outline with nothing to say whether that means chosen, correct, or asked about; (4) go on is a bare arrow in the corner and the bottom third is empty.
- SHOT p3-brim-reveal-375x667.png OPENED. Strong: the yellow headspace makes the gap to the brim visible rather than stated, and both glasses are filled to their real levels. Faults: (1) the sentence names 1/8 and 2/8 while the labels under the glasses name 7/8 and 6/8, so four fractions sit on one screen with nothing drawn to connect the gap to the fill; (2) nothing labels the yellow band, and yellow on top of a pale liquid reads as a second liquid (juice) rather than as empty space; (3) the two liquids are different colours again, blue grey and pink grey, which invites comparing colour instead of height; (4) the left glass wears the thick black outline whose meaning is still unexplained, the same unexplained mark as the half reveal.
- SHOT p3-matching-reveal-375x667.png OPENED, and put beside p3-half-reveal it shows BRIM teaching two different ways in one game: the half reveal draws a single black line across BOTH glasses so the comparison is visible, and this one draws no line at all, leaving the child to judge two bands of different colours by eye. Faults: (1) no shared level line here, so the reveal states the answer in words and shows nothing; (2) the thick black outline is on the SMALLER glass this time and was on the larger one before, so it marks the choice and not the answer, and nothing says so; (3) teal against mauve again, two colours inviting a comparison of hue rather than height; (4) the bottom third is empty and go on is a bare arrow in the corner.
- SHOT p3-doors-375x667.png OPENED. BRIM joins NOTCH and GLIMPSE: four doors, no words on any of them. Faults: (1) four ways to play with nothing naming any of them; (2) the thumbnails are glasses about 20 px tall, below the size at which a fill level can be read, so the pictures that replace the words cannot be read either; (3) the board above holds two EMPTY glasses and a small black square floating over the left one, unexplained, so the screen standing for the game shows nothing being compared; (4) the top third is empty and the doors sit in a band across the middle.
- SHOT p3-level-320x568.png OPENED, and this is the most urgent finding of the night because BRIM IS LIVE: at 320 the answer buttons are CUT OFF BY THE BOTTOM EDGE. The first row of three sits at about y=940 to 1050 of a 1136 tall capture (568 CSS px doubled) and the second row of two is sliced through, so a child on a small phone cannot see or reach two of the five answers. Same shape of fault as TINT’s Pour under the fold, which a shot found first as well. Next: a layout law for this state at 320, watched red, then the fix, then a deploy. Also standing from the 375 shot: the ask is three twelfths while the jar is labelled one quarter underneath, so the answer is printed beside the question.
- SHOT p3-shelf-320x568.png OPENED. Faults: (1) one small teal jar in the top left corner of an empty shelf, the corner disease at 320 as well; (2) the jar is about 30 px wide here, small enough that its shape is unreadable; (3) the shelf is a flat tan slab with no edge or place marks; (4) the bottom third is empty under the play button.
- HOLD ON THE "CUT OFF" CLAIM ABOVE until it is measured. The shot and the layout gate stand in the SAME state (both tap #start-level and wait 250 ms), the gate rejects any control whose bottom passes the viewport, and the gate is green. So what I read as slicing may be the capture boundary meeting buttons that sit flush against the bottom edge with no gutter. Measuring the rects at 320 now; whichever way it falls goes in the ledger.
- MEASURED, AND I WAS WRONG: at 320 in the LEVEL state the five splits run top 442 to bottom 498 (row one) and top 506 to bottom 562 (row two) in a 568 px viewport. The second row clears the fold by SIX PIXELS. Nothing is cut off, the layout gate was right, and my reading of the shot mistook the capture’s bottom boundary for a slice. ⛔ FOURTH wrong call from a picture tonight (GAUGE’s zoom, HUSH’s fork bird, CREASE’s strip, now this): a shot names a SUSPECT, a measurement names the CULPRIT, and the ledger keeps both. BRIM is live and did not need an emergency fix; the CSS comments show this exact fault was found and fixed twice before at 420 and 360 px, which is why it clears today. What remains is small and real: six pixels is no gutter at all, the page still scrolls 18 px (document 586 against 568), and the same edge gutter law proposed for GAUGE would cover both.
- SHOT p3-matching-1366x768.png OPENED, and it confirms the empty glass fault at every width: both glasses are drawn EMPTY under labels reading one eighth and seven eighths, exactly as at 375. Faults: (1) the picture contradicts the numbers, and a child reading the picture learns the wrong thing, at 320, 375 and 1366 alike; (2) the shelf panel sits in the top third of a 768 px tall screen with the bottom sixty per cent empty; (3) the two glasses are pushed to the middle of a wide panel with large tan margins either side, so the panel is mostly empty too; (4) nothing else appears on the screen at all, no words, no prompt, no visible way to answer.
- SHOT p3-half-reveal-320x568.png OPENED. The teaching survives the narrow size: both glasses filled to their real levels, one black line drawn across BOTH at the smaller level so the comparison is visible, and the answer named in words. Faults: (1) the black line is still unlabelled, and it is the one thing doing the work; (2) teal against mauve again invites comparing hue instead of height; (3) the thick black outline on the right glass still means something a child is never told; (4) go on is a bare arrow in the corner with the bottom quarter empty.
- SHOT p3-brim-reveal-320x568.png OPENED. The yellow headspace still shows the gap to the brim at the narrow size, which is the good part. Faults: (1) the sentence names 1/8 and 2/8 while the labels under the glasses name 7/8 and 6/8, and at 320 it wraps as "2/8 to / the brim", so the phrase that carries the answer breaks across a line; (2) nothing labels the yellow band, and against a pale liquid it reads as a second liquid rather than as empty space; (3) the thick black outline marks the child’s choice with nothing saying so; (4) the two liquids are different colours again, blue grey and pink grey.
- SHOT p3-matching-320x568.png OPENED. Both glasses EMPTY again under one eighth and seven eighths, so that fault holds at 320, 375 and 1366 alike. On the missing answers: the layout gate treats #left and #right (the glasses themselves) as the things a child presses, so there are no buttons to be missing — the fault is that NOTHING MARKS THE GLASSES AS PRESSABLE. They carry no border, no shadow, no label and no hint, so a child sees two empty jars on a shelf and no way in. Also: (1) the shelf ends at about half the screen height with the bottom half empty; (2) no words appear anywhere on the screen.
- SHOT p3-level-1366x768.png OPENED. Faults: (1) the ask is three twelfths and the jar is labelled one quarter directly beneath it, so the answer is printed under the question at this width too; (2) the five answers are small bundles of teal bars sitting in the lower LEFT of the screen while the jar they refer to is centred above, so the eye has to cross the page to connect them; (3) the jar is about 95 px tall on a 768 px tall screen, floating in the middle of a board whose right half is entirely empty; (4) the answers carry no numbers at all, only bars to be counted, and at this size the bars are about 6 px apart.
- SHOT p3-matching-reveal-320x568.png OPENED. Faults: (1) no shared level line here, unlike the half reveal at the same width, so this reveal states its answer in words and shows nothing — one game teaching two ways, confirmed at 320; (2) the thick black outline sits on the SMALLER glass, marking the child’s choice rather than the answer, with nothing saying so; (3) the teal 1/8 is a thin band at the bottom of one glass while the mauve 7/8 nearly fills the other, two different colours inviting a comparison of hue; (4) go on is a bare arrow in the corner with the bottom third empty.
- SHOT p3-shelf-1366x768.png OPENED. Faults: (1) the single earned jar sits in the top left corner of a 620 by 420 board with the rest bare, the corner disease at its most exposed; (2) the jar is a teal wedge about 80 px tall whose shape does not match the tall straight glasses the game draws in play, so the collected thing and the played thing are different objects; (3) the board is a flat tan slab with no shelf edge, no depth and no place marks; (4) roughly 370 px of empty page on each flank and 130 px below.
- SHOT p3-half-reveal-412x915.png OPENED. The shared black level line runs across BOTH glasses at this size too, so the comparison is shown and not merely stated — still the best teaching in the catalog. Faults: (1) that line is unlabelled and it is the one thing doing the work; (2) teal against mauve invites comparing hue rather than height; (3) the thick black outline on the right glass marks the child’s choice with nothing saying so; (4) the bottom half of a 915 px screen is empty below a bare arrow.
- SHOT p3-brim-reveal-412x915.png OPENED. The yellow headspace shows the gap to the brim at this size too. Faults: (1) the sentence names 1/8 and 2/8 while the labels under the glasses name 7/8 and 6/8, four fractions on one screen with nothing drawn to connect a gap to a fill; (2) nothing labels the yellow band, and over a pale liquid it reads as a second liquid; (3) the thick black outline marks the child’s choice with nothing saying so; (4) the bottom half of a 915 px screen is empty below a bare arrow.
- SHOT p3-doors-412x915.png OPENED. Faults: (1) four ways to play and no word on any of them, at this width as at every other; (2) the board above holds two EMPTY glasses and a small black square floating over the left one, so the screen standing for the game shows nothing being compared and one unexplained mark; (3) the four thumbnails are glasses about 40 px tall, below the size at which a fill level can be read, so the pictures that replace the words cannot be read either; (4) the top 65 per cent of a 915 px screen is empty above the board.
- SHOT p3-level-412x915.png OPENED. Faults: (1) the ask is three twelfths and the jar is labelled one quarter directly beneath it, so the answer is printed under the question at the fourth width as well — this one needs the page checked, not the picture; (2) the five answers are wordless bundles of teal bars sitting in the lower left while the jar is centred above, so the eye must cross the page to connect them; (3) the jar carries two short tick lines and nothing else, so neither twelve parts nor four parts can be counted in it; (4) the bottom 45 per cent of the screen is empty.
- SHOT p3-shelf-412x915.png OPENED. Faults: (1) the single earned jar sits in the top left corner of the shelf at the fourth width too; (2) the jar is a teal wedge whose shape does not match the tall straight glasses the game draws in play, so the collected thing and the played thing are different objects; (3) the shelf is a flat tan slab with no edge, no depth and no place marks to say more will come; (4) the board floats in the middle of a 915 px screen with roughly 600 px of empty page above it.
- 🚨 **THE WHOLE SITE IS DOWN AT THE HOST, not just a new deploy.** Probed twice, seven minutes apart, with a long back off between: https://lucidwinds.com/satellites/tint/index.html, /satellites/gauge/index.html and /satellites/brim/index.html ALL return **522 text/plain, 16 bytes** — TINT and BRIM were confirmed serving 200 earlier today. A 522 is the edge failing to reach the origin, so this is Hostinger side and the same family as the 429 lockout at the start of the night (empty bodies, wrong content type, per IP). WHAT THIS MEANS FOR A CHILD: a repeat visitor is covered by the service worker fallbacks deployed earlier tonight (they answer 429 and 5xx from a good cached copy), but a FIRST TIME VISITOR GETS NOTHING. ⛔ THE FIX IS STEPHEN’S, in hPanel (CDN / security settings), exactly as with the 429s; nothing in this repo can serve a page the edge will not fetch. Probing is stopped rather than hammering a failing edge.
- **CORRECTION TO THE PRIORITY 0 ABOVE, and it matters**: after a longer back off, https://lucidwinds.com/satellites/tint/index.html answers **200 text/html, 10043 bytes** again, while /satellites/gauge/index.html still answers **522**. So the edge is NO LONGER failing for everything. What I saw earlier was real — TINT and BRIM were both 522 at that moment, which is why I called it site wide — but it has cleared for the pages that were already serving, and GAUGE ALONE IS NOT SERVING. That points at the new directory not being on the origin yet (deploy propagation) rather than an outage, and it means the earlier Priority 0 note overstates the CURRENT state even though it was true when written. Probing again with a known live page first and a gap between requests. GAUGE stays PUSHED AND NOT CONFIRMED SERVING until its page and worker answer 200 with the stamp.
