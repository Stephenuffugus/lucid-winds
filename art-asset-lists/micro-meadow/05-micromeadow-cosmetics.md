<!-- Micro Meadow · Sheet 5: Cosmetics — Theme cards + Prompt frames + Keepsake blooms + Wardrobe furniture -->
<!-- 💰 COSMETICS / ECONOMY sheet. Copy everything below into your image generator to make this ONE sheet. -->

STYLE — "Firefly Funfair" (Micro Meadow / Sky Wolf Studios blink-fast microgame carnival). Collectible festival keepsakes from a moonlit meadow funfair: chunky rounded pieces, each with one soft cream rim-light and a gentle inner glow, luminous but never neon-blown, readable at wardrobe-thumbnail size. Soft cel + a whisper of gouache grain. Colorblind law: the three prompt frames differ by SILHOUETTE (sprig leaves vs gilded laurel vs petal garland), never color alone. Flat front-on camera, subjects centered and upright. Palette: meadow-night #0b0f0b #0d100c #0f150c #141d12 #1a2415, hedge #2a331f, deep moss #3f6b34, stem #5c8f3f, sage #7ab356; festival gold #c8a84b #d9b85a #eed48a, lantern bloom #ffe9a8, bug-yellow #d9c25a; cream #e8dcc8, muted #8a9178; petal pink #e58fa0, ripe red #c83a4a, alarm #e56b6b, plum #7d3450; moon blue #5b9bd5, dew #bfe0f2, violet #b57de0; timber #8a5a2b #5c3a1a; theme washes #141d12/#0b110a, #1c1420/#0d0810, #1d1810/#100b06, #111a22/#080d12. NO photoreal, NO hard black keylines, NO text/letters/numbers/logos/watermarks. Compress under 150KB.

Create one sprite sheet. File: mm_cosmetics.png. Grid: 4 columns x 4 rows (16 cells, left-to-right, top-to-bottom). Cell: 512x512. Master: 2048x2048.

KNOCKOUT: Flat magenta #FF00FF fills the entire background of every cell. NO magenta / hot-pink ANYWHERE inside the art (keep petal pink #e58fa0 and violet #b57de0 clearly distinct from #FF00FF). Each item centered, upright, fully inside its cell with margin, glow contained, NO ground shadow (these composite into the wardrobe grid, the prompt HUD and the Bloom Gallery). Cosmetics are PURELY VISUAL — they never change a microgame's hitboxes, timings or symbol cues.

MEADOW THEME PREVIEW CARDS (cells 1–4) — rounded mini-landscape tiles for the wardrobe (they replace the current 🌿 placeholder glyph on each theme card). Each shows its theme's real two-stop night wash with a signature bottom fringe; named and thresholded to match the code (`THEMES[]`):
1. theme_card_night — "Night Meadow" (starter, free): #141d12→#0b110a wash, soft sage #7ab356 grass fringe, two firefly specks.
2. theme_card_rosedusk — "Rose Dusk" (unlock: clear 40 rounds): #1c1420→#0d0810 wash, a faint petal-pink #e58fa0 afterglow line, dark rose grass fringe.
3. theme_card_amber — "Amber Field" (unlock: clear 80 rounds): #1d1810→#100b06 wash, warm gold #c8a84b lantern haze over wheat-stalk fringe.
4. theme_card_frost — "Frost Glade" (unlock: grow 6 blooms): #111a22→#080d12 wash, dew-blue #bfe0f2 frost glints on the grass fringe.

PROMPT FRAMES (cells 5–7) — marquee garlands that dress the flashing prompt word; each is a matched LEFT+RIGHT flourish pair hugging an EMPTY center slot (the engine prints the word between them, tinted to the frame's color). Named to match the code (`FRAMES[]`); each MUST differ by silhouette, not just color:
5. frame_sprig — "Sprig" (starter, free): a light pair of sage #7ab356 leaf sprigs, simple and fresh — the everyday call-board dressing.
6. frame_goldleaf — "Gold Leaf" (unlock: 25 Daily Dash days — the in-game card reads "25 in a row"): a gilded festival laurel pair in gold #c8a84b/#eed48a with tiny lantern glints — the headliner's marquee.
7. frame_petal — "Petal" (unlock: grow 3 blooms): a soft petal-garland pair in pink #e58fa0 with a small cream bow at each base — the flower-show dressing.

KEEPSAKE BLOOM PIECES (cells 8–12) — the Bloom Gallery flowers the engine grows when the meter fills (drawKeepsake: 5–9 petals around a gold core, hue picked from its five-color set):
8. keepsake_petal — ONE neutral cream #e8dcc8 rounded keepsake petal with a soft rim-light, color-neutral so the engine can tint it to any of its five hues (#e58fa0 #c8a84b #b57de0 #5b9bd5 #7ab356). No shadow.
9. keepsake_core — the keepsake's center: a lantern-gold #ffe9a8 disc with a gentle halo glow, sized to sit over the petal ring.
10. keepsake_pink — an example finished keepsake: FIVE round petals in petal pink #e58fa0 around the gold core — the minimum-petal bloom.
11. keepsake_violet — an example with SEVEN petals in violet #b57de0 around the gold core — a mid-count bloom.
12. keepsake_blue — an example with NINE petals in moon blue #5b9bd5 around the gold core — the maximum-petal bloom. (Petal count varies per keepsake in code; these three show the range.)

WARDROBE FURNITURE (cells 13–16) — the pieces the wardrobe and gallery screens use:
13. ward_card — the wardrobe card plate: a rounded dark #0f150c face with a thin hedge #2a331f rim and a subtle timber footer band (matches the .wardcard tile; engine composites the preview + name text).
14. ward_lock — the locked state overlay: a dim translucent night veil with a small chunky timber #5c3a1a padlock with a gold #c8a84b keyhole glint, centered.
15. ward_equipped — the equipped highlight: a bright festival-gold #c8a84b glow ring / border overlay that hugs the currently equipped card (matches the gold .wardcard.on border in code).
16. progress_sprout — a pictographic progress token for locked cards: a thin rounded arc part-filled with gold #c8a84b ending in a tiny sage bud at the goal end — "keep playing, it's growing" at a glance. It SUPPLEMENTS the engine's threshold text, never replaces it: renderWardList (~505) prints the numeric unlock condition (`it.desc`) on every locked card, and that known-threshold promise from the economy doc stays — this token sits beside the desc line as decoration (art carries no numbers itself; the engine owns them).
