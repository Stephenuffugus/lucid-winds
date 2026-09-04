# HANDOFF-KEEPSIES: the master build plan
**Written 2026-09-04 by Fable, from Stephen's v2 design (`satellites/keepsies/docs/DESIGN.md`, 27 sections, authored 2026-09-03 in a meeting) after reading it whole, reading Ripcord whole, and measuring the physics bet headless on this box.**
**Director: Stephen. He makes every design and economy call. Fable reviews your work and deploys it. You build.**

There is no code. The design is complete and unusually good, and it is also wrong in five places that only a run can find (section 4). This file is the design plus what the fleet already knows, in build order, with gates. It is written for an unattended overnight run: Opus reads, builds K0 to K3 in order, never waits on a human, and leaves a morning report.

---

## THE PROMPT (paste as is into a fresh Opus session; the same prompt resumes a later session)

```
You are Claude Opus, building KEEPSIES, a realistic 3D marble game, in the lucid-winds repo at
/workspaces/lucid-winds on branch add-sproing-jumper, overnight and unattended. The Director is
Stephen; he is asleep and reads your work in the morning. Fable (another Claude) wrote your plan,
reviews every line you produce against it, and deploys. You build.

READ FIRST, whole, in this order, before any edit:
1. /workspaces/lucid-winds/HANDOFF-KEEPSIES.md. Section 0 binds you. Section 15 is the overnight
   protocol you run under. Section 16 is the report you write before you stop.
2. /workspaces/lucid-winds/satellites/keepsies/docs/DESIGN.md. Stephen's design, the source of truth
   for what the game is. Where the plan's section 4 corrects it, the plan wins.
3. /workspaces/lucid-winds/satellites/keepsies/sim/probes/README.md. The physics measurements.
4. /workspaces/lucid-winds/CLAUDE.md, the sections LOOKING IS PART OF THE JOB and WHAT THE DIRECTOR
   EXPECTS.
5. The Ripcord files named in the plan's section 3, each when you reach the phase that copies it.

THE FENCE. You touch satellites/keepsies/** and the ledger, session state and morning report of
HANDOFF-KEEPSIES.md. Nothing else. git add only those paths, never -A. git pull --rebase origin
add-sproing-jumper before the first edit and before every push. Never push to main. Never edit
another satellite, portal/index.html, scripts/, music-unlocks.js, or any sw.js.

THE ORDER. K0, then K1, then K2, then K3, exactly as section 6 lays them out. Inside K0 the order is
physics, harness, then pixels. A phase is done when tools/check.js prints ALL GATES PASSED, every new
gate has been watched to fail once, the screenshots have been opened with the Read tool and described
with three faults each, the ledger box holds pasted command output, and the work is committed and
pushed. Then the next phase. Do not stop after K1 to wait for Stephen: his phone notes fold in later
as K1.5. If the whole night is not enough, the morning report says where you are.

THE OVERNIGHT PROTOCOL. Never wait on a human. An ambiguity is the smallest reasonable choice, logged
in satellites/keepsies/docs/DECISIONS.md with one line of why. A gate still red after three honest
attempts is written into SESSION STATE as BLOCKED with its last thirty lines of output, and you move
to the next subsystem that does not depend on it; you never weaken, skip or delete a gate to pass it.
This box has two cores: run gates one at a time, use at most two helper agents and never for a
judgement call. Commit and push after every green subsystem, not at the end of the night. When your
context is running long, finish the current subsystem, run the gates, commit, push, write SESSION
STATE with the exact next action, write the morning report, and stop. The next session starts with
this same prompt and resumes from SESSION STATE.

THE FIRST THING YOU DO after reading is git pull --rebase origin add-sproing-jumper, then K0 step 1:
write satellites/keepsies/tools/check.js with one gate that fails, run it, paste the failure into the
ledger, commit "keepsies K0: the gate, failing", push. Then K0 step 2.

TOOLS. Node 24. puppeteer with a cached Chrome at /workspaces/lucid-winds/node_modules/puppeteer;
WebGL needs the swiftshader flags in section 9; never delete ~/.cache/puppeteer. Blender 4.0.2 and
gltfpack are on the PATH. Fetch Rapier by npm-installing @dimforge/rapier3d-deterministic-compat@0.20.0
into a scratch directory under /tmp and copying dist/rapier.mjs into satellites/keepsies/lib/; never a
node_modules inside the repo. Copy three.js and its loaders from satellites/ripcord/assets/3d/lib/
with the subfolders intact.

LAWS. No dashes of any kind in player copy, commas. No exclamation points in system text. "Sky Wolf
Studio", singular. Never say any art is hand painted. Directions before play. 48 px touch targets
measured as rendered pixels at 375 wide, proven with elementFromPoint, never el.click(). Every patch to
an existing file asserts its anchor matched exactly once. A checkbox flips only with pasted evidence.
A green gate is not a look. Every number lives in src/data/tuning.json.

DO NOT install anything into the repo, register a service worker, load anything from a CDN at
runtime, change a number in DESIGN.md, invent a feature the design does not have, ask Stephen a
question and wait for the answer, or call a phase done before its ledger box is full.
```

---

## 0. RULES OF ENGAGEMENT (read before anything else)

