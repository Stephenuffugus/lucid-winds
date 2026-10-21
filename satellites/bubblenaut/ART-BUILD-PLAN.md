# BUBBLENAUT art build plan (Fable, 20 Oct 2026, for Opus to build)

## BUILT 20 Oct 2026 (Opus), and where it departs from this plan, on purpose

Every chunk below was built in order, looked at on 412x915 and 375x667, committed and pushed; then two
independent reviews (eleven confirmed findings, all fixed but one reported, see the commits).
Departures from the plan, each for a measured reason:
- **One scale per strip, measured.** Astra drew every strip at its own size (Pip's die at 0.47x his idle,
  Bolt Bucket's turn 1.4x its slide, Comet Chomp's leap 0.5x). `tools/bncut.py` gets each strip's scale from
  SIFT matching with RANSAC against the character's reference frame (checked on Pip against his head's area,
  agreeing within a few percent); outline width does NOT follow scale. Cached in `tools/registration.json`.
- **Tight packing with a per frame anchor**, not equal 128 cells: same result, smaller atlases.
- **Lossless WebP everywhere**, not JPG q80: Stephen's standing rule against recompressing his art. art/r1
  is about 7.7 MB, about 1.2 MB per world, about 3 MB before the first room.
- **A light scrim on each plate** inside the playfield (0.22 to 0.34): green Crater Hop on a green cave.
- **No baked outline:** the art's own dark outline reads; the scrim did the separating.
- **Ground = touched within 70 ms** for the art: the physics flags ground one step in four standing.
- **wallNudge:** sprites wider than their colliders are held back from walls (draw only, at most 10 css).
- **Moving things are clipped below the ceiling row**, so wrapping critters drop out from under it.
- **Title:** dark glass buttons over the painting (no filled slabs), Collection, How to play and Settings
  in one row. **Wave** is on the how to play screen (the title painting already shows Pip).
- **Arcade card:** the new icon under a NEW name, `portal-assets/thumbs/bubblenaut-v2.webp`.
Open calls for Stephen are at the bottom of this file and in START-HERE.md.

Astra delivered all 79 source masters on 20 Oct in two zips, now on disk (git ignored):
`assets/BUBBLENAUT-Main-Assets.zip` (60) and `assets/BUBBLENAUT-Remaining-19-Assets.zip` (19).
Unzipped copies and two contact sheets are in the lead scratchpad
(`.../scratchpad/bn-main/`, `.../bn-rest/`, `contactA.jpg`, `contactB.jpg`). Unzip again into a
fresh empty dir if those are gone. Stephen's rulings and the open calls are at the bottom. Build in
the order below, ONE CHUNK AT A TIME, and LOOK at a screenshot after every chunk (CLAUDE.md
"LOOKING IS PART OF THE JOB"). Deploy when green without asking; tell him after.

## What is in the zips (verified by measurement, every PNG opens)

| group | files | master size | key | notes |
|---|---|---|---|---|
| hero (Pip) | 12 strips | 2172x724 | GREEN ~(15,242,15) | backpack has pink reflections, hence green |
| enemies | 43 strips | 2172x724 | MAGENTA ~(237,13,240); Rust Belt GREEN | 9 per world; Rust Belt 7 (flyer: no fall, no turn) |
| enemy designs | 5 | 1536x1024 / 1774x887 | magenta (rust: green) | side + front, the reference per world |
| effects | 4 strips | 2172x724 | magenta | fx_pop 5, fx_escape 5, fx_dust 4, fx_glint 4 |
| pieces | 7 sheets 2x2 | 1254x1254 | magenta | per world: ledge, wall block, capped block, deco; treasures a+b |
| backgrounds | 5 | 1024x1536 | none (opaque) | dark caverns, crop to 9:16 |
| promo | title 1024x1536, banner 1536x1024, icon 1254x1254 | none | text free |

Every master is RGB with NO alpha. The key colour is NOT exact (measured corners above, varies
+-10 per channel), and frames are NOT evenly spaced. Astra measured every frame:
`notes/source-frame-measurements.json` (hero: list of 12, each `frames[].source_slice`
and `foreground_bounds`), `notes/main-frame-measurements.json` (enemies: `regions[]`) and the
remaining pack's `notes/source-measurements.json` (fx + pieces). USE THOSE SLICES. Never cut
equal cells. Astra's per sheet fps / loop / event frame tables are in `notes/ASSEMBLY.md` (hero)
and `notes/MAIN-ASSEMBLY.md` (enemies) and the remaining pack's `notes/ASSEMBLY.md`; copy them
into the atlas JSON, do not retype from memory.

## The game it goes into

