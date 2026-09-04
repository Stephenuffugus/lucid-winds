# KEEPSIES: in-folder state

**Read first: `docs/DESIGN.md` (what the game is) and `../../HANDOFF-KEEPSIES.md` (how it gets built, the phases, the gates, the ledger). Update this file at the end of every session.**

## Where we are

**2026-09-04, after Fable's review. K0 done. K1 done but for pass and play, and PLAYED with real pointer
events for the first time (see `PLAYTESTS.md`). K2 done but for art: catalog, looks, collection, economy,
pouches, the keepsies loop, the ceremonies, the ransom window, progression and the first four minutes.
K3 started and blocked on a Director call (the Arena's damage floor against The Ring).** Build `20260904b`,
on main. The review's findings and fixes are the 2026-09-04 review entries in `docs/DECISIONS.md`; the
short version is that twenty one green gates fed the Knuckle through `_feed()` and the game soft locked on
the second calibration snap for a real thumb. ⛔ Review a build by PLAYING it through the front door.

A whole game of Ringer runs on a phone sized screen. Calibration, then the rules card, then a match
setup with the house rules, then: lag, place the shooter on the ring edge, brace until the reticle
settles, flick through the marble, watch the cross scatter, shoot again if you pocketed, and a result
card. Two whole games are played end to end by the `playthrough` gate every time it runs, one with the
Knuckle and one with the pull back fallback.

All sixty five marbles exist as data generated from the design and render distinctly.

## The one command

```
node tools/check.js            thirteen gates, about four minutes
node tools/check.js --fast     skips the sample sensitive ones and says which
node tools/shots.mjs           the screenshots, then OPEN them
node tools/frontdoor.mjs       PLAY it with real pointer events (not a gate), then OPEN what it shot
node tools/contact_sheet.mjs   all 65 marbles in one picture, then OPEN it
node tools/catalog.mjs         regenerate src/data/marbles.json from the design
node sim/harness.js --scenario=all --csv /tmp/k.csv
node tools/stamp.mjs --bump 20260905a
```

## The gates

`lint` `catalog` `stamp` `harness` (ringer_break, sticking, replay_hash) `save` `ringer_rules`
`ai_budget` `ringer_ai` `render` `knuckle` `audio_budget` `playthrough`. Every one has been watched to
fail on purpose and the red output is in the root handoff's ledger.

## What is left, in the order it should be picked up

**K1, one item.**
1. **Pass and play.** Two local profiles on one device. Deferred on purpose: `meta/save.js` holds one
   profile, and a second one wants the economy's inventory beside it, so it belongs with the keepsies
   loop rather than in front of it.

**K2, in order.**
2. **The economy** (`meta/economy.js`, `meta/drops.js`): the wallet, the faucets, the clay pool, the
   three pouches with pity counters, dust. Gates `pity_math` and `clay_regen`.
3. **The keepsies loop** (`game/match.js`): the ante with the tier matched rule, escrow written with
   `inMatch` BEFORE the first turn, the winner taking the pot, and the ransom window. Gate
   `escrow_crash`. This is the game's whole point and it does not exist yet.
4. **The ceremonies** (`render/ceremony.js`) and the showcase room. DESIGN 18 asks for disproportionate
   polish here and the result card currently floats over a black wash.
5. **The glb lane**, end to end, on one low poly knight built in `tools/forge/`: load on first inspect,
   LOD, dispose, and the turntable showing it inside a clear sphere. It is a knight and not a dragon on
   purpose: the Ember Dragon is a real grail and a dragon placeholder would be mistaken for it.
6. **Eight per epic shaders.** They currently share one custom interior, which reads as cloud rather
   than as a galaxy, a molten core and a thunderhead.

**Done in K2 already:** `tools/catalog.mjs` and all sixty five marbles; all twelve render recipes;
`meta/collection.js` with the inspect turntable and the collection grid; `meta/save.js`.

## Four things a new session must know before touching physics or art

1. **Rapier hard clamps angular velocity to pi/4 radians per step**, which is 94.25 rad/s at 1/120, with
   no parameter to change it. A 22 mm taw rolling at 2.6 m/s needs 236. So the floor contact patch is
   ours: every marble carries its own unclamped `spin`, `core/physics.js` decides sliding or rolling and
   applies the friction itself, the floor's friction is zero in the solver, and Rapier's angvel is
   written from ours for rendering only. Read scar 4 at the top of that file before changing anything.
2. **`addForce` and `addTorque` are persistent.** `resetForces` and `resetTorques` come first, every step.
3. **Nothing in `src/core/` may call a transcendental.** Use `core/dmath.js`. A `?v=` query also makes a
   SECOND COPY of a module with its own state, in Node and in the browser, which is the real reason the
   `stamp` gate matters.
4. **The contact sheet is not decoration.** It found thirty two marbles rendering as plain spheres that
   every gate was happy with. Render it and open it after any change to `render/marbleMesh.js` or the
   catalog.
