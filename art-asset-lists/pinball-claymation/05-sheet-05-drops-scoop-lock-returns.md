# Sheet 05 — Beaker Drops + Monster-Mouth Scoop + Specimen-Jar Lock + Returns + Goo Net

Purpose: all the "target + capture + save" clay hardware for the lower and mid playfield — the SLIME beaker drop bank, the gulping monster-mouth scoop, the specimen-jar eyeball lock, the two return-gate elbows, the goo safety-web, and the sink-grate drain — each knocked out clean for the fixed-pitch cutter.

```
STYLE — "Midnight Monster Lab" claymation (Blobworks pinball). Top-down 90 degree orthographic pinball art, hand-sculpted MODELLING CLAY / plasticine, stop-motion look (Aardman / Gumby / Morph). Every object is a little clay model: visible thumbprint dents, tool-scrape seams, soft rounded edges that wobble slightly (never perfectly geometric), matte plasticine sheen with ONE soft desk-lamp highlight, tiny pressed-in dust/lint flecks, a gentle contact shadow underneath. Goofy-friendly monsters — googly eyes, buck teeth, one stubby horn, big grins; cute NOT scary, no gore, no menace. Palette: dark clay lab-bench base #22202a, slate shadow #16151d; slime green #86d24a + deep monster teal #37b3a0; goop purple #9b6fd4; eyeball cream #f1ede2 with iris #4fa3d1 + black pupil; hazard yellow #f4c93a; danger red #e5533d; brass machine #c8a84b + warm lamp cream #efe6d2; gum-pink tongue #e88ba0. Lighting: one warm desk-lamp from top-center, cool moonlight fill, dark drop-off toward the middle of the table so the moving eyeball ball + bumpers pop. Rendering: photographed-clay feel — soft studio light, subtle grain, NO vector-flat, NO neon glow-blowout, NO photoreal humans, NO text / watermark / UI baked into sprites (letters are drawn by the engine). Everything reads at small size on a 540x960 phone table. Consistent top-down view for all playfield pieces (no perspective tilt). Deliver each sprite knocked out on a flat magenta #FF00FF background.
```

## Sheet layout
Generate the whole sheet at **2048x2048**, a strict **6 columns × 4 rows** grid (24 cells of ~341px each; equal margins and equal gutters so a fixed-pitch cutter can slice on a clean 341px pitch). Sculpt each model large inside its cell (~280px) and let the engine downsample — the on-table sizes below are what each sprite renders at on the 540x960 phone table. Every cell sits on a **flat, even magenta #FF00FF knockout** with a small tight contact shadow only (no cast shadow onto the background, no magenta spill on the clay). Keep every model fully inside its cell, nothing touching an edge. Row-by-row plan (labels are for you, do NOT bake text into the sheet):

- **Row 1 — BEAKER DROP BANK (6 cells):** cols 1-3 = the three beakers standing "up"; cols 4-6 = the same three beakers folded "down". Render at ~20px on table.
- **Row 2 — MONSTER-MOUTH SCOOP + DRAIN (4 cells used):** col 1 scoop_idle, col 2 scoop_lit, col 3 scoop_open (~30px, sits at 330,600); col 5 drain_grate (~40px, very bottom center). Cols 4 & 6 empty magenta.
- **Row 3 — SPECIMEN-JAR LOCK (4 cells used):** cols 1-4 = lock_jar_0, lock_jar_1, lock_jar_2, lock_jar_3 (~34px, sits at 340,152). Cols 5-6 empty magenta.
- **Row 4 — RETURN GATES + GOO NET (4 cells used):** col 1 return_gate_idle, col 2 return_gate_lit (~28px, two placements 160,788 & 370,788 reuse this one sprite mirrored in engine); col 4 net_armed, col 5 net_flash (spans the drain mouth). Cols 3 & 6 empty magenta.

## Assets

**Row 1 — Beaker drop bank (three targets, up + folded down)**

