# Seasonal Scavenger Hunt — Design Plan
*Drafted 2026-04-27. Builds on the existing Firefly Hunt scaffold. All 6 design questions resolved by Stephen 2026-04-27.*

## What already exists (`LW_HUNT` at index.html:78158)

- 12 fireflies per real-world season (Spring/Summer/Autumn/Winter)
- 12 spawn locations across the UI (wild map, keeper bar, nursery pot rim, plant card knot, BoS pages, slot reels, foraging hex, backpack flap, tree node, etc.)
- ~7.5 day cadence (90 days / 12)
- Each firefly has a one-line piece of lore ("It was pretending to be a raindrop. I almost missed it.")
- Capstone: 500 Dew + 3 Legendary mystery boxes, with celebration modal
- BoS HUNT tab renders 4×3 grid with caught/spawned states
- Streak counter (`hunt_streak`), session counter (`hunt_session_3`), full-season counter (`hunt_full_season`) wired into LW_ACH

**This is the foundation. Don't rebuild it. Layer on top.**

## Stephen's directives (2026-04-27)

> "completely build out the scavenger hunt. players should be able to do it without grinding super hard and it should be fun."
> "3 month quest" • "calling it like seasonal scavenger hunt when you open it could work"

## What's missing — gap analysis

| Gap | Impact | Priority |
|---|---|---|
| No narrative spine | Each season feels identical — "catch 12 again" | High |
| All 12 prompts are the same mechanic | Repetitive. Charm thins by firefly #5. | High |
| Generic capstone (Dew + boxes) | Fungible. No commemorative artifact. | High |
| No per-firefly art | Just an emoji + glow ring. Zero collectibility feel. | High |
| No catch-up mechanic | Late joiners can't realistically complete. | Medium |
| Mid-season season-change behavior unclear | What happens to half-caught Spring at the equinox? | Medium |
| Hints are static (built-in spawn map) | Player doesn't feel hunted-by; just waits for things to appear | Medium |
| No optional companion prompts | Fireflies stay alone. The garden's other inhabitants ignore them. | Low |

---

## Design — the 5 layers we add

### Layer 1 — Per-season theme + narrative
Each season gets a distinct *story* the hermit tells across the 90 days. The 12 fireflies become *paragraphs* in that story rather than 12 identical catches.

- **Spring — "The Returning"** — Things waking up. The hermit is recording the year's first pollinations. Each firefly carries a fragment of who came back this year.
- **Summer — "The Long Day"** — Peak abundance. The hermit is mapping which blooms hum loudest at noon. Fireflies as glints at the pollen-heavy hour.
- **Autumn — "The Falling Path"** — Decay and memory. Each firefly is a memory the season is shedding. (Compost-coded, reverent.)
- **Winter — "The Watching"** — Stillness. The hermit is keeping a count of what survives. Rarer fireflies, longer cadence, hushed lore.

