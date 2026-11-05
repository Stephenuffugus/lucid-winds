# SUNFORGE BUILD PLAN (5 Nov 2026): Astra's pack v1, the Sunbreaker skin and the three hooks. Fable with Stephen, for Opus

The game is `satellites/ring-stacker/index.html` (one file, 57 KB, canvas 2D on a 540 by 960 virtual stage, vanilla JS;
the folder keeps its old name, the game is SUNFORGE). Live at lucidwinds.com/satellites/ring-stacker/ in the arcade, open
to players, installable, offline (`sw.js` CACHE ring-stacker-v8, network first; `manifest.webmanifest`; `icons/`).
NOT vendored: edit it here on `add-sproing-jumper`. The Sunbeam SDK is loaded with gameId "ringstacker" (never changes).
Astra's pack v1: `/workspaces/sunforge-astra-v1/pack/` (NOT in git; vault release `astra-sunforge-pack-v1-nov05`, sha256
a5585e72...). Docs mirrored in `docs/briefs/sunforge/astra-v1/` (ASSESSMENT, STYLE-GUIDE, NOTES, manifest.json). Read the
three docs once, then manifest.json's `coordinates`, `ring_index`, `cell_layer_recipe` and every window, band and insets
entry before placing a plate; never infer a rectangle from a thumbnail.
The pick is SUNBREAKER; the name stays SUNFORGE. A white hot square sun in four black turbine jaws, enamel cells in a
welded chassis, one ceramic falling cell, acid yellow #DFFF4F on void #080D15, sky #182431, Barlow Condensed Black for
display and Space Grotesk for live UI (both in the pack with OFL). Stephen's brief asked for "cool, popular, catchy and
edgy"; Astra's own read: a loud shell around a precise quiet puzzle.
What came (130 files, 3 MB; the runtime set is about 400 KB plus 250 KB of fonts): A identity (wordmark svg and png on
dark and on light, icons 192, 512, maskable, feature graphic, promo tile 512, social card, first_frame 900x1600 with the
wordmark and hero baked and the bottom open for buttons, hero_gyre, the fonts); B core (core_states 4 at 256: idle,
charged, crushing, overloaded; corona and heat shimmer layers; rest glow 512); C cells (twelve ring sheets, each eight
64 px frames in this order: single, top, right, bottom, left, inner corner TL, outer corner TL, interior; faces unmarked,
marks, dark marks and weld trim layers for assembly; falling_cell, ghost_cell, stick_flash, sliding_past_streak);
D board (play_plate 900x1600, grid_texture 64, void_edge, sky_clear_flash); E HUD and controls (left, right, rotate,
down, hold, pause at 96 px idle and pressed; slam_idle, pressed, charged 500x144 for 250x72 CSS px; next and hold
frames, score plaque, rings counter, level badge as nine slices, insets left 18 top 18 right 18 bottom 34; three mode
cards with a clear band for the name; four wordless How plates 540x300; 18 svg icons on currentColor); F FX (slam
shockwave, ring crush burst, inward flow, void swallow as 6 frame strips at 256; quarter_turn_spin_01 to 04 as 540x960
overlays at 60 ms each; chain_x2 to x6 callouts; level up and game over plates); G results (game over card frame, share
square 1080 and portrait 1080x1920, daily card, their windows and bands in the manifest); H store (six 1080x1920 frames,
window 100,448,880,1280, headline band 100,150,880,150; never served, the store kit is a later milestone).

## STATE (the builder updates this block; one line per step)

