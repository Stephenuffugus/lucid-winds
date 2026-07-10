<!-- Meadow Weave · Sheet 4: Living Diorama & FX — per-land "comes alive" motifs, feral seed chips, perfect flare, region ring, motes -->
<!-- Copy everything below into your image generator to make this ONE sheet. -->

STYLE — "Lantern Atlas" (Meadow Weave / Sky Wolf Studios moonlit hex tile-laying). The moment the inked map stirs: small hand-inked creatures and land-spirits lifting off a lantern-lit atlas — gouache wash + engraved ink lines, warm glow, faint paper grain. Kid-friendly storybook-explorer, gentle and wondrous, nothing scary. Every subject centered and upright. Reads by VALUE + TEXTURE first, hue second (colorblind requirement — each land's motif keeps its own silhouette so the five "comes alive" moments are tellable apart without color). Palette: table #0d100c/#0b0f0b, ink #2a331f, moss #8a9178, cream vellum #e8dcc8, lantern gold #c8a84b, seam-light #eafbd6/#c8e896, sage #7ab356; THE FIVE LANDS: Meadow #4f8038→#7ab356, Pond #2b567c→#5b9bd5, Forest #24421f→#3f6b34, Field #9c7f2e→#d9b85a, Orchard #7d3450→#e58fa0; dew #bfe0f2, moon-blue #5b9bd5, rose #e58fa0. Restrained glow, NO photoreal, NO neon, NO outlines heavier than #2a331f ink, NO text/letters/numbers/logos/watermarks. Compress under 150KB.

Create one sprite sheet. File: mw_fx.png. Grid: 4 columns x 4 rows (16 cells, left-to-right, top-to-bottom). Cell: 512x512. Master: 2048x2048.

KNOCKOUT: Flat magenta #FF00FF fills the entire background of every cell. NO magenta / hot-pink ANYWHERE inside the art (keep Orchard plum #7d3450 and rose #e58fa0 clearly distinct from #FF00FF). Each subject centered, upright, fully inside its cell with margin, NO ground shadow (these composite over live board tiles). Keep every glow contained within its own cell — no glow bleeding onto the magenta field.

LIVING DIORAMA MOTIFS (cells 1-5) — the hero sprite for each land's "region comes alive" moment. The engine fires a particle burst (`spawnDiorama`) tinted to the land's light color at the region's center; each motif below composites UNDER that burst as the thing that woke up. One small creature-and-flora vignette per land, glowing softly as if it just lifted off the inked map, ~60% of cell:
1. alive_meadow — a cream-and-sage butterfly rising above two tufts of engraved meadow grass, a couple of #eafbd6 pollen motes around it; Meadow greens #4f8038/#7ab356 with cream wings.
2. alive_pond — a small glossy fish arcing out of a ring of engraved ripples, dew #bfe0f2 droplets flicking off its tail; Pond blues #2b567c/#5b9bd5.
3. alive_forest — a round little owl on a pine sprig, one wing lifting, two tiny inked conifer tips behind; Forest greens #24421f/#3f6b34 with cream face; friendly, wide-eyed.
4. alive_field — a harvest mouse standing among swirling grain stalks, one bent stalk arcing over it, loose grains drifting; Field golds #9c7f2e/#d9b85a.
5. alive_orchard — a songbird perched on a blossoming branch, three petals mid-fall; Orchard plum #7d3450 branch with rose #e58fa0 blossoms and a cream breast.

FERAL SEED CHIPS (cells 6-10) — the pressed-seed keepsakes for the pouch screen, replacing the emoji row (🌿🐟🌲🌾🌸) inside the 60px pouch squares. Each is ONE seed pressed flat like a wax-sealed herbarium specimen: a chunky seed silhouette in its land's colors with a faint cream press-ring stamped around it, inked-stamp style, bold enough to read at 40px:
6. seed_meadow — a curled grass-seed with two tiny blades sprouting, sage on a #4f8038 heart.
7. seed_pond — a teardrop pond-seed with an engraved fish-scale pattern, dew-blue glint, Pond blues.
8. seed_forest — a stout pinecone-seed with cross-hatched scales, deep Forest greens.
9. seed_field — a plump wheat grain with a whisker awn, warm Field gold.
10. seed_orchard — a blossom-seed: a rounded pip wrapped in one rose petal, Orchard plum/rose.

FX (cells 11-16):
11. mote_neutral — ONE soft round particle mote in pure cream-white #e8dcc8→white, feathered edge, color-NEUTRAL so the engine can tint it to any land's light color (`BIOMES[b].c2`) for the diorama burst. No hue.
12. flare_perfect — the perfect-placement flare (all touched edges matched → bonus + tile refund): a crisp six-point gilded starburst in lantern gold #c8a84b with a cream #ffffff-warm core and a thin hex-shaped echo ring; celebratory, contained.
13. ring_region — the region-alive shockwave: a soft expanding ring in seam-light #eafbd6→#c8e896, slightly hex-flavored (six gentle flat facets), feathered outward edge, transparent center; the engine scales it up and fades it at the diorama centroid.
14. burst_quest — the quest-complete flourish (the engine floats the word; this is the glow behind it): a small gold pennant-shaped burst — the expedition flag motif exploding into gilt ribbons and three cream sparks; pictographic, no letters.
15. wash_rest — the end-of-run "the meadow rests" flourish: a thin crescent moon in cream with two drifting seed-fluff motes and a single sage leaf settling, arranged as a gentle corner vignette on transparent; composites onto the results screen.
16. sparkle — a tiny four-point cream #e8dcc8 sparkle with a soft halo; the reusable twinkle for matched seams, unlock moments and pouch highlights.
