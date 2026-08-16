# HANDOFF-11 BUILD PLANS — MASTER FILE (for Opus 5 execution)

**Planned by:** Fable 5, 2026-08-16. **Spec source:** `/workspaces/lucid-winds/assets/HANDOFF-11.md` — read it in full before starting; each plan references its section numbers instead of duplicating every table.
**Executor:** Opus 5, building until the usage reset. Solo build — no agent swarms, no workflows. One game at a time, shipped and verified before the next begins.

## Scope ruling (Stephen, 2026-08-16)

- **BUILD, in this order:** 1 DEEPWELL → 2 BLACKOUT → 3 PARALLEL → 4 WIREWORM → 5 SIEGE OF ONE.
- **PARKED:** LAST CALL (restaurant). Stephen does not care for it now, may revisit later. Do not build it, do not plan it further.
- A finished game beats two half-games. If the block ends mid-game, finish and ship the current one rather than starting the next. Every game has its own plan file: `PLAN-1-DEEPWELL.md` … `PLAN-5-SIEGE.md`.

## Where each game lives

Each game is a satellite: `satellites/<gameid>/` containing `index.html` (the whole game), `sw.js`, `manifest.webmanifest`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, and `sim.js` (headless balance runner, node). Game IDs: `deepwell`, `blackout`, `parallel`, `wireworm`, `siege`.

## Deviations from HANDOFF-11 (already decided — do not re-litigate)

