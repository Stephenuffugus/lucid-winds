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

- 2026-09-16, Opus: **CREASE v1 gated.** The final `tools/check.js` on a frozen copy of the committed tree printed **ALL GATES
  PASSED** (lint, bank, engine, freehand, crease, halfway, stack, audio, config, specimens, art, pace, layout, offline). Every
  plant is red or rewritten and red (h6 on the engine law, sp3 on its fix; sp5 reruns on the specimens loop that now stops
  when a shelf opens early). The sheet and doors shots opened again with their faults named. Deployed to main the same hour;
  the probe lines are in section 13. **Next action:** sp5's rerun into section 13; the listing line to HANDOFF-OPUS-SEP15
  section 10 for Fable.

- 2026-09-15 late night, Opus: **P2 green** (CREASE mode, HALFWAY, the stacked reveal, the voices; their plants red) and
  **P3 built and all but gated**: the second full check passed every gate but pace and offline, both fixed and rerun green
  (PACE OK, OFFLINE OK: offline caught a real fault, `pure.js` precached at one of its two addresses). CREASE's stamp is
  `20260916a`. **Not done yet**, running in the lock queue: the P3 plants (`crease-p3-plants.cjs`, 23; sp1 and sp2 red so
  far), HALFWAY's rerun with its two timeout tier law and plants h2 to h8, the sheet redrawn with HALFWAY's chevron door and
  the doors shots retaken. **Next action:** read those logs into section 13 (any plant that plants nothing is rewritten and
  rerun, never counted); open the redrawn sheet and doors shots; one full `tools/check.js` on the committed tree printing
  ALL GATES PASSED; then deploy (`git log HEAD..origin/main` empty, `git push origin add-sproing-jumper:main`) and probe
  the served `index.html`, `main.js?v=20260916a`, `sw.js`, `core.js?v=20260916a`, `pure.js?v=20260916a` one request each,
  a few seconds apart; then the listing line (section 8) goes in HANDOFF-OPUS-SEP15 section 10 for Fable.

- 2026-09-15 night, Opus: **P0 done** (sixteen plants red), **P1 green** (FREEHAND OK; lint law 9 red twice), the reveal's
  label and whole-unit creases fixed from the shots and their laws written; **CORE's `snap` written** (3.6) with law 11,
  lint and pure green, `test/crease.mjs` written. Running in one background chain under the lock: FREEHAND plants f1 to
  f9, the FREEHAND rerun with the reveal shots, plants f10 and f11, CORE's demo gate with its snap plant.
  **Next action:** read those four logs into section 13; CORE's full check, CORE's stamp to `20260915e` with SPAN, YONDER
  and CREASE following (their workers name CORE's modules by CORE's stamp) and their checks green; then CREASE mode on
  the page: `config.js` modes, fold more and fold less in `index.html`, `render.js` `foldTo`, `main.js` handing
  `snap: whole * parts` to the number line and `setSnap` on each fold, `strip.dataset.parts`; run `test/crease.mjs`.

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

### P1, FREEHAND and the reveal (2026-09-15)

