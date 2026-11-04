# SHUTTERBUG m2 BUILD PLAN (4 Nov 2026) — Fable with Stephen: the room you can read

Shutterbug lives at `satellites/shutterbug/` (DESIGN.md is the ruled design; HANDOFF.md the in folder state; the
served set is index.html, manifest.json, sw.js, icons/). LIVE is sb-m1-22 (main 6d5a42f31). Stephen: "I think its
close to publishing quality but i think we could expand and improve a little more ... the main mechanic of shooting a
room and it becoming levels is actually brilliant ... the gameplay is leaving a little to be desired ... lets make it
great." Fable's read of 4 Nov (shots in `/home/codespace/sb-drafts/fable-look/`, the title, the sample climb, and the
store shooter's six real screens): the hook and the meta are there; the climb is flat because the photo vanishes
into grey masses once play starts, the bug and enemies are 12 px specks, the one way tabs are 2 px strips, the climb
is a column of tabs with no landing and no set piece, a quarter of the screen is blank control strip, and pickups
and hits are quiet. He agreed: "your assessment is pretty on point".
Astra's round 8 brief (`satellites/shutterbug/docs/astra/ASTRA-SHUTTERBUG-ROUND8-NOV04.txt`) asks for the art this
plan draws with: the big bug (16x24 over the 12x16 hitbox), bold tabs and landing ledges, the tripod, the film strip
platform, the fan, the key glint, the Polaroid frame, the juice fx, a bold pass on the enemies. ROUND 8 LANDED
the same day (vault `shutterbug-astra-round8-20261104`, sha256 094ba9fe...; unpacked by the cutter's intake at
`/home/codespace/sb-drafts/astra/round8/pack/`, its NOTES.md, manifest.json, skin_bindings.json, import_groups.json
and hero_body_masks.json copied to `satellites/shutterbug/docs/astra/round8/`). All five sections came: 42 strips,
386 frames. The cutter's check cut everything but three effects that are not square (fx_wind 16x48, fx_land_dust
16x8, fx_floor 48x16): widen the cutter's effect rule for those three keys (the way FX_PLAIN admitted
fx_beacon_refuse), not the art. So every step below splices ITS OWN strips through the cutter as it goes (intake is
done; `check` and `splice` per step), and step 6 is the big bug alone. Read NOTES.md before step 1: the hitbox and
draw offsets per pose family, the Polaroid aperture (x 6, y 6, 60x72), the tripod's flash origin, the wind column's
placement, and the skin binding by skin_id (never by strip suffix).

## STATE (the builder updates this block; one line per step)

| Step | State | Stamp | Commit | Note |
|---|---|---|---|---|
| 0 | TODO | | | |
| 1 | TODO | sb-m2-1 | | |
| 2 | TODO | sb-m2-2 | | |
| 3 | TODO | sb-m2-3 | | |
| 4 | TODO | sb-m2-4 | | |
| 5 | TODO | sb-m2-5 | | |
| 6 | TODO | sb-m2-6 | | |
| 7 | TODO | | | |

## THE LAWS (Stephen's standing orders; they override anything in the proposals)

1. Code directly in the one session. No Workflow, no lanes, no subagents, no review agents, no redwatch mutants.
2. THE TESTING LAW. Per step: `node satellites/shutterbug/tools/check.js --fast` (the lint and the fast harness,
   what deploy.sh runs; minutes). Before EVERY push: `SWS_NO_BROWSER=1 node satellites/shutterbug/tools/check.js`
   once (about 3 minutes; it is what CI runs, and a red push emails Stephen). A visual step: ONE shot of THAT screen
   (the real room climb: `node store/shutterbug-play/shoot.mjs --only 2`, which writes
   store/shutterbug-play/raw-r7/2-climb.png, then `git checkout -- store/shutterbug-play/raw-r7` so the committed
   raws stay; or the sample room: `node tools/shutterbug-tests/shots-play.mjs <outdir> mid:420 --sizes=412x915`),
   then OPEN it and write three things wrong in one line. One browser at a time: wrap browser runs in
   `flock /home/codespace/sb-drafts/browser.lock`. Never re-run a green to confirm it.
