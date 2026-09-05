# RABBIT RONIN art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/rabbit-samurai/` under the names below; say which landed and the code side wires them.

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

**Game:** `rabbit-samurai` · satellite · action · audit impact 5/5 · effort M · audit rank 5

## Background wanted

Exactly what satellites/rabbit-samurai/ASSETS.md already specifies and the code already loads: two painted parallax PNGs per world, 1080x640, transparent sky, bottom edge at ground level, seamless left to right. Eight files total. The hook is written, the art is missing.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-crate-far.png` | 1080x640, transparent sky, seamless L-R tile, bottom edge is ground level. Soft dark crate-yard skyline in near-black mossy green (#20351c sky behind it): stacked shipping crates, a water tower, a crane arm. Silhouette only, large soft shapes, no detail. | Fills the empty upper half of the frame. Draws at 0.16x camera speed as the far parallax layer, replacing the procedural band that currently sits below the visible middle. |
| `bg-crate-near.png` | 1080x640, transparent sky, seamless L-R tile. Closer crate stacks, rope coils, one or two hanging lanterns with a warm gold glow. More detail than the far layer; sits over it and behind the platforms. | The near layer at 0.42x gives the middle band parallax depth, and the lantern glow puts a warm accent in a frame that is currently one flat green. |
| `bg-burrow-far.png / bg-burrow-near.png / bg-grove-far.png / bg-grove-near.png / bg-peak-far.png / bg-peak-near.png` | Six files, 1080x640 each, same spec as above. Palette anchors per ASSETS.md: Burrows warm browns (#241a12), Grove deep forest green (#16301e), Peaks cold blue night (#1b2940). | The other three of the four worlds have the identical empty-sky problem. One pair per world, deliverable one world at a time because the fallback stays in place for anything missing. |
| `moon-crate-256x256.png` | 256x256, transparent, a soft cream moon disc with a wide warm bloom halo and a couple of thin cloud bands crossing it. | Parks one anchor high in the sky layer so the top third of the frame has something to look at even before the parallax art lands. |
| `carrot-24x24.png` | 24x24, transparent, painted carrot pickup: orange root with warm gold rim light, three sage fronds, a soft glow behind it. | Replaces the raw carrot emoji used as the currency pickup. Emoji renders differently on every device and reads as a placeholder. |

_5 files._
