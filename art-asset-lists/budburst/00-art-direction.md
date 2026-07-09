# Budburst — Art Direction

> A moonlit conservatory bubble shooter where you launch glowing flower-buds to burst clusters, free trapped seeds, and topple the Bloom Core.

**Genre:** Botanical bubble shooter (Puzzle Bobble / Bust-a-Move lineage) — fire colour-buds up to burst matching clusters, rescue seeds, cut brambles, and destroy a Bloom Core boss across 12 garden worlds.

## Pick a look (kid-friendly options)

### 1. Twilight Terrarium (cozy) — *cozy*
Warm storybook gouache — soft rounded forms, visible brushy texture, gentle hand-painted botanical charm like a bedtime picture book set in a little glass terrarium. Cozy dusk palette of mossy greens, warm honey gold, blush rose and deep ink-teal, with fat friendly silhouettes and a snug hand-drawn glow. It keeps the warmth of the old paper-craft look but trades the childish felt/macrame gimmick for cleaner, more confident illustration.

### 2. Nocturne Glasshouse (polished) — *painterly* ⭐ RECOMMENDED
A premium painterly-illustrated look set inside a moonlit Victorian conservatory at night: dewy glass-petal blooms, glossy jewel-toned buds, verdigris-copper framing and misted panes catching cool moonlight and warm brass rim-light. Rich digital gouache with clean confident edges — soft painterly gradients on the forms, crisp readable silhouettes at the perimeter. Deep jewel palette over near-black feels sophisticated and grown-up while staying magical and kid-safe.

### 3. Bioluminescent Bloom (bold) — *bold*
Crisp neon-retro arcade energy: near-black garden at night lit entirely by glowing bioluminescent flora, rim-lit blooms with saturated cyan/magenta/lime cores, clean vector shapes and punchy synthwave glow. High-contrast and vibrant, reads instantly at tiny sizes, but the deep dark field keeps the play area calm. Bold and eye-catching without any grit or grimness.

**Recommended: Nocturne Glasshouse (polished).** Sheets here already use this look; to try another, swap the first STYLE paragraph in each sheet file.

## Sheets (generate each separately)

- `01-budburst-bg-sheet.md` — Sheet 1 — Backgrounds (full-bleed atmosphere)
- `02-budburst-props-sheet.md` — Sheet 2 — Launchers & special tiles (cutout sprites)

## Style block (baked into every sheet prompt here)

```
STYLE — Nocturne Glasshouse: a polished, painterly botanical-illustration look for a bubble-shooter set inside a moonlit Victorian conservatory at night. Render as rich digital gouache with clean, confident edges — soft painterly gradients and gentle volumetric glow on the forms, but crisp readable silhouettes at the perimeter. Materials read as living and premium: dewy glass petals, glossy jewel-toned blooms, verdigris-copper glasshouse framing, misted panes, wet foliage catching moonlight. Deep jewel palette over near-black — conservatory-night base #0b1410, deep emerald #1f6f52, bright jade #2fa877, glass-teal #1b7a8c, moonlit plum #4a2a5c, warm brass gold #cfa24a, moonlit cream #eae4d2, rose-quartz accent #e58fa0. Cool moonlight key from the top with a warm brass rim-light; subtle bloom on light sources, soft depth haze at the edges. Sophisticated and grown-up but always kid-friendly — no gore, no sexualization, no scary faces, cozy-magical not grim. Chunky arcade readability at small sizes: bold shapes first, fine detail second. No photorealism, no 3D render, no text labels, no captions, no borders, no UI words unless a logo cell says exact logo text. Keep detail bold and simple enough that each cropped asset compresses well under 150 KB.
```

## Wire notes

Confirmed against live code (satellites/budburst/index.html, 1599 lines). Three surfaces only — the 6 colour-buds stay procedural (SKINS[].cols/glyphs recolour them for the 16-skin cosmetic + colourblind economy; do NOT sprite them, or drawGlyph/_drawGlyphOn shop previews).\n\nBACKGROUNDS (folder assets/bg/): hook applyBg() ~line 753 — it currently sets a radial-gradient on #app from equippedBg().top/bot. Swap to background-image:url(assets/bg/<id>.jpg?v=<build>) keyed by equippedBg().id. BGS ids (line 470): night, dawn, dusk, tide, ember, aurora. Wire bg_menu_title behind #menu (or body). Each is portrait full-bleed 1620x2880; keep the vertical center dark so the bubble field + aim line read.\n\nLAUNCHERS (folder assets/launcher/): hook the launcher-base draw in render() ~lines 1246-1249, where it currently draws ctx.arc(sx,sy,R*1.35,PI,0) as a half-dome keyed by the lbase colour map. Replace with drawImage(assets/launcher/<id>.png) centered at shooterOrigin() {sx,sy}, width ~R*3 (~90px). LAUNCHERS ids (line 462): clay, brass, stone, crystal, vine, gold. Sprites are upward-facing vessels, rim on the horizontal center — anchor the image so the rim sits at sy (the buds fire up from there).\n\nSPECIAL TILES (folder assets/tiles/): hook drawBud() ~line 1135 in the rainbow/bomb/seed/thorn/core branches. Add a window.BB_ART[kind] lookup that drawImages the sprite at the cell (radius ~R, buds render ~44px) when img.complete, else falls through to the existing procedural draw (KEEP procedural as fallback). File-to-kind map: bud_bomb→bomb, bud_rainbow→rainbow, bud_seed→seed, bud_thorn→thorn, boss_bloom_core→core. These are fixed-colour (base colours in code: bomb #2b2f26, rainbow #cccccc, seed #d8ad4a, thorn #6f7860, core #3a1230) — bypass the skin recolour, do not tint to garden hues.\n\nLoad all images once at boot into an Image() cache; gate every drawImage on img.complete. Cache-bust src with ?v=<build> per the Hostinger image-resizer/cache fleet rule (host resizes >1600px and ignores no-cache headers). Verify every cut asset compresses under 150KB (dark low-detail backgrounds will easily; watch the crystal/gold launchers and boss_bloom_core).

