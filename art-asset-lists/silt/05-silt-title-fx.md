<!-- Silt · Sheet 5: Emblem, screens chrome & FX — motes, sparks, plates, trial glyphs -->
<!-- Copy everything below into your image generator to make this ONE sheet. -->

STYLE — "Terrarium Nocturne" (Silt / Lucid Winds midnight-garden). Painted matte-gouache chrome and ambient FX: aged cedar #6d4a2a, brass #b08d3e, thick-glass cream #e8dcc8 / gold #c8a84b rims, deep-night grounds #0d100c/#05070a, sage #7ab356 / deep #3f6b34, dew #bfe0f2/#5b9bd5, lantern glow #ffe9a8, moss #8a9178, dusk line #2a331f, seed-rose #e58fa0, ember #f08c32, mist silver #becdd7, violet #a468d8. FLAT fills, gentle grain, NO gloss, NO harsh black keylines; FX glows soft and CONTAINED. NO text, letters, numbers, logos, watermarks (the SILT wordmark stays engine-rendered text — do not draw letters). Compress under 150KB.

Create one sprite sheet. File: silt_fx.png. Grid: 4 columns x 3 rows (12 cells, left-to-right, top-to-bottom). Cell: 512x512. Master: 2048x1536.

KNOCKOUT: Flat magenta #FF00FF fills every cell's background. NO magenta / hot-pink inside the art (rose #e58fa0 stays clearly distinct). Each element centered with margin. NO ground shadows. FX cells (7-12) need semi-transparent soft edges but the glow must never tint the magenta field.

1. emblem — the game mark, pictographic only: a small hand-blown glass terrarium vessel holding a single sage sprout growing from a tiny golden dune, one dew drop falling toward it, thin brass base, soft lantern halo; sits ABOVE the engine-text wordmark on the title screen.
2. toast_plate — the toast pill: a rounded lozenge of dark glass #1a2415 with a thin gold rim and tiny sparkle at one end; calm center for engine text.
3. confirm_plate — the confirm dialog panel: a rounded rectangle of layered dark paper #0e140d with a cedar edge and a subtle brass corner bracket top-left; calm center.
4. lvlcard_frame — the trial-select card frame: a rounded vertical tile #0f150c with a thin sage rim and a small glass-dome cap detail at top; engine overlays number/name.
5. trial_done — the "trial cleared" glyph (replaces ✿): a small pressed five-petal bloom in rose #e58fa0 with a gold center, flat and sticker-like.
6. toggle_set — the settings toggle pieces: a dark rounded track #26301c AND (separated in the cell) a round cream knob with a tiny sage leaf embossed; engine slides the knob.
7. mote_drift — ambient dust motes: five tiny soft gold #ffe9a8 and cream specks of varying size with faint halos; scattered loosely in the cell for the engine to sample.
8. mist_wisp — a soft horizontal wisp of mist silver #becdd7, semi-transparent, feathered ends; layered over the sim top during heavy mist.
9. ember_spark — three tiny ember flecks #f08c32/#ffe9a8 with short rising tails; sampled during fires.
10. dew_sparkle — a four-point dew glint #bfe0f2 with a small cross-flare and halo; sampled when water condenses or a seed drinks.
11. pulse_heart — a small heartbeat bud: a sage bud outlined in gold with a soft radial pulse ring around it; shown beside the pulse meter when Garden Pulse holds ≥50 (the sunbeam-earning state).
12. win_laurel — the trial-complete crest: two curved sage laurel sprigs meeting under a small gold bloom, brass ribbon tie; sits above the engine text on `#s-over`.

WIRE NOTES: 1 → `#s-title` above `.title-word` (wordmark remains engine text per the no-text rule); 2 → `#toast` background; 3 → `#confirm .box`; 4 → `.lvlcard` background in `renderTrials()` (locked cards keep reduced opacity, `.lvlcard.done` gets cell 5 in the `.ls` slot replacing ✿); 6 → `.toggle`/`.toggle b` in Settings; 7-10 → a light ambient particle layer over `#stage` (respect the existing `tg-fx` "Shimmer effects" toggle — `PROG.fx` gates all of these); 11 → shown beside `#pulsebar` while `G.pulse>=50` (mirrors `payRun(1,"pulse")` earn state); 12 → `#s-over` above `#over-title`. All FX must honor `@media (prefers-reduced-motion: reduce)`. Keep emoji/text fallbacks everywhere.
