# GARDEN GUARD — Unified Design Spec (v1, buildable)

Single-file vanilla JS/HTML5 canvas satellite for Lucid Winds. 540x960 portrait virtual space, letterboxed. Zero external assets (everything Canvas-2D drawn). localStorage save. Routes Sunbeams through the shared 30/day helper.

---

## BALANCE PASS: conflicts found and fixed

The three subsystems collided in twelve places. Resolutions below are baked into the sections that follow.

1. **Currency names collided** (Sap meant "in-run" in one doc and "meta" in another). CANONICAL: in-run building currency = **Seeds 🌱**, lives = **Leaves 🍃**, local meta currency = **Sap 🍯**. All tower costs are now Seeds. The "Compost Bin" tower keeps its name but generates Seeds (it is not a currency).
2. **Tower roster collided** (9 towers with hand-tuned tiers vs a different 8 with swapped Marigold/Cactus roles and a "Bramble"). CANONICAL: the 9-tower roster with hand-tuned, DPS-verified tiers. "Bramble" is CUT; its AoE counter duties fold into Cactus (ring) and Puffball (lobbed).
3. **Upgrade model collided** (explicit per-tier numbers vs a flat +45%/+12%/+10% formula). CANONICAL: the explicit per-tier numbers (they are DPS-checked and role-shaped). The flat formula is discarded.
4. **Income vs HP-ramp starvation.** Bounties were flat while enemy HP scales 2.32x by level 12, and maps are plot-limited, so a level-12 board could not be funded. FIX: added a per-level bounty scalar `1 + 0.10*(level-1)` so income tracks the HP ramp at ~90% its rate. Early levels stay forgiving, late levels demand efficiency without starving you.
5. **Level 1 was too hard.** The "concrete level 1" waves contained slugs and flyers, contradicting both the pest-unlock table AND the aphid-only tutorial. FIX: Level 1 rewritten as a gentle aphid/ant tutorial. Pest introductions now obey the unlock table (grub L2, slug L3, moth L4, and so on).
6. **Anti-air rule was fuzzy** and one doc listed the 0-damage Scarecrow as anti-air. FIX: Beehive is the efficient, effectively-required anti-air. Only Sunflower, Pitcher, Sundew, Puffball-splash, and Marigold-T3 can even touch air, and each is a weak or costly backstop. Cactus, Scarecrow, and Compost cannot hit air at all.
7. **Armor counter was wrong** (claimed low-per-hit Cactus beats flat armor). FIX: armor subtracts from DIRECT projectile hits only; DoT (Pitcher acid, Cactus T3 barb-bleed, Beehive sting) BYPASSES armor. Real armor answers: Sunflower (big hits) and Pitcher (armor-melt).
8. **Boss HP could run away** under full level scaling. FIX: boss HP scale capped at 1.8.
9. **Star rating** was fixed to /20 but lives vary by difficulty. FIX: stars are a FRACTION of starting Leaves.
10. **Levels-per-world collided** (12+boss vs 6). CANONICAL shipped content: World 1 = 12 levels + a boss level (13 nodes) across 4 maps. The 5-world frame is kept as forward scope in the save schema.
11. **Wave-clear bonus** reconciled to `10 + 2*waveNumber`.
12. **Boss bounty** reconciled to 120 Seeds plus a 25 Sap run-end bonus.

---

## 1. HOOK + PORTAL CARD

**One-line hook:** Plant a garden that fights back. Cozy tower defense where marigolds, cacti, and beehives shoo the bugs off your path.

**Portal card blurb (zero dashes):**
> Garden Guard. The pests are marching, so plant your friends and hold the line. Nine botanical towers, thirteen kinds of critter, and four moonlit garden maps. Marigolds flick seed darts, cacti bristle, beehives chase the flyers, and a sleepy sundew gums everything up so the rest can work. Earn Sap, deck out the Potting Shed, and chase three leaves on every level. Warm, unhurried, and easy to pick up in a minute.

---

## 2. TOWER TABLE

All costs in Seeds 🌱. DoT (Pitcher acid, Cactus T3 barb, Beehive sting) bypasses armor; direct hits subtract armor. Full-max = base + both upgrades.

### Roster summary

| id | name | base | full-max | role | default target | hits air? |
|---|---|---|---|---|---|---|
| marigold | Marigold Turret | 50 | 190 | single DPS | First | T3 only (weak) |
| cactus | Prickle Cactus | 75 | 280 | point-blank ring AoE | auto (ground) | NO |
| pitcher | Pitcher Plant | 85 | 340 | stacking DoT / armor-melt | Strongest | yes (low burst) |
| sundew | Sundew Snare | 90 | 330 | slow aura | aura (all) | slows air (~0 dmg) |
| scarecrow | Scarecrow | 100 | 400 | support buff | aura | NO (0 dmg) |
| puffball | Puffball Lobber | 110 | 400 | lobbed splash AoE | First / most-clustered | low flyers in splash |
| beehive | Beehive | 120 | 430 | anti-air (dedicated) | flyer-priority | YES (primary) |
| compost | Compost Bin | 130 | 470 | economy | none (passive) | NO (0 dmg) |
| sunflower | Sunflower Sniper | 200 | 700 | long-range burst / boss-killer | Strongest | yes (slow, pricey) |

Targeting menus (First / Last / Closest / Strongest) exposed on: Marigold, Puffball, Pitcher, Sunflower, Beehive (Beehive always flyer-prioritizes within the chosen sort). Cactus, Sundew, Scarecrow, Compost have no menu.

