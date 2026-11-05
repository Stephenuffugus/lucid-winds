# TOMATO MAN BUILD PLAN (5 Nov 2026): Astra's packs v1 and v2, the Sunstruck look and the first minute. Fable with Stephen, for Opus

Stephen, 5 Nov: "I want Tomato Man built out into a really fun game with incredible looking assets. The thumbnail is
the art reference ... that same strange and almost creepy aesthetic, and the character in the thumbnail to be our main
hero." Astra named the look SUNSTRUCK STOP MOTION: a bleached miniature desert, matte paper and faded canvas, the hero a
mottled tomato head with hollow sockets and low ivory eye slits over a torn seed packet tunic, matchstick limbs, orange
rubber boots. Funny and sad at once; strange, never scary. The joke is his composure.

## THE LANE (read twice; it is different from every other game)

The arcade's `satellites/tomato-man/` is a VENDORED copy of the public repo `Stephenuffugus/Tomato_Man` (VENDORED.json:
commit f0e47a30, 12 files). `node scripts/vendor_satellites.mjs --check tomato-man` reports EDITED on any hand edit and
the next `--vendor` overwrites it. GitHub Pages is ON for that repo and serves its main branch at
stephenuffugus.github.io/Tomato_Man/, so pushing its main is a public deploy too. Therefore:
- `env -u GITHUB_TOKEN gh repo clone Stephenuffugus/Tomato_Man /workspaces/Tomato_Man` (the vendor script expects sibling
  clones under /workspaces), `git checkout -b sunstruck origin/main`; every edit on that branch; `git push -u origin
  sunstruck` after every step. Never push its main. Never touch satellites/tomato-man/ by hand. Both the codespace
  token and his login have push on that repo (checked 5 Nov); if the first `git push` asks for a login, run
  `gh auth setup-git` once and push again.
- The game is `/workspaces/Tomato_Man/index.html` (128 KB, one file, canvas 2D, a 2000 to 2600 px world scrolled under a
  portrait camera; it already uses const, arrows and template strings, so the Lucid Winds ES5 rule does not bind it).
  Beside it: manifest.webmanifest, sw.js (CACHE tomato-man-v3, a precached shell), the three icons, thumbnail.png.
- Art goes in `/workspaces/Tomato_Man/art/<section>/`; the loader already expects art/hero/... and art/ui/logo.png
  (ASSET_PATHS, loadAssets, `A(key)` returns the image or null; a 404 today for logo.png).
