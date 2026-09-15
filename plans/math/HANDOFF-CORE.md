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

- 2026-09-15, Opus: **CORE IS DONE, P0 to P3.** `satellites/math/core/` (`pure.js`, `core.js`, `core.css`, the demo,
  nine gates) and `satellites/math/config/` (the teacher's link builder). The whole check in the foreground: lint, pure,
  layout, demo, audio, schedule, shared, config, sprite, **ALL GATES PASSED**, and every law in every gate watched red
  on a planted fault (section 13). P3 step 4 closed it: `sprite.draw` and `tools/sheet.mjs`, the sample sheet opened with
  three faults named. ⛔ Across CORE, nine laws of my own were decoration, flaky or aimed wrong until a plant, a probe or
  a close pass showed it; each is rewritten and written up where it happened.
  **Next action:** record the deploy proof of the served `core/core.js?v=` carrying `export const sprite` (after this
  commit's push) in section 13, then lane C's next game: write `plans/span/HANDOFF-SPAN.md` in the twelve's template from
  `assets/math-catalog/08-SPAN-handoff.md`, `plans/math/CATALOG-PLAN.md` and this file (catalog plan section 8 lists
  what it must carry), commit it, then SPAN's P0. SPAN registers its real schema in `satellites/math/config/schemas.js`
  when it ships, replacing the draft.
  **Stephen's, from CORE:** 60 fps on a real school Chromebook (3.5); `.gitignore` needs `!satellites/math/package.json`
  (Fable's fence); SPAN's `?standard=0` override (not offered meanwhile).
- 2026-09-15, Opus: **P3 step 3 is DONE: the teacher's link builder.** `satellites/math/config/` (`index.html`,
  `config.js`, `schemas.js` with the demo and a draft Span schema that offers no switch off S1), `buildQuery` in
  `pure.js` as `parseConfig`'s inverse, `test/config.mjs` in `tools/check.js`. The whole check in the foreground: lint,
  pure, layout, demo, audio, schedule, shared, config, **ALL GATES PASSED**, eight gates. Every builder law and every
  `buildQuery` law watched red. ⛔ The first live run went red six times on the gate's own typing (a triple click that
  selected nothing, so 40 became 1040); a probe of the field showed the builder refusing it correctly.
  **Next action:** P3 step 4, the last of CORE. `sprite.draw(ctx, grid, palette, x, y, scale)` in `core.js` (a sprite
  is an array of strings, one character a palette index or `.` for clear; a non integer scale throws;
  `imageSmoothingEnabled` off) and `core/tools/sheet.mjs` (renders a sprite table to one PNG under `docs/` to open with
  three faults named). Laws first: a browser gate that draws a known grid at scale 3 and reads the pixels back exactly,
  refuses scale 2.5, and draws nothing for `.`. Then CORE is done: deploy proof of the served `core.js?v=`, the section
  10 report, and SPAN's plan (`plans/span/HANDOFF-SPAN.md`) before SPAN's P0.
- 2026-09-15, Opus: **P3 step 2 is DONE: the shared assertions.** `core/test/shared.mjs` (seven assertions returning
  `{ ok, detail }`) and `core/test/shared-proof.mjs` (each green on the live demo and red on a real planted fault), the
  `shared` gate in `tools/check.js`. Seven gates, ALL GATES PASSED in the foreground. ⛔ The proof's first run caught a
  fault in an assertion, not a plant: a game's own words were matched in raw source and a comment in `pure.js` tripped
  it. They are matched in copy only now, with a pair proving comments and field names stay green.
  **Next action:** P3 step 3, the teacher config builder at `satellites/math/config/index.html`: dropdowns built from
  the URL schemas a game registers (`parseConfig`'s shape), producing a URL that `parseConfig` round trips. Until SPAN
  exists, two demo schemas (the demo's `seed`, and a SPAN shaped `mode`, `standard`, `count`). Its gate first, in the
  foreground: every control 48 px at three widths and keyboard reachable at 1366x768, every generated URL round trips
  through `parseConfig` to the chosen values, no network after load, copy through the lint. Then step 4, `sprite.draw`
  and `tools/sheet.mjs`.
- 2026-09-15, Opus: **P3 step 1 is DONE: `adaptClassify`.** In `pure.js`, re exported from `core.js`: matches over the
  discriminating items only, nothing said below `minItems` or `minDiscriminating`, every rule above the threshold listed
  best first, a code only when one rule is above (GAUGE maps two above to its apparent expert). Laws in `test/pure.mjs`
  on 200 simulated children per responder; all six plants red. ⛔ The apparent expert law was too weak before any plant
  ran ("never coded truth" would pass a classifier that named L); it asks for no code now, and one plant is red only
  because of that.
  **Next action:** P3 step 2, `core/test/shared.mjs`: the assertions the nine games import (`assertNoNetworkAfterLoad`,
  `assertNoGetUserMedia`, `assertForbiddenStrings`, `assertKeyboardCompletable(steps)`, `assertTabularNumerals`,
  `assertLineRandomization`, `assertTimingPicksNearest`), each a function taking a puppeteer page or a folder and
  returning `{ ok, detail }`, with `test/shared-proof.mjs` proving every one red on a planted fault against the demo and
  green on the live demo, run in the foreground. Then the config builder and the sprite helper.
- 2026-09-15, Opus: **P2 IS DONE.** `schedule.flash` (animation frames only, the paint stamped on the frame after the
  show, the hide chosen by where it paints, the mask on the hide frame, a warning without one) and `sessionStep` (time
  handed in, an end that is final), `test/schedule.mjs` in `tools/check.js`, the session laws in `test/pure.mjs`. Six
  gates: lint, pure, layout, demo, audio, schedule. Every law watched red. ⛔ Two more laws of mine were loose until a
  plant or a close pass showed it: the session's after the end law (a capped session re-ended itself, so a deleted guard
  stayed green) and the flash's delay premise (84 against a bound of 80). Both rewritten, the plant rerun red.
  **Next action:** P3 (section 5). First `adaptClassify(responses, { rules, minItems, minDiscriminating, threshold })` in
  `pure.js`, its laws written first in `test/pure.mjs` against five synthetic responders (a linear placer, a logarithmic
  placer, one who knows the truth, a noisy logarithmic placer, and a guesser who must come back unclassified), 200
  simulations each, on the rule shapes YONDER and GAUGE will hand it. Then `test/shared.mjs`, the config builder
  (`satellites/math/config/index.html`), `sprite.draw` and `tools/sheet.mjs`. Browser gates in the foreground, one per
  call.
- 2026-09-15 04:05 UTC, Opus: **P2's AUDIO is DONE.** (Its next action, the flash and the session, is done above.) `audio` in `core.js` (voices built fresh, one play per call,
  muted by default, master 0.8, `renderLoud` through the same builders with a seeded noise), `onTruth` on the reveal,
  the demo's tock and chime, `test/audio.mjs` in `tools/check.js`. The whole check in the foreground: lint, pure,
  layout, demo, audio, ALL GATES PASSED. Every audio law watched red. ⛔ The seeded render law asked for `===` and went
  red on Chrome's float jitter (peaks 0.24540889 and 0.24540892); it holds to one part in a hundred thousand now, and
  unseeded noise misses that bound by 3.3e-2.
  **Next action:** P2's last two. `schedule.flash({ durationMs, onShow, onHide, onMasked })` in `core.js` on
  `requestAnimationFrame`, hiding with `hideNow` (S1), reaction time stamped from the paint frame and unmoved by an
  injected 100 ms delay (S2), a dev warning when `onMasked` is missing (S3): the gate first, a new `test/schedule.mjs`
  run in the foreground to watch it fail. Then `session` (run length, a hard cap that ends the session and offers
  nothing more) with its laws in `test/pure.mjs`. Then P3. Browser gates in the foreground, one per call.
- 2026-09-15, Opus: **P2's reveal, number line and demo are DONE.** (Its next action, the audio, is done above.) `numberline.create` and `reveal.show` in `core.js`,
  their styles, real rounds on `demo/index.html`, `test/demo.mjs` (the reveal contract, nine laws) in `tools/check.js`,
  `tools/shots.mjs`. Lint, pure, layout and demo green, each run alone in the foreground (background runs of the gates
  were stopped three times by the task runner for low memory; the gates never went under 4.7 GB available). Every
  reveal law watched red; ⛔ two of the gate's own faults found by plants and fixed (a recorder that stopped before it
  could see an erase, and the frame added for that read as a false fade). Seven shots opened, faults named in
  section 13.
  **Next action:** P2's `audio` against `core/test/audio.mjs`, which is written and has not run. Run it first in the
  foreground to watch it fail (`CORE_DEMO.audio` does not exist), then add `audio.define`, `play`, `setMuted` and
  `renderLoud(seconds, master)` to `core.js` (every voice sets its own gain; the render seeds its noise), give the
  demo a `place` and a `reveal` voice with one play per event, expose `CORE_DEMO.audio.sounded()` and `clear()`, and
  add the gate to `tools/check.js`. Then schedule's DOM flash and session, then P3.

