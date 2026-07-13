# Dewball — Pack README (generation order + wiring plan)

Recommended look: **Paper Lantern Parade** (see `00-art-direction.md`; Stephen makes the final call — all sheets share the same plan, only the STYLE paragraph would change).

Each sheet file is fully self-contained: paste ONE file into the generator per image. Bring back PNGs named as specified; cutting is magenta-key knockout except where a sheet says FULL-BLEED.

## Generation order

| # | File | Output | Size | Cells | Wires |
|---|------|--------|------|-------|-------|
| 1 | 01-dewball-ground-w1.md | ground-w1.png | 1024x1024 seamless | 1 | ✅ today (auto-hook) |
| 2 | 02-dewball-ground-w2.md | ground-w2.png | 1024x1024 seamless | 1 | ✅ today |
| 3 | 03-dewball-ground-w3.md | ground-w3.png | 1024x1024 seamless | 1 | ✅ today |
| 4 | 04-dewball-ground-w4.md | ground-w4.png | 1024x1024 seamless | 1 | ✅ today |
| 5 | 05-dewball-ground-w5.md | ground-w5.png | 1024x1024 seamless | 1 | ✅ today |
| 6 | 06-dewball-ground-w6.md | ground-w6.png | 1024x1024 seamless | 1 | ✅ today |
| 7 | 08-dewball-ballskins.md | dewball_ballskins.png | 1024x1024 (2x4 equirect) | 8 | near drop-in (skinTexture swap) |
| 8 | 07-dewball-skies.md | dewball_skies.png | 3072x1536 (6x1 bands) | 6 | wire pass (sky dome) |
| 9 | 09-dewball-props-picnic-1.md | dewball_picnic1.png | 2048x2048 (4x4) | 16 | wire pass (prop cards) |
| 10 | 10-dewball-props-picnic-2.md | dewball_picnic2.png | 2048x2048 (4x4) | 16 | wire pass |
| 11 | 11-dewball-props-toybox-1.md | dewball_toybox1.png | 2048x1536 (4x3) | 12 | wire pass |
| 12 | 12-dewball-props-toybox-2.md | dewball_toybox2.png | 2048x1536 (4x3) | 11+1 empty | wire pass |
| 13 | 13-dewball-props-nightgarden-1.md | dewball_nightgarden1.png | 2048x1536 (4x3) | 12 | wire pass |
| 14 | 14-dewball-props-nightgarden-2.md | dewball_nightgarden2.png | 2048x1536 (4x3) | 12 | wire pass |
| 15 | 15-dewball-props-bazaar-1.md | dewball_bazaar1.png | 2048x1536 (4x3) | 12 | wire pass |
| 16 | 16-dewball-props-bazaar-2.md | dewball_bazaar2.png | 2048x1536 (4x3) | 11+1 empty | wire pass |
| 17 | 17-dewball-props-bay-1.md | dewball_bay1.png | 2048x1536 (4x3) | 12 | wire pass |
| 18 | 18-dewball-props-bay-2.md | dewball_bay2.png | 2048x1536 (4x3) | 12 | wire pass |
| 19 | 19-dewball-keepsakes.md | dewball_keepsakes.png | 2000x2000 (5x5) | 25 | wire pass (cards + collection icons) |
| 20 | 20-dewball-ui.md | dewball_ui.png | 2048x2048 (4x4) | 16 | wire pass (DOM/CSS) |
| 21 | 21-dewball-fx.md | dewball_fx.png | 2048x1536 (4x3) | 12 | wire pass (pips/bursts) |

21 generated images · 201 cells (198 art + 3 reserved empties). Grounds first: they wire with ZERO code (the engine already probes `assets/ground-<worldId>.jpg` per world) so Stephen sees results after the very first six images.

## Wiring plan

**Wire today, no code:** drop `ground-w1.jpg` … `ground-w6.jpg` into `/workspaces/lucid-winds/satellites/dewball/assets/` (convert PNG → JPG at quality ~85, keep under 150KB). `buildWorld()` already tries these paths and falls back to the procedural tile.

**Near drop-in (minutes):** ball skins — swap `skinTexture()` to load the matching equirect cell from `dewball_ballskins.png` cuts, keeping the canvas painter as the absent-asset fallback.

**Wire pass needed (a future session, per DESIGN.md billboard plan):**
- Prop cards: add a card mode to `kindGeo()` — a double-sided `card` primitive textured with the cut cell, sized to the kind's `s`; keep merged-geometry procedural as fallback per kind. Cut cells to `assets/props/<kind>.png`.
- Sky bands: replace the vertex-colored dome with a cylinder/dome textured per world band.
- Keepsakes: same card mode + use the cells as Collection-screen icons (replace the `?????` rows' bullet).
- UI: 9-slice plates onto `.overlay`/`.card`/`.btn`/`.wcard`, emblem images into world cards, stick base/nub images, dash button faces.
- FX: swap `pip()` accents, milestone/goal flashes, knock flinch, dash trail (new sprite emitter), gate dust, keepsake beacon mesh → sprite.

Path-version everything (`?v=<build>`) — the host resizes and over-caches (see `reference_hostinger_image_resizer`). Verify against the LIVE url after deploy. Cut with the house magenta-key script (`scripts/` has per-game `cut_*.py` exemplars; add `cut_dewball.py` at cut time).

⛔ The top-level `art-asset-lists/README.md` index does NOT yet list Dewball — add it there when this pack enters the generation queue (this pack's author was scoped to this folder only).
