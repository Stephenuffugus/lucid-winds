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
