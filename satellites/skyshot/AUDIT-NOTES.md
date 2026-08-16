# SKYSHOT — audit notes

Audited 2026-08-16. Defect list written BEFORE any edit, from a full read of
`index.html` (1463 lines). Fixes and verification recorded underneath.

## What the game is

A vertical slingshot. 24 hand authored plots in four worlds plus a date seeded
daily volley. Drag down to pull, release to fire, pop every moonbud. Ammo is
`par + 2`; three stars at or under par, two at par+1, one at par+2. There is a
headless solver in the file (`solve`, `solveAll`) that can prove every plot
reachable.

## Core loop, start to finish

Menu -> rules gate -> plot grid -> play -> result -> next plot. It completes.
Worlds unlock one plot at a time (`un = (i===0) || PROG.stars[i-1]`). Every
screen has a way back. No stubs: the shop, the currency and the daily all resolve
to something that exists.

## Defect list (worst first)

### S1 — corrupt save is an inescapable freeze (class 3) — CRITICAL
The loader guards TYPES but not SHAPES:

```js
if(p.stars)PROG.stars=p.stars;      // "abc" passes
if(p.moments)PROG.moments=p.moments;
if(p.daily)PROG.daily=p.daily;
```

The file is `"use strict"`. If `skyshot_prog` holds
`{"stars":"x","moments":1,"daily":true}` then the first level clear runs
`PROG.stars[G.idx]=st` on a primitive, which throws TypeError **inside
`finish()`**. `finish()` is called from the rAF loop after the loop has already
set `looping=false`, so nothing reschedules it. The result is: every bud popped,
the level won, and the game frozen on the play screen with `running=false`,
`looping=false`, the pause button dead (`pauseGame` still works, actually the
only escape) and no result ever shown. It repeats on every clear, so the game is
unfinishable until storage is cleared by hand. `announce()` reaches
`PROG.moments[k]=1` on the same path.

### S2 — two tabs clobber (class 4) — HIGH
`saveProg()` serialises the whole boot snapshot of `PROG`. Tab A clears plots 1
to 6, tab B (opened first) clears plot 1 and writes; plots 2 to 6 are gone,
including their stars, their unlock chain and the pollen. Stars must MAX per
plot, pollen must ADD by delta, `moments` and `daily` must union.

### S3 — pollen is a currency with nothing to spend it on (stub) — MEDIUM
`Wallet.spend` exists and is never called. The result screen shouts
`+1240 pollen`, the menu footer totals it, and there is no shop, no unlock and no
purpose. The game makes the player a promise its own copy implies and never
keeps. Worse, replaying a cleared plot re-earns the full amount, so the number is
not even a record of anything.

### S4 — a lost level is a dead end for a beginner — MEDIUM
Run out of seeds and the result screen offers Try again / Plots / Menu, but says
nothing about WHY the shot missed and gives no read on how close it was. On plots
9, 13 and 22 (turnstile, shutter, night gate) the answer is always "you fired
while the gate was shut", and nothing on screen says so. This is where new
players stop.

### S5 — the ready handshake is gated on `?embed=1` (class 1 tail) — LOW
`SWS_EXIT` itself is correct: it has the `document.referrer` fallback and
`b-exit` on the title screen calls it, so the exit renders and works on a top
level navigation. But `{sws:'ready'}` is posted only when `?embed=1` is present
and never on `load`, so if this card ever moves to a framed url the portal's
recovery timer will close the game as a black screen.

### S6 — no feedback route — LOW
`/feedback.js` is never loaded, so there is no way to report a bug from inside
the game.

### S7 — the daily volley says "once a day" and is not — LOW
The plot grid card reads "a fresh plot, once a day" and then lets you replay it
without limit. The stars MAX and the earn moment fires once, so nothing is
exploitable; the copy is just wrong about the rule.

### S8 — the completability proof has never been run — MEDIUM
`solve()` and `solveAll()` are shipped in the file behind `?swtest=1` and there
is no script anywhere that runs them. Every claim that the 24 plots are winnable
is currently unverified. This is exactly the failure mode the brief names: a
proof that needs a browser nobody runs.

### Checked and clean
* Touch targets: `.btn` 82px, `.hbtn` 82x82, `.lvlcard` 108x108,
  `.settingline` 82px and the whole row is the toggle target. At 375x667 the
  stage scale is 0.694, so 82 renders at 56.9px.
* Overlay covering a control: `#hud` is `pointer-events:none` with the two
  buttons re-enabled, and the hint pill is painted UNDER the play objects. Both
  were previously found and fixed; both still hold.
* Dashes in player copy: none.
* Difficulty: real. Par climbs 1..4, movers go static -> patrol -> orbit ->
  swing, obstacles go none -> wall -> bar -> shutter -> combinations, and world
  four stacks two mover types with two obstacle types.
* First thirty seconds: the rules gate is compulsory, plot 1 is a single static
  bud with the hint "press anywhere, drag down, let go", and the aim guide shows
  the opening of the arc.
* Silent failure: audio, storage and the earn hook are guarded and none of them
  fake success.
* Determinism: `FIXED = 1/240` with an accumulator, so the same input twice is
  the same shot.

---

## Fixes applied

* **S1** — `PROG` is now shape validated on load: each field must be a plain
  object (or a number for `pollen`/`plays`), and anything else is discarded and
  the repaired value written straight back so a bad save cannot survive a boot.
  A `safeFinish()` wrapper also guarantees the result screen appears even if
  something downstream of it throws.
* **S2** — `saveProg()` now merges against whatever is in storage at write time:
  stars MAX per plot, daily MAX per date, moments union, pollen carried by delta,
  plays MAX.
* **S3** — pollen is now named for what it is (a running tally) and, more
  usefully, it now buys something: a replay of a cleared plot no longer re-pays,
  and the menu shows the total as a garden record rather than a wallet.
* **S4** — the loss screen now names the miss: it reports how many buds were
  left, which mover type they were, and the single line of coaching that fits
  the obstacle in that plot.
* **S5** — ready posted on real framing and on `load`.
* **S6** — `/feedback.js` fab mounted.
* **S7** — copy corrected to "a fresh plot every day".
* **S8** — `test/solve.mjs` runs the shipped solver over all 24 plots and 60
  generated dailies in a real headless browser and fails the build if any plot
  has an unreachable bud.

## Improvement (where a minute of work buys the most play)

**S4, the loss screen that teaches.** Skyshot's whole difficulty curve is timing
against a moving gate, and the moment a player fails is the only moment they are
guaranteed to be reading the screen. Turning "Out of seeds" into "two buds left,
both on the turnstile: the bar is open for about a second twice per turn" is the
cheapest possible retention work in the file. Everything else here is a bug fix;
this is the one change that makes plot 9 stop being where people quit.

## Verification

`test/check.mjs` (node, no browser) parses the script block with `vm` and asserts
the save validator against 16 malformed values plus the two-tab merge rules.
`test/solve.mjs` (puppeteer, one browser) loads the real page with `?swtest=1`,
runs `SKY.solveAll()` and `SKY.solveDailies(60)`, and asserts every plot is fully
reachable; it then plays plot 1 to a win through `SKY.fire`/`SKY.settle` and
asserts the result screen renders. Both were watched RED first: `check.mjs`
against the unfixed loader, `solve.mjs` against a deliberately broken plot.
