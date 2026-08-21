# NECTAR DROP — Start Here shelf audit, 2026-08-16

Judged against one question: a stranger on a phone, ninety seconds, does this
make them want to see more of the studio.

## VERDICT

**Earns its slot, and is the one that most flatters the studio.** It is the
deepest of the four (12 gardens, gardener powers, wardrobe, awards, a daily),
it has painted backgrounds, and it is the only one of the four that teaches
itself with a real three card tutorial before the first shot.

Its problems were both about *getting to the game*: the front door took three
taps instead of one, and once inside a meadow there was no door at all.

## AUDIT (written before any change)

### P0 — no way out of a meadow, and no `s-play` element at all
`show('s-play')` is called at index.html:815 to start a level. **There was no
element with id `s-play` in the document.** `show()` is written defensively
(`var el=$(id); if(el)el.classList.add('on')`), so the call quietly did nothing
except set `curScreen` and `running`, and the game worked by accident: all
screens got hidden and the canvas showed through.

The consequence is the defect. With no play screen there is no play chrome: no
pause, no home, no exit while a meadow is running. Once a level starts the only
exits are winning it, losing it, or the browser back button. That is a state a
player cannot leave by any affordance the game offers.

### P1 — PLAY did not play, and the function to fix it was already written
`tap('b-play')` opened the garden map. A returning player's path back to the
game was **Play, then a garden, then a meadow: three taps.**

`firstUncleared()` is defined at index.html:1437 and **is called by nothing**.
Somebody wrote the resume-where-you-left-off helper and never wired it. Dead
code that describes the missing feature exactly.

### P1 — player copy under the rendered font floor
Same architecture as Super Slice: a 540x960 stage scaled `min(vw/540, vh/960)`
= **0.694 at 375x667**. The floor is 11.2px rendered = 16.2 stage px.
`.ribbon` 14px rendered 9.7. `.btn.sm` 16px rendered 11.1. `.helprow` 14px
rendered 9.7. `.title-sub` 14px rendered 9.7. Win and lose sublines 15px
rendered 10.4.

### P1 — the game's own headless test hook stepped the world wrongly
`ND_DEV.fireAt` advanced the simulation with a bare `while(...) physics()` loop
of its own. That is not a frame. `loop()` also does `G.t++` every frame, and hit
blooms dissolve on a `G.t` deadline (`(G.t - pg.hitT) > ND_SOLID`). Under the
hook `G.t` never moved, so **every bloom the ball touched stayed solid forever**
and the ball ping-ponged in a field that should have been clearing.

The first run of `check.mjs` duly reported "3 shots in 60 never resolve, the ball
is trapped forever" — a P0-shaped finding that is **not true of the real game**.
It took a look at the ball state (age 20,000, velocity near zero, wedged) to see
the checker was being lied to by the hook.

Fixed at the source rather than papered over in the checker: one frame of
simulation now lives in a single `simFrame()` that both `loop()` and the dev
hooks call. `fireAt` and `autoPlay` both go through it. With a real frame, all
60 shots resolve. A probe that steps the world differently from the game is a
probe that lies, and it lies in whichever direction happens to be convenient.

### P2 — the Daily Bloom is not as deterministic as its comment claims
index.html:769 says "daily passes a seeded rng so every player gets the SAME
board", and `assignColours` honours that. But `pegSwap()` (a gardener power,
index.html:405) picks its three blue pegs with **`Math.random()`**. Two players
on the same daily who fire the same power get different boards from that point
on. The *starting* board is identical, which is what the comment is literally
about, so this is a soft violation rather than a broken promise.

**FIXED (commit ada4c65a) and PROVEN 2026-08-21.** pegSwap now picks the
three blues NEAREST the bloom that fired it, with an index tiebreak — same
distance-based family as goldRush and rainbowChain, so no per-run rng thread
was needed and no other power's behaviour changed. Every remaining
Math.random() in the file is visual or audio only (sparks, vfx rotation,
screenshake, sfx pitch) plus the autoPlay test hook. Empirical proof: two
fresh page loads of the same Daily, ten identical shots each with powers
firing, produced identical boards start to finish (hit flags included) and
identical 41,546 scores. The Daily keeps its promise and is safe to submit
to Listdle.

