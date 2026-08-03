# PADLAB — Build Plan (the MPK Mini app)

> Written 2026-08-03. Stephen's brief: an app he and his daughter can play keys
> on the go with, that can also sample, cut up samples, play beats and pads —
> **better than anything that's out for the MPK Mini** and **connected to all
> kinds of sounds**. This doc is the plan. HANDOFF-7 (in `padlab/HANDOFF.md`)
> is the engineering map of what already exists.

---

## Where it stands today

PadLab v3 arrived from Claude Chat working and feature-complete: 10 grooves +
16-step sequencer + 4 pattern slots + song mode, 8 velocity pads with roll,
scale-locked keys with chords + arpeggiator, mic/file sampling with trim +
chop-to-pads, reverb/delay/tone FX, jam recording, project export, IndexedDB
autosave, PWA + offline, MIDI auto-connect with pad remap.

It lives at `padlab/` in this repo → deploys to `lucidwinds.com/padlab/`.
One source of truth: `padlab/index.html`. The Drive copies are upstream
history, not siblings.

## Why "best MPK Mini app" is winnable

What exists for this hardware: **MPC Beats** (free but a full desktop DAW —
the opposite of pick-up-and-play, and famously confusing), **GarageBand**
(fine, but generic — knows nothing about the MPK, Apple-only), and web toys
(Chrome Music Lab etc. — no MIDI depth, no sampling). Nobody has built
*zero-install, kid-first, MPK-aware groovebox with real sampling*. That slot
is empty. The bar for every feature stays the handoff's line: **can a child
press this and have it sound good?** Depth goes behind sheets, never on the
main surface.

---

## Phase 0 — Land, harden, deploy (today)

1. `padlab/` committed: `index.html`, `sw.js`, `manifest.webmanifest` + icons
   (manifest/icons were missing from the Drive folder — recreated here).
2. **Service worker brought under the host caching law** before it ever
   touches lucidwinds.com (this host edge-pins bare `sw.js` for 7 days and
   rewrites Cache-Control; our origin already runs a fleet of workers):
   - registration URL versioned (`sw.js?v=N`), bumped in lockstep with the
     worker's cache name, re-registered unconditionally
   - every fetch-handler path settles with a real Response — no
     `respondWith(undefined)`, no hung fetch left pending
   - cache cleanup filtered to the `padlab-` prefix ONLY (`caches.keys()` is
     origin-wide; unfiltered cleanup would delete the main app's caches)
   - navigations refetched with `cache:'no-cache'`
3. Syntax gates (extract script block, `node --check`), puppeteer smoke test
   (boot past splash, groove starts, step cursor moves, zero console errors),
   **screenshots at phone viewport, actually looked at**.
4. Deploy = push, then verify live bytes with `?probe=$RANDOM` before
   trusting any versioned key.

## Phase 1 — The instrument feels pro (one change per commit, in order)

These are the handoff's own top roadmap items, re-ordered for what Stephen
and his daughter will feel first:

1. **Pad bank B → 16 pads.** The MPK's BANK button already sends different
   notes; the app should answer. Also makes 16-slice chopping real (slices
   9–16 are currently computed and thrown away).
2. **Record your jam INTO the sequencer.** Arm-record, live pad hits written
   to the current pattern quantized to 16ths. This is the moment a kid's
   banging becomes "I made a beat."
3. **WAV export** via `OfflineAudioContext` — takes that drop straight into a
   real DAW (and later into the studio shelf).
4. **Pitch bend for sampled instruments** (currently synths only) — the MPK
   joystick should always do something.
5. **Per-pattern length** (1–4 bars) and **undo** for pattern edits.

Regression traps are documented in the handoff §8 (clock conditions, uiQ,
the collectState/applyStateVars/refreshAllUI trio). Every item above touches
at least one of them — the checklist runs every time.

## Phase 2 — Connected to all kinds of sounds

Three lanes, cheapest first:

1. **More verified free instruments.** The CDN library the app already uses
   has more than the 12 wired instruments. Verified live 2026-08-03:
   french-horn, trombone, tuba, bassoon, contrabass, harmonium all serve
   200s. Rule from the handoff stands: verify every anchor note with curl
   before wiring — a 404'd anchor silently shrinks an instrument's range
   (`bass-electric` and `clarinet` are known-dead, do not add).
2. **A sound browser ("Sound Shop") behind a sheet.** Categories (Keys /
   Strings / Brass / Wind / Drums / Percussion / Yours), preview on tap,
   "keep offline" per pack. The main screen stays exactly as simple as now.
3. **First-party Sky Wolf packs — the differentiator.** Stephen is a
   producer with a studio. His own one-shot kits (drums, bass hits, vox
   chops) go in `padlab/packs/<pack>/` as small mp3/wav files served from
   our own host — no third-party CDN risk, offline-cacheable, and no other
   MPK app on Earth has them. Format: a tiny `pack.json` manifest + files;
   the app treats them exactly like the CDN drum packs.
   - This is also the long-term insurance: any CDN pack that matters gets
     mirrored into `padlab/packs/` over time so the app's sound never
     depends on someone else's GitHub repo staying up.
4. *(Later, only if wanted)* Freesound API for a curated, kid-safe search.
   Needs an API key and moderation care — parked until the above are live.

## Phase 3 — Music that leaves the app

1. **Share-a-jam**: project JSON compressed into a URL fragment — daughter
   sends her beat to grandma as a link that just plays.
2. **Studio bridge**: exported WAV loops/jams surfaced on the portal music
   shelf (`music-tracks.js` is a plain manifest; a "Made in PadLab" category
   is one entry per track). PadLab stays standalone; the bridge is one-way.
3. Song-mode arrangement editing if the family actually uses song mode.

## Deliberately out of scope (inherited, still right)

A DAW-grade sequencer, mixer view, automation lanes. The first version of
this app was a dense producer surface and was rejected for it. New depth goes
behind a sheet or a toggle. The main screen is grooves, pads, keys.

## What Stephen can connect (answer to the Blender/Meshy question)

Nothing. This app needs **zero 3D or art tooling** — it's UI + Web Audio, and
every sound source in phases 0–2 is free, keyless, and already verified. The
two genuinely useful things only Stephen can provide, whenever he feels like
it, neither blocking:

1. **His own sample packs** (Phase 2.3) — WAV/mp3 one-shots dropped in Drive
   or the repo; I do the rest.
2. **A 10-minute phone test with the real MPK plugged in** (USB-C, Chrome on
   Android) after Phase 0 deploys — Web MIDI is the one thing headless
   testing cannot prove.

## Technical ground rules

- Single self-contained HTML file, no build step, no framework — the "open
  it and it plays" property is the product. (The LW ES5 rule does NOT apply
  here; PadLab is standalone and stays modern JS.)
- No localStorage (IndexedDB only), no accounts, no analytics on the child's
  playing, nothing leaves the device except CDN sample fetches.
- Every network path falls back to something that still makes sound.
- Dense formatting is intentional; match it, never reformat wholesale.
- Test checklist in `padlab/HANDOFF.md` §8 runs before any ship; SW changes
  additionally run through a vm-driven worker harness (the black-screen
  lesson: drive the worker, don't just read it).
