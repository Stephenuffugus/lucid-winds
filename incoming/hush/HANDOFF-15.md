# HUSH — HANDOFF

**What:** Free noise machine PWA for parents and kids. Pick a spectrum, tune it to an exact frequency, set a timer.
**Stack:** Single-file vanilla HTML/CSS/JS. Zero dependencies, zero network calls, zero tracking. `index.html` + `sw.js`.
**Status:** v1 complete and self-tested. Not yet deployed.

---

## Files

| File | Purpose |
|---|---|
| `index.html` | Everything. Markup, styles, audio engine, UI. ~54 KB. |
| `sw.js` | Offline cache. Bump `CACHE` string on every deploy. |

Manifest is generated at runtime as a Blob URL with inline SVG icons, so there is no `manifest.json` and no icon files to manage.

---

## Audio graph

```
bufferSource(loop) → shapeA → shapeB → lowshelf → highshelf → peak → phi1 → phi2
                                                                       │
                                          ┌── dry ──────────────────────┤
                                          └── delay ⇄ feedback → wet ───┤
                                                                       ▼
heartbeat: buffer → lowpass → heartGain ────────────────────► pulseGain → master
tones:  oscL/oscR → panners → isoGain → toneGain ───────────────────────► master
                                                    master → limiter → analyser → out
```

**LFOs**
- `lfo` → `delay.delayTime` (the sweep)
- `lfo2` at rate × φ → `highshelf.gain` (golden drift, tone)
- `lfo3` at rate × φ² → `peak.frequency` (golden drift, resonance)
- `pulseLfo` → `pulseGain.gain` (shush / waves / breathe)
- `isoLfo` → `isoGain.gain` (isochronic pulsing)

---

## Non-obvious things that will bite you

**1. Comb-lock delay floor — already fixed, don't undo it.**
A `DelayNode` inside a feedback cycle is clamped by spec to at least one render quantum: 128 samples ≈ 2.67 ms ≈ 375 Hz. Naive `delayTime = 1/f` silently stops tracking above 375 Hz. The fix in `apply()` uses `k/f` for the smallest integer `k` clearing the floor — the comb still peaks exactly at `f`, with `f` landing on the k-th harmonic. Verified exact for 55 Hz through 3520 Hz.

**2. Loop seam.**
Buffers are 10 s with a 60 ms equal-power (`sqrt`) crossfade baked from the tail into the head. Measured seam discontinuity 0.052 vs max in-buffer step 0.087, so it's below normal sample-to-sample motion and inaudible. Brown noise will click on a naive loop — keep the crossfade. If you change buffer length, re-verify.

**3. Verified spectral slopes** (measured, not assumed): white 0, pink −3.0, brown −5.9 (above its ~150 Hz integrator corner), blue +3.0, violet +6.0 dB/oct. Grey and green are white plus a live corrective biquad pair defined in `SHAPE`.

**4. Storage shim.**
`Store` tries `localStorage`, falls back to in-memory on throw. Works when deployed, degrades silently inside sandboxed preview frames. Don't replace with bare `localStorage`.

**5. Volume ring is relative, not absolute.**
Deliberate. This app gets used at 2 a.m. in the dark next to a sleeping baby; an absolute dial would let a stray tap jump to full output. Don't "simplify" it.

**6. Nursery volume cap.**
`cap: true` limits master gain to 0.34. Default on. The app cannot measure real SPL in the room, so the cap plus the distance guidance in the Safety panel is the whole protection story. Leave the default on.

---

## Deploy

```bash
firebase deploy --only hosting
```
Both files at the same path. `sw.js` must be served from the root of the app scope or registration fails silently (which is handled — the app just runs without offline).

---

## Backlog