`satellites/bubblenaut/index.html` (67 KB, one file). Canvas 540x960 CSS, DPR capped at 2
(line ~1042). Field: TILE 36, 15x19 cells, FY 90. Player collider 26x30, critter 26x26
(`mkPlayer`, `mkCritter` ~445-455). Draw: `render()` ~755 (gradient sky + 46 star dots, tiles:
'#' solid block, '=' capsule platform), `drawAlien` 829, `drawMiniAlien` 856 (lives), `drawCritter`
864 (shape per world), `drawBubble`, `drawTreasure`. Shoot: `shoot(p)` 640, bubble spawns at
`p.x+p.face*22, p.y-p.h*0.62`, cooldown 0.42. Bubble holds a critter: `b.holds`, radius 19,
escape at `holds.t>7` (`escapeBubble`, respawns ANGRY). Angry critters: `b.angry` (1.5x speed,
red glow). World brains (~726-744): 0 Moss hops (`hopT`), 1 Crystal drops through thin ledges,
2 Rust flies a sine lane and bounces off walls (`anchorY`), 3 Frost dashes (`dashT`), 4 Magma
homes on the nearest player. World table ~346: names, treasure names (Sunfruit, Geode, Star Cog,
Frost Pearl, Ember Opal). No service worker in this game; the catalog url is
`/satellites/bubblenaut/?v=2` (portal/catalog-tags.json ~2887): bump to `?v=3` in the deploy
commit and grep for any other stamp (feedback_new_files_under_an_old_stamp_split_your_players).

## Mapping, decided

Hero sheets -> player states, driven by what the physics already knows (never add input lag):
idle (vx~0, ground), run, jump (on accepted jump, hold frame 4), fall (vy>0 airborne), land (on
real ground contact, 3 frames, fire fx_dust at contact), blow (on shoot: enter at frame 2 so the
bubble leaves at once, recover 3-4), turn (face flip, 3 frames, reversed for left), hurt (life
lost), die (last life, hold 6), respawn (frame 3 = contact), cheer (room clear, loop twice),
wave (title screen only). Facing left = mirror the strip; mirror the muzzle anchor too. Pip
fires from the BLASTER in his hand, not the mouth: move the bubble spawn to the blaster tip
(measure it on hero_blow frame 2 after cutting; it is roughly chest height, ahead of the body).

Enemy sheets -> critter states, per world. Move loop: moss `walk`, crystal `run`, rust `fly`,
frost `slide`, magma `walk`. Special: moss `hop` (push off 2, land 6, physics owns the arc),
crystal `drop` (collider switch at frame 2), rust `bounce` (wall hit, ends facing the other
way, replaces turn), frost `dash` (loop only while dashT>0), magma `leap` (when it lunges; if the
homing brain has no lunge, play leap on direction change toward a player). Angry loop:
`angry_walk/run/fly/slide/walk`. `fall` (airborne, 2 frames, not Rust), `turn` (3 frames, not
Rust). In a bubble: `trapped` loop (holds.t<=5), `struggle` loop (holds.t>5), `escape` once at
7 s (do not delay the gameplay release), `popped` once on pop (character gone by frame 4; spawn
the treasure ONCE at the pop event). The trapped/struggle sprite is drawn INSIDE the bubble,
scaled to fit the 19 px radius (about 30 px tall), the bubble ring on top.

Treasures: pieces_treasures_a = Sunfruit, Geode, Star Cog, Frost Pearl (TL, TR, BL, BR);
pieces_treasures_b = Ember Opal (TL), bubble highlight crescent (TR, optional, over drawBubble),
Pip head (BL, replaces drawMiniAlien for lives; P2 lives tinted pink), specimen jar (BR, the
collection screen). Pieces per world: TL long ledge (for runs of '='), TR wall block ('#'), BL
capped block ('#' with '.' above), BR decoration (no collision, 1-2 per room at seeded spots).
Backgrounds: one per world behind the field (crop the 1024x1536 master to 864x1536 centred,
scale to 540x960, JPG q80, must land under 150 KB each: reference_thumbnail_perf). Effects:
fx_pop at pop, fx_escape at escape, fx_dust at hero land, fx_glint looping on treasures.

## Runtime sizes

