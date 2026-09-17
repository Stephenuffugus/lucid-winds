# TUMBLE — Design Spec

Working title: **TUMBLE**. A cozy-first, physics-driven sock sorting, matching and basket-shooting game for phones. Lucid Winds / Sky Walk Studio. Single-repo, no build step, PWA.

This document is the build target. If something is unspecified, default to the cozier, simpler, more honest option.

---

## 1. Pitch

The dryer opens, a real 3D heap of socks tumbles onto the folding table. You dig through it with one thumb, find each sock's twin, roll the pair into a ball, and flick it into the basket. Two moods share the same physics: **Laundry Day** (no timer, no fail) and **Rush** (timers, streaks, powers). Odd socks persist in an **Odd Bin**, and finding a mate later is the game's emotional hook.

Audience: adults, cozy-game crowd (Unpacking / A Little to the Left / PowerWash players). They pay once and punish ad-bait.

## 2. Research summary (why these choices)

- Existing mobile sock games are shallow tap-to-pair apps (Sock Match Kids, OddSocks, Match the Socks). No one has built a deep one.
- Steam: *This Game Socks* (first-person, 3,000 socks, roll-and-shoot into basket, co-op, PC only, unreleased) proves the loop. *Socks!* (tabletop-style) has a basket-tipping balance mechanic worth borrowing. *Pajama Sam's Sock Works* (1997) is still Very Positive — the sock-machine fantasy has legs.
- Goods Sort genre (hundreds of millions of installs). Loved: satisfying 3D, click-into-place feel, no timer, offline. Hated: levels impossible without ads/boosters, timers too short late, objects shrinking/blending after updates, imprecise snapping, forced hints, ads that reset the board, lost coin balances.
- **Design promises derived from that:** no forced ads, no lives, no impossible Loads, nothing ever gets smaller or lower-contrast, save export/import, one-time unlock.

## 3. Core unit: the Load

A Load = `{ seed, mode, size, tier }`.

- Sizes: Small 10 pairs, Regular 20, Heavy 35, Mountain 50+ (gated by Clothesline pegs).
- Contents: pairs, 1–3 odd socks, decoys per tier.
- Ends when every pair is balled and basketed and every odd sock is in the Odd Bin.
- Phases: **Dump → Play → Sweep → Results**.

### 3.1 Input (one thumb)

| Gesture | Result |
|---|---|
| Drag a sock | Lifts on a spring; pile shifts under it. Release = flick with velocity from last 3 pointer samples. |
| Hold sock + tap another | Second flies to hand. Match → auto-roll into ball ("thwip"). Mismatch → drops back, pile jostles. |
| Hold ball + flick at basket | Arc shot. Real rim bounces. Misses stay on table. |
| Double-tap sock | Flips it (inside-out socks show muted texture; must flip to read). |
| Two-finger swipe on pile | Shake/spread — upward impulse on sleeping bodies in path. |
| Tap sock, tap basket (accessibility) | Alternative to flick. |

The held sock renders large and toward camera. **This is the most important readability rule in the game.**

### 3.2 Matching = the skill

Sock attributes: silhouette (8), pattern family, palette, length, size (kid/adult), condition (inside-out, lint, hole). A pair matches on all. A **decoy** is a pair's spec with exactly one field mutated.

### 3.3 Misses are free

Made shots score and feed streaks. Misses cost nothing. **Sweep** phase: strays pulse; tap to pop them into the basket; auto-sweep after ~3 s. Rush: Clean Load (zero strays) = bonus. Laundry Day: sweep is just tidying.

## 4. Modes

### 4.1 Laundry Day (cozy)
No timer, no fail state. Dryer hum, optional rain. Balled pairs stack into a drawer grid. **Tidy rating** rewards zero misses and flipping every inside-out sock. Loads unlock room progress. This mode sells the game.

