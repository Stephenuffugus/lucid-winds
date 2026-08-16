# BUDBURST — audit notes

Audited 2026-08-16. Defect list written BEFORE any edit, from a full read of
`index.html` (1672 lines). Fixes and verification recorded underneath.

## What the game is

A botanical bubble shooter. Seven modes: Adventure (12 gardens x 12 levels = 144,
with a Bloom Core boss as level 12 of each), Arcade with a three power loadout,
90 second Blitz, 40 fixed Puzzles, Endless, Zen, and a date seeded Daily. Coins
and nectar, a cosmetic shop with four tabs, upgradeable abilities, consumable
boosters, three rotating daily goals.

## Core loop, start to finish

Menu -> map -> level -> result -> next level. It completes, and the portal card's
claim of "144 levels" is true (12 gardens x 12). Objectives (clear / harvest /
rescue / boss) all resolve, unlock chains are consistent, and every screen has a
back control. This is the most finished of the three games audited today.

## Defect list (worst first)

### B1 — one malformed daily-goals value bricks the entire game (class 3) — CRITICAL
`getMissions()` accepts anything that parses:

```js
let m=null; try{const r=Store.g(K.miss); m=r?JSON.parse(r):null;}catch(e){m=null;}
if(!m||m.date!==todayStr()){ ...rebuild... } return m;
```

A value of `{"date":"<today>"}` with no `items` passes the date check and is
returned intact. `missionEvent()` then runs `m.items.forEach` and throws, and so
does `renderMissions()`.

`renderMissions()` is called from `refreshMenu()`, and `refreshMenu()` is called
at the very bottom of the boot block. The throw kills the rest of that block,
which means **`requestAnimationFrame(frame)` never runs, `window.SWS_EXIT` is
never defined, and `$("exitLink").onclick` is never wired.** The menu paints
half-built, the mode buttons still work because they were bound earlier, and
tapping Adventure -> a level opens a game screen whose canvas never draws a
single frame. The player is left staring at a blank board with no exit link.
This is a permanent brick surviving every reload. It is the single most
dangerous line in all three games audited today.

The same class, less severe, applies to `getProg()`, `pzProg()`, `abilData()`
and `boostData()`: all four return whatever parsed, and `setStars`/`pzSetStars`
then assign a property on it. In `"use strict"` that throws if the value is a
primitive, which kills `levelWon()` on the line after the score is computed, so
the win is scored and never shown.

### B2 — the NEXT bud swap target is 44px rendered, under the 48 floor (class 6) — HIGH
`nextRect()` returns an `R*2` square. `R = min(availW/(COLS*2), ...)`, and at
375x667 that is `355/16 = 22.19`, so the tap target is **44.4 x 44.4 rendered
px**. The How to play screen explicitly tells the player "Tap the small NEXT bud
beside the launcher to swap your shot", so this is a named control shipped under
the floor. It is also the exact trap the brief warns about: nothing in the CSS
declares 44, the number falls out of the arena geometry.

### B3 — the feedback fab sits over the bottom right of the play field (class 2/8) — MEDIUM
`/feedback.js` mounts a fab at `right:12px; bottom:12px`, roughly 74x74 at
z-index 2147482000. Budburst's arena is the full viewport below the HUD, and the
whole arena is the aim surface. At 375x667 the fab occupies about x 289..363,
y 581..655; the launcher sits at y ~620 and the NEXT bud ends at x ~276. So the
control itself clears it by 13px, but a drag started in the bottom right corner
of the board is eaten by the fab. (`feedback.js` ships a relocation pass; whether
it fires here needed measuring in a real browser, not reasoning.)

### B4 — placeholder em-dashes in player copy (class 7) — LOW
`<span class="meta" id="advMeta">—</span>` and
`<span class="oText" id="objText">—</span>` ship a literal em dash in markup.
Both are normally overwritten before paint, so they are only visible when
something upstream throws, which is exactly the B1 case. Studio rule is no
dashes in player copy regardless.

