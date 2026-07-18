# Sheet 10 — ANIMATIONS — Sprite-Strip Frame Sequences

The star sheet: every moving graphic in Blobworks, delivered as horizontal sprite strips (one action per row, fixed cell pitch, magenta between and behind every frame) so a constant-pitch cutter slices each strip cleanly and the engine can page through frames with a source-x offset.

```
STYLE — "Midnight Monster Lab" claymation (Blobworks pinball). Top-down 90 degree orthographic pinball art, hand-sculpted MODELLING CLAY / plasticine, stop-motion look (Aardman / Gumby / Morph). Every object is a little clay model: visible thumbprint dents, tool-scrape seams, soft rounded edges that wobble slightly (never perfectly geometric), matte plasticine sheen with ONE soft desk-lamp highlight, tiny pressed-in dust/lint flecks, a gentle contact shadow underneath. Goofy-friendly monsters — googly eyes, buck teeth, one stubby horn, big grins; cute NOT scary, no gore, no menace. Palette: dark clay lab-bench base #22202a, slate shadow #16151d; slime green #86d24a + deep monster teal #37b3a0; goop purple #9b6fd4; eyeball cream #f1ede2 with iris #4fa3d1 + black pupil; hazard yellow #f4c93a; danger red #e5533d; brass machine #c8a84b + warm lamp cream #efe6d2; gum-pink tongue #e88ba0. Lighting: one warm desk-lamp from top-center, cool moonlight fill, dark drop-off toward the middle of the table so the moving eyeball ball + bumpers pop. Rendering: photographed-clay feel — soft studio light, subtle grain, NO vector-flat, NO neon glow-blowout, NO photoreal humans, NO text / watermark / UI baked into sprites (letters are drawn by the engine). Everything reads at small size on a 540x960 phone table. Consistent top-down view for all playfield pieces (no perspective tilt). Deliver each sprite knocked out on a flat magenta #FF00FF background.
```

## Sheet layout

This sheet is NOT one square — it ships as **five separate horizontal strip images** so each animation keeps its own constant cell pitch (mixing frame-counts on one square would break the cutter). Every strip is drawn on a pure flat **magenta #FF00FF** knockout with even magenta gutters between cells; each cell is square (except the tilt overlay) and the model is centered inside it, never touching a cell edge, so a fixed-pitch slicer cuts on `cellPx` alone. Generate large for detail, then the engine scales down to the on-table size listed per asset.

- **Image 1 — `blip_strips.png`** — mascot rows, **256px cells**, 6 columns × 3 rows = **1536×768**. Row 0 = `blip_idle` (6 cells), Row 1 = `blip_blink` (3 cells, left-aligned, trailing 3 cells flat magenta), Row 2 = `blip_wave` (5 cells, left-aligned, trailing 1 cell flat magenta). On-table ~128px.
- **Image 2 — `gameplay_strips.png`** — small playfield reactions, **256px cells**, 6 columns × 6 rows = **1536×1536**, all rows left-aligned with trailing cells flat magenta. Row 0 = `eyeball_blinkroll` (4), Row 1 = `bumper_chomp` (4), Row 2 = `sling_wobble` (3), Row 3 = `beaker_tumble` (3), Row 4 = `scoop_gulp` (5), Row 5 = `spinner_spin` (6). On-table sizes vary per asset below.
- **Image 3 — `goo_boilover.png`** — one wide strip, **320px cells** × 6 = **1920×320**. On-table ~120px.
- **Image 4 — `mega_mash_erupt.png`** — one wide strip, **320px cells** × 8 = **2560×320**. On-table ~200px.
- **Image 5 — `tilt_wobble.png`** — full-table overlay strip, **270×480 cells** (half of 540×960) × 4 = **1080×480**. Scales up to the full 540×960 table.

Keep lighting, sheen, palette, and lens IDENTICAL across all five images so the set reads as one lab. Every frame of a given strip is the SAME model, same colors, same footprint — only the pose changes.

## Assets

**Image 1 — blip_strips.png (256px cells)**

