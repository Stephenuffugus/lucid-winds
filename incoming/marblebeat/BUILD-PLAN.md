# BUILD PLAN — MARBLEBEAT × PADLAB (project 1 of 3)

**For the Opus build session. Read this whole file before touching code.**
Planned 2026-08-16 by the Fable planning session; decisions below are LOCKED
defaults (Stephen can veto, do not re-litigate mid-build).

## What this is

Stephen's call: take PadLab (the music studio, `/padlab/`, live at
lucidwinds.com/padlab/) and fold Marblebeat into it as a feature — a
marble-drop visualizer/sequencer tab. Marblebeat v3 was built FOR this merge:
its handoff (`HANDOFF-MARBLEBEAT.md`, same folder) documents 5 merge seams and
they were all verified against both sources on 2026-08-16.

- Source A: `incoming/marblebeat/marblebeat.html` (~700 lines, self-contained)
- Source B: `padlab/index.html` (the studio) + `padlab/HANDOFF.md` (READ IT —
  the clock, state-trio, and uiQ contracts there are load-bearing)

## Verified seam map (line numbers checked 2026-08-16)

| Marblebeat | PadLab | Merge action |
|---|---|---|
| own `ac`/`master`→comp (line ~138) | `initAudio()` graph, `drumBus`/`instrBus` (~571) | delete MB audio boot; route voices into PadLab buses |
| `setInterval(schedule)` + `startT` (~197-230) | `schedulerTick()` (~1129), monotonic `grid` 16th counter | delete MB transport; schedule marbles inside `schedulerTick` |
| `playHit(m,t)` switch on type (~155) | `drum()` voices, `voiceFor(midi,vel,when)` (~909) | keep MB voice code, reparent output nodes |
| `SCALES`/`scaleSemis` (~104) | `snap()`, scale lock, key selector | delete MB scales; melody semis come from PadLab scale |
| no persistence | `collectState`/`applyStateVars`/`refreshAllUI` (~1366+) + `saveSoon()` | marbles/plates join the state trio |
| own page | `.tab[data-view]` → `#view-{name}` switcher (~1436) | new 4th tab `data-view="marble"` |

Timing math that makes this clean: marble periods are `NOTES[shelf].beats ×
4` = **1, 2, 4, 8, 16 sixteenths**, and phase snaps to sixteenths
(`PHASE_SNAP_BEATS=0.25`). So a marble hits exactly when
`(grid - phaseSteps) % period16 === 0` where `phaseSteps =
Math.round(m.phase * period16)`. No fractional scheduling, no drift, swing
applies via PadLab's existing odd-step offset.

## Locked decisions

1. **It lives inside PadLab** as a 4th tab: Beats / Keys / Sample / **Marble**.
   Single-file law holds — port the JS/CSS into `padlab/index.html`. The
   standalone `marblebeat.html` stays in `incoming/` as reference only; do not
   maintain two copies.
2. **One clock.** Marbles sound only while the PadLab transport plays (they are
   part of the groove, like another track). Delete `setPlaying`/`schedule`/
   `requant`/`startT` wholesale; add a `marbleTick(grid, tPlay)` called from
   `schedulerTick` beside `arpTick`/`rollTick`. Do NOT widen `ensureClock()`
   conditions (regression trap in PadLab handoff §8).
3. **One audio graph, PadLab's law preserved: drums bypass FX.**
   bass/snare/hat marble voices → `drumBus`; melody marble voice → `instrBus`
   (gets reverb/delay/tone). Keep Marblebeat's own synthesis code for all four
   types in v1 — its character is part of the toy. Per-plate `voiceFor`
   instruments are a later phase, not v1.
4. **One musical brain.** Melody marbles pitch through PadLab's current
   scale + key (`snap()` / `allowedMidis`). Delete Marblebeat's scale chip row.
   Marble hue stays `semi%12 × 30` (C = same hue in every key — keep this, it
   is the visual identity).
5. **Visualizer of the groove ("Show my beat")** ships as phase D: a toggle
   that projects the CURRENT pattern slot onto plate 0 as read-only ghost
   marbles — each active step = a marble, period 1 bar (shelf 4), phase =
   step/16, track→type map (kick→bass, snare→snare, hat→hat, toms→melody).
   Re-derived on every pattern edit / slot switch; ghosts drawn ~55% alpha,
   not selectable, not serialized. This is the "visualizer" half of Stephen's
   ask — the studio's own beat becomes bouncing marbles.
6. **State**: `marbles` (strip runtime fields: keep `gx,gy,type,shelf,semi,
   phase`) + `plates` + marble-tab prefs join `collectState` /
   `applyStateVars` / `refreshAllUI`, `saveSoon()` after every edit. All three
   or none (trap in PadLab handoff §8). No localStorage, ever.
7. **Perf**: keep the offscreen plate-layer cache + culling from Marblebeat.
   Run the marble rAF loop ONLY while `#view-marble` has `.on` (hook the tab
   switcher); cancel it on view exit. Phones matter more than desktop.
8. **Ship discipline**: bump `SHELL_VERSION` in `sw.js` AND the sw registration
   version together (⛔ project law), verify the deployed URL with
   `?probe=RANDOM` after push.

## Build phases (each has a gate; do not start the next until the gate passes)

- **A — Port the world.** New tab + `#view-marble` section; port MODEL, CAMERA,
  RENDER, INPUT layers; palette-shift Marblebeat's CSS chips to PadLab's
  look (`:root` vars, Chakra Petch). Gate: marble view renders the plate,
  marbles placeable/selectable/phase-draggable with audio still OFF; other
  three tabs unchanged; `node --check` on extracted JS passes.
- **B — One clock, one graph.** `marbleTick` in `schedulerTick`; voices into
  `drumBus`/`instrBus`; melody via PadLab scale. Gate: start a groove, place
  bass/snare/hat/melody marbles — everything locks to the beat including
  swing; pause stops marbles; arp-without-transport still works (regression
  trap); recording a jam captures marbles (they ride the same compressor).
- **C — State + ship.** State trio + saveSoon; export→reload→import returns
  marbles; SHELL_VERSION bump; deploy; `?probe=RANDOM` verified live. Gate:
  the PadLab manual smoke list (handoff §8) passes end to end, plus marble
  additions.
- **D — Show my beat.** Ghost-marble projection + toggle chip. Gate: edit a
  pattern step and watch the ghost marble appear/disappear live; switch
  A/B/C/D slots and the ghosts follow.
- **E (optional, only if the night has room)** — per-plate mute/solo, root
  note already covered by PadLab key, velocity-by-size.

## LOOKING gate (non-negotiable, project law)

Screenshot the Marble tab at 375×667 from where the player stands: plate
legible? marbles readable at phone size? phase dial visible? Then the worst
angle on purpose: max zoom-out, max tilt, 6 plates × dense marbles — name
three things wrong in the image before Stephen does. "Wired" is not "seen".

## Traps carried over (both handoffs + repo law)

- PadLab: never move visual flashes out of time-gated rendering (uiQ
  principle); marble splash rings already render time-based in rAF — keep.
- PadLab: every `.stop()`/`.disconnect()` in try/catch; every added state key
  touches the trio; no alert(), toasts only.
- Marblebeat: painter sort fine <500 marbles; iOS audio unlock = PadLab splash
  already handles it (delete MB's own unlock).
- Repo: 48px touch targets measured RENDERED at 375px; visualViewport not
  innerHeight; commit AND push after every phase gate.
