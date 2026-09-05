# ROOT GROUPS art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/root-groups/` under the names below; say which landed and the code side wires them.

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

**Game:** `root-groups` · satellite · word · audit impact 4/5 · effort M · audit rank 46

## Background wanted

A painted midnight grove floor. bg-grove-540x960.jpg: dark loam and moss with pale root filaments crossing it, a warm gold pool of light low-centre exactly where the 300px void is, deep vignette to the corners, dark enough that cream tile text still reads at 4.5:1.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-grove-540x960.jpg` | 540x960 full-bleed painted near-black grove floor, moss and pale roots, warm gold light pool low-centre, deep vignette | Replaces the radial gradient and fills the 300px dead band under the board with a composed surface instead of flat black. |
| `tile-plate-176x88.png` | 176x88 transparent PNG, painted mossy bark or river-stone plate with a soft rounded edge and a lit top rim, 9-slice safe margins of 16px | Replaces the flat .cell gradient so sixteen tiles gain a painted surface and a real lit edge. |
| `group-crest-1-64x64.png (plus -2, -3, -4)` | four 64x64 transparent PNGs: a leaf, a root knot, a seed pod and a bloom, painted in the four group tints t1 sage / t2 blue / t3 gold / t4 rose | A solved group currently collapses to a flat coloured bar (.grp.tt1 through .tt4); a crest makes the reward read as art. |
| `root-flourish-540x200.png` | 540x200 transparent PNG, a painted root and vine flourish that fades out at both ends, meant to sit low in the frame behind the control bar | Occupies the lower band so the frame is not half empty even before the background lands. |

_4 files._
