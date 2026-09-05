# JUMPING JIMOTHY art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/stream-hop/` under the names below; say which landed and the code side wires them.

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

**Game:** `stream-hop` · satellite · action · audit impact 2/5 · effort S · audit rank 179

## Background wanted

None needed for the game — this is the best-arted title in the batch. The one gap is the how wall, which is a flat dark panel while every other screen is painted, so the art language breaks one tap in.

## Files

| file | spec | replaces |
|---|---|---|
| `assets/how/how_paper_540x960.jpg` | 540x960 full-bleed JPG. The same cream-ink paper as the key art but pushed dark — a rain-soaked page under a street lamp — vignetted at the edges and flat enough through the middle for 14px body copy. | The how wall is the only screen in a 370MB painted game with no background of its own, so a player leaves the ink world one tap after entering it. |
| `assets/ui/music_pill_ink_120x48.png` | 120x48 transparent PNG. A brush-drawn ink label with a hand-lettered note glyph, no filled slab, sized to sit on cream paper without a border. | Replaces the injected chip's default filled dark rectangle, which is currently the worst thing in the boot frame — a system-styled slab on hand-drawn cream art. |
| `assets/ui/star_ink_48x48.png plus star_ink_empty_48x48.png` | Two 48x48 transparent PNGs, brush-drawn stars in the same ink as the key art, one filled one outline. | Replaces the system star glyphs at #lv-stars (line 739) and #cl-stars (line 1012, 30px gold with 6px letter-spacing) — the last system typography left in an otherwise hand-drawn game. |

_3 files._
