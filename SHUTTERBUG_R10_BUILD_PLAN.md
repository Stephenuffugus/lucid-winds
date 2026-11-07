# SHUTTERBUG R10 CODE: FILM STOCKS, RANK, PRINTS, FOUR NEW VERBS (7 Nov 2026, Fable's plan for the Opus overnight run)

Stephen, 7 Nov: "I'm loving the look. I'm loving the difficulty increase. It's getting better. I still think we could do
with a whole bunch more assets. Why not make the game real diverse? Make it grow as people play it more. It's still
missing a little something whether it's a way to change biomes or level up their character or unlock collectibles or
just something to keep them hooked." 6 Nov: "a ton more bad guys, bosses, depth to levels."

What the game already holds (sb-m2-12 live, main e37264aa7): five biomes voted from the photo's colour (most real rooms
vote Attic), twenty bug kinds, five guardians with two attacks each, house runs with the ramp, weapons and the Darkroom
(prints developed for dead pixels), the album, trophies, a bestiary, sixteen hero looks and frames as prizes, the Daily,
share codes v2 (header bytes: biome b[6], rules b[7], flags b[8]; FLAGS_KNOWN at index.html 1245; FLAG_R9 = 4). What he
cannot feel: he cannot CHOOSE a biome, nothing says what level he is, and nothing in a room is worth hunting beyond the
climb. Three systems tonight, in code with placeholder tiles, and Astra's round 10 draws to them (the brief is written:
docs/briefs/shutterbug/round10/). The fourth piece, four new enemy verbs, goes last and may wait for the next session.

Game: satellites/shutterbug/index.html (1.84 MB). Anchors: biomeFor(rec, pal, n, opts) at 1889 (an opts override, else a
v2 record's biome byte, else the vote); the save doc defaults at 1419 (dp, collection, prints, pool, unlocks, run,
stats {clears, houseClears, deaths, bestClimbFrames, wallJumps, keys, flawless, albumPages, albumBiomes}, trophies,
album, cosmetics {hero, frame, owned}); LOOKS, PRIZES, lookPrize, lookOwns at 1476 to 1495; TROPHIES at 10947; the
develop screen #develop (748) and #devcard (683); the title #title (634); the album #album (708); the strip #strip (791);
SB.features at 4273 and ramp at 3766 (the seeded placement rules); KINDS at 8494; DP tuning at 918. The check:
`SWS_NO_BROWSER=1 node satellites/shutterbug/tools/check.js` ONCE before each stamp (about 3 minutes; it is what CI
runs). Lint per step: `node satellites/shutterbug/tools/lint.mjs`. A stamp moves BUILD, sw.js ?v and CACHE together.
The deploy wrapper pattern: /home/codespace/sb-drafts/sb-m2-12/deploy-sb-m2-12.sh (merge origin/main into the branch
first, then tools/shutterbug-tests/deploy.sh with the stamp). The browser gates in test/ are red since before R9 on a
stale #sample: not tonight's job.

## LIVE 7 Nov ~22:25 UTC by his line (lucid-winds main e5dfd0c44; lucidwinds.com/satellites/shutterbug/ serves BUILD sb-m2-18, sw.js?v=40, shutterbug-v40): sb-m2-16 (the moves taught), 17 (the Loom and the Wasp) and 18 (the phases) in one push

## ROUND 11 CODE, THE PHASES (sb-m2-18, aae6eef16, 7 Nov ~22:20 UTC): under half its HP every guardian's attack grows (a cloud with the shed, five icicle columns, a wider ring, faster pods and flame, two more sparks, two strands, a pair of darts) and EV.RAGE marks the crossing once; H-boss-14. ONE line ships 16, 17 and 18: `! bash /home/codespace/sb-drafts/sb-m2-18/deploy-sb-m2-18.sh`. Her rage tell frames (round 11 art) will dress the moment when they land.

## ROUND 11 CODE (sb-m2-17, e38d6e78e, 7 Nov ~21:40 UTC): THE LOOM AND THE WASP live in Attic and Ember houses by a seed bit under FLAG_VERBS (features.guardian.kind): the strand and the puff, the dart and the Kiln's flame, her round 10 marks as the tells; H-boss-13. ONE line ships 16 and 17: `! bash /home/codespace/sb-drafts/sb-m2-17/deploy-sb-m2-17.sh` (the 16 line is stale). Still waiting on Astra's round 11 art: the staircase, the swinging strands, the crosswind, the rage tells.

