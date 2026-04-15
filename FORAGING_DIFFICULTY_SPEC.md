# Foraging Difficulty Scaling — Draft Spec

**Goal:** Rarer seed = more cards needed to solve, but never impossible.
**Core constraint:** Three attempts per hex per day stays. Only the puzzle width changes.

---

## Proposed scaling

| Seed rarity | Hex slots | Cards to play | Score to win | Notes |
|---|---|---|---|---|
| Common | 3 | 3 | **2** | Already generous; 1 match is enough |
| Uncommon | 3 | 3 | **3** | All three slots need a hit |
| Rare | **4** | 4 | 3 | 1 miss forgiven |
| Epic | **4** | 4 | **4** | All must hit — but only 4 elements |
| Legendary | **5** | 5 | 4 | 1 miss forgiven; deck pressure starts |
| Mythic | **5** | 5 | **5** | Every slot matters |
| Cosmic | **5** | 5 | 5 | Plus 1 slot must be EXACT match (Cycle-counter insufficient) |

**Score calculation per slot:**
- EXACT match (same element) = 1
- COUNTER (one back in cycle) = 0.5
- NEUTRAL / WILD = 0 (but reveals slot for next attempt)

So Score = number of exact hits + half the counters, rounded down.

---

## Card capacity to match

Current inventory cap: `8 + floor(level/10)` cards.

At Lv 1 you have 8 capacity — enough for 1–2 Legendary attempts.
At Lv 50 you have 13 — enough for 2–3 Legendary attempts back-to-back.
At Lv 100 you have 18 — plenty.

This scales naturally. No change needed.

---

## Impossibility guard

**Rule:** Any attempt must be able to complete if the player has the right cards.
**Mechanism:** Before locking a hex as "Cosmic", verify the player owns ≥ 5 cards total of any mix. If not, downgrade to the highest rarity their hand supports.

This prevents a new player from staring at a Cosmic hex with only 4 cards in hand and literally no path forward.

---

## Hint progression (attempts 1 / 2 / 3)

Same as now — attempts 2 and 3 reveal more info about each slot. With higher-rarity hexes, revealed info becomes more valuable because there are more slots to track.

**Possible enhancement:** On attempt 3 of a Legendary+ hex, show ONE slot's exact answer for free. This guarantees no dead-end on the final attempt.

---

## Scoring table (shown to player before they lock in)

On the attempt screen, show:
- **Slots to fill:** {N}
- **Cards to play:** {N}
- **Score needed:** {target}
- **Difficulty:** Common / Uncommon / Rare / Epic / Legendary / Mythic / Cosmic

Simple, legible. No surprise difficulty spikes.

---

## What I'll code

Once you approve or adjust:
1. Extend `window.LW_FORAGING` with a `hexDifficulty(seedRarity)` → `{slots, cards, scoreNeeded, exactRequired}` helper
2. Update `hexComposition(zoneKey)` to generate 3–5 slot compositions based on rarity
3. Update `buildHand()` size to match slots needed
4. Update score resolution to use dynamic `scoreNeeded`
5. Add the "downgrade on insufficient hand" safety guard
6. Update the foraging panel UI header to show slots + target

---

## Questions for you

1. Is the **Cosmic "one exact required"** rule too gimmicky? Could drop it and just make Cosmic = 5 slots / score 5.
2. On attempt 3, should we auto-reveal one slot for Legendary+ hexes? Safety net or too hand-holdy?
3. Card rarity tiers from Bloom Day drops (moonlight/thunder/dust) — should those count as EXACT or COUNTER toward any slot? Current code treats them as "half-strength wild" which works but isn't documented in the scaling.

Reply with any changes and I'll ship.
