<!-- Silt · Sheet 4: Grove keepsakes — pressed-bloom species set + celebration -->
<!-- Copy everything below into your image generator to make this ONE sheet. -->

STYLE — "Terrarium Nocturne" (Silt / Lucid Winds midnight-garden). Pressed keepsake flowers painted in flat matte-gouache with gentle grain, single sage #7ab356 stem curving up from the base over deep #3f6b34 shadow, petals in bold papercut-simple layered shapes, a cream #e8dcc8 center disc, thin gold #c8a84b rim-light on petal edges, faint pressing-tissue halo. Deep-night sensibility, NO photoreal botany, NO gloss, NO harsh black keylines; every flower must read at 84px. NO text, letters, numbers, logos, watermarks. Compress under 150KB.

Create one sprite sheet. File: silt_keepsakes.png. Grid: 4 columns x 3 rows (12 cells, left-to-right, top-to-bottom). Cell: 512x512. Master: 2048x1536.

KNOCKOUT: Flat magenta #FF00FF fills every cell's background. NO magenta / hot-pink inside the art — rose petals use #e58fa0 and must stay clearly distinct from #FF00FF. Each flower centered and upright with margin, stem reaching toward the bottom of the cell, NO ground shadow. The ten species must be distinguishable by PETAL SILHOUETTE (count/shape), not color alone.

1. bloom_rose_round — rose family #e58fa0: five broad round overlapping petals, cream disc, one dew droplet resting on a petal.
2. bloom_rose_star — rose family #e58fa0 variant: seven slim pointed petals in a star, gold picot edges.
3. bloom_gold_cup — gold family #c8a84b: six cupped tulip-like petals catching lantern light #ffe9a8.
4. bloom_gold_spray — gold family #c8a84b variant: a spray of many tiny florets on branching stemlets (baby's-breath silhouette).
5. bloom_dew_bell — dew family #bfe0f2: three hanging bell blossoms on a nodding stem, moon-blue #5b9bd5 shading.
6. bloom_dew_lotus — dew family #bfe0f2 variant: a wide open lotus of eight layered petals floating over a small water ring.
7. bloom_violet_iris — violet family #a468d8: an iris silhouette, three up-standards three down-falls, deep plum veins.
8. bloom_violet_thistle — violet family #a468d8 variant: a round thistle crown over a sage collar, soft spiky silhouette.
9. bloom_amber_sun — amber family #e2b34d: a small sunflower silhouette, dense dark umber #5e4228 center, short dense petals.
10. bloom_amber_trumpet — amber family #e2b34d variant: two trumpet blossoms angled apart, ember #f08c32 throats.
11. garden_wreath — the "living garden counted" celebration mark: a small circular wreath of sage leaves with five tiny blooms (one per hue family: rose/gold/dew/violet/amber) evenly spaced, brass twine tie at the bottom.
12. press_burst — the keepsake-minted flash: a soft radial burst of cream #e8dcc8 light with pressed-petal silhouettes and gold sparkles flying outward; semi-transparent edges, contained glow.

WIRE NOTES: 1-10 → replace/augment `drawKeepsake()` (the procedural 84px flower, line ~421): keepsakes store `{s:seed, d:date}` — derive family from the live 5-hue table index (`mkRng(ks.s)` picks hue [#e58fa0,#c8a84b,#bfe0f2,#a468d8,#e2b34d]) and pick the species variant from the next rng roll, so every existing keepsake keeps its color family deterministically. Draw onto the existing `.grovecard` canvas (84×84) over the sheet-3 grove_mat. 11 → shown with the "🌸 A living garden" toast (`updatePulse()`, every `gardenCounted`) and beside `PROG.gardens` milestones in future UI. 12 → played by `mintKeepsake()` over the stage when a keepsake is pressed (every 3rd garden). Keep the procedural `drawKeepsake()` as the no-asset fallback.
