# Master Pollinator — Art Drop Manifest

110 unique artworks total:
- **40 common** (tier 1) — 8 per color × 5 colors
- **30 uncommon** (tier 2) — 6 per color × 5 colors
- **20 rare** (tier 3) — 4 per color × 5 colors
- **10 pollinators**

## Background recommendation

**White (or fully transparent PNG).** Card faces are cream paper with a subtle fractal-noise texture + warm drop shadow. Art on white blends seamlessly. Art on black would force dark card faces and we'd lose the warm paper feel.

Transparent is best — works on any future skin.

## File naming convention

Every filename = the card's `slug` + `.png`. Slugs are lowercase, hyphens between words, no apostrophes.

Drop files directly into `assets/games/masterpollinator/`. The game auto-picks them up — no code edits. Missing files fall back to a tier-icon emoji so the game is playable anytime.

---

## Tier 1 — Common (40)

### Green (leaves / stems / ferns)
- `fern.png` · Fern
- `clover.png` · Clover
- `ivy.png` · Ivy
- `wood-sorrel.png` · Wood Sorrel
- `ladys-mantle.png` · Lady's Mantle
- `moss-campion.png` · Moss Campion
- `plantain.png` · Plantain
- `sweet-woodruff.png` · Sweet Woodruff

### Rose (pink / red / warm)
- `wild-rose.png` · Wild Rose
- `cosmos.png` · Cosmos
- `bee-balm.png` · Bee Balm
- `wild-columbine.png` · Wild Columbine
- `pink-clover.png` · Pink Clover
- `dogwood.png` · Dogwood
- `lupine.png` · Lupine
- `pink-foxglove.png` · Pink Foxglove

### Blue (cool / violet)
- `bluebell.png` · Bluebell
- `cornflower.png` · Cornflower
- `forget-me-not.png` · Forget-Me-Not
- `morning-glory.png` · Morning Glory
- `blue-flax.png` · Blue Flax
- `chicory.png` · Chicory
- `lobelia.png` · Lobelia
- `borage.png` · Borage

### Amber (yellow / orange)
- `dandelion.png` · Dandelion
- `buttercup.png` · Buttercup
- `black-eyed-susan.png` · Black-Eyed Susan
- `marigold.png` · Marigold
- `goldenrod.png` · Goldenrod
- `calendula.png` · Calendula
- `yarrow.png` · Yarrow
- `wild-sunflower.png` · Wild Sunflower

### Spore (white / neutral)
- `daisy.png` · Daisy
- `lily-of-valley.png` · Lily of the Valley
- `babys-breath.png` · Baby's Breath
- `queen-annes-lace.png` · Queen Anne's Lace
- `snowdrop.png` · Snowdrop
- `alyssum.png` · Sweet Alyssum
- `elderflower.png` · Elderflower
- `white-clover.png` · White Clover

---

## Tier 2 — Uncommon (30)

### Green
- `hosta.png`, `hellebore.png`, `coleus.png`, `lady-fern.png`, `maidenhair-fern.png`, `boxwood.png`

### Rose
- `peony.png`, `camellia.png`, `hydrangea-pink.png`, `tea-rose.png`, `hibiscus.png`, `bleeding-heart.png`

### Blue
- `delphinium.png`, `iris.png`, `hydrangea-blue.png`, `larkspur.png`, `gentian.png`, `periwinkle.png`

### Amber
- `zinnia.png`, `chrysanthemum.png`, `gerbera.png`, `tiger-lily.png`, `nasturtium.png`, `gazania.png`

### Spore
- `gardenia.png`, `jasmine.png`, `calla-lily.png`, `magnolia.png`, `stephanotis.png`, `angels-trumpet.png`

---

## Tier 3 — Rare (20)

### Green
- `corpse-flower.png`, `dragon-arum.png`, `ghost-fern.png`, `black-bat-flower.png`

### Rose
- `chocolate-cosmos.png`, `parrot-flower.png`, `bat-face-cuphea.png`, `rafflesia.png`

### Blue
- `blue-poppy.png`, `meconopsis.png`, `sea-holly.png`, `ghost-orchid.png`

### Amber
- `saffron-crocus.png`, `middlemist.png`, `gold-medal-rose.png`, `kadupul.png`

### Spore
- `youtan-poluo.png`, `jade-vine.png`, `ghost-plant.png`, `franklin-tree.png`

---

## Pollinators (10)

- `pollinator-monarch.png` · Monarch
- `pollinator-honeybee.png` · Honeybee
- `pollinator-hummingbird.png` · Hummingbird
- `pollinator-luna-moth.png` · Luna Moth
- `pollinator-bumblebee.png` · Bumblebee
- `pollinator-dragonfly.png` · Dragonfly
- `pollinator-firefly.png` · Firefly
- `pollinator-sphinx-moth.png` · Sphinx Moth
- `pollinator-scarab.png` · Scarab
- `pollinator-orchid-bee.png` · Orchid Bee

---

## Swapping flowers

Flower names and slugs above are placeholders Claude picked to get a playable catalog. Stephen will send his own 100 flowers + which tier each belongs to. When that list arrives:

1. The `CATALOG` object in `games/pollen.js` gets slug/name swapped row-by-row.
2. Costs stay on the same row (already balanced to mirror Splendor).
3. Jessie paints against the new slug list from this manifest.

---

## Source resolution

Keep PNGs at the resolution Midjourney/Photoshop produces them (1024+). No downscaling. Browser handles display scaling. Transparent PNG strongly preferred so the card's cream paper and warm shadow still read underneath the art edges.
