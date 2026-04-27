# Book of Secrets — Consolidation Plan
*Drafted 2026-04-27. 10 tabs → 5 tabs. Zero redundancies. Stephen sign-off captured 2026-04-27.*

## Why this work

The BoS grew organically — every new system (synergies, companions, items, hunt, quests, herbarium triggers) got its own tab. Result: 10 top-level decisions before the player can read anything. The same content surfaces in two and three places (companions in MEMENTOS *and* HERBARIUM; trophies in QUESTS *re-displayed* as a "cabinet"; daily/weekly events spread across TODAY, JOURNAL, EVENTS).

Goal: collapse to 4 conceptual containers with subsections inside. Every piece of content has exactly one home.

---

## Current state — 10 tabs

| Tab key | Function | What it shows | Notes |
|---|---|---|---|
| `today` | `_bosTodayContent` | Daily quest picks, "since your last visit" feed, "so close" hints | Overlap with JOURNAL + EVENTS |
| `activity` | `_bosActivityContent` (combined into `report`) | Activity log timeline | Redundant with TODAY's "since last visit" |
| `secrets` | `_bosSecretsContent` | Synergies, mythic hall, trait diversity | Synergies are *discoveries* — belong with HERBARIUM |
| `events` | `_bosEventsContent` | Wild discovery events feed | Same data feed as JOURNAL |
| `mementos` | `_bosMementosContent` | Companion roster, 30-day keepsake timer, INVITE FRIENDS | Companions also in HERBARIUM. INVITE duplicates char sheet |
| `herbarium` | `_bosHerbariumContent` | Biomes, triggers (companion/weather/season/action/event), weekly bundles, forage simulator | Triggers redundant with SECRETS. Bundles redundant with QUESTS |
| `items` | `_bosItemsContent` | 4 categories: foraging/defense/offense/remote | Standalone catalog — fits CODEX |
| `hunt` | (in dispatcher) | Seasonal hunt tracker | Same mechanic as weekly QUESTS |
| `quests` | `_bosQuestsContent` | Daily, weekly, achievements, trophy cabinet | Trophy cabinet = re-display of earned achievements |
| `about` | `_bosAboutContent` | Hermit bio + tip jar | Independent — keep |

---

## Redundancy ledger

| # | Duplication | Locations | Resolution |
|---|---|---|---|
| 1 | **Companions** | MEMENTOS (roster + 30-day) + HERBARIUM (companion category) | Single home: CODEX → Companions |
| 2 | **Trophy cabinet** | QUESTS (cabinet section is just earned achievements re-rendered) | Collapse into QUESTS → Achievements with an "earned" filter chip |
| 3 | **Daily / weekly / hunt** | QUESTS (daily, weekly) + HUNT (seasonal) — same mechanic, different cadence | Merge into one QUESTS tab with subsections by cadence |
| 4 | **Discovery feed** | TODAY + JOURNAL + EVENTS — three views of the same activity log | Single home: JOURNAL with TODAY/WEEK/ALL filter |
| 5 | **INVITE FRIENDS** button | MEMENTOS (line 74775) + Character Sheet (line 6926) | Remove from MEMENTOS — char sheet owns it |
| 6 | **Synergies** | SECRETS — but conceptually they're trait discoveries | CODEX → Plants → Synergies (with mythic hall) |
| 7 | **Weekly bundles** | HERBARIUM bundles + QUESTS weeklies | Move bundles into QUESTS → Bundles subsection |
| 8 | **Forage simulator** | HERBARIUM | Move to Dev Panel — it's a tool, not a discovery |

---

## Proposed 5-tab structure

### 1. CODEX
*"Everything you've discovered."* Replaces SECRETS + HERBARIUM + ITEMS + MEMENTOS roster.

Subsections (sticky scroll within tab):
- **Plants** — synergies + mythic hall + trait diversity (was SECRETS)
- **Triggers** — discovery categories: companions, weather, seasons, actions, events (was HERBARIUM categories)
- **Biomes** — discovery grid (was HERBARIUM biomes)
- **Companions** — full roster grouped by family + 30-day keepsake timer (was MEMENTOS)
- **Items** — 4-category catalog (was ITEMS)

### 2. JOURNAL
*"Everything that happened."* Replaces TODAY + activity log + EVENTS.

**Editorial rule (Stephen 2026-04-27):** Only surface entries the player can recognize and act on. Lines like "Your Crimson Vesper is pollinated by a Honeybee" — keep. Lines like "Trait diversity index +0.03" — cut. If we can't write the entry in plain language a new player understands, it doesn't belong.

Subsections:
- **Today** — fresh-since-last-visit (preserves the warmth) + today's quests pinned at top
- **This Week** — last 7 days of the activity log
- **All Time** — full chronological feed

