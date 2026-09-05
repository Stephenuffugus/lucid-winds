# BREATHING GARDEN art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/breathing/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-breathing` · native · creative · audit impact 5/5 · effort M · audit rank 23

## Background wanted

bg-breathing-540x960.jpg - a night garden seen close: dark leaves and stems crowding the left and right edges, one pale bloom lit centre-top by moonlight, falling to near-black at the bottom so the pill grid still reads. This is the game with the most headroom in the batch because it currently has no art at all.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-breathing-540x960.jpg` | 540x960 full-bleed, night garden, dark leaves framing the edges, one moonlit bloom top-centre, bottom 40% dropping to near-black for text legibility. | Replaces the shared shell radial gradient - the whole page is currently the same flat ground as 65 other natives. |
| `tech-{478,box,478relax,triangle,bhramari,sitali,ujjayi,sigh,nadi,energy,kapalabhati,lion,calm46,coherent}-64x64.png` | 14 files, 64x64 PNG-32 transparent, single-weight sage line-art glyphs on no background - a curled leaf for calm, a bee for Bhramari, a lion's head for Lion's Breath, a triangle of stems for Triangle, a moon for Nadi Shodhana. | Gives the fourteen identical capsules a distinguishing mark; right now the only difference between any two pills is the words inside them. |
| `bloom-petal-256x256.png` | 256x256 PNG-32 transparent, one soft painted petal, warm rim light on the outer edge, translucent toward the base, so 6-8 copies can be rotated around the canvas centre. | The canvas bloom is currently four hard-coded rgba arcs plus a radial gradient. One painted petal turns the whole breathing animation into art for the cost of a single file. |

_3 files._
