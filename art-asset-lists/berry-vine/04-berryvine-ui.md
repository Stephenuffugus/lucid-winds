<!-- Berry Vine · Sheet 4: UI / HUD — buttons, mode icons, chips, charge meter, burst button, stars -->
<!-- Copy everything below into your image generator to make this ONE sheet. -->

STYLE — "Starberry Cosmos" (Berry Vine / Sky Wolf Studios cozy-cosmic marble-arcade). Cut-clean cosmic UI: flat rounded plates and chips with a soft rim-glow and a subtle lift shadow, warm gold / dew accent light. FLAT fills, subtle grain, NO gloss, NO harsh keylines, NO bevels. Palette: void #05070a/#0d100c, nebula indigo #1a1636/#241a4a; rose #e24d6a, sky-blue #4d7fe2, amber #e2b34d, teal #3fb6a8, violet #a468d8, green #7ab356; launch-gold #c8a84b + bloom #ffe9a8 + cream #e8dcc8, moss #8a9178, dusk line #2a331f, comet-dew #bfe0f2 / moon-blue #5b9bd5, rose #e58fa0. Icons are PICTOGRAPHIC ONLY — NO text, letters, numbers, logos, watermarks anywhere. Compress under 150KB.

Create one sprite sheet. File: bv_ui.png. Grid: 4 columns x 4 rows (16 cells). Cell: 512x512. Master: 2048x2048.

KNOCKOUT: Flat magenta #FF00FF fills every cell's background. NO magenta / hot-pink inside the art. Each element centered, fully inside its cell with margin, NO ground shadow (UI composites flat). Buttons are wide rounded plates drawn centered, to be 9-slice-stretched at wire time (NOTE: today's .btn is a plain CSS gradient, index.html ~36 — wiring these plates needs border-image / 9-slice code, they are not a straight swap). Icons are simple bold glyphs that read at 44px.

1. btn_plate — the default wide rounded button plate: dark #121a0f / #1a2415 face with a thin sage #7ab356 rim-glow; the standard menu button. NOTE: the sage rim is a deliberate RETHEME, not a match — the shipping .btn border is dusk-line #2a331f (index.html ~36); only the on-canvas hudBtn chips use sage rgba(122,179,86,0.4) today (~581).
2. btn_plate_primary — the primary call-to-action plate: a rose #e24d6a → #b23350 face with a bright cream #ffe9a8 rim-glow and a soft lift shadow (matches the code's rose primary button).
3. icon_journey — the Vine Journey glyph: a little constellation of three star-berry orbs joined by a faint dotted line, gold + cream (the 🫐 mode).
4. icon_daily — the Daily Sprout glyph: a papercut crescent-moon over a calendar-pad / a single sprouting star, gold #c8a84b (pictographic, NO numbers).
5. icon_rush — the Bloom Rush glyph: a fast comet / shooting-star streak in rose #e24d6a with a cream tail; reads as "speed."
6. icon_zen — the Zen Trellis glyph: a calm single orbit ring with a small drifting orb, soft sage #7ab356 / dew; reads as "calm, endless."
7. icon_wardrobe — the Wardrobe glyph: a little launch pod wearing a bow / a pod + swatch, cream + rose (the 🎀 mode); reads as "dress up."
8. icon_settings — the settings glyph: a simple rounded cog in moss #8a9178.
9. chip_menu — the in-play menu chip: a bold cream #e8dcc8 left-chevron on a round dark #0f150c paper chip with a thin sage rim-glow (the on-canvas `hudBtn` menu button).
10. chip_retry — the retry chip: a cream circular-arrow (refresh) glyph on a round dark chip with a sage rim-glow (the on-canvas `hudBtn` retry button).
11. score_diamond — the score glyph: a small faceted gold #c8a84b / #ffe9a8 diamond pip with a soft glow (stands in for the code's ◆ score marker). No text.
12. charge_track — the Pollen-charge meter TRACK, empty: a thin wide rounded capsule, dark #0f150c inset with a faint dusk-line rim; the bar the charge fills. Drawn horizontal.
13. charge_fill — the meter FILL: a launch-gold #c8a84b rounded-capsule fill with, at its right tip, a brighter cream #ffe9a8 "full / ready" glint state (show the gold fill body plus the bright ready-glow so the engine can use either). Horizontal, matches charge_track width.
14. burst_plate — the "Pollen Burst" bottom button plate: a wide rounded gold #c8a84b → #b8963f plate with a soft cream rim; include a brighter #ffe9a8 pulsing-armed variant of the same plate beside/behind it so the engine can crossfade idle → armed. No baked text (code overlays the ✿ label).
15. star_full — the earned star: a filled chunky rounded flower-star / burst-star in cream #e8dcc8 + gold #c8a84b with a soft glow (the ✿ on results + level cards).
16. star_empty — the unearned star: a dim hollow flower-star outline in dusk-line #2a331f on dark (the · placeholder).

NOTE for the engine (not drawn on the sheet): the `.lvlcard` level tiles and `.wardcard` wardrobe tiles reuse the `btn_plate` treatment (rounded dark plate + sage rim; add a small warm-metal padlock over a dimmed plate for the locked state), and the `.toggle` knob reuses a plain cream #e8dcc8 rounded pill — no dedicated cells needed.