- `drop_beaker_up_green` — A stubby hand-rolled clay conical beaker standing proud, filled with fizzing **slime green #86d24a** potion, a couple of clay bubble-beads rising off the top, a thin **brass #c8a84b** rim collar. Thumbprint dents down the glass, one soft desk-lamp highlight on the upper-left curve. ~20px on table.
- `drop_beaker_up_teal` — Same clay beaker mold, potion sculpted in **deep monster teal #37b3a0**, one bubble mid-rise, brass rim, single lamp glint. Reads as the middle target of the bank.
- `drop_beaker_up_purple` — Same beaker, **goop purple #9b6fd4** potion with a fat wobbling bubble at the lip, brass rim, one highlight. The third standing target.
- `drop_beaker_down_green` — The green beaker knocked flat: collapsed and squashed to a low flattened puddle-lump, the slime green #86d24a potion spread into a spill blob, brass rim tipped sideways, sad little squash. Clearly the "down" state of `drop_beaker_up_green`. ~20px, low and wide.
- `drop_beaker_down_teal` — Teal beaker folded flat the same way, teal #37b3a0 spilled into a shallow blob, rim on its side, thumbprint smear across the spill.
- `drop_beaker_down_purple` — Purple beaker collapsed flat, goop purple #9b6fd4 puddle-lump, tipped brass rim, one dull lamp sheen.

**Row 2 — Monster-mouth scoop + drain**

- `scoop_idle` — A big goofy clay **monster mouth** seen top-down, lips shut in a lumpy closed pout of **deep monster teal #37b3a0**, a couple of blunt buck-tooth nubs peeking, gum-pink #e88ba0 lip line. Matte, calm, one soft lamp highlight. ~30px, sits at 330,600.
- `scoop_lit` — Same mouth, now hungry: lips parted into a grin ringed by a warm **brass #c8a84b / hazard yellow #f4c93a** gold rim, tongue #e88ba0 just visible, eager look. The "lit / ready to gulp" state (G.scoopLit).
- `scoop_open` — Mid-gulp: mouth stretched wide open into a round dark teal cavern, gum-pink #e88ba0 tongue curled up, buck teeth flung to the edges, a little squash-and-stretch wobble on the lips. The active swallow frame.
- `drain_grate` — A clay **sink-grate mouth** at the very bottom center: an oval slate #16151d recess with three or four fat rounded clay grate-bars across it (base #22202a), thumbprint-dented, a faint brass #c8a84b lip. Reads as the drain the ball falls into. ~40px wide.

**Row 3 — Specimen-jar lock nest (0..3 eyeballs)**

