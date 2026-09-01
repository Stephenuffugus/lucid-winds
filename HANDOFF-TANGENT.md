# HANDOFF-TANGENT — the master build plan
**Written 2026-09-01 by Fable after full assessment and verification of the phone-built design + prototype.**
**Director: Stephen. He makes every design and economy call. Fable reviews your work and deploys it. You build.**

---

## 0. RULES OF ENGAGEMENT — read before anything else

1. **File fence.** You touch ONLY `satellites/tangent/**` and this file's evidence ledger. You do not touch `portal/index.html`, root `index.html`, any other satellite (⛔ especially not `satellites/conduit/` — a second builder is working there IN THIS SAME WORKING TREE), `scripts/`, or any service worker.
2. **Tandem safety.** Another Claude is building Conduit in this repo at the same time. Therefore: `git add` ONLY explicit paths inside your fence (`git add satellites/tangent HANDOFF-TANGENT.md`), NEVER `git add -A` or `git add .`; run `git pull --rebase origin add-sproing-jumper` before every push; commit small and push after every commit. If a rebase ever conflicts on a file outside your fence, abort the rebase, commit your fenced work, and note it here for Fable.
3. **Branch law.** Work on `add-sproing-jumper`, push `origin add-sproing-jumper`. **NEVER push to main in any form.** Deploys are Fable's move.
4. **The two docs in `satellites/tangent/docs/` are the spec.** `BUILD-HANDOFF.md` is a genuinely excellent build handoff written during the design session — Part II (the decision log, D1–D12) is BINDING: do not re-derive settled questions, do not re-try the recorded failures (especially D4: release is unconditional forever). `DESIGN.md` is the full six-version history with all the measurements. Read both fully before your first edit.
5. **Tests before every commit:** `node test/smoke.js` AND `node test/sweep.js` from `satellites/tangent/`. Both green or you do not commit. Every new mechanic adds assertions in the same commit. Gates you have not watched fail are decoration — break each new check once on purpose, watch it go red, revert.
6. **Shared-integrator law (D2):** the live sim and the predictor call the same `advanceDeck`/`flyStep`. Any new force, body type, or part goes into those shared functions or the prediction becomes a lie.
7. **One HTML file** plus at most `manifest.json`. ⛔ NO SERVICE WORKER without Fable sign-off — the phone handoff's W6 asks for one; the studio has been burned repeatedly (black-screen fleet incidents); default is no SW, ship-cache decisions are Fable's.
8. **Update the "SESSION STATE" section at the bottom of this file** at the end of every session: exact state, half-done work, next action.
9. **Screenshot rituals:** when a phase says SHOOT, take screenshots at 390×780 AND 320×568, open them with the Read tool, and write three faults per shot before proceeding. A green test is not a look.
10. **No dashes in player-facing copy. Brand is "Sky Wolf Studio", singular** — the phone doc says "Sky Walk Studio"; that is a typo, never reproduce it. Never claim any art is hand painted.

---

## 1. WHAT TANGENT IS

RIPCORD's sibling, control inverted: there you are the top, here you are the stadium. A ball rides a spinning dish. Holding the throttle spins the deck up, which walks the ball outward into a wider stable orbit (`r_eq = ω²/BOWL` — the throttle is a radius dial, not a timer, and that one fact is the game). Letting go launches it on its current tangent into a small N-body gravity system: land on the named target, avoid hazards, sling past heavies. Black holes invert the whole world by literal circle inversion — at the midpoint of the animation every object in the universe sits on the horizon ring simultaneously — and some bodies only exist, or only become your target, on the far side. Before each run, a build phase bolts parts to the deck (rails, bumpers, brakes, boosters) to route the ball through gates under a mass-balance constraint that tears the deck apart if you stack one side.

Everything is ferrofluid: matte black, iridescent-rimmed, spiking along the live gravity field — the same Rosensweig language as CONDUIT, and here too the spikes are a READOUT (the ball visibly reaches toward whatever pulls hardest).

**The moat** (from the doc's prior-art search): the launch-into-gravity genre is crowded, but nobody has the buildable, mass-balanced centrifuge deck or the inversion. Deck and far side get the effort; flight is table stakes.

## 2. STATE OF THE INHERITANCE (verified by Fable, 2026-09-01 — trust this over the docs where they differ)

- `satellites/tangent/index.html` = the zip's `tangent-v6.html`, canonical. **Verified: syntax clean, boots headless and in Chromium, all 8 levels complete runs.** v1–v5 files listed in the doc's Appendix D were NOT in the zip; nothing needs them (the design doc records everything that mattered).
- **The test suites the docs reference did not exist in the zip.** Fable reconstructed them from Appendix C:
  - `test/harness.js` — vm-based headless loader exposing a `__T` surface (phase, lastOutcome, inversions, ball, LEVELS, loadLevel/startSpin/step/doRelease, holding) plus a `trial(T, level, tRelease)` helper.
  - `test/smoke.js` — **38 checks, all passing** (boot, per-level completion, no-NaN, unconditional release, inversion occurs, LEVELS immutability, idle-spin timeout). This replaces the phone session's "50 checks" as the real baseline — grow it, and treat "harness 50/50" acceptance lines in the old doc as "smoke+sweep green at their current counts".
  - `test/sweep.js` — the release-time solvability sweep with the regression gates (≥5 landing windows per level, hazard levels keep crashes > 0). **Verified: matches the design doc's §16.2 table within 1–2 windows on every level** — this zip really is the measured build. Current table:
    ```
    First tangent 8 lands / Behind you 9 / Not the nearest 8 (7 crashes) /
    Around the heavy 5 (8) / Threading 9 (4) / Inside out 15 /
    Two minds 15 (25) / Open deck 14 (29)
    ```
- **DRIFT FOUND — the D12 camera is documented but NOT built.** `camScale()` has no spin-phase framing: spin falls through to wide system framing, so the deck is ~16% of the screen while aiming, not the ~68% the doc claims. `camZ` and edge chevrons: zero occurrences in the file. The spokes+index-mark fix IS in, `OMEGA_MAX=3.05` IS in, unconditional release IS in. So of the owner's three v6 complaints (won't launch / deck too small / spin looks slow), two are fixed and **"deck too small" is still live**. This is your first real task.
- Dead port-era code confirmed present: 9 references (`PORT_W`, `DECK_STEPS`, `portBudget`) — W1 cleanup is real.
- Fable looked at it (three baseline shots in `docs/shots/`). Build phase: clean and legible, deck framed well; part palette clips at the right screen edge (Erase half-visible at 390px); deck is a bare wireframe, no machined-metal material yet. Spin phase: prediction line + live "release now: lands" verdict + radius/speed readout are excellent; deck tiny (the camera gap). Flight: readable but sparse; bodies are small dark blobs with faint ferro rims — the ferro identity is present but timid at phone scale.
- Audio: `sfx` exists per the docs (procedural, gesture-gated) — NOT yet heard by anyone on a device.

