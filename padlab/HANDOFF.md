
# PadLab — Engineering Handoff

**Status:** working, feature-complete v3. Ships as a single self-contained HTML file plus a small deploy package. No build step, no framework, no npm install. Open it and it plays.

**Who it's for:** Stephen and his daughter. The whole point is that an Akai MPK Mini stops sitting on a shelf and becomes something a kid can pick up and make music with immediately. Every design decision should be measured against: *can a child press this and have it sound good?*

---

## 1. What this is

A browser-based groovebox / instrument for the Akai MPK Mini (works fine without one too — touch and computer keyboard both play).

Core loop: **tap a fat beat → jam over it on pads and a scale-locked keyboard → sample anything live → chop it onto pads → record the jam.**

Feature surface as built:

| Area | What's in it |
|---|---|
| Beats | 10 play-along grooves, editable 16-step sequencer, 4 pattern slots (A/B/C/D), swing, Song mode (chains slots into an arrangement), 3 synth drum-kit characters, 10 downloadable real drum kits |
| Pads | 8 pads, velocity-sensitive from MIDI, per-pad volume / tune / reverse, note-repeat roll (1/4–1/32), load your own sound per pad |
| Keys | 10 synth presets + 12 streamed real instruments, scale lock (7 scales × 12 keys), one-finger chords, tempo-synced arpeggiator (4 modes, 3 rates, latch), sustain, octave shift, scale-bar or piano view |
| Sample | Mic record (hold-to-record) or file load, waveform trim handles, slice preview, chop-to-pads (4/8/16), play-across-keys with pitch shift, send-to-single-pad |
| FX | Convolution reverb, tempo-synced delay, tone (lowpass) — all on the instrument bus |
| Output | Live meter, jam recording to downloadable file, project export/import (JSON), IndexedDB autosave |
| Platform | PWA install, service worker offline, MIDI auto-connect + pad remap learn |
| Marble | Marblebeat merged in 2026-08-16 as a fourth tab: an isometric plate you drop bouncing marbles onto, where height is note length and colour is pitch, plus a Show my beat toggle that projects the current pattern as ghost marbles |

---

## 2. Files

```
padlab-deploy/                 ← drop this folder on the website
├── index.html                 ← the entire app (copy of PadLab.html)
├── sw.js                      ← service worker (offline shell + sample cache)
├── manifest.webmanifest       ← PWA manifest
├── icon-192.png
├── icon-512.png
└── icon-maskable-512.png      ← Android adaptive-icon safe

PadLab.html                    ← same app, standalone (open directly, no server)
HANDOFF.md                     ← this file
```

`index.html` and `PadLab.html` are byte-identical. Keep them in sync, or better: **make `PadLab.html` a symlink / delete it and treat `padlab-deploy/index.html` as the single source of truth.** Recommend the latter once work moves into Claude Code.

---

## 3. Deploying to the website

It's static. No backend, no env vars, no secrets.

1. Upload the contents of `padlab-deploy/` to a directory on the site, e.g. `https://yoursite.com/padlab/`.
2. Must be served over **HTTPS** (or `localhost`). Web MIDI, mic access, and service workers all require a secure context.
3. Visit `https://yoursite.com/padlab/`. Chrome/Edge will offer install; the 📲 button explains the flow per platform.

**Serve requirements:**
- `sw.js` must be served from the same directory as `index.html` (its scope is `./`). Don't move it to a `/static/` subfolder or the scope breaks.
- `manifest.webmanifest` should be served as `application/manifest+json`. Most hosts do this; if the browser complains, add the MIME type. It works as `application/json` too.
- Don't add aggressive cache headers to `index.html` — the service worker handles caching, and a long `max-age` on the HTML makes updates invisible. `Cache-Control: no-cache` on `index.html` is the safe choice.

**Shipping an update:** bump `SHELL_VERSION` in `sw.js` (e.g. `padlab-shell-v3` → `v4`). Without this, returning visitors keep the old cached app.

