# Sheet 02 — Grumps (3 families × 3 tones) + popped face

**PATCH-REQUIRED wiring:** grumps render in the `isGrump` branch of `drawPiece()` — a rounder
tone-colored blob (corner radius `cell*0.34`) with two dark eyes, a frown arc, brows whose
weight comes from `GRUMPS[PROG.grump].brow` (classic=1, sourpuss=2, fizzlings=0), and the tone
SHAPE stamped small at the **top-left** so the grump's tone is colorblind-readable. To use
sprites: `c.drawImage` in the `isGrump` branch keyed by `PROG.grump` + tone `T[i]`. In-game cell
is **44px** — render at 160px, downscale. CRITICAL: bake the tone shape badge top-left
(disc/tri/dia) on EVERY grump; keep the face inside a rounded silhouette so it still reads as a
bottled tonic. Column D "popped" faces are the happy clear-moment art (optional FX use, and the
Shop grump swatch in `drawSwatch`). Faces recolor per capset like the caps do.

**Families:** `classic` (a plain cranky scowl, moderate brows) · `sourpuss` (heavy angry
V-brows, deep frown, the meanest) · `fizzlings` (no brows, big bubbly worried eyes, cutest).
**Tones (Tonic set):** disc teal `#46b3a6` · triangle amber `#e0a13c` · diamond rose `#d76a86`.

**PROMPT (copy-paste):**

Apothecary Fizz style: moonlit tonic-apothecary game art — hand-blown tinted glass, cork and
brass fittings, little glowing gel-cap tonics, tinctures lit from within, deep plum-indigo
cellar shadows warmed by candle-gold rim light, glossy but crisp game-asset silhouettes readable
at 40 pixels, soft inner glow, no text, no watermark, flat FF00FF magenta background for cutout.
A sprite sheet, 3 rows x 4 columns, each cell 160x160 pixels on flat magenta FF00FF, one grumpy
bottled-tonic face per cell inside a softly rounded blob, dark eyes and a frown, a small cream
tone-shape seal in the TOP-LEFT corner, subjects centered, nothing touching cell edges.
Row 1, the CLASSIC family, a plain cranky scowl with moderate straight brows: (A1) teal 46b3a6
grump with a top-left DISC seal; (B1) amber e0a13c grump with a top-left TRIANGLE seal; (C1)
rose d76a86 grump with a top-left DIAMOND seal; (D1) the same classic grump POPPED and relieved,
a happy open-mouth with sparkle eyes, teal, no seal needed.
Row 2, the SOURPUSS family, the meanest — heavy angry V-shaped brows, a deep down-turned frown,
narrowed eyes: (A2) teal with DISC seal, (B2) amber with TRIANGLE seal, (C2) rose with DIAMOND
seal, (D2) sourpuss POPPED into a surprised puff, amber.
Row 3, the FIZZLINGS family, the cutest — NO brows, big round bubbly worried eyes, a tiny
wobbly frown, a few soda bubbles clinging to the top: (A3) teal with DISC seal, (B3) amber with
TRIANGLE seal, (C3) rose with DIAMOND seal, (D3) fizzling POPPED into a giggling burst of tiny
bubbles, rose. Every tone-shape seal bold and clearly readable at the corner. Even spacing, no
text anywhere.
