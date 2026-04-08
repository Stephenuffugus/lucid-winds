# LUCID WINDS — WILD ECOSYSTEM DESIGN SPEC
# Director: Stephen | Lead Dev: Claude Code
# Created: 2026-04-08 | Status: APPROVED FOR BUILD

---

## MISSION STATEMENT
"You built something alive that only you could have grown, in a place only you could have planted it, and other people's worlds are growing into yours."

---

## 1. BREEDING LIFECYCLE

### Maturity Gate
- 7 days of ownership before first breed unlocks
- Visual "Seedling" tag during maturity period
- Day 7: "Mature" status with particle celebration

### Breed Charges (Recoverable)
- 3 max stored, 1 recovers every 14 days
- Plants are NEVER "spent" — just resting
- Cooldowns by rarity (peak season halves, opposite doubles):

| Rarity | Base Cooldown | Peak Season | Off Season |
|--------|---------------|-------------|------------|
| Common | 3 days | 1.5 days | 6 days |
| Uncommon | 5 days | 2.5 days | 10 days |
| Rare | 7 days | 3.5 days | 14 days |
| Epic | 10 days | 5 days | 20 days |
| Legendary | 14 days | 7 days | 28 days |
| Mythic | 21 days | 10 days | 42 days |
| Cosmic | 28 days | 14 days | 56 days |

### Generation Rules
- Offspring gen = max(parentA, parentB) + 1
- Capped at Gen 6
- Chimera penalty: -2 EA per gen above 1
- Chimera immunity: 2x climate resistance

---

## 2. ELDER PLANT SYSTEM

After all 3 charges used, plant becomes Elder (charges still recover over time):

### Greenhouse Roles
- **Rootstock**: Assign to nursery seed, guarantees EA floor on bloom
- **Trait Press**: Once per real-world season, extract one trait as consumable stamp (non-destructive)
- **Seasonal Resonance**: Passive hash generation in peak season (Common=1/day, Cosmic=12/day)
- **Exhibition Pedestal**: 3 Elder showcase slots on profile, visitors "Admire" for mutual pollen

### Wild Roles (Anchor Status)
- Count as 3 nodes in mesh calculations
- 2x soil succession speed in their hex
- 50% feral spawn rate boost within 200m
- Bloom Chorus wildcard (harmonizes with any color)
- 10% daily drift seed production

---

## 3. WILD ECOSYSTEM

### Mycelial Mesh (Earned Over 30 Days)

**Formation Requirements:**
- Adjacent H3 hexes, different owners
- Both plants watered within 48 hours
- Both plants aged 3+ days in wild
- 72-hour germination timer (resets if either plant goes unhealthy)

**Four Stages:**

| Stage | Day | Bonus | Unlock |
|-------|-----|-------|--------|
| Root Contact | 3-7 | +5% pollen | Visual thread, notification |
| Nutrient Bridge | 7-14 | +15% pollen, 25% shared watering | 1 feral/week |
| Deep Network | 14-30 | +25% pollen, 50% shared watering, phenotype reveals | 2 ferals/week, Bloom Chorus |
| Old Growth | 30+ | +40% pollen, 75% shared watering, +1 EA | Commons naming, 3 ferals/week |

**Diversity Multipliers:**
- All same season: 0.6x
- 2 seasons: 1.0x
- 3 seasons: 1.3x
- All 4 seasons: 1.6x
- 3+ unique substrates: +0.2x
- Contains Rare+ plant: +0.1x per tier above Common

**Maintenance:**
- Both plants need watering regularly
- 5 days unwatered = drop one stage
- Pests drain mesh health 15/day until pruned

### Bloom Chorus
- 3+ blooming plants in cluster create harmonic score
- Complementary bloom colors > analogous > identical
- Common with right color > Cosmic with duplicate
- Higher harmony = more pollinators = passive rewards