Each season ships with:
- A **prologue** the hermit speaks the first time the player opens the HUNT tab in that season
- An **epilogue** delivered with the capstone reward
- Per-firefly lore lines, voiced by the hermit. The existing lore strings stay (they're charming and concrete), the hermit just narrates them. **One narrative voice keeps the world coherent — no separate persona to cultivate.**

### Layer 2 — Mixed prompt types (fireflies + companion sightings + biome traces)
Today every prompt is "catch a firefly." Add 2 quieter prompt types so the hunt has variety without adding grind:

**Type A — Catch (the existing firefly mechanic)** — 6-7 per season. Tap-to-catch as today.

**Type B — Witness** — 2-3 per season. *Passive observation* of something in the garden. "A bee returns to your Summer-season plant on three different days" — this auto-completes from playing normally. The player just discovers it was tracked.

**Type C — Visit** — 2-3 per season. *Light exploration*. "Find a feral seed in a biome you haven't visited this season" — moderate, not grindy. Routes the player into the wild without forcing a checklist.

This brings total prompts to 10-13 per season (close to the existing 12-firefly target). The variety means a player never feels like they're doing the same thing twice.

### Layer 3 — Real capstone artifact (per season)
Replace 500 Dew + 3 boxes with an artifact stack. **Stephen 2026-04-27: no new traits in the bank — fairness for all players. Use small permanent upgrades + cosmetics. Stack across years for long-term progression.**

1. **A seasonal title** — "The Returning Keeper" (Spring), "The Long Day Watcher" (Summer), "The Falling Path Walker" (Autumn), "The Long Night Keeper" (Winter). Display in BoS About + char sheet.
2. **A commemorative scroll** — a dated, illustrated page added to the BoS that records *this player's* Spring 2026 hunt with the lore they collected. Permanent record. Re-readable forever.
3. **A small permanent upgrade** — passive bonus that applies forever once earned. Tiny enough that its absence isn't a handicap, present enough to feel rewarding. Examples (final values pending balance pass):
   - Spring → +1 fertilizer slot per compost
   - Summer → +1 dew tick from your wild plants during noon hours
   - Autumn → +5% pollen on harvest
   - Winter → +1 day of dormancy grace before climate decay starts
4. **A cosmetic** — card frame, scroll page style, custom title flair, or season-themed aura overlay. Pure visual.
5. **Bonus material rewards** — keep the existing 500 Dew + 3 Legendary boxes.

**Yearly stacking — the long-term play:**
- Year 1: complete Spring 2026 → earn the Spring upgrade + Year-1 cosmetic
- Year 2: complete Spring 2027 → earn a *new* Year-2 cosmetic AND the Year-1 upgrade *increases by a small step* (e.g., +1 fert slot becomes +2). Or a new bonus stacks alongside the original.
- Net: a player who has done all 4 seasons across 3 years has a measurable but non-broken advantage, plus a wardrobe of cosmetics nobody else can buy.

This is the long-tail retention spine. Players who stick with the game for years collect a quietly meaningful set of advantages, never traits, never anything someone could pay to skip.

The artifact stack solves the "feels generic" problem. The scroll especially: it's a *thing the player keeps*, dated, illustrated, with their actual hunt's lore preserved.

### Layer 4 — Hermit weekly hint (12 fireflies = 12 weeks)
**Stephen 2026-04-27: 12 fireflies, 12 weeks, one hint per week pointing to the next firefly. A casual player who plays a little each week can complete the season.**

This reframes the hint system from "stale-alert" to "weekly pacer":

- The 90-day season is divided into **12 weekly chapters** (one per firefly).
- Each chapter, the hermit hints at *one specific firefly* — the chapter's target.
- The hint drops once at the start of the week (Sunday morning, local time) into the JOURNAL feed.
- The hint corresponds to the firefly's `location` field. *"This week, look near the pots after dark — something small is waiting on the rim."*
- Caught the firefly during that week? Chapter complete.
- Missed it? It stays available — fireflies don't expire mid-season. The hermit just moves on to the next chapter the following week.

**The result:** a player who opens the app for ~10 minutes once a week, follows the hint, and catches one firefly is on pace to complete the season exactly on time. Slower players accumulate uncaught fireflies; faster players can chase ahead. Both feel rewarded.

### Layer 5 — Season-end claim window (1 week post-solstice)
**Stephen 2026-04-27: hard timer. When the season ends, it ends. But there's a 1-week claim window after for any leftover rewards. If they don't claim, send the rewards anyway.**

- The capstone reward window opens at season-end and stays open for 7 days.
- During that week, the BoS shows a "season's tribute is waiting" prompt. Player taps to receive (title, scroll, upgrade, cosmetic, materials).
- If they never tap, on day 7 + 1 the rewards are auto-mailed: title applied, scroll archived, upgrade activated, cosmetic added to wardrobe, materials sent to backpack/bank.
- After the claim window closes, the season's progress is archived as a memento (per Stephen's earlier ruling). Next season's spawns clean-slate.

