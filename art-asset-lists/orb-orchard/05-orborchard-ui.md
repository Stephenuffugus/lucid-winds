# Sheet 05 — UI chrome (HUD, dock, mode plaques, medallions, grove keepsakes, frames)

**Wiring:** DROP-IN — all UI is DOM/CSS. HUD `.chip`/`.hbtn`, dock `.padbtn`/`#jumpbtn`,
title `.btn` mode buttons, `.lvlcard` states (`done` / `perfect`), toast and screen frames
take these as CSS `background-image`; engine text (labels, counts, stage names, `✿`/`✦`
marks) renders ON TOP, so every plate keeps a quiet, dark, text-free center. Mode plaques
4-7 replace the title emoji (🌳📅🌙⚡); medallions 8-9 replace the level-card `✿`/`✦` marks
and the Grove tag icons. Cells 10-11 are PATCH-level: `renderGrove()`/`drawKeepsake()`
currently paint procedural 90×110 canvases — swap to `drawImage` with a per-seed tint, or
skip and keep procedural. Cell 12 states style the Wardrobe `.wcard` borders. Touch targets
stay 48px minimum — art never shrinks the hit area.

**PROMPT (copy-paste):**

Chrome Horizon style: glossy 90s arcade special-stage art, candy-lacquer and polished
chrome surfaces with bright specular highlights, airbrushed gradient light, saturated
jewel colors over deep dusk blues, clean rounded game-asset silhouettes readable at 24
pixels, soft ambient occlusion, no text anywhere, flat magenta FF00FF background for
knockout. A sprite sheet of game interface pieces, 3 rows x 4 columns, each cell 256x256
pixels on flat magenta FF00FF, subjects centered, nothing touching cell edges.
Row 1, panels and pads with empty dark centers for overlaid text: (1) HUD CHIP, a slim
rounded rectangle plate of smoked green-black glass 0D100C with a fine gold C8A84B rim
and a soft top sheen, center empty; (2) TURN PAD, a rounded square button of deep lacquer
101A10 with a chunky chrome chevron arrow E8DCC8 pointing left and a pressed-glass bevel;
(3) JUMP PAD, a wide rounded button of deep night blue 14202B with a dew blue BFE0F2 rim
glow and a small upward arc glyph rising from its base line, center otherwise empty;
(4) TOAST FRAME, a slim rounded banner plate of dark glass 0D100C with a thin warm gold
C8A84B border and softly glowing corners, center empty.
Row 2, the four mode plaques, each a small emblem on a rounded dark lacquer tile 101A12
with a thin rim: (5) THE ORCHARD, a tiny glossy checkerboard planetoid in leaf green
79B356 and moss 3F5C2F with one gold ring E2B34D orbiting it; (6) DAILY SPHERE, a
polished glass sphere 8FC4EC with a single gold C8A84B calendar notch band around its
equator; (7) ZEN STROLL, a calm crescent moon BFE0F2 hanging over a low curved checker
horizon in indigo 363C6E; (8) BLITZ, a bold gold lightning bolt FFD778 over trailing
speed streaks on deep blue 14202B.
Row 3, medallions and keepsakes: (9) CLEAR MEDALLION, a small sage 7AB356 laurel ring
around a polished green gem, quiet and proud; (10) PERFECT MEDALLION, a radiant gold
C8A84B starburst medallion with a cream FFF2C8 core, clearly the higher honor; (11) GROVE
TREE, a stylized jewel-glass tree with a chrome-bronze 6B4A2E trunk and a canopy of round
lacquered leaf-green orbs 79B356 and 5D9440 on a dark 0B0F0B rounded card; (12) GOLDEN
BLOOM, a pressed keepsake rosette of layered burnished gold petals E2B34D and C8A84B
around a cream FFF2C8 heart on the same dark 0B0F0B rounded card.
Even spacing, consistent plate corner radii, no text anywhere.
