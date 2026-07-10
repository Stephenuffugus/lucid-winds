<!-- Berry Vine · Sheet 6: Cosmetics — Pod skins + Berry palettes + wardrobe furniture -->
<!-- 💰 COSMETICS / ECONOMY sheet. Copy everything below into your image generator to make this ONE sheet. -->

STYLE — "Starberry Cosmos" (Berry Vine / Sky Wolf Studios cozy-cosmic marble-arcade). Glossy launch pods and glowing star-berry orb sets, cosmic and collectible. Rounded chunky silhouettes, ONE soft rim-light + gentle inner glow each, restrained bloom, luminous but never neon-blown; reads at thumbnail. Soft cel + gradient sheen, subtle grain, NO photoreal, NO harsh keylines, NO text/numbers/logos/watermarks. Palette: void #05070a/#0d100c, nebula indigo #1a1636/#241a4a; star-berry hues rose #e24d6a, sky-blue #4d7fe2, amber #e2b34d, teal #3fb6a8, violet #a468d8, green #7ab356; launch-gold #c8a84b + bloom #ffe9a8 + cream #e8dcc8, moss #8a9178, dusk line #2a331f, comet-dew #bfe0f2 / moon-blue #5b9bd5, rose #e58fa0, alarm plum #7d3450 + warning #e56b6b, warm metal #8a5a2b/#5c3a1a, spark violet #b57de0. Compress under 150KB.

Create one sprite sheet. File: bv_cosmetics.png. Grid: 4 columns x 4 rows (16 cells). Cell: 512x512. Master: 2048x2048.

KNOCKOUT: Flat magenta #FF00FF fills every cell's background. NO magenta / hot-pink inside the art (keep rose and violet distinct from #FF00FF). Each item centered, upright, fully inside its cell with margin, NO ground shadow (these composite freely into the wardrobe grid, the shooter, and gameplay). Each is a self-contained collectible with a thin cream rim-glow. These are PURELY VISUAL skins — never change any orb size, path or hitbox.

LAUNCH-POD SKINS (cells 1-4) — reskins of the center shooter, same chunky pod silhouette + mouth socket as the base pod, each pointing UP (small contact shadow allowed). Named to match the code (`PODS`):
1. pod_seedpod — "Seedpod" (starter, free): the warm metal #5c3a1a / #8a5a2b base pod with a gold collar and cream rim-light; the default.
2. pod_amber — "Amber Pod" (unlock: clear 3 beds): a warm amber / launch-gold #c8a84b → #ffe9a8 pod, glowing honeyed, cream rim; sunlit.
3. pod_blossom — "Blossom Pod" (unlock: clear 8 beds): a soft rose #e58fa0 / cream pod dusted with tiny star-blossom glints, gentle pink glow.
4. pod_thorn — "Thorn Pod" (unlock: Bloom Rush best ≥ 6000): a darker plum #7d3450 pod with a few bold spike-fins tipped in warning #e56b6b and a cool cream rim; the "tough" mastery pod (spiky but still rounded, not scary).

BERRY PALETTE SETS (cells 5-8) — each cell shows that palette's SIX star-berry orbs in a neat row (circle, heart, star, teardrop, diamond, hex in that order, so the shapes stay constant and only the colors change). Named to match the code (`PALS`):
5. pal_orchard — "Orchard" (starter, free): rose #e24d6a, sky-blue #4d7fe2, amber #e2b34d, teal #3fb6a8, violet #a468d8, green #7ab356 (the exact default palette).
6. pal_dusk — "Dusk" (unlock: clear 5 beds): softened dusk hues — #f06b8a, #6b8ff0, #f0c96b, #5ad0c0, #bb84e8, #8fce6a.
7. pal_frost — "Frost" (unlock: clear 12 beds): cool pale pastels — #e88aa0, #7fb0e8, #e8d68a, #8fe0d4, #c9a0ec, #a8d888.
8. pal_ember — "Ember" (unlock: 3-day Daily streak): warm fire tones — #ff6b5a, #ffa84d, #ffd24d, #d0e05a, #ff8a6b, #e0b04d.

WARDROBE FURNITURE (cells 9-16) — the pieces `renderWard()` and the wardrobe screen use:
9. ward_card_frame — a rounded cut cosmic tile frame for a wardrobe / pod preview card: dark #0f150c face, thin sage #7ab356 rim-glow, subtle indigo inner mat (engine composites the pod/palette preview + its name).
10. ward_card_locked — the locked version of the same frame: dimmed, desaturated, with a small warm-metal #5c3a1a padlock centered.
11. ward_equipped_ring — the "equipped" highlight: a bright rose #e24d6a glow ring / frame overlay that hugs the currently-equipped card (matches the code's rose equipped border).
12. unlock_badge — a small celebratory "unlocked!" star-burst badge in cream + gold, to pop on a card the moment its threshold is met.
13. pod_exhaust_glow — a shared soft cream / gold thruster glow that sits under ANY pod skin at the base (reusable across all four pods). On transparent, no shadow.
14. palette_swatch_chip — a compact six-dot palette swatch chip (six small orbs in a rounded row on a dark chip) for tight palette-picker display; render one generic version in the Orchard colors.
15. mastery_meter — a small pictographic progress token: a thin rounded arc/ring partly filled with gold, a tiny star at the goal end (shows "progress toward the next unlock" with NO numbers).
16. lock_padlock — a standalone chunky warm-metal #5c3a1a / #8a5a2b padlock with a sage keyhole glint, for any locked cosmetic slot.
