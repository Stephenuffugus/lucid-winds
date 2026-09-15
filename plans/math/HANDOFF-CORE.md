# HANDOFF CORE, the build plan for the math catalog's shared foundation

**Written:** 2026-09-15, by Opus (the builder), as step 1 of lane C (`HANDOFF-OPUS-SEP15.md` section 5, prompt item 6),
from three inputs read whole: `assets/math-catalog/00-CORE-handoff.md` (Stephen's delivery, read only),
`assets/math-catalog/INDEX.md`, and `plans/math/CATALOG-PLAN.md` (Fable's plan over them, which binds this file and
wins over the handoff). Where this file and the handoff differ, every difference is in section 3 with its reason.
**Home:** `satellites/math/core/` (the folder is free, checked 2026-09-15: no `satellites/math`, no `satellites/span`).
**Not a game and not listed on the arcade.** Its first consumer is SPAN; its proof is a dummy game at
`satellites/math/core/demo/` that no player is sent to.

---

## SESSION STATE (the builder updates this at the end of every session; the morning reader starts here)

- 2026-09-15, Opus: **P0 DONE.** `satellites/math/package.json`, `core/pure.js` (the rng), `core/STAMP.js`
  (`20260915a`), `core/test/pure.mjs`, `core/tools/lint.mjs` (eight laws), `core/tools/check.js`: ALL GATES PASSED
  (lint, pure; no browser gate exists yet, so none was left out). Every law watched red, section 13. ⛔ The duplicate
  key law was green on its first plant, because the shared sweep cannot open `export const X = Object.freeze({`;
  fixed in CORE's lint, logged in `core/docs/DECISIONS.md`.
  **Next action:** P1 (section 5): `core/core.css` and `tokens.inject(palette)` in a new `core/core.js` that imports
  `./pure.js?v=20260915a`; then `migrate(record, schema)` in `pure.js` with its three laws (v0 record, garbage record,
  future version) in `test/pure.mjs`, each watched red.
- 2026-09-15, Opus: plan written, committed as 95f01549.

---

## 0. RULES OF ENGAGEMENT

1. **The fence.** `satellites/math/**` (this core, its demo, later the landing and the config builder) and this file.
   Read only: `assets/math-catalog/**`, `plans/math/CATALOG-PLAN.md`, every other satellite (copy FROM them, never into
   them), `scripts/`, `music-unlocks.js`, `tools/dupkeys.mjs` (imported, not edited). No portal row: CORE is not listed.
   Stage with `git add satellites/math plans/math/HANDOFF-CORE.md HANDOFF-OPUS-SEP15.md`, never `-A`.
2. **Deploy** is `git push origin add-sproing-jumper:main` after `git log HEAD..origin/main` is empty, then a probe of the
   served `core.js?v=<stamp>` with a random query. CORE deploys the day it is green even though nothing links to it,
   because SPAN will import the served file and must not be the first thing to find out it is broken.
3. **The laws** (HANDOFF-OPUS-SEP15 section 6, the kids' laws of CATALOG-PLAN section 7): no dash and no exclamation
   point in any string a child, a teacher or a store reader sees; Sky Wolf Studio, singular; runtime modules are `.js`;
   every import carries `?v=<stamp>`; 48 px targets proved by `elementFromPoint` (56 px for the young, CATALOG-PLAN D4);
   text 0.7 rem or larger, measured; nothing pure touches `document`, `window`, `Date`, `performance` or `Math.random`;
   a count in a gate is a law proved on 20 seeds; a colour threshold is a differential; a fresh GainNode's gain is one;
   a screenshot is opened and three faults named.
4. **Never wait on a human.** Section 10 lists what is Stephen's and the default the build takes meanwhile.

---

## 1. WHAT CORE IS, AND WHY IT GOES FIRST

Nine games share one feedback system (`reveal`), one adaptive model in three shapes (`adapt`), one line renderer
(`numberline`), one frame accurate presenter (`schedule`), one audio wrapper, one store, one settings panel, one URL
parser for teachers, one session controller and one collectible scaffold. The handoff's case is the fleet's own scar:
`games/` against its inline copies drifted twice. If `reveal` is wrong in CORE it is wrong in nine places at once, and
if it is right in CORE, game four onward is content and feel (CATALOG-PLAN section 3).

The reveal contract is the heart of the catalog and the thing most worth getting right before any child sees a game:
the child's answer first and never erased, the truth second and beside it, a caption that states a fact, the same
animation on success and on failure, near misses counted, and no colour that means right or wrong.

---

## 2. STATE OF THE INHERITANCE (verified 2026-09-15 on `add-sproing-jumper`; copy these, do not reinvent them)

| Need | Copy from | What to take |
|---|---|---|
| Stamped ES module imports | `satellites/aura-off/tools/stamp.js` lines 1 to 30 and `satellites/aura-off/src/main.js` lines 13 to 15 | The law in its header (a query on the entry point does NOT reach `import './x.js'`; every relative specifier carries the stamp itself) and the `import { X } from './x.js?v=<stamp>'` shape. CORE's lint asserts it instead of rewriting source |
| Gate runner | `satellites/fathom/tools/check.js` lines 24 to 45 and the tail | `GATES` and `BROWSER_GATES`, `need` strings, one command that prints `ALL GATES PASSED`, `--fast` that says what it skipped |
| Browser harness | `satellites/fathom/test/harness.mjs` (`serve` line 28, `open` 46, `reporter` 62, `centre` 69, `tap` 79, `drag` 101, `waitFrames` 203) | The static server that serves the folder, the absolute puppeteer require, `tap` that proves reachability with `elementFromPoint` and dispatches down and up synchronously (the swiftshader tap is a hold) |
| Lint shape | `satellites/fathom/tools/lint.mjs` lines 1 to 24 | `vm` parse check, no runtime `.mjs`, every asset stamped, one stamp, the copy scan, the brand, font floor; `import { dupKeys } from '../../../tools/dupkeys.mjs'` (for CORE the path is `../../../../tools/dupkeys.mjs`) |
| Duplicate keys | `tools/dupkeys.mjs` (root, read only) | Imported by CORE's lint over every `.js` in `core/` |
| No network after load | `satellites/asterism/test/boot.mjs` line 22 | `page.on('request', r => requested.push(r.url()))`, then the list after `load` must be empty (G2) |
| Keyboard in a gate | `satellites/strata/test/mount.mjs` line 174 | `page.keyboard`; CORE's keyboard gate uses `press` for arrows, Enter and Tab, and asserts a visible focus ring by computed `outline` |
| Ear gate | `satellites/fathom/test/audio.mjs` header (lines 1 to 30) and `OfflineAudioContext` renders in `satellites/asterism/index.html`, `satellites/doohickey/index.html` | Render the loudest events through the SAME voice functions offline; measure peak, rms, share above 3 kHz; never measure a normalised wav |
| Service worker law | `satellites/fathom/sw.js` lines 1 to 16 | CORE ships no worker (CATALOG-PLAN D2). Each game's `sw.js` precaches `../math/core/*.js?v=` and only deletes its own caches |
| Decisions log | `satellites/wardian/docs/DECISIONS.md` | Newest last, one bold line of what and the why |

Not inherited, on purpose: `music-unlocks.js` (CATALOG-PLAN D3, the catalog promises no network after load), RESONARC
(it does not exist, CATALOG-PLAN 2.3), a root service worker and a root hub (D2, D6 of the plan's section 2).

---

## 3. CORRECTIONS TO THE HANDOFF (binding; each forced by the repo, a fleet law or arithmetic)

3.1 **Layout.** The handoff's `/core/`, `/sw.js`, `/index.html` and `/config/` assume the catalog owns an origin. Here:
`satellites/math/core/` (the modules), `satellites/math/core/demo/` (the dummy game), `satellites/math/config/` (the
teacher URL builder, P3), `satellites/math/index.html` (the landing, built with SPAN's listing, not in CORE). No root
worker (CATALOG-PLAN D2).

3.2 **Two module files, not one.** `core/pure.js` holds everything that can be pure: `rng`, `adapt` (tier, staircase,
classify), the numberline's geometry (`lineGeometry(rng)`, `toNormalized`, `fromNormalized`), the schedule's deadline
math (`pickFrame(deadline, frameTimes)`), the store's schema step (`migrate(record, schema)`), `urlconfig.parse(search,
schema)`, `session` arithmetic and `collect` bookkeeping. `core/core.js` imports it and adds the DOM half: `tokens`
injection, `reveal`, the `settings` panel, the numberline renderer and loupe, `schedule.flash` on
`requestAnimationFrame`, `audio`, the `store` adapter over `localStorage`, the `collect` shelf. Why: the plan's law is
"`engine.js` is the sim, imported by Node directly"; one file mixing both makes the purity lint a list of exceptions.
The handoff's API names are kept exactly, re exported from `core.js`, so a game never imports `pure.js` itself.

3.3 **Randomness is injected.** The handoff's `widthPct: 0.72 + Math.random() * 0.22` becomes `lineGeometry(rng)` with
the same ranges. N1 (width and offset vary every round) is asserted over 100 rounds on 20 seeds, and a game's seam gate
can replay a round.

3.4 **Node reads the `.js` modules as ES modules** through `satellites/math/package.json` containing
`{"type": "module"}`. The root `package.json` does not declare a type, so without it Node would read `pure.js` as
CommonJS and every Node gate would fail on `export`. The file is harmless on the web (nothing fetches it).

3.5 **60 fps on a Celeron under 4x throttle cannot be measured on this box.** Headless Chrome here renders in software
on two cores at a few frames a second (the fleet's swiftshader scar), so a frame rate gate would be red for the box, not
the code. What CAN be proved here, and is: the flash picks the frame whose paint is nearest its deadline for any frame
interval (pure, `pickFrame` against synthetic frame timelines at 16.7, 33 and 200 ms), reaction time is timestamped
from the paint frame and does not move when a 100 ms render delay is injected (S2, in the browser), and nothing in a
flash uses `setTimeout` (lint). The 60 fps claim is Stephen's to check on a real Chromebook (section 11).

3.6 **Audio is written fresh** (RESONARC does not exist): `audio.define({ name: { build(ac, out) } })`,
`audio.play(name)`, `audio.setMuted(bool)`, muted by default on first load (G12), every voice setting its own gain
because a fresh GainNode's gain is one, one sound per event (A1, a comment at every call site), fully playable muted
(A2). An ear gate renders every defined voice offline.

3.7 **The forbidden strings** are the handoff's five plus the plan's `brain power`, matched case insensitively over every
string in `core/` and later every game: `IQ` as a word, `brain train`, `brain-train`, `smarter`, `cognitive enhance`,
`brain power`.

3.8 **The store's namespace** is the handoff's `lw:<gameId>:<key>`, with one record per game under `lw:<gameId>:save`
carrying `{ v, collect, adapt, settings }`. On a schema mismatch `migrate` keeps `collect` and discards `adapt` (the
handoff's own rule: a child losing collectibles is a harm). Two tabs: read, modify, write per change, and a `storage`
event reloads (the fleet scar of two tabs clobbering localStorage).

3.9 **A shared sprite helper, added.** CATALOG-PLAN section 5 has every game draw code pixel sprites at integer scale;
nine copies of the drawing loop is the duplication CORE exists to prevent. `core.js` exports `sprite.draw(ctx, grid,
palette, x, y, scale)` (integer scale enforced, `imageSmoothingEnabled = false`) and `core/tools/sheet.mjs` renders a
game's sprite table to one PNG to open. Logged in DECISIONS as an addition to the handoff.

3.10 **Copy.** The handoff's near miss prefix `close — ` becomes `close, ` (CATALOG-PLAN 2.2). Every caption CORE ships
is a fact: `3/4 is here`, `close, 3/4 is here`.

3.11 **Every game that imports CORE bumps its own stamp when CORE changes**, exactly as a `music-unlocks.js` edit bumps
every includer (the fleet's scar): a query string only busts the cache of the URL that carries it.

---

## 4. ARCHITECTURE LAW

```
satellites/math/
├── package.json                 {"type":"module"}, for Node only (3.4)
└── core/
    ├── pure.js                  PURE. rng, adapt, lineGeometry, pickFrame, migrate, urlconfig, session, collect math
    ├── core.js                  imports ./pure.js?v=<stamp>; tokens, reveal, settings, numberline, schedule, audio,
    │                            store, collect, sprite; re exports the handoff's API names
    ├── core.css                 tokens as custom properties, tabular lining numerals, focus ring, reduced motion
    ├── STAMP.js                 export const STAMP = '<stamp>' (the one string lint compares every import against)
    ├── demo/index.html          the dummy game: place a stone on an unmarked line, the reveal, a keyboard path
    ├── test/pure.mjs            Node: rng, adapt (tier floor, staircase convergence, classify 5 x 200), N1, pickFrame,
    │                            migrate, urlconfig, session caps, collect (no duplicates, one per run)
    ├── test/harness.mjs         copied from fathom (section 2), with `requests` and `keys` helpers added
    ├── test/demo.mjs            browser: the reveal contract on the demo, both paths, by real taps and by keyboard
    ├── test/layout.mjs          browser: demo and settings at 320x568, 375x667, 412x915 and 1366x768
    ├── test/audio.mjs           browser: the ear gate over every voice CORE defines
    ├── test/shared.mjs          the shared assertions the nine games import (section 5, P3)
    ├── tools/check.js           ALL GATES PASSED
    ├── tools/lint.mjs           the laws in section 0 plus 3.7 and the purity ban on pure.js
    ├── tools/sheet.mjs          sprite sheet to PNG
    └── docs/DECISIONS.md  docs/shots/
```

Stamp: `STAMP.js` holds it; `core.js` imports `./pure.js?v=<STAMP>`; the lint reads `STAMP.js` and asserts every
relative import in `core/` and `demo/` carries exactly that string. The first stamp is the day P0 lands.

---

## 5. THE PHASES, WITH GATES

Every gate is watched to fail once by a planted mutation before it counts, and both lines go in section 13.

### P0. The gate that fails, and the laws (about 2 hours)
1. `test/pure.mjs` asserting `rng(seed)` is deterministic and uniform enough (mean of 10 000 draws within 0.02 of 0.5
   on 20 seeds); red with no `pure.js`, green with it.
2. `tools/lint.mjs`: `vm` parse of every module (as modules), no runtime `.mjs`, every relative import stamped with
   `STAMP.js`, `pure.js` never names `document`, `window`, `Date`, `performance`, `Math.random` or `setTimeout`,
   `getUserMedia` appears nowhere (G4), the forbidden strings (3.7), no dash and no exclamation point in any string
   literal that reaches the DOM, dupkeys. Each rule red on a planted line.
3. `tools/check.js` with the two node gates.

### P1. Tokens, store, settings, urlconfig (about 3 hours)
- `core.css` and `tokens.inject(palette)`; `test/layout.mjs` on the demo shell asserts computed
  `font-variant-numeric` contains `tabular-nums` on every numeral bearing element (the handoff's assertTabularNumerals).
- `migrate` and the store adapter: pure laws for a v0 record (collect kept, adapt dropped), a garbage record (fresh
  record, no throw), a future version (fresh adapt, collect kept); browser law that a second tab's write is picked up.
- `urlconfig.parse(search, schema)`: a table of good and bad queries, unknown keys ignored, bad values fall back.
- Settings panel: mute (default muted), reduced motion, show all modes, high contrast, clear data; 48 px targets at
  three widths, keyboard reachable at 1366x768, clear data empties exactly `lw:<gameId>:*`.

### P2. The reveal, adapt, schedule, numberline, audio, session, collect (about 5 hours)
- **The demo** (`demo/index.html`): an unmarked line, a stone dragged or keyed onto it, commit, the reveal.
- **The reveal contract as gates** (`test/demo.mjs`): the learner mark is painted on a frame BEFORE the truth mark
  appears and is still present on the last frame; the truth mark appears second; the caption states a fact (no
  `wrong`, `try again`, `missed`, `incorrect`, a grep over every caption CORE can build); the correct and incorrect
  paths run the same animation, proved as a DIFFERENTIAL: the frame sequences of a correct and an incorrect round
  differ only inside the two marks' boxes and the caption's box; a near miss is counted and captioned `close, `; no
  colour means correctness, proved as a differential of the whole frame outside the marks between the two paths.
- **adapt.tier and adapt.staircase** (pure): the floor holds under any run of failures on 20 seeds; tier moves only on
  the configured streaks; the staircase converges near 70.7 percent correct against a synthetic responder with a known
  psychometric curve; nothing about a tier reaches the DOM (a grep of the demo's DOM for the tier value after 50 rounds).
- **schedule** (pure `pickFrame` at three frame intervals, 3.5) and the browser S2 law with an injected 100 ms delay;
  the S3 dev warning when `onMasked` is missing.
- **numberline**: N1 over 100 rounds on 20 seeds (width and offset standard deviation above a floor derived from the
  ranges); the loupe appears on a touch drag and not on a mouse drag; the committed normalized position equals the
  geometry's inverse of the drop point.
- **audio**: muted on first load; one play per event (a counter on the wrapper, the demo's commit plays once); the ear
  gate's three bands.
- **session and collect**: one collectible per completed run, no duplicates, a hard cap ends the session and offers
  nothing more.

### P3. classify, the shared assertions, the config builder, the sprite helper (about 3 hours)
- `adapt.classify` identifies five synthetic responder types (L, S, truth, a noisy L, a guesser that must come back
  unclassified) across 200 simulations each, with the handoff's `minItems`, `minDiscriminating` and `threshold`.
- `test/shared.mjs`: `assertNoNetworkAfterLoad`, `assertNoGetUserMedia`, `assertForbiddenStrings`,
  `assertKeyboardCompletable(steps)`, `assertTabularNumerals`, `assertLineRandomization`, `assertTimingPicksNearest`
  (3.5), each proved red on the demo with a planted fault.
- `satellites/math/config/index.html`: dropdowns built from the schemas registered by each game, producing a URL that
  `urlconfig.parse` round trips for the demo and for SPAN's schema once it exists (until then, two demo schemas).
- `sprite.draw` and `tools/sheet.mjs`: a non integer scale throws; the sheet PNG opened with three faults named.

**CORE is done** when `tools/check.js` prints ALL GATES PASSED under the lock, every gate above has a red line in
section 13, the demo shots are opened, it is deployed and the served `core.js?v=` probed.

---

## 6. THE SCREENS

- **The demo** at 320x568, 375x667, 412x915 portrait and 1366x768 landscape with a keyboard and no touch: the line, the
  stone, the reveal. Not a game; its look is judged only on whether the reveal reads.
- **The settings panel** as nine games will see it, on the demo.
- **The config builder** (P3): one column, a dropdown per parameter, the URL in a copyable field. Words only a teacher
  reads, still no dash.
- **No bottom left seat** for the music chip: these nine carry no chip (CATALOG-PLAN D3, Stephen's call 2 with that
  default).

---

## 7. ART

CORE has no art of its own. It ships `sprite.draw` and `tools/sheet.mjs` (3.9) so each game's code drawn pixel sprites
are drawn one way and looked at one way. Painted sheets are Stephen's, later (CATALOG-PLAN section 5).

---

## 8. LISTING

None. CORE is not a game. The catalog's landing page and each game's portal row come with the games.

---

## 9. PITFALLS (studio scars that apply here)

- ES module imports are separate URLs: a stamp on the entry point does not reach `import './pure.js'` (aura-off,
  2026-08-29). The lint is the guard.
- The host serves `.mjs` as `text/plain`: runtime modules are `.js` (3.4 is how Node still reads them as modules).
- A fresh GainNode's gain is ONE; three games clipped green on Sep 07.
- A duplicate object key is legal and silent; dupkeys in the lint.
- `el.click()` proves nothing; `elementFromPoint` at the centre, and the harness's synchronous down and up.
- `justify-content:center` on a scrolling column clips its top at 320; flex-start with the margin auto pair.
- A gate that sets the state it asserts is decoration: the store laws write a fixture and RELOAD into it.
- A colour threshold read off one variant passes by luck: the reveal's no colour law is a differential.
- `innerHeight` lies on a phone; measure the element or `visualViewport`.
- A batch patch that writes once at the end loses everything when a later assert fails; assert each match.
- Two tabs clobber `localStorage` unless every write is read, modify, write.

---

## 10. DECISION RIGHTS AND OPEN QUESTIONS (the build takes the default and logs it)

| Question | Whose | Default the build takes |
|---|---|---|
| Shared core rather than nine single files (the handoff says ask) | Stephen, CATALOG-PLAN call 3 | Shared core |
| No music chip in the nine | Stephen, call 2 | No chip |
| Spoken numerals by Web Speech | Stephen, call 8 | CORE exposes `speak(text)` that is a no op without the API; the numeral is always on screen |
| The sprite helper in CORE (3.9) | builder | Built, logged |
| `pure.js` split (3.2) | builder | Built, logged |
| Forbidden string `IQ` as a whole word only (so `liquid` is not a hit) | builder | Whole word, case sensitive for `IQ`, case insensitive for the rest, logged |

---

## 11. STEPHEN ONLY

- 60 fps under load on a real school Chromebook (3.5). The box cannot measure it.
- The ten design specs the handoffs cite (CATALOG-PLAN call 6); CORE v1 is built from the handoff.

---

## 12. HONEST SIZING

About 13 hours of building (P0 2, P1 3, P2 5, P3 3), which is the plan's 1.5 days, on two cores with every browser
gate under the lock. Where a session stops well: after P2 (the reveal proven against the demo), because SPAN needs P1
and P2 and not P3's classifier.

---

## 13. EVIDENCE LEDGER (fill in place, with commands and their real output, most recent last)

### P0 step 1, the gate that fails first (2026-09-15)

`satellites/math/package.json` (`{"private": true, "type": "module"}`) and `core/test/pure.mjs` written, no `pure.js`:
```
$ cd satellites/math/core && node test/pure.mjs
  FAIL  pure.js loads as an ES module (Cannot find module '/workspaces/lucid-winds/satellites/math/core/pure.js' imported from /workspaces/lucid-winds/satellites/math/core/test/pure.mjs)

1 PURE FAILURE(S)
exit 1
```
`core/pure.js` with `rng` (mulberry32, the fleet's stream from `satellites/wardian/index.html` `makeRNG`):
```
$ node satellites/math/core/test/pure.mjs
  ok    rng is exported
  ok    the same seed gives the same thousand draws
  ok    and a different seed gives different ones
  ok    every draw on twenty seeds is in [0, 1) (0 outside)
  ok    and the mean of ten thousand draws is within 0.02 of a half on every seed (worst 0.0059)
PURE OK
```

### P0 steps 2 and 3, the laws and the runner (2026-09-15)

`core/tools/lint.mjs` (eight laws over everything a browser loads from `satellites/math/`), `core/STAMP.js`
(`20260915a`) and `core/tools/check.js` (an ES module in the fleet runner's shape). On the live tree:
```
  ok    every runtime module parses as an ES module (2 of them)
  ok    nothing a browser loads is a .mjs
  ok    core/STAMP.js names the one stamp: 20260915a
  ok    every relative import and local asset carries ?v=20260915a (0 of them)
  ok    pure.js touches no screen, clock or unseeded die
  ok    getUserMedia appears nowhere a browser loads
  ok    none of the forbidden strings appears anywhere a browser loads
  ok    no dash in anything a player reads (0 strings)
  ...
LINT OK
lint            pass  0s
pure            pass  0s
ALL GATES PASSED
```
Every law watched red, each on a folder copy of `satellites/math` with one planted file (session scratch
`core-lint-mutants.cjs`, `core-lint-r8.cjs`):
```
r1 `export const broken = ;` in pure.js     FAIL every runtime module parses as an ES module: core/pure.js: SyntaxError: Unexpected token ';'
r2 a core/extra.mjs                          FAIL nothing a browser loads is a .mjs: core/extra.mjs
r3 import './pure.js', unstamped             FAIL every relative import and local asset carries ?v=20260915a: core/core.js loads ./pure.js
r3 import './pure.js?v=20260101a'            FAIL ... core/core.js loads ./pure.js?v=20260101a
r4 Date.now() in pure.js                     FAIL pure.js touches no screen, clock or unseeded die: it names Date
r5 getUserMedia in core.js                   FAIL getUserMedia appears nowhere a browser loads: core/core.js
r6 COPY says "it makes you smarter"          FAIL none of the forbidden strings appears anywhere a browser loads: core/core.js says smarter
r7 COPY with an em dash, a bang, Sky Walk    FAIL no dash; FAIL and no exclamation point; FAIL and the studio is Sky Wolf Studio, singular
r7 el.textContent = 'Try it again'           FAIL and no sentence is written to the page from outside COPY: core/core.js: "Try it again"
r7 a page saying "Nice work — keep going!"   FAIL no dash; FAIL and no exclamation point
r8 X.a twice, across lines                   FAIL no object literal declares the same key twice: core.js X.a on lines 3 and 4
r8 COPY.near twice inside Object.freeze      FAIL no object literal declares the same key twice: core.js COPY.near on lines 3 and 4
```
⛔ **The first r8 went GREEN** (`LINT OK`, and "0 literals read" on the live tree): the shared `tools/dupkeys.mjs` opens
a literal only on a line starting `var|let|const NAME = {`, and a module writes `export const NAME = Object.freeze({`.
CORE's lint now blanks both prefixes to spaces of equal length before the sweep. That first plant also had both keys on
one line, which the shared sweep leaves alone by design, so the plant was rewritten across lines, in both shapes.
DECISIONS, the dupkeys entry.

---

## 14. THE OVERNIGHT PROTOCOL

HANDOFF-OPUS-SEP15 prompt: never wait on a human; an ambiguity is the smallest reasonable choice logged in
`satellites/math/core/docs/DECISIONS.md`; a gate red after three honest attempts goes into SESSION STATE as BLOCKED with
its last thirty lines; never weaken, skip or delete a gate; commit and push the moment something is green.

---

## 15. THE MORNING REPORT (most recent on top)

(none yet)
