# Sheet 03 — FX (glaze glints, crack shatter, kiln firing, score pips)

**Wiring:** drop-in candidates for the canvas fx layer. Glint frames replace/augment the
procedural spark in `drawTile()` (glazed branch); crack shards play on a `crack` event;
firing glow frames the `KILN FIRING` overlay in `drawFire()`; pips float on `place`
events. All drawn additively over tiles; keep silhouettes readable at 40px.

**PROMPT (copy-paste):**

Kiln and Lacquer style: warm handcrafted ceramic game art, fired clay and glazed
porcelain with soft candle-amber rim light, lacquered walnut wood and brass fittings,
rich matte darks, painterly but crisp game-asset silhouettes, no text, no watermark,
flat FF00FF magenta background for cutout. A sprite sheet, 3 rows x 4 columns, each cell
160x160 pixels on flat magenta FF00FF.
Row 1, a four-frame animation of a golden GLAZE GLINT: a small four-point star of warm
gold FFD76A light growing from a dot to a bright cross flare with a soft halo, frames
A1 to A4 left to right.
Row 2, a four-frame animation of a ceramic CRACK: a garnet tile corner fracturing into
three small flying pottery shards with tiny dust puffs, from first hairline fracture B1
to fully separated falling shards B4.
Row 3: (C1) a soft round kiln-fire glow bloom, deep orange to warm gold radial, (C2) a
rising pair of ember sparks with short trails, (C3) a small brass laurel ring for a
doubled score, open center, (C4) a prism glint variant of the four-point star in shifting
cyan 9EE6FF and pink FFB0E8.
Even spacing, nothing touching cell edges, no text anywhere.
