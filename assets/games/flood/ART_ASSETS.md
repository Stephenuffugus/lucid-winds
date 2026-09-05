# FLOOD FILL art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/flood/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-flood` · native · puzzle · audit impact 3/5 · effort S · audit rank 155

## Background wanted

A near-black greenhouse-terrace plate behind the board (out-of-focus glass panes, one warm gold lamp bloom top-left) plus a board frame around the grid. The cells already have art; what is missing is the surface they sit on.

## Files

| file | spec | replaces |
|---|---|---|
| `assets/games/flood/board-frame-780x780.png` | 780x780 transparent PNG, 9-slice-safe: warm gold hairline frame with soft inner shadow and four small leaf corner ornaments, centre fully transparent | gives the grid an edge; right now the playfield has no boundary and no transition to the page |
| `assets/games/flood/bg-terrace-750x1334.jpg` | 750x1334 full-bleed, near-black greenhouse interior, out-of-focus glass panes with faint sage muntins, one warm gold lamp bloom top-left, everything below 20% luminance behind the board area | replaces the shared 66-game gradient so the game reads as a place |
| `assets/games/flood/leaf-sage@2x.png (and gold, slate, copper, plum, crimson)` | 256x256 each, the existing six leaves repainted at 2x with a warm rim light and a soft contact shadow, edge-to-edge so center/cover crops cleanly | on the Cozy board (9 cells) each cell is ~110px CSS = 220 device px; the current ~17KB leaves are being upscaled and go soft exactly where the art is most visible |
| `assets/games/flood/style-gem-96x96.png` | 96x96 transparent, one painted faceted gem with a specular hit, and a matching style-solid-96x96.png painted enamel disc | replaces the ⬤ and ◆ glyphs in the two non-Leaves FILL STYLE tiles so all three options preview themselves |

_4 files._
