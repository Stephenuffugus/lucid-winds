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
