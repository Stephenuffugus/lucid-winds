# HANDOFF SWELL, the build plan for one Opus night

**Written:** 2026-09-05 evening, by Fable, from `docs/handoffs-uploaded/six-20260905/6handoffs/HANDOFF-SWELL.md` (Stephen's
design, read in full) plus the fleet on branch `add-sproing-jumper` tonight.
**Reads before this one:** `HANDOFF-OPUS-NIGHT-SEP05.md` (the spine), then this file, then the design. Where they differ,
this file wins; every difference is in section 3 with its reason.
**Game folder:** `satellites/swell/` (slug free, checked 2026-09-05). **Live URL when Fable lists it:**
`lucidwinds.com/satellites/swell/`.

---

## SESSION STATE (the builder updates this at the end of every session; the morning reader starts here)

- 2026-09-15, Opus (lane B7): **T2.11 IS DONE: TIDE AND PROCESSION ARE IN THE PICKER.** Stamp `20260915a`
  (index.html five places, sw.js, the portal row). ALL GATES PASSED, seven of seven, on the final page. Two moods as
  data in `MOODS`: Tide, D dorian at 52 bpm, never V to i; Procession, C minor at 84 bpm, landing `iv V i`. Measured by
  the ear gate at the level of the three and rendered to `docs/shots/p0-tide.wav` and `p0-procession.wav`. Three laws
  that typed three moods now read the page's `MOOD_ORDER`, each watched red on a folder copy.
  ⛔ **Two more cards broke the landscape picker** (60 px wide in one equal row; the widened layout gate caught it),
  and ⛔ **the first fix was green and wrong**: a `style` attribute's 340 px beat the media rule, so the cards stacked in
  one column and BACK fell 100 px under the fold. No gate asks where BACK is; a probe did. Two columns now, BACK on the
  screen at 667x375. Procession's late choir is NOT built (the engine voices every mood alike; a voicing field is more
  than data). Ledger: section 13, "B7, 2026-09-15".
  **Next action:** nothing here is half built. Stephen's ear on Tide and Procession (the wavs are in `docs/shots/`).
  Before a sixth mood, write the law that holds the picker's BACK on a 375 px tall landscape screen.

- 2026-09-07 night, Opus (lead): **THE MOTES WERE BUILT, MEASURED AND TAKEN OUT AGAIN.** Stamp
  `20260907c`, ALL GATES PASSED, seven of seven.
  The look pass said a still of the swell and a still of the resolve are almost identical and the
  only clue to which sections sound is a shade of blue, so motes were added to carry it: one stream
  per section, the choir's rising highest. **Then the top forty percent of the screen was measured
  with them and without: 832 lit pixels either way when the choir comes in, and 0 either way before
  it.** The choir's own curtain already lights the top the instant it is in. Ninety drifting specks
  that duplicate a statement the render already makes are the exact thing the fleet's law forbids,
  so they came out. The reason is written into the file where they were.
  **What is LEFT is the assertion the game never had.** `SWELL_DEV.bandLight(y0, y1)` reads the
  light and its colour in a band, and `test/hold.mjs` says the top is dark before the choir (0), it
  carries the choir afterwards (1228), and it does so in the choir's own colour (1077 cool against
  0 warm). The picture had been making that promise since the game was built and every assertion in
  the file was about the sound. Red both ways: choir curtain no taller than the rest, and every
  section in one colour.
  **Next action:** two more moods for his ear (T2.11) are not started. His ear on the three that
  exist is still the largest unknown in this game.

- 2026-09-05 Fable: plan written. Nothing built.
- 2026-09-05 Opus: P0 step 1, the gate red with no `sim.js` to run, pasted in section 13.
- 2026-09-05 Opus: **DONE P3.** P0, P1, P2 and P3 built and green. Seven gates in `tools/check.js`, every one watched to
  fail, output in section 13. Five screenshots and one WAV opened and three faults named in each.
  The app is playable end to end by a real thumb: hold to swell, let go to resolve, three fingers for three sections,
  three moods, ambient with the wake lock and a sleep timer, a recording of the sound or of the sound and the light,
  and the frame loop stops when nothing is sounding, measured at all four sizes.
  **NOT BUILT, on purpose:** the mood plates (behind `art/plates.json`, which ships empty), the particles the design
  mentions, and an embedded font. **Wired but unproven:** tilt, because a headless browser has no gyroscope.
  **Next action for whoever opens this:** nothing is half finished. The open questions are in the morning report and
  the biggest of them is Stephen's ear.

