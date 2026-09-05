# HANDOFF SWELL, the build plan for one Opus night

**Written:** 2026-09-05 evening, by Fable, from `docs/handoffs-uploaded/six-20260905/6handoffs/HANDOFF-SWELL.md` (Stephen's
design, read in full) plus the fleet on branch `add-sproing-jumper` tonight.
**Reads before this one:** `HANDOFF-OPUS-NIGHT-SEP05.md` (the spine), then this file, then the design. Where they differ,
this file wins; every difference is in section 3 with its reason.
**Game folder:** `satellites/swell/` (slug free, checked 2026-09-05). **Live URL when Fable lists it:**
`lucidwinds.com/satellites/swell/`.

---

## SESSION STATE (the builder updates this at the end of every session; the morning reader starts here)

- 2026-09-05 Fable: plan written. Nothing built. Next action: section 5, P0, step 1.

---

## 0. RULES OF ENGAGEMENT

Identical to `plans/fathom/HANDOFF-FATHOM.md` section 0 with `swell` for `fathom`: the fence is `satellites/swell/**` plus
this file's ledger; fenced `git add`, never `-A`; rebase before every push; never push main; no dashes or exclamation points
in player copy; 48 px rendered buttons proved by `elementFromPoint`; Sky Wolf Studio singular; `.js` at runtime; `?v=` on
every URL with `sw.js` bumped in lockstep; text 0.7 rem or larger; LOOKING IS PART OF THE JOB; never wait on a human.

One law particular to Swell: **musical time is the AudioContext clock.** `setTimeout` and `requestAnimationFrame` may draw and
may poll, they may never place a note. The scheduler in section 4 is the only thing that schedules sound.

---

## 1. WHAT SWELL IS, AND WHY IT IS WORTH A NIGHT

From the design: *"Touch the screen and hold: an orchestra swells out of silence, strings first, then horns lean in, then a
choir opens above them, the harmony quietly moving underneath your finger. Release: everything resolves, beautifully, always.
You cannot play a wrong note. You are not playing notes at all. You are conducting dynamics, and the app handles the music
theory."* Positioning line: **"You can't play a wrong note. You can only conduct."**

Why it is worth a night: the design's market read is sound (Bloom is taps, Blob Opera is drags, Incredibox is layers; none of
them is about how loud, how full and when to let go). The product is one gesture with an emotional arc, which is exactly the
kind of thing a phone screen recording sells. It has no art dependency (the aurora is generated) and no data dependency. Its
risk is entirely in feel, and feel is tunable in data (section 4), so a night that lands the P0 gate has a product even if
nothing after it lands. Stephen is a music producer; this one is for his ear in the morning.

---

## 2. STATE OF THE INHERITANCE (verified by Fable 2026-09-05; trust this over any doc)

| Need | Copy from | What to take |
|---|---|---|
| Master chain, limiter, procedural hall, recording tap | `satellites/blockspace/index.html` lines 833 to 838 | `createDynamicsCompressor` as the limiter (threshold -8, knee 10, ratio 14, attack 0.003), a dry and wet bus, `createConvolver` with `this.impulse(seconds)` (a decaying noise buffer, no file), `createMediaStreamDestination` hung off the master for the recorder |
| Recorder with mime fallback | `satellites/blockspace/index.html` lines 1090 to 1095 | `MediaRecorder.isTypeSupported` over a list; audio only for the slice: `['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm']`; the canvas `captureStream(30)` plus the audio track for video in P3 |
| Save or share a blob on a phone | `satellites/attic/index.html` lines 1446 to 1466 | `new File`, `navigator.canShare({files})`, `navigator.share`, else download |
| Headless audio gate | `satellites/keepsies/test/audio_budget.mjs` | Renders through `OfflineAudioContext` in headless Chrome with `--autoplay-policy=no-user-gesture-required`; asserts real energy, the limiter holds, the voice count is bounded. Swell's `test/render.mjs` (section 5) is this file's shape |
| Multi pointer bookkeeping | `satellites/abduct-a-chameleon/index.html` `pointers` Map (roles per pointer id), 1264 (`blur` clears all), 1428 (release only the pointer that ended) | A finger is `{id, x, y, born, section}`; the section is assigned by arrival order; `pointercancel` is a release |
| Wake lock | `index.html` at the repo root uses `navigator.wakeLock` | Feature detect, request on entering Ambient, re-request on `visibilitychange` to visible, release on leaving |
| Tilt permission | `index.html` at the repo root uses `DeviceOrientationEvent` | On iOS `DeviceOrientationEvent.requestPermission()` must be called from a tap; the Tilt toggle in Settings is that tap. The portal frame allows `accelerometer; gyroscope; autoplay` (`portal/index.html` line 956) so tilt and sound work framed |
| Scaffold, RNG, page tests, `sim.js`, `sw.js`, manifest, icons, portal protocol, music hook, gate runner, browser gate shape, thumb and icon tools | as listed in `plans/fathom/HANDOFF-FATHOM.md` section 2 | Same files, `swell` in place of `fathom` |
| Silence handshake | `portal/index.html` line 2890 | Swell posts `{ sws: 'game-music', on: true }` at the first hold, because it is the music |

