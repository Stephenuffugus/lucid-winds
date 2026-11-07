# TOMATO MAN: THE ART IN, THE WALK FIXED, AND THE RUN (7 Nov 2026, Fable's plan for the Opus overnight run)

Stephen, 7 Nov: "Tomato man needs some enemies and something to work towards. Right now it's just boring also when I'm
walking forward it doesn't quite look right. I don't know what the objective needs to be and also assets need to be
staggered like right now it's just kind of like you have to clumsily move around. The awnings that are in your way
doesn't completely feel like a game. It just feels like a tedious task at this point, but I love the way it looks ...
it's almost like a top scrolling shooter so maybe we need to be shooting as we go or avoiding something else."

Two milestones tonight, each ending in a deploy line. A: Astra's gameplay art in, the canopies walkable, the walk fixed.
B: THE RUN, a new main mode: the screen climbs on its own, shade is staggered left and right, seeds are the gun, five
kinds of critter, the sun flares every mile, the world changes every mile, a distance to beat and badges to earn. The
campaign's 26 levels stay as LEVELS (nothing in LEVELS data moves), the run becomes the title's first button.

THE LANE (unchanged): build on branch sunstruck of /workspaces/Tomato_Man (never in satellites/tomato-man), from 6c056f3
(CACHE tomato-man-v9, LIVE). Check after every step: `node tools/tomato-man-tests/check.js /workspaces/Tomato_Man/index.html`
(seconds). A shot: tools/tomato-man-tests/shoot.mjs (serve the clone on 8778 first, as gameplay.mjs does). A bot:
tools/tomato-man-tests/gameplay.mjs. The importer tools/tomato-man-tests/astra_in.py writes the socket lines (HERO,
WORLD FITS); extend it for the gameplay pack (a GAMEPLAY FITS line). Deploy pattern: /home/codespace/tm-drafts/
deploy-tomato-man-gameplay.sh (PIN, TM_BASE, LW_TREE, LW_THUMB, the four parts). A commit in /workspaces/Tomato_Man may
raise a permission prompt in this repo's session: Stephen was asked to start the session with that folder added; if a
git command there is denied, keep editing (edits are not git), do every other piece of the milestone, and leave that
repo's ONE commit as its own command, last.

Astra's pack: /workspaces/tomato-man-astra-gameplay/pack (32 files; vault astra-four-packs-back-nov07); docs copied to
docs/briefs/tomato-man/gameplay-art/astra/ (ASSESSMENT.md, NOTES.md, manifest.json, anchors.json). Her units: 2 source px
per world px; every anchor in anchors.json is in SOURCE px from the file's top left; draw a cell at half its pixel size
with its anchor on the world point; never auto trim a frame; a zero duration is a state picked by code. She played a
desktop Dawn Ribbon only (no phone, later worlds locked): the critter art follows the brief and the live rules.

## STATE (the builder updates this block; one line per step)

