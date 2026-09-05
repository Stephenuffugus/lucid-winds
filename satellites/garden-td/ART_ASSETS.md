# Garden Guard — Art Asset Guide (for Stephen)

Everything in the game is drawn by code right now (the canvas fallback), so **every asset here is optional and drops in one at a time.** The moment a PNG with the right name exists in the right folder, the game uses it. If it is missing, the code keeps drawing its own version. So you can make one marigold, drop it in, and see just the marigold change. No code edits, no all-or-nothing.

The art style to aim for: **cozy, warm, hand-made, midnight-greenhouse palette** (deep near-black backgrounds, sage green, warm gold, cream). Soft edges, gentle charm, a little glow. Think a picture book garden at night. Match the mood of the Lucid Winds card art.

---

## How to drop art in

1. Put PNGs (with transparency) in `satellites/garden-td/assets/gg/` following the folders and names below.
2. Each PNG is listed in a small `manifest.json` (I keep that in sync in code, you do not need to touch it) that tells the game the frame size and the "anchor" (the point the art pivots/sits on, usually the base of the pot for towers, the center for pests).
3. Bump one version number and it goes live. I handle that on deploy.

**Naming is exact and all lowercase.** `marigold_body.png`, not `Marigold Body.png`.

**Host rule (important):** lucidwinds.com shrinks any image wider/taller than 1600px and can serve stale copies. So keep every file **under 1600px on its longest side** and reasonably small in KB. The sizes below are all well under that. I version-bust every asset so updates show up.

---

## The folders

```
assets/gg/
  towers/    plant bodies + heads (the part that aims) + the fancy "flowering" heads
  pests/     the bugs, as little walk-cycle strips
  proj/      things plants shoot (darts, spores, acid, bees, petals)
  fx/        impacts, the four reaction bursts, particles, glow rings
  tiles/     ground tiles (optional — maps can be one big painting instead)
  maps/      one full background painting per map (and per season later)
  keepers/   the gardener character and their cast poses
  ui/        icons for towers, currencies, status badges, stars
```

---

## 1. TOWERS (the plants) — the biggest visual win, do these first

Each plant is drawn in three stacked pieces so aiming looks smooth without you drawing lots of rotation frames:

