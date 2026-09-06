# HANDOFF FATHOM, the build plan for one Opus night

**Written:** 2026-09-05 evening, by Fable, from `docs/handoffs-uploaded/six-20260905/6handoffs/HANDOFF-FATHOM.md`
(Stephen's design, read in full) plus the fleet as it stands on branch `add-sproing-jumper` tonight.
**Reads before this one:** `HANDOFF-OPUS-NIGHT-SEP05.md` (the spine, the prompt, the order table), then this file, then the
design. Where the design and this file differ, this file wins, because every difference below was forced by a measurement or
a fleet law and is listed in section 3 with its reason.
**Game folder:** `satellites/fathom/` (the slug is free, checked 2026-09-05). **Live URL when Fable lists it:**
`lucidwinds.com/satellites/fathom/`.

---

## SESSION STATE (the builder updates this at the end of every session; the morning reader starts here)

- 2026-09-05 Fable: plan written. Nothing built.
- 2026-09-05 Opus: P0 step 1, `tools/check.js` with one gate and no `sim.js` to run, red, pasted in section 13.
- 2026-09-05 Opus: **DONE P3.** P0, P1, P2 and P3 are all built and green. Ten gates in `tools/check.js`, every one
  watched to fail, output pasted in section 13. Twelve screenshots opened with the Read tool and three faults named in
  each; the ones worth acting on were acted on and the rest are in the morning report. The game is playable end to end
  by a real thumb: five caves, lurkers, the hum, sound, the save, and THE DEEP.
  **NOT BUILT, on purpose:** occlusion (design 11, plan 3.5, v1.1), the secondary echo off a big wall (design 5,
  stretch), a second species, the daily seed and share card, Penny mode, and `art/title-bg.jpg` which the code reads
  if it ever appears.
  **Next action for whoever opens this:** nothing is half finished. If more time goes into Fathom, the first thing is
  the world scale question in the morning report (a deep cave reads as a chunky maze because a screen is only fifteen
  tiles wide), and it is Stephen's call, not a session's.

---

## 0. RULES OF ENGAGEMENT

1. **The fence.** You may create and edit files under `satellites/fathom/**` and this plan's ledger (section 12 of this file,
   `plans/fathom/HANDOFF-FATHOM.md`). Nothing else. Not another satellite, not `portal/index.html`, not `scripts/`, not
   `music-unlocks.js`, not any other game's `sw.js`, not `art-asset-lists/`, not the memory directory. If a fix seems to need a
   file outside the fence, it goes in the morning report as a request to Fable and the game works around it tonight.
2. **Git.** `git pull --rebase --autostash origin add-sproing-jumper` before the first edit and before every push. Stage with
   `git add satellites/fathom plans/fathom/HANDOFF-FATHOM.md`, never `git add -A` and never `git add .` (a second builder shares
   this tree). Commit after every green subsystem and push the branch: `git push origin add-sproing-jumper`. **Never push to
   main.** Fable deploys.
3. **Studio laws that bind every line of player copy and every screen.**
   - No dashes and no exclamation points in anything a player reads. Not in the HUD, not in a level name, not in a toast. Write
     around them.
   - Every button a thumb uses is at least 48 px tall and wide as RENDERED at 375x667, proved by `document.elementFromPoint`
     at the button's centre landing on that button. `el.click()` proves nothing.
   - The brand is **Sky Wolf Studio**, singular. The design says Sky Walk Studio; that is a typo, never copy it.
   - Runtime modules are `.js`, never `.mjs` (the host serves `.mjs` as text/plain and the page dies). `.mjs` is fine for Node
     tools under `test/` and `tools/`.
   - Every URL the page loads carries a `?v=<stamp>`; the service worker's `SHELL_VERSION` and the registration's `?v=` move
     together in the same commit.
   - Text is 0.7 rem or larger. Portrait, one hand.
   - **LOOKING IS PART OF THE JOB.** A visual change is not done until you have opened the screenshot with the Read tool and
     named three things wrong in it.
4. **Never wait on a human.** Section 13 governs the night. The open questions in section 9 take the answers written there.

---

## 1. WHAT FATHOM IS, AND WHY IT IS WORTH A NIGHT

From the design: *"You are a small blind creature lost in a flooded cave system. The screen is pitch black. Your only sight is
sound: tap to throw an echo stone that arcs through the dark and pings where it lands, revealing the world in an expanding ring
of light that fades back to black. But everything down here hears too. Pings draw the things in the dark toward the stone, not
you. Your sonar is your decoy."* Positioning line: **"The only light is the sound you throw."** Tone: eerie and beautiful, not
horror, playable by a ten year old.

Why it is worth a night: the hook is one mechanic (a throwable ping that is also a lure) and the design's own market read holds
up (I checked it: ECHO by CosmicBrainz, Darker than Dark and E.C.H.O. all ping from the player; none throw the ping). The whole
game is line strokes on a black canvas with synthesised sound, so there is no art dependency between Opus and a playable build.
The feel moment is step 3 of the build order (tap, ring, the world sketches itself in) and it can be reached in the first two
hours. It is the smallest of the six handoffs and the most testable, which is why it goes first.

---

## 2. STATE OF THE INHERITANCE (verified by Fable 2026-09-05; trust this over any doc)

Copy these, do not reinvent them. Every path below exists on the branch tonight.

