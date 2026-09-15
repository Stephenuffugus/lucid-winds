# HANDOFF SPAN, the build plan for the math catalog's first game

**Written:** 2026-09-15, by Opus (the builder), as step 1 of SPAN (`plans/math/CATALOG-PLAN.md` section 8), from three
inputs read whole: `assets/math-catalog/08-SPAN-handoff.md` (Stephen's delivery, read only), `plans/math/CATALOG-PLAN.md`
(Fable's plan over the catalog, which binds this file and wins over the handoff), and `plans/math/HANDOFF-CORE.md` (what
CORE now provides, built and deployed). Where this file and the handoff differ, every difference is in section 3.
**Game folder:** `satellites/span/` (free, checked 2026-09-15). **Live URL when listed:** `lucidwinds.com/satellites/span/`.
**Working title:** Span. The display name is Stephen's (CATALOG-PLAN call 4; the handoff offers TRUE).

---

## SESSION STATE (the builder updates this at the end of every session; the morning reader starts here)

- 2026-09-15, Opus: plan written. Nothing built.
  **Next action:** section 5, P0 step 1: `satellites/span/test/engine.mjs` imports `../engine.js` and asserts the nine
  blank positions evaluate correctly; run it with no `engine.js` on disk and paste the red into section 13.

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

(empty)

---

## 14. THE OVERNIGHT PROTOCOL

HANDOFF-OPUS-SEP15 prompt: never wait on a human; an ambiguity is the smallest reasonable choice logged in
`satellites/span/docs/DECISIONS.md`; a gate red after three honest attempts goes into SESSION STATE as BLOCKED with its
last thirty lines; never weaken, skip or delete a gate; commit and push the moment something is green.

---

## 15. THE MORNING REPORT (most recent on top)

(none yet)
