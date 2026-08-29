# AURA OFF — build notes, 2026-08-29

Read this before touching anything here. `CONTRACT.md` is the build contract and
the source of truth for every number; this file is the story of how the code got
here and what is still wrong with it.

## What this is

A turn-based gesture duel built on the real 2025-26 aura battle phenomenon —
teenagers holding silent, no-contact gesture duels in public plazas across Latin
America — which traces back to Pacu Jalur, a 17th-century Indonesian boat race
where a child on the prow has the literal job of generating aura for sixty rowers.

Stephen's framing was "old school Pokémon battle on Game Boy." CNN independently
reached for the same comparison, listing these battles alongside earlier youth
contests fought with Pokémon cards, Beyblades and rap verses. The turn-based frame
is not imposed on this culture; it is the one the culture already sits in.

## ⛔ The code was never in the handoff

The drop was a zip of **seven files**: `HANDOFF.md`, `README.md`, `ROSTER.md`,
three research docs, and `index.html`. That `index.html` is a 3KB shell whose last
line loads `src/main.js` — and no `src/`, `test/`, `tools/` or `package.json`
existed anywhere on disk or in the Drive folder it came from.

It had been built on a phone through Claude Chat, so the code lived as chat
artifacts that were never saved. Stephen confirmed twice that the seven documents
were everything, so **the documents are the build input and that is settled.**
Do not go looking for the original source; it is gone.

Everything here was rebuilt from those documents. That was viable because
`ROSTER.md` was generated from the lost code and therefore describes it
accurately — it pins every move id, category, tier, base, upper/lower split,
ideal amplitude, special and unlock, plus all 25 opponents and 5 fits. The bible
pins the scoring multipliers and quotes `composure()` verbatim.

**The one thing genuinely lost was the animation.** `frames` for 27 moves had to
be re-authored. The bible carries real joint angles for nine of them, so those are
reconstructions rather than inventions; the other eighteen are new work.

`ROSTER-TARGET.md` is the inherited roster, kept for comparison. `ROSTER.md` is
generated from the live code by `node tools/gen-docs.js` and is the current truth.

## Doc precedence — they disagree with each other on purpose

1. `index.html` — DOM ids. It is the real shell that shipped.
2. `ROSTER-TARGET.md` — **content**. Bible body says 18 moves; roster says 27.
3. `docs/AURA-BIBLE.md` **Addendum v1.1** — overrides the bible body. Body says
   7 rounds, Addendum says 9. Nine is correct.
4. Bible body + `AURA-CULTURE.md` — **evidence**: what is documented, by whom.

Division of authority: **the research docs own evidence, the code owns content.**
Never sync them by hand — `tools/gen-docs.js` exists so you do not have to.

## What must never be changed

- **The 12 joint names are frozen.** `rot bob lean head sL eL sR eR hL kL hR kR`
  map to real bones when the 3D models land. `UPPER` and `LOWER` are bone-masking
  arrays with identical meaning for an SVG group or a three.js `SkinnedMesh`.
  Renaming anything here breaks the port.
- **Do not flatten the composure curve.** Score falls off on both sides of each
  move's `idealAmp`, harder above than below. Bigger is not better. It comes from
  Prof. Frederick Luis Aldama (UT Austin), who watched a real battle at Parque
  México and found the winner was not the high-intensity performer but the one
  with total composure. It is what makes 27 moves feel like 27 different physical
  acts, and a linear ramp would be simpler and would make the game worse.
- **`resolveExchange()` in `src/engine/battle.js` is the only place a turn outcome
  is decided.** The UI animates its result; the simulator calls it directly.
  Neither re-implements the rules, so they cannot drift. The previous version had
  the simulator mirroring turn logic by hand, which is exactly how balance bugs
  hide. If you are computing a score in `src/ui/`, you are in the wrong file.