### B5 — Zen mode can never end and pays nothing until you leave — LOW
`checkWin` returns false for Zen and `checkLose` returns false (`noFail`), so the
only exit is the back chevron, which routes through `endZenRun()`. That works and
does pay out, but nothing on screen tells the player that leaving is how you bank
a Zen run. A player who assumes backing out discards the run will never collect.

### B6 — Store falls back to memory silently — LOW
If localStorage is unavailable (private mode, blocked storage), `Store` quietly
switches to an in-memory object. Every coin, star and unlock then evaporates on
reload with the player never told. Class 5: it shows the player something
plausible while the real thing failed.

### Checked and clean
* Exit (class 1): `SWS_EXIT` has the `document.referrer` fallback and
  `$("exitLink").onclick` genuinely calls it. Renders on a top level navigation.
  (Subject to B1 not having killed the boot block first.)
* Two tabs (class 4): unusually good. `addCoins`, `addNectar`, `setStars`,
  `pzSetStars`, `addBoost` and the three best-score writes all read fresh from
  storage and then ADD or MAX. No wholesale boot snapshot is written back.
* Touch targets elsewhere: `.icbtn` 48, `.lvl` 75.75 rendered at 375, `.gtab`
  48, `.mode-card` 88, `.res-actions button` 52, `.shop-tab` 48, `.back` 48,
  `.ab-btn` 48, `.boost-btn` 48.
* Difficulty: real. Gardens ramp colours 3 to 6, rows 4 to 9, and add thorns,
  seeds and bombs; within a garden rows grow with `floor(l/4)`; every twelfth
  level is a boss with scaling HP and a descending canopy.
* First thirty seconds: a one-time coach card names the verb, the full How to
  play sheet is one tap from the menu, and Meadow level 1 is three colours on
  four rows with a clear objective.
* Stuck states: `stepProjectile` has a 4 second and an off-screen failsafe;
  `rollAmmo` hands out a bomb when no colour remains in the grid;
  `finishResolve` re-arms `cur` as a bomb if the board has only thorns and seeds
  left. A run cannot deadlock.
* Silent failure elsewhere: `shareDaily` reports a failed copy honestly,
  `_sbCapEarn` keeps its daily cap even when storage throws.

---

## Fixes applied

* **B1** — every JSON-backed read (`getMissions`, `getProg`, `pzProg`,
  `abilData`, `boostData`) now validates shape, not just parseability, repairs
  the stored value in place, and the boot block is ordered so a failure in menu
  rendering can never prevent the game loop, the exit protocol or the exit link
  from being wired.
* **B2** — the NEXT swap hit rect is now at least 48 CSS px in both axes,
  independent of `R`, while the drawn bud keeps its size. A `Shift` key path
  already existed for desktop and remains.
* **B3** — measured in a real browser and handled: see verification.
* **B4** — placeholders rewritten without dashes.
* **B5** — the Zen HUD now says that leaving banks the run.
* **B6** — the player is told once, plainly, when progress cannot be saved.

## Improvement (where a minute of work buys the most play)

**B2, the swap control.** Budburst's whole skill ceiling is choosing between the
loaded bud and the next one, and the game taught that verb in the How to play
sheet while shipping the control 3.6px under the touch floor at the most common
phone width. Every missed tap on it fires the wrong bud instead, which is not a
neutral failure: it costs a shot from a finite budget and, in Blitz, seconds.
Widening the hit rect is a handful of lines and it fixes the one input in the
game that punishes you for missing it.

## Verification

`test/check.mjs` (node, no browser) parses the script block with `vm` and asserts
the shape validators against 18 malformed values.
`test/play.mjs` (puppeteer, one browser) boots the real page, measures the NEXT
hit rect and the feedback fab against the play surface at 375x667, plays Meadow
level 1 to a result, and then reboots with each malformed save in turn asserting
that the loop still runs and the exit link is still wired. Both were watched RED
first: `check.mjs` against the unfixed validators, `play.mjs` against a
deliberately poisoned `bb.miss`.
