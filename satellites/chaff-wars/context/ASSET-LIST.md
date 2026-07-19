# CHAFF WARS — "Buff the Block" Art + Audio Asset Manifest
### 80s Graffiti / B-Boy Animal Reskin + Powers Mode. Drop target: Stephen's `012Assets` Google Drive folder. Cut/wire target: `satellites/chaff-wars/art-drop/`.
**Date: 2026-07-19. Author: Chaff Wars lead. Copy standard: no dashes in any player-facing string.**

---

## Summary

Chaff Wars ships **playable right now with zero art files** (procedural pods, emoji opponents, CSS chrome, accent-tinted board frames). Nothing in this manifest blocks the game, everything **enhances** it. This is a skin plus a character rewrite plus one optional new subsystem (Powers Mode), so the assets fall into three honest tiers: what makes **Classic** mode look like a real 1987 paint battle, what **Powers** mode needs on top, and the **full polish** pass (pose animation, per opponent graffiti walls, voice tags, extra music). Pods stay procedural and colorblind safe by SHAPE (per color glyph, not hue alone). Portraits follow the sister reskin pipeline already proven on Acorn Drop (magenta cut or transparent PNG, sliced with `scripts/mkart.py`). All 14 character ids below are the real `ROSTER` ids and must not be renamed (they gate `PROG.unlocked`).

### GRAND TOTALS

| Bucket | Assets | Running total to ship |
|---|---:|---|
| **CLASSIC MVP** (makes the game look themed) | **44** | 44 |
| **+ POWERS MODE** (sap meter, orbs, power FX and SFX) | **41** | 85 |
| **+ FULL POLISH** (pose animation, per opponent walls, VO, extra tracks) | **160** | **245** |
| **GRAND TOTAL (full)** | | **245** |

| Category | Total | MVP | Powers | Polish |
|---|---:|---:|---:|---:|
| Characters | 78 | 15 | 0 | 63 |
| Seedpods / board pieces | 13 | 0 | 0 | 13 |
| Backgrounds | 22 | 2 | 0 | 20 |
| FX | 22 | 0 | 3 | 19 |
| UI | 41 | 9 | 20 | 12 |
| Audio | 69 | 18 | 18 | 33 |
| **TOTALS** | **245** | **44** | **41** | **160** |

> **Cheapest high impact upgrade after MVP characters:** the all clear "BUFF THE BLOCK" FX and the tintable pop splat. They sell the whole fiction (grey turns back to neon) for 2 files.

---

## Conventions (read before generating)

- **Delivery:** transparent PNG, or magenta `#FF00FF` key for auto cut (the Acorn Drop / `mkart.py` pipeline). Portraits and FX magenta cut cleanly, backgrounds are full bleed opaque.
- **Slug pattern:** `char/<id>-<pose>.png`, `bg/<slug>.jpg`, `fx/<slug>.png`, `ui/<slug>.png`, `pod/<slug>.png`, `audio/<slug>.<ext>`. The 14 `<id>` values are fixed: `aphid-swarm, gnat-king-cole, cabbage-moth, slug-slugmore, cutworm, june-beetle, garden-snail, crow-cawlin, gopher-gustavo, deer-duchess, bindweed-lady, powdery-mildew, baron-greymould, ronin-hare`, plus `keeper` for the player.
- **Source vs display:** deliver at the source size listed (crisp on retina), the game downscales. Keep backgrounds under ~300KB each, the portal thumbnail under 150KB and 480px (house rule).
- **Accent colors:** each character already has a neon `ac` in `ROSTER` that strokes their board frame and card. Portrait palettes in the theme doc (primary + 1 to 2 support hues) must match the character `ac`.
- **Pods are procedural and colorblind safe.** The 5 paint throwies are drawn in `drawPod`, separated by GLYPH SHAPE (Redline 4 point star, Toxic up chevron, Ice droplet, Voltage bolt, Ultra diamond). Do NOT rotate the hue anchors. Raster pod overrides here are optional polish only.
- **Boss and secret split:** stages 3 and 6 are both molluscs, keep Slugmore (shell-less slow-mo popper) and Escargeddon (shell-spin heavyweight) visually distinct so portraits never read as duplicates.

---

## 1. CHARACTERS (78 total: 15 MVP, 63 polish)

15 subjects: 14 Grey Crew pests plus the player Keeper. Pose set per subject: **idle** (MVP portrait, used on the opponent card and VS screen), **breakdance** (their signature b-boy move, animated), **taunt**, **win**, **lose**. All poses share the same framing so they swap in place.

### 1a. Idle portraits (MVP)

