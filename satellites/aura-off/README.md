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
node test/balance-sim.js    # 520,000 two-stage fights, 4 skill levels, 3 ownership arms
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
  difficulty curve that runs backwards, a qualifying stage that pays out to the
  player who needed it least, a pack that sells win rate. It reports, it never
  gates: it exits 0 whatever the numbers say and non-zero only on a real error.
  It takes about a minute; `--quick` while you iterate, `--no-packs` to skip the
  slowest section.
- `integration` catches what neither can see: a `querySelector` matching nothing,
  a renamed id, a listener bound to a button that isn't there. It boots the real
  `index.html`, clicks real buttons, and plays a battle to the result screen.

## Layout

```
src/data/      moves.js  packs.js  campaign.js  mc.js    ← pure data, no logic
src/engine/    rig.js  anim.js  scoring.js  battle.js    ← pure, no DOM
src/ui/        game.js  hud.js  timing.js  save.js  style.css
test/          validate.js  balance-sim.js  integration.js
tools/         gen-docs.js                                ← regenerates ROSTER.md
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
| Moves | 27 base — 9 FLEX / 9 FLOW / 9 BAIT (full table in `ROSTER.md`) |
| Packs | 2 regional, 10 moves, ownable. The base 27 are the whole game without them. |
| Turn state | `<body data-state>` — `ready` / `timing` / `resolving` / `over` |
| Evidence | 13 documented in real battles (V1), 14 original (V3). With both packs: 37 moves, 24 of them V3. |
| Opponents | 25 across 5 acts, each dropping a move |
| Stages | EL FARMEO (solo qualifier) then the duel. Chispa, the first fight, has no farmeo. |
| Dependencies | **zero at runtime**; jsdom for tests only |
| Specials | interrupt, guard, refresh, feint, highRisk, debuff, counter, finisher, evade, hype, read, persist |
| Quirks | mirror, patient, frontrunner, punisher |

Balance is measured, not asserted — see the next section.

## Balance — measured

**Every number in this section came out of `test/balance-sim.js`, which plays
real battles through `resolveExchange()`.** Nothing here is a design target and
nothing here was rounded to meet one. Reproduce the whole thing:

```bash
node test/balance-sim.js --seed=1337        # 520,000 fights, about 70s on two cores
node test/balance-sim.js --quick            # coarse, for iterating
node test/balance-sim.js --json             # the same numbers, machine-readable
```

Last measured **29 Aug 2026**, seed 1337, 3,000 fights per policy × opponent.

### A fight is two stages

`src/ui/game.js` plays **EL FARMEO** — a solo qualifying stage, two or three
turns with nobody standing opposite — and hands what the room made of it to the
duel as an opening meter. Falling short is never elimination; it costs meter and
a few people in the crowd. Every rate below is a farmeo **and** the duel it
bought, because that is the game that ships.

### Win rate by act by player policy — the base 27 moves, no pack owned

| Act | masher | varied | composed | expert |
|---|---|---|---|---|
| The Plaza | 4.2% | 70.5% | 82.8% | 98.9% |
| The Park Bracket | 1.2% | 41.7% | 63.4% | 95.8% |
| The Banned Town | 0.0% | 29.7% | 58.8% | 96.5% |
| The Capital | 0.1% | 25.5% | 46.7% | 87.6% |
| Upriver | 0.0% | 11.4% | 24.5% | 78.2% |
| **All 25 opponents** | **1.1%** | **35.8%** | **55.2%** | **91.4%** |

The four policies are defined in `battle.js` (`policyAction`), next to the rules
they probe: **masher** spams one strong move at random timing · **varied** never
repeats within three, random timing · **composed** never repeats and holds near
`idealAmp` · **expert** plays the triangle, blends, and nearly never misses the
needle.

**A masher losing everywhere is correct, not a bug.** Freshness is the
mechanical form of the verified win condition — competitors are documented as
needing to reference as many different memes as possible — so repeating yourself
has to lose.

### What the qualifying stage did

The same duels, off the same seeds, with the farmeo removed:

| Policy | duel only | two-stage | delta | mean opening meter | cleared the bar by |
|---|---|---|---|---|---|
| masher | 1.5% | 1.1% | −0.4pp | 45.9 | 0.82× |
| varied | 40.3% | 35.8% | −4.5pp | 47.0 | 0.90× |
| composed | 57.7% | 55.2% | −2.5pp | 48.1 | 1.04× |
| expert | 89.7% | 91.4% | **+1.7pp** | 52.8 | 2.15× |

A duel with no farmeo in front of it opens at 50.0.

**The farmeo is a net gain for exactly one policy, and it is the one that needed
it least.** It was worse. The bands first shipped at 1.30/1.00/0.70/0 paying 56/50/45/40,
and an expert took the top band **96%** of the time, opening nearly every duel at
56 against 16% for a composed player — a band the strongest policy cannot fail is
not a skill check, it is a bonus. Retuned to 1.95/0.92/0.62/0 paying 54/50/46/42:
the top band now sits above where a needle-perfect player lands rather than below
it, and the spread is 12 points instead of 16. Expert's gain fell from +3.3pp to
+1.7pp and its top-band rate from 96% to 71%. It is still the only policy the
stage helps, and that is the honest remaining cost of putting a pure timing test
in front of a duel.

A meter head start is worth most where the duel is closest to even, and Upriver
is the only act where an expert is anywhere near even — which is why that act
moved most, in both directions, as the bands were tuned.

### Packs — range, not power. Measured three ways.

`src/data/packs.js` rule 1 is that the base twenty-seven stay a complete
winnable game, and rule 2 is that **a pack adds range, never power**. Both are
win-rate claims, so both get measured. Three arms, paired seeds, the deck is the
only variable: nothing owned · both packs bought (the 4 moves that arrive with
them) · both packs maxed (all 10 moves earned).

| Arm | overall win rate | delta |
|---|---|---|
| no pack | 45.9% | — |
| both packs, opening moves | 46.6% | +0.7pp |
| both packs, every move | 45.9% | **+0.0pp** |

"Overall" averages all four policies, which is why it reads low — and it is the
same 45.9% the main table averages to with nothing owned, off a smaller sample
and a different seed stream. That agreement is the check that rule 1 holds.

**Rule 1 holds. Rule 2 now holds at the top of the skill curve and does not yet
hold at the bottom.**

The first measurement of this system was pay-to-win: maxed bought **+2.5pp**
overall and up to **+8.0pp** for an expert on Upriver. Two mechanisms, and one of
them is fixed.

**Fixed — duplicated roles.** With every pack move owned the expert had been
spending 12.8% of its turns on `premio`, more than on any base move, followed by
`bis` at 9.6%. `premio` was a second `finisher` in a second category and `bis` a
second `persist`: the base game had exactly one answer to those board states and
a pack sold a better one. All four pack specials (`hype`, `read`, `persist`,
`finisher`) were stripped. **The rule that came out of the measurement, and it is
now written at the top of `packs.js`: a pack move may borrow a BODY the base game
already has, never a ROLE.** A pack's range is its category, its ideal amplitude
and its upper/lower split, which is what a pack is for. Maxed went +2.5pp →
+0.0pp overall, and every expert cell is now inside +1.6pp.

**Not fixed — deck size in the early acts.** The worst cells left:

| Arm | Policy | Act | delta |
|---|---|---|---|
| maxed | varied | The Plaza | +7.8pp |
| maxed | composed | The Plaza | +5.9pp |
| bought | composed | The Plaza | +5.4pp |

Ten extra cards against a three-card starting deck is a freshness engine, and
freshness is the biggest multiplier in the game. This is not a numbers problem
and no multiplier fixes it — the advantage is COUNT, not power, so anything that
weakens the pack moves weakens the base moves beside them.

**The shape of the fix is a deck cap**: you bring N moves to a fight, so a pack
changes *which* N rather than *how many*. That makes the unlock chain a set of
choices instead of an accumulation, which is a better game and is how every
collectible format solves this. It is also a real design change to the base game,
so it is a Director call and not a tuning pass. **Nothing ships broken today —
packs are inert: no store writes ownership, and no campaign opponent drops a pack
move — but this is the blocker before a pack ever goes on sale.**

### Where this table sits against the CONTRACT §14 targets

§14 says in terms that its table "described code we no longer have — it is a
target, not a measurement". Two cells are properly off it and both are honest
about why:

- **The Banned Town, expert 97.0% against a target of 88%.** A judged act with
  no crowd rewards composure and repertoire, and an expert has a 27-card deck
  against a rival carrying three. Most of the gap is freshness, and
  `JUDGE_SHAPE.freshness` was already cut from 1.45 to 1.15 for punishing the
  small-pool rivals too hard. Cutting it further would take composed down with
  the expert, so it is left where it is.
- **Upriver, expert 84.4% against a target of 75%.** It read 75.9% before this
  pass. Measured: **+1.4pp** from the timing change (the `--no-farmeo` arm moved
  75.9% → 77.3%) and **+7.1pp** from the farmeo's head start (77.3% → 84.4%).
  Five sixths of it is the new stage, and the dial that owns it is
  `battle.js` `TUNING.qualify`.

### One thing the curve does that it should not

**The expert gets easier from The Park Bracket to The Banned Town** — 95.9% to
97.0%, +1.0pp at 4.8 sigma, which `balance-sim` now flags. It is new. Before
two-stage battles that step fell (94.8% → 94.4%); the farmeo pays the expert
+1.9pp in the bracket and +2.7pp in the banned town, and that difference is the
whole inversion.

The flag itself is new too, and it is the reason this is visible at all. The
test used to be a flat "more than 1.5pp is a rise", which is roughly four sigma
at a 50% win rate and roughly seven at a 96% one — so an inversion at the top of
the ladder, which is exactly where an expert lives, could never trip it. It now
has to clear three standard errors of the difference as well as a 0.5pp floor.
**An assertion that cannot fail where the problem actually is, is decoration.**

### The one scoring change in this pass

The `TIMING` band was narrowed, from 1.5/1.2/0.8/0.4 to
**1.35/1.15/0.85/0.55** — a 2.45× spread against `composure()`'s 2.50×, so the
needle and the body are now worth the same. The mean is unchanged at 0.975, so
nothing about a random-timing player's absolute scoring moved; what moved is how
much the needle alone can buy. Measured effect, whole campaign: composed
54.7% → 59.7%, varied 34.4% → 37.2%, expert 92.9% → 92.8%, masher 1.1% → 0.7%.
**`composure()` itself is untouched and byte-identical.** The rationale and the
one cell it costs are written out above `TIMING` in `src/engine/scoring.js`, and
it is one line to revert.

### The invariants, checked

All measured in the same run, base 27 moves, nothing owned:

| | |
|---|---|
| Expert descends across the campaign | 98.8 → 95.9 → **97.0** → 87.8 → 84.4 — one step up, flagged above |
| Expert can lose Upriver | yes, 15.6% of fights |
| Composed beats varied | **+22.5pp** overall (59.7% against 37.2%) |
| The masher loses everywhere | best act 2.0%, and 0.0% in three of five |
| The four policies separate in order | yes, every step at least 40% of its intended size |
| No strictly dominated move | none — every move the expert skips still carries competitive value for its category |
| Every move gets played | yes, by at least one policy |
| The base 27 stay a complete game | yes, every act beatable with nothing owned |

Two moves are **shadowed** rather than dominated — `shades` and `freeze` are
healthy on value and the expert still almost never reaches for them, because
something else is a shade better every single turn. That is a deck-diversity
note, not a dead move.

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
