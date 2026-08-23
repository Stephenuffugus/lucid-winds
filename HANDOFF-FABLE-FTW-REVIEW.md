# HANDOFF: review the Flock the World pass, 2026-08-24

Written by Opus for Fable, at Stephen's request. Stephen will do a serious test
play after a final tweak; this review is the safety net under that.

---

## THE PROMPT (paste this)

> You are reviewing a day of work on Flock the World, a single file vanilla JS
> satire game at `satellites/flock-the-world/index.html` in the lucid-winds repo.
> Everything is live on lucidwinds.com and pushed to main.
>
> Read `REVIEW-FTW-ECONOMY-AUG24.md` first. It is the author's own account,
> including the things he got wrong, and it is written to be argued with.
>
> Your job is NOT to re-do the work. It is to answer four questions:
>
> 1. **Does the economy hold up?** The claim is that end of run banked money went
>    from 660 days of income to about 6, with the balanced bot still winning 5 of
>    5. Re-run `node scripts/ftw_surplus.js spend` at least five times. ⛔ The
>    meter is NOT fully deterministic and the author knows it: treat everything it
>    says as a range. **If you can find and fix the remaining non-determinism,
>    that is the single most valuable thing you can do here**, because every
>    number in this pass rests on it. Suspect `Date`, which `makeCtx` passes
>    through from the process.
> 2. **Is it still fun, or just tight?** Six days of banked income may be too
>    tight. A player with no reserve cannot answer a crisis. `CFG.opPct` (0.09)
>    and `CFG.pctOfTreasury` (0.06) are the dials. Say plainly if you think the
>    squeeze went too far.
> 3. **What else did the author break?** He shipped a blocker today: a landscape
>    CSS rule put `display` on `#guide` instead of `#guide.on`, so the briefing
>    card was permanently visible over the map and SKIP BRIEFING appeared dead.
>    It is fixed and guarded, but **the same class of mistake bit three times in
>    one session** (see below). Grep for other landscape overrides that sit ABOVE
>    the rules they are meant to beat, and for any other `display` on a base
>    selector that has an `.on` variant.
> 4. **Is it winnable by a person?** Every balance number here was tuned against
>    a bot. `winAt` came down from 0.97 to 0.95 with Stephen's permission. Check
>    that is not now too generous for someone who plays better than the bot does.
>
> Report what you find. Do not fix anything Stephen has not seen yet without
> saying so, and do not re-open the refuted economy proposal named in the review
> brief.

---

## What changed today, in order

| commit | what |
|---|---|
| `a843dbf4` | map seam 168W, HUD collapse, trees, bubbles, briefing card |
| `e99f2156` | HUD row, measured properly after three wrong answers |
| `47a491e9` | check.js event undercharge |
| `041343c6` | the surplus fix: percentage pricing plus the acquisition sink |
| `6da3de52` | rescale to contractor money |
| `9fcd95f3` | card art slots |
| `f3b97306` | per region weight and the market entry curve |
| `00d49d83` | meter moved into `scripts/` so this brief is not a dead link |
| `1fe0d394` | THE DESK: fourteen operations, three on offer at a time |
| `1de39668` | the blocker: briefing card over the map, and the difficulty selector |

## The numbers, as ranges

| | before | after |
|---|---|---|
| end of run bank | **660 days of income** | **6 days** |
| wins, balanced bot | 5/5 with nothing to spend on | **5/5** |
| starting capital | $200 | **$20M** |
| peak income | 266/day | **about $13M/day** |
| last market opens | day 690 | **day ~1000** |
| entry as share of income | 39% | **75 to 100%** |
| readable window, bubbles | 27.2s at 1x | 12.8s at 1x, 2.4s at 3x |
| HUD height, landscape | 110px, 27% of screen | **78px, 19%** |
| map area, landscape | 578x233 | **658x265** |

## ⛔ The mistake that bit THREE times in one session

**A media query adds no specificity.** Landscape overrides written near the top
of the file silently lost to plain rules further down, and the computed style
still said the old value after each "fix":

1. `.node` / `.nhead` / `.nico` tree rules did nothing. Caught by measuring the
   computed style rather than trusting the edit.
2. `#guide{right:150px}` did nothing, same cause.
3. And the blocker: `display:flex` on `#guide` beat `display:none` from the base
   rule, so the card never hid.

There is now a late `@media (orientation:landscape)` block with a comment saying
why it must stay below. **Worth grepping for any others.**

## One flaky check, found while writing this brief and pinned

`check.js` failed once in about five runs with
`every cue in the catalog is reachable :: never fired: ["event_open"]`, and
passed the other four. The cue only fires when `maybeEvent` happens to pick an
event during the campaign, so the check was rolling dice. It now raises one
deliberately if the campaign did not, still through the real `showEvent` and the
real `sfx` call. Six consecutive clean runs after.

Flagged because a gate that fails one run in five would have wasted a reviewer's
first hour, and because it is the same lesson as the meter below: **a check that
flips is a bug in the check.**

## Guards added today, and every one was watched failing first

```
node scripts/ftw_guide_check.mjs      # the briefing card obeys .on, both orientations
node scripts/ftw_surplus.js spend     # the economy meter, run it five times
node scripts/ftw_surplus.js hoard     # the no-spend baseline
node scripts/ftw_acq.mjs              # acquisition and the desk, as a player
node scripts/ftw_landscape_audit.mjs  # HUD, trees, image fill
node scripts/ftw_image_fill.mjs       # every image on every screen
node satellites/flock-the-world/check.js   # 148 checks
```
A static server on `127.0.0.1:8777` must be running for anything with a browser
in it, and **it does not survive a codespace stop**.

## Open, and Stephen should decide rather than Fable

- **Six days banked may be too tight.** Most likely thing to need loosening.
- **The card art has frames painted into the pictures.** That is why boxes appear
  around the mode and difficulty images. House rule is the frame never gets baked
  in. An art fix, not a code fix.
- **The difficulty strip art is square in a slot that wants wide.** Stephen
  offered to remake a few horizontal; that is the one place it genuinely helps.

## Things the author got wrong today, recorded so they are not repeated

- Reported an event cost gating bug as confirmed. **It is not real.** He checked
  the line the claim quoted instead of the code the claim was about.
- Commissioned a nine agent economy proposal whose arithmetic was then refuted by
  its own adversarial pass. **It was not implemented and should not be revived.**
- Told Fable to run scripts that were in a **gitignored** directory, so every
  number was unreproducible until that was fixed.
- Built an uncapped permanent cost (the data centre) that let a bot bankrupt
  itself twelve sites deep. Capped at four.
- Shipped the briefing card blocker that made the game unplayable in landscape.