`index.html`, `main.js`, `render.js`, `content.js`, `config.js`, `test/freehand.mjs` (laws 1 to 9 in its header),
`tools/shots.mjs`. The first run: 69 laws green and one red,
```
  FAIL  375x667 and no colour in the scene differs between them, or from the scene before any reveal
```
⛔ The gate's fault: it joined the whole scene into one string, and the reveal ADDS the truth's clip and the gap, so any
shot after a reveal held lines the shot before it could not, and the law could not say whether a colour had changed. It now
keys each element by id or first class, holds every element that stood before the reveal to its own colours, and the near
round's scene to the far round's entirely. The rerun: **FREEHAND OK**, among it
```
  ok    375x667 round 2: the result is engine.js's scoreAttempt at tier 0 ({"pae":0.019999999999999945,"correct":true})
  ok    375x667 round 3: the strip creases itself into 15 equal parts, every crease at its own place (14 creases, 0 off)
```
**Lint law 9** (C2, C8: a crease or its label is made only by render.js's reveal and fold). ⛔ Its first version flagged
any string `'crease'` and went red on the live tree, on `main.js`'s own game id (`settings.mount({ gameId: 'crease' })`):
a name is not a class. It now counts only class uses. Live: green. **Watched red** (folder copies):
```
l9 main.js puts a crease on the strip   FAIL a crease or its label is made only by render.js's reveal and fold ...: main.js uses a crease class
l9 placePins makes a crease             FAIL ...: render.js placePins makes a crease
```
Committed green. **Watched red** (session scratch `crease-p1-plants.cjs`, a snapshot of that green tree):
```
f1 a tick left on the strip       FAIL before the clip goes down the strip holds no crease, tick, label or truth (C2, C5): tick
f2 the truth before the commit    FAIL before the clip goes down ... (C2, C5): gap, truth-clip; FAIL round 1: while the clip is dragged the strip shows no crease, label or truth (3)
f3 a crease off its place         FAIL round 1: the strip creases itself into 24 equal parts, every crease at its own place (23 creases, 1 off)
f4 every crease labelled          FAIL round 1: the true place's crease, and only it, carries 3/8 ([{"k":1,"label":"3/8"},{"k":3,"label":"3/8"}], crease 3)
f5 a far round reveals slower     FAIL 375x667 a near round and a far round fade the truth in on the same curve (largest difference 0.370 over 78 frames)
f6 an unseeded strip              FAIL round 1: the fraction and the whole are Node's task (3/8 of 3, Node 3/8 of 3); FAIL the placement scored is where the thumb let go, read in Node (1.725, Node 1.486)
f7 a tier from nowhere            FAIL 1366x768 a hundred rounds by keys, every task Node's replay with the tier from the page's own results (rounds 4, 5, 6, 7, 8)
f8 a clip too small               FAIL the clip is a 56 px target a thumb lands on (at 320, 375 and 412)
f9 a truth off its place          FAIL round 1: the clip stays where it was put and the truth's clip stands at the true place (109.5/109.5, 33.6/27.6)
```
f6's first line names the same fraction twice because the difference is the strip, which that line does not print; the
law is right (the strip is compared) and its message is thin, to be widened after the rerun that reads this file.

**The reveal fixed from the P1 shots, opened** (`docs/shots/p1-*`, fifteen at four sizes): ⛔ at 320 the true crease's
fraction sat in the end numerals' row and read `03/8`; ⛔ a strip longer than one creased into equal eighths gave no sign
of where 1 and 2 are. The label now sits a row below, and every whole's end is a taller, darker crease with no number;
two laws for them in `test/freehand.mjs`, their plants f10 and f11 queued. Accepted for v1: the clip standing on the pin
at 0 before play; the first screen's loop a bare rectangle mid fold (the sprites are P3's).

The rerun on the fixed reveal: **FREEHAND OK**, 80 phone laws among them
```
  ok    375x667 round 3: every whole's end is a taller crease and no other crease is (4 of them, 4 wanted)
  ok    375x667 round 3: the fraction on the true crease sits clear of the strip's end numerals
```
The reveal shots opened again (`p1-reveal-320x568.png`, `p1-reveal-375x667.png`): the fraction a row clear of `0` and
`3`; taller dark creases at 1 and 2. Faults named and accepted for v1: the whole creases carry no number, so a child
counts them to know which is 2; the child's clip can stand right on a whole crease and hide it; the board below the label
is a third empty.

**Watched red** (a snapshot of the fixed tree):
```
f10 no whole marked on a long strip     FAIL 320x568 round 1: every whole's end is a taller crease and no other crease is (2 of them, 2 wanted); and at 375 and 412
f11 the label in the ends' row again    FAIL 320x568 round 1: the fraction on the true crease sits clear of the strip's end numerals
```
f11 goes red at 320 only, the one width where the label in the ends' row meets `0`: the law measures the collision, not
the row.

### P2, CREASE mode, HALFWAY, the stacked reveal, the voices (2026-09-15)

CORE's `snap` (3.6) and CORE's stamp `e` are in CORE's ledger (`plans/math/HANDOFF-CORE.md`), with SPAN and YONDER
following: CORE, SPAN and YONDER all ALL GATES PASSED at their new stamps.

**The first HALFWAY run went red, and the deal was at fault:**
```
  FAIL  375x667 five right in a row bring exactly half onto the screen as a 56 px target, and the wrong sixth does not take it away (arrived after round 0)
  ok    375x667 each choice is recorded with judgeHalf as the truth ([["less","less",true],["less","less",true],["more","more",true],["more","more",true],["less","half",false],["more","half",false],["less","less",true]])
```
Seed 4242 dealt 1/2 and 3/6 before the streak, when a child had no button that answers them. The engine now deals no
exact half until the page says half is open (`state.halfOpen`); engine law 10 runs both ways on 20 seeds, green, and red
on the old deal planted: `seed 3000 serves 339 exact halves before exactly half is open`. (docs/DECISIONS.md)

