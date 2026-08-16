# GREENHOUSE PINBALL (Blobworks) — audit, 2026-08-16

Read end to end (1458 lines) BEFORE any edit. Findings first, fixes second.
Verification: `node audit.mjs` (headless assertion suite, added by this pass).

---

## THE HEADLINE

This is the deepest of the three by a distance. It has an honest flipper model
(exit vector comes only from blade surface velocity at the contact arm, so
timing maps linearly to angle and shots are learnable), a real shot vocabulary
of standups, drop targets, a scoop, five ramps and orbits, a spinner, rollovers
and return gates, six quests feeding a wizard mode, two multiball paths, a
tilt meter, a kickback and a ball save. The comments show a build that has
already been debugged against real device feedback several times. There is a
`PIN_DEV` hook behind `?gptest=1` with 30+ probes, which is more test surface
than most of the fleet.

And **you cannot leave a game once you start one.** There is no pause, no quit,
no menu button anywhere on the play surface. In Classic that resolves after
three balls. In **Zen it never resolves at all** — drains just re-launch, so a
Zen player is stuck until they reload the page. That is the worst defect in any
of the three games I looked at today, and it is invisible to every automated
check that only asks "does the ball move".

---

## DEFECT LIST (worst first)

### C1 — HIGH — Zen mode is inescapable
`show('s-play')` hides every `.screen`; the canvas is the only surface. `onDown`
routes every touch to a flipper, the plunger or a nudge. There is no pause
button, no quit, and `endRun()` is only reachable from `drainBall` when
`G.ball >= G.maxBall`. Zen sets `maxBall:99` and its drain branch is
`if(G.mode==='zen'){ G.ball++; serveBall(); }`, which never reaches that test.

A Zen player's only exit is the browser back button or a reload.

### C2 — HIGH — a Zen score is only ever saved as a side effect of a Bloom Rush
`PROG.best.zen` is written in exactly one place: inside `triggerBloom()`. So a
Zen run that scores well without filling the growth ribbon records nothing, and
because the run cannot end (C1) the normal `endRun` banking never happens either.
The Zen best on the title screen is not the player's best Zen score, it is their
best score *at the moment they last triggered a Bloom Rush*.

### C3 — HIGH — a hard flip on a slow frame can punch the ball through a wall
`physics()` uses a fixed `SUB=8`, so `h = dt/8` and at the loop's `dt` cap of
0.05 that is 6.25ms per substep. Collision is a static circle-vs-segment test
after the move, so the sampling gap has to stay under the ball radius (11).

- The 3200 speed clamp is applied **after** the position update, so one substep
  always integrates at whatever speed the last collision produced.
- A tip flip produces far more than 3200: blade tip surface speed is
  `FLIP_W_UP * L` = 29 * 82 = 2378 px/s, and with `e = 0.50` an outgoing
  ~3500 px/s is routine. At `dt = 0.05` that is 22px per substep against an 11px
  radius, i.e. the closest sample is 11.1px from the wall and the test misses.
- Even at exactly 3200 the margin is 10px against a radius of 11. One pixel of
  headroom is not a margin.

A tunnelled ball leaves the table, falls under gravity, eventually crosses
`DRAINY` and drains. So it costs a ball rather than hanging, but it reads as the
machine eating your shot for no reason.

### C4 — MEDIUM/HIGH — the "MEGA MASHes" counter counts something else
`G.blooms` is incremented only in `triggerBloom()`, which is **BLOOM RUSH** (the
growth-ribbon frenzy). The game over screen labels that number "MEGA MASHes",
and the Skins screen gates unlocks on it with labels like "5 MEGA MASHes". The
actual MEGA MASH is `startWizard()`, which is called the finale in How to Play
and calls itself **FULL BLOOM** on screen.

So: three names (BLOOM RUSH / FULL BLOOM / MEGA MASH) for two features, and the
counter and unlock text both name the one they do not count.

### C5 — MEDIUM — the Skins screen is not inside the table
`document.body.appendChild(scr)` for `#s-skins`, while every other `.screen`
lives inside `#stage`. `#stage` is a fixed 540x960 box scaled with a CSS
transform to fit the viewport; a `.screen` appended to `body` resolves its
`inset:0` against the viewport instead. So the one screen added later renders at
a different scale from the other four and ignores the letterbox entirely.

### C6 — MEDIUM — two tabs clobber, and `gp_prog` values are not type checked
`saveProg()` writes `PROG` wholesale, so two tabs lose each other's bests and
MEGA MASH count. And the loader does `if(p.best) for(var k in p.best) PROG.best[k] = p.best[k]` with no
type check, so a stored `{"best":{"classic":{}}}` puts an object where a score
should be. It does not crash (`>` against an object is just false) but the title
screen then prints `best [object Object]` and the skin unlocks silently stop
working. `gp_set` and `gp_skins` ARE type checked, which is what makes the gap
in `gp_prog` look like an oversight rather than a decision.

### C7 — LOW — the feedback fab overlaps the right flipper's touch half
The whole right half of the canvas is the right flipper. The fab's footprint at
375x667 lands inside it. A thumb that hits the fab is a flip that never happens.
Not fixable from inside this folder, but worth writing down.

