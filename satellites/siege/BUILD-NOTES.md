# SIEGE OF ONE — build notes

**Status: PLAYABLE AND VERIFIED IN NODE. Deepening pass done (second builder).**
Still not opened in a browser by anyone (the main loop owns browser gates on
this box). Everything below was proved with `node`.

- `satellites/siege/index.html` — the whole game, single file, no deps, no network.
- `satellites/siege/sim.js` — node runner, zero deps, extracts the layers from
  `index.html` between the marker comments so the game and the sweep cannot drift.
  Modes: `--test`, `--sweep`, `--watch=SEED`, `--margin`, `--diag [--wave=N]`.
- `satellites/siege/smoke.js` — minimal DOM shim. Boots the real page in node,
  drives 6000 frames with a simulated thumb, and reads the scorecard back out.
  Not a look at pixels; it only rules out a blank page and dead wiring.
- `satellites/siege/sw.js` + `manifest.webmanifest` — every cache constant is
  `siege-` prefixed; activate deletes only `siege-*`. **SHELL_VERSION is now
  `siege-shell-v2` and the registration is `sw.js?v=20260816b`** (bumped with
  this pass, or nobody would ever receive it).

## THE COMPOSITION FIX (done last, after a LOOKING pass came back)

The coordinator opened the combat screen at 390x844 and at desktop and reported
that **about ninety percent of the play area was empty black**. He was right and
it outranked everything else in these notes. Two consequences he named: the
units were too small for the eight silhouettes to be doing any work, and the
wave scorecard and spawn pips, the best things in the game, were not on screen
while the fight was happening.

### Why it was empty, in numbers

The lane is 30 cells and a phone is 390px, so **a cell can never be more than
13px**. That is a hard constraint of the spec, not a tuning mistake, and it caps
how big a body can be drawn. Meanwhile `#field` was `flex:1` and `.cell` ran
`top:0;bottom:0`, so 30 full height divider lines advertised ~660px of void with
a 26px band of content on the floor.

Zooming was the wrong answer: a camera that follows the player would make bodies
big but would destroy the whole lane read, and the whole lane read is what the
build phase is for. So the fix is the other one. **The lane became a strip and
the space above it became a control room.**

### What is on screen now

`#field` is a flex column: `#board` on top, `#lanebox` on the floor at
`clamp(112px, 17vh, 190px)`.

| | before | after |
|---|---|---|
| lane strip | 100% of field (~660px), 4% of it used | **143px, 21% of field** |
| watch board | did not exist | **553px, 79% of field** |
| body in the lane | 20 x 26px | **34 x 46px** (1.7x linear, ~3x area) |
| body in the roster | not shown in combat | **22 x 30px static chip** |
| damage share during combat | invisible | **live, every tick** |

Four panels, all fed from the same wave stats the scorecard prints and the sweep
gates on. No new numbers were invented for the screen.

1. **WAVE** — wave number, total HP left in the wave (alive plus not yet spawned)
   as a meter, the endless modifier chips, and a **boss bar** with the Warden or
   Marshal's name, HP and current cell when one is alive.
2. **STILL COMING** — the roster as silhouette chips, `alive / total` per type,
   dimming as a type is wiped out. This is where the eight silhouettes are
   finally drawn at a size you can tell apart, and it is on screen in both
   phases: "WHAT IS COMING" while you build, "STILL COMING" while you fight.
3. **WHO IS DOING THE WORK** — the damage share bars, live, updating every tick
   from `G.waveStats.dmg` through `SIM.damageShare`. The standout feature stops
   being a card you see once a wave and becomes the screen you fight in front
   of. During the build phase it holds the last wave's result.
4. **YOUR LANE** — what is standing, by trap type, with counts and average level.

The board rebuilds on the SIM's 10Hz tick, not at 60fps, and each panel only
rewrites when its content signature changes.

### Input consequence

Trap placement moved from `#field` to `#lanebox`. The board scrolls on a phone
and a flick across it must not drop a trap in the ground. Tap to swing during
combat stays on the whole field, board included, so the attack gesture did not
get smaller.

### What I checked, and what I did not

`node smoke.js` now boots the page, drives 6000 frames with a simulated thumb
and **reads the board back out mid combat**:

```
  wave title  : "WAVE 2" 123 HP LEFT
  wave hp bar : 55.4%
  roster      : 2 chips, 4 of 6
  roster svg  : 2 silhouettes at 22x30
  live share  : 2 bars, YOU 22%
  your lane   : 1 chips, 1 traps, 1 levels
  boss bar    : WARDEN  496 / 496  ·  CELL 29     (exercised on a throwaway copy
                                                   with a Warden added to wave 1)
```

The geometry table above is **arithmetic from the CSS, not a measurement**, and
the boss bar needed a deliberately broken copy to reach. **Nobody has still seen
a pixel of this.** It needs the same LOOKING pass that found the problem: 390x844
and desktop, build phase and combat, plus the worst angles on purpose (320px
wide where four panels and seven shop buttons have to fit, and an endless wave
carrying three modifier chips and a boss bar at once).

