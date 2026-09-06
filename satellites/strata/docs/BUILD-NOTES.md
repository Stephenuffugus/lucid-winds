# STRATA, build notes

**What it is:** a cliff face of layered sediment. Brush the dust away, chisel
through the stone, and something comes out that has never existed before. Lift it,
mount it, name it, and hang it in a museum that is only yours. Positioning line:
every fossil is the only one.

**Built:** 2026-09-06 by Opus, against `plans/strata/HANDOFF-STRATA.md`. The field
journal and the rename were added by the lead the same day.

**Live:** `https://lucidwinds.com/satellites/strata/` at stamp `20260906f`, confirmed
by curl on 2026-09-07.

Every line number below was checked against `satellites/strata/index.html` at that
stamp. This file supersedes the older copy at `satellites/strata/BUILD-NOTES.md`,
which was written before the plate, the journal and the rename existed.

---

## 1. The two laws

**A specimen is its seed.** `species(seed, era)` at 526, `bones(sp)` at 744 and
`identity(sp, seed, ded)` at 1031 are pure functions of one number, and so is where
the ground put each bone. The museum stores a seed, the share link carries a seed,
and everything else is regenerated. That is why a link is about seventy characters
and why a stranger's link cannot smuggle in an animal this game did not make.

**The variety sheet is a gate a human reads.** `tools/variety.mjs` draws fifty
animals on one image and a person opens it and counts the ones worth a screenshot.
It failed twice, at nought and at about four, before it passed at twelve, and both
failures were real faults in the grammar that every assertion in `sim.js` was green
on the whole time. The count is still the builder's twelve and Stephen has not given
his own, which is Director call 17.

---

## 2. How to run the gates

One command says whether Strata is shippable.

```
node satellites/strata/tools/check.js
```

It must print `ALL GATES PASSED`. Nothing commits without it.

Four of the seven gates open a browser, and this box has two cores, so the fleet law
applies: one browser at a time, under the lock, with a long timeout around it.

```
timeout 900 flock -w 1800 /tmp/sws-gate.lock node satellites/strata/tools/check.js
```

`--fast` skips the slow gate and says which one it skipped. It is never a pass.

The three gates that need no browser can be run bare and are fast:

```
node satellites/strata/sim.js --test        prints STRATA TEST OK
node satellites/strata/sim.js --census=3000 prints the grammar as a table
node satellites/strata/tools/lint.mjs       prints LINT OK
```

`check.js` skips the browser gates with a printed note if puppeteer is missing, so
read the note as well as the last line.

### The seven gates

| gate | file | what it holds down |
|---|---|---|
| `sim` | `sim.js --test` | 103 assertions, verified green on 2026-09-07. Five hundred animals inside the bone budget with every bone hanging off the spine, all four plans and all four size classes inside two hundred seeds, deeper bands stranger and bigger, a long neck carrying a smaller head, five thousand seeds giving at least 4,950 different binomials, every history fragment reachable and none of them claiming a creature always did anything, and the same seed giving the same animal every time |
| `lint` | `tools/lint.mjs` | the script block parses under `vm.createScript`, nothing loaded at run time is a `.mjs`, every local asset carries a `?v=`, one stamp in three places, no dash and no exclamation point a player can read, Sky Wolf Studio singular, no `shadowBlur`, no CSS text under 0.7 rem, and the SIM block has no clock, no document, no window and no unspecified maths |
| `census` | `sim.js --census=3000` | what the grammar actually produces, as a table, failing if any one choice takes more than sixty percent |
| `dig` | `test/dig.mjs` | real pointer strokes at 375x667: a brush pass takes rock off, a quick chisel stroke is safe and a rest is not, the pick cracks at once, and a trace that starts on a freed bone lifts that bone while one twenty cells off the spine is refused |
| `mount` | `test/mount.mjs` | real drags out of the tray onto the armature, a real typed dedication, and a reload to prove a museum that forgets is not a museum |
| `share` | `test/share.mjs` | a second puppeteer launch with its own profile opens the link, a real tap opens the crate, a hand written link cannot lie about a condition or a name, and the rename reaches both the disk and the placard |
| `layout` | `test/layout.mjs` | every screen at five phone sizes, 375x667, 412x915, 320x568, 667x375 and 915x412, every group counted before it is measured, the bottom left 120 by 120 left clear for the music chip, and the pressure ring measured as a radius so it is never under the finger |

