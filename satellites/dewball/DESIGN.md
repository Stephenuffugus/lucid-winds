# DEWBALL 3D — multi-world katamari (v2 rebuild, Jul 13 2026)

Stephen's brief: "completely built thoroughly into a multi world game... best katamari phone
game ever built, probably want dual analog, right one moves camera and left one moves your
katamari. look at how the katamari damacy plays. if we need to use something to render 3D
environments, we can."

## Tech
- Three.js r147 (last UMD build) vendored as `three.min.js` — satellite stays self-contained.
- Our code stays ES5 (house style). Single `index.html` + vendored lib.
- Headless-verifiable: WebGL renders under SwiftShader in this codespace (verified).
  `?dbtest=1` → `window.DB_DEV` manual stepping, seeded RNG (deterministic scatter).

## Katamari core (what we take from Katamari Damacy)
- Pickup rule: object sticks if its size ≤ ball diameter × ratio, where ratio ramps
  0.55 → 0.72 as the ball grows 40cm → 12m (flat 0.55 mathematically strands the late game —
  a 900cm sailboat would need a 16m ball). Attaches AT the contact point in ball-local space
  and rolls with the ball, then gets buried as you grow (pruned once fully inside the core —
  that's the authentic look AND the perf win).
- Growth by volume, not radius — chunky early, hard-won late. VOL_EFF 0.85 × SHAPE_K 0.55
  (≈24.5% of bounding-sphere volume per prop; tuned so each world's total scatter volume
  covers its 3-star target with ~15% slack — checked per world, don't eyeball it).
- Slightly-bigger objects get SHOVED (they slide), much-bigger objects are walls; a hard hit
  knocks your 3 most recent pickups back off onto the ground (re-collectible) with a red
  flinch. Movers (ants, RC cars, dogs, crabs...) bump you around until you outgrow them —
  then you eat them. Revenge is the loop's dopamine.
- Size readout in cm → m, milestone chimes each time the diameter doubles.
- Reaching goal ≠ end: celebration fires and you keep rolling until the clock dies. Stars
  come from final size (goal=★, 1.4×=★★, 1.9×=★★★ — retuned from 1.5/2.2 after volume-budget
  math showed 2.2× unreachable on several worlds).
- Camera: follow cam whose distance/height scale with ball size.

## Controls (dual analog, Stephen's spec)
- LEFT floating stick (left half of screen) = move the ball, camera-relative.
- RIGHT floating stick (right half) = orbit camera yaw + limited pitch.
- Double-tap right half = instant 180° turn (katamari flip).
- DEW DASH: combo pickups fill a meter → button burst (×2.2 speed, 1.2s), FOV kick.
- Desktop: WASD/arrows move, Q/E (or mouse-drag) camera, SPACE dash. Gamepad: twin sticks.

## Worlds (multi-world, non-botanical mix per Stephen's Jul 10 note)
| # | World | Theme | Start → Goal | Time |
|---|-------|-------|--------------|------|
| 1 | Crumb Country | giant picnic blanket | 4 cm → 35 cm | 100s |
| 2 | Toybox Peaks | playroom floor | 8 cm → 60 cm | 110s |
| 3 | Night Garden | the Lucid Winds garden | 15 cm → 1.2 m | 120s |
| 4 | Bazaar Lane | tiny town market street | 30 cm → 3 m | 130s |
| 5 | Starfall Bay | dusk beach + harbor | 60 cm → 6.5 m | 140s |
| 6 | Dream Meadow | endless zen, everything, no timer | 20 cm → ∞ | — |

Each world: ~16-20 prop kinds (85+ total), 1-2 SIZE GATES (fences that sink once you're big
enough, opening a richer sub-zone), 2 mover/hazard types, 5 named KEEPSAKES (collection log,
"pressed into the Grove"). Worlds unlock in order (1 star to advance). Fixed seed per world =
levels feel hand-placed and speedrunnable.

## Rendering / perf budget (Pixel-class phones)
- One merged vertex-colored BufferGeometry per prop kind → InstancedMesh (≈16 draw calls/world).
- Attached items = individual low-poly meshes parented to the spin group, capped ~110 visible,
  buried ones pruned. Blob shadows (one merged static geo for props + 1 quad for ball). No
  shadow maps. Fog + gradient-canvas sky. Procedural canvas ground texture per world
  (checks / wood / grass / cobbles / sand) with art-pack override hook (`assets/ground-<n>.jpg`).
- Auto perf scaler: sustained >24ms frames → pixelRatio drops to 1.

## Economy
Sunbeam standard: `_sbCapEarn` path, 30/day, per-run ≤12 (3/6/10 by stars + 1/keepsake,
zen = 3). Skins (from v1 save, migrated) + new world-clear unlocks. Cosmetic only.

## Art pack
`art-asset-lists/dewball/` — "Paper Lantern Parade" recommended look: papercraft cutout
world where 2D sheets ARE the 3D props (double-sided cards), so FLUX sheets wire straight
in. Ground tiles + sky bands per world, prop sticker sheets, ball-skin sphere maps, UI, FX,
💰 cosmetics (skins/trails/crowns).
