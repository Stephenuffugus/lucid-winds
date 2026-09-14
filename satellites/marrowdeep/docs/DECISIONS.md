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

## A2.1, the first quest coach (2026-09-14, Opus)

**2026-09-14 — four beats, each once, each shown where it matters: the target on the first pre roll (or the first
result card if no pre roll comes), PUSH on the first pre roll that offers one, the surge on the first card that
surged, Strain on the first stage end or strike sheet after Strain has landed.**
Why: the handoff names the four things and "at the moment each matters". A pre roll is where the target and the odds
sit side by side; a Push is only worth explaining when one is on offer; a surge only when one just happened; Strain
only once there are filled pips to point at. The ladder is `SIM.coachDue`, pure, with 17 assertions in `sim.js
--test`. Reverse: delete the four `coachAt` calls.

**2026-09-14 — the coach line sits in the flow of the veil ABOVE its card, in the band that was empty black, and is
not tappable.**
Why: every one of those three veils had 150 to 350 CSS px of nothing above the card (A1 shots), so the line costs no
screen at any width and never covers a control or the chip's corner. Gerplunk's line is on the water for the same
reason. Not a modal: a first quest is already a tap per check, and a GOT IT per beat would be four more.

**2026-09-14 — a beat is marked seen in the SAME save write that shows it, and a missing flag reads as unseen.**
Why: the Gerplunk rule, so a beat cannot be shown and forgotten or remembered and never shown, and a save from before
the coach (his save, if he has played it) hears the four once. `test/coach.mjs` boots a fixture of such a save.

**2026-09-14 — replay is HOW IT GOES at the foot of the Hall's body, then SHOW ME AGAIN on the HOW sheet.**
Why: the Hall's pinned footer is full (two rows of two plus DEPLOY, and the chip band leaves 158 px at 320), so the
door is a quiet button in the scrolling body, and the HOW sheet was the natural place for the reset because it is
where the rules already are. SHOW ME AGAIN also counts as GOT IT.

**2026-09-14 — HOW keeps six lines: the Push line gives way to the target, and the surge joins the dice line.**
Why: plan section 6 says "Push has its own labelled chip on the pre roll strip and teaches itself, so it gives up its
line" and that HOW must say what a target is and name the surge. `test/boot.mjs` holds "at least six, and the
whole bank shown". The copy is in `satellites/marrowdeep/data/lines.json`, which is the file `tools/data.mjs` reads.

**2026-09-14 — the authored banks are edited in `satellites/marrowdeep/data/`, not `plans/marrowdeep/data/`.**
Why: the run's fence forbids writing into `data/` under `plans/` ("copy from them, never into them"), and
`tools/data.mjs` reads the satellite's own copy (`ROOT/data`), so that copy is what the game is built from. The
handoff's A2.6 names the plans copy; the fence wins, and the two copies now differ on purpose (`lines.json`).

**2026-09-14 — the coach is off at `?test=1`.**
Why: the handoff's gate says "never on `?test=1`". Nothing in the page read that query before; `COACH_OFF` is the
only reader.

## The Hall sheets print what they charge and ask what RULES says they ask (2026-09-14, Opus)

**2026-09-14 — every Hall price comes from one engine function, `SIM.hall.cost(state, what, arg)`, read by the
purchase and by the page.**
Why: the sheet had its own arithmetic and it was wrong three ways (A1 gaps 1 to 3, and a fourth found while fixing:
the page indexed Renown prices by the deepest Depth UNLOCKED, the engine by the deepest COMPLETED). No price moved:
every number is the one RULES R8.0b, R8.1 and R8.2 and BALANCE already give, now quoted by the same code that
charges it. `null` means not for sale; an unknown name throws rather than returning 0. 20 assertions in `sim.js`.

**2026-09-14 — COMMISSION asks for the slot, then deals three, then the one kept goes to the drop screen.**
Why: R6.10 says "three relics of a chosen slot ... keep one (the drop screen)". Nothing is paid until a slot is
tapped. The three are written to `account.commissionOffer` in the save BEFORE the deal is shown, because the Renown is
already spent; a reload finds them waiting on the Renown sheet as "COMMISSION, KEEP ONE" with no price. The deal's
stream is salted by a new `account.commissions` counter so two Commissions of one slot deal differently. Reverse:
none needed, the old path lost the Renown.

**2026-09-14 — RAISE A FLOOR is a pick of four stats, each card carrying that stat's own next price or none at the
top floor.**
Why: R8.2 "per stat" and R8.6's ladder (4, 6, 8). The old row raised `MD.STATS[marrow % 4]`.

