# Super Slice 3D, Part F review (v6.9 to v7.2), Fable, 24 Oct 2026

Part F shipped on the suite, fail watches and the builder's own looks, with no second pair of eyes. This is the second
pair. Method: every builder number was rerun, not read (`tools/slice-3d-tests/f4/earn.js`, `f3/steer.js`, a new
`f4/noinput.js`), the source of each change was read, the films and ground frames from the build session were looked at
again. The full 30 minute suite was NOT rerun: it ran green on the exact deployed bytes four times today and the game is
live; rerunning it buys nothing. One harness fault was found and fixed in the test tools (no game code changed).

Verdicts: **fault** (goes into Part G), **taste** (his list, not built unasked), **fine** (with the evidence).

## F4, Slivers and prices (v7.2, `c80440535`)

1. **Fine. The pay numbers reproduce.** Rerun: levels 1 to 10 pay 113 a dive (270 a minute), 11 to 20 152 (256), 21 to 30
   180 (237), 31 to 40 181 (182 a minute, the dives are longer). Exactly the builder's claim.
2. **Fault (harness, fixed here).** `earn.js` pulled `slivPayout` out of the page but not its new constant `SLIV_K`, so it
   crashed on the live build; its earlier numbers came from the harness's own copy of the curve, which happens to match.
   Fixed: the harness now pulls `SLIV_K` too and runs on the live function. Committed with this review.
3. **Taste, his list: the controller is a GOOD player.** It carves the Clean Slice line and lands the bullseye (average
   landing multiplier 4.1 to 4.4). A no input dive (`noinput.js`, levels 1 to 20, three seeds) dies 60 of 60 times and
   pays about 10 Slivers (58 a minute). A weak player sits between: the first rung of the ladder (2,000) is about 18 good
   dives (9 minutes) and could be an hour or more of bad ones. **His call:** add one rung under 2,000 (a first knife at
   about 800), or leave the ladder as the thing to grow into. Not built unasked.
4. **Taste, his list: Journey earns a third of Freefall per minute** (70 to 95 against 180 to 270). Journey runs score
   about 1,400 (max 8,250 in 36 rhythm tapper runs) over 42 s; the square root is honest about that. If he wants the two
   modes to pay alike, a Journey factor of 1.0 instead of 0.5 (`SLIV_K` per mode) lands Journey at 140 to 190 a minute.
   One line. His call.
5. **Fine. Sunbeams untouched.** The v7.2 diff changes `slivPayout`, the prices, `SKIN_ORDER` and three
   `toLocaleString` calls; `earnSunbeams` and `_sbCapEarn` are not in it.
6. **Fault (small): the shelf is not in price order.** The six Astra knives were slotted after their tier's originals, so
   the Forge reads 2,000, 3,000, 2,400, 2,800, 3,400, 2,200, 2,600, 6,000 ... (seen in the build's own Forge shot). A
   price ladder that does not read as a ladder undercuts the point of F4. Part G.
7. **Fine. Endless pays depth/8** plus the square root of its score; now that Endless kills, a 1,500 m dive pays about
   190 plus the score part. Bounded.

## F3, the boss and the Daily (v7.1, `9e9e708c0`)

1. **Fine. 300 of 300 fights clear**, reruns exactly (reactions 0.1 to 0.4 s, holds 0.05 to 1.45 s).
2. **Fine, and better than the handoff feared: the grade DOES follow the thumb.** Rerun grades: 155 fights x5, 15 x3,
   130 x2. A light thumb is flawless; a long hold (0.65 s and up) spins the blade flat, the handle bonks the boss, and
   that fight pays x2. So "the better you do the higher the multiplier" holds, and the skill it rewards is the one the
   How page names: keep the blade down.
3. **Taste, his list: the rope skip is a middle lane thing.** With the boss in the middle a hold away cuts a rope for
   12 of 15 hold lengths; with the boss in a side lane only one length (exactly 0.55 s) reaches the far rope. The net
   still gives way after three missed lobs, so the boss stays optional. Leave unless he wants the ropes nearer.
4. **Fine.** The boss's pay is banked apart and the landing never multiplies it (row [23]). The Daily's physics stamp
   went to 2 with the lob change; a phone that spent today's dive on v7.0 stays spent (the day record ignores the stamp),
   which is the intended meaning of one dive a day.

## F1, the Endless ramp (v6.9, `7f5725101`)

1. **Fine as far as the evidence goes, and the evidence stops short.** The films show 300 m killing a no input knife on
   a wall in about 6 s and 1,500 m in about 9 s. At 3,000 m the filmed knife fell 80 m at 47 u/s through more hazards
   and did NOT die inside the 18 frames. So "impossible eventually" is the design's intent, not something shown. The
   suite's row [10b] pins hazard counts and speeds, not a death rate. Part G: measure the survival curve (how deep the
   near human controller gets, five seeds); if it survives past 4 km, the slope past 917 m (`END_TERM_SLOPE2`) is his
   number to raise, not the builder's.
2. **Fine.** Every world band keeps its verb (0 of 300 dives missing one after the host first rule; 130 of 300 without
   it). The level ladder and the extra hazards are in the suite and go red on seven broken copies.

## F2, the knife over the ground (v7.0, `4dd278b6a`)

1. **Fine.** The drawn knife never dips below the ground or a stump top (the trace's minimum is 0.00) and the frames read
   as a knife standing on its end and tipping over, not floating.
2. **Probable fault (older than F2, made visible by it): the resting knife hovers.** The stepped knife rests with its
   centre at `KR` = 1.5 above the ground, and its drawn half height is 0.715, so a knife lying flat on the grass is
   drawn 0.78 units above it (the trace: every `G` frame reads `low 0.78`). F2 only ever lifts; it never lowers. The
   landing shadow under it softens the look. Part G, drawing only, confirmed by a shot before it is touched.

## What goes where

- **Part G (fixes):** G1 the resting knife drawn on the grass; G2 the Forge shelf in price order; G3 the Endless survival
  measurement. Written into `BUILD-PLAN-OCT23.md`.
- **His list (taste):** a rung under 2,000; Journey's pay factor; ropes nearer the walls. In `START-HERE.md`.
- **Harness:** `f4/earn.js` fixed; `f4/noinput.js` added.
