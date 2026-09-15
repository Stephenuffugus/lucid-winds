# HANDOFF TINT, the build plan for the math catalog's ninth game

**Written:** 2026-09-16, by Opus (the builder), as step 1 of TINT (`plans/math/CATALOG-PLAN.md` section 8), from three inputs read
whole: `assets/math-catalog/09-TINT-handoff.md` (Stephen's delivery, read only), `plans/math/CATALOG-PLAN.md` (which binds this
file and wins over the handoff), and CORE as built (`satellites/math/core/`), with the eight games before it as the examples.
Where this file and the handoff differ, every difference is in section 3.
**Game folder:** `satellites/tint/` (free, checked 2026-09-16). **Live URL when listed:** `lucidwinds.com/satellites/tint/`.
**Working title:** Tint. The display name, whether Mode 4 becomes its own product, and any sharing with "ChromaForge" (in no repo
here) are Stephen's.

---

## SESSION STATE (the builder updates this at the end of every session; the morning reader starts here)

- 2026-09-16, Opus: plan written, before any code, while HUSH's, NOTCH's, GLIMPSE's and BRIM's gates run under the lock.
  **Next action:** P0 (section 5): `satellites/tint/test/colour.mjs` and `test/engine.mjs` red with no modules, then `colour.js`
  (`mixLinear` on ratios reduced to lowest whole terms, the lightness helper), `engine.js` (`generateRatioPair`, the trap set,
  `NONLINEAR_BANK`, the session deals with exact counts), `tools/lint.mjs` with T6's words, `tools/check.js`, commit.

---

## 0. RULES OF ENGAGEMENT

1. **The fence.** `satellites/tint/**`, this file, and `satellites/math/config/schemas.js` (TINT's entry only, under the builder's
   own stamp; ⛔ that stamp is owed a move before the next deploy, HANDOFF-OPUS-SEP15 section 10). Read only: everything else as in
   the catalog's other plans. **No portal row**: Fable's.
2. **Git.** Stage by path, never `-A` (`package.json` force added). Commit and push the moment something is green. Deploy after
   `git log HEAD..origin/main` is empty, then probe one served file at a time.
3. **The laws.** The fleet's, CORE's G1 to G13, TINT's T1 to T10 (section 4). No dash and no exclamation point in player copy;
   "Sky Wolf Studio", singular; 48 px targets; text 0.7 rem or larger; the engine pure; a count is a law proved on 20 seeds; a gate
   never sets the state it asserts.
4. **Browser gates run one at a time under the lock**, every timeout inside the lock, a gate queued while the tree changes runs on
   a frozen copy of a commit.
5. **Never wait on a human.** Section 10.
6. **Scars carried here** (the eight ledgers before this one): all of NOTCH's, and from NOTCH's P0: a raster that samples on
   exact edges lies about symmetry, so a pixel measure is offset off every edge; a law that recomputes from the page's own number
   agrees with any number (GLIMPSE's fl7); a gate that throws on a missing element names no law (GLIMPSE's mo1).

---

## 1. WHAT TINT IS, AND WHY IT GOES HERE

A dyer's workshop. Two recipes, jugs of dye and jugs of white; the vats pour and the cloths come out the same shade or not, and
the paint, not the app, says which. The skill is deciding whether a relationship scales at all; multiplying is only arithmetic.

It goes here because it is the catalog's convergence point: NOTCH's scaling on one side, CREASE's fraction line on the other.

---

## 2. INHERITANCE (real paths, checked 2026-09-16)