Neutral b-boy stance, TAG visible on the wall or their gear, lit in their accent. This is the one portrait Classic MVP needs per character.

| Slug | Character (id) | Move / vibe to draw | Accent | Size | Qty |
|---|---|---|---|---|---:|
| `char/aphid-swarm-idle` | The Aphid Swarm (`aphid-swarm`) | the Wave, a mob of toy taggers rippling as one, TAG `TOYZ` | `#39FF14` + magenta | 512x512 | 1 |
| `char/gnat-king-cole-idle` | Gnat King Cole (`gnat-king-cole`) | crew DJ, one wing on the wax, TAG `KOLE` | `#2E8BFF` + violet | 512x512 | 1 |
| `char/cabbage-moth-idle` | Mabel Cabbagewing (`cabbage-moth`) | fly girl mid Butterfly, TAG `FLUTTA` | `#22E0E0` + hot pink | 512x512 | 1 |
| `char/slug-slugmore-idle` | Sir Reginald Slugmore (`slug-slugmore`) | posh popper / robot dime-stop, shell-less, TAG `SLIME` | `#B06FE0` + slime green | 512x512 | 1 |
| `char/cutworm-idle` | Chompers the Cutworm (`cutworm`) | the cutter mid Worm, TAG `KUTT` | `#FF7A18` + acid green | 512x512 | 1 |
| `char/june-beetle-idle` | Baron von Beetle (`june-beetle`) | power head, armored shell, windmill ready, TAG `SCARAB` | `#1FC7B0` + gold | 512x512 | 1 |
| `char/garden-snail-idle` | Escargeddon (`garden-snail`) | heavyweight, boombox shell on back, TAG `GEDDON` | `#E07B3A` + neon lime | 512x512 | 1 |
| `char/crow-cawlin-idle` | Cawlin the Crow (`crow-cawlin`) | bomber and lookout, Crow freeze, TAG `KAWZ` | `#2FF0E0` + violet-black | 512x512 | 1 |
| `char/gopher-gustavo-idle` | Gustavo the Gopher (`gopher-gustavo`) | underground plug, prairie-dog pop-up, TAG `DIGZ` | `#E0A03A` + turquoise | 512x512 | 1 |
| `char/deer-duchess-idle` | Duchess Dapple (`deer-duchess`) | style queen uprocker, high kicks, TAG `DAPPL` | `#FF5C8A` + electric gold | 512x512 | 1 |
| `char/bindweed-lady-idle` | Lady Bindweed (`bindweed-lady`) | contortionist, pretzel freeze, TAG `VINE` | `#FF3BC0` + neon green | 512x512 | 1 |
| `char/powdery-mildew-idle` | Miss Mildew (`powdery-mildew`) | fog machine glider, palette going grey, TAG `HAZE` | `#B8A6C8` + toxic green | 512x512 | 1 |
| `char/baron-greymould-idle` | Baron Greymould (`baron-greymould`) BOSS | all-city KING, crown pose over grey burner, TAG `GREYKING` | `#7BFF2A` + chrome grey + royal purple | 640x640 | 1 |
| `char/ronin-hare-idle` | The Ronin Hare (`ronin-hare`) SECRET | solo legend, sword-arm freeze, TAG `1BLADE` | `#E0433F` + white-neon + gold | 640x640 | 1 |
| `char/keeper-idle` | The Keeper (`keeper`) PLAYER | the gardener writer, spray can in hand, calm | sage / gold | 512x512 | 1 |

**Subtotal 15 (MVP).**

### 1b. Pose animation and reaction poses (polish)

| Slug pattern | Description | Size | Qty | Tier |
|---|---|---|---:|---|
| `char/<id>-breakdance` | 6 frame horizontal strip of the character's signature move looping (Wave, DJ scratch, Butterfly into backspin, Robot, the Worm, windmill, shell spin, Crow freeze, pop-up, uprock, thread the needle, moonwalk, King's Freeze, endless headspin, Keeper spray dance) | 3072x512 (6x 512) | 15 | Polish |
| `char/<id>-taunt` | pre-match callout pose (pointing, mouth open) behind the taunt bubble | 512x512 | 15 | Polish |
| `char/<id>-win` | KO celebration freeze, crew throws up | 512x512 | 15 | Polish |
| `char/<id>-lose` | defeat slump, their grey getting buffed off | 512x512 | 15 | Polish |
| `char/boss-greyking-intro` | Baron Greymould full reveal splash, valley going grey behind the throne burner | 1080x1080 | 1 | Polish |
| `char/ronin-reveal` | secret duel unlock splash, lone hare and one blade | 1080x1080 | 1 | Polish |
| `char/crew-lineup` | all 14 Grey Crew group shot for the ladder banner | 1920x640 | 1 | Polish |