### 4.2 Rush (arcade)
Same physics + timer.
- Streak ×1→×5, +1 per 3 consecutive correct pairs. Mismatch or rim-miss resets.
- Basket shot from beyond one basket-length: +25%.
- Power charge: 1 dot per 5 streak; powers cost 2–4 dots.
- Powers: **Static Cling** (held sock pulls its mate out of pile), **Dryer Sheet** (clears lint fog), **Sock Puppet** (auto-pairs next 3), **Spin Cycle** (pile lifts and settles color-sorted for 4 s).
- Sub-modes:
  - **Timed**: 6 s per pair for Regular, −0.3 s per tier, floor 3 s.
  - **Endless**: each basketed pair +4 s; dryer feeds 2 socks per 5 s.
  - **Basket Balance**: basket has a tilt meter; each ball adds tilt biased by landing spot; two-finger tap the basket to settle (costs one streak point). Overfilled basket tips.
  - **Daily**: see §9.

## 5. Load generator

Tier 0–9, rises with Loads completed per mode, capped at (unlocked Eyes-type pegs + 2) so it never outruns the player's tools.

| Tier | Decoy ratio | Decoy fields | Inside-out | Other |
|---|---|---|---|---|
| 0 | 0% | — | 0% | 3 silhouette families |
| 1–3 | 10–30% | palette only (hue shift ≥ 30°) | from tier 2: 10% | |
| 4–6 | 40–60% | + silhouette length, stripe rhythm | 20–30% | all 8 silhouettes by 5; lint fog (Rush) at 6 |
| 7–9 | 70–90% | + mirrored motif, heel contrast; hue shift as low as 12° | up to 40% | |

Odd socks: always 1–3 per Load; 30% chance one mates with something already in the Odd Bin (→ Reunion).

## 6. Socks: three tiers of content

1. **Geometry** — Meshy, 8 silhouettes, low-poly, made once (§10).
2. **Procedural patterns** — the Lucid Wins SHA-256 engine, adapted as `engine/sockgen.js` (§7). Effectively infinite, zero download weight, every sock has a permanent seed → shareable, daily-seedable, decoys by field mutation.
3. **Hero bank** — curated hand-made socks (§8). Humor, rarity, cosmetic packs.

IP rule: parody *categories*, never near-miss real brands/characters. Original absurdity over recognizable IP. Parody is a defense, not a license.

## 7. sockgen.js (engine texture mode)

`spec = decode(seed64)` → fields (bit widths): silhouette 3, patternFamily 4, palette 8, stripeRhythm 6, motif 8, cuffStyle 3, heelToeContrast 2, size 1, condition 2, plus `pairId`.

`paint(spec, maskPNG) → 256×256 tile` on canvas.

Pattern families (launch): solid, stripe, heel-toe, argyle, polka, chevron, fair-isle, motif-scatter, gradient, plaid.

Pair = two socks, same spec + pairId. Decoy = same seed, one field mutated (field chosen by tier). Palette generator rejects pair-vs-decoy combos under a ΔE contrast floor; colorblind palettes remap the palette table (§12).

## 8. Hero bank

Schema:
```json
{
  "id": "hero_uncle_003",
  "name": "The Grill Master",
  "pack": "uncle-energy",
  "silhouette": "crew",
  "tile": "tiles/hero/uncle_003.png",
  "rarity": "common|uncommon|rare|odd",
  "flavor": "Has never once been inside.",
  "source": "pack|reunion|portal|seasonal",
  "spawnWeight": 1.0,
  "conditionAllowed": ["insideOut"]
}
```
"odd" rarity: appears only as an odd sock; mate only via Reunion.

First 40 (name — rarity):
- **Uncle Energy:** Two-Stripe Tube (c), The Grill Master (c), World's Okayest (c), Lawn Chair Plaid (u), Bass Pro Shade (u), Calf Sock Under Sandals (c), Dad's Golf Diamond (u), Thanksgiving Tie Print (r), The Church Sock (u), Bowling Night (r)
- **Gas Station:** Tacos With Faces (c), Dinosaur on a Lawnmower (u), Bass in Sunglasses (c), Hot Dog Astronaut (u), Cactus Wearing a Hat (c), Raccoon Eating Fries (r), Pickle Party (c), UFO Abducting a Cow (u), The Flamingo (c), A Sloth Doing Taxes (r)
- **Fake Merch:** Tour '94 for The Dampness (u), Muncie Comets Little League (c), Lake Hoyt Regatta (u), Family Reunion 2011 (c), Vote Bartleby (u), Dave's Discount Tire (c), Camp Wappalusk Staff (r), The Corn Festival 5K (c), A Cruise That Was Fine (u), Local Band You Missed (r)
- **Cursed:** The Glove Sock (r), Shoe Pattern Sock (u), The Damp One (odd), Tube Sock With a Zipper (r), Sock That's Mostly Hole (u), Inside-Out Permanently (u), The Too-Long One (c), Someone Else's (odd), Slightly Warm Still (r), The Third Sock (odd, portal only)

