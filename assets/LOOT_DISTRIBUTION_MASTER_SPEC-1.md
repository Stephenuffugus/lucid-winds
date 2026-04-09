 # LUCID WINDS — LOOT DISTRIBUTION MASTER SPEC
## All 8 Layers Classified. Scoring Model. Probability Math.
## Loot Generation Master Team | March 24, 2026

---

## LAYER OVERVIEW

| Layer | Current | Target | Hash Source | Modulo Change |
|-------|---------|--------|-------------|---------------|
| Pots | 30 | 60 | `hb(0) % 30` → `% 60` | Yes |
| Stems | 15 | 32 | `hc(2)` → `hb(2) % 32` | Yes |
| Leaves | 60 | 120 | `hb(4) % 60` → `% 120` | Yes |
| Blooms | 46 | 90 | `hb(11) % 46` → `% 90` | Yes |
| Companions | 38 rendered / 60 slots | 60 rendered / 120 slots | `hb(21) % 60` → `% 120` | Yes |
| Auras | 16 active / 21 slots | 26 active / 40 slots | `hb(15) % 21` → `% 40` | Yes |
| Substrates | 23 active / 30 slots | 54 active / 60 slots | `hb(20) % 30` → `% 60` | Yes |
| Mutations | 4 types | 8 types | `hb(16)` threshold | Ranges shift |

**Bloom presence gate:** `hc(10) > 4` → 68.75% of plants have flowers
**Mythic creature gate:** `hb(18) >= 0xD0` → 18.75% of plants have mythic companions (overrides base companion)

---

## TIER CLASSIFICATION — ALL 8 LAYERS

### Scoring principle (Director approved):
- Rarity tiers classify WHAT a trait IS (identity/collectibility)
- ONLY certain tiers contribute to getTerraGrade scoring (detailed in Scoring Model below)
- Size affects EA only, never Terra Grade
- Same hash = same traits. Only the SCORE changes with the new model.

---

### LAYER 1: POTS (30 current → 60 target)
*Full manifest in LAYER_1_POTS_MANIFEST.md — approved.*

| Tier | Current Cases | Count |
|------|--------------|-------|
| Common | 0,1,2,3,8,9,10,17,19,29 | 10 |
| Uncommon | 4,5,6,11,12,13,14,16,18,20,24,25,26 | 13 |
| Rare | 7,21,22,23,27,28 | 6 |
| Epic | — | 0 |
| Legendary | 15 (Golden Pot) | 1 |
| Mythic | — | 0 |

**After expansion (60):** Common 27, Uncommon 15, Rare 8, Epic 5, Legendary 2, Mythic 1, Reserved 2

**Current scoring probability (Rare+ hit):**
- Rare pots: 6/30 = 20.0%
- Legendary: ~9.4% (hc(0)==15 override + natural)
- Combined Rare+: ~27%
- After expansion: Rare 8/60=13.3%, Epic 5/60=8.3%, Leg 2/60=3.3%, Myth 1/60=1.7%

---

### LAYER 2: STEMS (15 current → 32 target)
*Full manifest in LAYER_2_STEMS_MANIFEST.md — approved.*

| Tier | Current Cases | Count |
|------|--------------|-------|
| Common | 0,1,2,3 | 4 |
| Uncommon | 4,6,7,10,13 | 5 |
| Rare | 5,8,9,11 | 4 |
| Epic | 12,14 | 2 |
| Legendary | — | 0 |
| Mythic | — | 0 |

**After expansion (32):** Common 14, Uncommon 8, Rare 5, Epic 3, Legendary 1, Mythic 1

**Current scoring probability:**
- With hc(2) (0-15): Epic stems (12,14) = 2/15 = 13.3% (case 15 wraps to 0)
- After expansion with hb(2)%32: Epic 3/32=9.4%, Leg 1/32=3.1%, Myth 1/32=3.1%

---

### LAYER 3: LEAVES (60 current → 120 target)

