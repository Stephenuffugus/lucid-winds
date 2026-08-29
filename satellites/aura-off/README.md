# AURA OFF

Turn-based gesture-duel game built on the 2025–26 aura battle phenomenon.

**New here? Read `HANDOFF.md` first.**

| File | What it is |
|---|---|
| `HANDOFF.md` | Start here. Context, rules, next tasks, open questions. |
| `ROSTER.md` | Every move and opponent. **Generated from code** — never edit by hand. |
| `docs/AURA-BIBLE.md` | Research foundation, evidence tiers, IP register. Read the Addendum. |
| `docs/AURA-CULTURE.md` | Glossary, people, locations, the bans, the positive case. |
| `docs/AURA-3D-VR.md` | 3D environments and VR. **Parked** — read only if reopened. |

## Run it

```bash
python3 -m http.server 8080      # ES modules need a server, not file://
```
Open `http://localhost:8080`.

## Check it

```bash
npm install        # jsdom only, test-only
npm run check      # validate → sim → integration. All three must pass.
```

Regenerate `ROSTER.md` after any content change:

```bash
node tools/gen-docs.js
```

or individually:

```bash
node test/validate.js       # data integrity + content-safety lint
node test/balance-sim.js    # 3,000 battles per matchup, 4 skill levels
node test/integration.js .  # boots the real UI in jsdom and plays a battle
```

`jsdom` is the only dependency and it is test-only (`npm i`). The game itself
ships with zero dependencies.

All three must pass before shipping any change to moves, campaign, or scoring.

**What each one catches, and why all three exist:**

- `validate` catches typo'd move ids, weights that don't sum, unlocks nobody can
  reach, frame times out of order. It also enforces the content-safety rule and
  guards against evidence tiers being inflated to V1 without sourcing.
- `balance-sim` catches design problems — a move that's strictly dominated, a
  difficulty curve that runs backwards.
- `integration` catches what neither can see: a `querySelector` matching nothing,
  a renamed id, a listener bound to a button that isn't there. It boots the real
  `index.html`, clicks real buttons, and plays a battle to the result screen.

## Layout

```
src/data/      moves.js  campaign.js  mc.js     ← pure data, no logic
src/engine/    rig.js  anim.js  scoring.js  battle.js   ← pure, no DOM
src/ui/        game.js  hud.js  timing.js  save.js  style.css
test/          validate.js  balance-sim.js
```

**The rule that keeps this honest:** `resolveExchange()` in `engine/battle.js`
is the only place turn outcomes are decided. The UI animates its result; the
simulator calls it directly. Neither re-implements the rules, so they cannot
drift apart.

If you find yourself computing a score in `src/ui/`, it belongs in
`engine/scoring.js` instead.

## Current state

| | |
|---|---|
| Moves | 27 — 9 FLEX / 9 FLOW / 9 BAIT (full table in `ROSTER.md`) |
| Turn state | `<body data-state>` — `ready` / `timing` / `resolving` / `over` |
| Evidence | 13 documented in real battles (V1), 14 original (V3) |
| Opponents | 25 across 5 acts, each dropping a move |
| Dependencies | **zero at runtime**; jsdom for tests only |
| Specials | interrupt, guard, refresh, feint, highRisk, debuff, counter, finisher, evade, hype, read, persist |
| Quirks | mirror, patient, frontrunner, punisher |

Balance (win rate by player policy):

| Act | masher | varied | composed | expert |
|---|---|---|---|---|
| The Plaza | 4% | 76% | 88% | 99% |
| The Park Bracket | 3% | 65% | 80% | 98% |
| The Banned Town | 0% | 33% | 62% | 88% |
| The Capital | 0% | 40% | 65% | 88% |
| Upriver | 0% | 30% | 49% | 75% |

## Things not to break

- **Joint names are frozen.** `rot bob lean head sL eL sR eR hL kL hR kR` map to
  real bones when the 3D models land.
- **Every move's `up` + `lo` must sum to 1.0.** The validator enforces it.
- **Don't flatten the composure curve.** Score falls off on both sides of
  `idealAmp`, harder above than below. It's sourced (see the bible) and it's
  what makes 27 moves feel like 27 different physical acts.
- **No move may mock the opponent.** BAIT is self-directed clowning. This is the
  line Costa Rica's education ministry drew and it's the right one — and it is
  now enforced by `validate.js`, not just written down. A move called
  "Point & Laugh" shipped for three versions before the lint caught it; it is
  now "Losing It", where you crack yourself up instead.
- **`ui/save.js` is the only file that touches storage.** Uncomment the
  localStorage bodies for the PWA build; nothing else changes.