### Core loop — good, and the best juice of the four
`newGame` builds pegs from a per level `build()`, `cleanPegs` de-overlaps them,
`assignColours` assigns reds/greens/purples from a shuffled index list with a
seeded rng. Aim, launch, `physics()` until all balls die, `resolveShot()`, win
when `redsLeft` hits 0 or lose when `ballsLeft` hits 0. Win screen offers Next /
Replay / Meadows / Share; lose offers Try again / Meadows / Share. Neither is a
dead end.

Stuck balls: every ball carries `age`, `dist` and `wall` counters and `physics`
retires them, so a ball trapped in a pocket does not hang the run. Confirmed by
driving 200 randomised shots through the live engine in `check.mjs` and asserting
every one resolves inside the tick guard.

### Save / load — safe
`PROG` and `SET` are read through try/catch. Verified against six corrupt
payloads in `check.mjs`; none throw and all fall back to defaults. Wholesale
write, so two tabs race; impact is cosmetic progress, not data loss.

### Difficulty — real
Level count and red-bloom count climb per world, worlds add gimmicks (moving
pegs and so on). Not flat.

### Exit — this one was already right
`b-exit` on the title reads `◄ Sky Wolf Studios Arcade`, calls `SWS_EXIT`, and
`SWS_EXIT` has the `document.referrer` fallback for the unframed case that the
portal actually produces. Correct branding per the studio rule. This is the
reference implementation of the other three games' missing piece.

### Service worker — correct
`nectar-drop-v7`, prefix-scoped sweep, `sw.js?v=7`. In lockstep.

### Copy — clean
No en or em dashes outside comments.

### Touch targets — pass
`.btn` / `.btn.sm` 72 stage px → 50 rendered. `.settingline` 72 → 50.
`.worldcard` min-height 112 → 78. New `.tbtn` 72x72 → 50x50.

## FIXED

1. **Created the missing `#s-play` screen** with a home button (`⌂`, 72 stage px
   = 50 rendered, top left, `pointer-events:none` on the sheet so only the button
   is live). Quitting a normal meadow returns to that garden's meadow list;
   quitting the Daily returns to the title, because a daily player never picked a
   garden and dropping them in one is disorienting.
2. **PLAY now plays.** `b-play` jumps straight into `firstUncleared()`, the
   helper that was already sitting there unused. First-time players still get the
   tutorial first, and the tutorial still ends by dropping them straight into
   meadow 1.
3. **Added a `🗺 Gardens` button** so the map is still exactly one tap away for
   browsing and replaying. Nothing was removed, only re-ordered by intent.
4. **Raised the first-impression copy above the 11.2px rendered floor**
   (`.ribbon`, `.title-sub`, `.helprow`, `.btn.sm`, `h2.sc-h`, win/lose sublines,
   tutorial body).
5. **Unified the frame step** into `simFrame()` so the headless hooks and the
   render loop advance the world identically.

## IMPROVED

6. **The Play button tells the truth about progress.** It reads `🌼 Play` cold
   and `🌼 Continue · meadow N` once anything is cleared, repainted every time
   the title screen comes back rather than only at boot.

## NOT FIXED (deliberate, with numbers so the next person can act)

- **`pegSwap` uses `Math.random`** (index.html:405). Gameplay change, Director
  call.
- **Dense meta-screen labels are still under the font floor.** Exact rendered
  sizes at 375x667: world card title 15px -> 10.4, world card sub 11.5 -> 8.0,
  level cell number 12 -> 8.3, wardrobe chip 11 -> 7.6, award caption 10 -> 6.9,
  toast 13 -> 9.0. These sit in fixed-width grid cells, so raising them without a
  browser open risks wrapping and clipping that no headless check can see. Left
  for a pass done with eyes on it (studio rule: looking is part of the job).
- Wholesale localStorage write. Cosmetic impact only.

## VERIFICATION

`node check.mjs` in this folder. Boots the shipped script in a `vm` with a DOM
and canvas stub and drives the real engine through `ND_DEV`. `node check.mjs
--selftest` breaks each invariant in turn and requires the matching assertion to
go red; a probe that cannot fail is not evidence.
