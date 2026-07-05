# BURR BLAST — Asset Generation List
_For Stephen to generate. Every asset is OPTIONAL: the game ships 100% canvas-drawn
and each art slot falls back to the drawn version if the file is missing, so you can
drop art in one piece at a time and nothing ever breaks._

## Where art goes
Drop finished PNGs into `satellites/burr-blast/assets/` using the exact filenames
below. The game loads each with an `onerror` fallback to its canvas drawing, so a
missing or mis-sized file simply keeps the current look. Tell me when a batch is in
and I'll wire + cache-bust it.

## House style (put this in every prompt for consistency)
> Cozy children's-storybook illustration, soft painterly gouache, warm rim light,
> macro garden world (everything is thumb-sized), friendly rounded shapes, big
> readable silhouettes. Palette: sage green, warm gold, cream, on deep charcoal.
> No text in the image. No photorealism. Transparent background where noted.

Aspect/size given per asset. Export PNG. Keep characters on **transparent**
backgrounds; keep backdrops full-bleed. Nothing over ~1600px on the long edge
(the host down-samples larger — see repo note), so export at the sizes listed.

---

## TIER 1 — biggest visual lift (do these first)

### Logo / wordmark
| file | size | notes / prompt seed |
|---|---|---|
| `logo.png` | 1024×512, transparent | The words **BURR BLAST** as a chunky, friendly seed-and-vine wordmark; a spiky burr dots the "i"-less title as a flourish; gold + sage on transparent. Playful, bold, storybook. |

### World backdrops (4) — full-bleed, portrait
Painterly parallax skies + distant garden. Ground/forts are drawn by the game on
top, so leave the lower third simple.
| file | size | scene |
|---|---|---|
| `bg-world1.jpg` | 1080×1600 | **Sprout Meadow** — dawn meadow, dewy grass, soft green + gold light. |
| `bg-world2.jpg` | 1080×1600 | **Stoneyard** — a mossy rockery, grey pebbles, cool overcast. |
| `bg-world3.jpg` | 1080×1600 | **Dewglass Hollow** — a pond edge at dusk, teal water, glass glint. |
| `bg-world4.jpg` | 1080×1600 | **Blastpod Bog** — a misty bog at night, warm ember glow, iron + reeds. |

### Hero + boss + pest
| file | size | subject |
|---|---|---|
| `bramble.png` | 512×512, transparent | **Bramble** — young burdock sprout, bottlecap hat tipped back, forked-twig slingshot, seed-burr body, determined little grin. THE mascot. |
| `weevil-king.png` | 768×768, transparent | **The Weevil King** — fat snout-weevil, crown of chewed gold-leaf, perched greedy on a seed hoard. Pompous, a bit cowardly. |
| `aphid.png` | 256×256, transparent | **Aphid** foot-soldier — round, green, big shiny eyes, two antennae, cute and dim. This is the pest you clear. |

---

## TIER 2 — the 6 seed icons (HUD + shop)
256×256, transparent, chunky and readable at 34px. Match the game's current shapes.
| file | seed |
|---|---|
| `seed-burr.png` | spiky brown sticky burr |
| `seed-split.png` | pale dandelion tri-seed with a bright core |
| `seed-acorn.png` | fat acorn with a ridged cap |
| `seed-puffball.png` | round fuzzy mushroom puffball |
| `seed-thornpod.png` | dark thorny pod with a lit fuse spark |
| `seed-boomerang.png` | curved maple-samara boomerang seed |

---

## TIER 3 — the intro comic (7 panels)
1080×1080 each, full-bleed storybook art. Captions are added by the game, so **no
text in the image**. Script + framing in `STORY.md` → "The intro comic".
| file | panel |
|---|---|
| `comic-1.jpg` | Dawn garden, one bloom breathing. |
| `comic-2.jpg` | The swarm marches in hauling twigs and seeds. |
| `comic-3.jpg` | The Weevil King on his throne of stolen seeds. |
| `comic-4.jpg` | Close on Bramble picking up the forked twig. |
| `comic-5.jpg` | Bramble loads a burr and pulls the sling back tight. |
| `comic-6.jpg` | The burr flies; a twig fort topples; aphids puff to fluff. |
| `comic-end.jpg` | Garden in full bloom, seeds on the wind, King scuttling off small. |