- `blip_idle` — 6 frames, LOOP, trigger: always (attract + between-ball). Blip the mascot: a plump one-eyed **slime green #86d24a** clay blob, Morph-style, rounded like a squished gumdrop with two tiny stubby teal #37b3a0 arm-nubs and a soft gentle grin. One oversized central googly eye — **cream #f1ede2** ball, **iris #4fa3d1**, black pupil. Visible thumbprint dents and a faint seam down his belly. The 6 frames breathe: rest → squash down/widen → settle → gentle lean left → gentle lean right → back to rest, so a loop jiggles him softly. ONE warm lamp highlight on the top-left of his dome, tight contact shadow under him.
- `blip_blink` — 3 frames, ONE-SHOT, trigger: random idle blink. Same Blip, dead-centered, arms at rest. Frame 1 eye fully open (big round iris), Frame 2 a **slime green clay eyelid** folding halfway down over the eye, Frame 3 eye squeezed shut into a happy clay crease. Identical body, only the lid moves.
- `blip_wave` — 5 frames, ONE-SHOT, trigger: win / mode-complete cheer. Same Blip celebrating: Frame 1 arm-nub down at rest, Frame 2 one arm lifting, Frame 3 arm up mid-wave with mouth opening into a wide grin, Frame 4 BOTH stubby arms thrown up cheering with the eye scrunched happy, Frame 5 arms coming back down settling. Big joyful buck-tooth grin at the peak, gum-pink #e88ba0 tongue peeking.

**Image 2 — gameplay_strips.png (256px cells)**

- `eyeball_blinkroll` — 4 frames, LOOP, trigger: the ball (on-table ~32px). A round **cream #f1ede2** clay eyeball marble with a **#4fa3d1 iris** + black pupil and tiny red #e5533d veins. Frames: eye wide open → iris rolling to one side → a clay lid sweeping half-closed → fully blinked shut, so it loops as a lazy blink-and-roll. Glassy single lamp catchlight kept consistent every frame.
- `bumper_chomp` — 4 frames, ONE-SHOT, trigger: `o.hitT` on pop-bumper hit (on-table ~56px). A chomping **monster teal #37b3a0** clay head, top-down: round lumpy dome, one stubby **hazard yellow #f4c93a** horn, two googly eyes, buck teeth ringing a **gum-pink #e88ba0** mouth. Squash-and-stretch: Frame 1 crouched/squashed flat (anticipation), Frame 2 mouth SNAPPED wide open teeth flaring (action), Frame 3 stretched tall past the pose wobbling (overshoot), Frame 4 settled back to rest.
- `sling_wobble` — 3 frames, ONE-SHOT, trigger: sling kick (on-table ~28px). A small bubbling **goop purple #9b6fd4** blob with a couple of raised bubbles and a tiny grin. Frame 1 at rest, Frame 2 kicked/bulged sideways with bubbles flung, Frame 3 jiggling back — a quick squash-recoil.
- `beaker_tumble` — 3 frames, ONE-SHOT, trigger: drop-target knockdown (on-table ~24px). A little clay lab **beaker**, **brass #c8a84b** rim with **teal #37b3a0** liquid and a googly eye on the glass. Frame 1 standing upright, Frame 2 tottering / tipping at an angle, Frame 3 knocked flat on its side, liquid sloshed. Same beaker, only the tilt changes.
- `scoop_gulp` — 5 frames, ONE-SHOT, trigger: `G.scoopT` scoop capture (on-table ~40px). A big goofy top-down **monster mouth** — fat lips, ring of buck teeth, **gum-pink #e88ba0 tongue** inside, two googly eyes above. Frame 1 mouth closed grin, Frame 2 mouth gaping open, Frame 3 a **cream eyeball marble** dropping into the maw, Frame 4 lips bulging mid-swallow with cheeks puffed, Frame 5 mouth closed again with a satisfied smile.
- `spinner_spin` — 6 frames, LOOP, trigger: spinner spin (on-table ~40px). A chunky clay **gear/fan**, **brass #c8a84b** with a **slime green #86d24a** hub and a single googly eye at the center that stays upright. Six frames step the gear teeth ~15° each so a loop reads as smooth continuous rotation; the center eye and lamp highlight hold steady while the toothed ring turns.

**Image 3 — goo_boilover.png (320px cells)**

