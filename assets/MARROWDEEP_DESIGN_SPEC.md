# MARROWDEEP — Design Specification v1.0

**Working title.** Single-file vanilla HTML/CSS/JS PWA, mobile-first, no build step.
**Status:** Design complete through systems. Content authoring and tuning pending.
**Purpose of this document:** Complete handoff for implementation. Everything a builder needs to construct the game without further design decisions. Open items are explicitly marked in §16.

---

## 1. Design Pillars

These are the constraints every decision was measured against. If an implementation choice conflicts with one of these, the pillar wins.

1. **Rolling a character is the thrill.** Stats are dice, not numbers. Creation is dramatic and instant.
2. **Skill lives in assignment, not in rolling.** The player decides *who faces what*. The dice decide the rest.
3. **Target numbers never inflate.** TN 3–7 is the entire band, forever, at every depth. Difficulty scales through structure and pressure only.
4. **You are never sent away empty.** Every run pays out on at least one of three streams.
5. **Death is productive but permanent.** Characters do not resurrect. They convert into account-level assets.
6. **Never more than three cards to choose from.** Anything that would be a list gets rolled instead of chosen.
7. **This is not an idle game.** Nothing progresses while the app is closed. There is no timer, no waiting, no offline accrual.
8. **No per-item art, ever.** Identity comes from name and numbers. Art is shared by slot.

---

## 2. The Resolution Engine

### 2.1 The Die Ladder

Five rungs. This is the entire scale.

```
d4 → d6 → d8 → d10 → d12
```

| Die | Mean | Mean w/ Surge |
|---|---|---|
| d4 | 2.5 | 3.33 |
| d6 | 3.5 | 4.20 |
| d8 | 4.5 | 5.14 |
| d10 | 5.5 | 6.11 |
| d12 | 6.5 | 7.09 |

Each rung is worth almost exactly **+1 expected value**, with or without Surge. This linearity is load-bearing: it makes every upgrade legible and every point-cost calculation honest.

**Do not add a d20.** It jumps +4 over d12 and breaks the ladder, the point economy, and the TN band simultaneously.

### 2.2 Surge (Exploding Dice)

> Rolling the maximum value on a die triggers a **Surge**: roll the same die again and add the result. Surges chain indefinitely.

Surge does three jobs:

- Nothing is ever mathematically impossible. A d4 can clear TN 7.
- Small dice get compensating excitement — a d4 Surges 25% of the time.
- It preserves the +1-per-rung ladder rather than distorting it.

**Surge probability by die:** d4 25%, d6 16.7%, d8 12.5%, d10 10%, d12 8.3%.

### 2.3 The TN Band — Success Probability Master Table

**This table is permanently true and must never drift.** All values include Surge.

| Die | TN 3 | TN 4 | TN 5 | TN 6 | TN 7 |
|---|---|---|---|---|---|
| **d4** | 50.0% | 31.3% | 25.0% | 18.8% | 12.5% |
| **d6** | 66.7% | 50.0% | 33.3% | 22.2% | 16.7% |
| **d8** | 75.0% | 62.5% | 50.0% | 37.5% | 25.0% |
| **d10** | 80.0% | 70.0% | 60.0% | 50.0% | 40.0% |
| **d12** | 83.3% | 75.0% | 66.7% | 58.3% | 50.0% |

The 50% diagonal maps one-to-one onto the ladder: d4/TN3, d6/TN4, d8/TN5, d10/TN6, d12/TN7. This is the spine of the game's math. A designer can read difficulty directly off it.

**Resolution rule:** `roll (+ surges) + flat modifiers ≥ TN` is a success. Floors apply before modifiers.

### 2.4 Floors

> A **floor of F** on a die means any roll below F is treated as F.

| Configuration | Base EV | Floored EV | Gain |
|---|---|---|---|
| d8, floor 3 | 4.50 | 4.875 | +0.375 |
| d8, floor 4 | 4.50 | 5.25 | +0.75 |
| d10, floor 4 | 5.50 | 6.10 | +0.60 |
| d12, floor 4 | 6.50 | 7.00 | +0.50 |
| d12, floor 6 | 6.50 | 7.58 | +1.08 |

Floors give **less raw EV than a die step** but do something a die step cannot: **a floor at or above the TN is a guaranteed pass.** Floor 3 makes every TN 3 check automatic.

- **Floors = reliability.** Die size = ceiling.
- **Hard cap: floor may not exceed half the die** (d8 → max floor 4, d12 → max floor 6). Without this cap, trivial checks disappear from the game.
- Floors do not affect Surge. A floor cannot cause a Surge.

