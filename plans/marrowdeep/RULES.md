# MARROWDEEP, THE RULES OF PLAY, COMPLETE
Written by Fable 2026-09-08 from `assets/MARROWDEEP_DESIGN_SPEC.md` v1.0. Every rule the spec states is kept
unless a line below says CORRECTION and shows the arithmetic or the law that forced it. Every rule the spec
is silent on is DECIDED here so the builder never has to invent one. Numbers marked BALANCE live in one
frozen object of that name and nowhere else; the prototype sim (`plans/marrowdeep/proto/`) chose their
defaults against the spec's section 8.6 and 15 targets WHERE A TUNING PASS HAS RUN; where one has not, the default
is the audit's reasoned choice and the rule says which. `PROTO-REPORT.md` exists only if the pass ran, and carries
whatever it measured.

Rule ids (R1.1 ...) are what the gates, the sim assertions and the handoff cite.

## R0. Words (the spec's words, pinned; copy law: no dash of any kind, no exclamation point in player text)

- **Stat**: MIGHT, GRACE, WITS, NERVE. A stat is a die size: 4, 6, 8, 10 or 12 (the ladder d4 d6 d8 d10 d12).
- **Rung**: a stat's position on the ladder, 0 to 4. Up one rung = the next die. Never past d12, never under d4.
- **Check**: one roll of one stat against a TN. Passes when total >= TN.
- **TN**: 3 to 7, forever, every Depth.
- **Toughness**: how much Strain a character can carry. Strain >= Toughness kills. Base 4 (BALANCE.BASE_TOUGHNESS).
- **Strain**: the hurt. Persists through a quest. Cleared by benching, Respite, Mend, sitting a quest out.
- **Armor**: a buffer that absorbs Strain before it lands, refilled at quest start and on every bench (R3.4).
- **Strike**: a boss Aspect's per round damage (R7.4). "Attacks" in the spec = Strikes. Nothing else attacks.
- **Surge**: the die shows its top face, roll it again and add, chains without limit (R1.2).
- **Floor**: a die that shows less than F reads F (R1.3).
- **Push**: 1 Strain for +2 on one check, declared before the roll (R1.6).
- **Bench**: the character with no check this stage; clears Strain (R5.6).
- **Respite**: the free clear every living character gets at the end of a stage at Depth I and II (R5.7).
- **Renown**: the flow currency. **Marrow**: the scarce one, from death and retirement only.
- **Relic**: a piece of gear (any rarity). **Relic rarity**: the top rarity tier. Both words are the spec's;
  the UI says "relic" for gear and "RELIC" (small caps tier label) for the tier, and never "Relic rarity relic".
- Renamed for the copy law (no dashes in anything a player reads): Sure-Handed -> **Surehanded**,
  Press-gang -> **Pressgang**, Sigil-Ward -> **Sigil Ward** (slot) and **Ward** (item), Roll-twice -> "roll twice".

## R1. The dice

- **R1.1 A roll.** `roll(die, ctx)`: draw a natural 1..die from the seeded stream. Then, in this order:
  1. Surge test on the NATURAL (R1.2). 2. Floor on the natural (R1.3). 3. Add surge dice. 4. Add flat and
  conditional modifiers and Push. Total >= TN passes. `surplus = total - TN`.
- **R1.2 Surge.** Threshold T = die minus `surgeMinus` (0 by default; Fenwise, Deepdrawn, the Hands and Weapon
  affix each subtract 1; **cap: T is never lower than die minus 1**, from all sources, R1.9). A natural >= T
  surges: roll the same die again, add it, and test that natural against T again, without limit. Under Hollow Air
  nothing surges (a Ward's partial relief: one surge, no chain, R9.3). A floored value never surges (the cap in
  R1.3 keeps every floor under every threshold).
- **R1.3 Floors.** A floor F reads any natural below F as F. **Cap: F <= die / 2** (d4 2, d6 3, d8 4, d10 5, d12 6),
  applied AFTER every `floorPlus`. ⛔ An earlier audit ruling raised this cap by `floorPlus` so that Ironbound and
  the 3 point Head affix would pay; a critic overturned it and was right. The spec states this cap twice and calls
  it load bearing ("without this cap, trivial checks disappear from the game"), and it states it a SECOND time
  inside Ironbound's own text, "respects the half die cap", so the spec knew the Origin was partial and said so.
  The affixes are fixed where they live instead (R6.11): the 3 point Head affix is repriced to 1, and Ironbound is
  worth its points through the Armor half of its line. Floors apply to the FIRST die only, never to surge dice.
  Several floors on one stat: the highest holds, they do not add. Under Shivering, floors are ignored.
- **R1.4 The master table, CORRECTED.** The spec's table is wrong in two cells. When TN equals the die's top
  face, only the top face passes (a surge adds a die that is always >= 1, so the top face always passes, and
  no lower face can reach it): d4 vs TN 4 is 1/4 = **25.0%** (spec: 31.3%); d6 vs TN 6 is 1/6 = **16.7%**
  (spec: 22.2%). Every other cell is right. The corrected table, which the harness must reproduce within 0.5
  points at 200,000 rolls per cell:

  | die | TN3 | TN4 | TN5 | TN6 | TN7 |
  |---|---|---|---|---|---|
  | d4 | 50.0 | 25.0 | 25.0 | 18.75 | 12.5 |
  | d6 | 66.7 | 50.0 | 33.3 | 16.7 | 16.7 |
  | d8 | 75.0 | 62.5 | 50.0 | 37.5 | 25.0 |
  | d10 | 80.0 | 70.0 | 60.0 | 50.0 | 40.0 |
  | d12 | 83.3 | 75.0 | 66.7 | 58.3 | 50.0 |

  Verified three ways on 2026-09-08: in exact arithmetic (Python Fractions, no sampling), by an independent auditor's
  closed form plus a million roll Monte Carlo, and by the prototype's own `--table` gate at 200,000 rolls a cell,
  which prints TABLE OK. In exact arithmetic: every other cell of the spec's table is
  right, both corrections hold, and the spec's surge means (d/2 + d/(d-1): 3.33, 4.20, 5.14, 6.11, 7.09) are right.
  The 50 percent diagonal (d4/3, d6/4, d8/5, d10/6, d12/7) holds. The plateau (d4 at TN 4 and 5; d6 at TN 6
  and 7) is a real feature of exploding dice: the top face is the only door and it opens onto any TN one step
  past the die. Closed form: TN <= die: (die - TN + 1)/die, except TN == die: 1/die. TN > die: (1/die) x
  P(chain >= TN - die).
- **R1.5 Floor table, CORRECTED.** d12 floor 6 base EV is (6x6 + 7+8+9+10+11+12)/12 = 93/12 = **7.75**, gain
  +1.25 (spec: 7.58, +1.08). The other four rows are right.
- **R1.6 Push.** Before a check, the acting character may take 1 Strain for +2 on it. Any number of times
  across a quest, once per check. Saltblood: the first Push each stage costs 0. Push Strain is a self paid cost:
  Armor does not absorb it (R3.4). A Push that kills (Strain reaching Toughness) is refused by the UI.
- **R1.7 Flat cap.** Permanent unconditional bonuses to one stat ("+1 to MIGHT" from Token, Hands, Weapon)
  total at most +3 per stat, from all items combined, applied at equip time (the fourth point is shown greyed
  and does nothing). Conditional bonuses (Zealot, Scholar, Herald, Ninth Hour, Bloodhound, Quickstudy, Grim,
  the Token conditionals) and Push are NOT under the cap; each source applies once per check.
- **R1.8 Reroll family.** "Reroll natural 1s": if the first natural is 1, draw again once and keep the second.
  "Roll twice take higher": declared before the roll like Push; two complete chains, keep the higher total
  before modifiers; once per stage per source. "Reroll one die per stage" (Gambler, the Charm affix): after the
  result is shown, the whole chain is redrawn once; the second result stands; once per stage per source; any
  check in the stage, own or ally's. Rerolls are offered on a RESULT card with a REROLL button beside CONTINUE;
  nothing auto advances (R11.6).
- **R1.9 Caps, all of them.** Flat +3 per stat. Floor <= die/2 (R1.3, applied AFTER every `floorPlus`, so the
  worst case this cap has to hold is a d12 reading 6 and nothing more). Surge threshold >= die
  minus 1. Armor and Toughness have no cap. Aspect damage per hit has no cap.
  **The composed cap, CORRECTED (audit): `floor + total flat` on one stat may never exceed 5**, and this is the rule
  that keeps pillar 3 alive. Five, not six: R5.5 now deals Gate TNs of 6, so a floor of 6 would auto pass every TN
  but the Vault's 7, and the point of the cap is that a live check survives at the TOP of the band, not just at
  its ceiling. The two caps the spec states are in different
  sections and were never composed: a d8 at its half die floor of 4 plus the three permitted flat points reads a
  minimum of 7, so from d8 upward that character could not fail ANY check in the game, ever, under any Sigil but
  Shivering, for eight points spread over three items that a Depth I budget already affords. At the cap the worst
  possible roll still leaves a live check at TN 7. The resolver applies it at equip time and the Character screen
  greys the line that does nothing, the way R1.7 already greys the fourth flat point.

