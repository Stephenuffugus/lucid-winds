# HANDOFF SPAN, the build plan for the math catalog's first game

**Written:** 2026-09-15, by Opus (the builder), as step 1 of SPAN (`plans/math/CATALOG-PLAN.md` section 8), from three
inputs read whole: `assets/math-catalog/08-SPAN-handoff.md` (Stephen's delivery, read only), `plans/math/CATALOG-PLAN.md`
(Fable's plan over the catalog, which binds this file and wins over the handoff), and `plans/math/HANDOFF-CORE.md` (what
CORE now provides, built and deployed). Where this file and the handoff differ, every difference is in section 3.
**Game folder:** `satellites/span/` (free, checked 2026-09-15). **Live URL when listed:** `lucidwinds.com/satellites/span/`.
**Working title:** Span. The display name is Stephen's (CATALOG-PLAN call 4; the handoff offers TRUE).

---

## SESSION STATE (the builder updates this at the end of every session; the morning reader starts here)

- 2026-09-15, Opus: **P3 step 3 is done: the layout at four sizes.** `test/layout.mjs` (seven states reached by play at
  320, 375, 412 and 1366; on screen unscrolled, 56 and 48 px targets, 0.7 rem, no sideways scroll, tabular lining
  figures, no network, no console), in `tools/check.js`; it found the game's numerals set without lining figures, fixed;
  L1 to L8 red. Stamp `20260915e`. `tools/check.js`: lint, engine, play, audio, viaduct, screener, config, layout.
  **Next action:** P3 step 4, the installable shell, the gate first (`test/offline.mjs`): `sw.js` with a versioned cache
  named for the stamp, precaching exactly the files the game and the screener load (read off the pages' own requests, not
  a hand list), every fetch answered from the cache when offline and a hung network never left pending (the fleet's
  black screen scar: a `respondWith` that never settles); the page and the screener load and play a round with the
  network cut after the first visit; `manifest.webmanifest` with the icons at 192, 512 and a maskable 512, each read and
  measured; then the sprite sheet through CORE's `sheet.mjs`, opened with three faults named; then the listing line.
- 2026-09-15, Opus: **P3 step 2 is done: the teacher's links.** `satellites/span/config.js` is the one schema file
  both SPAN pages parse; the builder's `span` entry matches it (a run's length a choice of whole blocks of five, 20 by
  default in both, after the gate showed a builder link for 10 playing 20) and a new `spanScreen` entry offers the
  screener's minutes. `test/config.mjs` in `tools/check.js`, C1 to C6 red. SPAN's stamp `20260915d`; CORE's stamp
  `20260915b` for `schemas.js`, CORE's nine gates green.
  **Next action:** P3 step 3, `test/layout.mjs`, the gate first, at 320x568, 375x667, 412x915 and 1366x768 for all three
  modes, the viaduct and the screener: every stone, pier and choice a 56 px target and every control 48 px a thumb lands
  on; every text at least 0.7 rem measured; no sideways scroll; nothing a thumb needs below the unscrolled visual
  viewport; `assertTabularNumerals` on every digit; `assertNoNetworkAfterLoad`. Watch it red on something real first (the
  shots named candidates: the RELATIONAL lay control off centre, next 16 px from a choice at 320, the stack's small
  numeral). Then `sw.js`, the manifest and icons, then the sprite sheet, then the listing line.
- 2026-09-15, Opus: **P3 step 1 is done: the equals sign screener** at `satellites/span/screen/` (ten TRUE OR NOT items
  on the link's seed, no reveal, `?minutes=` 1 to 10 through `sessionStep`, nothing stored or sent, the teacher's three
  lines behind a two second hold). `test/screener.mjs` in `tools/check.js`, S01 to S10 red.
  **Next action:** P3 step 2, the real SPAN schema, the gate first: a law (in `test/play.mjs` or a small
  `test/config.mjs`) that SPAN's page schema and `satellites/math/config/schemas.js`'s `span` entry hold the same keys,
  types, bounds and defaults (today `count` defaults to 10 in the builder and 20 on the page, so a builder link for 10
  plays 20: watch it red first), that every builder link for SPAN opened in the page plays what it asked for (mode and
  count read back from the page), and the screener's `minutes` offered too; then P3 step 3, `test/layout.mjs` at the
  four sizes (56 px stones and piers, 48 px controls, measured type, no sideways scroll, `assertTabularNumerals`), then
  `sw.js`, the manifest and icons, then the sprite sheet.