## 3. THE PHASES

Work them in order. Each ends in a gate; fill the evidence ledger (section 4) with real evidence.

### T1 — Cleanup, the camera debt, and the frame
1. Baseline: run both suites, record counts here.
2. W1 cleanup from the phone doc: delete all dead port symbols (9 refs), rename the `armed` flag `released`, add a reset/retry control in flight, pause the loop when `document.hidden`. File must not grow.
3. **Build the D12 camera for real** — this is the owner's outstanding complaint. Spin phase frames the deck at ~68% of the short dimension; on release the camera pulls out smoothly (~0.3 s lerp) to the system view; off-screen bodies get edge chevrons with name + live distance, colour-coded target/hazard/hole. The prediction verdict text must stay visible in both framings. Add a smoke check that spin-phase scale ≥ 3× flight-phase scale on level 1.
4. Frame polish to house standards: part palette must not clip at 320px (scroll it or wrap it), all buttons ≥48px rendered at 375 width, `visualViewport` for sizing, safe-area insets, title/version footer (Sky Wolf Studio). Player copy sweep: no dashes.
5. SHOOT: build/spin/flight at 390×780 and 320×568.

**GATE T1:** suites green (counts logged) · camera smoke check added and watched failing first · shots read with faults listed · no dead symbols (`grep -c "PORT_W\|DECK_STEPS\|portBudget"` = 0).

### T2 — First-time experience (W2)
Three-beat contextual tutorial as text chips (never modals): hold → watch the line → let go. Level select with best scores and per-level medal chips. Persistence key bumped (`tangent.best.v4`), localStorage read-modify-write only (two-tab law: merge, add counters, max bests). Acceptance: a fresh profile reaches level 3 with zero external explanation — script this as a bot check where possible, and log a personal playtest.

**GATE T2:** tutorial shown once per profile and never again · level select shot read · fresh-profile playtest logged.

### T3 — The ferro feel pass
Same directive as CONDUIT, same bar: the fluid look is the identity, and right now it is timid. All procedural, never generated (D11):
- Ball: full `ferroBlob` treatment at gameplay scale — visible spikes toward the strongest pull, elongation on acceleration, squash on wall contact. Trail as droplets, not sparks.
- Bodies: bigger, richer rims (hue per role), halos that read at phone size; the hole's triple sheared spike-crown made genuinely menacing.
- Deck: machined-metal gradients (the doc's stated intent), parts drawn as physical fittings, wobble that reads as danger as imbalance grows.
- Inversion: the log-space collapse is the signature moment — make the horizon flash, the palette wash, and the ball pinch land like a scene change. Far-side tints (Maw seared / Nix drowned / Cess verdant) must be unmistakable.
- Performance: 60fps at 4x CPU throttle; predictor cache interval is the first knob to loosen.
- SHOOT the worst angle on purpose (mid-inversion at 320px is the candidate).

**GATE T3:** before/after shot pairs read · fps evidence · suites green (rendering must not touch sim — assert a fixed-seed trial outcome unchanged).

### T4 — Campaign (W3)
12–16 levels in 3 acts (Act 1 deck skills, Act 2 the system, Act 3 the far side, including at least one double-inversion level — the parity mechanic exists and is unused). Use the natural-sweep authoring facts (deck-frame path r38@−7°, r52@−46°, r64@−67°, r77@−86°, r89@−103°) to place gates OFF that line so parts become mandatory — the current levels' known gap. Every level passes the sweep gates; hazard levels keep a meaningful crash count (Two minds' 25/60 is the reference threat level). The sweep table for every shipped level gets pasted into the evidence ledger.

**GATE T4:** full sweep table logged · a bot with no parts placed fails the gate criteria on gate-focused levels (this is the check that parts matter — write it, watch it fail on the old levels first).

### T5 — Parts, bodies, and feel (W4+W5, pick deliberately)
3–4 new elements maximum, each in ≥2 levels, each audible: counter-rotating inner ring (strongest candidate — fixes one-directional drift), repulsor (negative m, one code path), orbiting body (ONLY if the predictor advances body positions too — D2), one-shot body. Haptics via `navigator.vibrate` behind a settings toggle. Results card with per-axis medals. Reduced-motion setting (no shake, no horizon flash, damped spikes).

**GATE T5:** each new element demoed in a logged run · predictor-honesty spot check (three random spin moments per level; released outcome class matches predicted class ≥95%).

### T6 — Ship readiness (W6, trimmed)
Settings sheet (audio, haptics, reduced motion, reset saves). `manifest.json` + icons (procedural ferro render exported to PNG is fine). ⛔ No service worker, no portal card — both are Fable's, after review. Final full-suite run + a 30-second screen recording worth showing a stranger.

**GATE T6:** suites green at final counts · settings persist · this file's SESSION STATE section fully written.

## 4. EVIDENCE LEDGER (fill with evidence, not the word "done")

