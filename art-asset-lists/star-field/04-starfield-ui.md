<!-- Star Field · Sheet 4: UI / HUD — button plates, top-bar chips, mode + tool icons, toggle -->
<!-- Copy everything below into your image generator to make this ONE sheet. -->

STYLE — "Astrolabe Atlas" (Star Field / Sky Wolf Studios celestial-cartography logic puzzle). Antique star-atlas interface furniture: brass-and-ink instrument plates and pictographic cream-ink icons from an old observatory desk, warm lamplight from upper-left. Rounded, friendly, storybook-antique shapes; crisp flat ink-and-gouache with subtle vellum grain, restrained gilt glints, NO photoreal, NO 3D bevels, NO text/letters/numbers/logos/watermarks — every icon is PICTOGRAPHIC ONLY. Palette: voids #0b0f0b/#0d100c/#0f150c, gold-shadow #1a1405; gilt #c8a84b, lit gold #f2d98a, button golds #d6b24e/#b3902f/#e8cd78, warm core #fff4cf; chart-ink cream #e8dcc8, ash #c8c4b4; sage #7ab356 + deep green #3f6b34 (+ pale leaf #eafbd6 for lit knobs), moss #8a9178, seam #2a331f; conflict rose #e58fa0, moon-blue #5b9bd5, dew #bfe0f2, deep panel greens #1a2415/#121a0f/#26301c. Compress under 150KB.

Create one sprite sheet. File: sf_ui.png. Grid: 4 columns x 4 rows (16 cells, left-to-right, top-to-bottom). Cell: 512x512. Master: 2048x2048.

KNOCKOUT: Flat magenta #FF00FF fills the entire background of every cell. NO magenta / hot-pink ANYWHERE inside the art (keep conflict rose #e58fa0 clearly duskier than #FF00FF). Each element centered, upright, fully inside its cell with margin, NO ground shadow (these composite onto DOM buttons and the canvas HUD). Plates are 9-slice friendly: keep corner detail inside the corner quarter and edges clean/stretchable. Icons must stay legible at 46px. FALLBACK CONTRACT (cells 5-15): every icon cell composites OVER its existing emoji chip/button (‹ ◈ 💡 ↺ 🌱 🌙 🍃 ✦ ✿ 🎨 ⚙) when its art loads — the DOM emoji are never removed; they stay as the absent-asset fallback.

BUTTON PLATES (cells 1-4) — wide rounded-rectangle plates (about 3:1, generous 16px-radius corners) rendered as vellum-and-brass panels:
1. btn_plate — the standard menu button: deep green panel washing #1a2415 down to #121a0f, a thin dark seam #2a331f rim, faint cream inner hairline, quiet lamplight sheen along the top.
2. btn_plate_primary — the gold primary button: warm gilt panel washing #d6b24e down to #b3902f with a pale #e8cd78 rim and a deeper #6d5410-toned base shadow edge; polished brass, inviting, the "start" plate.
3. btn_plate_ghost — the ghost button: flat near-black #0f150c panel, dark seam rim, no sheen; recedes politely behind the others.
4. chip_tbtn — the small SQUARE top-bar chip (about 1:1, 12px-radius): translucent-feeling dark green glass #0f150c with a dark seam rim and the faintest cream top glint; the plate under the back/auto-mark/hint/new tools. (The engine tints the pressed/active "on" state deep green #3f6b34 itself — supply the neutral chip only.)

TOOL ICONS (cells 5-8) — single cream #e8dcc8 ink pictograms with one small gilt accent each, drawn like engraved instrument markings, for the four top-bar chips:
5. icon_back — a soft left-pointing chevron stroke, hand-inked, slightly flared ends.
6. icon_automark — the auto-mark tool: a rounded diamond outline holding a smaller solid diamond, with three tiny ash #c8c4b4 dots orbiting it (the tool that scatters pencil dots for you).
7. icon_hint — the hint lamp: a small rounded oil-lamp / lantern silhouette with a warm lit-gold #f2d98a flame core and the gentlest #fff4cf glow (composites over the 💡 chip when loaded; the emoji stays as the absent-asset fallback).
8. icon_new — the fresh-sky tool: a circular arrow sweeping counter-clockwise with a tiny four-point star at the arrowhead.

MODE & NAV ICONS (cells 9-14) — single cream-ink pictograms with one gilt accent, for the title-menu buttons; each must be instantly tellable from the others by silhouette:
9. icon_garden — Star Garden: a small sprouting seedling with two rounded leaves, one tiny gilt star rising above it.
10. icon_daily — Daily Sky: a rounded crescent moon cradling a single gilt star.
11. icon_zen — Zen: one calm rounded leaf lying flat with a gentle ripple ring around it.
12. icon_deep — Deep Field: a four-point compass star with a wide fine-ink orbit ring, reading "farther, bigger sky."
13. icon_grove — the Grove gallery: a five-petal blossom made of tiny stars joined by hair-thin dew-blue #bfe0f2 threads (a constellation that is also a flower).
14. icon_skins — Star Skins wardrobe: a painter's palette silhouette with three round wells glinting gilt, lit gold and moon-blue.

SETTINGS FURNITURE (cells 15-16):
15. icon_gear — Settings: a rounded eight-tooth brass gear in gilt #c8a84b with a cream center ring; soft teeth, friendly.
16. toggle_kit — the settings toggle as a small kit in one cell: the pill track OFF (dark moss-green #26301c with seam rim) at upper-left, the pill track ON (deep green #3f6b34) at lower-right, and one round cream #e8dcc8 knob (with a pale #eafbd6 lit variant hinted) between them. Clean, flat, engine slices the pieces.