Every browser gate names in its own header comment what it was watched to fail on.
`test/harness.mjs` serves this folder plus the fleet files the page pulls from the
site root, on an ephemeral port, so two gates cannot collide on a port. Its `tap`
proves reachability with `elementFromPoint` at the element's centre and then presses
that point. Nothing in any gate calls a handler.

### The census, as it reads today

```
3000 animals
plan       biped 23.2%   flippers 18.6%   quadruped 41.9%   wings 16.4%
size       bus 15.1%     dog 36.7%        horse 29.6%       mouse 18.6%
skull      beak 26.8%    crest 23.8%      dome 10.4%        longjaw 39.0%
ornament   frill 12.0%   none 35.3%       plates 19.9%      sail 13.5%   spines 19.3%
bones      39 to 74, mean 55.7
```

### The tools beside the gates

| tool | what it does |
|---|---|
| `tools/variety.mjs [start]` | fifty animals as plain silhouettes, ten across and five down, to `docs/shots/p0-variety.png`. No machine passes this |
| `tools/shots.mjs` | the screen shots at 412x915, 375x667, 320x568 and the two landscapes, into `docs/shots/` |
| `tools/thumb.mjs` | the arcade tile, 512x512, shot through the game's own canvas on a real dig. It MEASURES the picture it made, how much bone, how much rock, how much black, and refuses to write one that fails or that goes over 150 KB |
| `tools/icons.mjs` | the three PWA icons from one drawn mark |

---

## 3. The file map

```
satellites/strata/
  index.html            the whole game, one file, no build step, no framework
  sim.js                --test  --species=SEED  --census=N  [--over=KEY=VAL]
  sw.js                 SHELL_VERSION must equal var STAMP
  manifest.webmanifest  icon-192.png  icon-512.png  icon-maskable-512.png
  tools/check.js        the one command
  tools/lint.mjs  tools/icons.mjs  tools/thumb.mjs  tools/shots.mjs  tools/variety.mjs
  test/harness.mjs  test/dig.mjs  test/mount.mjs  test/share.mjs  test/layout.mjs
  docs/DECISIONS.md  docs/ART_ASSETS.md  docs/BUILD-NOTES.md  docs/shots/  docs/thumb.png
```

### Inside index.html