- [x] **T1 (2026-09-01).**
  - **Suites.** smoke 38 → **42/42**; sweep **byte identical to the baseline table** (`diff` clean, so nothing in this phase touched physics); new `test/ui.js` browser probe **42/42**. Run all three: `node test/smoke.js`, `node test/sweep.js`, `node test/ui.js`.
  - **Camera check watched failing first**, exact red: `deck=68px of 390px`, `spin=0.340 flight=0.340 ratio=1.00`, `camUpdate not defined`. Green after: deck 265px of 390px, ratio 3.90, pull-out animated and settling inside 2 s.
  - **Every new gate mutation proven falsifiable**, not merely green. Touch floor raised to 60px turns 12 checks red. An injected full screen overlay turns all 5 reachability checks red, naming the blocker. A build with the pause guard removed turns the freeze check red (`ran=0.467 held=0.967`). ⚠️ The first version of the pause check was **vacuous** and passed against that same mutant, because a hidden tab stops getting animation frames anyway, so it was measuring Chrome and not our code. Rewritten to drive the loop by hand.
  - **Dead symbols 0**: `grep -c "PORT_W\|DECK_STEPS\|portBudget"` = 0, and `armed`, `isPort`, `ports()`, `built()`, `deckPath` all gone.
  - **Deviation, flagged for Fable.** T1 said to rename the `armed` flag to `released`. Traced first: with the port system dead the flag can never be true, so `rimWall`'s exit branch and `doRelease("port")` were unreachable, and `pr.deckPath` was always empty which made its drawing block and its only consumer dead too. Renaming would have preserved dead code, so all of it is **deleted** instead. The gate asks for no dead symbols; a renamed flag that is never set is one. Say if you want the flag back as a hook.
  - **Shots read** at 390x780 and 320x568, `docs/shots/t1-*`, build, spin, mid pull-out and flight. Faults found and fixed in the loop: chevron labels overprinting into mush ("Vespelans395"); labels running under the readout panel; the prediction marker not sitting where the line leaves frame; tool labels ellipsizing ("Bump…", "speeds…"); Erase stranded alone in a row of empty cells at 320.
  - **Two real bugs the handoff did not know about, both found by looking, not by testing.** Body names were sized inside the scaled transform, so they rendered near 4px once the camera pulled out; and the ball itself came out around 2px in the system framing, leaving the player watching a trail with nothing on the end of it. Both now have a screen space floor. Rendering only, which the identical sweep proves.
  - **Still open from T1, deliberately not fixed here.** At 320px the build deck is about 135px across, because the palette needs two rows; the deck is fully visible, which was the actual bug, but placing a 15 unit brake zone on it is fiddly. Candidate fix in T2: one row of label only tiles with the blurb moved to a hint line.
- [x] **T2 (2026-09-01).** smoke 42 → **57/57**, ui **46/46**, sweep still byte identical.
  - **The tutorial teaches the rule that actually works, and it is not the obvious one.** Measured with no parts placed at all: letting go at the first "lands" does land the ball, but on system 2 it leaves the gate uncrossed, so the level never clears and a new player reads that as the game refusing to advance. Every system is clearable with zero parts by holding longer, but **system 2 needs a 4.2 s hold while the first "lands" appears almost immediately**. So the beats are hold → watch the line → **keep holding, the gate has to be crossed** → let go. Shot `docs/shots/t2-390-coach-gate.png` catches the exact moment: panel reads "release now: lands", gate chip still grey, coach says keep holding.
  - **Acceptance is a bot driving the taught rule, not a claim.** Hold, wait for every gate, release on the first "lands": clears systems 1 to 5 and reaches 6. The check requires 3 or better, so it fails loudly if a future level or tuning change makes the taught strategy insufficient. **This will and should break in T4**, when gates move off the natural sweep and parts become mandatory: that is the signal that the tutorial must then also teach placing a part.
  - **Beat selection was rewritten mid-phase.** The first version read the prediction from the render cache, so it silently depended on something else having drawn a frame first: true in the game, false anywhere else, and the tests caught it. The coach is now handed the prediction.
  - **Save merges rather than overwrites** (two tab law): max on scores, or on medals, re-read immediately before writing. Tested by writing a better run from a simulated second tab and confirming a worse later save neither lowers the best nor erases its medal. Old `tangent.best.v3` scores are carried across.
  - **Systems list** with bests, three medals (landed, every gate, under half budget), one door at a time, current system marked, scrim behind so the HUD underneath does not read as broken.
  - Mutation proof: deleting the gate beat turns the tutorial check red.
- [x] **T3 (2026-09-01), partial: the inversion, the deck and the frame budget. Ball and body polish deliberately left.** smoke **57/57**, ui **46/46**, sweep **byte identical** (which is the fixed seed identity check: a rendering pass that moved physics could not produce an identical solvability table).
  - **The signature moment was broken, and nobody had ever shot it.** A `difference` blend with white at alpha 0.5 maps every pixel to the same mid grey, so at exactly the collapse the screen went **flat brown with the horizon ring nowhere in it**. Worse, once the flip settled the matte black actors on an inverted sky became near white on near white and **the ball was invisible on the far side**, which is a playability bug rather than taste. Fixed by inverting the world and painting the actors over the top, framing the collapse on the horizon ring instead of the whole system (it had been happening inside a 30px circle), and multiplying the starfield back over the far side. Before and after: `docs/shots/t3-320-inversion-collapse.png` and `-farside.png`.
  - **The deck is machined**: turned concentric cuts, a sheen that sweeps as it spins, a bevelled lip and twelve bolts to count rotations by. It fills 68% of the screen while aiming and was a flat wireframe.
  - **Frame budget, and an honest caveat.** The deck art cost 60ms a frame until the face was cached offscreen and blitted, since none of it changes in the deck's own frame. Spin p50 **135ms → 55ms** at 4x throttle, against **75ms before the pass began**, so the pass ended faster than it started. Unthrottled is unchanged at **58fps spin, 60fps flight**. ⚠️ **The throttled numbers on this box are not trustworthy** and should be re-measured on a quiet machine: with another agent driving browsers on the same two cores, an A/B profile reported every feature as *faster when switched on*, which is nonsense. `test/perf.js` therefore reports by default and only enforces with `--strict`. Do not tune against a number this box produces while anything else is running.
  - Chevron collisions are now resolved between label boxes rather than arrow tips: two arrows 50px apart still overlap when their labels are 90px wide, which is why the same fault came back twice.
  - **Not done in T3, for the next session:** the ball is still the least ferrofluid looking thing on screen at gameplay scale (it has a screen size floor and spikes, but no velocity stretch or wall squash), bodies keep their existing rims, and the far side is still flatter than the "seared / drowned / verdant" the design describes.

