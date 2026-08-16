# PONG ARENA — audit, 2026-08-16

Read end to end (1597 lines) BEFORE any edit. Findings first, fixes second.
Verification: `node audit.mjs` (headless assertion suite, added by this pass).

Pong is a classic remake, so the mechanics are settled. The questions that matter
here are: is the first thirty seconds good, is the AI difficulty real, and is
anything about it worse than the Pong everyone already has in their head.

---

## THE HEADLINE

The engine is genuinely good. One physics core (swept circle vs segment list)
drives six arenas, the substepping is speed-adaptive so nothing tunnels, and the
AI is honest: it is limited by paddle SPEED as a fraction of ball speed, it
predicts with a difficulty-scaled error, and it never teleports. That is better
than most Pong remakes.

What is worse than the Pong in your head is **the dead air**. Every single point
costs 3.0 seconds of nothing: 0.9s of "scored" freeze, then a full 3-2-1
countdown. A first-to-7 match spends over 40 seconds with no ball on the table.
Original Pong resumes in about a second. That is the biggest single fix in the
file and it is worth more per minute of play than anything else here.

---

## DEFECT LIST (worst first)

### A1 — HIGH — rotating the phone breaks the match, permanently
`rebuildArena()` (l.1317) clears `walls`, `obstacles` and `paddles` but NOT
`bumpers` and NOT `movers`. `cfg.build()` then pushes a fresh set. So every
resize in Gauntlet adds two more bumpers and another moving block, and
`allSegs()` concatenates every mover, so the field fills with stacked invisible
colliders.

Worse: the ball is not clamped into the new bounds. Rotate portrait to landscape
and H shrinks from ~700 to ~390 while the ball sits at y=600. It is now BELOW the
bottom wall. Classic's `score()` only tests x, so the ball never scores; it just
falls away forever. The trap-breaker escalates its speed, which makes it leave
faster. **The match hangs with no way out except the pause menu.**

The menu copy explicitly tells the player to do this: "rotate your phone for the
full-length court".

### A2 — HIGH — corrupt save is a blank page, not a bad save
`load()` (l.331) only checks `r && r.cur`. Anything that parses and has a truthy
`cur` is accepted, then `deepDefault` walks it. Under `"use strict"`, assigning a
property to a primitive THROWS. So:

- `{"cur":1,"opt":5}` → `deepDefault(5,{...})` assigns to a Number → **TypeError
  at load time, the whole IIFE dies, the page is blank and stays blank.**
- `{"cur":"x"}` → survives load, then `S.cur[c]=...` in `Economy.earn` throws
  inside the scoring path → the game freezes on the first point.

A try/catch around `JSON.parse` is not validation. Verified in the suite.

### A3 — HIGH — the magnet power-up can lock the ball forever
`onPaddleHit` sets `b.stuck=pad` when the magnet is active. `substep()` returns
immediately for a stuck ball, so the trap-breaker at l.562 (which escalates ball
speed after 5s without a paddle touch) cannot resolve it — it never runs on a
ball it cannot move. Release only happens in `onDown`, i.e. a fresh
touchstart/mousedown. A player already holding a drag, or one who simply stops
touching, sits there forever with no prompt telling them what to do.

### A4 — HIGH — ✦ Sparks are earnable and unspendable
`Economy.earn('spark',1,'rally')` fires every 4th rally hit. Nothing in the shop
costs sparks: `PRICE` maps common/rare to rally, epic/legend to gem, mythic to
trophy. The menu says "Currency is earned by playing and only spends here."
That sentence is false for one of the four currencies on the wallet row.

Related and nearly as bad: gems pay 2 per win, and epic skins cost 70-110 gems.
That is 35-55 match wins for one epic. Legendaries are 90+ wins. Two of the six
shop tabs are decoration.

### A5 — MEDIUM/HIGH — the campaign's own ending is a lie
Clear level 12 and `resExtra` says "You cleared The Gauntlet! Endless mode
continues." There is no endless mode. "Next" replays level 12 forever.

### A6 — MEDIUM — the serve hint promises an action that does not exist
`#serveHint` reads "Drag to move your paddle. Drag to serve." There is no serve
input anywhere; `state` goes `count` → `play` on a timer. The `'serve'` state is
declared and never assigned.

### A7 — MEDIUM — three seconds of dead air between every point
`doScore` → `state='scored'` for 0.9s → `serveBall()` → `count=3` at 0.7s a step
= 2.1s. Every point. See THE HEADLINE.

### A8 — MEDIUM — two tabs clobber
`save()` serialises the whole `S` on a 250ms timer. Two tabs open, and whichever
saves last erases the other's currency, campaign progress and skin purchases.
Counters must ADD, bests must MAX, owned sets must union.

### A9 — MEDIUM — touch targets under 48px at 375x667
- `.icob` (the in-game PAUSE button) is 44x44.
- `.stab` (shop category tabs) is min-height 40.
- `.skin .buy` is min-height 44.
- `.switch` (the settings toggles, and the switch IS the click target, not the
  row) is 52x30.

### A10 — LOW — "Auto" handedness is not auto
`playerSide()` returns 'left' for both 'auto' and 'left'. The label promises a
behaviour that is just a synonym.

### A11 — LOW — dead code
`predictLinear()` defined, never called. `pausedFrom` declared, never used.
`DEF_SAVE.daily` never read or written.

### A12 — LOW — the gnome-bar equivalent: EA of the difficulty ladder
Verified honest (see below), but Expert is only beatable through the
sudden-death speed escalation, which is undocumented in How to Play.

---

## THE EIGHT STANDING CLASSES