### 2.5 Flat Modifiers

**Hard cap: +3 total flat bonus per stat, from all sources combined.** Past +3, TN 5 becomes free and the game collapses. All depth beyond this cap must go into conditionals, rerolls, floors, and situational effects.

### 2.6 Push

> Before any roll, a character may take **1 Strain** to gain **+2** on that roll.

Declared before rolling. Unlimited uses, limited only by Strain capacity. This is the player's primary agency valve — it converts health into certainty.

---

## 3. Characters

### 3.1 The Four Stats

| Stat | Verbs | Failure Consequence |
|---|---|---|
| **MIGHT** | break, hold, haul, endure, force | **Self-contained.** The acting character takes the Strain. |
| **GRACE** | slip, climb, steal, aim, catch | **Exposure.** The next slot this stage gains the Ambush tag (+1 Strain on failure). |
| **WITS** | read, deduce, navigate, rig, recall | **Blindness.** TNs on the next stage are hidden. |
| **NERVE** | resist, defy, bargain, witness, refuse | **Contagion.** The entire party takes 1 Strain, not just the actor. |

Each stat fails *differently*. This is what makes a lopsided roster hurt in a specific, learnable way rather than generically.

- NERVE's party-wide failure makes it the stat you cannot leave uncovered.
- MIGHT's self-contained failure makes it the safe answer to an unknown check.

### 3.2 Character Creation

**One screen, one tap.** Two layers of identity, one decision.

1. Four stat dice roll independently on the ladder (RNG, weighted by account Renown — see §3.3)
2. An **Origin** is dealt (RNG, from unlocked pool)
3. Three **Callings** are dealt — **player picks one**

That is the entire creation flow. 8 Origins × 8 Callings = 64 base identities before gear or Traits.

### 3.3 Stat Roll Weights by Account Renown Tier

| Renown Tier | d4 | d6 | d8 | d10 | d12 | Avg Rung |
|---|---|---|---|---|---|---|
| 1 (start) | 35% | 30% | 20% | 10% | 5% | ~d6.4 |
| 3 | 25% | 28% | 25% | 15% | 7% | ~d7.1 |
| 5 | 18% | 25% | 28% | 20% | 9% | ~d7.6 |
| 7 | 14% | 22% | 29% | 23% | 12% | ~d8.0 |
| 10 | 10% | 20% | 30% | 25% | 15% | ~d8.3 |

Creation stays fully random forever — the D&D thrill of rolling a monster is preserved — but a veteran account rolls better monsters. Marrow purchases can additionally raise the *floor* of this roll per stat (see §8.3).

### 3.4 Base Character Values

| Property | Value |
|---|---|
| Base Toughness | **4** |
| Base Armor | 0 |
| Starting Strain | 0 |
| Traits | 0 |
| Scars | 0 |

> **Tuning note:** Toughness 4 is the single highest-leverage number in the game. It drives death rate more than any other value. Expose it as a constant and stress-test first. See §16.

---

## 4. Origins (Rolled — ~3 points each)

The "who you were" layer. Never chosen; always dealt. Each has one memorable mechanical hook so the set doesn't read as eight flavors of "+1."

| Origin | Effect |
|---|---|
| **Hearthborn** | Toughness +2. When you bench, one ally of your choice also clears 1 Strain. |
| **Ashwalker** | Begin each quest with one extra Common relic, rolled fresh. |
| **Fenwise** | WITS Surges on N−1 as well as N. |
| **Ironbound** | Armor +1. Every floor on your gear counts as 1 higher (respects the half-die cap). |
| **Straycall** | MIGHT and GRACE roll one rung higher at creation; NERVE rolls one rung lower. |
| **Lanternborn** | Once per stage, reveal one challenge's TN before assigning. |
| **Saltblood** | Your first Push each stage costs 0 Strain. |
| **Unmarked** | Roll a fifth die at creation; it replaces your lowest stat. |

**Lanternborn is deliberately not a stat bonus.** Information is power in an assignment puzzle. Having one Origin that pays in knowledge rather than numbers keeps the set structurally varied.

**Starting unlocked:** Hearthborn, Ashwalker, Fenwise, Straycall. The remaining four unlock via Marrow (§8.3).

---

## 5. Callings (Chosen from 3 dealt — ~4 points each)

The "what you do in the puzzle" layer. **Every Calling must change who you send where.** None of them are "roll better."

