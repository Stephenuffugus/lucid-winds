# BURROW BOWL — audit notes

Audited 2026-08-16. Read end to end (1360 lines) BEFORE any edit. Defect list written first,
then fixed worst first. Left behind: `check.mjs` (node syntax gate + headless assertions at
375x667). Every assertion was watched fail on purpose before it was allowed to pass.

## Core loop, walked start to finish

Title → How to play → nine dewballs, flick each one up the ramp → judge on the landing point →
per ball beat → summary with chips, tickets, trophy meter → Again / Tonight's lane / Menu.
The loop closes. No stubs, no unreachable buttons, no dead ends in the happy path. Pause is
reachable during a round, resumes correctly, and "End the round" scores the balls already thrown
instead of throwing the round away.

## DEFECTS FOUND (worst first)

### 1. Sunbeams never reached the account. SILENT. (standing class 5)
`/sunbeam-sdk.js` was never loaded. The only external script on the page was `critter-pal.js`,
so `window.Sunbeam` was permanently undefined. Every `_sbCapEarn()` call still decremented the
local 30/day bucket in `sw_sb_burrow-bowl` and then hit
`if(window.Sunbeam && Sunbeam.earn)` and quietly did nothing.

So the game *spent* the player's daily earn allowance for this game and paid out zero, forever,
with no error anywhere. Round earns, the 300 round, the first hundred and the daily bonus were
all dead. This is the exact shape of the class that has already cost this project two days.

### 2. A corrupt save is an INESCAPABLE state, not just a crash. (standing class 3)
`jGet()` was `JSON.parse(...) || d`. Anything that merely parses and is truthy passes: `5`,
`"x"`, `[]`, `{}`. The file runs under `"use strict"`, so with `bb_stats` holding a number,
`STATS.rounds++` in `endRound()` throws `TypeError: Cannot create property 'rounds' on number`.

`endRound()` had already set `G.phase='idle'` on its first line, so the throw leaves the player
on `s-play` with a dead board, and `pausebtn` returns early on `phase==='idle'`. There is no
button on that screen. The only way out is a browser reload. A one-character corruption in
localStorage bricks the game.

`SET`, `MOM` and `K_DAILY` had the same hole with milder consequences (`SET="x"` silently turns
off every sound and writes the garbage back).

### 3. Two tabs clobber the shelf. (standing class 4)
`STATS`, `MOM`, `TIX`, `BEST` and `DAILYBEST` are all read once at boot and written back
wholesale. Two tabs open, play a round in each, and whichever finishes last erases the other's
rounds, hundreds and TICKETS. Tickets are the trophy currency, so this quietly un-earns a
trophy the player has already been shown.

### 4. A reload during the daily burns the day's lane for nothing.
`newRound('daily')` writes `{date, score:0, started:true}` immediately, on purpose, so a bad
first ball cannot be rerolled. Correct intent, but the cost also lands on an innocent reload,
a phone call, or a tab eviction: come back and the menu says "rolled tonight, you scored 0" and
the day's content is gone. The round state was never persisted, so there was nothing to come
back to.

### 5. `_sbCapEarn` pays UNCAPPED when localStorage throws.
The clamp lives inside the `try`. In a private window every `setItem` throws, control lands in
the empty `catch`, and the original unclamped `n` is then handed to `Sunbeam.earn`.

### 6. No feedback fab, and the obvious place to put one is the worst place.
Every other satellite in this wave mounts `/feedback.js`. Burrow Bowl had no report channel at
all, so a player who hits something has nowhere to say so. Mounting it the standard way then
measured badly: the fab's default bottom right footprint lands on the RIGHT EDGE of
"Take the lane", "Settings", "All Sky Wolf games" and "Menu", because this game's menus are a
centred 271px button column that reaches into that corner on every screen. The fab's own
collision watcher does not catch it, since its probe points fall a couple of pixels clear of the
overlap. Found by measuring at 375x667, not by looking at the CSS.

## CHECKED AND CLEAN

- **Exit (standing class 1).** `SWS_EXIT` already uses the `document.referrer` fallback, not
  `window.parent`, and `b-exit` on the title screen calls it. Verified it renders and fires.
- **Touch targets (class 6).** Stage is 540x960 scaled to 0.694 at 375x667. `.btn` 74 CSS =
  51 rendered, `#pausebtn` 74 = 51, settings rows 74 = 51. All clear of 48. The toggles are
  36 tall but the whole 74px row carries the handler.
- **Dashes in copy (class 7).** None. Copy is clean and in the house voice.
- **Overlay over a control (class 8).** Screens all route through `show()`, which closes every
  overlay first, so nothing can be left painted over anything. The one real collision was the
  feedback fab, listed above as defect 6.
- Physics is fixed-step (1/240) with an accumulator, so scoring does not vary with frame rate.
- The judge is a pure function of the landing point, and the harness hook is gated behind
  `?bb_test=1`.

## FIXES APPLIED

1. Loaded `/sunbeam-sdk.js?v=7` and `Sunbeam.init({gameId:'burrow-bowl'})`, so the earns that
   were already correctly written now actually arrive. Added a one-line console warning if the
   SDK is missing at first earn, so this can never fail silently again.
2. `jGet` now takes a validator and every load site shape-checks: STATS/MOM/SET/DAILY all fall
   back to a fresh default when the stored value is the wrong shape. `numLoad` clamps the bare
   number keys. A corrupt save now boots clean instead of bricking mid-round.
3. Reads are refreshed and merged at write time: counters ADD by the round's own delta, bests
   MAX, tickets ADD by the round's own delta. Two tabs no longer erase each other.
4. The daily round now persists its live state (ball, score, shots) after every ball, and a
   reload inside a daily resumes exactly where it stopped. Savescum is still impossible, since
   the resume restores the shots already thrown; only the lockout is gone.
5. `_sbCapEarn` clamps before it pays, and a storage failure now blocks the earn instead of
   uncapping it.
6. Feedback fab mounted, matching the rest of the fleet, and parked TOP LEFT, which measures
   clear of every control on all five screens. The settings rows were nudged down to clear it
   there too. The player can still drag it, and a spot they choose wins.

## VERIFICATION

`node satellites/burrow-bowl/check.mjs` — 30 assertions, all green. It exits 1 on failure, and
it was watched go red before each fix went in (the fab collision above was found BY this gate,
not by reading). Phase A compiles all six inline blocks; phase B drives a real headless browser
at 375x667 through a full nine ball round, a corrupt save, a second tab, a daily interrupted by
a reload, every control's rendered size, the fab's footprint on every screen, and a dash scan.

## STILL WORRIES ME

- The daily is still one round per device per day with no server behind it. Clearing site data
  hands you a fresh lane.
- Tickets and trophies survive "Clear my scores" on purpose. That is a design call and it is
  documented in the code, but a player who wants a genuinely clean slate cannot get one.
