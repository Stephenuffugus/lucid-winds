# HANDOFF-CONDUIT — the master build plan for Opus
**Written 2026-09-01 by Fable after full assessment of the phone-built design + prototype.**
**Director: Stephen. He makes every design and economy call. Fable reviews your work and deploys it. You build.**

---

## 0. RULES OF ENGAGEMENT — read before anything else

1. **File fence.** You touch ONLY `satellites/conduit/**` and this file's checkboxes. You do not touch `portal/index.html`, `index.html` at repo root, any other satellite, `scripts/`, or the service worker. Portal carding and deploys are Fable's job.
2. **Branch law.** Work on `add-sproing-jumper`. Commit small, push `origin add-sproing-jumper` after EVERY commit. **NEVER push to `:main` or `origin main`. Never. A deploy is Fable's move.**
3. **Gates are real.** Each phase below ends in a gate with evidence checkboxes. You may not start phase N+1 until phase N's boxes are checked with evidence written next to them (a number, a filename, a command output line — not the word "done"). A gate you have not personally watched FAIL at least once is decoration: for every gate, first break the thing it checks, watch the gate go red, revert, then trust it.
4. **`node test/smoke.js` (from `satellites/conduit/`) before every commit.** It is 57 assertions today and only grows. If you add a mechanic, you add assertions for it in the same commit.
5. **The mass-ledger invariant assert never gets commented out, weakened, or tolerance-widened.** If it fires, stop feature work and find the leak. Every bug in this game is a mass leak.
6. **`CFG` is the only home for numbers.** A magic number in logic is a bug. The existing prototype honors this; keep it perfect.
7. **The `globalThis.CONDUIT` test surface never shrinks.** New systems get exported onto it.
8. **One file.** `index.html` stays single-file through phase C4. No build step, no bundler, no modules, ever.
9. **Update `satellites/conduit/HANDOFF.md` at the end of every session**: state, half-done work, next action. That file is the session-to-session memory; this file is the plan.
10. **str_replace-style exact-match edits, and every patch must verify its match landed** (a silent no-op patch hid a real fix from us once; check the file changed).
11. **When a phase says SCREENSHOT, you take the screenshot, open it with the Read tool, and write down three things wrong in it before proceeding.** Wiring art is not seeing art. A green test is not a look.

---

## 1. WHAT CONDUIT IS (and why it is worth a full day)

You are an alien ferrofluid — matte black, iridescent at the edge, spiking along field lines. You infiltrate an industrial site and take it apart using the site's own machinery, and **the wire you power it with is your own body**. One number, mass, is simultaneously health, ammo, reach, size, and stealth profile.

