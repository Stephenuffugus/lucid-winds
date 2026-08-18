# GAME_CARD — HUNCH

## At a glance
- **One-line hook:** You draw it; a real AI guesses blind and scores how close it got.
- **Genre / vibe:** Arcade drawing / guess-my-mind party game with AI judging.
- **Core loop:** Get a weird prompt, draw it in ~50s, a vision model guesses blind, score the read, build a streak.
- **Status:** working
- **Live URL:** https://hunch-mauve.vercel.app (Vercel; push to `main` auto-redeploys)
- **Repo:** Stephenuffugus/Hunch on GitHub

## What works / what's missing
- **Works:**
  - Full draw → AI-guess → score round loop (Claude vision model guesses, Haiku judge scores).
  - Two modes: Endless (8 free rounds/day, then rewarded-ad gated) and Daily Challenge (5 fixed rounds, same for everyone).
  - Streak multiplier, speed bonus, score milestones, persona/voice unlocks by lifetime score.
  - Own coin economy + cosmetic shop (ink styles, themes), daily leaderboard backend.
  - PWA shell (manifest + service worker), Capacitor config for native packaging.
- **Missing / known issues:**
  - Web-only today; no revenue layer yet (AdMob + Pro live in the native Capacitor build only — not built). HUNCH carries real per-round API COGS, so it must self-fund — see economy note below.
  - Leaderboard requires a configured backend/env; shows "not switched on yet" until set up.
  - Rate limiting on the AI proxy is in-memory per instance (soft-launch guard only).
  - Sunbeam wiring has not been verified in a live browser (see note below) — no running instance to test against.

## Tech
- **Stack:** Vanilla HTML/CSS/JS (single-file `index.html`), plus Vercel serverless functions in `api/*` proxying the Anthropic API (keeps the key server-side).
- **Build step:** none (static frontend; `vercel dev` / `vercel --prod` for the functions).
- **Entry point:** `index.html`
- **Controls:** Touch + mouse/pointer (drawing on a canvas); tap buttons for UI. Designed mobile-first / portrait.

## Existing economy
- **In-game score / currency:** Leaderboard `score` + `lifetimeScore` (competitive, not spendable); `coins` 🪙 — a separate persistent cosmetic currency earned per scored round (+per-round points) and a +50 daily-completion bonus, spent in the cosmetic shop.
- **What sunbeams were mapped onto:** the existing per-round hit (a scored win) and the existing daily-challenge completion — the same two moments that already award coins. No new events were invented.

## Persistence today
- **Storage:** `localStorage` only (key `hunch.v1`) for all player state — coins, streaks, unlocks, daily progress, device id. Leaderboard scores POST to the `/api/leaderboard` serverless endpoint.
- **Auth:** none. An anonymous `deviceId` (UUID in localStorage) identifies the player for the leaderboard. No login, no OAuth.
- **Single-domain check:** would this game work served at `lucidwinds.com/hunch/`?
  - Static assets are safe — all relative: `manifest.webmanifest`, `icons/icon.svg`, `sw.js`, `data/prompts.js`, `./index.html`.
  - **Would break under a subpath:** the AI/leaderboard fetches resolve to **root-relative** paths — `/api/claude`, `/api/leaderboard`, `/api/report` (built as `API_BASE + "/api/..."` where `API_BASE` defaults to `""`). Under `lucidwinds.com/hunch/` these would hit `lucidwinds.com/api/*`, not the game's functions. Fix without code change: set `window.HUNCH_API_BASE` to the full proxy origin (the code already reads that override).
  - The service worker (`sw.js`) registers at the page's path; its cache scope would need to match the subpath.

## Art / media for the studio portal
- **Storefront image:** none
- **Screenshot:** none
- **GIF / video:** none

Note: there is an `ART_ASSETS.md` in the repo describing intended art, but no exported 512×512 tile exists yet — studio can commission.

## Sunbeam wiring (the exact wiring you shipped)
- **gameId:** `hunch`
- **Earn events:**
  | Trigger (in code) | amount | source label |
  |---|---|---|
  | `finishRound()` — round scored as a hit (`raw >= 50`), the branch that awards coins | 1 | `hunch:win` |
  | `finishDaily()` — Daily Challenge (all 5 rounds) completed, alongside the +50 coin daily bonus | 3 | `hunch:daily` |

  Calibration: rates were deliberately set low (hub-directed: win 5→1, daily 10→3) because HUNCH is the only portal game with real per-round API COGS — it earns its keep via its own monetization layer, not generous sunbeam yield. The studio's anti-cheat caps (300/min, 5000/day per uid, shared across all games) ceiling worst-case exposure. No loops, intervals, or per-frame earns — both calls sit on existing player-attention moments and are wrapped in `try/catch` + `.catch()`.

## Verification status (honest note)
The SDK script tag, `Sunbeam.init({ gameId: "hunch" })`, and the two `Sunbeam.earn` calls are wired and statically correct, and are **live** at https://hunch-mauve.vercel.app (confirmed served in the deployed HTML). They have **not** yet been verified in a live browser session — no browser is available in the build environment. To verify: open the live URL, play a session, open DevTools console, and confirm `await Sunbeam.balance()` shows `pending` rising by 1 per scored hit and 3 on a daily completion (signed-in: `await Sunbeam.balance({ refresh: true })` → `confirmed` ticks up), with zero console exceptions.