Not inherited, on purpose: no Tone.js or any audio library (the design says none and the fleet has none), no samples, no
three.js.

---

## 3. CORRECTIONS TO THE DESIGN (binding; each forced by a measurement or a fleet law)

3.1 **Studio and deploy.** Sky Wolf Studio. Hostinger from `main`, pushed by Fable.

3.2 **The theory is written down here, not invented at night.** The design describes chord graphs, tension, voice leading and
cadences in prose. Section 4 gives the three moods as data with every weight, the tension bias as a formula, the voice leading
rule, and the cadence rule, so the harmonic engine is transcription. A number that sounds wrong changes in the mood data and is
logged; the structure does not change tonight.

3.3 **A voice is a note of a section; the budget is oscillators.** The design's "24 voices" is ambiguous. `OSC_MAX 48` is the
frozen cap on simultaneously running oscillators plus noise sources, counted by the engine and asserted by the render gate; a
new note that would exceed it steals the quietest note of its own section.

3.4 **Both orientations.** The design recommends both; taken. The canvas is full bleed either way; the mood picker lays its
three cards in a column under 600 px wide and a row above.

3.5 **Recording is download immediately, audio only, in the slice.** The design recommends it; taken. Nothing is stored;
the share sheet gets a File; the filename is `swell-<mood>-<yyyymmdd-hhmm>.<ext>`. Video with the aurora is P3.

3.6 **Lullaby and the sleep timer ship in the slice.** The design recommends it; taken. The honest line under Ambient is the
design's own: "Keeps playing while this screen stays on."

3.7 **Pressure is a bonus, never a requirement.** `PointerEvent.pressure` and `width` map to a 0.7 to 1.3 multiplier on
intensity where a device reports them (most Android phones report width, few report pressure); the time only path is the
product.

3.8 **Tilt is opt in.** Off until the Tilt toggle is tapped (iOS permission, 2 above). When on: the beta angle from the
resting orientation, clamped to plus or minus 30 degrees, maps to the filter brightness offset. Never on boot.

3.9 **No UI during play means no UI, except the fleet's.** The mood chip, the record button and the menu fade out on touch and
in after 2 s of stillness. The music chip and pill belong to the fleet and stay where the fleet puts them; the bottom left
120x120 is theirs.

3.10 **Quick taps are hits only under 180 ms.** A pointer down and up inside 180 ms is a staccato hit quantised to the next
eighth; longer is a hold. This is the same slop family as Fathom's rule and it is asserted.

3.11 **The aurora draws only while there is sound.** When every section's intensity is under 0.01 for 2 s and no finger is
down, the frame loop stops (no `requestAnimationFrame`), which is the battery pass the design asks for in step 8, made a rule
in step 1.

3.12 **Copy.** No dashes, no exclamation points. Mood names: Dawn, Storm, Lullaby. The first boot line: "Hold anywhere. Let go
when it feels right."

---

## 4. ARCHITECTURE LAW

Files (all inside `satellites/swell/`):