| lines | what |
|---|---|
| 1 to 15 | head, meta, the manifest and icon links, each carrying `?v=` |
| 16 to 222 | the whole stylesheet. `:root` palette 24, buttons 46, the tool rail 57 and 60, `.screen` 87, the title scrim 100, the field journal 121 to 152, the crate box 169, the mounting bench 183 to 195, the hall 198 to 219 |
| 223 | the fleet music chip, `/music-unlocks.js` |
| 225 to 353 | the markup. Chrome 230, the tool rail 238, title 245, how 255, the menu sheet 265, the name sheet 280, the mount screen 293, the journal 304, the hall 322, the specimen sheet 331 |
| 355 to 372 | the file's own header comment and the two laws |
| **373** | `SIM_EXPORT_START` |
| 374 | CONFIG, frozen |
| 402 | RNG. `makeRNG`, `seedFromString`, `mixSeed` |
| 423 | DMATH. `dsin`, `dcos`, `datan2`, built from the four operators and `Math.sqrt` only, so a browser's own trig cannot make one phone's animal differ from another's |
| 495 | SKELETON. `species` 526, `spineOf` 661, `bones` 744, `boneBounds` 897, `armatureOk` 911 |
| 925 | IDENTITY. The syllable banks 932 to 958, the history banks 960 to 1002, `cleanName` 1015, `epithetFor` 1024, `identity` 1031 |
| 1054 | SITE. `bandLines` 1061, `bandAt` 1081, `placeSpecimen` 1095, `makeSite` 1171 |
| 1192 | SEDIMENT. `LAM_F` and `LAM_T` 1199 and 1200, `newDig` 1201, `fillPoly` 1252 |
| 1286 | TOOLS. The `TOOLS` table 1287, `stroke` 1294, `crackUnder` 1356, `recount` 1373 |
| 1393 | EXTRACT. `traceCoverage` 1396, `denseSpine` 1407, `traceFit` 1437, `startsOnFreed` 1454, `tryExtract` 1470, `specimenState` 1497, `conditionWord` 1510 |
| **1518** | `SIM_EXPORT_END` |
| 1521 | the game's state. `var STAMP` at 1522 |
| 1537 | VIEW. `PAL` 1541, `fitCanvas` 1551, the screen mapping 1585 to 1591, `paintCliff` 1593, `bandOfIndex` 1629, `drawBands` 1642, `drawBoneEdges` 1665, the dust 1730 to 1764, `drawPressure` 1766, `drawScan` 1779, `frame` 1802, `tick` 1830 |
| **1847 to 2420** | `TEST_EXPORT_START` to `TEST_EXPORT_END`. The nine assertion suites, 1879 to 2409 |
| 2422 | AUDIO. `resume` 2429, `noise` 2440, `env` 2449, `tone` 2457, `band` 2465, `play` 2474, `grainFor` 2495 |
| 2510 | INPUT. `onDown` 2520, `onMove` 2536, `applyStrokeFeel` 2570, `onUp` 2587, `banner` 2604, `toast` 2613 |
| 2621 | SAVE. `blankSave` 2623, `readSave` 2630, `saveNow` 2641 and its whitelist |
| 2670 | SCREENS. `showScreen` 2672, `refreshChrome` 2683, `depthFor` 2709, `startDemo` 2716, `newSite` 2738 |
| 2756 | MOUNT. `openMount` 2764, `layoutMount` 2775, `drawMount` 2831, `paintTray` 2915, `boneTile` 2924, `placeBone` 2964, `refreshMount` 2971 |
| 2991 | the field journal. `escText` 3000, `openJournal` 3003 |
| 3037 | the hall. `openHall` 3037, `cratePlinth` 3056, `plinthFor` 3077, `openSpecimen` 3132 |
| 3152 | SHARE. The base64 pair 3159 and 3175, `specimenLink` 3192, `readSpecimenLink` 3301, `cleanBinomial` 3313, `cleanCondition` 3318, `copySpecimenLink` 3322, `importSpecimen` 3334, `unpackCrate` 3350 |
| 3196 | the plate. `plateWrap` 3202, `renderPlate` 3212, `exportPlate` 3279 |
| 3362 | BOOT, and every listener. The service worker registration 3543 |
| 3553 onward | `MOUNT_SNAP` 3553, `openNameSheet` 3554, `keepSpecimen` 3565, then the drag handlers and the `STRATA_TEST` hook the browser gates drive |

The banner comment at 2990 reads `24. THE HALL` and the journal begins one line
under it at 2991. The hall's own code starts at 3037. The banner is in the wrong
place and the code is not.

`SIM_EXPORT` wraps CONFIG through EXTRACT. Nothing inside those markers touches a
clock, a document, a window or an unspecified `Math` call, and `tools/lint.mjs`
greps the shipped file to prove it. `sim.js` reads the two marked blocks straight out
of `index.html`, so there is exactly one implementation of the rules and the headless
runner drives the same code the thumb does.

---

## 4. The constants that matter

All in `CONFIG` at 374, frozen. `sim.js --over=KEY=VAL` runs any sweep against an
override by substituting the numeric literal in the source, and it throws on a key it
did not find, so a typo in a sweep can never quietly measure the shipped numbers and
call them tuned.