| Step | State | Commit | Note |
|---|---|---|---|
| A0 | DONE 7 Nov | sunstruck 5097685 | run.walls is empty (collideWalls keeps the world clamp); the canopy he stands under draws after him at alpha 0.82 (canopy() shared by both passes); GAMEPLAY OK through 26 levels |
| A1 | DONE 7 Nov | sunstruck 5097685 | heroBearing holds the last bearing unless the new sector lasts 90 ms or the angle is 12 degrees past the old sector's edge; run.stride drives the walk cycle (a frame every 14 px); the camera ease k = 1 minus 0.88 to the power (dt times 60). Measured through the real update with the stick along the n to nw edge and a 10 percent wobble for 3 s: 21 bearing changes the old way, 0 now; a plain 10 percent wobble straight up: 0 both ways |
| A2 | DONE 7 Nov | sunstruck 5097685 | tools/tomato-man-tests/astra_gameplay_in.py copies her 17 sheets to art/gameplay, the three SEED plates to art/ui, writes GP (cells, anchors, durations) and her three marks into the page; cellAt() draws a cell at half size with its anchor on the world point, rotated when asked; the seed tumbles with its shadow, the sapling sprouts, sways and wilts at the root, her soft shade over the circle, the burst and the sting through the fx list, the landing mark, the SEED plate by state (ready, :active pressed, .empty disabled). Shot (Dawn Ribbon, 1 s after a toss; probed, not opened): 186 green pixels above the root against 0 in a control box, 6270 cool shade pixels in the circle against 168 outside |
| A3 | DONE 7 Nov | sunstruck 5097685 | the scorpion runs, charges (huntAt marks the alert frame), sinks, rises and sits pinned on her sheets, turned about the thorax by its bearing; the mirage shimmers, dissolves over 0.35 s and sits pinned; the cue line uses her marks; reduced motion holds one pose. Shot (Midday Blaze level 5, the hero 70 px off the first scorpion; probed): 219 dark clay pixels within 24 px of the thorax against 36 on open sand |
| A4 | DONE 7 Nov | sunstruck 5097685 | CACHE tomato-man-v10, ART_V 20261107a; check green; GAMEPLAY OK (30), page errors 0; sunstruck pushed; /home/codespace/tm-drafts/deploy-tomato-man-art.sh DRY OK (Tomato_Man main 6c056f3f, lucid-winds main 9550354e0). LINE: `! bash /home/codespace/tm-drafts/deploy-tomato-man-art.sh` |
| B0 | DONE 7 Nov | sunstruck 2e4e30a, 1125c0d | startRun and genRun; RUN first on the title, Levels under it, the Daily a run; the locked scroll 80 px/s +5 every 20 s cap 200 (B6 left it); he starts 160 px over the burn line with 1.5 s of grace and the screen's foot holds him; below the line exposure runs at three times burnSun; a burn ends the run (the Cooler Box still revives once) |
| B1 | DONE 7 Nov | sunstruck 2e4e30a | runBandNext every 240 px, twelve ahead as the camera climbs, each band on the other side of the last and within 120 to 150 px of its shade at the sun's three swings (runReachOk through sweptRect, re rolled six times at most); awnings, umbrellas, carts and clouds by roll; stars, seed pods, popsicles, hot sand along the shade; pruneBelow behind the line |
| B2 | DONE 7 Nov | sunstruck 2e4e30a | a hold on the right 45 percent fires a seed every 0.33 s (the R key too), seeds fly 260 px, a pouch of six, one back every 1.5 s, three from a pod; a second seed sends a pinned critter under, a mirage dissolves at once, a crab flips on its third |
| B3 | DONE 7 Nov | sunstruck 2e4e30a, 1125c0d | motes from 30 s in (fans, a wall with one gap from Tide Pools, a spiral in Eclipse), the gull that snatches saplings and drops hot sand and tumbles off two seeds, the sand crab on a band's edge; the cue line says motes, gull, crab with her marks |
| B4 | DONE 7 Nov | sunstruck 2e4e30a | every 6,000 px (600 m) the sun flares twenty seconds (the lunge, motes doubled), three seconds of eclipse, the world steps on; the HUD shows metres, the pouch, the mile; milestone toasts at 500 to 5,000 m with her mile marks |
| B5 | DONE 7 Nov | sunstruck 2e4e30a, 1125c0d | THE SUN WON on her ornament band: distance, the world, aloe, pinned, new best; aloe 1 per 25 m plus the stars plus 50 a new world; runBest and runWorlds in the save; the title's RUN plate with the best and five badges |
| B6 | DONE 7 Nov | lucid-winds tools/tomato-man-tests/gameplay.mjs runbot | the runner bot through the real update: twenty seeds in world 0, 303 to 1,815 m, MEDIAN 576 m, inside 400 to 800: no number moved |
| B7 | DONE 7 Nov | sunstruck 1125c0d4 | CACHE tomato-man-v11, ART_V 20261107b; TM CHECK OK, GAMEPLAY OK (run), page errors 0; sunstruck pushed; /home/codespace/tm-drafts/deploy-tomato-man-run.sh DRY OK (accepts Tomato_Man main at 6c056f3f or 50976858, lucid-winds main's tomato tree the gameplay copy or A's). LINE: `! bash /home/codespace/tm-drafts/deploy-tomato-man-run.sh` |

