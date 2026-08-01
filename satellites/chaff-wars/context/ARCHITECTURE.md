# Chaff Wars — Architecture & Handoff

> Context folder for continuing this build (esp. when switching to another model
> for more intricate work). Last updated 2026-07-19. Author: Claude (Opus 4.8).
> See also: `DESIGN-80s-theme.md`, `DESIGN-powers-mode.md`, `ASSET-LIST.md`,
> `STATE.md` in this folder, and the repo design brief `design-briefs/chaff-wars.md`.

## What it is
A faithful **Puyo Puyo / Dr. Robotnik's Mean Bean Machine** remake, botanical-
themed, for the Lucid Winds portal. Single self-contained **ES5** file:
`satellites/chaff-wars/index.html` (~1000 lines incl. a gated dev harness).
Seedpods (5 colors) fall in pairs on a 6×12 board; 4+ orthogonally-connected
same-color pop; pops cascade into **chains**; each chain buries the rival in grey
**Chaff** (garbage). Top out (block spawn column) and you lose.

- Slug/dir: `satellites/chaff-wars/` — DISPLAY name "Chaff Wars".
- gameId: `chaffwars`. Dev hook: `?cwdev=1` → `window.CW_DEV`.
- Deployed via: `git push origin add-sproing-jumper:main` (Hostinger auto-deploys main).
- Portal card: in `portal/index.html` FEATURED array; thumb `portal-assets/thumbs/chaff-wars.png`.

## File layout (one file, two inline `<script>` blocks)
1. **External includes** (top): `/sunbeam-sdk.js?v=4` (sunbeam earn bridge).
2. **Block 1** (~2 lines): tiny bootstrap.
3. **Block 2** (~950 lines): the whole game. Sections in order:
   - CSS `:root` vars + screen/HUD/control styles (top `<style>`).
   - HTML screens: `#s-title`, `#s-select` (ladder), `#s-play` (board + `.ctrlbar`),
     `#s-how`, `#s-set` (settings), `#s-go` (result).
   - JS: storage/settings (`SET`, `PROG`, `LS`), audio (`SFX`, `ac()`, `hap()`),
     ENGINE (constants, `computeResolve`, gravity, groups, chaff), AI
     (`aiKnobs`, `evalBoard`, `AI_TUNE`, `REF_K`, `pestKnobs`, `pestChooseMove`),
     ROSTER (14 opponents), FIELD state machine (`makeField`, `spawnPiece`,
     `resolveTick`, `finishResolve`, `dropPending`, `afterTurn`), MATCH loop
     (`update`, `tickField`, `loop`), RENDER (canvas), screens/wiring, PWA/music,
     `_sbCapEarn`, and the **gated `?cwdev=1` dev harness**.

## Engine (source of truth for mechanics)
- Board: `COLS=6, ROWS=13` (row 0 hidden spawn buffer), `VISROWS=12`,
  `SPAWN_COL=2`, `CHAFF=6`. Cell values: 0 empty, 1..5 colors, 6 chaff.
- `computeResolve(grid)` — instant full resolution (used by AI): applies gravity,
  finds 4+ groups, pops, shatters adjacent chaff, cascades. Returns
  `{chain, score, cleared, chaff, allClear}`. **This is the correctness anchor**
  (`CW_DEV.proofCheck()` validates: 4-pop, chaff shatter, 2-chain, score=40).
- Scoring: `score = 10*cleared * clamp(chainPower + colorBonus + groupBonus, 1, 999)`.
  Constants: `CHAIN_POWER_TSU/CLASSIC`, `COLOR_BONUS`, `groupBonus()`, `TARGET_POINTS=70`,
  `ALLCLEAR_NUIS=30`, `GARBAGE_CAP=30`. Garbage sent = `floor((score+carry)/70)`.
- **Ruleset:** `var RULES={classic:false}` — DEFAULT **Tsu** (offsetting + all-clear +
  linear chain ramp). Stephen confirmed Tsu (2026-07-19). `RULES.classic=true` =
  authentic Puyo-1/MBM (no offset, no all-clear, 999-cap curve). One boolean.
- Live resolution is ANIMATED via `resolveTick(f,dt)` sub-states (grav→scan→pop);
  `finishResolve` computes outgoing chaff + offsetting; `dropPending` drops
  incoming chaff; `afterTurn` spawns next / ends match.

## The AI (this was the hard part — read before changing)
The pest AI is `pestChooseMove(f)` (called by `planAI` on each spawn; executed by
`aiUpdate` over the pest's react-timer, which hard-drops when it reaches its
target OR is blocked — the **stuck-guard** on `f.aiStep`, added to fix a freeze bug).

- **`REF_K`** (main code): the "competent player" knob set for `evalBoard` — fires
  2+ chains, keeps board low, offsets, emergency-fires in danger. A q=1 pest uses
  exactly this, so it plays like a competent human.
- **`pestChooseMove`**: uses `REF_K` for building + a danger-zone emergency-fire
  (spawnH≥9 or maxH≥11 → fire the biggest immediate clear / flatten). Skill scales
  DOWN via a **blunder rate** `blunderP = floor + (max-floor)*(1-q)^exp`
  (`AI_TUNE.blunderFloor/blunderMax/blunderExp`). On blunder, pick from the weaker
  half of placements. **Danger-zone moves never blunder** (no self-suicide).
