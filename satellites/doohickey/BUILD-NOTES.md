# DOOHICKEY, build notes

One file, no build step, no framework. `index.html` is the game; `sim.js` reads
the rules out of it through marker comments so the headless runner and the thumb
play exactly the same game.

## Running it

```
python3 -m http.server 8777        # from satellites/doohickey
open http://127.0.0.1:8777/
```

## The gates

```
node tools/check.js          everything, about three minutes
node tools/check.js --fast   skips the slow ones and SAYS which
```

| Gate | What it is | What it would catch |
|---|---|---|
| `sim` | `sim.js --test`, 121 assertions | the engine: resting, rolling, joints, the fan, buoyancy, sleeping, the spring, the switch, the cat, determinism, serialisation, every level, the cascade |
| `lint` | `tools/lint.mjs` | the studio laws, plus the determinism law as a grep: no `Math.random`, no transcendental, no clock, no document inside the SIM export |
| `solve` | `sim.js --solve` | every level is won by its own solution, inside par, with every bonus touched, and none of them wins with an empty tray |
| `replay` | `sim.js --replay=100` | a hundred runs of a twelve part machine give ONE hash |
| `dominoes` | `sim.js --dominoes=100` | the heartbeat: a hundred jittered trials at each of three spacings, every domino down, the last inside four seconds |
| `mutants` | `test/mutants.mjs` | seven single changes that each MUST turn the sim gate red |
| `edit` | `test/edit.mjs` | real pointers in both orientations: drag out, snap, the red ghost, the dial, undo and redo, drag back to the tray, pinch |
| `run` | `test/run.mjs` | a real round: PLAY, a level card, the solution, the real GO, and the bell inside ten seconds of WALL time |
| `share` | `test/share.mjs` | a link opened in a FRESH context is the same machine and still wins |
| `film` | `test/film.mjs` | a five second run comes back as a real blob of a real type, from `onstop` |
| `layout` | `test/layout.mjs` | five screen sizes: 48 px targets, the music chip's corner, no sideways scroll, the handle row on screen |

Other tools:

```
node sim.js --solve                 the level table
node sim.js --replay=N              the determinism law as one line
node sim.js --dominoes=N            the heartbeat, per spacing
node sim.js --test --over=KEY=VAL   the same run against one changed CONFIG number
node tools/shots.mjs [filter]       the shots in docs/shots
node tools/thumb.mjs                the portal tile, which refuses to write a bad one
node tools/icons.mjs                the three PWA icons
```

## The shape of the file

```
CONFIG  RNG  DMATH  VECTORS  PHYS  PARTS  MACHINE  LEVELS  SIM   <- SIM_EXPORT markers
TEST                                                             <- TEST_EXPORT markers
VIEW  THE GAME  THE WIN  THE SANDBOX  AUDIO  SHARE  FILM  EDITOR
```

**DETERMINISM IS LAW.** Inside the SIM export there is no `Math.random`, no
`Date`, no `document`, and no transcendental: `dsin`, `dcos` and `datan2` come
from DMATH, which is built from `+ - * /` and `Math.sqrt` only. `tools/lint.mjs`
greps for every banned name, and `test/mutants.mjs` puts one back to prove the
grep works.

## Things that cost a round and are written down so they do not cost another

- **The world takes gravity as a NUMBER**, not a vector. Passed `{x,y}` it reads
  the object as a scalar and every body integrates to NaN on the first step,
  silently: no error, just a marble at NaN.
- **The solver takes the MINIMUM restitution of a pair.** A bouncy marble on a
  dead floor is a dead bounce, and a spring pad with a restitution of 1.4 under a
  marble of 0.35 is a 0.35 bounce. The pad PUSHES instead.
- **The rope's inequality was written twice**, as an early return and as a clamp,
  so a mutation of either half changed nothing and no gate could see it.
- **"Fallen" is not "lying flat".** In a tight row a domino topples onto the next
  and rests at about `asin(gap / height)`, 33 degrees at the 0.55 spacing.
  Measuring for 51 called a perfectly good cascade a failure.
- **A marble dropped at x=96 sails past a plank that spans 134 to 226.** Five of
  the first six levels missed for that reason, and so did the heartbeat, which
  read zero dominoes with nothing else obviously wrong. Every coordinate in
  `LEVELS` now comes from the simulator.
- **A cascade can run backwards.** Level 1's marble used to fly over the row,
  land in the middle of it, and knock the dominoes AWAY from the bell.
- **The contact callback takes five arguments**, `(a, b, approach, impulse, pt)`,
  not the four the plan's summary named.
- **`setPointerCapture` throws** on a synthetic pointer id and takes the rest of
  the handler with it. (Carried from Wardian; the same guard is here.)
- **One share byte of rotation means ONE rotation grid.** If the board can hold
  an angle the byte cannot, the machine you send is not the machine that
  arrives, and a domino run is chaotic enough to end differently. 240 steps of
  1.5 degrees fit in a byte AND make every 15 degree detent exact.
- **"The machine changed" was three lines at eight call sites**, and two of them
  forgot the sandbox save, so a table built one way was kept and another way was
  lost.
- **A button in the bottom right corner covers the bell** in four levels out of
  six, and one in the bottom centre covers the floor. GO and STOP are in the top
  centre, which is sky in every level.
- **A tray that scrolls along the bottom scrolls into the music chip's corner.**

## Deploy

Fable pushes to `main`; Hostinger serves it. Bump `STAMP` in `index.html` and
`SHELL_VERSION` in `sw.js` together on every deploy; `tools/lint.mjs` fails if
they disagree.