| Calling | Effect |
|---|---|
| **Vanguard** | Floor 4 on MIGHT. Take 1 less Strain from all attacks (minimum 0). |
| **Cutpurse** | First GRACE check each stage: roll twice, take the higher. |
| **Scholar** | After any failed check this stage, the next ally assigned gains +2. |
| **Zealot** | While at 2 or more Strain, gain +2 to every check. |
| **Warden** | Benching clears 3 Strain instead of 1. |
| **Gambler** | Reroll any one die per stage. The second result stands. |
| **Herald** | +1 when using the same stat the previous ally just used. |
| **Reaver** | A MIGHT Surge deals +2 Strain to the enemy (boss Aspects only). |

**Zealot is the design standout** because it inverts the Strain economy — a hurt Zealot is your best character, so the player must weigh letting her bleed. **Herald** rewards sequencing. **Scholar** turns a failure into a setup. **Warden** is intentionally mediocre at Depth I and becomes essential at Depth III when Strain persists (§9).

---

## 6. Traits and Scars

### 6.1 Traits — Choice as a Drip

> **Surviving a quest grants one Trait, chosen from 3 dealt.**

Same three-card interface. But now the choice is informed — the player knows this character is their d12 WITS specialist, so the WITS trait means something specific. This is how the game delivers deep customization without front-loading it the way D&D does.

**Trait pool (2–3 points each). Author more; these are the seed set.**

| Trait | Pts | Effect |
|---|---|---|
| Steady | 3 | Floor 3 on all four stats |
| Bloodhound | 2 | +2 on the final check of any stage |
| Unkillable | 3 | Once per quest, survive at 0 Strain. Dies normally thereafter. |
| Ironlung | 2 | Toughness +2 |
| Quickstudy | 2 | +1 to any stat you have not yet used this quest |
| Sure-Handed | 2 | Reroll natural 1s on all stats |
| Bulwark | 3 | Armor +2 |
| Grim | 2 | When an ally dies, gain +2 to all checks for the rest of the quest |
| Ninth Hour | 3 | +3 on any check during the boss stage |
| Untethered | 2 | Ignore the Ambush tag |
| Deepdrawn | 2 | Your Surge threshold drops by 1 on your highest-rung stat |
| Steadfast | 2 | Immune to the party-wide Strain from ally NERVE failures |

### 6.2 Scars — Characters Have a Lifespan

> **Every quest survived also inflicts a Scar: permanent −1 max Toughness.**

Veterans get stronger and more fragile simultaneously.

| Quests Survived | Traits | Base Toughness |
|---|---|---|
| 0 | 0 | 4 |
| 1 | 1 | 3 |
| 2 | 2 | 2 |
| 3 | 3 | 1 |
| 4 | 4 | 0 → **cannot deploy without Toughness gear** |

Toughness is recoverable through Traits (Ironlung), gear (Chest slot), and Origins (Hearthborn), so it is a treadmill a player can partly outrun — but the trend runs one direction. **Expected career: 4–7 quests.**

This solves the immortal-god problem without a level cap, keeps roster churn flowing so Legacies keep generating, and makes death feel *earned* rather than arbitrary.

### 6.3 The Retire-or-Run Decision

This is the endgame tension, and it emerges naturally around quest 15 with no new systems.

| Action | Marrow Payout | Legacy |
|---|---|---|
| **Retire** (voluntary, between quests) | 2 + 1 per Trait | Yes, guaranteed |
| **Death** (in quest) | 1 | Yes |

A 4-Trait veteran is worth **6 Marrow** retired versus **1** if she dies. Taking a scarred veteran out one more time gambles four quests of income against one more haul of relics.

---

## 7. Quest Structure

### 7.1 Team Size and Slots

- **Roster:** 3 characters deployed (expandable to 8 owned via Marrow; 3 deploy per quest)
- **Each stage presents 2 challenge slots**
- **The third character benches** and clears 1 Strain (3 with Warden)

Six meaningful assignments per stage, two cards on screen. "Who rests" is a genuinely hard call when everyone is hurt. This is the phone-sized version of the assignment puzzle — 3 was too crowded on screen, 2 had too few permutations to be a real decision.

### 7.2 The Six Challenge Shapes

All 12 checks in a Depth I quest are built from these six shapes.

| Shape | Structure | TN | Frequency |
|---|---|---|---|
| **Gate** | One check, one named stat | 4–5 | ~50% of slots |
| **Chain** | Two checks, **same character**, both must pass | 3 then 4 | ~12% |
| **Relay** | Two checks, **two different characters**, both must pass | 4 and 4 | ~12% |
| **Vault** | Player chooses the stat, TN 7. Large relic reward. | 7 | ~10% |
| **Toll** | Pay 1 Strain to attempt. TN 3. | 3 | ~8% |
| **Open** | Any stat, TN 3 | 3 | ~8% |

