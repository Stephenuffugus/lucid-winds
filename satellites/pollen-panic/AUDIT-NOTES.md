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


## Verification

`node satellites/pollen-panic/audit_check.mjs` from the repo root. 43 assertions, real headless
Chrome at 375x667, serving the repo root so `/feedback.js`, `/arcade-exit.js` and
`/sunbeam-sdk.js` resolve the way they do in production. Fresh browser CONTEXT per case, so a
service worker or a leftover `localStorage` from one case cannot make the next one pass for the
wrong reason.

Plus a syntax gate: the inline script blocks are parsed with `vm.Script`, and that gate was
watched fail on a deliberately broken copy before it was trusted.

**Every headline assertion was watched FAIL on purpose.** The fixes above were reverted in place
and the suite re-run: 13 assertions went red, including `save.owned.includes is not a function`, `Cannot read properties of undefined (reading 'body')` and `(reading 'bg')` — the three separate crashes the validation now prevents — plus every two-tab merge and the GUST copy. Three probes were caught passing VACUOUSLY during that pass and
were rewritten rather than accepted:

- the two-tab assertions passed while `save()` never ran at all, because the seeded "other tab"
  value was simply still sitting there. They now also assert that this tab's own write landed.
- the in-play touch-target check multiplied a hardcoded `70` by the stage scale, so it could
  not have noticed the constant changing. It now reads the real declaration out of the served
  page.
- the feedback-fab check flagged controls under the fab's default geometry even when the fab had
  already faded to `opacity:0; pointer-events:none`. It now measures the fab's actual rect and
  fails only when an INTERACTIVE fab is painted on top of a control, which is the real defect.

## A fleet observation, not a defect in this game

The root `feedback.js` FAB YIELD pass resolves the bottom-right collision on three of the four
games I audited by fading the chip to `opacity:0; pointer-events:none` — it never finds a free
spot on its ring, because these games fill the bottom band with controls. Nothing is eaten, so
the standing defect is genuinely gone. But the practical effect is that the feedback button is
invisible on those games, and feedback is the point of it. `feedback.js` is outside this audit's
sandbox so I have not touched it; flagging it because "the fab yields correctly" and "a player
can send feedback" are not the same claim.
