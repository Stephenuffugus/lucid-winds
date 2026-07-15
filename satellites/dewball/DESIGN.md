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
- Growth by volume, not radius — chunky early, hard-won late. VOL_EFF 1.0 × SHAPE_K 0.75
  (75% of bounding-sphere volume per prop — generous is correct; see THE TUNING LAW below,
  and never trust static volume sums).
- Slightly-bigger objects get SHOVED (they slide), much-bigger objects are walls; a hard hit
  knocks your 3 most recent pickups back off onto the ground (re-collectible) with a red
  flinch. Movers (ants, RC cars, dogs, crabs...) bump you around until you outgrow them —
  then you eat them. Revenge is the loop's dopamine.
- Size readout in cm → m, milestone chimes each time the diameter doubles.
- Reaching goal ≠ end: celebration fires and you keep rolling until the clock dies. Stars
  come from final size (goal=★, 1.4×=★★, 1.9×=★★★ — retuned from 1.5/2.2 after volume-budget
  math showed 2.2× unreachable on several worlds).
- Camera: follow cam whose distance/height scale with ball size.

## Controls (dual analog, Stephen's spec — v2.2 feel pass after device feedback "wonky")
- LEFT floating stick (left half of screen) = move the ball, camera-relative — mapped to the
  yaw TARGET (camYawT), never the smoothed camera; a lagging/assisted camera must not re-aim
  a held stick. Deadzone 0.10, response curve ^1.35, 48px throw, base re-anchors on overshoot.
- RIGHT floating stick (right half) = orbit yaw + pitch (push up = camera up). Any camera
  input holds the auto-assist off 0.9s; assist only makes small corrections (<1.2 rad) while
  rolling roughly forward.
- Double-tap right half = instant 180° turn — armed only by a completed clean tap (<250ms,
  <12px), so orbit drags never false-fire.
- Feel: hard brake when pushing against the roll; wall hits glance into a slide (30% of the
  killed normal speed) instead of pogo-ing; camera looks ahead of travel.
- DEW DASH: combo pickups fill a meter → button burst (×2.2 speed, 1.2s), FOV kick.
- Desktop: WASD/arrows move, Q/E turn, R/F tilt, SPACE dash. Gamepad: twin sticks.

## Worlds (multi-world, non-botanical mix per Stephen's Jul 10 note)
Recalibrated 2026-07-14 (v2.3 difficulty pass — Stephen: "the earlier the level, the
harder it is; later levels have too much time"). Goals raised on late worlds (+12%
diameter = +42% volume — the real lever), clocks cut so a skilled run ENDS while the
world still has food in it, early worlds softened (denser spawn litter, fewer bullies):
| # | World | Theme | Start → Goal | Time | Bound | Gates |
|---|-------|-------|--------------|------|-------|-------|
| 1 | Crumb Country | giant picnic blanket | 4 cm → 24 cm | 2:50 | 780 | 16 · 30 |
| 2 | Toybox Peaks | playroom floor | 8 cm → 50 cm | 3:30 | 1150 | 26 · 68 |
| 3 | Night Garden | the Lucid Winds garden | 15 cm → 1.4 m | 3:10 | 1750 | 45 · 70 · 150 |
| 4 | Bazaar Lane | tiny town market street | 30 cm → 2.7 m | 4:05 | 3300 | 70 · 120 · 320 |
| 5 | Starfall Bay | dusk beach + harbor | 60 cm → 7.5 m | 3:45 | 5200 | 170 · 380 · 900 |
| 6 | THE WHOLE WORLD | 🌍 a little planet (GLOBE) | 2 m → 16 m | 4:00 | 4200 | 550 · 1000 · 1900 |
| 7 | Dream Meadow | endless zen, everything, no timer | 20 cm → ∞ | — | 2600 | — |

Each world: ~20-30 prop kinds (140 total), 700-1000 scattered instances + 2-3 hand-placed
SET PIECES (picnic spread, domino run, block castle, fairy ring, lantern path, market row,
fountain plaza, pottery yard, the long dock, umbrella row, shipwreck cove, village square,
orchard rows — `sets:` arrays, helpers _ring/_row/_curve) (DENSE — travel time
between props, not total volume, is what starves growth), 2-3 SIZE GATES, 2-4 mover/hazard
types, 5 named KEEPSAKES (collection log, "pressed into the Grove"). Worlds unlock in
order (1 star to advance). Fixed seed per world = levels feel hand-placed and speedrunnable.