1. **File fence.** You touch ONLY `satellites/keepsies/**` and this file's evidence ledger and session state. Not `portal/index.html`, not root `index.html`, not `music-unlocks.js`, not `scripts/`, not any other satellite, not any service worker. Portal carding and deploys are Fable's.
2. **Tandem safety.** Other builders work in this same working tree (Conduit, Tangent, the music player, the VR pilot). `git add satellites/keepsies HANDOFF-KEEPSIES.md`, NEVER `git add -A` or `git add .`. `git pull --rebase origin add-sproing-jumper` before the first edit and before every push. If a rebase conflicts on a file outside your fence, abort, commit your fenced work, note it in SESSION STATE.
3. **Branch law.** Work on `add-sproing-jumper`, push `origin add-sproing-jumper` after every commit. **Never push to main in any form.** `:main` deploys the live site and is not yours.
4. **The design is `satellites/keepsies/docs/DESIGN.md`.** Read it whole before the first line of code. Its "do not invent features" rule stands. Where this file corrects it (section 4), this file wins; every correction carries the measurement that forced it. Everything else in DESIGN.md is binding as written.
5. **Gates before every commit.** `node tools/check.js` from `satellites/keepsies/` must print `ALL GATES PASSED` (you build check.js in K0, modeled on Ripcord's). Every new mechanic adds a gate or an assertion in the same commit. **A gate you have not watched FAIL is decoration:** break each new check once on purpose, paste the red line into the evidence ledger, revert, then paste the green.
6. **Two cores.** This box has 2 CPUs. Gates run one at a time, never in parallel. A red gate names a suspect, not a culprit: the code, a stale test, or CPU contention. Absolute millisecond thresholds flake here; gate on ratios and on counts.
7. **Look at it.** Every visual phase ends with screenshots at 375x667 and 320x568 from where the PLAYER stands, opened with the Read tool, three faults named per shot in the ledger before the phase is called done. Then the worst angle you can find on purpose: under the floor, the ring edge, into the light. A green probe is not a look.
8. **Copy laws.** No dashes of any kind in player-facing copy, commas instead. No exclamation points in system text (DESIGN §6). "Sky Wolf Studio", singular. Never claim any art is hand painted. One sentence per description. Directions, rules and objectives shown BEFORE play starts (studio standard since 2026-07-19).
9. **Patches assert their anchor.** Every edit to an existing file is an anchored replacement that verifies exactly one match landed. If an anchor does not match, stop and write the mismatch in SESSION STATE. No lookalike anchors.
10. **At most two helper agents, never for a judgement call**, and never two gates at once (rule 6).
11. **Never write a `[x]` before the work exists.** The evidence ledger takes commands and their real output, not the word done.
12. **Update SESSION STATE at the bottom of this file at the end of every session**: exact state, half-done work, next action.
13. **Overnight law.** You never wait on a human. Section 15 says what to do instead, section 16 what to leave behind.

---

## 1. WHAT KEEPSIES IS (and why it is worth a month)

A realistic 3D marble game where the marbles are the economy. Two modes: RINGER, the real playground game (13 mibs in a cross, knock seven out of a ten foot ring), and ARENA, a turn-based marble battle with visible damage, ring-outs, hidden programmed specials and hazard arenas. One signature input, THE KNUCKLE: the real thumb snap made into the phone gesture, read in three layers (hold stillness is the accuracy cone, thumb speed over the last 90 ms is the power, where the path crosses the marble is the spin). Matches are played for keeps: the pot is on the cross, and the Bloodstone Aggie you can lose is also the most beautiful thing you own. 65 marbles (60 designed plus 5 boss signatures), five leagues, five bosses who DISPLAY what they took from you, a ransom window, a showcase room that is a VR trophy room from day one.

**Why it is worth the effort.** It is the studio's first title with a real rigid-body physics engine and a real 3D world under it, and the first whose economy is the collection itself with no purchase anywhere. It carries Ripcord's design DNA (pre-commitment over buttons, discovered names, the simulator as a player feature, all audio from the physics, spare wry copy) into a category with a living collector culture. Stephen's read: it could go hand in hand with Ripcord. Section 3 says exactly how.

**What it is NOT, at launch (DESIGN §1, restated so nobody drifts):** no real money, no trading, no real-time multiplayer, no permanent damage to owned marbles, no login until Phase 4, no energy or timers on play. And, from the fleet: no service worker without Fable's sign-off, no CDN at runtime, no framework, no build step beyond a stamp.

---

## 2. STATE OF THE INHERITANCE (verified by Fable 2026-09-04, trust this over the docs where they differ)

| thing | state | evidence |
|---|---|---|
| Code | **None.** `satellites/keepsies/` holds `docs/DESIGN.md` (the v2 design, verbatim) and `sim/probes/` (my measurements). | `ls satellites/keepsies` |
| The design | Complete: modes, input, physics numbers, 65 marbles with passives and actives, bosses, drops, economy, onboarding, progression, ceremony, audio, perf, VR path, harness, save, phases, 8 open questions. | `wc -c docs/DESIGN.md` = 48134 |
| Rapier headless in Node | **Works, deterministic.** `@dimforge/rapier3d-compat@0.20.0` initialises in Node 24, steps a 14 body Ringer scene at 1/120, and two runs hash identically. 0.41 ms per step for 14 balls on this box. | `sim/probes/01_ringer_break_smoke.mjs` → `deterministic: true rapier 0.20.0`, `msPer120: 49.48` |
| The spec's own break gate | **FAILS on the spec's numbers.** 3.5 m/s taw into the cross with damping 0.18 and friction 0.55 knocks 0 mibs out of the 1.525 m ring, and marbles creep for ever (still awake at 6 s at 0.03 m/s). | `sim/probes/02_ringer_break_diag.mjs`: `SPEC numbers | mibs out 0 | farthest mib r 0.43` |
| Why | Rapier has no rolling resistance; linear damping is exponential, so a marble never stops and never carries. Real marbles roll under a constant deceleration. | section 4.1 |
| Numbers that pass | Rolling resistance 0.02, floor friction 0.55, glass restitution 0.78, damping 0.02, break at 4.0 m/s: mean 1.33 mibs out, every shot 1 or 2, and everything asleep by 8 s. | `sim/probes/03_sweep_run2_results.txt` row `4 0.55 0.02 0.78 \| 1.33 0.00 0.0 \| {"1":4,"2":2}` |
| The AI think budget | **Infeasible as written.** Shark samples 24 candidate shots in a headless clone; a shot resolves in ~300 steps; 24 x 300 x 0.41 ms = 3.0 s on this box, before the phone's 2 to 3x. The 1.2 s cap needs a Worker, a deadline, and snapshot restore. | section 4.3, arithmetic from the smoke numbers |
| three.js | r161 vendored and byte frozen in `satellites/ripcord/assets/3d/lib/` (three.module.min.js 675 KB, GLTFLoader, RoomEnvironment, BufferGeometryUtils). WebXR is inside it. Copy the bytes. | `ls satellites/ripcord/assets/3d/lib` |
| Rapier payload | `rapier.mjs` (compat, wasm inlined) is 2.86 MB raw, about 1.2 MB gzipped. Inside the 8 MB first-load budget with three.js. | `ls -la node_modules/@dimforge/rapier3d-compat/dist` in the scratch install |
| Deterministic build | `@dimforge/rapier3d-deterministic-compat@0.20.0` exists on npm. The plain compat build is deterministic on ONE machine; cross-device replay (Phase 4) needs the deterministic build. Vendor that one from K0. | `data.jsdelivr.com/v1/package/npm/@dimforge/rapier3d-deterministic-compat` → latest 0.20.0 |
| Node and `?v=` imports | Node ESM resolves `./x.mjs?v=20260904a` to `x.mjs`. So source files can carry versioned relative imports and still run headless unchanged. | `sim/probes` scratch: `query import ok 42` |
| Name | "Keepsies" collides with nothing in the portal or any satellite. Trademark unchecked (DESIGN OPEN #1 stands). | `grep -rli keepsies portal satellites` → none |
| Tools on the box | Blender 4.0.2, gltfpack, puppeteer with cached Chrome, Node 24, 2 cores, 4.0 GB free disk. | `blender --version`, `which gltfpack`, `df -h` |
| Marblebeat | A different thing (a marble drop sequencer, Aug 15 zip). No overlap, do not merge. | `unzip -l assets/Marblebeat-*.zip` |

---

## 3. THE RIPCORD QUESTION, ANSWERED

Stephen: "similar physics, 3D arena, maybe even some code, tools, resources or stuff could be used in both. I don't know, you do."

**The physics does not transfer.** Ripcord's `sim2.js` is a reduced heavy symmetric top model on a dish: five part slots, precession, rim friction, a collision solver written for two spinning discs. It is 1654 lines of a different problem. A marble game is full 3D rigid bodies rolling, sliding, colliding in packs of fourteen, with tunnelling at 6 m/s. That is what Rapier is for. DESIGN §2's "shares design DNA, shares no code" is right about the simulation and the plan keeps it.

**A great deal else transfers, by copying bytes or copying shape.** Never by importing a Ripcord URL at runtime: Ripcord is another builder's fence and a Ripcord edit must not be able to break Keepsies.

| what | how | from |
|---|---|---|
| three.js r161 + GLTFLoader + RoomEnvironment + BufferGeometryUtils | copy the files byte for byte into `satellites/keepsies/lib/` | `satellites/ripcord/assets/3d/lib/` |
| The proven three.js loading pattern: importmap, dynamic import on first use, PMREM + RoomEnvironment so metal and glass have something to reflect (envIntensity ~0.55), explicit dispose | copy the pattern | `satellites/ripcord/src/play-shell.html` importmap at ~710, the V3D inspect viewer ~1143 to 1283 (`envIntensity` at ~1192, dispose ~1224 to 1236), `src/battle3d.js` |
| The headless WebGL gate: swiftshader flags, "the scene is not one flat colour" (black soap assertion), "two frames 600 ms apart differ", zero page errors, measure with the 2D overlay hidden | copy the shape into `test/render.mjs` | `satellites/ripcord/test/battle3d.mjs` |
| The storage module: three backends probed in order, write probe for Safari private mode, read-modify-write merge for two tabs, nothing else touches storage | copy and adapt to the Keepsies save schema | `satellites/ripcord/src/store.js` |
| Synth audio module shape: one AudioContext on first gesture, filtered noise bursts, envelopes, silent when the API is missing | copy the shape; the marble voices (modal banks per material) are new | `satellites/ripcord/src/audio.js` |
| The gate runner: one command, every gate a separate file that can fail, fast mode SKIPS sample sensitive gates and says so instead of shrinking them | copy | `satellites/ripcord/tools/check.js` |
| Determinism test: full end state fingerprint over many seeds, plus a deliberate Math.random injection that must be caught | copy the shape into `test/determinism.mjs` | `satellites/ripcord/test/determinism.js` |
| Portal thumb from a real frame | copy, then ADD the step it lacks: it drives the game and saves a 960 px raw PNG (`tools/thumb-raw.png`) and stops; the crop and resize to a 480 px JPEG under 150 KB was done outside the tool for Ripcord. Keepsies' version writes the finished JPEG itself | `satellites/ripcord/tools/make_thumb.mjs` |
| Sky Wolf embed protocol block: `SWS_EXIT`, `sws:ready`, never `history.back()` in a frame, no service worker registration inside the portal frame | copy verbatim | `satellites/ripcord/src/play-shell.html` ~4225 |
| Music include and the milestone call | one line + one call | `<script src="/music-unlocks.js" defer>` and `SWSMusic.milestone(n)` at match end, as Conduit does |
| The ceremony runner: a queue of beats that fade in, hold to be read, fade out; one thing at a time; cards built in `onEnter` at the moment shown; the advance button fires in a finally | copy the shape and its three scars | `satellites/ripcord/HANDOFF.md` §4c |
| Meshy → Blender fit → gltfpack pipeline for sculpted pieces (grails, boss showpieces, Foundry and Glacier) | reuse the tools; Stephen drives Meshy | `satellites/ripcord/docs/FORGE3D.md`, `tools/forge3d/meshyfit.py`, `arena.py` |
| Ladder shape: leagues, rungs, bosses that refute one strategy and yield to another, a boss test that proves both | data shape and the test idea | `satellites/ripcord/src/ladder.json`, `test/bosstest.js` |
| Design DNA | already in DESIGN §6 | |

**What lifts BACK to Ripcord later, and is the reason the two games go hand in hand.** Keepsies is built around two interfaces Ripcord's VR pilot needs and does not have: `AimSource` (one struct for touch, controller flick and hand tracked thumb) and `CameraRig` (`update(dt)`, `getRay(pose)`, an `XRRig` implementation). `docs/VR-PILOT.md` describes Ripcord's VR as "a new camera and a new hand". Build Keepsies' `render/xr.js` and `input/knuckleXR.js` as self-contained modules with no Keepsies imports beyond those two interfaces, and Ripcord's pilot copies them. Same for the arena environment lane: Stephen wants more worlds for Ripcord matches (his Sep 03 notes); Keepsies' Foundry and Glacier are authored through the same forge pipeline, so an arena is a glb plus a lighting preset in both games. Not in this handoff, noted so the interfaces are drawn to allow it.

---

## 4. CORRECTIONS TO THE DESIGN (binding; each one was forced by a measurement or a fleet law)

### 4.1 Physics: add rolling resistance, retune, and make sleep real (DESIGN §5.1, §5.4)
Rapier has no rolling resistance. Linear damping is `v *= 1/(1 + dt*c)`, which never reaches zero and never lets a marble carry. Measured: the spec's break knocks nothing out and every marble is still awake at six seconds (section 2). The fix is a per-step force in `core/physics.js`, applied to every awake marble in contact with the floor:

```
F = -min(mu_r * m * g, |v| * m / dt) * v_hat      (the min stops it reversing a slow marble)
world.step():  body.resetForces(true) THEN body.addForce(F)   ⛔ addForce is PERSISTENT in Rapier; without resetForces it accumulates every step and brakes everything to a stop (my first sweep did exactly that, kept as probes/03_sweep_run1_BUGGED_persistent_force.txt so nobody repeats it)
```

Initial numbers, all in `tuning.json` (replace DESIGN §5.1 and §5.3 dirt row):

| name | value | why |
|---|---|---|
| `rollingMu.dirt` | 0.02 | the one value where a 4 m/s centre shot puts 1 to 3 mibs out AND every body sleeps by 8 s (sweep run 2, 6 seeds). 0.01 still moves at 8 s; 0.04 knocks nothing out |
| `rollingMu.polished` | 0.008 | arena floors carry further, tune in K3 |
| `rollingMu.ice` | 0.002 | |
| `rollingMu.sand` | 0.06 | |
| `linearDamping` | 0.02 | numerical only; feel comes from rolling resistance now |
| `angularDamping` | 0.02 | |
| `surface.dirt` | friction 0.55, restitution 0.35 | unchanged |
| `material.glass` | density 2500, restitution 0.78, friction 0.30 | unchanged; note Rapier combines friction by average, so glass on dirt is 0.425 |
| `breakSpeed` (scenario) | 4.0 m/s | 0.64 of the 0.5 to 6.0 launch range; DESIGN's 3.5 knocks out nothing at any tested setting |
| `diameterMm` | mibs 16, taws 22, peewee 12, arena oversize cap 35 | DESIGN §4; the cap lives here so no catalog entry can exceed it |
| `sleepLinear` / `sleepAngular` | 0.02 m/s / 0.5 rad/s | your own asleep test on top of Rapier's; "resolved" means all marbles under both thresholds for 0.5 s, or the 6 s cap |
| CCD | on for any marble whose speed exceeds 2 m/s | unchanged |

**The scenario `ringer_break` is redefined**: a 4.0 m/s clean snap through the centre mib (aim jitter ±0.5°, seeds 1 to 200) → mibs out in [1, 3] on ≥80 percent of shots, taw position irrelevant, all bodies asleep by 8 s on 100 percent. **The taw staying inside is not this gate.** In the sweep the taw exits on essentially every plain break at every setting that knocks a mib out, and that is what real marbles do: staying in is the STICKING technique (backspin), which has its own scenario. DESIGN's "taw remains inside on ~50 percent" becomes a property measured across a shot distribution that includes backspin, reported by the harness, not a tuning target.

### 4.2 Determinism: the deterministic build, and a JS math law (DESIGN §4, §22, §25)
Vendor `@dimforge/rapier3d-deterministic-compat@0.20.0`, not the plain compat build. Phase 4 (both clients simulate, a Cloud Function verifies state hashes) is a lie on the plain build the moment two phones differ in architecture. Everything the JS side adds to the simulation (rolling resistance, spin from AimSource, specials) uses only `+ - * /` and `Math.sqrt`. **Never `Math.sin/cos/atan2/hypot/pow/exp` inside `core/`**: engines are allowed to differ in the last bit and the replay hash would drift between an Android and an iPhone. Put a small table-free polynomial `core/dmath.js` (sin, cos, atan2 to ~1e-9 using only the four operations and sqrt) and use that. The harness's `replay_hash` scenario proves (seed + input log) → identical hash across two Node runs from K0; the cross-device proof is a Phase 4 gate that needs two real phones.

### 4.3 AI think budget: a Worker, a deadline, and snapshots (DESIGN §13.4)
The arithmetic: a candidate shot resolves in roughly 300 steps at 1/120 (2.5 s of marble time with rolling resistance 0.02); one step of 14 bodies is 0.41 ms here. Shark's 24 candidates = 3.0 s on this box before the phone's 2 to 3x. The 1.2 s wall clock cap stands, so:

- The planner runs in a Worker (`game/ai.worker.js`) that imports the same `core/` modules. Never on the main thread.
- `world.takeSnapshot()` once per turn; each candidate is `World.restoreSnapshot(bytes)` plus the impulse, never a rebuilt world.
- Candidate steps at 1/60 with early termination (all under sleep threshold, or 2.0 s of marble time). The planner's coarse step is allowed to differ from the match step because it is a guess, not the record; the match always resolves at 1/120.
- Sample until the deadline, keep the best so far. Difficulty sets N as a ceiling, not a promise: Rookie 6, Sharp 14, Shark 24, and the quality scaler halves them on Low.
- Score = mibs out (Ringer) or damage dealt + ring-out chance (Arena) minus self risk minus pot exposure, per DESIGN. Persona behaviours (Dusty over-snaps when down, Marlene hunts taws, Pit Boss favours hazard cycles, Ironsides never swaps, Curator adapts) are scoring weights in `bosses.json`, not code branches.
- Gate `ai_budget`: 100 Shark turns in Node; gate on counts and ratios, never a bare millisecond (rule 0.6): at least 8 candidates evaluated in every turn, and elapsed divided by the deadline at most 1.1 in every turn. Watched to fail by setting the deadline to 50 ms.
- **Batch mode is a different animal.** The Practice Ring (200 Arena rounds) and the harness batches (`arena_shape`, `boss_ladder`) run both sides as AI; at the live deadline that is 16 to 28 AI turns per round, 200 rounds, roughly half an hour on this box. Batches therefore use `ai.plan(state, {batch: true})`: a fixed small N (4), a 1.0 s marble-time cap per candidate at 1/60, no deadline. It is a guess, not the record, and its win rates are what the Practice Ring reports. Gate `practice_budget`: 200 batch rounds complete under a stated wall time on this box (write the measured number into the gate, gate on 1.5x it). `arena_shape` and `boss_ladder` are marked slow and fast mode SKIPS them with a note, the Ripcord pattern.

### 4.4 No CDN, vendored libs, versioned imports (DESIGN §2 "pinned CDN")
Fleet law: every runtime file is served from `lucidwinds.com`; the host edge caches aggressively and a bare URL is pinned for days (memory: HOST CACHING LAW; `feedback_htaccess_does_not_deploy`). Also Quest store packaging is a TWA that must stay on origin. So:

- `satellites/keepsies/lib/` is a copy of Ripcord's `assets/3d/lib/` WITH ITS SUBFOLDERS INTACT: `lib/three.module.min.js`, `lib/loaders/GLTFLoader.js`, `lib/environments/RoomEnvironment.js`, `lib/utils/BufferGeometryUtils.js`. GLTFLoader imports `../utils/BufferGeometryUtils.js` relatively (`GLTFLoader.js:68`), so a flattened copy breaks at load. Plus `lib/rapier.mjs` (deterministic-compat 0.20.0, the single file with wasm inlined). Byte frozen: never edit, never cache bust with a query on the lib files themselves; bump the FOLDER name (`lib-r161/`) if a version ever changes.
- **three.js is pinned at r161, not "latest stable" (DESIGN §2).** Reason: r161 is the build whose loading pattern, PMREM environment and GLTF path are proven in the fleet and byte frozen in the sibling; WebXR is in it; a newer three would have to re-prove all of that on a software rasteriser first. Revisit only if a K5 XR feature needs a newer API.
- Every relative import inside `src/` carries a version query in the COMMITTED source (`import { step } from './physics.js?v=20260904a'`), the aura-off model: the host serves committed bytes, so the stamp has to be in them. Node ignores the query (proven, section 2), so `core/` still runs headless from source. `tools/stamp.mjs --bump <build>` rewrites every `?v=` in `src/`, `index.html` and `manifest.json` to the new value and writes it to `src/version.json`; the `stamp` gate in `tools/check.js` asserts that every import in `src/` carries a `?v=` equal to version.json and that no file holds a stale one. ES module imports are separate URLs, a `?v=` on the entry does NOT propagate (memory `project_aura_off_aug29`); this is why every import carries its own.
- The import map in `index.html` maps `three` and `rapier` to the lib files. Nothing else is bare.

### 4.5 Hosting, PWA, service worker (DESIGN §2 "Firebase Hosting", §3 `sw.js`, §24 P2 "PWA install")
The game ships at `lucidwinds.com/satellites/keepsies/`, deployed by Fable with the rest of the branch. `manifest.json` yes (copy Tangent's shape, portrait, standalone, icons inline). **`sw.js`: not yours.** The studio has been taken down twice by service workers (a hung fetch never settling `respondWith` painting a black screen; `caches.keys()` being origin wide so workers deleted each other's caches). An offline worker is a Fable step after K2, driven through `scripts/sw_cache_scope_check.mjs`. Until then "offline" is a promise the game does not make in copy.

### 4.6 Sunbeams: the local wallet is the game's, the fleet hook is a separate line (DESIGN §2 "Currency")
DESIGN wants a local `SunbeamWallet` at 400 to 600 a day. The fleet's Sunbeams are a different scale: every satellite calls `window._sbCapEarn(n, tag)` (30 a day cap, defined per satellite, the SDK reconciles on sign-in) and the ad-network builder strips it. If both are called Sunbeams the player will meet two numbers with one name. Build per DESIGN (`meta/economy.js` wallet, `balance()/earn(n,reason)/spend(n,reason)->bool`, change event, localStorage) and name the currency in code `sunbeams` so a rename is one string table. Add the standard fleet hook at match end, `_sbCapEarn(2..6, 'keepsies:match')`, defined exactly the way `sproing.html:1864` defines it (30 a day, `sw_sb_keepsies` key, forwards to `Sunbeam.earn` if the SDK is present). The two never convert. **OPEN #9 for Stephen: the in-game currency's player-facing name.** Until answered, the UI says "Sunbeams" per DESIGN and the fleet hook pays quietly.

### 4.7 Layout: the fleet's folder shape on top of DESIGN §3
DESIGN §3 stands (`src/core`, `src/render`, `src/input`, `src/game`, `src/meta`, `src/audio`, `src/data`, `sim/`). Add, because every satellite has them and the tooling expects them: `lib/` (4.4), `test/` (browser gates: `render.mjs`, `playthrough.mjs`, `knuckle.mjs`), `tools/` (`check.js`, `stamp.mjs`, `shots.mjs`, `make_thumb.mjs`, `catalog.mjs`), `docs/` (`DESIGN.md`, `DECISIONS.md`, `shots/`, `checklists/`), `ART_ASSETS.md`, `PLAYTESTS.md`, `HANDOFF.md` (the in-folder state file, like Conduit's). `DECISIONS.md` moves into `docs/`. Icons `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` (generate procedurally in `tools/`, a marble on dirt).

### 4.8 The catalog is generated from the design tables, not typed twice (DESIGN §10 "generated from tables in this doc")
`tools/catalog.mjs` reads `docs/DESIGN.md` §10.2 to §10.7 and writes `src/data/marbles.json`. Three of those sections are not plain tables and the generator must handle each: §10.2's Cat's Eye row packs six marbles into one row (expand it), §10.3 is bold prose under group headings (parse the bold names, the heading gives the class), §10.4 to §10.7 are tables. The doc stays the source of truth for names, tiers, classes, passives, actives and lore. The gate `catalog` fails if the JSON is stale against the doc or if any count is off: 14 + 20 + 14 + 8 + 4 = 60 designed, plus 5 boss signatures = **65 entries** (DESIGN's heading "65 designed marbles" already counts the signatures). Fields the tables do not carry (recipe parameters, palette, hardness, density overrides) live in a sidecar `src/data/marbles.overrides.json` merged by id, so a tuning change is a data change and the doc is never edited for numbers.

### 4.9 Conditions: ship six, and which one to cut (DESIGN §9.5, OPEN #4)
Recommendation to Stephen, not a decision: cut `on rail/bumper touch`. The Ring arena has no rail, so the condition is dead in one of three arenas and a player who programs it there has been misled by the UI. `on Nth enemy contact` works everywhere. Build all seven behind data (`conditions.json` with an `enabled` flag) so the cut is one boolean when he answers; the `condition_matrix` scenario runs whatever is enabled.

### 4.10 Onboarding meets the studio standard (DESIGN §16)
DESIGN's first session is excellent and keeps its order. Two additions the fleet requires: a rules card before the first Ringer game (objective, the turn rule, the win condition, three lines, dismiss to play) because directions must be shown before play starts, and the "I've played marbles before" skip is a real button at 48 rendered px, not a small link.

### 4.11 The fleet music include overrides two FINAL lines (DESIGN §2 "do not import other studio code", §19 "no music in-match")
Every listed satellite carries `<script src="/music-unlocks.js" defer>`: it is the Director's fleet-wide soundtrack ladder (Sep 02), it never autoplays, and the player chooses to open it. The game itself still ships no music of its own in-match, which is what §19 means. The chip is the fleet's floating, foldable card; a brace hides it (one class on the body while braced) so it never sits under a thumb.

### 4.12 Phases carry the fleet gate ritual (DESIGN §24)
DESIGN's phases P0 to P5 keep their scope and numbering; section 6 restates them with the gate that must be watched to fail, the screenshots, and the commit. P4 (online) and P5 (VR) are NOT in this handoff: P4 needs Firebase rules and a Cloud Function, which are Fable and Stephen; P5 needs a headset in Stephen's hands.

---

## 5. ARCHITECTURE LAW (binding, from DESIGN §3 and §21 plus the fleet)

1. **`src/core/` imports nothing from `render/`, `input/`, `three`, or the DOM.** It runs in Node unchanged. The harness, the AI Worker, the Practice Ring Worker and (Phase 4) the server run this exact code. This is the spine; a DOM reference in core is a build failure (`tools/check.js` greps for it).
2. **The renderer owns nothing.** It reads state and draws. It never writes a body, a rule, a score. A rule that lives in a renderer will one day disagree with the test that says the rule is fine (Ripcord learned this; it moved its modes into the sim).
3. **All input becomes an `AimSource`** (`{origin, dir, power01, contactOffset:{x,y}, pathCurvature, wildness01, braced01, warmed}`) before core sees it. `core/snap.js` is the only place an AimSource becomes an impulse and an angular velocity. Touch, pull-back fallback, replay logs, AI and (later) XR all produce the struct. Game code never sees a raw pointer.
4. **All cameras live behind `CameraRig`** in `render/scene.js` (`update(dt)`, `getRay(pose)`, `project(x,y,z)`). Orbit, top-down, shot cam, inspect and (later) XR are implementations. Game code never touches a camera.
5. **All randomness flows through `core/rng.js`** (mulberry32, seeded, one stream per subsystem: `match`, `drops`, `cosmetic`, `ai`). `Math.random` inside `src/` fails the determinism gate, which injects it on purpose to prove it can catch it.
6. **Fixed step 1/120, render interpolation, at most 8 substeps per frame**, the accumulator capped so a background tab does not eat the world when it returns.
7. **Every number in `src/data/tuning.json`.** A literal physics or balance constant in a `.js` file is a review failure. The harness loads the same file.
8. **`meta/save.js` is the only module that touches storage.** Versioned schema, migration chain, read-modify-write merge on every write (unlocked marbles union by uid, counters add, bests max), `storage` event listened to, destructive wipes bypass the merge. Escrow is written with `inMatch` BEFORE the first turn.
9. **Metric scale, never broken.** 1 unit is 1 metre, marbles are 16 and 22 mm, the ring is 3.05 m. VR is real size at your feet because nothing ever cheated.
10. **No frameworks, no bundler.** ES2022 modules, the import map, `tools/stamp.mjs` for the build stamp. JSDoc on every exported function in `core/`.
11. **Never sacrifice:** input latency, physics determinism, the inspect turntable's beauty (DESIGN §20).

---

## 6. THE PHASES

Each phase: scope, the files it may create, the gates (written first, watched to fail), the screenshots, the phone checklist, the commit. **The phone checklist** (DESIGN §0.3): each phase writes `docs/checklists/kN.md`, ten lines of what to try on a phone and what should happen; the builder cannot run it, Stephen runs it when he wakes, and his notes become the K1.5 feel pass. Phases run back to back; nothing here waits on a human. Fable diffs each phase when it lands, runs the gates alone, looks at the shots, and deploys. Do not start a phase before the previous phase's ledger box is full.

### K0: Skeleton, physics, the harness that fails (DESIGN P0)

**Scope.** The repo shape (4.7), vendored libs (4.4), `core/physics.js` with rolling resistance and sleep (4.1), `core/rng.js`, `core/marbleBody.js` (density x volume, never mass), `sim/harness.js` with scenarios `ringer_break` and `replay_hash`, one marble on a dirt disc rendered with an orbit camera, one synthesised impact, the embed protocol block, `manifest.json`, the dev hook, `tools/check.js`, `tools/stamp.mjs`, `tools/shots.mjs`.

**Order, and it is the order because feel is validated numerically before visually (DESIGN §5.4):**
1. `tools/check.js` with one gate, `harness`, that runs `node sim/harness.js --scenario=all` and wants the line `SIM OK`. Run it. It fails (no harness). Paste the failure. Commit "keepsies: the gate, failing".
2. `core/rng.js`, `core/physics.js`, `core/marbleBody.js`, `src/data/tuning.json` with the 4.1 table. `physics.js` API: `createWorld(tuning) -> W`, `addMarble(W, catalogEntry, pos, uid) -> id`, `addSurface(W, {kind, mesh|disc})`, `impulse(W, id, {lin, ang})`, `step(W)` (one 1/120 step: reset forces, rolling resistance, `world.step`, sleep bookkeeping, contact events into `W.events`), `resolved(W) -> bool`, `snapshot(W) -> bytes`, `restore(bytes, tuning) -> W`, `hash(W) -> string` (positions, rotations, velocities, sleep flags, quantised to 1e-6 and concatenated, FNV-1a). Contact events carry `{a, b, relSpeed, normal, point, t}`; everything downstream (damage, audio, techniques) reads events, never the world.
3. `sim/harness.js`: loads tuning and a scenario JSON (`{name, ring, surface, marbles:[{id, catalog, pos}], shots:[AimSource|{seed, ai}], seeds, asserts}`), runs seeds, prints one line per assertion, exits non-zero on any miss, and with `--csv <path>` writes one row per game for AI-vs-AI batches: winner, turns, shot powers, integrity curves (DESIGN §22). `ringer_break` per 4.1. `replay_hash`: 20 seeds, a scripted 6 shot input log, two independent runs, hashes equal; then a run with `Math.random` monkey-patched into `physics.step` must produce a different hash and the harness must SAY so (this is the self test).
4. Now render. `render/scene.js` (renderer, PMREM + RoomEnvironment, `CameraRig` interface, `OrbitRig`), `render/marbleMesh.js` with the fake glass FIRST (matcap + fresnel, DESIGN §20 "build the fake first, it is the workhorse"), one marble at 22 mm on a 3.05 m dirt disc, `render/quality.js` stub returning Medium. `input/cameraCtl.js` one finger orbit, pinch zoom. `audio/synth.js` with one glass impact voice driven by a contact event's `relSpeed`. Tap the screen: the marble gets an impulse and you hear it.
5. `index.html` shell: the import map, `src/main.js` boot, a title screen with PLAY and one rules line, the embed protocol block copied verbatim from Ripcord, `window.KEEPSIES_DEV` behind `?keepsiestest=1` exposing `{ state(), tick(n), snap(aimSource), scenario(name) }`, the `_sbCapEarn` definition (4.6).
6. `test/render.mjs` (the black soap gate from Ripcord's `test/battle3d.mjs`): boots the page under swiftshader at 375x667 dpr 2, waits for the first frame, asserts the canvas is not one colour, taps, asserts two shots 600 ms apart differ, zero page errors. Add it to `check.js` as a browser gate that is skipped with a note when puppeteer is absent, never failed.
7. `tools/shots.mjs` (from Ripcord's), `tools/stamp.mjs` (4.4), icons. The K0 title screen (step 5) is a placeholder: K2 replaces it with calibration and Home, and from then on the Quest pointer path into play is Home's PLAY.

**Gate:** `node tools/check.js` prints `ALL GATES PASSED` with gates `harness`, `render`, `stamp`. Each watched to fail once (rolling mu set to 0.04 fails `ringer_break`; a `Math.random` in step fails `replay_hash`; a black `clearColor` with no lights fails `render`).
**Shoot:** the marble on the dirt at 375x667 and 320x568, and from below the floor. Three faults each in the ledger. Likely faults, name them if you see them: the disc edge is a hard line against void (there is no world yet, say so), the marble has no shadow contact (ambient occlusion is a K1 pass), the fake glass reads as plastic (tune fresnel power before K1).
**Commit:** "keepsies K0: physics that passes its own break, harness, one marble rendered and heard".

### K1: Ringer is fun on a phone (DESIGN P1)

The phase that has to feel right. Overnight, the builder's own judgement stands in for Stephen's: the `knuckle` gate numbers, a described shot of the brace and the break, and one line in the ledger saying what a fast flick, a slow push and a hooked snap each did. K2 follows on the same night. Stephen's phone notes, when they exist, are **K1.5**, a feel pass that reopens `input/knuckle.js` and `tuning.json` and nothing else, and it runs before K3 is called done.

**The Knuckle (`input/knuckle.js` → `core/snap.js`).** One continuous gesture, three layers, exactly DESIGN §7. Implementation detail the design leaves to you:
- *Brace.* `pointerdown` within 1.6x the taw's screen radius starts a brace. Sample the touch point at every `pointermove`; jitter = RMS of displacement over the last 600 ms. Cone half-angle = `lerp(6°, 1.5°, settle01)` where `settle01` rises linearly over 1.2 s of jitter under 2 px and falls by 0.5 on any move over 8 px. Haptic `settle` at settle01 = 1 (navigator.vibrate 8 ms where present). The reticle is a ring around the taw whose radius breathes with the cone. While braced the HUD shows: aim line (direction only, 0.35 m long, no path), charge meter, threat shimmer.
- *Snap.* Power comes from the sampled velocity of the touch over the final 90 ms before `pointerup`: keep a ring buffer of `{x, y, t}` from `pointermove` (and `getCoalescedEvents` where available, which is where the real 120 Hz samples are), velocity = displacement over the samples inside the last 90 ms divided by their time span, in CSS px per ms converted to screen metres per second using `window.devicePixelRatio` and a 0.264 mm per CSS px assumption. Map `thumb01 = clamp((v - 0.2) / (calib.max - 0.2))` then `power01 = 1 - (1 - thumb01)^1.6` (ease out, the top 20 percent of effort buys the last 12 percent). Launch speed `0.5 + 5.5 * power01` m/s. Under 0.35 m/s thumb speed → cancel, return to brace, no turn consumed. 0.35 to 0.6 → the legal soft nudge.
- *Contact and path.* The snap path is the polyline of the last 90 ms. `contactOffset` = where the path crosses the taw's screen disc, in taw radii, {x: side, y: vertical, both -1..1}; if the path never crosses the disc, offset is the nearest approach clamped to the rim. Spin: backspin `= -offset.y * k_back`, topspin `= +offset.y * k_top` (below centre is back, above is top), side english `= offset.x * k_side`. `pathCurvature` = signed curvature of the polyline (second difference over first, averaged); `wildness01 = clamp(|curvature| / k_wild)`. In `core/snap.js`: angular velocity = spin vector scaled by launch speed; wildness adds `wildness01 * k_wildSpin` to spin magnitude and rotates the spin axis by a seeded noise term (rng stream `match`) of up to `wildness01 * 25°`; the direction cone is `cone * (1 + wildness01)`. All `k_` in tuning.json.
- *Warming.* While braced, a low frequency circular rub (arc length over the last second at least half the taw's screen circumference, angular velocity under 2 rev/s so it is not jitter) adds `+4` charge per turn max and plays the shimmer. `warmed: true` on the AimSource.
- *Calibration.* Onboarding step 1 and Settings: three hardest snaps, the 90th percentile of the three is `calib.max` (per profile). Handedness: the side of the screen the first brace lands on mirrors the UI.
- *Aim and camera.* Aim direction is camera forward plus the snap's fine angle inside ±25°. Orbit with the off hand or before bracing. A second finger planted anywhere else during a brace is **knuckling down**: cone floor x0.6, power cap 0.9. Bombing (house rule on, taw inside the ring): brace on the taw, snap toward the bottom of the screen = a drop shot, the marble is lifted 0.25 m and released with the snap's speed downward and the fine angle across the floor.
- *Forgiveness.* Slips (one redo per player per game, house rule). Rookie Assist at levels 1 to 3 draws the first 0.4 s of predicted path from a `core/` preview step on a snapshot; never in ranked (DESIGN §7.8).
- *Pull-back fallback* (`input/pullback.js`): drag from the taw, release; power from drag length, spin from a second finger's offset; produces the same AimSource with `wildness01 = 0`; the match is flagged `assist:'pullback'` in its record. Copy never shames it.

**Gate `knuckle`** (`test/knuckle.mjs`, browser): synthesise pointer sequences with `page.touchscreen` and timestamps and assert the AimSource the game produced: a straight fast flick through centre gives power01 above 0.8 and wildness under 0.1; the same path at a quarter of the speed gives under 0.3; a flick under the marble's centre gives negative offset.y; a hooked path gives wildness over 0.5; a 0.3 m/s tap cancels and the turn count does not change. Evidence, not `el.click()`: the brace is proven by `elementFromPoint` at the taw's screen centre being the game canvas.

**Ringer referee (`core/rules-ringer.js`).** Pure state machine, headless. State: `{phase: lag|turn|shot|resolve|over, players:[{taw uid, pocketed:[], slipsLeft, poisoned}], turn, ringR, mibs:[uid], houseRules, log:[]}`. Transitions:
- `lag`: both roll toward a line at `ringR + 0.3` from a fixed spot; closest to the line without crossing shoots first; ties reroll; skippable → `rng.match` picks.
- `turn`: the player places the taw anywhere on the ring edge (a drag along the edge arc) if it is their first shot of the turn or if their taw is outside; else it shoots from where it lies.
- `shot` → physics until `resolved`. Then `resolve`: any mib whose centre is beyond `ringR` is pocketed by the shooter and removed; if any was pocketed the same player shoots again (`shootAgain` event), else the turn passes. If `poison` is on and the taw of the opponent was knocked out (centre beyond `ringR`): it is out for the game and the shooter takes one of the opponent's pocketed mibs. A taw that leaves the ring on its own shot comes back to the edge for its next shot, no penalty (real rule). `slips`: DESIGN leaves "fumble" undefined and this plan does not define it for you. Two honest triggers exist: the pointer left the canvas mid-snap, or the snap landed in the cancel band and the player wants the brace back. Pick one, keep it out of the legal nudge band (0.35 to 0.6 m/s is a real shot, DESIGN §7.8), keep it pre-commitment rather than a mid-action button, and log the choice in `docs/DECISIONS.md`; once per game.
- `over` when a player holds 7 of 13, or the ring has fewer mibs than the leader's opponent could still need (a draw is impossible with 13 and 7, state it in a comment). Draw only on abandon.
- Every transition appends to `log` (the technique detector reads it). The referee never touches physics; the mode controller (`game/ringer.js`) feeds it events.

**Ringer setup (`game/ringer.js` + the setup screen).** House rules toggles per DESIGN §8.3 with quickplay defaults (keepsies on vs AI, slips on, bombing off, poison off, 10 ft), ring size 7 / 10 / 13 ft. Keepsies visualisation (§8.4): the pot marbles are placed IN the cross, pot first then commie filler to 13, and the cross always has 13.

**Rookie AI** (`game/ai.js` + Worker): per 4.3, N = 6, 60th percentile candidate, ±8° noise on the direction, no backspin.

**Procedural marbles for K1** (`render/marbleMesh.js`): recipes `clay`, `clearGlass`, `catsEye(vaneCount, colour)`, `steel`, enough for the starters and the cross (commies are a seeded mix of clay and glass). Fake glass tier only. The inspect turntable is K2.

**Dirt ring environment** (`render/arenaEnv.js`): a 3.05 m ring drawn on a 6 m dirt disc, a chalk line, a soft horizon fog so the edge is not a hard line against void (K0's fault), one key light with a soft shadow on Medium and above. Camera per DESIGN §8.5: elevated 35° behind the taw auto-framing taw and cross, pinch zoom, one finger orbit outside the marble, a top-down tactical toggle button (48 px), shot cam on hard snaps on Medium+, skippable by tap.

**Audio (K1 scope of DESIGN §19):** rolling loops per marble (filtered noise, cutoff and gain from contact speed on the surface's curve: dirt hisses, polish whirs, ice is near silent), the material impact banks (glass 3 to 5 high Q modes 1.8 to 6 kHz with a per-hit seeded detune, clay damped 300 to 900 Hz, steel ringing inharmonic partials, stone between), pitch inversely with diameter, the warming shimmer, a master limiter, and the 1.5 ms per frame CPU budget with the degrade order (rolling loops drop first). Gate `audio_budget` in Node: render the graph offline for a scripted break and assert voice counts and that the limiter engages; there is no listening gate, so the builder listens once per phase and writes what was heard in the ledger.

**Pass and play:** two local profiles on one device, a profile switch at match setup, the referee alternates whose calibration applies. **Techniques (Ringer set):** `Sticking`, `Bombing`, `Dirty English`, `The Lag`, `Knuckled Down`, `Clean Sweep`, `Poison Pen` detected from the referee log in `core/techniques.js`, first-earn stored per profile, the toast is a freeze frame 0.4 s with the name (K2 gives it the ceremony voice; K1 ships a plain card).

**HUD (Ringer):** top: pocketed count each side (7 to win) as seven small sockets that fill; the house rules in one line of icons; the turn owner. Bottom: nothing during a brace except the reticle; a top-down toggle and a pause at the corners (48 px, above the safe area). The music chip is the fleet's and floats.

**Gates:** `harness` gains `sticking` (a scripted backspin AimSource, offset.y = -0.7, into a single mib at 0.5 m stops the taw within 0.1 m of the struck mib's original position on at least 70 percent of 200 seeds; watched to fail by zeroing `k_back`), `ringer_rules` (a Node test that plays 500 AI-vs-AI games through the referee, asserts every game ends, 7 pocketed by the winner, shoot-again fired whenever a mib exited, poison only when on), `knuckle` (above), `playthrough` (`test/playthrough.mjs`: boot, skip onboarding via a dev flag, set up a quickplay Ringer vs Rookie, play to the end with scripted flicks, assert the result screen and that the save recorded one match; then the same with pull-back on).
**Shoot:** the brace with the reticle settled, the moment after a break with mibs scattering, the top-down view, the results card, all at both sizes. Then the worst angle: camera at the ring edge looking out.
**K1.5, when Stephen's notes exist:** he plays three Ringer games on his phone and writes what he felt in `PLAYTESTS.md`. If the snap does not feel like a snap, K1.5 reopens the Knuckle until it does, whatever the gates say. The builder checks `PLAYTESTS.md` at the start of every session and runs K1.5 the moment there is an entry.
**Commit:** one per subsystem (knuckle, referee, ai, env, hud, techniques), each with gates green.

### K2: The collection and the economy close the loop (DESIGN P2)

**Catalog.** `tools/catalog.mjs` (4.8) → `src/data/marbles.json`, 65 entries. Every entry renders: recipes per DESIGN §10.1 (`clay, clearGlass, catsEye, swirl, corkscrew, patch, slag(seeded), steel, agateBands, onionLayers, lutzSparkle`) as shader materials on a sphere, plus one custom shader per epic (Galaxy, Molten Core, Glacier, Thunderhead, Deep Sea, Obsidian Knapp, Bioluminous, Nebula Swirl). Grails and the Curator's First Marble are glb sulphides: build ONE low-poly placeholder figure (a kneeling knight, under 2k tris, Blender script in `tools/forge/`) inside a clear sphere to prove the glb lane end to end (load on first use, LOD, dispose, inspect turntable). Marble glbs and any textures are lazy: nothing in `assets/models/` loads until first inspect or first match use, and the procedural sphere shows until it arrives (DESIGN §2). KTX2/Basis is deferred with a reason: three r161's KTX2 path needs a transcoder wasm and the 512 px PNG textures of five figures fit the budget; revisit only if K3's `budget` gate fails on texture memory; Stephen supplies Meshy figures later; `satellites/ripcord/tools/forge3d/meshyfit.py` is COPIED into `satellites/keepsies/tools/forge/` and adapted there for a marble's mount (origin at the sphere centre, scaled to the interior). The placeholder is a knight, not DESIGN §24's dragon, on purpose: the Ember Dragon is a real grail and a dragon placeholder would be mistaken for it (logged here as a correction). `tools/contact_sheet.mjs` renders all 65 in a grid at inspect quality and you LOOK at it: any two that read the same at 64 px are a fault to fix.

**Inspect turntable** (`meta/collection.js`): full screen, High materials even on Medium (a static scene), drag to spin, the marble at 140 px on the card, name, tier, class, lore line, passive and active text, integrity/hardness as words not numbers ("endures", "strikes"), the uid's provenance line ("won from Dusty Coyle, day 3"). Collection grid: 3 columns at 375, 96 px tiles, tier ribbon, a filter row (all, stakeable, showcased, by tier).

**Drops** (`meta/drops.js`, `src/data/droptables.json`): three pouches per DESIGN §11 with pity counters per pouch type stored in the save; dupes convert to dust = sunbeams with reason `dust`. Grail pouch: weekly cap 1, no dupe grails (reroll to highest epic). Gate `pity_math`: 100k pulls per pouch in Node converge on the table within 0.5 points and pity fires exactly at the 10th and 40th.

**Economy** (`meta/economy.js`): the wallet (4.6), faucets per DESIGN §17 (first win 150, match completion 15 to 40 by performance, three daily chores at 60 from `chores.json`, streak 3/5/7, technique first-earn 50, level-up level x20), the clay pool (10, regen to 10 daily; gate `clay_regen` steps the clock across midnight and across a missed week), ransom (24 h window per lost rare+, one offer, paid → the winner's wallet gets the sunbeams, unpaid → theirs). Daily reset is local midnight, computed from `Date` ONLY in `meta/`, never in `core/`.

**Keepsies loop** (`game/match.js`): ante flow per DESIGN §12.1 with the tier-matched rule (equal count 1 to 3, max one tier gap, no common vs grail) enforced in code with the reason shown when a stake is refused. Escrow: pot written to the save with `inMatch: true` BEFORE the first turn; on boot, an `inMatch` pot returns to both inventories. Gate `escrow_crash`: Node test that starts a match, kills the process after the escrow write, reloads the save, asserts every uid is present exactly once and nowhere twice. Winner takes pot. Draw or abandon returns it.

**Showcase Case** (`meta/showcase.js`): a real 3D room interior from day one, DESIGN §21.4: a shelf on a wall, six sockets (twelve after the one-time 2000 sunbeams), the marbles at real scale on small stands, a window light, an orbit camera that stays inside the room. Showcased marbles are unstakeable, unloseable, unplayable, and the collection grid marks them. The first rare a player acquires auto-showcases with the explainer.

**Ceremonies** (`render/ceremony.js`): the runner from Ripcord §4c. Ante: both stakes roll to the centre and clink into the pot, 0.6 s hero glint per rare+, a haptic tick per marble. Pot resolution: won marbles roll into your bag ONE BY ONE with a name card and a clink; loss: your marble rolls away, the ransom card slides in with the countdown if eligible. Technique toast in the voice. Give this the polish time DESIGN §18 asks for; it is the emotional core.

**Onboarding** (`meta/onboarding.js`): the six steps of DESIGN §16 plus 4.10, four minutes to the first real match, with `Dusty Coyle` and his tin. Skippable after step 2 for veterans.

**Progression** (`meta/progression.js`): XP and levels (120 x N, cap 30), the unlock ladder of DESIGN §17, level-up pays. Human keepsies (level 5) is a Phase 4 feature; at K2 the level 5 unlock shows pass-and-play keepsies.

**Save** (`meta/save.js`): the schema of DESIGN §23 at `v: 1`, async `load()/save()`, the two-tab merge (5.8), a `migrate` chain with a test that loads a hand-written v0 save.

**Settings:** calibration, handedness, pull-back fallback, Rookie Assist (auto off at level 4), reduced motion, haptics, audio, quality tier override, reset profile (writes directly, bypassing the merge).

**PWA:** `manifest.json`, icons. No sw.js (4.5).

**Gates:** `catalog`, `pity_math`, `clay_regen`, `escrow_crash`, `save_migrate`, `playthrough` extended (onboarding end to end with scripted snaps; open a pouch; stake a clay and lose it; see the ransom card on a rare via a dev flag; showcase one). **Shoot:** the inspect turntable on three marbles (a cat's eye, an agate, a grail placeholder), the collection grid, the ante ceremony mid-roll, the loss card, the showcase room from the door, then the room from inside a wall. **Commit:** one per subsystem.

### K3

- [x] **the damage model and the programmed actives** (`src/core/damage.js`, `src/core/specials.js`),
  which is where K3 starts because everything else in it hangs off them. Both are pure: no DOM, no three,
  no Rapier, so the whole condition matrix sweeps without a physics step.

  ⛔ **The marble is the health bar.** `integrity` is 0 to 100 per marble per MATCH and never persists
  to the collection: DESIGN 9.3 is final that an owned marble is never permanently damaged. A marble you
  lose at keepsies is gone; a marble you shatter in the Arena is back on the shelf, whole.

  ⛔ **Charge is earned on the damage that LANDED, not the damage that was rolled.** An overkill that
  hits a cracked marble for thirty pays for the five that landed. Otherwise the cheapest way to fill a
  meter is to keep hitting something already dead.

  ⛔ **An active takes BOTH halves.** Full meter AND condition met. A marble that fires on a full meter
  alone has no secret and one that fires on the condition alone has no meter to watch, and the meter
  being public while the condition is secret is the whole mind game of DESIGN 9.5.

  ⛔ **Six conditions ship, and `onRail` is the cut**, exactly as DESIGN 9.5's own margin allows. It is
  the only one a player cannot deliberately arrange for an opponent to walk into. It is written, marked
  `shipped: false`, and left out of `SHIPPED`, so the cut is visible and reversible.
```
  ok    1. at or below the 1.2 m/s floor a hit does nothing at all
  ok       and above it the formula is the design's: a 3 m/s glass hit does 0.53 damage
  ok       and it caps at 35, however hard you hit
  ok    2. the same hit does 3.2 to Mercury at 0.8 hardness and 1.8 to a steelie at 1.4
  ok       and the ratio is exactly the ratio of their hardness: 1.750
  ok    3. 70 is still pristine and 69 is chipped, which is the design's band
  ok    4. glass finishes a cracked marble it could not otherwise reach, and the bonus did it
  ok       and steel does not, because the bonus is glass only
  ok    5. defenders charge faster: 12 taken against 8 dealt, per ten damage
  ok       and an overkill pays for the 5 that landed, not the 6 that was rolled
  ok    6. burn over two seconds is 8.0 however often it is asked

  condition x event
    onFull      +cracked +contact3 +rail +close +bagmate +entered +nothing
    whenCracked +cracked .contact3 .rail .close .bagmate .entered .nothing
    nthContact  .cracked +contact3 .rail .close .bagmate .entered .nothing
    closeRange  .cracked .contact3 .rail +close .bagmate .entered .nothing
    onEntering  .cracked .contact3 .rail .close .bagmate +entered .nothing
    vengeance   .cracked .contact3 .rail .close +bagmate .entered .nothing
  ok    7. every shipped condition fires on its own event and on no other: 0 wrong cells in 42
  ok       and NONE of them fires on 99 charge, because it takes both halves
DAMAGE OK
```
  Watched to fail four ways: hardness multiplying instead of dividing, burn ticking on every call
  (42 damage in two seconds instead of 8), an active firing without a full meter, and an overkill paying
  for the roll rather than for what landed.

- [x] **`src/core/rules-arena.js`**: the turn machine, swap and re perch, ring out against shatter, and
  the win conditions. Pure, like the Ringer referee: it never touches physics, never touches the DOM and
  never draws anything.

  ⛔ **Nobody ever stands in an empty arena.** DESIGN 9.1 gives each player one active marble, and when
  that marble shatters the next legal one rolls in by itself: the CHOICE of which marble is the swap, not
  whether to have one. The gate found this by shattering an active and then asking that player to shoot,
  which threw rather than played.

  ⛔ **A rung out marble is not a lost marble**, and the gate says so at the limit: all three rung out,
  none shattered, and the match is still going. That is the whole difference between DESIGN 9.7's two
  win textures.

  ⛔ **Actives are read AFTER the damage**, so a "when it cracks" condition answers the hit that cracked
  it, in the same resolution rather than a turn later. A condition that can only respond next turn is a
  condition nobody would choose.
```
  ok    1. both sides roll a marble in before anybody shoots
  ok       the damage is still there a turn later, because the arena is a developing situation
  ok       and the hazard cycle counts TURNS rather than seconds, and never skips: 1, 2, 1, 2, 1
  ok    2. a swap rolls a benched marble in: a-1
  ok       and a second act in the same turn is refused: One move a turn.
  ok       and the marble that just entered shoots with no attack momentum, which IS the cost
  ok    3. a rung out marble goes to the rack KEEPING its integrity: 61
  ok       and with ALL THREE rung out and none shattered the match is STILL going
  ok    4. your own marbles do not damage each other: a-1 is at 100
  ok    5. the active is read AFTER the damage, so "when it cracks" answers the hit that cracked it
  ok    6. a bagmate shatters, and the survivors can read it
  ok    7. shattering all three ends it, with the right winner: player 0 after 3 turns
  ok       and a shot after the end throws rather than quietly playing on
ARENA OK
```
  Watched to fail four ways: friendly fire damaging your own bag, a ring out that heals the marble,
  unlimited positioning acts, and losing because your marbles were merely rung out.
- [x] **`src/game/arena.js`**: the mode on a real board, headless, sharing Ringer's Knuckle and its
  `aimToImpulse` exactly as DESIGN 9.2 step 3 requires. Two bugs in it were only findable by running it:

  ⛔ **`physics.fixedStep`, not `physics.hz`.** There is no `hz` in the tuning, so `1 / T.physics.hz` was
  NaN and `n++ < NaN` was false on the first test: the settle loop never ran a single step. The shot
  fired, the impulse landed on a body nobody ever integrated, and the next turn's impulse landed on top
  of it. The measurement said **720 shots and 0 contacts** and looked exactly like an AI that could not
  aim. The gate now asserts that EVERY shot moves its marble or rings it out.

  ⛔ **A contact event carries physics ids, not uids.** `addMarble` returns an integer; the referee
  speaks uids. Every ownership lookup missed, so a marble rolled straight through an enemy.

  ⛔ **The Arena AI states its HIT RATE and derives its angle from the geometry.** One enemy marble at
  two and a half metres is a 0.37 degree window, and Ringer's 0.8 degree shark noise misses all of it.
  Uniform error inside plus or minus N hits a w wide window with probability w/N, so N = w / hitRate.
  Rookie 0.35, sharp 0.55, shark 0.75; a sharp AI measures 54.6 percent.
```
  ok    8. the mode puts exactly the two ACTIVE marbles on the floor: 2 of six
  ok       EVERY shot moves its marble or rings it out: 24 of 24
  ok       and the AI connects: 11 of 24 shots touched an enemy marble
  ok       and after 24 shots every marble is still exactly one marble with a legal integrity
ARENA OK
```
- [ ] ⛔⛔ **`arena_shape` IS NOT PASSING AND IT IS NOT A BUG. It is a Director call, and it is the
  headline of this phase.** DESIGN 9.3 puts a 1.2 m/s floor under all damage and DESIGN 9.8 says The Ring
  reuses the Ringer environment, a 1.52 m radius with an edge drop off. Measured over 360 shots each:
```
arrive 3.6 m/s | hit 26% | ringouts 116% of shots | mean damage a hit 11.8
arrive 1.2 m/s | hit 48% | ringouts  21% of shots | mean damage a hit  0.0
arrive 0.6 m/s | hit 54% | ringouts   4% of shots | mean damage a hit  0.0
```
  **A hit hard enough to hurt is a hit hard enough to push both marbles off a ten foot ring, and a hit
  gentle enough to stay on it lands under the floor and does nothing at all.** There is no speed where
  The Ring is a shattering arena. And underneath that, a second one: at metric masses the formula does
  about one damage a hit, because a 16 mm glass marble is 5.36 GRAMS, so `3.8 x 0.00536 x 55 = 1.1`. A
  sweep of `damageScale` at 55, 200, 400, 700, 1100 and 1600 finished 0, 0, 0, 0, 0 and 3 matches of ten
  inside 120 turns, against a target of 8 to 14. Nothing has been changed: `damageScale` is 55 and
  `damageSpeedFloor` is 1.2, exactly as DESIGN writes them.
- [ ] the three arenas, the quality scaler, `tools/make_thumb.mjs`
- [ ] Sharp and Shark tuning, and the five bosses

## 15. THE OVERNIGHT PROTOCOL (how an unattended run behaves)

1. **Never wait on a human.** Every question that would have gone to Stephen becomes the smallest reasonable choice, logged in `docs/DECISIONS.md` as one line of what and one line of why. The open questions in section 11 stay open; the code takes the recommended answer where one is written and the design's default where none is.
2. **Phases run back to back.** K0, K1, K2, K3. A phase ends only with its ledger box full. There is no pause between phases and no pause for feel: K1.5 is where Stephen's notes fold in, whenever they arrive.
3. **A red gate after three honest attempts is BLOCKED, not fixed by force.** Write `BLOCKED: <gate>` in SESSION STATE with the last thirty lines of its output and the three things tried, then move to the next subsystem that does not depend on it. Never weaken a threshold, shrink a sample, delete an assertion or comment out a check to get green. A gate that was made to pass is worse than a red one, because the morning reader trusts it.
4. **Two cores.** Gates one at a time. The browser gates (`render`, `playthrough`, `knuckle`, `budget`) are the ones that flake under contention: a failure in the suite is rerun alone, twice; two passes alone is a pass and is written that way. At most two helper agents, only for reading or for a mechanical sweep, never for a judgement call, never in parallel with a gate.
5. **Commit and push after every green subsystem.** Small commits, each with gates green, each pushed. A night's work that sits uncommitted in a dead session did not happen.
6. **Context is a resource.** When the session is running long: finish the subsystem in hand, gates, commit, push, SESSION STATE with the exact next action (file, function, step number), the morning report, stop. The next session opens with the same prompt and resumes from SESSION STATE. Never start a subsystem you cannot finish and commit inside the context you have left.
7. **Screenshots still happen at night.** The ritual is the same: shoot from where the player stands, open with the Read tool, name three faults, write them down. The faults are the morning reader's first list.
8. **The design is not edited.** A number that has to change changes in `tuning.json`; a rule that has to change is a DECISIONS line and a note in the morning report, and the design line stands until Stephen edits it.
9. **Nothing leaves the fence.** If a fix seems to need a file outside `satellites/keepsies/`, it goes in the morning report as a request to Fable, and the game works around it tonight.
10. **Disk.** The box had 4.0 GB free on Sep 04. Scratch installs live under `/tmp`, renders and raw shots that are not evidence are deleted after they are read, and nothing over a few MB is committed except the two vendored libraries.

## 16. THE MORNING REPORT (write it before you stop, most recent on top, keep every one)

```
### Morning report, <date and time>
Phases: K0 <done|partial|not started> (<commit>), K1 ..., K2 ..., K3 ...
Gates: <the last full tools/check.js summary line, and which gates were skipped in fast mode if any>
Play it: <what is playable right now and how to reach it: the screen path from boot to a match>
Look at: <five docs/shots/ files worth opening first, one line each on what is wrong in them>
Decided without you: <the three most consequential DECISIONS.md lines, verbatim>
Blocked: <each BLOCKED gate with one line of why, or "none">
For Fable: <anything outside the fence, or "nothing">
For Stephen: <which open questions the night's choices leaned on, and the phone checklist to run>
Next action: <file, function, step, the first thing the next session does>
```

### Morning report, 2026-09-04, the second half of the night

**Phases:** K0 **done**. K1 **done but for pass and play**. K2 **done but for art**: the catalog, the
marbles' looks, the collection, the turntable, the economy, the three pouches, **the keepsies loop
itself**, **the pot ceremony**, **the ransom window**, **progression** and **the whole first four
minutes** are built. What is left of K2 is the glb lane and the eight per epic shaders, which are both
art rather than systems. K3 **started**: the damage model, the six programmed actives, the Arena
referee and the mode on a real board are in and gated. What K3 needs next is not code, it is a decision:
`arena_shape` cannot pass as the design is written, and why is the headline below.

**The headline: a marble is now genuinely at risk, you watch it change hands, and if you lose a good
one you get 24 hours to buy it back.** You put one up,
Dusty matches it, and the winner takes both. The stake leaves your inventory before a shot is fired, and
if the phone dies mid match the next boot hands it back. `escrow_crash` proves that by starting a real
child process, having it stake, and SIGKILLing it between the escrow write and the first turn. Then the
pot ceremony rolls the marble across the screen with its tier, its name, who it came off and its own
lore line, which is the difference between winning something and being told you won something. Lose a
rare or better and Dusty offers it back for 24 hours at the design's prices; the deadline is a timestamp
in the save, so it survives the tab being closed for 23 of them.

**Gates:** twenty one, all green, every one watched to fail on purpose. Nine are new tonight, and the
playthrough grew from twenty six assertions to sixty three: it now walks the first four minutes from
PLAY to the first game for keeps. `arena_shape` is deliberately NOT among them, for the reason below.
```
lint pass 0s · catalog pass 0s · stamp pass 0s · harness pass 13s · save pass 0s
clay_regen pass 0s · pity_math pass 0s · words pass 0s · escrow_crash pass 0s
ransom pass 1s · progression pass 0s · onboarding pass 0s · damage pass 0s
arena pass 1s · ringer_rules pass 0s · ai_budget pass 15s · ringer_ai pass 39s
render pass 40s · knuckle pass 18s · audio_budget pass 10s · playthrough pass 65s
ALL GATES PASSED
```

**Look at, in this order:**
1. `docs/shots/k1-setup.png` The ante. Your marble against theirs, and the sentence under it now names
   yours: "Your Dirt Plain against theirs. Winner takes both."
2. `docs/shots/k1-ceremony.png` The pot resolving. This is the one to look at.
   Then `k2-tin.png`, which is Dusty's tin with the three heirlooms on a cloth.
   Then `k2-loss-ceremony.png` and `k2-ransom.png`, which are the same moment from the losing side.
3. `docs/shots/k1-results.png` The card behind it. The pot is its first and largest row and it says
   which marble crossed the ring.
4. `docs/shots/k2-collection.png` Your marbles, all of them, no longer a peephole.
5. `docs/shots/k2-inspect.png` One marble on the turntable with its traits in words.

**⛔⛔ THE ONE THING TO DECIDE, STEPHEN: the Arena's damage floor and The Ring cannot both hold.**
Measured, not reasoned, over 360 AI shots at each speed:
```
arrive 3.6 m/s | hit 26% | ringouts 116% of shots | mean damage a hit 11.8
arrive 1.2 m/s | hit 48% | ringouts  21% of shots | mean damage a hit  0.0
arrive 0.6 m/s | hit 54% | ringouts   4% of shots | mean damage a hit  0.0
```
DESIGN 9.3 puts a 1.2 m/s floor under all damage. DESIGN 9.8 says The Ring reuses the Ringer
environment, which is a ten foot ring with an edge drop off. **A hit hard enough to hurt is a hit hard
enough to push both marbles off that ring, and a hit gentle enough to stay on it does literally nothing.**
There is no speed where The Ring is a shattering arena. Three ways out and all three are yours: the
Arena's ring is bigger than the Ringer's; or The Ring is bounded rather than open, which the Foundry's
own rubber bumpers already establish as a thing your arenas have; or the damage floor comes down, which
makes every gentle nudge chip a marble. Underneath it sits a second one: at real marble masses the
formula does about ONE damage a hit, because a 16 mm glass marble is 5.36 grams and `3.8 x 0.00536 x 55`
is 1.1, so a marble takes between ten and a hundred clean hits to shatter against your own target of 8 to
14 turns. **Nothing has been changed.** `damageScale` is 55 and `damageSpeedFloor` is 1.2 exactly as you
wrote them, and the sweep that says the scale wants to be in the low thousands is in DECISIONS.

**⛔ And still open from earlier: the Standard Pouch's printed odds and its felt odds are very
different.** Measured over a hundred thousand pulls. The table says 3.6 percent rare and 0.4 percent
epic. What a player actually gets is **10.16 percent rare and 2.71 percent epic**, because at a 3.6
percent base rate roughly seven of every ten runs of ten pulls contain no rare at all, so the pity
guarantee fires constantly: 6,554 of the rares and 2,285 of the epics in that run came from pity rather
than from the roll. Nothing is broken and both of DESIGN 11's statements are honoured at once. The pouch
is simply about three times more generous on rares and seven times on epics than its own table reads. If
the printed number should be the felt number, the pity window wants to be much longer than ten. Left as
the design writes it.

**Decided without you tonight, the three that matter:**
- *"⛔ a word ladder written by hand against a catalogue generated by machine will drift."* DESIGN 20
  shows weight and hardness as words, and nothing made the words agree with the marbles. The first
  weight ladder topped out at 25 grams over a game whose heaviest marble is 16.7 g, so **58 of 65
  marbles printed "barely there"**, every steelie included, and two of its four words could never
  appear. There is a gate for it now.
- *"⛔ a number written into prose is still a number."* That gate then went red on a rung that could
  never print, and the cause was upstream: DESIGN gives Mercury "−hardness (0.8)" and Kiln Kiss "agate
  hardness (1.3)" inside their passive text and nowhere else, so the code never saw either and the
  inspect card called Mercury "shrugs it off" directly above its own passive saying 0.8. The generator
  carries it now. Your number, unchanged.
- *"the ante has one door."* The screenshot run had been calling `start()` directly, so it staked a
  marble and then produced a result card reading "nothing was up" over a pot that really was selected. A
  test entrance that skips the escrow proves nothing about the escrow.

**Found by opening the pictures, not by any gate:** the result card called a marble taken off Dusty one
you "keep"; the setup screen showed six marbles with none of them marked, because the one you staked was
off the right hand edge of a strip that scrolls; and the collection was a scroll inside a scroll, three
and a half marbles of eighteen with the second row's names sliced through the middle.

**Blocked:** none.

**Still owed to you from the first half of the night:** `docs/checklists/k1.md` on your phone, and the
two questions it asks. Does the snap feel like a snap, and does the marble weigh anything. That entry is
K1.5 and the next session runs it before anything else.

**Next action:** your call on the Arena's ring, below. Everything else in K3 waits on it.

---

### Morning report, 2026-09-04, overnight

**Phases:** K0 **done**. K1 **done but for pass and play**. K2 **started**: the catalog and the marbles'
looks are finished, the economy is not. K3 **not started**.

**Gates:** thirteen, all green, every one watched to fail on purpose.
```
lint  pass 0s · catalog  pass 0s · stamp  pass 0s · harness  pass 16s · save  pass 0s
ringer_rules  pass 0s · ai_budget  pass 17s · ringer_ai  pass 46s · render  pass 34s
knuckle  pass 21s · audio_budget  pass 11s · playthrough  pass 26s
ALL GATES PASSED
```
Nothing skipped, nothing weakened, nothing left red. `ai_budget`, `ringer_ai` and `playthrough` are
marked slow so `--fast` skips those three and says so.

**Play it:** open `satellites/keepsies/index.html`. PLAY, then it asks for your three hardest snaps and
measures your thumb, then the rules card, then a setup screen where the house rules are five chips you
can actually change, then a game of Ringer against Dusty. Drag on the dirt to slide your shooter along
the ring; hold your thumb on it until the ring around it shrinks and turns gold; flick up through the
marble. Start the flick low on the marble for backspin, high for follow, off to one side for english,
along a curve for a wild one. Seven of thirteen wins.
`docs/checklists/k1.md` is your ten things to try and the two questions the build is asking.

**Look at, in this order:**
1. `docs/shots/k2-contact-sheet.png` All sixty five marbles. Opening this three times is what found the
   biggest art fault of the night, and what is still wrong with it is written under the K2 ledger box.
2. `docs/shots/k1-calibration.png` The first twenty seconds. A marble on dirt and one line, which took
   four attempts: the first buried it under three paragraphs on a black wash.
3. `docs/shots/k1-brace.png` The signature interaction, with Rookie Assist's dotted path. The reticle is
   still bigger than the marble inside it, because it is drawn at the thumb's 48 px grab radius.
4. `docs/shots/k1-break.png` The cross scattering. Nothing has a motion cue, so at twelve pixels a
   marble you cannot tell which ones are moving.
5. `docs/shots/k1-results.png` The loop closed. The card floats over a black wash and the technique sits
   in a table row next to Sunbeams, which undersells the one line meant to be a discovery. Both are the
   ceremony DESIGN 18 asks for, and both are K2.

**Decided without you, the four that matter most, verbatim from `docs/DECISIONS.md`:**
- *"⛔⛔ THE BIGGEST FINDING OF THE NIGHT: Rapier hard clamps angular velocity to pi/4 radians per step,
  and the floor contact is now ours."* Measured in a vacuum: 94.25 rad/s at 1/120, always exactly pi/4
  per step, no parameter for it. A 22 mm taw rolling at 2.6 m/s needs 236. **Every bit of backspin,
  topspin and english the design is built around was being silently thrown away at that ceiling**, and a
  sweep of `kBack` from 1.25 to 13 returned byte identical numbers. The floor contact patch is ours now;
  a smaller timestep and a scaled up world were both rejected, for breaking the 1/120 step and metric
  scale respectively.
- *"⛔ ALL TWELVE RECIPES EXIST NOW, AND THE CONTACT SHEET IS WHY."* Five shader modes existed and the
  catalog asked for twelve, so **thirty two of the sixty five marbles rendered as plain coloured
  spheres** and nothing complained: swirls with no swirl, slag with nothing turbulent in it, every epic
  and grail falling through to clear glass. No gate could have caught it. A picture, opened, did.
- *"rolling resistance 0.02 to 0.06, and the break from 4.0 to 4.5 m/s. This overrides two numbers the
  plan fixed."* The plan's 0.02 was measured while Rapier's own floor friction was quietly doing half
  the braking; with the patch model owning it, 0.02 brakes almost nothing and nothing in the scene slept.
- *"AI aim noise 8, 3, 1 degrees becomes 2.5, 1.5, 0.8."* A taw and a mib touch inside about 1.9 cm, so
  at a metre and a half a hit needs the aim inside 0.73 degrees. At 8 degrees a Rookie connected on 17
  percent of shots and dragged a game to 59 shots.

Two more numbers moved with their measurements written down: the thumb speed band 0.2 to 2.4 m/s became
0.35 to 1.2, because 2.4 m/s of screen travel is nine CSS pixels a millisecond and no thumb does it; and
Rookie Assist shows 0.25 s of path rather than the design's 0.4, because at ten foot 0.4 s reaches almost
the whole way to the cross and reads as the full trajectory DESIGN 7.1 forbids outright.

**Blocked:** none.

**For Fable:** nothing outside the fence was touched. When you card it: `beta: true` is right, and the
thumb does not exist yet because `tools/make_thumb.mjs` is a K3 item. `node tools/check.js` from
`satellites/keepsies/` is the whole story in four minutes. One near miss is recorded in SESSION STATE: a
heredoc without an absolute path wrote a Keepsies `manifest.json` over the repo root's own; it was
restored from git inside a minute and every shell call afterwards used absolute paths.

**For Stephen:** the night leaned on these and took the smallest reasonable answer to each.
**#10, the break power in the tutorial:** it wants a firm snap. 4.5 m/s puts one to three mibs out on 94
percent of two hundred seeds; the design's 3.5 knocks out nothing at any setting tested.
**#11, the ring size for the first league:** the seven foot ring is measurably easier, and it shows: in
the playthrough gate a player clears seven of seven in three shots at seven foot and loses six to seven
in nineteen shots at ten. Dusty's league may want ten rather than seven, or Dusty may want to be worse.
Both sizes are in `tuning` and the setup screen switches between them, so you can feel it.
**#9, the currency's name:** the results card says Sunbeams, per the design, and the fleet's own
`_sbCapEarn` pays quietly beside it. Two numbers, one name, still open.
Please run `docs/checklists/k1.md` on your phone and write what you felt in `PLAYTESTS.md`. The two
questions: does the snap feel like a snap, and does the marble weigh anything. That entry is K1.5 and
the next session runs it before anything else.

**Next action:** `src/meta/economy.js` does not exist. Build the wallet and the clay pool first, because
every other thing left in K2 spends from them: `balance()`, `earn(n, reason)`, `spend(n, reason)` over
`meta/save.js`, a change event, the faucets of DESIGN 17, and the clay pool at ten regenerating to ten
daily with the daily reset computed from `Date` ONLY inside `meta/`, never in `core/`. Its gate is
`clay_regen`, which steps the clock across midnight and across a missed week. Then `meta/drops.js` and
the three pouches with their pity counters, gate `pity_math`, a hundred thousand pulls per pouch
converging on the table within half a point. Then `game/match.js` and the ante, which is the point of
the whole game and does not exist yet.

---

## SESSION STATE (builder updates this at the end of every session)

**2026-09-04, Opus, overnight run.** K0 complete. K1 complete but for pass and play. **K2: the catalog,
the marbles' looks, the collection, the economy, the pouches and the keepsies loop are done**; what is
left of it is the ceremonies, the ransom window, progression, onboarding beats 2 to 6, the glb lane and
the eight per epic shaders. K3 not started. **Twenty one gates green**, each watched to fail, evidence
pasted in the ledger above. Twenty five screenshots opened and their faults named.

Commits, all pushed to `origin add-sproing-jumper`: `4b8d3043` the failing gate, `14a6bca0` physics and
harness, `58621d7e` the first rendered marble, `8b57d09c` the referee, `bbb7b629` the Rapier spin clamp
and the retune, `3b8f5e93` the Knuckle and the planner, `adbc1f42` the playable game, `dd551363` the
first morning report, `a81c51bb` calibration and the save, `1c3013ab` the sound, `df2f4d02` the setup
screen and the drop shot, `46befcb5` the catalog and the twelve recipes, `e25c6dd6` the morning report,
`597a9fec` the collection and the turntable, `92d98730` the ledger brought up to date, `b3d341fa` the
wallet and the clay pool, `c81d1a87` the pouches, `cd0dca5e` the pot and the escrow, `c249b460` the
words gate and the second look at every screen.

Nothing outside `satellites/keepsies/**` and this file was touched; `git diff --name-only 5a7315eb..HEAD`
outside those two paths returns nothing. One near miss worth recording: a heredoc without an absolute
path wrote a Keepsies `manifest.json` over the repo root's own, and it was restored from git inside a
minute; every shell call after that used absolute paths.

**Exact next action: none, until Stephen answers the ring question.** It is written at the top of the
morning report and in DECISIONS, with the measurements. Every remaining piece of K3 depends on the
answer: the three arenas, the boss ladder, the class win rates and `arena_shape` itself are all downstream
of whether a shattering arena is bounded or open and of how hard a hit is.

While it is open, the work that does NOT depend on it, in order:
1. **The Arena on screen.** `game/arena.js` runs headless today and has no UI at all: no rack, no
   integrity read on the marble, no charge glow, no condition picker. All four are DESIGN 9.1 and 9.5 and
   none of them cares how hard a hit is. The integrity tiers already exist in `core/damage.js` and the
   marble mesh recipes already exist, so "chipped" and "cracked" are decals over a solved renderer.
2. **The condition picker**, which is the pre match screen where a player chooses one condition per
   marble. `core/specials.js` already answers `choosable()` and every condition carries its own blurb.
3. **K1.5**, which is still unrun and still the most valuable hour anybody could spend on this game.

⛔ Before any of it, read the two open questions in this file's section 11⛔ Before any of it, read the two open questions in this file's section 11 and the ones written into the
morning reports. The pouch pity finding and the XP curve reading are both Director calls that change
numbers, and both are cheap to change now and expensive to change after a playtest.

Everything those need is in place: the catalogue is generated, all sixty five marbles render, the save
merges safely across two tabs, the wallet and the clay pool regenerate against an injectable clock, the
pouches pull with pity, and a marble is now genuinely at risk in a match.