- 2026-09-15, Opus: **P0 DONE.** `satellites/math/package.json`, `core/pure.js` (the rng), `core/STAMP.js`
  (`20260915a`), `core/test/pure.mjs`, `core/tools/lint.mjs` (eight laws), `core/tools/check.js`: ALL GATES PASSED
  (lint, pure; no browser gate exists yet, so none was left out). Every law watched red, section 13. ⛔ The duplicate
  key law was green on its first plant, because the shared sweep cannot open `export const X = Object.freeze({`;
  fixed in CORE's lint, logged in `core/docs/DECISIONS.md`.
  **Next action:** superseded by the entry above.
- 2026-09-15, Opus: **P1 DONE, and P2's pure half.** `core.js` (tokens, COPY, the store, the settings panel),
  `core.css`, the demo shell, `test/harness.mjs`, `test/layout.mjs` at four sizes; `migrate`, `parseConfig`,
  `adaptTier`, `adaptStaircase`, `lineGeometry`, `hideNow`, `collectOnce` in `pure.js`. Lint, pure and layout green;
  every law watched red (section 13). ⛔ Three laws were decoration until a plant showed it (the staircase's range, the
  sideways scroll, the no network window) and each was rewritten and watched red again.
  **Next action:** P2's DOM half against `core/test/demo.mjs`, which is written and has not run: in `core.js` the
  `numberline` renderer (an unmarked `.lw-line`, a draggable and keyed `.lw-stone`, a `.lw-loupe` on touch drags only),
  `reveal.show` (`.lw-mark-learner` first, `.lw-mark-truth` and `.lw-gap` second, `.lw-caption` from COPY), and on the
  demo page `CORE_DEMO.round()`, `results`, `revealDone()`, `next()`, `pixelFor(x)`, `valueAt(px)`, `stoneValue()`.
  Run the gate first to watch it fail with no line on the page, then build, then add it to `tools/check.js`.
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
⛔ **And the P0 commit went out without `satellites/math/package.json`**: the root `.gitignore` (line 98) ignores every
`package.json` at every level. A fresh clone would have read `pure.js` as CommonJS. Force added in `ff925eeb`; the
exception line belongs in `.gitignore`, outside this fence (a request to Fable, in DECISIONS).

### P1, the pure half: migrate and parseConfig (2026-09-15)

`migrate(record, schema)` (3.8: garbage gives a fresh record; the same version keeps everything and fills what is
missing and carries fields it does not know; a mismatch in either direction keeps the shelf and the child's settings
and discards the adaptive state) and `parseConfig(search, schema)` (every schema key, the asked value when valid, the
default otherwise, unknown keys ignored, never a throw) in `core/pure.js`, laws in `test/pure.mjs`. Live: `PURE OK`,
`LINT OK`. Every law watched red on a folder copy with one planted change (session scratch `core-p1-mutants.cjs`):
```
p1 the shelf dropped on a mismatch     FAIL an older version keeps every collectible (0 of 3); FAIL a future version ... (0 of 3)
p2 the tier kept on a mismatch         FAIL and the older adaptive state is discarded; FAIL and the future adaptive state is discarded
p3 a whitelist merge                   FAIL and a field this build does not know about rides along instead of being dropped
p4 no guard for a garbage record       FAIL a garbage record never throws: null, (undefined)
p5 an int with no range check          FAIL a value outside the schema falls back ("?mode=answer&count=41" gave ... "count":41); FAIL an int below its floor ...
p6 a percent escape not caught         FAIL broken percent escapes fall back without throwing ("?mode=%E0%A4%A&count=%" threw URI malformed)
p7 a bool that takes anything          FAIL a half number and a wrong bool fall back ("?count=12.5&standard=yes" gave ... "standard":false)
```

