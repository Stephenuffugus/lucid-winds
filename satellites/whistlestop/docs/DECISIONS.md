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
so only one showed. The second is drawn 22 px higher on a longer stem, and
every stem is drawn before every flag, so the longer stem passes under the
lower flag rather than through its word.

**After the crossing the red line bends down.** With both lines running straight
on, Red's station and Blue's sat sixty pixels apart on the same side and the two
destinations read as one neighbourhood. Red now runs two straights, a right
curve and two straights after the crossing, so Red goes right and down while Blue
goes up. Every piece index after 11 moved by one; the solver still finds three
stars in 6.73 s and the half solution still bumps.

**Swap is the passing loop with a third switch under it, and its par is two.**
The plan asked for four. Every constant lever setting was searched and two
flips is the floor, so two is what the card says: a par a player can beat by
doing less is a lie about the puzzle. Either of the loop's two switches is a
minimal first flip, because either train may be the one that takes the loop,
and the third switch chooses Red's station over a short dead end curve so that
getting past each other is not the whole job. A fourth switch with its own
spur above the loop was built, measured and thrown away: no solution needed it,
and a switch the answer never touches is scenery with a lever on it. Leave
every lever alone and the two trains meet nose to nose on the single line.

**Swap's two termini swing out, and that is what stops it being a thread.**
The spine (two switches, a passing loop, a third switch, two buffers) measured
3.3 U wide by 15 tall, and on a 375 wide phone that is a railway a hundred
pixels across with a hand of empty wool either side of it. Two curves at each
end turn the line through ninety degrees in opposite directions and the
footprint becomes 7.7 by 18.7, which is 2.43 to one and inside the rule three
entries above. It also reads as a railway rather than a diagram: a straight run
with a station swung out at each end of it, in opposite corners of the rug.

**Every open end gets a buffer stop drawn on it, not just the ends with a station.**
To the sim every open end IS a buffer: a train that reaches one turns round and
comes back, and there are two assertions on exactly that. Only station ends were
ever drawn with a stop, so a dead end siding was a length of track that stopped
in the middle of the rug for no reason a child could see, and Swap's whole trap
looked like an unfinished piece. Six of the six puzzles had at least one bare
end and The Crossing had four. The rug must not lie about the rails.

**D-C5 (2026-09-07, Opus) — every prop group has a reason, written down, and the things with a
reason turn to look at the railway.** Grouping was already here and it was not enough: the Sep 06
night shot showed a house, a tower and two bushes twenty pixels off the loop's top left and a
lone tree a hundred and sixty pixels away on its own, with nothing facing anything.
- `PROP_GROUPS` carries a `why` sentence per group, a `near` that says how close to the line the
  reason puts it, and a `faces` that says whether the thing turns to it. A yard is beside the
  line BECAUSE the line is why it is there. A cow looks up at the train, which is the whole
  reason there is a cow. A copse is what is left where nobody built, so it stands back.
- `trackSideOf` gives each facing member a mirror, so a cow never has its back to the trains and
  a house never has its back to the track.

**D-C5b (2026-09-07, Opus) — nothing stands inside the railway, and the scenery moves when the
railway grows over it.** On the thin list as "the cow and two bushes stand INSIDE the loop where
the cars sweep past", and it was the clearest case of a prop with no reason: the space a loop
encloses belongs to the puzzle.
⛔ AND IT WAS NOT A PLACEMENT BUG, IT WAS A STALENESS BUG. The scenery is laid once, the first
time there is a railway worth decorating, and then it stays put for the life of the rug, which is
right: scenery that jumped every time a piece went down would be unreadable to build beside. But
laid once and NEVER AGAIN, a loop built around a cow leaves the cow in the middle of it for good,
and that is exactly how the shot tool produced the picture every time, because it lays the
scenery and then builds a loop round it. `propsSwallowed` re lays only when a prop now stands
inside the railway's footprint or on the track. Still while you build beside it, moved when you
build over it.
⛔ AND THE CAMERA REFITS FIRST. Laid before the fit, the scenery is measured against the frame the
OLD railway had while the camera pulls back for the new one immediately afterwards, and the cow
came out half off the left edge: the same "one prop lands off the frame" fault the layout gate
caught on Sep 06 night, arriving by a different door.

**D-C6 (2026-09-07, Opus) — the two spurs stop rhyming, and Swap's lower two levers stop reading
as one.** Both were the last two lines of the Sep 06 look pass.
- **The Crossing's spurs were mirror images at the same forty five degrees**, because both lines
  carried a `yR` in the same place: two problems that look like one problem seen twice. Blue's
  switch is a `yL` now, so the two lines diverge instead of rhyming. It costs no index, because a
  yL is a yR's own reflection, and `--solve` still gives three flips, 6.73 s and three stars with
  nothing at all still never getting home.
- **Swap's station switch stood one tile below the loop's lower switch**, about thirty screen
  pixels, and the look pass read the two lever dots as one cluster: a puzzle asking a child to
  tell apart two things it has drawn as one thing. Two straights between them now, about forty
  six pixels at 412, which is wider than the tap radius so the two are separately reachable as
  well as separately readable. Every index past ten moved by one and the stations, the levers,
  the trains, both `from` cursors and the solution moved with it; `--solve` still gives two flips
  and three stars, home at 9.95 s where it was 9.53, and nothing at all still bumps.

**D-C6b (2026-09-07, Opus) — the camera reads the answer off the puzzle now.** `tools/shots.mjs`
had the literals 2 and 11 typed into it for Swap's two flips, and the moment Swap grew a tile
piece 11 became a straight, `g.junctions[...]` came back undefined and the tool died with "Cannot
set properties of undefined". A camera that hardcodes a puzzle's internals breaks on the day the
puzzle is edited, which is the day somebody most wants to look at it. It walks
`state().puzzle.solution` instead, so it cannot drift again.
