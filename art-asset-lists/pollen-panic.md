# Pollen Panic — Sprite Asset List

Botanical Pac-Man. The game draws every entity procedurally on a canvas (no image assets exist yet). These sheets are drop-in replacements for the CHARACTERS and pickups only. The hedge maze, seed dots, and bloom power-pellets stay procedural because they are recolored at runtime across 6 garden themes (and seeds are 2-9px) — sprites there would fight the theme system. Art is authored theme-neutral so it reads on every backdrop.

## STYLE (shared — applies to every sheet)
Bright, colorful, fun handmade paper-craft game art. Cozy midnight-garden world with deep near-black green shadows, saturated sage greens, antique gold rewards, cream highlights, rose accent for targets/peaks. Tactile fiber-art materials: cut paper, wool felt, macrame cord, beads, sequins, glitter, scrapbook layers, stitched edges, soft handmade texture. Cute botanical bugs and garden-pest critters. Clean readable silhouettes first. Cute botanical critter energy, cozy-menacing pests, never scary or grim. Soft top-down key light with warm gold rim-light. Chunky arcade readability at small sizes. No photorealism, no 3D render, no text labels, no captions, no borders, no UI words unless a logo cell says exact logo text. Keep detail bold and simple enough that each cropped asset compresses well. Palette base #0e140d, sage #7ab356, gold #c8a84b, cream #e8dcc8, rose #e58fa0.

---

## Sheet 1 — PLAYER CRITTER SKINS
- File: `pollen_panic_players.png`
- Grid: 4 cols x 2 rows (8 cells)
- Cell size: 512 x 512 px
- Master size: 2048 x 1024 px
- Knockout: cutout sprite sheet — flat magenta #FF00FF background in every cell for knockout. No magenta inside the artwork.
- Each critter is drawn TOP-DOWN and UPRIGHT (the code renders the hero without rotation), face toward the top, chunky and cute, bee-sized bug that fills most of the cell with a little padding.

