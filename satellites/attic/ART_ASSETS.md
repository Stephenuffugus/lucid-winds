# THE ATTIC art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/attic/` under the names below; say which landed and the code side wires them.

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

**Game:** `attic` · satellite · creative · audit impact 3/5 · effort M · audit rank 144

## Background wanted

Keep the SVG room but lift it out of the mud: bg-attic-540x960.png, one painted midnight-attic plate — rafter beams top third, a round dormer window with one cool shaft falling left-to-right, crate stack along the bottom edge, warm bulb glow top-right. Painted at roughly 12-15% more separation from the ground than the current SVG so the shapes read as rafters at a glance, then held back with a single 0.55-opacity scrim rather than by desaturating the art itself.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-attic-900x1600.png` | 900x1600, no transparency. A painted midnight attic: rafters across the top third, a round dormer window right with one cool shaft of light falling left to right, a crate stack along the floor, a hanging bulb top left, a chair nobody has sat in; roughly fifteen points of separation from the #171310 ground so the shapes read at a glance, the code holds it back with one scrim | the inline `.atticbg` SVG room (lifted this pass, still drawn) |
| `dust-veil-600x600.png` | 600x600 transparent, greyed felt and lint texture with uneven density, a few hair fibres, a web in one corner, about 55% coverage | the drawn grime layer in `sleeve-render.js grime()` (0.62 + 0.42 now, so the object shows through; a real texture would let it breathe) |
| `shelf-plank-1080x240.png` | 1080x240, tileable horizontally, painted worn pine plank with a shadow lip along the front edge | the canvas fillRect stripes the shelf strip uses |
| `ticket-128x128.png` | 128x128 transparent, a torn paper carnival ticket stub in cream and gold | "5 tickets" as plain text in the header |

_4 files._