| Step | State | Commit | Note |
|---|---|---|---|
| 0 | DONE |  | docs and manifest read; server on 8777; /home/codespace/sf-drafts; tools/sunforge-tests/check.js (the FF rules plus entities decoded before the emoji test, store art never named, the old name, the saved keys and Sunbeam ids) red at 22 before the build (19 emoji, Ring Stacker twice, zoom off); tools/sunforge-tests/shoot.mjs (title how settings play almost crush gameover daily first) through the EXISTING ?rstest=1 hook (RS_DEV, extended: freeze step flush seedRing put lock drop fill end show) instead of a new ?sftest=1; the frame loop's body is now tick(dt); the dev bot's missing hardDropY fixed; before set in /home/codespace/sf-drafts/before (its crush frame missed: the handle locked in place, drop added after); main's ring-stacker tree 4da73f7e = the branch's; CI runs only the fourteen games with their own tools/check.js, Sunforge is not one |
| 1 | DONE |  | tools/sunforge-tests/astra_in.py (re runnable; python, it needs PIL and fontTools) puts 65 runtime files in assets/ (identity, core, cells as the three assembly atlases plus falling, ghost, stick, streak, board, hud, fx, sharing; no store, previews or docs), 426 KB with the fonts; both fonts subset to Latin woff2 (247 KB to 25 KB, OFL texts beside them); Astra's icons over icons/ plus icon-maskable-512 in the manifest; her social card over og/card.jpg; her promo tile as the 480 square arcade thumb under its old name (95 KB); one inline sprite of her 16 icons plus our sun mark; ART table with ART_V, art(key) null until loaded, CSS gets --a-<key> once loaded, the title's four first; every emoji out (icons or words), Sunforge in the install alert, zoom on, theme void #080d15. Check green (the check now strips CSS comments first). No shot |
| 2 | DONE |  | the title is Astra's first_frame plate (wordmark and hero gyre baked; the code wordmark shows only if the plate fails), the tagline Build. Turn. Collapse. set into the plate's divider rule, the three mode cards at her aspect (168x81, the name and a live line right of the emblem; Journey primary with an acid ring and its level, the Daily's line says Played today in acid once played), How, Music and Settings as icon buttons with words; How is her four plates with one line each and the modes line; Settings has icons, the new Reduced motion toggle (SET.reduce, a new key in rs_set, default from prefers-reduced-motion) and the build stamp (moved off the title); the shell restyled to void, graphite and acid. Check green. Shot title: reads; wrong: the cards' live lines straddled the name band's top edge, the stage letterboxed in navy and black on a tall phone, Daily Gyre touched its card's edge (all three fixed after the shot in CSS, not re shot) |
| 3 | DONE |  | Astra's play plate behind the whole stage (static; the board shakes, not the plate); her grid tile at 0.4 scaled to the cell pitch and pinned to the cells (a pattern transform, so its lines are the board's); the void fade at the window's foot under everything; the corona under the cells (opacity 0.55 to 0.75 over 1.8 s, steady in reduced motion); ring frames quieter over the plate; every landed cell from manifest.cell_layer_recipe (face, seam, a weld trim on each side whose neighbour is not the same ring, rotated inner corner trims, the upright mark), composed once per ring and neighbour pattern at 64 px and drawn as one image at the cell pitch (no gaps, so a ring reads as one welded band); the core's four jaws on top, the frame two cells wide so the jaws span her 1.5, idle, charged when a ring is one cell short (almostRing), crushing during a crush, the shimmer at 0.25; the ceramic cell for all seven falling shapes; her bracket ghost at 0.75, coral when the piece would be lost; the stick flash (6 frames, 120 ms) at the locked piece's centre, carried through the slam's quarter turn; the streak beside a piece that slides past the structure; the sky clear flash on Zen's wind; Astra's ring palette for every code fallback; RS_DEV.art(key,on) switches one image for probes. Check green. Shot play: the plate, the welded bands, the jaws and the ghost read; wrong: a muddy olive patch in ring 1's empty slots (her resting glow plate: yellow at her alpha over navy; dropped, the core frames carry their own glow), the HUD still at 9 to 12 px (step 4), SLAM and the controls still the old skin (step 4) |
| 4 | DONE |  | the HUD left the canvas for DOM in Astra's nine slice frames (her 18 18 18 34 insets at 2x, the cut strip never stretched): row one pause, the score plaque, the hold button, HOLD and NEXT with live previews in the ceramic cell; row two the level badge (LEVEL n, DAILY n, ZEN), the rings counter, the Daily's pieces left, the piece after next dimmed; written only on change; her control skins at 100 stage px (67 CSS px at 360) with pressed states on every finger, SLAM 328x94 stage (250x72 CSS at 412) in idle, pressed and charged (a ring one cell short), the word and the turn icon live; Pause (DECISION 1) with Resume, Retry and Menu, also on Escape or P and when the tab hides; a tap turns the piece only inside the window; the window is 590 tall under the HUD rows (sizes are stage px, which the phone scales, so 72 stage px is 48 CSS px at 360). Found on the shot: removing the canvas header removed render's only var i, so every frame threw (strict mode); declared. Check green. Shot play at 360x780: reads like her mock; wrong: a new piece spawned above the shorter window and stayed hidden two or three drops (now it enters at the window's top edge, its lower row in view), cells were 20 CSS px at 360 (cap raised 30 to 34 stage px, her 26 CSS at 412), the fleet's feedback button touches the turn button's corner (its own hit test parks it off controls; left alone). Not re shot |
| 5 | DONE |  | the almost ring: its outline lit steady in its colour and Astra's brackets in acid on the one missing cell (the core and SLAM charge with it); the crush to her table: the closed band holds 35 ms, then its cells contract toward the sun and fade over 300 ms (her welded sprite), her burst at the band, her inward flow tinted the broken ring's colour at 0.35 while the outside slides in (300 ms); chains x2 to x6 as her callouts at the window's top right for 450 ms (the CHAIN words leave the points line when they load); SLAM: land, 35 ms hold, the quarter turn eased out over 240 ms (cubic), her four streak frames at 60 ms over the window only (the HUD and controls never move), her shockwave at the core (6 at 40 ms); a lost piece: her void swallow at its last place, kept inside the window; Journey's level up and the end of a run on her plates with the live words over their blank centres (the end plate cools the board 0.7 s, then the card; TOPPED OUT or OUT OF PIECES); reduced motion: no turn, no overlays, no shards, no shake, crush and slide in 40 ms each; sound to her notes (a dry click and a falling torque note, the latch at 275 ms, an inward suction then an alloy chime up the chain, a small falling tick for a lost piece). Check green, runtime probe clean. Shot crush: reads (the band contracting, the core crushing, shards, RINGS 1/2); wrong: the points line sat over the board's centre for 1.5 s (moved to the window's foot, 1.1 s), the contracting cells read as dissolving more than as one band (300 ms, kept), her burst is faint at this frame (kept). Not re shot |
| 6 | DONE |  | the result is Astra's card frame (800x1100 at 0.6) over a canvas with the player's REAL last gyre (drawGyre: the grid's welded cells by ring round the core, one empty ring of margin), SCORE, RINGS and LEVEL (or DAILY n, MODE ZEN) in her three bands, Best with the chain, the Sunbeams line, Again (acid), Share and Menu at 72 stage px; Share composes her 1080 square (the Daily uses her daily card with DAILY GYRE n and the date in its band): the gyre behind her window, the words in her bands, then navigator.share with the file after the tap, else a download, else the old text share; the portrait frame is not used (the square shares everywhere) and left the served folder; a Daily run after the day's first completion is a practice run: Again reads Practice run, the line says Practice, and the recorded score, the Sunbeams and the best are untouched; Zen never shakes and its turn streaks are softer; the old label daily n · 80 pieces (the budget is 120) and the tip's markup colour are gone. Check green. Shot gameover: reads (her frame, a ten ring gyre welded in its window, the bands, the buttons in order of weight); wrong: nothing that is the game's (score and rings 0 are the fixture's fill, which scores nothing); the share PNG itself is opened at the walk |
| 7 |  |  |  |
| 8 |  |  |  |

## THE LAWS (Stephen's standing orders; they override anything in Astra's docs)

1. Code directly in the one session. No Workflow, no lanes, no subagents, no review agents, no mutant runs.
2. THE TESTING LAW. Per step: `node tools/sunforge-tests/check.js` (seconds, no browser; made in step 0 from
   tools/ff-tests/check.js). A visual step: ONE shot of THAT screen with `node tools/sunforge-tests/shoot.mjs <outdir>
   <screen>` after all the step's edits, then OPEN it and write three things wrong in one line. The walk (every screen,
   two widths) ONCE at step 8. Never re-run a green to confirm it. One browser at a time.
3. Never push main. Never run a deploy. Commit and push `add-sproing-jumper` after EVERY step. The deploy is one script
   at step 8, run once with DRY=1, its line written for Stephen.
4. One HTML file plus `satellites/ring-stacker/assets/`. Every image loads through one `art()` helper with one ART_V
   token and an image loaded guard; the code drawn fallback stays behind every plate. Icons are ONE inline svg sprite
   (`ic(name)`), never 18 requests. Fonts by @font-face from assets/fonts, never a CDN (the game is offline). Nothing a
   side over 1600 px is served; assets/store/, previews and docs never ship. Budget: the title screen loads under 700 KB
   (plate, wordmark, fonts, icons), the whole game under 1.3 MB.
5. Never change a saved key or id: Sunbeam gameId "ringstacker" and the earn tags, LS keys `rs_*`, the PROG and SET
   shapes (keys may be added), the daily seed formula. The old "Ring Stacker" install alert text becomes SUNFORGE.
6. The copy law: no dashes of any kind and no exclamation marks in anything a player reads; 48 px targets; live labels
   at least 14 CSS px, buttons at least 16, the score 28 to 36 (CSS px on the phone, not virtual stage px; today's
   canvas HUD draws 9 to 12 virtual px, which is 6 to 8 real px: the bug the brief names). Every emoji out (the ☀, the
   🌀, the ✨, the ◎, the ⚙, the ♫) for sprite icons or words.
7. The rules of play are frozen: pieces stick on the core or on stuck cells, sides never grab, no floor, SLAM drops and
   spins the gyre a quarter turn clockwise, ring colour is the ring's not the piece's, ring scoring and chains, Journey
   quotas and speeds, the Daily's seed and 120 piece budget, Zen's wind. Only the hooks this plan names touch play.
8. Notes: one line per step in STATE and one line in START-HERE.md. No essays, no QUESTIONS file.
9. The box has a hard 12 hour life from boot: `date -u -d @$(awk '/btime/{print $2}' /proc/stat)`, add 12 h, stop 40
   minutes before with START-HERE written, whatever step you are on.
10. Scope is steps 0 to 8. The m2 list at the end waits for his pick.

## THE STEPS (in order; each ends green on the check, committed and pushed)

**Step 0. Prep (20 min).** Read the docs named above. `pgrep -f "http.server 8777" || (cd /workspaces/lucid-winds &&
python3 -m http.server 8777 >/dev/null 2>&1 &)`. `mkdir -p /home/codespace/sf-drafts`. Make `tools/sunforge-tests/check.js`
from tools/ff-tests/check.js (default page satellites/ring-stacker/index.html, the label SF, the same rules: every script
block parses, style braces, named assets exist and under 1600 px, no emoji outside comments, the copy law in markup and
prose strings, zoom allowed, manifest parses); run it and note the red count (emoji and copy law reds are expected today).
Make `tools/sunforge-tests/shoot.mjs` from tools/ff-tests/shoot.mjs: 412x915 at 2x with touch, screens title, how, settings,
play (Journey, six slams in), almost (ring 1 one cell short), crush (the frame after that cell lands), gameover, daily
result; driven by a `?sftest=1` hook you add to the game (`window.SF_DEV = { start(mode), seedRing(d, gapAt), place(k,x,rot),
slam(), end() }`, a few lines beside the existing dev counters, inert without the query). Shoot the before set to
/home/codespace/sf-drafts/before/. Note in STATE main's ring-stacker tree hash (`git rev-parse origin/main:satellites/ring-stacker`).

**Step 1. The assets in, the loader, the identity (S; A).** `tools/sunforge-tests/astra_in.mjs` (re runnable) copies from
the pack into `satellites/ring-stacker/assets/`: identity/ (wordmark svgs, first_frame.webp, hero_gyre.webp, promo_tile
for the arcade card), core/, cells/, board/, hud/, fx/, sharing/, fonts/ (the two ttf and both OFL texts); never
assets/store (keep the six frames and feature graphic out of the served folder: `assets/store/` is listed in .gitignore
for this folder or simply not copied), never previews or docs. Astra's icons over icons/ (manifest names kept); the
promo tile over portal-assets/thumbs/ring-stacker.png at that file's size. The one inline sprite from the 18 svg icons
(`i-<name>`, currentColor) and `ic()`. `art(path)` with ART_V. @font-face for Barlow Condensed Black (display: the score,
level and chain callouts) and Space Grotesk (everything live). Every emoji out (a drawn 24 px one colour sun for the
Sunbeam lines, in the icon grammar: 2 unit stroke, square caps). The install alert says SUNFORGE. The social meta
(og:image) points at assets/identity/social_card.jpg. Check green (the emoji and copy reds gone). No shot.

**Step 2. The title that shows the game, the modes, How (M; A, E).** s-title: the first_frame plate as the screen's
background (cover, the wordmark and hero gyre are baked in; the open band at the bottom holds the buttons), the arcade
back button kept, the prose ribbon replaced by one line, Build. Turn. Collapse., the three mode cards (mode_journey,
mode_daily_gyre, mode_zen with the live name in the clear band; Journey stays primary and shows the level; the Daily
shows its tick when played today), How, Music and Settings as icon buttons with words. How: the four wordless plates
with one short live line each (stick, slide past, close the ring, SLAM spins). Settings: icons beside Sound, Ghost
piece, Add to home screen; a Reduced motion toggle added (SET.reduce, new key). Shot: title.

**Step 3. The board, the core, the cells (L; B, C, D).** The play plate behind the board window (PANEL is 524x664 at
8,100 on the 540 stage; the plate's clear central square takes the grid, the void below, the sky above), the grid tile
inside it, the void edge at the bottom of the window, the sky clear flash on a top out. The core: core_states idle at
rest with the corona layer looping opacity 0.55 to 0.75 over 1800 ms (no scale), charged when any ring is one cell from
complete, crushing during a crush, overloaded reserved (DECISION 4); body about 1.5 cells, corona at most 2.5. Cells by
ring: ring d (1 to 11, RMAX) draws from sheet ring_<d>; the twelfth sheet is spare. Each landed cell draws per
manifest.cell_layer_recipe: the face and its mark, then the weld trim for every EXPOSED side (no landed cell beyond it)
and the corner variants (rotated per the manifest; never rotate the mark). The falling piece: every shape in the one
ceramic cell (#F3F0DC, black slash, cream keyline), never PCOLS while falling (PCOLS stay for the fallback). The ghost
hollow with corner brackets. The stick flash (6 frames, 120 ms) at the locked piece's centre; the sliding past streak
when a piece passes beside the structure. The ring outline frames stay but quiet (alpha as today or lower). Cell size:
VCELL tops out at 30 virtual px, about 26 CSS px on a 412 wide phone, the size Astra drew for. Shot: play, six slams in.

**Step 4. The HUD and the controls (M; E).** The canvas header (score, the mode line, NEXT and HOLD) moves to DOM
elements over the stage in CSS px sizes (law 6), on the score plaque, rings counter, level badge, next and hold nine
slices (insets 18 18 18 34; the lower strip is never stretched). The control skins: left, right, rotate, down, hold at
48 CSS px from the 96 px files, idle and pressed; SLAM 250x72 CSS px from the 500x144 skins, idle, pressed, and charged
whenever a ring is one cell from complete (the same test as the core's charged state), with the word SLAM and the
quarter turn icon drawn live over it. Pause (DECISION 1): the pause skin top right, running stops, a plate with Resume,
Retry, Menu; the Daily's budget and the clock stop with it. Targets stay 48 px whatever the glyph. Shot: play at
W=360 (the narrow phone).

**Step 5. The reward moment (M; F).** The almost ring: a steady notch on the missing cell and the ring's exterior seam
lit (no strobe), the core and SLAM charged. The crush, retimed to the motion contract: the completed outline held 35 ms,
the band contracts over 300 ms (the existing popAnim and slideAnim carry it: pop 300 ms, slide 300 ms), the inward flow
strip tinted with the outgoing ring's colour at alpha 0.35 or less, the ring crush burst at the band; chains: the
callout plate outside the falling corridor for 450 ms, x2 to x6, no screen shake beyond today's. SLAM: land, 35 ms hold,
the board's quarter turn eased over 240 ms (spinA today, retimed), the four spin overlays at 60 ms each over the board
window only, the HUD and controls fixed; the shockwave strip at the core. The void swallow when a piece is lost (the
"lost to the void" line stays, no buzzer). Level up and game over plates for 480 ms with the live words over their blank
centres. Reduced motion (SET.reduce): the final state in 80 ms, no overlays, no shake, no shards, the charged rim steady.
Sound per NOTES: SLAM is a dry click, a short descending torque note, one bright latch (retune beep() calls, no new
files); a ring crush a short inward suction and a bright chime stepping up the chain; the lost piece a small descending
tick. Shot: crush (via SF_DEV.seedRing(1, gap) then the filling piece).

**Step 6. Results, share, the Daily (M; G).** The game over screen on the game over card frame with the REAL final gyre
drawn into its window (cells by ring colour from the last grid, the core in the middle), score, best, rings, chain in
the bands, Again, Share, Menu as 48 px buttons in order of weight. Share: share_square (1080) by default, share_portrait
when the system share sheet is absent (download), the gyre in the window, the four bands filled, the wordmark baked;
the Daily uses daily_gyre_card with the date band; navigator.share with the file after the tap, else download. The Daily
after its first completion: Again reads Practice run and the result says Practice, the recorded score untouched. Zen: the
perimeter calmer (no shake, the spin overlays softer), the "wind clears the gyre" line kept. Shot: gameover.

**Step 7. The guided first ring (S; a hook).** On a fresh save (PROG.ringsEver === 0) a Journey game pre builds ring 1
except the cell directly above the core, the first piece in the feed is a T, the notch marks the gap, the core is
charged, one coach line over the board: Close the ring. Drop it on the sun. The crush then teaches itself. The old
go-hint tip text is rewritten without the markup colour span. Shot: the first ring moment (SF_DEV.start('journey') on an
empty save).

**Step 8. The walk, the stamp, the deploy script (M).** Every screen at 412x915 and 320x568, plus the worst angle on
purpose: a Zen board grown to 11 rings at 320 wide, the crush of ring 9, the game over with a 10 ring gyre in the share
window; open every image, three things wrong each, fix, re shoot only the screens the fixes touched. Bump sw.js CACHE to
ring-stacker-v9 (the activate step deletes other caches by name, so keep the ring-stacker prefix) and ART_V.
Check green. The deploy script `/home/codespace/sf-drafts/deploy-sunforge-m1.sh` on the Flatulence Fighter m1 pattern
(/home/codespace/ff-drafts/deploy-ff-m1.sh: the served set of a pinned branch commit, satellites/ring-stacker/** without
assets/store, plus portal-assets/thumbs/ring-stacker.png, on top of origin/main from git objects; STOP if main's
index.html or the thumb moved; DRY=1 before the push; after the push prove lucidwinds.com serves the index hash). DRY=1
once. His line into START-HERE: `! bash /home/codespace/sf-drafts/deploy-sunforge-m1.sh`.

## THE m2 LIST (not built; Stephen picks one or two, then it is the next Sunforge order)

- SLAM with a direction: a swipe on the SLAM bar to the left spins the gyre counter clockwise, to the right clockwise, a
  tap keeps today's clockwise. The tower can be swung to either side; the whole strategy opens up. Small to build.
- Chapter skies: the perimeter tint changes by level band (Astra 7); ring colours never change.
- The hold consequence: a hollow outline of the swapped piece at its real spawn for 300 ms (Astra 6).
- Overload: a charged core that doubles the next chain for one crush, earned by a chain of three (Astra 8, the
  overloaded state is drawn already).
- A weekly gyre: a seeded week long run shared by code, local bests only (no backend; Astra 9).
- The store listing: real captures in the six frames, the Play build, $0.99 or free (his call; Shutterbug's kit is the
  pattern).

## DECISIONS for Stephen (built as written until he says otherwise)

1. Pause: built (a phone game without pause is a store flag; Astra drew the control). He may drop it.
2. The fonts ship in the game (250 KB, offline). The alternative is system fonts and the svg wordmark only.
3. The guided first ring on a fresh save: built. He may prefer the How plates alone.
4. The overloaded core state stays unused in m1 (the m2 Overload item).
5. SLAM's sound is retuned to Astra's note; the old slam sound is one line to restore.
6. The arcade card keeps the name SUNFORGE and the folder stays ring-stacker (a rename moves every install and link).
