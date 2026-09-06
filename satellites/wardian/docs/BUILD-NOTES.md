# WARDIAN, build notes

One file, no build step, no framework. `index.html` is the game; `sim.js` reads
the rules out of it through marker comments so the headless runner and the thumb
play exactly the same game.

## Running it

```
python3 -m http.server 8777        # from satellites/wardian
open http://127.0.0.1:8777/
```

`index.html?test=1` runs the whole assertion harness in the page and prints it
over the jar, for a phone with no console.

## The gates

```
node tools/check.js          everything, about half a minute
node tools/check.js --fast   skips the slow one and SAYS it skipped it
```

| Gate | What it is | What it would catch |
|---|---|---|
| `sim` | `sim.js --test`, 122 assertions | the ecosystem: growth, dormancy, catch up, arrivals, the rares, determinism, and the promise that nothing dies |
| `lint` | `tools/lint.mjs` | the studio laws: the script parses, no runtime `.mjs`, every asset stamped, one stamp in three places, no dashes or exclamation points in player copy, Sky Wolf Studio singular, no `shadowBlur` per segment, no text under 0.7 rem |
| `journal` | `test/journal.mjs` | the Jarwright's voice: 25 written lines, 12 to 60 words, two to four sentences, no orders, a page for every species, a hint for every system |
| `boot` | `test/boot.mjs` | the jar draws, the picture follows the sim, midnight is darker than noon, the HUD is reachable |
| `touch` | `test/touch.mjs` | real pointers: the swipe mists, the tap rolls a pillbug, a long press opens edit mode, a drag moves a stone by the drag distance, the loop stops when the tab hides |
| `settings` | `test/settings.mjs` | nothing is asked for at boot, every switch works and is remembered, the jar exports and imports, the photograph is 1080x1440 with a field note and no coordinates |
| `layout` | `test/layout.mjs` | every screen at 320, 375 and 412: 48 px targets, the music chip's corner left empty, no sideways scroll, nothing clipped |

Other tools:

```
node sim.js --days=14,twoDay     a census, day by day, under a watering policy
node sim.js --catchup=30         what a month away does
node sim.js --test --over=KEY=N  the same run against one changed CONFIG number
node tools/shots.mjs [filter]    the shots in docs/shots
node tools/thumb.mjs             the portal tile, which refuses to write a bad one
node tools/icons.mjs             the three PWA icons
```

## The shape of the file

```
CONFIG  RNG  SPECIES  CLOCK  ENV  FLORA  FAUNA  SIM      <- inside SIM_EXPORT markers
TEST                                                     <- inside TEST_EXPORT markers
VIEW  INPUT  SOUND  WORDS  JOURNAL  WEATHER  PHOTO  TILT  SAVE  BOOT
```

Everything between `SIM_EXPORT_START` and `SIM_EXPORT_END` is pure: no
`document`, no `window`, no `Date.now`, no `Math.random`. `tools/lint.mjs`
greps for each of those and for `plants.splice`, because the promise that
nothing in the jar dies is enforced as a grep as well as an assertion.

## Things that cost a round and are written down so they do not cost another

- **The plants were laid out in world units and drawn as pixels.** Both ferns
  stood in the room above the jar. `layoutPlant` returns SCREEN points now and
  says so at the top.
- **`mixHex` could not read its own output.** It parsed `#rrggbb` only, so a
  colour mixed twice came back NaN, canvas kept the last fill, and the moss
  rendered black.
- **Scatter by modular arithmetic makes lattices.** `(i * 137) % 719` walks a
  constant step in x and another in y, so the soil grain landed in diagonal
  dashes. `hash01(i, salt)` is the fix and everything scattered uses it.
- **`destination-out` erases the jar.** The glass sheen faded with it left a
  black slab down one side. It is a radial gradient now.
- **The hour ADDED light at every phase**, so the night jar came out brighter
  than the noon one. It is a veil that takes light away, plus one small glow.
- **`setPointerCapture` throws** on a synthetic pointer id and takes the rest of
  the handler with it, so the jar answered nothing at all. It is wrapped.
- **The humidity was recomputed from the glass every tick**, so a mist nudging
  `state.humidity` was wiped a tick later and the dew sprout could never open.
  Humidity IS the water on the glass now, and a mist puts water there.
- **A pillbug was drawn behind the stones** and disappeared. The hardscape goes
  down before the animals.
- **A shed leaf grew back carrying its parent's generation**, so every fallen
  leaf grew a whole new limb and two ferns filled a 400 segment budget in a
  month. A replacement is a leaf, flagged `noBranch`.
- **The segment budget was a boolean tested once**, and a crown pushes five at a
  time, so the jar overshot `SEG_MAX` by four. It is counted.
- **The moss ceiling was a fraction tested at the door** and came out at 58
  percent against a 55 percent cap. It is counted in cells.
- **A single shot filter skipped the setup that makes the shot.** `p3` alone
  photographed a midnight jar because the `setHour(11)` before it was inside a
  guard. The shutter is gated, the walk is not.
- **Two gates were decoration when first written.** The darkness assertion
  averaged the whole canvas, where the room dominates and stays dark either way;
  the frame loop assertion passed with its own guard deleted because the
  `visibilitychange` handler was doing the work. Both were rewritten and
  rewatched failing.

## Deploy

Fable pushes to `main`; Hostinger serves it. Bump `STAMP` in `index.html` and
`SHELL_VERSION` in `sw.js` together, in lockstep, on every deploy. `tools/lint.mjs`
fails if they disagree.
