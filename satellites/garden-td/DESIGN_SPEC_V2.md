I've now read the full spec and the entire codebase (data structures, combat loop, draw functions, input, meta, save, bridge). I have everything I need. Below is the deliverable.

---

# GARDEN GUARD — v2 DESIGN DOC (buildable, code-grounded)

*Extends the shipped single-file Canvas-2D satellite (`satellites/garden-td/index.html`, one ES5 IIFE, 540×960 virtual space). Every number and data shape below plugs into the existing scaffolding: `TOWERS`/`ENEMIES`/`MAPS` objects, the `t.tiers[t.tier-1]` stat read, `applyDamage`/`addDot`/`applyStatus`, `findTarget`, `applyBuffs`, `killEnemy`, `stepSim`, the manage sheet, and `save`. It does not rewrite the engine — it grafts onto it.*

---

## 1. VISION

**Garden Guard v2 is the only cozy tower defense where your plants don't just shoot — they *react with each other*.** Every plant paints its target with a botanical status (a sundew leaves it **Wet**, a marigold leaves it **Scorched**, a puffball dusts it with **Spore**, a pitcher lets it **Rot**), and when two statuses meet on the same bug they combust into a named garden reaction — **Steam**, **Wildfire**, **Bloom-Rot**, **Corrode**. So the game you're actually playing isn't "stack the strongest tower," it's "arrange a little chemistry set of flowers so the bugs walk into a chain reaction." On top of that sits a **Keeper** — your gardener, present on the field, levelling as the waves clear, with a watering can and a sun-flare you aim by hand to *set up* those reactions in a pinch — and **Blooms**, once-in-a-while pollen-fuelled super-moves unique to each plant. The result reads as unmistakably Garden Guard in a single screenshot (a marigold igniting a wet, spore-dusted column into a rolling wildfire while a gnome-hatted Keeper waters the choke), it teaches itself through plant biology, and every one of its standout systems is a handful of one-shot effects on top of the status fields the engine already has.

---

## 2. UPGRADE SYSTEM

### 2.1 The chosen model: **Kingdom Rush "3 linear → fork into 2 cultivars → 1 binary graft"**

**Why this and not the alternatives.** BTD6's 3-path/crosspath matrix is the deepest but needs three simultaneous upgrade columns + tier-lock logic — unreadable on a phone canvas and a balancing nightmare. GemCraft trait-pips / drag-to-merge (Research B) is gorgeous but is a *ground-up rewrite* of the upgrade UI, the tower identity, and mobile input. The KR fork is the **only model that is a strict extension of what already ships**: the game already has `tiers:[T1,T2,T3]` upgraded in place through the manage sheet. We keep T1–T3 exactly (they're DPS-tuned), then add two more steps — a **fork** and a **graft** — reusing the same "Upgrade" button and the same stat-read path. It delivers BTD6-grade identity choice (a hard, late, permanent fork) with a two-button decision.

**Cozy framing (this is also "living towers" from Research C):** the five states are growth stages — **Sprout (T1) → Growing (T2) → Mature (T3) → Flowering (T4, the cultivar) → Ancient (T5, the graft)**. Each stage visibly blooms more. We get the "a garden that matures" feel with *no separate XP system* — the tiers *are* the growth.

**The restriction rules (the meaningful choice):**
- **T4 fork is a hard, permanent commitment.** You pick cultivar **A** or **B**. The other cultivar is unreachable on that plant forever — to switch you must **sell and rebuild** (70% refund already exists). This is the KR identity lock: it's what makes the choice matter.
- **T5 graft is one binary dial.** Within your chosen cultivar you pick one of two cheap mutually-exclusive riders (e.g. +range vs +fire-rate). No cross-cultivar mixing, no third path. This is the BTD6 "tune the finished tower" feel compressed to one tap.
- Net build space: **4 distinct end-states per tower** (2 cultivars × 2 grafts) × 9 towers = 36 end-builds, before reactions/Blooms multiply the *feel*. Readable, decisive, mobile-safe.

### 2.2 Exact data shape

Two changes to the engine, both mechanical:

**(a) Resolve the active stat block once, into `t.st`.** Today ~10 sites read `t.tiers[t.tier-1]` (`towerDmg/Range/Rate`, `towerFire`'s `var st=…`, the sundew/scarecrow/compost/cactus branches, `sunflower`/`pitcher`/`beehive`/`puffball` reads, `applyBuffs`' scarecrow read, `spawnBee`, `openManage`). Add a field `t.st` that holds the current block, and replace those reads with `t.st`. `t.st` is (re)assigned only on state change: place, upgrade, fork, graft. This keeps `buffSpd/buffRng/buffPow` layered on top exactly as now.

```js
// tower instance gains:  path:null|'a'|'b' ,  graft:null|0|1 ,  st:<block> ,  actCd:0
function setTowerStat(t){
  var d=TOWERS[t.id];
  if(t.tier<=3){ t.st=d.tiers[t.tier-1]; return; }
  var fk=d.fork[t.path];
  if(t.tier===4){ t.st=fk.t4; return; }
  // tier 5: copy the path's t5 block, then apply the chosen graft's multipliers
  var s={}; for(var k in fk.t5) s[k]=fk.t5[k];
  var mods=fk.graft[t.graft].mods;
  if(mods.range) s.range=Math.round(s.range*mods.range);
  if(mods.rate)  s.rate =Math.round(s.rate *mods.rate);
  if(mods.dmg)   s.dmg  =Math.round(s.dmg  *mods.dmg);
  if(mods.set)   for(var m in mods.set) s[m]=mods.set[m];
  t.st=s;
}
```

