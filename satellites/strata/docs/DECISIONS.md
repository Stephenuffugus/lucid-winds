# STRATA, decided without the Director

One bold line of what, one line of why. Newest last. Everything here was a
question the plan did not answer and the night could not wait on.

---

**An animal has ONE BODY LENGTH and every part of it is a fraction of that.**
The first grammar built the spine at one unit per vertebra and sized everything
hanging on it in absolute units, so an animal's proportions were a function of
how many vertebrae it happened to roll: a skull came out at a tenth of the body
where a real one is a quarter, six ribs stood in for a ribcage, and the
curvature accumulated per vertebra so a long animal curled through two hundred
and eighty degrees. Fifty of them on one sheet were fifty identical centipedes.

**The pose is a choice from five, not a range.** Laid, arched, curled, reared,
slumped, each with its own narrow curl, neck lift and tail carriage. Drawn from
one wide range, almost every animal landed in the middle of it and the second
variety sheet was forty six prawns.

**A neck is straightened until the head stands clear of the ribcage.**
A bounded loop, six tries, halving the lift each time. A skull among the ribs is
a skeleton nobody can read.

**Nothing is done to the rock over a bone.** The first build softened it so the
brush could finish the job, and the painter maps density to colour, so every
skeleton showed through the cliff as a pale patch before a brush had touched it.
The chisel is what deep hard rock is for.

**A tool takes rock off per unit of TRAVEL and per second of REST, and the
amount is divided by the integral of its own falloff.** A cell only sits under
the centre of a tool for an instant; over a whole pass it receives four thirds
of the radius, not two of them, and dividing by the tool's width made one pass
take off two thirds of the rate it promised.

**The pressure meter is charged in the frame loop, by the wall clock.**
Charged per pointermove it measured MOVE EVENTS, and a finger held perfectly
still on a bone generates none at all, so the one rule the chisel exists for
was inverted in the shipped game while every headless assertion passed.

**A trace STARTS on a freed bone.** Without that, every brush stroke that ran
along one lifted it, so cleaning around a rib kept pulling it out of the ground
and the plaster jacket gesture the design asks for was not a gesture at all.

**A trace lifts the bone it FOLLOWED, ranked by how close it ran, weighted by
distance.** A site's bones are around thirty cells long and a finger's tolerance
is twelve, so a binary "was the stroke within tolerance" says yes to three bones
at once and the wrong one comes out.

**MOUNTING IS WHAT UNDOES THE SCATTER.** The ground moves a fifth of the bones
two to six cells; putting one on the armature puts it back where it belongs,
which is the difference between a crate of bones and a specimen.

**A tray tile is drawn at a shared measure taken two thirds of the way up the
range of bone sizes, with anything bigger clamped to its tile.** Sized to itself,
a rib, a vertebra and a skull are the same rounded rectangle; sized to the
largest bone, the ribs are three pixel specks.

**The share link carries a SEED, not a skeleton.** Seventy one characters. The
bones, the name and the history are regenerated on the other phone, so nothing
anybody sends can smuggle in an animal this game did not make; and what the link
does add, a name and a condition, is cleaned on the way in, because a stranger's
link is stranger data.

**Depth is the progression and there is no experience bar.** A deeper site opens
by having mounted two, five and nine animals, and a deeper site draws from older
bands, which the grammar already reads as stranger plans, bigger sizes and more
ornament. Nothing else changes.

**A dedication is never title cased and never corrected.** It is a nine year
old's spelling of somebody they love. It is stripped to letters and spaces,
capped at twenty four, and otherwise left exactly as it was typed.

**2026-09-06 (Opus) — the field journal, and the save whitelist that swallowed its counters.**
The menu's JOURNAL button toasted "the journal opens in the next session", which is a promise
the game made to the player and did not keep. It opens now: specimens mounted, sites opened,
bones lifted, the deepest cut in words, and FIRST OF ITS KIND, the earliest specimen in the
museum built on each of the four body plans, regenerated from its seed with the same `species`
call the plinth and the plate make, so the journal cannot name an animal the museum does not
hold. With nothing mounted every plan reads "not met yet" rather than leaving the rows blank.

⛔ The counters were added to the blank save and incremented in `newSite` and on a lift, and
they still read zero on the page. `saveNow` rebuilds the save from what is on disk and copies a
WHITELIST of fields over it, which is what makes two tabs safe; a field that is not named there
is written and dropped in the same call. `sites`, `bones` and `deepest` are on the list now and
merge upward like `unlocked`, so two tabs cannot lose a count either. The layout gate caught it:
it presses DIG once, so a zero in the sites row can only mean the field never reached the disk,
and that is the assertion it now carries.

⛔ The shared `.screen` rule centres its column with two auto margin flex items, which is right
for a short stack of buttons and wrong for a page of rows: the journal floated in the middle of
the paper with two hundred pixels empty above and below it. `#scrJournal::before` and `::after`
drop those margins, so the journal starts at the top and runs down, like a page.