## 9. Meta systems

### 9.1 The Laundry Room (home = menu)
Fixed-camera 3D room. Tap objects: dryer → play; drawer → collection; Odd Bin → lost socks; radio → ambient/tracks; door → Clothesline + settings. Decor unlocks appear in the room.

### 9.2 The Drawer
Collection grid by pattern family, rarity glow, tap to spin in 3D, share seed as link. Filters: silhouette, missing-mate, hero.

### 9.3 The Odd Bin
Persistent pile of odd socks; each shows Loads waited. Reunion = mate appears in a later Load; results screen plays the two meeting mid-air. Lore pages (§9.6) unlock at Reunion counts.

### 9.4 The Clothesline (progression — no tree, no spend)
One line, ~20 pegs. Pegs unlock by *doing*, never buying. No currency, no respec. Each is a small permanent comfort.

| Peg | Effect | Earned by |
|---|---|---|
| Warm hands | Held sock renders larger | 10 pairs matched |
| Second look | Tilt held sock shows heel/toe | first inside-out flip |
| Regular load | Regular size | 5 Loads |
| Good toss | Faint dotted arc on flick | 10 basket shots made |
| Bigger basket | Wider rim | first Clean Load |
| Rainy day | Rain ambient | play after 8 pm local once |
| Heavy load | Heavy size | 20 Loads |
| Sorting by feel | Pile shake settles loosely by color | 25 Loads |
| Odd eye | Socks with a mate in Odd Bin glow softly | first Reunion |
| Static | Static Cling (Rush) | first ×5 streak |
| Dryer sheet / Sock Puppet / Spin Cycle | Other powers (Rush) | natural Rush milestones |
| Mountain load | Mountain size | 50 Loads |
| The hum | Richer, longer dryer ambient | 100 Loads |
| Knows the drawer | Decoys shimmer faintly next to real mate | 500 pairs |
| (3–4 blank pegs) | post-launch | |

Rush-facing pegs sit at the far end; a Laundry Day player never feels a build to chase.

### 9.5 Economy (cosmetics and comforts only — never advantage)
Currencies: **Lint** (common), **Quarters** (Clean Load / Spotless Tidy: 1 each, 2 for both), **Reunions**.
Earn calibration, Regular Load: Lint 40–80; relaxed player, 3 Loads/day ≈ 200 Lint, ~3 Quarters.

Unlock table (launch ~120 items):
- **Baskets & hampers (Lint):** wicker (start), plastic hamper 150, wire basket 300, drawstring laundry bag (forgiving rim) 400, tiny doll basket (joke, hard) 600, pool floatie 800, hollow log 1,200, claw-machine bin 1,500, + 4 seasonal.
- **Dryers (Quarters):** standard (start), avocado-green slow tumble 8, laundromat industrial (bigger Loads) 12, clothesline (socks drop from above one at a time) 15, sci-fi portal dryer 20 (purchasable after lore page 7; enables portal Loads after page 8).
- **Room decor (Lint 60–400):** rugs, framed hero socks you own, plants, window views (city/woods/rain/snow), lava lamp, streak wall calendar, display shelves for rarest socks; a cat that sleeps on warm laundry 900.
- **Radio (Lint 200 each):** lo-fi, rain, vinyl jazz, "someone's TV in the next room," 90s hold music, generative RESONARC station.
- **Ball styles & shot trails (Lint 100–300, Rush cosmetic):** tight roll, loose lump, tucked, "the way your mom did it"; lint sparkle, dust, tiny hearts.
- **Hero packs (Quarters 10):** Uncle Energy, Gas Station, Fake Merch, Cursed, then monthly. Owning seeds them into Loads; you still must find them.
- **Reunion-only:** lore pages, Odd Eye, portal items, three "impossible" socks.

