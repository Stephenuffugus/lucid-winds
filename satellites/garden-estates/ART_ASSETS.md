# GARDEN ESTATES art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/garden-estates/` under the names below; say which landed and the code side wires them.

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

**Game:** `garden-estates` · satellite · board · audit impact 4/5 · effort M · audit rank 42

## Background wanted

bg-garden-estates-540x960.jpg, a painted overhead greenhouse workbench: worn dark wood, a folded seed catalogue, a watering can and a brass hose bib at the margins, warm lamp pooling from the top left, falling to near-black at the edges so the tile ring reads on top.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-garden-estates-540x960.jpg` | 540x960, painted dark-wood greenhouse workbench under a warm raking lamp, full-bleed, heavily vignetted to near-black at all four edges | replaces the flat vertical canvas gradient; gives the tile ring a physical surface to sit on instead of floating in black |
| `board-centre-crest-300x220.png` | 300x220 transparent, painted enamel plaque reading Garden Estates with a trowel-and-cold-frame emblem, warm gold on deep green, soft edge glow | fills the empty black board centre; dice and the roll line draw on top of it |
| `tile-icons-sheet-256x256.png` | 256x256 transparent, 4x4 grid of 32px painted icons: seed cart, sun lamp, watering can, compost heap, garden bench, gate arch, almanac book, rain cloud | replaces the text glyphs currently drawn as icons in drawCorner and drawCell (the cloud, star, diamond, arrow and smiley) |
| `pawn-set-128x32.png` | 128x32 transparent, four painted 32x32 pawns (snail, ladybug, wren, mole) each with a warm rim light and a soft contact shadow | replaces the flat filled circles drawn for players and for owner markers on each property |
| `house-greenhouse-24x24.png` | 24x24 transparent, a tiny painted cold-frame greenhouse, glass panes catching gold | replaces the 6x6 flat squares stamped in a row for houses in drawCell |

_5 files._
