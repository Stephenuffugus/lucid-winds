# Lucid Winds — OC Arena

A single-file browser game for the Lucid Winds portal. Create original characters, grow them on a
Path-of-Exile-style **passive skill web**, transform their powers with **support augments**, and throw
them into an auto-battling arena.

- **One file, zero setup.** `lucid-winds-arena.html` contains all HTML/CSS/JS inline. Open it in a
  browser, host it anywhere, or drop it in an `<iframe>`. No build, no dependencies, works offline.
- **Mobile-first.** Designed to be created and played on a phone.
- **External art pipeline.** Characters take an image URL (Midjourney/your art) or an emoji — the game
  itself generates no art.

## Run it

Just open `lucid-winds-arena.html` in any modern browser. That's it.

To run the developer checks you need Node ≥ 18:

```bash
npm test          # syntax + combat stress (29k fights) + tree/invariant validation
# individually:
npm run check     # inline-script syntax + structural checks
npm run stress    # random-build fight fuzzing (no crash / no NaN / all terminate)
npm run validate  # tree connectivity, refund invariant, balance spread
```

## What's in the game (v2)

**Create** — spin a wheel for one of **10 races** (each with stat leanings, an innate trait, discounted
"affinity" powers, and a skill-web start location), roll six core stats (STR/DUR/STA/INT/SPD/CMB), spend
**Aether** on **22 powers** across Buffs / Offense / Utility (Stand Users pick one of 4 Stand
archetypes), master them, enhance stats, then name and skin the character.

**Grow** (per-character sheet, opened by tapping a card):
- **Skill Web** — a pannable/zoomable node graph (105 nodes across 6 themed arms) with 18 named
  *notables* and **8 build-defining *keystones*** (Resolute Technique, Glass Cannon, Blood Engine,
  Berserker's Pact, Unwavering Stance, Untouchable, Aether Overflow, Undying Rage). You path outward
  from your race's start; connectivity matters; refunds can't break the web.
- **Powers & Augments** — socket **18 support augments** (Multistrike, Greater Projectiles, Overcharge,
  Chain, Elemental Ignite, Precision, Culling, Brutality…) into active skills to transform them. A
  skill's mastery tier sets its number of sockets (1→4). Learn more powers/augments with Glory.
- **Train** — condition stats or run a Training Montage for XP; respec the web.

**Compete** — 1v1 **Duels** with a narrated round-by-round log, single-elimination **Tournaments**
(4/8), and **Alliances** (factions). Wins pay **Glory** and **XP**; XP grants **levels → passive
points**.

**Damage tags** (`physical force fire mind void` + `projectile melee area dot`) run through everything,
so tree nodes and augments scale the right skills — the same power plays very differently depending on
your tree and links.

## Repo layout

```
lucid-winds-arena.html   ← the game (single source of truth; edit this)
CLAUDE.md                ← working agreement for Claude Code (read first)
ARCHITECTURE.md          ← how the code is structured
DEVELOPMENT.md           ← recipes: add a race / power / augment / tree node / tab
ROADMAP.md               ← prioritized next features with implementation notes
CHANGELOG.md             ← version history
package.json / test.sh   ← test runners (Node)
test/
  harness-core.js        ← loads the inline script headlessly for testing
  syntax-check.js        ← compile + structure checks
  stress.js              ← combat fuzzing
  validate.js            ← tree/invariant/balance checks
```

## Persistence

Saves to `window.storage` if present, else `localStorage`, else in-memory (feature-detected, never
throws). Save key: `lucidwinds_arena_v2`. Old saves are migrated forward automatically.

## Status

v2 build validated: 29,000 simulated fights with zero crashes / zero NaN / all terminating within the
200-round cap; full tree connectivity; 0 refund-invariant violations across 20,000 fuzz tests.
