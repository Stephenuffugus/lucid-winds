# SEEDKEEPER — Art Asset List (hand straight to ChatGPT / image gen)

*Seedkeeper is our Chip's Challenge remake: a little hedgehog forager walks a tile grid,
gathers seeds to open a gate, and slips out the greenhouse door, dodging ponds, embers,
frost, gusts, and garden pests. The game already renders every tile as a hand-drawn
placeholder, so nothing is blocking. The moment a correctly named file lands in
`satellites/seedkeeper/assets/`, we cut it in over the placeholder. Paint any subset,
in any order. Suggested order is at the bottom.*

Every tile in play is a **48×48** square on screen. Paint everything **bigger** than that
(see per-sheet sizes) so it stays crisp; we downscale.

---

## SHARED RULES (paste into every prompt)

- **House style:** cozy-but-moody botanical storybook, **midnight-greenhouse** palette — deep
  mossy greens, warm gold, cream, soft rose, restrained ember and ice blue. Gentle top-down
  light, soft hand-painted gouache texture, clean cartoon cel-shading. Menacing-cute, never
  grim. Same world as the rest of the Lucid Winds fleet.
- **View:** flat **top-down** (looking straight down at the garden floor), the way a board game
  or Chip's Challenge looks. No perspective, no long shadows.
- **No** words, letters, numbers, UI, frames, borders, or captions anywhere in the art.
- **Host rule:** keep every file **under 1600px** on its long side and small in KB.

There are **two kinds** of art, with different backgrounds:

1. **TERRAIN TILES (Sheets A1–A2)** — these fill their whole square. Paint each as a **full-bleed
   opaque square, NO magenta**, edge to edge, so they tile seamlessly next to each other. Square
   canvas, **128×128 each** (or a single grid sheet of them). Think "one floor square."
2. **ACTORS, ITEMS & OBJECTS (Sheets B–C)** — these sit ON a tile, so they need transparency.
   Paint each on a **flat magenta `#FF00FF` background** (we chroma-key it out), centred, with a
   little even padding and narrow magenta gutters between cells. **No magenta inside the art.**
   These read best a touch smaller than a full tile (fill ~80% of the cell). **256×256 per cell.**

Export cutouts as transparent PNGs, or hand me the magenta sheet and I'll cut it.

---

## SHEET A1 — GROUND & HAZARD TILES  ·  full-bleed opaque squares, NO magenta
128×128 each. These must look good tiled edge-to-edge in a grid.

| file | what it is | notes |
|---|---|---|
| `tile_floor.png` | plain garden **soil** — the walkable ground | dark, low-contrast so bright things pop over it; faint tilled texture |
| `tile_wall.png` | a **hedge / stone border** block — solid, impassable | reads clearly as a wall from a flat top-down; mossy green + a little stone |
| `tile_pond.png` | **water** — deadly without the lily charm | still dark teal water, a couple of ripple rings, edge of a lily pad |
| `tile_fire.png` | **embers / smouldering bramble** — deadly without the ember charm | dark scorched ground with small warm flame licks, not a bonfire |
| `tile_ice.png` | **frost** — you slide across it until you hit something | pale blue-white rimed surface, faint crack lines, glassy |
| `tile_dirt.png` | **loose mulch** — safe to walk, but pests can't cross it | rich brown crumbly soil, a few pebbles / bark bits |
| `tile_gravel.png` | **gravel path** — safe to walk, pests can't cross it | grey-green small stones, drier than mulch |

## SHEET A2 — SPECIAL FLOOR TILES  ·  full-bleed opaque squares, NO magenta
128×128 each.

| file | what it is | notes |
|---|---|---|
| `tile_exit.png` | the **greenhouse door** — the level goal | a small glowing greenhouse / open flower gate set into the floor, inviting, warm green glow |
| `tile_gate.png` | the **seed gate (socket)** — opens once you've gathered enough seeds | a round latched hatch in the floor with a seed motif; reads as "locked until fed" |
| `tile_button.png` | a **green pad button** you step on | a soft round green pressure pad flush with the floor |
| `tile_teleport.png` | a **fairy ring / teleport** | a small mushroom or stone ring with a faint violet shimmer in the middle |
| `tile_hint.png` | a **hint marker** | a soft glowing question-mote or a little signpost seedling |
| `tile_force.png` | a **wind gust floor** (points one way) — carries you along it | streaks of blown pollen/leaves flowing toward the RIGHT. Paint ONE pointing right; we rotate it for up/left/down. |
| `tile_toggle_on.png` | an **open** toggle gap (a low, passable stub) | a flattened/retracted hedge stub, clearly walkable |
| `tile_toggle_off.png` | a **closed** toggle wall (a raised bramble bar) | a raised thorny bar blocking the square, clearly solid |

