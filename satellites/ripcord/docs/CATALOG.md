# RIPCORD — Part Catalogue

Generated from `sim2.js`. Every number the simulation reads is here.

All three tiers are built. Tier is not power: every tier spends the same
budget and higher tiers spend it more extremely. A Relic also carries a named
drawback the simulation enforces, listed at the bottom.

The gate is empirical, not editorial: `node tools/partaudit.js` must print
PART AUDIT OK, which means every part has a build where it works and no
higher tier lifts the average of whatever it is bolted to.

| | count |
|---|---|
| Tier 1, Stock | 50 |
| Tier 2, Forged | 40 |
| Tier 3, Relic | 20 |
| **total parts** | **110** |
| chassis, before counterweights | 5,111,040 |
| weight configurations | 46,666 |

## Cores — 22 parts

| id | name | tier | role | mass kg | spin | ability | charge | drawback |
|---|---|---|---|---|---|---|---|---|
| ember | Ember | Stock | stamina | 0.0022 | right | surge | 1.00 |  |
| frost | Frost | Stock | defense | 0.0026 | right | anchor | 0.85 |  |
| gale | Gale | Stock | attack | 0.0018 | left | overdrive | 1.10 |  |
| iron | Iron | Stock | defense | 0.0034 | right | rebound | 0.95 |  |
| hollow | Hollow | Stock | utility | 0.0020 | left | reversal | 1.35 |  |
| moth | Moth | Stock | utility | 0.0016 | left | shed | 0.75 |  |
| burr | Burr | Stock | defense | 0.0030 | right | burrow | 0.90 |  |
| lash | Lash | Stock | attack | 0.0024 | left | lash | 1.05 |  |
| lodest | Lodestone | Stock | attack | 0.0028 | right | lunge | 1.20 |  |
| quench | Quench | Stock | utility | 0.0021 | left | brake | 0.80 |  |
| ballast | Trim | Forged | defense | 0.0037 | right | scatter | 0.58 |  |
| granite | Granite | Forged | defense | 0.0039 | right | stoneskin | 0.54 |  |
| windlas | Windlass | Forged | attack | 0.0040 | left | windup | 0.51 |  |
| vise | Pincer | Forged | attack | 0.0050 | left | bite | 0.52 |  |
| kite | Kite | Forged | utility | 0.0010 | left | tether | 1.46 |  |
| reel | Reel | Forged | utility | 0.0009 | left | backspin | 1.53 |  |
| tinder | Tinder | Forged | stamina | 0.0012 | left | kindle | 1.48 |  |
| wren | Wren | Forged | defense | 0.0009 | left | burrow | 1.57 |  |
| bell | Bell | Relic | defense | 0.0045 | left | rebound | 0.72 | looselock |
| magpie | Magpie | Relic | utility | 0.0008 | left | echo | 1.95 | greedy |
| flint | Flint | Relic | attack | 0.0007 | right | overdrive | 1.28 | coldstart |
| millst | Cairn | Relic | attack | 0.0052 | right | pitch | 0.70 | hungry |

## Blades — 22 parts

