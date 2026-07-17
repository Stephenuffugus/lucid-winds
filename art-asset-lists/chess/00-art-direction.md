<!-- CHESS SKINS — art direction. Read once; every numbered sheet bakes the relevant STYLE line in, so each sheet file is self-contained for the generator. -->

# Chess skins — direction

**Goal (Stephen 7/17):** "a bunch more fun chess assets... entire chess sets in one sheet so that's easy, or at least 2 sheets. all kinds of themes."

## The one-sheet set
Every theme is ONE sheet: 4×4 grid, 512px cells, 2048×2048 master, flat magenta #FF00FF knockout in every cell background, NO text/numbers/watermarks anywhere.

Fixed cell order (identical for every theme — the cutter and the game rely on it):
- Row 1: white king · white queen · white rook · white bishop
- Row 2: white knight · white pawn · black king · black queen
- Row 3: black rook · black bishop · black knight · black pawn
- Row 4: light board tile (full-bleed square, no knockout) · dark board tile (full-bleed) · white capture chip (small token face) · black capture chip

## Readability laws (non-negotiable)
1. **Silhouette first.** A piece must be identifiable at 44px from shape alone: king tallest with a crown point, queen coronet, rook flat-topped tower shape, bishop split mitre point, knight in profile facing LEFT, pawn smallest and round-headed. Theme characters must bend to these silhouettes, never replace them.
2. **Same character, two teams.** Black pieces are the SAME characters as white, recolored cool/dark; white team warm/light. Never two different creatures for the same piece type.
3. **Common plinth.** Every piece stands on the same small rounded base disc (theme-tinted) so heights compare truthfully: pawn 55% of cell height, rook/bishop/knight 70%, queen 82%, king 90%.
4. Pieces centered, upright, generous margin, no ground shadows, no glow spilling to cell edges.
5. Kid-friendly faces welcome (dot eyes, no menace), but faces stay SMALL so the silhouette wins.

## Wiring notes (cut pass, not for the generator)
- games/chess.js already routes rendering through `getPieceSVG` / `_skinChess` and a `_chArt` board png — themes drop in as sprite sets + 2 board tiles.
- Cut to `play/assets/chess/<theme>/{wK,wQ,wR,wB,wN,wP,bK,bQ,bR,bB,bN,bP,tile-light,tile-dark,cap-w,cap-b}.png`, each ≤60KB.
- Theme picker follows the existing deck-style toggle pattern (`_cdToggleStyle` in the card games). Unlocks: play-earned, KNOWN thresholds, no lootboxes.
