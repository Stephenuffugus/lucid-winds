# PETAL PLUNGE art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/petal-plunge/` under the names below; say which landed and the code side wires them.

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

**Game:** `petal-plunge` · satellite · action · audit impact 3/5 · effort S · audit rank 168

## Background wanted

It has one, and it works - except bg_meadow.jpg, which is a bright cyan-sky noon meadow. Repaint that single file at late afternoon or dusk: warm gold light, deeper greens, no cyan, so the biome ladder reads as one journey from dusk garden down into the night gorge instead of a jump-cut out of the dark menu.

## Files

| file | spec | replaces |
|---|---|---|
| `bg_meadow.jpg (repaint, 540x960)` | same composition, relit for late afternoon: warm gold key light, deeper saturated greens, sky pushed to amber-rose instead of cyan, horizon haze | the current noon-blue version is the one asset that clashes with the dark menus and the midnight-greenhouse palette |
| `obs_tree_b.png, obs_boulder_b.png, obs_shroom_b.png` | 128x128 transparent each, second variants of the three most-placed props - a leaning pine, a split boulder with a moss cap on the other side, a shorter clustered mushroom pair | gives the placer something to alternate so a frame stops showing the same silhouette five and six times |
| `mode-icons-256x256.png` | 256x256 transparent sheet, four painted 64x64 icons: a leaf sled, a bamboo gate pair, a trick spiral with petals, a dew-drop day marker | replaces the four emoji on the 'Choose a Descent' cards, including the calendar emoji that prints a wrong hard-coded date |
| `hud-plate-375x64.png` | 375x64 transparent, a painted bark-and-stone HUD bar with two recessed wells for DEPTH and PETALS and a centre well for COMBO | gives the HUD somewhere to live and reserves a centre slot, which also stops the music chip landing on the combo readout |

_4 files._
