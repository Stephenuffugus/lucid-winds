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