### P1, the DOM half: tokens, the store adapter, the settings panel, the demo shell, the layout gate (2026-09-15)

`core/core.js` (TOKENS, `tokens.inject`, COPY, `store` over `localStorage` with read, modify, write and `watch`,
`settings.mount`), `core/core.css` (tokens, tabular lining numerals on `html`, the focus ring, reduced motion that
shortens and never removes, the panel), `core/demo/index.html`, `core/test/harness.mjs` (copied from fathom's, plus a
request log after load and the 1366x768 keyboard size), `core/test/layout.mjs` in `tools/check.js`. Lint over the new
files: `LINT OK` (3 modules, 4 stamped loads, 13 player strings).
**The layout gate's own faults, found by its first live runs, fixed before any red was trusted:**
1. `TypeError: top.click is not a function`: a thumb on the settings gear lands on the path inside its icon, and an SVG
   element has no `click()`. The harness's tap now climbs to the nearest clickable ancestor, as a real tap bubbles.
2. Every size red on `nothing landed on the console: ... status of 404 (Not Found)`, with no URL. A probe of the demo
   alone: `404 http://127.0.0.1:45897/favicon.ico`. The demo declares an empty icon, and the harness records every
   failed response by address.
**Live, alone, under the lock, third run:** `LAYOUT OK`, every law at 320x568, 375x667, 412x915 and 1366x768 (keyboard:
`Tab reaches the gear with a visible focus ring (solid 3 px)`, `opening the panel by keyboard puts focus on its first
switch (muted)`, `Escape closes the panel and gives focus back to the gear`), and `a second tab hears Less motion turned
on in the first and applies it`.
**Watched red**, seven runs of folder copies under the lock (session scratch `core-layout-mutants.cjs`, every plant
asserted to match once), planted faults grouped only where one could not hide another:
```
L_css        tabular figures off, 9 px state text, focus ring none, 36 px switches, a 700 px body
             FAIL numerals are tabular and lining (normal | normal), at all four sizes
             FAIL every control in it is a 48 px target a thumb lands on: muted 360x36, reducedMotion 360x36, ... at all four
             FAIL and nothing in it is under 0.7 rem (9.0 px), at all four
             FAIL 1366x768 keyboard Tab reaches the gear with a visible focus ring (none 3 px)
L_behaviour  Escape handler gone, clear removes nothing, a console error, a fetch every 400 ms
             FAIL 1366x768 keyboard Escape closes the panel and gives focus back to the gear
             FAIL clearing the game empties everything it saved (1 keys left), at all four
             FAIL nothing landed on the console: console: planted, at all four
L_muted_default   muted false by default   FAIL a first load is muted in the store (G12), and Sound reads Off, at all four (and the two laws after it)
L_focus_first     open() moves no focus    FAIL 1366x768 keyboard opening the panel by keyboard puts focus on its first switch (lw-btn lw-settings-open)
L_never_written   update() never writes    FAIL turning Sound on through its switch writes it to the store; and after a reload Sound still reads On, at all four
L_motion_class    the class never set      FAIL Less motion puts its class on the root and takes it off again, at three; FAIL a second tab hears ...
L_deaf_tab        watch() never called     FAIL a second tab hears Less motion turned on in the first and applies it
```
⛔⛔ **Two laws stayed GREEN over their plants, so the first version of the gate had two pieces of decoration in it:**
1. `the page does not scroll sideways` read `scrollWidth - innerWidth`, and on a mobile viewport a 700 px body widens
   the layout viewport and `innerWidth` with it (the fleet's innerWidth scar). It measures against the width the gate
   asked for now: `FAIL 320x568 the page does not scroll sideways (380 px over 320)`, 325 over 375, 288 over 412.
2. `nothing was fetched after load (G2)` counted the request log about 0.4 s after load, before a fetch planted every
   400 ms had fired once. A probe of the planted copy showed the harness logging all five fetches in two seconds, so
   the fault was the law's timing, not the log. It counts after the settings round trip and 1.5 s of idle now: `FAIL
   320x568 nothing was fetched after load, through the settings and 1.5 s of idle (G2): 4,
   http://127.0.0.1:42365/core/core.css?v=20260915a`, at all four sizes.
**Live after both fixes, alone, under the lock:** `LAYOUT OK`, `the page does not scroll sideways (0 px over 320)` and
the G2 law green at all four sizes.

### P2, the pure half: adaptTier, adaptStaircase, lineGeometry, hideNow, collectOnce (2026-09-15)

The laws first, with nothing behind them: `FAIL adaptTier is exported` and the same for the other four, `5 PURE
FAILURE(S)`. Then the functions. Live `PURE OK`, with the numbers the laws carry:
```
  ok    no run of failures on twenty seeds ever routes a child below the floor (0)
  ok    and settles where the responder is right about 70.7 percent of the time on every seed (worst off by 0.052)
  ok    a child always right stops at the hardest setting and one always wrong at the easiest (50 and 1500)
  ok    and the width and the offset vary every round, 100 rounds on twenty seeds (smallest spread 0.058 and 0.020, 0 repeats)
  ok    a point on the line and its pixel are each other's inverse (worst 3.3306690738754696e-16)
  ok    a flash hides on the frame nearest its deadline at every frame rate (16.7 ms frames: worst 8.5 ms; 33.3 ms frames: worst 17.4 ms; 200 ms frames: worst 119.4 ms)
```
Every law watched red on a folder copy with one planted change (session scratch `core-p2-mutants.cjs`):
```
q1 the floor ignored             FAIL no run of failures on twenty seeds ever routes a child below the floor (40)
q2 a streak kept through a miss  FAIL and a broken streak moves nothing
q3 one down one up               FAIL and settles where the responder is right about 70.7 percent ... (worst off by 0.244)
q4 no clamp                      FAIL a child always right stops at the hardest setting ... (-1900 and 5600)
q5 a fixed width                 FAIL and the width and the offset vary every round ... (smallest spread 0.000 and 0.021, 0 repeats)
q6 the handoff's offset, uncapped FAIL every line is 72 to 94 percent of its container, offset up to 8 percent, and inside it (23 outside)
q7 hide on the first frame past   FAIL a flash hides on the frame nearest its deadline ... (16.7: worst 17.7 ms; 33.3: 34.6 ms; 200: 194.9 ms)
q8 duplicates                    FAIL a collectible lands once and a second award of it adds nothing
q9 the shelf changed in place    FAIL and the shelf handed in is not changed underneath its owner
```
⛔ **q4 is why the always right and always wrong law exists**: the first range law ("never leaves its range on twenty
seeds") stayed green with the clamp deleted, because its responder never drives the level near either end. A law
nobody watched fail against the fault it names is decoration; this one was caught before it counted.

### P2, the DOM half: the reveal gate first (2026-09-15)

`core/test/demo.mjs` (nine laws of the reveal contract, section 5 P2) written before the demo had a line on it, run
alone under the lock:
```
$ node satellites/math/core/test/demo.mjs
Error [TypeError]: CORE_DEMO.round is not a function
exit 1
```
Then `numberline.create` and `reveal.show` in `core.js`, their styles in `core.css`, and real rounds on the demo (a
fraction from `rng`, `lineGeometry` per round, tolerance 0.05, near beyond a quarter of it). One fault of the gate's own,
fixed before it ran against the build: its same animation law matched nearest frames lined up on the first frame the
truth showed, which on software rendered frames up to 200 ms apart compares two different moments; it now places every
frame by its time since the page's own `truthAt` and interpolates each round against the other. Live, alone, under the
lock:
```
  ok    the child's mark is painted before the truth (frame 1 against 21)
  ok    and it is still there on the last frame of the reveal
  ok    its caption states a fact ("1/3 is here")
  ok    the loupe shows while a thumb drags the stone
  ok    the committed value is the pure half's reading of the drop point (0.9500 against 0.9500)
  ok    a right round and a wrong round run the same reveal (largest difference in the truth mark's and the gap's opacity 0.010 at the same moment, 240 comparisons)
  ok    and no colour on the stage differs between a right round and a wrong one
  ok    the line moved between rounds (25,250 then 17,273)
  ok    a near miss counts as correct and is marked near
  ok    and its caption is prefixed close ("close, 1/3 is here")
  ok    a mouse drag shows no loupe
  ok    Tab reaches the stone
  ok    the right arrow moves it along the line (0.000 to 0.050)
  ok    and Enter commits where it stands (0.050)
DEMO OK
lint pass, pure pass, layout pass 14s, demo pass 9s: ALL GATES PASSED
```
**Watched red**, six runs of folder copies under the lock (session scratch `core-reveal-mutants.cjs`):
```
A the child's mark added only when the truth shows   FAIL the child's mark is painted before the truth (frame 22 against 22)
B near never counted                                 FAIL a near miss counts as correct and is marked near; FAIL and its caption is prefixed close ("1/3 is here")
B the loupe on a mouse drag too                      FAIL a mouse drag shows no loupe
B the arrows dead                                    FAIL the right arrow moves it along the line (0.000 to 0.000)
C a verdict in the caption                           FAIL its caption states a fact ("wrong, 1/3 is here")
C one fixed line for every round                     FAIL the line moved between rounds (50,274 then 50,274)
C no loupe on a touch drag                           FAIL the loupe shows while a thumb drags the stone
D a right round animates three times faster          FAIL a right round and a wrong round run the same reveal (largest difference ... 0.665 at the same moment, 240 comparisons)
E a right round's truth mark turns green             FAIL and no colour on the stage differs between a right round and a wrong one
G the stone reads its drop point 6 px off            FAIL the committed value is the pure half's reading of the drop point (0.9740 against 0.9500), and the right round's two laws after it
```
⛔ **One law stayed GREEN over its plant:** run B also removed the child's mark on the reveal's last step, and "and it is
still there on the last frame of the reveal" passed, because the recorder stopped on the very step the reveal finished
and never saw a frame after the removal. The gate now takes its last frame two animation frames after the reveal says
it is done; the plant was rerun alone against it:
```
== demo live, the recorder fixed: ok and it is still there on the last frame of the reveal ... DEMO OK
== H_learner_erased: FAIL and it is still there on the last frame of the reveal
                     FAIL a right round and a wrong round run the same reveal (... 0.232 at the same moment, 248 comparisons)
```
⛔ That second red was the gate's, not the plant's: the new after frame carries no truth mark, and the same animation
law read it as opacity 0, a false drop at the end of one curve. A live run could have gone red on it by timing alone.
After frames are left out of the curve now. Rerun: live `DEMO OK` (`a right round and a wrong round run the same reveal
(largest difference ... 0.005 at the same moment, 244 comparisons)`), and the erase plant red on its law alone:
`== H_learner_erased (exit 1)  FAIL and it is still there on the last frame of the reveal  1 DEMO FAILURE(S)`.
(Two background chains that ran these were killed by the box for low memory, with 4.8 GB available and about 350 MB
free, no browser left behind either time; the gates were rerun in shorter separate runs.)
**The whole check, as its four gates, in the foreground.** A third background run, `tools/check.js` on its own, was
killed the same way before it printed anything. Run in the foreground instead, one gate at a time under the lock, with
free memory sampled every second beside each browser gate:
```
LINT OK
PURE OK
LAYOUT OK      layout exit 0    lowest free 240 MB, lowest available 4745 MB
DEMO OK        demo exit 0      lowest free 204 MB, lowest available 4729 MB
  ok    a right round and a wrong round run the same reveal (largest difference ... 0.009 at the same moment, 244 comparisons)
```
The gates never came near the box's memory. The kills are the background task runner's, on long runs, so from here
CORE's browser gates run in the foreground, one per call.

### P2, audio: the ear gate first (2026-09-15)

`core/test/audio.mjs` (first load muted, one play per event, the master differential with seeded noise, the three
bands), run in the foreground alone under the lock before any audio existed:
```
  FAIL  the demo exposes what its audio did (CORE_DEMO.audio)
  ok    nothing landed on the console
1 AUDIO FAILURE(S)
```
Then `audio` in `core.js` (voices, one play per call, muted by default, a master bus, `renderLoud` through the same
builders with a seeded noise), `onTruth` on `reveal.show`, and the demo's two voices. First live run: every law green but
one, `FAIL and the same render twice gives the same numbers (the noise is seeded)`, while the master differential read
`ratio 0.500`, `0.245 to 0.123`. A probe rendered the same seeded pattern three times:
```
render 0: peak 0.24540889263153076  rms 0.034284366555817507
render 1: peak 0.24540892243385315  rms 0.034284366556906039
render 2: peak 0.24540887773036957  rms 0.034284366557500244
two second renders: 0.21934509277343750 0.037258088865755455 | 0.21934509277343750 0.037258088884232980
```
The noise was seeded (unseeded, a peak moves in its second digit); Chrome's offline renderer is not bit identical from
one render to the next. The law was wrong to ask for `===`: it holds to one part in a hundred thousand now, and a plant
of `Math.random` in place of the seed is what has to prove that bound still sees unseeded noise.
**Live, alone, in the foreground, under the lock:**
```
  ok    a first load is muted: a whole round played nothing ([])
  ok    with Sound on, one commit plays one placing sound and one reveal sound (["place","reveal"])
  ---   twenty loud seconds: peak 0.245  rms 0.0343  above 3 kHz 0.1 percent
  ok    every voice passes through the master: halving it halves the level (ratio 0.500)
  ok    and the peak comes down with it: 0.245 to 0.123
  ok    and the same render twice gives the same numbers to one part in a hundred thousand, the noise is seeded (peak off by 0.0e+0, rms by 2.7e-10)
AUDIO OK
```
**Watched red**, five folder copies in the foreground, one browser at a time (session scratch `core-audio-mutants.cjs`):
```
a the render's noise from Math.random     FAIL ... the noise is seeded (peak off by 3.3e-2, rms by 1.0e-3)
b muted false by default                  FAIL a first load is muted: a whole round played nothing (["place","reveal"]); and the next law
c the tock played twice per commit        FAIL with Sound on, one commit plays one placing sound and one reveal sound (["place","place","reveal"])
d the render bypasses the master bus      FAIL every voice passes through the master (ratio 1.000); FAIL and the peak comes down with it: 0.307 to 0.307
e the chime never sets its gain           FAIL nothing clips: peak 1.782 (under 0.90)
f the tock pitched to 4 kHz, square wave  FAIL it is not an alarm: 33.0 percent of its energy above 3 kHz (under 30)
```
The seeded bound holds with room: unseeded noise misses it by more than three orders of magnitude. Plant f lands just
over its band (33.0 against 30); the band is the fleet's and is not moved.
**The whole check, in the foreground, under the lock:** `lint pass 0s, pure pass 0s, layout pass 15s, demo pass 10s,
audio pass 5s`, **ALL GATES PASSED**.

### P2, the flash and the session: the laws first (2026-09-15)

`core/test/schedule.mjs` (the flash's duration at 100, 400 and 750 ms within 25 ms or 0.6 of a measured frame; no timer
in `schedule`; reaction time from the paint unmoved by a 100 ms render delay while time from the request moves; a
warning without `onMasked`; the mask on the frame the stimulus goes) and the session laws in `test/pure.mjs` (ends at
its run length, a hard cap ends it mid round, nothing after the end revives it, twenty random sessions), both run
before the code existed:
```
$ node test/pure.mjs
  FAIL  sessionStep is exported
1 PURE FAILURE(S)
$ node test/schedule.mjs   (foreground, alone, under the lock)
  FAIL  core.js exports schedule
  FAIL  and nothing in it uses a timer (S1)
  FAIL  the demo exposes a flash to drive (CORE_DEMO.flash, CORE_DEMO.flashRT)
  ok    nothing landed on the console as an error
3 SCHEDULE FAILURE(S)
```
Then `sessionStep` in `pure.js` (re exported from `core.js`), `schedule.flash` in `core.js` (on animation frames only:
the stimulus up on one frame, the paint stamped on the next, each later frame asking `hideNow` about where its hide
would paint, the mask on the hide frame, a warning without one) and the demo's flash, mask and two hooks. Live:
```
  ok    a session ends when its run length is played ({... "rounds":5,"ended":true,"reason":"done","endedAt":5000})
  ok    the hard cap ends a session in the middle, whatever the rounds ({... "rounds":1,"ended":true,"reason":"cap","endedAt":300000})
  ok    on twenty random sessions no run passes its length and no cap fires early (0)
PURE OK
  ok    a 100 ms flash shows for 100 ms (within 25 ms, frames 17 ms apart)
  ok    and its mask goes down on the frame it goes away (212.2 and 212.2)
  ok    a 400 ms flash shows for 400 ms (within 25 ms, frames 17 ms apart)
  ok    a 750 ms flash shows for 750 ms (within 25 ms, frames 17 ms apart)
  ok    reaction time from the paint does not move with a 100 ms render delay (301 against 318 ms)
  ok    while time from the request does, so the delay was real (332 against 416 ms)
  ok    and one without onMasked warns, once (S3) (1)
SCHEDULE OK
lint, pure, layout 14s, demo 9s, audio 5s, schedule 4s: ALL GATES PASSED (foreground)
```
Frames here ran 17 ms apart for this page, not the few a second the 3.5 note feared, so the flash was measured at a
real rate. ⛔ The delay premise passed at 84 against a first bound of 80, too close to trust: frame alignment can absorb
up to about two frames of a 100 ms delay. That premise is 60 now (a run with no delay reads near 0); the law it protects,
reaction time from the paint within 40 ms, is unchanged. Rerun live with it: `301 against 302 ms` from the paint, `333
against 417 ms` from the request, `SCHEDULE OK`.
**Watched red** (session scratch `core-schedule-mutants.cjs`; the flash plants in the foreground, one browser at a time):
```
R1 a timer in schedule.flash                 FAIL and nothing in it uses a timer (S1)
R1 reaction time stamped from the request    FAIL reaction time from the paint does not move with a 100 ms render delay (332 against 416 ms)
R1 the onMasked warning deleted              FAIL and one without onMasked warns, once (S3) (0)
R2 hide on the frame after the deadline      FAIL a 100 ms flash shows for 133 ms; a 400 ms flash for 450 ms; a 750 ms flash for 800 ms (within 25 ms, frames 17 ms apart)
R2 the warning even with a mask              FAIL a flash with a mask does not warn
R3 the mask one frame after the hide         FAIL and its mask goes down on the frame it goes away (217.9 and 201.2), and at 400 and 750
q10 the cap ignored                          FAIL the hard cap ends a session in the middle (... "ended":false ...); FAIL and nothing after the end ...
q12 a round too many before the end          FAIL a session ends when its run length is played (... "rounds":5,"ended":false ...)
q13 the cap a millisecond early              FAIL and a millisecond under the cap does not
```
⛔ **q11, the guard after the end deleted, stayed GREEN** (`PURE OK`): the law fed its late events only to a session the
cap had ended, and each late event past the cap simply ended it again, so rounds stayed 1 and the reason stayed cap; the
moment of the end moved and nothing asked. The law now also feeds a session that ended by playing its rounds and holds
the end still on both. Live `PURE OK`; the same plant against it:
```
== q11_no_guard_after_end, against the rewritten law (exit 1)
  FAIL  and nothing after the cap revives it, counts a round or moves its end (... "endedAt":900000)
  FAIL  and a session that played its rounds stays played: no round six, no new end (... "rounds":7,"ended":true,"reason":"done","endedAt":8000)
2 PURE FAILURE(S)
```
The whole check on the P2 tree, in the foreground: lint, pure, layout 15s, demo 9s, audio 5s, schedule 4s, **ALL GATES
PASSED**. Committed as `e1408b8d`.

### P3 step 1, adapt.classify: the laws first (2026-09-15)

The laws in `test/pure.mjs`, on a synthetic item bank of GAUGE's kinds (separates L, separates S, apparent, both fail,
plain) with 200 simulated children per responder: a longer is larger child coded L, a shorter is larger child coded S,
a child who knows the truth coded truth, a noisy L child coded L most of the time and never S or truth, a guesser
unclassified, an L child on a poorly separating set scoring 85 percent or more with truth AND L above the threshold and
never coded truth (GAUGE's apparent expert), and nothing said on eleven items or on five discriminating ones. Run with
no function behind them:
```
$ node test/pure.mjs
  FAIL  adaptClassify is exported
1 PURE FAILURE(S)
```
Then `adaptClassify` in `pure.js` (matches over the discriminating items, nothing said below the two minimums, every
rule above the threshold listed best first, a code only when one rule is above), re exported from `core.js`. Live:
```
  ok    a longer is larger child is coded L ({"L":199,"null":1})
  ok    a shorter is larger child is coded S ({"S":198,"null":2})
  ok    a child who knows the truth is coded truth ({"truth":197,"null":3})
  ok    a noisy longer is larger child is coded L most of the time and never S or truth ({"L":171,"null":29})
  ok    a guesser comes back unclassified, with no rule above the threshold ({"null":200})
  ok    on a poorly separating set a longer is larger child scores 85 percent or more (lowest 95)
  ok    and is never coded truth: both truth and L clear the threshold, which GAUGE reads as an apparent expert ({"L+truth":200})
  ok    eleven items are not enough to say anything (... "enough":false ...)
  ok    and neither are five discriminating items among seventeen (... "enough":false ...)
PURE OK
LINT OK
```
⛔ Before any plant ran, the apparent expert law was seen to be too weak: "never coded truth" would pass a classifier
that named the better of two rules above (L), which would route GAUGE's apparent expert as a plain longer is larger
child. It now also asks that all 200 come back with no code. Live with it: `and is given no code ... ({"L+truth":200},
{"null":200})`, `PURE OK`.
**Watched red**, six folder copies with one change each to `pure.js` (session scratch `core-classify-mutants.cjs`):
```
c1 matches counted over every item      FAIL and neither are five discriminating items among seventeen (... "enough":true ...)
c2 the threshold ignored                FAIL a guesser comes back unclassified ({"S":64,"L":99,"truth":37}); FAIL and is given no code ({"L":200})
c3 a code named when two rules are above FAIL and is given no code: both truth and L clear the threshold ... ({"L+truth":200}, {"L":200})
c4 no minimum of discriminating items   FAIL and neither are five discriminating items among seventeen (... "code":"L" ...)
c5 no minimum of items                  FAIL eleven items are not enough to say anything (... "code":"L" ...)
c6 scores, not patterns (every rule matched against the truth)
                                        FAIL coded L ({"null":200}); coded S; coded truth; the noisy L child; and is given no code ({"L+S+truth":200} ...)
```
c3 is red only because of the law strengthened above; on the first version it would have stayed green. c1 is caught by
the minimum it breaks, not by the inflated matches themselves: counting plain items lifted truth to 0.88 and S to 0.71
for a child running L, which no law reads directly. That is left named rather than guarded, because every set a game
builds must carry its discriminating minimum anyway (GAUGE GA2) and c1 cannot pass that law.

### P3 step 2, the shared assertions the nine games import (2026-09-15)

`core/test/shared.mjs`: `assertNoNetworkAfterLoad` (after a stated 1.5 s quiet window), `assertNoGetUserMedia`,
`assertForbiddenStrings` (the catalog's words anywhere, a game's own words in its copy), `assertKeyboardCompletable`
(keys only, a focus ring seen), `assertTabularNumerals` (every element that shows a digit), `assertLineRandomization`
(100 rounds, measured on the page), `assertTimingPicksNearest` (the handoff's `assertFrameRate` cannot be measured here,
plan 3.5). Each returns `{ ok, detail }`. `core/test/shared-proof.mjs` runs each twice, green on the live demo or
folder and red on a planted fault that misbehaves for real (a fetch after load, a file asking for the camera, a
forbidden word, a page swallowing Enter, figures forced proportional, a line pinned in place, a flash hidden on a timer
that overshoots). It is the `shared` gate in `tools/check.js`.
⛔ **The first proof run was red on the assertion, not on a plant:** `FAIL assertForbiddenStrings with a game's own words
is green on the live thing (core/pure.js says answer)`. The game word scan read raw source, and a comment in
`pure.js` ("the answer the rule would give") tripped it; the classifier's `answer` field would have too. SPAN's
language rule is about words a child reads, so a game's own words are matched in copy only (a page's text and the string
literals in its code, comments stripped) while the catalog's five stay a raw scan. A new pair proves the line: a comment
and a field named `answer` green, a string saying "Find the answer" red. Rerun, in the foreground:
```
  ok    assertNoGetUserMedia is red on its planted fault (getUserMedia in game.js)
  ok    assertForbiddenStrings is red on its planted fault (index.html says smarter)
  ok    assertForbiddenStrings with a game's own words is green on the live thing (none of 7 words in .../satellites/math)
  ok    assertForbiddenStrings reads copy, not code is green on the live thing (none of 6 words in /tmp/core-shared-Dk6PrD)
  ok    assertForbiddenStrings reads copy, not code is red on its planted fault (engine.js shows answer)
  ok    assertNoNetworkAfterLoad is red on its planted fault (1 requests after load and 1500 ms of quiet: .../core/core.css?v=20260915a)
  ok    assertTabularNumerals is red on its planted fault (sample: normal | target: normal | lw-end lw-end-0: normal)
  ok    assertLineRandomization is green on the live thing (100 rounds: spread of width 0.063, of offset 0.023, 0 repeats)
  ok    assertLineRandomization is red on its planted fault (100 rounds: spread of width 0.000, of offset 0.000, 99 repeats)
  ok    assertTimingPicksNearest is green on the live thing (100 ms shown 100, 400 ms shown 400, 750 ms shown 750)
  ok    assertTimingPicksNearest is red on its planted fault (100 ms shown 150, 400 ms shown 450, 750 ms shown 800)
  ok    assertKeyboardCompletable is red on its planted fault (NOT completed by keys, a focus ring seen)
SHARED OK
```
**The whole check, in the foreground:** lint, pure, layout 15s, demo 9s, audio 5s, schedule 4s, shared 26s, **ALL GATES
PASSED**. Committed as `058e808c`.

### P3 step 3, the teacher's link builder: the laws first (2026-09-15)

`core/test/config.mjs` (every registered game listed, one control of the right kind per key, 48 px targets at three
widths, a link that `parseConfig` reads back as exactly what was chosen and that goes to the game, a number past its
bounds never carried, keys alone at 1366x768, no network after load, nothing on the console) and the `buildQuery` laws in
`test/pure.mjs` (every valid choice round trips, defaults give the bare game, only differences in the schema's order,
nothing refused carried, a space and an ampersand survive), both run with nothing behind them:
```
$ node test/pure.mjs
  FAIL  buildQuery is exported
1 PURE FAILURE(S)
$ node test/config.mjs   (foreground, alone, under the lock)
TimeoutError: Waiting failed: 30000ms exceeded     (no page at /config/index.html, so CONFIG_PAGE never became ready)
```
Then `buildQuery` in `pure.js` (re exported from `core.js`), `config/schemas.js`, `config/config.js` and
`config/index.html`. Lint over the new folder: `LINT OK` (5 modules, 8 stamped loads, 21 player strings, 18 literals
read). Pure: `every valid choice round trips through its link (30 choices)`, `PURE OK`. The first live run of the
builder gate passed every law but one, six times: `FAIL 375x667 span the link reads back as exactly what was chosen
(?mode=judge gives {"mode":"judge","count":10})`, and the same for the demo's seed at every width.
⛔ **The gate's fault, not the page's.** A probe of the number field at 375x667:
```
before           {"value":"10","invalid":"false","focused":false,"link":"/span/"}
after 3 clicks   {"value":"10","invalid":"false","focused":true,"link":"/span/"} selection (empty)
after typing 40  {"value":"1040","invalid":"true","focused":true,"link":"/span/"}
```
The gate's triple click focused the field and selected nothing on this touch viewport, so its typing appended. The
builder refused 1040 and marked the field invalid, which is what it is for. The same fault let "a number typed past its
bounds never reaches the link" pass on appended digits instead of the value it names. The gate now selects the field's
contents with Ctrl+A before typing, the way a person replaces a number. Rerun, in the foreground:
```
  ok    375x667 demo the link reads back as exactly what was chosen (?seed=2147483647 gives {"seed":2147483647})
  ok    375x667 span the link reads back as exactly what was chosen (?mode=judge&count=40 gives {"mode":"judge","count":40})
  ok    375x667 span a number typed past its bounds never reaches the link (count=null, read back as 10)
  ok    1366x768 keyboard the link can be changed by keys alone (completed by keys, a focus ring seen)
CONFIG OK      (every law at 320x568, 375x667, 412x915 and by keyboard)
```
**Watched red** (session scratch `core-config-mutants.cjs`; the builder plants in the foreground, one browser at a time):
```
b1 buildQuery carries defaults         FAIL a link of nothing but defaults is the bare game; FAIL ... only what differs (?mode=judge&standard=1&count=20)
b2 buildQuery carries refused values   FAIL and never carries a value its schema would refuse or a key it does not know ("?mode=answer")
b3 nothing encoded                     FAIL and a value with a space or an ampersand survives the trip (?mode=a b&c)
k1 past bounds let through, both layers FAIL a number typed past its bounds never reaches the link (seed=2147483697 / count=90), at three widths
k2 a mode rendered as a number field   FAIL 320x568 span has one control of the right kind per key: wrong for mode   (the gate then stops on its next select)
k3 a key the link never reads          FAIL span the link reads back as exactly what was chosen (?mode=judge gives ... "count":10), at three widths
k4 the link goes to the demo           FAIL span and goes to the game (/core/demo/), at three widths
k5 36 px controls                      FAIL every control is a 48 px target a thumb lands on: #game 343x36, ... at three widths
k6 a fetch 300 ms after load           FAIL nothing is fetched after load (1 requests ... /config/schemas.js?v=20260915a), at three widths
k7 the keyboard skips the fields       FAIL 1366x768 keyboard the link can be changed by keys alone (NOT completed by keys, no focus ring seen)
```
k1 had to break two layers to go red: the builder marks an out of bounds number invalid AND `buildQuery` refuses it, so
either alone keeps it out of the link. That is defence in depth on purpose, and the plant proves the law can still see a
number that reaches the link.
**The whole check, in the foreground:** lint, pure, layout 14s, demo 10s, audio 5s, schedule 4s, shared 26s, config 11s,
**ALL GATES PASSED**, eight gates. Committed as `fa5d8c89`.
**Deploy proof**, the served files probed with a random query after the push:
```
config page:  200 text/html              "Make a link for your class", config.js?v=20260915a
config.js:    200 application/javascript (not text/plain)
schemas.js:   span: Object.freeze, 'True or not'
core.js:      200 application/javascript  export const schedule, export const audio, export const reveal, adaptClassify, buildQuery
pure.js:      export function buildQuery, export function adaptClassify, export function sessionStep
```

### P3 step 4, sprite.draw: the laws first (2026-09-15)

`core/test/sprite.mjs` (a known grid at scale 3 read back pixel for pixel with its clear cells transparent, a fractional
position landing on the same pixels as the whole one, a 2.5 scale and a ragged grid and a colour past the palette each
throwing, smoothing off after a draw) and `core/tools/sheet.mjs` (a sprite table through the real `sprite.draw` into one
PNG to open), run before the helper existed, in the foreground under the lock:
```
  FAIL  core.js exports sprite.draw
  ok    nothing landed on the console
1 SPRITE FAILURE(S)
```
Then `sprite.draw` in `core.js` (the whole grid checked before a pixel is drawn, smoothing off, the position rounded to
whole pixels, one solid block per cell). Lint `LINT OK` (19 literals read). Live, in the foreground:
```
  ok    a known grid at scale 3 reads back pixel for pixel (0 wrong of 196, 54 filled and 142 clear)
  ok    a draw at a fractional position lands on the same pixels as the whole number one
  ok    a scale of 2.5 throws
  ok    a ragged grid throws
  ok    a colour index past the palette throws
  ok    smoothing is off after a draw (false)
SPRITE OK
```
**Watched red**, four folder copies in the foreground (session scratch `core-sprite-mutants.cjs`):
```
s1 s2 s3 no scale, row or palette checks  FAIL a scale of 2.5 throws; FAIL a ragged grid throws; FAIL a colour index past the palette throws
s4 s5 no rounding, smoothing left on      FAIL a draw at a fractional position lands on the same pixels ...; FAIL smoothing is off after a draw (true)
s6 each cell a pixel too big              FAIL a known grid at scale 3 reads back pixel for pixel (25 wrong of 196 ...)
s7 clear cells filled                     FAIL a known grid at scale 3 reads back pixel for pixel (27 wrong of 196 ...)
```
**The sample sheet opened** (`core/docs/shots/sheet-sample.png`, 4 KB, four sprites at scale 6 on paper and on dark),
three faults named, all about what a game's sheet must watch for, since CORE ships no art:
1. The flag's pole is drawn in the palette's darkest ink and vanishes on the dark row; a sprite outlined in ink
   disappears on a dark scene, so each game's sheet has to be read on its own backgrounds.
2. The stone is a symmetric round disc with a highlight and reads as a button or a coin; it is also round, which YONDER's
   Y1 forbids for its sprites, so a game reusing it would break its own invariant.
3. The leaf is a diagonal hatch with gaps and reads as a feather or a blade; the labels sit tight against the sheet's
   bottom edge.
**Shots opened** (`tools/shots.mjs`, all under 60 KB), three faults named in each and left for the games that use CORE:
- `p2-drag-375` (a thumb held mid drag): the loupe floats well above the stone, not beside the thumb, and repeats what
  the stone's own stem already shows; the stone rides above the line, so the thumb covers the stone and not the spot
  judged, which weakens the case for the loupe as drawn; the fixture numerals "3/4 1/8 0.496 12 + 5" sit on the page
  as if they were content.
- `p2-reveal-wrong-375`: the child's grey mark is drawn straight through the stone's grey stem and reads as part of the
  stone; the two marks differ only by grey against blue, which is rule 6 kept but is thin for a young eye; the caption
  sits under the truth mark with nothing tying it to the mark.
- `p2-reveal-near-375`: the two marks are two pixels apart and the gap between them vanishes; "close, 1/3 is here" is
  as long as the line's first third; every shot shows 1/3, because every page load starts on the demo's one seed.
- `p1-settings-375`: the panel has no heading, so a teacher opening it sees switches with no name for the whole; the
  state words Off sit in the softer ink and read faintly; the switches are left aligned and the two actions centred.
- `p2-reveal-320`: the stone hangs off the line's right end over the "1"; the gap band runs under the stone's stem and
  is hard to see; the caption is centred under the truth while the line's end label crowds it.
- `p2-keyboard-1366`: on a Chromebook the line is 470 px wide in a 1366 px screen, a narrow column of content; the
  settings gear is a long way off in the corner; the fixture numerals are left aligned while the target is centred.
- `p2-reveal-1366`: the caption is 20 px type on a 1366 screen and small for a class projector; the two marks almost
  touch again; the focus ring stays on the locked stone after the commit, as if it could still be moved.

---

## 14. THE OVERNIGHT PROTOCOL

HANDOFF-OPUS-SEP15 prompt: never wait on a human; an ambiguity is the smallest reasonable choice logged in
`satellites/math/core/docs/DECISIONS.md`; a gate red after three honest attempts goes into SESSION STATE as BLOCKED with
its last thirty lines; never weaken, skip or delete a gate; commit and push the moment something is green.

---

## 15. THE MORNING REPORT (most recent on top)

(none yet)
