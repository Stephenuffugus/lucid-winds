# BUILD PLAN — MARBLEBEAT × PADLAB (project 1 of 3) — v2, implementation level

**For the Opus build session. Reading order: this file → `HANDOFF-MARBLEBEAT.md`
(same folder) → `padlab/HANDOFF.md` (clock, state-trio, uiQ contracts — all
load-bearing).** Planned 2026-08-16 (deepened same night); decisions LOCKED.

## What this is

Stephen's call: fold Marblebeat (marble-drop polyrhythm sequencer, built FOR
this merge) into PadLab as a 4th tab — both a playable marble instrument and
a visualizer of the studio's own beat. Sources:
`incoming/marblebeat/marblebeat.html` (~700 lines) and `padlab/index.html`.
Every seam below was verified against both files at line level 2026-08-16.

## Verified merge map

| Marblebeat (delete/replace) | PadLab (the replacement) |
|---|---|
| own `ac`/`master`→comp (~138-148) | `initAudio()` graph; `drumBus` / `instrBus` (~571) |
| `setPlaying`/`schedule`/`requant`/`startT` (~196-230) | `schedulerTick()` (~1129); monotonic `grid`; `tPlay` already swing-adjusted on odd steps |
| `bpmEl`/`beatSec()` | `tempo` (module `let`, ~1123) |
| own `SCALES`/`scaleSemis` (~104-122) | `snap()` / `allowedMidis` / `keyRoot` / `scaleName` |
| `playBtn`, `#app` (id COLLISIONS with PadLab) | PadLab transport UI; MB transport chrome is deleted |
| no persistence | `collectState`/`applyStateVars`/`refreshAllUI` (~1366+) + `saveSoon()` |

Timing math (grid-exact, no drift): marble period in sixteenths
`p16 = NOTES[m.shelf].beats * 4` ∈ {1,2,4,8,16}; phase snaps to sixteenths
(`PHASE_SNAP_BEATS=0.25`), so `phaseSteps = Math.round(m.phase*p16) % p16`.
A marble hits exactly when `grid % p16 === phaseSteps`. Swing is inherited
free because `tPlay` already carries PadLab's odd-step offset.

## Function-level merge spec