- `lock_jar_0` — A little clay **bell-jar / cage** on a brass #c8a84b base, dome sculpted in translucent teal-tinted clay, EMPTY inside. Thumbprint smudges on the dome, one lamp highlight, soft contact shadow. ~34px, sits at 340,152.
- `lock_jar_1` — Same jar holding **one** clay eyeball marble (cream #f1ede2, iris #4fa3d1, black pupil, looking up cute), a faint **hazard-yellow #f4c93a / gold pulse ring** at the jar base to show it's lit.
- `lock_jar_2` — Same jar with **two** clay eyeballs nestled together, both blinking-cute, gold pulse ring a touch brighter at the base.
- `lock_jar_3` — Jar **full: three** clay eyeballs stacked, wobbly and grinning, the brightest gold pulse ring around the base — the "locked and loaded for GOO MULTIBALL" state.

**Row 4 — Return gates + goo net**

- `return_gate_idle` — A clay **pipe-elbow** the ball feeds through, top-down: a bent brass #c8a84b tube with a dark teal #37b3a0 throat, rounded hand-rolled seams, dust flecks, one lamp glint, no glow. ~28px; used at both 160,788 and 370,788 (engine mirrors it).
- `return_gate_lit` — Same pipe-elbow lit on trigger: the throat glowing warm **hazard yellow #f4c93a** with a soft brass rim flush, a gentle inner light (no neon blowout). The `sh.cd` glow state.
- `net_armed` — A stretchy **goo safety-web** strung across the drain mouth: rubbery **slime green #86d24a** clay strands sagging into a springy web, tacky glossy-goo beads at the crossings, thumbprint pulls where it stretches. Spans the drain width. The armed save.
- `net_flash` — The same goo web at the instant of a catch: strands snapped taut and bulging, a bright warm **lamp-cream #efe6d2 / hazard-yellow #f4c93a** catch-flash pulse blooming through the goo, beads flung. The `G.netFlash` frame.

## Copy-paste prompt

> handmade plasticine claymation model, hand-sculpted modelling clay, stop-motion character, macro studio photograph of real clay figurines, Aardman / Gumby / Morph plasticine look, shot on a lightbox with soft diffuse softbox lighting, 100mm macro lens, shallow depth of field, matte-to-satin Plasticine sheen, soft waxy finish NOT glossy, visible fingerprint smudges and thumbprint dents, sculpting-tool scrape marks, faint seam lines, tiny lint and dust specks, soft rounded hand-rolled edges, one warm desk-lamp highlight from top-center with cool moonlight fill.
> A sprite sheet, strict top-down bird's-eye orthographic view (camera pointing straight down, zero perspective, no foreshortening), evenly spaced 6-column by 4-row grid, equal margins and gutters, consistent scale and framing per cell, all pieces the SAME clay style. Palette locked across every cell: dark clay base #22202a, slate shadow #16151d, slime green #86d24a, deep monster teal #37b3a0, goop purple #9b6fd4, eyeball cream #f1ede2 with iris #4fa3d1 and black pupil, hazard yellow #f4c93a, danger red #e5533d, brass #c8a84b, warm lamp cream #efe6d2, gum-pink tongue #e88ba0 — limited consistent palette, no new hues.
> Row 1: three stubby clay conical beakers of bubbling potion standing upright (cell 1 slime-green potion, cell 2 teal potion, cell 3 purple potion, each with a brass rim and rising bubble-beads), then the SAME three beakers knocked flat into squashed spilled puddle-lumps (cell 4 green spill, cell 5 teal spill, cell 6 purple spill). Row 2: a big goofy clay monster-mouth scoop in three states — cell 1 lips shut in a lumpy teal pout, cell 2 mouth grinning open ringed with a gold brass rim, cell 3 mouth stretched wide mid-gulp with a curled gum-pink tongue; cell 4 empty magenta; cell 5 a clay sink-grate drain mouth (dark oval recess with fat rounded grate-bars and a brass lip); cell 6 empty magenta. Row 3: a little clay bell-jar specimen cage on a brass base in four fill states — cell 1 empty, cell 2 holding one cute clay eyeball marble with a faint gold pulse ring, cell 3 holding two eyeballs, cell 4 full with three grinning eyeballs and a bright gold pulse ring; cells 5-6 empty magenta. Row 4: cell 1 a clay brass pipe-elbow return gate with a dark teal throat (idle, no glow), cell 2 the same pipe-elbow with its throat glowing warm hazard-yellow (lit); cell 3 empty magenta; cell 4 a stretchy slime-green goo safety-web sagging with tacky goo beads (armed), cell 5 the same goo-web snapped taut with a bright cream-yellow catch-flash pulsing through it; cell 6 empty magenta.
> Chunky rounded proportions, big friendly oversized googly eyes on the eyeballs and mouth, gentle smiles, wholesome childlike toy, cheerful, cute NOT scary. Each item isolated on a solid flat chroma-key magenta #FF00FF background, pure even #FF00FF fill, flat and even, no gradient, no texture, no cast shadow on the background, small tight contact shadow only, subject fully inside each cell, nothing touching edges, no magenta spill or reflection on the clay, clean cutout. All items same clay style, same lighting, same palette, same finish, cohesive set.
> Negative prompt: photoreal human, realistic skin, glossy plastic, shiny CGI render, 3D render, neon glow, bloom, lens flare, text, watermark, signature, logo, drop shadow, blurry soft shadow, gradient background, vector, flat illustration, cel-shaded, outline.

## Wire
Feeds `drawShots()` — drop type x3 (`drop_beaker_up_*` / `drop_beaker_down_*` on knock-flat), scoop type at 330,600 (`scoop_idle` / `scoop_lit` on `G.scoopLit` / `scoop_open` mid-gulp), return type x2 at 160,788 & 370,788 (`return_gate_idle` / `return_gate_lit` on `sh.cd` glow); the Pollen-lock nest `LOCK_NEST` at 340,152 with 3 slots (`lock_jar_0..3`); `drawNet()` for DRAINY-6 (`net_armed` on `G.netTime`, `net_flash` on `G.netFlash`); and the compost `drain_grate` at bottom-center.