**Subtotal 63 (polish).**  ·  **Category total 78.**

> Budget note: if you can afford one step past MVP on characters, add `win` and `lose` for all 15 (30 files). Result screens read far better with a real face than emoji.

---

## 2. SEEDPODS / BOARD PIECES (13 total, all optional polish)

Pods and grey Chaff render in code today (`drawPod`, procedural grey blocks). The theme doc's neon repaint (black spray outline, drip, per color glyph) is a `drawPod` CODE edit, not an art file. These raster overrides are optional hi-fi swaps only.

| Slug | Description | Size | Qty | Tier |
|---|---|---|---:|---|
| `pod/redline` | neon red throwie, black spray outline, drip, 4 point star glyph | 128x128 | 1 | Polish |
| `pod/toxic` | neon green throwie, up chevron / leaf glyph | 128x128 | 1 | Polish |
| `pod/ice` | electric blue throwie, droplet glyph | 128x128 | 1 | Polish |
| `pod/voltage` | neon amber throwie, lightning bolt glyph | 128x128 | 1 | Polish |
| `pod/ultra` | neon purple throwie, diamond glyph | 128x128 | 1 | Polish |
| `pod/glyph-<name>` | standalone glyph stamps if kept as overlay sprites instead of vector (star, chevron, droplet, bolt, diamond) | 64x64 | 5 | Polish |
| `pod/chaff-grey` | grey wack tag blob (the buried garbage), 3 rotational variants for visual noise | 64x64 | 3 | Polish |

**Category total 13 (polish).** Vector glyphs in `drawPod` are preferred over the 5 raster stamps, list them so the artist can supply either.

---

## 3. BACKGROUNDS (22 total: 2 MVP, 20 polish)

Portrait phone canvas, two stacked boards. One shared alley plus the title wall covers MVP, per crew and per opponent walls are the polish arc.

| Slug | Description | Size | Qty | Tier |
|---|---|---|---:|---|
| `bg/battle-alley` | shared brick alley behind both boards, throw-up tags on the wall, night lit | 1080x1920 | 1 | MVP |
| `bg/menu-wall` | title / mode-select graffiti wall, big burner space | 1080x1920 | 1 | MVP |
| `bg/block-1-yard` | tier 1 rookie yard (stages 1 to 3), daytime fence and dumpster | 1080x1920 | 1 | Polish |
| `bg/block-2-downtown` | tier 2 downtown wall (stages 4 to 7), dusk | 1080x1920 | 1 | Polish |
| `bg/block-3-rooftop` | tier 3 rooftop and water tower (stages 8 to 11), neon skyline | 1080x1920 | 1 | Polish |
| `bg/block-4-throne` | tier 4 the King's block (boss lead-in), everything half buffed grey | 1080x1920 | 1 | Polish |
| `bg/boss-greyking` | Baron Greymould throne wall, giant GREYKING burner, valley gone quiet grey | 1080x1920 | 1 | Polish |
| `bg/ronin-dojo` | secret duel, lone alley shrine, one red sun, minimalist | 1080x1920 | 1 | Polish |
| `bg/char-<id>` | per opponent wall, that character's TAG as the burner, accent lit (14 ids) | 1080x1920 | 14 | Polish |

**Category total 22 (MVP 2, polish 20).** The per opponent walls (`bg/char-<id>`) can be one shared alley with the TAG burner swapped, so the artist can batch them.

---

## 4. FX (22 total: 0 MVP, 3 Powers, 19 polish)

All FX have a procedural fallback (colored flashes, screen shake, float text). These are enhancement sprites. The Powers 3 are the only FX unique to Powers Mode.

