# SHUTTERBUG Weapons v1: the implementation spec

**What this is.** The build spec for Weapons v1 on branch `sb-weapons` (worktree `/workspaces/sb-weapons`), written 2026-10-31 for a builder who has not read DESIGN. It turns DESIGN 9 (weapons, stats, economy), BUILD-PLAN T2.1 to T2.5 and T2.7 into five ordered steps, each shippable and testable alone. It was written from DESIGN 4, 7, 8, 9 and 11; BUILD-PLAN 1.4, 2.5, 2.6, 3.8, 4 (M2) and 5; QUESTIONS Q27, Q47, Q51, Q52, Q56, Q81, Q82, Q84, Q92, Q93 and Q94; and the code at `9143d0b1c` (core-ns, core-sim, shell-render, shell-audio, shell-ui, shell-boot, harness.js, tools/lint.mjs, tools/redwatch.js, test/loot.mjs, test/audio.mjs). Where DESIGN is silent or two readings exist, the spec says which one it builds and lists the choice in section 15 (Stephen's calls) and in QUESTIONS Q120.

**Why now.** Stephen, 31 Oct about 13:05 UTC: "why dont we have weapons? ... lets make this game fucking awesome!" The night before he ruled the chest to "Dead pixels only", with no weapon words anywhere, until weapons exist (Q92, Q93). This spec is that condition met: from step 1 the chest pays its 15 Dead pixels and a weapon (DESIGN 9.3's letter), and every word about weapons is true when the player reads it.

**The one rule the five steps keep.** The climb never stops for a weapon. Weapons fire by themselves on the three verbs (no attack button, DESIGN 9.1), a cooldown never delays a jump, a weapon that lands in an empty slot is equipped at once with a card that takes no tap, and the only stop is DESIGN's own: the swap card when a slot is already full (step 2).

---

## 0. What the player gets, step by step

1. **The first fight.** The chest pays 15 Dead pixels and puts a weapon in an empty slot at once: the Boomerang (every jump throws it ahead and it flies back) or Anvil Boots (dive landings and dashes send a shock along the ground). A small card names it and says what it does for two and a half seconds; two slot boxes in the top strip show what is equipped. Enemies flash when hit, pop when killed, and pay their Dead pixels (+3 a moth, +10 an elite) under the count. Free play keeps the gear from room to room until Title.
2. **The jump slot and the swap.** The other seven jump weapons (Spark Trail, Shield Kick, Flashbulb, Twin Darts, Halo, Shutter Snap, Skyhook). A chest whose weapon fits a full slot opens the swap card: yours against the new one in plain words, Take or Keep, the room held until the tap.
3. **The dive slot.** The other seven dive weapons (Icicle, Pogo Spear, Tremor, Ember Stomp, Wide Lens, Pile Driver, Flashpan), including the stomps.
4. **Charms.** The third slot, always on: Lantern, Magnet, Second Wind, Thick Skin, Tripod, Light Meter. (Darkroom Discount and Fixer wait for the Darkroom and blueprints.)
5. **Stats and scrolls.** The scroll's pick of two comes back as a real choice (Vigor, Focus, Grit, each doing what its line says), and the free play gear carries the stats and scrolls too, so the hearts grow every third scroll across rooms.

---

## 1. Ground rules for every step

- **Core and shell.** Weapons live in `core-sim` (the sim), their numbers in `core-ns` (`TUNING`, `K`), their pictures in `shell-render`, their sounds in `shell-audio`, their words in `shell-ui`'s `COPY`. The core stays pure, integer and shared verbatim with `harness.js` through `tools/core-loader.js` (BUILD-PLAN 1.2, 1.3): no `Math.random`, no transcendental `Math`, no `Date`, no `instanceof`; the lint holds it.
- **Integers, hashed, pooled.** Every new state field is an integer in `sim.FIELDS` (section 3). The projectile pool is 16 objects made in `create()` and reused; weapon code in `step` allocates nothing (no array, object or closure literal, no `filter`, `map` or `concat`). Existing allocations in `step` (the spark's hop candidates, the scroll offer's `filter`) are not this spec's to fix.
- **One regold.** Step 1 changes the state schema once, for all five steps (the pool's 15 fields, the enemies' `hurt`, quarter HP, the room's `cand` and `tremor`). The two existing goldens move once, through `node harness.js --regold --why "..."` with the why of section 13.1; steps 2 to 5 move no unarmed golden. Each step adds an armed golden of its own.
- **Every behaviour is seen failing.** Each behaviour ships with a harness assertion or a browser gate line that sees it, and a `tools/redwatch.js` row that mutates it away and goes RED for the right reason (BUILD-PLAN 5.5). Expected values are computed in the test from `TUNING`, never read back from the page.
- **The checks.** Per step: `nice -n 10 node harness.js --fast`, `nice -n 10 node tools/lint.mjs`, the step's redwatch rows (`flock /home/codespace/sb-drafts/browser.lock node tools/redwatch.js --browser <rows>` for browser rows), then `flock /home/codespace/sb-drafts/browser.lock node tools/check.js --fast --gate <gate>` for each browser gate the step touches, then `check --fast` (detached, about 20 to 30 minutes, logs under `/home/codespace/sb-drafts/weapons/<label>/`). One Chrome on the box at a time, always through the lock.
- **Look.** A visual change is not done until its shots at 412x915, 360x780 and 320x568 are opened and three things wrong are written in PROGRESS.md for each. A green gate is not a look. Shots go against the local test server only.
- **Copy law.** Every player string lives in `COPY`: plain words, no dashes of any kind, no exclamation marks, text 0.7rem or more, 48 px targets.
- **Merge discipline.** The main checkout (`add-sproing-jumper`) is shipping sb-m1-2 (the pause card) and sb-m1-3 (a floating thumbstick replacing the rocker, and a levels rule). Keep out of: `#strip`, `#rocker`, `#btnA`/`#btnB` markup and CSS, `#pause` and `#paused`, `I.initStrip`, `test/layout.mjs`, `test/pause.mjs`, `test/input.mjs`, `test/play.mjs`. The HUD and the cards are inserted by JS (section 8), so the `#top` markup line that holds Pause and the `#stage` lines that hold the cards stay byte for byte. Browser gates press A and B by real touch on `#btnA` and `#btnB` and steer by real arrow keys, never by the rocker, so the thumbstick change does not break them. `test/loot.mjs` is touched by both branches (its chest lines here, its rocker presses there); the lead merges it.
- **Commits.** Explicit paths (`git add -- satellites/shutterbug tools/shutterbug-tests`), the repo's message style, the two attribution lines, `git push -q origin sb-weapons` after every meaningful commit. Times in PROGRESS.md from `date -u`. QUESTIONS entries on this branch use Q120 to Q139 only. DESIGN.md is never edited; a DESIGN redline is a QUESTIONS entry.

---

## 2. Names and numbers

### 2.1 Weapon codes

The state holds integers, so every weapon has a code: `SB.sim.WPN = Object.freeze(['', 'J1', 'J2', ..., 'J8', 'D1', ..., 'D8', 'C1', ..., 'C8'])` (25 entries, made once at load). `code = WPN.indexOf(id)`; the slot of a code is `(code - 1) >> 3`: 0 the jump slot (J, codes 1 to 8), 1 the dive slot (D, 9 to 16), 2 the charm slot (C, 17 to 24). `hero.slots = [jump, dive, charm]`, each 0 (empty) or a code of its own slot. `BUILT` is a frozen `Int32Array` of the codes of `TUNING.WEAPONS_BUILT`, in that list's order, made at load (never in `step`).

### 2.2 TUNING (core-ns, section `// 9 weapons, stats, economy`)

Rows added in step 1 unless marked. Every px value is an exact multiple of 1/256 (H-ns-1's rule).

```js
HP_Q: 4 /* an enemy's HP and every hit are counted in quarters, so a stat point's +25% is exact (DESIGN 9.2; Q120) */,
WEAPONS_BUILT: ['J1', 'D1'] /* the weapons this build has, in draw order: the chest's pool until the Darkroom's loaded pool
  (DESIGN 9.3), the HUD's set and the lint's. Step 2 appends J2..J8, step 3 D2..D8, step 4 C1..C6 */,
CHEST_FILLS_EMPTY_FIRST: true /* Stephen's call (Q120): a chest fills an empty slot before it offers a swap */,
KEEP_GEAR: true /* Stephen's call (Q120): free play keeps the gear from room to room until Title (the shell reads it) */,
DIVE_SLOT_CD_S: 0 /* DESIGN 9.1 gives the dive slot no cooldown; Stephen's call */,
HURT_FLASH_S: 0.15 /* an enemy's hit flash, 9 steps */, POP_S: 0.2 /* a kill's pop, 12 steps */,
TREMOR_ROOM_CAP: 12 /* step 3, a reading: Tremor shakes out at most 12 Dead pixels a room (Q120) */,
STOMP_GRACE_S: 0.13 /* step 3: a stomped enemy cannot touch the hero for 8 steps */,
LANTERN_PULSE_S: 1 /* step 4: the Lantern burns once a second (DESIGN's 1 dmg/s) */,
```

`WEAPONS` keeps every id J1 to C8 (BUILD-PLAN 1.4) and gains its feel numbers (FEEL: Stephen's thumbs judge them). Each step adds the numbers of its own weapons; the whole table is shown here so it is reviewed once:

```js
J1: { cells: 5, dmg: 1, speed: 5 /* px a step: out in 16 steps */, lifeS: 1.2, box: 12 },
J2: { count: 3, burnS: 1.5, dmg: 1, dropS: 0.17 /* 10 steps apart */, box: 8 },
J3: { cells: 2, dmg: 2 },
J4: { radius: 2, dmg: 1, stunS: 1 },
J5: { cells: 4, dmg: 1, speed: 6, boxW: 8, boxH: 4 },
J6: { cells: 6, dmg: 1, speed: 4, boxW: 16, boxH: 6 },
J7: { cells: 3, freezeS: 0.5 },
J8: { extraUpCells: 1, jumpV: 9.5 /* 2432/256: 85.5 px, as Deep's +1 cell */, deepJumpV: 10.375 /* 2656/256: 102.5 px */ },
D1: { cells: 3, dmg: 2, front: 6 /* px a step: 3 cells in 8 steps */, lingerS: 0.1 },
D2: { cells: 2, freezeS: 2 },
D3: { dmg: 2, bounceCells: 2, bounceV: 6 /* px a step: a 33 px rise, 2 cells and 1 px */ },
D4: { dp: [1, 3], dmg: 1 },
D5: { burnS: 2, dmg: 1, everyS: 0.5 },
D6: { cells: 5, dmg: 1, front: 6, lingerS: 0.1 },
D7: { dmg: 3 },
D8: { cells: 3, dmg: 1, burnS: 1.5 /* a reading: DESIGN gives the line no length of life (Q120) */ },
C1: { cells: 1, dps: 1, gritDps: 0.5, dpsCap: 3 }, C2: { cells: 4, gritCells: 1, cellsCap: 8 }, C3: {}, C4: {},
C5: { slideDiv: 5, wallAcross: 5, lock: 14, push: 3.125 /* 800/256, BUILD-PLAN T2.4 */ }, C6: {}, C7: { pct: 20, gritPct: 5, pctCap: 40 }, C8: {}
```

The apexes above were stepped on this box with the sim's own order (velocity set on the takeoff step, gravity added before the move): JUMP_V 2200 gives 69.6 px in 18 steps, 2432 gives 85.5 px (the Deep jump's one cell more), 2656 gives 102.5 px (Deep's 85.5 plus a cell), 1536 gives 33 px in 12 steps.

### 2.3 K (derive)

`derive` turns each `WEAPONS` row into flat integers by one rule, so H-ns-1 can recompute them with its own loop:

| TUNING key | K name | value |
| --- | --- | --- |
| `cells`, `radius` | `<id>_REACH` | cells x CELL_SUB |
| `speed`, `front`, `bounceV` | `<id>_V` | round(px x 256), asserted exact |
| `jumpV`, `deepJumpV`, `push` | `<id>_JUMP_V`, `<id>_DEEP_JUMP_V`, `<id>_PUSH` | round(px x 256), asserted exact |
| `box`, `boxW`, `boxH` | `<id>_BOX`, `<id>_BOXW`, `<id>_BOXH` | px x 256 |
| every `<name>S` (seconds) | `<id>_<NAME>_F` | round(s x 60) |

`dmg`, `count`, `dp`, `lock`, `slideDiv`, the Grit numbers and the caps stay in `TUNING` and are read there. Top level `_S` keys become `_F` by the existing rule. Known answers H-ns-1 hard codes (step 1): `HP_Q 4`, `J1_REACH 20480`, `J1_V 1280`, `J1_LIFE_F 72`, `J1_BOX 3072`, `D1_REACH 12288`, `D1_V 1536`, `D1_LINGER_F 6`, `HURT_FLASH_F 9`, `POP_F 12`, `DIVE_SLOT_CD_F 0`, `JUMP_SLOT_CD_F 36`. Step 2: `J2_BURN_F 90`, `J2_DROP_F 10`, `J2_BOX 2048`, `J3_REACH 8192`, `J4_REACH 8192`, `J4_STUN_F 60`, `J5_REACH 16384`, `J5_V 1536`, `J5_BOXW 2048`, `J5_BOXH 1024`, `J6_REACH 24576`, `J6_V 1024`, `J6_BOXW 4096`, `J6_BOXH 1536`, `J7_REACH 12288`, `J7_FREEZE_F 30`, `J8_JUMP_V 2432`, `J8_DEEP_JUMP_V 2656`. Step 3: `D2_REACH 8192`, `D2_FREEZE_F 120`, `D3_V 1536`, `D5_BURN_F 120`, `D5_EVERY_F 30`, `D6_REACH 20480`, `D6_V 1536`, `D6_LINGER_F 6`, `D8_REACH 12288`, `D8_BURN_F 90`, `STOMP_GRACE_F 8`. Step 4: `C1_REACH 4096`, `C2_REACH 16384`, `C5_PUSH 800`, `LANTERN_PULSE_F 60`.

---

## 3. The sim state (all of it lands in step 1)

`sim.FIELDS` gains these, and `create()` writes its object literal in the schema's key order (H-sim-7 compares key lists in order).

### 3.1 hero
No new key. `slots` and `cd` (already declared and hashed) come alive: `slots` from `opts.loadout` (section 3.6), `cd[0]` the jump slot's cooldown, `cd[1]` the dive slot's, `cd[2]` the charm's tick (the Lantern, step 4). `secondWind` and `thickSkin` (declared) become the used flags of C3 and C4 (step 4), cleared by `create` (once a room).

### 3.2 enemies
- `hp` is counted in quarters: `create` writes `hp: hpOf(kind, elite) * TUNING.HP_Q`. `hpOf` keeps DESIGN's whole HP (moth, icicle, spark 1; jelly, crawler 2; an elite ELITE_HP_MULT times).
- `hurt` (i32, appended to `ENEMY`): steps left of the hit flash, set to `K.HURT_FLASH_F` by every hit, counted down in 8a beside `frozen` and `stunned`. Render only reads it; nothing else does.

### 3.3 the pool: `proj`, PROJ_MAX (16) slots

`create` makes 16 objects and the state keeps them for its life. The `PROJ` schema (the old eight keys first, the new seven appended):

| key | type | meaning |
| --- | --- | --- |
| `kind` | i32 | 0 free; else a kind code (section 7: BOOMERANG 1, SHOCK 2, POP 3, TRAIL 4, EMBER 5, FLASH 6, DART 7, RING 8, KICK 9, SNAP 10, FROST 11, STOMP 12, DUST 13, PULL 14, ORB 15, SAVE 16) |
| `x`, `y` | i32 sub | the entry's box, top left (a centred effect: its centre, said per kind) |
| `vx`, `vy` | i32 sub a step | its motion |
| `ttl` | i32 | steps left; at 0 the slot is freed |
| `dmg` | i32 | quarter HP a hit, scaled at the spawn (section 5.1); 0 hurts nothing |
| `live` | bool | 1 while in use |
| `age` | i32 | steps since the spawn; -1 for one step when spawned inside the pool pass |
| `mode` | i32 | the kind's phase (BOOMERANG 0 out, 1 back; FLASH 0 armed, 1 burst; EMBER the re hit period) |
| `a`, `b` | i32 | two kind specific integers (said per kind) |
| `hit` | i32 | bit m set once enemy m was hit this pass (enemy count at most 5, asserted; bit 31 reserved for the boss) |
| `freeze`, `stun` | i32 | steps of freeze or stun a hit sets (0 none) |

`spawn(s, kind)` takes the lowest slot with `live` 0, zeroes it, writes `kind` and `live = 1`, and returns its index; with no free slot it returns -1 and the effect is dropped (the pool never grows). `free(p)` zeroes every field, so a free slot always hashes as zeros.

### 3.4 room
Two keys appended: `cand` (i32: the candidate weapon's code while the swap card is open, else 0) and `tremor` (i32: Dead pixels Tremor shook out this room, step 3). `compare` keeps its meaning (the swap card is open; the world waits).

### 3.5 events (`EV`, cleared every step)
Added: `FIRE_J 2048` (the jump slot acted), `FIRE_D 4096` (the dive slot acted), `HURT 8192` (an enemy took damage), `KILL 16384` (an enemy died), `EQUIP 32768` (a slot got a weapon, by the chest or a swap), `SWAP 65536` (a swap opened: the sim sets it from step 1, the card shows it from step 2), `BURST 131072` (step 2: a delayed effect went off: the Flashbulb), `SAVED 262144` (step 4: Thick Skin or Second Wind spent). The shell's sounds and cards read them; the sim never does.

### 3.6 opts
- `opts.loadout`: `[jump, dive, charm]`, each a code, a weapon id string, or null; anything that is not a code of its own slot reads as 0. Default `[0, 0, 0]` (DESIGN 9.1: none equipped until the first pickup).
- `opts.stats` (step 5): `{ vigor, focus, grit, scrolls }`; `heartsMax` from `scrolls` by DESIGN 9.2's rule, `hearts = heartsMax` (a new room starts full).
- The replay script's `opts.loadout` (BUILD-PLAN 2.6, `null` today) carries ids; `runReplay` and `--record` pass it through (`--record <fixture> --loadout J1,D1`).

---

## 4. Where weapons happen inside `step`

The existing order (core-sim's header) with the new parts in bold. Nothing here delays a movement step: the weapons read the movement's results and never write the hero's position or speed, except Skyhook and Tripod (constants chosen at the jump), the Pogo bounce (a dive that met an enemy) and the stomp grace (contact only).

0. A cleared or dead room: `frame++`, return. The sheets: an open scroll offer waits for CHOICE A or B (as now). **An open swap (`room.compare`) waits for TAKE or LEAVE: TAKE puts `room.cand` in its slot (`EV.EQUIP | EV.PICK`), LEAVE keeps the slot (`EV.PICK`); either clears `cand` and `compare`.** The world waits under both: `frame++`, return.
1. The word; the counters run down (dash, dashI, shake, iframes, as now), **then `cd[0]` and `cd[1]` down by one to 0. Keep the takeoff box `x0 = h.x, y0 = h.y`.** A fire at step N sets `cd[0] = JUMP_SLOT_CD_F` (36); the next fire can come at step N + 36, 0.6 s later, exactly.
2. The jumps (as now). **Record `wallSide`: the wall a wall jump left (`h.wall` before it clears) or the sticky wall a sticky jump left, else 0. Skyhook (step 2): a ground, coyote or buffered jump with J8 equipped takes `-K.J8_JUMP_V` (Deep: `-K.J8_DEEP_JUMP_V`).**
2b. B: the dive or the dash (as now). **Keep `dashStart`.**
3 to 6. Run, the release cap, gravity, the move (as now). **Tripod (step 4): with C5 equipped the slide falls `vy / C5.slideDiv` and a wall jump's lock is `C5.lock` steps of `K.C5_PUSH`.**
7. Walls and ground (as now). **`diveLanded = landed && h.dive !== 0`, taken before the dive clears. `dashed = dashStart && h.x !== xBefore` (the press moved the hero; a dash that cannot move at all is no dash, as now, and fires nothing).**
8. The exit (as now).
8c. The loot (as now). **Magnet's reach (step 4). The chest: DP_CHEST, then the drop (section 6).**
**8w. The weapons, only while the room is not cleared:**
   - **W1, the jump slot:** if `jumped && slots[0] && cd[0] === 0`, act (section 7). If it acted: `cd[0] = K.JUMP_SLOT_CD_F`, `EV.FIRE_J`. (Skyhook never acts here; Shield Kick acts only when `wallSide !== 0`. A jump that did not act sets no cooldown.)
   - **W2, the dive slot:** if `slots[1] && cd[1] === 0 && (diveLanded || dashed)`, act with the trigger (LANDING or DASH). A weapon whose DESIGN line names only a landing (Pogo Spear, Pile Driver) does not act on a dash; Flashpan (a dash's line) does not act on a landing. If it acted: `cd[1] = K.DIVE_SLOT_CD_F`, `EV.FIRE_D`.
   - **W3, the stomp (step 3):** a dive with D3 or D7 equipped meeting an enemy (section 7).
   - **W4, the charm (step 4):** the Lantern's pulse.
   - **W5, the pool pass:** for `i` in 0..15: skip a free slot; an entry with `age < 0` sets `age = 0` and waits (an effect spawned inside this pass acts from the next step); else act by kind (move, then hit, then the kind's own transitions), then `age++`, `ttl--`, free at `ttl <= 0`. A projectile spawned in W1 or W2 acts in the same step's pass (it moves once and hits where it lands).
8a. The enemies (as now), **with `hurt` counted down beside `frozen` and `stunned`; an enemy killed in 8w is dead here (it neither moves nor touches); a stomped enemy's contact is skipped while its STOMP lives (step 3); `hitHero` asks Thick Skin and Second Wind first (step 4).**
8b. The traps (as now). 9. `frame++`.

Order consequences (each asserted, section 13): a weapon hit lands before the enemies move and touch, so a moth killed on the step it would have touched the hero never touches (generous to the player); a weapon never acts on the step the room clears; under a sheet nothing moves, cooldowns included.

---

## 5. Damage, holds, kills

### 5.1 Quarter HP and the stats
A hit deals `q = dmg x (HP_Q + stat)` quarters, where `dmg` is the weapon's DESIGN damage, and `stat` is `hero.focus` for the jump slot, `hero.vigor` for the dive slot, and Grit as the charm's row says. That is DESIGN 9.2's +25% a point exactly, in integers, with no rounding (BUILD-PLAN T2.1 wrote `dmg * (4 + stat) / 4` floored, which makes the first three points do nothing to a 1 dmg weapon; the quarters keep the remainder in the enemy). A moth (4 q) dies to any hit; a jelly or crawler (8 q) to two 1 dmg hits or one Anvil Boots shock; an elite jelly (16 q) to four boomerang passes at Focus 0 and 1, three at Focus 2.

### 5.2 Hits
- A hit is a strict box overlap of the entry's box with the enemy's whole box (16 px, an elite 24 px centred on its cell, Q51): what you see is what hits. (The enemies keep their 2 px forgiving core against the hero, Q70.)
- Only a live enemy (`liveEnemy`: HP above 0, an icicle not shattered) is hit. A held enemy (frozen, stunned, or the pocket's sleeping elite) is hit like any other.
- An entry hits each enemy at most once a pass (`hit` bit m). The Boomerang clears its bits at the turn; EMBER clears them every `mode` steps (Ember Stomp's tick); everything else hits once in its life.
- `hit(s, p, x0, y0, x1, y1)` walks the enemies in index order, sets the bit, calls `hurt(s, m, p.dmg)` when `dmg > 0`, applies `p.freeze` and `p.stun`, and returns how many it hit (a dart stops on its first).

### 5.3 Freeze and stun (Q81's holds)
- Freeze: `en.frozen = max(en.frozen, n)`. Stun: `if (en.stunned >= 0) en.stunned = max(en.stunned, n)`: the pocket's sleeping elite (`stunned` -1, Q75) is never woken by a weapon; it wakes when the hero enters its pocket, as now.
- A held enemy neither moves nor harms (Q81, unchanged). Neither timer ever shortens.

### 5.4 Kills and their Dead pixels
`hurt(s, m, q)` (its argument is now quarters): return 0 if the enemy is not live; `hp = max(0, hp - q)`, `hurt = K.HURT_FLASH_F`, `EV.HURT`; at 0: `room.dp += elite ? DP_ELITE : DP_FODDER` (10 or 3, DESIGN 9.3), `EV.KILL`, and a POP spawned at its box centre. A dead enemy keeps its slot with HP 0, never moves, never touches, is never drawn; an icicle killed by a weapon never hangs again and banks once (Q82). Kills feed the room's count; the clear banks it at the free play rate as now (`Banked 7 of 15 dead pixels`, Q93).

### 5.5 The hero's contact, with weapons
Unchanged except: the stomp grace (step 3: the enemy a Pogo Spear or Pile Driver stomp hit cannot touch the hero while its STOMP entry lives), Thick Skin and Second Wind (step 4, inside `hitHero`, so traps count too). No weapon gives the hero i frames.

---

## 6. The chest, the drop pool, the slots

### 6.1 What the chest does now
Touching the shut chest: `chest.open = 1`, `room.dp += DP_CHEST` (the handwritten +15 under the count stays, Q92 and Q93), `EV.CHEST`, then the drop:
- a candidate for an **empty slot** goes straight into it (`EV.EQUIP`): no card that stops anything, the world never held (the climb does not stop for an empty slot);
- a candidate for a **full slot** opens the swap card (`room.cand = code`, `room.compare = 1`, `EV.SWAP`): the world waits until TAKE or LEAVE (DESIGN 9.1: "Pickup screen shows equipped vs candidate only ... with the sim paused"). The sim's TAKE and LEAVE land in step 1 (H-wpn-7 drives them with a hand loadout); the card is step 2;
- no candidate (everything in the pool equipped): the 15 Dead pixels only, and no draw from the generator.

### 6.2 The draw, exactly (no allocation)
The drop pool before the Darkroom exists is `BUILT` (every weapon this build has; DESIGN 9.3's loaded pool replaces it in T2.9). With `equipped(c)` meaning `h.slots[slot(c)] === c`:

```
n = 0; empty = 0
for each c in BUILT: if (!equipped(c)) { n++; if (h.slots[slot(c)] === 0) empty++ }
if (n === 0) return 0                                   // DP only: the generator is not drawn
wantEmpty = TUNING.CHEST_FILLS_EMPTY_FIRST && empty > 0
k = SB.rng.stepU32(s, 'rng') % (wantEmpty ? empty : n)  // one draw, after the room's speck rolls
for each c in BUILT: if (equipped(c)) continue; if (wantEmpty && h.slots[slot(c)] !== 0) continue; if (k-- === 0) return c
```

With step 1's pool {J1, D1}: the first chest gives either, the next (the gear kept) gives the other, then DP only; no swap can arise in step 1 (asserted over 200 seeded rooms). From step 2 a chest fills the empty slots first, then offers swaps.

### 6.3 The empty slot
The shell answers `EV.EQUIP` with the `equip` voice, the pickup card (section 8.5: the weapon's icon, name and sentence, two and a half seconds, no tap, docked away from the bug) and the HUD's new icon. The sentence is the "one readable sentence" HANDOFF's M2 acceptance asks a tester to read.

### 6.4 The full slot: the swap card (step 2)
The card (section 8.6) shows the new weapon and the equipped one in plain words, Take (Sun, first) and Keep; a tap sends CHOICE TAKE or LEAVE on the next word (`SB.input.choose`, as the M1 sheets did), so the recording carries the choice and a replay reaches the same hash. The loop keeps stepping under it (the screen stays `play`); the sim holds the world. `ui.sheets` stops answering an open compare with TAKE from step 2 (it kept doing so in step 1, where no compare can open).

### 6.5 The sitting: free play keeps the gear (shell, step 1; Stephen's call)
DESIGN 8 gives free play one room and keeps gear across the rooms of a house run; the build chains free play rooms (Shoot the next room, Play it again). With `TUNING.KEEP_GEAR` the shell keeps the gear for the sitting:
- `G.gear` (shell memory, never saved) starts `[0, 0, 0]`; `ui.startRoom` creates the state with `{ loadout: G.gear }` and keeps `G.entry = G.gear.slice()`; the HUD shows it before the first step.
- The clear (`ui.showClear`) copies `G.state.hero.slots` into `G.gear`.
- Again after a death restarts with `G.entry` (what the bug walked in with; the chest is shut again and can be taken again).
- Title ends the sitting: `ui.toTitle(opts)` clears `G.gear` unless `opts && opts.keepGear === true`; only Shoot the next room passes it. Every Title control and the back gesture to the title clear the gear. (The listeners now pass the click event: `cleartitle` and `pausetitle` call `ui.toTitle` directly, so each must be wrapped, `function () { ui.toTitle(); }`, or the event would read as `keepGear`.)
- `SB_DEV.roomOpts()` (read only) returns `{ loadout: [ids or null] }` of the room's first state, so a gate or a phone report replays the room exactly.
- With `KEEP_GEAR: false` every free play room starts empty (DESIGN's letter); the chest then always fills an empty slot and the swap card appears only in house runs (T2.8).

---

## 7. The weapons, one by one

Geometry is in sub px (`CS = K.CELL_SUB = 4096`, the hero 12x16 px). `cx, cy` are the hero's box centre, `x0, y0` the takeoff box (section 4 step 1), `dir` the throw's side: `facing`, or `-wallSide` on a wall or sticky jump (facing is already away on a wall jump; a sticky jump keeps the facing, and DESIGN 4.2's "no weapon ever requires a corrective tap" sends the throw away from the vine). "Act" is what W1, W2 or the pool pass does. Every weapon's sentence is checked true by its harness group: an enemy at the sentence's distance takes the hit and one just beyond it takes nothing.

### 7.1 Step 1

**J1 Boomerang** (`BOOMERANG`, kind 1). Trigger: every jump and wall jump (ground, coyote, buffered, wall, sticky), when the cooldown allows.
- Spawn: box `J1_BOX` (12 px) square at `x = x0`, `y = y0 + (HERO_H_SUB - J1_BOX) / 2` (over the hero, centred on its height); `vx = dir x J1_V`, `vy = 0`, `ttl = J1_LIFE_F` (72), `dmg = 1 x (HP_Q + focus)`, `mode = 0`, `a = x` (the start, for the travel).
- Out (`mode 0`): move `x += vx`; if the box would overlap a solid cell (the leading column over the rows it spans; one ways do not stop it) it stops flush against it instead; hit; then if it stopped at a wall or `|x - a| >= J1_REACH` (16 moves): `mode = 1`, `hit = 0`. The box's far edge reaches exactly 5 cells past the hero's front edge.
- Back (`mode 1`): `dx` and `dy` from the box centre to the hero's centre; `md = max(|dx|, |dy|)`; if `md <= J1_V` it is caught (freed, quietly); else `vx = trunc(J1_V x dx / md)`, `vy = trunc(J1_V x dy / md)` (the moth's homing), move, hit. Through anything (furniture included), so it always comes home; freed at `ttl` 0 if it never does.
- So an enemy in the path takes 1 dmg on the way out and 1 on the way back (DESIGN 9.1: "1 dmg each pass").
- Render: sprite `boomerang` 12x12, frames a b c d (a quarter turn each, 12 fps: `floor(age / 5) % 4`), mirrored when `vx < 0`. Sound: `throw` on FIRE_J. COPY: `Boomerang`, "Every jump throws it ahead, and it flies back to you."

**D1 Anvil Boots** (`SHOCK`, kind 2). Trigger: a dive landing and a dash that moved.
- Spawn: `x = cx`, `y = h.y` (the row the hero stands in: its feet are the surface top); the band's limits per side, walking cells out from the centre column `c0`: a cell joins while it is open and stands on a solid or one way top, up to `D1.cells` cells; `a = max(x - D1_REACH, L x CS)`, `b = min(x + D1_REACH, (R + 1) x CS)` where L and R are the last cells that joined. So the wave runs along the surface and stops at a wall and where the surface ends (Stephen's call; the other reading is a flat band through anything). `ttl = ceil(D1_REACH / D1_V) + D1_LINGER_F` (14), `dmg = 2 x (HP_Q + vigor)`.
- Each step: `f = (age + 1) x D1_V`; the fronts `left = max(a, x - f)`, `right = min(b, x + f)` (`a` and `b` already hold the reach and the walls); hit every live enemy overlapping `[left, right) x [y, y + CS)` not hit yet. `SB.sim.shockFront(p, side)` returns a front's x so the render draws the same fronts (two numbers, no array).
- The dive landing's 2 px shake stays the dive's (DESIGN 4.4); a dash's wave does not shake.
- Render: sprite `shock` 16x8, frames a (rising), b (crest), c (falling): b while a front still grows, c over the linger; drawn centred on each front with its bottom on the surface, the left one mirrored; between the fronts 2x2 Ash dust motes every 4 px, 3 px above the surface, on alternate steps. Sound: `shock` on FIRE_D. COPY: `Anvil Boots`, "Dive landings and dashes send a shock along the ground."

**POP** (kind 3): a kill's mark. `x, y` the dead enemy's box centre less 8 px, `ttl = POP_F` (12), no hits. Sprite `pop` 16x16, frames a b c (4 steps each).

### 7.2 Step 2: the jump slot
All fire on every jump and wall jump unless said; Focus scales them.

| id | name | act | numbers |
| --- | --- | --- | --- |
| J2 | Spark Trail | spawn TRAIL (kind 4, `a = 3` drops left); each pass, at `age % J2_DROP_F === 0` while `a > 0`, it spawns an EMBER (kind 5; every EMBER's box is `x, y` its top left, `a` its width, `b` its height) at the hero's feet centre, `J2_BOX` square, static, `ttl J2_BURN_F` (90), `mode 0` (once an enemy), `dmg 1 x (HP_Q + focus)`; TRAIL lives `2 x J2_DROP_F + 1` steps and is freed when `a` reaches 0 | 3 sparks 10 steps apart along the arc, each burning 1.5 s |
| J3 | Shield Kick | acts only on a wall or sticky jump (`wallSide !== 0`): every live enemy overlapping the open column beside the wall face, from `y0 - J3_REACH` to `y0 + HERO_H_SUB + J3_REACH`, takes `2 x (HP_Q + focus)`: a wall on the left has its face at `x0` and the column `[x0, x0 + CS)`; a wall on the right has its face at `x0 + HERO_W_SUB` and the column `[face - CS, face)`; KICK (kind 9) for the picture, 8 steps | 2 cells up and down the wall, 2 dmg |
| J4 | Flashbulb | spawn FLASH (kind 6, `mode 0` armed, following the hero, `ttl 90` while armed); it bursts on the first step `vy >= 0` (the apex) or the hero lands, clings or dives first: every live enemy whose box centre lies within `J4_REACH` of the hero's centre (`dx*dx + dy*dy <= R*R`, exact in doubles) takes `1 x (HP_Q + focus)` and `stun J4_STUN_F`; `EV.BURST`; `mode 1`, `ttl 8` for the picture | radius 2 cells, 1 dmg, a 1 s stun, both sides |
| J5 | Twin Darts | two DART (kind 7) from the hero's centre, `J5_BOXW x J5_BOXH`, `vx = +-J5_V`, `a` = the start x; move, the last move cut so the travel is exactly `J5_REACH`; a solid cell frees it; the first live enemy it overlaps takes `1 x (HP_Q + focus)` and frees it | 4 cells each side, 1 dmg |
| J6 | Halo | RING (kind 8) at the takeoff: `x = x0 + (HERO_W_SUB - J6_BOXW) / 2`, `y = y0 - J6_BOXH`, `vy = -J6_V`; through one ways, freed by a solid cell or at `J6_REACH` travel; once an enemy | 6 cells straight up from the takeoff cell, 1 dmg |
| J7 | Shutter Snap | every live enemy whose box lies within `J7_REACH` of the takeoff box on both axes (the gap between the boxes) gets `freeze J7_FREEZE_F`; no damage; SNAP (kind 10) for the picture, 6 steps | 3 cells, 0.5 s, both sides |
| J8 | Skyhook | never acts in W1; a ground, coyote or buffered jump with J8 equipped takes `K.J8_JUMP_V` (85.5 px apex, one cell more), in Deep `K.J8_DEEP_JUMP_V` (102.5 px); wall and sticky jumps unchanged; no cooldown, no FIRE_J; the reach model never counts it | +1 cell, no damage |

Pictures (all Glare and Ink, section 8.1): EMBER `ember` 8x8 frames a b (flicker by `floor(frame / 5) % 2`); KICK three Glare strokes with Ink edges along the face, fading over 8 steps; FLASH a square Glare ring 2 px thick with an Ink rim, growing from 8 px to `2 x J4_REACH` across its 8 steps; DART `dart` 8x4, mirrored by side; RING `ring` 16x6 frames a b; SNAP a Paper and Glare film frame (3 px sides, a 6 px bottom) around the reach's square for 6 steps. Frozen and stunned enemies get their looks (section 8.3). Sounds: `sizzle`, `kick`, `flash` (on BURST, at the apex, not the takeoff), `dart`, `halo`, `shutter` (the existing shutter click: a Shutter Snap is a camera shutter), none for Skyhook.

COPY: J2 "Every jump drops three sparks along your path that burn enemies." J3 "Every wall jump kicks enemies on that wall." J4 "At the top of every jump, a flash stuns enemies close by." J5 "Every jump shoots a dart to each side." J6 "Every jump sends a ring straight up from where you stood." J7 "Every jump freezes enemies close by for a moment." J8 "Your jumps go higher. It hits nothing."

### 7.3 Step 3: the dive slot
All act on a dive landing and on a dash that moved, unless said; Vigor scales them.

| id | name | act | numbers |
| --- | --- | --- | --- |
| D2 | Icicle | every live enemy whose box lies within `D2_REACH` of the hero's box on both axes gets `freeze D2_FREEZE_F`; no damage; FROST (kind 11) picture, 10 steps | 2 cells, 2 s |
| D3 | Pogo Spear | W3, a dive only: while `h.dive` and `vy > 0`, the first live enemy (index order) overlapping the hero's lower half with its centre below the hero's centre takes `2 x (HP_Q + vigor)`; the hero bounces: `vy = -K.D3_V`, `dive = 0`, `rising = 0` (no release cap), `coyote = 0`; a STOMP (kind 12, `hit` = that enemy's bit, `ttl STOMP_GRACE_F`) keeps that enemy's contact off the hero; `EV.FIRE_D`; nothing on a plain landing or a dash | 2 dmg, a 33 px bounce |
| D4 | Tremor | every live enemy whose box lies within 1 cell of the hero's box takes `1 x (HP_Q + vigor)`; if any of the eight cells around the hero's foot cell is solid: `n = 1 + stepU32 % 3`, `n = min(n, TREMOR_ROOM_CAP - room.tremor)`, `room.dp += n`, `room.tremor += n`; DUST (kind 13, `a = n`) picture | 1 dmg adjacent, 1 to 3 Dead pixels, 12 a room |
| D5 | Ember Stomp | EMBER (kind 5) over the hero's foot cell (`a = b = CS`, its bottom on the surface), static, `ttl D5_BURN_F` (120), `mode D5_EVERY_F` (its hit bits clear every 30 steps), `dmg 1 x (HP_Q + vigor)` | 2 s of fire, 1 dmg each 0.5 s |
| D6 | Wide Lens | as Anvil Boots with `D6.cells` 5 and `dmg 1` (the SHOCK kind; its reach lives in `a` and `b`) | 5 cells each side, 1 dmg |
| D7 | Pile Driver | W3, a dive only: as Pogo Spear's contact, `3 x (HP_Q + vigor)` to that one enemy, no bounce, the dive goes on, the STOMP grace for that enemy; once a dive | 3 dmg, the one enemy below |
| D8 | Flashpan | a dash only: one EMBER covering the cells the dash runs over: from the start column, in the facing, up to `D8.cells` cells that are open and stand on a top (the dash's own edge rule); `x` and `a` its left and width, `b = CS`; `ttl D8_BURN_F` (90), once an enemy, `dmg 1 x (HP_Q + vigor)` | a 3 cell line, 1.5 s |

Pictures: FROST shards `frost` 8x8 frames a b (Glare, Pewter, Ink) bursting from the feet; STOMP a 4 px Glare starburst at the contact; DUST `a` Amber specks (Amber is loot: these are Dead pixels) rising from the solid side and gone in 12 steps; EMBER fire tiles `ember` frames c d (16x8 flame rows) along its box; Wide Lens draws `shock` frame d, a lower crest. Sounds: `freeze`, `pogo`, `tremor`, `flame` (Ember Stomp and Flashpan), `lens`, `pile`.

COPY: D2 "Dive landings and dashes freeze enemies close by." D3 "Dive onto an enemy to hit it hard and bounce up." D4 "Dive landings and dashes shake dead pixels out of the walls beside you." D5 "Dive landings and dashes leave fire where you stand." D6 "Dive landings and dashes send a long, light shock along the ground." D7 "Dive onto an enemy to hit it very hard." D8 "Every dash leaves a line of fire behind you."

### 7.4 Step 4: charms (always on, one at a time)

| id | name | act | numbers |
| --- | --- | --- | --- |
| C1 | Lantern | W4: `cd[2]` counts 0 to `LANTERN_PULSE_F - 1`; on its wrap every live enemy whose box lies within `C1_REACH` of the hero's box takes `min(4 x dpsCap, 4 x dps + 4 x gritDps x grit)` quarters, which is `min(12, 4 + 2 x grit)`; ORB (kind 15) pulse picture | 1 dmg a second within 1 cell, +0.5 a Grit point, cap 3 |
| C2 | Magnet | in 8c: a loot whose cell lies within `N = min(cellsCap, cells + gritCells x grit)` cells (Chebyshev, cells) of the hero's centre cell is taken as if touched (the scroll's offer still waits for the ground and the grace, Q56; the blueprint still silent); PULL (kind 14, `a` the loot's kind, `b` its cell) flies its sprite to the bug over 8 steps | 4 cells, +1 a Grit point, cap 8 |
| C3 | Second Wind | in `hitHero`: a hit that would take the last heart with `!h.secondWind` leaves 1 heart instead, sets `secondWind = 1`, keeps the i frames and the knockback, no DEAD, `EV.SAVED`; once a room | one free death a room |
| C4 | Thick Skin | in `hitHero`: with `!h.thickSkin` the hit costs no heart and no knockback, sets `thickSkin = 1`, the i frames still run, `EV.SAVED`; traps count | the first hit each room does nothing |
| C5 | Tripod | K override: the slide falls `vy / C5.slideDiv`, a wall jump's lock `C5.lock` steps at `K.C5_PUSH`; 5 across, verified against the harness's stepped table; the model never counts it | slide 1/5, wall jump 5 across |
| C6 | Light Meter | render only: every shown loot not taken and the shut chest outside the view puts a 6x3 Amber tick with an Ink rim on the view's top row (above) or bottom row (below), at its x, blinking at 2 Hz | ticks at the frame's edge |

SAVE (kind 16) is Thick Skin's and Second Wind's picture: a 2 px Glare ring with an Ink rim around the bug for 8 steps. C7 Darkroom Discount and C8 Fixer stay out (their systems do not exist; section 14). COPY: C1 "A light circles you and burns enemies close to you." C2 "Loot near you flies to you." C3 "Once a room, the hit that would end your climb leaves you one heart." C4 "The first hit in each room costs you nothing." C5 "You slide down walls slowly and wall jump farther." C6 "Loot out of sight shows at the edge of the picture." Sounds: the Lantern's hits use `zap`; Magnet's pull the `pickup` voice; SAVED `saved` (a rising two note chime).

### 7.5 Step 5: the stats
No new weapon. The scroll's offer becomes a real choice (section 8.7); Vigor scales the dive slot, Focus the jump slot (section 5.1, live since step 1), Grit the Lantern and the Magnet (step 4). With `KEEP_GEAR`, the sitting carries `vigor`, `focus`, `grit` and `scrolls` with the slots (`opts.stats`), so a heart grows every third scroll across rooms (DESIGN 9.2, cap 8) and each room starts with its hearts full.

---

## 8. Render, HUD and cards

### 8.1 Sprites (shell-render's SPRITES fence)
New names (frames are unlimited; the lint counts names): step 1 `boomerang` (12x12, a b c d), `shock` (16x8, a b c, d from step 3), `pop` (16x16, a b c), `icon` (16x16, one frame per built id, named by the id: `icon.J1`, `icon.D1`, ...); step 2 `ember` (8x8 a b; 16x8 c d from step 3), `dart` (8x4 a), `ring` (16x6 a b); step 3 `frost` (8x8 a b); step 4 `orb` (4x4 a). Twenty five names after step 4, under 40.

Colour law for weapons (H-spr-1 asserts it): weapon sprites hold Ink (0) as their outline and draw only from Ink, Slate (2), Pewter (3), Ash (4), Paper (5), Glare (6) and, for `icon` only, Lapis (11) as an accent. Never Sun (the hero's), Film (the repairs'), Brick or Magenta (danger's), Amber (loot's, except Tremor's Dead pixel specks and the Light Meter ticks, which are loot) or Teal. Glare is "attack effects" in the palette table (BUILD-PLAN 7.1); the Ink rim carries it on Frost's Paper and on Glare edges (the two tone rule, 7.3). The placeholders are the builder's until Astra's HOLD items land (fx/fx_projectiles, fx/fx_shockwave, fx/fx_enemy_hit, fx/fx_frozen_stunned, fx/fx_fire, fx/fx_bursts, fx/fx_impacts, fx/fx_tremor, fx/fx_lantern, fx/fx_light_meter, ui/icon_weapons, ui/screen_compare, ui/icon_stats); these names and frame names are the keys the cutter will splice.

Icons: jump weapons carry a Lapis accent on the top edge, dive weapons on the bottom edge, charms in the middle; J1 a boomerang V, D1 a boot on an anvil sole. Shape first, colour second (DESIGN 9.2).

| sprite | px (cells) | frames, at 12 fps unless said | palette indices | drawn for |
| --- | --- | --- | --- | --- |
| `boomerang` | 12x12 (0.75) | a b c d, a quarter turn each | 0 rim, 6 body, 3 inner edge | J1 |
| `shock` | 16x8 (1 x 0.5) | a rising, b crest, c falling, d low crest | 0 rim, 6 crest, 4 dust | D1, D6 (d) |
| `pop` | 16x16 (1) | a b c, 4 steps each | 0, 6 | every kill |
| `icon` | 16x16 (1), in the DOM at 16 and 32 CSS px | one per built id, and VIG, FOC, GRI (step 5) | 0 rim, 6 and 4 body, 11 accent | the HUD, the cards |
| `ember` | 8x8 (0.5) a b; 16x8 c d | flicker by `floor(frame / 5) % 2` | 0 rim, 6 core, 4 and 3 licks | J2 sparks; D5, D8 fire |
| `dart` | 8x4 | a | 0 rim, 6 shaft, 3 tip | J5 |
| `ring` | 16x6 | a b | 0 rim, 6 band | J6 |
| `frost` | 8x8 | a b | 0, 6, 3 | D2 |
| `orb` | 4x4 | a | 0 rim, 6 | C1 |

Drawn with rects, not sprites (render only, no allocation): the shock's dust (2x2, Ash 4), KICK's strokes (Glare 6 over Ink 0), FLASH's square ring (Glare 6, 2 px, Ink 0 rim), SNAP's film frame and the frozen snapshot (Paper 5 and Glare 6, Ink 0 rim), the stun's three pixels (Glare 6), STOMP's starburst (Glare 6), DUST's specks and the Light Meter's ticks (Amber 8 with an Ink 0 rim: loot), SAVE's ring (Glare 6, Ink 0 rim).

### 8.2 The pool's draw
After the enemies, before the hero: every live entry by kind at integer coordinates `(x >> 8, (y >> 8) - cam)`; no allocation in `draw` (the shock's fronts through `SB.sim.shockFront`). The pool freezes with the room (a clear or a death holds every entry where it was, drawn: a photograph of the moment). `R.drawn.proj` records each drawn entry's rect `{ kind, key, x, y, w, h }` for `SB_DEV.spriteRects().proj` and the gates' pixel samples.

### 8.3 Enemy looks
- **Hit flash:** the atlas gains a `!` copy of every enemy sprite with each non Ink pixel turned Glare; an enemy with `hurt > 0` draws its `!` copy on alternate pairs of steps (`(hurt >> 1) & 1`).
- **Pop:** POP's frames where the enemy died; the enemy itself is no longer drawn.
- **Frozen (step 2):** the enemy drawn inside a snapshot: a Paper frame 1 px from its box, 2 px sides and a 4 px bottom, Ink rim (frozen in a photograph).
- **Stunned (step 2):** three Glare pixels circling over its head (by `frame`), only while `stunned > 0` (never on the pocket's sleeper).

### 8.4 The HUD: the slots (shell-ui, step 1)
`ui.initSlots()` (from `ui.init`) inserts `<span id="slots" aria-label>` before `#hearts` in `#top`, holding three `<i class="slot">` boxes, each with a 16x16 `<canvas>`. CSS (new rules only): `#slots { display: flex; gap: 3px; flex: none; margin-left: 8px }`, a box 20x20 with a 1 px border at the rocker's alpha `rgba(11,10,15,0.35)` and radius 4, dashed while empty, the canvas 16x16 `image-rendering: pixelated`, `.cool canvas { opacity: 0.35 }`. Order: jump, dive, charm; the charm box stays `hidden` until a charm is built (step 4).
- `ui.slots(st)` runs after every step (beside `ui.sheets`) and on `startRoom`; it writes the DOM only when a slot's code or the jump box's cooling (`cd[0] > 0`) changed: the icon drawn from the atlas into the canvas, the `empty` and `cool` classes, the box's `aria-label` (`COPY.slotHas` or `COPY.slotNone`). It returns the code newly put in a slot (0 if none), which the EQUIP card reads.
- Fit: at 320 wide with 4 hearts and two boxes the room name keeps about 109 px; with three boxes about 87 px (it ellipsizes, as now). Step 5 makes eight hearts fit (section 13.5).

### 8.5 The pickup card (shell-ui, step 1)
`#got`, inserted into `#stage` by `ui.initSlots()`: `role="status"`, `aria-live="polite"`, `pointer-events: none`, `z-index: 4` (under the cards' 10), Paper with a 2 px Ink border like the cards, `width: min(300px, 90%)`, centred at the stage's top (8 px down). It holds a 16x16 canvas shown at 32 px, the name (bold, 1rem) and the sentence (0.85rem). On `EV.EQUIP`: fill it, show it for `GOT_MS` 2500 ms (a 0.2 s fade in and a 0.4 s fade out; with reduced motion, the setting else the phone's, no animation), then hide. It docks low (`bottom: 8px`) when at the top it would overlap the bug's drawn box (measured as `ui.showDeath` measures). Not in `MODALS` (never modal), cleared by `ui.hideOverlays` (a new room never shows the last room's card), replaced by a newer EQUIP.

### 8.6 The swap card (shell-ui, step 2)
`#swap`, inserted into `#stage`, `role="dialog"`, built like the pause card with its own CSS rules (the shared card rule is the pause card's line and stays untouched), `z-index: 9` (the pause card's 10 covers it). Shown while `st.room.compare`: heading `COPY.swapHead`; the new weapon's row (icon at 32 px, name, sentence), then yours; the comparison line (below); Take (Sun, first, 52 px) and Keep (plain, 52 px). A tap sends TAKE or LEAVE; the card hides on the next step, when `compare` is 0. `SB.input.releaseAll()` as it opens and at the answer, so a thumb on the strip never carries into the room. In `OVERLAYS` and `MODALS`. Back in a room opens the pause card over it (the screen stays `play`); Resume comes back to it.

The comparison line: each built weapon has a traits row in `ui.TRAITS` (reach in cells, damage, both sides, holds, lift), J1 `[5,1,0,0,0]`, J2 `[2,1,1,0,0]`, J3 `[2,2,0,0,0]`, J4 `[2,1,1,1,0]`, J5 `[4,1,1,0,0]`, J6 `[6,1,0,0,0]`, J7 `[3,0,1,1,0]`, J8 `[0,0,0,0,1]`, D1 `[3,2,1,0,0]`, D2 `[2,0,1,1,0]`, D3 `[0,2,0,0,0]`, D4 `[1,1,1,0,0]`, D5 `[0,1,0,0,0]`, D6 `[5,1,1,0,0]`, D7 `[0,3,0,0,0]`, D8 `[3,1,0,0,0]`, charms `[0,0,0,0,0]` (their sentences carry them). The new weapon's differences from yours, at most two, in this order: lift, holds, both sides, reach, damage: `cmpLift`, `cmpHolds`, `cmpBoth` or `cmpOne`, `cmpFarther` or `cmpShorter`, `cmpHarder` or `cmpSofter`; none: `cmpOther`. The line is `{new} {first}{and second}.`, for example "Twin Darts hits both sides and reaches less far." (DESIGN 9.1's "hits farther", "bounces once more").

### 8.7 The scroll offer (shell-ui, step 5)
`#offer`, inserted into `#stage`, `role="dialog"`, like the swap card: heading `COPY.offerHead`, two 56 px buttons (the stat's icon, name and line), a tap sends CHOICE A or B; `ui.sheets` stops answering offers. Stat icons (`icon.VIG`, `icon.FOC`, `icon.GRI`, distinct shapes: a down chevron, an up chevron, a ring; Q84's colours as a second cue only). T1.6's offer and the M1 review's sheet rules (one sheet at a time, none over a dead room, cleared by every back and X) last lived at `4ae50f6ce` (Q92) and are lifted from there with their rows.

### 8.8 SB_DEV additions (read only)
`roomOpts()` (section 6.5); `spriteRects().proj` (section 8.2).

---

## 9. Sounds (shell-audio, one `play(name)`)

DESIGN 11 lists fourteen; weapons add these (a DESIGN 11 redline, Q120), each one short synthesized voice through the existing `tone` and `thud`:

| step | name | recipe | when |
| --- | --- | --- | --- |
| 1 | `throw` | `tone('triangle', 700, 1100, 0.07, 0.04, t)` | FIRE_J with J1 |
| 1 | `shock` | `thud(180, 0.14, 0.45, t); tone('square', 110, 55, 0.12, 0.05, t)` | FIRE_D with D1 |
| 1 | `zap` | `tone('square', 1400, 700, 0.05, 0.05, t)` | HURT without KILL |
| 1 | `pop` | `thud(1800, 0.05, 0.25, t); tone('triangle', 880, 1760, 0.08, 0.06, t + 0.02)` | KILL |
| 1 | `equip` | `tone('triangle', 392, 392, 0.06, 0.07, t); tone('triangle', 784, 784, 0.12, 0.07, t + 0.06)` | EQUIP |
| 2 | `sizzle`, `kick`, `flash`, `dart`, `halo` | short tones and noise, one each | FIRE_J (flash on BURST) |
| 2 | `shutter` | the existing shutter click | FIRE_J with J7 |
| 3 | `freeze`, `pogo`, `tremor`, `flame`, `lens`, `pile` | one each | FIRE_D |
| 4 | `saved` | two rising triangle notes | SAVED |

`stepOnce` maps FIRE_J and FIRE_D to the equipped weapon's voice through one table (`ui.WPN_SFX`); a step's kill plays `pop` and not `zap`. The pick voice (`pick`, kept since T1.6) sounds on a swap's TAKE (step 2) and a scroll pick (step 5), the player's own choices. The audio gate's list of sounds that schedule one voice grows with every name.

---

## 10. COPY (every player string the five steps add)

Step 1:
```js
wpn: { J1: 'Boomerang', D1: 'Anvil Boots' },
wpnSays: { J1: 'Every jump throws it ahead, and it flies back to you.', D1: 'Dive landings and dashes send a shock along the ground.' },
slots: 'Weapons', slotJump: 'Jump', slotDive: 'Dive', slotHas: '{slot}: {name}', slotNone: '{slot}: nothing yet'
```
Steps 2 to 4 add each weapon's name (DESIGN 9.1's, verbatim) and sentence (section 7) to `wpn` and `wpnSays`. Step 2 adds:
```js
swapHead: 'Swap {old} for {new}?', swapTake: 'Take {new}', swapKeep: 'Keep {old}',
cmpLift: 'jumps higher', cmpHolds: 'stops enemies', cmpBoth: 'hits both sides', cmpOne: 'hits one side',
cmpFarther: 'reaches farther', cmpShorter: 'reaches less far', cmpHarder: 'hits harder', cmpSofter: 'hits softer',
cmpOther: 'works differently', cmpAnd: ' and '
```
Step 4 adds `slotCharm: 'Charm'`. Step 5 adds:
```js
offerHead: 'Pick one', vigor: 'Vigor', vigorSays: 'Your dive weapon hits harder.', focus: 'Focus', focusSays: 'Your jump weapon hits harder.',
grit: 'Grit', gritSays: 'Your Lantern and Magnet grow stronger.'
```
Kills reuse `dpGain` (`+{n}`): `stepOnce` shows `+n` under the count on any step with CHEST or KILL, `n` the room's count gained that step (a chest alone is the +15 the loot gate holds).

---

## 11. The lint (tools/lint.mjs)

- **Step 1:** `NOT_YET` loses `weapon` (T2.1's word: weapons exist). New rule `WEAPON_NAMES`: the lint types DESIGN 9.1's 24 names by id and reads `WEAPONS_BUILT` from core-ns's literal; it fails when `COPY.wpn` or `COPY.wpnSays` holds an id that is not built or misses one that is, when a `COPY.wpn` value is not DESIGN's name, when the SPRITES `icon` sprite lacks a frame for a built id, and when any other player string (COPY values, markup text, aria, title, alt, placeholder) names an unbuilt weapon (whole name, case sensitive; this keeps Spark Trail out until step 2 and Darkroom Discount out for good).
- **Step 2:** the rule also requires a `ui.TRAITS` row for every built weapon (`TRAITS_MISSING`).
- **Step 4:** `NOT_YET` loses `charm`.
- `blueprint` and `Darkroom` stay forbidden while they do nothing (T2.6, T2.9).

---

## 12. Tests: what each step proves, in the house's terms

Harness groups (`H-...`), the browser gates, the redwatch rows and the shots are listed per step in section 13. Rules for all of them:
- Weapon labs build rooms from text (`LABS.room`) with enemies laid by hand (`enemyLab`'s shape) and `frozen` set high wherever a test needs an enemy to hold still for geometry (a held enemy is hit as any other, 5.3). Every expected number is computed in the test from `TUNING` (the reach, the steps, the quarters, the generator's draw through the test's own `stepRef`).
- Each weapon group places an enemy at the sentence's distance (hit) and one just beyond it (not hit), both sides where the weapon is symmetric, and asserts the damage in quarters, the hold timers and the timing in steps.
- Goldens: step 1 regolds `sample-room` and `shelves-a` once and records `sample-room-armed` (`--record sample-room --loadout J1,D1`); steps 2 to 4 each record one armed golden with their weapons (`shelves-a-jump` with J5 and D1, `sample-room-dive` with J1 and D3, `shelves-a-charm` with J1, D6 and C1). H-bot-5 holds every golden; H-bot-3's two fresh contexts run the armed one too.

---

## 13. The five steps

### 13.1 Step 1: the first fight (T2.1, J1, D1, the chest, kills, the HUD, the sitting)
**Scope.** Section 2 (step 1 rows), section 3 entire, section 4 (W1, W2, W5), section 5, section 6 (6.1 to 6.3, 6.5, and the sim's TAKE and LEAVE of 6.4), section 7.1, section 8.1 to 8.5 and 8.8, section 9 (step 1), section 10 (step 1), section 11 (step 1). The regold's why: "Weapons v1 step 1: the state carries the 16 slot projectile pool, the enemies' hurt flash and HP in quarters (HP_Q), and the room's swap candidate and Tremor count; every walk and its words are unchanged and no weapon is in these replays."

**Harness.**
- H-ns-1 extended with section 2.3's step 1 rows (its own derivation loop and the known integers).
- H-sim-6, H-sim-8 rerun with `loadout: ['J1','D1']` (equal hashes twice, across a clone and a second context; no float in 3600 random steps).
- H-wpn-1: the cooldown never delays movement: over 3600 random steps on shelves-a (immortal, as the bot's walks, so no knockback differs), the hero's x, y, vx and vy at every step with J1 and D1 equipped equal those unarmed; a jump at step N throws; a jump inside the cooldown (a short hop and a buffered press, landing before N + 36) jumps on exactly the step it jumps unarmed and throws nothing; the first jump at or after N + 36 throws; `cd[0]` runs JUMP_SLOT_CD_F to 0.
- H-wpn-2: every PROJ field of a live boomerang, `enemies[0].hurt`, `room.cand` and `room.tremor` moves the hash; a float planted in `proj[3].vx` is named by `serialize`.
- H-wpn-3: the pool never grows: 3600 steps drumming A and B with J1 and D1: `proj.length` 16 at every step, the same 16 objects as at step 0 (identity), refused spawns counted in an info line; lowest free first; a freed slot is all zeros.
- H-stat-1: damage in quarters: the boomerang's `dmg` is `1 x (4 + focus)` for Focus 0 to 4, Anvil Boots' `2 x (4 + vigor)`; Focus never scales a dive weapon nor Vigor a jump weapon; a frozen elite jelly (16 q) dies after exactly `ceil(16 / (4 + f))` passes.
- H-wpn-5: hits and kills: a weapon kill banks DP_FODDER for fodder and DP_ELITE for an elite, once; a dead enemy never moves, touches or banks again; a weapon killed icicle never hangs again; a hit carrying a stun (a hand made entry: no step 1 weapon stuns) never wakes the pocket's sleeper; HURT and KILL on exactly their steps; POP spawned; `hurt` counts HURT_FLASH_F.
- H-wpn-6: the chest: over 200 seeded loot labs with both slots empty the chest equips at once the code the test draws with `stepRef` after the specks' rolls, in its slot, EQUIP on that step, no compare and no held step (x advances with R held); one slot full gives the other slot's weapon; both full: DP only and no draw (the next speck's roll is the test's); never an equipped weapon; no swap ever arises from the built pool.
- H-wpn-7: the sim's swap with a hand loadout of unbuilt codes in both slots (J5 and D6, so no slot is empty): the chest opens `compare` with `cand` the code the test draws (J1 or D1); the world holds (hero, enemies, pool, traps, cooldowns) until a CHOICE; TAKE puts `cand` in its slot (EQUIP and PICK), LEAVE keeps J5 and D6 (PICK); the recorded script with the choice replays to the live hash and without it stalls.
- H-wpn-J1: range 5 cells and not 5 cells plus 1 px, facing right and mirrored left; a frozen jelly two cells ahead takes exactly two hits (out and back) and dies; an elite jelly takes two of its four; a wall two cells ahead turns it there and a moth beyond the wall takes nothing; a sticky jump throws away from the vine; caught or freed within J1_LIFE_F.
- H-wpn-D1: on a dive landing a frozen moth on the floor row 3 cells off takes `2 x (4 + vigor)` and one 4 cells off nothing; a moth two rows up nothing; a solid cell 2 cells right stops the right front (a moth past it untouched) while the left reaches 3; a 4 cell ledge ends the wave at its edge; a dash fires it; a dash into a wall fires nothing; a plain landing fires nothing; a hold dive fires on its final landing only; the shake on the dive landing only.
- H-bot-9: the bot's walks with J1 and D1 equipped clear every walked level with the same words as unarmed (weapons never stop the climb).
- Updated: H-en-9 (HP in quarters; `hurt(.., K.HP_Q)` for a fodder kill), H-loot-1 (the chest equips instead of a compare), H-sim-21 (PICK once on the loot walk; EQUIP on the chest's step; FIRE_J, FIRE_D, HURT, KILL each on exactly its step), H-spr-1 (section 8.1's colour law; an icon frame per built id), ASSERT_FLOOR raised to the new count.

**Gates.**
- New browser gate `fight` (test/fight.mjs; registered in tools/check.js and redwatch's BROWSER set) at 412x915, 360x780 and 320x568 (reduced motion at 320). A flat floor room loaded through `SB_DEV.loadRecord`, its chest, loot and moths laid by hand before the first state is kept (named liberties, as the loot gate's); steering by real arrow keys, A and B by real touches; the loop held and stepped. It asserts: before the chest, two empty slot boxes and a jump throws nothing; the chest by a real walk: the chest and equip voices, the +15, the slot's icon (its pixels equal the frame decoded in Node from the page's SPRITES), the world never held on that step, no dialog and never modal; the pickup card's name and sentence equal COPY's (evaluated in Node from the page source), in view, taking no tap, clear of Pause and the drawn controls, gone in about 2.5 s; a chest laid near the room's top with the bug set beside it (the camera clamped at the top): the card docks low, clear of the bug's drawn box; a real A tap throws (the throw voice), the boomerang drawn on palette in weapon colours only, out 5 cells and back, a frozen moth ahead killed (pop drawn, the count +3, `+3` under it, the pop voice); a real B dive's landing and a real B dash each make the shock (drawn at both fronts) and kill a floor moth 3 cells off; a second jump inside the cooldown (a short hop landed, then A again before step 36) jumps and throws nothing, the jump box `cool` for exactly 36 steps; the HUD writes nothing while nothing changes (a MutationObserver counts 0 over 30 quiet steps); the sitting: clear (the `SB_DEV.goto('exit')` liberty), Play it again: the new room's slots and HUD equal the cleared room's before its first step; Title through the pause card: empty; a death after the chest: Again restarts with the entry gear; the recording replayed on a fresh sim made from `SB_DEV.roomOpts()` equals the live hash; the top strip never overflows at 320 (`#top` scrollWidth at most clientWidth); zero page errors.
- `loot` (its chest lines): the chest equips (no compare), the world held for exactly one step (the scroll's answer), the recording carries one A and no TAKE; the 320 case becomes the offer and the chest's equip on one step, one held step.
- `audio`: the list of sounds that schedule one voice adds `throw`, `shock`, `zap`, `pop`, `equip`.
- Run `--fast --gate fight`, `--gate loot`, `--gate audio`, then `check --fast`.

**Redwatch rows** (each RED on its own line): CD_DELAYS_JUMP (a cooling jump slot eats the jump: H-wpn-1), POOL_GROWS (a full pool pushes a new object: H-wpn-3), PROJ_UNHASHED (`age` left out of PROJ: H-wpn-2), DMG_FLOORED (BUILD-PLAN's floored formula: H-stat-1), FOCUS_SCALES_DIVE (H-stat-1), BOOMERANG_6_CELLS (H-wpn-J1), BOOM_HITS_EVERY_STEP (the pass bits ignored: H-wpn-J1), BOOM_NO_RETURN (H-wpn-J1), BOOM_INTO_VINE (a sticky jump throws by facing: H-wpn-J1), SHOCK_THROUGH_WALLS (H-wpn-D1), SHOCK_OFF_THE_LEDGE (the surface rule dropped: H-wpn-D1), SHOCK_ON_PLAIN_LANDING (H-wpn-D1), DASH_FIRES_IN_PLACE (H-wpn-D1), KILL_NO_DP (H-wpn-5), DEAD_STILL_TOUCHES (H-wpn-5), STUN_WAKES_SLEEPER (H-wpn-5), CHEST_NO_WEAPON (H-wpn-6 and fight), CHEST_GIVES_EQUIPPED (H-wpn-6), CHEST_STOPS_FOR_EMPTY (an empty slot opens a compare: H-wpn-6 and fight), CHEST_DRAWS_ON_EMPTY_POOL (H-wpn-6), TAKE_KEEPS_OLD (H-wpn-7), HUD_STALE (fight), HUD_EVERY_STEP (fight), GOT_TAKES_TAPS (fight), GOT_STAYS (fight), GOT_OVER_BUG (the dock dropped: fight), THROW_SILENT (fight), PROJ_IN_BRICK (H-spr-1), GEAR_LOST_ON_NEXT_ROOM (fight), GEAR_KEPT_THROUGH_TITLE (fight), DEATH_KEEPS_PICKUP (fight), ROOM_OPTS_MISSING (fight), NAME_BEFORE_BUILT (lint), SENTENCE_MISSING (lint), ICON_MISSING (lint), WPN_RENAMED (lint). Retired, with the reason in their place: CHEST_HOLDS_WORLD and ANSWER_ORDER_SWAPPED (no compare opens for an empty slot, so the condition they watched never arises; step 2's SWAP rows replace them). Re anchored and RED again: COPY_PROMISES_WEAPON (the word weapon is lifted, so its slip line now fails for naming the Darkroom, NOT_YET's line), and any loot row whose anchor moved with the chest's lines.

**Shots** (`/home/codespace/sb-drafts/weapons/w1/shots/`, each at 412x915, 360x780 and 320x568, opened, three things wrong each in PROGRESS.md): `w1-hud-empty`; `w1-chest-card` (the step after the chest: the card, the +15, one icon); `w1-throw-out` (the boomerang at its far point beside a moth) and `w1-throw-back`; `w1-hit-flash` (a jelly flashing); `w1-kill-pop` (the pop and the +3); `w1-shock-full` and the worst angle `w1-shock-ledge` (the wave ending at a narrow ledge's edge); `w1-frost` (the boomerang over a Frost room's Paper: the Glare's Ink rim); `w1-card-low` (the chest near the room's top, the card docked low away from the bug: the worst angle); `w1-hud-320` (the top strip at 320 with 4 hearts and both icons).

**Review lens.** The hash and the order: every new field hashed and integer, no allocation in step, the pool never grows; weapons never delay or move the hero; the chest never stops the climb for an empty slot and draws exactly as the test does; the regold's why honest; the sitting's death and Title rules; the HUD written on change only; the card never over the bug, Pause or the controls; the words true when read.

### 13.2 Step 2: the jump slot and the swap (T2.2, T2.7)
**Scope.** J2 to J8 (section 7.2) appended to `WEAPONS_BUILT`, their K rows, sprites, sounds and COPY; the frozen and stunned looks (8.3); the swap card (8.6) with `ui.TRAITS` and the comparison words; `ui.sheets` stops answering compares; Skyhook's jump constants; `WEAPON_NAMES` requires traits.

**Harness.** H-wpn-J2 to H-wpn-J8 (each: the sentence's distance hit and one beyond not; damage in quarters; timing: J2's three drops 10 steps apart and their 90 step burn, J4's burst on the apex step computed by the test's own stepping, J5's travel exactly 4 cells and a dart stopping on its first enemy, J6's 6 cells up through one ways and stopped by a solid, J7's 30 step freeze with no damage, J3 only on a wall or sticky jump and never on a ground jump, J8 with no fire and no cooldown); H-sim-1b (Skyhook's apex 85.5 px and 102.5 px in Deep from the test's own stepping); H-bot-8 (with J8 equipped every main ascent edge of every walked level still has a macro the sim performs: Skyhook never makes an ascent edge fail); H-wpn-7 extended (a full slot from the built pool opens the swap once every slot is full; CHEST_FILLS_EMPTY_FIRST fills empty slots first over 200 seeded rooms).

**Gates.** New browser gate `compare` (test/compare.mjs, BUILD-PLAN's name; 412x915, 360x780, 320x568): a room whose chest offers a jump weapon to a full jump slot (the loadout through the sitting, or laid by hand); the card by real taps: Take swaps (the HUD's icon, the EQUIP card, the pick voice), Keep keeps; while it is open nothing in the world moves (hero, enemies, pool, traps, cooldowns; BUILD-PLAN T2.7's "the frame counter does not advance" reads this way, because section 2.6 keeps every step counted); the card's words are COPY's and its comparison line is the one the test computes from the traits; every control 48 px or more and on top; the pause card over it by a real tap on Pause, Resume back to it; the recording carries the choice and replays to the live hash. `fight` gains a Twin Darts throw and a Shutter Snap freeze drawn (the snapshot frame on palette). `audio` gains the step's names.

**Redwatch rows.** SWAP_AUTO_TAKES (the shell answers TAKE again: compare), SIM_RUNS_UNDER_SWAP (compare and H-wpn-7), SWAP_WORDS_WRONG (a comparison phrase flipped: compare), SWAP_NOT_MODAL (compare), TRAITS_MISSING (lint), TWIN_DARTS_ONE (H-wpn-J5), DART_PASSES_THROUGH (H-wpn-J5), HALO_THROUGH_SOLID (H-wpn-J6), FLASH_AT_TAKEOFF (H-wpn-J4), SNAP_HURTS (H-wpn-J7), KICK_ON_GROUND_JUMP (H-wpn-J3), SPARKS_2 (H-wpn-J2), SKYHOOK_ON_WALL_JUMP (H-sim-1b), SKYHOOK_BREAKS_ASCENT (a J8 jump velocity that overshoots a ceiling edge: H-bot-8), FROZEN_UNDRAWN (fight).

**Shots** (`w2`): each jump weapon mid effect beside an enemy at its distance (`w2-<id>`), the swap card (`w2-swap`) at three sizes, the swap card under the pause card, a frozen enemy's snapshot and a stunned one's stars, the worst angle: the swap card at 320x568 with the bug at the room's top, and Halo under a low ceiling.

**Review lens.** Each sentence true at its distance and false one past it; the swap holds the world and only the player's word moves it; the comparison phrases true; Skyhook never breaks a climb the model promised; the back gesture over the card.

### 13.3 Step 3: the dive slot (T2.3)
**Scope.** D2 to D8 (section 7.3), the stomp contact rules (W3, STOMP), Tremor's cap and its Dead pixel specks, fire tiles, Wide Lens on the SHOCK kind; their K rows, sprites, sounds, COPY.

**Harness.** H-wpn-D2 to H-wpn-D8 (as the jump groups; plus: Pogo Spear's bounce is 33 px by the test's stepping and the stomped enemy never takes a heart from the bug in its grace; Pile Driver hits one enemy, never a second, and the dive goes on; Tremor's Dead pixels are the test's draws and stop at TREMOR_ROOM_CAP; Ember Stomp hits a standing enemy every 30 steps over its 120; Flashpan only on a dash and its line only over cells the dash can run; landing only weapons do nothing on a dash); H-bot-10 (with D3 equipped the walks still clear: a bounce never strands a dive edge).

**Gates.** `fight` gains a Pogo bounce off a frozen moth (by real touches), Tremor's specks, Ember Stomp's fire. `audio` gains the step's names.

**Redwatch rows.** POGO_NO_BOUNCE, PILE_DRIVER_SPLASHES (BUILD-PLAN's names), STOMP_STILL_HURTS, POGO_ON_DASH, FLASHPAN_ON_LANDING, TREMOR_UNCAPPED, TREMOR_DRAWS_NOTHING, EMBER_ONE_TICK, WIDE_LENS_3_CELLS, ICICLE_HURTS.

**Shots** (`w3`): each dive weapon at its moment, Tremor's specks rising, the worst angles: a Pogo bounce under a one way, Ember Stomp on a Frost slick edge, Flashpan stopping at a ledge.

**Review lens.** Landing versus dash per DESIGN's letter; the stomp never costs the bug a heart from the enemy it stomped and never gives i frames; Tremor cannot farm Dead pixels; determinism of Tremor's draws.

### 13.4 Step 4: charms (T2.4, C1 to C6)
**Scope.** Section 7.4; the HUD's charm box shown; `NOT_YET` loses `charm`; `slotCharm`; Tripod's K override; the Light Meter ticks; Second Wind and Thick Skin in `hitHero`.

**Harness.** H-wpn-C1 to H-wpn-C6 (Lantern's pulse once a second, `min(12, 4 + 2 x grit)` quarters within 1 cell and none beyond; Magnet's reach and its cap at Grit 10; Second Wind once a room, Thick Skin eats exactly the first hit, traps included; Tripod's slide one fifth and 5 across from the test's stepped table); H-stat-2 (every Grit cap holds at Grit 10); H-reach-8 (Tripod's table gives 5 across at dy 2 or less); H-route-11 (the route score of every fixture is unchanged by any charm: the model never counts one).

**Gates.** `fight` gains the charm box (empty, then a charm), the Lantern's orbit and a kill by its pulse, Thick Skin's absorbed hit (no heart lost, the SAVED voice), Light Meter ticks for a speck above the view. `audio` gains `saved`.

**Redwatch rows.** MAGNET_9, TRIPOD_CHANGES_MODEL (BUILD-PLAN's names), LANTERN_OVER_CAP, SECOND_WIND_TWICE, THICK_SKIN_SKIPS_TRAPS, CHARM_BOX_HIDDEN, LIGHT_METER_IN_VIEW (a tick for loot already in view), COPY_PROMISES_CHARM re anchored (the word charm is lifted, so its line now names an unbuilt charm, Fixer, and fails WEAPON_NAMES).

**Shots** (`w4`): the HUD with three icons at 320x568 (the worst angle), the Lantern's orbit on Frost, Magnet's pull, the Light Meter's ticks at the top and bottom edges.

**Review lens.** The model never counts a charm; Tripod's override against the stepped table; once a room means once a room; Grit's caps; the word charm lifted only now and C7 and C8 absent everywhere.

### 13.5 Step 5: stats and scrolls (T2.5)
**Scope.** Section 7.5 and 8.7: the offer card; `ui.sheets` stops answering offers; the stat icons; the sitting carries `vigor`, `focus`, `grit` and `scrolls` (`opts.stats`) and each room starts full; the top strip holds Pause, three slots and eight hearts at 320 wide (under 360 px and over six hearts the hearts draw 14x12 with a 2 px gap).

**Harness.** H-stat-1 extended (each stat's +25% on its own slot only, through a scroll pick); H-loot-2 kept (hearts at 3, 6, 9 scrolls, cap 8); H-sit-1 (the sitting: `create` with `opts.stats` gives the stats, scrolls and `heartsMax` the clear handed on, with full hearts).

**Gates.** `loot` brings back T1.6's offer by a real tap (the world held under it, the recording carrying the pick, a replay reaching the live hash), with the M1 review's sheet rules; `fight` (or `loop`) asserts a fifth heart after three scrolls across rooms of a sitting and full hearts at each room's start; the top strip at 320 with eight hearts and three slots never overflows.

**Redwatch rows.** OFFER_AUTO (the shell answers again), SIM_RUNS_UNDER_SHEET kept, STATS_NOT_CARRIED, HEARTS_NOT_REFILLED, OFFER_SAYS_CHARM_FOR_GRIT, and T1.6's retired sheet rows (SLIP_OVER_OFFER, SHEET_OVER_DEATH, OFFER_NOT_CLEARED) lifted from `4ae50f6ce` and RED again.

**Shots** (`w5`): the offer card at three sizes, the top strip at 320 with eight hearts and three icons (the worst angle), the offer over the pause card.

**Review lens.** The offer is a real choice and its lines are true; nothing the player cannot see grows; the sitting carries exactly what it says; the top strip at its smallest.

---

## 14. Deferred (not in Weapons v1)

- **The Darkroom** (T2.9): the shop, the collector, the loaded pool of four a slot, rerolls, and C7 Darkroom Discount; `WEAPONS_BUILT` stands in for the loaded pool; the word Darkroom stays forbidden.
- **Blueprints** (T2.6): drawn, carried, banked and developed, and C8 Fixer; the blueprint stays hidden in render (Q92, Q93) and the word blueprint forbidden.
- **House runs** (T2.8): run state persistence, the doorway, Retry House, gear across a house; the free play sitting stands in for carrying gear.
- **The boss** (T2.10a, T2.10b, T2.11): weapon damage to the boss (bit 31 of the hit bits reserved; HP in quarters per cell), the boss hit voice and its shake.
- **C7 and C8**, while their systems do not exist.
- **The economy log and prices** (T2.12), the starting loadout pick (DESIGN 9.4), and saving the gear in the save.
- **Astra's art** for every HOLD item named in 8.1: the placeholders are the builder's until Stephen approves Astra's cut.
- **Rarity and affixes**: none at launch (DESIGN 9.1).

---

## 15. Stephen's calls (the build runs on each default)

Ranked by how much they change the feel.

1. **Free play keeps the gear from room to room until Title.** Default: yes (`KEEP_GEAR`). DESIGN's letter (each free play room starts empty) makes the weapon vanish at every new room and the swap card unreachable outside a house run.
2. **A chest fills an empty slot before it offers a swap.** Default: yes (`CHEST_FILLS_EMPTY_FIRST`): the first chests arm the bug with no stop; once every slot is full every chest is a swap.
3. **The drop pool before the Darkroom.** Default: every weapon the build has. Option: Q52's tier 1 six only (J1, J5, D1, D6, C1, C2).
4. **The dive slot's cooldown.** Default: none (DESIGN's letter; a dash needs a fresh press and a dive an airborne start). Option: 0.6 s like the jump slot (`DIVE_SLOT_CD_S`).
5. **Damage in quarter HP**, so each stat point is exactly +25%. Default: yes. Option: BUILD-PLAN's whole HP formula, floored, under which the first three points do nothing to a 1 damage weapon.
6. **No unarmed attack (Q27).** Default: none until the first pickup (DESIGN's letter). Option: an unarmed dive stomp of 1 damage.
7. **The pickup card**: two and a half seconds at the room's top, docked away from the bug, no tap. Options: the name only in the top strip; beside the chest in the room.
8. **The slot HUD**: icons in the top strip, jump, dive, charm, faint dashed boxes while empty. Options: the icons on the A and B buttons after the thumbstick lands; boxes hidden until the first pickup.
9. **What a hit touches**: the enemy's whole box (what you see is what hits). Option: the 2 px core the enemies use on the bug.
10. **The Boomerang comes home through walls** (its way out stops at a wall). Option: blocked both ways (it can be lost).
11. **Anvil Boots and Wide Lens run along the surface**, stopped by walls and where the surface ends. Option: a flat band through anything.
12. **A dash fires the dive weapon on its first step.** Option: at its end.
13. **Landing only and dash only weapons**: Pogo Spear and Pile Driver do nothing on a dash, Flashpan nothing on a landing (DESIGN's letter). Option: a dash thrust for the spears.
14. **Pogo Spear's bounce**: 2 cells up (33 px). Option: 2 cells above a full jump.
15. **Tremor's Dead pixels**: at most 12 a room. Option: DESIGN's letter, no cap (endless Dead pixels by diving beside a wall).
16. **Flashpan's line burns 1.5 s** (DESIGN gives no length).
17. **Kills show +3 (or +10) under the count**, like the chest's +15. Option: the count moves alone.
18. **New sounds**: five shared (throw, shock, zap, pop, equip) and one for most weapons, beyond DESIGN 11's fourteen. Default: yes; the throw is soft because it sounds on every jump.
19. **Names**: DESIGN's, verbatim, though D2 Icicle shares the Frost enemy's name and J2 Spark Trail the Ember enemy's. Default: keep.
20. **Back on the swap card** opens the pause card (as everywhere in a room). Option: back keeps yours.
21. **The stats carry with the gear** in a sitting, and each room starts with its hearts full (step 5). Option: stats per room (then hearts never grow in free play).

---

## 16. The readings this spec rests on (QUESTIONS Q120 holds them)

- DESIGN 8: free play's sitting keeps the gear (call 1). DESIGN 9.1's "none equipped until the first pickup" holds for the first room of a sitting.
- DESIGN 9.1's "with the sim paused" is section 2.6's hold: the loop steps, the sim holds the world, every step counted (BUILD-PLAN T2.7's frame counter line reads as nothing in the world moving).
- DESIGN 9.2's +25% a point is kept exactly in quarter HP (call 5); BUILD-PLAN T2.1's floored formula is not built.
- DESIGN 9.1's dive slot fires on landings and dashes as each weapon's line says (call 13); the dive slot has no cooldown (call 4).
- DESIGN 9.1's Tremor gets a room cap (call 15) and Flashpan a burn time (call 16): both readings.
- DESIGN 11's sound list grows (call 18).
- DESIGN 9.3's "chest 15 + a weapon" is built; Q92's "Dead pixels only" was ruled until weapons exist, and they do.