**Near term**
- Ambient bed layers (rain-on-glass, dryer hum) mixed under the synthesised noise. Would need real samples, which breaks the single-file property — decide whether that's worth it.
- Room EQ: a one-time calibration that plays a sweep and asks "louder or quieter?" a few times.
- Multi-child profiles.
- Share-a-preset via URL hash — encode `S` to base64 in the fragment, decode on load. Cheap, and it's the whole growth loop.

**Honest labelling — keep this posture**
Pink/brown noise for sleep masking and the 5.5-breaths-per-minute pacer both have reasonable support. Binaural beats and specific "healing frequencies" do not. The Tones panel says so in the copy. Ship features people want, don't make claims the evidence won't carry — it's also the difference between an app that can be recommended by a paediatrician and one that can't.

The golden ratio use here is real signal processing, not mysticism, and the copy says why: φ is irrational, so φ-spaced resonances never beat against each other and φ-spaced LFOs never re-phase. That's a genuine ambient-design technique and it's defensible if anyone asks.

**Distribution notes**
No revenue model by design — this is a trust-builder and a lucidwinds.com portfolio anchor. Natural press angle: free, no account, no ads, no data collection, in a category where the App Store norm is subscription + tracking SDKs. Parenting subreddits and lactation/postpartum groups are the organic channel.


---

# v2 additions

`RESEARCH.md` holds the full evidence and competitive brief. Read it before changing the product framing — the positioning is load-bearing and derives from a specific 2026 study.

## New subsystems

**Programs engine (`PROGRAMS`, `progTick`).** A program is a list of phases, each with a duration and a target gain multiplier; the engine linearly ramps between them and writes `progGain`, which `setVolume()` multiplies in alongside `adaptGain`. Simulated all nine programs at 30-second resolution: no gain leaves 0..1, no step exceeds 0.35, and every program ends silent. **Do not add a program that never reaches zero** — that's the whole product thesis.

**Slow-wave bursts (`swTick`, `makeBursts`).** Implements Schade et al. 2020 exactly: 50 ms pink bursts, 5 ms linear ramps, 1.25 s period (0.8 Hz), 10 s on / 10 s off blocks. Verified in test. Bursts are scheduled ahead on the audio clock, not on `setInterval` — the interval only tops up the queue. If you change the defaults you break the citation, so change the copy too.

**Microphone (`enableMic`, `meterTick`, `adaptTick`).** The mic source connects to an analyser and **deliberately never reaches the destination**. Two exponential averages: fast (α=0.35) tracks events, slow (α=0.008) becomes the room baseline. Adaptive gain responds to `fast − slow`, so steady self-noise sinks into the baseline and can't chase itself. Stress-tested: 6 min of steady room → gain 1.0000; 5 s loud event → 1.93×; 5 min later → 1.000×. Rise coefficient 0.5, fall 0.02 — fast to cover, slow to leave.

**Visualizer (`vloop`).** Five modes. Frame-capped at 30 fps, and 4 fps in Void — this can run all night on battery. Aurora uses φ-ratio frequencies in the layer sums for the same non-repeating reason as Golden drift. Swipe down or Escape to exit; the UI auto-hides after 5 s.

**Ok-to-wake and sunrise.** Screen-only, needs full screen plus wake lock. `wakeDate()` rolls to tomorrow if the target is more than 12 h in the past.

## Still worth building

- **Share-a-preset via URL hash.** Encode `S` to base64 in the fragment. Cheap, and it's the whole growth loop.
- **Real calibration flow** for the dB meter — play a known tone, ask the user to match against any calibrated meter, store the offset.
- **Earplug note.** Basner found earplugs beat pink noise for adults. Saying so in-app costs nothing and buys enormous credibility.
- **Multi-child profiles.**

---

# v3 — trials, tracker import, heart rate

## Why there is no "Connect your watch" button

There is no honest serverless path to sleep-stage data, and this was verified rather than assumed:

