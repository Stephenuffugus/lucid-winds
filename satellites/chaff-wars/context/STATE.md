# Chaff Wars — Current State & TODO

Last updated 2026-07-19 (session: recovery + Classic polish + 80s theme design).

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
- **Powers mode** — design in `DESIGN-powers-mode.md`; scaffolding (mode select +
  power meter + a couple of powers) to be programmed. Classic stays the focus.
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
