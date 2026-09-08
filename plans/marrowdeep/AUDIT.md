# MARROWDEEP, THE AUDIT RECORD
Sep 08 2026. Before a line of the game was written, five auditors read the spec and `RULES.md` against each other,
each with one lens, and a refuter was pointed at every blocker and major finding. This file is what they found and
what was done with it, so that a rule nobody can explain later can be traced to the argument that made it.

**How to read a row.** A finding is only interesting if it changed something. Every ruling below is already written
into `RULES.md` (in place where a rule was wrong, in section R13 where an edge case had no home) or into the plan's
section 10 as a Director call. Nothing here is advisory.

⛔ The first pass ran out of model quota partway: the engine and economy lenses finished, the other three and every
refuter died mid flight. The two that finished were applied by hand after being checked against the spec, and the
remaining lenses were rerun on Opus. Where a finding was applied without a refuter, this file says so.

---

## Lens: ENGINE AND QUEST LOOP

**What it reported:** Walked R1/R3/R4/R5/R7/R9/R12 as an implementer. The dice engine (R1) is sound: the corrected master table and floor table check out (d4 vs TN4 = 1/4, d12 floor 6 = 93/12 = 7.75), the floor cap always sits under the surge cap so "a floored value never surges" holds. The quest loop and boss have eight blockers the builder cannot code around: (1) Scholar means three different things in spec 5, R4.11 and R12; (2) the R12 vocabulary cannot express Ironbound, the 3 point Head affix, the 2 point half die floor, or Reaver's MIGHT restriction, and R12 says anything not expressible is not written; (3) no rule for a character who dies mid stage after being assigned (contagion from slot 1), including a declared Push; (4) BALANCE.STRIKE_TARGET and BALANCE.RESPITE have no value because proto/ is empty, and one candidate (`all`) contradicts the spec's own boss math while `spread` nullifies Vanguard and Unkillable; (5) R5.6 and R5.7 disagree on when Push/twice are chosen; (6) R5.6 contradicts itself on two living characters at Gate + Relay; (7) R3.3 skips a Chain's second check after a failure but says nothing about a Relay; (8) the Depth IV sealed stage loop is unwritable as stated and, read naively, is an infinite healing exploit. Ten majors follow (boss round vs stage for per stage counters, Ambush crossing into a boss, retarget ties, perDeadAlly scope, "last check" definition, Toll fee timing, the incoherent Blindfold Ward partial, stepStat on a d12, Vault/Open consequence stat). Cases the prompt asked about that RULES already decides consistently and need no ruling: Zealot plus Push (R4.12 reads Strain after Push), Hearthborn at Relay plus Relay (no bench, so no ally clear), WITS failure at stage 5 (R5.8), Cutpurse's auto twice (R1.8). Each finding proposes the smallest ruling.


### BLOCKERS (8)

**Scholar is three different Callings in three places**  
*Where:* spec 5 Callings table; RULES R4.11; RULES R12 `cond when: afterFailByOther`  
*The problem:* Spec: "After any failed check this stage, the next ally assigned gains +2" (the Scholar buffs someone else). R4.11: "the next check resolved by a DIFFERENT character than the one who failed gets +2" (anyone but the failer, a party aura that may include the Scholar). R12 puts the effect on the Scholar's own sheet and the resolver is only queried for the acting character ("nothing else in the engine knows a Calling from a Trait"), so `cond afterFailByOther` can only ever add +2 to the SCHOLAR's own check after someone else fails. Two failures in a row: under R4.11 A fails, B rolls +2 and fails, then C gets +2 from either charge; under R12 only the Scholar's next check gets +2 and B's own failure never arms B. The builder must pick one and the three readings have different assignment value.  
*The ruling taken:* Take the R12 reading and rewrite R4.11 as a CORRECTION: "Scholar: +2 on this character's next check after any OTHER deployed character's failed check this stage. A boolean charge, not a counter: set by any other character's failure, cleared when the Scholar rolls or at stage end; a failure by the Scholar does not arm it." This keeps pillar 2 (you put the Scholar in slot 2 behind the risky slot) and needs no aura plumbing.

**The R12 vocabulary cannot express Ironbound, two Head affixes, or Reaver**  
*Where:* RULES R12; R4.4 Ironbound; R4.16 Reaver; spec 11.2 Head rows  
*The problem:* R12 has no `floorPlus`: Ironbound ("Every floor from gear reads 1 higher") and the 3 point Head affix "Floors count as +1" have no key. `floor {k, stat, v}` takes a number, so the 2 point "Floor at half-die on one stat" (which must follow the worn die, and stepStat can change that die) has no key either. `surgeAspect {k, v}` has no stat field, so R4.16 "A MIGHT check that surged, against an Aspect, deals +2" can only be written as any stat, which is the Weapon affix, not Reaver. R12 says "A trait, unique or Calling that cannot be written in this table is not written" and `sim.js --data` refuses unknown keys, so an Origin and a Calling from the spec's tables (which R4 calls "the law") cannot be compiled.  
*The ruling taken:* Add `floorPlus {k, v, gearOnly:true|false}` [roll]: added to matching floors before the R1.3 cap (Ironbound gearOnly:true, the Head affix gearOnly:false so it lifts Vanguard's and Steady's floors too); several floorPlus add. Allow `floor.v = "half"` meaning the effective die / 2 at roll time. Add `stat?` to `surgeAspect` (Reaver = {k:'surgeAspect', v:2, stat:'might'}; the Weapon affix omits stat). Both Reaver and surgeAspect fire only on a PASSED check (spec: "A failed check deals nothing").