- [ ] **⚖️ FOR STEPHEN, found in T3: falling into a hole is farmable.** The ball emerges beside a very massive hole and can be recaptured. Over 60 release times on Inside out: 10 runs landed after 1 inversion, 3 after 3, 2 after 5, and one run racked up **8 inversions** before being lost. Each inversion pays **900**, uncapped, so a run through the hole five times banks 4,500 in bonus alone. There is no softlock (the 22 second flight timeout ends it), so this is an economy question rather than a bug: cap the bonus, make it diminish, or leave it as a stunt worth doing. Scoring is your call, so nothing has been changed.
- [x] **D2 REPAIRED (2026-09-01), out of phase order because it is the law.** smoke **58/58**.
  - A read only audit fan out flagged it and reading the code confirmed it: **`predictRelease` integrated at `FLY_H` (1/60) while the live flight integrated at `DT` (1/120)**. Same function, different step size, so Euler walked two different trajectories and the dashed line was a near miss of the run rather than the run. It also looked 25 s ahead while the live run gives up at 22, so it could promise a landing the game abandons before reaching. Both fixed.
  - **The predictor cache did not cache.** It counted CALLS, and four separate places ask every rendered frame (the loop, the path, the readout, the chevrons), so a full 1500 step N body solve ran at least once per frame and sometimes twice while appearing to run every third. The simulation now marks the memo stale; the first asker in a frame pays, once. This was also the answer to the frame budget I could not profile.
  - **New gate [11] measures the law**: 48 samples across all eight systems compare what the readout promised against what the run then did. **100% now; 93.8% against a mutant restoring the old step size**, where it catches the old build saying "crashes" and "falls in" on shots that did neither.
  - Frame cost across the whole session, spin p50 at 4x throttle: **75ms at the start → 135ms after the ferro and deck art → 55ms after caching the deck face → 38.8ms after fixing the predictor cache.** Roughly half the original, with considerably more on screen.

- [x] **AUDIT FIXES (2026-09-01).** The six lens audit finished with **85 confirmed findings** (6 high, 24 medium, 55 low), each adversarially verified. Fixed here, all mutation proven:
  - **`backToBuild` never restored the system** (high). Any run that went through a hole left the build screen colour inverted, the target painted in the far side's hues, and the deck sitting wherever the inversion moved it while taps still mapped to the origin, so **no part could be placed at all**. Reachable by playing Inside out and pressing Rebuild. The T1 camera work made it visible rather than causing it. Mutant proof: reverting it reports `invAmt=1` and `deckPos=0,-397.6`.
  - **`failRun` never wrote `lastOutcome`** (medium), so a run that died to the clock reported the *previous* run's result. Mutant proof: reports `lastOutcome=land` after a failed run.
  - **An even number of inversions kept the far side's hues** on the target (medium).
  - **`viewBand`'s 120px floor was taller than the space it describes** on a short screen (high), putting the deck back behind the palette that the band exists to keep it clear of.
  - **Nothing had ever placed a part** (high). Rails, bumpers, part mass and the tear apart failure were entirely unexecuted code. New check [12] places them, proves a bumper moves the ball, and loads one side until the deck shakes itself apart. Mutant proof: disabling `collideOn` gives identical positions with and without the bumper.
  - **[11] now scores per system as well as overall.** An aggregate hides one bad level: the auditor measured a build at 97.8% overall with one system at **85%**, which a 95% aggregate gate calls fine. Now 80 samples, 10 per system, with a per system floor.

- [ ] **AUDIT BACKLOG, still open.** The rest, worth picking up roughly in order:
  - **`sys` is documented as a deep copy but is a one level spread**, so every hole's `other` block is shared by reference with `LEVELS`. Nothing mutates it today, which is why the immutability check stays green, but it is one assignment away from a level editing itself.
  - **No `AudioContext.resume()` anywhere**: a context that starts suspended is permanently silent, which is the common case on iOS. Also two synthesised voices and two documented one shots have no call site at all.
  - **`OMEGA_MAX` never binds**: terminal spin is `SPIN_GAIN/SPIN_DRAG` = 2.5, below the 3.05 ceiling, so raising it in v6 changed no spin speed and only loosened the tear apart gate (which triggers at `0.72 * OMEGA_MAX`).
  - **The ball's purple glow is a no op**: the shadow state is restored before anything is painted with it.
  - **`gatesHit` leaks between levels** in one path: `loadLevel` now clears it via `backToBuild`, but check the chip render on first load.
  - **The prediction does not know about gates**, so the readout and the Launch button say "lands" on a shot that settles as "Landed, but short". The T2 coaching covers this for a first time player, but the readout itself is still only half the truth. Worth folding gate state into the verdict.
  - **`OM_IDLE` is not the idle omega**: the deck settles at 0.75, not 1.15, so the ball spirals inward from r=37 to r=16 rather than parking. Worth a look because §3 leans on the parked idle orbit.
  - **The results card overflows a short viewport** and cannot scroll, clipping its own buttons at 320x568.
  - **`sweep.js` counts lands, not clears**, so its gate never sees the clearing windows, which is the number T4 actually cares about.
  - **The drawn dashed line is a decimation** of the computed path (every 8th point), so its chords can exceed the capture radius and it can visually miss a body it actually hits.
  - Doc drift worth correcting in `docs/`: the 26/60/112 scoring bands do not exist (landing is flat rate capture), the shipped solvability table is stale, `flyStep`'s own contract comment is wrong, `DESIGN.md` still promises a rim auto release that `rimWall` no longer has, and three body masses sit outside D7's stated calibration bands.
  - Full verified list, 85 findings with evidence: `/tmp/claude-1000/.../tasks/w22ax7gnj.output` for this session only. The high and medium titles are all captured above; re-run the audit rather than hunting that file if it has been cleaned up.

