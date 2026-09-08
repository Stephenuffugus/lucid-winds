# MARROWDEEP prototype report
Written 2026-09-08 by the tuning pass. Cites `plans/marrowdeep/RULES.md` throughout (R1 to R13).
Nothing in this pass was committed; every number below was measured by the two files it describes.

---

## 1. What the prototype is

Two files, no dependencies, in `plans/marrowdeep/proto/`.

- **`engine.js`** is the whole rulebook as code and the only place a rule lives. Pure: no DOM, no `Date`, no
  `Math.random`. ES5, UMD, so it pastes into a classic script or loads with `require`. It carries
  `BALANCE` (every tunable, and nowhere else, per R0), the dice (R1), characters (R2), Strain and Armor (R3),
  the Origins, Callings and Traits (R4), the stage (R5), relic generation (R6), the boss (R7), the economy and
  the Hall (R8), the Depths, Sigils and Wards (R9), the effect vocabulary (R12) and the edge rulings (R13).
  It also carries `SIM.policy`, ONE legible player, so that a balance number measured against it means
  something: enumerate every legal assignment, score it by pass probability times the slot's Renown minus the
  Strain it risks weighted by how hurt the actor is, prefer the option that benches the most strained body,
  Push when it buys 15 points of pass probability and leaves two Strain of headroom, take the Aspect with the
  best expected damage, take a drop that beats what is worn, retire at Toughness 1, recruit to three bodies.
- **`sim.mjs`** measures the engine and never implements a rule. Four modes.

### How to run it

```
node sim.mjs --table     the R1.4 master table and the R1.5 floor rows, rolled through roll(), 200,000 a cell
node sim.mjs --test      the assertions over R0 to R13 (481 of them)
node sim.mjs --grid      the balance harness of spec 15: two experiments over the
                         BASE_TOUGHNESS x STRIKE_TARGET x STRIKE x RESPITE grid
node sim.mjs --depths    R7.4's winnability law: every Depth II to V wins between 25 and 75 percent
```

Flags: `--grid [--sample=N] [--accounts=N] [--questsPer=N] [--jobs=N] [--depth=D] [--maxRounds=N]
[--json=PATH] [--over=KEY=VAL]`, `--depths [--quests=N] [--accounts=N] [--warmCap=N] [--over=KEY=VAL]`.
`--over` is repeatable and takes any BALANCE key or a path into one (`--over=RENOWN.vault=6`,
`--over=STRIKE=[1,1,2,3,3]`, `--over=STRIKE_TARGET=all`).

Every draw goes through one seeded mulberry32 stream named per cell and per quest, so a run is reproducible
and `Math.random` is never called. The grid runs the AUTHORED banks in `plans/marrowdeep/data` when they are
readable and says which banks it used.

**Gate status after this pass:** `--table` OK. `--test` OK, 481 assertions. `--grid` prints. `--depths`
**FAILS**, and section 7 says why that is a verdict and not a defect.

---

## 2. The master table, as printed

`node sim.mjs --table`, 200,000 rolls a cell through the real `roll()`, no modifiers. The last block is new
in this pass: it rolls the composed floor through `floorFor` with a `floorPlus` on it, which is the only
way a raised floor cap shows up as a measured 100 percent where the table says 50 (see finding M1).

```
MARROWDEEP master table, R1.4 CORRECTED. 200,000 rolls per cell, no modifiers.
  measured / RULES R1.4      (a cell off by more than 0.50 points fails)
  die              TN3            TN4            TN5            TN6            TN7
  d 4    50.11/50.00    25.03/25.00    25.03/25.00    18.76/18.75    12.55/12.50
  d 6    66.70/66.70    49.97/50.00    33.20/33.30    16.63/16.70    16.63/16.70
  d 8    74.79/75.00    62.32/62.50    49.87/50.00    37.39/37.50    24.91/25.00
  d10    79.93/80.00    69.80/70.00    59.86/60.00    49.95/50.00    39.88/40.00
  d12    83.33/83.30    74.88/75.00    66.57/66.70    58.38/58.30    50.04/50.00

Surge rate per die (R1.2: only the top face surges, so 1/die).
  d 4   measured  24.97   R1.2  25.00
  d 6   measured  16.60   R1.2  16.67
  d 8   measured  12.51   R1.2  12.50
  d10   measured  10.04   R1.2  10.00
  d12   measured   8.31   R1.2   8.33

Floor rows, R1.5 CORRECTED (the first die only, so no surge dice: spec 2.4 measures the face).
  config          base EV   floored EV   gain     RULES gain   (tolerance 0.05)
  d 8 floor 3     4.498        4.873    0.375        0.375
  d 8 floor 4     4.500        5.248    0.748        0.750
  d10 floor 4     5.499        6.099    0.600        0.600
  d12 floor 4     6.509        7.001    0.492        0.500
  d12 floor 6     6.487        7.737    1.250        1.250

Floors under a floorPlus, R1.3 ("F <= die / 2, applied AFTER every floorPlus").
  build                                       floor   measured / R1.4   (tolerance 0.50)
  d12 half die floor + the Head "floors +1"     6/6   TN7    50.20/50.00
  d8 gear floor 4 + Ironbound                   4/4   TN5    49.87/50.00
  d6 gear floor 3 + Ironbound (the plus pays here)    3/3   TN4    49.92/50.00
  d4 Vanguard floor 4 + the Head affix          2/2   TN4    25.26/25.00

TABLE OK
```

Both of R1.4's corrected cells hold (d4 at TN 4 is 25.0, d6 at TN 6 is 16.7), both plateaus hold (a d4 reads
the same at TN 4 and TN 5, a d6 the same at TN 6 and TN 7), and the 50 percent diagonal the spec calls its
spine holds at d4/3, d6/4, d8/5, d10/6, d12/7.

---

## 3. Every verifier finding, applied or rejected

Twenty nine findings arrived from three lenses. **All twenty nine were correct against RULES and all twenty
nine are applied.** None was rejected outright; four are noted below where what shipped is not exactly what
the finding proposed, and each says why. Duplicates (the same defect seen by two lenses) are marked.

### Blockers

| # | Finding | What shipped |
|---|---|---|
| B1 | **R1.3 the half die floor cap was raised by `floorPlus`**, so a Head relic could auto pass every TN in the game (math; the same defect as rules-lens B2) | `effectiveFloor` now returns `Math.min(floor, floorCap(die))` and `floorFor` adds every `floorPlus` to the floor VALUE and then clamps ONCE at the half die. A d12 at floorHalf plus the Head affix reads 6, not 7. R1.3 states the cap twice and records that the raised version was overturned; the engine's own comment asserted the opposite of the rule it cited. |
| B2 | **R1.3 ships the overturned floor cap** (rules; duplicate of B1) | Same fix. `ctx.floorPlus` is no longer threaded into `oneRoll` or `passProb` as a ceiling lift; the field survives on the check context as a display number only. |
| B3 | **R7.0's dormant fourth Aspect is not implemented and `--depths` does not exist** | Aspects at Depth IV and V now carry `dormant: a >= 3`. A dormant Aspect cannot be assigned (`bossAssign` throws), is not counted unbroken, is skipped by the retarget pool and by `policy.boss`, and STRIKES NOTHING. `wakeOneDormant` fires the instant an Aspect breaks, so three bodies always face three Aspects. `--depths` is built; section 7 carries what it measured. |
| B4 | **`wipe` counted "every deployed body dead", not a party wipe** | Wipes are now counted only over quests that deployed a full `PARTY_SIZE`, with their own denominator, and quests that deployed fewer bodies are surfaced as their own `short` column with the reason printed. The 24 percent of ACCOUNT quests that deploy short is the most important thing the old grid hid, and it now has a column. |

### Majors