## LIVE 7 Nov ~18:20 UTC: sb-m2-13, 14 and 15 by his one line (lucid-winds main 5bfb72309). sb-m2-16 (step 5, the moves taught) STAMPED 8e070b1e4, waits for his line. Open: round 11 when Astra's pack is back.

## STATE (the builder updates this block; one line per step)

| Step | State | Stamp | Commit | Note |
|---|---|---|---|---|
| 0 | DONE 7 Nov | sb-m2-13 | 5e56e4052 | the stock row on the develop screen (Auto and the five biomes, placeholder boxes with the biome badge); the pick writes the record's biome byte (stockRec in recordOfCrop; the seek's found box is built once more with the stock when it builds); a locked box says its rank; the save remembers the stock; the Daily untouched |
| 1 | DONE 7 Nov | sb-m2-13 | 5e56e4052 | XP from the stats (RANK_XP, XP_ weights in TUNING), ten ranks, stocks at 2 to 5, a look at 3 and 5 and from 6 up (lookWin), doc.rank remembers; the title's rank line and bar, the clear card's XP line or the rank up and its gift |
| 2 | DONE 7 Nov | sb-m2-13 | e0130047b | THE UI WORD IS KEEPSAKE, not print (the Darkroom already calls its developed blueprints prints): FLAG_R10 = 8, C.FLAGS 15; curio() in the features pass on its own stream (30 percent; a photo cell the bug can stand on, 2 off every stand and spawn); LOOT_CURIO through the sim with EV.CURIO; a palette polaroid until her sprites (curio_<id>.a); doc.curios by id, stats curios and curioSets, four trophies, a full set grants a look; the album opens with the collection, five rows of six. The level hash's FIELDS unchanged (the keepsake is derived at build time), so no room's hash moved; the harness's unknown flag bit moved to 4 |
| 3 | DONE 7 Nov | sb-m2-13 | 97c420f42 | THE GATES THAT NEED NO BROWSER PASSED; stamp sb-m2-13, shutterbug-v35, sw.js?v=35; /home/codespace/sb-drafts/sb-m2-13/deploy-sb-m2-13.sh DRY OK. LINE: `! bash /home/codespace/sb-drafts/sb-m2-13/deploy-sb-m2-13.sh` |
| 4 | DONE 7 Nov | sb-m2-15 | 49238f362, ec80c00e0 | THE FOUR VERBS behind FLAG_VERBS (bit 4; captures carry 31; the harness's unknown bit moved to 5): verbKinds after round 9's roll (30 percent, at least one in a room of three where they may come); the lobber and its arcing pellet, the dropper's fall and climb, the shellback's armoured front (a bounce unharmed, a hit shrugged, CLANG), the splitter's halves; her bodies by biome; H-mon-3; the no browser check green; the wrapper /home/codespace/sb-drafts/sb-m2-15/deploy-sb-m2-15.sh DRY OK. LINE: `! bash /home/codespace/sb-drafts/sb-m2-15/deploy-sb-m2-15.sh` (ships sb-m2-13 and 14 too; their lines are stale) |
| art | DONE 7 Nov | sb-m2-14 | d9b5b5557 | CHAPTER 7, Astra's round 10 wired: 118 keys cut and spliced (cap 320), film boxes, rank badges and plate, keepsake pickups and tiles, the tinted silhouette, the five frame plates as grants (lookGrant), the weather as the air; the verbs and guardians parked on the page |
| art stamp | DONE 7 Nov | sb-m2-14 | 50d436f32 | the no browser check, lint and the fast harness green; /home/codespace/sb-drafts/sb-m2-14/deploy-sb-m2-14.sh DRY OK. LINE: `! bash /home/codespace/sb-drafts/sb-m2-14/deploy-sb-m2-14.sh` (ships sb-m2-13 too; sb-m2-13's line is stale) |
| 5 | DONE 7 Nov | sb-m2-16 | 3edb5400a, 8e070b1e4 | TEACH THE MOVES: hold jump, drop through and the tripod, once each per save in the strip's banner after the wall lesson, never in a house room; lint and the no browser check green; probed on the live state (each once, gone at 3 s). LINE: `! bash /home/codespace/sb-drafts/sb-m2-16/deploy-sb-m2-16.sh` |

## THE LAWS
SHUTTERBUG_R9_BUILD_PLAN.md's laws bind (the sim is pure and deterministic: no Math.random, no Date.now inside it; a
shared code's level never changes, so anything that changes a built level sits behind a new flag bit; lint per step;
the no browser check once before a stamp; one shot per visual step, described from the shell; one line per step in
STATE and START-HERE; never push main; the wrapper script and its line for Stephen). Astra's R9 cut rules for any
placeholder tile (the 16 hex palette, 16 px cells).

## THE STEPS

**Step 0. FILM STOCKS (M; "a way to change biomes").** The develop screen gets a stock row above Develop: Auto, Attic,
Frost, Deep, Overgrowth, Ember (placeholder: six 48 px film box buttons in the frame's palette with the name under each;
Astra draws the boxes). The chosen stock writes the record's biome byte at capture (b[6] = 1 to 5; Auto = 0 = today's
vote), so biomeFor already honours it, the sim is untouched, and every shared code carries the stock with no new flag.
A locked stock shows a lock and the rank that opens it (step 1; tonight Auto and Attic are open, the rest lock to rank).
The save remembers the last stock (doc.settings.stock) and the Daily ignores it (the Daily's biome is the Daily's).
Lint. ONE shot of the develop screen: describe from the shell.