```
index.html            the app
sim.js                --test (the theory, headless), --walk=<mood>,<seeds> (prints chord walks for reading)
sw.js  manifest.webmanifest  icon-192.png  icon-512.png  icon-maskable-512.png
tools/check.js  tools/icons.mjs  tools/thumb.mjs  tools/shots.mjs
test/render.mjs  test/hold.mjs  test/record.mjs  test/layout.mjs
docs/DECISIONS.md  docs/shots/  BUILD-NOTES.md  ART_ASSETS.md
```

Layers in `index.html`: `CONFIG, THEORY, MOODS, SCHEDULER, SYNTH, ENGINE, AURORA, INPUT, RECORD, AMBIENT, SAVE, TEST, BOOT`.
`THEORY_EXPORT` markers wrap CONFIG through ENGINE's pure part (the chord walk, the voice leading, the quantiser, the
layering curves) so `sim.js --test` runs them with no AudioContext.

**CONFIG (frozen):**

```
GAME_ID 'swell'  SAVE_KEY 'lw_swell_v1'  SAVE_V 1
OSC_MAX 48   TAP_MS 180   LOOKAHEAD_S 0.1   TICK_MS 25
HOLD_STRINGS [0, 0.5]  HOLD_VIOLINS [0.5, 3]  HOLD_HORNS [3, 7]  HOLD_CHOIR [7, 10]  TIMP_ROLL_FROM 7
TENSION_FULL_S 12   RESOLVE_TAIL_S 5   STACCATO_S 0.25
FILTER_MIN 400  FILTER_MAX 4400  (Hz, cutoff = FILTER_MIN + (FILTER_MAX - FILTER_MIN) * intensity)
HALL_S 3.5  HALL_PREDELAY_S 0.02  HALL_WET 0.28
IDLE_STOP_S 2   UI_FADE_S 2
AMBIENT_HOLD_S [4, 14]  AMBIENT_GAP_S [3, 9]   SLEEP_MIN [15, 30, 60]
```

**THEORY.** Pitch classes 0 to 11, octave 4 as the strings' home. A chord is `{name, pcs:[...], dist}` where `dist` is its
distance from the tonic for the tension walk. A mood is:

```
{ key, bpm, scale, chords: {name: {pcs, dist}}, start:'I', edges: {from: [[to, weight], ...]},
  cadence: { far: [pre, 'V', 'I'], near: ['V', 'I'], sigh: [plagal, 'I'] }, vowel:[oo, ah], colour:{...} }
```

The three launch moods, as data (pitch classes relative to C = 0):

- **Dawn**, C Lydian, 66 bpm. Chords: `I` [0,4,7,11] dist 0; `II` [2,6,9] dist 1; `V` [7,11,2] dist 1; `iii` [4,7,11] dist 2;
  `vi` [9,0,4] dist 2. Edges: I → II .35, vi .25, V .20, iii .20; II → I .40, V .30, vi .30; V → I .50, vi .30, iii .20;
  vi → II .40, V .30, I .30; iii → vi .50, II .30, I .20. Cadence far `['II','V','I']`, near `['V','I']`, sigh `['II','I']`.
- **Storm**, A minor, 72 bpm (relative to A = 0). Chords: `i` [0,3,7] 0; `VII` [10,2,5] 1; `V` [7,11,2] 1; `iv` [5,8,0] 2;
  `VI` [8,0,3] 2; `III` [3,7,10] 3. Edges: i → VI .30, iv .25, VII .25, III .20; VI → VII .35, III .35, iv .30; III → VII
  .40, VI .30, iv .30; VII → i .40, VI .30, III .30; iv → V .45, VII .30, i .25; V → i .70, VI .30. Cadence far
  `['iv','V','i']`, near `['V','i']`, sigh `['VI','i']`.
- **Lullaby**, C major pentatonic melody over triads, 58 bpm. Chords: `I` [0,4,7] 0; `IV` [5,9,0] 1; `Vsus` [7,0,2] 1;
  `vi` [9,0,4] 2; `ii` [2,5,9] 2. Edges: I → vi .35, IV .35, ii .30; vi → IV .50, ii .30, I .20; IV → I .50, Vsus .30, ii .20;
  ii → Vsus .50, IV .30, I .20; Vsus → I .80, vi .20. Cadence far `['ii','Vsus','I']`, near `['IV','I']`, sigh `['IV','I']`.

