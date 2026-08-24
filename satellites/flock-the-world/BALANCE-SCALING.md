<!-- Written by the design team workflow 2026-08-24, edited against live code, and
     patched by the main session: the econ door moved from NET to GROSS mid
     review (net is what the anti surplus machinery compresses; Too Big To Ban
     is about scale), so every econ door reference here reads gross $24M a day
     (econGross 240*MONEY) held econDays 130. Line anchors drift; the quoted
     identifiers are the source of truth. -->

# BALANCE-SCALING.md
## Flock the World: the scaling laws, every curve, every dial

Code analysis of `satellites/flock-the-world/index.html` as of 2026-08-24. Every formula below is quoted from the live file with a line anchor. Anchors were re-pinned while the paths-to-victory tuning pass was landing, so if one has drifted a few lines, grep the quoted identifier; the formulas are the source of truth. One tick is one sim day. Read this before touching any number in `CFG`.

### The units

* `MONEY = 1e5` (line 825). Applied at every **definition site**, never as a blanket multiply over the running economy, because a blanket multiply preserves exactly the ratios you were trying to change. Start bank $20M, peak net ~$14M a day, lifetime in the tens of billions.
* `PEOPLE = 1e6` (line 2711). Region `pop` is in millions.
* All tuning lives in `CFG` (lines 835 to 951). Difficulty in `DIFFS` (953), mode modifiers in `MODES` (959), region table in `REGIONS` (972).

### The measured baseline (scripts/ftw_surplus.js, deterministic meter)

The balanced glove bot in check.js wins 5 of 5 runs at `winAt 0.95` around day 1030. Peak net ~$14M a day. Start $20M. Last market entered ~day 1000. Entry doors cost ~100% of lifetime income. End bank ~6 days of income. Any change to a curve below should be re-measured against these five numbers, not eyeballed.

---

## 1. Income

**Line 1821, inside `tick()`:**

```
income += MONEY * R[id].gdp * r.coverage * CFG.incomeK * (1+f.inc) * D.cash * cInc
          * (1 - Math.min(0.15, r.resist/100*0.15))
```

* **Shape:** linear in coverage, linear in gdp, then a stack of multipliers.
* `incomeK = 0.020` (line 841), the base rate per gdp point per coverage point per day.
* `f.inc` is the summed `inc` effect of owned skill nodes and combos (`recompute`, line 1387). The skill tree can multiply income roughly 2.6x through `(1+f.inc)*D.cash*cInc`. This is the reason upkeep had to become superlinear, see section 2.
* `D.cash` is difficulty: 1.25 / 1.0 / 0.85 (line 953).
* `cInc` is the civilian plate-swap countermeasure, a 0.93 multiplier (CM `plateswap`, in the CM bank at 1233).
* The resistance tax is **clamped at 15%**. Organized civilians dent revenue but can never zero it.

**gdp** (lines 2356 to 2367): `r.gdp = pop * wealth * (0.55 + 0.45*urban)`, then **renormalised so sum(gdp) equals the old sum(pop*wealth)**. The urban term moves the distribution between regions and deliberately does not move the size of the world economy. If you touch the gdp formula, keep the normalisation, or you have made a silent global balance change.

Interacts with: entry pricing (same gdp weight prices the door, section 3), upkeep (same `gdp*coverage` product is the infra base), evScale, bubble value, aPrice (all priced off `net`).

## 2. Upkeep

**Lines 1822, 1867, 1868:**

```
infra  += R[id].gdp * r.coverage                      // summed per active region
dcCost  = MONEY * infra * CFG.upkeepK * CFG.dcUpkeep * (s.dcs||0)
upkeep  = MONEY * infra * CFG.upkeepK * (1 + s.avgMil*0.8) * (1 + infra/CFG.upkeepCurve) + dcCost
```

* **Shape: quadratic in the network.** The `(1 + infra/upkeepCurve)` term makes upkeep grow with the square of `infra` while income stays linear. `upkeepCurve = 3500` (line 879); infra at total world coverage is about 5862, so the multiplier tops out around 2.67x.
* `upkeepK = 0.0085` versus `incomeK 0.020` gross (line 864). Margin per infra point starts at roughly 57% and gets squeezed as the network grows and militarizes.
* `avgMil` is the pop-weighted world militarization: your own crackdowns and war nodes make the network up to 1.8x dearer to run.
* `dcUpkeep = 0.34`: each data centre adds 34% of BASE upkeep, forever, capped at `dcMax = 4` sites. This is deliberately the only purchase that never stops charging (comment at 1865). Uncapped, the bot bought twelve and drove its own net to minus $2M a day.

