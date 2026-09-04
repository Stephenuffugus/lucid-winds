# Keepsies decisions log

Every choice the build made that the design did not make for it, newest last, one line of what and one line of why (HANDOFF-KEEPSIES 15.1). Numbers that changed live in `src/data/tuning.json`; the design is never edited.

## K0

**2026-09-04 — `package.json` with `"type": "module"` and no dependencies.**
Why: `src/core/` has to be ES modules for the browser and run unchanged in Node, and Node reads `.js` as CommonJS without this. Zero dependencies, so nothing is installed into the repo. `satellites/aura-off/package.json` is the fleet precedent.

**2026-09-04 — Rapier is imported by relative path (`../../lib/rapier.mjs`), not through the import map.**
Why: the plan maps both `three` and `rapier` in the import map, but a bare `rapier` specifier does not resolve in Node, and `core/` must run headless unchanged. `three` stays in the import map because only `render/` imports it and `render/` never runs in Node.

**2026-09-04 — lib files carry no `?v=` query; the `stamp` gate asserts they do not.**
Why: the plan freezes `lib/` by bytes and bumps the folder name if a version ever changes (4.4), which is incompatible with stamping a query onto them. Only imports of files inside `src/` are stamped.

**2026-09-04 — `dmath.js` also uses `Math.floor`, `Math.abs`, `Math.min` and `Math.max`.**
Why: the determinism law names `+ - * /` and `Math.sqrt` because those are the exactly specified operations. `floor`, `abs`, `min` and `max` are exactly specified in ECMAScript too; the implementation freedom is in the transcendentals. The `coremath` gate greps `core/` for the transcendental set only.

**2026-09-04 — rolling resistance is applied only while a marble is in contact with a surface.**
Why: Fable's sweep applied it to every body because every body in that scene sat on the floor. A marble in the air is not rolling, and bombing (a drop shot) is in the design, so the force is gated on a live contact with a static collider.

**2026-09-04 — contact normals for marble on marble come from the centre line, not the solver manifold.**
Why: for two spheres the centre line IS the contact normal, exactly, and it can be computed from the positions before the step, which is what a closing speed wants. Marble on surface takes the surface's stored normal. Trimesh arenas in K3 will need the manifold and that is where it gets added.

**2026-09-04 — `ringer_break` asserts on the DISTRIBUTION, not the mean.**
Why: the plan's redefinition says mibs out in [1,3] on at least 80 percent of shots over seeds 1 to 200. A mean of 1.33 can be made of a pile of zeros and a pile of fours, so the gate counts shots inside the band and asserts the fraction, and separately asserts every body is asleep by 8 s on 100 percent.

**2026-09-04 — surfaces get a second coefficient, `spinningMu`, and the step applies a braking TORQUE about the contact normal.**
Why: Rapier has no spinning friction either. With rolling resistance alone the break came to a stop, then never slept: at eight seconds the maximum linear speed in the scene was 0.0000 m/s and the maximum angular speed was 34 rad/s, because marbles that picked up yaw in a collision spin on the spot for ever and angular damping is exponential. Only the component along the contact normal is braked; the rolling components are already coupled to travel through contact friction and braking them would fight the floor. The break distribution did not move.

**2026-09-04 — the hash quantiser is total, not `Math.round(n * 1e6) | 0`.**
Why: it went blind. A taw shot off the dirt at 6 m/s falls for ever, reaches an enormous y, and ToInt32 of a float that large has no low bits left, so every runaway marble hashed the same and real divergence stopped registering. Sixteen of twenty seeds failed to notice injected noise for that reason. The quantiser now takes an exact modulo for anything inside a thousand kilometres and returns a deterministic marker beyond it. The replay scenario was also given the real Ringer rule (a taw outside the ring returns to the edge for its next shot), which is what a six shot fixture should have been doing anyway.

**2026-09-04 — the replay self test injects 1e-7 m of drift per step, not 1e-9.**
Why: measured. The fingerprint's sensitivity floor is between 1e-8 and 1e-7 of relative velocity drift per step. At 1e-9 m per step the self test caught 20 of 20 seeds on one run and 18 of 20 on the next, because it was sitting on the floor. A gate that reports a failure on passing code is worse than no gate. At 1e-7 m per step the end state moves four hundred times the quantiser and three consecutive runs caught 20 of 20.

## Measurements worth a Director's eye

**The break takes about 6.9 seconds to fully stop.** At the plan's numbers (rollingMu 0.02, break at 4.0 m/s) 200 seeds settle at a mean of 6.85 s, and the design's resolve cap is 6 s, so nearly every break will hit the cap rather than come to rest on its own. At rollingMu 0.04 the same shot settles in 3.87 s and the taw stays inside every time, but nothing at all leaves the ring at 4 m/s. This is a feel question, not a gate question: both gates are green as the plan specifies them. Raised in the morning report, not decided here.

## K1

**2026-09-04 — a slip is declared by the game, never pressed by the player.**
The design leaves "fumble" undefined and the plan offers two honest triggers. The one chosen: the pointer left the canvas during the 90 ms sample window, which is a thumb sliding off the edge of the screen and is the digital cousin of a knuckle slipping in the dirt. The input layer flags the AimSource `slipped`, the referee hands the turn straight back and spends the slip, and no shot is fired. Why this one: it is pre commitment rather than a mid action button, it sits nowhere near the legal soft nudge band of 0.35 to 0.6 m per second (a slip is about WHERE the pointer went, not how fast), and it can never be used to take back a shot that simply went badly. Once per player per game, and only when the house rule is on.

**2026-09-04 — `ringer_rules` tests the referee against a seeded outcome generator, not against five hundred real physics games.**
Five hundred true games would take about ninety minutes on this box and would take the same transitions. The physics has its own gate. Written up in the test's own header so nobody mistakes it for a shortcut.

