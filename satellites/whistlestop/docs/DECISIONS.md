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

**A single switch in a ring is always met facing from the same side, so Round and Round cannot forbid an early flip.**
The train arrives at the stem every lap; the two fork ends both lead back to the
stem, so a train that enters the ring from a spur meets the switch trailing for
ever and never gets a choice. The puzzle therefore starts with the lever set
for the ring and the train already on it; the lever thrown before the whistle
also wins, and the sim only proves the thrown at a moment solution and that
doing nothing circles for ever. Forcing the moment needs a second train or a
buffer on the spur, which is the Director's call.

**Swap is not a dead end siding.** A train that backs into a siding comes out of
it heading back where it came from, and the other train's station is there.
The passing loop is the only two switch shape in the piece set that lets two
trains change ends without one of them stopping, so Swap was not built on a
siding and stays as data in the plan.

**The train at fault in a bump is the one that was moving.** The sim records it
on the clonk event before it stops the train, and the name flag says "bumped"
with a pink tint from then until the restart. Two moving trains are both at
fault, which is true.

**In portrait the whistle hangs on the tray's bottom right corner.** It used to
sit alone on the floor strip under the tray. A first fix moved the tray left to
leave the whistle the thumb corner, and that put a rug piece under the tray at
375x667, so it was reverted unshot. The tray stays where it was; the whistle's
centre sits 8 px inside the tray card's bottom right corner, over the card's
border, so it belongs to the tray. The bottom row is three tiles centred, which
leaves that corner clear of every tile at 375 and 412 wide, and the bottom left
120 by 120 is still the music chip's. Without a tray (a puzzle) the whistle is
the thumb corner, as on a phone on its side.

**Upright, the rug runs past every edge of the screen.** It used to stop at 82%
of the height with its sides already off the screen, so on a tall phone it read
as a horizontal band with a hundred pixels of floor between the loop and the
tray. The tall screen's spare height cannot go to the loop, because upright the
fit is bound by the width and by the scenery beside the railway, so it goes to
the rug: the room is drawn closer and the tray and the whistle sit on wool. The
title keeps its own rug, which fades to dark under the railway.

**A name flag that would land on another goes up a row.** In a head on bump the
two engines stand a body apart and both flags said 'bumped' on the same spot,
so only one showed. The second is drawn 22 px higher on a longer stem. The stem
of the upper flag still crosses the lower one, which is the next thing to fix.

**After the crossing the red line bends down.** With both lines running straight
on, Red's station and Blue's sat sixty pixels apart on the same side and the two
destinations read as one neighbourhood. Red now runs two straights, a right
curve and a straight after the crossing, so Red goes right and down while Blue
goes up. Every piece index after 11 moved by one; the solver still finds three
stars in 6.73 s and the half solution still bumps.
