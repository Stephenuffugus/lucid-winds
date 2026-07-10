<!-- Cipher Bloom · Sheet 4: UI / FX — buttons, the four mode icons, pills, toggles, solve burst, hint spark -->
<!-- Copy everything below into your image generator to make this ONE sheet. -->

STYLE — "Pressed Herbarium" (Cipher Bloom / Sky Wolf Studios botanical cryptogram). Menu chrome and feedback magic for a keeper's midnight field-journal: matte papery plates, hand-inked pictographs, wax-and-gilt accents, warm lantern light from upper-left; flat gouache-and-ink rendering, gentle fiber grain, restrained glow — never glossy, never neon, NO photoreal. Chunky rounded silhouettes, readable at thumbnail. Palette (the game's real colors): midnight #0d100c / #0e140d / #0b0f0b, moss line #2a331f, sage-grey #8a9178; sage #7ab356, deep leaf #3f6b34; lantern gold #c8a84b, gilt face #d9b85a → #b2913a with light edge #eed48a and deep base #6f5a23, glow #ffe9a8; cream #e8dcc8; button greens #1a2415 → #121a0f, ghost #0f150c, chip amber #241d10; dew blue #bfe0f2 / #5b9bd5; toggle deep green #3f6b34, track #26301c; alert #e56b6b, thorn red #b04a3a; rose #e58fa0, violet #b57de0. ABSOLUTELY NO text, letters, letterforms, numbers, glyphs, logos or watermarks — all labels are live DOM text on top; icons are pictographic only. Compress under 150KB.

Create one sprite sheet. File: cb_ui.png. Grid: 4 columns x 4 rows (16 cells, left-to-right, top-to-bottom). Cell: 512x512. Master: 2048x2048.

KNOCKOUT: Flat magenta #FF00FF fills the entire background of every cell. NO magenta / hot-pink ANYWHERE inside the art (keep rose #e58fa0 dusty, clearly distinct from #FF00FF). Each item centered, upright, fully inside its cell with margin, glow contained, NO ground shadow (flat UI compositing). Plates built to stretch must keep clean uniform edges and quiet centers.

COLORBLIND RULE (freq + selection cues restated from the game; the stamps ADD the shape cues the DOM currently lacks): the game's shipping non-hue cues are frequency-by-bar-LENGTH (`.fq b` width %) and selection-by-THICKER-underline (`.cell.sel .un` 2px→3px); the wrong/given/correct letter states are today hue-only `.pl` tints, so the paper-kit stamps are NEW shape cues that need new render hooks in `renderPuzzle()` / `doCheck()`. On this sheet: the four mode icons (cells 4-7) must be distinguishable by SILHOUETTE alone, and no feedback effect may rely on hue alone — the alert wisp (cell 15) pairs with the thorn-cross stamp shape from the paper-kit sheet.

BUTTON PLATES (cells 1-3) — letterless rounded-rectangle plates the DOM prints labels onto, built to stretch to roughly 430×60:
1. btn_plate — the standard button: dark moss gradient #1a2415 → #121a0f, thin #2a331f edge, soft lantern bevel on the top edge, matte.
2. btn_primary — the golden call-to-action: gilt face #d9b85a → #b2913a, light #eed48a edge, deep #6f5a23 under-ledge giving it the pressed-plate weight, faint warm bloom. Reads as the one warm object on the menu.
3. btn_ghost — the quiet utility button: near-flat #0f150c plate, thin #2a331f edge, no bevel, slightly desaturated; recedes behind the primary.

MODE & MENU ICONS (cells 4-9) — hand-inked pictographs in cream #e8dcc8 with one accent color each, stamped like journal marginalia; bold at 24px. WIRE NOTE: these icons are wholly new — the title-screen buttons (index ~124-137) are text-only DOM, so each icon must be INSERTED into the existing .btn markup beside its live label (e.g., a small img before the text), never swapped in for the button plate or its label:
4. icon_daily — Daily Cipher: a rising sun with gold #c8a84b rays cresting over a single dog-eared journal page. Silhouette: half-disc over a rectangle.
5. icon_garden — Garden of Verses: an open book with a sage #7ab356 sprout growing straight up from its gutter. Silhouette: V-shape with a stem.
6. icon_race — Sun Race: an hourglass with a tiny gold sun in its upper bulb and a dew-blue #5b9bd5 motion swash behind it. Silhouette: pinched hourglass.
7. icon_zen — Zen Reading: a round hanging lantern with a soft #ffe9a8 heart of light and a small moth resting on its rim. Silhouette: circle with a hook.
8. icon_gallery — Gallery: a small picture frame holding a five-petal pressed flower in rose #e58fa0. Silhouette: square with a radial center.
9. icon_wardrobe — Wardrobe: a stacked sheet of paper with a corked ink bottle in front of it, one violet #b57de0 drop at the bottle mouth. Silhouette: rectangle plus bottle.

CHROME (cells 10-13):
10. toggle_off — a settings toggle at rest: a rounded pill track in dark #26301c with a #2a331f edge and a matte cream #e8dcc8 thumb seated at the LEFT end.
11. toggle_on — the same toggle awake: track in deep leaf #3f6b34 with a soft sage glow, pale #eafbd6 thumb seated at the RIGHT end. Thumb position is the shape cue, color is secondary.
12. pill_chip — a small rounded reward pill: dark amber #241d10 face, thin #2a331f edge, gentle gilt #6f5a23 inner rim, quiet center for the DOM's 💧 / 🔥 / ✨ glyph and count. Built to stretch.
13. dew_drop — a plump dew droplet in #bfe0f2 → #5b9bd5 with one cream highlight and a faint cool halo. WIRE NOTE: every live Dew readout keeps its DOM-owned 💧 emoji (per 00-art-direction), so this cell has no existing consumer — wire it as a decorative accent beside the Wardrobe header line (`#ward-dew`, index ~164) or into the results/gallery backdrop dressing, or hold it as a spare.

FX (cells 14-16):
14. fx_solve_burst — the decode celebration: a wide soft starburst of warm gold #ffe9a8 → #c8a84b light with a slow ring of pollen motes and three tiny cream sparkles; transparent center (the solved page glows through it). Serene triumph, not fireworks.
15. fx_alert_wisp — the "not enough Dew / wrong guess" moment: a soft short-lived wisp vignette in alert #e56b6b fading to transparent, shaped like a shallow arc that hugs a chip or a letter row edge; always paired with a shape cue (the thorn-cross stamp or the shaking chip), never the only signal.
16. fx_hint_spark — the hint reveal: a tiny firefly of #ffe9a8 light with a short curling spark-trail of three fading motes, as if a lantern spark drifted down and landed on the revealed letter.
