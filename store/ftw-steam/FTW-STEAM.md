# FTW → STEAM (scaffolded 2026-08-25, process = /STEAM-CHECKLIST.md)

The Electron rig here is the Jimothy rig adapted: `vendor.sh` copies the
canonical game (index.html + art/ + sfx/), strips the dev gate / SW /
manifest, and sets `window.__DESKTOP_BUILD` (hides the portal button).
`npm i && npm run start` to play it; `npm run dist:win` for the depot dir.

## What only Stephen can do
1. Steamworks: new app ($100 fee) → note appid; depot = appid+1. Copy
   `store/jimothy-steam/steampipe/` vdfs here and swap both ids +
   contentroot.
2. Price: his call (target was $1; ⛔ NEVER raise a price once set).
   Launch discount must exist BEFORE Release per the checklist.
3. Capsules: adapt `store/jimothy-steam/capsules/*.js` to FTW art (8 Valve
   sizes + 5 screenshots at 1920x1080; ⛔ hero capsule carries NO wordmark).
   `icon.py` → capsules/out/ftw.ico for the exe icon.
4. Store copy + AI disclosure (the art is generated — say so plainly) +
   content rating survey. FTW is political satire with state violence
   described in text: answer the survey honestly, expect a maturity note.
5. `LW_STEAM_USER=... ./steampipe/upload.sh` → set build live (checklist
   Part Two), then the fullscreen playtest + trailer (Part Three).

## Notes
- localStorage persistence works fine in Electron (same profile dir).
- The sunbeam earn stays local (no portal in the build) — harmless.
- Content note for review: the game names no real people or agencies
  (fictional composites; the satire IS the product).

## Sep 05 update: what is now ready

- `STORE_PAGE_FILL.md`: every store field, About This Game BBCode, tags, content survey, AI
  disclosure, supported features, asset manifest.
- `capsules/build.py` → `capsules/out/`: all eight Valve sizes (title only, hero without title,
  transparent logo), client icons (`ftw.ico`, `app_icon_184.jpg`, `icon_256.png`). Looked at.
- `steampipe/app_build.vdf` + `depot_build.vdf` with FTW_APPID / FTW_DEPOTID placeholders.
- `shots/`: six 1920x1080 screenshots from Aug 25.
Still yours: create the app ($100) and paste the two ids, set $0.99, a thirty second trailer,
then the page goes in. The Windows build is DONE and parked: `flock-the-world-steam-build-20260905.zip`
(126 MB, `Flock the World.exe` at the zip root, branded icon, music include stripped, desktop boot
gate green) in vault release `vault-20260905-ftw`. Upload it at partner.steamgames.com/apps/depotuploads/<appid>
the day the app exists; launch option `Flock the World.exe`, Windows.
