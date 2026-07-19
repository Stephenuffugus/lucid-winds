# Pop N Lock (formerly Chaff Wars) — Current State & TODO

Last updated 2026-07-19 EVE (session: rename + art pack + MULTIPLAYER v1).
Display name is **Pop N Lock** (Stephen's pick; pods POP, pieces LOCK, the dance).
Slug/gameId/save keys unchanged: `satellites/chaff-wars/`, `chaffwars`, `cw_*`/`sw_sb_chaffwars`.

## ⚡ NEW THIS SESSION (all deployed to main)
- **RENAME** → Pop N Lock everywhere player-facing (title, HUD, manifest, portal card,
  install strings). sw cache bumped v2. Commit 42709c77.
- **MULTIPLAYER v1** (commit 960cf010) — room-code versus. See VERSUS section below.
  ⛔ **STEPHEN ACTION REQUIRED: deploy `firestore-rules-8.txt` (repo root) via Firebase
  Console → Firestore → Rules — online rooms are DENIED until then** (lobby shows a
  friendly "not switched on yet" message). Local relay + bot proof work without it.
- **ART PACK** — `art-asset-lists/pop-n-lock/` (00 + 9 sheets, "Neon Boombox": 80s
  graffiti ANIMAL B-BOYS in SHINY PARACHUTE PANTS). Dropped as Docs in the 012Assets
  Drive folder ("Pop N Lock — Art Pack (Neon Boombox, 2026-07-19)"). Ledger: LISTED.

## VERSUS (multiplayer) — how it works
- Own-board-authoritative relay: each client simulates ONLY its own board and publishes
  compact snapshots (78-char grid string + score/pending) plus numbered garbage EVENTS;
  the rival board is display-only (`f.remote` → tickField early-returns).
- Same piece sequence both sides (shared `mulberry32(seed)`, authentic Puyo). 4 colors.
- Transports (module `MP` + `_mp*` fns, bottom of the main script):
  `'fs'` = Firestore `cwRooms/{code}` + `inputs/{uid}` onSnapshot relay riding the
  sunbeam-sdk firebase app (`firebase.app('sunbeam-sdk')`; auth shared with portal;
  players must be signed in — no anonymous auth exists);
  `'local'` = BroadcastChannel (same browser; `?mplocal=1`; what the bots use).
- Win/lose: top-out publishes `d:1` → opponent Victory. 15s heartbeat staleness or an
  explicit leave = forfeit win. Quit buttons all route through `_mpLeave()`.
- rAF-starvation watchdog (near `loop()`): background/occluded tabs advance the sim by
  real elapsed time in 50ms steps — keeps an app-switching player alive + enables
  headless two-page testing (puppeteer waitForFunction must use `polling:500`, not rAF).
- **PROOF:** `node scripts/chaffwars/bot_versus.js` (server on :8901 first) — two headless
  pages, host+guest over the local relay, uneven bots to a real top-out. Latest: PASS
  (garbage crossed both ways, one winner one loser 5000 vs 1500, zero errors).
- No sunbeams from versus (two-account farmable).

## VERSUS — next steps (in order)
1. Stephen deploys firestore-rules-8.txt, then a real two-phone test (create/join by code).
2. Rematch flow (room doc round+seed bump; v1 returns to lobby).
3. VS intro screen (portraits face off — art pack sheet 08 vs-frame + crew idles).
4. Cleanup TTL for stale cwRooms docs (Cloud Function or manual; junk is harmless now).
5. Matchmaking beyond friend-codes (random opponent queue) — design only, later.

## DONE + DEPLOYED (on `main`)
- Engine: faithful Puyo/MBM, Tsu ruleset. `proofCheck()` all-pass. Correct + stable.
- **Campaign AI rebuilt** — was 100%-win-everywhere (broken); now a real "Classic
  arcade ramp" (~90% early → ~60% mid → ~33% late → ~20% boss → ~15% secret).
  Tuned via `CW_DEV.sweep`. Commits: 9a0f5ddb (rebuild), f9df967e (secret+mid tune).
- **CW_DEV harness**: `sweep/playMatch/diag/refMove` + tune override. Fixed a pest
  freeze bug and a reference-player cadence bug.
- **Portal**: featured card + 480×480 thumbnail deployed.
- **Controls**: responsive flex control bar (big, ergonomic, no overlap), Big Controls
  now real, haptics. **Fullscreen** toggle. Install-to-home wired. (commit 41c7108a)
- PWA (manifest/sw/icons), sunbeam earn (`_sbCapEarn`, 30/day), Solo Endless, settings.

## IN PROGRESS (this session)
- **80s graffiti B-BOY theme** — design in `DESIGN-80s-theme.md`; procedural reskin
  of palette/HUD/characters is the next code step (art files come later via ASSET-LIST).
- **Powers mode** — design in `DESIGN-powers-mode.md`. FRAMEWORK SCAFFOLDED (commit
  after 75b3b44e): Sap meter (`f.sap`, `addSap`, `SAP_*`), charge hook in
  `finishResolve` (gated on `MATCH.powers`), `POWERS` table, `powerReady/firePower`,
  the Keeper's **SOLVENT** power (clears your own chaff), a `⚡` power button
  (`#b-power`, glows when ready) + `q` key, opt-in via **`?powers=1`**. Superset
  design means it's fully INERT in Classic (verified: proofCheck + ramp unchanged).
  NEXT: mode-select menu (`#b-powers`), opponent powers (AI casts), the other 14
  powers from the design doc, on-canvas Sap bar. Test now: append `?powers=1`.
- **Music in-portal** — see TODO below.

## TODO (priority order)
1. **Music plays in the portal iframe.** Currently the soundtrack (`SWSPlayer` via
   `/music-player.js` + `/music-tracks.js`) is gated to standalone-only (line ~802:
   `if(embedded){ btn.style.display='none'; return; }`). Enable an 80s/synth track
   in-game (respect Sound toggle + mobile autoplay unlock on first gesture). See the
   music research in this session / `DESIGN-80s-theme.md` audio section.
2. **Apply the 80s graffiti theme procedurally** (CSS neon/spray palette, wildstyle
   logo, tagged HUD, character personas + taunts) per `DESIGN-80s-theme.md`. Keep the
   colorblind-safe pod distinctness. Art assets wire in later (onerror → procedural).
3. **Powers mode scaffolding**: `MODE = 'classic' | 'powers'`, mode-select screen,
   a power meter that charges from chains/chaff, and 1-2 working powers, per
   `DESIGN-powers-mode.md`. Then expand to the full 15-power set.
4. **Asset list** → dropped into the 012Assets Google Drive folder
   (`1PI3fQGALCs_5MVu-3NeGMcnaewdFmV7w`). See `ASSET-LIST.md`.
5. **Device test** (Stephen): real-phone feel of controls at speed, fullscreen,
   install, music, the ramp.

## AFTER Stephen's test + model upgrade
6. **Multiplayer** ("work out the kinks"). Notes:
   - The engine already supports the Tsu competitive ruleset (offsetting) needed for
     fair versus. The `MATCH` structure is 1-player-vs-AI; multiplayer needs a second
     human field driven by remote input instead of `aiUpdate`.
   - Design questions: transport (WebRTC datapipe? a relay? Firebase?), determinism
     (piece RNG must be shared/seeded — `mulberry32` is already seedable; AI uses
     `Math.random` but AI is absent in PvP), input latency handling, garbage timing/
     offset sync, rematch. Consider async (send your board state + a seed) vs realtime.
   - Reuse `CW_DEV.playMatch` scaffolding to simulate PvP for testing.

## Tuning cheatsheet (for the next model)
- Whole-curve up/down: `AI_TUNE.blunderFloor` (top pests), `blunderMax` (early pests).
- One pest harder: raise its `ROSTER[i].q`, lower `react` (faster), raise `hcap`.
- One pest easier: opposite; or drop `startChaff`.
- Validate: `node scripts/satellite_probe.js chaff-wars CW_DEV cwdev "sweep([1..20],{cadence:430,pBlunder:0.15,maxMs:80000})"`.
- ALWAYS parse-check (`vm.Script` on the inline blocks) + `proofCheck()` before commit.
- Deploy: `git push origin add-sproing-jumper:main`.
