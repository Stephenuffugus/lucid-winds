# LETTER LAUNCH art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`docs/art-lists/letter-launch/` under the names below; say which landed and the code side wires them.

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

**Game:** `letter-launch` · satellite · word · audit impact 4/5 · effort M · audit rank 115

## Background wanted

A painted felt table with an actual board: the current radial is fine as the room, but the play area needs a real surface — a wooden or brass-cornered board plate with painted cell wells under the grid, so the 42 empty squares stop reading as a placeholder.

## Files

| file | spec | replaces |
|---|---|---|
| `satellites/letter-launch/docs/art/board-plate-480x420.png` | 480x420 transparent PNG, 9-slice safe. A wooden board plate with brass corner caps, a felt inlay, and painted recessed wells on a 7x6 grid; drawn once behind the tiles. | Replaces the 42 flat rgba(0,0,0,.16) rounded rects drawn in game.js:736 — the largest and emptiest object on the play screen. |
| `satellites/letter-launch/docs/art/peg-brass-48x48.png` | 48x48 transparent. A painted brass bumper peg with a top highlight and a soft contact shadow underneath. | Replaces the flat #11463c circles at game.js:721, which currently read as three dots someone forgot to finish. |
| `satellites/letter-launch/docs/art/coin-gold-40x40.png` | 40x40 transparent. Painted gold coin with a struck star face and a rim, matching the amber #eaa53b token already in the HUD. | Replaces the canvas circle plus a text star glyph rendered in Bricolage Grotesque at game.js:713. |
| `satellites/letter-launch/docs/art/item-shuffle-64x64.png` | 64x64 transparent, three files: item-shuffle, item-recycle, item-bomb. Painted objects in the game's own wood-and-brass language, not glyphs. | Replaces the shuffle / recycle / bomb emoji standing in for the three power-ups along the bottom bar. |
| `satellites/letter-launch/docs/art/mode-levels-96x96.png` | 96x96 transparent, four files: mode-levels, mode-climb, mode-hunt, mode-daily. Small painted scene per mode — a stacked tile tower, a rope and pin, a lantern over a word list, a torn calendar leaf. | Replaces the target / climber / magnifier / calendar emoji doing the icon job on the four menu mode cards. |

_5 files._
