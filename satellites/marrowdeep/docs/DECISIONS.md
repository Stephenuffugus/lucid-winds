# Marrowdeep decisions log

Every choice a build made that the design and `plans/marrowdeep/RULES.md` did not make for it, newest last, one
line of what and one line of why. Numbers live in `DEFAULT_BALANCE` in `index.html`; RULES.md is never edited by a
builder. Stephen overturns any line by saying so.

## Written 2026-09-14 by Opus (lane A1): the rulings the Sep 08 build shipped without recording

The Sep 08 build wrote no DECISIONS file. These are the choices already live in `20260908d`, found by reading
`DEFAULT_BALANCE` against every `DECIDED` and `CORRECTED` line in RULES.md. Nothing below was changed today.

**2026-09-08 (recorded 09-14): `STRIKE` is `[1, 1, 2, 3, 3]`, Strike 1 at Depth I and II.**
Why: RULES R7.4 CORRECTED. At the spec's 2 a 20,000 quest simulation measured 81 percent per character death and
a 78 percent wipe against targets of 12 to 15 and 8. Director call 1 is still open; one BALANCE row reverses it.

**2026-09-08 (recorded 09-14): the fourth Aspect at Depth IV and V is DORMANT until one of the first three breaks.**
Why: RULES R7.0. Without it 200 quests at IV and V gave 0 wins and 600 of 600 dead. ⛔ RULES says to MEASURE ruling
(a) at Depth V before shipping it and to add ruling (b) if it does not clear 25 percent. `sim.js --depths` is not in
`tools/check.js` (it is parked in the file's own comment), so the shipped engine's Depth V win rate under (a) has
not been gated. Reverse: delete the `dormant: a >= 3` line in the boss builder.

**2026-09-08 (recorded 09-14): `ASPECT_HP_BONUS` is `[1, 1, 2, 3, 3]`, one hit point over R7.1's ladder.**
Why: the prototype's tuning pass (the code comment cites PROTO-REPORT.md): the authored Depth I boss killed 8.8
percent of characters against spec 8.6's 12 to 15. RULES R7.1 still reads "authored at Depth I, +1 at III, +2 at
IV and V", so RULES and BALANCE disagree by design until Fable edits RULES. Reverse: `[0, 0, 1, 2, 2]`.

**2026-09-08 (recorded 09-14): the `RENOWN` row is R5.9's scaled to three quarters (gate 2, open 2, toll 3, chain 5,
relay 5, vault 6, boss 9, firstBoss 6).**
Why: the tuning pass measured 53.5 Renown a Depth I run against spec 15's 35; after, 39.3. The ladder's ORDER is
R5.9's and unchanged. RULES R5.9's printed numbers disagree until Fable edits RULES.

**2026-09-08 (recorded 09-14): `GATE_TN_WEIGHTS` is `{4: 40, 5: 40, 6: 20}`.**
Why: RULES R5.5 CORRECTED (TN 6 never occurred in 200,000 quests). ⛔ The plan's section 10 call 5 still says the
Gate band is "4 or 5 at 50/50 as the spec says"; the plan's text is stale, the code follows RULES.

**2026-09-08 (recorded 09-14): `COMPOSED_CAP` is 5.**
Why: RULES R1.9 CORRECTED, "five, not six" because Gate TNs of 6 now deal. (Memory `project_marrowdeep_sep08`
said 6; the memory is stale, RULES and the code agree on 5.)

**2026-09-08 (recorded 09-14): `SCAR_EVERY` 2, `RETIRE_VESTING` 3, `UNPROVEN_DEATH_MARROW` `[1, 1, 1, 0, 0]`,
`REST_FRACTION` 1, `PRICE_INDEX` `[1, 1.5, 2.25, 3.4, 5.1]`, `RESPITE` `[1, 1, 0, 0, 0]`.**
Why: RULES R2.5, R2.6, R8.5, R8.3, R8.0b and R5.7 as written, each a Director call in plan section 10 (1c, 7b,
7g, 7f, 3). Each is one BALANCE row.

## Found 2026-09-14 by playing it (lane A1): places the PAGE does not do what RULES says

Not decisions: these are gaps between RULES and the shipped page, found by the real tap walk (`tools/walk.mjs`)
and by reading the Hall's two sheets against `SIM.hall`. The engine implements every one; the page does not reach
it. Listed so nobody reads their absence as a ruling.

1. **COMMISSION takes 40 Renown and shows nothing.** `openSpend` stores the three relics in `G.commission` and no
   screen ever paints it, so the relics vanish and the Renown is gone (R6.10: keep one on the drop screen). And the
   slot is `MD.SLOTS[questsCompleted % 8]`, never chosen (R6.10: "a chosen slot").
2. **RAISE A FLOOR raises `MD.STATS[marrow % 4]`**, a stat picked by how much Marrow the player holds, never by
   the player (R8.2 "per stat"), and it always prints 3 while the engine charges 6 for the d8 step.
3. **WARD SHELF prints 15 for the second slot; the engine charges 45** (R8.1 "30 then +15 each").
4. **UNLOCK AN ORIGIN passes no pick**, so the engine takes the first of the three it deals (R8.2 "pick one").
5. **No screen reaches Reforge (R6.9), Excise a Scar (R2.5), Redeal (R8.1) or Consecrate a Legacy (R8.2).**
6. **No screen reaches the mid quest replacement (R5.10).** `SIM.replace` exists; the stage end sheet never offers
   RESERVE, RECRUIT or CONTINUE SHORT HANDED.
7. **The slot glyphs, shape icons, Sigil marks, status icons and portraits of plan section 7 were never drawn.**
   `index.html` defines eleven `<symbol>`s (five dice, four stats, renown, marrow); every `use('g-<slot>')` on the
   Character screen points at nothing and draws an empty box.
8. **At 320x568 the quest board, the boss board, the Hall's company and the Character screen are cut by the scroll
   edge.** `.pin{min-height:124px}` reserves the chip's 120 px band across the whole width, the body ends 140 px
   above the bottom, and on the quest board all three party cards lose their Strain pips under the cut.

## 2026-09-14 Opus: the order this run takes through lane A

**The A1 faults that lose a player's currency or choice go in front of the handoff's A2 list, one gated change
each; the rest ride with the A2 item they belong to.**
Why: a fault is fixed before a taste (HANDOFF-FABLE-SEP06-EVENING section 1), and a button that takes 40 Renown
and gives nothing is the worst thing found. So: A2.1 the coach (HOW gains the TN and surge lines it lacks), then
the Hall sheets print the engine's price and let the player choose the stat and the slot and see the Commission
(items 1 to 4 above), then A2.2 to A2.8 in the handoff's order, with item 8 (the 320 slice) inside A2.5's layout
pass and item 7 recorded in A2.8's `docs/ART_ASSETS.md`. Items 5 and 6 are whole screens and stay listed for the
next pass.