### Per-tower tiers (dmg / rangePx / fireEveryMs / upgradeCost)

**Marigold Turret** (single seed-dart, ~520px/s projectile)
- T1: 8 / 100 / 900 / (base 50). DPS ~8.9.
- T2: 14 / 115 / 800 / 50. Twin-dart. DPS ~17.5.
- T3: 24 / 130 / 700 / 90. 3-dart volley, 12% per dart deals 2x. DPS ~34 (~38 w/ crits). Can now tag flyers (weak).
- Draw: terracotta trapezoid pot (#5a4a2a, 26px), 2px sage stem, radial pompom of ~12 teardrop petals (#e08a3a to #c8a84b), gold center circle r6 with ochre dot. On fire rotate bloom to face target, flash center white 60ms.
- Synergy: Sundew (slowed pests eat more darts) + Scarecrow (fire-rate turns darts into a stream). Weak vs armor and elites.

**Prickle Cactus** (auto-hits ALL ground pests in ring; never air)
- T1: 6 / 60 / 1100 / (base 75). 5 pests = 30 dmg/pulse.
- T2: 10 / 72 / 1000 / 65.
- T3: 16 / 88 / 900 / 130. Barb: hit pests bleed 2 dmg/0.5s for 1.5s (DoT, bypasses armor).
- Draw: fat rounded body (sage #7ab356, 3 rib lines #9ac876, 22x40), two stub arms, ~16 cream 1.5px spikes outward. On pulse draw expanding cream ring (reduced-motion: static flash).
- Synergy: anchor on bends/U-turns; pair with Sundew/Puffball. Do not stack two; spread across chokes.

**Pitcher Plant** (stacking acid DoT; targets Strongest; hits air; DoT bypasses armor)
- T1: 4 / 95 / 1200 / (base 85). Acid 4/0.5s for 3s (24), stacks 2.
- T2: 6 / 105 / 1200 / 85. 6/0.5s for 3s, stacks 3.
- T3: 9 / 120 / 1100 / 170. 9/0.5s for 4s, stacks 4; corroded pests take +15% from ALL sources.
- Draw: tall tapering tube (14x42, sage #7ab356 to dull purple #6a4a6a lip, 3 red veins), angled hood. Acid droplets arc to target; corroded pests get a green dripping underline marker.
- Synergy: the elite/armor answer. T3 vulnerability buffs every other tower (pair with Sunflower). Bad vs swarms.

**Sundew Snare** (slow aura, near-zero dmg, all pests incl. air)
- T1: 2 / 90 / 600 / (base 90). 25% slow, 2/tick. Does not stack (strongest wins).
- T2: 3 / 100 / 600 / 80. 40% slow, 3/tick.
- T3: 4 / 115 / 600 / 150. 55% slow; 1.5s sticky residue after leaving; every 4s ROOTS strongest pest 0.5s.
- Draw: low starburst of ~8 curved red tendrils (#e0533a, 1.5px) each ending in a cream dew bead with white specular. Faint sage slow-field ring (alpha 0.12). Tag slowed pests with a cream droplet glyph.
- Synergy: force-multiplier under any AoE kill-zone. Never a solo carry (by design).

**Scarecrow** (support buff aura, 0 dmg)
- T1: 0 / 100 / 8000 / (base 100). +15% atk speed to towers in range; crow proc every 8s flinches 5% of passers 0.3s.
- T2: 0 / 115 / 8000 / 100. +25% speed, +10% range.
- T3: 0 / 130 / 8000 / 200. +35% speed, +15% range, +10% dmg; every 8s freezes ALL ground pests in range 0.8s. Buffs do not stack (highest applies).
- Draw: wooden post (#5a4a2a) + crossbar with straw tufts (#c8a84b), burlap head (#b3a077) with stitched X eyes and smile, straw hat. Aura = DASHED sage circle. Crow proc = 2-3 dark chevron birds.
- Synergy: drop in your densest DPS cluster. Useless alone.

**Puffball Lobber** (lobbed splash; low flyers caught)
- T1: 12 / 120 / 1500 / (base 110). 45px splash, arcing shot.
- T2: 20 / 130 / 1400 / 95. 55px splash.
- T3: 32 / 145 / 1300 / 180. 70px splash + lingering cloud 1.5s dealing 4/0.5s.
- Draw: smooth dome cap (#8a9178 with #b3b8a4 highlight, 34px) on stubby stem, 5-6 dark speckles. Arcing grey spore projectile; impact = expanding translucent puff.
- Synergy: classic Sundew combo (cluster sits in cloud). Reaches where Cactus cannot; Cactus at chokes, Puffball on straights.

**Beehive** (dedicated anti-air, homing bees, flyer-priority)
- T1: 7 / 130 / 700 / (base 120). 1 bee. DPS ~10 on a flyer.
- T2: 9 / 145 / 650 / 100. 2 bees. DPS ~28.
- T3: 12 / 160 / 600 / 190. 3 bees, each applies sting 3/s for 1s (DoT, bypasses armor).
- Draw: amber banded skep dome (#c8a84b, 4-5 darker band arcs #a8863a, dark entrance oval), 2-3 orbiting bee dots (gold ovals, black stripe). On fire a bee detaches and homes with a dotted trail.
- Synergy: effectively required once flyers arrive. Idles on ground-only stretches, do not over-invest early.

**Compost Bin** (passive Seed generator, 0 defense)
- T1: 0 / 80 / 5000 / (base 130). +8 Seeds/5s, +1 per pest composted within 80px this interval. Break-even ~45s.
- T2: 0 / 80 / 5000 / 110. +14 Seeds/5s.
- T3: 0 / 90 / 4500 / 210. +22 Seeds/~4.5s; also +2 **Sap** (meta) per wave finished with the bin standing.
- Draw: dark slatted wood box (#5a4a2a, 3 slats #6f5a30), slightly open lid, 2 sage sprout leaves. On tick float a gold "+" upward + faint steam (reduced-motion: skip steam).
- Synergy: tempo gamble on a scarce plot. Protect it; never rush it on hard maps.

**Sunflower Sniper** (long-range burst, ground AND air, slow)
- T1: 45 / 200 / 2000 / (base 200). DPS ~22.5. Longest reach.
- T2: 75 / 220 / 1900 / 160. +50% vs the "strongest"-flagged target. DPS ~39.
- T3: 120 / 250 / 1800 / 300. Beam PIERCES the whole line to target; +50% vs strongest. DPS ~67 single, far more on a column.
- Draw: thick sage stalk + drooping leaf, large brown seed disc (r14, stippled spiral) ringed by ~18 sharp gold ray petals. Head slowly rotates to target; charge tell brightens disc to near-white 0.4s then fires a cream/gold beam line.
- Synergy: Pitcher (melt then one-shot) + Sundew (columns line up for pierce). Overkill on chaff. NOTE: capped-damage bosses (Slug King) blunt it, use fast towers there.

---

## 3. ENEMY TABLE

hp/speed are base (Normal, level 1). Apply `hpMult` (difficulty) x `levelHpScale(level)`; speed x `levelSpeedScale`. Bounty x `bountyScale(level)`. Armor subtracts from direct hits only.

| id | name | hp | spd px/s | armor | flying | bounty | leak | special |
|---|---|---|---|---|---|---|---|---|
| aphid | Aphid | 8 | 78 | 0 | no | 2 | 1 | none |
| ant | Marching Ant | 12 | 66 | 0 | no | 3 | 1 | none (dense columns) |
| grub | Cutworm Grub | 40 | 34 | 0 | no | 5 | 1 | regen |
| beetle | Iron Beetle | 60 | 40 | 4 | no | 9 | 1 | armor (flat 4/hit) |
| moth | Cabbage Moth | 30 | 60 | 0 | YES | 6 | 1 | none |
| wasp | Wasp | 26 | 55 | 0 | YES | 8 | 1 | speed-burst (110px/s, 1.2s, every 2.5s) |
| slug | Garden Slug | 120 | 26 | 0 | no | 8 | 2 | none (tank) |
| caterpillar | Loop Caterpillar | 90 | 32 | 0 | no | 9 | 2 | immune-to-slow |
| snail | Shell Snail | 35 | 24 | 0 | no | 10 | 2 | front shield 40, regens if untouched 4s |
| dandelion | Puffball Weed | 55 | 30 | 0 | no | 7 | 2 | splits into 3 seedlings (hp6 spd70) |
| ladybug | Nurse Ladybug | 45 | 44 | 0 | no | 12 | 1 | heals up to 4 pests +5 every 1.5s (r70) |
| thornvine | Creeping Weed | 150 | 20 | 2 | no | 14 | 3 | buds 2 aphids every 6s |

**Canvas recipes** (each unique by SILHOUETTE, colorblind-safe):
- Aphid: pale-green teardrop (ellipse rx6 ry8, #9fd06a, #6f9a3f belly seam), 2 antennae, tiny leg ticks. Smallest.
- Ant: three beads in a row (r4,r5,r5, #2b2620), 6 bent legs, 2 antennae. Reads as a train.
- Grub: fat curled C (5 arc segments, #f2e4c0, #d8c39a lines, #7a5a3a head). Regen = green +hp glint at curl center.
- Beetle: high domed carapace (semicircle r14, slate #3a4048, bright #c8a84b center seam), 2 mandible triangles. Only round-backed dome.
- Moth: bowtie wings (cream #e8dcc8, #8a9178 edge) on fuzzy #6b5f4a body, 4px vertical bob + shadow ellipse (flight tell).
- Wasp: banded pointed abdomen (#c8a84b/#2b2620 bands) to a stinger, swept wings, waist pinch. Darts leave a blur streak.
- Slug: long taupe loaf (rounded rect 34x14, #8a7f6e, top specular), 2 eye-stalks, fading slime trail.
- Caterpillar: 6 overlapping circles (r7, #7ab356, #56813a underside), stub legs, antennae. Longest ground shape. Show broken-chain icon when a slow is attempted (never render it slowed).
- Snail: cream foot + eye-stalks, bold 2.5-turn spiral shell (#b5763f, #7a4a22 rim). Shield = faint arc bubble over shell.
- Dandelion: ~18 white radial spokes (#f4f4ee) + green stem/leaf. On death puffs into 3 single-spoke seedlings.
- Ladybug: red dome (#e0533a) with black spots + wing seam, cream +/cross glyph floating above (healer marker), green heal ring pulse.
- Thornvine: jagged zigzag vine (#4f6b34) with triangle thorns + paired leaves + knotty root ball. Buds pop from a thorn every 6s.

---

## 4. BOSSES (3)

Boss HP = base x hpMult x `bossHpScale(level)` (capped at 1.8). Boss bounty 120 Seeds + 25 Sap run-end.

**The Aphid Queen** (World 1 boss, level 13) — hp 1200.
Mechanic: bloated crawler (speed 22). Births 6 aphids every 5s from her egg-sac; pulls a 2s self-shield (absorbs 150) every 12s. Leaks 8 Leaves at the gate. Counter: Pitcher single-target burst between shield windows + Cactus/Puffball AoE to clear the spawn tide.
Draw: giant pale-green pear body (ellipse ~70x90, #a8d878, segment ridges), 5-point gold crown, stubby legs, translucent egg-sac that pulses before each spawn.

**The Slug King** (World 2 boss, and endless) — hp 2400.
Mechanic: armored, immune-to-slow, per-hit damage cap 30 (no single hit exceeds 30, so glass cannons are blunted). At 50% hp splits ONCE into two 600hp half-kings (keep the cap, cannot re-split). Leaks 12. Counter: fast-tick DPS (Beehive, Marigold, Cactus pulses) beats the cap. Sunflower is intentionally poor here.
Draw: massive dark-taupe slug (~120x60, #6e6350) with a mossy #4f6b34 back ridged with tiny mushroom caps, 2 thick gold eye-stalks, slime trail. Split cleanly mirrors into two.

**The Moon Moth** (World 3 boss, and endless) — hp 1800.
Mechanic: flying (ground-only towers cannot hit; needs Beehive, with Sunflower/Pitcher as costly backup). Erratic bob, fast (speed 58). Every 10s an Eclipse: fades to 30% opacity, untargetable 2s, heals nearby pests +40. Leaks 10. Counter: stacked Beehive burst to break it before heal windows compound.
Draw: luminous moth (~110px wingspan, pale-blue-cream #cfe0f0 wings each with a crescent-moon eyespot glyph), feathery antennae, soft glow halo, bob + shadow. Eclipse fades the body to a thin crescent outline.

---

## 5. MAPS (4)

Portrait 540x960. Path is the no-build zone; towers snap to ~48x48 buildable plots OFF the path. Waypoints are ordered `[x,y]`; enemies lerp between them. Off-screen entry (y=-20) to off-screen gate (y=980).

**Map 1: The Kitchen Garden** (Beginner, levels 1-3)
Waypoints: `(270,-20),(270,140),(140,260),(140,430),(400,540),(400,720),(260,850),(260,980)`
Gentle top-to-bottom S, ~1250px. ~10 wide-spaced plots hugging both inner elbows; the `(140,430)` and `(400,540)` bends have the most path frontage (premium). No obstacles.

**Map 2: The Herb Spiral** (Medium, levels 4-7)
Waypoints: `(270,-20),(270,90),(80,170),(470,290),(80,410),(470,530),(80,650),(470,770),(270,880),(270,980)`
Full-width switchbacks down four tiers, ~1900px. ~8 plots sit BETWEEN lanes on the hedge strips at y=230, 350, 470, 590, so one tower covers two or three passes. High uptime, tight plot count.

**Map 3: The Pond Path** (Medium-Hard, levels 8-10)
Waypoints: `(270,-20),(270,120),(440,240),(440,560),(300,700),(140,700),(60,540),(60,860),(200,980)`
Horseshoe around an unbuildable pond (water circle center `(250,430)` r120), ~2050px. ~7 plots cluster on the OUTER ring (x~500 right, x~30 left) plus the isthmus at `(300,700)`. Flyers cut straight over the pond, so outer-ring anti-air is mandatory.

**Map 4: The Trellis** (Hard, levels 11-13 incl. boss)
Two entry lanes merging: Lane A `(120,-20),(120,200),(270,360)`, Lane B `(420,-20),(420,200),(270,360)`, then shared `(270,360),(270,620),(150,760),(150,980)`. ~1500px visible but DOUBLE inflow until the `(270,360)` junction. ~6 premium plots ring that junction killbox. Splitters and swarms are brutal here; bring AoE.

---

## 6. WAVE / LEVEL STRUCTURE

**World 1 = 12 levels + boss level (13 nodes).** Level to map: L1-3 Kitchen Garden, L4-7 Herb Spiral, L8-10 Pond Path, L11-12 Trellis, L13 boss on Trellis. Each standard level = 10 waves.

**Ramp helpers (hardcode these):**
```js
function levelHpScale(L){ return 1 + 0.12*(L-1); }        // L1=1.0, L6=1.6, L12=2.32
function levelSpeedScale(L){ return Math.min(1.30, 1 + 0.02*(L-1)); }
function bossHpScale(L){ return Math.min(1.8, levelHpScale(L)); }
function bountyScale(L){ return 1 + 0.10*(L-1); }         // income tracks HP ramp (balance fix)
function bounty(base, L){ return Math.floor(base * bountyScale(L)); }
```

**Pest introduction schedule (obeys the tutorial, balance fix):**
L1 aphid+ant, L2 +grub (regen), L3 +slug (tank), L4 +moth (FLYING, Beehive needed), L5 +beetle (armor), L6 +snail (shield), L7 +dandelion (splitter), L8 +wasp, L9 +ladybug (healer), L10 +caterpillar (immune-slow), L11 +thornvine (spawner), L12 all-mix, L13 boss.

**Within-level ramp:** waves 1-3 single-mechanic intros, 4-6 two mechanics mixed, 7-9 combos + the level's hardest new pest, wave 10 mini-surge (1.5x count, tighter spacing).

**Wave-as-data (implementer format):**
```js
// A wave is ordered spawn groups played sequentially (parallel:true overlaps the next group).
// enemy hp/speed/bounty computed at spawn from base * scalers above.
{ id:3, groups:[
    {type:'aphid', count:8, spacingMs:800},
    {type:'ant',   count:2, spacingMs:800}
]}
```

**CONCRETE LEVEL 1 (Kitchen Garden, Normal, all ground, no flying, no armor). Winnable by a new player with 1-2 Marigolds.** Bounty shown at levelHpScale 1.0 / bountyScale 1.0:
```js
LEVEL1_WAVES = [
 {id:1,  groups:[{type:'aphid',count:6, spacingMs:1000}]},                                  // ~12
 {id:2,  groups:[{type:'aphid',count:10,spacingMs:800}]},                                   // ~20
 {id:3,  groups:[{type:'aphid',count:8, spacingMs:800},{type:'ant',count:2,spacingMs:800}]},// ~22
 {id:4,  groups:[{type:'ant',count:6,spacingMs:700},{type:'aphid',count:6,spacingMs:700}]}, // ~30
 {id:5,  groups:[{type:'ant',count:12,spacingMs:600}]},                                     // ~36
 {id:6,  groups:[{type:'aphid',count:10,spacingMs:600},{type:'ant',count:6,spacingMs:600}]},// ~38
 {id:7,  groups:[{type:'ant',count:8,spacingMs:500},{type:'aphid',count:8,spacingMs:500}]}, // ~40
 {id:8,  groups:[{type:'aphid',count:14,spacingMs:500},{type:'ant',count:8,spacingMs:500}]},// ~52
 {id:9,  groups:[{type:'ant',count:12,spacingMs:450},{type:'aphid',count:10,spacingMs:450}]},//~56
 {id:10, groups:[{type:'aphid',count:20,spacingMs:400},{type:'ant',count:12,spacingMs:400}]} //~76 surge
];
```

**Coins per wave/kill:**
- Per-kill bounty: `bounty(base, level)` as tabled.
- Last pest of a wave: +5 Seeds.
- Wave-clear bonus: `10 + 2*waveNumber` (W1=12 ... W10=30).
- Interest: end of wave, `+floor(banked/25)` Seeds, capped +20.
- Early-call bonus: pressing NEXT early grants +2 Seeds per full second saved, cap +30.
- First-clear of a level: +40 Seeds.

**Boss level (L13):** 6 waves. Waves 1-5 each mix ~12 adds (scaled normally) to build economy; wave 6 = the Aphid Queen + a trickle of adds. Boss does not insta-lose on leak, but her 8 leak damage usually ends a run. Boss bounty 120 Seeds + 25 Sap.

---

## 7. DIFFICULTY MODES (3)

| mode | hpMult | speedMult | start Leaves | start Seeds | notes |
|---|---|---|---|---|---|
| Sprout (Easy) | 0.8 | 0.9 | 25 | 180 | always available |
| Garden (Normal) | 1.0 | 1.0 | 20 | 150 | default |
| Bramble (Hard) | 1.35 | 1.15 | 15 | 130 | unlocks after clearing L13 on Garden; pays +50% Sap and grants a per-level "Bramble ✦" badge |

Star thresholds are a fraction of starting Leaves (works across 15/20/25), see section 10.

---

## 8. IN-RUN ECONOMY

- **Currency:** Seeds 🌱 (resets every level). **Lives:** Leaves 🍃 (a leak costs the pest's leak value, 1 to 3). 0 Leaves = level over.
- **Start:** per difficulty above (Normal 150 Seeds / 20 Leaves).
- **Income model:** per-kill bounty + last-pest +5 + wave-clear (10+2w) + interest (+floor(banked/25), cap +20) + early-call (+2/sec, cap +30) + first-clear +40 + boss 120. Compost Bin adds passive Seeds.
- **Tower cost:** base costs in section 2. Upgrades T1 to T2 to T3 as tabled.
- **Sell/refund:** flat 70% of TOTAL Seeds invested (base + all upgrades), floored. No penalty scaling, keeps repositioning viable on puzzle maps. Kill-earned Seeds are never clawed back.
- **Turnover check (Normal):** Level 1 turns over ~150 start + ~400 kills + ~210 wave bonuses + interest + 40 first-clear, ample for 4-7 towers. Because maps are plot-limited (6 to 10), the binding constraint is PLOTS, so mid-to-late play is "fewer towers, upgraded," and `bountyScale` keeps that affordable as HP ramps.

---

## 9. LOCAL META CURRENCY + COSMETIC SHOP

**Currency: Sap 🍯** (amber droplet #c8a84b). localStorage key `gg_sap` (integer). NEVER Sunbeams, never synced, never buys in-run power. No daily cap (it is local vanity).

**Earn per run:**
```js
sap = Math.floor(pestsShooed/10)          // ~3 to 8 typical
    + wavesCleared*2
    + [0,5,12,25][stars]                   // star bonus 0/1/2/3 stars
    + (firstEverClear ? 30 : 0);
// Endless: sap = Math.floor(bestWaveReached*1.5)  (stars pass as 0)
// Bramble mode: sap *= 1.5 (floored)
```
Typical: clean 3-star first clear ~97 Sap; sloppy 1-star replay ~35 Sap. Cheapest cosmetic (100) is one good clear away; the 500 Legendary is a multi-session goal.

**The Potting Shed (17 items, all Canvas-2D). Rarity glyphs (color-independent): Common ◦, Rare ◇, Epic ✦, Legendary ❂.** Silhouettes never change (recognizability + colorblind safe).

A) Tower theme skins (re-palettes all 9 towers as a set):
- Greenhouse Default, 0 (owned), ◦, sage/gold canon.
- Moonlit Silver, 120, ◇, cool #cdd6e0 bodies, pale-blue rim, star specks.
- Autumn Ember, 180, ◇, copper/burnt-gold, drifting embers on T3.
- Coral Reef, 250, ✦, teal + coral, caustic wobble outline.
- Frostbloom, 320, ✦, icy white/cyan, frost crackle on pots.
- Neon Sprout, 500, ❂, near-black bodies with #7ab356/#39d0ff neon stroke pulsing on fire.

B) Map themes (background + path tint + bin art; path shape unchanged for fairness):
- Midnight Greenhouse, 0 (owned), ◦, canon #0d100c, glass grid, dust motes.
- Dawn Meadow, 150, ◇, warm horizon gradient, 3 parallax hills, pale gravel paths.
- Rainy Window, 200, ◇, #05060a with drip streaks (reduced-motion: static droplets).
- Zen Sand, 280, ✦, raked-sand path as concentric arc grooves, stone plots.
- Starfield Terrarium, 400, ✦, glass-dome vignette, twinkling starfield (twinkle off under reduced-motion).

C) Critter mascots (one idle friend wandering the bottom bar, reacts to events; one equipped):
- Ladybug, 100, ◦, red dome + dots, wing flick.
- Little Snail, 130, ◦, spiral shell + gliding foot, shimmer trail.
- Hummingbird, 220, ◇, blur-wing triangle, darts between towers.
- Firefly Cloud, 300, ✦, 5 glow dots orbiting (dimmed under reduced-motion).
- Garden Gnome, 380, ✦, pointy-hat + round body, claps on 3-star.
- Origami Crane, 450, ❂, folded polygons, slow figure-8 glide.

Shop UX: 2-column card grid, live canvas preview + name + rarity glyph + Sap price (or Equip/Owned). Buy -> confirm tap -> deduct Sap -> auto-equip. Top "Equipped" row for one-tap swap. "Try" toggle renders any item on a demo tower/map for 4s before buying.

---

## 10. PROGRESSION + SAVE

- **Structure (shipped):** World 1 = 13 nodes (12 levels + boss). Save schema keeps room for Worlds 2-5 as forward scope.
- **Level select:** vertical scrolling "garden trellis." Each level is a 48px+ seed-pod node showing 0-3 stars as tiny gold leaves. Locked nodes are closed buds (#8a9178). A star-total meter at top shows progress to the next gate. Endless node sits at the vine top.
- **Stars (fraction of starting Leaves, balance fix):** 3-star = >=90% Leaves left, 2-star = >=50%, 1-star = >=1 Leaf (cleared), 0-star = failed (no clear, partial Sap still paid).
- **Unlock gating:** levels unlock left-to-right within the world (clear N to open N+1). World 2 (future) unlocks at 24 of 39 possible World-1 stars.
- **Difficulty unlock:** Bramble mode unlocks after clearing L13 on Garden.
- **Endless ("The Long Weed"):** unlocks after clearing L13. One arena (Trellis), infinite waves, HP x1.06/wave, new pest type every 5 waves, hard interest economy. Tracks `bestWave`; Sap = floor(bestWave*1.5). Personal-best banner on the map.

**Save shape (localStorage key `gg_save`, JSON):**
```js
{
  ver:1,
  sap:0,
  levels:{ "1-1":{stars:3,cleared:true,og:{cleared:false,stars:0}}, "1-2":{...}, /* ... "1-13" */ },
  endless:{ bestWave:0, bestSap:0 },
  cosmetics:{ skin:"greenhouse", map:"midnight", mascot:"ladybug",
              owned:["greenhouse","midnight","ladybug"] },
  settings:{ reducedMotion:false, colorblindGlyphs:true, textScale:1,
             sfx:0.8, music:0.5, speedDefault:1 },
  beams:{ day:"2026-07-05", earnedToday:0 },
  tut:{ done:false, seenTips:{} }
}
```
Keys: `gg_save` (main), `gg_sap` mirrors `save.sap` for quick reads. Write through a single `saveGame()` that JSON-stringifies with a try/catch (quota safe).

---

## 11. SUNBEAM EARN (JS-ready, honors 30/day, 12/run, floor 1, perf-scaled, anti-idle)

```js
function _ggTodayKey(){ var d=new Date(); return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); }
function _ggBeamState(save){
  var t=_ggTodayKey();
  if(!save.beams || save.beams.day!==t){ save.beams={day:t, earnedToday:0}; }
  return save.beams;
}

// run = { wavesCleared, wavesTotal, stars(0..3), leavesLeft, leavesMax,
//         pestsShooed, towersPlaced, durationSec, endless, bestWave,
//         levelId, levelAlreadyCleared }
function sunbeamsForRun(run, save){
  var beam = _ggBeamState(save);
  var remaining = 30 - beam.earnedToday;
  if (remaining <= 0) return 0;                 // daily cap

  // anti-idle gates: ALL must pass
  if (run.pestsShooed < 5)  return 0;
  if (run.wavesCleared < 1) return 0;
  if (run.towersPlaced < 1) return 0;
  if (run.durationSec < 40) return 0;

  var clearFrac = run.endless
      ? Math.min(1, run.bestWave / 20)
      : Math.min(1, run.wavesCleared / Math.max(1, run.wavesTotal));
  var starFrac  = run.stars / 3;
  var leafFrac  = Math.min(1, run.leavesLeft / Math.max(1, run.leavesMax));
  var perf = 0.55*clearFrac + 0.25*starFrac + 0.20*leafFrac;   // 0..1

  var beams = Math.round(1 + perf*11);          // 1..12 (floor 1 after gates)
  if (beams < 1)  beams = 1;
  if (beams > 12) beams = 12;                    // 12/run cap

  if (!run.endless && run.levelAlreadyCleared){  // anti-farm on replays
    beams = Math.max(1, Math.round(beams*0.34)); // ~1..4
  }
  beams = Math.min(beams, remaining);            // clip to daily headroom
  return beams;
}

function commitSunbeams(n, save){
  var beam = _ggBeamState(save);
  beam.earnedToday += n;
  // route n into the shared same-origin Sunbeam helper here, then saveGame()
}
```
Behavior: fresh 3-star full clear ~11-12; mediocre 1-star partial ~4-6; old-level farm 1-4; idle or <5 pests or no tower or <40s = 0. Hard 30/day ceiling holds via the ledger.

---

## 12. CONTROLS + UX (all >=48px, unified touch + mouse)

- **Coordinate model:** all taps hit-tested in 540x960 virtual space, mapped from letterbox.
- **Place:** empty plot = dashed soil circle. Tap -> radial tray fans out the 9 towers (silhouette icons + Seed cost; unaffordable dimmed and non-tappable). Hover/hold an option previews its RANGE RING on the plot before commit. Tap tower to plant, tap X/elsewhere to cancel. Mouse shortcut: keys 1-9 select a "brush," click plots to place repeatedly, Esc clears.
- **Select/manage:** tap a placed tower -> highlight + range ring + bottom SHEET: name + tier pips, DAMAGE/RANGE/RATE row, [UPGRADE (cost, shows next-tier delta; greyed if maxed/unaffordable)], [SELL (refund; 400ms hold-to-confirm fill ring)], [i] ability text, and TARGETING cycle (First/Last/Closest/Strongest) where applicable. Tap tower again or empty ground to close.
- **Range preview:** soft translucent sage disc (alpha ~0.15) + 1px stroke for shooters; aura towers (Sundew/Scarecrow/Compost) use a DASHED stroke so range-type reads without color. Shown during drag-to-place.
- **Top bar (48px):** Leaves 🍃 | Seeds 🌱 | Wave x/total | Pause.
- **Bottom strip (48px+):** START WAVE / NEXT (early-call bonus +2/sec saved, cap +30); SPEED button cycling 1x -> 2x -> 3x (long-press opens a 3-state segmented picker; defaults from settings); PAUSE (Resume/Restart/Settings/Quit to map; auto-pause on tab blur or phone lock).
- **Gestures:** pinch-zoom + one-finger pan (clamped, view-only, double-tap resets). Placement is a two-step plot-tap then tray-tap, so no swipe conflicts.
- **Feedback rules:** illegal placement flashes the plot red + "donk"; unaffordable actions grey out (never error); the affordable set is always visually obvious.

---

## 13. JUICE LIST (cheap Canvas-2D game feel)

- Floating "+N" Seed text on kill (cream, rises 18px/500ms, ease-out fade, pooled, max 24 concurrent).
- Pest poof on shoo: 6-8 short particle puffs in the pest's own color + a 1.3x scale-punch. No blood, reads as composting.
- Hit-flash: pest flashes white 60ms + nudges 2px from the shot.
- Tower recoil: squash-stretch (scaleY 0.92 to 1.0 over 120ms), aims toward target.
- Muzzle/spore flash: small additive radial glow 80ms; Cactus/Marigold darts draw a 2px tracer fading in 100ms.
- Coin shimmer: dropped Seeds sparkle (2-frame twinkle) before auto-collect.
- Screenshake: tiny (2px, 120ms) on boss hit / heavy leak. OFF under reduced-motion.
- Leaf-loss sting: Leaves counter shakes, a leaf spins off and falls, brief red vignette pulse 150ms.
- Range-ring bloom: 200ms ease-out expand + slow dashed rotation (rotation off under reduced-motion).
- Wave-start banner: "Wave 3" slides in, holds 800ms, slides out; boss waves get a gold border + a low WebAudio horn.
- Boss entrance: brief slow-mo (dt x0.5 for 400ms) + gold ring pulse.
- Placement pop: tower rises from soil (translateY 8 to 0 + scale 0.8 to 1, 180ms) + dirt puff.
- Upgrade sparkle: gold sparkles orbit once (600ms) + rising chime.
- Slow VFX: cyan drip outline + visibly reduced cadence + droplet glyph.
- Combo counter: chained kills within 1.2s show "x2, x3" pill (pure feel, no bonus).
- Idle ambience: mascot wander, dust motes, faint path shimmer (pausable).
- Win screen: stars stamp one-by-one (pop + chime), Seeds tally counts up, Sap coins arc into the counter.
- WebAudio SFX (synthesized): "tp" place, "tk" upgrade, "pff" shoo, "ting" Seed pickup, "donk" Leaf loss, warm arpeggio wave-clear, three-note fanfare level-clear. All through a master gain honoring the sliders.
- Speed toggle: brief motion-blur stretch on projectiles (skipped under reduced-motion).

---

## 14. ONBOARDING + ACCESSIBILITY

**Onboarding (<=5 beats, skippable, first launch only via `tut.done`; each tip fires once via `tut.seenTips`). Level 1-1 is the scripted gentle tutorial (aphids/ants only):**
1. Dark scrim, one line: "Pests are coming for your garden. Plant friends to shoo them." Tap to continue.
2. A plot pulses gold: "Tap a soil spot to plant." Tray opens with Marigold highlighted, "Try the Marigold, 50 🌱." Placing dismisses it.
3. Path lights as a flowing dotted line to the bin: "Pests follow the path. Stop them before the bin. Each one that gets through costs a Leaf 🍃."
4. Start Wave pulses: "Ready? Tap Start to send the first wave." First kill fires a one-time "+2 🌱, spend Seeds on more friends" callout.
5. After wave 2 the speed button pulses once: "In a hurry? Tap to speed up." Win screen explains stars ("Keep more Leaves for more stars") and Sap ("Spend Sap 🍯 in the Potting Shed on skins and critters").
A persistent [?] in pause replays any tip. Skip (top-right, beat 1) drops straight into playable 1-1 with tips still armed.

**Accessibility:**
- Reduced motion (`settings.reducedMotion`, also auto-detected from `prefers-reduced-motion`): disables screenshake, slow-mo, motion-blur, ring rotation, parallax, twinkle/drip, mascot darting. Kept: instant state changes, single-frame static particle bursts, static status outlines, static damage numbers. No information is removed, only decoration.
- Colorblind / shape-coding (`settings.colorblindGlyphs`, ON by default): every pest is unique by silhouette, every tower is unique by silhouette (round pompom / spiky column / smooth dome / tendril spray / banded hive / vertical tube / humanoid cross / rectangular box / giant ray-disc), status effects carry glyphs (slow = droplet/snow, freeze/fear = !, poison/thorn = spiral, corrosion = drip underline), shop rarity uses corner glyphs, buildable vs blocked tiles differ by pattern (dashed circle vs solid path). Never color alone.
- Text size: `settings.textScale` (0.85 / 1.0 / 1.25 / 1.5) scales all HUD/menu text; relative-unit layouts reflow without clipping; minimum ~0.75rem-equivalent at scale 1.
- Touch targets: all controls, plot taps, tray options, map nodes >=48x48 device px after letterbox; >=8px spacing; destructive Sell needs a 400ms hold-confirm.
- Audio: independent SFX + Music sliders, each cue distinct in pitch/timbre (Leaf loss low, wave-clear warm chord), full mute honored, every audio cue has a visual twin.
- Pause-safe: auto-pause on blur/lock; the only time pressure is the wave timer, fully playable at 1x.

---

## 15. BUILD PRIORITY ORDER (vertical slice first, last to last)

1. **Canvas + loop skeleton.** 540x960 virtual canvas, letterbox scaler, fixed-timestep game loop, dt speed multiplier (1x/2x/3x), pause. Input mapper (screen to virtual).
2. **Path + one map.** Kitchen Garden waypoints, enemy path-follow lerp, buildable-plot grid, plot render (dashed circles), path render (no-build).
3. **One enemy + one tower + core combat.** Aphid + Marigold, projectile, targeting (First), hit/kill, leak damage, Leaves counter, Seeds counter, per-kill bounty. This is the first playable moment.
4. **Wave engine.** Wave-as-data groups, spawn scheduler with spacing, Start/Next wave button, wave-clear bonus + interest + early-call, win/lose states.
5. **Tower system full.** All 9 towers with 3 tiers, radial buy tray, select sheet, upgrade, sell (70% + hold-confirm), targeting cycle, range preview (solid vs dashed), auras (Sundew/Scarecrow/Compost), DoT/armor rules, anti-air rule.
6. **Enemy roster full.** All 13 enemies + specials (regen, armor, flying, shield, split, heal, immune-slow, spawn, speed-burst), scalers (levelHpScale/speed/bounty), status glyphs.
7. **Level 1 tuned + winnable.** Hardcode LEVEL1_WAVES, verify a new player clears with 1-2 Marigolds. Then author L2-L13 following the intro schedule.
8. **Bosses.** Aphid Queen (L13) first, then Slug King + Moon Moth for endless/future worlds.
9. **Progression + save.** `gg_save` shape, level-select trellis, stars (fraction), gating, difficulty modes, Bramble unlock.
10. **Meta + shop.** Sap earn formula, Potting Shed (skins/themes/mascots), equip/preview, `gg_sap`.
11. **Sunbeam earn.** Wire `sunbeamsForRun` + `commitSunbeams` to the shared 30/day helper; test caps.
12. **Endless mode.**
13. **Juice pass.** Particles, flashes, banners, SFX kit, win-screen tally.
14. **Onboarding + accessibility.** Tutorial beats, reduced-motion, colorblind glyphs, text scale, sliders. (Accessibility hooks should be scaffolded from step 1 so they are not bolted on.)
15. **Polish + final balance verify.** Run the economy check end to end on Sprout/Garden/Bramble across L1, L6, L12, L13; confirm no tower is dead or dominant and flyers force a Beehive.