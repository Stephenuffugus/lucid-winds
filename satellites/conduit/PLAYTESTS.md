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

## C2 runs, 2026-09-01, runner: Opus (scripted), CFG diffs: none

### The lockdown drill, three rounds, 844x390, seed 1337
`node test/lockdown.js`. The whole fifth alert state was dead in two independent
places and had never been played: nothing in the game bumped past alert 3, so
Lockdown was unreachable, and `resolvePower` skipped every conduit while lockdown
was true, so the breaker could never come on and could never clear it. Both fixed.

- The recovery now plays: route from the socket along the corridor and down into
  room C in the dark, 41 tiles, the breaker takes power, the site comes back at
  Search. Three rounds, no mass leaked in any of them.
- Round 1 was a success I nearly misread: the breaker fired, cleared the
  lockdown, **and then the rescue wire shocked a guard standing on it and burned
  three tiles off itself back off the breaker.** Powering the site with your own
  body across a patrolled corridor costs you. That is the mechanic being good.
- **FINDING, Director call.** Measured, stepping out into the patrolled corridor
  and back into cover eight times, the alert went:
  **`2, 3, 3, 3, 3, 2, 1, 0`.** It reaches Alarm on the second sighting and then
  **plateaus there and decays**, because a retreat long enough to break line of
  sight costs more ground than the next sighting gains: Suspicion decays in 8s and
  Search in 15s. So real play tops out at Alarm. Lockdown is reachable, the smoke
  suite climbs it, but only under pressure you cannot escape. Is Lockdown meant to
  be that hard to trip, or should being seen at Alarm trip it outright?
- In the first attempt the drone killed me outright while I was farming
  sightings. Death is real and quick once you are hunted at low mass.

### Route assist, 844x390
Tap a source, tap a machine. It lays the cheapest legal path through the same
`draftStep` a finger uses, so the two ways of drawing cannot drift apart.

- **The assist costs 19.8 to the sprinkler. The designed hand route costs 24.6.**
  It saves 4.8 mass and buys every gram of that with exposure, because concealed
  ground costs 1.6x. So the assist does not solve the puzzle for you: it hands you
  the cheap dangerous answer and you drag it into cover if you would rather hide.
  That is the game's central trade made into a one tap default, and I think it is
  the right default. Stephen may disagree; the alternative is to bias it toward
  concealment, which would make it the safe boring answer instead.

### Corridor drone
Shortened from the whole corridor (x 5 to 44) to its east half (x 26 to 42), per
the designer note: patrol length, never spot rates. Two things came out of it:

- The west corridor holds the socket and the only link into the trap room, so
  sweeping all of it made every early crossing contested. The early game breathes
  now.
- My first attempt started the patrol at x 15 and **broke the solvability gate**:
  the drone reached the designed route's corridor crossing sooner, zapped the
  wire, burned three tiles off it, and the plate never powered. The designed
  generator route crosses the corridor at x 18 to 22 and that is the only legal
  crossing, so parking a patrol on it decides the level before the player does.
  The patrol is now kept clear of it. **This is the second time the same level
  authoring issue has bitten: the intended solution runs through the patrol lane.**

### Performance, 844x390, dev overlay
`update 0.07ms, draw 1.32ms` against a budget of 5 and 8. Large headroom before
the ferro pass spends any of it.

### Honest note on `?seed=`
It is wired and it works: `?seed=4242` sets `CFG.seed`. But **the seed currently
changes nothing**, because `S.rng` is created and never consumed and there are
zero `Math.random` calls in the game. Nothing in the sim is random yet. The
plumbing is right and it satisfies the architecture law for when something is,
but do not read "seed 1337" in a log as meaning a run can be replayed. In the
browser it cannot be anyway: real frame timing varies, which is why the same
script has produced +1.2 and -22.9 net mass on the same level.

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

## 2026-09-03, Stephen, on building spaces

> "i'm curious how we should be making 3D environments and worlds for some games like conduit
> could potentially be really cool, or if i have a map editor or builder somehow so i could
> design spaces and puzzles and make them really good for games like conduit."

Fact: Conduit's sites are ASCII grids in `LEVELS` (index.html line 589), one character per
tile, with `LEVEL_ORDER` naming the sequence. That is already an editor format; it only lacks
the editor. Cheapest real step: an in-browser site painter (a page under satellites/conduit/tools/)
that paints tiles and machines on a grid, plays the site in place, and exports the text block
to paste into LEVELS. 3D worlds are a separate, later question: the game is top down 2D; a 3D
"skin" would be the Ripcord battle3d pattern (same sim, a camera over GLB props).

### Built the same night (Fable, 2026-09-03): the site editor

`satellites/conduit/editor.html`, also reachable from Settings → Site editor. Paint the
48 by 32 grid (floor, wall, shadow, vent, door, concealed channel), place the start, the
exfil, sources, devices (with areas, crane drops, doorlock doors, fan direction), patrols
with routes, lights and the facility's own wire, then **Play it** runs the real game on it
(`index.html?site=custom`). **Export** gives the JSON. To edit a shipped site, open
`index.html?site=site-02&dump=1` once, then **Load last dump** in the editor. Everything
autosaves in the browser. The game side is `buildFromRows`, `dumpSite`, `siteFromJSON`
and the `?site=` flag. Proven headless end to end: dump, edit, play. Harness and drive tests
green; the full run test reports one FAIL that predates this work (it loads the game over
file:// and the fleet music include at /music-unlocks.js cannot resolve there).
