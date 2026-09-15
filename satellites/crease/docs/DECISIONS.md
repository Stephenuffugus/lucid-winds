# CREASE decisions log

Every choice the build made that the CREASE handoff, `plans/math/CATALOG-PLAN.md` and `plans/crease/HANDOFF-CREASE.md` did
not make for it, newest last, one bold line of what and the why.

**Every bank item carries the lowest grade whose CCSS denominators admit it: 3, 4 or `extended`.** 2026-09-15. Grade 3 is
{2, 3, 4, 6, 8} (C7), grade 4 is {2, 3, 4, 5, 6, 8, 10, 12, 100}. Eleven of the handoff's seed items fall outside grade 3, six
outside grade 4 too (2/9, 4/9, 5/9, 6/9, 6/11, 7/15), checked by a script. They stay in the bank, tagged, and a run serves
only items at or under its grade. Each tag gains grade 3 items so none is empty at grade 3.

**CREASE mode folds each whole into one to twelve equal parts, with two controls, fold again and unfold once.**
2026-09-15. Twelve is the largest denominator grade 4 uses on a strip (100 is left to the bank); one part is no fold. A
fold applies to every whole on the strip at once, so a strip from 0 to 3 folded into quarters has twelve parts and its
whole ends stay marked. The clip snaps to the parts through CORE's `snap` (plans/crease/HANDOFF-CREASE.md 3.6), by drag
and by keys, one key press one part. The controls sit in the controls row's left place, so next keeps its own place and
nothing a thumb just used moves when next appears.

**At the commit the child's folds are cleared and the reveal draws the truth's creases.** 2026-09-15. The folds are the
child's answer to "how many parts"; the reveal's creases, into the true denominator, are the truth. Leaving the child's
folds under the truth's would draw two partitions at once on a strip whose lesson is one. No crease carries a label
before the reveal (C8).

**`trap` takes the bank's six tag names exactly.** 2026-09-15. The handoff's `Task.trap` said `unit-fraction-inversion`
and its tag list, which BRIM depends on, says `unit-inversion`; the tag list wins.

**HALFWAY deals no exact half until "exactly half" is on the screen.** 2026-09-15. The first HALFWAY gate went red on its
streak law: seed 4242 dealt 1/2 as its fifth round and 3/6 as its sixth, before the streak, when the only buttons were less
and more. A child playing perfectly could not answer them, and each one broke the streak of five that brings exactly half.
The page sets `halfOpen` in the engine's state before each round; closed, the deal's exact half share goes to the near
halves, and a built fraction that lands on a half is built again. Engine law 10 now runs both ways on 20 seeds.
