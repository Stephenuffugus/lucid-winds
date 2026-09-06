# WHISTLESTOP, decided without the Director

One bold line of what, one line of why. Newest last. Everything here was a
question the plan did not answer and the night could not wait on.

---

**The consist is rigid, and it is rigid because nothing about it is recomputed.**
Every body sits at `p - i * CAR_SPACING` along the route the engine actually
recorded, and reversing flips the sign of travel rather than moving anything. A
model that pushes samples into a history and reads them back folds the train up
like a concertina at every buffer, because the cars go on toward the buffer while
the engine is already leaving it.

**A facing switch ahead of the train is re-derived from the lever; a trailing one is never.**
That is what a real switch does, and it is also the whole of the second puzzle:
a train that backs into a siding comes out of it through the switch trailing, so
the lever cannot touch it, and then comes back at the switch facing, so the lever
decides. Both rules fall out of one route model rather than being bolted on.

**A crossing is deliberately two railways.** Its two lines share a piece and no
joint, so `components()` on a layout with a crossing counts two, and the puzzle
data says so with a `rails` field rather than the gate assuming one.

**Two lengths of track count as one place for a bump if they share a joint, or if their PIECES do.**
Without the second clause a train held a hand's width short of a crossing is
invisible to the train coming through it, because the piece it waits on and the
line that crosses share no joint of their own. Two rings laid side by side on the
rug still cannot stop each other, and there is an assertion that puts one train on
each ring at their nearest points to prove it.

**Opening a shared rug REPLAYS the build, snapping each piece as it lands.**
The link stores each piece on a twentieth of a unit grid, which is wider than a
closed joint, so a rug rebuilt from the numbers alone keeps every count and every
loop and yet stands open at every single joint. Re-snapping costs nothing and it
is the same code path the thumb uses.

**`MERGE_EPS` is 0.12 U, wider than the link's grid on purpose.** Rebuilding the
graph has to tolerate the rounding a link introduces; the nearest two distinct
ends can ever be in this piece set is half a unit, so there is a lot of room.

**Turning round at a buffer is not a stop.** The third star asks that no train
was ever held, and a buffer is part of the track, not a failure. A collision and
the player's own stop are the two things that lose it.

**A puzzle is authored no wider than about two and a half to one.**
The first draft of the first puzzle ran ten units wide and under two tall, and on
a phone held upright the whole railway was a thread across an empty rug. The two
arms now go up and down. The camera still fits the whole layout, because a puzzle
you cannot see is not a puzzle, and the player can pinch to get closer.

**The tap radius on a lever or a train drawn into the canvas is 26 CSS px.**
That is a 52 px target, over the studio's 48, and it is measured in screen pixels
rather than world units so that zooming out never shrinks a control below the law.
