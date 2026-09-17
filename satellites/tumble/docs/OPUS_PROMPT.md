# TUMBLE — Overnight build brief

You are building TUMBLE, a cozy 3D sock sorting/matching/basket game for phones, from `DESIGN.md` in this repo. Read `DESIGN.md` completely before writing any code. It is the contract. Where it is specific, follow it exactly. Where it is silent, choose the cozier, simpler, more honest option and record the choice in `DECISIONS.md`.

You are working unattended for several hours. Nobody will answer questions. Do not stop to ask; make the call, log it, keep going.

## Environment and conventions

- Vanilla HTML/CSS/JS. **No build step, no bundler, no framework, no TypeScript.** ES modules loaded via an import map in `index.html`.
- Three.js from `https://cdn.jsdelivr.net/npm/three@<pinned>/build/three.module.js` and its `examples/jsm` addons. Rapier from `https://cdn.jsdelivr.net/npm/@dimforge/rapier3d-compat@<pinned>`. Pin exact versions and put them in `DECISIONS.md`.
- Mobile-first, portrait, one thumb. Test in the browser at 390×844 with touch emulation. Desktop mouse must also work (pointer events, not touch events).
- PWA: `manifest.json`, `sw.js` with a cache-first strategy for local assets, network for CDN with cache fallback.
- Deploy target is static hosting (Firebase Hosting / GitHub Pages). Everything must run from `file://` and from a plain static server with no server-side anything.
- Follow the repo layout in `DESIGN.md §13.5` exactly.
- Commit early and often with clear messages. One feature per commit. Never leave `main` broken; if you must, work on a branch and merge only when it runs.

## Assets you do not have yet

The Meshy GLB silhouettes and Blender masks (`DESIGN.md §14, §13.3`) are not in the repo. **Do not block on them.**

- Build `assets/geo/placeholder.js` that generates eight procedural sock silhouettes from capsule/tube geometry with a standard cylindrical UV layout (U around, V cuff→toe) and procedural mask textures (R heel, G toe, B cuff). Make the loader accept either a placeholder or a real GLB + mask PNG by name, so swapping in the Meshy assets later is a file drop, not a code change.
- Colliders are compound capsules per `§13.2` regardless of visual mesh.

## Build order (do not reorder)

Work through `DESIGN.md §16` in order. Each step has a definition of done. Do not start the next step until the current one runs in the browser.

1. **Physics pile + grab/flick.** Done when: 200 placeholder socks dump onto the table, settle in under 2 s, sleep, and you can drag/flick any sock with a finger at a steady frame rate. Include an FPS/body-count debug overlay toggled by `?debug=1`.
2. **sockgen + atlas.** Port the Lucid Wins SHA-256 pattern engine if `engine/` already contains it; otherwise write `engine/sockgen.js` fresh to the spec in `§7` with the same seed → spec → tile contract. All ten pattern families. Atlas per `§13.3`. Done when: a debug page `dev/atlas.html` shows 64 tiles from 64 seeds and re-renders identically on reload.
3. **Match / ball / basket.** Done when: hold+tap matches, mismatches bounce, matched pairs roll into a ball, balls can be flicked into a basket with real rim bounces, and misses stay on the table.
4. **Laundry Day end to end.** Dump → Play → Sweep → Results with Tidy rating, Lint/Quarters earned, Drawer and Odd Bin persisted to IndexedDB. Done when: you can play five consecutive Loads and the save survives a reload. **This is the milestone that matters. If you run out of time, everything after this is optional; this is not.**
5. **Rush.** Timed first, then Endless, then Basket Balance. Streaks, four powers, lint fog at tier 6+.
6. **Laundry Room, Drawer, Odd Bin screens.** The room is the menu (`§9.1`). Tap targets must be at least 48px.
7. **Economy + Clothesline.** Unlock table and pegs from `§9.4–9.5`, loaded from the JSON files in `data/`.
8. **Daily + lore.** Date-seeded Load, share card, twelve lore pages from `data/lore.json` (write the pages in the voice described in `§9.6`, short, funny, then quietly warm).

## Rules that override everything

- Nothing ever gets smaller or lower-contrast to make a level harder. Difficulty comes only from decoys per `§5`.
- Misses are free. No lives. No timer in Laundry Day. No ads, no ad hooks, no analytics.
- The held sock always renders large and toward the camera.
- Contrast floor from `§7` and `§12` is enforced in the generator, not hoped for.
- Accessibility settings from `§12` are real, not stubs. Colorblind palettes and the tap-tap flick alternative ship in step 4.
- Save export/import as a JSON blob in settings ships in step 4.
- Keep total bundle under 2 MB excluding CDN libraries. No audio files this pass; stub sound through a tiny Web Audio synth (`src/audio.js`) with the cues named in `§11`.

## Testing

Write the tests in `DESIGN.md §15` that can run without a browser as plain Node scripts under `tests/` (match logic, atlas determinism, economy calibration, Odd Bin return rate, save round-trip, daily determinism). Run them before every commit that touches the relevant module. Browser-only tests (physics smoke, flick determinism) go in `dev/` as pages with a pass/fail readout.

## When you finish, or when you run out of time

Write `HANDOFF.md` at the repo root with:

1. What works, what's stubbed, what's missing, per build step.
2. Every deviation from `DESIGN.md` and why.
3. Known bugs with repro steps.
4. Performance numbers from the debug overlay on your best available emulation.
5. The exact next three tasks, in order, for the reviewer.

Then stop. A second model will review your work against `DESIGN.md` and `HANDOFF.md` in the morning. Make its job easy: honest status beats optimistic status.

Start now with step 1. Do not write a plan document first; `DESIGN.md` is the plan.
