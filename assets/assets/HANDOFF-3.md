


# POLLEN PANIC — Engineering Handoff
**A Lucid Winds game · v4 FINAL · single-file HTML5 canvas game**

This document is written for Claude Code (or any engineer) integrating `pollen-panic.html` into the Lucid Winds website. Everything below is accurate to the shipped file.

---

## 1. What this is

A botanically-themed maze-chase arcade game (Pac-Man-genre — original IP, no Bandai Namco names, characters, or art). One self-contained HTML file: no build step, no dependencies except Google Fonts (Fraunces + Silkscreen, loaded via `<link>`; the game degrades gracefully to monospace if fonts fail).

**Design lineage (researched):** classic arcade AI (scatter/chase waves, 4 pest personalities), Ms. Pac-Man (rotating mazes, wandering bonus fruit), Super Pac-Man (giant mode), CE DX (score-attack mode, ghost-train chaining via "drones," panic Gust button, score-based recharges), Pac-Man 256 (seed-chain combo with rising chomp pitch, daily missions, cosmetic economy).

## 2. Fastest integration

```html
<!-- Option A: iframe (recommended — zero CSS conflicts) -->
<iframe src="/games/pollen-panic.html"
        style="width:100%;height:100dvh;border:0"
        allow="autoplay"></iframe>
```
Option B: serve the file at its own route (it is a complete page).
Do NOT inline it into an existing page — it owns `body` layout, touch handling, and key events.

Mobile: the page sets `touch-action:none` and handles swipe itself. Serve over HTTPS so AudioContext resumes reliably on first tap.

## 3. Persistence

Storage adapter (in `store` object, ~line 210) tries in order:
1. `window.storage` (Claude artifact env) → 2. `localStorage` (**your website — this is what will run**) → 3. in-memory.

Single key: `pollen-save`. JSON schema:
```json
{
  "petals": 0,
  "bests":  {"classic":0,"meadow":0,"superb":0,"rush":0},
  "top":    {"classic":[{"s":12345,"d":"2026-7-2"}]},
  "missions": {"date":"2026-7-2","list":[{"id":"seeds","prog":120,"claimed":false}]},
  "owned":  ["ladybug","day","dot","none","classic", "..."],
  "skin":"ladybug","theme":"day","seedStyle":"dot","trail":"none","muted":false
}
```
v2/v3 saves migrate automatically (`loadSave()`).
**To add server-side leaderboards:** post `{mode, score}` inside `gameOver()` (search `save.top[gameMode]`) — that is the single choke-point where finalized scores exist.

## 4. Architecture map (single `<script>`, top to bottom)

| Section | What lives there |
|---|---|
| MAZES | 8 boards: 2 hand-built + 6 generator-made. 19×21 char grids. `#` hedge, `.` seed, `o` bloom, `=` house door, `G` house interior, space = tunnel. All machine-validated: symmetric, fully connected, zero dead ends, no pest traps. |
| MODES / THEMES / SKINS / SEEDSTYLES / TRAILS | Pure data registries. **Adding a cosmetic = adding one object entry.** Shop/menu render from these automatically. |
| store / loadSave / persist | Persistence adapter (see §3). |
| AUDIO | WebAudio synth; no assets. `SFX.*` one-liners. Chomp pitch scales with `chain`. |
| MOVEMENT | `stepEntity()` — sub-stepped snap-to-center. Sim-verified: 2.4M frames, 0 wall violations. `tryTurn()` — corner assist: buffered input fires within ±0.45 tiles of a legal corner (snaps back or forward). **Do not "simplify" these two functions.** |
| GAME FLOW | `startGame/resetPositions/levelClear/gameOver`, pause, gust. |
| PEST AI | `choosePestDir` — classic per-personality targeting, scatter/chase `WAVES`, fright random-walk. |
| UPDATE | Main tick: chain decay, breadcrumbs, drone train, fruit, pests, collisions, rush timer. |
| MISSIONS | Daily rotation (date-seeded from `MISSION_DEFS`), progress from `runStats`, petals awarded in `gameOver`. |
| RENDER | Off-screen maze cache (`renderMazeOffscreen`, rebuilt on theme/maze change via `offMaze=null`), then per-frame entities. Each character is one draw function. |
| HUD/MENU/SHOP | DOM overlays driven by the data registries. |