Pack equal cells of 128x128 (hero and enemies and fx), feet on y=116 for grounded frames
(Astra's target), draw the hero at about 46 px tall on the canvas (1.3 tiles; scale ~0.36) and
critters at about 40 px; the DPR 2 canvas shows them at 92 and 80 device px, so 128 cells are
plenty and nothing is upscaled. Scale per CHARACTER from its neutral frame (idle / the move
loop's frame 1), never per frame bounding box (that inflates crouches). Keep Astra's relative
vertical offsets for airborne frames (jump, hop, fall: align the body root to the adjacent
grounded frame, not the lowest pixel). Colliders stay 26x30 and 26x26: the art is bigger than
the box on purpose; do not grow the boxes. Strips: hero 12 files, enemies 43, fx 4, all
<=1536 px wide (6 frames x 128 = 768; the host optimizer resizes anything over 1600).

## Build order (each chunk: cut, wire, screenshot at 412x915 AND 375x667, look, commit, push)

0. VAULT the two zips as the release `vault-20261020-bubblenaut-astra` in the PRIVATE
   lucid-winds-vault repo (originals first, reference_cross_repo_push). Copy ONLY the notes
   (md + json, no PNGs) into `satellites/bubblenaut/art-notes/`. Never shrink or overwrite a
   master; web copies are new files under `satellites/bubblenaut/art/`.
1. Write `satellites/bubblenaut/tools/bncut.py` (start from
   `satellites/dewball/tools/forge/sheetcut.py`: border colour read from the sheet, background
   = pixels within tol of it AND connected to the border via flood fill, `--holes` for enclosed
   key between legs). Add: slices from Astra's JSON, tol ~60 on the RGB distance, DESPILL
   (on edge pixels with partial alpha, pull the green or magenta channel down to the mean of the
   other two), a baked 2 px dark outline (dilate alpha, fill #10131a at 85%, composite under)
   so cyan and ice enemies read on the blue caverns, per character scale, feet baseline, equal
   cell packing, and an atlas JSON per strip `{frames, fps, loop, event, feet}` copied from
   Astra's tables. Pilot on hero_idle, hero_run, enemy_moss_moon_walk, enemy_moss_moon_hop:
   write a contact sheet, LOOK at it (fringe? halo? feet drift? frame 1 of hop scaled wrong?).
2. Hero in the game. A tiny sprite layer: `loadStrip(name)` -> Image + atlas, `anim` per actor
   {name, t, frame, done}, `setAnim(actor, name, force)`, draw with drawImage (mirror on
   face<0). Keep `drawAlien` as the fallback until the strip has loaded. Move the bubble spawn
   to the blaster tip. Play a round yourself (headless Chrome, real taps, never el.click()):
   run, jump, fall, land, blow, hurt, die, respawn, cheer. Screenshot each.
3. Enemies, one world at a time, Moss Moon first; then the bubble states (trapped, struggle,
   escape, popped) which are shared code. Look at Crystal and Frost on their backgrounds for
   legibility; if the outline is not enough, dim the background 30% behind the field.
4. Backgrounds + pieces. Cut the 5 backgrounds (no key). Pieces: ledge as 3-slice (left cap,
   repeating centre, right cap) per run of '=' at the capsule's height; wall blocks scaled
   36x36; capped block where the cell above is empty; one or two decorations per room at
   seeded spots, no collision (bn_validate_maps.js must still pass). The platforms MUST still
   read on top of the painted cavern: shoot the darkest room of each world and say so.
5. Treasures, lives (Pip head), jar on the collection screen, fx strips, bubble crescent.
6. Title art on the title screen (text and buttons are live UI on top of it; the bottom 40% is
   clear for them), app icon -> icon-192 / icon-512 (check the mask), og image from the
   banner, store banner parked under `store/bubblenaut-play/` for the Play listing later.
7. Deploy: bump `?v=3` in the catalog and any other stamp in the same commit, push, then prove
   it from a persistent Playwright profile on BOTH origins (lucidwinds.com and www.) with the
   old worker held (feedback_verify_on_a_device_with_the_old_worker), and tell him.

## His rulings already in force

- Sprites on magenta, green where the design has pink: that is what arrived. No mascot, no
  famous character likeness: Astra's notes say none.
- Player 2 = the hero recoloured pink by the game after keying (hue shift the whole sprite,
  orange -> pink; the cyan boots may shift too, acceptable).
- The optional 20 room backgrounds and the bonus mode (power ups, bosses, 8 way aiming) are NOT
  in this pack and not in this build. `notes/LEVEL-DESIGN.md` (a 25 room redesign) is a design
  handoff only; the game already has 25 rooms; park it.
- Names in the pack ("Pip", "Cosmic Crew") are Astra's; the game names nothing. Bubblenaut
  stays a working title.

## OPEN CALLS FOR STEPHEN (do not block the build; build with what arrived)

1. THE CAST. Astra built FIVE DIFFERENT enemies (Crater Hop, Moon Mite, Orbit Jelly, Bolt
   Bucket, Comet Chomp) and says Jessie approved them. His 20 Oct ruling was "the antagonist is
   the enemy in every world, five variants of ONE character". The art is five characters. He
   confirms, or the enemies get redrawn.
2. WORLD SKINS recolour each enemy away from the concept sheet (purple Crater Hop is green on
   Moss Moon, orange Bolt Bucket is ice white on Frost Ring, the Rust Belt jelly gets a copper
   band). Jessie has not seen these. Show him `designs/` before the enemy chunk ships.
3. Jar and bubble crescent are optional polish; drop if they fight the screen.
