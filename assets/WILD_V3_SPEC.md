# LUCID WINDS — WILD TAB v3 DESIGN SPEC
# Director: Stephen | Lead Dev: Claude Code
# Created: 2026-04-10 | Status: DRAFT — pending Director red-line

**Supersedes** the harvest, decay, and acceleration sections of `WILD_ECOSYSTEM_DESIGN_SPEC.md` (Apr 8 v1). The breeding lifecycle, chimera generation penalties, and Nursery mechanics from v1 remain in force unless explicitly changed below.

---

## 0. MISSION STATEMENT

> "You can plant, you can tend, you can take — but every take wounds something. The world only thrives when the community cares. This is a living social experiment where kindness is mechanically load-bearing."

Wild v3 keeps v1's emotional core ("plants live their own lives, you come back to read the story") and adds a **harvest-as-wound** model that turns the Wild tab from a PvP theft economy into a cooperative care economy with measurable extraction costs.

---

## 1. ECONOMY SIMPLIFICATION

v3 collapses the four-currency system into a cleaner shape:

| Currency | Role | Earned how | Spent on |
|---|---|---|---|
| **Hashes** (formerly hashes + dew) | Universal gameplay currency | Mini-games, fruit harvest from wild plants, drift seed bonuses | Plant minting (30/plant), nursery acceleration fallback |
| **Pollen** (formerly pollen + XP) | Keeper Level / progression | Wild plant ticks (proximity), tending strangers, breeding events, mini-game wins, first-time achievements | **Never spent** — monotonic XP |
| **Pi / Polygon / Solana / Cash** | Convenience layer | Purchased with real money/crypto | Inventory expansion (slots, pouch), nursery acceleration (optional speedup) |

**Rules:**
- **Hashes = dew.** All dew references collapse to hashes. Any place in code that currently grants "dew" now grants hashes. The old dew table (Common 3 / Uncommon 5 / Rare 8 / Epic 12 / Legendary 18 / Mythic 25 / Cosmic 40) becomes the fruit-harvest table.
- **Pollen is XP.** Pollen never decrements. It's the leveling bar. Breeding and harvest actions are **level-gated** instead of pollen-priced.
- **Real money / crypto is never required to play.** Every action in the game has a free path. Paid acceleration is strictly a "treat yourself" shortcut for nursery growth.
- **No reclamation.** Dead plants do not return. Ever. Greenhouse drops are permanent one-way trips.

---

## 2. POLLEN / KEEPER LEVEL CURVE

Pollen becomes the XP bar. 50 levels total. The first 15 levels are a guided tutorial where every level unlocks something visible; 16–25 is real content gating; 26–50 is prestige/long-tail.

### Level thresholds (cumulative pollen)

```
Lv 1    → 0        (Seedling)
Lv 2    → 100      (~10 min play)
Lv 3    → 250
Lv 4    → 500
Lv 5    → 1,000    [UNLOCK: Pollen ticks on strangers' wild plants]
Lv 6    → 2,000
Lv 7    → 3,500    [UNLOCK: Greenhouse breeding]
Lv 8    → 5,500
Lv 9    → 8,000
Lv 10   → 12,000   [UNLOCK: Fruit harvest from strangers' wild plants]
Lv 11   → 17,000
Lv 12   → 23,000   [UNLOCK: Nursery merge-breed (two seeds → one)]
Lv 13   → 31,000
Lv 14   → 41,000
Lv 15   → 55,000   [UNLOCK: Cuttings from strangers' wild plants — WOUNDS them]
Lv 16   → 75,000
Lv 17   → 100,000
Lv 18   → 135,000
Lv 19   → 180,000  [UNLOCK: Book of Secrets pages + substrate badges]
Lv 20   → 240,000
Lv 21   → 320,000
Lv 22   → 420,000
Lv 23   → 545,000  [UNLOCK: 4th daily Wild drop]
Lv 24   → 700,000
Lv 25   → 900,000  [UNLOCK: "Master Keeper" title, cosmetic gold border]

Lv 26-35 → ~1.15M → 3M       (prestige tier 1 — lineage mastery titles)
Lv 36-50 → ~3.5M → 12M       (prestige tier 2 — cosmetic only, no gates)
```

**Rationale:** a new player hits Lv 5 in their first session (10-15 min of mini-games + a walk around the block). Lv 10 by end of week 1. Lv 15 by end of month 1. Lv 25 by month 3–4. Lv 50 is a multi-year achievement. Friendship XP events and weekly bonus multipliers can accelerate by 1.5x to 2x at certain tiers.

