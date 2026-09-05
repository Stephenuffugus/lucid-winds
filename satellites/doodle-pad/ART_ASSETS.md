# DOODLE PAD art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/doodle-pad/` under the names below; say which landed and the code side wires them.

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

**Game:** `doodle-pad` · satellite · creative · audit impact 3/5 · effort S · audit rank 143

## Background wanted

None needed behind the UI — the radial midnight ground is correct and on style. What IS needed is a paper texture UNDER the drawing surface: paper-tooth-540x500.png, a subtle warm-cream fibre tile, so the artboard reads as paper instead of a #ffffff rectangle. The existing 'BG paper' toggle already implies paper; give it something to look like.

## Files

| file | spec | replaces |
|---|---|---|
| `paper-tooth-540x500.png` | 540x500, warm off-white (#faf6ee) with faint fibre tooth and a barely-there vignette at the corners, tiles cleanly | replaces the flat #ffffff canvas fill so the artboard reads as a sheet of paper, and makes the existing 'BG paper' button mean something |
| `brush-tiles-7x-144x144.png` | one sheet of seven 144x144 transparent tiles — pen nib, pencil, marker, crayon, spray can, glitter jar, star wand — soft painterly, warm gold rim light, big silhouettes readable at 50px | the brush tiles currently show only a canvas-drawn scribble of the stroke; a painted tool icon above the stroke preview would tell you what the tool IS at a glance and let the 7px text labels go away |
| `canvas-lip-540x24.png` | 540x24 transparent strip, a soft warm shadow and a thin cream paper edge, to sit at the top and bottom seam of the artboard | softens the hard 1px edge where the white canvas meets the black tool well |

_3 files._
