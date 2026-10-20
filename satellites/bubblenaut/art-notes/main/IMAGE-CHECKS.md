# Source image inspection

Generated masters inspected without modifying pixels. Bounds come from a broad green-background mask and are extraction hints, not final collision boxes. Source rectangles are [left, top, right, bottom), in pixels. Lowest foreground includes sparkles or an airborne boot; it is NOT always a ground anchor.

| Sheet | Pixels | Frames | Lowest foreground y, left to right | Edge clipping |
|---|---|---:|---|---|
| hero_idle.png | 2172 x 724 | 4 | 585, 585, 585, 585 | None detected |
| hero_run.png | 2172 x 724 | 6 | 557, 558, 542, 557, 560, 553 | None detected |
| hero_jump.png | 2172 x 724 | 4 | 592, 592, 527, 526 | None detected |
| hero_fall.png | 2172 x 724 | 3 | 613, 627, 612 | None detected |
| hero_land.png | 2172 x 724 | 3 | 618, 618, 619 | None detected |
| hero_blow.png | 2172 x 724 | 4 | 587, 587, 588, 587 | None detected |
| hero_turn.png | 2172 x 724 | 3 | 620, 627, 620 | None detected |
| hero_hurt.png | 2172 x 724 | 4 | 522, 523, 523, 523 | None detected |
| hero_die.png | 2172 x 724 | 6 | 485, 476, 474, 493, 493, 496 | None detected |
| hero_respawn.png | 2172 x 724 | 4 | 565, 581, 589, 585 | None detected |
| hero_cheer.png | 2172 x 724 | 6 | 542, 543, 545, 541, 516, 543 | None detected |
| hero_wave.png | 2172 x 724 | 4 | 594, 593, 594, 594 | None detected |

All twelve sheets have the requested frame count and separable frame gutters. Inspect and align extracted frames before wiring them into the game. Do not slice blindly into equal-width cells: the art is approximately spaced and some silhouettes cross nominal equal-cell boundaries. Use the measured source slices, then pack equal runtime cells.

The master backgrounds are green, but generated pixels need tolerance-based chroma keying and edge despill. The JSON records measured border colors; do not assume a mathematically exact #00FF00 fill. Protect cyan boots, cyan glass, pink reflections and white highlights.

Cross-action source sizes and within-action poses vary. Normalize using stable anatomy and a shared body-root anchor. No automated read-only image check proves smooth animation, correct hitboxes, or native-phone legibility; those are remaining integration checks.
