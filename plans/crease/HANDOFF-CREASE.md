# HANDOFF CREASE, the build plan for the math catalog's third game

**Written:** 2026-09-15, by Opus (the builder), as step 1 of CREASE (`plans/math/CATALOG-PLAN.md` section 8), from three
inputs read whole: `assets/math-catalog/01-CREASE-handoff.md` (Stephen's delivery, read only), `plans/math/CATALOG-PLAN.md`
(which binds this file and wins over the handoff), and CORE as built (`plans/math/HANDOFF-CORE.md`, `satellites/math/core/`),
with SPAN and YONDER (`plans/span/HANDOFF-SPAN.md`, `plans/yonder/HANDOFF-YONDER.md`) as the finished examples. Where this
file and the handoff differ, every difference is in section 3.
**Game folder:** `satellites/crease/` (free, checked 2026-09-15). **Live URL when listed:** `lucidwinds.com/satellites/crease/`.
**Working title:** Crease. The display name is Stephen's (CATALOG-PLAN call 4; the handoff offers SNIP, TAUT, RUNG, PLUMB).

---

## SESSION STATE (the builder updates this at the end of every session; the morning reader starts here)

- 2026-09-15 night, Opus: plan written, before any code.
  **Next action:** P0 (section 5), the laws first: `satellites/crease/test/engine.mjs` red with no `engine.js`, then
  `bank.js` (FRACTION_BANK with its six tags and a grade on every item, section 3.2), then `engine.js` (`generateTask`,
  `scoreAttempt`, the tolerance ladder, the whole's mix, the equivalence chains), then `tools/lint.mjs` with C2's and C8's
  static laws, `tools/check.js`, commit.

---

## 0. RULES OF ENGAGEMENT

1. **The fence.** `satellites/crease/**`, this file, and `satellites/math/config/schemas.js` (CREASE's entry only). CORE
   (`satellites/math/core/**`) takes at most the two changes named in section 3 (3.6 the number line's `snap`, 3.11 the
   builder's own stamp), each made under CORE's plan with a law watched red, CORE's gates green and CORE's stamp moved,
   SPAN's and YONDER's workers following. Read only: `assets/math-catalog/**`, `plans/math/CATALOG-PLAN.md`,
   `satellites/span/**` and `satellites/yonder/**` (copied from, never edited except a stamp that follows CORE),
   `satellites/airworthy/**`, every other satellite, `scripts/`, `music-unlocks.js`. **No portal row**: adding one is
   Fable's, from section 8's line.
2. **Git.** Stage by path, never `-A`. Commit and push the moment something is green. Deploy is
   `git push origin add-sproing-jumper:main` after `git log HEAD..origin/main` is empty, then one request per served file
   with a random probe, a few seconds apart (the host answers `429` to a probe loop).
3. **The laws.** The fleet's (HANDOFF-OPUS-SEP15 section 6), CORE's G1 to G13, the reveal contract (CORE 2.2), and CREASE's
   C1 to C8 (section 4). No dash and no exclamation point in anything a child or a teacher reads; "Sky Wolf Studio",
   singular; 48 px targets (56 for the marker and the crease controls, the young), text 0.7 rem or larger, measured; the
   engine pure; a count is a law proved on 20 seeds; a gate never sets the state it asserts.
4. **Browser gates run one at a time under the lock**, in the foreground or in a background chain that waits on it.
5. **Never wait on a human.** Section 10 lists what is Stephen's and the default the build takes meanwhile.
6. **YONDER's scars, carried here before they cost anything:** speech or audio called inside an animation frame is
   guarded so a throw can never end a reveal; a frame's time is clamped at zero before it indexes anything; a plant that
   inserts CSS at the start of a rule plants nothing; a gate asserts G2 before it reloads its page; a sprite row is never
   built by code; a batch patch asserts every match and writes after every edit.

---

## 1. WHAT CREASE IS, AND WHY IT GOES HERE

A child who reads `1/8` as two whole numbers concludes it is more than `1/3`: whole number bias, the reason fractions block
more students than any other skill. On a number line a fraction is one place, not two numbers. Every competing product
hands the child a line already cut into parts, so the child counts marks and the bias survives a perfect score. CREASE
has the child fold the paper strip into equal parts, and then takes the folds away.

It goes after YONDER because it consumes the same number line (CORE's `numberline`, geometry, loupe) and the same reveal
shape, and it authors `FRACTION_BANK`, which BRIM (next) consumes.

---

## 2. INHERITANCE (real paths and lines, checked 2026-09-15)

| What | From | How CREASE uses it |
|---|---|---|
| Seeded randomness | `satellites/math/core/pure.js` line 15 `rng(seed)` | every generator, so a gate replays a seed |
| Strip geometry (C1) | `pure.js` line 132 `lineGeometry(r)` (72 to 94 percent wide, offset capped), 136 `fromNormalized`, 137 `toNormalized` | the strip's width and offset every round; marker pixels to a value and back |
| The number line, loupe and keys | `satellites/math/core/core.js` line 207 `numberline.create({ container, geom, onCommit, keyStep, ends })` | FREEHAND as it is; CREASE mode with the `snap` option (3.6) |
| The reveal contract | `core.js` line 311 `reveal.show` | its six rules; CREASE's own drawing (the strip creasing itself), as YONDER's walk |
| Tier ladder | `pure.js` line 58 `adaptTier(history, { tiers, up, down, start, floor })` | the five tolerance tiers (section 4) |
| Session | `pure.js` line 159 `sessionStep` | a run's length, time handed in |
| Collectible | `pure.js` line 148 `collectOnce` | a paper specimen per run (3.9) |
| Teacher's link | `pure.js` line 203 `parseConfig`, 181 `buildQuery`; `satellites/math/config/schemas.js` | `config.js` both parse, held equal by a gate (YONDER's `test/config.mjs`) |
| Audio | `core.js` line 376 `audio.define / play / setMuted / renderLoud` | four voices (3.8), muted until switched on |
| Store and settings | `core.js` line 63 `store`, 110 `settings.mount` | the ladder and the specimens kept, the shared panel |
| Sprites | `core.js` line 480 `sprite.draw`; `core/tools/sheet.mjs`; YONDER's `draw.js` shape | pins, the clip marker, specimens, drawn from `sprites.js` |
| Test harness | `core/test/harness.mjs` 31 `serve`, 59 `open`, 86 `centre`, 97 `tap` | every browser gate |
| Shared assertions | `core/test/shared.mjs` 33 `assertNoNetworkAfterLoad`, 80 `assertForbiddenStrings`, 98 `assertKeyboardCompletable`, 127 `assertTabularNumerals`, 143 `assertLineRandomization` | G2, the words, keys, numerals, C1 |
| The lint, runner, layout, offline, icons, shots, pace, art, plants | `satellites/yonder/tools/lint.mjs` (laws 1 to 11), `tools/check.js`, `test/layout.mjs`, `test/offline.mjs`, `test/pace.mjs`, `test/art.mjs`, `sw.js`, `tools/icons.mjs`, `tools/shots.mjs`, `draw.js` | copied and pointed at CREASE, every law watched red again here |
| Words for the shelf, not the game | `satellites/airworthy/` uses "crease" for a paper plane's folds | a vocabulary overlap on the same shelf (CATALOG-PLAN section 1), no code shared |

---

## 3. CORRECTIONS AND DIFFERENCES (section 2 of the catalog plan, plus what arithmetic found)

3.1 **The handoff's seed bank breaks its own C7.** Grade 3 allows denominators {2, 3, 4, 6, 8} (C7, CCSS 3.NF). Of the seed
items, 2/9, 2/5, 3/10, 4/9, 5/9, 6/11, 7/15, 6/9, 8/12, 3/5 and 7/12 all fall outside it; the whole `benchmark-half` set does,
and so do two of the four `near-miss-pairs` members (3/5 and 7/12; checked by a script, not by eye). Grade 4's list (CCSS 4.NF.A.1) is {2, 3, 4, 5, 6, 8, 10, 12, 100}, and
9, 11 and 15 fall outside that too, so 2/9, 4/9, 5/9, 6/9, 6/11 and 7/15 belong to no grade CCSS names. **Every bank item
carries the lowest grade whose denominator list admits it** (3, 4, or `extended` for 9, 11, 15), the generator serves only
items at or under the configured grade, and each tag gets grade 3 items so no tag is empty at grade 3: `benchmark-half`
adds 3/8 and 5/8 (grade 3) and 5/12, 7/12, 4/10, 6/10 (grade 4); `unit-inversion` adds 1/2·1/6 and 2/3·2/8 (grade 3);
`near-miss-pairs` adds 2/3·3/4 and 3/8·2/6 (grade 3). The handoff's items all stay, tagged by grade. The bank law asserts
every item's grade from its denominator, not from its label.

3.2 **One tag name, the bank's.** `Task.trap` says `'unit-fraction-inversion'`; the tag list BRIM depends on says
`unit-inversion`. BRIM depends on the tag list ("do not rename"), so `trap` takes the six tag names exactly:
`unit-inversion`, `benchmark-half`, `equivalence`, `whole-equals-one`, `improper`, `near-miss-pairs`, or null.

3.3 **The whole must hold the fraction.** "In non-long modes, `whole` is never less than the fraction's value": 7/4 and 9/8
need a whole of at least 2, and 11/3 (3.67) of at least 5 on the handoff's set {1, 2, 3, 5}. The generator picks the whole
from the configured mix and rejects any whole under the value; the law asserts it on 20 seeds. The data structure's
`whole: 1, 2, 3 or 5` stands, with C3's 0 to 1, 0 to 2, 0 to 5 as the mix and 0 to 3 in it.

3.4 **Scoring in values.** PAE is `|placement − value| / whole`, placement and value in the strip's own numbers, so a strip's
width and offset change nothing (C1). The gate asserts it at the extremes of the randomization (72 and 94 percent wide,
offset 0 and the cap), where the handoff warns the off by ones hide. `near` is within twice the tier's band (the reveal
contract's rule 5 lets the game count it; nothing on the screen differs).

3.5 **"Never repeats a fraction within 4 rounds" counts a fraction as its numerator and denominator.** 1/2 then 2/4 is not
a repeat: C4's equivalence chain serves exactly that on purpose. The law holds on 20 seeds with chains in the mix.

3.6 **CREASE mode needs a marker that snaps to the creases, and CORE's number line does not snap.** The one change:
`numberline.create({ ..., snap: n })` places the stone on the nearest of n equal parts, by drag and by keys, its value still
normalized; without `snap` nothing changes. A CORE law first (in `core/test/demo.mjs`, as `ends` was), watched red; CORE's
gates green, CORE's stamp moved, SPAN's and YONDER's workers following. The alternative, a second marker in CREASE's own
render with its own loupe and keys, duplicates the thing CORE exists to hold once.

3.7 **Mode 3 HALFWAY's handoff is one line.** "6s generous clock, no penalty on timeout, 'exactly half' after 5-streak" and
the design spec (not delivered) holds the rest. v1 reads it as: a fraction appears; the child sends a paper clip to the
left of the strip's fold (less than half) or to the right (more than half); after five in a row a third choice, "exactly
half", joins them. The six seconds are never shown (G5: no visible timer); when they pass, the reveal runs as if the child
had not chosen, with no mark against them and nothing said. Items come from `benchmark-half` and `whole-equals-one`
(4/8 is exactly half). Logged in DECISIONS; Stephen's spec overrides it.

3.8 **RESONARC does not exist** (CATALOG-PLAN correction 3). The four sounds (crease, marker set, settle, reveal knock) are
CORE `audio` voices, each setting its own gain, one play per event, the ear gate measuring peak.

3.9 **Specimens in v1** (CATALOG-PLAN D8 over the handoff's "ask"): 24 folded paper specimens, one per run through
`collectOnce`, cosmetic, drawn from `sprites.js`, never a count shown. Stephen may move them to v1.1.

3.10 **Full portrait support, no landscape lock** (the handoff's "ask"; the fleet's layout gates at 320, 375 and 412 portrait
and 1366x768 by keyboard). A strip on a portrait phone is 72 to 94 percent of about 300 px: at a 12 denominator a part is
at least 18 px, and the loupe carries the precision, which the layout gate measures.

3.11 **Adding a game to the link builder moves CORE's stamp, and every game's worker follows it.** YONDER's P3 did it once
(CORE c to d, SPAN g to h). With nine games that is eight more rounds of every shipped game following. The change, in
CREASE's P3 under CORE's plan: the builder's files (`config/index.html`, `config/config.js`, `config/schemas.js`) carry
their own `config/STAMP.js`, CORE's lint holds that stamp inside `config/` and CORE's own inside `core/` and `demo/`;
adding a game then moves only the builder's stamp. A law watched red; SPAN and YONDER unchanged by it.

3.12 **The design spec (`CREASE-design-spec.md`) was not delivered.** v1 is built from the handoff and this file.

3.13 **`FRACTION_BANK` lives in `bank.js`, not `content.js`.** `content.js` holds the words (`COPY`) the lint reads; the bank
is data BRIM imports, and keeping it apart means BRIM never imports CREASE's words. BRIM imports
`../crease/bank.js?v=<BRIM's stamp>`; when the bank changes, BRIM's plan says its stamp follows.

---

## 4. ARCHITECTURE LAW

```
satellites/crease/
├── index.html          the shell; ../math/core/core.css and ./main.js, both ?v=<CREASE's stamp>
├── main.js             the page: modes, input, the reveal, the run and the specimens
├── engine.js           PURE: generateTask, scoreAttempt, TOLERANCE, the whole's mix, chains, halfway judging
├── bank.js             PURE DATA: FRACTION_BANK, its tags and grades (exported for BRIM)
├── render.js           the strip, its pins, its creases, the fold, the hatching (DOM, nothing about rules)
├── content.js          the words (COPY) and the palette
├── config.js           CREASE's link schema
├── sprites.js  draw.js the pins, the clip marker, the specimens (sixteen colours, literal rows)
├── sw.js  manifest.webmanifest  icon-192.png  icon-512.png  icon-maskable-512.png
├── test/   engine.mjs bank.mjs (node); freehand.mjs crease.mjs halfway.mjs audio.mjs config.mjs layout.mjs offline.mjs pace.mjs art.mjs specimens.mjs (browser)
├── tools/  check.js lint.mjs shots.mjs icons.mjs
└── docs/   DECISIONS.md shots/
```

**The engine.** `Task = { mode, numerator, denominator, whole, tier, trap, strip: { widthPct, offsetPct } }` (trap from 3.2)
and `Result = { correct, near, pae, truePosition }` as the handoff. `generateTask(r, { mode, grade, history, tier })` draws
from `FRACTION_BANK` at or under the grade and from the generator's own fractions, never a fraction repeated within four
rounds, a whole from the mix that holds the value, the strip from `lineGeometry`. `scoreAttempt(task, placement)`.
`TOLERANCE = [0.10, 0.07, 0.05, 0.035, 0.025]`. Pure: no `document`, `window`, `Date`, `performance`, `Math.random`.

**C1 to C8, the law each becomes.** C1 CORE's `assertLineRandomization` over 100 rounds plus the play gate's own geometry
seam, at the randomization's extremes; C2 a live law (FREEHAND's strip holds zero tick elements, before and during a drag,
counted in the DOM and in the pixels of the strip) and a static one (render.js's tick drawing is reachable only from the
CREASE mode and the reveal); C3 a law on 20 seeds (the whole's mix holds 1, 2, 3 and 5, and a back mix to 1 at least once
every five rounds); C4 the third item of a chain fires the stacked reveal with all three markers on one point; C5 no label
or value on the screen before the commit; C6 every crease the child makes is at k/n of the strip, exactly, by drag and by
keys; C7 grade 3 never emits a denominator outside {2, 3, 4, 6, 8} over 10,000 tasks on 20 seeds; C8 no crease carries a
label until the reveal.

**The seam.** Browser gates play rounds through the real page and assert each round's scored PAE equals `scoreAttempt` in
Node for the same seed and placements, and the tier the page keeps equals `adaptTier` on the same history.

---

## 5. THE PHASES, WITH GATES (the handoff's section 5 test gates mapped one to one)

Every gate is watched to fail once by a planted fault before it counts, and both lines go in section 13.

### P0. The bank, the engine, the laws (about 3 hours)
1. `test/bank.mjs` and `test/engine.mjs` red with no modules, then on 20 seeds:
   - every bank item's grade is the lowest grade whose denominators admit it; each of the six tags has a grade 3 item;
     the six tag names are exactly the handoff's (3.1, 3.2)
   - C7 over 10,000 tasks; the generator never repeats a fraction within four rounds, chains allowed (3.5, gate 1)
   - the whole is never under the value outside LONG (3.3, gate 2); C3's mix and back mix
   - `scoreAttempt` exact at the randomization's extremes, read through `toNormalized` (3.4, gate 3)
   - C4: a chain's third item is flagged for the stacked reveal (gate 5, the engine half)
   - `adaptTier` climbs and falls the five tolerances as configured
2. `tools/lint.mjs` from YONDER's: the stamp, the engine and bank pure, the words, dashes, bangs, the studio's name, dupkeys,
   `getUserMedia`, the sprite table (when it exists), and C8's static law (no fraction label is written by render.js outside
   the reveal).

### P1. FREEHAND and the reveal (about 3 hours)
- The strip at C1's geometry, pinned at 0 and the whole; CORE's number line with `ends`; the marker dragged with the loupe.
- **The reveal built with the mode** (handoff step 6): the child's marker stays; the truth fades in beside it; the gap
  hatches; the strip creases itself to the right denominator, and only now do creases carry their fractions (C8); the same
  reveal near or far, one colour.
- `test/freehand.mjs`: rounds by real drags and keys, the seam, C1 over 100 rounds, C2 live, C5, the reveal contract's six
  rules, the tier ladder on the page.

### P2. CREASE mode, HALFWAY, the chains, audio (about 3 hours)
- CORE's `snap` (3.6) under CORE's plan first.
- Mode 1 CREASE: fold up and down (56 px controls and arrow keys) adds or removes equal creases, the fold animation, the
  marker snapping (C6), no labels (C8). `test/crease.mjs`.
- Mode 3 HALFWAY (3.7). `test/halfway.mjs`: the invisible six seconds end in the reveal with no mark; "exactly half" after
  five in a row.
- C4's stacked reveal on the third item of a chain, in both placement modes.
- The four voices and `test/audio.mjs` (YONDER's shape, a guarded voice).

### P3. Specimens, links, layout, pace, offline, art (about 3 hours)
- Specimens (3.9) and `test/specimens.mjs`; the builder's own stamp (3.11) under CORE's plan, then CREASE's builder entry;
  `test/config.mjs`; `test/layout.mjs` at four sizes in every state reached by play, keyboard complete at 1366x768
  (gate 8); `test/pace.mjs` under 4x throttle (gate 9); `sw.js`, the manifest, icons; `sprites.js` and `draw.js`, the sheet
  opened, `test/art.mjs`; `tools/shots.mjs`, every shot opened with three faults named.

**CREASE v1 is done** when `tools/check.js` prints ALL GATES PASSED under the lock, every gate has a red line in section
13, every shot is opened with its faults named, it is deployed and the served files probed, and the listing line is in
section 8 for Fable.

---

## 6. THE SCREENS (portrait by thumb at three widths, landscape by keyboard at 1366x768)

- **First run:** a wordless loop: a paper strip folds in half and in half again, a clip slides to a crease, the strip
  unfolds flat and the creases fade, the clip stays. Then three doors, a picture each: a folded strip (CREASE), a plain
  strip with a clip (FREEHAND), a strip with its middle fold (HALFWAY).
- **FREEHAND:** the fraction large at the top (numerals, tabular); the strip across the middle, a pin at each end with its
  whole number; the clip in reach of a thumb; the gear top right.
- **CREASE:** the same strip; fold up and fold down beside it; the creases appear as the paper folds; the clip snaps.
- **HALFWAY:** the fraction; the strip with its middle fold; the clip sent left or right, "exactly half" after a streak.
- **The reveal:** the clip stays; the truth's clip fades in beside it; the gap hatched; the strip creases itself.
- **The specimens:** the folded papers earned so far, on a shelf.

---

## 7. ART

Code drawn pixel sprites through CORE's `sprite.draw` and a `draw.js` like YONDER's: the two pins, the paper clip marker
and the truth's clip (one colour on every path), the fold controls' pictures, the three doors' pictures, and 24 specimens
(folded paper shapes, cosmetic). The strip itself, its creases and the hatching stay drawn in CSS or SVG, flat and exact,
because a crease's position is the lesson and must land on k/n to the pixel. `tools/sheet.mjs` renders the table and the
sheet is opened with three faults named. Painted sheets are Stephen's, later.

---

## 8. LISTING (the line for Fable's portal row)

"A paper strip you fold into equal parts to find where a fraction lives, and then unfold, a free fraction game with no
login." (One sentence, no dash. `cat:"math"`, In Development.)

---

## 9. PITFALLS

- Faint ticks in FREEHAND "to help", ticks on hover, a hint button that shows them (C2).
- A fixed strip width because randomizing looks jittery; animate the change instead (C1).
- A label on a crease during play (C8), a value shown before the commit (C5).
- Unequal creases "for realism" (C6).
- Serving only 0 to 1 (C3).
- A grade 3 run meeting 2/9 because the bank's label said so (3.1).
- From YONDER's ledger: speech or a sprite lookup throwing inside a reveal's frame and ending it; a plant that plants
  nothing; a gate asserting G2 after its own reload; a colour law keyed by a class that changes with state.

---

## 10. DECISION RIGHTS AND OPEN QUESTIONS (the handoff's "Ask Stephen, don't decide", with the default meanwhile)

| Question | Default the build takes |
|---|---|
| Final name (CREASE, SNIP, TAUT, RUNG, PLUMB) | Crease, the working title (CATALOG-PLAN call 4) |
| Specimen collectibles in v1 or v1.1 | v1, cosmetic (3.9) |
| Landscape lock on phones or full portrait support | full portrait support (3.10) |
| HALFWAY's rules beyond the handoff's line | section 3.7, until the design spec arrives |
| The bank's items outside CCSS grades 3 and 4 (2/9, 4/9, 5/9, 6/9, 6/11, 7/15) | kept, tagged `extended`, off unless a link asks for it (3.1) |

---

## 11. STEPHEN ONLY

- The questions above and CREASE's display name.
- A child of eight to ten in front of FREEHAND and CREASE (the tolerance ladder is the handoff's, not measured on a child).
- 60 fps on a real school Chromebook.

---

## 12. HONEST SIZING

About 12 hours of building (P0 3, P1 3, P2 3, P3 3) plus the two CORE changes, the catalog plan's one day stretched by
3.6 and 3.11. Where a session stops well: after P1, when FREEHAND and its reveal work, because FREEHAND is the
intervention; CREASE mode teaches the denominator and comes next.

---

## 13. EVIDENCE LEDGER (fill in place, with commands and their real output, most recent last)

### P0, the bank, the engine and their laws (2026-09-15)

Section 3.1's arithmetic checked by a script before any code: outside grade 3, `2/5 2/9 3/10 4/9 5/9 6/11 7/15 6/9 8/12
3/5 7/12`; outside grade 4 too, `2/9 4/9 5/9 6/11 7/15 6/9`; with the additions every tag has grade 3 items; 7/4 and 9/8
need a whole of 2, 11/3 of 5. ⛔ The plan first said "four of the six near-miss-pairs members" were outside grade 3; the
script said two of four (3/5, 7/12), and the plan was corrected.

`test/bank.mjs` and `test/engine.mjs` written first; with no modules both went red on the one line that matters:
```
  FAIL  bank.js loads as an ES module (Cannot find module '.../satellites/crease/bank.js' ...)
  FAIL  engine.js loads as an ES module (Cannot find module '.../satellites/crease/engine.js' ...)
```
Then `bank.js` (32 items) and `engine.js`. Both green on their first run:
```
  ok    every item's grade is the lowest grade whose denominators admit all its fractions (32 items)
  ok    every one of the handoff's seed items is in the bank under its tag
  ok    C7: grade 3 never serves a denominator outside {2, 3, 4, 6, 8} over 10,000 tasks a seed, grade 4 never outside its list, extended only when asked
  ok    no fraction repeats within four rounds, and equivalence chains are still served three in a row (319 chains)
  ok    the whole always holds the fraction, the wholes include 1, 2, 3 and 5, and every five rounds come back to 1 (C3)
  ok    scoreAttempt is exact at the randomization's extremes and between, read back through the pixels (largest error 0.0e+0)
  ok    C4: the third item of an equivalence chain, and only it, is flagged for the stacked reveal
  ok    the ladder is 10, 7, 5, 3.5 and 2.5 percent, correct within the band and near within twice it, and adaptTier climbs and falls it ({"climbs":2,"falls":0})
```
`tools/check.js`: lint, bank, engine, ALL GATES PASSED. Committed `8fdcb6eb`. **Watched red** (session scratch
`crease-p0-plants.cjs`, a folder copy per plant):
```
b1 a grade 4 denominator called grade 3 FAIL every item's grade is the lowest grade ...: 3/5 4/6 says 3
b2 a tag renamed                        FAIL the tag names are exactly the handoff's six ... (unit-fraction-inversion, ...)
b3 a seed item dropped                  FAIL every one of the handoff's seed items is in the bank under its tag: missing benchmark-half 7/15
b4 a tag with no grade 3 item           FAIL every tag has a grade 3 item: none for benchmark-half
b5 an item that is not near a half      FAIL every item means what its tag says ...: benchmark-half 1/8
e1 grade 3 served tenths                FAIL C7: ... seed 3000 grade 3 served 3/10
e2 repeats let through                  FAIL no fraction repeats within four rounds ...: seed 3000 round 15 repeats 1/6 within four
e3 a whole that cannot hold it          FAIL the whole always holds the fraction ...: seed 3000 11/3 on a whole of 2
e4 no back mix to 1                     FAIL ... seed 3000 five rounds from 20 without a whole of 1
e5 error not over the whole             FAIL scoreAttempt is exact ... (largest error 3.9e+0)
e6 the stack on the second              FAIL C4: ... seed 3000 round 3 2/4 stack true third false
e7 a looser first band                  FAIL the ladder is 10, 7, 5, 3.5 and 2.5 percent ...: tier 0 [true,true,true,true]
e8 an unseeded strip                    FAIL every strip is lineGeometry's, a seed replays its run ...: seed 3000 does not replay
l1 Date in the bank                     FAIL bank.js touches no screen, clock or unseeded die: it names Date
l2 an unstamped import                  FAIL every relative import and local asset carries ?v=20260915a: engine.js loads ./bank.js
l3 a key twice (named, two lines)       FAIL no object literal declares the same key twice: content.js COPY.next on lines 7 and 8
```
⛔ l3 planted nothing twice before it planted something: first both keys on one line, then two NUMERIC keys (`3:`) on two
lines. A probe of the fleet's `tools/dupkeys.mjs` then showed what it sees: a duplicate named key across two lines, yes;
the same across one line, no (its header says so); **two numeric keys or two quoted keys across two lines, no**. That last
is a gap in the fleet tool, outside this fence: a `GRADE_DENOMINATORS` or a quoted `COPY` key written twice would pass
every lint that uses it. Reported for Fable in HANDOFF-OPUS-SEP15 section 10; l3 now plants a named key.

---

## 14. THE OVERNIGHT PROTOCOL

HANDOFF-OPUS-SEP15 prompt: never wait on a human; an ambiguity is the smallest reasonable choice logged in
`satellites/crease/docs/DECISIONS.md`; a gate red after three honest attempts goes into SESSION STATE as BLOCKED with its
last thirty lines; never weaken, skip or delete a gate; commit and push the moment something is green.

---

## 15. THE MORNING REPORT (most recent on top)

(none yet)
