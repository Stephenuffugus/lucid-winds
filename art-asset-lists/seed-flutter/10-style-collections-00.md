# Cosmic Cadets — STYLE COLLECTIONS (skins in dramatically different art styles)

> Stephen, 2026-07-17: "more skins for Cosmic Cadets — I can make many sheets of
> many styles quickly." This is that pack. The 06–09 expansion was *more
> colorways of the same papercraft comet*. THIS pack is **whole different art
> styles** — the same little cadet drawn as pixel-art, neon, crayon, stained
> glass, clay, chrome. Generate whichever sheets you like; each one drops a
> COMPLETE themed collection.

## The pattern — one sheet = one style = a full collection

Every collection sheet is **4 columns × 4 rows (16 cells)**, 512×512 per cell,
**2048×2048 master**, one dramatically different STYLE baked in, and it contains
one of EACH cosmetic type so the drop is self-contained:

```
Row 1 (cells 1–4)   COMET SKINS   — 4 hero skins in this style
Row 2 (cells 5–8)   TAIL TRAILS   — 4 trails in this style
Row 3 (cells 9–12)  SKY-BUDDIES   — 4 floating companions in this style
Row 4 (cells 13–16) KEEPSAKE STARS— 4 Sky-Map collectibles in this style
```

## Silhouette law (identical across every style — only the RENDERING changes)

The game draws one sprite per slot, so the SHAPE per cell type is fixed; the
art style on top of it is what varies sheet-to-sheet. Keep these silhouettes:

- **Comet skin** (row 1): a rounded glowing comet HEAD with two small friendly
  dot-eyes (no mouth) and a soft radiant fan of light-rays leading UP. Centered,
  upright, fully inside the cell with margin. NO ground shadow.
- **Tail trail** (row 2): a short LEFT-trailing string of 5–6 fading motes
  (largest at the RIGHT, smallest at the LEFT — the hero flies right-and-up).
  Centered, NO ground shadow.
- **Sky-buddy** (row 3): a SMALL cute sky-creature in a side-on drifting pose
  **facing RIGHT** (it floats beside the hero). Friendly dot-eyes, rounded,
  kid-cozy — never scary, no teeth, no claws. Generous margin, NO ground shadow.
- **Keepsake star** (row 4): a self-contained collectible star, centered,
  upright, with a thin rim. Vary the four point-counts/shapes so they read as a
  set worth collecting.

## KNOCKOUT (every sheet, every cell)

Flat magenta **#FF00FF** fills every cell background. NO magenta / hot-pink
inside the art. Each subject centered with margin, self-glow contained inside
its own cell, NO ground shadow. NO text, numbers, logos, watermarks. Compress
each cut cell under 150KB.

## Naming (so the cut + wire is deterministic)

For a sheet in style `<s>`, the 16 assets are, left-to-right, top-to-bottom:
`comet_<s>_a comet_<s>_b comet_<s>_c comet_<s>_d`,
`tail_<s>_a … tail_<s>_d`, `buddy_<s>_a … buddy_<s>_d`, `star_<s>_a … star_<s>_d`.

## Wire notes (for the cut pass, NOT the generator)

Cut to `satellites/seed-flutter/assets/cosmetics/<name>.png`. Comets append to
`SEEDS`, tails to `TRAILS`, buddies to `COMPS`, stars to the star roster —
pure-cosmetic, `col`/`puff` sampled per asset. Spread unlock thresholds across
the existing faucets (dist / grew / streak / gauntlet / perfects) so every
faucet keeps paying; exact numbers settled at wire time. KNOWN unlocks only —
no lootboxes. A themed collection can also unlock as a SET (own all 4 comets of
a style → its capstone star).

## Sheets in this pack (generate each separately — each is self-contained)

- `11-collection-pixel.md` — **Pixel Arcade** (8/16-bit pixel art)
- `12-collection-synthwave.md` — **Neon Synthwave** (glowing retro-80s neon)
- `13-collection-crayon.md` — **Crayon Kids** (wax-crayon hand-drawn)
- `14-collection-stainedglass.md` — **Stained Glass** (leaded glass — matches the chess Stained Glass court)
- `15-collection-claymation.md` — **Claymation** (soft plasticine)
- `16-collection-chrome.md` — **Chrome Holo** (metallic chrome + holographic foil)

Want another style? Copy any sheet, swap the STYLE line, keep the silhouette law.
Ideas on the bench: Embroidered Felt, Origami Fold (matches the chess Origami
court), Watercolor Wash, Comic Halftone, Woodblock Print, Gemstone/Crystal.