- **`AI_TUNE`** (baked defaults, tuned to Stephen's "Classic arcade ramp"):
  `{blunderFloor:0.30, blunderMax:0.66, blunderExp:0.76, ...}`.
- **Per-pest difficulty** comes from `ROSTER[i]`: `q` (skill 0.10→1.0), `react` (ms,
  900→230, speed/pieces-per-sec), `colors` (4 or 5), `startChaff` (rows pre-dropped
  on player for late pests), `hcap` (outgoing chaff multiplier). Tune INDIVIDUAL
  pests by editing these (that's how Cutworm/June Beetle were smoothed + secret eased).

### ⚠️ STALE as of 2026-08-01 — the ramp below predates the reflatten
Stephen 8/01: "just the third level alone moved super fast and the AI was really
hard to beat". `fall`, `q`, `react` and `hcap` were re-curved per-stage (see the
long comment above `var ROSTER` in index.html for every before/after number and
why). Stages 12-14 were deliberately left alone, so the TOP of the ladder should
still measure roughly as below; stages 1-8 are now materially easier. **Re-run
`sweep()` before quoting any of these numbers.** `AI_TUNE` was NOT changed.

### Measured ramp (competent player, 20-seed sweep, 2026-07-19)
~90% early (pests 1-4) → ~60% mid (5-9) → ~33% late (10-12) → ~20-35% boss →
~15-20% secret. Roughly monotonic. ±~15% natural run-to-run variance because AI
blunders use `Math.random()` (unseeded — good for replayability, noisy for tuning).

## CW_DEV harness (how to verify + re-tune — USE THIS, don't hand-mirror the engine)
Load `?cwdev=1`, then `window.CW_DEV`:
- `proofCheck()` → engine correctness (must stay all-pass after ANY engine edit).
- `sweep(seeds, opts)` → per-pest win-rate table for the reference player.
  `opts = {cadence, pBlunder, maxMs, tune:{blunderFloor,...}}`. cadence=player
  think-ms (lower=faster), pBlunder=player imperfection. **Competent yardstick =
  `{cadence:430, pBlunder:0.15}`**. `tune` overrides AI_TUNE WITHOUT recompiling
  (for searching). Higher floor = weaker top pests; higher max = weaker early pests.
- `playMatch(stage, seed, opts)` → one faithful full match (runs the REAL `update()`
  loop so pest speed matters). `diag(...)` → same + piece/fire counts.
- Run headless: `node scripts/satellite_probe.js chaff-wars CW_DEV cwdev "sweep([1,2,3,4,5,6,7,8,9,10],{cadence:430,pBlunder:0.15,maxMs:80000})"`.
- **Two harness bugs previously masked everything** (now fixed): a pest freeze
  (aiUpdate retried a blocked rotation forever) and the reference player's cadence
  never throttling (`pAcc` reset to `cadence` not `0` during resolve → superhuman
  yardstick). If tuning ever looks "flat 100%", suspect the yardstick first.

## Controls + shell (what "everything the studio has" means here)
- **Control bar** (`.ctrlbar`, responsive flex): ◀ ▶ (move, hold-to-repeat), ▼ (soft
  drop hold), ⟳ (rotate, also tap left half of board), big green **DROP** (hard drop).
  Keyboard: arrows + Z/X + space. **Big Controls** toggle → `body.bigctrl` scales
  height 90→116px + font (`applyBig()`), default ON. **Haptics** (`hap()`) on presses.
- **Settings** (`#s-set`): Sound, Ghost drop guide, Big controls, Fullscreen (Android/
  desktop; iOS uses Add-to-Home), Add to Home Screen (PWA install), Reset progress.
- **PWA**: `manifest.webmanifest`, `sw.js`, `icons/icon-192.png` + `icon-512.png`.
  Install button wired (`beforeinstallprompt` + iOS fallback alert).
- **Music**: `#b-music` on title → loads `/music-tracks.js` (`LW_TRACKS`) + `/music-player.js`
  (`SWSPlayer`). ⚠️ Currently gated to **standalone-only** (hidden when embedded in
  the portal iframe) — see STATE.md; enabling in-portal music is a TODO.
- **Sunbeams**: `window._sbCapEarn(n, tag)` — 30/day cap, bridges to `window.Sunbeam`.
  Called on campaign win (2 per pest 1-11, 3 for 12-13, +2 completion), replay, solo.
- Back-to-portal, embed handshake (`postMessage {sws:'ready'}`), safe-area insets.

## Modes
- **Campaign** ("Keeper's Stand"): 13 pests + 1 secret (Ronin Hare), unlock ladder,
  `PROG` persistence. **Solo Endless**. Best-of-3 for bosses is designed, v1 = single.
- **Powers mode** (NEW, in design): see `DESIGN-powers-mode.md`. Classic stays pure.

## Conventions / gotchas
- ES5 only (no const/let/arrow). Verify: extract `<script>` blocks and `new vm.Script()`.
- A syntax error kills the whole block. Always parse-check before commit.
- No em-dashes in player-facing copy (Lucid Winds rule). Readable fonts, colorblind-safe pods.
- Bump nothing's cache unless needed; portal thumbnails ≤150KB/≤480px.
