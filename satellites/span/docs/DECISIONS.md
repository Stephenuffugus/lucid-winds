# SPAN decisions log

Every choice the build made that the SPAN handoff, `plans/math/CATALOG-PLAN.md` and `plans/span/HANDOFF-SPAN.md` did
not make for it, newest last, one bold line of what and the why.

**A standard equation is one with an operation on the left and a single term on the right.** 2026-09-15. The handoff
counts "standard" against "nonstandard" for S1 and also lists nine blank positions for S2, and the two lists overlap:
`a − __ = c` and `__ − b = c` are among the nine but are laid out the way school lays out a sum. S1 is about the layout a
child has been taught to read as "do this and write the result", so standard means that layout wherever the blank sits,
and the handoff's first item `3 + __ = 5` is standard, as its section 7 implies by calling the second item the
nonstandard one. S2's nine positions are asserted as positions, separately.

**A near miss is a false equation whose two sides are one apart.** 2026-09-15. S4 wants false items that look balanced
so a child has to evaluate rather than glance. The handoff's example, `8 + 4 = 13 + 5`, has sides twelve and eighteen,
six apart, which does not look balanced; one apart (`8 + 4 = 6 + 7`) does, and it is a property a gate can check from the
terms alone. The engine gate recomputes it rather than reading a flag.

**Only the blank's pier takes stones, a drag adds one and a long press adds a stack of five.** 2026-09-15. The
handoff has stones snap to a pier and a long press yield a stack of five; SPAN's Mode 2 is about what goes in the blank,
so the pier that holds the blank is the only one a stone can join. By keyboard, arrow up and down add and take away a
stone on that pier and Enter lays the span; a digit key does nothing (S5).

**A pier stands at a base plus its side's value times one unit, and the page declares both.** 2026-09-15. The unit is
chosen per item so the taller side fits the canyon; `#canyon` carries `data-base` and `data-unit`, so the play gate can
hold every pier and the shortfall to the values the engine computes in Node, not to numbers the page reports about
itself.

**A caption states the two sides, never a verdict.** 2026-09-15. When the sides match it says so in the handoff's own
words ("8 + 4 is the same as 7 + 5"); when they do not it names both values ("8 + 4 is 12 and 12 + 5 is 17"). The
language rules (S7) forbid answer, solve and equals; the reveal contract forbids a verdict. Nothing else is said.

**While a child builds, both piers stand at one neutral height and the stones sit in a labelled stack.** 2026-09-15.
The reveal contract puts the child's mark first and the truth second. The first page grew the piers with every stone and
laid the span flat on them before the child laid it, so the build already showed which count levels them and the reveal
had nothing left to show (seen in the first shots, green in every gate). Now the piers stand at half the canyon until the
span is laid, the stones sit on the blank's pier as one stone with its count on it (the numeral on the object, as handoff
step 6 draws large values), and the span is not drawn until the child lays it. A play law holds it.

**A tilted span turns about its end on the taller pier and dips toward the lower one, at most 4 degrees and never into
it.** 2026-09-15. A beam whose far end fell all the way to the lower pier would tip forty degrees on a wildly wrong fill
and cover the shortfall the reveal exists to show. So the end on the taller pier stays where it rests and the other end
dips as far as the lower pier or 4 degrees, whichever is less. The first page turned the span about its middle the wrong
way (the flag right, the drawing backwards); the play law now reads the drawn corners.

**The seat is the same on every path: the last inch in 200 ms, dust for 550 ms more.** 2026-09-15. Handoff step 1's
seat, for a stone put on the stack and for the span laid; the play gate lays a right round's seat over a wrong round's.
With reduced motion there is no lift and no dust.

**The taller pier leaves room for the caption, however many lines it takes.** 2026-09-15. A caption stating two sides of
two digit subtraction can wrap at 320 px; the unit is chosen after the caption is written, so the span never meets it.

**The canyon grows with the screen, 280 to 420 px tall.** 2026-09-15. At 1366x768 the first page left the canyon a strip
in the middle of a classroom screen. Half the viewport height, clamped.

**The first run loop has no mason yet.** 2026-09-15. The handoff's loop ends with a mason walking across; the mason is a
sprite and SPAN's sprites are P3's sheet. The loop has the rest: uneven piers, the span tilting and sliding off, a stone
dropped on the short pier, the span coming down flat.

**The mode is a teacher's link key, `?mode=blank|judge|relational`, blank by default.** 2026-09-15. The config
builder's draft schema already offers those three values. How a run moves from one mode to the next without a link is the
viaduct's step (P2), where a completed run is known.

**TRUE OR NOT is two choices, and the span is laid on either.** 2026-09-15. Mode 1 has no blank and nothing to build,
so the stone supply and the lay control are not shown; two buttons take their place, one drawn as a flat span on even
piers ("The same") and one as a tilted span on uneven piers ("Not the same"). The choice tapped is marked at once and
stays marked through the reveal (the contract's rule 1: the child's mark first, never taken away), the mark one look on
every path (rule 6), and then the span goes down and the piers move to their true heights exactly as in Mode 2: flat
when the sides are the same, dipping when they are not, whatever was chosen.

**A side that is one number is named once in a caption.** 2026-09-15. "9 is 9 and 6 + 2 is 8" says a number is itself;
TRUE OR NOT's `a=c` and `a+b=c` items and Mode 2's `_=c+d` make that caption often. A single number side is written
"One side is 9" when it comes first and "the other side is 9" when it comes second, which keeps both values, states a
fact and prefers neither side (S8).

