# Sky Wolf Studios — new-game onboarding prompt

> Paste-ready. Drop the whole block below into the new game's Claude
> session verbatim. The receiving Claude needs no other context.
> Replace nothing — the placeholder `<short-id-for-this-game>` is the
> one thing the receiving Claude itself chooses.

---

To: this game's Claude — From: the Sky Wolf Studios Director.

Sky Wolf Studios is a constellation of indie games that share one currency: **sunbeams**. Players earn them in any participating game, anonymously, no signup. They can later sign in to keep them across devices and spend them in the hub (Lucid Winds, the orchard plant-art game at `lucidwinds.com`) or on cosmetics in any participating game. **This game is playable and ready to join.** Two jobs in one pass, then stop.

**Hard rule — ADDITIVE ONLY.** Do not change game logic, rendering, controls, scoring, persistence, audio, or any existing user-visible behavior. The only edits allowed are: (1) adding one `<script>` tag, (2) calling `Sunbeam.init` once on load, (3) calling `Sunbeam.earn` at existing reward moments, (4) creating one new file (`GAME_CARD.md`). If anything else looks tempting — refactoring, fixing tech debt, "while I'm in here" — don't.

---

## PART A — Wire the sunbeam economy

1. **Add the SDK** to the page's `<head>` (or to your app's HTML shell, before any of your game's bootstrap code):

   ```html
   <script src="https://lucidwinds.com/sunbeam-sdk.js?v=2"></script>
   ```

   The SDK is ~13 KB, ES5-compatible, lazy-loads Firebase compat from `gstatic.com` on first use. No build step or bundler needed. It exposes `window.Sunbeam`. It uses an internal Firebase app name (`'sunbeam-sdk'`) so it cannot collide with any Firebase your game already uses.

2. **Initialize once on load.** As early as feasible (right after the SDK script tag is fine), call:

   ```js
   Sunbeam.init({ gameId: "<short-id-for-this-game>" })
     .catch(function(){ /* network blocked — earn calls will degrade silently */ });
   ```

   Pick a `gameId` that is short, lowercase, hyphenated, stable, and unique. Examples: `glyph-forge`, `sweet-spot`, `tarot-run`, `bar-brawl`. Max 32 characters. This label persists in studio analytics — pick once, never rename.

3. **Wire `Sunbeam.earn` at reward moments that already exist.** Keep it minimal — most games need a single call. Don't invent events, and don't wire combos / per-tile / per-frame earns.

   | Moment | amount | source label |
   |---|---|---|
   | Round / game complete (the one required hook) | 3–5 | `<gameId>:win` |
   | First play of the day — only if the game already has a daily/streak | 3–5 | `<gameId>:daily` |

   The call:

   ```js
   Sunbeam.earn(4, "<gameId>:win").catch(function(){});
   ```

   **Calibrate so a casual session yields ~15–40 sunbeams total.** This matches the live studio economy — the hub and the `/play/` shells both pay 4 on a win. Over-earning breaks the cross-game currency; under-earning is invisible.

   **Constraints (server-enforced; respect them in your wiring):**
   - `amount`: integer between **1 and 200** per call.
   - `source`: short ASCII label, **≤32 characters**. Use the `<gameId>:<event>` convention.
   - **No tight loops, no `setInterval`-driven earns, no per-frame calls.** The server rate-caps at 300/min and 5000/day per user. Tight loops trigger throttling and look fraudulent in telemetry.
   - Wrap every `earn` call in `.catch(function(){})` so a failed call (network down, init still pending) never crashes the game.
   - **If your game is an offline-capable PWA**, also guard the call: `window.Sunbeam && Sunbeam.earn(4, "<gameId>:win").catch(function(){});`. When offline the remote SDK can't load, so a bare call throws a `ReferenceError` *before* the promise exists — which `.catch()` can't trap. The `window.Sunbeam &&` guard keeps offline play clean. Behavior is identical when the SDK is present.