| id | name | tier | role | mass kg | radius m | sharp | rest | gear | taken | drawback |
|---|---|---|---|---|---|---|---|---|---|---|
| cleaver | Cleaver | Stock | attack | 0.0176 | 0.0208 | 1.00 | 0.90 | 0.95 | 1.22 |  |
| sabre | Sabre | Stock | attack | 0.0150 | 0.0222 | 0.78 | 0.74 | 1.05 | 1.08 |  |
| orbit | Orbit | Stock | stamina | 0.0144 | 0.0242 | 0.22 | 0.40 | 0.28 | 0.64 |  |
| bulwark | Bulwark | Stock | defense | 0.0166 | 0.0246 | 0.34 | 0.30 | 0.34 | 0.90 |  |
| talon | Talon | Stock | attack | 0.0132 | 0.0224 | 0.88 | 0.82 | 1.40 | 1.16 |  |
| wheel | Wheel | Stock | balance | 0.0158 | 0.0238 | 0.45 | 0.52 | 0.62 | 0.92 |  |
| shard | Shard | Stock | attack | 0.0118 | 0.0204 | 0.96 | 0.95 | 1.25 | 1.35 |  |
| anvil | Anvil | Stock | defense | 0.0184 | 0.0226 | 0.52 | 0.34 | 0.40 | 0.88 |  |
| halo | Halo | Stock | stamina | 0.0152 | 0.0258 | 0.18 | 0.26 | 0.25 | 0.60 |  |
| crest | Crest | Stock | balance | 0.0162 | 0.0232 | 0.64 | 0.60 | 0.80 | 1.00 |  |
| broadaxe | Broadaxe | Forged | attack | 0.0176 | 0.0208 | 1.26 | 0.88 | 0.92 | 1.46 |  |
| chisel | Chisel | Forged | attack | 0.0157 | 0.0188 | 1.30 | 0.90 | 1.10 | 1.28 |  |
| millstone | Millstone | Forged | defense | 0.0224 | 0.0188 | 0.48 | 0.30 | 0.44 | 0.96 |  |
| ploughshare | Ploughshare | Forged | defense | 0.0242 | 0.0228 | 0.14 | 0.28 | 0.38 | 0.86 |  |
| cartwheel | Cartwheel | Forged | stamina | 0.0158 | 0.0264 | 0.14 | 0.22 | 0.24 | 0.66 |  |
| roundel | Roundel | Forged | stamina | 0.0130 | 0.0210 | 0.10 | 0.18 | 0.26 | 0.62 |  |
| rasp | Rasp | Forged | attack | 0.0161 | 0.0220 | 0.90 | 0.16 | 1.82 | 1.26 |  |
| hailstone | Hailstone | Forged | balance | 0.0164 | 0.0230 | 0.70 | 1.20 | 0.14 | 1.06 |  |
| shrike | Shrike | Relic | attack | 0.0122 | 0.0202 | 1.62 | 0.98 | 1.30 | 1.52 | glass |
| sledge | Sledge | Relic | attack | 0.0182 | 0.0214 | 1.10 | 1.42 | 0.66 | 1.52 | oneshot |
| ingot | Ingot | Relic | defense | 0.0250 | 0.0206 | 0.46 | 0.32 | 0.46 | 1.06 | coldstart |
| hookbill | Hookbill | Relic | stamina | 0.0138 | 0.0230 | 0.70 | 0.44 | 2.10 | 1.08 | hungry |

## Assists — 22 parts

| id | name | tier | role | mass kg | gearMul | absorb | radAdd | smash | drawback |
|---|---|---|---|---|---|---|---|---|---|
| none | None | Stock | balance | 0.0000 | 1.00 | 1.00 | 0.0000 | 1.00 |  |
| jag | Jag | Stock | attack | 0.0040 | 1.45 | 0.92 | 0.0008 | 1.14 |  |
| guard | Guard | Stock | defense | 0.0052 | 0.70 | 1.16 | 0.0012 | 0.88 |  |
| slick | Slick | Stock | stamina | 0.0030 | 0.38 | 1.10 | 0.0004 | 0.92 |  |
| hook | Hook | Stock | utility | 0.0042 | 1.69 | 1.02 | 0.0010 | 0.96 |  |
| wing | Wing | Stock | balance | 0.0036 | 1.00 | 1.18 | 0.0016 | 1.02 |  |
| rake | Rake | Stock | attack | 0.0048 | 1.60 | 0.86 | 0.0014 | 1.20 |  |
| collar | Collar | Stock | defense | 0.0058 | 0.52 | 1.30 | 0.0002 | 0.84 |  |
| vane | Vane | Stock | balance | 0.0020 | 0.94 | 1.14 | 0.0006 | 1.00 |  |
| shim | Shim | Stock | balance | 0.0018 | 0.90 | 1.04 | 0.0000 | 1.06 |  |
| cornice | Cornice | Forged | balance | 0.0060 | 0.62 | 1.46 | 0.0008 | 0.72 |  |
| longspur | Longspur | Forged | attack | 0.0042 | 1.38 | 0.68 | 0.0025 | 1.10 |  |
| teasel | Teasel | Forged | utility | 0.0046 | 2.15 | 0.66 | 0.0008 | 0.94 |  |
| sprocket | Sprocket | Forged | defense | 0.0058 | 2.15 | 0.98 | 0.0006 | 0.70 |  |
| lacquer | Lacquer | Forged | stamina | 0.0026 | 0.28 | 0.68 | 0.0010 | 0.90 |  |
| bolster | Bolster | Forged | defense | 0.0056 | 0.66 | 1.42 | 0.0002 | 0.70 |  |
| gutta | Gutta | Forged | stamina | 0.0034 | 2.35 | 1.42 | 0.0006 | 0.86 |  |
| barb | Barb | Forged | attack | 0.0060 | 0.34 | 0.74 | 0.0005 | 1.30 |  |
| eaves | Eaves | Relic | stamina | 0.0043 | 0.64 | 1.52 | 0.0002 | 0.80 | looselock |
| nettle | Nettle | Relic | utility | 0.0050 | 3.00 | 0.70 | 0.0008 | 0.92 | hungry |
| bushing | Bushing | Relic | defense | 0.0058 | 0.58 | 1.70 | 0.0002 | 0.72 | looselock |
| chert | Chert | Relic | attack | 0.0046 | 0.22 | 0.68 | 0.0004 | 1.38 | oneshot |