- `goo_boilover` — 6 frames, ONE-SHOT, trigger: GOO MULTIBALL start (on-table ~120px). A round-bellied clay **specimen jar / cauldron**, brass #c8a84b rim, filled with **slime green #86d24a** goo shot through with **goop purple #9b6fd4** swirls and a googly eye bobbing in it. Frames: 1 calm surface with one bubble, 2 more bubbles rising, 3 the goo doming up and swelling, 4 a big frothy blister bulging over the rim, 5 goo spilling and splattering down the sides flinging tiny green blobs, 6 the level settling with drips clinging. Bubbles catch the single lamp highlight; keep the jar footprint identical every frame.

**Image 4 — mega_mash_erupt.png (320px cells)**

- `mega_mash_erupt` — 8 frames, ONE-SHOT, trigger: `G.wizardT` MEGA MASH wizard start (on-table ~200px). A giant celebratory clay eruption from a squat monster head/vat in the center. Beat sheet: 1 crouched squashed vat (anticipation), 2 cracking open with light-cream #efe6d2 seams, 3 a fat column of **slime green #86d24a** + **goop purple #9b6fd4** goo blasting up, 4 the burst at full height flinging a **confetti of little clay bits** (green, purple, hazard-yellow #f4c93a, danger-red #e5533d flecks), 5 confetti peak spreading wide with tiny googly eyes among the bits, 6 bits raining back down, 7 goo column slumping and wobbling (overshoot), 8 settling into a happy grinning mound. Cheerful, cartoon-big, never scary. Keep the center footprint stable so it scales cleanly.

**Image 5 — tilt_wobble.png (270×480 cells)**

