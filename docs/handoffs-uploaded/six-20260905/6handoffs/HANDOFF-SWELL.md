# HANDOFF — SWELL (One-Button Orchestra)

**Studio:** Lucid Winds / Sky Walk Studio
**Format:** Single-file vanilla HTML/CSS/JS PWA. No build steps. No libraries. All audio synthesized (zero sample files). Mobile-first, portrait or landscape.
**Deploy target:** lucidwinds.com/satellites/swell
**Session goal:** Hold-to-swell orchestra with harmonic engine, 3 moods, multi-touch sections, aurora visuals, recording + audio export, ambient mode.

---

## 1. Concept

Touch the screen and hold: an orchestra swells out of silence — strings first, then horns lean in, then a choir opens above them, the harmony quietly moving underneath your finger. Release: everything resolves, beautifully, always. You cannot play a wrong note. You aren't playing notes at all — **you're conducting dynamics**, and the app handles the music theory.

More fingers = more sections. Tilt = brightness. Time your release to the pulse and the resolution lands like the end of a film.

**Tone:** cinematic, generous, a little overwhelming in the good way. The feeling of standing on a podium. Everyone who's air-conducted in their car is the audience.

## 2. Market research summary (Sep 2026)

- **Bloom** (Eno/Chilvers, 2008–present): the canon. Tap = tone + blooming circle; loops decay; evolves when idle; 12 mood scales; paid ($4–8); praised as "a music box for the 21st century." Verb = *tap* (pointillist). Top Android complaint: audio stops when the screen sleeps or you switch apps — people want it as an ambient companion and it won't stay alive.
- **Blob Opera** (Google): drag blobs → vocal harmony auto-follows; went massively viral on pure charm + zero skill floor + instant share. Proof this category can explode.
- **Incredibox:** layered loops via characters; kids obsess; proof that *layering* is an addictive verb.
- **Patatap / Chrome Music Lab:** tap-toys, educational, no emotional arc.
- **The gap:** every one of these is about *which sounds*. None is about *how loud, how full, when to let go* — tension and release, the actual emotional engine of orchestral music. Crescendo-as-mechanic is unclaimed.

**Positioning line:** "You can't play a wrong note. You can only conduct."

## 3. Core interaction

### The hold (one finger — the whole product must work with just this)
- **0.0–0.5s:** low strings fade in on the current chord root. Immediate response, sub-50ms.
- **0.5–3s:** violins layer in above, gentle filter opening (brightening).
- **3–7s:** horns swell, harmony engine begins moving (see §4), tremolo energy rises.
- **7s+:** choir opens, timpani roll whispers underneath, the sound leans forward — musical "held breath."
- **Pressure/size:** where supported (touch radius/force), maps to intensity gain. Degrades to time-only gracefully.
- **Release:** the engine finishes the phrase — resolves to tonic on the next beat (see quantization) with a soft timpani landing and a reverb tail that hangs 4–6s. **Release is the payoff. It must feel like exhaling.**
- **Quick taps:** staccato full-orchestra hits (quantized to beat) — so rhythmic play emerges naturally alongside swells.

### More fingers (the depth)
- Finger 2: sustains the **choir/high strings** independently — hold one low, flutter the other.
- Finger 3: **brass** — adds the heroic layer.
- Vertical position of each finger = register (low on screen = low octave). Horizontal = stereo placement (conducting left/right of the stage).
- Tilt (DeviceOrientation, optional): timbre — tilt away = darker/muted, toward = brighter/open.

## 4. The harmonic engine (why it always sounds good)

- Each mood has a key, scale, and a weighted **chord graph** (e.g., Lydian film-score mood: I → V/vi → IV → I variants; graph walk, never random jumps). While held, harmony advances one chord per bar; tension parameter (hold duration) biases the walk toward farther-from-tonic chords — longer holds literally create more harmonic tension to resolve.
- All voices pick chord tones + passing tones from the current chord; voice-leading rule: each section moves to its *nearest* available chord tone (smooth, professional-sounding motion for free).
- **Beat grid:** slow pulse (~60–72 BPM per mood). Releases and staccato hits quantize to the next 8th; chord changes to the bar. Quantization is invisible musicianship — the player feels talented.
- Resolution on release: current chord → (pre-dominant if far) → V → I, compressed into ~1–2 bars. Long dramatic holds get the full cadence; short ones get a plagal sigh.
- **Launch moods (3):** *Dawn* (Lydian, warm, film-score), *Storm* (minor, driving low pulse, brass-forward), *Lullaby* (pentatonic, music-box + soft strings, for the bedtime crowd). Architecture makes moods pure data — easy to ship more.

## 5. Synthesis recipes (Web Audio, no samples)

- **Strings:** 3–5 detuned sawtooth voices per note → lowpass (cutoff = intensity) → slow attack envelopes; section = 3 notes of the chord. Chorus via two short modulated delays.
- **Choir:** saw/pulse → two formant bandpass filters (vowel "ah/oo" morphs with intensity) + gentle vibrato. Formant filtering is the whole vocal illusion — budget tuning time here.
- **Brass:** brighter saw, faster attack, slight pitch-scoop on entry (the "blat" that reads as horns), waveshaper for edge at high intensity.
- **Flute/air layer:** sine + filtered noise breath, only at low intensities (delicacy at the quiet end so quiet play is beautiful too, not just "less").
- **Timpani:** pitched noise burst → bandpass sweep down + sine thump; roll = repeated soft hits with jitter.
- **Reverb:** ConvolverNode with a procedurally generated impulse response (decaying noise burst, ~3.5s, stereo-decorrelated) — concert hall for free, no IR file.
- **Master chain:** section gains → hall → gentle compressor (DynamicsCompressorNode) → limiter-ish ceiling. Total polyphony budget ~24 voices; voice-steal quietest.