- 2026-09-15, Opus: **P2 IS DONE.** Steps 3 and 4: the ear gate (`test/audio.mjs`, the seat one sound per event, a long
  press of five one seat, peak 0.327, nothing above 3 kHz, H1 to H8 red) and runs with the viaduct (`test/viaduct.mjs`,
  one arch per run through `collectOnce`, thirty at most, the modes in order on the next seed, a teacher's `?mode=`
  holding, V1 to V7 red). Stamp bumped to `20260915b`. `tools/check.js`: lint, engine, play, audio, viaduct.
  **Next action:** P3 step 1, the equals sign screener at `satellites/span/screen/`, the gate first
  (`test/screener.mjs`): Mode 1 only, ten items from `generateSet(rng(seed), { mode: 'judge', size: 10, first: true })`,
  the whole class answering at once with no login, a three minute cap through CORE's `sessionStep` with time handed in,
  no reveal between items (a screener measures, it does not teach), and at the end a result shown on the device for the
  teacher (how many of the ten, and how many of the nonstandard items) and sent nowhere (G1, G2: nothing fetched after
  load, nothing written but CORE's store); then the real SPAN schema in `satellites/math/config/schemas.js`, the four
  size layout gate, `sw.js` and the manifest, and the sprite sheet. ⛔ The schema step has a real fault waiting: the
  draft gives `count` a default of 10 and the page's own `parseConfig` a default of 20, and `buildQuery` leaves out any
  value equal to the schema's default, so a teacher who picks 10 in the builder gets a link that plays 20. The step's
  law: the page's schema and the builder's are the same keys, types, bounds and defaults.
- 2026-09-15, Opus: **P2 step 2 is done: Mode 3 RELATIONAL with labelled blocks** (`?mode=relational`; a stone 1, a
  slab 10 and a block 100 with their numerals; five of a source on a long press; Shift for a slab and Page Up for a
  block; the equation's sides unbreakable and set smaller so it holds one line and the controls stay on a 320x568
  screen). `test/play.mjs` laws 16 to 18 and two layout laws, 133 laws, every new one watched red (F1 to F7, G1, G2);
  ALL GATES PASSED.
  **Next action:** P2 step 3, the ear gate, `test/audio.mjs` in CORE's shape (`satellites/math/core/test/audio.mjs`):
  `window.SPAN.audio` exposes `sounded`, `clear` and `renderLoud`; a first load is muted (a whole round by thumb plays
  nothing); with Sound turned on through the settings switch a dropped stone plays one seat, a long press of five plays
  ONE seat (A1), a laid span plays one; the loudest pattern (a seat every 250 ms for 20 s) halves with the master in rms
  and peak, renders the same twice (seeded), does not clip (peak under 0.9), is not silence, and keeps under 30 percent
  of its energy above 3 kHz. Then step 4, the viaduct: one arch per completed run through `collectOnce` and CORE's
  store, the next mode unlocked by a completed run.
- 2026-09-15, Opus: **P2 step 1 is done: Mode 1 TRUE OR NOT and the mode key** (`?mode=judge`; two choices, the
  span laid on either, the mark kept and one look; items played until a true and a false one are both revealed; the
  controls row made three fixed places after a shot showed the lay control jumping under the thumb). `test/play.mjs`
  laws 13 to 15 and the two position laws, every one watched red (D1 to D7, E1, E2, A5 again); ALL GATES PASSED.
  **Next action:** P2 step 2, Mode 3 RELATIONAL, the gate first: `?mode=relational` shows the engine's stage 2 item
  (three digit numbers, one pair across the sign 1 to 3 apart); the supply is three labelled sources, a stone 1, a slab
  10 and a block 100, each with its numeral on it, 56 px, dragged to the blank's pier adding its value (a long press on
  a source adds five of it); by keys, arrow up and down a stone, with Shift a slab, Page Up and Page Down a block, and a
  digit still nothing (S5); a three digit fill built in under fifteen actions; the reveal laws on a right and a wrong
  round. Then `test/audio.mjs` (the seat, one per event) and the viaduct.
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

### P2 step 1, Mode 1 TRUE OR NOT and the mode key (2026-09-15)

