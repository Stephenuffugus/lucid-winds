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
| `node smoke.js` | boot ok, 0 missing ids, 6000 frames no throw, 30 lane cells, **7 shop buttons**, a wave held and its scorecard read back out ("WAVE 1 HELD, you 33% traps 67%, 2 bars"), the loss sheet reached |

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

## What I actually SAW in the ASCII lane frames

`node sim.js --watch=1 --wave=N --every=25`. I read waves 5, 10 and 18. The bot
is not standing still and winning: it walks, it meets bodies out near the mouth,
and it walks back.

**Wave 5** — the lane holds only 4 braziers (cells 8 to 11) and 4 spikes (14 to
17). The `@` moves cell 19 to 21 to 24 to 17 to 19 to 21 to 20 across the frames:
it is chasing the front rank out toward the mouth and retreating. Cleared in
18.8s, deepest cell 15, **spike 21.9% / player 78.1%**. Honest read: at wave 5
the traps are close to decorative because the purse has only bought eight of them.

**Wave 10** — the lane is now full from cell 1 to 21. The Warden appears at tick
150 at 2088 HP and walks steadily left; the player intercepts at tick 175 and
whittles it from 2088 to 515 by tick 225, and it dies before 250. Deepest cell
11. Player 44.5% / ballista 43% / spike 11.7%. This is the wave the design is
about, and it reads correctly in text.

**Wave 18** — 612 scrap left unspent, because the 28 buildable cells are all
full of permanent traps and there is nothing to buy. Bodies stack up four at a
time near the mouth. Player 58.5% / ballista 27.8% / brazier 11% / spike 2.6%.

Three defects I can name from reading those frames, before anyone else does:

1. **Scrap piles up uselessly once the lane saturates** (612 unspent at wave 18).
   After roughly wave 14 the only sink is rebuying consumables into cells that
   traps have vacated. The economy has no late game sink.
2. **Traps read as decorative in the early game.** At wave 5 the player does 78%
   of the damage. The scrap curve, not trap strength, causes it: `40 + 12 x wave`
   is locked by the spec, so the fix would be cheaper early traps, not more damage.
3. **Wave 10 has a five second dead patch** (frames at tick 100 and 125 show zero
   bodies and zero HP) while the schedule waits to spawn the Warden. It reads as
   a lull before a boss, which is defensible, but it is empty lane time.

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
| Trap shop buttons (6) | **64 x 64** each, horizontally scrollable |
| LAST BUILD / SEND THEM IN | **48px** tall, flex width |
| Build timer with skip | **48 x 48** |
| Options and exit in the top bar | **48 x 48** each |
| Sheet primary buttons | **52px** tall, full width |
| Sheet secondary buttons | **48px** tall |
| Options toggles | **72 x 48** |

Nothing renders under 48px in either dimension. The options toggle started at
34px tall and was fixed.

## Known gaps

1. **No browser has opened this page.** I verified in node only, by instruction.
   I did smoke test the boot and render paths against a minimal DOM shim in node
   (`boot ok`, no missing ids, 400 frames with no throw, a wave driven through
   render plus the scorecard and loss sheet), which rules out a blank page and
   missing wiring, but it is NOT a look. Nobody has seen a pixel. The VIEW layer
   still needs the LOOKING pass at 390x844 and at desktop width before it ships.
   Two of the August 16 production defects only appeared at desktop width.
2. **Zone bucketed placement in the sweep versus free placement in play.** A human
   can find cell exact placements the sweep never tested, so the real ceiling is
   above the measured one. Accepted for v1, flagged by the plan.
3. **Late game scrap has no sink** once 28 cells are full (612 unspent at wave 18).
4. **Early game traps read as decorative** (78% player share at wave 5).
5. **No input log replay.** CRAFT lists it; the deterministic `step` makes it
   nearly free, but it is not wired.
6. **No install nudge after the first completed run**; `beforeinstallprompt` is
   not captured.
7. The margin gate band is 8% to 30% and the strongest build sits at 25.3%, above
   the 15% target. A directly measured strong build is 15.2%. Tightening wave 20
   twice moved the ratio very little, which suggests the top builds have surplus
   throughput rather than a knife edge; worth another pass.

## The single next thing

Open it in a browser at 390x844 and at desktop width, play three waves, and read
the screenshots. The sim is proven; the skin is not. After that, the scrap sink
for waves 14 to 20 is the most valuable design fix.