### Size gates (v2.3 — the structural pacing device, Stephen's Jul 14 note)
Every world now has a LATE gate whose `need` sits at ~1.2-1.4x goal: the 2★/3★ climb is
physically fenced behind "come back bigger". Posts sit 0.9 needs apart (was 1.7 — sparse
pickets read as scenery) with gold caps; opening fires gateSound + gold flash + toast.
Gate zones hold loot SCALED to the gate (a feast edible ON ENTRY, not more of the same —
a gate stocked with food you can't eat for another 2x is a mistimed reward; learned on w7).
On w7 the gates are BAND-LOCKED: the free field's pickup ladder caps at ~520 (pines), and
each next size band lives INSIDE a gate (Town Gate 550: stalls/rowboats/dinghies; High
Valley 1000: cottages/oaks/boats/windmills; King's Keep 1900: monuments). NOTE: gates open
by SIZE from anywhere (the fence sinks) — they delay, they don't route; with cube-law
growth an optimal player detonates each feast into the next threshold within seconds, so
bot time-to-goal on w7 (~25s) measures SOLVABILITY, not human difficulty. The 4:00 clock
is a human estimate — device-test and retune.

### THE GLOBE (w7 "The Whole World" — finale, v2.3)
Stephen: "scale out to the whole world and have the ball on a globe." Implementation:
physics run UNCHANGED on a square chart that wraps at ±bound (torus, `wrap:1`); the
renderer (`globeSync`) projects everything ball-centric onto a real sphere of radius
R = bound/π (azimuthal equidistant): ball fixed at the pole, planet mesh counter-rotates
under it, props/movers/gate-posts placed per frame at great-circle dist = chart dist,
oriented along the radial normal. One full chart wrap = exactly one circumnavigation.
Distortion at contact range <1%; chart corners overshoot the antipode and are pinned
there (never visible). Fog ~0 (space), starfield, patchwork-fields ground painter.
New planet-scale props: hayrick, cottage (lit windows), oak, pine, windmill, water tower,
chapel, clock tower, lighthouse (also in w5 Lighthouse Point), green hillock, fallen
moonshard (the final meals), + sheep/cow/car/bus movers, + 5 keepsakes (Old Globe,
Weathervane, Postbox, Telescope, The Little Crown). Endgame: a 30m+ dewball visibly
dwarfing its own 13m planet. NEVER give w7 a bound-wall — the globe has no edge.

## ⚖️ THE TUNING LAW (learned the hard way, 2026-07-13; instruments upgraded 07-14)
Static volume budgeting shipped three mathematically unwinnable worlds. Binding
constraints that MUST be verified empirically after ANY scatter/size/goal/time edit:
1. LADDER: absorbAll() ceiling ≥ 1.9×goal×1.15 per world — a prop only counts if the
   pickup-ratio chain can actually reach it (smoke.js asserts this).
2. PACING: the greedy dash-bot in balance.js must finish ≥1.0×goal on every world
   (`NODE_PATH=<repo>/node_modules node satellites/dewball/balance.js 1 [seed]`).
Rig upgrades 2026-07-14 (v2.3):
- `?dbtest=1` seeds Math.random in-page (`&dbseed=N`) — runs are DETERMINISTIC per seed.
  The old unseeded bot swung 1.1x-5x on identical code; useless as a yardstick.
- Rigs derive worlds/goals from `DB_DEV.worlds()` — never hand-mirror goals into them.
- The bot plays like a strong human: value-based targeting (meal volume per travel, not
  nearest-first), dash discipline + speed-creep near walls (full-speed slams = knockOff),
  flees CHASE movers only (fleeing every sheep starved it to 0.1x on w7), stuck-escape
  with pocket blacklisting (radius capped ~700 — uncapped it limit-cycled at big D).
- balance.js records t100/t140/t190 (secs to cross each star bar) — set clocks from
  those, don't guess. Verify with BOTH seeds 12345 and 777 before trusting a change.

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
