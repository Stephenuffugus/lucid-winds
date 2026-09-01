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

- [ ] **AUDIT BACKLOG for the next session.** A six lens read only audit ran over the build and its two spec docs, each lens adversarially verified. 31 findings survived verification; the two high severity ones (D2, and the build layer not binding) are handled or already known. Worth picking up, roughly in order:
  - **`sys` is documented as a deep copy but is a one level spread**, so every hole's `other` block is shared by reference with `LEVELS`. Nothing mutates it today, which is why the immutability check stays green, but it is one assignment away from a level editing itself.
  - **No `AudioContext.resume()` anywhere**: a context that starts suspended is permanently silent, which is the common case on iOS. Also two synthesised voices and two documented one shots have no call site at all.
  - **`OMEGA_MAX` never binds**: terminal spin is `SPIN_GAIN/SPIN_DRAG` = 2.5, below the 3.05 ceiling, so raising it in v6 changed no spin speed and only loosened the tear apart gate (which triggers at `0.72 * OMEGA_MAX`).
  - **The ball's purple glow is a no op**: the shadow state is restored before anything is painted with it.
  - Doc drift worth correcting in `docs/`: the 26/60/112 scoring bands do not exist (landing is flat rate capture), the shipped solvability table is stale, `flyStep`'s own contract comment is wrong, `DESIGN.md` still promises a rim auto release that `rimWall` no longer has, and three body masses sit outside D7's stated calibration bands.

- [ ] T4: sweep table (all levels): ______ · no-parts bot fails gates on: ______
- [ ] T5: elements shipped: ______ · predictor honesty: ___%
- [ ] T6: final counts: ___ · recording: ______

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

**2026-09-01 (Fable, pre-build):** vendored v6 as index.html; reconstructed harness/smoke(38)/sweep(all green, matches doc §16.2); found D12 camera documented-but-absent (deck ~16% on spin, no camZ, no chevrons); 9 dead port symbols confirmed; baseline shots in docs/shots/. Next action: T1.

**2026-09-01 (builder, T1 complete).** State: T1 shipped and pushed on `add-sproing-jumper`, one commit, no interference with the Conduit builder sharing this tree (committed fenced paths only, fetched and confirmed fast forward rather than rebasing over their unstaged work).

What is in the build now: the camera frames the deck while building and aiming and pulls out to the system on release, fitted to the band between the HUD strips; edge chevrons carry off screen bodies with live distances and mark where the predicted shot leaves frame; a backed readout panel that cannot collide with the criteria chips; the dead port system is gone; a flight phase `Rebuild deck` control; a visibility pause; `visualViewport` sizing; a wrapping tool palette; 48px controls; no dashes in player copy; a brand line.

Half done, nothing. Known and deliberately deferred: the 320px build deck is small because the palette takes two rows (see the T1 ledger note).

**2026-09-01 (builder, T2 complete).** Coaching, systems list and the merging save are in and pushed. See the T2 ledger entry: the load bearing discovery is that the obvious rule (let go on the first "lands") strands a new player on system 2, so the tutorial teaches the gate. **Next action: T3, the ferro feel pass.** Known targets going in, all found by looking rather than by testing: the ball is the least ferrofluid looking thing on screen at gameplay scale, the deck is a flat wireframe rather than machined metal, and the inversion collapse has never been shot at all. Also worth a look in T3: the throttle fill reads as a seam rather than a gauge.

**2026-09-01 (builder, T3 partial).** Shipped and pushed: the inversion fix, the machined deck, the cached deck face, chevron box collisions. See the T3 ledger entry. **Nothing is half finished in the tree** — every commit is green on all three suites.

**Next action: finish T3, then T4.** (D2 was repaired out of order after the audit; see its ledger entry.) The remaining T3 work is the ball and the far side, both listed in the ledger entry. Two things to carry in:
1. **Re-measure the frame budget on a quiet box before touching rendering again.** The numbers here were taken while another agent drove browsers on the same two cores, and A/B profiling came out backwards.
2. **T4 will break the T2 acceptance test on purpose.** It requires a bot following only the tutorial to reach system 3, and T4 moves gates off the natural sweep so parts become mandatory. When it goes red, that is the test doing its job: the tutorial then has to teach placing a part, and a fourth beat is the likely answer.

**Older note, still true.** Before starting a phase: the three suites are `smoke` (headless sim), `sweep` (solvability, must stay byte identical unless a change is meant to move physics) and `ui` (real browser, sizes, reachability, copy). `test/ui.js` and `test/harness.js` both read `TANGENT_HTML`, an env var pointing at a mutated scratch copy, which is how every new gate here was proven able to fail (`sed 's/thing/broken/' index.html > /tmp/m.html && TANGENT_HTML=/tmp/m.html node test/ui.js`). Keep doing that: one gate in this phase passed against a build with the feature removed before it was rewritten.