One thing the trace caught that is worth recording: `smoke.js` defaulted `DIR` to
a hardcoded shipped path, so running a copy of it in a scratch folder silently
tested the shipped file and my first boss bar test passed for the wrong reason.
It defaults to `__dirname` now.

## THE DEEPENING PASS (second builder)

The three defects the first builder found by reading his own lane frames are
fixed, each with a gate that was watched red before it was trusted green.

| # | Defect he named | Number then | Number now | What fixed it |
|---|---|---|---|---|
| 1 | 612 scrap unspendable at wave 18 | 620 worst leftover past w14 | **86** | REINFORCE, a seventh build tool |
| 2 | traps decorative early (78% player at w5) | 23.3% trap share on w1 and w2 | **38.9%** | the starter spike strip |
| 3 | ~5s of empty lane before the Warden | 3.1s worst, w10 soft lull 3.1s | **2.9s worst, w10 lull 0.5s** | the arrival schedule |

### 1. REINFORCE, the scrap sink

Twenty eight cells is a hard ceiling; scrap income `40 + 12 x wave` is quadratic
in the wave number. The two curves cross around wave 14 and after that the
currency means nothing. **DEEPEN** is a seventh shop tool (`⇑`, 64x64, same
shelf as the six traps): tap a trap already standing and pay its price again.

- Levels 1 to 3. `lvlMult(lvl) = 1 + 0.6 x (lvl - 1)`, so level 3 costs three
  trap prices and returns **2.2 traps**. That is deliberately WORSE value than a
  fresh trap in a fresh cell, because the twenty eight cells have to stay the
  scarce resource. REINFORCE is the overflow valve, never the opening.
- Every reinforce also patches: spike charges refilled, wall hits restored to
  `3 x lvlMult`, a sprung snare rearmed.
- A maxed trap that is **spent** still takes a repair at half price, so a purse
  in the late game always has somewhere to go.
- Sell back refunds `t.paid`, every coin ever sunk into that cell. Still 100%.
- Bot: `botReinforce` runs after `botBuild`, patches what is spent first, then
  deepens the shallowest. That is what makes the sweep exercise the sink.

**Honest bound:** a board of 28 cheap traps CAN be fully maxed inside a campaign
purse (28 x 3 x 30 = 2520 of 3320), and past that only repairs cost money. The
sweep's worst measured residue is 86 scrap on a ballista only build, which is
under the 90 a ballista costs, i.e. it is saving up, not stranded.

### 2. The starter spike strip

Wave one's purse is 52 scrap. That buys exactly one trap, and one trap plus one
blade is a lesson about the blade. So the lane opens with a spike strip already
in the ground at cell 21, free, "left by the watch before you". Cell 21 is not
decoration: the ACTIVE bot (and a human) intercepts the first rank around cell
17, so a trap at 21 fires **before** the intercept and both contribute. At cell
16 the bot met them first and the strip contributed 3.6%; at cell 24 the strip
killed wave one outright and the player contributed 0%.

Measured over 180 two type builds: wave 1 trap share **17.0% -> 45.5%**, and the
number of builds that survive wave 1 at all goes **124 -> 180**.

### 3. The arrival schedule

The old scheduler block scheduled **departures**: group after group, each
`GROUP_PAUSE` apart. A body scheduled last still has to cross thirty cells
before it is anybody's problem, and a Warden crosses them at a third of a
runner's pace, so any slow group at the tail bought itself a lull. Wave 10 had
five seconds of it in front of the Warden; waves 4 and 6 had eight in front of
one lone brute.

Now the authored table is read as **arrivals** and the scheduler solves
backwards for departures: `tick = arrival - spd x TRAVEL_CELLS`, normalised so
the first body leaves on tick zero. Heavy things depart first because they are
slow, and the quick ones overtake them on the way in. Counts, cadence and
composition are untouched, so the difficulty bands and the daily shuffle stay
honest. A second pass caps any remaining hole in the departure clock at
`MAX_DEPART_GAP` (30 ticks).

Two things I tried first and threw away, because measuring beat guessing:

- **Sorting groups slowest first.** It fixed wave 10 and broke waves 11 to 13:
  the fast bodies now arrived last, died at the mouth traps, and the player's
  damage share at wave 12 went to **0.0%** with a 17.2s lull. Reverted.
- **Capping the ARRIVAL gap.** It made every wave denser, killed all 20 wave
  clears, dropped the median loss wave to 7, and did not even fix the target
  (still 5.9s). Reverted. The holes were in departures, not arrivals.

One more thing the measurement turned up: a fully reinforced ballista line could
delete a body **on the tick it spawned**, which reads as an empty lane rather
than as a kill. Ballistas no longer target `SPAWN_CELL`, so everything gets at
least one step into the lane. That single change took the worst empty lane
across the whole sweep from 6.0s to 2.9s.