**2026-09-14 — UNLOCK AN ORIGIN shows the three it deals before anything is paid, through `hall.originDeal`, and the
unlock deals through the same function with the same stream, so what was shown is what can be picked.**
Why: R8.2 "three of the locked Origins dealt, pick one". The deal's salt is the count of Origins already open, so it
changes after every unlock and is stable until then (no re roll by reopening the sheet).

**2026-09-14 — a row the purse cannot pay has a muted title, and a refusal says why in the game's words.**
Why: A1 fault ("nothing marks what you can afford; a refusal only shows by tapping and prints the engine's reason
text"). The reasons map lives beside the sheet (`HALL_WHY`). The price and the tap are unchanged.

**2026-09-14 — the stray row prints no price, and "Bodies are not the bottleneck." is gone.**
Why: A1 faults: "TAKE IN A STRAY 0" beside "for nothing", and a designer's note printed at a player.

**Still not on any sheet (A1 gap 5, unchanged):** Reforge, Excise a Scar, Redeal, Consecrate a Legacy. The engine
prices all of them through `hall.cost` now, so each is a sheet row and a pick screen away.

**2026-09-14 — ⛔ a gate edited after the suite ran is a new gate, and it went red on its own helper.**
Why this is written down: `test/hall.mjs` was hardened (a missing KEEP ONE card becomes a FAIL line, not a throw)
AFTER `tools/check.js` had already read it green. Rerun alone, it threw at the new line: `has` in this file takes
one argument, `has(sel)`, and the edit called it the way `test/coach.mjs` does, `has(page, sel)`, so the page object
reached `querySelector` as "[object Object]". The suite's green was for the file before the edit. Rule kept from
here: every gate edit is rerun alone before its commit, and the watched red mutation that motivated the edit is
rerun with it.

## The Hall polish, from the shots of the new sheets (2026-09-14, Opus)

**2026-09-14 — a refusal keeps the purse on its line: "Not enough for that yet.  4 marrow in hand".**
Why: the shot of the Marrow sheet after a refused Origin showed the purse line replaced by the reason, so the one
number the player needed to decide what to buy instead had gone. One helper, `refuse(out)`, reads the sheet's
currency from `G.spendKind`, which every sheet and sub sheet sets.

**2026-09-14 — the slot sheet says what each slot is FOR, from what its own affixes do.**
Why: "The slot for surplus." and "The slot for positioning." were the engine's words (`SLOT_OWNS`, still used on the
Character screen's empty tiles). A Commission is a choice about what a relic will do, so `SLOT_WHY` names it: head
floors, chest Toughness and Armor and less from Strikes, hands a bigger die or an earlier turn over, feet the bench
and the Relay, weapon damage to an Aspect, charm rerolls, ward a Sigil, token odd bonuses. Copy only, no rule.

**2026-09-14 — RECRUIT is marked, and says why, before the tap when the living roster is full.**
Why: R8.0 counts the living; the row used to look buyable and refuse only after a tap.

**2026-09-14 — KEEP ONE says BACK leaves all three waiting.**
Why: the Renown is already spent at that screen, and a player about to back out should know the deal is kept.

**2026-09-14 — the sheet cards are centred at every width.**
Why: `#spBody` spans the body and its 340 px cards packed left at 412, with ~57 CSS px of dead space on the right.
At 375 and 320 the cards already fill the width, so nothing moves there.

## A2.2, the lesson after the roll (2026-09-14, Opus)

**2026-09-14 — a lesson names the slot where the policy's holder passes more often than the one the player chose,
by at least 10 points of pass chance, and only after that stage's rolls are done.**
Why: HANDOFF-OPUS-SEP15 A2.2, "make the 20 percent VISIBLE ... ONLY after the roll, as a lesson, never before", and
"Do not move a BALANCE number". The line claims pass chance and nothing else, so it judges pass chance and nothing
else: a plan the policy prefers for Strain reasons but that passes less often teaches nothing. When several slots
qualify, the biggest gap is the one named. `LESSON_MARGIN` 0.10 is a code constant beside `lessonFor`, not a BALANCE
row, because it decides when a sentence is worth printing, not how the game plays.

**2026-09-14 — the lesson is computed once, in `assign()`, on the state the player chose on (before a Toll's fee
lands), and frozen on the quest by stage number.**
Why: a lesson recomputed on the stage end sheet would read the Strain the stage just dealt and could name a line that
was never better when the choice was made. `sim.js --odds` recomputes every frozen lesson from a snapshot taken before
`assign` and fails on any difference.

**2026-09-14 — a slot's chance is the product of its checks' chances (a Chain and a Relay both have to pass), each
from `probFor`, which reads what the PLAYER can see.**
Why: `probFor` is the policy's own estimator, so the lesson and the policy can never disagree about a number, and under
a hidden target it uses the published prior rather than the true TN, so a lesson never leaks a hidden number.

**2026-09-14 — the copy is "{name} on that {shape} would pass {better} times in 100, against {taken}."**
Why: the handoff's example ("Wren on the Chain passes more often") in a form that still reads for a Relay's two names
("Wulfric and Tam on that Relay would pass ...") and that states the two numbers the pre roll card already speaks in.
Whole numbers out of a hundred, not a percent sign, because it is a sentence, not a readout.

**2026-09-14 — no lesson at the boss.**
Why: the boss plan is `policy.boss`, a different objective (expected damage, piling), and a pass chance line there
would be true and misleading. Left for a later pass if the Director wants one.

**2026-09-14 — A2.2b: the lesson names both sides, "Wulfric on that Gate would pass 67 times in 100, against 33 for
Maddoc."**
Why: the A2.2 shots. "Against 33" never said whose 33, so a player had to work out who they had put on that Gate to
read the lesson at all. The second name comes from the frozen record's `taken` holders, the same record the numbers
come from, and `test/lesson.mjs` now checks both names and both numbers against it. The line also gets space below
it, because on a first quest it sits directly on the Strain coach's gold edged line and the two read as one block,
and `text-wrap:pretty`, because at 412 it left "33." alone on a second line.

## A2.3, the d4 floor at creation (2026-09-14, Opus)

**2026-09-14 — no fresh character carries more than two d4s across its four stats (`BALANCE.CREATION_MAX_D4` 2).**
Why: HANDOFF-OPUS-SEP15 A2.3, which cites the audit's "4.4 percent of new accounts roll four d4s they cannot replace"
and asks for a floor of two. Measured on the Sep 08 engine before the change, over 20,000 fresh characters at tier 1:
**9.25 percent carried three or more d4s and 1.02 percent all four** (Hearthborn 11.7, Fenwise 13.0, Ashwalker 12.3,
Straycall 0, because its step up on MIGHT and GRACE makes three impossible). So the floor changes about one fresh
character in eleven, several times the case the audit named. The cap is a BALANCE row, because RULES R0 puts every
tunable number there; set it to 4 and creation is what it was.

**2026-09-14 — how: after the Origin step and before the Marrow floors, while there are too many d4s, the first d4
in stat order is rolled again from the same tier weights and given its Origin's shift again; after twelve tries it
becomes d6.**
Why: "a re roll of the worst die" (the handoff), applied until the law holds, because one re roll leaves a d4 about a
third of the time and the gate is "zero with three d4s". The shift is re applied so a Straycall's NERVE stays a
Straycall's NERVE. The twelve try fallback is there so the law is a guarantee rather than a probability; at tier 1 a
d4 twelve times running is about three in a million. Nothing is drawn when a roll already has two or fewer, so every
character who did not trip the floor keeps exactly the stream they had: the seed 2 walk's account is checked
unchanged after the change. The free STAT reroll runs the same function, so it gets the same floor.

**⛔ 2026-09-14 — this OVERRIDES RULES R2.1's own sentence, "Creation stays fully random, because a reroll is a gamble
and not a pick."**
Why it was built anyway: the handoff is later (Sep 14 against Sep 08), is written by the same author, and names the
change and its gate exactly. RULES.md is read only to a builder, so RULES and the engine now disagree on this sentence
until Fable edits RULES. If the Director wants creation fully random again, `CREATION_MAX_D4` 4 is the whole reversal.

## A2.4, rarity and NERVE stop being carried by colour alone (2026-09-14, Opus)

**Found already done by the Sep 08 build, measured rather than assumed:** `--marrow` is `#c04a44`, 4.04 to 1 on ink
(the plan's floor is 3); the drop card and the Commission cards print their tier word. What was still colour only:
the Character screen's gear tiles (a name and a border), the drop screen's "wearing" line (a name), and NERVE.

**2026-09-14 — every relic a player can see names its tier in words: the gear tile carries the tier word above the
name, the drop target's worn item is prefixed with it.**
Why: plan section 7, "Rarity, Strain and stat are never carried by colour alone anywhere." `test/layout.mjs` law 7
holds it on every screen the walk measures (and fails if it measured no relic at all); `test/hall.mjs` reaches the
two places the layout walk never does, because that walk takes the Renown on every drop: a worn tile and a target
already wearing one.

**2026-09-14 — Relic is FILLED, a brass tint behind a 2 px brass border, on the relic card and the gear tile.**
Why: plan section 7, "a filled border rather than an outlined one, a shape difference at the top tier".

**2026-09-14 — NERVE is `#7cc4e8`, a cold flame, chosen by measurement.**
Why: plan section 7, "NERVE takes its own hue away from brass". Ten candidates were scored against every palette
colour under normal sight and simulated protanopia and deuteranopia. The old `#d9b24c` sat 4.4 from lantern under
deuteranopia; `#7cc4e8` is 10.24 to 1 on ink and 24 from its nearest palette colour under all three. Lint now measures
it (15 or more from brass and lantern) and went red on the old value first. The hue is a taste the Director may
overturn; the law only asks that NERVE not be a shade of the brass that means Renown and Relic.

**2026-09-14 — ⛔ a law about words must read the words a player reads.**
Why this is written down: the A2.4 suite went red on `test/hall.mjs` with the tile saying "UNCOMMON" on one line and
"Echoing Comb of the Two Lanterns" on the next. The gate read the tile with `textContent`, which joins adjacent block
elements with no space, "UNCOMMONEchoing", and `\bUNCOMMON\b` finds no boundary there. The page was right and the
assertion was wrong. Both tier laws (`test/hall.mjs`, `test/layout.mjs` law 7) now read `innerText`, which keeps the
line break; they still fail on HEAD's tile, which carries no tier word at all, and that is rerun before the commit.

## A2.5a, a way on or out within reach (2026-09-14, Opus)

**2026-09-14 — layout law 8: every screen but the Title and the Hall has at least one footer control whose centre
sits in the bottom 40 percent of the viewport, with a thumb at that centre landing on it, at all three widths.**
Why: HANDOFF-OPUS-SEP15 A2.5 ("every screen's back or close control within the bottom 40 percent of the viewport at
320x568, proved by elementFromPoint") and plan section 6 ("a way out of everything, within reach"). Every screen
already met it: the Sep 08 build put every exit in the pinned footer. So this is a law that holds today and can go
red tomorrow, and it was watched red by stacking the Wall screen in reverse so its BACK sat at the top.

**2026-09-14 — the law counts a DISABLED footer control, and it treats the quest board's RESOLVE as that board's way on.**
Why: the law is about where a control is, not its state. The quest and boss boards have no BACK by rule (R5.11, no
Withdraw; the plan re-pushes history so a back gesture is a no op inside a quest), and their RESOLVE, like the Trait
sheet's KEEP, is disabled until the player has chosen. A law that skipped disabled controls would fail those boards
for doing exactly what the rules say.

**2026-09-14 — the Title and the Hall are exempt, as plan section 6 exempts them.**
Why: they are the two places a player is already home.

## A2.5b, the boards fit a 320 phone (2026-09-14, Opus)

**2026-09-14 — under 360 px wide, the quest and boss boards' party cards show first names, and the boards tighten
their card padding, gaps, the challenge text's line height and two top bar margins.**
Why: DECISIONS A1 gap 8, measured before the change on the real page at 320x568: the quest board ran 26 px past its
body on stages 4 and 5 (3 px on stages 2 and 3) and the boss board 33 px, so the scroll edge cut the party cards'
Strain pips and role word, the numbers a decision turns on. Line by line, the party card's name took 28 px (two lines,
"Wenna / Farrant") and the challenge text 104 px. First names are what the stage end sheet and the seats already use.
Nothing is hidden that a decision needs; the full name stays on the Roster, the Character screen and the Wall. At 375
and wider every board already fit, and nothing there changes.

**2026-09-14 — the footer keeps its 124 px, and the fix is the board.**
Why: the footer's height is what keeps the bottom left 120 by 120 clear for the music chip across the whole width; the
quest board anchors its cards to the bottom, so a shorter footer would put the first party card in the chip's seat.

**2026-09-14 — layout law 9: on the quest and boss boards, with the body at its start, the whole party row is on the
glass, at all three widths, over at least two boards.**
Why: the fault was a cut no existing law read (a card half under the scroll edge still reports its full rect).
