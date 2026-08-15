# ART LEDGER — every art drop, catalogued. THE source of truth for art status.
<!-- Claude: this file exists so Stephen is NEVER asked "is this new?" or "was this cut?".
     If you are about to ask him about a piece of art, STOP and read/update this file instead. -->

## Intake protocol (Claude follows this every time, no exceptions)

1. **The moment art lands** — Drive folder, zip in `art-asset-lists/`, a `satellites/<game>/art-drop/` folder, a loose PNG anywhere, a pasted image — add a row here BEFORE any other work. Unlabeled file? Open it with the Read tool, identify it visually, log it. Never ask Stephen what a drop is or whether it was handled.
2. **Statuses:** `LISTED` (prompt pack written, awaiting Stephen's generation) → `DROPPED` (files received; log date + exact location) → `CUT` (assets extracted) → `WIRED` (code hooked) → `DEPLOYED` (pushed to main; log the commit hash).
3. **Raw drops are source material.** Never delete or overwrite them without Stephen's explicit OK (see feedback_never_overwrite_assets). Leftover raw folders after a shipped cut are normal — the ledger row says so.
4. **Docs inside drops** (docx/notes): extract the text, record the instructions in the row's notes.
5. Prompt packs live in this folder (see `README.md`). This ledger tracks the *lifecycle*; the README tracks the *prompts and generate order*.
6. **Copy every raw drop into a committed location (`satellites/<game>/art-drop/` or an `art-asset-lists/` zip) BEFORE cutting.** Scratchpad/tmp dies with the codespace — Spore Drift's raw sheets were lost this way Jul 16 (cut assets survived in-repo; a re-cut now needs a re-drop). The Dewball landing-spot rule (489ae258) is the standard.

## Deployed packs (art live on main)

| Game | Pack / style | Sheets→assets | Drop source | Deploy commit(s) | Date | Notes |
|---|---|---|---|---|---|---|
| Nectar Drop | (v2.0 hero pack) | 25 sheets → 371 assets | `satellites/nectar-drop/art-drop/Nectar Drop/` (raw COMMITTED f995b026 per rule 6) | ab6aeb74; fixes 0799ca8c, f502695c; fg/+powers/ WIRED in v3.0 01f51101 (Jul 17) | Jul 09 | 14 heroes, 120 levels. Last dormant groups (12 parallax frames, 14 power VFX) now live in-game. Style docx = paper-craft midnight-garden manifest, processed. |
| Burr Blast (materials) | 9 painted material tiles | 1 sheet → 9 tiles | `assets/structures1.png` (root assets, raw retained) | ca615fff | ~Jul 07 | wood/stone/brick/thatch/banner/steel/glass/ice/crystal. Spec: `satellites/burr-blast/design/MATERIAL_ART_LIST.md`. |
| Garden Guard TD | full skin | 1 master sheet | `assets/file_000000006ca471f69e0a0e0cbcaf06b1.png` (raw retained) | (pre-Jul-08, "skinned up front") | ~Jul 05 | Towers/pests/bosses/FX/tiles/maps/keeper/UI on magenta. |
| Sproing | bg biomes, platforms, critters, powerups | — | Drive drop | 30353d49 | Jul 11 | |
| Berry Vine · Bridgevine · Dew Snip · Nova Bloom | drop-in backgrounds | — | zips in `art-asset-lists/*.zip` (retained) | b23844b6; Bridgevine unstretch 51e64995 | Jul 11-13 | |
| Petal Slice · Petalvex | full packs | — | zips in `art-asset-lists/*.zip` | c589726b | Jul 11 | |
| Root Weave | Inkwood Atlas | — | zip in `art-asset-lists/` | f081d6e6 | Jul 12 | |
| Sled Vine | Moonlit Inkwash | — | zip in `art-asset-lists/` | b2a58ceb; v2.0 art fix 1d54c6bc (9-slice, un-stretched) | Jul 12 + Jul 16 | ⛔ lesson: plates need border-image 9-slice, not background stretch. |
| Seed Flutter → **Cosmic Cadets** | Comet Cadets cosmic reskin | — | Drive drop | 865a2beb | Jul 16 | Renamed Cosmic Cadets (slug/saves kept). |
| Frost Watch | Midnight Vigil | 47 assets | Drive drop | 36f40aab | Jul 16 | |
| Seed Pot | Midnight Greenhouse | 80 assets | Drive `Done/Seed Pot` (sheets 1-7); sheets 1+6 re-downloaded Jul 16 PM into `satellites/seed-pot/art-drop/` (committed) | 427e91f0; tier7+gear recut 85e568b2 | Jul 16 | tier7 golden flowers TOUCH on the master — grid cuts clip them; use scripts/recut_seed-pot_tier7.py (valley split). |
| Silt | Terrarium Nocturne | 5 sheets | Drive drop | 7cf3cde2 | Jul 16 | Transparent-air glass vessel; sand stays procedural. |
| Spore Drift | Inkwater Bioluminance | 7 of 10 sheets → 44 assets (membranes 12, motes 12, fx 16, bgs 4) | Dropped by Stephen night of Jul 15→16; raw landed in session scratchpad and was LOST when the codespace closed (cut assets all committed) | a230721b (03:51) | Jul 16 | **Missing from drop: UI-plate + trails sheets** (buttons stay CSS — fine). fx cells cut+staged, NOT wired (game has no burst system yet). Re-verified Jul 16 PM: probe clean load 0 errors + gameplay screenshot — orbs/threat-ring/backdrop all correct. Minor: title-screen button emoji may tofu on old devices (□ in headless). |
| Chess — 13 COURTS | 13 themed full sets (cut-paper style) | 13 sheets → 208 assets (12 pieces + 2 tiles + 2 chips per court) | `art-asset-lists/Chess-20260717T145706Z-1-001.zip` (raw retained, moved from assets/ per rule 6) | (this commit) | Jul 17 | Courts: Deep Sea, Cosmic Cadets, Dino Dig, Candy Kingdom, Friendly Manor (05 docx said spooky — Stephen regenerated it as friendly-haunted), Forest, + 7 BONUS beyond the pack: Food Truck, Stained Glass, Painted Pottery, Pool Party, Origami Zoo, Royal Papercut, Cardboard Bots. Cutter: `scripts/cut_chess.py` (masters 1254px not 2048 — proportional grid + white-gridline inset + sliver/neighbor-bleed filters). ⛔Pottery sheet deviates: black court shifted a row, tiles in cells 15-16, capture chips half-clipped at sheet edge → pawn-art fallback chips. Wired: court picker (♜ Court btn) in games/chess.js, persisted lw_chess_court, tile-image squares w/ box-shadow highlights (background!important trap fixed in shared.css). All courts free to pick. |
| Jul 12 recovery batch | 8 packs, full-object wiring | — | Drive | see memory `project_full_object_wiring_jul12` | Jul 12 | Bgs alone read as "nothing" — full-object wiring is the standard. |
| LW items | 19 item PNGs | — | `/assets/items/` | (Apr 24) | Apr 24 | 17 catalog + lantern-path + pollen-storm. |
| Pre-Jul-08 "skinned up front" | nectar-drop, garden-td, bramblewick, burr-blast, mahjong/Jade Garden, sprout-dice, petal-plunge, pitbike-rally | — | various | see per-game memory files | Jun-Jul | Listed in README skip section. |
| **Acorn Drop** (Tonic Drop rebrand) | 80s graffiti b-boy squirrel | 13 sheets → 32 assets (4 board bgs + title + win; 4 hollow frames; 4 acorns; 9 grumps; 3 burst fx; 6 mascot poses) | `satellites/tonic-drop/art-drop/` (raw COMMITTED per rule 6; came as a gitignored zip) | 7d0158e7 | Jul 19 | Magenta-cut + component-slice (`mkart.py`, in memory `project_acorn_drop_art_wire_jul19`). **Hollow frames normalized so the transparent window = the grid (x[94-446] y[96-800]) → ZERO grid-geometry change**, drawn on top of pieces. Acorns/grumps gated on default Oakling capset (alt sets stay procedural — art only exists for teal/amber/rose). + 80s comic CSS + mascot chat-box announcer (showToon quips) + live shop swatches + new portal thumb. Sheets 7 (UI-chrome) & 11 (cosmetics-catalog) NOT sliced — superseded by CSS + live shop swatches. Bot 8/8 + 3-agent review (2 alpha/burst fixes applied). |
| **OriVex** (slug petalvex) | Clean Paper Meets Pixel (origami) | 10 sheets → 22 assets (10 wedge facets + plain + tile_frame; 8 theme bgs + bed + menu; 3 fx confetti; win crane) | `satellites/petalvex/art-drop/` (raw COMMITTED per rule 6) | Jul-19 (this session) | RE-SKIN of the existing `enamel` drop-in pipeline. Facets built DOWN-pointing (base top, apex centre); engine rotates one facet per edge. **value 0 = charcoal facet** so its light digit ink reads (VAL2CELL map in memory `project_orivex_blobworks_wire_jul19`). 8 backgrounds rotate by puzzle (P.themeIdx; daily=seed%8). **Made the paper skin the DEFAULT** (renamed enamel→"Folded Paper", un-gated). tile_frame = cell0 stitched, centre knocked out. Bot: PVX_DEV render clean, 0 errors, facets+digits+themed bg+confetti all correct. |
| **Blobworks art2** (greenhouse-pinball) | claymation core-monsters redo | 5 sheets → 13 monster files + 1 post | `satellites/greenhouse-pinball/art-drop/blobworks-art2/` (raw COMMITTED per rule 6) | Jul-19 (this session) | 6 distinct monsters replace the indistinct center bumpers (**TEAL** sheet1 + **GREEN** sheet2 — Stephen re-sent 1&2 non-purple Jul 19 for cleaner cut + table contrast; PIN_ART VER→a3): Stretch/Chub/Dib&Dob → bumper_a/b/c (idle→_idle,hit→_lit); octopus → sling; tube-head → scoop(idle/lit/open); King → standup_lit/done. Cone post → post_nub. **⛔ purple-monster head kept solid** via border-flood + inpaint (never global key). PIN_ART VER '2'→'a2'. **PARKED**: rail/curve/Y-junction/striped/ramp/domino parts (engine bakes rails into `table_*` backdrop → need a re-bake or new blit sites). Bot: 6 monsters render distinct on table, 0 errors. |
| **Jimothy** `glyph-games` | brass-rim medallion (UI glyph family) | 1 medallion → 1 asset | `satellites/stream-hop/art-drop6/playbutton-glyph-games-raw.png` (raw COMMITTED per rule 6; Stephen dropped it as `jimothy-itch/playbutton.png`) | Jul-25 (this session) | Jul 25 | The GAMES button on the new five-button home menu. Rainy Seattle crosswalk signal, walking figure lit green — on-world AND a walk sign already means GO. Cut with the house rig's own `find_key`/`background`/`despill` (scratchpad `cut_glyph.py` imports `cut_sheet.py`, largest-blob keep, squared then LANCZOS to 240x240): 0 leftover magenta, 44 stray px in 39 specks dropped. ARTV 42→43, SW cache 57→58. Sheet: `stream-hop/13-jimothy-glyph-games.md`. ⚠️ Jimothy's EARLIER art (163 assets, 44 costumes, sheets 1-12) predates this ledger and has no rows — backfill is an open job, see `project_streamhop_jimothy_buildout`. |
| **Jimothy** base hero RE-CUT | 20 pose frames (4x5 sheet) | 1 sheet -> 20 assets | `satellites/stream-hop/art-drop/1.png` (raw already committed) | Jul-25 (this session) | Jul 25 | ⛔ Stephen: "his head is cut." Six frames shipped with a flat slice through the skull (idle flush across 43% of its width). **NO REPAINT NEEDED — the source is intact, it was a bad cut.** Re-cut with new `scripts/cut_hero_sheet.py`, which reuses `cut_sheet.py`'s helpers (base Jimothy predated the rig; all 44 other characters already go through it). Real gutters (row 2 at y=581, an even grid would cut at 573 = 8px into art); optimal-assignment naming (greedy double-claimed leap/scared); `crop_bleed` removed 3 chips of LEAP dragged into LAND by the 14px column bridge at x=814. One documented departure: coverage fence lifted from 3px, because this sheet paints shield/flame/swirl SEMI-TRANSPARENT over the key so topology kept enclosed magenta (bubble cut out purple). + `scale:1.12` on the jimothy char entry so the taller correct sprite still draws the same size raccoon. Audited all 44 other characters: zero clipped. ARTV 44, SW 59. |
| **Jimothy** — The Barnacle | code-only costume, 18 frames | 2 sheets -> 19 assets (18 + mirrored run-l) | `satellites/stream-hop/art-drop6/The Barnacle/` (raw COMMITTED per rule 6; arrived as `assets/The Barnacle-*.zip`) | Jul-25 (this session) | Jul 25 | Stephen's joke that a certain short, round, magnificent actor is "the Jimothy of people", painted as a costume. Both sheets 3x3 with WHITE RULE BANDS in exact ART-BIBLE order (A: idle/sit/eat/crouch/leap/land/run-r/dash-run/coffee, B: magnet/umbrella/shield/scared/flee/cheer/ko/dizzy/splash) — cut straight through `scripts/cut_sheet.py`, clean gutters, 8 specks dropped, zero clipping. Checked the pink in dash-run/flee speed lines against the source: PAINTED, not key bleed. `rar:'legend'`, `via:'code'` (NOT secret:1 — a secret renders as ??? and the bit needs people to see him). Code `THEBARNACLE69` ⛔ handed to ONE man, never post it. ARTV 45, SW 60. |

## In flight / awaiting drop

| What | Status | Notes |
|---|---|---|
| **Aura Farm** portal thumbnail | LISTED (Aug 15) | Single square painted card to replace the interim gameplay-screenshot thumb (`portal-assets/thumbs/aura-farm.png`). One prompt, paste-ready: `art-asset-lists/aura-farm/00-art-direction.md`. Game art itself is complete (canvas-drawn); this is shelf presence only. |
| **Jimothy** course obstacles (sheet 14) | **LISTED, 12 sheets, one doc each** — ⛔ do not paint until COURSE-PLAN.md is approved | 6 zone-traffic sheets (9 obstacles each) + telegraph/signals + water set pieces + rail/freight + tileable lane surfaces, optionally 2 new zones. Written against measurements: every zone currently draws the SAME obstacle pool so six neighbourhoods look different and PLAY identical; LATE has 4 vehicles and BIG has 2 carrying every level past 25; and there is no telegraph art at all, which is why a hard pattern cannot be made fair. Pack: `art-asset-lists/stream-hop/14-jimothy-course-obstacles.md`, Drive: **`012Assets/jimothy obstacles`** (12 per-sheet docs + a 00 READ FIRST). The earlier `012Assets/assets obstacles` folder holds the superseded single combined list and can be deleted. Repo: `art-asset-lists/stream-hop/sheet-14/`. Generate order starts 14B Pike Market + 14E Interbay, the two most different, to prove the zone idea before painting four more. |
| **Pinball Claymation (Blobworks)** | **CUT + WIRING (live on main)** — 22 sheets | Raw: `satellites/greenhouse-pinball/art-drop/Pinball claymation/` (COMMITTED; `PROMPTS.txt` = cut SSOT). Cutter: `scripts/cut_pinball_claymation.py` (magenta knockout + component detect + de-fringe). Cut assets → `art/` (gitignored cut/). **DEPLOYED so far** (ccb46985 core + b59c9e19 furniture): backdrop, ball, flippers, bumpers, slings, SLIME standups, spinner, ZAP rollovers, ramp/orbit throats, monster-mouth scoop, beaker drops. **+ Full-screen + Add-to-Home-Screen PWA** (08f468c8: manifest+sw+icons). **Status + remake notes: `satellites/greenhouse-pinball/ART_STATUS.md`.** Next: lock jar, posts, returns, reaction meter (sh10), UI/logo (sh11), FX (sh12), animations (sh13-17 strips), cosmetics (sh18-22). Copy re-theme partially done (BLOOM→SLIME, SUN→ZAP); title→Blobworks. |
| **Pinball Claymation (Blobworks)** — reskin+rebrand of Greenhouse Pinball | **LISTED Jul 18** (Drive doc uploaded to 012Assets) | 11 prompt sheets in `art-asset-lists/pinball-claymation/`. Stephen ruling: leave botanical behind → goofy **Monster-Lab claymation** (plasticine/Aardman). New name TBD (rec **Blobworks**; alts Squish!/Gloop/Monster Mash). Engine UNCHANGED (still `satellites/greenhouse-pinball`); art is a drop-in swap + a dedicated **sprite-strip animation sheet** (sheet 10: mascot Blip, eyeball blink, bumper chomp, scoop gulp, MEGA MASH, TILT). Supersedes the old botanical GH-Pinball pack (that Drive doc left in place for Stephen to erase). Copy re-theme in wire pass: BLOOM→SLIME standups, SUN→ZAP rollovers, Pollen MB→GOO MB, FULL BLOOM→MEGA MASH. |
| ~2 packs Stephen has generated, not yet delivered | AWAITING DROP | Per Jul 13 session. Identity unknown until they land — when they do, log here FIRST, then cut+wire. |
| Dewball — Paper Lantern Parade | LISTED (21 prompt sheets ready, c155f924) | **No sheets generated yet.** `satellites/dewball/art-drop/` contains only the README landing-spot. Biggest open art target in the studio. |
| Generate-order queue (13 games) | LISTED | See README "Generate order" table: Glyph Forge, Picnic Panic, Sproing(v2), Budburst, Pollen Panic, Tarot Run, Tomato Man, Grubtrap, Hedgerow, Hunch, Petalvex(v2), Rootbound, BarBrawl. |
| Cosmic Cadets — SKINS EXPANSION (4 sheets, 80 unlockables) | LISTED Jul 16 (Stephen's request, same day) | Prompts: `seed-flutter/06..09-*.md` — 20 comet skins + 20 tails + 20 sky-buddies (pure cosmetic) + 20 keepsake stars. Stephen generates → drops in 012Assets Drive folder → wire pass extends SEEDS/TRAILS/COMPS + star mapping. |
| Cosmic Cadets — STYLE COLLECTIONS (6 sheets) | **WIRED + DEPLOYED Jul 17.** 135 assets cut → `satellites/seed-flutter/assets/cosmetics/`. Raw retained: `art-asset-lists/Cosmic-Cadet-Extras-20260717.zip` + `art-drop/style-collections/` (+ cut maps in `art-drop/style-collections/maps/`). | 24 comet skins (5 styles ANIMATED 3-pose flap/normal/settle via drawSeed; crayon single-pose — tight poses couldn't split clean), 23 tails, 24 buddies (archetype passives via new `pk` key), 24 stars (32% of keepsake blooms). Generator appends to SEEDS/TRAILS/COMPS/_STARS with dist/grew/streak thresholds; wardrobe auto-lists + lazy-load repaint. ECONOMY (v1.4): added Stardust coin currency (earn ~gaps*1.5+perfects*2/run, zen=0); ALL cosmetics buyable (comet 70/130/220, tail 40/70/110, buddy 55/95/150 by tier), only 4 achievable challenge unlocks kept (Arcade Crown reach45, Glass Crown grew80, Neon Prism grew150, Chrome Crown streak12) — the insane 120-520 dist thresholds are GONE. Cutter `scripts/cut_cadet_styles.py` (distance-key preserves pink art; auto column-gap split for crayon merges). ⛔glass tails were named descriptively, renamed to a/b/c/d to match generator. |
| Jul 11 bench packs (Fence Off, Loop Warden, Mosaic Draft, Tinker Loft, Lamplighter, Mini Crossword) | LISTED | Prompt packs complete; awaiting generation. (**Tonic Drop shipped as Acorn Drop — see Deployed table, 7d0158e7.**) |
| 2048 Merge Garden — 4 THEME SHEETS (Ember Forge / Tidepool / Tiny Cosmos / Sugar Rush) | LISTED Jul 17 (+ uploaded to 012Assets Drive) | Prompts: `merge/00..04-*.md` — one 4x4 sheet per theme: 11-tile growth ladder + empty mark + board bg + emblem + burst + wilt. Theme system, unlock ladder (256/512/1024/2048 best tile), and picker are LIVE in games/merge.js — themes activate on drop. Default "Midnight Grove" theme = real LW plant renders baked to `assets/games/merge/plant-*.svg` Jul 17 (the portal shell used to show a stub sprout). |

## Loose-file registry (identified, no action needed)

| File | Date | Identified as | Status |
|---|---|---|---|
| `file_000000004eec722f976330dda83c25cf.png` (repo root) | Jul 04 | Pit Bike Rally asset-plan sheet (waves 1-6: bike/rider, terrain, props, currency, bgs, skins) | Reference mockup for the pit-bike-rally repo (own repo + vendored satellite). Labels baked in — not a cuttable sheet. |
| `assets/file_000000006ca471f69e0a0e0cbcaf06b1.png` | Jul 05 | Garden Guard TD master sheet | Source of deployed garden-td skin. Retained as raw. |
| `assets/structures1.png` | Jul 07 | Burr Blast 9 material tiles | Cut + wired in ca615fff. Retained as raw. |
| `satellites/nectar-drop/art-drop/Nectar Drop/` (25 png + docx) | Jul 09 | Nectar Drop v2.0 source | Cut + wired in ab6aeb74. Retained as raw. |
| `pit-bike-rally.html` (repo root) | Jul 04 | Early Pit Bike Rally single-file build | Superseded by its own repo; kept as reference. |

## Scrapped

| What | Date | Ruling |
|---|---|---|
| `satellites/sprout-march/` (852-line prototype) | Jul 16 | Stephen: "wasn't good and not worth the effort to make it good." Deleted, never committed. Do not rebuild. |

## Chaff Wars — "Buff the Block" 80s reskin — LISTED (2026-07-19)

Asset manifest (245 assets: 44 Classic MVP / 41 Powers / 160 polish) authored and
dropped in Stephen's 012Assets Google Drive folder as a Doc, and saved in-repo at
`satellites/chaff-wars/context/ASSET-LIST.md`. Status: **LISTED** (awaiting art).
The game already SHIPS themed + playable with zero art files (procedural neon pods,
colorblind glyphs, crew colors, taunts, neon UI, WebAudio 80s beat). Art enhances.
Cut/wire target when files land: `satellites/chaff-wars/art-drop/` → mark DROPPED.

## Pop N Lock (formerly Chaff Wars) — "Neon Boombox" 80s b-boy pack — DROPPED + CUT (2026-07-20)

Full prompt pack at `art-asset-lists/pop-n-lock/` (00-art-direction + 9 sheets):
5 crew sheets (14 Grey Crew animals + Keeper, idle/win/lose, ALL in shiny
parachute pants), 2 backgrounds, the lettered POP N LOCK wildstyle logo (+
stacked icon variant), text-free UI chrome (incl. the multiplayer room-code
cassette card), and an optional FX sheet.

**DROPPED 2026-07-20:** 11 raw sheets committed to `satellites/chaff-wars/art-drop/`
(see MANIFEST.md there). **CUT** via `scripts/cut_popnlock.py` (border-flood magenta
knockout — interior magenta art preserved; content-band grid detection) into
`satellites/chaff-wars/assets/`: **45 char** (15 ids × idle/win/lose, ids match
`ROSTER`), **14 ui** (vs-frame, banner-win/lose/allclear, mode-a/b, next-window,
power-lit/unlit, burst-1/2/3/go, room-card), **16 fx** (pop-splat/chaff-splat/
buff-wipe/cast-aura × 4 frames), **2 logo** (stacked, wide), **2 bg** (battle-alley,
menu-wall JPEG <300KB). All verified clean (checkerboard montage + halo audit).

**WIRED 2026-07-20 (v1.3):** every sprite behind an image-loaded check with the
procedural draw as fallback. Menu-wall backdrop on all menu screens + stacked
logo on the title; battle-alley behind the boards; b-boy portraits on the ladder
tiles, the HUD opponent card, the stage-intro entrance, and the result screen
(pest LOSE pose on your win / WIN pose on your loss); banner plates behind the
verdict word; NEXT-window frame; escalating countdown bursts; per-pod-tinted
pop-splats + grey chaff-splats; room-code cassette in the versus lobby; power-orb
lit/unlit swap. Verified: parse OK, proofCheck.allPass, difficulty sweep shape
intact, bot_versus green (one winner/garbage crossed/0 errors), every scene
screenshotted. Also fixed a pre-existing crash: ALL-CITY-HYPE set a non-existent
`#h-score` DOM node. NOT wired (optional, deferred): buff-wipe + cast-aura FX,
vs-frame, mode plates, logo/wide. Status: **WIRED.**

**PIECE ART — Sheet 10 (pods + chaff) LISTED 2026-07-20.** Stephen asked for art on
the falling pieces to match the board. Prompt sheet authored at
`art-asset-lists/pop-n-lock/10-sheet-10-pods.md` and dropped in the 012Assets Drive
folder ("Pop N Lock — Art Pack" → "10 — Seedpods + Chaff"). 5 pod bodies (frozen
hue + colorblind tag-shape: star/chevron/droplet/bolt/diamond) + grey chaff, on
2048 4x4 magenta; bodies only (engine draws eyes/gaze on top). **Drop-in wired:**
`CW_POD_ART`/`CW_POD_BOX` flags in index.html + a gated sprite-body branch in
drawPod/drawChaff (inert until `assets/pods/pod-0..4.png` + `chaff.png` land — flip
`CW_POD_ART=true`, procedural stays the fallback). Status: **LISTED.**

**MERGE 2048 THEME SHEETS — LANDED 2026-07-27, CUT + WIRED same day.** Drop:
`assets/newest request-20260727T004719Z-1-001.zip` + `...025421Z...zip` (identical
re-export, same 14 files) — 8 ChatGPT half-sheets (1774x887, 4x2 cells, magenta key)
per the `art-asset-lists/merge/` pack, split A (tiles 2-256) / B (512-2048 + theme
assets) per theme. Identified by LOOKING: gpt1/2=Ember Forge, gpt3/4=Tidepool,
gpt5=Tiny Cosmos A, gpt6=Sugar Rush A, **gpt7=byte-identical dupe of gpt6**,
gpt8=Sugar Rush B. ⛔ **TINY COSMOS SHEET B NEVER ARRIVED** (tiles 512/1024/2048,
empty mark, board bg, emblem, burst, wilt) — ONE regenerate owed from the
`MERGE 03 — TINY COSMOS` doc's sheet-B prompt. Cut: cluster method for A sheets
(sugar objects cross the grid midline — even-grid cut bled cupcake into gumdrops),
grid+margin+bleed-drop for ember/sugar B (drawn cell frames defeat clustering),
magenta-preferred key sampling, fringe kill, pngquant to 3.2MB. 41 tiles at
`assets/games/merge/themes/{ember,tide,cosmos,sugar}/t<val>.png`. Ember/Tidepool/
Sugar `wired:true` in games/merge.js (cosmos stays false til B lands), merge.html
?v=6. Verified: contact-sheet eyeballed tile by tile + headless boards screenshotted
in all 3 themes, 0 broken imgs, 0 404s. Board bg / emblem / burst / wilt cells from
the B sheets are NOT yet consumed by the game (tileArt only draws tiles) — future
polish. Status: **WIRED (3 of 4 themes).**

**TINY COSMOS SHEET B — LANDED 2026-07-27 (assets/gpt6.png), CUT + WIRED same
hour.** The regenerate owed from the morning drop (original gpt7 was a dupe of
Sugar A). Radiant star t512 / supernova bloom t1024 / spiral galaxy t2048, plus
ghost mark, starfield board, Saturn emblem, burst, shooting-star wilt (the five
extras remain uncut — game consumes tiles only). Same B-sheet cut path
(grid+margin+bleed-drop, measured key, fringe kill), pngquant. cosmos
wired:true, unlock 1024, merge.html ?v=8. Verified: full 11-tile ladder
contact-strip eyeballed + in-game board screenshot, 0 broken imgs, 0 404s.
ALL FOUR MERGE THEMES NOW LIVE. Status: **WIRED.**
