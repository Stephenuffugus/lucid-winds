# Sheet 06 — Shop cosmetics catalog (swatches) + owned / equipped / locked frames

**DROP-IN wiring:** the Shop (`renderShop()`) builds one `.scard` per `SHOP` entry, each drawing
a 76×46 preview via `drawSwatch(cv,it)`: capsule sets show three rounded tone chips
(`drawPieceSwatch`), bottles show a tinted glass rect + rim + cork nub, grumps show one rose
face, backdrops show the gradient. Card states are CSS: `.scard.owned` (blue rim),
`.scard.sel` (gold "equipped" rim), `.scard.locked` (dimmed, for gated or unaffordable). Swap =
`drawImage` these swatch tiles into the `.scard` canvas, or use them as `background-image` card
art; the frame overlays wire as the CSS state classes. This is the **collectible presentation**
of the same items in sheets 01/02/03/05 — keep tone SHAPES on every capset chip (colorblind law)
and ids stable. Render at 2× (each cell shown ~76×46 to ~120×72), downscale.

**Catalog (matches `SHOP` ids + prices — see 00 for the full economy table).**

**PROMPT (copy-paste):**

Apothecary Fizz style: moonlit tonic-apothecary game art — hand-blown tinted glass, cork and
brass fittings, glowing gel-cap tonics, deep plum-indigo cellar shadows warmed by candle-gold
rim light, glossy but crisp game-asset silhouettes, no text, no watermark, flat FF00FF magenta
background for cutout. A sprite sheet, 5 rows x 4 columns, each cell 240x150 pixels on flat
magenta FF00FF, subjects centered, nothing touching cell edges.
Row 1, CAPSULE SET swatches — each a trio of three rounded tonic chips in a neat row bearing the
constant shapes DISC, TRIANGLE, DIAMOND left to right (colors change, shapes never): (1) TONIC
teal 46B3A6 / amber E0A13C / rose D76A86; (2) ORCHARD green 8FBF6A / gold E8B24A / berry C9607A;
(3) DUSK violet 7F7BD6 / orange E08A4A / blue 4AA0D0; (4) SLATE grey 8FA0B8 / silver C8CCD6 /
steel 5B6B86.
Row 2, (1) NEON capsule swatch — cyan 3FE0D0 / yellow FFD24A / pink FF6BA0 chips (keep the pink
muted, not hot magenta) with DISC / TRIANGLE / DIAMOND; then BOTTLE swatches, small tinted glass
tiles with a rim and a brass cork nub: (2) AMBER GLASS amber tint + gold C8A84B rim; (3) SEA
GLASS teal tint + teal 46B3A6 rim; (4) CUT CRYSTAL blue-white faceted + silver A8C0FF rim.
Row 3, (1) APOTHECARY bottle swatch, violet tint + violet 9A7BC0 rim; then GRUMP FAMILY busts, a
single rose grump face each: (2) CLASSIC plain scowl with moderate brows; (3) SOURPUSS heavy
angry V-brows; (4) FIZZLINGS browless bubbly worried eyes.
Row 4, BACKDROP thumbnails, small vertical gradient tiles: (1) CELLAR plum 16102A → 08060F; (2)
SUNSET maroon 3C1E2C → plum 100814; (3) TIDE teal 0A222C → abyss 061016; (4) AMBER ROOM amber
2C200E → brown 100A06.
Row 5, card FRAME treatments (empty centers for the swatch): (1) OWNED frame, dark glass tile
with a cool blue 5B9BD5 rim; (2) EQUIPPED frame, the same tile with a bright candle-gold C8A84B
glow rim and a small gold check; (3) LOCKED frame, a dimmed desaturated tile with a small brass
padlock centered; (4) a CAPS coin, a glossy crimped tonic bottle-cap in brass and cream, the
game's currency token. Every capset chip keeps its shape clearly readable. Even spacing, no text
anywhere.
