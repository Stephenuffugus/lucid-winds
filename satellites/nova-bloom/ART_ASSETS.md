# NOVA BLOOM art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/nova-bloom/` under the names below; say which landed and the code side wires them.

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

**Game:** `nova-bloom` · satellite · action · audit impact 4/5 · effort S · audit rank 93

## Background wanted

None needs painting - the art exists. The how screen should carry a darkened crop of bg_title.jpg the way #s-title already does, so the first screen a player sees is the game's own neon garden rather than black. One CSS line.

## Files

| file | spec | replaces |
|---|---|---|
| `bg_how.jpg` | 900x1600 JPG, a crop of the existing bg_title.jpg pushed 40% darker with the flower moved out of the text column into the lower third, so the copy sits over quiet sky | gives #s-how a painted ground instead of the fallback radial, without asking for a new painting |
| `howto_panel_460x760.png` | 460x760 transparent PNG, 9-sliceable smoked-glass panel with a thin sage-gold edge and soft inner glow, corners 24px | the how copy currently floats on bare black; a plate lets it sit on the painted background legibly and gives the screen a composed centre |
| `how_icon_moth / wasp / needle / serpent / mine / bulb, 64x64 each` | six 64x64 transparent PNGs, cropped and re-lit from the existing assets/sprites/enemy_*.png at icon scale with a warm rim light | turns the 'enemies read by shape and motion' paragraph from a wall of prose into a picture guide, using art that is already painted |

_3 files._
