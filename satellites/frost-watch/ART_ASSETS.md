# FROST WATCH art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/frost-watch/` under the names below; say which landed and the code side wires them.

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

**Game:** `frost-watch` · satellite · action · audit impact 4/5 · effort S · audit rank 126

## Background wanted

Keep sky.jpg, add the missing mid-ground and re-author the ground. The sky is doing its job; what the frame needs is one silhouette layer between the moon and the roofs and a ground tile authored at the aspect it is actually drawn at.

## Files

| file | spec | replaces |
|---|---|---|
| `assets/meadow/frozen-136x520.jpg` | Authored at the drawn aspect (68x260 stage, so 136x520 at 2x), seamless on the left and right edges, pale blue-white frost crystals with the value pulled down toward #9db8cf so it sits under a midnight sky instead of glowing at near-white. | Replaces the 240x320 frozen.jpg that is squeezed to 68x260. Fixes both the stretched crystals and the ice band being the brightest thing on a night screen. |
| `assets/meadow/thaw-90x32.jpg and assets/meadow/bloom-90x32.jpg` | Authored at the drawn aspect (SEGW 45 x ROWH 16, so 90x32 at 2x), seamless horizontally: thaw is damp dark loam with the first green, bloom is meadow grass with small sage and rose flowers. | Replaces two 240x320 jpgs squashed into 45x16, which is a 1:7 aspect crush. The thaw meadow is the game's whole scoring mechanic and right now it is a smear. |
| `assets/meadow/lip-540x36.png` | Transparent PNG, full stage width, a snow crest with an irregular drifted top edge and translucent icicles hanging 10px below. | Replaces the squashed lip.jpg and turns the hard sky-to-ground line into an actual transition. |
| `assets/bg/treeline-540x140.png` | Transparent PNG, full stage width, a band of snow-laden conifers and one broken watchtower in near-black #0d1520, sitting at roughly y=560 behind the hills. | Fills the 400px of empty sky between the moon and the rooftops and gives the falling shards something to pass in front of. |
| `wire the 8 painted UI plates that already ship` | No new art needed: assets/ui/med_gold.png, med_slate.png, med_solar.png, chip_gold.png, chip_blue.png, chip_greenb.png, chip_smallb.png, chip_plainb.png are in the repo and referenced zero times in index.html. | Eight painted assets are already paid for and unused while chip_plain.png does every job. Free variety on the HUD and the results screen. |

_5 files._
