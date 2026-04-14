# Companion Leveling + Affinity System — Implementation Spec

Ready-to-code spec once family assignments are approved.

## Storage keys

| Key | Shape | Purpose |
|---|---|---|
| `lw_companion_timer` | `{ compIdx: { totalMs: N, activeSinceMs: ts|null } }` | Cumulative equipped time per companion idx. When equipped, `activeSinceMs` set; when unequipped, elapsed added to `totalMs`, `activeSinceMs` cleared. |
| `lw_companion_family_seen` | `{ compIdx: firstSeenMs }` | First time player discovered a companion. For Book of Secrets. |
| `lw_companion_l3_unlocked` | `{ compIdx: true }` | Marks L3 ability unlocked (for one-time toast). |
| `pw_active_companion` | existing | The currently equipped companion (companion idx, name, etc). |

## Level thresholds

```js
const L2_MS = 7 * 86400000;   // 7 days equipped
const L3_MS = 30 * 86400000;  // 30 days equipped

function getLevel(totalMs) {
  if (totalMs >= L3_MS) return 3;
  if (totalMs >= L2_MS) return 2;
  return 1;
}
```

## Family map (from COMPANION_FAMILIES_DRAFT.md, subject to approval)

```js
const FAMILY_OF = {
  // Pollinators
  21:'pollinators', 24:'pollinators', 25:'pollinators', 28:'pollinators', 44:'pollinators', 80:'pollinators',
  // Scatterers
  35:'scatterers', 55:'scatterers', 67:'scatterers', 64:'scatterers', 77:'scatterers', 40:'scatterers',
  // Weavers
  37:'weavers', 31:'weavers', 41:'weavers', 62:'weavers', 65:'weavers', 70:'weavers',
  // Wayfinders
  36:'wayfinders', 29:'wayfinders', 51:'wayfinders', 57:'wayfinders', 63:'wayfinders', 49:'wayfinders', 66:'wayfinders', 69:'wayfinders',
  // Guardians
  32:'guardians', 33:'guardians', 22:'guardians', 26:'guardians', 34:'guardians',
  42:'guardians', 45:'guardians', 53:'guardians', 43:'guardians', 48:'guardians',
  50:'guardians', 68:'guardians', 76:'guardians', 81:'guardians',
  // Dew-Drinkers
  60:'dew', 71:'dew', 47:'dew', 27:'dew', 46:'dew', 72:'dew', 30:'dew', 52:'dew',
  // Mycelium (universal)
  73:'mycelium', 74:'mycelium', 61:'mycelium',
  // Watchers (universal)
  23:'watchers', 38:'watchers', 39:'watchers', 54:'watchers', 56:'watchers', 75:'watchers', 79:'watchers', 20:'watchers', 78:'watchers'
};
```

## Class affinity table

```js
const CLASS_STRONG = {
  forager:      ['scatterers', 'wayfinders'],
  breeder:      ['pollinators', 'weavers'],
  cartographer: ['wayfinders', 'dew'],
  tender:       ['pollinators', 'guardians'],
  keeper:       [] // mini-bonus across all 6 — computed differently
};
const UNIVERSAL_FAMILIES = ['mycelium', 'watchers'];
```

## Magnitude calculator

```js
// Returns the multiplier to apply to a companion's declared base buff.
// Example: base buff is 3%. getMagnitudeMult(idx) returns 1.25 for
// L1 + class-match. Final = 3% * 1.25 = 3.75%.
function getMagnitudeMult(compIdx) {
  var level = getLevel(getTotalMs(compIdx));
  // Level multiplier: L1 = 1.0×, L2 = 2.0×, L3 = 3.33×
  // (because base buff is what L1 gives; L2 → 2×, L3 → 3.33× = scales with declared schedule 3/6/10)
  var levelMult = level === 3 ? 3.33 : level === 2 ? 2.0 : 1.0;
  var family = FAMILY_OF[compIdx];
  var cls = _lwGetClass();
  var classMatch = cls && CLASS_STRONG[cls] && CLASS_STRONG[cls].indexOf(family) >= 0;
  var keeperMini = cls === 'keeper' && family && UNIVERSAL_FAMILIES.indexOf(family) === -1;
  var universal = UNIVERSAL_FAMILIES.indexOf(family) >= 0;
  var affinityMult = classMatch ? 1.25 : keeperMini ? 1.10 : universal ? 1.05 : 1.0;
  return levelMult * affinityMult;
}
```

