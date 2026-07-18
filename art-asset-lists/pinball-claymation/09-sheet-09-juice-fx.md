# Sheet 09 — Juice FX — Clay Splats + MEGA MASH Ring

Particle, flash, and wizard-ring sprites for the Blobworks pinball juice layer — every burst, catch, and MEGA MASH eruption rendered as flung modelling clay, keyed by color to the engine's `burst()` call.

```
STYLE — "Midnight Monster Lab" claymation (Blobworks pinball). Top-down 90 degree orthographic pinball art, hand-sculpted MODELLING CLAY / plasticine, stop-motion look (Aardman / Gumby / Morph). Every object is a little clay model: visible thumbprint dents, tool-scrape seams, soft rounded edges that wobble slightly (never perfectly geometric), matte plasticine sheen with ONE soft desk-lamp highlight, tiny pressed-in dust/lint flecks, a gentle contact shadow underneath. Goofy-friendly monsters — googly eyes, buck teeth, one stubby horn, big grins; cute NOT scary, no gore, no menace. Palette: dark clay lab-bench base #22202a, slate shadow #16151d; slime green #86d24a + deep monster teal #37b3a0; goop purple #9b6fd4; eyeball cream #f1ede2 with iris #4fa3d1 + black pupil; hazard yellow #f4c93a; danger red #e5533d; brass machine #c8a84b + warm lamp cream #efe6d2; gum-pink tongue #e88ba0. Lighting: one warm desk-lamp from top-center, cool moonlight fill, dark drop-off toward the middle of the table so the moving eyeball ball + bumpers pop. Rendering: photographed-clay feel — soft studio light, subtle grain, NO vector-flat, NO neon glow-blowout, NO photoreal humans, NO text / watermark / UI baked into sprites (letters are drawn by the engine). Everything reads at small size on a 540x960 phone table. Consistent top-down view for all playfield pieces (no perspective tilt). Deliver each sprite knocked out on a flat magenta #FF00FF background.
```

## Sheet layout

Generate the whole sheet at **2048×2048 px** on a flat, even magenta **#FF00FF** knockout background. Slice it as a fixed-pitch **8×8 grid of 256×256 px cells** (256px pitch, no gutter, sprite centered in its cell with ~20% padding so a dumb fixed-pitch cutter can walk the grid). Keep all margins equal and every cell framed identically.

- **Top half (rows 1–4, y 0–1024):** the small particle sprites, one per cell. Each of the six colored families is a left-to-right triplet of three scales (small / medium / large). The special one-shot puffs sit in row 4.
- **Bottom half (rows 5–8, y 1024–2048):** two large FX, each occupying a **4×4 block = 1024×1024 px**. Left block (cols 1–4) = `mega_flash` soft radial wash. Right block (cols 5–8) = `mega_mash_ring` expanding clay ring.

On-table render sizes (this is what the engine scales them to on the 540×960 phone playfield):
- Particle families: **~8 px (s) / ~16 px (m) / ~26 px (l)** per mote.
- `combo_puff` ~40 px, `spark_save` ~64 px, `bubble_pop` ~24 px per frame.
- `mega_flash` fills the whole 540×960 table (drawn stretched/tinted).
- `mega_mash_ring` grows from ~40 px to ~520 px diameter over the animation.

### Cell map
```
Row1: goo_mote_green_s | goo_mote_green_m | goo_mote_green_l | spark_gold_s  | spark_gold_m  | spark_gold_l  | (blank) | (blank)
Row2: mud_puff_s       | mud_puff_m       | mud_puff_l       | slime_pink_s  | slime_pink_m  | slime_pink_l  | (blank) | (blank)
Row3: goop_purple_s    | goop_purple_m    | goop_purple_l    | sparkle_gold_s| sparkle_gold_m| sparkle_gold_l| (blank) | (blank)
Row4: combo_puff       | spark_save (2 cells wide, c2–c3)    | bubble_pop_1  | bubble_pop_2  | bubble_pop_3  | (blank) | (blank)
Row5–8, cols 1–4: mega_flash (1024×1024 radial)
Row5–8, cols 5–8: mega_mash_ring (1024×1024 ring)
```

## Assets