## 6. Visuals — the aurora podium

- Darkness. Sound renders as **aurora**: vertical light curtains that bloom from each touch point, height/brightness = intensity, color = section (strings amber, choir ice-blue, brass gold, timpani deep red pulses at the floor). Harmonic tension subtly shifts the whole palette warmer; resolution washes it cool and calm.
- Particles drift upward on crescendos; on the resolving chord, everything releases into a slow falling shimmer. The screen should *look like the music feels* — this is what gets screen-recorded and shared.
- No UI during play. Mood picker + record button fade in on inactivity, vanish on touch.

## 7. Modes & features

- **Conduct (default):** everything above.
- **Ambient mode:** Bloom-style self-evolve — the engine performs gentle swells on its own; screen dims to embers; **wake lock** (Screen Wake Lock API) keeps it alive as a sleep/focus machine. This directly answers Bloom's #1 complaint within PWA limits (be honest in UI: "keeps playing while this screen stays on").
- **Record & share:** MediaRecorder taps the master bus → export audio (webm/opus; m4a where supported). Optional canvas+audio capture for a video with the aurora (DOOHICKEY pipeline). One button, saves locally/share sheet. People sharing 30-second swells IS the marketing.
- **Sleep timer** (ambient mode): 15/30/60 min fade-out. The bedtime use-case is real (Lullaby mood + timer = kid sleep machine; pairs with the Twelve Realms audience).
- **Score mode (v1.1, designed now):** 90-second guided scenes — a sun rises, a storm crosses a valley, credits roll on an imaginary film — visual cues invite (never demand) swells at the right moments. Turns the toy into an experience with an ending, which is what non-musicians need to feel "done."

## 8. AI toolchain plan

- **Claude Code:** full build. Audio engine first, headless-ish (buttons triggering synths) before any aurora.
- **ChatGPT Pro:** chord-graph design review per mood (paste the graph, ask for voice-leading traps + suggested substitutions); Score-mode scene scripts.
- **Gemini Pro:** aurora visual reference exploration (palette/shape studies to encode into the particle system); second opinion on formant frequency tables for the choir vowels.
- **Grok basic:** name check (SWELL collisions — note: common word, check app stores), taglines, launch copy.
- **Meshy premium:** skip for the app itself. Optional: conductor's-baton / glowing-podium 3D render for icon art. (VR note for the Horizon list: conducting with actual hand controllers is one of the most natural VR music ideas that exists — SWELL VR is a real candidate; Meshy builds the concert hall.)

## 9. Tech architecture (single file)

- AudioContext unlocked on first touch (iOS). All scheduling via AudioContext clock (lookahead scheduler pattern, ~100ms horizon) — never setTimeout for musical time.
- Engine = data-driven: moods as JSON (key, scale, chord graph, BPM, synth params). Sections as voice-pool objects.
- Visuals: canvas 2D particles + gradient curtains; aurora reads engine state (per-section intensity, tension, beat phase) — one-way data flow, audio never waits on video.
- Wake Lock API for ambient mode (feature-detect, graceful without).
- localStorage: last mood, recordings list (as blobs in IndexedDB if size demands — decide at build), settings. PWA manifest + SW inline; fully offline.
- Perf: audio graph is the budget — cap concurrent voices at 24, reuse nodes via pools, single shared convolver.

## 10. Build order

1. Audio core: one section (strings), hold→swell envelope, release→resolve on a hardcoded I–V–I. **Stop and feel-test: one finger, one swell, one resolution — if this doesn't give someone chills at step 1, tune until it does. Nothing else matters yet.**
2. Harmonic engine: chord graph walk, beat grid, quantized release, full cadence logic.
3. Remaining sections (choir formants, brass, flute, timpani) + intensity choreography (the 0–7s+ layering).
4. Multi-touch section mapping + register/pan by position + tilt timbre.
5. Aurora visuals + UI fade system.
6. Moods ×3 (data files) + mood picker.
7. Recording/export + ambient mode + wake lock + sleep timer.
8. PWA wrapper, polish, battery pass.

## 11. Stretch / later

- Score mode scenes (designed in §7, ship v1.1).
- More moods (Sea, Winter, Sunday Morning); seasonal mood drops as re-engagement.
- MIDI out (Web MIDI) — conduct real DAW instruments; tiny audience, huge goodwill in music-tech posts.
- Same-screen duet (two players, phone flat between them — sections split by screen half).
- SWELL VR concept for the Meta Horizon beachhead list.
- Cross-link: Lullaby mood as the soundtrack engine for a future Twelve Realms collab (your friend's sleep-content audience is exactly ambient mode's user).

## 12. Open questions for Stephen

- Name: SWELL (current — the mechanic is the name). Risk: common word, hard to search. Alternatives: TUTTI (orchestra term for "everyone plays"), MAESTRO, CRESCENDO, HOLDFAST.
- Portrait, landscape, or both? (Recommend both — portrait one-thumb casual, landscape two-hand "podium.")
- Recording storage: keep it simple (download immediately, store nothing) or in-app recordings shelf (IndexedDB)? (Recommend download-immediately for slice.)
- Ship Lullaby mood + sleep timer in slice as the differentiator, or hold for v1.1? (Recommend: in slice — it's the mode with a nightly use-case.)