1. **Exit gated on framing** — PARTIAL FAIL. The menu does have an "All Games"
   button that calls `SWS_EXIT`, so something calls it (good). But the bridge
   block gates on `?embed=1` only, has no `document.referrer` fallback, and posts
   `{sws:'ready'}` neither on `load` nor when the query param is absent. Framed
   without `embed=1` it would load the portal INSIDE the frame. Replaced with the
   canonical block from `incoming/PORTAL-CONTRACT.md`.
2. **Feedback fab** — the whole screen is canvas. Measured: with handedness set
   to "Right", the player's paddle lane at x≈343-354 sits inside the fab's
   footprint (x≈W-90..W-12). Input is drag-anywhere and only the axis component
   matters, so you never NEED to touch there, but a touch that starts on the fab
   is eaten mid-rally. Default is Left, which is clear. Noted, not fixable from
   inside the game.
3. **Corrupt save** — FAIL, see A2.
4. **Two tabs clobber** — FAIL, see A8.
5. **Silent failure** — the sunbeam bridge `_sbCapEarn` returns nothing, so the
   game cannot show what was actually credited. Pong never displays a sunbeam
   number, so nothing is being claimed falsely. PASS by omission.
6. **Touch targets** — FAIL, see A9.
7. **Dashes in player copy** — PASS. Every em dash in the file is in a comment.
8. **Overlay covering a control** — the toast (bottom centre, 88vw) overlaps the
   fab horizontally but sits ~40px lower, so no vertical collision. PASS.

---

## PHYSICS AT EXTREMES

- **Tunnelling**: `substep` count is `ceil(speed*dt/(r*0.6))`, so no substep ever
  moves more than 0.6r while the collision test radius is r. Coverage is
  continuous at any speed, including the trap-breaker's `maxSpeed*6`. **Clean.**
- **Permanent stalls**: two found. The magnet lock (A3) and the rotate-out-of-
  bounds ball (A1). The designed trap-breaker (5s with no paddle contact, or 16s
  on one point) handles genuine bumper-pocket traps correctly.
- **Parallel skimming**: `enforceMinAngle` forces at least 0.30 of the speed into
  the wall normal after every contact. Correct.

---

## IS THE AI REAL?

Real. `DIFF` moves five honest levers — paddle speed as a fraction of ball speed
(`padFrac`), reaction staleness (`reactMs`), aim error (`errPx`), corner
placement (`place`), and how much of the target uses true multi-bounce prediction
versus naive current-position tracking (`pred`). Ball speed barely moves across
the ladder (0.95x to 1.06x), which is the right call — a faster ball reads as
chaos, not skill.

There is stateless rubber-banding: the AI's aim error widens when it leads by 2+
and tightens when it trails by 2+, and tightens as a rally lengthens. That is
defensible but it is a thumb on the scale and it is not disclosed anywhere.

Measured in the suite: Rookie through Legend produce a strictly increasing
"clean returns before a miss" figure against a scripted perfect player, so the
ladder is monotonic and not decorative.

---

## FIRST THIRTY SECONDS

Menu → Career → Level 1 "First Serve" (easy, first to 5) → 3-2-1 → play. That is
three taps and a good opening rung. The failure is A7: a third of the first
thirty seconds is a countdown.

---

## FIXES APPLIED

1. **A1** `rebuildArena` now clears bumpers, movers, powerups, obstacles and
   shields, resets paddle scale, and clamps every live ball back inside the new
   field with a re-aimed velocity. Rotating mid-match no longer stacks colliders
   or strands the ball.
2. **A2** `load()` validates shape and type: every branch of the save must be the
   same kind of thing the default is, numbers must be finite, and anything that
   fails falls back to the default for that branch alone. A hostile save can no
   longer blank the page.
3. **A3** A magnet-held ball auto-releases after 1.1s, and the serve hint tells
   you to tap to fire while it is held.
4. **A4** Retiered the shop so every currency has a sink: rare skins now cost
   ✦ Sparks (they come from rallies, which is what earns them), and gem income
   went from 2/4 per win to 5/9 so the epic tier is reachable in a session
   rather than a month.
5. **A5** Rewrote the campaign-complete copy to say what is true, and the button
   now reads "Play again" on a cleared ladder.
6. **A6** Serve hint rewritten to describe the controls that exist.
7. **A7** The full 3-2-1 now happens once per MATCH. Points after the first
   resume on a single beat (0.55s freeze + a one-count "GO"). Match time between
   points drops from 3.0s to 1.1s, which is about 23 seconds given back per
   first-to-7 game.
8. **A8** `save()` now merges against whatever is on disk at write time: counters
   add their delta, bests take the max, owned unions, and the last equip wins.
9. **A9** `.icob` 44→48, `.stab` 40→48, `.skin .buy` 44→48, and the settings
   switches gained an invisible 9px hit-slop so the pill stays slim.
10. **A10** "Auto" now genuinely follows handedness where the platform can tell
    us, and reads "Left (default)" where it cannot, instead of pretending.
11. **A11** Dead code removed.
12. **Standing class 1** Canonical embed block, referrer fallback, ready posted
    at parse and on load.

## WHAT STILL WORRIES ME

- The shop is 700+ procedurally-named skins across six tabs. Even after the
  economy fix, the great majority will never be bought by anyone. Volume is not
  content; a curated 60 would read better than 700 "Quantum Plank".
- The AI's rubber-banding is invisible to the player. If the Director wants the
  ladder to be a pure skill statement it should come out; if it stays it should
  be said out loud in How to Play.
- Radial (Orbit) is the weakest arena. The goal arcs are wide, the paddle covers
  most of its own arc, and points come from the ball squeezing an edge rather
  than from a read. It is the one mode I would cut or rebuild.