**2026-09-04 — the referee's win condition is seven or more, not exactly seven.**
The test asserted "exactly seven" and failed a fifth of the games. The test was wrong: a shot that pockets three takes a player from six to nine and they won at seven. The only way to win with fewer is the poison ending where the ring empties with an opponent out.

**2026-09-04 — ⛔⛔ THE BIGGEST FINDING OF THE NIGHT: Rapier hard clamps angular velocity to pi/4 radians per step, and the floor contact is now ours.**
Measured, in a vacuum, with nothing touching and no gravity: set a body spinning at 1000 rad/s, step once, read back 94.25 at 1/120, 47.12 at 1/60, 188.50 at 1/240. In every case the product with the timestep is 0.7854 exactly. There is no integration parameter for it; `lengthUnit` does not touch it, because it is an angle.

What that means for a marble game: a 22 mm taw rolling without slipping at 2.6 m/s needs 236 rad/s and a 16 mm mib needs 325. Above about one metre per second NO MARBLE IN THIS ENGINE CAN SPIN FAST ENOUGH TO ROLL. It slides instead, and every bit of backspin, topspin and side english a player puts on a shot is silently discarded at the ceiling. That is why a sweep of `kBack` from 1.25 to 13 returned byte identical numbers: all of them clamped to the same 94.25, and the entire input scheme, the thing DESIGN 7 is built around, did nothing at all.

The fix, and the three alternatives that were rejected first. A smaller timestep raises the ceiling (1/480 gives 377 rad/s) but costs four times the physics and DESIGN 4 fixes the step at 1/120. Scaling the world up ten times and rendering it down would work and would break DESIGN 21.1, metric scale, which is the one thing VR cannot survive. Living with it means the game has no spin, which is the game.

So the floor contact patch is ours. Every marble carries an unclamped `spin` vector in `core/physics.js`; each step the patch velocity `u = v + w x (-R n)` decides sliding or rolling, and Coulomb friction is applied as a force on the body and a torque on that spin, capped so a step can never overshoot. Rapier's angvel is written from it, clamped, for rendering and for marble on marble contact only, and the floor's own friction is set to zero with a Min combine rule so nothing is counted twice. What it costs is stated in the file: spin picked up from a marble on marble collision is overwritten rather than read back, so billiards style throw between two marbles is not modelled. The effects that matter both survive: a struck mib arrives with no spin and friction spins it up to rolling, and the taw carries its snapped spin straight through the collision.

**2026-09-04 — `lengthUnit` set to 0.02.**
Rapier's defaults assume objects about a metre across and allow 5 mm of penetration. Our mibs are 16 mm, so a third of a marble could sink into the floor. Setting it tightens every tolerance by fifty times. Measured alone: the break went from 93.5 to 95 percent in band and the taw stayed inside twice as often.

**2026-09-04 — rolling resistance 0.02 to 0.06, and the break from 4.0 to 4.5 m/s. This overrides two numbers the plan fixed.**
The plan's 0.02 was measured against a model where Rapier's own floor friction was silently doing half the braking. With the patch model owning it, 0.02 brakes almost nothing: the taw coasted eleven metres and NOTHING in the scene slept inside eight seconds, on a gate that had been green an hour earlier. Swept 0.02 to 0.18 against launch 3.5 to 6.0, fourteen seeds each. 0.06 at 4.5 m/s sits in the middle of the widest plateau: 1 to 3 mibs out on 94 percent of 200 seeds, everything asleep on 100 percent, and a shot that settles in 4.2 s where the plan's numbers took 6.9. Reported to Stephen and Fable in the morning report because it changes two numbers they set.

**2026-09-04 — a mib is pocketed and removed the instant its centre crosses the ring.**
The real rule, and not an optimisation. A mib struck by a six metre per second taw leaves at nearly eight and rolls sixteen metres; without this the shot could not resolve until it stopped and the player watched a marble they had already won trundle off the map. The harness does the same so that it measures the game.

**2026-09-04 — kBack 3.0, kTop 2.0, and the sticking scenario shoots at 2.6 m/s.**
Swept kBack 2.4 to 3.6 against launch 1.8 to 3.4. At 3.0 the taw sticks within 0.1 m on 100 percent of shots from 1.8 to 2.6 m/s and 81 percent at 3.0 m/s. The scenario also asserts the taw HIT the mib, because below about 2 m/s a heavy backspin stops the taw before it arrives and a stop shot that never gets there would otherwise pass the gate. kTop is 2.0 rather than matching kBack: a thumb snap naturally finds backspin more easily than follow, and this is the first number K1.5 should question.

**2026-09-04 — ⛔ a `?v=` query makes a SECOND COPY of a module in Node, not just a cache buster.**
The plan says Node resolves `./x.js?v=20260904a` to `x.js`, and it does, but Node keys the module cache by the FULL URL. Importing `physics.js` and `physics.js?v=20260904a` gives two separate module instances with two separate `_ready` flags and two separate Rapier states, and the second one throws "call initPhysics before createWorld" on a world you just initialised. A probe hit it within a minute of the referee existing. This raises the stakes on the `stamp` gate considerably: it is not only about the host's cache, it is about module IDENTITY, and one stale `?v=` on one import would give the browser two copies of a module and two copies of its state. Written into the gate's own header.

**2026-09-04 — the planner evaluates a CLEAN plan and the hand shakes afterwards.**
The first version folded the difficulty's aiming error into each candidate before scoring it, then took the sixtieth percentile. So a Rookie looked at six shots it already knew would miss and chose a middling miss: one mib pocketed per ten shots, and games of a hundred and fifty. It also implies an opponent that can predict its own mistakes, which is not what a mistake is. Candidates now differ only in target and power; the percentile picks how good a PLAN this opponent settles for; the noise is applied to the chosen aim afterwards. Games fell from 154 shots to 61 on that change alone.

