# DEVELOPMENT — recipes for extending OC Arena

Concrete, copy-pasteable steps for the common "add content" tasks. All edits are in
`lucid-winds-arena.html` (single file). After each, run the checks noted at the end of the recipe.

General rules: content goes in the `const` tables (DATA / SKILL WEB BUILDER sections); UI actions get a
`data-act` + a `case` in `handleAct`; new persisted fields get a default in `migrateOC`. Keep values
clamped and the design tokens/aesthetic intact.

---

## 1) Add a race

Append to the `RACES` array (DATA section). Every field matters:

```js
{ key:"gorgon", name:"Gorgon", color:"#8FD14F", emoji:"🐍", aetherBonus:0,
  startArm:"psyche",                         // ARMS key, or "hub"; sets skill-web start
  blurb:"Serpentine seers whose gaze turns hesitation to stone.",
  mods:{str:4,dur:6,sta:2,int:12,spd:6,cmb:8}, // added to the roll (can be negative)
  affinity:["telekinesis","venom_strike","precognition"], // discounted at creation
  passive:{ name:"Petrifying Gaze", desc:"Chance to briefly stun on a landed hit." } },
```

Then wire the innate in `applyRacePassive(F, raceKey)` (COMBAT section) — set flags on `F`:
```js
case "gorgon": F.petrify = 0.12; break;   // then consume F.petrify in simulate()'s basic()
```
If the passive needs new combat behavior, read the flag in `simulate` (e.g. in `basic()` after a hit:
`if (att.petrify && Math.random() < att.petrify) def.stun = Math.min(1, def.stun+1);`). Keep any
stun/extra-turn effect bounded so fights still terminate.

`startByRace` is derived automatically from `startArm` in `buildTree`. No other change needed.

**Check:** `npm run stress` (new race + passive) and `npm run validate` (start node).

---

## 2) Add a power

Append to `POWERS` (DATA). Pick the archetype:

**Buff** (permanent stat bump):
```js
{ key:"titan_heart", name:"Titan Heart", emoji:"💗", cat:"buff",
  effect:"buff_sta", base:20, tags:[], desc:"Raises Stamina." },
// also add its base magnitude to BUFF_BASE:
//   BUFF_BASE.titan_heart = 24;   // scaled by tier mult (0.30→1.05)
```

**Active / augmentable** (procs in combat, can hold support augments):
```js
{ key:"frost_lance", name:"Frost Lance", emoji:"❄️", cat:"offense",
  effect:"proc", kind:"blast", base:26, tags:["force","projectile"],
  desc:"Hurl a shard of ice. Ranged; pierces some Durability." },
```
`kind` must be one the combat engine knows: `blast | fire | tk | warp | time` (Stands also use
`srange`). To add a **new kind**, extend `PROC_BASE` (base proc chance), `baseFnFor(kind)` (damage
formula + set `pierce` in `enrichProc`), and handle any special behavior in `simulate`'s `firePower`
(e.g. `warp`/`time` have use-caps). Reuse an existing kind if you just want new flavor/tags.

**Utility** (sets a combat flag, not augmentable):
```js
{ key:"stoneform", name:"Stoneform", emoji:"🪨", cat:"utility",
  effect:"stoneform", base:22, tags:[], desc:"Harden: big flat damage reduction, lower speed." },
```
Then handle `effect` in `deriveCombat`'s power loop:
```js
case "stoneform": F.flatDR += 10*m; F.spd = Math.max(1, Math.round(F.spd*(1-0.15*m))); break;
```
(`m = tierMult(p.tier)`.)

**On-hit** (like necrotic/venom): set `F.dotOnHit = {type, pct, turns}` in the power loop.

Powers are learnable post-creation automatically (the Powers tab lists everything not owned). No UI
change needed.

**Check:** `npm run check` + `npm run stress`.

---

## 3) Add a support augment (support gem)

Append to `AUGMENTS` (DATA). Compose from the `mods` vocabulary — no engine change needed if you reuse
existing keys:

```js
{ key:"pierce", name:"Pierce", emoji:"➶", req:"projectile",
  desc:"Projectiles ignore more armor, at a little less damage.",
  mods:{ localMore:-0.1 } },  // (for true armor-pierce, add a mod key — see below)
```
`mods` keys understood today: `extraHits, localInc, localMore, localCrit, localCritMult, procMult,
addDot{type,pctOfHit,turns}, leechThis, noMiss, noAilment, secondary, knockback, cull, ruthless`. `req`
(optional) makes the augment inert unless the skill has that tag.

