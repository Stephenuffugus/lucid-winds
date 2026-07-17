# 2048 / MERGE GARDEN — THEME SHEETS — 00 art direction (generate one sheet per theme)

See the 4 theme sheets in this folder (MERGE 01-04). Every theme is ONE sheet:
4x4 grid, 512px cells, 2048x2048 master, flat magenta #FF00FF knockout in every
cell background EXCEPT cell 13 (full-bleed board background, no magenta),
NO text/numbers/watermarks anywhere — the game draws the number badge itself.

Fixed cell order for every theme (left to right, top to bottom):
Row 1: tile-2, tile-4, tile-8, tile-16
Row 2: tile-32, tile-64, tile-128, tile-256
Row 3: tile-512, tile-1024, tile-2048, empty-cell mark
Row 4: board background (FULL-BLEED, no magenta), theme emblem, celebration burst, wilt mark

The eleven tiles are a GROWTH LADDER. The single most important law: at a
glance, a higher tile must read as OBVIOUSLY more magnificent than a lower
one. Bake the ladder in three ways at once:
1. SIZE — tile-2 fills about 45% of its cell; each step grows; tile-2048 fills 90%.
2. COMPLEXITY — more parts, more layers, more detail as values rise.
3. LIGHT — the top three tiles (512, 1024, 2048) get glow, sparkle, or inner
   fire; nothing below 512 glows at all.

Same base anchor: every tile object sits centered on the same subtle ground
shadow ellipse. No object touches a cell edge. Every tile must read at 44px.

- empty-cell mark (cell 12): a faint, ghosted stamp of the theme's motif for
  empty board squares. Very low contrast, almost a watermark. On magenta.
- board background (cell 13): full-bleed square, dark and quiet so tiles pop.
  Subtle theme texture, corners slightly darker (vignette). NO magenta.
- theme emblem (cell 14): a small crest of the theme for the picker card. On magenta.
- celebration burst (cell 15): a radial particle burst in theme colors for big
  merges. On magenta.
- wilt mark (cell 16): a muted, gentle "game over" motif of the theme. On magenta.

Style baseline for all four sheets: bold kid-friendly layered cut-paper art,
3-5 stacked flat paper layers, clean rounded silhouettes, soft rim-glow
between layers, FLAT fills, paper grain, NO gloss, NO photorealism — the same
material language as the chess courts, so the whole studio feels like one
craft table. Each theme's PALETTE and SUBJECT should be dramatically different
from the others and from the botanical Midnight Grove default.

Drop finished sheets in the 012Assets Drive folder or this repo folder and I
cut + wire them into the game (the theme system, unlock ladder, and picker are
already live — themes activate the moment their art lands).

In-game unlock ladder (already shipped): Ember Forge at a 256 tile, Tidepool
at 512, Tiny Cosmos at 1024, Sugar Rush at 2048.
