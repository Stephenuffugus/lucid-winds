# Companion Boosts — Specification & Balance Audit

**Last verified:** 2026-04-14 (stress-tested, multiplayer-guarded)

## Hard rules (non-negotiable)

1. **No companion boost fires in multiplayer.** Any game with 2+ humans on the same device sets `window._LW_inMultiplayer = true`. `LW_Comp.peek()`, `LW_Comp.use()`, and `LW_Comp.observeWin()` all return null while the flag is true. No XP accrues, no effect fires, no asymmetric advantage is possible.
2. **Solo vs AI is NOT multiplayer.** The human IS the only human. Boosts apply normally. AI opponents are not disadvantaged in a meaningful "fairness" sense — they're procedural, not peers.
3. **One boost per game per tab-session.** `_used[slug:gameId]` flag prevents any boost from firing more than once per session. Repeat reads return the current value but grant no XP and no fresh effect.
4. **Boosts only affect games listed in `BOOSTS[slug].games`.** Unlisted games receive nothing, even if the companion is equipped.

## Multiplayer-guard test matrix

| Game | Uses companion boost? | Multiplayer-capable? | Guard wired? |
|---|---|---|---|
| Fast Math (numbergarden) | YES (Toad) | No | N/A |
| Stone Garden | YES (Mammoth, Phoenix) | No | N/A |
| Mines | YES (Beholder) | No | N/A |
| Master Pollinator (pollen) | NO | **YES** | **Yes — sets flag on ≥2 humans, clears on finishGame / newGame** |
| All other games | NO | No | N/A |

No current boost targets a multiplayer game. The guard is defensive plumbing for future additions.

## Wired boosts (4 live)

### 🐸 TOAD · Fast Math time bonus

| Field | Value |
|---|---|
| Game | `numbergarden` (Fast Math) |
| Level 1 effect | sessionTime +10s (60 → 70) |
| Level 2 effect | sessionTime +15s (60 → 75) |
| Level 3 effect | sessionTime +25s (60 → 85) |
| Fires when | `_NGN()` starts a new run |
| Balance | Fast Math is a speed/accuracy drill. +10s is ~16% more time; +25s is ~42%. Competitive leaderboard is local-only (lifetime best) — no cross-player comparison, so bonus doesn't create inequity. |
| Edge cases | Player hits `_NGN` multiple times in a session → first call fires use(), later calls read value via already-used path. sessionTime recalculates each start, boost applies every run. |

### 🔥 PHOENIX · Stone Garden Challenge revive

| Field | Value |
|---|---|
| Game | `stonegarden` Challenge mode only (`m==='challenge'`) |
| Level 1 effect | 1 revive / run (restore 1 life) |
| Level 2 effect | 2 revives / run |
| Level 3 effect | 2 revives + bonus life restoration on first revive |
| Fires when | `gameOver()` is about to end the run AND `phoenixRevives > 0` |
| Balance | Challenge is 3-lives-and-done. +1 revive = +33% lives. Zen mode ignores Phoenix entirely. Challenge is not leaderboarded across players. |
| Edge cases | `phoenixRevives` is allocated once at `begin()` via use(). If player exits mid-run and starts a new Challenge in same session, revives NOT refreshed (one allocation per session). Correct — prevents revive farming. |

### 🦣 MAMMOTH · Stone Garden stability

| Field | Value |
|---|---|
| Game | `stonegarden` (both Zen and Challenge) |
| Level 1 effect | Gravity ×0.9625, angDamp +0.0075, linDamp +0.00015 |
| Level 2 effect | Gravity ×0.9375, angDamp +0.0125, linDamp +0.00025 |
| Level 3 effect | Gravity ×0.9, angDamp +0.02, linDamp +0.0004 |
| Fires when | `begin()` reads peek.value; applies passively every frame |
| Balance | Stones settle faster, fight tilt harder. Makes tall stacks more achievable. Bests leaderboard IS local-only (lw_sg_best, lw_sg_best_score) — no cross-player inequity. Arc detection thresholds unchanged so scoring pace is untouched. |
| Edge cases | If peek returns used:true on subsequent runs in same session, value still applies passively (peek.value is read, not consumed). XP only banks once per session via the `!mm.used` guard. |

### 👁 BEHOLDER · Mines first-click safe reveal

| Field | Value |
|---|---|
| Game | `mines` |
| Level 1 effect | Reveals 3 random safe cells after first click |
| Level 2 effect | Reveals 5 cells |
| Level 3 effect | Reveals 7 cells |
| Fires when | First click triggers `pl()` and `fi=false` |
| Balance | Mines has no score competition — only completion. Pre-reveal shortens the puzzle by 3-7 cells out of a 64-225 cell board (4.5-10.9% of board at Lv 1, 3.1-4.3% at Lv 3 on Hard). Direct reveal (no cascade), so no domino effect on adjacent zero-count regions. |
| Edge cases | Player re-hits New Game in same session → peek returns used:true → boost doesn't re-fire. Correct — one boost per session. |

## Friendship XP system

| Source | Grant |
|---|---|
| Specific boost fires (via `use()`) | +1 XP to that companion |
| Any game won while equipped (via `observeWin()`) | +1 XP (skipped if boost-match already granted one to avoid double-dip) |
| Multiplayer games | **Zero XP granted while `_LW_inMultiplayer` is true** |

| Level | XP threshold | Flavor |
|---|---|---|
| 1 | 0–14 | Cub (initial) |
| 2 | 15–39 | Grown |
| 3 | 40+ | Elder (max) |

Roughly 15 game-sessions → Lv 2. 40 sessions → Lv 3. Tuned for weeks-of-play pacing.

## Test harness

See `tests/companion-boosts.js` (headless node test). Exercises:
- Each boost fires with correct value at each level
- Used-flag prevents double-fire in same session
- Multiplayer flag prevents all fire
- `observeWin` grants XP only in solo
- Level thresholds trigger at 15 and 40 XP

## Deferred (not yet wired, needs supporting mechanics)

- **Heron** → Sudoku/Picross undo — those games have no undo system yet
- **Spider** → Word Search/Vinewords/Sprout hints — no hint buttons in those games
- **Raccoon** → Merge/PetalFall peek-next — neither game tracks upcoming-piece state

If any of these get wired, this spec must be updated and the test harness extended.
