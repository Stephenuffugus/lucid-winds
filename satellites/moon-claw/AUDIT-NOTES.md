# MOON CLAW — audit notes

Audited 2026-08-16. The defect list below was written BEFORE any edit, from a full
read of `index.html` (1673 lines) plus a headless pass. Fixes and verification are
recorded underneath.

## What the game is

A claw machine. Five tokens, nine plush prizes settled into a seeded pile, one
control (hold to glide the trolley, release to drop). Free cabinet or a daily
cabinet from a date seed. Prizes go on a permanent shelf; a 1-in-6 cabinet buries
a Golden Koi at the bottom.

## Core loop, start to finish

Menu -> How to play -> five drops -> summary -> shelf/again. It completes. The
claw state machine (`aim -> drop -> grip -> lift -> carry -> open -> celebrate ->
return`) has no unreachable phase and no phase without an exit. `recordEmpty()`
guarantees one summary row per token even when the drop scores nothing. Verified
end to end headlessly (see `test/`).

## Defect list (worst first)

### D1 — corrupt save is a permanent brick (class 3) — CRITICAL
`jGet()` is `JSON.parse` in a try/catch returning `v||d`. Anything that merely
parses is truthy and is handed straight to code that assumes a shape.

* `mc_shelf` = `{}` (an object, not an array) -> `SHELF.unshift(...)` in
  `landPrize()` throws. `landPrize` is called from `stepPile`, which is called
  from `frame`, so the throw escapes the rAF callback and
  `requestAnimationFrame(frame)` is never scheduled again. **The cabinet freezes
  mid drop and no reload fixes it, because the bad value is still in storage.**
  The player has no in-game way out: "Clear my scores" deliberately does not
  touch the shelf.
* `mc_stats` = `[]` -> `STATS.rounds++` is `NaN`, and the settings screen then
  reads `cabinets NaN · drops NaN`.
* `mc_set` = a number -> `SET.sound` is undefined, sound silently off forever.
* `mc_moments` = a string -> daily earn moments re-fire every round.

### D2 — two tabs clobber (class 4) — HIGH
`STATS`, `SHELF`, `MOM`, `BEST` and `DAILYBEST` are all read once at boot and
written back wholesale. Two tabs open on the same phone and the last writer wins:
a shelf full of prizes won in tab A is erased by tab B's first `jSet(K_SHELF)`.
Counters must ADD, bests must MAX, the shelf must union.

### D3 — the daily cabinet is spent by a reload, with no warning — MEDIUM
`newRound('daily')` writes `{started:true}` immediately so a mid round reload
cannot rehearse tonight's pile. Correct intent, but the menu then reads
"done today, you hauled 0" and the player is never told why. A player who
accidentally opens the daily and backs out loses it for the day.

### D4 — the exit is correct but the ready handshake is gated wrong — LOW
`SWS_EXIT` already has the `document.referrer` fallback and `b-exit` on the menu
calls it, so class 1 is clear. But `{sws:'ready'}` is posted only when
`?embed=1` is in the query. If this card ever moves to a `/play/` or github.io
url it will be framed WITHOUT `embed=1`, stay silent, and the portal's
black-screen recovery timer will close it. Post ready off real framing.

### D5 — no feedback route at all — LOW
Moon Claw never loads `/feedback.js`, so a player who finds a bug has nowhere to
report it. Every other audited satellite mounts the fab. (No overlap defect
follows from adding it: the bottom right of the stage at 375x667 maps to stage
coords x 411..523, y 710..822, which is bare cabinet plinth. The pause button is
top right and the only bottom controls are the drawn token pips at y 888.)

### D6 — the first thirty seconds
Passes. The rules screen is compulsory before the first drop, the play screen
says HOLD TO GLIDE THE CLAW and then LET GO TO DROP, and a sub-150ms tap is
treated as a misfire rather than eating a token.

### Checked and clean
* Touch targets: `.btn` and `.settingline` are 74px, `#pausebtn` is 74x74. At
  375x667 the stage scale is 0.694, so 74 renders at 51.4px. Above the floor.
* Dashes in player copy: none.
* Overlay covering a control: the pause card and every screen route through
  `show()`/`closeAllOverlays()`, so no two surfaces can be painted at once.
* Silent failure: audio, storage and the earn hook are all guarded, and none of
  them fake success to the player.