**Net and bankruptcy** (lines 1869 to 1874): `s.cash += income - upkeep`; `s.net` is an exponential moving average, `net = net*0.9 + (income-upkeep)*0.1`, roughly a 10 day memory. Cash floors at 0 with a flavor line, there is no death spiral from debt. Everything priced "in days of net" reads this smoothed number, so a one day spike cannot whipsaw every price in the game.

**Why the quadratic exists** (comment block, lines 865 to 878): income and upkeep used to both be linear in `pop*coverage*wealth`, so margin was a constant, and the skill tree then multiplied income ~2.6x while upkeep got nothing. Margin could only widen and the last third of every run was a fountain, measured at 660 banked days of income. With the quadratic, the winning bot ends holding ~6 days of income.

## 3. Market entry

**`entryCost`, lines 3134 to 3154:**

```
base = MONEY * Math.round(40 + g*CFG.entryGdp + x.liberty*260)     // g = region gdp
n    = S.activeCount
mult = 1 + n*CFG.entryScale + n*n*CFG.entryQuad
cost = round(base*mult/5)*5
re-entering a lost region: times max(1.6, 3 - gwEntry*min(gw, gwCap))
```

* **Shape: linear in gdp and liberty for the base, quadratic in markets already held for the multiplier.**
* `entryGdp = 0.42`: the door is priced off the SAME weight that pays you, so the whale and the expensive door are the same place and which markets you take is a plan, not a formality.
* `liberty*260`: a free country costs more to buy into whatever it is worth.
* `entryScale = 0.55` linear, `entryQuad = 0.09` squared. The quad term was swept and measured (comment at 943): at 0 the last market opens day 690 and doors cost 39% of lifetime income; at 0.20 it is day 1194 and 86%, which makes the run one dimensional. At 0.09 the meter reads last door ~day 1000 and ~100% of lifetime income on the winning bot (the in-file comment records an earlier sweep read of day 924 and 65%): expansion is the spine of the campaign without being the only thing in it.
* **Re-entry and goodwill:** a lost region costs 3x with no goodwill banked, and every concession you made there before losing it (`gw`, cap `gwCap 4`) cuts the surcharge by `gwEntry 0.35`, flooring at 1.6x. Retreat with listening tours is cheaper to reverse than retreat without them.
* Entering (handler at 3658): seeds `coverage 0.005`, re-entering a lost region also decrements `lostCount` and sets unrest to 45.

Interacts with: free spread (section 12) which opens markets without paying the door, and acquisitions, which explicitly **cannot** open a market for you.

## 4. The desk

**`OPS` pool at 1559, `opPrice` at 1632, `deskOffers` at 1639, `doOp` at 1647.**

```
opPrice = Math.max(30*MONEY, Math.round(cash * CFG.opPct * o.band * step /5)*5)
step    = (o.id==='dc') ? 1 + dcs*0.6 : 1
```

* **Shape: percentage of treasury.** `opPct = 0.09`, times a per-op `band` from 1.0 (Retain the Firm) to 2.6 (data centre). A second data centre costs 60% more than the first, and so on.
* Three offers at a time, drawn deterministically from `floor(day/deskDays)*7919 + deskRoll*104729` through an LCG, so a repaint cannot reroll the shop under the player's thumb. `deskDays = 24`; buying bumps `deskRoll`, so the desk turns over on a clock and on every purchase.
* Effects are deliberately different **shapes**, not different prices: oversight relief (Standards seat minus 9, consent decree minus 22 plus a permanent monitor), region movers (Fund the Challenger, satellite lease with its own `0.04*(1-coverage)` diminishing gain), the permanent dcUpkeep bill, and the insurance policy (`s.cover`) that pays `max(150*MONEY, net*coverPayoutDays 45)` when a market is lost (line 1812).
* The consent decree monitor drains oversight passively: `monitorRelief 0.012` per tick per monitor, capped at 3 monitors (line 1864). This was once written and read by nothing; it is wired now, do not un-wire it.

## 5. Acquisitions, the always open sink

**`acqPrice` at 1659, `doAcquire` at 1663, heat decay at 1859.**

```
acqPrice = Math.max(60*MONEY, Math.round(cash * (CFG.acqPct + acqHeat) /5)*5)
```

