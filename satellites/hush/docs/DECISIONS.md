# HUSH decisions (the smallest reasonable choice, logged; plans/hush/HANDOFF-HUSH.md section 14)

- **2026-09-16, the no-go count.** `floor(n * 9 / 40)` at easy and `n / 5` at hard, not `round(n * 0.225)`: at 60 trials the
  rounded count is 14, which leaves four spare go trials over fifteen gaps and a no-go straight after three go 0.78 of the
  time (plan 3.2).
- **2026-09-16, P1 reads its link directly.** `seed`, `count` (40, 60, 80) and `fork` (quick, careful) come from
  `URLSearchParams` in `main.js` until P3 brings `config.js` and the link builder's entry; the default fork is Careful until the
  picture fork (P2) asks.
- **2026-09-16, one trial, one sound, in a helper.** The lint's loop law (GLIMPSE's GL2, kept) reads where a sound is written,
  not how often it plays, and a trial loop is a loop. The step or snap is chosen in `voice()`, called once per trial; the law
  still catches any sound written inside a loop's body.
- **2026-09-16, the deer only in P1.** The hare and the fox come in P3 with the living clearing (plan 3.10).
- **2026-09-16, the settle leaves the creature where it is until go on.** After the settle the next run begins at zero steps
  with the same creature; the clearing that keeps it is P3's.
- **2026-09-16, sprites from a drawing.** `tools/deer.mjs` rasterises one deer at six sizes and four poses and writes the rows
  into `sprites.js` as literals, so every tier is the same creature and the lint's literal rows law holds. Faults named from the
  preview and accepted for v1: tier 0's raised head is a few pixels, the grazing neck at tiers 4 and 5 is a long ramp.
