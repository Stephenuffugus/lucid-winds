# Sunforge v2 — changes only

## Obsidian shards
The sun is trapped inside broken stone. Replace painted faces and center stamps with opaque charcoal iron-glass slabs, broad ash facets, and a molten fracture. Keep SUNFORGE / Sunbreaker branding, the steel shell, HUD, controls, typography, all existing plates except the added gesture plate, and other v1 assets.

## Cell and band language
- Use the authored 64 px face at full opacity. Do not multiply it into the board: occupied stone must remain visible.
- At a 26 CSS px cell, the vein has a broad colour shoulder and a bright center. Three large stone planes do the material work; no fine scratches or small badges.
- Never rotate a face. The broad top-left facet is the consistent light source. Rotate the side and corner weld overlays only.
- Adjacent cells of one ring share the fracture colour. Ordinary seams are quiet. Put a weld ONLY on an exposed boundary or a boundary against another ring. Avoid a bright box around every tile.
- Keep the 12 ring indices and old filenames. Ring 12 becomes cold slate; its legacy filename still says brass. These are art targets, not a runtime recolouring instruction.

| Ring | Heat colour | Target |
|---|---|---|
| 1 | Gold | #FFD84A |
| 2 | Violet | #B580FF |
| 3 | Cyan | #38E4E8 |
| 4 | Coral | #FF627C |
| 5 | Lime | #C7F35A |
| 6 | Blue | #6699FF |
| 7 | Orange | #FFAD50 |
| 8 | Ice | #D9E6F3 |
| 9 | Magenta | #E36BD8 |
| 10 | Emerald | #4DD5A0 |
| 11 | Periwinkle | #AAA6FF |
| 12 | Slate | #98ADBC |

## State hierarchy
Locked = fractured dark stone. Falling = intact cold silver. Resting = the same silver shape with orange heat at its joins. Interpolate the two falling frames gently during the existing half-second lock delay; reset to cold if the piece becomes airborne. Do not put the resting art on locked cells.

Ghost = open clipped corners, empty center, no opaque fill. Almost-ring = a small notch plus lit seam on that ring only. Keep it steady; no full-board white flash. Stick = short local spark, crush = stone moving inward, swallow = debris stretching into the void, SLAM = a square pressure outline.

## Integration and readability
The PNGs use straight RGBA with transparent exterior. Keep normal alpha blending and bilinear downsampling for these painted assets; avoid additive blending on stone faces. Additive blending is optional only for light overlays. Source sizes are for atlas sampling; gameplay geometry and hitboxes remain the developers' existing code.

Center-mark compatibility sheets are intentionally transparent. Colour is supported by ring position, fracture, boundaries, and active-piece material. This is not a complete colour-vision accessibility mode. Preserve existing accessible labels and any separate gameplay assist outside these sheets.

Core geometry and first three jaw states remain v1. Only spent is cooled to match the new stone. The legacy 256 px cut and the requested 128 px cut are both supplied. Motion and input logic are unchanged by this art handoff.