### 3. QUESTS
*"Everything to chase (regular cadence)."* Replaces QUESTS + HERBARIUM bundles.

Subsections:
- **Daily** — 3 picks (already shipped, has art)
- **Weekly** — 3 picks
- **Bundles** — weekly bundles (was HERBARIUM)
- **Achievements** — lifetime catalog with tier + earned/unearned filters (replaces separate Trophy Cabinet)

### 4. SEASONAL SCAVENGER HUNT
*"The 3-month quest."* Stays as its own tentpole tab (was HUNT). Renamed to make the cadence and feel clear up front.

**Design directive (Stephen 2026-04-27):** Build it out properly. Players should be able to complete it without grinding hard. It should be *fun* — discovery, not chore. **This is a separate workstream — see open questions below for design pass.**

### 5. ABOUT
*Unchanged.* Hermit bio + tip jar. Stephen confirmed the hermit-bio.jpg image is locked.

---

## Migration map (sub-section → new home)

| Current location | Sub-section | → New home |
|---|---|---|
| TODAY | "Since your last visit" feed | JOURNAL → Today |
| TODAY | Daily quest picks (pinned) | JOURNAL → Today *(also reachable from QUESTS → Daily)* |
| TODAY | "So close" hints | JOURNAL → Today |
| activity | Activity log | JOURNAL → All Time |
| SECRETS | Synergies | CODEX → Plants |
| SECRETS | Mythic hall | CODEX → Plants |
| SECRETS | Trait diversity | CODEX → Plants |
| EVENTS | Discovery events | JOURNAL → This Week / All Time |
| MEMENTOS | Companion roster | CODEX → Companions |
| MEMENTOS | 30-day keepsake timer | CODEX → Companions (top of section) |
| MEMENTOS | INVITE FRIENDS button | **REMOVE** — char sheet owns it |
| MEMENTOS | EQUIP COMPANION button | CODEX → Companions (top of section, primary action) |
| HERBARIUM | Trigger categories | CODEX → Triggers |
| HERBARIUM | Biomes grid | CODEX → Biomes |
| HERBARIUM | Weekly bundles | QUESTS → Bundles |
| HERBARIUM | Forage simulator | **DELETE** — Stephen 2026-04-27: not used, scrap it |
| ITEMS | 4-category catalog | CODEX → Items |
| HUNT | Seasonal hunt | **OWN TAB** — renamed to SEASONAL SCAVENGER HUNT (Stephen 2026-04-27) |
| QUESTS | Daily | QUESTS → Daily *(unchanged)* |
| QUESTS | Weekly | QUESTS → Weekly *(unchanged)* |
| QUESTS | Achievements | QUESTS → Achievements |
| QUESTS | Trophy Cabinet | **MERGE** into QUESTS → Achievements with "earned" filter |
| ABOUT | Hermit bio + tip jar | ABOUT *(unchanged)* |

---

## Art opportunities

Every consolidated tab + every subsection can host a hero/sigil. Stephen offered hundreds of small images — here's the comprehensive list at three sizes:

### Tab heroes (4 — banner sized, ~120-160px tall)
1. **CODEX** — open botanical journal with pressed leaves and gold trim *(parchment + plants + ink — like the daily-quests scroll but landscape)*
2. **JOURNAL** — quill + ink pot + candle on parchment
3. **QUESTS** — already shipped (daily-quests.png banner reused or new sealed-envelope hero)
4. **ABOUT** — already shipped (hermit-bio.jpg)

### Subsection sigils (16 — small inline, lwe-* sized at ~1.1em)
**CODEX subsections:**
1. **Plants** — pressed-flower silhouette
2. **Triggers** — *(reuse existing — figure/paw/sun/flower/leaf already shipped per category)*
3. **Biomes** — globe *(already shipped: lwe-globe)*
4. **Companions** — paw *(already shipped: lwe-paw)*
5. **Items** — small pouch / drawstring bag

**JOURNAL subsections:**
6. **Today** — sun-rising-over-leaf *(or reuse lwe-sun)*
7. **This Week** — waxing-moon-with-stars
8. **All Time** — open scroll with star-trail

**QUESTS subsections:**
9. **Daily** — already shipped (daily-quests.png — could shrink for inline use)
10. **Weekly** — wax-seal banner variant *(red ribbon, "WEEKLY")*
11. **Hunt** — antlers / paw-print-trail / forest-glade
12. **Bundles** — bouquet wrapped with ribbon
13. **Achievements** — already shipped (lwe-trophy-cup or any of the 9 trophy variants)

**ABOUT** — *no sigil needed; the hermit portrait dominates*

### Empty-state illustrations (8 — center-page when section has no content yet)
14. **No companions discovered** — silhouette + question mark over leaf wreath
15. **No items found** — empty pouch + sparkles
16. **No biomes explored** — fog over map
17. **No synergies recorded** — locked spellbook
18. **No achievements earned** — dim trophy on shelf
19. **No quests active** — closed scroll + wax seal (unbroken)
20. **No bundles active** — empty basket
21. **No journal entries** — blank page + feather

