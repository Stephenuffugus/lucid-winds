# RULE ROOT — audit notes

Audited 2026-08-16. Read end to end (1280 lines) BEFORE any edit. Defect list written first,
then fixed worst first. Left behind: `check.mjs` (node syntax gate + headless assertions at
375x667). Every assertion was watched fail on purpose before it was allowed to pass.

## Core loop, walked start to finish

Title → How (forced once, then remembered) → Journey level grid → play a garden by pushing word
tiles to rewrite the rules → win screen with moves and par → next garden. Daily Root picks one
garden per day and pays a streak. Free Play replays solved gardens. Wardrobe and Grove are real,
gated on real counters. Undo goes all the way back; restart is on the HUD; the softlock prompt
fires the moment nothing IS YOU.

Nothing in here is a stub. The solver in the test hook proves every shipped level solvable, and
the hint is the same solver time sliced so it cannot freeze the thread. This is a finished game.

## DEFECTS FOUND (worst first)

### 1. A save that merely parses kills Journey, silently. (standing class 3)
`var PROG = loadJSON('ruleroot_save',null) || { ... }`. `loadJSON` try/catches the parse, which
is not validation: `{}`, `5`, `[]` and `"x"` all parse and are all truthy, so the default is
never reached and PROG goes into the game with no `solved`, no `life`, no `daily`, no `eq`.

Consequences, all reachable from one bad write:
- `refreshTitle()` runs at boot and throws on `PROG.solved[i]`, so the build stamp and the daily
  pill are never painted.
- Tapping **Journey** calls `buildLevelGrid`, which throws on the same line INSIDE the click
  handler. The button does nothing at all. No error the player can see, no way forward. The
  game looks alive and is not.
- `render()` reads `PROG.eq.bg` on every frame, and `winLevel()` writes `PROG.life.solves++`.

### 2. The only way back to the arcade was an external file.
Rule Root has no `SWS_EXIT` and no portal link of its own. It relies entirely on
`/arcade-exit.js` loading and injecting a button. That script is correct, and it does use the
`document.referrer` fallback rather than `window.parent` (standing class 1), but a 404, a stale
cache or a CSP hiccup leaves the player with no way out at all, and in an installed PWA there is
no back gesture to save them. A game's own exit should not be somebody else's script.

Found while fixing this, by measuring rather than trusting: adding a title screen button that
called `SWS_EXIT` was not enough. `arcade-exit.js` stands down only when `SWS_EXIT` already
exists, so until the game defined it the injected chip stayed and the title screen ended up with
TWO ways out, one of them a stray chip at the bottom. Hush shipped with two identical buttons
for the same reason a fortnight ago. The gate now asserts there is exactly one.

### 2b. The feedback fab sits on the exit button. (standing classes 2 and 8)
Measured at 375x667: the fab lands at x 315 to 363, and the full width title buttons run to
x 334. The fab's own watcher does not move it, because its probe points fall clear of that
narrow overlap.

### 3. Two tabs clobber the whole profile. (standing class 4)
`saveAll()` writes `PROG` wholesale from a boot snapshot. Two tabs, solve a garden in each, and
the tab that saves last erases the other's solved gardens, seeds, best move counts, grove
keepsakes and daily streak. Everything in this profile is a set, a counter or a best, so nothing
about it needs to be last-writer-wins.

### 4. The stage is measured with `innerHeight`. (fleet rule)
`fit()` reads `window.innerWidth/innerHeight` and only listens to `resize`. The studio swept this
in July: on iOS `innerHeight` includes the area behind the URL bar, so the bottom of the stage,
which is exactly where the d-pad lives, is cut off until something forces a resize.

### 5. The softlock prompt offers one button, and it can be the wrong one.
When nothing IS YOU the prompt says "take the last move back" and shows Undo. If the player got
there on the very first move of a fresh restart the undo stack is empty and the button does
nothing at all. The HUD restart is still up there, but the prompt that has taken over the middle
of the screen is telling them to press a dead button.