* Difficulty: real, not flat. Grip quality is a continuous function of how far
  off centre the jaws land, a pinned prize is multiplied by 0.55, and the carry
  sheds the prize when the pendulum passes `0.30 + q*0.85` radians. The pile
  genuinely digs out: every grab, every glance and every drop wakes the bodies.
* Determinism: `genCabinet` consumes two separate rng streams (layout, cosmetic)
  and settles with a fixed step, so tonight's pile is the same pile everywhere.

---

## Fixes applied

* **D1** — added shape validation between `JSON.parse` and use (`jSafe` + per
  key `fix` functions). Every saved object is checked for the type it must be
  (array of known prizes for the shelf, plain object of finite non-negative
  numbers for stats, booleans for settings, strings for the moment dates) and a
  value that fails is replaced AND rewritten to storage, so a bad value cannot
  bite a second boot. Plus the rAF chain is now rescheduled in a path that a
  throw cannot skip, with a run of three failures bailing the round out
  cleanly, because a claw machine that stops moving is this game's worst
  failure.
* **D2** — `bumpStats` reads storage at write time and ADDs; `saveBest` MAXes;
  `shelfAdd` gives every prize a row id and unions against whatever another tab
  wrote. Nothing is written from a boot snapshot any more.
* **D3** — the daily is marked started by the FIRST TOKEN (`startDrop`), not by
  entering the cabinet. Reading the rules and backing out no longer costs the
  day. Verified in a browser: `mc_daily` is still null after opening the rules
  AND after launching the cabinet, and only written once a token is spent.
* **D4** — `framed` is measured (`window.parent!==window`), ready is posted at
  parse time and again on `load`.
* **D5** — `/feedback.js` fab mounted.
* **NEW, found by the test, not by reading** — the fab covered the right edge
  of the Prize shelf button on the menu. The fab is hard right at stage
  x 453..523 and the button stack was 400 stage px wide, so it reached to 470.
  Stack and setting rows narrowed to 356. The browser suite now walks every
  screen plus the play HUD and fails if any control intersects the fab.

## Improvement (where a minute of work buys the most per minute of play)

**The pile is now readable before you spend a token.** The one thing Moon Claw
asks the player to do is "read the pile", and from directly above, a plump body
and a limb sticking out of one look identical, so the read was impossible and
every drop was a guess. While the player holds, the claw now draws a plumb line
to the body the jaws would actually meet and rings it: a solid green ring for a
body hit, a dashed gold ring for an edge, grey for a glance, orange plus a
second dashed ring around the neighbour when the prize is wedged. It uses the
same thresholds `resolveGrip()` uses, read from the live pile, so the preview
can never promise something the drop does not deliver, and it stays honest
because the trolley never stops moving: knowing the grip does not give you the
timing. One new rules line explains the colours.

I shot it and read the image. The green solid ring and the gold dashed ring are
both legible at 375 wide. The first pass distinguished them by colour alone,
which is not good enough, so the dash was added after looking.

## Still worries me

* The daily cabinet is still one attempt per day with no confirm before the
  first token. That is the design, but a player who taps once on the wrong
  screen still loses tonight's pile.
* The fab's dismiss badge draws as a second dark circle over the lower right
  glass of the cabinet. It is root owned (`/feedback.js`), covers no control,
  and reads as a machine part rather than a bug, so it is a note, not a fix.

## Verification

```
node satellites/moon-claw/test/check.mjs     # node only, 33 assertions
node satellites/moon-claw/test/play.mjs      # one headless browser, 62 assertions
```

`check.mjs` parses every inline block with `vm` (not a brace counter), then
lifts the save validators out of `index.html` by name and runs them against 16
malformed values. It self tests every run by feeding the same assertions a
do-nothing validator and exits 2 if that passes.

`play.mjs` serves the repo itself, boots the real page, unlocks the dev gate,
plays a full five token cabinet through the test hook and asserts the summary
appears with five rows, then repeats the whole cabinet under ten different
malformed saves, then walks every screen measuring the feedback fab against
every control, then proves the daily is not spent until the first token.

Both were watched RED first. `check.mjs` fails against the unfixed validators.
`play.mjs` against the pre-audit `index.html` and `mc_shelf='{}'` reported
`stuck in celebrate, summary never shown` with `SHELF.unshift is not a
function`, which is the freeze this audit started from.
