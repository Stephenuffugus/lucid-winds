# Sheet 03 — Goals + fixed scenery

**PATCH-REQUIRED wiring:** basket renders in `drawBasket` (opening is 52px wide in
game, dashed target zone must stay visible or be re-marked on the sprite), bell in
`drawBell` (r20 sensor, add the musical note mark — colorblind identity), nail
spikes in `drawSpike`, shelves in `drawShelf` (draw as a tileable plank strip,
engine stretches by segment length), string anchors in `drawString`. All are
single-function swaps; physics segments do not move.

**PROMPT (copy-paste):**

Brass and Chalk style: warm vintage attic workshop game art, hand-built wooden and
brass contraption parts, chunky readable silhouettes, soft painterly shading with
crisp edges, chalk-white guide marks, no text, no watermark, flat FF00FF magenta
background for cutout. A sprite sheet, 2 rows x 4 columns, each cell 256x256
pixels on flat magenta FF00FF.
Row 1: (1) GOAL BASKET, a sturdy little wooden basket with two brass hoop bands,
slightly splayed walls, a small brass flagpole rising from its rim flying a
triangular gold pennant with a white star. (2) BRASS BELL, a classic wall bell in
warm brass with a dark clapper and a small white musical note painted beside it.
(3) NAIL CLUSTER, three sharp steel nails points-down in a neat row set in a small
wooden block. (4) STRING ANCHOR, a small brass hook plate with a knotted cream
string end hanging from it.
Row 2: (5) SHELF STRIP, a long horizontal oiled wooden shelf plank, tileable left
to right, brass bracket at each end. (6) ROUND ATTIC WINDOW, a circular brass-
framed window with four spokes and warm dusty light inside. (7) WOODEN CRATE, a
small slatted crate with rope handles, background dressing. (8) ROOF BEAM END, a
dark chunky diagonal timber beam cut, background dressing for the loft corners.
Even spacing, nothing touching cell edges, no text anywhere.