1. player_ladybug — round red ladybug (#D6453A), glossy domed shell with black felt spots, cream face, two beady eyes, tiny bead antennae, warm gold rim-light.
2. player_bee — plump bumblebee, gold body (#F2B233) with dark wool-felt stripes, translucent stitched wings, big friendly eyes.
3. player_firefly — soft green beetle (#B7E86F), glowing amber lantern tail, gentle bloom glow, cute.
4. player_dew_sprite — pale blue dewdrop critter (#7FD8FF), glossy translucent body, sequin shine, sparkle highlight.
5. player_dusk_moth — lavender fuzzy moth (#CBB8E8), patterned felt wings with soft eyespots, wool-textured body.
6. player_ember_beetle — orange beetle (#FF7A4D), warm inner glow, tiny ember-fleck sequins, cozy not fiery.
7. player_golden_scarab — polished antique-gold scarab (#E8C55A), engraved paper-cut shell segments, high bead shine.
8. player_jade_weevil — jade-green weevil (#3FBF8F), glossy rounded shell, long cute snout, macrame-cord legs.

---

## Sheet 2 — PESTS, STATES, DRONE, SUNBERRY
- File: `pollen_panic_pests.png`
- Grid: 3 cols x 3 rows (9 cells)
- Cell size: 512 x 512 px
- Master size: 1536 x 1536 px
- Knockout: cutout sprite sheet — flat magenta #FF00FF background in every cell for knockout. No magenta inside the artwork.
- Pests face forward, cozy-menacing (mischievous, never scary). They gently bob in code, so a single upright pose per pest is correct.

1. pest_aphid — fat pear-shaped aphid (#E0533D), six little macrame legs, two antennae, big round white eyes, cheeky-menacing.
2. pest_wasp — golden wasp (#F2B233), striped felt abdomen, buzzing translucent wings, tiny stinger, grumpy cute eyes.
3. pest_mantis — teal praying mantis (#52B8C4), angular diamond body, raised sickle arms, triangular head, big eyes.
4. pest_snail — mauve snail (#C77CB0), coiled paper-spiral shell, two eye-stalks, glossy slug foot, mischievous smile.
5. pest_wilted — universal frightened/edible state (used by any scared pest or drone): drooping grey-blue sprout (#7C93C4), two limp felt leaves, a single woeful dot eye, soft and sad-cute.
6. pest_eaten_puff — defeated pest drifting home: a white fluffy dandelion seed-puff sphere with radiating fine seed filaments, airy and light.
7. drone_sleep — dozing sprout seed-pod (#7FA05B), bean-shaped, eyes closed, curled asleep with a tiny floating "z" felt letter, a seam stitch down the middle.
8. drone_awake — awakened sprout seed-pod (#9BC53D), brighter, two black bead eyes, alert and eager, stitched seam.
9. sunberry_fruit — bonus berry cluster: three plump marigold berries (#F2B233) bunched together with a small green leaf sprig and gold rim-light, glossy and tempting.

---

## Sheet 3 — THEME BACKDROPS (garden floors)
- File: `pollen_panic_backdrops.png`
- Grid: 3 cols x 2 rows (6 cells)
- Cell size: 1152 x 1280 px (near-square — the maze board is 19 x 21 tiles, roughly square, not tall-portrait)
- Master size: 3456 x 2560 px
- Knockout: full-bleed backgrounds — full-bleed art, no magenta inside a cell; magenta #FF00FF only in gutters between cells.
- CRITICAL: these sit BEHIND the procedural hedge maze and glowing seeds, so keep them DARK, soft, low-contrast, and detail-free near the center. Texture and interest live in the corners/edges only. Each matches its theme palette.

1. bg_day_garden — deep near-black green loam (#101B0E) handmade-paper texture, faint sage fibers, a few warm gold motes drifting in the corners.
2. bg_moonlit_garden — dark indigo felt (#0A0F1E), soft moonbeam glow across the top edge, tiny cool-blue star sequins scattered at the edges, dreamy.
3. bg_autumn_arbor — dark umber paper (#1C120A), scattered copper and gold felt leaves resting in the corners, cozy warmth.
4. bg_greenhouse — deep teal glass texture (#07171A), faint condensation streaks, soft aqua rim-glow at the frame edges.
5. bg_desert_bloom — dark plum sandy paper (#1A0F14), muted rose felt dunes low at the edges, warm dusk feel.
6. bg_mushroom_grove — dark violet felt (#140A1C), faint purple mushroom silhouettes tucked in the corners, soft spore glitter.

---

## Sheet 4 — LOGO (optional, lowest priority)
- File: `pollen_panic_logo.png`
- Grid: 1 col x 1 row (1 cell)
- Cell size: 1024 x 512 px
- Master size: 1024 x 512 px
- Knockout: cutout sprite sheet — flat magenta #FF00FF background for knockout. No magenta inside the artwork.

1. logo_pollen_panic — paper-craft stacked wordmark reading exactly "POLLEN PANIC" and nothing else. Cut-paper felt letters: "POLLEN" in cream (#e8dcc8), "PANIC" in rose (#e58fa0), a tiny felt bee or flower accenting a letter. Stitched edges, soft drop shadow. No other text.

---

## WIRE NOTES
The game has no ART hook yet — add a `window.PP_ART` image map and gate each procedural draw on it (art replaces procedural draw when present, same pattern as Nectar Drop). Key mappings:
- **Sheet 1 → `drawPlayer()`**: draw the upright skin sprite keyed by `save.skin` (ladybug/bee/firefly/dew/moth/ember/scarab/jade). Render upright (no ctx.rotate — asymmetric bugs would flip), and fake the chomp with a small code-side vertical squash on `chompT`; fall back to the procedural arc when the sprite is absent.
- **Sheet 2 → `drawPest()` / `drawWilted()` / `drawEaten()` / drone loop in `frame()` / `drawFruit()`**: `p.id`→pest_aphid/pest_wasp/pest_mantis/pest_snail; frightened state→pest_wilted; `state==="eaten"`→pest_eaten_puff (both pests AND frightened drones already reuse drawWilted/drawEaten). Drone loop: `d.state==="sleep"`→drone_sleep, else→drone_awake. `drawFruit()`→sunberry_fruit. Keep the existing `bob` offsets in code.
- **Sheet 3 → `renderMazeOffscreen()`**: `drawImage(PP_ART.bg[save.theme], 0,0, w,h)` before the hedge strokes, keyed by theme (day/moonlit/autumn/glass/desert/fungal). Invalidate `offMaze=null` on theme change (already done in the shop equip path).
- **Sheet 4 → menu**: swap the `#menu .card h1` for the logo image.
- **Keep procedural (do NOT skin):** hedge maze (`renderMazeOffscreen` strokes, recolored per theme), seed dots (`drawSeed`, 2-9px + 4 styles + theme recolor), bloom power-pellets (`drawBloom`, theme recolor + pulse), trail particles (`drawParticles`).
- Recommended folder: `satellites/pollen-panic/assets/`. Cache-bust the img src with `?v=` on deploy.