4. **Do not add a sign-in flow.** The SDK handles both anonymous and signed-in players transparently. Anonymous earns accumulate in `localStorage`; on sign-in (from anywhere in the studio), the SDK reconciles them. The studio handles sign-in elsewhere. Your game's job is to *earn*, not to gate.

5. **Leave the game's own score, currency, achievements, save data alone.** Sunbeams sit alongside; they don't replace anything. If the game has its own coins, they keep working exactly as they did. Sunbeams are an additive layer.

6. **Test in a browser, not just by reading code:**
   - Open the live game in a regular browser.
   - DevTools → Console.
   - Play a session that hits each event you wired.
   - Run `await Sunbeam.balance()` and confirm `pending` is rising. For example, if you wired `Sunbeam.earn(8, "...")` at a win, finishing one game should bump `pending` by 8.
   - Look for any errors in the console. **Zero errors is the bar.** A failed network call is fine (silent catch); an exception or unhandled rejection is not.

---

## PART B — Create `GAME_CARD.md` at the repo root

This is the only new file. Push it to `main` along with the SDK wiring commits.

Use this template verbatim, filling in the values:

```markdown
# GAME_CARD — <Name>

## At a glance
- **One-line hook:** <12-word pitch>
- **Genre / vibe:** <e.g. arcade timing, deckbuilder, card brawl>
- **Core loop:** <one sentence describing what the player does over and over>
- **Status:** working | buggy | unfinished
- **Live URL:** <https://...>
- **Repo:** <owner/name on GitHub>

## What works / what's missing
- **Works:** <bullet list of solid features>
- **Missing / known issues:** <bullet list — be honest, this is the studio's working notes>

## Tech
- **Stack:** <e.g. vanilla HTML/JS, React + Vite, Phaser 3, Svelte+Three.js>
- **Build step:** <none | `npm run build` | other> (if any)
- **Entry point:** <file the browser loads first, e.g. `index.html`>
- **Controls:** <keyboard / touch / mouse / gamepad — what's actually supported>

## Existing economy
- **In-game score / currency:** <what already exists>
- **What sunbeams were mapped onto:** <which events fire `Sunbeam.earn`>

## Persistence today
- **Storage:** <localStorage only? IndexedDB? backend?>
- **Auth:** <none | OAuth | custom — be specific>
- **Single-domain check:** would this game work served at `lucidwinds.com/<game>/`?
  List every path that starts with `/` (a leading slash, root-relative) — those will break under a subpath deploy. Relative paths (`assets/foo.png`, `./js/bar.js`) are fine.

## Art / media for the studio portal
- **Storefront image:** <https://...> or "none"
- **Screenshot:** <https://...> or "none"
- **GIF / video:** <https://...> or "none"

  Aspect ratio guidance: studio portal tiles are 1:1, ~120-180px on the longest side. A clean 512×512 PNG works. If you don't have one, say "none" — the studio will commission art.

## Sunbeam wiring (the exact wiring you shipped)
- **gameId:** `<chosen-id>`
- **Earn events:**
  | Trigger (in code) | amount | source label |
  |---|---|---|
  | <e.g. on level complete callback> | <int> | `<gameId>:level_complete` |
  | <e.g. on game over with win> | <int> | `<gameId>:win` |
  | ... | | |
```

Keep `GAME_CARD.md` updated when the game changes — it's the studio's working source of truth on this game.

---

## What NOT to do

- **Do not edit the game's existing files beyond adding the SDK script tag, `init`, and `earn` calls.** Each `earn` call lands at an existing reward moment — you should be adding ~3–6 lines of code total to the game logic.
- **Do not refactor, "clean up", reformat, or upgrade anything.** Even if you see something obvious, leave it.
- **Do not add a sign-in UI, login button, account modal, or auth gate** in the game.
- **Do not call `Sunbeam.mintPlant`.** That's reserved for Lucid Winds (the hub).
- **Do not call `Sunbeam.earn` in a tight loop, animation frame, or interval timer.** Map only to existing player-attention events.
- **Do not host a forked copy of `sunbeam-sdk.js`.** Load it from `https://lucidwinds.com/sunbeam-sdk.js?v=2` so SDK updates propagate automatically.
- **Do not commit the placeholder `<short-id-for-this-game>`** — pick a real id before pushing.

