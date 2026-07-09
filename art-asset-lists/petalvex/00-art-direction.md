# Petalvex — Art Direction

> A calm, cerebral edge-matching puzzle where numbered enamel leaf-tiles lock into a night garden bed, every seam a color-coded handshake of numbers.

**Genre:** Edge-matching logic puzzle (botanical TetraVex): rotate/slot square 4-wedge leaf-tiles into an N×N garden bed so every touching seam shares a number.

## Pick a look (kid-friendly options)

### 1. Pressed-Garden Herbarium — *cozy*
Warm botanical-specimen look: each wedge is a pressed leaf or petal mounted on aged parchment, faint fiber texture, hand-inked contour lines and a librarian's neat linework. Muted herbarium palette (tea-stained cream #e8dcc8, dried sage, sepia) over the dark bed, calm and studious like a naturalist's field journal. The gentlest, warmest option; reads storybook-cozy but a step more grown-up and refined than paper-craft cutouts.

### 2. Enamel Botanica — *elegant* ⭐ RECOMMENDED
Jewelry-grade cloisonné enamel: every tile face is a glossy pour of saturated vitreous color inside thin polished antique-gold wire, botanical motifs inlaid like an Art-Nouveau garden brooch. Deep near-black forest ground makes the enamel and gold glow; the ten value hues stay crisp and distinct so bold cream numbers read cleanly on top, and gold seams echo the game's gold solved-seam and locked-tile language. Polished and museum-handsome yet wholesome and kid-friendly — the recommended fit for a precise logic puzzle.

### 3. Stained-Glass Conservatory — *bold*
Leaded stained-glass panes glowing in a night greenhouse: each wedge is a slab of luminous colored glass held in dark lead came, backlit so the value hues radiate. Graphic, high-contrast, vibrant — great arcade pop and instant color reads. A touch more dramatic and stylized than Enamel Botanica; equally kid-safe, just louder and more luminous.

**Recommended: Enamel Botanica.** Sheets here already use this look; to try another, swap the first STYLE paragraph in each sheet file.

## Sheets (generate each separately)

- `01-petalvex-bg-sheet.md` — Sheet 1 — Backgrounds (full-bleed)
- `02-petalvex-wedge-sheet.md` — Sheet 2 — Tile value wedges (cutout)
- `03-petalvex-badge-fx-sheet.md` — Sheet 3 — Mode badges + win FX (cutout)
- `04-petalvex-logo-win-sheet.md` — Sheet 4 — Logo + win hero (cutout)

## Style block (baked into every sheet prompt here)

```
STYLE — "Enamel Botanica": Elevated cloisonné-enamel puzzle art. Every tile face is glossy vitreous enamel — a smooth, saturated, glass-like color field poured inside thin, polished antique-gold cloisonné wire that draws each shape's outline and inner veining. Botanical motifs (leaf blades, petals, seeds, dewdrops, pollen) rendered as clean stylized enamel inlay, jewelry-grade, like museum champlevé brooches and Art-Nouveau garden enamelware. Deep near-black forest-green ground (#0e140d) with a subtly brushed metallic darkness so bright enamel and gold wire seem to glow. Keep the ten value hues crisp and distinct, matching the code palette exactly: value 0 cocoa-bark #7c5a34, 1 sage #7ab356, 2 antique-gold #c8a84b, 3 rose #e58fa0, 4 teal #5fb0c6, 5 lavender #a878cf, 6 pumpkin-copper #d4842a, 7 linen-stone #d5c9b0, 8 berry-red #d24b4b, 9 lime #8fd06a. Lighting: soft top-down key with a single crisp glassy specular highlight per enamel field and a warm gold rim along every wire edge, plus a gentle inner shadow where enamel meets metal. Mood: calm, precise, jewel-like, sophisticated botanical — grown-up-handsome but always wholesome and kid-friendly, never grim, never scary, no gore. Clean bold silhouettes first, chunky arcade readability at small sizes; leave tile faces uncluttered and matte-centered so a bold stamped number reads cleanly on top. No photorealism, no 3D CGI render, no text, no captions, no borders, no UI words unless a cell explicitly names logo text. Keep detail bold and simple enough that each cropped asset compresses cleanly under 150KB.
```

## Wire notes

Recommended asset folders (fleet pattern, cache-bust with ?v= on deploy): satellites/petalvex/assets/bg/, assets/tiles/, assets/ui/, assets/fx/. Add an ART/IMG preload map + onerror fallback to the existing canvas/emoji draws so missing files degrade gracefully.\n\nCode paths (index.html):\n- bg_bed -> render() ~line 385: replace the '#101610'->'#0a0d09' linear-gradient fill with drawImage scaled to VW×VH before the grid draws. bg_menu -> CSS background-image on the .screen containers (title/modes/how/settings, ~line 33).\n- wedge_0..9 + wedge_plain + tile_frame -> drawTile() ~line 316. For each of the 4 quads do save -> clip(triangle: quads[q]) -> translate/rotate 0/90/180/270 -> drawImage(WEDGE[tile.edges[q]]) -> restore, keying off VCOL index (0-9). Use wedge_plain when SET.color===false (replaces the '#26301c' fill). Then KEEP the existing number pass (VINK/ VCOL text, ~lines 338-344) drawing ON TOP — numbers must always render last (ground truth). tile_frame drawn last over the tile, replacing/overlaying the outer strokeRect ~line 346; keep the gold locked-tile tint (#c8a84b) and 🔒 logic ~line 347-349.\n- mode_sprout/bud/bloom/thicket/daily -> buildModeList() ~line 623: swap m.ico emoji ('mc-ico' div) for <img>. Key map: s3=mode_sprout, s4=mode_bud, s5=mode_bloom, s6=mode_thicket, dly=mode_daily (MODES ~line 228).\n- logo_petalvex -> replace the .title-word text node in #s-title ~line 92 with <img>.\n- win_bloom -> replace the 🌼 <div> node in #s-win ~line 142 with <img>.\n- fx_petal_a / fx_petal_b / fx_pollen -> particle loop in render() ~line 425 and burst() ~line 438: swap the ctx.arc circle draw for a rotated drawImage of these motes (rotate by a per-particle angle; pick petal_a/petal_b/pollen by particle type). VCOL still drives burst tint at ~line 560.\n\nOrientation/anchor quirks: wedge sprites are authored as a TOP-pointing-inward triangle (base on the cell's top edge, apex at center) — the engine rotates each 0/90/180/270° to skin top/right/bottom/left, so the strong color + gold wire must sit on the BASE edge and the apex/inner face must stay clean for the stamped number. tile_frame is the only wedge-sheet cell that is a full square with a transparent (knockout) center. Every cut asset must compress under 150KB; keep bg long edge <=1600px final.

