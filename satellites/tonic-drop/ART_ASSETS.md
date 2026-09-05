# ACORN DROP art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/tonic-drop/` under the names below; say which landed and the code side wires them.

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

**Game:** `tonic-drop` · satellite · puzzle · audit impact 3/5 · effort M · audit rank 173

## Background wanted

Keep both images — they exist and they are good. Boot needs the value falloff painted INTO the JPG (dark lower third, warm gold rim light on the top-left clutter) so the CSS overlay can drop to ~40% and the workshop is actually visible behind the buttons. Play needs a quieter variant of bg_cellar for the centre column so the graffiti stops competing with the pieces.

## Files

| file | spec | replaces |
|---|---|---|
| `assets/backgrounds/bg_title.jpg` | 1080x1920 full-bleed repaint/regrade of the existing workshop: value falloff painted in so the bottom third is already near-black, warm gold rim light on the shelf clutter top-left, palette pulled from brown/orange toward the game's gold + rose so it stops fighting the purple-navy UI | Replaces the current image, which the #s-title overlay crushes to invisibility below 40% height — the boot screen currently reads as a black void with slabs on it |
| `assets/backgrounds/bg_cellar_quiet.jpg` | 540x820 full-bleed, same cellar wall, but graffiti drips, halftone dots, hard triangles and checkerboard pushed to under 15% contrast across the centre 60% column; full detail kept at the left/right edges where the gold frame covers it | The painted cube sprites and especially the 0.22-alpha landing ghosts currently disappear into wall detail; a quiet centre keeps the art and returns the readability |
| `assets/ui/icon_stash.png, icon_daily.png, icon_sprint.png, icon_zen.png, icon_shop.png, icon_how.png` | six 96x96 transparent PNGs, painted in the game's own gold/rose/teal with the same chunky black outline as the sprite set — acorn, calendar leaf, stopwatch, crescent, satchel, question mark | Replaces six system emoji (🌰 📅 ⏱️ 🌙 🛒 ❓) that render in six unrelated styles inside a fully painted game that already ships acorn_amber/rose/teal.png |
| `assets/sprites/ghost_frame.png` | 64x64 transparent, a soft cream dashed outline square with a faint inner glow, no fill | Replaces the current landing hint, which is the full painted sprite at globalAlpha 0.22 — on the graffiti wall it reads as a half-loaded broken tile, not a hint |
| `assets/ui/mascot_hero_safe.png` | 700x900 transparent, same squirrel pose recomposed with his raised hand fully inside the canvas and ~90px of empty margin at the bottom-right corner | Replaces mascot_hero.png, whose hand is amputated by the 375px viewport edge and whose face is the exact spot the feedback fab mounts |

_5 files._
