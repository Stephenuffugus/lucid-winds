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
- **2026-09-16, the fork is a setting.** The picture fork writes CORE's settings record (`quick`), so the settings panel's
  Quick switch and the child's first choice are one value; a teacher's `fork=` link wins over both and never asks.
- **2026-09-16, SIMON shows words and a voice, no pictures yet.** The handoff asks for a command and a picture; twelve
  command pictures are art, and SIMON is for a room led by an adult who reads. v1 shows the command large and speaks it when
  Sound is on; pictures per command are a later sheet.
- **2026-09-16, SIMON's order.** "Hush says" takes H1's easy share with three before every other command, the same law as
  STEP's order (the handoff does not give SIMON a ratio; H1 is the task's own).
- **2026-09-16, sprites from a drawing.** `tools/deer.mjs` rasterises one deer at six sizes and four poses and writes the rows
  into `sprites.js` as literals, so every tier is the same creature and the lint's literal rows law holds. Faults named from the
  preview and accepted for v1: tier 0's raised head is a few pixels, the grazing neck at tiers 4 and 5 is a long ramp.

- 2026-09-15 night **One species an approach, not one a run.** 3.10 says "one per run in turn", but an approach carries its steps
  across runs (3.5) and a creature that changed from a deer to a fox between two runs of one approach would be a different
  creature half way to it. The species turns after each settle: deer, hare, fox, kept on the device as the count of settles.
- 2026-09-15 night **The three species share the palette's coat indices.** The lint holds the sprite table to sixteen colours and
  every index was in use, so the hare and the fox reuse indices 4, 5 and 6 (the dark, the coat, the belly) and `COATS` swaps them at
  draw time. The fox's coat is russet at about 23 degrees of hue, outside the art law's red band of 345 to 15.
- 2026-09-15 night **The link's fork is `child`, `quick` or `careful`.** A builder value must read back through the page's schema as
  exactly itself, so "no fork named" is a value (`child`, the default: each child chooses) rather than an absent key.
- 2026-09-15 night **A gate may seed where an approach stands, never what it asserts.** A settle takes eighteen right trials; twenty
  four of them would take hours under the lock. The clearing's gate seeds the kept steps near a settle (the approach's position, a
  precondition) and then earns every creature by play; it never writes the collection it counts.