The gate first: `test/play.mjs` laws 13 to 15 (`?mode=judge`: the engine's judged item term for term; no blank, no
supply, no lay control; two 56 px choices; the choice marked at once and still marked after the reveal; the page's
record of the choice and the engine's truth; the full reveal laws on each round; the same reveal and seat with and
against the truth; one look for the mark; no canyon colour changed; a choice by keys at 1366x768). On the P1 page:
```
  FAIL  375x667 TRUE OR NOT the first item on the page is the engine's judged item, term for term ([{"n":3,...},{"blank":true,...},...])
  FAIL  375x667 TRUE OR NOT there is no blank, no stone supply and no lay control to use (#equation .term[data-blank], #supply .stone-source, #lay)
  FAIL  375x667 TRUE OR NOT the two choices are 56 px targets a thumb lands on: #same missing, #apart missing
  FAIL  375x667 TRUE OR NOT round 1: the choice #same is on the page
  FAIL  1366x768 TRUE OR NOT a choice is made by keys alone (completed by keys, a focus ring seen, {"item":0,"fill":0,...})
5 PLAY FAILURE(S)
```
The page (`docs/DECISIONS.md`: the mode key, two choices with the span laid on either, a one number side named once):
`PLAY OK`. **⛔ Then the gate was weaker than its OK**: seed 4242's first two judged items are both true, so no false
item's reveal (the tilt, the shortfall, the new "the other side is" caption) had been seen. The block now plays items
until a true one and a false one are both revealed, odd rounds with the engine's truth and even rounds against it, and
says so as a law. Live:
```
  ok    375x667 TRUE OR NOT round 4 (same, the engine: not the same): the page records the choice and the engine's truth ({"item":3,"fill":null,"same":false,...,"choice":"same"})
  ok    375x667 TRUE OR NOT a true item and a false item were both played and revealed (true, true, true, false)
  ok    375x667 TRUE OR NOT a round chosen with the truth and one chosen against it run the same reveal and seat (largest difference 0.018 of full scale, 183 comparisons)
  ok    375x667 TRUE OR NOT and the mark on the choice looks the same on every round (rgb(43, 38, 32)|...|rgb(43, 38, 32) 0px 0px 0px 3px inset|1)
  ok    375x667 TRUE OR NOT and no colour in the canyon differs from the canyon before any choice
  ok    1366x768 TRUE OR NOT a choice is made by keys alone (completed by keys, a focus ring seen, {...,"choice":"same"})
PLAY OK
```
**Watched red** (session scratch `span-play-plants-p2a.cjs`), and A5 again on the rewritten caption:
```
A5 "Right." and "Wrong." in the caption   FAIL the caption is a fact on seven rounds, among them "Wrong. 8 + 2 is 10 and the other side is 11"
D1 the mode key ignored                   FAIL term for term (the blank item); FAIL no supply; FAIL #same missing; FAIL a true and a false item played (); FAIL by keys
D2 the mark taken away after the reveal   FAIL still marked after the reveal (true/false, then false), all four rounds
D3 every choice recorded as the same      FAIL round 2 (apart, the engine: the same): the page records the choice ... ("choice":"same")
D4 a red mark on a choice against the truth  FAIL the mark on the choice looks the same on every round (... 3px inset ... and ... rgb(179, 38, 30) ...)
D5 the span drawn as chosen, not as true  FAIL round 2 flat (tilt 1); FAIL round 4 tilted (tilt 0); FAIL round 4 as drawn (ends 88.0 and 88.0)
D6 the choices out of the tab order       FAIL a choice is made by keys alone (NOT completed by keys, a focus ring seen, null)
D7 the supply left showing                FAIL there is no blank, no stone supply and no lay control to use (#supply .stone-source, #lay)
```
**The shots, opened**, found a fault that had been in every P1 shot and no gate: the lay control sat at the right edge
and moved to the middle when next appeared, under the thumb that had just used it. A law each for the lay control and
the choices (`stays where the thumb left it when next appears`), run on that page:
`FAIL 375x667 round 1: the lay control stays where the thumb left it when next appears (327,517 then 199,517)`. The
controls row is now three fixed places (the supply; the lay control or the two choices; next, its place kept while
hidden), and a caption is balanced over its lines with the space before a value unbreakable (the false reveal at 375
had left "11" alone on a line). Live: `ok ... the lay control stays ... (188,517 then 188,517)`, `ok ... TRUE OR NOT
round 4: the choice stays ... (146,514 then 146,514)`, `PLAY OK`. Watched red (session scratch
`span-play-plants-p2b.cjs`):
```
E1 the old row                            FAIL the lay control stays where the thumb left it when next appears (327,517 then 199,517)
E2 the choices centred until next arrives FAIL the choice stays where the thumb left it when next appears (146,514 then 112,514), all four rounds
```
`tools/check.js` under the lock: lint, engine, play, ALL GATES PASSED.

Shots, all retaken (the row moved in every one), under 40 KB, the new and changed ones opened with three faults each:
- `p2-judge-choose-375`: the "same" icon, a slab on two blocks, reads as a table; the two icons differ only by a 12
  degree slope and a shorter block; the band under the row is empty.
- `p2-judge-true-375`: the pressed mark is a heavy inner ring that a keyboard user could take for focus; the choice not
  taken is dimmed, which a child could read as "that one was wrong" although it dims on every path; `14 − 7 = 7` shows
  the minus sign long and thin beside the digits.
- `p2-judge-false-375` and `-320`: the near miss shortfall is a one unit sliver and the span's low end covers most of it;
  the caption balances as "8 + 2 is 10 and the / other side is 11", splitting "the other side"; at 320 next sits 16 px
  from "Not the same".
- `p1-build-375`: the lay icon, a slab over two blocks, still reads a little like a face; the supply slab and the lay
  control are different heights so the row's middles do not line up; the right third of the row is empty until next.
- `p1-reveal-apart-320`: the gaps either side of the lay control differ; the shortfall's rectangle and the span's slant
  still say one thing twice; the caption runs to 13 px from each side.

Committed as `2251065f`, deployed; served with a random probe: the page carries `id="same"` and the three place row
once, the served `main.js` carries `JUDGED = MODE === 'judge'`, `content.js` carries "the other side is" and serves
`200 application/javascript`.