## R2. Characters

- **R2.1 Creation** (one screen, one tap of ROLL, then one choice). In order: four stats rolled independently
  from the account's Renown tier weights (R2.2). Then the Origin is dealt from the unlocked pool and applied
  (Straycall shifts rungs, Unmarked rolls a fifth die from the same weights and replaces the lowest stat). Then the
  account's creation floor for each stat is applied LAST (audit CORRECTION: a floor is a guarantee the player paid
  Marrow for, and applying it before Straycall showed a d4 NERVE on a stat the Hall promised would never roll under
  d6).
  **A new account gets three characters free** (audit; the spec never said, and the only other door is Recruit at 25
  Renown on an account holding 0): `account.freeRolls` starts at 3, creation costs nothing while it is above zero and
  decrements on KEEP, and BEGIN runs creation three times before the Hall opens. Redeal still costs 10.
  **Each free creation also carries one free STAT reroll** (`account.freeRerolls`, 3, audit): a REROLL button beside
  KEEP that rerolls all four dice once. Measured over 400,000 fresh parties: 4.4 percent of new players roll a
  character whose four stats are ALL d4 with no way to replace it (Redeal is Callings only, and Recruit costs 25 on
  an account holding 0), 61.8 percent have nobody at d8 or better on any of the boss's three locked stats, and 54.1
  percent never see a d12 in their whole first party, at the moment the spec calls its thrill. Creation stays fully
  random, because a reroll is a gamble and not a pick. Then three Callings are dealt (R8.7) and the player picks one. Name from the name
  banks (R10.5). The character is `alive`, Strain 0, Scars 0, no gear, no traits.
- **R2.2 Renown tier.** `tier = 1 + number of thresholds in [100,200,350,500,700,900,1200,1500,2000] that
  account.renownLifetime has reached` (1 to 10). Lifetime Renown is everything ever earned, never spent.
  Weights for tiers 1, 3, 5, 7, 10 are the spec's rows; tiers 2, 4, 6, 8, 9 are the linear interpolation of the
  neighbouring rows, renormalised.
- **R2.3 Effective numbers.** `toughness = BASE_TOUGHNESS - scars + sum(gear toughness) + traits + origin`.
  `armor = sum(gear armor) + Ironbound 1 + Bulwark 2`. A character whose effective toughness is 0 or less
  cannot be deployed (the deploy card says "Needs Toughness") but can be retired, dismissed or geared.
- **R2.4 Death.** The instant Strain >= effective Toughness the character dies: interred, Legacy made, Hall
  wall line written, Marrow paid (R8.5). Unkillable (trait): the first time in a quest that Strain would reach
  Toughness, it stops at Toughness minus 1 instead; then dies normally.
- **R2.5 Scars and Traits.** At quest end every survivor takes a Scar every `BALANCE.SCAR_EVERY` quests survived,
  **2 by default** (audit CORRECTION, and a Director call). One Scar per quest against a base Toughness of 4 is a
  hard wall at four quests, and at the spec's own hazard the mean career is 0.867 + 0.751 + 0.652 + 0.565 = **2.83
  quests**, not the 4 to 7 the spec claims; that in turn puts 3/2.83 characters through the roster per quest and
  makes the Marrow income about 3.6 a quest against the spec's own 1.5, which reprices every Marrow purchase. A Scar
  every second quest puts the wall at eight, the mean career near five and a half, and makes the spec's own 1.5
  correct as written. Set SCAR_EVERY to 1 for the spec's literal reading and expect a three quest career.
  The Scar lands first when it is due, then every survivor is dealt 3 Traits it does not own and picks 1 (each in
  party order, one card screen each); a Trait is dealt after EVERY quest survived whether a Scar was due or not. A character owns each Trait at most
  once. Excise a Scar (60 Renown) removes one Scar, once per character ever (`excised: true`).
- **R2.6 Retire, Dismiss.** Between quests. **BALANCE.RETIRE_VESTING is 3** (audit CORRECTION, and a Director call
  in the plan's section 10): Retire pays `2 + traits.length` only at `questsSurvived >= 3`; under that it pays
  `traits.length` alone (1 or 2) and still writes the Legacy and the wall line. The spec's flat 2 plus Traits pays 3
  Marrow for a character retired after ONE quest, six times the design's own rate of 0.5 Marrow per character quest
  and twice what its four quest veteran earns, so the fastest Marrow in the game was to recruit and retire rookies
  and never risk anyone. The vest lands exactly where the third Scar does, which is where the spec wants the decision
  to bite; the veteran's six Marrow is untouched. Retire needs `questsSurvived >= 1`: Marrow as above,
  a Legacy, a Hall wall line ("retired after N quests"). A character with 0 quests survived is DISMISSED
  instead: 0 Marrow, no Legacy, no wall line (DECIDED: closes the Recruit for 25 Renown then Retire for 2 Marrow
  conversion, which would have made Marrow purchasable). Gear on a retired or dismissed character goes to the
  drop screen (R6.7) for the roster.

## R3. Strain, Armor, benching

- **R3.1 Sources of Strain**, each an instance: a failed check (the challenge's `strainOnFail`; +1 if the slot
  carries Ambush; Thin Ice: the first failure each stage by anyone costs 2 instead of 1); NERVE contagion (the
  actor takes the failure's Strain as normal, every OTHER living party member takes 1; Steadfast is immune);
  Push (R1.6); a Toll's entry fee (1, paid on assignment, refunded by nothing); Pressgang (the third character
  takes 1 at stage end instead of benching); a Strike (R7.4).
- **R3.2 Order on one instance:** Strike reduction (Vanguard, the Chest affix, boss only) -> Armor absorbs
  (R3.4) -> the rest lands -> death test (R2.4).
- **R3.3 A second check of a two check slot** (Chain or Relay) only happens if the first passed. One failure, one
  instance. A Relay that fails its first check pays nothing, rolls nothing more, and the second character's Push was
  never paid and their unused stats stay unused. (The Relay half is an audit CORRECTION; the spec said only "both
  must pass", and rolling a second check for a slot that can no longer pay is a free punishment.)
- **R3.4 Armor.** A pool equal to effective Armor, full at quest start, refilled to full each time the character
  benches. An instance is absorbed up to the pool, the pool drops by what it absorbed, the remainder lands.
  Self paid costs (Push, Toll fee) skip Armor. Rustbound: Armor is 0 (a partial Ward: 1). DECIDED: the spec
  never says what Armor does; this makes Armor a stage currency (it comes back with the bench) and "1 less from
  Strikes" a boss currency (no bench at the boss), so the two Chest affixes at 2 and 3 points are different things.
- **R3.5 Strain does not go below 0** and nothing clears Strain on the dead.

## R4. Origins, Callings, Traits (the spec's tables are the law; these lines pin the edges)

- **R4.1 Hearthborn.** Toughness +2. When this character benches, the living ally with the most Strain (tie:
  the first in party order) also clears 1. No prompt (DECIDED: a choice between two cards for one point is a tap
  nobody wants twelve times a quest).
- **R4.2 Ashwalker.** At quest start a Common relic of a random slot is rolled and offered on the drop screen.
- **R4.3 Fenwise.** WITS surge threshold minus 1 (R1.2 cap).
- **R4.4 Ironbound.** Armor +1. Every floor from gear reads 1 higher, then the half die cap (R1.3).
- **R4.5 Straycall.** At creation MIGHT and GRACE up one rung, NERVE down one (clamped to the ladder).
- **R4.6 Lanternborn, CORRECTED.** The spec's "once per stage, reveal one challenge's TN before assigning"
  does nothing when TNs are visible, which they are by default (R5.3), so: hidden TNs (Blindness, Blindfold)
  are always shown to a Lanternborn's party, AND once per stage the party may SPEND the lantern to reveal the
  next stage's two shapes and their TNs, chosen before assignment. Information, as the spec wanted, at every Depth.
  ⛔ The spend is the point: an earlier draft made the preview an always on line under the stage title, and a critic
  was right that a passive aura is not the decision the spec argues for when it says "information is power in an
  assignment puzzle". Spending it is a decision, especially from Depth III where nothing clears and triage is the
  whole game.
- **R4.7 Saltblood.** First Push each stage costs 0 Strain.
- **R4.8 Unmarked.** Fifth die at creation replaces the lowest stat (ties: the first in MIGHT GRACE WITS NERVE order).
- **R4.9 Vanguard.** Floor 4 on MIGHT (capped by R1.3: d4 reads 2, d6 reads 3). 1 less Strain from each Strike, minimum 0.
- **R4.10 Cutpurse.** The first GRACE check each stage rolls twice, keeps the higher (free, automatic).
- **R4.11 Scholar, CORRECTED (audit).** +2 on the SCHOLAR's own next check after any OTHER deployed character's
  failed check this stage. A boolean charge, not a counter: armed by another character's failure, cleared when the
  Scholar rolls or at stage end; the Scholar's own failure does not arm it. (The spec's wording buffs an ally, which
  the resolver cannot express: R12 is queried for the ACTING character only. The Scholar still changes assignment,
  which is the point of the Calling: you put her in the slot behind the risky one.)
- **R4.12 Zealot.** +2 on every check while own Strain >= 2 (read at roll time, after any Push Strain).
- **R4.13 Warden.** Bench clears 3 instead of 1 (Feet "+1" adds to this).
- **R4.14 Gambler.** Once per stage, reroll any one check's die (own or ally's) after seeing it (R1.8).
- **R4.15 Herald.** +1 when the previous check resolved in this stage was by another character using the same stat.
- **R4.16 Reaver.** A PASSED MIGHT check that surged, against an Aspect, deals +2 damage
  (`{k:'surgeAspect', v:2, stat:'might'}`; the Weapon affix is the same key with no `stat`). A failed check deals
  nothing, so it deals no bonus either.