### Succession Ecology
- Each hex tracks soil maturity (0-100)
- Increases with sustained planting, decreases 1/week when empty
- Stage 0 (Bare, 0-20): no bonuses, common ferals only
- Stage 1 (Pioneer, 21-40): +1 EA, uncommon ferals
- Stage 2 (Understory, 41-60): +2 EA, rare ferals
- Stage 3 (Canopy, 61-80): +3 EA, epic ferals
- Stage 4 (Old Growth, 81-100): all max, unique climax ferals

### Phenotype Revelation
- Every plant has one hidden trait encoded in hash
- Reveals only when placed adjacent to complementary plant (any player)
- Once revealed, stays permanent even if trigger removed

### Drift Seeds
- Weekly production from all wild plants
- Floats to random hex within 500m
- Collector grows blend of parent + their own traits
- Elder Anchors produce every 4 days instead of 7

---

## 4. WILD REPRODUCTION & SPREAD

### Reproduction Mechanics
- Daily check at midnight UTC, 15% base chance
- Modified by: peak season (+10%), age 7+ days (+5%), density 4+ adjacent (-50%)
- Mate selection: scan 2-hex radius, prefer complementary season
- Cannot breed with own offspring/siblings (shared parent hash check)
- Isolated plants (no mate in range) = sterile

### Offspring
- Hash: SHA-256(parentA.hash + parentB.hash + targetHexId + dayTimestamp)
- ALWAYS Gen 1 (wild resets chimera generation)
- Targets random empty or vulnerable adjacent hex
- Wind-dispersal leaves can reach 2 hexes

### EA-Based Invasion
- Offspring EA > defender EA + 2 = takeover
- Displaced plant dies, owner gets harvest reward in hashes
- Player-dropped plants get +3 defense EA
- Mesh plants share +1 EA defense per member (max +3)

### Population Balance
- Lineage cap: 12 hexes max per genetic line
- Carrying capacity: urban 50/km², suburban 20/km², rural 5/km²
- Seasonal die-off: 20% of wild-born opposite-season plants culled at solstice/equinox
- Unwatered wild plants lose 1 health/week, dead at 0 after 4 weeks
- Empty hex cluster (14+ days) spawns spontaneous feral

---

## 5. HELP & HURT MECHANICS

### Help (Active)
- **Water**: 75m range, 10s hold, 5/day budget, free. Resets stress counter.
- **Mulch**: Spend 1 fertilizer. Halves stress 48hrs, +1 EA. 50 mulches = Steward badge.
- **Shelter**: Passive. High-canopy plants reduce weather stress 30% on adjacent hexes.

### Hurt (Natural Consequence)
- **Overcrowding**: Same leaf family adjacent = -1 EA both. Warning shown before drop.
- **Neglect Decay**: 0 interactions 7 days = wilting. 21 days = goes feral (lost forever).
- **Pest Outbreak**: 72hr cycle in dense areas (4+ plants in 3 hexes). Spreads to neighbors 48hrs if untreated. Prune: 5s hold, 3 hashes. Named events on map.

---

## 6. THE COMMONS

- 7+ hexes, 3+ players = named ecosystem
- Auto-generated name from dominant traits ("Frostbloom Hollow")
- Soft boundary glow on map
- All plants inside: +1 EA, reduced seasonal stress
- Shared resource pool, weekly contributor rewards
- Commons Badge cosmetic for participating plants

---

## 7. PRIVACY

- Never render exact GPS to other players — snap to hex center
- Home zone exclusion toggle: 200m radius hides all drops from others
- Owner sees exact placement, everyone else sees zone-level
- Mesh functions on zone adjacency, not precise coordinates

---

## 8. HASH ECONOMY

| Parameter | Value |
|-----------|-------|
| Hashes per plant | 30 (first mint: 10) |
| Easy win | 2 hashes |
| Medium win | 3 hashes |
| Hard win | 5 hashes |
| Expert win | 7 hashes |
| Diminishing returns | Full rate to 60/day, 50% to 120, 25% beyond |
| Elder passive (peak season) | Common=1/day, Cosmic=12/day |
| Target mint time | ~15 minutes |