| Slug | Description | Size | Qty | Tier |
|---|---|---|---:|---|
| `fx/pop-splat` | tintable paint splat when a pod group pops, 8 frame strip, colored by the pod | 8x 128 (1024x128) | 1 | Polish |
| `fx/chaff-splat` | grey wack splat when Chaff lands, 6 frame strip | 6x 96 (576x96) | 1 | Polish |
| `fx/allclear-buff` | full screen "BUFF THE BLOCK" neon wipe, grey flips back to color, 12 frame | 12x 540 (or sheet) | 1 | Polish |
| `fx/ko-buffover` | top-out KO, the board gets buffed grey and the winner tags over it, 10 frame | 10x 540 | 1 | Polish |
| `fx/chain-numbers` | stylized wildstyle chain count numerals 0 to 19 for the combo pop | 1 sheet 1024x256 | 1 | Polish |
| `fx/spray-drip` | drip overlay under a landing pod (if not done in `drawPod`) | 64x128 | 1 | Polish |
| `fx/cast-aura` | generic power wind-up ring, accent tint, used by every power in Powers MVP | 8x 256 (2048x256) | 1 | **Powers** |
| `fx/sap-ready` | sparkle burst when the Sap meter hits the equipped power's notch | 6x 128 | 1 | **Powers** |
| `fx/incoming-banner` | the ⚡ INCOMING telegraph glow over the target board during the cast tell | 512x160 | 1 | **Powers** |
| `fx/power-<id>` | per power signature VFX (15 powers: 14 pests plus keeper), Powers MVP falls back to `cast-aura` plus accent | 512x512 (strip ok) | 15 | Polish |

**Category total 22 (Powers 3, polish 19).**

---

## 5. UI (41 total: 9 MVP, 20 Powers, 12 polish)

Board frames are procedural (`drawBoardFrame` strokes the accent). The wildstyle logo, thumbnail, mode plates, VS and result banners are the MVP chrome. The entire Powers HUD (sap bar, orb, loadout, 15 power icons) lives here.

### 5a. MVP chrome

| Slug | Description | Size | Qty |
|---|---|---|---:|
| `ui/logo-chaffwars` | wildstyle burner logo "CHAFF WARS" | 1200x600 | 1 |
| `ui/thumb-portal` | portal card thumbnail (keep under 150KB, under 480px) | 480x360 | 1 |
| `ui/title-keyart` | title screen key art (crew vs Keeper standoff) | 1080x1920 | 1 |
| `ui/mode-classic` | "Classic Campaign" button plate | 512x256 | 1 |
| `ui/mode-endless` | "Solo Endless" button plate | 512x256 | 1 |
| `ui/vs-template` | VS screen frame, two portrait slots and a lightning bar | 1080x1920 | 1 |
| `ui/banner-win` | result banner "BUFFED!" (win) | 1024x400 | 1 |
| `ui/banner-lose` | result banner "TAGGED OUT" (lose) | 1024x400 | 1 |
| `ui/banner-allclear` | "ALL CLEAR" tag stamp shown on the all clear bonus | 768x256 | 1 |

**Subtotal 9 (MVP).**

### 5b. Powers HUD

| Slug | Description | Size | Qty |
|---|---|---|---:|
| `ui/mode-powers` | "Powers Campaign" button plate | 512x256 | 1 |
| `ui/sap-bar` | vertical Sap meter, empty frame plus fill gradient (sage to gold), notch marker | 96x512 (2 files) | 2 |
| `ui/power-orb` | the POWER button base, ready-glow and greyed-disabled states | 128x128 | 1 |
| `ui/loadout-frame` | pre-match "pick 1 power" loadout strip frame | 1080x360 | 1 |
| `ui/power-icon-<id>` | equip picker icon per power (15: 14 pests plus keeper), circular badge in the character accent | 128x128 | 15 |

**Subtotal 20 (Powers).**

### 5c. Polish chrome

| Slug | Description | Size | Qty |
|---|---|---|---:|
| `ui/board-frame` | graffiti tape board frame overlay, accent tintable, replaces the procedural stroke | 9-slice 384x768 | 1 |
| `ui/next-window` | next-pod preview window frame (spray-can stencil look) | 192x256 | 1 |
| `ui/ctrl-<name>` | touch control icons: left, right, rotate, soft-drop, hard-drop | 96x96 | 5 |
| `ui/btn-<name>` | pause, settings, back icons | 96x96 | 3 |
| `ui/ladder-map` | campaign ladder / progress screen art (the block map, 14 nodes) | 1080x1920 | 1 |
| `ui/countdown` | "3 2 1 GO" wildstyle numerals | 1 sheet 1024x256 | 1 |

**Subtotal 12 (polish).**  ·  **Category total 41.**

---

## 6. AUDIO (69 total: 18 MVP, 18 Powers, 33 polish)

80s electro, synth-funk and breakbeat. Music and core SFX are MVP, the power sound layer is Powers, voice tags and extra tracks are polish. All SFX have a procedural beep fallback (the game ships audible).

### 6a. Music (7: 5 MVP, 2 polish)