- **R4.17 Traits.** As the spec's twelve, with: Steady = floor 3 on all four stats (R1.3 cap); Bloodhound = +2 on
  the last check resolved in a stage (the sim knows which is last; at the boss, the last action of a round);
  Quickstudy = +1 on a stat this character has not rolled yet this quest; Surehanded = reroll natural 1s on all
  stats; Grim = +2 to all checks for the rest of the quest after an ally dies; Ninth Hour = +3 at the boss stage;
  Untethered = Ambush never applies to this character; Deepdrawn = surge threshold minus 1 on the highest rung
  stat (ties: the first in stat order); Steadfast = immune to contagion. Twelve more are authored in
  `data/traits.json` against the effect vocabulary (R12).

## R5. A stage (Depth I shape; the other Depths in R9)

- **R5.1 A quest** is a list of stages; the last is the boss (R7). Depth I: six stages, stage 6 the boss.
- **R5.2 A stage** has two slots. Each slot is a challenge of one shape: Gate, Chain, Relay, Vault, Toll, Open.
  Shape, stat(s) and TN(s) are rolled when the quest is generated (R5.4, R5.5), so the whole quest is fixed at
  the offer, and the sim and the page see the same quest from the same seed.
- **R5.3 What the player sees** before assigning: both cards, each with its shape icon, its stat glyph(s), its
  TN(s), its reward, its tags, and one line of text. TNs are VISIBLE by default. Blindness (after a WITS failure,
  next stage) and Blindfold (the Sigil) show "TN ?" in place of a number; the shape still tells the structure.
- **R5.4 Composition** (Depth I). Stage 1 and 2: Gate + (Open or Toll, 50/50). Stage 3 and 4: Gate + one of
  Chain, Relay, Vault at 40/40/20. Stage 5: two of Gate, Chain, Relay (each slot 40/30/30, independently, so
  Relay + Relay happens ~9%). `strainOnFail` 1 on stages 1 to 4, 2 on stage 5. Slot order is rolled (the Gate
  is not always first).
- **R5.5 Stats and TNs.** Each named stat is rolled from the stage's frequency row (spec 7.4). Gate: one stat,
  TN 4, 5 or 6 (`BALANCE.GATE_TN_WEIGHTS`, default 40 / 40 / 20; audit CORRECTION from 4 or 5 at 50/50, because
  measured over 200,000 generated Depth I quests **TN 6 never occurred anywhere in the game**: the shapes give TN 3
  at 27 percent, TN 4 at 52, TN 5 at 19 and TN 7 at 3, and the boss gives 4 and 5. A whole column of the master
  table was decorative, the d10 rung of the 50 percent diagonal the spec calls its spine was never used, and the 2
  point Token affix "+2 versus TN 6 or more" was worth a seventh of a +1 flat. One weight row fixes all three.) Chain: one stat for both checks, TN 3 then 4 (DECIDED:
  a Chain is one sustained effort). Relay: two stats rolled independently (may match), TN 4 and 4, two DIFFERENT
  characters. Vault: no stat, the assigned character chooses any stat at assignment, TN 7. Toll: one rolled
  stat, TN 3, 1 Strain paid on assignment (DECIDED: the named stat is what separates a Toll from an Open).
  Open: any stat, chosen at assignment, TN 3.
- **R5.6 Assignment, CORRECTED (audit).** Every slot must be filled. One character per slot, two different
  characters for a Relay. **A character may hold a second check only when the stage's checks outnumber the living
  deployed characters, and never both checks of one Relay.** That one sentence covers every case: three living at
  Relay plus Relay (four checks, three bodies) means one character takes a check in each Relay and nobody benches;
  two living at Gate plus Relay means both hold the Relay and one of them also holds the Gate; one living holds
  exactly one slot (a Chain is one slot) and every Relay is FORFEIT. A FORFEIT slot rolls nothing, pays nothing,
  costs nothing and fires no consequence. The character in no slot is the bench.
  The Vault's and Open's stat is chosen AT ASSIGNMENT (it is on the card, and the pre roll strip shows the
  consequence that stat carries). Push and roll twice are chosen per check at its own roll (R5.7).
