# FLIPBOOK art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/flipbook/` under the names below; say which landed and the code side wires them.

## Conventions, read once
- Sizes in the rows are written at 1x, the size the game shows them at. Deliver full bleed plates at
  900x1600 portrait (a row that says 540x960 means that file at 900x1600) and everything else at twice
  the size the row names. Never a side over 1600 px: the host's image optimizer resizes anything bigger
  on the way out, so a 1080x1920 plate would arrive at 900x1600 anyway, resampled by a stranger.
- PNG with alpha for anything that sits on the game (pieces, parts, tiles, frames, tokens); JPG or
  WebP for full bleed plates. Your master goes in the vault and the web copy is cut under a new
  name; nothing you send is ever overwritten or shrunk in place.
- Style anchors: the midnight greenhouse palette (deep blacks, sage #7ab356, gold #c8a84b, cream
  #e8dcc8) unless the row names its own, one light direction (upper left), no text baked into a
  plate unless the row asks for it, no real trademarks or mascots, generated art is never called
  hand painted.
- The "replaces" column says what is on screen today and what the file unlocks. Rows are in the
  order they change the most.

**Game:** `flipbook` · satellite · creative · audit impact 4/5 · effort M · audit rank 63

## Background wanted

A painted desk under the book. The sketchbook is currently floating on flat #0e0b08 with no surface, no lamp pool and no shadow, so the one deliberate touch in the file - the spiral binding - has nothing to be bound to.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-desk-540x960.jpg` | 540x960 full-bleed, painted dark wooden desk seen from above, warm lamp pool centred behind where the book sits, a pencil and an eraser resting in a motivated group at the lower left, deep near-black at the frame edges | Replaces #stage's flat var(--bg). Gives the sketchbook a surface and a light source. |
| `paper-texture-512x716.jpg` | 512x716, warm cream laid paper with faint tooth, a slightly darker gutter down the left 40px where the spiral binding lands, and a soft top-edge shadow | Replaces the two-stop linear-gradient(180deg,#efe6d0,#e6dabf) at index.html:58. The drawing surface is the whole game and it is currently two shades of beige. |
| `icon-toolbar-sprite-350x70.png` | 350x70 transparent PNG, five 70x70 cells: home, previous page, next page, onion-skin (a faint traced pose, not a ghost), play. All one cream line weight with a warm gold active state | Replaces the house / angle-bracket / colour-emoji-ghost / triangle mix in the toolbar at index.html:172-176, which currently has five different silhouette languages in one row. |
| `icon-help-glyphs-192x32.png` | 192x32 transparent PNG, six 32x32 cream icons: cinema screen, eraser, page clear, new book, daily sun, microphone | Replaces the U+26F6 and U+25FB glyphs in the help list that render as empty tofu rectangles, plus the mismatched colour emoji beside them. |

_4 files._
