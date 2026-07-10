<!-- Impossible Garden · Sheet 3: Wanderer, Blooms & FX — walker poses, goal bloom stages, keepsake blooms (5-9 petals), solve particles -->
<!-- Copy everything below into your image generator to make this ONE sheet. -->

STYLE — "Moonstone Monument" (Impossible Garden / Sky Wolf Studios dreamlike iso puzzle). In a pale stone dream, the only living things: a tiny sprout WANDERER (a soft egg-shaped body with a two-leaf sprout and calm dark eyes) and the single gold BLOOM waiting at the goal. Rounded, huggable, kid-friendly; one soft cool key light upper-left, gentle warm glow from the bloom, restrained bloom-light, never neon. Flat cel + soft glaze sheen, subtle grain, NO photoreal, NO heavy outlines, NO text/letters/numbers/logos/watermarks. Palette: void #141526/#0c0b14, sprout body #eafbd6, leaf sage #7ab356, eye-dark #20261a, gold #c8a84b, bloom-light #ffe9a8, cream #e8dcc8, start-blue #5b9bd5, dew #bfe0f2, moss-grey #8a9178, dusk line #2a331f. Compress under 150KB.

Create one sprite sheet. File: ig_walker_fx.png. Grid: 4 columns x 4 rows (16 cells, left-to-right, top-to-bottom). Cell: 512x512. Master: 2048x2048.

KNOCKOUT: Flat magenta #FF00FF fills the entire background of every cell. NO magenta / hot-pink ANYWHERE inside the art. Each asset centered, upright, fully inside its cell with margin, NO ground shadow baked into any pose (the engine draws the walker's shadow separately — cell 4 IS that shadow). Keep every glow contained within its cell. The wanderer is drawn tiny in-game (a ~13×18 ellipse) — silhouettes must survive extreme downscale: big simple masses, high face contrast.

THE WANDERER (cells 1-4) — base "Sprout" skin #eafbd6 (cosmetic skins recolor the BODY only; sprout leaves stay palette-green, eyes stay dark):

1. walker_idle — the wanderer at rest: a plump upright egg/teardrop body in pale sprout-green #eafbd6 with a soft belly sheen, two small sage #7ab356 leaves sprouting from the crown (one left, one right), and two calm round eye-dark #20261a eyes set low. Serene, friendly, instantly lovable at 18px tall.
2. walker_hop — mid-hop: the same body gently stretched taller and narrower, leaves swept up, eyes soft — the frame for the top of its little sine-arc hop between tiles. NEW WIRING (no existing draw — needs code): the engine has ONE walker draw (`drawWalker`) and the hop is a positional sine offset only — no pose swap exists today.
3. walker_seam — seam-crossing: the idle body wrapped in a faint cool dew #bfe0f2 rim-shimmer with two or three tiny drifting glints, for the beat when it walks an impossible bridge; the glow stays tight to the silhouette. NEW WIRING (no existing draw — needs code): same single-pose engine — seam steps are not distinguished from normal steps in the draw today.
4. walker_shadow — the contact shadow alone: a soft dark elliptical blob (near-black, ~25% feel), wider than tall, on transparent; the engine slides it under the walker on each tile.

THE GOAL BLOOM (cells 5-8) — the flower on the goal pedestal (engine pulses it while unsolved, opens it on solve):

5. bloom_bud — closed: a tight teardrop bud in deep gold #c8a84b with a whisper of bloom-light #ffe9a8 at the tip seam, sitting on a tiny sage calyx. Patient, waiting.
6. bloom_half — waking: the bud half-open, three or four petals parting to reveal a warm #ffe9a8 core glow; the pulse frame while the puzzle is still unsolved.
7. bloom_full — the garden blooms: a fully open six-petal flower — rounded gold #c8a84b petals, luminous #ffe9a8 center disc, one petal catching a cream #e8dcc8 rim-light — the solve moment's hero sprite.
8. petal_particle — one loose petal, color-neutral pale cream #e8dcc8 with a soft curl, on transparent; the engine tints it to the palette's goal/start colors and flings it in the solve burst.

SOLVE FX (cells 9-10):

9. spark_gold — a small round glow-mote in gold #c8a84b with a #ffe9a8 hot core and soft falloff; half the 40-particle solve burst uses the goal color.
10. spark_blue — the same round glow-mote in start-blue #5b9bd5 with a #bfe0f2 core; the other half of the burst uses the start color (the engine alternates the two).

KEEPSAKE BLOOMS (cells 11-15) — the pressed flowers of the Gallery and win screen (the engine varies petal count 5-9 by seed/level, alternating two palette colors around a bright center; render these as FLAT PRESSED flowers — like flowers dried in a book — top-down, symmetrical, slightly papery, each with a short straight sage #7ab356 stem stub below). TINT PLAN (read before wiring): these five cells are baked in the TWILIGHT palette only (gold #c8a84b + start-blue #5b9bd5 = `PALS[0]`) — but the Gallery does NOT follow the equipped palette: `renderGallery` (index.html ~550) colors each keepsake by `PALS[seed%PALS.length]`, so Twilight, Amethyst AND Ember presses all appear in the gallery regardless of what is worn, while the 150px win-screen `#win-bloom` uses the EQUIPPED `pal()`. So blit these cells only where the computed palette is Twilight (gallery seeds with `seed%3===0`; win bloom while Twilight is worn); Amethyst/Ember keepsakes explicitly KEEP the procedural canvas fallback unless per-palette recolor cells are later added to sheet 06. STEM NOTE: only the 150px win bloom draws a stem in code (index.html ~512) — the 64×64 gallery canvases are stemless, so the gallery composite crops or omits the stub; keep the flower HEAD perfectly centered in the cell with the stub strictly below it so a head-only crop still centers correctly in the tiny gallery frame:

11. keepsake_5 — a pressed bloom with exactly 5 petals, alternating gold #c8a84b and start-blue #5b9bd5 petals around a #ffe9a8 center.
12. keepsake_6 — the same pressed style with exactly 6 petals.
13. keepsake_7 — exactly 7 petals.
14. keepsake_8 — exactly 8 petals.
15. keepsake_9 — exactly 9 petals, the fullest press; petals slightly overlapped to fit.

FOOTFALL (cell 16):

16. hop_dust — a tiny landing puff: two or three soft moss-grey #8a9178 / cream #e8dcc8 dust wisps and one tiny glint, low and wide, on transparent; plays under the wanderer as it lands a hop. NEW WIRING (no existing draw — needs code): landings are real moments in `step()` but the engine draws nothing at them today.