| Tier | Cases | Count | % |
|------|-------|-------|---|
| Common | 0-9 (core botanicals) | 10 | 16.7% |
| Uncommon | 10-29 (articulated + expansion botanicals) | 20 | 33.3% |
| Rare | 30-39 (fantasy set 1), 55-59 (upper exotics) | 15 | 25.0% |
| Epic | 40-49 (fantasy set 2: Hookvine→Watcher) | 10 | 16.7% |
| Rare/Uncommon | 50-54 (basic exotics: Stamen Burst→Bonsai Pad) | 5 | 8.3% |
| Legendary | — | 0 | 0% |
| Mythic | — | 0 | 0% |

**Reclassification of cases 50-59 (needed for clean tiers):**

| Case | Name | Tier |
|------|------|------|
| 50 | Watcher Frond | Rare (complex multi-segment eye motif) |
| 51 | Stamen Burst | Uncommon (cluster pattern) |
| 52 | Compound Pinnate | Uncommon (multi-leaflet, botanical) |
| 53 | Tendril Coil | Rare (spiral physics, distinctive form) |
| 54 | Bonsai Pad | Uncommon (simple flat pad) |
| 55 | Scale Leaf | Rare (overlapping scales, reptilian feel) |
| 56 | Grass Blade | Common (it's grass) |
| 57 | Venus Trap | Rare (carnivorous, distinctive jaw shape) |
| 58 | Strap Leaf | Uncommon (simple elongated form) |
| 59 | Lace Fern | Rare (delicate fractal pattern) |

**Final current classification (60 leaves):**

| Tier | Count | Cases |
|------|-------|-------|
| Common | 11 | 0-9, 56 |
| Uncommon | 24 | 10-29, 51, 52, 54, 58 |
| Rare | 19 | 30-39, 50, 53, 55, 57, 59 |
| Epic | 10 | 40-49 |
| Legendary | 0 | — |
| Mythic | 0 | — |

**After expansion target (120):** Common 54, Uncommon 30, Rare 18, Epic 12, Legendary 4, Mythic 2

**Current scoring probability (Epic+ hit, which is what scores in Model H):**
- Epic leaves (cases 40-49): 10/60 = 16.7%
- After expansion: Epic 12/120=10%, Leg 4/120=3.3%, Myth 2/120=1.7%

---

### LAYER 4: BLOOMS (46 current → 90 target)
*68.75% of plants have flowers (hc(10) > 4)*

| Tier | Cases | Count |
|------|-------|-------|
| Common | 0-9 (Bud, Rose, Hibiscus, Lotus, Dahlia, Tulip, Spike, Mandala, +2 aliases) | 10 |
| Uncommon | 10-11, 13-14, 16-17, 29-33 (Orchid, Rose+, Pitcher, Cattails, Chrysanth, cluster group) | 12 |
| Rare | 18-28 (Moon Orchid, Poppy, Dandelion Puff, Bird of Paradise, Fire Flower, Protea, Morning Glory, Cherry Blossom, Coneflower, Snapdragon, Bleeding Heart) | 11 |
| Epic | 34-45 (Pitcher Bloom, Dragon Arum, Titan Arum, Carrion Starfish, Passionflower, Heliconia, Plumeria, Foxglove, Magnolia, Wisteria, Cactus Bloom, Ghost Orchid) | 12 |
| Legendary | 15 (Glow Flower — bell/lily with luminous effect) | 1 |
| Mythic | — | 0 |

**Note on case 12 (Carnivorous Flytrap):** In the code, case 12 is defined AFTER cases 13-17, breaking switch ordering. Classifying as Uncommon (carnivorous plants are interesting but flytraps are well-known).

**After expansion target (90):** Common 40, Uncommon 23, Rare 14, Epic 9, Legendary 3, Mythic 1

**Current scoring probability (Epic+ hit, when flower present):**
- Epic blooms (34-45): 12/46 = 26.1% of flowering plants
- Conditioned on having a flower: 0.6875 × 26.1% = 17.9% of ALL plants
- Legendary (case 15): 1/46 = 2.2% of flowering → 1.5% of all
- After expansion: Epic 9/90=10%, Leg 3/90=3.3%, Myth 1/90=1.1%

---

### LAYER 5: COMPANIONS (38 rendered / 60 slots → 60 rendered / 120 slots)
*Mythic creatures (hb(18) >= 0xD0) override base companion*
*Base companion: hb(21) % 60, where cases 0-19 = None*

**Base companions (non-mythic path, hb(18) < 0xD0 = 81.25% of plants):**

| Tier | Cases | Count |
|------|-------|-------|
| None | 0-19 | 20 slots (33.3%) |
| Common | 20(Droplet), 21(Bee), 22(Pollen), 23(Firefly), 24(Butterfly), 25(Moth), 26(Ladybug), 27(Snail), 30(Caterpillar), 31(Spider), 51(Robin), 52(Worm), 53(Turtle), 55(Mouse) | 14 (23.3%) |
| Uncommon | 28(Hummingbird), 29(Dragonfly), 39(Kitty), 41(Mantis), 42(Hedgehog), 45(Hermit Crab), 54(Bat), 56(Owl), 57(Silly Goose) | 9 (15%) |
| Rare | 40(Platypus), 43(Pangolin), 44(Luna Moth), 46(Glow Snail), 47(Axolotl), 48(Scorpion) | 6 (10%) |
| Epic | 49(Origami Crane), 50(Garden Gnome) | 2 (3.3%) |
| Base-path mythic renders | 32-38 | 7 (11.7%) → score as Epic (visual only) |
| Unmapped | 58-59 | 2 (3.3%) → None |

**Effective base companion hit rate (non-mythic path):**
- Has ANY companion: 38/60 = 63.3% via base path
- But 81.25% reach base path, so: 0.8125 × 0.633 = 51.5% have base companion
- Rare+ base companion: 8/60 = 13.3% of base path → 0.8125 × 0.133 = 10.8% of all plants

**Mythic companions (scored separately by mythic byte):**

| Byte Range | Creature | Rate | Proposed Terra Score |
|------------|----------|------|---------------------|
| 0xD0-0xDF | The Toad | 6.25% | +4 |
| 0xE0-0xF3 | The Capybara | 7.81% | +4 |
| 0xF4-0xF7 | Bioluminescent Pulse | 1.56% | +5 |
| 0xF8-0xFB | Ancient Rune Field | 1.56% | +5 |
| 0xFC-0xFD | Storm Wraith | 0.78% | +6 |
| 0xFE | Starfall | 0.39% | +7 |
| 0xFF | The Beholder | 0.39% | +8 |

**After expansion (120 slots, 60 rendered, 60 None):** better distribution across tiers possible.

---

### LAYER 6: AURAS (16 active / 21 slots → 26 active / 40 slots)

| Tier | Cases | Count |
|------|-------|-------|
| None | 0-4 | 5 slots (23.8%) |
| Common | 14(Halo), 16(Shimmer) | 2 (9.5%) |
| Uncommon | 5(Aurora Borealis), 6(Golden Hour), 7(Moonlit), 8(Starfall), 10(Sun), 12(Moon) | 6 (28.6%) |
| Rare | 9(Seed of Life), 11(Arch), 13(Rings), 15(Vortex) | 4 (19.0%) |
| Epic | 17(Spider Web), 18(Poison Miasma), 19(Frost Crystal), 20(Ember Glow) | 4 (19.0%) |
| Legendary | — | 0 |
| Mythic | — | 0 |

**Current scoring probability (Epic aura, which scores in Model H):**
- Epic auras (17-20): 4/21 = 19.0%
- After expansion target (40 slots): Epic stays 4-6/40 = 10-15%

---

### LAYER 7: SUBSTRATES (23 active / 30 slots → 54 active / 60 slots)

| Tier | Cases | Count |
|------|-------|-------|
| None | 0-6 | 7 slots (23.3%) |
| Common | 8(Perlite), 9(Living Moss), 11(Desert Sand), 12(Coconut Coir), 13(Clay), 14(River Stone), 19(Worm Castings), 20(Bone Meal), 21(Bat Guano*), 23(Charcoal*), 24(Sphagnum*), 25(Pumice), 26(Zeolite*), 27(Glacial Till*) | 14 (46.7%) |
| Uncommon | 7(Hydroponic), 10(Volcanic Rock), 18(Mushroom Compost), 22(Dihydrogen Oxide) | 4 (13.3%) |
| Rare | 16(Sulfuric Acid), 17(Obsidian Bed), 29(Mycelium Network) | 3 (10%) |
| Legendary | 15(Crystal Matrix), 28(Meteorite Dust) | 2 (6.7%) |

*Cases marked with * are currently invisible (render nothing). Director mandates: every substrate renders something after expansion.*

**Current scoring probability (Rare+ substrate, from Model H — best-of with pot):**
- Legendary substrates (15,28): 2/30 = 6.7%
- Rare + Legendary: 5/30 = 16.7%
- Vessel slot takes MAX(pot score, substrate score)

---

### LAYER 8: MUTATIONS (`hb(16)` threshold)

| Hex Range | Mutation | Rate | Terra Score |
|-----------|----------|------|-------------|
| 0x00-0xCF | None | 81.25% | +0 |
| 0xD0-0xDF | Wireframe | 6.25% | +1 |
| 0xE0-0xEF | Glass Stem | 6.25% | +2 |
| 0xF0-0xFF | Glitch | 6.25% | +3 |

**After expansion (8 mutations, Director-approved ranges from Trait Layer Audit):**

| Hex Range | Mutation | Rate | Terra Score |
|-----------|----------|------|-------------|
| 0x00-0xBF | None | 75.0% | +0 |
| 0xC0-0xCF | Mosaic | 6.25% | +1 |
| 0xD0-0xD9 | Wireframe | 3.9% | +1 |
| 0xDA-0xE3 | Albino | 3.9% | +2 |
| 0xE4-0xED | Glass Stem | 3.9% | +2 |
| 0xEE-0xF5 | Gigantism | 3.1% | +3 |
| 0xF6-0xFC | Glitch | 2.7% | +3 |
| 0xFD-0xFF | Fossil | 1.2% | +4 |

**Total mutation rate:** 25% (up from 18.75%). 1 in 4 plants mutated. Director to confirm this feels right.

---

## THE SCORING MODEL (Model H — Simulation Verified)

### Architecture: 5 Slots + 2 Spikes

The scoring engine collapses 7 base layers into 5 scoring SLOTS using "best-of" pairing. This prevents coin-flip stacking (where 7 independent ~20% chances produce too many 3+ hits).

| Slot | Layers Combined | What Scores | Max |
|------|----------------|-------------|-----|
| 1. Vessel | Pot + Substrate | Best of (pot rarity score, substrate rarity score) | +2 |
| 2. Foliage | Stem + Leaf | Best of (stem rarity score, leaf rarity score) | +1 |
| 3. Bloom | Bloom alone | Epic+ bloom only (when flower present) | +2 |
| 4. Aura | Aura alone | Epic aura only | +1 |
| 5. Companion | Companion (base) | Rare+ base creature (non-mythic path only) | +1 |
| **Spike: Mutation** | Mutation alone | Per-mutation score table | +3 (current), +4 (after expansion) |
| **Spike: Mythic** | Mythic byte | Per-creature score table | +4 to +8 |

### Per-Slot Scoring Detail

**SLOT 1 — VESSEL (best of pot, substrate):**
```
Pot scoring:
  Rare pots (7,21-23,27,28): +1
  Golden Pot (15): +2
  Epic pots (after expansion, 51-55): +1
  Legendary pots (15, 56): +2
  Mythic pot (57): +2

Substrate scoring:
  Rare (16,17,29): +1
  Legendary (15,28): +1

Score = MAX(pot score, substrate score)
```

**SLOT 2 — FOLIAGE (best of stem, leaf):**
```
Stem scoring:
  Epic stems (12,14; after expansion also 29): +1
  Legendary (30): +1
  Mythic (31): +1

Leaf scoring:
  Epic leaves (40-49): +1
  Legendary (after expansion): +1
  Mythic (after expansion): +1

Score = MAX(stem score, leaf score)
```

**SLOT 3 — BLOOM:**
```
  Epic blooms (34-45): +1
  Legendary bloom — Glow Flower (15): +2
  Mythic bloom (after expansion): +2
  Score = 0 if no flower (31.25% of plants)
```

**SLOT 4 — AURA:**
```
  Epic auras (17-20): +1
  Legendary (after expansion): +1
  Score = 0 if no aura (cases 0-4, ~24%)
```

**SLOT 5 — COMPANION (base path only):**
```
  Rare companions (40,43,44,46,47,48): +1
  Epic companions (49,50): +1
  ONLY when mythic byte < 0xD0 (81.25% of plants)
  Score = 0 if no companion or mythic override active
```

### Tier Thresholds

| Tier | Score | Color | Target % |
|------|-------|-------|----------|
| Common | 0-1 | #959588 | ~42% |
| Uncommon | 2-3 | #8CB86E | ~28% |
| Rare | 4-5 | #5b8fb9 | ~16% |
| Epic | 6-7 | #9B59B6 | ~9% |
| Legendary | 8-9 | #C8A84B | ~3.5% |
| Mythic | 10-11 | #A87285 | ~1.2% |
| Cosmic | 12+ | #D94FFF | ~0.3% |

---

## PROBABILITY MATH — CURRENT TRAITS (Pre-Expansion)

### Per-slot hit rates with CURRENT trait counts:

**Slot 1 (Vessel):** 
- Pot Rare+ (gives +1 or +2): cases 7,15,21-23,27-28 = 7/30 + hc(0)==15 override
- Effective: ~27% of plants hit Rare+ pot
- Substrate Rare+: cases 15,16,17,28,29 = 5/30 = 16.7%
- Best-of probability: P(at least one hits) = 1 - (0.73 × 0.833) = 1 - 0.608 = **39.2%**
- But most hits are +1 (Rare), only Golden Pot gives +2

**Slot 2 (Foliage):**
- Stem Epic+ (gives +1): cases 12,14 = 2/15 = 13.3%
- Leaf Epic+ (gives +1): cases 40-49 = 10/60 = 16.7%
- Best-of: 1 - (0.867 × 0.833) = 1 - 0.722 = **27.8%**
- Max +1 from this slot

**Slot 3 (Bloom):**
- Has flower: 68.75%
- Epic+ bloom given flower: (12 + 1)/46 = 28.3%
- Combined: 0.6875 × 0.283 = **19.4%** → most give +1, Glow Flower gives +2 at 1.5%

**Slot 4 (Aura):**
- Epic aura: 4/21 = **19.0%**
- Gives +1

**Slot 5 (Companion base):**
- On base path (81.25%) AND Rare+ creature: 8/60 = 13.3%
- Combined: 0.8125 × 0.133 = **10.8%**
- Gives +1

**Mutation spike:**
- Any mutation: **18.75%**
- Wireframe +1: 6.25%, Glass +2: 6.25%, Glitch +3: 6.25%
- Expected contribution: 0.0625×1 + 0.0625×2 + 0.0625×3 = 0.375

**Mythic spike:**
- Any mythic: **18.75%**
- Toad/Capy +4: 14.06%, Biolum/Rune +5: 3.12%, Storm +6: 0.78%, Star +7: 0.39%, Beholder +8: 0.39%
- Expected contribution: 0.1406×4 + 0.0312×5 + 0.0078×6 + 0.0039×7 + 0.0039×8 = 0.838

### Expected score distribution (analytical):

**Base slots expected value:**
- Slot 1: 0.392 × 1.05 (weighted avg of +1 and +2) ≈ 0.41
- Slot 2: 0.278 × 1.0 = 0.28
- Slot 3: 0.194 × 1.08 ≈ 0.21
- Slot 4: 0.190 × 1.0 = 0.19
- Slot 5: 0.108 × 1.0 = 0.11
- **Base total: ~1.20**

**Spike expected value:**
- Mutation: 0.375
- Mythic: 0.838
- **Spike total: ~1.21**

**Overall expected score: ~2.41**

This is close to the Model H simulation mean of 2.49 — good confirmation.

### "Almost" effect check:
With 5 base slots each at 10-39% hit rate, the probability of ZERO hits across all 5:
- P(all miss) = (1-0.392) × (1-0.278) × (1-0.194) × (1-0.190) × (1-0.108)
- = 0.608 × 0.722 × 0.806 × 0.810 × 0.892
- = **0.256 = 25.6%**

So 74.4% of plants score at least +1 from base traits alone. Add mutation (18.75%) and mythic (18.75%), and the probability of a COMPLETELY blank plant (score 0, zero interesting traits) is approximately:
- P(0 from everything) = 0.256 × 0.8125 × 0.8125 = **16.9%**

That's ~17% pure Common (score 0). But score 1 also falls in Common tier (threshold is 0-1). Plants scoring exactly 1 come from a single slot hitting. The combined Common rate should be ~42%, matching target.

---

## POST-EXPANSION PROJECTIONS

After all 8 layers hit their targets, the scoring landscape shifts:

| Change | Effect on Distribution |
|--------|----------------------|
| More Epic/Leg/Myth traits in every layer | Base slot hit rates increase by ~5-8% each |
| 8 mutations (25% total vs 18.75%) | More plants get +1 to +4 from mutation |
| Synergy bonuses (+1 to +3) | New scoring path for trait combos |
| Breed layers (+1 to +7) | Multi-generation breeding creates high-score path |
| Compost layers (+1 to +9) | Composting chain creates high-score path |

**Projected post-expansion targets:**
- Base scoring fills Common/Uncommon/Rare naturally
- Mutations and mythics fill Epic/Legendary
- Breed + compost + synergies fill Mythic/Cosmic
- The tier thresholds (0,2,4,6,8,10,12) should HOLD without adjustment

**If the expansion makes Uncommon too generous:** the fix is to REMOVE trait cases from scoring (tighten the Epic+ threshold), NOT to change thresholds. The traits are the tuning knobs.

---

## DIRECTOR SIZE RULES (integrated)

Per Director directive, size is scored in `computeEA` only:

```
Flower size 7-8: +1 EA    |  Flower size 4: -1 EA
Leaf size 9-10: +1 EA     
Stem height 50+: +1 EA    |  Stem height <30: -1 EA
```

Size is NOT included in any getTerraGrade calculation.

Minimum render sizes (render clamp, data unchanged):
- Bloom: min 6px rendered
- Leaf: min 7px rendered
- Companion: min 8px at card view

---

## WHAT HAPPENS NEXT

1. **Director's art teams** build the expanded trait art for all 8 layers
2. **This team** monitors tier counts as cases are wired in
3. **After each layer ships:** re-run Monte Carlo with actual case numbers
4. **After ALL layers ship:** final Monte Carlo, verify distribution, adjust tier assignments if needed
5. **Scoring engine code change** is the LAST step — only after all layers are verified

The scoring function from the earlier simulation (Model H) is READY but won't be deployed until the Director greenlights the full expansion. Until then, this document is the authoritative reference for which cases score and which don't.

---

*This is the mathematical foundation. Every number here determines whether the game has 10 minutes or 10 years of depth.*
