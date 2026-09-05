# VINEWINDER art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/vinewinder/` under the names below; say which landed and the code side wires them.

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

**Game:** `vinewinder` · satellite · action · audit impact 4/5 · effort M · audit rank 76

## Background wanted

bg-garden-mist-750x1334.jpg - a painted misty garden behind the board: soft out-of-focus foliage massed top and bottom-left, a warm dawn glow bottom-right exactly where the existing #cfe0d0 radial already sits, and a pale open middle so the board reads as a trellis panel hung in a garden instead of a blank sheet. Keeps the mist/vine/pollen palette that is already in :root.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-garden-mist-750x1334.jpg` | 750x1334 full-bleed JPG, painted misty garden, out-of-focus foliage top and bottom-left, warm dawn glow bottom-right, pale open centre band behind the board | Replaces the three-gradient body wash so the game has a place instead of a colour, and gives the black injected chips something to sit against. |
| `board-trellis-630x630.png` | 630x630 transparent PNG (2x of the 315px board), painted wooden lattice with soft moss in the corners and a faint paper tooth, designed to multiply under the vine at ~30% strength | Replaces the 5%-alpha canvas grid that is invisible on a phone and is why the playfield reads as empty graph paper. |
| `seed-sprites-256x256.png` | 256x256 transparent PNG, 2x2 grid of 128px painted seeds (pollen, petal, moon, dew) each with its own silhouette and a small matching glow | Replaces the flat canvas dots - the seed is the only reward on screen and is currently a 10px circle you can lose against the pale board. |
| `petal-icon-128x128.png` | 128x128 transparent PNG, painted marigold petal token, warm gold with a soft rim light | Replaces the 🌼 system emoji, which appears 14 times as the currency across the HUD chip, the Daily Challenge card and the game-over reward line. |
| `streak-icon-128x128.png` | 128x128 transparent PNG, painted ember or small lantern, warm amber glow, transparent | Replaces the 🔥 emoji in the streak chip so the two HUD chips share one painted style. |

_5 files._
