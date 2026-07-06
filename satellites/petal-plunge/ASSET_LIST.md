# PETAL PLUNGE — Art Asset List
*For Stephen. The game ships fully playable with procedural (canvas-drawn) art;
every item below is an **optional drop-in upgrade**. Paint any subset, in any order —
each one replaces its procedural version with zero code changes.*

---

## How the drop-in works
Every sprite is drawn through an `ART.*` hook that first checks for a loaded image
by a **key**. To wire a painted asset, we add one line:

```js
ART.load('rider_frog', 'assets/rider_frog.png');   // key → file
```

…and the game uses your PNG instead of the procedural drawing. Nothing else changes.
So you can hand me art piecemeal and I'll wire each as it lands (the fleet's
one-game-at-a-time art sweep).

## File format & prep (fleet standard)
- **PNG with transparency**, OR painted on a **flat magenta `#FF00FF` background** for
  chroma-key cutout (I'll cut it — same as the other satellites).
- **Square canvas**, subject centred, a little padding. Face/subject "pointing away
  and downhill" for riders (we see them from behind-above as they descend).
- **Paint big** — see sizes below; never pre-shrink. Hi-res downscales clean; upscales ugly.
- Consistent light: soft top-down key light, midnight-greenhouse mood (deep greens,
  gold, cream, a touch of rose). Readable silhouettes matter more than fine detail —
  these are small and moving fast.
- Keep files reasonable (≤ ~150 KB each after cut; the whole game must stay light).

---

## PRIORITY 1 — the hero sprites (biggest visual payoff)

### Riders  ·  key `rider_<id>`  ·  paint at **512×512**
The critter riding the sled. Seen from **behind / slightly above**, leaning downhill.
| id | name | note |
|---|---|---|
| `sprout` | Sprout | default — a leaf-sprout seedling |
| `acorn` | Acorn Kid | acorn with a cap |
| `ladybug` | Ladybug | red shell, spots, from behind |
| `bee` | Bumblebee | fuzzy stripes, wings out |
| `snail` | Snail | shell on back |
| `frog` | Tree Frog | green, big eyes peeking |
| `mouse` | Field Mouse | round ears, tail |
| `robin` | Robin | orange breast, folded wings |
| `foxkit` | Fox Kit | orange, big ears, white tip |
| `firefly` | Firefly | dark body, **glowing** tail (glow can be baked or left to code) |
| `mantis` | Mantis | slim green, raptorial arms up |
| `lumin` | Luminmoth | *legend* — pale glowing moth wings |
| `gnomeling` | Gnomeling | *legend* — tiny friendly gnome in a red cap |

### Sleds  ·  key `sled_<id>`  ·  paint at **512×640** (tall — long axis points downhill)
What the rider rides. A vertical board shape.
| id | name | note |
|---|---|---|
| `leaf` | Leaf | default — a single green leaf, central vein |
| `petal` | Rose Petal | pink petal board |
| `bark` | Bark Board | wood plank, grain |
| `lily` | Lily Pad | round green pad with the notch |
| `cap` | Mushroom Cap | red cap, white spots |
| `birch` | Birch Curl | white birch bark curl |
| `husk` | Seed Husk | almond/seed pod |
| `shell` | Snail Shell | spiral shell |
| `aurora` | Auroraleaf | *legend* — iridescent leaf (colour-shift can stay code-driven) |

### The Gnome  ·  key `gnome`  ·  paint at **512×640**
**The star villain.** A feral garden gnome mid-chase: red pointy hat, wild white beard,
glowing/angry eyes, arms reaching forward, running. Seen from the front (it's chasing
you, uphill). Creepy-cute, not gory. This is the money shot — worth the most detail.
*(Optional: a second `gnome_angry` frame for when it's right on you — nice-to-have.)*

---

## PRIORITY 2 — the slope furniture (obstacles)  ·  key `obs_<kind>`  ·  **256×256**
Small, read-at-a-glance props. Top-down-ish with a soft ground shadow (or leave the
shadow to code — I draw one under each).
| key | what |
|---|---|
| `obs_bush` | round leafy bush (Meadow) |
| `obs_tree` | little pine/shrub tree (Bramblewood) |
| `obs_glowtree` | dark tree with glowing dots (Nightgarden) |
| `obs_shroom` | small mushroom |
| `obs_bigshroom` | **big bouncy toadstool** — reads as a trampoline/launch (Mushroom Hollow) |
| `obs_thorn` | thorn/bramble tangle |
| `obs_log` | fallen log |
| `obs_stump` | tree stump with rings |
| `obs_boulder` | big rock (Thornfall) |
| `obs_stone` | small stone |
| `obs_glowstone` | glowing crystal stone (Nightgarden) |
| `obs_daisyclump` | daisy cluster (harmless decor, but has art) |
| `obs_ramp` | wooden launch ramp with a ▲ (the jump) |

---

## PRIORITY 3 — biome backdrops  ·  key `bg_<id>`  ·  paint at **1080×1920** (portrait)
A parallax/backdrop image per biome, tiling or fading vertically. Optional — the game
draws a gradient + procedural flora that already looks good. But painted skies/horizons
would lift it a lot.
| key | biome | mood |
|---|---|---|
| `bg_meadow` | Sunny Meadow | bright blue sky, green rolling hill |
| `bg_bramble` | Bramblewood | muted, thicket, dusky green |
| `bg_mushroom` | Mushroom Hollow | purple, spore haze, giant caps on the horizon |
| `bg_thorn` | Thornfall Ridge | rocky, steep, amber dusk |
| `bg_night` | Nightgarden | dark, glowing flora, fireflies, the Gnome's home |

---

## PRIORITY 4 — icons & store art (small but ships everywhere)
| asset | file | size | note |
|---|---|---|---|
| App icon (PNG) | `icon-192.png`, `icon-512.png` | 192, 512 | maskable; safe area centre. (SVG icon already ships.) |
| **Portal thumbnail** | `portal-assets/thumbs/petal-plunge.png` | ~**480×480**, ≤150 KB | the card art in the games grid. A dynamic hero shot: leaf-sled carving downhill, dewdrop gates, the Gnome looming behind. Until this lands the card shows the 🛷 glyph. |
| Trail previews (optional) | key `trail_<id>` | 256×256 | trails are drawn from particle colours by default; a painted swoosh is optional flair |

---

## Notes
- **Trails** (`dew, pollen, petals, frost, rainbow, ember, star`) and **skies**
  (`auto, dawn, dusk, storm, aurora, starry`) are colour/gradient-driven and look
  finished as-is — lowest priority for painting.
- **Milestone legends** (`rider_lumin`, `rider_gnomeling`, `sled_aurora`, `trail_star`,
  `sky_starry`) are unlock rewards — worth extra polish since players earn them.
- Deliver whatever's ready whenever; I'll wire each `ART.load(...)` line and re-vendor.
  Suggested order: **Gnome → default rider/sled (sprout, leaf) → portal thumb → the rest.**
