# Sheet 05 — UI chrome: HUD chips, bomb button, buttons, keepsake frames

**DROP-IN wiring (DOM/CSS only):** `#hud .chip` and `.hbtn` backgrounds, `#bomb-btn` (76x56,
fill bar `.fill` rises with `G.bomb`), `.btn` mode buttons on `#s-title`, `.wcard` wardrobe
cards, `.gk` keepsake canvas frames (96x96), `#toast` plate. All are CSS `background-image`
9-slice-friendly plates. Text stays LIVE DOM (no baked labels) per house rule.

**PROMPT (copy-paste):**

Vector Nova style: pristine neon vector arcade art on pure black, laser-etched glowing
linework with soft chromatic bloom, high contrast, no text, no watermark, crisp game-asset
silhouettes, flat FF00FF magenta background for cutout. A UI sprite sheet, 3 rows x 4
columns, each cell 300x160 pixels on flat magenta FF00FF, empty label areas, NO text:
Row 1, (1) a slim HUD pill chip plate, near-black 101710 glass with a thin sage 7AB356
neon rim, (2) the same chip in gold C8A84B rim variant, (3) a square 48px-style icon
button plate with soft inner glow, (4) the same button in an ACTIVE gold state.
Row 2, (1) the BLOOM BOMB button, a rounded rectangle reactor plate with an empty vertical
fill window and gold neon rim, dormant, (2) the same bomb button FULLY CHARGED, radiant
gold with petal energy leaking from its seams, (3) a wide mode-select button plate, dark
glass with cream E8DCC8 rim and a subtle grid motif, (4) the same wide plate in a pressed
glowing state.
Row 3, (1) a square 96px keepsake frame, thin neon vine-circuit border in sage on black
glass, (2) a richer gold keepsake frame variant, (3) a toast notification plate, small
rounded dark glass with gold rim, (4) a pause overlay panel plate, tall dark glass with
double neon rule lines. Even spacing, nothing touching cell edges, no text anywhere.
