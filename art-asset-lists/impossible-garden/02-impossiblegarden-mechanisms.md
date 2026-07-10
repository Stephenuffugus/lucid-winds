<!-- Impossible Garden · Sheet 2: Seams & Mechanisms — light-thread bridges, dial knobs, ticks, hint halo, impossible-shimmer -->
<!-- Copy everything below into your image generator to make this ONE sheet. -->

STYLE — "Moonstone Monument" (Impossible Garden / Sky Wolf Studios dreamlike iso puzzle). Sacred-geometry dream architecture: pale carved moonstone in an indigo void; the MECHANISMS are tiny carved astrolabe dials, and the impossible seams they open are soft THREADS OF LIVING LIGHT spanning gaps that could never touch. Quiet, monumental, kid-friendly; one soft cool key light upper-left, restrained bloom, never neon. Flat cel + subtle stone grain + soft glaze sheen, NO photoreal, NO heavy outlines, NO text/letters/numbers/logos/watermarks. Palette: void #141526/#171a24/#0c0b14, dusk line #2a331f; arm-light #a6d77f, sage glaze #7ab356/#4f7d38, gold #c8a84b, bloom-light #ffe9a8, cream #e8dcc8, moss-grey #8a9178, start-blue #5b9bd5, dew #bfe0f2, dial-stone #1e1a2d, high-contrast rim #f4ffe0. Compress under 150KB.

Create one sprite sheet. File: ig_mechs.png. Grid: 4 columns x 3 rows (12 cells, left-to-right, top-to-bottom). Cell: 512x512. Master: 2048x1536.

KNOCKOUT: Flat magenta #FF00FF fills the entire background of every cell. NO magenta / hot-pink ANYWHERE inside the art. Each asset centered, upright, fully inside its cell with margin, NO ground shadow (everything composites over floating blocks). Keep every glow contained within its cell — nothing may tint the magenta field. SHAPE LAW (colorblind requirement, restated): a mechanism's state must NEVER read by color alone — the dial's tick ANGLE and the physical PRESENCE/ABSENCE of the bridge are the truth; open seams get light + leaves, closed seams get a visibly curled-away stub.

THE BRIDGE (cells 1-4) — the impossible-seam span the engine grows in when a mechanism state is ON (it eases in, so the art must survive being scaled/faded):

1. bridge_active — the open seam: a gently arched thread of living light spanning left-to-right across the full cell — a luminous cream #ffe9a8 core wrapped in an arm-light #a6d77f glaze, like a vine spun from lantern-glow; its MIDDLE THIRD is horizontally stretchable (clean, repeatable) so the engine can fit any seam length. Soft, warm, unmistakably solid enough to walk.
2. bridge_leaf_pair — the midpoint life: two small sage #7ab356 leaves (one tilted left, one right, slightly offset) that sprout at the bridge's crown when it opens; on transparent, sized to sit on the cell-1 arc without hiding it.
3. bridge_stub_off — the closed seam: a short curled-away tendril stub of dim arm-light #a6d77f, coiled back against a stone lip, clearly RETRACTED — the "not connected" read for colorblind players. No span, no glow across the gap.
4. bridge_neutral — the tint template: the exact cell-1 bridge but color-neutral (cream #e8dcc8 core, pale grey wrap, sheen baked in, no hue) so the engine can multiply-tint it to any palette's arm color (Twilight #a6d77f / Amethyst #d3b0f0 / Ember #f0b070).

THE DIAL (cells 5-8) — the tappable mechanism handle floating above each seam (engine hit radius stays small — art must NOT look like a bigger button than it is):

5. knob_base — the astrolabe dial: a round carved stone disc, face in deep dial-stone #1e1a2d with a thin arm-light #a6d77f rim ring and faint concentric carving; a tiny cream notch at the 12 o'clock rim marks the reference point the tick is read against. Chunky, friendly, obviously turnable.
6. knob_tick — the pointer alone, on transparent: one bold rounded tick like a compass needle stub, cream #e8dcc8 with an arm-light #a6d77f edge, drawn pointing straight UP from center; the ENGINE rotates it to show the current state (tick angle = state — the primary shape cue).
7. knob_hint_halo — the hint pulse: a warm gold #ffe9a8 soft halo disc with a breathing double-edge, transparent center sized to sit behind the cell-5 dial; this is what gently pulses on the dial the hint system wants you to try. Warm and inviting, never alarming.
8. knob_state_pips — the state count hint: a small arc of three tiny round pips that hugs the dial's lower rim (for dials with more than two states) — pips are hollow moss-grey #8a9178 rings with ONE filled cream pip; pictographic only, NO numerals. NEW WIRING (no existing draw — needs code): the engine shows state only via the rotating tick; no pip readout exists today.

SEAM MAGIC & FEEDBACK (cells 9-12) — ⚠ ALL FOUR are NEW WIRING (no existing draw — needs code): every trigger moment below is real in the engine (seam ends, the visual-kiss alignment, `cycleMech` firing, an open bridge), but `drawArm` renders none of these today — the cut+wire session must budget the draw calls:

9. seam_socket — the bridge anchor: a small carved notch-fitting on a stone lip where the light-thread lands — a half-round cream stone cradle with a faint #a6d77f inner glow when seen alone; one per seam end, mirrored by the engine.
10. seam_shimmer — the impossible-alignment shimmer: a faint vertical ribbon of cool dew #bfe0f2 light with a subtle lens-like bend, marking the magic spot where two far-apart tiles visually kiss on screen; barely-there, dreamlike, transparent edges.
11. turn_flash — the dial-turn confirmation: a quick radial flash burst — short cream #e8dcc8 rays and two or three gold #c8a84b sparks around a transparent center — shown for a beat when a mechanism cycles (today `cycleMech` only beeps).
12. seam_spark — the traveling glint: a single tiny bright dot of bloom-light #ffe9a8 with a wisp of a tail, which the engine slides along an open bridge to show it is alive and walkable.