| What | From | How TINT uses it |
|---|---|---|
| Seeded randomness | `satellites/math/core/pure.js` `rng` | every deal |
| Tier ladder | `pure.js` `adaptTier` | stage and factor type |
| The reveal contract | `core.js` `reveal` (the line mode for Mode 2's continuous level) | the pour; the child's answer stays, the paint comes second |
| Number line | `core.js` `numberline` | Mode 2 continuous: the dye level in a vat |
| Audio, store, settings, collectible, teacher's link | `core.js`, `pure.js`, `satellites/math/config/schemas.js` | as every catalog game |
| Lightness | BRIM's and GLIMPSE's art gates (CIE L from sRGB) | T7's lightness law |
| Lint, runner, gates, worker, shots, icons | NOTCH's and HUSH's `tools/*`, `test/*.mjs`, `sw.js` | copied and pointed at TINT |

---

## 3. CORRECTIONS AND DIFFERENCES (section 2 of the catalog plan, plus what arithmetic found)

Every numeric claim here was checked by a script on 2026-09-16 (session scratch `tint-arith.mjs`).

3.1 **The design spec (`TINT-design-spec.md`) was not delivered** (CATALOG-PLAN correction 4); the two errors and the anti-patterns
are built from the handoff's sections 1 and 9.

3.2 **"mixLinear produces identical RGB for equivalent ratios, exact equality" fails as the handoff writes the mix.** Mixing in
linear light as (a dye + b white) / (a + b) and comparing floating point results, over 24,192 equivalent pairs (every sampled
dye, seven ratio families, factors 2, 3, 5, 7, 1.5 and 2.5):
```
naive float unequal 12099 | naive 8-bit unequal 0 | reduced-to-lowest-terms float unequal 0
```
Half the equivalent pairs differ by an ulp, because a factor like 3 is not exact in binary. The 8-bit colours happened to agree,
which is luck, not a law. So **`mixLinear` first reduces the ratio to lowest whole terms** (a non-integer part like 5 : 2.5 is
scaled to whole numbers, then divided by the greatest common divisor), and only then mixes; equivalent ratios then run the SAME
arithmetic and are equal by construction, in floating point and in bytes. The gate asserts both, over every ratio the engine can
deal and the handoff's own `mix(2,1) === mix(4,2) === mix(6,3)`.

3.3 **T7's lightness law holds only for dark dyes.** The CIE lightness gap between the "different" pairs of Mode 1's trap set, dye
mixed with white in linear light:
```
madder     L of dye 33.1 | additive 4.3, magical doubling 4.3, constant sum 16.1, build up 2.7
woad       L of dye 27.4 | additive 4.5, magical doubling 4.5, constant sum 16.9, build up 2.9
weld       L of dye 68.3 | additive 2.2, magical doubling 2.2, constant sum 8.3, build up 1.4
indigo     L of dye 17.8 | additive 4.8, magical doubling 4.8, constant sum 18.0, build up 3.0
walnut     L of dye 23.2 | additive 4.6, magical doubling 4.6, constant sum 17.4, build up 3.0
cochineal  L of dye 28.0 | additive 4.5, magical doubling 4.5, constant sum 16.9, build up 2.9
```
Weld, a yellow, already near white, leaves the build up trap 1.4 apart, under a just noticeable difference: a child could not see
that the paint says "different". So **every dye in TINT's palette has a lightness of 35 or under**, and the colour law asserts,
for every "different" pair the engine can deal with every dye, a CIE lightness gap of **2.5 or more**; a pair that would fall under
it is not dealt with that dye (the generator checks the gap, the law proves it on 20 seeds).

3.4 **T1's 13 to 17 percent and T2's 38 to 42 percent are counts, not chances** (CATALOG-PLAN section 6: a count is a law). Dealt
one task at a time at 15 and 40 percent, the shares wander by 2.5 and 4.9 points (one standard deviation) and fail their bands on
many seeds. So a Mode 2 session of twenty holds **exactly three** non-proportional items (15 percent) and a Mode 4 session of ten
holds **exactly four** proportional items (40 percent), placed by a seeded shuffle; over 200 and 100 tasks the shares are then 15
and 40 exactly on every seed.

3.5 **T4 "all five errors in any 40-item comparison set"** is held by session: a Mode 1 session of twenty holds at least one trap
of each of the five errors, so any forty consecutive items contain a whole session.

3.6 **T3, non-integer factors 35 percent or more beyond stage 1**, is also dealt as a count: seven of every twenty scaled tasks.

3.7 **T9, continuous before discretized for every new ratio family**: a family (a ratio in lowest terms) is first dealt continuous;
the engine keeps a set of families seen and deals a family discretized only after it was seen continuous; the law replays whole
sessions and checks the order.

3.8 **Mode 4's physical reveals** (four cloths drying under one clock; the big square tiled from four small ones; the vat's
fixed ten minutes plus two a jug) are built as demonstrations with more care than anything else in the mode (the handoff step 7).
The copy states nothing the demonstration does not show.

