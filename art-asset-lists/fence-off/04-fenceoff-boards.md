# Sheet 04 — Board backdrops (one per unlockable board theme)

**DROP-IN wiring:** full-bleed backdrops draw FIRST in `draw()` (replace the flat
`createLinearGradient` fill), keyed off `PROG.board` exactly like `BOARDS` is today. The 9x9
cell grid, goal-row tints and dotted/triangle goal markers stay engine-drawn ON TOP — so
backdrops must stay quiet in the center band where the board sits (roughly the middle 500x500
of the frame) and keep contrast BELOW the grid, never competing with fences or pawns.
Deliver at 1080x1920 (host resizes anything wider than 1600 — path-version the files).
These are full-bleed scenes: no magenta, no cutout on this sheet only.

**PROMPT (copy-paste, one image per theme — run three times):**

Tin Yard style: vintage wind-up tin toy game art, warm enamel paint on pressed metal,
brass rivets and copper edges, soft studio lighting, deep slate blue workshop tones,
subtle painted wear, no text, no watermark. A full-bleed vertical 1080x1920 game
background of a toymaker's workbench seen from above, a large quiet empty square work
area in the center middle of the frame for the game board, all detail pushed to the outer
edges: scattered brass screws, a coiled spring, a wind-up key, pencil sketch lines and
soft lamp shadow vignette. Center area smooth and dim, low contrast, nothing busy.
Theme variant A, SLATE YARD: deep slate blue tones 11141C with cool steel highlights.
Theme variant B, MIDNIGHT COURT: near-black indigo 0A0A10 with faint violet 3A3050 glints
and two tiny distant lamp glows.
Theme variant C, PARCHMENT PLAN: a warm blueprint drawn on aged parchment D8C9A8 with
faded ruled construction lines and ink compass marks in umber 8A7A55.
