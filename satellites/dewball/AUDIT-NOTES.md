# Dewball audit, 2026-08-16

Stephen's ask, recorded 2026-08-09: **"next session = dewball audit and cleanup"**,
with `variety_audit.js` named as item one because it had never been re-run after
the landmark tier shipped, so the tier's headline claim about world variety was
unverified.

It has been re-run. It was also **wrong**, in the exact way this project keeps
re-learning, and so was the way every instrument in this folder was driven.

---

## 1. What the variety audit really says

### First: the audit itself could not fail

`variety_audit.js` compared each world's kinds against a **hand written `FAMILY`
table**. That table listed `lmCakeStand`, `lmTeapotHill`, `lmDollHouse`,
`lmSundial`, `lmDovecote` and `lmRocketStand` as the landmark half of six
silhouette families — and four of those six landmarks were **deleted from the
game in the same commit that fixed the collisions the table had found**. So the
table's landmark side referenced kinds no world places any more, every family
resolved to a single member, the collision loop `return`ed on `if (!lm.length)`,
and the audit printed a confident **"none"** every time it ran.

⚖️ **A hand-maintained list of the defects you already fixed cannot find the next
one.** Families are derived now, from the kind ids and display names of whatever
the world actually contains, and the derivation is **self-tested on every run**
against six fixtures that must produce a hit and five that must not. It exits 2
rather than printing a clean report if the instrument stops biting.

### Then: four silhouette collisions are still live in the shipped worlds

| world | landmark | the prop it duplicates |
|---|---|---|
| w2 | `lmRocketStand` The Backyard Rocket 166cm | `kTinRocket` Tin Rocket 32cm x2 |
| w2 | `lmBlockFort` The Block Fort 178cm | `block` Alphabet Block 35cm **x215**, `blockwall` Block Rampart 94cm **x389** |
| w2 | `lmToyTrain` The Clockwork Express 190cm | `train` Tin Train 120cm x7 |
| w3 | `lmDovecote` The Dovecote 372cm | `dovecote` Garden Dovecote 267cm x4 |

**Two of those four are on LANDMARKS.md's own list of six collisions**, written
2026-08-08. Four were fixed by replacement; `lmDovecote` ("base count 1 — mild",
and it is x4 now) and `lmRocketStand` ("5.2x — reads as the big one") were left,
and the dead `FAMILY` table is why nobody has been told since.

There is also a real oddity the size check catches: **w4's `lmClockTower` The
Saffron Clock is 790cm in a world that scatters five 1237cm `minaret` towers.**
The landmark is not the biggest tower on its own skyline.

### And the finding that matters more than any of that

Counting distinct kinds was always a proxy. The honest question is what the
pickup ladder actually unlocks, so every object is now **dated** — the ball
diameter at which it first becomes edible — and the world asked directly.

```
world  ★★      ★★★     ceiling  biggest prop            needs ball  objs>=★★  objs>=★★★
w1     185     270     325      Picnic Table 159cm      248         2         0
w2     265     390     677      Dollhouse 243cm         368         57        0
w3     835     1220    1607     Moonlit Greenhouse 531cm 761        0         0
w4     1465    2150    2804     Minaret Tower 1237cm    1719        5         0
w5     3385    4960    6090     The Bay Wheel 3400cm    4722        6         0
w7     7355    10775   12677    The Long Span 5200cm    7222        0         0
```

⛔⛔ **Not one object in the entire game requires a three-star ball, and in Night
Garden and The Whole World nothing requires a two-star ball either.**

In w3 the last edible thing unlocks at a 761cm ball and the run ends near 1607cm.
In w7 it unlocks at 7222cm and the run ends at 12677cm. **The ball roughly doubles
after the menu has closed.** Everything eaten in that stretch is something you
could already eat.

