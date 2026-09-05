# SPIDER art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/spider/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-spider` · native · card · audit impact 4/5 · effort M · audit rank 100

## Background wanted

A card-table surface. Dark sage-green felt with a warm lamp falloff so the ten columns and the deck sit on a table instead of floating on the fleet gradient. This is the single change that would move spider from decent to strong, because the cards themselves are already painted.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-spider-felt-750x1200.jpg` | 750x1200 full-bleed, dark sage felt with a visible weave, a warm lamp pool falling from the top, corners darkened to near-black, a faint worn patch near the centre | Replaces the bare shell radial gradient behind the tableau, so the already-painted cards land on a surface |
| `card-slot-96x137.png` | 96x137 transparent, an empty column slot: rounded rectangle, faint inset border, soft inner shadow, a hint of felt showing through | Replaces .gc-empty so the ten empty tableau columns read as places to put cards rather than gaps in the layout |
| `deck-preview-floral-320x180.png (and -classic-, -garden-)` | 320x180 each, a pre-composed painted fan of that deck's King, Queen and Jack at a size where the faces actually read, transparent background | Replaces the three 40px-wide live-card thumbnails in the CARD STYLE modal, where the Garden deck's botanical art currently reads as three dark smudges |

_3 files._
