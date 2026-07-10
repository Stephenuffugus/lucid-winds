<!-- Leaf Fit · Sheet 4: UI / HUD — button plates, mode icons, chips, stars, FX particles -->
<!-- Copy everything below into your image generator to make this ONE sheet. -->

STYLE — "Leadlight Conservatory" (Leaf Fit / Sky Wolf Studios midnight glass-garden puzzle). Cut-clean glasshouse UI: flat rounded plates and chips like small framed panes — dark faces, thin sage or brass rim-glow, a soft lift shadow; icons are simple stained-glass pictograms. FLAT fills, subtle grain, NO gloss overload, NO harsh keylines, NO bevels. Icons are PICTOGRAPHIC ONLY — NO text, letters, numbers, logos, watermarks anywhere. Palette: midnight #0d100c/#0b0f0b/#0f160e, plate darks #121a0f/#1a2415/#0f150c, dusk line #2a331f, deep sage #3f6b34, sage #7ab356, primary greens #8ec462/#5f9a3c/#b6e28a, brass gold #c8a84b, bloom cream #ffe9a8, cream #e8dcc8, moss #8a9178, dew glass #bfe0f2, petal pink #e58fa0, dew blue #5b9bd5, violet #b57de0, autumn copper #D4842A, ink #241c08. Compress under 150KB.

Create one sprite sheet. File: lf_ui.png. Grid: 4 columns x 4 rows (16 cells, left-to-right, top-to-bottom). Cell: 512x512. Master: 2048x2048.

KNOCKOUT: Flat magenta #FF00FF fills every cell's background. NO magenta / hot-pink inside the art (keep petal pink #e58fa0 and violet #b57de0 clearly distinct from #FF00FF). Each element centered, fully inside its cell with margin, NO ground shadow (UI composites flat). Button plates are wide rounded rectangles drawn centered (the engine 9-slice-stretches them). Icons are bold single glyphs that must read at 24-44px.

1. btn_plate — the default menu button plate: a dark #1a2415 → #121a0f rounded plate with a thin dusk-line #2a331f frame and the faintest sage rim-glow; the standard button behind every menu label.
2. btn_plate_primary — the primary call-to-action plate: a bright leaf-green #8ec462 → #5f9a3c plate with a pale #b6e28a rim and a soft dark lift shadow (matches the code's primary "Bloom Run" button exactly). No text.
3. icon_run — the Bloom Run glyph: a single fresh sprig of three stained-glass leaves on a stem, sage #7ab356 + gold glints (the 🌿 mode). Reads as "the main garden run."
4. icon_daily — the Daily Trellis glyph: a small leaded window pane with a crescent moon behind it and one leaf slotted in, gold #c8a84b + dew blue (the 📅 mode) — pictographic, NO calendar numbers.
5. icon_gauntlet — the Gauntlet glyph: a rosette wreath of small tough leaves around an empty center, autumn copper #D4842A + brass, with a couple of fallen-leaf bits at its base hinting the pre-scattered litter (the 🏵 mode). Reads as "the challenge crest."
6. icon_zen — the Zen Trellis glyph: one soft leaf drifting inside a calm open ring, pale sage + dew glass #bfe0f2 (the 🍃 mode). Reads as "endless, no fail."
7. icon_grove — the Grove glyph: a small keepsake flower — five rounded petals in petal pink #e58fa0 with a cream #ffe9a8 center (the 🌼 button). Reads as "your collection garden."
8. icon_wardrobe — the Wardrobe glyph: a hanging swatch pair — one tiny glass leaf-pane + one mini trellis square joined by a ribbon bow, pink + sage (the 🎀 button). Reads as "dress up your board."
9. icon_settings — the comfort/settings glyph: a simple rounded cog in muted moss #8a9178 (the ⚙ button).
10. chip_menu — the in-play menu chip: a bold cream #e8dcc8 left-chevron on a rounded dark #0f150c pane chip with a thin sage #7ab356 rim-glow (the on-canvas hudBtn back button, 48x48).
11. chip_retry — the retry chip: a cream circular-arrow (refresh) glyph on the same rounded dark chip with sage rim-glow (the on-canvas hudBtn retry button, 48x48).
12. star_full — the earned star: a chunky rounded five-petal flower-star in cream #e8dcc8 + brass gold #c8a84b with a soft warm glow (the ✿ on the results screen).
13. star_empty — the unearned star: a small dim round dot / hollow petal-star outline in dusk-line #2a331f (the · placeholder beside earned stars).
14. fx_nectar_mote — one small glowing droplet-mote of nectar light, gold #c8a84b core with a cream #ffe9a8 glint (the clear-particles that stream from popped panes and steer INTO the Nectar vial; engine also tints copies to leaf colors, so keep the shape readable when recolored).
15. fx_petal_cluster — a loose cluster of four small drifting glass petals, one each in petal pink #e58fa0, brass gold #c8a84b, dew glass #bfe0f2 and violet #b57de0 (the celebration petalBurst colors, exact); spaced apart so the engine can also crop singles.
16. fx_glow_burst — a soft radial burst of warm cream #ffe9a8 light with a few tiny sparkle points, transparent-feel edges (layers under "PERFECT" clears, big combos, and the Bloom deal moment). Pure light, no solid shapes.

NOTE for the engine (not drawn on the sheet): the score floats are code-rendered text in #ffe9a8 and stay procedural; the `.toggle` knob reuses a plain cream #e8dcc8 rounded pill; the `.wardcard` wardrobe tiles reuse the btn_plate treatment with the cosmetics-sheet furniture (see 05).
