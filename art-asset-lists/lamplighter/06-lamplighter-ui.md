# Sheet 06 — UI chrome (title, buttons, chips, dock, level cards, medallions)

**DROP-IN wiring:** all of this is DOM/CSS. The title screen `h1` area (`s-title`), the `.btn` mode
plaques (max-width 360px, min-height 58px — Lantern Walk gold, Daily Lamps blue, Deep Square + Zen
Dusk neutral), the HUD `.chip` plates (min 48px tall: "▢ dark cells", "✓ houses", stage note), the
two `#dock` `.padbtn` plaques (**HINT** amber `#hintbtn`, **RESET** `#resetbtn`, ~120×88px), the
`.lvlcard` level tiles (~86px, with **done** and **lantern** border states), and the `⌂` home
button. Buttons follow the painted-plaque rule: art FILLS the plate, text is laid over in HTML — so
leave the center band calm. Min touch target 48px.

**PROMPT (copy-paste):**

Lamplight Leadlight style: stained-glass leadlight nocturne, every shape framed by thin dark leaded
came outlines, luminous jewel-glass fills that glow as if lit from behind, warm amber lamplight
blooming through cool indigo and plum dusk glass, clean readable silhouettes, cozy old-town dusk,
crafted and handsome, kid-friendly not childish, no text, no watermark, crisp game-asset edges, flat
FF00FF magenta background for cutout.
A UI sheet on flat magenta FF00FF with generous magenta gutters between elements.
Row 1, one wide title emblem 900x300 pixels: a heraldic crest for a lamplighter, a single glowing
warm-gold FFD76A street lamp on a slender pole crossed with a lighter's long taper, ringed by a thin
leaded arc of tiny lit windows and stars, ice BFE0F2 and plum 3C2A5E leadlight against amber glow,
calm and warm, room left below for a wordmark, no letters.
Row 2, four long rounded button plaques, each 720x116 pixels, edge to edge painted fill, quiet
center band for overlay text: (1) warm gold C8A84B plaque with a small lit lantern at one end
(Lantern Walk), (2) cool blue 5B9BD5 plaque with a tiny calendar-of-windows motif at one end (Daily
Lamps), (3) deep indigo 191036 plaque with a wide dark square of little windows at one end (Deep
Square), (4) plum 3C2A5E plaque with a pale crescent moon at one end (Zen Dusk).
Row 3, four small elements: (5) a HUD chip plate 240x96 pixels, dark 140F24 slate with a thin
frosted leaded border, calm center for a counter; (6) a HINT dock plaque 300x220 pixels, warm amber
241C10 fill with a soft glowing spark emblem, quiet center; (7) a RESET dock plaque 300x220 pixels,
cool slate 191330 fill with a small circular-arrow emblem, quiet center; (8) a LEVEL CARD frame
220x220 pixels, dark 161130 rounded tile with a thin border and a tiny lit lantern in one corner,
calm center for a street number.
Row 4, four round medallions, each 96x96 pixels: (9) a HOME medallion, dark night with a small
house-roof glyph and a warm gold rim; (10) a HINT SPARK medallion, dark with a bright amber FFD76A
spark; (11) a KEEPSAKE LANTERN medallion, dark with a small glowing hanging lantern; (12) a MOON
medallion, dark with a pale cream F0E8D2 crescent.
Even spacing, nothing touching element edges, no text anywhere.