**A character who dies mid stage after assignment has no rule (and neither does their Push)**  
*Where:* RULES R5.6, R5.7, R3.1 contagion, R1.6  
*The problem:* Assignment fills both slots, then slot 1 resolves. A NERVE failure in slot 1 gives every other living party member 1 Strain (R3.1), which can kill the slot 2 holder, a Relay partner, or the bench (anyone at Toughness minus 1, common at Depth III). R5.6 only handles "With one living" at assignment time; nothing says what slot 2 does when its holder is dead at resolution, whether a Relay with one dead partner is short, or what a dead character's declared Push does (Push Strain is paid at roll per R4.12, so nothing was paid yet). Same gap for a Push validated as non lethal at toggle time that became lethal by roll time because contagion landed in between.  
*The ruling taken:* Ruling: a check whose holder is dead when its turn comes is FORFEIT exactly as R5.6's one living case (no roll, no reward, no Strain, no consequence); a Relay with a forfeited check pays nothing and its other check still rolls only if it comes first; a dead bench clears nothing (R3.5) and Hearthborn's ally clear needs a living bench. Push and twice toggles on the dead are void. Every Push is re-validated at roll: if it would now reach Toughness it is dropped and the RESULT card says "Push refused"; a dropped Push does not spend Saltblood's free one.

**STRIKE_TARGET and RESPITE have no value tonight, and one candidate contradicts the spec's boss math**  
*Where:* RULES R7.4 ("The prototype sim chooses the default; the handoff states it"), R5.7 ("BALANCE.RESPITE, default set by the sim"); plans/marrowdeep/proto/ and data/ are empty; spec 7.5, 8.6  
*The problem:* Both numbers are deferred to a sim and PROTO-REPORT.md that do not exist yet. Of the three target laws: `all` wipes the party whenever two Aspects survive round 1 (2 unbroken x 2 Strain = 4 = base Toughness, before Armor), while spec 7.5 says "A balanced roster breaks all three in 2–3 rounds and walks out at half health"; so `all` is not a candidate. `spread` lands "each point" as its own instance, so Vanguard's "1 less Strain from each Strike, minimum 0" and the Chest affix zero every point (a Vanguard is immune to the boss) and Unkillable stops one point and dies to the next. Only `attackers` survives the spec's own examples. RESPITE has the opposite tension: spec 8.6 computes death from accumulated failure Strain ("~4 failures ... ~1.33 each at Toughness 4") which a per stage clear erases, yet spec 9 says Depth III is where "Strain does not clear between stages", so RESPITE 0 at Depth I would make Depth III's headline change nothing. At Depth IV with `attackers`, the unfaceable fourth Aspect strikes everyone for 3 on top of the faced one: 6 per character per round; the sim must look at IV before the handoff.  
*The ruling taken:* Build default tonight: BALANCE.STRIKE_TARGET = 'attackers' (strike reduction and Unkillable apply per Aspect strike instance), BALANCE.RESPITE = 1; strike `all` from the candidate list; the sim may move RESPITE and must report Depth IV round 1 lethality. State both in the handoff even if the sim has not run.

**When are Push and roll twice chosen: before RESOLVE or at each check**  
*Where:* RULES R5.6 vs R5.7 vs R11.6  
*The problem:* R5.6: "Per check, before RESOLVE: Push toggles, roll twice toggles, the Vault and Open stat pick." R5.7: "each check: options -> roll -> RESULT card". R11.6 draws ONE Push chip on the character card, but a Chain gives one character two checks and Push is "once per check" (R1.6), and whether to Push a Chain's second check depends on seeing the first pass. The two rules describe two different UIs.  
*The ruling taken:* Ruling: the Vault/Open stat pick is at assignment (R5.5). Push and twice are chosen per check at its roll: RESOLVE starts the sequence, and each check shows a pre roll strip (character, stat die, TN, PUSH and TWICE chips, ROLL). A Chain's second check gets its own strip. Delete the toggles clause from R5.6; R11.6's chips move to that strip.

**Two living characters at Gate + Relay is contradictory; one living at a Relay is unstated**  
*Where:* RULES R5.6  
*The problem:* "With two living characters: one slot each, no bench; a Relay with two living takes both." Gate + Relay is three checks needing three bodies: "one slot each" leaves the Relay one short, "takes both" leaves the Gate empty, and "Every slot must be filled". With one living, "one slot, the other is FORFEIT" but a Relay needs "two DIFFERENT characters", so a lone survivor cannot hold a Relay at all; Relay + Relay at stage 5 (9%) with one living is undefined.  
*The ruling taken:* Ruling, one sentence that also covers the existing Relay + Relay exception: "A character may hold a second check only when the stage's checks outnumber the living deployed characters, and never both checks of one Relay." So two living at Gate + Relay: both in the Relay, one of them also on the Gate, no bench. One living: holds exactly one slot (a Chain is one slot), every Relay is forfeit, so Relay + Relay is a stage with nothing to do.

**A Relay's second check after a failed first check: rolled or skipped**  
*Where:* RULES R3.3 ("A Chain's second check only happens if the first passed"), R5.5 Relay, R5.9  
*The problem:* R3.3 covers only the Chain. A Relay "both must pass" with the reward paid once; if check 1 fails, rolling check 2 risks a second Strain instance (plus contagion, Ambush, Blindness) for a slot that can no longer pay. Bloodhound's "last check", Herald's "previous check", and Ambush's "same slot" all depend on whether that roll happens. The builder cannot write the Relay resolver.  
*The ruling taken:* Ruling: same as the Chain. A Relay's second check is skipped after a first failure; one failure, one instance; the second character's Push was not paid and their Quickstudy stat stays unused.

