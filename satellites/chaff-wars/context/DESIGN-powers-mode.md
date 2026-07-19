Engine confirmed. Here is the complete design doc, written against the real `satellites/chaff-wars/index.html` engine (symbols like `f.pending`, `dropPending`, `preDropChaff`, `resolveTick`, `colHeights`, `CHAFF=6`, `SPAWN_COL=2`, `MATCH.pf/of` are all real hooks).

---

# CHAFF WARS — POWERS MODE
### Design doc v1.0 (2026-07-19). A super-power twist layered on the faithful Puyo/MBM engine.

> Director's word: *"the characters have different super powers as a twist on the classic. it'd be two different modes."*
> Classic Mode stays pure Puyo. Powers Mode gives all 14 pests **and** the Keeper one distinct signature power that acts on the real seedpod/chain/chaff board.

Everything below is programmable against the shipped engine constants: `COLS=6, ROWS=13, VISROWS=12, SPAWN_COL=2, CHAFF=6`, colors `1..5`, `isColor(v)= v>=1&&v<=5`, garbage via `f.pending`/`f.carry`, `GARBAGE_CAP=30`, `ALLCLEAR_NUIS=30`, `TARGET_POINTS=70`.

---

## 1. Powers Mode vs Classic Mode

**Classic Mode** = what ships today: pure Tsu Puyo (offsetting + all-clear), no powers. Untouched. It stays the "faithful cartridge" experience the brief promised.

**Powers Mode** = the identical falling-pod / chain / chaff engine, with **one new subsystem layered on top**: a per-field **Sap meter** and a single equipped **Power** that fires a bounded, telegraphed board effect. Nothing about gravity, popping (4+ orthogonal), cascades, offsetting, or top-out changes. Powers only *nudge* the boards the engine already simulates.

### What's added (and only this)

| Piece | Where | Note |
|---|---|---|
| Mode flag | `MATCH.mode` gains `'powers'` (alongside `'campaign'`, `'endless'`); or a boolean `MATCH.powers` | Campaign can run in either mode; Powers is a top-level menu twin of Campaign. |
| Mode select | New menu button `#b-powers` "Powers Campaign" next to `#b-campaign` | Same 13+1 ladder, powers on. |
| Sap meter | new field props `f.sap, f.powerId, f.powerCd, f.powerCast, f.fx[]` | Added in `makeField()`. |
| Charge hooks | 3 one-line additions inside `resolveTick`, `finishResolve`, `dropPending` | Meter fills from play. |
| Fire dispatch | `firePower(f)`, `castTick(f,dt)`, table `POWERS{}` | Pure functions over `f` / opponent. |
| Player control | one **POWER orb** button (48px, glows when ready) + keyboard `Space`/`P` | AI fires automatically. |
| Effect ticking | `f.fx[]` decremented in `tickField` | Timed statuses (freeze, haste, blind…). |
| Keeper loadout | pre-match strip: pick 1 unlocked power | Beating a pest unlocks its power to equip. |

Powers Mode is deliberately a **superset**: set `f.powerId=null` and the whole subsystem is inert, so Classic literally is Powers-with-no-power. One code path, two menu entries.

---

## 2. Power Resource Model — the **Sap Meter**

Each field has `f.sap ∈ [0,100]` (`SAP_MAX=100`). It is the *only* power currency. It is **earned by playing well and by suffering**, so it rewards offense but also throws a lifeline to a buried player (comeback insurance without being a comeback *engine*).

### Charge sources (all clamp via `addSap(f,n)`)

```js
var SAP_MAX = 100;
var SAP_PER_BEAN  = 0.7;   // each pod that pops
var SAP_PER_CHAIN = 2.0;   // per chain link reached
var SAP_PER_SENT  = 0.6;   // per chaff you forward (capped 10)
var SAP_PER_TAKEN = 0.9;   // per chaff that lands on YOU (capped 12) — comeback aid
function addSap(f,n){ f.sap = Math.max(0, Math.min(SAP_MAX, f.sap + n)); }
```