- **`goo_mote_green`** (`_s` / `_m` / `_l`) — A blob of flung slime-green plasticine (#86d24a) with a teal (#37b3a0) shadow side, rolled into a slightly squished teardrop mid-splatter with two or three tiny satellite droplets breaking off. Visible thumbprint dent, one soft desk-lamp highlight on the fat end. Three scales in a row. Keyed to nudge/sling green bursts.
- **`spark_gold`** (`_s` / `_m` / `_l`) — A short chunky spark-chip of warm gold clay (#e8c65a) tipped with brass (#c8a84b), shaped like a stubby four-pointed clay star / seed-crumb with rounded soft points. One bright lamp glint at the center, tool-scrape seam down one arm. Three scales. Keyed to bumper (bump) hits.
- **`mud_puff`** (`_s` / `_m` / `_l`) — A dull brown clay crumb-puff (#5a4632) — a lumpy little cloud of pressed dirt-plasticine with pressed-in dust and lint flecks, edges soft and grubby, no highlight beyond a weak matte sheen. Reads as a sad drain-sink poof. Three scales. Keyed to drain.
- **`slime_pink`** (`_s` / `_m` / `_l`) — A bright gum-pink goo droplet (#e58fa0) glossed just barely with one lamp highlight, rounder and juicier than the green mote, one clinging drip-tail. Three scales. Keyed to standup (SLIME letter block) hits.
- **`goop_purple`** (`_s` / `_m` / `_l`) — A rich goop-purple clay blob (#b57de0 into #9b6fd4 shadow), fatter and bubblier than the green mote, one air-pocket dimple pressed into it, single soft highlight. Three scales. Keyed to sling (bubbling BLOB) bursts.
- **`sparkle_gold`** (`_s` / `_m` / `_l`) — A dainty pale-gold clay sparkle (#f2d98a), a rounded diamond/twinkle bead with a bright pinpoint lamp glint and a faint brass rim, cleaner and shinier than spark_gold. Three scales. Keyed to lock (specimen JAR) events.
- **`combo_puff`** — A little clay "POW" puff: a rounded cartoon impact cloud sculpted from warm lamp cream (#efe6d2) with slime-green (#86d24a) and gold (#f4c93a) chunks flung outward around it, three or four stubby rounded spike-lobes, one soft highlight on top. A cheerful hand-modeled combo pop. Renders ~40 px.
- **`spark_save`** — A bright goo catch-burst for the stretchy GOO safety-web: a wide splash-fan of slime-green (#86d24a) and teal (#37b3a0) clay strings springing upward with cream (#f1ede2) glint droplets at the tips, like goo bouncing a saved ball back up. Cheerful, energetic, matte-satin sheen. Fills its ~2-cell slot, renders ~64 px.
- **`bubble_pop`** (`_1` / `_2` / `_3`) — A 3-frame stop-motion strip of a single teal-green clay bubble (#37b3a0 / #86d24a) bursting: frame 1 a whole taut rounded bubble with one highlight, frame 2 the skin splitting with a jagged clay rim, frame 3 a scatter of tiny droplet crumbs and a flat popped ring. Same bubble, same size and color across all three, only the pop stage changes. Each frame ~24 px.
- **`mega_flash`** — A full-frame warm tint wash for the wizard flash, delivered as a **soft radial**: a big round glow of warm lamp cream (#efe6d2) fading to hazard gold (#f4c93a) at the mid-ring and dissolving to nothing at the edges, faint clay-grain texture baked in, NO hard rim, NO neon bloom — a gentle photographed-clay light bloom the engine multiplies over the whole table. Centered in its 1024×1024 block, edges fully transparent-ready (fade to knockout).
- **`mega_mash_ring`** — The MEGA MASH / bloom-erupt showpiece: a big **expanding RING** of flung clay bits — a broken circular wreath of slime-green (#86d24a), goop-purple (#9b6fd4), gold (#f4c93a) and gum-pink (#e88ba0) plasticine crumbs, droplets, and a few tiny googly eyeball-bits all blown radially outward from an empty center, motion reading outward, gaps between clumps, each clump its own tiny thumbprinted clay model. Bright, celebratory, cohesive with the other motes. Fills its 1024×1024 block with the ring's outer edge near the block border and the center hollow.

## Copy-paste prompt

```
STYLE — "Midnight Monster Lab" claymation (Blobworks pinball). Top-down 90 degree orthographic pinball art, hand-sculpted MODELLING CLAY / plasticine, stop-motion look (Aardman / Gumby / Morph). Every object is a little clay model: visible thumbprint dents, tool-scrape seams, soft rounded edges that wobble slightly, matte plasticine sheen with ONE soft desk-lamp highlight, tiny pressed-in dust/lint flecks. Cute NOT scary. NO vector-flat, NO neon glow-blowout, NO text or UI baked in.

handmade plasticine claymation, hand-sculpted modelling clay, stop-motion, macro studio photograph of real clay figurines on a lightbox, soft diffuse softbox lighting, 100mm macro lens, matte-to-satin waxy Plasticine sheen (NOT glossy), visible fingerprint smudges and sculpting-tool scrape marks, tiny lint and dust specks, Aardman / Gumby / Morph clay look.

Build ONE 2048x2048 sprite sheet, a strict evenly-spaced 8x8 grid of 256x256 cells, equal margins and gutters, one unified clay style, strict top-down bird's-eye orthographic view, zero perspective, camera straight down. Each item is a small burst of flung modelling clay isolated in its cell.

Row 1: three flung SLIME-GREEN clay droplets (#86d24a with teal #37b3a0 shadow) mid-splatter with satellite drops, at small / medium / large scale in the first three cells; then three chunky WARM-GOLD clay spark-chips (#e8c65a tipped brass #c8a84b), stubby rounded four-point star crumbs, small / medium / large.
Row 2: three dull BROWN mud crumb-puffs (#5a4632), grubby dusty lumpy little clouds, small / medium / large; then three bright GUM-PINK goo droplets (#e58fa0) with a clinging drip-tail, small / medium / large.
Row 3: three rich GOOP-PURPLE clay blobs (#b57de0 into #9b6fd4) with an air-pocket dimple, small / medium / large; then three dainty PALE-GOLD clay sparkles (#f2d98a) with a bright pinpoint glint and brass rim, small / medium / large.
Row 4: cell 1 a cheerful clay "POW" impact puff (cream #efe6d2 with green #86d24a and gold #f4c93a chunks flung out); cells 2-3 a wide upward GOO catch-splash of green (#86d24a) and teal (#37b3a0) clay strings with cream glint droplet tips; cells 4-5-6 a 3-frame stop-motion strip of ONE teal-green clay bubble bursting (whole taut bubble, then splitting skin, then scattered crumbs and a flat popped ring) — same bubble, same size and color in all three frames, only the pop stage changes.
Bottom-left 4x4 block (1024x1024): a soft RADIAL warm-light bloom, warm lamp cream #efe6d2 fading through hazard gold #f4c93a and dissolving to nothing at the edges, faint clay grain, NO hard rim, NO neon.
Bottom-right 4x4 block (1024x1024): a big EXPANDING RING of flung clay bits — a broken circular wreath of green #86d24a, purple #9b6fd4, gold #f4c93a and pink #e88ba0 clay crumbs, droplets and a few tiny googly eyeball-bits blown radially outward from a hollow center, each clump its own thumbprinted clay model, ring outer edge near the block border.

Limited consistent palette, same colors across all pieces, no new hues. All items same clay style, same lighting, same finish, cohesive set. Isolated on a solid flat chroma-key magenta #FF00FF background, pure even #FF00FF fill twice over, no gradient, no texture, no shadow on the background, every subject fully inside its cell not touching edges, no magenta spill or reflection on the clay, small tight contact shadow only.

Negative prompt: photoreal human, realistic skin, glossy plastic, shiny CGI render, 3D render, neon glow, bloom, lens flare, text, watermark, signature, logo, drop shadow, blurry soft cast shadow, gradient background, vector, flat illustration, cel-shaded, hard outline.
```

## Wire

`burst(x,y,n,col)` (def ~613) picks a mote sprite by `col`: green→`goo_mote_green`, gold-bump→`spark_gold`, drain-brown→`mud_puff`, standup-pink→`slime_pink`, sling-purple→`goop_purple`, lock-gold→`sparkle_gold` (choose `_s/_m/_l` by particle size). `combo_puff` on combo pops, `bubble_pop` on standup/beaker clears. `G.flash` draws `mega_flash` and `triggerBloom()` / the wizard ring (~650) draws `mega_mash_ring`. Net catch draws `spark_save`.