## Timer writers

```js
function _equipCompanion(idx) {
  _pauseActiveTimer();  // writes current accumulated time
  var timer = _loadTimer();
  if (!timer[idx]) timer[idx] = { totalMs: 0, activeSinceMs: null };
  timer[idx].activeSinceMs = Date.now();
  _saveTimer(timer);
  localStorage.setItem('pw_active_companion_idx', String(idx));
  // First-seen
  _markFirstSeen(idx);
}

function _pauseActiveTimer() {
  var activeIdx = parseInt(localStorage.getItem('pw_active_companion_idx') || '-1', 10);
  if (activeIdx < 0) return;
  var timer = _loadTimer();
  var t = timer[activeIdx];
  if (t && t.activeSinceMs) {
    t.totalMs = (t.totalMs || 0) + (Date.now() - t.activeSinceMs);
    t.activeSinceMs = null;
  }
  _saveTimer(timer);
}

function getTotalMs(idx) {
  var timer = _loadTimer();
  var t = timer[idx] || { totalMs: 0, activeSinceMs: null };
  var live = t.activeSinceMs ? (Date.now() - t.activeSinceMs) : 0;
  return (t.totalMs || 0) + live;
}
```

## L3 signature ability hooks

When a companion reaches L3 (first time crossing 30 days), fire the family's signature:

```js
function _checkL3Unlock(idx) {
  var unlocked = _loadL3Unlocks();
  if (unlocked[idx]) return;
  if (getLevel(getTotalMs(idx)) >= 3) {
    unlocked[idx] = true;
    _saveL3Unlocks(unlocked);
    var family = FAMILY_OF[idx];
    var compName = getCompanionName(idx);
    var sigName = L3_SIGNATURES[family];
    _toast('✨ ' + compName + ' reached Master. Unlocked: ' + sigName + '.');
    // Log to book
    _logWildEvent({type:'companion_l3', idx:idx, name:compName, family:family, signature:sigName});
  }
}
```

## L3 signatures

```js
const L3_SIGNATURES = {
  pollinators: 'Twin Bloom',        // 5% breed → 2 seeds
  scatterers:  'Dream Seed',        // overnight free feral
  weavers:     'Chimera Mend',      // -1 EA penalty on chimera
  wayfinders:  'Pathfinder',         // compass reveals unvisited biome
  guardians:   'Phoenix Revive',     // one-shot save (existing design)
  dew:         'Compost Song',       // +1 fertilizer tier
  mycelium:    'Kin Network',        // +1 EA floor to family-linked plants
  watchers:    'Hidden Trait'        // reveal 1 DNA row per plant (lifetime)
};
```

## Where to call

| Hook | When |
|---|---|
| `_equipCompanion(idx)` | from PW_UI companion picker |
| `_checkL3Unlock(idx)` | on every Wild-tab entry + every hour timer |
| `getMagnitudeMult(idx)` | inside each ability's magnitude calc |

## v1 → v2 ship plan

**v1 (now-ish):** just the base buffs (L1 magnitudes only). No leveling yet. Equipped companion's base buff fires at 1.0× (or 1.25× if class match).

**v2 (next):** add the equipped timer + L2/L3 level progression. Existing v1 base buffs now scale 1.0× → 2.0× → 3.33× with level.

**v3 (later):** L3 signature abilities.

## Implementation time estimate

- Wiring v1: **1 focused session** after family spec is approved.
- Wiring v2: **1 more session** (mostly storage + picker UI).
- Wiring v3: **1 final session** (signature abilities + Book of Secrets integration).

## To finalize

Stephen needs to approve:
1. Family names + assignments (COMPANION_FAMILIES_DRAFT.md)
2. Class affinity matrix
3. L2/L3 thresholds (7d / 30d)
4. Magnitude scaling (L1=1×, L2=2×, L3=3.33×)
5. Keeper mini-bonus (+10%)
