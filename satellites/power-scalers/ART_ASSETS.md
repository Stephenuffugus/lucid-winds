# POWER SCALERS art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/power-scalers/` under the names below; say which landed and the code side wires them.

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

**Game:** `power-scalers` · satellite · creative · audit impact 5/5 · effort L · audit rank 24

## Background wanted

bg-arena-540x960.jpg — a painted dark arena bowl so the roster, gauntlet and duel screens sit in a place instead of on a CSS gradient. Right now the aurora blobs are the entire art direction.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-arena-540x960.jpg` | 540x960 full-bleed. Dark arena interior seen from the floor: banked stone tiers receding into shadow, two braziers throwing warm gold pools left and right, dust motes in a shaft of light, near-black across the top 140px so the sticky topbar stays readable. | Replaces the three blurred CSS aurora blobs, which are the game's only visual background. Gives the whole app a room. |
| `race-vampire-256.png (plus 9 siblings: human, vultramite, stand_user, xenomorph, cyborg, esper, draconid, eldritch, revenant)` | 256x256 transparent PNG each. Painted bust portrait, three-quarter, warm rim light from the upper left on a dark ground, big readable silhouette at 64px. | Feeds the oc.art <img> hook that already exists at index.html:1429 and already falls back to oc.emoji on error. Replaces the emoji at index.html:474-514 that currently ARE the character art. |
| `power-icons-48-sheet.png` | 576x384 transparent sprite sheet, 12x8 grid of 48x48 glyphs, engraved-brass on transparent, one per entry in the POWERS table (Super Strength, Iron Body, Deep Reserves, Overmind, Blitz Step, Killer Instinct, Aether Blast ...). | Replaces the ~60 raw emoji used as power icons (index.html:520+), which is why 81 distinct emoji are doing the job of an icon set. |
| `ui-card-frame-540x180.png` | 540x180 nine-slice, transparent. A thin brass-and-bone frame with a slightly heavier top rail and corner rivets. | The How to Play sheet is four identical rounded rectangles stacked; a frame with a real top edge breaks the repeated silhouette so the four rows stop reading as one shape. |

_4 files._
