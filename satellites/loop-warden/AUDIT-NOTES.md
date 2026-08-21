# Daily determinism — 2026-08-21

Checked with `scripts/daily_determinism_generic.mjs` for the Listdle submission,
which lists games on the basis that a daily is the same puzzle for everyone.

**Verdict: ⛔ FAIL**

Two players on the same day diverged at step 2 of 11: something in the daily path is unseeded.

| | |
|---|---|
| entered the daily via | `Daily Loop` |
| two same day runs identical | **no** |
| control: tomorrow differs | yes |
| control: other inputs differ | yes |
| animates with no input | no |
| observations compared | 11 |

⛔ A PASS here requires both controls to have moved. Without that, "the two runs
matched" only means the harness cannot see anything this game does.

    node scripts/daily_determinism_generic.mjs loop-warden


---

# Daily determinism — 2026-08-21

Checked with `scripts/daily_determinism_generic.mjs` for the Listdle submission,
which lists games on the basis that a daily is the same puzzle for everyone.

**Verdict: ⚠️ LEAD, UNCONFIRMED**

Two players on the same day diverged at step 2 of 11: something in the daily path is unseeded.

⛔ **This is a lead, not a confirmed bug.** The same harness produced five
false failures on its first run by comparing canvas animation phase between two
contexts that started seconds apart. Confirm against the game's own seeding
code and a text only diff before acting on it. See `LISTDLE-DAILY-EVIDENCE.md`.

| | |
|---|---|
| entered the daily via | `Daily Loop` |
| two same day runs identical | **no** |
| control: tomorrow differs | yes |
| control: other inputs differ | yes |
| animates with no input | no |
| observations compared | 11 |

⛔ A PASS here requires both controls to have moved. Without that, "the two runs
matched" only means the harness cannot see anything this game does.

    node scripts/daily_determinism_generic.mjs loop-warden

## Followed up by hand the same day, and it looks fine

`launchRun()` seeds the daily with `dayCodeUTC()` and there is no `Math.random`
anywhere in the file. Two same day runs were then diffed on **visible text only**
across five observations and came back **identical at every step**. The failure
above is the canvas hash, which compares animation phase between two contexts
that started seconds apart, not the puzzle.

⛔ Treat loop-warden's daily as UNPROVEN rather than broken. Proving it properly
means starting the daily through `LWD_DEV` and comparing `LWD_DEV.state()`
instead of pixels.
