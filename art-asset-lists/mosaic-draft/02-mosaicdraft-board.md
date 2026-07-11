# Sheet 02 — Board furniture (kiln plates, wall frame, trays, floor)

**PATCH-REQUIRED wiring:** the engine draws discs and panels procedurally in `render()`
(theme colors from `THEMES`). Sprites draw UNDER the tiles: factory plate behind each
`LAY.facs` disc (112px circle), wall frame behind the 5x5 grid (~240x250), pattern tray
behind the rows (~270x250), floor strip behind the penalty slots (~520x70), table pool
panel (~516x84). Render at 2x, downscale.

**PROMPT (copy-paste):**

Kiln and Lacquer style: warm handcrafted ceramic game art, fired clay and glazed
porcelain with soft candle-amber rim light, lacquered walnut wood and brass fittings,
rich matte darks, painterly but crisp game-asset silhouettes, no text, no watermark,
flat FF00FF magenta background for cutout. A sprite sheet, 2 rows x 3 columns, each cell
340x340 pixels on flat magenta FF00FF.
(A1) a round kiln plate seen from above, dark fired stoneware 2E241A with a raised brass
rim and four shallow square seats for tiles, 256x256.
(A2) an empty square mosaic wall frame of lacquered walnut 1B1512 with a 5 by 5 grid of
shallow recessed square sockets and tiny brass corner pins, 300x300.
(A3) a stepped tile tray of lacquered walnut with five rows of shallow square seats, one
seat in the first row up to five seats in the fifth row, right aligned like a staircase,
300x300.
(B1) a long low floor strip of scorched dark clay with seven shallow square seats in a
single row and faint ember scorch marks, 320x88, drawn horizontal.
(B2) a wide shallow table bowl of dark stoneware with a soft inner shadow, brass rim,
320x96, drawn horizontal.
(B3) a small hanging kiln lantern of brass and warm glowing amber glass, 128x128.
Even spacing, nothing touching cell edges, no text anywhere.
