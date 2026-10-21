# Hues borders

**21 Oct 2026, the remake.** The 112 frame pack is gone: every frame covered the color (the game mapped the
swatch to the middle 82% of a picture whose window was 44 to 75%), 77 carried a magenta halo, critters spilled
onto the neighbouring swatch. Stephen's scope: one family, "a little fun extra". The shop is the 8 code borders
plus Clay Crew (`clay/clay-N.png`, Astra, cut by `check.py`).

## The template (docs/briefs/hues/template/)
One frame per cell: 528x416, window 400x288 at (64,64) = pure green, band 64 = magenta. The window is mapped
onto the swatch 3% larger than it (`.bd-img::after{inset:-24.4% -18%}`), the two swatches sit two bands apart
(`.compare.tpl{gap:14%}`), the share card 9-slices at the band (`paintShareBorder`), shop tiles show the real
aspect with room for the band.

## Adding a frame
1. Astra paints on the template, ANY size (a generator cannot hold exact pixels). Guide colours only: magenta
   outside, flat pure green window, no cyan.
2. `python3 satellites/hues/borders/check.py fit <picture(s)>` finds each green window, fits it to the
   template, soft keys + despills, judges COVER (past a 12px lip, ≤0.5%), SPILL (the frame's own art at the cell
   edge, 0), rails ≥30%. All pass → `<picture>-cut/` holds 528x416 RGBA cells. `DUMP=1` writes them regardless.
3. Copy the cell to `clay/clay-N.png`, add one `BORDERS` line with `img:"borders/clay/clay-N.png"` and a price.
4. Bump `sw.js` SHELL_VERSION and the `sw.js?v=` registration together.
