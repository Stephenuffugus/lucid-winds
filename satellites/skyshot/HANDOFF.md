# Skyshot — handoff

A vertical slingshot. Portrait, one folder, no build step, no network.

---

## 1. Where it lives and how it deploys

- **Folder:** `satellites/skyshot/` in the `lucid-winds` repo (this repo).
- **Deploy:** the same way every other satellite in this repo goes out. Hostinger
  auto-deploys from `main`, so the live URL will be
  `https://lucidwinds.com/satellites/skyshot/`.
- **No GitHub Pages was set up for it** and none is needed. Every path inside
  the game is relative, so the folder runs unchanged from any origin or
  subfolder, including a vendored copy.
- **No service worker.** Nothing is registered, embedded or not, so there is
  nothing for the root SW to fight with.

## 2. File manifest

| File | What it is |
|---|---|
| `index.html` | The whole game. HTML, CSS, JS, level data, all inline. 68 KB. |
| `thumb.png` | 480x480 portal thumbnail source, 116 KB. Rendered from the game's own canvas. |
| `og/card.jpg` | 1200x630 link preview, 53 KB. Referenced by the `og:image` meta tag. |

Total folder: about 240 KB. There are no other files, no dev-only directories,
no dependencies.

## 3. Portal card copy

**Hook:** A slingshot at the bottom of the night garden, firing straight up at
buds that will not hold still.

**Paragraph:** Skyshot fires up the screen instead of across it. Drag back from
the slingshot to set angle and power, watch the short guide, and let go. The
seed arcs up under gravity and falls back. What you are shooting at is never
parked: buds walk, circle and swing on vines, while bramble bars turn and leaf
gates breathe open and shut in front of them. The skill is reading the rhythm
and picking the moment, not solving a static picture. Twenty four hand built
plots teach one idea at a time and then combine them, plus a fresh daily volley
every day. Seeds are limited, par is tight, and a plot can be lost.

## 4. Earn moments

Posted with `parent.postMessage({sws:'earn', moment, detail}, '*')`, **only when
embedded**, and only the first time ever for that key. The dedupe key lives in
`skyshot_prog.moments`, so replays, retries and star farming send nothing. No
message ever carries an amount.

**Sunbeams (fleet standard) ride the same moments.** `window._sbCapEarn(n, tag)`
is the hues implementation verbatim: a 30/day/game cap in localStorage
`sw_sb_skyshot`, then `Sunbeam.earn` if the SDK is present. It fires only when
`announce()` returns true (first time ever for that key), null-guarded, so
replays earn nothing. Rates: level clear 4, three-star 3, world clear 6, daily 5.
A solid first session is 20-30 and caps out; the `sws:earn` postMessages still
post unchanged for forward compatibility.

| Moment | Fires when | Dedupe key | Casual session estimate |
|---|---|---|---|
| `level_clear` | first time a campaign plot is cleared | plot index | 3 to 6 in an early session, 1 to 2 late, 0 once all 24 are done |
| `three_star` | first time a plot is cleared at or under par | plot index | 2 to 4 early, 1 to 2 late (players come back for stars) |
| `world_clear` | all six plots of a world have at least one star | world index, 4 exist ever | 0 to 1 |
| `daily_done` | the daily volley is cleared | date `YYYY-MM-DD` | at most 1 per day |

`detail` payloads: `level_clear {level, shots, par}`, `three_star {level}`,
`world_clear {world, name}`, `daily_done {stars}`.

A solid first session lands roughly 6 to 10 moments; a returning session with the
campaign finished lands 1 to 3 (daily plus mopping up stars). Price accordingly.

## 5. Nav map

`show(id)` is the only way a screen changes. It strips `.on` from **every**
`.screen` and hides the HUD before turning exactly one screen on, so no overlay
can survive a transition. The Skitterlings bug cannot happen here, and the
headless test asserts it from the result card, the pause card, the rules screen
and the loss card.

| Screen | Back / close does | Notes |
|---|---|---|
| `s-title` menu | n/a | The only screen with an exit. `◄ All Sky Wolf games` calls `SWS_EXIT()`. |
| `s-how` rules | primary button runs whatever sent you here | Shown **before every play**: Play and Daily both route through it. Also openable from the menu and from pause. |
| `s-levels` plots | sticky header `◄` returns to the menu | The grid scrolls, so the way out is pinned in a fixed header, not parked under the scroll. There is a second back button at the bottom too. |
| `s-set` settings | back to menu | Sound, screen shake, aim guide, clear saved progress. |
| `s-play` field | no screen is on at all, just the canvas and the HUD | HUD has pause and restart, both 72 px. |
| `s-pause` overlay | Resume returns to a bare field | Also restart, rules, plots, menu. |
| `s-go` result | Menu, Plots, Try again, Next plot | Shown on both a clear and a loss. |

The embed snippet from the brief is pasted verbatim as the first script block.
`SWS_EXIT()` is wired to exactly one control, the menu exit. Nothing else ever
navigates. Verified by framing the game in a stub portal: `ready` posts on load,
`close` posts on exit, and the frame never navigates away.

## 6. Stateful things

