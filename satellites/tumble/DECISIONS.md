# TUMBLE: decisions log

Every call made where `DESIGN.md` or `docs/OPUS_PROMPT.md` was silent, ambiguous, or impossible as written.
Newest calls are appended at the bottom of each section. "Why" is always given.

## Pinned versions

| Library | Version | URL |
|---|---|---|
| three.js | 0.186.0 | `https://cdn.jsdelivr.net/npm/three@0.186.0/build/three.module.js` (+ `examples/jsm/` addons) |
| Rapier (compat, inlined WASM) | 0.20.0 | `https://cdn.jsdelivr.net/npm/@dimforge/rapier3d-compat@0.20.0/dist/rapier.mjs` |
| Fonts | Fraunces 500/700, Nunito 500/700/800 | Google Fonts, `display=swap` |

Both were the latest on npm on 2026-09-17. The Node tests use the same Rapier version from `node_modules`
(`npm install` in this folder; `node_modules/` is gitignored).

## Where the game lives

- **Folder, not a new repo.** The brief assumes "this repo" holds `DESIGN.md`. No such repo existed, so the game
  lives at `satellites/tumble/` inside `lucid-winds` (the studio's home for every web game), with the
  `DESIGN.md §13.5` layout reproduced inside that folder. Creating a new GitHub repo overnight without the Director
  was judged too outward-facing.
- **Committed to the working branch, NOT deployed.** Hostinger deploys `main`. The brief says a reviewer checks the
  work in the morning, and Jumping Jimothy releases on Steam on Sep 18, so nothing was pushed to `main`. If the branch
  is deployed for another reason, `index.html` loads the studio's workbench gate (`/dev-gate.js`) only on
  `lucidwinds.com`, so a stranger never lands on an unfinished build.

## Deviations from the brief

- **`file://` cannot work.** The brief asks for ES modules through an import map AND for everything to run from
  `file://`. Chromium and Firefox refuse to load module scripts from a `file://` page (the page's origin is opaque,
  so sibling module fetches fail CORS). Without a build step the two rules cannot both hold. ES modules won (the brief
  is explicit about them and every Node test imports the same files). Opening `index.html` from disk shows a short
  notice with the one line to serve the folder. Service workers also require http(s).
- **Brand name.** DESIGN says "Lucid Winds / Sky Walk Studio". The studio's registered name is **Sky Wolf Studio**
  (singular); that is used in any player-facing credit.
- **No dashes in player copy.** Studio rule: commas and semicolons only in anything a player reads. Hero names in
  DESIGN §8 that carry hyphens are written without them ("Two Stripe Tube", "Inside Out Permanently").

## Physics (step 1)

- **Aggressive sleeping is a freeze, not `rb.sleep()`.** Measured: Rapier 0.20's `sleep()` called by hand marks the
  body asleep but keeps integrating gravity; a slept sock sank through the 10 cm table top while `isSleeping()`
  reported true. A body that has been at rest for 0.5 s (DESIGN 13.1) becomes a **fixed** body instead, which costs
  nothing to simulate and is still solid. It thaws when a moving body (> 0.2 m/s) or a held sock touches it
  (`world.contactPairsWith`; sock colliders enable DEFAULT | KINEMATIC_FIXED so kinematic-vs-fixed pairs are reported).
- **Rest is drift, not speed.** A sock wedged in the pile spun in place at 5 rad/s for seconds without moving. "At
  rest" = moved less than 4 mm and turned less than 3 degrees since the rest clock started.
- **The dump is a heightfield drop.** Falling clouds and strict layers both failed the "200 socks settle in under
  2 s" bar (a 200 sock avalanche ran 3 to 5 s; strict layers stacked 27 deep). Each sock is placed flat at the lowest
  of 28 candidate spots on a 2 cm heightfield, dropped a few millimetres, and the whole pile freezes together once
  every sock has been still for 0.25 s. Measured in Node: 43 socks 0.8 to 1.2 s, 100 socks 1.2 to 1.3 s, 200 socks
  1.4 to 1.5 s of simulated time. The tumble out of the dryer is drawn by the renderer as an arc onto each sock's
  landing spot, bottom of the pile first, then the recorded settle plays back (DESIGN 13.2 "pre-simulated
  offscreen").
- **"Compound capsule" is a raft.** A flat sock is about 7.5 cm wide and 2.7 cm thick; one capsule per segment is
  either too thin or too thick. Each segment is two parallel capsules (radius = half the thickness). Ankle and baby
  are one segment, crew, knee, dress, novelty and slipper are two segments in an L, and the toe sock is one segment
  plus a flattened box (DESIGN 13.2). Colliders never use the visual mesh.
- **Dump damping.** While the dryer pre-simulates, socks carry extra damping (2.6 linear, 6 angular); play values
  (0.9, 2.4) return when the pile is handed to the player.
- **Invisible glass** walls 1.4 m tall and a ceiling keep every flick on the table (DESIGN 3.3 "misses stay on
  table"). Anything that still escapes is returned to the middle of the table.

## Rendering (step 1)

- One `InstancedMesh` per silhouette for table socks, plus one small non-shadow-casting `InstancedMesh` per
  silhouette for held socks (a sock held toward the camera would otherwise throw a giant shadow over the table).
  Balls have the same pair of pools. Draw calls for socks stay at 8 on the table.
- **Held sock size.** A held sock is placed on the finger's ray at `tableDistance / 1.55` from the camera, so it reads
  1.55 times larger than on the table (Warm hands: 1.95). It stands like a sock on a clothesline (cuff up, foot to
  the right, face to the camera) and floats 96 px above the thumb so the thumb never covers it.
- **Camera fitting is searched.** The table's front corners must fit the width, the basket and dryer door must fit
  the height, and the top band stays clear for the HUD. `Renderer._fitTable` searches distance and target for the
  current aspect instead of hard-coding a pose.
- Tone mapping is three's Neutral (Khronos PBR Neutral) so sock colours stay close to the palette the contrast floor
  was computed on.

## sockgen and the atlas (step 2)

- **Seeds are SHA-256 hex** (the Lucid Winds plant engine's currency). `decode()` reads the DESIGN 7 fields
  MSB first from the first 37 bits; the pair id is hex 40..56. A decoy is the same hex plus a mutation suffix
  (`<hex>~palette.137`), so every decoy has a permanent, shareable seed. Hero socks are `hero:<id>`.
- **Painting is pure JS with signed distance fields and analytic anti-aliasing**, not canvas 2D, so the same seed
  paints the same bytes in Node and in the browser (DESIGN 15.4; `tests/golden.json` pins the 64-seed atlas).
  About 25 ms a tile once warm; tiles are painted in up to three module workers and cached by seed and colour mode.
- **Patterns are laid out in centimetres**, with repeat counts that divide the circumference exactly, so U wraps
  without a seam and circles stay round on the mesh even though the tile is square.
- **`patternFamily` is 4 bits for 10 families**: `value % 10`, so solid to chevron are slightly more common
  than fair isle to plaid (2/16 vs 1/16). The Load generator does not rely on the distribution.
- **Palette = scheme (2 bits) + hue (6 bits, 5.625 degrees a step).** A hue shift decoy moves only the hue bits.
- **The contrast floor is CIEDE2000 >= 7 between body colours, checked for all four viewers at once**
  (standard, deuteranopia, protanopia, tritanopia, the last three through the Machado 2009 simulation). A decoy
  that fails in any mode takes a bigger hue step. So a Load is identical whichever colour mode is on, and
  distinct in every one (important for the Daily). In a colour vision mode the hue circle is replaced by a loop
  that viewer can see (lightness with blue to yellow, or lightness with red to teal). Deuteranopia and
  protanopia share one remapped table; each is still checked in its own simulation.
- **Kid size** is the 1-bit `size` field; the Load generator keeps about 12% of socks kid sized (rendered at 0.82).
  "Nothing gets smaller to make a level harder" is respected: size never changes with tier and is never a decoy field.
- **`condition`** = plain, lint, hole, pilled. It is part of a design's identity (both socks of a pair share it).
  **Inside out is a per-sock state**, not a spec field: matching ignores it, the shader mutes it, a double tap flips
  it, and an unflipped inside out sock only costs the Spotless rating.
- **Hero socks are recipes, not PNGs.** No art exists yet and 40 PNGs would break the 2 MB budget. Each hero in
  `data/hero-socks.json` is a recipe (colours, base pattern, layers of shapes and stroke-font text) painted by the same
  engine. `"tile": "proc"` marks a recipe; a real PNG path can replace it later.
- **Flat sock pictures** (`engine/flat.js`) wrap a tile onto the silhouette the way a held sock shows it. The Drawer,
  results cards, share card, the hero preview sheet, the clothesline and the app icons all use it.

## Load generator (steps 3 and 4)

- **Decoy ratio = share of the Load's pairs that are decoy pairs.** A decoy is a whole pair (two socks) whose spec
  is one field away from a pair already in the Load. Decoys may imitate other decoys, which is the only way tier 9
  reaches 90% (with 90% decoys only two original pairs exist).
- **No two designs in a Load may look alike.** `visualSignature()` lists only the fields a viewer can see for that
  family (a solid sock's stripe rhythm is invisible). Signatures are unique per Load, and designs that differ only
  in colour must clear the floor. Decoy fields are only used where they are visible (rhythm only on rhythm
  families, mirrored motif only on asymmetric shapes).
- **Tier ladder** (Loads completed in that mode): 0, 2, 4, 7, 10, 14, 19, 25, 32, 40 for tiers 0 to 9, capped at
  Eyes pegs + 2. Six pegs are marked Eyes (Warm hands, Second look, Good toss, Sorting by feel, Odd eye, Knows the
  drawer), so tier 9 waits for a post launch Eyes peg; tier 8 is the current ceiling.
- **Hue steps by tier**: 6 steps (33.8 degrees) up to tier 6, then 5, 4, 3 (16.9 degrees; the floor may widen it).
  The tier 1 to 3 "hue shift at least 30 degrees" is met.
- **Pattern first at tiers 1 to 3** (colour only decoys): those tiers use stripe rhythm decoys instead, the only
  pattern field that keeps "exactly one field mutated".
- **Heroes**: owning a pack puts about one pair in ten from that pack into a Load. Odd rarity heroes only arrive as
  odd socks. Reunion and portal heroes never spawn in a Load.
- **Daily Load**: seed = SHA-256 of "tumble-daily|YYYY-MM-DD" (local date), Regular size, tier 3 to 6 from the hash,
  no Odd Bin reunions and no hero packs, so it is the same for everyone.

## Handling (step 3)

- **Tap to pick up is always on.** DESIGN lists tap sock then tap basket as an accessibility alternative. A tap
  with no movement had no other meaning, so a tap puts a sock (or ball) in the hand, shown large at the bottom of
  the screen; a tap on another sock brings it over to match. Hold and tap with a second finger works exactly as
  DESIGN describes. Drag and flick are unchanged. This makes one thumb play possible without two fingers.
- **Tap the basket** lobs the ball in on a computed arc (it always goes in). It counts as a made shot, never as a
  long shot. Flicks get a gentle aim assist: within 9 degrees of the basket, 60% of the gap is closed.
- **Tap the Odd Bin** sends the sock in hand there. A sock that still has a twin in the Load is refused and pops
  back out (Laundry Day: no cost; Rush: breaks the streak). A sock flicked into the Bin by hand counts the same way.
  A lone sock that lands in the basket pops out.
- **Reunion**: a sock in the Load whose mate waits in the Odd Bin (the 30% case) can simply be binned; it meets its
  mate there and the Results screen plays the meeting.
- **Double tap flips**; a single tap on the sock already in the hand flips it too.
- **A release off a quick flick** starts from where the finger lifted the sock (the finger plane), even if the body
  had not caught up yet, so a 100 ms flick on a slow frame still flies.
- **Two finger swipe shakes the pile.** A round arrows button does the same for mice and for one handed play.
- **Hold and tap with a still thumb.** A thumb resting on a sock has not moved past the 9 px slop, so the sock is lifted
  the moment a second finger lands (not on movement), and such a press always ends as a release, never as a tap.
- **A tap on a table sock while holding one waits 0.34 s** before fetching it, in case it is the first half of a double
  tap (which flips that table sock instead, with no mismatch). A double tap on a sock with an empty hand picks it up and
  flips it in the hand.
- **Letting go while a pair rolls into a ball** sends the ball to the pocket instead of dropping a half rolled sock.
- **The Sweep takes taps**: a tap near a stray pops it in before the automatic sweep (DESIGN 3.3); nothing else is live
  after the clock.
- **Removing a body during a Load disables it** (body and colliders) and the world is freed at the next Load. Measured:
  Rapier 0.20 `removeRigidBody` right after a fixed/dynamic switch, while another collider is disabled, panics inside
  the next step in 9 of 60 seeds. The game loop also catches a step panic, puts the Load away and says so.

## Rules, economy and save (step 4)

- **Tidy rating**: Spotless = no missed shots and every inside out sock flipped; Tidy = one of the two;
  Lived in = neither. Misses never cost Lint.
- **Clean Load** = no stray balls left when the Sweep starts (both modes). Quarters: Clean Load 1, Spotless Tidy 1
  (Laundry Day only).
- **Lint** = 2.2 per pair + 1 per made shot + a tidy bonus (Spotless 30%, Tidy 12% of the pair Lint) in Laundry Day,
  or + rush points / 180 in Rush. `tests/economy.test.mjs` holds the calibration against a written down "relaxed
  player": Laundry Day pays 66.6 Lint and 0.90 Quarters a Regular Load (DESIGN: about 200 Lint and 3 Quarters for
  three Loads). **DESIGN gives no Rush Quarter figure**; a Clean Load in Rush is a skill bonus, so the relaxed Rush
  player earns about 0.01 Quarters a Load. The test only requires Rush to pay the same Lint and no more Quarters.
- **Rush Timed**: 6 s a pair minus 0.3 s a tier, floor 3 s, applied to every Load size, plus 3 s per odd sock.
  **Streak**: +1 multiplier per 3 consecutive correct pairs, up to x5; a mismatch, a wrong bin or any missed shot
  resets it. **Power dots**: 1 per 5 consecutive pairs, 8 at most. Costs: Static Cling 2, Dryer Sheet 2, Spin Cycle 3,
  Sock Puppet 4. **Long shot**: launched from 0.75 m or more from the basket (three basket widths), +25% points.
- **Save**: IndexedDB with a localStorage mirror and fallback. Version 2 adds equipment, extra counters, the Daily
  history and one-time notes to the DESIGN 13.6 shape (version 1); `migrate()` upgrades a v1 save.
- **Odd socks go into the Drawer** as "missing a mate" entries; the Drawer filter shows them.
- **Daily Loads never feed the Odd Bin** (their odd socks are the same for everyone, and replaying the Laundry Daily
  would otherwise farm Reunions). The Daily is always generated pattern first, so the accessibility toggle cannot make
  two players' Dailies differ.
- **An odd sock whose twin already waits in the Bin is a Reunion however it arrived** (the 30% roll, an odd hero from a
  pack, or the portal stranger). Portal Loads keep the stranger in slot 0 and roll the Reunion into another slot, so the
  30% rate holds.
- **Power dots count their own run** (one per 5 correct pairs since the last dot), so a basket settle (which costs a
  streak point) can never pay a dot twice. A basket tip takes back the points of the balls it spills.
- **Night play** for the Rainy day peg is 8 pm to 5 am local.
- **Start over keeps settings** (colour vision, pattern first, sound): they describe the player, not the progress. It
  ends a Load in progress without results and lands in the room.
- **An imported save is untrusted**: drawer, Odd Bin, peg, unlock, lore and Daily entries are filtered to well formed
  ids and numbers before anything reaches the page.
- **The wall calendar circles every Daily** finished this month, Laundry and Rush (`dailyDays`), laid out as a real
  month grid. Dates shown to players are written out ("September 17, 2026"); the ISO date is only a key.
- **Room spots have capacities**: one rug, window, clock, garland, calendar and cat; four frames and plants; three
  posters, lamps and shelves; five mugs. Placing past the capacity takes the oldest item of that kind down.
- **Reunion gifts appear on their own** once earned: the Odd Eye Lamp on the dresser, the lint frame from page 12 on
  the wall, and the three portal gifts (glowing lint on the dresser, a postcard by the door, a tiny mat on the floor).
- **How to play can be closed** without starting (the first Load still waits for it).
- **Basket Balance settles with a one finger tap** on the basket (DESIGN says a two finger tap): one thumb play, and a
  tap on the basket with an empty hand had no other meaning. With a ball in hand the tap still lobs it.
- **The Daily Rush board is this device's five best Dailies** (DESIGN 9.7 "client side leaderboard"), shown on the
  Daily Rush result with today marked. There is no shared leaderboard (no server, no analytics).
- **The Drawer's "spin in 3D"** is a card that turns between the sock's two faces (CSS 3D), not a second WebGL
  context. **Rarity glow** marks uncommon and rare hero socks.
- **The Sweep banner** (DESIGN 10.4) shows shots made and missed and either the Clean Load bonus or the strays left.
- **Flick tuning (revised in the review pass)**: a flicked ball takes its direction from the finger's path on the table
  plane and its strength from the finger's speed on screen: launch m/s = (px/s / screen height px) x 2.3, so 1200 px/s
  on an 844 px tall phone is 3.3 m/s. Slower than 0.55 m/s sets the ball down. The first version used the speed on the
  table plane x 1.35, tuned on gate flicks whose timing the headless harness had stretched; with real timing a brisk
  1485 px/s flick flew two metres past the basket, and the same flick measured 3.3 or 5.1 m/s depending on where on
  the screen it started (the plane is foreshortened toward the back of the table). A flick aimed within 9 degrees
  of the basket gets 60% of its aim error and, if its strength is between 0.55x and 1.8x of the ideal speed for that
  distance (`idealSpeed()` in physics.js, damping included), 70% of its strength error removed. Measured in the
  physics world: the ideal speed lands from six spots on the table; 25% too hard misses unassisted and goes in after
  the nudge. On an 844 px tall phone that should land flicks of roughly 1000 to 1500 px/s. **Still needs a
  thumb on a real phone**: `?debug=1` prints the last flick (px/s, raw, ideal, launch) and `?shotgain=`,
  `?rangeassist=`, `?assist=` override the numbers without a code change.

## Rendering and offline (review pass)

- **Atlas memory is bounded**: about 96 painted tiles (25 MB) are kept, tiles on screen never leave, a new Load drops
  older Loads' tiles first. A changed tile or two upload row by row (`updateRanges`); more than eight upload the whole
  texture. Mipmaps are rebuilt on the GPU either way.
- **Endless keeps the tiles you can see**: the six physical balls in the basket keep theirs; a packed ball deep in the
  basket may give its tile up when the atlas is full and borrows a visible ball's look. With 63 designs in view the
  dryer waits.
- **Ball textures sample with explicit gradients** taken before the wrap, so the ball's repeated leg and cuff do not
  draw seam lines.
- **The service worker precaches the pinned CDN modules at install**, so a second launch works offline even though the
  first visit fetched them before the worker existed. If the CDN cannot be reached at all, the boot screen says so and
  offers a retry instead of spinning.

## Content (written by agents, reviewed and merged)

- 43 hero socks (`data/heroes/*.json`, merged into `data/hero-socks.json` by `node tools/build-heroes.mjs`), each
  rendered and looked at, checked in all colour modes. **Renames under the IP rule** (DESIGN 6, parody categories only):
  "Bass Pro Shade" -> **Bait Shop Shades** (a real retailer); "Tour '94 for The Dampness" -> **Tour '94 for Damp Towel**
  (one word from the real band The Darkness); "Muncie Comets Little League" -> **Muncie Comets Tee Ball** (Little League
  is a registered mark); "Dave's Discount Tire" -> **Dave's Reasonable Tires** (a real tyre retailer). DESIGN 8 still
  lists the old names.
- The lava lamps are **Blob Lamps** ("Lava" is a registered mark). The clothesline dryer is the **Backyard Clothesline**
  (it would read as the Clothesline progression screen otherwise).
- The three impossible socks (10, 30 and 75 Reunions): Somehow Still Clean, and two more in `data/heroes/impossible.json`.
- Lore (`data/lore.json`) follows DESIGN 9.6 beat for beat; page 7 unlocks the portal dryer purchase, page 8 portal
  Loads, page 12 the third impossible sock and a frame for the room.
- `data/unlocks.json`: 120 items (12 baskets, 5 dryers, 66 decor, 6 radio stations, 4 ball styles, 3 trails, 4 hero
  packs, 20 Reunion gifts) at the DESIGN 9.5 prices. `data/clothesline.json`: 16 pegs and 4 empty ones, 6 marked Eyes,
  4 marked Rush and hung at the far end.
