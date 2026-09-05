# BEE'S POLLEN SORT art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/colorsort/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-colorsort` · native · puzzle · audit impact 4/5 · effort M · audit rank 41

## Background wanted

A painted hive wall: warm amber honeycomb receding into shadow, a dark wooden shelf running under the vials so they sit on something, a soft lamp glow from above, deep near-black at the bottom to hold the controls. This game has the strongest theme hook in the batch (bee, pollen, vials) and uses literally none of it.

## Files

| file | spec | replaces |
|---|---|---|
| `assets/games/colorsort/bg-hive-540x960.jpg` | 540x960 full-bleed. Amber honeycomb wall softly out of focus, a dark waxed-wood shelf across the upper third where the vials stand, warm lamp glow from top-centre, near-black bottom 30% for the control stack. | Replaces the bare shell gradient and gives the vials a surface. Kills the empty black band by making it part of a room. |
| `assets/games/colorsort/vial-glass-108x300.png` | 108x300 transparent PNG. A painted glass vial: rim highlight down the left edge, a warm reflection on the right, a small cork collar at the top, a soft contact shadow at the base. Interior fully transparent so pollen shows through. | Replaces the .PStube CSS outline. Turns eight identical rectangles into eight readable objects. |
| `assets/games/colorsort/pollen-grain-104x52.png` | 104x52 transparent, greyscale/white so it tints per colour. A soft clustered pollen puff with a rim light and a slightly irregular edge, plus a second variant frame for stack variety. | Replaces the flat 3px-radius colour swatches. Currently the units look like a spreadsheet legend, not pollen. |
| `assets/games/colorsort/bee-96x96.png` | 96x96 transparent. A painted bee in three-quarter view, amber and near-black bands, warm rim light, soft wing blur. | Replaces the 🐝 OS emoji in the header - the game's title character is currently a system font glyph. |
| `assets/games/colorsort/icons-controls-144x48.png` | 144x48 transparent, three 48x48 cells: a calendar leaf for Daily, a glass vial for the Glass skin, a stack of pollen for Classic. Sage and gold line art on transparent. | Replaces 📅, 🏺 and ✨ - three mismatched OS emoji, one of which shows the wrong date. |

_5 files._