**(b) `TOWERS[id]` gains three keys:** `status` (base status this plant paints on hit, §3.1), `bloom` (its pollen super, §3.2), and `fork` (the two cultivars). Each cultivar carries `t4`, `t5`, a `passive` string, an optional `active` (cooldown ability — some cultivars are pure-stat, some are hands-on, exactly like KR's Paladin-vs-Barbarian split), and its two `graft` riders.

**Upgrade flow in the manage sheet (extends existing `upgradeTower`/`openManage`):**
- `tier<3`: the current "Upgrade (cost)" button, unchanged.
- `tier===3`: Upgrade button becomes **"🌸 Choose Cultivar"** → opens a 2-card chooser (reuse the buy-sheet grid styling) showing each cultivar's name, art, passive line, cost. Pick → set `t.path`, `t.tier=4`, `setTowerStat`.
- `tier===4`: Upgrade becomes **"🌿 Graft"** → 2-card chooser of the two riders. Pick → `t.graft`, `t.tier=5`, `setTowerStat`.
- `tier===5`: "Ancient" (maxed), like T3 is today.

### 2.3 Full data — three template towers

Costs in Seeds. `status` = base paint. `up` = cost to reach that step. Numbers are tuning starts, continuous with the shipped T1–T3.

#### MARIGOLD — fast single-target (specialist-vs-crowd fork)
```js
marigold:{ name:'Marigold', cost:50, role:'single', air:'t3', target:true, accent:'#e08a3a',
  status:'scorch',
  bloom:{ id:'goldenHour', name:'Golden Hour', pollen:1, cd:22000 },  // §3.2
  tiers:[ {dmg:8, range:100, rate:900, up:50},
          {dmg:14,range:115, rate:800, up:90},
          {dmg:24,range:130, rate:700, up:150} ],   // NEW: T3 now costs 150 to fork (was up:0)
  fork:{
    a:{ id:'marks', name:'Marksmarigold', up:180,
        passive:'Deadhead — +60% range; every 5th shot crits ×3. Bug-killer for tough single targets.',
        t4:{dmg:34,range:210,rate:650, status:'scorch', crit:{every:5,mult:3}},
        t5:{dmg:48,range:235,rate:600, status:'scorch', crit:{every:5,mult:3}},
        active:null,                          // pure stat specialist (KR "Paladin" style)
        graft:[ {id:'roots', label:'Deep Roots', mods:{range:1.2}},
                {id:'eagle', label:'Eagle Eye',  mods:{set:{crit:{every:3,mult:3}}}} ] },
    b:{ id:'wild', name:'Wildflower Spray', up:180,
        passive:'Pollen Cloud — 3-way spread; hits leave a 1s −20% slow. Sweeps swarms.',
        t4:{dmg:18,range:120,rate:600, status:'scorch', spread:3, hitSlow:0.20},
        t5:{dmg:26,range:130,rate:520, status:'scorch', spread:3, hitSlow:0.25},
        active:{ id:'petalStorm', name:'Petal Storm', cd:14000,
                 // 2s: fire omnidirectionally at every enemy in range, each hit paints scorch
                 note:'2s omni petal spray, all-in-range, applies scorch' },
        graft:[ {id:'wide', label:'Wide Bloom',  mods:{range:1.2}},
                {id:'quick',label:'Quick Bloom', mods:{rate:0.8}} ] } } }
```

#### SUNDEW — slow / control (lockdown-vs-support fork) — the Wet applier
```js
sundew:{ name:'Sundew', cost:90, role:'slow', air:'aura', target:false, accent:'#e0533a',
  status:'wet',
  bloom:{ id:'amberFreeze', name:'Amber Freeze', pollen:1, cd:26000 },  // freeze+Wet+vuln whole screen
  tiers:[ {dmg:2,range:90, rate:600, up:80,  slow:0.25},
          {dmg:3,range:100,rate:600, up:150, slow:0.40},
          {dmg:4,range:115,rate:600, up:170, slow:0.55} ],  // NEW T3 up:170
  fork:{
    a:{ id:'tar', name:'Tar Sundew', up:190,
        passive:'Lockdown — slow deepens to −65%; every 5s roots the strongest bug 1s. Still paints Wet.',
        t4:{range:120,rate:600,dmg:5,slow:0.65,status:'wet',rootEvery:5000,rootDur:1.0},
        t5:{range:130,rate:550,dmg:6,slow:0.70,status:'wet',rootEvery:4000,rootDur:1.2},
        active:{ id:'resinTrap', name:'Resin Trap', cd:10000,
                 note:'tap the path: first bug to enter is held 2.5s + Wet + 6/0.5s DoT' },
        graft:[ {id:'wideweb',label:'Wide Web', mods:{range:1.3}},
                {id:'deepgum',label:'Deep Gum', mods:{set:{slow:0.75}}}] },
    b:{ id:'nectar', name:'Nectar Sundew', up:190,
        passive:'Support — slow eases to −20% but ALL other plants in radius get +15% fire-rate, and Wet bugs take +25% from everyone.',
        t4:{range:120,rate:600,dmg:3,slow:0.20,status:'wet', allyRate:0.15, wetVuln:0.25},
        t5:{range:135,rate:600,dmg:3,slow:0.20,status:'wet', allyRate:0.20, wetVuln:0.30},
        active:{ id:'sweetLure', name:'Sweet Lure', cd:12000,
                 note:'1.5s: pull all in-range bugs toward the sundew (cluster them for AoE + reactions)' },
        graft:[ {id:'openhive',label:'Open Nectar', mods:{range:1.3}},
                {id:'richsap', label:'Rich Sap',    mods:{set:{allyRate:0.30}}}] } } }
```
*(Nectar Sundew's `allyRate` folds into `applyBuffs` as an adjacency aura — see §4.1. Its `wetVuln` is checked in `applyDamage` when `e.wetT>0`.)*

#### COMPOST — economy (steady-vs-network fork) — the Rot applier via Mycelium
```js
compost:{ name:'Compost Bin', cost:130, role:'econ', air:'no', target:false, accent:'#5a4a2a',
  status:null,                                   // base bin paints nothing
  bloom:{ id:'bumperCrop', name:'Bumper Crop', pollen:1, cd:24000 },  // instant +120 Seeds
  tiers:[ {dmg:0,range:80,rate:5000,up:110,seeds:8},
          {dmg:0,range:80,rate:5000,up:210,seeds:14},
          {dmg:0,range:90,rate:4500,up:210,seeds:22,sap:2} ],
  fork:{
    a:{ id:'worm', name:'Worm Bin', up:230,
        passive:'Steady — +10 Seeds/tick; bugs killed within radius drop +25% Seeds (kill-box economy).',
        t4:{range:95,rate:4500,seeds:10,killBonus:0.25,status:null},
        t5:{range:100,rate:4000,seeds:14,killBonus:0.35,status:null},
        active:{ id:'harvest', name:'Harvest', cd:15000,
                 note:'instantly bank +8×wavesCleared Seeds' },
        graft:[ {id:'mulch',label:'Deep Mulch', mods:{set:{seeds:20}}},
                {id:'fast', label:'Fast Compost',mods:{rate:0.7}}] },
    b:{ id:'myco', name:'Mycelium Network', up:230,
        passive:'Network — only +4 Seeds/tick, BUT links to adjacent plants: each gets +10% dmg and PAINTS ROT on their hits. Turns your cluster into a reaction engine.',
        t4:{range:110,rate:4500,seeds:4,linkDmg:0.10,grantStatus:'rot',status:null},
        t5:{range:120,rate:4500,seeds:4,linkDmg:0.15,grantStatus:'rot',status:null},
        active:{ id:'bloomBoost', name:'Bloom Boost', cd:18000,
                 note:'grant every linked plant a free mini-Bloom pulse' },
        graft:[ {id:'reach',label:'Deep Roots', mods:{range:1.3}},
                {id:'potent',label:'Potent Spores',mods:{set:{linkDmg:0.25}}}] } } }
```
*Mycelium is the standout fork: `grantStatus:'rot'` means every linked plant's hits paint Rot (fed into `applyBuffs`, which already loops all towers). Suddenly your marigolds (Scorch) + a mycelium link (Rot) = **Corrode** on every shot. This is where the upgrade model and the reaction system fuse.*

### 2.4 Outline — the other six

Each = 3 in-place tiers (kept) → fork into a **specialist** vs a **support/spread** cultivar → binary graft → base `status` + a `bloom`. Statuses chosen so the roster covers all four reaction inputs.

| Tower | base `status` | Cultivar A (specialist) | Cultivar B (support/spread) | Notable graft dial | Bloom verb |
|---|---|---|---|---|---|
| **Cactus** | *(physical)* | **Ironbarb** — +dmg, longer bleed DoT (armor-bypass) | **Sporespike** — barbs paint **Spore**, wider ring | ring radius vs pulse-rate | *Bramble Burst* — 3× needle nova, bleed all ground |
| **Puffball** | `spore` | **Bombardier** — bigger splash + lingering cloud | **Sporecaster** — smaller splash, paints Spore on a wide area, low flyers | splash vs rate | *Spore Bloom* — giant 4s spore cloud (primes Wildfire/Bloom-Rot) |
| **Pitcher** | `rot` | **Acid Well** — deeper stacks, armor-melt | **Corroder** — splash acid to 2 nearby, spreads Rot | stacks vs vuln% | *Acid Flood* — Rot + heavy DoT along nearest path stretch 4s |
| **Beehive** | *(none)* → | **Hunter Hive** — more bees, sting DoT, flyer lock | **Dustbees** — bees paint **Spore** (air-delivered reactions!) | bees vs rate | *Swarm Call* — 12 bees clear the sky |
| **Scarecrow** | *(none)* | **Watchcrow** — bigger buff aura + periodic freeze | **Trickster** — paints **Wet** on fear-flinched bugs, wider fear | aura size vs buff% | *Fright Night* — screen fear 1.5s + team +50% rate 5s |
| **Sunflower** | `scorch` | **Solar Lance** — pierce beam, +vs-strong (boss killer) | **Radiant Bloom** — shorter range, splash Scorch on a small AoE | range vs charge-rate | *Solar Lance* — 1.5s sweeping scorch beam |

Design guarantee: after forks, **all four statuses have at least two possible appliers** (Wet: Sundew, Trickster-Scarecrow; Scorch: Marigold, Sunflower; Spore: Puffball, Sporespike-Cactus, Dustbees-Beehive; Rot: Pitcher, Mycelium-Compost) — no single-point-of-failure, and *your fork choices decide which reactions your garden can even make.*

---

## 3. SIGNATURE MECHANICS

Three interlocking layers of agency — **systemic (Reactions), semi-active (Blooms), real-time (Keeper)** — all built on the enemy status fields the engine already carries (`slowF/slowT`, `vuln/vulnT`, `dots[]`, `rootT`, `shield`).

### 3.1 SIGNATURE 1 — Garden Reactions (the only-in-Garden-Guard hook)

**Why over the alternatives.** This is the freshest idea in all four briefs (Research C's #1) and *nothing cozy is doing it*. Crucially it's the cheapest big idea to build here because the engine is already a status machine — Chill (slow), Rot (vuln), DoT all exist. We add 3 timer fields and one lookup table and get a combinatorial placement puzzle that turns 9 towers into ~N² interactions without new art. It also gives the fork system its *reason to exist* (your cultivar picks decide your reaction palette).

**Statuses (4).** Each is a short timer on the enemy; drawn as a shape-coded glyph (extends the existing glyph block at lines 1291–1296, colorblind-safe):
- **Wet 💧** (`e.wetT`) — also confers a light −15% slow while active. Appliers: Sundew, Trickster-Scarecrow, Keeper's Watering Can.
- **Scorch 🔥** (`e.scorchT`). Appliers: Marigold, Sunflower, Keeper's Sun Flare.
- **Spore 🍄** (`e.sporeT`). Appliers: Puffball, Sporespike-Cactus, Dustbees-Beehive.
- **Rot 🟣** (`e.rotT`, and it sets `e.vuln` +30% — reuses the shipped vuln system). Appliers: Pitcher, Mycelium-Compost.

**One applier helper** (call after every damaging hit that carries `st.status`; also from Blooms/Keeper/AoE):
```js
function applyStatus(e, kind){
  if(e.dead||!kind) return;
  // reaction check: a NEW status meeting a compatible existing one detonates (consume both)
  if(kind==='scorch' && e.wetT>0){ e.wetT=0; react(e,'steam');    return; }
  if(kind==='wet'    && e.scorchT>0){ e.scorchT=0; react(e,'steam'); return; }
  if(kind==='scorch' && e.sporeT>0){ e.sporeT=0; react(e,'wildfire'); return; }
  if(kind==='spore'  && e.scorchT>0){ e.scorchT=0; react(e,'wildfire'); return; }
  if(kind==='wet'    && e.sporeT>0){ e.sporeT=0; e.wetT=0; react(e,'bloomrot'); return; }
  if(kind==='spore'  && e.wetT>0){ e.wetT=0; react(e,'bloomrot'); return; }
  if(kind==='scorch' && e.rotT>0){ react(e,'corrode'); return; }   // Rot persists (it's vuln)
  // else just set/refresh the timer
  if(kind==='wet'){ e.wetT=3; e.slowF=Math.min(e.slowF,0.85); e.slowT=Math.max(e.slowT,0.4); }
  else if(kind==='scorch'){ e.scorchT=3; }
  else if(kind==='spore'){ e.sporeT=3; }
  else if(kind==='rot'){ e.rotT=4; e.vuln=Math.max(e.vuln,1.3); e.vulnT=Math.max(e.vulnT,4); }
}
```

**The four reactions** (`react(e,kind)` — all reuse `applyDamage(...,{dot:true})` to bypass armor, `addDot`, `applyStatus` for chains; each pops a named text + themed particle):

| Reaction | Trigger | Effect (tune) | Counters |
|---|---|---|---|
| **Steam** | Wet + Scorch | instant `18 + 12% maxHP` armor-bypass burst; +1.2s heavy slow | tanks (%HP) + armored (bypass) |
| **Wildfire** | Spore + Scorch | `addDot 8/0.5s ×3s`; **spread Scorch to all within 60px** | swarms / columns |
| **Bloom-Rot** | Wet + Spore | `addDot 6/0.5s ×4s`; on that bug's death, **paint Spore within 50px** (death-chain) | dense marching lines |
| **Corrode** | Scorch onto Rot | `20` armor-bypass burst; refresh `vuln +40%, 3s` | elites / bosses (melt→burn) |

**UI / readability.** Status glyphs float above the bug (💧🔥🍄🟣) using the existing colorblind glyph renderer. A reaction fires a **named word-pop** ("STEAM!", "WILDFIRE!") + a one-shot particle (reuse `poof`/`ring`/`puffRing`). A pre-wave banner hints the loadout ("This grove likes water and heat"). **Balance flag:** the Steam %HP burst must respect a boss per-hit cap if present (the Slug King has a 30/hit cap) — clamp reaction bursts to `e.hitCap||Infinity`.

**Cozy fit:** it's literal garden chemistry — steam off wet leaves in the sun, wildfire through dry spores, rot spreading in the damp. It teaches through biology (Research D's "theme *is* the tutorial").

### 3.2 SIGNATURE 2 — Blooms (Pollen supers; the reaction detonators)

**Why.** PvZ Plant Food is the most-loved "earned clutch moment" in the genre (Research A#3, D-b): a shared resource that becomes a *different verb per plant*, so mastery = knowing your roster. It's cheap (one-shot effects) and it's the best *delivery vehicle* for reactions (freeze-and-Wet the screen with the Sundew, then Marigold Golden-Hour scorches it → screen-wide Steam).

**Pollen 🌼.** ~8% of non-boss spawns are **nectar-rich** (a glowing variant; set `e.nectar=true` in `spawnEnemy`, drawn with a soft halo). Elites/bosses always are. Killing one drops **+1 Pollen** (floats to a HUD counter, `G.pollen`, cap 3). Add to `killEnemy`:
```js
if(e.nectar){ G.pollen=Math.min(3,G.pollen+1); floatText('+1 🌼',p.x,p.y,COL.gold2); }
```

**Firing.** Tap a planted tower → the manage sheet gains a top row **"✨ BLOOM (1🌼)"** when `G.pollen>0` and that plant isn't on `bloomCd`. Tapping spends 1 Pollen, fires that plant's `bloom` verb, starts its cooldown. (Ready plants also get a subtle gold pulse on-field as a discoverability nudge; an optional settings toggle lets a tap on a glowing plant fire the Bloom directly for expert speed.)

**The nine verbs** (each unique, each a handful of lines reusing existing systems):

| Plant | Bloom | Effect |
|---|---|---|
| Marigold | **Golden Hour** | 4s @ 3× rate, infinite pierce lances, each paints Scorch |
| Sundew | **Amber Freeze** | freeze ALL on screen 2.5s (`rootT`) + Wet all + `vuln +40%` — panic button + screen Steam primer |
| Compost | **Bumper Crop** | instant +120 Seeds (emergency buy) |
| Cactus | **Bramble Burst** | 3× needle nova, all ground, bleed DoT |
| Pitcher | **Acid Flood** | Rot + heavy DoT along nearest path stretch, 4s |
| Beehive | **Swarm Call** | release 12 bees, clear the sky |
| Puffball | **Spore Bloom** | 2× spore cloud 4s, paints Spore to all inside (Wildfire/Bloom-Rot primer) |
| Sunflower | **Solar Lance** | 1.5s sweeping scorch beam, huge single-target |
| Scarecrow | **Fright Night** | screen fear 1.5s + all towers +50% rate 5s |

**Cozy fit:** earned, never bought; the dramatic "oh no → clutch save" beat with zero monetization. **Balance flag:** Pollen drop rate is the single biggest economy dial — start 8%, watch that Blooms stay *special* (a few per level, not per wave).

### 3.3 SIGNATURE 3 — The Keeper (in-match hero, no pathfinding)

**Why, and why this lightweight form.** Research A and C both want a hero + Hand-of-God powers for real-time agency and progression. But a KR-style *roaming, path-blocking, melee* hero is the single most code-heavy addition and it fights our fixed-polyline path model (enemies advance by scalar `d`; there is no walkable grid). So the Keeper is the player's **avatar stationed at the compost bin** (the goal it guards) — a cozy sprite, **no movement AI, no melee, no pathfinding**. Its whole kit is:

- **Two aimed powers from L1** (bottom-HUD cooldown buttons; tap button → next field tap drops the AoE):
  - **Watering Can** (cd 12s): 70px AoE — paints **Wet** + brief slow. The reaction primer.
  - **Sun Flare** (cd 18s): 80px AoE — `40` burst + paints **Scorch**. The Rain-of-Fire panic button. *(Water then Flare the same cluster = manual screen Steam.)*
- **In-match levelling 1→10** off kills (BTD6 hero model): `G.keeper.xp += e.bounty` in `killEnemy`; `level = min(10, 1+floor(xp/threshold))`, threshold scaling per level.
- **Passive unlocks at L3** — folds into `applyBuffs` (e.g. "Green Thumb": all plants +8% range).
- **Signature power unlocks at L7** — unique per Keeper.

**Keeper roster (3; the first is free, the other two unlock via achievements — never bought, §5):**
- **The Warden** (default) — passive +range; L7 **Rally** (+40% fire-rate, 6s).
- **The Dewkeeper** — Watering Can also roots 1s; L7 **Monsoon** (Wet the whole screen).
- **The Emberkeep** — Sun Flare +50% radius; L7 **Solstice** (Scorch the whole screen). *(Monsoon then Solstice = screen-wide Steam — a two-Keeper dream a solo run can't do, but a reason to master each.)*

**Data:** `G.keeper = {id, xp, level, cdWater, cdFlare, cdSig, aimMode:null}`. Draw at the bin. Powers reuse `applyDamage`/`applyStatus`/`rootT`. Fully buildable, ~120 lines.

**Cozy fit:** you, the gardener, are *present* — watering and warming your beds — not an off-screen god. That presence is the warmth.

**How the three interlock (the standout screenshot):** Keeper waters a choke → the whole cluster is Wet → your Marigold's Scorch shots detonate rolling **Steam** → the survivors hit your Puffball's Spore cloud → a Bloom-lit **Wildfire** sweeps the column → a Mycelium-linked Pitcher leaves them Rotting for the Sunflower to **Corrode**. Every layer is a few one-shot effects on the existing status fields.

---

## 4. NEW & EXTENDED SYSTEMS

### 4.1 Adjacency synergies (cheap, folds into `applyBuffs`)
`applyBuffs` already loops all towers each frame to apply Scarecrow buffs. Extend the same loop for: **Nectar Sundew** `allyRate` (+fire-rate aura), **Mycelium** `linkDmg` + `grantStatus:'rot'` (adjacent plants paint Rot), and the **Keeper** passive. This makes *placement adjacency* matter (Research B/Mindustry-lite, C) with zero new data structures — just more `if`s in the existing loop.

### 4.2 More enemies / properties to counter (Bloons "property language," Research D)
The engine already models properties via `e.special` + `fly`/`armor` — extend it, keeping resistances **soft** (never 100%, except air which is already hard) to avoid Research D's "reskin tower" trap:
- **Root-Grub (Burrower / camo)** — `special:'burrow'`: untargetable by *aerial-sighted* plants; only ground-sense plants (Sundew, Compost, Cactus) and any **status/reaction** can hit it. Surfaces periodically (targetable window). Teaches ground-cover + reactions.
- **Glass-wing Beetle (phys-resist)** — takes ×0.4 from direct projectiles but **full** from DoT/reactions. The definitive "reactions matter" bug (can't brute-force it).
- **Nectar-rich variant** (§3.2) — any pest can spawn glowing; drops Pollen.
- **Sap-Tick (tower disabler)** — latches a plant, silences it 3s unless a *neighbor* kills the tick (rewards clustered defense). Soft, brief, cozy-framed ("shoo it off").
- Bosses: ship **Slug King** (per-hit cap 30, splits once — already in spec, needs the `hitCap` field) and **Moon Moth** (flyer, Eclipse untargetable heal window) for Endless/World 2–3, plus a new **Thorn Warden** vine-boss for a future world.

### 4.3 More maps / worlds + a light season cycle
World 1 (4 maps, 13 levels) ships. The save schema *already reserves 5 worlds.* Each new world = **a waypoint array + a pest-pool tier + a boss + a season tint** — all cheap because plots auto-generate from the path (`buildMapGeom`). Add **Worlds 2 (Summer) & 3 (Autumn)**. The **season cycle** is a light per-world modifier (Research C secondary, D prestige): matching-season plants +1 tier of effect potency, matching-season pests slightly tougher — a flavor layer, not a damage matrix.

### 4.4 Difficulty & endless depth
- Keep **Sprout / Garden / Bramble**.
- **Overgrowth** (GemCraft enrage, Research B#3): an opt-in per-wave toggle — tougher wave for bonus Sap + guaranteed Pollen. One-map-serves-both.
- **Call-wave-early** bonus already exists (the early-call Seeds).
- **Season's Boons draft** (Research B#10 / C#6): every 3 waves in Endless (and optionally campaign), pick **1 of 3** run modifiers (e.g. "Scorch spreads +1 chain," "Blooms cost 0 but Pollen drops halve," "+30% Seeds, pests +10% speed"). Seeded, opt-in difficulty + build authorship. Runs on a small pool you grow via the Almanac.
- **Heirloom fusion** (BTD6 Paragon analog, Research A#6): in Endless, if you own **both maxed cultivars of one plant on the field**, fuse them into a single **Heirloom** whose tier scales off total Seeds spent + kills by the fused pair. One Heirloom per plant family — a chase only Endless veterans reach.
- **Targeting:** add **"Ripest"** to the First/Last/Closest/Strongest cycle in `findTarget` — targets the most status-loaded bug (`wetT>0 + scorchT>0 + …`), the synergy glue for reaction combos.

---

## 5. META & PROGRESSION (free, non-predatory)

**Hard brand rule respected:** *Sap 🍯 buys cosmetics only — never in-run power* (CLAUDE.md / §9 of v1). I therefore **reject a Sap "skill tree"** (Research A's Monkey-Knowledge idea) — it would make Sap buy power. Progression is routed through **content unlocks + mastery**, which retains without spend and can't become pay-to-win.

- **Sap 🍯** — the shipped cosmetic shop, expanded: new tower skins, map themes, mascots + **Keeper cosmetic outfits**. Earn formula unchanged. Pure vanity.
- **Keepers** — unlocked by **achievements** (mastery), not Sap. They are *sidegrades* (different powers), like BTD6 heroes, so they never become power creep or a currency-gated advantage.
- **Garden Almanac** (Research D-d, PvZ Suburban Almanac + Lucid Winds' plant-lore DNA): an illustrated page auto-unlocks the first time you meet each **plant, cultivar, pest, boss, reaction, and Keeper** — with botanical flavor text and "first seen: Level X." Cozy completion, zero pressure; also documents the reaction table (teaches the game). Tracks SEEN/GROWN like the compendium note.
- **Star mastery + hard modes** (Research D-a, KR): 3 stars/level (fraction of Leaves, already shipped) plus **Iron** (fixed sparse tower set) and **Heroic** (elite pest mix) modes per level — 2–3× the content from existing levels for near-zero new assets.
- **Seeded Daily Challenge + streak + share string** (Research D-b): one deterministic, guaranteed-winnable level per day for everyone; a streak counter, stats, and a copy-paste result ("Garden Guard #142 — 🌻🌻🌻, 0 Leaves lost, 1 Wildfire chain of 9"). The cheapest proven retention + organic-growth loop; costs the player nothing.
- **Achievements (~40–60)** as *discovery prompts*, not grind: "Chain a Wildfire through 8 bugs," "Clear a level with only support cultivars," "Let the Guard Gnome save you," "Win with one plant per status." Each grants Sap + an Almanac stamp; some unlock Keepers/modes.
- **Prestige = seasonal reskins** (Research D-e), not power resets: after world mastery, unlock spring/summer/autumn/winter reskins of maps (visual + pest-mix variety). Ties to the existing 4-season system.
- **Soft-fail net** (Research D-c, PvZ Lawn Mower): a one-time **Guard Gnome** per level auto-clears the first fatal breach — turns a scary loss into a reprieve, and teaches "don't rely on it." Losing all Leaves is framed warmly ("the pests nibbled the garden — replant?"), never a red FAILURE stamp.
- **Sunbeams** stay exactly as shipped (`_sbCapEarn`, 30/day, 12/run) — purely additive cross-game bonus, never a gate.

---

## 6. ART ASSET PLAN + DROP-IN HOOK ARCHITECTURE

**Everything below is OPTIONAL.** The game ships fully playable on the Canvas fallbacks that already exist (`drawTower`, `drawEnemy`, `drawMascot`, FX). Art drops in **key-by-key** with zero code changes.

### 6.1 Folder + naming convention (verbatim)
```
satellites/garden-td/assets/gg/
  towers/    <plant>_body.png              (static base incl. pot)
             <plant>_head_t1.png … _t3.png (aiming part per tier)
             <plant>_<cultivar>.png        (T4/T5 flowering head, e.g. marigold_marks.png)
  pests/     <pest>_walk.png               (horizontal strip, N frames)
             <pest>_hit.png  <pest>_death.png (optional)
             boss_<name>.png (or _walk strip)
  proj/      spike.png spore.png acid.png bee.png petal.png beam_cap.png
  fx/        impact_flash.png steam.png wildfire.png bloomrot.png corrode.png
             leaf_particle.png petal_particle.png ring_soft.png
  tiles/     tile_grass.png tile_soil.png tile_path.png tile_path_corner.png
  maps/      map_w1_kitchen.png … map_w1_trellis.png (one full 540×960 bg per map/season)
  keepers/   keeper_<id>.png  keeper_<id>_wateringcan.png keeper_<id>_sunflare.png
  ui/        icon_<plant>.png  icon_pollen.png icon_seed.png icon_leaf.png icon_sap.png
             badge_wet.png badge_scorch.png badge_spore.png badge_rot.png
             badge_burrow.png badge_fly.png badge_armor.png
             star_full.png star_empty.png
  manifest.json
```

### 6.2 Complete asset list (grouped; dims; all PNG w/ alpha unless noted; purpose)

**Towers (9)** — layered pot+body+head (Kenney convention: one base + one rotating head = smooth aiming, no rotation frames):
- `<plant>_body.png` — **96×96** — static plant + pot, drawn first, gentle sway.
- `<plant>_head_t1/2/3.png` — **64×64** — the aiming/firing part per tier (marigold pompom, pitcher mouth, beehive skep, sunflower disc); rotated to target at runtime. Tier art = **swap head only** + optional deco.
- `<plant>_<cultivar>.png` — **80×80** — the T4/T5 flowering head, one per cultivar (2 per plant = 18). *Total towers: 9 bodies + 27 tier heads + 18 cultivar heads.*

**Pests (13 + variants + 4 bosses)**:
- `<pest>_walk.png` — strip, each frame **48×48**, **2–4 frames** (2 is fine for cozy waddle). 13 pests.
- `<pest>_hit.png` (1 frame, 48×48) + `<pest>_death.png` (1–3 frames) — optional; particle burst covers death if absent.
- New pests: `rootgrub_walk`, `glasswing_walk`, `saptick_walk` (48×48 strips).
- Nectar-rich = a shared `fx/nectar_halo.png` (**56×56**) overlaid on any pest — no per-pest variant needed.
- Bosses: `boss_aphidqueen`, `boss_slugking`, `boss_moonmoth`, `boss_thornwarden` — **160×160** (strip of 2–4 frames if animated).

**Projectiles / FX** — small individual PNGs (particles can stay pure canvas):
- `proj/spike|spore|acid|bee|petal.png` — **16×16**. `proj/beam_cap.png` — **24×24** (beam end).
- `fx/impact_flash.png` **32×32**; reaction one-shots `fx/steam|wildfire|bloomrot|corrode.png` — **64×64** (or 3-frame strips **192×64**); `fx/ring_soft.png` **128×128** (range/pulse); `fx/leaf_particle|petal_particle.png` **12×12**.

**Tiles / paths** — **64×64** grid: `tile_grass, tile_soil, tile_path, tile_path_corner` (+ straight/T pieces if desired). Optional; maps can ship as full backgrounds instead.

**Backgrounds** — one **540×960** PNG per map per season: `map_w1_kitchen.png` … 4 maps × up to 4 seasons. Path may be baked in (fairness: path shape never changes). **Keep each ≤512KB and ≤1600px** (host resizer gotcha, §6.4).

**Keepers (3)** — `keeper_<id>.png` **96×96** (idle at bin) + `keeper_<id>_wateringcan.png` / `_sunflare.png` **96×96** (power-cast pose). Plus reusable AoE decals `fx/water_puddle.png` **96×96**, `fx/sun_burst.png` **96×96**.

**UI / icons** — `icon_<plant>.png` **48×48** (build tray); currency icons `icon_pollen/seed/leaf/sap.png` **32×32**; status badges `badge_wet/scorch/spore/rot.png` and property badges `badge_burrow/fly/armor.png` **24×24** (overlay on any pest — shape-coded, not color-only); `star_full/empty.png` **32×32**.

*Priority for the artist (biggest visual lift first): 9 tower bodies → 4 map backgrounds → 13 pest walk strips → 4 boss sprites → 18 cultivar heads → FX/reactions → UI icons.*

### 6.3 Loader design (PNG-if-present, else canvas fallback)
`manifest.json` lists each key with path + frame metadata so the artist can resize/retime without a code edit:
```json
{ "marigold_body":{ "path":"towers/marigold_body.png", "fw":96,"fh":96,"anchorX":48,"anchorY":72 },
  "aphid_walk":   { "path":"pests/aphid_walk.png", "frames":2,"fw":48,"fh":48,"anchorX":24,"anchorY":24 } }
```
```js
var GGART={ ready:{}, img:{}, meta:{} };
function loadArt(){
  fetch('assets/gg/manifest.json?v='+ART_VER).then(function(r){return r.json();}).then(function(m){
    for(var key in m){ (function(k,def){
      GGART.meta[k]=def; var im=new Image();
      im.onload=function(){ GGART.img[k]=im; GGART.ready[k]=true; };
      im.onerror=function(){ GGART.ready[k]=false; };      // missing → fallback stays
      im.src='assets/gg/'+def.path+'?v='+ART_VER;
    })(key,m[key]); }
  }).catch(function(){});                                    // no manifest → 100% canvas fallback
}
// draw helper: returns true if it drew a sprite, false → caller runs its existing canvas path
function spr(c,key,x,y,scale,ang,frame){
  if(!GGART.ready[key]) return false;
  var d=GGART.meta[key], im=GGART.img[key], f=frame||0;
  c.save(); c.translate(x,y); if(ang!=null)c.rotate(ang+Math.PI/2); if(scale)c.scale(scale,scale);
  c.drawImage(im, f*d.fw,0,d.fw,d.fh, -d.anchorX,-d.anchorY,d.fw,d.fh); c.restore(); return true;
}
```
**The hook:** wrap each existing draw. e.g. at the top of `drawTower`'s body: `if(spr(c,id+'_body',x,y,scale,null)){ /* + head */ ... return; }` else fall through to the current Canvas code (which becomes the fallback). Same one-line guard in `drawEnemy` (`spr(ctx, e.tid+'_walk', x, y+bob, 1, null, frame)`), `drawBackground`, `drawMascot`, `drawKeeper`, and FX. Ship v1 on canvas; art replaces it silently.

### 6.4 Host constraints (from memory — must honor)
lucidwinds.com **resizes any image >1600px and ignores no-cache headers.** So: keep every PNG **≤1600px and modest KB**, or ship a packed atlas as **`.bin` via fetch→blob**; **path-version deploys** and cache-bust every asset with `?v=ART_VER` (bump `ART_VER` on any art change, mirroring the `_SVG_CACHE_VER` rule). Author as individual PNGs first; atlas-packing is a later optimization, not a requirement.

---

## 7. BUILD PRIORITY (vertical slice → depth → art hooks → polish)

**Phase 1 — Vertical slice (the fork model on the shipped game).**
1. Refactor the ~10 `t.tiers[t.tier-1]` reads to `t.st` + add `setTowerStat` / `t.path` / `t.graft`. *(Pure mechanical; regression-test with `window.__GTD`.)*
2. Add `fork`/`graft` data to all 9 `TOWERS`; wire the manage-sheet cultivar & graft choosers. Cultivar **passives only** in this phase (no actives yet). Playable end-to-end with meaningful late choices.
⚠️ *Balance risk:* fork/T5 Seed costs vs the shipped `bountyScale=1+0.10*(L-1)`. Late plot-limited maps may not fund a T5; verify with the L6/L12/L13 economy check before adding anything else. Consider a small bounty bump.

**Phase 2 — Signature 1 (Reactions), the core hook.**
3. Add `wetT/scorchT/sporeT/rotT` fields + `applyStatus` + `react` + the 4-row table; call `applyStatus` from every damaging hit carrying `st.status`. Extend the colorblind glyph block for 💧🔥🍄🟣 + reaction word-pops.
⚠️ *Risk:* Steam %HP burst vs boss `hitCap`; Wildfire/Bloom-Rot chain radii causing runaway clears on swarm maps — cap chain depth.

**Phase 3 — Signature 2 (Pollen + Blooms).**
4. `e.nectar` spawn flag + halo, Pollen drop in `killEnemy`, HUD counter, the 9 Bloom verbs, manage-sheet Bloom button.
⚠️ *Risk:* Pollen drop rate — keep Blooms special (a few/level). This is the top economy dial.

**Phase 4 — Signature 3 (The Keeper).**
5. `G.keeper` object, bin sprite, two aimed powers (aim-tap flow), in-match XP/level, L3 passive in `applyBuffs`, L7 signature; the Warden only (roster later).

**Phase 5 — Depth.**
6. Cultivar **actives** (dispatcher + ready-glow), adjacency auras (Nectar/Mycelium), "Ripest" targeting.
7. New pests/properties (Root-Grub, Glass-wing, Sap-Tick) + Slug King & Moon Moth (`hitCap`, Eclipse). ⚠️ keep resistances soft.
8. Worlds 2–3 (waypoints + pools + season tint) + Guard Gnome soft-fail.

**Phase 6 — Meta & retention.**
9. Garden Almanac, achievements (+Keeper/mode unlocks), Iron/Heroic modes, seeded Daily + streak + share string, Sap cosmetic expansion, prestige reskins.

**Phase 7 — Endless depth.**
10. Season's Boons draft + Heirloom fusion + Overgrowth toggle. ⚠️ *Risk:* Heirloom/Boons power-scaling vs Endless HP ramp — cap and playtest.

**Phase 8 — Art hooks.**
11. `manifest.json` + `loadArt` + `spr()` guards in every draw fn; `ART_VER` cache-bust. Ship fallbacks first; drop art in key-by-key.

**Phase 9 — Polish.**
12. Reaction FX/juice pass, Keeper cast animations, SFX for statuses/reactions/Blooms, final balance verify on Sprout/Garden/Bramble across L1/L6/L12/L13 + Endless w20 — confirm no dead/dominant cultivar, that reactions (not raw DPS) carry the hard clears, and that flyers + Glass-wing force diverse builds.

**Single biggest cross-cutting risk:** reactions + Blooms + Keeper bursts stacking into trivial clears. Mitigate by tuning **Pollen scarcity** and **reaction cooldowns/caps** first, before touching base tower DPS (which is already tuned) — one variable at a time, per the studio's single-variable rule.

---

*Key files: spec `satellites/garden-td/DESIGN_SPEC.md`; code `satellites/garden-td/index.html` (fork refactor sites: `towerDmg/Range/Rate` ~871–873, `towerFire` ~931, `applyBuffs` ~1037, `openManage`/`upgradeTower` ~1129/1429; reaction hooks: enemy fields in `spawnEnemy` ~758, `applyDamage` ~896, `killEnemy` ~917, glyphs ~1291; loader hooks: `drawTower` ~1205, `drawEnemy` ~1266, `drawBackground` ~1150).*