- The deploy is his one line at the end of m1, `/home/codespace/tm-drafts/deploy-tomato-man-m1.sh`: (1) fast forward
  Tomato_Man main to the pinned sunstruck commit and push it; (2) in lucid-winds, `node scripts/vendor_satellites.mjs
  --vendor tomato-man` (it reads the REMOTE main, so (1) must land first), which rewrites satellites/tomato-man/ and
  VENDORED.json on the branch checkout; commit that on add-sproing-jumper; (3) the deploy commit on top of origin/main
  from git objects on the Flatulence Fighter pattern (/home/codespace/ff-drafts/deploy-ff-m1.sh): satellites/tomato-man/**
  plus portal-assets/thumbs/tomato-man.png, STOP if main's copy moved since f0e47a30; push main; (4) prove
  lucidwinds.com/satellites/tomato-man/ serves the pinned index hash and the Pages URL does too. DRY=1 checks (1)'s base
  and (3)'s base and stops before any push; the vendor step runs only live.
Astra's packs: v1 `/workspaces/tomato-man-astra-v1/pack-v1/` (304 files, 15 MB, sections A to G, ASSESSMENT,
STYLE-GUIDE, NOTES, manifest.json with anchors, sockets, sheet grids, nine slices, windows) and v2
`/workspaces/tomato-man-astra-v1/pack-v2/` (251 files, 7.6 MB, the expansion: NOTES and manifest.json, sections A, B, C,
E, F only; it does not repeat D and G). NOT in git; vault release `astra-tomato-man-packs-nov05`. Docs mirrored in
`docs/briefs/tomato-man/astra-v1/` and `astra-v2/`. Read ASSESSMENT, STYLE-GUIDE and both NOTES once; then the manifest
entry for every file before you place it (anchor, neck socket, hat anchor, face rect, cell grid, insets).

What v1 brought: A the hero (builder body 512x640 headless with neck socket 256,166; the default head 384 with the face,
socket 192,340, hat anchor 192,76; a faceless head; eight face overlays 256x384 for the 384 head at 1.5x and y minus 96;
the in game bases at 256 cells: idle, walk 4, dash 2, hop, the exposure strip healthy, warm, hot, char, respawn pop,
victory wave; the 13 other produce heads 384 and bodies 256; 12 hats at 384 and at 128 top down; 4 dash trails 4
frames); B the sun (roaming_sun 512, sun_rays separate, sun_position_hud 128, the Angry Sun in four 768 states and one
3072 strip, eclipse_corona 768); C five worlds (ground 512 opaque, horizon 1600x600 webp mirrored repeat, decor sheet
1024 as 4x2 cells of 256x512 plus every cutout, key art 512, card 640x360 webp with a name band) and the shared casters
(striped and solid awning 720x220 pivot top left, cabana, billboard, umbrella 512 pole centred, palm thatch umbrella,
palm top, leaning palm, lifeguard tower, rock arch, cliff overhang, vendor cart 512x320 plus two reskins, cloud platform
and elevator, far silhouette 1600x300 one colour); D pickups (aloe lit and dim, sunbeam and burst, popsicle, ice water,
SPF, shade token, shade pool 512, checkpoint off and on, exit flag, seashell, ice cream, gem, sparkle); E FX (hot sand
patch, heat shimmer, wind streak and arrow, burn smoke, dash puff, collect burst, respawn flash, near burn vignette
540x960, eclipse dark vignette); F UI (logo svg and png on sand and dark, icons 192, 512, maskable, menu plate 900x1600
of the beach with one long cast shadow, 64 svg marks on currentColor, joystick base 256 and thumb 160, action buttons
dash 192, shade, spf, ice 160 plus a disabled overlay, pause, back, retry, next, settings, shop, builder, daily at 128,
exposure meter frame 512x96 and fill strip, hearts, medals 256, progress marks 96, the level card, shop card, builder
frame, coach bubble, toast pill and wallet chip as nine slices); G store (result frames 1080 square and 1080x1920 with a
window, the daily card, feature graphic, promo tile, social card, six screenshot frames; never served).
What v2 brought: the default tomato in EIGHT bearings (s, se, e, ne, n and the mirrored sw, w, nw; each a two row sheet
of 256 cells: idle, walk 1 to 4, dash crouch, dash stretch, hop; faceless bases plus face layers plus neutral composites;
rear and rear diagonal faces are transparent on purpose), four south facing action sequences of four frames (victory,
respawn, cooling, shade drop), the 12 hats in S, E, N, W with a direction map, the Angry Sun wind up, lunge and recovery
as 1536x384 four cell sheets, awning wilt states (healthy, drooping, sagging, collapsed as 2x2 of 720x220, striped and
solid), umbrella tilt states (left, neutral, right, gust as 2x2 of 512), cactus blink, wave and wind lean strips
(256x384 cells, anchor 128,360), a boss telegraph ring and a safe window ring sheet, eight one colour cue marks (boss
target, lunge lane, safe exit, awning warning, umbrella turn, cooling, eclipse window, shade ready). Timings are in v2
NOTES; the game's own warning and travel durations always win over the clip length.

## STATE (the builder updates this block; one line per step)

| Step | State | Commit (Tomato_Man sunstruck) | Note |
|---|---|---|---|
| 0 | DONE | 6483d31 | cloned to /workspaces/Tomato_Man, branch sunstruck from main f0e47a3; the arcade copy had DRIFTED (vendor check EDITED: the fleet's canonical link, Sky Wolf Studio, the dashes out of the copy in index.html and umbra-v4.html), so sunstruck's first commit 9286b68 carries those edits upstream and a re vendor loses nothing; the push needed his login (the codespace token is lucid-winds only): this clone's local credential helper is env -u GITHUB_TOKEN gh auth git-credential, nothing global changed; tools/tomato-man-tests/check.js red at 83 before the build (64 emoji lines, 16 copy law lines, the two art files the loader asks for and never gets, zoom off) and shoot.mjs (title howto worlds levels play blaze burn win shop builder daily pause first) through the EXISTING window.__TM hook, extended (go showScreen openWorld startDaily togglePause buildHowto, hold, seek, exposure; devHold stops the clock) instead of a new ?tmtest; the clone served on 8778; before set in /home/codespace/tm-drafts/before (emoji draw as boxes in headless Chrome); Tomato_Man main f0e47a3, lucid-winds main's satellites/tomato-man tree 5fb588e0 |
| 1 | DONE | 0e3c498 | tools/tomato-man-tests/astra_in.py (python, re runnable) writes art/ from pack v1: the sun, the five worlds (ground lossy webp, horizon, decor sheet, card, key art), only the casters the engine draws (R awnings, U umbrellas, carts, clouds; the cabana, billboard, palms, tower, arch and cliff stay in the pack, no level uses them), pickups, effects downscaled to the size they are drawn (lossy webp bloated soft alpha, so the smaller of webp and png is kept), the UI (wordmarks, menu plate, her four action buttons and disabled overlay as svg, joystick, meter, medals, progress marks, the nine slices), the share frames; 1.6 MB; her icons over the three icon files; her promo tile as the arcade thumb (480 png, 112 KB, lucid-winds portal-assets/thumbs/tomato-man.png); Bree Serif and Atkinson Hyperlegible from google/fonts subset to 52 KB; ASSET_PATHS (first visit) and ASSET_LAZY (a world's ground, horizon, decor and key art on needWorld, the Angry Sun with Eclipse, the share frames), ART_V, A(key) as before, mk(name) for her 23 marks in one inline sprite; every emoji out (marks, medal images, words), every dash and exclamation mark out of the copy (the two level subtitles, the toasts, the coach marks, How to Play, the shop's em dash), zoom on, the worker's CACHE v4 without the 620 KB thumbnail in its install list (it already cached art on first fetch). Check green (80 files named, all present). No shot; three screens loaded for page errors, none |
| 2 | DONE | 944e92d | the hero from v2 now, not v1: v1's 256 game bodies are faceless and v1 gives no face placement on them (its faces are cut for the 384 builder head), while v2 has every bearing with its face composited and per frame head boxes and hat anchors; so the default tomato draws her v2 neutral composites in all eight bearings (the three west ones are her mirrored exports, drawn as e, se, ne flipped; 5 sheets at half size, 128 px cells, about 25 KB each), 64 world px so his head is 28 across (collider radius 14 untouched), idle, the walk 1 to 4 at 8 fps, the dash at 12 fps, and after half a second standing still he turns to face you; a mild exposure tint on the figure only (an offscreen 128 canvas, source atop); her respawn frames after a burn and her small sad char plus smoke where he burned; hats from v2's four bearing sheets on the hat anchors of every frame (HAT_ANCHOR, written from her manifest by astra_in.py); her dash trail sprites; the 13 other produce: her v1 game bodies with her neutral face laid over (placement estimated, checked at the walk); the builder: her headless body, the produce's head with its face and the hat at her sockets on a 512x840 parent (canvas 360x560); in game expressions (squint, pain, dizzy) NOT built: her v1 faces map onto v2's face area only with a squash and at a 28 px head they would not read; the builder and lazy art add 0.8 MB (2.3 MB total, the first visit far less). Found on the shot: her builder body file carries a stray second collar below the boots, cleared in the import (rows 588 down). Check green. Shots play and builder: he reads at 28 px (calyx, hollow eyes, teeth, tunic, boots) and the builder figure is the thumbnail's; wrong: the stray collar (fixed), the shade is still the black multiply (step 3), the HUD is still the old one (step 5) |
| 3 | DONE | 62e929e | the shade: every swept polygon, umbrella ellipse, dropped pool and cloud shadow filled ONCE into an offscreen mask, then laid down once in her safe shade #657E94 at 0.55 (no multiply, no per polygon blur, overlaps no longer stack to black); her shade pool art over each dropped circle (the circle stays the truth); her world ground tile as a pattern locked to the world (the gradient, ripples and dots only without it), the sun wash lighter over it; her far silhouette tinted in the world's ink along the top of the world; hot sand as her patch with her shimmer rising over it (warm, patterned); clouds float toward the sun from their own shadows so the safe ground under them shows; her sun: the face disc with her rays turning apart, the disc easing to look at him (DECISION 5; never in reduced motion), the Angry Sun's glare, wind up, lunge and panting by the lunge clock, her corona and eclipse vignette in dark windows, her near burn vignette from exposure 55 out of the sun; the five horizon strips are drawn nowhere in a top down game, so they left the art folder. Check green. Shot play (Dawn Ribbon 6 s in): reads (cool shade on pale sand, no black walls, the hero readable at 28 px, the sun looking at him); wrong: the sun was a 76 px set piece crowding the hero's start (now 54), the awnings are still the drawn stripes (step 4), the HUD is still the old one (step 5) |
| 4 | DONE | b94edd0 | her awning canopies fill only the middle of their frames, so the import crops them to the art and the game stretches the canopy to each R footprint (what you see is the solid wall), a thin contact line only; her parasol at each U pole turned by its tilt (the engine's facing, wind included); wilting awnings as her solid canopy shrinking and fading as before; carts: her three cart pigments cut apart (terracotta, slate, sage by world), each mover footprint a convoy of round(w/120) carts with the wheels on its bottom edge; her aloe lit (gentle pulse, a sparkle now and then) and asleep in shade, popsicles, the three treasures (drawFindIcon), checkpoint flags off and on with a faint trigger ring, her exit pennant; run.fx for her dash puff (4 frames), collect burst and respawn flash; DECOR: scatterDecor seeds six to nine props from the world's sheet beside the route (start, checkpoints, flag), 150 to 350 px to the side, never in an awning or umbrella, never within 80 px of a pickup, find, hot sand, checkpoint or the flag, never on each other, drawn under the shade; the planet tomato far off at the top. Check green. Shot blaze (Cart Convoy, aimed at a cart with the hero sunproofed): the slate convoy in its shadow, the canopy, the flag, the lit aloe read; wrong: the carts stand about two and a half times his height (kept: a big cart and a small tomato), the shimmer leaves an orange smear at the patch's edge, the HUD text is white on cream (step 5). The first aim at 8 s missed the carts (they were off to the side); the shot was re aimed once |
| 5 | DONE | 35b781f | every screen restyled from night navy to pale daylight paper with ink text (one SUNSTRUCK stylesheet over the old one): the title on her menu plate (its long cast shadow teaches the mechanic) with her wordmark (the text logo if the svg fails), one line of tag, Play in tomato red and the rest as paper pills with her marks; the world select as her five postcards (the live name in her band, cleared and stars beside it, the finds on a paper chip, locked worlds greyed with Locked and what unlocks them); level cards in her paper frame (Bree Serif name, the subtitle, three treasure sockets from her progress marks filled or dim, the medal by stars, the best time or Play); How to Play: four picture cards (sun, shade, move, dash, one line each) and Every rule opens the old list; her shop and builder frames, her coach bubble, her toast pill (ink, a dot in the call's colour), her wallet chip, the back buttons with her mark; the HUD on light sand: ink text with a pale edge, her exposure meter (the fill strip cut by clip path, blue under SPF, violet in an eclipse), her four action buttons as images with their words under them and the count on a chip, her disabled overlay at zero, a cooldown ring on DASH, the stock glow, the pause mark, her joystick. NOT built: the face at the meter's end, hearts (the game has burns, not hearts). Found on the way: the step 1 comment on the toast line had swallowed the rest of that line (the colour), rewritten. Check green. Shots worlds and levels: read (her postcards, the paper cards, sockets, locks); wrong: card subtitles at 12 px and the screen subtitles at 13 (now 14 and 15), the plain sand behind the cards (kept), the wallet chip's frame heavy for one number (kept) |
| 6 | DONE | cc72b43 | no How to Play wall before the first move (DECISION 4; the first launch lands on the title); Dawn Ribbon's coach marks teach in play with their done checks, one line at a time (Stay in the shade. Move with your left thumb; A thin strip of sun ahead, tap DASH and cross it fast; No shade ahead, tap SHADE to drop your own), the bubble moved from the middle of the crossing to just under the HUD; How to Play also from pause (and back to pause); a burn: her char and smoke where it happened (step 2), her respawn frames and flash (steps 2 and 4), the checkpoint as before, and a two second strip Burned at 14.2 s in place of the BURNED shout; the win: her result frame as a postcard (canvas): in its window the world's ground under one long cool shadow and him in his victory pose, the level's name in her top band, time, par and new best with the medal image, the treasures found with her socket mark and the burns; Next, Again, Levels in weight order; the DOM stat lines stay for screen readers. Check green. Shot win: reads (the postcard, him saluting in the shadow, the bands); wrong: the wallet showed two aloe marks (her chip has one baked in; mine hidden), the frame's square corners show her beach scene round the rounded card (kept, it is a postcard), much empty paper above the card (kept) |
| 7 | DONE, waits for his line | 9a74bd1 | Share draws the 1080 postcard (her result frame; her daily card with the date band, a seed word for the day from a fixed list of 30 picked by the date key, shown in the daily's intro too, and rules v7) and hands it to the system sheet as a file after the tap, else downloads it, else shares the words; the link preview is her social card (1200x630 jpg) on the arcade address. The walk at 412x915 and 360x780 (every screen) and the worst angles (The Long Dark in a dark window at 360, the builder with Eclipse Halo on the pickle, Spring Tide with an awning mid wilt, a cart and the cloud: the level has two wilts and two carts 1240 px apart, never one frame), read; fixed: the SPF and ICE labels hidden under the next button (gap 22), the level name under the right column at 360 and under the coach and burn strip (moved below the column; it gives way to both), the HUD unreadable under an eclipse (cream with an ink edge while dark), the builder title under the back and wallet chips (below them, one line), the wordmark under the wallet at 360, the orphan best line, the shop's sun., next; re shot only those. Kept: the wilt drawn as her awning narrowing (her wilt states are m2 step 9), a cart can pass under the right column. ART_V 20261105b, worker cache tomato-man-v5. Check green. Deploy script /home/codespace/tm-drafts/deploy-tomato-man-m1.sh per THE LANE, DRY=1 OK (Tomato_Man main f0e47a30 to 9a74bd13, 160 files; lucid-winds main's tomato tree 5fb588e0 and thumb d5b0d38a unchanged) |
| 8 |  |  |  |
| 9 |  |  |  |
| 10 |  |  |  |

## THE LAWS (Stephen's standing orders; they override anything in Astra's docs)

1. Code directly in the one session. No Workflow, no lanes, no subagents, no review agents, no mutant runs.
2. THE TESTING LAW. Per step: `node tools/tomato-man-tests/check.js /workspaces/Tomato_Man/index.html` (seconds, no
   browser; made in step 0 from tools/ff-tests/check.js with the asset prefix art/). A visual step: ONE shot of THAT
   screen with `node tools/tomato-man-tests/shoot.mjs <outdir> <screen>` after all the step's edits, then OPEN it and write
   three things wrong in one line. The walk ONCE at step 7 (m1) and once at step 10 (m2). Never re-run a green.
3. Never push Tomato_Man main, never push lucid-winds main, never run a deploy. Commit and push `sunstruck` after every
   step (and add-sproing-jumper for the tools and docs). The deploy is one script at the end of m1 for Stephen's line.
4. The readability contract comes before the palette: cool shade is safe, warm sun is death, the hero is red, aloe is
   green, currency is yellow. Walkable ground stays LIGHT in every world, Eclipse included; the engine's computed shade is
   the only safe layer; no baked prop shadow may read as safe ground; decorative art never takes a pointer event, never
   casts shade, never blocks. The collision circle stays radius 14 world px; sprites may overhang it.
5. The engine's rules are frozen: the sweep, exposure rates, dash, shade, SPF, ice, wilting, wind, lunges, dark windows,
   medals, par, the economy, the 26 levels and their ids (levelId world_index; LEVELS appended, never inserted), the
   procedural daily and endless. Art is drop in behind `A(key)` with the drawn fallback kept. SAVE_KEY
   tomatoman_save_v1 and every saved key survive; keys may be added.
6. The copy law: no dashes of any kind and no exclamation marks in anything a player reads (today's level subtitles,
   toasts and tips have both; the LEVELS data is player facing), 48 px targets, body copy at least 16 CSS px. Every emoji
   out (76 today: the collectibles, medals, locks, the 🏆, the How to Play glyphs) for the svg marks or words.
7. Budget: sheets, never the cutouts when a sheet exists; the 768 sun states, never the 3072 strip; ground tiles to webp
   (the five 512 PNGs are 210 KB each; aim under 70 KB); the builder's 384 heads and hats and the four later worlds load
   on demand; the first visit (title, How, the hero, the sun, Morning Tide, pickups, HUD, fonts) under 2.5 MB; the whole
   game under 7 MB; previews, docs, g_store and the 1080 frames never ship. sw.js caches art on fetch (never a precache
   of megabytes) and bumps its CACHE.
8. Fonts: Bree Serif (headings) and Atkinson Hyperlegible (controls and copy) are Google Fonts under OFL; Astra did not
   bundle them. Fetch the ttf and OFL.txt from github.com/google/fonts (ofl/breeserif, ofl/atkinsonhyperlegible) into
   art/fonts/, @font-face, never a CDN request at runtime.
9. Notes: one line per step in STATE and one line in START-HERE.md. No essays.
10. The box has a hard 12 hour life from boot: read it, add 12 h, stop 40 minutes before with START-HERE written.
11. Scope: m1 is steps 0 to 7 (pack v1). m2 is steps 8 to 10 (pack v2) only if the box has three hours after the
    kickoff's earlier games; else it is the next order. The DECISIONS list is not built.

## MILESTONE m1: THE LOOK AND THE FIRST MINUTE (steps 0 to 7)

**Step 0. Prep (25 min).** The clone and the branch (THE LANE). The check tool. The shoot tool: serve
`/workspaces/Tomato_Man` on 8778, 412x915 at 2x with touch, screens title, howto, worlds, levels (Morning Tide), play
(Dawn Ribbon 6 s in), play-blaze (Cart Convoy 8 s in), burn (the frame after a burn), win (the result card), shop,
builder, daily, pause; driven by a `?tmtest=1` hook (`window.TM_DEV = { show(screen), level(i), seek(t), exposure(v),
burn(), win() }`, inert without the query). Before set to /home/codespace/tm-drafts/before/. Note in STATE
Tomato_Man main's commit and lucid-winds main's satellites/tomato-man tree hash.

**Step 1. The assets in, the loader, the copy law (M; everything but the hero).** `tools/tomato-man-tests/astra_in.mjs`
(re runnable) copies v1 sections A to F into `/workspaces/Tomato_Man/art/` as hero/, sun/, worlds/<world>/, casters/,
pickups/, fx/, ui/ under law 7 (conversion to webp where opaque; a trimmed art/manifest.json carrying only the entries
the game reads: anchors, sockets, cell grids, insets). ASSET_PATHS becomes that table; `A(key)` unchanged in spirit, each
image with its own loaded flag; ART_V on every URL. The one inline svg sprite from the 64 marks (`ic(name)`); the three
icons replaced in place (names kept); the thumbnail kept (Stephen's art reference and the arcade card; the promo tile
goes to the arcade thumb in the deploy). Fonts (law 8). The wordmark (logo_on_sand on the menu, logo_on_dark on the
result). Every emoji out; every dash and exclamation mark out of player copy, LEVELS subtitles included (keep the sense:
"when the sun swings, a gap opens, dash it"). sw.js: cache on fetch for art/, CACHE tomato-man-v4. No shot.

**Step 2. The hero (L; A).** In play, `drawHero` draws the v1 bases at the pivot (128,128) on (P.x, P.y), scaled so the
head is about 28 world px wide (the figure is taller than the radius 14 collider; that is intended), facing right or
mirrored left by P.face (v1 has one bearing; m2 brings eight), idle, the 4 frame walk at 8 fps while moving, the 2
dash poses during P.dashT, the hop pose on a hop, the exposure strip by P.exp bands (healthy, warm, hot; the char cell
on a burn with the smoke wisp, never a wound), the respawn pop, the victory wave on the win; the face overlay by state
(neutral; squint when hot; pain at burning; dizzy after a respawn; determined in a dash; happy on the win; blank in the
builder when nothing is chosen) at the manifest's face rect; the hat at the pose's hat anchor from the 128 top down
hats; the dash trails as the 64 px particle sprites. The 13 other produce: their 256 bodies in play with the same faces,
their 384 heads in the builder. The builder draws builder_body plus head plus hat at the sockets on a taller parent
(body at y 180, head at 64,6 on 512x840, the NOTES example) with the blank face until a face is chosen. The engine's
exposure tint stays on top, mild. Reduced motion: no walk cycle, the idle pose. Shot: play (the hero mid walk) and
builder.

**Step 3. The ground truth (M; B, D ground, E).** The shade: the union of every shade polygon, ellipse, popup and cloud
drawn ONCE (an offscreen canvas or a single path) and composited once at alpha 0.55 in safe shade #657E94, no multiply
stacking, no shadowBlur per polygon (today overlapping polygons multiply to near black: a wall, not a floor). The ground:
the world's ground tile scrolled with the camera (world locked) instead of the gradient and ripples, the directional sun
wash kept but lighter; the far silhouette strip across the top edge of the world under the exit; hot sand patches as the
sprite with the shimmer over them (warm and patterned, never only colour). The sun token with its separate rays rotating
and its face (the eyes follow the hero slowly; DECISION 5), the HUD sun position token. The eclipse corona and dark
vignette during dark windows (the dark window is the engine's; the vignette never implies safety). The near burn vignette
at P.exp over 70. Shot: play (Dawn Ribbon 6 s in): open it and check that cool shade reads as the safe floor on light
sand and the hero reads at 28 px.

**Step 4. Casters, pickups, markers, decor (M; C, D).** Every caster as its sprite at its footprint: awnings scaled to
w by d from the top left pivot (a non uniform stretch within a quarter, else keep aspect and centre on the footprint),
umbrellas pole centred and rotated by the tilt, cabana, billboard, palms, lifeguard tower, rock arch, cliff overhang
where a level declares them, the vendor cart (wheels on its bottom edge) with the reskins by world, clouds platform and
elevator. Pickups and markers with their baked glows: aloe lit and dim, sunbeam, popsicle, ice water, SPF, shade token,
the placed shade pool (512, cool, soft edged), checkpoint off and on, exit flag, the three treasures by world, the
collect burst, sparkle on a lit aloe. Decor: per world, six to eight props from the decor sheet scattered by a seeded
rule outside every caster footprint and 80 px off the route between checkpoints, at the world's margins, the planet
tomato far off at the top; never on the path, never a hazard, never pointer events (law 4). Shot: play-blaze (Cart
Convoy with the cart and a popsicle).

**Step 5. The front door and the cards (M; F, C cards).** The menu on the menu plate (the beach with one long cast
shadow: the front door teaches the mechanic), the wordmark, Play, Daily, Shop, Builder, Settings with icons and words.
World select as five postcards (the card plates with the live name in the band, progress under: levels cleared, stars,
treasures, the hat when complete; locked cards keep their art and show the lock mark). Level cards on the level card
frame as postcards: the name, a short subtitle, three treasure sockets (filled or empty), the medal, the best time. How
to Play as four picture cards (sun, shade, move, dash marks) and one line each, the full guide from pause. The shop and
builder frames, the coach bubble, the toast pill, the wallet chip. The HUD: joystick base and thumb, the action buttons
with the disabled overlay at zero stock, the exposure meter frame and fill (the fill strip, the face at the fill's end
by band), hearts, the daily and pause marks. Shot: worlds and levels.

**Step 6. Teach by doing, and the burn (M; a hook and E).** Dawn Ribbon's first ten seconds: the hero spawns under a
safe patch with the next patch obvious, the coach bubble outside the crossing (the coach system with done checks
exists: `coach`, `checkTut`), one line at a time: Stay in the shade. Move with your left thumb; then at the first sun
sliver: Dash across; then at the first gap: Drop your own shade. The How to Play wall never precedes the first move
(DECISION 4). The burn: the char and wisp, the respawn flash, a two second HUD strip Burned at 14 s (no exclamation),
the checkpoint kept as today, respawn instant as today. The win card as a postcard on the result frame window: the hero
in his last state, the level, the time, the medal, the treasures found, Again and Next in weight order. Shot: win.

**Step 7. Daily, share, the walk, the stamp, the deploy script (M; G).** The daily card (date band, the seed word and
the ruleset version, shared with the file after the tap, else downloaded), the social card as og:image. The walk: every
screen at 412x915 and 360x780, the worst angle on purpose (The Long Dark inside a dark window at 360, the builder with
Eclipse Halo on the pickle, a Spring Tide frame with four wilts and two carts); open every image, three things wrong
each, fix, re shoot only the screens the fixes touched. Bump ART_V and CACHE. Check green. The deploy script per THE
LANE, DRY=1 once. His line into START-HERE: `! bash /home/codespace/tm-drafts/deploy-tomato-man-m1.sh`.

## MILESTONE m2: THE EXPANSION (steps 8 to 10; pack v2; only with three hours left)

**Step 8. Eight bearings and the actions (M; v2 A).** The hero by bearing from P.face (eight sectors; sw, w, nw are the
mirrored sheets, the tunic print mirrors with them), walk indices 1 to 4 looping at 8 fps, dash 12 fps, hop held; the
four south facing action sequences (victory on the win, respawn, cooling when exposure falls under shade after a hot
band, shade drop on SHADE) played once at their fps, the physics direction never turned by them; hats by S, E, N, W
through hat_direction_map at the per frame hat anchors from manifest.animations; the v1 single bearing stays for the
13 produce. Shot: play with the hero walking north east.

**Step 9. The world moves (M; v2 B, C, E).** Awning wilt states by the engine's wilt value (healthy, drooping, sagging
while campT climbs, collapsed when closed; never collapsed while the engine still shades), umbrella posture by tilt
(left, neutral, right; gust during a gust), the cactus strips at the margins (an occasional blink at 6 fps, the wave once
on a result, the lean only in wind, never all at once; frame zero under reduced motion), the Angry Sun wind up, lunge
and recovery sheets held on their last frame until the engine's own warn and dur end, the boss telegraph ring and the
lunge lane rotated to the attack bearing, the safe window ring during a dark window. Shot: The Angry Sun mid lunge.

**Step 10. Cues, the walk, the stamp, the deploy script (S).** The eight cue marks in the HUD and coach (boss target,
lunge lane, safe exit, awning warning, umbrella turn, cooling, eclipse window, shade ready). The walk again for the
screens m2 touched. Bump, check, `/home/codespace/tm-drafts/deploy-tomato-man-m2.sh` carrying m1, DRY=1 once, his line.

## DECISIONS for Stephen (built as written until he says otherwise; nothing below is built overnight)

1. **The planet tomato passes.** The most Tomato Man idea on the table: once per level in Dunes at Dusk and Eclipse a
   huge shadow (a cloud of radius 220 in the existing clouds system, the planet drawn at the far edge) crosses the map
   on a fixed path at a fixed time, a moving platform you can ride and a wall you can hide behind. Nearly free to build
   because clouds exist; Astra asked for the footprint and travel rule before drawing encounter frames. Say yes and the
   rule above is the brief.
2. **Pass the phone races.** Same level, same seed, same loadout, alternate turns, the two times on one card. A mode
   wrapper over the level, a small build.
3. **Hats that do a tiny thing** (the umbrella hat drops a shade, the ice cream hat melts into a puddle): Astra's advice
   is a separate playful mode so medals and the Daily stay fair. His call whether it exists at all.
4. The How to Play wall retires to pause and the lesson is Dawn Ribbon itself (built as step 6). He may keep the wall.
5. The sun's eyes follow the hero (built, reduced motion off). One line to disable.
6. The listing: Tomato Man stays free in the arcade, or becomes a $0.99 Play app on the Shutterbug pattern (real
   captures in Astra's six frames). Penny named it; a credit line Named by Penny is one line, his call.
7. The GitHub Pages mirror: keep stephenuffugus.github.io/Tomato_Man/ (a second public copy that earns nothing and
   lags the arcade until a deploy) or turn Pages off so the arcade is the one address.
