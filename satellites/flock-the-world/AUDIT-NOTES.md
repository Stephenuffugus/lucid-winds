# FLOCK THE WORLD — audit, 2026-08-16

Audited and repaired in one pass. Verification is `node check.js` in this
folder (47 assertions, no browser). Every assertion in it was watched fail on
purpose before it was trusted, by mutating a copy of `index.html` and running
the suite against the mutant with `FTW_FILE=<copy>`.

## What the audit found, before anything was changed

Written before any edit. Worst first.

1. **No persistence of any kind.** A run is ten to forty minutes. Backgrounding
   the tab on a phone threw all of it away, and nothing about a finished run
   was ever recorded. The old handoff parked this "until self hosting"; it is
   self hosted now, so the reason had expired.
2. **No way out of a running game.** The only exit affordance was appended to
   the bottom of the menu, below the legal fine print. Once `startGame()` ran
   there was no route back to the menu at all: an abandoned run could only be
   escaped by closing the tab, which also destroyed it. This is a state you
   cannot leave, in a game whose sessions are long.
3. **Dash characters in player facing copy, about 25 strings.** Hard studio
   rule. Menu blurb, pick screen, both end screens, the seven step field
   manual, the country tip, the event modal, the World tab, the synergy
   banner, two ambient headlines, and the `—` placeholders sitting in six HUD
   and end screen slots.
4. **Touch targets under the 48px floor.** This page is not a scaled stage, so
   CSS px are rendered px: speed buttons 30x30, zoom buttons 32x32, sheet close
   30x30, nav buttons about 45px tall. All fail at 375x667.
5. **No in development gate** while the portal card is `beta:true`. Every other
   gated satellite loads `/dev-gate.js`; this one did not, so a direct URL
   showed an unfinished game to a stranger.
6. **No fleet earn wiring.** No `_sbCapEarn`, so the game paid the player
   nothing while its shelfmates paid sunbeams.
7. Core loop itself is **sound**. The sim runs start to finish: a balanced bot
   wins around day 800 with oversight in the forties, a do nothing run never
   wins, the dep/cap rush loses. Nothing in the four trees is a stub, the
   region actions all resolve, protests transition, regions can be lost and
   the loss conditions fire. The difficulty curve is real and mode and
   difficulty multipliers all reach the tick.
8. Cosmetic, not fixed: `howBtn` shows the game screen with a null state to
   borrow the modal card. It works, and the placeholder text behind it is now
   blank rather than a row of dashes.

## What changed

- **Copy**: 39 exact literal replacements. Sentences were rewritten, not
  character swapped ("free ones have read the leaks" now follows a comma, the
  win screen breaks into two sentences, `6–1` became "6 to 1", `K–5` became
  "K to 5"). Zoom buttons are now IN / OUT / FIT, which also removed the U+2212
  minus glyph and reads better than the old house icon.
- **Touch targets**: `.sp` and `.zb` and `.x` are 48px, `.nb` has a 52px floor.
  The speed buttons moved out of the stat row into a new `#ctlrow` so five
  48px controls fit across 375px without crushing the date.
- **A way out**: the new `☰` button in that row opens a leave card with three
  answers: back to the operation, save and go to the menu, or leave for the
  arcade through `SWS_EXIT`. The run is saved before the card opens.
- **Persistence**: `ftw_run` (resume blob, written every 20 sim days, on tab
  hide and on pagehide) and `ftw_recs` (lifetime records). Both are read
  modify write: counters ADD, bests MAX, discovered synergies union, so two
  tabs cannot clobber each other. Every read is shaped and validated; a
  corrupt or half written blob is refused and the player starts fresh instead
  of booting into a broken world. The menu grows a "Resume your run" button
  and a records line, and starting a new run asks before replacing a save.
- **A reason to come back**: records (runs, wins, best coverage, fastest win)
  and a permanent synergy ledger. The eight synergies are still never listed
  in advance, only counted, and named on the end screen once you have found
  them. Plus a "Copy this result" share text on the end screen.
- **Earn**: `_sbCapEarn` block added, 30/day cap keyed on the folder name.
  Pays 3 per synergy discovered for the first time ever, 8 on a win, 3 on a
  loss that lasted past day 200.
- **Dev gate**: `/dev-gate.js?v=2` now loads, matching the rest of the fleet.

## Still worth doing

- The portal card still points at `?v=20260815b`. That stamp MUST be bumped
  when this ships or the host serves the old file. The portal is outside this
  folder so it was not touched here.
- Nothing has been looked at in a browser. Everything above is proved by node
  and by source. The HUD control row, the leave card and the resume button
  have never been seen rendered, and that is the next thing anyone should do.
- The guide still runs only on the first game per page load, so a resumed run
  gets no briefing. That is deliberate but untested with a real player.
- Balance is unchanged. `sim.js` still needs the script extracted by hand;
  `check.js` now runs the same bots without that step.
