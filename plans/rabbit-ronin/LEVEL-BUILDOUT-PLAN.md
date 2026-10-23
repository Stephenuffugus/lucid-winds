# Rabbit Ronin level build out: the plan (for Opus to build)

**Trigger:** Stephen says "build the Rabbit Ronin levels" (or points you here). Read `CLAUDE.md` first (the laws), then this
file top to bottom, then start at Part A, or wherever the state block says. Written 2026-10-23 by the lead session that
shipped v2.3 to v2.9 while every fact was fresh. Everything in section 2 was run or read in the code, not assumed.

---

## 0. State block (update IN THE TURN you finish a part)

- 2026-10-23 19:40 UTC: plan written. Nothing built. Live is v2.9 (card `?v=20261023d`).
- Part A: not started. Part B: not started. Part C: not started. Part D: not started.

## 1. What Stephen asked for, verbatim, and what "good" means

- 22 Oct: "I want these levels to be at least five times longer than they are. Obviously we need a lot more thought and
  depth to each level objectives. Let's make this a fun game!"
- 23 Oct, playing on his phone: "now I'm trying to release 15 mice in a single level and the level looks pretty much the
  same and repetitive the whole way through."
- 23 Oct: "We could design a large level development build out and have opus do the build." (this file)

Good means: a dojo reads as a JOURNEY with five distinct places in it, the light changes as you go, every rest post is a
landmark you remember, and each dojo gives you one job to think about besides reaching the diamond. A player who clears
dojo 3 should be able to describe its five parts. Nothing about the feel of running, jumping and swinging changes.

## 2. The game today (where everything is; `satellites/rabbit-samurai/index.html`, about 2050 lines)

- **Grid:** `T=40`, `ROWS=24`, ground rows 22 and 23 solid, `grid[r][c]` is `true` (solid), `false` (air) or `2` (one way
  ledge: jump up through it, stand on it, hold DOWN on the stick to drop). `HW=12, HH=16` bunny half extents.
- **A dojo = five segments stitched:** `SEGS=5`; `genLevel(li)` (about line 517) calls `genSeg(li,seg)` five times and
  concatenates grids and object lists, shifting x by the segment width; `lvl.checkpoints` = a REST POST at every join
  (`drawPost`, the hero respawns at the last one, `G.cpX/cpY`); the diamond is at the end of the last segment.
- **A segment** (`genSeg`, about line 538): seed `mulberry32(4210+li*911+seg*7919+retry*131)`, `SEG_RETRY` holds four
  retry offsets the solver needed (`'17:2':1,'22:2':1,'9:3':1,'22:4':2`); width `W=34+stage*8+floor(li/6)*6`;
  `stage=li%6`, `diff=stage+floor(li/6)`. Order inside: pits (wide swing pits with an anchor over each, small hop pits),
  one way platforms up high, swing anchors (`lvl.porcs`), the structure ramp per world (crate stacks, tunnel roofs, stair
  ledges, terraces, gusts; `takeSpan` keeps them off pit lips and anchors), the ground top per column `gt[]`, carrots,
  enemies (`hogs`, `crows`, `spits` from `WORLD_DEFS`), mouse cages (`lvl.cells`, three per segment, so 15 per dojo),
  bounce pads, cannons, spikes in pits. ⛔ The "four tile island" pit rhythm is what the six tile swings were tuned on;
  the solver broke the moment islands got longer (Sep 05). Do not change pit widths or spacing.
- **Worlds:** `WORLD_DEFS` (4): The Crate Yards `crate`, The Burrows `burrow`, The Grove `grove`, The Peaks `peak`; six dojos
  each, `LEVELS=24`; `worldOf(li)`. Structure kinds per world are hard coded in `genSeg` (yards: stacks; burrows:
  tunnels; grove: ledges + stacks; peaks: terraces + gusts + stacks).
- **Art:** four atlases in `assets/art/` (`hero`, `sword`, `sprites`, `tiles`) + `atlas.json`; `spr()/sprC()` draw frames with
  the feet registered; tiles per world: `ground_top, ground_fill, wall, pit_edge_left/right, platform_left/mid/right,
  roof_underside` + two decor props each (`DECOR`: lantern, rope_coil; mushroom, root_curl; fern, stump; cairn). Scenery:
  `assets/bg-<theme>-near.webp` and `-far.webp` (1080x640) drawn by `drawBgSil` in screen space at `GROUND_Y=650` with
  parallax; the sky is procedural in `drawSky(theme,cam)`. v2.9: `alphaMargin()` measures transparent margins at draw
  time; keep using it for anything new you draw from the atlases.
- **Camera:** `ZOOM=1.2`, `viewY()=22*T*ZOOM-GROUND_Y`; `ctx.scale(ZOOM).translate(-cam,-viewY()/ZOOM)` for the world.
- **Story and prompts:** story cards between dojos (`storyCards`, Continue / Skip / Journal), dojo 1 teaching prompts
  (`PROG.tut`), control lessons for touch (`PROG.ctlTips`). `STORY.md` beside the game is the writing bible.