## THE LAWS
TOMATO_MAN_BUILD_PLAN.md's laws bind: code directly; the node check per step; ONE shot per visual step, described from
the shell (pixel counts, page errors), never opened; the big proofs once at the end of a milestone; never push main;
commit sunstruck after every step; placeholder art drawn in code wherever Astra's art does not exist yet, under the key
names this plan gives (her next round draws to them); no emoji, no dashes or exclamation marks in player copy; the
LEVELS data is never edited except through the lab's JSON if he pastes some.

## MILESTONE A: THE ART IN, THE CANOPIES, THE WALK (deploy line A)

**A0. Canopies, not crates (S).** An awning is a canopy on poles (6 Nov): walk under it. startLevel (about line 895)
builds run.walls from every 'R' caster; build none (run.walls = []; keep collideWalls for the clamp). Draw order in
render: when the hero's centre is inside an 'R' footprint, draw him BEFORE that canopy and draw the canopy at alpha 0.82,
so he reads as under the roof; otherwise as today. Carts, umbrellas and clouds are unchanged (they were never walls).
The two "go around" levels (Around the Umbrella, The Long Way Round) still play: their umbrellas never blocked. Check.

**A1. The walk (S; "when I'm walking forward it doesn't quite look right").** Three causes in drawHero/heroBearing
(about 1623 to 1660), all fixed: (a) the bearing flickers: P.face comes from the velocity, so walking up with a thumb a
little off centre flips n, ne, nw every frame (the hat anchor jumps with it). Hysteresis: keep the last bearing unless
the new sector has held for 90 ms or the angle is 12 degrees past the old sector's edge. (b) the feet slide: the walk
cycle is floor(nowT * 8) % 4 whatever the speed. Stride: run.stride accumulates distance moved (|v| dt), cell = 1 +
floor(run.stride / 14) % 4, so slow steps are slow and a dash is a blur. (c) the camera lerp is per frame (0.12), so a
120 Hz phone snaps twice as hard: k = 1 minus 0.88 to the power (dt * 60). Prove (a) in node through the real update
(gameplay.mjs style): a bot walking straight up for 3 s with a 10 percent sideways wobble in the stick; bearing changes
per second before and after, in STATE (expect under 1 after). Check.

