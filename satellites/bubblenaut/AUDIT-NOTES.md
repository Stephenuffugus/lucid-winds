# BUBBLENAUT — audit, 2026-08-16

Read end to end (1012 lines) before any edit. Defect list written first, fixed worst first.
Extra brief for this one: it is a co-op two-player game, so I checked what one player gets and
whether the second is load-bearing.

## Core loop, start to finish

Title → first-visit rules gate → 25 rooms across 5 worlds → each room: bubble the critters, pop
the bubbles, catch the treasure → room clear → next → `voyageComplete()` at room 25. Game over
offers Retry this room / Start over / Share / Back. Collection screen tallies five treasures.
No stubs. `scripts/bn_validate_maps.js` passes 25/25 with real reachability laws, and it is a
gate that can fail (I ran it). Difficulty is REAL: critter speed carries a `+G.wLevel*6` term,
each world's critter has its own brain (hop / skitter / fly / dash / drift), and rooms get
denser inside a world.

## The two-player question

- **P2 is not load-bearing.** Every room stores a `P` and a `Q` spawn; in 1P only `P` is used,
  and the map validator's reachability laws are run from a single actor. I ran it: 25/25 valid.
  There is no critter, treasure, ledge or exit that needs a second body, no shared-weight or
  co-op-lift mechanic anywhere in the file. Single player is a complete game.
- **P2 is keyboard-only and hidden on touch.** `#b-2p` is shown only when `!TOUCH`, and P2 has
  no touch pad bindings at all — `readCtl` gives player 1 the pads and player 2 nothing but
  arrow keys. That is a defensible call on one phone, but the button copy already says
  "Two players, one keyboard", so it is honest.
- **In 2P, lives are per player and a dead player stays dead until the run ends**
  (`stepPlayers` skips `p.dead`, `gameOver` waits for `allDead`). So the second player can be
  out for twenty rooms with nothing to do and no way to buy back in. That is a design gap, not
  a defect I should fix unilaterally. Recorded.

## Defects found (worst first)

1. **THE CONTINUE BUTTON DELETES ITSELF (dead end).** `FURTHEST` persists the highest room
   reached across sessions, and on boot line 991 correctly reveals
   "Continue at room N". But `show('s-title')` unconditionally re-runs
   `rb.style.display=(G&&G.paused)?'flex':'none'`. So the moment the player visits How To Play,
   Settings, or Collection and comes back — or finishes a run and taps Back — the Continue
   button vanishes and its label is never restored. The only way to get it back is a full
   reload. A player who reaches room 14, checks the Collection screen, and then wants to carry
   on is silently sent back to room 1. This is the single worst thing in the file, and it makes
   the entire cross-session progression feel broken.
2. **CORRUPT SAVE (class 3).** `COLLECT` is read as
   `if(c&&c.length===5) return c;` — **a five-character string passes that test**. With
   `bn_collection` set to `"hello"`, `COLLECT` becomes a string, and the file is `"use strict"`,
   so `COLLECT[i]++` inside `collectTreasure()` throws TypeError **inside the game loop**: the
   run freezes mid-room the first time a treasure is caught. An array of the wrong element types
   is also accepted and renders `NaN` on the Collection screen. `FURTHEST` is `parseInt`'d but
   never range-checked, so a stored `"9999"` prints "Continue at room 10000".
3. **TWO TABS CLOBBER (class 4).** `BEST`, `COLLECT` and `FURTHEST` are each written wholesale
   from memory. A lower best erases a higher one, a shorter voyage erases a longer one, and
   treasure tallies lose whichever tab wrote last.
4. **Sunbeam earn pays past the cap when storage fails (class 5).** `_sbCapEarn` wraps the
   bucket write in `catch(e){}` and calls `Sunbeam.earn` from inside the same try, so a thrown
   `setItem` skips the earn — that half is right — but the failure is invisible and the bucket
   silently never advances for the rest of the session.
