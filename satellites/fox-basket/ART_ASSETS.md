# FOX & BASKET art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/fox-basket/` under the names below; say which landed and the code side wires them.

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

**Game:** `fox-basket` · satellite · word · audit impact 4/5 · effort M · audit rank 125

## Background wanted

assets/bg-orchard-500x250.jpg behind the existing SVG, not replacing it — a painted dusk orchard sky with a low warm moon at upper right (motivating the fox's rim light), soft cloud banding, and far treeline haze, so the SVG hills and fox composite over a real sky. The page ground behind the panel is fine as is.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-orchard-500x250.jpg` | 500x250 full-bleed to sit under the existing SVG, dusk sky graduating deep green to warm amber at the horizon, low moon upper right, soft cloud banding, far treeline haze at the hill line | fills the empty flat #1b2a19 sky above the hills and gives the fox's warm rim light a source |
| `fox-sheet-7x-96x96.png` | one sheet of seven 96x96 transparent frames, the fox at each of its seven step positions — trotting, then slowing, then head-down at the basket — soft painterly, warm rim light from upper right, big readable silhouette | replaces the single vector fox that only translates along x; the source already indexes seven positions (foxX(step), 0 through 6) so the swap is a drop-in |
| `picnic-basket-140x110.png` | 140x110 transparent, woven basket with a red-check cloth spilling out, a pear and a loaf, warm painterly, soft ground shadow | replaces the flat vector blanket+basket shapes at the right, which are the fox's goal and the title object |
| `orchard-trees-3x-120x160.png` | three 120x160 transparent apple trees at slightly different heights, painted, warm rim from upper right, transparent | replaces the three flat tree blobs and lets them be redistributed across the meadow instead of stacked at the far left |
| `letter-slot-40x58.png` | 40x58 transparent, a shallow carved wooden slot with a warm gold lip and a soft inner shadow, cream letter sits inside it | backs the .sl underline dashes, which are currently seven bare lines and are the weakest thing on the screen |

_5 files._