## SHEET A3 — COLOURED DOORS  ·  full-bleed opaque squares, NO magenta
128×128 each. Each is a wooden garden gate tinted its colour, with a little keyhole.

| file | colour |
|---|---|
| `door_red.png` | red / rose gate |
| `door_green.png` | green gate |
| `door_blue.png` | blue gate |
| `door_yellow.png` | gold / yellow gate |

---

## SHEET B — THE HEDGEHOG & THE PESTS  ·  flat magenta `#FF00FF`, 256×256 cells
Top-down, cute, filling ~80% of the cell. The little **face points the way it's facing**, so
paint **four facings** each (down / up / left / right). If you'd rather do fewer, a single
**down-facing** frame for each is enough to start — we'll reuse it.

### The hero — a round garden hedgehog forager
| file | facing |
|---|---|
| `keeper_down.png`  | facing toward the viewer (default) |
| `keeper_up.png`    | facing away |
| `keeper_left.png`  | facing left |
| `keeper_right.png` | facing right |
- Brown-quilled little hedgehog seen from above, a soft cream face poking out toward the facing
  direction, tiny dark eyes and a pink nose, small paws. Friendly, plucky, a little determined.

### The pests — four kinds, four facings each (or one each to start)
Each fills ~80% of the cell, clearly a *different silhouette* so players tell them apart at a glance.

| file base | pest | character |
|---|---|---|
| `pest_beetle_*.png` | **Beetle** (hugs the walls) | a round green shield-beetle, split wing-line down the middle, two dark spots. Steady, dim. |
| `pest_wasp_*.png` | **Wasp** (flies straight, bounces off walls) | a gold-and-black striped wasp with pale wings, seen from above. Fast, angry. |
| `pest_slug_*.png` | **Slug** (slides back and forth) | a grey-green garden slug with two eye-stalks, a glossy trail. Slow, blunt. |
| `pest_chomper_*.png` | **Chomper** (chases the hedgehog) | a red round critter that is mostly a set of little white teeth. Hungry, relentless. The scary one. |

(`*` = `down` / `up` / `left` / `right`. So `pest_beetle_down.png`, etc.)

---

## SHEET C — ITEMS, CHARMS & OBJECTS  ·  flat magenta `#FF00FF`, 256×256 cells
Small pickups and pushables that sit on a floor tile. Fill ~70% of the cell so the floor shows
around them.

### Pickups
| file | what it is |
|---|---|
| `item_seed.png` | a plump golden **seed pod** — the thing you gather. A little shine. |

### Keys — a small garden key tinted its colour
| file | colour |
|---|---|
| `key_red.png` / `key_green.png` / `key_blue.png` / `key_yellow.png` | four keys |

### Charms — a small round talisman/amulet, one per hazard (this is the "boot")
| file | charm | motif |
|---|---|---|
| `charm_lily.png` | crosses **water** | a blue-green lily-pad amulet with a dewdrop |
| `charm_ember.png` | crosses **fire** | a warm ember/salamander amulet, orange glow |
| `charm_frost.png` | steers on **ice** | a pale blue snowflake/frostleaf amulet |
| `charm_wind.png` | steers on **gusts** | a green whirl-of-leaves / dandelion amulet |

### Objects
| file | what it is | notes |
|---|---|---|
| `obj_planter.png` | a **stone planter block** you can push (fills a pond) | a chunky square stone trough with a little sprout on top; reads as pushable/heavy, ~90% of the cell |
| `obj_puffball.png` | a **puffball spore bomb** — pops if touched | a round pale puffball mushroom, faintly ominous; ~70% of the cell |

---

## SHEET D — TITLE & CARD (optional, whenever)
| file | what it is |
|---|---|
| `logo.png` | the word **Seedkeeper** as a hand-lettered botanical logo (magenta bg, transparent) |
| `title-bg.jpg` | a moody top-down hero shot of the hedgehog in a lantern-lit hazard garden — full-bleed, no magenta, ~1080×1350 (portrait). Doubles as the portal thumbnail. |

---

## Wiring
Filenames above are the contract. Drop finished files into
`satellites/seedkeeper/assets/`, tell me, and I chroma-key the magenta sheets, quantize,
cache-bust and wire each one in over its placeholder (the game already knows where each goes).
Nothing needs to arrive at once — every missing file just keeps its hand-drawn placeholder.

## Suggested order (most bang first)
1. **The hedgehog** (`keeper_down` at least) + `tile_floor` + `tile_wall` — the core look.
2. `item_seed`, `tile_exit`, `tile_gate`, `tile_pond`, `charm_lily` — the first gardens.
3. The four **pests** (one facing each) — they're the personality.
4. Fire / ice / wind tiles + their charms, doors + keys, planter + puffball.
5. Sheet D title art whenever you want a thumbnail.