## Ratchets — 20 parts

| id | tier | role | mass kg | height mm | lock | strikeHigh | drawback |
|---|---|---|---|---|---|---|---|
| 0-70 | Stock | balance | 0.0046 | 70 | 0.50 | 1.22 |  |
| 3-60 | Stock | balance | 0.0064 | 60 | 0.80 | 0.84 |  |
| 5-60 | Stock | stamina | 0.0070 | 60 | 1.00 | 0.84 |  |
| 9-60 | Stock | defense | 0.0078 | 60 | 1.28 | 0.82 |  |
| 4-80 | Stock | attack | 0.0066 | 80 | 0.88 | 1.22 |  |
| 7-40 | Stock | defense | 0.0074 | 40 | 1.12 | 0.58 |  |
| 1-90 | Stock | attack | 0.0058 | 90 | 0.62 | 1.40 |  |
| 6-50 | Stock | stamina | 0.0072 | 50 | 1.06 | 0.70 |  |
| 2-70 | Stock | balance | 0.0062 | 70 | 0.72 | 1.00 |  |
| 8-30 | Stock | defense | 0.0082 | 30 | 1.20 | 0.46 |  |
| 0-90 | Forged | attack | 0.0058 | 90 | 0.38 | 1.70 |  |
| 11-80 | Forged | attack | 0.0050 | 80 | 1.46 | 1.20 |  |
| 11-30 | Forged | defense | 0.0046 | 30 | 1.40 | 0.16 |  |
| 0-40 | Forged | defense | 0.0088 | 40 | 0.29 | 0.58 |  |
| 6-30 | Forged | stamina | 0.0088 | 30 | 1.04 | 0.14 |  |
| 11-60 | Forged | utility | 0.0051 | 60 | 1.46 | 0.82 |  |
| 0-60 | Forged | balance | 0.0088 | 60 | 0.30 | 0.86 |  |
| 14-30 | Relic | defense | 0.0078 | 30 | 1.70 | 0.14 | looselock |
| 2-90 | Relic | attack | 0.0060 | 90 | 1.38 | 1.68 | shear |
| 0-50 | Relic | utility | 0.0096 | 50 | 0.20 | 0.70 | oneshot |

## Bits — 24 parts

