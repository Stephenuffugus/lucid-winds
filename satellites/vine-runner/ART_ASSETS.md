# VINE RUNNER art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/vine-runner/` under the names below; say which landed and the code side wires them.

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

**Game:** `vine-runner` · satellite · action · audit impact 3/5 · effort M · audit rank 165

## Background wanted

Two things. A tiling painted vine-tube wall so the halfpipe is a surface instead of a checkerboard, and a proper canopy backdrop for the title screen. Also draw the existing vista.png as a full-frame parallax layer at low alpha behind the tube, not only as a 120px blob in the throat.

## Files

| file | spec | replaces |
|---|---|---|
| `art/run-2.png` | 512x512 transparent PNG, the second frame of the Sprout run cycle: opposite leg forward, leaves trailing the other way, matched exactly to run.png's outline weight and rim light | It 404s on every boot (404 /satellites/vine-runner/art/run-2.png). _POSE_FILE at line 133 maps run2 to it and line 999 falls back to a horizontal FLIP of run.png, so the base Sprout swaps handedness every stride instead of running |
| `art/tube-wall-1024x1024.jpg` | 1024x1024 seamlessly tiling, painted living vine interior: ribbed green vine running one axis, wet specular highlights along the ribs, dark moss packed into the grooves, value range kept dark enough that the runner reads on top of it | Replaces the flat 'lit checkerboard bands x sectors' fills that make the tunnel a muddy olive smear in play |
| `art/bg-canopy-540x960.jpg` | 540x960 full-bleed painted canopy for the TITLE screen: dark leaf mass top and sides, a warm light break at centre for the wordmark to sit on, a soft blended ground rather than a flat plane | The title screen is currently a flat olive field with ring arcs and a hard diagonal edge, and it does not use vista.png or any other art behind the logo |
| `art/thorn-2.png and art/thorn-3.png` | 256x256 transparent PNGs each, two more hazard silhouettes distinct from thorn.png: a barbed coil and a low bramble mat, same red-black palette and outline weight | Every hazard in a run is the same red cluster, so two hazards in one frame share an identical silhouette |
| `art/runner-rim-512x512.png` | 512x512 transparent PNG, a warm cream rim-light and soft contact-shadow pass shaped to the Sprout silhouette, to be composited under the runner sprite | The green runner has almost no separation from the green tube wall; a warm rim is the cheapest fix for the game's biggest readability problem |

_5 files._