### Per-trigger badge art (~30+ — long tail)
The HERBARIUM (now CODEX → Triggers) has dozens of individual triggers across 6 categories. Each currently uses an emoji or generic glyph. Eventually each trigger could have its own tiny pixel-icon (hundreds-scale — Stephen's offer applies here).

Examples in the COMPANIONS category alone (60+ companions):
- Each companion's portrait icon (Stephen confirmed: use procedural SVG renderer for now — implemented)
- Each *first-discovery* badge could get a tiny commemorative sigil

---

## Implementation order (when we ship)

1. ✅ **SHIPPED 2026-04-27** — 5-tab shell live: CODEX / JOURNAL / QUESTS / HUNT / ABOUT. All 10 legacy content functions still run; CODEX + JOURNAL + QUESTS compose them via section-headed long-scroll. `_BOS_LEGACY_REDIRECT` map routes any old `_bosSetTab('mementos')` deep link to its new home. Initial-tab logic updated (defaults to CODEX, falls through to JOURNAL on stale-today or unread). Per-tab badge aggregation working — CODEX sums `secrets+mementos+items`, JOURNAL sums `today+activity+events`, QUESTS sums daily-undone + `herbarium` (bundles). Opening a consolidated tab stamps all its legacy sub-tabs as read.
2. ✅ **SHIPPED 2026-04-27** — Phase 2 batch: (a) bundles moved from CODEX to QUESTS, (b) Companion Gallery in `_bosSecretsContent` suppressed when in CODEX (via `window._bosCodexMode` flag) so the dedicated COMPANIONS section is the only one showing companions, (c) JOURNAL trimmed from 4 feeds to 2 (today's curated surface + events) — eliminates the duplicate timeline content. New `_bosQuestsTabContent` composes daily/weekly/achievements + `WEEKLY BUNDLES`.
3. **KEPT (not redundant)** — Trophy Cabinet in QUESTS. Looked redundant in audit but actually shows the trophy-only subset (43 of N achievements with `reward.type === 'trophy'`) as a compact aspect-ratio:1 grid. Different lens from the full achievement filter list, not pure duplication.
4. **DEFERRED** — Forage simulator (`LW_simulator`) deletion. Not actually surfaced anywhere player-visible — only callable from console (`LW_debug.sim()`). Code hygiene only, ~200 lines, low priority.
5. **TODO** — Polish: empty states audit, art slots populated for new section headers, sticky sub-section nav within long tabs.
6. **TODO** — Voice pass on JOURNAL entries (vague metric-style lines like "Trait diversity index +0.03" → plain hermit-speak). Big copy-editing project, ~30-60 min.
7. **TODO** — Legacy `_BOS_LEGACY_REDIRECT` map cleanup — keep as long as deep links exist in code; grep + audit when ready to delete.

Estimated scope remaining: 2-4 commits. Largest risk (breaking deep links) addressed by the redirect map. Largest remaining work is the redundancy cleanup (companions appearing twice within CODEX, etc.) — that's a refactor of the old content functions to expose section-only renderers.

---

## Resolved decisions (Stephen 2026-04-27)

1. **TODAY framing** — keep only what's relevant and recognizable. Current TODAY surfaces vague entries the player can't parse ("saying something but as a player i dont know what that is or why its saying that"). Editorial rule above. Cut anything we can't write in plain English.
2. **HUNT** — own tab. Rename **SEASONAL SCAVENGER HUNT**. 3-month cadence. Build out properly — not grindy, fun, discovery-driven. Design pass needed.
3. **INVITE button** — remove duplicate from MEMENTOS. Char sheet owns it.
4. **Forage simulator** — delete entirely. Not used.

## Next workstream — Scavenger Hunt design pass

Separate doc when we go deep. Initial framing:
- 3-month cadence (matches a real season)
- Should feel like exploration, not a checklist
- Completable without grinding (mass-action shouldn't dominate)
- Distinct from daily/weekly QUESTS (which are short-cadence chores) and from achievements (which are lifetime trivia)
- Likely structure: *narrative spine* (a seasonal story) + *discovery prompts* (find the X bloom, witness the Y event, breed an offspring with Z trait) + *journey rewards* (titles, mementos, exclusive trait unlocks)

To define before building:
- What anchors a season? (real-world season + a fictional event tied to the hermit's calendar?)
- How many discovery prompts? (rough sizing — too few feels empty, too many feels grindy)
- Reward structure (capstone reward at end vs. cumulative drip vs. both)
- How do players track progress without it feeling like a Pokémon checklist
- Art needs: per-season hero, per-prompt sigil, capstone reward art