### The shared feedback fab hides itself for the first 20 seconds. (fleet level)
Measured, not read: on a fresh load the fab mounts at its home spot and then fades to
`opacity:0` with `pointer-events:none` within a few seconds, and only comes back at about 26
seconds when `feedback.js` hits its own 20 second ceiling and forces itself home. The cause is
in the shared file, not in this game: every screen here is a full bleed div containing buttons,
which trips the watcher's "this is a cover with real content under it" rule, so it goes looking
for an empty spot to park in, finds none on a full screen layout, and yields.

Two things follow. It is not a tap stealer while it is hidden, because the same rule that hides
it also sets `pointer-events:none`, so this is a visibility problem and not a correctness one.
And it makes the parking work above matter MORE, not less: the place it returns to after the
ceiling is its home, which is exactly the footprint that had to be cleared of controls. The
gate asserts the whole invariant now, so a fab that quietly faded can never make the collision
test pass for the wrong reason. Fixing the fade itself belongs in `/feedback.js`, which is
outside this audit's sandbox.

## CHECKED AND CLEAN

- **Touch targets (class 6).** Stage scales 0.694 at 375x667. Someone already did this work
  properly: `.hbtn` is 64 CSS but carries a `::after` bleed of 4px a side (72 CSS = 50 rendered),
  `.dbtn` is 76x60 with a 6px vertical bleed (= 52x50 rendered), `.btn` is 72 min-height
  (= 50), the settings toggles are small but the whole 72px row is the target.
- **Dashes in player copy (class 7).** None.
- **Overlay over a control (class 8) inside the game itself.** `show()` clears every screen
  before painting one, and the toast is `pointer-events:none`, so no screen or prompt can be
  left painted over a control. The one real collision was the feedback fab, listed above as
  defect 2b.
- **Silent failure (class 5).** The hint is honest: when the solver hits its 4 second wall it
  says so rather than pretending. Sunbeams are wired to a loaded SDK and capped per run and
  per day.
- The daily cannot be re-earned by replaying it, and Free Play deliberately pays nothing.

## FIXES APPLIED

1. `PROG` and `SET` are validated field by field on load, not just parsed. Anything of the wrong
   shape is replaced by a fresh default, so a corrupt save costs a profile rather than the game.
2. Rule Root now owns its exit: the canonical block from `incoming/PORTAL-CONTRACT.md`, with the
   referrer fallback and the ready handshake, plus a real button on the title screen.
   `/arcade-exit.js` now stands down on its own, so there is exactly one way out and the gate
   asserts it. The exit button is 64% width and centred, which keeps it clear of the feedback
   fab's measured footprint.
3. `saveAll()` merges against the freshest copy on disk before writing: solved and seeds union,
   life counters and streak take the max, per level bests take the fewest moves, grove keepsakes
   union by chapter. Two tabs can no longer erase each other.
4. `fit()` measures `visualViewport` and listens to its resize and scroll, with an
   `orientationchange` catch up.
5. The softlock prompt now offers Restart next to Undo, and Undo is disabled when there is
   nothing to undo.

## VERIFICATION

`node satellites/rule-root/check.mjs` — 45 assertions, all green. It exits 1 on failure and was
watched go red before each fix (the duplicate exit chip and the fab collision were both found BY
this gate). Phase A compiles all four inline blocks; phase B drives a real headless browser at
375x667: a full solve of garden one through the game's own solver, five different corrupt
profiles each tapping Journey for real, a second tab's profile surviving our save, the softlock
prompt's two buttons, the visualViewport fit, every control's rendered size on six screens, the
fab's footprint, and a dash scan.

## STILL WORRIES ME

- The hint solver runs on the main thread in 12ms slices. It is honest and it never froze in
  testing, but the final garden is the one that needs a hint most and it is also the one that
  most often hits the 4 second wall.
- Progress is device local with no export. Clearing site data loses every garden.