- `tilt_wobble` — 4 frames, LOOP, trigger: `G.tilt` tilt warning (full 540×960 table overlay). A top-down view of the whole clay lab-bench table (base #22202a, slate shadow #16151d) shown shuddering. Frame 1 table level/neutral, Frame 2 shoved slightly left with a **hazard yellow #f4c93a** warning wash bleeding in at the edges, Frame 3 shoved slightly right with the yellow deepening toward **danger red #e5533d**, Frame 4 a harder jolt with everything blurred by a hair — loops as a nervous rattle. Read it as a wobble/shift + warning tint overlay, not a redraw of every prop; keep the bench texture and lamp glow consistent so only the offset and the alarm tint change.

## Copy-paste prompt

> handmade plasticine claymation model, hand-sculpted modelling clay, stop-motion character, macro studio photograph of real clay figurines shot on a lightbox, 100mm macro lens, soft diffuse softbox lighting, shallow depth of field, real physical miniature. Aardman / Wallace-and-Gromit / Morph clay look. Matte-to-satin Plasticine sheen, soft waxy finish, NOT glossy. Visible fingerprint smudges, thumbprint dents, sculpting-tool scrape marks, faint seam lines, tiny lint and dust specks, soft rounded hand-rolled edges. ONE warm desk-lamp highlight top-center on every piece, cool moonlight fill, small tight contact shadow only. Chunky rounded proportions, big friendly oversized googly eyes, tiny stubby limbs, gentle smiles, buck teeth, one stubby horn — cheerful wholesome cute, NOT scary. Strict top-down bird's-eye orthographic view, camera pointing straight down, zero perspective, no foreshortening. Limited consistent palette, same colors across all cells, no new hues: dark lab-bench base #22202a, slate shadow #16151d, slime green #86d24a, monster teal #37b3a0, goop purple #9b6fd4, eyeball cream #f1ede2 with iris #4fa3d1 and black pupil, hazard yellow #f4c93a, danger red #e5533d, brass #c8a84b, warm cream #efe6d2, gum-pink tongue #e88ba0. Isolated on a solid flat chroma-key magenta #FF00FF background, pure even #FF00FF fill twice over, no gradient, no texture, no shadow on background, clean cutout, no magenta spill or reflection on the clay, each subject fully inside its cell, not touching edges.
>
> Render as SPRITE-STRIP animation frames — a horizontal strip of frames of the SAME clay model in one continuous stop-motion action, left-to-right, identical model / same colors / same footprint in every frame, evenly spaced on a fixed pitch with equal magenta gutters, only the pose changes, on-model and consistent between frames. Squash-and-stretch beats where noted: anticipation (squash) → action → overshoot (wobble past) → settle. Generate these strips:
>
> ROW blip_idle — 6 equal cells, LOOP: "Blip", a plump one-eyed slime green #86d24a clay blob (Morph-style gumdrop) with two stubby teal arm-nubs, one oversized cream #f1ede2 googly eye with #4fa3d1 iris and black pupil, gentle grin; frames breathe rest → squash-wide → settle → lean left → lean right → rest.
>
> ROW blip_blink — 3 cells, one-shot: same Blip centered, eye open → slime-green clay lid halfway → eye squeezed happily shut.
>
> ROW blip_wave — 5 cells, one-shot: same Blip cheering, arm down → arm lifting → arm up grinning → both arms up eye-scrunched with gum-pink tongue → arms lowering.
>
> ROW eyeball_blinkroll — 4 cells, LOOP: a cream #f1ede2 clay eyeball marble, #4fa3d1 iris, faint red veins; open → iris rolling aside → lid half-closed → blinked shut.
>
> ROW bumper_chomp — 4 cells, one-shot: a chomping monster teal #37b3a0 clay head with one hazard-yellow #f4c93a horn, googly eyes, buck teeth around a gum-pink mouth; squashed flat → mouth snapped wide → stretched tall wobbling → settled.
>
> ROW sling_wobble — 3 cells, one-shot: a small bubbling goop purple #9b6fd4 blob; at rest → bulged sideways flinging bubbles → jiggling back.
>
> ROW beaker_tumble — 3 cells, one-shot: a little clay beaker, brass #c8a84b rim, teal liquid, googly eye; upright → tipping → knocked flat with liquid sloshed.
>
> ROW scoop_gulp — 5 cells, one-shot: a goofy top-down monster mouth with buck teeth and gum-pink #e88ba0 tongue and two googly eyes; grin closed → gaping open → a cream eyeball dropping in → cheeks bulging mid-swallow → closed satisfied smile.
>
> ROW spinner_spin — 6 cells, LOOP: a chunky clay gear/fan, brass #c8a84b with slime-green hub and a steady googly eye at center; teeth stepped ~15° per frame for smooth rotation, center eye and highlight held still.
>
> WIDE STRIP goo_boilover — 6 cells, one-shot: a brass-rimmed clay cauldron of slime green #86d24a goo swirled with goop purple #9b6fd4 and a bobbing googly eye; calm one bubble → more bubbles → goo doming up → frothy blister over the rim → spilling and splattering green blobs → settling with drips.
>
> WIDE STRIP mega_mash_erupt — 8 cells, one-shot: a squat clay monster vat erupting; squashed vat → cracking cream #efe6d2 seams → column of green+purple goo blasting up → burst flinging confetti of tiny clay bits (green/purple/hazard-yellow/danger-red) → confetti peak with tiny googly eyes → bits raining down → goo slumping wobbling → settling into a grinning mound; cartoon-big and cheerful, never scary.
>
> WIDE STRIP tilt_wobble — 4 cells, LOOP: top-down of the whole clay lab-bench table (base #22202a, slate shadow #16151d) shuddering; level → shoved left with hazard-yellow #f4c93a edge wash → shoved right with the wash deepening to danger-red #e5533d → a harder jolt slightly blurred.
>
> All items same clay style, same lighting, same palette, same matte finish, cohesive set. --no photoreal human, realistic skin, glossy plastic, shiny CGI render, 3D render, neon glow, bloom, lens flare, text, watermark, signature, logo, drop shadow, blurry soft shadow, gradient background, vector, flat illustration, outline

## Wire

Feeds the frame `drawImage(strip, frame*cellPx, 0, cellPx, cellPx, x-w/2, y-h/2, w, h)` blits — LOOPS (`blip_idle`, `eyeball_blinkroll`, `spinner_spin`, `tilt_wobble`) pick `frame = Math.floor((G.t*fps)%frames)`; ONE-SHOTS (`blip_blink`, `blip_wave`, `bumper_chomp` via `o.hitT`, `beaker_tumble`, `sling_wobble`, `scoop_gulp` via `G.scoopT`, `goo_boilover`, `mega_mash_erupt` via `G.wizardT`) pick `frame = Math.min(frames-1, Math.floor((now-eventT)*fps))`. No new engine systems — just source-x cell offset off existing timers.
