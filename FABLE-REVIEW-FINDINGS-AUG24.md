# FABLE REVIEW FINDINGS: the Aug 24 Flock the World pass

Reviewed per `HANDOFF-FABLE-FTW-REVIEW.md`. Twelve agents hunted and adversarially
verified; nine serious claims went to refutation and **zero were refuted**. Every
fix below was proved by measurement, and every new guard was watched failing
before it was trusted.

## The four questions, answered

**1. Does the economy hold up?** Yes, and it is now measured exactly instead of
in ranges. The meter's non-determinism is FOUND and FIXED: the vm sandbox in
`scripts/ftw_surplus.js` passed no `Math`, so the box grew its own realm Math and
Opus's process-level seeding never reached the sim — the meter's own bot was
seeded while the game under it rolled real dice. (The standing comment blamed
`Date`; the review proved Date innocent — it is box-realm too, and no reachable
use affects state.) With both realms seeded, three runs are **byte identical**.
True numbers: **5/5 wins, 11 days of peak income banked** (was 660 before the
pass), last market day 1032, entry 104% of lifetime income.

**2. Fun or just tight?** Not a wall. The opPct sweep (0.05 → 0.09) moves the
bank only 12 → 11 days because percentage pricing self-regulates: cheaper ops
just get bought more often. A player can always afford the desk; the dial changes
pacing, not survival. **The "six days may be too tight" worry retires.**

**3. What else did the author break?** Plenty, all same-family, all fixed:

| defect | impact | fix |
|---|---|---|
| Save persisted none of `acqHeat/dcs/deskRoll/monitor/cover` | reload erased data-centre upkeep forever, reset acquisition heat (buy at 69%, reload, buy at 14%) — a save-scum hole through the whole surplus fix | persisted + validated (caps enforced against hand-edited blobs); suite asserts the round trip, watched fail first, 148 → 154 checks |
| `evScale` kept the old-unit `/10` divisor | event multiplier pinned at 25× from the first ticks; priced event options (~$300M vs a $20M treasury) permanently disabled — the priced half of the event system silently off | `/(10*MONEY)` |
| **The late landscape block committed the trap its own header warns about**: `.worldstat/.ws/.legend` overrides sat ABOVE their base rules | most of the World-tab compaction reviewed as "shipped" never computed — tiles kept portrait type, the acquisition bar sat lower | rules relocated below their bases; computed-style probe proves all 8 now land |
| Early-block `#coWrap` landscape fix dead (base below it) | vendor label still stacked above its input on the landscape pick screen | moved to the late block |
| Early-block `.nb/#nav` slimming dead (base below it) | nav stayed portrait-height in landscape, shortening the map the HUD work fought for | moved to the late block |
| Bubble toast printed `+$585000000.` raw | the one money readout that survived the rescale unformatted | `fmtMoney` |
| Four event gates still `s.cash>=120` (old units) | vacuous, saved only by the renderer's own scaled gate | `*MONEY` |
| Unaffordable desk offers were tappable and silently did nothing | dead taps | `disabled` attr + "The desk has moved on." toast on a stale tap |

**4. Winnable by a person?** Yes. The deterministic bot wins 5/5 at `winAt` 0.95
over ~1050-day campaigns, and with `evScale` fixed a human gets back the priced
event options the bot never used. No evidence 0.95 is too generous — it should
stand until Stephen's play says otherwise.

## Reported, NOT fixed — Stephen's calls, in play-test order

1. **Cash bubbles are worth 3–45 days of net income each (mean ~17), not the
   "couple of days" the code comment claims.** A tap-everything player collects
   MORE from bubbles than from the entire income tick (~1.27× net/day). All
   economy numbers were measured with a bot that taps 10% — a diligent tapper
   could partially reopen the surplus. If the test play feels money-loose, this
   is why. Dial: the `cashScale` divisor at the bubble spawn (`net/9`; ~36 would
   make a tap ≈ 4 days of net).
2. **Two desk items sell inert counters**: Consent Decree's `monitor` and
   Liability Cover's `cover` are written, saved, restored — and read by nothing.
   Their one-off oversight drops work; the lasting effect is a placeholder.
   Either wire them or reword them; as sold, Retain the Firm dominates both.
3. `doAcquire` in the zero-active-regions edge charges and delivers nothing —
   near-unreachable in normal play, noted for completeness.
4. Meter seeds share one localStorage stub, so seeds 2–5 boot with seed 1's save
   present. Deterministic and state-inert (the bot drives `newState` directly),
   but the five seeds are not fully independent samples.

## The lesson, now three commits deep in the record

**A media query adds no specificity** — and the fix for the class is not a
comment, it is *placement plus measurement*. The late block's own header warned
about the trap while the block committed it five selectors later. The only
defence that has actually worked all day is `getComputedStyle` in a real browser:
`scratch/ftw_css_landed.mjs` now asserts every relocated rule computes.

## Re-run everything

```
node satellites/flock-the-world/check.js   # 154 checks, deterministic
node scripts/ftw_surplus.js spend          # byte-identical; run twice and diff
node scripts/ftw_guide_check.mjs           # the briefing card obeys .on
node scripts/ftw_acq.mjs                   # acquisition + desk, as a player
node scratch/ftw_css_landed.mjs            # every relocated CSS rule computes
```
Static server on `127.0.0.1:8777` required; it does not survive a codespace stop.