---

## 9. RARITY DISTRIBUTION

| Tier | Score Threshold | Target % |
|------|----------------|----------|
| Common | 0-7 | 38% |
| Uncommon | 8-10 | 30% |
| Rare | 11-12 | 17% |
| Epic | 13-14 | 9% |
| Legendary | 15-16 | 4.2% |
| Mythic | 17 | 1.5% |
| Cosmic | 18+ | 0.4% |

---

## 10. FERTILIZER (REBALANCED)

| Parameter | Old Value | New Value |
|-----------|-----------|-----------|
| Max per seed | 25 | 15 |
| Boost per unit | 1% | 1% |
| Max boost | 25% | 15% |

---

## 11. ENGAGEMENT SYSTEMS

### Next Step Prompt
- Persistent prompt at top of each tab
- "Earn 12 more hashes for your next plant"
- "Your seed needs water today"
- "Try dropping a plant on the map"
- Adapts to player's current progress

### Daily Quests
- 3 micro-objectives refresh daily
- Examples: "Win 1 game", "Water a nursery seed", "Collect a feral seed"
- Complete all 3 = streak bonus (1 hash x streak length, cap 7)
- Missing a day resets streak

### Weekly Quest
- 1 larger objective per week
- "Win 5 games", "Breed a plant", "Drop a plant in wild"
- Reward: 15 hashes + 3 fertilizer

---

## 12. MAP DATA SOURCES (All Free)

| Source | Purpose | Cost |
|--------|---------|------|
| OpenStreetMap (Overpass API) | POIs: parks, gardens, monuments | Free, attribution required |
| iNaturalist API | Real plant sightings → rare feral spawns | Free, 100 req/min |
| Open-Meteo | Real weather → plant growth/stress | Free, no API key |
| Sunrise-Sunset API | Day/night timing | Free, no key |
| SoilGrids | Real soil types → substrate bonuses | Free, CC-BY |
| USDA Hardiness Zones | Regional feral biodiversity | Free, public domain |
| Moon phase | Client-side calc, lunar bonuses | Free, 10 lines JS |
| Leaflet.heat | Plant density heatmaps | Free, MIT, 3KB |
| Leaflet.Terminator | Real day/night boundary | Free, MIT |
| Turf.js | Geo math, territory shapes | Free, MIT |

---

## 13. BUILD ORDER

1. Next Step prompt system (retention fix)
2. Breeding cooldowns & maturity gate
3. Wild reproduction engine
4. Watering mechanic (help other players)
5. Mesh formation (4-stage progression)
6. Daily quests & streak counter
7. Succession ecology
8. Bloom Chorus
9. Phenotype Revelation
10. Commons naming
11. Elder system
12. Weather integration
13. POI data overlay
14. Privacy controls

---

## 14. PLAYER JOURNEY

### Minute 1-30: First Session
- Cinematic onboarding, gift plant, first games, see empty greenhouse slots
- Hook: hash counter at 8-12, they know 30 = plant

### Day 1-3: Learning
- Mint first earned plant, discover trait variety, start preferences
- Hook: got a Rare, want another

### Day 4-7: First Discoveries
- Drop first wild plant, discover breeding, first nursery seed
- Hook: seed blooms tomorrow, what traits?

### Week 2: Deepening
- Strategic breeding, first compost decision, first feral seed
- Hook: stranger's plant appeared near theirs

### Week 3-4: Social Layer
- Water neighbors, pest outbreaks, wild reproduction starts
- Hook: Commons about to form

### Month 2: Mid-Game
- First Elder, Rootstock, Trait Press, Commons named
- Hook: quarterly trait extraction coming

### Month 3-6: Mastery
- Multi-location networks, succession ecology, breeding lineages
- Hook: legacy — genetics spreading across the map

### Month 6+: Legacy
- Old Growth meshes, Elder landmarks, new players discover your ecosystem