---

## TIER 4 — nice-to-have polish (all have solid canvas fallbacks)
| file | size | subject |
|---|---|---|
| `pest-nettle.png` | 512×512, transp | W1 lieutenant **Sergeant Nettle** (bossy aphid drill-sergeant). |
| `pest-pebblejaw.png` | 512×512, transp | W2 **Old Pebblejaw** (stone-hauling beetle). |
| `pest-glazier.png` | 512×512, transp | W3 **The Glazier** (lacewing glassblower). |
| `pest-fuse.png` | 512×512, transp | W4 **Fuse** (firefly demolitionist). |
| `sling-oak.png` … `sling-gold.png` | 256×256, transp | 4 slingshot skins (oak / willow / ironwood / goldwood). |
| `star.png` | 128×128, transp | a warm gold star for the 3-star tallies. |
| `menu-bg.jpg` | 1080×1600 | title-screen backdrop (Bramble on a hill at dawn, forts on the horizon). |

---

## Thumbnail (you're making this)
Portal card art. **≤ 480px on the long edge, ≤ 150 KB, .jpg.** Save as
`portal-assets/thumbs/burr-blast.jpg` (a placeholder in-game frame is there now).
Best shot: Bramble mid-pull with the trajectory arc curving toward a toppling fort.

## Naming + handoff
- Keep the exact filenames above (lowercase, hyphens).
- Any size is fine to hand me — I resize/optimize on wiring.
- Batch or one-at-a-time both work. Ping me per batch and I wire + cache-bust
  (`?v=` stamp) and verify against the live URL.

=====================================================
V2 — the deckbuilding meta (art for the build layer)
=====================================================
All canvas-drawn / emoji now; art is pure upgrade (onerror fallback everywhere).

### The 3 new seeds (256x256, transparent — match the 6 seed icons above)
- seed-gourd.png     — a fat orange gourd / pumpkin-seed (heavy roller)
- seed-firethorn.png — a dark thorny pod wreathed in a small flame (premium bomb)
- seed-dandelion.png — a puff of four pale dandelion seeds fanning out

### Nutrient icons (128x128, transparent) — N/P/K, bold + readable at 20px
- nutrient-n.png — Nitrogen: a warm orange flame / fist (power)
- nutrient-p.png — Phosphorus: a violet spark / burst (ability potency)
- nutrient-k.png — Potassium: a blue water drop (utility)

### Companion portraits (10) — 256x256, transparent, cozy storybook creatures
bee, mammoth (baby), worm, koi, pangolin, firefly, spider (garden), raccoon, scarab, beholder.
Filenames: companion-<id>.png (e.g. companion-bee.png). Big friendly faces; they sit in
the Grove grid + the loadout Team row. The Beholder is the rare one — a floating eye, more
mysterious than cute.

### Relic icons (8) — 96x96, transparent, little talisman/charm objects
relic-secondwind, relic-fatseeds, relic-splitter, relic-longfuse, relic-featherfall,
relic-brittle, relic-prospector, relic-glasscannon.

### Currency + run icons (64x64, transparent)
- fertilizer.png (🌱 a seed/sprout — the build currency)
- sap.png (🍯 a golden drop — Expedition spend)
- vigor.png (❤ a leaf-heart — Expedition lives)

### Expedition node art (optional, 128x128) — the map choices
node-fort, node-elite, node-cache, node-shed, node-boss (The Deep Warden).

Priority for the meta: nutrient icons + companion portraits first (most on-screen), then
the 3 new seeds, then relics, then node art.
