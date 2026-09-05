# GO (LIVING STONES) art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/livingstones/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-livingstones` · native · board · audit impact 4/5 · effort S · audit rank 72

## Background wanted

bg-go-540x960.jpg - a dim tatami room at night, a paper shoji screen going soft at the top, warm lantern rim light entering from the left, falling to deep near-black at the bottom edges so the board reads as a lit object on a low table rather than a rectangle on void.

## Files

| file | spec | replaces |
|---|---|---|
| `board-kaya-380x380.png` | 380x380, full-bleed opaque, painted kaya-wood goban surface with visible grain running vertically, a soft warm vignette at the corners and an inner shadow along the top edge | Replaces the flat #2a2418 SVG background fill at games/livingstones.js:260 so the puzzle board matches the warm wood the full game already uses, instead of looking like a different game. |
| `stone-black-96x96.png` | 96x96 transparent, painted slate Go stone, lens profile, cool top-left specular highlight, soft dark contact shadow baked into the bottom third | Replaces the flat <circle fill="#1a1a1a"> so stones sit on the board instead of being printed on it. |
| `stone-white-96x96.png` | 96x96 transparent, painted clamshell Go stone, warm cream with faint shell banding, top-left highlight, soft contact shadow | Replaces the flat <circle fill="#e8e8e0">; currently the centre white stone has nothing under it and floats. |
| `bg-go-540x960.jpg` | 540x960 full-bleed, dim tatami room, lantern light from the left, near-black at the edges | The game has no background at all beyond the shared shell gradient; this gives the board a room to sit in. |

_4 files._
