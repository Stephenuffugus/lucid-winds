# KEEPSIES: in-folder state

**Read first: `docs/DESIGN.md` (what the game is) and `../../HANDOFF-KEEPSIES.md` (how it gets built, the phases, the gates, the ledger). Update this file at the end of every session.**

## Where we are

**2026-09-04, K0 is done.** The physics passes its own break, the harness catches a stray random, and one
marble sits on dirt and can be heard. `node tools/check.js` prints ALL GATES PASSED across four gates,
every one of them watched to fail on purpose first. K1, the Knuckle and the Ringer referee, is next.

## The one command

```
node tools/check.js          lint, stamp, harness, render
node tools/check.js --fast   skips the sample sensitive gates and says which
node sim/harness.js --scenario=ringer_break --csv /tmp/break.csv
node tools/stamp.mjs --bump 20260905a
```

## Files

```
docs/DESIGN.md        Stephen's v2 design, verbatim. The source of truth for what the game is.
docs/DECISIONS.md     every choice the design did not make for us, with the measurement behind it
docs/checklists/      what to try on a phone, one file per phase
docs/shots/           the screenshots, opened and described in the root handoff's ledger
sim/harness.js        the headless simulator; scenarios are JSON in sim/scenarios/
sim/probes/           Rapier measurements. 01 to 03 are Fable's, 04 proves trimesh and snapshots.
src/core/             zero DOM, runs in Node unchanged. physics, snap, rng, dmath, marbleBody.
src/render/           scene and CameraRig, the fake glass, the dirt ring, quality tiers
src/input/            camera gestures today; the Knuckle lands in K1
src/audio/synth.js    every sound is made from a contact event, nothing is a recording
lib/                  three.js r161 and Rapier 0.20.0 deterministic, byte frozen, never stamped
tools/                check, stamp, lint, make_icons
test/render.mjs       the black soap gate, in real Chrome on a software rasteriser
```

## Two things a new session should know before touching physics

1. Rapier has no rolling resistance AND no spinning friction. Both are applied by hand in `core/physics.js`
   as a force and a torque, and `resetForces` plus `resetTorques` come FIRST every step because both
   accumulate. Without the torque nothing in the scene ever sleeps.
2. Nothing in `src/core/` may call `Math.sin`, `Math.pow`, `Math.hypot` or any other transcendental. Use
   `core/dmath.js`. The `lint` gate enforces it and has been watched to catch it.
