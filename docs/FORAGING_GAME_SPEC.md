# Foraging Game — LOCKED DESIGN

The signature foraging mechanic replacing the 6 borrowed challenges. Hex-deckbuilding. RPS-cycle elements. Biome + weather strategy.

---

## 1. The Six Elements

Cyclic counter chain — each element beats exactly one, is beaten by one, neutral with three.

```
         Sun ☀️
        ↗     ↘
   Shade 🌑     Dry 🏜️
     ↑           ↓
   Wind 💨     Rain 💧
        ↖     ↙
         Still 🕊️
```

**Counter cycle:** Sun → Dry → Rain → Still → Wind → Shade → Sun

**Reading the cycle:** To counter **Sun**, play **Shade** (one back in the cycle). To counter **Rain**, play **Dry**. Memorable once learned.

**Neutral interactions:** any element paired with a non-adjacent one produces "stalemate" feedback — no score, no counter, just info.

---

## 2. Hex Composition

Every foragable hex has a hidden **attribute profile**: 3 elements selected from the 6.

- **Biome** sets the probability bias. Forest hexes favor Shade + Still; Desert favors Sun + Dry, etc. (see biome table below)
- **Weather** shifts one element's probability up by one tier that day. Rainy day = Rain more likely in every hex.
- **Seasonal modifier** may shift two elements per season (tied to the seasonal feral rotation).

Player doesn't know which 3 elements until they attempt.

---

## 3. Biome Strategic Identities

| Biome | Dominant attributes (more likely) | Rare attributes |
|---|---|---|
| **Forest** | Shade + Still | Sun, Dry |
| **Desert** | Sun + Dry | Rain, Still |
| **Wetland** | Rain + Still | Dry, Wind |
| **Mountain** | Wind + Dry | Rain, Shade |
| **Urban** | Still + Sun | Wind, Rain |
| **Coastal** | Rain + Wind | Sun, Dry |

Counter-decks follow from the cycle: to counter Forest's Shade+Still, bring Wind (beats Shade) and Rain (beats Still).

---

## 4. Weather Tilt

Real weather (from open-meteo fetch that already exists) shifts hex composition:

| Weather condition | Tilt |
|---|---|
| Rain > 5mm | Rain probability +1 tier everywhere |
| Temp > 30°C | Sun probability +1 tier |
| Temp < 5°C | Still probability +1 tier |
| Wind > 20mph | Wind probability +1 tier |
| Drought > 3 days | Dry probability +1 tier |
| Rain 0 + Wind 0 | Still probability +1 tier |

Weather only tilts one element per day (dominant condition wins). Creates a "today's forecast → today's deck" loop.

---

## 5. Cards (Hand Management)

**Element cards:** 6 base cards, one per element. Multiple copies of each allowed in a deck.

**Acquisition:**
- Start with **3 starter cards** (e.g. 1× Sun, 1× Rain, 1× Wind — chosen by the keeper at tutorial)
- **+1 new card per Keeper level-up** (choice between 2 random elements)
- **Bloom Day rewards** drop **rare wild cards** (Moonlight, Thunder, Dust) that act as universal counters with stricter reveal penalties
- Total attainable in a year of play: ~15 cards (so capacity-of-8 = meaningful inventory management)

**Inventory caps:**
- **Carry capacity: 8 cards** total (grows slightly with level, never via payment)
- **Active hand: 5 cards** equipped before foraging
- **Per attempt: play 3 cards** against the hex

**Premade decks:**
- Save up to **4 named decks** ("Forest Deck", "Desert Deck", "Coastal Deck", "Custom")
- Unlock at Keeper Level 5
- One-tap swap between decks at any time, including mid-trip

**Rare wild cards (earned at events only):**
- Each is a wild "universal counter" — matches any single element with 50% strength
- Can only be in one active hand at a time (slot guard)
- Bloom Day rewards or rare mutations give these

---

## 6. Attempt Flow

Player walks within range of a feral hex (existing 75m collect radius). Tap the hex → opens foraging panel.

### Attempt 1
1. Player sees biome + weather icons (free info)
2. Player plays 3 cards from their 5-card active hand
3. Hex reveals outcome:
   - ✅ Match (card = hex element): full strength
   - ⚔️ Counter (card beats hex element): partial strength
   - ⚪ Neutral: no effect
