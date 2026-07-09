# Rootbound — Art Direction

> A calm, meditative Klotski puzzle set in a walled night garden: slide the ceramic planters aside and coax the golden bloom out the gate.

**Genre:** Sliding-block (Klotski) logic puzzle — slide planters aside to free the golden bloom out the garden gate

## Pick a look (kid-friendly options)

### 1. Moonlit Kitchen Garden — *cozy*
Warm painterly storybook gouache — visible brush texture, soft edges, hand-illustrated planters glowing under lantern light against a deep blue-green night. Terracotta and enamel kitchen-garden pots (basil, thyme, a golden marigold hero) with loose leafy sprouts, dew, and firefly sparkles. Palette leans warm and inviting: midnight teal, terracotta, honey-gold, sage, cream. Reads as a beloved children's picture book — the coziest of the three, but still crisp enough to stay readable at small size.

### 2. Glazed Nightfall — *polished* ⭐ RECOMMENDED
Clean modern illustrated game art with a soft studio-render finish: hand-thrown ceramic planters in rich reactive GLAZES (deep teal, plum, moss, amber) that each catch one crisp specular highlight and a warm brass rim-light on a dark slate night-garden. Smooth vector-plus-gradient forms, gentle ambient occlusion where pot meets loam, jewel-toned but restrained. Feels premium and grown-up without a shred of grimness — the strong glossy silhouettes pop at thumbnail size and compress beautifully. Sophisticated, calm, meditative, unmistakably kid-friendly.

### 3. Zen Night Garden — *elegant*
Japanese karesansui (dry-stone garden) elegance rendered in soft ink-wash plus flat matte color: pale raked-sand soil, smooth river-stone and matte-ceramic planters, a single moss cushion or moon-orchid per pot, a round brass moon-gate at the exit, and a hovering pale moon. Minimal, spacious, sophisticated palette of charcoal, sand-cream, moss, slate, with one rose-gold accent on the hero. The most mature and refined option — quiet and beautiful, though slightly less colorful/playful than a casual portal usually wants.

**Recommended: Glazed Nightfall.** Sheets here already use this look; to try another, swap the first STYLE paragraph in each sheet file.

## Sheets (generate each separately)

- `01-rootbound-bg-sheet.md` — Sheet 1 — Backgrounds (full-bleed)
- `02-rootbound-pieces-sheet.md` — Sheet 2 — Planters & FX (cutout sprites)

## Style block (baked into every sheet prompt here)

```
STYLE — "Glazed Nightfall": Polished modern illustrated game art with a soft studio-render finish and a glossy glazed-ceramic look. Every planter is a hand-thrown ceramic pot or trough with a rich reactive glaze that catches ONE crisp specular highlight plus a warm brass rim-light; forms are smooth clean vector-plus-soft-gradient shapes with gentle ambient occlusion where the pot meets the soil. Dark contemporary night-garden mood, calm and premium and meditative. Palette: slate base #1a2321, near-black green shadow #0e140d, glazed sage #6fae5a, deep teal glaze #2f6d63, plum glaze #5b3a63, moss glaze #3c5a2c, warm amber/brass glaze #c8a84b with #d8b24e highlights, cream highlight #ece1cd, rose-quartz #e58fa0 for the hero bloom and gate glow, wet dark loam #241a12 for soil. Each object must read instantly as a bold chunky silhouette at small size — one strong glint per object, no clutter, clean edges. Sophisticated but warm and completely kid-friendly: no gore, no scary faces, no horror, no photorealism, no busy hyper-3D render. No text, no captions, no letters, no numbers, no borders, no UI elements. Bold simple shapes with smooth shading that quantize and compress cleanly under 150KB.
```

## Wire notes

Add an RB_ART image loader mirroring the Nectar Drop pattern (art replaces the procedural draw when the image is loaded, falls back to the existing vector draw when absent). Map cut assets to code paths: (1) drawPiece() at index.html ~L475 — switch on pc.t: 'CC' -> golden_bloom_planter; 'S' -> small_pot_a / small_pot_b by (pc.id % 2); 'V' and 'H' -> green_planter_a / green_planter_b / green_planter_c by (pc.id % 3). drawImage into pieceRect(pc); keep the current vector body as fallback. Because the engine stretches one green sprite across both 1x2 and 2x1 slots, the green planters MUST be authored as soft rounded rectangles (already specified). (2) render() background at L522-563 — draw play_bg in place of the gradient fill + bed frame + wall/gate/grid strokes; the bed geometry is fixed (stage rect x36 y160 468x585 on the 540x960 stage = 3x -> x108 y480 1404x1755 in the 1620x2880 cell) so it is baked into play_bg. Swap the goal-ghost rect (L557-560) for target_bloom_ghost. (3) Screen backdrops — set the .screen CSS background (title/how/settings/win) to menu_bg. (4) burst()/particle draw at L572 & L602 — replace the flat arc() dots in the escape/win flourish with win_petal + win_sparkle. Recommended asset folder: satellites/rootbound/assets/ (cut sprites as assets/rootbound_pieces_sheet_<name>.png, backgrounds as assets/menu_bg.jpg + assets/play_bg.jpg). Bump a ?v= cache-bust on the portal deploy.

