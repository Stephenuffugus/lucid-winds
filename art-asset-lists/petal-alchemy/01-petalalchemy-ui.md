<!-- Petal Alchemy · Sheet 1: UI Chrome — tile plates, tray slots, combine key, mode icons, toast/goal plates -->
<!-- Copy everything below into your image generator to make this ONE sheet. -->

STYLE — "Midnight Apothecary" (Petal Alchemy / Sky Wolf Studios candlelit crafting-sandbox). Kid-friendly alchemist's-workbench art: chunky enamel plates and brass-and-glass lab charm, warm candle-gold light in a deep midnight-green room. Rounded, huggable silhouettes; each subject ONE warm key-light upper-left + cool dew fill, soft inner glow, restrained bloom, never neon. Reads at tiny size by SILHOUETTE first, color second (colorblind rule: the engine prints all names/labels in cream text — art NEVER bakes text, and the four rarity plates MUST differ by corner ORNAMENT shape, not color alone). Flat front-on emblem camera, centered, upright. Palette (the game's real CSS colors): midnight greens #0d100c / #0b0f0b / #0e140d / #0f150c / #101610, void #05070a, tile-face #182013→#10160d, hairline #2a331f, sage #7ab356 + deep leaf #3f6b34 / #4a6b30 / #5c8f3f, brass-gold #c8a84b + candle-bloom #ffe9a8 + amber-dark #141005, cream #e8dcc8, moss #8a9178, petal-pink #e58fa0 + rose glaze #d98fa6→#b2657c + blush rim #eeb0c2, wine #6f2f42 / #3a1622, water-blue #5b9bd5, dew #bfe0f2, tincture-violet #b57de0. Soft cel enamel + glaze sheen, subtle grain, painterly not photoreal, NO harsh outlines, NO text/letters/numbers/logos/watermarks. Compress under 150KB.

Create one sprite sheet. File: pa_ui.png. Grid: 4 columns x 4 rows (16 cells, left-to-right, top-to-bottom). Cell: 512x512. Master: 2048x2048.

KNOCKOUT: Flat magenta #FF00FF fills the entire background of every cell. NO magenta / hot-pink ANYWHERE inside the art (the game's petal-pink #e58fa0 / #d98fa6 / #eeb0c2 must stay clearly dusty-rose, unmistakable from #FF00FF). Each piece centered, upright, fully inside its cell with margin, NO ground shadow (these composite freely over DOM panels). Keep every glow contained within its own cell. Plates are drawn wider-than-tall where noted (the engine stretches 9-slice style); keep their corners cleanly separated from their edges so slicing survives.

TILE PLATES (cells 1-4) — the element-tile backgrounds behind every icon+name. All four share the same rounded-rectangle body (about 3:2 wider-than-tall, ~12px radius feel) with the dark enamel face gradient #182013→#10160d, and MUST be distinguishable by corner ornament SHAPE alone, matching the code's rarity ladder:
1. tile_plate_common — rarity-1 plate (the default `.tile`): plain thin sage-dark #2a331f hairline border, quiet matte face, a whisper of candle sheen top edge. The humble workhorse — most of the shelf is this plate.
2. tile_plate_uncommon — rarity-2 plate (`.rar2`, border #4a6b30): deep-leaf border with four small round BRASS RIVETS, one seated in each corner. Slightly brighter face sheen than common.
3. tile_plate_rare — rarity-3 plate (`.rar3`, gold border + faint gold halo): brass-gold #c8a84b border with FACETED gem-cut corner chips and a soft contained #c8a84b outer glow. Feels like a prized specimen drawer.
4. tile_plate_truebloom — True Bloom plate (`.tb`, pink border + glow): petal-pink #e58fa0 border whose corners bloom into tiny PETAL fans, with a soft contained rose glow. Unmistakable even in greyscale via the petal-corner silhouette.

MIXING TRAY (cells 5-8) — the combine row at the bottom of play (slot + slot = result):
5. slot_empty — an empty mixing slot: a rounded recess in dark wood-and-brass, its rim a fine DASHED sage hairline (matching the CSS dashed border), softly shadowed interior inviting a tile to be placed. No contents.
6. slot_result — the result slot: same recess but rimmed in solid brass-gold #c8a84b with a faint candle-bloom #ffe9a8 inner light rising from it, like an alembic mouth about to yield. No contents.
7. btn_combine — the combine-again key (`#pa-again`): a small square brass-cornered plate holding a pictographic right-pointing DROP-SPOUT / pour glyph (a tilted vial tipping one drop rightward) in gold — reads as "run the reaction", NO letters.
8. btn_topbar_plate — the square top-bar button plate (`#pa-top .tbtn`, also the back key): dark enamel face #121a0f, thin #2a331f hairline, gentle top sheen; the engine composites its own ◄ / 📖 glyph text on top, so the plate is EMPTY.

MODE ICONS (cells 9-14) — pictographic replacements for the emoji prefixes on the six title-menu buttons (labels stay code-owned text). Each is a small enamel badge, one clear silhouette:
9. icon_mode_free — Free Alchemy (replaces 🌱): a sprouting seed inside a round-bottom glass flask, sage sprout in dew-lit glass; the sandbox.
10. icon_mode_daily — Daily Recipe (replaces 📅): a small parchment recipe card pinned by a brass tack, one corner curling, a wax-drop seal in gold — no writing on it, just ruled sheen lines suggested by tone.
11. icon_mode_hunt — Bloom Hunt (replaces 🎯): a brass magnifying loupe over a tiny pink flower silhouette centered in its lens; a gentle quest, not a weapon.
12. icon_mode_zen — Zen Lab (replaces 🍃): a single sage leaf drifting above a still dew-blue #bfe0f2 water ring, calm and floaty; the no-pressure room.
13. icon_mode_keepsakes — Keepsakes / Grove (replaces 🌸): a small gilt-framed pressed bloom, a five-petal rose-pink flower mounted under glass in a brass frame.
14. icon_mode_wardrobe — Wardrobe (replaces 🎀): a soft petal-pink ribbon bow tied around a brass frame corner-sample; cosmetic, cozy, clearly "dress-up".

FEEDBACK PLATES (cells 15-16):
15. toast_pill — the toast bubble plate (`#pa-toast`): a wide rounded pill in dark enamel #141a0e with a brass-gold hairline rim and a faint candle underglow; the engine prints the message text inside, so the pill is EMPTY. Render wider-than-tall (about 4:1).
16. goal_ribbon — the goal-bar plate (`#pa-goal`): a long low parchment-and-brass banner strip in amber-dark #141005 with warm gold edge lighting and a tiny brass tack at each end; holds the daily-target / hunt text the engine prints. EMPTY of text, about 6:1 wide.
