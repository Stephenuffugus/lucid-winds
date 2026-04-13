# Lucid Winds — XP Reward Architecture
**Status:** Design for director review · 2026-04-13
**Author:** Claude Code (Lead Developer)
**Problem frame:** Sim A shows 41/100 reaching Lv 12. Cautious median 1037m; Binger/Casual/Drifter/Lapser 0%. XP sources are too narrow — almost all grants come from "active completion" actions. Short-session, reflective, and intermittent players starve.

---

## 1. Philosophy

Lucid Winds is a **contemplative** botanical game. Its core promise (per the Keeper-is-the-Sun doctrine) is: *plants live their own lives; you come back to read the story*. If our XP curve only pays for combat-loop completions, we are implicitly punishing the very mode the game sells.

Three framings:

- **Skinner, corrected.** Variable-ratio reinforcement works, but variable-ratio *on meaningful behavior* works better than variable-ratio on taps. We reward **choices**, not motions. Opening a card is a choice; scrolling isn't.
- **Csikszentmihalyi.** Flow requires feedback proportional to effort. A 30-second session that included reading one haiku and watching a bloom should not return zero XP — the player made a complete aesthetic act.
- **Nir Eyal, inverted.** Hooked's "investment" phase assumes the habit serves the player. Our defense against manipulation is: *XP never compounds into pay-to-win*, it only opens **capabilities that already exist in the world**. Rewarding presence is honest because presence is the product.

**Operating rule:** Every reward in this doc must be defensible as *"the player made a meaningful choice the game is happy they made."* No grants for idle, for taps, or for scrolling. Many grants are one-time (discovery).

---

## 2. New XP source categories

Dedup columns: **one-time** = per-account flag in `sws_xp_seen`. **daily** = reset 03:00 local. **cooldown** = minimum seconds between fires. **unique-key** = dedup on a content id (plant hash, tab name, etc.).

### A. Discovery XP — first-time surface touch
| Event | XP | Dedup | Fires when |
|---|---|---|---|
| First open of each tab (GAME, GREENHOUSE, NURSERY, WILD) | 5 each | one-time per tab | `switchTab` with tab not seen |
| First open of carousel | 8 | one-time | `openCarousel` |
| First flip of a card back (see DNA ledger) | 10 | one-time | `classList.toggle('flipped')` |
| First open of action drawer | 5 | one-time | `openPlantActionDrawer` |
| First INFO/Dew modal opened | 3 | one-time per modal id | generic `lw-info-seen` |
| First map pan in Wild | 5 | one-time | Leaflet `moveend` after gesture |
| First backpack open | 5 | one-time | BP toggle |
| First Book of Secrets open | 5 | one-time | binder open |

**Total discovery ceiling: ~55 XP**, unlockable only once. Large enough to carry Cautious past the Lv 3 gate (75 XP) in a single exploratory session; small enough it can't be farmed.

### B. Reading / Inspection XP
| Event | XP | Dedup |
|---|---|---|
| Read a plant's haiku (card flipped ≥ 2.5s) | 2 | unique-key: plant hash, daily (once/plant/day, cap 5 plants/day = 10 XP) |
| Read DNA Ledger (carousel back open ≥ 4s) | 3 | unique-key: plant hash, one-time per plant |
| Inspect a feral before accepting challenge (tap card ≥ 2s) | 2 | unique-key: feral id, one-time |
| Tap companion/aura badge to reveal lore | 2 | unique-key: trait id, one-time |
| Read Compendium page | 2 | unique-key: entry id, one-time |

**Why gated on dwell time?** Dwell is the cheapest proof of attention. A 2.5s flip is the signal the haiku was actually seen, not an accidental tap.

### C. Presence / Contemplation XP
| Event | XP | Dedup |
|---|---|---|
| "Quiet minute" — 60s in-app with no tab switch, at least 1 plant visible | 1 | cooldown 60s, **cap 5/session**, cap 10/day |
| Watching a bloom animation to completion | 5 | unique-key: plant hash, one-time |
| Watching rain/weather event end | 2 | daily cap 2 |

