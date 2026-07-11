# Sheet 02 — Hero balls + trails (wardrobe lane art)

**PATCH-REQUIRED wiring:** the hero ball renders in `drawBallSkin(x,y,r)` keyed on
`PROG.ball` (brass/swirl/eight/meteor), r=15 in game — render at 128px and
downscale. Every skin must keep the ETCHED GEAR mark (shape-based identity so the
hero ball reads for colorblind players; the code currently strokes a gear over
every skin). Trails render in the `TRAIL_PTS` loop keyed on `PROG.trail`
(chalk/gold); sprite trails would replace the fading dots. Until patched this
sheet is wardrobe card art (`.wcard` icons — drop-in).

**PROMPT (copy-paste):**

Brass and Chalk style: warm vintage attic workshop game art, hand-built wooden and
brass contraption parts, chunky readable silhouettes, soft painterly shading with
crisp edges, chalk-white guide marks, no text, no watermark, flat FF00FF magenta
background for cutout. A sprite sheet, 2 rows x 4 columns, each cell 256x256
pixels on flat magenta FF00FF.
Row 1, four hero spheres, each a polished ball with a small six-tooth gear symbol
etched into its face in fine white line: (1) BRASS CLASSIC, warm stamped brass
C8A84B with a soft top highlight. (2) MARBLE SWIRL, cream F2E2C8 porcelain with a
single bold red-and-green swirl band. (3) THE EIGHTBALL, glossy near-black billiard
ball with a small white circle patch. (4) METEOR CORE, dark scorched rock with
glowing orange crack lines across its face.
Row 2: (5) CHALK LINE trail, a gentle arc of small round chalk-white dots fading
in size from left to right. (6) GOLD FILAMENT trail, a brighter arc of warm gold
FFD66A glowing dots with a faint thread connecting them. (7) spare NUDGE RIPPLE,
two thin concentric pale blue BFE0F2 rings. (8) spare NO-NUDGE STAR, a chunky
five-point brass star with a chalk outline.
Even spacing, nothing touching cell edges, no text anywhere.