- **Body** = the pot + the plant's base. Static, sits on the ground, sways gently. **96 × 96 px.** Anchor at the bottom-center (the base of the pot).
- **Head** = the part that turns to face the bug and fires (the marigold pompom, the pitcher's mouth, the beehive dome, the sunflower disc). One per growth tier so the plant visibly matures. **64 × 64 px.** Anchor at its pivot center.
- **Flowering head** = the big, showy T4/T5 head after the plant "forks" into one of its two cultivars. **80 × 80 px.**

The 9 plants: **marigold, cactus, puffball, sundew, beehive, pitcher, scarecrow, compost, sunflower.**

Per plant:
- `towers/<plant>_body.png` (96×96) — 9 total
- `towers/<plant>_head_t1.png`, `_head_t2.png`, `_head_t3.png` (64×64) — 27 total
- `towers/<plant>_<cultivar>.png` (80×80) — the two upgraded heads. 18 total.

The cultivar names (so you can theme the fancy heads):
| Plant | Cultivar A | Cultivar B |
|---|---|---|
| marigold | `marks` (sharpshooter) | `wild` (spreading spray) |
| sundew | `tar` (heavy trap) | `nectar` (helper/support) |
| compost | `worm` (rich bin) | `myco` (glowing mushroom network) |
| cactus | `ironbarb` | `sporespike` |
| puffball | `bombardier` | `sporecaster` |
| pitcher | `acidwell` | `corroder` |
| beehive | `hunter` | `dustbee` |
| scarecrow | `watchcrow` | `trickster` |
| sunflower | `solar` | `radiant` |

(Example filename: `towers/marigold_marks.png`.)

---

## 2. PESTS (the bugs) — little walk cycles

Each bug is a short horizontal strip of frames (2 frames is plenty for a cute waddle; up to 4 if you want). Each frame **48 × 48 px**, centered.

- `pests/<pest>_walk.png` — the walk strip.
- `pests/<pest>_hit.png` (48×48, optional) — a quick "ow" frame.
- `pests/<pest>_death.png` (optional, 1–3 frames) — if absent, a little puff of particles covers it.

The current 13 bugs: `aphid, ant, grub, slug, moth, beetle, snail, dandelion, wasp, ladybug, caterpillar, thornvine, seedling`.
New bugs coming in v2: `rootgrub` (a burrower), `glasswing` (a shiny beetle), `saptick` (tiny pest that clings to a plant).

**Bosses** are bigger, **160 × 160 px** (a 2–4 frame strip if you want them to breathe):
`pests/boss_aphidqueen.png`, `boss_slugking.png`, `boss_moonmoth.png`, `boss_thornwarden.png`.

Nectar-rich bugs (they drop Pollen) do **not** need their own art — the game overlays a shared glow, `fx/nectar_halo.png` (56×56), on any bug.

---

## 3. PROJECTILES — tiny things plants shoot

Small individual PNGs, **16 × 16 px** (the beam cap is 24×24):
`proj/spike.png`, `proj/spore.png`, `proj/acid.png`, `proj/bee.png`, `proj/petal.png`, `proj/beam_cap.png`.

---

## 4. FX — impacts, reactions, particles

The four **reactions** are the game's signature moment (two plant "elements" combining on a bug). A nice burst for each sells it. **64 × 64 px** each (or a 3-frame strip at 192×64 if you want animation):
- `fx/steam.png` (Wet + Fire → a whoosh of steam)
- `fx/wildfire.png` (Spore + Fire → a spreading flame)
- `fx/bloomrot.png` (Wet + Spore → damp purple bloom)
- `fx/corrode.png` (Fire + Rot → a green-gold melt)

Support FX:
- `fx/impact_flash.png` (32×32) — generic hit spark
- `fx/ring_soft.png` (128×128) — the soft ring for tower range / pulses
- `fx/leaf_particle.png`, `fx/petal_particle.png` (12×12) — drifting bits
- `fx/nectar_halo.png` (56×56) — glow overlaid on Pollen bugs
- `fx/water_puddle.png` (96×96), `fx/sun_burst.png` (96×96) — the Keeper's watering-can and sun-flare decals on the ground

---

## 5. TILES / PATHS (optional)

If you would rather build maps from tiles than paint them whole, **64 × 64 px** each: `tiles/tile_grass.png`, `tile_soil.png`, `tile_path.png`, `tile_path_corner.png`. Totally optional.

---

## 6. MAP BACKGROUNDS

One full painting per map, **540 × 960 px** (portrait), **under ~512 KB each.** The path can be painted right into the picture (the path shape never changes, so this is safe). World 1 maps:
`maps/map_w1_kitchen.png`, `map_w1_herbspiral.png`, `map_w1_pond.png`, `map_w1_trellis.png`.
Later worlds/seasons reuse the same names with a suffix (I will tell you the exact names when we add World 2 Summer, World 3 Autumn, etc.).

---

## 7. KEEPER (the gardener you play as)

The Keeper stands by the compost bin and waters / sun-flares the garden. **96 × 96 px** each:
- `keepers/keeper_warden.png` — idle pose (the free starter Keeper)
- `keepers/keeper_warden_wateringcan.png` — casting the watering can
- `keepers/keeper_warden_sunflare.png` — casting the sun flare

Two more Keepers unlock later (`dewkeeper`, `emberkeep`) — same three files each, when we get there.

---

## 8. UI / ICONS

- `ui/icon_<plant>.png` (48×48) — the little picture on each build-tray button, one per plant.
- Currency icons (32×32): `ui/icon_pollen.png`, `icon_seed.png`, `icon_leaf.png`, `icon_sap.png`.
- Status badges (24×24), shown floating over bugs so you can read effects at a glance: `ui/badge_wet.png`, `badge_scorch.png`, `badge_spore.png`, `badge_rot.png`, and property badges `badge_burrow.png`, `badge_fly.png`, `badge_armor.png`. (Keep these readable by shape, not just color, so colorblind players can tell them apart.)
- `ui/star_full.png`, `ui/star_empty.png` (32×32) — the level stars.

---

## Suggested order (biggest visual lift first)

1. **9 tower bodies** (the whole board changes)
2. **4 map backgrounds** (sets the whole mood)
3. **13 pest walk strips** (the board comes alive)
4. **4 boss sprites**
5. **18 cultivar heads** (the upgrade payoff)
6. **FX + the 4 reactions** (the signature sparkle)
7. **UI icons + status badges**

Do as many or as few as you like, in any order. Each one you finish just quietly makes the game prettier. I will keep the manifest and versioning in sync on my end, so you only ever have to drop a correctly-named PNG in the right folder.

— Your Lead Dev

## Fleet audit rows (Sep 04)

Added Sep 05 from the fleet art audit. Same rules as above.

| file | spec | replaces |
|---|---|---|
| `assets/gg/maps/map_w1_kitchen.png` | 540x960 full-bleed portrait, under 512KB. Night kitchen-garden bed: raised timber beds, a compost bin at the bottom gate, the winding dirt path painted right in, warm lantern rim light, deep near-black soil, sage foliage, gold glints. | Replaces the code gradient + procedural dirt ribbon on World 1 map 1. drawBg() already calls spr(ctx,'map_kitchen') and falls through to the gradient because assets/gg/maps/ does not exist. |
| `assets/gg/maps/map_w1_herbspiral.png` | 540x960 full-bleed portrait, under 512KB. Same night garden, different signature terrain: a stone herb spiral, thyme and sage tufts, path painted in. | Second of the four World 1 maps named in ART_ASSETS.md section 6. Right now every map looks identical because they all share the same gradient. |
| `assets/gg/maps/map_w1_pond.png` | 540x960 full-bleed portrait, under 512KB. Moonlit pond edge, reeds, lily pads, wet stone path painted in. | Third World 1 map. Same hook, same reason. |
| `assets/gg/maps/map_w1_trellis.png` | 540x960 full-bleed portrait, under 512KB. Bean trellis and arch, hanging vines, straw path painted in. | Fourth World 1 map. Same hook, same reason. |
| `assets/gg/ui/title_hero_540x960.jpg` | 540x960 full-bleed. The Keeper standing in the kitchen bed at night, back three-quarter, watering can lowered; bottom 45% deliberately dark and quiet so the button stack reads on it. | Replaces the empty flat black behind the GARDEN GUARD wordmark on the title screen. |
| `assets/gg/ui/ls_thumb_kitchen_128x128.png` | 128x128 transparent, one per map (4 files: kitchen, herbspiral, pond, trellis). A tiny painted vignette of that map's signature feature. | Gives the level-select tiles something other than a numeral, so two tiles in the same frame stop sharing a silhouette. |
