# BUILD PLAN — HUSH (project 3 of 3) — v2, implementation level

**For the Opus build session. Reading order: this file → `HANDOFF-15.md`
(v1-v5 history, all engine invariants) → `RESEARCH-1.md` (positioning —
load-bearing) → `RESEARCH-2-1.md` (music evidence) → `../PORTAL-CONTRACT.md`.**
Planned 2026-08-16 (deepened same night); decisions are LOCKED defaults.

## What this is

A free, evidence-honest sleep-sound PWA. Five versions deep and essentially
feature-complete (see HANDOFF-15). **The positioning is the product:** "the
noise app that tells you when not to use noise" (Basner, SLEEP 2026). Every
program fades to silence; the evidence panel argues against the category from
inside the app; simple mode (12 controls) is the default. Honest labelling
beats feature count in every decision.

## Audited facts (verified against the drop 2026-08-16)

- `index-51.html` (2844 lines) + `sw.js`. `const S = {…}` at 661: ~40 keys
  across noise/tune/comb/pulse/slow-wave/tones/timer/mic/wake/volume/voice.
- Load path (675) force-resets `timer, micOn, adapt, program` — sessions are
  never restored, only sounds. Mirror this discipline in share-a-preset.
- `Store` shim: localStorage with in-memory fallback. KEEP (handoff law).
- Evidence tiers live in an info map (~1909): `tier:1..4` + `from` + copy.
- **The audit tests referenced throughout HANDOFF-15 did NOT ship in the
  drop** (zero matches for assert/test in the file). They lived in the
  artifact environment. Phase B rebuilds them — the invariants are all
  stated precisely enough to re-derive.
- `vbpm: 50` default vs the handoff's "tempo clamped 60-80" — probably a
  0-100 slider position mapped into 60-80, but VERIFY the mapping before
  trusting the clamp claim; if the clamp is missing, add it (the research
  copy cites it).

## 🚨 Fleet landmines (fix BEFORE first deploy)

1. **`sw.js` nukes the whole origin.** Its activate handler deletes every
   cache ≠ `hush-v1`; `caches.keys()` is ORIGIN-WIDE (this exact bug already
   black-screened our fleet once). On lucidwinds.com it would destroy
   PadLab's and every satellite's caches. Fix:
   ```js
   keys.filter(k => k.startsWith("hush-") && k !== CACHE)
   ```
   and rename the cache `hush-shell-v1` for clarity. Also update ASSETS to
   the real deployed paths after the rename (below).
2. **PWA identity.** Runtime blob manifest with `start_url:"."` and no
   `id`/`scope` collides with other lucidwinds PWAs. Ship a real
   `manifest.webmanifest` with `id`, `start_url`, `scope` all `/hush/`
   (PadLab pattern); keep the blob manifest as fallback only. Real icons
   (192/512/maskable) generated from the app's inline SVG icon.

## Locked decisions

1. **Deploys to `lucidwinds.com/hush/`** — top-level like `/padlab/`, NOT
   Firebase (the handoff's deploy section predates our stack; Hostinger
   auto-deploys from main). Rename `index-51.html` → `index.html`.