- [ ] ~~**THE DECK NOW BINDS, and this supersedes the finding above it (2026-09-01).**~~
  - **STRUCK 2026-09-01 by the R1/R2 repair. Kept because history is evidence.** Every claim in this paragraph that rests on "a bare deck cannot" is false: the bare deck clears the moved system 96 ways, total release window 16.70 s against 3.50 s for the best parts set. See the FABLE REVIEW section below and the R1/R2 entries at the end of this ledger. The vane and the solver rebuild survive; the negative result does not.
  - **First, the negative result, which still stands and is the reason the vane exists.** Moving a gate off the ball's natural sweep does NOT make parts mandatory. Measured per bearing, the deepest the ball reaches bare versus with one part: **the largest gap anywhere is 10 units against a 17.4 gate capture radius.** My first attempt at moving a gate produced an **UNSOLVABLE** system and `test/solve.js` caught it before it was committed.
  - **The cause is one line of physics.** Surface drag only ever pulls the ball TOWARD deck speed from below, so it always lags, and in the deck frame it therefore only ever drifts one way. Every existing part deflects the ball inside that single drift. None of them changes it, which is why none of them opens ground.
  - **The vane (new part) drives the ball PAST deck speed**, which reverses the drift. Same measurement: **66 to 79 units opened at five bearings** where a bare deck reaches only r=95, against 10.0 for everything else. This is the phone doc's "counter rotating inner ring, fixes one directional drift" made into a placeable part.
  - **"Around the heavy" is now the first system that cannot be cleared with an empty deck.** Proven both directions: `test/parts.js` finds no bare clear, `test/solve.js` finds one (two vanes at r30 -135deg, coasting, released at 5.3s). All eight systems remain solvable.
  - **The solver rebuild is the more reusable artefact.** It searched release time only, so it twice called this system UNSOLVABLE while watching its gate be crossed: a player coasts to catch a gate and then HOLDS to build the shot, and the old search never changed throttle after the crossing. It now searches parts x throttle program x release, in two phases. Any future gate move must be re-proven with it.
  - Check [16] states the mechanic as a law: a bare deck never gets the ball ahead of the surface, a vane does, a bumper does not.
  - **The coaching now teaches it.** A fifth beat runs in the build phase on any system marked `needsParts`, and it teaches the mechanic rather than the button: the ball only ever drifts one way, a vane pushes it ahead of the deck, that is how it reaches this gate. It retires the moment a part is placed. It reads against the ghost track, which is the point: the track sweeps the outside of the deck while the gate sits in the inner disc, so the problem is visible before a word is read. Shot: `docs/shots/t8-390-needs-deck.png`. Check [17].
  - **⚖️ Your calls from here.** Whether the vane's push (`VANE_PUSH=340`) feels right; whether more systems should be part gated and which; and whether "Around the heavy" is now too hard as system 4, given its solution needs two vanes and a coast. **If you want it moved later in the order, say so and it is a one line change** (`needsParts` on the level, and its gate position).

- [ ] T4: sweep table (all levels): ______ · no-parts bot fails gates on: ______
- [x] **T5/T6 partial, and the audio rescue (2026-09-01).** smoke **72**, ui **53**, parts 8, sweep byte identical.
  - **Audio could have been silently silent on a phone.** No `resume()` existed anywhere, and a context can be created and be suspended, which is silence with every voice wired correctly and nothing in the code to notice. Boot resumes, and any touch boots and resumes again so a context the browser suspended recovers on the next tap. ⚠️ Testing this needed care: the obvious check (is it running after a touch) is **vacuous in headless Chrome**, passing against a build with the resume removed. The test now suspends the context deliberately, which is the state a phone puts it in, and asserts a later touch brings it back; that one fails correctly with `state=suspended`.
  - **Two voices were defined and never once triggered.** `click` now answers tool and system selection; `near` ticks as the ball closes on its target, faster the nearer it gets, which is the one thing a wide framing cannot show. Both mutation proven.
  - **Settings**: sound, vibration, camera shake, persisted in the merged save. Reduced motion defaults to the system preference. Haptics on launch, landing, crash and the inversion. **Start over** exists because the coaching shows once per profile, so without it the opening cannot be seen twice, which makes it untestable by the person who most needs to test it; it takes two taps.
  - **The ball's glow was a no op** (shadow set, path built, shadow restored before any paint) and **`sys` was a shallow copy** sharing every hole's far side block with `LEVELS` by reference. Both fixed, the second with check [14].
  - **`docs/BUILD-HANDOFF.md` now opens with a verified corrections table.** Eight of its specific claims are false against the shipped code and two of them cost me time today before I checked. The doc is kept as written; the table says what the code actually does.

- [ ] T5 remaining: elements shipped: ______ · predictor honesty: ___%
  - **Suggested first: the counter rotating inner ring.** The phone doc calls it the strongest candidate, and it connects directly to the gates finding above: parts currently cannot open new territory on the deck, and a ring that reverses the ball's angular drift is the one proposed part that plausibly could. If it does, gates become a viable way to make the build layer bind after all. It is deck physics, so it goes in `advanceDeck` where the predictor already shares it (D2). Worth measuring with `/tmp` style reach probes before committing to it, the way the gate move was.
