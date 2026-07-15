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
v2.4 EXPANSION (2026-07-15, Stephen device verdict on v2.3: "goal done with 2:10 left,
entire level rolled up with 1:45 left... I want a lot more detail and structure"): every
world got bigger bounds, ~39 new prop kinds (179 total), 4 gates on the big worlds,
6-9 set pieces each, and clocks cut to match a skilled player's eat-the-world time.
KEY CALIBRATION FACT: Stephen plays ~1.5x FASTER than the balance bot (his w5 t-goal 95s
vs bot 127-169s) — never assume humans are slower than the bot.
| # | World | Theme | Start → Goal | Time | Bound | Gates |
|---|-------|-------|--------------|------|-------|-------|
| 1 | Crumb Country | giant picnic blanket | 4 cm → 24 cm | 2:30 | 1596 | 16 · 30 · 40 |
| 2 | Toybox Peaks | CONCENTRIC playroom | 8 cm → 70 cm | 2:50 | 4008 | rings 22 · 55 · 95 |
| 3 | Night Garden | CONCENTRIC garden | 15 cm → 1.7 m | 2:45 | 5610 | rings 32 · 80 · 145 |
| 4 | Bazaar Lane | CONCENTRIC market town | 30 cm → 3.4 m | 3:00 | 8960 | rings 60 · 160 · 380 |
| 5 | Starfall Bay | CONCENTRIC beach + harbor | 60 cm → 16 m | 3:00 | 12000 | rings 160 · 550 · 1250 |
| 6 | THE WHOLE WORLD | 🌍 57m-planet globe finale | 45 cm → 22 m (★★★ 44 m) | 5:00 | 18000 | rings 120 · 420 · 1300 · 2600 |
| 7 | Dream Meadow | endless zen, everything, no timer | 20 cm → ∞ | — | 3640 | — |
(v3.4, Stephen: "I want all the levels much bigger" — every bound scaled 1.4-1.7x linear
with counts only +20%, so density fell another ~40% on top of the v3.3 density law.
Gate needs/goals/clocks unchanged; ring radii, gate positions, set origins scaled.)

Each world: 25-45 prop kinds, 1000-1500 scattered instances + 6-9 hand-placed SET PIECES
(v2.4 additions: chess corner, sandwich tower, grown-ups' picnic table, train loop,
puzzle spill, dollhouse yard, pumpkin patch, koi pond, beehives, sundial circle,
glasshouse court, well plaza, tea terrace, carpet street, arch row, minaret court,
container yard + crane, whale skeleton, bonfire circle, tide pools, lifeguard post,
ferry landing, second village, standing stones, lamp roads) (DENSE — travel time
between props, not total volume, is what starves growth), 3-4 SIZE GATES, 2-4 mover
types (+ camels), 5 named KEEPSAKES. Worlds unlock in order (1 star to advance). Fixed
seed per world = levels feel hand-placed and speedrunnable.
⛔ COLD-START LAW: spawn/near zones may only hold props ≤ ~1.4x startD — anything bigger
is a WALL at spawn scale and pinballs the early game to death (w1/w4 bot collapsed to
0.1-0.2x when 7-12cm chess pieces / 36-48cm sacks landed in the near ring).
⛔ GATE-PRIZE LAW: a gate's marquee loot must be within the world's reachable ladder
(size*maxScale ≤ ceiling*pr) — the v2.4 dollhouse at 260 was un-eatable scenery until
resized to 200.

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

### THE GLOBE v3 (2026-07-15 — SkyWolf Studios flagship rebuild)
Stephen: "the last world level is so great but we start waaay too big and the level itself
needs to be so much bigger... flagship game of SkyWolf Studios." v3: start 45 cm (a bead in
the grass — the planet's curve only reveals itself as you grow), bound 9500 (R=30 m, 5x the
area), REGION-STRUCTURED: named districts via `regions:{}` + `zone:"r:name"` scatter —
the Meadow (spawn), the Farmstead, the Pond, then five gated districts: Village Gate 260 →
Harbor Gate 750 (ferry+crane) → High Valley 1400 (cottages/windmills) → Royal City 2300
(WALLED city: citywall ring set + keep + clocktowers) → Crown of the World 3000 (moonshards,
graypeak mountains, hillocks). Star bars are ABSOLUTE (`s2`/`s3`): 22 m ★ / 32 m ★★ / 44 m
★★★; the HUD always shows the next un-crossed bar, so a run is never "done early".
Perf for the 5x planet: `_gsMat` direct-basis matrix fill (no quaternions) + horizon cull
(phi>2.35 zero-scaled once), gate posts are one InstancedMesh per gate. Movers accept
`zone:` (sheep in the meadow, dogs at the FARM — ⛔ chase movers at spawn scale walked the
bot for 3 straight minutes; and bots/humans should SIDESTEP chasers, never run straight).

