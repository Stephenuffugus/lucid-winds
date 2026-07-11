# Sheet 03 — Grid tiles + numbered clue plates

**PATCH-REQUIRED wiring:** the grid draws cell-by-cell in the `render()` loop over `CUR.walls`.
House cells (`walls[i]>=0`) draw a dark pane with a roof-accent triangle; walkway cells draw
**unlit** (`#221C33`) or **lit** (`#3A2F47` + warm overlay + diagonal light rays); numbered houses
(`walls[i]<=4`) print a **clue number** over the pane in three live states — neutral, satisfied (dim
+ green check tick, `clueState===1`), overfed (red tint + `!`, `clueState===2`). To use sprites,
`c.drawImage` the matching tile into each cell rect (cell = `floor(480/n)`, 48–80px). **The clue
NUMBER stays engine-drawn text** (like Rule Root keeps its word tiles) — so the clue plates here are
**text-free**; leave the pane center calm for the number to sit over. Generate cells at 4×.

**Colorblind law:** keep the **green check tick** on the satisfied plate and the **red `!`** on the
overfed plate as clear shapes — they are the colorblind cue that a numbered house is done vs broken,
not just a hue shift. The lit walkway's **diagonal light rays** are likewise the shape cue that a
cell is lit; keep them visible.

**PROMPT (copy-paste):**

Lamplight Leadlight style: stained-glass leadlight nocturne, every shape framed by thin dark leaded
came outlines, luminous jewel-glass fills that glow as if lit from behind, warm amber lamplight
blooming through cool indigo and plum dusk glass, clean readable silhouettes, cozy old-town dusk,
crafted and handsome, kid-friendly not childish, no text, no watermark, crisp game-asset edges, flat
FF00FF magenta background for cutout.
A sprite sheet, 2 rows x 4 columns, each cell 256x256 pixels on flat magenta FF00FF. Each object is a
single square puzzle tile that tiles seamlessly edge to edge.
Row 1:
(1) HOUSE TILE, a dark closed house pane in near-black 0B0816 glass with a thin plum 2C2440 leaded
border and a small darker 1C1530 roof triangle across its top, a shut building block.
(2) WALKWAY UNLIT TILE, a cool empty cobble pane in deep indigo 221C33 glass with a thin 332B4A
leaded border, quiet and dark, an unlit street square.
(3) WALKWAY LIT TILE, the same street pane now warmed to plum 3A2F47 with a soft amber 255-205-110
glow wash and four faint diagonal warm 255-220-150 light rays crossing it, a brighter 584A63 leaded
border, a street square touched by lamplight.
(4) CLUE PLATE NEUTRAL, a dark house pane like the house tile but with a clean raised cream E8DCC8
stone panel in the center reserved for a number, calm and readable, no number drawn.
Row 2:
(5) CLUE PLATE SATISFIED, the same clue pane dimmed slightly with a small bright green AADC96 check
tick in the top-right corner, the pleased done state, no number drawn.
(6) CLUE PLATE OVERFED, the same clue pane flushed warm red FF8F7A with a bold red exclamation mark
in the top-right corner, the broken-rule state, no number drawn.
(7) LIT WALKWAY THROUGH-BEAM TILE, an unlit-plum street pane crossed by one straight warm amber
FFD76A light beam passing edge to edge, a lane lit by a distant lamp with no lamp on it.
(8) TALL HOUSE TILE, a house pane variant with a steeper peaked 1C1530 roof for grid variety, dark
0B0816 glass, thin plum leaded border.
Even spacing, one tile per cell, tiles filling their cells so they repeat seamlessly, no text
anywhere.