**The Depth IV sealed stage loop is unwritable as stated and reads as an infinite healing exploit**  
*Where:* RULES R9.1 Depth IV; R5.6 one living; R5.7 stage end; R5.8  
*The problem:* "a failed Vault costs its Strain and the stage is assigned again (new bench allowed), until it passes or the party is dead." Unstated: whether slot 1 re-resolves (paying its reward or Strain again), whether stage end runs between attempts, and what a lone survivor does when the other slot is forfeit but the Vault "must be passed to leave". If stage end runs per attempt: at Depth IV RESPITE is 0 and the bench is the only recovery, so a Warden benches for 3 (Feet 4, Armor refilled) while someone pays strainOnFail 1 per failed TN 7 Vault: net +2 Strain healed per tap, forever. Also the Vault is "their second slot" but R5.4 rolls slot order, so it could resolve first and then slot 2 would be re-run each attempt. Under Hollow Air a d4 with no flat has max 4 + Push 2 = 6 < 7, an unreachable Vault, which is a slow forced wipe.  
*The ruling taken:* Ruling: the sealed Vault is always resolved last. Only the Vault repeats; slot 1 resolves once. Between attempts nothing happens except the Vault's Strain instance and a re-choice of holder and stat (that is all "new bench allowed" means): no bench clear, no Hearthborn, no Armor refill, no rewards, no drops, no replacement. Stage end runs once when the Vault passes or the party dies. A lone survivor holds the Vault every attempt. Ambush from slot 1 is consumed by the first attempt; a GRACE failed Vault attempt puts Ambush on the next attempt. The UI greys a character whose best possible total is under 7 ("cannot reach"); if nobody can reach, the stage still offers the Vault, it is their funeral (R9.2's cruelty line).


### MAJORS (8)

**At the boss, is a round a stage for every once per stage effect**  
*Where:* RULES R4.10 Cutpurse, R4.14 Gambler, R4.7 Saltblood, R4.11 Scholar, R4.15 Herald, R1.8, R3.1 Thin Ice, R4.17 Bloodhound, R12 `[stage]` moment  
*The problem:* R4.17 already says Bloodhound at the boss is "the last action of a round" (per round), but Cutpurse's first GRACE check, Gambler's and the Charm's rerolls, the Charm twice, Saltblood's free Push, Thin Ice's first failure, the Scholar charge and Herald's "previous check resolved in this stage" are all "per stage" with the boss also called a stage (Ninth Hour "+3 at the boss stage"). One boss fight of 3 to 5 rounds versus per round is a big swing (a Gambler reroll per round), and Herald across a round boundary is undefined.  
*The ruling taken:* Ruling: at the boss every round is a stage for every `[stage]` counter and every firstOfStage/lastOfStage/sameStatAsPrev/afterFailByOther condition (reset at round start), matching Bloodhound. Flag the Gambler per round consequence for the sim; if it is too strong, the fix is one line (`rerollStage` resets per fight, not per round), not a different model.

**Ambush crossing from the last slot before a boss**  
*Where:* RULES R5.8 GRACE clause vs the "At the boss: none of these apply" clause; R9.1 Depth II and III stage 3  
*The problem:* "if the GRACE failure was in the stage's last slot, Ambush lands on the next stage's first slot" but the next stage after Depth I stage 5, Depth II and III stage 3 and stage 7 is a boss, where "a failed Aspect check simply deals no damage" and there is no failure Strain for the +1 to sit on. WITS has an explicit boss rule (round 1 TNs hidden); GRACE has none. Also unstated: Ambush is a set not a counter (two GRACE failures cannot make +2), it is consumed on pass or fail, and it shows on the card at assignment (R5.3 tags).  
*The ruling taken:* Ruling: Ambush never crosses into a boss (dropped with the stage). Ambush is a one shot tag on the slot: shown at assignment, applies +1 to every failure in that slot (Untethered excepted), consumed when the slot resolves whatever the result, never stacks.

**Retarget at the boss: ties, carried toggles, and who counts as an attacker**  
*Where:* RULES R7.2, R7.4 `attackers`, R5.6 options  
*The problem:* "rolls instead against the unbroken Aspect with the fewest hit points left": two Aspects at equal hit points has no tie break. The retargeted character declared Push and twice against the original stat and TN and cannot re-toggle mid resolution. Under `attackers` ("every character assigned to it this round") a retargeted character was assigned to the broken Aspect, so the rule as written has them struck by nobody. A tie on the retarget can also land a d4 stat, the same unseeable punishment the DECIDED line was avoiding.  
*The ruling taken:* Ruling: tie goes to the Aspect whose stat the character rolls the bigger die on, then card order. Toggles persist and are paid against the new stat and TN. For Strikes a character is an attacker of the Aspect they actually rolled against. If every Aspect is broken before their turn the character does not roll and no Push is paid.

**`perDeadAlly` and Grim scope is unbounded as written**  
*Where:* RULES R12 `cond when: perDeadAlly`, `grim`; spec 11.2 "+1 per dead ally"; R1.7  
*The problem:* Conditionals are outside the +3 cap (R1.7). "per dead ally" does not say dead this quest or dead ever; the Hall wall grows without limit, so a 1 point Token would read +20 at hour 50 and collapse TN 7. Grim says "after an ally dies this quest" but a mid quest replacement (R5.10) joined after the death.  
*The ruling taken:* Ruling: perDeadAlly counts deployed characters who died THIS quest (0 to 2); Grim and perDeadAlly read the quest's death list regardless of when the wearer joined.

**"Last check of a stage" cannot be known in advance when checks can be skipped**  
*Where:* RULES R4.17 Bloodhound ("the sim knows which is last"), R12 `lastOfStage`, R3.3  
*The problem:* A Chain's second check exists only if the first passes (R3.3), Relay likewise (finding above), forfeits remove checks. So at roll time "is this the last check" is not a property of the stage layout. If slot 2 is a Chain, its first check might be last (on a failure) or not; Bloodhound has to decide before the dice land.  
*The ruling taken:* Ruling: a check is last when no check can follow it whatever its result: a Chain's or Relay's first check is never last; a second check in the final slot is; a Gate/Vault/Toll/Open in the final slot is; at the boss, the last character in party order who still has an unbroken Aspect to roll against. firstOfStage is the first check that actually rolls.