- **No move may mock the opponent.** BAIT is self-directed clowning — falling
  over, legs giving out, cracking yourself up. Never punching at the other person.
  This is the line Costa Rica's Ministry of Public Education drew when it
  restricted these battles in schools, and competitors as young as six are
  documented. A move called "Point & Laugh" shipped in three consecutive versions
  of the original while this rule sat in a markdown file being violated. It is now
  "Losing It", and it is enforced by `test/validate.js`. **A paragraph does not
  survive contact with a code generator. A failing build does.**
- **Only 13 move ids may claim `tier:'V1'`** (CONTRACT §8). Everything else is V3
  — our original work, safe to ship and honest to label. The lint blocks quietly
  promoting an invention into a fact.

## Excluded on IP grounds, and they are all real

Documented in actual battles and still cannot ship: **Ronaldo's Siuuu** (right of
publicity plus active trademark), the **Lightning McQueen fit** the real CDMX
winner wore (Disney/Pixar), any **Fortnite emote**, any **named choreography**
(*Hanagami v. Epic* revived a claim over roughly three seconds), and the boat
dancer's **name or likeness** — he is a minor and a government-appointed
provincial ambassador, and there have already been documented scams exploiting his
fame. **Build the tradition, not the boy.** Every named real person across the
research is research-only.

## Verification

```bash
node test/validate.js       # data integrity, content safety, evidence tier
node test/balance-sim.js    # 3,000 battles per matchup x 4 policies
node test/integration.js .  # boots the real index.html in jsdom, plays a battle
npm run check               # all three, in that order
```

Three suites exist because each catches a different class of problem, and none of
them can see what the others see. `validate` catches typo'd ids and weights that
do not sum. `balance-sim` catches design problems — a dominated move, a difficulty
curve running backwards. `integration` catches a `querySelector` matching nothing,
a renamed id, a listener bound to a button that is not there.

**`integration.js` carries negative controls that each break the build on purpose
and confirm the assertion fails.** Keep them. An assertion nobody has watched fail
is decoration, and this repo has shipped several.

## Looking is part of the job

A visual change here is not done until someone has opened the screenshot. The
first pass shipped with three things wrong that every automated gate called green:
a dead band across the middle of the arena, a crowd rendered as two unrelated
visual languages, and Six-Seven — the most-used move in real battles and the first
one every player touches — raising one arm vaguely instead of both hands palms-up
in a see-saw.

Shooting it at 320x568 on purpose found two more that were invisible at 375:
`#actList` children with no `flex-shrink:0` squashing to their 56px floor and
centre-clipping the act's name off the top, and the announcer being cut
mid-sentence by a nowrap ellipsis.

Drive the real game, screenshot it, open the images, and name what is wrong before
Stephen does. A green test is not a look.

## Deploy procedure — do not skip this

```bash
node tools/stamp.js --bump    # roll BUILD to today + next letter
node tools/stamp.js           # stamp every fetched URL
node tools/stamp.js --check    # fails if anything is unstamped
npm run check                  # validate -> sim -> integration
```

⛔ **`.htaccess` deploys on this host but Cache-Control is OVERRIDDEN** — js and
css are forced to `max-age=14400` no matter what it says. A versioned URL is the
only lever that makes a deploy land. Two traps this closes, both found live on
2026-08-29 when a fix verified on the build stamp still did not reach the phone:

- **ES module imports are separate URLs.** A `?v=` on the entry point does NOT
  propagate to `import './game.js'` — every relative specifier carries its own
  stamp, which is why `stamp.js` rewrites source instead of wrapping a build step.
- **A bare `sw.js` registration is edge-pinned for seven days.** Ours was bare.

Then verify on the real domain, never localhost, and **grep the live HTML for the
new build marker** — a 200 is not evidence.

## Where it stands, 2026-08-29

Playable end to end and live behind the workbench gate, `beta:true` in the portal.
Title → fit check → **el farmeo** (solo qualifying stage) → nine-round duel →
beat them, learn their move → the circuit. 27 base moves, 25 opponents, 5 acts,
5 fits, 2 regional packs, PWA shell with real persistence.

