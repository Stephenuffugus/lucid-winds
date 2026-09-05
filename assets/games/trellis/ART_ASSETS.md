# WORD TRELLIS art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/trellis/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-trellis` · native · word · audit impact 4/5 · effort M · audit rank 123

## Background wanted

A full-bleed night-garden trellis: slatted wood against a dark stone wall, ivy creeping the left and top edges, one warm lantern glow top-left falling off to near-black behind the centre so the 15x15 grid stays readable on top of it. This is a table game in a greenhouse; give it the table and the room.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-trellis-540x960.jpg` | 540x960 full-bleed, painterly. Slatted wooden trellis on a dark stone wall, ivy at left and top edges, warm lantern glow top-left, centre band pushed to near-black (under 12% luminance) so board tiles stay legible. | Replaces the bare shared radial gradient. Gives the board a room to sit in instead of floating on black. |
| `trellis-board-frame-880x880.png` | 880x880 transparent PNG, 9-slice safe. Carved wooden frame ~44px thick with real grain, brass corner pegs, warm rim light on the top-left edge, soft contact shadow baked into the outer 20px. Inner opening 792x792. | Replaces the flat #3b2a14 linear-gradient + 2px hard border on #TRboard, which is the single most plastic-looking element on screen. |
| `trellis-premium-192x48.png` | 192x48 sprite sheet, four 48x48 painted square emblems: gold laurel (TW), amber leaf (DW), sage sprout (TL), pale sprout (DL). Painted onto their own tinted tile grounds in house tones, no lettering. | Replaces the red/orange/two-blue flat fills AND the 7px TW/DL text labels in one move. Fixes the palette clash and the unreadable microtype together. |
| `trellis-tile-ivory-96x116.png` | 96x116 transparent PNG. Bone-ivory tile with a soft bevel, faint bone grain, warm rim light top edge, seated shadow bottom. Blank face; letter and value drawn over it. | Replaces .tr-rack-tile's gradient + triple box-shadow stack. The rack tiles are already the best-looking thing here; real art makes them the hero. |

_4 files._
