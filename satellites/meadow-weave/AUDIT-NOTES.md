# Daily determinism — 2026-08-21

Checked with `scripts/daily_determinism_generic.mjs` for the Listdle submission,
which lists games on the basis that a daily is the same puzzle for everyone.

**Verdict: ✅ PASS**

| | |
|---|---|
| entered the daily via | `📅 Daily Meadow` |
| two same day runs identical | yes |
| control: tomorrow differs | yes |
| control: other inputs differ | yes |
| animates with no input | no |
| observations compared | 11 |

⛔ A PASS here requires both controls to have moved. Without that, "the two runs
matched" only means the harness cannot see anything this game does.

    node scripts/daily_determinism_generic.mjs meadow-weave


---

# Daily determinism — 2026-08-21

Checked with `scripts/daily_determinism_generic.mjs` for the Listdle submission,
which lists games on the basis that a daily is the same puzzle for everyone.

**Verdict: ✅ PASS**

| | |
|---|---|
| entered the daily via | `📅 Daily Meadow` |
| two same day runs identical | yes |
| control: tomorrow differs | yes |
| control: other inputs differ | yes |
| animates with no input | no |
| observations compared | 11 |

⛔ A PASS here requires both controls to have moved. Without that, "the two runs
matched" only means the harness cannot see anything this game does.

    node scripts/daily_determinism_generic.mjs meadow-weave