4. Score totalled:
   - 2+ matches/counters = **success** → full seed reward
   - 1 match/counter = **partial** (proceed to attempt 2 with info)
   - 0 = **miss** (proceed to attempt 2)

### Attempt 2
- Player sees which elements didn't appear (deduces remaining probability)
- Plays 3 cards again (can reuse same cards — hand isn't consumed)
- Success → **75% seed reward**

### Attempt 3
- Final chance, full info from first two attempts
- Success → **50% seed reward**
- Fail → **hex locks for 24h**, no partial reward

---

## 7. Reward Structure

| Outcome | Reward |
|---|---|
| Attempt 1 success | Full seed (rarity per hex difficulty) |
| Attempt 2 success | 75% of full (rounded down if Common) |
| Attempt 3 success | 50% of full |
| 3-attempt fail | 0, hex locked 24h |

**Expected success rates** for a prepared player (matched biome deck + read weather):
- Common-tier hex: ~75% attempt 1, ~92% by attempt 2
- Rare-tier hex: ~50% attempt 1, ~75% by attempt 2
- Legendary-tier hex: ~30% attempt 1, ~55% by attempt 3

Rare seeds behind wild modifiers = legitimate difficulty spike.

---

## 8. Integration with existing systems

- **Current 6 borrowed mini-games** — retired (kept as "legacy challenges" toggle for nostalgia only, no rewards)
- **Feral zone mechanics** — unchanged (which hexes appear, how many, distance gates)
- **Seed collection** — unchanged (hex success → seed in Field Pouch → Nursery)
- **Clippings economy** — reinforced: locked hexes mean stranger cuttings become more valuable as an alt path to rare traits
- **Book of Secrets** — logs each forage attempt with biome/weather/deck + result. Long-term diary
- **Climate system** — weather already fetched once/hour; foraging uses same cache
- **Classes** — Forager class gets a natural tie-in (bonus card capacity? reduced attempt cost? tbd in companion-family pass)

---

## 9. Build plan

**Session 1 (design + data):**
- Element + biome tables in LW_FORAGING data structure
- Card inventory storage (`lw_forage_cards`)
- Deck storage (`lw_forage_decks`)
- Weather-tilt resolver (reads from existing open-meteo cache)
- Hex composition generator (deterministic from hex zone key + day + biome + weather)

**Session 2 (UI):**
- Foraging panel (opens when hex tapped)
- Card selection: tap to play 3 of 5
- Attempt reveal animation
- Success/partial/fail states + rewards
- Deck editor screen

**Session 3 (polish + tuning):**
- Weather icon on each hex
- Attempt counter per hex per day
- Locked-hex display
- Biome hint chip
- Bloom Day wild-card acquisition hook

**Total: 3 focused sessions** to a working signature foraging game.

---

## 10. Risks to watch

- **Tutorial complexity:** 6 elements × biome tilt × weather tilt + deck management is a lot. First-time onboarding must be staged — show 3 elements first, add more as player levels.
- **Reading weather:** players who don't check weather before foraging will miss more. Consider a "today's forecast" nudge on Wild tab entry.
- **Card completionism:** if all 15 cards are earnable, some players will grind to complete. Fine — but don't let completion trivialize foraging (keep hex randomness in the 20-40% range even for full-deck players).
- **Attempt limits feel punishing:** mitigate with "info reveal" making attempt 2-3 genuinely more informed, not just RNG rerolls.

---

## Locked values

| Parameter | Value |
|---|---|
| Elements | 6 (Sun/Shade/Rain/Dry/Wind/Still) |
| Counter | cyclic (Sun→Dry→Rain→Still→Wind→Shade→Sun) |
| Hex attributes | 3 per hex |
| Carry capacity | 8 cards |
| Active hand | 5 cards |
| Play per attempt | 3 cards |
| Attempts per hex per day | 3 |
| Hex lock on 3-fail | 24 hours |
| Attempt reward curve | 100% / 75% / 50% / 0% |
| Deck slots | 4 (unlock at Keeper L5) |
| Card cost | none (time + attempt limit is the gate) |
| Pay-to-win | none |

Ready to build.