**The second HALFWAY run went red, and the gate was at fault:** `(arrived after round 6)`. Half joins the round after the
fifth right, as the plan says, and the gate read `#half` after each reveal, before next deals that round. It now reads
each round's start: absent on rounds 1 to 5, present on 6 and still on 7 after the wrong sixth.

**Gates on a frozen copy of the tree at `e2462ca5`** (the live tree moved on to P3 meanwhile):
```
=== crease crease   CREASE OK
=== crease stack    STACK OK
=== crease audio    AUDIO OK   (twenty loud seconds measured, peak under 0.9, under 30 percent above 3 kHz)
=== crease config   CONFIG OK
=== core config     CONFIG OK  (the builder with CREASE's entry, at its own stamp f)
```
**Watched red** (session scratch `crease-p2b-plants.cjs`, the frozen copy):
```
s1 no stack ever                     FAIL freehand 320x568 its reveal stacks the chain's three fractions in order, fully shown ([], opacity ); and crease mode, and 412
s2 the stack never fades in          FAIL ... (["1/2","2/4","3/6"], opacity 0)
s3 the stack left on the next round  FAIL ... the round after it has nothing stacked
s4 the stack off its point           FAIL ... over one point: the column and every label stand on the truth's clip (14.00 px)
s5 the stack in the wrong order      FAIL ... (["3/6","2/4","1/2"], opacity 1)
s6 the stack above the board         FAIL ... every label inside the board and on the screen, none over another (2 outside, 0 over)
s7 a stack on every round            STACK OK   <- planted nothing seen
a1 a settle per crease               FAIL with Sound on, a right round plays one set, one knock and one settle and nothing more (["set","knock","settle","settle",...
a2 a knock only when right           FAIL ... a wrong round ... (["set","settle"])
a3 sound unguarded                   FAIL a device whose audio throws: the clip goes down, the reveal completes and next comes ({"done":false,"next":false,"results":1})
a4 a set on a round left alone       FAIL HALFWAY: a round left alone plays knock and settle and no set (["set","knock","settle"], timed out true)
a5 the crease voice around the master FAIL every voice passes through the master: halving it halves the rms and the peak (0.802, 0.376 to 0.376)
a6 a fold at the end still sounds    FAIL three folds more and three less play one crease each ... (7 played)
a7 a crease sound per crease         FAIL ... eleven folds to twelve parts play eleven creases ... (66 played, 12 parts)
a8 a first load not muted            FAIL a first load is muted ... (["set","knock","settle"])
a9 the crease hisses                 FAIL it is not an alarm: 63.6 percent of its energy above 3 kHz (under 30)
a10 the knock clips                  FAIL nothing clips and it is not silence: peak 1.993 (between 0.05 and 0.90)
h8 the page never tells the engine half is open  FAIL 375x667 every task is Node's replay in HALFWAY mode on a whole of 1 (ok,ok,ok,ok,ok,OFF,ok)
h6 the truth read off a rounded value   HALFWAY OK   <- planted nothing seen by the browser gate
h6 (same edit, run against test/engine.mjs)  FAIL HALFWAY: judgeHalf reads a half exactly ... 1 ENGINE FAILURE(S)
```
⛔ **h6 passes the HALFWAY browser gate and is red on the engine law.** judgeHalf with a 0.07 tolerance and the engine
is a fault in the engine, and the page records whatever judgeHalf says, so the seam (page equals Node's replay) is
green by construction. The law that owns it is `test/engine.mjs` ("judgeHalf reads a half exactly"), and that law went
red on the same edit. h6 is counted against the engine law, not HALFWAY.
⛔ **s7 planted nothing, and the gate was at fault**: its "round after" law read the next round before its clip went down,
when no reveal exists, so a stack on every later reveal passed. The law now plays that round and reads its reveal; s7
reruns against it. a3 is YONDER's scar caught before it cost anything here: an unguarded voice ends the reveal and next
never comes.

**The builder's own stamp (3.11)** is done under CORE's plan, its law red on four plants (CORE's ledger). CREASE's link
builder entry is in `schemas.js` under the builder's stamp `f`; CREASE's `test/config.mjs` green above.

### P3, specimens, doors, sprites, offline (2026-09-15, in progress)

Wired and committed before any browser gate ran on it (`b9b3c2af`): the three doors, the run's end and the shelf, the
sprites, the worker and manifest, and CREASE's stamp moved to `20260916a` (docs/DECISIONS.md: `core.js?v=20260915a` was
served before snap). Gates written: `specimens`, `art`, `pace`, `layout`, `offline`. **The icons, opened**
(`icon-512.png`, `icon-maskable-512.png`, `icon-192.png`): ⛔ the clip, a filled bar with a slot, read as a marker pen or a
memory stick, and is redrawn as two wire loops; accepted for v1, the picture sits in the lower half with the top third
empty board, and the strip carries no end numbers, so at 192 it could be a row of window panes.

**The sprite sheet, opened** (`docs/shots/p3-sprites-sheet.png`): ⛔ the clip and the truth's clip read as batteries (a
filled bar with a slot), ⛔ HALFWAY's door shared FREEHAND's silhouette (a stick standing on a strip), ⛔ the dart and the
arrow specimens pointed the same way. The clips are now two wire loops, HALFWAY's door has arrows out from its middle fold,
and the arrow is a house. Committed `924fb730`; the sheet is to be drawn and opened again.

