# Sheet 01 — Shards (5 kinds × 3 states) + starter stone

**PATCH-REQUIRED wiring:** shards render in `drawTile(c,x,y,t,val,now)` as procedural
rounded rects + glyphs. To use sprites: load one PNG per kind+state, `c.drawImage` at
(x,y,t,t). In-game sizes 20-44px — render at 128px cells, downscale. CRITICAL: each kind's
SYMBOL glyph (colorblind law) must be baked into the sprite, bold and centered. Glazed
state keeps the engine's animated glint drawn ON TOP, so paint the wet-glaze look but no
sparkle rays. Until patched this sheet doubles as wardrobe card art for the tile sets.

**PROMPT (copy-paste):**

Kiln and Lacquer style: warm handcrafted ceramic game art, fired clay and glazed
porcelain with soft candle-amber rim light, lacquered walnut wood and brass fittings,
rich matte darks, painterly but crisp game-asset silhouettes, no text, no watermark,
flat FF00FF magenta background for cutout. A sprite sheet, 4 rows x 4 columns, each
cell 128x128 pixels on flat magenta FF00FF, one square ceramic game tile per cell with
softly rounded corners, seen straight on.
Row 1, four COBALT 3F6DB5 porcelain tiles each bearing a bold cream upward TRIANGLE
symbol in the center: (A1) matte fired finish, (A2) wet gold-glazed finish with glossy
highlight sheen, (A3) cracked dry finish with a fine fracture line across it, (A4) the
same tile in pale azure porcelain variant.
Row 2, the same three states matte, glazed, cracked plus porcelain variant for an AMBER
D1A23C tile bearing a bold dark CIRCLE ring symbol (B1-B4).
Row 3, the same four for a JADE 5E9E58 tile bearing a bold dark SQUARE symbol (C1-C4).
Row 4: (D1) GARNET B8524E tile with a bold cream four-point STAR symbol, matte, (D2) the
garnet tile wet gold-glazed, (D3) PEARL DDD6C6 tile with a bold dark PLUS CROSS symbol,
matte, (D4) a round violet 4A3A5E starter stone medallion with a brass rim and a single
embossed dot at its center.
Every symbol large, centered, high contrast. Even spacing, nothing touching cell edges,
no text anywhere.