3. Never push main. Never run a deploy. Every step is a stamp (`BUILD = 'sb-m2-<n>'` in index.html and sw.js,
   `CACHE` `shutterbug-v<22+n>` in sw.js, `?v=<22+n>` on the sw.js registration; bump all three together) with its
   own deploy script `/home/codespace/sb-drafts/sb-m2-<n>/deploy-sb-m2-<n>.sh` copied from
   `/home/codespace/sb-drafts/sb-m1-22/deploy-sb-m1-22.sh` (the flock, the diff guard against the stamp commit, then
   `BUILD=... CACHE=... SWV=... tools/shutterbug-tests/deploy.sh`). Stephen runs `! bash <script>`. Commit and push
   `add-sproing-jumper` after EVERY step; the box can stop.
4. The sim stays pure. Nothing from the photo, the camera or the art enters `core`; replays and the harness fixtures
   stay byte identical unless a step says it changes placement (step 3 and 4 do, through the seeded generator, and
   then the fixtures are regenerated and the route score asserted). No `Math.random`, no `Date.now` in the sim.
5. Never change a saved or shared shape without a version: the level record stays v1 (the grid, focal, mode), the
   save `shutterbug.v1` gains keys only, the share link format stays. Photos NEVER persist: not in the save, the
   album, the share, the service worker, or a blob URL that outlives the session. The share sheet's sentence stays
   true: it shares the 16 colour grid, not the photo.
6. The copy law: no dashes of any kind and no exclamation marks in anything a player reads; the game's fonts (VT323,
   Hanken Grotesk); 48 px targets, the stick zone is the whole left side of the strip (his ruling) and nothing new
   may steal a touch from it or from A and B.
7. The cutter's law for art: Astra's strips go in through `python3 -I tools/astra_cut.py` (intake, check, splice),
   never pasted by hand; a new key is registered in the cutter's NEW_KEYS and in `test/astra_fixture.py`'s map; a
   line a redwatch row anchors on is re anchored (`node satellites/shutterbug/tools/redwatch.js --anchors`).
8. Notes: one line per step in the STATE block and one line in START-HERE.md; the PROGRESS.md entry stays one
   paragraph. No essays.
9. Scope is this plan. Not the comic reel, not new modes, not Negatives, not the store listing (its own milestone
   after m2), nothing from the DECISIONS list.
10. The box has a hard 12 hour life from boot: read it, `date -u -d @$(awk '/btime/{print $2}' /proc/stat)`, add
    12 h, and stop 40 minutes before with START-HERE written, whatever step you are on. Step 5 is dropped first.

## THE STEPS (in order; each ends green, stamped, committed and pushed, with its deploy script written)

**Step 0. Prep (15 min).** Read DESIGN.md sections 3, 4, 5, 6.11, 8 and 11, HANDOFF.md, and START-HERE's Shutterbug
entries of 3 and 4 Nov. `pgrep -f "http.server 8777" || (cd /workspaces/lucid-winds && python3 -m http.server 8777
>/dev/null 2>&1 &)`. `mkdir -p /home/codespace/sb-drafts/m2`. Run the fast check once (green today). The before set
is `/home/codespace/sb-drafts/fable-look/` (title, climb x3, the six real screens). Note in STATE the LIVE stamp and
main's index blob (`git rev-parse origin/main:satellites/shutterbug/index.html`).