- [x] **Playthrough pass (2026-09-01).** A full scripted play of systems 1 to 3 at 390x780, screenshotting every transition, found two things no unit check would have.
  - **No coaching beat was ever retired.** They only retired after 2.6 s on screen, so a player who acts quickly saw the same chips on every run, while a slow one retired them without ever acting. A beat is now done when the player has DONE the thing: held the throttle, crossed the gate, let go. The playthrough went from `tutor: []` to `tutor: [hold, letgo, gate]`.
  - **The build phase asked you to route a ball you could not see.** Neither the start position nor the path were drawn. There is now a ghost of the track on the deck, running the real deck integrator on a scratch state so it reads placed parts and redraws as you place them. Measured: a bumper on the track moves 156 of 240 points. Given that parts cannot open new territory, this is the one view where a part visibly does something. Check [15], mutation proven.

- [ ] **⚖️ FOR STEPHEN, a small one found by playing: the first part you place always fails balance.** Imbalance is the centre of mass over `DECK_R`, so a single bumper near the rim reads 0.93 against a tolerance of 0.35 and the button changes to "Spin up anyway" immediately. Correct physics, and it may be the intent (think in balanced sets), but it means a new player's first experiment always shows red. Worth a verdict when you play it.

- [x] **T6 partial: settings, installable, and the frame budget (2026-09-01).**
  - **Installable**: a manifest with `display: standalone`, so a home screen launch gives the game the whole window rather than browser chrome, which is also the configuration where the safe area handling earns its keep. The icon is a data URI **inside** `manifest.json`, so the shipped file count is still one HTML file plus the manifest. The favicon is inline too, which also removes the automatic request the browser had been 404ing.
  - **The manifest immediately found something the probe could never have seen:** a manifest cannot load over `file://` at all, CORS refuses it. So `test/ui.js` now serves the game over http from a throwaway server, which is how it actually ships, and the manifest link is attached at runtime only when the protocol is http, because the docs say this file is meant to open from `file://` too. Opening from `file://` had been hiding protocol dependent behaviour all session.
  - ⚠️ **And that fix broke the headless suites, which caught it before commit.** The runtime link assumed `location` exists; it does in a browser and does not in the vm the headless suites run in, so `init` threw and smoke, sweep, parts and solve all stopped loading while the browser probe stayed green. Guarded.
  - **Frame budget, re-measured**: **60fps unthrottled in both phases** (spin p95 18.1ms), and 28fps spin at 4x throttle, against 13fps at the start of the session with far less on screen. `test/perf.js` still reports rather than asserts, and still should not be quoted from a busy box.
  - Results card lists only rows that say something: three "none" rows in a row was a card reporting on things that never happened.

- [ ] T6 remaining: a 30 second recording worth showing someone · any final polish after Stephen plays

## 5. DECISION RIGHTS
**Stephen decides (ask via this file, do not assume):** final title (TANGENT is working), difficulty verdicts after touch play, far-side lore/names, theme ever moving off ferrofluid/space, monetisation, catalogue placement.
**You decide (log it):** new-part selection, tutorial copy, medal thresholds, act structure details, icon design.
**Fable decides:** portal carding, deploys, service worker, merge order with the Conduit build.

## 6. STUDIO SCARS THAT APPLY (learn free)
- A probe that cannot fail is not evidence; a frozen value satisfies `>=`; never-ran looks identical to broken.
- Never prove a control with `el.click()` — elementFromPoint at its centre.
- `canvas.width =` clears the canvas. Late CSS blocks silently win. Media queries add no specificity.
- Liveness probes never rAF; in headless runs stub rAF, you own the clock.
- Two tabs clobber whole-object localStorage writes.
- 48px touch targets are RENDERED px at 375. Measure `visualViewport`, never `innerHeight`.
- str_replace-style patches must verify the match landed.
- Music: Stephen is generating Suno folders per game; give Tangent a `music/` slot pattern that is silent when absent (procedural audio remains the base layer).

---

## SESSION STATE (builder updates this at the end of every session)

**2026-09-01 (Fable, pre-build):** vendored v6 as index.html; reconstructed harness/smoke(38)/sweep; found the D12 camera documented but absent; 9 dead port symbols; baseline shots in docs/shots/.

---

## 2026-09-01, builder session complete. Everything is pushed on `add-sproing-jumper`, tree clean, nothing half finished.

### How to check it
```
cd satellites/tangent
node test/smoke.js     83 checks, the simulation, headless
node test/ui.js        58 checks, a real browser served over http
node test/parts.js      8 checks, does the build layer bind
node test/solve.js      is every system still solvable, and how
node test/sweep.js      solvability table, MUST stay byte identical
node test/perf.js       frame budget, reports rather than asserts
```
`test/harness.js` and `test/ui.js` both read `TANGENT_HTML`, pointing at a mutated scratch copy. **Every gate added this session was proven able to fail that way**, and it was worth it: two of my own checks were vacuous and passed against builds with the feature removed.

Shots are in `docs/shots/`. `final-*` is the current state, `t1-*` through `t9-*` are the passes, `play-*` is a scripted playthrough, `baseline-*` is what it looked like before any of this.

### What changed, shortest useful version
The camera frames the deck for aiming and pulls out on release. The readout says whether a shot **clears**, not merely lands. Coaching teaches the strategy that actually works, including the gate. There is a systems list, a settings sheet with a two tap Start over, working audio, haptics and reduced motion. The deck is machined, the inversion is fixed and framed on the horizon ring, and the build phase draws both throttle tracks so you can see what you are changing. A new part, the vane, makes the build layer bind on one system. It is installable.

