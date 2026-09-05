# WORD SEARCH art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/wordsearch/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-wordsearch` · native · word · audit impact 4/5 · effort M · audit rank 61

## Background wanted

A pressed-herbarium page: dark ink-stained paper, ghosted botanical line drawings at ~12% in the margins, a warm gold lamp glow from the top left, vignette at the corners. The puzzle should read as printed on something.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-wordsearch-herbarium-750x1334.jpg` | 750x1334 full-bleed, dark pressed-paper ground with fibre texture, ghosted fern and seed-head line art in the outer margins at ~12% opacity, warm lamp glow top-left, vignette | Replaces the shared flat gradient; turns the void behind the letters into a page. |
| `wordsearch-frame-9slice-96x96.png` | 96x96 transparent PNG cut as a 9-slice with 32px corners, thin sage-and-gold botanical border with small corner knots | Wraps .wg so the letter block reads as a printed puzzle panel instead of a floating grid of boxes. |
| `wordsearch-strike-ribbon-192x48.png` | 192x48 transparent PNG, hand-inked sage strike stroke with a slightly ragged end, stretchable in the middle | Replaces the CSS text-decoration:line-through on found words (games/wordsearch.js:23) with something that looks drawn. |
| `wordsearch-theme-flora-128x128.png (plus -harvest, -lunar)` | 128x128 transparent PNGs, one small painted motif per word theme: a pressed leaf, a wheat sheaf, a moon-and-moth | Sits beside the 'Flora' theme label (games/wordsearch.js:322) so each new grid has an identity instead of only a word changing. |
| `win-wreath-512x512.png` | 512x512 transparent PNG, painted sage-and-gold laurel wreath with a soft inner glow | Replaces the 🌿 emoji blown up to 4.6rem, which is currently the entire art of the win screen (games/wordsearch.js:197). |

_5 files._
