# Swell build notes

The design is `docs/handoffs-uploaded/six-20260905/6handoffs/HANDOFF-SWELL.md`, the plan is
`plans/swell/HANDOFF-SWELL.md`, and every choice this build made that neither of them made is in
`docs/DECISIONS.md`.

## The one command

```
node tools/check.js          everything
node tools/check.js --fast   skips hold and layout and SAYS so
```

| gate | what it is | watched to fail by |
|---|---|---|
| `lint` | the studio laws against the shipped file | a dash in a line of copy |
| `theory` | 110 assertions over the harmony, the grid, the layering, the touch rules, the ambient policy and the sleep timer, run in Node with no AudioContext | an edge weight that does not sum to one; the tension bias removed; the voices choosing independently again |
| `render` | one swell rendered through an OfflineAudioContext and measured: the response, the crescendo over one second windows, the ceiling, the tail, the chord log, the oscillator budget. It writes `docs/shots/p0-swell.wav` | the first note's attack at two seconds; the ceiling gain at three; cadences that do not return to the tonic |
| `hold` | the real page, real pointer events, a real AudioContext: no context before the first touch, the orchestra in order, resolve and idle, a hit against a hold, the chrome rule, and the frame loop STOPPING after silence | the horns before the violins; the frame loop never stopping; the audio context opened at boot |
| `record` | REC to a real Blob, its type, its name, the sheet, which path it takes and whether it says so, and the video toggle | the Blob read on `stop()` instead of in `onstop`; the app not saying which way the file went |
| `layout` | every button at 375, 320, 412 and 667x375 landscape, the music pill's seat, nothing hanging off a sheet, and the chrome rule as a gate | `.btn.small` at 40 px; the chrome never hushing; REC parked in the pill's seat |

`tools/shots.mjs` also measures the battery rule at every width and fails if the frame loop is still
running a second after silence.

## What the gates and the ear caught

1. **Voice leading collapsed to a unison** inside four chords, and the plan's own assertion could not
   see it, because a unison is the smallest possible move. Reading `sim.js --walk` found it.
2. **Gestures were immediate, not scheduled.** A release scheduled for six seconds fired the moment
   it was queued. Ambient mode had the same bug waiting in it.
3. **The response to a press was silence**, 78 dB down at fifty milliseconds.
4. **The crescendo only got brighter**, so it dipped across a chord change.
5. **The aurora was a striped rectangle** filling the whole screen.
6. **The aurora went black on release** while five seconds of cadence were still sounding.
7. **Three 404s on every boot** from probing for art that does not exist.
8. **A line of broken copy** on the mood picker, and a filled amber slab louder than START.
9. And the render gate itself was **measuring the wrong window**.

## Numbers that moved

| key | plan | shipped | why |
|---|---|---|---|
| the first note's attack | 0.35 s | 0.04 s for the first, 0.35 after | the response |
| the strings' layer curve | smoothstep | `u^0.35` | the response |
| section gains | not specified | roughly 2.2x the first pass | a third of the headroom was unused |
| the master swell | not specified | 0.55 to 1.0 with intensity | the crescendo dipped |
| the WAV | not specified | mono | 2.4 MB stereo against a 1.5 MB cap |
| `VIDEO_CAP_S` | new | 30 | a recording that runs until the phone fills up is not a keepsake |

## What is not built

- **Tilt is wired but unproven.** The toggle asks the phone for permission and the beta angle moves
  the filter, and no gate can test it: a headless browser has no gyroscope. It is off by default.
- **The mood plates.** Behind `art/plates.json`, which ships empty.
- **A second aurora idea.** The particles the design mentions rising on crescendo and falling on the
  resolving chord are not built; the curtains carry it.
- **The Penny mode consideration.** The design answers it itself: the whole app is already safe.

## The one thing only a phone can test

An `AudioContext` created before the first gesture stays suspended on iOS and on Chrome, and every
scheduled note lands in silence with no error at all. The engine is opened inside `pointerdown` for
exactly this reason, and the `hold` gate asserts that no context exists before the first touch. But
the gates run under `--autoplay-policy=no-user-gesture-required`, which a phone does not have, so no
gate here can see that class of bug. That is what the phone test in the plan's section 11 is for.