The app degrades gracefully: if `sw.js` or `manifest.webmanifest` are missing it falls back to a runtime-generated blob manifest and skips SW registration. Opening `PadLab.html` from the filesystem works for everything except install/offline.

---

## 4. Architecture

Single file, four layers, no framework. Plain functions and module-level state. ~2,000 lines: CSS in `<style>`, markup, then one `<script>`.

### 4.1 Audio graph

Built once in `initAudio()`:

```
drum voices ─────────────→ drumBus ──┐
                                     ├─→ master → comp → destination
instrument voices → instrBus → toneFilter ──┘        ├─→ analyser (meter)
                       ├─→ reverbSend → convolver ───┤    └─→ streamDest (jam recording)
                       └─→ delaySend → delayNode ⇄ delayFB
```

Deliberate: **drums bypass the FX bus.** Reverb/delay/tone only touch melodic content, so cranking reverb never turns the beat to mush. If you add FX sends for drums, make them separate controls.

`streamDest` is a `MediaStreamDestination` off the compressor — that's what jam recording captures, so recordings include exactly what you hear.

### 4.2 The clock

One scheduler drives everything: sequencer, arpeggiator, note-repeat roll, metronome. This is the standard lookahead pattern (a `setTimeout` loop scheduling Web Audio events ahead of time — **never** schedule audio from `setTimeout` directly, timing will jitter).

```js
schedulerTick()          // every 25ms, schedules ~120ms ahead
  → grid                 // monotonic 16th-note counter, never resets during play
  → s = grid % 16        // step within the bar
  → tPlay = nextTime + swing offset on odd steps
  → playSeqStep(s, tPlay)   // sequencer
  → arpTick(grid, tPlay, six)   // arpeggiator
  → rollTick(grid, tPlay, six)  // note repeat
```

`ensureClock()` starts/stops the clock based on `isPlaying || arpOn || (rollOn && heldPads.size)`. **Always call `ensureClock()` after changing any of those** — that's how the arp works with the transport stopped.

Visual sync uses `uiQ`, a queue of `{t, fn}` pushed by the scheduler and drained in a `requestAnimationFrame` loop when `ct()` passes `t`. This is why pad flashes land on the beat instead of drifting. **Don't move visual updates into the scheduler** — they'd fire up to 120ms early.

### 4.3 Instruments

Everything melodic goes through one interface:

```js
voiceFor(midi, velocity, when?, gate?) → { stop(), osc? }
```

