# BLOOM BREAKER — Start Here shelf audit, 2026-08-16

Judged against one question: a stranger on a phone, ninety seconds, does this
make them want to see more of the studio.

## VERDICT

**Earns its slot.** It is the most solidly built of the four: 16 hand-made
levels plus a boss plus an endless mode, three real difficulty tunings, a shop,
colour-blind palettes, a reduced-motion setting, and by a distance **the best
save loader in the set** (every field type checked, clamped and whitelisted
against the real catalogue, so a hostile or truncated blob cannot poison it).

Its problem was never the game. It was that the game was three screens away.

## AUDIT (written before any change)

### P0 — the front door asked two questions before showing a ball
`PLAY` opened `CHOOSE PACE`. `CHOOSE PACE` opened `SELECT A LEVEL`. Only the
third screen started a game. That is **two decisions and three screens before a
stranger sees the ball move**, on a shelf where the whole budget is ninety
seconds.

Worse, the first question is unanswerable by the person being asked. The pace
cards read "Gentle ball, 5 lives, a broad paddle", "**The intended tuning**",
"Fast ball, 2 lives, a narrow paddle". "The intended tuning" means nothing
before you have played, so the stranger either guesses or backs out.

### P0 — the fleet feedback fab lands on the LAUNCH button
This game was on the studio list of pages where the global fab covers a control.
Confirmed with numbers rather than a guess:

- `/feedback.js` parks the satellite mini fab at `right:12px`,
  `bottom:calc(96px + safe)`, 48x48, **z-index 2147482000**.
- `#actionBtn` (LAUNCH / RELEASE / SLAM) is 88x88 at `right:16px`,
  `bottom:calc(18px + safe)`, **z-index 20**.

So LAUNCH occupies 18 to 106 measured up from the bottom and 16 to 104 in from
the right. The fab occupies 96 to 144 and 12 to 60. They **overlap in a 44 by 10
strip across the top left of LAUNCH**, and the fab wins that strip by nine orders
of z-index magnitude.

The 48x48 also sits over the canvas, and `canvas.addEventListener('pointerdown')`
is what starts a paddle drag, so a thumb that comes down there does not move the
paddle either.

`feedback.js` is fleet-wide and not this game's file to edit, so the fix is a
local CSS override.

### Exit — already correct, and correct for the right reason
`exitBtn` calls `SWS_EXIT`, `SWS_EXIT` has the `document.referrer` fallback that
the portal's top-level navigation actually needs, and `refreshControls` (which
runs every frame) hides the button whenever `S.state !== 'MENU'` so a stray thumb
during a rally cannot quit the game. That last detail is better than the other
three games manage and is now asserted so it stays.

### Core loop — no dead ends found, and the boss was thought about
`boot` to `gotoMenu` to `startGame` to `newRun` to `frame`. Pause is reachable
from a button and from Escape/P; the pause sheet offers Resume, Restart Level,
Settings and Quit to Menu. Game over offers Try Again and Menu. Win offers Menu.
Every sheet has a way out.

The boss fight has an explicit anti-dead-end:
`bossHeartVulnerable()` returns true `if (S.boss.vulnerable || bossBombsLeft()===0)`,
with the comment "once every bomb is spent the shell stays open, the fight can't
dead-end when bombs run out". Somebody thought about the failure mode. Asserted.

`isWinnable(grid)` exists and is the game's own answer to "can this board be
cleared". Ran it against **every shipped level grid and 60 generated endless
levels**: all clearable.

### Save / load — the best of the four
`loadStore` starts from `defaultStore()` and copies in only what type checks:
`coins` and `highScore` floored and floored at 0, `unlockedLevel` clamped to
`[1, LEVELS.length]`, `lastDiff` checked against the real `DIFF` table, owned
skins filtered against the real catalogue with the free default always present,
and the equipped id validated against what is owned. A blob claiming
`unlockedLevel: 99999` or `owned: ["not-a-real-skin"]` cannot do anything.
Verified against seven corrupt payloads.

Two-tab clobber: the write is wholesale `JSON.stringify(store)` on a 250ms
debounce, so two tabs do race. Impact is coins and unlocks, not corruption,
because the loader sanitises on the way back in. Noted, not fixed.

### Difficulty — real, on two axes
`DIFF` changes both lives (5/3/2) and paddle width (116/96/76) and ball speed
(470/600/760) and ramp (0.03/0.05/0.08). Not three labels on one tuning. Asserted
against the live values.

### Touch targets — pass
Renders unscaled, so CSS px are real px at 375x667. `.btn` 52, `.btn.ghost` 48,
`.btn.sm` 48, `.exit-link` 48, `#pauseBtn` 48, `#actionBtn` 88, `.seg button` 48.
The settings toggle pill is only 32px tall but the whole 56px `.setrow` carries
the click handler, which is the right way to do it.

### Copy — clean
No en or em dashes outside comments.

### Security — the dev bridge is properly gated
`BB_DEV` needs `?bbtest=1` **and** a `file://` or localhost origin, so it cannot
be used to mint cosmetics on the live domain. Asserted.

### Service worker — none
This game ships no `sw.js` and registers none, so there is no cache to sweep and
nothing to keep in lockstep. Correct by absence, not an oversight.

## FIXED

1. **PLAY now plays.** It drops straight into the next unlocked level at the pace
   you last used, defaulting to Normal for a first-time player. Nothing was
   removed: a new `🗺 Levels` button opens the same pace picker and the same
   level map, one tap from the menu.
2. **Moved the fleet feedback fab off the LAUNCH button** with a local
   `.lwfb-fab.lwfb-mini` override that parks it on the left rail at the same
   height, clear of both the action button and the right-handed thumb arc that
   drives the paddle. The check asserts the geometry the override is correcting,
   so if `#actionBtn` moves the assertion fails rather than the overlap silently
   returning.

## IMPROVED

3. **The PLAY button tells the truth about progress.** It reads `PLAY` cold and
   `CONTINUE · LEVEL N` once anything is unlocked, repainted by `updateHUD`.

## NOT FIXED (deliberate)

- Wholesale localStorage write. The loader sanitises everything on the way back
  in, so a two-tab race costs progress, never integrity.
- The pace picker copy ("the intended tuning") is still opaque, but it is now
  behind a button that only a player who has already played will press, which is
  exactly the audience the phrase is written for.

## VERIFICATION

`node check.mjs` in this folder: 52 assertions, including every shipped level
and 60 endless levels through the game's own `isWinnable`. `node check.mjs
--selftest` breaks each invariant in turn; **12 of 12 mutations turn their
assertion red**. A probe that cannot fail is not evidence.
