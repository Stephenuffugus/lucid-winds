# SEED TOSS art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/seedtoss2/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-seedtoss2` · native · creative · audit impact 4/5 · effort M · audit rank 124

## Background wanted

A painted dusk meadow at the canvas's own 380x480, with a warm low horizon glow behind the ridgelines so the empty middle band has something in it, and a deeper teal-black zenith so the scoring ladder still reads against it. The source already anticipates this: line 11 says 'When art lands, swap colors for img refs.'

## Files

| file | spec | replaces |
|---|---|---|
| `bg-seedtoss-dusk-380x480.jpg` | 380x480 full-bleed, painted dusk meadow: warm gold horizon band low behind two ridgelines, deep teal-black at the top, two or three soft cloud banks in the middle third | Replaces the 3-stop linear gradient in draw() and fills the empty middle band where only dashed rules live now |
| `pot-terracotta-120x140.png` | 120x140 transparent, painted tapered flowerpot, warm rim light from upper-left, dark inner mouth, soft contact shadow baked out | Replaces drawPotSkinned's gradient-and-arc construction; the six POT_SIZES tiers become recolours of one painted pot instead of six palette swaps |
| `ground-fringe-380x80.png` | 380x80 transparent, grass and soil fringe with irregular tufts breaking the top edge, darkening to opaque at the bottom | Kills the ruler-straight hard edge where the rgba(40,35,25,0.4) ground rect meets the hill silhouette |
| `seed-32x32.png` | 32x32 transparent, painted seed with a warm specular highlight and a faint sprout tip | The projectile is currently a gradient circle with a white dot (drawSeed, lines 492-507); it is the thing the player watches for the whole game |

_4 files._
