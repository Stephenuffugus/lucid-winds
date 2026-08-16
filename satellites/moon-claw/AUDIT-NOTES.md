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

* **D1** — added `_shape()` validation between `JSON.parse` and use: every saved
  object is now checked for the type it must be (array for the shelf, plain
  object with numeric fields for stats/settings/moments) and a value that fails
  is replaced with the default AND rewritten to storage, so a bad value cannot
  brick a second boot. Plus a belt-and-braces `try/catch` around the body of
  `frame()` that reports once and keeps the rAF chain alive, because a frozen
  claw machine is the worst possible failure for this game.
* **D2** — `STATS` writes now read-modify-write and ADD; `BEST`/`DAILYBEST` MAX
  against the stored value at write time; `SHELF` writes re-read storage and
  union by `(type, day, mode, index)` so a prize won in another tab survives.
* **D3** — the daily is now marked started only on the FIRST token, not on
  entering the cabinet, and the menu says plainly that tonight's cabinet has been
  opened. Backing out of the rules screen no longer costs the day.
* **D4** — ready is posted whenever the page is genuinely framed, and again on
  `load`, per `incoming/PORTAL-CONTRACT.md`.
* **D5** — `/feedback.js` fab mounted.

## Improvement (where a minute of work buys the most play)

**The pile is now readable before you spend a token.** The single biggest thing
Moon Claw asks the player to do is "read the pile", and it gave them nothing to
read it with: a buried prize and a loose one look identical from above. Added a
drop shadow trace under the trolley showing which body the jaws will meet and
whether it is centred, pinned or an edge clip, drawn only while the player is
holding. It teaches the grip model in one drop instead of five, and it costs
nothing in fairness, because the claw was always honest and this only shows what
it was already going to do.

## Verification

`test/check.mjs` (node, no browser) parses every script block with `vm` and
asserts the storage validator's behaviour against 14 malformed values.
`test/play.mjs` (puppeteer, one browser) boots the real page, unlocks the dev
gate, plays a full five token cabinet through the test hook, asserts the summary
appears with five rows, then reloads with each malformed save in turn and asserts
the game still boots and still animates. Both were watched RED first: `check.mjs`
against the unfixed validator, `play.mjs` against a deliberately broken
`mc_shelf`.
