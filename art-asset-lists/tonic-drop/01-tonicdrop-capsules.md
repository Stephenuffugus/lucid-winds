# Sheet 01 — Capsule halves (3 tones + ✦ wild) · loose vs linked · nub · swatch

**PATCH-REQUIRED wiring:** capsule halves render in `drawPiece(c,t,px,py,cell,isGrump,linkDir)`
— a rounded-square gel-cap body filled with the tone color, plus the tone SHAPE stamped by
`drawSym()` (disc/tri/dia/star) and a colored **connector nub** drawn toward the partner
(`linkDir` 1=up 2=right 3=down 4=left). To use sprites: load one body PNG per tone, `c.drawImage`
centered in the cell; keep the engine drawing the directional nub (it rotates per `linkDir`), or
use the standalone nub tab from column C. In-game cell is **44px** — render at 160px, downscale.
CRITICAL colorblind law: the SHAPE badge (disc/tri/dia/star) must be baked bold and centered on
every cap; wildcard is the gold ✦ star. Until patched, column A doubles as the "next" preview
art and column D is the Shop capsule-set swatch (`drawPieceSwatch`).

**Tone → shape → default (Tonic) color:** disc `#46b3a6` · triangle `#e0a13c` · diamond
`#d76a86` · wild ✦ star `#f3e18a`. (Other capsule sets recolor these SAME shapes — see sheet 06.)

**PROMPT (copy-paste):**

Apothecary Fizz style: moonlit tonic-apothecary game art — hand-blown tinted glass, cork and
brass fittings, little glowing gel-cap tonics, tinctures lit from within, deep plum-indigo
cellar shadows warmed by candle-gold rim light, glossy but crisp game-asset silhouettes readable
at 40 pixels, soft inner glow, no text, no watermark, flat FF00FF magenta background for cutout.
A sprite sheet, 4 rows x 4 columns, each cell 160x160 pixels on flat magenta FF00FF, one glossy
tonic gel-capsule half per cell, softly rounded square with a single top-left candle-gold
highlight, subjects centered, nothing touching cell edges.
Row 1, TEAL 46b3a6 tonic caps, each bearing a bold cream wax-seal DISC (a filled circle with a
tiny bright specular dot) centered: (A1) a LOOSE single cap, all four corners rounded; (B1) a
LINKED half with a flat join seam on its RIGHT edge where it meets its partner; (C1) a small
standalone glossy connector NUB tab in teal (a short rounded peg, reusable, engine rotates it);
(D1) a flat Shop SWATCH chip, the teal cap simplified to a clean rounded square with the disc.
Row 2, AMBER e0a13c tonic caps bearing a bold cream upward TRIANGLE seal: (A2) loose, (B2)
linked-seam-right, (C2) amber nub tab, (D2) swatch chip.
Row 3, ROSE d76a86 tonic caps bearing a bold cream DIAMOND seal (a square standing on its
point): (A3) loose, (B3) linked-seam-right, (C3) rose nub tab, (D3) swatch chip.
Row 4, the WILD half in radiant GOLD f3e18a bearing a bold five-point STAR seal, glowing
brighter than the others like a special tonic: (A4) loose, (B4) linked-seam-right, (C4) gold nub
tab, (D4) swatch chip. Every seal large, centered, high contrast against its cap. Even spacing,
no text anywhere.
