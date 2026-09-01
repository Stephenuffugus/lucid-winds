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

- [ ] T1: smoke ___ / sweep table logged · camera check red-then-green · dead symbols 0 · shots read: ______
- [ ] T2: tutorial once-only proof · fresh-profile run: ______
- [ ] T3: shot pairs: ______ · fps @4x: ___ · fixed-seed identity check green
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
