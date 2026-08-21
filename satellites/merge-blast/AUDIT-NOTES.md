# Daily determinism — 2026-08-21

Checked with `scripts/daily_determinism_generic.mjs` for the Listdle submission,
which lists games on the basis that a daily is the same puzzle for everyone.

**Verdict: ⛔ FAIL**

Two players on the same day diverged at step 1 of 11: something in the daily path is unseeded.

| | |
|---|---|
| entered the daily via | `📅 Daily Grid` |
| two same day runs identical | **no** |
| control: tomorrow differs | yes |
| control: other inputs differ | yes |
| animates with no input | no |
| observations compared | 11 |

⛔ A PASS here requires both controls to have moved. Without that, "the two runs
matched" only means the harness cannot see anything this game does.

    node scripts/daily_determinism_generic.mjs merge-blast


---

# Daily determinism — 2026-08-21

Checked with `scripts/daily_determinism_generic.mjs` for the Listdle submission,
which lists games on the basis that a daily is the same puzzle for everyone.

**Verdict: ⚠️ LEAD, UNCONFIRMED**

Two players on the same day diverged at step 1 of 11: something in the daily path is unseeded.

⛔ **This is a lead, not a confirmed bug.** The same harness produced five
false failures on its first run by comparing canvas animation phase between two
contexts that started seconds apart. Confirm against the game's own seeding
code and a text only diff before acting on it. See `LISTDLE-DAILY-EVIDENCE.md`.

| | |
|---|---|
| entered the daily via | `📅 Daily Grid` |
| two same day runs identical | **no** |
| control: tomorrow differs | yes |
| control: other inputs differ | yes |
| animates with no input | no |
| observations compared | 11 |

⛔ A PASS here requires both controls to have moved. Without that, "the two runs
matched" only means the harness cannot see anything this game does.

    node scripts/daily_determinism_generic.mjs merge-blast