- 2026-09-07 Opus (lead): **C2 IS DONE, AND ITS ANSWER IS YES.** Stamp `20260907a` in three
  places. `node tools/check.js` ALL GATES PASSED over the seven.
  The first line IS on a fresh save at all three sizes, fully on the screen at forty percent of
  the height: 412x915 top 339, 375x667 top 239, 320x568 top 200, opacity 0.72, and it reads.
  **What looking at it found instead:** a first arrival is a black rectangle with one line of
  text and a gold REC button, and the brightest thing on the screen is a control rather than the
  invitation. The floor breathes now, in the mood's own colour, until a hand has held it once.
  D-C2. ⛔ The first go at the glow was invisible at 0.055 alpha on #08070C, and the frame loop
  had to be told not to halt on it, because a resting glow that freezes two seconds in is a still
  picture. ⛔ And the assertion could not fail TWICE: it sat where the gate had already held the
  screen so it was reading the swell's own wash, and its loop check read `rafOn` before the idle
  stop could have run. Both fixed, both watched to fail. D-C2b.
  **Next action:** the top two fifths staying black THROUGH the swell is item 1 of the look pass
  and is his ear and eye, not mine. Nothing here is half built.

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
docs/DECISIONS.md  docs/shots/  docs/BUILD-NOTES.md  docs/ART_ASSETS.md
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

### P0 step 1, the gate that fails (2026-09-05)

```
$ node satellites/swell/tools/check.js
theory          FAIL  0s
--- theory (wanted: SWELL TEST OK) ---
Error: Cannot find module '/workspaces/lucid-winds/satellites/swell/sim.js'
1 GATE FAILED
```


---

### P0 steps 2 to 5, green (2026-09-05)

```
$ node satellites/swell/tools/check.js
lint            pass  0s
theory          pass  0s
render          pass  3s

ALL GATES PASSED

$ node sim.js --test
PASSED 110 / FAILED 0   (total 110)
SWELL TEST OK
```

### The swell itself, measured

```
$ node test/render.mjs
  ok    sound is there fifty milliseconds after the press: -35.4 dBFS
  ok    at one second it is a beginning, 24 percent of the loudest
  ok    it swells from one second to six and never dips (-27.9, -25.3, -24.8, -24.3, -21.4, -20.0 dBFS)
  ok    and it is much bigger at six seconds than at one (3.03 times)
  ok    the ceiling holds, the peak sample is 0.404
  ok    it lets go: eleven seconds in it is 4.5 percent of the loudest
  ok    and by fourteen it is gone, 0.00 percent
  ok    the harmony moved (I iii II V I)
  ok    and it ends on the tonic, which is the whole promise
  ok    the oscillator count never passed the budget: peak 30 of 48
  ok    docs/shots/p0-swell.wav written, 1206 KB
RENDER OK

  the envelope, RMS every half second in dBFS:
  0.0s  -55.7   0.5s  -33.3   1.0s  -30.4   1.5s  -26.6   2.0s  -26.3
  2.5s  -25.9   3.0s  -24.6   3.5s  -25.1   4.0s  -24.1   4.5s  -24.6
  5.0s  -22.4   5.5s  -20.7   6.0s  -20.2   6.5s  -20.6   7.0s  -22.4
  7.5s  -24.1   8.0s  -27.0   8.5s  -29.6   9.0s  -33.4   9.5s  -36.9
  10.0s -18.3   10.5s -38.5   11.0s -50.2   11.5s -61.4   12.0s -65.8
  12.5s -86.8   13.0s -110.7  13.5s -125.9
```

The spike at ten seconds is the timpani landing with the tonic at the end of the cadence, which is the design's own
instruction. **`docs/shots/p0-swell.wav` is the shot. Listen to it before reading anything else.**

### Watched to fail

```
$ (the first note's attack set to two seconds)
FAIL  sound is there fifty milliseconds after the press: -63.5 dBFS

$ (the ceiling gain set to three)
FAIL  the ceiling holds, the peak sample is 1.253

$ (the cadences pointed at vi instead of the tonic)
FAIL  dawn cadences reach the tonic in three or fewer: far does not end on the tonic, ...
FAIL  and it ends on the tonic, which is the whole promise

$ (an edge weight that does not sum to one)
FAIL  dawn edge weights all sum to one and name real chords: I weights sum to 1.100

$ (the tension bias removed)
FAIL  dawn wanders further from home under tension (1.06 against 1.06)

$ (the voices choosing their tones independently again)
FAIL  dawn never puts two voices on the same note   [expected 0, got 397]
```

### What the gates and the ear caught

