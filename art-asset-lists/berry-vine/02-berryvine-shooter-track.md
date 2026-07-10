<!-- Berry Vine · Sheet 2: Launch Pod + Stardust Track + Wormhole burrow — the shooter & the path -->
<!-- Copy everything below into your image generator to make this ONE sheet. -->

STYLE — "Starberry Cosmos" (Berry Vine / Sky Wolf Studios cozy-cosmic marble-arcade). Chunky friendly launch pod and a glowing stardust path winding into a calm swirling wormhole. Rounded huggable silhouettes, nothing sharp or scary; ONE soft rim-light + gentle inner glow per object, restrained bloom, luminous but never neon-blown; reads at thumbnail size. Soft cel + gradient sheen, subtle grain, NO photoreal, NO harsh keylines, NO text/numbers/logos/watermarks. Palette: void #05070a/#0d100c, nebula indigo #1a1636/#241a4a; star-berry hues rose #e24d6a, sky-blue #4d7fe2, amber #e2b34d, teal #3fb6a8, violet #a468d8, green #7ab356; launch-gold #c8a84b + bloom #ffe9a8 + cream #e8dcc8, moss #8a9178, dusk line #2a331f, comet-dew #bfe0f2 / moon-blue #5b9bd5, rose #e58fa0, alarm plum #7d3450 + warning #e56b6b, warm metal #8a5a2b/#5c3a1a, spark violet #b57de0. Compress under 150KB.

Create one sprite sheet. File: bv_world.png. Grid: 4 columns x 4 rows (16 cells). Cell: 512x512. Master: 2048x2048.

KNOCKOUT: Flat magenta #FF00FF fills every cell's background. NO magenta / hot-pink inside the art (rose and violet stay distinct from #FF00FF). Each object centered, fully inside its cell with margin. Contact shadows ONLY where noted "contact shadow"; pieces the engine layers (track, glows, wormhole, aim) have NO ground shadow. Keep glows contained within each cell.

THE LAUNCH POD (cells 1-6) — the center seedpod shooter (`drawShooter()`); the four color SKINS live on the cosmetics sheet, this is the base build. Pod points UP (orb seats at the top mouth):
1. pod_base — the starter "Seedpod" launch pod: a chunky rounded seed/rocket body in warm metal #5c3a1a → #8a5a2b with a soft cream rim-light and a gold #c8a84b collar, a shallow open MOUTH socket at the top where the orb seats, friendly and toy-like. Small soft contact shadow (kept in a separate cell too — see 15).
2. pod_fins — the pod's two little stabilizer fins/wings (leaf-green #3f6b34 with a #5c8f3f highlight, reinterpreted stabilizers) that flank the pod base; the engine draws these under the body. Symmetric pair, no shadow.
3. pod_mouth_glow — a soft cream #ffe9a8 glow socket disc that sits under the loaded orb at the mouth, so the ready orb looks lit from below. On transparent, no shadow.
4. burst_ring — the pulsing cream #ffe9a8 "Pollen Burst armed" ring the engine draws around the loaded orb when a burst is charged: a bright thin luminous ring with a couple sparkles, transparent center. No shadow.
5. aim_beam — the aim guide: a straight tapering DASHED beam in cream #e8dcc8 fading out along its length, pointing up-and-out from the pod; a soft targeting reticle glint at the far tip. On transparent, no shadow. (Engine rotates it to the drag angle.)
6. aim_beam_burst — the same dashed aim beam but in launch-gold #c8a84b / #ffe9a8, brighter, for when a Pollen Burst is armed. On transparent, no shadow.

THE STARDUST TRACK (cells 7-11) — the "vine" the chain crawls (engine strokes it along the bezier path):
7. track_ribbon — a SEAMLESS horizontally-tileable stardust cord: a soft glowing comet-dust rope, comet-dew #bfe0f2 core over a moon-blue #5b9bd5 body with a darker #2b567c underside and a faint cream ridge highlight, tiny star specks embedded; LEFT edge must match RIGHT edge so it tiles head-to-tail. Straight horizontal, centered, no shadow.
8. track_ribbon_dread — the same tileable cord shifted to a warning wash (warm plum #7d3450 / #e56b6b glow creeping in) for when the chain nears the wormhole and dread rises. Seamless, no shadow.
9. track_underglow — a wide soft radial-along-length glow strip (faint indigo #1a1636 → transparent) the engine lays UNDER the whole track for depth. On transparent, no shadow.
10. track_node — a small glowing waypoint speck / dust knot (cream + gold) used to dot the path; on transparent, no shadow.
11. spawn_glint — a soft cream #e8dcc8 → dew #bfe0f2 emergence glow at the chain's ORIGIN (top of the path, where new orbs slide in), a gentle "orbs enter here" light. On transparent, no shadow.

THE WORMHOLE (cells 12-14) — the burrow at the path end (the chain must not reach it; friendly, never scary):
12. wormhole_idle — the calm maw: concentric swirling rings pulling inward, nebula indigo #1a1636 → #241a4a → deep #05070a center, a soft cool violet #a468d8 / moon-blue #5b9bd5 rim-glow and a few star-glints spiralling in; cozy, inviting-not-menacing. A hole, so NO ground shadow.
13. wormhole_dread — the alarmed state: the same swirl but the rim flares warm warning #e56b6b / amber #e2b34d and pulses brighter, the throat glowing hot; signals "the chain is close." No shadow.
14. wormhole_swallow — a mid-swallow frame: the maw stretched a touch wider with two or three orb-glints being drawn down into the throat; the feedback beat when the chain reaches it and (cozily) curls back. No shadow.

FLOURISHES (cells 15-16):
15. pod_shadow — the small soft dark #05070a contact shadow / landing pad that sits UNDER the launch pod (kept separate so the engine can layer it beneath the pod body). Just the shadow oval, on transparent.
16. comet_head — an optional decorative comet head with a short bright cream→dew tail, to lead the very front of the chain or mark the frontmost orb; a soft glowing bullet with a streak. On transparent, no shadow.