**Step 1. The room stays in the frame (sb-m2-1, M).** The cropped photo is already a bitmap in memory for the reveal
(`createImageBitmap` with the EXIF orientation, index.html near line 5170). Keep it for the room's lifetime (it is
dropped on Title, on a new photo, and never written anywhere) and draw it behind the grid during the climb: scaled to
the world (384x768), at about 45 percent opacity with its contrast pulled down (a canvas filter or a pre dimmed copy
drawn once), open cells showing it, solid cells drawn over it at full, the biome's tint on top as today. Rooms with
no photo (sample, Level code, Daily, a resumed house after reload, the album's replays) draw as today. A setting
"Photo behind the room", on by default. The Polaroid in the strip: Astra's `polaroid_frame` (72x96, aperture x 6, y 6, 60x72) at the top centre of the
control strip, `pointer-events: none`, the room drawn into the aperture each frame (the grid thumbnail, or the photo
while it exists; a 384x768 room fits as 36x72, centred) with `hero_dot` and `beacon_dot` (4x4, centre pivots) and the
keys as `hud_key`; it hides at widths where it would touch the stick hint (360). Splice polaroid_frame, hero_dot and
beacon_dot through the cutter in this step. Nothing
in this step touches `core`. Gate: fast check; ONE shot: the real room climb at 412, and the same via shots-play at
360 (`--sizes=360x780`) because of the strip; look at both.

**Step 2. Readable (sb-m2-2, S/M).** Splice `tab_bold` (16x8, plain and lit; its collision top stays at local y 0 and
a one way never becomes an 8 px solid) and draw every film tab with it; every solid cell gets the 1 px darker outline
DESIGN 11 asks for; splice the bold pass on the ten enemy keys (whole key replacements, same sizes and frame names);
the exit beacon and keys get a 2 px halo. A camera setting "Zoom: close": the world rendered at 2x with the camera following the bug
sideways too (viewport 192x320 game px, integer scale, the bug kept at 60 percent down and centred within 3 cells),
off by default, no change to the sim or to replays. Gate: fast check; ONE shot: the sample climb at 412 with the
zoom on and off (two files, one look).

**Step 3. The climb's shape (sb-m2-3, M; this changes placement, through the seed).** Three floors: rows 0 to 15
the floor, 16 to 31 the furniture, 32 to 47 the ceiling. At each boundary the generator guarantees a landing: a run
of four standable cells reachable from the main ascent, placed on the photo's own solids where a run exists within
two rows of the boundary, else a film tab ledge. A tripod checkpoint stands on the first landing: in free play, the
Daily Room and Level code a death respawns at the lit tripod with keys and loot kept (a house run keeps its rule: the
run ends, Retry House replays). Keys move off open tabs into the furniture: each key sits in an open cell adjacent to
a landmark solid, reachable, never on the main ascent's safe cells; `key_glint` (16x16, 6 fps, centre pivot) marks
it. Splice `ledge` (16x8, five biomes, four tiles make a landing), `tripod` (16x32, bottom centre pivot; unlit until
passed, then flash0, flash1 at 12 fps, then lit) and `key_glint` in this step. The harness: every fixture room still completable, the route score still met, the floors asserted
(`floors` gate: three landings, the tripod on the first, keys adjacent to solids); regenerate the fixtures' expected
hashes in the same commit and say so in PROGRESS. Gate: fast check; ONE shot: the real room climb; look for the
landings on the furniture.

**Step 4. Set pieces on the furniture (sb-m2-4, M; placement, through the seed).** At most two per room, from the
features table's spirit (DESIGN 6.11), never intersecting the main ascent's safe cells, deterministic from the seed:
the moving film strip (a 3 cell one way that travels 4 cells sideways on a 3 s cycle; placed across a gap in the
furniture floor), the fan (a 3 cell updraft column above a floor cell that lifts the bug 2 extra cells while inside,
2 s on, 2 s off, telegraphed by the blades), the crusher that exists already (trap fields, unchanged). Splice `film_strip` (48x8, a and b at 4 fps; code moves it and carries the bug), `fan` (16x16, 12 fps, bottom
centre pivot) and `fx_wind` (16x48, 8 fps; its bottom centre meets the fan's top centre, drawn at the fan's [0, -48];
widen the cutter's effect rule for this key). The harness asserts completable with them on and off cycle. Gate:
fast check; ONE shot: a room with a film strip in frame (use the sample room if the real one has none; say which).

**Step 5. The juice (sb-m2-5, S; dropped first if time is short).** A pickup burst on specks and keys, a 0.2 s hold
and flash on a key, the enemy hit flash that exists on every hit, a dust puff on landing, the camera leading the jump
(it looks 1.5 cells ahead vertically and settles in 6 frames), the floor shimmer and a one line floor name in the
strip when a new floor is reached ("The furniture", "The ceiling"), shake stays under 2 px and only on dive landings
and boss hits (DESIGN 4.4). Splice `fx_pickup` (16x16), `fx_land_dust` (16x8, behind the hero at the feet), `fx_checkpoint` (32x32 at the tripod's
lamp: tripod top left minus 4, 12) and `fx_floor` (48x16, centred on the landing, 8 px up), each played once then
removed; widen the cutter's effect rule for the two that are not square. Reduced motion: no shake, no lead, static
bursts. Gate: fast check; ONE shot: the climb at the instant of a key pickup (shots-play with a step that lands on
a key; say the step).

**Step 6. The big bug (sb-m2-6, M).** Splice the hero: `hero_big` (16x24, the twelve poses), `hero_big_dash`,
`hero_big_hurt`, `hero_big_squash` (20x20), `hero_big_stretch` (14x28), `hero_big_dropin` (16x24 x3), and the sixteen
looks as `hero_colours_big` and `hero_colours_r3_big` (96 frames each: 12 times skin index plus pose) with their
companion dash, hurt, squash, stretch and dropin strips (one frame per skin; dropin three). The hero draws over its
unchanged 12x16 hitbox with NOTES.md's offsets (movement, dash, hurt, dropin: draw at hitbox minus 2, 8; squash minus
4, 4; stretch minus 1, 12; bottom centre pivot; mirror about it), the runtime squash and stretch are NOT applied on
top of the supplied squash and stretch frames, and each look binds by skin_id through `skin_bindings.json`, never by
a strip suffix; the dash and hurt flash uses `hero_body_masks.json`. Save ids, reward conditions and unlocked looks
are untouched. `test/astra_fixture.py` maps round 8 (every new key) and the redwatch anchors are re anchored. Gate: fast check and the astra
gate; ONE shot: the real room climb; look at the bug's feet against a ledge.

**Step 7. The walk, his lines, STOP.** `SWS_NO_BROWSER=1 node satellites/shutterbug/tools/check.js` green. The
store shooter's six screens once (`node store/shutterbug-play/shoot.mjs`, then the checkout of raw-r7), plus the
sample climb at 412 and 360; open every image; one line per screen with three things wrong (or "reads"), under STATE.
The deploy scripts for every stamp not yet deployed are listed in START-HERE in order (one line each); Stephen runs
the latest one, which carries all of them. Then stop.

## DECISIONS for Stephen (not built overnight; Fable raises them in the morning)

1. **The photo behind the room.** Built on by default (privacy intact: the photo lives in memory for the room and
   never persists). He may turn the default off after the Pixel.
2. **Big bug or close zoom.** Both ship (the big bug is in, the zoom is a setting). Astra's own proof says the big
   bug reads at 412 (16x24 CSS px) but is still small on a 320 wide phone (12x19): the zoom setting is the answer
   there. He picks the default on the Pixel.
3. **Checkpoints in house runs.** Free play, Daily and Level code respawn at the tripod; house runs still end on a
   death. His call whether a house gets one tripod per room.
4. **The set piece list.** Film strip and fan now, crusher as it was. A conveyor, a swinging lamp and a gust from a
   window are candidates for m3.
5. **What the Polaroid shows.** The grid thumbnail always, the photo while it exists. If he wants the print to be
   grid only (the shared look), one line changes it.
6. **The store listing** is the milestone after m2: real captures into Astra's six frames, the Play build again, the
   Console upload (his), assetlinks (one deploy line).