Presence XP is capped *per session* to prevent AFK farming. 5/session × 2 sessions/day ≈ 10 XP/day — about one game's worth, never dominant.

### D. Return XP — "coming back"
| Event | XP | Dedup |
|---|---|---|
| First open of app today | 5 | daily |
| Return after ≥24h gap | 15 | daily, requires gap flag |
| Return after ≥3d gap | 40 | one-time-per-gap-threshold-crossing |
| Return after ≥7d gap | 100 | same |

Explicit re-onboarding bonuses for Lapser. The 3d/7d grants fire **once per gap event** — you can't reopen-then-wait-then-reopen to farm them (flag set on return, only clears after another gap of the same length).

### E. Observation XP
| Event | XP | Dedup |
|---|---|---|
| Plant reaches bloom while app is open | 5 | unique-key: plant hash |
| See a stranger's plant within 75m (passive) | 1 | unique-key: plant id, daily |
| Witness feral spawn in Wild | 2 | unique-key: feral id, one-time |
| Seasonal change observed in-app | 10 | one-time per season transition |

### F. Pattern XP — cross-session completion
| Event | XP | Dedup |
|---|---|---|
| Play 3 *different* games in a session | 10 | daily |
| Collect 5 different feral species | 20 | one-time per species-set |
| Mint one of each rarity Common→Rare | 25 | one-time |
| Water every own wild plant in one session | 10 | daily |
| Complete a biome (all plants of a biome type) | 50 | one-time per biome |

### G. Mastery XP
| Event | XP | Dedup |
|---|---|---|
| Win streak 3 in a row (any game) | 5 | cooldown 10min |
| Win streak 5 | 15 | cooldown 20min |
| Perfect game (no mistakes, where trackable) | 10 | unique-key: game id, daily |
| Beat personal best | 8 | unique-key: game id, cooldown 1h |

### H. Tutorial-proxy XP — first-of-kind actions
| First time… | XP |
|---|---|
| Minting a plant | already 50 (keep) |
| Watering any wild plant | 10 |
| Tending a stranger | 15 |
| Collecting a feral | 10 |
| Cross-pollinating | 15 |
| Naming a pattern | 10 |
| Dropping a plant into Wild | 15 |
| Using Backpack hold-to-release | 10 |

Total H pool ≈ 100 XP, one-time, doled out naturally as the player explores.

---

## 3. XP values — math & archetype deltas

Current XP/day (from sim A medians, approximate):

| Archetype | Sessions/day | Current XP/day | New-source XP/day | New total |
|---|---|---|---|---|
| Binger | 0.3 (one 2h blitz, vanishes) | 80 | +60 (return+discovery on session 1, then nothing) | 140 first day, drops |
| Breeder | 2.0 | 55 | +25 (reading+mastery) | 80 |
| Casual | 1.5 short | 8 | +18 (presence+return+discovery) | 26 |
| Cautious | 2.5 short | 6 | **+28** (reading+contemplation+discovery pace) | 34 |
| Chaos | 2.0 | 45 | +15 | 60 |
| Completionist | 1.7 | 60 | +40 (pattern+mastery) | 100 |
| Drifter | 1.0 tiny | 4 | +16 (return+presence) | 20 |
| Explorer | 1.8 | 50 | +30 (discovery+observation) | 80 |
| Grinder | 2.5 | 90 | +10 (mostly capped) | 100 |
| Lapser | 0.4 | 5 | **+35** (return+discovery refires over gaps are blocked; but tutorial-proxy + discovery land on early days) | 12 avg |
| Puzzler | 2.0 | 55 | +20 (mastery) | 75 |
| Social | 2.2 | 50 | +20 | 70 |

