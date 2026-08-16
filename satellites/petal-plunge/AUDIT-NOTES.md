# PETAL PLUNGE — audit, 2026-08-16

Read end to end (1596 lines) BEFORE any edit. Findings first, fixes second.
Verification: `node audit.mjs` (headless assertion suite, added by this pass).

---

## THE HEADLINE

The core is honest and the hard part is already right. The safe-lane generator
really does guarantee a passable slope (bounded lane slope, obstacles excluded
from the corridor, pinches that squeeze width but never the slope), and the
Gnome is a real chase, not a scripted scare: it runs at a fixed fraction of your
clean straight-line speed, so carving costs you ground and tucking buys it back,
with a hard rubber-band ceiling. That is a good, legible pursuit rule.

Two things undercut it. **Style points are a tap race** with no cap or cooldown
on tricks, which makes the Freestyle star rating meaningless. And **a corrupt
save is a blank page**, not a bad save.

---

## DEFECT LIST (worst first)

### B1 — HIGH — a save that parses but is the wrong SHAPE blanks the page
`loadProfile()` merges the raw blob into a clone of the default. `merge()`
overwrites wholesale whenever the incoming value is not a plain object:

```js
} else { base[k] = ext[k]; }
```

So `{"records":null}` sets `P.records = null`, and the very next line of boot is
`buildTitle()` → `P.records.free` → TypeError inside the IIFE. Blank page,
forever, with no way for the player to recover.

The same shape applies to `owned` (crashes on opening the Shop), `ms` (crashes
mid-run in `achieve`), `equip` (crashes on the first frame that draws the rider),
`stats` (crashes on Play), and `set` (silently disables sound with no error).
Verified: 6 of 7 poisons kill the old loader.

### B2 — HIGH — tricks have no cooldown, so style is a tap race
`doTrick()` increments `S.trickCount` on every pointerdown while airborne, with
no cap and no minimum interval. Landing pays
`60 * airDur * (1 + 0.6*trickCount) * (1 + 0.08*combo)`, so a player mashing the
screen during a one-second jump can bank 800+ where a player doing a clean
double banks ~190.

Consequences: the Freestyle star gates (1300 / 2600) are unreachable by playing
and trivial by mashing, `m:style5k` ("Bank 5000 style in a run") unlocks the
legendary Stardust trail for whoever taps fastest, and the Petal payout
(`style/12`) is farmable.

### B3 — MEDIUM/HIGH — "Reduced motion" is a switch wired to nothing
`P.set.reduced` is written by the settings toggle, saved, and read by exactly
one place: the settings screen that draws the toggle. Nothing in the renderer,
the particle system or the camera consults it. A player who needs it turns it on
and gets the same screen. That is standing class 5 (something plausible shown
while the real thing never happened) on an accessibility control, which is the
worst place to have it.

### B4 — MEDIUM — two tabs clobber
`saveProfile()` writes the whole `P` from a boot snapshot. Two tabs and the last
writer erases the other's Petals, records, milestones and cosmetics.

### B5 — MEDIUM — the Gnome meter lies at the top of its range
`updateHud` fills the bar with `gnomeGap / CFG.gnomeGapStart` (640) clamped to 1,
but the gap can be up to `gnomeGapMax` (940). So for the whole top third of the
real range the bar reads a flat 100% and an escape appears to do nothing. The one
piece of chase feedback the player has is dead over a third of its travel.

### B6 — MEDIUM — the feedback fab sits on the RIGHT steering zone
The entire control scheme is screen thirds: left third carves left, right third
carves right, middle tucks. `#ctlrow` is `pointer-events:none` (correct, it is
just an affordance), so the canvas gets the touches, but the fleet feedback fab
is a real element in the bottom-right at z-index 2147482000. A thumb that lands
on it is a carve that never happens, and in the worst case opens a form
mid-descent. Nothing in this repo folder can move the fab, so the fix here is to
keep the game's own right-hand affordance out from under it and to say so.

### B7 — LOW — em dashes are used as the "no value yet" placeholder
`fmtTime(0)` returns `"—"` and the Daily screen prints `"—"` for an unplayed day.
Hard studio rule, and here it is also just less clear than words.

### B8 — LOW — the mode `gate` tunable is saturated
`if(S.rng() < mc.gate*SEG)` with `SEG=44`: Slalom's `gate:0.055` gives 2.42, so
the test is always true and every 44 units gets a gate. Any value at or above
1/44 behaves identically, so the knob does nothing across most of its range.

### B9 — LOW — the escape multiplier's label overstates it
`ESCAPED! x2.0` implies a score multiplier, but `S.scoreMult` only multiplies the
Petal payout at bank time. The headline number on the results screen (depth) is
never multiplied.

---

## THE EIGHT STANDING CLASSES

