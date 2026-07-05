# ARCHITECTURE — Lucid Winds · OC Arena

A map of `lucid-winds-arena.html`. Everything is inline in one file: `<style>` (design tokens +
component CSS), `<body>` (four mount points), then one big `<script>`. Line numbers below are
approximate anchors, not contracts — grep the `/* ===== SECTION ===== */` comment banners.

## File layout (script sections, in order)

| Section | ~line | What lives there |
|---|---|---|
| DATA | 364 | Core tables: `STAT_KEYS`, `TIERS`, `ARMS`, `RACES`, `BUFF_BASE`, `POWERS`, `STAND_ARCHETYPES`, `AUGMENTS` |
| SKILL WEB BUILDER | 489 | `MINOR_POOLS`, `NOTABLES`, `KEYSTONES`, `HYBRID_KEYS`, `buildTree()` → `const TREE` |
| UTIL | 661 | `clamp/rand/randInt/pick/uid/esc/grade` |
| STATE | 694 | `state`, `tmp`, `Store`, `migrateOC`, `loadState/persist`, XP/level helpers |
| MODIFIERS / STATS | 744 | `freshM/applyKeystone/applyNodeEffect/aggregateMods`, `computeFinal/ocStats` |
| COMBAT | 807 | `applyRacePassive`, `enrichProc`, `deriveCombat`, `hitDamage`, `simulate` |
| RENDER CORE | 1071 | mount refs, `toast`, `topbar`, `renderNav`, `ocCard`, `miniOC` |
| HOME | 1137 | `screenHome` |
| CREATION | 1152 | draft model + wheel/roll/powers/name steps + `finalizeOC` |
| CHARACTER SHEET | 1291 | `screenSheet` + tabs (overview/web/powers/train) + tree render/interaction/allocation |
| BATTLE | 1573 | picker + `runBattle` + `battleStage` |
| TOURNAMENT | 1644 | `runTournament` + `tourneyStage` |
| ALLIANCES | 1697 | factions |
| RENDER LOOP | 1729 | `render()` (screen switch), `goto()` |
| EVENT DELEGATION | 1752 | `handleAct` switch, `document` click/input/change listeners |
| BOOT | 1840 | `boot()` → load save → first `render()` |

---

## Data model

### An OC (character) — the persisted unit
```js
{
  id, name, race,                 // race is a RACES[].key
  emoji, art,                     // avatar: art (image URL) overrides emoji
  baseStats: {str,dur,sta,int,spd,cmb},   // the ROLL + race mods, plus Glory "conditioning"
  powers: [ Power, … ],
  record: {w, l},
  level, xp,                      // xp is progress within current level
  tree: { allocated: [nodeId, …] } // always includes the race start node (free)
  createdAt
}
```

### A Power (entry in `oc.powers`)
```js
{ key,            // POWERS[].key, or "stand"
  effect,         // POWERS[].effect ("buff_str" | "proc" | "flight" | … | "stand")
  tier,           // TIERS[].key: novice|adept|expert|master  → also = socket count
  arch,           // stands only: STAND_ARCHETYPES[].key
  augments: []    // support-gem keys, length ≤ socket count (tier index + 1)
}
```
`POWERS[]` carry static `tags` and (for actives) a `kind`. Only powers where `effect === "proc"` (or a
Stand) are **augmentable** (`isAugmentable`). Tags: damage types `physical force fire mind void` +
behavioral `projectile melee area dot`. Basic attacks are implicitly `["physical","melee"]`.

### `AUGMENTS[]` — support gems
Each has `{key,name,emoji,desc, req?, mods}`. `req` (optional) gates it to a tag (e.g. Greater
Projectiles needs `projectile`; inert if socketed on a skill lacking it). `mods` vocabulary consumed in
`enrichProc`/`hitDamage`:
`extraHits, localInc, localMore, localCrit, localCritMult, procMult, addDot{type,pctOfHit,turns},
leechThis, noMiss, noAilment, secondary, knockback, cull, ruthless`.

### `RARITY[]` — loot grades (rarity 2.1)
7 grades (Common→Cosmic) with `{mult,hits,color,weight}`. Ownership carries the grade:
`ownedAugments = [{key,grade}]` (one gem per key); sockets store just the key and resolve the grade
via `sockets(p)`/`augGradeOf` at combat + render time (so a Reforge upgrades a gem everywhere). In
`enrichProc` a grade scales numeric upsides ×`mult` and downsides ÷`mult`, and adds `hits` strikes to
hit-adding gems — always inside the existing clamps. `rollGrade` (weighted) picks a grade on learn;
`reforgeAug` gambles Glory to push an owned gem's grade **up** (keeps the higher). **OC grade:**
`ocGradeScore`/`ocGrade` fold build investment + socketed gem rarity into a Common→Cosmic badge
(`OC_GRADE_CUT` thresholds). See `RARITY_DESIGN.md`.