**A2. The seed toss in her art (M).** ASSET_PATHS (line 549) gains seed_spin, seed_shadow, sapling_sprout, sapling_alive,
sapling_wilt, sapling_shade, seed_burst, landing_mark, tm_icons (the WebP strip) and the three SEED button SVGs
(btn_seed_ready, btn_seed_pressed, btn_seed_disabled). drawSeeds (about 1112): the projectile is seed_spin, four 70 ms
frames looping, drawn at the arc height; seed_shadow at the ground point with no arc offset (decoration, never shade);
the sapling at its landing point: sprout four frames at 50 ms, then alive two frames at 600 ms, wilt four frames at
125 ms over the LAST 0.5 s of saplingLife, the root anchor fixed, 30 world px tall (the engine's lifespan and radius are
unchanged); sapling_shade drawn at 116 world px centred on the landing point, over the shade fill, as shade_pool is drawn
for a dropped pool (the circle in the one path fill stays the truth; never a second dark circle, never multiplied where
pools overlap); seed_burst four frames at 75 ms at the ring hit point in burstLunge, 140 px, gone at 0.3 s;
landing_mark 14 px at the predicted point (replacing the code ring). The SEED button (#bSeed): her plate by state (ready,
pressed while the finger is down, disabled at 0 seeds), the word SEED and the count in code as today. Reduced motion:
one alive pose. Check. ONE shot of play with a sapling up (the shot tool's dev hold: toss, then hold at 1 s): describe it
from the shell. Not opened.

**A3. The critters in her art (M).** drawCritters (about 1094): the scorpion faces right at rotation zero and rotates
about its THORAX anchor (anchors.json) by c.face: scorpion_run four frames at 12 fps while it moves; scorpion_charge
while c.state is hunt (alert then commit, commit held until the state ends); scorpion_sink four frames at 100 ms over the
engine's sink and scorpion_rise over the rise (the last sink frame and the first rise frame are sand only; nothing drawn
while fully under); scorpion_pin two frames at 300 ms, the sapling precomposed on its back (do NOT also call
drawPinSprout for it; use its thorax anchor, not the cell's centre). The mirage: mirage_shimmer four frames at 100 ms
while c.on, behind him on the delayed path; mirage_dissolve four frames over 0.35 s when it fades; mirage_pin two
frames while pinned (its own sprout; no second sapling). sting three frames at 60 ms at the hero in stingBy. The three
one colour marks (tm-seed, tm-scorpion, tm-mirage) go into the page's svg sprite for the cue line and How to play (the
cue lines at cueNow already name them; 48 px hit area where tappable). Reduced motion: one shimmer pose, no pin sway.
Check. ONE shot in Midday Blaze with a scorpion in frame (the dev hold at the first scorpion's home). Not opened.

**A4. Stamp and line A (S).** sw.js CACHE tomato-man-v10. Check green. Commit sunstruck (the message says what changed
and why). The deploy script /home/codespace/tm-drafts/deploy-tomato-man-art.sh in the exact pattern of
deploy-tomato-man-gameplay.sh: PIN the new sunstruck commit, TM_BASE 6c056f3fde14045ffd445ab0c2f71cf7c77934d9 (Tomato_Man
main now), LW_TREE the tree lucid-winds main holds NOW for satellites/tomato-man and LW_THUMB its thumb (git rev-parse
origin/main:<path>). `DRY=1 bash ...` once. The line into START-HERE.md:
`! bash /home/codespace/tm-drafts/deploy-tomato-man-art.sh`

## MILESTONE B: THE RUN (deploy line B)

**B0. The mode and the burn line (M).** startRun(seed, daily): a run built by genRun (B1) with endless true and
run.isRun true; the title's Shadow Run button becomes RUN, first and primary, Levels under it, and Daily Challenge
becomes the daily RUN (seed dateKey as today). The scroll: cam.y climbs on its own at run.scroll px per s (90 at the
start, plus 6 every 20 s, cap 220); the hero is clamped inside the viewport (never above 12 percent from the top, never
below the burn line); the camera's x follows him with the lerp, its y is the scroll (no look ahead in a run). THE BURN
LINE: a band across the viewport's foot that rises with the camera (placeholder: a hard light band 48 px tall, the
world's accent at 0.55 with a shimmer); below it exposure fills at three times burnSun whatever the shade (the sun has
caught up). No checkpoints in a run; a burn ends it (a Cooler Box still revives once, in place). Keys for desktop stay.
Check. ONE shot of the run at 2 s (the dev hold): describe from the shell. Not opened.

