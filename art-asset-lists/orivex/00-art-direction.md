# OriVex (was Petalvex) · art direction — "Clean Paper Meets Pixel"
*(Stephen 7/19: rename Petalvex to OriVex. Beautiful clean origami paper, sheets of really simple subtle gorgeous triangles, wide variety of large peaceful backgrounds that contrast the tile colors, numbers overlaid by the engine. Puzzle presented BIGGER on screen — elegant showcase.)*

## What OriVex is
The TetraVex edge-matcher: square tiles split into four triangles, each triangle carrying a digit 0-9 that is also color-coded; slot tiles so touching edges agree. The engine draws the digits ON TOP of the art, so every triangle asset is a **letterless paper facet** and the ten digit-colors become ten **paper stocks**.

## The look
Folded origami paper photographed flat in soft north-window light. Each triangle facet is a piece of premium paper with: a barely-there fiber texture (washi grain, a few silk flecks), one soft crease highlight along the fold line, and a whisper of lifted-edge shadow where facets meet — so a completed tile reads as one perfectly folded square. Zero gloss, zero gradients-for-gradient's-sake, zero clutter. The pixel half of "paper meets pixel": all edges stay CRISP and geometric — the softness lives in the texture, never the silhouette.

## The ten paper stocks (digit 0-9 — calm, distinct, colorblind-checked by VALUE steps as well as hue)
0 mist grey #d8d8d4 · 1 washi cream #efe6cf · 2 sky #a8c8e0 · 3 sage #adc9a0 · 4 butter #e8d48a · 5 terracotta #d99a72 · 6 rose #d9a0ac · 7 lavender #b3a0cd · 8 slate blue #7a8fb0 · 9 charcoal ink #4a4a50 (its digit renders cream).
Engine renders digits in ink #2e2e34 (cream on stock 9), so backgrounds and stocks must never fight the ink.

## Sheets
| # | file | contents |
|---|------|----------|
| 1 | `01-orivex-paper-triangles.md` | the 10 paper-stock triangle facets + tile base + crease/seam overlays + states (selected lift, matched shimmer, mismatch scuff) |
| 2 | `02-orivex-board-and-ui.md` | desk mat, tile wells, tray, drag shadow, hint fold, win crane FX, paper buttons/pills |
| 3 | `03-orivex-backgrounds-a.md` | 4 full-screen serene backgrounds (each its own 1080x1920 image) |
| 4 | `04-orivex-backgrounds-b.md` | 4 more, wider variety |

## Wire notes (engine, after art lands)
- Rename pass: title/manifest/share/portal card "Petalvex" → "OriVex" (folder + URL stay `/satellites/petalvex/`).
- Puzzle scale-up: board drawn ~30% larger (Stephen: it does not need to be so small) — showcase the paper.
- Triangle facets composite under engine digits; matched-edge shimmer overlays on the shared edge; background picker cycles per puzzle (or per day) with a settings override.
