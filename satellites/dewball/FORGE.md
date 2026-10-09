# DEWBALL FORGE, THE RUNNING LOG OF THE TOP TIER BUILD

The plan is `plans/dewball/DEWBALL-TOP-TIER-PLAN-OCT09.md`. This file is what actually happened, phase by phase,
with the numbers measured at the time. Newest phase at the bottom. Times are UTC.

---

## Phase 0, read and measure (9 Oct 2026)

**Meshy balance, 15:57 UTC: 4,120 credits** (`GET /openapi/v1/balance`, the key read from the environment, never
printed). No task has been created; `tools/forge/meshy-tasks.json` does not exist yet.

### Baseline: smoke (all worlds), `node smoke.js`

`SMOKE_PASS` in 5.6 s. Ladder ceilings (`absorbAll`, cm), identical to the decimal to LANDMARKS.md and AUDIT-NOTES.md:

| world | ceiling | needs (s3 x 1.15) | walls left | courts |
|---|---|---|---|---|
| w1 | 325 | 311 | 0 | reachable |
| w2 | 677 | 448 | 0 | reachable |
| w3 | 1607 | 1403 | 0 | reachable |
| w4 | 2804 | 2473 | 0 | reachable |
| w5 | 6090 | 5704 | 0 | reachable |
| w7 | 12677 | 12391 | 0 | reachable |
| w6 zen | 1382 | sweeps to zero | 0 | n/a |

### Baseline: the near bot on w1, `node balance.js 1 <seed> 1 near`

| seed | goal (t100) | two stars (t140) | three stars (t190) | bot end size | absorbs |
|---|---|---|---|---|---|
| 12345 | 40.1 s | 82.0 s | 103.5 s | 319.1 cm | 3301 |
| 777 | 40.1 s | 76.3 s | 99.1 s | 319.4 cm | 2896 |

`BALANCE_PASS` both. Clock 165 s. These are the numbers a world 1 batch must hold within ten percent (plan 4.6).

### Baseline: performance on w7, the biggest world

Probe: the real `index.html` with a `DB_DEV.perf` hook injected into a scratch copy (Phase 1 makes it permanent),
headless Chrome on SwiftShader, 915x412 at DPR 1, seed 12345, the ball parked at spawn, `setD` to three sizes,
40 frames each. **Draw calls and triangles are exact. Milliseconds are a software GPU on one physical core and are
not phone numbers** (perf_ab.js's own warning, still true); the JS tick under a 4x CPU throttle is the only time
here that means something for a phone.

| ball | draw calls | triangles drawn | tick median / p95 at 4x throttle |
|---|---|---|---|
| 45 cm (spawn) | 145 | 922,108 | 1.7 / 10.9 ms |
| 400 cm | 157 | 923,958 | 2.2 / 10.4 ms |
| 1500 cm | 181 | 927,896 | 1.2 / 8.3 ms |

What this says: every InstancedMesh is `frustumCulled=false`, so **every placed instance of every kind is drawn every
frame**: about 920 thousand triangles on w7 whatever the camera sees. That is the base the plan's fence multiplies
(draw calls at most 2x, triangles at most 3x). It also means the two set LOD is not optional: a 600 triangle kind
with 300 instances drawn everywhere is 180,000 triangles by itself.

The run took 10 minutes, almost all of it SwiftShader rendering under the 4x throttle; the permanent probe throttles
the tick only.

### The manifest (`tools/forge/manifest.mjs`, spends nothing)

Built from the real engine, not from the plan's table, and the plan's table was wrong in both directions:

- **286 kinds are declared, 282 are placed in at least one world** (the plan said 195 and 185). Four landmark kinds
  are declared and never placed (lmDollHouse, lmSundial, lmCakeStand, lmTeapotHill, the ones the wave two review
  replaced).
- **41 landmark kinds, 37 placed** (the plan said 11).
- Under the plan's own tier rules (4.3), tier A is **180 kinds**: landmarks 37, movers 21, keepsakes 30, gate prizes
  13, set anchors 79. Tier B is 54, tier C 48, tier D 0.
- **Tier D is empty under the literal rule** ("under a tenth of the start diameter": w1 starts at 4 cm, so a tenth
  is 0.4 cm and the smallest prop in the game is the 1.6 cm crumb). It does not change the spend, because C and D
  both stay primitives this month; the crumbs land in C.
- At the plan's 35 credits a kind, A plus B is **8,190 credits** for 234 kinds. The 4,120 on the account covers the
  first 117 in spend order, which is world by world: w1 1,715, w2 1,365, w3 1,365, w4 1,330, w5 1,260, w7 980,
  w6 175. **World 1 alone is 49 kinds and about 1,715 credits**, against the plan's "roughly 25 kinds, about 900".
- The 35 is the plan's estimate from the ripcord image to 3D run (30k polycount, PBR). Tumble measured a meshy-5
  preview at 5 credits. **The pilot measures the real cost per kind for each model type**, and the manifest is rerun
  with that number (`CREDITS_PER_KIND`) before world 1 starts.

Bug found and fixed while building it: Dream Meadow has no goal (`goalD` 0), so every kind placed there passed "at
or above a third of the goal" and the 1.6 cm crumb came out as big food. Zen now lends roles only; a kind that lives
only in zen is C unless a role makes it A.

Gate prizes as the engine places them (the biggest edible kind behind each gate; a ring gate's loot is the band
between it and the next ring):

- w1: Dessert Corner 14 coolerbox · The Cake Table 26 cakestand · The Grown-ups' Table 36 picnictable
- w2: The Play Mat's Edge 22 boardgame · The Shelf 55 boardgame · The Toy Chest 95 dollhouse
- w3: The Moss Ring 32 scarecrow · The Garden Hedge 80 pergola · The Old Wall 145 pergola
- w4: The Stall Rope 60 stall · The Market Arch 160 stall · The City Gate 380 minaret
- w5: The Dune Fence 160 sailboat · The Boardwalk Rail 550 harborcrane · The Harbor Wall 1250 harborcrane
- w7: The Garden Wall 120 whalebone · The Town Wall 420 harborcrane · The Old Ramparts 1300 graypeak · The Edge of
  the World 2600 graypeak

Gate: `node satellites/dewball/tools/forge/manifest.mjs --check` prints `MANIFEST_FRESH` or `MANIFEST_STALE` and
exits 1 when the committed manifest no longer matches the engine.
