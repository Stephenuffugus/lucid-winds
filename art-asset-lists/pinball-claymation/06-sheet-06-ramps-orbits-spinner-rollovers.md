# Sheet 06 — Raised Lanes — Coil Ramps, Pipe Orbits, Gear Spinner, ZAP Arches

Dressing pieces for the engine-stroked raised lanes: entrance throats, a tileable clay pipe overlay, the spinner gear, ZAP rollover arches (on/off), a fork diverter flag, and divider-post caps.

```
STYLE — "Midnight Monster Lab" claymation (Blobworks pinball). Top-down 90 degree orthographic pinball art, hand-sculpted MODELLING CLAY / plasticine, stop-motion look (Aardman / Gumby / Morph). Every object is a little clay model: visible thumbprint dents, tool-scrape seams, soft rounded edges that wobble slightly (never perfectly geometric), matte plasticine sheen with ONE soft desk-lamp highlight, tiny pressed-in dust/lint flecks, a gentle contact shadow underneath. Goofy-friendly monsters — googly eyes, buck teeth, one stubby horn, big grins; cute NOT scary, no gore, no menace. Palette: dark clay lab-bench base #22202a, slate shadow #16151d; slime green #86d24a + deep monster teal #37b3a0; goop purple #9b6fd4; eyeball cream #f1ede2 with iris #4fa3d1 + black pupil; hazard yellow #f4c93a; danger red #e5533d; brass machine #c8a84b + warm lamp cream #efe6d2; gum-pink tongue #e88ba0. Lighting: one warm desk-lamp from top-center, cool moonlight fill, dark drop-off toward the middle of the table so the moving eyeball ball + bumpers pop. Rendering: photographed-clay feel — soft studio light, subtle grain, NO vector-flat, NO neon glow-blowout, NO photoreal humans, NO text / watermark / UI baked into sprites (letters are drawn by the engine). Everything reads at small size on a 540x960 phone table. Consistent top-down view for all playfield pieces (no perspective tilt). Deliver each sprite knocked out on a flat magenta #FF00FF background.
```

## Sheet layout

Generate the whole sheet at **2048x2048**, a **4×4 grid** of 512x512 cells with equal margins and gutters (about 40px gutter between cells so a fixed-pitch cutter can slice on a clean 512 pitch). Every sprite is centered in its own cell, fully inside frame, nothing touching an edge. Background is one **flat, even chroma-key magenta #FF00FF** fill — no gradient, no texture, no cast shadow on the background, only a small tight contact shadow hugging each model. 13 cells are used; leave the last 3 cells (row 4, cols 2–4) as empty magenta.

All pieces are drawn strict top-down / bird's-eye. On-table render sizes the engine expects: the six **throats ~40px**, **spinner_gear ~40px** (r20 at 265,250), each **rollover arch ~30px**, the **tube segments** are laid repeatedly along a path so keep them a clean ~48px tileable block, **diverter_flag** tiny (~18px), **post_nub** small (~16px cap). Keep scale and framing consistent cell-to-cell so the cutter and the wiring agree.

Grid reading order (left→right, top→bottom):
- Row 1: `throat_fern`, `throat_trellis`, `throat_green`, `throat_heart`
- Row 2: `throat_lorbit`, `throat_rorbit`, `tube_straight`, `tube_curve`
- Row 3: `spinner_gear`, `rollover_arch_on`, `rollover_arch_off`, `diverter_flag`
- Row 4: `post_nub`, empty, empty, empty

## Assets