This solves the "I missed the last day" anxiety without making the hunt sticky-progress across seasons.

---

## Anti-grinding rules (locked)

- **Hunts are free to play. The capstone cannot be bought. Zero Pi gating.** (Stephen 2026-04-27)
- **No prompt requires more than 7 days of repeated action.**
- **No prompt requires more than 5 specific game completions.**
- **No prompt requires Pi or Dew spend.**
- **Most prompts auto-trigger from natural play.**
- **Weekly hermit hint** paces the season so casual players (~10 min/week) complete on time.
- **1-week claim window** after season end, then auto-mail leftover rewards.
- **Mid-season change:** clean slate at solstice. Partial progress archived as a memento in BoS — no shame for incomplete seasons. No carry-over.

---

## Tracking UX — what the HUNT tab looks like

Top to bottom:

1. **Season hero banner** (art) — landscape illustration matching the season + hermit's framing
2. **Hermit's prologue** (the story for this season, 2-3 sentences in his voice)
3. **Progress bar + counts** — "8 / 12 found"
4. **The 12 firefly grid** (existing) — caught are gold-glowing, uncaught spawned are dim, uncaught unspawned are silhouettes
5. **Companion/Witness/Visit prompts** — 4-6 cards mixed in (newer prompt types)
6. **Hermit's hints** — most recent hint pinned at the bottom
7. **Capstone preview** — silhouette of what's at the end (revealed as %)

Each prompt card has art, 1-line plain-language text, progress indicator, tap-to-reveal lore.

---

## Art opportunities (substantial — all four seasons)

### Per-season heroes (4)
1. Spring banner — wet earth, first leaves, hermit at the window watching pollinators return
2. Summer banner — peak garden, golden hour, hermit walking with notebook
3. Autumn banner — falling leaves, candle-lit study, hermit reading old entries
4. Winter banner — snow on pots, single firefly under lantern light

### Per-firefly portraits (~48 total, 12 per season)
Each firefly's lore line gets an illustration. These accumulate in the seasonal scroll artifact.

Examples for Spring's 12:
1. Firefly returning to a budding stem
2. Firefly resting on a wet leaf
3. Firefly drifting over a pot rim
4. ...

Pixel-art style, matching the existing item/companion sprite kit. ~64-128px each.

### Capstone artifact icons (5 — appear in capstone modal + completion display)
Each artifact line in the capstone modal currently uses a borrowed sprite. Custom icons would feel more bespoke:
1. **Title scroll** sigil — a small illuminated letter (currently uses `lwe-sparkle`)
2. **Archive scroll** sigil — bound scroll bundle (currently uses `lwe-book`)
3. **Permanent upgrade** sigil — stacking gem (currently uses `lwe-bloom`)
4. **Cosmetic unlock** sigil — small wardrobe / robe (currently uses `lwe-flowers`)
5. **Material rewards** sigil — coin purse (currently uses `lwe-drop`)

### Cosmetic frames (4 — one per season)
The cosmetic earned per capstone is a **card frame style**. Each needs:
1. **Spring "Returning Frame"** — soft pastels, budding leaves at corners, light gold trim
2. **Summer "Long Day Frame"** — warm yellows, golden hour glow, sunburst flourish at top
3. **Autumn "Falling Path Frame"** — burnt copper + red, drifting-leaf flourishes, candle warmth
4. **Winter "Watching Frame"** — silver + ice blue, snow texture at edges, single firefly motif

These wrap a plant card (greenhouse + carousel) when applied, and fit the existing seasonal Celtic-knot border system. Recommendation: keep them subtle so they don't fight with rare plants' built-in glow.

### Scroll page templates (4 — capstone keepsake)
Each completed season writes a permanent dated page into the player's BoS scroll archive. The page art should feel like a botanical journal entry:
1. **Spring scroll** — pressed first leaves + early-bloom illustrations, watercolor-ish
2. **Summer scroll** — sun-bleached parchment with golden-hour wash
3. **Autumn scroll** — slightly rumpled, edges singed amber, falling-leaf decoration
4. **Winter scroll** — frost crystals at the edges, a single firefly under a lantern at the bottom

