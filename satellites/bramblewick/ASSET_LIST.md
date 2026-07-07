> **STATUS (2026-07-07):** Sheets 1, 2, 3, 4, 5 are **DONE** — that art is cut, wired and live
> (15 creatures, 24 companions, logo, arena bg, hero/thumbnail, 22 draft icons). The **only art
> still open** is the 4 new bosses + 5 ground backgrounds, and those now live in a focused,
> paste-ready file: **`BOSS_ART_LIST.md`** (in this folder). Hand that one to ChatGPT next.
> This file below is kept as the full historical plan.

---

# BRAMBLEWICK — Sprite-Sheet Plan (hand this to ChatGPT)

*A botanical survivor-like: you are a lone plant, swarmed by garden pests, defending with living
weapons and a menagerie of animal familiars. The art below drops straight in — I've already wired
every filename below to an `ART.*` hook, so the moment a correctly-named PNG lands in
`satellites/bramblewick/assets/`, the game uses it instead of the placeholder shape. Nothing else
changes. Paint any subset, in any order.*

---

## SHARED RULES (put these in every prompt)
- **Flat magenta `#FF00FF` background** with narrow magenta gutters between cells (I chroma-key it out).
  The two full-bleed sheets (background, and the logo/thumbnail) are the only exceptions — noted below.
- **No** words, labels, filenames, numbers, UI, borders, frames, or captions anywhere.
- **No magenta inside the painted art itself.** Keep each subject fully inside its cell with even
  padding; no overlap into neighbours.
- **View:** creatures are seen from a **slight top-down game angle** (they swarm a plant on a floor),
  readable as a clear silhouette at small size. No big drop shadows touching the magenta.
- **House style:** cozy-but-moody botanical, **midnight-greenhouse** palette — deep greens, mossy
  near-black, warm gold, cream, restrained rose/ember accents. Soft top-down light, gentle hand-painted
  gouache texture, clean cartoon cel-shading. Pests read as *menacing-cute garden bugs*; companions read
  as *friendly little helpers*. Same world as the rest of the Lucid Winds fleet.
- After slicing, export each as a transparent PNG. Paint big; don't crop silhouettes too tight (leave a
  little even padding so glow/motion doesn't clip).

---

## SHEET 1 — CREATURES  ·  4×4 grid, 512×512 cells, flat magenta
The plant hero, the two bosses, and every pest. Row-major, left→right:

| | Cell 1 | Cell 2 | Cell 3 | Cell 4 |
|---|---|---|---|---|
| 1 | `player` | `boss_grubfather` | `boss_stormwing` | `pest_aphid` |
| 2 | `pest_beetle` | `pest_locust` | `pest_slug` | `pest_wasp` |
| 3 | `pest_mite` | `pest_weevil` | `pest_scale` | `pest_mealybug` |
| 4 | `pest_cutworm` | `pest_thrip` | `pest_vineborer` | blank magenta |

**Identity notes**
- **player** — the hero. A small brave sprout/plant person: a green crown-bulb head with a glowing gold
  center, tiny leaf arms, rooted-but-plucky stance. Determined, heroic-cute. Seen slightly from above.
- **boss_grubfather** *(World-1 boss)* — a huge segmented grub, pale armored plated back, blunt chewing
  face, small angry eyes. Slow, tanky, gross-but-charming. Paint bigger than a pest.
- **boss_stormwing** *(flying boss)* — a locust "queen": broad translucent gold wings spread, armored
  gold-green body, sharp eyes. Fast, aerial, regal-menacing.
- **pests** (all garden bugs attacking your plant, menacing-cute):
  - `aphid` — round soft green sap-sucker, big dot eyes (the basic swarm).
  - `beetle` — Leaf Beetle, armored domed shell, sturdy.
  - `locust` — lean leaping grasshopper, chevron wings, hungry.
  - `slug` — fat slow grey-green blob with eye-stalks.
  - `wasp` — sharp yellow-black flyer, thin wings, aggressive.
  - `mite` — tiny red spider-mite, many little legs, in a cluster.
  - `weevil` — snout-nosed beetle, hard rounded body.
  - `scale` — Scale Insect, a limpet-like waxy shield clamped low.
  - `mealybug` — fuzzy white cottony bug.
  - `cutworm` — a curled grey-brown caterpillar, crescent shape.
  - `thrip` — a tiny thin dark sliver-bug, fast.
  - `vineborer` — a drill-headed grub, pointed boring snout, striped body.

## SHEET 1B — THE OTHER FOUR BOSSES  ·  2×2 grid, 512×512 cells, flat magenta
The multi-stage build adds four more bosses (one per new ground). Paint them BIGGER
than pests, same menacing-cute storybook style. All wired to `boss_<id>` — drop them in
`assets/` and they replace the procedural placeholder.

| | 1 | 2 |
|---|---|---|
| 1 | `boss_tideshell` | `boss_broodmother` |
| 2 | `boss_frostmaw` | `boss_wiltqueen` |

