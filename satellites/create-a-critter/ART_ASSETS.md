# CREATE A CRITTER art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/create-a-critter/` under the names below; say which landed and the code side wires them.

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

**Game:** `create-a-critter` · satellite · creative · audit impact 4/5 · effort L · audit rank 60

## Background wanted

assets/bg-meadow-540x960.jpg — a soft painterly dawn meadow behind the home screen: a low grass horizon at ~65% height, two or three rounded shrub silhouettes, warm rim light from the left, sky graduating from pale blue to cream so the existing gradient becomes the sky rather than the whole screen. The nursery and result screens already swap sky gradients (sky-dawn / sky-dusk / sky-night), so paint three skies and let the existing class swap drive them.

## Files

| file | spec | replaces |
|---|---|---|
| `logo-nest-256x256.png` | 256x256 transparent PNG, soft painterly woven nest with two pale eggs and a sprig of leaf, warm rim light from upper left, big readable silhouette at 120px | replaces the 🪺 emoji that is currently the entire brand mark on the home screen |
| `bg-meadow-540x960.jpg` | 540x960 full-bleed, dawn meadow, grass horizon at ~65% height, two rounded shrubs, warm left rim light, sky pale blue to cream | fills the empty top 40% of the boot screen and gives the title something to sit against |
| `icons-howto-4x-96x96.png` | four 96x96 transparent icons on one sheet — pencil, eye, sparkle, berry — all drawn in one soft-painterly style with the same 3px warm outline and the same light direction | replaces the four mismatched emoji (✏️ 👁️ ✨ 🍓) in the How-it-works card that currently show four different rendering styles |
| `critter-silhouette-320x320.png` | 320x320 transparent, a friendly generic blob-critter in three-quarter view, cream and coral, soft shadow, no face detail | gives the empty home screen a mascot anchor and previews what the drawing turns into |

_4 files._
