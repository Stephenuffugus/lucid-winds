<!-- First Sprout · Sheet 4: UI & FX — button plates, shop rows, toggles, tap burst, screen medallions, streak ember -->
<!-- Copy everything below into your image generator to make this ONE sheet. -->

STYLE — "Wick & Loam" (First Sprout / Sky Wolf Studios candlelit idle-grove). Quiet painterly chiaroscuro UI: dark hand-finished wood-and-leaf plates warmed at their edges by candlelight, floating on a deep KIND darkness — never scary. Soft painterly cel, feathered candle-falloff edges, restrained bloom (never blown-out), subtle paper grain, plump friendly shapes readable at thumbnail. Palette (EXACT game colors): night #0d100c/#07090a/#04060a; greens sage #7ab356, deep leaf #5c8f3f, forest #3f6b34, canopy #2f4a22, dusk line #2a331f, moss #8a9178; candle golds #ffe9a8/#ffd98a/#ffdc8c/#ffd278/antique #c8a84b; cream #e8dcc8, moonlight #e8e2cf, starlight #cfe0e8; dew #bfe0f2, pool blue #5b9bd5; petal pink #e58fa0; firefly #eaffb0; heartwood #8a5a2b/#3a2a14/#241a0c; button greens #1a2415/#121a0f and #7ab356→#4f7d35. NO text/letters/numbers/logos/watermarks — every plate is EMPTY (code renders all labels and emoji on top). Under 150KB.

Create one sprite sheet. File: fs_ui.png. Grid: 4 columns x 4 rows (16 cells, left-to-right, top-to-bottom). Cell: 512x512. Master: 2048x2048.

KNOCKOUT: Flat magenta #FF00FF fills the entire background of every cell. NO magenta / hot-pink ANYWHERE inside the art (petal pink #e58fa0 stays dusty and distinct from #FF00FF). Each element centered, upright, fully inside its cell with margin, NO ground shadow (these are nine-slice-friendly plates and free-floating FX). Glows contained inside each cell. Plates must keep their center areas quiet and even so code-rendered text stays legible; corner radii generous and consistent (the CSS uses 12-16px radii).

BUTTON PLATES (cells 1-3) — wide rounded-rectangle plates, roughly 4:1, empty centers:
1. ui_btn_primary — the primary action plate ("Tend the Soil", "Begin", "Receive"): a sage gradient #7ab356→#4f7d35 like a broad pressed leaf, thin pale rim #a6d97f catching candlelight along the top edge, a soft under-shadow built into the plate's own bottom edge. Confident, warm, alive.
2. ui_btn_dark — the standard dark plate (Daily Blessing, Ambient, Wardrobe, How — the `.btn` gradient plate at CSS ~37): deep leaf-green wood #1a2415→#121a0f, a hairline dusk-line border #2a331f, the faintest warm kiss #ffd278 at the top corners as if a candle sits nearby. NOTE: ghost/back buttons do NOT share this plate — `.btn.ghost` (~42) is a flat #0f150c plate in code; if the wirer skins ghost too, cut a near-solid flat #0f150c variant of this plate rather than reusing the gradient.
3. ui_btn_newseed — the New Seed prestige plate: warm banked-fire wood #3a2a14→#241a0c with a heartwood border #8a5a2b, a soft ember light #ffd98a breathing from within the grain at the center-bottom. The one button that should feel momentous.

SHOP & SETTINGS FURNITURE (cells 4-9):
4. ui_shoprow — the shop row plate: a wide 5:1 rounded plate in mossy dark wood #141d10→#0e150b, hairline #2a331f border, a subtly brighter circular seat at the LEFT end where the helper/glyph icon sits. The list stacks these tight, so keep it flat and calm.
5. ui_shoprow_owned — the owned/affordable variant of the same plate: identical geometry, edges warmed slightly by candle-gold #ffdc8c, the icon seat glowing faintly — "you can afford this / you own copies" read at a glance without color-only signaling (the WARM EDGE is the cue, and code also dims disabled rows).
6. ui_toggle_off — the settings toggle, OFF: a rounded pill trough in dark moss #26301c with a dusk border #2a331f and a cream knob #e8dcc8 resting at the LEFT end, unlit.
7. ui_toggle_on — the same toggle, ON: trough deepened to forest #3f6b34, the knob at the RIGHT end glowing pale leaf #eafbd6 with a tiny warm halo. Position of the knob is the colorblind-safe cue, not just the color.
8. ui_hud_chip — the small square HUD menu chip (46px on stage): a rounded dark plate #0f150c with a dusk border, one candle-warmed top edge; EMPTY center (code draws the ☰ glyph).
9. ui_panel_divider — a thin wide (8:1) horizontal divider for the shop panel's top edge: a hairline of dusk #2a331f threaded with a single delicate vine silhouette #3f6b34, one tiny leaf and one tiny dew bead #bfe0f2 along it; fades to transparent at both ends.

TAP & LOG FX (cells 10-12):
10. fx_tap_burst — the tend-tap reward pulse: a soft warm ring of candlelight #ffdc8c blooming outward from an empty transparent center, three tiny rising sparks above it. Blitted where the finger touches the soil; must feel like warmth answering, not an explosion.
11. fx_float_spark — the little glint that rides beside the floating "+1" numbers (code draws the numerals): a small four-point spark in #ffe9a8 with a soft halo and a wisp of fading trail beneath.
12. ui_log_leaf — a tiny leaf bullet in sage #7ab356 with a candle-lit edge, marking the story log line at the top of the panel. Must read at 14px.

SCREEN MEDALLIONS & TOKENS (cells 13-16) — round emblems, ~70% of cell:
13. em_bless_moon — the Daily Blessing medallion: a serene crescent moon #e8e2cf cradled in a thin ring of drifting light motes #ffdc8c on a deep night disc #0b1220; replaces the 🌙 at the top of the blessing screen.
14. em_offline_sprout — the welcome-back medallion: the tiny pale sprout #8fc36a pushing up from dark loam #2a2016 inside a soft dawn-warm ring #ffd278 on a night disc; replaces the 🌱 on the "While you were away" screen.
15. em_streak_ember — the blessing-streak token: a small banked ember #ffd98a nested in ash #241f22, its glow strengthening — the "kept the fire going another day" mark. SURFACE: no streak display exists yet — the streak lives only as a sentence baked into `#bless-txt` (openBless ~489, fed by `G.streak` set in claimBless ~340); the wirer adds a NEW small token row beside that sentence on `#s-bless` (one ember per streak day, capped for width). Until that row is built this cell has no home — do not wire it elsewhere.
16. em_ambient_leaf — the Ambient/zen mode emblem: a single floating leaf #7ab356 releasing one dew bead #bfe0f2 into darkness, perfectly still; for the Ambient button and the hide-the-numbers mood. Calmest cell on the sheet.
