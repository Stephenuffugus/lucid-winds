# TUMBLE: decisions log

Every call made where `DESIGN.md` or `docs/OPUS_PROMPT.md` was silent, ambiguous, or impossible as written.
Newest calls are appended at the bottom of each section. "Why" is always given.

## Pinned versions

| Library | Version | URL |
|---|---|---|
| three.js | 0.186.0 | `https://cdn.jsdelivr.net/npm/three@0.186.0/build/three.module.js` (+ `examples/jsm/` addons) |
| Rapier (compat, inlined WASM) | 0.20.0 | `https://cdn.jsdelivr.net/npm/@dimforge/rapier3d-compat@0.20.0/dist/rapier.mjs` |
| Fonts | Fraunces 500/700, Nunito 500/700/800 | Google Fonts, `display=swap` |

Both were the latest on npm on 2026-09-17. The Node tests use the same Rapier version from `node_modules`
(`npm install` in this folder; `node_modules/` is gitignored).

## Where the game lives

- **Folder, not a new repo.** The brief assumes "this repo" holds `DESIGN.md`. No such repo existed, so the game
  lives at `satellites/tumble/` inside `lucid-winds` (the studio's home for every web game), with the
  `DESIGN.md §13.5` layout reproduced inside that folder. Creating a new GitHub repo overnight without the Director
  was judged too outward-facing.
- **Committed to the working branch, NOT deployed.** Hostinger deploys `main`. The brief says a reviewer checks the
  work in the morning, and Jumping Jimothy releases on Steam on Sep 18, so nothing was pushed to `main`. If the branch
  is deployed for another reason, `index.html` loads the studio's workbench gate (`/dev-gate.js`) only on
  `lucidwinds.com`, so a stranger never lands on an unfinished build.

## Deviations from the brief

- **`file://` cannot work.** The brief asks for ES modules through an import map AND for everything to run from
  `file://`. Chromium and Firefox refuse to load module scripts from a `file://` page (the page's origin is opaque,
  so sibling module fetches fail CORS). Without a build step the two rules cannot both hold. ES modules won (the brief
  is explicit about them and every Node test imports the same files). Opening `index.html` from disk shows a short
  notice with the one line to serve the folder. Service workers also require http(s).
- **Brand name.** DESIGN says "Lucid Winds / Sky Walk Studio". The studio's registered name is **Sky Wolf Studio**
  (singular); that is used in any player-facing credit.
- **No dashes in player copy.** Studio rule: commas and semicolons only in anything a player reads. Hero names in
  DESIGN §8 that carry hyphens are written without them ("Two Stripe Tube", "Inside Out Permanently").

## Physics (step 1)

- **Aggressive sleeping is a freeze, not `rb.sleep()`.** Measured: Rapier 0.20's `sleep()` called by hand marks the
  body asleep but keeps integrating gravity; a slept sock sank through the 10 cm table top while `isSleeping()`
  reported true. A body that has been at rest for 0.5 s (DESIGN 13.1) becomes a **fixed** body instead, which costs
  nothing to simulate and is still solid. It thaws when a moving body (> 0.2 m/s) or a held sock touches it
  (`world.contactPairsWith`; sock colliders enable DEFAULT | KINEMATIC_FIXED so kinematic-vs-fixed pairs are reported).
- **Rest is drift, not speed.** A sock wedged in the pile spun in place at 5 rad/s for seconds without moving. "At
  rest" = moved less than 4 mm and turned less than 3 degrees since the rest clock started.
- **The dump is a heightfield drop.** Falling clouds and strict layers both failed the "200 socks settle in under
  2 s" bar (a 200 sock avalanche ran 3 to 5 s; strict layers stacked 27 deep). Each sock is placed flat at the lowest
  of 28 candidate spots on a 2 cm heightfield, dropped a few millimetres, and the whole pile freezes together once
  every sock has been still for 0.25 s. Measured in Node: 43 socks 0.8 to 1.2 s, 100 socks 1.2 to 1.3 s, 200 socks
  1.4 to 1.5 s of simulated time. The tumble out of the dryer is drawn by the renderer as an arc onto each sock's
  landing spot, bottom of the pile first, then the recorded settle plays back (DESIGN 13.2 "pre-simulated
  offscreen").
- **"Compound capsule" is a raft.** A flat sock is about 7.5 cm wide and 2.7 cm thick; one capsule per segment is
  either too thin or too thick. Each segment is two parallel capsules (radius = half the thickness). Ankle and baby
  are one segment, crew, knee, dress, novelty and slipper are two segments in an L, and the toe sock is one segment
  plus a flattened box (DESIGN 13.2). Colliders never use the visual mesh.
- **Dump damping.** While the dryer pre-simulates, socks carry extra damping (2.6 linear, 6 angular); play values
  (0.9, 2.4) return when the pile is handed to the player.
- **Invisible glass** walls 1.4 m tall and a ceiling keep every flick on the table (DESIGN 3.3 "misses stay on
  table"). Anything that still escapes is returned to the middle of the table.

## Rendering (step 1)

- One `InstancedMesh` per silhouette for table socks, plus one small non-shadow-casting `InstancedMesh` per
  silhouette for held socks (a sock held toward the camera would otherwise throw a giant shadow over the table).
  Balls have the same pair of pools. Draw calls for socks stay at 8 on the table.
- **Held sock size.** A held sock is placed on the finger's ray at `tableDistance / 1.55` from the camera, so it reads
  1.55 times larger than on the table (Warm hands: 1.95). It stands like a sock on a clothesline (cuff up, foot to
  the right, face to the camera) and floats 96 px above the thumb so the thumb never covers it.
- **Camera fitting is searched.** The table's front corners must fit the width, the basket and dryer door must fit
  the height, and the top band stays clear for the HUD. `Renderer._fitTable` searches distance and target for the
  current aspect instead of hard-coding a pose.
- Tone mapping is three's Neutral (Khronos PBR Neutral) so sock colours stay close to the palette the contrast floor
  was computed on.
