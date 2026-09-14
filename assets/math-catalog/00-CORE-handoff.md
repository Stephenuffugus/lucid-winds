# CORE — Build Handoff v1.0

**Build this first. Nothing else in the catalog can be built correctly until it exists.**

Audience: a Claude Code instance in a GitHub Codespace.
Depends on: nothing.
Consumed by: all ten games.

---

## 0. An architectural correction to the ten design specs

The ten design specs each say "single-file vanilla HTML/CSS/JS PWA." **That is now superseded, and deliberately.**

Ten independent single files means ten copies of the reveal system, the adaptive model, the line renderer, the audio bindings, the storage schema, and the settings panel. That duplication is the thing most likely to stall this catalog around game four.

**The corrected architecture, which preserves the no-build-step workflow:**

```
/                          ← one origin, one service worker
├── core/
│   ├── core.js            ← this handoff
│   ├── core.css           ← shared tokens + base
│   └── resonarc.js        ← existing audio engine, unmodified
├── crease/index.html
├── brim/index.html
├── yonder/index.html
├── …
├── sw.js                  ← caches core once for all games
└── index.html             ← hub
```

Each game is still **one HTML file with no build step**. It loads two shared scripts from the same origin. The service worker at root caches `core.js` once, so after the first game a child visits, every other game is effectively pre-loaded. That's strictly better than ten self-contained files for offline use, not worse.

**If Stephen prefers true single files, ask before proceeding.** Do not silently inline the core into each game — that reintroduces exactly the duplication this exists to prevent.

---

## 1. Global invariants

These hold in every game in the catalog. Violating one is a bug regardless of what a game-specific handoff says.

| # | Invariant |
|---|---|
| G1 | **No accounts, no email, no name field, no sign-in of any kind.** |
| G2 | **No analytics, no telemetry, no third-party scripts, no network requests after first load.** |
| G3 | **All state in `localStorage`**, namespaced per game, clearable in one action from settings. |
| G4 | **No camera, no microphone.** `getUserMedia` must not appear in the bundle. |
| G5 | **No visible timers, countdowns, or speed scores.** Reaction time may be logged for adaptation and must never be displayed. |
| G6 | **No leaderboards, no scores shown to the child, no comparison between children.** |
| G7 | **No red X, no buzzer, no "Incorrect."** Failure feedback is quiet and factual. |
| G8 | **No reading required to play.** NOTCH additionally forbids numerals; see its handoff. |
| G9 | **60fps on a 4GB Celeron Chromebook**, verified under 4× CPU throttle. |
| G10 | **`prefers-reduced-motion` respected** — but motion that carries meaning is reduced, never removed. |
| G11 | **Full keyboard playability.** Every mode completable with keyboard alone, visible focus ring. |
| G12 | **Audio muted by default on first load**, with an obvious unmute. |
| G13 | **Forbidden strings:** `IQ`, `brain train`, `brain-train`, `smarter`, `cognitive enhance`. Grep must return zero hits across all user-facing text. |

---

## 2. Modules

### 2.1 `tokens` — design tokens

Base scale shared by all games; each game injects its own palette as CSS custom properties on `:root`.

```js
export const TOKENS = {
  type: {
    family: 'var(--game-font, system-ui)',
    scale: [12, 14, 16, 20, 26, 34, 48, 64],   // px, modular
    numeralFeatures: "'tnum' 1, 'lnum' 1"       // tabular lining figures
  },
  space: [0, 4, 8, 12, 16, 24, 32, 48, 64],
  motion: {
    instant: 0,
    quick: 160,
    settle: 320,
    reveal: 600,
    hero: 900
  },
  touch: { min: 48, comfortable: 56, child: 64 }
};
```

**Numerals must render with tabular lining figures** everywhere in the catalog. Proportional or oldstyle figures make digits jump between frames during adaptive updates and make 1/7 and 6/8/9 harder to tell apart for young readers.

### 2.2 `reveal` — the feedback system

The single most important shared module. Every game's teaching happens here.

```js
reveal.show({
  correct: false,
  near: false,
  learnerMark:  { /* where the child put it */ },
  truthMark:    { /* where it actually is */ },
  gap:          { /* optional shaded region between them */ },
  caption:      '3/4 is here',
  animate:      (t) => { /* game-specific, t = 0..1 */ },
  onDone:       () => {}
});
```

