<!-- Plot Bloom · Sheet 4: UI / HUD — button plates, mode icons, threshold bar, toast, toggles -->
<!-- Copy everything below into your image generator to make this ONE sheet. -->

STYLE — "Skyshard Isles" (Plot Bloom / Sky Wolf Studios cozy floating-garden placement puzzle). Interface pieces carved from the same world: timber-and-moss button plates, dew-glass chips, gold thread accents — cozy but tidy, like tools on a well-kept potting bench. Chunky rounded silhouettes, ONE soft warm rim-light upper-left, gentle glow, restrained bloom; painterly gouache-over-cel, crisp edges, subtle paper grain; every icon must read at 28px. Palette: midnight #0d100c/#0b0f0b/#0e140d; timber plates #1a2415/#121a0f, seam line #2a331f; sage #7ab356, deep leaf #3f6b34, spring rim #9fd07a, good-glow #a8e06a; gold #c8a84b + warm bloom #ffe9a8; cream #e8dcc8, moss #8a9178, stone #6f7a5f; petal pink #e58fa0; pond blue #5b9bd5, dew #bfe0f2. Icons are PICTOGRAPHIC ONLY. NO photoreal, NO harsh black outlines, NO text/letters/numbers/logos/watermarks. Compress under 150KB.

Create one sprite sheet. File: pb_ui.png. Grid: 4 columns x 4 rows (16 cells, left-to-right, top-to-bottom). Cell: 512x512. Master: 2048x2048.

KNOCKOUT: Flat magenta #FF00FF fills the entire background of every cell. NO magenta / hot-pink ANYWHERE inside the art (keep petal pink #e58fa0 clearly distinct from #FF00FF). Each element centered, upright, fully inside its cell with margin, NO ground shadow (these composite onto DOM surfaces). Plates and bars are drawn wide/landscape within their cell; keep edges clean for 9-slice stretching. The engine prints ALL button labels, scores and numbers itself — every plate ships EMPTY.

BUTTON PLATES (cells 1-4) — the DOM button skins; clean rounded-rectangle plates with even corners for 9-slice:

1. btn_plate — the standard button: a timber plank plate #1a2415→#121a0f with a thin #2a331f seam border and a soft cream top sheen. The engine lays its text on top; center stays flat and quiet.
2. btn_primary — the hero button (Garden Plot / Plant again): a sage gradient plank #7ab356→#4f7d35-deep with a spring #9fd07a rim-light and a chunky #2f4a1f base edge suggesting the code's pressed-shadow. Warm, inviting, the obvious tap.
3. btn_ghost — the quiet utility button: near-flat #0f150c plate, faint #2a331f border, no glow; recedes behind the primary actions.
4. hbtn_chip — the small square header chip (back / restart live here): a 1:1 rounded timber chip matching cell 1's finish, slightly translucent center. The engine draws its own ‹ and ↻ glyphs on top.

MODE & MENU ICONS (cells 5-10) — pictographic only, one clear symbol each, built to sit beside the engine's own text labels:

5. icon_garden — Garden Plot mode: a plump sprout with two leaves rising from a tiny soil mound, sage #7ab356 on a soft glow. The "just plant" mode.
6. icon_daily — Daily Plot mode: a hanging leaf-calendar — a small cream #e8dcc8 page with a single dew drop mark (NO digits) and a sage leaf clip. Reads "today" without a number.
7. icon_zen — Zen Garden mode: three tall wild grass stalks in spring #9fd07a swaying the same way, one seed head catching gold light. Loose, free, unhurried.
8. icon_harmony — Harmony challenge mode: a four-point gold #c8a84b spark with a soft #ffe9a8 halo (the code's ✦), crisp and a little competitive.
9. icon_wardrobe — Wardrobe: a round paint tin seen slightly from above, pond-blue #5b9bd5 paint inside, one sage brush resting across it. The cosmetics door.
10. icon_gallery — Bloom Gallery: a small ornate gold frame holding a single pink #e58fa0 keepsake bloom. The trophy-shelf door.

HUD FURNITURE (cells 11-16):

11. bar_track — the threshold/progress bar track: a long slim rounded trough in #1a2415 with a #2a331f rim, ends rounded, center flat for 9-slice stretching.
12. bar_fill — the matching fill strip: a slim luminous band running sage #7ab356 into gold #c8a84b left-to-right with a soft leading edge glint; tileable horizontally, sized to sit inside cell 11's trough.
13. toast_plate — the message toast: a wide rounded plate of deep glass #0c1208 at ~90% opacity with a thin #2a331f border and a faint dew #bfe0f2 top edge light; center empty for the engine's toast text ("The plot grows…", "Harmony Bloom!…").
14. toggle_off — the settings pill, OFF: a wide rounded pill in #26301c with a #2a331f rim and a cream #e8dcc8 round knob resting LEFT. Matches the code's toggle geometry.
15. toggle_on — the settings pill, ON: the same pill filled deep-leaf #3f6b34 with a soft sage inner glow and a pale #eafbd6-cream knob resting RIGHT.
16. score_laurel — a small decorative pair of sage laurel sprigs curving up and outward, symmetrical, on transparent; frames the engine's big score number in the top bar without touching it. Subtle — decor, not a badge.