- **Progress:** `PROG` in localStorage `rabbitsamurai_save` (cleared, sword, up:{vine,fling,heart,paws}, bank, stars, totalMice);
  stars per dojo = clear + all mice + 80% carrots; `SWORD_AT=2` (the sword after dojo 2). `levelClear()` banks once.
- **Dev hook (test builds, `?rstest=1`):** `window.RB_DEV`: `start(li)`, `startLevel(li)`, `full()` (G), `input({left,right,
  jump,rope})`, `step(dt)`, `teleport(x,y)`, `grapple()`, `release()`, `botStep(dt)`, `autoplay(n)`, `selfCheck()`, `alpha()`.
  `window.__RR()` on every build. Seed the save in `addInitScript` exactly as `scripts/rs_solver.mjs` lines 19 to 25 do.
- **Gates:** `scripts/rs_solver.mjs` (env `RS_ONLY` 1 based dojo, `RS_SEG`, `RS_SEGS`, `RS_RETRY`, `RS_POL`, `RS_TRACE`): it
  must clear 24 of 24 with the retry table; ⛔ serve from the lucid-winds ROOT (`python3 -m http.server 8777` at `/`) or
  `/sunbeam-sdk.js` and `/music-unlocks.js` 404; ⛔ kill servers by PID file, never `pkill -f`. Syntax: extract every
  `<script>` block and `new vm.Script()` it. Looks: playwright at 412x915 with `deviceScaleFactor:2`, seed the save with
  `ctlTips:3` to hide the control lessons, `RB_DEV.startLevel(li)` then `RB_DEV.teleport(x, 21*T+HH)` to any segment and
  shoot; crop and zoom the floor line; READ the picture and name what is wrong before Stephen does.
- **Deploy:** stamps = `var BUILD='v2.9'` (bump every ship) and the portal card `portal/index.html` `rabbit-samurai/?v=2026MMDDx`;
  commit on `add-sproing-jumper` with `-- <paths>`, then the files only deploy to main:
  `bash ~/.claude/projects/-workspaces-lucid-winds/memory/scripts/files-only-deploy-paths.sh <msgfile> satellites/rabbit-samurai/index.html portal/index.html`,
  merge main back, probe BOTH origins (`lucidwinds.com` and `www.`) with `?probe=$RANDOM` for the new BUILD string. Tell
  him after; never ask whether to deploy. A phone must close the tab once.

## 3. The design

### A. Five beats, one per segment (the generator)

Give `genSeg(li,seg)` a BEAT that decides what the segment is about. Parameters today are global per dojo; make them
per beat. The five beats, in the order a first time player meets them in dojo 1:

| beat | name | what it is made of |
|---|---|---|
| 0 | The Approach | flat run, small hop pits only (no wide pit), a cage row at ground level, one hedgehog, the most carrots. The player warms up. |
| 1 | The Works | the world's structures, doubled: stacks, tunnels, ledges, terraces; cages INSIDE or ON structures (on a stack top, inside a tunnel, on a ledge plateau); one small pit, no wide pit. |
| 2 | The Gallery | the swing beat: two or three wide pits close together with their anchors, carrot arcs under every anchor, crows through the corridors, no structures. Cages hang high (a platform under an anchor). |
| 3 | The Climb | a staircase of one way platforms rising to a high plateau (three or four rows up), cages up the stair, a drop at the end onto a bounce pad or into a cannon that launches the player toward the next rest post. No wide pits. |
| 4 | The Gauntlet | the world's full enemy mix at this stage, hedgehogs on the runs, spits, one wide pit, the last cages guarded, then the diamond on a raised platform. |

Rules: the beat order ROTATES by dojo so two dojos in a row never share a shape: `beatOf(li,seg)=(seg+li)%5` except dojo
1 (`li===0`), which keeps 0,1,2,3,4 so the teaching prompts still land. Each beat still obeys the pit rhythm; a beat
that wants "no wide pit" sets `nWide=0`, one that wants "close together" lowers `gap`. The segment width stays the
formula. Three cages per segment stays (15 per dojo, his number). ⛔ `SEG_RETRY` is tied to today's seeds; after the
generator changes, rerun the solver sweep (`/tmp/fo-lead/rr_sweep.sh` is gone; rebuild it: 5 retry seeds x 24 dojos,
`RS_RETRY=n RS_ONLY=k`) and refill `SEG_RETRY` for the segments that fail first try. Expect a few.

### B. The light shifts across a dojo (the look)