**Contract, enforced by convention and reviewed in every game:**

1. **The child's answer is always shown first and is never erased.** Their idea gets taken seriously and rendered before the truth appears beside it.
2. **The truth appears second**, never as a replacement.
3. **Captions state facts, never verdicts.** `3/4 is here` — not "wrong," not "you missed," not "try again."
4. **The same animation runs on success and on failure.** Only the caption differs. This is what makes failure cheap.
5. **Near-misses count as correct** and still show the truth, with a `close — ` caption prefix.
6. **No color change signals correctness.** No green flash, no red flash. Games signal success through their own diegetic means (a span seating, a piece thunking home, a creature settling).

### 2.3 `adapt` — the adaptive model

Three strategies, because the catalog needs three genuinely different shapes. Do not force a game into the wrong one.

```js
adapt.tier(history, config)        // tolerance-band ladder    → CREASE, YONDER, GLIMPSE 1-3
adapt.staircase(history, config)   // 2-down-1-up              → GLIMPSE 4, HUSH, CAIRN
adapt.classify(responses, rules)   // response-pattern fitting → YONDER, GAUGE
```

`adapt.classify` is the unusual one and the most valuable. It scores a child's response vector against a set of predicted vectors (one per misconception rule) and returns the best match with a confidence.

```js
adapt.classify(responses, {
  rules: { L: predictL, S: predictS, truth: predictTruth },
  minItems: 12,
  minDiscriminating: 6,
  threshold: 0.8
});
// -> { code: 'L', confidence: 0.91, matches: { L: .91, S: .34, truth: .41 } }
```

**Universal rules for all three strategies:**
- **There is always a floor.** No child is ever routed below the easiest available setting. A child at the floor succeeds; the game never communicates that they've bottomed out.
- **Adaptation is silent.** No level-up animation, no "Nice — harder now," no difficulty indicator.
- **The classification or tier is never rendered to the child.** Teacher views (opt-in, local) are the only exception.

### 2.4 `numberline` — randomized line renderer with loupe

Used by CREASE, YONDER, GAUGE, and TINT's continuous mode.

```js
numberline.create({
  container, min: 0, max: 1,
  divisions: null,              // null = unmarked
  widthPct:  0.72 + Math.random() * 0.22,   // REQUIRED randomization
  offsetPct: Math.random() * 0.08,
  onCommit: (normalizedPosition) => {}
});
```

**Invariant N1 — the line's pixel width and left offset must randomize every round.** Without this, children memorize screen positions instead of learning magnitude, and every line-based game in the catalog silently stops working. Assert variance across 100 generated rounds.

**The loupe** is a magnified slice of the line floating ~64px above the touch point. Mandatory on touch for any drag-to-place interaction — a thumb covers precisely the spot the child is judging.

**GAUGE extends this** with `subdivide(range, level)` for recursive zoom. That extension lives in GAUGE, not here, but it must build on this renderer rather than reimplementing it.

### 2.5 `schedule` — frame-accurate presentation

Required by GLIMPSE, CAIRN, and HUSH, where exposure duration *is* the difficulty parameter.

```js
schedule.flash({ durationMs, onShow, onHide, onMasked });
schedule.now();   // high-resolution timestamp
```

**Invariant S1 — use `requestAnimationFrame` against a measured deadline, never `setTimeout`.** A 400ms flash that renders as 900ms on a slow Chromebook converts a subitizing game into a counting game with nobody noticing.

**Invariant S2 — reaction time is measured from paint, not from schedule.** Timestamp the frame on which the stimulus actually painted. Test by injecting an artificial 100ms render delay and asserting RT does not shift.

**Invariant S3 — every timed presentation is followed by a mask** where the game spec requires one. `schedule.flash` takes `onMasked` and will warn in dev if it is omitted.

### 2.6 `audio` — RESONARC bindings

Thin wrapper over the existing engine. Do not modify RESONARC.

```js
audio.define({ seat: {...}, scrape: {...}, ring: {...} });
audio.play('seat');
audio.setMuted(bool);          // default true on first load
```

**Invariant A1 — never encode a quantity in sound count.** One sound per event regardless of how many items were shown. A chime-per-firefly in GLIMPSE would let children count by ear and destroy the task. This is the easiest fatal mistake in the catalog; put a comment at the call site in every game.

