# SUPER SLICE (slice-master) — Start Here shelf audit, 2026-08-16

Judged against one question: a stranger on a phone, ninety seconds, does this
make them want to see more of the studio.

## VERDICT

**Earns its slot, after one P0 fix.** It is the best 90-second game of the four:
one verb (tap), instant restart on death, a money counter that ticks while you
watch, and a wall at the end of every level that gives the run a shape. Nothing
gates play — the first tap of PLAY is the first tap of the game.

It shipped with **no way back to the arcade**, which is the one thing that makes
a good first impression worthless: the stranger's only exit was the browser back
button.

## AUDIT (written before any change)

### P0 — no exit affordance existed at all
`window.SWS_EXIT` is defined at index.html:774 with the correct
`document.referrer` fallback. **Nothing in the file ever called it.** Not a
button, not a key, not a menu row. This is the fleet defect in its worst form:
not "the exit is gated on `window.parent !== window` and never renders", but
"the exit was never wired to anything". A player who arrives from the portal
(top-level navigation, per incoming/PORTAL-CONTRACT.md) lands in a game with a
Home button that only reaches the game's own title screen, and a title screen
with no way out.

### P0 — the game's own completability proof had been red for six weeks
`PROOFS` (index.html) is a baked list of tap ticks that, replayed through the
live engine, proves each of the 30 levels can be finished. It was machine solved
on 2026-07-17. On 2026-07-30 ground friction went `0.986` to `0.90` per tick
(Stephen: "the blade slides on the ground, it needs to be more crisp"). Every hop
now carries less distance, so **19 of the 30 baked tap lists stop short of the
wall**: L1 ends at kx 2191 of 2241, L12 at 1707 of 3777, L26 at 2107 of 4303.
Nobody noticed because replaying the proof needed a browser and nothing in CI
had one.

Re-solved all 30 through the live engine (`SL_DEV.solve`, 400 seeds each):
**every level is still completable** — only the proof was stale, not the game.
Proofs re-baked and now replay green from `node check.mjs` in about a second,
so this can never rot silently again. Comment in the file tells the next person
to re-bake whenever GRAV / TAPVY / RUNVX / friction move.

### P1 — `go-retry` could run on a null `G`
`tap('go-retry', ...)` reads `G.daily` through a guard but `newRun(G&&G.daily?0:...)`
is only reached from the result screen, which is only reachable after a run, so
`G` is in practice non-null. Left as is after tracing; noted so the next reader
does not re-trace it.

### Core loop — clean
`newRun` → `step` (fixed 1/120s) → wall stick or pink death → `endRun`.
- Stick the wall: bank `pts*mult + coins`, `PROG.level++`, **straight into the
  next level with a BANKED banner**. No result screen, no interstitial. This is
  the single best decision in the game and it is why it reads well cold.
- Touch pink: 700ms beat, then the same level restarts with a
  "THE PINK GOT YOU" banner. No punishment screen, no lives, no ads.
- Handle-first wall hit bounces you back for another approach and prints
  "lead with the blade!" once. A real teaching moment inside the mechanic.

No dead ends found. No state a player cannot leave once the exit is wired: every
screen has a Back, play has Home, death auto-restarts.

### Save / load — safe
`sl2_prog` and `sl_set` are read through try/catch with a per-key merge loop
(`for(k in PROG) if(p[k]!=null)`), so a corrupt or truncated JSON blob falls back
to defaults instead of throwing. Verified by the check script with four bad
payloads (`{`, `null`, `[]`, `{"level":"x"}`).

Two-tab clobber: writes are wholesale `JSON.stringify(PROG)`, so two tabs do
race. Impact here is cosmetic (coins/level), not destructive, and the game is a
single-session arcade run. Noted, not fixed — fixing it properly means a
read-modify-write on every field and that is a bigger change than this shelf
needs.