Monetization: free with a generous slice of both modes; one unlock for everything; cosmetic packs later. No forced ads, no lives, no impossible Loads.

### 9.6 Odd Bin lore arc (12 pages, voice of the socks)
1. (1 Reunion) "Oh. Hi." — an odd sock introduces the Bin.
2. (3) Socks compare notes on where they went. Nobody agrees.
3. (5) Theory: the dryer has a *back*.
4. (8) The tube sock who has waited longest. It's fine. It says it's fine.
5. (12) A sock that came back smelling like a different house.
6. (16) Half the Bin votes to go looking. Half votes to wait.
7. (20) Someone went. Nothing came back. → sci-fi dryer purchasable.
8. (25) First portal Load. Socks that belong to no one. They're polite.
9. (30) The Bin decides the strangers can stay.
10. (40) The tube sock's mate arrives. Two lines long.
11. (50) A map of the back of the dryer, drawn by a sock. Wrong, and loved.
12. (75) "You kept looking. That's the whole thing." → third impossible sock + a frame in the room.

Rule: nothing in the arc is a fetch quest. Pages arrive because you played.

### 9.7 Daily Load
Seed = SHA-256 of the date. Rush: one attempt, client-side leaderboard, shareable score card image with the day's three rarest socks. Laundry Day: unlimited attempts, no leaderboard.

## 10. Screens

1. **Laundry Room** (home) — §9.1.
2. **Dryer door** — mode cards (Laundry Day / Rush + sub-modes), Load size.
3. **Load** — portrait. Table = bottom 2/3, basket top-right, Odd Bin top-left. Top bar: pairs remaining, streak, timer (Rush), power dots. Held sock large, toward camera.
4. **Sweep** — strays pulse; counter of shots made/missed; Clean Load bonus.
5. **Results** — Lint/Quarters, new Drawer entries fanned as cards, Reunion beat. Again / Room.
6. **Drawer**, 7. **Odd Bin**, 8. **Clothesline** (pegs on a line), settings behind the door.

## 11. Feel and audio
- Haptics (vibration API): grab, match, basket-in. Nothing on misses.
- SFX: fabric shuffle scaled to bodies disturbed; "thwip" on ball; wooden basket thud; soft "huh" on mismatch.
- Laundry Day: dryer hum, optional rain. Rush: low pulse rising with streak. Duck on Results.
- Radio tracks: loops < 30 s, or generated by RESONARC in-code.

## 12. Accessibility
- Colorblind palettes: deuteranopia, protanopia, tritanopia (remap palette table so hue-shift decoys stay distinct).
- **Pattern-first** toggle: decoys never differ by hue alone.
- ΔE contrast floor enforced by palette generator; atlas never ships a failing tile.
- Warm Hands available from settings as accessibility default.
- Tap-tap alternative to flick. One-hand play throughout.
- Reduce motion: shake → fade-reshuffle, no camera bounce.
- Haptics and sound independently off. Rush never required for non-Rush unlocks.

## 13. Architecture

### 13.1 Stack
- Three.js (ESM via cdn.jsdelivr, import map).
- Rapier (`@dimforge/rapier3d-compat`, WASM). Deterministic; handles 150+ bodies on mid-range phones.
- Fixed 60 Hz physics step, interpolated render. Aggressive sleeping (~0.5 s at rest).

### 13.2 Sock object
- Rigid body with **compound capsule** collider: ankle = 1 capsule; crew/knee = 2 capsules in an L; toe sock = capsule + flattened box. Colliders are never the visual mesh.
- Visual = instance in `THREE.InstancedMesh` per silhouette (8 draw calls total).
- Budget: ≤150 active bodies, hard cap 200. Dump pre-simulated 2 s offscreen so the pile is settled at door-open.
- Ball = merge two bodies into one sphere body; swap instances for a ball instance.

