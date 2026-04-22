# Lucid Winds — Master Design Specification (Gold Master)

## 1. Core Overview
Lucid Winds is a botanical collection and map-based strategy game where players generate plants, place them in the wild, and attach companions that influence outcomes.

Plants exist in:
- Greenhouse (collection)
- Nursery (growth)
- Wild (GPS, contested)

Each plant has one deterministic companion.

---

## 2. Terminology (Locked)

- Lineage (Family)
- Vigor (Attack)
- Root Weight (Defense)
- Aspect (Signature Ability)
- Trait (Keyword)
- Ritual (Active ability)
- Aura (Passive ability)

---

## 3. Companion Structure

Each companion has:
- Lineage
- Ritual
- Aura
- Aspect
- 1–2 Traits
- Trigger Type

---

## 4. Trigger System

All abilities follow:

[Trigger] → [Effect] → [Cap] → [Bonus]

Trigger types:
- On Action
- On Outcome
- On Environment
- On Time

---

## 5. Traits

- Restless → +1 Dew/day  
- Hardy → 50% climate resistance  
- Rooted → +2 Root Weight defending  
- Swift → +2 Vigor attacking  
- Lush → +1 pollen  
- Echoing → 10% repeat last effect (no chaining)

---

## 6. Aspect System (Examples)

### Guardians
Turtle — Petrify  
On Time → +1 Root Weight/day (cap 14), ignore first defeat  

Porcupine — Quill Shed  
On Defense → 25% relocate, attacker -1 Vigor  

Toad — Cloudburst  
On Dry → +30% water efficiency, 1.3× reproduction  

Pangolin — Windbreak  
Passive → -50% wind damage  

Scorpion — Sunbaked  
Passive → -50% heat damage  

---

### Conduits
Snail — Calcify  
On Defense → dice floor = 3, +1 Root Weight  

Dart Frog — Prophecy  
Predict outcome → 3× reward or penalty  

Axolotl — Regeneration  
On Death → recover 50–75% Dew  

Worm — Aeration  
-50% drought damage, +1 Dew  

Koi — Floodgates  
-50% flood damage  

---

### Pollinators
Bee — Royal Jelly  
+1 Dew per pollination  

Butterfly — Zephyr  
5% auto-pollinate  

Luna Moth — Lunar Tide  
+50% pollen at night  

---

### Weavers
Spider — Gossamer Snare  
+3 Root Weight  

Ant Trail — March  
+1 Vigor per 500 steps (cap 5)  

---

### Listeners
Beholder — Omnisight  
Global reveal  

Raven — Omen  
Cooldown reduction  

Will-o-Wisp — Mirage  
25% miss + teleport  

---

### Wayfinders
Dragonfly — Slipstream  
+1 Vigor per biome  

Origami Crane — Thousand Folds  
Weekly global buff  

Flamingo — Flock  
+1 Sunbeam/day  

---

### Scatterers
Raccoon — Scavenge  
+1 fertilizer  

Scarab — Gilded Roll  
+1 rarity tier  

Platypus — Electrosense  
+1 forage attempt in rain  

---

## 7. Core Systems

### Loss Value
Some abilities trigger on failure/death

### Thresholds
Milestone bonuses (steps, biomes)

### Chaos Layer
Rerolls, teleport, Echoing

---

## 8. Item System

Burst:
- Solar Flare (double reward)
- Wild Surge (trigger contests)

Engine:
- Mycelial Ring
- Wind Charm

Control:
- Reroll Token
- Cooldown Reset

Territory:
- Claim Totem
- Fog Seed

---

## 9. Combo Archetypes

- Pollinator Engine
- Defender Stack
- Climate Immunity
- Movement Build
- Information Control
- Compost Engine
- Chaos Build
- Zone Control

---

## 10. Balance Rules

- Max stat bonus: +10  
- Max chain triggers: 2  
- Echoing cannot echo itself  

Cluster rule:
5+ plants → -25% effectiveness  

---

## 11. Visual System

Abilities modify plant visuals:
- Calcify → thicker stems  
- Spore Web → spores  
- Gilded Roll → gold accents  

Implementation:
plant.modifiers = {
  glow: "blue",
  thickness: 1.2,
  particles: "spores"
}

---

## 12. Dev Priorities

Phase 1:
- Trigger system
- Aspect system
- Traits

Phase 2:
- Items
- Visual modifiers

Phase 3:
- Balance + telemetry

---

## Final Note

This system blends deterministic structure with emergent gameplay, enabling long-term engagement and multiple viable playstyles.
