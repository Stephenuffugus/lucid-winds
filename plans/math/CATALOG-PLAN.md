# THE MATH CATALOG, the plan over the ten handoffs. Written Sep 14 2026 by Fable.

Stephen delivered ten kids' math and cognition game handoffs plus a shared CORE handoff and an INDEX
(`assets/math-catalog/`, verbatim, read only). This file is the layer between those documents and this
studio: what collides with what we already have, what gets cut, how the CORE's architecture is
reconciled with the fleet's laws, the build order, the sizing, and every call that is Stephen's. The
builder reads this BEFORE any handoff in `assets/math-catalog/`, and where the two disagree, this file
wins, because it was written against the repo and the handoffs were not.

---

## 1. The verdict, in one table

| # | Handoff | Skill | Collides with | Verdict | v1 scope (from its own handoff) |
|---|---|---|---|---|---|
| 0 | CORE | shared foundation | the fleet's single file law, the portal's service worker, `music-unlocks.js` | **BUILD, reconciled (section 4)** | all modules, `test.js`, the config page |
| 8 | SPAN | the equals sign, missing terms | nothing. Tally is arithmetic composition, a different skill | **BUILD, first game** | Modes 1, 2, 3 + the pier reveal |
| 3 | YONDER | whole number line estimation | Mode 1 is the same shape as our Snakes and Ladders (a linear numbered board, a die); the difference IS the intervention (one tap per square, the numeral named, no snakes) | **BUILD** | Modes 1, 2, 5 + the diagnostic engine |
| 1 | CREASE | fraction number line | nothing. "Crease" is Airworthy's fold vocabulary (a mild word clash on the same shelf, not a game clash) | **BUILD** | Modes 1, 2, 3 + the reveal |
| 2 | BRIM | fraction comparison | nothing | **BUILD** | Modes 1 to 4 + the reveal |
| 4 | GLIMPSE | subitizing | nothing. Stop the Light is a timing game; Think Fast is a microgame reel | **BUILD, Mode 4 parked** | Modes 1, 2, 3, 5 |
| 7 | HUSH | inhibitory control | nothing in this repo. The handoff's "Blink (Don't.)" AR project is not in any repo or memory here; Petal Blink is a Lucid Winds card matching game and unrelated | **BUILD, Mode 3 cut** | Modes 1, 5 + the settle + the living clearing |
| 5 | NOTCH | mental rotation | nothing. OriVex and Tetroku are tile puzzles, no rotation training | **BUILD** | Modes 1, 3 + the reveal |
| 9 | TINT | ratio and proportion | Hues is a colour matching game; TINT is ratio, the colour is the proof. Different skill, shared theme, the two should not sit next to each other on the shelf | **BUILD, Mode 4 stays in v1** (the handoff is right that shipping without it trains the error) | Modes 1, 2, 4 + the pour |
| 10 | GAUGE | decimal magnitude | nothing | **BUILD LAST, after CREASE and BRIM** (the handoff's own sequencing rule) | Modes 1, 2, 4 + classification |
| 6 | CAIRN | working memory strategy | **Memory Meadow** (`games/recall.js`, in Lucid Winds: watch symbols, count backwards, tap the ones you saw) is already a memory span game, and CAIRN is the weakest evidence base of the ten by its own admission ("build last, or not at all") | **CUT.** The slot is reallocated to the two micro tools below | none |

**Nine games plus CORE.** Every one of the nine trains a skill nothing in the catalog of 150 games touches:
the existing "Numbers" tab holds Tally (make a target), Fast Math (a 60 second drill), Times Table Quest, Garden
Sums (kakuro), Merge and Blast, Sprout Dice, Double Shutter and Snakes and Ladders. None of them touches
fraction magnitude, line estimation, the equals sign, subitizing, ratio, decimals, rotation or inhibition. This
is not a duplicate catalog. It is a different shelf.

**Name collisions: none.** All ten names were checked against the portal's 156 rows, every folder under
`satellites/`, the eighteen repo back catalogue and the games manifest. No exact hit. The three vocabulary
overlaps (Crease and Airworthy's creases, Tint and Hues, Cairn and Memory Meadow) are noted above; only the
last one costs anything, and it is cut. Every name is a working title; the display names are Stephen's,
exactly as with the twelve (DIRECTOR-CALLS section F). Folder keys are the lowercase working titles and do not
change when a display name does.

**The two micro tools that take CAIRN's slot (INDEX section 7), because each is one screen on a game that
exists anyway and each is the thing a teacher forwards:**
- **The equals sign screener**: SPAN Mode 1, ten items, three minutes, whole class, no login. About 80 lines
  on SPAN. Its own URL under SPAN's folder (`/satellites/span/screen/`).
- **Simon Says**: HUSH Mode 5, camera free, mic free, offline. Its own URL under HUSH's folder.
The other two (Not Everything Scales, the decimal screener) wait for v1.1 of TINT and GAUGE.

---

## 2. What the handoffs got wrong, or could not know (each binding)

1. **The studio is "Sky Wolf Studio", singular.** INDEX says "Sky Walk Studio". Every listing, landing line
   and About says Sky Wolf Studio.
2. **The handoffs carry 221 em dashes and the copy law forbids any dash and any exclamation point in player
   text.** The `reveal` contract's near miss caption `close — 3/4 is here` becomes `close, 3/4 is here`.
   The copy scan (`tools/lint.mjs` in every game, plus the composed string scan) enforces it. The handoffs'
   own prose can keep its dashes; they are inputs, not player copy.
3. **RESONARC does not exist.** CORE section 2.6 says "the existing audio engine, unmodified" and there is no
   such file in this repo, any sibling repo or memory. CORE's `audio` module is written fresh: a small WebAudio
   synth in the fleet's proven shape (see `satellites/fathom/index.html`, search `voice`, and its
   `test/audio.mjs` ear gate). The two audio invariants (A1 one sound per event, A2 fully playable muted) hold
   as written. A fresh GainNode's gain is ONE; every voice sets its own; the ear gate measures peak.
4. **The ten design specs (`<NAME>-design-spec.md`) are not in the delivery.** Every handoff cites them for
   the rationale. The handoffs are complete enough to build v1 of every game; the specs are wanted before
   v1.1 and before any public copy makes a claim. Stephen owes them (section 9).
5. **"ChromaForge" (TINT section 10) and "Blink (Don't.)" (HUSH section 10) and "UMBRA" (NOTCH section 8)
   are not in any repo or memory here.** Treated as not existing. If they exist somewhere, Stephen says so.
6. **The CORE's `/` hub, root `sw.js` and `/config/` page assume the catalog owns an origin.** It does not; it
   lives under `lucidwinds.com/satellites/` beside 150 other games with a portal that has its own service
   worker. Section 4 gives the reconciled layout.
7. **CORE G12 (audio muted by default) and G2 (no network after first load) are both incompatible with the
   fleet's `music-unlocks.js` include**, which fetches tracks from `/music` on demand. Section 4, decision D3.
8. **The handoffs assume a Chromebook first and the fleet's layout gates assume a phone in one hand.** Both
   are true here: a math game gets the three portrait widths AND 1366x768 landscape with keyboard only.
9. **YONDER Y1 (nothing circular anywhere) will collide with the portal frame's round buttons** when a game
   is opened inside the arcade's `/play/` shell. The grep gate runs on the game's own DOM, not the frame; the
   frame is outside the fence and outside the child's task.
10. **Every tolerance band, tier table and error rate in the handoffs is seeded from published studies, not
    from play** (INDEX section 10 says so). Gates assert the RULES as written (ratios, distributions, floors),
    never that a band is the right band. Tuning waits for a child.

---

## 3. Build order and honest sizing (one Opus, two cores)

| Order | Game | Why here | Days |
|---|---|---|---|
| 1 | **CORE** | blocks everything; `reveal` against a dummy game before any real one | 1.5 |
| 2 | **SPAN** | lightest engineering, biggest gap between damage and fix; proves CORE end to end | 1 |
| 3 | **YONDER** | builds `numberline` + `adapt.classify` for three later games; the proven intervention | 1.5 |
| 4 | **CREASE** | consumes `numberline`; authors `FRACTION_BANK` | 1 |
| 5 | **BRIM** | consumes `FRACTION_BANK` | 1 |
| 6 | **GLIMPSE** | hardest generator in the catalog; hardens `schedule` for HUSH | 1.5 |
| 7 | **HUSH** | consumes `schedule`; highest evidence EF game; the Simon Says micro tool rides on it | 1 |
| 8 | **NOTCH** | self contained; the no numerals door in; hand rolled 3D projection, not three.js | 1.5 |
| 9 | **TINT** | the convergence point; linear RGB mixing is the first thing built and tested | 1 |
| 10 | **GAUGE** | after CREASE and BRIM by its own rule; extends `numberline` with `subdivide` | 1 |

**About twelve builder days**, which on this box is two and a half weeks of interrupted 24 hour runs, AFTER
the three to four days of lanes A and B in `HANDOFF-OPUS-SEP15.md`. Nothing here is a weekend. The order
front loads the shared modules so that game four onward is mostly content and feel.

A game ships to the arcade's In Development tab the day its v1 scope is green, not when the catalog is done.
SPAN can be in front of a child inside a week.

---

## 4. ARCHITECTURE, reconciled (the CORE handoff's section 0 asked; here is the answer)

**D1. Shared core, yes, as a versioned include under the catalog's own folder.** The CORE handoff is right
that ten copies of an adaptive engine drift, and this repo carries that exact scar (`games/` versus the inline
copies). The fleet already has one shared runtime include (`music-unlocks.js`, 213 includers), so a second is
not new law. Layout:

```
satellites/math/                 the catalog's home (landing page, config builder, shared core)
├── index.html                   the landing: four positioning lines, age bands, the nine cards, cross links
├── config/index.html            the teacher URL builder (CORE 2.9), serves all nine
├── core/
│   ├── core.js                  ES module: tokens, reveal, adapt, numberline, schedule, audio, store,
│   │                            settings, urlconfig, session, collect (CORE section 2), pure where it can be
│   ├── core.css                 tokens + base
│   └── test/                    the shared harness (CORE section 3) as Node + puppeteer gates
satellites/span/   satellites/yonder/   satellites/crease/   ...   one folder per game, the fleet shape:
├── index.html                   the shell; loads ../math/core/core.js?v=<stamp> and its own engine.js
├── engine.js                    PURE (no document, window, Date, Math.random; an injected rng), the sim
├── render.js, content.js        as each handoff lists
├── sw.js, manifest.webmanifest, icon-*.png, docs/, test/, tools/   exactly as the twelve
```

- **ES modules, and every import carries `?v=<stamp>`.** The host scar (`feedback_aura_off_aug29`: ES module
  imports are separate URLs and cache separately) means an unstamped import serves a stale core to a fresh
  game. Lint asserts every `import` and every `<script type=module src>` is stamped with the ONE stamp.
- **`engine.js` is the sim.** The twelve keep rules between SIM markers in a single file because they are
  single files; here the engine is its own pure module, so Node gates import it directly and the "one
  implementation" law holds by construction. The lint asserts `engine.js` and the pure half of `core.js`
  (adapt, numberline math, schedule math, the generators) never reference `document`, `window`, `Date` or
  `Math.random`; randomness is an injected `rng` so a gate can replay a seed. The browser seam gate taps a
  round through the real page and compares the page's scored result to `engine.js` for the same seed.
- **Runtime files are `.js`.** The host serves `.mjs` as text/plain. Node tools are `.mjs`.

**D2. No root service worker. Each game keeps its own `sw.js`, the fleet shape, and precaches the core files
too.** The CORE handoff's root worker would sit inside the portal's scope and fight it. Offline still holds per
game after its first visit, which is the promise the landing copy makes ("works offline"); the cross game
precache is lost and the browser's HTTP cache covers most of it. The service worker header law applies: only
delete your own caches, every fetch settles a real Response, navigations refetch `cache:'no-cache'`,
`SHELL_VERSION` moves with the stamp.

**D3. The math catalog does NOT include `music-unlocks.js`.** CORE G2 (no network after first load) and G12
(muted by default, one obvious unmute) are the catalog's promise to schools, and the music chip fetches tracks
from `/music` on demand and seats itself over the play area. So: no chip, and therefore the 120 by 120 seat
law does not apply to these nine games. This is a fleet law exception and Stephen's to confirm (section 9),
but the alternative breaks the catalog's own first line.

**D4. Layout gates at four sizes:** 320x568, 375x667, 412x915 portrait (the fleet's) and **1366x768 landscape
with a keyboard and no touch** (the Chromebook). Every mode completable at all four, keyboard only at the
fourth, `elementFromPoint` on every control at the three phone widths (48 px, and the handoffs ask 56 to 64 for
the young; use 56 as the floor for GLIMPSE, YONDER Mode 1 and HUSH). Frame rate gates run under
`Emulation.setCPUThrottlingRate` 4 in puppeteer, which is the CORE's "4x throttle" made real.

**D5. The hub is two things that already exist plus one page.** The arcade's Numbers tab (`cat:"math"`)
lists every shipped game; `satellites/math/index.html` is the landing the INDEX describes (the four
positioning lines, the two age bands, the cross links of INDEX section 4, the CREASE/BRIM before GAUGE rule as
a routing rule, and the honest claims register as plain text). The config builder lives beside it. No shared
save data across games in v1 (INDEX section 10 calls it open); `store` namespaces per game as CORE says.

**D6. Spoken numerals (YONDER Y7, GLIMPSE):** Web Speech API with the numeral always ALSO on screen, and the
game complete when speech is unavailable. No recorded audio: the file size budget and the studio law that
audio never lives in git both say so.

**D7. Teacher views** (YONDER, GAUGE) are v1.1, behind `?teacher=1`, local only. The config builder is v1
because URL parameters are the catalog's differentiator and cost nothing per game once `urlconfig` exists.

**D8. Collectibles** ship in v1 as each handoff scopes them (they are cheap and diegetic), cosmetic, never a
count where a handoff forbids numerals (NOTCH, CAIRN's rule inherited by nothing now).

---

## 5. PIXEL ART (Stephen: "id like some nice pixel art")

The handoffs describe painterly, atmospheric scenes: a deer in a dawn clearing, fireflies over a dark meadow, a
dyer's workshop, a dim carving bench, a canyon with stone piers. Pixel art suits all of it and HUSH's six
detail tiers of one creature ("information increases, not just pixels") is the most pixel art native idea in the
set. So:

- **Code drawn pixel sprites are the default and the v1 delivery.** Each game carries `sprites.js`: a 16 colour
  palette (per game, locked in `content.js`), sprites authored as string grids or packed arrays at 16, 24 or
  32 px, drawn to a canvas at an integer scale with `image-rendering: pixelated`, never a fractional scale.
  A `tools/sheet.mjs` renders every sprite of the game to one PNG under `docs/` so the sheet can be OPENED
  with the Read tool and three faults named before it is called art. That is the LOOKING law applied to
  sprites.
- **NOTCH is the exception:** its pieces are hand rolled 3D projections rendered as SVG with baked grain that
  rotates with the piece (its handoff section 4). Pixel art cannot rotate continuously without shimmer. Its
  workshop backdrop and its village collectible can be pixel; the pieces are not.
- **YONDER's no circles rule (Y1) applies to sprites too:** no round pips, no round avatars, a tossed stick or
  a flipped card for the die.
- **Painted upgrades are Stephen's**, through Midjourney and the 012Assets Drive flow the fleet already uses
  (`reference_midjourney_rules`); a sheet request per game goes in that game's plan under ART, the game ships
  without it. The studio law NEVER CLAIM HAND PAINTED applies to any generated sheet.
- **If Stephen connects an image generation MCP** (the Hugging Face MCP is present in this account and
  untested for this), the first session with it spends one hour producing ONE sprite end to end at the
  game's palette and scale before any plan depends on it. Meshy makes meshes, not pixels; it has no role here.

---

## 6. GATES EVERY MATH GAME CARRIES (on top of its handoff's own list and CORE's shared assertions)

The fleet's, unchanged: lint (stamp in every place, `.js` runtime, the copy scan over authored AND composed
strings, dupkeys, the `.screen` rule), boot (console clean at four sizes), layout (four sizes, measured font
size, `elementFromPoint` on every control, keyboard completion at 1366x768), play (a whole run by real taps and
by keyboard, the seam against `engine.js`), audio (the ear gate: peak, rms, share above 3 kHz, one event per
flash where a handoff says so), and `tools/live.mjs` after every deploy.

The catalog's, from CORE section 3, made real in `satellites/math/core/test/`: no network after load
(puppeteer request log after `load`, zero entries), no `getUserMedia` in any bundle, the forbidden strings
grep (`IQ`, `brain train`, `brain-train`, `smarter`, `cognitive enhance`, `brain power`) over every string in
every game AND the landing page, tabular numerals asserted by computed `font-variant-numeric`, line
randomization variance over 100 rounds, timing accuracy under 4x throttle within the handoff's tolerance, RT
measured from paint (the injected 100 ms delay test), and, for every gate that asserts a distribution (SPAN's
40/60, HUSH's 75 to 80 percent go trials, GLIMPSE's decorrelation, TINT's 13 to 17 percent), **a count is a law:
the assertion holds for any seed, proved by running it on 20 seeds, not on today's**.

Every new gate is watched to fail once by a planted mutation before it counts.

---

## 7. LAWS THE HANDOFFS ADD TO THE FLEET, FOR THESE NINE ONLY

They do not rewrite the fleet; they bind these folders. All thirteen CORE global invariants G1 to G13, plus:
no red X, buzzer or "Incorrect" anywhere (G7 stated again because every fleet game has a fail sound); no
visible timers or speed scores (G5); adaptation silent and never rendered (CORE 2.3); the reveal contract's six
rules (CORE 2.2), and SPAN's language rules (never "answer", "solve", or "equals" alone) enforced by grep in
SPAN's lint. The fleet's rules for directions before play (Stephen and Jessie, Jul 19) meet CORE G8 (no reading
required) this way: the directions are a wordless loop (every handoff's "first run" section describes one) and
the one sentence description lives on the portal card, not in the game.

---

## 8. THE PER GAME PLAN, written by the builder as step 1 of each game

Fable wrote the plans for the twelve and for Marrowdeep. For nine games at once that is a week of planning
before a line of code, so the split changes: **the builder writes each game's `plans/<game>/HANDOFF-<GAME>.md`
in the twelve's template** (`plans/fathom/HANDOFF-FATHOM.md` is the model) as the first step of that game,
from three inputs: the game's handoff in `assets/math-catalog/`, this file, and CORE. The plan must carry:
the fence; the inheritance table with real paths and line numbers (what is copied from `satellites/math/core/`
and from the twelve); the corrections (section 2 here plus anything the builder finds by arithmetic); the
phases P0 to P3 with the game's own gates from its handoff section "Test gates" mapped one to one; the screens
at four sizes; the sprite sheet list; the listing line for the portal (one sentence, no dash); the handoff's
"Ask Stephen, don't decide" items copied into section 10 with what the build does meanwhile; sizing; the
ledger; the morning report. The plan is committed before P0 begins, so a review can read the plan against the
handoff before the game exists.

**Where a handoff says "Ask Stephen, don't decide", the build takes the smallest reasonable default and logs
it, exactly like Marrowdeep's overnight protocol**, EXCEPT names, prices and anything public facing that makes
a claim, which wait.

---

## 9. STEPHEN'S CALLS (none blocks the build; each has a default the build takes meanwhile)

1. **CAIRN cut, its slot to the two micro tools.** Default: cut.
2. **The math catalog carries no music chip (D3).** Default: no chip.
3. **Shared core as a versioned include rather than nine single files (D1).** Default: shared core.
4. **Nine display names** (the handoffs' alternatives: SNIP/TAUT/RUNG/PLUMB for CREASE, TRUE for SPAN, VERNIER
   for GAUGE). Default: the working titles, capitalised as words on the shelf (Span, Yonder, Crease).
5. **Where the catalog lives for schools.** `lucidwinds.com` is an arcade and district filters categorise by
   domain; a games domain is the kind that gets blocked. A subdomain (`math.lucidwinds.com` or one under
   `skywolfstudio.com`) pointed at the same folder is a Hostinger edit and changes nothing in the build.
   Default: build under `satellites/`, decide the front door before the first outreach to a teacher.
6. **The ten design specs.** Wanted before v1.1 and before any public claim. Default: v1 from the handoffs.
7. **GLIMPSE Mode 4 and HUSH Mode 3:** parked and cut respectively, per their handoffs. Default as stated.
8. **Spoken numerals via Web Speech (D6).** Default: yes, with the numeral always on screen.
9. **Whether YONDER Mode 1 (the race, ages 4 to 7) is its own title.** Default: a mode inside YONDER for v1.
10. **Pixel art by code, painted sheets by Stephen (section 5).** Default: code.

---

## 10. WHAT IS NOT IN THIS PLAN

Measuring anything with real children, retention past a first session, shared save data across games, the
teacher views, the two later micro tools, any public claim of learning gain. INDEX section 10 lists these as
unspecced and they stay so until a child has played SPAN for ten minutes, which is the one event that would
change every tolerance table at once.