**Invariant A2 — audio is not required to play.** Every game is fully playable muted. HUSH's SIMON mode is the one place audio carries content, and it falls back to large on-screen text.

### 2.7 `store` — persistence

```js
store.get(gameId, key, fallback);
store.set(gameId, key, value);
store.clearGame(gameId);
store.clearAll();
```

Namespaced `lw:<gameId>:<key>`. Schema-versioned — on a version mismatch, migrate or discard, never crash. A child losing their collectibles to a bad migration is a real harm; when in doubt, keep the collectible data and discard the adaptive state.

### 2.8 `settings`

Shared panel, shared keys: mute, reduced motion, show-all-modes (teacher override for unlocks), high-contrast, grayscale (TINT), long-look (GLIMPSE), snap-rotation (NOTCH), presentation-rate (CAIRN), clear-data.

### 2.9 `urlconfig` — teacher parameters

```js
urlconfig.parse();   // -> { mode, ...gameSpecificParams }
```

Every game accepts URL parameters so a teacher can bookmark a configured practice session **without any login**. This is a core differentiator and must work identically everywhere.

One shared **config builder page** at `/config/` lets teachers assemble a URL from dropdowns. Build it once, serve all ten.

### 2.10 `session` — run controller

Handles run length, the end-of-run collectible award, and hard caps.

**CAIRN's five-minute hard cap is implemented here**, not in CAIRN, so the pattern is available to any game that later needs it. When a cap fires, the session *ends* — it does not offer "one more."

### 2.11 `collect` — collectible scaffolding

One earned item per completed run, rendered on a per-game display surface (shelf, wall, map, clearing, case). Cosmetic only. No currency, no purchase, no duplicates grind, no gacha.

---

## 3. Test harness

`core/test.js`, runnable from a plain HTML page with no framework.

**Shared assertions available to every game:**

```js
t.assertNoNetworkAfterLoad();
t.assertNoGetUserMedia();
t.assertForbiddenStrings(['IQ','brain train','smarter','cognitive enhance']);
t.assertKeyboardCompletable(modeId);
t.assertFrameRate({ throttle: 4, minFps: 58, during: fn });
t.assertTimingAccuracy({ targetMs, toleranceMs: 25, throttle: 4 });
t.assertLineRandomization(rounds = 100);
t.assertNoNumerals();              // NOTCH only
t.assertTabularNumerals();
```

**Every game handoff lists its own gates on top of these.** A game is not done until both sets pass.

---

## 4. Build order for CORE

1. `tokens` + `core.css` — palette injection, type scale, tabular numerals
2. `store` with schema versioning and the migration-safety rule
3. `settings` panel + `urlconfig` parser
4. `reveal` — build it against a trivial dummy game and get the contract right before any real game depends on it
5. `adapt.tier` and `adapt.staircase`
6. `schedule` with S1/S2/S3 and the injected-delay test
7. `numberline` with loupe and the N1 randomization assertion
8. `audio` bindings over RESONARC
9. `session` + `collect`
10. `test.js` harness
11. `adapt.classify` — last, and the most subtle; test against synthetic responders before YONDER or GAUGE consume it
12. `sw.js` root service worker + `/config/` builder page

---

## 5. Definition of done

- All twelve global invariants enforceable by a test in the harness
- `reveal` demonstrated against a dummy game, correct and incorrect paths identical except caption
- `adapt.classify` correctly identifies five synthetic responder types across 200 simulations each
- `schedule` timing within ±25ms under 4× throttle, RT unaffected by injected render delay
- `numberline` width/offset variance asserted across 100 rounds
- Service worker caches `core.js` once and serves all ten game paths offline
- Config builder page produces valid URLs for at least two games
- Zero network requests after first load, verified in devtools

---

## 6. Things that will tempt you

- **Inlining the core into each game to honour "single file."** Ask first. (§0)
- **Adding a green flash on correct.** The reveal contract forbids color-coded correctness. Games signal success diegetically.
- **Using `setTimeout` for flashes because it's simpler.** It is simpler and it breaks three games.
- **Making `adapt` one unified strategy.** Three shapes exist because three are needed. A staircase cannot diagnose a misconception and a classifier cannot tune a tolerance band.
- **Showing the difficulty tier "for motivation."** No.
- **Adding a lightweight analytics hook "just for errors."** G2 is absolute. Errors go to the console.
