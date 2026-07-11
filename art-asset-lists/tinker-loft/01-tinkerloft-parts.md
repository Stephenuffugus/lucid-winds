# Sheet 01 — Contraption parts (the tray eight)

**PATCH-REQUIRED wiring:** each part renders in its own function — `drawPlank`,
`drawMarble`, `drawBalloon`, `drawDomino`, `drawFan`, `drawBucket`, `drawSaw`,
`drawScissors`. Swap the body of each for a centered `drawImage`; rotation
(`plank.a`, `domino.ang`, `saw.ang`) is already applied by `ctx.rotate` at the
call site, so sprites must be authored UNROTATED. In-game sizes below; render
at 2x and downscale. Until patched, this sheet doubles as tray card art
(`drawPartIcon` mini-canvases — drop-in).

Physics anchors (do not move visual centers): plank 120x10 centered; domino
10x54 with base at BOTTOM-CENTER; seesaw 160x10 board centered on its pivot
post; fan 44x44 box; funnel mouth 104 wide, gap 40 at bottom; scissors pad
r22; marble r11; balloon r17 body.

**PROMPT (copy-paste):**

Brass and Chalk style: warm vintage attic workshop game art, hand-built wooden and
brass contraption parts, chunky readable silhouettes, soft painterly shading with
crisp edges, chalk-white guide marks, no text, no watermark, flat FF00FF magenta
background for cutout. A sprite sheet, 2 rows x 4 columns, each cell 256x256
pixels on flat magenta FF00FF.
Row 1: (1) WOODEN PLANK, a long oiled hardwood board seen from the side, wide and
thin, brass screw at its center, subtle grain, warm brown 8A5A2E. (2) GLASS MARBLE,
a small round marble in cool glass blue 5B9BD5 with a white inner swirl and a
bright specular dot. (3) TOY BALLOON, a soft red C96A5A balloon with a lighter
highlight arc, a tiny knot at the bottom and a short cream string, a small white
chevron pointing up painted on its face. (4) DOMINO TILE, a tall narrow cream
E8DCC8 tile standing upright, three dark pips in a vertical line, softly worn
edges.
Row 2: (5) TIN FAN, a square tin-blue 6A7480 desk fan seen from the side, four
visible blades behind a round grille, three chalk-white motion chevrons blowing to
the right. (6) TIN FUNNEL, two riveted tin walls forming a wide V catch with an
open gap at the bottom, rolled rims, brass rivets. (7) SEESAW, a hardwood board
balanced on a small triangular wooden pivot post with a brass pin at the center.
(8) SNIP SCISSORS, a small round brass trigger pad with a pair of open steel
scissors lying on it, red handle rings, a dashed chalk circle around the pad.
Even spacing, nothing touching cell edges, no text anywhere.
