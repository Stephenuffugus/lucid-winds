<!-- Berry Vine · Sheet 1: Star-Berry Orbs — the six shape-marbles + loaded / paint / matched / shard states -->
<!-- Copy everything below into your image generator to make this ONE sheet. -->

STYLE — "Starberry Cosmos" (Berry Vine / Sky Wolf Studios cozy-cosmic marble-arcade). Glossy glowing "star-berry" orbs — little fruits of light — in a calm deep-space cosmos. Rounded, chunky, huggable silhouettes; each orb ONE soft rim-light + gentle inner glow, restrained bloom, luminous but NEVER neon-blown; reads by SHAPE first, color second (colorblind requirement). Soft cel + gentle gradient sheen, subtle grain, NO photoreal, NO harsh keylines, NO text/numbers/logos/watermarks. Palette: void #05070a/#0d100c, nebula indigo #1a1636/#241a4a; star-berry hues rose #e24d6a, sky-blue #4d7fe2, amber #e2b34d, teal #3fb6a8, violet #a468d8, leaf-green #7ab356; launch-gold #c8a84b + bloom #ffe9a8 + cream starlight #e8dcc8, moss #8a9178, dusk line #2a331f, comet-dew #bfe0f2 / moon-blue #5b9bd5, rose #e58fa0, plum #7d3450 + warning #e56b6b, metal #8a5a2b/#5c3a1a, spark violet #b57de0. Compress under 150KB.

Create one sprite sheet. File: bv_orbs.png. Grid: 4 columns x 4 rows (16 cells, left-to-right, top-to-bottom). Cell: 512x512. Master: 2048x2048.

KNOCKOUT: Flat magenta #FF00FF fills the entire background of every cell. NO magenta / hot-pink / hot-purple ANYWHERE inside the art (keep rose #e24d6a / #e58fa0 and violet #a468d8 / #b57de0 clearly distinct from #FF00FF). Each orb centered, upright, fully inside its cell with margin, NO ground shadow (orbs float — the engine layers them freely). Keep every orb's own glow contained within its cell — do not let glow tint the magenta field. The six marble shapes MUST be unmistakable from one another by silhouette alone.

THE SIX MARBLES (cells 1-6) — one per shape, each in its default "Orchard" color exactly as the engine tints it (shape index = color index). Each is a glossy star-berry: a bright saturated body, a soft cream #e8dcc8 rim-glow catching the top-left, one crisp cream specular highlight upper-left, a gentle darker underside, and a faint inner star-core spark:
1. orb_circle — a perfectly round planet-berry in rose #e24d6a; the cleanest, softest silhouette (the baseline round marble).
2. orb_heart — a plump heart-shaped nebula-berry in sky-blue #4d7fe2; rounded lobes, clearly a heart at thumbnail size.
3. orb_star — a chunky 5-point rounded star-berry in amber #e2b34d; points soft, not needle-sharp.
4. orb_teardrop — a comet-drop berry in teal #3fb6a8, point UP, a soft tail-glint; unmistakable teardrop.
5. orb_diamond — a rounded 4-point diamond/crystal berry in violet #a468d8; gem facets hinted with a lighter top face.
6. orb_hex — a rounded hexagon asteroid-berry in leaf-green #7ab356; six soft edges, a little rock-cell texture.

STATES & SUPPORT (cells 7-16):
7. orb_template_neutral — the SAME round marble as cell 1 but color-neutral: a soft cream-grey #8a9178→#e8dcc8 orb with the rim-glow + specular baked in and NO hue, so the engine can multiply-tint it to any palette color. (Reference for how alternate palettes recolor the orbs.)
8. orb_loaded_ring — a soft cream #e8dcc8 ready-glow HALO RING only (transparent center), the pulse the engine draws around the orb seated at the pod mouth. Thin, luminous, no orb inside.
9. orb_paint_halo — the Pollen-Burst "repaint" shot marker: a bright cream #ffe9a8 → white outer halo ring with a few sparkle glints, drawn BEHIND the fired orb; transparent center so an orb composites inside. Reads as "this shot is special."
10. orb_prism — an iridescent rainbow star-berry (round) cycling rose→amber→teal→violet across its skin with a bright cream #ffe9a8 core and a strong cream rim-glow; the premium / Pollen-Burst flourish look.
11. orb_matched_flash — a single orb in its bursting instant: overexposed bright cream-white core blowing out the color, a wide soft halo, edges dissolving; the frame shown the moment a run of 3+ pops.
12. pop_shard — ONE small neutral cream #e8dcc8 rounded light-shard (soft triangular glint) for the splat particle burst; color-neutral so the engine tints it to the popped orb's hue. No shadow.
13. sheen_crescent — a reusable soft white specular sheen (upper-left crescent + tiny dot), semi-transparent, that the engine can overlay on any orb to match the code's white sheen. On transparent.
14. next_orb_mini — the small reserve / "next" orb at ~0.7 scale (round, rose #e24d6a) with a faint pair of curved swap-arrow glints hugging it (pictographic, NO text) hinting the Dew Swap tap.
15. sparkle_small — a tiny four-point cream #e8dcc8 star-sparkle with a soft halo; ambient orb twinkle / trail accent.
16. orb_ghost — a dim greyed/hollow round orb (moss #8a9178 outline, near-transparent fill) for locked or preview slots.
