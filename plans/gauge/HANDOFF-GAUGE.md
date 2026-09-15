# HANDOFF GAUGE, the build plan for the math catalog's tenth game

**Written:** 2026-09-16, by Opus (the builder), as step 1 of GAUGE (`plans/math/CATALOG-PLAN.md` section 8), from three inputs
read whole: `assets/math-catalog/10-GAUGE-handoff.md` (Stephen's delivery, read only), `plans/math/CATALOG-PLAN.md` (which binds
this file and wins over the handoff), and CORE as built (`satellites/math/core/`, `adaptClassify` and `numberline`), with the nine
games before it as the examples. Where this file and the handoff differ, every difference is in section 3.
**Game folder:** `satellites/gauge/` (free, checked 2026-09-16). **Live URL when listed:** `lucidwinds.com/satellites/gauge/`.
**Working title:** Gauge. The display name (GAUGE or VERNIER) and whether the teacher view is the whole product are Stephen's.

---

## SESSION STATE (the builder updates this at the end of every session; the morning reader starts here)

- 2026-09-16, Opus: plan written, before any code, while the other games' gates run under the lock.
  **Next action:** P0 (section 5): `satellites/gauge/test/decimal.mjs` and `test/engine.mjs` red with no modules, then `decimal.js`
  (strings and scaled integers, never floats), `engine.js` (the four predictors, the item bank, `generateComparisonSet` with its
  separator guarantees, `classifyRun`, `subdivide`), `tools/lint.mjs` with GA9's float law and GA6's words, `tools/check.js`.
  ⛔ **Do not deploy GAUGE before BRIM is deployed** (the handoff's section 7; CREASE is live).

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

(none yet)

---

## 14. THE OVERNIGHT PROTOCOL

Never wait on a human; an ambiguity is the smallest reasonable choice logged in `satellites/gauge/docs/DECISIONS.md`; a gate red
after three honest attempts goes into SESSION STATE as BLOCKED with its last thirty lines; never weaken, skip or delete a gate;
commit and push the moment something is green.

---

## 15. THE MORNING REPORT (most recent on top)

(none yet)