**Step 1. RANK (M; "level up their character").** XP from the stats the save already keeps, so every existing player
ranks at once and nothing is backfilled: clears * 20 + houseClears * 100 + flawless * 15 + keys * 5 + min(wallJumps,
500) + albumPages * 10. Ten ranks, the camera register: Shutterbug 0, Snapshot 150, Focus Puller 400, Darkroom Hand 800,
Exposure 1400, Lensman 2200, Developer 3300, Enlarger 4800, Archivist 6800, The Light 9500. A reward at each rank up,
granted once (doc.rankSeen): 2 Frost stock; 3 Deep stock and a look (lookPrize); 4 Overgrowth stock; 5 Ember stock and
a look; 6 a frame (lookPrize's next frame); 7 a look; 8 a frame; 9 a look; 10 the last look. The title shows the rank
name and a bar to the next (placeholder: text and a 2 px bar in the strip's style); the clear card adds one line
"+n XP, m to <next rank>"; a rank up plays as the strip's floor text pattern (2.5 s) naming the rank and the reward.
Lint. ONE shot of the title with a ranked save: describe from the shell.

**Step 2. PRINTS (L; "unlock collectibles", the reason to shoot the next room).** FLAG_R10 = 8 joins FLAGS_KNOWN
(captures and the Daily carry it; an older code keeps its room; an older client refuses a newer code as today). Under
the flag a room rolls ONE print at 30 percent from its own seed stream, placed by the features pass on a photo cell the
bug can stand on, at least 2 cells off the climb's standing cells and outside 2 of spawn; no such cell, no print. The
print is a pickup (fx_pickup, the pickups say what they are: "A print: The Dusty Globe"). Thirty prints, six a biome,
drawn from the biome's six by the room's seed (the appendix names them). The album gets a COLLECTION page: five rows of
six slots, a silhouette until found, the name under a found one; a full row unlocks that biome's frame (add
frame.attic, frame.frost, frame.deep, frame.overgrowth, frame.ember to LOOKS.frame if absent) and a trophy (prints_attic
... prints_ember, five rows in TROPHIES). Placeholder pickup: a 16 px polaroid in the palette tinted by biome with a
one digit index; the album tile 48 px the same. Lint. ONE shot of the collection page with two found: describe from
the shell.

**Step 3. Stamp sb-m2-13 and the line (S).** The no browser check once (3 minutes). The stamp commit (BUILD, sw.js ?v,
CACHE together). The wrapper /home/codespace/sb-drafts/sb-m2-13/deploy-sb-m2-13.sh in the pattern of sb-m2-12's. Dry
run OK. The line into START-HERE.md: `! bash /home/codespace/sb-drafts/sb-m2-13/deploy-sb-m2-13.sh`

**Step 4. FOUR NEW VERBS, kinds 21 to 24 (L; only if the clock allows, else the next session).** Behind FLAG_R10, in
the R9 pattern (sprites.json entries through the cutter, MAX_SPRITES raised, placeholder tiles in the palette for both
sizes, the elite 24 px), four behaviours that are new verbs, never recolours: the LOBBER stands and lobs a pellet in an
arc toward the bug every 2 s (the pellet a proj through the box hit path); the DROPPER hangs under a solid cell and
drops when the bug passes within 2 cells under it, then climbs back over 2 s; the SHELLBACK walks, a hit from its front
bounces the bug a cell back and does nothing to it, a dive from above or a hit from behind kills; the SPLITTER is an
elite body whose first hit splits it into two fodder that run apart. By biome: Lobber Attic and Ember, Dropper Deep and
Overgrowth, Shellback Frost and Ember, Splitter any. The R9 roll (50/30/10/10 on its own stream) extends to them; a
room of three or more meets at least one. H-mon rows for each. Lint, the no browser check, stamp sb-m2-14, its
wrapper and line.

## APPENDIX: THE THIRTY KEEPSAKES (six a biome; Astra draws them in round 10; the game calls them keepsakes because the Darkroom's developed blueprints are already its prints)
Attic: The Dusty Globe, A Doll's Eye, The Stopped Clock, Grandmother's Fan, The Tin Soldier, A Moth in Amber.
Frost: The Frozen Key, A Snow Globe, The Blue Bottle, The Icicle Comb, A Lost Mitten, The Last Match.
Deep: The Glass Float, A Ship in a Bottle, The Anchor Charm, A Pearl Button, The Diver's Watch, The Conch.
Overgrowth: The Seed Packet, A Pressed Fern, The Garden Gnome, The Watering Can, A Snail Shell, The Thorn Crown.
Ember: The Brass Lantern, A Matchbook, The Kiln Key, The Ash Jar, A Red Thread, The Coal Heart.

## RULINGS (Stephen, 7 Nov 2026 ~15:40 UTC; the DECISIONS list below is answered)
1. No permanent heart at rank 8. Rank rewards stay films and looks.
2. Rank names and keepsake names stay as written ("extra at this point").
3. The strip's Polaroid keeps the photo (the grid was "filler").
4. No tripod in house rooms (as today). FREE PLAY: he did not know what the tripod camera is ("when you touch it it goes
   off, not sure what it's doing"): it is the checkpoint, lit when the bug first stands on the first landing, and a
   death offers Back to the tripod with every heart. It must SAY so once (the teaching step below).
5. Replayability: three medals a room by time or steps is "not a bad idea", low weight, keep the idea; a weekly house
   later; named combos only if they are weapon combos. Not built this round.
6. Astra's ten ideas: YES to the collapsing staircase (c), the Loom's cut strands as swinging footholds (e, he reads it
   as swinging or moving platforms, "sounds cool"), the window crosswind (f, "diversity, a feel change"), and a
   guardian whose attack changes as its health goes (i, "two or three phases, at least two"). NO to the side route (a,
   "glitches, generic"), the replay silhouette (b, "muddle"), the shutter beetle (d), the expedition (g, packs later),
   the clue to the last keepsake (h, keepsakes are not the focus), the contact print (j, storage). The four yeses are
   round 11 work (art from Astra for the staircase and the strands; the crosswind and the phases are code).
7. TEACHING (his ask, "needs to be articulated to players at least once"): a tester did not know the bug can wall
   jump, drop through a platform, or hold jump to go higher. Step 5 below teaches each once, at the moment it applies,
   plus the tripod when it lights.
8. The film box row: no opinion; stays.

**Step 5. TEACH THE MOVES (M; sb-m2-16, after step 4).** Four one line hints in the strip's floor text pattern, each
once per save (doc.onboarding.hints): HOLD JUMP ("Hold jump to go higher", the first jump that lands), WALL ("Jump off
the wall", the first wall slide), DROP ("Hold down and jump to drop through", the first stand on a one way tab with
nothing under), TRIPOD ("The tripod: a fall brings you back here", when it lights). Never in a house room, never
twice. Lint, the no browser check, stamp sb-m2-16, its wrapper and line.

## DECISIONS for Stephen (built as written until he says otherwise)
1. Rank rewards are access and looks only (default). A permanent heart (+1 heartsMax at rank 8) is his call; the ramp's
   attrition was tuned at four.
2. The rank names and thresholds above (his to rename; the camera register is the brief's).
3. The print names above (his to rename before Astra draws them).
4. The stock row lives on the develop screen (default); the title's settings could hold it too.
5. Kinds 21 to 24 may wait for Astra's art rather than ship as placeholders (default: placeholders, then her art).
6. Astra's ten round 10 ideas (docs/briefs/shutterbug/round10/astra/ASSESSMENT.md): a side route to each keepsake, a replay silhouette of the best climb, a collapsing staircase, a shutter beetle, the Loom's cut strands as footholds, a crosswind from bright windows, a one stock expedition, a clue to the last missing keepsake, a guardian's last part changing its attack, a contact print of a flawless room. None built; his yes per line.