### 13.3 Textures
- Per Load, sockgen renders all needed patterns into one 2048² canvas atlas (256² tiles = 64 slots; a Load never needs more).
- Per-instance attributes: atlas slot, inside-out flag. `onBeforeCompile` shader patch samples the tile.
- Hero socks are pre-drawn tiles in the same atlas.
- **One-time manual step:** after Meshy, give each silhouette a standard cylindrical UV layout in Blender (U around, V cuff→toe) and bake a mask PNG (R heel, G toe, B cuff). Meshy auto-UVs do not work for painting patterns in code.

### 13.4 Input
Touch raycast against instanced meshes → instance id → body goes kinematic, chasing the finger projected onto a plane 10 cm above the table with damping. Release restores dynamic with velocity from last 3 pointer samples. Shake = brief upward impulse on sleeping bodies in swipe path.

### 13.5 Repo layout
```
index.html            shell, import map, boot
src/game.js           state machine: Menu → Load → Sweep → Results
src/physics.js  src/render.js  src/input.js  src/loadgen.js  src/economy.js  src/save.js
engine/sockgen.js     texture mode (from Lucid Wins engine)
assets/geo/*.glb      8 silhouettes + props
assets/masks/*.png    heel/toe/cuff masks
assets/audio/
data/hero-socks.json  data/unlocks.json  data/clothesline.json  data/lore.json
sw.js  manifest.json
```

### 13.6 Save data (IndexedDB, versioned; JSON export/import in settings)
`profile {version, createdAt, settings}` · `economy {lint, quarters, reunions}` · `drawer [{sockSeed|heroId, foundAt, count}]` · `oddBin [{sockSeed, waitingSince, loadsWaited}]` · `clothesline [pegId]` · `unlocks [itemId]` · `stats {loads, pairs, shotsMade, shotsMissed, cleanLoads, bestStreak, tierByMode}` · `lore [pageId]` · `daily {date, rushScore, played}`.

## 14. Meshy asset sheet

All socks: Smart Topology low-poly, target 600–900 tris, plain white cotton, no pattern, single sock, laid flat and slightly relaxed, cuff up. Export GLB. Then the Blender UV/mask pass.

1. Ankle — short cuff, no-show proportions
2. Crew — default, mid-calf
3. Knee-high — tall, slight ankle bunching
4. Toe sock — five separated toes (may need retries)
5. Baby — tiny, chubby, ribbed cuff
6. Fuzzy slipper — thick soft silhouette, rolled cuff
7. Dress — thin, long, tight rib
8. Novelty crew — crew with a ridge for 3D appliqué (ears, fins, faces)

Props: wicker basket, plastic hamper, front-load dryer with glass door, wooden folding table, sock ball (squashed sphere with visible tuck).

## 15. Test plan
1. Physics smoke: 200 socks dumped settle < 2 s and sleep; frame time < 16 ms on mid-range Android.
2. Flick determinism: 100 flicks from fixed start/velocity land within a 5 cm cluster.
3. Match logic: 10,000 generated pairs+decoys per tier; every decoy differs in exactly one field; every pair passes the contrast floor.
4. Atlas: no Load requests > 64 tiles; identical tiles from identical seeds across runs.
5. Load lifecycle: Load → Sweep → Results with 0, 1, and all-miss shots.
6. Economy: earn rates per mode within 10% of calibration.
7. Odd Bin: 30% mate-return holds over 1,000 simulated Loads; lore pages fire at exact counts.
8. Save: round-trip export/import; migration from version n−1.
9. Accessibility: each colorblind palette passes ΔE floor across all pattern families.
10. Daily: same date → identical Load on two devices.

## 16. Build order
1. Physics pile + grab/flick (this is the whole game or it isn't).
2. sockgen tile rendering + atlas.
3. Match / ball / basket.
4. Laundry Day loop end to end (Dump → Sweep → Results).
5. Rush (Timed first, then Endless, Basket Balance).
6. Laundry Room, Drawer, Odd Bin.
7. Economy + Clothesline.
8. Daily + lore.

Ship a playable Laundry Day before anything cosmetic.