* **Shape: percentage of treasury plus a ratchet.** `acqPct = 0.14` base. Each buy adds `acqHeatAdd 0.05` to the rate, heat caps at `acqHeatMax 0.55` (so the ceiling price is 69% of treasury per buy) and bleeds off at `acqHeatDecay 0.004` per day. A rich player converts money into coverage and the conversion gets worse the harder they lean on it.
* What the money buys: every active region gets `coverage += acqGain 0.055 * (1-coverage)`, a **diminishing** add that can never overshoot 1. It cannot open a market.
* The scrutiny: `+acqSus 0.55` suspicion in every active region and `+acqOvr 0.2` oversight per buy. At the old 1.5/0.6 this killed the bot every run around day 800; the scrutiny has to be felt, not fatal (comment at 936).
* No cooldown and no precondition, on purpose. This is THE lesson of the surplus work: a bot holding 112,000 across 1,100 days spent between $0 and $20,825 on cooldown-gated region actions. The sink was throttled, not priced.
* Interacts with: the `acqsuit` event (fires only when heat > 0.15, settling cools heat 0.12) and the Poach desk op (refunds one heat step).

## 6. Region actions

**`aPrice` at 1539, `doAction` at 3156.**

```
aPrice(base,days) = max( base,
                         round(net*days/5)*5,
                         round(cash * CFG.pctOfTreasury /5)*5 )
```

* **Shape: max of a flat floor, a flow price, and a stock price.** `pctOfTreasury = 0.06`. The third term is the load-bearing one: a fraction of what you are sitting on, so a treasury decays geometrically the moment you start using it. You can hold a pile or you can act; you cannot do both.
* Agitate: base 80·MONEY / 4 days, cooldown 20. Unmask risk when `resist > 40`: chance `(resist-35)/130`, and getting caught costs oversight +4, resist +8, grudge +10.
* Crackdown: base 120·MONEY / 6 days, cooldown 25, needs unrest ≥ 30. Backfire risk `crackBackfire 0.12` (halved under Iron Fist) `+ copwatch 0.15 + media*resist/100*0.20`. Success: unrest minus 30, but suspicion +6, milit +0.08, grudge +8, resist +3. **Violence radicalizes permanently**; grudge only decays through concessions. Every crackdown also stamps `lastCrack` (line 3181), which resets the Grateful World peace clock (section 15).
* Blackout: base 100·MONEY / 5 days. Cut `= 10*(1.4 - media*0.8)*cBlack` (samizdat countermeasure sets cBlack to 0.4). Then `black = blackoutDays 14` during which positive suspicion gain runs at 0.45x; re-use gated by `blackoutCd 16`. Free press both shrinks the cut and adds 0.8 oversight.
* Concede: free, and the only lever that pays down grudge (minus 8) and resist (minus 6), plus unrest minus 15 and suspicion minus 8, at the cost of control (minus 0.05) and a small compliance dip (minus 0.02). Each concession also banks 1 goodwill in that region (cap `gwCap 4`): goodwill regrows compliance at `gwCmp 0.0004` per point per tick and cuts the re-entry surcharge if you ever lose the region (section 3). The winning bot concedes; that is not an accident.

## 7. Events

**`EV()` at 1261, `maybeEvent` at 1958, `evScale` at 1686.**