### Time-to-Lv-12 recovery (Cautious)
Lv 12 = ~3800 XP cumulative (extending the RANKS curve).
- Current: 6 XP/day × 173d = ∞ in practice (dropout first)
- New: 34 XP/day × 112d. Still long, **but** the first 600 XP arrive in ≈ 4 sessions because discovery+return+tutorial-proxy front-load 250+ XP. This is the critical change: Cautious **crosses the Lv 5/6 dropout cliff** in week 1 instead of week 6.

**Predicted Cautious Lv 12 reach rate: 50% → ~80%**, median dropping from 1037m → ~620m.

---

## 4. Dedup & anti-farm

- All one-time flags persist in `sws_xp_seen` (object keyed by event id).
- Daily flags in `sws_xp_daily` with a timestamp; cleared by the existing 03:00 daily reset.
- Cooldowns stored as `sws_xp_cd[eventId] = Date.now()`.
- **Presence XP** specifically requires: app in foreground (visibilitychange), no tab switch within window, at least 1 render tick per 20s (prevents sleeping device farming).
- **Dwell XP** requires continuous DOM presence of the element (MutationObserver on carousel close to cancel pending grants).
- **Return XP** gap thresholds crossed once per gap; re-crossing requires the full gap again.
- Boost multipliers (Pollen Rush, Dawn Anthem) **do not apply** to discovery/return/presence XP — only to earned active XP — to prevent buying discovery faster.

---

## 5. Surface / UX treatment

Not every grant toasts. The rule: **toast the teach, silent the ambient.**

| Category | UX |
|---|---|
| Discovery | Small toast at screen bottom: *"+5 XP — first look at the Nursery"*. Teaches what it was for. |
| Reading | Silent. XP bar micro-bump animation only. |
| Presence | Silent. Rolls up into level-up ceremony. |
| Return | Toast on open: *"+15 XP — welcome back"*. Warmer copy for 3d/7d. |
| Observation (bloom) | Existing bloom fanfare already celebrates; append small +5 chip to the fanfare. |
| Pattern | Toast: *"+10 XP — three games explored."* |
| Mastery | Small chip on game-win overlay. |
| Tutorial-proxy | Toast with copy: *"+10 XP — first feral collected. They grow different from garden stock."* |

All XP grants still flow through `PW_grantXP(amount, reason)` — existing keeper-bar update is the baseline animation.

---

## 6. Implementation plan

All hooks land in `/workspaces/lucid-winds/index.html`. Single helper added near line 44197:

```js
window.LW_XP = {
  seen: function(id){ /* read sws_xp_seen */ },
  markSeen: function(id){ /* set + save */ },
  grantOnce: function(id,amt,reason){ if(!this.seen(id)){ this.markSeen(id); PW_grantXP(amt,reason); } },
  grantDaily: function(id,amt,reason){ /* with 03:00 rollover */ },
  grantCooldown: function(id,amt,reason,sec){ /* ts check */ },
  grantDwell: function(id,amt,reason,ms,el){ /* setTimeout guarded by DOM check */ }
};
```

### Phase 1 — Front-loaders (fastest Cautious impact)
- **L 52160** `window.switchTab` — add `LW_XP.grantOnce('tab_'+tab, 5, 'discover_tab')`.
- **L 28151** `window.openCarousel` — `LW_XP.grantOnce('carousel_first', 8, 'discover_carousel')`.
- **L 28310** card flip `classList.toggle('flipped')` — `LW_XP.grantOnce('flip_first', 10, 'discover_flip')`; also start a 2.5s dwell timer for haiku XP (2 XP, unique-key hash, daily).
- **L 29253** `openPlantActionDrawer` — `LW_XP.grantOnce('drawer_first', 5, 'discover_drawer')`.
- **Return XP** — in app-init block (search `DOMContentLoaded` near top of Block 7): compute gap from `sws_last_open`, award 5/15/40/100, then set `sws_last_open=now`.