## What was deepened

### Endless is no longer the same curve continuing

- **Six named modifiers**, deterministic from `(seed, wave)`: THE TIDE (cadence
  closes by a third), IRONHIDE (+1 shield event on everything), CROWBARS (every
  runner saps a trap), NIGHT MARCH (everything one tick quicker), THE CHOIR
  (healers heal double), STONEBREAKERS (brutes smash walls). One from wave 21, a
  second at 29, a third at 37, capped at three. They are named on the build
  phase before you spend a coin, and they turn up in the war log line.
- **The Marshal**, a second Warden variant, joins every fifth endless wave (two
  from wave 41). 300 HP, speed 3, and it is the opposite problem to the Warden:
  quick, cannot be snared, does not smash walls, and **rallies** everything
  within three cells to double time. You kill it first or you fight the whole
  wave at a runner's pace. It gets its own ostinato, a fifth up and at double
  the rate, so you can tell which boss is in the lane without looking.
- The eight specced enemy types are untouched and still assert as eight. The
  Marshal is a boss variant in `BOSS_ORDER`, never in `ENEMY_ORDER`, and a test
  asserts it never appears inside the authored twenty.

### The scorecard is now one number, not two

`SIM.damageShare(dmg)` is the single definition of the share. The wave scorecard
calls it and so does `sim.js`, so what the player reads is by construction what
the gates enforce. `shareOf` in sim.js is now a one line forward to it.

The card also gained: a two tile YOU / YOUR LANE headline with a plain sentence
read ("The lane carried this one."), a 2% minimum bar width so a 1% trap is
visible instead of invisible, the standing lane as traps and levels, traps lost,
seconds the wave took, and the longest quiet stretch when it is over 2s.

### Other craft

- Trap levels render in the lane as accent dots with a glow on the glyph.
- A wall now draws all of its hits, up to 9 at level 3.
- Reinforce has its own sound, and the boss ostinato switches per boss type.
- The war log names the Marshal and names the endless modifiers that beat you.

## Gates

| Gate | Result |
|---|---|
| `node sim.js --test` | **PASSED 281 / FAILED 0**, 281 assertions (was 193; floor is 80) |
| exit code on a red suite | **1** (verified by the first builder, unchanged) |
| `node sim.js --sweep` | **all 10 gates green**, exit 0 (was 7 gates) |
| SIM purity grep | 0 hits for `Math.random`, `document`, `window.`, `canvas`, `performance`, `requestAnimationFrame` between the SIM markers |
| dash grep on player copy | clean (no unicode dashes in any string, blurb, toast or markup text node; an assertion enforces it for the modifier copy) |
| `node --check` on the extracted script block | clean |
| `node --check sw.js` | clean |
| element id audit | 72 ids, 0 `$()` calls or `EL.*` references without a matching id |
| `node smoke.js` | boot ok, 0 missing ids, 6000 frames no throw, 30 lane cells, **7 shop buttons**, a wave held and its scorecard read back out ("WAVE 1 HELD, you 33% traps 67%, 2 bars"), the loss sheet reached, **and the four watch board panels read back live mid combat** |
| element id audit after the relayout | 15 new ids, all booted, 0 dangling `$()` or `EL.*` |

## Gates I watched FAIL before trusting them green

Every break was made on a throwaway copy of the folder, never in the shipped file.

The first builder's five breaks still stand (ballista x10, scrap formula, line of
sight, player damage, shield). These three are the new ones.

| # | Deliberate break | What went red |
|---|---|---|
| 6 | `botReinforce` removed from `botBuild` | **stranded purse gate red**: `worst leftover 620 scrap (ballista+brazier+snare zones 341 wave 19)`. That is the first builder's 612 reproduced to within eight coins. |
| 7 | Starter spike removed | **early trap share gate red**: `mean trap damage share on waves 1 and 2 23.3%` against a 28% bar (live reads 38.9%) |
| 8 | `TRAVEL_CELLS = 0` (the old departure schedule) | **stayed GREEN at 2.9s.** Chased it: the departure hole cap was still doing the work on its own. |
| 8b | `TRAVEL_CELLS = 0` **and** `MAX_DEPART_GAP = 9999` | **dead lane gate red**: `longest empty lane 3.1s` against a 3.0s bar |

Break 8 is worth writing down for the same reason the first builder wrote down
break 1. The named break did not redden the gate, so it got chased rather than
shrugged at, and the answer was that two mechanisms fix the same defect and
either one alone is nearly enough. Break 8b proves the gate can fail, but it
fails by 0.1s, which is thin. The decisive evidence for defect 3 is not that
gate, it is the per wave read of wave 10 under a real build:

```
                       wave 10 lull    mean lull, waves 1 to 20
old departure schedule       3.1s              2.4s
live arrival schedule        0.5s              1.2s
```

