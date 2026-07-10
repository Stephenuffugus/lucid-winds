# DRAFT — Codespace Handoff

**Game:** *Draft — an homage to "Try Not To Fart"*
**Publisher:** Lucid Games / SWS Strategic Media LLC
**Stack:** single-file vanilla HTML/CSS/JS, no build step, mobile-first, offline-capable PWA
**File:** `draft.html` (~997 lines, one self-contained document)
**Status:** Content-complete and playable. Validated (syntax, element-ID cross-check, tag balance, and a headless sim across tutorial → full game → game-over → medals → stats → replay, all clean). Remaining work is backend + deploy, not gameplay.

---

## 1. What the game is

A two-thumb composure game. Pressure only ever climbs. You **clench** two pads to hold it in, **plug leaks** before they squeak, and **vent** only during a **cover noise** (applause, thunder, a passing bus…). Any sound the room hears is a **strike**. Three strikes and you're exposed.

The joke is the framing: it's presented as a silent film (title cards between "acts", period waiting-room palette) because the whole game is about *making no sound*. All audio is synthesised in Web Audio — there are **no asset files**.

## 2. What's built (all done, in-file)

- **Core loop:** two clench pads with independent **strain** (fills while held, recovers while released; maxing it = a **slip** — pad disabled ~1.3s + pressure spike + squeak). Forces hand-over-hand juggling.
- **Cover-noise venting:** 11 cover archetypes; VENT arms only during a cover window. A shrinking timer bar shows the window; venting in the first 40% = **Perfect** (1.5× bonus). Venting with **no** cover = audible fart + strike.
- **Leaks:** bubbles with countdown rings; tap to plug before they burst.
- **Combo multiplier** ×1.0→×5.0; any audible sound resets it. **Callouts** fire at combo milestones ("COMPOSED → ICE COLD → UNTOUCHABLE → INHUMAN").
- **12 scenes** (Funeral, Interview, First Date, Live On Air, Silent Yoga, Wedding Vows, Library, Elevator, Recital, Confession, Meditation Retreat, Baby's Nap), each with its own weighted cover pool, a cover-frequency multiplier, and three escalating room-reaction lines.
- **3 modes** (Easy / Normal / Panic) via a `MODES` multiplier table.
- **Interactive tutorial** — auto-runs on first launch (skippable, replayable via "How to play"). Six steps teach clench → strain/swap → cover-vent → Perfect → plug. Runs live but invincible (pressure clamped, no strikes), with scripted covers/leaks and per-step completion conditions + time fallbacks so it can't soft-lock.
- **12 medals** with earn-toasts + a medals screen; **lifetime stats screen** (longest hold, total time, leaks plugged, perfects, best combo, sunbeams, per-mode bests).
- **Continued difficulty ramp** — pressure-rise keeps climbing past the old cap at a softened slope (`rampSoftSlope`), so long runs and Panic keep tightening instead of plateauing. (Cover-duration / leak-life / score ramp stays capped so those don't spiral.)
- **"The whiff"** — a rare, telegraphed pressure surge; hitting it while clenching both hands cuts it to 30%. Rewards keeping both thumbs ready. Fully tunable (`whiffOn` + timing).
- **Juice/UX:** animated SVG face that degrades by pressure tier (calm→nervous→strain→critical→blowout/relief) with sweat drops + flush; screen shake; floating score popups; haptics; pause + auto-pause on blur/visibility change; sound + haptics toggles; persistence; inline PWA manifest with runtime-drawn canvas icons (installable, still one file).

## 3. Architecture (single `<script>` IIFE)

Ordered sections:

1. **DATA** — `ROMAN`, `COVER_TYPES` (ico/label/audio archetype), `SCENES` (covers/coverMul/reacts), `CFG` (all base gameplay numbers), `MODES` (per-difficulty multipliers), `MEDALS` (id/ico/name/desc/check).
2. **STORE** — guarded `localStorage` wrapper with in-memory fallback (`mem`) so the sandbox preview never throws; `get`/`set` helpers. Keys in `K` (bests/sun/plays/toggles) and `L` (lifetime stats + medals + tutorial-seen).
3. **AUDIO** — Web Audio synth: `fart`/`squeak`/`plugSfx`/`chime`/`perfectSfx`/`comboSfx`/`coverSfx(archetype)`/`haptic`. `unlockAudio()` lazily creates the context on first gesture.
4. **ELEMENTS** — `$` = `getElementById`; cached refs.
5. **STATE** — `newState()`, the `S` object, phase machine (`playing`/`tutorial`/`paused`/`over`), and helpers `rampCont`/`rampLevel`/`effRamp`/`riseRate`/`comboMult`/`comboMultFrom`/`isLive`.
6. **FLOW** — `begin`, `showIntro`, `openCover`/`closeCover`, `startWhiff`, `spawnLeak`/`plugLeak`/`burstLeak`/`clearLeaks`, `bumpCombo`/`breakCombo`, `addStrike`/`doVent`/`blowout`, `evalMedals` + toast queue, `gameOver`/`awardSunbeams`, pause/menu nav, `openMedals`/`openStats`/`buildMedals`/`buildStats`/`fmtTime`.
7. **TUTORIAL** — `TUT_PROMPTS`, `startTutorial`/`setupTutStep`/`nextTut`/`endTutorial`, `tutStep` (per-step state machine), `tickTutorial` (reduced invincible sim).
8. **MAIN LOOP** — rAF; clamped `dt`; branches to `tickTutorial` for the tutorial phase, else the full playing sim (cover/leak scheduling, strain/slip, pressure, whiff, blowout, scoring).
9. **RENDER** — gauge/face/strain/vent/flood, plus an injected stylesheet mapping `face[data-tier]` → visible expression group.
10. **FX** — `floatText`, `callout`, `roomReact`, `shake`.
11. **INPUT** — multitouch pads (per-pad pointer-id Sets + pointer capture), vent, keyboard (F/J/Space/Esc), auto-pause, menu/mode/settings wiring.
12. **PWA + init** — inline blob manifest + canvas icons; first-run auto-launches the tutorial.

## 4. Where to tune

- **`CFG`** — every base number (rise rates, ramp, strain, cover timing + perfect window, scoring, leaks, combo, whiff, scene/intro durations). `rampSoftSlope` controls the post-cap difficulty climb; `comboCallouts` is the `[[count, "TEXT"]]` list.
- **`MODES`** — Easy/Normal/Panic multipliers over the CFG baseline.
- **`SCENES`** — add/rename acts; each is `{t, s, covers[], coverMul, reacts[]}`. Cover keys must exist in `COVER_TYPES`. Extend `ROMAN` if you exceed 12 acts.
- **`MEDALS`** — each `check(run, lifetime)` gets `run = {time, perfects, plugs, maxCombo, scenes, mode}` and `lifetime = {modes[]}`.

## 5. TODO in Codespace (priority order)

1. **Firebase + sunbeams.** `awardSunbeams(n)` is the single hook (marked `TODO(codespace)`); it currently just banks locally and stashes `window.__DRAFT_LAST_SUNBEAMS`. Wire it to your Cloud-Functions wallet, and sync bests/medals/lifetime stats + `draft.tutseen` to the user doc so progress follows the account across devices. The `store` wrapper is the seam — swap its guts or mirror on write.
2. **Service worker** for true offline install (cache the single file + manifest). Everything else is already inline.
3. **Playtest-tune** on real hardware: perfect-window feel, ramp aggressiveness (`rampSoftSlope`), whiff frequency, leak density on Panic. The sim validates it *runs*; it can't tell you it *feels* right.
4. **Content:** more scenes/covers if you want; the data tables are the only thing to touch.
5. **Share / leaderboard:** score-share card + optional cross-game board.
6. **Polish:** richer cover SFX, optional music bed, settings for sensitivity.
7. **Deploy** to the site under the Lucid Games portal.

## 6. Test checklist

- [ ] First load auto-starts the tutorial; Skip and full completion both land on the menu and set `draft.tutseen`.
- [ ] "How to play" replays the tutorial; it can't soft-lock (each step self-advances or is trivially completable; Skip always works).
- [ ] All three modes start; Panic clearly harder and keeps ramping in long runs.
- [ ] Cover vent vs. no-cover vent behave correctly; Perfect window rewards early release.
- [ ] Leaks plug on tap and burst on timeout; combo builds and resets on any audible sound.
- [ ] Slip triggers at full strain; whiff telegraphs then surges (reduced when both-clenched).
- [ ] Three strikes → game over with correct time/combo/score/sunbeams; new medals toast; medals + stats screens populate.
- [ ] Multitouch: both pads independently while a third tap hits VENT/leaks. Backgrounding pauses a live game.
- [ ] Installs as a PWA; runs offline once a service worker is added.

## 7. Conventions

Single file, no build, no external requests at runtime. All persistence goes through the `store` wrapper (never raw `localStorage`) so the sandbox preview can't break. No frameworks. Keep gameplay numbers in `CFG`/`MODES`/`SCENES` rather than inline. Respect `prefers-reduced-motion` (already wired).