### `ASCENDANCIES[]` — subclasses (2.2)
4 subclasses, each a `nodes[]` mini-tree; node effects reuse the tree-node vocab (`applyNodeEffect`),
signature nodes are keystone-like via `asc_*` cases in `applyKeystone`. `oc.ascendancy = {key,allocated}`
(migrated + pruned in `migrateOC`); `aggregateMods` folds allocated ascendancy nodes alongside the tree.
Unlock `ASC_UNLOCK_LEVEL`; point pool `ascPointsTotal` (1 at unlock, +1/6 levels, cap 5). UI is the
`tabAscend` "Class" sheet tab (`chooseAsc`/`allocAsc`/`refundAsc`/`resetAsc`).

### `JEWELS[]` — rarity-graded tree sockets (2.3)
`JEWEL_SOCKET_IDS` marks a few `buildTree` minors as `type:"jewel"` (same position/edges → connectivity
unchanged). Jewels are owned like gems (`state.ownedJewels=[{key,grade}]`; `buyJewel`/`reforgeJewel`
reuse `rollGrade`); `oc.tree.jewels={nodeId:jewelKey}`. `aggregateMods` folds jewels in ALLOCATED
sockets, grade-scaled via `scaleEffect` (node-effect vocab); `growth` scales with allocated count. UI:
socket picker on the node panel (`openJewelPicker`, `socketJewel`/`unsocketJewel`) + `jewelLibraryHTML`
in the Powers tab. Cyan-diamond nodes in `treeSVG`.

### Global state (`state`)
`glory, roster[], alliances[], ownedAugments[]` (persisted) and view state
`screen, draft, battle, battleSel, tourney, sheetId, sheetTab, treeSel, treeView, augPick`
(not persisted). `tmp` holds transient form fields (alliance name/color).

---

## The passive tree (`buildTree` → `TREE`)

`TREE = { nodes[], byId{}, edges[[a,b],…], startByRace{} }`, built once at load, **deterministic**
(pure function of indices — no RNG, so the tree is identical every run).

- **6 arms** (`ARMS`), each with a theme + color + base angle: Might, Psyche, Ruin, Vitality, Tempo,
  Aegis. A central **`hub`** node connects the innermost node of every arm.
- **Rings** per arm (`RING_SLOTS`/`RING_RADIUS`/`RING_WIDTH`, center via `CENTER_SLOT`): nodes are laid
  out in polar coords (`polar()`). Minor nodes get themed effects cycled from `MINOR_POOLS`.
- **Notables** (`NOTABLES[arm]`) overwrite the center slot of specific rings; **keystones**
  (`KEYSTONES[arm]`) sit on each arm's rim (ring 5). Two **hybrid keystones** (`HYBRID_KEYS`: Glass
  Cannon, Blood Engine) are bridge nodes wired to two arms' ring-4 centers.
- **Edges**: within-arm (neighbors + nearest inner-ring), hub↔arm starts, a **ring-3 outer loop**
  linking arms into a web, and hybrid links. `addEdge` keeps a symmetric `neighbors[]` on each node.
- **`startByRace`**: race → start node id. `"hub"` for Human (flexible), else that race's arm's ring-1
  center. `migrateOC` guarantees the start node is allocated (free).
- Current inventory: **105 nodes** (1 hub, 78 minor, 18 notable, 8 keystone), 172 edges. `describeEffect`
  turns a node `effect` into human text for the UI.

**Allocation rules** (enforced in UI + tested): a node is allocatable iff adjacent to an allocated node
and `pointsAvail(oc) > 0`. Refund allowed iff `canRefund` (BFS from start over the remaining set stays
connected). `respecTree` clears to just the start for Glory. Points come from level:
`pointsTotal = 3 + (level-1) + floor(level/10)*2`.

---

## The modifier pipeline (the heart)

PoE-style **increased (additive) vs more (multiplicative)**. Four stages:

1. **`aggregateMods(oc)` → `M`.** Folds every allocated node's `effect` (via `applyNodeEffect`, and
   `applyKeystone` for keystone flags) into one profile: `statAdd`, `incGeneric`, `incTag{}`, crit/acc/
   eva/armor/life/regen/leech/dot/block/atkSpeed adds, `moreGlobal` (multiplicative), `dmgTakenInc`,
   `abilityMore/abilityProc/execBonus`, `lifeMult/spdMult`, and boolean keystone flags
   (`resolute, berserkersPact, aetherOverflow, cannotBeCrit, secondWind, bloodEngine, …`).
2. **`computeFinal(oc)` → `{final, base, buffAdd, treeAdd, M}`.** `final[k] = clamp(base + buff-power
   bonus + M.statAdd, 1, 160)`. `ocStats(oc)` = just `.final` (what cards/sheet show).