Three hooks, each one line, in existing functions:

1. **`resolveTick` / `'scan'` substep** (where `cl` = pods cleared this step, `R.chain` incremented):
   `addSap(f, cl*SAP_PER_BEAN + R.chain*SAP_PER_CHAIN);`
2. **`finishResolve`** (after `opp.pending+=out`):
   `addSap(f, Math.min(out,10)*SAP_PER_SENT);`
3. **`dropPending`** (after `drop` chaff placed on `f`):
   `addSap(f, Math.min(drop,12)*SAP_PER_TAKEN);`

**Pacing:** a clean 3-chain (~12 pods) yields ≈ 8.4 + 6 = **~14 Sap**. An average competitive game gives a cheap power roughly every ~20–30 s and an ultimate roughly once or twice a match. Readable, not spammy.

### Cost, cooldown, cast tell

- **Cost:** subtracted from `f.sap` on fire. Tiers: **Cheap 25 / Light 30–35 / Mid 40–45 / Heavy 55–60 / Ultimate 70**.
- **Cooldown `f.powerCd` (ms):** even with a full meter you cannot re-fire until cd expires. 6–14 s by tier. Ticked down in `tickField`.
- **Cast tell `f.powerCast={id,t}`:** firing does **not** apply instantly. It sets a ~700 ms wind-up (portrait flash + SFX + a "⚡ INCOMING" banner over the *target*). `castTick` runs the effect at `t<=0`. This is the anti-degenerate keystone (§4): every offensive power is **dodgeable** — the victim gets ~0.7 s to hard-drop or reposition.

```js
function powerReady(f){ return f.powerId && !f.powerCast && f.powerCd<=0 && f.sap>=POWERS[f.powerId].cost; }
function firePower(f){ if(!powerReady(f))return false;
  var P=POWERS[f.powerId]; f.sap-=P.cost; f.powerCd=P.cd;
  f.powerCast={id:f.powerId, t:P.selfCast?0:700};   // self/defense powers can fire instant
  SFX.cast&&SFX.cast(); return true; }
function castTick(f,dt){ if(!f.powerCast)return; f.powerCast.t-=dt;
  if(f.powerCast.t<=0){ var P=POWERS[f.powerCast.id]; f.powerCast=null; P.run(f, other(f)); } }
function other(f){ return f===MATCH.pf?MATCH.of:MATCH.pf; }
```

### UI (readable at 60fps, 48px targets)

- **Vertical Sap bar** drawn on each board's inner edge (reuse the pending-warning gutter). Fills bottom-up, sage→gold gradient; a **notch line** marks the equipped power's cost so "am I ready?" is one glance.
- **Ready state:** bar pulses gold, the equipped-power **orb** (portrait/emoji of the equipped power) glows.
- **Player POWER orb button:** a 56px glowing circle to the right of `#dropbtn` in `#s-play`; disabled/greyed until `powerReady(pf())`. Keyboard `Space` or `P`. On tap: `if(playable())firePower(pf());`.
- **During cast:** the target board shows the `⚡ INCOMING <PowerName>` banner via the existing `f.floats` system (`f.floats.push({txt:'⚡ Bindweed!',big:true,life:.9,fld:target})`).
- **AI** has no button; it calls `firePower(of())` from its policy (§4).

---

## 3. The 15 Powers

Colors are `1..5`; `CHAFF=6`. Every power is a pure mutation of one or both fields and respects the invariants in §4. Each is one distinct **verb** — no two powers do the same thing, so balance and code stay legible. `self`/`opp` are fields.

### Timed-effect substrate (used by control powers)

```js
// f.fx entries: {k:'haste',t,mul}, {k:'swap',t}, {k:'lockrot',t}, {k:'blind',t}, {k:'wilt',t}
function hasFx(f,k){ for(var i=0;i<f.fx.length;i++) if(f.fx[i].k===k) return f.fx[i]; return null; }
function addFx(f,k,ms,extra){ var e=hasFx(f,k); if(e){ e.t=Math.max(e.t,ms); } else { e={k:k,t:ms}; if(extra)for(var p in extra)e[p]=extra[p]; f.fx.push(e); } }
// tickField: for each fx, fx.t-=dt; splice when <=0.
```