**2026-09-04 — a candidate world changes BOTH timesteps or neither.**
`evaluate()` set Rapier's timestep to 1/60 and left `step()` integrating its own rolling resistance and spin at the tuning's 1/120, so every guess was computed against different physics from the shot it was predicting. `setTimestep(W, dt)` now moves both, and the world carries its own `dt`.

**2026-09-04 — AI aim noise 8, 3, 1 degrees becomes 2.5, 1.5, 0.8.**
A taw and a mib touch inside a window of about 1.9 cm, so at a metre and a half a hit needs the aim inside 0.73 degrees. Measured over five games each: 8 degrees connects on 17 percent of shots and drags a game to 59 shots, 4 gives 39 shots, 2.5 gives 26, 1.5 gives 20, 0.8 gives 11. The design's ladder shape is kept, a Rookie about three times sloppier than a Shark, at numbers this ring can be played in. Measured after: Shark takes 95 percent off a Rookie, two Rookies split 40 to 60 over twenty games, and a game runs 4 to 49 shots.

**2026-09-04 — the contact offset is the BRACE ANCHOR, not the first sample of the snap window.**
The design says "where the snap path crosses the marble". For a quick flick those are the same point. For a slow push over 220 ms the thumb has already left the marble by the time the 90 ms window opens, and reading the offset there gave a dead centre push a full topspin reading. Where your thumb was SITTING on the marble is the contact, which is also what it means in the dirt.

**2026-09-04 — the ease curve lives in exactly one place, `core/snap.js`.**
The plan puts one ease between thumb speed and power and the design puts one between thumb speed and launch speed. Two would bend the curve twice and the replay would disagree with the AI. `knuckle.js` produces a linear power01 (normalised human effort) and `launchSpeed` eases it.

**2026-09-04 — the Ringer camera's framing lives in `tuning.render.ringerCam` and was chosen by looking.**
Three framings were tried and shot before one was kept: the first put the shooter and the cross against opposite frame edges with two thirds empty dirt between, the second put the shooter off the bottom of the screen entirely. The numbers kept are the third, picked off a contact sheet of four. A camera is a set of numbers like any other and it belongs in tuning where it can be argued with.

**2026-09-04 — a turn change CUTS the camera, it does not swoop.**
Getting behind the other shooter is about a hundred and forty degrees of azimuth, and damping across it is a long dizzy swing for the player and, for a good twenty frames, a board with no shooter visible at all. The drift within a turn stays smooth.

**2026-09-04 — the shooter returns to the ring edge the moment the turn is yours.**
Not a convenience. A shot leaves the taw three or four metres out; leaving it there while the game says "place your shooter" put it off the bottom of the screen with nothing to hold, and the playthrough gate found a match frozen exactly there. The real rule already says a taw that left comes back to the edge.

**2026-09-04 — `tawOnScreen` returns null when the shooter is not on the screen.**
It used to hand back whatever the projection said, and the Knuckle gate found a shooter at y = 1117 on a screen 667 tall. A position that is not on the screen is not a grab target, and saying so out loud is cheaper than a silently unplayable turn.

**2026-09-04 — `meta/save.js` was built during K1 rather than K2, because calibration needs somewhere to live.**
The plan puts the save in K2. Calibration is a K1 item and is worthless without persistence: a player who recalibrates on every load is worse off than one who never calibrated. The module is the real one the plan describes, not a stub, so K2 inherits it: versioned schema, a migration chain that exists before it is needed, a write probe (Safari in private mode hands you a localStorage whose setItem throws), and read modify write merge on every write with marbles union by uid, counters adding and bests taking the max.

**2026-09-04 — the 90th percentile of three snaps, not the maximum.**
DESIGN 7.5 says the ninetieth percentile and it is right: one wild outlier should not set a bar the player then has to clear on every shot for the rest of the game. For three samples that is nine tenths of the way from the second to the third. There is also a floor, so three taps cannot calibrate a player into a game where a full effort snap is a dribble.

**2026-09-04 — calibration lays no cross, no chalk, and frames the marble close.**
DESIGN 16.1 opens with "a marble sits on dirt", and the first build put three paragraphs on a near black wash on top of the very marble the player is asked to snap, framed at the whole ring so it was one dot on a big empty ellipse, with the chalk line running straight through its middle so it read as a shelf edge. The screen is now a vignette with one line, the scene is bare, and `tuning.render.calibCam` frames it at 42 cm.

**2026-09-04 — the calibration marble comes back for the next snap.**
Three shots off a practice tee. Without it the camera was still chasing the last one when the player reached for the next and there was no marble under their thumb, which is exactly the failure the Knuckle gate caught in the match loop.

**2026-09-04 — `audio_budget` renders the graph offline and measures the samples, rather than counting what was scheduled.**
The plan asks for an offline render in Node, and Node has no WebAudio, so it runs in the same headless Chrome as the other browser gates through `OfflineAudioContext`, which is the same graph the game plays through. It measures peak, rms and clipped sample count off real audio: a break of twenty impacts renders at rms 0.0296 and peak 0.526 with zero clipped samples, silence renders as exactly zero, and one marble is quieter than twenty. Watched to fail by turning the limiter off and raising the gain nine times, which produced 277 clipped samples and a peak of 2.943, and again by removing the rolling loop cap.

**2026-09-04 — the rolling loop cap drops the QUIETEST loop, not an arbitrary one.**
Eight loops is the budget. Sorting by speed before the cut means the marble you are watching is the marble you can hear; without the sort the cap would silence whichever marble happened to be first in a Map.

