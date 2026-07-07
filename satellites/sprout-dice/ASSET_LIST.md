# SPROUT DICE — Art Asset List (hand to ChatGPT)

*Sprout Dice is a cozy botanical **dice roguelike** — roll plant dice, place them on garden
pests (thorn to strike, bark to shield, bloom to heal), climb 12 floors, fell a boss. Today
it's all **emoji + CSS** (ivory dice with a glyph, emoji pests). This is the art to make it a
real painted game. Everything below is wired to a filename the moment you drop it into
`satellites/sprout-dice/assets/` — hand me a batch and I'll wire the `<img>` hooks (it's a
DOM/CSS game, so art slots into the die faces and enemy cards). Paint any subset, any order.*

---

## HOUSE STYLE (paste into every prompt)
Cozy children's-storybook, soft painterly/gouache, warm rim light, gentle glow, big readable
shapes. **Midnight-greenhouse palette:** deep near-black green `#0d100c`, sage `#7ab356`, warm
gold `#c8a84b`, cream `#e8dcc8`. Face-type accent colours below. **Flat magenta `#FF00FF`
background** on the sprite sheets (I chroma-key it); full-bleed for the board/logo/thumbnail.
No text baked in (except the logo). Paint big, keep under 1600px.

---

## ⭐ SHEET 1 — THE 7 FACE SYMBOLS  ·  the biggest bang  ·  4×2 grid, 256×256 cells, magenta
These are the botanical glyphs stamped on every die face — the game's core visual language.
Each a single bold emblem in its accent colour, cream highlights, reads at 30px.

| | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| 1 | `face_thorn` | `face_spread` | `face_heal` | `face_bark` |
| 2 | `face_root` | `face_wild` | `face_blank` | (blank) |

- **`face_thorn`** — a sharp barbed thorn / bramble spike. Red `#d8564a`. (attack one pest)
- **`face_spread`** — a burst of flung seeds / spores radiating out. Coral `#e8823a`. (hit all)
- **`face_heal`** — a blooming flower or dewdrop. Green `#7ecb5a`. (restore Resolve)
- **`face_bark`** — a woody shield / bark plate. Slate-blue `#6fa8d6`. (block)
- **`face_root`** — a gnarled root coil / tangle. Purple `#b07fd0`. (weaken a pest's attack)
- **`face_wild`** — a golden star-seed / prismatic bloom. Gold `#f2d24b`. (becomes any of the above)
- **`face_blank`** — a plain dormant seed / bare pip. Muted `#8a9178`. (nothing)

## SHEET 2 — DIE FACES BY RARITY  ·  the die body under the symbol  ·  4×1, 256×256, magenta
The tactile die itself (the symbol sits on top). One per rarity so rarer dice feel special.

| `die_common` | `die_uncommon` | `die_rare` | `die_legendary` |
|---|---|---|---|

- **common** — a warm carved **wooden** die face, cream `#f4efe2`, tan bevel (the current look, but painted).
- **uncommon** — a **living green** die, mossy edges, a sage glow.
- **rare** — a **polished amber/gold** die, gem-like, warm gold rim.
- **legendary** — a **crystalline seed-pod** die, faint magic shimmer (for future top-tier dice).

*(Alternative if you'd rather make each die unique: paint 12 distinct dice — `die_bramble`,
`die_fern`, `die_oak`, `die_nettle`, `die_clover`, `die_vine`, `die_venus`, `die_willow`,
`die_moss`, `die_thistle`, `die_sundew`, `die_holly` — each a little botanical object with its
own character. Tell me which route and I'll wire it. The rarity-frame route above is fewer pieces
for the same lift.)*

## SHEET 3 — PESTS  ·  the enemies you fight  ·  4×3 grid, 512×512 cells, flat magenta
Menacing-cute garden pests, seen from a slight top-down game angle, clear silhouette. Replace the
emoji on the enemy cards. Row-major:

| | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| 1 | `pest_aphid` | `pest_locust` | `pest_beetle` | `pest_slug` |
| 2 | `pest_wasp` | `pest_weevil` | `pest_thrip` | `pest_mantis` |
| 3 | `pest_stinkbug` | `pest_borer` | `pest_cutworm` | `pest_hornet` |

- aphid (soft green sap-sucker), locust (lean grasshopper), beetle (armored dome), slug (fat grey
  blob), wasp (sharp yellow-black flyer), weevil (snout beetle), thrip (tiny fast dark sliver),
  mantis (leaf-green praying mantis), stinkbug (spiky shield-back — reads "don't touch"), borer
  (armored grub), cutworm (curled caterpillar), hornet (fuzzy swarm wasp).

## SHEET 4 — BOSSES  ·  2×2 grid, 512×512, magenta  ·  paint BIG + regal-menacing
| | 1 | 2 |
|---|---|---|
| 1 | `boss_blight` | `boss_rootrot` |
| 2 | `boss_swarmqueen` | `boss_thornwyrm` |

- **blight** — a towering rot-fungus, cap + spores, sickly glow (the original final boss).
- **rootrot** — a bloated diseased root-mass, oozing, armored bark plates (tanky/regen).
- **swarmqueen** — a huge regal locust queen, wings spread, wreathed in little drones (multi-hit/summon).
- **thornwyrm** — a serpentine bramble-dragon of living thorns, coiled, sharp eyes (the spiky one).

## SHEET 5 — BOARD & TITLE  ·  full-bleed (NO magenta)
| asset | file | notes |
|---|---|---|
| Board backdrop | `bg_board.jpg` | the greenhouse-at-midnight behind the fight: dark mossy soil + a faint climbing **trellis** motif, gentle vignette, calm so the bright dice/pests pop. Portrait ~1080×1920. |
| Logo | `logo.png` (transparent) | **SPROUT** (sage) stacked over **DICE** (gold), a storybook wordmark with a little sprout + die motif. |
| Portal thumbnail | `portal-assets/thumbs/sprout-dice.jpg` | already spec'd in **THUMBNAIL_SPEC.md** (~480², ≤150 KB). |

---

## SUGGESTED ORDER (biggest lift first)
1. **Sheet 1 — the 7 face symbols.** Every die shows one; the whole game transforms.
2. **Sheet 3 — the 12 pests** (then Sheet 4 bosses). The board stops being emoji.
3. **Sheet 2 — rarity die faces.** Tactile dice.
4. **Sheet 5 — board bg + logo**, and the thumbnail whenever.

Hand me any batch (magenta sheet or transparent PNGs) and I'll cut, wire the `<img>` hooks into
the die faces / enemy cards, cache-bust and re-vendor — one sheet at a time.
