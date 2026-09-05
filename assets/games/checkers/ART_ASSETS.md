# CHECKERS art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/checkers/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-checkers` · native · board · audit impact 4/5 · effort S · audit rank 56

## Background wanted

A painted board plate. Warm dark-walnut light squares against moss-black dark squares with visible grain, a thin gold inlay frame, and a soft table surface bleeding out past the frame edges so the board sits on something instead of floating on the shell gradient.

## Files

| file | spec | replaces |
|---|---|---|
| `assets/games/checkers/board-720x720.png` | 720x720, 8x8 at 90px pitch. Light squares warm walnut with grain, dark squares moss-black with a subtle leaf texture, at least 3:1 luminance between them, a 12px gold inlay frame, soft inner shadow at the frame. | Replaces .ckd/.ckl entirely. The single fix for the game's biggest fault - a checkerboard you cannot see. |
| `assets/games/checkers/table-540x960.jpg` | 540x960 full-bleed. Dark greenhouse potting bench: worn wood, a scatter of soil grain, warm lamp falloff from the top, deep near-black at the bottom edge. | Gives the board somewhere to sit and fills the dead near-black band under the controls. |
| `assets/games/checkers/crown-64x64.png` | 64x64 transparent. A small woven-vine crown with three gold buds, warm rim light. | Replaces the polyline zigzag currently drawn into SVG_PK/SVG_AK for kings, which reads as a scribble at 34px. |
| `assets/games/checkers/btn-undo-160x96.png and btn-hint-160x96.png` | 160x96 transparent each, carved wood plaques matching new-game-btn.png exactly - same wood, same vine border, same carved lettering. | Ends the style clash. Either UNDO and HINT join the painted plaque or the plaque goes; today one painted object sits alone among flat pills. |

_4 files._
