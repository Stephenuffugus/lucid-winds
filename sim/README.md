# Lucid Winds — Player Progression Simulator

Headless Node.js sim for designing the Keeper-level unlock ladder.
Models the real XP economy (1 sunbeam = 2 XP, 1 dew = 1 XP, bloom XP by
rarity, milestones) and runs N archetype-weighted players to Lv 12 under
two gate configurations, then emits markdown design reports.

## Run

```
node sim/run.js --gates=C --n=100 --seed=42
```

Flags:
- `--gates=A`  current shipped gates only
- `--gates=B`  proposed ladder from `docs/TUTORIAL_PROGRESSION.md`
- `--gates=C`  both + delta report (default)
- `--n=100`    number of simulated players
- `--seed=42`  RNG seed (deterministic)

Outputs land in `sim/reports/` as:
- `YYYY-MM-DD_HHMM_A.md`
- `YYYY-MM-DD_HHMM_B.md`
- `YYYY-MM-DD_HHMM_C_delta.md`

## What the reports cover

- Lv 12 reach rate, total sim minutes
- Time-to-level histogram (median / p25 / p75 / fastest / slowest) with ASCII bars
- Per-archetype minutes-to-Lv 12
- Dropout level histogram
- Unlock utilization (% of players who actually used each unlock)
- Boredom flags (>30 consecutive same-action ticks)
- The "go outside" moment — % and minute of first wild drop
- Delta report: side-by-side and per-archetype benefit/suffer table

## Architecture

```
sim/
  run.js                main entry; CLI arg parsing; writes reports
  lib/rng.js            mulberry32 seeded RNG
  lib/xp.js             RANKS table + getLevel + BLOOM_XP
  lib/gates.js          GATES_A (current) + GATES_B (proposed)
  lib/archetypes.js     12 player profiles with tickMix + cadence
  lib/actions.js        playGame/mintPlant/dropWild/collectFeral/
                        tendStranger/breed/idle + gate mapping
  lib/player.js         Player state + XP grant + leveling
  lib/session.js        runSession loops ticks, filtering by gates
  lib/report.js         markdown builders
  reports/              output dir (gitignored-friendly)
```

## Economy anchors (must match game)

- 1 tick ≈ 1 in-game minute = 1 game round
- Game win rate 70%, sunbeams per win 3–5
- 30 sunbeams mint a plant
- Bloom XP: Common 10, Uncommon 15, Rare 20, Epic 25, Legendary 40, Mythic 60, Cosmic 100
- First-plant milestone 50 XP (applied in bootstrap via onboarding gift plant)
- Each sunbeam → +2 XP, each dew → +1 XP

Adjust these in `lib/xp.js` + `lib/actions.js` if the live economy shifts.
