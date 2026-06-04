# Earn-amount audit — LW vs `/play/` shells

> Side-by-side of how many sunbeams a player earns for the same event
> across the two surfaces, plus the design questions raised.
> Generated 2026-06-04. Data sourced verbatim from
> `index.html:62004-62073` (LW's `_aw` table) and `play/shell.js`
> (the shell's `EARN` constants).

---

## TL;DR

- **The shell pays a flat generic amount per event type. LW pays a per-game tuned amount.** The two will diverge for every game whose `_aw` entry isn't exactly the shell defaults.
- **For `game_win` specifically: shells pay 8 to every game. LW pays 2–8 depending on the game (avg 4.5).** 57 of the 65 shelled games have a divergent `game_win` value; the shell overpays in 100% of those cases.
- **Net effect today:** a player who finishes Memory at `lucidwinds.com/play/memory.html` earns 4× the sunbeams they would for the same play inside the LW main app. That's a real economy leak.
- The shell guards still apply (300/min, 5000/day server-side; 100/min, 500/day anon client-side), so the leak is bounded — but inside those caps, shell players are systematically advantaged.
- **Three options below.** Stephen picks one and I implement.

---

## §1 — LW's per-game `_aw` table (live source: `index.html:62004-62073`)

Quoted verbatim. The lookup at runtime is `_aw[gameId][eventName] || _aw[gameId].default || 0`.

```
game_win value | count | games
─────────────────────────────────────────────────────────────────────────
            2  |   4   | flood, lights, memory, simon
            3  |   6   | hanoi, pipe, slider, sokoban, stonegarden, stopten
            4  |  18   | c4, colorsort, dailybloom, golf, kakuro, livingstones,
                          mosaic, numbergarden, petalmatch, pottingbench, recall,
                          rootflow, rootmaze, rootrush, seedtoss2, sprout (et al.)
            5  |  24   | battleship, bleedinghearts, bowergarden, checkers,
                          cribbage, doubleshutter, farkle, gardenlines,
                          gardenspades, jade, juniper, mastermind, mines,
                          pyramid, set, vinecross, vinewords, wordsearch, yahtzee,
                          picross, tripeaks (et al.)
            6  |   5   | backgammon, freecell, klondike, pollen, trellis
            8  |   2   | chess, spider
       (none)  |   8   | bloomwheel, breathing, colorgarden, petalfall,
                          pixelgarden, rhythmvine, song, storyseeds
                        (creative/endless — milestone-only, no win event)
```

LW progress-event values (`progress`, `milestone`, `cleared`, `capture`, etc.) are almost universally **1**. A handful of games use 2 for `milestone` (pixelgarden, gardenlines, stonegarden, mosaic, bloomwheel). `game_loss` is 0 or 1 across the board.

---

## §2 — Shell's flat `EARN` table (live source: `play/shell.js`)

```js
var EARN = {
  progress:      1,
  milestone:     2,
  cleared:       2,
  capture:       2,
  flip:          1,
  hit:           1,
  sequence:      2,
  pheno:         3,
  puzzle_solved: 5,
  game_win:      8,    // ← every game gets 8 on win
  game_loss:     1
};
```

No per-game branching. The same `game_win` event in chess and memory both pay 8 sunbeams.

---

## §3 — Divergence summary

| Event | LW range | Shell flat | Notes |
|---|---|---|---|
| `progress` | mostly 1 | 1 | matches |
| `milestone` | mostly 1, a few 2 | 2 | shell overpays the 1-milestone games |
| `cleared` | 1 (mines) | 2 | shell 2× |
| `capture` | 1 (checkers) | 2 | shell 2× |
| `flip` | 1 (reversi) | 1 | matches |
| `hit` | 1 (battleship) | 1 | matches |
| `pheno` | 1 (set) | 3 | shell 3× — but set is hub-only so the shell never fires this |
| `puzzle_solved` | — | 5 | not in LW table, shell-only |
| `sequence` | — | 2 | not in LW table, shell-only |
| **`game_win`** | **2–8 (avg 4.5)** | **8** | **57/65 games divergent; shell always wins** |
| `game_loss` | 0 or 1 | 1 | shell overpays the 0-loss games |

### Sample per-session impact

A casual "10 progress events + 3 milestones + 1 win" rough yield model:

| Game | LW session ≈ | Shell session ≈ | shell pays |
|---|---|---|---|
| Memory | 12 | 24 | 2.0× |
| Simon | ~3 (event mismatch — LW `round`=1 but game fires `milestone`; LW pays ~3, shell ~10) | ~10 | ~3.3× |
| Lights | 2 | 24 | 12.0× |
| Flood | 2 | 24 | 12.0× |
| Sudoku | 18 | 24 | 1.3× |
| Chess | 8 (only fires `game_win`) | 8 (only fires `game_win`) | 1.0× |
| Spider | 21 | 24 | 1.1× |
| Klondike | 19 | 24 | 1.3× |
| Battleship | 5 (only `hit` + `game_win`) | 24 | 4.8× |
| Rootrush | 17 | 24 | 1.4× |

The biggest gaps appear in games where LW's `_aw` entry only defines a few events (chess, battleship, lights, flood) — the shell's generic table covers everything the game might fire.

The shell **also** has narrower anti-farm guards (default `_afSessionCap = 20` per session in LW; shell has no session cap), so endurance plays favor the shell even more.

---

## §4 — Why it matters

**Economy:** with the cosmetics MVP and the cross-studio currency narrative, every divergence becomes a routing decision. A player who learns "I get more for the same game in the shell" will play in shells; the LW main app becomes the loss-leader hub. That may or may not be what Stephen wants.

**Tuning:** LW's `_aw` table is hand-tuned (per the commit history, Stephen has revised it many times for balance). The shell's flat table was chosen for shipping speed, not for parity. Adopting parity surfaces the per-game balance work into the shells too.

**Anti-fraud:** server caps already ceiling the abuse risk. This is a fairness + design issue, not a security one.

---

## §5 — Three options

### Option A — Status quo (do nothing)

Shells stay generous; players know the shells are the casual/easy surface; LW stays the deep app with its own tuned economy. Accept the divergence as a feature ("shells are easier on currency, hub is the deep game").

- **Pros:** Zero work. Shells stay fast to ship.
- **Cons:** Shells subtly outcompete LW for player attention. Cross-studio cosmetic spend math becomes weird (shells become farm sites).

### Option B — Flat conservative defaults

Lower the shell's `EARN` to match the LW median:

```js
var EARN = {
  progress:      1,
  milestone:     1,   // was 2
  cleared:       1,   // was 2
  capture:       1,   // was 2
  flip:          1,
  hit:           1,
  sequence:      1,   // was 2
  pheno:         1,   // was 3
  puzzle_solved: 3,   // was 5
  game_win:      4,   // was 8 (matches LW median 4-5)
  game_loss:     1
};
```

- **Pros:** Small edit (10 lines in `play/shell.js`). Closes ~90% of the divergence. No data plumbing.
- **Cons:** Still flat — chess pays the same in shell as memory. Some divergence remains.

### Option C — Single source of truth (recommended for the long run)

Move the `_aw` table out of `index.html` into a shared file `shared/earn_table.json` (or `.js`). LW loads it. Shells load it via `play/shell.js`. Players earn identical amounts in both surfaces. Stephen tunes the table in one place.

- **Pros:** True parity. Stephen's existing tuning work auto-propagates to shells. Sets precedent for the Phase-1 "extract `_G` to shared library" work in `STUDIO_PLAN.md §5`.
- **Cons:** Requires editing `index.html` once to read from the shared file (replace the inline `var _aw={...}` with a `<script src="shared/earn_table.js">`). Then a `_G` contract test + drift watchdog pattern guards both directions. Half-day of work, including verification.

**My recommendation: B now, C when the cosmetics MVP starts.** B is a 10-line change Stephen can approve and I can ship in 15 minutes — closes most of the leak without touching `index.html`. C is the right long-term answer but it's also Phase 5 of the studio plan, which doesn't unblock anything else today.

---

## §6 — Design questions for Stephen

Same vibe as `STUDIO_PLAN.md §7`. Pick any subset to answer; B above can ship without answers.

1. **Is the divergence a feature or a bug?** If it's a feature ("shells are easier"), Option A stands. If it's a bug, B or C.
2. **Should the shell's session-level anti-farm guard mirror LW's `_afSessionCap = 20`?** Today shells have no session cap; LW does.
3. **What's the target per-session yield?** LW currently varies wildly (~2 to ~21). If there's an intended target (say "20 sunbeams per casual session"), tuning becomes a target-driven exercise.
4. **`game_loss` for endurance games (petalfall, pollen).** Shell pays 1 on loss; LW pays 0 or 1. Worth aligning?
5. **Creative/endless games (bloomwheel, breathing, song).** LW defines no `game_win` for these; shell's 8 never fires because the game module doesn't call `_e('game_win')`. Quietly aligned today. Worth adding `milestone`-based rewards to keep them earning?

---

## §7 — Next steps (if you want me to ship B)

I'd:
1. Edit `play/shell.js`: replace the `EARN` constants with the median values from Option B.
2. Re-run `node scripts/smoke_shells.js` (still 65/65 — nothing about earn amounts changes mount behavior).
3. Re-run `node scripts/test_g_contract.js` (still GREEN — `_G.e` signature unchanged).
4. Commit: "Shells: lower flat EARN defaults toward LW median".

That's the whole change. Say "ship B" and I ship.

For C, send the green light + an answer to design question #1 above, and I'll scope the half-day.

---

*Companion files: `STUDIO_PLAN.md` (broader cosmetics + Phase plan),
`PARTNER_INTEGRATION.md` (external SDK contract), this file (per-game
earn parity).*