The empty case is proved in `test/layout.mjs`, which mounts nothing, and the named case in
`test/share.mjs`, which puts a real specimen on a plinth by link first. Splitting them that way
means neither assertion can pass on a walk that never produced the thing it is about.

**D-C7 (2026-09-07, Opus) — the animal you dug is the animal you keep.** At depth one and deeper,
forty two percent of sites carry TWO specimens, and `stroke` and `tryExtract` loop over every one
of them, so the deeper animal's bones really do come free under the brush. But `refreshChrome`,
the site chip, `openMount`, `openNameSheet` and `keepSpecimen` all read `specimens[0]` and nothing
else. The consequences, all of them real:
- the chip counted "N of M lifted" against the FIRST animal's bone count while `G.lifted` counted
  every bone freed anywhere on the site, so a two animal site could read "19 of 14 lifted",
- the MOUNT button was gated on the first animal's state, so a player who dug only the deeper one
  was never offered a mount,
- and every bone lifted off the second animal was thrown away when the next site opened.
**A skeleton you can dig and can never mount.** `activeSpec` is the animal you have got the most
of, ties to the shallower one because that is the one you meet first, and the chip counts off
that specimen's own state rather than off a running total so the two cannot drift apart.
⛔ THIS DOES NOT LET YOU MOUNT BOTH FROM ONE SITE. That would be a new system and it is Stephen's
call; this makes the one you dug the one you keep.
⛔ AND THE GATE THAT EXISTED ASKED THE WRONG QUESTION. `sim.js --test` already asserted that a
deep site holds two animals and that the older one lies UNDER the younger one, which is about
where they are PLACED. Nothing asked whether the second one could ever be lifted out and mounted.
Four assertions now do, and putting `activeSpec` back to `specimens[0]` turns three of them red.

**The brush answers now, and the number that says so.** 2026-09-07. The morning
report had carried "the feedback for the first gesture is quiet on a phone in daylight" as prose
for a week. Measured: a real 128 pixel brush stroke changed **0.31 percent of the screen** by more
than twelve levels. It is 1.75 now, and the two halves are separate faults.
**The dust was one grain wide and one colour.** A single pale tone vanishes on the pale bands and a
single dark one vanishes on the dark, and this cliff runs from cream to near black, so a cloud of
one colour is invisible over half of wherever the player is digging. Grains up to three across, two
tones, longer lived, and more of them for the brush, which moves the least rock and needs the most
to look at.
⛔ **AND THE CLIFF'S OWN RENDER WAS HIDING THE DIG.** `k = clamp(den / 0.62)` appeared twice in
`paintCliff` and saturated at a density **sixty one percent of a fresh cliff sits above**; nearly a
third of it (29.5 percent) sits above 0.77, where one stroke's worth of removal leaves the cell
still above 0.62 and **the colour did not move at all**. `CONFIG.DEN_FULL` is 0.90, just above
anything the generator makes, so full rock is still its band's colour to within two percent.
Looked at afterwards at 412x915: the cliff still reads as banded rock and has not washed out.
⛔ **THE GATE FOR IT TOOK FOUR TRIES AND THE FIRST THREE COULD NOT FAIL.** One number over a whole
stroke read 2.93 working, 2.08 with the clamp back and 1.85 with the dust off: both faults cleared
the floor. Split in two (the frame during the stroke against the settled one for the dust, the
frame before against the settled one for the rock) it caught the dust but still not the clamp. A
`scrub` hook that takes a known amount off a known patch read 5.15 against 5.47, because a cell at
0.68 drops below 0.62 either way. Only when the patch is the rock the clamp actually hid, every
cell above 0.75, does it separate: **0.00 percent against 20.87.**

**The crate is one tile per KIND of bone.** 2026-09-07, Director call 15, the
less invasive of the two options he was offered. Fifty one bones in one scrolling row shows six at
a time, so ALL was the only sensible way to use it and the drag was a decoration, which is what he
said. It is six tiles now, vertebra 27, rib 12, skull 1, jaw 1, leg 6, arm 4, and a tap or a drag
takes the next one of that kind.
**Every tile keeps `data-bone`** pointing at the next unplaced bone of its kind, so every tap, drag
and gate that already knew how to work a tray goes on working without knowing the tray changed.
⛔ **`refreshMount` RELABELLED the tray instead of repainting it**, toggling each tile spent by the
bone id written on it. That was right when a tile was a bone; with a tile as a kind it greyed out
twenty six vertebrae that were still in the crate. The gate caught it in the note it prints:
`vertebra:27 (spent)`.
⛔ **And 58 px tiles with an 8 px gap put the sixth kind half off a 375 screen**, which is the same
"scroll to see your own crate" the grouping was for. 52 and 6 fits six kinds in 342 px, still a 48
px target by a wide margin, and there is an assertion that the row does not scroll.
⛔ **Two of my own assertions had a `!now ||` escape** that let a MISSING tile count as a pass, and
a missing tile was exactly the fault.
⛔ **Two more counts went red over a working game**: the mount gate walked a list of bone ids and
threw "no tile for bone 27" at the first rib that was not the first rib, and the layout gate asked
for more than ten tiles at five sizes.