1. **Exit gated on framing** — PARTIAL. `SWS_EXIT` already has the
   `document.referrer` fallback (good, and `#exitLink` calls it, so something
   really does call it). But `SWS_EMBED` is `?embed=1` only, not
   `window.parent !== window`, and `{sws:'ready'}` is posted neither on `load`
   nor at all without the query param. Framed without the param, exit would load
   the portal INSIDE the frame. Replaced with the canonical block.
2. **Feedback fab** — FAIL, see B6.
3. **Corrupt save** — FAIL, see B1.
4. **Two tabs clobber** — FAIL, see B4.
5. **Silent failure** — FAIL on the Reduced motion toggle (B3). PASS on the
   sunbeam path, which is done correctly: `_sbCapEarn` returns the amount
   actually credited after the 30/day cap and the results screen shows that
   number rather than the requested one.
6. **Touch targets** — PASS. The CSS floors buttons at 52px, `.btn.sm` and
   `.tab` at 48, and the settings switches already carry a 9px `::before`
   hit-slop. Verified rendered at 375x667.
7. **Dashes in player copy** — FAIL, see B7.
8. **Overlay covering a control** — the fab over the right-carve zone, B6.

---

## CORE LOOP, START TO FINISH

Title → Plunge → (first time) tutorial → mode select → run → results → Again /
Shop / Modes. No stubs, no dead ends. Quit and Restart both call `bankRun()`
first so an in-progress endless run is never silently forfeited, which is a
detail a lot of games in this fleet get wrong.

Every screen has a way back. Pause is reachable from a real 48px button and
offers Resume, Restart and Quit. Reload mid-run loses the run, which is correct
for a score attack.

## IS THE DIFFICULTY REAL?

Yes, on three independent axes and all three are honest:

- **Speed** ramps with depth (`1 + depth/3800`, capped at 2.6x) and by biome.
- **Density** rises with depth, and the corridor NARROWS (a gradual taper plus
  random pinch stretches at 62% width).
- **The lane weaves harder**: the retarget cadence quickens from every 4
  segments to every 2 past depth 2600, so straight-lining stops working. The
  slope bound stays at 0.22 so the lane is always followable.

The Gnome is the fourth axis and it is the best one, because it punishes the
thing the slope rewards (carving) rather than adding noise.

## DOES THE FIRST THIRTY SECONDS TEACH THE GAME?

Yes, and better than most. There is a real tutorial gated on first play, the
on-screen `LEFT / TUCK / RIGHT` bar lights with the active zone (added after
Stephen could not find the screen halves), and a control hint fades in for the
first four seconds of every run. The Gnome does not wake until 3200 depth, so
the opening is pure movement practice.

## PHYSICS AT EXTREMES

Not a rigid-body game, so there is no tunnelling class here: collision is a
radius test against a pruned list and the player cannot leave the slope
(`S.x` is hard-clamped to `halfW()`). Verified in the suite:

- **The safe-lane guarantee holds.** A bot that simply follows the recorded lane
  centre completes 8000 depth on 8 different seeds in all four modes with zero
  crashes. That claim in the source comment is now a test, not a comment.
- **No permanent stall**: depth is strictly increasing because `S.vy` has a floor
  of `0.6 * spd` even at full carve, so a run always terminates.

---

## FIXES APPLIED

1. **B1** `loadProfile` now validates every branch by type and shape, and falls
   back per branch rather than per save. Seven poisons that killed the old loader
   all boot and play now.
2. **B2** Tricks need 0.16s of air between them and are capped by airtime
   (`floor(airDur / 0.16)`), so a one-second jump is worth at most six. Mashing
   now buys nothing over a clean rhythm, which makes the Freestyle stars and the
   Stardust unlock mean what they say.
3. **B3** Reduced motion is now wired: it drops the trail spray and screen
   particles, halves the floater drift, and cuts the crash tumble. It also
   auto-enables from `prefers-reduced-motion` the first time, so a player who has
   already told their OS does not have to tell us as well.
4. **B4** `saveProfile` merges against disk: coins and stat counters ADD their
   delta, records and daily best MAX, owned and milestones union, last equip and
   last setting win.
5. **B5** The Gnome bar is now scaled to the real ceiling, so an escape visibly
   refills it.
6. **B6** The right-hand affordance is inset above the fab's footprint and the
   hint line no longer sits under it. Documented rather than pretended away.
7. **B7** Placeholders are words now, not an em dash.
8. **B8** `gate` is a per-segment probability again rather than a saturated one,
   and the four modes were re-fitted so the knob has range.
9. **B9** The escape callout says what it pays.
10. **Standing class 1** Canonical embed block, framed detection off
    `window.parent`, `{sws:'ready'}` at parse and on load.

## WHAT STILL WORRIES ME

- The feedback fab over the right-carve zone is a genuine control collision that
  I cannot fix from inside this folder. If the fab cannot move, this game wants
  a setting to swap carve to the left third and the tuck to the right, or the
  fab needs a per-game "keep out" rect.
