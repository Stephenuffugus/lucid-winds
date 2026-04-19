# Lucid Winds — Companion + Item Ability Sweep (DRAFT for cross-check)

**Date:** 2026-04-19
**Status:** DRAFT — awaiting parallel-team (ChatGPT/Gemini) review + Director sign-off
**Source:** Synthesized from 8 family proposals + items deep-pass. See `/.claude/.../memory/project_*_proposal.md` for per-family notes.

---

## 1. GAME BRIEF (for outside reviewers)

Lucid Winds is a single-file vanilla JS botanical collection game where players earn unique procedural plants by playing pattern games. Plants live in:
- **Greenhouse** (collection)
- **Nursery** (3-day seed growth)
- **Wild** (real-world Leaflet map, GPS-planted, contestable by other players)

Every plant has 1 companion creature derived from its hash. There are 60 companion slots (~50 named animals across 8 families).

---

## 2. ARCHITECTURE — three layers per companion

1. **Family kit** — every creature belongs to one of 8 families. Each family has a T2 active ability + T3 passive ritual that ALL members share. Already shipped, untouched.
2. **Signature ability** — UNIQUE to one animal. Selective — only ~25-30 of 50 animals get one.
3. **Evergreen keyword** — small additive trait. 1-2 keywords per animal, stacks safely.

### The 5 keywords (final — 6th slot stays empty)
- **Restless** — +1 Dew/day passive
- **Hardy** — 50% chance to dodge one climate damage event per week
- **Rooted** — +2 EA when defending in Wild
- **Swift** — +2 EA when attacking in Wild (rolls apply first)
- **Lush** — +1 pollen per cross-pollinate