- **Oura** deprecated Personal Access Tokens in December 2025. OAuth only, `client_secret` must live server-side, and apps are capped at 10 users until approved.
- **Google Fit REST API** is deprecated with end-of-service in late 2026. Its replacement, Health Connect, is Android-native with no web API.
- **Apple HealthKit** has no web API at all, and the Apple Watch does not expose heart rate over standard Bluetooth GATT to third parties.
- **Web Bluetooth** does not exist on iOS Safari, so the live-HR path covers Android and desktop Chrome only.

Shipping an OAuth flow would mean adding a server, holding client secrets, and touching people's health data — which breaks the entire premise. **File import is not the fallback, it is the right answer.** Do not "upgrade" this to OAuth later without deciding to become a different product.

## The statistics are the feature — do not loosen them

Everything below is verified by simulation, not asserted:

- **t-distribution CDF** matches textbook critical values to five decimals across df = 1 to 1e7.
- **Welch's t** matches an independent Python implementation exactly (t = −3.2916, df = 12.866, p = 0.00591 on the test set).
- **False-positive rate** with two identical arms: 3.8–5.0% against a nominal 5%, across 5–20 nights per arm, for both the Welch and permutation tests. End-to-end through the real verdict rule: 6%.
- **Permutation test** is seeded, so the same data always yields the same p — no result that changes when you reopen the panel.
- **Power** (1,500 sims per cell) is the reason the minimum is 10 nights per arm: at 14 nights each, a moderate real effect is detected only ~28% of the time. Most competitors would declare a winner after three nights. That is fantasy, and the app says so in the setup panel.
- **Block randomisation** verified to hold arms exactly balanced after every even-numbered night, at every seed tested.
- **Peeking penalty**: checking nightly lifts the false-alarm rate from ~6% to ~8%. Disclosed in the running-trial panel.

**Blinding is on by default and matters.** Knowing which sound is "the good one" changes both how you sleep and how you rate it.

## Importers

Per-file unit inference, not per-value. The median of the whole-night column decides whether the file is in seconds, minutes or hours, and that scale is then applied to every duration. Per-value guessing was the original approach and it read Garmin's 1.4 hours of deep sleep as 1 minute and left Oura's latency in seconds — both caught in testing.

Verified against fixture files for Oura, Fitbit (CSV and JSON), Garmin, Withings and Samsung shapes, plus empty, junk, and malformed input which must never throw.

**Apple Health `export.xml`** is read in 4 MB slices with a 4 KB overlap so a record split across a boundary survives. These files run to hundreds of megabytes; `DOMParser` on the whole thing will kill the tab. Sessions are split on gaps over 3 hours, labelled by wake date, and anything under 60 minutes is discarded as a nap.

## Still worth building

- Multi-arm trials (3+ sounds) with a correction for multiple comparisons. Deliberately not shipped: the nights required scale badly and the stats get easy to misuse.
- Carry-over / washout handling if anyone runs A-then-B in blocks rather than randomised.
- Aggregate opt-in stats across users would be genuinely valuable research — and would require a server, an ethics conversation, and giving up "nothing leaves the device". Probably don't.

---

# v4 — the library, the guide, and generated instruments

Read `RESEARCH-2.md` first. It contains the finding that should reshape the marketing.

## The centre of gravity moved from noise to music

Cochrane 2015: music improves sleep quality in insomnia by about one standard deviation, **moderate-quality** evidence. The noise literature is graded **very low**. The app was built around the weaker of the two. Night music is now the best-evidenced thing in it, and it is built to the specification the trials converge on: 60–80 bpm, one instrument, soft, simple, 30–45 minutes. **The tempo slider is deliberately clamped to 60–80 — do not widen it without changing the copy that cites the research.**

## The mechanism is conditioning, and that changes the advice

The raga Neelambari was tested against a control raga with polysomnography and showed **no difference**. The authors attributed its reputation to a conditioned response, because South Indian lullabies are sung in it. So the honest advice is *pick one sound and stay with it for two weeks* — which is the opposite of what a big library implies. Every competitor's retention depends on browsing. Ours should not.