**The walk.** One chord per bar while held. From chord `c` with tension `t = clamp(holdSeconds / TENSION_FULL_S, 0, 1)`, each
edge weight becomes `w * (1 + 2 t * dist(to))`, normalised, drawn from the seeded stream (`mixSeed(sessionSeed, bar)`). The
walk never jumps to a chord that is not an edge.

**Voice leading.** Each section holds three voices. On a chord change each voice moves to the nearest pitch of the new chord
(minimum absolute semitone distance; a tie goes down); duplicates are allowed. TEST asserts no voice ever moves more than 6
semitones.

**Quantisation.** The beat grid is `60 / bpm` seconds; the eighth is half of it. A release at time `r` resolves starting at the
next eighth at or after `r + 0.02`. Chord changes land on bars. Staccato hits land on the next eighth.

**Resolution.** At release with the current chord at distance `d` and hold length `h`: `d >= 2` or `h > 8` → the far cadence
over two bars; `d == 1` → the near cadence over one bar; `d == 0` and `h < 1.5` → the sigh over one bar; `d == 0` and `h >= 1.5`
→ the near cadence. The last chord is always the tonic; the tail decays over `RESOLVE_TAIL_S` through the hall; a soft timpani
lands with the tonic.

**Layering by hold time** `t` (seconds since the first finger landed), each a smoothstep over its window from CONFIG: low
strings 0 to 0.5 (the attack ramp on the first note is 40 ms so the response is under 50 ms), violins 0.5 to 3, horns 3 to 7,
choir 7 to 10, the timpani roll from 7. `intensity = clamp(t / 10) * pressureMul` drives the filter cutoff and the choir vowel.

**SYNTH recipes** (the design's section 5, made exact enough to type):

- Strings: per note 4 sawtooth oscillators detuned by `[-9, -3, 4, 10]` cents through one lowpass (Q 0.7) with the cutoff
  above; attack 0.35 s, release 1.2 s; a chorus of two 18 ms and 27 ms delays modulated by 0.3 Hz LFOs at 2 ms depth.
- Violins: same, one octave up, 3 oscillators, attack 0.8 s.
- Horns: 2 sawtooth oscillators detuned 5 cents, attack 0.12 s with a 40 cent pitch scoop over the first 90 ms, a
  `WaveShaperNode` with a soft tanh curve whose drive follows intensity.
- Choir: 1 sawtooth plus 1 pulse (a square through a 0.5 offset blend) into two parallel bandpass filters at the formants,
  `oo` F1 300 F2 870 and `ah` F1 730 F2 1090 (Q 8), morphed by intensity (quiet is oo, loud is ah), 5.5 Hz vibrato at 8 cents.
- Flute and air: one sine at the top voice plus filtered noise (bandpass 1.8 kHz, Q 2) at gain `0.15 * (1 - intensity)`.
- Timpani: a 90 ms noise burst through a bandpass sweeping 400 to 90 Hz plus a sine thump at the tonic two octaves down, 0.5 s
  decay; the roll is hits every 90 ms with 15 ms jitter at gain 0.12.
- Hall: `createConvolver` with a generated stereo impulse: two independent noise channels, exponential decay to -60 dB at
  `HALL_S`, 20 ms of silence first; wet `HALL_WET`. One convolver for the whole app.
- Master: section gains → dry and wet → compressor (Blockspace's numbers) → a gain at 0.9 as the ceiling.

**SCHEDULER.** Chris Wilson's two clocks: a `setInterval` every `TICK_MS` looks `LOOKAHEAD_S` ahead on `ctx.currentTime` and
schedules every note on and gain ramp inside that window with `setValueAtTime` and `linearRampToValueAtTime`. Nothing else
touches an AudioParam.

**ENGINE.** State machine per session: `idle → held → resolving → idle`, plus `hit` events. Fingers: the first to land is
`strings` (and drives the whole layering clock); the second is `choir` (with the high strings); the third is `brass` (horns
early, regardless of the clock). A finger's `y` sets its section's register (top third up an octave, bottom third down), its `x`
sets its stereo pan through a `StereoPannerNode` per section. All of ENGINE's pure part (the walk, leading, quantiser, the
layering curves, the finger to section map) is inside the THEORY markers and runs headless.

**AURORA.** Canvas 2D. Per active section a light curtain at the finger's x (or the section's home x when ambient): vertical
gradient bands, height and alpha from the section's intensity, colour by section (strings amber `#E8B36A`, choir ice blue
`#A8D8F0`, brass gold `#F2D06B`, timpani deep red pulses at the floor `#8C2F39`), the whole palette warmed by tension and washed
cool on resolution, particles rising on crescendo and falling on the resolving chord. Reads engine state only. Stops per 3.11.
Under reduced motion the particles are off and the curtains do not shimmer.

