<!-- Leaf Fit · Sheet 5: Cosmetics — Leaf sets + Trellises + wardrobe furniture + Grove keepsakes -->
<!-- 💰 COSMETICS / ECONOMY sheet. Copy everything below into your image generator to make this ONE sheet. -->

STYLE — "Leadlight Conservatory" (Leaf Fit / Sky Wolf Studios midnight glass-garden puzzle). Collectible stained-glass leaf sets and trellis boards, displayed like jewel swatches in a night wardrobe. Chunky rounded kid-friendly forms; flat glass fills with ONE soft inner glow each, thin dark lead lines, restrained bloom — luminous, never neon-blown; reads at thumbnail. Soft cel, subtle grain, NO photoreal, NO harsh bevels, NO text/letters/numbers/logos/watermarks. Palette: midnight #0d100c/#0b0f0b/#0f160e, board darks #0b110a/#141d10, dusk line #2a331f, sage #7ab356, brass gold #c8a84b, bloom cream #ffe9a8, cream #e8dcc8, moss #8a9178, dew glass #bfe0f2, petal pink #e58fa0, dew blue #5b9bd5, violet #b57de0, autumn copper #D4842A, ink #241c08; Ember set #e0894a/#d9b85a/#e56b6b/#c8a84b/#b5623a/#f0c96b; Frost set #8fc3ea/#bfe0f2/#a0c4e8/#cfe6f2/#7fa8c8/#e8f2fa; Orchid set #b57de0/#e58fa0/#d9a0e8/#c8a84b/#9d6fd0/#f2c6d2; Slate board #16181c/#333844; Loam board #1c150f/#3a2c1e; keepsake hues #e58fa0/#c8a84b/#b57de0/#8fc3ea/#e56b6b/#f0c96b. Compress under 150KB.

Create one sprite sheet. File: lf_cosmetics.png. Grid: 4 columns x 4 rows (16 cells, left-to-right, top-to-bottom). Cell: 512x512. Master: 2048x2048.

KNOCKOUT: Flat magenta #FF00FF fills every cell's background. NO magenta / hot-pink inside the art (keep petal pink, orchid pinks and violets clearly distinct from #FF00FF). Each item centered, upright, fully inside its cell with margin, NO ground shadow (these composite into the wardrobe grid and gameplay). These are PURELY VISUAL skins — they never change the grid, the piece shapes, hitboxes, scoring, Nectar gain or Sunbeam payout. COLORBLIND LAW: leaf sets change COLOR ONLY — the six species keep their exact vein-motifs and symbol pairings (dot/star/heart/diamond/hex/plus) in every set, so species stay readable no matter the palette; the six tiles in each row below always appear in species order 1→6.

LEAF SETS (cells 1-4) — each cell shows that set's SIX glass panes in a neat row, species order 1→6 with the species motifs kept identical (only the glass colors change). Named + gated to match the code (`LEAFSETS`):
1. set_meadow — "Meadow" (starter, free): sage #7ab356, gold #c8a84b, pink #e58fa0, blue #5b9bd5, violet #b57de0, copper #D4842A (the exact default palette).
2. set_ember — "Ember" (unlock: best score 2,500): warm kiln tones — #e0894a, #d9b85a, #e56b6b, #c8a84b, #b5623a, #f0c96b; the glass glows like banked coals.
3. set_frost — "Frost" (unlock: 80 total clears): cool winter glass — #8fc3ea, #bfe0f2, #a0c4e8, #cfe6f2, #7fa8c8, #e8f2fa; pale, icy, moonlit.
4. set_orchid — "Orchid" (unlock: 5-day Daily streak): dusky hothouse violets and pinks — #b57de0, #e58fa0, #d9a0e8, #c8a84b, #9d6fd0, #f2c6d2.

TRELLISES (cells 5-7) — each cell shows a mini 3x3 board swatch: nine empty cell sockets in that trellis's cell color with its grid-line color as the leaded struts, inside a small dark frame. Named + gated to match the code (`BOARDS`):
5. board_willow — "Willow" (starter, free): deep green-black sockets #141d10 with dusk-line #2a331f struts; the warm home trellis.
6. board_slate — "Slate" (unlock: best score 1,200): cool blue-grey stone sockets #16181c with steel-blue #333844 struts; calm and modern.
7. board_loam — "Loam" (unlock: 40 total clears): rich earth-brown sockets #1c150f with warm umber #3a2c1e struts; the potting-soil trellis.

WARDROBE FURNITURE (cells 8-12) — the pieces the wardrobe screen composites around `wardCanvas()` previews:
8. ward_card_frame — a rounded wardrobe card plate: dark #0f150c face, thin dusk-line #2a331f frame, subtle inner mat (the engine composites the leaf-set or trellis preview + its name text on top).
9. ward_card_locked — the locked version of the same plate: dimmed and desaturated with a small brass-and-ink padlock resting centered (matches the code's 50%-opacity locked card).
10. ward_equipped_ring — the "Equipped" highlight: a clean brass-gold #c8a84b glow ring/border overlay that hugs the active card (matches the code's gold `.wardcard.on` border).
11. lock_padlock — a standalone chunky rounded padlock, dark ink #241c08 body with brass #c8a84b shackle and a tiny sage keyhole glint, for any locked slot.
12. unlock_badge — a small celebratory starburst badge in cream #ffe9a8 + gold, petals of light radiating, to pop on a card the moment its threshold is met. No text.

GROVE KEEPSAKES (cells 13-16) — the flowers good runs grow into the Grove (engine currently draws 5-8 petal procedural flowers seeded per run; these art pieces upgrade that draw). Keep them small-readable at 70px:
13. keepsake_flower_round — a keepsake bloom with 5 plump rounded stained-glass petals, shown in petal pink #e58fa0 with a cream #ffe9a8 glass center.
14. keepsake_flower_slender — a keepsake bloom with 8 slender pointed glass petals, shown in brass gold #c8a84b with a cream center.
15. keepsake_flower_ruffle — a keepsake bloom with 6 softly ruffled overlapping glass petals, shown in violet #b57de0 with a cream center.
16. keepsake_petal_neutral — ONE color-neutral cream-grey #8a9178→#e8dcc8 glass petal with lead rim and backlight baked in, so the engine can tint and rosette it into any seeded hue (#e58fa0 / #c8a84b / #b57de0 / #8fc3ea / #e56b6b / #f0c96b) and petal count, keeping every keepsake unique.