### Phase 2 — Tutorial-proxy first-of-kind
Wrap existing grants with `grantOnce('first_*')` bonuses:
- **L 36155** water_care — add +10 one-time first_water
- **L 38493** wild_tend_stranger — +15 first_tend
- **L 34622 / 35461** feral_collect — +10 first_feral
- **L 30519 / 36207** cross_pollinate — +15 first_cross
- **L 37101** pattern_named — already 15, add +10 first_pattern
- Wild drop handler (search `wildDrop` / `dropToWild`) — +15 first_drop
- Backpack hold-release (FG_Backpack module Block 17) — +10 first_bp_release

### Phase 3 — Dwell & presence
- **Haiku dwell** on carousel flip (Phase 1 timer).
- **DNA ledger dwell** — `renderDNALedger` at L 26128: start 4s dwell, cancel if carousel closes.
- **Presence minute ticker** — new `setInterval` 60s guarded by `document.visibilityState==='visible'` AND no `switchTab` in last 60s. Cap session/day counters in localStorage.
- **Bloom watched** — in the bloom fanfare path (search `_playWin` near 29010/29041 and bloom mint at 25868): `grantOnce('bloom_watched_'+hash, 5)`.

### Phase 4 — Pattern & mastery
- **Games-per-session counter** — increment on `_playWin` per game id; at 3 distinct, `grantDaily('three_games', 10)`.
- **Win streak** — track on `_playWin` (L 29010), grant at 3/5.
- **Perfect game** — per-game hook (Sudoku no-error flag, Word Search full find, etc.). Deferred if engine doesn't track.
- **Species/biome sets** — on feral collect and on mint, compare set against `sws_seen_species`.

### Phase 5 — Observation & passives
- **Stranger-plant-seen** — Wild tick (L 37487 area) when stranger plant rendered within 75m of player, `grantDaily` 1 XP unique per plant id.
- **Seasonal transition** — in `getSeasonInfo` call site, compare last-seen season; one-time per transition per year.
- **Rain/weather end** — Wild weather controller.

Each phase ships as a separate commit. Phase 1+2 alone projected to lift Cautious out of dropout.

---

## 7. Simulation predictions

Holding Sim A behavioral params constant and adding new XP sources per §3 math:

| Archetype | A: %Lv12 / median | Predicted: %Lv12 / median |
|---|---|---|
| Binger | 0% / n/a | 15% / 900m (return XP on day 2 re-open before they vanish) |
| Breeder | 88% / 821 | 92% / 770 |
| Casual | 0% / n/a | 35% / 950m |
| **Cautious** | **50% / 1037** | **80% / 620m** |
| Chaos | 25% / 821 | 45% / 780 |
| Completionist | 100% / 775 | 100% / 700 |
| Drifter | 0% / n/a | 25% / 1050m |
| Explorer | 67% / 813 | 85% / 720 |
| Grinder | 33% / 770 | 38% / 765 *(minimal change — already saturates)* |
| Lapser | 0% / n/a | 20% / 1100m *(return XP carries them through gaps)* |
| Puzzler | 75% / 754 | 88% / 700 |
| Social | 44% / 536 | 60% / 505 |

**Aggregate Lv 12 reach: 41% → ~62%.** Grinder and Breeder gain least (intended — they're already served). Cautious, Casual, Drifter, Lapser gain most (design target). No archetype moves faster than Completionist, preserving the pacing order.

**Defensive check:** total new XP/day for the *fastest* archetype (Completionist) is +40, less than one extra game-session's worth. No rebalancing of Lv thresholds required; gate ladder (docs/TUTORIAL_PROGRESSION.md) stays intact.

---

## Appendix — events file path
All reasons use the prefix convention already established in `earnDew`/`earnHashes` reason strings so `LW_Log` analytics bucket naturally (`discover_*`, `first_*`, `dwell_*`, `presence_*`, `return_*`, `pattern_*`, `mastery_*`, `observe_*`).