**⛔ The first full P3 check hung for most of an hour, and the gate was at fault.** FREEHAND sat with its browser idle (9 s
of CPU in 13 minutes). Killed by its PIDs; a boot probe of the page (both a named mode and the three doors) loaded in about
200 ms and came ready with no console line; FREEHAND alone under a 600 s timeout passed all 80 of its phone laws and its
first two keyboard laws, then timed out in its hundred rounds by keys. Those hundred rounds were written before a run
ended: after round ten the shelf covers the next round with focus on go, the loop's arrows and Enter went to go, and every
later reveal waited 30 s for a round nobody was playing. The loop now does what a child at a keyboard does (Enter on go,
focus back on the clip) and the law counts ten shelves in a hundred rounds. The icons and plants queued behind that check
were stopped before it was killed, so none of them ran on the hung tree.

**The second full P3 check**, with FREEHAND's loop fixed and half an hour a gate: lint, bank, engine, freehand (104 s),
crease, halfway, stack, audio, config, specimens (201 s), art, layout (156 s) pass; two red:
```
--- pace
  FAIL  when the device asks for less motion, the reveal is shorter and still in order: ... is full before a crease shows (frame 13 then 13), and the creases end full
--- offline
  FAIL  straight after the first visit, the worker's cache holds every address the page asked for, and the page (19 cached; not cached: /math/core/pure.js?v=20260916a)
  FAIL  with the server down, a reload plays a FREEHAND round from the cache (failed: Waiting failed: 15000ms exceeded; the page shows {"url":"/crease/index.html","controlled":true,"ready":false})
```
⛔ **offline caught a real fault**: `engine.js` imports `pure.js` at CREASE's stamp and `core.js` imports it at CORE's, two
addresses; the worker precached only CORE's, so with no network the engine never loaded and the page never came ready. Both
are precached now. ⛔ **pace's order law was the gate's fault**: it wanted a frame between the truth reaching full (60
percent) and the first crease, which one frame just past 60 percent cannot give; the law now holds every frame (the truth
full wherever a crease shows). Both rerun, then the P3 plants, queued on a frozen copy.

**Plants on the fixed gates** (a frozen copy): `s7 a stack on every round` now FAIL on the stack gate's widened law
(`["2/4","3/6","2/6"]` stacked on the round after); `h1 exactly half from the start` FAIL at every size. ⛔ `h2 a timeout
counted in the tier` planted nothing, and the gate's premise was at fault: its law compared the tier before and after one
timeout at tier 0, where a wrong cannot lower anything. ⛔ `h3` never ran: its match predated the clock's `else if`, and
the runner threw on the missed match and ran nothing after it; the runner now reports a missed match and goes on.