## 5. Tuning constants (all in one place-ish)

| What | Where | Current |
|---|---|---|
| Player speed | `update()` → `base` | 6.6 t/s (8.6 in Super) |
| Pest speed | `update()` pest loop | 6.2 t/s, ×0.6 in tunnels |
| Level speed ramp | `speedScale()` | +3.5%/level, cap 1.45× |
| Corner assist window | `CORNER` | 0.45 tiles |
| Fright duration | `eatAt()` | max(2.5, 6 − 0.4·level) s |
| Scatter/chase waves | `WAVES` | 7/20/7/20/5/20/5/∞ s |
| Chain timeout / milestones | `eatAt()` | 1.2 s; +100 @×25; +1000 & 4s fright @100 |
| Gust charges | `useGust`/`addScore` | start 1, +1 per 2500 pts, cap 3 |
| Extra life | `addScore()` | 10,000 pts, once (not in Rush) |
| Drones per level | `buildGrid()` | lvl≥2: min(4, 1+⌊lvl/2⌋) |
| Fruit spawns | `eatAt()` | at 50 & 120 seeds eaten |
| Petals | `gameOver()` | ⌊score/100⌋ + 25/clear + 5/berry, × mode mult |

## 6. Economy summary

Modes: Classic free · Meadow 250 · Super Bloom 400 · Petal Rush 600 (petal mult 1 / 1.5 / 1.5 / 2).
Cosmetics: 8 skins (0–600), 6 themes (0–500), 4 seed styles (0–200), 4 trails (0–400).
Missions: 3/day, 40–80 petals each. Total sink ≈ 5,700 petals.

## 7. Custom art swap (when Lucid Winds assets are ready)

Current art is 100% canvas-vector. To swap to sprites:
1. Deliver transparent PNGs, 128×128 per frame, horizontal strips: player skins (4-frame chomp), each pest (2-frame idle), wilted (2), dandelion-eaten (1), bloom (4), sunberry (1), drone (2 + sleep).
2. Preload into an `IMAGES` map at boot.
3. Replace the body of the matching draw function (`drawPlayer`, `drawPest`, `drawBloom`, `drawFruit`, drone block in `frame()`) with `ctx.drawImage(...)` — rotation/translation scaffolding is already there. Add an `img` field to each `SKINS` entry so purchased skins pick their sheet.
Hedge walls: either keep vector (theme-tinted, cheap) or provide a 3-tile hedge tileset (straight/corner/cap) and extend `renderMazeOffscreen`.

## 8. Adding a maze

Boards are 19×21 strings. Rows 6–12 (house block) must stay identical to existing boards. Requirements: horizontal symmetry, row 9 tunnel, no dead ends (every open cell ≥2 open neighbors), everything reachable, ≥4 `o` blooms, row-5 openings at cols 4/8/10/14 and row-13 at 4/6/12/14 to meet the house block. Add to `MAZES` array — mode rotation picks it up automatically. (A generator + validator exists from development; ask and it can be included as a dev tool.)

## 9. QA checklist (all passing at handoff)

- [x] Movement: 2.4M-frame randomized sim, 0 wall clips / OOB, all 8 mazes
- [x] All mazes: connectivity, no dead ends, no pest traps from any entry direction, fruit/exit tiles open
- [x] Corner assist: 238k assisted turns in sim, 0 violations
- [x] JS syntax + mission rotation + chain math verified headlessly
- [x] Save migration v2→v4; storage fallback chain
- [ ] Manual on your site: iframe sizing on iOS Safari (100dvh), audio unlock on first tap, localStorage persists across reloads

## 10. Roadmap candidates (not built)

Server leaderboards (see §3 hook) · account-linked saves · sprite art pass (§7) · "Overgrowth" endless mode with creeping bramble (256-style glitch) · booster loadouts · achievements. 

**Licensing note:** this codebase is 100% original — no third-party engine code was used, so you have no GPL obligations. If you ever pull code from masonicGIT/pacman (discussed as a reference engine), that is GPL-3 and would require open-sourcing the derivative.