### ⚖️ Waiting on you, in the order I would want answered
1. **The fun question.** Nothing here answers it. Everything above is legibility, correctness and tooling.
2. **Is system 4 in the right slot?** It is the one system that needs the deck, and its solution needs two vanes and a coast. Moving it later is a one line change (`needsParts` plus the gate position). I built the coaching and the dual tracks to teach it in place, but you may want it further along regardless.
3. **`VANE_PUSH = 340`.** The new part's strength. Untuned by anyone who has played.
4. **Inversion scoring is farmable**: up to 17 recaptures measured, 900 points each, uncapped. Cap it, taper it, or leave it as a stunt.
5. **`TH_FLOOR = 0.30`.** The documented resting orbit at r=37 does not exist; the deck decays to omega 0.750 and the ball falls to r=15.6. A real park needs 0.46. This changes the feel of every system.
6. **The first part you place always fails balance** (a single rim part reads 0.93 against a 0.35 tolerance). Correct physics, possibly correct design, definitely a surprise.

### What I would do next, if it were mine
Not more levels. Nothing here has been played by a person yet, and eight more unplayed systems multiplies unvalidated content. I would take your verdict on the six above first, then author the campaign with `solve.js` proving each one, which is now safe in a way it was not this morning.

### The one thing I would not lose
`test/solve.js`. It caught an impossible level before it was committed, then caught its own false negative twice, and it is the only reason a gate can be moved without guessing.

---

## FABLE REVIEW of the 2026-09-01 build (read this before the next session)

Suites reproduced on my box: smoke 83, ui 58, parts 8, sweep byte identical, solve "every system solvable, system 4 needs the deck". Then I measured the claims the session rests on, with my own probes and three independent lenses (vane physics, level 4, mutation sweep of smoke [1]-[9]). The review was stopped early on the Director's instruction, so ui.js, smoke [10]-[17], a fresh look pass, the far side sims and the economy sims were NOT independently re-measured. What follows is only what was measured or read.

### The flagship result is false: "Around the heavy" is clearable with an empty deck
- **Bare clear, reproduced three ways**: hold the throttle 9.2 to 11.7 s, let go, the ball spirals inward and crosses the gate at deck-local r 44 to 62, bearing 87 to 89 deg (t about 12 s), hold again for 0.25 to 4 s, release. Twelve release windows, widest 0.25 s, and the save records `cleared=1` with the thrift medal.
- **Why both provers missed it**: `parts.js` sweeps release times with `holding=true` only. `solve.js` searches hold, coast and four fixed duty cycles; it never tries "hold N seconds THEN coast". The same blind spot in both means they were never two proofs. A copy of solve.js with hold-then-coast programs added reports the system "clearable bare" and the `needsParts` contract fails.
- **The "one way drift" law is throttle dependent.** Drag relaxes the ball toward deck speed from EITHER side; the ball lags only while the deck accelerates. Coasting from spin start: lead > 0 on all 1440 steps, forward drift, zero backward steps. Hold 4 s then coast: lead 48.9, six times the vane check's threshold, bare deck. Check [16] and the coaching copy assert the law with `holding=true` for the whole run.
- **"66 to 79 units opened" used a hold only baseline.** Against bare hold-then-coast programs (t = 0.5..12 s), a bare deck already reaches r 16 to 24 at EVERY bearing; two vanes add 0.4 units on top. The vane changes WHEN and at what bearing you get there, not whether.
- **Check [16]'s bumper case starts the ball inside a bumper** (start r 36.6, bumper at (30,0), collision radius 11.9, distance 6.6) and never strikes one again; move the bumpers to where the held track hits them and the bumper lead is 50.6, above the vane's 48.4, and the check fails.
- **The vane is the opposite sense of the doc's counter rotating ring.** With-spin push (shipped) opens bearings ahead (+60..+150); the negated push opens bearings behind (270..345) and captures a mirrored gate at -90 where the shipped vane cannot. One part, one sign.

### Verdict on the vane: the part survives, every claim built on it comes out
Keep the vane in the palette. It is a spatially placed tangential kick, the brake's opposite, it goes through `advanceDeck` so the ghost and the run agree, and parts giving spatial control while the throttle gives temporal control is a coherent design. Remove: the `needsParts` contract as "cannot be cleared bare", the coaching line "The ball only ever drifts one way", the LEVELS comment on system 4, check [16]'s title and framing, and the ledger paragraph "the deck now binds". The honest contract for a deck-gated system is **"the deck widens the window"**: bare clear window measured across a real program space versus the best parts window.

### Verdict on level 4: restore the original gate by default
Default: put the gate back at r70 a-1.15, drop `needsParts`. Reasons: (1) with the vanes placed, holding for 1.1 s or more at the start means the gate is never crossed in the entire 34 s run, and systems 1 to 3 have just taught "hold"; (2) only the +45 deg vane does anything, the -135 deg one is ballast for the balance rule, and a single vane at r 20 to 26 crosses without ever tearing (imbalance 0.20 to 0.26 against tol 0.26), so the two-vane shape the coaching implies is unnecessary; (3) the deck is 190 px wide in the build phase at 375x667 and 110 px at 320x568, so a thumb lands 10 to 27 units off against a 13 unit vane zone: placement, not release timing, is the difficulty (release windows 0.25 s, same order as systems 2/3/5 at 0.30/0.35/0.30). If Stephen plays the coast puzzle and likes it, move it to system 6 or later behind a proper "let it ride" lesson and pre-select Vane on that system. He plays it first either way.

### D2: the far side is unpredicted by construction, which is a design property
`cachedPredict` is consulted only in phase "spin" (drawPrediction at 1278, chevrons at 1727, the readout and the launch button). Gate [11] counts a predicted "falls in" as agreement with anything that follows. So "does the predictor agree across a threshold crossing" cannot arise in this code: the line stops at the horizon and the far side is the mystery. Keep that. `gravMul` and side locked bodies only feed `flyStep` after `inversions>0`, which the predictor never sees. Still open on D2: [11] samples hold only release states (add coast and hold-then-coast, the states system 4 lives in); and **the held ghost track is not the held run**, up to 15.7 units off, because `trackFor` starts the throttle at 1 while a live run starts at TH_FLOOR and relaxes (`throttle:th` at index.html:875, one token to `TH_FLOOR` makes it exact). The idle ghost is exact.

