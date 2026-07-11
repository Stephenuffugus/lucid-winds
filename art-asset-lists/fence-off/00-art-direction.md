# Fence Off — Art Direction

**Game:** `satellites/fence-off/index.html` — Quoridor homage vs AI on a 9x9 yard.
Move a pawn or plant a fence; exact jump + diagonal-block rules; the TWIST is the once-per-game
**Vault** that climbs a fence and turns it into a **gate open to both pawns**.
4 modes: Duel Ladder (3 AI rungs) / Daily Puzzle (seeded forced-win, solver-proven) / Blitz (10s turns) / Zen Sandbox.

**What is art-wireable vs engine-drawn (read first):**
Everything is procedural canvas right now (`draw()`, `drawPawn()`, `drawFenceBar()` in the code).
Wire-in scope, cheapest first:
1. **Full-bleed backdrops** behind the board (one per board theme in `BOARDS`: slate/midnight/parchment) — drop-in, draw before the cell loop in `draw()`.
2. **UI chrome** — HUD chips, dock buttons (FENCE / flip / VAULT / place / cancel), title wordmark, over-screen ribbons, wardrobe cards.
3. **Pawn sprites** via `drawImage` in `drawPawn()` — small render patch, spec in sheet 01, flagged PATCH-REQUIRED.
4. **Fence / gate sprites** via `drawImage` in `drawFenceBar()` — PATCH-REQUIRED, spec in sheet 02 (H bars supplied; rotate 90° for V at draw time).
5. **FX sprites** (vault arc, gate flash, win burst) — PATCH-REQUIRED, sheet 03.

---

## Style options (pick one; all sheets bake the chosen STYLE block)

### Option A — **Tin Yard** (LEAD, RECOMMENDED — non-botanical)
Vintage wind-up tin toys dueling across a workshop floor. Pawns are enamel-painted tin figures
with visible wind-up keys; fences are pressed-metal planks with brass rivets; the vault gate is a
little copper archway that stamps itself into the fence. Warm, catchy, collectible-feeling —
kid-friendly without being childish, and zero garden anywhere.
*Palette anchors:* slate #11141c base, brass #c9a34a, amber #e0b64f, steel indigo #7f8cff, enamel cream #e8dcc8.
*Reference vibes:* antique tin toy boxes, Machinarium warmth without the grime, a good chess set's heft.

### Option B — **Summit Rams**
Two stubborn mountain rams racing to opposite cliff ledges at dusk; fences are wooden stockades,
the vault is a literal goat-climb (the animation writes itself). Charming animal angle, strong
kid appeal; slightly softer/rounder look than A.
*Palette anchors:* dusk teal #14303a, pine #2f5d46, wool cream #efe6d4, horn amber #d9a55a, sky rose #e58fa0.

### Option C — **Neon Gridlock**
Circuit-board duel: data couriers, firewall fences, a jumper-wire vault. Crisp and cool but it
overlaps Nova Bloom's Vector Nova look, so only pick if we want the two paired.
*Palette anchors:* black #0a0e12, cyan #9ee6ff, magenta-pink #e58fa0, gold #ffd76a.

**Recommendation: Option A (Tin Yard).** It photographs beautifully at thumbnail size, keeps the
board readable (art frames the grid, never fights it), and gives the vault gate a physical, jingly
identity that sells the twist.

---

## Cosmetics economy (already live in code — `WARD` array, `fenceoff_save`)

| Lane | Item | Threshold (from code) |
|---|---|---|
| Pawn | Sunmark | free |
| Pawn | Lantern | win 3 duels |
| Pawn | Comet | beat the Yard Warden (rung 2) |
| Pawn | Crown | beat the Master Fencer (rung 3) |
| Fence style | Timber | free |
| Fence style | Brass | place 50 fences lifetime |
| Fence style | Ivory | daily streak 3 |
| Board | Slate Yard | free |
| Board | Midnight Court | win 10 duels |
| Board | Parchment Plan | win 5 daily puzzles |

No lootboxes, no purchases. Ids in code stay stable even if display names change.

---

## STYLE BLOCK (bake into every sheet prompt — Option A)

> Tin Yard style: vintage wind-up tin toy game art, warm enamel paint on pressed metal,
> brass rivets and copper edges, soft studio lighting, deep slate blue workshop tones,
> subtle painted wear, crisp game-asset silhouettes, no text, no watermark, flat FF00FF
> magenta background for cutout.

Sheets: 01 pawns · 02 fences + gates · 03 fx · 04 board backdrops · 05 UI.
Every sheet: flat #FF00FF magenta ground, cells annotated with hex pixel sizes, cut via
magenta-KEY-distance (NOT hue) per `reference_cutout_script`.