| id | name | tier | role | mass kg | stamina | drive | stable | dash | shaft | drawback |
|---|---|---|---|---|---|---|---|---|---|---|
| flat | Flat | Stock | attack | 0.0042 | 0.92 | 1.76 | 0.88 | 1.45 | 0.86 |  |
| rush | Rush | Stock | attack | 0.0044 | 0.88 | 1.52 | 0.92 | 1.55 | 0.92 |  |
| needle | Needle | Stock | stamina | 0.0035 | 1.34 | 0.50 | 1.05 | 0.35 | 1.10 |  |
| ball | Ball | Stock | defense | 0.0040 | 0.96 | 0.78 | 1.05 | 0.55 | 1.18 |  |
| point | Point | Stock | stamina | 0.0033 | 1.26 | 0.62 | 0.98 | 0.45 | 1.02 |  |
| gearf | Gear Flat | Stock | attack | 0.0046 | 0.78 | 1.40 | 0.90 | 1.85 | 0.80 |  |
| taper | Taper | Stock | stamina | 0.0037 | 1.28 | 0.98 | 1.02 | 0.58 | 1.06 |  |
| dome | Dome | Stock | defense | 0.0046 | 1.02 | 0.90 | 1.24 | 0.62 | 1.14 |  |
| claw | Claw | Stock | attack | 0.0050 | 0.86 | 1.88 | 0.82 | 1.62 | 0.78 |  |
| spool | Spool | Stock | balance | 0.0041 | 1.22 | 1.06 | 1.08 | 1.02 | 1.06 |  |
| bradawl | Bradawl | Forged | stamina | 0.0034 | 1.66 | 0.32 | 0.92 | 0.35 | 1.02 |  |
| stillpin | Still Pin | Forged | stamina | 0.0030 | 1.56 | 0.40 | 0.92 | 0.35 | 1.06 |  |
| spur | Spur | Forged | attack | 0.0052 | 0.86 | 2.06 | 0.82 | 1.55 | 0.56 |  |
| rowel | Rowel | Forged | attack | 0.0046 | 0.83 | 1.35 | 0.48 | 2.32 | 0.78 |  |
| sabot | Sabot | Forged | defense | 0.0046 | 1.00 | 0.88 | 1.55 | 0.60 | 0.55 |  |
| ferrule | Ferrule | Forged | balance | 0.0043 | 1.06 | 1.00 | 0.60 | 0.72 | 1.48 |  |
| cleat | Cleat | Forged | balance | 0.0048 | 1.00 | 1.06 | 1.11 | 2.20 | 0.62 |  |
| plumb | Plumb | Forged | defense | 0.0064 | 0.54 | 0.77 | 1.04 | 0.35 | 1.06 |  |
| agate | Agate | Forged | stamina | 0.0034 | 1.62 | 0.58 | 0.78 | 0.35 | 1.04 |  |
| corundum | Corundum | Relic | stamina | 0.0033 | 1.95 | 0.30 | 0.86 | 0.35 | 0.94 | looselock |
| caltrop | Caltrop | Relic | attack | 0.0050 | 0.78 | 1.39 | 0.46 | 2.75 | 0.78 | skittish |
| cobble | Cobble | Relic | defense | 0.0046 | 0.94 | 0.74 | 1.72 | 0.35 | 0.54 | looselock |
| pintle | Pintle | Relic | defense | 0.0052 | 0.99 | 0.30 | 0.94 | 0.35 | 1.72 | greedy |
| jasper | Jasper | Relic | stamina | 0.0044 | 1.29 | 0.26 | 1.07 | 0.35 | 0.67 | coldstart |

## Relic drawbacks

A Relic takes one stat to an extreme and pays for it with a named behaviour
the simulation actually enforces. A drawback that never fires is power creep
in a costume, so each of these is measured and each of them bites.

| id | name | what it does |
|---|---|---|
| glass | Glass | Below a third of its spin the metal gives; it takes double recoil once it is tired. |
| greedy | Greedy | Charges much faster but will never coast to a win; when it runs down it falls over. |
| coldstart | Cold Start | Sluggish for the first two and a half seconds, then faster than anything else. |
| looselock | Loose Lock | Very hard to knock over and very easy to pop apart. |
| hungry | Hungry | Tears spin off whatever it touches and burns through its own. |
| oneshot | One Shot | The first hit it lands can end a round; everything after it barely counts. |
| skittish | Skittish | It will slide out of the dish at a speed anything else would ride out. |
| shear | Shear | Every blow it lands rings back through its own teeth at full force. |

## Tuning operations

Free, reversible, and capped at 3 changes to any one part.
There is no currency in this game and there is never going to be one.

| operation | slots | effect | max |
|---|---|---|---|
| File | blade | sharp +0.06, taken +0.05 | 3 |
| Polish | blade, assist | gear -0.15, rest +0.03, gearMul -0.15, absorb +0.03 | 2 |
| Wax | bit | stamina +0.06, drive -0.08 | 3 |
| Knurl | bit | dash +0.1, stamina -0.05 | 2 |
| Pack | ratchet | lock +0.08, height +2 | 2 |
| Drill | blade | mass -0.0008, taken +0.04 | 3 |
| Bevel | assist | smash +0.05, absorb -0.08 | 2 |

## Abilities and triggers

Programmed BEFORE launch and fired once. The player never touches the screen
during a round, so the whole tactical decision is which two lines to write.

Abilities, one per core: anchor, backspin, bite, brake, burrow, echo, kindle, lash, lunge, overdrive, pitch, rebound, reversal, scatter, shed, stoneskin, surge, tether, windup.

| trigger | fires when |
|---|---|
| charged | it is charged |
| lowSpin | spin drops below half |
| thirdHit | the third hit lands |
| onRidge | it reaches the rail |
| behind | it falls behind |
| firstBlood | it draws first blood |
| cornered | it is cornered |
| mirror | they spin the same way |
| late | eight seconds have passed |

## Modes

| mode | arena | rules |
|---|---|---|
| Pangkah | 150mm | The striking match; two tops in one dish, first to four points. |
| Uri | 150mm | Endurance with no contact; both tops go up alone and the longer spin wins. |
| Taya | 150mm | The loser is pinned in the circle and the winner takes one free strike at it. |
| Target range | 340mm | Solo; knock over a row of standing tops, and the far ones are worth more. |