1. **No Blob-URL service worker.** HANDOFF-11 §1.1 asks for an inline SW registered from a Blob URL. Chrome rejects blob: SW registrations, so that path silently ships no offline support. Instead: a real `sw.js` per game, copied from the canonical fleet-safe pattern in `satellites/bandits-box/sw.js`. Rename every cache prefix to `<gameid>-` (the activate handler must only ever delete its OWN prefix — `caches.keys()` is origin-wide and a sloppy worker wipes PadLab and the rest of the fleet). Never `respondWith(undefined)`; navigations refetch with `cache:'no-cache'`; bump `SHELL_VERSION` and the registration `?v=` in lockstep on every deploy.
2. **Real `manifest.webmanifest` + icon PNGs**, not a data-URI manifest — matches the fleet, installability actually works. Icons: render the game's accent-colored motif to canvas in a throwaway node/puppeteer script and save the three PNGs.
3. **Touch targets are 48px minimum**, not the handoff's 44px. Repo law. Measured as RENDERED px at 375×667 (see memory `feedback_touch_targets_measure_rendered_px`).
4. **No dashes in any player-facing copy.** Repo law (`feedback_no_dashes_in_copy`). The handoff's example share string contains an em dash; write share strings without dashes.
5. **No Sunbeam earn wiring in v1.** Consistent with the Aug 16 builds (Bandit's Box, Hush). Recorded as the default; Stephen can veto later.

## Portal integration (identical steps per game — the handoff has none of this)

Source of truth: `incoming/PORTAL-CONTRACT.md` (verified live 2026-08-16). Key facts:

- Add a card to the `GAMES` array in `portal/index.html` (~line 945):
  `{nm:"Name", ds:"One sentence, no dashes.", cat:"<tag>", url:"/satellites/<id>/?v=YYYYMMDDx", ic:"emoji", thumb:"/portal-assets/thumbs/<id>.png", beta:true, fresh:true}`
  Categories per plan file — use ONLY `cat:` values already present in the portal (grep `cat:"` first).
- The `?v=` stamp is MANDATORY (host caching law) and changes on every deploy.
- Add the display name to the search keyword map (~line 1359).
- **Relative `/satellites/` URLs NAVIGATE TOP LEVEL — they are NOT framed.** Ship the embed protocol block anyway (verbatim pattern from PORTAL-CONTRACT.md: `{sws:'ready'}` at parse AND on load, `SWS_EXIT()` that postMessages `close` when framed and falls back to `document.referrer`/`history.back()`/portal URL when not). The referrer exit is what actually runs today.
- Every game needs a findable exit button on its main surface calling `SWS_EXIT()` (Jessie rule).
- `beta:true` renders `data-indev` and hides the card behind the tester dev gate. Any automated portal check must set `localStorage.sws_dev_ok='1'` first or the click never reaches the card.
- Thumb: screenshot the REAL game with puppeteer at a good moment, crop square, PNG ≤150KB, save to `portal-assets/thumbs/<id>.png`.

## Verification laws (repo, non-negotiable — these override the handoff where they conflict)

- **Watch every gate FAIL before trusting it green.** Break the thing on purpose, see red, fix it, see green. A probe that cannot fail is not evidence (this is the single most-repeated lesson in this repo's memory).
- **Never prove a control works with `el.click()`** — it skips hit testing. Use `document.elementFromPoint` at the control's rendered center, then click that. Pattern: chameleon repo `test/reach3d.mjs`.
- **`fetch()` does not reject on HTTP errors.** Check `res.ok`. `fetch().catch()` alone is not error handling.
- **localStorage saves are read-modify-write** — two tabs clobber a read-once-written-wholesale save. Counters ADD, bests MAX (memory `feedback_localstorage_two_tabs_clobber`).
- **Liveness/FPS probes never use rAF** to decide liveness, and fps probes count the APP's draws, not rAF ticks.
- Serve the REPO ROOT (`python3 -m http.server` from `/workspaces/lucid-winds`) when testing pages locally, so absolute paths resolve.
- `top-level let/const` in a classic script are NOT window properties — test BEHAVIOR through the page, not internals.
- Run `scripts/page_health.mjs` against each new page as a final gate (real browser; note `networkidle2` never fires for streaming pages).
- **The regex/vm script-block checker lies** when a `</script>` appears inside a JS string — split such strings (`'</scr'+'ipt>'`).

## THE LOOKING PASS (per game, before calling it done — CLAUDE.md law)

Screenshot the running game from where the PLAYER stands: phone viewport 390×844 AND desktop width (2 of the Aug 16 production defects only appeared at desktop width). Read the images and name three things wrong before Stephen does. Shoot the worst state on purpose (mid-death, board nearly full, longest text strings). Report what you SAW, not what you wired.

## Save/deploy cadence (repo law)

- Work on branch `add-sproing-jumper`. Commit small, and **push after EVERY commit** (`git push origin add-sproing-jumper`) — the codespace can close at any time.
- **Deploy = `git push origin add-sproing-jumper:main`.** Work is NOT live until that push.
- Verify live with `curl` grepping the production HTML for a NEW content marker with `?probe=<random>` — a 200 is not evidence.
- Save memory notes every ~30 minutes of work. No approval gates: decide, record the default in the report, keep going, Stephen vetoes later.
- Update `assets/HANDOFF-11.md` §9 in place at the end: status per game, assertion counts, sim sweep tables pasted, any spec number that moved and why.

## Order of operations inside each game (handoff §8, kept verbatim)

```
1. CONFIG + DATA tables      (numbers are in HANDOFF-11; do not invent)
2. SIM layer, pure functions (no DOM anywhere; time is a parameter)
3. TEST harness against SIM  (assertions BEFORE the UI; ?test=1 + window.__TEST__)
4. sim.js + balance sweep    (fix numbers before drawing anything; TUNE values resolve here)
5. VIEW layer
6. INPUT + SAVE
7. Polish: audio, motion, share string
8. SW + manifest + icons
9. Portal card + thumb + LOOKING pass + deploy + live verification
```

Shared per-game contracts from HANDOFF-11 §1 (mulberry32 RNG, `Math.random` banned in SIM/GEN — grep before done, save format `lw_<gameId>_v1` with try/catch reads and a `migrate()` stub, TEST harness shape, ≥80 assertions including RNG determinism / save round-trip / generation validity / balance envelope / 5,000-input no-crash fuzz, SIM_EXPORT marker comments so `sim.js` extracts the layers, dark base + one accent + tabular-nums + `prefers-reduced-motion` kills shake and particles, no text under 13px, no red/green as sole meaning channel, open straight into play).
