# SHUTTERBUG R9: FIVE GUARDIANS, SECOND ATTACKS, TEN BUGS, THE HARDER ROOM PIECES (plan written 6 Nov 2026 by Fable)

Astra's round 9 is back (vault release astra-shutterbug-round9-nov06, sha256 f7929683d2ac87e7...; unpacked at
/workspaces/shutterbug-astra-round9/pack, NEVER into git; her docs mirrored in docs/briefs/shutterbug/round9/astra/).
Her NOTES.md is the format truth: RGBA strips, horizontal frames, no gutters, `fps: 0` means select by state. Read it
and the five manifests before step 0. 49 strips, 174 frames: A five bodies (80x64, breathe brace tell hurt down),
B five attacks and five 16 px tell marks, C five shove flashes (edge and corner, 16 px, windup flash peak), D ten bugs
in 16 px and 24 px elite (idle move hurt dead), E conveyor (8 frames, two directions), crumbling shelf (4 states),
swinging lamp (96x96, left centre right, pivot the ceiling), window gust (16x48, 3 frames).

## WHY: HIS WORDS, 6 NOV
"shutterbug needs to have a lot more depth to the fighting and have some stuff actually work together like i just
fought a boss that shot stuff upwards but i could sit next to it and hit it over and over with no problems. i have
also only seen one boss that looks the same. we could use a ton more bad guys, bosses, depth to levels, actually
gameplay mechanics are leaving a lot to be desired." The shove is live (sb-m2-11). The rest is this plan.

## THE LAWS
- Alone. No Workflow, no lanes, no subagents, no review agents, no redwatch or mutant runs.
- Per step: `node satellites/shutterbug/tools/lint.mjs` (seconds). Nothing else. Before the stamp, once:
  `SWS_NO_BROWSER=1 node satellites/shutterbug/tools/check.js` (3 min; what CI runs). A step that edits a line a
  redwatch row anchors on: `node satellites/shutterbug/tools/redwatch.js --anchors`, re anchor, move on.
- A visual step gets ONE screenshot of that screen through tools/shutterbug-tests (never open the image in auto
  mode; describe it from the shell: page errors, pixel counts) and one line in STATE.
- Commit after every step, push the branch. One line per step in STATE below and at the top of START-HERE.md.
- The played game decides. Every bot replay still clears its golden; a changed golden is regolded with
  `--regold --why` and the why written. The room sim gets every new kind's threat cells (index.html near line 3505)
  or the builder will refuse rooms it should not.
- Nothing from the pack is copied into git but the cut pixel strings the splice writes into SPRITES.

