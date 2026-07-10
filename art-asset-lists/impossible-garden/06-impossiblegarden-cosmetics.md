<!-- Impossible Garden · Sheet 6: Cosmetics — Walker skins + Palette glazes + wardrobe & gallery furniture -->
<!-- 💰 COSMETICS / ECONOMY sheet. Copy everything below into your image generator to make this ONE sheet. -->

STYLE — "Moonstone Monument" (Impossible Garden / Sky Wolf Studios dreamlike iso puzzle). Collectible wanderer skins and enamel palette glazes in a pale-stone dream: rounded, huggable, softly lit, kid-friendly; one cool key light upper-left, restrained glow, never neon. Flat cel + soft glaze sheen, subtle stone grain, NO photoreal, NO heavy outlines, NO text/letters/numbers/logos/watermarks. Palette: void #141526/#0c0b14, panel #15141f, dusk line #2a331f; skins sprout #eafbd6, dew #bfe0f2, rose #e58fa0, lantern #ffe9a8; Twilight sage #7ab356/#4f7d38/#3a5c2a + arm #a6d77f + start #5b9bd5 + goal-gold #c8a84b; Amethyst #b57de0/#7e56a0/#5c3f76 + arm #d3b0f0 + start #e58fa0 + goal #ffe9a8; Ember #d4842a/#9c5f1e/#6f4415 + arm #f0b070 + start #e56b6b + goal #ffe9a8; leaf #7ab356, eyes #20261a, cream #e8dcc8, moss-grey #8a9178, gold #c8a84b. Compress under 150KB.

Create one sprite sheet. File: ig_cosmetics.png. Grid: 4 columns x 4 rows (16 cells, left-to-right, top-to-bottom). Cell: 512x512. Master: 2048x2048.

KNOCKOUT: Flat magenta #FF00FF fills every cell's background. NO magenta / hot-pink ANYWHERE inside the art (keep rose #e58fa0 and violet #b57de0 clearly distinct from #FF00FF). Each item centered, upright, fully inside its cell with margin, NO ground shadow (these composite into wardrobe cards, the gallery and gameplay). These are PURELY VISUAL skins — they never change the tile graph, seam solutions, tap targets or payouts, and every unlock threshold below is the REAL one printed on the locked card in-game.

WANDERER SKINS (cells 1-4) — full recolors of the wanderer (same egg body + two sage #7ab356 crown leaves + dark #20261a eyes in every skin; only the BODY color and a tiny themed flourish change). Named and gated to match the code (`SKINS[]`, unlocked by total gardens solved):

1. skin_sprout — "Sprout" (starter, free): the pale sprout-green #eafbd6 wanderer, fresh and simple — the baseline hero exactly as gameplay sheet 3 draws it.
2. skin_dewdrop — "Dewdrop" (unlock: solve 1 garden): a cool dew-blue #bfe0f2 body with a glassy vertical sheen and ONE tiny water bead clinging to a crown leaf; feels freshly rained-on.
3. skin_rosewalk — "Rosewalk" (unlock: solve 3 gardens): a soft rose #e58fa0 body with a delicate petal-collar flourish at the neck (two tiny cream-edged petals); romantic and gentle.
4. skin_lantern — "Lantern" (unlock: solve 5 gardens): a warm glowing #ffe9a8 body with a soft inner candle-glow brightest at the belly and a faint gold #c8a84b rim; the wanderer becomes a little walking light — the prestige skin.

PALETTE GLAZES (cells 5-7) — each cell is a mini DIORAMA of the same tiny scene so only the colors change: three iso blocks (one standard, one start tile with its engraved spiral glyph, one goal pedestal with its bloom) linked by one light-thread bridge with a dial. Same composition all three cells. Named and gated to match the code (`PALS[]`):

5. pal_twilight — "Twilight" (starter, free): tops glazed sage #7ab356, left faces #4f7d38, right faces #3a5c2a; start tile #5b9bd5, goal bloom gold #c8a84b with #ffe9a8 core, bridge and dial rim in arm-light #a6d77f.
6. pal_amethyst — "Amethyst" (unlock: solve 2 gardens): tops #b57de0, left faces #7e56a0, right faces #5c3f76; start tile rose #e58fa0, goal bloom #ffe9a8, bridge/dial rim #d3b0f0. Dusky, regal, cool.
7. pal_ember — "Ember" (unlock: solve 4 gardens): tops #d4842a, left faces #9c5f1e, right faces #6f4415; start tile #e56b6b, goal bloom #ffe9a8, bridge/dial rim #f0b070. Warm autumn-fire stone.

WARDROBE FURNITURE (cells 8-12) — the pieces the wardrobe screen composites around skins and palettes:

8. swatch_strip — the wardrobe preview bar: a wide rounded swatch strip showing a smooth three-stop enamel gradient (render the Twilight version: sage #7ab356 → start-blue #5b9bd5 → gold #c8a84b) inside a hairline stone rim; the engine recolors per palette.
9. wcard_frame — a wardrobe card plate: a small rounded portrait card, dark #15141f stone face, hairline #2a331f rim, clean upper zone for the swatch/skin preview and a clear lower band for the live name text.
10. wcard_equipped — the equipped card: identical geometry with a warm gold #c8a84b rim-glow and a faint gold inner corner-light — the "Worn / Chosen" state, glowing but tasteful.
11. wcard_locked — the locked card: the same frame dimmed and desaturated with the small carved moonstone padlock (cream body, moss-grey shackle) centered in the preview zone; the game prints the real "Solve N" requirement beneath.
12. unlock_burst — the unlock celebration badge: a small radiant bloom-burst — a gold #c8a84b five-petal bloom popping open inside a ring of cream #e8dcc8 rays and tiny sparks — flashed on a card the moment its solve threshold is reached. NEW WIRING (no existing draw — needs code): `renderWardrobe` has no unlock-moment event today (cards only render locked / Worn / "Solve N" states); this is forward art for that celebration beat.

GALLERY & MASTERY FURNITURE (cells 13-16) — the Keepsake Gallery presses one bloom per solved garden (collection caps at 60):

13. gallery_frame — a keepsake press frame: a tiny square alabaster shadow-box with a recessed dark #0c0b14 velvet center and a hairline cream bevel, sized to hold one pressed keepsake bloom; museum-quiet. NEW WIRING (no existing draw — needs code): `renderGallery` appends BARE 64×64 canvases today — no frame is composited around them.
14. gallery_empty — the empty press slot: the same shadow-box holding only a faint dotted cream OUTLINE of a five-petal bloom — the "solve a garden to press its keepsake here" invitation. NEW WIRING (no existing draw — needs code): an empty gallery today shows only the sub-line text; no empty-slot art is rendered.
15. mastery_wreath — the no-hint honor token: two small gold blooms flanked by a slim sage laurel sprig curling beneath them — echoes the in-game ✿✿ mastery mark (bloom COUNT is the cue, per the colorblind rule) for the wardrobe's "with no hint" tally.
16. progress_stem — the pictographic progress token: a single upright sage stem bearing five small buds, the lower buds OPEN in gold and the upper ones still closed silhouettes — showing "gardens solved toward the next unlock" with NO numerals; the engine chooses how many to light. NEW WIRING (no existing draw — needs code): `solvedCount()` surfaces only as header text today; no progress token is drawn anywhere.