**Chain and Relay are the structural answer to roster-stacking:**
- **Chain** says *one great character is not enough for this* (locks your best in for both checks)
- **Relay** says *one great character cannot be everywhere* (requires two functional bodies)

If a stage rolls Relay + Relay, all four available assignments are consumed and nobody benches.

**Open** is the safe parking spot for a hurt character. **Toll** is nearly free reward if you have Strain to spare.

### 7.3 Stage Composition (Depth I)

| Stage | Slot Composition | Strain per Failure |
|---|---|---|
| 1–2 | Gate + (Open or Toll) | 1 |
| 3–4 | Gate + (Chain, Relay, or Vault) | 1 |
| 5 | Two of: Gate, Chain, Relay | 2 |
| 6 | **Boss** (see §7.5) | 2–3 |

### 7.4 Stat Frequency Curve

WITS and GRACE lean early; MIGHT and NERVE lean late. A WITS-heavy party cruises stages 1–3 and hits a wall — which is the intended feeling, because the wall was **predictable** and the player could have prepared for it.

| Stage | MIGHT | GRACE | WITS | NERVE |
|---|---|---|---|---|
| 1–2 | 15% | 35% | 35% | 15% |
| 3–4 | 25% | 25% | 25% | 25% |
| 5 | 35% | 15% | 15% | 35% |
| 6 (boss) | Fixed by Aspect | | | |

### 7.5 Boss Structure — The Aspect Lock

This is the mechanism that makes the roster puzzle matter.

> A boss has **three Aspects**, each with a locked stat, a TN, and a Toughness value. All three must be broken. Each round, **all three characters act** — nobody benches at the boss.

**Example:**

```
THE DROWNED GATE
  Grasping Chains    — MIGHT, TN 5, Toughness 3
  Choir of the Sunk  — NERVE, TN 5, Toughness 3
  Shifting Locks     — WITS,  TN 4, Toughness 4

  Each round, every unbroken Aspect deals 2 Strain to the party.
```

**Damage rule:** Beating an Aspect check deals damage equal to your **surplus** — `roll − TN`, minimum 1. A d12 NERVE rolling 9 against TN 5 deals 4 and breaks the Choir in one hit. A failed check deals nothing.

**The clock is the punishment.** Every round the boss survives costs the party 2 Strain *per surviving Aspect*. A balanced roster breaks all three in 2–3 rounds and walks out at half health. A roster with no NERVE character grinds the Choir for five rounds while all three Aspects chew through everyone. It is winnable — via Push, Vault-won gear, floors — but it will cost a character.

**Boss construction rules:**
- Aspects always demand **three different stats**, never repeating
- The fourth stat is deliberately absent, so no single build is mandatory
- Which three stats vary by boss, so players prepare a **roster**, not a solution
- Aspect Toughness 3–4 at Depth I, scaling to 5–6 at Depth V

---

## 8. Economy

### 8.1 Two Currencies

Splitting the currency is essential — one currency creates one obvious optimal purchase and kills the decision.

| Currency | Source | Role |
|---|---|---|
| **Renown** | Per stage cleared | Flow currency. Expected to zero out constantly. |
| **Marrow** | Character death and retirement **only** | Scarce currency. The real progression. |

**The critical property:** the thing that makes you permanently stronger comes only from losing characters. A player can grind Renown forever and stay flat. Marrow is gated behind emotional cost.

### 8.2 Renown

**Income:** ~35 per completed Depth I quest. ~12 on an early wipe. ×1.5 per Depth tier.

| Purchase | Cost | Effect |
|---|---|---|
| **Reforge** | 15 | Reroll one affix line on a relic. Same point value, new affix. |
| **Commission** | 40 | Deal 3 relics of a chosen slot, keep 1. |
| **Recruit** | 25 | Roll a new character. Bodies are not the bottleneck. |
| **Redeal** | 10 | See three new Callings on a fresh character. |
| **Mend** | 20 | Clear all Strain across the roster before a quest. |
| **Excise a Scar** | 60 | Remove one Scar. **Once per character, ever.** |
| **Ward Shelf slot** | 30, +15 each | Storage for situational Sigil-Wards. |

A good run buys a Commission **or** a Scar excision — not both. **Excise** is the most interesting purchase: nearly two runs' income spent to buy one more quest out of a veteran who might die immediately.

