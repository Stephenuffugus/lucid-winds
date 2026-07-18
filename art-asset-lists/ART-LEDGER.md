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

## In flight / awaiting drop

| What | Status | Notes |
|---|---|---|
| **Pinball Claymation (Blobworks)** | **DROPPED Jul 18** — 22 sheets + prompts docx | Raw landed `satellites/greenhouse-pinball/art-drop/Pinball claymation/` (COMMITTED per rule 6; `PROMPTS.txt` = extracted docx, the per-sheet EXPORT FILENAME + format spec = cut SSOT; `MONTAGE.png` = overview). Sheets 1-4 = table backdrops (night/day/toxic/power, opaque full 941×1672, no cut). 5-12 = element sprite sheets (magenta #FF00FF knockout). 13-17 = animation strips (blip/gameplay/goo-boil/mega-mash/tilt). 18-21 = cosmetic table skins (opaque). 22 = cosmetic props (ball/claw skins + monster-buddy cameos). Wiring target: `PIN_ART` in index.html (backdrop+ball already wired inert; flip enabled + extend). CUT+WIRE in progress. |
| **Pinball Claymation (Blobworks)** — reskin+rebrand of Greenhouse Pinball | **LISTED Jul 18** (Drive doc uploaded to 012Assets) | 11 prompt sheets in `art-asset-lists/pinball-claymation/`. Stephen ruling: leave botanical behind → goofy **Monster-Lab claymation** (plasticine/Aardman). New name TBD (rec **Blobworks**; alts Squish!/Gloop/Monster Mash). Engine UNCHANGED (still `satellites/greenhouse-pinball`); art is a drop-in swap + a dedicated **sprite-strip animation sheet** (sheet 10: mascot Blip, eyeball blink, bumper chomp, scoop gulp, MEGA MASH, TILT). Supersedes the old botanical GH-Pinball pack (that Drive doc left in place for Stephen to erase). Copy re-theme in wire pass: BLOOM→SLIME standups, SUN→ZAP rollovers, Pollen MB→GOO MB, FULL BLOOM→MEGA MASH. |
| ~2 packs Stephen has generated, not yet delivered | AWAITING DROP | Per Jul 13 session. Identity unknown until they land — when they do, log here FIRST, then cut+wire. |
| Dewball — Paper Lantern Parade | LISTED (21 prompt sheets ready, c155f924) | **No sheets generated yet.** `satellites/dewball/art-drop/` contains only the README landing-spot. Biggest open art target in the studio. |
| Generate-order queue (13 games) | LISTED | See README "Generate order" table: Glyph Forge, Picnic Panic, Sproing(v2), Budburst, Pollen Panic, Tarot Run, Tomato Man, Grubtrap, Hedgerow, Hunch, Petalvex(v2), Rootbound, BarBrawl. |
| Cosmic Cadets — SKINS EXPANSION (4 sheets, 80 unlockables) | LISTED Jul 16 (Stephen's request, same day) | Prompts: `seed-flutter/06..09-*.md` — 20 comet skins + 20 tails + 20 sky-buddies (pure cosmetic) + 20 keepsake stars. Stephen generates → drops in 012Assets Drive folder → wire pass extends SEEDS/TRAILS/COMPS + star mapping. |
| Cosmic Cadets — STYLE COLLECTIONS (6 sheets) | **WIRED + DEPLOYED Jul 17.** 135 assets cut → `satellites/seed-flutter/assets/cosmetics/`. Raw retained: `art-asset-lists/Cosmic-Cadet-Extras-20260717.zip` + `art-drop/style-collections/` (+ cut maps in `art-drop/style-collections/maps/`). | 24 comet skins (5 styles ANIMATED 3-pose flap/normal/settle via drawSeed; crayon single-pose — tight poses couldn't split clean), 23 tails, 24 buddies (archetype passives via new `pk` key), 24 stars (32% of keepsake blooms). Generator appends to SEEDS/TRAILS/COMPS/_STARS with dist/grew/streak thresholds; wardrobe auto-lists + lazy-load repaint. ECONOMY (v1.4): added Stardust coin currency (earn ~gaps*1.5+perfects*2/run, zen=0); ALL cosmetics buyable (comet 70/130/220, tail 40/70/110, buddy 55/95/150 by tier), only 4 achievable challenge unlocks kept (Arcade Crown reach45, Glass Crown grew80, Neon Prism grew150, Chrome Crown streak12) — the insane 120-520 dist thresholds are GONE. Cutter `scripts/cut_cadet_styles.py` (distance-key preserves pink art; auto column-gap split for crayon merges). ⛔glass tails were named descriptively, renamed to a/b/c/d to match generator. |
| Jul 11 bench packs (Fence Off, Loop Warden, Mosaic Draft, Tinker Loft, Lamplighter, Tonic Drop, Mini Crossword) | LISTED | Prompt packs complete; awaiting generation. |
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