* **Clock:** every 9th day, 50% odds, one event, weighted by `w` over the eligible pool.
* **Cooldowns:** per event `cd`, defaulting to 150 days for choices and 75 for flashes. Without this the records request became a subscription (comment at 1962).
* **Repeat fatigue (2026-08-24, from Stephen's winning run):** each firing counts in `s.evN` (saved). A non-chain event's effective cooldown is `cd * (1 + n*0.5)`, and it retires for the run at `evRepCap 3` firings (flashes at 6). Story-chain beats are exempt: the arc stamp already makes a taken beat unrepeatable. This is why the mayor can no longer ask for free cameras fifteen times.
* **Wall-clock spacing:** `choiceGap 34` sim days compresses to under 6 real seconds at 3x speed, so `maybeEvent` also requires `choiceGapMs 45000` of real time between choice modals — but only when `tickTimer` is pacing a live session, so the headless bots and check.js loops run unthrottled.
* **Price scaling:** choice cash costs are multiplied by `evScale = clamp(net/(10*MONEY), 1, 25)`, linear in smoothed net, clamped at 25x, so "$300 to kill the ban" is a real decision on day 400 the way it was on day 40. ⛔ The `10*MONEY` divisor is unit-bearing: when the money rescale missed it, the clamp pinned at 25x from tick one and the entire priced half of the event system was silently disabled (comment at 1677). If MONEY ever changes again, this line changes with it.
* **Treasury term (2026-08-24, Law 1 applied):** a cash option now costs `max(base*evScale, cash*evPct)` with `evPct 0.05`. evScale alone is a flow price; Stephen finished a run paying the auditor $150M out of $3B "over and over because I don't care." Five percent of the pile bites a hoarder at any scale.
* Events that move coverage are followed by a `popTotals` recompute (lines 1902 to 1907) so the people ledger never reads one tick stale.

## 8. Bubbles

**`spawnBubble` at 1937, expiry at 1889, tap at 3329 (`collectAt`).**

* Spawn clock: first at day 6 plus rand 10, then every 5 plus rand 11 days, in a random active region.
* Kind roll: cash below 0.72, influence 0.72 to 0.90, leak above 0.90 (only once avgSus > 10).
* **Life is 16 ticks** and ticks are wall-clock speed dependent (`msPerTick [0,800,380,150]`), so the real window is 12.8s at 1x, 6.1s at 2x, 2.4s at 3x. That is the dial that makes 3x a fast-forward rather than the default way to play (comment at 849). Move it, do not rewrite it.
* Cash value: `(30 + rand*90 + pop*0.08) * cashScale`, where `cashScale = max(0.02*MONEY, net/48)`. Measured band 0.8 to 5.7 days of net, mean ~2.5: a tap is a treat, not a payroll (comment at 1944). The old `net/9` divisor paid a mean of 17 days per tap and dwarfed every deliberate decision on the board.
* Influence value: `1 + rand*3 + min(6, floor(subj*8))`.
* Leak: tapped pays +1 influence and minus 0.6 oversight; **missed** costs +1.6 oversight and +3 suspicion everywhere. Leaks are the one bubble with a downside, which is what makes the clock matter.

## 9. Influence and the skill trees

* **Influence income** (line 1875): `s.inf += 0.06 + s.subj*0.34 + f.cmp*0.05` per tick, plus +2 per coverage milestone per region at 25/50/75/97% (line 1828), plus bubbles, events and desk ops.
* **Node price** (`nodeCost`, 2935): `ceil( ceil(c * warDiscount?) * (1 + owned.size * nodeInflate 0.03) )`. Linear inflation with nodes owned: a hoarded pile of influence cannot buy the whole shop in one sitting. Base costs run 3 (SensorNet Core) to 60 (Perpetual Emergency).
* Node effects sum linearly in `recompute` (1387) into `f.dep/dth/vis/inc/sup/cmp/spr/dec/mil/fear/route/pac`, then combos add on top and doctrine adds last. Everything downstream reads `f`, so a new node is automatically priced into every curve in this document.

## 10. Coverage, depth, control, subjugation

**Growth (line 1722):**

```
growth = CFG.deployK * (1 + f.dep + CFG.dcGrow*dcs) * ease * friction
         * (0.30 + 0.95*compliance) * (1 - coverage) * pMul * cGrow
         * (1 - min(CFG.resistCap, resist/100*0.5))
```

* **Shape: logistic.** `deployK 0.00140` base, `(1-coverage)` saturates growth near full coverage. `ease = 0.45 + urban*0.85`; `friction = (1.18 - liberty*0.45) / modeRes` (Deep Partnership mode makes free societies resist 1.3x). Protest states throttle it: `pMul` 1 calm, 0.62 peaceful, 0.35 violent, **0 in uprising**. Civilian atlas/boycott multipliers (`cGrow`) and the organized cut, capped at `resistCap 0.45`, sit on top. The jam countermeasure adds a flat decay 0.0005 once coverage exceeds 0.05.
* **Depth and control (1727 to 1728):** `depth = min(1, max(0.05, depthBase 0.12 + f.dth - cDth - wmileDth) + milit*0.25)`; `control += (coverage*depth - control)*0.045`, an exponential approach with a ~22 day time constant. Control is what wins the game.
* **Subjugation** = pop-weighted control: `s.subj = Σ pop*control / WORLD_POP` (1878). `popCompliant` in the ledger is the same number in people, and must keep equalling it (comment at 2721).

## 11. Suspicion, resistance, compliance, unrest

**Suspicion (1732):**

```
norm    = control*compliance*0.045 * (1 - min(0.6, resist/100*0.7))
susGain = CFG.susK*(0.35+f.vis)*(coverage*0.7 + control*0.6)*(0.25 + liberty*1.2)*D.sus
          - f.sup*0.014*(0.4 + media*0.8) - 0.004 - norm
```

`susK 0.085`. Visibility (`f.vis`, mostly from the Watchlist tree) is the accelerant; suppression (`f.sup`, the Narrative tree) works best where the press is free; normalization means a controlled compliant region forgets, unless it is organized. Active blackout multiplies positive gain by 0.45.

**Resistance (1740):**

```
rGain = (sus*0.0060 + liberty*0.022 + media*0.013 + grudge*0.0016)
        * (1 - min(pacCap 0.6, f.pac)) * (1 - min(0.35, f.fear + warHeat*0.10)*0.9)
        - 0.004 - Math.pow(control, 2.2)*0.085
```

Grudge is the memory of your violence and never decays on its own. The `control^2.2` term means deep control eventually smothers organizing, which is the fist path's actual payoff. Countermeasures unlock against what you own: resist over each CM's threshold (18 to 40), 2.5% roll per tick (1749). World solidarity milestones fire at pop-weighted avgRes 18/30/45/60/75 (`worldMilestones`, 1983), and the 45 one takes 15% of your cash.

**Compliance (1758):** `pull = clamp(0.32 + f.cmp*0.5 + fear*0.9 - suspicion/160, .02, .98)`; approach rate 0.020 per tick. Fear is the strongest compliance lever in the game and also feeds unrest relief, which is the whole Crisis tree bargain.

**Unrest (1764):**

```
drive  = (sus*0.75 + (1-compliance)*45 + milit*30 + liberty*10 + resist*0.22
          + warHeat*12 + war*20 - fear*40 - control^1.8*42) / 100
unrest += ((drive*100 - unrest)*0.030 + (rand-0.5)*CFG.unrestNoise) * D.unrest * (M.unrest||1)
```

State thresholds (1770): 25 murmur, 45 peaceful, 68 violent only if already escalated (78 cold), 85 uprising, and uprising is sticky above 70. Uprising bleeds coverage 0.0045 and control 0.004 per tick; the region is **lost** when coverage drops below 0.02. `lostLimit 4` lost regions ends the run.

## 12. Free spread

Line 1832: when coverage > 0.12, each neighbour rolls `spreadK 0.00042 * (1+f.spr) * coverage * (1.25 - liberty*0.55)` per tick; with `f.route`, trade routes roll `routeK 0.00085 * f.route * coverage * (1.2 - liberty*0.5)`. Adopted regions open at coverage 0.004 without paying the entry door. This is the pressure valve on entry pricing: if you raise `entryQuad`, spread is what keeps the map from freezing.

## 13. Oversight (the loss clock)

Oversight is a 0 to 100 stock with many small flows:

* **Per-pstate drips** (1799 to 1806), per protesting region per tick, times `D.over`: peaceful **+0.011**, violent **+0.03**, uprising **+0.11**. One uprising region alone fills the bar in ~909 ticks at Vendor difficulty; three peaceful regions cost ~0.033 a day, about 30 points over a 900 day campaign.
* **Global gain** (1883): `(avgSus/100 * overK 0.55 + subj*0.022 + lostCount*0.02 + warHeat*0.05) * D.over * (M.over||1) - f.dec*0.042`. Note `subj*0.022`: **winning itself raises scrutiny**, so the endgame tightens even for a quiet player. `f.dec` (Narrative tree) is the only passive relief besides monitors.
* **Spikes:** events (+1 to +6), missed leaks (+1.6), acquisitions (+0.2), region-full milestones (+1), crackdowns (+0.8, +3 on backfire).
* **Relief valves:** desk ops (minus 4 to minus 22), consent decree monitors (0.012/tick each, cap 3), tapped leaks (minus 0.6), some event choices.
* **The floor (2026-08-24, from Stephen's winning run):** oversight cannot sit below `ovFloor = min(ovFloorMax 30, subj*ovFloorK 35)`, asserted at both clamps. The full Story tree's summed `dec` is ~5.4 (lobby .3, nda .4, capt 1.0, revo .9, legal 1.5, narr 1.3, plus combos), which is 0.23/day of relief against ~0.05/day of quiet-endgame gain: it did not neutralize the clock, it deleted it, and a run sat at a dead 0.0% patriotism through the whole endgame. The arms race stays: dec still smothers growth, but a giant hovers at its floor (21% at his 59% subjugation) where spikes and drips still land. Every winning bot ends at 40+, so the floor binds only the degenerate build. A one-time field note fires when the floor first binds.
* Clamped `ovFloor..100` **after** events run (1911), because event effects land after the earlier clamp and a run once finished above 100%; the same clamp means a consent decree cannot buy a giant below its floor.

## 14. Doctrine, difficulty, mode

* **Doctrine** (1391, chosen at subj 0.14, permanent): Velvet Glove `f.cmp +0.12, f.pac +0.10`; Iron Fist `f.dth +0.08, f.mil +0.02` and crack backfire halved. Glove wins through compliance and calm; fist wins through depth and smothered organizing, at the cost of hotter unrest and dearer upkeep (milit feeds the upkeep multiplier). The doctrine also gates its own win door (section 15): only glove can open The Grateful World, only fist can open Nothing Moves.
* **Difficulty** (953): Contractor over 0.72 / sus 0.85 / cash 1.25 / unrest 0.85; Vendor all 1.0; Incumbent over 1.42 / sus 1.18 / cash 0.85 / unrest 1.2. `D.over` multiplies **every** oversight flow including the drips, so Incumbent's clock runs 42% faster everywhere at once.
* **Modes** (959): Contractor $20M start; Deep Partnership $11M but two authoritarian regions preseeded, free societies resist 1.3x, oversight 0.85x; Crisis Engine $17M, war tree open and discounted 0.7x, oversight 1.22x, unrest 1.15x.

## 15. Win and loss (1920 to 1927)

Classic subjugation stays the ceiling; three more doors open below it, each demanding a different SHAPE of empire rather than a smaller one. Thresholds tuned against the deterministic meter; each has a bot that reaches it.

```
subj >= CFG.winAt (0.95)                                → win  (classic)
glove doctrine, subj >= 0.80, avgCmp >= 0.80,
  avgMil <= gloveMil 0.40, and no crackdown anywhere
  in the last gloveCalm 180 days                        → win  (The Grateful World)
fist doctrine, subj >= 0.85, avgMil >= fistMil 0.45     → win  (Nothing Moves)
all 14 markets active AND net >= econGross (80·MONEY,
  $8M/day) held econDays 130 UNBROKEN days              → win  (Too Big To Ban)
oversight >= 100                                        → loss (coalition)
lostCount >= 4                                          → loss (the great refusal)
```

* The glove door's `gloveMil 0.40` is the measured ceiling of the gentlest possible build (a bot that never cracks down still drifts to 0.32 to 0.40 from passive militarization); the ceiling alone did not hold the door, which is why `gloveCalm` exists: a crackdown bot crossed subj 0.80 under 0.40 milit and walked through 5 of 5 until the long-peace requirement landed. `lastCrack` is stamped by every crackdown (line 3181).
* The econ streak counts every tick the condition holds and resets the tick it does not, so it needs 130 unbroken days of a full portfolio over the bar. Holding all fourteen TODAY is the bar: lose a market, pay the surcharge, re-enter, and you qualify again. At the old $10M/150d the econ rush bot lost a photo finish to classic on all five seeds.

---

## DIALS

Safe ranges marked (swept) come from measured sweeps in the code comments; the rest are judgment bounded by the structure around them. After ANY move here, rerun check.js and the surplus meter and compare against the five baseline numbers at the top.

| Constant | Value | Turning it up does | Safe range |
|---|---|---|---|
| `incomeK` | 0.020 | Everything gets richer; every percentage price scales with it, but flow-priced floors and flat bases do not. Prefer `f.inc` nodes for shaped changes. | 0.015 to 0.028 |
| `upkeepK` | 0.0085 | Squeezes margin everywhere, early game hardest (the quad term is small early). | 0.006 to 0.011 |
| `upkeepCurve` | 3500 | LOWER is harsher: it is a divisor. 3500 gives ~2.67x at full world. Below ~2000 the endgame margin can go negative on Incumbent. | 2500 to 5000 |
| `pctOfTreasury` | 0.06 | Every region action gets dearer for the rich; too high and the poor early game cannot act (the flat floors protect it somewhat). | 0.04 to 0.10 |
| `opPct` | 0.09 | Desk ops dearer. Bands 1.0 to 2.6 multiply on top, so 0.09 already means up to 23% of treasury for a decree. | 0.06 to 0.12 |
| `acqPct` | 0.14 | Base acquisition rate. With max heat the ceiling is acqPct+0.55 of treasury. | 0.10 to 0.20 |
| `acqHeatAdd` / `acqHeatDecay` / `acqHeatMax` | 0.05 / 0.004 / 0.55 | Add up = spamming punished faster; decay up = forgiveness faster (12.5 days per buy currently); max caps the ceiling price. | add 0.03 to 0.08, decay 0.002 to 0.008 |
| `acqGain` | 0.055 | Coverage bought per acquisition (diminishing). Above ~0.09 buying replaces playing. | 0.04 to 0.08 |
| `acqSus` / `acqOvr` | 0.55 / 0.2 | The scrutiny per buy. ⛔ 1.5/0.6 killed every bot run by oversight around day 800. Felt, not fatal. | sus 0.3 to 0.9, ovr 0.1 to 0.35 |
| `entryGdp` | 0.42 | Doors track market value harder; rich markets become late-game goals. | 0.3 to 0.6 |
| `entryScale` | 0.55 | Linear door inflation per held market. | 0.4 to 0.7 |
| `entryQuad` | 0.09 | (swept) 0 → last door day 690 / 39% lifetime income; 0.20 → day 1194 / 86%, one dimensional. Live: ~day 1000 / ~100%. | 0.05 to 0.13 |
| `nodeInflate` | 0.03 | Hoarded influence buys less of the shop at once. | 0.02 to 0.05 |
| `evScale` divisor | `10*MONEY` | ⛔ Unit-bearing. Wrong units silently disable every priced event option (measured: pinned at 25x, options rendered permanently disabled). Change only with MONEY. | tied to MONEY |
| `bubbleLife` | 16 ticks | (Stephen-set) 12.8s / 6.1s / 2.4s real at 1x/2x/3x. Longer makes 3x a valid harvest mode again, which was the bug. | 12 to 20 |
| bubble `cashScale` divisor | 48 | Lower pays more per tap. Measured at 48: 0.8 to 5.7 days of net, mean ~2.5. At 9 it was mean 17 and dwarfed the whole board. | 36 to 64 |
| `deployK` | 0.00140 | Whole game faster; win day moves roughly inversely. Everything time-gated (events, heat decay, drips) rebalances implicitly. | 0.0011 to 0.0018 |
| `depthBase` | 0.12 | Free control depth before any Watchlist node; raises subj everywhere including preseeds. | 0.08 to 0.16 |
| `susK` | 0.085 | The world notices faster; feeds oversight through avgSus and resistance through sus. | 0.06 to 0.11 |
| `overK` | 0.55 | The suspicion→oversight coupling. The main knob on how long a loud run survives. | 0.4 to 0.75 |
| pstate drips | 0.011 / 0.03 / 0.11 | Per protesting region per tick times D.over. One uprising ≈ 909 ticks to fill the bar alone; these set how long you can ignore the streets. | keep the ~1:3:10 ratio |
| `winAt` | 0.95 | The last few points are the slowest (logistic coverage, sticky unrest). 0.97 adds real days, not polish days. | 0.93 to 0.97 |
| `gloveSubj` / `gloveCmp` / `gloveMil` / `gloveCalm` | 0.80 / 0.80 / 0.40 / 180 | The Grateful World door. gloveMil is the measured ceiling of the gentlest build (meter: 0.32 to 0.40 passive; crackdown bots run 0.47 and up); gloveCalm is what actually keeps crackdown bots out. Raise gloveCalm and the door demands a longer identity, not a bigger empire. | subj/cmp 0.75 to 0.85, mil 0.35 to 0.45, calm 120 to 240 |
| `fistSubj` / `fistMil` | 0.85 / 0.45 | Nothing Moves door. fistMil above every glove build's ceiling and below a committed crackdown empire's floor. | subj 0.80 to 0.90, mil 0.42 to 0.50 |
| `econGross` / `econDays` | 80·MONEY / 130 | Too Big To Ban door. (metered) At $10M/150d the econ bot lost a photo finish to classic on all five seeds; $8M/130d puts it ~60 days ahead of a subjugation racer. The quadratic upkeep keeps a passive full portfolio from qualifying. | net 60 to 100·MONEY, days 110 to 160 |
| `gwCap` / `gwCmp` / `gwEntry` | 4 / 0.0004 / 0.35 | Goodwill from conceding: compliance regrowth per banked point per tick, and the re-entry surcharge cut (3x floored at 1.6x at the cap). gwEntry up makes retreat-and-return a real strategy; too high and losing regions stops hurting. | cap 3 to 6, cmp 0.0002 to 0.0008, entry 0.2 to 0.35 |
| `lostLimit` | 4 | How many refusals end the run. 3 makes uprisings terrifying; 5 makes them a fine. | 3 to 5 |
| `dcUpkeep` / `dcMax` / `dcGrow` | 0.34 / 4 / 0.05 | The one permanent bill, its cap, and what it buys. ⛔ Uncapped, the bot bought 12 and went minus $2M/day. | up 0.25 to 0.45, max 3 to 5 |
| `monitorRelief` | 0.012 | Per tick per monitor, cap 3. Three monitors ≈ 0.036/day, roughly one uprising drip's worth of forgiveness at 0.33x. | 0.008 to 0.02 |
| `ovFloorK` / `ovFloorMax` | 35 / 30 | The patriotism floor: oversight never decays below min(max, subj*K). At 59% subjugation the floor reads 21%. Raise K and the narrative build spends its endgame closer to danger; every winning bot ends at 40+ so this binds only the full-dec degenerate. | K 25 to 45, max 25 to 35 |
| `coverPayoutDays` | 45 | Insurance payout in days of net per lost market. Above ~90 losing regions becomes a strategy. | 30 to 60 |
| `deskDays` | 24 | Desk turnover clock. Shorter = more variety and more temptation. | 15 to 35 |
| `choiceGapMs` | 45000 | Real-time floor between choice modals in a live session (sim-day gaps compress with the speed dial). Bots and checks run unpaced and skip it. | 30000 to 60000 |
| `evRepCap` | 3 | Choice-event firings per run before it retires (flashes get double). Each repeat also waits `cd*(1+n*0.5)`. | 2 to 5 |
| `evPct` | 0.05 | Event cash options also cost this share of treasury (Law 1). At 3B banked the auditor costs $150M whatever evScale says. | 0.03 to 0.08 |
| `blackoutDays` / `blackoutCd` | 14 / 16 | Duration vs re-use gate. Cd must stay ≥ days or blackout becomes permanent in one region. | cd ≥ days, always |
| `spreadK` / `routeK` | 0.00042 / 0.00085 | Free market openings. The pressure valve on entry pricing; raise these if you raise entryQuad. | ±50% |
| `crackBackfire` | 0.12 | Base only; copwatch +0.15 and media·resist add on top, fist halves it. | 0.08 to 0.18 |
| `resistCap` / `pacCap` | 0.45 / 0.6 | Ceilings on civilian growth-cut and on narrative suppression of organizing. These caps are why neither side can ever fully shut the other out. | do not remove the caps |
| `unrestNoise` | 0.35 | Street-level randomness; too high and states flap, spamming headlines. | 0.2 to 0.5 |

---

## THE FIVE SCALING LAWS

Break any of these and the surplus comes back. Each was paid for.

**1. A flow price cannot drain a stock.**
A price computed from income (`net*days`) is bought out of income, so the treasury it was supposed to discipline never moves. Measured: under flow-only pricing an action cost ~$1,065 against a $175,000 treasury, the bank could buy 165 of them, and the winning run ended holding **660 days of income**. Every repeatable price in the game now carries a `cash * pct` term (`aPrice` 1539, `opPrice` 1632, `acqPrice` 1659), and the same bot now ends at **~6 days of income**. Any new repeatable spend must include a percentage-of-treasury term.

**2. Percentage pricing is scale invariant; unit-bearing constants are not.**
When MONEY went to 1e5, every `pct * cash` price survived untouched, proved with the meter: banked days before and after the rescale were identical. But every constant that mixes units broke: the `evScale` divisor pinned the clamp at 25x and silently disabled the priced half of the event system, and the bubble divisor paid 17 days of net per tap. When the unit moves, grep for every raw divisor and flat base; the percentages will take care of themselves.

**3. If income is linear in the network, some cost must be superlinear, or the endgame is a fountain.**
Income is linear in `gdp*coverage` and the skill tree multiplies it ~2.6x with nothing on the cost side. With linear upkeep the margin could only widen, which is exactly the 660-day surplus. The `(1 + infra/upkeepCurve)` quadratic (1868) is the structural fix: peak net still reaches ~$14M/day, but the margin peaks and squeezes instead of compounding, and the end bank stays at ~6 days. Never add a big income multiplier without asking what grows on the upkeep line.

**4. A sink behind a cooldown is not a sink.**
Region actions are gated by 20 to 25 day cooldowns and preconditions, and a bot holding 112,000 over 1,100 days managed to spend between $0 and $20,825 on them. The price was irrelevant; the throttle was the gate. Acquisitions (no cooldown, no precondition, heat-ratcheted percentage price) are the always open sink, and the desk keeps three offers permanently on the table. If a new spend matters to the economy, it must be purchasable the moment the player has money.

**5. Passive drips are timers; size them to the campaign, not to the moment.**
Oversight fills from per-region drips (0.011 / 0.03 / 0.11 per tick times D.over) plus a suspicion-coupled gain, against a 100 point bar and a ~1030 day winning run: the balanced bot wins with room to spare, and the old acquisition scrutiny (1.5 sus / 0.6 ovr per buy) killed it at day 800 every single time, which is how we know the margin is thin. A drip is multiplied by every tick of a thousand-day campaign and by `D.over`; before touching one, compute `100 / (drip * D.over)` in days and compare it to the win day. If the answer is shorter than the campaign, you have not tuned a pressure, you have set an egg timer.

---