Two further honest notes on the gates:

- The dead lane gate reads the **top 8 builds** by depth reached, not all 40. A
  lane that empties because all three trap types are stacked in the MOUTH and
  delete every body on arrival is a power fantasy, not a pacing bug, and gating
  on it would ban the build instead of fixing the schedule. The worst across all
  40 is reported next to it anyway (currently the same 2.9s).
- The early trap gate reads **waves 1 and 2 only**. That is where the purse is
  thinnest and where the defect actually lived. Averaged over waves 1 to 5 the
  number is 40.7% and the gate would never have bitten: the first builder's 78%
  came from one specific loadout, not from the population.

## Sweep output (`node sim.js --sweep`, 2905 loadouts, seed 1, 19s)

```
BEST RUN PER TRAP MULTISET (active bot, seed 1)
traps                       zones  reached  kills  playerShare  waveSecs
========================================================================
brazier+wall+snare            400   WON 20    291        50.1%      18.7
ballista+brazier+snare        421   WON 20    291        51.6%      20.5
ballista+brazier               04   WON 20    291        37.0%      17.4
brazier+wall                   20      w20    290        49.9%      19.7
ballista+brazier+wall         021      w20    290        49.3%      19.5
ballista                        0      w20    290        29.7%      16.4
spike+brazier+wall            420      w18    211        46.6%      17.2
ballista+wall+snare           201      w17    195        62.3%      18.8
spike+ballista+brazier        444      w16    187        44.0%      15.2
spike+wall                     20      w15    170        54.8%      17.6
spike+wall+snare              304      w15    170        61.6%      17.5
pit+wall+snare                441      w15    163        55.9%      19.7
pit+ballista                   42      w15    166        49.8%      17.1
pit+brazier+wall              430      w15    167        47.6%      17.4
ballista+wall                  21      w15    158        49.2%      18.0
pit+ballista+wall             401      w14    145        59.5%      17.9
ballista+snare                 11      w14    143        69.4%      19.0
spike+ballista+wall           400      w13    122        51.5%      15.4
pit+wall                       40      w13    120        51.2%      17.7
spike+pit+wall                400      w11     98        47.8%      14.1
brazier                         4       w9     78        24.4%      10.5
brazier+snare                  40       w9     78        30.3%      10.8
pit+brazier                    04       w9     76        53.3%      14.5
spike+brazier                  04       w9     78        51.7%      14.1
```

### PLAYER DAMAGE SHARE PER WAVE (best loadout, brazier+wall+snare, zones 400)

```
  wave    waveHP   secs     YOU   spike    pit  ballista  brazier  deepest
     1        84    6.3   64.3%   35.7%   0.0%      0.0%     0.0%      c17
     2       222    6.9   48.6%    0.0%   0.0%      0.0%    51.4%      c24
     3       380    7.8   48.2%    0.0%   0.0%      0.0%    51.8%      c25
     4       492   10.0   26.6%    0.0%   0.0%      0.0%    73.4%      c25
     5       622   11.3   44.5%    0.0%   0.0%      0.0%    55.5%      c25
     6       677   13.8   30.3%    0.0%   0.0%      0.0%    69.7%      c15
     7       909   14.6   22.3%    0.0%   0.0%      0.0%    77.7%      c12
     8      1400   14.9   20.2%    0.0%   0.0%      0.0%    79.8%      c25
     9      1536   15.2   22.0%    0.0%   0.0%      0.0%    78.0%      c10
    10      3233   26.6   56.4%    1.2%   0.0%      0.0%    42.3%      c10
    11      2419   17.7   16.6%    0.6%   0.0%      0.0%    82.8%       c8
    12      2986   15.7   37.9%    0.0%   0.0%      0.0%    62.1%      c23
    13      3406   19.9   55.1%    0.0%   0.0%      0.0%    44.9%      c10
    14      4765   18.5   45.0%    0.6%   0.0%      0.0%    54.5%      c21
    15      6083   21.0   45.0%    1.3%   0.0%      0.0%    53.8%      c17
    16      7373   22.7   51.1%    1.2%   0.0%      0.0%    47.7%      c17
    17      9031   20.7   42.0%    1.4%   0.0%      0.0%    56.6%      c19
    18     11408   21.2   50.2%    0.0%   0.0%      0.0%    49.8%      c10
    19     16209   36.2   47.7%    0.0%   0.0%      0.0%    52.3%       c8
    20     35337   53.2   60.8%    0.0%   0.0%      0.0%    39.2%       c1
```

Mean player damage share on cleared waves across the whole sweep is **41.1%**
(was 46.3%). Wave 1 is no longer 100% player: the starter strip takes 35.7% of
it. The waves where the player dips to 16 to 22% are the waves a fat brazier
field is doing its job, and the run mean stays comfortably over the 20% line.

### Gate results

