# Sheet 02 — Fences + gates (the twist made physical)

**PATCH-REQUIRED wiring:** fences render in `drawFenceBar(o,r,c,gated,ghost,bad)` as rounded
bars (~106x10px horizontal in-game; vertical is the same bar swapped). To use sprites: supply
HORIZONTAL bars only; at draw time for `o==="V"` do `ctx.translate` + `ctx.rotate(Math.PI/2)`.
Render bars at 512x64, downscale to 106x10 — keep them chunky so they read at grid size.
The GATED variants replace the whole bar when `gated===true` (the engine gates the full
2-cell fence, never half). Ghost previews (green ✓ / red ✕) stay engine-drawn — they carry
legality feedback and must not wait on art.

**PROMPT (copy-paste):**

Tin Yard style: vintage wind-up tin toy game art, warm enamel paint on pressed metal,
brass rivets and copper edges, soft studio lighting, deep slate blue workshop tones,
subtle painted wear, crisp game-asset silhouettes, no text, no watermark, flat FF00FF
magenta background for cutout. A sprite sheet, 3 rows x 2 columns, each cell 512x128
pixels on flat magenta FF00FF, every asset a single long HORIZONTAL fence bar centered
in its cell.
Row 1, TIMBER style: (1) a pressed-metal plank fence painted warm wood brown B07B3E with
dark edge 5F3D1C and three vertical seam lines; (2) the same fence as an opened GATE, a
copper archway cut through the middle with the two halves intact and a small amber E0B64F
lamp dot above the arch.
Row 2, BRASS style: (1) a polished brass bar C9A34A with dark bronze edge 6E5416 and three
round rivets along the centerline; (2) the same bar as an opened GATE with the copper
archway and amber lamp dot.
Row 3, IVORY style: (1) a smooth cream enamel bar E3DDCF with warm gray edge 7D7767 and
plain face; (2) the same bar as an opened GATE with the copper archway and amber lamp dot.
Gates must keep both outer halves of the bar so the fence still reads as present but
passable. Even spacing, nothing touching cell edges, no text anywhere.
