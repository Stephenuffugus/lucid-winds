# TOMATO MAN, THE PRESSURE: his Pixel notes of 8 Nov 2026 built (Fable's plan for the Opus overnight run)

Stephen, 8 Nov, after the Eclipse levels: the countdown sign told him to dash at the perfect time, nothing but a thrown seed ever saved
him ("a little glitched"), and yet the constant pressure, the dying, the several ways not to die were the first thing that felt like a
real game. His asks, in order: that pressure on nearly every level and early; resources to collect to stay alive; the first level (or
two) a tutorial that says what kills you and what you use, which you unlock; all levels harder; worlds opened progressively, not all at
once; and the per level unlockables, which he could not find at all.

## WHAT THE CODE SAYS (read by the lead, 8 Nov; line numbers in /workspaces/Tomato_Man/index.html at sunstruck c0d7117)
- The "sign" is the Angry Sun LUNGE (`sun.lunge {period, warn, dur, reach}` on the four Eclipse levels 789 to 792; update 1476-1485;
  cue `cueNow` 1132 "lunge coming, toss a seed"; coach TUT `lunge` 2306 "Move off the flashing ring, or throw a seed into it"). During
  the warning (1.1 to 1.4 s) the ring's centre is set to his position EVERY FRAME; during the strike (2.2 to 2.6 s) it chases him by
  `lerp(..., 0.04)` per frame (not scaled by dt: twice as hard at 120 Hz); anywhere inside `reach` (160 to 180 px) burns 420/s against a
  100 threshold, so about a quarter of a second. The dash (`doDash` 1193, BASE_FEEL 658) is 600 px/s for 0.16 s, about 96 px, 1.2 s
  cooldown, no invulnerability, and dashing in sun burns faster (burnDashSun 270 vs burnSun 150, line 662). 96 px never clears a 160 px
  ring centred on him. Only a seed in the ring (`burstLunge` 1210, 2 s of calm), SPF (`spf` 1387, 2.6 s) or an eclipse dark window
  (1410) saves him, and Umbra's Edge, the first Eclipse level, has `spf:0`. The sign lies: the glitch he felt is real.
- The early levels are easy because Morning Tide (773-776, 795) has awnings and stars only: no hot sand, no popsicles, no lunge, no
  dark, no critters (`makeCritters` 1234: none in world 0; one scorpion from world 1's second level; W2 one or two; W3 two; W4 three; a
  mirage from W3 level 2; and a bug: it uses the global level index `li%4`, not the level's place in its world, so the add on levels get
  odd counts). The lunge exists only on 789-792; Planet Tomató only on W3/W4.
- Resources: aloe (`beams`, 1504-1511) is currency, worth 4 each, and does nothing for survival; popsicles (`pops`, 1512) give a dash
  charge, on nine levels only; SHADE, SPF and ICE are per level STARTING charges (`shade/spf/ice` fields, `startCharges` 674), never
  pickups; seeds refill at a checkpoint (1524) and on respawn (1552); seed pods (+3) exist only in The Run (1419). Nothing restores
  Exposure but standing in shade (-200/s; open sun +150/s kills from empty in 0.67 s; hot sand +260/s).
- The unlockables EXIST: three finds per level (`COLLECT` 801-807 by world: seashells, ice cream, gems; `FINDS` 809 with three fixed
  coordinates for all 26 levels; `collectFind` 1158: +12 aloe, +40 for all three; all three in every level of a world unlocks its hat,
  `WORLD_REWARD` 812). He found none because: The Run has NO finds (`finds: endless?[]`, 1054) and RUN is the title's main button (307);
  in the levels they sit far off the shade route by the world's edge (Dawn Ribbon's at x 1620-1788, its awnings at x 780-1260: open sun
  that kills in 0.67 s, and world 0 has no SPF); and the level lab (`?lab=1`, 2395-2510) cannot place or show them.
- Gating: `worldUnlocked` 2144 opens a world when ANY ONE level of the world before has stars; `unlockedLevel` 2145 opens a level when
  the one before has stars. Save `tomatoman_save_v1` (DEF_SAVE 449-464): beams, stars, best, finds, runBest, runWorlds, upgrades,
  cosmetics, consumables, loadout, settings, tut. Coach: TUT 2285-2308 (21 one time marks), How to Play 2240-2256; Dawn Ribbon has no
  scripted lesson (2372).