Consumed by: `moveP` (respect `swap`, block on `wilt`), `tryRotate` (block on `lockrot`/`wilt`), gravity in `tickField` (paused while `wilt`), `spawnPiece` (apply `haste` gravMs & decrement its piece counter), render (grey pods while `blind`). **Refresh-not-stack** (`Math.max`) so effects can't be extended into an unfair lock.

---

### Player / KEEPER — chooseable loadout 🌿

The Keeper **equips one** power per match. Default kit is the three *self/economy* powers (fair, defensive-leaning). **Beating pest N unlocks pest N's power** to equip too — a clean progression hook. Stored `LS 'cw_power'`.

**K1 — "Deep Roots" (Cleanse)** · *self* · cost **40** · cd 12s
Removes all `CHAFF` from your own board, then `applyGravity(self.grid)`. Does **not** auto-pop (see §4).
```js
run:function(self){ var r,c,n=0; for(r=0;r<ROWS;r++)for(c=0;c<COLS;c++) if(self.grid[r][c]===CHAFF){self.grid[r][c]=0;n++;} applyGravity(self.grid); self.floats.push({txt:'CLEANSE',big:true,life:1,fld:self}); }
```
*Balance:* pure defense, no board advantage created; costs a Mid tier so you trade tempo for survival. Cap it at clearing ≤18 chaff if you want to keep late-game pressure meaningful.

**K2 — "Bloom Surge" (Fertilize)** · *self/economy* · cost **45** · cd 12s
Your **next** chain's forwarded chaff is ×1.75. Implemented as `self.fertile=1` consumed in `finishResolve`: `if(self.fertile){ out=Math.round(out*1.75); self.fertile=0; }` (applied *after* offset so it can't create negative garbage).
*Balance:* rewards a player who has a chain loaded; useless if you have no chain — so it can't be spammed as raw damage.

**K3 — "Greenhouse Glass" (Shield)** · *self* · cost **35** · cd 10s
Sets `self.shield=1`. In `dropPending`, if `self.shield` and a volley is about to land: consume it and zero this one volley (`self.pending=0; self.shield=0;` before placing). One volley only.
*Balance:* Light cost, but it only eats the *next* wave — timing skill. Cannot stack.

