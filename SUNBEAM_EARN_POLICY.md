# SUNBEAM EARN POLICY — Sky Wolf Studios games
# Set 2026-07-03. The standard every studio game earns by.

Sunbeams are the cross-game currency. **30 sunbeams = 1 plant** (the economic
anchor in CLAUDE.md). This doc sets how each studio game pays them out.

## The standard (same-origin satellites)

| Rule | Value |
|---|---|
| **Daily cap per game** | **30 sunbeams** (= exactly 1 plant/day/game) |
| **Per-run / per-session cap** | **12** (so one lucky run can't cap you; ~3+ good runs = a plant) |
| **Floor** | **1** for any run/round with real progress (never "played and got nothing") |
| **Scaling** | performance-based — a weak run pays 1–3, a strong run pays up to 12 |
| **Anti-idle** | zero-progress runs earn nothing |

Rationale: a good ~10–15 min daily session of a game earns ~1 plant's worth and
then tapers, so it rewards genuine play without letting anyone grind plants
faster than the 30-per-plant anchor intends. Generous enough to feel good, capped
enough to protect plant value across a growing fleet.

## Current rates by game (all → 30/day cap)

| Game | Per-event earn | Notes |
|---|---|---|
| Picnic Panic | 1 / stage cleared (+1 floor) | run cap 12 |
| Pollen Panic | floor(runPetals / 8), floor 1 | run cap 12 |
| Vinewinder | floor(score / 6), floor 1 | run cap 12 |
| Vine Runner | floor(seeds / 8) per stage-clear, +6 victory, floor 1 | via its portal events |
| Blooming Words | 1 / first-ever word | slow accrual to the 30 cap |
| Hue Match | 4 / round win, 4 / first daily | gated by `_sbCapEarn` |
| Shell Shuffle | 3 / level, 5 / daily | gated by `_sbCapEarn` |

`_sbCapEarn(n, tag)` (in the same-origin satellites that need it) enforces the
30/day cap using a per-game localStorage key `sw_sb_<gameslug>` and calls
`Sunbeam.earn`. New same-origin satellites should route earns through it (or an
equivalent per-game day-capped helper) rather than calling `Sunbeam.earn` raw.

## Cross-origin studio games (github.io / vercel)

These earn through the **main-app postMessage bridge** (`STUDIO_RATES` rate card
in `index.html`, near `STUDIO_ORIGINS`), NOT their own SDK calls, because they
can't share this origin's localStorage. They share ONE **`MOMENT_DAILY_CAP` = 60**
(≈ two games' worth) because they all live on one origin and the bridge can't
cleanly separate them. Per-event rates stay tiered by session length (win 3–4,
milestone/progress/combo 1; Tally uses a moments table). This is the intended
exception to the 30/game rule — it's an architecture constraint, not a different
philosophy.

## Party games (Whack Box)

Party titles are same-origin (`lucidwinds.com/party/`) but they do **not** get
30/day each. Six titles at 30 would be six plants out of one party night, which
is not what the 30-per-plant anchor means. So:

| Rule | Value |
|---|---|
| **Daily cap** | **30 across ALL party titles combined** (= 1 plant/day) |
| **Per session** | **12** for the winner, which is the standard per-run cap |
| **Everybody** | **8** for being in the room at the end, winner and last alike |
| **Placing** | +4 / +2 / +1 for 1st, 2nd, 3rd on top of the 8 |

Roughly three party games in a day reaches the cap, which is the same shape as
the policy's "3+ good runs = a plant".

⭐ **Everyone is paid, including last place.** This is a social product and a
player who gets nothing for an evening does not come back. It is stated in
WHACKBOX_PLAN.md as a product rule, not a tuning knob.

Server side in `functions/partyComplete.js`. **Each player's own phone claims for
itself**: the host screen is just another browser, so it reports PLACE and the
server decides the AMOUNT. The claim document id is room code plus game slug, so
a replayed call collides instead of paying twice.

⛔ Dormant until cloud rooms are switched on (`PARTY_CLOUD_SETUP.md`). On the
local practice transport nothing mints, which is honest rather than a fake
number on screen.

## Server backstop

The Sunbeam SDK / `earnHashes` cloud function enforces global caps
(200/call, 300/min, 5000/day) server-side regardless of client rates — the final
anti-abuse ceiling.

## Changing the rates

Every rate is a one-line constant in the relevant game file. To retune the whole
fleet's generosity, change the **30** day-cap and the per-event divisors together.
Keep the 30-per-plant anchor in mind: raising the day cap directly raises plants/day.
