# Companion Family Assignments — DRAFT

Draft v0. Stephen to review, rename, reshape. Once locked → wire into code.

## Framework recap

- **8 families** (6 class-tied + 2 universal)
- **Time-only leveling** — L1 → L2 at 7 days equipped → L3 at 30 days equipped
- **Class affinity** = +25% base magnitude when class matches family
- **L3 unlocks a signature ability** per family

---

## Proposed assignments (44 companions)

### 🐝 POLLINATORS — Breeder + Tender STRONG
Flower-adjacent creatures. Base buff: +3% pollen yield.

| idx | Name | Rarity | Notes |
|---|---|---|---|
| 21 | Bee | Common | iconic |
| 24 | Butterfly | Common | already has driftPollen ability |
| 25 | Moth | Common | night-active pollinator |
| 28 | Hummingbird | Common | |
| 44 | Luna Moth | Rare | moonlit variant |
| 80 | Paper Butterfly | Common | delicate |

### 🐿 SCATTERERS — Forager STRONG
Resource foragers & collectors. Base buff: +3% feral range.

| idx | Name | Rarity | Notes |
|---|---|---|---|
| 35 | Raccoon | Common | already has scavenger ability |
| 55 | Mouse | Common | |
| 67 | Squirrel | Common | iconic gatherer |
| 64 | Scarab Beetle | Common | |
| 77 | Centipede | Common | |
| 40 | Platypus | Rare | |

### 🕷 WEAVERS — Breeder STRONG
Breeding / trait manipulation. Base buff: +3% chimera purity.

| idx | Name | Rarity | Notes |
|---|---|---|---|
| 37 | Garden Spider | Common | already has silkTrap (to finish) |
| 31 | Spider | Common | |
| 41 | Praying Mantis | Common | |
| 62 | Cricket | Common | song = mating |
| 65 | Ant Trail | Common | collective breeding |
| 70 | Seahorse | Common | unusual reproduction |

### 🦆 WAYFINDERS — Forager + Cartographer STRONG
Map / distance / biome. Base buff: +3% step XP.

| idx | Name | Rarity | Notes |
|---|---|---|---|
| 36 | Great Blue Heron | Common | already has precisionStrike (to finish) |
| 29 | Dragonfly | Common | wide wanderer |
| 51 | Robin | Common | migratory |
| 57 | Silly Goose | Common | V-formation traveler |
| 63 | Puffin | Common | coastal explorer |
| 49 | Origami Crane | Rare | |
| 66 | Red-Crowned Crane | Common | |
| 69 | Flamingo | Rare | |

### 🐢 GUARDIANS — Tender STRONG
Longevity / resist / revive. Base buff: +3% plant lifespan (stacks with Tender class bonus).

| idx | Name | Rarity | Notes |
|---|---|---|---|
| 32 | Toad | Common | already has rainCaller |
| 33 | Phoenix | Common | L3 = Phoenix Revive (already designed) |
| 22 | Pill Bug | Common | armored |
| 26 | Ladybug | Common | |
| 34 | Baby Mammoth | Common | already has permafrost (to finish) |
| 42 | Hedgehog | Common | |
| 45 | Porcupine | Common | already has shellShift |
| 53 | Turtle | Common | longevity archetype |
| 43 | Pangolin | Rare | |
| 48 | Scorpion | Rare | |
| 50 | Garden Gnome | Rare | literal garden guardian |
| 68 | Koala | Common | |
| 76 | Garden Snake | Common | |
| 81 | Panda | Common | |

### 🐸 DEW-DRINKERS — Cartographer STRONG
Economy / water / efficiency. Base buff: +3% dew yield.

| idx | Name | Rarity | Notes |
|---|---|---|---|
| 60 | Dart Frog | Common | |
| 71 | Koi Fish | Common | |
| 47 | Axolotl | Rare | |
| 27 | Snail | Common | slow steady |
| 46 | Glow Snail | Rare | |
| 72 | Jellyfish | Rare | |
| 30 | Caterpillar | Common | dew-eater |
| 52 | Worm | Common | soil hydration |

