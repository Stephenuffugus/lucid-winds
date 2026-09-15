# HANDOFF GAUGE, the build plan for the math catalog's tenth game

**Written:** 2026-09-16, by Opus (the builder), as step 1 of GAUGE (`plans/math/CATALOG-PLAN.md` section 8), from three inputs
read whole: `assets/math-catalog/10-GAUGE-handoff.md` (Stephen's delivery, read only), `plans/math/CATALOG-PLAN.md` (which binds
this file and wins over the handoff), and CORE as built (`satellites/math/core/`, `adaptClassify` and `numberline`), with the nine
games before it as the examples. Where this file and the handoff differ, every difference is in section 3.
**Game folder:** `satellites/gauge/` (free, checked 2026-09-16). **Live URL when listed:** `lucidwinds.com/satellites/gauge/`.
**Working title:** Gauge. The display name (GAUGE or VERNIER) and whether the teacher view is the whole product are Stephen's.

---

## SESSION STATE (the builder updates this at the end of every session; the morning reader starts here)

- 2026-09-16, Opus: plan written before any code, then **P0 done** (section 13): decimal, engine and lint green, twenty one
  plants red (three after an answer). **Next action:** P1 (section 5): the bench and WHICH IS MORE, `test/compare.mjs` and
  `test/code.mjs`. ⛔ **Do not deploy GAUGE before BRIM is deployed**; the builder's stamp is owed a move first.

---

## 0. RULES OF ENGAGEMENT

As TINT's plan section 0, pointed at `satellites/gauge/**` and GAUGE's GA1 to GA9, with its stamp `20260916h`. The builder's stamp
is owed a move before the next deploy (HANDOFF-OPUS-SEP15 section 10). Scars carried: all of TINT's, and from TINT's P0: a plant
list written before the plants run shows a law that is missing.

---

## 1. WHAT GAUGE IS, AND WHY IT GOES HERE

A precision bench. Two decimals: which is more, or are they the same. A loupe falls on a rule and opens exactly ten new
divisions between two that were touching, so 0.125 is seen to be small. The engine listens to the pattern of a child's answers,
not the count right, because a child running the wrong rule can score well.

It goes here, last, by its own rule: fraction work can plant "shorter is larger", so CREASE and BRIM ship first.

---

## 2. INHERITANCE (real paths, checked 2026-09-16)