```
PASS  no loadout clears 20 waves with the IDLE bot
      idle wins: 0, deepest idle run: wave 6 (spike zones 0)
PASS  no loadout clears 20 waves with IDLE even holding the whole campaign purse
      rich idle wins: 0, deepest wave 20 (ballista+brazier zones 00)
PASS  at least 4 distinct trap multisets reach wave 15 with ACTIVE
      15 multisets
PASS  the best loadout plus ACTIVE clears wave 20
      39 clearing loadouts, best brazier+wall+snare reached wave 21
PASS  wave 20 clears with roughly 15 percent total hp margin
      margin 17.5% on ballista+brazier+snare zones 212. Band enforced is 8% to 30%.
PASS  median loss wave for a random loadout ACTIVE bot lands in 8 to 14
      median 9 over 300 random loadouts, quartiles 6 / 9
PASS  the defender is not decorative: player share at least 20 percent
      mean player damage share on cleared waves 41.1%
PASS  no purse strands: under a trap price left over past wave 14        [NEW]
      worst leftover 86 scrap (ballista zones 0 wave 17)
PASS  no dead lane: under 3 seconds of empty lane on the top 8 builds    [NEW]
      longest empty lane 2.9s; worst across 40 builds 2.9s
PASS  the build phase earns its 20 seconds: traps do 28 percent on waves 1 and 2  [NEW]
      38.9% across 5804 waves; waves 1 to 5 40.7%
```

**Time model.** 100ms per tick, 20s build phase. Mean combat is now 19s per wave
(was 22s: the arrival solve overlaps the groups instead of queueing them), so a
median run ending on wave 9 is about 5 minutes and a full 20 wave clear is about
11 minutes. Still inside the handoff's window.

## What I actually SAW in the ASCII lane frames (deepening pass)

`node sim.js --watch=1 --wave=N --every=N`, same command the first builder used,
same default loadout (ballista GATE, brazier INNER, spike MID) so the frames are
comparable to his.

**Wave 10, the one that had the dead patch.**

```
--- wave 10  scrap left 10  wave hp 3233  your blade 89
   30 |.▲➤➤➤▲▲➤✹✹✹✹▲▲▲▲▲▲▲▲➤▲..@....r|  bodies  1  hp      94
   60 |.▲➤➤➤▲▲➤✹✹✹✹▲▲▲▲▲▲▲▲➤▲..@.....|  bodies  0  hp       0
   90 |.▲➤➤➤▲▲➤✹✹✹✹▲▲▲▲▲▲▲▲➤▲...S@...|  bodies  1  hp      46
  120 |.▲➤➤➤▲▲➤✹✹✹✹▲▲▲▲▲▲▲▲➤▲....h@..|  bodies  2  hp    2166
  150 |.▲➤➤➤▲▲➤✹✹✹✹▲▲▲▲▲▲▲▲➤W@.......|  bodies  1  hp    1773
  180 |.▲➤➤➤▲▲➤✹✹✹✹▲▲▲▲W@▲▲➤▲........|  bodies  1  hp    1162
  210 |.▲➤➤➤▲▲➤✹✹✹W@▲▲▲▲▲▲▲➤▲........|  bodies  1  hp     384
    cleared in 22.8s  deepest cell 8  damage: spike 11.4% ballista 39.6% brazier 6.3% player 42.7%
```

The Warden is now IN the lane at tick 120 arriving with the healer, not spawning
at 100 and then walking an empty field. One empty frame at tick 60 and that is
the whole lull. Compare the first builder's read: "frames at tick 100 and 125
show zero bodies and zero HP". The `@` walks the Warden back down the lane from
cell 21 to cell 11 while the brazier field eats it, which is the shape the wave
was designed for.

**Wave 5** — `spike 30.7% / player 69.3%`, cleared in 16.2s. Was `21.9% / 78.1%`
in 18.8s. Better, and this is the LEAST favourable build for the early trap
question because its spikes sit in MID where the bot intercepts first. Across
180 two type builds the wave 1 and 2 trap share is 38.9%.

**Wave 18** — this default loadout no longer reaches it. It now falls on wave 16
to a flyer. The arrival schedule overlaps groups instead of queueing them, so
every wave is denser than it was and this particular three zone spread cannot
hold. 39 loadouts still clear all twenty and the median random loadout still
falls on wave 9, so the difficulty moved rather than rose. Worth saying plainly
rather than hiding: a build that used to reach 18 now reaches 16.

Three things I can name from these frames before anyone else does:

1. **The starter spike is a free gift, not a decision.** It fixes the wave 1
   reading and it teaches placement by example, but the honest version of the
   early game fix is cheaper starter traps so the player still chooses. Trap
   costs are TUNE, not spec locked; that pass was not taken because it moves
   every gate at once and this pass already moved four numbers.
2. **Wave 21 is an anticlimax.** The endless table cycles back to wave 1's
   composition, so the wave after the two Warden finale is four runners at
   2328 HP. The modifier banner carries it, but the composition does not.