That is Stephen's complaint — *"redundant same little things you're picking up
finishing your last minute"* — stated at the ladder instead of at the prop list,
and it is the version that says what to do about it. The landmark tier put unique
shapes in the **middle** of the ladder, which is where they moved the pacing
numbers so much (LANDMARKS.md's own A/Bs: −58s on w5, −64s on w4). It did not put
anything at the **top**, and the top is where the complaint lives.

⚖️ **Recommendation, not shipped, because it is content and a Director call:** every
world wants one or two props sized between `eatAt(largest) ` and its own ceiling —
one final meal per world, arriving after the ★★ bar. Two per world, not twenty:
the A/Bs show two structures are already a difficulty change, so this is a small
addition with a large effect and it must be re-measured after.

### The closing repeats, for the record

By count, the closing stretch of each world is one kind: Tricycle x35 (61% of w2's
closing pickups), Minaret x5 (100% of w4's), Picnic Table x2 (100% of w1's).
w5 is the healthiest world in the game here and it is the one that got three extra
landmarks last: six kinds, six one-offs, no kind over 17%.

---

## 2. What was broken, and what I fixed

### The tooling, worst first

**⛔⛔ Every instrument in this folder drove a whole browser to compute arithmetic.**
`smoke.js`, `balance.js`, `variety_audit.js` and `landmark_neighbours.js` render
nothing — they are physics, ladders, flood fills and prop lists — and each one paid
for Chromium and SwiftShader on a two-core box. That is why the variety audit had
not been re-run: LANDMARKS.md's own closing section records the last session dying
of `TargetCloseError` and 128MB of free memory.

✅ **`node_harness.js`** (new) boots the real `index.html` in plain node behind a
120-line DOM stub. Three.js r147 runs fine without a GPU; only `WebGLRenderer`,
canvas 2D and a handful of `document` calls needed stubbing.

⚖️ **Proof it is the same engine and not a model of it:** every world's `absorbAll`
ceiling comes back **identical to the decimal** to the browser figures LANDMARKS.md
recorded — 325.4 / 677.5 / 1607.0 / 2804.3 / 6090.5 / 12677.3 — and two runs of any
probe are byte-identical output.

| probe | was | now |
|---|---|---|
| `smoke.js` | chromium | node, ~14s, `SMOKE_PASS` |
| `balance.js` full near suite | chromium, often OOM | node, ~40s, `BALANCE_PASS` |
| `variety_audit.js` | chromium | node, ~6s |
| `landmark_neighbours.js` | chromium | node, ~5s, `NEIGHBOURS_PASS` |

⛔ **What the ported smoke test no longer watches:** console errors and resource
loads. There is no console and no network in the harness, so a broken `<script
src>` or a 404 asset will not be caught here any more. That belongs to the fleet's
`page_health.mjs`, which drives a real browser. Uncaught exceptions during the run
are still caught.

⛔ **`axis_probe.js`, `edge_shots.js`, `landmark_shots.js`, `globe_horizon.js` and
`perf_ab.js` stay on chromium and must.** `axis_probe` dispatches real
`KeyboardEvent`s through `readInput`; under the harness `dispatchEvent` is a no-op
and it would pass vacuously, which is worse than not running it. The other four
take pictures or read `renderer.info`, and **looking is the point of them**.

**⛔ I watched every gate fail before trusting it.** `smoke.js` was pointed at a
world with an unreachable three-star bar and printed `SMOKE_FAIL`; `save_audit.js`
found eight real problems on its first run; `variety_audit.js` exits 2 if its own
collision fixtures stop matching. A probe you have not watched fail is decoration.

### The game

**⛔⛔ A parseable save that is the wrong SHAPE bricked the game permanently.**
`loadSave` only replaced keys that were `undefined`, so `{"v":2,"worlds":"nope"}`
went straight through, and then `endRun`'s `save.worlds[W.id] = {...}` threw
*"Cannot create property on string"* under `"use strict"`. That kills the run —
and every run after it, because the bad bytes are still in localStorage. Same for
`grove` (a `.push` on a string) and `seen`. Four of sixteen corrupt-save fixtures
bricked it.
✅ Fixed: `loadSave` now checks the shape of every field and **repairs rather than
wipes** — a player whose grove list is corrupt keeps their stars. All sixteen
fixtures pass, and the v1 → v2 migration still works.

**⛔⛔ Two tabs clobbered each other**, against the standing house rule
(`feedback_localstorage_two_tabs_clobber`). The save was read once at parse time
and written back wholesale. Measured: tab one three-starred Crumb Country, tab two
finished Toybox Peaks, **Crumb Country's stars were gone.** On a phone this is the
ordinary case, not an edge case, because the installed PWA and the browser tab are
two clients of one localStorage.
✅ Fixed: `persist()` is read-modify-write against the bytes on disk on every
write. Counters ADD what this tab added since it last wrote, stars/bests MAX,
`bestGoalT` MIN (lower is better), keepsakes and skins union, the grove merges and
re-sorts. Settings stay last-writer-wins on purpose — toggling sound in one tab is
an intent, not progress.

✅ `sw.js` `dewball-v11` → `dewball-v12` **and** the registration `sw.js?v=11` →
`?v=12`, bumped together, because index.html changed.

✅ Added `DB_DEV.props()` (test-mode only, no production path) so probes can read
display names and `volF` instead of hand-mirroring a 286-kind table.

### Checked and clean

- **Service worker**: deletes only `dewball-` prefixed caches, races every fetch
  against a 5s timeout, never hands `respondWith` undefined. No changes needed.
- **No dash characters in player-facing copy.** Every em dash in the file is in a
  comment.
- **Touch targets**: `.btn` 52px min-height, `.btn.ghost` 48px, HUD buttons 48px,
  dash button 64px, skins 58px, close 48px. Nothing under 48.
- **Landmark clearance**: all 42 landmark instances across all seven worlds stand
  clear. The wave-three clearance pass holds.
- **Ladder**: `s3ok` true and zero leftovers on all six timed worlds. No world is
  unwinnable, and every world's ceiling clears its three-star bar with the required
  15% slack.
- **Star thresholds still land where they were measured.** ★★★ sits at 81 to 92%
  of what the near bot reaches by the end of the clock across seeds 12345 and 777,
  against the 85% the design specifies. The measurement stands; no retune needed.

---

## 3. What still worries me

### ⛔ The clock rankings in the docs are backwards, and w2 is the tight one now

Near bot (the first-time-human model), seed 12345 and seed 777 agree:

| world | clock | goal at | 3 stars at | clock left after 3 stars |
|---|---|---|---|---|
| w1 Crumb Country | 165 | 40s (24%) | 103.5s | 61.5s |
| **w2 Toybox Peaks** | **200** | 89s (45%) | **193.6s** | **6.4s** |
| w3 Night Garden | 205 | 56s (27%) | 113.1s | 91.9s |
| w4 Bazaar Lane | 210 | 122s (58%) | 185.3s | 24.7s |
| w5 Starfall Bay | 195 | 83s (42%) | 120.0s | 75.0s |
| **w7 The Whole World** | **300** | 89s (30%) | **118.0s** | **182s** |

**Toybox Peaks is now the tightest world in the game, at 6.4 seconds of margin on
both seeds** — not Starfall Bay, which every document in this folder still treats
as the tight one and which now has 75s of slack. w5's open clock question
(195 → about 170) is real and the numbers support it, but **w2 is the one that
should be looked at first**, and w2 is world two: the first-time player meets it
before they are good.

I did not move any clock. Clocks are Stephen's tuned numbers and LANDMARKS.md
explicitly reserved the w5 decision to him; moving w2's on top of that without a
device round would be guessing twice.

### ⛔⛔ The near bot clean sweeps The Whole World

w7: the bot absorbs **5558 of 5558 objects** and finishes at exactly the 12677.3cm
ceiling, at roughly 134s of a 300s clock. CLEAN SWEEP is designed as *"the elite
goal, not a failure state"* (DESIGN.md, replay meta) and the first-time-human model
does it on its first pass with over half the clock unused. It is the only world in
the game the bot fully consumes.

Combined with the ladder table above — w7 has nothing that needs even a two-star
ball — **the flagship finale is the world with the least left to do at the end.**
That is the same shape of problem as the Night Garden complaint Stephen made on
2026-08-09, one world along.

### Smaller, listed honestly

- **Zen's landmarks are mostly borrowed.** Five of Dream Meadow's eight are
  `lmCarousel`, `lmGazeboPond`, `lmDovecote`, `lmClockTower`, `lmBookTower` — other
  worlds' landmarks. Defensible ("everything, endlessly") but it is not eight
  unique things.
- **Zen leaves one object after `absorbAll`.** Every other world reaches zero, so
  the zen clean sweep is unreachable. Not diagnosed; it may be an intentional
  unreachable prop, it may be a ladder edge.
- **The Topiary Stag's proportions** are still open from LANDMARKS.md and still
  Stephen's call: model the body properly, or accept it and rename it.
- **Nothing here has been looked at.** This audit is arithmetic. Every real defect
  on the landmark tier was found by opening an image, and the picture probes still
  need a browser and a person. The four collisions above are *name and size*
  evidence; whether the Block Fort actually reads as a bigger alphabet block is a
  question for a screenshot.
- **Still not measured on a real device.** CLAUDE.md calls Pixel 9 testing
  non-negotiable and this is not it.

---

## How to run all of it now

```
cd satellites/dewball
node smoke.js                       # ladder + court flood fill        ~14s
node balance.js 1 12345 0 near      # pacing, all worlds, human model  ~40s
node balance.js 1 12345 4 near      # one world, for an A/B            ~4s
node variety_audit.js               # the endgame variety instrument   ~6s
node variety_audit.js --selftest    # just prove it still bites        instant
node landmark_neighbours.js         # nothing standing in a landmark   ~5s
node save_audit.js                  # reload, 16 corrupt saves, 2 tabs ~20s
```

⛔ **Timings may only be compared between single-world runs.** The bot draws its
search headings from one page-seeded stream shared across the whole suite, so
editing world two legitimately moves world four's numbers. Ceilings, `s3ok` and
leftovers are layout-derived and safe to compare across code states. That rule is
LANDMARKS.md's and it survives the driver change unchanged — `balance.js` binds the
bot to the page's own seeded `Math.random`, not node's.