## Weights — 3 parts

| id | name | mass kg |
|---|---|---|
| chip | Chip | 0.0016 |
| slug | Slug | 0.0034 |
| brick | Brick | 0.0058 |

Weight rings: 42% of blade radius, 80% of blade radius; 6 holes per ring; max 4 fitted.

## Tuned constants

| key | value | what it does |
|---|---|---|
| `dt` | 0.008333333333333333 | fixed timestep |
| `g` | 9.81 |  |
| `arenaR` | 0.15 | stadium radius m |
| `bowl` | 12 | inward pull; TIGHT forces engagement |
| `ridgeAt` | 0.72 | where the dish becomes rail |
| `ridgeFall` | 0.62 | slope reversal on the rail |
| `pockets` | 3 | low points in the lip |
| `pocketMu` | 0.42 | pocket exit discount |
| `railDrag` | 0.35 | rail is smooth |
| `floorMu` | 0.5726 | floor drag |
| `spinBase` | 2.6 | baseline spin decay |
| `spinLean` | 2.386 | lean cost |
| `spinSlip` | 0.1 | travel cost |
| `stamPow` | 0.5324 | stamina exponent |
| `massCost` | 0.55 | mass punishes spin |
| `iRef` | 0.000014 | reference inertia |
| `inertiaPow` | 0.62 | rim mass protects spin |
| `driveK` | 5.8537 | travel force |
| `fallK` | 4.7087 | topple rate |
| `riseK` | 3.5236 | self-righting rate |
| `leanEq` | 0.0203 | equilibrium lean |
| `wStable` | 340 | stability threshold |
| `precMax` | 46 | precession clamp |
| `precScale` | 0.55 | precession gain |
| `tiltHit` | 0.2355 | strike destabilisation |
| `thetaMax` | 0.46 | topple angle |
| `theta0` | 0.055 | launch lean |
| `spinDead` | 15 | spinout threshold |
| `wallE` | 0.4565 | wall restitution |
| `muMax` | 0.62 | rim friction ceiling |
| `jtCap` | 3 | tangential vs normal cap |
| `tanLin` | 0.85 | linear share of rim friction |
| `hitDrain` | 28 | smash damage |
| `recoil` | 0.35 | striker payback share |
| `hitGap` | 0.1 | strike debounce |
| `hitFloor` | 0.0016 | minimum real strike |
| `ringOut` | 1.008 | exit radius |
| `exitNeed` | 0.55 | radial speed to leave |
| `launchSpin` | 980 | launch rad/s |
| `imbDrive` | 1.3 | wobble buys travel |
| `imbDrain` | 0.85 | wobble costs spin |
| `imbSwing` | 7 | heavy-side swing |
| `dashSpeed` | 0.4 | rail engage speed |
| `dashGain` | 17 | rail acceleration |
| `dashCost` | 9 | spin paid per dash |
| `dashGap` | 0.3 | dash cooldown |
| `imbDash` | 3.2 | wobble bites the rail |
| `burstWear` | 1 | wear to burst |
| `burstK` | 0.155 | wear per reference hit |
| `impRef` | 0.02 | reference strike |
| `burstPow` | 3 | wear superlinearity |
| `burstBack` | 0.14 | striker wear share |
| `chargeHit` | 0.2 | charge per strike |
| `chargeTaken` | 0.09 | charge per hit absorbed |
| `chargeRidge` | 0.34 | charge per rail second |

## Tier expansion (to build)

Tiers are NOT power levels. Every tier shares one stat budget; higher tiers
spend it more extremely. A Tier 3 part is more specialised and more
punishing, never strictly better. The part audit in `partaudit.js` is the
gate: if a Tier 3 part raises the MEAN win rate of builds containing it by
more than 4 points over its Tier 1 sibling, it is power creep and it is wrong.

| Tier | Name | Count target | Rule |
|---|---|---|---|
| 1 | Stock | 50 (built) | Balanced trade-offs, forgiving, no drawback keyword |
| 2 | Forged | 40 (to build) | One stat pushed ~25% past Tier 1 range, one pulled back further |
| 3 | Relic | 20 (to build) | One stat at an extreme, plus a named drawback the sim enforces |

Target totals per slot after expansion: 22 cores, 22 blades, 22 assists,
20 ratchets, 24 bits — **110 parts**, 5,111,040 chassis.
