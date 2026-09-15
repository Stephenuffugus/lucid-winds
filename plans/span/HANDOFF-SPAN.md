# HANDOFF SPAN, the build plan for the math catalog's first game

**Written:** 2026-09-15, by Opus (the builder), as step 1 of SPAN (`plans/math/CATALOG-PLAN.md` section 8), from three
inputs read whole: `assets/math-catalog/08-SPAN-handoff.md` (Stephen's delivery, read only), `plans/math/CATALOG-PLAN.md`
(Fable's plan over the catalog, which binds this file and wins over the handoff), and `plans/math/HANDOFF-CORE.md` (what
CORE now provides, built and deployed). Where this file and the handoff differ, every difference is in section 3.
**Game folder:** `satellites/span/` (free, checked 2026-09-15). **Live URL when listed:** `lucidwinds.com/satellites/span/`.
**Working title:** Span. The display name is Stephen's (CATALOG-PLAN call 4; the handoff offers TRUE).

---

## SESSION STATE (the builder updates this at the end of every session; the morning reader starts here)

- 2026-09-15, Opus: **P1 IS DONE.** `index.html`, `main.js`, `content.js`: Mode 2 on the canyon, stones by drag, a
  stack of five by long press, keys (arrows and Enter, digits nothing); while building the piers stand at one height and
  the stones sit as one labelled stone, the span seats when laid, then the piers move to their true heights with the
  shortfall shaded and a caption of fact; the same reveal and seat right or wrong. `test/play.mjs` is 44 laws in the
  foreground, every one watched red (17 plant groups, section 13); `tools/check.js` is lint, engine, play, ALL GATES
  PASSED. The shots found four faults the gate had not (the truth before the lay, a backwards tilt, no seat, a lay glyph
  like minus); each is now a law. Carried to P3 from the shots: classroom scale at 1366, the supply's drag affordance and
  the stones' look (sprites), the mason in the loop.
  **Next action:** P2 (section 5), the gate first: `test/play.mjs` gains Mode 1 TRUE OR NOT (a true item and a near miss
  played through the page, the page's verdict held to `evaluate`, the same reveal), Mode 3 RELATIONAL with labelled
  blocks (a slab is 10 and a block is 100, the numeral on each, a three digit side built without 345 stones), and the
  run's next mode read from the config; then `test/audio.mjs` in CORE's ear gate shape for the seat (one sound per event,
  a long press of five plays one); then the viaduct through `collectOnce`, one arch per completed run.
- 2026-09-15, Opus: **P0 IS DONE.** `satellites/span/engine.js` (pure; every equation built from its value outward;
  kinds in blocks of five for S1; all nine positions for S2; S3, S4, S6; the first item), `test/engine.mjs` (the
  handoff's test gates 1 to 6 as laws on 20 seeds, read off the terms, never the engine's labels), `STAMP.js`
  (`20260915a`), `tools/lint.mjs` (nine laws, S5 and S7 among them) and `tools/check.js`: lint and engine, ALL GATES
  PASSED. All eleven engine plants and all fourteen lint plants red, and the lint's green case (answer in code, not
  copy) clean. Decided in `docs/DECISIONS.md`: standard is a layout, a near miss is sides one apart, nothing negative.
  **Next action:** P1 (section 5). The gate first, `test/play.mjs` in the foreground: the page boots at four sizes with
  nothing on the console and nothing fetched after load; a Mode 2 round played by real drags (stones to a pier, a long
  press for five, the span laid); the pier reveal read off the page (both piers at their true heights from
  `engine.js`'s values, the shortfall shaded, the same animation right or wrong, a caption that is a fact); the seam,
  the page's scored result equal to `evaluate` for the same seed and fills. Then `index.html`, `main.js`,
  `content.js` and the canyon, piers, span and seat animation, in that order, the seat first (handoff step 1).
- 2026-09-15, Opus: plan written, committed as 74e9be20.

---

## 0. RULES OF ENGAGEMENT

1. **The fence.** `satellites/span/**`, this file, and `satellites/math/config/schemas.js` (SPAN's entry only, replacing
   the draft when SPAN ships). CORE (`satellites/math/core/**`) is read only from here: a fix CORE needs is a CORE change,
   made under CORE's plan with CORE's gates, and it bumps SPAN's stamp (HANDOFF-CORE 3.11). Read only as ever:
   `assets/math-catalog/**`, `plans/math/CATALOG-PLAN.md`, every other satellite, `scripts/`, `music-unlocks.js`.
   **The arcade row is not in this fence**: the lane C fence allows a game's existing portal row and its two `?v=`, and
   SPAN has no row yet. Adding it is Fable's, from the listing line in section 8.
2. **Git.** Stage by path (`git add satellites/span plans/span/HANDOFF-SPAN.md`), never `-A`. Commit and push the moment
   something is green. Deploy is `git push origin add-sproing-jumper:main` after `git log HEAD..origin/main` is empty,
   then a probe of the served page with a random query.
3. **The laws.** The fleet's (HANDOFF-OPUS-SEP15 section 6), CORE's G1 to G13, the reveal contract, and SPAN's own S1 to
   S8 (section 1 of the handoff, restated in section 4 here). No dash and no exclamation point in anything a child or
   a teacher reads; "Sky Wolf Studio", singular; 56 px targets for stones and piers (the young, CATALOG-PLAN D4), 48 px
   for everything else; text 0.7 rem or larger, measured; the engine pure; a count is a law proved on 20 seeds.
4. **Browser gates run in the foreground, one per call, under the lock** (the background task runner stopped three long
   gate runs on this box for memory; HANDOFF-CORE section 13).
5. **Never wait on a human.** Section 10 lists what is Stephen's and the default the build takes meanwhile.

---

## 1. WHAT SPAN IS, AND WHY IT GOES FIRST

A child is given `8 + 4 = __ + 5`. In the study the handoff cites, all 145 sixth graders answered 12 or 17: they read
`=` as "do the sum and write the result here". The relational reading, that both sides have the same value, is what
algebra needs, and it does not arrive by itself. Combined practice on standard and nonstandard equations fixes it in
two randomized trials. SPAN is that practice, as two stone piers across a canyon: the span lies flat only when the piers
match, and a child who puts 12 in the blank watches a pier of 17 stand over a pier of 12. Nobody has to say "wrong".

It goes first because it is the lightest engineering in the catalog (static geometry, one animation at a time) and it
proves CORE end to end: the reveal, the tier ladder, audio, the store, the session, the collectible, the teacher's link.

---

## 2. STATE OF THE INHERITANCE (verified 2026-09-15; copy or import these, do not reinvent them)

| Need | From | What to take |
|---|---|---|
| The reveal (the child's answer first, the truth beside it, same animation on every path, a fact for a caption) | `satellites/math/core/core.js` line 309, `reveal.show({ container, geom, learner, truth, caption, onTruth, onDone })` | SPAN's pier reveal is its own drawing, but it keeps the contract's six rules and hangs its one sound on `onTruth` |
| The copy | `core.js` line 38, `COPY` (`nearPrefix` line 50, `isHere` line 51) | SPAN adds its own words in its own `COPY`, read by its lint the same way |
| The tier ladder | `satellites/math/core/pure.js` line 58, `adaptTier(history, { tiers, up, down, floor })` | Mode 2's difficulty (operand size); silent, never rendered |
| Audio | `core.js` line 374, `audio.define / play / setMuted / renderLoud` | The seat sound (a deep stone with real bass weight, handoff step 9), one per event |
| Store and settings | `core.js` line 63 `store`, line 110 `settings.mount`, line 108 `SETTINGS_DEFAULTS` | One record under `lw:span:save`, `migrate` (pure.js line 37) for the schema step |
| Session and collectible | `pure.js` line 159 `sessionStep`, line 148 `collectOnce` | One viaduct arch per completed run, never a duplicate |
| The teacher's link | `pure.js` line 203 `parseConfig`, line 181 `buildQuery`; `satellites/math/config/schemas.js` | SPAN's page parses its schema; SPAN registers the same schema for the builder |
| Tokens, CSS, the stage | `core.js` line 18 `TOKENS`, line 29 `tokens.inject`; `satellites/math/core/core.css` | The palette injected per game; tabular lining numerals are already on `html` |
| Sprites | `core.js` line 478 `sprite.draw`; `satellites/math/core/tools/sheet.mjs` | SPAN's `sprites.js` (a 16 colour palette and string grids), its sheet opened before it is called art |
| The seeded rng | `pure.js` line 15 `rng(seed)` | Every generator takes an rng; nothing in `engine.js` touches `Math.random` |
| Gate harness and shared assertions | `satellites/math/core/test/harness.mjs`, `satellites/math/core/test/shared.mjs` | `open` at four sizes, `centre`, `tap`; `assertNoNetworkAfterLoad`, `assertNoGetUserMedia`, `assertForbiddenStrings` (with SPAN's words), `assertKeyboardCompletable`, `assertTabularNumerals` |
| Gate runner and lint shape | `satellites/math/core/tools/check.js`, `satellites/math/core/tools/lint.mjs` | Copied and pointed at `satellites/span/`; the lint's one stamp is SPAN's |
| Service worker | `satellites/fathom/sw.js` lines 1 to 16 (the host law in its header) | `span-*` caches only; precaches `../math/core/*.js?v=` with SPAN's stamp (CATALOG-PLAN D2) |

Not inherited, on purpose: `music-unlocks.js` (CATALOG-PLAN D3), a number pad of any kind (S5), and the demo's number line
(SPAN has no line; its geometry is two piers).

---

## 3. CORRECTIONS TO THE HANDOFF (binding)

3.1 **The catalog's corrections apply** (CATALOG-PLAN section 2): Sky Wolf Studio; no dash in any caption; RESONARC does
not exist (CORE's `audio` is used); the design spec was not delivered, v1 is built from the handoff.

3.2 **S1 is asserted as the handoff's test gate states it, on 20 seeds**: across 500 generated sets the standard share is
38 to 42 percent and never more than 3 in a row of either kind. The invariant's "about 40/60" is the same rule.

3.3 **S7's language rules are a lint over SPAN's copy only.** CORE's `assertForbiddenStrings(folder, ['answer', 'solve',
'equals'])` matches a game's own words in what a child reads (page text and string literals, comments stripped), which is
the handoff's "user facing strings". The engine may call a field `answer`; a caption may not say it. "Equals" is refused
in copy entirely, because the handoff forbids it as the sign's name and SPAN has no other use for it.

3.4 **No number pad, and no keyboard digits either** (S5). The keyboard path is the handoff's own: `left` and `right`
choose a pier, `up` and `down` add or remove a stone, `Enter` lays the span. Typing a digit does nothing.

3.5 **The equals sign screener is P3, not v1.1.** CATALOG-PLAN section 1 gives CAIRN's slot to it: Mode 1, ten items,
three minutes, whole class, no login, at `satellites/span/screen/`. Its result is shown to the teacher on the device and
nowhere else (G1, G2).

3.6 **The `?standard=0` teacher override is not built** (the handoff asks Stephen; the smallest choice keeps S1 whole,
as the config builder's draft already does). Mode 3's grade 6 extension with a letter is not built (asked of Stephen).

3.7 **Mode 4 SAY IT DIFFERENTLY and Mode 5 BUILD BOTH SIDES stay v1.1**, as the handoff scopes them. v1 is Modes 1, 2, 3,
the pier reveal, the viaduct, the screener.

3.8 **Large values use labelled blocks** (handoff step 6): a stone is 1, a slab is 10, a block is 100, each drawn with its
numeral on it (the numeral always visible, G8's wordless play still holds because the quantity is on the object). Mode 3
operands of three digits are built from blocks, never 345 stones.

---

## 4. ARCHITECTURE LAW

```
satellites/span/
├── index.html          the shell; loads ../math/core/core.css and ./main.js, both ?v=<SPAN's stamp>
├── main.js             the page: canyon, piers, stones, the reveal, modes, input; imports ../math/core/core.js?v=
├── engine.js           PURE: EQUATION_FORMS, evaluate, generateEquation, generateSet, generateRelationalPair, scoring
├── content.js          the words (COPY) and the palette
├── sprites.js          PALETTE (16) and SPRITES (stone, slab, block, pier cap, mason, arch pieces)
├── screen/index.html   the equals sign screener (P3)
├── sw.js  manifest.webmanifest  icon-192.png  icon-512.png  icon-maskable-512.png
├── test/   engine.mjs (node), boot.mjs, play.mjs, layout.mjs, audio.mjs, screener.mjs (browser)
├── tools/  check.js  lint.mjs  shots.mjs  sheet.mjs (a wrapper over CORE's)
└── docs/   DECISIONS.md  shots/
```

**The engine (the sim).** `Equation = { mode, left: [terms], right: [terms], form, isStandard, truth, nearMiss }` as the
handoff's section 4. `EQUATION_FORMS` holds the nine blank positions of the handoff's section 2 plus `standard`.
`evaluate(equation, fill)` returns whether the two sides are the same value with `fill` in the blank, and handles the
blank as a subtrahend. `generateSet(rng, { mode, size })` builds a run obeying S1 to S4 and S6. Pure: no `document`,
`window`, `Date`, `performance`, `Math.random`; SPAN's lint refuses them as CORE's does.

**The seam.** The browser gate taps a whole round through the real page and asserts the page's scored result for each
item equals `engine.js`'s for the same seed and the same fills.

---

## 5. THE PHASES, WITH GATES (the handoff's section 6 test gates mapped one to one)

Every gate is watched to fail once by a planted fault before it counts, and both lines go in section 13.

### P0. The engine and the laws (about 2 hours)
1. `test/engine.mjs` red with no `engine.js`, then:
   - `evaluate` correct for all nine forms, including subtraction with the blank in the subtrahend (handoff gate 6)
   - standard to nonstandard 38 to 42 percent across 500 generated sets, never more than 3 in a row of a kind, on 20
     seeds (gate 1, S1)
   - all nine blank positions in any 50 item Mode 2 set, none over 20 percent, on 20 seeds (gate 2, S2)
   - at least 60 percent of nonstandard form Mode 1 items true (gate 3, S3)
   - near miss false items at least 25 percent of all false items (gate 4, S4)
   - Mode 3 operands at least 3 digits at stage 2 and up, the two sides differing by at most 3 (gate 5, S6)
   - the first item is `3 + __ = 5` and the second is nonstandard (handoff section 7)
2. `tools/lint.mjs` (CORE's, pointed here): one stamp on every import including `../math/core/core.js?v=`, the engine
   pure, no number pad element and no `inputmode="numeric"` anywhere (gate 9, S5), the language words through
   `assertForbiddenStrings` (gate 7, S7), dashes and exclamation points, dupkeys.

### P1. The canyon, Mode 2 THE BLANK, the pier reveal (about 3 hours)
- The canyon, piers and span renderer, and the **seat animation** built first (handoff step 1: the stone drops the last
  inch, dust lifts, the structure takes the load).
- Mode 2: stones dragged to a pier (56 px), a long press yields a stack of five, the span laid when the child says so.
- The pier reveal: both piers at their true heights, the shortfall shaded, the same animation right or wrong, a caption
  that is a fact. Gate (handoff gate 8): the reveal renders the correct heights for every form, including a response
  that makes one side wildly larger, read off the page against `engine.js`.
- `test/play.mjs`: a whole Mode 2 run by real drags; the seam against the engine.

### P2. Mode 1 TRUE OR NOT, Mode 3 RELATIONAL, audio, the viaduct (about 3 hours)
- Mode 1 with near miss items; Mode 3 with labelled blocks.
- The seat sound through CORE's `audio`, one per event; `test/audio.mjs` (CORE's ear gate shape).
- The viaduct: one arch per completed run through `collectOnce`, about 30 assembling into a viaduct into haze.

### P3. The screener, the teacher's link, accessibility and the copy audit (about 2 hours)
- `screen/`: Mode 1, ten items, three minutes, a result on the device for the teacher; `test/screener.mjs`.
- SPAN's real schema in `satellites/math/config/schemas.js`, replacing the draft; `parseConfig` on SPAN's page.
- Keyboard complete (gate 10): `left`/`right` a pier, `up`/`down` a stone, `Enter` the span, through
  `assertKeyboardCompletable` at 1366x768.
- `test/layout.mjs` at 320x568, 375x667, 412x915 and 1366x768: 56 px stones and piers, 48 px controls, measured font,
  no sideways scroll, `assertTabularNumerals`, `assertNoNetworkAfterLoad`.
- `sw.js`, the manifest, icons; the sprite sheet opened with three faults named.

**SPAN v1 is done** when `tools/check.js` prints ALL GATES PASSED under the lock, every gate has a red line in section 13,
every new shot is opened with three faults named, it is deployed and the served page probed, and the listing line is
in section 8 for Fable.

---

## 6. THE SCREENS (portrait by thumb at three widths, landscape by keyboard at 1366x768)

- **First run:** the handoff's wordless five second loop (two uneven piers, a span tilting and sliding off, a stone
  added, the span settling, a mason crossing), then a tap to start. No text.
- **Play:** the equation across the top in large tabular numerals, the canyon and the two piers under it, the stone
  supply at the bottom within a thumb's reach, the settings gear top right (CORE's).
- **The reveal:** the two piers at their true heights side by side, the shortfall shaded, the caption a fact.
- **The viaduct:** the arches earned so far, receding into haze.
- **The screener:** one item at a time for the class, a result for the teacher at the end.

---

## 7. ART

Code drawn pixel sprites through CORE's `sprite.draw` (CATALOG-PLAN section 5): stone, slab, block, pier caps, the
mason (a walk of four frames), arch pieces, the canyon's far wall, dust. `tools/sheet.mjs` renders the table on the
canyon's own light and dark, and the sheet is opened with three faults named before it is called art. Painted sheets are
Stephen's, later, through Midjourney; the game ships without them.

---

## 8. LISTING (the line for Fable's portal row)

"Two stone piers across a canyon and a span that only lies flat when both sides are the same, a free equals sign game
with no login." (One sentence, no dash. `cat:"math"`, In Development.)

---

## 9. PITFALLS

- The blank after the `=` because it is the natural layout: that is the defect S2 exists to fix.
- Most nonstandard items false because they look wrong: backwards, the heuristic must break (S3).
- Round numbers in Mode 3: if a child can compute it, the mode has failed (S6).
- A number pad, or digits on the keyboard, for large values: labelled blocks (S5).
- "Enter the answer" in any caption, settings line or store listing (S7).
- An ES module import without SPAN's stamp: a stale CORE served to a fresh SPAN.
- A CORE change without a SPAN stamp bump (HANDOFF-CORE 3.11).
- From CORE's own ledger: a gate that counts too early, a recorder that stops before it can see, exact equality from a
  renderer, and a triple click that selects nothing. Measure after a quiet window, sample after the end, hold a float
  to a tolerance, select with Ctrl+A.

---

## 10. DECISION RIGHTS AND OPEN QUESTIONS (the handoff's "Ask Stephen, don't decide", with the default meanwhile)

| Question | Default the build takes |
|---|---|
| Final name (SPAN or TRUE) | Span, the working title (CATALOG-PLAN call 4) |
| Whether Mode 1 ships as a standalone class diagnostic | Yes, as `satellites/span/screen/` (CATALOG-PLAN section 1 gives CAIRN's slot to it) |
| Whether Mode 3 gets a grade 6 extension with a letter | Not built |
| Whether the `?standard=0` teacher override stays available | Not built; S1 holds |
| Where the catalog lives for schools | `satellites/` (CATALOG-PLAN call 5) |

---

## 11. STEPHEN ONLY

- The four questions above, and SPAN's display name.
- A child in front of SPAN for ten minutes (INDEX section 10: the one event that would retune every table at once).
- 60 fps on a real school Chromebook (HANDOFF-CORE 3.5).

---

## 12. HONEST SIZING

About 10 hours of building (P0 2, P1 3, P2 3, P3 2), which is the catalog plan's one day, on two cores with every
browser gate in the foreground under the lock. Where a session stops well: after P1, when Mode 2 and the reveal work,
because that is the intervention; Modes 1 and 3 and the screener extend it.

---

## 13. EVIDENCE LEDGER (fill in place, with commands and their real output, most recent last)

### P0 step 1, the engine's laws first (2026-09-15)

`satellites/span/package.json` (`"type": "module"`, force added past the root `.gitignore` as CORE's was) and
`satellites/span/test/engine.mjs`: the handoff's test gates 1 to 6 as laws on 20 seeds, every one recomputing form,
sides, truth and near miss from the terms rather than reading the engine's labels, plus the first item, nothing
negative, and determinism. Run with no engine:
```
$ cd satellites/span && node test/engine.mjs
  FAIL  engine.js loads as an ES module (Cannot find module '/workspaces/lucid-winds/satellites/span/engine.js' imported from /workspaces/lucid-winds/satellites/span/test/engine.mjs)
1 ENGINE FAILURE(S)
exit 1
```
Then `satellites/span/engine.js`: every equation built from its value outward (nothing negative), kinds laid in blocks of
five (three nonstandard, two standard) so each set is exactly 40 percent standard with no run past three, Mode 2's
forms cycled so all nine positions appear, Mode 1 three quarters true among nonstandard items with half its false items
one apart, Mode 3 at three digits with a pair across the sign 1 to 3 apart, and the first item `3 + __ = 5`. Live:
```
  ok    evaluate is right for every form it is given (1000 items, 0 wrong, 164 with the blank in the subtrahend)
  ok    every one of 500 sets is 38 to 42 percent standard equations (0 outside)
  ok    and none has more than 3 of one kind in a row (0 sets do)
  ok    every 50 item Mode 2 set has all nine blank positions (0 sets miss one)
  ok    and no position is more than 20 percent of a set (0)
  ok    at least 60 percent of nonstandard Mode 1 items are true, on every seed (lowest 75)
  ok    and near misses, sides one apart, are at least a quarter of the false ones (lowest 57)
  ok    every Mode 3 number at stage 2 has at least three digits (0 of 400 items do not)
  ok    and each item pairs two numbers across the sign at most 3 apart (0 do not)
  ok    the first item is 3 + __ = 5 (a+_=c)
  ok    and the second is nonstandard (a=c-_)
  ok    no number and no blank is ever negative (0)
  ok    the same seed gives the same set and another seed another
ENGINE OK
```
A dead helper left in the kind sequencer was removed and the gate rerun: `ENGINE OK`.
**Watched red**, eleven folder copies with one change each to `engine.js` (session scratch `span-engine-mutants.cjs`):
```
e01 subtraction read as addition          FAIL evaluate is right for every form it is given (1000 items, 304 wrong ...)
e02 kinds drawn at random                 FAIL ... 38 to 42 percent standard (423 outside); FAIL ... more than 3 of one kind in a row (432 sets do); FAIL and the second is nonstandard (a+_=c)
e03 a=c-_ dropped from the pool           FAIL every 50 item Mode 2 set has all nine blank positions (20 sets miss one: a=c-_)
e04 the two subtraction positions not required  FAIL ... all nine blank positions (20 sets miss one: a-_=c, _-b=c)
e05 40 percent of nonstandard items true  FAIL at least 60 percent of nonstandard Mode 1 items are true, on every seed (lowest 42)
e06 no near misses                        FAIL and near misses, sides one apart, are at least a quarter of the false ones (lowest 0)
e07 Mode 3 at two digits                  FAIL every Mode 3 number at stage 2 has at least three digits (400 of 400 items do not)
e08 Mode 3's pair 7 to 12 apart           FAIL and each item pairs two numbers across the sign at most 3 apart (400 do not)
e09 the first item skipped                FAIL the first item is 3 + __ = 5 (_-b=c)
e10 false items lowered, not raised       FAIL no number and no blank is ever negative (11)
e11 a shuffle on Math.random              FAIL the same seed gives the same set and another seed another
```
Every plant is red on the law it names and on nothing unexpected (e02's extra red on the second item is the same fault:
with no block rule the first two kinds are left to chance). Committed as `ab82ae7d`, `package.json` force added.

### P0 step 2, the lint and the runner (2026-09-15)

`satellites/span/STAMP.js` (`20260915a`), `satellites/span/tools/lint.mjs` (nine laws, shape from CORE's lint, the word
and camera laws through CORE's shared assertions) and `satellites/span/tools/check.js` (lint, engine). On the live tree:
```
  ok    STAMP.js names SPAN's one stamp: 20260915a
  ok    engine.js touches no screen, clock or unseeded die
  ok    no number pad of any kind: no number field, no numeric keyboard, no digit key (S5)
  ok    none of the catalog's forbidden words anywhere, and no answer, solve or equals in copy (S7) (none of 8 words in .../satellites/span)
  ok    getUserMedia appears nowhere a browser loads (G4)
LINT OK
lint pass, engine pass: ALL GATES PASSED
```
**Watched red**, each a folder copy of SPAN with CORE and the shared dupkeys beside it (session scratch
`span-lint-mutants.cjs`):
```
l01 a syntax error in engine.js          FAIL every runtime module parses as an ES module: engine.js: SyntaxError: Unexpected token ';'
l02 a runtime extra.mjs                   FAIL nothing a browser loads is a .mjs: extra.mjs
l03 CORE imported with no stamp           FAIL every relative import and local asset carries ?v=20260915a: main.js loads ../math/core/core.js
l03 CORE imported with a stale stamp      FAIL ... main.js loads ../math/core/core.js?v=20260101a
l04 Date in the engine                    FAIL engine.js touches no screen, clock or unseeded die: it names Date
l05 a number field                        FAIL no number pad of any kind ... (S5): index.html has a number field
l05 a numeric keyboard                    FAIL ... index.html asks for a numeric keyboard
l05 a digit key handled                   FAIL ... main.js handles a digit key
l06 "play and get smarter" on a page      FAIL none of the catalog's forbidden words anywhere ... (index.html says smarter)
l06 "Find the answer" in COPY             FAIL ... no answer, solve or equals in copy (S7) (content.js shows answer)
l06 answer in a comment and a variable    LINT OK   (the green case: a game's words are matched in copy, not code)
l07 a dash, a bang and Sky Walk in COPY   FAIL no dash ...: "close — it is here"; FAIL and no exclamation point: "Well done!"; FAIL ... singular: "Sky Walk Studio"
l07 a sentence written to textContent     FAIL and no sentence is written to the page from outside COPY: main.js: "Try it again"
l08 getUserMedia                          FAIL getUserMedia appears nowhere a browser loads (G4) (getUserMedia in main.js)
l09 COPY.near twice across lines          FAIL no object literal declares the same key twice: content.js COPY.near on lines 2 and 3
```
Committed as `f25984dd`. **P0 is done.**

### P1, the canyon, Mode 2 and the pier reveal: the gate first (2026-09-15)

`satellites/span/test/play.mjs` (boot, targets and the no network window at three widths; the first item term for term;
stones by drag and a stack of five by long press; the reveal's piers, shortfall, span and caption held to `engine.js`'s
values in Node; the seam; the same reveal right and wrong with no colour difference; keyboard play at 1366x768 with a
digit key doing nothing), in `tools/check.js`, run in the foreground under the lock before any page existed:
```
TimeoutError: Waiting failed: 30000ms exceeded     (no page at /span/index.html, so window.SPAN never became ready)
play exit 1
```

### P1, the page, its shots, and what the shots found that the gate did not (2026-09-15)

`satellites/span/index.html`, `main.js` and `content.js`: the equation from the engine's first item, the canyon, two
piers, the stone supply, the lay control, the reveal, the seat sound. First run: `PLAY OK`. **Watched red**, ten folder
copies (session scratch `span-play-mutants-a.cjs`, `-b.cjs`): nine red on the laws they named; **B2, the span turned
green on a right round, stayed `PLAY OK`**, because the colour set on round 1 was never cleared and both reveal
snapshots carried it. The colour law now also holds both reveals to the canyon before any span was laid; B2 again:
`FAIL 375x667 and no colour in the canyon differs between them, or from the canyon before any span was laid`.

**Then the shots, opened, and they showed what fourteen green laws had not:**
1. the piers grew to their true heights with every stone and the span lay flat on them before the child laid it: the
   truth before the mark, against the reveal contract's rules 1 and 2 (the build shot of `3 + 2 = 5` already level);
2. the span on `5 + 6 = 5 + 8` rose over the lower pier and sank into the taller one: the tilt flag right, the drawing
   backwards, turned about its middle;
3. no seat animation at all, though P1's first bullet (handoff step 1) is the seat;
4. the lay control was a line glyph that reads as minus; the keyboard's chosen pier was invisible at 1366; the canyon was
   a 280 px strip on every screen; the first run loop had no slide, no stone and sank its span 5 px into the short pier.

Six laws were added to `test/play.mjs` (laws 9 to 12 in its header) and run on the unfixed page:
```
  FAIL  375x667 a stone put on the pier drops the last inch and dust lifts, then all is still (lift 0.0 px, 0 dust, ...)
  FAIL  375x667 while a child builds, both piers stand at one height no stone changes (136/210, 173/210, 210/210, 210/159, 181/210)
  FAIL  375x667 and no span is shown before it is laid (shown, shown, shown, shown, shown)
  FAIL  375x667 round 2: and as drawn the span rests on the taller pier and dips toward the lower one without sinking into it (ends 60.7 and 79.3, pier tops 98.6 and 70.0)
  FAIL  375x667 round 1: the laid span drops the last inch and dust lifts, then all is still (lift 0.0 px, 0 dust, ...)
  FAIL  375x667 round 2: the laid span drops the last inch and dust lifts, then all is still (lift 0.0 px, 0 dust, ...)
6 PLAY FAILURE(S)
```
The fix (`docs/DECISIONS.md`, five new entries): piers at one neutral height while building, the stones as one labelled
stone on the blank's pier, no span until laid; on the lay the span seats (the last inch in 200 ms, dust for 550), then
the piers move to their true heights, the shortfall shaded between their tops as they go; the span turns about its end
on the taller pier and dips at most 4 degrees, never into the lower pier; the unit is chosen after the caption is
written; the canyon 280 to 420 px tall; the chosen pier outlined only under keyboard focus; the lay control a slab over
two blocks; the loop redrawn. A second look found the lay control still looking ready after a lay, the icon reading as
pi, the pier tops on the horizon line, and two shots taken mid dust: the neutral height moved to two thirds, the icon
redrawn, a law added (`once the span is laid the lay control looks unavailable`), the shots taken after the seat.

Live, in the foreground under the lock, 44 laws:
```
  ok    375x667 a stone put on the pier drops the last inch and dust lifts, then all is still (lift -14.0 px, 8 dust, then 0.0 px with 0 dust left)
  ok    375x667 round 1: both piers stand at their true heights (264 and 264 px for 5 and 5)
  ok    375x667 round 1: and as drawn both ends of the span rest on the piers (ends 70.0 and 70.0, pier tops 69.5 and 69.5)
  ok    375x667 round 1: and the caption sits clear of the span and the piers (21.0 px)
  ok    375x667 while a child builds, both piers stand at one height no stone changes (184/184, 184/184, 184/184, 184/184, 184/184)
  ok    375x667 and no span is shown before it is laid (none, none, none, none, none)
  ok    375x667 round 2: both piers stand at their true heights (227 and 264 px for 11 and 13)
  ok    375x667 round 2: and as drawn the span rests on the taller pier and dips toward the lower one without sinking into it (ends 88.6 and 70.0, pier tops 106.4 and 69.5)
  ok    375x667 a right round and a wrong round run the same reveal and the same seat (largest difference 0.022 of full scale, 183 comparisons)
  ok    375x667 and no colour in the canyon differs between them, or from the canyon before any span was laid
  ok    1366x768 keyboard two presses of arrow up put two stones in, and the digit 7 put in nothing (S5) ({"item":0,"fill":2,...})
PLAY OK
```
**Watched red on the page as it now stands**, seventeen folder copies (session scratch `span-play-plants-p1.cjs`), the
earlier ten re-planted against the rewritten `main.js` and seven new:
```
A1 terms shifted, a stack of four, a 700 px canyon  FAIL first item term for term; FAIL long press five (4); FAIL no sideways scroll at 320, 375, 412
A2 stones uncounted, shortfall halved      FAIL counts in the blank (0, then 0); FAIL the stone seat (0 dust); FAIL shortfall is the difference, both rounds
A3 piers at nine tenths                    FAIL both piers stand at their true heights (240 and 240 px for 5 and 5); FAIL round 2 heights and shortfall
A4 tilt flag backwards, verdict flipped, a console error  FAIL tilted toward the lower side (tilt 1); FAIL as drawn; FAIL the engine's evaluate; FAIL console at all four sizes
A5 "Right." and "Wrong." in the caption    FAIL the caption is a fact, both rounds; FAIL the caption sits clear (-8.0 px, the longer caption wrapped)
B1 wrong rounds reveal three times faster  FAIL the same reveal and the same seat (largest difference 0.651 of full scale)
B2 the span green when the sides match     FAIL no colour in the canyon differs ... or from the canyon before any span was laid
B3 40 px targets and a fetch after load    FAIL start, supply, lay and next targets; FAIL nothing is fetched after load, at 320, 375, 412
B4 the digit 7 adds seven                  FAIL ... and the digit 7 put in nothing (S5) (fill 9)
B5 Enter does not lay                      FAIL a span is laid by keys alone; FAIL the keyboard fill (null)
C1 piers at true heights while building, no stone seat  FAIL one height no stone changes (168/264, 216/264, ...); FAIL the stone seat (lift 0.0)
C2 the span shown before the lay, no room for the caption  FAIL no span is shown before it is laid (shown, shown, shown, none, none); FAIL the caption sits clear (-29.0 px), both rounds
C3 the laid span does not seat, turns about its middle  FAIL as drawn (ends 79.3 and 60.7); FAIL the laid span seat, both rounds (lift 0.0 px)
C4 dust never cleared                      FAIL the stone seat (8 dust left); FAIL the span seat, both rounds (24, 40 left); FAIL the colour law
C5 rotation backwards                      FAIL as drawn (ends 51.4 and 70.0, pier tops 106.4 and 69.5); FAIL the caption sits clear (2.4 px)
C6 a twelve degree dip                     FAIL as drawn ... without sinking into it (ends 125.4 and 69.8, pier tops 106.4 and 69.5)
C7 the lay control left looking ready      FAIL once the span is laid the lay control looks unavailable (opacity 1)
```
Every plant red on the law it names; the extra reds are the same fault seen from a second law.

**The shots**, `satellites/span/docs/shots/`, all under 40 KB, opened, three faults each:
- `p1-first-375-slide`, `-stone`, `-flat` (the loop at 1.2, 2.0 and 3.6 s): the span's slide off reads as a fade more than
  a fall; at 51 percent the stone vanishes and the short pier jumps 24 px in one frame, a pop rather than a seat; the loop
  is 240 by 140 in a first screen two thirds empty, and has no mason (P3's sprites).
- `p1-build-375`: the stones sit as one stone the same colour and edge as the pier, so they read as a cap, not as stones
  the child brought; the numeral on it is small for the stone; the band under the controls is empty.
- `p1-reveal-same-375` and `-320`: the stone supply is an unmarked grey slab with nothing saying it can be dragged; the
  next arrow is small inside its 56 px button; the piers nearly fill the sky, so the scene has little canyon left.
- `p1-reveal-apart-375` and `-320`: the span's low end hangs over the shaded shortfall with nothing under it; the shade is a
  rectangle and the span crosses it on a slant, two lines saying one thing; the caption at 320 has 13 px each side, and a
  two digit subtraction caption will wrap (the room rule holds the span clear of it, the gate proves that on this seed).
- `p1-keyboard-1366`: the dashed outline of the chosen pier runs between the pier and the stones on it; the equation and
  controls are phone sized on a classroom screen; the 560 px column leaves 800 px of empty paper (P3 layout, four sizes).

`tools/check.js` in the foreground under the lock: `lint pass, engine pass, play pass, ALL GATES PASSED`. Committed as
`ce51421b`, `git log HEAD..origin/main` empty, deployed by `git push origin add-sproing-jumper:main`. **Served**, with a
random probe: `lucidwinds.com/satellites/span/index.html?probe=429726617` carries `main.js?v=20260915a` and
`<div id="stack" hidden>` once; the served `main.js` carries the neutral height line once; `main.js`, `engine.js` and
`../math/core/core.js` each `200 application/javascript`. SPAN has no portal row (section 0 rule 1).

---

## 14. THE OVERNIGHT PROTOCOL

HANDOFF-OPUS-SEP15 prompt: never wait on a human; an ambiguity is the smallest reasonable choice logged in
`satellites/span/docs/DECISIONS.md`; a gate red after three honest attempts goes into SESSION STATE as BLOCKED with its
last thirty lines; never weaken, skip or delete a gate; commit and push the moment something is green.

---

## 15. THE MORNING REPORT (most recent on top)

(none yet)
