# TOMATO MAN art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`docs/art-lists/tomato-man/` under the names below; say which landed and the code side wires them.

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

**Game:** `tomato-man` · satellite · action · audit impact 4/5 · effort M · audit rank 83

## Background wanted

A painted beach plate behind the menus: low horizon, sun-bleached sand, and one long cast shadow crossing the frame diagonally so the menu screen itself teaches the mechanic before the player has read a word. In the locked ART-NEEDED palette, under a dark scrim so the cream type stays readable.

## Files

| file | spec | replaces |
|---|---|---|
| `art/ui/logo.png` | 1024x512 transparent PNG. Painted TOMATO MAN wordmark, chunky gouache letterforms, thick Deep Navy #23314A outline, Tomato Red #E8332A fill, one warm sun glint on the upper-left of the letters. | The code already asks for this exact path (ASSET_PATHS.logo, index.html:437) and gets a 404 today. Replaces a plain system-font title. |
| `art/hero/tomato_body.png` | 512x512 transparent PNG, hero body at 4x in-game size, thick navy outline, single warm sun key, soft cel shadow, anchor at the sprite centre so the swept-shadow geometry still lines up. | Already requested by ASSET_PATHS.hero_body (index.html:436) and 404ing; the engine falls back to a drawn circle with two dots for eyes. |
| `art/ui/world_thumb_morning-tide.png (plus midday-blaze, tide-pools, dunes-at-dusk, eclipse)` | 5 files, 320x180 transparent PNG. One painted vignette per world: long dawn shadows, white-hot noon sand, reflective pools under wilting shade, wind streaks over dunes, the Angry Sun in eclipse. | Gives each world card something to show instead of a sentence, and breaks the five-identical-rectangles silhouette on the Choose a World screen. |
| `art/ui/icon_sun.png, icon_shade.png, icon_move.png, icon_dash.png` | 4 files, 128x128 transparent PNG, painted in the locked palette with the navy ink outline. | Replaces the sun / white-circle / joystick / dash emoji on the four How to Play cards. The shade icon in particular must read as a cast shadow rather than a white dot. |
| `art/ui/lock.png` | 96x96 transparent PNG, small painted padlock in Driftwood #C98B53 over navy ink. | Replaces the padlock emoji repeated on four locked world rows. |

_5 files._
