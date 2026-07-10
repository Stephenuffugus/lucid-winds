# Orb Orchard — Blue Spheres homage (build spec, Jul 10)

Stephen: "the blue spheres game from sonic 3 and knuckles. that was one of my favorites... wed have to capture the essence and the feel of it completely which could be hard but it was so fun."
Status when written: fork building satellites/orb-orchard/. If missing/partial next session, rebuild from THIS spec. THE FEEL IS THE DELIVERABLE.

## The essence
- Pseudo-3D checkerboard curving over a spherical horizon (Mode-7 + globe illusion). Canvas: perspective projection + downward curvature growing with distance; low internal res + imageSmoothing off; palette-swapped checkerboard per stage. HORIZON MUST CURVE — verify by looking at a screenshot.
- Constant forward motion, cell-snapped on a WRAPPING 32x32 torus. 90° turns QUEUE, apply at cell centers. Jump arcs ~1.5 cells, no mid-air turning. Speed RAMPS on a timer with a visible "SPEED UP" cue — the mounting tension is the soul.
- Elements (colorblind by SHAPE): Dew Orbs (round glossy, collect all = clear), Thorn Orbs (spiky, touch = run over in normal), Sunbead Rings (gold torus; ALL = Perfect), Bumpers (bounce 180°), Springs (3-cell launch).
- THE DEEP CUT (must ship): SURROUND-TO-RINGS — collected orbs forming a closed loop convert enclosed dew orbs to rings (flood-fill from outside on the torus), with a burst.

## Structure
12 hand-authored stages (spirals, corridors, ring cages, bumper mazes, spring shortcuts). Every stage embeds a PROOF INPUT SCRIPT ({at:cell, do:"L"|"R"|"J"}) replayed through the real engine → cleared, no thorn-touch. Author via DEV route-planner: BFS on (cell,dir) to nearest dew orb treating thorns/bumpers as walls, replan each arrival; design stages the planner clears; BAKE recorded scripts; stageCheck() 12/12. Movement is rng-free → proofs exact.

## Modes
Orchard (12 stages) · Daily Sphere (seeded generator, planner-verified solvable, regen cap 40 → fallback jittered curated stage; streak) · Zen Stroll (thorns bounce, pays 0) · Blitz (start fast, score = clear time). Clear grows a tree in a local Orchard gallery; Perfect presses a golden keepsake.

## Cosmetics (orborchard_save)
3 runner skins, 3 checkerboard palettes, 3 horizon skies; thresholds on clears/perfects/streak.

## Controls
Tap left/right halves or swipe = queue turn; jump button ≥48px or swipe up; input buffering (queued turns never dropped). Text 0.7rem+. Fixed dt, Reduce Effects toggle, small internal buffer scaled up for perf.

## Plumbing
ES5, single file satellites/orb-orchard/index.html, 540x960. sunbeam-sdk v4, gameId "orborchard", DEFINE _sbCapEarn sw_sb_orborchard 30/day + 12/run (clear 2, perfect +1, daily 3, zen 0). SWS embed/exit. PWA meta.

## Provability (?ootest=1 → OO_DEV) — ALL must pass
loadStage/step/queueTurn/jump/state / runStageProof(i) / stageCheck 12/12 / surroundCheck (known enclosure converts) / zenCheck (bounce) / dailyCheck(8) 8/8 solvable / determinism / earnTest. 0 errors, node --check clean. Screenshot: horizon visibly curves.

## Ship steps (parent)
Same pipeline as nova-bloom.md. ⛔ Art pack leads with non-botanical options; name debatable pre-art.