Measured balance, base 27, no pack owned — reproduce with `node test/balance-sim.js`:

| Act | masher | varied | composed | expert |
|---|---|---|---|---|
| The Plaza | 4.2% | 70.5% | 82.8% | 98.9% |
| The Park Bracket | 1.2% | 41.7% | 63.4% | 95.8% |
| The Banned Town | 0.0% | 29.7% | 58.8% | 96.5% |
| The Capital | 0.1% | 25.5% | 46.7% | 87.6% |
| Upriver | 0.0% | 11.4% | 24.5% | 78.2% |

## Device testing, round 1 — his verdict: "coming together, still a long way to go"

One bug, and it was the main control. **The hold broke when the phone highlighted
a word.** A long-press selection fires `pointercancel`, which `timing.js` bound
straight to `release`, so the turn committed early at whatever amplitude the bar
had reached. Fixed three ways: global `user-select` + `-webkit-touch-callout:none`
on `*`; `setPointerCapture` so the pad owns the gesture; and a cancel no longer
scores. See the comments in `src/ui/timing.js`.

**Nothing else has been device-tested.** The thumb feel of hold-and-release is
still the whole game and it can only be measured here, never felt.

## Still open — the two that are Director calls

1. **Pack deck size is worth up to +7.8pp** in the Plaza. Ten extra cards against
   a three-card starting deck is a freshness engine, and freshness is the biggest
   multiplier in the game. **The advantage is COUNT, not power, so no multiplier
   fixes it** — anything that weakens pack moves weakens the base moves beside
   them. The shape of the fix is a **deck cap**: bring N moves to a fight, so a
   pack changes *which* N rather than *how many*. That is a real design change to
   the base game. Nothing ships broken today — packs are inert, no store writes
   ownership, no opponent drops one — but this is the blocker before a pack goes
   on sale. The half that IS fixed: a pack move may borrow a **body** the base
   game already has, never a **role**; four duplicated specials were stripped and
   pay-to-win went +2.5pp → +0.0pp overall.
2. **Banned Town expert sits at 96.5% against an 88% target**, and the curve runs
   backwards from the Bracket into it. Its opponents are LOWER skill (avg 0.90)
   than the Capital's (0.98) yet carry the same target, so the inherited §14 table
   contradicts the roster. Fixing it means raising his opponent skills.

## Still open — build work

- Satellite vs standalone. Built as a satellite, self-contained so it can lift out
  to a store path like FTW and Jimothy if it earns one.
- Two moves are SHADOWED, not dominated — `shades` and `freeze` have healthy value
  and the expert never picks them. Deck-diversity problem, not a dead move.
- 3D and VR are **parked, not dead** — `docs/AURA-3D-VR.md`. Headline finding:
  Google Photorealistic 3D Tiles cannot ship (no caching or offline use, forced
  visible attribution, no derived geometry, and promotional videos capped at 30
  seconds, which makes a store listing video impossible). **OpenStreetMap via
  `blender-osm` is the license-clean path** — a rendered level is a Produced Work,
  so the game does not become ODbL.
- Regional packs beyond Brazil and Argentina: Mexico, Bolivia, Costa Rica, Peru,
  Ecuador, Spain. The system is built; these are content.

## The thesis, which should survive every rewrite

The winner of the real Bellas Artes battle was a 16-year-old who took 3,000 pesos.
Asked why he does it, he said that more than for the prize, he does it to have a
good time and take his mind off things at home.

That is the game. Not getting famous, not beating everyone. A kid who has
somewhere to go on a Tuesday, in a public square that belongs to teenagers for
twenty minutes. The crowd is not set dressing — the gathering is the point. Every
environment is a public square, never a stage, and the ending is about the room,
not the ranking.

**Build the memes to get attention. Build the river to be remembered.**