| # | Finding | What shipped |
|---|---|---|
| M1 | The harness pinned the floor cap bug as green | The three assertions now read 4, 4 and 6, R4.9's own worked examples are asserted (a Vanguard d4 reads 2, a d6 reads 3), a sweep over every die, floor and `floorPlus` asserts no build can exceed the half die, and `--table` grew four rows that ROLL a composed floor with a `floorPlus` on it, so a raised cap would show as a measured 100 where R1.4 says 50. |
| M2 | R6.11's repricing was half applied (`floorPlus` 3, `rerollStage` 3) | `floorPlus` is 1 point, `rerollStage` is 6. The pinned spec-11.2 block now cites R6.11 for the four corrected rows and asserts each of the four values by name. |
| M3 | R6.11 affix prices (rules; duplicate of M2) | Same fix. |
| M4 | R8.4 counted only the deepest unlocked Depth | `q.depth >= deepestUnlocked - 1`. The assertion is split into three: one Depth back counts, the deepest counts, two Depths back does not. |
| M5 | R8.5 paid an unproven death nothing at every Depth | New BALANCE row `UNPROVEN_DEATH_MARROW: [1,1,1,0,0]`, so an unproven death pays a flat 1 at Depth I to III and 0 at IV and V, and always makes the Legacy and writes the wall. Both halves are asserted. |
| M6 | R8.7 legacy slots started at 1 and capped at 2, and the real invariant was never enforced | `LEGACY_SLOTS_START` 2, `legacyMax` 3, and `dealCallings` now RESERVES one of the three cards for a Calling the account owns no Legacy for whenever one exists. Measured over 4,000 deals at slots 2 and 3 against an account owning three Callings deep: the door is open in every deal (it was shut in 5.0 and 16.7 percent of deals before). |
| M7 | R13.3's once per stage reroll was not reset per boss round | `q.rerollUsed = {}` joined the round reset. The assertion is flipped to the rule's own wording. The carve out's pricing problem is solved by R6.11's price, which is M2. |
| M8 | R8.0b: the mid quest Recruit bypassed the price index and the roster cap | `replace()` now pays `price(state, B.HALL.recruit)` and refuses at the living roster cap. **Correction to the finding's arithmetic:** a Depth V mid quest Recruit costs **125**, not 205 (205 is the Commission's 40 indexed; 25 x 5.1 = 127.5, and 127.5 / 5 rounds to 25 in IEEE754, so the nearest 5 is 125). Both numbers are asserted. |
| M9 | R2.1's free stat rerolls were missing | `account.freeRerolls` starts at `FREE_ROLLS`, and `SIM.rerollStats` re-runs R2.1's order in place (four stats, then the Origin's shift or fifth die, then the creation floors LAST), decrements, and refuses at zero or on a character that has survived a quest. Six assertions, including that the paid creation floor still holds after a reroll. |
| M10 | Experiment B was about four times too small for a one point standard error | Every scored number now carries its CLUSTER ROBUST ratio standard error (the cluster is the quest in FRESH, the whole account in ACCOUNT), a `*` means a miss by MORE than one SE and a `~` means a miss by less, and the default account count went 300 to 500. **Partial:** the finding's 6,600 accounts for a half point SE on wipe was not adopted; on two cores that is a forty minute default. The SE is printed instead, so no reader has to guess. |
| M11 | The policy read TNs the player cannot see | `probFor` consults `SIM.tnVisible` and, when the TN is hidden (R5.8 Blindness, the R9.2 blindfold Sigil), scores against the PUBLISHED prior: `GATE_TN_WEIGHTS` for a Gate, the authored Aspect TN spread for the boss. Every other shape's TN is printed in R5.5 and stays exact. Resolution still uses the true TN. Asserted both ways. |
| M12 | Whole quest numbers were scored against targets RULES says describe the PRE BOSS game | Pre boss death, 1+death and wipe are captured and printed. **Partial, and deliberate:** the FRESH table stars its PRE BOSS columns, which is R7.4's ruling on spec 8.6; the ACCOUNT table stars the WHOLE QUEST columns, because that is the experiment this tuning brief names and scores. Each table prints the other half unstarred beside it and the header says which is which. |
| M13 | The scored Renown column excluded salvage | `Renown all` (reward plus salvage, which is what "mean Renown per run" means) is the scored column and the leftmost of the pair; `of which reward` prints beside it. |

### Minors

| # | Finding | What shipped |
|---|---|---|
| m1 | RULES R1.9's caps list contradicted R1.3 | RULES.md edited: "Floor <= die/2 (R1.3, applied AFTER every `floorPlus`, so the worst case this cap has to hold is a d12 reading 6 and nothing more)". This is the only line of RULES this pass changed. |
| m2 | `probFor` and `expectedDamage` dropped roll time fields | One `probOpts(o)` builder is forwarded verbatim by both call sites, `passProb` learned `surgeOnce` (R9.3's Hollow Air Ward: one surge die, no chain), and `expectedDamage` now reads the reroll and the twice. Asserted: a character carrying every roll time effect at once agrees with 60,000 real rolls to within one point. |
| m3 | The composed cap comment said six where the code says five | Rewritten to five with R1.9's own reason. |
| m4 | `spread` did not land each point as its own instance | The spread branch applies `perTarget[id]` instances of 1. Asserted at a Strike of 3, where the readings differ: a Vanguard takes 0 and Unkillable stops the run one point short. |
| m5 | A Toll fee that would kill its holder was neither refused nor forfeited | `canPayToll` / `anyCanPayToll` beside `canPush`, `assign()` throws on an unpayable Toll holder, the slot is a legal FORFEIT when no living character can pay, and the policy masks such a Toll out of its own enumeration. |
| m6 | The merged filler line was invisible to the FILLER_MAX assertion | The merge path sets `filler` and records `fillerPts`; the gate counts `fillerPts` when present and now exercises the merge path on purpose. |
| m7 | R3.4 was untested where it matters | Three negatives added: a Respite does not refill the Armor pool, no boss round refills it, a sealed stage repeat does not refill it. |
| m8 | `censored` was counted after a Hall that recruits fresh bodies | The roster is snapshotted before the closing Hall and filtered to bodies that actually played. |
| m9 | `cellKey` omitted the Depth | It carries the Depth, so two `--depth=` runs no longer draw the same streams. |
| m10 | Every FRESH row printed `0.00*` for Marrow | FRESH Marrow prints unmarked, with the law restated under the table. |
| m11 | `m.living` defaulted to 0 | It starts at -1 and `tally` throws rather than scoring a cleared quest as a wipe. |
| m12 | The policy never used R5.10 mid quest replacement | `policy.replace` takes the freshest rested reserve whenever one exists and buys a body when it can pay the indexed price, called from the `stageEnd` branch of both loops, with a `repl` column. It fires rarely (0.01 a quest) for a reason the grid now shows: an account short handed enough to want it is by construction an account that could not afford a Recruit in the Hall either. |

---

## 4. Four things this pass found that no finding named

These are not in the verifier list. Each is a RULES line the code was breaking, each is cheap, each is applied.

1. **R13.11 was not enforced, and it cost over half of every Head relic.** "Every floor key counts as one key
   per stat, so one item carries at most one floor line per stat." `floor3` and `floorHalf` kept SEPARATE stat
   pools, so **2,787 of 5,000 Depth V Head relics (55.7 percent)** carried two floor lines on the same stat,
   where R1.3 says the highest holds and they do not add. The lower line was dead points on a card that claims
   to spend them. The two keys now share one stat pool (`KEY_FAMILY`), in generation and in Reforge, and the
   thousand item gate reads the family. After the fix: 0 in 5,000.
2. **R6.2's "at most 50 draws per item" was being spent four at a time.** A single fill pass strands whenever
   no valid affix fits the remainder (a Charm that drew a twice and four rerolls sits on 3 with only the
   6 point reroll left), and it stranded after about four draws, so R6.2 (c)'s rarity fallback fired with
   forty six draws of the allowance unused: **2.0 percent of Depth V Relic Charms downgraded themselves to
   Rare.** The fill now restarts inside the allowance; the draw itself is untouched and still uniform among
   the valid affixes, exactly as R6.2 writes it. After the fix: 0.6 percent, all of them Head (see section 8).
3. **R5.6's lone survivor took no slot at all.** `enumerateAssignments` returned NOTHING once the bodies ran
   short, so the policy forfeited the WHOLE stage: a lone survivor rolled nothing, risked nothing and earned
   nothing, which made limping on solo safer than it is. The enumeration now offers a FORFEIT for a slot with
   no body left, so the survivor holds one slot and every Relay is forfeit, which is what R5.6 says.
4. **The policy Mended its way into the solo trap.** `policy.hall` bought a 20 Renown Mend while the roster
   could not field three bodies, which left it under the 25 Renown Recruit. Guarded: no Mend while fewer than
   `PARTY_SIZE` can deploy. Short deployments fell from 26.4 to 18.0 percent of ACCOUNT quests at the cell that
   was shipped when this pass started.

---

## 5. The tuning pass

### 5.1 What was swept

Three sweeps of the ACCOUNT experiment at Depth I, all through `SIM.policy` on the authored banks, all seeded
per cell and per quest.

1. **The grid itself**, 36 cells of BASE_TOUGHNESS x STRIKE_TARGET x STRIKE x RESPITE, 200 accounts a cell.
2. **The grid x the two levers that move the boss without moving the four axes**: Aspect hit points
   (`ASPECT_HP_BONUS`) at -1, 0 and +1, and `GATE_TN_WEIGHTS` at 40/40/20 and 10/40/50, over the six best
   cells, 200 accounts a cell.
3. **The leaders x the Renown row**, four scalings of `RENOWN`, 250 accounts a cell, then the eight finalists
   at **1,000 accounts** (a standard error of 0.7 points on death per character).

### 5.2 No cell of the grid reaches the targets, and two pairs of targets cannot both be reached at all

**The grid alone.** At the cell that was shipped when this pass started (T4 / attackers / STRIKE 1 /
RESPITE 1) the ACCOUNT experiment measures **8.8 percent** death per character (SE 0.5 over 1,000 accounts),
which is under the 12 to 15 band, with 19.6 percent at least one death and 53.5 Renown a run. Every other cell
of the 36 either sits under the band or jumps clean over it: the same axis at RESPITE 0 reads 42.6 percent, at
STRIKE 2 reads 40.7 percent, and at BASE_TOUGHNESS 3 reads 21.1 percent. **The grid's four axes are integers
and every step of every one of them is worth 10 to 30 points of death rate**, so there is no cell in it that
lands inside a 3 point band. That is the finding, not a failure of searching: nine of the 36 cells were
measured at 1,000 accounts to be sure.

**Two targets that cannot both hold.** With a three body party, let *d* be death per character, *A* the at
least one death rate and *W* the wipe rate. Every wipe is three deaths and every other death quest is at least
one, so `3d >= 2W + A`. The spec's own three numbers are `d = 0.135`, `A = 0.35`, `W = 0.08`: that needs
`0.405 >= 0.51`. **Spec 8.6's three headline numbers are jointly impossible.** The best a run inside both the
death band and the 1+death band can do is `W <= (3 x 0.15 - 0.30) / 2 = 7.5 percent`, and only if deaths came
in ones and threes and never twos, which no Strike law produces: the most clustering of the three
(`STRIKE_TARGET: all`) measured 2.4 percent wipe at 15.5 percent death, against `attackers`' 2.1 at 14.8. So
**wipe is the target this pass could not reach**, and it is third in the brief's own priority order.

**And a second pair.** The policy retires a character at effective Toughness 1. With `BASE_TOUGHNESS` 4 and
`SCAR_EVERY` 2 (R2.5, a Director call already made), the third Scar lands at six survived quests and reads
Toughness 1, so a career is capped at six even if nothing ever kills anybody: `E[min(G, 6)]` at a per quest
death probability *p* is `sum (1-p)^k, k = 1..6`, which is 3.42 at p = 0.148 and does not reach 4.0 until
p falls under about 0.09. **Career 4 to 7 needs a death rate under 9 percent, which is below the 12 to 15
band.** Measured career at the chosen cell is 3.16, with 17.8 percent of careers still running when the
account stopped at quest 25 (censoring biases the mean low, so the true figure is a little higher).

### 5.3 What moved, and why

The four grid axes did NOT move. Two BALANCE rows did.

| BALANCE row | was | now | why |
|---|---|---|---|
| `ASPECT_HP_BONUS` | `[0, 0, 1, 2, 2]` | `[1, 1, 2, 3, 3]` | The authored Depth I boss (3/3/4 hit points against three bodies that walk in rested under RESPITE 1) killed **8.8 percent** of characters a run against spec 8.6's 12 to 15. Aspect hit points are the only lever that moves the boss without moving BASE_TOUGHNESS off the 4 that R7.4 keeps so the Scar treadmill still works. **R7.1's LADDER is untouched**: authored at Depth I and II, +1 at III, +2 at IV and V. Only its baseline moved, by one. The alternative that measured the same at Depth I was BASE_TOUGHNESS 3 with the ladder one LOWER (15.0 percent death, 34.4 Renown), and it was refused because it re-prices the whole Scar, retire, Mend and Excise economy that R2.5 and R2.6 compute against a base of 4. |
| `RENOWN` | `{gate 3, open 2, toll 4, chain 6, relay 6, vault 8, boss 12, firstBoss 8}` | `{gate 2, open 2, toll 3, chain 5, relay 5, vault 6, boss 9, firstBoss 6}` | The row is R5.9's own, scaled to three quarters and rounded. An ACCOUNT of 25 Depth I quests earned **53.5 Renown a run** against spec 15's target of about 35, and nothing in the four axes moves income without moving the death rate off its target first. **R5.9's argument is about the ORDER of the ladder, and the order is unchanged**: Open <= Gate < Toll < Chain = Relay < Vault < boss, with the Vault still carrying the most Renown of any slot plus two relic rolls, the first at +1 tier. The gate now asserts the ORDER rather than the six absolute numbers, so a future scaling cannot silently invert it. |

Rows that were swept and left where they were: `GATE_TN_WEIGHTS` (10/40/50 and 0/40/60 were measured; they
raise death by about 3 points and cut Renown by about 1, and they do it by making a whole column of the master
table the common case, which R5.5 moved the weights once already to avoid), `BASE_TOUGHNESS`, `STRIKE`,
`RESPITE`, `STRIKE_TARGET`, `SCAR_EVERY`, `RETIRE_VESTING`, `strainOnFail` (a weak lever at ACCOUNT: the
pre boss check pass rate is 94.7 percent, so failures are rare enough that their price barely registers).

---

## 6. The full grid, as printed

`node sim.mjs --grid` at the defaults (4,000 FRESH quests and 500 accounts x 25 ACCOUNT quests a cell,
36 cells, 594,000 quests, 823 seconds on two cores). BALANCE carries the tuned defaults, so the row marked
as the shipped cell IS the recommendation.

```
MARROWDEEP balance harness, Depth 1, engine.js under SIM.policy.
SAMPLE: (A) FRESH 4,000 quests per cell, three freshly rolled tier 1 characters, no gear.
        (B) ACCOUNT 500 accounts x 25 quests = 12,500 quests per cell, whole progression.
        36 cells, 594,000 quests in all, 823s wall, jobs 2.
        Seeds are named per cell and per quest; Math.random is never called. Banks: plans/marrowdeep/data (authored).
        Boss fights are stopped at 60 rounds and counted under "stall" (see the note under (B)).
"cens" is the share of careers still running when the account stopped: those are censored, so the
career mean is over COMPLETED careers only and reads low wherever cens is high.
Every scored number carries its CLUSTER ROBUST standard error in brackets: the cluster is the quest
in (A) and the whole ACCOUNT in (B), where gear, Traits, Scars and Renown carry across all quests
(the ACCOUNT design effect on death per character is about 26, so 7,500 quests carry the information
of about 280). A * means the number misses its band by MORE than one SE; a ~ means it misses by less,
which is noise. "hits" counts the targets met or missed by under one SE.
WHICH HALF IS SCORED: (A) FRESH stars its PRE BOSS columns, which is what RULES R7.4 rules spec 8.6
describes ("8.6 was never a whole quest number, and the boss was never costed"); (B) ACCOUNT stars
the WHOLE QUEST columns, which is the experiment the tuning brief names. Each table prints the other
half unstarred beside it. Renown all = reward + salvage (R6.7, R6.8), which is what "mean Renown per
run" means; "of which reward" is the stage and boss half alone. "short" counts quests that deployed
fewer than PARTY_SIZE bodies (the account could not afford a Recruit); "repl" is R5.10 replacements
taken per quest. A wipe is scored over FULL PARTY quests only, so a solo body dying is not a wipe.

### (A) FRESH, 4,000 quests per cell

| T | target | STK | RSP | death/char | 1+ death | wipe | death pre | 1+ pre | wipe pre | win | stall | short | repl | Renown all | of which reward | Marrow | chk pre | chk boss | rounds | hits |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| * | spec target |  |  |  |  |  | 12 to 15% | about 35% | about 8% |  | 0 | low |  | about 35 |  | 0 by law | 70 to 75% |  |  | 4 |
| 3 | attackers | 1 | 0 | 89.8% | 98.0% | 77.2% | 53.6% (0.5)* | 82.2% (0.6)* | 24.2% (0.7)* | 22.4% | 0.4%* | 0.0% | 0.00 | 26.8 (0.2)* | 21.2 | 2.70  | 74.9% | 51.8% | 4.01 | 0 |
| 3 | attackers | 1 | 1 | 71.0% | 85.5% | 53.0% | 21.0% (0.4)* | 45.8% (0.8)* | 2.9% (0.3)* | 46.1% | 0.9%* | 0.0% | 0.00 | 33.0 (0.1)  | 28.3 | 2.13  | 83.3% | 56.2% | 4.19 | 1 |
| 3 | attackers | 2 | 0 | 98.4% | 99.5% | 97.2% | 53.3% (0.6)* | 81.7% (0.6)* | 24.4% (0.7)* | 2.8% | 0.0%  | 0.0% | 0.00 | 26.7 (0.2)* | 19.3 | 2.95  | 75.0% | 70.8% | 1.31 | 0 |
| 3 | attackers | 2 | 1 | 92.0% | 96.0% | 87.9% | 21.3% (0.4)* | 46.1% (0.8)* | 2.8% (0.3)* | 12.0% | 0.0%  | 0.0% | 0.00 | 33.2 (0.2)  | 24.9 | 2.76  | 82.7% | 73.8% | 1.76 | 1 |
| 3 | all | 1 | 0 | 90.6% | 98.5% | 77.6% | 52.9% (0.5)* | 82.7% (0.6)* | 22.8% (0.7)* | 21.8% | 0.6%* | 0.0% | 0.00 | 26.8 (0.2)* | 21.1 | 2.72  | 75.2% | 48.9% | 4.07 | 0 |
| 3 | all | 1 | 1 | 77.1% | 90.1% | 59.1% | 21.1% (0.4)* | 46.4% (0.8)* | 2.5% (0.2)* | 40.0% | 1.0%* | 0.0% | 0.00 | 33.0 (0.1)  | 27.6 | 2.31  | 83.0% | 54.1% | 4.23 | 1 |
| 3 | all | 2 | 0 | 99.1% | 99.6% | 98.2% | 53.1% (0.5)* | 82.2% (0.6)* | 23.1% (0.7)* | 1.8% | 0.0%  | 0.0% | 0.00 | 26.9 (0.2)* | 19.4 | 2.97  | 75.1% | 70.4% | 1.21 | 0 |
| 3 | all | 2 | 1 | 95.7% | 98.4% | 92.5% | 20.8% (0.4)* | 45.2% (0.8)* | 2.5% (0.2)* | 7.4% | 0.0%* | 0.0% | 0.00 | 33.6 (0.2)  | 24.7 | 2.87  | 83.2% | 75.5% | 1.47 | 1 |
| 3 | spread | 1 | 0 | 82.7% | 92.2% | 73.4% | 52.9% (0.5)* | 81.3% (0.6)* | 23.6% (0.7)* | 26.2% | 0.4%* | 0.0% | 0.00 | 26.9 (0.2)* | 21.7 | 2.48  | 75.3% | 51.4% | 3.65 | 0 |
| 3 | spread | 1 | 1 | 51.6% | 65.6% | 40.8% | 21.3% (0.4)* | 46.2% (0.8)* | 2.6% (0.3)* | 59.0% | 0.3%* | 0.0% | 0.00 | 32.6 (0.1)  | 29.3 | 1.55  | 83.0% | 58.8% | 3.67 | 1 |
| 3 | spread | 2 | 0 | 87.3% | 96.0% | 77.5% | 53.2% (0.6)* | 81.6% (0.6)* | 24.4% (0.7)* | 22.1% | 0.3%* | 0.0% | 0.00 | 26.8 (0.2)* | 21.1 | 2.62  | 74.8% | 51.9% | 3.49 | 0 |
| 3 | spread | 2 | 1 | 66.0% | 78.9% | 54.0% | 21.2% (0.4)* | 45.6% (0.8)* | 2.9% (0.3)* | 45.3% | 0.7%* | 0.0% | 0.00 | 32.9 (0.1)  | 28.0 | 1.98  | 83.1% | 56.1% | 3.53 | 1 |
| 4 | attackers | 1 | 0 | 82.4% | 93.8% | 66.4% | 37.0% (0.5)* | 66.7% (0.7)* | 11.2% (0.5)* | 33.0% | 0.7%* | 0.0% | 0.00 | 30.6 (0.1)  | 25.1 | 2.47  | 79.9% | 52.9% | 4.12 | 1 |
| 4 | attackers | 1 | 1 | 50.3% | 66.3% | 32.9% | 6.6% (0.2)* | 17.0% (0.6)* | 0.3% (0.1)* | 66.5% | 0.6%* | 0.0% | 0.00 | 34.5 (0.1)  | 31.4 | 1.51  | 85.4% | 61.9% | 3.93 | 1 |
| 4 | attackers | 2 | 0 | 96.3% | 98.4% | 94.0% | 35.5% (0.5)* | 64.6% (0.8)* | 10.7% (0.5)* | 5.9% | 0.1%* | 0.0% | 0.00 | 31.3 (0.2)  | 22.9 | 2.89  | 80.5% | 70.2% | 1.49 | 1 |
| 4 | attackers | 2 | 1 | 81.0% | 88.6% | 73.8% | 6.7% (0.3)* | 17.4% (0.6)* | 0.4% (0.1)* | 26.2% | 0.0%  | 0.0% | 0.00 | 34.8 (0.1)  | 27.6 | 2.43  | 85.1% | 73.1% | 2.23 | 1 |
| 4 | all | 1 | 0 | 85.6% | 95.7% | 69.7% | 36.5% (0.5)* | 66.3% (0.7)* | 10.9% (0.5)* | 29.5% | 0.8%* | 0.0% | 0.00 | 30.6 (0.1)  | 24.8 | 2.57  | 80.3% | 51.4% | 4.07 | 1 |
| 4 | all | 1 | 1 | 63.0% | 78.9% | 43.1% | 6.9% (0.3)* | 17.8% (0.6)* | 0.2% (0.1)* | 56.2% | 0.6%* | 0.0% | 0.00 | 34.5 (0.1)  | 30.3 | 1.89  | 85.1% | 60.1% | 4.10 | 1 |
| 4 | all | 2 | 0 | 97.7% | 99.2% | 95.8% | 35.8% (0.5)* | 64.8% (0.8)* | 10.3% (0.5)~ | 4.2% | 0.0%  | 0.0% | 0.00 | 31.2 (0.2)  | 22.7 | 2.93  | 80.2% | 72.5% | 1.27 | 2 |
| 4 | all | 2 | 1 | 88.5% | 92.8% | 84.3% | 6.7% (0.2)* | 17.4% (0.6)* | 0.3% (0.1)* | 15.7% | 0.0%  | 0.0% | 0.00 | 35.2 (0.1)  | 26.7 | 2.66  | 85.2% | 74.8% | 1.79 | 1 |
| 4 | spread | 1 | 0 | 71.0% | 83.5% | 59.7% | 37.1% (0.5)* | 66.6% (0.7)* | 11.3% (0.5)* | 40.0% | 0.3%* | 0.0% | 0.00 | 30.5 (0.1)  | 25.8 | 2.13  | 80.2% | 54.7% | 3.78 | 1 |
| 4 | spread | 1 | 1 | 27.1% | 37.0% | 19.7% | 6.9% (0.2)* | 18.4% (0.6)* | 0.1% (0.1)* | 80.2% | 0.1%* | 0.0% | 0.00 | 34.2 (0.1)  | 32.5 | 0.81  | 85.1% | 63.1% | 3.59 | 1 |
| 4 | spread | 2 | 0 | 78.8% | 90.1% | 67.3% | 36.9% (0.5)* | 66.5% (0.7)* | 10.9% (0.5)* | 32.4% | 0.4%* | 0.0% | 0.00 | 30.8 (0.1)  | 25.2 | 2.37  | 80.2% | 54.6% | 3.54 | 1 |
| 4 | spread | 2 | 1 | 45.7% | 56.7% | 36.5% | 6.5% (0.2)* | 17.1% (0.6)* | 0.2% (0.1)* | 63.0% | 0.5%* | 0.0% | 0.00 | 34.4 (0.1)  | 31.0 | 1.37  | 85.1% | 60.8% | 3.37 | 1 |
| 5 | attackers | 1 | 0 | 72.8% | 87.2% | 54.4% | 22.6% (0.4)* | 46.9% (0.8)* | 4.2% (0.3)* | 44.8% | 0.9%* | 0.0% | 0.00 | 33.2 (0.1)  | 28.2 | 2.19  | 83.3% | 54.2% | 4.34 | 1 |
| 5 | attackers | 1 | 1 | 36.6% | 49.7% | 23.4% | 2.1% (0.1)* | 5.6% (0.4)* | 0.1% (0.0)* | 76.0% | 0.6%* | 0.0% | 0.00 | 34.5 (0.1)  | 32.3 | 1.10  | 85.4% | 64.4% | 3.71 | 1 |
| 5 | attackers | 2 | 0 | 93.1% | 96.9% | 89.4% | 23.5% (0.5)* | 48.4% (0.8)* | 4.3% (0.3)* | 10.6% | 0.1%* | 0.0% | 0.00 | 33.4 (0.1)  | 25.0 | 2.79  | 83.0% | 70.5% | 1.67 | 1 |
| 5 | attackers | 2 | 1 | 68.9% | 78.7% | 60.0% | 1.6% (0.1)* | 4.5% (0.3)* | 0.0% (0.0)* | 40.0% | 0.0%* | 0.0% | 0.00 | 35.5 (0.1)  | 29.4 | 2.07  | 85.9% | 73.3% | 2.51 | 1 |
| 5 | all | 1 | 0 | 78.7% | 92.5% | 59.4% | 22.7% (0.4)* | 47.8% (0.8)* | 3.9% (0.3)* | 40.0% | 0.7%* | 0.0% | 0.00 | 33.3 (0.1)  | 27.9 | 2.36  | 83.7% | 54.5% | 4.28 | 1 |
| 5 | all | 1 | 1 | 49.7% | 63.6% | 33.4% | 1.9% (0.1)* | 5.3% (0.4)* | 0.1% (0.0)* | 66.0% | 0.6%* | 0.0% | 0.00 | 34.7 (0.1)  | 31.5 | 1.49  | 85.7% | 63.4% | 3.72 | 1 |
| 5 | all | 2 | 0 | 95.7% | 98.3% | 92.5% | 22.5% (0.4)* | 48.0% (0.8)* | 4.0% (0.3)* | 7.5% | 0.0%* | 0.0% | 0.00 | 33.6 (0.1)  | 24.9 | 2.87  | 83.5% | 72.1% | 1.43 | 1 |
| 5 | all | 2 | 1 | 82.8% | 87.5% | 78.0% | 1.7% (0.1)* | 4.8% (0.3)* | 0.1% (0.0)* | 21.9% | 0.0%* | 0.0% | 0.00 | 35.4 (0.1)  | 27.5 | 2.48  | 85.5% | 73.6% | 2.01 | 1 |
| 5 | spread | 1 | 0 | 55.9% | 69.5% | 45.1% | 22.3% (0.4)* | 46.5% (0.8)* | 4.0% (0.3)* | 54.5% | 0.3%* | 0.0% | 0.00 | 33.0 (0.1)  | 29.2 | 1.68  | 83.5% | 57.8% | 3.70 | 1 |
| 5 | spread | 1 | 1 | 12.2% | 17.0% | 8.6% | 1.7% (0.1)* | 4.9% (0.3)* | 0.0% (0.0)* | 91.2% | 0.2%* | 0.0% | 0.00 | 34.4 (0.1)  | 33.7 | 0.36  | 85.4% | 66.5% | 3.32 | 1 |
| 5 | spread | 2 | 0 | 68.6% | 81.0% | 56.8% | 22.3% (0.4)* | 46.6% (0.8)* | 4.3% (0.3)* | 42.9% | 0.4%* | 0.0% | 0.00 | 33.1 (0.1)  | 28.0 | 2.06  | 83.3% | 56.0% | 3.59 | 1 |
| 5 | spread | 2 | 1 | 29.2% | 36.5% | 23.4% | 1.9% (0.1)* | 5.1% (0.3)* | 0.0% (0.0)* | 76.3% | 0.3%* | 0.0% | 0.00 | 34.5 (0.1)  | 32.4 | 0.88  | 85.6% | 66.2% | 3.15 | 1 |

Marrow reads about 0 in every FRESH cell by law, not by accident: R8.5 pays the full rate only for a
PROVEN character, and every character in this experiment is on its first quest (an unproven death
pays the flat 1 at Depth I to III, 0 at IV and V). Marrow is a (B) number and is not starred here.

### (B) ACCOUNT, 500 accounts x 25 quests per cell

| T | target | STK | RSP | death/char | 1+ death | wipe | death pre | 1+ pre | wipe pre | win | stall | short | repl | Renown all | of which reward | Marrow | career | cens | chk pre | chk boss | rounds | hits |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| * | spec target |  |  | 12 to 15% | about 35% | about 8% |  |  |  |  | 0 | low |  | about 35 |  | about 1.5 | 4 to 7 | low | 70 to 75% |  |  | 6 |
| 3 | attackers | 1 | 0 | 67.3% (2.3)* | 85.2% (1.3)* | 17.7% (1.6)* | 50.4% | 66.4% | 5.3% | 18.9% | 0.1%* | 81.9% | 0.01 | 15.9 (0.6)* | 12.3 | 1.20 (0.02)  | 0.30 (0.03)* | 2.7% | 77.6% | 73.1% | 2.67 | 1 |
| 3 | attackers | 1 | 1 | 25.2% (1.4)* | 47.4% (1.9)* | 3.8% (0.3)* | 8.3% | 17.0% | 0.2% | 57.9% | 0.0%* | 44.2% | 0.01 | 33.6 (0.7)  | 26.6 | 1.56 (0.02)  | 1.76 (0.12)* | 11.5% | 91.9% | 85.9% | 2.15 | 2 |
| 3 | attackers | 2 | 0 | 98.5% (0.8)* | 99.5% (0.3)* | 87.9% (5.6)* | 71.0% | 74.6% | 23.9% | 0.7% | 0.0%  | 95.5% | 0.00 | 9.7 (0.1)* | 7.2 | 1.09 (0.00)* | 0.01 (0.01)* | 0.1% | 69.1% | 74.7% | 1.12 | 0 |
| 3 | attackers | 2 | 1 | 82.1% (2.3)* | 92.9% (1.0)* | 33.5% (3.4)* | 25.8% | 31.3% | 1.5% | 8.3% | 0.0%* | 88.6% | 0.01 | 16.7 (0.4)* | 12.6 | 1.16 (0.01)* | 0.14 (0.02)* | 1.2% | 81.5% | 82.0% | 1.29 | 0 |
| 3 | all | 1 | 0 | 68.4% (2.2)* | 85.8% (1.2)* | 18.7% (1.6)* | 50.8% | 66.5% | 5.4% | 18.7% | 0.1%* | 82.5% | 0.01 | 15.9 (0.6)* | 12.3 | 1.20 (0.02)~ | 0.28 (0.03)* | 2.7% | 77.5% | 71.9% | 2.64 | 1 |
| 3 | all | 1 | 1 | 29.5% (1.5)* | 52.9% (1.8)* | 4.9% (0.3)* | 10.0% | 19.6% | 0.3% | 53.3% | 0.1%* | 49.2% | 0.01 | 31.9 (0.7)  | 25.2 | 1.53 (0.02)  | 1.46 (0.10)* | 10.0% | 91.1% | 83.2% | 2.26 | 2 |
| 3 | all | 2 | 0 | 97.8% (1.0)* | 99.3% (0.3)* | 81.6% (6.6)* | 71.8% | 75.8% | 23.7% | 1.0% | 0.0%* | 95.2% | 0.00 | 9.6 (0.2)* | 7.2 | 1.09 (0.00)* | 0.01 (0.01)* | 0.1% | 68.8% | 73.4% | 1.10 | 0 |
| 3 | all | 2 | 1 | 89.9% (1.7)* | 96.4% (0.7)* | 48.8% (4.7)* | 28.2% | 32.6% | 1.6% | 4.8% | 0.0%* | 91.9% | 0.01 | 15.5 (0.3)* | 11.6 | 1.13 (0.01)* | 0.07 (0.01)* | 0.7% | 80.2% | 81.3% | 1.20 | 0 |
| 3 | spread | 1 | 0 | 53.5% (2.3)* | 76.2% (1.7)* | 11.0% (0.9)* | 40.9% | 60.4% | 3.6% | 27.3% | 0.0%* | 72.8% | 0.01 | 19.3 (0.7)* | 15.1 | 1.29 (0.02)  | 0.57 (0.05)* | 4.0% | 81.3% | 78.0% | 2.44 | 1 |
| 3 | spread | 1 | 1 | 16.2% (1.1)* | 33.8% (1.9)  | 2.4% (0.2)* | 5.8% | 13.0% | 0.2% | 68.7% | 0.0%* | 31.9% | 0.01 | 37.5 (0.7)  | 29.7 | 1.70 (0.02)  | 2.87 (0.19)* | 15.6% | 93.4% | 88.1% | 2.07 | 3 |
| 3 | spread | 2 | 0 | 62.3% (2.3)* | 81.8% (1.4)* | 16.2% (1.3)* | 46.3% | 62.9% | 5.1% | 21.4% | 0.1%* | 79.0% | 0.01 | 17.0 (0.6)* | 13.2 | 1.21 (0.02)  | 0.37 (0.04)* | 3.3% | 79.1% | 73.9% | 2.55 | 1 |
| 3 | spread | 2 | 1 | 28.0% (1.5)* | 51.0% (1.9)* | 4.8% (0.3)* | 9.4% | 18.5% | 0.3% | 52.6% | 0.1%* | 48.4% | 0.01 | 31.5 (0.7)  | 25.0 | 1.51 (0.02)  | 1.53 (0.11)* | 10.5% | 91.1% | 83.7% | 2.07 | 2 |
| 4 | attackers | 1 | 0 | 51.2% (2.2)* | 74.4% (1.7)* | 9.6% (0.8)  | 33.1% | 51.0% | 1.5% | 30.1% | 0.2%* | 70.8% | 0.01 | 21.9 (0.7)* | 17.1 | 1.26 (0.02)  | 0.58 (0.05)* | 4.7% | 83.8% | 76.3% | 2.33 | 2 |
| 4 | attackers | 1 | 1 | 14.4% (1.0)  | 30.6% (1.8)  | 2.0% (0.2)* | 2.8% | 6.6% | 0.0% | 73.1% | 0.1%* | 28.5% | 0.00 | 39.6 (0.6)  | 31.4 | 1.61 (0.02)  | 3.27 (0.22)* | 17.9% | 94.9% | 88.1% | 2.09 | 4 |
| 4 | attackers | 2 | 0 | 91.8% (1.7)* | 97.0% (0.7)* | 54.7% (5.7)* | 56.6% | 63.5% | 6.3% | 3.7% | 0.0%* | 92.9% | 0.01 | 12.7 (0.3)* | 9.5 | 1.12 (0.01)* | 0.06 (0.01)* | 0.5% | 74.1% | 76.5% | 1.25 | 0 |
| 4 | attackers | 2 | 1 | 60.6% (2.5)* | 81.2% (1.6)* | 14.1% (1.3)* | 10.7% | 15.7% | 0.1% | 20.8% | 0.0%* | 76.8% | 0.01 | 22.3 (0.6)* | 17.1 | 1.25 (0.01)  | 0.44 (0.05)* | 2.9% | 87.9% | 86.6% | 1.41 | 1 |
| 4 | all | 1 | 0 | 58.1% (2.2)* | 79.3% (1.5)* | 12.1% (1.0)* | 37.2% | 53.8% | 2.2% | 26.2% | 0.1%* | 75.7% | 0.01 | 20.2 (0.6)* | 15.7 | 1.21 (0.02)  | 0.43 (0.04)* | 3.7% | 82.0% | 73.8% | 2.56 | 1 |
| 4 | all | 1 | 1 | 22.2% (1.3)* | 43.0% (1.9)* | 3.3% (0.3)* | 4.3% | 9.3% | 0.1% | 61.8% | 0.1%* | 40.1% | 0.01 | 35.6 (0.7)  | 28.2 | 1.51 (0.02)  | 2.04 (0.14)* | 13.1% | 93.5% | 86.7% | 2.08 | 2 |
| 4 | all | 2 | 0 | 96.5% (1.0)* | 98.9% (0.4)* | 73.7% (5.8)* | 58.8% | 63.9% | 9.6% | 1.8% | 0.0%  | 94.6% | 0.01 | 12.1 (0.2)* | 9.0 | 1.10 (0.00)* | 0.02 (0.01)* | 0.2% | 73.3% | 75.1% | 1.16 | 0 |
| 4 | all | 2 | 1 | 78.3% (2.3)* | 91.1% (1.1)* | 28.6% (2.7)* | 14.5% | 18.8% | 0.0% | 10.6% | 0.0%  | 86.6% | 0.01 | 19.0 (0.4)* | 14.3 | 1.17 (0.01)* | 0.18 (0.03)* | 1.5% | 85.4% | 84.0% | 1.33 | 0 |
| 4 | spread | 1 | 0 | 40.3% (2.0)* | 64.9% (1.9)* | 7.0% (0.6)  | 26.6% | 45.2% | 1.2% | 38.5% | 0.1%* | 61.8% | 0.01 | 25.1 (0.8)* | 19.6 | 1.33 (0.02)  | 0.94 (0.08)* | 6.3% | 86.2% | 81.7% | 2.19 | 2 |
| 4 | spread | 1 | 1 | 7.7% (0.7)* | 18.2% (1.5)* | 1.1% (0.1)* | 1.9% | 4.8% | 0.0% | 83.2% | 0.0%* | 17.1% | 0.00 | 43.0 (0.5)* | 34.2 | 1.70 (0.02)  | 5.46 (0.38)  | 25.4% | 95.9% | 91.4% | 1.96 | 2 |
| 4 | spread | 2 | 0 | 48.6% (2.1)* | 72.1% (1.7)* | 9.7% (0.8)  | 31.6% | 49.6% | 1.4% | 31.7% | 0.1%* | 69.0% | 0.01 | 22.3 (0.7)* | 17.5 | 1.26 (0.02)  | 0.65 (0.06)* | 5.0% | 84.1% | 78.9% | 2.26 | 2 |
| 4 | spread | 2 | 1 | 14.6% (1.0)  | 30.8% (1.8)  | 2.3% (0.2)* | 3.0% | 7.2% | 0.0% | 71.2% | 0.1%* | 29.4% | 0.00 | 38.9 (0.6)  | 30.8 | 1.58 (0.02)  | 3.19 (0.22)* | 17.7% | 94.6% | 88.6% | 1.96 | 4 |
| 5 | attackers | 1 | 0 | 39.9% (1.9)* | 64.2% (1.9)* | 6.5% (0.5)  | 22.0% | 38.0% | 0.7% | 40.3% | 0.1%* | 61.1% | 0.01 | 26.7 (0.7)* | 20.9 | 1.28 (0.02)  | 0.93 (0.08)* | 6.7% | 87.8% | 81.6% | 2.20 | 2 |
| 5 | attackers | 1 | 1 | 7.7% (0.7)* | 17.7% (1.5)* | 1.0% (0.1)* | 0.8% | 2.2% | 0.0% | 84.4% | 0.0%* | 16.4% | 0.00 | 43.6 (0.5)* | 34.7 | 1.62 (0.02)  | 5.82 (0.40)  | 26.1% | 96.0% | 92.1% | 1.99 | 2 |
| 5 | attackers | 2 | 0 | 85.3% (2.2)* | 94.4% (0.9)* | 38.2% (4.2)* | 44.2% | 52.5% | 2.1% | 6.5% | 0.0%  | 90.1% | 0.01 | 15.0 (0.4)* | 11.3 | 1.13 (0.01)* | 0.12 (0.02)* | 0.8% | 78.3% | 79.5% | 1.24 | 0 |
| 5 | attackers | 2 | 1 | 47.4% (2.3)* | 71.1% (1.9)* | 9.0% (0.7)  | 4.3% | 7.2% | 0.0% | 31.1% | 0.0%* | 66.9% | 0.01 | 26.3 (0.7)* | 20.3 | 1.27 (0.01)  | 0.74 (0.07)* | 4.7% | 90.2% | 88.4% | 1.51 | 2 |
| 5 | all | 1 | 0 | 44.5% (2.0)* | 68.7% (1.7)* | 7.3% (0.6)  | 24.1% | 40.3% | 0.5% | 36.8% | 0.1%* | 65.0% | 0.01 | 25.4 (0.7)* | 19.8 | 1.25 (0.02)  | 0.75 (0.06)* | 5.9% | 86.7% | 78.8% | 2.31 | 2 |
| 5 | all | 1 | 1 | 14.0% (1.0)  | 29.8% (1.7)~ | 2.1% (0.2)* | 1.3% | 3.3% | 0.0% | 73.7% | 0.1%* | 27.5% | 0.00 | 40.1 (0.6)~ | 31.8 | 1.52 (0.02)  | 3.45 (0.24)* | 18.5% | 95.2% | 89.4% | 2.04 | 4 |
| 5 | all | 2 | 0 | 96.1% (1.2)* | 98.7% (0.4)* | 71.3% (6.1)* | 48.8% | 54.1% | 4.4% | 1.9% | 0.0%* | 94.5% | 0.01 | 13.6 (0.2)* | 10.1 | 1.11 (0.00)* | 0.02 (0.01)* | 0.2% | 76.8% | 74.0% | 1.13 | 0 |
| 5 | all | 2 | 1 | 67.4% (2.4)* | 85.1% (1.4)* | 19.3% (1.7)* | 6.1% | 8.6% | 0.0% | 16.6% | 0.0%* | 80.6% | 0.01 | 21.6 (0.5)* | 16.4 | 1.17 (0.01)* | 0.30 (0.04)* | 2.3% | 87.8% | 85.5% | 1.39 | 0 |
| 5 | spread | 1 | 0 | 26.9% (1.6)* | 49.7% (2.0)* | 3.9% (0.3)* | 15.2% | 29.9% | 0.4% | 53.7% | 0.1%* | 47.0% | 0.01 | 31.7 (0.8)  | 25.0 | 1.38 (0.02)  | 1.70 (0.13)* | 10.3% | 90.6% | 83.8% | 2.15 | 2 |
| 5 | spread | 1 | 1 | 2.8% (0.4)* | 7.2% (1.1)* | 0.4% (0.1)* | 0.5% | 1.4% | 0.0% | 93.5% | 0.0%  | 6.6% | 0.00 | 46.8 (0.4)* | 37.2 | 1.73 (0.01)  | 10.63 (0.70)* | 37.2% | 96.9% | 94.0% | 1.92 | 1 |
| 5 | spread | 2 | 0 | 38.5% (2.0)* | 62.9% (1.9)* | 6.4% (0.5)  | 20.6% | 36.0% | 0.6% | 40.4% | 0.0%* | 59.9% | 0.01 | 26.9 (0.7)* | 21.1 | 1.29 (0.02)  | 1.01 (0.08)* | 6.7% | 88.1% | 82.8% | 2.04 | 2 |
| 5 | spread | 2 | 1 | 8.6% (0.8)* | 19.8% (1.6)* | 1.2% (0.1)* | 0.9% | 2.3% | 0.0% | 81.5% | 0.0%* | 18.7% | 0.00 | 42.8 (0.6)* | 33.9 | 1.59 (0.02)  | 5.42 (0.40)  | 24.6% | 96.0% | 92.2% | 1.88 | 2 |

The shipped cell is T4 / attackers / STRIKE 1 / RESPITE 1 (BALANCE as it stands in engine.js).
  FRESH   pre boss checks 85.4%, boss checks 61.9%, all checks 76.3%, 12.66 pre boss checks a quest.
  ACCOUNT pre boss checks 94.9%, boss checks 88.1%, all checks 93.1%, career sample 5474, still running at the end 1197.
Accounts that ran out of deployable bodies (R8.0 THE STRAY should make this 0): 0.
Boss fights stopped at the 60 round cap: 733 of 594,000 quests (0.12%), of which 570 were DEADLOCKS:
no living character could pass any unbroken Aspect (probability 0) and at least one could not be
killed by a Strike (strikeLess >= STRIKE: R4.9 Vanguard, or the 3 point Chest affix). Those fights
never end. The engine has no cap, so in the shipped game that is a boss screen the player cannot leave.
```

---

## 7. The chosen defaults, measured against every target

```
BALANCE.BASE_TOUGHNESS = 4
BALANCE.STRIKE_TARGET  = 'attackers'
BALANCE.STRIKE         = [1, 1, 2, 3, 3]
BALANCE.RESPITE        = [1, 1, 0, 0, 0]
```

All four are where R7.4 and R5.7 already put them. What moved is `ASPECT_HP_BONUS` to `[1, 1, 2, 3, 3]` and
`RENOWN` to `{gate 2, open 2, toll 3, chain 5, relay 5, vault 6, boss 9, firstBoss 6}` (section 5.3).

**Why these four and not another cell.** Three of the 36 cells score four of the six targets after the two
row changes, and they read within a standard error of each other: T4/attackers/1/1 (this one), T4/spread/2/1
and T5/all/1/1. `attackers` is the tie breaker: R7.4 makes it the law and refuses the other two by name
(`all` wipes a fresh party whenever two Aspects survive round one, and `spread` makes a Vanguard immune to the
boss), and R7.4 adds that the prototype's grid may move `BALANCE.STRIKE` only. `spread` was also measured to be
mechanically different from what R7.4 describes until this pass fixed it (finding m4), so a cell chosen on its
old behaviour would have been chosen on a bug. Between the T4 and T5 rows, T4 is what R7.4 keeps deliberately
("it leaves base Toughness at 4 so the Scar treadmill still works").

### The measurement, ACCOUNT experiment, quests 1 to 25 at Depth I

500 accounts x 25 quests = 12,500 quests, cluster robust standard errors over the account, from the `--grid`
run in section 6. The 1,000 account confirmation run of the same cell is in the last column.

| target (in the brief's priority order) | spec | measured | SE | verdict | 1,000 accounts |
|---|---|---|---|---|---|
| 1. death per character | 12 to 15% | **14.4%** | 1.0 | **HIT** | 14.8% (SE 0.7) |
| 2. at least one death | about 35% (30 to 40) | **30.6%** | 1.8 | **HIT**, at the low edge | 31.1% |
| 3. full wipe | about 8% (6 to 10) | **2.0%** | 0.2 | **MISS**, and unreachable: see 5.2 | 2.1% |
| 4. career | 4 to 7 quests | **3.27** | 0.22 | **MISS**, and unreachable: see 5.2 | 3.16 |
| 5. Renown a run (reward + salvage) | about 35 (30 to 40) | **39.6** | 0.6 | **HIT** | 39.3 |
| 6. Marrow a run | about 1.5 (1.2 to 1.8) | **1.61** | 0.02 | **HIT** | 1.60 |

Four of six. The two misses are the two the arithmetic in 5.2 shows cannot be reached while the first two are:
a wipe rate of 8 percent needs 17 percent death per character, and a career of 4 needs under 9 percent.

Everything else the same run measured, for the record: 73.1 percent of quests won, 94.9 percent of pre boss
checks passed (the spec's own basis for 8.6 is "about 70 percent", so a geared roster is well over it, see
section 9), 88.1 percent of boss checks, 2.09 boss rounds, 31.4 Renown of reward and 8.2 of salvage,
**28.5 percent of quests deployed fewer than three bodies**, 17.9 percent of careers were still running when
the account stopped at quest 25 (so the career mean reads low), and 0 accounts ever ran out of bodies, which
is R8.0 THE STRAY doing its job.

### The same cell in the FRESH experiment, and a RULES claim that does not reproduce

4,000 quests of three freshly rolled tier one characters with no gear.

| | death per character | at least one death | wipe |
|---|---|---|---|
| PRE BOSS (the half R7.4 says spec 8.6 describes) | **6.6%** (SE 0.2) | **17.0%** (SE 0.6) | **0.3%** (SE 0.1) |
| whole quest | 50.3% | 66.3% | 32.9% |
| spec 8.6 | 12 to 15% | about 35% | about 8% |

85.4 percent of pre boss checks passed, 61.9 percent of boss checks, 3.93 boss rounds, 34.5 Renown a run.

**R7.4's central claim does not reproduce.** R7.4 states that "the PRE BOSS stages alone measure 13.45 percent,
31.50 percent and 1.47 percent ... which is section 8.6 almost to the decimal", and that is the whole basis for
the ruling that 8.6 describes the pre boss game. Measured through this engine and this policy the pre boss half
reads **6.6 / 17.0 / 0.3** at the shipped cell and **33.1 / 51.0 / 1.5** at the same cell with RESPITE 0. There
is no cell of the 36 that reads 13.45 / 31.50 / 1.47; the number sits between the RESPITE 1 and RESPITE 0 rows
of an integer axis. Finding M12 asked for exactly this to become checkable, and now that it is, it does not
check out. Either the figure was measured under a RESPITE the row does not carry, or under the policy before
this pass fixed the five things in section 3 and section 4 that change how a party is assigned. It is written
here rather than quietly dropped, because R7.4 leans its whole reading of spec 8.6 on it.

What the whole quest FRESH row says instead is worth reading on its own: **an account's very first quest kills
half its characters and wipes a third of its parties**, and then, ten quests later, an account passes 94.9
percent of its pre boss checks and wins 73 percent of its runs. That gap, not the pre boss split, is the shape
of this game as measured.

---

## 8. `--depths`, R7.4's winnability law: RED, and it is a verdict

`node sim.mjs --depths --quests=200 --accounts=20`. This gate is new in this pass (finding B3). It fails.
The failure is not a defect in the code it guards; it is the answer to Director call 1, measured.

```
MARROWDEEP winnability, R7.4: the win rate at each of Depths II to V must be between 25 and 75 percent.
  200 quests a Depth over 20 accounts, two rosters a Depth.
  FRESH is R7.4's own experiment, the one whose 0 wins in 200 at Depth IV and V wrote R7.0: three
  freshly rolled tier one characters, rested, dropped straight into that Depth. The LAW binds here.
  WARMED is the same Depth played by an account that walked the R8.4 unlock ladder to it (3 wins at
  I, 7 more at II, 15 more at III, 25 more at IV) and kept everything it found. Reported, not asserted:
  nothing in the spec or RULES rules on what a progressed roster should measure, and it is the number
  a real player lives in.
  R7.0 ships the DORMANT fourth Aspect at Depth IV and V, so three bodies always face three Aspects.
  Banks: plans/marrowdeep/data (authored). STRIKE [1,1,2,3,3], RESPITE [1,1,0,0,0], BASE_TOUGHNESS 4, ASPECT_HP_BONUS [1,1,2,3,3], target attackers.

  Depth                 FRESH wins  death/char   wipe  |  WARMED wins  death/char   wipe   unreached
  1 Verge               51.5%       35.0%   7.8%  |        65.0%       22.8%   6.1%           0   (not banded)
  2 Hollows             69.0%       20.5%   5.6%  |       100.0%        0.5%   0.0%           0
  3 Undertow             5.0%       90.5%  69.0%  |       100.0%        0.2%   0.0%           0   LAW BROKEN
  4 The Silt             0.5%       99.8%  99.4%  |        79.0%       30.6%  21.0%           0   LAW BROKEN
  5 Marrowdeep           0.0%      100.0% 100.0%  |        95.5%        9.5%   4.5%           0   LAW BROKEN

DEPTHS FAILED, R7.4: Undertow (Depth 3): 5.0% wins fresh; The Silt (Depth 4): 0.5% wins fresh; Marrowdeep (Depth 5): 0.0% wins fresh.
R7.4 names the ladder: ruling (a) the dormant fourth Aspect ships; if a Depth still does not clear
25 percent, ship ruling (b) as well (an Aspect nobody faced strikes ONE character, the most
strained, party order breaking ties); if neither clears it the Aspect hit points at IV and V are
the lever, which is Director call 1.
```

### What that measurement says

**R7.0's dormant fourth Aspect works, and it is not enough.** Before it, the audit measured 0 wins in 200 at
Depth IV and V with 600 of 600 characters dead. With it, a WARMED roster wins 79 percent at Depth IV and 95.5
at Depth V, so the Depth is a fight again. A FRESH roster still wins 0.5 and 0.0 percent.

**Two readings of "a rested roster", and the law fails both, in opposite directions.**

- On the FRESH reading, which is R7.4's own cited experiment, Depths III, IV and V are unwinnable.
- On the WARMED reading, which is the roster a player actually arrives at that Depth with, Depths II, III and
  V are a formality (100, 100 and 95.5 percent) and Depth IV is 79. Every one of them is over the 75 ceiling.

**Neither of R7.4's remaining rulings closes the FRESH gap, and the measurement says why.** Ruling (b), an
unfaced Aspect striking one character rather than all, cannot help Depth III, because Depth III has no fourth
Aspect at all and still measures 5.0 percent. Depth III's binding constraint is R9.1's `RESPITE 0`: a diagnostic
run with Respite restored at every Depth (`--over=RESPITE=[1,1,1,1,1]`) takes Depth III from 5.0 to 25.0
percent, and leaves **Depth IV at 1.0 and Depth V at 0.0**. At IV and V the binding constraint is arithmetic
that no Strike distribution changes: `STRIKE` is 3 and `BASE_TOUGHNESS` is 4, so an unarmoured character is at
3 after one round and dead in the second, whoever the Strike is aimed at.

**So the two levers that decide Depth IV and V are the two R7.4 names as Director call 1: the Strike of 3, and
the Aspect hit points.** The prototype did not move either, because R7.4 reserves both, and because moving them
to rescue a fresh roster would make the Depth trivial for the geared roster that actually gets there, which is
the other half of the same measurement.

**The finding under all of it, which no rule has ruled on:** gear compounds faster than the Depths harden. The
same roster that dies in 100 percent of fresh Depth V runs wins 95.5 percent of them once it has walked the
unlock ladder, and an ACCOUNT passes 94.9 percent of its pre boss checks against the spec's own stated basis of
"about 70 percent". The difficulty curve inverts somewhere around quest ten. That is a design question the way
Director call 1 is a design question, and this report is where it gets written down rather than solved.

---

## 9. Every RULES line the code could not honour as written

Each of these is a line of RULES that the prototype does not implement exactly as the sentence reads. None is
a silent omission: each is here.

1. **R6.11: "The generator refuses to roll [the half die floor] onto a d4 or d6 stat, the way R6.3 refuses a
   step onto a d12."** Unimplementable as written, and R6.3 is the reason: "a drop is rolled before it is
   offered and later moves between characters, so a d12 stat has no referent at roll time". At generation there
   is no wearer, so there is no stat size to refuse. What the engine does instead is R6.3's own remedy: the line
   is greyed at EQUIP and `deadLines` reports it. If the refusal is meant to bite, it has to bite at equip, and
   that is a different rule from the one written.
2. **R6.2: "Legal maxima are then Ward 10, Feet 9, Chest 9, every other slot already over 10."** Not true of
   Head once R13.11 is enforced (section 4, item 1). Head's real ceiling is four floor lines plus the
   `floorPlus`, which after R6.11's repricing is 4 x 2 + 1 = **9**, not "over 10". A Depth V Relic Head reaches
   its budget of 10 through R6.2 (a)'s one point filler, and **0.6 percent of Depth V Relic Head rolls still
   fall back to R6.2 (c)** and wear the Rare label their budget bought. That is the rule working, but the
   sentence that says Head is comfortable is wrong.
3. **R7.4: "`sim.js --depths` asserts winnability as a LAW at every Depth: over 200 quests with the policy from
   a rested roster, the win rate at each of II to V is between 25 and 75 percent."** Built, and RED under both
   readings of "a rested roster" (section 8). No BALANCE change inside this pass's remit satisfies it, and the
   two levers that would are the two R7.4 itself reserves for Director call 1.
4. **R5.9's printed Renown row and R7.1's printed Aspect hit point baseline now differ from BALANCE.** R5.9
   prints "Gate 3, Open 2, Toll 4, Chain 6, Relay 6, Vault 8; the boss 12 (a Depth II first boss 8)" and R7.1
   prints "authored at Depth I, +1 at Depth III, +2 at IV and V". The tuning pass moved both rows (section 5.3)
   under R0's own licence ("the prototype sim chose their defaults ... PROTO-REPORT.md ... carries whatever it
   measured"). **Either R5.9 and R7.1 gain a line pointing here, or BALANCE goes back and a run pays 53.5
   Renown and kills 8.8 percent of characters.** RULES was not edited for this, because the numbers it prints
   are the Director's to move; this paragraph is the flag.
5. **R5.6: "Every slot must be filled."** The engine permits every slot to be FORFEIT when the living bodies
   are fewer than the slot positions, because its check is `living.length >= need` for the whole stage rather
   than per slot. The policy now fills what it can (section 4, item 3) so the case does not arise in any
   measurement here, but a caller could still hand `assign()` a plan where a lone survivor takes nothing.
6. **R13.8's "Cannot pay" chip, R1.7's greyed fourth flat point, R1.9's greyed composed cap line, R6.9's
   "Fixed" REFORGE label and R13.16's "+1, no effect"** are all computed and exported (`canPayToll`,
   `greyedFlat`, `fixed`, the pre roll strip's numbers) and none of them is SHOWN, because R11's screens are
   not in the prototype. They are engine facts waiting for a VIEW.
7. **R5.8 / R9.2 hidden TNs leak into one conditional.** `cond` with `when: 'tn6plus'` (the 2 point Token
   affix) is resolved against the TRUE target number, which the resolver has to do, but it means a hidden Gate
   can pay that Token without the player being able to know it will, and the policy's estimator sees the same
   flat when it scores. Measured cost at Depth I: under a tenth of a point of pass probability. It is written
   down because it is the one place the blindfold is not honest.
8. **R7.4's "the PRE BOSS stages alone measure 13.45 percent, 31.50 percent and 1.47 percent"** does not
   reproduce anywhere in the 36 cell grid (section 7). It is the sentence that carries R7.4's whole ruling on
   what spec 8.6 describes, and it is now measurable and wrong, or at least measured under conditions the
   BALANCE rows no longer name.
9. **R2.5's own claim that a Scar every second quest gives "the mean career near five and a half"** does not
   survive contact with a player who retires at Toughness 1, which R2.6 prices them to do (retirement pays
   2 + Traits, a death pays 1). The wall at eight quests is only reached by a character who is run at Toughness
   1 and 0. Measured career at the chosen cell: 3.27. See section 5.2 for the arithmetic.

---

## 10. What this pass did not do

- **It did not commit anything.** No `git add`, no commit, no push.
- **It did not implement R7.4's ruling (b)** (an unfaced Aspect striking one character). Section 8 measures
  why it cannot close the gap it exists to close, and R7.4 makes it conditional on that measurement.
- **It did not raise the `--grid` account count to the 6,600 that a half point standard error on wipe needs.**
  On two cores that is a forty minute default. The default is 500 accounts, about 1.0 points of SE on death per
  character, and every scored number now prints its own SE so nobody has to guess.
- **It did not touch the master table**, `data/`, or any TN outside 3 to 7.
- **It edited exactly one line of RULES.md**: R1.9's caps list, whose parenthetical "(plus `floorPlus`, R1.3)"
  was the stale half of the ruling R1.3 overturns two sections earlier, and was the sentence the engine was
  actually following.