### Difficulty — real for 25 levels, then flat
`buildCourse(n)`: `d = min(1, n/25)` and `segs = 5 + min(6, n/3)`. Both cap. So
level 25 and level 250 are the same difficulty with different seeds. That is
fine for the 90-second job and wrong for a returning player. Not fixed (it is a
design call, not a defect).

### P1 — the whole game's copy was under the studio font floor
The stage is 540x960 and is scaled by `min(vw/540, vh/960)`, which is **0.694 at
375x667**. Every CSS px in this file is therefore multiplied by 0.694 on the
phone the shelf is judged on. The floor is 0.7rem (11.2px) rendered:

| element | was (stage px) | rendered | verdict |
|---|---|---|---|
| `.ribbon` (the one sentence that teaches the game) | 14 | 9.7px | under |
| `.helprow` (How to play) | 14 | 9.7px | under |
| `.btn.sm` (Daily, Knives, How, Settings) | 15 | 10.4px | under |
| `.title-sub` | 13 | 9.0px | under |
| `.knifecard` name / price | 12.5 / 11.5 | 8.7 / 8.0px | under |
| `.foot` | 11 | 7.6px | under |
| in-game HUD subline | 12 | 8.3px | under |

Someone had already written the correct warning about this for touch targets
(index.html:52) and then sized all the type as if the stage were 1:1. Fixed: all
of the above now sit at 17-18 stage px, which renders 11.8-12.5px. The
"need X more" shop message was shortened to "X short" so it still fits a 140px
card at the larger size.

### First thirty seconds — teaches itself
Title ribbon names the verb, the thing to avoid, and the goal in one sentence.
The HUD prints "tap to flip" under the money counter for the whole run. A
progress bar shows how far the wall is. Good.

### Touch targets — pass (someone did this one right)
Stage is 540x960 scaled by `min(vw/540, vh/960)`; at 375x667 that is 0.694.
`.btn` 72px → 50 real px. `.tbtn` 72x72 → 50. `.knifecard` ~140x118 → 97x82.
`.toggle` is 64x36 but carries an `::after` that inflates the hit box to 84x72
→ 58x50. All clear of 48.

### Service worker — correct
`CACHE = "slice-master-v7"`, activate deletes only keys starting
`"slice-master-"`, registration is `sw.js?v=7`. In lockstep.

### Copy — clean
Every em dash in the file is inside a `/* */` or `//` comment. No dashes in
player-facing strings.

### Determinism — honest
`mulberry32` seeded per level; `Math.random` appears nowhere in logic. The baked
`PROOFS` tap-tick lists replay through the live engine, which is the right kind
of proof. `dayNum()` seeds the daily.

## FIXED

1. **Added the exit.** `◄ Sky Wolf Studio Arcade` on the title stack, wired to
   `window.SWS_EXIT()`. Uses `.btn.ghost.sm` so it is 50 rendered px at 375x667
   and reads as secondary to PLAY.
2. **Added an exit from the result screen** (`◄ Arcade` beside Menu), so the
   daily's end card is not a one-way door into the title screen.
3. **Re-baked the 30 completability proofs** against the live engine.
4. **Raised all player copy above the 11.2px rendered floor.**

## IMPROVED

5. **PLAY now says what it does.** The button read `🔪 Play · level 12` with the
   level in a dimmer span; on a cold open at level 1 that read as noise. It now
   reads `🔪 Play` on level 1 and `🔪 Continue · level N` from level 2, so a
   returning player is told the run continues and a stranger is not shown a
   number that means nothing yet.

## NOT FIXED (deliberate)

- Difficulty plateau past level 25. Design call.
- Wholesale localStorage write. Cosmetic impact only.
- Stray non-ASCII character in a code comment at index.html:529. Harmless.

## VERIFICATION

`node check.mjs` in this folder. Runs the real game script inside a `vm` with a
minimal DOM and canvas stub, so `buildCourse`, `wallBands`, the wall-stick
angle rule and the save loader are exercised as shipped, not re-implemented.
Every assertion was watched fail on purpose before being trusted (see the
`--selftest` flag, which corrupts each invariant in turn and requires the
matching assertion to go red).
