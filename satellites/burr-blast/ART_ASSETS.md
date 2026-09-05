# BURR BLAST art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/burr-blast/` under the names below; say which landed and the code side wires them.

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

**Game:** `burr-blast` · satellite · action · audit impact 3/5 · effort S · audit rank 170

## Background wanted

None needed as new painting: bg-world1..4.jpg, menu-bg.jpg and comic-1..6.jpg are already painted and sitting in assets/ (9.9MB, 73 files). What it needs is for panel 1 to actually use the file it already has, and for the story screen to reuse menu-bg.jpg blurred behind the card.

## Files

| file | spec | replaces |
|---|---|---|
| `story-frame-375x667.png` | 375x667, transparent, a painted leaf, twig and burr border with the middle cut out for the comic card | Stops the painted panel being a plain rectangle floating on flat black with an empty top and bottom. |
| `icon-feedback-64.png` | 64x64, transparent, a small painted ladybug in the game's warm palette with a soft rim light | Replaces the raw emoji in the feedback FAB that sits on the title and story screens. |
| `status-icon-64.png (x6: burn, sparkle, sprout, leaf, charge, frost)` | 64x64 each, transparent, painted in-run status glyphs matching the existing seed and relic art | Replaces the emoji used as run-state glyphs at index.html:1028, 1040, 1069, 2706-2707, 2783-2851, 2988. |
| `comic-1.jpg` | already exists, 540x540-ish, 60KB, painted | No repaint required. It simply is not being drawn, because the panel is never redrawn once the image decodes. |

_4 files._