### 8.3 Marrow

**Income:** ~1.5 per quest (≈0.4 deaths + retirements). ×1.3 per Depth tier.

| Purchase | Cost | Effect |
|---|---|---|
| **Raise creation floor** | 3 | One named stat can never roll below d6 at creation. Account-wide, permanent. Repeatable to d8 for 6. |
| **Roster slot** | 4, +2 each | Expand owned characters 3 → 8. |
| **Legacy slot** | 2 | +1 to how many Legacies deal into the Calling choice. |
| **Unlock Origin** | 5 | Add one of the four locked Origins to the creation pool. |
| **Consecrate a Legacy** | 6 | That Legacy is dealt **guaranteed**, not shuffled. |

A roster slot is three runs of work. That is the correct pace — every Marrow purchase should be felt.

### 8.4 The Three Reward Streams

**No run ever pays zero.**

| Stream | Trigger | Per Run (Depth I) |
|---|---|---|
| Renown | Per stage cleared | Always. ~35% of full value even on a stage-2 wipe. |
| Relics | Per stage cleared | 3–5 drops, ~1 genuine upgrade |
| Legacies | Character death | ~0.4 per run |

### 8.5 Legacies — Death Feeds the Character Pool

> When a character dies, they are **interred**. Their Calling becomes a permanent card in the account pool. Their name and cause of death are recorded on the Hall wall.

**Legacies deal into the three-card Calling choice for new characters.** A hundred hours in, the player is not choosing from the base eight — they are choosing between a stock Calling and *the ability that belonged to the Zealot who died at the Drowned Gate.*

The interface never changed. Still three cards. But the cards are the player's own history now.

### 8.6 Expected Death Rates (Depth I)

A quest is 12 checks. Well-assigned characters average ~70% success, producing ~4 failures spread across 3 characters (~1.33 each) at Toughness 4.

| Outcome | Probability |
|---|---|
| Per-character death | 12–15% |
| At least one death per run | ~35% |
| Full wipe | ~8% |

Skilled assignment raises the average check to ~75% and cuts per-character death to ~22% at-least-one-death. **That gap is the skill expression.** The RNG floor guarantees a good player still buries someone occasionally.

---

## 9. The Depths — Content Scaling

TNs stay locked at 3–7 forever. Difficulty scales through **structure and pressure only.**

| Depth | Unlock | Changes |
|---|---|---|
| **I — Verge** | Start | 6 stages, 1 boss, Strain 1–2 per failure |
| **II — Hollows** | 3 quests | 8 stages, 2 bosses. Chain and Relay frequency doubles. |
| **III — Undertow** | 10 quests | 8 stages. **Strain does not clear between stages.** Benching is the only recovery. |
| **IV — The Silt** | 25 quests | Boss Aspects gain a 4th. Vaults become mandatory to advance past certain stages. |
| **V — Marrowdeep** | 50 quests | **No recruiting mid-quest.** Death is permanent for the run. Relics drop at Relic rarity only. |

**Undertow is the pivot point.** Once Strain persists across stages, the bench slot stops being a throwaway and becomes the most important assignment on the board. The entire puzzle re-centers on triage. Warden goes from mediocre to essential. This is a genuine strategic re-learning at roughly hour 10, delivered without a single new rule.

**Depth rewards:** Renown ×1.5 per tier, Marrow ×1.3 per tier, relic point budgets increase per §11.3.

---

## 10. Sigils — Per-Quest Modifiers

Each Depth attaches 1–3 **Sigils** to a quest. **Rolled and displayed before the player commits.**

| Sigil | Effect |
|---|---|
| **Hollow Air** | Surge is disabled |
| **Rustbound** | Armor counts as 0 |
| **Shivering** | All floors are ignored |
| **Press-gang** | No benching. The third character takes 1 Strain per stage instead. |
| **Thin Ice** | The first failure each stage costs 2 Strain |
| **Blindfold** | All TNs are hidden until after assignment |

**Sigils are the reason gear diversity matters.** A Shivering quest makes a floor-stacked reliability character worthless and a d12 gambler the star. Because Sigils are visible before entry, building a stash of situational gear is directly rewarded — this delivers the Path of Exile loadout loop through **gear swapping** rather than skill trees.

Sigil count by Depth: I → 0–1, II → 1, III → 1–2, IV → 2, V → 2–3.

---

## 11. Gear System

### 11.1 The Eight Slots

**Every slot owns a mechanic.** A player should know what a relic does from where it goes, before reading a word.

