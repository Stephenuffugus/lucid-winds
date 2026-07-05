# Changelog

Format: reverse-chronological. This is a single-file app; "version" = the `SAVE_KEY` era + notable
feature sets. Update this on meaningful changes.

## [2.0.0] — Path-of-Exile expansion (current)
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