### 🍄 MYCELIUM — UNIVERSAL
Slow passive network buffs. Base buff: +3% EA floor. Slightly higher magnitudes to compensate for no class match.

| idx | Name | Rarity | Notes |
|---|---|---|---|
| 73 | Mushroom Sprite | Common | literal mycelium |
| 74 | Deer Fawn | Common | forest-walker |
| 61 | Rabbit | Common | burrowing |

### 🦉 WATCHERS — UNIVERSAL
Information / reveals / lore. Base buff: +3% Book of Secrets entry rate. Slightly higher magnitudes.

| idx | Name | Rarity | Notes |
|---|---|---|---|
| 23 | Firefly | Common | already has nightBloom |
| 38 | Beholder | Cosmic 0.39% | already has omnisight (to wire UI) |
| 39 | Cat | Common | classic observer |
| 54 | Bat | Common | sees in dark |
| 56 | Owl | Common | iconic wisdom |
| 75 | Raven | Rare | |
| 79 | Will-o-Wisp | Rare | |
| 20 | Navi | Common | guide |
| 78 | Crystal Beetle | Rare | mystical |

---

## Family counts

| Family | Count | Target | Notes |
|---|---|---|---|
| Pollinators | 6 | 4-6 ✓ | |
| Scatterers | 6 | 4-6 ✓ | |
| Weavers | 6 | 4-6 ✓ | |
| Wayfinders | 8 | 4-6 ⚠ | trim Origami Crane or Flamingo? |
| Guardians | 14 | 4-6 🔴 | too many — move some to other families |
| Dew-Drinkers | 8 | 4-6 ⚠ | trim Caterpillar (→ Mycelium?) |
| Mycelium | 3 | 4-6 ⚠ | too few — add more |
| Watchers | 9 | 4-6 ⚠ | trim Navi (→ Mycelium?) |

## Obvious rebalance suggestions

Guardians is overstuffed. Candidates to redistribute:
- **Koala** → Dew-Drinkers (eucalyptus moisture → dew)
- **Garden Snake** → Watchers (silent observer)
- **Panda** → Mycelium (bamboo forest mycelium)
- **Ladybug** → Pollinators (garden flowers)
- **Baby Mammoth** → Wayfinders (migratory)

After rebalance: Pollinators 7 / Scatterers 6 / Weavers 6 / Wayfinders 8 / Guardians 9 / Dew-Drinkers 9 / Mycelium 5 / Watchers 10. Still lumpy but closer.

---

## L3 signature abilities (one per family)

| Family | L3 signature | Who benefits |
|---|---|---|
| Pollinators | Twin Bloom (5% breed → 2 seeds) | Breeder/Tender |
| Scatterers | Dream Seed (free overnight feral) | Forager |
| Weavers | Chimera Mend (−1 EA penalty on chimera) | Breeder |
| Wayfinders | Pathfinder (compass reveals unvisited biome) | Forager/Cartographer |
| Guardians | Phoenix Revive (one-shot save) | Tender |
| Dew-Drinkers | Compost Song (+1 fertilizer tier) | Cartographer |
| Mycelium | Kin Network (+1 EA floor to family) | Universal |
| Watchers | Hidden Trait (reveal 1 DNA row) | Universal |

---

## Open questions for Stephen

1. **Family names** — keep or rename? "Dew-Drinkers" is a mouthful; maybe "Stream"? "Rivers"? "Conduits"?
2. **Rebalance** — OK to move Koala/Garden Snake/Panda/Ladybug/Baby Mammoth per above? Or just keep Guardians stuffed and call it "the popular family"?
3. **Companion name on card front** — should family be visible in the UI ("Koala · Guardian") or only in Book of Secrets?
4. **Rare companions** (Beholder, Pangolin, Flamingo, etc.) — should they get a *stronger* base magnitude (+5% instead of +3%) to reflect their scarcity? Or same as commons since discovery is the reward?
5. **Do the Trait Bank "None" slots (idx 0-19) need any treatment?** Currently ~60% of plants have no companion — that's untouched territory.

React and I'll clean this up into a final spec.