3. **The soft lull metric still reads 14.4s somewhere in the sweep.** That is a
   build that stacks everything at the MOUTH, kills at range and leaves the
   player jogging. Not gated, deliberately, but it is a real player experience
   and a smarter bot (or a real thumb) would stand further out.

## TUNE values resolved

Everything the plan marked TUNE, with the value the sweep settled on.

| Thing | Plan starting point | Resolved | Why |
|---|---|---|---|
| Spike Strip | 30 scrap, 4 dmg/tick, 40 procs | 30 scrap, **7 dmg/tick, 60 charges** (420 lifetime damage) | at 4/40 the IDLE bot could not clear wave 1 with any build |
| Pit | 45, 10 entry damage, x0.4 speed | 45, **26 entry damage**, x0.4 speed | 10 was noise against the 1.18 curve by wave 4 |
| Ballista | 90, 9 dmg / 14 ticks | 90, **22 dmg** / 14 ticks | 9 made ballista worthless; 22 makes it the backbone of every clearing build |
| Brazier | 60, 2 dmg/tick/stack, 30 ticks, 3 stacks | 60, **5 dmg/tick/stack**, 30 ticks, 3 stacks | brazier is the only trap whose output scales with crowd size, so it carries late waves |
| Wall | 50, 3 hits | unchanged, **8 ticks per landed hit** | a wall buys 24 ticks against one body, 8 against a crowd |
| Snare | 40, 25 tick hold | unchanged | |
| Player damage | 12 | **20 base**, growing x1.18 per wave | at 12 the mean player share was 21% with per wave dips to 7.6%, and the random loadout median loss wave was 6 |
| Player move | 1 cell per 2 ticks | unchanged | deliberately the same speed as a Runner, so a body that gets past you cannot be caught without a pit, snare or wall |
| Player attack cooldown | 8 ticks | unchanged | |
| Player reach | 1 cell | unchanged | single target, nearest to the gate first |
| Healer output | 3 HP/tick | 3 base, growing x1.18 per wave | a flat heal is irrelevant by wave 8 |
| Spawn cadence | 10 to 20 ticks | authored per group inside that band, plus a 12 tick pause between groups | |
| Wave 20 composition | not specified | 5 shielded, 5 flyer, 3 swarm, 6 brute, 2 healer, 1 Warden = 1290 base HP = 35337 at the curve | tuned twice, purely to land the margin gate in band |
| Enemy base HP | Runner 18, Brute 70, Shielded 30, Flyer 24, Sapper 26, Healer 30, Swarm 5x8, Warden 420 | **unchanged** | the curve did the work; only the wave 20 headcount moved |

### TUNE values the deepening pass resolved

| Thing | Before | Now | Why |
|---|---|---|---|
| Group pause | 12 ticks | **18 ticks** | the arrival solve overlaps groups, so waves got 30% shorter and therefore harder; this bought the time back without reintroducing lulls |
| Travel allowance | not modelled | **`TRAVEL_CELLS` 14** | the cells a body crosses before it is your problem. Departure = arrival minus `spd x 14` |
| Departure hole cap | none | **`MAX_DEPART_GAP` 30 ticks** | closes the straggler hole (wave 9 ended on one healer 62 ticks behind the rank) |
| Engagement radius | not modelled | **`ENGAGE_CELLS` 8** | how far away the lane starts reading as empty from where you stand |
| Reinforce curve | none | **`1 + 0.6 x (lvl - 1)`** | at a flat `x lvl` a maxed ballista line deleted bodies on the spawn tick and the player's share at wave 12 hit 0% |
| Reinforce ceiling / repair | none | **3 levels, then half price repairs** | the sink has to be unbounded or a big purse still strands |
| Starter trap | none | **free spike at cell 21** | 52 scrap buys one trap and one trap is not a lesson about traps |
| Ballista range | whole lane | **stops one short of `SPAWN_CELL`** | nothing dies standing in the mouth |
| Wave 20 headcount | 1 Warden | tried 2, **kept 1** | with 2 the margin sat at 0% and nothing cleared; with 1 it lands at 17.5% |
| Endless | table cycles, curve climbs | **+ 6 modifiers, + the Marshal every 5th** | the curve alone is not escalation |

**Locked spec numbers that did not move:** 30 cells, 20 waves, 20 second build
phase, `baseHP x 1.18^wave` (asserted exactly for all 8 enemy types across waves
1 to 20), scrap `40 + 12 x wave` (asserted for waves 1 to 40, cumulative 3320
through wave 20), 6 traps, 8 enemies, one trap per cell, full price sell back.

## Deviations and rulings recorded

1. **Player damage scales with the wave** (`20 x 1.18^(wave-1)`, surfaced in the
   HUD as BLADE). Not in the handoff. Without it the player is arithmetically
   decorative by wave 10: enemy HP grows 27x across the campaign while a fixed
   blade does not, so the two mode design would be fake by construction. This is
   the single largest deviation and it is the one that makes the game work.