- Slalom's penalty is `+1.5s` per missed gate against a course that throws a gate
  every 44 units. Missing six gates is a nine second penalty on a run that takes
  about twenty. That is a very steep slope, and the star gates (under 20s for
  three stars) assume near-perfect gate collection. It is beatable but it is the
  least forgiving mode by a distance.
- All four modes share one slope generator with different constants. Freestyle in
  particular reads as "Free Plunge with more ramps" rather than a park.

---

# CONTINUATION PASS — 2026-08-16, second agent

## THE CLAIMED FIXES, RE-VERIFIED

| Claim | Verdict |
|---|---|
| B1 corrupt save | CONFIRMED. 6 of 10 poisons kill the old loader, all 10 survive the new one, and the Shop renders with a null `owned`. |
| B2 trick cooldown | CONFIRMED IN CODE (`TRICK_GAP` 0.16s plus an airtime cap) but the CHECK was wrong, see below. |
| B3 reduced motion | CONFIRMED. Peak particles 0 reduced vs 18 normal. |
| B4 two tabs merge | CONFIRMED. |
| B5 Gnome bar scaled to the ceiling | CONFIRMED at index.html:1204 (`gnomeGapMax`). The one remaining `gnomeGapStart` reference at :1141 is the Gnome's angry face and the red vignette, which is a different thing and correct. |
| B6 right affordance out of the fab gutter | CONFIRMED by measurement and by eye. |
| B7 word placeholders | CONFIRMED. |
| B8 gate probability | CONFIRMED. |
| B9 escape callout | CONFIRMED. |

## WHAT THE FIRST PASS LEFT BROKEN — two checks measuring the wrong thing

1. **`style is not a tap race` was comparing two different slopes.** Each run
   called `startRun` fresh, so the clean run and the mashed run got different
   random courses with different numbers of ramps. It reported "mashed beats
   clean 6.06x" over two jumps, which was mostly course, not input.
   FIX: `startRun(mode, seed)` now takes an optional seed (game side, one small
   addition, no player-visible change) and the check runs four SHARED seeds and
   asserts both runs saw the same course. Result: **1.24x over 13 jumps** with a
   clean rhythm on the beat, which is the cooldown working.
2. **`the Gnome is a real chase` was measuring a clamp.** It watched the gap for
   10 seconds, and the gap has a hard ceiling at `gnomeGapMax`, so straight and
   tucking both pinned at exactly +300 and the check concluded tucking does
   nothing. FIX: start the probe at half the wake gap, measure 3.3s, and FAIL the
   check outright if the gap ever touches the ceiling during the window. Result:
   **carving -200, straight +76, tucking +300.** The chase is real.

## SELFTESTS THAT DID NOT BITE

Three of twelve breaks were decoration, all for the same reason: their `run()`
starts with `page.reload()`, which throws the injected mutation away. The
harness already had a `reloads: true` flag for exactly this and the checks did
not carry it.

- **`the safe-lane guarantee is real`** was the bad one. Broken, the generator
  produced 457 obstacles instead of 11754 and the loop measured NOTHING, so the
  `worst` accumulator kept its 1e9 seed value and the check reported a
  comfortably clear corridor. It now fails unless it actually measured something
  (`minClear < 1e8`) and unless the slope is dense (`totalObs > 4000`). **A gap
  nobody measured is not a gap.**
- **`touch targets`** — the break floored `.btn.sm` at 36px, which no measured
  box inherited. Now shrinks every button, tab and `.btn` in both axes.
- **`nothing important is in the fab gutter`** — the break moved `#hint` but the
  game re-laid it out. Now forced with `setProperty(..., 'important')`.

Every check also runs in its own browser context now, so a break that writes
localStorage cannot leak into the next check.

## LOOKING

Shot mid run at 375x667 and read.

- **The keyboard hint line is shown on a phone.** "left right carve · down tuck ·
  space = trick · P = pause" renders across the middle of the slope on a 375px
  touch viewport, over the course art, telling a phone player to press four keys
  the device does not have. It is also the one HUD element sitting in the middle
  third where the obstacles are. This is standing class 9 on a control hint and
  it is the clearest visual defect in the game. Left as a finding rather than
  fixed, because the right answer is a copy call: either gate the line on a
  pointer-coarse media query, or write one line that covers both.
- The LEFT / TUCK / RIGHT bar reads well and is genuinely clear of the fab.

## WHAT STILL WORRIES ME

- The trick ratio landed at 1.24x against a 1.25x gate. That gap is the reward
  for perfect rhythm over slightly-off rhythm, which is a fair thing to pay, but
  the assertion is riding close to its own threshold and will need a look if the
  jump tuning ever moves.

## FINAL STATE

`node audit.mjs` → **14/14 passed**.
`node audit.mjs --selftest` → **12/12 checks proved they go red** (was 9/12).
