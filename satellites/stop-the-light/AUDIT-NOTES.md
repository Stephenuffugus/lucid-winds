# STOP THE LIGHT — audit, 2026-08-16

Audited and repaired in one pass. Verification is `node check.js` in this
folder (61 assertions, no browser). The suite runs the real game script in a vm
with a stubbed DOM and a **pumped clock**: `requestAnimationFrame` is captured
and `performance.now` is fake, so the actual frame loop runs and real rounds
are played, banked, missed and timed out headless. Every assertion was watched
fail on purpose against a mutated copy (`STL_FILE=<copy> node check.js`).

## What the audit found, before anything was changed

Written before any edit. This game arrived in much better shape than its
shelfmate: the loop is complete, the curve is real, no screen is a dead end and
no control is a stub. Everything below is a defect at the edges.

1. **The embed protocol had drifted from the canonical block.** It gated the
   entire handshake on `?embed=1` and posted `{sws:'ready'}` exactly once, at
   parse time. The portal frames a card by url shape, not by query flag, and it
   arms a black screen recovery timer per load, so a silent load is treated as
   a crash and the player is thrown back to the arcade. This is the Litter Bug
   bug, shipped again in a quieter form.
2. **The fairness floor the game promises was not always held.** `startRound`
   measures the band and heart windows and widens until they clear 62ms and
   40ms, then clamped the heart to half the band width **after** the last
   measurement. What shipped was therefore not what was measured. Sampled
   deterministically over 12 seeds x 21 rounds the worst heart was **30ms**,
   three quarters of the promised floor and under two frames.
3. **Saves were last writer wins.** `STATS`, `stl_best` and `stl_daily_best`
   were read once at boot and written back wholesale, so two tabs clobbered
   each other and a stale tab could lower a personal best. Repo rule is read
   modify write, counters ADD, bests MAX.
4. **Corrupt saves could brick the settings screen.** `jGet` only proves the
   bytes parsed as JSON. `stl_set` holding a number (an old build, a truncated
   write, another tab's junk) made `SET.sound=1` throw under `use strict`,
   which kills the toggle handlers. `stl_stats` holding an array silently
   disabled the deepest round record.
5. **Pausing ate the beat it interrupted.** Result deadlines are absolute
   times and were held, correctly, while paused, but never shifted. Pause
   during the 0.24s stop beat and the choice card slammed up the instant you
   resumed, over the payoff you paused to look at.
6. Copy came back clean of dash characters. Touch targets measure 51.4 rendered
   px at 375x667, above the floor. Screens, overlays and the daily lock all
   behave. The nightly ring really is deterministic from the date: two fresh
   contexts produce the same rhythm and the same first band, and a free run
   does not.

## What changed

- **Protocol**: replaced with the canonical Flock the World block. Framing is
  detected by `window.parent!==window`, ready posts at parse **and** on load,
  and `?embed=1` survives only as an extra force flag for the earn messages.
- **Fairness floor**: the ratio clamp now runs at the top of the widening loop,
  so the geometry that is measured is the geometry that ships, and the 96
  degree cap no longer breaks out of the loop with an unverified pair. Worst
  case across 252 sampled rounds is now inside the floor, deterministically.
- **Saves**: `saveStats()` writes deltas since boot against whatever is on disk
  at write time; `saveBest()` takes a MAX. Every stored blob is shaped on read
  (`obj/num/flag/str`), so a corrupt one degrades to defaults instead of
  throwing. `stl_daily` is shape checked too.
- **Pause**: resuming slides every held deadline (`resultAt`, `payoffAt`,
  `paidAt`, `armAt`, `flyAt`) by the paused duration. Held time is not play
  time.
- **A reason to come back**: a nightly streak (`stl_streak`, advances only on
  consecutive calendar days, keeps its own best, restarts at one when broken)
  shown on the menu and the summary, plus a **Copy my result** button on the
  summary that produces a short shareable line with no dash characters in it.
- **Test hook**: `window.STL` (still gated behind `?stl_test=1`) also exposes
  the tuning tables, `setRound` and `measure` so the floor can be swept without
  a browser.

## Still worth doing

- Nothing has been looked at in a browser. The streak line on the menu, the new
  share button in the summary stack and the resumed payoff beat have never been
  seen rendered.
- The portal card is stamped `?v=20260807a`. Bump it when this ships or the
  host serves the old file. The portal is outside this folder.
- The synthesised audio is still unheard on a real device, and the game has
  still never run on a physical phone, iOS Safari or the Pi Browser.
- The share text is plain prose. An emoji pip line (one glyph per firefly)
  would travel better in a chat, but it is a design call, not a defect.