**B1. The staggered generator (M; "assets need to be staggered").** genRun(worldIdx, seed): bands every 240 world px up
the world, generated AHEAD in chunks of twelve bands as the camera climbs (worldH grows; the arrays in run grow; nothing
behind the burn line is kept). The staggering rule: each band's main caster sits 260 to 440 px to the OTHER side of the
previous band's (never two on the same side), width 220 to 340, and at the sun's worst swing its shade comes within
170 px of the previous band's shade (prove it in node over 400 bands in every world with sweptRect over the whole swing,
as the 6 Nov audit did; a band that fails is re rolled). Kinds by roll: an awning 50 percent, an umbrella 20, a cart
crossing the lane 15, a drifting cloud 15 (clouds and carts not before band 6). Between bands the open sand is the
critters' ground. Along the shade path: stars (beams) 40 percent of bands, SEED PODS (a new pickup, placeholder a brown
pod 16 px, key seed_pod; +3 seeds) 25 percent, popsicles 20, hot sand from world 1 at 25 percent, no finds, no
checkpoints. THE MILE: every 1200 px of climb the world steps on, Morning Tide, Midday Blaze, Tide Pools, Dunes at Dusk,
Eclipse, then Morning again one difficulty up (applyTheme and needWorld at the shift; that world's bands: wilting shade
in the Pools, wind in the Dunes, lunge and dark in Eclipse). Check. No shot (B0's covers it).

**B2. Seeds are the gun (M; "shooting as we go").** In a run: a finger held anywhere on the right 45 percent of the
screen that is not a button fires a seed every 0.33 s in the facing direction (UP when the stick is idle: in a run the
idle bearing is north, not south); seeds fly 260 px (seedRange in a run). The pouch: 6 seeds, +1 every 1.5 s, +3 from a
seed pod, shown on the SEED button (which still fires one on a tap, as in levels). Hits: a seed on a critter pins it
(exists); a SECOND seed on a pinned scorpion or crab sinks it for good (it goes under and never rises; "sent under",
no gore); a mirage dissolves on one hit; a seed that lands sprouts a sapling (exists), so shooting ahead lays shade
stepping stones across open sand: that is the twist, the gun makes the road. Check.

**B3. Three new critters (L; placeholders drawn in code, keys named for Astra's round).** SUN MOTES (key mote): from
30 s in, every 6 s the sun spits 3 to 5 slow embers down the screen in a fan from the top edge, 12 px, 120 px per s,
passing through everything; contact is +30 exposure and a knockback; they cannot be shot; gone past the burn line.
Patterns: a fan, a wall with one gap, in Eclipse a slow spiral. Placeholder: a glowing disc with a short trail.
GULL (key gull): from world 1: swoops in from a side across the screen on a sine, 40 px, snatches the first sapling it
crosses (the sapling dies) and drops one hot sand splat under its path; two seeds knock it off and it drops a
popsicle. Placeholder: a white chevron with a two frame flap. SAND CRAB (key crab): from world 2: walks sideways along a
band's shade edge, 28 px, a sting on contact (+20) and it blocks the entry; one seed pins it 2 s, three seeds flip it
for good. Placeholder: an orange oval with six legs. A budget per band by world (0.6 critters a band in Morning Tide to
1.6 in Eclipse) spread over scorpion, mirage, gull, crab by what that world allows (scorpions from Blaze, the mirage
from the Dunes, as today). The cue line gets 'motes, dodge', 'gull, shoot it', 'crab on the edge'. Check. ONE shot with
a gull and motes in frame (the dev hold at 40 s in world 1): describe from the shell. Not opened.

**B4. The flare and the mile (M).** Every 1200 px: 20 s of THE SUN FLARES: the Angry Sun lunge runs (exists: the ring
every 5.5 s, a seed into the ring bursts it) with motes doubled; then 3 s of eclipse dark, and the world shifts in the
dark (B1's step). HUD in a run: distance in m (world px / 10) where the timer was, the pouch count, the stars, the mile
count. Milestone toasts at 500, 1000, 2000, 3000, 5000 m (+aloe: 25, 50, 100, 150, 250). Check.

**B5. The run card and the ladder (M; "something to work towards").** The run ends on the win card as THE SUN WON (not
YOU MADE IT): DISTANCE, STARS, PINNED, WORLD REACHED, aloe earned (1 per 25 m, plus the stars, plus 50 the first time a
run reaches each world), NEW BEST; Again; Share (the postcard says "Tomato Man run, 1,240 m, the Dunes"). The save:
runBest (m), runWorlds (a bitmask of worlds reached in a run), the daily keeps dailyBest as metres (bigger is better:
the compare flips for a daily run) and the streak. The title shows BEST 1,240 m under RUN and five world badges
(placeholder: five discs in the world palettes, lit when reached; Astra's round draws them). Check. ONE shot of the run
card: describe from the shell. Not opened.

**B6. Balance, once, in node (M).** gameplay.mjs gains a runner bot: holds up, fires, zigzags to the nearest shade ahead
(a greedy pick each 0.25 s). 20 seeds per world at 60 Hz through the real update; the median distance before a burn in
STATE. Tune ONLY scroll start and ramp, mote cadence and the critter budget until the bot's world 0 median is 400 to
800 m (a human does better; the bot cannot read a lunge ring). Once in range, never re run. Check.

**B7. Stamp and line B (S).** sw.js CACHE tomato-man-v11. Check green. Commit sunstruck. The deploy script
/home/codespace/tm-drafts/deploy-tomato-man-run.sh in the same pattern, PIN the new commit; its TM_BASE guard accepts
Tomato_Man main at EITHER milestone A's pin or 6c056f3f (the gameplay line), since line A may or may not have run;
LW_TREE and LW_THUMB read from main when you write it. `DRY=1 bash ...` once. The line into START-HERE.md:
`! bash /home/codespace/tm-drafts/deploy-tomato-man-run.sh`

## FOR ASTRA'S NEXT ROUND (written tonight by Fable: docs/briefs/tomato-man/the-run/)
Keys the code draws as placeholders until her art lands: mote, gull (fly, swoop, hit), crab (walk, pinned, flipped),
seed_pod, burn_line (a tileable band), run_badge_0 to run_badge_4, the RUN title plate. She draws to the live build after
line B runs.

## RULINGS (Stephen, 7 Nov 2026 ~15:40 UTC)
1. Burn line pace: the default, judged on the Pixel ("we'll have to just check it").
2. Checkpoints: not sure; the default (none, the Cooler Box revives once) until he plays it.
3. Motes: not sure; the default (unshootable).
4. The mode wants ANOTHER NAME than RUN (he will come up with one); RUN first on the title and the Daily as a run stand.
5. Canopies walkable, AND some awnings the hero walks UNDER (both kinds in a run), AND MORE GAPS IN THE SHADE (the
   generator leaves more sun between shade pieces).
6. The planet tomato: not sure, he may find something catchier; not built until he says.
7. Hats that do a tiny thing: he likes it, after the run is fleshed out.
8. Listing free or $0.99: not answered.

## DECISIONS for Stephen (built as written until he says otherwise)
1. The burn line's pace: 90 px per s, +6 every 20 s, cap 220 (the hero walks 240, dashes 600). Faster is one line.
2. No checkpoints in a run (default; a burn ends it, the Cooler Box revives once). The other choice: a checkpoint at
   each mile, so a run has acts.
3. Motes cannot be shot (default; they are light). The other choice: a seed snuffs one.
4. RUN is the title's first button (default); Levels second; the Daily is a run (default) rather than a level.
5. Canopies walkable in LEVELS too (default, A0) rather than only in the run.

## LIVE 7 Nov ~18:05 UTC: milestones A and B by his one line (lucid-winds main b3c737e20, Tomato_Man main 1125c0d4; both hosts serve it)

## CHAPTER 8 (7 Nov): Astra's run pack wired, in the same stamp as B7
Her pack (astra-tomato-man-run-nov07 in the vault; docs/briefs/tomato-man/the-run/astra/) came back the same afternoon, so chapter 8 landed inside milestone B: tools/tomato-man-tests/astra_run_in.py copies her seventeen sheets to art/run/ and the plate and ornament SVGs to art/ui/, writes RP (cells, anchors, durations) between TM RUN FITS markers and merges it into GP, and puts her nine marks (tm-mote, tm-gull, tm-crab, tm-mile-500 to 5000, tm-mile) in a TM RUN ICONS block. The page: the mote's core on its point at 80 ms; the gull's fly, carry, hit and knocked poses, mirrored for a leftward flight, tilted on its sine; the crab's walk, pinned (its own sprout) and flip; her burn strip tiled at 128 by 64 world px with the world's wash multiplied in (her five tints), over every shade and under the hero; her pod; the RUN plate (ready and pressed, the words in code on her baselines) and the five badges earned or unlit; THE SUN WON on her ornament; the mile marks. Her ten ideas are DECISIONS below.

## RULINGS 2 (Astra's ten run ideas, docs/briefs/tomato-man/the-run/astra/ASSESSMENT.md; none built; Stephen's yes per line)
1. The first eclipse as the clear first goal (five badges as a journey). 2. A rescued sapling counts toward an end card garden. 3. The gull dips its beak before a snatch (a tell). 4. Crabs as route choices (three seeds to clear an edge, or cross elsewhere). 5. Motes in sparse falling gates to steer through. 6. Seed pods on the sunny side of a safe route. 7. The previous best as a quiet sand marker. 8. In an eclipse, the next three shade islands shown. 9. The burn line hesitates one beat at a world change. 10. A daily fixed route beside the random run (the Daily Run is that already).

## CHAPTER 10 LIVE 7 Nov ~22:11 UTC by his line (lucid-winds main 1c2388105, Tomato_Man main d5e80d9a; both hosts serve it)

## CHAPTER 10 (7 Nov ~22:03 UTC): THE HERO wired, sunstruck d5e80d9
Astra's hero pack (astra-tomato-man-hero-nov07 in the vault, 97 files; her notes in docs/briefs/tomato-man/the-hero/astra/) came back at 22:03 and went in the same hour. tools/tomato-man-tests/astra_hero_in.py copies her sixty five bearing sheets (thirteen bodies by s, se, e, ne, n; 1024 by 512, 256 px cells, the tomato's frame order: idle, four walk frames, the dash crouch and stretch, a hop; the face baked in) to art/hero/<stem>_<bearing>.webp, her thirteen builder heads over the old ones at their own paths, the planet's twelve files to art/planet/, and writes the lazy keys between TM HERO ASSETS markers. The code: needLook asks for the body's five sheets; drawHero draws a produce body's cell exactly as the tomato's (rigged: the stride's walk frame every 14 px, the crouch then the stretch in a dash, the west bearings mirrored whole, the tomato's HAT_ANCHOR seats for every body, as her anchors.json repeats them); the old still body with the laid on face is the fallback until the sheets load and the card's figure. ART_V 20261107c, CACHE tomato-man-v12.
Proof (gameplay.mjs hero): the pickle's five sheets load lazily; its frames change with the stride and the dash (1,109 to 1,126 px between frames); the figure on the game canvas matches her pickle cell pixel for pixel (mean gap 0.7 of 765) and not the tomato's (188.8); the tomato is still the tomato (0.5 against 93.1); a cherry in a cap walks north and west; the seed, critter and run sections green; TM CHECK OK (281 files).
PARKED, his call: THE PLANET TOMATO. Her ten frames (three approaching, four passing as a ping pong, three leaving), the shadow (880 px, drawn 440 for the code's radius 220 circle) and the cue mark are in art/planet/ and the lazy table, drawn nowhere. Astra's note: once per level in Dunes at Dusk and Eclipse if enabled; the path and the start are the code's; only the code's circle grants shade. When he says yes it is a short step (a caster that crosses the level on a timer, drawn as her frames). Her hop frame is in every sheet too; the engine has no hop.
LINE: `! bash /home/codespace/tm-drafts/deploy-tomato-man-hero.sh` (ships on top of milestone B; the lane fast forwards Tomato_Man main, re vendors, puts satellites/tomato-man on lucid-winds main, waits for both hosts).