| Slot | Owns | Signature Affixes |
|---|---|---|
| **Head** | Floors | Floor 3 on a stat, floor at half-die, "floors count as +1" |
| **Chest** | Toughness & Armor | +Toughness, +Armor, flat Strain reduction |
| **Hands** | Die steps | Step a stat up one rung, lowered Surge threshold |
| **Feet** | Positioning | Bench value, Relay bonuses, "count as benched once" |
| **Weapon** | Surplus damage | +damage to Aspects, Surge riders, Reaver-style triggers |
| **Charm** | Rerolls | Reroll 1s, reroll one die per stage, roll-twice-take-higher |
| **Sigil-Ward** | Anti-Sigil | Immunity or partial relief from one named Sigil |
| **Token** | Conditionals | TN-dependent, Strain-dependent, stage-dependent oddities |

**Head and Hands** are the floors-versus-ceilings axis given physical homes. A player learns in ten minutes that Head means reliability and Hands means power, and never has to be told.

**Sigil-Ward is the stash slot** — the only slot expected to be swapped between quests. *Ward of Still Air* (Surge functions despite Hollow Air) is worthless nine runs in ten and run-saving on the tenth. This single slot creates the entire "chest full of situational gear" behavior without a deep inventory system. The player maintains one shelf, not eight.

**Token is the release valve.** Anything that does not fit the taxonomy goes there, so the other seven stay clean.

### 11.2 Affix Point Costs

**1 Point ≈ +0.5 EV ≈ +6% success at TN 5.** Every affix is priced in this unit.

| Affix | Pts | Valid Slots |
|---|---|---|
| +1 flat to one stat (cap +3 total) | 2 | Token, Hands, Weapon |
| Floor 3 on one stat | 1 | Head |
| Floor at half-die on one stat | 2 | Head |
| Floors count as +1 | 3 | Head |
| Step one stat up one rung | 3 | Hands |
| Surge on N−1 as well as N | 2 | Hands, Weapon |
| Armor +1 | 2 | Chest |
| Toughness +1 | 1 | Chest |
| Take 1 less Strain from attacks | 3 | Chest |
| Reroll natural 1s on one stat | 1 | Charm |
| Reroll one die per stage | 3 | Charm |
| Roll twice take higher, once per stage | 3 | Charm |
| Benching clears +1 Strain | 2 | Feet |
| +1 to both characters in a Relay | 2 | Feet |
| Count as benched once per quest | 3 | Feet |
| +1 surplus damage vs Aspects | 2 | Weapon |
| Surge vs an Aspect deals +2 | 2 | Weapon |
| Immunity to one named Sigil | 3 | Sigil-Ward |
| Partial relief from one named Sigil | 2 | Sigil-Ward |
| **Conditional:** +2 vs TN 6+ | 2 | Token |
| **Conditional:** +1 while at 2+ Strain | 1 | Token |
| **Conditional:** +2 on first check of a stage | 2 | Token |
| **Conditional:** +2 on final check of a stage | 2 | Token |
| **Conditional:** +1 per dead ally | 1 | Token |

### 11.3 Rarity and Point Budgets by Depth

| Depth | Common | Uncommon | Rare | Relic |
|---|---|---|---|---|
| I | 2 | 3 | 4 | 6 |
| II | 2 | 3 | 5 | 7 |
| III | 2 | 4 | 6 | 8 |
| IV | — | 4 | 6 | 9 |
| V | — | 4 | 7 | 10 |

**Relic rarity additionally receives one named unique modifier** drawn from a hand-authored list — the "unique item" tier.

### 11.4 Drop Weights

| Depth | Common | Uncommon | Rare | Relic |
|---|---|---|---|---|
| I | 60% | 28% | 10% | 2% |
| II | 45% | 35% | 16% | 4% |
| III | 25% | 42% | 26% | 7% |
| IV | 10% | 45% | 34% | 11% |
| V | 0% | 45% | 40% | 15% |

Same items, better rolls. This is the Diablo 2 curve.

### 11.5 The Gear Ceiling Check

8 slots × ~8 points = **64 points** if perfectly geared at Depth V. But:

- Flat bonuses cap at **+3 per stat**
- Floors cap at **half the die**
- Armor and Toughness have diminishing structural value

Therefore most of that budget **must** flow into conditionals, rerolls, positioning, and Sigil-Wards. **The caps are what force build diversity.** A player physically cannot spend 64 points on raw power. This is the mechanism that keeps TN 3–7 honest at hour 200.

### 11.6 Procedural Naming

```
[Prefix] [Base] of [Suffix]
```

