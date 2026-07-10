<!-- Leaf Fit · Sheet 1: Glass Sprig Tiles — the six species panes + neutral / ghost / clear states + the six colorblind glyphs -->
<!-- Copy everything below into your image generator to make this ONE sheet. -->

STYLE — "Leadlight Conservatory" (Leaf Fit / Sky Wolf Studios midnight glass-garden puzzle). Luminous STAINED-GLASS leaf panes in a Victorian glasshouse at night — every tile a jewel lit from behind. Chunky rounded kid-friendly silhouettes; each pane a flat glass fill with ONE soft inner glow, a thin dark lead line, and a single top-edge glint; restrained bloom, luminous but never neon-blown. Species read by MOTIF first, color second (colorblind requirement — six FIXED vein/silhouette motifs, distinguishable in grayscale). Soft cel + flat luminous fills, subtle grain, NO photoreal, NO harsh bevels, NO text/letters/numbers/logos/watermarks. Palette: midnight #0d100c/#0b0f0b/#0f160e, board darks #0b110a/#141d10, dusk line #2a331f, deep sage #3f6b34; species glass sage #7ab356, brass gold #c8a84b, petal pink #e58fa0, dew blue #5b9bd5, violet #b57de0, autumn copper #D4842A; pre-clear light #8ec462, bloom cream #ffe9a8, cream #e8dcc8, moss #8a9178, dew glass #bfe0f2, ink #241c08. Compress under 150KB.

Create one sprite sheet. File: lf_tiles.png. Grid: 4 columns x 4 rows (16 cells, left-to-right, top-to-bottom). Cell: 512x512. Master: 2048x2048.

KNOCKOUT: Flat magenta #FF00FF fills the entire background of every cell. NO magenta / hot-pink ANYWHERE inside the art (keep petal pink #e58fa0 and violet #b57de0 clearly distinct from #FF00FF). Each tile centered, upright, fully inside its cell with margin, NO ground shadow (the engine layers tiles freely on the board, in the tray, and under the finger). Keep every pane's glow contained within its own cell — do not let glow tint the magenta field. Tiles land on the board at 48px and in the tray at 22px, so every motif must survive BOTH sizes. The six species MUST stay unmistakable from one another by vein-motif alone, in grayscale.

THE SIX SPECIES PANES (cells 1-6) — one rounded-square stained-glass pane per species, in the exact Meadow starter colors the engine tints (species index = color index). Each pane: a bright flat glass body glowing from behind, a thin near-black lead outline hugging the rounded square, a soft lighter gloss band along the top edge and a slightly darker band along the bottom (matching the code's baked highlight/shade strips), and its species vein-motif rendered as darker lead lines INSIDE the glass:
1. tile_sprig_1 — sage #7ab356 glass; motif: a single straight midrib vein with two short side veins (classic beech leaf). The baseline pane. Pairs with the DOT glyph.
2. tile_sprig_2 — brass gold #c8a84b glass; motif: fan of rays spreading from the pane's base corner (ginkgo fan). Pairs with the STAR glyph.
3. tile_sprig_3 — petal pink #e58fa0 glass; motif: two rounded lobes meeting in a soft point (heart-shaped ivy leaf). Pairs with the HEART glyph.
4. tile_sprig_4 — dew blue #5b9bd5 glass; motif: one long slender lens-shaped leaf set diagonally (willow blade). Pairs with the DIAMOND glyph.
5. tile_sprig_5 — violet #b57de0 glass; motif: three small rounded leaflets in a cluster (clover trio). Pairs with the HEX glyph.
6. tile_sprig_6 — autumn copper #D4842A glass; motif: five pointed lobes from a center (maple hand). Pairs with the PLUS glyph.

STATES & SUPPORT (cells 7-8, 15-16):
7. tile_neutral — the SAME pane construction with NO hue: a soft cream-grey #8a9178→#e8dcc8 glass pane with lead line, gloss band and backlight baked in but zero saturation, so the engine can multiply-tint it to any leaf-set palette (Ember / Frost / Orchid recolors). No motif.
8. tile_ghost — the drag-preview ghost: a hollow pane — thin pale sage #8ec462 lead outline, near-transparent milky glass fill, faint inner glow — reading clearly as "this is where it will land" at 42% strength. No motif.

THE SIX COLORBLIND GLYPHS (cells 9-14) — bold flat near-black #241c08 symbol glyphs on transparency-within-the-knockout (each drawn alone, centered, thick enough to read at 12px when the engine stamps it on a 48px pane, matching the code's dark symbol overlays). Order is LOCKED to the species order above:
9. sym_dot — a solid filled circle.
10. sym_star — a four-point burst star (thin cross of rays).
11. sym_heart — a plump rounded heart.
12. sym_diamond — a solid four-point diamond.
13. sym_hex — a solid regular hexagon.
14. sym_plus — a thick rounded plus.

15. tile_clear_flash — a pane in its clearing instant: the glass blown out to bright cream #ffe9a8 at the core, color bleeding to the rim, edges dissolving into light-motes; the single frame shown as a completed row floods with lantern-light.
16. tile_shard — ONE small neutral cream #e8dcc8 glass-petal shard (soft rounded triangular glint) for the clear particle burst; color-neutral so the engine tints it to the cleared pane's hue. No shadow.
