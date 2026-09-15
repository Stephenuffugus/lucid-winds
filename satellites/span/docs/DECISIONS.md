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

**No number and no blank is ever negative.** 2026-09-15. Subtraction forms put the blank in the subtrahend and on the
right of the sign; a generator that let a result go below zero would ask a six year old for a number they have not met.
The engine gate asserts it across every mode.
