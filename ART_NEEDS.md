# Lucid Winds — Art Needs (flat copy-paste list)

Everything code is ready to accept. Drop files at the paths, they auto-appear.
Source resolution, never resize. Most slots are optional — code falls back cleanly when art is absent.

## STARTED / IN PROGRESS
- [ ] 13 mutation badge PNGs → `assets/mutations/mutation-{slug}.png` (96×96 transparent)
  - glitch, glass-stem, wireframe, holographic, neon, ink-wash, golden, porcelain, bioluminescent, pixel-art, silhouette, albino, fossil

## READY TO START (P1)
- [ ] Wild map hero banner → `assets/wild/wild-banner.png` (~1080×360 landscape, painterly world-at-your-feet composition, fits above the map)
- [ ] Biome scanner skin → `assets/wild/biome-scanner.png` (96×96, compass-rose / reticle motif, replaces the 🏡 + "scanning" placeholder in the top-right stat cell)
- [ ] 4 weather cast plates → `assets/weather/weather-{sun,rain,wind,calm}.png` (128×128)
- [ ] 2 Reader corner flourishes → `assets/ui/reader-flourish-{tl,tr}.png` (128×128 gold Celtic leaf, transparent)

## ITEMS + COCOONS + HUNT (new systems shipped Apr 15-16)

### 17 Item PNGs → `assets/items/{slug}.png`
Format: 256×256 transparent, painterly, midnight-greenhouse palette. Filename matches code slug — drops in and wires automatically.

| Item | Slug | Rarity | Motif |
|---|---|---|---|
| Forager's Lens | foragers-lens | Common | dew drop held in petal, lens gleam |
| Compass Shard | compass-shard | Uncommon | broken compass needle, metallic glint |
| Tether Moss | tether-moss | Rare | hair-fine green threads, rooting fibers |
| Diviner's Glass | diviners-glass | Epic | quartz lens refracting light spectrum |
| Mulch Ward | mulch-ward | Rare | dense decaying leaves, protective mat |
| Bramble Thicket | bramble-thicket | Rare | thorn-woven wall, layered shadow |
| Shellgourd | shellgourd | Epic | hard ceramic gourd, pearlescent gloss |
| Moonwake | moonwake | Uncommon | silver-blue sprig, night-opening petals |
| Forager's Torch | foragers-torch | Rare | torchwood soaked in resin, warm glow |
| Dust Storm | dust-storm | Rare | ground quartz + pollen cloud, swirl |
| Uproot Charm | uproot-charm | Uncommon | braided knot, vine memory |
| Scrying Stone | scrying-stone | Uncommon | polished dark stone, mirror surface |
| Raven's Eye | ravens-eye | Rare | feathered orb, dark iridescent sheen |
| Slow Arrow | slow-arrow | Rare | arrow fletched with moss |
| Whisper Vine | whisper-vine | Common | creeping tendril, alert posture |
| Wanderer's Map | wanderers-map | Epic | parchment map, torn edges, windswept |
| Delegate Token | delegate-token | Epic | coin with clasped vines |

Rarity color reference: Common #8a9178, Uncommon #7ab356, Rare #c8a84b, Epic #c07ac8, Legendary #ff8ab0.

### 4 Cocoon PNGs → `assets/cocoons/cocoon-{slug}.png`
512×512 transparent, same painterly vibe. Each tier is a chrysalis shape, not a seed — visually distinct from nursery art.

| Tier | Slug | Distance | Visual |
|---|---|---|---|
| Gossamer | gossamer | 1 km | pale silk wisp, almost weightless |
| Linen | linen | 2.5 km | tan woven cocoon, tightly spun |
| Amber | amber | 5 km | gold-flecked pod, warm glow |
| Obsidian | obsidian | 10 km | black iridescent shell |

### Optional polish
- [ ] Wind-decides leaf → `assets/items/wind-decides-leaf.png` (128×128) — replaces 🍃 emoji in Wanderer's Map cinematic
- [ ] Mystery box closed art → `assets/boxes/box-closed.png` (128×128) — if we want a per-rarity variant pass, add box-common / box-rare / etc.
- [ ] Firefly sprite → `assets/hunt/firefly.png` (64×64) — currently a radial-gradient div; PNG with faint wing motion blur would sell it

## OPTIONAL TRAIT ART (auto-loads to Reader pages)
Drop any of these and that trait's Reader page gets a hero. Skip ones you don't want — no requirement. 256×256 transparent PNG preferred.

**Pots** → `assets/pots/pot-{slug}.png` (60 trait pages exist)
Priority-order suggestions: golden, amphora, terrarium, hexagonal, cauldron, world-seed-cradle, moonstone-urn, philosopher-s-vessel

**Auras** → `assets/auras/aura-{slug}.png` (36 trait pages)
Priority: aurora-borealis, seed-of-life, shooting-star, void-eclipse, ethereal-veil, chain-lightning, stained-glass-light

**Substrates** → `assets/substrates/substrate-{slug}.png` (71 trait pages)
Priority: stardust, phoenix-ash, void-essence, moonstone-dust, dragon-bone-ash, meteorite, obsidian, mycelium

**Leaves** → `assets/leaves/leaf-{slug}.png` (71 trait pages)
Priority: crystal-shard, ember-leaf, feather-frond, void-petal, wishbone, lantern-pod

**Flowers** → `assets/flowers/flower-{slug}.png` (71 trait pages)
Priority: void-gate, holographic-prism, stardust-crown, aurora-veil, moonlit-lotus, dragon-arum

**Stems** → `assets/stems/stem-{slug}.png` (24 trait pages)
Priority: crystal-spine, iron-trunk, ancient-bark, hollow-trunk

**Companions** → `assets/companions/companion-{slug}.png` (62 trait pages)
Already have Cicada v1 placeholder. Priority mythic+: toad, cicada, baby-mammoth, raccoon, great-blue-heron, garden-spider, the-beholder

## DEFERRED (dedicated session)
- [ ] SVG art audit — companions, leaves, flowers, stems (Stephen's own pass)
- [ ] 62 companion "real photo" portraits for Book of Secrets → `assets/companions/real/{name}.png`
- [ ] Repello board + pieces — waiting on board close-ups + color→number map
- [ ] Pot Shop visual refresh — 8 current pots need hero art
- [ ] Herbarium bundle covers (12) → `assets/herbarium/bundle-{idx}.png`
- [ ] Celebration FX sprites (sparkle, petal, leaf, ring) → `assets/celebrations/{element}-sprite.png`

## SHIPPED (don't regenerate)
- 10 biome paintings (wild-biomes/)
- 5 keeper milestone hero cards (hero-cards/)
- Book of Secrets spellbook cover (bos/)
- 5 class emblems (character-sheet/classes/)
- 6 event scroll sigils (bos/scroll-{keeper,tender,forager,breeder,cartographer,listeners}.png)
- 9 foraging element cards (foraging/el-{sun,shade,rain,dry,wind,still,moonlight,thunder,aurora}.png)
- 15 FLUX tab backgrounds + onboarding beats
- 21-card Trios deck + card backs

---

**Aesthetic anchor for everything:** midnight-greenhouse palette — deep black #0d100c, sage green #7ab356, warm gold #c8a84b, cream #e8dcc8. Painterly, no text in art, transparent or near-black background unless otherwise noted.
