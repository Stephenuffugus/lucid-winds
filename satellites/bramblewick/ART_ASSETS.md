# BRAMBLEWICK art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/bramblewick/` under the names below; say which landed and the code side wires them.

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

**Game:** `bramblewick` · satellite · action · audit impact 3/5 · effort S · audit rank 166

## Background wanted

None needed, the plates are already painted and wired. What it needs is for the existing menu.jpg to actually be visible: lift the flat 72-90% wash to a radial so the middle of the forest reads while the panel edges stay dark.

## Files

| file | spec | replaces |
|---|---|---|
| `menu-vignette-540x960.png` | 540x960, transparent, a soft dark vignette with a painted leaf-and-bramble frame around the edges | Lets the scrim come off the centre of menu.jpg without the panel text losing contrast, so the paid-for forest is finally visible. |
| `panel-bark-720x960.png` | 720x960, transparent, painted vellum-over-bark texture with a soft gold edge glow | Replaces the flat rgba(13,16,12,0.92) fill on .panel so the menu card is a made object rather than a grey rectangle. |
| `lock-32.png` | 32x32, transparent, small painted brass padlock with a warm highlight | Replaces the emoji padlocks on the four locked GROUND buttons, the only emoji in the game. |
| `letterbox-soil-375x120.png` | 375x120, horizontally tileable, a dark soil and bark band with a soft top edge | Fills the top and bottom letterbox bars so the canvas playfield does not meet pure #000 at a hard edge on a 375x667 phone. |

_4 files._
