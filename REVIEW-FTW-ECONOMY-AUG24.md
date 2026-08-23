# REVIEW BRIEF: Flock the World, economy and landscape UI, 2026-08-24

For Fable, at Stephen's request, after he has played a couple of games.
Written by Opus. Everything below is live on lucidwinds.com and pushed to main.

## What this pass was answering

Stephen played in landscape and reported, in his words: Russia on both edges, the
Watched number too big, images shrunken, skill trees showing too little, bubbles
too slow, and **"money becomes pretty pointless quickly... I had like $200,000
left over with nothing to spend it on."**

## Commits, in order

| | |
|---|---|
| `a843dbf4` | map seam 168W, HUD collapse, trees, bubbles, briefing card |
| `e99f2156` | HUD row measured properly after three wrong answers |
| `47a491e9` | check.js event undercharge |
| `041343c6` | the surplus fix: percentage pricing plus the acquisition sink |
| `6da3de52` | the rescale to contractor money |
| `9fcd95f3` | card art slots |
| this one | per region weight and the entry curve |

## ⛔ THE ONE THING TO CHECK HARDEST

**`scripts/ftw_surplus.js` is the meter every economy number here comes from, and
it is NOT fully deterministic.** Seeding `Math.random` before `makeCtx` fixed one
source; identical runs still report 3/5 or 4/5 wins and 29 to 53 days banked.
Something else moves, most likely `Date`, which `makeCtx` also passes through from
the process.

I nearly read a CSS-only change as a balance regression because of it. Every
figure below is a **range over about five runs, never a point.** If you want to
tighten this, that is the highest value thing in the file: pin `Date` in the
context and see whether runs become identical.

## The economy numbers, as ranges

| | before | after |
|---|---|---|
| end of run bank | **660 days of income** | **29 to 53 days** |
| wins, balanced bot | 5/5 (nothing to spend on) | 3 to 4 of 5 |
| markets held | 14/14 | 14/14 |
| starting capital | $200 | $20M |
| peak income | 266/day | about $17M/day |

## Two things I tried that did NOT work, and why they are still in the record

1. **Superlinear upkeep** (`CFG.upkeepCurve`, live at 3500). Dropped end cash from
   175k to 35k and fixed nothing: the banked figure stayed 618 to 649 days at
   every setting, because shrinking income shrinks the bank and the income
   together. **Squeezing income does not create scarcity.** Kept gently for late
   game pressure; it is not the fix and is not sold as one. **A reviewer may
   reasonably argue it should come out** since it is unproven for fun.
2. **Percentage pricing alone** (`CFG.pctOfTreasury`, live at 0.06). Moved the
   bank 708 to 636 days, no more. Every repeatable spend is gated by a 20 day per
   region cooldown, so a bot playing 1,100 days while holding 112,000 spent
   between **0 and 20,825** on region actions across the entire run. The sink was
   throttled, not priced.

**What worked was the always open sink.** ACQUISITION: buys a rival's install
base, coverage jumps everywhere you already operate, no cooldown, no
precondition, priced at a share of treasury, and each purchase raises the rate
(`acqHeat`) which bleeds off slowly.

## Judgement calls worth a second opinion

- **`winAt` 0.97 to 0.95.** Stephen authorised it. With a real sink in the game
  the bot was landing at 0.93 to 0.95 and losing narrowly on runs it had played
  well. Check this is not now too generous for a human who plays better than the bot.
- **`MONEY = 1e5`, not 1e6.** At 1e6 daily income reads about $150M/day, roughly
  $55B a year, which is larger than the real companies the satire is about. 1e5
  gives about $6B a year. Debatable; easy to move, it is one constant.
- **Acquisition scrutiny** (`acqSus` 0.55, `acqOvr` 0.2). At 1.5 and 0.6 the bot
  lost every run: it took all 14 markets, reached subjugation 0.7 and died of
  oversight around day 800. Softened until it stopped being fatal. That tuning
  was done against a bot, not a person.
- **The `.legend` clamp** hides copy behind a tap. Discoverability is a real cost.

## Bugs I introduced and caught, so you can check I got them all

- The acquisition button called `openSheet('war')`. **`war` is CRISIS; the World
  tab is `reg`.** It would have thrown the player onto the wrong screen after
  every purchase.
