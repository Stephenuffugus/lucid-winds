# Vinewinder — Handoff for Claude Code

A botanically-themed rebuild of classic Snake. Single self-contained HTML file, no build step, no dependencies beyond two Google Fonts. This document tells you everything needed to integrate it into the site.

## The file

`vinewinder.html` — everything (markup, CSS, JS) lives here. Vanilla JS, Canvas 2D, Web Audio. No frameworks, no npm packages, no external JS.

External requests it makes: Google Fonts only (`Fraunces` + `Instrument Sans`). If the site must be zero-external-request, self-host those two fonts or swap the font stacks in the `<style>` block; nothing else will break.

The game is self-branded ("Vinewinder"). It carries no site branding — the host site's identity lives around it, not inside it. Retitle freely by editing the `<h1>`, `<title>`, and the `ovTitle` strings if the site wants a different name.

## Integration options (pick one)

### Option A — standalone page (simplest, recommended first)
Copy the file to e.g. `/games/vinewinder/index.html` and link to it. Done. The page is fully self-styling and responsive.

### Option B — iframe embed
```html
<iframe
  src="/games/vinewinder.html"
  title="Vinewinder — a botanical snake game"
  style="width:100%; max-width:640px; aspect-ratio:3/4; border:0; border-radius:24px;"
  allow="autoplay"
  loading="lazy"></iframe>
```
Notes:
- The game listens for keyboard events on its own document, so the iframe must have focus for arrow keys to work. Consider `iframe.focus()` on click or a click-to-focus affordance.
- Arrow-key scrolling of the parent page is already prevented *inside* the frame (`preventDefault`), so no scroll bleed.

### Option C — inline into an existing page
Extract three chunks from the file into the host page:
1. The `<style>` block (all selectors are class/ID based; the only global rules are on `html, body, *` — scope or remove those and instead put `overflow:hidden; touch-action:none` on a wrapper div).
2. Everything between `<header>` and the closing `.hint` div.
3. The `<script>` block. It's a self-executing IIFE with zero globals — safe to drop anywhere after the markup.
If inlining, be careful: the script binds `keydown`/`touchmove` on `window`. On a page with other interactive content, gate those handlers on the game being visible/focused (an `IntersectionObserver` or a wrapper with `tabindex=0` + focus check is the clean fix — good first task).

## Configuration

Everything tunable is in one `CONFIG` object at the top of the script:

| Key | What it does |
|---|---|
| `cols`, `rows` | Grid size (21×21) |
| `maxBoardPx` | Board render cap in px (560) |
| `modes.*` | Per-mode: `stepMs` start speed, `min` fastest speed, `ramp` speedup per point, `wrap` edge wrapping, `powerups`, `gusts` |
| `goldenEvery` | Every Nth seed is golden in Power Garden (worth 3) |
| `powerupDurations` | ms per effect: ghost 6000, slow 5000, double 8000, magnet 7000 |
| `powerupLifeMs` | How long a power-up sits on the field before expiring (9000) |
| `gustEveryMs` | Windstorm gust cadence (12000) |
| `maxThorns` | Thorn cap in Windstorm (14) |
| `streakWindowMs` / `streakBonusEvery` | Combo timing (5500ms) and bonus rate (+1 per 3 streak) |
| `startDelayMs` | Grace period before the vine moves (900) |
| `storageKey` | localStorage key for best scores (`vinewinder-best`) |
| `sound` | Default sound on/off |

Theme colors are CSS custom properties on `:root` (`--vine`, `--pollen`, `--petal`, `--moon`, `--amber`, `--dew`, etc.). Canvas colors are hex literals inside the JS draw functions — if the site needs full theming, a good refactor is reading them from `getComputedStyle(document.documentElement)` at init.

## Game design summary (so you know what's intentional)

Three modes, selected on the main menu (internal keys in parentheses — used in `CONFIG.modes`, `data-mode`, and saved scores):
- **Classic** (`heirloom`): walls kill, speed ramps with score.
- **Power Garden** (`wild`): edges wrap; every 4th seed is golden (×3); four power-ups spawn on a timer — Ghost (pass through your own body), Slow-mo, Double points, Magnet (the seed is lured one cell toward the head each tick).
- **Windstorm** (`zephyr`): fast start; a gust every 12s speeds the game, spawns lethal thorns, and permanently raises each seed's value by +1.

Cross-mode systems: input buffer (up to 3 queued turns), interpolated sub-cell rendering (the smoothness — do not "optimize" this away by drawing only on logic ticks), combo streaks (+1 seed value per 3 quick pickups, chime pitch rises with streak), per-mode best scores with "New best!" callout, synthesized SFX (no audio assets), pause (space or on-screen button), mute toggle.

## Technical notes & gotchas

- **Rendering** decouples logic (fixed timestep, `stepMs`) from drawing (every rAF, positions lerped between previous and current grid cells). `renderPoints(t)` is where interpolation happens; `splitRuns` breaks the polyline where the vine wraps an edge so it doesn't draw a streak across the board.
- **Storage** is wrapped in try/catch (`store` object) — it degrades to in-memory if localStorage is unavailable (private browsing, sandboxed iframes). Nothing else touches storage.
- **Audio** context is created lazily on the first user gesture (mode-select click) to satisfy autoplay policies. All sounds are synthesized oscillators/noise — no files to host.
- **Accessibility**: `prefers-reduced-motion` disables ambient animation, pulses, and sway; all buttons have focus-visible outlines and aria-labels; game-over moves focus to the replay button. Canvas content itself is not screen-reader accessible (inherent to the medium) — the surrounding menu and HUD are real DOM.
- **Mobile**: swipe to steer, on-screen pause/mute, `touch-action:none` prevents scroll fighting. Layout holds down to ~350px width.
- **Performance**: single canvas, no notable allocations in the hot loop except per-frame point arrays; devicePixelRatio capped at 2.

## Suggested first tasks

1. Wire into the site's routing/nav per Option A or B above.
2. If Option C: scope the global styles and gate the window-level input handlers on game focus.
3. Optional: read canvas palette from CSS variables so the game inherits site theming.
4. Optional: swap Google Fonts for self-hosted `@font-face` if the site avoids third-party requests.
5. Optional: site-level leaderboard by replacing the `store` object's get/set with API calls — it's the only persistence seam.

## QA checklist

- [ ] Main menu reads clearly: title, one-line instructions, three mode cards with per-mode bests, controls line
- [ ] Arrow keys don't scroll the host page while playing
- [ ] Two rapid turns (e.g. down→left) both register
- [ ] Power Garden: vine wraps edges cleanly, no streak drawn across the board
- [ ] Windstorm: thorns never spawn directly in the head's immediate corridor
- [ ] Sound starts only after first click; mute works mid-run
- [ ] Best scores survive a page reload (where storage is available); "New best!" shows when beaten
- [ ] Reduced-motion OS setting stills the ambient animation
- [ ] Playable by swipe on a phone; pause/mute buttons reachable