### Pollen sources (per action)

| Action | Pollen |
|---|---|
| Mini-game win | 20–80 (by difficulty, doubled for perfect) |
| Wild plant proximity tick (own plant) | 1–15/hr scaled by rarity |
| Wild plant proximity tick (stranger's) | 2 flat (any rarity) |
| Tend a dying plant (any keeper's) | 10 |
| Collect a feral seed | 30 |
| Claim a drift seed | 50 |
| First time minting a plant | 100 |
| First time breeding | 200 |
| Friendship event (friend's plant blooms near you) | 50 |
| Daily login | 25 |
| Weekend bonus multiplier | ×1.5 |

### Milestone celebration design

Every level-up must feel shiny. Acceptance criteria:

- Full-screen burst with confetti SVG + sage-to-gold gradient sweep
- Level number in giant Bebas Neue, 2-second hold
- Unlock card slides in if an unlock triggered (shows icon + name + one-line description + CTA button)
- Haptic pulse (`[30, 55, 30]` pattern)
- Sound: win chime + soft petal rustle
- Toast persists briefly after so player can re-read the unlock

---

## 3. INTERACTION TYPES (replacing harvest)

The core Wild v3 mechanic is that **every interaction with a stranger's wild plant is either destructive (wounds it) or restorative (heals it)** — never neutral. The game openly labels the penalty so players choose their extraction style.

### 3a. Pollen tick (tending — the kind path)

- **Requires:** Lv 5+, within 75m of plant
- **Cost to plant:** None
- **Reward to tender:** 2 pollen + 1 entry in target's journal ("Jessie tended your Moonvine")
- **Rate limit:** One tick per plant per 6h per tender
- **Intent:** The default "kindness is free" interaction. Strangers who walk past your plants contribute to their well-being. This is the only way to boost a plant's **vitality** (see Decay section).

### 3b. Fruit harvest (light extraction)

- **Requires:** Lv 10+, within 75m, plant must be in Bloom phase (see lifecycle)
- **Cost to plant:** Next bloom delayed 6 hours (no permanent wound)
- **Reward to harvester:** hashes by rarity (3 / 5 / 8 / 12 / 18 / 25 / 40), plus 10 pollen XP
- **Rate limit:** Once per plant per 18h per harvester
- **Journal entries:** "Marcus harvested fruit from your Moonvine (+18 hashes to him, +10 tending delay on your plant)"
- **Intent:** The everyday forager loop. You walk through a park, you take a few hashes off ripe plants, plants recover fine, everyone eats.

### 3c. Cutting (real extraction — the wound)

- **Requires:** Lv 15+, within 75m, plant must be 3+ days old
- **Cost to plant:** **Permanent -2 EA** and **-10% of remaining lifespan**. Stacks across players — three cuttings = -6 EA, -30% lifespan.
- **Reward to cutter:** A clone seed deposited in their Nursery. The clone has the same traits as the parent but starts at chimera gen+1 and inherits the -2 EA penalty (it's a wounded clone, not a pristine copy).
- **Rate limit:** Once per plant per player lifetime. You cannot cut the same plant twice.
- **Journal entries:** "Marcus took a cutting from your Moonvine. The plant weakened (-2 EA, lifespan shortened by 2 days)."
- **Intent:** The "I NEED this specific genetic" option. Always possible, always costly. Players hoarding rare traits by cutting-spree will visibly degrade their local ecosystem.

### 3d. Owner actions on own plants (free, no gates)

- Pollen tick: unlimited, 15/hr scaled by rarity
- Water: free once per 24h when within 75m (resets decay timer — see below)
- Re-cutting own plants: allowed, no EA penalty applies to self-cuts (your garden, your rules)

---

## 4. DECAY AND LIFESPAN

Wild plants now have rarity-scaled natural lifespans. Decay is linear from the moment of drop, halted only by owner care or stranger pollen ticks.

### Base lifespans

| Rarity | Base lifespan (days) |
|---|---|
| Common | 7 |
| Uncommon | 10 |
| Rare | 14 |
| Epic | 21 |
| Legendary | 30 |
| Mythic | 45 |
| Cosmic | 60 |

### Care effects on lifespan

- **Owner water visit within 75m:** Resets decay countdown to full lifespan. Can only be done once every 24h.
- **Stranger pollen tick:** Adds +6 hours to remaining lifespan, max +5 days lifetime from stranger tending (capped, so a plant can't live forever on stranger kindness alone).
- **Fruit harvest:** Does not affect lifespan, only delays next bloom.
- **Cutting:** Permanent −10% of *remaining* lifespan (compounding wound).
- **Seasonal match:** Plants in their peak season gain +20% lifespan; opposite season -20%.

### Death

When lifespan reaches zero, the plant:
1. Visually withers on the map (brown/faded for 24h)
2. Drops one **soil memory layer** into its hex (see Section 5)
3. Writes a **memorial record** to Firestore (see Section 7)
4. Generates a final journal entry for the owner and every tender in the last 7 days
5. Vanishes from the live map

**No revival. No reclamation. The plant is gone. Its record lives in the memorial log.**

---

## 5. SOIL MEMORY (shared, layered, combo-able)

When a plant dies in a hex, it leaves a layer of soil enrichment that any future player can benefit from.

### Layer mechanics

- **Stacking:** Max 3 layers per hex. 4th death evicts the oldest layer.
- **Decay:** Each layer loses 1/30th strength per day. Full layer gone after 30 days.
- **Scope:** Shared globally. Anyone who drops a plant in an enriched hex benefits. No ownership on soil.
- **Layer data:** season, rarity tier, companion type, shared lineage marker (parent hash), contributor count (how many tenders touched the plant before death)

### Combo bonuses (applied to the NEXT plant dropped in the enriched hex)

| Combo | Bonus to new plant |
|---|---|
| 3 layers of same season | +20% pollen tick rate while in peak season |
| 3 layers of different seasons (cross-season mix) | +1 EA flat (hybrid hardiness) |
| Any layer from a Mythic or Cosmic plant | +2 EA, Book of Secrets reveals one bonus trait on bloom |
| 2+ layers sharing a parent hash (lineage shrine) | Drift seeds spawned here inherit one guaranteed parent trait |
| Layer with same companion type as new plant | Doubled breeding window chance |
| Layer contributed by 5+ unique tenders | +50% lifespan (tends memory echoes into the new plant) |
| Cosmic layer anywhere in stack | Hex visually glows gold on map |

**Rationale:** popular hexes become genuinely "better ground" to plant on, rewarding walking routes and community hotspots. New players can discover great soil by exploring.

---

## 6. DRIFT SEEDS (wild breeding, community propagation)

Wild plants breed naturally through companion pollinators. This is how the map spreads.

### Trigger conditions

- Two compatible-season plants (same season, or peak-season pair) sharing a hex for 24+ hours
- At least one of them must have a **pollinator companion** (bee, moth, hummingbird, bat, butterfly — whichever the companion idx maps to)
- Both plants must be at >50% lifespan remaining

### Drift seed spawn

- 24–72h after trigger, a drift seed appears in a random adjacent empty hex
- Drift seed is unowned on the global map, visible to everyone
- First player within 75m to complete a **germination mini-game** claims it to their nursery
- Claimed drift seeds carry both parent hashes as lineage (chimera gen = max(parentA, parentB) + 1)
- The two parent plants get journal entries: "Your Moonvine pollinated with Marcus's Ember Fern. A drift seed fell 2 blocks east."

### Rate limits

- Max 3 outstanding drift seeds per parent plant at any time
- A parent plant can only contribute to one drift seed per 36h
- Global drift seed spawn cap: scales with Ecosystem Health meter (Section 9)

---

## 7. MEMORIAL LOG (hash-keyed, Firestore-backed)

When a plant dies, a memorial record is written to Firestore. Players can browse their memorial log to see everything they ever planted in the wild.

### Firestore schema

```
vaults/{uid}/memorials/{hash}   // hash is the 64-char plant hash, serves as doc ID
{
  hash: "abc123...",              // regenerates the plant's SVG, name, haiku, traits
  parentAHash: "def456..." | null,
  parentBHash: "ghi789..." | null,
  plantedBy: uid,
  firstPlantedAt: timestamp,
  diedAt: timestamp,
  diedHex: "40.7128,-74.0060",
  lifespanDays: 14,
  chimeraGen: 3,
  causeOfDeath: "natural" | "wither" | "care_starvation",
  totalPollenTicked: 847,
  uniqueTenders: ["jessie_uid", "ren_uid", ...],  // capped at 20
  cuttingsTaken: 3,                // by who doesn't matter for the memorial
  finalEA: 12,                     // EA at moment of death (after any cut wounds)
  lastCoords: {lat, lng}
}
```

### Security rules

- Writes gated by Firebase auth — only the server can write memorials (triggered by a Cloud Function on plant death, NOT a direct client write)
- Clients can only READ their own memorial collection
- This makes the log "unhackable" in the practical sense: no client can inject fake memorials, no client can modify an existing one

### Player-facing features

- **Memorial archive view:** scrollable list of every plant you ever planted in the wild, sorted newest-first. Each entry shows the plant's SVG (re-rendered from hash), name, haiku, lifespan, tenders.
- **Click to inspect:** opens the full plant card as it looked on the day of death, plus a "Tenders" list showing who tended it.
- **Lineage tracing:** click a parent hash to pull up that ancestor's memorial (if it also died) or its current state (if still alive).
- **"Prove this plant existed":** a share button that generates a signed token encoding {hash, diedAt, ownerUid} — other players can verify your dead plant's lineage by feeding the token through the game.

---

## 8. NURSERY ACCELERATION (the paid convenience layer)

Nursery seeds currently take 3 days to bloom (water daily, bloom on day 3). v3 adds an optional paid acceleration.

### Free path (unchanged)

- Water the seed once per day for 3 days → bloom
- Watering is free, always
- Compost (earned from composting unwanted plants) adds EA bonus on bloom (max 25 layers at 1% each)

### Paid acceleration path

- "Accelerate" button on any seed in nursery that hasn't bloomed yet
- Cost (rough starter numbers, tune later):
  - Skip 1 day: **5 hashes** (free in-game fallback) **OR** 0.05 Pi / equivalent
  - Skip 2 days: 15 hashes **OR** 0.1 Pi
  - Skip all remaining days (full bloom now): 30 hashes **OR** 0.2 Pi
- Hash cost is the free fallback — anyone can skip with enough mini-game grinding
- Multi-chain: Pi at launch, Polygon + Solana stubbed, cash last

### Bug to fix (separate task)

Stephen reports a nursery glitch: watering-for-free UI shows but acceleration is gated on compost being applied. Expected: water always free, compost optional for EA bonus, acceleration available via hash cost or paid path regardless of compost state. Exact repro TBD — file as separate bug (#16).

---

## 9. ECOSYSTEM HEALTH METER (global social experiment)

A single worldwide number that reflects the net kindness of the player community over the last 7 days.

### Calculation

```
health_score = clamp(0, 100,
  50 + (
    (total_pollen_ticks_on_strangers * 0.1) +
    (drift_seeds_claimed * 0.5) +
    (plants_saved_from_death * 2) -
    (cuttings_taken * 2) -
    (plants_left_to_wither * 0.5)
  ) / active_player_count
)
```

Computed server-side once per hour from a rolling 7-day window.

### Effects at each tier

| Health Score | Effect |
|---|---|
| 80–100 (thriving) | Drift seed spawn rate +30%, rare traits +15% odds, global gold aura on map |
| 60–79 (healthy) | Drift seed spawn +10%, no penalty |
| 40–59 (balanced) | Baseline |
| 20–39 (strained) | Drift seed spawn -10%, cutting penalties +50% (harvesters feel it) |
| 0–19 (collapsing) | Drift seed spawn -30%, rare trait odds -20%, map fog darkens |

### Player-facing display

- Shown at top of Wild tab (replaces the current keeper-info log strip)
- Horizontal bar with color gradient (red → gold → green)
- Tap to expand: shows 7-day trend, breakdown of kindness vs extraction, leaderboards of Top Tenders in your district
- **This is the "look what the community is doing" feed** — the social experiment made visible

### Extraction Ratio (private, personal)

Each player has a hidden stat in their profile:

```
extraction_ratio = cuttings_taken / (plants_tended + 1)
```

Labels:
- `< 0.1` → **Nurturer**
- `0.1–0.5` → **Balanced Keeper**
- `0.5–2` → **Harvester**
- `> 2` → **Extractor**

Shown only to the player unless they opt in to display it publicly. Some players will wear Extractor as a badge of pride. Others will chase Nurturer titles. Emergent identity without enforcement.

---

## 10. HEX INSPECTOR (UX rebuild)

The current hex click opens a small overlay panel. v3 opens a **fullscreen hex inspector** with room for all the new content.

### Layout

- Fullscreen modal with dark backdrop
- Header: zone coordinates, distance from player, soil memory combo badges (if any)
- Main body: tabs or stacked sections
  - **Plants in hex** (1–3): each with portrait, owner name, rarity (revealed based on care history — see below), current EA, lifespan remaining bar, tenders list, action buttons (Tend / Harvest Fruit / Cut)
  - **Drift seeds ready** (if any): each with a Claim button
  - **Soil memory** (if any): visual layers with combo explanations
  - **Care history feed** (last 20 events in this hex): scrollable journal of who tended, who cut, who harvested
- Footer: "Walk closer to interact" if >75m, otherwise action buttons

### Progressive trait reveal

Non-owned plants start mysterious. Each care action reveals more:

| Care action | What's revealed |
|---|---|
| First pollen tick | Plant silhouette + name + season |
| 3rd pollen tick | Rarity tier (Common / Rare / etc.) |
| 5th pollen tick | EA number |
| First fruit harvest | Companion (if any) |
| 10th pollen tick | Full trait list |

The more you tend, the more you know. Harvesting fruit once reveals one bonus trait. Taking a cutting reveals everything (you're inside the plant). **Knowledge through care, not conquest.** This creates a strong incentive to tend before extracting — and since tending is what the community needs, the incentives align with the health of the ecosystem.

---

## 11. LEVEL GATES — full reference table

| Action | Minimum Keeper Level |
|---|---|
| Drop plant from greenhouse | 1 |
| Tend own plant | 1 |
| Pollen tick on own plant | 1 |
| Collect feral seed | 1 |
| Claim drift seed | 1 |
| Greenhouse carousel | 1 |
| **Pollen tick on stranger's plant** | **5** |
| Nursery breeding (single seed water) | 1 |
| **Greenhouse cross-pollinate** | **7** |
| **Fruit harvest from stranger** | **10** |
| **Nursery merge-breed (2 seeds → 1)** | **12** |
| **Cutting from stranger (wounds plant)** | **15** |
| Book of Secrets + substrate badges | 19 |
| 4th daily Wild drop | 23 |
| Master Keeper cosmetic border | 25 |

Level gates are hard — no paid bypass. This is what prevents grief thieves at launch.

---

## 12. PHASED BUILD PLAN

Each phase is independently shippable. If a later phase breaks, earlier ones still work.

### Phase 1 — Kill the old harvest (0.5 day)
- Remove EA-takeover harvest code from `_crossPollinate` / harvest challenge flow
- Remove "Harvest" button from hex inspector
- Keep defender game picker as dead code for now (revive later if needed)
- No new features yet — Wild is now purely drop + walk + feral

### Phase 2 — Non-destructive interactions (2 days)
- Implement Pollen Tick action (unlimited own, level-gated stranger)
- Implement Fruit Harvest action (rarity hash table, 18h cooldown, 6h bloom delay)
- Implement Cutting action (EA wound, lifespan wound, clone to nursery)
- Update hex inspector to show three action buttons with costs visible

### Phase 3 — Rarity lifespan + decay (1 day)
- Add `lifespanDays` field per wild plant by rarity
- Daily decay tick (server-side Cloud Function or client-side on activity)
- Wither visualization for last 24h of life
- Death cleanup: remove from map, trigger memorial write

### Phase 4 — Memorial log (2 days)
- Firestore schema + security rules for `vaults/{uid}/memorials/{hash}`
- Cloud Function `onPlantDeath` writes memorial record
- Client-side memorial archive view (accessible from Wild tab menu)
- "Memorial of the Day" Journal integration

### Phase 5 — Soil memory + combos (2 days)
- Firestore or local schema for hex soil layers
- Layer write on plant death
- Combo detection + bonus application on new drops
- Visual enrichment indicator on hex tiles (darker color, subtle glow for rare layers)

### Phase 6 — Drift seeds + pollinators (3 days)
- Companion type → pollinator flag
- Pollination trigger scan (hourly?)
- Drift seed spawn in adjacent hex
- Germination mini-game for claiming
- Lineage recording on drift seeds

### Phase 7 — Pollen = XP rework (3 days)
- Rename pollen storage bucket to XP semantically
- Implement level curve with thresholds
- Level-up celebration (the shiny one)
- Gate all new actions behind levels
- Backfill existing players based on total pollen earned historically

### Phase 8 — Ecosystem Health meter + Extraction Ratio (2 days)
- Cloud Function computes health score hourly
- Meter UI on Wild tab (replaces old keeper-info strip)
- Extraction Ratio in profile
- Journal integration for milestone events

### Phase 9 — Fullscreen hex inspector rebuild (2 days)
- Replace popup with fullscreen modal
- Progressive trait reveal based on care history
- Care history feed per hex
- All v3 action buttons integrated

### Phase 10 — Nursery paid acceleration (2 days, Pi only for now)
- Accelerate button + cost calc
- Pi payment flow integration
- Hash fallback path
- Multi-chain stubs for later

**Total estimated build time:** ~20 days of focused work across phases 1–10. Phases are independent enough that you can pause after any one to test on device and red-line before proceeding.

---

## 13. RISKS AND UNKNOWNS

### Risk 1 — Urban vs rural density imbalance
City players get 10x the stranger interactions. Solo rural keepers see empty hexes.
**Mitigation:** Drift seeds spawn from "wind events" in any hex with at least one alive plant, even without a partner. Ecosystem Health meter bonuses apply globally, so rural players benefit from urban kindness even if they can't participate locally.

### Risk 2 — Cutting farmers trash popular hexes
If a hoarder spree-cuts every rare plant they find, popular parks become wastelands.
**Mitigation:** Lv 15 gate delays this until week 3+. Cutting is once-per-plant-per-player lifetime. Ecosystem Health tanks when global cutting spikes, raising penalties. The public journal entries name-and-shame extractors in local districts.

### Risk 3 — Memorial log Firestore cost
Every death writes a doc. At scale that's 3 drops/day × 1000 players × 365 days = ~1M memorial docs/year.
**Mitigation:** Firestore free tier covers up to 50k writes/day. At 3k writes/day from deaths, we're fine. Archive memorials older than 2 years to Cloud Storage as compressed JSON to save Firestore quota long-term.

### Risk 4 — Phase 7 (Pollen = XP rework) breaks existing players
Current players have accumulated pollen as a consumable. Converting to monotonic XP changes the meaning.
**Mitigation:** One-time migration: existing `pollen_total` field becomes `keeper_xp_total`. Compute current level from thresholds. Players wake up on day of migration already leveled up, which feels good. No one loses progress.

### Risk 5 — Social experiment framing alienates players who want a game, not a study
Some players dislike being told they're part of an experiment.
**Mitigation:** The Ecosystem Health meter is shown as an ecosystem stat, not experiment framing. The "social experiment" language is marketing / external-only. In-game it's just "the world's health."

---

## 14. OPEN QUESTIONS FOR DIRECTOR

Before any coding begins, I need your answers on:

1. **Pollen → XP migration policy:** When Phase 7 ships, do existing players keep their current pollen total as their starting XP? My assumption is yes (everyone wakes up ~Lv 3–8 depending on their current balance). Confirm or override.

2. **Cutting wound on clone seed:** The clone nursery seed inherits -2 EA from the parent's wound. Does this feel right, or should the clone be pristine (wound is only on the source)? My lean: wounded clone, because it reinforces the theme of extraction having a cost.

3. **Phase ordering:** I listed Phase 7 (Pollen=XP rework) at step 7. Would you prefer it earlier (say Phase 3) so players start experiencing the new level system sooner? Counter-argument: doing it later means the curve is tuned against real Wild v3 gameplay data from earlier phases.

4. **Book of Secrets / Compendium integration:** v3 references "Book of Secrets reveals on bloom" as a bonus. Is the Book of Secrets already built enough to hook into, or does it need its own separate spec?

5. **Journal expansion:** The Journal is the emotional heart of v3. Every mechanic above generates journal entries. Is there a limit on how many entries a journal can hold? Do old entries archive / expire? Should there be filtering (by plant / by keeper / by event type)?

6. **Level curve calibration:** My proposed curve hits Lv 25 in ~3–4 months of active play, Lv 50 in ~2 years. Is that the engagement window you want? Some mobile games target Lv max in 6 months. Tell me your retention horizon.

---

## 15. SEPARATE TASKS (non-v3)

Tracked separately from this spec but mentioned during design discussion:

- **Nursery water/compost bug** (#16): current glitch where accelerate is gated on compost. Needs repro and fix, unrelated to v3 mechanics.
- **Lineage on card backs** (#17): currently crammed onto card back, needs to move to an "Extra Details" menu, keeping card back clean. UI polish, unrelated to v3.

---

## END OF SPEC — awaiting Director red-line
