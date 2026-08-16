# HANDOFF — MARBLEBEAT v3

Marble-drop polyrhythm sequencer. Single-file vanilla HTML/CSS/JS (Google Fonts only). Target: merge into Stephen's music studio project in Codespace.

## Concept

- Isometric plates. Marble bounces forever at constant height. **Height = note length** (5 shelves: 1/16 → 1 bar, `SHELF_H` world units). **Color = pitch class** (hue = semi%12 × 30; C is always the same hue in every scale).
- **Phase offset** (v3): each marble has `phase ∈ [0,1)` of its period. Hits at `startT + (k + phase) * T`. This is what makes it a sequencer, not a polyrhythm toy — snare on 2&4, off-beat hats, etc.
- **Multiple plates** (v3): `plates[]` of world-grid rects `{x0,y0,w,h}` (16×16 each, up to 6, laid out left-to-right with a 3-cell gap). All plates share one transport, so they're always in sync — plates are effectively tracks/sections.

## v3 mechanics

- **Phase drag**: drag a marble horizontally → shifts its phase, snapped to sixteenths (`PHASE_SNAP_BEATS = 0.25`), 110 px/beat sensitivity, wraps within period. Live re-quantize during playback (`m.reset` → `requant()`). Phase dial (small circle + brass dot at column top) renders for any marble with nonzero offset or when selected; selInfo shows "+3/16" / "+1 beat" style labels.
- **Camera**: `yaw` (orbit), `tilt` (0.18 side-on … 0.92 top-down), `zoom` (0.3–2.4), `panX/panY`. Gestures: 1-finger drag = pan, drag-on-marble = phase, 2-finger = orbit + tilt + pinch zoom, wheel = zoom, right/ctrl-drag = orbit on desktop. 7 px threshold distinguishes tap from drag.
- **Perf**: plate layer rendered to an offscreen cache canvas, invalidated only on camera change (`camDirty`); per-cell screen culling. Marbles drawn per-frame on top with offscreen culling. Handles 6 × 256 cells fine on mobile.

## Architecture map (marblebeat.html)

MODEL → AUDIO (Web Audio synth, shared noise buffer, compressor) → TRANSPORT (lookahead scheduler 120 ms/25 ms, phase-aware `requant`) → CAMERA (iso projection about world center + exact inverse `unproj`) → RENDER (rAF, cached plate layer, painter-sorted marbles, splash rings, phase dials, shelf rulers) → INPUT (pointer-map gesture state machine) → UI (chip rows: scale / instrument / shelf / pitch; selected-marble live editing).

Marble: `{gx, gy, type, shelf, semi, phase, next, lastHit, reset}` — world coords, plate membership implicit.

## Studio-merge seams

1. **Transport**: swap `startT`/`beatSec()`/`setInterval` for studio master clock; all timing flows through `schedule()` + `playHit(m, t)` at absolute AudioContext times.
2. **Audio routing**: single `master` GainNode → reconnect into studio mixer channel.
3. **Instruments**: `playHit` is a switch on `m.type`; swap branches for studio samplers, keep `(marble, time)` signature.
4. **Serialization**: `{bpm, scale, plates, marbles:[{gx,gy,type,shelf,semi,phase}]}` — strip runtime fields.
5. **MIDI/offline export**: hit times fully deterministic: for each marble, `(k + phase) * T` per loop; semi → MIDI note 60+semi, drums → ch10.

## Backlog

- Per-plate mute/solo (plates-as-tracks becomes real mixing).
- Drag marble to a different cell (currently placement is fixed; phase drag owns the gesture — consider long-press-then-drag to move).
- Root note selector (root hardcoded C); swing; velocity (marble size).
- Pattern chaining: plates as song sections with a playhead traveling plate-to-plate.
- Save/share via URL hash; PWA shell (manifest + SW, Stephen's standard).
- Sunbeams hook if it ships under Lucid Winds.

## Known issues

- Shelf rulers pinned to left margin track panY but approximate the plate plane; drift at extreme tilt is cosmetic.
- Phase drag is horizontal-only; a vertical component is ignored (reserved for future move-marble gesture).
- Pause → Play restarts loop at bar zero (intentional).
- Painter sort is per-frame O(n log n); fine below ~500 marbles.
- iOS AudioContext unlock handled on first gesture.
