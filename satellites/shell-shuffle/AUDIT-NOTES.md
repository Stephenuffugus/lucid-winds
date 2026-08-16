# SHELL SHUFFLE — audit, 2026-08-16

Read end to end (1020 lines; most of the byte count is embedded SVG data URIs) before any edit.
Defect list written first, fixed worst first.

## Core loop, start to finish

One screen. Start Game → ball shown under a cup → cups shuffle → tap a cup → win coins and
advance a level, or lose and restart one level back. Shop (balls, cups, a custom ball designer),
Daily Rewards (7-day calendar, weekly goal, six streak-exclusive unlocks), How To Play, Pause.
No stubs. No screen that leads nowhere. The daily streak system is genuinely well built,
including a 1-day grace on the streak and a real weekly goal.

## Defects found (worst first)

1. **CORRUPT SAVE PRODUCES A GAME THAT LOOKS FINE AND DOES NOTHING (classes 3 and 5).** This is
   the worst defect I found across all four games. `load()` does `owned:d.owned||['classic']`
   with no type check, then **outside** the try/catch runs
   `if(!state.owned.includes('classic')) state.owned.push('classic')`.
   With `{"owned":3}` stored, `.includes` is undefined and that line throws. `load()` is
   `async`, so the throw rejects the promise and the boot IIFE dies **before**
   `showBtn('Start Game', startGame)`. The Start Game button is already in the HTML with that
   exact label, so the page renders perfectly, the button looks live, and tapping it does
   absolutely nothing, forever. There is no error, no message, no recovery. Same for
   `{"ownedCups":3}` on the very next line, and `{"daily":"x"}` poisons `Object.assign`.
2. **TWO TABS CLOBBER (class 4).** `save()` writes the whole state object from memory. Coins,
   `bestLevel`, both owned sets, and the entire daily streak record lose whichever tab wrote
   last. Two tabs is also the *normal* case here, because the game auto-opens the Daily sheet
   450ms after boot and writes on open.
3. **DIFFICULTY GOES COMPLETELY FLAT AT LEVEL 11, FOREVER.** `cupCount()` caps at 6 (level 5),
   `shuffleCount()` caps at 27 (level 9), `swapDur()` floors at 115ms (level 10.4). From level
   11 onward every single round is byte-identical, while `reward()` keeps climbing with the
   streak. The game's own hint promises "Each round adds a cup, shuffles faster, and pays more"
   — two thirds of that stops being true at level 11 and the copy never stops saying it. That is
   both a flat-difficulty defect and a false promise in player copy.
4. **The daily sheet opens itself over the game on boot (class 8-adjacent).**
   `if(dailyAvailable()) setTimeout(openDaily, 450)` fires a full-screen `position:fixed` sheet
   450ms after load, unprompted. It is escapable, but it lands on top of the Start button that
   the player is already reaching for.
5. **Sunbeam bucket keys off the URL, not the game (class 5).** `_sbCapEarn` builds its key from
   `location.pathname.split('/').filter(Boolean).pop()`. Served at `/satellites/shell-shuffle/`
   that is `shell-shuffle`; served at `.../index.html` it is **`index.html`**, which is a bucket
   shared with every other game on the fleet that does the same thing. This is a known fleet
   defect and it is live in this file.
6. **Sunbeam earn pays past the cap when storage fails (class 5).** The `catch(e){}` around the
   bucket write is followed unconditionally by `Sunbeam.earn(n,tag)`. If `setItem` throws, the
   day bucket never advances and the earn still fires, uncapped, every round.
7. **Exit (class 1): correct, and actually called.** `SWS_EXIT` has the referrer fallback and
   two controls invoke it (`#exitPortal` on the main screen, `#pausedExit` on the pause sheet).
   Verified by assertion, not by reading.
8. **Touch targets (class 6):** clean. This game renders unscaled and every control carries an
   explicit 48px floor, including the `::after` tap-zone extensions on the two HUD pills.
   Verified by measurement at 375x667.
9. **Dashes in player copy (class 7):** clean, comments only.
10. **The feedback fab over a full-screen sheet (class 2).** On the nine-game list. Both `.shop`
    and `.daily` are `position:fixed; inset:0` scrolling sheets whose bottom-right can hold a
    BUY button at any scroll position. Verified against the root `feedback.js` FAB YIELD
    behaviour by measurement rather than assumed.

## Fixes applied

- **1 fixed.** `load()` now validates every field: both owned lists are filtered to ids that
  actually exist in `BALLS`/`CUPS`, the custom ball's two colours must match `#rrggbb` and its
  pattern must be one of the four, `daily` is rebuilt field by field with number coercion, and
  `selected`/`selectedCup` must name an owned item. The boot IIFE is additionally wrapped so
  that even an unforeseen throw still reaches `showBtn('Start Game', startGame)` — a player who
  loses cosmetics can carry on, a player who loses the button cannot.
- **2 fixed.** `save()` re-reads the stored record and merges: `coins` adds this tab's delta
  since its last write, `bestLevel` and every daily counter (`streak`, `best`, `weekDays`,
  `weekStreak`) take MAX, both owned sets union, and `daily.last` takes the later date. The
  custom ball and the equipped ids stay last-write, because a preference is not a counter.
- **3 fixed.** The ramp continues past the cap instead of stopping: `shuffleCount()` keeps
  adding a swap every two levels past 9 (capped at 44 so a round cannot outlast patience), and
  from level 11 a growing share of swaps are **double swaps** — two independent pairs moving in
  the same beat, which is a genuinely new thing to track rather than the same thing faster. The
  on-screen hint now tells the truth at every stage, naming double swaps once they start.
- **4 fixed.** The daily sheet no longer opens itself over the Start button. The 🎁 badge on the
  daily pill already pulses when a reward is waiting; that is the invitation, and it does not
  take the screen away from someone who came to play.
- **5 fixed.** The sunbeam bucket key is now the literal `sw_sb_shell-shuffle`, so it cannot
  collide with another game's bucket no matter what URL the game is served from.
- **6 fixed.** The bucket write is read back; if it did not land, the earn is skipped rather
  than granted uncapped.

## What still worries me

- 60+ cups at 3-per-row with no filter is a wall, and `CUP_PRICE` carries ids that no longer
  exist in `CUPS`, so the price table has drifted from the catalogue. Not touched.
- `round()` recurses on every win (`await delay(1500); round()`), so a long session builds a
  promise chain that never unwinds. It has not bitten anything at these depths, but it is not
  free.
- The pause button only appears during the `play` phase, so there is no way to pause during the
  guess. That is arguably correct, but it means a phone call during the guess costs the run.


## Verification

`node satellites/shell-shuffle/audit_check.mjs` from the repo root. 45 assertions, real headless
Chrome at 375x667, serving the repo root so `/feedback.js`, `/arcade-exit.js` and
`/sunbeam-sdk.js` resolve the way they do in production. Fresh browser CONTEXT per case, so a
service worker or a leftover `localStorage` from one case cannot make the next one pass for the
wrong reason.

Plus a syntax gate: the inline script blocks are parsed with `vm.Script`, and that gate was
watched fail on a deliberately broken copy before it was trusted.

**Every headline assertion was watched FAIL on purpose.** The fixes above were reverted in place
and the suite re-run: 15 assertions went red, including `state.owned.includes is not a function`, the Start button landing a real click and producing zero cups, the Daily sheet hijacking the boot, and the flat-difficulty proof (levels 9, 11, 20 and 30 all returning shuffles 27 / duration 115ms / double-swap chance 0). Three probes were caught passing VACUOUSLY during that pass and
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