**1. Markup.** New tab button in `.tabs` (~350):
`<button class="tab" data-view="marble">…Marble</button>` + section
`<section class="view" id="view-marble">` holding `#mb-stage` > `#mb-cv`
canvas + the MB chip rows (instrument / shelf / pitch) restyled with PadLab's
`:root` vars. **Prefix ALL ported MB ids `mb-`** (`cv`→`mb-cv`, `stage`,
`dock`, `hint`, `zoomCol`, chip rows, `selInfo`, `plateBtn`, `clearBtn`,
`removeBtn`, `demoBtn`). `app` and `playBtn` are NOT ported (collide with
PadLab; MB's transport chrome dies). MB's scale/BPM rows are NOT ported
(PadLab owns key/scale/tempo).

**2. Clock.** In `schedulerTick`'s while-loop, inside the playing branch
(marbles are part of the groove; silent during count-in):
```js
if(isPlaying && countinLeft===0) marbleTick(grid, tPlay, six);
```
```js
function marbleTick(g,t,six){
  for(const m of mbMarbles){
    const p16=MB_NOTES[m.shelf].beats*4;
    if(g % p16 === Math.round((m.phase||0)*p16)%p16){
      mbPlayHit(m,t);
      m.lastHit=t; m.next=t+p16*six;   // renderer animates from these
    }
  }
}
```
`m.lastHit`/`m.next` are AudioContext times set AT SCHEDULE TIME (up to
120 ms ahead) — this is correct and required: MB's renderer animates marble
height as a function of time between hits, so it needs the future hit time.
This replaces MB's `requant` entirely; live phase-drag just changes
`m.phase` and the next grid pass picks it up (re-quantize is free).
Do NOT touch `ensureClock()` conditions (PadLab regression trap).

**3. Audio.** Port `mbPlayHit` (MB `playHit` ~155) with reparented outputs:
bass/snare/hat voices `g.connect(drumBus)` (FX bypass law — note the snare
has a SECOND gain `g2` that connected to MB `master`; reparent it to
drumBus too), melody voice `g.connect(instrBus)` (gets reverb/delay/tone).
Port MB's `noiseBuf` lazily (PadLab has no shared noise buffer). Delete MB's
`audio()`/`ac`; use PadLab's `AC`/`ct()`/`ensureAudio()`. Wrap stops in
try/catch (PadLab law). Melody pitch: `m.semi` stores a scale DEGREE index;
resolve at play time through PadLab's current key/scale
(`allowedMidis`-style lookup around middle C), so re-keying PadLab re-keys
every marble. Hue stays `((semi%12)+12)%12*30` resolved from the actual
sounding midi — C keeps its hue in every key (visual identity).

**4. Render/camera/input.** Port MODEL (plates/marbles), CAMERA
(`yaw/tilt/zoom/pan`, `unproj`), RENDER (offscreen plate cache + `camDirty`,
per-cell culling, painter-sorted marbles, splash rings, phase dials, shelf
rulers), INPUT (pointer state machine on `#mb-cv`: tap=place/select,
drag-on-marble=phase with 7 px threshold, 1-finger pan, 2-finger
orbit/tilt/pinch, wheel zoom, right/ctrl-drag orbit) — all unchanged except
id prefixes. **Hidden-canvas trap:** the view is `display:none` at boot, so
the canvas would size 0×0. Hook the existing tab switcher (~1436), same
pattern as the keyboard:
`if(t.dataset.view==="marble"){ mbResize(); mbStartRaf(); } else mbStopRaf();`
rAF runs ONLY while the marble view is on (battery law). Placement while
transport is stopped: marble appears, no sound until play — fine.

**5. State.** Bump `collectState` to `v:4`, add
`marble:{marbles:mbMarbles.map(m=>({gx:m.gx,gy:m.gy,type:m.type,shelf:m.shelf,semi:m.semi,phase:m.phase})),plates:mbPlates,showBeat:mbShowBeat}`.
`applyStateVars`: missing `marble` key → defaults (one 16×16 plate, no
marbles) so v3 projects load clean. `refreshAllUI`: re-render marble chips +
`camDirty=true`. `saveSoon()` after every marble add/remove/phase-drag/
plate-add. All three or none (trap). IndexedDB only — no localStorage.

**6. "Show my beat" (phase D — the visualizer half of Stephen's ask).**
Toggle chip in the marble dock. When on, project the CURRENT pattern slot as
read-only ghost marbles on plate 0: for each track i / step s with
`pat().tracks[i][s]` set → ghost `{gx:s%16, gy:trackRow(i), type:padType(i),
shelf:4, phase:s/16}` where padType maps kick→bass, snare→snare, hats→hat,
toms/other→melody at a low degree. Ghosts: ~55% alpha, not selectable, not
serialized, rebuilt on pattern edit / slot switch / song-mode slot change
(hook `renderSeq` + the songSlotUI uiQ push). Ghost hits do NOT sound (the
sequencer already plays them) — they only animate, using the same
lastHit/next mechanism fed from `playSeqStep` timing: cheapest correct way
is to compute ghost bounce purely from `grid`/`nextTime` math in the
renderer rather than storing per-ghost state.

**7. CSS.** Restyle MB chips/dock with PadLab vars; MB's iso-plate palette
(the wood/brass look) stays its own inside the canvas. Match PadLab's dense
code style; no prettier pass.

## Build phases (gate each; commit AND push at every gate)

- **A — Port the world (no audio).** Markup, MODEL/CAMERA/RENDER/INPUT
  ported with `mb-` prefixes, tab hook + resize, rAF lifecycle. Gate:
  marble view renders; place/select/phase-drag works silently; other three
  tabs pixel-identical; `node --check` (via the python extract from
  padlab/HANDOFF §8) passes; sw.js untouched so far. **Test vehicle:
  `scripts/padlab_smoke.mjs` already exists** (puppeteer, sweeps every
  view, screenshots for the LOOKING pass, asserts zero console errors) —
  extend its view sweep with the Marble tab from phase A on, and in phase B
  add: tap to place a marble → assert no console errors and the canvas is
  non-blank (readback a pixel row; a probe that cannot fail is not
  evidence — assert on content, not on "no crash").
- **B — One clock, one graph.** `marbleTick` + `mbPlayHit` per specs 2-3.
  Gate: with a groove playing, bass/snare/hat/melody marbles lock to the
  beat INCLUDING swing (set swing 40% and listen on odd steps); pause stops
  marbles; count-in stays marble-silent; arp-without-transport still works;
  a recorded jam captures marbles; melody re-keys when PadLab's key changes.
- **C — State + ship.** Spec 5; export → reload → import returns marbles;
  v3 project import still loads. Bump `SHELL_VERSION` in sw.js AND the
  registration `sw.js?v=` together (⛔ the two-place law, memory:
  padlab_mpk_aug03). Deploy; verify `lucidwinds.com/padlab/?probe=RANDOM`.
  Gate: PadLab handoff §8 smoke list end-to-end + marble additions.
- **D — Show my beat** per spec 6. Gate: edit a step → ghost appears live;
  A/B/C/D switch follows; song mode follows slot changes; toggle off clears.
- **E (optional).** Per-plate mute/solo chips; velocity-by-marble-size.
  Only if the night has room.

## LOOKING gate (project law)

375×667 screenshots from where the player stands: Marble tab default view —
is the plate legible at phone size, are marbles readable, is the phase dial
visible? Then the worst angle on purpose: max zoom-out at max tilt with 6
plates dense with marbles, and side-on tilt 0.18 (shelf rulers drift there —
known cosmetic, confirm it stays cosmetic). Name three things wrong before
Stephen does. Chips must hit 48px RENDERED.

## Traps

- uiQ principle: marble visuals are time-based in rAF (fine); never flash
  UI from the scheduler directly.
- `refreshAllUI`/`collectState`/`applyStateVars` — all three or none.
- Painter sort O(n log n) per frame: fine <500 marbles; plate cache
  invalidates ONLY on camera change (`camDirty`), never per frame.
- iOS audio unlock: PadLab's splash handles it — MB's own unlock is deleted.
- PadLab surface law (handoff §9): depth behind a sheet or a toggle, never
  more top-level chrome. The marble dock stays inside the marble view.
- Keep `PadLab.html`/`index.html` question resolved: `padlab/index.html` is
  the single source of truth (repo already dropped the duplicate).
