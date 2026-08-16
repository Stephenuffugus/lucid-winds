# POLLEN PANIC — audit, 2026-08-16

Read end to end (1081 lines) before any edit. Defect list written first, fixed worst first.

## Core loop, start to finish

Menu (4 modes, 3 daily missions, Nursery shop) → maze run → level clear → game over → petals.
Four modes are genuinely different (Classic, Meadow Shuffle, Super Bloom, Petal Rush). No stubs:
every shop category, every mode, every mission actually works. Difficulty is REAL and layered,
not flat: `pestEase()` softens levels 1 and 2, pest release timers shorten, `speedScale()` ramps
to a 1.45 ceiling, drones (a trailing ghost train) start at level 2 and reach four by level 6,
and the maze rotates every 1 or 2 levels through 20 boards. Missions and the top-5 board give a
reason to come back. This is the strongest of the four games I audited.

## Defects found (worst first)

1. **CORRUPT SAVE KILLS THE WHOLE PAGE (classes 3 and 5).** `loadSave()` does
   `save={...save,...s}` with no validation, then the boot IIFE runs
   `buildGrid(); mkPests(); sizeCanvas(); buildMenu(); updateHUD(); requestAnimationFrame(frame)`
   with no guard. Any of these stored values takes the whole game down, and every one of them
   presents as **a title card with an empty mode list and nothing that responds**:
   - `{"owned":"x"}` → `save.owned.includes(id)` in `buildMenu()` throws. No PLAY buttons ever
     render. The boot chain dies there, so `requestAnimationFrame(frame)` never starts either.
   - `{"skin":"nope"}` → `skin()` returns undefined, `skin().body` throws in `updateHUD()`.
   - `{"theme":"nope"}` → `theme()` returns undefined, `theme().bg` throws inside the render
     frame instead, so the menu renders and the canvas behind it stays black forever.
   - `{"bests":3}` / `{"top":3}` / `{"missions":3}` → each throws in a different place.
   The `try/catch` inside `loadSave` does not help: the bad value is already merged into `save`
   before anything reads it, and every crash is downstream of the catch.
2. **TWO TABS CLOBBER (class 4).** `persist()` writes the whole `save` object from memory.
   Petals earned in tab A are erased by tab B's next game over; per-mode bests, the top-5 board,
   the owned set and today's mission progress all lose whichever tab wrote last.
3. **Exit is not the canonical block (class 1).** `SWS_EXIT` exists and the menu button does
   call it, so the game is not stranded — but `EMBED` is read only from `?embed=1`, so a
   genuinely framed load never posts `{sws:'ready'}` and would be killed by the portal's
   black-screen watchdog the day this card moves to a github.io url. The unframed branch also
   hard-navigates instead of going back, so a player who came from the portal loses their
   scroll position.
4. **A promise the copy makes is false (class 7-adjacent).** How To Play says
   "**GUST** blows nearby pests home." `useGust()` sends **every** loose pest home regardless of
   distance. The word "nearby" makes players hoard the charge for a moment that never needs to
   come.
5. **Silent write failure (class 5).** `store.set` and `persist` both swallow every error. On a
   full or blocked quota a player finishes a run, watches "+240 PETALS EARNED", and finds them
   gone on reload with no signal that anything failed.
6. **Missions self-claim.** `applyRunToMissions()` sets `m.claimed=true` and pays out
   automatically the instant the goal is met. The studio rule is manual quest claim. Recorded,
   not changed — that is a design call, not a defect I should make unilaterally.
7. **Touch targets** (class 6): clean. This game renders unscaled so CSS px are real px, and the
   global `button{min-width:48px;min-height:48px}` plus the `.icobtn` floor cover every control.
   Verified by measurement at 375x667, not by reading the CSS.
8. **Dashes in player copy** (class 7): clean. Every em dash in the file is inside a comment.
9. **Overlay over a control** (class 8) / **the feedback fab** (class 2): this game is on the
   list of nine that mount the fab over a full-screen sheet. Verified by measurement against the
   root `feedback.js` FAB YIELD behaviour rather than assumed — see the assertion suite.

## Fixes applied

- **1 fixed.** `loadSave()` now validates every field on the way in: petals and bests coerce to
  finite numbers, `owned` is filtered to known ids plus the five defaults, `skin`/`theme`/
  `seedStyle`/`trail` must name a real catalogue entry or fall back to the default, `top` is
  rebuilt as a map of arrays of well-formed rows, and `missions` is dropped unless it is a
  `{date, list:[...]}` whose entries name real mission ids. The boot chain is additionally
  wrapped so that if anything unforeseen throws, the menu still builds from defaults instead of
  leaving a dead page.
- **2 fixed.** `persist()` re-reads the stored record and merges: `petals` adds this tab's delta
  since its last write, per-mode `bests` take MAX, `owned` unions, the top-5 board merges both
  lists and re-sorts, and mission progress takes MAX per mission (with `claimed` sticky).
  Equipped cosmetics stay last-write, because a preference is not a counter.
- **3 fixed.** Canonical block from `incoming/PORTAL-CONTRACT.md`: framed is detected by
  `window.parent!==window` as well as `?embed=1`, `{sws:'ready'}` posts at parse time and on
  load, and the unframed branch prefers `history.back()` when the referrer is the portal.
- **4 fixed.** The copy now says what the code does: "GUST sends every loose pest home."
- **5 fixed.** `persist()` reads the record back after writing; if it did not land, the player
  gets a toast saying the progress could not be saved. A swallowed write no longer looks like a
  success.

## What still worries me

- The maze pool is 20 boards but 14 of them are near-duplicates of the two hand-built ones with
  only the bottom third redrawn. Level 15 feels like level 3 with a faster pest.
- `applyRunToMissions` credits progress on game over only, so a Petal Rush player who reloads
  mid-run loses everything toward "munch 600 seeds".
- Petal Rush at 120 seconds pays 2x and has no lives, so it is strictly the best petal farm once
  unlocked. The other three modes stop being played.