### THE GLOBE (w7 — original v2.3 implementation notes)
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

### READABILITY LAWS (v3.1, Stephen device note at ~1.7m on the globe: "things are hard
### to see, camera keeps skipping, things hit me and I can't tell from where, gates are
### impossible to understand")
- BRIGHT beats moody: the globe is a sunny day planet (Katamari is readable because it
  is bright and saturated). Never ship a dark-on-dark world.
- The camera looks DOWN more on the globe (pitch 0.76, dist r*7.0+40) — at mid-size the
  props are taller than a low camera and wall off the view.
- Look-ahead is SMOOTHED — impacts reverse velocity instantly and a raw look-ahead makes
  the camera whip.
- ⚠ THREAT INDICATOR: any unpickable mover within ~8 ball-diameters gets a pulsing
  edge-clamped warning marker + tick. You should never be hit by something you never saw.
- GATE SIGNS: every gate carries a floating billboard ("🔒 2.6 m" -> "OPEN!") readable
  from a distance; the bump hint shows current size vs needed. A rule the player can
  only learn by bumping a fence is not a rule.
- Cars slowed (sp 1.8) and thinned — fast unseeable hits from beyond the curved horizon
  were the "what just hit me" complaint.
- Far-field props reproject on alternate frames (phone perf on the 5x planet).

### CONCENTRIC ASCENDING WORLDS (v3.2 — Stephen: "gated areas feel like a quick buff;
### they need to be bigger than the last area, ascending. massive build. do it")
The deep truth: district size only matters RELATIVE to the ball entering it, and the ball
grows geometrically — so zones must ascend geometrically. w2/w5/w7 are now concentric
rings (regions with r0 inner holes + ring gates at the boundaries): you start in the
innermost circle and every gate is a wall around your entire known world; break out and
the next zone's AREA exceeds everything before it combined (w7: 3.1M -> 18M -> 51M ->
90M -> 198M cm^2). Side-pocket gates are DEAD on these worlds (w1/w3/w4 keep them at
small scale). This also kills dead-zone travel ("stuck going in circles") — the next
band surrounds you in every direction. placeInZone gate exclusion is FENCE-LINE-ONLY
now; the bot's fenced/pathBlocked logic is ring-aware (inside XOR outside = blocked).
⚖️ THE DENSITY LAW (v3.3, Stephen: "first area so small and crammed it accelerated
everything... they need serious space to drive around looking for stuff and really have
to build up slowly" — he consumed the entire globe in 1:47): DENSITY IS THE ACCELERATOR.
Crammed zones remove the hunt and let the cube-law snowball run at max speed. Zones must
be BIG and SPARSE — searching is the pacing, not eating. (This refines the old "travel
time starves growth" note: dense enough to never strand, sparse enough to hunt.)
REPLAY META (v3.2): CLEAN SWEEP — consuming everything ends the run instantly
("👑 THE WORLD IS YOURS", +2 sunbeams, crown on the world card, crowns unlock the Royal
skin); ⚡ best time-to-goal recorded per world and shown on the card (fixed seeds =
honest speedrun targets). Running dry is now the elite goal, not a failure state.

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
