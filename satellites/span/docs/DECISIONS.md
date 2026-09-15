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

**No number and no blank is ever negative.** 2026-09-15. Subtraction forms put the blank in the subtrahend and on the
right of the sign; a generator that let a result go below zero would ask a six year old for a number they have not met.
The engine gate asserts it across every mode.