## THE LANE
The game is Stephenuffugus/Tomato_Man, branch sunstruck, vendored into lucid-winds by the deploy (TOMATO_MAN_BUILD_PLAN.md THE LANE).
For this run work in a clone INSIDE lucid-winds so no command leaves the working directory (a commit in /workspaces/Tomato_Man asked
Stephen for permission on 6 Nov and stalled the night): `git clone -q https://github.com/Stephenuffugus/Tomato_Man.git
/workspaces/lucid-winds/work/Tomato_Man` (/work/ is gitignored), `cd` nowhere (absolute paths), `git -C /workspaces/lucid-winds/work/Tomato_Man
checkout -b sunstruck origin/sunstruck`. If origin/sunstruck is not c0d71173 (THE WALK) or later, STOP this plan and say so in
START-HERE (his walk line `! bash /home/codespace/tm-drafts/deploy-tomato-man-walk.sh` has not run; the lane needs it first). Commit on
sunstruck and `git -C ... push origin sunstruck` after every step; never push main (GitHub Pages serves it). The check:
`node /workspaces/lucid-winds/tools/tomato-man-tests/check.js /workspaces/lucid-winds/work/Tomato_Man/index.html`. The probe:
`tools/tomato-man-tests/gameplay.mjs` (serve the clone on 8778 with python3 -m http.server from that folder; modes seed critters run
runbot hero planet split; add a `levels` mode in step 8). Shots: `tools/tomato-man-tests/shoot.mjs <outdir> <screen>`, never opened.
The laws of TOMATO_MAN_BUILD_PLAN.md bind (the readability contract, the copy law, the budget, saved keys survive, ART_V, no CDN).

## STATE (the builder updates this block; one line per step)
| Step | State | Commit | Note |
|---|---|---|---|
| 1 | DONE 8 Nov | ac865c2 | fair lunge: ring follows half the warning then locks solid (cue "now"), strike never chases, reach clamped to 110 px at runtime for levels, daily and run, dash inside a locked ring = 0.35 s immunity; check OK; shot taken, not opened (7405 ring red px, no page errors) |
| 2 | DONE 8 Nov | 398fcd6 | Dawn Ribbon the lesson (four 100 px crossings, Exposure bar called out, aloe in a crossing, find under an awning, checkpoint explained, par 20); Sliver Step the tools (210 px dash gap, placed scorpion over a 120 px gap, first SPF pickup before a 260 px gap, par 24); lesson coach marks fire in place; minimal L.pickups (spf/shade/ice, drawn disc) built here for the SPF lesson, step 4 extends it; shoot.mjs gained screen tools; check OK; two shots taken, not opened (107 KB, 116 KB, no page errors) |
| 3 | DONE 8 Nov | 3e5cb08 | PRESSURE table a world: every level from Cloud Ferry carries its world's fair lunge unless it has its own (Eclipse keeps its own); critters by place in world (li%4 fixed, placed ones counted: W0 one from level 2, W1 one, W2 two, W3 two plus mirage, W4 three); sun 150/s W0 to W1, 170/s from W2; the run has its world's lunge from the start and between flares, scorpions from mile 1; check OK |
| 4 | DONE 8 Nov | f4ee1c0 | aloe takes 25 off Exposure; SHADE/SPF/ICE pickups (2 or 3 a level on checkpoints and shade) with starting charges cut (world 0 none, later worlds at most 1 of each; spare charges beyond 3 pickups dropped, step 8 retunes); seed pod pickup (+3) one a level from world 1; HUD button pulses on a pickup; the run spawns pickups by budget; shoot.mjs gained screen pickup; check OK; shot taken, not opened (128 KB, no page errors) |

## THE STEPS

**Step 1. The lunge plays fair (S).** The sign must be true: a dash at the right moment escapes. (a) The ring follows him only for the
first HALF of the warning, then LOCKS where it is for the second half (the ring draws solid and the cue changes to "now"), so he has
the half warning to move; (b) the strike never chases: the danger point stays where it locked (delete the per frame lerp; if you keep
any drift, scale it by dt); (c) `reach` on every lunge becomes at most 110 px, so the dash's 96 px from the centre plus any walking in the
locked half clears it; (d) a dash started inside a locked ring gives 0.35 s of lunge immunity (`lungeGrace`), the "perfect time" the
sign promises, and the seed stays the other answer. Numbers in BASE_FEEL (lungeLockFrac 0.5, lungeReach 110, lungeGrace 0.35). The
coach line: "Move off the ring once it locks, dash at the flash, or throw a seed into it." Check. ONE shot of the Eclipse level at the
lock. Commit.

**Step 2. The first two levels teach (M).** Morning Tide 1 (Dawn Ribbon) becomes THE LESSON: a short open sun crossing with the
Exposure bar called out ("The sun burns. Keep to the shade."), the first aloe on the route with "Aloe cools you" (step 4 makes it
true), the first find placed in plain sight under the first awning with its words, the first checkpoint explained; its par and stars
match. Morning Tide 2 becomes THE TOOLS: the dash taught on a sun gap too wide to walk, the seed taught on a lone scorpion that blocks
the shade (a critter on world 0 level 2 only, placed by the level, not by makeCritters), and the first SPF pickup (step 4) with "Sunproof
for a moment". TUT marks for each (one time, saved in save.tut as the others). Nothing in these two levels is skippable by sprinting.
Check. ONE shot of each level's opening. Commit.

