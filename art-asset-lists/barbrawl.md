# BarBrawl / "Wild Wardens" — Portal Sprite Asset List

> HONEST HEADER. BarBrawl is a native React-Native / Expo monorepo (apps/mobile, packages/game-core). The game-logic layer is complete; the UI is only partly built and the art seam is NOT wired to any screen yet (no call site passes `spriteKey`; only 3 procedural placeholder sprites exist). It is NOT a self-contained HTML satellite, so it cannot drop into the Sky Wolf portal in its current form — portal visibility is presently zero. It also already ships two code-accurate briefs (docs/ART_ASSET_LIST.md = 670 sprites, docs/ART_SPEC.md = drop-in spec). This doc is the portal-cohesion subset: the smallest MUST-tier set that visibly skins Battle, Roster, Overworld, Dungeon, reskinned to the game's own de-alcoholized "Wild Wardens" botanical theme + portal palette. Priority LOW.

## STYLE (shared block, prepend to every sheet)
Bright, colorful, fun handmade paper-craft game art. Cozy midnight-garden world of wild caretakers and mischievous plant spirits — no bars, no alcohol, no weapons (the game's own "Wild Wardens" nature-guardian reskin). Deep near-black green shadows, saturated sage greens, antique gold rewards, cream highlights, rose accent for bosses/targets. Tactile fiber-art materials: cut paper, wool felt, macrame cord, beads, sequins, glitter, scrapbook layers, stitched edges, soft handmade texture. Clean readable silhouettes FIRST. Cute botanical critter energy, cozy-menacing guardians, never scary or grim. Soft top-down key light with warm gold rim-light. Chunky arcade readability at small sizes. No photorealism, no 3D render, no text, no captions, no borders, no UI words. Palette base #0e140d, sage #7ab356, gold #c8a84b, cream #e8dcc8, rose #e58fa0.

MATERIAL/FORMAT NOTE (engine-dictated): this is a pixel-art pipeline — sprites author at a tiny base grid (16/32/48px) and nearest-neighbour upscale. Felt/bead/glitter texture will NOT survive at that size, so keep each cell a bold, simple paper-cut silhouette with flat color-blocking. Generate large (512px) for a clean silhouette, then downscale each cut asset to the target base grid noted per cell before registering. Palette already fits midnight-garden — only the subject nouns were de-alcoholized to match ART_SPEC.md. Final PNGs must be transparent-background (alpha 0/255) — which is what a clean magenta-knockout cut produces.

Stable id -> Wild Wardens display (do NOT rename ids): steady=Operator(gold seed-keeper) brewer=Bulwark(bark/moss tank) vintner=Hexwright(nightshade caster,purple) shaker=Duelist(reed twin-blade,silver) orchardist=Medic(orchard-tender,sage) drifter=Ghost(pollen drifter,slate) gambler=Forager(clover seed-pouch,rose). Venue prefixes: meadow cottage park rose orchard greenhouse grove. Enemies = wild plant spirits the warden soothes (mischievous, never menacing); bosses = venue guardian.

## Sheet 1 — Warden battle idles + roster portraits
- File: wardens_idle_portraits.png
- Grid: 7 cols x 2 rows (14 cells)
- Cell size: 512x512 (row1 downscale to 32px `<id>_idle`; row2 downscale to 48px `<id>_portrait`)
- Master size: 3584x1024
- Knockout: Flat magenta #FF00FF background in every cell for knockout. No magenta inside the artwork.
1. steady_idle — golden seed-keeper warden, calm stance, brass focusing-lens charm, cream tunic, gold rim-light.
2. brewer_idle — broad bark-and-moss hedge-guardian, felt-moss shoulders, woven-cord shield, planted stance.
3. vintner_idle — slim nightshade caster in deep-purple thistle cloak, floating glitter spore-motes.
4. shaker_idle — nimble reed-duelist, twin leaf-blades crossed, silver-dew beads, cream/silver felt.
5. orchardist_idle — gentle orchard-tender, sage-leaf apron, watering-can satchel, soft heal glow.
6. drifter_idle — translucent pollen-drifter in seed-fluff cloak, slate-blue felt, glitter wisps.
7. gambler_idle — lucky-clover forager, rose-berry accents, bead-strung foraging pouch, jaunty pose.
8. steady_portrait — Operator face, gold lens over one eye, calm cream expression.
9. brewer_portrait — Bulwark face, mossy brows, stoic, bark-textured jaw.
10. vintner_portrait — Hexwright face, hooded purple, one glowing spore-mote eye.
11. shaker_portrait — Duelist face, sly grin, single silver-dew earring.
12. orchardist_portrait — Medic face, warm, sage leaf behind the ear.
13. drifter_portrait — Ghost face, half-faded into pollen fluff, slate-blue.
14. gambler_portrait — Forager face, wink, clover sprig in the teeth.

## Sheet 2 — Warden overworld walk cycles
- File: wardens_walk.png
- Grid: 8 cols x 7 rows (56 cells)
- Cell size: 512x512 (downscale every cell to 16px)
- Master size: 4096x3584
- Knockout: Flat magenta #FF00FF background in every cell for knockout. No magenta inside the artwork.
Each row = one class (steady, brewer, vintner, shaker, orchardist, drifter, gambler). Columns = down_f0,down_f1,up_f0,up_f1,left_f0,left_f1,right_f0,right_f1. Tiny top-down chibi paper-doll of the class; frame1 = mid-step (one felt foot forward, body dipped). Keep silhouette+accent unmistakable at 16px.
15-22. steady_walk_{down,up,left,right}_f{0,1} — gold seed-keeper chibi.
23-30. brewer_walk_{down,up,left,right}_f{0,1} — bark/moss tank chibi.
31-38. vintner_walk_{down,up,left,right}_f{0,1} — purple thistle-cloak chibi.
39-46. shaker_walk_{down,up,left,right}_f{0,1} — silver reed-duelist chibi.
47-54. orchardist_walk_{down,up,left,right}_f{0,1} — sage orchard-tender chibi.
55-62. drifter_walk_{down,up,left,right}_f{0,1} — slate pollen-drifter chibi.
63-70. gambler_walk_{down,up,left,right}_f{0,1} — rose clover-forager chibi.

## Sheet 3 — Venue plant-spirit enemies (critter / elder / boss)
- File: venue_spirits.png
- Grid: 3 cols x 7 rows (21 cells)
- Cell size: 512x512 (col1 & col2 downscale to 32px; col3 boss downscale to 48px)
- Master size: 1536x3584
- Knockout: Flat magenta #FF00FF background in every cell for knockout. No magenta inside the artwork.
Each row = one venue. Col1 critter, Col2 elder, Col3 boss guardian (biggest read, cozy-menacing).
71. meadow_critter_idle — tiny bramble-tangle sprite, wary leafy face.
72. meadow_elder_idle — bristly thistle-tangle spirit, felt-purple crown.
73. meadow_boss_idle — Guardian Oak, mossy trunk, canopy crown, kind old eyes.
74. cottage_critter_idle — plump pea-pod imp, three peeking seeds.
75. cottage_elder_idle — watering-can golem, cord-handle arms, terracotta body.
76. cottage_boss_idle — Rambling Rose warden, arching cane arms, rose-felt bloom head.
77. park_critter_idle — round acorn scamp, felt cap, stubby legs.
78. park_elder_idle — privet hedge-hog, clipped-hedge body, leafy spines.
79. park_boss_idle — Great Elm guardian, tall trunk, sprawling paper-leaf canopy.
80. rose_critter_idle — velvet petal-moth, rose felt wings, glitter antennae.
81. rose_elder_idle — thorn-cane spirit, coiled bramble arms, single bud eye.
82. rose_boss_idle — Rose Queen, layered rose-felt gown, gold-thorn crown, regal calm.
83. orchard_critter_idle — windfall-apple sprite, bite-notch, twig legs.
84. orchard_elder_idle — gnarled-bough spirit, bark limbs, moss beard.
85. orchard_boss_idle — Cider Elder, ancient apple tree, fruit-laden boughs.
86. greenhouse_critter_idle — curled fern-frond sprite, dewbead eyes.
87. greenhouse_elder_idle — terracotta pot golem, ivy-cord arms, glass glint.
88. greenhouse_boss_idle — Glasshouse Guardian, giant coiled vine, sequin-glass panels.
89. grove_critter_idle — glowing firefly-mote sprite, glitter trail.
90. grove_elder_idle — mushroom-ring sprite, felt toadstool cap, soft blue glow.
91. grove_boss_idle — Moon Guardian, luminous night-tree, silver-cream moon-bloom crown.

## Sheet 4 — Overworld map tiles
- File: overworld_tiles.png
- Grid: 6 cols x 2 rows (11 cells + 1 blank magenta cell)
- Cell size: 512x512 (92-95 downscale to 16px; venue faces 96-102 downscale to 32px)
- Master size: 3072x1024
- Knockout: Flat magenta #FF00FF background in every cell for knockout. No magenta inside the artwork. (Tiles are seamless-fill cutouts — keep edges flush.)
92. tile_grass — sage wool-felt grass, stitched blade texture, tileable.
93. tile_path — warm cream paper stepping-path, soft grain, tileable.
94. tile_verge — mossy edge/verge strip, felt tuft border, tileable.
95. tile_hedge — clipped dark-green hedge wall, cord-woven top, tileable.
96. tile_meadow_face — Wild Meadow face, wildflower-dotted felt cottage front, warm door.
97. tile_cottage_face — Cottage Garden face, scrapbook-brick cottage, window-box blooms.
98. tile_park_face — Community Park face, timber pavilion, leafy trellis.
99. tile_rose_face — Rose Garden face, trellised rose-arch entry, rose-felt blooms.
100. tile_orchard_face — Old Orchard face, weathered barn front, apple basket at door.
101. tile_greenhouse_face — Greenhouse face, glass-panel felt conservatory, ivy trim.
102. tile_grove_face — Moonlit Grove face, dark timber lodge under silver moon-bloom canopy.

## Sheet 5 — Dungeon interior tiles (per venue)
- File: dungeon_tiles.png
- Grid: 3 cols x 7 rows (21 cells)
- Cell size: 512x512 (downscale every cell to 16px)
- Master size: 1536x3584
- Knockout: Flat magenta #FF00FF background in every cell for knockout. No magenta inside the artwork. (Floor/wall tileable fills — keep edges flush.)
Each row = one venue. Col1 floor, Col2 wall, Col3 boss dais (gold platform).
103. tile_meadow_floor — trodden-grass felt floor, tileable.
104. tile_meadow_wall — bramble-hedge wall, tileable.
105. tile_meadow_dais — gold-ringed mossy stone dais.
106. tile_cottage_floor — cream flagstone paper floor, tileable.
107. tile_cottage_wall — brick-and-ivy felt wall, tileable.
108. tile_cottage_dais — gold-ringed cottage-hearth dais.
109. tile_park_floor — grassy-path felt floor, tileable.
110. tile_park_wall — timber-fence wall, tileable.
111. tile_park_dais — gold-ringed pavilion dais.
112. tile_rose_floor — rose-petal-strewn felt floor, tileable.
113. tile_rose_wall — trellised-thorn wall, tileable.
114. tile_rose_dais — gold-ringed rose-arch dais.
115. tile_orchard_floor — fallen-leaf orchard floor, tileable.
116. tile_orchard_wall — bark-plank wall, tileable.
117. tile_orchard_dais — gold-ringed cider-barrel dais.
118. tile_greenhouse_floor — terracotta-tile felt floor, tileable.
119. tile_greenhouse_wall — glass-panel-and-ivy wall, tileable.
120. tile_greenhouse_dais — gold-ringed potting-bench dais.
121. tile_grove_floor — moonlit-moss floor with faint glitter, tileable.
122. tile_grove_wall — dark-timber-and-mushroom wall, tileable.
123. tile_grove_dais — gold-ringed moon-bloom dais, soft silver glow.

## WIRE NOTES
- Asset folder: drop cut PNGs into apps/mobile/assets/sprites/ (file name = sprite key, e.g. steady_idle.png). Register one line each in apps/mobile/src/design/spriteAssets.ts (SPRITE_ASSETS — currently empty). Renderers PixelGrid.tsx / ImageSprite.tsx already prefer a registered image over the procedural grid, keyed by spriteKey.
- ENGINEERING GAP before ANY art shows: no screen passes spriteKey today. app/battle.tsx:500 renders <PixelGrid sprite={sprite}/> with no spriteKey; SPRITES (src/design/sprites.ts) has only 3 placeholders and enemySpriteIds maps everything to them. To use these assets: (1) add spriteKey= to the PixelGrid calls in battle.tsx / preview.tsx, (2) swap PlayerSprite (app/map.tsx:145, stacked Views) for <ImageSprite spriteKey="<id>_walk_<dir>_f<n>">, (3) expand the venue->enemy sprite-key map (<prefix>_critter/_elder/_boss_idle). Keys here match docs/ART_SPEC.md sections 3-6 exactly.
- Format: PNG 32-bit RGBA, transparent background, hard alpha (0/255). Author at 512 for silhouette clarity, downscale to base grid per cell before registering. Every cut asset compresses well under 150KB.
- Out of scope here (covered by the repo's own docs/ART_ASSET_LIST.md): item icons (26), skill-tree nodes (~112), consumables, marks/keys, status chips, FX particles, title wordmark/backdrops, audio. The four visible-core sheets come first.
