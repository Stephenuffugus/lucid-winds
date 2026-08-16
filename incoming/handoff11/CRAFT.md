# CRAFT.md — THE STANDOUT BIBLE (mandatory reading, applies to all five games)

The plan files make the games CORRECT. This file makes them STAND APART. Every section here is in-scope for the build — it is cheap on top of the architecture we chose (deterministic SIM + seeded RNG buys most of it for free). When time runs short, per-game craft sections rank what to cut LAST.

## A. Feel standards (the juice ledger)

- **Input latency budget:** input handled the same frame it arrives, applied at the next SIM tick via a 1-slot queue. TEST-assert a queued input is never dropped or doubled.
- UI motion 120–180ms ease-out only. Gameplay feedback is allowed to be faster and punchier: 2-frame hit-stop on meaningful impacts (WIREWORM completion, SIEGE player hits), never on routine movement.
- Numbers never snap: scores/cash/depth roll through an odometer tween (tabular-nums so nothing jitters).
- Screen shake: max 4px, 120ms, decaying; ONLY for run-ending or run-defining events. `prefers-reduced-motion` kills shake AND particles AND flash frames entirely (already law) — but keep the hit-stop and audio, which carry feel without motion.
- Particles: pooled, cap 200 live, transform/opacity only, no layout writes ever.
- **Haptics:** `navigator.vibrate` behind a settings toggle (default on where supported): 10ms for a routine confirm, 25ms for a scoring beat, `[30,40,80]` for a run-ending event. Only after first user gesture. Wrap in try/catch, feature-detect.
- Pause on `visibilitychange` hidden — SIM time is a parameter, so this is one line; never let a backgrounded tab eat a run.

## B. Audio identity (this studio has a music producer at the top — the games should sound like it)

- One lazily-created `AudioContext` on first gesture (autoplay law). Master chain: everything → `DynamicsCompressor` (soft limiter) → destination. Persisted volume + mute in settings.
- Build a tiny shared synth kit inside each file (copy, don't import): `noiseBurst(dur, filterHz)`, `pluck(freq, dur)` (osc + exponential gain decay), `pad(freqs[], attack, release)` (2 detuned saws → lowpass), `blip(freq)` (4ms square). All sounds are recipes on this kit — zero samples, zero network.
- **Each game is in a key.** Pick a root + scale per game (stated in its craft section) and quantize EVERY pitched sound to it. Combo ladders, win stingers, and UI blips become musical instead of noisy. This one rule is the single biggest audible differentiator from every other single-file web game.
- Silence is a tool: the tension mechanics (DEEPWELL's air margin, SIEGE's breach) speak loudest when the comfortable state is quiet.

## C. The meta layer every game ships with (deterministic RNG makes all of this nearly free)

- **Seed links:** `?seed=<n>` boots that exact run. Every share includes it. "Play the same shaft I died in" is a standout no competitor's clone will have. Daily mode is just the daily seed through this same door.
- **Input-log replays:** record the run's input list (tiny — ints). Persist the log of the BEST run per game/level. A replay mode feeds the log back through the SAME `step()` — watch-your-best, watch-your-death. Also the QA superpower (see F).
- **Stats + history:** lifetime stats object (runs, deaths, totals per game) and a last-10 run history screen, styled per game. Read-modify-write on every save; counters ADD, bests MAX (two-tab law).
- **Daily streak:** consecutive-day counter on daily completions, shown on the daily card. Read-modify-write.
- **Share:** `navigator.share` → clipboard fallback with a toast. Copy has no dashes, includes the seed. Result strings are spoiler-free.

## D. Options panel standard (one small ⚙ surface, identical bones in all five)

Sound volume/mute · haptics on/off · reduced motion (auto-detected, manually overridable) · game-specific toggles listed in each plan (e.g., BLACKOUT auto-mark, PARALLEL ghost path). Colorblind safety is not a toggle — shape/pattern/glyph always doubles color, verified in the LOOKING pass by re-reading the screenshots squinting for a grayscale world.

## E. Install and PWA polish

- Manifest: `name`, `short_name` (≤12 chars), `display: "standalone"`, `orientation: "portrait"`, `theme_color` = the game's accent, `background_color: "#0a0b0f"`, all three icons.
- iOS metas: `apple-mobile-web-app-capable`, status-bar style, `apple-touch-icon`.
- Install nudge: a quiet one-line prompt AFTER the first completed run only (capture `beforeinstallprompt`, never beg upfront).
- Icons: generate per game with a throwaway puppeteer/canvas script — accent motif on the dark base (DEEPWELL: a shaft cross-section; BLACKOUT: a keyhole; PARALLEL: twin dots; WIREWORM: a closed circuit; SIEGE: one figure before a gate). Same script renders the maskable variant with 20% safe padding.

## F. The dev tooling arsenal (use ALL of it — this is how the builds get intricate without getting fragile)

1. **`tools/shoot.mjs`** (write once in handoff11, reuse per game): puppeteer opens the page at 390×844 AND 1280×800 with `?probe=<random>`, plays 10–20 scripted inputs, screenshots to the scratchpad. Then READ the images and name three defects (LOOKING law). Shoot the worst states on purpose: mid-death, longest strings, board 90% full, options open over gameplay.
2. **Tap probe:** at 375×667, for every interactive control compute the rendered rect, assert ≥48px in both dimensions, and verify `document.elementFromPoint(cx, cy)` resolves to the control (never `el.click()` — hit-testing law).
3. **Grep gates (run before declaring any game done):** no `Math.random` between the SIM_EXPORT markers; no `document|window|canvas|performance|requestAnimationFrame` inside SIM; assertion count ≥80 (count the harness output, don't estimate); no dash characters in player-facing strings (grep the DATA/copy tables).
4. **Repo gates:** `scripts/page_health.mjs` on each new page; `scripts/sw_purge_audit.js` after adding each `sw.js` (it self-tests or exits 2).
5. **ASCII frame dumps:** `sim.js --watch=<seed>` prints the board/lane/grid as text frames every N ticks. LOOK at three runs per agent before trusting any sweep number — a green sweep over garbage behavior is the classic trap here.
6. **Fuzz-to-regression pipeline:** any fuzz failure prints its seed + input log; paste it into the TEST file as a named regression assertion before fixing. Crashes become permanent tests, not anecdotes. This is how the assertion counts climb past the floor honestly.
7. **Watch-it-fail discipline** stays per-gate (each plan names a deliberate break for its sweep).

## G. Performance budget

60fps target on a midrange phone: canvas games redraw whole-frame (these boards are small — fine), DOM games touch only transform/opacity in per-frame paths. No allocation in the tick loop (pool objects, reuse arrays). Page weight well under 200KB — there are no assets to blame. Time-to-interactive under 1 second; the game is playable before the SW even registers.

## H. Copy voice

Sky Wolf voice: concrete, warm, a little dry. No dashes anywhere player-facing. No filler exclamations. Loss screens teach or twist the knife with specifics, never console ("You surfaced with nothing. The beryl is still down there."). Every screen's longest string gets rendered and LOOKED at on the phone viewport.