5. **Exit (class 1): correct, and actually called.** `SWS_EXIT` has the referrer fallback and
   `#b-exit` on the title screen invokes it. But `SWS_EMBED` is read from `?embed=1` only, so a
   genuinely framed load never posts `{sws:'ready'}`.
6. **Touch targets (class 6):** clean. The stage is 540x960 transform-scaled, which is exactly
   where this normally goes wrong, but every control was sized for it: `.padbtn` is 76px
   (52.7px rendered at 375x667), `.btn.sm` is 72px, and the settings toggle carries a `::after`
   that extends its 36px pill to 72px. Verified by measurement, not by reading the CSS.
7. **Dashes in player copy (class 7):** clean, comments only.
8. **Overlay over a control (class 8):** `#ctl` is a 172px control bar pinned to the bottom of
   the stage and it is hidden on every menu screen, so it never sits on a menu button. The
   toast sits at `bottom:196px`, clear of the pads.
9. **`newGame` has a dead expression.** `level:FURTHEST>0?0:0` — both branches are 0. Harmless
   today, but it reads as an intent that was never wired: "start over" was probably meant to
   offer the furthest room.

## Fixes applied

- **1 fixed.** `show()` no longer decides whether the Continue button exists; a single
  `syncResume()` owns it, and it is true whenever there is a paused run **or** a stored
  `FURTHEST > 0`, with the label matching which of those it is. The button now survives every
  navigation, and `continueGame()` already handled both cases correctly — it was only ever the
  visibility that was wrong.
- **2 fixed.** `COLLECT` now requires a real 5-element array of finite numbers; anything else
  falls back to five zeros. `FURTHEST` and `BEST` are clamped to sane ranges (`0..24` and
  `>=0`).
- **3 fixed.** `saveCol`, the best write and the furthest write all merge against what is on
  disk: `BEST` and `FURTHEST` take MAX, and each of the five treasure tallies takes MAX of disk
  and memory (they only ever go up within a session, so MAX is the correct union here and
  cannot double-count a reload).
- **4 fixed.** The bucket write is read back; if it did not land, the earn is skipped rather
  than silently dropped, and the function reports 0 so the results screen tells the truth.
- **5 fixed.** Canonical block from `incoming/PORTAL-CONTRACT.md`: framed is detected by
  `window.parent!==window` as well as `?embed=1`, and `{sws:'ready'}` posts at parse time and
  again on load.
- **9 fixed.** The dead ternary is gone; `newGame` starts at room 1, which is what it did and
  what the button says.

## What still worries me

- 2P has no way for a dead player to rejoin. Twenty rooms of watching is a long time.
- `voyageComplete()` hides Retry, and `over-again`/`over-back` restore it, but nothing restores
  it if the player leaves that screen by any other route. It has not bitten because those are
  the only two exits, but it is one button away from being a defect again.
- The idle title loop paints a flat gradient over the canvas every frame forever, even on the
  settings screen. Cheap, but it is a rAF that never stops.


## Verification

`node satellites/bubblenaut/audit_check.mjs` from the repo root. 33 assertions, real headless
Chrome at 375x667, serving the repo root so `/feedback.js`, `/arcade-exit.js` and
`/sunbeam-sdk.js` resolve the way they do in production. Fresh browser CONTEXT per case, so a
service worker or a leftover `localStorage` from one case cannot make the next one pass for the
wrong reason.

Plus a syntax gate: the inline script blocks are parsed with `vm.Script`, and that gate was
watched fail on a deliberately broken copy before it was trusted.

**Every headline assertion was watched FAIL on purpose.** The fixes above were reverted in place
and the suite re-run: 7 assertions went red, including the Continue button vanishing after every one of the three menu trips, the five-character string being accepted as a collection, `Continue at room 10000`, and the furthest-room merge. Three probes were caught passing VACUOUSLY during that pass and
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