Two localStorage keys, both namespaced, nothing else is written.

**`skyshot_prog`**
```json
{
  "stars":   {"0": 3, "1": 2},      // plot index -> best star count 1..3
  "pollen":  4820,                  // internal score total, Wallet.total
  "moments": {"level_clear:0": 1},  // first-time-only earn dedupe
  "daily":   {"2026-08-07": 3},     // best stars per calendar day
  "plays":   17                     // levels started, used for the build stamp
}
```

**`skyshot_set`**
```json
{ "sound": true, "shake": true, "guide": true }
```

Settings has a "Clear saved progress" button that removes `skyshot_prog` only.

## 7. Currency

All internal earning goes through one object, marked in the source:

```js
var Wallet = { total, earn(n, reason), spend(n, reason) };
```

The internal currency is **pollen** and it is cosmetic: a running total shown on
the menu build stamp. No Firebase, no network call of any kind. Sunbeams flow
only through `_sbCapEarn` (see section 4), which no-ops without the portal SDK.
`announce(moment, key, detail)` is the only thing that talks to the host, and it
cannot set an amount.

## 8. How to add content later

Levels are a flat data array, `LEVELS`, near the top of the script block. Engine
code never needs to change to add more.

```js
{ n:'plot name', par:2, hint:'one short line shown for five seconds',
  pods:[ ... ], obs:[ ... ] }
```

**pods** (moonbuds, the targets). `r` defaults to 17, `hp` to 1.

| Shape | Fields | Meaning |
|---|---|---|
| static | `{x,y}` | parked |
| patrol | `{x,y,m:'patrol',ax,ay,sp,ph}` | x,y is the centre, ax/ay the sine amplitude |
| orbit | `{x,y,m:'orbit',rad,sp,ph}` | x,y is the centre. Negative `sp` reverses. |
| swing | `{x,y,m:'swing',len,arc,sp,ph}` | x,y is the pivot, the bud hangs below it |

**obs** (obstacles)

| Type | Fields |
|---|---|
| `wall` | `{t:'wall',x1,y1,x2,y2}` static beam |
| `bar` | `{t:'bar',x,y,len,a0,sp}` bramble turning about x,y. `sp:0` is static. |
| `shutter` | `{t:'shutter',x,y,w,g0,gA,sp,ph}` two leaves, half gap = `g0 + gA*sin(sp*T+ph)` |
| `rock` | `{t:'rock',x,y,r, ...any pod movement fields}` |

Ammo is always `par + 2`. Stars: at or under par is 3, par+1 is 2, par+2 is 1.
Worlds are fixed blocks of six, so keep `LEVELS.length` a multiple of six and add
a name to `WORLDS`.

Playfield bounds worth knowing: the sling is fixed at `(270, 848)`, the soil is
at `y 888`, there is a bounce ceiling at `y 56`, and at full power the seed tops
out around `y 90`. Keep buds between `y 180` and `y 720` and they are all
reachable.

**Prove a new plot is winnable before shipping it.** Open the game with
`?swtest=1` and use the built in solver, which brute forces angle by power by
fire time through the real physics:

```js
SKY.solveAll()        // every campaign plot: {ok, missing, bestInOneShot, par, ammo}
SKY.solve(def)        // one level object
SKY.solveDailies(30)  // 30 generated dailies
SKY.simShot(def, angle, power, fireTime)   // which buds a single shot reaches
```

All 24 plots and 24 sampled dailies pass today. The daily generator is
`genDaily(dateKey)`; it draws from the same three bud shapes and three obstacle
types, and it always parks its obstacle below every bud so a daily cannot lock
itself.

## 9. What was tested, headless, before handing over

Served over http and driven with Puppeteer at 375x667, real pointer input, real
hit testing at element centres, never `el.click()`.

- boots with zero console errors, zero requests off origin
- every button on every screen measures 48 rendered px or more at 375x667 and is
  the top element at its own centre
- the rules screen shows before play, every time, from both Play and Daily
- a full round played with a genuine mouse drag on the canvas: aim, release,
  flight, pop, result card, three stars, progress saved
- a level can be lost, and the loss card exits clean
- every overlay close leaves exactly one screen up, or zero on the play field,
  and hides the HUD
- earn moments fire once and never again on replay, in a real iframe
- the clock stops when the tab is hidden, and bouncing between screens does not
  stack frame loops
- identical input twice produces an identical flight path to four decimals
- `prefers-reduced-motion` plays a full round with no shake and no drift
- all 24 plots run to a decided end under a randomised shot sweep

## 10. Known weak spots

- The daily generator can place two buds close together, so a daily occasionally
  reads as a cluster rather than a composition. It is always winnable, just less
  handsome than the hand built plots.
- Levels 6, 10, 14, 16, 18, 21 and 22 have a single bud with a par of 2, so three
  stars there means "inside two seeds" rather than a perfect shot. That is
  deliberate for the timing heavy plots, but it makes those stars cheaper than
  the multi bud ones.
- Audio is synthesised beeps only, no music.
- Tested headless at 375x667 and in a framed portal stub. **It has not been
  played on a real phone.**