| constant | value | what it does |
|---|---|---|
| `GRID_W`, `GRID_H` | 200, 300 | the cliff, in cells. Repainted as one `putImageData` per frame |
| `BRUSH_R`, `BRUSH_RATE` | 10, 0.15 | the brush never damages a bone. The rate is what one full sweep over a cell takes off, divided by the integral of the tool's own falloff, so a pass takes off what it promises |
| `CHISEL_R`, `CHISEL_RATE` | 8, 0.5 | quicker, and it cracks |
| `CHISEL_FILL`, `CHISEL_DRAIN`, `CHISEL_WARN` | 1.0, 2.0, 0.6 | the pressure meter fills at 1.0 per second of REST on a bone cell and empties at 2.0 per second off bone. The shiver and the tone arrive at 0.6, the crack at 1.0. Charged in the frame loop by the wall clock, never per pointer event: a finger held perfectly still generates no events at all and stillness is the thing the rule is about |
| `PICK_R`, `PICK_RATE` | 14, 1.0 | cracks any bone cell it touches, at once |
| `EXTRACT_CLEAR` | 0.85 | of a bone's cells cleared before it can be traced |
| `TRACE_TOL`, `TRACE_COVER` | 12, 0.70 | the trace is judged in GRID CELLS against the bone's own spine, never in screen pixels, so zoom cannot change the rule. It must start on a freed bone, or every stroke along a rib would pull it out |
| `MOUNT_MIN` | 0.60 | of the skeleton before MOUNT appears. Under it the button stays hidden and the bronze covers the rest |
| `BONES_MIN`, `BONES_MAX` | 12, 80 | the budget the sim gate holds. The grammar actually runs 39 to 74, mean 55.7 |
| `BANDS` | 6 | six beds, five wavy boundaries, band 0 the youngest at the top |
| `SITE_SMALL`, `SITE_LARGE` | 1, 2 | a site at depth 1 or deeper has a 42 percent chance of two skeletons, the deeper one lower. See section 6 |
| `SCAN_PER_SITE` | 1 | one free shimmer per site over the largest bone |
| `DUST_MAX` | 400 | grains at once. Bounded, so a long brushing session cannot leak |
| `MISSING_CHANCE`, `SCATTER_CHANCE`, `SCATTER_MIN`, `SCATTER_MAX` | 0.05, 0.20, 2, 6 | the ground keeps one bone in twenty, never the skull, and moves one in five by two to six cells. Mounting is what undoes the scatter |
| `DEEP_UNLOCK_A/B/C` | 2, 5, 9 | specimens mounted before a deeper site opens. Depth is the whole progression and there is no experience bar |
| `WING_A/B/C` | 4, 8, 12 | **declared and never read.** The museum wings are not built. See section 6 |
| `ZOOM_MIN`, `ZOOM_MAX`, `TAP_SLOP` | 0.7, 2.5, 10 | pinch bounds and the pixels a drag may wander before it stops being a tap |
| `BL` (at 656, outside CONFIG) | 10 | ONE BODY LENGTH. Every part of an animal is a fraction of it. Sizing parts absolutely made proportions a function of how many vertebrae a seed happened to roll, and fifty animals came out as fifty identical centipedes |
| `MOUNT_SNAP` (at 3553) | 46 | the snap radius on the bench, about a fingertip and a half |

`SAVE_KEY` is `lw_strata_v1` and `SAVE_V` is 1. **Every field the game keeps must be
named in `saveNow` at 2641.** It rebuilds the save from disk and copies a whitelist
over it, which is what makes two tabs safe, and a field that is not on the list is
written and dropped in the same call. The journal's three counters were added and not
listed, so a real dig incremented them and the same call threw them away.

---

## 5. What the screenshots found that the gates could not

The full list is in the plan's evidence ledger. The five worth carrying to another
game:

1. **A buried thing must look exactly like what is over it.** Every skeleton showed
   through the cliff as pale rectangles, because bone cells were painted by a
   different route and their matrix had been softened.
2. **A rule charged by input EVENTS is not charged by time.** The pressure meter
   filled per `pointermove`, so holding a finger perfectly still, which is the thing
   the rule is about, filled nothing.
3. **A title screen that does not show the game is a wasted screen.** It ran as a flat
   brown rectangle until somebody opened the shot.
4. **A whitelist save merge drops every field nobody added to the list.** Section 4.
5. **The fleet's music chip chases free space.** It reseats into the freest corner and
   followed the journal title through two rounds of padding. The top band belongs to
   the chip, so nothing of ours lives in it.

---

## 6. What is thin

Ranked. The first is a fault, the rest are gaps and calls.