| What | From | How GAUGE uses it |
|---|---|---|
| Seeded randomness | `satellites/math/core/pure.js` `rng` | every set |
| Pattern classification | `pure.js` line 104 `adaptClassify` (matches on DISCRIMINATING items only, `code` only when one rule is above) | GA1 |
| Number line | `core.js` `numberline` (YONDER's, with `ends` labels) | Mode 2 ZOOM's rule, extended by `subdivide` |
| The reveal contract | `core.js` `reveal` | ZOOM's hairline: the child's marker magnified first, the truth beside it |
| Audio, store, settings, collectible, teacher's link | as every catalog game | the detent pitch rising a place a level |
| Lint, runner, gates, worker, shots, icons | TINT's and NOTCH's | copied and pointed at GAUGE |

---

## 3. CORRECTIONS AND DIFFERENCES (section 2 of the catalog plan, plus what arithmetic found)

Every numeric claim here was checked by a script on 2026-09-16 (session scratch `gauge-arith.mjs`, CORE's own `adaptClassify` on
pure and noisy responders, decimals compared as scaled integers).

3.1 **The design spec (`GAUGE-design-spec.md`) was not delivered** (CATALOG-PLAN correction 4).

3.2 **The "apparent expert" does not hide from CORE's classifier, and the A code means something narrower than the handoff says.**
`adaptClassify` matches each rule only on the discriminating items (where the rules do not all agree), so a child's overall score
never enters it:
```
sound L        set 20 disc 15 | accuracy 50% | code L  matches {"L":1,"S":0,"truth":0.33}
deficient L    set 19 disc 11 | accuracy 84% | code L  matches {"L":1,"S":0,"truth":0.73}
L with 10 percent slips over 200 on the sound set: {"L":198,"none":2}
```
A longer is larger child scoring 84 percent overall is coded **L**, the rule they run, not **A**: the classifier already does what
GA1 asks. **A** remains for the one case the handoff means, "the item set failed to separate": truth AND a rule both at 0.8 or
above on the discriminating items, which needs a set with almost no items separating that rule. The generator makes such sets
impossible (3.4), so in play **A** means the engine served a weak set and serves more discriminating pairs. The gate: a pure L,
S or zero rule responder is coded as its rule at any accuracy, never U, on 20 seeds; a responder on a constructed set with one L
separator in fifteen discriminating items is coded A; the handoff's "≥ 85 percent while running longer is larger must be A,
never U" is kept as "never U", and the page never routes such a child as an expert.

3.3 **The zero rule as the handoff states it never errs within a whole number, so it must be defined as the misconception.** "A
zero in the tenths column makes a number small": between two decimals with the same whole part, one with a zero in the tenths IS
the smaller, so the rule is always right there, and the script's zero rule responder scored 100 percent and was coded truth on
both sets. The misconception the handoff describes ("right about 0.05 and wrong about 0.50") is **a zero anywhere among the
places makes a number small**: it says 0.5 is more than 0.50 and 0.7 more than 0.705. So the classifier carries **four rules, L,
S, Z and truth**, Z defined that way, and every set holds items that separate Z from the others (0.5 against 0.50, 0.705 against
0.7, 0.03 against 0.125 where Z is right and S wrong).

3.4 **A 20 item set guarantees separators, not just six discriminating pairs (GA2).** Every generated set holds, as counts: the
first item 0.7 against 0.2 (the handoff's section 9; no rule tells it apart); at least four items where L alone is wrong, four
where S alone is wrong, two where Z alone is wrong, two equal value pairs (GA3), two apparent expert traps (L right for the wrong
reason, 5.736 against 5.62); at least ten discriminating items in all. A law on 20 seeds counts each.

3.5 **GA9: decimals are strings and BigInt scaled integers.** `decimal.js` parses a decimal string into a whole part and its places,
compares and orders by scaling both to the same number of places as BigInt, and places a decimal on a rule as a rational (a
BigInt numerator over a power of ten) converted to a screen position only at the last step. The lint greps every runtime file
for `parseFloat` and `Number(` applied to a decimal, and the law compares against a table of hand checked orderings including
0.1 + 0.2 against 0.3 as strings.

3.6 **GA4: exactly ten divisions a level, a constant node count.** `subdivide(level, from)` returns the eleven ticks of one level;
the page keeps a fixed pool of tick elements for the current level and one each side and moves them, never creates or removes
one; the pace gate asserts the node count is equal before and after every zoom.

3.7 **GA5: money is not a context in v1 at all.** No money in any item or copy (a lint word list), so it cannot carry a mode.

3.8 **GA7: the code never reaches a render path.** The teacher view is v1.1 (CATALOG-PLAN D7). In v1 the classification lives in
memory and the store only; a page gate reads the whole DOM, every attribute and the title after a run for L, S, Z, A, U as a code
and for the rule names.

3.9 **v1 is Modes 1, 2 and 4 and classification** (the handoff's scope). Modes 3 and 5 wait for v1.1 (Mode 5 with
MISCONCEPTION_VOICES keyed to the child's code is the most wanted of the two).

3.10 **Sequencing** (the handoff's section 7): GAUGE is not deployed before BRIM is live. The hub's routing rule is Fable's
landing page.

3.11 **GAUGE's stamp starts at `20260916h`**, a stamp no game has carried.

3.12 **The handoff's item table has one row with L and S swapped.** For `0.05` vs `0.4` it gives "L says 0.4, S says 0.05". Under
the handoff's own definitions, longer is larger picks the longer decimal, 0.05, and shorter is larger picks the shorter, 0.4. The
table's next row, `2.6` vs `2.06` ("L says 2.06, S says 2.6"), follows those rules, and no single longer is larger rule gives both
rows. The engine follows the definitions, and the engine law records the row as the rules read it.

---

## 4. ARCHITECTURE LAW

```
satellites/gauge/
├── index.html  main.js   the page: doors, WHICH IS MORE, ZOOM with the loupe, SAME VALUE
├── decimal.js            PURE: parse, compare, order, place as a rational; no floats on decimal values (GA9)
├── engine.js             PURE: the predictors L, S, Z, truth; the item bank; generateComparisonSet; classifyRun; routeFrom;
│                         subdivide
├── render.js             the bench, the rule and its fixed pool of ticks, the loupe
├── content.js  config.js  sprites.js  case.js (the instrument case collectible)  sw.js  manifest  icons  STAMP.js
├── test/   decimal.mjs engine.mjs (node); compare.mjs zoom.mjs same.mjs code.mjs audio.mjs config.mjs layout.mjs offline.mjs
│           pace.mjs art.mjs specimens.mjs (browser)
├── tools/  check.js lint.mjs shots.mjs icons.mjs
└── docs/   DECISIONS.md shots/
```

**GA1 to GA9, the law each becomes.** GA1 3.2's classification laws; GA2 and GA3 3.4's counts; GA4 3.6's ten ticks and constant
node count; GA5 3.7's word list; GA6 copy names places (tenths, hundredths) and a lint list bans "point" as a hero ("decimal point"
may appear once in a teacher string, never to a child); GA7 3.8's DOM law; GA8 Mode 5 is v1.1, and its word law is written then;
GA9 3.5's float law and hand checked table.

---

## 5. THE PHASES, WITH GATES

### P0. Decimals, predictors, sets, classification (about 3 hours)
`test/decimal.mjs` (GA9's table and order laws) and `test/engine.mjs` (3.2 to 3.4 on 20 seeds, `subdivide`, `routeFrom`) red
with no modules, then the modules, lint and runner.

### P1. The bench, WHICH IS MORE (about 3 hours)
`test/compare.mjs` (the seam, "the same" selectable, keyboard), `test/code.mjs` (GA7).

### P2. ZOOM and the loupe, SAME VALUE, audio (about 5 hours)
`test/zoom.mjs` (ten ticks, the marker magnified before the truth, keys ← → ↑ ↓ Enter), `test/same.mjs`, the ear gate (the
detent a place higher each level).

### P3. The case, links, layout, offline, pace, art (about 3 hours)
As TINT's P3, the pace gate holding the node count.

**GAUGE v1 is done** when `tools/check.js` prints ALL GATES PASSED under the lock, every gate has a red line in section 13, every
shot is opened with its faults named, BRIM is live, GAUGE is deployed and probed, and the listing line is in section 8.

---

## 6. THE SCREENS

- **First run:** no text; a rule 0 to 1, a marker drops past the third division, the loupe falls, ten new divisions, the marker
  settles on the fifth, 0.35 etches beside it. Then the doors: WHICH IS MORE, ZOOM, SAME VALUE.
- **WHICH IS MORE:** two decimals in tabular figures, three answers: this one, that one, the same.
- **ZOOM:** the rule, a decimal to place, the loupe opening ten divisions a level.
- **SAME VALUE:** a decimal and its partner with a zero added or moved: the same or not.

---

## 7. ART

A brass and wood bench in code drawn pixels; the rule and ticks as crisp lines; the loupe as a ring (GAUGE is not bound by
YONDER's no circles rule). Painted sheets are Stephen's, later.

---

## 8. LISTING (the line for Fable's portal row)

"Open a loupe on a ruler to see which decimal is really more, ten new divisions at a time, a free place value game with no
login." (One sentence, no dash. `cat:"math"`, In Development.)

---

## 9. PITFALLS

The handoff's section 10, and: a zero rule that is never wrong (3.3); A read as "high score" (3.2); a set with six discriminating
pairs that separates only one rule (3.4); deploying before BRIM (3.10); the builder's stamp.

---

## 10. DECISION RIGHTS AND OPEN QUESTIONS

| Question | Default the build takes |
|---|---|
| GAUGE or VERNIER | Gauge, the working title |
| The teacher view as the whole product (a class screener) | v1.1, behind `?teacher=1`, local only |
| Age bands on the hub | Fable's landing page |
| Mode 5 in v1 | v1.1 |

---

## 11. STEPHEN ONLY

The questions above; a child of ten to twelve on WHICH IS MORE and ZOOM; a teacher reading the screener when it exists.

---

## 12. HONEST SIZING

About 14 hours (P0 3, P1 3, P2 5, P3 3). Where a session stops well: after P1, when the classifier hears patterns from real taps.

---

## 13. EVIDENCE LEDGER (fill in place, with commands and their real output, most recent last)

### P0, decimals, predictors, sets and classification (2026-09-16)

Section 3's arithmetic checked with CORE's own classifier before the plan (`gauge-arith.mjs`). `test/decimal.mjs` and
`test/engine.mjs` written first; with no modules both went red on the line that matters (`Cannot find module ... decimal.js`,
`... engine.js`). Writing the predictors showed the handoff's table swaps L and S on 0.05 vs 0.4 (3.12). Then `decimal.js` and
`engine.js`: **DECIMAL OK** and **ENGINE OK** on their first runs (every set's counts on 20 seeds; pure L, S, Z responders coded
as their rules and truth as U; the deficient set's L responder at 95 percent coded A). `tools/lint.mjs` from TINT's with GA9,
GA5 and GA6, green.

**Watched red** (`gauge-p0-plants.cjs`): all twenty one, three of them only after an answer.
```
d1 places trimmed on parse            FAIL  parse keeps the places as written ...: 0.50 gave {"whole":"0","places":"5"} ...
d2 a leading point accepted           FAIL  parse ...: ".5" was accepted; "" was accepted
d3 compare by length first            FAIL  compare orders decimals exactly ...: 0.125 vs 0.3 gave 1 for -1 ...
d4 add through floats                 FAIL  add is exact on strings: 0.1 + 0.2 is 0.3: 0.1 + 0.2 gave 0.30000000000000004 for 0.3 | FAIL ... it names parseFloat
d5 a rational trimmed                 FAIL  rational gives a BigInt numerator over a power of ten: 0.50 gave {"num":"5","den":"10"}
d6 same digits by value               FAIL  sameValue ...; sameDigits tells 0.5 and 0.50 apart
e1 L reads lengths not whole numbers  FAIL  the predictors ...: L on 0.9 vs 0.05 gave right for left (the places read as a whole number)
e2 Z only in the tenths               FAIL  the predictors ...: Z on 0.5 vs 0.50 gave same for left ...
e3 three L separators                 FAIL  every set of twenty ... holds four L separators ...
e4 no equal pairs                     FAIL  every set of twenty ... two equal pairs ... | FAIL on every generated set ...
e5 the first item shuffled away       FAIL  every set of twenty opens with 0.7 vs 0.2 ...: {"first":"0.15 v ...
e6 A read as U                        FAIL  3.2: on a set with one L separator ... an L responder scoring 95 percent is coded A, the set failed (U)
e7 classified on accuracy             FAIL  on every generated set ... never U ... | FAIL 3.2 ...
e8 coded after six                    FAIL  on every generated set ... never before twelve answers ...
e9 nine divisions                     FAIL  GA4: subdivide gives eleven ticks ...
e10 S sent to zoom only               FAIL  routeFrom: ... (["zoom"] ["zoom"] ["compare"] ["zoom"])
e11 an unseeded shuffle               FAIL  a seed replays its set ... | FAIL engine.js ...: it names Math.random
l1 money in the copy                  FAIL  GA5: no money in any string: content.js: "Count your change"
l2 a float on a decimal               FAIL  GA9: ...: engine.js names Number(
l3 the point as hero                  FAIL  GA6: no string makes the point the hero ...: "Zoom past the decimal point"
l4 an unstamped import                FAIL  every relative import and local asset carries ?v=20260916h: engine.js loads ./decimal.js
```
⛔ **Three planted nothing first, and each was answered before counting.** `e1` (L reading lengths first) passed a table on
which both readings of L agree; they part only when the longer decimal starts with a zero, so law 1 now reads 0.9 vs 0.05. `e6`
removed only the A line, and the classifier's last line returns A anyway when two rules are above: the plant was rewritten to
change that line too. `l1` ("Count your change") showed the money law knew only "change due"; it now catches change counted,
given or received. ⛔ One row added to law 1 was my own error (L on 0.07 vs 0.6 expected 0.6; the places read as a whole number
give 7 over 6, so 0.07): it turned every rerun red on itself and was corrected before any plant was counted.

### P1 built, P2's engine (2026-09-16)

P1's page (WHICH IS MORE) and its gates `test/compare.mjs` and `test/code.mjs` (GA7) are written and queued under the lock.
P2's engine is written: `zoomPath`, `scoreZoom`, `dealSame` and `scoreSame`, with laws 8 (ZOOM) and 9 (SAME VALUE).
⛔ **Law 9 caught a pool pair of my own**: 0.08 vs 0.080 has a zero among the places on both sides, so the zero rule calls it the
same and it separates nothing. It was replaced with 0.9 vs 0.90. **Watched red:**
```
z1 zoom one division off              FAIL  ZOOM: zoomPath opens the division the value lies in ...: 0.125 gave [["0",1,2] ...
z2 the thousandths never open         FAIL  ZOOM: ...: 0.125 gave [["0",1,1] ... (the thousandths level missing)
z3 five trailing and seven inner      FAIL  SAME VALUE: every session of twelve holds six trailing zero pairs ...
z4 a trailing pair the zero rule gets right  FAIL  SAME VALUE: ... and Z wrong on every trailing pair ...
z5 scoreZoom on the last level only   FAIL  ZOOM: ... scoreZoom right only on the whole path: scoreZoom
```
⛔ z5 first planted nothing: law 8's scoreZoom cases all differed at the last level. The law now also holds a path right at the
last level and wrong before it, and a path of the last level alone; z5 is red against it.

---

## 14. THE OVERNIGHT PROTOCOL

Never wait on a human; an ambiguity is the smallest reasonable choice logged in `satellites/gauge/docs/DECISIONS.md`; a gate red
after three honest attempts goes into SESSION STATE as BLOCKED with its last thirty lines; never weaken, skip or delete a gate;
commit and push the moment something is green.

---

## 15. THE MORNING REPORT (most recent on top)

(none yet)

### P2 page (2026-09-16)

- engine: `dealZoom` (ten values a session: three tenths, three hundredths, two thousandths, two with a whole part, none ending in a zero), law 10. Plants z6 (a last digit may be 0) and z7 (the thousandths dealt as hundredths) both red, each naming the fault.
- page: ZOOM (a rule of eleven ticks and labels built once and moved, a marker, left, right, open ten finer, back out ten wider, put it here; the true place on its own rule beneath after the hold; a detent a move pitched a step higher at each finer place) and SAME VALUE (the pair, the same value or not, the true answer lit after the hold). Three doors on the first screen. NOT YET GATED in a browser.

### P2 gates and P3 half built (2026-09-16, at the codespace refresh)

- `test/compare.mjs` and `test/code.mjs` on `c3ced4e3`: **COMPARE OK**, **CODE OK** on first runs. `test/zoom.mjs` on `deb4695e`:
  **ZOOM OK** and **SAME OK** on first runs. None counts until its plants go red.
- P3 written, NOT YET GATED: `config.js` (seed, mode), the builder's `gauge` entry in `satellites/math/config/schemas.js`, `sw.js`,
  `manifest.webmanifest`, `case.js` and `sprites.js` (eight instruments in three metals, one a run, twenty four), `tools/icons.mjs`,
  and main.js wiring (parseConfig, a named mode shows one door, the worker, the case earned when a session ends with the round
  under it inert, `GAUGE.audio.pitchOf` for the ear gate). Lint and engine green.
- Still to write: the ear gate, config, offline, layout, pace (node count), art, specimens, shots. See `RESUME-OPUS-SEP16.md`.

### P3 gates written (2026-09-15 night)

- Written and registered, NOT YET RUN: `test/audio.mjs` (the ear gate: muted first load, detent0 to detent3 a semitone or more apart
  measured off rendered samples through `GAUGE.audio.pitchOf`, master, repeatable, clip, silence, alarm, a device whose audio
  throws), `test/config.mjs` (the builder's gauge entry held equal to config.js; a link naming no mode shows every door, a link
  naming one shows that door; the first item Node's), `test/offline.mjs`, `test/layout.mjs` (nine states by play at four sizes,
  the case after a SAME VALUE run among them), `test/pace.mjs` (GA4: the element count equal before and after every one of twenty
  ZOOM moves across the depths and the first tick the same node; each move painted within 100 ms, median 33.3 ms, under 4x
  throttle; the reveal instant with less motion), `test/art.mjs` (contrast 4.5 on every decimal and answer; the two markers 20 apart
  in CIE lightness; the case's instrument drawn and 36 px across at 375 and 320), `test/specimens.mjs` (the instrument case, BRIM's
  laws), `tools/shots.mjs`.
- Icons drawn into the tree (`tools/icons.mjs` under the lock) and opened: a brass rule of ten divisions with one division's box
  magnified above into a pale rule. Faults: the loupe's box sits over the lower rule's middle tick, so that rule reads as missing a
  tick; the magnified rule's ticks do not reach its frame's edges, so it does not read as ten equal divisions of the box; the two
  slanted lines make a lamp or a funnel more than a loupe. Accepted for v1 (painted art is Stephen's).

### The first full check (2026-09-15 night, frozen copy of `e56a323a`, the timeout inside the lock)
```
lint pass · decimal pass · engine pass · compare pass 14s · code pass 3s · zoom pass 11s · same FAIL 28s
audio pass 4s · config pass 3s · offline pass 13s · layout pass 101s · pace pass 3s · art pass 6s · specimens pass 23s
1 GATE FAILED
```
Every P3 gate green on its first run (none counts until its plants go red). **`same` red, the gate at fault:**
`TimeoutError: Waiting failed: 20000ms exceeded ... at revealed (test/same.mjs:28) ... at test/same.mjs:51`. It passed on `deb4695e`,
before P3. Since P3, go on after a SAME VALUE session's twelfth item deals the thirteenth and opens the instrument case over it with
the round inert; `same.mjs` plays two sessions, so its thirteenth tap landed on the case and waited for a reveal that could not
come. This is deterministic from the page's code and matches exactly which gates passed: `compare.mjs` plays one set of twenty and
`zoom.mjs` one of ten, each ending as its case opens; only `same.mjs` plays past a session. The gate now closes the case with its go
after go on and asserts the item beneath is live (the overlay scar NOTCH's turn gate and HUSH's settle gate carried).
**The rerun on `6607fa22`: SAME OK.** With it, **every GAUGE gate has passed**: lint, decimal, engine, compare, code, zoom, same,
audio, config, offline, layout, pace, art, specimens. None counts until its plant goes red; the eleven plants (one a browser gate,
anchors dry checked, `plans/lane-c-plants/gauge-p1p3-plants.cjs`) are queued.
