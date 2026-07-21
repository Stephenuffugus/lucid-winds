# Hues borders

The border is the flagship unlockable — it frames the color swatch and is on
screen every second of play. Stephen's art pack lives in `pack/` (`sNN_C.png`,
110 frames across families: Clay Crew, Crayon Box, Sticker, Pressed Garden,
Foil, Medals, Stained Glass, Embroidery, Patchwork, Neon, Woodblock, Moss,
Season Stickers, Clockwork, Fable). Wired in the `BORDERS` array in index.html.

## How a border renders
- **In-game:** the frame PNG is stretched as an overlay around the swatch
  (`.bd-img::after`). The frames are landscape ~1.39:1 to match the swatch, so
  the whole image stretches with no distortion; corner critters spill outward.
- **Shared result card:** 9-sliced onto the portrait card so corner critters
  stay put while the rails stretch (`paintShareBorder`).
- Images are **lazy-loaded** (only the equipped border's PNG is fetched for the
  share canvas; shop tiles use CSS backgrounds), so page load stays light.

## Adding more borders
1. Export a PNG with a **magenta #FF00FF knockout** (fills the background AND the
   empty center window), landscape ~460×330 art per frame, corner critters.
   Sheets are 4×2 grids of 8 frames on magenta.
2. Cut with the chroma-key script (see scratchpad `cut` scripts): key magenta →
   transparent, split the grid, crop each to its art, downscale to ~300px,
   quantize, save as `pack/sNN_C.png`.
3. Add one line per frame to `BORDERS`:
   `{id:"fam_thing",name:"Nice Name",ds:"short",img:"borders/pack/sNN_C.png",price:N}`.
   It auto-appears in the shop, in-game, and on the share card.

## Prices (spec economy: work for it, but fun)
Common 250-400 · Uncommon 700-1,100 · Rare 1,800-2,600 · Epic 4,500-6,000 ·
Showpiece 12,000 (Golden Chameleon). Full spec: the two .docx in the art zip /
`art-asset-lists/hues-shop/`.

## Still TODO from the spec (not yet wired)
- "Alive" borders (blinking critters): swap `_a`/`_b` frames every ~1.6s. The
  Clay Chomp and Golden Chameleon have B frames cut but not yet animated.
- Earned-only trophy lane (streak/stage/versus) — currently priced as buyable.
- Swatch-back textures, coin skins, win-burst FX (Sheet 5 of the spec).
