# SHELL SHUFFLE art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/shell-shuffle/` under the names below; say which landed and the code side wires them.

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

**Game:** `shell-shuffle` · satellite · pattern · audit impact 4/5 · effort M · audit rank 131

## Background wanted

A painted carnival-table backdrop, 540x960: a dark walnut table edge across the lower third with warm rim light along the front lip, a soft velvet-curtain fall behind it going near-black at the top so the HUD stays legible, and one warm lamp pool centred where the cups sit. That single plate gives the cups a surface, a horizon and a reason for the drop shadows.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-table-540x960.jpg` | 540x960 full-bleed JPG. Dark walnut table edge across the lower third, warm rim light on the front lip, deep plum velvet curtain behind falling to near-black at the top, one soft lamp pool centred at y~430. | Replaces the flat three-gradient body. Gives the cups a floor and a horizon so they stop floating. |
| `table-mat-420x120.png` | 420x120 PNG, transparent. An oval felt mat with a stitched gold edge and a soft inner shadow, seen at the same low angle as the cups. | Replaces `.table` (an 18% alpha radial ellipse that never reads). Contact-shadow anchor so each cup lands on something. |
| `cup-greenhouse-260x300.webp` | 260x300 WebP at aspect ~1.15 to match the existing skin contract, sage-and-gold botanical pattern (fern fronds, a gold rim band) on a near-black ground. | A house-style default skin to replace CUPS[0] 'Sunset'. The tropical photo is the first thing a new player sees and it belongs to no other screen in the fleet. |
| `ball-dew-96x96.png` | 96x96 PNG, transparent. A glass dew-bead with a warm gold specular highlight and a faint sage inner glow. | The ball is currently a CSS radial-gradient circle; the reveal moment is the payoff shot and deserves a painted object. |

_4 files._