2. **Trap damage does NOT scale.** Cumulative scrap is quadratic in the wave
   number while the lane caps at 28 cells, so trap power rises until roughly wave
   12 and then plateaus. That plateau is the difficulty curve.
3. **Positions are integer cells with move timers**, not fixed point cell x 10.
   Same expressiveness, exactly deterministic, and the view interpolates with a
   110ms linear transform transition. JSON round trip of a state resumes bit
   identically (asserted).
4. **The sweep's build policy gives each trap type an equal share of the purse
   first**, then spends leftovers in priority order. The first version cycled a
   priority list, which meant the first type in the list ate every coin and
   `ballista+brazier` was secretly `ballista only`. That was a sweep measuring
   nothing, and it is fixed.
5. **ACTIVE bot retreat rule**: the plan says it retreats behind its rearmost
   wall. A wall blocks the player too, so getting behind your own wall is
   impossible; the bot falls back toward the gate instead when 3 or more bodies
   are within 2 cells, and swings if one is in reach.
6. **Enemies never attack the player and never block on the player.** The player
   is a damage dealer, not a barricade (the plan's ruling, kept).
7. **No Sunbeam earn wiring** in v1, per the handoff11 README default.
8. The sweep default is `--types=3`. `--types=2` is a strict subset and is not
   the canonical run; some gates read differently on it.

### Deepening pass rulings

9. **The table authors ARRIVALS, not departures.** The plan says spawn cadence
   10 to 20 ticks apart; that band is now enforced on arrivals, which is where
   the table writes it. Departures fall out of the solve and legitimately bunch
   up when a slow group and a fast group are due at the same moment.
   `verifySchedule` checks the band on arrivals and only checks that departures
   are ordered and start at zero.
10. **REINFORCE is deliberately bad value.** Level 3 costs three trap prices and
    returns 2.2 traps. If it paid par it would be the optimal opening and the
    build phase would stop being about the board.
11. **The Marshal is a boss variant, not a ninth enemy.** `ENEMY_ORDER` still
    holds exactly the eight the spec names and still asserts as eight. The
    Marshal lives in `BOSS_ORDER` and only in endless.
12. **Nothing dies on the spawn cell.** Ballistas stop one cell short of
    `SPAWN_CELL`. Without it a reinforced ballista line deletes bodies the tick
    they appear, which reads as an empty lane rather than as a kill.
13. **Dead air has two readings and only one is gated.** Hard (nothing alive
    while the wave still has bodies to send) is gated at 3s on the top 8 builds.
    Soft (bodies exist but none in reach, which includes the run out to meet
    them) is reported only, because gating it would ban mouth stacked builds
    instead of fixing a schedule.

## Craft shipped

- **G minor, martial.** Every pitched sound is quantised to a G minor scale table.
  Wave start horn is a two note fifth (G2 to D3) on detuned saws through a
  bandpass. One impact voice per trap so you can hear your build working without
  looking: spike is a dry high click, pit a deep sine thud, ballista a whip crack
  plus a square tick, brazier a filtered crackle, wall a low stone knock, snare a
  taut triangle pluck, your own blade a mid burst plus a square tick.
- **Breach alarm as geography.** Crossing cells 8, 5 and 3 each fire one alarm
  event a semitone higher and warm the gate glow. TEST asserts all three fire, in
  that order, exactly once per wave.
- **Wave scorecard** after every wave: damage share YOU versus EACH TRAP as
  labelled bars, plus the seconds your control traps bought, scrap in hand,
  deepest cell reached, bodies down. This is the sweep's own metric handed to the
  player.
- **Spawn pips** during the build phase: the exact next wave composition as
  enemy silhouettes with counts on the right edge of the lane.
- **Ballista sight line preview** that visibly stops one cell short of a wall,
  drawn live while a ballista is selected and you drag along the lane.
- **Warden ostinato**: a five note low sawtooth loop that starts on its spawn and
  stops on its death, the only music during combat.
- **LAST BUILD** one tap re-apply of the previous wave's standing loadout.
- **Silhouette first enemies**, eight distinct shapes readable at 20px, with the
  player as the only warm accent fill on the field. Shape carries the meaning and
  colour only doubles it (the healer also gets a green cross glyph).
- **War log** of the last ten runs as terse dispatches generated from run events
  ("Fell on wave 14. A sapper ate the ballista at cell 9.").
- **REINFORCE / DEEPEN**, the seventh build tool: tap a standing trap to build
  it a level deeper and patch it to full. Levels render in the lane as accent
  dots with a glow on the glyph, and reinforcing has its own square tick sound.
- **Endless modifiers** named on the build phase as chips under the lane, with
  the first one's blurb in the hint line so you read WHY before you spend.
- **The Marshal**, the second boss, with its own faster ostinato a fifth up.
- **Wave scorecard, deepened**: a YOU / YOUR LANE two tile split with a plain
  sentence read, a 2% floor on bar width so small contributors stay visible, the
  standing lane in traps and levels, traps lost, wave length, and the longest
  quiet stretch when it is worth mentioning. All of it from `SIM.damageShare`,
  the same function the sweep gates on.
- Endless mode, `?seed=` links, daily mode (the daily seed shuffles group order
  inside a wave, never the composition, so difficulty bands are untouched),
  options panel (volume, sound, haptics, reduced motion, auto skip build phase),
  share string with the seed and no dashes, install ready manifest, pause on
  `visibilitychange`, screen shake capped and killed by `prefers-reduced-motion`.

## Touch targets (rendered px at 375x667, portrait)

All controls sit in the bottom third, thumb reachable.

| Control | Size |
|---|---|
| Move left / Move right | flex, **64px** tall, roughly 100px wide each at 375 |
| Attack | flex 1.5, **64px** tall, roughly 150px wide |
| Trap shop buttons (6) plus DEEPEN | **64 x 64** each, horizontally scrollable. DEEPEN is the seventh and inherits `.shopbtn`, so it is 64x64 too. NOT LOOKED AT: whether seven of them still scroll cleanly at 320px. |
| LAST BUILD / SEND THEM IN | **48px** tall, flex width |
| Build timer with skip | **48 x 48** |
| Options and exit in the top bar | **48 x 48** each |
| Sheet primary buttons | **52px** tall, full width |
| Sheet secondary buttons | **48px** tall |
| Options toggles | **72 x 48** |

Nothing renders under 48px in either dimension. The options toggle started at
34px tall and was fixed.

## Known gaps

1. **No browser has opened this page.** The one LOOKING pass that did happen
   found the composition problem above, which is the strongest possible argument
   that node gates do not see layout. The rebuilt combat screen has NOT been
   looked at. Verified in node only, by instruction.
   `node smoke.js` boots the real page against a minimal DOM shim, drives 6000
   frames with a simulated thumb, renders 30 lane cells and 7 shop buttons, and
   reads a real wave scorecard back out ("you 33% traps 67%"). That rules out a
   blank page and dead wiring. **It is NOT a look. Nobody has seen a pixel.**
   The VIEW layer still needs the LOOKING pass at 390x844 AND at desktop width;
   two of the August 16 production defects only appeared at desktop width.
   Specifically unlooked at: the whole watch board, the DEEPEN button as the
   seventh item on a scrolling shelf (does it fall off the edge at 375?), the
   trap level dots, the two tile scorecard split, whether 34px bodies overlapping
   across 13px cells reads as a crowd or as mush, and whether the board's
   `auto-fit minmax(260px,1fr)` grid lands as one column on a phone and four
   across on desktop the way the arithmetic says it should.
2. **Zone bucketed placement in the sweep versus free placement in play.** A human
   can find cell exact placements the sweep never tested, so the real ceiling is
   above the measured one. Accepted for v1, flagged by the plan.
3. **The dead lane gate fails by only 0.1s under its break** (3.1s against a 3.0s
   bar). It is capable of failing and it was watched failing, but it is thin. The
   per wave wave 10 read (3.1s -> 0.5s) is the stronger evidence and it is not
   automated. A better gate would be the MEAN lull across the top builds.
4. **The starter spike is a gift, not a choice** (see the lane frames section).
   The principled version is cheaper starter traps.
5. **Wave 21 is an anticlimax** after the wave 20 finale, because the endless
   table cycles back to wave 1's composition.
6. **No input log replay.** CRAFT lists it; `step` is deterministic and a JSON
   round trip is asserted, so it is nearly free, but it is still not wired.
7. **No install nudge after the first completed run**; `beforeinstallprompt` is
   still not captured.
8. **A fully maxed cheap board can still hold a residue.** 28 spikes at level 3
   costs 2520 of the campaign's 3320 and after that only repairs take money. The
   sweep's worst real case is 86 scrap, but the theoretical hole exists and an
   assertion documents it rather than pretending it does not.
9. **The soft lull (nothing in reach) still reads 14.4s** on mouth stacked
   builds. Not gated, deliberately. See the lane frames section.

## The single next thing

Look at the rebuilt combat screen. The composition fix was made from arithmetic
and a DOM shim, and the problem it is fixing was found by a human eye in about a
minute. Shoot: the build phase with DEEPEN selected, wave 10 with the boss bar
live, a wave 15 lane full of level 3 traps, and an endless wave with three
modifier chips. Then the worst angles: 320px wide, and desktop where the board
grid goes multi column and the lane strip is 190px of a very tall field.

After that, the two design calls worth taking are cheaper starter traps (so the
early game fix is a player decision instead of a gift) and a wave 21 that is not
the wave 1 composition.