Add `G.hour` = the segment the camera is in, 0 to 4, interpolated by camera x across the join (so it never pops).
`drawSky` and `drawBgSil` take it: the sky gradient and the sun or moon move with it, plate alpha and a colour tint
drift with it. One arc per world: yards dusk to lantern night; burrows torchlight that dims to deep dark then glows
gold near the exit; grove noon to green dusk with fireflies at 4; peaks dawn fog to bright blue to a red sunset.
Keep it CHEAP: one gradient and one `globalAlpha` per layer, no per pixel work, `noMotion()` respected. Use the lanterns
in `DECOR` as the yards' light sources: brighter halos as the hour grows.

### C. A landmark at every rest post

Each rest post gets a landmark drawn behind it on the far layer, named, and the float text says it ("Rest post 2 of 4
at the Lantern Gate"). Three per world, chosen by `(li+seg)%3`, drawn from existing atlas pieces where they fit and
simple shapes in the game's palette otherwise (no new art needed for the first pass; Astra can replace them later):
yards: a torii of crates and rope, a lantern mast, a rope bridge; burrows: a root arch, a glowing mushroom ring, a
burrow mouth; grove: a shrine stone, a lantern tree, a waterfall; peaks: a cairn tower, a snow pine, a prayer flag line.
Rest post names also go on the pause panel's dojo line and on the Journal.

### D. One job per dojo (the depth)

A dojo card at the start ("Dojo 7, The Burrows. Your job: free every mouse without losing a life") and a tally at
the clear. Jobs rotate and ramp (Astra RR14 to RR17): free all mice; free all mice without losing a life; finish under a
par time (par = the solver's time x 1.6); swing N pits in a row without touching ground; cut N hedgehogs; collect every
carrot; clear with a full heart. The job is a BADGE, not a fourth star: stars stay clear + mice + carrots. Show the badge on
the level select and bank 10 carrots for it (`PROG.bank`), once.

### E. Later, his call: a secret pocket per dojo (a hidden cage above the climb), and Astra's eight optional challenge dojos 25 to 32.

## 4. Build order, each its own deploy (his one change at a time rule)

1. **Part A beats.** Generator only. Gates: syntax, solver sweep 24 of 24 with the refilled retry table, a scan that
   every segment has exactly three cages and the diamond reachable (the solver proves it), shots of dojo 1 and dojo 9
   at each segment (teleport to the segment's first flat tile, 412x915), READ them. Deploy, bump stamps, board.
2. **Part B light.** Draw only. Gates: syntax, selfCheck, a shot at each segment of dojo 1, 7, 13, 19 (four worlds), a
   look, 60 fps check in headless (frame time under 10 ms at 412x915 with the hour tint on). Deploy.
3. **Part C landmarks.** Draw plus the float text and the pause line. Gates: shots of every rest post of dojo 1 and 13;
   no landmark overlaps a cage, an anchor or the diamond; a look. Deploy.
4. **Part D jobs.** Logic plus the dojo card and the badge. Gates: a headless run that completes each job kind once
   via `RB_DEV` and sees the badge banked once; the card never blocks the first input more than 1.2 s; `no dashes` in
   every new string; a look at the card and the tally. Deploy.

After each part: write the state block, then the board (`START-HERE.md`, top, dated), then memory
(`project_rabbit_ronin_astra_oct22.md`) and push both. Report to Stephen with what you SAW in the shots, not what you wired.

## 4b. Overnight rules (Stephen, 23 Oct: "i can refresh and let it build all night if it has a good plan")

Nobody is watching. So:
- Work the parts in order and ship each one the moment its gates are green. A part that is live at 03:00 is worth
  more than four parts in a working tree at 07:00.
- A gate that is still red after THREE honest attempts is not a fifth attempt: write what failed and why into the state
  block, leave that part unshipped (revert the working tree to the last commit for that file), and go on to the next part
  only if it does not depend on the failed one (B and C do not depend on A; D does not either).
- Never leave main in a state a phone cannot play. Every deploy is files only, probed on both origins, with the BUILD
  string read back live. If a probe fails, the next action is the fix, not the next part.
- No other game, no other file. Rabbit Ronin's `index.html`, the portal card line, this plan, the board, memory.
- Budget: stop after Part D ships or after six hours of wall clock from your first command, whichever is first, and
  write the final state block. Then write the morning report at the top of `START-HERE.md`: what is live, what you saw in
  the shots, what you left unshipped and why, in that order. He reads that first.
- If the box restarts mid run, the next session reads the state block and continues from the last unfinished part.

## 5. Do not touch

Physics constants (`GRAV, MOVE, ACCEL, FRIC, JUMP, BOUNCE, CANNON`), the floating stick (`STICK_*`, `applyPointers`), the
sword gate `SWORD_AT`, the pit rhythm and widths, Astra's art files, the story cards' text, the music hooks, the control
lessons. Any of these is a separate ask with his word first.

## 6. Reporting

Lead with what is live and the proof. One paragraph per part. Name the three things you saw wrong in your own shots before
he does. No dashes in anything a player reads. Put his words on the board verbatim the moment he gives any.
