# HANDOFF GLIMPSE, the build plan for the math catalog's sixth game

**Written:** 2026-09-15 late night, by Opus (the builder), as step 1 of GLIMPSE (`plans/math/CATALOG-PLAN.md` section 8), from
three inputs read whole: `assets/math-catalog/04-GLIMPSE-handoff.md` (Stephen's delivery, read only), `plans/math/CATALOG-PLAN.md`
(which binds this file and wins over the handoff), and CORE as built (`plans/math/HANDOFF-CORE.md`, `satellites/math/core/`),
with SPAN, YONDER, CREASE and BRIM as the finished examples. Where this file and the handoff differ, every difference is in
section 3.
**Game folder:** `satellites/glimpse/` (free, checked 2026-09-15). **Live URL when listed:** `lucidwinds.com/satellites/glimpse/`.
**Working title:** Glimpse. The display name is Stephen's (CATALOG-PLAN call 4; the handoff says avoid BLINK).

---

## SESSION STATE (the builder updates this at the end of every session; the morning reader starts here)

- 2026-09-15 late night, Opus: plan written, before any code, while CREASE's and BRIM's gates run under the lock.
  **Next action:** finish CREASE and BRIM (their SESSION STATE), then P0 here (section 5): the laws first,
  `satellites/glimpse/test/generator.mjs` red with no modules (the handoff's "decorrelation test before the renderer"),
  then `engine.js` (`convexHull`, `arrange`, `generateSwarm`, `generateSwarmPair`, the session deals), `tools/lint.mjs`,
  `tools/check.js`, commit.

---

## 0. RULES OF ENGAGEMENT

1. **The fence.** `satellites/glimpse/**`, this file, and `satellites/math/config/schemas.js` (GLIMPSE's entry only, under the
   builder's own stamp, which moves alone). Read only: `assets/math-catalog/**`, `plans/math/CATALOG-PLAN.md`,
   `satellites/math/core/**` (a CORE change goes under CORE's plan with a law watched red, CORE's stamp moved and every
   shipped game's worker following), every other satellite, `scripts/`, `music-unlocks.js`. **No portal row**: Fable's.
2. **Git.** Stage by path, never `-A` (`package.json` force added past the repo's ignore rule, as every math game's).
   Commit and push the moment something is green. Deploy is `git push origin add-sproing-jumper:main` after
   `git log HEAD..origin/main` is empty, then one request per served file with a random probe, a few seconds apart.
3. **The laws.** The fleet's (HANDOFF-OPUS-SEP15 section 6), CORE's G1 to G13 and S1 to S3, the reveal contract, and
   GLIMPSE's GL1 to GL8 (section 4). No dash and no exclamation point in player copy; "Sky Wolf Studio", singular; 56 px
   targets for every control a child uses (CATALOG-PLAN D4 names GLIMPSE); text 0.7 rem or larger, measured; the engine
   pure; a count is a law proved on 20 seeds; a gate never sets the state it asserts.
4. **Browser gates run one at a time under the lock**, and a gate queued while the tree is being edited runs on a frozen
   copy. Every gate has a timeout.
5. **Never wait on a human.** Section 10.
6. **Scars carried here** (YONDER's, CREASE's and BRIM's ledgers): a sound or speech inside an animation frame is guarded; a
   frame's time is clamped at zero; a plant that plants nothing is rewritten; a law that reads a state before the page makes
   it is no law; a stamp is never one another game's import was served under; a module imported at two addresses is
   precached at both; a gate loop longer than a run meets the run's end (close its journal page or ask for a longer run);
   a zero height box's border draws above its place; a deal must never hand a child a round with no right answer on the
   screen.

---

## 1. WHAT GLIMPSE IS, AND WHY IT GOES HERE

Fireflies blink on in a dark meadow and blink off. How many? A child who sees seven as five and two has a structure to add
with; a child who counts seven dots has nothing to build on. GLIMPSE trains the first kind of seeing (perceptual
subitizing to five) and, the prize, the second (conceptual: groups, ten frames, what is missing to ten), with every flash
masked so the afterimage cannot be counted.

It goes here because it hardens CORE's `schedule` (frame accurate flashes, the mask, reaction time from paint), which HUSH
uses next.

---

## 2. INHERITANCE (real paths and lines, checked 2026-09-15)

| What | From | How GLIMPSE uses it |
|---|---|---|
| Seeded randomness | `satellites/math/core/pure.js` line 15 `rng(seed)` | every arrangement and deal |
| The flash | `satellites/math/core/core.js` line 444 `schedule.flash({ durationMs, onShow, onHide, onMasked, onPainted })`; `pure.js` line 143 `hideNow` | every flash, frame accurate (S1), shown time from paint (S2), the mask on the hide frame (S3, GL1) |
| Tier ladder | `pure.js` line 58 `adaptTier` | Modes 1 to 3: flash length and set size; slow right answers do not climb it (GL3) |
| Staircase | `pure.js` line 78 `adaptStaircase` | Mode 4's ratio ladder, if Mode 4 is ever unparked (3.3) |
| The reveal contract | `core.js` line 319 `reveal.show` | the fireflies fade back where they were, then fly into structure and land one at a time |
| Audio | `core.js` line 383 `audio` | one voice per flash, whatever the count (GL2) |
| Store, settings, collectible | `core.js` lines 63, 110; `pure.js` line 148 `collectOnce` | the ladder, the flash length setting and Long Look, the field journal |
| Teacher's link | `pure.js` lines 181, 203; `satellites/math/config/schemas.js` | `config.js`, held equal by `test/config.mjs` |
| Sprites | `core.js` line 487 `sprite.draw`; `core/tools/sheet.mjs`; BRIM's `draw.js` and `shelf.js` | the firefly glow drawn once and blitted, the meadow, the pads' patterns, the journal pages |
| Test harness and shared assertions | `core/test/harness.mjs` 31 `serve`, 45 `SIZES`, 59 `open`, 86 `centre`, 97 `tap`; `core/test/shared.mjs` 33, 80, 98, 127, 165 `assertTimingPicksNearest` | every browser gate; the flash timing gate |
| Lint, runner, layout, offline, pace, art, specimens, audio, config, icons, shots, worker, doors | `satellites/brim/tools/*`, `test/*.mjs`, `sw.js` | copied and pointed at GLIMPSE, every law watched red again here |

---

## 3. CORRECTIONS AND DIFFERENCES (section 2 of the catalog plan, plus what arithmetic found)

Every numeric claim here was checked by a script on 2026-09-15 (session scratch `glimpse-arith.mjs`, seeded) before this
file was written.

3.1 **RESONARC does not exist.** GL2's one sound per flash is a CORE `audio` voice played once from the flash's show frame,
never per firefly; the ear gate counts plays per flash over every count from 1 to 10 and renders the loudest pattern.

3.2 **The design spec (`GLIMPSE-design-spec.md`) was not delivered** (CATALOG-PLAN correction 4); its section 2 honesty note
and section 5 generator are built from the handoff's section 0 and 3.

3.3 **Mode 4 MORE is parked** (CATALOG-PLAN call 7, the handoff's own section 0). v1 is Modes 1, 2, 3 and 5. The swarm pair
generator and its decorrelation gates are still built and green in P0, because the handoff says write them first and Mode 5
uses the same pair generator; no MORE door is on the page.

3.4 **"Congruency is set independently per cue" cannot be done literally.** Density is cumulative area over hull, so when area
and hull point opposite ways density's direction is forced; mean diameter and area are tied through the count. Over 40,000
generated pairs with the more numerous swarm on side A, **only 9 of the 16 congruency vectors (area, hull, diameter, density)
ever occur**:
```
cccc 9958, ccci 3587, ccic 1432, ccii 4425, cicc 6508, ciic 2839, icii 7022, iiic 2004, iiii 2225
```
A weighting over the vectors that occur still puts **every cue at exactly 50 percent congruent** (cccc, ccci, cicc, icii, iiic,
iiii at one sixth each, the other three at none). So the generator draws a congruency vector from that weighted set, then
builds a pair that realizes it and measures the result (a pair that misses its vector is built again); the cues are not
independent of each other, and the handoff's gates stand as written: each cue 48 to 52 percent congruent over 200 trials,
`|corr(numerosity difference, cue difference)| < 0.1` for each of the four, no overlap, hulls overlapping 80 percent.

3.5 **GL4 cannot hold for a single swarm on every cue at once.** With dot size and spread drawn independently of the count
(3000 trials a range):
```
counts 1 to 5:  corr with count, area 0.85, mean diameter -0.01, hull 0.76, density -0.17
counts 5 to 10: corr with count, area 0.67, mean diameter -0.01, hull 0.52, density -0.13
counts 1 to 5, total area drawn independently instead: area -0.02, mean diameter -0.85
```
More fireflies are more glow unless each is smaller, and then size tells the count. No single swarm generator decorrelates
area and diameter together. **v1 balances the two strategies inside every session** (half the random arrangement trials
size free, half area matched, by construction) and **states the bound it measures in P0** for each cue rather than a bound it
cannot meet; the regular arrangements (dice, finger, tally, ten frame) have fixed geometry by design, and GL4's gate applies to
the random and line arrangements. The handoff's `< 0.1` gate is for Mode 4 pairs (3.4), where it holds.

3.14 **BLOCKED: Mode 4's diameter decorrelation, across the handoff's ratio ladder, after three attempts.** (Found in P0,
2026-09-15; the gate is `test/more.mjs`, moved there unchanged from `test/generator.mjs`, run by `tools/check.js` every
time and reported apart, never counted toward v1.)
- Attempt 1, congruency balanced by sign only: `corr(numerosity, cumArea) 0.414`, hull 0.240, density 0.141. A congruent
  trial's differences run larger than an incongruent one's.
- Attempt 2, mirrored couples (each pair and the same two swarms with their areas and hulls traded by scaling radii and
  spreads, which lands exactly on the other three weighted vectors): area, hull and density cancel exactly and pass;
  `corr(numerosity, diameter) -0.343`, -0.335, -0.295, and one seed's hulls overlap 79 percent.
- Attempt 3, by arithmetic before code: with q the square root of the count ratio and rho the more numerous swarm's radius
  ratio, an area trading mirror gives the couple's diameter difference sum `-(q - 1)(rho + 1/q)`, negative for every couple;
  the count difference is positive by definition whichever side holds it, so the covariance cannot cancel. A diameter
  trading mirror gives the area sum `(1 + u^2)(R - 1) > 0` for every couple (u the diameter ratio, R the count ratio). A
  mirror trading both, by reshaping each swarm's spread of dot sizes at fixed area, needs a radius spread under 1 and is only
  possible for count ratios up to about 1.4; the handoff's ladder starts at 2.0.
So no construction found meets `|corr| < 0.1` on all four raw cue differences over the ladder. The handoff's own rule holds:
**Mode 4 does not ship** while its gate is red. It was parked for v1 already (3.3), so v1 loses nothing. Stephen's call
(section 10) now carries this: ship Mode 4 on a ladder capped at 1.4, or against a gate on log ratio differences, or not.

3.6 **Answer pads at 320 px (GL7).** A pad is 56 px square with its numeral and its dot pattern. Inside 16 px gutters a 320
screen has 288 px. Ten pads in a row need 560 px; five in a row need 5 x 56 + 4 x 8 = 312 px at 8 px gaps, over 288; four
need 4 x 56 + 3 x 8 = 248 px, and three need 184. So **a round offers only the pads its range needs, at most four to a
row**: Mode 1 (1 to 5) five pads, three over two; Mode 2 (5 to 10) six pads, three over three; Mode 3's complement (0 to 10)
eleven pads, four, four and three; Mode 5's same, more, fewer, three pads. `test/layout.mjs` measures every pad at 320.

3.7 **Timing.** Flash lengths from the handoff's table (400 ms for 1 to 5, 350 for 6 to 10), the settings' 250, 400 and 600,
and Long Look at 1500 labelled a counting game. The mask is 200 ms of grass stir starting on the hide frame (`onMasked`). The
timing gate measures shown time from paint to hide under 4x CPU throttle within 30 ms (at 60 Hz that is under two frames,
which `schedule.flash`'s nearest frame rule gives). Reaction time is measured from paint (S2) and handed to the pure engine;
past 2.5 s a right answer counts and does not climb the tier (GL3), and nothing on the screen says so.

3.8 **The glow is a pixel sprite drawn once and blitted** (CATALOG-PLAN section 5 pixel art; the handoff's "pre-rendered glow
reused, not box-shadow"): one canvas per colour, `drawImage` for each firefly, whole pixel positions; the pace gate holds 24
fireflies at 55 fps or better under 4x throttle.

3.9 **Blue and amber swarms, and a shape difference in settings** (GL8): the two colours differ in CIE lightness by 20 or
more, measured by the art gate; the shape setting draws one swarm as squares.

3.10 **The field journal is v1** (CATALOG-PLAN D8): 24 sketched pages, one a run, cosmetic, never a count.

3.11 **Spoken numerals** (the handoff's ask; CATALOG-PLAN call 8): at the reveal only, after the answer, with Sound on and a
voice on this device, the numeral also on the screen (YONDER's Y7 shape). Never during a flash, where a spoken count would be
GL2's fault.

3.12 **GLIMPSE's stamp starts at `20260916c`**, a stamp no game has carried.

3.13 **Mode 2 weighting** as the handoff: pairs built on five first (5+2, 5+3, 5+4, 5+5), then wider, and the same total served
as several splits within one run (8 as 4+4, 5+3, 6+2); a law counts it on 20 seeds.

---

## 4. ARCHITECTURE LAW

```
satellites/glimpse/
├── index.html  main.js   the page: doors, the meadow, the flash, the mask, the pads, the reveal, the run, the journal
├── engine.js             PURE: convexHull, arrange, generateSwarm, generateSwarmPair, the deals, scoring with reaction time
├── render.js             the meadow canvas, fireflies blitted from the glow sprite, the grass mask, the re-landing
├── content.js  config.js  sprites.js  draw.js  shelf.js (the journal)  sw.js  manifest.webmanifest  icons
├── test/   generator.mjs engine.mjs (node); flash.mjs frame.mjs groups.mjs spread.mjs timing.mjs audio.mjs config.mjs
│           layout.mjs offline.mjs pace.mjs art.mjs specimens.mjs (browser)
├── tools/  check.js lint.mjs shots.mjs icons.mjs
└── docs/   DECISIONS.md shots/
```

**GL1 to GL8, the law each becomes.** GL1 the mask is drawn on the flash's hide frame in every mode, read by the timing
gate at that frame; GL2 one play per flash over counts 1 to 10 (the ear gate) and a static law (the flash's voice is played
from one call site, outside any loop over fireflies); GL3 nothing on the screen changes with time during a round, and a slow
right answer does not climb the tier (engine law and page seam); GL4 section 3.5's measured bound for single swarms and 3.4's
gates for pairs, on 20 seeds; GL5 no two dots touch in 500 arrangements a mode; GL6 the arrangement order dice, finger, tally,
line, random as the tier climbs; GL7 every pad carries its numeral and its pattern, 56 px at 320; GL8 the colours' lightness
difference and the shape setting.

---

## 5. THE PHASES, WITH GATES (the handoff's section 7 mapped one to one)

### P0. The generator, the deals, the laws (about 4 hours; the handoff's hardest engineering)
`test/generator.mjs` red with no modules, then on 20 seeds: `convexHull` exact against hand cases; no overlap in 500
arrangements a kind; Mode 4 pairs (3.4) over 200 trials a seed, each cue 48 to 52 percent and `|corr| < 0.1`, hulls
overlapping 80 percent; single swarms (3.5) balanced and under the bound measured; `test/engine.mjs`: the deals for Modes 1,
2, 3 and 5 (GL6 order, 3.13's weighting, the complement questions alternating with how many, Mode 5's three round types),
scoring with reaction time (GL3). `tools/lint.mjs` from BRIM's with GL2's static law.

### P1. The meadow, FLASH, the mask, the pads, the reveal (about 3 hours)
The flash through `schedule.flash`, the mask on its hide frame, pads for the round's range, the re-landing reveal.
`test/flash.mjs` (the seam, GL1, GL7, the reveal contract) and `test/timing.mjs` (each flash length within 30 ms under 4x
throttle; reaction time from paint with an injected 100 ms delay, CORE's shape).

### P2. FRAME, GROUPS, SPREAD, audio (about 3 hours)
FRAME first (the highest value): the ten frame and the complement question. GROUPS with its composition weighting. SPREAD's
three round types, the fireflies flying into a ten frame at the reveal. The voice and the ear gate.

### P3. Journal, links, layout, pace, offline, art (about 3 hours)
As BRIM's P3, with the pace gate's 24 fireflies and the pads measured at 320.

**GLIMPSE v1 is done** when `tools/check.js` prints ALL GATES PASSED under the lock, every gate has a red line in section 13,
every shot is opened with its faults named, it is deployed and the served files probed, and the listing line is in section
8 for Fable.

---

## 6. THE SCREENS

- **First run:** a wordless loop: fireflies blink on, off, grass stirs, a finger taps the pad with three dots and the
  numeral 3, the fireflies fly into a row of three. Then the doors, a picture each: FLASH, GROUPS, FRAME, SPREAD.
- **A round:** the dark meadow; the flash; the grass stir; the pads for the round's range.
- **The reveal:** the child's pad stays marked; the fireflies fade back where they were, then fly into structure (a dice
  face, a five and a two, a ten frame) and land one at a time; the numeral.
- **The journal:** the sketched pages earned so far.

---

## 7. ART

Code drawn pixel sprites: the firefly glow in blue and amber (and squares for the shape setting), grass tufts for the mask,
the doors, the pads' dot patterns, 24 journal pages. `tools/sheet` renders the table; the sheet is opened with three faults
named. Painted sheets are Stephen's, later.

---

## 8. LISTING (the line for Fable's portal row)

"Fireflies blink on in a dark meadow and off again: how many did you see, a free number sense game with no login." (One
sentence, no dash. `cat:"math"`, In Development.)

---

## 9. PITFALLS

A note per firefly (GL2); `setTimeout` for a flash (S1); no mask because the dots already went (GL1); `box-shadow` glow;
shipping Mode 4 because it is nearly done (3.3); controlling every cue in every trial (3.4, 3.5); ten pads squeezed into 320
(3.6); a visible timer or a "fast" word (GL3); from the ledgers: a run's end meeting a long gate loop, a deal with no right
answer on the screen.

---

## 10. DECISION RIGHTS AND OPEN QUESTIONS

| Question | Default the build takes |
|---|---|
| Final name (avoid BLINK) | Glimpse, the working title |
| Whether Mode 4 ships at all | parked; its generator exists and its ship gate is BLOCKED on diameter (3.14): a ladder capped at 1.4, a gate on log ratios, or no Mode 4 |
| Spoken numerals | at the reveal only, local voice, numeral on screen (3.11) |
| GLIMPSE as the catalog's front door for the young | not decided here; the landing page is Fable's |

---

## 11. STEPHEN ONLY

The questions above and the display name; a child of three to six on FLASH and FRAME; flash timing on a real school
Chromebook.

---

## 12. HONEST SIZING

About 13 hours (P0 4, P1 3, P2 3, P3 3), the catalog plan's one and a half days. Where a session stops well: after P1, when
FLASH is honest (masked, timed from paint, one sound); FRAME's complement comes next.

---

## 13. EVIDENCE LEDGER (fill in place, with commands and their real output, most recent last)

### P0, the generator, the deals and their laws (2026-09-15 late night)

Section 3's arithmetic checked by a seeded script before the plan (3.4's nine vectors and weights, 3.5's correlations, 3.6's
pad widths). `test/generator.mjs` and `test/engine.mjs` written first; with no engine both went red on the line that matters:
```
  FAIL  engine.js loads as an ES module (Cannot find module '/workspaces/lucid-winds/satellites/glimpse/engine.js' ...)
```
Then `engine.js`. **ENGINE OK** on its first run (so it counted for nothing until its plants went red). **The generator went
red twice, honestly:**
```
  FAIL  Mode 4 pairs: ... 3000 corr(numerosity, cumArea) 0.414; 3000 corr(numerosity, hull) 0.240; 3000 corr(numerosity, density) 0.141
  FAIL  single swarms: ... |corr| with the count under 0.6 for area and for diameter (worst 0.63 and 0.63)
```
Single swarms: the two strategies' radius ranges were narrow, so each one's own tie to the count ruled; both are log uniform
over a wider span now, and the law passes under its unchanged bound. Mode 4: mirrored couples cancelled area, hull and density
exactly, and diameter stayed at -0.34 (3.14 has the algebra of why it cannot cancel on this ladder). **Mode 4's gate is
BLOCKED** after three attempts, moved unchanged to `test/more.mjs`, and `tools/check.js` reports it apart:
```
lint            pass  0s
generator       pass  0s
engine          pass  0s

PARKED, not counted: more (Mode 4) RED, BLOCKED (Mode 4 does not ship)
THE GATES THAT NEED NO BROWSER PASSED
```
**Watched red** (session scratch `glimpse-p0-plants.cjs`, a folder copy per plant):
```
g1 a hull twice its area            FAIL convexHull and hullArea are exact on hand cases: 5 points gave area 2 and 4 corners ...
g2 touching allowed in a scatter    FAIL GL5: no two dots touch and every dot lies inside the field ...: random 6 dots 1 and 2 ...
g3 density upside down              FAIL measure() returns the area, hull, mean diameter and density the dots give, recomputed here: dice 5 ...
g4 strategies not half and half     FAIL single swarms: size free and area matched dealt half and half ...: 3000: 160 size free ...
g5 area matching ignores the count  FAIL single swarms: ... (worst 0.75 and 0.12) ...
e1 one flash length for all         FAIL flashMs: 400 for 1 to 5, 350 for 6 to 10 ...: 6 gave 400 ...
e2 random before its tier           FAIL GL6: FLASH at a tier serves only arrangements up to its place ...: 3000 tier 1 served tally 3 ...
e3 few built on five                FAIL GROUPS: ... 3000 built on five 33 percent at tier 0 ...
e4 the complement off by one        FAIL FRAME: ... 3000 complement of 1 answered 8 ...
e5 two spread types only            FAIL SPREAD: ... 3000 sameSize only 0 of 120 ...
e6 slow answers climb               FAIL scoreAnswer: ... 3 at 2501 ms gave {"correct":true,"climbs":true} ...
e7 six pads to a row                FAIL padsFor gives the round's range and no more, at most four to a row (3.6): flash rows [[1,2,3,4,5]] ...
e8 an unseeded shuffle              FAIL a seed replays its sessions ...; FAIL engine.js touches no screen, clock or unseeded die: it names Math.random
l1 a sound per firefly              FAIL GL2: no sound is played from inside a loop ...: engine.js plays a sound inside a loop: sound('blink'); }
l2 a clock in the engine            FAIL engine.js touches no screen, clock or unseeded die: it names Date
l3 an unstamped import              FAIL every relative import and local asset carries ?v=20260916c: engine.js loads ./content.js
```
⛔ `e9 no total served twice` planted nothing, and the law's premise was at fault: it looked for any total served two ways,
and twelve rounds land on one by chance. The deal now marks its two twin rounds and the law reads them. Rerun:
```
e9 no total served twice            FAIL  GROUPS: ... every session serves one total twice, marked, on five and another way: 3000 tier 0 session 0 twins [] ...
```
Counted: all seventeen P0 plants red.

### P1, FLASH and timing (2026-09-16, under the lock on a frozen copy `snap-glimpse1`)
```
=== flash
FLASH OK
=== timing
TIMING OK
```
Both green on their first run, so neither counts until its plants go red (queued after P3's check).

### P2, GROUPS, FRAME and SPREAD (2026-09-16, frozen copy `snap-glimpse2`)
```
MODES OK
```
Green on its first run; its plants are queued with P1's.

The ear gate (frozen copy `snap-glimpse3`):
```
  ---   twenty loud seconds: peak 0.064  rms 0.0067  above 3 kHz 0.5 percent
AUDIO OK
```

### The first full check (2026-09-16, frozen copy `snap-glimpse4`, the timeout inside the lock)
```
lint pass, generator pass, engine pass, flash pass 54s, timing pass 10s, modes pass 51s, audio pass 65s, config pass,
specimens pass 528s, art pass 45s, pace pass 9s, layout pass 169s, offline pass 16s

PARKED, not counted: more (Mode 4) RED, BLOCKED (Mode 4 does not ship)
ALL GATES PASSED
```
Not done: the browser gates' plants (none has a red line yet), the shots opened, deploy.

**The icons, drawn under the lock and opened** (`icon-512.png`): three fireflies over a strip of grass. Faults named and accepted
for v1 (cosmetic): ⛔ the fireflies are hard concentric squares and read as lit windows or app buttons, not glows; ⛔ the grass is
three lone stubs on a flat strip; ⛔ at a launcher's 48 px the squares will blur into three dots with no firefly left in them.

### The browser gates' plants (2026-09-16, `glimpse-browser-plants.cjs`, 41 plants on a frozen copy of the committed tree)

**34 red on the first run** (fl2 to fl6, fl8, fl9, ti1, ti2, mo2 to mo6, au1 to au4, co1, co2, sp2, sp3, ar1 to ar3, pa2, la1 to la4,
of1 to of4), for example:
```
fl5 a blink per firefly           FAIL  375x667 GL2: with Sound on, one blink a flash, whatever the count (4:4, 1:1, 1:1, 3:3)
ti1 the page flash runs long      FAIL  at no throttle, each flash length is shown for its length (250 ms shown 317, 350 ms shown 417 ...)
mo4 both swarms amber             FAIL  375x667 spread the left swarm is blue and the right amber ({"left":{"blue":0,"amber":480},...})
au4 the blink hisses              FAIL  it is not an alarm: 93.8 percent of its energy above 3 kHz (under 30)
ar1 blue as light as amber        FAIL  GL8: the blue and amber fireflies differ by 10.0 in CIE lightness (at least 20; #e0b040 and #ffcb5c)
of3 a miss that never settles     FAIL  and a request for something never cached settles instead of hanging (still pending after 6 s)
```
⛔ **Seven did not count, and each was answered in the gate or the plant** (reruns queued on commit `bb10637f`):
- `fl1` (a deal one session on) planted nothing: FLASH's deal does not read the session; rewritten to draw once more from the seed.
- `fl7` (120 ms added to the reaction time) planted nothing: flash law 7 scored the page's own rt, so it agreed with any rt; the
  law now holds rt to the choice's time less the paint in the flash log.
- `mo1` (FRAME's zero pad removed) threw on a tap at the missing pad instead of failing a law; the gate answers with a pad that is
  there and the pads law names the missing one.
- `sp1` and `sp5` timed out on a round waiting under an early journal (CREASE's scar again); each loop now stops when the journal
  opens and plays its last round only while it is shut.
- `sp4` (a flash under the journal) planted nothing against a read at 150 ms, inside the 500 ms every flash waits anyway; the
  journal is now held open 1500 ms with no flash logged.
- `pa1` (square roots per firefly) planted nothing: the unused loop can be optimised away (CREASE's pa1 again); rewritten as two
  milliseconds of real time a firefly.

### The shots, taken and opened (2026-09-16, `tools/shots.mjs`, written this session: GLIMPSE had none)

Opened: `p3-flash-shown-375x667` (a Long Look flash on screen), `p3-frame-reveal-320x568`, `p3-spread-answer-375x667`,
`p3-journal-375x667`. Faults named:
- ⛔⛔ **FRAME's reveal at 320 cuts go on at the fold.** Eleven pads in three rows push the button partly off the screen. The
  layout gate missed it because it had no state with FRAME and go on together. That state is now in the gate, to be watched red
  on this page before the page is fixed.
- ⛔ the flash's four fireflies sit in a small square in the left half of the meadow; the arrangement is not centred in the
  field.
- ⛔ the pads for 7 to 10 carry tiny ten frames too cramped to read at a glance.
- ⛔ SPREAD's three pad pictures (two dot groups split by a bar) are near alike and hard to tell apart.
- ⛔ the journal after one run is a small pale page on a large grey board, low contrast (the catalog's accepted shelf fault).

---

### The fold under FRAME's eleven pads (2026-09-16)

The P3 shot at 320 showed go on cut by the fold under FRAME's pads, and no layout state had FRAME with go on. The state "FRAME
after its reveal" went into `test/layout.mjs` first (`db8c01ac`) and was **watched red** on a frozen copy of that commit:
```
  FAIL  320x568 FRAME after its reveal: everything a thumb needs is on the screen without scrolling: #next (244,522 to 308,578 in 320x568)
  FAIL  375x667 FRAME after its reveal: everything a thumb needs is on the screen without scrolling: #next (299,633 to 363,689 in 375x667)
```
The page's fault. FRAME's meadow now gives up height: 300 px wide at 700 px tall or shorter, 228 px at 600 or shorter, FRAME
only (`e7cd7904`). The layout rerun on a frozen copy of that commit: **LAYOUT OK**. A full check follows it.

### The answered plants rerun (2026-09-15 night, `glimpse-browser-plants.cjs` on a frozen copy of `bb10637f`)

Every plant that planted nothing on the first pass, rewritten, is now **watched red**:
```
fl1 a round off the seed          FAIL  320x568 every round is dealSession's for the seed and tier (dice 4 OFF, dice 1 OFF) | ...
fl7 reaction time off the paint   FAIL  320x568 the result is scoreAnswer's for the pad and the time from paint (1454 ms, choice less paint 1334; ...
mo1 FRAME without its zero pad    FAIL  375x667 frame the mode's pads and no more, each with its numeral and dots or its own picture, 56 px targets ...
sp1 a page every round            FAIL  the journal is shut after eleven rounds of twelve and opens on the next after the twelfth, holding one page ...
sp4 a flash under the journal     FAIL  while the journal is open the next round waits, no flash under it, and after go its flash comes ({"waited":"...
sp5 a reload mid run earns        FAIL  a reload in the middle of a run earns nothing: the journal is shut one round short and opens after it with ...
```
**pa1** (rewritten) **red**: `FAIL  under 4x CPU throttle, 24 moving fireflies draw a median of 66.7 ms a frame (at most 18.2), the longest 100 ms (at most 100), over 23 frames`.
**Every GLIMPSE browser plant is now watched red.**

### The full check after the FRAME fold fix (2026-09-15 night, frozen copy of `fbb7d2b5`, the timeout inside the lock)
```
lint pass · generator pass · engine pass · flash pass 55s · timing pass 10s · modes pass 51s · audio pass 66s · config pass 3s
specimens pass 529s · art pass 45s · pace pass 9s · layout pass 184s · offline pass 16s
PARKED, not counted: more (Mode 4) RED, BLOCKED (Mode 4 does not ship)
ALL GATES PASSED
```
**Every GLIMPSE gate is counted.**

**The FRAME shots reopened after the fold fix** (`tools/shots.mjs frame`, under the lock; `p3-frame-reveal-375x667.png` and
`p3-frame-reveal-320x568.png` opened): go on now stands fully on the screen at both sizes, the fault the P3 shot found. Faults
named: the meadow's top third is empty dark space above the ten frame, which sits low; the only ringed pad is the child's choice
(0) while nothing on the pads marks the true 6, whose only sign is the numeral in the meadow; the dot pictures on pads 7 to 10 are
illegible grey smudges at this size. Accepted for v1 (the reveal contract keeps the choice marked; the pad pictures are Stephen's
art call).

**Deployed and probed (2026-09-15 23:01 UTC).** `satellites/glimpse` deployed alone onto main (`7dbfb8ce`, a worktree on origin/main,
main then merged back into `add-sproing-jumper` as `27ff2041`). Probes, one file at a time with a random query:
`/satellites/glimpse/sw.js` 200 naming `glimpse-shell-20260916c`; `/satellites/glimpse/icon-192.png` 200 `image/png` 967 B.
**GLIMPSE is live** (unlisted; the portal row is Fable's).

## 14. THE OVERNIGHT PROTOCOL

Never wait on a human; an ambiguity is the smallest reasonable choice logged in `satellites/glimpse/docs/DECISIONS.md`; a gate
red after three honest attempts goes into SESSION STATE as BLOCKED with its last thirty lines; never weaken, skip or delete a
gate; commit and push the moment something is green.

---

## 15. THE MORNING REPORT (most recent on top)

(none yet)
- SHOT p3-flash-shown-375x667.png OPENED. Faults: (1) the four dots shown are bright blue glowing sprites but the pips inside the answer buttons are tiny flat grey squares, so the thing shown and the thing chosen do not look like the same kind of thing; (2) the answer buttons run 1 to 5 as three then two, and the second row is nudged right of centre so the block reads crooked; (3) the digits on the buttons are mid grey on near black, the lowest contrast text in any shot so far, and the pips are smaller than the digits; (4) the dots sit left of centre in a frame that is nearly all empty, and the frame itself is a thin outline with nothing to say it is a window that will close.
- SHOT p3-journal-375x667.png OPENED. Faults: (1) one pale card with a few blue marks sits in the top left corner of a near empty dark frame — the same disease as GAUGE’s case, NOTCH’s village, GLIMPSE’s journal and HUSH’s clearing: the first earned thing is dropped in the top left corner of a large empty board, so the first reward reads as a stain instead of a beginning. The collection views need a composition (the early places worked inward or centred) rather than a seeded scatter that starts in a corner.; (2) the card is the only light shape on the page and reads as an unloaded placeholder; (3) the frame is a faint outline against a dark page, so the journal has no body; (4) the bottom third is empty.
- SHOT p3-spread-answer-375x667.png OPENED. The frame is completely empty, and that is almost certainly right — the spread has flashed and closed, which is the whole game — so it is named here as design, not as a fault. The faults around it: (1) a closed frame looks exactly like a frame that failed to load, with nothing (no shutter, no dimming, no word) to say it closed on purpose; (2) the three answers hold pip clusters so small and so alike that they must be compared pip by pip; (3) those clusters are pale grey on near black, the same weak contrast as the flash screen; (4) the frame keeps two thirds of the screen while holding nothing, and the answers are squeezed into a band under it.
- SHOT p3-frame-reveal-375x667.png OPENED. Faults: (1) the eleven answers speak two languages in one block — 1 to 6 carry loose pips, while 0 and 7 to 10 carry a little grid glyph, so the same row asks a child to read two kinds of picture; (2) the chosen answer (0) wears a pale ring and the true answer (6) is printed large under the frame, and nothing connects the two, the reveal fault this catalog keeps repeating; (3) the ten frame in the window is drawn in thin pale outlines on near black, the lowest contrast structure in the catalog; (4) the answer block wraps four, four, then three, so no row lines up with another.
- SHOT p3-flash-answer-375x667.png OPENED. The empty window is the flash having closed, which is the game, so it is not a fault. Faults: (1) the window keeps two thirds of the screen while holding nothing and there is still no shutter, dimming or word to say it closed on purpose rather than failed to load; (2) the five answers wrap three then two with the second row nudged right of centre, so the block reads crooked; (3) the pips inside the buttons are about 8 px and sit well below the digits, so the picture that should help a child count is the smallest thing on the screen; (4) nothing anywhere says how many dots were shown or what is being asked, the screen is a frame and five numbers.
- SHOT p3-doors-375x667.png OPENED, and these are the worst doors in the catalog: FOUR ways to play and not one word on any of them, where NOTCH offers two wordless shapes and GAUGE and TINT name all three of theirs. Faults: (1) nothing names any mode, so a child picks blind; (2) three of the four doors are scattered blue pips that look nearly identical at thumbnail size, and the fourth is a little grid, so the only distinction a child can see is between one door and the other three; (3) the window above holds three large blue squares while the doors hold tiny pips, the same idea drawn at two scales with nothing connecting them; (4) the doors sit in a band across the middle with the top third and the bottom third empty.
- SHOT p3-flash-reveal-375x667.png OPENED. Faults: (1) the reveal again: the child’s choice (1) wears a pale ring in the answer row while the truth (4) is a numeral printed inside the window, two marks in two places with nothing connecting them, so a wrong answer teaches nothing; (2) the four dots sit in a clean two by two square but the pips on the answer buttons are scattered at random, so the arrangement that would let a child match the picture to the number is thrown away on the very buttons meant to carry it; (3) the numeral 4 sits low inside the window under the dots, unlabelled, so it reads as part of the picture rather than as the answer; (4) the digits on the buttons are mid grey on near black, the weakest contrast in the catalog, while the revealed 4 is bright white, three different text weights in one screen.
- SHOT p3-journal-320x568.png OPENED. Faults: (1) the one earned card sits in the top left corner of an empty dark frame at 320 as well, so the corner disease is not a wide screen artefact; (2) the card is a pale grey rectangle with four blue marks and no border of its own, so it reads as an image that failed to load rather than as a thing collected; (3) the frame is a thin outline barely lighter than the page, so the journal has no body at any size; (4) the bottom third is empty under the play button.
- SHOT p3-flash-shown-1366x768.png OPENED. Faults: (1) the game runs in a narrow central column on a 1366 px screen with both flanks bare, about 500 px of empty page either side; (2) the four dots sit left of centre inside a frame that is itself mostly empty, so the thing to count is small and off axis; (3) the five answers wrap three then two under a much wider frame, so the answers and the question do not share a shape; (4) the digits are mid grey on near black and the pips smaller still, the same weak contrast as every other GLIMPSE screen.
- SHOT p3-frame-reveal-320x568.png OPENED, and it is the BEST GLIMPSE screen at any size: at 320 the ten frame is large, its cells are clearly drawn, and six dots in a ten frame can actually be counted. Faults: (1) the answers still speak two languages, loose pips for 1 to 6 and little grids for 0 and 7 to 10; (2) the chosen 0 wears a pale ring while the truth 6 is a numeral inside the frame, the unconnected reveal again; (3) the digits are mid grey on near black while the revealed 6 is bright white; (4) the answers wrap four, four, three, so no row lines up with another.
- SHOT p3-flash-answer-320x568.png OPENED. The empty frame is the flash having closed, which is the game, so it is not counted as a fault. Faults: (1) the closed frame still looks exactly like one that failed to load, with no shutter, dimming or word; (2) the frame keeps more than half the screen while holding nothing; (3) the five answers wrap three then two, the second row nudged right of centre, so the block reads crooked at this width too; (4) the digits read better here than at 375, but the pips inside the buttons are still about 8 px and sit below the digits.
- SHOT p3-journal-1366x768.png OPENED. Faults: (1) the one earned card sits in the top left corner of a 620 by 420 frame with the rest empty, the corner disease at its most exposed; (2) the card is a pale grey rectangle with a few blue marks and no border of its own, reading as an image that failed to load; (3) the frame is a thin outline barely lighter than the page, so the journal has no body; (4) roughly 370 px of empty page on each flank and 130 px below the play button.
- SHOT p3-flash-reveal-320x568.png OPENED. Faults: (1) the four dots sit in a clean two by two square while the pips on the answer buttons are scattered at random, so the one arrangement that would let a child match the picture to a number is thrown away on the buttons themselves; (2) the child’s choice (1) wears a pale ring and the truth (4) is a numeral inside the frame, two marks in two places with nothing connecting them; (3) that revealed 4 sits directly under the dots inside the frame, so it reads as part of the picture rather than as the answer; (4) three text weights on one screen — bright white numeral, mid grey digits, dimmer pips.
