# SUPER SLICE art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/slice-3d/` under the names below; say which landed and the code side wires them.

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

**Game:** `slice-3d` · satellite · action · audit impact 4/5 · effort L · audit rank 122

## Background wanted

A painted canyon back wall on the existing back plane: warm ochre and sage rock bands, moss creeping down the upper third, dust motes in a shaft of light, cooling and darkening toward the bottom.

## Files

| file | spec | replaces |
|---|---|---|
| `ff-strata-512x1024.jpg` | 512x1024 full-bleed painted canyon strata: ochre and sage rock bands, mossy rim in the top eighth, a faint central light shaft with dust motes, cool near-black at the bottom | replaces the four-stop canvas gradient at line 1160 so the shaft actually has depth instead of reading as one brown field |
| `ff-wall-rock-256x256.jpg` | 256x256 tileable painted rock face with chisel facets, a warm rim highlight along one edge and a mossy speckle | applied as a map on the two side-wall Lambert materials at line 1171 so the side walls stop matching the back wall exactly |
| `fruit-rind-atlas-1024x256.png` | 1024x256, four 256x256 tiles of painted rind detail (dimpled citrus, waxy apple, ribbed melon, fibrous husk), transparent, to multiply over the existing fruit colours | replaces the flat single-hex spheres in the FRUITS table (lines 504-519) so a watermelon and a plum stop being the same object in two colours |
| `sky-dome-1024x512.jpg` | 1024x512 painted sky for the rim above the shaft: dawn gold at the horizon into deep sage-blue overhead, one soft sun bloom, a few high clouds | replaces the 64x256 three-stop gradient plane and the plain circle-geometry sun at line 1155 |

_4 files._
