# YONDER decisions log

Every choice the build made that the YONDER handoff, `plans/math/CATALOG-PLAN.md` and `plans/yonder/HANDOFF-YONDER.md` did
not make for it, newest last, one bold line of what and the why.

**The probes stay the handoff's round numbers: 15, 150 and 1500.** 2026-09-15. The point where a logarithmic and a
linear reading disagree most is N / ln N (22, 145 and 1086 on 0 to 100, 1000 and 10000). The handoff's numbers spread 43.8,
57.5 and 64.4 percent against maxima of 45.1, 57.6 and 65.0: within a point and a half, and a round number is the item a
teacher recognises. The engine gate holds each probe within two points of its maximum rather than to the maximum itself.
0 to 10 and 0 to 20 have no probe; a logarithmic reading of so short a road is not the diagnosis the probe exists for.

**A stage is five targets on 0 to 10 and ten on every longer road, and a band gives no more than it holds.**
2026-09-15. Section 4's first band, from 2 up to 20 percent of the road, holds the one whole number 1 on 0 to 10 (2 is
20 percent, the next band) and 1 to 3 on 0 to 20, so "no target twice in a stage" cannot give it 40 percent of a stage.
Each band is asked for its share of the stage, rounded, or for every number it holds, whichever is fewer, and what it
cannot give is carried to the next band up, keeping the weight toward the low end where the two readings disagree. On
roads of 100 and longer every band holds enough and a stage of ten is exactly 4, 3 and 3.

**Estimation is scored in values, never pixels.** 2026-09-15. Percent absolute error is |placement − target| over the
road's length in numbers; the road's width and offset change every round (Y3), so a pixel error would change with them.

**A reading, logarithmic or linear, is called only on a record of twenty estimates reaching all three bands.**
2026-09-15. The handoff asks for at least 5 estimates spanning the range before fitting. Measured before choosing, on
simulated children with placements scattered by 5 percent of the road, on 20 seeds, the fewest of 100 told apart:

| Road | 10 estimates, log / linear | 20 estimates, log / linear |
|---|---|---|
| 0 to 100 | 97 / 99 | 100 / 100 |
| 0 to 1000 | 90 / 98 | 95 / 99 |
| 0 to 10000 | 80 / 98 | 95 / 100 |

A single stage misnames one logarithmic child in five on the longest road, and a misnamed child is routed away from the
frontier where the feedback matters most. So the minimum is twenty, two stages, which is also the two stages the routing
table's promotion already waits for; spanning means at least one estimate in each of section 4's bands. Below that,
routing uses percent error alone: stay or advance a tier, never promote a range, never mark a frontier.

**Promotion is two stages in a row at or under the tier's band, read linearly.** 2026-09-15. The routing table's "≤ band
×2 stages". A stage over the band, or a stage read logarithmically, starts the count again.

**The pitch is linear in hertz, 220 at 0 and 880 at the far end.** 2026-09-15. Y9. Two octaves is wide enough to hear a
step of a tenth of the road and narrow enough to stay pleasant; the voice is CORE's `audio`, not RESONARC, which does not
exist.

**Only a local voice may speak a numeral.** 2026-09-15. Chrome's Web Speech offers voices that send the text to a
server, which breaks the catalog's promise that nothing is sent (G1, G2). A voice speaks only when `localService` is true;
without one, the numeral is shown and not spoken, and every mode is still complete (Y7 holds on the screen).

**THE RACE is ten squares in one row and a card that shows 1 or 2.** 2026-09-15. The handoff gives no length; the
published board game was ten numbered squares moved by a spinner of 1 or 2. Y1 forbids the spinner, so the move is a
flipped card; one tap or key per square, each square's numeral shown and spoken as it is passed (Y2, Y7).