**2026-09-04 — there is no listening gate and there will not be one.**
A machine can say a break makes sound, does not clip, and stays inside its voice budget. It cannot say the glass sounds like glass. That question is line seven of `docs/checklists/k1.md` and it belongs to a person with the volume up.

**2026-09-04 — the house rules are chips that say what they DO, and the ring size cycles rather than toggling.**
DESIGN 8.3 names five toggles. A player meeting "poison" for the first time has no idea what it means, so each chip carries a second line: "knock out the enemy shooter", "one redo for a fumble". Ring size is three values, so it cycles on tap and says so. Every chip is 48 rendered pixels tall at 375 wide and reachable at its centre, proven by walking up from `elementFromPoint` to the control that owns the pixel.

**2026-09-04 — bombing is a snap DOWN the screen, and the game only offers it when it is legal.**
The house rule has to be on and the taw has to be inside the ring, which is the real rule: you cannot drop a shot onto the cross from outside the line. The input notices the thumb went the other way; `game/ringer.js` decides whether that is allowed; and the message line says so at the moment it becomes possible rather than in a manual.

**2026-09-04 — the playthrough's press helper walks up from the pixel to the control.**
A chip's centre pixel belongs to its own label span, so a strict `elementFromPoint(...).id === id` reported an unpressable button that a thumb presses perfectly well. Walking up the parent chain still proves the pixel belongs to that control and nothing is on top of it, which is the thing the rule is actually for.

## K2