- Route power by stretching yourself along the path and leaving that part of you there (a Flow Free routing puzzle that costs your own body).
- Thin (<30 mass) fits vents and is near-invisible but can't fight or fund wires. Full (>70) forces doors but is slow and conspicuous. The thresholds are absolute and mutually exclusive on purpose.
- Detection escalates a 5-state site alert ending in lockdown (power cut sitewide — you keep playing, disarmed, and re-energize via the breaker).
- Prowl verbs for the unwatched problem (smother, tap, drink-a-light, bodies-are-evidence); the wire for the watched one.
- A Metroid progression layer where unlocks re-price old levels instead of unlocking doors (splice along the site's own wiring for 0 mass, splitting into multiple blobs, junctions, insulation).

**The design work is genuinely excellent and it is already stress-tested.** Read, in this order, before writing a line of code:
1. `satellites/conduit/docs/DESIGN.md` — the spec. Sections 2–6 are load-bearing. Appendix A is the ferro rendering math, already verified.
2. `satellites/conduit/docs/DESIGN-ADDENDUM-1-prowl.md` — the sneaking verbs and the rule that keeps direct verbs from breaking the wire game.
3. `satellites/conduit/docs/DESIGN-ADDENDUM-2-progression.md` — the unlock law: re-read, don't re-walk. Three tests every unlock must pass.
4. `satellites/conduit/docs/BUILD-PLAN.md` — original milestone thinking and the risk register. The risk register is binding.
5. `satellites/conduit/HANDOFF.md` — the state doc. M0 is complete.

---

## 2. STATE OF THE INHERITANCE (verified by Fable, 2026-09-01)

What the phone build delivered, and what I checked:

- `satellites/conduit/index.html` — a complete, playable Phase 0 prototype (~1000 lines). **Verified: boots headless and in Chromium, full loop present** (route → trigger → harvest → reclaim, smother/tap/douse, 5-state alert with lockdown + breaker, ledger with per-frame assert, four medals, splice affordances already drawn dim in the level).
- `satellites/conduit/test/smoke.js` — **verified: 57 assertions, 57 passing**, including the invariant under 20k random ops and a scripted end-to-end solve of the intended trap.
- `satellites/conduit/test/harness.js` — **the zip did NOT include this; Fable reconstructed it.** It extracts the script from index.html and runs it DOM-less. Do not lose it again.
- Doc drift to ignore: HANDOFF.md says "confirm 33/33" in one place — the suite is 57. The zip's game file was named `index-57.html`; it is now canonical `index.html`.
- **Fable looked at it** (screenshots at phone-landscape 844×390). Three things wrong, in order of pain:
  1. **The site floats in a sea of pure black void.** At landscape phone aspect most of the screen is empty blackness with no frame, no vignette, no sense that the darkness is *place* rather than *nothing*. This is the single biggest first-impression problem.
  2. **Zero ferrofluid identity.** The player is a 10px plain ring. `CFG.ferroRender` exists as a flag and Appendix A is verified math, but none of it is wired. Given the Director's directive (section 3) this is the heart of the build.
  3. **HUD is developer furniture.** ~12px text, raw mass bar overlapping the corner, rectangle buttons. Functional, styleless.
- Known rough edges from the designer session, confirmed still present: drag-only route drawing (fiddly on phone), corridor drone patrol possibly harsh, guard-walks-wire latches once (`cd.walked`), breaker route untested by hand.

**Bottom line: the sim is real, tested, and coherent. What is missing is everything the player sees, hears, and feels.** That is exactly the shape of work this handoff assigns.

---

## 3. THE DIRECTIVE — "I want it to feel and look like ferrofluid"

Stephen's exact requirement. This is the bar the whole build answers to. What it means concretely:

- **Matte black body, iridescent only at the edge.** Ferrofluid is not shiny all over. Near-black radial body (#232733 → #05060A), a thin oil-slick rim (violet 268 → gold 44 across the field axis), one small specular. `paintFerro` in Appendix A already does this — wire it, don't reinvent it.
- **It spikes along field lines** (Rosensweig instability). `ferroBlob` in Appendix A deforms the outline with pole + cone terms driven by a field angle. Field priority: nearest live conduit direction → nearest powered source → velocity. The spikes are INFORMATION — a reader should be able to tell where power flows by the creature's hair.
- **It is a liquid, so it must move like one.** Render radius chases true radius on a spring (k≈12, damping≈0.8) so harvests visibly swell you and hits visibly ripple. Squeezing through a gap draws a stretched capsule (length ∝ speed, width = gap). Laying wire should look like the blob EXTRUDING itself, reclaiming like slurping itself back up — the reclaim retraction at 6 tiles/s already exists in the sim; render it as a ribbon flowing home.
- **The conduit is the same creature.** A laid run is a thin ferrofluid ribbon through tile centres, spikes standing up when live, lying flat when dead, with the same rim treatment. Live wire should visibly *carry* something (a slow pulse of rim-light travelling source → device).
- **The world owns no color; the creature owns all of it.** Site palette stays desaturated near-greyscale blues; the only saturated hues on screen are the creature's rim, live wire light, and device/alert states. This contrast IS the art direction.
- **The void must become place.** Darkness outside the site gets a barely-there texture/vignette treatment so the frame feels intentional at every aspect ratio. Letterbox thinking, not bleed.
- **NEVER a generated or static asset for the creature or the conduit.** They are field-reactive procedural geometry. Meshy/image-gen is for later set dressing only (phase C6+), never for the fluid.
- **60fps on a mid-range phone.** Budget: update ≤5ms, draw ≤8ms. `ferroBlob` at detail 96 per blob is cheap; vision cones are the risk — cap ray counts, precompute what you can. If the ferro pass costs frames, reduce detail adaptively, never the identity.
- Simulation stays gameplay-simple: **no fluid dynamics, no particles-as-physics, no CFD.** Circle-vs-tile collision, mass thresholds. The fluid is a rendering layer over a crisp game.

---

## 4. ARCHITECTURE LAW (unchanged from the design, binding)

- The 2D tile sim is the single source of truth, forever. Any camera fanciness is a renderer.
- `player.blobs` is a LIST (already is — length 1). Splitting in C5 must be a control-scheme feature, not surgery.
- All randomness through one seeded PRNG so any playtest replays from its seed.
- Detection is never instant failure; it escalates. Lockdown disarms, never kills.
- The reclaim tax (75% refund) is the central tension. No trait, upgrade, or tuning pass ever moves it toward 100%. Upgrade reclaim SPEED if mastery needs selling.
- Squeeze (<30) and force (>70) thresholds are absolute and never scale with capacity growth.
- Devices are never built by the player; they repurpose what the level authored.
- Every future device must explain itself when tapped (needs, effect, why it is off) or it does not ship.
- Every level must contain at least two affordances its current tools cannot use (site wiring, an over-long vent, an out-of-budget source). Players walk past them and wonder.

---

## 5. THE PHASES

Phases are C1–C6. Hard exit gates. Evidence checkboxes live in section 6 — fill them there as you go.

### C1 — Integration and the frame (do this first, it is small)
Make the vendored prototype a first-class Sky Wolf citizen without changing gameplay.

- Verify `node test/smoke.js` 57/57 from `satellites/conduit/` before touching anything.
- Title screen: real one. Name "CONDUIT", no "phase 0" developer copy. Rewrite intro copy for players (short, no jargon, and **no dashes anywhere in player-facing copy — house law**). Brand line: Sky Wolf Studio (singular).
- **Kill the void:** letterbox/vignette treatment so out-of-site darkness reads as intentional at 320px-wide portrait through desktop widescreen. Test at 320×568, 375×667, 844×390, 1280×800. Use `visualViewport` for sizing, never `innerHeight`.
- HUD pass to house standards: readable type (≥0.7rem rendered), mass bar designed (it is the game's one number — make it beautiful: a thin ferro ribbon that thins as you spend is on-theme), buttons ≥48 CSS px AT 375px WIDTH RENDERED (measure rendered px, not authored px), safe-area insets respected.
- Contextual ACT button and PULSE/TAP/FLOW/RECLAIM: verify each control works by `document.elementFromPoint` at the control's centre in a headless run — never prove a control with `el.click()`.
- Wire `?v=` cache-busting discipline into any asset reference you ever add (there are none today; keep it that way until C6).
- Add `PLAYTESTS.md` entries template usage (file exists) and log your own five runs.

**GATE C1:** smoke 57/57 · screenshots at all four viewports opened and read, three faults named and fixed or ticketed · a full run (enter → trap → harvest → reclaim → exfil) completed by you in a real browser, seed logged.

### C2 — The loop, hardened (the ship-gate support phase)
The M1 ship gate ("is it fun with rectangles?") is **Stephen's call, not yours and not mine.** Your job is to make his playtest maximally informative and remove known friction that would pollute the answer.

- **Route-draw assist:** tap a source, tap a device, auto-route the cheapest legal path, then let the player drag segments to edit. Keep raw drag as well. This was the top predicted phone-friction item.
- Soften the corridor drone: shorten `S.enemies[1].route` per the designer's note (patrol length, NOT spot rates).
- Guard-walks-the-wire: keep the once-only latch but add `CFG.guardRewalks` flag for testing the alternative.
- Breaker/lockdown loop: play it by hand three times; fix what is broken (it is untested by hand — expect at least one bug).
- Debug/replay: on-screen seed display, `?seed=` URL param, a dev overlay (gated behind `localStorage.sws_dev_ok=1` like the rest of the studio) showing alert state, spot progress numbers, ledger tail.
- A settings drawer stub: sound toggle (for C6), haptics toggle, left/right hand button layout.
- Five personal playtest runs logged in PLAYTESTS.md with seeds and CFG diffs, answering the four M1 questions honestly as YOUR read (labelled as builder's read; Stephen's verdict column stays empty for him).

**GATE C2:** smoke green (with new assertions for auto-route legality: never crosses, never through walls, cost equals manual cost of same path) · breaker loop completed by hand, bug list written · PLAYTESTS.md has 5 dated entries with seeds.

### C3 — THE FERRO PASS (the heart of the build; take the whole afternoon)
Section 3 is the spec. Flip `CFG.ferroRender` to true and make it real:

- Blob body: `ferroBlob` outline + `tracePts` + `paintFerro` from Appendix A (already in DESIGN.md, verified math — copy faithfully). Field angle from the priority chain; strength from context (near live wire/source = high, coasting = low).
- Spring-damped render radius; harvest swell; damage ripple (radius dip + rim flash).
- Squeeze capsule when passing squeeze-only tiles.
- Conduit as ferro ribbon: flat and matte when dead, spikes up + travelling rim-light pulse when live, visible retraction flow on reclaim. Discovered wire gets a subtle wrongness (guards' torchlight catches it).
- Laying animation: the blob visibly extrudes the ribbon from its own edge; mass bar and body radius shrink in sync.
- Flow mode transition: camera lifts (scale + slight tilt illusion in 2D is fine), site dims, exposure tiers shade visibly, time to 10%. Make entering Flow feel like the creature spreading its awareness.
- Alert-state ambience: calm = near-still air; each escalation stage adds visible tension (light temperature, cone brightness, subtle screen-edge treatment at Alarm+). Exposure must NEVER be encoded in color alone (colorblind law — the prototype hatches concealed tiles; keep and beautify that).
- Light pools, drink-a-light: dousing should look like the fluid EATING the light — pool dims into the blob, rim flares briefly gold.
- Performance: frame-time HUD in dev overlay; hold 60fps on a mid phone profile (throttled CPU 4x in devtools as proxy). Adaptive `ferroBlob` detail (96 → 48 under load).
- **SCREENSHOT RITUAL, mandatory:** after the pass, shoot (a) the player's normal view mid-heist, (b) Flow mode with two live wires, (c) the WORST shot you can compose on purpose (blob half in a vent at screen edge during lockdown). Open all three with Read. Name three faults per shot. Fix or ticket every one. A 30-second screen recording you would show a stranger is the bar (BUILD-PLAN M2 exit).

**GATE C3:** the three screenshots exist in `satellites/conduit/docs/shots/` and were READ · faults list written · fps evidence at 4x throttle · smoke still green (rendering must not touch sim — assert `step()` output identical for a fixed seed before/after ferro flag).

### C4 — Prowl completion and the device orchestra
Build in the addendum's priority order:

1. **Drag a body** — slow, loud, hands full (no wiring while dragging). The single highest-value stealth addition.
2. **Peek** — tendril around a corner, 1 mass/sec held; renders as a thin feeler with the rim treatment.
3. **Cling** — wall/ceiling flow; halves spot profile; no wire-laying from up there; enables drop-smother.
4. **Pool** — hold still 1.5s to flatten; spot time doubles, movement halves until broken.
5. **Battery cart dragging** — move the source instead of extending the wire; slow and exposed.
6. Remaining devices: floodlight, fan, sprinkler (exists), speaker (exists), crane, door lock, camera, coolant vent, floor plate (exists). Every one obeys the tap-to-explain rule and prints ⚡needs when unpowered. Each device ships with at least one designed interaction with another device or verb (the coolant-vent frozen-enemy-as-battery combo is mandatory).
7. Vehicle battery one-shot burst source.
8. Every verb gets smoke assertions (cost, state transitions, invariant survival) — the suite should be well past 80 by gate.

**GATE C4:** each verb demonstrated in a logged playtest · smoke count written with the new assertions listed · the addendum rule verified by construction: for every direct verb, name the watched situation where it is suicide and the wire is the answer (write the table in HANDOFF.md).

### C5 — Content, progression, persistence
- Level loader: levels as data objects (the format in DESIGN.md §11), inlined in the single file for now. Split the current map into curriculum levels 1 and 2 per BUILD-PLAN §5.
- Author the six-level curriculum (intake bay, coolant floor, vent stack, generator hall, substation, hive spine). Each teaches one idea, re-tests the last two, no tutorial text; each contains ≥2 unusable affordances; each ships with a scripted solvability check in the smoke suite that must survive any CFG change.
- Save/load: localStorage, read-modify-write ONLY (two tabs clobber whole-object writes — house law: merge with counters added and bests maxed), per-site medal state, mid-level suspend/resume.
- Residue spend screen + first trait set (~8 traits from the addendum table: insulation I–III, capacity steps, reclaim speed, pulse range, peek efficiency… **reclaim RATE is forbidden**).
- Splice ships here: flip `traits.splice` purchasable; site wiring lights green, 0-cost routing, +1 alert panel trip on power-over. Verify the addendum's measured claim (28.4 locked vs 21.6 spliced on the old map) still holds as a smoke assertion.
- Anti-grind: replays bank only improvement over previous best per medal axis.
- Site select screen with medal state and visible locked affordances (which tool would finish the unfinished business).
- Splitting (M5) is deliberately NOT in this handoff. `blobs` stays a list; do not implement multi-blob control. That is a Stephen-decision phase after he plays.

**GATE C5:** six levels each beatable two ways (log both paths per level with seeds) · solvability checks in smoke, one per level, all green · save survives reload mid-heist · a scripted replay of level 1 with splice active solves it a visibly different way (assertion comparing route cost).

### C6 — Sound, identity, ship-readiness (only if the day still has room)
- WebAudio procedural bed: site hum that rises with alert state, conduit-live tone, harvest slurp, smother hold, lockdown silence-then-breaker-thump. Procedural first; music files come from Stephen's Suno session (a `conduit` folder of tracks is being generated — wire a `music/` slot pattern with graceful absence, silent if files missing).
- Haptics: `navigator.vibrate` on discovery, damage, harvest, lockdown (respect the settings toggle).
- PWA manifest + icons ONLY if Fable signs off in review — service workers are a studio-scarred area; default is NO service worker.
- Accessibility: reduced-motion mode (spikes damp, pulses become fades), colorblind-verified exposure tiers.
- Do NOT card the game in the portal. Fable cards it dev-gated on review.

**GATE C6:** audio demo run logged · reduced-motion screenshot pair · no service worker added.

---

## 6. EVIDENCE LEDGER (fill in place, with evidence, most recent last)

- [x] **C1 gate** (2026-09-01)
  - **smoke: 123/123** (was 57; `node test/smoke.js`). The inherited 57 were partly
    decoration: `node test/mutants.js` is new and breaks one mechanic at a time in a
    scratch copy, and **ten** load bearing rules stayed green while broken (ledger
    damage, conduit through walls, source budget, lockdown cutting power, squeeze,
    force, smother's unaware rule, concealed conduit, harvest credit, spot decay).
    All ten now drive real code. **Mutation sweep: 30 mutants, 30 killed, 0 survivors.**
  - **controls: 40/40 at 320x568, 375x667, 844x390 and 1280x800** (`node test/controls.js`).
    Every control located by `document.elementFromPoint` at its drawn centre, then
    driven with a real touch at that coordinate, never by calling a handler. Includes
    48px rendered minimums, no overlap, nothing inside a safe area inset, and the
    route drag surviving skipped events and a blocked step.
  - **4-viewport screenshots read** at 320x568, 375x667, 844x390 and 1280x800.
    `docs/shots` keeps one representative frame per state rather than every
    iteration, since `node test/shots.js <tag>` regenerates the lot in a minute:
    `before-*` is the inherited build, `c1-*` and `c2-*` are after each phase.
    Faults found by looking and fixed: title screen
    clipped at both ends unscrollably in landscape (wordmark at y -22); the site
    floating in void (camera now clamped, grain + hairline + corner ticks + vignette);
    corner ticks drawn when their corner was off screen, reading as stray lines;
    device power badge sitting on top of the device label at small tile sizes;
    unlit alert pips invisible so "1 of 5" read as one floating square; HUD text with
    no guaranteed contrast over world content; **and the one that mattered most, the
    control block is opaque to touch and sat over the map's bottom right in Flow, so
    the breaker and the exfil corner could not be routed on at all.**
  - **full run seed: 1337**, driven by real touch events in real Chrome
    (`node test/fullrun.js`, enter to exfil: route two wires by dragging, trap, harvest,
    reclaim both, force the exfil door, extract). Clean at all four viewports.
    844x390: peak alert 1, +1.2 mass, residue 13.2, 41 tiles, 49s.
    1280x800: peak alert 1, +1.3 mass, residue 13.3, 54s, harvest credited 18.0 exactly.
    No mass leak and no page errors on any run. Five runs logged in `PLAYTESTS.md`.
  - **Three real bugs fixed**, each with a regression test and a mutant that kills it:
    the force hold cleared by an axis with no input (harvest beside a door and it could
    never be forced again); a drag that skipped or was briefly blocked silently killing
    the rest of the stroke, with no way for a route that fell behind to catch up; zap
    burn booked to `destroyed` while `debits.zapBurn` stayed permanently zero.
  - **Open for the Director / C2**, written up in `satellites/conduit/HANDOFF.md`:
    the breaker cannot end a lockdown (`resolvePower` skips every conduit while
    lockdown is true, so the breaker can never come on, and `alertDecaySec[4]` is
    Infinity) — the designed recovery loop is dead code, and it is C2's item;
    the documented intended route crosses the patrol it is meant to trap, so the
    designed solve partly self destructs on contact (feature or level authoring, his
    call); and the same script swings +1.2 to -22.9 net mass on timing alone.
- [x] **C2 gate** (2026-09-01)
  - **auto-route assertions added: 20** (smoke section 14). Legality: starts at the
    source and ends at the machine, never through a wall, never through a door,
    every step orthogonal and one tile, never crosses itself. Parity: the assist
    lays the same tiles and costs **exactly** what that path costs laid by hand,
    and charges the body exactly that, because the assist only proposes and
    `draftStep` still lays. Refusal: an unaffordable route is refused whole, never
    laid in part, and costs nothing to be told no. Optimality: checked against an
    **independent relaxation oracle**, not against itself, after the
    `assist-not-cheapest` mutant survived a suite that only proved the route was
    legal and short.
  - **breaker bugs found: two, and they were independent.** (1) Nothing in the game
    ever bumped past alert 3, so **alert 4 was unreachable**: `bump(Math.max(2,
    S.site.alert))` cannot exceed the level it reads. (2) `resolvePower` skipped
    every conduit while lockdown was true, so **the breaker could never come on**,
    so it could never clear the lockdown, and `alertDecaySec[4]` is Infinity. The
    fifth alert state could be neither entered nor left. Sightings now climb the
    ladder (edge triggered on `e.seen`, or a per frame bump reaches Lockdown
    instantly), and lockdown cuts the site's power but not yours, so the breaker
    is the one thing you can still energise. **Played three times in a browser**
    (`node test/lockdown.js`): 41 tiles routed to the breaker in the dark, the
    site comes back at Search, no mass leaked in any round. In one round the
    rescue wire shocked a guard standing on it and burned three tiles off itself
    back off the breaker, after doing its job. 16 assertions, 4 mutants.
  - **A third bug, found by my own change:** shortening the drone patrol to start
    at x 15 **broke the solvability gate**, because it reached the designed
    route's corridor crossing sooner and burned the wire off the plate. The patrol
    is now the east half only, kept clear of x 18 to 22, the only legal crossing.
  - **suite: 162 assertions, 36 mutants, 36 killed, 0 survivors.**
    controls 51/51 at all four viewports. fullrun clean. lockdown clean.
  - **5 playtests logged** in `PLAYTESTS.md` with the C2 findings, plus the five
    C1 entries. Stephen's verdict column is untouched.
  - Also shipped: `?seed=`, a dev overlay behind `localStorage.sws_dev_ok` (seed,
    alert and decay timer, per enemy spot and state, full ledger tail, frame
    times), `CFG.guardRewalks` + `guardRewalkSec`, and a settings drawer where
    sound and haptics record the choice for C6 and handedness actually moves the
    thumb block, stored read modify write.
  - **Two open Director calls, in `satellites/conduit/HANDOFF.md`:** Lockdown
    cannot be reached by shuttling in and out of cover. Measured over eight steps
    out into the patrol and back, the alert went **2, 3, 3, 3, 3, 2, 1, 0**: it
    reaches Alarm on the second sighting and plateaus, because a retreat long
    enough to break line of sight costs more than the next sighting gains
    (Suspicion decays in 8s, Search in 15s). Real play tops out at Alarm. And **`?seed=`
    currently changes nothing**: `S.rng` is created and never consumed and there
    are zero `Math.random` calls, so nothing in the sim is random yet. The
    plumbing is right; do not read a seed in a log as a replay.
  - **Perf before the ferro pass: update 0.07ms, draw 1.32ms** against a budget of
    5 and 8 (dev overlay, 844x390).
- [x] **C3 gate** (2026-09-01)
  - **3 shots in `docs/shots/`, read, with every fault written down in
    `docs/C3-FAULTS.md`**: `c3-a-heist.png` (the player's view mid heist),
    `c3-b-flow.png` (Flow, two live wires), `c3-c-worst.png` (320x568, the
    creature thin and half in a vent, lockdown, one run discovered and another
    mid reclaim). Plus `test/closeup.js`, which crops to the creature and shoots
    at 4x in five states, because the creature is under a tile wide and a full
    frame cannot tell you whether it reads as ferrofluid.
  - **faults:** the powered devices owned all the colour while the creature owned
    none (a straight inversion of the art direction, fixed); the live wire read
    as a gold pipe, then as a comb, then as a centipede before the fringe was
    right; **I could not find the player in the Flow view** (fixed with a minimum
    drawn radius, collision radius untouched); a dead run was nearly invisible,
    which matters because a dead run is committed mass you have to find to
    reclaim; the lockdown banner collided with the mass status line and the toast
    was drawn underneath the control block at every phone size; at Lockdown the
    red screen edge and the red discovered wire were the same red. All fixed.
    Four things ticketed rather than fixed, listed in that file.
  - **⚠️ ONE DEPARTURE FROM APPENDIX A, and it is the reason the creature now
    reads as an oil slick rather than a soap bubble.** The appendix writes the
    rim's middle stop as `(hueA+hueB)/2`. With violet 268 and gold 44 that is
    **156, which is green**: the numeric average takes the long way round the
    colour wheel. The short way runs 268 to 404, midpoint 336, magenta. The
    appendix's geometry is verified and is copied exactly (the suite checks the
    longest spike tracks the field at four angles); its palette arithmetic was
    not. **Fable should sanity check this one.**
  - **fps @4x throttle: the honest answer is that fps is the wrong measurement
    here.** Headless shell does not vsync rAF and reports ~49 to 60fps even
    unthrottled, so throttled fps measures the harness as much as the game. The
    direct CPU numbers, which is what the budget is actually about:
    `update 0.29ms, draw 3.73ms at 4x` against a budget of 5 and 8, so **4.02ms
    of a 16.7ms frame**. At 16x, draw genuinely exceeds the 6.5ms internal
    budget and adaptive detail drops 96 to 48: resolution goes, identity does
    not. A real phone check is still owed and is Stephen's to make.
  - **sim-identity assertion green**, and it earned its place immediately: it
    went red on its first run and the cause was **not the ferro layer**. `cscanT`,
    the conduit scan phase, lived outside `S` and `newGame()` never reset it, so
    the second game in a page inherited the first one's scan timing, discovery
    fired at a different moment and the guard who walks the wire arrived
    somewhere else. **A restart was not a fresh game.** Fixed, and gated
    separately by a three-consecutive-games assertion.
  - The assertion is not the toothless version: nothing renders headless, so
    comparing the flag off and on alone would prove nothing (a step that never
    ran looks exactly like a step that changed nothing). The ferro run drives
    `updateFX`, `fieldTarget` and `ferroBlob` every frame, so if any of the feel
    layer wrote to game state the signatures would diverge.
  - **suite: 178 assertions, 40 mutants, 40 killed, 0 survivors.**
    controls 51/51 at every viewport. fullrun clean.
- [ ] C4 gate: smoke count: ___ · verb suicide-table written in HANDOFF.md
- [ ] C5 gate: 6/6 solvability checks · two-path logs · splice-differs assertion green
- [ ] C6 gate: audio demo · reduced-motion pair · NO service worker confirmed

---

## 7. STUDIO RESOURCES YOU MAY DRAW ON

- **Ferro math:** DESIGN.md Appendix A — verified, copy faithfully.
- **Music:** Stephen is generating a `conduit` Suno folder (dark liquid electronica / stealth ambient techno / alarm escalation). Build the slot, ship silent.
- **Headless browser:** puppeteer is installed at repo root (`/workspaces/lucid-winds/node_modules/puppeteer`) with cached Chrome — use it for screenshots and control-hit-testing. NEVER delete `~/.cache/puppeteer`.
- **Later (NOT this handoff):** Meshy+Blender prop pipeline exists (see ripcord's forge3d) for a possible C7+ 3D camera; image-gen for desaturated 512² tile textures at the texture gate. The creature and conduit stay procedural at every gate forever.

## 8. PITFALLS — studio scars that apply here, learn them free

- A probe that cannot fail is not evidence; a frozen value satisfies `>=`; a step that never ran looks exactly like the bug. Mutation-test your own gates.
- Never prove a control with `el.click()` — elementFromPoint at its centre.
- 48px touch targets are RENDERED px at 375 width.
- `canvas.width =` CLEARS the canvas — guard resize + repaint.
- Late CSS blocks override earlier ones silently; keep the stylesheet ordered.
- Two tabs clobber read-once-write-wholesale localStorage.
- Liveness probes never use rAF; stub rAF in headless runs — you own the clock.
- A tick that eats the world: any per-frame loop that mutates collections must be bounded and asserted.
- No dashes in player copy. Brand is Sky Wolf Studio, singular. No claiming anything is hand-painted.
- Never write a `[x]` before the work exists.

## 9. WHAT HAPPENS AFTER YOU

Stephen plays the build on his phone and answers the M1 ship-gate question for real. Fable reviews your diff, cards the game dev-gated in the portal, deploys, and runs the fine-tuning passes with Stephen (CFG tuning, difficulty, splitting decision, 3D camera decision). Your job is to hand them a game that already looks and moves like living ferrofluid, plays a complete honest loop, and proves itself with every gate's evidence written down.

Build well. The design deserves it.