- **R5.7 Resolution order, CORRECTED (audit).** Slot 1's checks, then slot 2's (a SEALED Vault is always last,
  R9.1). Each check: a **pre roll strip** (the character, the stat die, the TN, the consequence glyph for that stat,
  a PUSH chip and a TWICE chip when either is available, ROLL), so a player decides to Push a Chain's second check
  having seen the first; then roll -> RESULT card
  (pass or fail, the dice, surges, every modifier with its source, a REROLL if one is available) -> CONTINUE -> consequences (R5.8)
  -> next. A check whose holder is dead when its turn comes is FORFEIT (R13.1). Then stage end: bench clears (R5.6: 1, Warden 3, Feet +1, Hearthborn's ally), Pressgang Strain,
  Respite (Depth I and II: every living character clears BALANCE.RESPITE, **1** by the audit's build default; the
  prototype's grid may move it and PROTO-REPORT.md says so), rewards
  tallied, drops offered one at a time (R6.7), replacement offered if someone died (R5.10), next stage.
- **R5.8 Failure consequences by stat** (in addition to the Strain): MIGHT: nothing more (self contained).
  GRACE: the next slot resolved gains Ambush; if the GRACE failure was in the stage's last slot, Ambush lands on the
  next stage's first slot, and it is DROPPED rather than carried when the next stage is a boss (audit). Ambush is a
  one shot TAG on a slot, never a counter: it is shown on the card at assignment (R5.3), it adds +1 to the Strain of
  every failure in that slot (Untethered ignores it), two GRACE failures cannot make it +2, and it is consumed when
  the slot resolves whatever the result. A Relay's second check is the same slot. WITS: the
  NEXT stage's TNs are hidden (Blindness); a WITS failure on stage 5 hides the boss's Aspect TNs for round 1
  only. NERVE: contagion (R3.1). At the boss: none of these apply (there is no next slot); a failed Aspect check
  simply deals no damage, and the Strike is the cost (R7.4).
- **R5.9 Rewards** (paid only on a passed slot; a Chain or Relay pays once when both checks pass). Renown by
  shape (BALANCE.RENOWN): Gate 3, Open 2, Toll 4, Chain 6, Relay 6, **Vault 8**; the boss 12 (a Depth II first boss
  8). Relic rolls: Toll 1, Chain 1, Relay 1, **Vault 2, the first at +1 rarity tier**, the boss 1 at +1 tier;
  (audit CORRECTION on the Vault, which was the worst paying shape on the board while carrying the game's only TN 7
  and, at Depth IV, the seal a party must beat to leave the stage. At Depth I with a d8 assignee: Toll 4.71 expected,
  Chain 3.88, Vault 3.27, Relay 2.59. A card reading "a rich relic waits behind it" over the second lowest payout is
  a lie. At 8 Renown and two rolls the Vault pays 5.02 expected, the top of the ladder, which is what a TN 7 is for.) Gate and Open 0.
  Renown x BALANCE.DEPTH_RENOWN_MULT[depth] (1, 1.5, 2.25, 3.4, 5.1), rounded.
- **R5.10 Replacement mid quest** (Depth I to IV only). At any stage end with fewer than three living deployed,
  the player may bring in a reserve (owned, alive, Toughness > 0, not deployed) or pay 25 Renown to Recruit a
  new character straight into the party (creation screen). Or continue short handed. Depth V: neither.
- **R5.11 Withdraw: none.** A party leaves a quest by beating the boss or by dying. (DECIDED: the spec's death
  economy is computed on full commitment; a Withdraw is Stephen's call, listed in DIRECTOR CALLS.)

## R6. Relics (gear)

- **R6.1 Rarity and budget** by Depth: the spec's 11.3 and 11.4 tables, with two audit CORRECTIONS.
  (a) The 11.4 Depth IV row becomes **0 / 55 / 34 / 11**: it read Common 10 percent while 11.3 gives a Depth IV
  Common no point budget at all, so one drop in ten had nothing to fill. Ashwalker's free relic (R4.2) is Common at
  Depth I to III and Uncommon at IV and V.
  (b) **Depth V uses its own 11.3 and 11.4 rows** (0 / 45 / 40 / 15, budgets 4 / 7 / 10). The section 9 prose line
  "Relics drop at Relic rarity only" is the error: two tables beat one line, and under the prose reading every drop
  at Depth V carries a unique, which exhausts the twenty uniques in four quests and makes the Vault and boss "+1
  tier" a no op. A unique may repeat across items (it is a name and an effect, not a one of). If Stephen wants Relic
  only at Depth V it is one BALANCE row.
  "+1 rarity tier" = roll the rarity, then step it up one tier (Relic stays Relic). **The slot is rolled uniformly
  over the eight** (BALANCE.SLOT_WEIGHTS, all 1) before the rarity; a Commission fixes it.
- **R6.2 Affix fill.** Draw affixes valid for the slot, without repeating a key on one item (a stat targeted key
  may repeat with a different stat), until the points equal the budget exactly. Each draw picks uniformly among the
  valid affixes whose points do not exceed the remainder. If no valid affix fits the remainder (Hands, Feet and
  Weapon have no 1 point affix, so a remainder of 1 happens there), the remainder becomes "+1 Toughness" lines, 1
  point each, which every slot may carry.
  **CORRECTED (audit), because that filler was unwritable and it broke the Scar treadmill.** "Lines, plural, of one
  key" contradicts the no repeat rule in the same sentence, and the remainder is large: the Sigil Ward's only legal
  affixes are immunity 3 and partial 2 against budgets up to 10, so a Depth V Relic Ward would have carried FIVE
  points of Toughness, and a character in Ward, Feet and Chest would have worn +13 Toughness over a base of 4, which
  deletes spec 6.2's Scar treadmill, spec 6.3's retire or run decision and most of the Marrow supply with it. The
  three rules that fix it:
  (a) **The filler is ONE `toughness` line** whose value is the whole remainder, capped at `BALANCE.FILLER_MAX` = 2.
  (b) **`toughness` and `armor` may each appear twice on one item**, and nothing else may repeat its key with the
      same stat. (Chest owns those two mechanics; this is what lets Chest reach a Depth V budget.)
  (c) If the remainder still cannot be spent after 50 draws, the item is generated at the NEXT LOWER rarity's budget
      for that Depth, and its rarity label follows the budget, so a card never lies about what it holds.
  Two slots also gain what they need to reach their own top budget (spec 11.2's table left them short, which is what
  forced the filler in the first place):
  (d) **A sigil targeted key counts as one key per named Sigil**, exactly as R13.11 counts a floor key per stat, and
      immunity and partial never name the same Sigil (R9.3). So a Ward reaches 3 + 3 + 2 + 2 = 10 with the two keys
      the spec already prices and NO new affix and no new word list. (An earlier draft invented "immunity to a
      second named Sigil" as its own affix; it had no key, no word list, and R6.2's own no repeat rule forbade the
      alternative, so it could not be written at all.)
  (e) **Feet** gains `benchAlly` at 2 ("benching also clears 1 Strain from the most strained ally", already in the
      R12 vocabulary and used by nothing).
  Legal maxima are then Ward 10, Feet 9, Chest 9, every other slot already over 10.
  At most 50 draws per item; `sim.js --test` asserts a thousand items meet their budget exactly, never repeat a key
  except those two, and never carry more than `FILLER_MAX` of filler Toughness.
- **R6.3 Stat targeted affixes, CORRECTED (audit).** Generation picks the stat uniformly and never rerolls: a drop
  is rolled before it is offered and later moves between characters, so "a d12 stat" has no referent at roll time and
  retargeting at equip would mutate an item's name per wearer. At EQUIP a step on a stat already at d12 is greyed and
  does nothing (the precedent is R1.7's fourth flat point), and the drop screen shows its delta as 0. The effective
  die after a step feeds the floor cap, the surge threshold, Deepdrawn's highest stat and Quickstudy, all read at
  roll time.
- **R6.4 Uniques.** Relic rarity items carry one named unique from `data/uniques.json` (20), filtered by slot,
  on top of the budget. The unique's name replaces the procedural name.
- **R6.5 Naming.** `[Prefix] [Base] of [Suffix]`: Prefix from the highest point affix's `prefix` list, Base from
  the slot's six, Suffix from the second highest affix's `suffix` list. **A one affix item draws its suffix from
  that same affix's list** (audit CORRECTION from "no of clause": a one affix item is every 2 point Common and so
  about 60 percent of Depth I drops, and with no suffix it had 4 x 6 = 24 possible names, which repeat inside the
  first hour; with one it has 96). Ties: the affix drawn first. Word lists in `data/relic-words.json`.
- **R6.6 Wearing.** Eight slots per character. A relic goes on at the drop screen or moves between roster
  characters in the Character screen (MOVE TO, a roster sheet). Equip changes apply from the next check.
- **R6.7 The drop screen.** One relic at a time: its card, then the target row as small cards each showing what
  they wear in that slot and the point delta. **The target row is the DEPLOYED THREE during a quest and the LIVING
  ROSTER between quests** (audit CORRECTION: the screen is also where a Commission, the second most expensive Renown
  purchase, and a retired or dead character's gear are kept, and none of those happen while anyone is deployed;
  three cards are visible at a time, ordered by the point delta in that slot, best first, and the row scrolls
  sideways past three. Pillar 6 is about cards DEALT to choose between, never about a roster the player already
  owns.) TAKE RENOWN, and TO THE SHELF for a Ward, are offered in both contexts; tap one to equip (the replaced item converts to
  Renown at once: Common 1, Uncommon 3, Rare 6, Relic 12, BALANCE.SALVAGE); TAKE RENOWN converts the drop; a
  Ward may go TO THE SHELF when a shelf slot is free (the button is HIDDEN, not greyed,
  when no slot is owned, so an account at `wardShelfSlots` 0 sees a deliberate absence rather than a broken control;
  a Ward on the shelf carries TAKE RENOWN at its salvage value, and a worn Ward's MOVE TO sheet lists THE SHELF when
  a slot is free). Between quests the same screen serves the Hall's Commission.
- **R6.8 The dead.** At quest end, each item on a dead character is offered on the drop screen to the
  survivors. On a full wipe everything on the dead converts to Renown automatically (the salvage line on the
  wipe card), so a wipe still pays (spec pillar 4).
- **R6.9 Reforge** (15 Renown): pick an affix line on a relic; it is redrawn to another valid affix of the same
  points (stat retargeted freely; a retarget of the same key counts as another affix); never the unique. When no
  different key and no other stat at that point value is valid for the slot (Head's only 3 point affix, a 1 point
  Toughness filler on Hands, Feet or Weapon), REFORGE on that line is greyed and labelled Fixed.
- **R6.11 Affix prices, CORRECTED (audit).** The spec's section 11.2 prices every affix in one unit, "1 point is
  about +0.5 expected value, about +6 percent success at TN 5". Measured against that unit and the real quest shape
  (12.8 checks a quest, 4.27 per character), four rows are wrong and two units are being mixed:
  - **"Floors count as +1" on Head: 1 point, not 3.** With the half die cap restored (R1.3, as the spec states it
    twice), the affix pays only on a stat sitting at floor 3 on a d8 or larger, which is +0.117 expected value.
    At 1 point it is honestly priced; at 3 it was thirteen times underpriced. Ironbound keeps its Armor and its
    floors clause and is worth its points through the Armor.
  - **Step one stat up one rung: 2 points, not 3.** It is worth 0.924 expected value, 0.308 per point, the worst
    offensive line in the book, while the 1 point "reroll natural 1s" pays 0.544 per point. The spec's own claim
    that "floors give less raw expected value than a die step" is false at d10 (equal) and d12 (the floor is 25
    percent better) and the floor is the cheaper affix.
  - **The half die floor delivers 0.25 on a d4 and 1.25 on a d12**, a five times spread for one price. The
    generator refuses to roll it onto a d4 or d6 stat, the way R6.3 refuses a step onto a d12.
  - **The once per stage family is four to eight times the flat family per point, so the Charm's "reroll one die
    per stage" is 6 points, not 3.** A reroll fires on about 7.5 stages a quest for 0.89 extra passes per point
    against a +1 flat's 0.11. The price is the fix, not a rulebook exception: R13.3 keeps "per stage" meaning ONE
    thing everywhere.
  - **"Surge on N minus 1" buys zero success at TN 5 on every die from d6 up**, because those faces already passed.
    Its whole value is surplus damage at the boss and the TN 7 Vault. It is a damage affix, never a success affix,
    and it stays off the Token so it cannot read as a general bonus. The same footnote covers Toughness, Armor,
    strike reduction and bench value, which the expected value unit cannot price at all.
- **R6.10 Commission** (40 Renown): three relics of a chosen slot rolled at the highest UNLOCKED Depth's weights
  AND budgets; keep one (the drop screen); the other two vanish.

## R7. The boss

- **R7.0 THE FOURTH ASPECT IS DORMANT (audit; this is what ships until Director call 1 is answered).** At Depth IV
  and V a boss shows four Aspects, and the fourth is DORMANT until one of the first three breaks: a dormant Aspect
  cannot be assigned, deals nothing and STRIKES NOTHING, and it wakes the instant an Aspect breaks so the party
  always faces exactly three. Without it, four Aspects of 21 hit points against three bodies at a Strike of 3 gave
  **0 wins in 200 quests with 600 of 600 characters dead**. `sim.js --depths` cites this rule.
- **R7.1 An Aspect** has a name, a locked stat, a TN, and hit points, and the field is **`hp`** (the spec's schema
  calls it `toughness`, which is the dead name: `data/bosses.json` and the prototype both ship `hp`, and a boss read
  through the wrong field has Aspects that can never be broken). `sim.js --data` asserts every Aspect of every boss
  carries an integer `hp` above zero. A boss has three Aspects on
  three different stats; every boss also carries an authored fourth Aspect on the missing stat, used at Depth IV
  and V only. Hit points: authored at Depth I, +1 at Depth III, +2 at IV and V (spec: 3 to 4 rising to 5 to 6).
- **R7.2 A round.** Every living deployed character is assigned to one Aspect (doubling up allowed; nobody
  benches). Options as R5.6. Resolve in party order: a passed check deals `max(1, surplus) + weapon bonuses`
  (Reaver +2 on a MIGHT surge; "+1 surplus damage" adds 1; "surge vs an Aspect +2"); a failed check deals 0.
  An Aspect at 0 or less is BROKEN and stays broken. A character whose Aspect is already broken when their
  turn comes rolls instead against the unbroken Aspect with the fewest hit points left (its stat, its TN);
  DECIDED: a wasted action because an ally overkilled is a punishment the player could not see coming.
- **R7.3 Win.** All Aspects broken: the boss falls, the quest is won, rewards (R5.9), the boss's relic.
- **R7.4 Strikes, CORRECTED (audit).** After the round, each UNBROKEN Aspect strikes for `BALANCE.STRIKE` (the
  values are in the block below and in the plan's section 4, and nowhere else: this sentence used to carry the
  spec's own 2 at Depth I to III, which the same rule then overturns two lines later, and a builder writing an
  assertion from the top of a rule would have pinned the number the audit measured at a 78 percent wipe). `BALANCE.STRIKE_TARGET` is **`attackers`**: every character who ACTUALLY ROLLED
  against that Aspect this round takes one instance of it (a retargeted character is an attacker of the Aspect they
  rolled against, R7.2), and an Aspect nobody faced strikes every living character. Strike reduction (Vanguard, the
  Chest affix) and Unkillable apply per instance.
  ⛔ **`BALANCE.STRIKE` is 1 at Depth I and II, 2 at III, 3 at IV and V** (audit CORRECTION, and Director call
  number one). At the spec's 2 the boss kills the whole party: under `attackers` each of the three characters is
  struck once for 2 every round, so at Toughness 4 with no Armor they are at 2 after round one and dead in round
  two, against three Aspects holding ten hit points that a tier one party breaks in about six checks worth 9 to 15
  damage. A 20,000 quest simulation at the spec's numbers measured a per character death rate of **81 percent** and
  a **78 percent** full wipe, against targets of 12 to 15 and 8. The same simulation found what the spec's own
  section 8.6 was really describing: the PRE BOSS stages alone measure 13.45 percent, 31.50 percent and 1.47
  percent with 0.404 Legacies a run, which is section 8.6 almost to the decimal. So 8.6 was never a whole quest
  number, and the boss was never costed. Measured alternatives, all at Depth I: Toughness 9 gives 17.2 / 23.6 /
  12.8; Toughness 10 gives 10.5 / 14.6 / 7.7; STRIKE 1 with Toughness 8 gives 8.7 / 12.9 / 6.1; Aspect hit points
  2/2/3 with Toughness 6 gives 32.4 / 43.3 / 24.9. STRIKE 1 is the cheapest change that also makes the spec's own
  prose true again ("a balanced roster breaks all three in two or three rounds and walks out at half health"), and
  it leaves base Toughness at 4 so the Scar treadmill still works.
  ⛔⛔ **Fable then simulated the boss independently (4,000 fights a row, a fresh tier one party, Push when safe,
  always the weakest unbroken Aspect) and NO SINGLE LEVER FIXES IT.** The boss alone, before the five stages that
  precede it:

  | boss configuration | party wins | per character death | full wipe |
  |---|---|---|---|
  | Strike 2, hit points 3/3/4, the spec | 49.8% | 56.8% | 50.2% |
  | Strike 1, hit points 3/3/4 | 61.2% | 43.6% | 38.8% |
  | Strike 1, hit points 2/2/3 | 79.7% | 24.4% | 20.4% |
  | Strike 1, hit points 2/2/2 | 84.8% | 18.7% | 15.2% |
  | Strike 2, hit points 3/3/4, striking only those who FAILED | 68.3% | 39.6% | 31.7% |
  | Strike 1, hit points 3/3/4, plus 2 Armor | 86.4% | 16.8% | 13.6% |
  | Strike 1, hit points 3/3/4, Toughness 6 | 86.4% | 15.9% | 13.6% |

  The best of them still kills a character in one run of six and wipes one party in seven, at the boss alone, on top
  of the 13 percent per character the five stages before it already cost. **So the spec's death targets and the
  spec's boss cannot both stand.** That is not a tuning problem, it is a Director call, and the honest reading is the
  one the measurements point at: section 8.6 describes the PRE BOSS game exactly, and the spec's own boss prose says
  the fight "will cost a character". Either the boss is much softer than 3/3/4 at Strike 2, or a whole quest's death
  rate is meant to be two to three times what 8.6 says and the career and Marrow income move with it.
  ⛔⛔ **And Depth IV and V are worse: as specified they are UNWINNABLE.** A third auditor drove the plan's own
  policy through 200 quests at each Depth: at Depth IV and V, **0 wins in 200 and 600 of 600 characters dead.** The
  arithmetic is the fourth Aspect: four Aspects totalling 21 hit points against three bodies needs about seven
  rounds, and a Strike of 3 kills a Toughness 4 character in two. **Two one line fixes, either of which makes it a
  fight; the second is the smaller:**
  (a) the fourth Aspect is DORMANT until one of the first three breaks, so three bodies always face three Aspects;
  (b) an Aspect that nobody faced strikes ONE character (the most strained, party order breaking ties) rather than
  every living one, which is the clause that currently multiplies an unfaced Aspect across the whole party.
  **What ships until he rules:** Strike 1 at Depth I and II, the spec's hit points, ruling (a) so a fourth Aspect
  never faces an empty seat, and a harness that asserts the PRE BOSS numbers against 8.6 (which they match) and
  REPORTS the whole quest numbers rather than failing on them. `sim.js --depths` asserts winnability as a LAW at every Depth:
  over 200 quests with the policy from a rested roster, **the win rate at each of II to V is between 25 and 75
  percent**, naming the Depth that failed. ⛔ Not "above zero", which one win in two hundred satisfies: that is the
  fleet's own scar, a probe that cannot meaningfully fail, standing guard over the single most broken number in the
  design. And measure ruling (a) at Depth V BEFORE shipping it: dormancy cuts the incoming Strikes from four to
  three a round but leaves 21 hit points and about seven rounds, so if it does not clear 25 percent, ship ruling (b)
  as well or instead, and if neither clears it the Aspect hit points at IV and V are the lever, which is Director
  call 1's real question. The other two laws are kept in BALANCE as strings and are one word
  away, but: `all` (every living character every round) wipes a fresh party whenever two Aspects survive round one
  (2 x 2 = 4 = base Toughness, before Armor), which contradicts the spec's own "a balanced roster breaks all three
  in two or three rounds and walks out at half health"; and `spread` lands each point as its own instance, which
  makes a Vanguard immune to the boss and kills through Unkillable one point at a time. The prototype's grid may
  move BALANCE.STRIKE only; PROTO-REPORT.md says what it measured. Then the death test; then the next round. Rounds continue until the boss
  falls or the party is dead. No Respite, no bench, no Armor refill at the boss.
- **R7.5 Text.** A boss has an intro line (shown on the boss card), each Aspect a one line description, and a
  cause line for the Hall wall ("drowned at the Gate"). `data/bosses.json`, six bosses, five at launch plus one
  spare (spec 16 wants five).
- **R7.6 Depth II and III** quests hold two bosses (R9.1): the first at half hit points (rounded up), reward 8, its
  Strikes normal, and it drops one relic at +1 tier like any boss (that roll is what makes a mid quest boss worth its
  Strikes). Each quest draws its bosses without repeating.

## R8. Economy and the Hall

- **R8.0 THE STRAY (audit, a blocker: without it the game soft locks).** Whenever the roster holds no deployable
  character (alive, effective Toughness above 0) and `renown < 25`, the Recruit button reads TAKE IN A STRAY and
  costs 0, one at a time; the next costs 25 again. A first quest wipe leaves three dead, about 12 Renown by the
  spec's own number, and a Recruit priced at 25, and no Marrow purchase is a body: the account is over, at the spec's
  own 8 percent wipe rate. A stray is unproven, so its own death pays no Marrow (R8.5) and it cannot be farmed.
  Deploy allows one or two characters only when the roster cannot fill three, and the offer card says short handed.
  **The roster count is LIVING characters only:** Recruit refuses with "Roster full" at `alive >= rosterSlots`; a
  dead character leaves `roster` at quest end once R6.8 has offered its gear, and lives on in the wall and the
  legacies; a retired or dismissed one leaves as soon as its gear reaches the drop screen.
- **R8.0b THE PRICE INDEX (audit).** Every **RENOWN** price in R8.1 is multiplied by
  `BALANCE.PRICE_INDEX[deepest Depth ever completed]` and rounded to the nearest 5. It defaults to the Renown
  multiplier itself, 1, 1.5, 2.25, 3.4, 5.1, so a Commission runs 40, 60, 90, 135, 205. Income multiplies twice over
  (more stages AND the Depth multiplier: about 43 Renown a Depth I run against about 273 at Depth V) while every
  price the spec prints is a constant, so without the index a single Depth V run buys six Commissions and four Scar
  excisions, Renown stops being a decision after Depth II, and the 25 Renown that brakes the Recruit farms erodes to
  nothing. The index also makes farming a shallow Depth pointless, which is the direction the game already wants.
  ⛔ **Marrow prices are NEVER indexed** (a critic caught the first draft's "every Hall price", which captured R8.2
  as well: the Legacy slot at 2 would have indexed to 0 and been free on every Depth I account, and at Depth V the
  Marrow tree would have cost 1.7 times more in real terms because Marrow income scales on DEPTH_MARROW_MULT of
  1, 1, 2, 2, 3 while the index runs to 5.1). Set the row to all ones to get the spec's printed prices back.
- **R8.1 Renown** is earned per passed slot (R5.9), by salvage (R6.7), and is spent in the Hall: Reforge 15,
  Commission 40, Recruit 25, Redeal 10 (a fresh character before its first quest: three new Callings), Mend 20
  (every roster character to 0 Strain), Excise a Scar 60 (R2.5), Ward Shelf slot 30 then +15 each (six max).
- **R8.2 Marrow** is earned by death (R8.5) and retirement (R2.6) and spent: Raise creation floor 3 (that stat
  never rolls under d6 at creation) then 6 (never under d8), per stat; Roster slot 4 then +2 each (3 to 8);
  Legacy slot 2 (+1 dealt, 2 to 3, cap 3 because the deal is three cards); Unlock Origin 5 (three of the locked
  Origins dealt, pick one; fewer than three left shows what is left); Consecrate a Legacy 6 (that Legacy is
  always one of the three Calling cards; only one Legacy may be consecrated at a time, consecrating another
  un-consecrates the first, DECIDED: two consecrated plus a stock card would be the whole deal every time).
- **R8.3 Between quests, Strain persists.** A roster character NOT deployed for a whole quest clears
  `BALANCE.REST_FRACTION` of its Strain when that quest ends, rounded down; the default is 1, a full rest. Mend
  clears everyone now. ⛔ Know what the default costs: at six or more roster slots the player always has three rested
  bodies, so **Mend is an early game sink that stops being bought at the second Marrow roster slot** (audit). Setting
  REST_FRACTION to 0.5 keeps Mend alive for the whole game and makes rotation a partial answer rather than a total
  one; it is one number and it is a Director call, so nothing is tuned around Mend as though it were a late purchase. (DECIDED: this is the only reading under which Mend, the
  bench, and roster slots each have a job; the sim measured Respite and this together.)
- **R8.4 Quests completed** increments once per quest, on the FINAL boss falling (a Depth II or III quest holds two
  bosses, and counting both would halve every unlock), **and only when the quest was played at the deepest unlocked Depth OR ONE SHALLOWER** (audit CORRECTION: with no Depth qualifier the cheapest road to Marrowdeep is fifty Depth I runs, about
  four hours of the shortest and safest content, arriving at Depth V with a roster that has never seen a Strike of
  3, a fourth Aspect or a sealed stage. The thresholds and the fifty quest total are preserved exactly: 3 wins at I,
  7 more at II, 15 more at III, 25 more at IV.) One shallower is a deliberate lane: a critic pointed out that
  counting ONLY the deepest leaves progression available exactly where a roster cannot survive, and two auditors
  measured Depth IV and V at zero wins, so a player who unlocks a Depth they cannot beat would have no way to
  advance at all. One Depth back still means Strikes, Strain that does not clear and sealed stages, so the fifty
  Depth I runs farm stays shut. Two Depths back pays Renown, relics and Marrow and buys no depth. Depth unlocks: II at 3, III at 10, IV at 25, V at 50.
- **R8.5 Death pays** `round(1 x DEPTH_MARROW_MULT[depth])` Marrow (1, 1, 2, 2, 3) **at the full rate only for a PROVEN
  character, one with `questsSurvived >= 1`** (audit CORRECTION, and a Director call). **An unproven death pays a
  flat 1 Marrow at Depth I to III and 0 at IV and V**, and always makes the Legacy and writes the wall. A critic was
  right that paying an unproven death nothing breaks pillar 5, "death is productive", for EVERY death in a player's
  first quest, on an account where every character is unproven and the spec's own wipe rate makes that a common
  opening. The farm the rule exists to close lives at Depth IV and V, where the multiplier and the mid quest Recruit
  are richest: an unproven death there paid 3 Marrow and a fresh body could be fed to the boss at every stage end,
  9 to 14 Marrow a quest against an income of 1.5. So the rule lives there and nowhere else. With this and RETIRE_VESTING every Marrow in the game
  passes through at least one survived quest, which is what the spec's section 8.1 says the gate is.
  Retirement pays per R2.6 (a retirement is not in a quest).
- **R8.6 Creation floors** per stat: 4 (none), 6, 8. Applied in R2.1 LAST, after the Origin, so a paid floor is
  never undone by Straycall.
- **R8.7 Legacies.** Every death or retirement adds `{id, calling, charName, diedAt, depth, consecrated:false}`.
  At creation the three Calling cards are filled: the consecrated Legacy first if any; then Legacies drawn at random
  with distinct callings until the deal holds `account.legacySlots` Legacy cards in all (the consecrated one occupies
  one of those slots); then stock Callings not already represented, until three. **At least one of the three cards is always a Calling the
  player owns NO Legacy for** (audit CORRECTION; `legacySlots` starts at the spec's 2 and caps at 3): without it, buying the 2 Marrow Legacy slot up to 3 permanently deletes stock Callings from every
  future deal, so an account whose dead are a Vanguard, a Zealot and a Warden could never roll a Cutpurse again, at
  any tier, for ever. The cheapest purchase in the game must not narrow the character pool for the life of the
  account. A critic was right that the first draft paid for the fix with the spec's own escalation: starting at 1
  made the 2 Marrow Legacy slot a single click back to where the spec begins, and spec 8.5's promise is that a
  hundred hours in the deal is the player's own history. Enforcing the real invariant instead keeps a door open to
  every Calling without ever capping the history. A Legacy card names the dead, and its wording is `cards.legacy` in `lines.json`
  and NOWHERE else (it had three different forms in three files, on a card that appears in creation, in the Hall and
  in the Marrow sheet). Picking a Legacy gives that Calling's effect, nothing more (the spec: the same ability, the player's
  history on the card). Legacies are never consumed.
- **R8.8 The wall.** Every interred and retired character in order, rendered from `cards.wall` in `lines.json`
  (`{name}. {origin} {calling}. {quests} quests. {cause}.`) with the cause as `bosses.json` ships it, lower case,
  capitalised by nothing. The newest on top. Nothing on it is editable (no player text anywhere, studio law).

## R9. The Depths

- **R9.1 Shapes.** I: stages 1 to 5 as R5.4, 6 boss. II: eight stages, 1 to 3 as I's 1 to 4 pattern (1, 2 like
  stage 1; 3 like stage 3), 4 the FIRST BOSS (half hit points), 5 and 6 like stages 3 and 4, 7 like stage 5,
  8 the boss; Chain and Relay weights doubled (stage 3 to 6's second slot: Chain 40 Relay 40 Vault 20 becomes
  Chain 45 Relay 45 Vault 10; stage 1 and 2's second slot: Open 25 Toll 25 Chain 25 Relay 25). III: II's shape,
  RESPITE 0 (Strain persists between stages, benching is the only recovery), Aspect hit points +1. IV: III's
  shape, Aspects gain the fourth, Strike 3, and stages 3 and 6 are SEALED: one slot is a Vault that must be passed to
  leave the stage. **The sealed Vault always resolves LAST and only it repeats** (audit CORRECTION): the other slot
  resolves once, and between attempts nothing happens except the Vault's own Strain instance and a fresh choice of
  holder and stat (that is all "assigned again" means). No bench clear, no Hearthborn, no Armor refill, no Respite,
  no rewards, no drops, no replacement between attempts, or a Warden benching for 3 against a Strain of 1 heals the
  party for ever. Stage end runs once, when the Vault passes or the party is dead. A lone survivor holds the Vault
  every attempt. Ambush from the other slot is consumed by the first attempt; a failed GRACE attempt puts Ambush on
  the next one. The pre roll strip greys a character whose best possible total cannot reach 7 and says "cannot
  reach"; if nobody can reach it, the stage still offers the Vault and the party dies there. V: IV's shape, no replacement mid quest, drops at the Depth V table rows,
  0 / 45 / 40 / 15 with budgets 4 / 7 / 10 (R6.1b; the spec's "Relic rarity only" prose is the error and R6.1b says
  why. This sentence used to restate the error and a gate was being written to enforce it).
- **R9.2 Sigils** per quest offer: I 0 or 1 (50/50), II 1, III 1 or 2, IV 2, V 2 or 3; distinct; NO exclusion
  table (DECIDED: Hollow Air with Shivering is a pure die quest and the offer shows it before anyone commits;
  Marrowdeep is supposed to be that cruel). Effects exactly as the spec's table, with Pressgang and R3.1.
- **R9.3 Wards.** A Ward names one Sigil at generation ("Ward of Still Air" is Hollow Air). Immunity (3 points):
  the wearer ignores that Sigil. Partial relief (2 points), per Sigil: Hollow Air, the wearer surges once with
  no chain; Rustbound, the wearer keeps 1 Armor; Shivering, the wearer keeps floors up to 3; Pressgang, the
  wearer as third takes 0 but clears nothing; Thin Ice, the wearer's own first failure each stage costs the normal
  amount (an ally's still costs 2); Blindfold, the card the wearer is assigned to shows its TN once the wearer is on
  it, before RESOLVE. Every partial is a DECIDED line.
- **R9.4 The offer.** The Hall shows one offer per unlocked Depth: Depth name, its Sigils, its boss name(s)
  and each boss's stat glyphs (not the TNs). An offer re-rolls only when a quest at ITS OWN Depth ends, won
  or wiped; the other Depths' offers stand (audit CORRECTION: re-rolling everything on any quest made a four minute
  Depth I run the cheap re-roll this rule exists to forbid, and it is exactly how a player would dodge a cruel
  Depth V pair). No paid re-roll (DECIDED: a free or cheap re-roll deletes the Sigil decision).

## R10. Content banks (authored today into `plans/marrowdeep/data/`, pasted into DATA by the builder)

- **R10.1 Challenge text**: Gate 20 lines per stat, Chain 8 per stat, Relay 16, Vault 16, Toll 12, Open 12, in
  `challenges-<stat>.json` and `challenges-shapes.json`. **A line is drawn without repeating inside a quest AND
  without repeating any line used in the last three quests** (a small recently used ring in the save; audit: the
  banks are half to a quarter of the spec's stated target of about 40 per stat per shape, a GRACE Gate repeats with
  69 percent probability by quest 5 without the ring, and the ring buys more freshness than doubling any one bank).
  Growing the banks toward the spec's number is authoring work, not a rule, and the plan's section 10 records it. Each under 90 characters, present tense, second person plural ("you"), no dash, no bang, no name
  of any real place, one image per line. A line is drawn per slot without repeating inside a quest.
- **R10.2 Bosses** `bosses.json`: six.
- **R10.3 Traits** `traits.json`: the twelve seeded plus twelve, every effect in the vocabulary (R12).
- **R10.4 Uniques** `uniques.json`: twenty, each `{id, name, slots:[...], effect, line}`.
- **R10.5 Names** `names.json`: 60 first names, 60 second names, both syllable clean, no dash; the generator
  never repeats a full name inside one account.
- **R10.6 Relic words** `relic-words.json`: per affix key 4 prefixes and 4 suffixes (25 keys, `benchAlly` included
  since R6.2 gave Feet that affix); per slot 6 bases. ⛔ `sim.js --data` generates a thousand names and fails on any
  that contains "undefined", and asserts the affix keys in BOTH directions: every key the generator can draw has a
  word list, and every word list key is a key the generator can draw. One direction is not enough; the prototype
  drew `condDead` against a list named `condDeadAlly` and was missing `benchAlly` entirely, and only the pair of
  assertions catches both.
- **R10.7 Lines** `lines.json`, which is also the ONLY place a player facing string lives: it carries a `ui` block
  with the twenty five button labels (BEGIN, CONTINUE, HOW, ROLL, KEEP, REDEAL, REROLL, DEPLOY, GO, RESOLVE, PUSH,
  TWICE, TAKE RENOWN, TO THE SHELF, BACK, CLOSE, NEXT, RETIRE, DISMISS, EXCISE A SCAR, MOVE TO, GOT IT, TAKE OVER,
  TAKE IN A STRAY, BENCH) and VIEW pulls every label from it, so the copy law scan reads one file instead of
  grepping source. It contains: Origin and Calling blurbs (one sentence each), Sigil blurbs, the SIX shape
  blurbs, which show in context on a challenge card the first time each shape is dealt and never on the HOW
  screen (six shapes, not seven, and HOW is six other fixed lines), the death and retirement cards' lines, the Depth names and one line each.

## R11. Screens (portrait, one hand, every button 48 px rendered at 375 wide, the bottom left 120x120 empty)

- **R11.1 Title.** MARROWDEEP, one line under it, CONTINUE or BEGIN, HOW, sound toggle.
- **R11.2 Hall** (the home): Renown and Marrow counters top; the QUEST offers (one card per unlocked Depth);
  ROSTER, THE WALL, SPEND (two sheets: Renown, Marrow), WARD SHELF.
- **R11.3 Creation.** ROLL (the four dice tumble and settle, the Origin card turns), then three Calling cards,
  tap one, NAME shown, KEEP. REDEAL (10 Renown) under the cards.
- **R11.4 Roster.** Up to eight character cards (portrait, name, four dice, Toughness and Strain, Scars,
  Calling). Tap one for the Character screen. From the offer: DEPLOY marks three.
- **R11.5 Character.** Portrait, Origin and Calling lines, four stat dice (big), eight gear slots as glyph
  tiles, Traits, Scars, Toughness and Strain, RETIRE or DISMISS, EXCISE, MOVE TO on a gear tile.
- **R11.6 Quest.** Stage title and count, the Sigil marks, and the lantern line when the party holds a Lanternborn
  (R4.6); two challenge cards, a Relay's carrying two numbered seats each with its own stat glyph and TN; three
  character cards (Strain pips, Armor pips, dice); assign by tapping a character then a card, or a card then a
  character. **PUSH and TWICE are NOT on the character card** (audit CORRECTION): they live on the pre roll strip of
  R5.7, because a Chain gives one character two checks and the second is decided after seeing the first, and because
  two 48 px chips do not fit on a card that is 93 px wide at 320. RESOLVE. Then, per check, the pre roll strip, the
  roll, the RESULT card with CONTINUE (and REROLL when one is available, naming its source). Stage end sheet: bench,
  Respite, rewards, the drop screen or screens, the replacement offer if anyone died, NEXT.
- **R11.7 Boss.** Three, or four at Depth IV and V, Aspect cards with hit point pips and **up to three portrait
  seats each** (every character is assigned and doubling up is allowed, so without seats the screen cannot show who
  is on what); three character cards; a round counter; the party's Strain bar (sum of Strain over sum of Toughness).
  Assign, RESOLVE, the pre roll strip and RESULT card per check with its damage line, then the Strike card, then the
  next round. At 320 wide four Aspect cards are two rows of two.
- **R11.8 Aftermath.** Won: the boss falls, rewards, drops, then for each survivor the Scar then the Trait
  choice. Lost: the wipe card with the salvage line and the Legacies made. Then the Hall.
- **R11.9 Death moment.** Not a screen: the character card goes to bone, one line ("Vessa Orn is interred"),
  CONTINUE. The Hall shows the new wall line and the Legacy card once.
- **R11.10 HOW.** Six lines, no more, shown before the first quest and from the title.

## R12. The effect vocabulary (one resolver; every Origin, Calling, Trait, affix and unique compiles to these)

Each effect is `{k, ...}`; `stat` is a stat name or `all` or `highest`. The resolver is queried by the engine at
the moments named in brackets, and nothing else in the engine knows a Calling from a Trait.

```
flat        {k, stat, v}                  [roll]      +v, under the R1.7 cap only when `perm:true`
floor       {k, stat, v}                  [roll]      floor v, R1.3 cap; v may be the string "half",
                                                      meaning the EFFECTIVE die over two read at roll time
                                                      (so a stepStat that changes the die changes the floor)
floorPlus   {k, v, gearOnly}              [roll]      every floor this character has reads v higher, before the
                                                      R1.3 cap; sources ADD; gearOnly true counts only floors
                                                      that came from relics (Ironbound), false lifts them all
                                                      (the 3 point Head affix, Vanguard's and Steady's included)
surgeMinus  {k, stat}                     [roll]      threshold minus 1, R1.2 cap
stepStat    {k, stat}                     [equip]     one rung up while worn
reroll1s    {k, stat}                     [roll]
twiceStage  {k, stat|all, auto:true|false}[stage]     once per stage; auto = first matching check, no toggle
rerollStage {k}                           [stage]     once per stage, after the result
toughness   {k, v}   armor {k, v}         [equip]
strikeLess  {k, v}                        [strike]
benchPlus   {k, v}                        [bench]
benchAlly   {k, v}                        [bench]     the most strained ally clears v
benchOnce   {k}                           [stage]     once per quest, act and bench both
relayPlus   {k, v}                        [roll]      on a Relay check
aspectDmg   {k, v}                        [damage]
surgeAspect {k, v, stat?}                 [damage]    a PASSED check that surged; with `stat` only that stat
                                                      (Reaver is stat 'might'; the Weapon affix omits it)
sigilImmune {k, sigil}  sigilPartial {k, sigil}  [quest]
cond        {k, when, v, stat?}           [roll]      when is exactly one of these fourteen, and no token below
                                                      is ever split across two lines:
                                                        tn6plus  strain2  firstOfStage  lastOfStage
                                                        perDeadAlly  boss  unusedStat  sameStatAsPrev
                                                        afterFailByOther  relay  chain  vault  toll  open
pushFree    {k, n}                        [push]      first n pushes each stage cost 0
tollFree    {k}                           [assign]
unkillable  {k}                           [death]
ignoreAmbush {k}   contagionImmune {k}    [strain]
seeHidden   {k}    previewNext {k}        [stage]
grim        {k, v}                        [roll]      after an ally died this quest
respitePlus {k, v}                        [stage]
extraRelic  {k, rarity}                   [quest]
```
A trait, unique or Calling that cannot be written in this table is not written. The gate `sim.js --data` compiles
every content file and refuses any unknown `k` or `when`. (`floorPlus`, `floor` with "half" and `surgeAspect`'s
`stat` are audit additions: without them Ironbound, the two point half die Head affix, the three point "floors count
as +1" Head affix and Reaver, all of which the spec's own tables call the law, could not be written at all.)

---

## R13. EDGE RULINGS (from the Sep 08 audit; each is binding, each answers a case a builder hits in the first hour)

- **R13.1 A character who dies mid stage after assignment.** A NERVE failure in slot 1 can kill the holder of slot 2,
  a Relay partner or the bench. A check whose holder is dead when its turn comes is FORFEIT exactly as R5.6's lone
  survivor case: no roll, no reward, no Strain, no consequence. A Relay with a forfeited check pays nothing and its
  other check rolls only if it comes first. A dead bench clears nothing and Hearthborn's ally clear needs a living
  bench. Push and twice toggles on the dead are void.
- **R13.2 Every Push is re-validated at the roll.** A Push chosen while safe can become lethal by roll time (contagion
  landed in between). If it would now bring Strain to Toughness it is dropped, the RESULT card says "Push refused",
  and a dropped Push does not spend Saltblood's free one. A Push is refused whether or not Unkillable is unspent:
  a Push never brings Strain to Toughness.
- **R13.3 At the boss, a ROUND is a stage** for every `[stage]` counter and every `firstOfStage`, `lastOfStage`,
  `sameStatAsPrev` and `afterFailByOther` condition; they all reset at round start. This follows Bloodhound, which the
  spec already reads per round at the boss. There is NO exception: a critic
  pointed out that carving `rerollStage` out to reset per fight gave one player facing word two meanings, so a
  player who learns "per stage" from Cutpurse gets it wrong on Gambler, at the boss, in the moment that decides the
  run. The affix pricing problem it was solving is solved with a PRICE, which is where R6.11 already puts it: the
  Charm's "reroll one die per stage" is 6 points, not 3. If Gambler the Calling is then too strong at the boss, the
  fix is in the Calling's own words on its own card, never in a rulebook exception nobody reads.
- **R13.4 "The last check of a stage"** cannot be read off the layout, because a Chain's or Relay's second check
  exists only if the first passed and a forfeit removes checks. A check is LAST when no check can follow it whatever
  its result: a Chain's or Relay's FIRST check is never last; a second check in the final slot is; a Gate, Vault,
  Toll or Open in the final slot is; at the boss it is the last character in party order who still has an unbroken
  Aspect to roll against. FIRST is the first check that actually rolls.
- **R13.5 Party order** is the order the player marked DEPLOY, shown left to right on every screen, and it is what
  "party order" means in R7.2, in Hearthborn's tie, in Herald and in every tie break below.
- **R13.6 Boss retarget ties (R7.2).** Equal hit points: the Aspect whose stat the character rolls the bigger die on,
  then card order. Toggles carry to the new Aspect and are paid against its stat and TN. For Strikes a character is
  an attacker of the Aspect they actually rolled against. If every Aspect is broken before their turn they do not
  roll and no Push is paid.
- **R13.7 Death is tested per instance** (R3.2). At the boss, later instances in the same round skip the dead;
  interment happens after the Strike animation.
- **R13.8 The Toll fee is paid at RESOLVE**, when assignment locks, not when the character is dropped on the card
  (or dragging someone off would burn a Strain per try). It skips Armor and can trigger Unkillable. A character whose
  fee would reach Toughness cannot be assigned to the Toll (the chip says "Cannot pay"); if no living character can
  pay it, the Toll is FORFEIT.
- **R13.9 The Strain of one failure** is `max(strainOnFail, 2 if Thin Ice and this is the stage's first failure by
  anyone) + 1 if Ambush`. The stage's first failure consumes the Thin Ice trigger whoever it belongs to, the Ward's
  wearer included.
- **R13.10 Consequences follow the stat actually rolled**, chosen or named, with no exception for Open: a NERVE Open
  that fails is contagion. The pre roll strip shows the consequence glyph beside the chosen stat, so choosing a stat
  on a Vault or an Open is an informed choice rather than a trap.
- **R13.11 Floors.** For R6.2's repeat rule every floor key counts as one key per stat, so one item carries at most
  one floor line per stat. `floorPlus` sources ADD before the R1.3 cap; Ironbound lifts floors that came from gear
  only, the Head "floors count as +1" affix lifts every floor the wearer has, Vanguard's and Steady's included.
- **R13.12 Rerolls compose like this.** A reroll re-runs the whole roll with the same options (a twice stays a twice,
  a paid Push stays paid) and the new result stands. A check rolls at most TWO chains: when an automatic twice fires
  (Cutpurse), the manual twice chip is unavailable and is not consumed. `reroll1s` is step 0 of R1.1: the second draw
  IS the natural and goes through the surge test, the floor and the surge chain normally. REROLL spends the first
  unspent source in party order, and two different sources may each fire once on the same check.
- **R13.13 Pressgang Strain** lands only on a character who would otherwise have benched, so there is none at Relay
  plus Relay, none with two living, and none at the boss. **benchOnce** is a bench for every purpose (Warden, the
  Feet affix, Hearthborn, the Armor refill), is chosen by a BENCH TOO chip at assignment, and is forbidden under
  Pressgang and at the boss.
- **R13.14 The Hollow Air Ward's one surge** uses the normal threshold with every `surgeMinus` and the R1.2 cap,
  adds exactly one die, and counts as a surge for Reaver and every `surgeAspect`.
- **R13.16 A modifier that changes nothing says so.** The exploding die plateau of R1.4 means a +1 is worth exactly
  zero success in two cells: a d4 facing TN 5 (25.0 percent with or without it) and a d6 facing TN 7 (16.7 either
  way). Thirty five percent of a tier one character's stats are d4, so a Herald or a Quickstudy walking a d6 into a
  Vault is a live case. The pre roll strip prints such a modifier as "+1, no effect" rather than as help. One line
  in the resolver, and it saves the exact confusion the plateau otherwise causes the first time it happens.
- **R13.15 `perDeadAlly` and Grim** count deployed characters who died in THIS quest (0 to 2), never the Hall wall,
  or a 1 point Token would read +20 at hour fifty. Both read the quest's death list whenever the wearer joined.