1. **A large site's second skeleton can be dug and can never be mounted.** At depth 1
   or deeper, 42 percent of sites carry two animals (`makeSite`, 1176). The brush, the
   chisel, the pick and the trace all loop over every specimen (`stroke` 1294,
   `tryExtract` 1474), so the deeper animal's bones really do come free and really do
   count toward the lifted tally. But `refreshChrome` at 2689, the site chip at 2692,
   `openMount` at 2765 and `openNameSheet` at 3555 all read `G.dig.specimens[0]` and
   nothing else. The site chip reads "N of M lifted" against the FIRST animal's bone
   count, and every bone lifted off the second one is lost when a new site opens. No
   gate covers it: the sim gate asserts the two animals are placed (2127) and no gate
   asks whether the second can be mounted.
2. **Nobody has heard any of it, and there is no ear gate.** The tak, the tik, the
   shhh, the clink, the crack, the jacket and the scan are all synthesised in `AUDIO`
   at 2422 and all unheard. The clink is the heartbeat moment of the game and is
   Director call 3. Strata is on the list for the fleet ear gate, which renders the
   loudest minute through the real functions into an `OfflineAudioContext` and reports
   peak, rms and the share of energy above 3 kHz.
3. **The brush is the quietest sound in the game and it is the first gesture.** The
   `shhh` at 2477 is a 5.2 kHz highpassed noise burst of 0.05 seconds at peak 0.045,
   against the pick's `tak` at 0.30 and the crack at 0.42. It fires once per four
   cells of travel. The dust in the brushed patch is a faint pale patch on the second
   band. On a phone in daylight the feedback for the first gesture a player makes is
   nearly nothing. See the note in the plan's SESSION STATE, which is a note and not a
   build.
4. **The fifty bone crate.** A whole animal is 39 to 74 bones and the tray is one
   horizontal strip showing about six at a time, with an ALL button beside it. Most
   people will press ALL every time, which makes the drag a decoration. Grouping the
   tray by kind or asking only for the ten bones that matter is Director call 15.
5. **The variety count is still the builder's twelve.** Director call 17 asks Stephen
   to open `docs/shots/p0-variety.png` and say which five he would keep. If he counts
   four the grammar goes back on the bench.
6. **The museum wings do not exist.** `WING_A`, `WING_B` and `WING_C` are in CONFIG at
   399 and are read nowhere. `SAVE.unlocked` is merged upward in `saveNow` at 2654 and
   is never set and never read. The plan describes Deep Time, Sea Hall and Aviary as
   filters and a backdrop tint at 4, 8 and 12 specimens.
7. **There is no mutation gate.** `sim.js` line 29 names `test/mutants.mjs` and points
   its `STRATA_HTML` override at it. That file does not exist. Whistlestop has one and
   it proved twenty of its gates were decoration. This was named in the morning report
   as the first thing to add with another hour, and it is still not there.
8. **The lint's text floor reads CSS only.** Line 110 of `tools/lint.mjs` matches
   `font-size: Nrem` and nothing else, so a canvas font literal slips under the 0.7 rem
   law unseen. Strata has no violation today, because its only canvas fonts are on the
   plate at 22 px to 66 px in a 1080 wide space (`renderPlate`, 3250 to 3276), but the
   gate cannot see them and would not catch one.
9. **The plate has never been shot.** The plan's P2 step 4 asks for
   `docs/shots/p2-plate.png` at 512 wide and there is no such file in `docs/shots/`.
   The plate is also 1080x1350 in the code (`exportPlate`, 3281) where the plan's
   section 4 says 2048x2560. The code is the smaller and the plan was never corrected.
10. **The portal card is two stamps behind.** `portal/index.html` line 1049 pins
    `/satellites/strata/?v=20260906b` and the thumb at `?v=20260906b`, while the game
    ships `20260906f`. The game still loads, but the arcade is asking the host for an
    older cache key than the one the tile was rebuilt under.
11. **The five picture faults named in the morning report** are all still true: the
    skull merges into the neck on the variety sheet, the excavated hollow is a hard
    edged dark shape rather than a softening of the rock, the tray tiles read as a row
    of near identical rectangles, the hall wall carries nothing above the plinths on a
    short phone, and the arcade tile's bit dropping has posterised the rock into bands.