```
1. VOICE LEADING COLLAPSED TO A UNISON. Nearest tone per voice, chosen
   independently, puts all three on one note inside four chords, and the plan's
   assertion, no voice moves more than six semitones, is perfectly happy about
   it: a unison is the smallest possible move. Reading eight bars of
   `sim.js --walk` found it. Four new assertions now cover what a unison passes.
2. chordPitches placed each pitch class at base plus pc mod twelve, which
   scrambled the voicing: Storm's tonic came out 57, 48, 52.
3. Without a register bound the stack crept out of the section over three
   hundred chords, one legal nearest tone at a time.
4. GESTURES WERE IMMEDIATE, NOT SCHEDULED. A release scheduled for six seconds
   fired the moment it was queued, so the render gate asked for a six second
   hold and got a flat envelope with only the strings in it. Ambient mode had
   the same bug waiting in it.
5. THE RESPONSE WAS SILENCE: 78 dB down fifty milliseconds after a press.
6. THE CRESCENDO ONLY GOT BRIGHTER, so it dipped across a chord change.
7. THREE 404s ON EVERY BOOT from probing for art that does not exist.
8. And the gate itself was measuring wrong: half second windows measure the
   beating between detuned voices as much as the crescendo.
```

### The whole suite, green (2026-09-05, end of the run)

```
$ node satellites/swell/tools/check.js
lint            pass  0s
theory          pass  0s
render          pass  3s
hold            pass  26s
record          pass  9s
layout          pass  30s
thumb           pass  11s

ALL GATES PASSED

$ node sim.js --test
PASSED 110 / FAILED 0   (total 110)

$ node tools/shots.mjs
the battery pass: 412x915 idle, 375x667 idle, 320x568 idle, 915x412 idle
11 shots, all under 200 KB
```

### The swell as it stands, which is what the WAV holds

```
  the envelope, RMS every half second in dBFS:
  0.0s  -35.3   0.5s  -31.1   1.0s  -30.0   1.5s  -25.9   2.0s  -25.7
  2.5s  -25.5   3.0s  -24.0   3.5s  -24.8   4.0s  -23.5   4.5s  -25.0
  5.0s  -22.6   5.5s  -20.0   6.0s  -20.2   6.5s  -18.9   7.0s  -20.5
  7.5s  -21.1   8.0s  -25.3   8.5s  -27.3   9.0s  -31.5   9.5s  -35.7
  10.0s -18.7   10.5s -39.0   11.0s -49.7   11.5s -61.1   12.0s -68.5
  12.5s -82.1   13.0s -101.6  13.5s -117.8
```

Sixteen decibels of crescendo from the press to the top of the hold, a peak sample of 0.404 against a ceiling of 0.9,
thirty oscillators against a budget of forty eight, and the spike at ten seconds is the timpani landing with the
tonic. **`docs/shots/p0-swell.wav` is the shot. Listen to it before reading anything else.**

### Every gate watched to fail

```
$ (an edge weight that does not sum to one)
FAIL  dawn edge weights all sum to one and name real chords: I weights sum to 1.100
$ (the tension bias removed)
FAIL  dawn wanders further from home under tension (1.06 against 1.06)
$ (the voices choosing their tones independently again)
FAIL  dawn never puts two voices on the same note   [expected 0, got 397]
$ (the first note's attack at two seconds)
FAIL  sound is there fifty milliseconds after the press: -63.5 dBFS
$ (the ceiling gain at three)
FAIL  the ceiling holds, the peak sample is 1.253
$ (cadences pointed at vi instead of the tonic)
FAIL  and it ends on the tonic, which is the whole promise
$ (the horns coming in before the violins)
FAIL  the orchestra arrives in order: strings, horns, violins, choir
$ (the frame loop never stopping)
FAIL  the frame loop stops when nothing is sounding, which is the battery rule
FAIL  and it really is stopped: no frames at all in a second (1971 then 2043)
$ (the audio context opened at boot)
FAIL  no audio context exists before the first touch
$ (the Blob read on stop() instead of in onstop)
FAIL  and it is a real recording, 0 KB
$ (the app not saying which way the file went)
FAIL  and it tells the player which way it went: ""
$ (.btn.small at 40 px)                       60 red lines across four sizes
$ (the chrome never getting out of the way)
FAIL  375x667  the chrome is out of the way half a second after a touch
$ (REC parked in the music pill's seat)
FAIL  375x667  the bottom left 120 by 120 is free for the music pill: btnRec at 14,593
```

### Nine things the gates and the ear caught

