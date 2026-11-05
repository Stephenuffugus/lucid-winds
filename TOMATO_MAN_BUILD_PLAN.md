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
| 0 |  |  |  |
| 1 |  |  |  |
| 2 |  |  |  |
| 3 |  |  |  |
| 4 |  |  |  |
| 5 |  |  |  |
| 6 |  |  |  |
| 7 |  |  |  |
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