To add a **new mod key**, fold it in two places:
- `enrichProc` (COMBAT): read `a.mods.yourKey` into the returned proc entry `A`.
- `firePower`/`hitDamage`: apply it when the proc resolves.

Augments are bought with Glory in the Powers tab (`buyAug`) and socketed per power; socket count = the
skill's mastery tier. No UI change needed to list a new augment.

**Check:** `npm run stress` (augment folding can't produce NaN/hangs).

---

## 4) Add / change a tree notable, keystone, or node

**Notable** — add to `NOTABLES[arm]` (SKILL WEB BUILDER). `ring` targets that arm's ring; it overwrites
the ring's center slot:
```js
// inside NOTABLES.ruin[]
{ ring:2, name:"Bloodhound", effect:{ critChanceAdd:0.08, execBonus:0.1 },
  desc:"+8% crit chance and +10% damage vs low-life foes." },
```
`effect` keys recognized by `applyNodeEffect`: `stat{}, incTag{}, incGeneric, critChanceAdd,
critMultAdd, accuracyAdd, evasionAdd, armorFlat, lifePct, regenAdd, leechPct, blockChance, atkSpeedAdd,
dotMore, abilityMore, abilityProc, execBonus, keystone`. Add a new key by handling it in
`applyNodeEffect` (→ `M`) and consuming it in `deriveCombat`/`hitDamage`, and give it text in
`describeEffect`.

**Keystone** — arm-rim keystones live in `KEYSTONES[arm]`; hybrids in `HYBRID_KEYS`. A keystone is a
named flag:
```js
// KEYSTONES.tempo
{ name:"Perfect Reflexes", keystone:"perfect_reflexes",
  desc:"Cannot be hit by basic attacks below 3 evasion… (define the rule)." },
```
Then implement the flag: set it in `applyKeystone(M, k)` (add a `case`), carry it onto `F` in
`deriveCombat`, and enforce it in `hitDamage`/`simulate`. **Keystones must be real tradeoffs** — give a
downside, and make sure the upside can't break the round cap.

**Minor node effects / arm identity** — tweak `MINOR_POOLS[arm]` (the cycled small effects).

**Tree shape** — ring sizes/radii/spread are `RING_SLOTS`, `RING_RADIUS`, `RING_WIDTH`, `CENTER_SLOT`;
cross-links are added at the bottom of `buildTree` (hub links, the ring-3 outer loop, hybrid wiring).
Keep the graph fully connected.

**Check:** `npm run validate` (connectivity + refund invariant + keystone count) and — if you added
combat-affecting effects — `npm run stress`.

---

## 5) Add a tab to the character sheet

1. Add to `SHEET_TABS` (CHARACTER SHEET section): `{k:"codex", n:"Codex"}`.
2. Write `tabCodex(oc)` returning an HTML string; branch to it in `screenSheet`.
3. Any buttons emit `data-act="…"` handled in `handleAct`.

## 6) Add a new top-level screen

1. Add a nav entry to `NAV` (RENDER CORE): `{k:"codex", ic:"📖", n:"Codex"}`.
2. Write `screenCodex()`; add a `case "codex"` in `render()`.
3. Navigate with `data-act="nav" data-k="codex"` (already handled by the `nav` case).

## 7) Add an event action or form field

- Clickable: render `data-act="myThing" data-id="…"`, add `case "myThing":` in `handleAct`.
- Text input: `data-field="myField"`, handle in the `input` listener (update `state`/`tmp`; avoid
  re-render to keep focus).
- Select: `data-act="myThing"` on the `<select>`, handle in the `change` listener (the `click` listener
  ignores `SELECT`).

---

## Where the balance knobs live

- **Stat → combat conversion:** `deriveCombat` (maxHp, atk, crit, acc, eva, flatDR formulas).
- **Damage model:** `hitDamage` (increased vs more; conditional mores).
- **Proc chances & skill damage:** `PROC_BASE`, `baseFnFor`, and `enrichProc` (chance clamp, pierce).
- **Buff magnitudes:** `BUFF_BASE` × `TIERS[].mult`.
- **Costs:** creation `buyCost`/`upgradeCost`; Glory `masteryUpCostG`/`learnCostG`/`augCost`/
  `trainStatCostG`/`montageCostG`/`respecCost`.
- **Rewards / XP curve:** `battleRewards`, `xpNeeded`, `pointsTotal`, `grantXP`, tournament bonuses in
  `runTournament`.
- **Safety:** `MAX` round cap and the tiebreak in `simulate`; the `clamp` ceilings throughout. Don't
  loosen these without re-running `npm run stress`.

If a balance change is intentional and trips a *threshold* assertion in `test/validate.js` (e.g. the
non-degenerate balance spread), update that assertion and note it in `CHANGELOG.md`.

## Tune loot rarity

Rarity is data-driven from the `RARITY` table (near `AUGMENTS`): each grade has `mult` (scales a
gem's numeric mods — upsides ×mult, downsides ÷mult in `enrichProc`), `hits` (extra strikes added to
hit-adding gems), `color`, and `weight` (roll-on-learn odds; `rollGrade` picks weighted).

- **Make rarity hit harder / softer:** edit `mult`/`hits` in `RARITY`. Keep the aggregate clamps
  (`extraHits ≤ 5`, `chance ≤ 0.9`) intact — then `npm run stress` (must stay 0 NaN / all terminate)
  and `npm run mechanics` (Cosmic must still beat Common; clamps hold).
- **Change drop odds:** edit `weight`. **Reforge cost:** `reforgeCostG()`. **Learn cost:** `augCost()`.
- **OC grade feel:** `ocGradeScore` weights + the `OC_GRADE_CUT` thresholds. Rare socketed gems feed
  the score (that's the “rare loot raises your grade” link) — re-run `npm run mechanics` after edits.
- Grade lives on the **owned** gem (`ownedAugments = [{key,grade}]`); sockets resolve it via
  `sockets(p)`/`augGradeOf` at combat + render time, so a Reforge upgrades a gem everywhere at once.

## Add / tune an ascendancy (subclass)

Subclasses live in the `ASCENDANCIES` table (near `RARITY`). Each is `{key,name,emoji,color,desc,
nodes:[{id,name,desc,effect}]}`. Node `effect` uses the **same vocab as tree nodes** (`applyNodeEffect`);
for a keystone-like node (upside + downside) set `effect:{keystone:"asc_<key>"}` and add a `case` in
`applyKeystone`. `ASC_NODE_BY_ID` is built automatically; `aggregateMods` folds allocated nodes.

- **New subclass:** add an `ASCENDANCIES` entry (keep node ids globally unique, prefixed like `jug_`),
  plus any new `asc_*` keystone cases. `migrateOC` prunes nodes to the chosen subclass, so no other
  wiring is needed. Then `npm run stress` (the harness fuzzes subclasses) + `npm run mechanics`.
- **Tune unlock / pace:** `ASC_UNLOCK_LEVEL` and `ascPointsTotal` (1 at unlock, +1 every 6 levels, cap 5).
- Give every keystone-like node a real downside (life/damage-taken/speed) — the stress cap-hit rate is a
  good smell test that defensive stacks still terminate.

## Add a jewel / jewel socket

Jewels live in the `JEWELS` table (near `ASCENDANCIES`): `{key,name,emoji,desc,mods}` where `mods` is
node-effect vocab (`incGeneric`, `incTag`, `stat`, `critChanceAdd`, `leechPct`, `armorFlat`…); optional
`scalePerNodes:{per,pct}` scales with allocated node count. `JEWEL_BY_KEY` is auto-built; a grade scales
the mods via `scaleEffect` in `aggregateMods`.

- **New jewel:** add a `JEWELS` entry (unique key). It flows through learn/reforge/socket + grade
  scaling automatically. `npm run stress` (harness fuzzes jewels) + `npm run mechanics`.
- **Move/add a socket:** edit `JEWEL_SOCKET_IDS` (node ids like `a<arm>_r<ring>_<slot>`; pick non-center,
  non-ring-5 minors so you don't overwrite a notable/keystone). `npm run validate` confirms connectivity
  (105/172/0) is unaffected.
- Jewels are owned globally (`state.ownedJewels`), so one graded jewel can be socketed in one place at a
  time — its grade lives on the owned jewel and a Reforge upgrades it wherever it's slotted.
