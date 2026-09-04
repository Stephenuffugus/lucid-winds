# KEEPSIES: in-folder state

**Read first: `docs/DESIGN.md` (what the game is) and `../../HANDOFF-KEEPSIES.md` (how it gets built, the phases, the gates, the ledger). Update this file at the end of every session.**

## Where we are

**2026-09-04. K0 done. K1 mostly done and playable. K2 and K3 not started.**

A whole game of Ringer runs on a phone sized screen: title, rules card, lag, place the shooter on the
ring edge, brace until the reticle settles, flick through the marble, watch the cross scatter, shoot
again if you pocketed, and a result card. Two whole games are played end to end by the `playthrough`
gate every time it runs, one with the Knuckle and one with the pull back fallback.

## The one command

```
node tools/check.js          nine gates, about three minutes
node tools/check.js --fast   skips the sample sensitive ones and says which
node tools/shots.mjs         the screenshots, then OPEN them
node sim/harness.js --scenario=all --csv /tmp/k.csv
node tools/stamp.mjs --bump 20260905a
```

## What is built

- `core/` physics with our own contact patch, rng, dmath, marbleBody, snap, the Ringer referee,
  the technique detector. Zero DOM, runs in Node unchanged.
- `game/` the Ringer mode controller and the shot planner (Rookie, Sharp, Shark).
- `input/` the Knuckle and the pull back fallback, plus camera gestures.
- `render/` scene and CameraRig, the fake glass, contact shadows, the dirt ring, quality tiers.
- `audio/` impacts only, synthesised from contact events.
- `sim/` the harness and three scenarios; `test/` six gates; `tools/` check, stamp, lint, shots, icons.

## What K1 still owes, in the order it should be picked up

1. **Calibration.** Onboarding's first twenty seconds, three hardest snaps, ninetieth percentile stored.
   Until it exists every player uses `snap.thumbSpeedMaxDefault`, which is a guess at a stranger's thumb.
2. **Audio beyond impacts.** Rolling loops per marble, the warming shimmer, and the `audio_budget` gate.
   The game currently clicks when marbles touch and is otherwise silent.
3. **Pass and play.** Two local profiles on one device.
4. **The house rules row.** The toggles exist in the referee and in `tuning`; there is no UI for them, so
   quickplay defaults are all anybody can play.
5. **Bombing.** The AimSource carries `bomb` and `core/snap.js` implements the drop shot; no input path
   reaches it.
6. **Rookie Assist.** The first 0.4 s of predicted path at levels 1 to 3, never in ranked.
7. **A slip affordance.** The referee hands the turn back and the input flags it, but nothing on screen
   tells the player what just happened beyond one line of text.

## Three things a new session must know before touching physics

1. **Rapier hard clamps angular velocity to pi/4 radians per step**, which is 94.25 rad/s at 1/120, with
   no parameter to change it. A 22 mm taw rolling at 2.6 m/s needs 236. So the floor contact patch is
   ours: every marble carries its own unclamped `spin`, `core/physics.js` decides sliding or rolling and
   applies the friction itself, the floor's friction is zero in the solver, and Rapier's angvel is
   written from ours for rendering only. Read scar 4 at the top of that file before changing anything.
2. **`addForce` and `addTorque` are persistent.** `resetForces` and `resetTorques` come first, every step.
3. **Nothing in `src/core/` may call a transcendental.** Use `core/dmath.js`. The `lint` gate enforces it
   and has been watched to catch it. A `?v=` query also makes a SECOND COPY of a module with its own
   state, in Node and in the browser, which is the real reason the `stamp` gate matters.