3.9 **The ratio table in Mode 2** is a first class control: rows a child can add, always visible, and build up allowed to run out of
road (5, 10, 15 cannot reach 12). No cross multiplication anywhere (T6, a lint word list as BRIM's B8).

3.10 **v1 is Modes 1, 2 and 4 and the pour** (the handoff's scope, CATALOG-PLAN call). Modes 3 and 5 and the swatch wall are v1.1.

3.11 **TINT's stamp starts at `20260916g`**, a stamp no game has carried.

---

## 4. ARCHITECTURE LAW

```
satellites/tint/
├── index.html  main.js   the page: doors, the workshop, the vats and the pour, Modes 1, 2 and 4
├── colour.js             PURE: sRGB and linear light, mixLinear on reduced ratios, CIE lightness
├── engine.js             PURE: generateRatioPair, ERROR_TAXONOMY, NONLINEAR_BANK, the session deals, scoring
├── render.js             the vats, the pour (two streams meeting, the colour resolving over 400 ms), the cloths
├── content.js  config.js  sprites.js  sw.js  manifest.webmanifest  icons  STAMP.js
├── test/   colour.mjs engine.mjs (node); compare.mjs fill.mjs scales.mjs pour.mjs audio.mjs config.mjs layout.mjs offline.mjs
│           pace.mjs art.mjs (browser)
├── tools/  check.js lint.mjs shots.mjs icons.mjs
└── docs/   DECISIONS.md shots/
```

**T1 to T10, the law each becomes.** T1 and T2 3.4's exact counts on 20 seeds; T3 3.6's count; T4 3.5's per session coverage; T5
every comparison round pours and shows both cloths before go on (the page gate reads the drawn swatches); T6 lint's word list over
every string; T7 3.3's palette and lightness gap laws; T8 every swatch on the page has its jug counts beside it (the page gate
reads them); T9 3.7's order law; T10 3.2's equality law.

---

## 5. THE PHASES, WITH GATES

### P0. Colour, ratios, the banks, the deals (about 3 hours)
`test/colour.mjs` (3.2 and 3.3) and `test/engine.mjs` (T1 to T4, T9, the trap set's answers, NONLINEAR_BANK's answers, scoring)
red with no modules, then `colour.js`, `engine.js`. `tools/lint.mjs` with T6.

### P1. The workshop, Mode 1 SAME COLOUR, the pour (about 4 hours)
The vats and the pour, continuous first. `test/compare.mjs` (the seam, T5, T8) and `test/pour.mjs` (the reveal contract, the
400 ms resolve, less motion).

### P2. Mode 2 FILL THE VAT with the ratio table, Mode 4 with its demonstrations, audio (about 5 hours)
`test/fill.mjs` (the table, build up allowed to fail, non-proportional salting) and `test/scales.mjs` (Mode 4's three
demonstrations and its 40 percent), the ear gate.

### P3. Links, layout, offline, pace, art (about 3 hours)
As NOTCH's P3, with the art gate reading T7 off the drawn swatches.

**TINT v1 is done** when `tools/check.js` prints ALL GATES PASSED under the lock, every gate has a red line in section 13, every
shot is opened with its faults named, it is deployed and probed, and the listing line is in section 8.

---

## 6. THE SCREENS

- **First run:** no text; six seconds: 2 dye and 1 white pour into a vat and a cloth takes the colour; beside it 4 and 2 pour and
  that cloth comes out the same shade. Then the doors: SAME COLOUR, FILL THE VAT, DOES IT SCALE.
- **Mode 1:** two recipes, the child's same or different, the pour, both cloths, the jug counts beside each.
- **Mode 2:** a recipe and an order; the ratio table; the child fills the vat; the pour against the recipe's cloth.
- **Mode 4:** a situation drawn; the child decides whether it scales, then the demonstration.

---

## 7. ART

Vats, jugs, cloths and the workshop in code drawn pixels at whole scales; the pour and the swatches as flat fills in linear mixed
colour (a swatch must be exactly the mixed colour, never dithered). Painted sheets are Stephen's, later.

---

## 8. LISTING (the line for Fable's portal row)

"Pour dye and white into two vats and see whether the cloths come out the same shade, a free ratio game with no login." (One
sentence, no dash. `cat:"math"`, In Development.)

---

## 9. PITFALLS

The handoff's section 9, and: exact equality asserted on unreduced floats (3.2); a light dye (3.3); shares dealt as chances
(3.4); the builder's stamp not moved before a deploy that changes `schemas.js`.

---

## 10. DECISION RIGHTS AND OPEN QUESTIONS

| Question | Default the build takes |
|---|---|
| Final name | Tint, the working title |
| Mode 4 as its own product ("Not everything scales") | inside TINT for v1; its own URL is v1.1 |
| Age fit past grade 6 | Modes 3 and 5 wait for v1.1 |
| ChromaForge sharing | none; it is in no repo here |
| Which dyes | the dark ones of 3.3 only |

---

## 11. STEPHEN ONLY

The questions above; a child of ten to twelve on Mode 1 and Mode 4.

---

## 12. HONEST SIZING

About 15 hours (P0 3, P1 4, P2 5, P3 3). Where a session stops well: after P1, when the pour tells the truth.

---

## 13. EVIDENCE LEDGER (fill in place, with commands and their real output, most recent last)

(none yet)

---

## 14. THE OVERNIGHT PROTOCOL

Never wait on a human; an ambiguity is the smallest reasonable choice logged in `satellites/tint/docs/DECISIONS.md`; a gate red
after three honest attempts goes into SESSION STATE as BLOCKED with its last thirty lines; never weaken, skip or delete a gate;
commit and push the moment something is green.

---

## 15. THE MORNING REPORT (most recent on top)

(none yet)
