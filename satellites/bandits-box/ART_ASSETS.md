# BANDIT'S BOX art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/bandits-box/` under the names below; say which landed and the code side wires them.

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

**Game:** `bandits-box` · satellite · creative · audit impact 3/5 · effort S · audit rank 153

## Background wanted

A painted maker-bench plate. The CSS already describes exactly the right scene (lamp above and left, worn surface, dark far wall, vignette) - it is just too faint to see. One image does the job the four gradients are failing to do, and gives the toys somewhere real to sit.

## Files

| file | spec | replaces |
|---|---|---|
| `assets/bench-750x1000.jpg` | 750x1000 full-bleed. Worn wooden workbench filling the lower 40%, warm scuffed grain, a dim lilac-grey wall behind it, one soft overhead lamp pool falling from upper-left. Overall value kept between #1B1822 and #3E374F so cream 15px text still reads on it. Nothing in the centre 400x400 - that is where the toy sits. | Replaces the four near-invisible .stage gradients. Gives the wall-to-bench transition an actual visible seam and makes the raccoon look touchable instead of floating. |
| `assets/bandit-contact-shadow-512x180.png` | 512x180 transparent PNG. Soft elliptical contact shadow, darkest and tightest at the centre where the feet meet, feathering to nothing at the edges. Warm-black, not pure black. | The comment at bandits-box/index.html line ~85 says each toy has to draw its own shadow in viewBox coords because a :before lands in the letterbox band. A shipped PNG anchored under the bandit's feet is easier to place than hand-tuned SVG per toy, and lets one asset serve all four toys. |
| `assets/toy-thumbs-608x152.png` | 608x152 sheet, four 152x152 cells: bandit head, puppet head, spinner, bubble-pop sheet. Painted at the same fidelity as the raccoon, transparent background. | The .strip chips are text-only pills right now. Small painted heads make the toy picker read as a shelf of things rather than a tab bar, and make the clipped right edge legible as 'there is more over there'. |

_3 files._