**RELATIONAL's supply is three sources, a stone 1, a slab 10 and a block 100, each with its numeral on it.**
2026-09-15. Handoff step 6: nobody drags 345 stones. Each source is a 56 px target a child drags to the blank's pier, and
a long press on one adds five of it, so any three digit fill takes at most fifteen actions (a long press and four
drags per digit). The numeral is on the object, so the quantity is never a count of pieces a child must keep in their
head. THE BLANK keeps its single stone, whose numbers stay small.

**By keys, a slab is Shift and arrow up and a block is Page Up.** 2026-09-15. The handoff gives arrow up and down for a
stone; a three digit fill by arrows alone is hundreds of presses. Shift with the arrows moves a slab, Page Up and Page
Down a block, in every mode. A digit still does nothing (S5).

**At 320 px RELATIONAL's supply takes its own row.** 2026-09-15. Three 56 px sources beside the lay control and next
need 336 px, and a 320 screen has 296 inside the page's margins; below 360 px the sources sit on a row of their own over
the lay control and next. The page's top and bottom margins shrink on screens under 600 px tall so the second row
still fits without scrolling.

**RELATIONAL's equation is set smaller, and a side is never split across lines.** 2026-09-15. Five three digit numbers
at THE BLANK's size need about 460 px; the first RELATIONAL shots broke "681 + 585" across two lines, and at 320x568 the
second line pushed the lay control under the bottom of the screen. The equation's two sides are now each one unbreakable
group, and RELATIONAL sets them at the next size down (the smallest at under 360 px wide), so the equation holds one
line on every phone and wraps, if ever, only at the sign.

**A run is `count` items, and one arch is earned per run played through, thirty at most.** 2026-09-15. The handoff
gives one arch a session and about thirty assembling into a viaduct. SPAN has no clock-bound session, so a session is a
run: the arch is added through `collectOnce` and CORE's store only when the last item's next is tapped, never on a
reload, and the thirtieth completes the viaduct. The arches recede, each a little narrower and hazier than the one
before, so the latest is the furthest into the haze.

**After a run, the next one plays the next mode on the next seed; a teacher's `?mode=` holds its mode.** 2026-09-15.
THE BLANK, then TRUE OR NOT, then RELATIONAL, then round again, each on the seed after the last, so a child meets all
three modes by playing on. A link that names a mode is a teacher's choice for the class and is kept run after run.
Nothing about the order depends on right or wrong.

**The screener measures and does not teach: no reveal, no mark, nothing kept.** 2026-09-15. The screener
(`satellites/span/screen/`, CATALOG-PLAN section 1, HANDOFF-SPAN 3.5) is TRUE OR NOT's ten items on one link's seed, so
every device in a class sees the same ten. A choice moves straight to the next item: a reveal would teach the relation
in the middle of measuring it. Three minutes by default, `?minutes=` from 1 to 10 for a teacher, ended by CORE's
`sessionStep` with time handed in. Nothing is written to storage and nothing is sent (G1, G2); a reload is a fresh
screener.

**The teacher's result waits behind a two second hold.** 2026-09-15. The result is for the teacher on the device and
nowhere else, and a child is holding that device when the tenth item is chosen. The end screen shows no score; pressing
and holding the teacher's control for two seconds (or holding Enter on it) shows three lines: "Correct: 7 of 10",
"Nonstandard correct: 4 of 6" (the nonstandard items are where the operational reading fails, which is what the
screener is for) and "Reached: 10 of 10". The words are plain teacher words; none is a word S7 refuses.

**A run's length is a choice of whole blocks of five, 5 to 40, and 20 by default in the builder and the page alike.**
2026-09-15. S1 lays kinds in blocks of five so every run is exactly 40 percent standard, and the page rounded any other
count to the nearest five, so a builder link for 12 played 10. The count is now a choice of 5, 10, ... 40 in both
schemas, and both default to 20 (the draft builder said 10, the page 20, and the builder leaves a default out of the
link, so its 10 played 20). One schema file, `satellites/span/config.js`, is what both SPAN pages parse; the builder's
entry is held equal to it by `test/config.mjs`.

**The screener has its own entry in the teacher's link builder.** 2026-09-15. A teacher who wants the whole class on
the same ten items for a set time needs a link as much as one who wants a practice run: the builder lists "Span
screener" with its minutes, going to `span/screen/`. The seed is not offered in either entry; the default seed already
puts every device on one link on the same items.

**One service worker for the game and its screener, and it gives up on a silent network after 4 seconds.**
2026-09-15. CATALOG-PLAN D2: each game its own `sw.js`, the CORE files precached with it. SPAN's lives in the game's
folder with that folder as its scope, so the screener at `screen/` is covered by the same worker. A navigation goes to
the network first and falls back to the cache; so does anything not yet cached. The fleet's workers wait 8 seconds for
a network that accepts and never answers; a class of six year olds staring at a blank screen for 8 seconds is a lost
lesson, so SPAN waits 4. Nothing not in the cache is ever left pending.

**The icons are drawn in code: two piers and a flat span on the canyon's colours.** 2026-09-15. No painted art exists
for SPAN and painted art is Stephen's; the icon is the game's one rule in one picture, rendered by `tools/icons.mjs`, the
maskable one inside the launcher's safe circle. The manifest's name is the working title, Span (the name is Stephen's
call; the manifest changes with it).

**No number and no blank is ever negative.** 2026-09-15. Subtraction forms put the blank in the subtrahend and on the
right of the sign; a generator that let a result go below zero would ask a six year old for a number they have not met.
The engine gate asserts it across every mode.