**Toll fee timing and lethality**  
*Where:* RULES R3.1 ("paid on assignment, refunded by nothing"), R5.5 Toll, R1.6, R5.6 "Every slot must be filled"  
*The problem:* If the fee is literally paid when a character is dropped on the Toll card, dragging someone off it before RESOLVE burns 1 Strain per try. And the fee is the only self paid instance with no lethality rule: a Push that would reach Toughness "is refused by the UI", but a Toll fee at Toughness minus 1 either kills silently or, if refused, leaves a slot that "must be filled" unfillable when everyone is at Toughness minus 1.  
*The ruling taken:* Ruling: the fee is paid at RESOLVE when assignment locks, skips Armor (R3.4), can trigger Unkillable. A character whose fee would reach Toughness cannot be assigned to the Toll (chip: "Cannot pay"); if no living character can pay, the Toll is FORFEIT as in R5.6.

**The Blindfold Ward partial is incoherent as written**  
*Where:* RULES R9.3 Blindfold partial  
*The problem:* "Blindfold, TNs are shown for the wearer's own checks after assignment... no: before assignment on the wearer's own card only." TNs live on the challenge cards, and before assignment the wearer has no check, so there is nothing to show on the wearer's card. The sentence is also an unfinished edit ("... no:"), as is R6.2's "with benchOnce twice? no:", and a builder pasting RULES into a spec will trip on both.  
*The ruling taken:* Ruling: with the Blindfold partial, assigning the wearer to a slot reveals that slot's TN on its card before RESOLVE; the player may reassign (one TN per stage, earned by placing the wearer). Immunity: every TN shown for the party, as Lanternborn (R4.6). Clean the two "no:" fragments to their final rule only.