### Failed keyword attempts (don't propose these)
- **Thorned** (failed attacker -1 EA for 24h) — too punitive, fit only 6 animals
- **Mycorrhizal** (defender's other plants donate +0.5 EA each) — fungal network, fit only 3 animals naturally

---

## 3. EXISTING SIGNATURES — 14 already shipped (DON'T propose alternatives)

| Animal | Family | Ability |
|---|---|---|
| Toad | Guardians | rainCaller — 30% auto-water + 1.3× repro in dry weather |
| Butterfly | Pollinators | driftPollen — 5% free cross-pollinate daily |
| Mammoth | Wayfinders | permafrost — +2 EA always, 2× in cold |
| Porcupine | Guardians | shellShift — 25% relocate on invasion |
| Beholder | Listeners | omnisight — global wild map reveal |
| Firefly | Listeners | nightBloom — 2× pollen+repro 8PM-6AM |
| Raccoon | Scatterers | scavenger — +1 fert/day from nearby invasions |
| Garden Spider | Weavers | silkTrap — defender +3 EA |
| Cicada | Listeners | herdImmunity — +1 EA per ally within 500m, max +4 |
| Heron | Wayfinders | precisionStrike — +1 attacker EA, 2× displaced harvest |
| Snail | Conduits | Steady Shell — dice floor of 3 + permanent +1 EA per defense |
| Hummingbird | Pollinators | Dash Wings — rolls 2d(4-9), never disaster never miracle |
| Turtle | Guardians | Ancient Shell — +1 EA per day alive, cap +14 |
| Dart Frog | Conduits | Oracle's Vow — pre-commit dice target, 3× reward if hit |

---

## 4. PROPOSED NEW SIGNATURES — 12 (or 17 with strict-rare rule)

### Confirmed proposals (12)

| Animal | Family | Ability | Mechanic |
|---|---|---|---|
| Platypus | Scatterers | **Static Sense** | When weather shows rain/flood at your location, next forage gets +1 attempt |
| Scarab Beetle | Scatterers | **Sacred Roll** | Compost reward bumps one rarity tier (Cosmic stays Cosmic) |
| Axolotl | Conduits | **Regrow** | When wild plant dies, recover 50% of harvest reward in Dew |
| Worm | Conduits | **Tilth** | Wild plants take 50% less drought damage |
| Mushroom Sprite | Mycelium | **Spore Web** | When ANY wild plant survives contest, all OTHER wild plants +0.5 EA for 24h, max +3 |
| Bee | Pollinators | **Honey Tax** | Every cross-pollination earns +1 Dew bonus |
| Ant Trail | Weavers | **March** | Active wild plant +X EA today, X = floor(steps_today/500), cap +5 |
| Pangolin | Guardians | **Scale Coat** | -50% wind damage on wild plants |
| Scorpion | Guardians | **Heatproof** | -50% heat damage on wild plants |
| Cat | Listeners | **Night Eyes** | At night (8PM-6AM), nearby ferals (200m) auto-show on map |
| Raven | Listeners | **Tongue** | Once daily, your active companion's T2 cooldown is halved |
| Dragonfly | Wayfinders | **Air Current** | Active wild plant +1 EA per unique biome visited today, cap +5 |

### Conditional (5 more if "rare = mandatory ability" rule applied)

| Animal | Family | Ability | Mechanic |
|---|---|---|---|
| Jellyfish (rare) | Conduits | **Halo Bloom** | When wild plant survives contest, +3 Dew |
| Luna Moth (rare) | Pollinators | **Moon Tide** | Night cross-poll (8PM-6AM) yields +50% pollen |
| Will-o-Wisp (rare) | Listeners | **Lead Astray** | In dense zones (3+ players' plants nearby), 25% attacker miss |
| Origami Crane (rare) | Wayfinders | **Folded Wishes** | Once weekly, all wild plants +1 EA for 24h |
| Flamingo (rare) | Wayfinders | **Flock Leader** | In zones with 3+ other-player plants, +1 Sunbeam/day |

**Climate vector signature progress (one of the design goals):**
- ✅ Cold: Mammoth permafrost (shipped)
- 🆕 Drought: Worm Tilth
- 🆕 Wind: Pangolin Scale Coat
- 🆕 Heat: Scorpion Heatproof
- ❓ Flood: needs **Koi Fish — Flood Born** (50% flood damage reduction) to close the 5-vector loop

---

## 5. KEYWORD DIVERSIFICATION — every animal unique within family

Every named animal has a distinct keyword loadout from every other animal in its family. Combinations only — no new keywords introduced.

### Per-family loadouts (gap animals shown; existing-signature animals included for completeness)

**Scatterers (5):**
- Raccoon: scavenger + swift
- Platypus (rare): Static Sense + hardy
- Mouse: restless, hardy
- Scarab Beetle: Sacred Roll + rooted
- Squirrel: swift, lush

**Conduits (8):**
- Snail: Steady Shell + hardy
- Caterpillar: lush, restless
- Axolotl (rare): Regrow + lush
- Worm: Tilth + rooted
- Dart Frog: Oracle's Vow + swift
- Koala: hardy, rooted
- Koi Fish: lush, hardy *(or Flood Born + lush if flood vector adopted)*
- Jellyfish (rare): swift, lush *(or Halo Bloom + lush if strict)*

**Mycelium (4) — universal family:**
- Rabbit: restless, lush
- Mushroom Sprite: Spore Web + rooted
- Deer Fawn: swift, lush
- Panda: lush, hardy

**Pollinators (6):**
- Bee: Honey Tax + lush
- Butterfly: driftPollen + swift
- Moth: hardy, restless
- Ladybug: restless, rooted
- Hummingbird: Dash Wings + swift
- Luna Moth (rare): lush, swift *(or Moon Tide + lush if strict)*

**Weavers (6):**
- Spider: rooted, swift
- Garden Spider: silkTrap + swift
- Praying Mantis: hardy, swift
- Cricket: lush, restless
- Ant Trail: March + rooted
- Seahorse: hardy, lush

**Guardians (8):**
- Pill Bug: rooted, lush
- Toad: rainCaller + rooted
- Hedgehog: hardy, swift
- Pangolin: Scale Coat + rooted
- Porcupine: shellShift + rooted
- Scorpion: Heatproof + swift
- Garden Gnome: rooted, hardy
- Turtle: Ancient Shell + hardy

**Listeners (9) — universal family:**
- Navi: lush, restless
- Firefly: nightBloom + lush
- Cicada: herdImmunity + hardy
- Beholder: omnisight (no keywords — signature purity)
- Cat: Night Eyes + restless
- Bat: hardy, restless
- Owl: hardy, swift
- Raven (rare): Tongue + swift
- Will-o-Wisp (rare): swift, hardy *(or Lead Astray + swift if strict)*

**Wayfinders (9):**
- Dragonfly: Air Current + swift, lush
- Mammoth: permafrost + rooted
- Heron: precisionStrike + swift
- Origami Crane (rare): hardy, lush *(or Folded Wishes + lush if strict)*
- Robin: restless, lush
- Silly Goose: swift, restless
- Puffin: hardy, swift
- Red-Crowned Crane: hardy, lush
- Flamingo (rare): lush, hardy *(or Flock Leader + lush if strict)*

---

## 6. ITEMS REVIEW — 17 items, current coverage

| Category | Common | Uncommon | Rare | Epic | Legendary |
|---|---|---|---|---|---|
| Foraging | Lens | Shard | Moss | Glass | — |
| Defense | — | Moonwake | Mulch, Bramble | Shellgourd | — |
| Offense | — | Uproot | Torch, Dust | — | — |
| Remote | Whisper | Scrying | Slow Arrow, Raven Eye | Wanderers, *Delegate (unwired)* | — |

### Item gaps + balance flags
1. **Zero Legendary items** across all 4 categories
2. **No Common Defense or Common Offense**
3. **No Epic Offense**
4. **Mulch Ward (R) vs Shellgourd (E)** — overlapping defense power band (Director-flagged)
5. **Foragers Torch misnamed** — category is offense but name says Forager class
6. **Conduits has no dedicated item line** — biggest companion-domain gap

### Proposed item gap fills (3 — optional, ship later)
- **Loam Memory** (Legendary Foraging): one feral hex/week guaranteed Mythic-tier; needs pity timer
- **Heart Wood** (Legendary Defense): all wild plants protected 24h, weekly cap
- **Pollen Storm** (Epic Offense): next 3 contests, defender companion bonus = 0

### delegateToken (Epic Remote)
Unwired. Needs Firestore co-op friend flow. Park or social-features sprint.

---

## 7. CROSS-FAMILY SYNERGIES (intentional combos)

### Climate-resist build
Pangolin (wind) + Mammoth (cold) + Worm (drought) + Scorpion (heat) + (Koi Flood Born if added) = full 5-vector resistance

### Movement-reward build
Ant Trail March (steps) + Dragonfly Air Current (biome variety) + Cartographer class

### Defender stack
Snail Steady Shell + Mushroom Sprite Spore Web + Garden Spider silkTrap + Mulch Ward / Bramble Thicket / Shellgourd

### Information build
Beholder omnisight + Cat Night Eyes + Raven Tongue + Scrying Stone / Raven Eye / Wanderer's Map

### Pollinator engine
Bee Honey Tax + Butterfly driftPollen + Twin Bloom (T3) — strong but constrained by 1-active-companion rule

### Compost engine (cross-family)
Compost Song (Conduits T3) + Worm Tilth + Scarab Sacred Roll + Soft Thread (Weavers T2) — needs single-event reconciliation pass

---

## 8. BALANCE FLAGS — issues to surface

1. **Cicada herdImmunity + Mushroom Sprite Spore Web** — both ally-clustering. Cap independently or risk runaway defender EA in clustered zones.
2. **Pollinator engine convergence** — Bee + Butterfly + Twin Bloom all reward cross-pollinate. Mitigated by single-active-companion rule but worth verifying loop math.
3. **Walking-build viability** — Ant Trail March + Dragonfly Air Current + Cartographer class = real new archetype emerging. Want or trim?
4. **Climate signatures don't compound across plants** — each plant gets its own per-vector reduction via companion equipment. By design.
5. **Raven Tongue + Conduits Dew Call** — extra +5 Dew every 30 min instead of 60 min on Tongue day. Modest but worth tracking.
6. **6 Guardian signatures total** = heaviest family by sig count. Constrained by single-active-companion rule.

---

## 9. OPEN DECISIONS — Director's call

### A. Strict rare = ability rule?
Locked spec says "Rare+ = ability + 1 keyword." Half of rare animals got sigs in this proposal, half didn't. Choose:
- **A — Strict:** add 5 more sigs (Jellyfish, Luna Moth, Will-o-Wisp, Origami Crane, Flamingo). Total ~30 sigs.
- **B — Loose:** rare = "rare to encounter" only. Total ~26 sigs as written.

Recommendation: A. Rare animals should feel rare. All 5 fills use existing hooks (~5 lines each).

### B. Koi Fish Flood Born?
Closes the 5-vector climate-resist loop. Trivial revision to Conduits proposal.
Recommendation: yes.

### C. 6th evergreen keyword?
None of the 8 families surfaced one that fits 8+ animals naturally. Recommendation: park, stay at 5. Strongest fallback if pursued: **Wakeful** (small ambient luck on feral spotting).

### D. Items this round or next?
Recommendation: lock companion abilities first, items-only sprint after. Closer to data on which synergies need item support.

---

## 10. ASK FOR PARALLEL-TEAM REVIEW (ChatGPT/Gemini)

Please critique this proposal across these axes:

1. **Flavor coherence** — does each animal's signature match its real-world or mythological identity? Flag any that feel forced or generic.
2. **Mechanical novelty vs overlap** — flag any signature that mechanically duplicates another (across families or with the family T2/T3 layer).
3. **Balance risk** — flag any combo that looks like a runaway loop. Especially: defender stacks, compost engine, Pollinator engine, walking-build, climate-resist build.
4. **Decision A** — strict rare = ability, or loose? Argue your position.
5. **Decision C** — should there be a 6th keyword? If yes, propose one that fits 8+ animals naturally without overlapping the existing 5.
6. **Items deep-pass** — anything missing from the catalog that the abilities now demand? Anything in the catalog that the abilities make obsolete?

Be terse. Prefer concrete fixes over abstract concerns.