*(Unlockable: any defeated pest's power below can be equipped in the K-slot.)*

---

### The 14 pests (ladder order = rising power)

**0 · The Aphid Swarm 🐛 — "Aphid Rain" (DUMP)** · *offense* · cost **25** · cd 7s
Adds **6** chaff to the rival, scattered, **bypassing offset** (straight into `opp.pending` then a forced small drop, capped so it can never overflow spawn column instantly).
```js
run:function(self,opp){ opp.pending += 6; opp.floats.push({txt:'⚡ Aphids',big:true,life:.9,fld:opp}); }
```
*Balance:* the tutorial power — cheapest, weakest, high frequency, one row's worth. `+pending` (not a direct grid write) means the engine's own `dropPending`/`GARBAGE_CAP` and column-full reallocation handle safety.

**1 · Gnat King Cole 🦟 — "Dizzy Buzz" (SWAP-INPUT)** · *control* · cost **30** · cd 9s
`addFx(opp,'swap',3500)`. While active, `moveP` reads `dc = hasFx(f,'swap')? -dc : dc` (left↔right inverted). For the AI victim, invert its `aiTarget` movement sign the same way.
*Balance:* annoyance, not damage. 3.5 s, dodgeable placements only mildly harmed; no board state altered.

**2 · Mabel Cabbagewing 🦋 — "Wing Dust" (HASTE)** · *control* · cost **30** · cd 9s
`addFx(opp,'haste',0,{pieces:3,mul:0.5})`. For the next **3** pieces, `spawnPiece` sets `f.gravMs = base*0.5` (2× fall speed), decrementing the counter; restores after.
*Balance:* pressure without adding chaff; skilled players still place fine, panicky ones misdrop. Bounded to 3 pieces.

**3 · Sir Reginald Slugmore 🐌 — "Slime Coat" (HARDEN)** · *offense/denial* · cost **40** · cd 11s
Converts the **lowest colored pod in each of the 6 columns** to `CHAFF` (≤6 cells). Height unchanged (color→chaff in place) so it **cannot** cause a top-out — it just makes the base harder to clear.
```js
run:function(self,opp){ for(var c=0;c<COLS;c++){ for(var r=ROWS-1;r>=0;r--){ if(isColor(opp.grid[r][c])){ opp.grid[r][c]=CHAFF; break; } } } }
```
*Balance:* denies a foundation without raising the stack; no auto-pop, so it can't chain-kill. Mid cost.

**4 · Chompers the Cutworm 🪱 — "Sever" (LOCK-ROT)** · *control* · cost **35** · cd 10s
`addFx(opp,'lockrot',3000)`. `tryRotate` returns false while active. Movement/drop still work, so never a soft-lock.
*Balance:* forces the victim to place with current orientation for 3 s — real but escapable (they can still shuffle columns / hard-drop). Light-mid.

**5 · Baron von Beetle 🪲 — "Carapace" (SHIELD+CLEANSE, self)** · *self* · cost **45** · cd 12s · **instant** (`selfCast`)
Clears up to **12** chaff from the Beetle's **own** board (nearest-to-top first), `applyGravity`, and sets `self.shield=1` (eats one incoming volley). First defensive pest power — armor beetle.
*Balance:* self-only, no offense; Mid-Heavy cost. Cap of 12 keeps it from being a full board wipe.

**6 · Escargeddon 🐌 — "Slime Spiral" (RECOLOR-SHIFT)** · *offense/disrupt* · cost **45** · cd 11s
Shifts every colored pod in the rival's **bottom 2 rows** by `+1` (mod `opp.colors`): `v = (v % opp.colors) + 1`. Scrambles their built base pattern. **No auto-pop** — any resulting 4-group only pops when the victim next locks a piece (deterministic, dodgeable).
*Balance:* can occasionally *help* the victim (random alignment) — that variance is the intended risk of a snail's chaos, and it keeps the power from being oppressive. Bounded to 12 cells, no height change.

**7 · Cawlin the Crow 🐦 — "Crow's Shroud" (BLIND)** · *control* · cost **40** · cd 11s
`addFx(opp,'blind',4000)`. Renderer draws the victim's falling pair and NEXT preview as neutral grey silhouettes for 4 s (colors hidden, positions still visible). Purely informational denial.
*Balance:* zero board mutation; punishes players who rely on the preview, fair to those who plan. Mid.

**8 · Gustavo the Gopher 🦫 — "Undermine" (BOTTOM-INSERT)** · *offense* · cost **50** · cd 12s
Tunnels under **2 random non-full columns** and inserts one `CHAFF` cell at the **base**, shoving that column's stack **up by 1**. Skips any column that would push a pod above row 0 (hard guard against instant top-out).
```js
run:function(self,opp){ var picks=nonFullCols(opp.grid,2); for(var i=0;i<picks.length;i++){ var c=picks[i];
   if(opp.grid[0][c]!==0)continue;                    // guard: don't overflow
   for(var r=0;r<ROWS-1;r++)opp.grid[r][c]=opp.grid[r+1][c]; opp.grid[ROWS-1][c]=CHAFF; } }
```
*Balance:* the only power that raises height from *below* (buries good pods, threatens the top) — genuinely dangerous, hence Heavy cost + a per-cell guard so it can never place above the board.

**9 · Duchess Dapple 🦌 — "Hooffall" (DESCEND-SLAM)** · *control/tempo* · cost **45** · cd 11s
Instantly slams the rival's **current falling piece** to its ghost position and locks it (`opp.cur.r=ghostY(opp); lockPiece(opp);`), denying them placement time. No-op if they have no `cur` (mid-resolve). One piece only.
*Balance:* steals ~1 piece of planning; can occasionally trigger the victim's own chain (risk/reward), and does nothing if fired at the wrong instant — timing power, not raw damage. Mid.

**10 · Lady Bindweed 🌿 — "Bindweed's Embrace" (WILT / full freeze)** · *control* · cost **55** · cd 13s
`addFx(opp,'wilt',2200)`. Total input freeze: `moveP`/`tryRotate`/`hardDrop` no-op **and gravity is paused** for that field in `tickField` (piece truly frozen, so freezing can never *cause* a bad lock or top-out). 2.2 s.
*Balance:* the classic Puyo "stun," but Heavy cost, capped duration, refresh-not-stack, and gravity-safe so it only steals time, never kills.

**11 · Miss Mildew 🍄 — "Spore Bloom" (CHAFF-SPREAD)** · *offense* · cost **55** · cd 13s
Every existing `CHAFF` on the rival board spreads to **at most 8** random empty orthogonal neighbors (hard cap `SPORE_CAP=8`), then `applyGravity`. If the rival has no chaff, it seeds 3 chaff at column tops instead (so it isn't a dead button). Guard: never write to row < 0.
*Balance:* scales with how buried the victim already is (thematic mildew), but the flat 8-cell cap + gravity settle prevents an avalanche. Heavy cost, long cd. Because it only spreads *existing* chaff, a clean board barely feels it — self-limiting.

**12 · Baron Greymould 👑 (BOSS) — "Grey Tide" (BOSS BOMB)** · *offense/ultimate* · cost **70** · cd 16s
The Robotnik moment: dumps **12** scattered chaff bypassing offset (`opp.pending+=12`) **and** `addFx(opp,'haste',0,{pieces:2,mul:0.6})`. Two rows plus a shove. Respects `GARBAGE_CAP` via the normal drop path.
*Balance:* Ultimate cost (fires ~once or twice a match), long cd, telegraphed 700 ms. Big but survivable — 12 chaff is under the 30-cap and the haste is only 2 pieces. Signature boss threat, not an instakill.

**13 · The Ronin Hare 🐰 (SECRET) — "Iai Strike" (REFLECT/COUNTER)** · *reactive/ultimate* · cost **70** · cd 15s
For **5 s** the Hare enters a counter-stance (`addFx(self,'iai',5000)`). While active, any chaff that *would* land on the Hare (in `dropPending`) is instead **reflected back at the attacker ×1**, capped at 12: `if(hasFx(self,'iai')){ opp.pending += Math.min(drop,12); drop=0; }`. A pure duelist's parry.
*Balance:* does nothing unless you attack into it — the entire skill is *baiting or avoiding* the stance. Ultimate cost, self-buff (instant cast, no tell needed since it's defensive), 5 s window. The secret boss's fantasy: punish aggression.

---

### Quick reference

| # | Character | Power | Verb | Type | Cost | CD |
|---|---|---|---|---|--:|--:|
| K | Keeper 🌿 | Deep Roots / Bloom Surge / Greenhouse Glass | cleanse / fertilize / shield | self | 35–45 | 10–12 |
| 0 | Aphid Swarm 🐛 | Aphid Rain | dump +6 | offense | 25 | 7 |
| 1 | Gnat King Cole 🦟 | Dizzy Buzz | swap L/R 3.5s | control | 30 | 9 |
| 2 | Mabel Cabbagewing 🦋 | Wing Dust | haste ×2, 3 pcs | control | 30 | 9 |
| 3 | Sir Reginald Slugmore 🐌 | Slime Coat | harden base ≤6 | denial | 40 | 11 |
| 4 | Chompers the Cutworm 🪱 | Sever | lock rotation 3s | control | 35 | 10 |
| 5 | Baron von Beetle 🪲 | Carapace | self-cleanse+shield | self | 45 | 12 |
| 6 | Escargeddon 🐌 | Slime Spiral | recolor bottom 2 rows | disrupt | 45 | 11 |
| 7 | Cawlin the Crow 🐦 | Crow's Shroud | blind 4s | control | 40 | 11 |
| 8 | Gustavo the Gopher 🦫 | Undermine | bottom-insert chaff ×2 | offense | 50 | 12 |
| 9 | Duchess Dapple 🦌 | Hooffall | force-slam piece | tempo | 45 | 11 |
| 10 | Lady Bindweed 🌿 | Bindweed's Embrace | full freeze 2.2s | control | 55 | 13 |
| 11 | Miss Mildew 🍄 | Spore Bloom | spread chaff ≤8 | offense | 55 | 13 |
| 12 | Baron Greymould 👑 | Grey Tide | dump 12 + haste | ultimate | 70 | 16 |
| 13 | Ronin Hare 🐰 | Iai Strike | reflect 5s | counter | 70 | 15 |

---

## 4. Balance & anti-degenerate rules

These are **invariants** — every power's `run` must honor them, enforced at review:

1. **No power sets `f.dead` or ends a match.** Top-out happens *only* through real gravity/placement in `spawnPiece`/`lockPiece`. Powers pressure; the engine kills.
2. **Every chaff-adding power is bounded and routed through `pending`/`dropPending`.** Max additions: Aphid 6, Gopher 2, Boss 12, Mildew 8 — all under `GARBAGE_CAP=30`, all subject to the existing column-full reallocation. Bottom-insert (Gopher) and spread (Mildew) carry an explicit **"never write above row 0"** guard, so no single power can overflow the spawn column in one shot.
3. **No power auto-pops.** Board mutations (Harden, Recolor, Undermine, Spore) never call `startResolve` themselves. Any 4-group they create waits for the victim's next lock to resolve normally. This is the hard stop against **power→infinite-cascade** loops.
4. **Cooldown floor + meter cost = no spam.** A power can't refire until `powerCd` and can't fire without paying Sap. The two together bound frequency independent of how fast the meter refills.
5. **Every *offensive* power is telegraphed and dodgeable.** The 700 ms `powerCast` wind-up + `⚡ INCOMING` banner means no effect is *unavoidable* — the victim can hard-drop or reposition first. Defensive/self powers (`selfCast`) fire instantly because there's no one to be unfair to.
6. **Freezes are gravity-safe and refresh-not-stack.** `wilt` pauses the victim's gravity too, so a freeze can never *force* a bad lock; `Math.max` on duration means an opponent can't chain-lock you into oblivion.
7. **Symmetry.** The player has a Sap meter and a power on the exact same rules; the ladder isn't the AI cheating, it's the AI holding a card you can also hold (and unlock).
8. **Diminishing self-scaling.** Comeback Sap (`SAP_PER_TAKEN`) helps a buried player *fire once*, but firing costs the meter, so it can't spiral into a comeback *engine* — one lifeline, not infinite ones.

### Difficulty & how the AI uses powers

AI fires from a policy in `aiUpdate` (once per spawn, never per-frame — keeps 60fps): `if(powerReady(f) && shouldFirePower(f)) firePower(f);`. `shouldFirePower` is gated by the same `q` knob that already scales the pest AI:

- **Trigger sense by type:** offense powers fire when the rival board is tall (`colHeights` max ≥ 8) or the AI just landed a chain (press the advantage); defense/cleanse when the AI's own `countChaff(grid)` is high or `f.pending` is large; reflect (Hare) pre-emptively when it senses your loaded chain.
- **`q` scales judgment, not raw access:**
  - `q < 0.35` (pests 0–3): fire **greedily/suboptimally** — often the moment the meter's ready, at bad times. Feels like a flailing bug.
  - `0.35 ≤ q < 0.6` (pests 4–7): fire on a simple heuristic (rival tall OR self buried), ~1 s reaction.
  - `q ≥ 0.6` (pests 8–13): fire at genuinely good windows, hold ultimates for when you're vulnerable, and use defense reactively — mirrors the existing "only `q≥0.6` counters your board" rule.
- **Handicap synergy:** late bosses already carry `startChaff` and `hcap`; their heavier powers (Bindweed, Mildew, Grey Tide, Iai) plus better timing *are* the added difficulty — no new stat knobs needed. Optionally scale `SAP` gain by `hcap` so bosses charge a touch faster.

---

## 5. Phased build plan

### Phase 0 — Scaffolding you can program NOW (½ day)

Minimal, ships behind the new menu button, proves the whole loop with **two** powers.

1. **Mode flag + menu:** add `'powers'` handling to `startMatch`; add `#b-powers` button → runs the campaign ladder with `MATCH.powers=true`.
2. **Field props:** in `makeField()` add `sap:0, powerId:null, powerCd:0, powerCast:null, fx:[], shield:0, fertile:0`.
3. **Charge hooks:** the 3 one-liners in `resolveTick`/`finishResolve`/`dropPending` + `addSap`.
4. **Dispatch:** `POWERS{}` table, `firePower`, `castTick`, `powerReady`, `other`; call `castTick(pf,dt)`/`castTick(of,dt)` and decrement `powerCd`/tick `fx` inside `tickField`.
5. **UI:** vertical Sap bar in the render pass; a 56px glowing **POWER orb** button in `#s-play` + `Space`/`P` key → `firePower(pf())`; AI calls `firePower(of())` from a trivial "fire when ready" stub.
6. **Wire exactly two powers:** Keeper **K1 Deep Roots** (self cleanse) and Aphid **Aphid Rain** (dump). Assign `of().powerId = ROSTER[stage].id`, `pf().powerId = LS('cw_power')||'keeper_roots'`.

Deliverable: you can fill the meter, press the orb, watch chaff appear on the pest and clear off your own board. Everything else is `run:function(){}` stubs.

### Phase 1 — the board-safe set (no timers) (1 day)
Wire the powers that are pure grid/`pending` mutations, no status effects: **Bloom Surge, Greenhouse Glass, Slime Coat, Carapace, Slime Spiral, Undermine, Grey Tide, Iai Strike** (`iai` uses one fx flag but no input plumbing). Add the §4 guards and unit-check they never write above row 0. Add Keeper loadout: unlock-on-win + pre-match pick strip storing `cw_power`.

### Phase 2 — the timed-control set (1 day)
Build the `f.fx` plumbing consumers: **Dizzy Buzz** (`swap` in `moveP`), **Wing Dust** (`haste` in `spawnPiece`), **Sever** (`lockrot` in `tryRotate`), **Crow's Shroud** (`blind` in render), **Bindweed's Embrace** (`wilt` in `moveP`/`tryRotate`/gravity), **Hooffall** (instant slam). This is the only phase touching input/gravity paths, so it's isolated and testable in one pass.

### Phase 3 — polish, AI policy, balance (1 day)
Replace the "fire when ready" stub with the `q`-scaled `shouldFirePower` policy (§4). Add cast tells (portrait flash, `⚡` banner, SFX). Run the existing headless bot harness (`scripts/…` bot pattern) across the 14 pests in Powers Mode to confirm no soft-locks, no instant top-outs, and reasonable fire cadence. Tune the cost/cd/`SAP_PER_*` constants — all live as top-of-file constants, so every rebalance is a one-line change, exactly like `CHAIN_POWER_TSU` today.

**Art/audio** (deferred, per the frame manifest): each power needs a cast portrait state + a board FX (≈ the "attacking" portrait states already budgeted, + ~1 FX flourish each). Do **not** drop into the Drive pipeline until the Director greenlights — same rule as the base manifest.

---

### Files touched
Everything lives in the one file `satellites/chaff-wars/index.html` (single self-contained ES5), following the house satellite pattern. No new files, no frameworks, no dependencies — the Sap subsystem is ~150 lines of new code plus 3 one-line charge hooks and one menu button.