- **`throat_fern`** — Ramp entrance mouth (fern lane). A stubby upright clay tube opening sculpted in slime green #86d24a, oval bore rimmed by a rolled lip you can see thumbprint dents in. A tiny curled fern frond is pressed into the near rim as a marker, matte plasticine, ONE warm desk-lamp glint on the top lip, dark #16151d shadow inside the bore so the ball reads as diving in.
- **`throat_trellis`** — Ramp entrance mouth (trellis lane). Same slime green #86d24a clay tube opening, but the rolled lip carries two crossed clay lattice bars (a little trellis) pressed across the top edge, tool-scrape seam down one side, one soft highlight, deep #16151d hole in the middle.
- **`throat_green`** — Ramp entrance mouth (center green lane). The plainest of the ramp throats: a clean slime green #86d24a rolled-clay tube mouth, faint seam line where the two clay halves join, a single pressed-in dust fleck, one lamp highlight on the lip, dark bore.
- **`throat_heart`** — Ramp entrance mouth (heart lane). Slime green #86d24a clay tube whose rolled lip is pinched into a soft heart-dip at the top, a small gum-pink #e88ba0 tongue-blob peeking from the bore like a goofy mouth, chubby rounded form, one highlight, dark inside.
- **`throat_lorbit`** — Left orbit pipe opening. A round clay PIPE mouth in deep monster teal #37b3a0 with a thin translucent lip, a machined brass #c8a84b ring bead pressed around the rim to read "pipe not tube," thumbprint texture, one desk-lamp glint, black #16151d bore. Mirror-friendly of the right orbit.
- **`throat_rorbit`** — Right orbit pipe opening. Twin of `throat_lorbit`, teal #37b3a0 clay pipe mouth with brass #c8a84b rim bead and translucent lip, seam on the opposite side so the pair reads as a matched set, one highlight, dark bore.
- **`tube_straight`** — Tileable clay pipe overlay, straight segment. A short section of translucent-lipped clay tube in deep teal #37b3a0 fading to a lighter waxy center channel, edges rolled so two segments butt together seamlessly, faint lengthwise scrape seam, one soft top highlight running down the tube, no end caps (meant to repeat along a path).
- **`tube_curve`** — Tileable clay pipe overlay, curved segment. Same teal #37b3a0 translucent-lip tube bent through a gentle quarter arc, both open ends flush to mate with `tube_straight`, thumbprint dents on the outer curve, one highlight sliding around the bend, matte plasticine.
- **`spinner_gear`** — Clay GEAR/fan disc (~40px, r20). A round cog sculpted in brass machine #c8a84b clay with chunky rounded teeth around the rim and a slime green #86d24a hub button in the center, a single pressed hole and a tool-scrape spoke line, one warm lamp glint on the upper teeth, tight contact shadow. Static reference pose — spin frames live on sheet 10.
- **`rollover_arch_on`** — ZAP rollover lane arch, LIT. A little clay lightbulb/lane-gate arch that straddles the lane, sculpted in hazard yellow #f4c93a with a warm lamp-cream #efe6d2 glow bead on the crown so it reads "on," rounded chubby posts, thumbprint texture, ONE bright highlight on top. Center face left blank — the engine draws the Z/A/P letter.
- **`rollover_arch_off`** — ZAP rollover lane arch, UNLIT. Identical arch model to `rollover_arch_on` but dimmed: muted brass #c8a84b clay with a dull slate #16151d bead where the glow was, softer lighting, same shape and size so on/off swap in place. Blank center face for engine text.
- **`diverter_flag`** — Tiny clay warning flag at a fork. A stubby brass #c8a84b clay pole with a small triangular hazard yellow #f4c93a pennant, a single danger-red #e5533d chevron pressed into it pointing toward the live exit, wobbly hand-rolled edges, one highlight, tight shadow. Small (~18px on table).
- **`post_nub`** — Small clay bumper cap for a divider post. A squat rounded clay dome cap in deep monster teal #37b3a0 with a slime green #86d24a top dot, thumbprint dent on the crown, one soft highlight, tight contact shadow — used on both divider posts (92,706 / 438,706).

## Copy-paste prompt

handmade plasticine claymation model, hand-sculpted modelling clay, stop-motion character, macro studio photograph of a real clay figurine, Aardman / Gumby / Morph plasticine look; visible fingerprint smudges, thumbprint dents, sculpting-tool scrape marks, faint seam line where clay halves join, tiny lint and dust specks, soft rounded hand-rolled edges; matte-to-satin Plasticine sheen, soft waxy finish, NOT glossy; shot on a lightbox, soft diffuse softbox lighting from top-center warm desk-lamp with cool moonlight fill, shallow macro depth of field, 100mm macro lens, real physical miniature; strict top-down bird's-eye view, orthographic projection, zero perspective, camera pointing straight down, no foreshortening; limited consistent color palette, same colors across all pieces, no new hues — palette: dark clay bench #22202a, slate shadow #16151d, slime green #86d24a, deep monster teal #37b3a0, goop purple #9b6fd4, eyeball cream #f1ede2, iris blue #4fa3d1, hazard yellow #f4c93a, danger red #e5533d, brass machine #c8a84b, warm lamp cream #efe6d2, gum-pink tongue #e88ba0.