**2026-09-04 — the catalog is generated from `docs/DESIGN.md` and the generator handles three sections that are not tables.**
DESIGN 10 says "generated from tables in this doc" and it is taken literally: names, tiers, classes, passives, actives and lore come out of the doc and nowhere else, because the doc is where Stephen writes. Section 10.2 is a table with ONE ROW that packs six marbles (the six cat's eyes) and it expands or the count is short by five; 10.3 is bold prose under group headings where the heading gives the class; 10.6 and 10.7 carry a Figure or a Boss column where the others carry a Class. Sixty designed plus five boss signatures is sixty five, and the `catalog` gate fails if the JSON is stale, watched by hand editing one name and by deleting a marble from the design.

**2026-09-04 — the boss signatures are counted once, not twice.**
They ARE rares, epics and a grail, and the design's own heading counts them inside the sixty five. The first version of the count checked per tier against the designed totals INCLUDING signatures and reported sixteen rares against a want of fourteen on a catalog that was exactly right.

**2026-09-04 — every marble gets a palette from its own name, and the hue has a tenth of a degree of granularity.**
Whole degrees collided three times in sixty five names. Two marbles that read the same at 64 px are the fault the contact sheet exists to catch, so the hue is finer and hand chosen palettes in `marbles.overrides.json` win over the generated one. Sixty four distinct palettes across sixty five marbles, and the one shared pair is deliberate: the Coffee Tin Champ IS a chipped Bumblebee Aggie.

**2026-09-04 — ⛔ ALL TWELVE RECIPES EXIST NOW, AND THE CONTACT SHEET IS WHY.**
Five shader modes existed and the catalog asked for twelve, so THIRTY TWO OF THE SIXTY FIVE marbles rendered as plain coloured spheres and nothing complained: swirls with no swirl, corkscrews with no screw, slag with nothing turbulent in it, and every epic and grail falling through to clear glass. No gate could have caught it and no gate did. A picture of all sixty five, opened and read, caught it in one look. swirl, corkscrew, patch, slag, onionLayers, lutzSparkle and a custom interior for the epics are written, and the cat's eye vane is a blade rather than a smear.

**2026-09-04 — a cat's eye has three vanes, not one.**
DESIGN 10.2 writes the recipe as `catsEye(1, color)` and the 1 is the number of COLOURS: the very next tier names a "Nine Vane" as the wilder variant, which only makes sense against a normal one that has some. At one vane the shader drew a single wide smear that read as a stain.

**2026-09-04 — the four steel marbles are separated by hand, and steel reflects a room rather than wearing a seam.**
On the first sheet Bearing, Chrome Dome and Drop Anchor were three identical grey spheres with an identical hard band across the middle, which is the exact fault the sheet exists to find. Steel has almost no saturation so a hue chosen from a name does nothing for it. They now carry hand chosen values, and the reflection is a soft ground to sky blend whose horizon sits where the seed puts it with a smear of the room in it.

**2026-09-04 — the four grails carry the custom interior until Stephen's figures arrive.**
As plain glass they were the four least interesting marbles on the sheet, which is backwards for the rarest things in the game. The glb lane is still a K2 item and the placeholder knight is still owed.

**2026-09-04 — the grid's thumbnails get their OWN small renderer, not the game's.**
The first version borrowed the main renderer, changed its viewport and scissor to draw a 96 px tile, and read the pixels back out of its canvas. The tiles came out empty and the game's renderer was left with a 96 px viewport. A menu is allowed one 128 px context for as long as it is open and `close()` gives it back.

**2026-09-04 — the tile resets `min-width` and `min-height`.**
The global button rule sets a 200 px minimum for the game's large buttons, so a 96 px tile rendered at 205 px and the three column grid overlapped itself. The playthrough gate now measures a tile and asserts it is 96 px, so this cannot come back quietly.

**2026-09-04 — the inspect camera's distance is SOLVED, not chosen.**
DESIGN 7's screen table says the marble is drawn at 140 px with the card below it. Guessing a distance put a unit sphere across the whole top half of a portrait screen and off the left edge, because in portrait the vertical field is the constraint. Visible height at distance d is 2 d tan(fov/2), so d follows from the fraction of the screen the marble should occupy, and the rig is offset downward rather than tilted because tilting a portrait camera skews a sphere into an egg.

**2026-09-04 — integrity and hardness are shown as words.**
DESIGN 20 asks for it and the playthrough gate enforces it: no raw stat number may reach the inspect card. "Endures" tells a player what a marble is for; 1.3 tells them nothing and invites a spreadsheet. Numbers are for the Practice Ring.

**2026-09-04 — a marble you have never held says so.**
The provenance line was empty for anything outside the inventory, which on the rarest marbles in the game is the emptiest possible answer. It now reads "You have never held one of these."

**2026-09-04 — the epics glow from inside.**
On the inspect card the Galaxy was a dark sphere on a dark background, which is a poor answer to its own lore line, "Hold it to the light. That's not paint." The shared custom interior now emits rather than only mixing toward the core. The eight per epic shaders the design asks for are still owed.

**2026-09-04 — `Date` is read in `meta/economy.js` and nowhere else in the game.**
The daily reset is local midnight, so somebody has to read a clock. `core/` may not: it has to give the same answer on a phone in Auckland, a phone in Lisbon and a Cloud Function in us-central1, and a clock is exactly the kind of thing that would break that. The clock is injectable so `clay_regen` can walk it forward a week, sideways across two midnights and BACKWARDS, which is a real case (a timezone change, a user setting the date, a device that boots at the epoch).

**2026-09-04 — the clay pool regenerates to FULL on a new day, not by one a day and not per call.**
All three failure modes were watched. Per call hands out unlimited free marbles; by one a day punishes a player who was away; and a clock that went backwards either does nothing for ever or does it on every read. A player away a week comes back to ten, not to seventeen and not to three.

**2026-09-04 — a refused spend moves NOTHING, and negative amounts are no ops.**
Watched: removing the balance check let the wallet go to minus three hundred and twenty. A negative spend is not an earn and a negative earn is not a theft.

**2026-09-04 — the match wallet is written once, by the economy, and the save merge no longer adds it again.**
The first wiring had `economy.payForMatch` earn into the wallet AND the results merge write the same amount, which paid the player twice for one match. The merge now carries stats and techniques only.

**2026-09-04 — the two currencies are wired in two different places on purpose.**
`economy.earn` is the game's, four to six hundred a day of honest play, and it is what the results card reports and what a pouch costs. `window._sbCapEarn` is the fleet's, thirty a day across every satellite, and it is called beside it at match end. They never convert in either direction. OPEN #9 is what the player sees the first one CALLED; until Stephen answers, the UI says Sunbeams per the design.

**2026-09-04 — the tier ladder moved into `meta/tiers.js`, a file with no imports.**
`meta/drops.js` took `TIER_ORDER` from `meta/collection.js`, which imports three, so the `pity_math` gate could not load the module it was meant to be testing. Data that everything needs belongs somewhere nothing has to be dragged in behind it.

**2026-09-04 — pity is a FLOOR on the printed table, never a replacement for it, and the gate proves it cannot claw back.**
DESIGN 11 prints both a weight table and a pity guarantee, and both have to be true at once. The only reading under which they are: the weights are the base roll, and pity sits on top, so the rate a player sees is at or above what is printed and never below. The gate measures the base roll against the table within half a point AND asserts that no pitied tier came out below its printed rate. A pity system that quietly takes back what it gave is the oldest trick in the genre.

**2026-09-04 — ⛔ FOR STEPHEN: the Standard Pouch's printed odds and its felt odds are very different, and the pity is why.**
Measured over a hundred thousand pulls. The table says 3.6 percent rare and 0.4 percent epic. What a player actually gets is **10.16 percent rare and 2.71 percent epic**, because at a 3.6 percent base rate roughly seven of every ten runs of ten pulls contain no rare at all, so the guarantee fires constantly: 6,554 of the rares and 2,285 of the epics in that run came from pity rather than from the roll. Nothing here is broken and both design statements are honoured; the pouch is simply about three times more generous on rares and seven times on epics than its own table reads. If the printed number should be the felt number, the pity window wants to be much longer than ten. Left as the design writes it and raised in the morning report.

**2026-09-04 — a duplicate only becomes dust for a GRAIL.**
DESIGN 11 says dupes become dust and DESIGN 10.6 says no dupe grails ever. Below grail a second copy is a second marble, which is the whole point of a clay pool and of ten identical commons on the cross, so it is kept. A grail that would repeat rerolls to the highest epic and the duplicate never exists; over a hundred thousand grail pulls, zero duplicates, and 15,088 rerolls once all four were held.

**2026-09-04 — the escrow is written BEFORE the first turn, and the gate kills a real process to prove it.**
Keepsies is real property to the player, so a bug here is not a bug, it is a theft. Staked marbles leave both inventories and sit in a pot marked `inMatch` in the same write, before a single shot. `escrow_crash` starts a real child process, has it stake, and SIGKILLs it between that write and the first turn; the save it leaves on disk is then loaded and counted. A marble is in an inventory or it is in the pot, never in both and never in neither. Watched to fail three ways: an escrow that does not remove from the inventory duplicates it (u1,u1,u2,u3), a boot that forgets to hand the pot back eats it, and a loss that quietly returns the marble makes the whole game meaningless.

**2026-09-04 — the tier matched rule refuses with a REASON, never with a dead button.**
"Same number each. You have 2 up and they have 1." "Too far apart. A common does not play against an epic." A refusal a player cannot understand is indistinguishable from a bug, and this one is standing between them and their best marble.

**2026-09-04 — a duplicate is only dust at grail; below that a second copy is a second marble.**
Ten identical clay marbles on the cross is the design's own picture of the clay pool, so keeping duplicates is the point rather than an oversight.

**2026-09-04 — the pot line names the marble, which took a second look.**
`pot.mine` holds inventory items, which carry an id and no name, so the results card read "Dusty keeps ." The name lives in the catalog and is looked up there.

**2026-09-04 — ⛔ a word ladder written by hand against a catalogue generated by machine will drift, so `words` measures it.**
DESIGN 20 shows hardness and weight as WORDS rather than numbers, which is right and is also a trap: nothing made the vocabulary agree with the marbles. The first weight ladder topped out at 25 grams over a game whose heaviest marble is a 16.7 g steelie, so **58 of 65 marbles printed "barely there"**, including every steelie, and two of its four words could never appear at all. Rebanded against the measured masses (2.3 g Peewee, 3.9 g clay, 5.4 g glass and agate, 13.2 g the big agates, 16.7 g steel). `test/words.mjs` now holds both ladders to three rules: every word is reachable, no word covers more than 80 percent of the catalogue, and heavier never gets a lighter word. All three watched to fail.

**2026-09-04 — ⛔ a number written into prose is still a number, and the catalogue now carries it.**
The words gate went red on a rung that could never print, and the reason was upstream: DESIGN gives Mercury "−hardness (0.8)" and Kiln Kiss "agate hardness (1.3)" inside their passive TEXT and nowhere else, so `bodySpec` never saw either. The inspect card called Mercury "shrugs it off" directly above its own passive saying its hardness is 0.8. `tools/catalog.mjs` lifts a parenthesised hardness out of the ability text into `arena.hardness`. DESIGN's number, unchanged: this only carries it where the code can read it.

**2026-09-04 — "keep" is the word for your own marble, so the result card says which one crossed the ring.**
The card read "You keep Peewee." over a marble that had just been taken off Dusty. It now says "You won Peewee off Dusty Coyle. Dirt Plain came home." on a win and "Dusty Coyle keeps your Dirt Plain." on a loss, and the pot is the first and largest row on the card rather than a stat line under Techniques. The Sunbeams reasons moved to small type underneath, because a currency receipt was outshouting the only line a player will remember tomorrow.

**2026-09-04 — the ante has ONE door, and the screenshot run walks it.**
`beginMatch()` is the only path from the setup screen to the ring, and both the PLAY button and the dev API go through it. The screenshot run had been calling `start()` directly, so it staked a marble and then produced a result card reading "nothing was up" over a pot that really was selected. A test entrance that skips the escrow is a test that proves nothing about the escrow.

**2026-09-04 — the collection grid does not scroll, the collection screen does.**
A scroll inside a scroll made a peephole: three and a half marbles visible out of eighteen, with the second row's names sliced through the middle, because the flex parent shrank the grid to 196 px under its own 253 px cap. The marbles flow at their natural height, the page scrolls, and the shop sits underneath them.

**2026-09-04 — the match camera tightened, `spanFactor` 0.78 to 0.72 and `spanAdd` 1.85 to 1.35.**
Measured by opening `docs/shots/k1-board.png`: at the old numbers a ten foot ring was framed so wide that both of its arcs left the screen, the thirteen mibs were twelve pixel specks and the shooter was a single dot on a line. Tightened, the far arc comes back into frame and the ring reads as a circle. The empty middle is still large and that is inherent to shooting a ten foot ring from behind the shooter at 37 degrees; a camera that leans toward the cross while you are aiming is the real answer and it is not built.

**2026-09-04 — the opponent has one name, and it comes from the match.**
The setup screen said Dusty Coyle and the result card said Dusty, which is two people on adjacent screens. DESIGN 10.7 and the league table both write him as Dusty Coyle. The result title, the lag line and the pot sentence all read `players[1].name` now, so league two will not still say Dusty.

**2026-09-04 — ⛔ a centred flex column that scrolls eats its own top, and the shrink lands somewhere.**
Letting the collection grid grow to its real height moved the whole screen's layout: `justify-content:center` pushed "Your marbles" off the top edge where no scroll can reach it, and the flex shrink that used to be absorbed by the grid moved to the filter strip and crushed seven 48 px chips into a 12 px line of empty outlines. A screen taller than the phone starts at the top, and nothing inside it shrinks.

**2026-09-04 — the pot ceremony renders the marble ONCE and then moves a picture.**
DESIGN 18 calls the post match pot resolution the emotional core of the game, and it is, because it is the only moment where the thing that changed hands is a THING rather than a sentence. It uses the thumbnailer's own tiny renderer for the reason written in that module's header: the grid tiles rendered EMPTY the first time because they borrowed the match renderer and mutated its viewport, and a ceremony running a second live scene every frame would be the same mistake with a longer fuse, on the one screen a player sees after every match. One render into a canvas, then transforms. The compromise is that a rolling sphere's specular highlight does not rotate with its pattern and here it does; at ceremony speed the eye reads the pattern, and if it ever reads wrong the fix is a fixed highlight composited over the rotating one, not a live scene.

**2026-09-04 — the wrapper travels and the canvas spins, because the shadow lives on the wrapper.**
With the roll rotation on the same element as the ground shadow, the shadow rotated with the ball and sat at eight o'clock instead of underneath. Found by opening the shot.

**2026-09-04 — ⛔ the ceremony calls back exactly once on every path, and the gate proves it.**
End of sequence, skip tap, reduced motion, and the failure path where a marble will not render. A ceremony that can swallow the results screen is worse than no ceremony, so `playthrough` runs a second staked match with `prefers-reduced-motion: reduce` emulated and asserts the ceremony stands still AND still hands the card over. Watched to fail by deleting the reduced motion path's own timer: the gate hangs at exactly that assertion and exits 1.

**2026-09-04 — the gate had to be taught that the ceremony is an end.**
Its wait resolved on `screen === 'results'`, which only happens after the ceremony finishes, so the first version sailed straight past a ceremony that was running the whole time and asserted nothing about it. The wait now treats a `.ceremony` element as an end too, and the same fix was needed in `tools/shots.mjs`, which had been photographing the result card and calling it the ceremony shot.

**2026-09-04 — no empty first beat, and the board goes quiet.**
A 260 ms lead in meant the ceremony spent a quarter of a second as a black rectangle with nothing in it, which is how the gate first caught it. And at 0.86 alpha in the middle the HUD pips, the opponent's chat line and both match buttons read straight through the veil, so the one moment where nothing else should be asking for attention had five other things on screen. The veil is opaque and the match's last line and technique toast are cleared before it opens.

**2026-09-04 — the ransom deadline is a timestamp in the save, never a timer.**
A 24 hour window has to survive the tab being closed for 23 of them, the phone being off, and the game being opened in a second tab. Nothing in `meta/ransom.js` schedules anything: every read asks the clock what time it is and compares. The offer is written at the SETTLE rather than when the card is shown, so a player who closes the tab on the loss ceremony still has their full window when they come back.

**2026-09-04 — an expired offer is marked, not deleted.**
"The winner kept it" is a fact about your collection that a player should be able to read later, and an offer that vanishes silently is indistinguishable from a bug that ate a marble. `expire` sets `lapsed` exactly once and keeps the row; `history()` returns everything that ever happened. Watched to fail by deleting instead of marking, which the gate catches twice: the offer cannot be found to refuse, and the history is empty.

**2026-09-04 — commons and uncommons are never ransomed, and that is the clay pool's whole point.**
DESIGN 12 says rare+ and means it. The clay pool exists so anybody can play for keeps without risking anything they care about, and putting a price on a clay marble would turn the free tier into a trap. `priceFor` returns 0 for them and `offerFor` skips them. Watched to fail by removing the skip.

**2026-09-04 — "let it go for now" is not a decline.**
The card after a loss decides one thing only: whether you pay NOW. The offer stays open for its 24 hours and the collection reaches it again, which is also the only place a lapse is ever announced. That row sits ABOVE the grid: it is the only thing on that screen with a deadline on it, and under the grid the screenshot of a live offer did not contain the offer.

**2026-09-04 — the countdown rounds UP.**
Flooring meant an offer opened one second ago said "23 hours left" on the card that opened it, which reads as a countdown that starts by losing an hour, which reads as a bug.

**2026-09-04 — the collection, the results card and the offer card are opaque.**
All three are places rather than overlays, and the arena reading through the veil put stray match marbles and the chalk arc behind the shelf and around the marble on the offer card.

**2026-09-04 — ⛔ FOR STEPHEN: "level N needs 120xN XP" has two readings and one of them ends the game in 36 wins.**
DESIGN 20 writes the curve as "level N needs 120×N XP" with a cap of 30. Read cumulatively, reaching level 30 costs 3,600 XP, which is 36 wins at 100 a win, and the cap would be hit in an afternoon. Read as the cost of ONE level up, leaving level N, the whole ladder is 120 × (1+2+…+29) = 52,200 XP, about 520 matches. Built as the second, because the first makes the cap meaningless. `xpPerLevel` is in `tuning.json` and one number changes it.

**2026-09-04 — losing pays 40, and that is a rule rather than a kindness.**
DESIGN 12: "progression never requires keepsies", and DESIGN 20 pays 40 XP for a loss, For Fair included. A player who never stakes anything still climbs, which is what makes the ladder survivable and what stops the pot from being the only way forward.

**2026-09-04 — one award can cross several levels, and each one pays its own bonus exactly once.**
A boss win at 300 XP can cross two levels. Paying only the final level and paying one level twice are the two ways this goes wrong; both are gated, and the bonus goes through `economy.earn` rather than touching the wallet, so it lands in the wallet's own change feed like every other earn.

**2026-09-04 — at the cap the XP is kept, not dropped.**
A player at 30 keeps banking, so raising the cap later hands them the levels they already earned. Silently discarding XP is the kind of thing nobody notices until the cap moves and everybody is furious.

**2026-09-04 — ⛔ the level up card only announces unlocks that EXIST.**
DESIGN 20's unlock table stays whole in `tuning.json`, and a second list, `announce`, says which of them this build actually has. Today it is one key long: the pouches. A card reading "keepsies against people and pass and play now open" sends a player looking for screens that are not there, and human keepsies is Phase 4. The day a thing ships, its key goes on the list.

**2026-09-04 — an unlock is a question, never a copy of the number.**
Every gate asks `unlocked('pouches')` and the level lives in `tuning.json` only. The moment a screen writes `level >= 2` the table has two homes and one of them drifts. The playthrough asserts the LOCK before it opens it, because a lock nobody checks is a lock that quietly stops working.

**2026-09-04 — ⛔ a flaky gate was a real fault: the shop sat below the fold after a level up.**
`playthrough` failed three assertions in one run of `check.js` and passed the next, which is the shape of a race and was not one. `press()` refuses to press a control that is not under its own centre, and after the level up granted mid test the three pouch buttons landed below the fold, so whether the press worked depended on where an earlier screen had left the scroll. The gate now passes `{scroll: true}` for the shop, because scrolling to a shop under your own shelf is what a player does, and it stays strict everywhere else, because that strictness is what found BACK below the fold of the collection an hour earlier. Reproduced 1 in 3, then clean 4 of 4.

**2026-09-04 — a failing gate prints what FAILED, not its last twenty five lines.**
`check.js` printed "3 FAILED" over a wall of green because the failures were early and the tail was late, and the three had to be hunted by rerunning the gate by hand. It now prints every FAIL line with a line either side, and the tail after it.

**2026-09-04 — ⛔ `beats.js`, because `onboarding.js` was already taken, and overwriting it cost a boot.**
DESIGN names one file for the whole of section 16 and the calibration shipped into it in K1. Writing the beat machine over the top produced a page that loaded nothing with no error in the console, because a missing named export fails the whole module graph. Restored from git inside a minute. Two files, two jobs: `onboarding.js` measures a thumb, `beats.js` runs the script.

**2026-09-04 — the first match covers beats 2, 2.5 and 3, and DESIGN separates them.**
DESIGN 16 gives the break its own window (0:20 to 1:00) on a board with nobody else on it, then Dusty arrives for a full game at 1:00. There is no one player match mode: `startMatch` always seats two. So the first game IS the break, the sticking lesson and the game with Dusty, in that order, on one board: the break beat completes on the first shot that resolves, the sticking beat on the first stick or when the match ends, and Dusty's beat when the game does. A solo board is a small feature and this is flagged for the Director rather than built without him.

**2026-09-04 — the sticking beat cannot deadlock.**
A player who never manages a backspin shot would otherwise sit on beat 2.5 forever. The beat still waits for exactly one event, which is the rule the gate holds; the GAME decides the guided window has closed and fires it, with a gentler line. A beat machine that can wait for something a player cannot do is a lock on the front door.

**2026-09-04 — the starters arrive out of the tin, not at boot.**
They used to be granted silently the first time the page loaded, so a player met their whole collection before the game had said a word about it, and the heirloom choice DESIGN 16.4 asks for did not exist at all: `starterGrant` returned three candidates and nobody ever read them. They arrive in beat 4 now, with the heirloom chosen on its lore rather than assigned, and the two not picked go back into the pouch pool, which is what they are for. `grantStartersOnce` survives only as a safety net for a save that finished onboarding in an older build.

**2026-09-04 — the first two games are set up by the game, not by the player.**
DESIGN 16 is exact: beat 3 is a seven foot game, slips on, For Fair, and beat 5 is the same table with one clay each on it. A player handed five house rule chips before they have played once is being asked a question they cannot answer yet, so the chips are set and the ante for beat 5 is put up for them.

**2026-09-04 — ⛔ skipping the calibration used to trap the player in the calibration.**
Beat 1 fired only on a real result, so somebody who tapped Skip went back to the screen they had just left, forever, because `nextScreenForOnboarding` asks the beat where to go and the beat had not moved. The beat is "the game has asked for your snap", not "the game got one": the default power curve is the cost of skipping, not a locked door. The render gate found it by being the only thing in the build that ever taps Skip.

**2026-09-04 — one place decides where the player goes next.**
The play button, the end of calibration and the rules card each had their own `if (G.seenRules)`, which is how an onboarding grows a hole. They all call `nextScreenForOnboarding()` now and it asks the beat.

**2026-09-04 — the tin has to lead somewhere.**
Beat 4 ends on the collection with a shelf full of marbles and, before this, no way forward except BACK to a title screen: the one moment the game has just given the player everything, and it left them to guess. During the onboarding the way out IS the next beat, and the button says so.

**2026-09-04 — the render gate is about pixels, not about the script.**
The first four minutes are walked assertion by assertion in `playthrough`. `render` puts the player into the state of somebody who has already been through them, so the setup screen under test is the ordinary one rather than the For Fair table the onboarding sets. Two gates, two questions.

**2026-09-04 — K3: six conditions ship, and `onRail` is the one held back.**
DESIGN 9.5 lists seven launch conditions and says so in its own margin: "cut `on rail` OR `Nth contact` if playtest shows condition-guessing is too diffuse; ship max 6." `onRail` is the cut, because it is the only one a player cannot deliberately arrange for an opponent to walk into: `Nth contact` is the aggressive read and `close range` is the positional one, and both reward a plan. The seventh is written into `specials.js`, marked `shipped: false`, and left out of `SHIPPED`, so the cut is visible and reversible rather than forgotten.

**2026-09-04 — an active takes BOTH halves, always.**
Full meter AND condition met. A marble that fires on a full meter alone has no secret, and one that fires on the condition alone has no meter to watch, and the meter being public while the condition is secret is the entire mind game of DESIGN 9.5.

**2026-09-04 — charge is earned on the damage that LANDED, not the damage that was rolled.**
A hit that overkills a cracked marble by thirty does not pay thirty. Otherwise the cheapest way to charge a meter is to keep hitting something that is already dead, which is the opposite of what the meter is for.

**2026-09-04 — a condition is a pure predicate over a fact sheet.**
It never reads the world, never reads a clock and never mutates anything, so `condition_matrix` sweeps every condition against every event with no physics step at all: 42 cells, printed as a grid, and the gate fails on any cell that is not exactly right.

**2026-09-04 — ⛔ nobody ever stands in an empty arena.**
DESIGN 9.1 gives each player one active marble, and when that marble shatters the next legal one rolls in by itself: the CHOICE of which marble is the swap, not whether to have one. The gate found this by shattering an active and then asking that player to shoot, which threw rather than played. The replacement enters with no attack momentum, the same as any other entry, because it did not choose to be there either.

**2026-09-04 — a rung out marble is not a lost marble, and the gate says so at the limit.**
All three of your marbles rung out, none shattered, and the match is still going: they simply roll back in. That is the whole difference between DESIGN 9.7's two win textures, so the gate asserts it in its strongest form rather than its mildest, and watching it fail means flipping the win condition to "all benched" and seeing that one assertion go red.

**2026-09-04 — actives are read AFTER the damage.**
So a "when it cracks" condition answers the hit that cracked it, in the same resolution, rather than a turn later. A condition that can only respond next turn is a condition nobody would choose.

**2026-09-04 — the hazard count is asserted as a SEQUENCE, not as one number.**
DESIGN 9.2 says hazards are turn cycle deterministic and never wall clock, and an indicator that promises "fires in 1 turn" has to be telling the truth. One reading of a counter proves nothing; five in a row, alternating and never skipping, proves the cycle.
