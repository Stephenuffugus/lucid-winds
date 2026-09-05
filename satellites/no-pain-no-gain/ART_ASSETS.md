# NO PAIN, NO GAIN art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/no-pain-no-gain/` under the names below; say which landed and the code side wires them.

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

**Game:** `no-pain-no-gain` · satellite · puzzle · audit impact 4/5 · effort M · audit rank 81

## Background wanted

bg-workshop-540x960.jpg - a painted claymation workshop wall: pinboard with pinned sketches, plasticine smears and thumbprints, a hanging worklamp that motivates the existing top glow, a scuffed plank floor with a real lip. Warm browns and clay greys, deep shadow at the frame edges.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-workshop-540x960.jpg` | 540x960 full-bleed painted claymation workshop: pinboard, plasticine smears, hanging worklamp top-centre, plank floor and skirting along the bottom quarter, vignetted corners | replaces the plain vertical gradient plus the three flat fillRects, and gives the traps a room to hang in |
| `traps-sheet-576x288.png` | 576x288 transparent sheet, 12 painted trap icons at 96x96, all in the game's gold / clay / sage palette with a warm rim light: spikes, spring, saw, bomb, fan, laser, hammer, balloon, tesla coil, portal, black hole, bin | replaces every emoji in HAZTYPES so the palette stops fighting the brown room |
| `haz-spikes-120x40.png and haz-spikes-b-120x40.png` | two 120x40 transparent painted spike strips on a clay base, one straight, one with a bent tooth and a chipped corner | two variants let the placement code alternate so six spikes in a frame stop reading as tiling |
| `clayton-sheet-384x256.png` | 384x256 transparent, the ragdoll's body parts at painting quality - head, torso blob, four limb segments - with visible thumbprint texture and a warm rim, drawn to match the existing joint radii | replaces the plain circle-and-blob ragdoll drawn at lines 479-488 so the star of the game is not three grey circles |

_4 files._
