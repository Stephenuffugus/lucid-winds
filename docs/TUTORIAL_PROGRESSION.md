# Lucid Winds — Tutorial Progression (Lv 1 → Lv 10)
**Status:** Draft for director review · 2026-04-13
**Author:** Claude Code (Lead Developer)

---

## Design principles

1. **One thing at a time.** A level unlocks at most one new action. Stacking 3 features on one level = noise.
2. **The action that leveled you should be the action you level into.** If you just minted your first plant and hit Lv 3, the Lv 3 unlock should reward that — not pull you somewhere new.
3. **Natural pacing.** Each unlock should be ≈ 3–8 minutes of play apart. Not "grind for an hour." Not "every 30 seconds."
4. **No menus, no tutorials.** A toast + keeper-bar sparkle + a subtle new button is the whole UI.
5. **Every unlock is a privilege, not a checklist item.** The copy reads "*You can now…*" — the world opened, not a task completed.
6. **Nothing important is hidden behind a class.** Classes flavor *how* you play, not *what* you can play.

---

## XP economy reference (current, verified)

### Level thresholds (cumulative, from `RANKS[]`)

| Level | Title           | Total XP | ΔXP from prev |
|-------|-----------------|----------|---------------|
| 1     | Seedling        | 0        | —             |
| 2     | Sprout          | 25       | 25            |
| 3     | Young Shoot     | 75       | 50            |
| 4     | Budding         | 175      | 100           |
| 5     | Tender          | 350      | 175           |
| 6     | Grower          | 600      | 250           |
| 7     | Cultivator      | 950      | 350           |
| 8     | Forager         | 1400     | 450           |
| 9     | Gardener        | 2000     | 600           |
| 10    | Naturalist      | 2800     | 800           |

### XP sources (what the player actually earns)

| Action                                 | XP       | Notes                                      |
|----------------------------------------|----------|--------------------------------------------|
| Each sunbeam earned (game win)         | × 2      | via `earnHashes` → `PW_grantXP`            |
| Each Dew earned                        | × 1      | via `earnDew` → `PW_grantXP`               |
| Bloom a Common plant                   | 10       | fixed                                      |
| Bloom an Uncommon                      | 15       | implied (current code = 10, upgrading)     |
| Bloom a Rare                           | 20       |                                            |
| Bloom an Epic                          | 25       |                                            |
| Bloom a Legendary                      | 40       |                                            |
| Bloom a Mythic                         | 60       |                                            |
| Bloom a Cosmic                         | 100      |                                            |
| **First plant ever** milestone         | **50**   | one-time, triggers on first bloom          |
| First Uncommon (kind)                  | 25       |                                            |
| First Rare (kind)                      | 75       |                                            |
| Water own wild plant                   | 3        |                                            |
| Cross-pollinate (wild or greenhouse)   | 5        |                                            |
| Water stranger's plant                 | 5        |                                            |
| Tend stranger's plant                  | 10       |                                            |
| Pattern named                          | 15       |                                            |
| Feral collected                        | 2 Dew → 2 XP + class XP |                             |

### First-plant trajectory (the golden path)

