# Changelog

Format: reverse-chronological. This is a single-file app; "version" = the `SAVE_KEY` era + notable
feature sets. Update this on meaningful changes.

## [2.1.0] — Loot rarity + OC grade (current)
Save key unchanged (`lucidwinds_arena_v2`); shape is additive and migrates forward
(`normalizeOwned` upgrades pre-rarity saves; every legacy gem becomes Common).

Added
- **Loot rarity**: every augment carries one of 7 grades on the shared Lucid Winds ladder
  (Common → Uncommon → Rare → Epic → Legendary → Mythic → Cosmic). A grade scales the gem's
  numeric upsides up and shrinks its downsides (so a higher grade is strictly better) and adds
  extra strikes to hit-adding gems at the top tiers. `RARITY` table + `enrichProc` scaling.
- **Roll-on-learn + Reforge**: learning a gem rolls a weighted grade; the **Reforge** Glory sink
  gambles to push an owned gem's grade **up** (never down). Grade lives on the owned gem, so a
  reforge upgrades it everywhere it's socketed.
- **OC overall grade**: each character gets a Common→Cosmic grade from build investment
  (keystones, notables, tree points, stats, level) **plus socketed gem rarity** — rare loot
  raises your character's grade. Shown on roster cards + the sheet header.
- Grade-colored gem chips, socket tints, a rarity legend, and grade badges throughout.

Validated
- 29,000 fights with Cosmic gems fuzzed into every socket: 0 exceptions, 0 NaN, all terminate.
  Clamps (extraHits ≤ 5, proc chance ≤ 0.9) hold at max grade.
- `test/mechanics.js` locks the grade-scaling contract (Cosmic strictly > Common; clamps survive
  stacked Cosmic). jsdom render smoke confirms the grade UI boots + renders.

## [2.0.0] — Path-of-Exile expansion
Save key: `lucidwinds_arena_v2`. Old v1 saves auto-migrate via `migrateOC`.

Added
- **Passive skill web**: deterministic 105-node graph (6 themed arms + hub), pannable/zoomable SVG,
  connectivity-based allocation, refund guarded by a BFS connectivity check, full respec (Glory).
  18 notables + 8 keystones (Resolute Technique, Glass Cannon, Blood Engine, Berserker's Pact,
  Unwavering Stance, Untouchable, Aether Overflow, Undying Rage).
- **Support augments** (support gems): 18 augments that transform active skills (Multistrike, Greater
  Projectiles, Overcharge, Chain, Elemental Ignite, Precision, Culling, Brutality, …). Mastery tier =
  socket count (1→4). Augment library bought with Glory.
- **Levels & XP**: fights + Training Montage grant XP; levels grant passive points.
- **Damage tags** (`physical force fire mind void` + `projectile melee area dot`) threaded through a new
  modifier pipeline (`aggregateMods` → `computeFinal` → `deriveCombat` → `hitDamage`) using an
  increased-vs-more model.
- **Character Sheet** (tabs: Overview / Skill Web / Powers & Augments / Train), opened by tapping a card.
- Stat breakdown table; keystone/level badges on cards; XP bars.

Changed
- Combat engine reworked to consume the modifier profile and per-power augment transforms.
- Bottom nav reduced to Roster / Battle / Tourney / Allies (per-character depth moved to the sheet).
- Rewards now grant XP in addition to Glory.

Validated
- 29,000 simulated fights: 0 exceptions, 0 NaN/Infinity, all terminate within the 200-round cap
  (avg ~5.6 rounds; ~0.26% resolved by HP% tiebreak).
- Tree fully connected; all race starts valid; 0 refund-invariant violations across 20,000 fuzz tests.

## [1.0.0] — Base arena
Save key: `lucidwinds_arena` (superseded).
- OC creation (race wheel, stat roll, powers with mastery tiers, naming/skinning), narrated 1v1 battles,
  single-elimination tournaments, training, alliances. Persistence with feature-detected storage.
- Combat stress-tested (40k fights) for termination and numeric safety.