- **boss_tideshell** *(The Sunken Beds)* — a huge bog "matron": a low, waxy domed
  limpet/snail shield clamped over a soft green body, dripping slime, small wary eyes
  peeking from under the rim. Teal-green (#4a8a76). Slow, armored, patient.
- **boss_broodmother** *(The Hothouse Understory)* — a Cordyceps "Broodmother": a
  bulbous fungal spore-sac body, violet (#9b7ad6), ringed by radiating pale spore
  stalks/asters, faint glow, two dark eyes. Floating/rooted, eerie-regal.
- **boss_frostmaw** *(The Long Dark Conservatory)* — a huge frost grub, pale
  blue-grey (#5a7f92) armored plates rimed with frost, cold breath, blunt chewing
  face. Same body plan as the Grubfather but frozen-over.
- **boss_wiltqueen** *(the true final boss)* — The Wilt Queen: a regal wilted-flower
  grub-queen, dusk purple (#6a5a7a), a crown of drooping petals, sharp sad eyes.
  The end of the game — worth extra polish.

## SHEET 2 — COMPANIONS A  ·  4×3 grid, 512×512 cells, flat magenta
Friendly familiars that orbit and help the plant. Big expressive faces, small readable silhouettes.

| | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| 1 | `companion_ladybug` | `companion_firefly` | `companion_bee` | `companion_butterfly` |
| 2 | `companion_hummingbird` | `companion_spider` | `companion_mantis` | `companion_seahorse` |
| 3 | `companion_toad` | `companion_mammoth` | `companion_scorpion` | `companion_pangolin` |

- Ladybug, Firefly (glowing tail), Bee (fuzzy), Butterfly, Hummingbird, Garden Spider (kind, not scary),
  Praying Mantis (leaf-green), Seahorse, Toad, Baby Mammoth (soft, tiny tusks), Scorpion (friendly),
  Pangolin (golden scales). All cute, rounded, storybook.

## SHEET 3 — COMPANIONS B  ·  4×3 grid, 512×512 cells, flat magenta

| | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| 1 | `companion_hedgehog` | `companion_snail` | `companion_worm` | `companion_koi` |
| 2 | `companion_jellyfish` | `companion_koala` | `companion_sprite` | `companion_fawn` |
| 3 | `companion_raccoon` | `companion_owl` | `companion_cicada` | `companion_beholder` |

- Hedgehog, Snail, Worm (smiling), Koi (flowing fins), Jellyfish (soft glow), Koala, **Mushroom Sprite**
  (`sprite` — a tiny living-mushroom fae), Deer Fawn, Raccoon (clever), Owl (wise), Cicada, and
  **The Beholder** (`beholder` — a small floating magical eye, mysterious and rare, subtle glow; the
  legendary one — worth extra polish).

## SHEET 4 — WORLD & TITLE  ·  full-bleed (NO magenta)
| asset | file | notes |
|---|---|---|
| Arena background | `assets/bg.jpg` (or a cell) | The greenhouse-at-midnight **floor**, seen top-down: dark mossy soil, faint botanical texture, gentle vignette, calm and readable so bright pests/companions pop over it. One image, roughly square/portrait. Used as the fallback for any ground without its own bg. |

### SHEET 4B — FIVE GROUND BACKGROUNDS *(optional — each ground has a procedural tint if absent)*  ·  full-bleed (NO magenta)
One top-down **floor** image per ground, same readable-and-calm rule (bright
sprites must pop over it). Each is optional; if missing, the game tints the floor
with that ground's palette. Filenames wired exactly:

| ground | file | mood / palette |
|---|---|---|
| Greenhouse Floor | `assets/bg_greenhouse.jpg` | dark mossy soil, sage flecks (the default look) |
| The Sunken Beds | `assets/bg_sunkenbeds.jpg` | wet peat, still black water, teal sheen |
| The Sundrift Meadow | `assets/bg_sundrift.jpg` | warm gold dust, sun-baked dry earth |
| The Hothouse Understory | `assets/bg_understory.jpg` | violet gloom, glowing spores, fungal shelves |
| The Long Dark Conservatory | `assets/bg_longdark.jpg` | icy blue-black, frost rime, cold starlight |
| Logo / wordmark | `logo.png` (transparent) | **BRAMBLEWICK** as a chunky, living-vine storybook wordmark — gold + sage on transparent, a thorn/leaf flourish. No subtitle. |
| Portal thumbnail | `portal-assets/thumbs/bramblewick.jpg` (~480×480, ≤150KB) | Hero shot: the little plant hero mid-fight, ringed by familiars, a wave of pests closing in, gold reaction sparks. Reads at 480px. |

## SHEET 5 — DRAFT ICONS *(optional, do last)*  ·  flat magenta, 256×256 cells
Small bold icons for the level-up cards. **10 weapons** then **12 passives** (I'll wire these when they
land — they're not hooked yet): weapons = Dandelion Puffer, Nettle Lash, Puffball Burst, Sundew Spitter,
Foxglove Volley, Sunflower Lance, Frostfern Fan, Thornvine Ring, Bloodroot Spike, Witchhazel Snap;
passives = Golden Hour, Phyllotaxis, Windborne Spores, Deep Taproot, Guttation, Heliotropism, Chill
Reservoir, Nectar Guide, Thigmonasty, Mycorrhizae, Etiolation, Vernalization. Each a single clear
botanical emblem. (Ask me for the exact `icon_<id>` filenames when you get here.)

---

## Suggested order (biggest lift first)
1. **Sheet 1** (creatures) — the whole battlefield transforms.
2. **Sheet 1B** (the four new bosses) — one boss per new ground; big visual payoff.
3. **Sheets 2–3** (companions) — your orbiting menagerie.
4. **Sheet 4 + 4B** — the arena background, five per-ground floors, logo + thumbnail
   (Bramblewick currently shows a 🌿 glyph in the portal). The five ground floors are
   optional — the game tints each ground procedurally until they land.
5. **Sheet 5** — draft icons, whenever.

Filenames are wired exactly as written → drop a batch in `satellites/bramblewick/assets/` (or hand me
the magenta sheet and I'll cut it with `scripts/cut_burrblast.py`-style tooling), and it appears.