**Step 3. Pressure on nearly every level (M).** Morning Tide 3 introduces the fair lunge (warn 1.6, period long, reach 100: one lunge
per crossing); from there every level carries at least one pressure: a lunge (period and reach by world, listed in a `PRESSURE` table
per world), or hot sand, or critters, or a dark window (Eclipse keeps its own). `makeCritters` counts by the level's place IN ITS WORLD
(fix the li%4 bug), world 0 from level 2 (one, placed), world 1 one, world 2 two, world 3 two plus the mirage, world 4 three. Sun burn
150/s in worlds 0 to 1, 170/s in worlds 2 to 4; shade cooling stays 200/s. The Run: the lunge every mile from the first world (today it
comes with the flare, keep that), a critter budget from mile 1. Check. Commit.

**Step 4. Resources you collect to stay alive (M).** Aloe cools: each beam taken takes 25 off Exposure (and still pays 4); SPF, SHADE and
ICE become PICKUPS on the route (a `pickups` array per level: `{x, y, kind}`), two or three per level placed between pressures, with the
starting charges reduced to what the lesson gives (world 0 none but the lesson's); popsicles stay; seed pods (+3) come to the levels
(one per level from world 1). The HUD shows what you hold. The Run spawns pickups with its budget. Check. ONE shot of a level with a
pickup. Commit.

**Step 5. The finds are findable (M).** Move all 78 finds (FINDS 809) onto or beside the shade route: each within 90 px of an awning,
shade line, checkpoint or pickup, one of the three visible from the level's start, never in sun that needs a tool world 0 does not
give; The Run gets one find per mile beside its shade (the world's collectible), counted toward nothing but aloe (+12) and the run
card; the HUD compass: an arrow at the screen's edge toward the nearest unfound find when it is within 420 px (drawn like the lab's move
arrow, the world's collectible colour); the level card says "3 shells hidden" with the found count; the lab gains a FINDS tool (key F,
places and moves the three; saved with tm_lab_levels). Check. ONE shot of Dawn Ribbon's first find in view. Commit.

**Step 6. Worlds open one at a time (S).** `worldUnlocked`: the world before must be COMPLETE (every one of its levels starred), not any
one level; `unlockedLevel` stays (the level before starred). The world map says "4 of 5 levels to open" on a locked world; the How to
Play says so. A save that already has stars beyond the new rule keeps what it has (never lock a world the player has played). Check.
ONE shot of the world map. Commit.

**Step 7. Harder, fairly (S).** Par and the star times tightened by world (par ×0.85 in worlds 2 to 4); the Angry Sun's sweep 10 percent
faster in worlds 3 to 4; checkpoints keep every level fair (a death puts him at the last one with his seeds). Copy law over every new
string (no dashes, no exclamation marks). Check. Commit.

**Step 8. The probe, once (M).** `gameplay.mjs levels`: the bot plays every one of the 26 levels with the new pressure to its bowl of
stars at least once (walk the shade route, dash the lunge at the lock, toss a seed at a blocking critter, take the pickups), and reports
per level: finished or where it died, finds taken, time against par; and `?lab=1` still loads. Run it ONCE; a level the bot cannot
finish in three tries is retuned (its pressure softened, never its finds moved back into the sun). Record the table in STATE. Commit.

**Step 9. The stamp and the line (S).** ART_V unchanged (no new images; the compass and pickups are drawn), sw CACHE tomato-man-v16,
BUILD note in the file head. The deploy script `/home/codespace/tm-drafts/deploy-tomato-man-pressure.sh` in the EXACT pattern of
`/home/codespace/tm-drafts/deploy-tomato-man-walk.sh` (read it whole): PIN = the stamp commit; TM_BASE_B accepts Tomato_Man main at
THE WALK c0d71173 (or at 1d461e6c if his walk line never ran: the pin descends from both, so one line carries both); LW_TREE_B = read
`git rev-parse origin/main:satellites/tomato-man` when you write the script and STOP if it is neither the walk's copy nor the split's;
the thumb hash as the walk script has it. `DRY=1 bash ...` once. The line into START-HERE.md: `! bash /home/codespace/tm-drafts/deploy-tomato-man-pressure.sh`.

## DECISIONS for Stephen (built as written until he says otherwise)
1. The fair lunge: the ring locks halfway through its warning, reach at most 110 px, a dash from inside a locked ring is immune 0.35 s.
2. Aloe cools (25 off Exposure a beam); SPF, shade and ice are pickups on the route; seed pods come to the levels from world 1.
3. A world opens when the world before is complete (every level starred); a save that is already past that keeps what it has.
4. The Run gets one find per mile and the lunge from its first world.
5. Sun burn 170/s from world 2; par ×0.85 from world 2; the sweep 10 percent faster from world 3.