3. **`deriveCombat(oc)` → `F`.** Turns final stats + `M` + per-power flags into a ready fighter:
   `maxHp, atk, crit, critMult, acc, eva, flatDR, negate, regen, leech, procs[], revivesLeft`, etc.
   Utility powers set flags here (flight/regen/shield/teleport/precog/crit_up/invis/shapeshift/berserk/
   necrotic/venom). Active powers become **enriched proc entries** via `enrichProc` (augment `mods`
   folded in: hit count, local inc/more/crit, added DoTs, leech, cull, knockback, proc-chance, pierce).
   `applyRacePassive` then layers race innates; `M.secondWind` adds a revive.
4. **`hitDamage(att, def, base, tags, opts)`.** The single damage formula:
   `dmg = base * (1 + increased) * more`, then `× critMult` (if crit), then subtract pierced flat DR,
   floor at 1, then `× (1 + defender.dmgTakenInc)`. `increased` = generic + Σ tag increases + local;
   `more` = `moreGlobal × (1+localMore) ×` conditional mores (berserk-at-low-life, draconic-fury,
   berserker's pact, aether-overflow ability/basic split, execute bonus).

### `simulate(ocA, ocB)`
Initiative by speed (+flight), then a round loop until someone dies or `MAX=200`. Each turn: tick DoTs →
revive check → stun check → regen → act. `act()` rolls each proc's chance (fire `firePower`, which loops
`extraHits`, applies added DoTs/leech/knockback/cull, respects `warpMax`/`timeMax` caps and Time's
free extra action); if none proc, `basic()` (evasion/madden/negate/counter, crit unless `resolute`/
defender `cannotBeCrit`, on-hit leech/acid/DoT). Speed/`extraAtk` grant up to 2 bonus actions/turn.
Returns `{winnerName, winnerIsA, log[], rounds, hpTimeline[], gloryBonus, xpBonus}`. If both alive at
the cap → HP%-ratio tiebreak. **This cap + tiebreak is the guarantee that fights always end.**

Rewards are applied by the callers (`runBattle`, `runTournament`) via `battleRewards`, then `grantXP`
(which may level up → more passive points) and `persist()`.

---

## Rendering & interaction (vanilla, no framework)

- `render()` picks a screen builder by `state.screen`, sets `#app.innerHTML`, preserves scroll when the
  screen "signature" is unchanged (so tree allocation doesn't jump), and calls `setupTree()` when the
  web tab is open.
- **Delegation:** ONE `document` `click` listener resolves `e.target.closest('[data-act]')` and calls
  `handleAct(act, el, e)` — a big switch that mutates `state`, `persist()`s, and `render()`s. `input`
  handles `data-field` (draft name/art, alliance fields) without re-rendering (keeps focus); `change`
  handles the alliance `<select>`. **Listeners are attached once at module load and survive re-renders.**
- **Skill web:** `treeSVG(oc)` emits an SVG string (edges, then nodes colored by allocated/reachable/
  locked, then notable/keystone labels) inside a `<g id="treeG">` transformed by `state.treeView`
  (`{x,y,scale}`). `setupTree()` binds pan (pointer drag), zoom (buttons + wheel), and tap-to-select to
  the freshly-rendered SVG each render. `selectNode()` updates the side panel + node stroke via targeted
  DOM so the pan/zoom isn't reset; `allocNode`/`refundNode` do a full `render()` (state preserved).
- **Modals** (`openModal/closeModal`) power the augment socket picker; backdrop click closes (guarded so
  clicks inside the modal don't).

---

## Persistence

`Store` (in STATE) tries `window.storage` (artifact host) → `localStorage` → in-memory, JSON-encoded,
**never throwing**. `SAVE_KEY = "lucidwinds_arena_v2"`. `persist()` debounces writes. `loadState()`
hydrates and runs every OC through `migrateOC()` to backfill v2 fields (level/xp/tree-start/per-power
`augments`) and seeds `ownedAugments` with `STARTER_AUGMENTS`.

## Economy (three separate axes — keep them separate)

- **Aether** — creation-only budget (`BASE_AETHER` + race bonus) spent on powers/mastery/stat-enhance.
- **Glory** — earned from fights; spent post-creation on mastery, augments, stat conditioning, respec.
- **XP → Levels → Passive points** — earned from fights/montages; the only source of skill-web points.

## Testing hooks

`test/harness-core.js` extracts the inline `<script>`, appends a `globalThis.__API = {…}` export of the
symbols in its `EXPORTS` list, and runs it in a VM with DOM stubs. If you add a symbol tests need,
add its name there. See `test/stress.js` (combat fuzzing) and `test/validate.js` (tree/invariants/
balance) for how the internals are exercised.