Make a sprite sheet, evenly spaced 4×4 grid, 16 identical cells with equal margins and gutters, consistent scale and framing per cell, each object isolated on a solid flat chroma-key magenta #FF00FF background, pure even #FF00FF fill, no gradient, no texture, no cast shadow on background, only a small tight contact shadow under each model, no magenta spill on the clay, every subject fully inside its cell not touching edges. Cells left-to-right, top-to-bottom:
Cell 1 — a stubby upright clay tube entrance mouth in slime green #86d24a with a rolled thumbprinted lip, a tiny curled fern frond pressed into the rim, dark hollow bore.
Cell 2 — same slime green #86d24a clay tube mouth but two crossed lattice bars (a little trellis) pressed across the top lip, dark bore.
Cell 3 — plain clean slime green #86d24a rolled clay tube mouth, faint seam, one dust fleck, dark bore.
Cell 4 — slime green #86d24a clay tube mouth pinched into a soft heart dip at the top with a small gum-pink #e88ba0 tongue blob peeking out, dark bore.
Cell 5 — a round clay pipe opening in deep teal #37b3a0 with a thin translucent lip and a brass #c8a84b ring bead around the rim, black bore (left orbit).
Cell 6 — twin round teal #37b3a0 clay pipe opening with brass #c8a84b rim bead, seam on the opposite side (right orbit).
Cell 7 — a short straight section of translucent teal #37b3a0 clay pipe with a lighter waxy center channel, rolled ends that butt seamlessly, no end caps (tileable straight tube).
Cell 8 — the same teal #37b3a0 translucent clay pipe bent through a gentle quarter arc, both ends open and flush (tileable curved tube).
Cell 9 — a small round clay cog/gear disc in brass #c8a84b with chunky rounded teeth and a slime green #86d24a hub button in the center.
Cell 10 — a little clay lightbulb lane-gate arch straddling a lane, hazard yellow #f4c93a clay with a glowing warm lamp-cream #efe6d2 bead on the crown (LIT), blank flat center face.
Cell 11 — the identical arch but dimmed, muted brass #c8a84b clay with a dull slate #16151d bead (UNLIT), blank center face.
Cell 12 — a tiny brass #c8a84b clay pole with a small triangular hazard yellow #f4c93a pennant carrying a danger red #e5533d chevron pointing sideways (warning flag).
Cell 13 — a squat rounded clay dome bumper cap in deep teal #37b3a0 with a slime green #86d24a top dot.
Cells 14, 15, 16 — leave empty, plain flat #FF00FF magenta only.
All items same clay style, same lighting, same palette, same finish, chunky rounded goofy-cute proportions, ONE soft desk-lamp highlight each, cohesive set, no text, no letters, no numbers, no watermark, no UI.

Negative prompt: photoreal human, realistic skin, glossy plastic, shiny CGI render, 3D render, neon glow, bloom, lens flare, text, watermark, signature, logo, drop shadow, blurry soft shadow, gradient background, vector, flat illustration, cel-shaded, outline, perspective tilt, 3/4 view.

## Wire

Feeds `drawShots()` — ramp/orbit throats stamped at each lane origin (fern 165,410 · trellis 435,410 · green 365,405 · heart 210,470 · lorbit 75,635 · rorbit 455,635) with `tube_straight`/`tube_curve` laid along each `.path` and `diverter_flag` at fork exits; `spinner_gear` at 265,250 r20 (rotated by `G.spin.ang`); the three ZAP rollovers at 150/265/380,128 swapping `rollover_arch_on`/`rollover_arch_off` on `sh.lamp`; and `post_nub` caps on `POSTS` at 92,706 / 438,706.
