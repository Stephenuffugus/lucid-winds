# RARITY DESIGN — Power Scalers (Lucid Winds · OC Arena)

Status: **PROPOSAL — pending Stephen sign-off (Jul 05).** Do not implement until approved.
Direction chosen: **BOTH** layers, built in sequence — **loot rarity first (2a)**, then an
overall **OC grade (2b)** that rare loot feeds into.

Guiding constraints (from CLAUDE.md): single self-contained file, no framework/build;
invariants preserved (fights terminate, damage floors at 1, everything clamped, saves migrate);
one change at a time; `npm run check/stress/validate` after every edit.

---

## The ladder (shared with the whole Lucid Winds ecosystem)

7 grades, same names + colors as the main game's Terra Grade:
**Common · Uncommon · Rare · Epic · Legendary · Mythic · Cosmic**

---

## Phase 2a — LOOT RARITY (build this first)

### What carries rarity
**Augments (support gems) first.** Each augment *instance* gets a grade. (Jewels, roadmap #1,
adopt the same system when added.) Powers themselves stay ungraded — their strength is their
tier/mastery; rarity rides the modular, socketable, *collectible* layer, which is the natural
home for a loot chase.

### How a grade scales an augment
Each grade multiplies the augment's numeric mods (`localInc`, `localMore`, `addDot.pctOfHit`,
`procMult`, crit, leech…) and steps up discrete mods (`extraHits`) at the top tiers. Proposed
curve (a real chase, but every value still folds through `aggregateMods`/`enrichProc` and
**clamps** — so fights still terminate; verified by `npm run stress`):

| Grade | numeric ×mult | extraHits bonus |
|---|---|---|
| Common | 1.00 | +0 |
| Uncommon | 1.15 | +0 |
| Rare | 1.35 | +0 |
| Epic | 1.60 | +1 |
| Legendary | 1.90 | +1 |
| Mythic | 2.25 | +1 |
| Cosmic | 2.75 | +2 |

(Steepness is **DECISION 2** below — this is the "moderate-steep / real power chase" option.)

### How you GET rarer loot (the loop — self-contained Glory only, no Sunbeams)
Recommended (**DECISION 1**): **roll-on-learn + a Glory reforge sink.**
- Learning/buying an augment with Glory rolls its grade on a weighted table.
- A **Reforge** button spends Glory to re-roll an owned augment's grade (the upgrade chase);
  cost scales so chasing Cosmic is a real Glory sink.
- Proposed drop weights (tunable): Common 45 / Uncommon 27 / Rare 16 / Epic 8 / Legendary 3 /
  Mythic 0.9 / Cosmic 0.1.

### Data + migration (non-breaking)
- Socketed augment entries: bare `key` → `{key, grade}`. `ownedAugments`: `[key]` → `[{key,grade}]`.
- `migrateOC()` backfills every legacy augment → `"common"`. `SAVE_KEY` unchanged (shape is
  additive/back-compatible).

### UI
Grade color on augment chips in the picker + on socket chips; a legend; a **Reforge** action
(`data-act="reforge-aug"`) in the augment/socket panel. Mobile-first, ≥40px taps, delegated.

### Tests (definition of done for 2a)
- `npm run stress` — rarer mods must still: no crash, no NaN, all terminate, clamps hold.
- `npm run validate` — unaffected.
- New `test/mechanics.js` assertion: a Cosmic augment's derived proc > the same augment at
  Common, and the aggregate still clamps.
- `CHANGELOG.md` + a `DEVELOPMENT.md` recipe ("add/grade an augment").

---

## Phase 2b — OC GRADE (after 2a lands)
Each OC gets an overall Common→Cosmic **grade** computed from its build: keystones linked,
stat spread, tree completeness, **and the rarity of socketed augments** (so rare loot literally
raises your character's grade). Shown as a badge on the OC card. Spec expands once 2a is in.

---

## Build order (small, tested increments)
1. `RARITY` table + weighted roll + grade→scale in `enrichProc` (data/scaling) → stress.
2. Migration + `ownedAugments`/socket shape change → validate + load an old save.
3. Reforge Glory sink + acquisition roll → stress + manual Glory round-trip.
4. UI (colors, legend, reforge button) → mobile check.
5. `test/mechanics.js` assertions. Then open Phase 2b.
