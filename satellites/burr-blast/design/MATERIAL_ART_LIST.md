# BURR BLAST — Material Tile Art (optional, hand to ChatGPT)

*Burr Blast now has **9 building materials** you smash through. Every block is drawn on
canvas today (grain, mortar, facets, cracks — it already looks good), so **none of this is
required**. But each material now has a wired hook for a **seamless tile texture**: drop
`mat-<name>.png` into `satellites/burr-blast/assets/` and the game tiles it across every
block of that material (repeat-pattern, so it never stretches), keeping the damage cracks
and hit-flash on top. Paint any subset.*

---

## RULES (read once)
- **Seamless / tileable** square texture, **256×256** (it repeats across blocks of any size —
  a 40×40 cube and a 268×22 lintel both tile the same texture, so it MUST wrap edge-to-edge
  with no visible seam).
- **No magenta, no border, no text.** Fill the whole square.
- **Solid materials** (wood/stone/tnt/steel/brick/thatch) → opaque PNG.
- **See-through materials** (glass/ice/crystal) → **transparent PNG** (semi-opaque paint) so
  the dark fort behind still reads through them.
- Keep the palette matched to the colour listed so the painted tile blends with the block's
  edge outline the game still draws.
- Under 1600px, small KB. Hi-res, painterly, subtle — a texture, not a busy illustration.

## THE 9 TILES  ·  `assets/mat-<name>.png`
| file | material | look (match this colour/feel) |
|---|---|---|
| `mat-wood.png` | Wood | warm brown planks with soft grain, `#8a5a34` base, darker seams |
| `mat-stone.png` | Stone | grey granite, faint speckle + hairline mortar, `#6f7566` |
| `mat-brick.png` | Brick | red-brown fired brick, staggered courses + pale mortar lines, `#a24b38` |
| `mat-thatch.png` | Thatch | golden dry straw/reed bundles, `#b79448`, cozy |
| `mat-tnt.png` | Blastpod (TNT) | dark waxy crate `#2a2320` with a warning-red band `#c8482f` and a small ✸ seed motif |
| `mat-steel.png` | Steel | cold blue-grey brushed metal plate `#3b4148`, faint rivets, near-indestructible feel |
| `mat-glass.png` *(transparent)* | Dewglass | pale teal frosted glass, soft highlights, mostly see-through, edge `rgba(190,240,240,.85)` |
| `mat-ice.png` *(transparent)* | Frostpane | pale blue ice with frost fracture lines, slick, see-through, `rgba(228,246,255,.9)` |
| `mat-crystal.png` *(transparent)* | Gemstone | violet crystal with facet planes + inner sparkle, the "jackpot" block, `rgba(214,186,255,.92)` |

## SUGGESTED ORDER
Wood → Stone → Brick (the three you smash most), then TNT + Steel, then the three glassy
ones (transparent). Or skip them all — the canvas rendering already looks finished.

*Not sure it's worth it?* Honest take: the procedural materials look good as-is; painted tiles
are a nice-to-have that adds warmth, not a gap. Do them when you're in the mood.
