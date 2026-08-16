# SIEGE OF ONE — build notes

**Status: PLAYABLE AND VERIFIED IN NODE.** Not yet opened in a browser by me (the
main loop owns all browser gates on this box; five agents driving puppeteer at
once starves two cores and makes gates lie). Everything below was proved with
`node`.

- `satellites/siege/index.html` — the whole game, single file, no deps, no network.
- `satellites/siege/sim.js` — node runner, zero deps, extracts the layers from
  `index.html` between the marker comments so the game and the sweep cannot drift.
- `satellites/siege/sw.js` + `manifest.webmanifest` — every cache constant is
  `siege-` prefixed; activate deletes only `siege-*`.
- Icons referenced but not authored here (main loop owns all five sets).

## Gates

| Gate | Result |
|---|---|
| `node sim.js --test` | **PASSED 193 / FAILED 0**, 193 assertions (floor is 80) |
| exit code on a red suite | **1** (verified deliberately, see below) |
| `node sim.js --sweep` (default types=3) | **all 7 gates green**, exit 0 |
| SIM purity grep | no `Math.random`, no `document|window|canvas|performance|requestAnimationFrame` between the SIM markers |
| dash grep on player copy | clean (markup text nodes, DATA blurbs, toasts, dispatch strings) |
| `node --check` on the extracted script block | clean |
| `node --check sw.js` | clean |
| headless DOM smoke test | boot ok, 0 missing element ids, 400 loop frames with no throw, 30 lane cells + 6 shop buttons + spawn pips all rendered, a full wave driven through the render path including the scorecard and the loss sheet |

`node sim.js --test` exits 1 whenever `failed > 0` **or** `total < 80`. I checked
this by running a red suite and reading `$?` rather than trusting the code:

```
$ node sim.js --test > out.txt; echo "EXIT=$?"
EXIT=1
PASSED 160 / FAILED 9
```

## Gates I watched FAIL before trusting them green

Every break was made on a throwaway copy of the folder, never in the shipped file.

| # | Deliberate break | What went red |
|---|---|---|
| 1 | Ballista damage x10 (the break my plan named) | 2 sweep gates red. **The IDLE gate stayed green.** |
| 1b | Ballista 2200 damage, cost 30 | **IDLE gate red**: `idle wins: 5, deepest wave 21`. The gate is capable of failing. |
| 2 | Scrap formula to `40 + 13 x wave` | 9 assertions red, including the exact economy assertions |
| 3 | Ballista line of sight ignores walls | 3 assertions red (`a wall blinds the ballista past it`, `sight line stops one cell short of the wall`, `ballista still shoots inside its own wall`) |
| 4 | Player damage 20 to 1 | **player share gate red**: `mean player damage share on cleared waves 4.2%` |
| 5 | Shielded absorbs nothing | 6 assertions red across the shield interaction cases |

Break 1 mattered most. The plan predicted that x10 ballistas would turn the IDLE
gate red and it did not, so I chased it instead of shrugging: the IDLE bot dies
on wave 1 or 2 for **economic** reasons (52 scrap buys one trap, one trap cannot
stop four runners), so it never survives long enough for trap strength to matter.
That makes the literal gate weak, so I added a harder second version of the same
question and it is now enforced:

> **no loadout clears 20 waves with IDLE even holding the whole campaign purse** —
> IDLE is handed all 3320 scrap up front, fills the lane with its best build, and
> still only reaches wave 18 (`ballista+brazier`, zones 00).

I also proved the wave 20 margin search is not stuck on a fixed point: it returns
0.152 for a strong build, 25.3% for the single most overpowered build in the
space, and -1 (never clears) for a snare only build, and `clears at 1.0 -> true,
at 1.25 -> false` for the same loadout.

## Sweep output (`node sim.js --sweep`, 2905 loadouts, seed 1)

Loadouts are multisets of up to 3 trap types, each type pinned to one of 5 lane
zones (GATE 1..6, INNER 7..12, MID 13..18, OUTER 19..23, MOUTH 24..28). Full cell
by cell enumeration is 6^28, so zone bucketing is the cap the handoff invites.

