# Sheet 03 — Bottle frames (4 skins) · rim + neck + cork · knocked-out interior

**PATCH-REQUIRED wiring:** the bottle renders in `render()` as a glass fill rect + `strokeRect`
rim + a neck bar + a cork bar over the play window, keyed by `bottleSkin()` (`BOTTLES` keys
amber-glass / sea-glass / cut-crystal / apothecary). To use sprites: `c.drawImage` a single
frame PNG keyed by `PROG.bottle`, positioned so its interior window lands on the 352×704 play
area at origin ox=94, oy=96 (outer glass ≈ (88,90)→(452,806); neck bar (222,66) 96×26; cork
(226,56) 88×14). The faint 8×16 interior grid stays engine-drawn ON TOP (`bs.wall` lines), so
paint the glass tint subtle and leave the grid off the sprite. This is a **FRAME**: the interior
must be flat magenta too, so the cutter knocks out BOTH the outer background AND the center
window, leaving only the glass ring + rim + neck + cork. Render at 2× and downscale.

**Bottle rim colors:** amber-glass rim `#c8a84b` glass amber-tint · sea-glass rim `#46b3a6`
glass teal-tint · cut-crystal rim `#a8c0ff` glass blue-white faceted · apothecary rim `#9a7bc0`
glass violet-tint. Each keeps a warm brass cork on top.

**PROMPT (copy-paste):**

Apothecary Fizz style: moonlit tonic-apothecary game art — hand-blown tinted glass, cork and
brass fittings, tinctures lit from within, deep plum-indigo cellar shadows warmed by candle-gold
rim light, glossy but crisp game-asset silhouettes, no text, no watermark, flat FF00FF magenta
background for cutout. A sprite sheet, 2 rows x 2 columns, each cell 512x768 pixels on flat
magenta FF00FF, one tall apothecary bottle FRAME per cell, upright, centered, nothing touching
cell edges. CRITICAL: each bottle is a HOLLOW frame — its large rectangular interior is filled
with the SAME flat magenta FF00FF as the background so it knocks out to a transparent window;
paint only the glass walls, rim, shoulders, neck and cork ring around that window. Each bottle is
a tall rounded-rectangle body with a short narrow neck and a chunky brass cork stopper on top.
(A1) AMBER GLASS: warm amber-tinted glass walls with a candle-gold C8A84B rim highlight and a
brass cork.
(A2) SEA GLASS: cool teal-tinted glass with a sea-teal 46B3A6 rim highlight and a brass cork.
(B1) CUT CRYSTAL: pale blue-white faceted crystal walls with sharp bevel glints and a silvery
A8C0FF rim, brass cork.
(B2) APOTHECARY: dusky violet-tinted glass with a soft violet 9A7BC0 rim, an aged label ghost
(no text) and a wax-dipped cork.
Keep the glass tints subtle so an overlaid grid stays readable. Even spacing, no text anywhere.