## STATE (the builder updates this block; one line per step)
- Step 0: DONE. 49 keys cut and spliced (198 names, page 1.80 MB), cap 200 in the cutter, lint, H-spr-1, redwatch and the astra gate; fixture map holds round 9. Palette clean, no Sun, source grids equal.
- Step 1: DONE. Five bodies by biome and pose (one mask), remnant at the fall.
- Step 2: DONE. The shove in her tiles on an Ink line, one phase.
- Step 3: DONE. Second attacks alternate with the first (BDUST, BBREATH, BWHIP, BPOD, BFLAME), told by her marks; under half HP a cycle runs 3/4 (added: a fight that speeds up); boss schema holds near, shove, cycle, the mark. H-boss-8 re rated, H-boss-12 new.
- Step 4: DONE. Ten kinds 11 to 20 behind a new record flag (FLAG_R9 = 4; captures and the Daily carry it, every older code keeps its room), rolled 50/30/10/10 on a stream of their own, ramp fodder too; a room of three or more meets at least one new kind. H-mon-2.
- Step 5: DONE. Free play floor 4 (R9_FREE_ROW), CAP_TRAP read at last (floor spike fields off the climb), belt, shelf, lamp, gust off the climb's stands (the lamp may cross an arc, never a stand). H-r9-rooms.
- Step 6: DONE. No browser check green once; the walk drew all ten kinds in both sizes, hurt and dead, all five attacks and marks, all four pieces, in all five biomes through the real R.draw, then real rooms through the shell, page errors 0. Stamp sb-m2-12 (283b99f79). Line: `! bash /home/codespace/sb-drafts/sb-m2-12/deploy-sb-m2-12.sh`, dry run OK. The browser gates in test/ were already red on the commit before tonight (no visible #sample after an earlier page's save; stale since the story, never run under the testing law): not touched, a fresh session's call.

## THE STEPS (in order; each ends green on lint, committed and pushed)
**Step 0. The cut (S).** tools/astra_cut.py: add the 49 keys to NEW_KEYS with their sizes and frame names from her
manifests (the names are the sprite keys as she wrote them: boss_moth_mother ... boss_cinder_kiln, boss_dust_cloud and
its _tell ... boss_floor_flame_tell, fx_shove_<biome>_edge and _corner, the ten bugs and their _elite, conveyor,
crumbling_shelf, swinging_lamp, window_gust). Raise MAX_SPRITES 160 to 200 (149 names now, 198 after), the same
number in tools/lint.mjs line 335, and re anchor redwatch's CUT_CAP_RAISED row. `python3 -I tools/astra_cut.py check
/workspaces/shutterbug-astra-round9/pack --sprites /home/codespace/sb-drafts/r9/sprites.json --page index.html`
(expect refusals only if her palette strays from the page's 16 hexes: then write the hex map she used and re cut, never
hand edit a frame), then `splice ... --out index.html`. Add round 9's files to test/astra_fixture.py's map (the CI
round trip). lint green. Nothing on screen changes yet.

**Step 1. Five guardians (M; the look).** BOSS_KEY_OF_BIOME = [boss_moth_mother, boss_rime_mass, boss_anemone,
boss_thorn_heart, boss_cinder_kiln]. drawGuardian draws the biome's key by pose: breathe and brace alternate as today
(frame / 15), tell while B.telegraph > 0 or B.shove > 0, hurt for 8 steps after EV.BOSS_HIT (R.gfx keeps the step),
down once B.phase is 2 (her remnant stays on the dark mass after fx_boss_down plays; it never disappears). The erosion
loop stays exactly as it is: it skips struck cells for every pose (one mask, as her notes demand), the body's origin
never moves. boss_fallback stays in SPRITES (the bot fixtures and goldens name it; the Attic shed still sits on the
Moth Mother). ONE shot: a house's last room in Ember, the kiln awake.

**Step 2. The shove tell in her tiles (S).** The ink frame two cells out becomes her fx_shove_<biome>_edge tiles along
the four sides and _corner at the corners, rotated in 90 degree steps, never scaled, all tiles on one phase: windup
for the first third of BOSS_SHOVE_TELL_F, flash the second, peak the last (6 fps, phase locked). lint.

**Step 3. The second attacks (L).** Each guardian alternates: an even cycle fires its first attack (today's), an odd
cycle its second. The telegraph shows her 16 px tell mark at the attack's spawn point for the whole tell. New proj
kinds in the pool, each a plain box hit through bossHurt: Attic BDUST, a 32 px dust cloud spawned at the body's top
that drifts across the room toward the hero at one cell a second for six seconds, billowing at 8 fps; Frost BBREATH,
a 48x24 cone from the body's mouth facing the hero for 1.2 s (mirror for left), 10 fps; Deep BWHIP, a 16x48 tentacle
rising from the floor one cell beside the body on the hero's side, rise0 to rise2 over 0.3 s, held 0.4 s, hurts while
up; Bramble BPOD, two seed pods rolling away from the body along the floor in both directions at two cells a second,
gone at a wall or after 5 s, 10 fps; Ember BFLAME, a 16 px flame crawling along the floor from the body's base toward
the hero at 1.5 cells a second for 3 s, 10 fps. Tunables in SB.TUNING with _S suffixes (the K derivation makes the
frames). The walk: every attack hits a bug that stands in it and misses one that moves, in every biome's last room,
through the bot's route (tools/shutterbug-tests). lint; the goldens that change, regolded with the why.

**Step 4. Ten bugs (L).** Kinds 11 to 20: SILVERFISH (runs along the wall it is on, the sprite rotated to the wall,
turns at a corner), THREAD_SPIDER (hangs from the ceiling cell, drops on its thread when the bug passes under, climbs
back in 1.5 s), SNOW_FLEA (hops two cells at a time toward the bug), ICICLE_BAT (hangs under a ceiling, dives at a
bug within four cells, returns), LAMPREY (swims straight, turns at walls, the Deep's water rows), LAMP_JELLY (drifts up
a cell every 2 s from its floor, stings on touch, sinks back), BRAMBLE_TICK (crawls the thorn runs and the floor, slow),
SEED_WASP (circles a home point two cells out), CINDER_MITE (scurries the floor at twice a crawler's speed, turns at
edges), ASH_MOTH (flies as the moth does and leaves the beetle's CTRAIL burning behind it). THIRD_OF_BIOME and
FOURTH_OF_BIOME arrays beside KIND_OF_BIOME and SECOND_OF_BIOME; the builder draws a room's kinds by weight: first
50, second 30, third 10, fourth 10, and the third and fourth only from a house's room 3 and in free play from room 2.
Elites at 24 px with ELITE_HP_MULT as today. Each kind: its sprite by state (idle and move alternate at 8 fps, hurt
and dead by state), its threat cells in the room model, its moveEnemy rule, its line in the fixtures. The walk: a
house per biome through the bot, every room builds, every replay clears. lint; goldens regolded with the why.

**Step 5. The harder rooms, step 2 (L).** From the sb-m2-10 entry in START-HERE.md and the checklist's line: the four
pieces on her tiles. CONVEYOR: a floor strip that carries a standing bug at half RUN in its direction (the frames loop
in that direction); CRUMBLING SHELF: whole, cracked when stood on, falling 0.5 s later (the collider gives way), gone,
whole again after 4 s; SWINGING LAMP: a pendulum from one ceiling cell, 20 degrees each way, a 3 s period, left centre
right by angle, hurts a bug it touches; WINDOW GUST: a 16x48 column that lifts a bug as the fan column does (K.FAN_V),
on for 2 s, off for 2 s. The builder places one piece a room from room 2 of a house (two from room 4) where its rule
fits (a conveyor on a run of three floor cells, a shelf on a one way ledge, a lamp under a ceiling run over the route,
a gust in a vertical shaft), never on the route's only path; the free play floor (a floor on the enemy count from room
1 in free play, as houses have); more than one trap a room where CAP_TRAP allows (CAP_TRAP read by the builder at
last). Every bot replay still clears. lint; goldens regolded with the why.

**Step 6. The walk, the stamp, the line (M).** `SWS_NO_BROWSER=1 node satellites/shutterbug/tools/check.js` once,
green. The browser walk once through tools/shutterbug-tests (a house per biome to its guardian, three free play
rooms), page errors zero, one shot per biome's last room described from the shell. Stamp sb-m2-12 (SB.BUILD,
sw.js?v=34, shutterbug-v34, together). The wrapper: copy /home/codespace/sb-drafts/sb-m2-11/deploy-sb-m2-11.sh to
sb-m2-12/deploy-sb-m2-12.sh with the new stamp commit and numbers, DRY=1 once. The line for Stephen in START-HERE:
`! bash /home/codespace/sb-drafts/sb-m2-12/deploy-sb-m2-12.sh`.

## DECISIONS for Stephen (built as written until he says otherwise)
0. Added by the builder: under half HP a guardian's cycle runs 3/4 as long; a room of three or more enemies always meets one new kind (at 10 percent each most rooms would show none); the lamp is Astra's centre pose turned by the sim's swing, not her three poses (smooth, and what you see is what hits).
1. Attacks alternate first, second, first. (Or: the second only under half HP.)
2. New kinds from a house's room 3 (free play room 2), at 10 percent each.
3. The shelf regrows in 4 s; the lamp swings a 3 s period; the gust 2 s on, 2 s off.
4. The Moth Mother keeps the clay shed on her back (her notes); the other four have no shed.