**stepStat on a d12 is written as a generation rule but the wearer is unknown at generation**  
*Where:* RULES R6.3; R12 `stepStat [equip]`; R6.7 drop screen; R6.6 MOVE TO  
*The problem:* "A 'step one stat up one rung' on a d12 stat is rerolled to another stat; if all four are d12 it becomes +1 Toughness lines." A drop is rolled before it is offered to three characters and later moves between roster characters, so "a d12 stat" has no referent at roll time; retargeting at equip would mutate the item's affix and name per wearer.  
*The ruling taken:* Ruling: generation picks the stat uniformly and never rerolls. At equip a step on a d12 is greyed and does nothing (R1.7's fourth flat point precedent) and the drop screen's point delta shows 0 for it. The effective die after stepStat feeds the floor cap, the surge threshold, Deepdrawn's highest stat and Quickstudy, all read at roll time.


### MINORS (8)

**Vault and Open failure consequences follow the chosen stat, which the spec's Open line hides**  
*Where:* RULES R5.5, R5.8; spec 7.2 ("Open is the safe parking spot for a hurt character")  
*The problem:* R5.8 keys consequences to the stat, R5.5 lets the player choose the Vault's and Open's stat, and nothing says whether a NERVE Open at TN 3 that fails triggers contagion. The spec calls Open safe; it is safe only if the player picks MIGHT (self contained). A d4 NERVE Open fails 50 percent and hurts everyone.  
*The ruling taken:* Ruling: consequences follow the stat actually rolled, chosen or named; the pre roll strip shows the consequence glyph beside the chosen stat so the choice is informed. No exception for Open.

**Thin Ice composition with strainOnFail 2 and Ambush; the Ward partial's trigger**  
*Where:* RULES R3.1 Thin Ice; R5.4 (stage 5 strainOnFail 2); R9.3 Thin Ice partial  
*The problem:* "the first failure each stage by anyone costs 2 instead of 1": at stage 5 (base 2) that is either 2 (no effect) or 3 (+1). With Ambush: 2 + 1 or max(2, 1 + 1). The partial ("the wearer's first failure each stage costs the normal amount, others' do not change") does not say whether the wearer's failure uses up the stage's "first failure".  
*The ruling taken:* Ruling: instance = max(strainOnFail, 2 if Thin Ice and this is the stage's first failure) + 1 if Ambush. The stage's first failure by anyone, the wearer included, consumes the trigger; Thin Ice immunity works the same way with the immune wearer's cost at base.

**Floors from two items and floorPlus stacking**  
*Where:* RULES R1.3, R4.4, R6.2 repeat rule, spec 11.2 Head rows  
*The problem:* "the highest holds, they do not add" is clear, but R6.2 allows floor_flat3 WITS and floor_half WITS on one item (different keys, same stat), a wasted point by construction. Ironbound (+1 to gear floors) plus the Head "floors count as +1" affix: add to +2 or highest wins?  
*The ruling taken:* Ruling: for the R6.2 repeat rule every floor key counts as one key per stat (one floor line per stat per item). floorPlus sources add (+2) before the R1.3 cap; Ironbound lifts gear floors only, the Head affix lifts every floor the wearer has including Vanguard's and Steady's.

**twiceStage plus rerollStage on one check; two twice sources on one check; where reroll1s sits**  
*Where:* RULES R1.8, R1.1 order, R4.10, R4.14, R12  
*The problem:* A Cutpurse's auto twice (two chains) then a Gambler or Charm reroll ("the whole chain is redrawn once"): one chain or both? A Cutpurse also wearing the Charm twice: could the first GRACE check roll three chains? R1.1's step list never places "reroll natural 1s", and whether a rerolled 1 that lands the top face surges is unstated.  
*The ruling taken:* Ruling: a reroll re-runs the whole roll with the same options (twice stays twice, a paid Push stays paid); the new result stands. A check rolls at most two chains: when an auto twice fires, the manual twice chip is unavailable and not consumed. reroll1s is step 0 of R1.1: the second draw is the natural and goes through surge test, floor, and surges normally.

**Pressgang edges and benchOnce as a bench**  
*Where:* RULES R3.1 Pressgang, R5.6 Relay + Relay, R7.4, R12 `benchOnce`, R11.6  
*The problem:* Pressgang's "third character takes 1 at stage end instead of benching" has no third character at Relay + Relay, with two living, or at the boss. benchOnce ("act and bench both") does not say whether it triggers Warden's 3, Feet +1, Hearthborn's ally clear and the Armor refill, whether it works under Pressgang or at the boss, and R11.6 lists no chip for it.  
*The ruling taken:* Ruling: Pressgang Strain lands only when a character would otherwise have benched (none at Relay + Relay, two living, or the boss). benchOnce is a bench for every purpose (Warden, Feet, Hearthborn, Armor refill), forbidden under Pressgang and at the boss, chosen by a BENCH TOO chip at assignment.

**Party order, and which reroll source a REROLL button spends**  
*Where:* RULES R7.2 ("Resolve in party order"), R1.8, R11.4 DEPLOY  
*The problem:* Herald, Scholar, Bloodhound and retargeting at the boss all depend on party order, which is never defined. When two reroll sources are unspent (a Gambler and an ally's Charm) one REROLL button spends an unnamed one.  
*The ruling taken:* Ruling: party order is the order the player marked DEPLOY, shown left to right and used everywhere "party order" appears. REROLL spends the first unspent source in party order; each source may still fire once, so two sources can reroll the same check twice.

**Unkillable versus a refused Push, and death test timing at Strikes**  
*Where:* RULES R1.6, R2.4, R3.2, R7.4  
*The problem:* "A Push that kills is refused by the UI": with Unkillable unused the Push would not kill, so is it allowed? R7.4 says "Then the death test" after all Strikes while R3.2 tests death per instance; with a character taking two Strike instances in one round the order decides whether the second lands on a corpse.  
*The ruling taken:* Ruling: a Push never brings Strain to Toughness, refused regardless of Unkillable. Death is tested per instance (R3.2); R7.4's line means interment happens after the Strike animation. Later instances in the same round skip the dead.

**Hollow Air Ward partial: does the one surge use surgeMinus and fire Reaver**  
*Where:* RULES R9.3 Hollow Air partial, R1.2, R4.16, R12 surgeAspect  
*The problem:* "the wearer surges once with no chain" does not say whether a lowered threshold (Fenwise, Deepdrawn, Hands) applies to that one surge or whether it counts as "a check that surged" for Reaver and the Weapon affix.  
*The ruling taken:* Ruling: the one surge uses the normal threshold (R1.2 with all surgeMinus and the cap), adds exactly one die, and counts as a surge for every `surgeAspect` and Reaver.


---

## Lens: ECONOMY AND PROGRESSION

**What it reported:** Economy and progression audit of MARROWDEEP_DESIGN_SPEC.md v1.0 and RULES.md. Three blockers: nothing says how many characters a new account gets or at what price (Recruit is 25 Renown, the account starts at 0, the seam gate rolls ONE character and deploys it solo); a first quest wipe leaves 0 characters and ~12 Renown against a 25 Renown Recruit with Marrow unable to buy a body, a soft lock at the spec's own ~8 percent wipe rate; Depth IV rolls Commons at 10 percent with no point budget. Five majors: Recruit then one quest then Retire converts Renown to Marrow at ~9 Renown per Marrow (R2.6's DECIDED fix only added a Renown positive delay, tripling Marrow income and deleting the veteran arc); Depth multiplied death Marrow plus mid quest Recruit makes a rookie suicide farm at Depth IV and V; Depth V "Relic rarity only" contradicts the spec's own 11.3 and 11.4 V rows and RULES keeps both (every drop a unique, 20 uniques gone in ~4 quests, +1 tier a no op); roster full and dead in roster undecided (the wrong pick fills the roster with the dead and refuses Recruit forever); playing a Depth I quest re rolls every Depth's offer, a cheap re roll R9.4 says must not exist. Seven minors. Verified consistent and not reported: Depth I Renown ~36 vs ~35, wipe ~10 vs ~12, Commission salvage EV 3.9 to 8 vs cost 40, Depth multipliers, unlock counts, Reforge on uniques, a Ward with no shelf slot.


### BLOCKERS (3)

**How many characters does BEGIN roll, and at what price**  
*Where:* spec 3.2, 7.1 ("Roster: 3 characters deployed"), 14 ACCOUNT (renown 0, rosterSlots 3); RULES R2.1, R8.1 (Recruit 25), R11.3, R11.4 ("DEPLOY marks three"); HANDOFF P1.10 seam gate ("BEGIN; ROLL; the first Calling; KEEP; DEPLOY; GO")  
*The problem:* The account starts with renown 0. The only way to make a character is Recruit at 25 Renown. Neither the spec nor RULES says the first characters are free or how many there are. The handoff's seam gate rolls exactly ONE character then DEPLOY and GO, which means the first quest is played solo: at the boss three Aspects strike 2 each per round onto one Toughness 4 body, dead in round 1 or 2 under every STRIKE_TARGET law, and every number in spec 8.6 (death 12 to 15 percent per character, wipe 8 percent) assumes a party of three. The builder cannot write BEGIN, the creation price, or the DEPLOY gate without this decision.  
*The ruling taken:* R2.1 addendum: a new account is created with `account.freeRolls = 3`; the creation screen's price is 0 while freeRolls > 0 (decrement on KEEP; Redeal still costs 10); BEGIN runs creation three times before the Hall; the seam gate rolls three. R11.4: DEPLOY marks up to three; GO with fewer is allowed only when the roster cannot fill three (see the stray ruling). `rosterSlots` stays 3.

**A first quest wipe soft locks the account: 0 characters, ~12 Renown, Recruit costs 25, Marrow buys no body**  
*Where:* spec 8.2 ("~12 on an early wipe"), 8.6 ("Full wipe ~8%"), 8.3 (Marrow purchases: none is a character); RULES R8.1, R8.2, R6.8, R11.4  
*The problem:* After a wipe the roster is empty (three dead, each 1 Marrow), Renown is the stages passed plus wipe salvage, about 10 to 12 by the spec's own number, and Recruit costs 25. Renown comes only from quests; quests need a deployed character; the Hall offers nothing at 0 deployable. Marrow (3 on hand) buys floors, slots, Origins, none of them a body. The same lock at 2 dead and 1 alive with 12 Renown if GO needs three (undecided, R11.4 says marks three). Even a veteran roster can hit it: three characters at 4 Scars (Toughness 0, "Needs Toughness") on an account that spent its Renown on Commissions can Retire for Marrow but cannot buy anyone. Probability on the very first quest is the spec's 8 percent; over the first three quests roughly 22 percent of new players see it.  
*The ruling taken:* R8.1 addendum, THE STRAY: whenever the roster has no deployable character (alive, effective Toughness > 0) and account.renown < 25, the Recruit button reads TAKE IN A STRAY and costs 0, one at a time (the next costs 25 again). R11.4: GO is allowed with one or two characters only when the roster cannot fill three; the offer card says short handed. With the proven death ruling below the stray's own death pays 0 Marrow, so the stray cannot be farmed; a stray that survives a quest is proven like anyone. Gear salvage on Retire (R2.6) is not a substitute: a wiped roster has already salvaged everything (R6.8).

**Depth IV drops Commons at 10 percent with no point budget; Ashwalker's Common at IV and V is undefined**  
*Where:* spec 11.3 (Depth IV Common "—", Depth V Common "—") vs 11.4 (Depth IV Common 10%, Depth V 0%); RULES R6.1 ("the spec's 11.3 and 11.4 tables"), R4.2 (Ashwalker: "a Common relic"), R6.2 (fill until points equal the budget)  
*The problem:* 11.4 says one drop in ten at Depth IV is Common; 11.3 gives a Common at Depth IV no budget. R6.2's fill loop reads `budget[IV][common]` and gets nothing; the sim's `--depths` gate generates 200 Depth IV quests and will hit it in the first one. R4.2 rolls a Common every quest for an Ashwalker at Depth IV and V, where the table has no Common at all. The 11.4 V row (Common 0) and both 11.3 dashes agree with each other; the IV 10 percent is the stray cell.  
*The ruling taken:* R6.1 CORRECTION: the 11.4 Depth IV row becomes 0 / 55 / 34 / 11 (the 10 folded into Uncommon, matching its 11.3 dash and the V row). R4.2: Ashwalker's relic is Common at Depth I to III and Uncommon at IV and V. The sim asserts no Common is ever generated at IV or V.


### MAJORS (5)

**Recruit, one quest, Retire converts Renown to Marrow at ~9 Renown per Marrow; R2.6's DECIDED fix only delayed it by one Renown positive quest**  
*Where:* spec 6.3 (Retire 2 + 1 per Trait, Death 1), 8.1 ("A player can grind Renown forever and stay flat. Marrow is gated behind emotional cost"), 8.2 (Recruit 25, income ~35), 8.3 (Marrow ~1.5 per quest); RULES R2.6 (DECIDED: "closes the Recruit for 25 Renown then Retire for 2 Marrow conversion, which would have made Marrow purchasable"), R8.5 (retirement flat), R2.5 (one Trait per quest survived, so traits.length == questsSurvived)  
*The problem:* Retire after N quests pays 2 + N. Marrow per character quest: N=1 gives 3.0, N=2 gives 2.0, N=3 gives 1.67, N=4 (the spec's veteran, 6 Marrow) gives 1.5. The spec's income target is 1.5 per quest for a party of THREE, 0.5 per character quest. Retiring every character after its first quest is six times the design rate and twice the veteran's, and it is also safer (Toughness 3 or 4, never 1). The only brake is Recruit at 25: at Depth I (~35 Renown a quest) the player affords 1.4 fresh bodies a quest, retires 1.4 for 0.85 x 3 + 0.15 x 1 = 2.7 each, about 3.8 Marrow plus honest deaths, roughly 4 a quest against 1.5. At Depth III (79 Renown) all three cycle every quest: about 8 against the expected 2.5. The conversion R2.6 says it closed ran at 12.5 Renown per Marrow with no risk; the surviving one runs at 25 / 2.7 = 9.3 Renown per Marrow AND the quest in between pays 35, so the fix made it cheaper. Under this play no character ever carries more than one Scar, the retire or run decision (spec 6.3), Excise, Warden's late value and the 4 to 7 quest career never happen, and roster slots (a Marrow sink) are worthless because three bodies always suffice. This is a payout, Stephen's, but the builder needs a default tonight.  
*The ruling taken:* BALANCE.RETIRE_VESTING = 3. Retire pays 2 + traits.length only when questsSurvived >= RETIRE_VESTING; under it Retire pays traits.length (1 or 2), still writes a Legacy and a wall line. Rates become 1.0, 1.0, 1.67, 1.5, 1.29 per character quest for N = 1, 2, 3, 4, 7: never increasing at the small end, and the spec's veteran number is untouched. The vest lands exactly where Toughness hits 1 (three Scars), which is where the spec wants the decision to bite.

**Death Marrow is Depth multiplied for a character who has never survived a quest, and mid quest Recruit refills the sacrifice: a rookie suicide farm at Depth IV and V**  
*Where:* RULES R8.5 (death pays round(1 x DEPTH_MARROW_MULT) = 1, 1, 2, 2, 3), R5.10 (Depth I to IV: at any stage end pay 25 Renown to Recruit straight into the party), R1.6 (a Push that kills is refused, one Push per check), R3.1 (Toll fee 1); spec 8.1's pillar  
*The problem:* A fresh Recruit has no gear and no history. At stage 1 assign him to a Toll (fee 1) with a Push (1) and a fail (1); stage 2 the same: dead on demand by stage 2 or 3, in about two minutes. Depth V: three Recruits (75 Renown) deployed and wiped at stage 2 pay 3 x 3 = 9 Marrow; the stages passed give back 10 to 25 Renown (x5.1), so net about 55 Renown per 9 Marrow, 6 Renown per Marrow. An honest Depth V quest pays about 200 Renown and 3 to 4 Marrow in nine minutes, so each real quest funds three wipes worth 27 Marrow. Depth IV: R5.10 lets the player Recruit at EVERY stage end once someone has died; seven stage ends x 2 Marrow = 14 Marrow a quest for 175 Renown against an income of about 115, so 4 sacrifices a quest, roughly 8 Marrow plus honest income against the expected 3.3. Any free character (the stray above, or any future free roll) turns this into an infinite loop, so it must be closed at the payout, not the price.  
*The ruling taken:* R8.5 CORRECTION: a death pays Marrow only when the character has questsSurvived >= 1 (proven); an unproven death pays 0 Marrow but still makes the Legacy and the wall line (spec pillar 5: death stays productive through the Calling card). A proven character's death pays the Depth multiplied rate as written. This costs the honest player at most the 0.4 Marrow a quest of first quest deaths early on and nothing later; combined with RETIRE_VESTING every Marrow in the game routes through at least one survived quest, which is what spec 8.1 says the gate is.

**Depth V "Relic rarity only" contradicts the spec's own 11.3 and 11.4 V rows, and RULES R6.1 keeps both**  
*Where:* spec 9 (Depth V: "Relics drop at Relic rarity only") vs 11.3 (V: Uncommon 4, Rare 7, Relic 10) and 11.4 (V: 0 / 45 / 40 / 15); RULES R6.1 ("the spec's 11.3 and 11.4 tables. Depth V drops are Relic rarity only. '+1 rarity tier' ... Relic stays Relic"), R6.4 (one unique per Relic rarity item, 20 uniques), R6.10 (Commission at the highest Depth's weights); HANDOFF P3.5 asserts "Depth V drops are all Relic rarity"  
*The problem:* Two spec tables give Depth V three live rarities with 15 percent Relic; one prose line says Relic only. R6.1 states both, so the builder cannot tell whether Commission at V (R6.10, "weights") rolls the 45/40/15 row or three uniques. Under the Relic only reading: every Depth V drop is a 10 point item with a unique; R5.9's rolls at the eight stage shape give about 7.5 relic rolls a quest, roughly 4.5 drops, so 4.5 uniques a quest from a list of 20 filtered by slot (2.5 per slot), duplicates by the second quest and the list exhausted by the fourth; Vault and boss "+1 tier" is a no op at V; salvage is 12 per drop, about 54 Renown a quest on top of the x5.1 income; Commission is best of three uniques for 40 Renown, five a quest at V income. Whether a unique may repeat is undecided either way.  
*The ruling taken:* R6.1 CORRECTION: Depth V uses the 11.3 and 11.4 V rows (0 / 45 / 40 / 15; budgets 4 / 7 / 10) and +1 tier applies normally; the section 9 line is the error (two tables beat one prose line). R6.10: Commission rolls at the highest unlocked Depth's weights AND budgets. R6.4: a unique may repeat across items (it is a name and one effect, not a one of). HANDOFF P3.5's assertion becomes "no Depth V drop is Common". If Stephen wants Relic only at V it is one BALANCE row and the unique repeat rule already covers it.

**Roster full: Recruit against rosterSlots, and whether the dead occupy a slot, are undecided; the wrong pick refuses Recruit forever**  
*Where:* spec 14 (character status alive | dead | retired; rosterSlots 3), 8.3 (Roster slot: "Expand owned characters 3 to 8"); RULES R8.1 (Recruit), R8.2 (Roster slot), R5.10 (mid quest Recruit "straight into the party"), R2.4 (interred), R6.8 (a dead character's gear is offered at quest end, so its record must persist until then); HANDOFF save `roster: [characters]` beside `wall: [lines]` and P2.3 ("greys when the account cannot pay")  
*The problem:* Nothing says what Recruit does when living characters equal rosterSlots, and nothing says whether a dead or retired character still counts as owned. If `roster` keeps the dead (the spec's status field suggests records persist) and rosterSlots counts `roster.length`, three deaths fill a 3 slot roster and Recruit is refused with a full account of Renown: a soft lock the P2 test ("every Hall purchase pays and refuses") would pass. Mid quest Recruit at Depth I to IV has the same question with reserves: eight owned, five alive on the bench, one deployed dies; does the 25 Renown Recruit exceed the cap.  
*The ruling taken:* R8.1 addendum: the roster count is living characters only; Recruit (Hall and mid quest) is refused with the label Roster full when alive >= rosterSlots, and the mid quest sheet offers the reserve instead. A dead character leaves `roster` at quest end after R6.8 has offered its gear (its record lives on in `wall` and `legacies`); a retired or dismissed one leaves at once after its gear hits the drop screen. TEST asserts Recruit refuses at a full roster and accepts after a death.

**Any quest re rolls every Depth's offer, so a four minute Depth I run is the cheap re roll R9.4 says must not exist**  
*Where:* RULES R9.4 ("An offer stays until a quest at ANY Depth is played, then every offer re-rolls. No paid re-roll (DECIDED: a free or cheap re-roll deletes the Sigil decision)"), R9.2 (no exclusion table, "supposed to be that cruel"); spec 10 ("building a stash of situational gear is directly rewarded"), 11.1 (the Ward Shelf loop)  
*The problem:* A Depth V offer of Hollow Air with Shivering is dodged by playing the Depth I offer: four to six minutes, plus about 35 Renown, at a tier 10 account with d8 average dice near zero risk. The only cost is one Scar per survivor, and under the retire cycle those are rookies anyway. A paid re roll was refused because it deletes the Sigil decision; this one pays the player to make it. It also devalues Wards, whose whole job (spec 11.1) is surviving the Sigil you would otherwise dodge.  
*The ruling taken:* R9.4 CORRECTION: an offer re rolls only when a quest at ITS Depth ends (won or wiped); the other Depths' offers stay. The Depth I dodge then changes nothing, and a cruel Depth V offer sits until the party faces it, which is R9.2's own stance.


### MINORS (7)

**Reforge on a line with no other affix of the same points loops or no ops**  
*Where:* RULES R6.9 ("redrawn to another valid affix of the same points"), R6.2 (the 1 point Toughness filler on Hands, Feet, Weapon); spec 11.2 (Head has one 3 point affix, floors count as +1; Feet none at 1)  
*The problem:* Head's only 3 point affix is "floors count as +1"; a Reforge of that line has no "another" to draw. The 1 point Toughness filler on Hands, Feet or Weapon has no 1 point sibling on those slots. A draw loop either never terminates or returns the same line for 15 Renown.  
*The ruling taken:* R6.9 addendum: a stat retarget of the same key counts as another affix; when no different key or stat at that point value is valid for the slot, the line's REFORGE is greyed with the label Fixed. TEST asserts the grey on a Head floorsPlus line and on a filler line.

**The slot of a drop is never rolled**  
*Where:* RULES R6.2 (fill), R6.1 (rarity), R5.9 (relic rolls); only R4.2 (Ashwalker, "a random slot") mentions a slot roll  
*The problem:* Every drop needs a slot before affixes can be drawn; RULES rolls rarity and budget and never the slot. Uniform over eight makes 12.5 percent of Depth I drops Wards for one of six Sigils in a Depth with 0 or 1 Sigil, mostly 1 Renown salvage; the builder should know that is the intended rate rather than invent a weighting.  
*The ruling taken:* R6.2 addendum: the slot is rolled uniformly over the eight (BALANCE.SLOT_WEIGHTS, all 1) before rarity; Commission fixes it. One row to tune if Wards drown the drop screen.

**Ward Shelf edges: TO THE SHELF with no free slot, salvaging from the shelf, moving a worn Ward to the shelf**  
*Where:* RULES R6.7 ("a Ward may go TO THE SHELF if a shelf slot is free"), R8.1 (slot 30 then +15, six max), R11.5 (MOVE TO on a gear tile); HANDOFF P2.4 (swap in, the swapped out Ward returns to the shelf)  
*The problem:* Not a dead end (a Ward with no shelf slot still equips or salvages), but three small paths are unwritten: the account starts at wardShelfSlots 0 so the first Ward drop shows no shelf button, which should be a deliberate absence not a bug; a shelf Ward has no TAKE RENOWN; a worn Ward cannot reach a free shelf slot except through a swap.  
*The ruling taken:* R6.7 addendum: TO THE SHELF is hidden (not greyed) with no free slot; a shelf tile carries TAKE RENOWN at SALVAGE value; a Ward's MOVE TO sheet lists THE SHELF when a slot is free.

**questsCompleted at Depth II and III with two bosses, and the first boss's relic**  
*Where:* RULES R8.4 ("counts boss wins only"), R7.6 (first boss: half hit points, reward 8, "its Strikes normal"), R7.3 (win: "the boss's relic"), R5.9 ("the boss 1 at +1 tier"); spec 9 unlock counts (3, 10, 25, 50)  
*The problem:* Unlock counts are consistent between spec and RULES. But at Depth II a quest holds two bosses and "boss wins" could count the first, halving the unlock pace at II and III (25 wins for IV becomes ~13 quests). R7.6 gives the first boss Renown 8 and never says whether it drops a relic.  
*The ruling taken:* R8.4: questsCompleted increments once, on the quest's final boss (R7.3). R7.6: the first boss drops one relic at +1 tier like any boss (it is the +1 tier roll that makes a mid quest boss worth its Strikes).

**Legacy deal can overflow three cards with a consecrated Legacy and three Legacy slots**  
*Where:* RULES R8.7 ("the consecrated Legacy first if any; then up to account.legacySlots Legacies ...; then stock Callings ..., until three"), R8.2 (Legacy slot 2 to 3, cap 3)  
*The problem:* With legacySlots 3 and a consecrated Legacy the order reads 1 + 3 = 4 Legacy cards before the "until three" clause, which is written on the stock fill. A player who paid 6 Marrow to consecrate and 2 for the third slot should know what the 2 bought.  
*The ruling taken:* R8.7 wording: the consecrated Legacy occupies one of the legacySlots (Legacy cards on the deal <= legacySlots <= 3); stock fills the rest.

**A paid creation floor can show a die under the floor through Straycall**  
*Where:* RULES R2.1 ("Straycall shifts rungs AFTER the floor, so a Straycall NERVE can sit under the floor"), R8.2 ("that stat never rolls under d6 at creation", 3 Marrow, then d8 for 6)  
*The problem:* The Marrow purchase's text promises NERVE never rolls under d6; a Straycall deal then shows a d4 NERVE. A player who paid 3 or 9 Marrow for the floor notices on the creation screen.  
*The ruling taken:* R2.1: apply the account floor after the Origin shift (the floor is a guarantee the player paid for); or keep the order and word the purchase "rolls" not "is". The first is one line and never surprises.

**Marrow has a finite sink of about 98, so retire or run stops mattering after it is bought**  
*Where:* spec 8.3 (the five Marrow purchases), 6.3 ("the endgame tension ... emerges naturally around quest 15"); RULES R8.2 (floors 3 + 6 per stat = 36; roster slots 4 + 6 + 8 + 10 + 12 = 40; Origins 4 x 5 = 20; Legacy slot 2; Consecrate 6, one at a time)  
*The problem:* Every Marrow purchase but Consecrate is finite: 36 + 40 + 20 + 2 = 98 Marrow, then only 6 per consecration swap. At the honest 1.5 to 2 a quest the tree is bought by quest 50 to 65, about when Depth V unlocks; the retire or run decision the spec calls the endgame hook is then worth nothing and running every veteran to death is always right. Design, not a rule, and Stephen's; the builder does not need it tonight.  
*The ruling taken:* Record as a Director call: one repeatable Marrow sink after the tree (a second consecration slot at 6 per swap, or Excise payable in Marrow at Toughness 0). Nothing to build tonight.


---
