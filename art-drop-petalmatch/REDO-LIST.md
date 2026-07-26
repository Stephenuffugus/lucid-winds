# Petal Match — sprites that need remaking

Generated while cutting. Each entry says WHY, so the fix is obvious.

## 1. Sheet 4, item 5 — the board shadow
**Problem:** it is painted magenta on magenta. Measured: the shape's centre is
rgb(248,3,246); the sheet background is rgb(251,2,250). A distance of 3 out of
255. There is no image data there to recover, at any threshold.

**Fix:** paint the drop shadow as a soft BLACK or very dark square on the magenta
background. Anything that is not close to the background colour will cut fine.

**Not urgent** — a drop shadow can be done in CSS/canvas if you would rather skip
it. Everything else on sheet 4 cut perfectly.