Each is a portrait-orientation banner (~600x800) with space inscribed for: player name, year, list of caught fireflies, hermit's epilogue, completion date.

### Capstone scrolls (4)
A full-page commemorative illustration per season, with space for the player's name + year + caught lore lines to be inserted as text. Feels like a botanical journal page.

### Prompt sigils (~16)
Each Witness and Visit prompt gets a small inline sigil (lwe-* sized).

### UI accents
- "Hermit hint" notification chip (small candle/scroll combo)
- Catch-up window indicator (sand timer or candle burning low)
- Locked-state silhouette (single firefly silhouette, dimmed)

**Rough total: ~70-80 pieces of art across the 4 seasons. Stephen offered hundreds — comfortably within scope.**

---

## Implementation order (when we ship)

### Phase 1 — Foundation (existing system, polished)
1. ✅ **SHIPPED 2026-04-27** — Per-season theme strings (`SEASON_THEMES` dictionary with prologue, epilogue, label, titleStr, upgrade, cosmetic). L. attribution removed; hermit owns the voice.
2. ✅ **SHIPPED 2026-04-27** — Capstone artifact stack via `_grantSeasonalPrize`. Ledger keys: `lw_hunt_completed`, `lw_hunt_upgrades` (cumulative across years), `lw_hunt_titles`, `lw_hunt_cosmetics`, `lw_hunt_scrolls`. Public API: `LW_HUNT.getUpgrade(key)`, `LW_HUNT.SEASON_THEMES`. Dev hook: `LW_debug.fireHuntCapstone()` + dev panel button `✨ FIRE HUNT CAPSTONE`.
3. ✅ **SHIPPED 2026-04-27** — Consumer wirings:
   - Spring `fert_slot_bonus` → `+N fertilizer per compost` (index.html:38207)
   - Summer `noon_dew_bonus` → `+N Dew per minute during noon hour 12:00-12:59` (index.html:49725)
   - Winter `dormancy_grace_days` → `+N×24h to dormancy grace before climate decay` (index.html:43564)
   - Autumn → **pivoted to cosmetic-only** (harvest pays Dew not pollen — clean fallback per Stephen's offer; the Falling Path scroll is the artifact)
4. ✅ **SHIPPED 2026-04-27** — Season rollover handler (`_checkSeasonRollover` runs from `_ensure()`). For any non-current season state:
   - Completed + already claimed → skip
   - Completed but unclaimed (e.g., player was offline at moment of 12th catch) → silently grant the artifact stack via `_grantArtifactSilent` (no modal, just ledger writes — the auto-mail path)
   - Partial + season ended → archive to `lw_hunt_partial_scrolls` (one-time)
5. ✅ **SHIPPED 2026-04-27** — Memento-archive surfacing in BoS HUNT tab. "LAST SEASON" chip at top of tab shows whichever is most recent (completed or partial), with no shame for incomplete seasons.

### Phase 2 — Layered prompts
5. ✅ **SHIPPED 2026-04-27** — Witness + Visit prompts (4 per season, 16 total). Hooks: `counter_delta` (LW_ACH lifetime counter minus season-start snapshot), `counter_delta_any` (sum of multiple counter deltas, target met by any one), `biome_match` (specific biome visited since season start), `biomes_distinct` (count of distinct biomes visited since season start). Auto-eval from `_evalAllPrompts` runs on every `_ensure()`. Rewards: +25 Dew (witness) / +50 Dew (visit) on completion. Side effects fire AFTER state is persisted to prevent double-grant on render re-entry.
6. ✅ **SHIPPED** — same as 5
7. ✅ **SHIPPED 2026-04-27** — "SEASONAL DISCOVERIES" section in BoS HUNT tab below the firefly grid. Per-prompt cards with type icon (witness/visit), progress bar for non-binary prompts, "DONE" stamp + sage tint on completion, reward chip showing earned Dew.

### Phase 3 — Weekly hint pacer
8. ✅ **SHIPPED 2026-04-27** — `_checkWeeklyHints(state)` pacer. 12 fireflies = 12 weeks. Drops one hint per week per chapter into the JOURNAL feed via `_logWildEvent({type:'hunt_hint', ...})`. Catches up if player missed weeks (batches into single toast, drops each as separate journal entry). Auto-skips chapters where the firefly was already caught. Hermit-voiced hint text built from `SPOTS[i].desc`.
9. ✅ **SHIPPED 2026-04-27** — "HERMIT'S HINT" chip rendered at the top of HUNT tab showing the most recent uncaught chapter's hint inline. JOURNAL hint chip behavior pending JOURNAL consolidation work (BoS rebuild).
10. ✅ **SHIPPED 2026-04-27** — Prologue rendered on tab open. Epilogue delivered in capstone modal on `_grantSeasonalPrize`.

### Phase 4 — Yearly stacking (long-tail retention)
11. Track season-completion-count per player (e.g., `lw_hunt_completed: { 'spring-2026': true, ... }`)
12. Year-2-onward upgrade stack rule: each year a season is completed, the bonus increases or a parallel one unlocks
13. Cosmetic wardrobe wired to char sheet display + scroll archive

### Phase 5 — Art (parallel with Stephen's art pipeline)
14. Wire season banners (4)
15. Wire per-firefly portraits (48)
16. Wire capstone scroll template (4)
17. Wire prompt sigils (16)

### Phase 6 — Polish
18. Tutorial: first time the player opens HUNT in a season, brief walkthrough
19. JOURNAL integration: hunt events log there too (using the new editorial rule from BoS consolidation)
20. Future-proof: prepare schema for *event* hunts (one-time celebratory hunts outside the seasonal cadence — e.g., a "Solstice Special" or "Anniversary Hunt")

Estimated scope: ~12-15 commits across phases 1-4 (code-only). Phase 5 lands as art arrives. Phase 6 is polish + extensibility.

---

## Resolved decisions (Stephen 2026-04-27)

1. **L.'s voice** — drop as a named character. Existing lore lines stay (they're charming and concrete) but are voiced through the hermit. One narrative voice, no separate persona to cultivate.
2. **Trait unlocks** — no new traits in the bank. Replaced with: small permanent passive upgrade per season (e.g., +1 fertilizer slot) + cosmetics + stack-across-years. Year 1 establishes, Year 2 grows the bonus or unlocks a parallel one. This becomes the long-tail retention spine.
3. **Season-end timer** — hard end. 1-week claim window after the solstice for leftover rewards. Auto-mail unclaimed rewards on day 8.
4. **Pi gating** — none. Hunts are free play, the capstone cannot be bought. Locked.
5. **Hermit hint cadence** — once a week, 12 weeks per season, each week pointing to one specific firefly. Players who play 10 minutes a week can complete the season exactly on pace. The weekly hint replaces the original "stale-alert" idea and becomes the pacer.
6. **Tab attention** — HUNT tab stays quiet by default, no pulse to compete with the rest of BoS. The weekly hermit hint *opens the HUNT tab* when tapped from the JOURNAL feed (not modal — calm guidance). This is the only time the hunt actively asks for attention.

---

## Adjacent work this enables

- **Daily/Weekly QUESTS** can stay short-cadence chores; the hunt is the *ambient* meta-quest. Clear separation from the regular QUESTS tab.
- **JOURNAL editorial rule** applies — hunt events surface there, but only as plain-language entries: "You caught a firefly near the slot machine" not "hunt_progress 7/12."
- **Companion system** can hook in via Witness prompts (your equipped companion's observations show up).
- **Anniversary / event hunts** become possible because the schema is extensible.
