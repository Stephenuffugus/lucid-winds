# LINE LOOM art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/line-loom/` under the names below; say which landed and the code side wires them.

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

**Game:** `line-loom` · satellite · puzzle · audit impact 4/5 · effort M · audit rank 29

## Background wanted

A painted valley. The game's own DAILY WEAVE button says 'same valley for everyone today' and the board shows a black void. Soft night hills, tree clumps, mist pooling in the low ground, the river reading as water carved through it, all dark enough that the cream stations and the coloured threads stay the brightest things on screen.

## Files

| file | spec | replaces |
|---|---|---|
| `assets/valley-night-540x960.jpg` | 540x960 full-bleed, painted night valley, deep #0b0f0b lows so the existing palette still sits on it, soft hills and tree clumps, a mist band through the middle third where the river runs. | Replaces the flat fill plus invisible dot grid in render(). Two sibling files, valley-parchment and valley-blueprint, cover the other two unlockable themes. |
| `assets/station-circle-96.png, station-square-96.png, station-triangle-96.png` | 96x96 PNG each, transparent, a painted stone waymarker in that shape seen from slightly above, cream rim light on the upper edge, soft shadow pooled beneath. Must read at 32px. | Replaces the 1px hairline outline strokes that currently look like a wireframe overlay. |
| `assets/bridge-96x48.png` | 96x48 PNG, transparent, a plank-and-rope bridge seen from above with a warm timber tone, rotatable about its centre. | Replaces the two stacked fillRects at index.html:739-740 (a 32x14 cream bar with a 32x4 navy bar through it). |
| `assets/river-foam-540x120.png` | 540x120 PNG, transparent, tileable horizontally, foam and wet-stone bank for the top and bottom edges of the river band. | So the water meets the land through a transition instead of a flat 2px stroke. |

_4 files._
