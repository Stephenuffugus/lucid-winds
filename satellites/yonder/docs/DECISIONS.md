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

**The flag starts every round at the road's start, 0.** 2026-09-15. CORE's stone begins at 0 and a flag held anywhere
else before the child moves it would be a hint where the number is. The start of the road is where the traveler sets out
from; it says nothing about the target.

**The road is measured inside a lane inset 40 px from the painted scene's edges.** 2026-09-15. The first shots cut the
far numeral to "10", the signpost's board and the flag at 0 at the scene's edge. The line's width and offset still
change every round (Y3) as fractions of the lane, so nothing about the geometry is lost.

**The walk is a steady pace: 1.2 s from flag to truth on every round, 2.4 s on a probe; with less motion 0.5 s and 0.9 s.**
2026-09-15. The same time whether the flag was near or far, so the walk's speed carries the distance and the curve in
time is the same on every path (the reveal contract, rule 4). The probe's slower walk is the handoff's "the long way back,
slowly". With less motion the traveler still walks the whole way (G10: reduced, never removed).

**A session starts on the road to 10, and a teacher's link may start it elsewhere.** 2026-09-15. The routing table climbs
a road only on a record, so the shortest road is where a record can start without guessing a child's grade.

**Only FLAG estimates on the road being worked on feed the reading, and the reading uses the last twenty.** 2026-09-15.
A milepost round is a benchmark with posts standing on the road, and a drop back is practice on a road already read;
either would blur the reading the routing table acts on. The last twenty (MIN_FIT) is two stages, so a child who has
changed is read as they are now.

**Advancing a tier, promoting a road and rotating follow the table; a promoted road starts at the second tier.**
2026-09-15. "Reset to tier 2" read as the second band, 12 percent. A drop back records estimates on its road and routes
nothing, so a mastered road is never taken away by a practice stage.

**A drop back comes at the first stage it can once two stages have passed since the last (Y8).** 2026-09-15. The first
rule, every third stage by count, missed a drop back after the top road rotated home to 10. Rotation itself sends home to
a random road, the handoff's "rotate ranges".

**A frontier turns the next stage into MILEPOSTS on the same road, and the stage after serves the probe again.**
2026-09-15. The routing table's "max feedback, re serve probe, inject MILEPOSTS rounds". MILEPOSTS is the halfway post,
then the quarter posts where a quarter is a whole number (not on 0 to 10, whose quarters are 2.5 and 7.5), then four
estimates with the posts standing.

**THE RACE is behind its own door on the first screen, a picture of a row of squares beside the start; a link that
names a mode opens only that mode.** 2026-09-15. Whether THE RACE is its own title is Stephen's (CATALOG-PLAN call 9);
meanwhile a child of four reaches it without reading, and a teacher's `?mode=race` link opens it straight away. The FLAG
door is the plain start for now; its road picture comes with the sprites (P3).

**A square is moved onto by tapping THAT square, or Enter on it; the card turns only when its count is walked.**
2026-09-15. The published game's mechanism is the child's own count along the numbers. A tap anywhere else, the card
again, or a square two ahead, does nothing; no timer, animation or hold moves the traveler (Y2), and the lint cuts every
event listener's body out of `race.js` and fails any call to `step` left behind. With a keyboard, focus goes to the next
square after each step, so one Enter is still one square.

**Speech can never stop a round.** 2026-09-15. A voice the browser refused threw inside the walk's frame and the walk
never arrived. Every call to the speech engine is guarded; the numeral is on the screen either way (Y7).

**A map piece is earned when a run ends: `count` FLAG rounds (10 by default, a teacher's link may ask 20 or 30), or a race
to square 10.** 2026-09-15. The rounds of a run are counted in memory only, so a reload in the middle of a run earns
nothing and no count is ever stored or shown. The map shows over whichever screen ended the run, and go returns to it.
Thirty pieces at most, the first at the east end of the top row and each later one west of it, the handoff's "about thirty
assembling westward"; six pieces repeat in turn (road, field, trees, river, hill, house), cosmetic only.

**The link builder offers YONDER's mode (the road or the squares), the road to start on and the run's length, never the
seed and never MILEPOSTS.** 2026-09-15. MILEPOSTS is served by the routing at a frontier; a link that forced it would
bypass the diagnosis it depends on. The builder's labels name the roads "0 to 10" and so on, no dash.

**YONDER's first page goes live as `20260915b`, and CORE moves to `20260915d` with SPAN following to `20260915h`.**
2026-09-15. `engine.js?v=20260915a` was served once without a page; the page's first deploy takes a fresh stamp so no
cache anywhere holds an older engine under the address the page asks for. CORE moves because the builder's
`schemas.js` changed under its stamp; SPAN moves because its worker names CORE's modules by CORE's stamp.

**The page draws its figures from `sprites.js`: the traveler at scale 3 on four walking frames, the flag at scale 4 inside
CORE's 56 px stone, the signpost at scale 4, the posts at scale 3, the race's traveler and the card's square pips.**
2026-09-15. The P3 shots showed the flag as a red slab four times the traveler's size, the signpost a box on a stick,
and the card's count only as a numeral. The stone stays CORE's touch target; only what is drawn inside it changed. The
truth's post and the road stay CSS rectangles: one flat colour each, nothing a sprite would add. The loop on the first
screen and the road door draw the same flag and traveler, so the picture before play is the picture in play.

**The map is six pieces across and five down, at the largest whole scale that fits the width and the height, on a frame
the colour of old paper.** 2026-09-15. Ten across drew a piece 24 px wide on a phone, and the frame's sky blue was the
river's own water, so every river piece read as a hole.

**The true place is a post and its numeral, shown when the traveler arrives, in one colour on every round.**
2026-09-15. The flag stays where the child put it (rule 1); the truth comes second, where the walk ends (rule 2).