**P3 shots taken and opened** (`docs/shots/p3-*`, 35 at four sizes; `p3-doors-375x667`, `p3-stack-320x568`,
`p3-halfway-375x667`, `p3-shelf-375x667`, `p3-crease-320x568`, the sheet and `icon-512.png` opened). Faults named:
⛔ HALFWAY's door read as a barbell (its arrows stood on bars), redrawn as two open chevrons. Accepted for v1: on the stacked
reveal the truth's crease label repeats the stack's last fraction and the stack's foot sits just above the child's clip;
the shelf after one run is one small boat in a large empty board with no hint of the places to come (cosmetic, and the
shelf shows no count by design); the unfold control is a plain rectangle that does not say unfold; the clip at 0 stands on
the pin. The icon's clip and the sheet's clips now read as paper clips.

**The sheet and doors drawn again and opened** (`p3-sprites-sheet.png`, `p3-doors-320x568.png`, `p3-doors-1366x768.png`):
the chevrons read as two open arrows now, not a barbell, and the clips as paper clips. Faults named and accepted for v1:
⛔ on the sheet's dark row the HALFWAY chevrons and the pin all but vanish (CREASE has no dark ground, so no player sees
it; a high contrast theme would need its own ink); ⛔ at 320 the bench and the doors fill the middle third and leave two
empty bands; ⛔ at 1366 the bench is small and centred in a mostly empty landscape (the layout does not grow past a phone's
bench at a Chromebook's width, cosmetic, the targets are measured and pass).

**The pace and offline reruns** (a frozen copy of the fixed tree): **PACE OK, OFFLINE OK**.

**The P3 plants** (session scratch `crease-p3-plants.cjs`, 23, on that copy): 20 red, among them
```
sp1 a specimen every round           FAIL the shelf is shut after nine rounds of ten and opens on the next after the tenth, holding one specimen ({"early":true,"shown":true,"cells":10})
sp2 the shelf counts                 FAIL the shelf shows no digit and no number in any label ("1   Play on")
sp4 one paper for all                FAIL the next run's end holds two, the second another shape on another paper ...
ar1 a pin for a clip                 FAIL 320x568 the clip in the stone is the clip sprite, drawn, its foot on the strip ...
ar2 the truth off its place          FAIL 320x568 the truth's clip is the truthClip sprite, drawn, centred on the true place (8.50 px off) ...
ar3 two doors alike                  FAIL 375x667 with no mode named, three doors, each its own picture drawn ...: #start-crease {"sprite":"doorFreehand" ...
ar4 the clip off the strip           FAIL 320x568 ... its foot on the strip (foot 267.0, strip 281.0) ...
pa2 the truth off its curve          FAIL and at every frame the truth's clip is at the opacity the steady curve says (largest miss 0.329 over 54 frames)
pa3 less motion not shorter          FAIL when the device asks for less motion, the reveal is shorter and still in order ...
pa4 creases before the truth         FAIL when the device asks for less motion, the reveal is shorter and still in order ...
la1 next too short                   FAIL 320x568 FREEHAND after the reveal: the young controls are 56 px targets and the gear 48 px: #next 64x40 (needs 56)
la2 the stack in small type          FAIL 320x568 a chain's stacked reveal: no text is under 0.7 rem: stack-label 9.6px ...
la3 the doors pushed off             FAIL 320x568 the three doors: everything a thumb needs is on the screen without scrolling: #start-crease (274,319 ...
la4 the shelf go under the fold      FAIL 320x568 the shelf after a run: ... #shelf-go (128,971 to 192,1035 in 320x568)
of1 every cache deleted              FAIL a worker installing again deletes older crease caches and leaves every other cache alone (["crease-shell-20260916a"])
of2 render.js not precached          FAIL straight after the first visit, the worker's cache holds every address the page asked for ...: not cached: /crease/render.js?v=20260916a
of3 a miss that never settles        FAIL and a request for something never cached settles instead of hanging (still pending after 6 s)
of4 the manifest misnamed            FAIL the manifest names the game, starts at ./, displays standalone, and its icons measure what it says
co1 the builder defaults another grade FAIL every key the builder offers, the page parses with the same type ...: grade defaults to 4 in the builder ...
co2 the page takes a count the builder does not FAIL ... count offers 10/20/30, the page takes 10/20/30/40
```
⛔ **Three planted nothing, and each is rerun on its fix:**
- `sp3 past twenty four`: the specimens law counted drawn cells, and the drawing stops at twenty four whatever the store
  holds. The shelf now reports what the store holds and the law reads it (BRIM's shelf and gate carry the same fix).
  Rerun on the fix: `node test/specimens.mjs` SPECIMENS OK, then `sp3 past twenty four  FAIL twenty six runs hold twenty
  four specimens ... (26 held, 24 drawn, 24 different)`. Counted.
- `sp5 a reload mid run earns` (the run's count carried across a reload): the law looked only after ten rounds, when an early
  specimen and the right one are the same third. It now holds the shelf shut after nine. **It also showed a real fault:** a
  keyboard could reach the round under the shelf and play it unseen; the round is `inert` while the shelf covers it (BRIM too).
- `pa1 a heavy frame`: four million square roots a frame still fit the throttled frame budget; the plant now does thirty
  million.

---

### Gated and deployed (2026-09-16)

`tools/check.js` on a frozen copy of the committed tree:
```
lint pass, bank pass, engine pass, freehand pass 104s, crease pass, halfway pass, stack pass, audio pass, config pass,
specimens pass 201s, art pass, pace pass, layout pass 156s, offline pass
ALL GATES PASSED
```
Deployed: `git log HEAD..origin/main` empty, `git push origin add-sproing-jumper:main` (`978b26fd..cc444597`). Probed about
90 s later, one request each, five seconds apart, each with a random `probe=` query:
```
satellites/crease/index.html               200 text/html               stamp x3   9465 bytes (9451 committed + the status line)
satellites/crease/main.js?v=20260916a      200 application/javascript  stamp x8  16014 bytes (15987 + 27)
satellites/crease/sw.js                    200 application/javascript  stamp x14  4749 bytes (4722 + 27)
satellites/math/core/core.js?v=20260916a   200 application/javascript            23179 bytes (23152 + 27)
satellites/math/core/pure.js?v=20260916a   200 application/javascript            10548 bytes (10521 + 27)
```
Every served body is the committed file to the byte.

**sp5, the last plant, counted** (2026-09-16). The specimens gate timed out twice under it: first its reload loop played a round
under an early shelf, then its tenth round did. Both are fixed: the loop stops when the shelf opens, and the tenth round is
played only while the shelf is shut. On a frozen copy of the fixed tree:
```
=== specimens unplanted
SPECIMENS OK
=== sp5
sp5 a reload mid run earns   FAIL  a reload in the middle of a run earns nothing: after it the shelf is shut through nine rounds and opens after the tenth with three ({"nine":true,"shown":true,"cells":3})
```
Every CREASE plant is now red or answered and red.

---

## 14. THE OVERNIGHT PROTOCOL

HANDOFF-OPUS-SEP15 prompt: never wait on a human; an ambiguity is the smallest reasonable choice logged in
`satellites/crease/docs/DECISIONS.md`; a gate red after three honest attempts goes into SESSION STATE as BLOCKED with its
last thirty lines; never weaken, skip or delete a gate; commit and push the moment something is green.

---

## 15. THE MORNING REPORT (most recent on top)

(none yet)
- SHOT p3-crease-375x667.png OPENED. Faults: (1) the ask is three eighths while the strip runs 0 to 3 and is cut into twelve cells with a bold mark every four, so there is no eighth anywhere on the ruler a child could point at — suspect the strip and the ask disagree, the same shape of fault as GAUGE asking for 0.5 on a line that runs 0.2 to 0.3, and it needs the engine checked not just the picture; (2) the grip at the left end is a small blue and grey object that reads as a thermometer or a screw and it floats above the strip instead of sitting on it; (3) the two tray buttons under the board carry no words at all, only a plain rectangle and a half filled one; (4) the board is a flat brown slab with the strip floating in its middle and the bottom third of the screen is empty.
- SHOT p3-stack-375x667.png OPENED. Faults: (1) three orange labels (1/2, 2/4, 3/6) stack straight up out of the grip and the top one sits over the board’s edge; (2) two grips, blue and orange, stand almost on top of each other at the same tick with nothing to say why there are two; (3) 3/6 is printed three times on one screen, in the ask, in the stack and again under the strip; (4) the cell between the two marks is filled with diagonal hatching that matches nothing else on the page.
- SHOT p3-halfway-375x667.png OPENED. Faults: (1) the strip is a plain cream bar with one mark in the middle and no cells at all, so a child asked for one half has nothing on the strip to count; (2) there is no grip anywhere in this state, so nothing shows what moves or what was moved; (3) the three tray buttons hold tiny blue and white squares with no words, and the middle one is a thin black bar that reads as damage rather than as a choice; (4) the ask floats far above the board with a wide gap and the board is a large empty brown slab.
- SHOT p3-shelf-375x667.png OPENED. The folded paper boat is almost certainly deliberate in a game about creasing, so it is not named as a fault. What is: (1) it sits in the top left corner of an empty brown board, the corner disease again; (2) at about 70 px it is the only object on a board eight times its size; (3) the board is a flat slab whose brown is close to the page cream in value, with no shelf edge or place marks to say more will come; (4) the bottom third is empty.
- SHOT p1-build-375x667.png OPENED, and it sharpens the earlier suspicion honestly: the ask is three eighths and the strip here carries NO divisions at all, just a plain cream bar from 0 to 3, so in this state there is nothing on the ruler to count in eighths or in anything else. In the P3 shot the same strip carried twelve cells. Either the divisions arrive later in the build (likely, since this is the build state) or the strip and the ask disagree; the engine still needs reading before this is called a fault. Faults that stand whatever the answer: (1) the grip sits on top of the 0 post, covering the end it is measured from; (2) nothing in this state can be pressed, so the screen offers a child no way in; (3) the board is a flat brown slab holding one thin bar; (4) the bottom half is empty.
- CORRECTION, and this closes the three eighths suspicion raised twice above: the code settles it. main.js sets `strip.dataset.parts = '1'` when a round is dealt and only calls `foldTo(strip, geom, task.whole * parts, parts)` once creasing begins, so the strip starts as ONE undivided length on purpose and creases itself into whole times denominator equal parts afterwards. The p1 build shot showing a bare bar is therefore right, and the p3 crease shot showing cells is the same strip after folding. ⛔ Third time tonight that a picture read as a fault and the code said otherwise. What is NOT yet proved and should be a law rather than my eye: that the creased strip draws exactly whole times denominator parts (the p3 shot appeared to show about twelve under a three eighths ask over a whole of three, which would be twenty four). That count belongs in a gate, on twenty seeds.
- SHOT p1-reveal-375x667.png OPENED. Faults: (1) the creased strip is drawn with so many thin cells that at 375 they read as a barcode — a child asked for three eighths cannot count them, which is the whole point of creasing; (2) two grips again, blue and orange, standing at different places with nothing to say which is the child’s and which is the answer, and the orange one sits inside the hatched stretch and half covers it; (3) the 3/8 caption sits under the 0 end of the strip, far from the mark it names; (4) the reveal looks like play with a caption added, so nothing says the round is over or whether the placement was right.
- SHOT p3-doors-375x667.png OPENED. Three doors, no words, so of the seven games only GAUGE and TINT name what a child is choosing. Faults: (1) nothing names the three ways to play; (2) the three glyphs are a strip with a grip, a strip with four cells, and a strip with marks at its ends, all drawn in the same thin black on cream at about 90 px wide, so they differ by details too small to see; (3) the board above holds a bare strip and one grip with no numbers at either end, so the picture standing for the game shows a blank rule; (4) the top third is empty above a board that floats in the middle.
- SHOT p3-crease-1366x768.png OPENED. Observation, NOT yet a fault (having been wrong four times tonight reading pictures): the strip runs 0 to 3 and shows twelve cells with bold marks at 1 and 2, while the ask is three eighths, which would want eight parts per whole and twenty four cells. main.js folds progressively (foldTo with a growing part count), so twelve is very likely a mid fold on the way to twenty four and not an error. This is exactly what the count law proposed earlier should settle on twenty seeds. Faults that stand: (1) on 1366 the whole game sits in the top left with the bottom two thirds empty; (2) the two tray buttons are about 60 px wide on a 1366 px screen and carry no words; (3) the grip sits on the 0 post, covering the end it measures from.
- SHOT p3-halfway-320x568.png OPENED. Same as at 375 and no better for the narrower screen: (1) the strip is a plain cream bar with a single mark in the middle and no cells at all, so a child asked for one half has nothing to count; (2) no grip appears in this state, so nothing shows what moves; (3) the three tray buttons hold small blue and white squares with no words, and the middle one is a thin black bar that reads as damage; (4) the board takes the middle of the screen with the ask floating far above it and the bottom quarter empty.
- SHOT p1-first-375x667.png OPENED. Faults: (1) the first screen a child sees is a brown slab holding one small empty cream bar, with no numbers, no grip and no words, so nothing says what the strip is or what to do with it; (2) the single tray button below shows a tiny strip with a grip, a picture of the thing that is missing from the board above it; (3) the board sits in the middle of the screen with the top third and the bottom half empty; (4) the bar is placed left of centre inside the board with a wide empty brown margin to its right.
- SHOT p3-stack-320x568.png OPENED. Faults: (1) the three orange labels (1/2, 2/4, 3/6) stack straight up from the grip and the top one sits ON the board’s edge, overlapping it, worse at 320 than at 375; (2) two grips, blue and orange, overlap each other at nearly the same tick with nothing saying which is which; (3) 3/6 is printed three times on one screen, in the ask, in the stack and under the strip; (4) the cell between the marks is diagonal hatching that matches nothing else in the game.
- SHOT p3-shelf-1366x768.png OPENED. Faults: (1) the folded paper boat sits in the top left corner of a 620 by 420 board with everything else empty, the corner disease at its most exposed; (2) the boat is about 95 px on a 1366 px screen, the only object on the page; (3) the board is a flat brown slab with no shelf edge, no depth and no place marks to say more will come; (4) roughly 370 px of empty page on each flank.
- SHOT p1-drag-375x667.png OPENED. Faults: (1) a two celled card with a blue line through it sits at the top of the board with nothing saying what it is or how it relates to the strip below; (2) the grip hangs in mid air between that card and the strip, touching neither, so nothing shows what is being dragged or to where; (3) the strip itself is a plain cream bar with ends 0 and 3 and no cells, so a three eighths ask has nothing to land on in this state; (4) the bottom half of the screen is empty and no words appear anywhere.
- SHOT p1-first-320x568.png OPENED. Faults: (1) the first screen a child meets at 320 is a brown slab holding one small empty cream bar, with no numbers, no grip, no ask and no words — nothing on the page says what this is or what to do; (2) the bar sits left of centre inside the board with a wide empty brown margin to its right, so even the one object is off axis; (3) the single tray button below shows a tiny strip with a grip on it, a picture of the thing missing from the board above; (4) the top third and the bottom half are empty.
- SHOT p3-crease-320x568.png OPENED. The creased strip reads better here than at 375: twelve cells between 0 and 3 with bold marks at the thirds, countable at this size. Faults: (1) the grip sits ON the 0 post, covering the end the measurement starts from; (2) the two tray buttons carry no words, only a plain rectangle and a half filled one; (3) the ask is three eighths while the strip is cut into twelve, which remains the OBSERVATION for the count law to settle on twenty seeds rather than a fault I will assert from a picture; (4) the board is a flat brown slab with the strip floating in its middle and the bottom third empty.
- SHOT p3-halfway-412x915.png OPENED. Faults: (1) the strip is a plain cream bar with one mark in the middle and no cells at all, so a child asked for one half has nothing to count at this size either; (2) no grip appears in this state, so nothing shows what moves; (3) the three tray buttons hold tiny blue and white squares with no words, and the middle one is a thin black bar that reads as damage; (4) the bottom 45 per cent of the screen is empty below the tray.
- SHOT p3-stack-412x915.png OPENED. Faults: (1) the three orange labels stack straight up out of the grip and the top one sits ON the board’s edge, overlapping it, at this width too; (2) two grips, blue and orange, stand almost on top of each other with nothing saying which is which; (3) 3/6 is printed three times on one screen, in the ask, in the stack and under the strip; (4) the cell between the marks is diagonal hatching that matches nothing else in the game, and the bottom half of the screen is empty.
- SHOT p3-doors-412x915.png OPENED. Faults: (1) three ways to play, no words, so only GAUGE and TINT name what a child is choosing; (2) the three glyphs are a strip with a grip, a strip with four cells and a strip with marks at its ends, all thin black on cream at about 110 px, differing by details too small to see; (3) the board above holds a bare strip and one grip with no numbers at either end, so the picture standing for the game shows a blank rule; (4) the top 65 per cent of the screen is empty above the board.
- SHOT p3-crease-412x915.png OPENED. The creased strip has the most room here of any width and the cells read cleanly: twelve between 0 and 3 with bold marks at 1 and 2. Faults: (1) the grip sits ON the 0 post, covering the end the measurement starts from, at every width tested; (2) the two tray buttons carry no words, a plain rectangle and a half filled one; (3) the ask is three eighths over a strip cut into twelve, which stays the OBSERVATION for the count law on twenty seeds rather than a claim from a picture; (4) the bottom 55 per cent of a 915 px screen is empty below the tray.
