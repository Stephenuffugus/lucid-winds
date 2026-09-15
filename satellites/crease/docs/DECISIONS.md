# CREASE decisions log

Every choice the build made that the CREASE handoff, `plans/math/CATALOG-PLAN.md` and `plans/crease/HANDOFF-CREASE.md` did
not make for it, newest last, one bold line of what and the why.

**Every bank item carries the lowest grade whose CCSS denominators admit it: 3, 4 or `extended`.** 2026-09-15. Grade 3 is
{2, 3, 4, 6, 8} (C7), grade 4 is {2, 3, 4, 5, 6, 8, 10, 12, 100}. Eleven of the handoff's seed items fall outside grade 3, six
outside grade 4 too (2/9, 4/9, 5/9, 6/9, 6/11, 7/15), checked by a script. They stay in the bank, tagged, and a run serves
only items at or under its grade. Each tag gains grade 3 items so none is empty at grade 3.

**`trap` takes the bank's six tag names exactly.** 2026-09-15. The handoff's `Task.trap` said `unit-fraction-inversion`
and its tag list, which BRIM depends on, says `unit-inversion`; the tag list wins.