**INPUT.** Pointer events, `touch-action: none`. Section 3.10 for taps. `pointercancel` and `blur` release everything.

**RECORD.** Section 3.5.

**AMBIENT.** A policy in the pure part: holds of `AMBIENT_HOLD_S` and gaps of `AMBIENT_GAP_S` from the seeded stream, one to
two virtual fingers, register drifting slowly; the screen dims to embers (the aurora at 30 percent); the wake lock; the sleep
timer fades the master over the last 60 s and stops.

**SAVE.** `lw_swell_v1`: `{v, mood, tilt, motion, seen:{how}}`. Read, modify, write.

**TEST.** Deepwell's harness; assertion floor 60.

---

## 5. THE PHASES, WITH GATES

Every gate is watched to fail once before it counts.

### P0. The theory and one swell (about 1.5 hours)

1. Scaffold. THEORY, MOODS, the walk, the leading, the quantiser, the layering curves, all pure.
2. `sim.js --test`: for each mood every edge list's weights sum to 1 within 0.001 and name existing chords; every chord
   reaches the tonic by the cadence rule in at most 3 steps; 1,000 seeded bars at tension 1 average a greater `dist` than 1,000 at
   tension 0; the walk never leaves the edge set; voice leading never moves a voice more than 6 semitones over 1,000 random
   changes; a release at beat phase 0.3 quantises to the next eighth; a 100 ms pointer is a hit and a 200 ms pointer is a hold;
   the layering curve gives strings 1.0 by 0.5 s, violins 0 at 0.5 s and 1.0 at 3 s, choir 0 before 7 s; the same session seed
   walks the same chords.
3. SYNTH strings only, the hall, the master, the SCHEDULER, and ENGINE for one finger on a hardcoded `I V I`.
4. `test/render.mjs` (browser, `OfflineAudioContext` at 44.1 kHz, 14 s): the page's engine is driven through its real input
   handler with synthetic pointer events (a `pointerdown` at 0.2 s on the canvas, `pointerup` at 6.2 s) while the page renders
   offline; asserts: RMS over 0.25 to 0.30 s is above -40 dBFS (sub 50 ms response); RMS over each of the windows 1, 2, 3, 4, 5
   and 6 s is at least 0.95 times the previous window (it swells and never dips); the peak sample is under 0.99 (the ceiling
   holds); RMS at 11 to 12 s is under 10 percent of the peak window (the tail lets go); the engine's chord log ends on the tonic;
   the oscillator count never exceeded `OSC_MAX` (count through a wrapped `createOscillator`). Watch it fail: set the strings'
   attack to 2 s and the first assertion goes red; set the ceiling gain to 3 and the peak goes red.
5. **Stop and feel test.** You cannot hear. Do the next best thing: render the same 14 s to a WAV in `docs/shots/p0-swell.wav`
   (the offline buffer written as 16 bit PCM), keep it under 1.5 MB, and write in the ledger what its envelope looks like in
   numbers (RMS per half second). Stephen listens in the morning; the WAV is the shot.

### P1. The whole orchestra under one finger (about 2 hours)

1. Violins, horns, choir with the formant morph, flute and air, timpani and the roll, the layering clock, the resolution rule
   with the far, near and sigh cadences, the staccato hit.
2. The aurora for one section, the UI fade, the first boot line.
3. `test/hold.mjs` (browser, real pointer events on the canvas, online AudioContext under the autoplay flag): a hold of 8 s
   moves the engine through `held` with section intensities in the order strings, violins, horns, choir (each crosses 0.5 later
   than the last); release moves it to `resolving` and then `idle` within 3 s plus the tail; a 100 ms tap logs a `hit` on an
   eighth; the frame loop is stopped 2 s after silence (no `requestAnimationFrame` callback for 1 s, measured by wrapping it).
