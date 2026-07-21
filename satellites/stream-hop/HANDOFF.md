# JIMOTHY — session handoff (2026-07-21 LAUNCH DAY, build v3.3)

## Launch-day state (read this first)
- LIVE at lucidwinds.com/satellites/stream-hop/ · share link **lucidwinds.com/jimothy/**
  (alias page with OG tags, verified unfurling for FB/Twitter/Discord bots).
- Testers are playing NOW. 💬 Feedback buttons (title/pause/game-over) POST to the
  `swFeedback` cloud function → Firestore `feedback` collection (read it in the console).
- $3 Supporter Pack is LIVE on the web rail (nowCreateInvoice → NOWPayments → nowIpn →
  vaults/{uid}.sw_supporter). Invoice creation verified end-to-end from in-game; the
  paid→completed webhook leg awaits ONE real test purchase (Jessie).
- ⛔ ART CACHE-BUSTER: spr() appends ?a=ARTV. The host edge caches bare asset URLs
  FOREVER — bump ARTV on any in-place art change or players keep the old file.
- Big fixes this session: hero occlusion (painter's order interleave), bottom-anchored
  sprites + pad height caps, TRAINS RENDER NOW (double-translate bug since v3.0),
  goose head restored, goose/rat facing (OBS fl:1), hop-stall + mash-through cheats
  closed, coins can't spawn in bushes, rules-before-play gate, FEAST retheme (no more
  'Bloom' in player copy), install button, Week Old Pizza (7th song, 3 bin pulls).
- Store kit: satellites/stream-hop/store-listing/ (copy, graphics, screenshots,
  STORE-KIT.md Play runway, LAUNCH-POST.md drafts).

# Previous handoff (2026-07-21 morning, build v3.0)

**Read this plus `memory/project_streamhop_jimothy_buildout.md` before touching anything.**

## What this is
`satellites/stream-hop/index.html` (~2060 lines, single file, vanilla JS).
Display name **Jimothy**, slug stays `stream-hop`. Live at
`https://lucidwinds.com/satellites/stream-hop/`.

A Crossy-Road-style hopper reskinned as **Jimothy**, the real viral deformed
raccoon from Ballard, Seattle (Jimothy Johnson, went viral Jul 14 2026). Stephen
is pushing it out THIS WEEK while the raccoon is trending.

**Stephen makes all the art. My job is to cut it, wire it, and build the game.**
Stephen handles the outreach to the real Jimothy's owner himself — stay off that.

## State right now
- HEAD `5d97be5b`, tree clean (only stray `scripts/__pycache__` — untracked, ignore).
- Local == live == **v3.0**. Deployed on BOTH `add-sproing-jumper` and `main`.
- Stephen is **making a soundtrack** right now and will hand over audio files.
- He was last **testing the build**, having just caught a real bug (see Lesson 1).

## Deploy + verify loop (do not skip)
```bash
# local server for the probe
python3 -m http.server 8901          # from repo root

# headless verify (my probe, NOT scripts/satellite_probe.js — see gotcha)
NODE_PATH=/workspaces/lucid-winds/node_modules node \
  <scratchpad>/jim_probe.js --shot out.png "SH_DEV.start('adventure',5)" "sleep:1500" "SH_DEV.autoPlay(20)"

# deploy = push BOTH
git push origin add-sproing-jumper && git push origin add-sproing-jumper:main
```
⛔ `scripts/satellite_probe.js` waits for `networkidle0`, which the splash `<video>`
holds open forever → flaky 30s timeouts. Use the jim_probe (domcontentloaded).
If the scratchpad is gone, rewrite it: puppeteer, `waitUntil:'domcontentloaded'`,
wait for `window.SH_DEV`, run a list of `expr` / `sleep:NNN` steps, screenshot.

## ⛔ THE THREE LESSONS THAT COST REAL BUGS

**1. Cutting art sheets — NEVER an even grid.**
I shipped a sedan cut in half and a barge cut because I sliced sheets on a fixed
grid. The art is hand laid out. Full rules in `memory/reference_cutting_mj_sheets.md`.
Short version: use the artist's white **divider lines** where they exist
(`divider_blocks()`), otherwise **connected components** (`auto_objects()`), and
**LOOK at every sprite on a contrasting background** — a count-match is NOT proof
(a wrong decomposition shipped orca-showing-a-pigeon and blank otter frames).
Cutter: `scripts/cut_jimothy2.py` (drop 2), `scripts/cut_jimothy.py` (drop 1).

**2. Verify against the real thing, not the dev hook.**
`SH_DEV.hurt()` calls `die()` directly and bypasses the collision guards, so it
"proved" the hi-vis vest was broken when it was fine. Put the player on an actual
car / vent / water tile and step the sim.

**3. Most of my finds came from auditing what was built but never ran.**
Dead systems found this way: lane textures (.jpg files, .png lookup, 404 since
v1.5), 11 unused hero poses, bottlecaps that were never banked, 8 cut-but-undrawn
sprites, `obs-cone` preloaded but missing from the obstacle map, and **a run with
no pause and no exit at all**. Audit script: walk `assets/`, grep index.html for
each stem.

## Architecture quick map (all in index.html)
- `FEEL KNOBS` block at top — `HOP_DUR` 0.28, smoothstep easing, `LAND_SETTLE`,
  `CAM_FOLLOW`, `SHAKE_SCALE`. Retune live with `SH_DEV.feel({hop:0.34})`.
  Stephen asked for this ("way too jumpy"); root cause was FRAMES not speed.
- `CHARS[]` — 22 playable critters/costumes. `sheet` + `art:1` → real sprites;
  `POSE4` folds Jimothy's 20 extended poses onto everyone else's 4-frame cycles.
  ⛔ without POSE4 a dashing crow finds no sprite and drops to a procedural blob.
- `ZONES[]` — 6 neighbourhoods, each with `bg` (chapter card) + `tex`/`wtex`
  (its own pavement/road/water strip).
- `OBS{}` — 19 road kinds; **width is per kind and drives BOTH the collision box
  and the drawn sprite**; lane gap scales with it. `OBS_EARLY/MID/LATE/BIG` ladder.
- `POWERS`/`POWER_META` — 9 powers. `PADSPR` — 12 pads.
- `ACH[]` — 23 badges (18 + 5 date-gated seasonal via `SEASONS[]`). `achCheck()`
  runs after anything that moves a counter.
- Prize Bin (`renderBin`/`binPull`) + Badges (`renderAch`) + landmarks (`EGGS`).
- `bankRun()` — the ONE place a run pays out. Called by gameOver AND by quitting.
- ⛔ Any new art path that is a `.jpg` must be added to `SPR_JPG` or it 404s.
  This trap has bitten twice (lane textures, then the new zone cards).
- ⛔ Anything that pays out twice needs a `*Paid` delta guard — a continued run
  reaches gameOver more than once and was double-banking flowers and sunbeams.

## Still unwired from the art drop
`art-drop2/Jimothy2/`: sheets **22, 25** (spare UI plaques), **24** (impact FX),
**27** (12 framed story cards), **23a/23b** (portrait/square key art),
`sprites/haz-pigeons`, `prop-wave`, `fx/wx-leaves` (autumn overlay, already cut
and tinted, ready to drop into `drawWxLayer`).

## Likely next asks
1. **Wire Stephen's soundtrack** when he hands it over. The studio player pattern
   is already in (`#b-music` → `/music-tracks.js` → `/music-player.js` →
   `SWSPlayer.init`), hidden when embedded. Open question is where tracks should
   change: menu vs run vs chapter.
2. Whatever he reports from testing — he is playing it now.
3. His standing direction: **"this game is supposed to be good."** He is right to
   expect the art to be handled properly. Look at what you ship.
