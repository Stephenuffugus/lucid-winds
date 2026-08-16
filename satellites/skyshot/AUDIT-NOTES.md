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

* **S1** — `readProg()` validates every field: each map must be a plain object
  of small non-negative numbers, `pollen`/`plays` must be finite numbers, and a
  bad save is repaired in storage on load so it cannot bite twice. `finish()` is
  additionally called through `safeFinish()`, which guarantees the result screen
  goes up even if something downstream of it throws, because the loop has
  already stopped rescheduling itself by then.
* **S2** — `saveProg()` merges against storage at write time: stars and daily
  MAX per key, moments union, pollen and plays take the larger total. The
  "Clear saved progress" button deliberately bypasses the merge, because a wipe
  that merges is not a wipe.
* **S3** — pollen now means something. A plot pays only what it improves on
  (`PROG.best[plot]`), so re-clearing a cleared plot no longer re-pays the lot,
  and the result screen says so plainly when it does not pay.
* **S4** — see the improvement below.
* **S5** — `framed` is measured, ready is posted at parse time and on `load`.
* **S6** — `/feedback.js` fab mounted.
* **S7** — the daily card now reads "a fresh plot every day".
* **S8** — the solver is finally run. All 24 plots and 40 generated dailies come
  back fully reachable, in a real browser, on every test run.
* **NEW, found by the test, not by reading** — the fab covered the right edge of
  Settings, All Sky Wolf games and Try again. The button stack was 420 stage px
  in a 540 stage, reaching to x 480, and the fab sits hard right at x 453..523.
  Stacks, setting rows and the hand-styled full width buttons narrowed to 356.
  The browser suite walks all six screens and fails if any control intersects
  the fab.

## Improvement (where a minute of work buys the most per minute of play)

**A loss screen that teaches.** Skyshot's entire difficulty curve is timing
against a moving gate, and the moment a player runs out of seeds is the only
moment they are guaranteed to be reading the screen. It said "Out of seeds" and
nothing else, so a beginner on plot 9 just fired the same shot again. It now
names the thing that is actually in the way, chosen from the plot's OWN data so
it can never describe a level that is not on screen: the shutter beat, the
bramble's two openings per turn, the sweeping stone, the walker's lead, the
pendulum's pause at the top. Everything else in this pass is a bug fix; this is
the change that stops plot 9 being where people quit.

## Still worries me

* Pollen still has no sink. It is now an honest lifetime record rather than a
  fake wallet, but `Wallet.spend` remains dead code waiting for a shop.
* The daily volley is replayable without limit. Stars MAX and the earn moment
  fires once, so nothing is exploitable, but there is no reason a player would
  guess that replaying is allowed.
* The solver sweeps a fixed grid of 17 angles x 9 powers x 5 launch times. It
  proves every bud is reachable by SOME shot; it does not prove par is
  achievable. That is a stronger claim and nobody has made it yet.

## Verification

```
node satellites/skyshot/test/check.mjs      # node only, 26 assertions
node satellites/skyshot/test/play.mjs       # one headless browser, 57 assertions
```

`check.mjs` parses every inline block with `vm`, lifts `_plain`, `_numMap` and
`_num` out of `index.html` by name and runs the real `readProg` shape against 16
malformed saves. It self tests every run against do-nothing validators and exits
2 if those pass.

`play.mjs` serves the repo itself and, in one headless browser: runs the shipped
solver over all 24 plots and 40 generated dailies, proves the solver can say NO
by handing it a deliberately unreachable bud, clears plot 1 end to end and
checks the star was written, replays that clear under eight malformed saves,
simulates a second tab writing over the top and checks nothing is lost, plays
plot 9 to a loss and checks the coaching line names the bramble, then walks
every screen measuring the fab against every control by `elementFromPoint` at
the control's own centre (never `el.click()`).

Both were watched RED first. `check.mjs` fails against the unfixed loader.
`play.mjs` against the pre-audit `index.html` reported `screen s-play` after a
win with `Cannot create property 'level_clear:0' on number '1'`, and its fab
section found two real screens with covered controls on the first green run of
everything else.