4. `docs/shots/p1-swell.png` mid hold at 375x667 and `p1-resolve.png` a second after release. Open them. If the curtain reads
   as a gradient rectangle rather than as light, fix the band count and the noise before P2.

### P2. Hands, moods, ambient, the record button (about 2.5 hours)

1. Multi touch: the second and third fingers, register by y, pan by x, pressure where reported.
2. The three moods and the mood picker; the mood's palette in the aurora.
3. Ambient mode with the wake lock and the sleep timer; the honest line.
4. Recording: the MediaRecorder tap, the mime list, the File and share sheet, the download fallback.
5. `sim.js --test` grows: the ambient policy over 600 simulated seconds produces at least 20 holds inside the configured
   windows and never two at once per virtual finger; the sleep timer at 15 min reaches master gain 0 at 15:00 and not before
   14:00.
6. `test/record.mjs` (browser): a 3 s hold while recording yields a Blob over 20 KB whose type is in the mime list; the sheet
   offers it through the share path or the download path and says which.
7. `test/layout.mjs`: every button 48 px rendered at 375x667 and at 667x375, `elementFromPoint` at centre; the mood cards; the
   bottom left 120x120 empty; the UI hidden 0.5 s after a touch and visible 2.5 s after the last.

Ends with `p2-two-fingers.png`, `p2-moods.png`, `p2-ambient.png` (portrait) and `p2-landscape.png`.

### P3. Tilt, video, the battery, the plates (about 2 hours; where a night may stop)

1. Tilt behind the toggle and the permission call.
2. Video export: `captureStream(30)` plus the audio track (Blockspace 1090 to 1095), 30 s cap, the same share path.
3. The battery pass measured: `tools/shots.mjs` records whether `requestAnimationFrame` is idle after silence at every width;
   the sweep at 412x915, 375x667, 320x568 and 915x412.
4. `tools/thumb.mjs` (mid swell, two curtains), `ART_ASSETS.md`, `BUILD-NOTES.md`, the morning report.

---

## 6. THE SCREENS (one hand; 48 px rendered at 375 wide and at 667 wide)

- **Podium (home).** Black. Nothing while touching. After 2 s still: mood chip top left (48 px tall, the mood name), menu top
  right (48 px: Ambient, Settings, About), REC bottom right (56 px round, red ring while recording with the elapsed seconds).
  First boot: the one line and nothing else; it fades on the first hold.
