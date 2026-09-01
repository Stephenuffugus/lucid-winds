# CONDUIT — playtest log

One entry per run. Honesty is the whole point; a "no" here is cheap, a "no" after the art pass is not.

Template:

```
## 2026-MM-DD, runner: (Stephen / Fable / Opus), seed: XXXX, CFG diffs: none
- Result: (exfil / died / abandoned), peak alert: N, net mass: N, residue: N
- Did you ever WANT the long safe route, or was short and cheap always right?
- Did liquidity bite: were you mid-sized and useless at a bad moment?
- Did lockdown feel like a setback or a wall?
- Was the minute BETWEEN wire moments fun (prowl verbs)?
- One thing that felt wrong:
```

## THE SHIP GATE (M1) — Stephen answers, nobody else
Is route, trigger, harvest, reclaim fun with rectangles, and is the minute between those moments fun?

VERDICT: ____________ (unanswered)

---

## How the C1 runs below were driven, stated plainly

These five are **scripted runs in a real browser**, not thumb play. `test/fullrun.js`
drives Chrome with real touch events at the coordinates a thumb would use: it presses
the start button, holds a drag to steer, drags tile by tile to route, taps the canvas
buttons, and pushes into the door to force it. Nothing calls a game function to make
something happen; game state is only ever read, to decide the next move and to report
what happened. That is as close to play as I can get, and it is not the same as
playing. **They answer "does the frame hold and does the loop complete", not "is it
fun".** The fun question is the M1 gate and it is Stephen's alone.

---

## 2026-09-01, runner: Opus (scripted, 844x390 landscape), seed: 1337, CFG diffs: none
- Result: **exfil**, peak alert 1 (Noticed), net mass +1.2, residue 13.2, 41 tiles, 49s
- The intended solve ran end to end: socket to sprinkler up the concealed spine,
  generator to plate through the vent channel, target down, body harvested, both
  wires reclaimed, exfil door forced at 88 mass, extracted.
- **What actually killed him was the wire, not the trap.** Wire A goes live directly
  under the sentry's patrol; he stepped on it, took 15, and the run burned 3 tiles of
  itself off the sprinkler at zero refund. Q5 working exactly as written. Worth a
  Director look though: the *documented intended route* crosses the patrol it is meant
  to trap, so the designed solution partly self destructs on contact. Feature or level
  authoring, his call.
- Liquidity bit exactly as designed: committed 50.0 of 100, sat at 47 body while the
  patrol walked in. Below force, above squeeze, mediocre at everything.
- Lockdown: not reached. See the breaker bug in HANDOFF.md; it could not have been
  recovered from if it had been.
- One thing that felt wrong: nothing in the frame. The blob is still a plain ring,
  which is C3's whole job.

## 2026-09-01, runner: Opus (scripted, 375x667 portrait), seed: 1337, CFG diffs: none
- Result: **exfil**, peak alert 2 (Hunted), net mass +1.2, residue 13.2, 41 tiles, 41s
- Same solve, portrait. Controls sit in the bottom right block, 48px minimum, all four
  reachable, nothing clipped by the safe area.
- The alert reached 2 here and 1 in landscape from identical inputs. Real time frame
  pacing, not a seed difference; the sim is deterministic per step but a browser run
  is not frame identical.
- One thing that felt wrong: in portrait the camera shows a lot of empty entry room
  under the player. Not broken, just loose.

## 2026-09-01, runner: Opus (scripted, 320x568, the size that finds what 375 hides), seed: 1337
- Result: **exfil**, peak alert 2, net mass **-6.3**, residue 13.2, 41 tiles, 38s
- Net went negative here: the wire burn cost more on this run. Same script, different
  timing, a 7.5 mass swing. That is the economy being genuinely tight, which is the
  point, but it means a single run tells you nothing about the average.
- 320 found two real faults that 375 hid, both now fixed: the title screen clipped at
  both ends and could not be scrolled to (flex centring an item taller than its
  container), and the device power badge sat on top of the device label.

## 2026-09-01, runner: Opus (scripted, 844x390, Flow framing pass), seed: 1337
- Not a full solve. A framing run to look at the planning view at phone landscape.
- Found the fault that mattered most in C1: **the control block is opaque to touch and
  sat on top of the map's bottom right, so the breaker and the exfil corner could not
  be routed on at all.** hitBtn runs before the map does. Flow now fits the site into
  the largest rectangle the controls leave free, which at this aspect is the space to
  their left, and the map got bigger as well as reachable (scale 7.06 to 9.35).
- Also found: at Flow zoom every device label and power badge was suppressed, in the
  one view where you decide what to wire. Devices now draw a single chip under the box
  carrying both, so the planning view reads at any zoom.

## 2026-09-01, runner: Opus (scripted, 1280x800 desktop), seed: 1337, CFG diffs: none
- Result: see the run log in the C1 commit. Desktop is not the target but it must not
  look broken, and it does not.
- Desktop is where the grain and vignette earn their place: at 50px tiles the site
  would otherwise be flat grey rectangles on flat black.

---

## Builder's read after C1, labelled as such

Not the ship gate. Things I can say from driving it that Stephen may want to weigh:

- The loop **completes** and the numbers land where the design said they would: a clean
  solve is roughly mass neutral, +1.2 against a predicted +1.0, with 13.2 banked.
- The liquidity squeeze is real and arrives on cue.
- The wire as a weapon is the most interesting thing that happened in five runs and it
  was not the designed solution. That is a good sign for the mechanic and a question
  for the level.
- Route drawing was the weak control and is now much stronger: a drag that skips or is
  briefly blocked used to silently kill the rest of the stroke. C2's tap to tap auto
  route is still worth building on top of that.
