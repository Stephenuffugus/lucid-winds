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

### The shots, taken and opened (2026-09-15 night, `tools/shots.mjs`, written this session)

Seven states at four sizes, twenty eight shots, all under the 200 KB limit. **`p3-zoom-reveal-375x667`** opened first:
⛔ the child's rule and the true rule are alike but for a faint difference in the marker's colour, so nothing a child sees says
which one is the answer (the two rules carry it in their labels, which a screen reader speaks and an eye does not); ⛔ the true
rule's two numbers, `0.5` and `0.6`, crowd each other under the marker; ⛔ a deep empty band sits under go on. The first is worth a
line of art later (a word or a mark on the true rule); accepted for v1, the reveal contract holds (the child's mark stays, the
truth comes second).

Two more opened: **`p3-case-375x667`**: ⛔ one small rule alone in the top left of a large felt board (CREASE's, BRIM's and
GLIMPSE's accepted fault: a collectible's first state is nearly empty); ⛔ the felt sits close to the page's paper, so the case
reads as a slightly darker rectangle rather than a case; ⛔ go on under it carries no word and the page is empty above and below.
**`p3-compare-reveal-320x568`**: ⛔ the larger measure is lit and the choice ringed, which reads, but the difference is carried by
colour alone; ⛔ a deep dead band sits under go on at 320; ⛔ go on stands mid screen rather than at the foot, so the eye jumps
back up to it. Accepted for v1 (the lit measure is the reveal contract; painted art is Stephen's).

Two more opened. **`p3-same-reveal-375x667`** (4.10 against 4.1, the same value, answered right): ⛔ the lit answer is also the
child's own choice, so a right answer and the mark of what a child picked look identical, and only a wrong round tells the two
marks apart; ⛔ the two measures carry the same gold border as the lit answer, so the eye counts four gold things; ⛔ a deep empty
band sits under go on. **`p3-doors-320x568`**: ⛔ the wordless loop is a bare rule with one tick and never shows the loupe opening
ten divisions, so the first screen does not carry the game's idea (section 6 asks for exactly that); ⛔ the three doors size to
their words and read as a list rather than three equal choices; ⛔ empty bands above and below them. The loop is worth building
properly in v1.1 (section 6's drop and loupe); the rest is art, Stephen's call.

One more opened. **`p3-zoom-open-320x568`** (a level open, the marker at the first division): ⛔ the marker overhangs the rule's
left cap, so it reads as sitting outside the line it marks; ⛔ only the two end numbers are written, so a child cannot tell which
division the marker stands in without counting ticks (GA4 asks for ten divisions, and the gate counts them, but the eye is given
two numbers); ⛔ a deep empty band sits under put it here at 320. The overhang is a drawing line worth half a pixel of inset; the
unlabelled divisions are the design (the loupe names the division it opens on the reveal), accepted for v1.
**`p3-zoom-reveal-320x568`** opened: both rules read at 320 and the true marker is clear; ⛔ its two numbers, 0.5 and 0.6, nearly
touch under the marker; ⛔ the child's rule and the true rule are told apart by the marker's colour alone; ⛔ go on sits low with
empty page beneath it. **`p3-compare-reveal-375x667`** opened: the larger measure lit and the choice ringed read clearly; ⛔ the
same, the third answer, is lighter and smaller than the two measures; ⛔ the lit measure wears the same gold as every card's
border, so the eye must find which gold means the answer; ⛔ a deep empty band sits under go on.

One more opened. **`p3-compare-375x667`** (WHICH IS MORE, answering): ⛔ the two measures read well, but the third answer, the
same, is smaller and lower, so the three choices do not read as equals (GA3 asks for three answers of one weight); ⛔ the lower two
thirds of the screen is empty; ⛔ no words on the screen say what to do, so the first round leans entirely on the wordless loop the
doors showed. The third answer's weight is worth a line of CSS in v1.1; the rest is art.

One more opened. **`p3-case-320x568`**: ⛔ one small rule in the top left of a large felt board, the collectible's near empty first
state again; ⛔ the felt sits close to the page's paper, so the case reads as a slightly darker rectangle; ⛔ go carries no word.
Accepted for v1 with the rest of the case's art. **`p3-same-reveal-320x568`** opened: the pair and the lit answer read well at
320, with the same two faults as at 375 (a lit answer that is also the child's own mark, and the measures wearing the same gold).

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
anchors dry checked, `plans/lane-c-plants/gauge-p1p3-plants.cjs`) are queued. **The first three are red, each on the law it
plants:**
```
c1 the larger lit before the hold     compare   FAIL  375x667 the choice stays marked and the larger is lit only after the answer, right or wrong: 1 {"during":1,...
d1 the child's rule in the title      code      FAIL  GA7: no letter code and no rule name anywhere in the text, attributes, classes or title through the whole run: letter Gauge L
z1 a rule node made on every draw     zoom      FAIL  375x667 the rules are never rebuilt: the same tick elements and [25,24] nodes from the first round to the last
```
- PLANT compare c1 (the larger lit before the hold): green run COMPARE OK, planted red — "the choice stays marked and the larger is lit only after the answer, right or wrong: 1 {during:1 ...}". The law sees a reveal that comes early.
- PLANT code d1 (the child’s rule in the title): green run OK, planted red twice — the letter code leaks into the text and into the settings panel. The law reads both surfaces.
- PLANT zoom z1 (a rule node made on every draw): green run OK, planted red — "the rules are never rebuilt: the same tick elements and [25,24] nodes from the first round to the last".
- PLANT same s1 (the choice lit, not the answer): green run SAME OK (after the gate learned to close the case), planted red — the wrong side stays lit after the answer.
- PLANT audio a1 (every detent one pitch): green run OK, planted red — "detent0 to detent3 measure 440 Hz, 440 Hz, 440 Hz, 440 Hz, each at least a semitone above the last". The ladder law hears a flat ladder.
- SHOT p3-zoom-open-375x667.png OPENED. Faults: (1) the heading asks for 0.5 while the line runs 0.2 to 0.3, so the number a child is told to place cannot go on the line it is given — either the heading or the ends are wrong, and this is the worst thing in any GAUGE shot so far; (2) the tile sits on top of the line’s left end, covering the 0.2 tick and crowding its label; (3) four bare chevrons (left, down, up, right) carry the whole control with no words, and up and down have no meaning on a horizontal line; (4) everything lives in the top third and the bottom two thirds are empty.
- SHOT p3-same-reveal-375x667.png OPENED. Faults: (1) one gold pill does two jobs — it marks the child’s choice and it marks the true answer — so after a wrong answer there is nothing to tell them apart; (2) the reveal says nothing in words, no yes and no same, only a colour; (3) go on is a bare arrow tucked into the right corner, off the reading line the two answers make; (4) the lower half of the screen is empty while 4.10 and 4.1 sit edge to edge at the top.
- SHOT p3-case-375x667.png OPENED. Faults: (1) one small ruler sits in the top left corner of a big tan case — the same disease as GAUGE’s case, NOTCH’s village, GLIMPSE’s journal and HUSH’s clearing: the first earned thing is dropped in the top left corner of a large empty board, so the first reward reads as a stain instead of a beginning. The collection views need a composition (the early places worked inward or centred) rather than a seeded scatter that starts in a corner.; (2) that ruler is about 56 by 28 pixels, too small to read as an instrument at all, it reads as a sticker; (3) the case fill and the page are close in value so the case reads as a panel, not a case; (4) the bottom third is empty.
- SHOT p3-compare-375x667.png OPENED. Reading it honestly: the two number cards are the two answers (tap the larger) and The same is the third, so the screen is not missing buttons. Faults: (1) nothing in words says to tap the larger — a child sees two numbers and one button and the obvious reading is that the button is the only answer offered; (2) the number cards carry exactly the gold border that marks a lit answer in the reveal shots, so the same styling means both a thing to press and a thing already chosen; (3) The same is a low bare pill under two big cards, so the three answers have two different weights; (4) the bottom two thirds of the screen are empty.
- CORRECTION to the p3-zoom-open entry above: I called the 0.5 ask on a 0.2 to 0.3 line a contradiction that needed the engine checked. It is not. The reveal shot (p3-zoom-reveal-375x667.png, opened) shows the zoom keeps a STACK of lines, the parent 0 to 1 above and the opened stretch below it, so the 0.2 to 0.3 line in the open shot is a zoom already in progress, and dealZoom only ever deals values the path can reach. The real fault the open shot shows is narrower and still stands: at that moment only one line was on screen with no parent above it, so a child who has zoomed the wrong way has nothing on the page to tell them where they are. ⛔ I overstated a fault from one frame without reading the next one; the ledger says so rather than quietly dropping it.
- SHOT p3-zoom-reveal-375x667.png OPENED. Faults: (1) the two lines are drawn identically, the same weight and the same ticks, so nothing says which is the whole and which is the piece opened out of it; (2) the opened line prints 0.5 and 0.6 crowded together under one tick pair while 0 and 1 sit at the ends, so four numbers on one line mean two different things; (3) the marker on the parent line is gold and the marker on the opened line is grey with nothing to say why; (4) the four chevrons still carry the whole control with no words, and go on sits far below in the right corner.
- SHOT p3-compare-reveal-375x667.png OPENED, and it answers the complaint made against the same reveal: here the true answer (0.7) is filled gold and the child’s wrong choice (0.2) wears a thick black outline, two different marks doing two different jobs. So GAUGE already knows how to do this in one mode and not the other; the same value reveal should borrow it. Faults that stand: (1) nothing says in words which mark means which, so the pair is still a code to guess; (2) The same still looks pressable after the answer, so the round reads as open; (3) that thick black outline means the child’s choice here while BRIM uses an identical outline for something else unexplained, so one mark carries different meanings across the catalog; (4) the bottom two thirds of the screen are empty.
- SHOT p3-doors-375x667.png OPENED. Best doors in the catalog so far, because all three carry words (Which is more, Zoom in, The same value) where NOTCH offers two wordless brown shapes. Faults: (1) the line above the doors is a small unlabelled rule with one gold tick and no numbers at either end, so the picture standing for the whole game says nothing a child can read; (2) the three doors wrap two then one with the last centred under the gap, so the block reads crooked; (3) the top third of the screen is empty above a line that floats with nothing around it; (4) all three doors carry identical weight, so nothing says which to try first.
- SHOT p3-same-reveal-320x568.png OPENED. NEW FAULT the layout gate does not catch: at 320 both number cards run right out to the screen edges, the left one flush against x=0 and the right one against the right edge, so the page has no side gutter at all at the narrowest size. The layout gate passes because it asks whether a thumb can reach every control, not whether anything is allowed to touch the edge. A gutter law (nothing within 16 px of either edge at 320) belongs in the catalog. Other faults as at 375: one mark does for both the choice and the truth, go on is a bare arrow in the corner, and the bottom half is empty.
- SHOT p3-zoom-open-1366x768.png OPENED. Faults: (1) the entire game occupies the top left quadrant of a 1366 by 768 screen and the bottom two thirds are empty, so on a laptop it reads as a page that failed to finish loading; (2) the number line is about 430 px wide on a 1366 px screen, small enough that the ticks crowd; (3) the tile still sits over the 0.2 tick and its label, as at 375; (4) the four chevrons and Put it here are in one row here but stacked differently at 375, so the control changes shape between sizes with nothing to say which is the true arrangement.
- HOLD on the edge gutter claim made against p3-same-reveal-320x568 above: the compare shot at the same width (p3-compare-320x568.png, opened) shows both cards with roughly 12 px of margin, not flush. The two shots are different states, so one of them may sit wider than the other, and I have been wrong four times tonight reading margins off pictures. Measuring both states at 320 now; the numbers go in the ledger whichever way they fall.
- SHOT p3-case-1366x768.png OPENED. Faults: (1) the one earned ruler sits in the top left corner of a 620 by 420 case with everything else empty, the corner disease at its worst on a wide screen; (2) the ruler is about 80 px wide on a 1366 px screen, small enough to read as a sticker rather than an instrument; (3) the case is a flat tan slab whose fill is close to the page in value, with a thin gold edge as its only definition; (4) roughly 370 px of empty page on each flank and 200 px below.
- SHOT p3-compare-reveal-320x568.png OPENED. The two marks survive the narrow size: the true 0.7 is filled gold and the chosen 0.2 wears the thick black outline, still the pattern the same value reveal needs. It also further undercuts my edge gutter claim: these cards carry roughly 24 px of margin at 320, nothing like flush. The measurement will settle which state, if any, actually touches the edge. Faults that stand: (1) no words say which mark means which; (2) The same still looks pressable after the answer; (3) go on is a bare arrow in the corner; (4) the bottom half of the screen is empty.
- EDGE GUTTERS AT 320, MEASURED (partly), and against me again: in the COMPARE state #left runs 12 to 154 and #right runs 166 to 308 in a 320 px viewport, so each carries a 12 px margin and NOTHING is flush. My claim that the cards run out to the screen edges is withdrawn for that state — sixth thing I have read wrong off a picture tonight. The SAME VALUE state is still UNMEASURED: #left and #right returned zeros there because that view uses different ids for its number cards, so I measured elements that were not on the screen. Finding the right ids and measuring again rather than letting a zero stand as an answer. What is measured and true: in same value the two answer buttons sit at 62 and 44 px from the edges, comfortably clear.
- SHOT p3-zoom-reveal-320x568.png OPENED. Faults: (1) the gold marker on the upper line stands near 0.12 while the grey marker on the lower line stands at 0.5, and nothing on the screen says which is the child’s placement and which is the truth, so two markers in two colours are a code to guess — the same fault as the same value reveal, in a mode that has room to say it plainly; (2) the two lines are drawn with identical weight, ticks and ends, so nothing says one is the whole and the other the stretch opened out of it; (3) 0.5 and 0.6 crowd together under adjacent ticks on the lower line while 0 and 1 sit at its ends, four numbers doing two different jobs on one rule; (4) the four chevrons still carry the control with no words, and go on is a bare arrow below everything.
- EDGE GUTTERS AT 320, MEASURED IN BOTH STATES, and this overturns my own withdrawal: SAME VALUE has #same-left at 0 to 154 and #same-right at 166 to 320, with #same-pair spanning the full 0 to 320, so BOTH number cards are FLUSH against the screen edges with no margin whatever. COMPARE has #left at 12 to 154 and #right at 166 to 308, a 12 px margin each side. My first reading of p3-same-reveal-320 was RIGHT; I withdrew it after measuring the COMPARE state, which is a different screen, and the withdrawal was the wrong call. Both states are now numbers rather than opinions. The layout gate passes either way because it asks whether a thumb can reach a control and whether the control is big enough, never whether anything is allowed to touch the edge. ⛔ the lesson is not "trust the picture" or "trust the measurement", it is MEASURE THE STATE THE CLAIM IS ABOUT: I measured the wrong screen and let a true report be struck out.
- NEXT for this: a gutter law in GAUGE’s layout gate (nothing a child reads or presses comes within 12 px of either edge at 320), watched red against the same value state as it stands, then the page fixed, then green. GAUGE is not live, so this is fixable before it ships.
- SHOT p3-doors-320x568.png OPENED. Still the best doors in the catalog at the narrow size: all three carry words and stack cleanly. Faults: (1) the rule above them is a bare line with one gold tick and no numbers at either end, so the picture standing for the game says nothing; (2) the three doors are three different widths, set by their text, so the column reads ragged; (3) the top third of the screen is empty above a line that floats; (4) nothing says which door to try first.
- GUTTER LAW WATCHED RED, and what it caught is not what I aimed it at: ALL 32 failures are one element, CORE’s settings gear (.lw-settings-open, 1310 to 1358 in 1366, so 8 px from the right edge), failing in all 8 states at all 4 sizes. NOT ONE failure names #same-pair, although I measured that spanning 0 to 320 at the narrow size minutes earlier. So the gate and my own measurement disagree about the exact thing the law was written to catch, and I am reconciling that with a measurement under the gate’s own conditions (reduced motion emulated, scrolled to the top, all four sizes) before changing either. ⛔ a law that goes red is not evidence it caught your fault; read WHICH element it named.
- THE GEAR IS A REAL FINDING EITHER WAY, and it belongs to CORE rather than to GAUGE: the settings gear sits 8 px from the right edge in every state of every size, and CORE is shared by all seven games in the catalog, so this is one decision affecting the whole fleet. Not changing CORE unilaterally in the middle of the night; recorded here for Stephen with the numbers.
- THE GUTTER LAW DID CATCH IT, and the error was mine again, in the instrument I used to READ the gate: "320x568 SAME VALUE answering: ... .lw-settings-open (264 to 312 in 320), #same-pair (0 to 320 in 320)". My grep cut every line at the first bracket, and the gear is listed before #same-pair on the same line, so I saw 32 gear failures and concluded the law had missed its target. It had not. The measurement under gate conditions agrees at every size: #same-pair spans 0 to 320 at the narrow size, 28 to 348 at 375, 46 to 366 at 412 and 523 to 843 at 1366, so only 320 is flush. ⛔ THIRD INSTRUMENT ERROR OF THE NIGHT AFTER THE ALIASED SAMPLING AND THE SINGLE COLUMN READ: when a gate’s output surprises you, read the RAW line before theorising about the gate.
- So GAUGE has a real fault with a law holding it: at 320 the two number cards run edge to edge. The fix belongs in the page (side padding on #same-pair at the narrow size) and GAUGE is not live, so it can be fixed before it ships. The gear at 8 px from the right edge remains a separate, fleet wide, CORE level finding for Stephen.
- SHOT p3-zoom-open-320x568.png OPENED. Faults: (1) the tile sits ON the 0.2 tick and overlaps its label at this width too; (2) the line runs 48 to 592 of 640 device pixels, so about 24 px of margin, but the four chevrons below start at 52 and the row is 480 px wide, leaving the control block noticeably narrower than the line it drives; (3) still no words on any of the four chevrons, and up and down have no meaning on a horizontal line; (4) everything sits in the top half with the bottom half empty.
- SHOT p3-same-reveal-1366x768.png OPENED. Faults: (1) one gold fill still does for both the child’s choice and the true answer, confirmed at every width now, while this game’s own compare reveal marks them differently; (2) go on sits to the RIGHT of the answer block and below it, aligned to nothing above it; (3) the whole game occupies a 440 px band at the top of a 1366 by 768 screen with about 78 per cent of the page empty; (4) the two number cards are 4.10 and 4.1 at 48 px while the answers beneath them are 18 px, so the numbers shout and the choices whisper.
- SHOT p3-case-320x568.png OPENED. Faults: (1) the one earned ruler is a 58 px sticker in the top left corner of the case, the corner disease at the narrowest width as well as the widest; (2) at this size the ruler is small enough that its tick marks merge into a dark smear, so the instrument cannot be recognised as an instrument; (3) the case is a flat tan slab with a thin gold edge and no interior at all, no shelf, no slots, nothing to say more will come; (4) the bottom third is empty below the play button.
- SHOT p3-compare-412x915.png OPENED. Faults: (1) the two number cards and the three answers occupy the top 500 px of a 915 px screen and the remaining 45 per cent is entirely empty, the emptiest screen in the catalog; (2) the number cards are 375 px wide and 220 px tall holding one short number each, so the numbers float in vast boxes; (3) The same is a small pill under two huge cards, three answers at two very different weights; (4) nothing says in words that the cards themselves are the other two answers.
- SHOT p3-zoom-reveal-412x915.png OPENED. The two stacked lines have the most room here of any width and still say the least. Faults: (1) the gold marker on the upper line and the grey marker on the lower one are never explained, so which is the child’s placement and which the truth stays a code to guess; (2) both lines carry identical weight, ticks and end labels, so nothing says one is the whole and the other the stretch opened out of it; (3) 0.5 and 0.6 crowd under adjacent ticks while 0 and 1 sit at the ends, four numbers doing two jobs on one rule; (4) the bottom 45 per cent of the screen is empty below a bare arrow.
- SHOT p3-doors-412x915.png OPENED. Three doors, all named, still the clearest doors in the catalog. Faults: (1) the rule above them is a bare line with one gold tick and no numbers at either end, so the picture standing for the whole game says nothing a child can read; (2) the three doors are three different widths set by their text, so the column reads ragged; (3) the top 60 per cent of the screen is empty above a line that floats with nothing around it; (4) nothing says which door to try first.
- SHOT p3-same-reveal-412x915.png OPENED. Faults: (1) one gold fill still does for both the child’s choice and the true answer at the tall size, the fourth width confirming it, while this game’s own compare reveal marks the two differently; (2) go on sits to the right of and below the answers, aligned to nothing; (3) the number cards are 4.10 and 4.1 at 48 px over answers at 18 px, so the numbers shout and the choices whisper; (4) the bottom 60 per cent of the screen is empty.
