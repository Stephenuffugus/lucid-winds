# Probes (Fable, 2026-09-04): the measurements behind HANDOFF-KEEPSIES.md sections 2 and 4.1

These are NOT the harness. They are standalone scripts run against `@dimforge/rapier3d-compat@0.20.0` installed in a scratch directory, to answer three questions before a line of game code existed:

1. `01_ringer_break_smoke.mjs`: does Rapier run headless in Node 24, is it deterministic run to run, what does a 1/120 step cost. Answer: yes, yes (`deterministic: true`), 0.41 ms per step for 14 balls on the 2 core codespace.
2. `02_ringer_break_diag.mjs`: the design's own numbers (3.5 m/s, damping 0.18, dirt friction 0.55) into the 13 mib cross. Answer: 0 mibs out of the 1.525 m ring at every variant under 6 m/s, and marbles never sleep. Rapier has no rolling resistance.
3. `03_ringer_break_sweep.mjs`: launch speed x floor friction x a rolling resistance force x restitution, 6 seeds each, aim jitter 0.5 degrees at the centre mib. Results in `03_sweep_run2_results.txt`. The row `4 0.55 0.02 0.78` (4 m/s, friction 0.55, rolling mu 0.02) is the design's target band: 1 to 3 mibs out on every seed and every body asleep by 8 s.

`03_sweep_run1_BUGGED_persistent_force.txt` is the first run of the sweep, kept on purpose: `addForce` is PERSISTENT in Rapier, and without `resetForces(true)` each step the braking force accumulated and every rolling resistance row knocked out nothing. If a future sweep shows zero everywhere, look here first.

Rerun:
```
mkdir -p /tmp/rapier-scratch && cd /tmp/rapier-scratch && npm init -y && npm i @dimforge/rapier3d-compat@0.20.0
cp /workspaces/lucid-winds/satellites/keepsies/sim/probes/*.mjs . && node 01_ringer_break_smoke.mjs && node 02_ringer_break_diag.mjs && node 03_ringer_break_sweep.mjs
```
The shipping build vendors the DETERMINISTIC compat package (HANDOFF-KEEPSIES.md 4.2); the numbers above were measured on the plain one and should be re-run on it in K0 as the first `ringer_break` gate.