| Slug | Description | Format | Loop | Qty | Tier |
|---|---|---|---|---:|---|
| `audio/mus-title` | title and menu theme, warm synth-funk | ogg + mp3 | yes | 1 | MVP |
| `audio/mus-battle-a` | core battle loop, electro breakbeat | ogg + mp3 | yes | 1 | MVP |
| `audio/mus-boss` | Baron Greymould boss theme, darker grinding synth | ogg + mp3 | yes | 1 | MVP |
| `audio/mus-victory` | short win jingle | ogg + mp3 | no | 1 | MVP |
| `audio/mus-defeat` | short defeat sting | ogg + mp3 | no | 1 | MVP |
| `audio/mus-battle-b` | mid-ladder battle loop variant (stages 8+) | ogg + mp3 | yes | 1 | Polish |
| `audio/mus-ronin` | secret Ronin Hare duel theme, sparse shakuhachi over a beat | ogg + mp3 | yes | 1 | Polish |

### 6b. SFX (15: 13 MVP, 2 polish)

| Slug | Description | Qty | Tier |
|---|---|---:|---|
| `audio/sfx-move` | pod slide left/right | 1 | MVP |
| `audio/sfx-rotate` | pod rotate | 1 | MVP |
| `audio/sfx-lock` | pod land and lock, spray-can clack | 1 | MVP |
| `audio/sfx-pop` | pod pop set, 12 step pitch ladder up the chain, spray hiss | 1 set | MVP |
| `audio/sfx-chainup` | chain link whoosh | 1 | MVP |
| `audio/sfx-chaff` | grey Chaff drop, wack splat | 1 | MVP |
| `audio/sfx-allclear` | all clear fanfare | 1 | MVP |
| `audio/sfx-ko` | top-out / KO buff-over | 1 | MVP |
| `audio/sfx-ui` | button tap, confirm, back | 3 | MVP |
| `audio/sfx-count` | countdown 3, 2, 1, GO | 1 set | MVP |
| `audio/sfx-spraydrop` | spray-can shake and hiss on hard-drop | 1 | MVP |
| `audio/sfx-scratch` | DJ scratch / record cut flavor stinger | 2 | Polish |

### 6c. Character voice tags (29: all polish)

Cheap flavor, but VO recording is real work, so all polish.

| Slug | Description | Qty | Tier |
|---|---|---:|---|
| `audio/vo-tag-<id>` | one-shot TAG callout per character (TOYZ, KOLE, FLUTTA, SLIME, KUTT, SCARAB, GEDDON, KAWZ, DIGZ, DAPPL, VINE, HAZE, GREYKING, 1BLADE, keeper) | 15 | Polish |
| `audio/vo-taunt-<id>` | full spoken taunt line per pest (the 14 existing taunt strings) | 14 | Polish |

### 6d. Power sounds (18: all Powers)

| Slug | Description | Qty | Tier |
|---|---|---:|---|
| `audio/pwr-cast` | power cast wind-up whoosh | 1 | Powers |
| `audio/pwr-ready` | Sap meter ready chime | 1 | Powers |
| `audio/pwr-incoming` | INCOMING warning alarm on the target | 1 | Powers |
| `audio/pwr-hit-<id>` | per power impact SFX (15 powers) | 15 | Powers |

**Category total 69 (MVP 18, Powers 18, polish 33).**

---

## Build order recommendation

1. **Classic MVP (44):** 15 idle portraits, 2 backgrounds, 9 UI, 18 audio. Ship the themed cartridge.
2. **Powers (41):** the sap bar, orb, loadout, 15 power icons, 3 power FX, 18 power sounds. Powers Mode becomes real.
3. **Polish arc (160):** breakdance strips and win/lose/taunt poses, per opponent graffiti walls, tier block backdrops, pop/chaff/all-clear/KO FX, voice tags, extra tracks.

**Pipeline reminders for the cut:** magenta-key portraits and FX cut with `scripts/mkart.py` (the Acorn Drop path); the hollow board-frame trick from Acorn Drop applies if `ui/board-frame` is delivered as a windowed overlay (normalize the transparent window to the grid rect so geometry does not shift, draw on top of pods). Log every drop in `art-asset-lists/ART-LEDGER.md` as `LISTED` the moment this doc goes to Drive, then `DROPPED` when files land in `satellites/chaff-wars/art-drop/` (raw committed before cutting, per ledger rule 6).

Relevant paths: game at `/workspaces/lucid-winds/satellites/chaff-wars/index.html` (ROSTER lines 415 to 429, `drawPod` line 642, `PAL` lines 417 to 422, `drawBoardFrame`), brief at `/workspaces/lucid-winds/design-briefs/chaff-wars.md`, ledger at `/workspaces/lucid-winds/art-asset-lists/ART-LEDGER.md`.