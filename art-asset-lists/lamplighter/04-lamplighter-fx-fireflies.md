# Sheet 04 — Fireflies + glow FX + keepsake lanterns

**PATCH-REQUIRED wiring:** three effect families.
1. **Fireflies** drift out near a solve (the fly loop in `render()`): a soft glow disc + a bright
   core, ~4.5px, color = `PROG.fly` (`gold` / `mint` / `lilac`, a wardrobe lane). Sprite them by
   `drawImage` at ~14px with the engine's twinkle alpha kept.
2. **Light FX** — the lamp glow bloom (drawn under each lamp), the **kindled-window** bloom (window
   loop), the win "THE TOWN KINDLES" radial (the `phase==="won"` block), and a small place/melt
   sparkle. All are additive glows; sprites drop over the same coordinates.
3. **Keepsake lanterns** — `drawLanternArt(cv,ks)` paints a hanging lantern (cord + halo + one of 4
   body shapes, one of 5 warm hues) at **90×110** in the Lantern Row gallery. These four frames give
   painted stand-ins for that gallery art (Lantern Row is the reward wall for hintless solves).

Until patched, this sheet is Lantern-Row / how-screen card art (drop-in). Fireflies and glows are
pure light, so they cut cleanly against magenta with a soft feather (key by distance, not hue).

**PROMPT (copy-paste):**

Lamplight Leadlight style: stained-glass leadlight nocturne, every shape framed by thin dark leaded
came outlines, luminous jewel-glass fills that glow as if lit from behind, warm amber lamplight
blooming through cool indigo and plum dusk glass, clean readable silhouettes, cozy old-town dusk,
crafted and handsome, kid-friendly not childish, no text, no watermark, crisp game-asset edges, flat
FF00FF magenta background for cutout.
A sprite sheet, 3 rows x 4 columns, each cell 256x256 pixels on flat magenta FF00FF.
Row 1, four fireflies and celebration lights:
(1) GOLD FIREFLY, a tiny bright warm gold FFD76A glowing mote with a soft halo, drifting.
(2) MINT FIREFLY, the same tiny glowing mote in cool mint 9EF0D0 with a soft halo.
(3) LILAC FIREFLY, the same tiny glowing mote in soft lilac CFA0E8 with a soft halo.
(4) KINDLE BURST, a warm amber FFD76A radial starburst of light, the moment the whole town lights
up, soft rays fading to nothing.
Row 2, four light effects with no hard edges:
(5) LAMP GLOW BLOOM, a large soft round amber FFD76A pool of lamplight fading outward.
(6) KINDLED WINDOW GLOW, a small tall warm FFD77A window-shaped bloom for a house lighting up.
(7) PLACE SPARKLE, a small four-point cream FFF8DC glint with a few tiny motes, the moment a lamp is
set.
(8) WIN AMBIENT RAY, a wide gentle warm 255-215-130 halo of radiance, low and calm, for the
victory wash over the square.
Row 3, four keepsake lanterns, each a single hanging lantern on a thin cord with a soft glow halo,
lit warm from inside, a bright cream FFF8DC heart, dark 2A2010 caps top and bottom:
(9) GLOBE LANTERN, a round lantern of warm gold FFD76A glass with fine concentric ring lines.
(10) HEX LANTERN, a six-sided faceted lantern in ember E8875A glass with crisp leaded facets.
(11) TEARDROP LANTERN, a soft teardrop lantern in warm amber FFB45A glass.
(12) RIBBED LANTERN, a tall cylinder lantern in cool blue 9EC8E8 glass with horizontal rib bands.
Even spacing, one object per cell, nothing touching cell edges, no text anywhere.