2. **Portal: Free Apps shelf ONLY — direct link, NO iframe, NO embed
   protocol** (locked shelf rule in PORTAL-CONTRACT.md; this supersedes the
   v1 plan's "sws:ready if framed"). App-card markup at portal ~581:
   ```html
   <a class="app-card" href="/hush/">
     <span class="med">🌙</span>
     <span><b>Hush</b><br><small>A free sleep sound machine that is honest
     about the science. Settles the room, then lets it go quiet. No ads,
     no account, works offline.</small></span>
   </a>
   ```
3. **No earn wiring, no toasts, no gamification, ever.** A 2 a.m. app never
   interrupts itself — ads-waking-the-baby is the category's #1 complaint
   and our whole opening.
4. **Engine invariants are law** (all measured, none negotiable):
   comb `k/f` above the 375 Hz render-quantum floor · 10 s buffers with the
   60 ms equal-power seam crossfade · relative volume ring · nursery cap
   0.34 default ON · every program reaches zero · mic analyser never
   connects toward the destination · Schade numbers = the citation (change
   them and the copy together) · simple mode ≤ ~15 controls · shortlist
   stays 6 with mixed tiers · ≤3 sounds may claim good evidence.
5. **Share-a-preset spec** (v6a — "the whole growth loop"):
   - WHITELIST encode, never whole-`S`. Shareable keys are the
     sound-defining ones only: `noise tilt freq tuneMode amt q phiStack mix
     rate depth fb combLock phiDrift pulse prate pamt swOn swrate swblock
     swlvl beatBand carrier beat tlvl iso voice vlvl vdens vbpm vscale
     preset`. NEVER shared: `vol`, `cap`, `timer`, `fade`, `micOn`, `adapt`,
     `cal`, `sens`, `lift`, `wake*`, `okWake`, `sunrise`, `mode`, `blinded`,
     `lastUsed`, `vizMode`. A link must not be able to disable the nursery
     cap, set a volume, turn on the mic, or flip someone out of simple mode.
   - Format: `#p=<base64url(JSON of whitelisted diffs from defaults)>`.
     Decode on load inside try/catch; junk fragment → ignore silently;
     unknown keys dropped; every value clamped through the same setters the
     UI uses (never raw-assigned). Show a small "shared sound loaded" line
     with the sound's name + its evidence tier — honesty travels with the
     link. Add a "Share this sound" action in full mode (navigator.share
     with clipboard fallback).
6. **v6 build order after share:** (b) front door promotes the conditioning
   finding — one line under the recommendation card: "The best evidence
   says: pick one sound and stay with it. This is night N with this sound"
   (verify what v5's `rememberUsed()` already surfaces first; wire into it,
   don't duplicate). (c) Earplug note in adult-facing copy: "For adults,
   the strongest 2026 study found simple foam earplugs beat pink noise."
   (d) dB-meter calibration flow (play a known tone, match against any
   reference, store offset in `cal`). Defer: multi-child profiles, new
   voices, multi-arm trials (deliberately unshipped — respect that call).
7. **Stephen action items (not code):** Japanese instrument copy
   (suikinkutsu/furin/shishi/rin) read by a native before any press push —
   the in-app cultural notice is the shipping posture until then. Press
   angles ranked in RESEARCH-1 §6 are the outreach lane (warm, dad angle,
   zero dashes).

## Phase B — the audit harness (`scripts/hush_audit.js`), rebuilt

The tests did not ship; rebuild them from the stated invariants. Node +
headless Chrome against the REAL file (rarity_sim_live lesson: never
hand-mirror engine logic into a test). Assertions, each with a
deliberate-failure check the first time it runs:

1. **Programs**: simulate every entry in `PROGRAMS` through the real ramp
   logic at 30 s resolution — gain stays in [0,1], no step > 0.35, final
   value is exactly 0. (Handoff v2 numbers.)
2. **Slow-wave constants**: assert 0.8 Hz period (1.25 s), 50 ms bursts,
   5 ms ramps, 10 s on/off blocks wherever they are defined — these ARE the
   citation.
3. **Comb floor**: for f in {55, 110, 375, 440, 1000, 3520}: chosen
   delayTime ≥ 128/sampleRate AND delayTime × f is an integer (the k-th
   harmonic lands on f).
4. **Evidence cap**: count of `tier:1` entries in the info map ≤ 3.
5. **Guide**: every route resolves to a sound that (a) is playable and
   (b) has an info card; the time-of-day fallback resolves for all 24 hours.
6. **Simple mode**: control count on the simple front door ≤ 15
   (headless DOM query of visible interactive elements under body.simple).
7. **Shortlist**: exactly 6 entries, ≥3 distinct tiers, each with an info
   card.
8. **Stats**: seeded permutation test returns the SAME p twice in a row;
   t-CDF spot checks against textbook critical values (e.g. df=1e7,
   t=1.96 → ~0.975); two identical arms through the full verdict rule,
   200 seeds → false-positive rate under ~10%.
9. **Importers**: empty string, binary junk, truncated CSV, and a
   malformed XML never throw; a tiny synthetic fixture per shape (Oura,
   Fitbit CSV, Fitbit JSON, Garmin, Withings, Samsung) parses with the
   whole-file median unit inference landing in sane ranges (a 7.5 h night
   stays 6-9 h whether the file was in seconds, minutes, or hours).
10. **Share round-trip** (after v6a): encode → decode in a fresh context →
    whitelisted keys equal, `cap` still true, `vol` untouched, junk
    fragment inert.

## Build phases (gate each; commit AND push at every gate)

- **A — Land it safely.** `/hush/` folder, rename, sw.js origin fix + cache
  rename, real manifest + icons, Free Apps card. Gate: live at
  `lucidwinds.com/hush/?probe=RANDOM`; installs with its own identity;
  PadLab caches VERIFIED intact after visiting Hush (`caches.keys()`
  before/after); airplane-mode revisit works; `node --check` clean.
- **B — Audit harness** as specced above. Gate: every assertion class
  watched RED once (deliberate break, revert), then green on HEAD.
- **C — v6a share-a-preset** per decision 5. Gate: audit #10 green; share →
  private window → identical sound; capped volume respected; junk inert.
- **D — v6 b-d** per decision 6. Gate: audits #4-7 still green (the control
  count is the one this phase most easily breaks).
- **E — LOOKING gate.** Phone screenshots at 375×667 + desktop: simple
  front door, shortlist, densest full-mode panel, all five visualizer modes
  (verify the Void 4 fps claim with the devtools FPS meter), ok-to-wake
  screen, sunrise ramp. Name three flaws before Stephen does. 48px rendered
  touch targets — a 2 a.m. one-thumb app; misses are worse here than
  anywhere. Copy audit: no dashes in player-facing text (fix quietly during
  the port).

## Traps

- The mic is analysis-only BY DESIGN — any refactor that routes it near the
  destination is wrong even if inaudible (it is also the privacy story).
- Frame caps (30 fps, 4 fps Void) are battery engineering — keep.
- `wakeDate()` rolls +12 h — read it before touching.
- Apple Health export.xml streams in 4 MB slices, 4 KB overlap — never
  DOMParse the whole file.
- Importer unit inference is per-FILE median, never per-value (regression
  history, handoff v3).
- Session keys reset on load (line 675) — keep that exact list intact when
  adding state.
- `Store` shim stays; never bare localStorage (handoff law).