### P2 step 2, Mode 3 RELATIONAL with labelled blocks (2026-09-15)

The gate first, `test/play.mjs` laws 16 to 18 (`?mode=relational`: the engine's stage 2 item, every number three digits;
a stone 1, a slab 10 and a block 100, each a 56 px target with its numeral; each adding its own value and five of it on
a long press; a three digit fill in fifteen actions or fewer; the reveal laws on a wrong and a right round, the same
reveal; keys). On the TRUE OR NOT page:
```
  FAIL  320x568 RELATIONAL a stone 1, a slab 10 and a block 100 are 56 px targets with their numerals on them: 1 missing reads null, 10 missing reads null, 100 missing reads null
  FAIL  375x667 RELATIONAL a stone 1, a slab 10 and a block 100 are 56 px targets with their numerals on them: 1 missing reads null, ...
Error [TypeError]: Cannot read properties of null (reading 'getBoundingClientRect')     (the first drag, from a source that is not there)
```
The page (`docs/DECISIONS.md`: three labelled sources, Shift for a slab and Page Up for a block, a second row at 320).
Live: `a block adds 100, a slab 10, a stone 1, and a long press on the slab fifty (100, 110, 111, 161)`; round 1 wrong,
161 for 583, the piers 844 and 1266, the caption "683 + 161 is 844 and 681 + 585 is 1266"; round 2 right, `265 for 265
in 5` actions, "699 + 265 is the same as 702 + 262"; the same reveal (0.024); by keys `{"fill":111}`; `PLAY OK`.

**⛔ The shots then showed what the gate had not**: with a three digit fill the equation broke "681 + 585" across two
lines at 375 and 320, and at 320x568 the second line pushed the lay control under the bottom of the screen. Two laws
(`no side of the equation is split across two lines`; `the lay control and the three sources are on the screen without
scrolling`, measured unscrolled against the visual viewport), run on that page:
```
  FAIL  320x568 RELATIONAL with 111 in the blank: no side of the equation is split across two lines (split: right)
  FAIL  320x568 RELATIONAL with 111 in the blank: the lay control and the three sources are on the screen without scrolling (#lay past 568 px)
  FAIL  375x667 RELATIONAL with 161 in the blank: no side of the equation is split across two lines (split: right)
```
Each side is now one unbreakable group, and RELATIONAL's equation is set at 26 px, 20 px under 400 px wide. Live: all
four `ok`, `PLAY OK`, 133 laws. **Watched red** (session scratch `span-play-plants-p2c.cjs`, `-p2d.cjs`):
```
F1 the slab and block hidden in every mode  FAIL 10 missing, 100 missing, at 320 and 375; FAIL counts (0, 0, 1, 1); FAIL the fill (5 for 265)
F2 no numerals on the sources               FAIL ... 1 56x56 reads "", 10 56x56 reads "", 100 56x56 reads "", at 320 and 375
F3 a long press adds five stones            FAIL counts (100, 110, 111, 116); FAIL the fill (220 for 265 in 5)
F4 every drop adds one                      FAIL counts (1, 2, 3, 53); FAIL the fill (58 for 265 in 5)
F5 Shift ignored                            FAIL by keys ({"fill":102})
F6 no second row at 320                     FAIL 320x568 RELATIONAL the page does not scroll sideways (12 px over 320)
F7 RELATIONAL at stage one                  FAIL the stage 2 item, every number three digits ([{"n":67},...]); FAIL heights, tilt, caption and the engine's evaluate on both rounds
G1 sides breakable, the full size           FAIL split (right) at 320 and 375; FAIL #lay past 568 px at 320
G2 no smaller size under 400 px             FAIL #lay past 568 px at 320 (the sides held, the equation wrapped at the sign)
```
⛔ F1's first plant stayed `PLAY OK`, and it was the plant, not the law: `display: none` at the same specificity as
RELATIONAL's `display: flex`, written earlier, hid nothing. Planted again with `!important`, red as above.