- Landscape overrides written in the media query at the TOP of the file silently
  did nothing, twice: a media query adds **no specificity**, so the plain `.node`,
  `.nhead`, `#guide` and `@media(min-width:560px) .nico` rules further down won on
  source order. Computed style still said 44px after the "fix". There is now a
  late landscape block with a comment saying why it must stay below. **Worth
  grepping for any other override I left up top.**
- Four `check.js` fixtures were denominated in the old money unit and stopped
  buying anything after the rescale.

## Claims I made that turned out to be wrong

- I reported an event-cost gating bug as confirmed. **It is not real.** Line ~2613
  already reads `(!o.c||o.c(S))&&(!cc||S.cash>=cc)`, gating on the scaled cost. I
  checked the line the claim quoted instead of the code the claim was about.
- A 9 agent workflow produced a full economy proposal and an adversarial pass
  refuted its arithmetic (lifetime money understated 2.7x, the surplus did not
  close). **It was not implemented.** Do not resurrect it from the transcript.

## Done after the first draft of this brief

- **Per-region economic weight.** `r.gdp = pop * wealth * (0.55 + 0.45*urban)`,
  NORMALISED so `sum(gdp)` equals the old `sum(pop*wealth)`. That moves the
  distribution and deliberately does not move the size of the economy, because a
  silent aggregate shift would be indistinguishable from a balance change.
  Verified neutral: peak net $17.0M either side. The same weight now prices the
  DOOR as well as the payout, so the whale and the expensive door are the same
  place. ⚖ On its own the urban term only moves any region's share by under two
  points, so the differentiation here comes from the shared weight, not from
  `urban`. A reviewer may reasonably say that is not enough differentiation and
  that regions want separate procurement and scrutiny profiles.
- **Market entry curve.** `entryCost` tracks gdp, plus a squared term in markets
  held (`entryQuad` 0.09, swept).
  ⛔ "Markets held" was the WRONG metric and answered 14/14 at every setting:
  entry is a one time cost against an unbounded income stream, so given enough
  days you can always afford everything. Stephen's complaint was buying in "super
  fast", so the metrics are WHEN the last door opens and what the doors cost.

  | entryQuad | last market | entry as share of lifetime income |
  |---|---|---|
  | 0.0, the old curve | day 690 | 39% |
  | **0.09, shipped** | **day 945 to 1008** | **75 to 82%** |
  | 0.20 | day 1194 | 86%, leaves nothing for anything else |

- **Spending variety: THE DESK.** Three offers drawn from a pool of fourteen,
  refreshing on a 24 day clock and whenever you buy. Something is always for
  sale, it is rarely the same thing twice, and every price is a share of the
  treasury so none of it re-opens the surplus.
  The effects are deliberately DIFFERENT SHAPES rather than different prices:
  Legal (standards seat, retainer, consent decree), Political (revolving door,
  fund the challenger), Media (astroturf, documentary, bury the study), Capital
  (data centre, poach the team, satellite lease), People (settle with the family,
  endow the academy, liability cover).
  ⛔ **The data centre is the one that charges you forever**, and uncapped it was
  a trap: the bot bought TWELVE and drove its own net income to minus $2M a day.
  Capped at four, with the price climbing per site. A reviewer should check that
  cap is the right number and that the climbing price reads as a decision rather
  than as a tax.

  | | before all of this | now |
  |---|---|---|
  | end of run bank | 660 days of income | **6 days** |
  | wins | 5/5, nothing to spend on | **5/5** |
  | desk spend per run | n/a | about $1.9B |

  ⚖ Six days of banked income may be TOO tight: the bot spends greedily because
  there is always something worth buying, and a player with no reserve cannot
  answer a crisis. `CFG.opPct` (0.09) and the 1.8x affordability the meter's bot
  uses are the dials. This is the single most likely thing to need loosening
  after Stephen plays.

## Still not done

- Nothing from Stephen's Aug 24 notes. Everything he raised is addressed; whether
  it is addressed WELL is what this review is for.

## How to re-run everything

```
node satellites/flock-the-world/check.js          # 148 checks
node scripts/ftw_surplus.js spend                 # the meter, run it 5 times
node scripts/ftw_surplus.js hoard                 # the no-spend baseline
node scripts/ftw_acq.mjs                          # the purchase, as a player
node scripts/ftw_landscape_audit.mjs              # HUD, trees, image fill
```
A static server on 127.0.0.1:8777 must be running for anything with a browser in
it, and it does not survive a codespace stop.
