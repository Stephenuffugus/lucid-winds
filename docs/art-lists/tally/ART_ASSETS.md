# TALLY art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`docs/art-lists/tally/` under the names below; say which landed and the code side wires them.

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

**Game:** `tally` · satellite · math · audit impact 3/5 · effort M · audit rank 157

## Background wanted

bg-tally-attic-750x1334.jpg - a full-bleed painted warm attic shelf behind the play column: an abacus and a jar of loose beads thrown well out of focus, dust in a shaft of window light down the left, vignetted to near-nothing at the centre so the bead ring and equation strip stay the brightest things on screen. Keeps the existing cream/tan/burnt-orange palette exactly.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-tally-attic-750x1334.jpg` | 750x1334 (2x of 375x667), full-bleed JPG, soft painterly, out-of-focus abacus + bead jar, warm window light top-left, heavily vignetted centre | Replaces the flat cream radial wash that fills the top 40% of the play screen and gives the target blob a room to sit in. |
| `pal-fox-256x256.png` | 256x256 transparent PNG, painted fox head 3/4 view, warm rim light, soft cast shadow, same specular language as the navy beads | Replaces the 🦊 system emoji mascot, currently the only figure on screen and the one element in a completely foreign rendering style. |
| `pals-sheet-1024x1024.png` | 1024x1024 transparent PNG, 4x4 grid of 256px painted pal portraits (fox, owl, unicorn, bear, frog, whale, dragon, cat, rabbit, dino, robot, rocket), one shared 3/4 pose and one shared light direction | Replaces the twelve shop emoji. These are what coins buy - the entire reward loop is currently system font glyphs. |
| `target-blob-512x512.png` | 512x512 transparent PNG, painted terracotta clay medallion with a warm rim light, a soft inner glow and a contact shadow; number overlays in CSS | Replaces the CSS radial 'MAKE 28' blob so the hero of the screen has real material instead of a soft-edged colour smear. |

_4 files._