---

## THE EIGHT STANDING CLASSES

1. **Exit gated on framing** — PARTIAL. `SWS_EXIT` already had the referrer
   fallback and `b-exit` calls it, so the affordance is real. But `SWS_EMBED` was
   `?embed=1` in the query string rather than `window.parent !== window`, and
   `{sws:'ready'}` was posted neither on `load` nor at all without the param.
   Replaced with the canonical block. **Also note the exit only exists on the
   TITLE screen** — combined with C1, a player in a game could not reach it.
2. **Feedback fab** — see C7.
3. **Corrupt save** — mostly PASS. `gp_set` and `gp_skins` validate types
   properly. `gp_prog` does not (C6). No poison found that blanks the page.
4. **Two tabs clobber** — FAIL, see C6.
5. **Silent failure** — PASS on the sunbeam path (`_sbCapEarn` returns the
   credited amount and the results screen shows that, not the requested amount)
   and PASS on art (`PIN_ART.ready()` checks `naturalWidth`, and every `<img>` in
   the Skins grid and the results emoji carries an `onerror`). FAIL on C2, which
   is a save that silently does not happen.
6. **Touch targets** — PASS. Buttons floor at 72px CSS inside a stage that scales
   by 0.694 at 375x667, so about 50 rendered px. Verified.
7. **Dashes in player copy** — PASS. Every dash in the file is in a comment.
8. **Overlay covering a control** — the Skins screen escaping the stage (C5) and
   the fab over the flipper half (C7).

---

## PHYSICS AT EXTREMES

- **Tunnelling**: FAIL before this pass (C3). After: substep count is derived
  from the fastest live ball, and speed is clamped before the position update, so
  no substep can ever move more than 0.6 of a ball radius.
- **Permanently stuck ball**: handled well already. `physics()` has an explicit
  anti-stuck pass with two thresholds (0.6s in the upper field, 1.3s in the
  flipper zone and only when both flippers are down, so a deliberate cradle is
  never disturbed). Verified with 400 randomly-placed balls: none sat still for
  longer than the threshold, and every one reached a drain or a flipper.
- **A pocket that traps forever**: none found. The scoop holds by design and has
  a timed eject; rails are tweens with a bounded duration; the lock nest splices
  the ball out deliberately.
- **Ball-to-ball**: already correct (equal-mass normal exchange, run once per
  substep after integration, skipping held beads) and already has its own probe.

## CORE LOOP AND FIRST THIRTY SECONDS

Title → Play → hold to charge the plunger → release. A monster lights as you
launch and hitting it first pays a skill shot, which is a good first-ten-seconds
hook. The goo net catches your first drain so the opening cannot feel cheap.
How to Play is 11 numbered rows, which is a lot, but pinball earns that.

The opening is genuinely strong. The exit is the problem, not the entrance.

---

## FIXES APPLIED

1. **C1** A pause control now sits on the play surface (top-left, well clear of
   both flipper halves and the bottom-right fab gutter), plus the Escape and P
   keys. Pause offers Resume, End game and Menu, so every mode including Zen has
   a way out. Touching the pause button never reaches a flipper and never feeds
   the tilt meter.
2. **C2** Ending a Zen game banks it through the same `endRun()` path as Classic
   and Daily, so the Zen best is the Zen best. The old Bloom-Rush side write is
   kept as a mid-run safety net for a player who closes the tab.
3. **C3** Substeps are now derived from the fastest live ball
   (`ceil(vmax * dt / (BALLR * 0.6))`, floor 8), and the speed clamp moved above
   the position update. A 3500 px/s tip flip on a 20fps frame now takes 30
   substeps instead of 8.
4. **C4** The counter counts and says the same thing. `G.blooms` is Bloom Rushes
   and is labelled Bloom Rushes; a separate `G.mega` counts MEGA MASH (the
   wizard). The Skins screen keeps gating on Bloom Rushes, since that is what its
   numbers were tuned against, and now says so.
5. **C5** `#s-skins` is appended into `#stage`, so it letterboxes and scales like
   every other screen.
6. **C6** `gp_prog` is type validated on load, and `saveProg` merges against disk
   (bests MAX, MEGA MASH count ADDs its delta).
7. **Standing class 1** Canonical embed block, framed detection off
   `window.parent`, `{sws:'ready'}` at parse and on load.

## WHAT STILL WORRIES ME

- **Scoring inflation.** A quest pays 250k to 750k, a super jackpot is
  1,000,000 x mbLevel, and FULL BLOOM completion is a flat 3,000,000, while a
  bumper is 120. That is a five order of magnitude spread, so once a player
  reaches the wizard nothing they did before it registers at all. It is a real
  pinball convention, but this table's ordinary shots are worth so little by
  comparison that the middle of the game has no scoring texture.
- **Eleven rows of How to Play** is where a tutorial should be. The game has
  enough lit-insert vocabulary to teach itself one mechanic at a time.
- **The right flipper half versus the fab** (C7) is unfixable from in here and
  will cost real flips on a phone.