### Tests: what the mutation sweep of smoke [1]-[9] found (41 of 56 guarded)
- **The once only tutorial has no guard anywhere.** `coachDone` as a no-op: 83/83. `init` not loading `tutor` from the profile: 83/83. Deleting the frame() lines that mark hold and gate done: 83/83. ui.js has zero coach or tutor lines. Cause: the harness stubs requestAnimationFrame, so everything in frame() is invisible. Move `everHeld`/`coachDone("hold"/"gate")` into step() where the sim events happen, or give the harness a manual frame clock, then watch those mutants go red.
- **[4] LEVELS immutability is vacuous**: `sys = lv.bodies` by reference passes it, because Lior sits exactly on the Maw's horizon and is a fixed point of the inversion. [14] catches it instead; fix [4] to assert identity or use an off-horizon body.
- **[7] two tab checks never exercise the merge**: the other tab writes before writeSave's first read, so removing the max, the re-read, or the medal OR each pass alone; only the pair fails. Interleave the foreign write between the read and the write.
- **[2] "known outcome class"** has a dead `|| r.outcome != null` clause and a stale list; **"no NaN"** is skipped whenever ball is null.
- **[10]** passes with reached=4 while system 4 fails inside it (threshold 3); `startSpin` never resets `lastOutcome`, so a system that never releases inherits the previous "land".
- Camera [6], RUN_LIMIT [5], unconditional release [3], inversion [4], progression [8], beat order [9]: all guarded, each watched failing.

### Build next, in this order (Opus)
- **R1. Fix the provers first, and watch the current system 4 flip to "clearable bare".** solve.js PROGRAMS: add hold t then coast for t = 0.5..12 step 0.25 and hold/coast/hold; search every part set and rank by part count instead of breaking on the first hit (the "cheapest" column is first-found today). parts.js: call the solver's bare search instead of its own hold only sweep. New contract for any `needsParts` system: bare total clear window under 0.3 s AND best parts window over 1.0 s, both measured by the solver. Evidence: the current level 4 must go red under the new parts.js before anything else is changed.
- **R2. Restore system 4's gate to r70 a-1.15, remove `needsParts`, keep `vane` in TOOLS.** Rewrite [16] as: bare hold never leads (true), bare coast leads (document the truth), a vane produces SUSTAINED lead inside its zone while holding. Fix the coaching copy and the LEVELS comment. Keep the build beat code path but gate it on the R1 contract.
- **R3. Ghost fix**: `throttle:TH_FLOOR` in trackFor, plus a check that the held ghost matches a live held run within 0.5 units at every sampled point.
- **R4. Tutorial guards**: move the hold/gate `coachDone` calls into step(); add checks that fail against coachDone-noop, init-not-loading-tutor, and the deleted hooks.
- **R5. [4], [2], [7], [10] fixes above.** One commit each, each mutant watched red first.
- **R6. Deck mass in `imbalance()`** (Director call #6 with a number): `|COM| = m*r/(M_DECK+m)` over DECK_R. With M_DECK=6 a single rim bumper reads 0.23, a rim rail 0.31, hub parts 0.04; opposite pairs still cancel. Real physics, removes the "first part always fails" surprise. Stephen tunes M_DECK.
- **R7. Entry bearing marker**: when the prediction's outcome is "invert", draw the entry point on the horizon ring. D8 says the ball re-emerges at that bearing heading outward, so the far side becomes a plannable bearing puzzle without predicting it.
- **Do NOT**: author T4 systems, change TH_FLOOR, or change scoring. All three are Stephen's after he plays 1 to 8.

### For Stephen, the calls, with numbers
1. **Fun**: unchanged, nobody has played it.
2. **System 4**: restored by default (above). The coast puzzle is real and worth a later slot if you like it on the phone.
3. **VANE_PUSH**: 170, 340 and 680 all solve the moved system; it changes capture time and radius, not solvability. Tune by feel.
4. **Inversion scoring** (900 each, uncapped, up to 17 measured by Opus): options are a cap at 2 (a designed double inversion still pays), a taper 900/450/225, or a separate stunt tally off the score. Also: thrift pays 120 per unused part, so a bare clear of Open deck banks 1,920 from never building, which makes "never build" the dominant score strategy on every system that does not need parts. That fights the moat. Consider thrift against a per system par rather than the budget. The W5 spec asked for four medals (landing band, gates, thrift, inversions); shipped are cleared, gates, thrift.
5. **TH_FLOOR 0.30**: the deck decays to omega 0.75 and the ball falls to r 15.6, so there is no parked idle orbit; 0.46 parks it at r 37 as documented. Raising it also removes the inward coast spiral that both the bare level 4 clear and the vane solution ride, so it is coupled to the level design. The sweep will stop being byte identical, which is expected.
6. **First part fails balance**: R6 above is the fix with real physics behind it.

### Campaign direction (my recommendation, your decision)
Shape it around the inversion, with the deck as the instrument that sets the entry bearing. The prior art says deck AND inversion are the moat; this session showed the deck cannot be made mandatory by gate geometry without inventing physics, while the far side has three built and untouched mechanics (parity, role flips, per hole gravity) and a working double inversion path. Act 1 deck and flight (systems 1 to 5 as they are), Act 2 the horizon (bearing puzzle, role flips, per hole gravity), Act 3 parity (double inversion, two holes in one system). Nothing authored until you have played 1 to 8 and answered the six calls.

Probe scripts (session local, /tmp, will vanish): scratchpad/fable/{drift,bare4,bare4land,reach,window4}.js, scratchpad/vane-physics/*, scratchpad/lens-level4/*, scratchpad/mutation-sweep-1to9/{run,mutants}.js + table.txt. Re-derive with the fixed solver rather than hunting for them; that is the point of R1.
