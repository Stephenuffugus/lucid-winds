# DEW TRAIL art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/dewtrail/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-dewtrail` · native · puzzle · audit impact 4/5 · effort M · audit rank 71

## Background wanted

A painted night-pond plate, full-bleed 750x1334: deep near-black-green water, a faint sage reed silhouette along the bottom edge, one soft gold moon-glow top right, held dark enough that cream numbers still read at 375px. This is the single highest-value change for this game.

## Files

| file | spec | replaces |
|---|---|---|
| `assets/games/dewtrail/bg-pond-750x1334.jpg` | 750x1334 full-bleed, deep near-black-green still water, faint sage reed silhouette bottom edge, soft gold moon-bloom top right, no detail above 18% luminance in the centre band where the grid sits | replaces the shared 66-game radial gradient; gives the game a place instead of a default |
| `assets/games/dewtrail/board-mat-720x720.png` | 720x720 transparent PNG, a dark slate/lily-pad mat with a 2px warm-gold hairline frame and a soft outer drop shadow, centre kept flat | sits under the .dt-grid so the cells stop floating on the page and the playfield gets an edge |
| `assets/games/dewtrail/dewdrop-96x96.png` | 96x96 transparent, one painted dew bead, warm rim light upper-left, tiny caustic highlight below, soft contact shadow | replaces the .dt-drop CSS radial-gradient circle, the single most repeated element on screen |
| `assets/games/dewtrail/dewdrop-lit-96x96.png` | 96x96 transparent, same bead lit sage-green from inside with a faint bloom | gives the filled/on state real art instead of only a background colour swap |
| `assets/games/dewtrail/start-marker-128x128.png` | 128x128 transparent, a gold spiral-leaf ring with a soft glow, designed to sit behind a 58%-width number pill | marks cell 1 so the player can find the start without reading the hint line |

_5 files._