- **Prefix** — drawn from the highest-point affix's word list
- **Base** — drawn from the slot's base-name list (6 per slot)
- **Suffix** — drawn from the second-highest affix's word list

Examples: *Ironbraced Gauntlets of the Ninth Hour*, *Silted Coronet of Still Water*, *Grim Halfplate of the Drowned*.

12 prefixes × 6 bases per slot × 12 suffixes = **864 names per slot** from three small word lists. That is full Diablo texture for roughly forty lines of data.

---

## 12. Art Inventory

**Total: ~76 assets.** 46 of them are icons drawable in a consistent flat style in a single sitting each. Realistic estimate: **two to three weeks** of art at a comfortable pace — achievable precisely because the design refuses per-item art.

| Category | Count | Notes |
|---|---|---|
| **Card frames** | 4 | Character, Relic, Challenge, Aspect. Rarity is border color only. |
| **Stat glyphs** | 4 | Highest-visibility assets in the game. Make these excellent. |
| **Die shapes** | 5 | d4 d6 d8 d10 d12 |
| **Challenge shape icons** | 6 | Gate, Chain, Relay, Vault, Toll, Open |
| **Slot glyphs** | 8 | One per gear slot |
| **Sigil marks** | 6 | One per Sigil |
| **Status/UI icons** | 9 | Strain, Armor, Scar, Renown, Marrow, Surge, Floor, Push, Bench |
| **Character portraits** | 8 | One per Origin, silhouette style. Recolored by Calling. |
| **Relic art** | 8 | One per slot, tinted by rarity. **Never per-item.** |
| **Boss Aspect art** | 15 | 3 per boss × 5 launch bosses |

**Portrait rule:** Origin drives the portrait silhouette; Calling drives palette and one overlay element. 8 portraits, not 64.

**Relic art rule:** Diablo 2 shipped shared icons across whole item classes and nobody minded, because the *name* and the *numbers* carry identity. Same principle here.

**Visual direction:** Flat vector. Tight palette. No perspective. No animation heavier than a die tumble and a number pop.

---

## 13. Screens

Five screens. **No inventory grid.**

| Screen | Contents |
|---|---|
| **Quest** | Two challenge cards, three character cards, assign by tap |
| **Boss** | Three Aspect cards, three character cards, round counter, party Strain bar |
| **Roster** | 3–8 character cards, tap through to Character |
| **Character** | Portrait, four stat dice, eight gear slots, Traits, Scars, Toughness/Strain |
| **Hall** | Renown and Marrow spending, Legacy wall, Depth select, Ward Shelf |

**Gear lives on characters or on the Ward Shelf. Nothing else.** Unwanted drops convert to Renown on the spot at the drop screen. This eliminates the single largest UI burden in the ARPG genre at zero cost, because the stash fantasy is satisfied specifically and only by the Ward Shelf.

### 13.1 Session Shape

| Depth | Assignments | Duration |
|---|---|---|
| I | ~12 + boss | 4–6 minutes |
| III | ~16 + 2 bosses | 8–9 minutes |

Phone-length sessions ending at a natural stopping point. The retire-or-run-again decision is the hook that starts the next one.

---

## 14. Data Schemas

```js
// ---- CHARACTER ----
{
  id: "chr_a19f",
  name: "Vessa Orn",              // procedural
  origin: "fenwise",
  calling: "zealot",              // or legacy id
  stats: { might: 8, grace: 6, wits: 12, nerve: 8 },  // die sizes
  traits: ["bloodhound", "ironlung"],
  scars: 2,
  gear: {
    head: "rel_0a3", chest: null, hands: "rel_119",
    feet: null, weapon: "rel_204", charm: null,
    sigilWard: null, token: "rel_88f"
  },
  strain: 0,
  questsSurvived: 2,
  status: "alive"                 // alive | dead | retired
}

// ---- RELIC ----
{
  id: "rel_0a3",
  slot: "head",
  rarity: "rare",                 // common|uncommon|rare|relic
  points: 6,
  name: "Ironbraced Coronet of Still Water",
  affixes: [
    { key: "floor_half", stat: "wits", pts: 2 },
    { key: "floor_flat3", stat: "nerve", pts: 1 },
    { key: "cond_tn6plus", value: 2, pts: 2 },
    { key: "toughness", value: 1, pts: 1 }
  ],
  unique: null                    // relic rarity only
}

// ---- CHALLENGE ----
{
  shape: "chain",                 // gate|chain|relay|vault|toll|open
  checks: [
    { stat: "grace", tn: 3 },
    { stat: "grace", tn: 4 }
  ],
  strainOnFail: 1,
  tags: [],                       // "ambush"
  reward: { renown: 6, relicRolls: 1 },
  text: "The lattice gives under your weight, then gives again."
}

// ---- BOSS ----
{
  id: "drowned_gate",
  name: "The Drowned Gate",
  aspects: [
    { name: "Grasping Chains",   stat: "might", tn: 5, toughness: 3 },
    { name: "Choir of the Sunk", stat: "nerve", tn: 5, toughness: 3 },
    { name: "Shifting Locks",    stat: "wits",  tn: 4, toughness: 4 }
  ],
  strainPerAspectPerRound: 2
}

// ---- ACCOUNT ----
{
  renown: 0,
  marrow: 0,
  renownTier: 1,
  questsCompleted: 0,
  depthUnlocked: 1,
  rosterSlots: 3,
  legacySlots: 2,
  originsUnlocked: ["hearthborn","ashwalker","fenwise","straycall"],
  creationFloors: { might: 4, grace: 4, wits: 4, nerve: 4 },
  legacies: [
    { id:"leg_01", calling:"zealot", charName:"Vessa Orn",
      diedAt:"The Drowned Gate", consecrated:false }
  ],
  wardShelf: [],
  wardShelfSlots: 0
}
```