```
1. VOICE LEADING COLLAPSED TO A UNISON inside four chords, and the plan's own
   assertion could not see it: a unison is the smallest possible move.
2. GESTURES WERE IMMEDIATE, NOT SCHEDULED. A release scheduled for six seconds
   fired the moment it was queued; the render gate asked for a six second hold
   and got a flat envelope with only the strings in it. Ambient mode queues its
   whole night the same way and had exactly the same bug in it.
3. THE RESPONSE TO A PRESS WAS SILENCE, 78 dB down at fifty milliseconds.
4. THE CRESCENDO ONLY GOT BRIGHTER, so it dipped across a chord change.
5. THE AURORA WAS A STRIPED RECTANGLE filling the whole screen, which is the
   exact failure the plan names at P1 step 4.
6. THE AURORA WENT BLACK ON RELEASE while five seconds of cadence were still
   sounding: p1-resolve.png was a blank screen and the picture and the sound
   disagreed.
7. THREE 404s ON EVERY BOOT from probing for art that does not exist yet.
8. A LINE OF BROKEN COPY on the mood picker: "a film first morning".
9. A FILLED AMBER SLAB on the ambient screen, louder than START.
```

### B7, 2026-09-15, Opus: T2.11, two moods (Tide and Procession)

Baseline first, under the lock, on the tree as found (stamp `20260907c`): ALL GATES PASSED (lint, theory, render, hold,
record, layout, thumb and the rest). The row (HANDOFF-OPUS-SEP07-NIGHT T2.11): "two moods as DATA in the `MOODS` table
(Tide: a slow modal swell that never cadences hard; Procession: a march in the low strings with the choir late),
rendered ... at the same measured level as the three (peak and rms in the ledger), shipped in the picker". The first
half of that row, the motes, was done before this run. DECISIONS, "T2.11, two moods".
**Proved in a scratch copy of the satellite before a line of the real file changed:** the two moods and the two
widened laws gave `node sim.js --test` "PASSED 144 / FAILED 0" and `tools/lint.mjs` LINT OK; `node sim.js --walk`
printed Tide wandering `i IV v IV v III IV v ...` and coming home `IV VII i`, never V to i, and Procession stepping `i iv
VI iv V VI ...` and landing `iv V i`. The scratch ear gate, looping over the page's `MOOD_ORDER` under the lock:
```
  measured dawn: peak 0.395, rms 0.0558, above 3 kHz 1.27 percent
  measured storm: peak 0.383, rms 0.0558, above 3 kHz 2.01 percent
  measured lullaby: peak 0.419, rms 0.0592, above 3 kHz 1.45 percent
  measured tide: peak 0.346, rms 0.0549, above 3 kHz 1.34 percent
  measured procession: peak 0.417, rms 0.0595, above 3 kHz 1.26 percent
```
Both new moods inside the bands the gate holds every mood to (peak under 0.85, rms 0.02 to 0.12, under 3 percent above
3 kHz), and at the level of the three: the row's "same measured level". (The scratch copy's one red, a 404 on the
console, was its own missing root scripts, which the real tree serves.)
**On the real tree:** stamp `20260915a` (index.html five places, sw.js, the portal row); sim 144 of 144, lint green.
**Three laws that typed the moods, moved to the law behind them:** the sim's `there are three moods` (`=== 3`) is now
"the picker lists every mood exactly once"; the sim's names law reads the plan's five in order; `test/layout.mjs`
checks every card and every name the page's `MOOD_ORDER` makes rather than three typed into it; `test/render.mjs`
loops its ear gate over `MOOD_ORDER` and writes `p0-tide.wav` and `p0-procession.wav`.
**Watched red, and a false first attempt recorded so nobody repeats it:** the first two sim reds were run as
`SWELL_HTML=<copy> node sim.js --test` and came back "PASSED 144 / FAILED 0" both times, because this game's
`sim.js` reads `index.html` beside itself and has NO path override: the copies were never read. Rerun from folder
copies of the satellite, each with its planted page:
```
Procession dropped from MOOD_ORDER (still in MOODS):
  FAIL  the picker lists every mood exactly once (dawn, storm, lullaby, tide)
  FAIL  the moods are named as the plan names them   [expected Dawn,Storm,Lullaby,Tide,Procession, got Dawn,Storm,Lullaby,Tide]
  PASSED 142 / FAILED 2
Tide and Procession swapped in MOOD_ORDER:
  FAIL  the moods are named as the plan names them   [expected Dawn,Storm,Lullaby,Tide,Procession, got Dawn,Storm,Lullaby,Procession,Tide]
  PASSED 143 / FAILED 1
the picker's render loop cut to three cards (test/layout.mjs, widened, on a folder copy with node_modules linked):
  FAIL  375x667  mood card 4  MISSING
  FAIL  375x667  mood card 5  MISSING
  FAIL  375x667  every mood is there, in the order the page keeps: Dawn, Storm, Lullaby
  ... the same three at 320x568, 412x915 and 667x375 landscape
  12 LAYOUT FAILURE(S), and nothing else on the screen red
```
**Live**, alone, under the lock, `test/render.mjs` on the real tree:
```
  moods in the picker: dawn, storm, lullaby, tide, procession
  measured dawn: peak 0.357, rms 0.0587, above 3 kHz 1.14 percent
  measured storm: peak 0.416, rms 0.0569, above 3 kHz 1.99 percent
  measured lullaby: peak 0.360, rms 0.0604, above 3 kHz 1.39 percent
  wrote p0-tide.wav
  measured tide: peak 0.331, rms 0.0548, above 3 kHz 1.37 percent
  wrote p0-procession.wav
  measured procession: peak 0.395, rms 0.0616, above 3 kHz 1.19 percent
RENDER OK
```
(`test/render.mjs` rewrites `docs/shots/p0-swell.wav` on every run, as it always has; that regenerated file is put back
to the committed one before the commit, so only the two new wavs ship.) `p0-tide.wav` and `p0-procession.wav` are
1,234,844 bytes each, the same fourteen seconds and the same size as the `p0-storm.wav` and `p0-lullaby.wav` already in
the repo, and under the gate's own 1,536 KB law.
**A fault the widened layout gate found on the real page, and fixed:** with the gate asking for every card the page's
order makes, the live run went red on a phone held on its side, and only there:
```
  ok    375x667  mood card 5  339x72        ok    320x568  mood card 5  284x82        ok    412x915  mood card 5  340x72
  FAIL  667x375 landscape  mood card 1  60x180
  ... cards 2 to 5 the same, 60 by 180
  5 LAYOUT FAILURE(S)
```
The picker's `@media (min-width:600px)` block laid the cards in one equal flex row, which gave three cards about 200 px
each and five cards 60 px each: two more moods made every card on a landscape phone narrower than the 72 px law, and
the old gate, checking three cards, could not have seen it. The row was made to wrap (`flex-wrap:wrap`, each card
`flex:1 1 200px`), meant as three across and two below; the next paragraph says why that is not what shipped. The
live red above is this fix's red witness: real code, the widened gate, before the change.
**Shot opened** (`p2-moods`, reshot, 46 KB; `tools/shots.mjs p2-moods`, an exact name filter): CHOOSE A MOOD, then Dawn
(playing, its card lit), Storm, Lullaby, Tide and Procession, each with its line, and BACK under them. Three faults
named and left: five cards and BACK now fill most of a 375x667 screen, so on a 320x568 phone BACK sits at or past the
fold (the layout gate proves every card a target, not that the list fits without a scroll); Tide's line, the longest,
runs nearly to its card's edge; nothing tells a returning player that two of the five are new.
**⛔ The wrap was green and wrong, and no gate could say so.** The layout gate went green on it (every card 340x72),
but a probe of the page from the session scratch (`sw-picker-probe.mjs`, not shipped) measured the cards stacked in
ONE column at x 164, and BACK at 472..520 on a screen 375 px tall. `#moodCards` carried `style="max-width:340px"`, and
a style attribute beats the media rule's 760 px, so the "row" was 340 wide and wrapped one card to a line. The width
cap moved into the stylesheet (`#moodCards{max-width:340px}` for portrait, 690 px in landscape, the caption widened to
match), each landscape card is `flex:0 1 calc(50% - 5px)` so the odd fifth card is as wide as the four above it, and
the landscape cards take `padding:10px 16px`. Both of those last two came from a middle pass (`flex:1 1 260px`) that
left the fifth card 340 wide under four of 311 and, once its line wrapped, put BACK at 328..376 of 375, a pixel under
the fold. The probe on the final page:
```
land-667: cards 311x72@18,58 311x72@339,58 311x74@18,140 311x74@339,140 311x74@18,224  BACK 312..360 of 375
land-915: cards 340x72@113,74 340x72@463,74 340x72@113,156 340x72@463,156 340x72@113,238  BACK 326..374 of 412
port-375: cards 339x72@18,116 339x72@18,200 339x72@18,284 339x72@18,368 339x72@18,452  BACK 560..608 of 667 (unchanged)
PLAYING on the longest name: Procession name right 186, badge left 250 at 667 wide (no overlap)
```
Full check on the final page, under the lock: lint, theory, render, hold, record, layout, thumb, **ALL GATES PASSED**.
`docs/thumb.png` and `docs/shots/p0-swell.wav`, which their gates rewrite on every run, were put back to the committed
files. **No gate holds BACK above the fold in landscape**; the probe found it, so a sixth mood needs that law first.
**Shot opened** (`p2-moods-landscape`, 80 KB, the probe's frame at 667x375 with Procession chosen): CHOOSE A MOOD, two
columns (Dawn and Storm, Lullaby and Tide), Procession alone in the third row, lit and PLAYING, and BACK centred under
them, on the screen. Three faults named and left: the third row leaves a hole on the right; Tide's and Procession's
lines wrap and leave "lands" and "grave" alone on a line; the cards sit left aligned under the caption while BACK is
centred.

## 15. THE MORNING REPORT

### Morning report, 2026-09-05

**Phases:** P0 (`98322fe1`, `d0a2d8cb`), P1 (`63db0a11`), P2 (`b82ddca9`), P3 (this commit). Swell is **DONE P3**.

**Gates:** `ALL GATES PASSED`, seven: `lint theory render hold record layout thumb`. 110 assertions in
`sim.js --test`. Every one watched to fail; fifteen failure columns are in section 13. `tools/shots.mjs` also measures
the battery rule at all four sizes and all four are idle after silence.

**LISTEN TO THIS FIRST:** `satellites/swell/docs/shots/p0-swell.wav`. Fourteen seconds, mono, 1.2 MB, double
clickable. A press at 0.2 seconds, a release at 6.2, rendered offline through the same synth the app runs. That file is
the review; everything else here is bookkeeping.

**Play it:** `satellites/swell/index.html`. Hold anywhere. Let go. Menu for the moods, ambient and settings. REC bottom
right; the video toggle is in Settings and it is off until asked for. `?test=1` runs the assertion harness into a panel.

**Look at:** these five.
1. `docs/shots/p1-swell.png` — the whole orchestra under one finger. **Wrong with it:** the curtains blur into one mass
   at the base where they all meet the floor; the tops are needles rather than the ragged edge an aurora has; over half
   the screen is empty, which is right for a dark game and still reads as bottom heavy.
2. `docs/shots/p1-resolve.png` — the curtain falling and cooling a second after release. **Wrong with it:** the cool
   blue and the warm amber read as two separate curtains rather than one cooling one; the bottom is a hard bright band;
   the composition is the same as the swell shot at lower brightness, so the two are hard to tell apart.
3. `docs/shots/p2-two-fingers.png` — the second finger owning the choir. **Wrong with it:** it looks almost identical
   to the resolve shot, so the thing it is meant to show is not visible in a still; the ice blue is the only clue.
4. `docs/shots/p2-moods.png` — the picker. **Wrong with it:** a big dead gap between the last card and BACK; the mood
   names are set in the same weight as everything else so the cards read flat; nothing shows which mood is playing
   except a thin border.
5. `docs/thumb.png` — the arcade tile. **Wrong with it:** the top half is empty except one blue spike; at 150 px on the
   shelf that spike may vanish and leave only amber; the amber curtains blur into one mass.

**Decided without you** (all of `docs/DECISIONS.md`, these three matter most):
- *"voice leading takes the nearest FREE tone that keeps a voice above the one below it."* The plan's rule collapsed all
  three voices onto one note within four chords and its own assertion was happy about it.
- *"gestures are scheduled, not immediate."* Ambient mode had the same bug the render gate found.
- *"the first note of a touch takes forty milliseconds."* The plan asks for a fifty millisecond response in the same
  paragraph that gives the strings a 0.35 second attack; this is how both are true.

**Blocked:** none.

**For Fable:** nothing outside the fence was touched by this leg. To list it: `docs/thumb.png` goes to
`portal-assets/thumbs/swell.png` and the card is in section 8; every line of it is true now. One thing worth your own
eyes: earlier in the run, on the Fathom and Asterism legs, a persisted shell directory created three files outside a
fence, and one of them briefly appended to the repository root `index.html`. It was restored with `git checkout` and
verified byte identical to HEAD.

**For Stephen, and this one is really for you:**
- **The ear.** You are the producer. The WAV is Dawn, one finger, six seconds. What I cannot hear and you can: whether
  the strings are too bright at the top of the filter sweep; whether the timpani at the cadence is too loud, it is the
  spike at ten seconds and it is the single loudest thing in the file; whether the hall at 0.28 wet is too much; and
  whether six seconds of hold is enough of an arc or whether the layering windows want stretching. Every one of those
  is one number in CONFIG or in the SPEC table and a line in DECISIONS.
- **Storm and Lullaby have never been heard by anybody.** The WAV is Dawn. `node sim.js --walk=storm,3` prints their
  chord walks to read, but nobody has listened to them. If you want them rendered too, that is one line in the render
  gate.
- **The name.** SWELL is what the folder and the title say. Tutti, Maestro, Crescendo and Holdfast are yours, and so is
  the worry that Swell is a common word.
- **The phone.** The gates run under an autoplay flag a phone does not have. An AudioContext made before a gesture
  stays suspended on iOS with every scheduled note landing in silence and no error; the engine is opened inside
  `pointerdown` for exactly that reason and only a real phone can prove it. Also on the phone: three fingers at once,
  a quick tap, tilt (which no gate can reach), Lullaby with the fifteen minute timer, and one recording shared to
  Jessie.

**Next action:** nothing in Swell is half finished. The next session takes the next row of section 5 of the spine.


### Morning report, 2026-09-05

**Phases:** P0 done (`98322fe1`, `d0a2d8cb`). P1, P2 and P3 not started. Swell is **P0 DONE**, not DONE P3.

**Gates:** `ALL GATES PASSED`, three of them: `lint`, `theory` (110 assertions), `render`. Every one watched to fail;
six failure columns are in section 13.

**LISTEN TO THIS FIRST:** `satellites/swell/docs/shots/p0-swell.wav`. Fourteen seconds, mono, 1.2 MB, double
clickable. A press at 0.2 seconds, a release at 6.2, the whole thing rendered offline through the same synth the app
runs. Its envelope is in section 13. That file is the entire review; everything else in this report is bookkeeping.

**Play it:** `satellites/swell/index.html` runs, and hold to swell works, but **be told plainly: no thumb has touched
it yet.** The render gate drives the engine offline and proves the sound; nothing has driven the real input handler,
and no screenshot exists. The first thing the next session does is `test/hold.mjs`, and the exact assertions are in
SESSION STATE.

**Look at:** nothing yet. There is no screenshot of Swell. That is not an oversight, it is where the night stopped:
the plan puts the aurora and its shots at P1 step 4 and the sound at P0, and the sound is what got finished.

**Decided without you:**
- *the voices take the nearest FREE tone that keeps them above the voice below, inside a bounded register.* The plan's
  rule collapsed all three voices onto one note within four chords and its own assertion could not see it.
- *gestures are scheduled, not immediate.* `press(t)` and `release(t)` take an AudioContext time and go in a queue the
  pump consumes; acting on the call meant ambient mode and the render gate were both broken in the same way.
- *the first note of a touch takes forty milliseconds and the strings' layer curve is fast at the front.* Otherwise a
  press is silent for a fifth of a second, which does not feel like a touch.
- *the crescendo grows in level as well as in colour.* Intensity drove only the filter, and the swell dipped.

**Blocked:** none.

**For Fable:** nothing outside the fence was touched by this leg. One thing to know: earlier in the run, while working
on Fathom and Asterism, three files were created outside a fence by a persisted shell directory, and one of them
briefly appended to the repository root `index.html`, the Lucid Winds game itself. It was noticed at once, restored
with `git checkout`, and verified byte identical to HEAD; `git status` is clean of it and the marker text is absent
from the file. The other two were `test/harness.mjs` and `tools/thumb.mjs` at the root, both removed or moved. Worth a
look with your own eyes rather than my word.

**For Stephen:**
- **The name.** SWELL is what the folder and the title say. Tutti, Maestro, Crescendo and Holdfast are yours, and so is
  the worry that Swell is a common word.
- **The ear.** You are the music producer and this one is for you. The WAV is Dawn, one finger, six seconds. What I
  cannot hear and you can: whether the strings are too bright at the top of the filter sweep, whether the timpani at
  the cadence is too loud (it is the spike at ten seconds), whether the hall is too wet at 0.28, and whether six
  seconds of hold feels like enough of an arc or whether the layering windows want stretching.
- **The phone test, once P1 lands.** The autoplay flag the gates run under does not exist on a phone, and an
  AudioContext made before a gesture stays suspended there with every scheduled note landing in silence and no error.
  The engine is opened inside `pointerdown` for exactly this reason and only a real phone can prove it.

**Next action:** `satellites/swell/test/hold.mjs`, P1 step 3. The full assertion list is in SESSION STATE at the top of
this file.

## 14. THE OVERNIGHT PROTOCOL

As `plans/fathom/HANDOFF-FATHOM.md` section 14, with `P0, P1, P2, P3` of this file and the browser gates `render, hold,
record, layout`.

---

## 15. THE MORNING REPORT

### Morning report, 2026-09-05

**Phases:** P0 (`98322fe1`, `d0a2d8cb`), P1 (`63db0a11`), P2 (`b82ddca9`), P3 (this commit). Swell is **DONE P3**.

**Gates:** `ALL GATES PASSED`, seven: `lint theory render hold record layout thumb`. 110 assertions in
`sim.js --test`. Every one watched to fail; fifteen failure columns are in section 13. `tools/shots.mjs` also measures
the battery rule at all four sizes and all four are idle after silence.

**LISTEN TO THIS FIRST:** `satellites/swell/docs/shots/p0-swell.wav`. Fourteen seconds, mono, 1.2 MB, double
clickable. A press at 0.2 seconds, a release at 6.2, rendered offline through the same synth the app runs. That file is
the review; everything else here is bookkeeping.

**Play it:** `satellites/swell/index.html`. Hold anywhere. Let go. Menu for the moods, ambient and settings. REC bottom
right; the video toggle is in Settings and it is off until asked for. `?test=1` runs the assertion harness into a panel.

**Look at:** these five.
1. `docs/shots/p1-swell.png` — the whole orchestra under one finger. **Wrong with it:** the curtains blur into one mass
   at the base where they all meet the floor; the tops are needles rather than the ragged edge an aurora has; over half
   the screen is empty, which is right for a dark game and still reads as bottom heavy.
2. `docs/shots/p1-resolve.png` — the curtain falling and cooling a second after release. **Wrong with it:** the cool
   blue and the warm amber read as two separate curtains rather than one cooling one; the bottom is a hard bright band;
   the composition is the same as the swell shot at lower brightness, so the two are hard to tell apart.
3. `docs/shots/p2-two-fingers.png` — the second finger owning the choir. **Wrong with it:** it looks almost identical
   to the resolve shot, so the thing it is meant to show is not visible in a still; the ice blue is the only clue.
4. `docs/shots/p2-moods.png` — the picker. **Wrong with it:** a big dead gap between the last card and BACK; the mood
   names are set in the same weight as everything else so the cards read flat; nothing shows which mood is playing
   except a thin border.
5. `docs/thumb.png` — the arcade tile. **Wrong with it:** the top half is empty except one blue spike; at 150 px on the
   shelf that spike may vanish and leave only amber; the amber curtains blur into one mass.

**Decided without you** (all of `docs/DECISIONS.md`, these three matter most):
- *"voice leading takes the nearest FREE tone that keeps a voice above the one below it."* The plan's rule collapsed all
  three voices onto one note within four chords and its own assertion was happy about it.
- *"gestures are scheduled, not immediate."* Ambient mode had the same bug the render gate found.
- *"the first note of a touch takes forty milliseconds."* The plan asks for a fifty millisecond response in the same
  paragraph that gives the strings a 0.35 second attack; this is how both are true.

**Blocked:** none.

**For Fable:** nothing outside the fence was touched by this leg. To list it: `docs/thumb.png` goes to
`portal-assets/thumbs/swell.png` and the card is in section 8; every line of it is true now. One thing worth your own
eyes: earlier in the run, on the Fathom and Asterism legs, a persisted shell directory created three files outside a
fence, and one of them briefly appended to the repository root `index.html`. It was restored with `git checkout` and
verified byte identical to HEAD.

**For Stephen, and this one is really for you:**
- **The ear.** You are the producer. The WAV is Dawn, one finger, six seconds. What I cannot hear and you can: whether
  the strings are too bright at the top of the filter sweep; whether the timpani at the cadence is too loud, it is the
  spike at ten seconds and it is the single loudest thing in the file; whether the hall at 0.28 wet is too much; and
  whether six seconds of hold is enough of an arc or whether the layering windows want stretching. Every one of those
  is one number in CONFIG or in the SPEC table and a line in DECISIONS.
- **Storm and Lullaby have never been heard by anybody.** The WAV is Dawn. `node sim.js --walk=storm,3` prints their
  chord walks to read, but nobody has listened to them. If you want them rendered too, that is one line in the render
  gate.
- **The name.** SWELL is what the folder and the title say. Tutti, Maestro, Crescendo and Holdfast are yours, and so is
  the worry that Swell is a common word.
- **The phone.** The gates run under an autoplay flag a phone does not have. An AudioContext made before a gesture
  stays suspended on iOS with every scheduled note landing in silence and no error; the engine is opened inside
  `pointerdown` for exactly that reason and only a real phone can prove it. Also on the phone: three fingers at once,
  a quick tap, tilt (which no gate can reach), Lullaby with the fifteen minute timer, and one recording shared to
  Jessie.

**Next action:** nothing in Swell is half finished. The next session takes the next row of section 5 of the spine.


The template in `plans/fathom/HANDOFF-FATHOM.md` section 15, with this file's phases. Add one line: **Listen to:** the path of
the WAV and its envelope in numbers.