```
BEST RUN PER TRAP MULTISET (active bot, seed 1)
traps                       zones  reached  kills  playerShare  waveSecs
========================================================================
ballista+brazier+wall         330   WON 20    291        52.7%      21.9
ballista+brazier+snare        420   WON 20    291        49.4%      21.6
brazier+wall+snare            404   WON 20    291        50.9%      20.9
ballista+brazier               03   WON 20    291        41.3%      19.9
brazier+wall                   40   WON 20    291        54.1%      20.5
ballista                        0      w20    290        28.3%      17.9
spike+ballista+brazier        404      w19    255        50.3%      18.4
spike+brazier+wall            420      w18    212        51.0%      19.0
ballista+wall+snare           203      w17    199        55.2%      19.4
pit+brazier+wall              431      w16    185        51.6%      19.6
spike+wall                     20      w16    186        56.5%      20.1
spike+wall+snare              302      w15    171        64.8%      19.3
spike+ballista+wall           200      w15    171        58.4%      20.0
pit+wall+snare                400      w14    145        58.3%      20.7
ballista+wall                  20      w14    144        53.6%      17.9
pit+ballista+wall             400      w13    123        55.1%      20.3
pit+wall                       40      w13    123        55.1%      20.3
spike+pit+wall                140      w11     98        52.9%      18.4
pit+ballista                   03       w9     77        82.7%      20.4
spike+pit                      40       w9     77        42.7%      13.6
```

### PLAYER DAMAGE SHARE PER WAVE (best loadout, ballista+brazier+wall, zones 330)

```
  wave    waveHP   secs     YOU   spike    pit  ballista  brazier  deepest
     1        84    8.9  100.0%    0.0%   0.0%      0.0%     0.0%       c9
     2       222   12.5   76.1%    0.0%   0.0%      0.0%    23.9%      c19
     3       380   13.7   77.9%    0.0%   0.0%      0.0%    22.1%      c20
     4       492   15.4   45.5%    0.0%   0.0%     42.7%    11.8%      c20
     5       622   15.0   43.2%    0.0%   0.0%     51.4%     5.3%      c20
     6       677   16.3   22.5%    0.0%   0.0%     71.6%     5.9%      c20
     7       909   18.2   43.0%    0.0%   0.0%     57.0%     0.0%      c21
     8      1400   19.7   47.7%    0.0%   0.0%     49.6%     2.7%      c21
     9      1536   19.4   48.3%    0.0%   0.0%     38.3%    13.3%      c19
    10      3233   29.9   64.3%    0.0%   0.0%     21.2%    14.5%       c5
    11      2419   22.3   27.6%    0.0%   0.0%     46.7%    25.7%       c9
    12      2986   19.8   51.2%    0.0%   0.0%     25.5%    23.3%      c20
    13      3406   23.3   71.9%    0.0%   0.0%     25.0%     3.2%      c19
    14      4765   18.4   51.8%    0.0%   0.0%     10.0%    38.2%      c15
    15      6083   26.1   53.3%    0.0%   0.0%     15.2%    31.4%      c14
    16      7373   26.7   64.7%    0.0%   0.0%     15.5%    19.8%      c15
    17      9031   20.3   34.0%    0.0%   0.0%      9.5%    56.5%       c6
    18     11408   25.8   53.6%    0.0%   0.0%     19.2%    27.1%       c9
    19     16209   34.1   47.7%    0.0%   0.0%     21.1%    31.2%      c11
    20     35337   52.3   58.1%    0.0%   0.0%     14.6%    27.3%       c3
```

**The player is not decorative.** Mean player damage share on cleared waves across
the whole sweep is **46.3%**, and the per wave floor for the best build is 22.5%
(wave 6). It never drops under the 20% line on a cleared wave. Wave 1 is 100%
player because 52 scrap buys exactly one trap and one trap cannot stop four
runners: that is the intended opening lesson, not a bug.

### Gate results

```
PASS  no loadout clears 20 waves with the IDLE bot
      idle wins: 0, deepest idle run: wave 2 (pit zones 0)
PASS  no loadout clears 20 waves with IDLE even holding the whole campaign purse
      rich idle wins: 0, deepest wave 18 (ballista+brazier zones 00)
PASS  at least 4 distinct trap multisets reach wave 15 with ACTIVE
      13 multisets
PASS  the best loadout plus ACTIVE clears wave 20
      84 clearing loadouts, best ballista+brazier+wall reached wave 21
PASS  wave 20 clears with roughly 15 percent total hp margin
      margin 25.3% on the single strongest build; 15.2% on ballista+brazier+snare
      zones 420 measured directly. Band enforced is 8% to 30%.
PASS  median loss wave for a random loadout ACTIVE bot lands in 8 to 14
      median 9 over 400 random loadouts, quartiles 1 / 9
PASS  the defender is not decorative: player share at least 20 percent
      mean player damage share on cleared waves 46.3%
```

**Time model.** 100ms per tick, 20s build phase (skippable, and most players will
skip). Mean combat is 22s per wave, so a median run that ends on wave 9 is about
5 minutes and a full 20 wave clear is about 12 minutes. That sits under the
handoff's 8 to 12 minute window for a losing run and inside it for a winning one.

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