Shots, all retaken (the equation's markup changed in every mode), the RELATIONAL ones opened, three faults each:
- `p2-relational-build-375`: at 20 px five three digit numbers read small for a child; the 4 px gaps crowd "683 +"; the
  lay control sits right of the screen's centre, centred between the supply and next's kept place.
- `p2-relational-apart-375`: the piers carry no numbers, so only the caption says 794 and 1266; next sits close to the
  dimmed lay control; the shortfall is a tall pale block that reads as sky more than as missing stone.
- `p2-relational-build-320`: the lay control sits left of centre on its own row; it ends 16 px above the bottom of the
  screen; "100" nearly fills its 56 px stone. `p1-reveal-apart-320` looks as it did before the side groups.

`tools/check.js`: ALL GATES PASSED. Committed as `3c0097c1`, deployed; served with a random probe: the page carries
`data-value="100"` and RELATIONAL's 26 px rule once, the served `main.js` carries `addStones(5 * press.value)` and the
side groups.

### P2 step 3, the ear gate (2026-09-15)

`satellites/span/test/audio.mjs` in CORE's shape, in `tools/check.js`. On the RELATIONAL page:
`FAIL the page exposes what its audio did (SPAN.audio)`. Then `window.SPAN.audio` (`sounded`, `clear`, and
`renderLoud` over the loudest pattern a child can make: a stone every quarter second, and each second a span laid 40 ms
after a stone). Live:
```
  ok    a first load is muted: a stone put on and a span laid played nothing ([])
  ok    with Sound on, a stone put on the pier plays one seat (["seat"])
  ok    a long press that puts five on plays ONE seat, never one a stone (A1) (["seat"], the blank now 6)
  ok    a laid span plays one seat and nothing more through its reveal (["seat"])
  ---   twenty loud seconds: peak 0.327  rms 0.0603  above 3 kHz 0.0 percent
  ok    every voice passes through the master: halving it halves the level (ratio 0.500)
  ok    and the peak comes down with it: 0.327 to 0.164
  ok    and the same render twice gives the same numbers to one part in a hundred thousand, the noise is seeded (peak off by 9.1e-8, rms by 9.7e-11)
  ok    nothing clips: peak 0.327 (under 0.90)
  ok    it is not an alarm: 0.0 percent of its energy above 3 kHz (under 30)
AUDIO OK
```
**Watched red** (session scratch `span-audio-plants.cjs`):
```
H1 a seat for every stone of five     FAIL a long press that puts five on plays ONE seat ... (["seat","seat","seat","seat","seat"], the blank now 6)
H2 sound on at first load             FAIL a first load is muted: a stone put on and a span laid played nothing (["seat","seat"])
H3 the seat around the master         FAIL halving it halves the level (ratio 0.999); FAIL and the peak comes down with it: 0.409 to 0.410
H4 unseeded noise                     FAIL the same render twice ... (peak off by 1.1e-2, rms by 4.8e-4)
H5 ten times the gain                 FAIL nothing clips: peak 3.125 (under 0.90)
H6 a 4 kHz square                     FAIL it is not an alarm: 82.7 percent of its energy above 3 kHz (under 30)
H7 a second seat as the reveal ends   FAIL a laid span plays one seat and nothing more through its reveal (["seat","seat"])
H8 a silent lay                       FAIL a laid span plays one seat and nothing more through its reveal ([])
```
⛔ Not yet heard by a person: the numbers say a deep, unclipped, unalarming thud; whether it sounds like stone is
Stephen's ear.

### P2 step 4, runs and the viaduct (2026-09-15)

`satellites/span/test/viaduct.mjs`, in `tools/check.js` (runs of five played through by thumb; what the viaduct draws
and what `lw:span:save` holds read off the page; the 30 cap started from a store of 29, never 30). On the page before:
```
  ok    a reload in the middle of a run adds no arch ([])           (green because nothing ever added an arch; V1 below is its red)
  FAIL  a run of five played through ends on the viaduct, one arch drawn and one in the store (no viaduct drawn, [])
  FAIL  the viaduct's start is a 56 px target a thumb lands on (missing)
  FAIL  nothing is fetched after load (8 requests after load ...: .../span/index.html?seed=4242&count=5&?probe=..., .../core.css?v=20260915a)
Error: no element for #again
```
⛔ The network line was the gate's fault, not the page's: it reloaded the page its own G2 law then read, and counted the
reload. The reload law now has its own page; G2 is asserted on a page never reloaded.

The page (`docs/DECISIONS.md`: a run is `count` items and earns one arch, thirty at most; the next run plays the next mode
on the next seed, a teacher's `?mode=` holds): `startRun`, `finishRun` through `collectOnce` and CORE's `store.update`,
`drawViaduct`, a 56 px start. Live:
```
  ok    a reload in the middle of a run adds no arch ([])
  ok    a run of five played through ends on the viaduct, one arch drawn and one in the store (1 drawn, ["arch-1"])
  ok    the viaduct's start is a 56 px target a thumb lands on (56x56)
  ok    start begins the next run in the next mode, TRUE OR NOT, on the next seed, term for term (judge [{"n":3,...},{"op":"+"},{"n":8,...},{"op":"="},{"n":11,...}])
  ok    a second run adds a second arch (2 drawn, ["arch-1","arch-2"])
  ok    and the later arch recedes, narrower and no less hazy (44 px at 1.00, 40 px at 0.98)
  ok    and the run after that is RELATIONAL, on the seed after, term for term (relational [{"n":508,...},{"op":"+"},{"blank":true,...},...])
  ok    nothing is fetched after load (0 requests after load and 1500 ms of quiet)
  ok    never more than 30 arches: 29 and a run is 30, and another run is still 30 (30 then 30 in the store, 30 then 30 drawn)
  ok    a teacher's ?mode=judge holds: the next run is TRUE OR NOT again, on the next seed (judge [...])
VIADUCT OK
```
**Watched red** (session scratch `span-viaduct-plants.cjs`):
```
V1 an arch on every load          FAIL a reload in the middle of a run adds no arch (["arch-1","arch-2"]); FAIL one arch (2 drawn); FAIL a second arch (3 drawn); FAIL recedes (three arches)
V2 no cap                         FAIL never more than 30 arches ... (30 then 31 in the store, 30 then 31 drawn)
V3 every run the same mode        FAIL start begins the next run in the next mode, TRUE OR NOT ... (blank [{"n":3},{"op":"+"},{"blank":true},...])
V4 every run the same seed        FAIL the next run on the next seed (judge [{"n":14},{"op":"-"},{"n":7},...]); FAIL RELATIONAL on the seed after; FAIL the teacher's link on the next seed
V5 a teacher's mode ignored       FAIL a teacher's ?mode=judge holds ... (relational [{"n":302},...])
V6 arches that do not recede      FAIL and the later arch recedes, narrower and no less hazy (44 px at 1.00, 44 px at 0.98)
V7 a 48 px start                  FAIL the viaduct's start is a 56 px target a thumb lands on (48x48)
```

**The stamp.** ⛔ Four deploys today changed `main.js`, `index.html` and `content.js` under one stamp, `20260915a`, so a
browser or the host's cache that had fetched the P1 `main.js?v=20260915a` could pair it with a later page. SPAN has no
portal row and no players yet, but the law is one stamp per change: `20260915b` in `STAMP.js`, the page's two `?v=` and
`main.js`'s three imports, the lint holding all six.

Shots, opened, three faults each:
- `p2-viaduct-first-375`: one arch alone at the far left of a wide sky reads as a doorway, not the start of a viaduct; the
  haze gradient greys the right half of the ground as if it were smeared; start carried a blue focus ring after a thumb
  tap, because the page moved focus to it on every path (now only when the run ended by keyboard, the shot retaken).
- `p2-viaduct-twelve-375`: the arches have no deck, so they read as twelve doorways rather than one structure; their
  bases stay on the horizon while their tops step down, which reads as shrinking more than as distance; the sky above
  is two thirds empty.
- `p2-viaduct-twelve-320`: the row reaches the right edge at twelve, so arches past about fifteen will be cut off by the
  frame instead of fading into the haze; the same missing deck; start sits far below the picture with nothing between.

`tools/check.js`: lint, engine, play, audio, viaduct, ALL GATES PASSED. Committed as `5bce3fff`, deployed; served with a
random probe: the page carries `id="viaduct"` and `?v=20260915b` twice, the served `main.js` carries
`function finishRun(byKey)` and imports `core.js?v=20260915b`; `main.js`, `engine.js`, `content.js` and CORE's `core.js`
at the new stamp each `200 application/javascript`.

### P3 step 1, the equals sign screener (2026-09-15)

`satellites/span/test/screener.mjs`, in `tools/check.js` (ten TRUE OR NOT items from `engine.js` in Node; what the teacher
must be told computed in Node from the terms and this gate's choices). Run before any screener page existed:
`TimeoutError: Waiting failed: 30000ms exceeded` (no `/span/screen/index.html`, so `window.SCREEN` never became ready).
The page, `satellites/span/screen/index.html` and `screen.js` (`docs/DECISIONS.md`: the screener measures and does not
teach; the result behind a two second hold). Live:
```
  ok    the first item is the engine's first judged item of ten, term for term ([{"n":9,...},{"op":"-"},{"n":4,...},{"op":"="},{"n":5,...}])
  ok    after each choice the next item is on the page at once, term for term
  ok    and nothing between items tells a child how the last one went
  ok    after ten the end screen shows, and no score is anywhere in the page's text
  ok    a short tap on the teacher's control shows nothing ([])
  ok    a two second hold shows the teacher the result Node computed (["Correct: 7 of 10","Nonstandard correct: 5 of 6","Reached: 10 of 10"] for [...the same])
  ok    nothing was written to storage from start to result
  ok    nothing is fetched after load (0 requests after load and 1500 ms of quiet)
  ok    a one minute link ends itself a minute after start and not before (60.1 s)
  ok    and the teacher's result counts only what was reached (["Correct: 3 of 10","Nonstandard correct: 2 of 6","Reached: 3 of 10"] for [...the same])
  ok    1366x768 all ten items are chosen by keys (completed by keys, a focus ring seen)
  ok    1366x768 holding Enter on the teacher's control shows the result ([...] for [...the same])
SCREENER OK
```
**Watched red** (session scratch `span-screener-plants.cjs`):
```
S01 a mark left on the choice            FAIL and nothing between items tells a child how the last one went (item 1: a pressed same; ...)
S02 the score on the end screen          FAIL no score is anywhere in the page's text; FAIL a short tap shows nothing (["Correct: 7 of 10",...])
S03 a tap is a hold                      FAIL a short tap on the teacher's control shows nothing (["Correct: 7 of 10","Nonstandard correct: 5 of 6","Reached: 10 of 10"])
S04 every correct item counted nonstandard  FAIL the result Node computed ("Nonstandard correct: 7 of 6" for "5 of 6"), on all three results
S05 the choices saved                    FAIL nothing was written to storage ({} then {"lw:span:screen":"[\"same\",...]"})
S06 the result sent                      FAIL nothing is fetched after load (1 requests ...: .../span/content.js?v=20260915b&sent=10)
S07 no cap                               FAIL a one minute link ends itself a minute after start and not before (never ended)
S08 the cap five seconds short           FAIL ... and not before (55.1 s)
S09 no hold by keys                      FAIL 1366x768 holding Enter on the teacher's control shows the result ([] for [...])
S10 the next item never drawn            FAIL after each choice the next item is on the page at once, term for term (item 2 [{"n":9},...]; ...)
```
⛔ S03's first plant (the hold's timer set to 0 ms) stayed `SCREENER OK`, and it was the plant: the harness's tap sends
down and up in one turn, so the up cancelled a 0 ms timer before it could run. Planted again as a click that shows the
result, red as above.

Shots, opened, three faults each:
- `p3-screen-item-375` and `-320`: the icons sat left of centre inside both choices (centred now, in the game's
  choices too); nothing tells a child how many of the ten are left; the lower two thirds of the screen are empty.
- `p3-screen-done-375`: the grey slab above the teacher's control means nothing; "Teacher, press and hold" is a
  sentence any child can read and obey, so the hold keeps the score from a glance, not from a curious child; the
  control's text is larger than the result it guards.
- `p3-screen-result-375`: once shown the result stays until a reload, so the next child to pick up the device sees it;
  the three lines are centred with nothing tying them to the ten items; the empty slab still sits above them.

The stamp is `20260915c` for this change (the page's CSS, `content.js` and the new screener), in `STAMP.js`, both pages
and all three modules, the lint holding every one.

`tools/check.js`: lint, engine, play, audio, viaduct, screener, ALL GATES PASSED. Committed as `59feec30`, deployed;
served with a random probe: the screener page and the game each carry `?v=20260915c` twice; the served `screen.js`
carries the stamp on its three imports; `main.js`, `content.js` and `engine.js` `200 application/javascript`.

### P3 step 2, the teacher's links (2026-09-15)

`satellites/span/test/config.mjs`, in `tools/check.js`: the builder's entries for the game and the screener against the
schemas the two pages parse, key by key; a link for every value the builder offers read back through the page's schema;
the pages importing `config.js`; and in a browser, what a link of the builder's defaults and of other values plays. With
`config.js` first written as the pages then parsed:
```
  FAIL  every key the builder offers for the game, the page parses with the same type, values or bounds, and default: count defaults to 10 in the builder and 20 on the page
  FAIL  a link for every value the builder offers the game reads back through the page's schema as that value: count=10 (the link "" is read as 20)
  FAIL  the builder has an entry for the screener going to ../span/screen/ (none)
  FAIL  main.js imports SPAN_SCHEMA from ./config.js and hands it to parseConfig (it does not import it) (it parses something else)
  FAIL  screen/screen.js imports SCREEN_SCHEMA from ../config.js and hands it to parseConfig (it does not import it) (it parses something else)
  FAIL  the game plays what a link of the builder's defaults asked for (asked {"mode":"blank","count":10}, the page plays null)
  FAIL  the game plays what a link of other values asked for (asked {"mode":"judge","count":5}, the page plays null)
7 CONFIG FAILURE(S)
```
⛔ The second line is a real fault a teacher would have met: the builder leaves a default out of the link, so its 10
was an empty link, and the page read the empty link as its own 20. The page had a second one no gate asked about: it
rounded any count to a block of five, so a link for 12 played 10.

The fix (`docs/DECISIONS.md`): a run's length is a choice of 5, 10, ... 40 in both schemas, 20 by default in both; one
schema file, `config.js`, that `main.js` and `screen.js` import; `SPAN.config()` and `SCREEN.config()` report what each
page plays; a `spanScreen` entry in `satellites/math/config/schemas.js` with the screener's minutes. Stamps: SPAN's to
`20260915d` (13 places), CORE's to `20260915b` (9 places, for `schemas.js`), each bump a script that asserted nothing of
the old stamp was left, both lints green. Live:
```
  ok    every key the builder offers for the game, the page parses with the same type, values or bounds, and default (mode, count)
  ok    a link for every value the builder offers the game reads back through the page's schema as that value
  ok    the builder has an entry for the screener going to ../span/screen/ (../span/screen/)
  ok    the game plays what a link of the builder's defaults asked for (asked {"mode":"blank","count":"20"}, the page plays {"mode":"blank","count":20})
  ok    the game plays what a link of other values asked for (asked {"mode":"judge","count":"5"}, the page plays {"mode":"judge","count":5})
  ok    the screener plays what a link of other values asked for (asked {"minutes":1}, the page plays {"minutes":1})
CONFIG OK
```
CORE's `tools/check.js` after its stamp and `schemas.js` changed: lint, pure, layout, demo, audio, schedule, shared, config
(the builder now lists three entries), sprite, ALL GATES PASSED. SPAN's: lint, engine, play, audio, viaduct, screener,
config, ALL GATES PASSED.

**Watched red** (session scratch `span-config-plants.cjs`, each a copy of SPAN and CORE with one change):
```
C1 the builder defaults to ten        FAIL count defaults to 10 in the builder and 20 on the page; FAIL count=10 (the link "" is read as 20); FAIL the defaults link plays {"count":20}
C2 the page counts freely             FAIL count is enum in the builder and int on the page; FAIL count=5 (the link "?count=5" is read as 5) and every other count
C3 no screener in the builder         FAIL the builder has an entry for the screener going to ../span/screen/ (none)
C4 the page parses its own copy       FAIL main.js imports SPAN_SCHEMA from ./config.js and hands it to parseConfig (it parses something else)
C5 the page ignores count             FAIL the game plays what a link of other values asked for (asked {"count":"5"}, the page plays {"count":20})
C6 a mode the page does not take      FAIL mode offers blank/judge/relational/wording, the page takes blank/judge/relational; FAIL mode=wording (read as blank)
```
Committed as `e930b5f8`, deployed. ⛔ The first probe loop went back to back and the host began answering `HTTP 429`
(too many requests), which a loop that only greps for markers reads as "not yet"; `origin/main` was already `e930b5f8`.
One request per file after a pause: `config/index.html` 200 with `?v=20260915b` twice; `config/schemas.js?v=20260915b`
200 `application/javascript` carrying `spanScreen` and `'40'`; `span/index.html` 200 with `?v=20260915d` twice;
`span/config.js?v=20260915d` 200 `application/javascript` carrying `'40'`.

### P3 step 3, the layout at four sizes (2026-09-15)

`satellites/span/test/layout.mjs`, in `tools/check.js`: 320x568, 375x667, 412x915 and 1366x768, each in seven states
reached by play (THE BLANK building and revealed, TRUE OR NOT, RELATIONAL building, the viaduct after a run of five, the
screener and the screener at its end); in each, everything a thumb needs on the unscrolled visual viewport, 56 px stones,
piers, sources and choices and 48 px controls a thumb lands on, no text under 0.7 rem, no sideways scroll, CORE's
`assertTabularNumerals`, nothing fetched after load, nothing on the console. On the tree as deployed at `e930b5f8`:
```
  FAIL  320x568 THE BLANK building: every digit is set in tabular lining figures (term: tabular-nums | term: tabular-nums | term: tabular-nums)
  ... the same line for every game state at every size (the screener already set both)
20 LAYOUT FAILURE(S)                      (176 laws green)
```
A real fault: the game's equation, the stack and the caption were set in tabular figures without lining ones, so a
font with old style figures would bob its numerals up and down beside each other. All three now say
`tabular-nums lining-nums`. Live: `LAYOUT OK`, 196 laws. **Watched red** (session scratch `span-layout-plants.cjs`):
```
L1 a 48 px choice                     FAIL TRUE OR NOT: ... #same 48x48 (needs 56), #apart 48x48 (needs 56), at all four sizes
L2 the controls pushed under the fold FAIL THE BLANK building: ... on the screen without scrolling: #supply .stone-source[data-value="1"] (12,722 to 90,784 in 375x667), #pier-left ..., and every state at 375 and 1366
L3 a 10 px caption                    FAIL THE BLANK revealed: no text is under 0.7 rem: caption 10px, at all four sizes (and the viaduct, whose canyon still holds the last caption behind it)
L4 a row wider than a phone           FAIL 320x568 ...: the page does not scroll sideways (112 px over 320); FAIL .lw-settings-open (376,8 to 424,56 in 320x568) off the screen; 28 lines
L5 a caption in proportional figures  FAIL THE BLANK revealed: every digit is set in tabular lining figures (caption: proportional-nums), at all four sizes
L6 a 40 px teacher control            FAIL the screener at its end: ... #teacher 202x40 (needs 48), at all four sizes
L7 a fetch after load                 FAIL THE BLANK building: nothing is fetched after load (1 requests ...: .../span/STAMP.js?v=20260915d), every game state at every size
L8 a console error on the screener    FAIL the screener: nothing landed on the console: console: planted, both screener states at every size
```
Stamp `20260915e` for the page's CSS change (13 places, a script that asserted nothing of `d` was left; lint green).

---

## 14. THE OVERNIGHT PROTOCOL

HANDOFF-OPUS-SEP15 prompt: never wait on a human; an ambiguity is the smallest reasonable choice logged in
`satellites/span/docs/DECISIONS.md`; a gate red after three honest attempts goes into SESSION STATE as BLOCKED with its
last thirty lines; never weaken, skip or delete a gate; commit and push the moment something is green.

---

## 15. THE MORNING REPORT (most recent on top)

(none yet)