Three implementations behind it — `playSynth` (oscillator stacks, optional sub + FM, ADSR + filter envelope), `playSampled` (nearest-anchor sample + `playbackRate` pitch shift), `playUserSample` (the user's own recording). `when` and `gate` let the arpeggiator schedule timed notes ahead; omit both for live playing and call `.stop()` on release.

To add an instrument: append to `SYNTHS` (no other changes needed) or to `SAMPLED` with a `dir` and a `notes` array of anchor notes that **must actually exist in the repo** — verify before adding, see §6.

### 4.4 Scale lock

`snap(midi)` maps any incoming note to the nearest note in the current scale. Applied at input, in `noteOn`/`noteOff`, so MIDI keys, touch, and computer keys all get it. Scale lock is why a five-year-old can't play a wrong note; it defaults **on**.

`chordNotes(m)` stacks scale degrees (index, +2, +4 within `allowedMidis`) — so one finger gives a diatonically correct triad in any scale. Verified: in C major, C→[C,E,G], D→[D,F,A].

### 4.5 State + persistence

All state is module-level `let`s. Persistence is IndexedDB (store `padlab`, object store `kv`), never localStorage — artifact sandboxes forbid it and it can't hold audio anyway.

| Key | Contents |
|---|---|
| `project` | full state object from `collectState()` |
| `padwav:{i}` | `{blob, trim, name}` — WAV-encoded pad sample |
| `pack:{instId}:{note}` | ArrayBuffer, cached instrument sample |
| `drumpack:{packId}:{file}` | ArrayBuffer, cached drum-kit sample |
| `rec:{name}` | Blob, recorded jam |

Three functions to know:
- `collectState()` — serializable snapshot (no AudioBuffers)
- `applyStateVars(s)` — restore into module state
- `refreshAllUI()` — push all state into the DOM

**If you add a persisted setting, touch all three.** That's the whole contract, and export/import + autosave come free because both paths use the same trio.

`saveSoon()` debounces 600ms. Call it after any state mutation.

---

## 5. Coding conventions

- Vanilla JS, no build step, no dependencies. Keep it that way unless there's a strong reason — the "open the file and it works" property is worth a lot.
- Dense formatting is intentional (multiple statements per line for related audio-node setup). Match the surrounding style rather than reformatting; a wholesale prettier pass would produce a huge diff.
- Wrap every Web Audio `.stop()` and `disconnect()` in `try/catch` — double-stopping throws in some browsers.
- Every network call needs a fallback path that keeps the app playable. If a sample fails, the user should still hear a synth, not silence.
- All user-facing failures go through `toast()`. No `alert()`, no silent failures.
- No `localStorage` / `sessionStorage`, ever.

---

## 6. External dependencies (all verified)

Everything is free, permissively licensed, CORS-friendly, and served by jsDelivr from GitHub. **No API keys anywhere.**

| Use | Source | URL pattern |
|---|---|---|
| Real instruments (12) | `nbrosowsky/tonejs-instruments` (MIT) | `https://cdn.jsdelivr.net/gh/nbrosowsky/tonejs-instruments@master/samples/{dir}/{Note}.mp3` |
| Drum kits (10) | `Tonejs/audio` (official Tone.js assets) | `https://cdn.jsdelivr.net/gh/Tonejs/audio@master/drum-samples/{kit}/{file}.mp3` |
| Fonts | Google Fonts | Chakra Petch + Space Mono |

**Verified drum kits** (each has exactly `kick`, `snare`, `hihat`, `tom1`, `tom2`, `tom3` — nothing else, no clap/cowbell/ride):
`CR78`, `4OP-FM`, `Kit3`, `LINN`, `Techno`, `acoustic-kit`, `breakbeat8`, `breakbeat9`, `breakbeat13`, `Bongos`

**Verified instrument anchor notes** (only these load — others 404):

```
piano            C2 C3 C4 C5 A2 A3 A4 A5     organ      C2 C3 C4 C5 A2 A3 A4 A5
guitar-electric  C3 C4 C5 A2 A3 A4 A5        cello      C2 C3 C4 C5 A2 A3 A4
guitar-acoustic  C3 C4 C5 A2 A3 A4           violin     C4 C5 A3 A4 A5
guitar-nylon     A2 A3 A4 A5 Fs4 Ds4         flute      C4 C5 A4 A5
saxophone        C4 C5 A4 A5 Fs4 Ds4         harp       C3 C5 A2 A4
trumpet          C4 A3 A5 Ds4                xylophone  C5
```

`bass-electric` and `clarinet` return 404 for all tested notes — **do not add them.** Synth bass covers the low end.

Filename note convention: `Fs4` = F#4, `Ds4` = D#4. `C4` = MIDI 60.

**Verify before adding anything new.** A 404'd anchor silently degrades the instrument's range:

```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  https://raw.githubusercontent.com/Tonejs/audio/master/drum-samples/CR78/kick.mp3
```

(`raw.githubusercontent.com` mirrors the same files jsDelivr serves; the GitHub contents API rate-limits quickly from shared IPs.)

---

## 7. Known limitations — real constraints, not bugs

1. **Web MIDI is Chrome/Edge/Opera only.** No iOS Safari, no Firefox by default. The MPK will never work on an iPhone — a browser limitation, not something to fix. iPhone still works fully by touch. The MIDI pill shows amber + "no Web MIDI" rather than failing silently.
2. **Pitch bend is a no-op for sampled instruments.** `playSampled`/`playUserSample` return handles without `.osc`, so the bend handler skips them. Synths bend correctly. Fixing this means exposing `playbackRate` on sample handles and detuning both paths.
3. **Instrument sample packs stream on first use.** Cached in IndexedDB only if the user taps "keep". Offline before that = fallback to synths.
4. **Recordings are WebM/Opus** (`MediaRecorder`), not WAV. Fine for phones and sharing; won't import cleanly into every DAW. WAV export would mean rendering through an `OfflineAudioContext`.
5. **iOS audio needs a user gesture.** The splash screen exists for this reason. Don't remove it or auto-start audio.
6. **Chop-to-pads is capped at 8** even when 16 slices are selected, because there are 8 pads. Slices 9–16 are computed and drawn but discarded. A pad bank B would fix this — see roadmap.
7. **Song mode advances at bar boundaries only** (step 0). Patterns are all 16 steps; there's no per-pattern length.
8. **No undo.** Clearing a pattern is destructive.

---

## 8. Testing checklist

No test framework is wired up. Before shipping any change, verify by hand:

**Static checks** (fast, catches most breakage):
```bash
# extract JS and syntax-check
python3 -c "import re;print(re.search(r'<script>(.*)</script>',open('index.html').read(),re.S).group(1))" > /tmp/pl.js
node --check /tmp/pl.js
node --check sw.js
```
Also confirm every `getElementById("x")` has a matching `id="x"` — a typo there is the single most common way to break a control, and it won't show up in a syntax check.

**Manual smoke test:**
- [ ] Splash → "Let's play" → audio starts, no console errors
- [ ] Tap a groove → beat loops, cards highlight, step cursor tracks
- [ ] Tap sequencer cells → toggles and plays that pad
- [ ] A/B/C/D hold separate patterns; Song mode chains them at bar lines
- [ ] Roll on + hold a pad → in-tempo repeats at the selected rate
- [ ] Keys: pick a synth *and* a streamed instrument; both sound
- [ ] Scale lock on → every white/black key sounds in-key
- [ ] Chords → one key gives a triad. Arp → holds arpeggiate, latch holds after release
- [ ] Sample tab: record from mic, trim, chop to pads, pads replay slices
- [ ] Export project → reload → import → everything returns
- [ ] Reload with no action → autosave restored patterns, pads, settings
- [ ] Plug in MPK: pads fire drums, keys play the instrument, velocity varies
- [ ] Airplane mode after caching a pack → still plays

**Regression traps** (learned the hard way):
- Changing `ensureClock()` conditions breaks arp-without-transport
- Moving UI updates out of `uiQ` desynchronizes pad flashes
- Adding state without updating all three of `collectState` / `applyStateVars` / `refreshAllUI` silently breaks export-import

---

## 8b. The Marble tab (added 2026-08-16)

Marblebeat folded in from `incoming/marblebeat/`. Everything lives under the
`mb` prefix, and the whole point of the merge was that it brought nothing of
its own that the studio already had.

- **No second clock.** `marbleTick(grid, tPlay, six)` is called from
  `schedulerTick`, inside the playing branch, and is skipped during count in.
  A shelf is 1, 2, 4, 8 or 16 sixteenths and phase snaps to sixteenths, so a
  marble hits when `grid % period === offset`. Exact, and swing is inherited
  because `tPlay` already carries it. **Do not give this its own transport.**
- **No second graph.** `mbPlayHit` keeps Marblebeat's own synthesis, because
  that plink and thud is the character of the toy, but drums connect to
  `drumBus` and the melody to `instrBus`. The drums-bypass-FX rule in 4.1
  applies here too, including the snare's second gain layer.
- **No second scale.** A marble stores a scale DEGREE in `m.deg`, resolved
  through `allowedMidis` at play time, so re-keying the studio re-keys the
  plate. Hue comes from the sounding note, so C is the same colour in every key.
- **The canvas is built inside a hidden view**, so it has no size until the tab
  is first shown. `mbResize()` and `mbFitOnce()` run from the tab switcher, and
  the animation only runs while the tab is on (`mbStartRaf` / `mbStopRaf`).
- **State** is `v:4`. `collectState` writes `marble:{marbles,plates,showBeat}`
  with runtime fields stripped; `applyStateVars` treats a missing key as an
  empty plate so v3 projects still load; `refreshAllUI` rebuilds the chips and
  ghosts. All three or none, as ever.
- **Ghosts** (`Show my beat`) are rebuilt from `renderSeq`, are never
  serialised, and never sound: the sequencer is already playing those notes.

Gate: `node scripts/padlab_marble.mjs` (serve the repo root, not just
`padlab/`, or `/dev-gate.js` 404s and the error assertion trips), plus
`node padlab/check.mjs`, which needs no browser and includes a timing run that
drives the real `schedulerTick` and `marbleTick` in a vm at six tempos and two
swing settings. See `padlab/AUDIT-NOTES.md` for the 2026-08-16 audit.

Added on the audit pass: six marble voices rather than four (Wood is
percussive, Bell is pitched, and `MB_INSTR` is the single table that adding
another one touches), a Fit control that refits the camera over every plate, one
step of undo covering Clear / Remove / Demo, a cap of 80 marbles with a per tick
voice guard, and WAV export of a recorded take from the Recordings sheet.

## 9. Roadmap

### High value, well-scoped

1. **Pad bank B** — 8 more pads (16 total). Makes 16-slice chopping actually usable and gives room for melodic one-shots alongside drums. `pads` becomes `[bankA, bankB]`; add a bank toggle; MPK's own bank button sends different notes, so extend `padNotes` to 16 and the remap flow to learn both banks.
2. **Fix pitch bend for samples** — expose `playbackRate` on sample voice handles, detune both paths in the `0xE0` handler.
3. **Record MPK performance into the sequencer** — capture live pad hits into the current pattern, quantized to 16ths. The clock and pattern model already support it; needs an arm-record state and a write path in `padDown`.
4. **Per-pattern length** (1–4 bars) — patterns are hardcoded 16 steps. Store `len` per pattern, use `grid % (16*len)`.
5. **WAV export for jams** — render through `OfflineAudioContext` so takes drop into a DAW.

### Nice to have

6. Undo for pattern edits (keep a small ring buffer of `pat().tracks` snapshots)
7. More scales (Mixolydian, Phrygian, Harmonic Minor) — one line each in `SCALES`
8. Per-pad choke groups (open hat cut by closed hat)
9. Swing on the arpeggiator (currently sequencer-only)
10. Share-a-jam link (project JSON → compressed URL fragment)

### Deliberately out of scope

A full DAW-grade sequencer. Stephen already has a sequencer app. The sequencer here stays secondary and tucked below the grooves — **the surface must stay joyful and immediate.** The first version of this app was a dense producer control surface and it was rejected for exactly that reason. Guard against feature creep pushing complexity to the top level; new depth belongs behind a sheet or a toggle, not on the main screen.

---

## 10. Quick orientation for a new session

Ask for `padlab-deploy/index.html`. Everything is in that one file. Rough map by section marker:

```
CSS               :root variables → components (grooves, pads, keys, sheets)
markup            splash → header → transport → tabs → 3 views → sheets
/* audio graph */          initAudio, makeIR, ensureAudio, ct
/* music helpers */        scales, snap, chordNotes
/* drum voices */          DRUMKITS, drum()
/* pads */                 pads[], triggerPadAt, renderPads, roll
/* instruments */          SYNTHS, SAMPLED, voiceFor, playSynth/playSampled
/* free drum packs */      DRUMPACKS, loadPack, offline caching
/* grooves + sequencer */  GROOVES, patterns[], renderSeq, song mode
/* transport clock */      schedulerTick, arpTick, rollTick
/* mic sampling */         record, waveform, trim, chopToPads
/* MIDI */                 initMIDI, onMIDI
/* PWA */                  setupPWA, service worker registration
/* persistence */          IndexedDB, collectState/applyStateVars
/* UI plumbing */          wire(), refreshAllUI(), boot()
```

Start at `boot()` at the bottom to see initialization order, and `wire()` for every control binding.
