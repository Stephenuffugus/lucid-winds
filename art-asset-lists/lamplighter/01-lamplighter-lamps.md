# Sheet 01 — Lamps (the player piece) + rule markers

**PATCH-REQUIRED wiring:** lamps render in `drawLamp(c,x,y,cell,bad)` as vector paths, chosen by
`skin=PROG.lamp` (`brass` / `paper` / `star` / `moth`). To use sprites: load the four PNGs, and in
`drawLamp` `c.drawImage` the skin sprite centered at (x,y), sized ~`cell*0.9` (in-game the lamp body
radius ≈ `cell*0.27`; cell runs 48–80px, so lamps sit ~26–43px). Keep the engine's radial glow
under the sprite or bake it in. When `bad===true` (this lamp shines on another lamp) the engine
overlays the **clash marker** — draw the red ✕ + ring sprite on top, do NOT recolor the lamp only.
The **note mark** renders where `CUR.st===2`. Until patched, this sheet is wardrobe / how-screen
card art (drop-in).

**Shape law (colorblind):** the four lamp skins must stay silhouette-distinct at 30px — brass = a
standing **diamond lozenge on a stem**, paper = a **round hanging lantern**, star = a **5-point
star**, moth = a **winged** shape. The clash marker (red ✕ + ring) and the note mark (gray ✕) must
read by shape alone, never by color. Do not let the artist round any of these into similar blobs.

**PROMPT (copy-paste):**

Lamplight Leadlight style: stained-glass leadlight nocturne, every shape framed by thin dark leaded
came outlines, luminous jewel-glass fills that glow as if lit from behind, warm amber lamplight
blooming through cool indigo and plum dusk glass, clean readable silhouettes, cozy old-town dusk,
crafted and handsome, kid-friendly not childish, no text, no watermark, crisp game-asset edges, flat
FF00FF magenta background for cutout.
A sprite sheet, 2 rows x 4 columns, each cell 256x256 pixels on flat magenta FF00FF.
Row 1, four small glowing street lamps, each lit warm from within, front view, centered:
(1) BRASS LAMP, an upright faceted brass diamond lantern in gold C8A84B glass with a short brass
stem and finial on top and a small dark 2A2010 base bar under it, a cream FFF2C8 flame core with a
gold FFD76A pip, thin lead outlines.
(2) PAPER LAMP, a round hanging paper lantern in warm ember E8875A glass with darker vertical rib
lines, a small dark cap top and bottom, a cream FFF2C8 glow at its heart, thin lead outlines.
(3) STAR LAMP, a five point star lantern in warm gold FFD76A glass with a bright cream FFF8DC core,
neat leaded came tracing each star point, gently radiant.
(4) MOTH LAMP, a soft moth with two pale cream E8DCC8 glass wings spread and a glowing amber FFD76A
teardrop body, a cream FFF8DC spark at its center, thin lead outlines.
Row 2, four markers and light effects on magenta:
(5) LAMP GLOW HALO, a soft warm amber FFD76A radial bloom of light with no hard object, fading to
nothing at the edges, to sit under a lamp.
(6) CLASH MARKER, a bold bright red FF5A4A ring with a heavy red X struck across its center and a
hollow transparent middle, sharp and alarming, an error badge.
(7) NOTE MARK, a calm muted grey 94889F X with soft rounded ends, a small hand-noted cross, no ring.
(8) LIGHT BEAM WISP, a soft directional streak of warm amber FFD76A glass light tapering along a
walkway, the glow a lamp casts down a lane.
Even spacing, one object per cell, nothing touching cell edges, no text anywhere.
