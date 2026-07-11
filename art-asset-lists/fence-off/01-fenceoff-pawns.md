# Sheet 01 — Pawns (player tin figures + rival wardens)

**PATCH-REQUIRED wiring:** pawns render in `drawPawn(side,px,py,lift)` as vector shapes
(player = 17px-radius circle + glyph, rival = 30px rounded square + white triangle).
To use sprites: load per-skin PNG, `ctx.drawImage` centered at `(px+CELL/2, py+CELL/2-lift)`,
~44px tall in-game (render at 256px, downscale). KEEP the silhouette contract — player pawns
stay ROUND-based, rival pawns stay SQUARE-based with a triangle crest — that pairing is the
colorblind-safe read and must survive any skin. Until patched, this sheet doubles as wardrobe
card art (the `.wcard` icons — drop-in, no engine change).

**PROMPT (copy-paste):**

Tin Yard style: vintage wind-up tin toy game art, warm enamel paint on pressed metal,
brass rivets and copper edges, soft studio lighting, deep slate blue workshop tones,
subtle painted wear, crisp game-asset silhouettes, no text, no watermark, flat FF00FF
magenta background for cutout. A sprite sheet, 2 rows x 4 columns, each cell 256x256
pixels on flat magenta FF00FF.
Row 1, four wind-up tin toy pawn figures on ROUND polished bases, each with a small brass
wind-up key on the back, facing camera, three-quarter view:
(1) SUNMARK, cream E8DCC8 enamel body with a radiant sun face stamped in amber E0B64F on
the chest.
(2) LANTERN, warm orange FF9D4D enamel body shaped like a little carriage lantern with a
glowing paper window in cream FFF2C8.
(3) COMET, pale ice blue 8FD7FF enamel body leaning forward with two swept metal tail fins.
(4) CROWN, gold FFD76A enamel body wearing a tiny pressed-tin three-point crown.
Row 2, four rival warden tin figures on SQUARE riveted bases, each with a bold white
triangle crest stamped on the chest, steel indigo 7F8CFF enamel:
(1) PICKET NOVICE, small and simple with a single picket plank on the back.
(2) YARD WARDEN, stockier with a shield-shaped chest plate.
(3) MASTER FENCER, tall and elegant with a thin copper coronet.
(4) plain spare warden with no extra gear.
Even spacing, nothing touching cell edges, no text anywhere.
