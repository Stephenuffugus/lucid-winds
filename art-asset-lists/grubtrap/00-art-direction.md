# Grubtrap — Art Direction

> A moonlit field-mouse tactician who bulldozes stone planters to corner chubby garden grubs, curling each trapped one into a glowing gold seedball, one grid "ground" at a time.

**Genre:** Top-down grid puzzle-action (Rodent's Revenge remake) — shove planters to pen garden grubs into corners until they curl into gold seedballs

## Pick a look (kid-friendly options)

### 1. Storybook Dusk — *cozy*
Warm hand-painted gouache storybook. Soft rounded forms with visible brush texture and honey-amber lantern glow over a dusky garden bed, palette leaning warm — honey golds, moss greens, terracotta, a blush mouse. Reads like a cozy picture-book puzzle: inviting, gentle contrast, unmistakably friendly. This is the safest, most childlike of the three — a refinement of the old felt look, not a departure.

### 2. Moonlit Warren — *elegant* ⭐ RECOMMENDED
Polished, elegant top-down botanical puzzle look — clean illustrated vector forms with soft gradient depth and a whisper of painterly grain, like a premium mobile puzzle set in a moonlit night garden. Real garden materials (loam, mossy hedges, glazed terracotta, dewy leaves, polished gold seed-pods) instead of craft supplies, a sophisticated nocturnal palette, cool moonlight rim-light against warm gold reward glow. Grown-up and premium-feeling while staying warm, cute and 100% kid-safe.

### 3. Neon Nocturne — *bold*
Crisp flat-design vector arcade. Bold confident shapes, minimal gradients, thick color blocking and a vivid saturated palette — electric-lime grubs, hot-gold seedballs, deep-indigo board, glowing rim accents. The most graphic and least illustrative option: modern app-icon energy with maximum high-contrast punch and instant thumbnail readability. Snappy and playful without any storybook softness.

**Recommended: Moonlit Warren.** Sheets here already use this look; to try another, swap the first STYLE paragraph in each sheet file.

## Sheets (generate each separately)

- `01-grubtrap-sprites.md` — Sheet 1 — Board tiles, critters & FX (cutout sprites)
- `02-grubtrap-menu-bg.md` — Sheet 2 — Menu background (full-bleed portrait)

## Style block (baked into every sheet prompt here)

```
STYLE — Moonlit Warren: a polished, elegant top-down botanical puzzle look. Clean illustrated vector forms with soft gradient depth and a gentle painterly grain — a premium mobile puzzle set in a moonlit night garden, sophisticated but warm, cute and fully kid-friendly (never scary, no gore). Everything reads as a living garden, not craft supplies: real crumbly soil, mossy hedges, glazed terracotta planters, dewy leaves, polished gold seed-pods. Nocturnal palette: deep near-black teal-green base #0d1512 with #16211a shadows, warm soil #1c2a1f, terracotta and bark #6b4a2b to #8a6a3e, living sage #6fae57 with bright leaf tips #8fce6a and deep hedge #2f4a2c, antique gold rewards #d4af4e over #a07d2c cores, cream highlight #ece0c8, rose accent #e58fa0 for the mouse and peril, cool moonlight rim #cfe6d8. Lighting: soft top-down key with a cool moonlit rim on the upper-left and a warm gold under-glow on rewards, plus gentle ambient occlusion where objects meet the ground. Crisp confident silhouettes first — this is a top-down tile board, so every tile and critter must read instantly at thumbnail size with chunky arcade clarity. Smooth clean rendering with subtle grain; no photorealism, no 3D CGI render, no harsh cartoon outlines. No text, no captions, no logos, no UI words, and no borders or frames drawn around any cell. Keep detail bold and simple enough that each cropped asset compresses cleanly under 150KB.
```

## Wire notes

No ART/Image hook exists yet — the game draws everything procedurally. Add a small ART image map and swap draws when the sheet is loaded and cut into 512px cells. Mapping: tile_soil / tile_soil_pebbles -> render() cell loop, v===0 empty soil over the #171008 field fill (~line 397); tile_planter / tile_planter_bloom -> v===1 planter block (~lines 398-403); tile_hedge / tile_hedge_corner -> v===2 wall draw (~lines 404-407), tile_hedge_corner replaces the brown strokeRect field frame (~line 416); tile_seedball / tile_seedball_pop -> v===3 seedball (~lines 408-413), use _pop for the just-trapped flash in checkTraps(); mouse_hero / mouse_caught -> drawHero() (~lines 440-453), _caught during the G.invuln>0 flash after heroCaught(); grub_green / grub_fast -> drawGrub() (~lines 454-467), pick _fast when grubInterval() is short (higher levels); life_pip -> drawWhisker() HUD lives (~lines 437-439, 388); fx_trap_burst -> gold burst() in checkTraps(), fx_caught_alarm -> orange burst() in heroCaught(), fx_clear_leaves -> green burst() in levelClear(); menu_bg -> CSS .screen background behind #s-title / #s-how / #s-set / #s-over (~line 33). ANCHOR QUIRKS: tiles anchor top-left and must butt-tile seamlessly (draw at full CS with no gap). Critters (drawHero/drawGrub) translate to cell CENTER with NO per-direction rotation in code, so sprites must be authored in a neutral top-down pose (facing up / symmetric) — the engine will not rotate them to face movement. Keep baked contact shadows faint; the engine still draws its own ellipse drop-shadow under hero and grubs. RECOMMENDED FOLDER: create satellites/grubtrap/assets/ and load with a build version query (e.g. assets/grubtrap_sprites.png?v=<build>) per the Hostinger cache/resizer caveat. The CSS wordmark 'Grubtrap' can stay as sage text — no separate logo cell needed.