---

## Report back (be brief)

When done, reply with:

1. **gameId chosen** — `<id>`
2. **Live URL** — `<https://...>`
3. **Earn events wired** — a compact table:
   ```
   <trigger>          → Sunbeam.earn(<amt>, "<gameId>:<event>")
   <trigger>          → Sunbeam.earn(<amt>, "<gameId>:<event>")
   ...
   ```
4. **Verification:** "Console clean, `await Sunbeam.balance()` shows pending = N after a session with M scored events." (state the actual numbers)
5. **GAME_CARD.md pushed to main:** confirm commit hash.

Then stop. Do not propose follow-up work. The studio will respond with whether to wire any custom cosmetics or revisions.

---

## Full reference (only if needed)

API reference, FAQ, rate limits, anonymous flow, sign-in details, future cosmetics economy preview:
https://lucidwinds.com/PARTNER_INTEGRATION.md

Source of truth for the SDK (versioned via semver; major bumps publish at new paths so existing integrations don't break):
https://lucidwinds.com/sunbeam-sdk.js

— Sky Wolf Studios Director

---

# Notes for Stephen (do not paste this section to the new game's Claude)

**What I changed vs your draft:**

1. **Added studio context.** One paragraph at the top so the receiving Claude knows what Sky Wolf Studios is and what role sunbeams play. Otherwise they fly blind.
2. **Hard "ADDITIVE ONLY" rule stated separately**, with examples of what counts as a refactor. Receiving Claudes love "while I'm in here" — this forecloses it.
3. **gameId guidance is concrete.** Lowercase, hyphenated, stable, ≤32 chars, with examples. No more vague "short id".
4. **Defensive `.catch(function(){})` on init + earn calls.** If a partner game's init hasn't resolved when an earn fires, the SDK rejects — your draft would let that surface as a console error. Catching it everywhere makes "zero errors" achievable.
5. **Real earn-amount table** with calibrated numbers and a 20–60-per-session target. Your draft just said "1–200" — too vague for the receiving Claude to pick well.
6. **Explicit rate caps stated.** 200/call, 300/min, 5000/day. Tells the receiving Claude not to wire a per-frame call.
7. **"Do not" list** itemized so the bright-line is unmissable: no auth UI, no `mintPlant`, no forked SDK, no tight-loop earns, no placeholder commits.
8. **GAME_CARD template is fillable**, with structured headings the Claude can populate verbatim instead of remembering all your bullet points.
9. **Single-domain check explicitly asks for root-relative paths.** The Hostinger deploy doc you keep in the repo warns about this; the same trap applies if a satellite game is ever pulled under `lucidwinds.com/<game>/`.
10. **Verification step asks for actual numbers** (pending = N after M scored events) so "I tested it" can't be vibes. Reproducible.
11. **Report format is structured** — five numbered items only. Lets you skim five reports back-to-back without parsing prose.
12. **PARTNER_INTEGRATION.md link is left ONLY as a fallback**, not the primary contract. The prompt is self-sufficient; the link is a safety net.

**How to use:**

- Open the new game's repo in Claude Code.
- Paste everything from `To: this game's Claude` down to `— Sky Wolf Studios Director`.
- Wait for the report.
- If the report comes back with `gameId`, live URL, earn events table, verification numbers, and a commit hash, you can add the game to the portal `FEATURED` array immediately.

**For the portal-add step:**

You'll need from each partner game:
- gameId (string)
- Live URL
- One-line hook
- 1:1 storefront image (or "we'll commission")

Send those four to me and I'll wire them into `portal/index.html`'s `FEATURED` array.