A new player who logs in, plays the intro cinematic, and gets a gift plant will be at **Lv 2 immediately** (gift plant = 10 bloom XP + 50 first_plant milestone = 60 XP, past Lv 2's 25).

**Realistic first-session trajectory:**
- Play 1 game → ~4 sunbeams (8 XP)
- Play 8 games → ~30 sunbeams (60 XP) + mints second plant (10–40 bloom XP)
- Net after ~10 mins: **Lv 3 (75 XP)** ✓

So **Lv 3 is reachable in the first session without any coaching.** Lv 5 is one evening of play. Lv 7 is a few days.

---

## The progression ladder

Each level has **one headline unlock** and an optional small bonus. Copy for the level-up toast is given.

### Lv 1 — Seedling (starting state)
- **Can:** Play mini-games in the GAME tab. Collect sunbeams.
- **Cannot:** Mint plants yet (30 sunbeams needed), access Wild, open Nursery.
- **Onboarding cinematic** gives a gift plant, so player enters GREENHOUSE with 1 plant already.
- **First toast:** *"Welcome, Seedling. Play the pattern games — every win is a sunbeam. Collect 30 to grow your next plant."*
- **Tabs visible:** GAME, GREENHOUSE. WILD and NURSERY hidden.

### Lv 2 — Sprout (25 XP — ~1 minute of play)
- **Unlock:** **NURSERY tab** appears with a gentle glow.
- **Toast:** *"Sprout. You can now open the Nursery — where seeds grow into plants."*
- **Rationale:** They just experienced the minting bar. The Nursery is where their *next* plant comes from. Natural next place.

### Lv 3 — Young Shoot (75 XP — ~10 minutes of play)
- **Unlock:** **WILD tab** appears.
- **Bonus:** First wild drop allowance (1 plant can be placed in the world).
- **Toast:** *"Young Shoot. The world opens to you. Tap WILD to walk — plant one of your garden's children somewhere real."*
- **Rationale:** By this point they have 2+ plants. Dropping one doesn't deplete their garden. This is the first "the game leaves your screen" moment.

### Lv 4 — Budding (175 XP — ~20 minutes of play)
- **Unlock:** **Feral seeds become collectable** (they exist in the wild before, but the "COLLECT" button is gated).
- **Bonus:** Second daily wild drop.
- **Toast:** *"Budding. Wild seeds now respond to you. Walk close to any feral seed (within 75m) and collect it — they grow differently than garden stock."*
- **Rationale:** Ferals are the hook into the daily loop. Before Lv 4 the player might not even notice them. At Lv 4 they matter.

### Lv 5 — Tender (350 XP — ~45 minutes of play)
- **Unlock:** **Tend stranger plants** (already implemented).
- **Bonus:** **Backpack reveals** — hold-to-release interaction becomes discoverable.
- **Toast:** *"Tender. You care for your own, now you can care for others'. Walk within 75m of any stranger's wild plant to water or tend it for Dew."*
- **Rationale:** The first "I am part of a community" moment. Previous levels were solo. This is the social hook.

### Lv 6 — Grower (600 XP — ~1.5 hours of play)
- **Unlock:** **Mystery Box, Slots, and Weather buttons appear on the keeper bar.**
- **Bonus:** 3rd daily wild drop (current MAX_DROPS=3 default).
- **Toast:** *"Grower. Three gifts arrive: a mystery box, a slot machine, and the power to summon weather. All take Dew — spend wisely."*
- **Rationale:** These are *sinks*. They shouldn't distract a new player. By Lv 6 the player has a Dew balance worth burning.

### Lv 7 — Cultivator (950 XP — ~2–3 hours of play)
- **Unlock:** **CHOOSE YOUR CLASS** + greenhouse breeding.
- **Bonus:** Full Book of Secrets CLASS tab becomes the auto-open target.
- **Toast:** *"Cultivator. You've seen enough to know what calls to you. Open the Book of Secrets — five paths await. Choose one."*
- **Rationale:** By Lv 7 the player has tried games, planted wild, collected ferals, tended strangers. They have enough *self-knowledge* to pick a path that feels right — not one that *sounds* good.

### Lv 8 — Forager (1400 XP — ~4–5 hours of play)
- **Unlock:** **Class XP starts accumulating visibly** (bar on avatar). Tool XP for shears/can/pouch/compass begins tracking.
- **Bonus:** Feral collection cooldown drops from 2min to 90sec on failure.
- **Toast:** *"Forager. Your path reveals its tools. Check the Book of Secrets — your class XP is building."*

### Lv 9 — Gardener (2000 XP — ~6–7 hours of play)
- **Unlock:** **Nursery Shop POTS tab unlocks.**
- **Bonus:** Nursery slot #4 unlocks (currently 3).
- **Toast:** *"Gardener. The nursery yields more. Specialty pots are now available — apply one to a growing seed for a bloom-time boost."*

### Lv 10 — Naturalist (2800 XP — ~8–10 hours of play)
- **Unlock:** **Nursery Shop BOOSTERS tab unlocks** (Pollen Rush, Bloom Tonic, Dew Cache — the Dew sinks).
- **Bonus:** **Fruit harvest** on stranger plants (already implemented).
- **Toast:** *"Naturalist. You can now harvest ripe fruit from any stranger's wild plant. And the nursery begins to sell tonics — temporary power for a patient keeper."*

---

## What the player experiences in the first 60 minutes

| Time  | Level | What happened                                                |
|-------|-------|--------------------------------------------------------------|
| 0:00  | Lv 1  | Onboarding, gift plant, lands in Greenhouse                 |
| 0:30  | Lv 2  | Nursery tab appears                                          |
| 5:00  | Lv 2  | Plays games, watches sunbeam bar fill                        |
| 7:00  | Lv 2  | Mints 2nd plant (from sunbeams OR from the gift seed sprouting) |
| 10:00 | Lv 3  | WILD tab appears → "the world opens"                         |
| 15:00 | Lv 3  | Drops first wild plant in real GPS location                  |
| 25:00 | Lv 4  | Ferals collectable; finds + collects first feral             |
| 30:00 | Lv 4  | Second wild drop                                             |
| 45:00 | Lv 5  | Tends stranger plant; sees first community loop              |
| 60:00 | Lv 5→6 | Approaching keeper-bar sinks                                |

**One hour in, they've seen every tab, every core loop, and still don't have access to classes, pots, boosters, or class items.** Every subsequent level adds one more surface — and they're already hooked.

---

## Implementation plan

### Phase 1 — Gate what exists
- Move current Lv 5/7/10/12/15/19/23/25 gates to new Lv 2/3/4/5/6/7/8/9/10 structure
- Tab visibility: NURSERY hidden pre-Lv 2, WILD hidden pre-Lv 3
- Feral "COLLECT" button disabled with "Lv 4 to collect" chip below
- Mystery/Slots/Weather keeper-bar buttons appear at Lv 6
- Nursery Shop POTS tab gated Lv 9, BOOSTERS tab Lv 10, CLASS tab visible anytime after class picked

### Phase 2 — Milestone ceremony
- Wire a `window._lwLevelCeremony(newLvl)` that runs on level-up with the unlock toast + visual highlight (pulse the new button/tab for 15 sec so the player *sees* what appeared)
- Replace the existing level-up toast with this ceremony for levels 2–10 specifically

### Phase 3 — Re-tune XP grants (if needed)
After live testing, adjust:
- Bloom XP ramp (currently Common 10 / Rare 40 / Cosmic 100 — good)
- Milestone first-plant 50 — keep
- Game win sunbeam → XP multiplier (currently ×2) — monitor; may drop to ×1.5 if players outrun the gate

### Phase 4 — Tell the story
- Keeper-bar XP bar shows the NEXT unlock inline when within 50 XP of level-up: *"175 XP until WILD opens"*. Tiny label below the XP bar.

---

## Numbers summary for director

| Level | XP to reach | What unlocks                                 |
|-------|-------------|----------------------------------------------|
| 2     | 25          | NURSERY tab                                  |
| 3     | 75          | WILD tab + first wild drop allowance         |
| 4     | 175         | Feral collection + 2nd daily drop            |
| 5     | 350         | Tend strangers + backpack hold-to-release    |
| 6     | 600         | Mystery/Slots/Weather + 3rd daily drop       |
| 7     | 950         | **Pick your class** + greenhouse breeding    |
| 8     | 1400        | Class/tool XP visible; faster feral cooldown |
| 9     | 2000        | Nursery Shop POTS + nursery slot #4          |
| 10    | 2800        | Nursery Shop BOOSTERS + fruit harvest        |

**Everything Lv 11+ is existing design** (nursery merge breed, wild cuttings, Book of Secrets pages, 4th daily drop, Master Keeper). No changes needed there.

---

## Open questions for director

1. **NURSERY pre-Lv 2:** the gift plant flow assumes Nursery is visible immediately (to see the seed). Do we hide the tab but leave the seed "invisible" in the system, or show the tab from Lv 1 with a hint?
2. **Feral collection at Lv 4:** currently ferals spawn for everyone. Should ferals *spawn* before Lv 4 (but be uncollectable) so the player sees them and builds anticipation, or should they not appear at all?
3. **Should Lv 6 split into two (add slots at Lv 6, weather at Lv 8)?** Currently bundles 3 things. Could space them.
4. **XP multiplier tuning:** current `earnHashes` grants ×2 XP per sunbeam. Acceptable? Or should we drop to ×1.5 and reward exploration (ferals, strangers) more?
