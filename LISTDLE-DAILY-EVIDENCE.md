# Listdle candidates — is the daily really the same puzzle for everyone?

Checked 2026-08-21 with `scripts/daily_determinism_generic.mjs`.

Every game here is a puzzle with a daily mode, drawn from `LISTDLE-QUEUE.md`.
The question is only worth asking because Nectar Drop failed it: its board
generator was seeded and `pegSwap()` on top of it was not, so two players on
the identical daily board ended up with different power blooms.

## How to read this

Four runs per game: the same day twice (must match), tomorrow (must differ),
and the same day with different inputs (must differ). **A PASS requires both
controls to have moved.** If neither moved, the harness is blind to that game
and the match means nothing, so it says so instead of passing.

⛔ **NOT TESTED is not the same as fine.** It means the harness never found the
daily. Those games need a small per game entry hook through their own `*_DEV`
surface before anything can be claimed about them in a submission.

| Game | Verdict | Notes |
|---|---|---|
| `tinker-loft` | ⚠️ NOT TESTED | no control matching /daily/i was found on any screen this harness could get to, so nothing below is about this game's daily. It needs a per game entry hook via its own *_DEV surface |
| `petalvex` | ⚠️ NOT TESTED | no control matching /daily/i was found on any screen this harness could get to, so nothing below is about this game's daily. It needs a per game entry hook via its own *_DEV surface |
| `loop-warden` | ⚠️ LEAD, UNCONFIRMED | **not a confirmed bug, see below.** two players on the same day diverged at step 2 of 11: something in the daily path is unseeded |
| `lamplighter` | ⚠️ NOT TESTED | no control matching /daily/i was found on any screen this harness could get to, so nothing below is about this game's daily. It needs a per game entry hook via its own *_DEV surface |
| `merge-blast` | ⚠️ LEAD, UNCONFIRMED | **not a confirmed bug, see below.** two players on the same day diverged at step 1 of 11: something in the daily path is unseeded |
| `ring-stacker` | ⚠️ INCONCLUSIVE | neither control moved: the snapshot sees nothing this game does, so A==B means nothing |
| `line-loom` | ⚠️ NOT TESTED | no control matching /daily/i was found on any screen this harness could get to, so nothing below is about this game's daily. It needs a per game entry hook via its own *_DEV surface |
| `season-sway` | ⚠️ INCONCLUSIVE | neither control moved: the snapshot sees nothing this game does, so A==B means nothing |
| `meadow-weave` | ✅ PASS | both controls moved; two same day runs identical across 11 observations |

## ⛔ The headline: this is a working tool and NOT yet a clean result

Two runs of this on the same nine games, an hour apart, **disagreed**. Games that
passed both controls in the first run reported NOTHING FOUND in the second,
because reaching a daily is done by looking for a control with "daily" in it and
that depends on how fast each game's menu comes up. **Flaky evidence is not
evidence**, so nothing here should go into a submission email yet, in either
direction:

- **Nothing below is a reported bug.** The two FAIL rows are not trustworthy.
  `loop-warden`'s two same day runs were diffed by hand on visible text and came
  back **identical at every step**, and its daily seed is `dayCodeUTC()`. Its
  FAIL is a canvas animation slower than the drift check's window, the same
  artifact that produced five false failures in the first run.
- **Nothing below is a clean bill of health either**, except where a PASS was
  reached with both controls moving.

What this needs is small and specific: a per game entry hook. Every one of these
games already exposes a dev surface (`LL_DEV`, `SS_DEV`, `PVX_DEV`, `MB_DEV`,
`RS_DEV`, `TL_DEV`, `LWD_DEV`, `LP_DEV`, `MW_DEV`). Starting the daily through
that instead of hunting for a button removes the flakiness entirely, and lets
the comparison read real game state instead of screen pixels. That is maybe
twenty minutes a game and it is the right next step.

## What the harness was caught doing wrong first

Three times it produced a confident wrong answer, and each one would have been a
false bug report about a game that was fine. They are written down because they
are the failure modes of this whole approach, not of one script:

1. **Canvas hashing compares animation phase.** Two browser contexts start
   seconds apart, so an idle animation is at a different point in each and the
   pixels differ while the puzzle is identical. Five of nine "failures" in the
   first run were this. It now asks each game whether it drifts on its own
   across 2.6 seconds and falls back to comparing visible text.
2. **It entered the wrong mode and then reported on it.** It clicked a generic
   start button before looking for a daily, so on `lamplighter` it started the
   walk campaign, found the same campaign level on both days, and announced that
   lamplighter's daily "is not keyed to the date". The seed is
   `Math.imul(dayCodeUTC(),2654435761)`. It was always fine.
3. **It assumed it had reached a daily.** It now has to find and click a control
   to claim one, and reports NOT TESTED rather than guessing.

## Watched failing

A copy of `line-loom` with its daily seed replaced by `Math.random()` is caught
at step 1 with "something in the daily path is unseeded". That is the exact
Nectar Drop failure mode, and a gate nobody has seen fail is decoration.

    cp -r satellites/line-loom satellites/_sabotage-line-loom
    # replace  mode==="daily" ? todaySeed()  with  ((Math.random()*0x7fffffff)>>>0)
    node scripts/daily_determinism_generic.mjs _sabotage-line-loom

## Rerun

    python3 -m http.server 8777 --bind 127.0.0.1     # from the repo root
    node scripts/daily_determinism_generic.mjs tinker-loft petalvex loop-warden lamplighter merge-blast ring-stacker line-loom season-sway meadow-weave