## Voices: additive synthesis, no audio files

`strike()`, `droplet()` and `transient()` are the whole instrument layer — a few sine partials with exponential decays, plus a two-tap delay for a tail. That keeps the app one file with no assets, which is why it works offline.

Schedulers run on the existing 200 ms tick and queue events ahead on the audio clock. Each voice has its own character in the timing, and the timing is the point:

- **suikinkutsu** — droplet chirp, then bell partials on hirajoshi. Irregular 1–6 s.
- **furin** — strikes clustered by a two-rate gust function. Evenly spaced chimes sound like a machine.
- **shishi** — one knock every 16–60 s and silence between. Do not "improve" this by making it more frequent; the sparseness is the feature.
- **rin** — one bowl, 11–18 s decay, long gaps.
- **night** — generative, φ-free, deliberately dull: one note every 2–4 beats, mostly stepwise motion, drone every 8 bars.

Scale tables verified to produce rising, in-range pitches. Bhairavi and Yaman are 12-tone approximations of ragas and the copy says so.

## The library is labelled by how much to believe it

22 sounds, all documented, 1,186 words. Tiers: 2 good evidence, 14 some, 4 traditional-untested, 2 no-evidence-just-pleasant. **Golden field is deliberately in the bottom tier.** If everything were labelled well-evidenced the labels would carry no information, so an audit test asserts that no more than three sounds may claim good evidence. Keep that test.

## Guide

Two questions, 40 routes, every route asserted to resolve to a real and documented sound. Testing caught three genuine breaks: a recommendation pointing at `brown`, which was written about but had never existed as a playable preset, and two recommendations with no info card. Ends in exactly two suggestions — Morphée's reviewers named "almost too much choice" as its flaw, and that is the failure mode to avoid.

## Next

- Promote "pick one and stick with it" to the opening screen.
- More voices are cheap now that the additive layer exists: fire, rain on tin, distant train, gamelan bells.
- **Get the Japanese copy read by someone who grew up with these sounds before this ships publicly.**

---

# v5 — simple mode

## The problem was ours, not the category's

Measured before touching anything: **91 distinct controls, 16 panels, 26 sliders, 12 switches, and 31 sounds across three rails on the first screen.** Four versions of adding capability with no pass at removing any. The Morphée "too much choice" criticism was one reviewer on one device — it was never the category's main complaint, which is ads and interruption. But it described us exactly.

## Simple mode is now the default

**12 visible controls, 0 panels, 1 recommendation. An 87% reduction.** One tap from opening the app to sound playing, for both a returning and a first-time user.

The front door is a single card: one sound, one sentence on why, one Play button. Under it, `Something else` opens a shortlist of **six**, not thirty-one. Then four timer buttons. Then two text links — all the controls, and safety & evidence.

`Everything` in the header restores the full app unchanged. Nothing was deleted; `body.simple` hides it with CSS and `S.mode` persists.

## The recommendation is deliberately not clever

It hands you back the sound you used last night, for up to three weeks, and tells you the count once you pass five nights. That is the Neelambari conditioning finding turned into a default: the association does most of the work, so the most useful thing the app can do is make repetition the path of least resistance.

Only when there is no history does it fall back to time of day — verified that all 24 hours resolve to a real, documented sound. `rememberUsed()` counts distinct days, not plays, so leaving it running does not inflate the streak.

## Rules for anyone extending this

- **New features go in full mode.** Simple mode's control count is the product, and there is a test asserting it. If simple mode grows past about fifteen controls, the feature belongs somewhere else.
- The shortlist stays at six and keeps a spread of evidence tiers — currently t1, t2, t2, t3, t2, t1. Not six flattering ones.
- Every shortlist entry must have an info card. Tested.

## Cultural copy

An in-app notice now states plainly that the descriptions were written from published sources by someone outside the traditions involved, and invites corrections. That is the defensible position to ship from and it does not depend on finding a reviewer first.
