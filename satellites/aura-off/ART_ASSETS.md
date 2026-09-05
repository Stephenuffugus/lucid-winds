# AURA OFF art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/aura-off/` under the names below; say which landed and the code side wires them.

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

**Game:** `aura-off` · satellite · action · audit impact 3/5 · effort M · audit rank 145

## Background wanted

bg-square-dusk-540x960.jpg - a night plaza seen head-on: brick wall, chainlink, two sodium lamps, wet paving catching magenta and amber, the top third dark enough to hold the cream title. Painted, so the flat mid-screen has somewhere to be.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-square-dusk-540x960.jpg` | 540x960 full-bleed, night plaza, brick + chainlink + two sodium lamps, wet paving, magenta/amber key, top third under 12% luminance | replaces the flat body gradient behind every menu and screen; fixes the empty middle of FIT CHECK and gives the crowd band a wall to stand in front of |
| `fit-loud-clogs-256x256.png, fit-all-black-256x256.png, fit-headcloth-256x256.png, fit-frog-suit-256x256.png, fit-school-uniform-256x256.png` | 256x256 transparent PNG each, single garment or shoe on nothing, painterly, warm rim light from upper left, big readable silhouette | the five fit cards currently carry no image; one thumbnail each breaks the five-identical-rectangles look and makes the choice visual instead of textual |
| `stage-lamp-glow-540x300.png` | 540x300 transparent, soft amber cone with dust motes, hard-light blend | replaces the flat radial lamp bloom behind the title so the light has grain instead of a smooth ramp |

_3 files._