---

## 15. Build Order

Build in this sequence. Each stage is independently testable and each depends only on what precedes it.

1. **Dice engine.** `roll(die, floor, mods)` with Surge. Write a 100,000-iteration harness that reproduces the §2.3 master table exactly. **Do not proceed until it matches.**
2. **Character generation.** Stat rolls, Origin deal, three-Calling deal. Renown-tier weighting.
3. **Challenge resolution.** All six shapes. Strain application. The four failure consequences.
4. **Quest loop.** Six stages, assignment UI, bench, Push. Depth I only.
5. **Boss.** Aspect lock, surplus damage, per-round party Strain.
6. **Death and Legacy.** Interment, Legacy generation, Hall wall.
7. **Gear generation.** Affix tables, point budgets, procedural naming, drop rolls.
8. **Economy.** Renown and Marrow, both purchase menus.
9. **Traits and Scars.** Post-quest Trait deal, Scar accrual, retirement.
10. **Depths II–V.** Structural changes only, no new mechanics.
11. **Sigils and the Ward Shelf.**
12. **Content authoring.** Challenge text pool, 5 bosses, unique-modifier list.

### Balance Harness (build alongside step 4)

A headless simulator that runs 10,000 quests with a scripted "reasonable player" assignment policy and reports:

- Per-character death rate (target **12–15%**)
- At-least-one-death rate (target **~35%**)
- Full wipe rate (target **~8%**)
- Mean Renown per run (target **~35**)
- Mean Marrow per run (target **~1.5**)
- Mean character career length (target **4–7 quests**)

**Every constant that feeds these targets must live in a single `BALANCE` object.** Tuning happens there and nowhere else.

---

## 16. Open Items

These are the things deliberately left unfixed. They need playtesting or authoring, not more design.

| Item | Status |
|---|---|
| **Base Toughness = 4** | **Highest-risk number in the game.** Drives death rate more than anything else. Stress-test first via the harness; expect to land between 3 and 5. |
| Challenge text pool | Needs authoring. Target ~40 entries per stat per shape for non-repetition across a 20-quest span. |
| Boss roster | 5 needed at launch. Only The Drowned Gate is written. |
| Unique modifier list | Relic-rarity named effects. Hand-authored, ~20 needed. |
| Trait pool | 12 seeded. Wants ~24 so the three-card deal feels fresh at quest 10. |
| Name word lists | 12 prefixes, 12 suffixes, 6 bases × 8 slots. Not yet written. |
| Depth IV Vault gating | "Mandatory to advance" needs a precise rule. |
| Sigil stacking | Whether two Sigils can be mutually crippling (Hollow Air + Shivering) or need an exclusion table. |

---

## 17. Anti-Goals

Recorded explicitly so they do not creep back in during implementation.

- **Not an idle game.** No offline progress, no timers, no waiting.
- **No resurrection.** Dead is dead. Legacies are the only continuity.
- **No TN inflation.** The band is 3–7 at every depth, forever.
- **No d20.**
- **No inventory grid.**
- **No per-item art.**
- **No choice screen with more than three options.**
- **No universe-blending or gimmick rules layered on later.** If a new mechanic cannot be expressed through the existing six shapes, six Sigils, and eight slots, it does not go in.