| Need | Copy from | What to take |
|---|---|---|
| Single file layer order and the header comment | `satellites/deepwell/index.html` lines 548 to 575 | `CONFIG, RNG, DATA, GEN, SIM, VIEW, INPUT, SAVE, TEST, BOOT`, plus `AUDIO` between VIEW and INPUT for Fathom. The `// ---- SIM_EXPORT_START ----` and `// ---- TEST_EXPORT_START ----` marker comments, so one implementation of the rules serves the page and the headless runner |
| Seeded RNG | `satellites/deepwell/index.html` `seedFromString` (line 687), `mixSeed` (694), `dailySeedFor` (700) and the mulberry style stream they feed | Same names. Endless caves and lurker drift draw from streams salted per system (`mixSeed(seed, 1)` for the cave, `mixSeed(seed, 2)` for lurkers) so adding a lurker never changes the cave |
| Headless runner | `satellites/deepwell/sim.js` | The `extract(src, a, b)` marker reader and the `--test` shape. Fathom's runner is `satellites/fathom/sim.js` with `--test`, `--solve`, `--endless=N` (section 4) |
| Self test harness in the page | `satellites/deepwell/index.html` from line 1548, `var TEST = {...}` | `assert`, `eq`, `near`, `throws`; the suite runs at `?test=1` and is exposed as `window.__TEST__` |
| Service worker | `satellites/deepwell/sw.js` | The whole file with `deepwell` replaced by `fathom`. Its header comment is the host law: only delete `fathom-*` caches, every fetch settles a real Response, navigations refetch with `cache:'no-cache'`, bump `SHELL_VERSION` and the registration `?v=` together |
| Manifest | `satellites/wireworm/manifest.webmanifest` | Same shape, `id` and `scope` `/satellites/fathom/`, portrait, `background_color` `#000000` |
| Portal frame protocol | `satellites/deepwell/index.html` lines 3327 to 3332 and `satellites/wireworm/index.html` line 3023 | `parent.postMessage({ sws: 'ready' }, '*')` at boot AND on `load`; when framed, the back button posts `{ sws: 'close' }` instead of navigating; unframed with a `/portal` referrer, `history.back()` |
| Music hook | `satellites/wireworm/index.html` line 111 | `<script src="/music-unlocks.js" defer></script>` in the head. The chip it mounts (`#sws-music-chip`) seats itself by occupancy, bottom first; its folded pill (`#sws-music-pill`) is hard pinned bottom left. Section 6 keeps the bottom left corner empty for it |
| Silence handshake | `portal/index.html` line 2890 | The portal hands the audio to a game that posts `{ sws: 'game-music', on: true }`. Fathom posts it when PLAY starts, because silence is Fathom's instrument and the portal's music must stop |
| Floating relative joystick | `satellites/abduct-a-chameleon/index.html` lines 66, 1039, 1384 to 1402, 1428 | `JOY_R = 70, JOY_DEAD = 10, JOY_KNOB = 22, JOY_MARGIN = 16`; the stick is born where the finger lands, clamped inside the margin; `f = (min(mag, R) - dead) / (R - dead)`; a stick whose pointer is no longer tracked is dropped (the sticky stick heal at 1086); `blur` clears everything (1264) |
| Gate runner | `satellites/keepsies/tools/check.js` | The `GATES` and `BROWSER_GATES` arrays, `--fast` that SKIPS and says so, one command that prints `ALL GATES PASSED`. Copy it and edit the list |
| A browser gate driven by real input | `satellites/keepsies/test/aimnudge.mjs` lines 1 to 45 | The tiny static server (serves the game folder and the fleet's `/music-unlocks.js` family from the site root), `require('/workspaces/lucid-winds/node_modules/puppeteer')`, the header comment that says what is asserted and how each was watched to fail |
| Headless Chrome flags | `satellites/keepsies/test/render.mjs` | The swiftshader flags. Fathom is Canvas 2D, so only `--no-sandbox --disable-gpu` are needed, but keep the launch shape |
| Icons | `scripts/handoff11_icons.mjs` (READ ONLY, outside the fence) | Copy it to `satellites/fathom/tools/icons.mjs` and keep one motif: a stone dropping into black water with a single cyan ring. Its header carries the maskable law (central 80 percent only; radius over 50 in viewBox units collapses the tile to a circle whose corners go black on iOS) |
| Portal thumb | `scripts/handoff11_thumb.mjs` (READ ONLY) | Copy to `satellites/fathom/tools/thumb.mjs`, output `satellites/fathom/docs/thumb.png`, square, from the RUNNING game mid ping, chrome hidden, under 150 KB. Fable moves it to `portal-assets/thumbs/fathom.png` in the morning |
| Decisions log shape | `satellites/keepsies/docs/DECISIONS.md` | Newest last, one bold line of what, one line of why |
| The earn message | 12 satellites post `{ sws: 'earn', moment, detail }` | Nothing in the portal listens for it tonight (grep of `portal/` and `music-unlocks.js`, 2026-09-05). Post it at level clear and at a new best depth anyway, as fleet convention. Make no claim about currency in copy |

Not inherited, on purpose: no shared shell (Fathom is fullscreen black; the arcade frames it), no Rapier, no three.js, no
`bundle.js`. The design's "PWA manifest + service worker inline generated" is replaced by real files (section 3).

---

## 3. CORRECTIONS TO THE DESIGN (binding; each one forced by a measurement or a fleet law)

3.1 **Studio and deploy.** Sky Wolf Studio. Deploy is Hostinger from `main`, which Fable pushes; there is no Firebase Hosting
and no GitHub Pages step. You never touch main.

3.2 **World units, not screen pixels.** Every number in the design given in px (throw range 40 percent of screen, ring speed
300 px/s, hearing 55 percent of screen, hum 120 px, frenzy 60 px) becomes a world unit (wu) number, with the camera showing a
fixed **360 wu across the short axis** on every phone. 1 wu is 1 CSS px on a 360 wide phone and the long axis shows whatever
fits. Otherwise a 320 phone and a 412 phone play different games and the sim cannot be trusted. The numbers are in section 4.

3.3 **Tap and drag on one surface, resolved by slop, not by time.** The design's "tap anywhere to throw, drag anywhere to move"
collide at the moment the finger lands. Rule: `pointerdown` shows a throw reticle at the clamped target (the down point pulled
inside `THROW_MAX`); if the finger moves past **12 CSS px** the reticle vanishes and a floating joystick is born at the down
point; `pointerup` without passing the slop throws at the down point. Holding still and releasing is a throw, which reads as
"hold to aim". **A second finger while a joystick is live throws immediately on its `pointerdown`** at its own point, with no
slop wait: that is two thumb play, left moves, right throws. Keyboard: WASD or arrows move, click throws, space hums.

3.4 **The hum is a button, not a double tap on a 20 px glow.** The design's double tap on self fails the 48 px law and
collides with two throws in a row. Hum is a **56 px round button bottom right** (thumb side) plus the space key. It keeps the
design's cost: free, weak reveal (`HUM_R`), attracts lurkers to you, and a **2 s cooldown** so it cannot be spammed into a free
sonar.

3.5 **No occlusion in the slice.** The design asks and recommends v1.1. Taken: a ping reveals every segment inside the ring,
through walls. Log it in DECISIONS. Do not build the raycast tonight.

3.6 **Levels are ASCII grids, not segment lists.** Campaign levels are authored as arrays of strings in DATA (one character per
24 wu tile: `#` wall, `.` water, `S` start, `X` exit crystal, `o` stone cache, `p` pearl, `L` lurker spawn). GEN turns any grid
into wall segments by marching the edges between open and wall cells and merging collinear runs, and the endless cave uses the
SAME function after cellular automata. One extractor, two sources, one gate. Level size 30 by 50 tiles (720 by 1200 wu, about
two by three screens), camera follows the player.

3.7 **Stones per level are `[6, 8, 8, 5, 10]`, not `6 to 10` rising.** Level 4 teaches the hum; it cannot do that with ten
stones. Pearls per level `[1, 1, 2, 2, 3]` so the second star exists on every level.

3.8 **Stars are defined.** One star: reached the exit. Two: every pearl on the level. Three: finished holding at least a third
of the stones you started with (`ceil(start / 3)`). Time is not scored; this is a memory game and thinking must be free.

3.9 **Caught restarts the level with its starting stones and pearls reset.** Fade to black over 600 ms, one line, back at the
start inside a second. The player keeps what matters, which is the map in their head.

3.10 **The reveal of a creature is a snapshot.** At the instant the ring crosses a lurker, copy its ribbon points into a ghost
`{pts, litAt}` and draw the ghost fading over 1.2 s. Never draw the live lurker. The design's "you see where they WERE" only
happens if the light does not follow them.

3.11 **No `shadowBlur`.** The design offers "shadowBlur or pre blurred double stroke for perf". Only the second is allowed:
a wide low alpha stroke under a thin bright stroke. `shadowBlur` on six hundred segments is a slideshow on a phone.

3.12 **HUD corners are assigned.** Stone count top left. Pause top right (48 px). Hum bottom right (56 px). **Bottom left is
empty** for the fleet's music pill and chip. The design's "stone count bottom corner" moves for this reason.

3.13 **Fixed step and determinism are law, not taste.** `update(dt = 1/60)` is pure over `(state, input, rng)`. Lurker drift
draws from the seeded stream, never `Math.random()`. TEST proves two runs from the same seed and input log produce the same
state JSON; `sim.js --solve` depends on it.

3.14 **The service worker is a file.** `sw.js` copied from Deepwell, `manifest.webmanifest` a file, icons three PNGs. Inline
generated workers cannot be versioned by the host's rules.

3.15 **Audio nodes are pooled.** One slither voice per lurker created at level load with gain 0, not created per frame.
`AudioContext` is created and resumed on the first `pointerdown`; nothing plays before that (iOS).

3.16 **Reduced motion.** The ring still expands (it is the game). Screen shake, the chromatic double draw and the caught flash
are off under `prefers-reduced-motion`.

3.17 **Copy.** Level names and the one line hints below carry no dashes and no exclamation points. Caught line: "The dark took
you back to the start." Clear line: "You found the way through."

---

## 4. ARCHITECTURE LAW

Files (all inside `satellites/fathom/`):

```
index.html                 the whole game, single file, no build, no framework
sim.js                     headless runner: --test, --solve, --endless=N, --watch=<seed>
sw.js                      copied from deepwell, fathom-* caches only
manifest.webmanifest
icon-192.png  icon-512.png  icon-maskable-512.png     from tools/icons.mjs
tools/check.js             the one command; prints ALL GATES PASSED
tools/icons.mjs  tools/thumb.mjs  tools/shots.mjs
test/boot.mjs  test/play.mjs  test/level1.mjs  test/layout.mjs   browser gates, real input
docs/DECISIONS.md  docs/shots/  docs/BUILD-NOTES.md  docs/ART_ASSETS.md
```

Layer order inside `index.html`: `CONFIG, RNG, DATA, GEN, SIM, VIEW, AUDIO, INPUT, SAVE, TEST, BOOT`. `SIM_EXPORT` markers wrap
CONFIG through SIM; `TEST_EXPORT` wraps TEST. Nothing in CONFIG through SIM may touch `document`, `window`, `performance` or
`Math.random`.

**CONFIG (frozen; a number that must change changes here and nowhere else):**

```
GAME_ID 'fathom'   SAVE_KEY 'lw_fathom_v1'   SAVE_V 1
VIEW_W 360         TILE 24                    GRID_W 30  GRID_H 50
PLAYER_R 7         PLAYER_SPEED 110           PLAYER_GLOW_R 20
THROW_MAX 160      STONE_FLIGHT_MS 350        STONE_BOUNCE true
RING_SPEED 300     RING_MAX_R 340             MAX_RIPPLES 6
WALL_FADE_MS 2500  PICKUP_FADE_MS 2500        CREATURE_FADE_MS 1200
HUM_R 120          HUM_COOLDOWN_MS 2000       HUM_RING_SPEED 300
CACHE_STONES 3     STONES [6,8,8,5,10]        PEARLS [1,1,2,2,3]
LURKER_R 6         LURKER_DRIFT 40            LURKER_INVESTIGATE 165 (1.5 x player)
HEAR_R 420         MILL_MS 3000               FRENZY_R 60   FRENZY_MS 2000   FRENZY_SPEED 132
CATCH_R 13 (PLAYER_R + LURKER_R)              RIBBON_PTS 7   RIBBON_EVERY_MS 40
MAX_SEGMENTS 600   MAX_LURKERS 8              HASH_CELL 64
HUD_DIM_MS 3000    HUD_DIM_ALPHA 0.2          CAUGHT_FADE_MS 600
TAP_SLOP_PX 12     JOY_R 70  JOY_DEAD 10  JOY_KNOB 22  JOY_MARGIN 16
ENDLESS_START_STONES 8   ENDLESS_FILL 0.46   ENDLESS_SMOOTH 5   ENDLESS_UNLOCK_LEVEL 3
```

Everything marked in the design as a feel number (ring speed, fade times, lurker speeds, hearing radius) is a CONFIG key and
`sim.js --over=KEY=VAL` runs any sweep against an override without editing the game (Deepwell's pattern).

**DATA.** Five campaign levels as `{ name, hint, stones, grid: [30 strings of 50 chars], solution: { path: [[tx, ty], ...],
throws: [{ atMs, tx, ty }] } }`. The `solution` is not shown to players; it is the bot's script for `--solve`. Legend in 3.6.

**GEN.** `gridToSegments(grid)` marches the boundary between `.` and `#` cells into axis aligned segments, merges collinear
runs, returns `[{x1,y1,x2,y2,litAt:-1e9}]` and throws if the count exceeds `MAX_SEGMENTS`. `caveGrid(seed, depth)` fills
`ENDLESS_FILL` walls, runs `ENDLESS_SMOOTH` passes of the 4/5 rule, keeps the largest open component, puts `S` at the highest
open cell and `X` at the open cell farthest from it by BFS, then places `max(2, 6 - depth)` caches, 2 pearls and
`min(8, 1 + depth)` lurker spawns on open cells at least 8 tiles from `S`. If the segment count exceeds the cap it smooths once
more (up to three times) and then regenerates with `seed + 1`.

**SIM.** `newRun(level, seed)`, `update(st, input, dt)`, pure. Contains: circle vs segment push out for the player (nearest
point on segment, push along the normal, two passes for corners), stones in flight (arc over `STONE_FLIGHT_MS`, bounce means
the landing point becomes the first wall hit along the throw, found by segment intersection), ripples (`{x, y, r, rPrev, born,
lit: Set}`; each step tests only segments in hash cells within `r`, lights a segment when `rPrev < d <= r` where `d` is the
distance from the ripple centre to the nearest point on the segment; a segment lights once per ripple), pickups and pearls and
the exit (lit the same way; the exit crossing fires the singback event), lurkers with `DRIFT, INVESTIGATE, FRENZY` (3.10, the
design's section 5, `INVESTIGATE` targets the most recent ping inside `HEAR_R`, mills `MILL_MS` at the point, returns to
drift), the hum (a ripple of `HUM_R` centred on the player that also counts as a ping the lurkers hear), catch test, level
clear test, star computation. Events come out as an array on the state (`ping`, `singback`, `pickup`, `pearl`, `caught`,
`clear`, `hum`) so VIEW and AUDIO consume them without the sim knowing they exist.

**VIEW.** One canvas, DPR aware (`min(2.5, devicePixelRatio)`), camera centred on the player with the 360 wu short axis, black
fill, then in order: lit segments (double stroke, alpha `1 - (now - litAt) / WALL_FADE_MS` eased out), pickup and pearl and
exit glints, lurker ghosts, ripple rings (2 px, brightest at the leading edge, drawn twice offset 1 px cyan and white unless
reduced motion), stones in flight, the player glow (radial gradient, `PLAYER_GLOW_R`), the throw reticle, the joystick, the
HUD. Palette from the design: walls `#9FE8FF`, pickups and exit `#FFC97A`, lurkers `#FF5A4D`, player soft teal `#7FD8CC`.
Nothing else is ever painted; if it is not sound, it is not seen.

**AUDIO.** Web Audio, synthesised, nothing fetched. Ping: sine sweep 880 to 440 Hz over 120 ms plus a 80 ms noise burst through
a 1200 Hz lowpass, then three echoes at `k * (nearestWall / RING_SPEED + 0.06)` s with gain `0.5^k`, where `nearestWall` is
the distance from the landing point to the nearest segment (the sim reports it in the `ping` event). Crystal singback: a soft
triad (C4 E4 G4) 900 ms through a `StereoPannerNode` with `pan = clamp(dx / 300, -1, 1)` and gain `0.25 * min(1, 120 / dist)`,
fired on the `singback` event and again every 6 s while the exit has been revealed at least once. Lurker slither: brown noise
(integrated white noise) through a 300 Hz bandpass, one voice per lurker, panned by position, gain `0.35 * clamp(1 - dist /
HEAR_R, 0, 1)^2`, updated every frame, silent past `HEAR_R`. Hum: 110 Hz triangle with a breath of noise, 600 ms, centre.
Ambient: a 55 Hz sine at gain 0.03 and a drip (2400 Hz sine, 80 ms decay, random pan) every 4 to 9 s from the seeded stream.
Master gain 0.8, a mute toggle in the save. Node budget: at most 12 sounding nodes; TEST counts them.

**INPUT.** Pointer events only (`touch-action: none` on the canvas, `user-select: none`, `setPointerCapture` on the joystick
pointer). The rule in 3.3. `blur` clears the stick, the reticle and the key set.

**SAVE.** `lw_fathom_v1`: `{ v, stars: [0,0,0,0,0], bestDepth, sound, motion, seen: { how: false } }`. Read, modify, write; a
`storage` event reloads; stars only ever go up; two tabs cannot lower anything.

**TEST.** The Deepwell harness. The assertion floor starts at 60 and `sim.js` exits 3 if the count ever drops below it. What it
must assert is in section 5 under each phase.

**BOOT.** Registers `./sw.js?v=<stamp>` after `load`, posts `ready`, reads the save, shows the title.

---

## 5. THE PHASES, WITH GATES

Every gate is watched to fail once before it counts: change the number or the code it guards, see red, put it back, see green,
paste both lines into the ledger. A gate that drives the game through an internal feed instead of the thumb's path is
decoration.

### P0. The gate that fails (scaffold; about 1 hour)

1. `index.html` with the layer skeleton, CONFIG, RNG copied from Deepwell, GEN with `gridToSegments`, SIM with `newRun` and the
   player push out, VIEW painting black plus the glow, BOOT posting `ready`. `sw.js`, manifest, icons from `tools/icons.mjs`.
2. `sim.js --test` running the first assertions: rng same seed same stream; different seed different; `seedFromString`
   separates; `gridToSegments` on a 3x3 box gives exactly 4 segments after merge and on a 5x5 ring gives 8; push out moves a
   circle centred 3 wu inside a wall to 7 wu outside along the normal; a ripple lights a segment at distance 100 on the step
   where `r` first exceeds 100 and not on the step before (the design's whole feel lives in this test); a segment never lights
   twice in one ripple; two `update` runs from the same seed and input log give identical JSON.
3. `tools/check.js` with `test` (node) and `boot` (browser: page loads over the static server, `ready` was posted, the canvas
   pixel at the player's screen position is not pure black, `document.title` is FATHOM).
4. Watch `test` fail: set `RING_SPEED` to 0 and the ripple assertion goes red. Watch `boot` fail: comment out the glow draw.

Ends with: `docs/shots/p0-glow.png` at 375x667, a black screen with one soft teal dot. Open it. It should look like nothing,
and that is right.

### P1. The loop, playable on one screen (about 2.5 hours)

1. The joystick (abduct pattern) and the tap versus drag rule (3.3), with the reticle. Keyboard.
2. One authored room (level 1) from DATA, segments lit and fading, the double stroke, the ring drawn twice.
3. **Stop here and feel test.** Tap, ring, the world sketches itself in. Shoot `docs/shots/p1-ping.png` mid ring at 375x667.
   Open it. If the ring reads as a circle on a black page rather than as light finding a cave, fix the stroke widths and the
   ease before anything else gets built. The design says this moment must be magic before anything else; it is right.
4. Stone arc (350 ms, bright pixel and a faint trail), the throw clamp, bounce to the first wall hit, the stone count, caches
   that glint only inside an active ring, pickups.
5. The exit crystal, the singback event, level clear, stars (3.8), the level loader, levels 1 to 5 authored in ASCII with their
   `solution` scripts, the one line hint shown for 2.5 s at level start.
6. `sim.js --solve`: for each campaign level the bot walks `solution.path` at `PLAYER_SPEED` and throws at `solution.throws`;
   asserts it reaches the exit, never goes below zero stones, and (from P2) is never caught. Watch it fail by moving level 3's
   exit one tile into a wall.
7. `test/play.mjs` (browser, real pointers at 375x667): a real drag of 80 px to the right moves the player right (world x grows);
   a real tap on the canvas spends one stone and within 400 ms at least one segment has `litAt > 0`; a second `pointerdown`
   while a drag is live throws without waiting; the stone count in the HUD reads what the sim says.

Ends with: `p1-ping.png`, `p1-cache.png` (a cache glinting inside a ring), `p1-clear.png` (the clear card, level 1, stars).

### P2. Everything that hunts and everything that speaks (about 2.5 hours)

1. Lurkers: the ribbon, the three states, hearing, milling, frenzy, the ghost snapshot (3.10), catch and the caught restart
   (3.9). Level 3 introduces one, level 5 has three.
2. The hum button and its cooldown, the frenzy trigger from humming or moving fast within `FRENZY_R`.
3. AUDIO, all of section 4's voices, behind the first pointerdown. `{ sws: 'game-music', on: true }` posted when PLAY starts.
4. Title, level select (five cards with stars), how to play (three lines), pause, sound and motion toggles, the save.
5. `sim.js --test` grows: a lurker outside `HEAR_R` ignores a ping; inside it reaches within 10 wu of the ping point and mills
   `MILL_MS`; a ping 200 wu away from a lurker sitting 30 wu from the player pulls it AWAY from the player (this is the hook,
   assert it as a distance that grows); frenzy ends after `FRENZY_MS`; contact at `CATCH_R` emits `caught` once; the caught
   restart returns the level's starting stones; a two second hum cooldown refuses the second hum. The node budget assertion.
6. `--solve` now includes lurkers and asserts no catch on any campaign level's script.
7. `test/level1.mjs` (browser): from the title, real taps reach PLAY, level 1, and a scripted thumb path (drags and taps from the
   solution converted to screen points) reaches the clear card; the save then holds `stars[0] >= 1`. Real pointers only.
8. `test/layout.mjs`: at 375x667 every button on every screen (PLAY, each level card, HOW, pause, resume, restart, menu, next,
   sound, motion, hum) is at least 48 px rendered and `elementFromPoint` at its centre is that element; the bottom left 120x120
   CSS px of the play screen contains no Fathom element (the music pill's seat).

Ends with: `p2-lurker.png` (a ribbon ghost mid fade), `p2-caught.png` (the black fade with its one line), `p2-title.png`,
`p2-select.png`. Name three faults in each.

### P3. The Deep, and the polish (about 2 hours; where a night may stop)

1. Endless mode from `caveGrid`, unlocked after level 3 is cleared, depth counter, best depth in the save, lurkers and caches
   scaling with depth, the `earn` message at a new best.
2. `sim.js --endless=200`: 200 caves over depths 1 to 10; every one has `S` and `X` connected by flood fill, at most 600
   segments, at least one cache reachable, no lurker spawn within 8 tiles of `S`. Watch it fail with `ENDLESS_FILL` at 0.7.
3. HUD dim after 3 s untouched, reduced motion, the secondary echo from big walls (design 5, stretch; only if 1 and 2 are green
   before 03:00).
4. `tools/shots.mjs`: the play screen mid ring and the title at 412x915, 375x667 and 320x568 into `docs/shots/`. Open all six.
5. `tools/thumb.mjs` to `docs/thumb.png` under 150 KB, `ART_ASSETS.md` (section 7 of this plan lists what Stephen will make),
   `BUILD-NOTES.md`, the morning report.

---

## 6. THE SCREENS (portrait, one hand, 48 px rendered at 375 wide)

- **Title.** Black. The word FATHOM in cyan line letters (drawn, not a font image), the positioning line under it in 0.8 rem,
  PLAY (56 px tall, full width minus margins), THE DEEP (locked until level 3, says "Clear the third cave to open the deep"),
  HOW, and two small toggles Sound and Motion. Bottom left empty.
- **Level select.** Five cards, each 64 px tall, name and stars, tap to play; the fifth card locked until the fourth is cleared.
  BACK 48 px at the bottom right.
- **How to play.** Three lines, no more: "Tap to throw a stone. The sound shows you the cave." "Drag to move. The light fades,
  so remember it." "Things down here hear too. They go to the stone, not to you." GOT IT.
- **Play.** The canvas full bleed under the safe areas. Stone count top left (glyphs, 0.8 rem). Pause top right (48 px, a
  glyph). Hum bottom right (56 px round, a faint ring glyph, greys out on cooldown). The hint line for 2.5 s at level start.
  HUD alpha to 0.2 after 3 s without a HUD touch.
- **Caught.** Not a screen: 600 ms to black, one line, the level restarts under it.
- **Clear.** Level name, three stars filled or hollow, "stones left N of M", "pearls N of M", NEXT and MENU (both 48 px).
- **Pause.** RESUME, RESTART, MENU, Sound, Motion. RESUME is first and largest.
- **The Deep.** Same play screen with a depth counter where the level hint was; clear card becomes "Deeper" with the depth.

Every framed page posts `ready`. There is one page, so once.

---

## 7. ART (what Stephen can make this month, and what the game does without it)

Fathom ships with zero image files and looks finished, because sonar line art on black is the design. The pack below is an
upgrade for the title and the store, three sheets only, written as paste ready Midjourney prompts in
`plans/fathom/ART-PACK-FATHOM.md` (a copy goes to the 012Assets Drive folder as a Google Doc titled `Fathom — Art Pack` by
Fable). The game must never wait on it.

| File Stephen delivers | Used for | Size delivered | In game size |
|---|---|---|---|
| `title-bg.png` | title backdrop behind the drawn word, at 35 percent opacity | 9:16 | `art/title-bg.jpg` 900x1600, q80, under 300 KB (the host resizes anything over 1600 px) |
| `key-art.png` | portal thumb and store tile | 1:1 | `docs/thumb.png` 512x512 png under 150 KB; also the source for a painted icon if it reads at 48 px |
| `icon-mark.png` | PWA icon and favicon, if better than the drawn one | 1:1 | 512, 192 and a maskable 512 with the mark inside the central 80 percent |

`docs/ART_ASSETS.md` in the game folder lists these three with the exact paths the code reads, so a drop can be wired in ten
minutes. The code reads `art/title-bg.jpg` if it exists (an `Image` with `onerror` leaving the drawn title alone) and nothing
else.

---

## 8. LISTING ON THE ARCADE (Fable does the portal edit; the night makes every line true first)

Card Fable will add to `portal/index.html` after review, in the fresh block near Ripcord and Tangent:

```
{nm:"Fathom", ds:"The only light is the sound you throw. Toss an echo stone, watch the cave sketch itself in, and move while the dark is busy with the noise.", cat:"action", url:"/satellites/fathom/?v=<stamp>", ic:"🪨", thumb:"/portal-assets/thumbs/fathom.png", beta:true, fresh:true}
```

Must be true first: `docs/thumb.png` exists under 150 KB; the live URL answers with the stamp in its HTML; `tools/check.js`
prints ALL GATES PASSED; the level 1 gate passed with real pointers; the six shots exist and were opened; the description
above has no dashes (it does not).

---

## 9. PITFALLS (studio scars that apply here, learn them free)

- A probe that cannot fail is not evidence; a frozen value satisfies `>=`; a step that never ran looks exactly like the bug.
  Mutation test your own gates.
- Never prove a control with `el.click()`; `elementFromPoint` at its centre. Everything a thumb does in a gate is a real
  pointer event on the element a thumb would land on.
- `canvas.width =` clears the canvas; guard resize and repaint. Measure `visualViewport`, never `innerHeight`.
- Two tabs clobber a save read once and written wholesale. Read, modify, write; max the bests; listen for `storage`.
- A tick that eats the world: every per frame loop that mutates a collection is bounded and asserted (ripples at 6, ghosts
  pruned past their fade, the ribbon ring buffer at 7).
- A long press for a hold fires `pointercancel` on some phones unless `user-select: none` is on the canvas and the pointer is
  captured.
- Under headless Chrome on two cores the rig runs a few frames a second, so a touch tap's down and up land a frame apart and
  read as a hold. In gates, dispatch `pointerdown` and `pointerup` synchronously for a tap, and `waitForFunction` on drawn
  state rather than sleeping.
- A green gate under CPU contention on two cores is a coin. Alone, twice.
- ES module imports are separate URLs; a `?v=` on the entry does not propagate. Fathom has one file, so this bites only
  `sw.js`: bump `SHELL_VERSION` and the registration together.
- A shared born hidden CSS class blinds every consumer; `hidden` on one element only.
- Wiring art is not seeing art. Shoot it, open it, name three faults. A black game is the easiest place to ship a blank screen
  and call it atmosphere: the boot gate reads a pixel for exactly this reason.
- Never gate on an unshown stat. The stone count is on screen; the cooldown is on the button.
- `Math.random()` anywhere in SIM breaks `--solve` silently. TEST greps the SIM export for it and fails if found.
- The design says "eel like ribbon of dim red orange dots". Draw dots, not a polyline; a polyline reads as a wall.
- Disk: the box had 735 MB free on the evening of Sep 05. Scratch under `/tmp`, delete raw shots that are not evidence after
  reading them, commit nothing over a few hundred KB.

---

## 10. DECISION RIGHTS AND OPEN QUESTIONS

The smallest reasonable choice is yours, logged in `docs/DECISIONS.md` with one line of why. The design's three open questions
take these answers tonight:

1. **Name: FATHOM.** Stephen's folder and title. Not yours to change; the alternates (Sounder, Pitch, Darkwater) are his call
   and stay in the morning report as a question.
2. **Occlusion: v1.1.** Section 3.5.
3. **Endless in the slice: yes, as P3,** because the extractor is shared and the connectivity gate is cheap. If the night stops
   before P3, the campaign ships alone and THE DEEP says "Soon".

Yours without asking: exact stroke widths, the ease curves, the ribbon look, the drip timing, the level shapes (inside the
teaching order), the title lettering, the star glyphs.

Stephen's, never guessed: price, store, any name change, any copy that mentions the studio, anything with money.

---

## 11. STEPHEN ONLY

Nothing before listing. The art in section 7 whenever his Midjourney month allows; the phone test on the Pixel 9 after Fable
lists it (drag, tap, two thumbs, the hum, one caught, one clear, THE DEEP).

---

## 12. HONEST SIZING

One Opus on two cores. P0 about 1 h, P1 about 2.5 h, P2 about 2.5 h, P3 about 2 h: roughly 8 hours to the end of P3, which is
a full night with nothing else. Deepwell came out at 3464 lines with 229 assertions inside a 4 hour block in August; Fathom has
more systems (audio, lurkers, two level sources) and the browser gates, so expect 3500 to 4500 lines. **Where a single night
stops:** P2 step 4 is the first place a stop leaves something playable and honest (a campaign with lurkers and sound, no
endless). A stop inside P1 leaves a tech demo; if the clock says P2 cannot finish, finish P1 step 5 and the `--solve` gate
instead of starting lurkers.

Fathom is first in the order table because it is the smallest of the six and its feel gate is reachable in two hours; if this
one is not playable by morning, the order for the others was wrong.

---

## 13. EVIDENCE LEDGER (fill in place, with commands and their real output, most recent last)

### P0 step 1, the gate that fails (2026-09-05)

```
$ node satellites/fathom/tools/check.js
test            FAIL  0s

================================================================

--- test (wanted: FATHOM TEST OK) ---

Error: Cannot find module '/workspaces/lucid-winds/satellites/fathom/sim.js'
    at Module._resolveFilename (node:internal/modules/cjs/loader:1456:15)

(tail)
  code: 'MODULE_NOT_FOUND',
  requireStack: []
}

1 GATE FAILED
```

### P0 steps 2 to 4, the rules and the four node gates (2026-09-05)

```
$ node satellites/fathom/tools/check.js
levels          pass  0s
test            pass  0s
solve           pass  0s
deep            pass  0s

ALL GATES PASSED

$ node sim.js --solve
  cave 1  FIRST WATER           11.4s   51 tiles  4 thrown  2 left  0/1 pearls  2 stars  5/5 seeds
  cave 2  THE LARDER            12.1s   54 tiles  4 thrown  4 left  0/1 pearls  2 stars  5/5 seeds
  cave 3  SOMETHING LISTENS     13.5s   60 tiles  6 thrown  5 left  0/2 pearls  2 stars  5/5 seeds
  cave 4  HOLDING BREATH        12.1s   54 tiles  3 thrown  2 left  0/2 pearls  2 stars  5/5 seeds
  cave 5  THE LONG GALLERY      13.8s   61 tiles  6 thrown  4 left  0/3 pearls  2 stars  5/5 seeds
FATHOM SOLVE OK

$ node sim.js --endless=200
200 deep caves: worst segment count 312 of 600, smallest cave 237 open tiles,
most open 55 percent of the grid, shortest route 31 tiles
FATHOM DEEP OK
```

**Each gate watched to fail, and what it printed.**

```
$ node sim.js --test --over=CATCH_R=0
FAIL  touching one ends the run   [expected caught, got null]
FAIL  and it says caught exactly once   [expected 1, got 0]
FAIL  a run that is over stays over   [expected 1, got 0]
PASSED 157 / FAILED 3   (total 160)

$ node sim.js --test --over=HEAR_R=1
FAIL  a lurker that hears a stone goes to investigate   [expected invest, got drift]
FAIL  a hum is heard, and what they come to is you   [expected invest, got drift]
FAIL  they walk at the player, not at a stone   [expected about 372, got 0]
PASSED 157 / FAILED 3   (total 160)

$ (cave three's X moved one tile into rock)
$ node sim.js --test
FAIL  cave 3 has a start and an exit
FAIL  the determinism suite ran to the end   [cave 3 has no exit]
FAIL  the hum suite ran to the end   [cave 3 has no exit]
PASSED 145 / FAILED 3   (total 148)
$ node sim.js --solve
FAIL  cave 3 SOMETHING LISTENS: 0 of 5 seeds got through. seed 5005: cave 3 has no exit
1 CAVE(S) FAILED

$ node sim.js --endless=30 --over=ENDLESS_FILL=0.46,ENDLESS_SMOOTH=5
FAIL  deep seed 10668 depth 9: 77 percent open, that is a room not a cave
FAIL  deep seed 10799 depth 10: 77 percent open, that is a room not a cave
30 deep caves: ... most open 83 percent of the grid, shortest route none
30 DEEP CAVE(S) FAILED
```

**What the gates caught that a green run would have hidden.**

1. `--over=RING_SPEED=0` did not print a red line, it threw a TypeError from inside the harness and
   the reader got a Node module loader stack. Three fixes: `newRun` throws a NAMED error for a cave
   with no start or no exit, every suite runs inside `runSuite` so a suite that dies is one failed
   assertion, and `runSolve` catches the throw per seed.
2. The purity gate went red on its own comment. `suitePurity` greps for `Math.random` inside SIM and
   the sentence at the top of SIM says "no Math.random", so it would ALSO have gone green on a
   comment claiming the opposite. It now strips comments first and asserts that the stripper works.
3. The deep caves were not caves. Every existing check was green on a 28 by 48 open box: connected,
   inside the segment budget, caches reachable. See `docs/DECISIONS.md`.
4. `put()` in `tools/levels.mjs` silently overwrote a cache when a lurker was moved onto it, and cave
   three quietly lost a cache. It now throws on a marker dropped on a marker.
5. The bot was eaten in three of five caves because the lurkers spawned on the only route and the
   authored throws were aimed down the corridor the bot was about to walk. Both were the design
   being wrong rather than the code, and both are written up in `docs/DECISIONS.md`.

---

### The whole suite, green (2026-09-05, end of the run)

```
$ node satellites/fathom/tools/check.js
lint            pass  0s
levels          pass  0s
test            pass  0s
solve           pass  0s
deep            pass  1s
boot            pass  2s
play            pass  3s
layout          pass  4s
level1          pass  12s
campaign        pass  46s

ALL GATES PASSED

$ node sim.js --test
PASSED 170 / FAILED 0   (total 170)

$ node test/campaign.mjs
  ok    cave 1 cleared by the thumb (678 steers, 5 stones, node 50 of 51)
  ok    cave 2 cleared by the thumb (713 steers, 6 stones, node 53 of 54)
  ok    cave three has exactly one thing in the dark
  ok    there is a way to the room it lives in, 32 tiles
  ok    the thumb walked to its room (423 steers)
  ok    the stone is thrown onto the cave, not onto a button (board)
  ok    the ring crossed it and left a ghost of where it was, shot
  ok    walking straight at it gets you caught (4 steers after reaching its room)
  ok    the screen goes black and the line arrives after it
  ok    and the cave restarts with the stones you came in with (8, now 8)
  ok    and puts you back where you started, 0.0 units off
  ok    cave three is finished after the fright (797 steers, node 59 of 60)
  ok    three caves are in the save: [1,1,2,0,0]
  ok    and clearing the third cave opens the deep
  ok    THE DEEP opens into a cave
  ok    the depth is on the screen: "DEPTH 1"
  ok    the generated cave has a real way through, 64 tiles
  ok    and a real throw lights it: 0 walls to 3
CAMPAIGN OK
```

### The rest of the gates, watched to fail

```
$ node test/boot.mjs                    (with the player glow drawn at alpha 0)
  FAIL  the canvas is lit where the player stands: rgb(0,0,0) at 188,163

$ node tools/lint.mjs                   (with a dash put into the tagline)
  FAIL  no dash in anything a player reads: ["The only light - the sound you throw"]

$ node test/layout.mjs                  (with .btn.small at 40 px)
  24 FAILURES, e.g. FAIL  375x667  HOW TO PLAY  330x46

$ node test/layout.mjs                  (with the stone count parked bottom left)
  FAIL  375x667  the bottom left 120 by 120 is free for the music pill: stones at 8,629

$ node test/play.mjs                    (with TAP_SLOP_PX at 500)
  FAIL  a real 80 px drag to the right moved the player right, world x 348.0 to 348.0
  FAIL  letting the stick go throws nothing either (1 throws, still 2)

$ node test/play.mjs                    (with HUM_COOLDOWN_MS at 0)
  FAIL  a second hum inside the cooldown is refused (1 hums, still 2)

$ node test/play.mjs                    (with four extra oscillators per ping)
  FAIL  six throws and six hums never put more than twelve voices in the air (peak 26)
```

### Three flakes, each chased to its cause rather than rerun

```
1. boot failed once in the suite reporting the player at screen x 550 on a 375 wide phone.
   CAUSE: the camera is only placed inside draw(), so anything asking where a world point is
   between beginRun and the first draw got the camera at the origin. FIX: clampCam in beginRun.
2. boot then read a BLACK pixel at the right place, one run in six.
   CAUSE: `waitForFunction(() => frames() > 12)`. The frame counter runs on the title screen, so
   by the time a gate reached the play screen it was already past twelve and the wait returned
   before a single frame of the CAVE had been drawn. FIX: waitFrames(page, n) waits for n MORE,
   and every gate and tool uses it. Six clean runs after.
3. the caught screenshot showed a lit cave although the gate asserted the veil was opaque.
   CAUSE: not the game. My own shell loop waited on a log file that still held the PREVIOUS run's
   summary line, so the copy grabbed the old PNG while the gate was still running. The file on
   disk was correct all along, mean brightness 1.88 of 765.
```

---

## 14. THE OVERNIGHT PROTOCOL (how an unattended run behaves)

1. **Never wait on a human.** Every question that would have gone to Stephen becomes the smallest reasonable choice, logged in
   `docs/DECISIONS.md` as one line of what and one line of why. The open questions in section 10 take the answers written there.
2. **Phases run back to back.** P0, P1, P2, P3. A phase ends only with its ledger box full. There is no pause between phases
   and no pause for feel beyond the one the plan orders (P1 step 3).
3. **A red gate after three honest attempts is BLOCKED, not fixed by force.** Write `BLOCKED: <gate>` in SESSION STATE with
   the last thirty lines of its output and the three things tried, then move to the next subsystem that does not depend on it.
   Never weaken a threshold, shrink a sample, delete an assertion or comment out a check to get green. A gate that was made to
   pass is worse than a red one, because the morning reader trusts it.
4. **Two cores.** Gates one at a time. The browser gates (`boot`, `play`, `level1`, `layout`) are the ones that flake under
   contention: a failure in the suite is rerun alone, twice; two passes alone is a pass and is written that way. No helper
   agents for judgement calls, never in parallel with a gate.
5. **Commit and push after every green subsystem.** Small commits, each with gates green, each pushed to the branch. A night's
   work that sits uncommitted in a dead session did not happen.
6. **Context is a resource.** When the session is running long: finish the subsystem in hand, gates, commit, push, SESSION
   STATE with the exact next action (file, function, step number), the morning report, stop. The next session opens with the
   same prompt and resumes from SESSION STATE. Never start a subsystem you cannot finish and commit inside the context you have
   left.
7. **Screenshots still happen at night.** Shoot from where the player stands, open with the Read tool, name three faults, write
   them down. The faults are the morning reader's first list.
8. **The design is not edited.** A number that has to change changes in CONFIG; a rule that has to change is a DECISIONS line
   and a note in the morning report, and the design line stands until Stephen edits it.
9. **Nothing leaves the fence.** Section 0.
10. **Disk.** Section 9, last bullet.

---

## 15. THE MORNING REPORT (write it before you stop, most recent on top, keep every one)

### Morning report, 2026-09-05, end of the first night

**Phases:** P0 done (`e5a5d7fe`, `03c376d7`), P1 done (`57d81259`), P2 done (`7b81bd36`), P3 done (`33a72ccb` and the
commit this report is in). Fathom is **DONE P3**.

**Gates:** `ALL GATES PASSED`, ten of them, none skipped. `lint levels test solve deep boot play layout level1
campaign`. 170 assertions in `sim.js --test`. Every gate was watched to fail and both columns are in section 13. Three
flakes were chased to their causes rather than rerun; all three were real and all three are fixed.

**Play it:** `satellites/fathom/index.html`. Title, PLAY, then the first cave card. Drag anywhere to move, tap anywhere
to throw, HUM bottom right. Cave two unlocks when cave one is cleared and so on; THE DEEP opens after cave three. A
whole cave takes about a minute. `?test=1` runs the assertion harness into a panel on the page.

**Look at:** these five first.
1. `docs/shots/p1-ping-mid.png` — the moment the game is about. The corridor mouth is white hot where the wave just
   touched it, the top wall has settled to cyan, and the ring is a whisper where it has passed. **Wrong with it:** the
   room's floor is not drawn yet because the ring has not reached it, which reads as a missing wall; the lit wall ends
   are hard butt caps that look chopped; the hint still wraps to two lines with an orphan.
2. `docs/shots/p2-lurker.png` — the ghost, a red ribbon of separate beads on an undulating body beside the player, with
   a cache glinting. **Wrong with it:** the head bead is a step larger than the second rather than a taper; the
   undulation is invisible at the head; the cache's three halos overlap into a cloverleaf.
3. `docs/shots/p2-caught.png` — total black, one line. **Wrong with it:** nothing at all is left on screen, so it reads
   as the app going blank rather than as still being down there; the line keeps a full stop the tagline does not; it is
   the only screen in the game with no cyan on it.
4. `docs/shots/p3-deep.png` and `docs/shots/p1-cache.png` — a generated cave. **Wrong with them:** the walls read as a
   chunky maze, almost a platformer level, because a screen is only fifteen tiles wide and every corner is a 24 unit
   right angle; the lit region is all one brightness once the ring has passed, so the sweep only reads in the moment;
   the revealed shape is off to one side leaving a third of the screen dead.
5. `docs/thumb.png` — the arcade tile, shot in a generated cave. **Wrong with it:** the left third is empty so it will
   sit off centre on the shelf; only one ring is really visible so the sonar reading rests on one circle; the blocky
   corners again.

**Decided without you** (all of `docs/DECISIONS.md`, these three matter most):
- *"the light works on per tile faces, collision works on merged runs."* Lighting merged runs switched a twelve tile
  wall on in one frame and the screen read as a technical drawing rather than as light arriving.
- *"`ENDLESS_FILL` 0.56 and `ENDLESS_SMOOTH` 4, not 0.46 and 5."* At the plan's numbers every deep cave came out as one
  open box, 78 percent water with rock only at the border, and every existing check was green on it.
- *"the lurker spawns in caves three, four and five moved off the shortest route."* The first draft put them on it and
  the bot was eaten within three seconds of every start. A lurker standing in the only corridor is a coin toss, not a
  lure.

**Blocked:** none.

**For Fable:** nothing outside the fence was touched. To list it: `docs/thumb.png` goes to
`portal-assets/thumbs/fathom.png`, and the card is written out in section 8 of this plan. Every line of it is true now
(the thumb is 56 KB, the live URL will carry `20260905a`, the description has no dashes). Two files were created by
mistake outside the fence during the run, `test/harness.mjs` and `tools/thumb.mjs` at the repo root, and both were
removed the moment they were noticed; `git status` is clean of them.

**For Stephen:**
- **The name.** FATHOM is what the folder and the title say, and section 10 makes it yours. Sounder, Pitch and
  Darkwater are still on the table and nothing in the build depends on the word.
- **The world scale, which is the one thing I would change and did not.** A screen shows fifteen tiles across, so every
  cave corner is a big right angle and a generated cave reads as a maze rather than as rock. Halving the tile (12 units
  instead of 24, a 60 by 100 grid) would make the caves look like caves, and it would double the face count and change
  every hand made level. That is a design call and it is yours.
- **Occlusion.** Not built, per the design's own recommendation. It is the single biggest change available: with it,
  the ring stops reading as a circle laid over the screen in a big empty room, which is the one honest complaint left
  in every play shot.
- **The phone checklist** for the Pixel 9 once Fable lists it: drag to move, tap to throw, both thumbs at once (left
  moves, right throws), the hum on cooldown, one deliberate catch, one clear, and THE DEEP.

**Next action:** nothing in Fathom is half finished. The next session takes the next row of section 5 of the spine.


```
### Morning report, <date and time>
Phases: P0 <done|partial|not started> (<commit>), P1 ..., P2 ..., P3 ...
Gates: <the last full tools/check.js summary line, and which gates were skipped in fast mode if any>
Play it: <what is playable right now and how to reach it: the screen path from boot to a cleared level>
Look at: <five docs/shots/ files worth opening first, one line each on what is wrong in them>
Decided without you: <the three most consequential DECISIONS.md lines, verbatim>
Blocked: <each BLOCKED gate with one line of why, or "none">
For Fable: <anything outside the fence, or "nothing">
For Stephen: <which open questions the night's choices leaned on, and the phone checklist to run>
Next action: <file, function, step, the first thing the next session does>
```
