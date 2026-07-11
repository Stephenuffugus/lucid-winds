# Sheet 03 — FX (vault, gate flash, wins, hints)

**PATCH-REQUIRED wiring:** all FX are engine-drawn today — the vault hop arc lives in
`pawnScreenPos` (lift = sin arc), the expanding gate ring in the `G.flash` block of `draw()`,
move hints as dashed circles, vault targets as dashed squares with a drawn arch. Sprite FX
composite OVER these positions with `ctx.drawImage` at the same anchor points; render each at
256px and downscale. Alpha matters: these sit on the board, so generous soft edges, and the
magenta cut must use KEY distance so glows survive.

**PROMPT (copy-paste):**

Tin Yard style: vintage wind-up tin toy game art, warm enamel paint on pressed metal,
brass rivets and copper edges, soft studio lighting, deep slate blue workshop tones,
subtle painted wear, crisp game-asset silhouettes, no text, no watermark, flat FF00FF
magenta background for cutout. A sprite sheet, 2 rows x 4 columns, each cell 256x256
pixels on flat magenta FF00FF, glowing effect sprites with soft feathered edges.
Row 1:
(1) VAULT ARC, a springy dotted leap trail in amber E0B64F curving up and over a small
fence silhouette, with three tiny motion sparks.
(2) GATE FLASH, a double ring burst in warm gold FFD76A with a tiny copper archway at the
center, radiating thin rays.
(3) MOVE HINT, a soft round dashed halo ring in amber E0B64F with a small center dot.
(4) VAULT TARGET, a soft square dashed frame in orange FF9D4D with a tiny arch mark inside.
Row 2:
(1) WIN BURST, a celebratory fan of pressed-tin confetti pieces in gold FFD76A, cream
E8DCC8 and indigo 7F8CFF.
(2) REFUSED PUFF, a small dark red E06A6A cross mark inside a dissolving smoke puff, clearly
a rejection stamp.
(3) CLOCK FLARE, a wedge-shaped ticking flare in pale blue 8FD7FF for the ten second blitz
timer.
(4) LANDING RING, a flat ellipse dust ring in cream E8DCC8 for the pawn touching down.
Even spacing, nothing touching cell edges, no text anywhere.
