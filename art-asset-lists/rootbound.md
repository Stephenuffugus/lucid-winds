# Rootbound — Sprite-Sheet Asset List

Klotski-style sliding-block puzzle. A 4×5 garden bed; the player slides rectangular "planter" pieces aside to free the 2×2 golden bloom out the gate at the bottom-centre. The whole visual field is planters on soil inside a raised wooden bed — that is what these sheets skin. The play board is drawn at a fixed rect (x36 y160, 468×585) on the 540×960 stage, so the bed frame can be baked into the play background.

Currently everything is procedural Canvas2D (gradient pots, drawn wooden walls + gate, colored-circle particles). No image assets, no ART hook yet.

---

## STYLE (shared — prepend to every sheet prompt)

Bright, colorful, fun handmade paper-craft game art. Cozy midnight-garden world with deep near-black green shadows, saturated sage greens, antique gold rewards, cream highlights, rose accent for the target bloom and gate. Subject is a walled raised garden bed full of little planter pots and boxes: chunky felt-and-cut-paper flower pots, wool-felt sprouts, macrame-cord rims, beaded soil, sequin dew, scrapbook-layered petals, stitched edges, soft handmade texture. Clean readable silhouettes first — each pot must read instantly as its shape at small size. Cute botanical cozy energy, never scary or grim. Soft top-down key light with warm gold rim-light. Chunky arcade readability at small sizes. No photorealism, no 3D render, no text labels, no captions, no borders, no UI words. Keep detail bold and simple enough that each cropped asset compresses well. Palette base #0e140d, sage #7ab356, gold #c8a84b, cream #e8dcc8, rose #e58fa0, bark brown #6b4a2b.

---

## Sheet 1 — Backgrounds (full-bleed)

- File name: `rootbound_bg_sheet.png`
- Grid: 2 cols × 1 row
- Cell size: 1620 × 2880 px (portrait)
- Master size: 3240 × 2880 px
- Knockout rule: full-bleed art, no magenta inside a cell; magenta #FF00FF only in the gutter between the two cells.
- Compression: export each cut cell under 150KB (quantized PNG or JPG).

1. `menu_bg` — Cozy night-garden backdrop for the title / how-to / settings / win screens: a soft-focus row of paper-craft raised garden beds under a deep near-black-green sky, warm gold firefly sparkles, a small wooden garden gate silhouette in the mid distance, sage foliage framing the lower edges. Calm, empty centre so UI text sits cleanly on top.
2. `play_bg` — The in-play backdrop with the raised garden bed baked in at the board position (centred, upper-middle of the portrait frame): a chunky bark-brown wooden raised-bed frame with macrame-cord corners, dark tilled soil inside with a faint 4×5 furrow grid, and an open garden gate gap at the bottom-centre flanked by two little gold gate posts. Surrounding area is dim night-garden vignette so the pieces pop. No pots inside — the bed is empty ready for sprites.

---

## Sheet 2 — Planters & FX (cutout sprites)

- File name: `rootbound_pieces_sheet.png`
- Grid: 3 cols × 3 rows
- Cell size: 512 × 512 px
- Master size: 1536 × 1536 px
- Knockout rule: flat magenta #FF00FF background in every cell for knockout. No magenta inside the artwork.
- Design note: pieces are drawn into rectangular grid rects (square 2×2, tall 1×2, wide 2×1, small 1×1). Author each planter centred with a soft rounded-rectangle body and NO critically-circular rim, so it still reads correctly when the engine stretches it to a tall or wide slot. Leave a few px of magenta margin around each sprite.
- Compression: export each cut sprite under 150KB.

1. `golden_bloom_planter` — The hero 2×2 piece: a big square antique-gold felt planter, macrame rim, dark soil, and a single show-stopping rose-and-gold cut-paper bloom with sequin centre and a couple of sage leaves. Warm gold rim-light, clearly the treasure of the board.
2. `small_pot_a` — The 1×1 piece: a small chunky bark-brown terracotta-felt pot with a tiny cream-and-sage wool sprout poking up. Cute and simple.
3. `small_pot_b` — 1×1 variant: same small pot silhouette in a slightly warmer clay tone with a single tiny rose bud sprout, for board variety.
4. `green_planter_a` — The tall/wide ordinary piece (used for 1×2 and 2×1 slots): a sage-green felt planter box with stitched edge, dark soil, two little sprouts. Soft rounded body that reads fine stretched tall or wide.
5. `green_planter_b` — Ordinary planter variant: deeper sage / moss box with a small cluster of felt leaves, no flower.
6. `green_planter_c` — Ordinary planter variant: sage box with one tiny rose accent sprout and beaded soil, for extra variety across the board.
7. `target_bloom_ghost` — A faint translucent gold-and-rose glow silhouette of the hero bloom shape, soft-edged, used as the "here's the gate" marker hovering at the exit before the bloom arrives. Airy, ~40% presence.
8. `win_petal` — Single small rose/gold cut-paper petal for the victory burst particle. Tiny, bold, one clean shape.
9. `win_sparkle` — Small four-point gold sequin sparkle / glint for the victory burst and gate-free flourish. Bold and simple.

---

## WIRE NOTES

Add an `RB_ART` image loader (mirror the Nectar Drop "art replaces procedural draw when present, fall back when absent" pattern). Map cut assets to code paths:
- `drawPiece()` (index.html ~L475): switch on `pc.t` — `CC` → `golden_bloom_planter`; `S` → `small_pot_a`/`small_pot_b` by `pc.id % 2`; `V` and `H` → `green_planter_a/b/c` by `pc.id % 3`. `drawImage` into `pieceRect(pc)`; keep the existing vector draw as the fallback when the image isn't loaded.
- `render()` background (L522–563): draw `play_bg` in place of the gradient fill + garden-bed frame + wall/gate/grid strokes (bed geometry is fixed, so it's baked into the image). The goal-ghost rect → `target_bloom_ghost`.
- Screen backdrops: set the `.screen` CSS background (title/how/settings/win) to `menu_bg`.
- `burst()` / particle draw (L572, L602): swap the flat `arc()` dots for `win_petal` + `win_sparkle` in the escape/win flourish.
- Recommended folder: `satellites/rootbound/assets/` (e.g. `assets/rootbound_pieces_sheet_*` cut sprites + `assets/menu_bg.jpg`, `assets/play_bg.jpg`). Bump a `?v=` cache-bust on the portal deploy.