- **Mood picker.** Three cards 72 px tall (a column under 600 px wide, a row above): Dawn, Storm, Lullaby, each with one line
  ("warm, wide, a film's first morning" / "low pulse, brass, weather coming" / "a music box and soft strings for the end of
  the day"). The painted plates from section 7 sit behind the names if delivered.
- **Ambient.** START (56 px), the sleep timer (15, 30, 60, Off as 48 px segments), the honest line, BACK.
- **Settings.** Sound test (plays one swell), Tilt (requests permission on tap), Motion, About: the positioning line, "Sky
  Wolf Studio".
- **Saved sheet.** After a recording: the filename, SHARE (56 px) or SAVE, DONE.

One page; `ready` once.

---

## 7. ART (what Stephen can make this month; the app never waits on it)

Four sheets in `plans/swell/ART-PACK-SWELL.md` (a copy in 012Assets as `Swell — Art Pack`): three mood plates (Dawn, Storm,
Lullaby, 4:3) behind the picker cards, and an icon mark. The aurora is generated and stays generated.

| File | Used for | Delivered | In game |
|---|---|---|---|
| `mood-dawn.png`, `mood-storm.png`, `mood-lullaby.png` | behind the three picker cards at 45 percent | 4:3 | `art/mood-<name>.jpg` 1200x900 q80 |
| `icon-mark.png` | PWA icon and favicon, if better than the drawn one | 1:1 | 512, 192, maskable 512 |

---

## 8. LISTING ON THE ARCADE (Fable does the portal edit)

```
{nm:"Swell", ds:"Hold the screen and an orchestra swells out of silence. Let go and it resolves, always. You cannot play a wrong note. You can only conduct.", cat:"creative", url:"/satellites/swell/?v=<stamp>", ic:"🎻", thumb:"/portal-assets/thumbs/swell.png", beta:true, fresh:true}
```

Must be true first: thumb under 150 KB; the live URL answers with the stamp; ALL GATES PASSED; `test/hold.mjs` passed with
real pointers; `docs/shots/p0-swell.wav` exists and Stephen has been told to listen to it; the shots were opened.

---

## 9. PITFALLS (studio scars that apply here, learn them free)

- Everything in `plans/fathom/HANDOFF-FATHOM.md` section 9.
- An `AudioContext` created before the first gesture stays suspended on iOS and Chrome and every scheduled note lands in
  silence with no error. Create and `resume()` inside the first `pointerdown`; the gate under the autoplay flag cannot see this
  bug, so the phone test can.
- `linearRampToValueAtTime` ramps from the last scheduled event, not from now; always `setValueAtTime(current, now)` first or
  the swell jumps.
- A gain that ramps to exactly 0 then `exponentialRampToValueAtTime` throws; use linear ramps to 0 or ramp to 0.0001.
- Oscillators are single use. A pool that restarts a stopped oscillator throws; the pool holds gains and filters, oscillators
  are created per note and counted.
- The convolver's impulse is built once. Rebuilding it per mood is a 3.5 s buffer allocation on the main thread; moods share
  the hall and change only the wet amount.
- The recorder's Blob arrives in `onstop`, not on `stop()`; the share sheet must wait for it. A `File` with an empty type is
  refused by `canShare` on some phones; pass the mime you recorded with.
- Two fingers landing within one frame arrive as two `pointerdown` events with different ids; never assume the first one is
  still down.
- The wake lock is released by the system when the tab hides; re-request on `visibilitychange`. The honest line stays honest.
- A screen recording is the marketing: nothing on the podium may say beta, debug or test in any mode.

---

## 10. DECISION RIGHTS AND OPEN QUESTIONS

The design's four open questions take these answers tonight:

1. **Name: SWELL.** Stephen's folder and title; the collision worry (a common word) and the alternates (Tutti, Maestro,
   Crescendo, Holdfast) stay in the morning report as his call.
2. **Both orientations.** Section 3.4.
3. **Recording: download immediately.** Section 3.5.
4. **Lullaby and the sleep timer: in the slice.** Section 3.6.

Yours without asking: every synth number inside the recipes, the exact aurora look inside the palette, the ambient policy's
feel, the picker copy inside the no dash law.

Stephen's, never guessed: price, store, the name, any collaboration mention (the design names a friend's audience; nothing in
the app refers to it), anything with money.

---

## 11. STEPHEN ONLY

Listen to `docs/shots/p0-swell.wav` in the morning before anything else; that is the whole review. Then the phone: one finger,
three fingers, a quick tap, Storm, Lullaby with the 15 minute timer, one recording shared to Jessie. The mood plates when the
Midjourney month allows.

---

## 12. HONEST SIZING

One Opus on two cores. P0 about 1.5 h, P1 about 2 h, P2 about 2.5 h, P3 about 2 h: about 8 hours to the end of P3. Expect
3,500 to 4,500 lines. **Where a single night stops well:** the end of P2 step 2 (three moods under three fingers with the
aurora) is a complete toy; ambient and recording are what make it a product and can be the next session. If the clock says P1
cannot finish, land the choir and the resolution rule before the aurora; the sound is the product and the light is its
photograph.

---

## 13. EVIDENCE LEDGER (fill in place, with commands and their real output, most recent last)

```
(empty; the first entry is P0 step 4, the render gate watched to fail twice, and the p0-swell.wav envelope numbers)
```

---

## 14. THE OVERNIGHT PROTOCOL

As `plans/fathom/HANDOFF-FATHOM.md` section 14, with `P0, P1, P2, P3` of this file and the browser gates `render, hold,
record, layout`.

---

## 15. THE MORNING REPORT

The template in `plans/fathom/HANDOFF-FATHOM.md` section 15, with this file's phases. Add one line: **Listen to:** the path of
the WAV and its envelope in numbers.
