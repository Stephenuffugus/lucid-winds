# DEW SNIP art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/dew-snip/` under the names below; say which landed and the code side wires them.

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

**Game:** `dew-snip` · satellite · puzzle · audit impact 5/5 · effort S · audit rank 162

## Background wanted

None needed - the background is already the strongest thing in the game. What it wants is a darkened variant so the button stack has a ground: bg_title_dim with the bottom third scrimmed in the paint rather than fighting the UI.

## Files

| file | spec | replaces |
|---|---|---|
| `assets/ui/btn_plate_primary.png` | RE-CUT at 600x144 (2x of the 300x72 it renders at), transparent margins, the blue plate ONLY - no neighbouring green button on the left edge, no magenta halo along the bottom, bottom rim not clipped | The current 313x197 file carries a slice of a different button and a purple fringe, and both render on the Garden CTA. This is the single cheapest visible win in the batch. |
| `assets/ui/btn_plate.png` | RE-CUT at 600x144, transparent, green plate with its full bottom rim restored and the purple glow fringe trimmed | The current 282x198 file has the plate's bottom rim clipped and a magenta halo baked into the bottom edge; it renders on Daily Dew, Free Vine, Grove, How to play and the gear. |
| `assets/ui/card_frame.png` | RE-CUT at 546x576 symmetric, transparent, all four corner leaf clusters present and matched, no purple bottom fringe | The current 273x288 file has the bottom-right leaf corner clipped and a magenta fringe along the bottom; it frames every level card and the Grove canvas. |
| `assets/backgrounds/bg_title_dim.jpg` | 540x960, the existing bg_title with a 35 percent dark scrim painted into the bottom third and a soft falloff, so the six button plates sit on a settled ground | The button stack currently competes with lit blossoms and fireflies directly behind it. |

_4 files._
