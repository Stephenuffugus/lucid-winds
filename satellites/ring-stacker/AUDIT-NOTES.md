# Daily determinism — 2026-08-21

Checked with `scripts/daily_determinism_generic.mjs` for the Listdle submission,
which lists games on the basis that a daily is the same puzzle for everyone.

**Verdict: ⚠️ INCONCLUSIVE**

Neither control moved: the snapshot sees nothing this game does, so A==B means nothing.

| | |
|---|---|
| entered the daily via | `Daily Gyre` |
| two same day runs identical | yes |
| control: tomorrow differs | **no** |
| control: other inputs differ | **no** |
| animates with no input | yes, so visible text was compared instead of canvas pixels |
| observations compared | 11 |

⛔ A PASS here requires both controls to have moved. Without that, "the two runs
matched" only means the harness cannot see anything this game does.

    node scripts/daily_determinism_generic.mjs ring-stacker


---

# Daily determinism — 2026-08-21

Checked with `scripts/daily_determinism_generic.mjs` for the Listdle submission,
which lists games on the basis that a daily is the same puzzle for everyone.

**Verdict: ⚠️ INCONCLUSIVE**

Neither control moved: the snapshot sees nothing this game does, so A==B means nothing.

| | |
|---|---|
| entered the daily via | `Daily Gyre` |
| two same day runs identical | yes |
| control: tomorrow differs | **no** |
| control: other inputs differ | **no** |
| animates with no input | yes, so visible text was compared instead of canvas pixels |
| observations compared | 11 |

⛔ A PASS here requires both controls to have moved. Without that, "the two runs
matched" only means the harness cannot see anything this game does.

    node scripts/daily_determinism_generic.mjs ring-stacker
