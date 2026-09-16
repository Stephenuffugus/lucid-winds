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

- 2026-09-16, Opus: plan written before any code, then **P0 done** (section 13): colour, engine and lint green, twenty plants
  red, and a missing law found while writing them (a dealt pair's gap in its own dye). **Next action:** P1 (section 5): the
  workshop, the vats and the pour, Mode 1 SAME COLOUR continuous first; `test/compare.mjs` and `test/pour.mjs`.

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

### P0, colour, ratios, the banks and the deals (2026-09-16)

Section 3's arithmetic checked by a script before the plan (`tint-arith.mjs`). `test/colour.mjs` and `test/engine.mjs` written
first; with no modules both went red on the line that matters:
```
  FAIL  colour.js loads as an ES module (Cannot find module '/workspaces/lucid-winds/satellites/tint/colour.js' ...)
  FAIL  engine.js and colour.js load as ES modules (Cannot find module '/workspaces/lucid-winds/satellites/tint/engine.js' ...)
```
Then `colour.js` and `engine.js`: **COLOUR OK** and **ENGINE OK** on their first runs (equal colour over 245 equivalent pairs;
the least lightness gaps of the trap set's different pairs madder 3.0, woad 2.9, indigo 3.3, walnut 2.9, cochineal 2.8; shares
15.0 and 40.0 percent exactly). `tools/lint.mjs` from NOTCH's with T6, green. ⛔ Writing the plants showed a law missing: nothing
checked that each DEALT different pair is 2.5 apart in its own dye (the colour law reads four fixed pairs), so law 11 was
written before the plants ran, green on the tree (1000 pairs).

**Watched red** (`tint-p0-plants.cjs`, a folder copy per plant): all twenty.
```
c1 mixed in sRGB                    FAIL  all dye is the dye ...: madder with no white is #c57171 ...
c2 no reduction before mixing       FAIL  T10: equivalent ratios mix to identical colour ...: #8e2a2a 2:1 times 3 gave #be9f9f ...
c3 a light dye                      FAIL  3.3: every dye has lightness 35 or under ... (least gaps: madder 1.6, ...)
c4 the wrong gamma one way          FAIL  sRGB bytes to linear light and back is exact for all 256 values: 11, 12, 13, 14, 15, 16
c5 halves rounded away              FAIL  reduceRatio gives lowest whole terms, halves included: 5:2.5 gave [5,3] for [2,1] ...
c6 a clock in the colours           FAIL  colour.js touches no screen, clock or unseeded die: it names Date
e1 same by the difference           FAIL  the trap set is the handoff's seven pairs with its answers ...
e2 incomplete left out              FAIL  T4: ...: 7000 session 0 lacks incomplete ...
e3 four rinses                      FAIL  T1: every FILL session of twenty holds exactly three non-proportional orders (20.0 percent) ...
e4 whole factors only               FAIL  T1 ...; T3: whole factors at stage 1, 35 percent or more not whole beyond ...
e5 halves at stage 1                FAIL  T1 ...; T3: whole factors at stage 1 ...
e6 five that scale                  FAIL  T2: every DOES IT SCALE session of ten holds exactly four proportional items (50.0 percent) ...
e7 a fresh family discretized       FAIL  T9: ...: 22838 family 9:4 first dealt discretized ...
e8 a rinse that scales              FAIL  T1 ...; every answer its own arithmetic ...
e9 the bank flag by size            FAIL  T2: ... each proportional exactly when its answers agree ...
e10 scales scored backwards         FAIL  scoring is right exactly when the answer is: scales dry
e11 an unseeded shuffle             FAIL  a seed replays its session and another seed gives another | FAIL engine.js ...: it names Math.random
e12 any dye for a different pair    FAIL  3.3: every different pair dealt (1000) is 2.5 or more apart ...: 7000 [1,2] vs [3,5] in madder only 2.06 apart
l1 cross multiplication taught      FAIL  T6: no string teaches cross multiplication: content.js: "Cross multiply to check"
l2 an unstamped import              FAIL  every relative import and local asset carries ?v=20260916g: engine.js loads ./colour.js
```

---

### P1, the first browser runs (2026-09-16, frozen copies under the lock)

`test/compare.mjs` on `5d192f39`: **COMPARE OK** on its first run; not counted until its plants go red.

`test/pour.mjs` on `e8a44b91`: **red on one law, and the gate was at fault**:
```
  FAIL  375x667 the vat is streaked while it pours and one colour, exactly #a6a19e, from 700 ms on (74 frames; late ["#cdbca3/#a6a19e"])
```
The page's pour runs from its first frame after the tap (`runPour` takes `startedAt` from that frame). The gate timed from the
tap itself and read each frame's pixels in a callback asked for before the page's, so it read the frame before the page drew
it; on this loaded box the first frame came late enough that a streak the page drew under 700 ms was stamped past 760. The gate
now takes time zero from the first frame after the tap (the timestamp the page's clock shares) and reads the pixels after every
callback of the frame has run. The law (streaked while it pours, one colour exactly from 700 ms on) is unchanged. A plant that
slows the resolve to 600 ms is queued with the rerun, to show the corrected gate still sees a late streak.

**The pour rerun after the gate clock fix** (`a4979232`): **still red** on the same law (`late ["#cdbca3/#a6a19e"]`), and the plant
w1 (resolve slowed to 600 ms) red the same way, which counts for nothing while the green run is red. The late streak now looks like
the page's own; `drawPour` and `runPour` are next. (Its copy also 404'd `icon-192.png`: icons are drawn into a frozen copy, not
committed, so an icon request on a copy without them is expected to 404 on the console.)

### P2 and P3, first runs (2026-09-15 night, frozen copies under the lock)

- `test/fill.mjs` and `test/scales.mjs` on `e8824c8e`: **FILL OK**, **SCALES OK**.
- icons drawn in `c3bedc41`'s copy; `test/offline.mjs` **OFFLINE OK**.
- `test/config.mjs` **red, the gate at fault**: `FAIL the builder's defaults: one door ... ({"doors":["start","start-fill","start-scales"],"mode":"compare","same":true})`.
  A link of the builder's defaults names no mode (`buildQuery` writes only what differs), so every door is right; the gate now owes
  one door only to a link that names its mode (`docs/DECISIONS.md`).
- `test/layout.mjs` **red, the page at fault**:
```
  FAIL  320x568 FILL THE VAT answering: ... #fill-pour (92,526 to 228,582 in 320x568)
  FAIL  320x568 FILL THE VAT after its pour: ... #next (244,679 to 308,735 in 320x568), #fill-truth (12,613 to 308,671 in 320x568)
  FAIL  320x568 DOES IT SCALE after its demonstration: ... #next (244,673 to 308,729 in 320x568), #scales-truth (12,578 to 308,665 in 320x568)
  FAIL  375x667 FILL THE VAT after its pour: ... #next (299,674 to 363,730 in 375x667)
```
  Fixed: after the pour the table, the stepper and pour are hidden; on a screen 700 px tall or shorter the situation's words are
  hidden once answered; at 600 px tall the table scrolls in 132 px (`docs/DECISIONS.md`). Reruns and plants queued.
- **The reruns on `8f07b6d8`:** every state also failed "nothing landed on the console" on `http 404 .../tint/icon-192.png`: the
  icons had only ever been drawn into frozen copies and were never committed, so a served TINT page (live ones too) asks for an
  icon that is not there. That is a real fault: the icons are now drawn into the tree and committed. Apart from the 404s:
  config's door law green; layout's after-pour states green, and FILL THE VAT answering at 320 still 14 px short
  (`#fill-pour (92,526 to 228,582 in 320x568)`), so the table scrolls in 104 px at 600 px tall. **Plant y1** (the after-pour rule
  removed) **red** on the law it plants (`FILL THE VAT after its pour: ... #next (244,679 to 308,735 in 320x568)`, and at 375);
  **plant c1** (the named mode's door hiding removed) **red** (`other values: one door ... {"doors":["start","start-fill","start-scales"],"wantDoors":["start-fill"]}`).
  Both count once their green runs are clean.
- **The rerun on `fbb7d2b5`:** NOTCH and TINT config green; **TINT layout still red at 320 on one state, with the same numbers**:
  `FILL THE VAT answering: ... #fill-pour (92,526 to 228,582 in 320x568)`. Identical coordinates after the table cap went from 132
  to 104 px mean the cap did nothing, and I had reasoned that fix instead of measuring it: a fresh round's table holds a couple of
  rows and is already shorter than either cap, and a max height only shrinks what is taller. The room now comes from the column's
  own spacing at 600 px tall or shorter: the fill view's gap 12 to 6 px, the two cards' padding 10 to 5 px, the recipe swatch 56 to
  44 px, the table's gap 8 to 4 px (about 40 px against the 14 needed), no text made smaller.
- **The reruns: POUR OK** (on the commit where the gate samples the vat's liquid band from `render.js`'s own layout, `b057857c`; the
  gate had been red twice on its own faults, never the pour) **and LAYOUT OK** (on `eb87b983`, the spacing fix; it had been red at
  320 on FILL THE VAT answering after the table caps did nothing). Plants w1 (the resolve slowed to 600 ms) and y1 (the after pour
  rule removed) run against those green runs.
- **Plant y1, paired with its own green run: LAYOUT OK, then red on the law it plants:**
```
  FAIL  320x568 FILL THE VAT after its pour: ... #next (244,625 to 308,681 in 320x568), #fill-truth (12,559 to 308,617 in 320x568)
  FAIL  375x667 FILL THE VAT after its pour: ... #next (299,674 to 363,730 in 375x667)
```
  **TINT's layout gate counts.** (The sticky header fix came later, from a shot; its own layout rerun is queued.)
### The shots, taken and opened (2026-09-15 night, `tools/shots.mjs`, written this session: TINT had none)

Six states at four sizes, twenty four shots, all under the 200 KB limit (81 KB the largest). Three opened and read:

- **`p3-compare-pour-375x667`**: ⛔ the vats read as window blinds, a brown frame round a flat pane, and both cloths are flat grey
  rectangles, so nothing in the picture looks like dye or like cloth (the grey is honest for walnut mixed with white, but it reads
  as no colour at all); ⛔ the child's choice carries a heavy ring while nothing marks the right answer but a line of words, so the
  eye lands on the wrong button; ⛔ each recipe's words sit under its vat, far from the cloth that recipe made.
- **`p3-fill-320x568`**: ⛔⛔ **a real fault, and mine**: the table's header row is sliced in half, so a child reads a cut off Dye and
  White. My own spacing fix shortened the scroll box and the header scrolled under its top edge; no gate measures a clipped
  header. Fixed: the header holds still while the rows scroll (`#ratio-table thead th` sticky). ⛔ the order's words wrap to four
  lines and end without a question mark; ⛔ Pour sits hard against the bottom edge with no gap for a thumb (the layout gate asks
  only that it be inside the viewport).
- **`p3-scales-demo-320x568`**: ⛔ the demonstration is three identical red squares, which read as neither pots nor a count, so the
  picture does not carry the lesson; ⛔ the words name pots whose description is hidden once the child has answered (the fold fix
  hides the situation on a short screen), so the answer refers to something no longer on the screen; ⛔ the child's wrong answer is
  ringed and nothing marks the right one.

The demonstration's drawing and the vats' look are Stephen's art call.

One more opened. **`p3-compare-pour-1366x768`** (the keyboard size): ⛔ the two vats sit in the upper left and two thirds of the
screen is empty; ⛔ the vats' panes and both cloths read grey, so no colour lands on a screen whose whole subject is colour;
⛔ "The paint says The same colour" carries a capital inside the sentence and reads as two fragments joined.

One more opened. **`p3-scales-demo-375x667`**: ⛔ three identical red squares carry the whole demonstration, so the picture shows
neither pots nor a count and the lesson rides entirely on the words; ⛔ the words name pots whose situation is hidden by then on a
short screen; ⛔ the demonstration's panel is a pale card on a pale page, so the drawing has no ground. The demonstration's drawing
is the one worth building properly in v1.1 (a pot and a fire a child can count).

**The retaken fill shot, opened (2026-09-15 night).** The table now reads: Dye and White whole, then 2 and 1, then 4 and 2, nothing
sliced. The header and first row faults are closed. ⛔⛔ **The same shot shows a new one**: after a child taps add a row the taller
table pushes **Pour off the bottom edge** at 320, and the layout gate passes because its FILL state never adds a row: the gate
measured the column a child arrives at, never the column a child makes. A state, FILL THE VAT with a row added, is now in the gate,
to be watched red before the page is fixed. **`p3-fill-pour-320x568`** also opened: a rinse round ends as words only, the recipe,
the order and the paint's sentence, with no picture at all and a deep empty band beneath.

**The sliced header, chased to its root (2026-09-15 night).** The sticky header made the header read, `test/layout.mjs` on
`cfaffd20` came back **LAYOUT OK**, and the retaken shot showed the fault had only moved: the recipe's own first row was now
sliced in half under the header. No gate measures a clipped row either, so only the shot saw it. The root cause is in the page:
`renderTable()` ended with `scroll.scrollTop = scroll.scrollHeight`, scrolling the box to the bottom on **every** render, the
first one included; before the sticky header that hid the header, after it the first row. And at the 104 px cap the box could not
show the header and the recipe's two rows at all, which is what 3.9 asks the table to show. Both fixed: the box scrolls to the
bottom only when the child has added a row, and at 600 px tall it stands 132 px (the 14 px that forced the cap came back from the
spacing fix, not from the cap).

**The layout rerun on `448044a0`: LAYOUT OK.** The fill shots are being retaken from the fixed tree and will be opened.

**Plant f1, paired with its own green run (FILL OK): red on the law it plants:**
```
f1 the white scored one part off   fill   FAIL  375x667 a rinse answered with the small vat's rinse is right, and a rinse does not grow with the vat: 0 {"correct":false,...
```
**TINT's fill gate counts.** Still owed: t1 (invalidated by the plant runner's folder collision, to be rerun), and the a1 and r1
plants, which were stopped before they could collide.

- **The icons, opened:** two flat mauve rectangles on a rail. Faults: they read as curtains or a window, not dyed cloths; pale mauve
  on cream is weak at launcher size; nothing in the picture shows a pour or a mix. Accepted for v1 (painted art is Stephen's).

## 14. THE OVERNIGHT PROTOCOL

Never wait on a human; an ambiguity is the smallest reasonable choice logged in `satellites/tint/docs/DECISIONS.md`; a gate red
after three honest attempts goes into SESSION STATE as BLOCKED with its last thirty lines; never weaken, skip or delete a gate;
commit and push the moment something is green.

---

## 15. THE MORNING REPORT (most recent on top)

(none yet)
- PLANT fill f1 (the white scored one part off): green run FILL OK, planted red twice — a rinse answered with the small vat’s rinse reads right, and the result line no longer matches scoreFill. COUNTS.
- PLANT compare t1: DOES NOT COUNT, the plant was never seen ("process.cwd failed ... the current working directory was likely removed") — my own runner collision. Requeued.
- SHOT p3-compare-320x568.png OPENED. Faults: (1) both vats are painted the same brown, which hands the child the answer before they read the words; (2) the swatch under each vat is an empty cream rectangle, so the one thing that should show the colour shows nothing; (3) the dye reads near black, not as a colour being mixed; (4) the labels wrap mid phrase (2 dye and 1 / white) and the bottom third is empty.
- PLANT scales s1 (the demonstration ignores less motion): green run SCALES OK, planted red — "with less motion the demonstration is over within 150 ms (1601 ms)". COUNTS. TINT plants counted so far: layout y1, fill f1, scales s1; compare t1 still owed after the runner collision.
- LAYOUT RED, and it is the page: 320x568 FILL THE VAT with a row added, #fill-pour runs 520 to 576 on a screen 568 tall, so Pour hangs eight pixels under the fold the moment a child adds a row. The shot found this before any gate measured it; the new state now measures it.
- SHOT p3-scales-demo-375x667.png OPENED. Faults: (1) the demonstration is three identical flat red squares — nothing in the picture is a pot, a fire or a boil, so every bit of the meaning is carried by the sentence under it; (2) that sentence says the answer is 10 while the picture shows three squares, so the number a child sees and the number they are told disagree; (3) the child’s choice It scales is the only marked button and nothing separately marks the true answer, the same fault as GAUGE’s same value reveal; (4) the reveal sentence sits outside the panel it explains and go on is a bare arrow in the corner.
- LAYOUT FIX: on screens 600 px and shorter the ratio table keeps 112 px instead of 132, giving Pour the twenty pixels it needed. To be proved by the layout gate at 320x568 in the FILL THE VAT with a row added state, not by eye.
- SHOT p3-fill-375x667.png OPENED. The strongest working screen in TINT: recipe card, the question in plain words, the table with its own header, Add a row, a stepper and Pour all readable at 375. Faults: (1) the recipe swatch beside the words is a flat grey blue square, a colour that appears nowhere else and is not the dye being mixed, so the one picture on the card teaches nothing; (2) the question ends without a question mark (How much white rinses it), so it reads as a sentence cut off; (3) the stepper starts at 0 and a half, which quietly tells a child that halves are the kind of answer wanted; (4) Dye and White are bold headings while the numbers under them are lighter, so the header outweighs the data it labels.
- SHOT p3-fill-pour-375x667.png OPENED. Faults: (1) a pour is answered with words only — the vat, the table and the pour itself all vanish, so the screen that follows pouring shows no pouring, and the one moment the game is named for is never seen; (2) the question card stays on screen unchanged above the answer, so nothing says the round has moved on; (3) the recipe swatch is still the flat grey blue square that is not the dye being mixed; (4) the answer sentence runs the full width unboxed while everything above it sits in cards, and the bottom half of the screen is empty.
- LAYOUT GREEN at b978d56c: LAYOUT OK at all four sizes including the new FILL THE VAT with a row added state, so Pour clears the fold at 320 with the table holding 112 px. Every TINT gate now passes (compare, fill, scales, offline, config, pour, layout, audio, art). Owed before deploy: the compare plant t1 (the runner collision ate it, requeued) and the shots reopened after the fix.
- SHOT p3-doors-375x667.png OPENED. Three doors, all carrying words (Same colour, Fill the vat, Does it scale), which is right. Faults: (1) the two swatches above are the SAME dusty pink drawn at two different heights, so the picture standing for a game about colour shows two identical colours and invites a child to compare their sizes instead; (2) the doors are the same tan as the cards used elsewhere for plain text, so they read as panels rather than as things to press; (3) the block wraps two then one with the last centred under the gap, crooked like GAUGE’s; (4) the top third is empty above the swatches.
- SHOT p3-compare-pour-375x667.png OPENED, and it is the most serious TINT finding from a picture yet: after the pour BOTH vats and BOTH swatches render FLAT GREY, while the same screen before the pour (p3-compare-375x667) shows dark brown dye in both vats. A game about mixing colour shows no colour at the one moment it mixes. Suspect the render, not the picture: the poured swatch may be drawing an unset or placeholder colour. TO CHECK IN CODE before calling it broken, the way the CREASE strip and the GAUGE zoom were checked. Other faults: (1) the child’s choice (A different colour) wears the black outline and the true answer appears only inside a sentence, so the reveal marks the wrong thing again; (2) that sentence quotes a button label mid sentence with its capital intact (The paint says The same colour), which reads as two sentences jammed together; (3) the labels wrap mid phrase (2 dye and 1 / white) as they do at 320.
- SHOT p3-compare-1366x768.png OPENED. Faults: (1) the whole game sits in the left two thirds of a wide screen with the right third entirely empty, so on a laptop the play area is off centre; (2) the two swatches below the vats are empty cream rectangles with nothing saying they are cloth waiting to be dyed, so the screen shows two blanks where the answer will appear; (3) the vats read as dark brown boxes with a white band on top and no vessel drawn around them, so nothing says these are vats rather than charts; (4) the two answer buttons are about 200 px wide on a 1366 px screen and sit directly under the labels with no separation, the smallest things on a very large page.
- THE GREY ANSWERED, by measuring instead of reading (two reading attempts were wrong first: I suspected the render, then suspected DYES[task.dye] of being a hex lookup, and dyeFor returns a NAME so that lookup is correct). Ran colour.js directly: madder #8e2a2a 2:1 -> #be9f9f, woad #27406e 2:1 -> #9fa3b1, indigo #1f2a4d 2:1 -> #9e9fa6, walnut #4a3222 2:1 -> #a6a19e, cochineal #7a1f3d 2:1 -> #b59ea3. The page is drawing faithfully what the mixer hands it. THE CAUSE: mixLinear averages the dye against white in LINEAR LIGHT, (A*v + B*1)/(A+B). That is how light mixes, not how dye mixes: a dark pigment is near zero in linear space, so a third of full white lifts every channel to roughly the same value and the hue washes out to grey. Hence a game about colour showing grey at the moment it mixes, and a vat that jumps from dark brown to near grey the instant it pours.
- ONE GOOD THING FROM THE SAME MEASUREMENT: 2:1 and 6:3 return byte identical hexes for every dye (#be9f9f and #be9f9f for madder, and so on), so the claim the whole game rests on, that equal ratios give the same colour, is true in the mixer and provable off the pixels.
- DIRECTOR CALL, NOT MINE: switching the mix out of linear light (to an sRGB average or a subtractive model) would change how every TINT screen looks and would change what the art law T7 asserts off the pixels. Left as it is, recorded here with the numbers so Stephen can decide. A law worth adding either way: two different dyes at the same ratio must stay distinguishable, and a mix must keep a stated share of its dye’s chroma, proved on twenty seeds rather than by eye.
- PLANT compare t1 (the paint’s words before the pour ends): rerun alone after the runner collision — green run COMPARE OK, planted red ("the choice stays marked through the pour; the paint’s words come only after both cloths are dyed, right or wrong"). COUNTS.
- PLANT offline o1 (the worker deletes every cache): green run OFFLINE OK, planted red — a worker that drops the tint- prefix deletes caches belonging to other games. COUNTS.
- PLANT pour w1 (the resolve slowed to 600 ms): DOES NOT COUNT, AND THE PLANT IS NOT THE PROBLEM. The plant was applied honestly (RESOLVE_MS 400 to 600 in render.js) and POUR stayed GREEN, because the pour law never claims how long the resolve TAKES: it claims the vat is streaked while pouring and exactly the mixed colour at the end, and that the cloth is undyed before 300 ms and mixed by the end. A pour that takes half a second longer breaks none of those. ⛔ a plant that plants nothing names a hole in the law, and the hole here is the pour’s own timing. Adding the claim (the vat is still streaked just before STREAM_MS + RESOLVE_MS and is one colour just after) and then re-running w1 against it.
- TINT plants standing: t1, f1, s1, o1 counted red; w1 owed on the law above; a1 (the pour and the knock past the master) and r1 (two dyes made light) are written in tint-plants.json but never ran in the pass, so they are owed too.
- RUNNER FAULT, NOT A PLANT RESULT: the first attempt to run w1 against the new length law died before it tested anything — I pointed PLANT_ROOT at a fresh empty folder and the runner expects a populated snapshot, so it failed at `cp -r <root>/satellites/math` with the green run printing "(no result line) [exit null]". Nothing was learned about w1, a1 or r1 from that run and nothing from it is counted. Rerun against the populated snapshot. ⛔ this is the second time tonight my own runner plumbing has produced output that could be mistaken for evidence (the first was the folder collision that ate five plants); a plant line only counts when its own green run printed a real green result.
- SHOT p3-scales-demo-320x568.png OPENED. Faults: (1) the demonstration is still three identical flat red squares carrying no pots, no fires and no boiling, and at 320 they fill the panel edge to edge so they read as a colour swatch strip; (2) the sentence says the answer is 10 while three squares are shown, so the number seen and the number told still disagree; (3) the two answers sit ABOVE the demonstration here and below it at 375, so the same screen puts its controls in different places at different widths; (4) It scales wears the black outline as the child’s choice, with the truth only in the sentence.
- SHOT p3-fill-1366x768.png OPENED. The layout holds up well at this width, everything centred in one column and readable. Faults: (1) the recipe swatch is still the flat grey blue square that is not the dye; (2) the question still ends without a question mark; (3) the stepper still opens at 0 and a half, which tells a child halves are wanted before they think; (4) the column is about 640 px wide on a 1366 px screen, so both flanks are bare while the table sits at a third of the page width.
- ⛔ PLANT SNAPSHOTS GO STALE, AND A STALE SNAPSHOT TURNS EVERY PLANT BEHIND IT INTO NOISE. The plant runner needs PLANT_ROOT to be an already populated tree (it copies satellites/math out of it), and the roots used through the night were built hours ago. So: HUSH’s audio plant pass ran against code from before tonight’s seeded rand fix, and TINT’s pour green run printed POUR OK against the OLD pour law, not the length law added minutes earlier, which means that w1 result proved nothing either way. Twice tonight I also pointed PLANT_ROOT at an empty folder, which crashes the runner with a cp error and prints "(no result line) [exit null]" for the green run. THE RULE: build the snapshot with `git archive HEAD` immediately before a plant pass, and treat any plant whose green run did not print a real green result as not run at all. Fresh snapshots built from HEAD and the owed plants rerun.
- SHOT p3-compare-pour-320x568.png OPENED. The grey is confirmed at 320 as well, in both vats and both cloths, and its cause is already measured above (mixLinear averaging against white in linear light), so it is not counted again as a new fault here. What this width adds: (1) the sentence still quotes a button label mid sentence with its capital intact (The paint says The same colour) and now wraps across two lines, so the quoted answer breaks over a line end; (2) the choice keeps the black outline while the truth lives only in that sentence; (3) the labels wrap mid phrase (2 dye and 1 / white); (4) go on is a bare arrow in the corner under everything.
- SHOT p3-fill-320x568.png OPENED, and it is STALE: it shows Pour sliced by the bottom edge, which is exactly the fault fixed tonight (the short screen table cut from 132 to 112 px) and since proved green by the layout gate in that very state. The shot was captured before the fix, so it is evidence about the old page and nothing else. Retaking the fill shots now and reopening them. ⛔ a shot is only evidence about the build that took it; after a layout fix the shots of that screen must be retaken or they will keep accusing a page that has already been repaired.
- RETAKEN p3-fill-320x568.png OPENED, and Pour STILL hangs under the bottom edge — while the layout gate is GREEN in the FILL THE VAT with a row added state at 320 after the same fix. The table is visibly tighter in the retake, so the fix did land; something else is taking the room. The difference I can see: in the shot the stepper wraps to two lines ("0 and a / half"), which adds a line of height the gate’s state may not have. So the shot and the gate are probably NOT standing in the same state, exactly as with BRIM. Measuring #fill-pour in the shot’s own state rather than guessing again — whichever way it falls goes in the ledger with numbers.
- MEASURED BY COMPARING THE TWO SCRIPTS, and the shot was right: tools/shots.mjs stages p3-fill as tap #start-fill, tap #white-more, tap #add-row, while the layout gate’s row added state taps only #add-row. Raising the white makes the stepper read "0 and a half", which WRAPS TO TWO LINES at 320 and eats the room Pour needs. So the gate is green and the shot is clipped and both are honest: they stand in different states. The state has been added to the gate (FILL THE VAT with the white raised and a row added) and will be watched red before the page is touched. ⛔ THIRD TIME TONIGHT a shot has stood in a state no law visits (TINT’s row added, BRIM’s level, now this): when a shot and a gate disagree, compare the two scripts’ steps before doubting either.
- SHOT p3-fill-pour-320x568.png OPENED (retaken). Faults: (1) a pour is answered with words alone at 320 as well — the vat, the table, the stepper and Pour all vanish and nothing shows the pouring the game is named for; (2) the question card stays on screen unchanged above the answer, so nothing marks the round as finished; (3) the recipe swatch is still the flat grey blue square that is not the dye; (4) the answer sentence runs unboxed across the full width while everything above it sits in cards, and the bottom half of the screen is empty under a bare arrow.
- PLANT w1 STILL PLANTS NOTHING against the new length law, on a snapshot built from HEAD (green run POUR OK, plant POUR OK), and that is the plant earning its keep for a second time. The cause is the READER, not the claim: the gate sampled ONE column down the middle of the vat, while the streaks are alternating ROWS whose share thins as the pour resolves, so a single column reads uniform long before the vat does. A resolve slowed by 200 ms therefore slipped past the old law AND past the length law I wrote to catch it. The vat is now read across five columns (0.2, 0.35, 0.5, 0.65, 0.8 of its width) and counts as one colour only when all five agree. Green run then w1 again. ⛔ when a plant slips a law twice, stop rewriting the claim and look at what the gate can SEE.
- SHOT p3-compare-pour-1366x768.png OPENED. The grey holds at every width, both vats and both cloths, with the measured cause already recorded (mixLinear averaging against white in linear light). What this width adds: (1) the game sits left of centre on a 1366 px screen, the two vat cards ending at about x=970 with nearly 400 px bare to their right; (2) the sentence still quotes a button label mid sentence with its capital intact; (3) the child’s choice carries the black outline while the truth lives only in that sentence; (4) go on is a bare arrow floating below the sentence with no alignment to anything above it.
- LAYOUT RED IN THE NEW STATE, as predicted, and it is the page: "320x568 FILL THE VAT with the white raised and a row added: #fill-pour (92,525 to 228,581 in 320x568)" — Pour hangs 13 px under the fold once the stepper wraps to two lines. The retaken shot was right and the law now holds it. FIX: the ratio table keeps 96 px instead of 112 on screens 600 px and shorter, giving Pour the room whether or not the stepper wraps. To be proved by the gate in BOTH fill states, not by eye.
- PLANTS a1 and r1 COUNTED: audio a1 (the pour and the knock past the master) green run AUDIO OK, planted red — "halving the master halves the rms and the peak (0.991)", so a voice wired to the destination survives a halved master and the law hears it. Art r1 (two dyes made light) green run ART OK, planted red — "every dye drawn in a recipe band has lightness 35 or under: 5 woad drawn #7d9ccf lightness 63.9". TINT plants counted: compare t1, fill f1, scales s1, offline o1, audio a1, art r1. Only pour w1 is still owed.
- LAYOUT GREEN at ac79f899: LAYOUT OK at all four sizes with BOTH fill states, so Pour clears the fold at 320 whether or not the stepper wraps. Every TINT gate is green again. Owed before deploy: the pour plant w1 and the shots reopened after the fixes.
- SHOT p3-scales-demo-1366x768.png OPENED, and it CORRECTS my earlier reading of the same screen at 375 and 320. The full question is on the wide screen: "A pot of dye boils in 10 minutes on its own fire. Three pots sit on three fires. How many minutes until all three boil?" So the three red squares ARE the three pots and "The answer is 10" is right; the picture and the words do not contradict each other. THE REAL FAULT IS WORSE AND IS IN THE CSS: `@media (max-height: 700px) { #scales-view[data-answered] #situation { display: none; } }` hides the question the moment a child answers, so on every phone size the screen shows three red squares and a sentence naming a number that nothing on the page asked for. The wide screen keeps the question and reads fine; the small screens throw away the half that carries the meaning. ⛔ a rule made to save vertical room deleted the sentence the answer depends on.
- Faults that stand on the wide shot: (1) the three pots are flat red squares with no pot, fire or boil drawn, so the picture adds nothing the words do not already say; (2) It scales wears the black outline as the child’s choice while the truth appears only inside the sentence; (3) the demonstration panel is a pale box holding three squares and a great deal of empty cream; (4) go on is a bare arrow below everything with no alignment to it.
- MEASURED BOTH WAYS, and the law was simply too loose: the healthy page settles its vat to one colour at 617 ms, and with RESOLVE_MS at 600 (plant w1) it settles at 767 ms. My window was 520 to 800, so both passed and the plant slipped a third time. A 200 ms slowdown only moves the settle 150 ms, so any law that catches it has to sit inside that gap: the ceiling is now 700 ms, which leaves 83 ms of headroom over the healthy run and puts the plant 67 ms outside. ⛔ recorded honestly: that is a tight margin, and if this gate ever flakes on a loaded box the answer is NOT to widen it back but to measure the settle against a baseline taken in the same run. The five column reader stays either way — it is the reason the number moves at all.
- SHOT p3-simon-320x568.png OPENED. Faults: (1) the instruction sits at the top and the two buttons at the bottom with about 550 px of empty cream between them, so the screen reads as two unrelated fragments at 320 as well; (2) no animal appears anywhere in the game about watching one; (3) Begin and Back to the clearing are different widths and the lesser one is wider, so the weighting is backwards; (4) the instruction names Hush as a character while everywhere else Hush is the game.
- SHOT p3-compare-412x915.png OPENED, and at this width the screen reads better than at any other: both vats hold visible brown dye, the two labels sit on one line each rather than wrapping, and the two answers stack cleanly under them. Faults: (1) the swatch under each vat is still an empty cream rectangle, so the thing that will carry the answer shows nothing; (2) the vats are drawn as dark rectangles with a white band and a plank on top, with no vessel around them, so they read as charts rather than vats; (3) nothing in words says what to do; (4) the bottom half of a 915 px screen is empty.
- SHOT p3-fill-412x915.png OPENED, and this is the best that TINT’s fill screen looks at any size: the recipe card, the question, the table, Add a row, the stepper and Pour all sit in one clean column with nothing wrapped and nothing crowded. Faults: (1) the recipe swatch beside the words is still the flat grey blue square that is not the dye being mixed; (2) the question still ends without a question mark, so it reads as a sentence cut off; (3) the stepper still opens at 0 and a half, quietly telling a child that halves are the kind of answer wanted before they have thought about it; (4) the bottom 35 per cent of the screen is empty below Pour.
- SHOT p3-scales-demo-412x915.png OPENED, and it CONFIRMS the hidden question diagnosis by showing the opposite case: at 915 px tall the max-height rule does not apply, so the question is on the screen ("A pot of dye boils in 10 minutes on its own fire. Three pots sit on three fires. How many minutes until all three boil?") and the whole screen reads properly — question, two answers, the three pots, then the answer sentence. The same screen at 568 and 667 px tall deletes that question and becomes three red squares and an unexplained number. So the fault bites exactly at the two phone heights and nowhere else, which is what the fix addresses. Faults that stand here: (1) the three pots are flat red squares with no pot, fire or boil drawn; (2) It scales wears the black outline as the child’s choice while the truth appears only inside the sentence; (3) the bottom 30 per cent of the screen is empty below a bare arrow.
- LAYOUT RED FROM MY OWN FIX, and it is the honest trade: keeping the question after an answer costs height, and the gate says the height is not there — "320x568 DOES IT SCALE after its demonstration: #next (244,629 to 308,685 in 320x568), #scales-truth (12,534 to 308,621 in 320x568)". So go on and the answer sentence now sit under the fold at 320. The question stays; the room has to come from the demonstration instead, which is three flat red squares carrying nothing the words do not already say. Fixing there and re-running, rather than putting the question back.
- SHOT p3-doors-412x915.png OPENED. All three doors carry words, which keeps TINT and GAUGE the only two games in the catalog that name what a child is choosing. Faults: (1) the two swatches above are the SAME dusty pink drawn at two sizes, so the picture standing for a game about colour shows one colour twice and invites comparing their areas; (2) the doors are the same tan as the plain text cards used elsewhere, so they read as panels rather than as things to press; (3) the block wraps two then one with the last centred under the gap, crooked; (4) the top 60 per cent of a 915 px screen is empty above the swatches.
- LAYOUT GREEN at 33730281 with the question kept: LAYOUT OK at all four sizes, including DOES IT SCALE after its demonstration at 320, where the answer sentence and go on had been 117 px under the fold. Flattening the demonstration from 3:2 to 3:1 on short screens gave back exactly the room the question needed. So the phone screens now keep the sentence the answer depends on AND fit, which is the whole point. Every TINT gate is green again; the pour plant w1 is the last thing owed.
- SHOT p3-fill-pour-412x915.png OPENED. Faults: (1) a pour is answered with words alone at this width too — the vat, the table, the stepper and Pour all vanish and nothing shows the pouring the game is named for; (2) the question card stays on screen unchanged above the answer, so nothing marks the round as finished; (3) the recipe swatch is still the flat grey blue square that is not the dye; (4) the bottom 60 per cent of a 915 px screen is empty below a bare arrow.
